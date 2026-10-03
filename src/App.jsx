<section className="input-section">
  <div className="section-header">
    <div>
      <h3>Patient Details & Verification</h3>
      <p>
        Verify the patient's information before creating the
        post-discharge care plan.
      </p>
    </div>

    <span className="pill pill-teal">
      Verification
    </span>
  </div>

  <div className="patient-form">

    {/* Patient details */}
    <div className="form-section">
      <div className="form-section-title">
        <h4>Patient details</h4>
        <span>Required information</span>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="patientName">Patient name</label>
          <input
            id="patientName"
            type="text"
            placeholder="Patient name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            placeholder="Age"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="diagnosis">Diagnosis</label>
        <input
          id="diagnosis"
          type="text"
          placeholder="Primary diagnosis"
        />
      </div>

      <div className="form-group">
        <label htmlFor="allergies">Allergies</label>
        <input
          id="allergies"
          type="text"
          placeholder="Known allergies"
        />
      </div>
    </div>

    {/* Clinical information */}
    <div className="form-section">
      <div className="form-section-title">
        <h4>Clinical information</h4>
        <span>Used to build the care plan</span>
      </div>

      <div className="form-group">
        <label htmlFor="medications">
          Medication history
        </label>

        <textarea
          id="medications"
          placeholder="Enter current medications..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="discharge">
          Discharge summary
        </label>

        <textarea
          id="discharge"
          placeholder="Paste or enter the discharge instructions..."
        />

        <p className="form-helper">
          The system organizes the provided instructions into a
          clear post-discharge care plan.
        </p>
      </div>
    </div>

  </div>
</section>