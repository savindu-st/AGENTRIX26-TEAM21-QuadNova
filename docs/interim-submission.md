# Interim Submission: PrajaNavigator AI

## 1. Problem Statement
Accessing public services in Sri Lanka (NIC renewals, business registrations, passport applications) presents an immense barrier due to acute information asymmetry and fragmented sequencing. The specific constraints, precise fees, and exact required documentation are rarely consolidated online, leading to citizens undergoing multiple physical visits to Divisional Secretariats. For rural and low-income populations, this administrative opacity results in debilitating transit costs, lost daily wages, and extreme systemic frustration.

## 2. Chosen Domain
**Government & Citizen Services**

## 3. Solution Outline
**PrajaNavigator AI** is an autonomous, citizen-centric intelligence layer that abstracts away the complexity of state bureaucracy. It acts as an omnichannel platform (via WhatsApp/Viber) that provides an interactive, end-to-end operational roadmap and localized document execution capability. 
Key features:
- **Information Gap Elimination:** Synthesizes legislation, circulars, and crowdsourced feedback into a single source of truth.
- **Pre-Counter Validation:** Validates citizen eligibility and reviews visual paper document prerequisites prior to any physical travel.
- **Automated Form Pipeline:** Ingests personal identifiers from physical IDs to flawlessly populate official government applications into print-ready PDFs.

## 4. How We Are Applying AI
- **Multimodal Vision LLMs (OCR):** Extracts and standardizes text from smartphone photos of user documents (NIC, passports) across multi-language scripts.
- **Hierarchical RAG (Retrieval-Augmented Generation):** Navigates contradictory rule-sets by querying a prioritized vector database (Layer 1: Central Acts, Layer 2: Circulars, Layer 3: Crowdsourced Counter Updates).
- **LangGraph Multi-Agent Architecture:** Utilizes specialized agents—Intake & Triage Agent for NLP intent detection, Vision-Based Clerk for document verification, and a Sequence Planner to compile chronological checklists dynamically.
