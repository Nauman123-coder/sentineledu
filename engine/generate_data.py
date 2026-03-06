"""
SentinelEdu - Synthetic Student Data Generator
Generates high-fidelity synthetic data mimicking UCI Student Dropout dataset patterns
"""
import numpy as np
import pandas as pd
from pathlib import Path

np.random.seed(42)

def generate_synthetic_students(n_students: int = 2000) -> pd.DataFrame:
    """Generate realistic synthetic student data with academic correlations."""

    # --- Demographic Features ---
    _age_probs = np.array([0.15, 0.20, 0.18, 0.12, 0.08, 0.06, 0.05, 0.04, 0.03, 0.02,
                           0.01, 0.01, 0.01, 0.01, 0.01, 0.005, 0.005, 0.005, 0.005, 0.005,
                           0.003, 0.003, 0.003, 0.003, 0.002, 0.002, 0.002, 0.002, 0.002, 0.002,
                           0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001])
    _age_probs = _age_probs / _age_probs.sum()
    age_at_enrollment = np.random.choice(range(17, 55), size=n_students, p=_age_probs)

    gender = np.random.choice([0, 1], size=n_students, p=[0.45, 0.55])
    international = np.random.choice([0, 1], size=n_students, p=[0.88, 0.12])
    displaced = np.random.choice([0, 1], size=n_students, p=[0.72, 0.28])

    # --- Financial Features ---
    scholarship_holder = np.random.choice([0, 1], size=n_students, p=[0.75, 0.25])

    tuition_up_to_date = np.where(
        scholarship_holder == 1,
        np.random.choice([0, 1], size=n_students, p=[0.05, 0.95]),
        np.where(
            age_at_enrollment > 30,
            np.random.choice([0, 1], size=n_students, p=[0.35, 0.65]),
            np.random.choice([0, 1], size=n_students, p=[0.22, 0.78])
        )
    )
    debtor = np.where(
        tuition_up_to_date == 0,
        np.random.choice([0, 1], size=n_students, p=[0.3, 0.7]),
        np.random.choice([0, 1], size=n_students, p=[0.9, 0.1])
    )

    # --- Academic Background ---
    admission_grade = np.clip(np.random.normal(130, 20, n_students), 95, 190).astype(int)
    previous_qualification_grade = np.clip(np.random.normal(135, 18, n_students), 95, 190).astype(int)

    # --- 1st Semester Performance ---
    credited_1st = np.random.choice([0, 2, 4, 6], size=n_students, p=[0.65, 0.15, 0.12, 0.08])

    _enroll_probs = np.array([0.05, 0.15, 0.35, 0.25, 0.12, 0.05, 0.03])
    _enroll_probs = _enroll_probs / _enroll_probs.sum()
    enrolled_1st = np.random.choice(range(3, 10), size=n_students, p=_enroll_probs)

    approval_rate_1st = np.clip(
        (admission_grade - 95) / 100 + np.random.normal(0, 0.15, n_students), 0.1, 1.0
    )
    approved_1st = np.clip(np.round(enrolled_1st * approval_rate_1st).astype(int), 0, enrolled_1st)

    grade_1st = np.where(
        approved_1st > 0,
        np.clip(np.random.normal(12.5, 2.5, n_students) + (admission_grade - 130) * 0.02, 8, 20),
        0
    )
    evaluations_1st = enrolled_1st + np.random.choice([0, 1, 2], size=n_students, p=[0.6, 0.3, 0.1])
    without_evaluation_1st = np.maximum(0, enrolled_1st - evaluations_1st + np.random.choice([0, 1], size=n_students))

    # --- 2nd Semester Performance (correlated with 1st) ---
    enrolled_2nd = np.clip(
        np.where(
            approved_1st < enrolled_1st * 0.4,
            np.maximum(1, enrolled_1st - np.random.randint(0, 3, n_students)),
            enrolled_1st + np.random.choice([-1, 0, 1], size=n_students, p=[0.2, 0.6, 0.2])
        ), 1, 10
    )

    approval_rate_2nd = np.clip(approval_rate_1st + np.random.normal(0, 0.1, n_students), 0.05, 1.0)
    approved_2nd = np.clip(np.round(enrolled_2nd * approval_rate_2nd).astype(int), 0, enrolled_2nd)

    grade_2nd = np.where(
        approved_2nd > 0,
        np.clip(grade_1st + np.random.normal(0, 1.5, n_students), 8, 20),
        0
    )
    evaluations_2nd = enrolled_2nd + np.random.choice([0, 1], size=n_students, p=[0.7, 0.3])
    without_evaluation_2nd = np.maximum(0, enrolled_2nd - evaluations_2nd + np.random.choice([0, 1], size=n_students))
    credited_2nd = credited_1st

    # --- Socioeconomic Context ---
    unemployment_rate = np.clip(np.random.normal(11.5, 3.0, n_students), 6, 18)
    inflation_rate = np.clip(np.random.normal(1.4, 1.2, n_students), -1, 5)
    gdp = np.clip(np.random.normal(0.32, 1.5, n_students), -4, 4)

    # --- TARGET GENERATION ---
    risk_score = np.zeros(n_students)
    risk_score += np.where(tuition_up_to_date == 0, 0.25, 0)
    risk_score += np.where(debtor == 1, 0.15, 0)
    risk_score += np.where(scholarship_holder == 1, -0.10, 0)
    risk_score += np.where(approved_1st / np.maximum(enrolled_1st, 1) < 0.5, 0.20, -0.05)
    risk_score += np.where(grade_1st < 11, 0.15, -0.05)
    risk_score += np.where(grade_2nd < 10, 0.20, -0.05)
    risk_score += np.where(without_evaluation_1st > 2, 0.15, 0)
    risk_score += np.where(admission_grade < 115, 0.10, -0.05)
    risk_score += np.where(age_at_enrollment > 35, 0.08, 0)
    risk_score += np.random.normal(0, 0.1, n_students)

    targets = np.where(
        risk_score > 0.45, 'Dropout',
        np.where(risk_score > 0.10, 'Enrolled', 'Graduate')
    )

    df = pd.DataFrame({
        'student_id': [f'STU{str(i).zfill(5)}' for i in range(1, n_students + 1)],
        'age_at_enrollment': age_at_enrollment,
        'gender': gender,
        'international': international,
        'displaced': displaced,
        'scholarship_holder': scholarship_holder,
        'tuition_fees_up_to_date': tuition_up_to_date,
        'debtor': debtor,
        'admission_grade': admission_grade,
        'previous_qualification_grade': previous_qualification_grade,
        'curricular_units_1st_sem_credited': credited_1st,
        'curricular_units_1st_sem_enrolled': enrolled_1st,
        'curricular_units_1st_sem_evaluations': evaluations_1st,
        'curricular_units_1st_sem_approved': approved_1st,
        'curricular_units_1st_sem_grade': np.round(grade_1st, 2),
        'curricular_units_1st_sem_without_evaluations': without_evaluation_1st,
        'curricular_units_2nd_sem_credited': credited_2nd,
        'curricular_units_2nd_sem_enrolled': enrolled_2nd,
        'curricular_units_2nd_sem_evaluations': evaluations_2nd,
        'curricular_units_2nd_sem_approved': approved_2nd,
        'curricular_units_2nd_sem_grade': np.round(grade_2nd, 2),
        'curricular_units_2nd_sem_without_evaluations': without_evaluation_2nd,
        'unemployment_rate': np.round(unemployment_rate, 1),
        'inflation_rate': np.round(inflation_rate, 1),
        'gdp': np.round(gdp, 2),
        'target': targets
    })

    return df


if __name__ == '__main__':
    output_dir = Path(__file__).parent / 'data'
    output_dir.mkdir(exist_ok=True)

    df = generate_synthetic_students(2000)
    output_path = output_dir / 'students.csv'
    df.to_csv(output_path, index=False)

    print(f"✅ Generated {len(df)} student records")
    print(f"📊 Target distribution:")
    print(df['target'].value_counts())
    print(f"💾 Saved to {output_path}")