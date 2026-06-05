"""
匯入題庫 JSON 到 Supabase
"""
import json, sys
from supabase import create_client

SUPABASE_URL = "https://azpvtdhqvfksefuwfueb.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cHZ0ZGhxdmZrc2VmdXdmdWViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM2MDk4MCwiZXhwIjoyMDk1OTM2OTgwfQ.8LgO3b-de_YKwgpnlNBTUhCuKi-6_ebjYSMAMLvbcLI"

supabase = create_client(SUPABASE_URL, SERVICE_KEY)

# Load JSON
with open("/root/.hermes/cache/documents/doc_436a99cda925_gemini-code-1780367644380.json") as f:
    data = json.load(f)

# Create quiz bank
bank_name = "P5 通識科學題庫 01"
bank = supabase.table("quiz_banks").insert({"name": bank_name}).execute()
bank_id = bank.data[0]["id"]
print(f"✅ 題庫 '{bank_name}' 已建立 (ID: {bank_id})")

for q in data["questions"]:
    question = supabase.table("questions").insert({
        "quiz_bank_id": bank_id,
        "question_number": q["questionNumber"],
        "question_text": q["question"],
        "hint": q.get("hint", ""),
    }).execute()
    qid = question.data[0]["id"]

    opts = []
    for i, opt in enumerate(q["answerOptions"]):
        opts.append({
            "question_id": qid,
            "text": opt["text"],
            "rationale": opt.get("rationale", ""),
            "is_correct": opt["isCorrect"],
            "sort_order": i,
        })
    supabase.table("answer_options").insert(opts).execute()

print(f"✅ 共匯入 {len(data['questions'])} 題到 '{bank_name}'")
