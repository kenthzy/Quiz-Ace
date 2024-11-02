let sessionToken; 
let playerDetails = {
    totalCorrect: 0,
    totalWrong: 0,
    correct: 0,
    wrong: 0,
    choicedAnswers: []
}
let quizDetails = {
    quizList: null,
    currentQuestion: null,
    currentIndex: 0,
    quizDone: false
}
let requestDetails = {
    difficulty: null,
    type: null,
    quantity: 10
};

async function getQuestion() {
    let request = await fetch(`https://opentdb.com/api.php?amount=${requestDetails.quantity}${requestDetails.difficulty ? `&difficulty=${requestDetails.difficulty}` : ""}${requestDetails.type ? `&type=${requestDetails.type}` : ""}`);
    if (request.ok) {
        let response = await request.json();
        if (response.response_code === 0) {
            return response.results;
        } else if (response.response_code === 1) {
            alert("Database does not have enough questions for your request...");
        } else if (response.response_code === 5) {
            alert("You are requesting too fast. Please try again in a few minutes.");
        }
    }
    return null;
}

let subjectSpan = document.querySelector("#subject");
let subjectDifficultySpan = document.querySelector("#subject-difficulty");
let quizScoreSpan = document.querySelector("#quiz-score");
let quizTotalSpan = document.querySelector("#quiz-total");
let questionP = document.querySelector("#quiz-question");
let choicesDiv = document.querySelector("#quiz-choices");

function initializeQuiz() {
    startQuizButton.disabled = true;
    quizScoreSpan.textContent = playerDetails.correct;
    quizTotalSpan.textContent = quizDetails.quizList.length;

    showQuiz();
    focusQuiz();
}

function displayQuiz(index) {
    quizDetails.currentQuestion = quizDetails.quizList[index];
    subjectSpan.innerHTML = quizDetails.currentQuestion.category.replace("Science: ", "").replace("Entertainment: ", "");
    subjectDifficultySpan.textContent = quizDetails.currentQuestion.difficulty.charAt(0).toUpperCase() + quizDetails.currentQuestion.difficulty.slice(1);
    subjectDifficultySpan.className = quizDetails.currentQuestion.difficulty;
    questionP.innerHTML = [quizDetails.currentIndex + 1] + ". " + quizDetails.currentQuestion.question;
    choicesDiv.innerHTML = "";

    if (quizDetails.currentQuestion.type === "boolean") {
        let trueButton = document.createElement("button");
        trueButton.textContent = "True";
        trueButton.originalText = "True";

        let falseButton = document.createElement("button");
        falseButton.textContent = "False";
        falseButton.originalText = "False";

        choicesDiv.append(trueButton, falseButton);
    } else {
        let choices = shuffle([quizDetails.currentQuestion.correct_answer, ...quizDetails.currentQuestion.incorrect_answers]);
        let choicesButtons = choices.map(choice => {
            let choiceButton = document.createElement("button");
            choiceButton.innerHTML = choice;
            choiceButton.originalText = choice;
            return choiceButton;
        });

        choicesDiv.append(...choicesButtons);
    }
    startLoading();
}

let questionLogs = document.querySelector("#question-logs");
let quizSummary = document.querySelector("#quiz-summary");
let quizBody = document.querySelector("#quiz-body");
let quizHome = document.querySelector(".quiz-home");
let summarySubjectDifficultySpan = document.querySelector("#summary-subject-difficulty");
let summaryScoreSpan = document.querySelector("#summary-score");
let summaryTotalQuestionSpan = document.querySelector("#summary-total-question");

function showQuiz() {
    quizHome.style.display = "none";
    quizSummary.style.display = "none";
    quizBody.style.display = "flex";
}

function showSummary() {
    quizHome.style.display = "none";
    quizBody.style.display = "none";
    quizSummary.style.display = "flex";
}

