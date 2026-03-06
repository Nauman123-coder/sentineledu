"""
SentinelEdu - Model Loader Utility
Loads the trained ML model, SHAP explainer, and metadata
"""
import joblib
import json
import numpy as np
import shap
from pathlib import Path
from typing import Optional


class ModelLoader:
    """Singleton-like model loader for FastAPI."""
    
    def __init__(self):
        self.model = None
        self.explainer = None
        self.metadata = None
        self._loaded = False
        
        # Try to find model relative to this file or via common paths
        self._model_dir = self._find_model_dir()
    
    def _find_model_dir(self) -> Path:
        base = Path(__file__).parent.parent
        candidates = [
            base.parent / 'engine' / 'models',
            base / 'engine' / 'models',
            Path('/app/engine/models'),
        ]
        for p in candidates:
            if p.exists():
                return p
        return candidates[0]
    
    def load(self):
        """Load model artifacts."""
        model_path = self._model_dir / 'sentinel_model.joblib'
        meta_path = self._model_dir / 'metadata.json'
        explainer_path = self._model_dir / 'shap_explainer.joblib'
        
        if not model_path.exists():
            raise FileNotFoundError(
                f"Model not found at {model_path}. "
                "Run: cd engine && python train_model.py"
            )
        
        self.model = joblib.load(model_path)
        
        if meta_path.exists():
            with open(meta_path) as f:
                self.metadata = json.load(f)
        
        if explainer_path.exists():
            try:
                self.explainer = joblib.load(explainer_path)
            except Exception:
                self.explainer = None
        
        self._loaded = True
    
    @property
    def feature_columns(self) -> list:
        if self.metadata:
            return self.metadata.get('feature_columns', [])
        return []
    
    @property
    def feature_labels(self) -> dict:
        if self.metadata:
            return self.metadata.get('feature_labels', {})
        return {}
    
    @property
    def target_classes(self) -> list:
        if self.metadata:
            return self.metadata.get('target_classes', ['Dropout', 'Enrolled', 'Graduate'])
        return ['Dropout', 'Enrolled', 'Graduate']
    
    def predict(self, features: dict) -> dict:
        """
        Run prediction on a single student's features.
        Returns prediction, probabilities, risk score, and SHAP factors.
        """
        import pandas as pd
        
        # Build feature vector
        X = pd.DataFrame([features])[self.feature_columns]
        
        # Get probabilities
        proba = self.model.predict_proba(X)[0]
        pred_class = self.target_classes[int(np.argmax(proba))]
        
        # Dropout probability = risk score
        dropout_idx = self.target_classes.index('Dropout') if 'Dropout' in self.target_classes else 0
        risk_score = float(proba[dropout_idx])
        
        # Alert threshold
        alert_level = self._compute_alert_level(risk_score)
        
        # SHAP risk factors
        risk_factors = self._get_shap_factors(X, dropout_idx)
        
        return {
            'prediction': pred_class,
            'risk_score': round(risk_score, 4),
            'probabilities': {
                cls: round(float(p), 4) 
                for cls, p in zip(self.target_classes, proba)
            },
            'alert_level': alert_level,
            'is_critical': risk_score >= 0.80,
            'top_risk_factors': risk_factors
        }
    
    def _compute_alert_level(self, risk_score: float) -> str:
        if risk_score >= 0.80:
            return 'critical'
        elif risk_score >= 0.60:
            return 'high'
        elif risk_score >= 0.40:
            return 'medium'
        else:
            return 'low'
    
    def _get_shap_factors(self, X, dropout_class_idx: int) -> list:
        """Get top 3 SHAP risk factors."""
        factors = []
        
        if self.explainer is not None:
            try:
                shap_values = self.explainer.shap_values(X)
                
                if isinstance(shap_values, list):
                    sv = shap_values[dropout_class_idx][0]
                elif shap_values.ndim == 3:
                    sv = shap_values[0, :, dropout_class_idx]
                else:
                    sv = shap_values[0]
                
                top_indices = np.argsort(np.abs(sv))[::-1][:3]
                
                for idx in top_indices:
                    feat = self.feature_columns[idx]
                    impact = float(sv[idx])
                    factors.append({
                        'feature': feat,
                        'label': self.feature_labels.get(feat, feat),
                        'impact': round(impact, 4),
                        'direction': 'risk' if impact > 0 else 'protective',
                        'importance': round(abs(impact), 4)
                    })
                return factors
            except Exception as e:
                pass
        
        # Fallback: use feature importances from RF
        try:
            if hasattr(self.model, 'estimators_'):
                rf = self.model.estimators_[0][1]
                if hasattr(rf, 'feature_importances_'):
                    importances = rf.feature_importances_
                    top_indices = np.argsort(importances)[::-1][:3]
                    for idx in top_indices:
                        feat = self.feature_columns[idx]
                        factors.append({
                            'feature': feat,
                            'label': self.feature_labels.get(feat, feat),
                            'impact': round(float(importances[idx]), 4),
                            'direction': 'risk',
                            'importance': round(float(importances[idx]), 4)
                        })
        except Exception:
            pass
        
        return factors
    
    def is_loaded(self) -> bool:
        return self._loaded
