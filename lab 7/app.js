const content = document.querySelector("#content");
const buttons = document.querySelectorAll("[data-tab]");

let score = 0;
let answered = false;

const questions = [
    {
        text: "1. Что означает HTML?",
        answers: ["Язык разметки", "Язык программирования", "База данных"],
        correct: 0
    },
    {
        text: "2. Что используется для оформления сайта?",
        answers: ["HTML", "CSS", "SQL"],
        correct: 1
    },
    {
        text: "3. Как подключить JavaScript?",
        answers: ["Тег script", "Тег style", "Тег title"],
        correct: 0
    }
];

function showTab(tab) {
    buttons.forEach(button => {
        button.classList.toggle("active", button.dataset.tab === tab);
    });

    content.replaceChildren();

    if (tab === "questions") {
        if (answered) {
            content.textContent = "Тест уже пройден. Результат: " +
                score + " из " + questions.length;
            return;
        }

        questions.forEach((q, index) => {
            const div = document.createElement("div");
            div.className = "question";

            const title = document.createElement("p");
            title.textContent = q.text;
            div.append(title);

            q.answers.forEach((answer, i) => {
                const label = document.createElement("label");
                const radio = document.createElement("input");

                radio.type = "radio";
                radio.name = "q" + index;
                radio.value = i;

                label.append(radio, document.createTextNode(answer));
                div.append(label, document.createElement("br"));
            });

            content.append(div);
        });

        const submit = document.createElement("button");
        submit.textContent = "Завершить тест";
        submit.addEventListener("click", checkAnswers);
        content.append(submit);
    }

    if (tab === "results") {
        content.textContent = answered
            ? `Ваш результат: ${score} из ${questions.length}`
            : "Сначала пройдите тест.";
    }

    if (tab === "rules") {
        content.textContent =
            "Ответьте на 3 вопроса и нажмите «Завершить тест». " +
            "За каждый правильный ответ начисляется 1 балл.";
    }
}

function checkAnswers() {
    score = 0;

    questions.forEach((q, index) => {
        const selected = document.querySelector(
            `input[name="q${index}"]:checked`
        );

        if (selected && Number(selected.value) === q.correct) {
            score++;
        }
    });

    answered = true;
    showTab("results");
}

buttons.forEach(button => {
    button.addEventListener("click", () => {
        showTab(button.dataset.tab);
    });
});

showTab("questions");