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
    loadState(DEFAULT_STATE);


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

        this.renderAll();

        await this.loadQuiz();

    },


    bindNavigation() {

        document
            .querySelectorAll("[data-page]")
            .forEach(button => {

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


                        this.showPage(page);

                    }
                );

            });

    },


    showPage(page) {

        document
            .querySelectorAll(".page")
            .forEach(section => {

                section.classList.remove(
                    "active"
                );

            });


        const target =
            document.getElementById(page);


        if (target) {

            target.classList.add("active");

        }


        if (page === "quiz") {

            this.renderStages();

        }

    },


    bindQuizTabs() {

        document
            .querySelectorAll(
                "[data-category-tab]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        this.category =
                            button.dataset.categoryTab;


                        document
                            .querySelectorAll(
                                ".quiz-tab"
                            )
                            .forEach(tab => {

                                tab.classList.remove(
                                    "active"
                                );

                            });


                        button.classList.add(
                            "active"
                        );


                        await this.loadQuiz();

                    }
                );

            });

    },


    bindCategoryButtons() {

        document
            .querySelectorAll(
                "[data-category]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        this.category =
                            button.dataset.category;


                        this.showPage(
                            "quiz"
                        );


                        await this.loadQuiz();

                    }
                );

            });

    },


    async loadQuiz() {

        try {

            await quiz.loadCategory(
                this.category
            );


            this.renderStages();

        } catch (error) {

            console.error(error);

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


        if (!container) return;


        const unlocked =
            this.getUnlockedStage();


        container.innerHTML = "";


        for (
            let stage = 1;
            stage <= 10;
            stage++
        ) {

            const locked =
                stage > unlocked;


            const card =
                document.createElement(
                    "button"
                );


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


            container.appendChild(card);

        }

    },


    async startStage(stage) {

        await quiz.loadCategory(
            this.category
        );


        quiz.startStage(
            this.category,
            stage
        );


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


        if (!question) {

            box.classList.add(
                "hidden"
            );

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


        answers.innerHTML = "";


        question.options.forEach(
            (option, index) => {

                const button =
                    document.createElement(
                        "button"
                    );


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


        document
            .getElementById(
                "quizResult"
            )
            .innerHTML = "";


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

        if (this.timer) {

            clearInterval(
                this.timer
            );

            this.timer = null;

        }

    },


    updateTimer() {

        const timer =
            document.getElementById(
                "questionTimer"
            );


        if (!timer) return;


        timer.textContent =
            `${this.timeLeft}s`;


        const percentage =
            (
                this.timeLeft /
                QUIZ_CONFIG.questionTime
            ) * 100;


        document.getElementById(
            "timerProgress"
        ).style.width =
            `${percentage}%`;

    },


    submitAnswer(index) {

        if (
            this.currentAnswerLocked
        ) {

            return;

        }


        this.currentAnswerLocked =
            true;


        this.stopTimer();


        const result =
            quiz.answer(index);


        const buttons =
            document.querySelectorAll(
                ".answer-btn"
            );


        buttons.forEach(button => {

            button.disabled = true;

        });


        const resultBox =
            document.getElementById(
                "quizResult"
            );


        if (result.correct) {

            updateStreak(state);


            resultBox.innerHTML = `

                <div class="result-success">

                    <strong>
                        ✓ درست!
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
                        Combo از اول شروع می‌شود.
                    </span>

                </div>

            `;

        }


        if (result.explanation) {

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

                if (result.finished) {

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


    showStageResult(result) {

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
                    ${passed ? "🎉" : "📚"}
                </div>

                <h2>
                    ${
                        passed
                            ? "مرحله را با موفقیت گذراندی!"
                            : "این مرحله هنوز کامل نشده"
                    }
                </h2>

                <div class="result-score">
                    ${percentage}%
                </div>

                <p>
                    ${result.correctAnswers}
                    پاسخ درست از
                    ${result.total}
                    سؤال
                </p>

                ${
                    passed
                        ? `
                            <p class="result-message">
                                مرحله بعد برایت باز شد!
                            </p>
                        `
                        : `
                            <p class="result-message">
                                دوباره تلاش کن تا به
                                حداقل
                                ${
                                    QUIZ_CONFIG.passingPercentage * 100
                                }٪
                                برسی.
                            </p>
                        `
                }

                <button
                    class="primary-btn"
                    id="closeResult">

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

                location.reload();

            };

    },


    updateCombo() {

        const combo =
            document.getElementById(
                "comboValue"
            );


        if (!combo) return;


        combo.textContent =
            quiz.combo;

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

        saveState(state);

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
            `سطح ${state.level}`;


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


        if (!body) return;


        body.innerHTML = `

            <tr>

                <td>1</td>

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


        if (!button) return;


        button.addEventListener(
            "click",
            () => {

                state.theme =
                    state.theme === "dark"
                        ? "light"
                        : "dark";


                saveState(state);

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


        if (button) {

            button.textContent =
                state.theme === "dark"
                    ? "☀️ حالت روشن"
                    : "🌙 حالت تاریک";

        }

    },


    bindDailyReward() {

        const button =
            document.getElementById(
                "dailyReward"
            );


        if (!button) return;


        if (
            canClaimDailyReward(state)
        ) {

            button.disabled = false;


            button.addEventListener(
                "click",
                () => {

                    const reward =
                        claimDailyReward(
                            state
                        );


                    state.xp += reward;


                    saveState(state);

                    this.renderAll();


                    alert(
                        `🎁 ${reward} XP جایزه روزانه گرفتی!`
                    );

                }
            );

        } else {

            button.disabled = true;

            button.textContent =
                "✓ جایزه امروز دریافت شده";

        }

    }

};


app.init();
