# AGENTRIX26-TEAM21-QuadNova — PrajaNavigator AI

Autonomous, citizen-centric public administration intelligence layer designed to eliminate state administrative opacity, fragmented sequencing, and information asymmetry in Sri Lanka.

## Architecture & Technical Documentation
- 📘 **[Software Architecture Document (SAD)](docs/software-architecture-document.md)** — Complete 3-tier architecture, multi-agent engine, 3-layer hierarchical RAG, data models, ERD, and ADRs.
- 🔌 **[REST API Documentation](docs/api-documentation.md)** — Complete API endpoint specifications, request/response models, and usage examples.
- 📊 **[System Diagrams & Visual Models](docs/diagrams.md)** — Mermaid architectural diagrams, ER diagrams, and use case flows.
- 📝 **[Interim Submission Document](docs/interim-submission.md)** — Problem statement, target domain, and core AI innovations.

## Overview
This project contains a full-stack distributed system consisting of:
- **Backend (`/backend`)**: FastAPI (Python 3.11) ASGI application featuring a multi-agent orchestration pipeline, Gemini 2.5 Flash Multimodal OCR, 3-layer Hierarchical RAG with conflict resolution, and SQLAlchemy ORM persistence.
- **Citizen Frontend (`/frontend`)**: Responsive, multilingual (Sinhala, Tamil, English) React 19 single-page application built with Vite and Tailwind CSS.
- **Admin Frontend (`/admin-frontend`)**: Administrative management portal for government clerks to triage cases, schedule officer availability, and moderate crowdsourced ground reports.

## Getting Started

### Prerequisites
- Docker and Docker Compose (recommended for running the full stack)
- Node.js (v18+) and npm (for local frontend development)
- Python (v3.10+) (for local backend development)

### Running with Docker Compose
To build and start all 3 services concurrently:
```bash
docker-compose up --build
```
- **Citizen App:** `http://localhost:3000`
- **Admin Portal:** `http://localhost:5174`
- **FastAPI Backend & Swagger UI:** `http://localhost:8000/docs`

## Repository Structure
- `/admin-frontend`: Administrative portal for government clerks.
- `/backend`: FastAPI backend server, agentic pipelines, RAG modules, and database models.
- `/dataset`: Ground truth and complaint datasets.
- `/docs`: Technical architecture, API documentation, and system diagrams.
- `/frontend`: Citizen-facing web application.
- `/scripts`: Utility and automated testing scripts.