async function displaySummary() {
    if (requestDetails.difficulty) {
        summarySubjectDifficultySpan.textContent = requestDetails.difficulty.charAt(0).toUpperCase() + requestDetails.difficulty.slice(1);
        summarySubjectDifficultySpan.style.color = `var(--difficulty-${requestDetails.difficulty})`;
    }
    
    // Placeholder for audio controls
    correctAudio.pause();
    correctAudio.currentTime = 0;
    wrongAudio.pause();
    wrongAudio.currentTime = 0;

    let isPassed = playerDetails.correct > (quizDetails.quizList.length / 2);
    isPassed ? await congratsAudio.play() : await sadAudio.play();

    summaryScoreSpan.textContent = playerDetails.correct;
    summaryScoreSpan.style.color = isPassed ? "var(--answer-correct)" : "var(--answer-wrong)";
    summaryTotalQuestionSpan.textContent = requestDetails.quantity;

    questionLogs.innerHTML = "";

    let questionLogDivs = quizDetails.quizList.map((question, index) => {
        let questionLogDiv = document.createElement("div");
        questionLogDiv.className = "question-log";

        let questionP = document.createElement("p");
        questionP.innerHTML = question.question;

        let answerP = document.createElement("p");
        answerP.innerHTML = `Your Answer: <span class='${question.correct_answer == playerDetails.choicedAnswers[index] ? "correct" : "wrong"}'>${playerDetails.choicedAnswers[index]}</span>`;
        questionLogDiv.append(questionP, answerP);

        if (question.correct_answer != playerDetails.choicedAnswers[index]) {
            let correctAnswerP = document.createElement("p");
            correctAnswerP.innerHTML = `Correct Answer: <span class='correct'>${question.correct_answer}</span>`;
            questionLogDiv.appendChild(correctAnswerP);
        }

        return questionLogDiv;
    });

    questionLogs.append(...questionLogDivs);
    showSummary();
}

let difficultyButton = document.querySelector("#difficulty-button");
let typeButton = document.querySelector("#type-button");

function validateResponseQuizDetails() {
    if (requestDetails.difficulty == null) {
        difficultyButton.style.outline = "2px solid red";
        difficultyButton.focus();
        setTimeout(() => {
            difficultyButton.style.outline = "none";
        }, 2000);
        return false;
    } else if (requestDetails.type == null) {
        typeButton.style.outline = "2px solid red";
        typeButton.focus();
        setTimeout(() => {
            typeButton.style.outline = "none";
        }, 2000);
        return false;
    }

    return true;
}



function resetQuizGame() {
    quizDetails.quizDone = true;
    playerDetails.totalCorrect += playerDetails.correct;
    playerDetails.totalWrong += playerDetails.wrong;
    playerDetails.correct = 0;
    playerDetails.wrong = 0;
    playerDetails.choicedAnswers = [];

    quizDetails.quizList = null;
    quizDetails.currentQuestion = null;
    quizDetails.currentIndex = 0;
    quizDetails.quizDone = false

    startQuizButton.disabled = false;
}



let quizGameBody = document.querySelector("main");


function showQuizGame() {
    leaderboardsBody.style.display = "none";
    quizGameBody.style.display = "flex";

    showLeaderboardsButton.classList.remove("active");
    showQuizGameButton.classList.add("active");
}

let isDarkMode = false;
let primaryBackgroundColor = "#f3faf5";
let primaryColor = "#023047";
let secondaryColor = "#219ebc";
let tertiaryColor = "#ffb703";
let textColor = "#3c3c3c";
let boxShadow = "rgba(17, 17, 26, 0.1) 0px 4px 16px 0px, rgba(17, 17, 26, 0.05) 0px 8px 32px 0px";
let toggleThemeButton = document.querySelector("#toggle-theme-button");
toggleThemeButton.addEventListener("click", toggleTheme);

function toggleLightMode() {
    primaryBackgroundColor = "#f3faf5";
    primaryColor = "#023047";
    secondaryColor = "#219ebc";
    tertiaryColor = "#ffb703";
    textColor = "#3c3c3c";
    boxShadow = "rgba(17, 17, 26, 0.1) 0px 4px 16px 0px, rgba(17, 17, 26, 0.05) 0px 8px 32px 0px";

    document.documentElement.style.setProperty("--primary-backgroundcolor", primaryBackgroundColor);
    document.documentElement.style.setProperty("--primary-color", primaryColor);
    document.documentElement.style.setProperty("--secondary-color", secondaryColor);
    document.documentElement.style.setProperty("--tertiary-color", tertiaryColor);
    document.documentElement.style.setProperty("--text-color", textColor);
    document.documentElement.style.setProperty("--box-shadow", boxShadow);

    toggleThemeButton.firstElementChild.classList.remove("fa-sun");
    toggleThemeButton.firstElementChild.classList.add("fa-moon");
}

