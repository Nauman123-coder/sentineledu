"""
SentinelEdu - Analytics Endpoints
GET /api/analytics/overview - Institutional health dashboard stats
"""
from fastapi import APIRouter
import random
import math

router = APIRouter()


def generate_trend_data(weeks: int = 12, base: float = 30.0, volatility: float = 3.0):
    """Generate trend data for charts."""
    data = []
    value = base
    rng = random.Random(42)
    for i in range(weeks):
        value += rng.uniform(-volatility, volatility)
        value = max(0, min(100, value))
        data.append(round(value, 1))
    return data


@router.get("/analytics/overview")
async def get_analytics_overview():
    """
    Institutional health overview.
    Returns KPIs, risk distribution, trend data, and at-risk program breakdown.
    """
    # Core KPIs
    total_students = 150
    critical_count = 18
    high_risk_count = 27
    medium_risk_count = 41
    low_risk_count = 64
    
    dropout_rate = round(critical_count / total_students * 100, 1)
    at_risk_rate = round((critical_count + high_risk_count) / total_students * 100, 1)
    institutional_health = round(100 - at_risk_rate * 0.8, 1)
    
    # Monthly trend (last 12 months)
    months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 
              'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
    
    rng = random.Random(42)
    dropout_trend = []
    base = 28
    for m in months:
        base += rng.uniform(-2, 2)
        dropout_trend.append({'month': m, 'rate': round(max(15, min(45, base)), 1)})
    
    at_risk_trend = []
    base2 = 30
    for m in months:
        base2 += rng.uniform(-2.5, 2.5)
        at_risk_trend.append({'month': m, 'rate': round(max(20, min(55, base2)), 1)})
    
    # Weekly attendance trend
    weeks = [f"W{i}" for i in range(1, 13)]
    attendance_trend = []
    att = 82
    for w in weeks:
        att += rng.uniform(-3, 3)
        attendance_trend.append({'week': w, 'rate': round(max(60, min(98, att)), 1)})
    
    # Risk by program
    programs = [
        {'program': 'Computer Science', 'total': 22, 'at_risk': 8, 'critical': 3},
        {'program': 'Business Admin', 'total': 25, 'at_risk': 9, 'critical': 4},
        {'program': 'Nursing', 'total': 18, 'at_risk': 4, 'critical': 1},
        {'program': 'Engineering', 'total': 20, 'at_risk': 7, 'critical': 2},
        {'program': 'Psychology', 'total': 15, 'at_risk': 6, 'critical': 3},
        {'program': 'Education', 'total': 14, 'at_risk': 3, 'critical': 1},
        {'program': 'Social Work', 'total': 12, 'at_risk': 5, 'critical': 2},
        {'program': 'Economics', 'total': 11, 'at_risk': 3, 'critical': 1},
        {'program': 'Biology', 'total': 13, 'at_risk': 4, 'critical': 1},
    ]
    for p in programs:
        p['at_risk_rate'] = round(p['at_risk'] / p['total'] * 100, 1)
    
    # Risk factor frequency
    top_risk_factors = [
        {'factor': 'Late Tuition Payment', 'frequency': 45, 'avg_impact': 0.31},
        {'factor': '1st Semester GPA Drop', 'frequency': 38, 'avg_impact': 0.27},
        {'factor': 'Low Unit Approval Rate', 'frequency': 34, 'avg_impact': 0.25},
        {'factor': 'Outstanding Debt', 'frequency': 29, 'avg_impact': 0.22},
        {'factor': 'Missed Evaluations', 'frequency': 24, 'avg_impact': 0.19},
        {'factor': 'Age Factor (30+)', 'frequency': 18, 'avg_impact': 0.14},
        {'factor': 'Low Admission Grade', 'frequency': 15, 'avg_impact': 0.12},
    ]
    
    # Demographic breakdown
    gender_split = {'male': 67, 'female': 83}
    scholarship_breakdown = {
        'scholarship_holders': 38,
        'non_scholarship': 112,
        'scholarship_at_risk_rate': 15.8,
        'non_scholarship_at_risk_rate': 32.1
    }
    
    return {
        'kpis': {
            'total_students': total_students,
            'critical_students': critical_count,
            'high_risk_students': high_risk_count,
            'medium_risk_students': medium_risk_count,
            'low_risk_students': low_risk_count,
            'dropout_rate_pct': dropout_rate,
            'at_risk_rate_pct': at_risk_rate,
            'institutional_health_score': institutional_health,
            'avg_gpa': 12.4,
            'avg_attendance_pct': 78.3,
            'intervention_success_rate': 67.2
        },
        'risk_distribution': [
            {'level': 'Critical', 'count': critical_count, 'color': '#ef4444'},
            {'level': 'High', 'count': high_risk_count, 'color': '#f97316'},
            {'level': 'Medium', 'count': medium_risk_count, 'color': '#eab308'},
            {'level': 'Low', 'count': low_risk_count, 'color': '#22c55e'},
        ],
        'dropout_trend': dropout_trend,
        'at_risk_trend': at_risk_trend,
        'attendance_trend': attendance_trend,
        'programs_at_risk': programs,
        'top_risk_factors': top_risk_factors,
        'demographics': {
            'gender': gender_split,
            'scholarship': scholarship_breakdown
        },
        'recent_alerts': [
            {'student_id': 'STU00003', 'name': 'Carlos Martinez', 'risk_score': 0.91, 'alert': 'Critical dropout risk detected', 'time': '2 hours ago'},
            {'student_id': 'STU00007', 'name': 'Priya Sharma', 'risk_score': 0.85, 'alert': 'Tuition overdue + low GPA', 'time': '4 hours ago'},
            {'student_id': 'STU00012', 'name': 'Wei Zhang', 'risk_score': 0.82, 'alert': 'Missed 3 consecutive evaluations', 'time': '6 hours ago'},
            {'student_id': 'STU00019', 'name': 'Fatima Hassan', 'risk_score': 0.81, 'alert': 'GPA dropped 30% this semester', 'time': '1 day ago'},
            {'student_id': 'STU00025', 'name': 'James Brown', 'risk_score': 0.80, 'alert': 'Outstanding debt flagged', 'time': '1 day ago'},
        ]
    }
