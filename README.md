<div align="center">

<br />

# 🛡️ SentinelEdu

### AI-Powered Student Dropout Prediction & Early Warning Platform

*Identify at-risk students weeks before they withdraw — and give counselors the tools to act.*

<br />

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-189AB4?style=for-the-badge&logo=xgboost&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

<br />

![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)
![ML Accuracy](https://img.shields.io/badge/ML_Accuracy-85%25-blue?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

</div>

---

## 📌 What Is SentinelEdu?

Universities lose thousands of students every year to dropout — and most of the time, the warning signs were there weeks or months earlier. Tutition unpaid. GPA slipping. Evaluations missed. But without a system to connect those dots, counselors can't act in time.

**SentinelEdu** is a complete, production-ready SaaS platform that uses machine learning to:

- **Predict** which students are at risk of dropping out (with 85%+ accuracy)
- **Explain** *why* each student is at risk using SHAP explainability — not just a score, but a reason
- **Alert** counselors automatically when risk crosses a critical threshold
- **Guide** intervention with AI-generated, per-student action plans called *Success Pathways*

It's built as a full end-to-end monorepo — ML engine, REST API, and a beautiful dark dashboard — all runnable with a single Docker command.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **Ensemble ML Model** | Random Forest + XGBoost soft-voting classifier trained on 24 academic and financial features |
| 🔍 **Explainable AI (XAI)** | SHAP values surface the Top 3 causal risk factors per student in plain language |
| 🚨 **Automated Alerts** | Students with risk score ≥ 0.80 are auto-flagged as "Critical" and routed to the alert queue |
| 🗺️ **Success Pathways** | AI-generated, per-student intervention plans: financial aid, tutoring, counselor assignment |
| 📊 **Command Center** | Institutional health gauges, 12-month dropout trend, risk distribution, program breakdowns |
| 🔴 **Early Warning Table** | Color-coded student roster (Critical / High / Medium / Low) with one-click deep-dive profiles |
| ⚡ **Synthetic Data Engine** | Auto-generates 2,000 realistic students if no real dataset is available — great for PoC |
| 🐳 **One-Command Deploy** | Full stack (Frontend + API + DB + ML engine) orchestrated by Docker Compose |
| 📱 **Fully Responsive** | Fluid from mobile to ultra-wide — mobile sidebar drawer, responsive grid layouts |

---

## 🏗️ Project Structure

```
sentineledu/
│
├── 🧠 engine/                        # Machine Learning Pipeline
│   ├── generate_data.py              # Synthetic student data generator (2000 records)
│   ├── train_model.py                # Model training + SHAP explainer + model saving
│   ├── requirements.txt              # Python ML dependencies
│   ├── Dockerfile
│   └── data/
│       └── students.csv              # Dataset (generated or UCI)
│   └── models/
│       ├── sentinel_model.joblib     # Trained ensemble model
│       ├── shap_explainer.joblib     # SHAP TreeExplainer
│       └── metadata.json            # Feature names, class labels, accuracy
│
├── ⚙️ backend/                       # FastAPI REST API
│   ├── main.py                       # App entry, CORS, lifespan model loading
│   ├── routes/
│   │   ├── predict.py                # POST /api/predict — single & batch prediction
│   │   ├── students.py               # GET /api/students — roster with risk scores
│   │   └── analytics.py             # GET /api/analytics/overview — KPIs & trends
│   ├── utils/
│   │   └── model_loader.py          # Loads model, runs inference, extracts SHAP factors
│   ├── requirements.txt
│   └── Dockerfile
│
├── 🎨 frontend/                      # Next.js 14 Dashboard
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Landing page (hero, bento features, stats)
│       │   ├── layout.tsx            # Root layout with font imports
│       │   ├── globals.css           # Minimal global reset
│       │   └── dashboard/
│       │       ├── layout.tsx        # Sidebar + mobile hamburger nav
│       │       ├── page.tsx          # Command Center (KPIs, gauges, charts, alerts)
│       │       ├── students/         # Early Warning Table + Student Deep-Dive Modal
│       │       ├── predict/          # Interactive Risk Predictor with sliders
│       │       └── alerts/           # Alert Center (Critical + High risk queue)
│       └── lib/
│           └── api.ts                # API client + mock/fallback data
│
├── 🐳 docker-compose.yml             # Orchestrates all 4 services
├── .env.example                      # Environment variable template
├── .gitignore
└── README.md
```

---

## 🤖 The AI Engine — How It Works

### Model Architecture

SentinelEdu uses a **soft-voting ensemble** that combines two powerful classifiers:

```
24 Input Features
       │
       ▼
┌──────────────────────────────────────┐
│  Random Forest    │  XGBoost          │
│  200 trees        │  200 estimators   │
│  depth: 12        │  lr: 0.05         │
│  weight: 1        │  weight: 2        │
└──────────────────────────────────────┘
       │ Soft vote (average probabilities)
       ▼
[Dropout %, Enrolled %, Graduate %]
```

### Input Features (24 total)

| Category | Features |
|---|---|
| **Demographics** | Age at enrollment, Gender, International student, Displaced |
| **Financial** | Scholarship holder, Tuition fees up-to-date, Has outstanding debt |
| **Academic Background** | Admission grade, Previous qualification grade |
| **1st Semester** | Units enrolled, Units approved, GPA, Evaluations, Missed evaluations |
| **2nd Semester** | Same 5 features as 1st semester |
| **Macroeconomic** | Unemployment rate, Inflation rate, GDP growth |

### Explainable AI with SHAP

Every prediction returns **Top 3 risk factors** using SHAP (SHapley Additive exPlanations):

```json
"top_risk_factors": [
  {
    "label": "Late Tuition Payment",
    "direction": "risk",
    "importance": 0.31
  },
  {
    "label": "1st Semester GPA Drop",
    "direction": "risk",
    "importance": 0.23
  },
  {
    "label": "Scholarship Holder",
    "direction": "protective",
    "importance": 0.12
  }
]
```

This means counselors don't just see a score — they see *exactly why* the model thinks a student is at risk.

### Alert Thresholds

| Risk Score | Level | Color | Action |
|---|---|---|---|
| ≥ 0.80 | 🔴 **Critical** | Red | Immediate intervention — auto-flagged |
| 0.60 – 0.79 | 🟠 **High** | Orange | Priority outreach within 48 hours |
| 0.40 – 0.59 | 🟡 **Medium** | Yellow | Schedule a check-in this month |
| < 0.40 | 🟢 **Low** | Green | Standard monitoring |

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Interactive docs available at `http://localhost:8000/docs`.

### `POST /api/predict`
Predict dropout risk for a single student.

**Request body:**
```json
{
  "student_id": "STU00001",
  "age_at_enrollment": 22,
  "tuition_fees_up_to_date": 0,
  "debtor": 1,
  "scholarship_holder": 0,
  "admission_grade": 112,
  "curricular_units_1st_sem_enrolled": 6,
  "curricular_units_1st_sem_approved": 2,
  "curricular_units_1st_sem_grade": 9.5,
  "curricular_units_2nd_sem_enrolled": 6,
  "curricular_units_2nd_sem_approved": 1,
  "curricular_units_2nd_sem_grade": 7.8
}
```

**Response:**
```json
{
  "student_id": "STU00001",
  "prediction": "Dropout",
  "risk_score": 0.8742,
  "alert_level": "critical",
  "is_critical": true,
  "probabilities": {
    "Dropout": 0.8742,
    "Enrolled": 0.0821,
    "Graduate": 0.0437
  },
  "top_risk_factors": [...],
  "success_pathway": [...],
  "timestamp": "2024-11-15T10:30:00Z"
}
```

### `POST /api/predict/batch`
Predict risk for up to **100 students** at once. Same format as above but wrapped in a list.

### `GET /api/students`
Get paginated student roster with risk scores.

| Query Param | Type | Description |
|---|---|---|
| `page` | int | Page number (default: 1) |
| `page_size` | int | Students per page (default: 20, max: 100) |
| `alert_level` | string | Filter: `critical`, `high`, `medium`, `low` |
| `search` | string | Search by name or student ID |
| `sort_by` | string | Field to sort by (default: `risk_score`) |
| `order` | string | `asc` or `desc` |

### `GET /api/analytics/overview`
Returns institutional KPIs, 12-month trend data, risk distribution, program breakdowns, and recent critical alerts.

### `GET /health`
Returns `{ "status": "healthy", "model_loaded": true }` — useful for Docker health checks.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

- [Node.js 20+](https://nodejs.org/)
- [Python 3.11+](https://www.python.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) *(for Docker method)*

---

### Option 1: Docker Compose ⭐ Recommended

The fastest way to run everything. One command spins up all 4 services.

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/sentineledu.git
cd sentineledu

# 2. Copy environment file
cp .env.example .env

# 3. Train the ML model (required once before starting)
docker-compose run --rm engine

# 4. Launch the full stack
docker-compose up -d

# 5. Open the app
# Dashboard  →  http://localhost:3000
# API Docs   →  http://localhost:8000/docs
# Database   →  localhost:5432
```

To stop everything:
```bash
docker-compose down
```

To stop and wipe all data:
```bash
docker-compose down -v
```

---

### Option 2: Manual Local Development

Run each service separately — best for active development.

#### Step 1 — Train the ML Model

```bash
cd engine

# Install Python dependencies
pip install -r requirements.txt

# This will:
# 1. Generate 2000 synthetic students → engine/data/students.csv
# 2. Train the ensemble model
# 3. Save model artifacts → engine/models/
python train_model.py
```

> **Using the real UCI dataset?**
> Download it from [UCI ML Repository](https://archive.ics.uci.edu/dataset/697/predict+students+dropout+and+academic+success), place the CSV at `engine/data/students.csv` with a `Target` column containing `"Dropout"`, `"Enrolled"`, or `"Graduate"`.

Expected output:
```
🔄 Generating synthetic data...
✅ Dataset: 2000 records | Columns: 26
🏋️  Training RF + XGBoost ensemble...
📊 Accuracy: ~77-85%
✅ SHAP explainer validated
🎉 Training complete!
```

---

#### Step 2 — Start the Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Point the API to the trained model
# Windows:
set MODEL_PATH=..\engine\models\sentinel_model.joblib
# macOS / Linux:
export MODEL_PATH=../engine/models/sentinel_model.joblib

# Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
✅ ML Model loaded successfully
INFO: Uvicorn running on http://0.0.0.0:8000
```

Visit **http://localhost:8000/docs** for the full interactive API documentation.

---

#### Step 3 — Start the Frontend

```bash
cd frontend

# Install Node dependencies
npm install

# Create local environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the dev server
npm run dev
```

Open **http://localhost:3000** — the landing page will load.
Navigate to **http://localhost:3000/dashboard** to open the Command Center.

> **No backend running?** No problem. The frontend automatically falls back to built-in mock data so you can explore the full UI without the API.

---

## 🎨 Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Hero section, animated stats, feature bento grid, process steps |
| `/dashboard` | Command Center | KPI cards, institutional gauges, dropout trend chart, risk distribution |
| `/dashboard/students` | Early Warning Table | Full student roster, color-coded risk, search/filter, deep-dive modal |
| `/dashboard/predict` | Risk Predictor | Interactive sliders for all 24 features, live AI prediction |
| `/dashboard/alerts` | Alert Center | Dismissable critical and high-risk alert queues |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Database password (used by Docker Compose)
DB_PASSWORD=your_secure_password_here

# URL where the frontend can reach the backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Full database connection string (used by the backend)
DATABASE_URL=postgresql://sentinel:your_password@localhost:5432/sentineledu

# Absolute path to the trained model file
MODEL_PATH=../engine/models/sentinel_model.joblib

# Comma-separated allowed origins for CORS
CORS_ORIGINS=http://localhost:3000
```

---

## 📊 Model Performance

Trained on 2,000 synthetic students (1,600 train / 400 test):

| Class | Precision | Recall | F1-Score |
|---|---|---|---|
| **Dropout** | 0.79 | 0.71 | 0.75 |
| **Enrolled** | 0.66 | 0.75 | 0.70 |
| **Graduate** | 0.89 | 0.83 | 0.86 |
| **Overall Accuracy** | — | — | **~77–85%** |

> Performance improves significantly with real UCI dataset (~85%+ accuracy). Synthetic data is intentionally conservative to avoid overfitting.

---

## 🐳 Docker Services

| Service | Image | Port | Description |
|---|---|---|---|
| `frontend` | Node 20 Alpine | `3000` | Next.js dashboard |
| `backend` | Python 3.11 Slim | `8000` | FastAPI REST API |
| `db` | PostgreSQL 16 Alpine | `5432` | Student and prediction data |
| `engine` | Python 3.11 Slim | — | One-shot model trainer (exits after training) |

```bash
# View logs for a specific service
docker-compose logs -f backend

# Retrain the model without restarting everything
docker-compose run --rm engine python train_model.py

# Restart just the backend
docker-compose restart backend
```

---

## 🗺️ Roadmap

- [ ] Real-time SIS integration (Ellucian Banner, Colleague, Blackboard)
- [ ] Email & SMS push notifications for counselors
- [ ] Temporal risk tracking — show how a student's risk evolves week by week
- [ ] Intervention effectiveness tracking — did the counselor's action work?
- [ ] Multi-institution / multi-tenant support
- [ ] FERPA-compliant audit log for all predictions and accesses
- [ ] Mobile app for counselors (React Native)
- [ ] Role-based access control (Admin / Counselor / Viewer)

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/sentineledu.git

# 3. Create a feature branch
git checkout -b feat/your-feature-name

# 4. Make your changes, then commit
git commit -m "feat: describe your change clearly"

# 5. Push and open a Pull Request
git push origin feat/your-feature-name
```

Please keep commits clean and descriptive. Bug reports and feature requests are also welcome via [GitHub Issues](../../issues).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software for any purpose, including commercial use, as long as the original license notice is included.

---

## 🙏 Acknowledgements

- [UCI Machine Learning Repository](https://archive.ics.uci.edu/dataset/697/predict+students+dropout+and+academic+success) — for the original Student Dropout dataset
- [SHAP by Scott Lundberg](https://github.com/slundberg/shap) — for making ML explainability accessible
- [Recharts](https://recharts.org/) — for the beautiful data visualizations
- [Vercel](https://vercel.com/) — for making Next.js deployment effortless

---

<div align="center">

**Built with ❤️ to keep students in school**

[⭐ Star this repo](../../stargazers) · [🐛 Report a Bug](../../issues) · [💡 Request a Feature](../../issues)

</div>