function toggleDarkMode() {
    primaryBackgroundColor = "#0e0d24";
    primaryColor = "#2b2870";
    secondaryColor = "#ffb703";
    tertiaryColor = "#219ebc";
    textColor = "#f3faf5";
    boxShadow = "rgba(239, 238, 229, 0.1) 0px 4px 16px 0px, rgba(239, 238, 229, 0.05) 0px 8px 32px 0px";

    document.documentElement.style.setProperty("--primary-backgroundcolor", primaryBackgroundColor);
    document.documentElement.style.setProperty("--primary-color", primaryColor);
    document.documentElement.style.setProperty("--secondary-color", secondaryColor);
    document.documentElement.style.setProperty("--tertiary-color", tertiaryColor);
    document.documentElement.style.setProperty("--text-color", textColor);
    document.documentElement.style.setProperty("--box-shadow", boxShadow);

    toggleThemeButton.firstElementChild.classList.remove("fa-moon");
    toggleThemeButton.firstElementChild.classList.add("fa-sun");
}

function toggleTheme() {
    if (isDarkMode) {
        isDarkMode = false;
        toggleLightMode();
    } else {
        isDarkMode = true;
        toggleDarkMode();
    }
    setWebIcon();
}

let focusableElements = document.querySelectorAll(".focusable");

function blurQuiz() {
    for (let i = 0; i < focusableElements.length; i++) {
        focusableElements[i].style.visibility = "visible";
    }
}
function focusQuiz() {
    for (let i = 0; i < focusableElements.length; i++) {
        focusableElements[i].style.visibility = "hidden";
    }
}

let quizTimer = 0;
let quizTimerCounter ;
let styleSheet = document.styleSheets[0];
let loader = Array.from(styleSheet.cssRules).filter(selecter => selecter.selectorText == ".loader::after")[0];

function startLoading() {
    loader.style.animation = "20s linear 0s 1 normal none running animFw";
    quizTimerCounter = setInterval(async () => {
        quizTimer += 1;
        if (quizTimer == 20) {
            stopLoading();
            await quizTimedOut();
        }
    }, 1000);
}

function stopLoading() {
    quizTimer = 0;
    clearInterval(quizTimerCounter);
}

async function quizTimedOut() {
    Array.from(quizChoicesDiv.children).forEach(element => {
        element.disabled = true;
    });

    let correctAnswer = quizDetails.currentQuestion.correct_answer;
    await wrongAudio.play();
    let choices = document.querySelector("#quiz-choices");
    let correctButton = Array.from(choices.children).filter(button => button.originalText == correctAnswer)[0];

    playerDetails.wrong += 1;

    correctButton.style.backgroundColor = "var(--answer-correct)";
    correctButton.style.scale = 1.05;

    playerDetails.choicedAnswers.push("None");

    if (quizDetails.quizDone) {
        blurQuiz();
        await displaySummary();
        resetQuizGame();
        await promptLeaderBoards();
        return;
    }

    if (!quizDetails.quizDone) {
        quizDetails.currentIndex += 1;
    }

    if (quizDetails.currentIndex == quizDetails.quizList.length - 1) {
        quizDetails.quizDone = true;
    }

    loader.style.animation = "";
    setTimeout(() => {
        displayQuiz(quizDetails.currentIndex);
    }, 2000);
}

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}

let dropDowns = document.querySelectorAll(".dropdown-button");
dropDowns.forEach(button => {
    button.addEventListener("click", function(event) {
        let dropButton = button.closest("button");
        let dropButtonText = dropButton.textContent;
        let content = dropButton.nextElementSibling;
        if (dropButton.classList.contains("shown")) {
            content.style.display = "none";
            dropButton.innerHTML = dropButtonText + '<i class="fa-solid fa-chevron-down"></i>'
        } else {
            content.style.display = "grid";
            dropButton.innerHTML = dropButtonText + '<i class="fa-solid fa-chevron-up"></i>'
        }
        dropButton.classList.toggle("shown");
        event.stopPropagation();
    });
    let dropDownContent = button.nextElementSibling;
    let dropButton = button.closest("button");
    if (dropDownContent.id == "difficulty-options") {
        dropDownContent.addEventListener("click", function(clicked) {
            let difficulty = clicked.target.getAttribute("topic-difficulty");
            let textContent = clicked.target.textContent;

            requestDetails.difficulty = difficulty;
            dropButton.innerHTML = textContent + ' <i class="fa-solid fa-chevron-down"></i>';
        });
    } else if (dropDownContent.id == "type-options") {
        dropDownContent.addEventListener("click", function(clicked) {
            let type = clicked.target.getAttribute("topic-type");
            let textContent = clicked.target.textContent;

            requestDetails.type = type;
            dropButton.innerHTML = textContent + ' <i class="fa-solid fa-chevron-down"></i>';
        });
    }
});

