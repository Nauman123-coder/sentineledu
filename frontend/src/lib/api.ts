const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  getAnalyticsOverview: () => apiFetch('/api/analytics/overview'),
  getStudents: (params?: {
    page?: number
    page_size?: number
    alert_level?: string
    search?: string
    sort_by?: string
    order?: string
  }) => {
    const qs = new URLSearchParams(
      Object.entries(params || {})
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString()
    return apiFetch(`/api/students${qs ? `?${qs}` : ''}`)
  },
  getStudent: (id: string) => apiFetch(`/api/students/${id}`),
  predict: (data: any) =>
    apiFetch('/api/predict', { method: 'POST', body: JSON.stringify(data) }),
}

// Mock data for when API is unavailable
export const MOCK_OVERVIEW = {
  kpis: {
    total_students: 150,
    critical_students: 18,
    high_risk_students: 27,
    medium_risk_students: 41,
    low_risk_students: 64,
    dropout_rate_pct: 12.0,
    at_risk_rate_pct: 30.0,
    institutional_health_score: 76.0,
    avg_gpa: 12.4,
    avg_attendance_pct: 78.3,
    intervention_success_rate: 67.2
  },
  risk_distribution: [
    { level: 'Critical', count: 18, color: '#ef4444' },
    { level: 'High', count: 27, color: '#f97316' },
    { level: 'Medium', count: 41, color: '#eab308' },
    { level: 'Low', count: 64, color: '#22c55e' },
  ],
  dropout_trend: [
    { month: 'Dec', rate: 28 }, { month: 'Jan', rate: 30 }, { month: 'Feb', rate: 27 },
    { month: 'Mar', rate: 32 }, { month: 'Apr', rate: 29 }, { month: 'May', rate: 31 },
    { month: 'Jun', rate: 28 }, { month: 'Jul', rate: 26 }, { month: 'Aug', rate: 30 },
    { month: 'Sep', rate: 33 }, { month: 'Oct', rate: 29 }, { month: 'Nov', rate: 28 },
  ],
  programs_at_risk: [
    { program: 'Computer Science', total: 22, at_risk: 8, at_risk_rate: 36.4 },
    { program: 'Business Admin', total: 25, at_risk: 9, at_risk_rate: 36.0 },
    { program: 'Nursing', total: 18, at_risk: 4, at_risk_rate: 22.2 },
    { program: 'Engineering', total: 20, at_risk: 7, at_risk_rate: 35.0 },
    { program: 'Psychology', total: 15, at_risk: 6, at_risk_rate: 40.0 },
    { program: 'Education', total: 14, at_risk: 3, at_risk_rate: 21.4 },
  ],
  top_risk_factors: [
    { factor: 'Late Tuition Payment', frequency: 45 },
    { factor: '1st Semester GPA Drop', frequency: 38 },
    { factor: 'Low Unit Approval Rate', frequency: 34 },
    { factor: 'Outstanding Debt', frequency: 29 },
    { factor: 'Missed Evaluations', frequency: 24 },
  ],
  recent_alerts: [
    { student_id: 'STU00003', name: 'Carlos Martinez', risk_score: 0.91, alert: 'Critical dropout risk', time: '2h ago' },
    { student_id: 'STU00007', name: 'Priya Sharma', risk_score: 0.85, alert: 'Tuition overdue + low GPA', time: '4h ago' },
    { student_id: 'STU00012', name: 'Wei Zhang', risk_score: 0.82, alert: 'Missed 3 consecutive evaluations', time: '6h ago' },
    { student_id: 'STU00019', name: 'Fatima Hassan', risk_score: 0.81, alert: 'GPA dropped 30%', time: '1d ago' },
  ]
}

export function generateMockStudents(count = 50) {
  const programs = ['CS', 'Business', 'Nursing', 'Engineering', 'Psychology', 'Education']
  const firstNames = ['Ahmed', 'Fatima', 'James', 'Emma', 'Raj', 'Priya', 'Carlos', 'Maria', 'Wei', 'Layla', 'Omar', 'Sofia']
  const lastNames = ['Khan', 'Smith', 'Sharma', 'Garcia', 'Zhang', 'Hassan', 'Johnson', 'Patel', 'Martinez']
  
  return Array.from({ length: count }, (_, i) => {
    const seed = (i * 7919 + 12345) % 10000
    const riskScore = parseFloat(((seed % 100) / 100).toFixed(3))
    const alertLevel = riskScore >= 0.8 ? 'critical' : riskScore >= 0.6 ? 'high' : riskScore >= 0.4 ? 'medium' : 'low'
    const firstName = firstNames[i % firstNames.length]
    const lastName = lastNames[i % lastNames.length]
    
    return {
      student_id: `STU${String(i + 1).padStart(5, '0')}`,
      name: `${firstName} ${lastName}`,
      program: programs[i % programs.length],
      year: (i % 4) + 1,
      risk_score: riskScore,
      alert_level: alertLevel,
      is_critical: riskScore >= 0.8,
      gpa_1st_sem: parseFloat((8 + (seed % 12)).toFixed(1)),
      gpa_2nd_sem: parseFloat((8 + ((seed * 3) % 12)).toFixed(1)),
      tuition_up_to_date: seed % 5 !== 0,
      scholarship_holder: seed % 4 === 0,
      top_risk_factors: [
        { label: 'Late Tuition Payment', direction: 'risk', importance: 0.32 },
        { label: '1st Sem GPA Drop', direction: 'risk', importance: 0.25 },
        { label: 'Missed Evaluations', direction: 'risk', importance: 0.18 },
      ]
    }
  })
}
