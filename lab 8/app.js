
const STORAGE_KEY = "filmCatalog";

const filmForm = document.getElementById("filmForm");
const titleInput = document.getElementById("title");
const genreInput = document.getElementById("genre");
const ratingInput = document.getElementById("rating");

const searchInput = document.getElementById("search");
const genreFilter = document.getElementById("genreFilter");
const minRatingFilter = document.getElementById("minRating");

const filmList = document.getElementById("filmList");
const filmCount = document.getElementById("filmCount");
const message = document.getElementById("message");

const allowedGenres = [
    "Фантастика",
    "Драма",
    "Комедия",
    "Боевик",
    "Ужасы",
    "Триллер",
    "Мультфильм",
    "Приключения",
    "Другое"
];

let films = [];

// Проверка правильности структуры фильма.
function isValidFilm(film) {
    return (
        film !== null &&
        typeof film === "object" &&
        !Array.isArray(film) &&
        typeof film.id === "string" &&
        typeof film.title === "string" &&
        film.title.trim() !== "" &&
        film.title.length <= 100 &&
        allowedGenres.includes(film.genre) &&
        typeof film.rating === "number" &&
        Number.isFinite(film.rating) &&
        film.rating >= 0 &&
        film.rating <= 10
    );
}

// Чтение данных из localStorage.
function loadFilms() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (savedData === null) {
            films = [];
            return;
        }

        // JSON.parse преобразует строку в массив объектов.
        const parsedData = JSON.parse(savedData);

        if (
            !Array.isArray(parsedData) ||
            !parsedData.every(isValidFilm) ||
            new Set(parsedData.map(film => film.id)).size !==
                parsedData.length
        ) {
            throw new Error("Неверный формат данных");
        }

        films = parsedData;
    } catch (error) {
        films = [];

        showMessage(
            "Ошибка чтения данных. Проверьте JSON в localStorage."
        );

        console.error("Ошибка загрузки:", error);
    }
}

// Сохранение данных в localStorage.
function saveFilms() {
    try {
        // JSON.stringify преобразует массив в JSON-строку.
        const jsonData = JSON.stringify(films);

        localStorage.setItem(STORAGE_KEY, jsonData);
        return true;
    } catch (error) {
        showMessage("Не удалось сохранить данные.");

        console.error("Ошибка сохранения:", error);
        return false;
    }
}

function showMessage(text) {
    message.textContent = text;
}

function clearMessage() {
    message.textContent = "";
}

// Добавление нового фильма.
filmForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const genre = genreInput.value;
    const ratingText = ratingInput.value;
    const rating = Number(ratingText);

    if (title === "") {
        showMessage("Введите название фильма.");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        showMessage("Название не должно превышать 100 символов.");
        return;
    }

    if (!allowedGenres.includes(genre)) {
        showMessage("Выберите жанр фильма.");
        return;
    }

    if (
        ratingText.trim() === "" ||
        !Number.isFinite(rating) ||
        rating < 0 ||
        rating > 10
    ) {
        showMessage("Рейтинг должен быть от 0 до 10.");
        return;
    }

    const film = {
        id: createFilmId(),
        title: title,
        genre: genre,
        rating: rating
    };

    films.push(film);

    if (!saveFilms()) {
        films.pop();
        return;
    }

    filmForm.reset();
    clearMessage();
    renderFilms();
});

// Генерация идентификатора фильма.
function createFilmId() {
    let id;

    do {
        id = Date.now().toString() + "-" +
            Math.random().toString(36).slice(2);
    } while (films.some(film => film.id === id));

    return id;
}

// Удаление фильма.
function deleteFilm(id) {
    const film = films.find(item => item.id === id);

    if (!film) {
        return;
    }

    if (!confirm(`Удалить фильм «${film.title}»?`)) {
        return;
    }

    const previousFilms = films;
    films = films.filter(item => item.id !== id);

    if (!saveFilms()) {
        films = previousFilms;
        return;
    }

    clearMessage();
    renderFilms();
}

// Фильтрация и отображение фильмов.
function renderFilms() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedGenre = genreFilter.value;
    const minRating = Number(minRatingFilter.value);

    const filteredFilms = films
        .filter(film =>
            film.title.toLowerCase().includes(searchText)
        )
        .filter(film =>
            selectedGenre === "" || film.genre === selectedGenre
        )
        .filter(film => film.rating >= minRating)
        .sort((a, b) => b.rating - a.rating);

    filmList.replaceChildren();

    filmCount.textContent =
        `Показано: ${filteredFilms.length} из ${films.length}`;

    if (filteredFilms.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";

        empty.textContent = films.length === 0
            ? "Каталог пуст. Добавьте первый фильм!"
            : "Фильмы не найдены. Измените фильтры.";

        filmList.appendChild(empty);
        return;
    }

    filteredFilms.forEach(film => {
        const card = document.createElement("article");
        card.className = "film-card";

        const title = document.createElement("h3");
        title.textContent = film.title;

        const genre = document.createElement("span");
        genre.className = "genre";
        genre.textContent = film.genre;

        const rating = document.createElement("div");
        rating.className = "rating";
        rating.textContent = `★ Рейтинг: ${film.rating.toFixed(1)}`;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Удалить";

        deleteButton.addEventListener("click", function () {
            deleteFilm(film.id);
        });

        card.append(title, genre, rating, deleteButton);
        filmList.appendChild(card);
    });
}

// Обработчики фильтров.
searchInput.addEventListener("input", renderFilms);
genreFilter.addEventListener("change", renderFilms);
minRatingFilter.addEventListener("change", renderFilms);

// Запуск приложения при открытии страницы.
loadFilms();
renderFilms();