let quizCountInput = document.querySelector("#quiz-count");
quizCountInput.addEventListener("change", function() {
    if (quizCountInput.value > 50) {
        quizCountInput.value = 50;
    } else if (quizCountInput.value < 10) {
        quizCountInput.value = 10;
    }

    requestDetails.quantity = quizCountInput.value;
    console.log(requestDetails);
});
quizCountInput.addEventListener("keydown", (event) => {
    if (event.key == "-" || event.key == "+") {
        event.preventDefault();
        return;
    }
});

let startQuizButton = document.querySelector("#start-quiz-button");
startQuizButton.addEventListener("click", async function() {
    // if (!validateResponseQuizDetails()) return;
    quizDetails.quizList = await getQuestion();

    if (quizDetails.quizList == null) return;

    initializeQuiz();
    displayQuiz(quizDetails.currentIndex);
});

let quizChoicesDiv = document.querySelector("#quiz-choices");
quizChoicesDiv.addEventListener("click", async function(event) {
    if (event.target.tagName.toLowerCase() == "button") {
        Array.from(quizChoicesDiv.children).forEach(element => {
            element.disabled = true;
        });
        
        let button = event.target;
        let userAnswer = button.originalText;
        let correctAnswer = quizDetails.currentQuestion.correct_answer;
        
        if (userAnswer == correctAnswer) {
            await correctAudio.play();
            playerDetails.correct += 1;
            quizScoreSpan.textContent = playerDetails.correct;
            button.style.backgroundColor = "var(--answer-correct)";
            button.style.scale = button.clientWidth > 220 ? 1.015 : 1.05;
        } else {
            await wrongAudio.play();
            let choices = document.querySelector("#quiz-choices");
            let correctButton = Array.from(choices.children).filter(button => button.originalText == correctAnswer)[0];
            
            playerDetails.wrong += 1;
            button.style.backgroundColor = "var(--answer-wrong)";
            button.style.scale = .9905;
            
            correctButton.style.backgroundColor = "var(--answer-correct)";
            correctButton.style.scale = button.clientWidth > 220 ? 1.015 : 1.05;
        }
        
        playerDetails.choicedAnswers.push(userAnswer);
        stopLoading();
        loader.style.animation = "";

        if (quizDetails.quizDone) {
            blurQuiz();
            await displaySummary();
            resetQuizGame();
            await promptLeaderBoards();
            return;
        }

        if (!quizDetails.quizDone) {
            quizDetails.currentIndex += 1;
        }

        if (quizDetails.currentIndex == quizDetails.quizList.length - 1) {
            quizDetails.quizDone = true;
        }

        setTimeout(() => {
            displayQuiz(quizDetails.currentIndex);
        }, 2000);
    }
});

let nextQuizButton = document.querySelector("#quiz-next-button");
nextQuizButton.addEventListener("click", async function() {
    quizDetails.quizList = await getQuestion();

    if (quizDetails.quizList == null) return;

    initializeQuiz();
    displayQuiz(quizDetails.currentIndex);
});

let showQuizGameButton = document.querySelector("#quiz-game-button");
showQuizGameButton.addEventListener("click", showQuizGame);

window.addEventListener("click", function(event) {
    if (!event.target.matches(".dropdown-button") || !event.target.closest(".dropdown-button")) {
        dropDowns.forEach(button => {
            let content = button.nextElementSibling;
            let dropButtonText = button.textContent;

            content.style.display = "none";
            button.innerHTML = dropButtonText + ' <i class="fa-solid fa-chevron-down"></i>';
            button.classList.remove("shown");
        });
    }
});

localStorage.removeItem("user_id");
let correctAudio = new Audio(location.protocol + '//' + location.host + location.pathname + "/assets/sounds/correct_answer.mp3");
let wrongAudio = new Audio(location.protocol + '//' + location.host + location.pathname + "/assets/sounds/incorrect_answer.mp3");
let congratsAudio = new Audio(location.protocol + '//' + location.host + location.pathname + "/assets/sounds/congratulations.mp3");
let sadAudio = new Audio(location.protocol + '//' + location.host + location.pathname + "/assets/sounds/sad_celebration.mp3");
(async() => {
    await initializeGame();
    initializeLeaderboards();
})();
