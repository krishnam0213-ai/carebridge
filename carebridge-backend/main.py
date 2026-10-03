from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

app = FastAPI(
    title="CareBridge Backend",
    version="1.0.0"
)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# DATA MODELS
# ============================================================

class PatientFormInput(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        description="Patient full name"
    )
    age: int = Field(
        ...,
        ge=1,
        le=120,
        description="Patient age"
    )
    diagnosis: str = Field(
        ...,
        min_length=1,
        description="Patient diagnosis"
    )
    allergies: Optional[str] = Field(
        default="",
        description="Known allergies"
    )
    medicationHistory: Optional[str] = Field(
        default="",
        description="Previous medications"
    )
    room: str = Field(
        ...,
        min_length=1,
        description="Room number"
    )
    dischargeSummary: str = Field(
        ...,
        min_length=1,
        description="Hospital discharge notes"
    )


class Medicine(BaseModel):
    name: str
    dose: str
    time: str
    info: str
    type: str = "oral"


class FollowUp(BaseModel):
    name: str
    date: str
    time: str


class CarePlan(BaseModel):
    name: str
    age: int
    diagnosis: str
    dischargeDate: str
    room: str
    risk: str
    status: str
    vitals: dict
    medicines: List[Medicine]
    reminders: List[str]
    diet: List[str]
    warnings: List[str]
    followups: List[FollowUp]
    alerts: List[str]


class VerificationResponse(BaseModel):
    valid: bool
    errors: List[str]
    warnings: List[str]
    message: str


class CarePlanResponse(BaseModel):
    success: bool
    data: Optional[CarePlan] = None
    errors: List[str] = Field(default_factory=list)


# ============================================================
# VERIFICATION
# ============================================================

def verify_patient_details(
    form: PatientFormInput
) -> VerificationResponse:

    errors = []
    warnings = []

    # Name
    if not form.name or len(form.name.strip()) < 2:
        errors.append(
            "Patient name must be at least 2 characters long."
        )

    # Age
    if form.age < 1 or form.age > 120:
        errors.append(
            "Age must be between 1 and 120."
        )

    # Diagnosis
    if not form.diagnosis or len(form.diagnosis.strip()) < 3:
        errors.append(
            "Diagnosis must be at least 3 characters long."
        )

    # Room
    if not form.room or len(form.room.strip()) < 1:
        errors.append(
            "Room number is required."
        )

    # Discharge summary
    if (
        not form.dischargeSummary
        or len(form.dischargeSummary.strip()) < 10
    ):
        errors.append(
            "Discharge summary must be at least 10 characters long."
        )

    # Allergy warning
    if form.allergies and form.allergies.strip():
        warnings.append(
            f"⚠️ Allergies noted: {form.allergies}"
        )

    # Medication history warning
    if (
        form.medicationHistory
        and form.medicationHistory.strip()
    ):
        if len(form.medicationHistory) > 200:
            warnings.append(
                "📋 Medication history is extensive. "
                "Verify for drug interactions."
            )

        warnings.append(
            f"💊 Previous medications: "
            f"{form.medicationHistory}"
        )

    # Critical keywords
    critical_keywords = [
        "critical",
        "urgent",
        "emergency",
        "high risk"
    ]

    summary_lower = form.dischargeSummary.lower()

    for keyword in critical_keywords:
        if keyword in summary_lower:
            warnings.append(
                f"🚨 Critical indicator found: "
                f"'{keyword}'. Extra monitoring recommended."
            )

    valid = len(errors) == 0

    message = (
        "✅ All details verified successfully!"
        if valid
        else
        "❌ Verification failed. Please correct the errors."
    )

    return VerificationResponse(
        valid=valid,
        errors=errors,
        warnings=warnings,
        message=message
    )


# ============================================================
# CARE PLAN GENERATOR
# ============================================================

