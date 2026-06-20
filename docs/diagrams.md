# PrajaNavigator AI Diagrams
*Copy and paste these into a Mermaid live editor (like mermaid.live) or directly into markdown files that support Mermaid rendering. They can also be embedded directly in your GitHub README.*

## 1. Architecture Diagram
```mermaid
graph TD
    A[Citizen WhatsApp / Viber] -->|Text / Voice / Image| B(Intake & Triage Agent)
    B --> C{Intent Router}
    
    C -->|Query / Process| D(Hierarchical RAG Agent)
    D <--> E[(Vector DB - Statutes, Circulars, Reports)]
    
    C -->|Document Upload| F(Vision-Based Clerk Agent)
    F --> G[Multimodal LLM OCR]
    G --> H(Form Autofill Engine)
    H --> I[PDF Generator]
    I -->|Returns PDF| A
    
    C -->|Planning| J(Sequence Planner Agent)
    J -->|Checklist & Fees| A
    
    A -->|Feedback| K(Crowdsourced Loop Agent)
    K -->|Updates| E
```

## 2. Entity Relationship (ER) Diagram
```mermaid
erDiagram
    CITIZEN ||--o{ CASE : initiates
    CASE ||--|| SERVICE : targets
    CASE ||--o{ DOCUMENT : contains
    SERVICE ||--|| OFFICE : provided_by
    OFFICE ||--o{ OFFICER : staffed_by
    OFFICE ||--o{ CROWD_REPORT : receives
    CASE {
        string case_id PK
        string citizen_id FK
        string status
        datetime created_at
    }
    CITIZEN {
        string citizen_id PK
        string phone_number
        string preferred_language
    }
    SERVICE {
        string service_id PK
        string name
        string required_documents_json
        float base_fee
    }
    OFFICE {
        string office_id PK
        string district
        string location
    }
    DOCUMENT {
        string doc_id PK
        string type
        string status
        string ocr_extracted_data
    }
    CROWD_REPORT {
        string report_id PK
        string updated_rule
        int upvotes
    }
```

## 3. Use-Case Diagram
```mermaid
flowchart LR
    Citizen([Citizen])
    Admin([Gov Clerk Admin])

    subgraph PrajaNavigator AI
        UC1(Submit Request via Chat)
        UC2(Upload ID Photo)
        UC3(Receive Autofilled PDF Form)
        UC4(Get Step-by-step Visit Plan)
        UC5(Report Unwritten Rules / Feedback)
        UC6(Review Crowd Reports)
        UC7(Update Knowledge Base)
    end

    Citizen --- UC1
    Citizen --- UC2
    Citizen --- UC3
    Citizen --- UC4
    Citizen --- UC5
    
    Admin --- UC6
    Admin --- UC7
```
