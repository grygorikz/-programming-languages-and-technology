let users = JSON.parse(localStorage.getItem("users")) || [];
let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

let currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || null;


// Сохранение данных

function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("tickets", JSON.stringify(tickets));
}


// Скрытие всех страниц

function hideAllPages() {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("registerPage").classList.add("hidden");
    document.getElementById("dashboardPage").classList.add("hidden");
    document.getElementById("detailPage").classList.add("hidden");
    document.getElementById("errorPage").classList.add("hidden");
}


// Обновление навигации

function updateNavigation() {
    const nav = document.getElementById("navigation");

    if (currentUser) {
        nav.innerHTML = `
            <button onclick="showDashboard()">Мои заявки</button>
            <button onclick="logout()">Выйти</button>
        `;
    } else {
        nav.innerHTML = `
            <button onclick="showLogin()">Войти</button>
            <button onclick="showRegister()">Регистрация</button>
        `;
    }
}


// Страница входа

function showLogin() {
    hideAllPages();

    document.getElementById("loginPage").classList.remove("hidden");

    updateNavigation();
}


// Страница регистрации

function showRegister() {
    hideAllPages();

    document.getElementById("registerPage").classList.remove("hidden");

    updateNavigation();
}


// Регистрация пользователя

document.getElementById("registerForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (username.length < 3 || password.length < 6) {
        alert("Логин должен содержать минимум 3 символа, пароль — 6.");
        return;
    }

    const existingUser = users.find(user =>
        user.username.toLowerCase() === username.toLowerCase()
    );

    if (existingUser) {
        alert("Пользователь с таким логином уже существует!");
        return;
    }

    const newUser = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        username: username,
        password: password
    };

    users.push(newUser);

    saveData();

    alert("Регистрация прошла успешно!");

    document.getElementById("registerForm").reset();

    showLogin();
});


// Авторизация пользователя

document.getElementById("loginForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    const user = users.find(user =>
        user.username.toLowerCase() === username.toLowerCase()
        && user.password === password
    );

    if (!user) {
        showError(401);
        return;
    }

    currentUser = {
        id: user.id,
        username: user.username
    };

    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

    document.getElementById("loginForm").reset();

    showDashboard();
});


// Проверка авторизации

function checkAuthorization() {

    if (!currentUser) {
        showError(401);
        return false;
    }

    return true;
}


// Личный кабинет

function showDashboard() {

    if (!checkAuthorization()) {
        return;
    }

    hideAllPages();

    document.getElementById("dashboardPage").classList.remove("hidden");

    document.getElementById("currentUsername").textContent =
        currentUser.username;

    updateNavigation();

    renderTickets();
}


// Создание заявки

document.getElementById("ticketForm").addEventListener("submit", function(event) {

    event.preventDefault();

    if (!checkAuthorization()) {
        return;
    }

    const title = document.getElementById("ticketTitle").value.trim();
    const description = document.getElementById("ticketDescription").value.trim();

    if (!title || !description) {
        alert("Заполните все поля!");
        return;
    }

    const newTicket = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        userId: currentUser.id,
        username: currentUser.username,
        title: title,
        description: description,
        status: "Новая",
        date: new Date().toLocaleString("ru-RU")
    };

    tickets.push(newTicket);

    saveData();

    document.getElementById("ticketForm").reset();

    alert("Заявка успешно создана!");

    showDashboard();
});


// Отображение только собственных заявок

function renderTickets() {

    const list = document.getElementById("ticketsList");

    const myTickets = tickets.filter(ticket =>
        ticket.userId === currentUser.id
    );

    document.getElementById("totalTickets").textContent =
        myTickets.length;

    document.getElementById("newTickets").textContent =
        myTickets.filter(ticket => ticket.status === "Новая").length;

    if (myTickets.length === 0) {

        list.innerHTML = `
            <p style="color:#64748b; margin-top:15px;">
                У вас пока нет заявок.
            </p>
        `;

        return;
    }

    list.innerHTML = "";

    myTickets.slice().reverse().forEach(ticket => {

        const card = document.createElement("div");

        card.className = "ticket-card";

        const title = document.createElement("h3");
        title.textContent = ticket.title;

        const description = document.createElement("p");
        description.textContent = ticket.description;

        const status = document.createElement("span");
        status.className = "status";
        status.textContent = ticket.status;

        const date = document.createElement("p");
        date.textContent = "Дата: " + ticket.date;

        const button = document.createElement("button");
        button.textContent = "Подробнее";

        button.addEventListener("click", function() {
            openTicket(ticket.id);
        });

        card.append(title, description, status, date, button);

        list.appendChild(card);
    });
}


// Просмотр конкретной заявки

function openTicket(ticketId) {

    if (!checkAuthorization()) {
        return;
    }

    const ticket = tickets.find(ticket =>
        ticket.id === ticketId
    );

    if (!ticket) {
        showError(404);
        return;
    }

    // Проверка владельца заявки

    if (ticket.userId !== currentUser.id) {
        showError(403);
        return;
    }

    hideAllPages();

    document.getElementById("detailPage").classList.remove("hidden");

    const details = document.getElementById("ticketDetails");

    details.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = ticket.title;

    const description = document.createElement("p");
    description.textContent = ticket.description;

    const status = document.createElement("p");
    status.textContent = "Статус: " + ticket.status;

    const date = document.createElement("p");
    date.textContent = "Дата создания: " + ticket.date;

    details.append(title, description, status, date);
}


// Обработка ошибок доступа

function showError(code) {

    hideAllPages();

    const errorCode = document.getElementById("errorCode");
    const errorTitle = document.getElementById("errorTitle");
    const errorMessage = document.getElementById("errorMessage");

    if (code === 401) {

        errorCode.textContent = "401";

        errorTitle.textContent = "Не авторизован";

        errorMessage.textContent =
            "Для доступа к странице необходимо войти в систему.";

    } else if (code === 403) {

        errorCode.textContent = "403";

        errorTitle.textContent = "Доступ запрещён";

        errorMessage.textContent =
            "Вы не можете просматривать чужие заявки.";

    } else {

        errorCode.textContent = "404";

        errorTitle.textContent = "Страница не найдена";

        errorMessage.textContent =
            "Запрашиваемая заявка не существует.";
    }

    document.getElementById("errorPage").classList.remove("hidden");

    updateNavigation();
}


// Выход из аккаунта

function logout() {

    currentUser = null;

    sessionStorage.removeItem("currentUser");

    alert("Вы успешно вышли из системы!");

    showLogin();
}


// Запуск приложения

updateNavigation();

if (currentUser) {
    showDashboard();
} else {
    showLogin();
}
