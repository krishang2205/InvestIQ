from flask import Blueprint, jsonify, request
from services.learning_service import (
    get_all_modules,
    get_lessons_by_module,
    get_lesson_by_id,
    submit_quiz,
    mark_lesson_complete,
    get_progress
)

learning_bp = Blueprint("learning_bp", __name__)

@learning_bp.route("/api/learning/modules", methods=["GET"])
def fetch_modules():
    return jsonify(get_all_modules())

@learning_bp.route("/api/learning/modules/<int:module_id>/lessons", methods=["GET"])
def fetch_module_lessons(module_id):
    return jsonify(get_lessons_by_module(module_id))

@learning_bp.route("/api/learning/lessons/<int:lesson_id>", methods=["GET"])
def fetch_lesson(lesson_id):
    lesson = get_lesson_by_id(lesson_id)
    if not lesson:
        return jsonify({"error": "Lesson not found"}), 404
    return jsonify(lesson)

@learning_bp.route("/api/learning/quiz/<int:lesson_id>/submit", methods=["POST"])
def submit_lesson_quiz(lesson_id):
    data = request.get_json()
    answers = data.get("answers", [])

    result = submit_quiz(lesson_id, answers)
    if not result:
        return jsonify({"error": "Lesson not found"}), 404

    return jsonify(result)

@learning_bp.route("/api/learning/progress", methods=["GET"])
def fetch_progress():
    return jsonify(get_progress())

@learning_bp.route("/api/learning/progress/complete-lesson", methods=["POST"])
def complete_lesson():
    data = request.get_json()
    lesson_id = data.get("lesson_id")

    if lesson_id is None:
        return jsonify({"error": "lesson_id is required"}), 400

    return jsonify(mark_lesson_complete(lesson_id))