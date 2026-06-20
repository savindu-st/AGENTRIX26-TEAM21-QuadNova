import os
import sys
import csv
import logging

# Ensure project root is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.rag.knowledge_loader import build_rag_index
from backend.app.rag.retriever import retrieve_chunks
from backend.app.rag.source_ranker import rank_sources

# Configure logging
logging.basicConfig(level=logging.WARNING)

# 1. Define customer complaints / use cases
complaints = [
    "I have a large jack tree in my backyard that is leaning towards the roof. How do I get a permit to cut it down?",
    "My NIC is damaged and some numbers are faded. Oka renew karaganne kohomada? What documents should I bring to the divisional secretariat?",
    "I need to renew my bike's revenue license online but the system says my eco-test is missing. Can I do it physically at the office?",
    "There is a spelling mistake in my father's name on my birth certificate. How can I fix this before applying for my passport?",
    "I am starting a small software consulting business from home. Do I need to register it at the Pradeshiya Sabha or the Divisional Secretariat?",
    "I need an urgent passport via the one-day service. Can I walk into the main office tomorrow, and what is the current fee?",
    "My grandmother wants to transfer her land deed to my name. What is the step-by-step process and who needs to sign the papers first?",
    "Can you look at my ID and fill out the application form for a passport for me?",
    "Which counter should I go to at the Divisional Secretariat to submit my elderly mother's monthly assistance documents?",
    "I want to apply for a permit, but I don't know my local Grama Niladhari division name or number. How do I find it?"
]

def main():
    # 2. Create the dataset folder
    dataset_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataset")
    os.makedirs(dataset_dir, exist_ok=True)
    print(f"Created folder: {dataset_dir}")
    
    # Save the input complaints inside the dataset folder
    complaints_file = os.path.join(dataset_dir, "complaints.txt")
    with open(complaints_file, "w", encoding="utf-8") as f:
        for idx, item in enumerate(complaints, 1):
            f.write(f"{idx}. {item}\n")
    print(f"Stored 10 complaints in {complaints_file}")
    
    # 3. Build RAG Index
    build_rag_index()
    
    # 4. Process queries and collect output
    output_rows = []
    
    for q in complaints:
        # Retrieve and rank
        chunks = retrieve_chunks(q, limit=3)
        result = rank_sources(chunks)
        
        # Flatten lists for CSV cells
        official = " | ".join(result["official_rules"]).replace("\n", " ")
        district = " | ".join(result["district_notes"]).replace("\n", " ")
        suggestions = " | ".join([s["message"] + f" ({s['suggestion']})" for s in result["suggestions"]])
        contradictions = " | ".join(result["contradictions"])
        needs_verification = "YES" if result["needs_verification"] else "NO"
        
        output_rows.append({
            "Complaint_Use_Case": q,
            "Official_Rules": official,
            "District_Circulars": district,
            "Community_Suggestions": suggestions,
            "Contradictions_Found": contradictions,
            "Needs_Verification": needs_verification
        })
        
    # 5. Save to output.csv
    csv_file = os.path.join(dataset_dir, "output.csv")
    fields = ["Complaint_Use_Case", "Official_Rules", "District_Circulars", "Community_Suggestions", "Contradictions_Found", "Needs_Verification"]
    
    with open(csv_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(output_rows)
        
    print(f"Successfully processed all use cases and saved output to {csv_file}")


if __name__ == "__main__":
    main()
