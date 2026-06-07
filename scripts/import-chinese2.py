"""匯入 Q51-100 到現有 P5 中國語文題庫"""
import json
from supabase import create_client

SUPABASE_URL = "https://azpvtdhqvfksefuwfueb.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cHZ0ZGhxdmZrc2VmdXdmdWViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM2MDk4MCwiZXhwIjoyMDk1OTM2OTgwfQ.8LgO3b-de_YKwgpnlNBTUhCuKi-6_ebjYSMAMLvbcLI"

supabase = create_client(SUPABASE_URL, SERVICE_KEY)

# Get existing bank
banks = supabase.table("quiz_banks").select("id,name").eq("name", "P5 中國語文").execute()
bank_id = banks.data[0]["id"]
print(f"✅ 找到題庫 '{banks.data[0]['name']}' (ID: {bank_id})")

# Load new questions
with open("/root/quiz-app/data/p5-chinese-q51-100.json") as f:
    questions = json.load(f)

count = 0
for q in questions:
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
    count += 1

# Verify total
total = supabase.table("questions").select("id", count="exact").eq("quiz_bank_id", bank_id).execute()

print(f"✅ 新匯入 {count} 題 (Q51-Q100)")
print(f"📊 P5 中國語文 現有總題數: {total.count}")
