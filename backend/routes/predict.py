"""
SentinelEdu - Prediction Endpoints
POST /api/predict - Single student prediction
POST /api/predict/batch - Batch predictions
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
from datetime import datetime

router = APIRouter()


class StudentFeatures(BaseModel):
    """Input features for prediction."""
    student_id: Optional[str] = None
    age_at_enrollment: int = Field(..., ge=17, le=70, description="Age at enrollment")
    gender: int = Field(..., ge=0, le=1, description="0=Male, 1=Female")
    international: int = Field(0, ge=0, le=1)
    displaced: int = Field(0, ge=0, le=1)
    scholarship_holder: int = Field(0, ge=0, le=1)
    tuition_fees_up_to_date: int = Field(1, ge=0, le=1)
    debtor: int = Field(0, ge=0, le=1)
    admission_grade: float = Field(..., ge=95, le=200)
    previous_qualification_grade: float = Field(..., ge=95, le=200)
    curricular_units_1st_sem_credited: int = Field(0, ge=0)
    curricular_units_1st_sem_enrolled: int = Field(..., ge=0, le=26)
    curricular_units_1st_sem_evaluations: int = Field(..., ge=0)
    curricular_units_1st_sem_approved: int = Field(..., ge=0)
    curricular_units_1st_sem_grade: float = Field(0.0, ge=0, le=20)
    curricular_units_1st_sem_without_evaluations: int = Field(0, ge=0)
    curricular_units_2nd_sem_credited: int = Field(0, ge=0)
    curricular_units_2nd_sem_enrolled: int = Field(..., ge=0, le=26)
    curricular_units_2nd_sem_evaluations: int = Field(..., ge=0)
    curricular_units_2nd_sem_approved: int = Field(..., ge=0)
    curricular_units_2nd_sem_grade: float = Field(0.0, ge=0, le=20)
    curricular_units_2nd_sem_without_evaluations: int = Field(0, ge=0)
    unemployment_rate: float = Field(10.8, ge=0, le=25)
    inflation_rate: float = Field(1.4, ge=-5, le=20)
    gdp: float = Field(1.74, ge=-10, le=10)


class PredictionResponse(BaseModel):
    student_id: str
    prediction: str
    risk_score: float
    alert_level: str
    is_critical: bool
    probabilities: dict
    top_risk_factors: list
    success_pathway: list
    timestamp: str


def generate_success_pathway(prediction_result: dict, features: dict) -> list:
    """Generate AI-powered intervention recommendations."""
    pathways = []
    risk_factors = prediction_result.get('top_risk_factors', [])
    risk_score = prediction_result.get('risk_score', 0)
    
    factor_labels = [f['feature'] for f in risk_factors]
    
    if 'tuition_fees_up_to_date' in factor_labels or features.get('tuition_fees_up_to_date', 1) == 0:
        pathways.append({
            'priority': 'high',
            'category': 'Financial Support',
            'action': 'Connect with Financial Aid Office',
            'detail': 'Student has outstanding tuition. Explore emergency grants, payment plans, or work-study programs.',
            'icon': 'dollar'
        })
    
    if features.get('curricular_units_1st_sem_approved', 10) < features.get('curricular_units_1st_sem_enrolled', 6) * 0.5:
        pathways.append({
            'priority': 'high',
            'category': 'Academic Intervention',
            'action': 'Schedule Academic Coaching Sessions',
            'detail': 'Low unit approval rate detected. Recommend weekly tutoring and study skills workshop.',
            'icon': 'book'
        })
    
    if features.get('curricular_units_1st_sem_grade', 13) < 11 or features.get('curricular_units_2nd_sem_grade', 13) < 11:
        pathways.append({
            'priority': 'medium',
            'category': 'Academic Support',
            'action': 'Enroll in Peer Tutoring Program',
            'detail': 'GPA below threshold. Connect with peer tutors in core subject areas.',
            'icon': 'users'
        })
    
    if features.get('debtor', 0) == 1:
        pathways.append({
            'priority': 'high',
            'category': 'Financial Counseling',
            'action': 'Financial Counseling Session',
            'detail': 'Outstanding debt identified. Meet with financial counselor to create a repayment roadmap.',
            'icon': 'chart'
        })
    
    if features.get('displaced', 0) == 1:
        pathways.append({
            'priority': 'medium',
            'category': 'Student Welfare',
            'action': 'Housing & Wellbeing Check-In',
            'detail': 'Student classified as displaced. Connect with student services for housing and food security support.',
            'icon': 'home'
        })
    
    if risk_score >= 0.6:
        pathways.append({
            'priority': 'high',
            'category': 'Counseling',
            'action': 'Assign Dedicated Academic Counselor',
            'detail': 'High dropout risk. Student should be assigned a dedicated mentor for bi-weekly check-ins.',
            'icon': 'heart'
        })
    
    # Always include a positive engagement pathway
    if len(pathways) < 3:
        pathways.append({
            'priority': 'low',
            'category': 'Engagement',
            'action': 'Invite to Student Success Workshop',
            'detail': 'Proactive engagement: invite student to career development and campus community events.',
            'icon': 'star'
        })
    
    return pathways[:5]


@router.post("/predict", response_model=PredictionResponse)
async def predict_single(request: Request, student: StudentFeatures):
    """
    Predict dropout risk for a single student.
    Returns risk score, alert level, top SHAP risk factors, and intervention pathways.
    """
    loader = request.app.state.model_loader
    if loader is None or not loader.is_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first: cd engine && python train_model.py"
        )
    
    features = student.model_dump(exclude={'student_id'})
    
    try:
        result = loader.predict(features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    
    student_id = student.student_id or f"STU{str(uuid.uuid4())[:8].upper()}"
    pathways = generate_success_pathway(result, features)
    
    return PredictionResponse(
        student_id=student_id,
        prediction=result['prediction'],
        risk_score=result['risk_score'],
        alert_level=result['alert_level'],
        is_critical=result['is_critical'],
        probabilities=result['probabilities'],
        top_risk_factors=result['top_risk_factors'],
        success_pathway=pathways,
        timestamp=datetime.utcnow().isoformat()
    )


@router.post("/predict/batch")
async def predict_batch(request: Request, students: List[StudentFeatures]):
    """Batch prediction for multiple students."""
    if len(students) > 100:
        raise HTTPException(status_code=400, detail="Batch size limited to 100 students")
    
    loader = request.app.state.model_loader
    if loader is None or not loader.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    results = []
    for student in students:
        features = student.model_dump(exclude={'student_id'})
        try:
            result = loader.predict(features)
            student_id = student.student_id or f"STU{str(uuid.uuid4())[:8].upper()}"
            results.append({
                'student_id': student_id,
                **result,
                'timestamp': datetime.utcnow().isoformat()
            })
        except Exception as e:
            results.append({'student_id': student.student_id, 'error': str(e)})
    
    critical_count = sum(1 for r in results if r.get('is_critical', False))
    
    return {
        'total': len(results),
        'critical_count': critical_count,
        'results': results
    }
