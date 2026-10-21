from flask import Flask, render_template, request, redirect, url_for
from datetime import date

from database import get_connection, init_db

app = Flask(_name_)

STATUSES = ["Новая", "В процессе", "Выполнена"]


@app.route("/")
def index():
    status_filter = request.args.get("status", "")
    subject_filter = request.args.get("subject", "")

    connection = get_connection()

    query = "SELECT * FROM tasks WHERE 1=1"
    params = []

    if status_filter:
        query += " AND status = ?"
        params.append(status_filter)

    if subject_filter:
        query += " AND subject = ?"
        params.append(subject_filter)

    query += " ORDER BY deadline ASC"

    tasks = connection.execute(query, params).fetchall()

    subjects = connection.execute(
        "SELECT DISTINCT subject FROM tasks ORDER BY subject"
    ).fetchall()

    connection.close()

    return render_template(
        "index.html",
        tasks=tasks,
        subjects=subjects,
        statuses=STATUSES,
        selected_status=status_filter,
        selected_subject=subject_filter
    )


@app.route("/add", methods=["GET", "POST"])
def add_task():
    error = None

    if request.method == "POST":
        title = request.form.get("title", "").strip()
        subject = request.form.get("subject", "").strip()
        deadline = request.form.get("deadline", "").strip()

        if not title:
            error = "Введите название задачи."

        elif not subject:
            error = "Введите название предмета."

        elif not deadline:
            error = "Укажите срок выполнения."

        if error is None:
            connection = get_connection()

            connection.execute(
                """
                INSERT INTO tasks (title, subject, deadline, status)
                VALUES (?, ?, ?, ?)
                """,
                (title, subject, deadline, "Новая")
            )

            connection.commit()
            connection.close()

            return redirect(url_for("index"))

    return render_template("add_task.html", error=error)


@app.route("/edit/<int:task_id>", methods=["GET", "POST"])
def edit_task(task_id):
    connection = get_connection()

    task = connection.execute(
        "SELECT * FROM tasks WHERE id = ?",
        (task_id,)
    ).fetchone()

    if task is None:
        connection.close()
        return "Задача не найдена", 404

    error = None

    if request.method == "POST":
        title = request.form.get("title", "").strip()
        subject = request.form.get("subject", "").strip()
        deadline = request.form.get("deadline", "").strip()
        status = request.form.get("status", "").strip()

        if not title:
            error = "Введите название задачи."

        elif not subject:
            error = "Введите название предмета."

        elif not deadline:
            error = "Укажите срок выполнения."

        elif status not in STATUSES:
            error = "Некорректный статус."

        if error is None:
            connection.execute(
                """
                UPDATE tasks
                SET title = ?, subject = ?, deadline = ?, status = ?
                WHERE id = ?
                """,
                (title, subject, deadline, status, task_id)
            )

            connection.commit()
            connection.close()

            return redirect(url_for("index"))

    connection.close()

    return render_template(
        "edit_task.html",
        task=task,
        statuses=STATUSES,
        error=error
    )


@app.route("/complete/<int:task_id>", methods=["POST"])
def complete_task(task_id):
    connection = get_connection()

    connection.execute(
        "UPDATE tasks SET status = 'Выполнена' WHERE id = ?",
        (task_id,)
    )

    connection.commit()
    connection.close()

    return redirect(url_for("index"))


@app.route("/delete/<int:task_id>", methods=["POST"])
def delete_task(task_id):
    connection = get_connection()

    connection.execute(
        "DELETE FROM tasks WHERE id = ?",
        (task_id,)
    )

    connection.commit()
    connection.close()

    return redirect(url_for("index"))


if _name_ == "_main_":
    init_db()
    app.run(debug=True)