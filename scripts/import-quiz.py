"""
匯入題庫 JSON 到 Supabase

用法:
  python3 scripts/import-quiz.py path/to/quiz.json "題庫名稱"

需要設定環境變數 SUPABASE_SERVICE_KEY（可在 Supabase Dashboard → Settings → API 找到 service_role key）
"""

import os, sys, json
from supabase import create_client

SUPABASE_URL = "https://azpvtdhqvfksefuwfueb.supabase.co"

def main():
    if len(sys.argv) < 3:
        print("用法: python3 scripts/import-quiz.py <json_file> <quiz_bank_name>")
        sys.exit(1)

    json_path = sys.argv[1]
    bank_name = sys.argv[2]
    service_key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not service_key:
        print("請設定 SUPABASE_SERVICE_KEY 環境變數")
        sys.exit(1)

    with open(json_path) as f:
        data = json.load(f)

    supabase = create_client(SUPABASE_URL, service_key)

    # Create quiz bank
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

        options_data = []
        for i, opt in enumerate(q["answerOptions"]):
            options_data.append({
                "question_id": qid,
                "text": opt["text"],
                "rationale": opt.get("rationale", ""),
                "is_correct": opt["isCorrect"],
                "sort_order": i,
            })

        supabase.table("answer_options").insert(options_data).execute()

    print(f"✅ 共匯入 {len(data['questions'])} 題到 '{bank_name}'")

if __name__ == "__main__":
    main()