def generate_care_plan(
    form: PatientFormInput
) -> CarePlan:

    summary_lower = form.dischargeSummary.lower()

    # --------------------------------------------------------
    # MEDICINES
    # --------------------------------------------------------

    medicines = []

    medicine_keywords = {
        "metformin": {
            "name": "Metformin",
            "dose": "500 mg",
            "time": "Morning",
            "info": "Take after food"
        },
        "lisinopril": {
            "name": "Lisinopril",
            "dose": "10 mg",
            "time": "Night",
            "info": "Monitor blood pressure"
        },
        "aspirin": {
            "name": "Aspirin",
            "dose": "75 mg",
            "time": "Morning",
            "info": "Take with water"
        },
        "paracetamol": {
            "name": "Paracetamol",
            "dose": "500 mg",
            "time": "As needed",
            "info": "For pain/fever"
        },
        "amoxicillin": {
            "name": "Amoxicillin",
            "dose": "500 mg",
            "time": "3x Daily",
            "info": "Complete the course"
        },
        "ibuprofen": {
            "name": "Ibuprofen",
            "dose": "200 mg",
            "time": "As needed",
            "info": "For pain/inflammation"
        },
        "atorvastatin": {
            "name": "Atorvastatin",
            "dose": "20 mg",
            "time": "Night",
            "info": "For cholesterol"
        },
        "omeprazole": {
            "name": "Omeprazole",
            "dose": "20 mg",
            "time": "Morning",
            "info": "Before breakfast"
        }
    }

    for keyword, med_info in medicine_keywords.items():
        if keyword in summary_lower:
            medicines.append(
                Medicine(
                    **med_info,
                    type="oral"
                )
            )

    # Do not invent medicines when none are present.
    if not medicines:
        medicines = []

    # --------------------------------------------------------
    # DIET
    # --------------------------------------------------------

    diet = []

    diet_keywords = {
        "salt": "Limit salt intake",
        "sugar": "Limit sugar and sweets",
        "fried": "Avoid fried and oily food",
        "oil": "Reduce oil consumption",
        "spicy": "Avoid spicy food",
        "alcohol": "Avoid alcohol completely",
        "fatty": "Avoid fatty foods",
        "caffeine": "Reduce caffeine intake"
    }

    for keyword, diet_item in diet_keywords.items():
        if keyword in summary_lower:
            diet.append(diet_item)

    if not diet:
        diet = [
            "Eat balanced meals",
            "Stay hydrated",
            "Avoid processed foods"
        ]

    # --------------------------------------------------------
    # WARNING SIGNS
    # --------------------------------------------------------

    warnings = []

    warning_keywords = {
        "chest pain": "Chest pain or discomfort",
        "shortness of breath": "Shortness of breath",
        "dizziness": "Severe dizziness or fainting",
        "fever": "Uncontrolled fever above 101°F",
        "bleeding": "Excessive or unusual bleeding",
        "headache": "Severe headache",
        "nausea": "Severe nausea or vomiting",
        "swelling": "Unusual swelling or redness"
    }

    for keyword, warning_item in warning_keywords.items():
        if keyword in summary_lower:
            warnings.append(warning_item)

    if not warnings:
        warnings = [
            "Chest pain or discomfort",
            "Shortness of breath",
            "Severe dizziness"
        ]

    # --------------------------------------------------------
    # REMINDERS
    # --------------------------------------------------------

    reminders = [
        "💊 Take medicines on time as prescribed.",
        "💧 Drink enough water daily.",
        "📊 Monitor vital signs regularly."
    ]

    if "blood pressure" in summary_lower:
        reminders.append(
            "🩸 Check blood pressure daily at the same time."
        )

    if (
        "diabetes" in summary_lower
        or "sugar" in summary_lower
    ):
        reminders.append(
            "🔬 Monitor blood glucose levels as instructed."
        )

    if (
        "cardiologist" in summary_lower
        or "heart" in summary_lower
    ):
        reminders.append(
            "📅 Follow up with cardiologist as scheduled."
        )

    if (
        "surgery" in summary_lower
        or "wound" in summary_lower
    ):
        reminders.append(
            "🩹 Keep wound clean and dry. "
            "Watch for signs of infection."
        )

    # --------------------------------------------------------
    # ALERTS
    # --------------------------------------------------------

    alerts = []

    if form.age > 65:
        alerts.append(
            "👴 Senior patient: Enhanced monitoring recommended."
        )

    if len(medicines) > 3:
        alerts.append(
            "💊 Multiple medications detected: "
            "Check for drug interactions."
        )

    if (
        "critical" in summary_lower
        or "high risk" in summary_lower
    ):
        alerts.append(
            "🚨 High-risk indicator detected. "
            "Follow the treating team's instructions."
        )

    if form.allergies:
        alerts.append(
            f"⚠️ Known allergies: {form.allergies}"
        )

    if not alerts:
        alerts = [
            "✓ Regular monitoring recommended",
            "✓ Follow discharge instructions carefully"
        ]

    # --------------------------------------------------------
    # FOLLOW-UPS
    # --------------------------------------------------------

    followups = [
        FollowUp(
            name="General Checkup",
            date="10 days post-discharge",
            time="10:00 AM"
        )
    ]

    if (
        "cardiologist" in summary_lower
        or "heart" in summary_lower
    ):
        followups.append(
            FollowUp(
                name="Cardiology Follow-up",
                date="15 days post-discharge",
                time="2:00 PM"
            )
        )

    if (
        "diabetes" in summary_lower
        or "sugar" in summary_lower
    ):
        followups.append(
            FollowUp(
                name="Diabetes Management",
                date="14 days post-discharge",
                time="11:00 AM"
            )
        )

    if (
        "orthopedic" in summary_lower
        or "fracture" in summary_lower
    ):
        followups.append(
            FollowUp(
                name="Orthopedic Review",
                date="21 days post-discharge",
                time="3:00 PM"
            )
        )

    # --------------------------------------------------------
    # RISK
    # --------------------------------------------------------

    risk = "Low"

    if form.age > 65 or len(medicines) > 3:
        risk = "Moderate"

    if (
        "critical" in summary_lower
        or "high risk" in summary_lower
        or form.age > 80
    ):
        risk = "High"

    # --------------------------------------------------------
    # CARE PLAN
    # --------------------------------------------------------

    care_plan = CarePlan(
        name=form.name,
        age=form.age,
        diagnosis=form.diagnosis,
        dischargeDate=datetime.now().strftime("%d %b %Y"),
        room=form.room,
        risk=risk,
        status="Stable",

        # Demo values only.
        # Replace with actual vitals from your medical data source.
        vitals={
            "bp": "Not provided",
            "hr": "Not provided",
            "temp": "Not provided",
            "o2": "Not provided"
        },

        medicines=medicines,
        reminders=reminders,
        diet=diet,
        warnings=warnings,
        followups=followups,
        alerts=alerts
    )

    return care_plan


