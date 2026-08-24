# PrajaNavigator AI — REST API Documentation

---

## 1. Overview
The PrajaNavigator AI Backend provides a RESTful API built on **FastAPI (Python 3.11)**.
All endpoints are versioned and exposed under the `/api/v1` prefix.

- **Base URL (Local Development):** `http://localhost:8000/api/v1`
- **Interactive Swagger UI:** `http://localhost:8000/docs`
- **ReDoc UI:** `http://localhost:8000/redoc`

---

## 2. Authentication & Authorization
- Public citizen endpoints (Cases, AI Analysis, Services Directory, Office Directory) require no authorization tokens.
- Administrative endpoints (Status updates, report verification, service creation) use standard role-based access checks.

---

## 3. Endpoints Specification

### 3.1 Citizen Cases (`/api/v1/cases`)

#### 3.1.1 Create a Citizen Case
Initiates a new case, triages user intent, and generates initial clarification questions.

- **Method:** `POST`
- **Path:** `/api/v1/cases/`
- **Request Body (`application/json`):**
```json
{
  "fullName": "Pasindu Bandara",
  "district": "Colombo",
  "serviceNeed": "I need to cut down a large jak tree near my house in Colombo.",
  "address": "No. 12, Flower Road, Colombo 03",
  "language": "English"
}
```
- **Response (`201 Created`):**
```json
{
  "caseId": "CAS-8921",
  "citizenData": {
    "fullName": "Pasindu Bandara",
    "district": "Colombo",
    "description": "I need to cut down a large jak tree near my house in Colombo.",
    "detected_service": "Tree Felling Permit"
  },
  "status": "clarification",
  "questions": [
    {
      "id": "q1",
      "text": "Which district was your land deed / birth certificate issued in?",
      "options": ["Colombo", "Gampaha", "Kandy", "Galle", "Other"],
      "type": "select",
      "answered": false,
      "answer": null
    }
  ],
  "documents": [],
  "visitPlan": null,
  "requiredDocs": [],
  "formDetails": {
    "title": "Schedule II - Form A",
    "act": "Felling of Trees (Control) Act, No. 9 of 1951",
    "subtitle": "Application for Permission to Cut down or Remove a Jak, Breadfruit, or Palmyra Tree",
    "fieldLabel": "4. Species of Tree:",
    "fieldValue": "Jak Tree (Artocarpus heterophyllus)",
    "descLabel": "5. Description of land and reasons for the request:",
    "defaultDesc": "Requesting tree felling permit due to structural hazard"
  }
}
```

---

#### 3.1.2 Submit Follow-Up Answers
Submits citizen answers to follow-up questions and triggers RAG requirement analysis.

- **Method:** `POST`
- **Path:** `/api/v1/cases/answer`
- **Request Body (`application/json`):**
```json
{
  "caseId": "CAS-8921",
  "answers": {
    "q1": "Colombo",
    "q2": "Yes",
    "q3": "Yes",
    "q4": "Yes"
  }
}
```
- **Response (`200 OK`):**
Returns `CitizenCaseFullStateResponse` with `status: "upload"` and dynamic `requiredDocs` list.

---

#### 3.1.3 Upload Case Document (OCR Extraction)
Uploads an identity document (NIC, Land Deed, Birth Certificate) and executes Gemini Vision OCR entity extraction.

- **Method:** `POST`
- **Path:** `/api/v1/cases/{case_id}/upload`
- **Request:** `multipart/form-data` with form field `file`.
- **Response (`200 OK`):**
```json
{
  "success": true,
  "case": {
    "caseId": "CAS-8921",
    "citizenData": {
      "fullName": "Pasindu Bandara",
      "extractedDetails": {
        "fullName": "Pasindu Bandara",
        "nicNumber": "199512345678",
        "dob": "1995-05-12",
        "gender": "Male",
        "address": "No. 12, Flower Road, Colombo 03",
        "district": "Colombo",
        "landDeedNo": "LD-88421-2023",
        "landOwner": "Pasindu Bandara"
      }
    },
    "documents": [
      {
        "name": "nic_front.jpg",
        "status": "success",
        "url": "/uploads/CAS-8921_nic_front.jpg"
      }
    ]
  }
}
```

---

#### 3.1.4 Delete Case Document
Deletes an uploaded document from the case session.

- **Method:** `DELETE`
- **Path:** `/api/v1/cases/{case_id}/document?filename=nic_front.jpg`
- **Response (`200 OK`):** Updated case state.

---

#### 3.1.5 Get Case Composite State
Retrieves the full case state.

- **Method:** `GET`
- **Path:** `/api/v1/cases/{case_id}`
- **Response (`200 OK`):** `CitizenCaseFullStateResponse`

---

#### 3.1.6 List All Cases (Admin)
- **Method:** `GET`
- **Path:** `/api/v1/cases/`
- **Response (`200 OK`):** `List[CitizenCaseResponse]`

---

#### 3.1.7 Update Case Status (Admin)
- **Method:** `PATCH`
- **Path:** `/api/v1/cases/{case_id}/status`
- **Request Body (`application/json`):**
```json
{
  "status": "resolved"
}
```
- **Response (`200 OK`):** `CitizenCaseResponse`

---

### 3.2 AI Reasoning & Chatbot (`/api/v1/ai`)

#### 3.2.1 Run AI Full Analysis & Sequence Plan
Triggers 3-layer Hierarchical RAG, matches local divisional officers and counter hours, computes VisitGuard score, and synthesizes form metadata.

- **Method:** `POST`
- **Path:** `/api/v1/ai/analyze`
- **Request Body (`application/json`):**
```json
{
  "case_id": "CAS-8921"
}
```
- **Response (`200 OK`):**
```json
{
  "caseId": "CAS-8921",
  "status": "plan",
  "visitPlan": {
    "score": 88,
    "riskLevel": "Ready",
    "officeName": "Colombo Divisional Secretariat Office",
    "roomCounter": "Room 14, Environment & Land Branch (Counter 4)",
    "officerName": "Mr. K. A. Perera (Assistant Divisional Secretary)",
    "availableHours": "9:00 AM - 1:00 PM (Tuesdays and Wednesdays)",
    "timeline": [
      {
        "step": 1,
        "title": "Reception Validation",
        "description": "Present VisitGuard QR code at main reception desk.",
        "status": "ready"
      },
      {
        "step": 2,
        "title": "Document Submission",
        "description": "Submit application at Room 14 (Counter 4) to Mr. K. A. Perera.",
        "status": "ready"
      },
      {
        "step": 3,
        "title": "Fee Payment",
        "description": "Pay statutory fee of LKR 750 at cashier counter.",
        "status": "pending"
      }
    ],
    "checklist": {
      "verified": ["National Identity Card (NIC) - OCR Verified", "Land Deed Copy - Attached"],
      "missing": ["Processing Fee of LKR 750 (Cash)"],
      "talkingPoints": [
        "I am applying for a Tree Felling Permit under the Felling of Trees Act No. 9 of 1951.",
        "I have attached my verified Land Deed (LD-88421-2023) and GN inspection report."
      ]
    }
  }
}
```

---

#### 3.2.2 Clarification Assistant Chatbot
Context-grounded assistant that answers citizen queries strictly using retrieved RAG knowledge chunks.

- **Method:** `POST`
- **Path:** `/api/v1/ai/chat`
- **Request Body (`application/json`):**
```json
{
  "message": "Can I submit my tree felling permit application on Thursday in Colombo?",
  "case_id": "CAS-8921"
}
```
- **Response (`200 OK`):**
```json
{
  "response": "In Colombo Divisional Secretariat Office, the Environment & Land Branch officer (Mr. K. A. Perera) is available on Tuesdays and Wednesdays from 9:00 AM to 1:00 PM. Applications are not accepted for this branch on Thursdays."
}
```

---

### 3.3 Public Services & Offices Directory (`/api/v1/services`, `/api/v1/offices`, `/api/v1/officers`)

#### 3.3.1 Get All Services
- **Method:** `GET`
- **Path:** `/api/v1/services/`
- **Response (`200 OK`):** `List[ServiceResponse]`

#### 3.3.2 Create Service (Admin)
- **Method:** `POST`
- **Path:** `/api/v1/services/`
- **Request Body:** `ServiceCreate`

#### 3.3.3 Get All Offices
- **Method:** `GET`
- **Path:** `/api/v1/offices/`
- **Response (`200 OK`):** `List[OfficeResponse]`

#### 3.3.4 Get All Officers
- **Method:** `GET`
- **Path:** `/api/v1/officers/`
- **Response (`200 OK`):** `List[OfficerResponse]`

---

### 3.4 Crowdsourced Ground Reports (`/api/v1/crowd-reports`)

#### 3.4.1 Submit Ground Report / Community Tip
- **Method:** `POST`
- **Path:** `/api/v1/crowd-reports`
- **Request Body (`application/json`):**
```json
{
  "case_id": "CAS-8921",
  "office": "Colombo Divisional Secretariat Office",
  "counter": "Counter 4",
  "friction_tags": ["Long Queue", "Exact Cash Required"],
  "comments": "Ensure you bring exact change of 750 LKR as the cashier counter does not have change for 5000 LKR notes."
}
```
- **Response (`201 Created`):** `CrowdReportResponse` (with `verification_status: "Pending"`).

---

#### 3.4.2 Verify or Reject Crowd Report (Admin)
- **Method:** `PATCH`
- **Path:** `/api/v1/crowd-reports/{report_id}/verify`
- **Request Body (`application/json`):**
```json
{
  "verification_status": "Verified"
}
```
- **Response (`200 OK`):** `CrowdReportResponse`

---

### 3.5 Admin Dashboard Analytics (`/api/v1/admin`)

#### 3.5.1 Get Dashboard Statistics
- **Method:** `GET`
- **Path:** `/api/v1/admin/stats`
- **Response (`200 OK`):**
```json
{
  "total_cases": 142,
  "high_risk_cases": 18,
  "pending_cases": 45,
  "verified_reports": 63,
  "most_requested_service": "Tree Felling Permit"
}
```

---
*PrajaNavigator AI — API Documentation Reference*
