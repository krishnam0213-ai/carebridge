import React, { useState } from 'react';

const initialPatient = {
  name: 'Aarav Sharma',
  age: 58,
  diagnosis: 'Hypertension + Diabetes',
  dischargeDate: '03 Oct 2026',
  room: 'Ward A-204',
  risk: 'Moderate',
  status: 'Stable',
  vitals: {
    bp: '128/82',
    hr: '72',
    temp: '98.6°F',
    o2: '98%'
  },
  medicines: [
    { name: 'Metformin', dose: '500 mg', time: 'Morning', info: 'Take after food', type: 'oral' },
    { name: 'Lisinopril', dose: '10 mg', time: 'Night', info: 'Check BP before sleeping', type: 'oral' },
    { name: 'Aspirin', dose: '75 mg', time: 'Morning', info: 'Avoid if bleeding occurs', type: 'oral' }
  ],
  reminders: [
    'Take medicines on time',
    'Drink enough water',
    'Report chest pain immediately',
    'Follow up with cardiologist on 12 Oct'
  ],
  diet: [
    'Avoid fried food',
    'Limit salt',
    'Avoid skipping meals',
    'Eat small, regular meals'
  ],
  warnings: [
    'Chest pain',
    'Shortness of breath',
    'Severe dizziness',
    'Uncontrolled fever'
  ],
  followups: [
    { name: 'Cardiologist', date: '12 Oct 2026', time: '10:30 AM' },
    { name: 'Diabetes Review', date: '18 Oct 2026', time: '2:00 PM' }
  ],
  alerts: [
    'Medication overlap risk: Aspirin + other blood thinner may be unsafe.',
    'Blood pressure is critical if above 160.',
    'Simplified text recommended for low-literacy users.'
  ]
};

const emptyForm = {
  name: '',
  age: '',
  diagnosis: '',
  allergies: '',
  medicationHistory: '',
  room: '',
  emergencyContact: '',
  dischargeSummary: ''
};

const defaultText = `
Patient discharged after blood pressure evaluation.
Take Metformin 500 mg twice a day after food.
Take Lisinopril 10 mg at night.
Avoid fried food and limit salt.
Follow up with cardiologist on 12 Oct 2026.
Go to emergency if chest pain or shortness of breath occurs.
`;

function verifyPatientDetails(form) {
  const warnings = [];

  if (!form.name || !form.name.trim()) warnings.push('Patient name is required.');
  if (!form.age || Number(form.age) <= 0 || Number(form.age) > 120) warnings.push('Age must be a valid number between 1 and 120.');
  if (!form.diagnosis || !form.diagnosis.trim()) warnings.push('Diagnosis is required.');
  if (!form.dischargeSummary || !form.dischargeSummary.trim()) warnings.push('Discharge summary is required.');
  if (!form.room || !form.room.trim()) warnings.push('Room number is required.');

  return warnings;
}

function buildCarePlanFromForm(form) {
  const parsedAge = Number(form.age) || 58;
  const summary = (form.dischargeSummary || '').toLowerCase();

  const medicines = [];
  if (summary.includes('metformin')) {
    medicines.push({ name: 'Metformin', dose: '500 mg', time: 'Morning', info: 'Take after food', type: 'oral' });
  }
  if (summary.includes('lisinopril')) {
    medicines.push({ name: 'Lisinopril', dose: '10 mg', time: 'Night', info: 'Check BP before sleeping', type: 'oral' });
  }
  if (summary.includes('aspirin')) {
    medicines.push({ name: 'Aspirin', dose: '75 mg', time: 'Morning', info: 'Avoid if bleeding occurs', type: 'oral' });
  }

  if (!medicines.length) medicines.push(...initialPatient.medicines);

  const warnings = [];
  if (summary.includes('chest pain')) warnings.push('Chest pain');
  if (summary.includes('shortness of breath')) warnings.push('Shortness of breath');
  if (summary.includes('dizziness')) warnings.push('Severe dizziness');
  if (summary.includes('fever')) warnings.push('Uncontrolled fever');

  if (!warnings.length) warnings.push(...initialPatient.warnings.slice(0, 2));

  const diet = [];
  if (summary.includes('fried') || summary.includes('oil')) diet.push('Avoid fried food');
  if (summary.includes('salt')) diet.push('Limit salt');
  if (summary.includes('meal') || summary.includes('food')) diet.push('Avoid skipping meals');

  if (!diet.length) diet.push(...initialPatient.diet);

  const reminders = [];
  reminders.push('Take medicines on time as prescribed.');
  reminders.push('Drink enough water.');

  if (summary.includes('chest pain') || summary.includes('shortness of breath')) {
    reminders.push('Seek urgent help if chest pain or breathing issues occur.');
  }

  if (summary.includes('cardiologist') || summary.includes('follow up')) {
    reminders.push('Follow up with cardiologist on 12 Oct 2026.');
  }

  const alerts = [];
  alerts.push('Medication overlap risk: Aspirin + other blood thinner may be unsafe.');
  if (summary.includes('blood pressure')) alerts.push('Blood pressure should be monitored closely.');
  alerts.push('Simplified text recommended for low-literacy users.');

  return {
    name: form.name || initialPatient.name,
    age: parsedAge,
    diagnosis: form.diagnosis || initialPatient.diagnosis,
    dischargeDate: '03 Oct 2026',
    room: form.room || initialPatient.room,
    risk: 'Moderate',
    status: 'Stable',
    vitals: {
      bp: '128/82',
      hr: '72',
      temp: '98.6°F',
      o2: '98%'
    },
    medicines,
    reminders,
    diet,
    warnings,
    followups: [
      { name: 'Cardiologist', date: '12 Oct 2026', time: '10:30 AM' },
      { name: 'Diabetes Review', date: '18 Oct 2026', time: '2:00 PM' }
    ],
    alerts
  };
}

