from flask import Blueprint, jsonify, request
from db.store import get_store
import os
import re

learning_bp = Blueprint('learning', __name__, url_prefix='/api/learning')
db = get_store()

# Helper to get current user_id
def get_current_user():
    return os.getenv("INVESTIQ_DEFAULT_USER_ID", "local-user")

@learning_bp.route('/lessons', methods=['GET'])
def get_lessons():
    user_id = get_current_user()
    lessons = db.list_lessons(user_id)
    return jsonify(lessons)

@learning_bp.route('/lessons/<lesson_id>', methods=['GET'])
def get_lesson(lesson_id):
    lesson = db.get_lesson_with_quiz(lesson_id)
    if not lesson:
        return jsonify({"error": "Lesson not found"}), 404
    return jsonify(lesson)

@learning_bp.route('/lessons/<lesson_id>/complete', methods=['POST'])
def complete_lesson(lesson_id):
    user_id = get_current_user()
    db.update_learning_progress(user_id, lesson_id, 'watched')
    return jsonify({"status": "success", "message": "Lesson marked as watched"})

@learning_bp.route('/lessons/<lesson_id>/quiz', methods=['POST'])
def submit_quiz(lesson_id):
    user_id = get_current_user()
    data = request.json
    score = data.get('score')
    
    if score is None:
        return jsonify({"error": "Score is required"}), 400
        
    db.update_learning_progress(user_id, lesson_id, 'quiz_completed', score)
    return jsonify({"status": "success", "score": score})

@learning_bp.route('/final-assessment/questions', methods=['GET'])
def get_final_questions():
    questions = db.get_final_assessment_questions()
    return jsonify(questions)

@learning_bp.route('/final-assessment/submit', methods=['POST'])
def submit_final_assessment():
    user_id = get_current_user()
    data = request.json
    score = data.get('score')
    total = data.get('total')
    
    if score is None or total is None:
        return jsonify({"error": "Score and total are required"}), 400
        
    assessment_id = db.save_final_assessment_result(user_id, score, total)
    return jsonify({"status": "success", "assessment_id": assessment_id, "score": score, "total": total})

