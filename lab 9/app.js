const API_URL = "https://jsonplaceholder.typicode.com";

const albumsContainer = document.querySelector("#albums");
const photosContainer = document.querySelector("#photos");

const albumStatus = document.querySelector("#album-status");
const photoStatus = document.querySelector("#photo-status");
const photosTitle = document.querySelector("#photos-title");

const retryAlbumsButton = document.querySelector("#retry-albums");
const retryPhotosButton = document.querySelector("#retry-photos");

let albums = [];
let selectedAlbumId = null;

// Получение данных через Fetch API
async function fetchData(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
    }

    return await response.json();
}

// Загрузка списка альбомов
async function loadAlbums() {
    albumStatus.textContent = "Загрузка альбомов...";
    retryAlbumsButton.hidden = true;
    albumsContainer.replaceChildren();

    try {
        albums = await fetchData(`${API_URL}/albums`);

        if (albums.length === 0) {
            albumStatus.textContent = "Альбомы не найдены.";
            return;
        }

        albumStatus.textContent = `Найдено альбомов: ${albums.length}`;

        const searchInput = document.querySelector("#search");
        const filterSelect = document.querySelector("#filter");
        
        // Поиск и фильтрация альбомов
        function renderAlbums() {
            albumsContainer.replaceChildren();
        
            const query = searchInput.value.toLowerCase().trim();
            const filter = filterSelect.value;
        
            const filteredAlbums = albums.filter(album => {
                const matchesSearch = album.title.toLowerCase().includes(query);
        
                const matchesFilter =
                    filter === "all" ||
                    (filter === "short" && album.title.length < 20) ||
                    (filter === "long" && album.title.length >= 20);
        
                return matchesSearch && matchesFilter;
            });
        
            if (filteredAlbums.length === 0) {
                albumStatus.textContent = "Альбомы не найдены.";
                return;
            }
        
            albumStatus.textContent =
                `Найдено альбомов: ${filteredAlbums.length}`;
        
            filteredAlbums.forEach(album => {
                const button = document.createElement("button");
                button.className = "album";
                button.textContent = `Альбом ${album.id}: ${album.title}`;
        
                if (album.id === selectedAlbumId) {
                    button.classList.add("active");
                }
        
                button.addEventListener("click", () => loadPhotos(album.id));
                albumsContainer.append(button);
            });
        }
        
        searchInput.addEventListener("input", renderAlbums);
        filterSelect.addEventListener("change", renderAlbums);

        // Автоматически открываем первый альбом
        loadPhotos(albums[0].id);
    } catch (error) {
        albumStatus.textContent =
            `Не удалось загрузить альбомы: ${error.message}`;

        retryAlbumsButton.hidden = false;
    }
}

// Загрузка фотографий выбранного альбома
async function loadPhotos(albumId) {
    selectedAlbumId = albumId;

    const album = albums.find(item => item.id === albumId);

    photosTitle.textContent = album
        ? `Фотографии: ${album.title}`
        : "Фотографии";

    // Подсвечиваем выбранный альбом
    document.querySelectorAll(".album").forEach(button => {
        button.classList.toggle(
            "active",
            button.textContent.startsWith(`Альбом ${albumId}:`)
        );
    });

    photoStatus.textContent = "Загрузка фотографий...";
    photosContainer.replaceChildren();
    retryPhotosButton.hidden = true;

    try {
        const photos = await fetchData(
            `${API_URL}/albums/${albumId}/photos`
        );

        // Не показываем старый ответ, если уже выбран другой альбом
        if (selectedAlbumId !== albumId) return;

        if (photos.length === 0) {
            photoStatus.textContent =
                "В этом альбоме нет фотографий.";
            return;
        }

        photoStatus.textContent =
            `Загружено фотографий: ${photos.length}`;

        photos.forEach(photo => {
            const card = document.createElement("article");
            card.className = "photo";

            const img = document.createElement("img");
            img.src = photo.thumbnailUrl;
            img.alt = photo.title;
            img.loading = "lazy";

            const title = document.createElement("p");
            title.textContent = photo.title;

            card.append(img, title);
            photosContainer.append(card);
        });
    } catch (error) {
        if (selectedAlbumId !== albumId) return;

        photoStatus.textContent =
            `Ошибка загрузки фотографий: ${error.message}`;

        retryPhotosButton.hidden = false;
    }
}

// Повторная загрузка при ошибке
retryAlbumsButton.addEventListener("click", loadAlbums);

retryPhotosButton.addEventListener("click", () => {
    if (selectedAlbumId !== null) {
        loadPhotos(selectedAlbumId);
    }
});

// Запуск приложения
loadAlbums();