# ============================================================
# API ENDPOINTS
# ============================================================

@app.get("/")
def read_root():

    return {
        "message": "🏥 CareBridge Backend API",
        "version": "1.0.0",
        "status": "Running ✅",
        "endpoints": {
            "verify": "POST /verify",
            "generate": "POST /generate",
            "verify_and_generate": "POST /verify-and-generate",
            "health": "GET /health"
        }
    }


@app.get("/health")
def health_check():

    return {
        "status": "healthy ✅",
        "timestamp": datetime.now().isoformat()
    }


@app.post(
    "/verify",
    response_model=VerificationResponse
)
def verify_patient(form: PatientFormInput):

    try:
        return verify_patient_details(form)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Verification error: {str(e)}"
        )


@app.post(
    "/generate",
    response_model=CarePlanResponse
)
def generate_plan(form: PatientFormInput):

    try:

        # Verify first
        verification = verify_patient_details(form)

        if not verification.valid:
            return CarePlanResponse(
                success=False,
                data=None,
                errors=verification.errors
            )

        # Generate care plan
        care_plan = generate_care_plan(form)

        return CarePlanResponse(
            success=True,
            data=care_plan,
            errors=[]
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Generation error: {str(e)}"
        )


@app.post(
    "/verify-and-generate",
    response_model=CarePlanResponse
)
def verify_and_generate(form: PatientFormInput):

    return generate_plan(form)


# ============================================================
# GLOBAL ERROR HANDLER
# ============================================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):

    return {
        "success": False,
        "error": str(exc),
        "timestamp": datetime.now().isoformat()
    }


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )