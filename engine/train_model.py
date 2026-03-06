"""
SentinelEdu - ML Model Training Pipeline
Trains ensemble classifier and saves model + SHAP explainer
"""
import numpy as np
import pandas as pd
import joblib
import json
import shap
import warnings
warnings.filterwarnings('ignore')

from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.pipeline import Pipeline

try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False
    print("⚠️  XGBoost not installed. Using GradientBoosting instead.")

# Feature columns used for training
FEATURE_COLUMNS = [
    'age_at_enrollment', 'gender', 'international', 'displaced',
    'scholarship_holder', 'tuition_fees_up_to_date', 'debtor',
    'admission_grade', 'previous_qualification_grade',
    'curricular_units_1st_sem_credited', 'curricular_units_1st_sem_enrolled',
    'curricular_units_1st_sem_evaluations', 'curricular_units_1st_sem_approved',
    'curricular_units_1st_sem_grade', 'curricular_units_1st_sem_without_evaluations',
    'curricular_units_2nd_sem_credited', 'curricular_units_2nd_sem_enrolled',
    'curricular_units_2nd_sem_evaluations', 'curricular_units_2nd_sem_approved',
    'curricular_units_2nd_sem_grade', 'curricular_units_2nd_sem_without_evaluations',
    'unemployment_rate', 'inflation_rate', 'gdp'
]

FEATURE_LABELS = {
    'age_at_enrollment': 'Age at Enrollment',
    'gender': 'Gender',
    'international': 'International Student',
    'displaced': 'Displaced Student',
    'scholarship_holder': 'Scholarship Holder',
    'tuition_fees_up_to_date': 'Tuition Fees Up-to-Date',
    'debtor': 'Outstanding Debt',
    'admission_grade': 'Admission Grade',
    'previous_qualification_grade': 'Previous Qualification Grade',
    'curricular_units_1st_sem_credited': '1st Sem Credited Units',
    'curricular_units_1st_sem_enrolled': '1st Sem Enrolled Units',
    'curricular_units_1st_sem_evaluations': '1st Sem Evaluations',
    'curricular_units_1st_sem_approved': '1st Sem Approved Units',
    'curricular_units_1st_sem_grade': '1st Sem GPA',
    'curricular_units_1st_sem_without_evaluations': '1st Sem Missed Evaluations',
    'curricular_units_2nd_sem_credited': '2nd Sem Credited Units',
    'curricular_units_2nd_sem_enrolled': '2nd Sem Enrolled Units',
    'curricular_units_2nd_sem_evaluations': '2nd Sem Evaluations',
    'curricular_units_2nd_sem_approved': '2nd Sem Approved Units',
    'curricular_units_2nd_sem_grade': '2nd Sem GPA',
    'curricular_units_2nd_sem_without_evaluations': '2nd Sem Missed Evaluations',
    'unemployment_rate': 'Unemployment Rate',
    'inflation_rate': 'Inflation Rate',
    'gdp': 'GDP Growth'
}


def load_or_generate_data(data_path: str) -> pd.DataFrame:
    """Load dataset or generate synthetic data if not found."""
    path = Path(data_path)
    if path.exists():
        print(f"📂 Loading dataset from {path}")
        df = pd.read_csv(path)
        # Handle UCI dataset column name
        if 'Target' in df.columns:
            df = df.rename(columns={'Target': 'target'})
        return df
    else:
        print("🔄 Dataset not found. Generating synthetic data...")
        from generate_data import generate_synthetic_students
        path.parent.mkdir(exist_ok=True)
        df = generate_synthetic_students(2000)
        df.to_csv(path, index=False)
        print(f"💾 Synthetic data saved to {path}")
        return df


def preprocess_data(df: pd.DataFrame):
    """Clean and prepare data for training."""
    df = df.copy()
    
    # Map string targets to int labels
    le = LabelEncoder()
    target_map = {'Dropout': 0, 'Enrolled': 1, 'Graduate': 2}
    
    if df['target'].dtype == object:
        df['target_encoded'] = df['target'].map(target_map)
    else:
        df['target_encoded'] = df['target']
    
    df = df.dropna(subset=FEATURE_COLUMNS + ['target_encoded'])
    
    X = df[FEATURE_COLUMNS].copy()
    y = df['target_encoded'].astype(int)
    
    return X, y, le


