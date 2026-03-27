from typing import Dict, List, Any
from data.learning_data import learning_modules, learning_lessons

demo_progress: Dict[str, Any] = {
    "completed_lessons": [],
    "quiz_scores": {},
    "total_score": 0
}

def get_all_modules():
    return learning_modules

def get_lessons_by_module(module_id):
    return [lesson for lesson in learning_lessons if lesson["module_id"] == module_id]

def get_lesson_by_id(lesson_id):
    for lesson in learning_lessons:
        if lesson["id"] == lesson_id:
            return lesson
    return None

def submit_quiz(lesson_id, answers):
    lesson = get_lesson_by_id(lesson_id)
    if not lesson:
        return None

    quiz = lesson.get("quiz", [])
    score = 0
    results = []

    for index, question in enumerate(quiz):
        user_answer = answers[index] if index < len(answers) else None
        correct_answer = question["correct_answer"]
        is_correct = user_answer == correct_answer

        if is_correct:
            score += 1

        results.append({
            "question": question["question"],
            "your_answer": user_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct
        })

    demo_progress["quiz_scores"][str(lesson_id)] = score
    
    # Cast quiz_scores to dict to satisfy type checker if needed, 
    # though with Dict[str, Any] hint above it should be fine.
    scores_dict = demo_progress["quiz_scores"]
    demo_progress["total_score"] = sum(scores_dict.values())

    return {
        "lesson_id": lesson_id,
        "score": score,
        "total_questions": len(quiz),
        "results": results
    }

def mark_lesson_complete(lesson_id: int):
    completed: List = demo_progress["completed_lessons"]
    if lesson_id not in completed:
        completed.append(lesson_id)

    return {
        "message": "Lesson marked as complete",
        "completed_lessons": demo_progress["completed_lessons"]
    }

def get_progress():
    total_lessons = len(learning_lessons)
    completed_lessons_list: List = demo_progress["completed_lessons"]
    completed_count = len(completed_lessons_list)
    progress_percent = (completed_count / total_lessons) * 100 if total_lessons > 0 else 0

    return {
        "completed_lessons": completed_lessons_list,
        "quiz_scores": demo_progress["quiz_scores"],
        "total_score": demo_progress["total_score"],
        "progress_percent": round(float(progress_percent), 2),
        "total_lessons": total_lessons,
        "completed_count": completed_count
    }