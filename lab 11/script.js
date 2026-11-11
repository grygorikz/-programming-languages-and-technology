
const taskInput = document.getElementById("taskInput");
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const activeCount = document.getElementById("activeCount");
const filterButtons = document.querySelectorAll("[data-filter]");

let tasks = [];
let currentFilter = "all";


try {
    tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

    if (!Array.isArray(tasks)) {
        tasks = [];
    }
} catch {
    tasks = [];
}


function saveTasks() {
    try {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch {
        console.warn("Не удалось сохранить задачи в браузере");
    }
}


taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) return;

    const newTask = {
        id: Date.now() + Math.random(),
        text: text,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();

    taskInput.value = "";

    renderTasks();
});


function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}


function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}


function renderTasks() {
    taskList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text
            .toLowerCase()
            .includes(searchText);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    if (filteredTasks.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "Задачи не найдены";
        taskList.appendChild(empty);
    }

    filteredTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task";

        const label = document.createElement("label");
        label.className = "task-label";

        if (task.completed) {
            label.classList.add("done");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        const text = document.createElement("span");
        text.textContent = task.text;

        label.appendChild(checkbox);
        label.appendChild(text);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "✕";
        deleteButton.setAttribute("aria-label", "Удалить задачу");

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        item.appendChild(label);
        item.appendChild(deleteButton);

        taskList.appendChild(item);
    });

    
    const count = tasks.filter(task => !task.completed).length;

    activeCount.textContent = count;
}


searchInput.addEventListener("input", renderTasks);


filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        renderTasks();
    });
});


renderTasks();