def train_model(X_train, y_train):
    """Train ensemble model."""
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    
    if HAS_XGB:
        xgb = XGBClassifier(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            use_label_encoder=False,
            eval_metric='mlogloss',
            random_state=42
        )
        model = VotingClassifier(
            estimators=[('rf', rf), ('xgb', xgb)],
            voting='soft',
            weights=[1, 2]
        )
        print("🏋️  Training RF + XGBoost ensemble...")
    else:
        gb = GradientBoostingClassifier(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            random_state=42
        )
        model = VotingClassifier(
            estimators=[('rf', rf), ('gb', gb)],
            voting='soft',
            weights=[1, 2]
        )
        print("🏋️  Training RF + GradientBoosting ensemble...")
    
    model.fit(X_train, y_train)
    return model


def compute_shap_explainer(model, X_train):
    """Build a SHAP TreeExplainer on the underlying RF."""
    # Use the RF component for SHAP (works best with TreeExplainer)
    if hasattr(model, 'estimators_'):
        rf_model = model.estimators_[0][1]  # First estimator
    else:
        rf_model = model
    
    explainer = shap.TreeExplainer(rf_model, X_train, model_output='probability')
    return explainer


def get_top_risk_factors(shap_values, feature_names: list, feature_labels: dict, 
                          top_n: int = 3, class_idx: int = 0) -> list:
    """
    Extract top N risk factors from SHAP values for the Dropout class.
    Returns list of {feature, label, impact, direction} dicts.
    """
    if isinstance(shap_values, list):
        sv = shap_values[class_idx]
    else:
        sv = shap_values
    
    if sv.ndim == 2:
        sv = sv[0]
    
    sorted_idx = np.argsort(np.abs(sv))[::-1][:top_n]
    
    risk_factors = []
    for idx in sorted_idx:
        feat = feature_names[idx]
        impact = float(sv[idx])
        risk_factors.append({
            'feature': feat,
            'label': feature_labels.get(feat, feat),
            'shap_impact': round(impact, 4),
            'direction': 'increases_risk' if impact > 0 else 'decreases_risk',
            'importance': round(abs(impact), 4)
        })
    
    return risk_factors


def evaluate_model(model, X_test, y_test):
    """Print evaluation metrics."""
    y_pred = model.predict(X_test)
    print("\n📊 Classification Report:")
    print(classification_report(y_test, y_pred, 
                                 target_names=['Dropout', 'Enrolled', 'Graduate']))
    
    cv_scores = cross_val_score(model, X_test, y_test, cv=3, scoring='accuracy')
    print(f"🎯 Cross-Val Accuracy: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
    return float(cv_scores.mean())


def main():
    engine_dir = Path(__file__).parent
    data_path = engine_dir / 'data' / 'students.csv'
    models_dir = engine_dir / 'models'
    models_dir.mkdir(exist_ok=True)
    
    # 1. Load data
    df = load_or_generate_data(str(data_path))
    print(f"✅ Dataset: {len(df)} records | Columns: {len(df.columns)}")
    
    # 2. Preprocess
    X, y, le = preprocess_data(df)
    print(f"📐 Features: {X.shape[1]} | Classes: {y.nunique()}")
    
    # 3. Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # 4. Train
    model = train_model(X_train, y_train)
    
    # 5. Evaluate
    accuracy = evaluate_model(model, X_test, y_test)
    
    # 6. SHAP Explainer (on RF component)
    print("\n🔍 Computing SHAP explainer...")
    try:
        explainer = compute_shap_explainer(model, X_train)
        # Test SHAP on a sample
        sample = X_test.iloc[:5]
        shap_vals = explainer.shap_values(sample)
        print("✅ SHAP explainer validated")
        joblib.dump(explainer, models_dir / 'shap_explainer.joblib')
    except Exception as e:
        print(f"⚠️  SHAP explainer failed: {e}. Predictions will use feature importance.")
        explainer = None
    
    # 7. Save artifacts
    joblib.dump(model, models_dir / 'sentinel_model.joblib')
    joblib.dump(X_train, models_dir / 'X_train_sample.joblib')
    
    # Save metadata
    metadata = {
        'feature_columns': FEATURE_COLUMNS,
        'feature_labels': FEATURE_LABELS,
        'target_classes': ['Dropout', 'Enrolled', 'Graduate'],
        'target_map': {'Dropout': 0, 'Enrolled': 1, 'Graduate': 2},
        'accuracy': accuracy,
        'n_train': len(X_train),
        'n_test': len(X_test)
    }
    with open(models_dir / 'metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\n🎉 Training complete!")
    print(f"💾 Model saved to {models_dir / 'sentinel_model.joblib'}")
    print(f"📊 Accuracy: {accuracy:.1%}")


if __name__ == '__main__':
    main()
