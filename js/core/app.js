import {
    DEFAULT_STATE,
    calculateLevel,
    isStageCompleted
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

import {
    getCurrentUser,
    isLoggedIn,
    register,
    login,
    logout
} from "./auth.js";


const currentUser =
    getCurrentUser() || "guest";


const state =
    loadState(
        DEFAULT_STATE,
        currentUser
    );


if (
    currentUser !== "guest"
) {

    state.username =
        currentUser;

}


const quiz =
    new QuizEngine(
        state,
        () =>
            saveState(
                state,
                currentUser
            )
    );


const app = {

    category:
        state.currentCategory ||
        "general",

    timer: null,

    timeLeft: 0,

    currentAnswerLocked: false,

    authMode: "login",


    async init() {

        this.applyTheme();

        this.bindNavigation();

        this.bindQuizTabs();

        this.bindCategoryButtons();

        this.bindThemeButton();

        this.bindDailyReward();

        this.bindAuth();

        this.renderAuthState();

        this.renderAll();

        await this.loadQuiz();

    },


    bindNavigation() {

        document
            .querySelectorAll(
                "[data-page]"
            )
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

                            state.currentCategory =
                                this.category;

                            saveState(
                                state,
                                currentUser
                            );

                        }


                        this.showPage(
                            page
                        );

                    }
                );

            });


        const authButton =
            document.getElementById(
                "authButton"
            );


        if (authButton) {

            authButton.addEventListener(
                "click",
                () => {

                    if (
                        isLoggedIn()
                    ) {

                        if (
                            confirm(
                                "آیا می‌خواهی از حساب کاربری خارج شوی؟"
                            )
                        ) {

                            logout();

                            location.reload();

                        }

                    } else {

                        this.showPage(
                            "auth"
                        );

                    }

                }
            );

        }

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
            document.getElementById(
                page
            );


        if (target) {

            target.classList.add(
                "active"
            );

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

                        state.currentCategory =
                            this.category;


                        document
                            .querySelectorAll(
                                "[data-category-tab]"
                            )
                            .forEach(tab => {

                                tab.classList.remove(
                                    "active"
                                );

                            });


                        button.classList.add(
                            "active"
                        );


                        saveState(
                            state,
                            currentUser
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

                        state.currentCategory =
                            this.category;


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


            const completed =
                isStageCompleted(
                    state,
                    this.category,
                    stage
                );


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
                } ${
                    completed
                        ? "completed"
                        : ""
                }`;


            let statusText;


            if (locked) {

                statusText =
                    "قفل است 🔒";

            } else if (completed) {

                statusText =
                    "این مرحله را بردی ✓";

            } else {

                statusText =
                    "آماده بازی";

            }


            card.innerHTML = `

                <span class="stage-number">
                    ${
                        locked
                            ? "🔒"
                            : completed
                                ? "✓"
                                : stage
                    }
                </span>

                <span class="stage-info">

                    <strong>
                        مرحله ${stage}
                    </strong>

                    <small>
                        ${statusText}
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


    async startStage(stage) {

        await quiz.loadCategory(
            this.category
        );


        const completed =
            isStageCompleted(
                state,
                this.category,
                stage
            );


        const isPreviousStage =
            stage <
            this.getUnlockedStage();


        let replay =
            completed ||
            isPreviousStage;


        if (replay) {

            const confirmed =
                confirm(
                    "شما قبلاً امتیاز این مرحله را کسب کرده‌اید.\n\n" +
                    "آیا مایلید دوباره این مرحله را بازی کنید؟\n\n" +
                    "بازی کردن در این مرحله نه از شما قلب کم می‌کند " +
                    "و نه به شما امتیاز اضافه می‌کند."
                );


            if (!confirmed) {

                return;

            }

        }


        quiz.startStage(
            this.category,
            stage,
            replay
        );


        this.currentAnswerLocked =
            false;


        this.showPage(
            "quiz"
        );


        this.renderQuestion();

    },


    renderQuestion() {

        const question =
            quiz.getCurrentQuestion();


        const box =
            document.getElementById(
                "quizBox"
            );


        if (!box) return;


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


        const progress =
            document.getElementById(
                "timerProgress"
            );


        if (progress) {

            progress.style.width =
                `${percentage}%`;

        }

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

            resultBox.innerHTML = `

                <div class="result-success">

                    <strong>
                        ✓ درست!
                    </strong>

                    ${
                        result.finished
                            ? `
                                <span>
                                    نتیجه در پایان مرحله محاسبه می‌شود.
                                </span>
                            `
                            : `
                                <span>
                                    پاسخ درست بود!
                                </span>
                            `
                    }

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
                        این اشتباه به‌تنهایی قلبی کم نمی‌کند.
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


        /*
         * Streak فقط با بردن کامل مرحله
         * تغییر می‌کند.
         */
        if (
            result.passed &&
            !result.isReplay
        ) {

            updateStreak(
                state
            );

            saveState(
                state,
                currentUser
            );

        }


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


        let message;


        if (
            result.isReplay
        ) {

            message = `

                <p class="result-message replay-message">
                    🔄 این مرحله را قبلاً برده بودی.
                    <br>
                    این بار نه XP گرفتی و نه قلبی از دست دادی.
                </p>

            `;

        } else if (passed) {

            message = `

                <p class="result-message success-message">

                    🎉 مرحله را بردی!
                    <br>
                    <strong>
                        +${result.earnedXP} XP
                    </strong>
                    به امتیازت اضافه شد.

                    <br><br>

                    مرحله بعد برایت باز شد!

                </p>

            `;

        } else {

            message = `

                <p class="result-message fail-message">

                    این مرحله را نبردی.

                    <br><br>

                    ${
                        result.heartLost
                            ? "❤️ یک قلب از دست دادی."
                            : "❤️ قلبی از دست نرفت."
                    }

                    <br>

                    XP این مرحله هم اضافه نشد.

                    <br><br>

                    دوباره تلاش کن!

                </p>

            `;

        }


        box.innerHTML = `

            <div class="stage-result">

                <div class="stage-result-icon">
                    ${
                        passed
                            ? "🎉"
                            : "📚"
                    }
                </div>

                <h2>
                    ${
                        result.isReplay
                            ? "بازی مجدد مرحله"
                            : passed
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

                ${message}

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

                this.renderStages();

                box.classList.add(
                    "hidden"
                );

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


        const elements = {

            homeXP:
                state.xp,

            homeStreak:
                state.streak,

            homeLevel:
                state.level,

            quizXP:
                state.xp,

            quizStreak:
                state.streak,

            heartValue:
                state.hearts

        };


        Object.entries(
            elements
        ).forEach(
            ([id, value]) => {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.textContent =
                        value;

                }

            }
        );


        this.renderProfile();

        this.renderLeaderboard();

        this.renderAuthState();

        saveState(
            state,
            currentUser
        );

    },


    renderProfile() {

        const name =
            state.username ||
            "بازیکن مهمان";


        const values = {

            profileName:
                name,

            profileLevel:
                `سطح ${state.level}`,

            profileXP:
                state.xp,

            profileStreak:
                state.streak,

            profileGeneral:
                state.generalStage,

            profileFun:
                state.funStage,

            profileBestCombo:
                state.bestCombo

        };


        Object.entries(
            values
        ).forEach(
            ([id, value]) => {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.textContent =
                        value;

                }

            }
        );


        const avatar =
            document.getElementById(
                "profileAvatar"
            );


        if (avatar) {

            avatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();

        }

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
                    ${
                        Math.max(
                            state.generalStage,
                            state.funStage
                        )
                    }
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


                saveState(
                    state,
                    currentUser
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
            canClaimDailyReward(
                state
            )
        ) {

            button.disabled = false;


            button.addEventListener(
                "click",
                () => {

                    const reward =
                        claimDailyReward(
                            state
                        );


                    state.xp +=
                        reward;


                    state.level =
                        calculateLevel(
                            state.xp
                        );


                    saveState(
                        state,
                        currentUser
                    );


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

    },


    bindAuth() {

        const submit =
            document.getElementById(
                "authSubmit"
            );


        const toggle =
            document.getElementById(
                "toggleAuth"
            );


        if (submit) {

            submit.addEventListener(
                "click",
                () => {

                    this.submitAuth();

                }
            );

        }


        if (toggle) {

            toggle.addEventListener(
                "click",
                () => {

                    this.authMode =
                        this.authMode === "login"
                            ? "register"
                            : "login";


                    this.renderAuthForm();

                }
            );

        }


        const password =
            document.getElementById(
                "authPassword"
            );


        const confirmPassword =
            document.getElementById(
                "authConfirmPassword"
            );


        [
            document.getElementById(
                "authName"
            ),
            password,
            confirmPassword
        ]
            .filter(Boolean)
            .forEach(
                input => {

                    input.addEventListener(
                        "keydown",
                        event => {

                            if (
                                event.key ===
                                "Enter"
                            ) {

                                this.submitAuth();

                            }

                        }
                    );

                }
            );


        this.renderAuthForm();

    },


    renderAuthForm() {

        const title =
            document.getElementById(
                "authTitle"
            );


        const submit =
            document.getElementById(
                "authSubmit"
            );


        const toggle =
            document.getElementById(
                "toggleAuth"
            );


        const confirm =
            document.getElementById(
                "authConfirmPassword"
            );


        if (!title || !submit || !toggle) {

            return;

        }


        const registering =
            this.authMode ===
            "register";


        title.textContent =
            registering
                ? "ثبت‌نام"
                : "ورود";


        submit.textContent =
            registering
                ? "ثبت‌نام"
                : "ورود";


        toggle.textContent =
            registering
                ? "قبلاً حساب داری؟ ورود"
                : "حساب نداری؟ ثبت‌نام";


        if (confirm) {

            confirm.classList.toggle(
                "hidden",
                !registering
            );

        }


        const msg =
            document.getElementById(
                "authMsg"
            );


        if (msg) {

            msg.textContent = "";

            msg.className = "";

        }

    },


    submitAuth() {

        const username =
            document.getElementById(
                "authName"
            ).value;


        const password =
            document.getElementById(
                "authPassword"
            ).value;


        const confirmPassword =
            document.getElementById(
                "authConfirmPassword"
            )?.value || "";


        const result =
            this.authMode ===
            "register"

                ? register(
                    username,
                    password,
                    confirmPassword
                )

                : login(
                    username,
                    password
                );


        const message =
            document.getElementById(
                "authMsg"
            );


        if (message) {

            message.textContent =
                result.message;

            message.className =
                result.success
                    ? "auth-success"
                    : "auth-error";

        }


        if (
            result.success
        ) {

            setTimeout(
                () => {

                    location.reload();

                },
                500
            );

        }

    },


    renderAuthState() {

        const button =
            document.getElementById(
                "authButton"
            );


        if (!button) return;


        if (
            isLoggedIn()
        ) {

            button.textContent =
                "خروج از حساب";

        } else {

            button.textContent =
                "ورود / ثبت‌نام";

        }


        const userLabel =
            document.getElementById(
                "currentUserLabel"
            );


        if (userLabel) {

            userLabel.textContent =
                state.username;

        }

    }

};


app.init();
