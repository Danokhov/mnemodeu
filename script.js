// Подключаем Firebase SDK
// Подключаем Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// 🔹 Настроим Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCy2yssfY8BSzS2S88Fa0lH-PwAwWb7A_o",
    authDomain: "mnemo-deu.firebaseapp.com",
    projectId: "mnemo-deu",
    storageBucket: "mnemo-deu.firebasestorage.app",
    messagingSenderId: "619445160765",
    appId: "1:619445160765:web:74191d562884f18e3a5354"
};

// 🔹 Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// 🔹 Дожидаемся загрузки страницы
document.addEventListener("DOMContentLoaded", function () {
    const loginDiv = document.getElementById("login");
    const wordsDiv = document.getElementById("words");
    const loginBtn = document.getElementById("loginBtn");
    const resetBtn = document.getElementById("resetPasswordBtn");

    if (!loginDiv || !wordsDiv || !loginBtn) {
        console.error("Ошибка: Не найдены элементы 'login', 'words' или 'loginBtn'!");
        return;
    }

    // 🔹 Авторизация
    loginBtn.addEventListener("click", () => {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                loginDiv.style.display = "none";
                wordsDiv.style.display = "block";
                loadWords(); // Загружаем слова после входа
            })
            .catch(error => {
                console.error("Ошибка входа:", error.message);
                alert("Ошибка входа: " + error.message);
            });
    });

    // 🔹 Обработчик кнопки сброса пароля
    if (resetBtn) {
        resetBtn.addEventListener("click", resetPassword);
    }
});

// 🔹 Функция сброса пароля
function resetPassword() {
    let email = document.getElementById("email").value;
    if (!email) {
        alert("Введите ваш email!");
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("📩 Ссылка для сброса пароля отправлена на " + email);
        })
        .catch((error) => {
            console.error("Ошибка сброса пароля:", error.message);
            alert("❌ Ошибка: " + error.message);
        });
}

// 🔹 Загружаем слова из Firestore
async function loadWords() {
    let wordsSnapshot = await getDocs(collection(db, "words"));
    let words = wordsSnapshot.docs.map(doc => doc.data());

    console.log("Загруженные слова:", words); // Проверяем, что слова загружены

    // Проверяем, что есть хотя бы одно слово
    if (words.length === 0) {
        console.warn("Внимание: В базе данных нет слов!");
        return;
    }

    // Сохраняем их в глобальной переменной
    window.allWords = words;
}

// 🔹 Фильтрация и отображение слов
function filterDropdown() {
    let query = document.getElementById("searchInput").value.toLowerCase();
    let dropdown = document.getElementById("dropdown");

    if (!dropdown) {
        console.error("Ошибка: 'dropdown' не найден!");
        return;
    }

    // Очищаем список перед обновлением
    dropdown.innerHTML = "";

    // Если поле пустое – скрываем список
    if (query === "") {
        dropdown.style.display = "none";
        return;
    }

    // Фильтруем слова по введённому тексту
    let filteredWords = window.allWords.filter(item =>
        item.word.toLowerCase().includes(query) ||
        (item.translation && item.translation.toLowerCase().includes(query))
    );

    // Если ничего не найдено
    if (filteredWords.length === 0) {
        let item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = "Совпадений не найдено";
        dropdown.appendChild(item);
    } else {
        // Добавляем найденные слова в список
        filteredWords.forEach(item => {
            let wordItem = document.createElement("div");
            wordItem.className = "dropdown-item";
            wordItem.textContent = item.word;
            wordItem.dataset.gender = item.gender;
            wordItem.dataset.translation = item.translation;
            wordItem.dataset.mnemo = item.mnemo ? item.mnemo : "Нет мнемоники";

            // При клике выбираем слово и скрываем список
            wordItem.onclick = function () {
                document.getElementById("searchInput").value = item.word;
                showPopup(item.word, item.gender, item.translation, item.mnemo);
                dropdown.style.display = "none";
            };

            dropdown.appendChild(wordItem);
        });
    }

    // Показываем список
    dropdown.style.display = "block";
}

// 🔹 Функция показа всплывающего окна
function showPopup(word, gender, translation, mnemo) {
    let popup = document.getElementById("popup");
    if (!popup) {
        console.error("Ошибка: 'popup' не найден!");
        return;
    }

    document.getElementById("popupWord").innerText = word;
    document.getElementById("popupGender").innerText = gender;
    document.getElementById("popupTranslation").innerText = translation;
    document.getElementById("popupMnemo").innerText = mnemo;
    popup.style.display = "block";
}

// 🔹 Функция закрытия всплывающего окна
function closePopup() {
    let popup = document.getElementById("popup");
    if (popup) {
        popup.style.display = "none";
    }
}

// Делаем функции глобальными
window.resetPassword = resetPassword;
window.filterDropdown = filterDropdown;
window.showPopup = showPopup;
window.closePopup = closePopup;