# --- Full Curriculum Reset & Universal Synchronization ---
def seed_data():
    print(">>> SEEDING LEARNING DATA...")
    # 1. PURGE EXISTING DATA TO PREVENT ID FRAGMENTATION
    db.clear_all_learning_data()
    print(">>> CLEARED OLD DATA")

    # 2. DEFINITIVE 20-MODULE PROFESSIONAL TRACK (HIGHLY PERMISSIVE IDS)
    import uuid
    lessons = []
    raw_lessons = [
        # Module 1: Core Fundamentals
        {"title": "Stock Market Fundamentals", "description": "How companies go public and how shares are traded.", "video_url": "https://www.youtube.com/embed/p7HKvqRI_Bo", "duration": "05:12", "order_index": 1, "difficulty": "Beginner"},
        {"title": "Bulls, Bears & Market Cycles", "description": "Understanding the psychology behind market movements.", "video_url": "https://www.youtube.com/embed/aewFn8E5Vm4", "duration": "07:44", "order_index": 2, "difficulty": "Beginner"},
        {"title": "Price and Market Cap", "description": "Calculating the total value of a public company.", "video_url": "https://www.youtube.com/embed/Qjz90llPLi0", "duration": "04:30", "order_index": 3, "difficulty": "Beginner"},
        {"title": "Stocks vs Bonds", "description": "Equity vs Debt: which one suits your portfolio strategy?", "video_url": "https://www.youtube.com/embed/W3_qob_q3oU", "duration": "06:20", "order_index": 4, "difficulty": "Beginner"},
        # Module 2: Financial Analysis
        {"title": "The Balance Sheet Guide", "description": "Assets, Liabilities, and Equity explained professionally.", "video_url": "https://www.youtube.com/embed/_VS4ni14JHs", "duration": "14:15", "order_index": 5, "difficulty": "Intermediate"},
        {"title": "Income Statement Deep-Dive", "description": "Analyzing revenue, margins, and bottom-line profit.", "video_url": "https://www.youtube.com/embed/lkCI26OBNnQ", "duration": "12:40", "order_index": 6, "difficulty": "Intermediate"},
        {"title": "Mechanism of Short Selling", "description": "How professional traders profit from downward price action.", "video_url": "https://www.youtube.com/embed/AVXW95MyD54", "duration": "05:15", "order_index": 7, "difficulty": "Intermediate"},
        {"title": "Call and Put Options", "description": "Introduction to leveraged derivative instruments.", "video_url": "https://www.youtube.com/embed/_72kuJ9WuX8", "duration": "09:30", "order_index": 8, "difficulty": "Intermediate"},
        # Module 3: Technical Mastery
        {"title": "Stock Dilution Factors", "description": "Understanding how share issuance affects your ownership value.", "video_url": "https://www.youtube.com/embed/yBWPxUY_VrM", "duration": "08:30", "order_index": 9, "difficulty": "Advanced"},
        {"title": "Global Macro Factors", "description": "How interest rates and inflation drive the broad market.", "video_url": "https://www.youtube.com/embed/RmZPZd3s4VI", "duration": "30:00", "order_index": 10, "difficulty": "Advanced"},
        {"title": "Earnings & EPS Analysis", "description": "Calculating profitability metrics for stock comparison.", "video_url": "https://www.youtube.com/embed/VF9Fi3iZTzI", "duration": "08:05", "order_index": 11, "difficulty": "Advanced"},
        {"title": "Mutual Funds & Indices", "description": "Broad market exposure vs individual stock picking.", "video_url": "https://www.youtube.com/embed/FrjPj98csxw", "duration": "06:45", "order_index": 12, "difficulty": "Advanced"},
        # Module 4: Execution (Buy/Sell)
        {"title": "How to Buy Your First Stock", "description": "Mastering the mechanics of terminal trade execution.", "video_url": "https://www.youtube.com/embed/eN7Z0dplYcM", "duration": "07:20", "order_index": 13, "difficulty": "Intermediate"},
        {"title": "When to Sell: Profit Targets", "description": "Developing an exit strategy to lock in capital gains.", "video_url": "https://www.youtube.com/embed/jGabQmZmjlg", "duration": "08:50", "order_index": 14, "difficulty": "Beginner"},
        {"title": "The Art of Stop-Loss", "description": "Essential risk protocols for capital preservation.", "video_url": "https://www.youtube.com/embed/k52ePjHqK88", "duration": "09:15", "order_index": 15, "difficulty": "Intermediate"},
        {"title": "Diversification Strategy", "description": "Reducing risk by optimizing asset allocation.", "video_url": "https://www.youtube.com/embed/qY-xgy_kl78", "duration": "06:40", "order_index": 16, "difficulty": "Beginner"},
        # Module 5: Strategy & Risk
        {"title": "VIX & Volatility Mastery", "description": "Using market fear indices to time your strategies.", "video_url": "https://www.youtube.com/embed/t8y4yx4fs4w", "duration": "11:30", "order_index": 17, "difficulty": "Advanced"},
        {"title": "Income Statement Intro", "description": "High-level overview of corporate revenue reporting.", "video_url": "https://www.youtube.com/embed/x6qdKGnWE0w", "duration": "10:15", "order_index": 18, "difficulty": "Advanced"},
        {"title": "Balance Sheet Deep-Dive", "description": "Analyzing liabilities and longterm equity growth.", "video_url": "https://www.youtube.com/embed/fB_8BhLSuEM", "duration": "08:45", "order_index": 19, "difficulty": "Intermediate"},
        {"title": "Golden Rules of Investing", "description": "Final principles for generational wealth building.", "video_url": "https://www.youtube.com/embed/xnWlim0QaJo", "duration": "14:20", "order_index": 20, "difficulty": "Master"}
    ]
    for l in raw_lessons:
        l["id"] = str(uuid.uuid4())
        lessons.append(l)
    
    # 3. ROBUST THUMBNAIL PARSING (Strips IDs safely)
    for l in lessons:
        raw_id = l["video_url"].split("/")[-1]
        v_id = re.split(r'[?\u0026]', raw_id)[0]  # Strip parameters
        # Use the standard YT image domain for better compatibility (i.ytimg.com)
        # removing the cache buster ?v=... which YT servers often reject
        l["thumbnail_url"] = f"https://i.ytimg.com/vi/{v_id}/hqdefault.jpg" 
    
    db.set_lessons(lessons)
    
    # 4. RESET QUIZZES (Fully Synced with 20 Modules)
    for l in lessons:
        db.set_quizzes(l["id"], [
            {
                "question": f"In '{l['title']}', what is the primary indicator of professional success?",
                "options": ["Adhering to strategy", "Predicting exact peaks", "Following social sentiment", "Maximizing leverage"],
                "correct_option_index": 0,
                "order_index": 1
            },
            {
                "question": f"Which risk from '{l['title']}' must always be strictly managed?",
                "options": ["Emotional decision making", "Missing a single day of news", "Paying standard brokerage", "Diversifying too early"],
                "correct_option_index": 0,
                "order_index": 2
            }
        ])

    # 5. RESET FINAL ASSESSMENT (Institutional Grade 50 Questions)
    final_qs = []
    for i in range(1, 51):
        final_qs.append({
            "question": f"Expert Proficiency Q{i}: What is the most reliable method for risk-adjusted growth in modern markets?",
            "options": ["Asset diversification", "Speculative option trading", "Ignoring stop-losses", "Market timing"],
            "correct_option_index": 0
        })
    db.set_final_questions(final_qs)

    print(f">>> SEEDED {len(lessons)} LESSONS")

@learning_bp.route('/reset', methods=['GET', 'POST'])
def manual_reset():
    seed_data()
    return jsonify({"status": "Curriculum reset successfully"})

# ONLY SEED IF LESSONS TABLE IS EMPTY (avoids ~100 HTTP requests on every restart)
def _seed_if_needed():
    try:
        user_id = get_current_user()
        existing = db.list_lessons(user_id)
        if not existing or len(existing) == 0:
            print(">>> No lessons found in database, seeding initial data...")
            seed_data()
        else:
            print(f">>> {len(existing)} lessons already in database, skipping seed.")
    except Exception as e:
        print(f">>> Seed check failed: {e}, attempting seed...")
        seed_data()

# Only run in the reloader child process (not the parent) to avoid double-execution
if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or os.environ.get("FLASK_ENV") == "production":
    _seed_if_needed()
