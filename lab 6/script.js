const input = document.querySelector("#taskInput");
const addBtn = document.querySelector("#addBtn");
const taskList = document.querySelector("#taskList");
const clearBtn = document.querySelector("#clearBtn");

addBtn.addEventListener("click", addTask);

input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") addTask();
});

function addTask() {
    const text = input.value.trim();

    if (text === "") {
        alert("Введите задачу!");
        return;
    }

    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    checkbox.addEventListener("change", function() {
        li.classList.toggle("completed", checkbox.checked);
    });

    const span = document.createElement("span");
    span.textContent = " " + text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить";
    deleteBtn.addEventListener("click", function() {
        li.remove();
    });

    li.append(checkbox, span, deleteBtn);
    taskList.append(li);

    input.value = "";
}

clearBtn.addEventListener("click", function() {
    document.querySelectorAll(".completed").forEach(task => {
        task.remove();
    });
});