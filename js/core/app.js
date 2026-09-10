import {
    DEFAULT_STATE,
    calculateLevel
} from "./state.js";


import {
    loadState,
    saveState
} from "./storage.js";


import {
    updateStreak,
    claimDailyReward,
    canClaimDailyReward,
    escapeHTML
} from "./utils.js";


import {
    QuizEngine,
    QUIZ_CONFIG
} from "./quiz.js";



const state =
    loadState(
        DEFAULT_STATE
    );



const quiz =
    new QuizEngine(
        state,
        () => saveState(state)
    );



const app = {


    category:
        state.currentCategory ||
        "general",


    timer: null,


    timeLeft: 0,


    currentAnswerLocked: false,


    async init() {


        this.applyTheme();


        this.bindNavigation();


        this.bindQuizTabs();


        this.bindCategoryButtons();


        this.bindThemeButton();


        this.bindDailyReward();


        this.bindChat();


        this.renderAll();


        await this.loadQuiz();


    },



    bindNavigation() {


        document
            .querySelectorAll(
                "[data-page]"
            )
            .forEach(
                button => {


                    button.addEventListener(
                        "click",
                        async () => {


                            const page =
                                button.dataset.page;



                            if (
                                button.dataset.category
                            ) {

                                this.category =
                                    button.dataset.category;

                            }



                            this.showPage(
                                page
                            );

                        }
                    );

                }
            );

    },



    showPage(
        page
    ) {


        document
            .querySelectorAll(
                ".page"
            )
            .forEach(
                section => {

                    section.classList.remove(
                        "active"
                    );

                }
            );



        const target =
            document.getElementById(
                page
            );



        if (target) {

            target.classList.add(
                "active"
            );

        }



        if (
            page === "quiz"
        ) {

            this.renderStages();

        }

    },



    bindQuizTabs() {


        document
            .querySelectorAll(
                "[data-category-tab]"
            )
            .forEach(
                button => {


                    button.addEventListener(
                        "click",
                        async () => {


                            this.category =
                                button.dataset.categoryTab;



                            state.currentCategory =
                                this.category;



                            saveState(
                                state
                            );



                            document
                                .querySelectorAll(
                                    ".quiz-tab"
                                )
                                .forEach(
                                    tab => {

                                        tab.classList.remove(
                                            "active"
                                        );

                                    }
                                );



                            button.classList.add(
                                "active"
                            );



                            await this.loadQuiz();

                        }
                    );

                }
            );

    },



    bindCategoryButtons() {


        document
            .querySelectorAll(
                "[data-category]"
            )
            .forEach(
                button => {


                    button.addEventListener(
                        "click",
                        async () => {


                            this.category =
                                button.dataset.category;



                            state.currentCategory =
                                this.category;



                            saveState(
                                state
                            );



                            this.showPage(
                                "quiz"
                            );



                            document
                                .querySelectorAll(
                                    "[data-category-tab]"
                                )
                                .forEach(
                                    tab => {

                                        tab.classList.toggle(
                                            "active",
                                            tab.dataset.categoryTab ===
                                            this.category
                                        );

                                    }
                                );



                            await this.loadQuiz();

                        }
                    );

                }
            );

    },



    async loadQuiz() {


        try {


            await quiz.loadCategory(
                this.category
            );


            this.renderStages();



        } catch (error) {


            console.error(
                "Quiz loading error:",
                error
            );

        }

    },



    getUnlockedStage() {


        return this.category ===
            "general"

            ? state.generalStage

            : state.funStage;

    },



    renderStages() {


        const container =
            document.getElementById(
                "stageList"
            );



        if (!container) {

            return;

        }



        const unlocked =
            this.getUnlockedStage();



        container.innerHTML =
            "";



        for (
            let stage = 1;
            stage <= 10;
            stage++
        ) {


            const locked =
                stage >
                unlocked;



            const card =
                document.createElement(
                    "button"
                );



            card.type =
                "button";



            card.className =
                `stage-card ${
                    locked
                        ? "locked"
                        : ""
                }`;



            card.innerHTML = `

                <span class="stage-number">

                    ${
                        locked
                            ? "🔒"
                            : stage
                    }

                </span>


                <span class="stage-info">

                    <strong>
                        مرحله ${stage}
                    </strong>


                    <small>

                        ${
                            locked
                                ? "قفل است"
                                : `${QUIZ_CONFIG.questionsPerStage} سؤال تصادفی`
                        }

                    </small>

                </span>

            `;



            if (!locked) {


                card.addEventListener(
                    "click",
                    () =>
                        this.startStage(
                            stage
                        )
                );

            }



            container.appendChild(
                card
            );

        }

    },



    async startStage(
        stage
    ) {


        /*
         * اگر Heart نداشته باشیم،
         * فعلاً اجازه شروع مرحله جدید داده نمی‌شود.
         */

        if (
            state.hearts <= 0
        ) {


            alert(
                "❤️ فعلاً Heart کافی نداری. بعداً دوباره امتحان کن."
            );


            return;

        }



        await quiz.loadCategory(
            this.category
        );



        const selected =
            quiz.startStage(
                this.category,
                stage
            );



        if (
            selected.length === 0
        ) {


            alert(
                "برای این مرحله هنوز سؤال ثبت نشده است."
            );


            return;

        }



        this.currentAnswerLocked =
            false;



        this.renderQuestion();

    },



    renderQuestion() {


        const question =
            quiz.getCurrentQuestion();



        const box =
            document.getElementById(
                "quizBox"
            );



        if (
            !question ||
            !box
        ) {


            if (box) {

                box.classList.add(
                    "hidden"
                );

            }


            return;

        }



        box.classList.remove(
            "hidden"
        );



        document.getElementById(
            "quizCategory"
        ).textContent =

            this.category ===
            "general"

                ? "🧠 اطلاعات عمومی"

                : "🎮 تفریحی";



        document.getElementById(
            "questionNumber"
        ).textContent =

            `${quiz.currentQuestion + 1}/${quiz.getQuestionCount()}`;



        document.getElementById(
            "questionText"
        ).textContent =
            question.question;



        const progress =
            (
                quiz.currentQuestion /
                quiz.getQuestionCount()
            ) * 100;



        document.getElementById(
            "quizProgress"
        ).style.width =
            `${progress}%`;



        const answers =
            document.getElementById(
                "answers"
            );



        answers.innerHTML =
            "";



        question.options.forEach(
            (
                option,
                index
            ) => {


                const button =
                    document.createElement(
                        "button"
                    );



                button.type =
                    "button";



                button.className =
                    "answer-btn";



                button.textContent =
                    option;



                button.addEventListener(
                    "click",
                    () =>
                        this.submitAnswer(
                            index
                        )
                );



                answers.appendChild(
                    button
                );

            }
        );



        document.getElementById(
            "quizResult"
        ).innerHTML =
            "";



        document
            .getElementById(
                "nextQuestionBtn"
            )
            .classList.add(
                "hidden"
            );



        this.updateCombo();


        this.startTimer();

    },



    startTimer() {


        this.stopTimer();



        this.timeLeft =
            QUIZ_CONFIG.questionTime;



        this.updateTimer();



        this.timer =
            setInterval(
                () => {


                    this.timeLeft--;


                    this.updateTimer();



                    if (
                        this.timeLeft <= 0
                    ) {


                        this.stopTimer();


                        this.submitAnswer(
                            null
                        );

                    }

                },
                1000
            );

    },



    stopTimer() {


        if (
            this.timer
        ) {


            clearInterval(
                this.timer
            );


            this.timer =
                null;

        }

    },



    updateTimer() {


        const timer =
            document.getElementById(
                "questionTimer"
            );



        const progress =
            document.getElementById(
                "timerProgress"
            );



        if (
            !timer ||
            !progress
        ) {

            return;

        }



        timer.textContent =
            `${this.timeLeft}s`;



        const percentage =
            (
                this.timeLeft /
                QUIZ_CONFIG.questionTime
            ) * 100;



        progress.style.width =
            `${Math.max(
                0,
                percentage
            )}%`;



        if (
            this.timeLeft <= 5
        ) {

            timer.classList.add(
                "timer-danger"
            );

        } else {

            timer.classList.remove(
                "timer-danger"
            );

        }

    },



    submitAnswer(
        index
    ) {


        if (
            this.currentAnswerLocked
        ) {

            return;

        }



        this.currentAnswerLocked =
            true;



        this.stopTimer();



        const result =
            quiz.answer(
                index
            );



        const buttons =
            document.querySelectorAll(
                ".answer-btn"
            );



        buttons.forEach(
            button => {

                button.disabled =
                    true;

            }
        );



        /*
         * رنگ‌بندی پاسخ انتخاب‌شده
         */

        buttons.forEach(
            (
                button,
                buttonIndex
            ) => {


                if (
                    buttonIndex ===
                    Number(
                        result.correctAnswer ===
                        button.textContent
                            ? buttonIndex
                            : -1
                    )
                ) {

                    button.classList.add(
                        "correct-answer"
                    );

                }

            }
        );



        const resultBox =
            document.getElementById(
                "quizResult"
            );



        if (
            result.correct
        ) {


            updateStreak(
                state
            );



            resultBox.innerHTML = `

                <div class="result-success">

                    <strong>
                        ✓ پاسخ درست!
                    </strong>


                    <span>
                        +${result.earnedXP} XP
                    </span>

                </div>

            `;



        } else {


            resultBox.innerHTML = `

                <div class="result-error">

                    <strong>

                        ${
                            index === null
                                ? "⏰ زمان تمام شد!"
                                : "✕ پاسخ نادرست"
                        }

                    </strong>


                    <span>

                        پاسخ درست:
                        ${escapeHTML(
                            result.correctAnswer
                        )}

                    </span>

                </div>

            `;

        }



        if (
            result.explanation
        ) {


            resultBox.innerHTML += `

                <p class="explanation">

                    ${escapeHTML(
                        result.explanation
                    )}

                </p>

            `;

        }



        this.updateCombo();


        this.renderAll();



        const nextButton =
            document.getElementById(
                "nextQuestionBtn"
            );



        nextButton.classList.remove(
            "hidden"
        );



        nextButton.textContent =
            result.finished

                ? "مشاهده نتیجه مرحله"

                : "سؤال بعدی →";



        nextButton.onclick =
            () => {


                if (
                    result.finished
                ) {


                    this.showStageResult(
                        result
                    );


                } else {


                    this.currentAnswerLocked =
                        false;


                    this.renderQuestion();

                }

            };

    },



    showStageResult(
        result
    ) {


        this.stopTimer();



        const box =
            document.getElementById(
                "quizBox"
            );



        const percentage =
            Math.round(
                result.percentage *
                100
            );



        const passed =
            result.passed;



        box.innerHTML = `

            <div class="stage-result">


                <div class="stage-result-icon">

                    ${
                        passed
                            ? "🎉"
                            : "📚"
                    }

                </div>


                <p class="eyebrow">
                    STAGE RESULT
                </p>


                <h2>

                    ${
                        passed
                            ? "مرحله را با موفقیت گذراندی!"
                            : "هنوز به حد نصاب نرسیدی"
                    }

                </h2>


                <div class="result-score">

                    ${percentage}%

                </div>


                <p class="result-details">

                    ${result.correctAnswers}

                    پاسخ درست از

                    ${result.total}

                    سؤال

                </p>


                <div class="result-breakdown">


                    <div>

                        <strong>
                            ✓
                        </strong>

                        <span>
                            ${result.correctAnswers}
                            درست
                        </span>

                    </div>


                    <div>

                        <strong>
                            ✕
                        </strong>

                        <span>
                            ${result.wrongAnswers}
                            غلط
                        </span>

                    </div>


                </div>


                ${
                    passed

                        ? `

                            <p class="result-message success-text">

                                🔓 مرحله بعد باز شد!

                            </p>

                        `

                        : `

                            <p class="result-message">

                                برای عبور از این مرحله حداقل

                                ${
                                    QUIZ_CONFIG.passingPercentage * 100
                                }٪

                                پاسخ درست لازم است.

                            </p>

                        `
                }


                <button
                    class="primary-btn"
                    id="closeResult"
                    type="button">

                    بازگشت به مراحل

                </button>


            </div>

        `;



        document
            .getElementById(
                "closeResult"
            )
            .onclick =
            () => {


                box.classList.add(
                    "hidden"
                );


                box.innerHTML = `

                    <div class="quiz-top">

                        <span id="quizCategory"></span>

                        <span class="question-counter">

                            سؤال
                            <b id="questionNumber"></b>

                        </span>

                    </div>


                    <div class="question-progress">

                        <div
                            id="quizProgress"
                            class="question-progress-bar">
                        </div>

                    </div>


                    <div class="timer-row">

                        <span>
                            ⏱️ زمان باقی‌مانده
                        </span>

                        <strong
                            id="questionTimer">
                            15s
                        </strong>

                    </div>


                    <div class="timer-progress">

                        <div
                            id="timerProgress"
                            class="timer-progress-bar">
                        </div>

                    </div>


                    <div class="combo-display">

                        🔥 Combo:

                        <strong id="comboValue">
                            0
                        </strong>

                    </div>


                    <h3 id="questionText"></h3>


                    <div
                        id="answers"
                        class="answers">
                    </div>


                    <div
                        id="quizResult"
                        class="quiz-result">
                    </div>


                    <button
                        id="nextQuestionBtn"
                        class="primary-btn hidden"
                        type="button">

                        سؤال بعدی →

                    </button>

                `;



                this.renderStages();


            };

    },



    updateCombo() {


        const combo =
            document.getElementById(
                "comboValue"
            );



        if (
            combo
        ) {

            combo.textContent =
                quiz.combo;

        }

    },



    renderAll() {


        state.level =
            calculateLevel(
                state.xp
            );



        document.getElementById(
            "homeXP"
        ).textContent =
            state.xp;



        document.getElementById(
            "homeStreak"
        ).textContent =
            state.streak;



        document.getElementById(
            "homeLevel"
        ).textContent =
            state.level;



        document.getElementById(
            "quizXP"
        ).textContent =
            state.xp;



        document.getElementById(
            "quizStreak"
        ).textContent =
            state.streak;



        document.getElementById(
            "heartValue"
        ).textContent =
            state.hearts;



        this.renderProfile();


        this.renderLeaderboard();


        this.updateDailyRewardButton();


        saveState(
            state
        );

    },



    renderProfile() {


        const name =
            state.username ||
            "بازیکن مهمان";



        document.getElementById(
            "profileName"
        ).textContent =
            name;



        document.getElementById(
            "profileLevel"
        ).textContent =
            `Level ${state.level}`;



        document.getElementById(
            "profileXP"
        ).textContent =
            state.xp;



        document.getElementById(
            "profileStreak"
        ).textContent =
            state.streak;



        document.getElementById(
            "profileGeneral"
        ).textContent =
            state.generalStage;



        document.getElementById(
            "profileFun"
        ).textContent =
            state.funStage;



        document.getElementById(
            "profileBestCombo"
        ).textContent =
            state.bestCombo;



        document.getElementById(
            "profileAvatar"
        ).textContent =
            name
                .charAt(0)
                .toUpperCase();

    },



    renderLeaderboard() {


        const body =
            document.getElementById(
                "leaderboardBody"
            );



        if (
            !body
        ) {

            return;

        }



        body.innerHTML = `

            <tr>

                <td>
                    1
                </td>


                <td>

                    ${escapeHTML(
                        state.username
                    )}

                </td>


                <td>
                    ${state.xp}
                </td>


                <td>
                    ${state.level}
                </td>

            </tr>

        `;

    },



    bindThemeButton() {


        const button =
            document.getElementById(
                "themeToggle"
            );



        if (
            !button
        ) {

            return;

        }



        button.addEventListener(
            "click",
            () => {


                state.theme =
                    state.theme ===
                    "dark"

                        ? "light"

                        : "dark";



                saveState(
                    state
                );


                this.applyTheme();

            }
        );

    },



    applyTheme() {


        document.documentElement
            .setAttribute(
                "data-theme",
                state.theme
            );



        const button =
            document.getElementById(
                "themeToggle"
            );



        if (
            button
        ) {


            button.textContent =
                state.theme ===
                "dark"

                    ? "☀️"

                    : "🌙";



            button.title =
                state.theme ===
                "dark"

                    ? "حالت روشن"

                    : "حالت تاریک";

        }

    },



    bindDailyReward() {


        const button =
            document.getElementById(
                "dailyReward"
            );



        if (
            !button
        ) {

            return;

        }



        button.addEventListener(
            "click",
            () => {


                const reward =
                    claimDailyReward(
                        state
                    );


                if (
                    reward <= 0
                ) {

                    return;

                }



                state.xp +=
                    reward;



                state.level =
                    calculateLevel(
                        state.xp
                    );



                saveState(
                    state
                );



                this.renderAll();


                alert(
                    `🎁 ${reward} XP جایزه روزانه گرفتی!`
                );

            }
        );



        this.updateDailyRewardButton();

    },



    updateDailyRewardButton() {


        const button =
            document.getElementById(
                "dailyReward"
            );



        if (
            !button
        ) {

            return;

        }



        if (
            canClaimDailyReward(
                state
            )
        ) {


            button.disabled =
                false;


            button.textContent =
                "دریافت +25 XP";


        } else {


            button.disabled =
                true;


            button.textContent =
                "✓ جایزه امروز دریافت شده";

        }

    },



    bindChat() {


        const input =
            document.getElementById(
                "chatInput"
            );


        const button =
            document.getElementById(
                "sendChat"
            );



        if (
            !input ||
            !button
        ) {

            return;

        }



        button.addEventListener(
            "click",
            () => {


                if (
                    !input.value.trim()
                ) {

                    return;

                }



                alert(
                    "💬 چت عمومی در نسخه آنلاین فعال خواهد شد."
                );



                input.value =
                    "";

            }
        );

    }

};



app.init();