export default function App() {
  const [patient, setPatient] = useState(initialPatient);
  const [form, setForm] = useState(emptyForm);
  const [agentMessage, setAgentMessage] = useState('Agent is ready to verify patient details.');
  const [activeTab, setActiveTab] = useState('overview');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const localErrors = verifyPatientDetails(form);

    if (localErrors.length > 0) {
      setAgentMessage(localErrors.join(' '));
      return;
    }

    const payload = {
      name: form.name,
      age: Number(form.age),
      diagnosis: form.diagnosis,
      allergies: form.allergies || '',
      medicationHistory: form.medicationHistory || '',
      room: form.room,
      dischargeSummary: form.dischargeSummary
    };

    try {
      setAgentMessage('Processing... Please wait.');

      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        setPatient(result.data);
        setAgentMessage('✅ Patient details verified successfully. Care plan generated.');
      } else {
        setAgentMessage('❌ ' + (result.errors || ['Verification failed']).join(' '));
      }
    } catch (error) {
      console.error('Backend error:', error);
      const fallbackPlan = buildCarePlanFromForm(form);
      setPatient(fallbackPlan);
      setAgentMessage('⚠️ Backend unavailable. Using local demo care plan.');
    }
  };

  return (
    <div className="luxury-app">
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-mark">⚕️</div>
              <span>MediCare</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button
              className={`nav-item ${activeTab === 'medicines' ? 'active' : ''}`}
              onClick={() => setActiveTab('medicines')}
            >
              💊 Medicines
            </button>
            <button
              className={`nav-item ${activeTab === 'vitals' ? 'active' : ''}`}
              onClick={() => setActiveTab('vitals')}
            >
              ❤️ Vitals
            </button>
            <button
              className={`nav-item ${activeTab === 'diet' ? 'active' : ''}`}
              onClick={() => setActiveTab('diet')}
            >
              🥗 Diet
            </button>
          </nav>

          <div className="sidebar-footer">
            <p>© 2026 MediCare</p>
          </div>
        </aside>

        <main className="main-content">
          <div className="topbar-luxury">
            <div className="topbar-left">
              <h1>Patient Care Dashboard</h1>
              <p>Comprehensive discharge planning & monitoring</p>
            </div>
            <div className="topbar-right">
              <button className="icon-btn">🔔</button>
              <button className="icon-btn">⚙️</button>
            </div>
          </div>

          <section className="input-section-luxury">
            <div className="section-header-luxury">
              <div>
                <h3>Patient Details & Verification</h3>
                <p>Enter patient information. The agent verifies the details and generates the care plan.</p>
              </div>
              <button className="primary-btn" onClick={handleSubmit}>Verify & Generate</button>
            </div>

            <form className="patient-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Patient Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-field">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleFormChange}
                    placeholder="e.g. 58"
                  />
                </div>

                <div className="form-field">
                  <label>Diagnosis</label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={form.diagnosis}
                    onChange={handleFormChange}
                    placeholder="e.g. Hypertension + Diabetes"
                  />
                </div>

                <div className="form-field">
                  <label>Room Number</label>
                  <input
                    type="text"
                    name="room"
                    value={form.room}
                    onChange={handleFormChange}
                    placeholder="e.g. Ward A-204"
                  />
                </div>

                <div className="form-field">
                  <label>Allergies</label>
                  <input
                    type="text"
                    name="allergies"
                    value={form.allergies}
                    onChange={handleFormChange}
                    placeholder="e.g. Penicillin"
                  />
                </div>

                <div className="form-field">
                  <label>Emergency Contact</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={form.emergencyContact}
                    onChange={handleFormChange}
                    placeholder="Contact number / name"
                  />
                </div>

                <div className="form-field full-width">
                  <label>Medication History</label>
                  <input
                    type="text"
                    name="medicationHistory"
                    value={form.medicationHistory}
                    onChange={handleFormChange}
                    placeholder="e.g. Metformin, Lisinopril, Aspirin"
                  />
                </div>

                <div className="form-field full-width">
                  <label>Discharge Summary</label>
                  <textarea
                    name="dischargeSummary"
                    value={form.dischargeSummary}
                    onChange={handleFormChange}
                    placeholder="Paste the discharge instructions..."
                  />
                </div>
              </div>

              <div className="agent-status">
                <strong>Agent status:</strong>
                <span>{agentMessage}</span>
              </div>
            </form>
          </section>

          {activeTab === 'overview' && (
            <div className="dashboard-content">
              <section className="patient-header">
                <div className="patient-info">
                  <div className="patient-avatar">AS</div>
                  <div>
                    <h2>{patient.name}</h2>
                    <p>{patient.diagnosis}</p>
                    <div className="patient-meta">
                      <span>Age: {patient.age}</span>
                      <span>Room: {patient.room}</span>
                      <span className="status-badge">{patient.status}</span>
                    </div>
                  </div>
                </div>

                <div className="vitals-grid">
                  <div className="vital-card">
                    <span>BP</span>
                    <strong>{patient.vitals.bp}</strong>
                  </div>
                  <div className="vital-card">
                    <span>HR</span>
                    <strong>{patient.vitals.hr} bpm</strong>
                  </div>
                  <div className="vital-card">
                    <span>Temp</span>
                    <strong>{patient.vitals.temp}</strong>
                  </div>
                  <div className="vital-card">
                    <span>O2</span>
                    <strong>{patient.vitals.o2}</strong>
                  </div>
                </div>
              </section>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon">💊</span>
                  <h4>{patient.medicines.length}</h4>
                  <p>Active Medications</p>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">📋</span>
                  <h4>{patient.followups.length}</h4>
                  <p>Follow-ups Scheduled</p>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">⚠️</span>
                  <h4>{patient.alerts.length}</h4>
                  <p>Critical Alerts</p>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">✅</span>
                  <h4>82%</h4>
                  <p>Recovery Score</p>
                </div>
              </div>

              <div className="luxury-grid">
                <section className="luxury-panel">
                  <div className="panel-header">
                    <h3>💊 Medication Schedule</h3>
                    <span className="pill-luxury">{patient.medicines.length} Active</span>
                  </div>

                  <div className="medicine-list">
                    {patient.medicines.map((med, index) => (
                      <div className="medicine-item" key={index}>
                        <div className="med-icon">💊</div>
                        <div className="med-content">
                          <strong>{med.name}</strong>
                          <p>{med.dose} • {med.time}</p>
                          <small>{med.info}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="luxury-panel">
                  <div className="panel-header">
                    <h3>⏱️ Daily Timeline</h3>
                    <span className="pill-luxury">Today</span>
                  </div>

                  <div className="timeline-luxury">
                    {patient.medicines.map((med, index) => (
                      <div className="timeline-step" key={index}>
                        <div className="step-dot"></div>
                        <div className="step-content">
                          <strong>{med.time}</strong>
                          <p>{med.name} - {med.dose}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="luxury-panel danger">
                  <div className="panel-header">
                    <h3>⚠️ Risk Alerts</h3>
                    <span className="pill-luxury alert">High</span>
                  </div>

                  <div className="alerts-list">
                    {patient.alerts.map((alert, index) => (
                      <div className="alert-item" key={index}>
                        <span>⚠️</span>
                        <p>{alert}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="luxury-panel">
                  <div className="panel-header">
                    <h3>🔔 Reminders</h3>
                    <span className="pill-luxury">Active</span>
                  </div>

                  <div className="reminders-list">
                    {patient.reminders.map((reminder, index) => (
                      <div className="reminder-item" key={index}>
                        <input type="checkbox" />
                        <p>{reminder}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="luxury-panel">
                  <div className="panel-header">
                    <h3>📅 Appointments</h3>
                    <span className="pill-luxury">{patient.followups.length}</span>
                  </div>

                  <div className="appointments-list">
                    {patient.followups.map((appt, index) => (
                      <div className="appointment-item" key={index}>
                        <div className="appt-icon">📅</div>
                        <div>
                          <strong>{appt.name}</strong>
                          <p>{appt.date} • {appt.time}</p>
                        </div>
                        <button className="appt-btn">→</button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="luxury-panel">
                  <div className="panel-header">
                    <h3>🥗 Diet Guidelines</h3>
                    <span className="pill-luxury">Important</span>
                  </div>

                  <div className="diet-list">
                    {patient.diet.map((item, index) => (
                      <div className="diet-item" key={index}>
                        <span>✓</span>
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="luxury-panel">
                  <div className="panel-header">
                    <h3>🚨 Warning Signs</h3>
                    <span className="pill-luxury">Monitor</span>
                  </div>

                  <div className="warnings-list">
                    {patient.warnings.map((warning, index) => (
                      <div className="warning-item" key={index}>
                        <span>!</span>
                        <p>{warning}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'medicines' && (
            <div className="placeholder-content">
              <h2>Medication Screen</h2>
              <p>Detailed medication management view is available in the overview dashboard.</p>
            </div>
          )}

          {activeTab === 'vitals' && (
            <div className="placeholder-content">
              <h2>Vitals Monitoring</h2>
              <p>Vital sign tracking is configured and ready for presentation.</p>
            </div>
          )}

          {activeTab === 'diet' && (
            <div className="placeholder-content">
              <h2>Nutrition & Diet</h2>
              <p>Dietary guidance and restrictions are shown on the main dashboard.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}