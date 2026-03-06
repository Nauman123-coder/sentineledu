"""
SentinelEdu - Students Endpoints
GET /api/students - List students with risk scores
GET /api/students/{id} - Single student detail
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
import random
import hashlib

router = APIRouter()

# Seeded student names for realistic mock data
FIRST_NAMES = [
    "Ahmed", "Fatima", "Muhammad", "Aisha", "Omar", "Zara", "Ali", "Layla",
    "Hassan", "Nadia", "Yusuf", "Sara", "Khalid", "Mona", "Ibrahim", "Hana",
    "James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Isabella",
    "Raj", "Priya", "Arjun", "Ananya", "Chen", "Wei", "Jin", "Mei",
    "Carlos", "Maria", "Luis", "Sofia", "Pedro", "Ana", "Diego", "Camila"
]
LAST_NAMES = [
    "Khan", "Ali", "Hassan", "Ahmed", "Rahman", "Malik", "Sheikh", "Qureshi",
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Davis", "Miller",
    "Sharma", "Patel", "Kumar", "Singh", "Gupta", "Zhang", "Li", "Wang",
    "Garcia", "Rodriguez", "Martinez", "Lopez", "Gonzalez", "Hernandez"
]

PROGRAMS = [
    "Computer Science", "Business Administration", "Nursing", "Engineering",
    "Psychology", "Education", "Social Work", "Economics", "Biology", "Law",
    "Marketing", "Accounting", "Information Systems", "Chemistry", "Mathematics"
]


def seeded_student(student_id: str) -> dict:
    """Generate a deterministic student record from ID."""
    seed = int(hashlib.md5(student_id.encode()).hexdigest()[:8], 16)
    rng = random.Random(seed)
    
    age = rng.randint(18, 45)
    risk_score = round(rng.betavariate(1.5, 3.5), 4)
    
    gpa_1st = round(rng.uniform(8.5, 19.5), 1)
    gpa_2nd = round(gpa_1st + rng.uniform(-2.5, 2.5), 1)
    gpa_2nd = max(8.0, min(20.0, gpa_2nd))
    
    enrolled_1st = rng.randint(4, 8)
    approved_1st = rng.randint(max(0, enrolled_1st - 3), enrolled_1st)
    enrolled_2nd = rng.randint(4, 8)
    approved_2nd = rng.randint(max(0, enrolled_2nd - 3), enrolled_2nd)
    
    scholarship = rng.choice([True, False], )
    tuition_ok = rng.random() > (0.1 if scholarship else 0.25)
    debtor = not tuition_ok and rng.random() > 0.4
    
    alert_level = (
        'critical' if risk_score >= 0.80 else
        'high' if risk_score >= 0.60 else
        'medium' if risk_score >= 0.40 else
        'low'
    )
    
    first = rng.choice(FIRST_NAMES)
    last = rng.choice(LAST_NAMES)
    
    # Timeline data (8 weeks)
    timeline = []
    base_attendance = rng.uniform(55, 95)
    for week in range(1, 9):
        attendance = round(base_attendance + rng.uniform(-8, 8), 1)
        timeline.append({
            'week': week,
            'attendance': max(10, min(100, attendance)),
            'assignments_submitted': rng.randint(1, 4),
            'gpa_trend': round(gpa_1st + (gpa_2nd - gpa_1st) * (week / 8), 1)
        })
    
    risk_factors = []
    if not tuition_ok:
        risk_factors.append({'label': 'Late Tuition Payment', 'direction': 'risk', 'importance': 0.32})
    if approved_1st < enrolled_1st * 0.5:
        risk_factors.append({'label': 'Low Unit Approval Rate', 'direction': 'risk', 'importance': 0.28})
    if gpa_1st < 11:
        risk_factors.append({'label': '1st Semester GPA Drop', 'direction': 'risk', 'importance': 0.24})
    if len(risk_factors) < 3:
        risk_factors.append({'label': 'Admission Grade', 'direction': 'protective' if rng.random() > 0.4 else 'risk', 'importance': 0.18})
    
    return {
        'student_id': student_id,
        'name': f"{first} {last}",
        'email': f"{first.lower()}.{last.lower()}@university.edu",
        'age': age,
        'gender': rng.choice(['Male', 'Female']),
        'program': rng.choice(PROGRAMS),
        'year': rng.randint(1, 4),
        'risk_score': risk_score,
        'alert_level': alert_level,
        'is_critical': risk_score >= 0.80,
        'scholarship_holder': scholarship,
        'tuition_up_to_date': tuition_ok,
        'debtor': debtor,
        'gpa_1st_sem': gpa_1st,
        'gpa_2nd_sem': gpa_2nd,
        'units_enrolled_1st': enrolled_1st,
        'units_approved_1st': approved_1st,
        'units_enrolled_2nd': enrolled_2nd,
        'units_approved_2nd': approved_2nd,
        'top_risk_factors': risk_factors[:3],
        'performance_timeline': timeline,
        'last_updated': '2024-11-15T10:30:00'
    }


@router.get("/students")
async def get_students(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=5, le=100),
    alert_level: Optional[str] = Query(None, description="Filter by: critical, high, medium, low"),
    search: Optional[str] = Query(None, description="Search by name or ID"),
    sort_by: str = Query('risk_score', description="Sort field"),
    order: str = Query('desc', description="asc or desc")
):
    """
    Get paginated list of students with risk scores.
    Supports filtering by alert level, search, and sorting.
    """
    # Generate 150 students deterministically
    all_ids = [f"STU{str(i).zfill(5)}" for i in range(1, 151)]
    students = [seeded_student(sid) for sid in all_ids]
    
    # Filter
    if alert_level:
        students = [s for s in students if s['alert_level'] == alert_level]
    
    if search:
        search_lower = search.lower()
        students = [
            s for s in students
            if search_lower in s['name'].lower() or search_lower in s['student_id'].lower()
        ]
    
    # Sort
    reverse = order == 'desc'
    try:
        students = sorted(students, key=lambda x: x.get(sort_by, 0), reverse=reverse)
    except TypeError:
        pass
    
    # Paginate
    total = len(students)
    start = (page - 1) * page_size
    end = start + page_size
    page_data = students[start:end]
    
    # Summary stats
    all_students = [seeded_student(sid) for sid in all_ids]
    
    return {
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': (total + page_size - 1) // page_size,
        'students': page_data,
        'summary': {
            'critical': sum(1 for s in all_students if s['alert_level'] == 'critical'),
            'high': sum(1 for s in all_students if s['alert_level'] == 'high'),
            'medium': sum(1 for s in all_students if s['alert_level'] == 'medium'),
            'low': sum(1 for s in all_students if s['alert_level'] == 'low'),
        }
    }


@router.get("/students/{student_id}")
async def get_student(student_id: str):
    """Get detailed profile for a single student."""
    student = seeded_student(student_id)
    
    # Add success pathway
    risk = student['risk_score']
    pathways = []
    
    if not student['tuition_up_to_date']:
        pathways.append({'priority': 'high', 'category': 'Financial Support',
                         'action': 'Connect with Financial Aid', 
                         'detail': 'Explore emergency grants and payment plans.',
                         'icon': 'dollar'})
    if student['gpa_1st_sem'] < 11 or student['gpa_2nd_sem'] < 11:
        pathways.append({'priority': 'high', 'category': 'Academic Intervention',
                         'action': 'Enroll in Academic Coaching',
                         'detail': 'Weekly tutoring and study skills workshops recommended.',
                         'icon': 'book'})
    if risk >= 0.6:
        pathways.append({'priority': 'high', 'category': 'Counseling',
                         'action': 'Assign Dedicated Academic Counselor',
                         'detail': 'High risk — bi-weekly check-ins recommended.',
                         'icon': 'heart'})
    if len(pathways) == 0:
        pathways.append({'priority': 'low', 'category': 'Engagement',
                         'action': 'Student Success Workshop Invitation',
                         'detail': 'Proactive outreach to maintain momentum.',
                         'icon': 'star'})
    
    student['success_pathway'] = pathways
    return student
