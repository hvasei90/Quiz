import {
    DEFAULT_STATE,
    calculateLevel,
    hasCompletedStage
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



/*
 * نام کاربر فعلی
 */

let currentUsername =
    getCurrentUser() ||
    "guest";



const state =
    loadState(
        DEFAULT_STATE,
        currentUsername
    );



/*
 * اگر کاربر وارد شده باشد،
 * نام حساب روی state قرار می‌گیرد.
 */

if (
    isLoggedIn()
) {

    state.username =
        currentUsername;

}



const quiz =
    new QuizEngine(
        state,
        () =>
            saveState(
                state,
                currentUsername
            )
    );



const app = {


    category:
        state.currentCategory ||
        "general",


    timer: null,


    timeLeft: 0,


    currentAnswerLocked:
        false,



    async init() {


        this.applyTheme();


        this.bindNavigation();


        this.bindQuizTabs();


        this.bindCategoryButtons();


        this.bindThemeButton();


        this.bindDailyReward();


        this.bindChat();


        this.bindAuth();


        this.updateAuthUI();


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



        if (
            target
        ) {

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
                                state,
                                currentUsername
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
                                state,
                                currentUsername
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


        if (
            !container
        ) {

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


            const completed =
                hasCompletedStage(
                    state,
                    this.category,
                    stage
                );


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
                "stage-card";


            if (
                locked
            ) {

                card.classList.add(
                    "locked"
                );

            }


            if (
                completed
            ) {

                card.classList.add(
                    "completed"
                );

            }



            /*
             * متن داخل کارت مرحله
             *
             * دیگر عبارت «۲ سؤال تصادفی»
             * نمایش داده نمی‌شود.
             */

            let statusText =
                "آماده بازی";


            if (
                locked
            ) {

                statusText =
                    "قفل است";

            } else if (
                completed
            ) {

                statusText =
                    "✓ این مرحله را بردی!";

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



            if (
                !locked
            ) {


                card.addEventListener(
                    "click",
                    () =>
                        this.handleStageClick(
                            stage,
                            completed
                        )
                );

            }



            container.appendChild(
                card
            );

        }

    },



    handleStageClick(
        stage,
        completed
    ) {


        if (
            completed
        ) {


            const confirmed =
                confirm(
                    "شما قبلاً امتیاز این مرحله را کسب کرده‌اید.\n\nآیا مایلید دوباره این مرحله را بازی کنید؟\n\nنکته: بازی کردن دوباره این مرحله نه از شما قلب کم می‌کند و نه به شما امتیاز اضافه خواهد کرد."
                );



            if (
                !confirmed
            ) {

                return;

            }

        }



        this.startStage(
            stage
        );

    },



    async startStage(
        stage
    ) {


        /*
         * اگر مرحله قبلاً برده شده باشد،
         * Replay محسوب می‌شود و Heart لازم ندارد.
         */

        const replay =
            hasCompletedStage(
                state,
                this.category,
                stage
            );



        /*
         * برای مرحله جدید باید Heart داشته باشیم.
         */

        if (
            !replay &&
            state.hearts <= 0
        ) {


            alert(
                "❤️ قلب کافی نداری. برای شروع یک مرحله جدید باید حداقل یک قلب داشته باشی."
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


            if (
                box
            ) {

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
            (
                button,
                buttonIndex
            ) => {


                button.disabled =
                    true;



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

                        ${
                            result.replay
                                ? "این مرحله Replay است؛ XP اضافه نمی‌شود."
                                : `+${result.earnedXP} XP`
                        }

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



        let title = "";


        let icon = "";


        let message = "";



        if (
            result.replay
        ) {


            icon =
                "🔁";


            title =
                "Replay مرحله";


            message =
                "این مرحله را قبلاً با موفقیت گذرانده‌ای.\nبازی دوباره هیچ XP یا Heart به تو نمی‌دهد.";

        } else if (
            result.passed
        ) {


            icon =
                "🎉";


            title =
                "مرحله را با موفقیت گذراندی!";


            message =
                "مرحله بعد برایت باز شد.";

        } else {


            icon =
                "📚";


            title =
                "این مرحله را باختی";


            message =
                "برای عبور از این مرحله باید دوباره تلاش کنی.";

        }



        box.innerHTML = `

            <div class="stage-result">


                <div class="stage-result-icon">

                    ${icon}

                </div>


                <p class="eyebrow">
                    STAGE RESULT
                </p>


                <h2>
                    ${title}
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
                    result.replay

                        ? `

                            <p class="result-message">

                                🔁 ${message}

                            </p>

                        `

                        : result.passed

                            ? `

                                <p class="result-message success-text">

                                    🔓 ${message}

                                </p>

                            `

                            : `

                                <p class="result-message">

                                    ❌ ${message}

                                    ${
                                        result.heartLost
                                            ? "<br>❤️ یک قلب از دست دادی."
                                            : ""
                                    }

                                </p>

                            `
                }


                ${
                    result.replay

                        ? `

                            <p class="result-message">

                                💡 این Replay هیچ XP یا Heart
                                به حساب تو اضافه یا از آن کم نمی‌کند.

                            </p>

                        `

                        : ""

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


                this.renderStages();


                this.renderAll();

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


        this.updateAuthUI();



        saveState(
            state,
            currentUsername
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
                    state,
                    currentUsername
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
                    state,
                    currentUsername
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

    },



    /* =========================
       AUTH
    ========================== */

    bindAuth() {


        const loginForm =
            document.getElementById(
                "loginForm"
            );


        const registerForm =
            document.getElementById(
                "registerForm"
            );



        document
            .querySelectorAll(
                "[data-auth-tab]"
            )
            .forEach(
                button => {


                    button.addEventListener(
                        "click",
                        () => {


                            const type =
                                button.dataset.authTab;



                            document
                                .querySelectorAll(
                                    "[data-auth-tab]"
                                )
                                .forEach(
                                    tab => {

                                        tab.classList.toggle(
                                            "active",
                                            tab === button
                                        );

                                    }
                                );



                            if (
                                type ===
                                "login"
                            ) {


                                loginForm.classList.remove(
                                    "hidden"
                                );


                                registerForm.classList.add(
                                    "hidden"
                                );


                            } else {


                                loginForm.classList.add(
                                    "hidden"
                                );


                                registerForm.classList.remove(
                                    "hidden"
                                );

                            }



                            this.showAuthMessage(
                                "",
                                ""
                            );

                        }
                    );

                }
            );



        loginForm.addEventListener(
            "submit",
            event => {


                event.preventDefault();



                const username =
                    document.getElementById(
                        "loginUsername"
                    ).value;


                const password =
                    document.getElementById(
                        "loginPassword"
                    ).value;



                const result =
                    login(
                        username,
                        password
                    );



                if (
                    !result.success
                ) {


                    this.showAuthMessage(
                        result.message,
                        "error"
                    );


                    return;

                }



                currentUsername =
                    result.username;



                /*
                 * state حساب جدید را بارگذاری می‌کند.
                 */

                const newState =
                    loadState(
                        DEFAULT_STATE,
                        currentUsername
                    );



                Object.keys(
                    state
                ).forEach(
                    key => {

                        delete state[key];

                    }
                );



                Object.assign(
                    state,
                    newState
                );



                state.username =
                    currentUsername;



                this.category =
                    state.currentCategory ||
                    "general";



                document.getElementById(
                    "loginForm"
                ).reset();



                this.showAuthMessage(
                    "✓ ورود با موفقیت انجام شد.",
                    "success"
                );



                this.updateAuthUI();


                this.applyTheme();


                this.renderAll();


                this.loadQuiz();



                setTimeout(
                    () => {

                        this.showPage(
                            "home"
                        );

                    },
                    500
                );

            }
        );



        registerForm.addEventListener(
            "submit",
            event => {


                event.preventDefault();



                const username =
                    document.getElementById(
                        "registerUsername"
                    ).value;


                const password =
                    document.getElementById(
                        "registerPassword"
                    ).value;


                const confirmPassword =
                    document.getElementById(
                        "registerPasswordConfirm"
                    ).value;



                const result =
                    register(
                        username,
                        password,
                        confirmPassword
                    );



                if (
                    !result.success
                ) {


                    this.showAuthMessage(
                        result.message,
                        "error"
                    );


                    return;

                }



                currentUsername =
                    result.username;



                const newState =
                    loadState(
                        DEFAULT_STATE,
                        currentUsername
                    );



                Object.keys(
                    state
                ).forEach(
                    key => {

                        delete state[key];

                    }
                );



                Object.assign(
                    state,
                    newState
                );



                state.username =
                    currentUsername;



                document.getElementById(
                    "registerForm"
                ).reset();



                this.updateAuthUI();


                this.applyTheme();


                this.renderAll();


                this.loadQuiz();



                this.showAuthMessage(
                    "✓ حساب با موفقیت ساخته شد و وارد شدید.",
                    "success"
                );



                setTimeout(
                    () => {

                        this.showPage(
                            "home"
                        );

                    },
                    700
                );

            }
        );



        const logoutButton =
            document.getElementById(
                "logoutButton"
            );



        logoutButton.addEventListener(
            "click",
            () => {


                logout();


                currentUsername =
                    "guest";



                const guestState =
                    loadState(
                        DEFAULT_STATE,
                        "guest"
                    );



                Object.keys(
                    state
                ).forEach(
                    key => {

                        delete state[key];

                    }
                );



                Object.assign(
                    state,
                    guestState
                );



                state.username =
                    "بازیکن مهمان";



                this.updateAuthUI();


                this.renderAll();


                this.applyTheme();



                this.showPage(
                    "home"
                );

            }
        );

    },



    showAuthMessage(
        message,
        type
    ) {


        const box =
            document.getElementById(
                "authMessage"
            );



        if (
            !box
        ) {

            return;

        }



        box.textContent =
            message;


        box.className =
            "auth-message";


        if (
            type
        ) {

            box.classList.add(
                type
            );

        }

    },



    updateAuthUI() {


        const loginButton =
            document.getElementById(
                "authNavButton"
            );


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );



        if (
            isLoggedIn()
        ) {


            loginButton.classList.add(
                "hidden"
            );


            logoutButton.classList.remove(
                "hidden"
            );


            logoutButton.textContent =
                `خروج (${state.username})`;


        } else {


            loginButton.classList.remove(
                "hidden"
            );


            logoutButton.classList.add(
                "hidden"
            );

        }

    }

};



app.init();
