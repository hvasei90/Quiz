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
    getCurrentUser,
    getRegisteredUsers,
    login,
    logout,
    register
} from "./auth.js";

import {
    QuizEngine,
    QUIZ_CONFIG
} from "./quiz.js";


const currentUser =
    getCurrentUser();


const state =
    loadState(

        DEFAULT_STATE,

        currentUser ||
        "بازیکن مهمان"

    );


state.username =
    currentUser ||
    "بازیکن مهمان";


const quiz =
    new QuizEngine(

        state,

        () =>
            saveState(

                state,

                currentUser ||
                "بازیکن مهمان"

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

    authMode:
        "login",


    async init() {

        this.applyTheme();

        this.bindNavigation();

        this.bindCategoryTabs();

        this.bindThemeButton();

        this.bindAuth();

        this.bindDailyReward();

        this.bindSupport();

        this.renderAuthButton();

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


                            this.showPage(
                                page
                            );


                            if (
                                page ===
                                "quiz"
                            ) {

                                await this.loadQuiz();

                            }


                            if (
                                page ===
                                "leaderboard"
                            ) {

                                this.renderLeaderboard();

                            }

                        }
                    );

                }
            );

    },


    showPage(page) {

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
            page ===
            "quiz"
        ) {

            this.renderStages();

        }


        if (
            page ===
            "leaderboard"
        ) {

            this.renderLeaderboard();

        }

    },


    bindCategoryTabs() {

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


                            document
                                .querySelectorAll(
                                    "[data-category-tab]"
                                )
                                .forEach(
                                    tab => {

                                        tab.classList.toggle(

                                            "active",

                                            tab ===
                                            button

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

            console.error(error);

        }

    },


    getUnlockedStage() {

        return this.category ===
            "general"

            ? state.generalStage

            : state.funStage;

    },


    getCompletedStages() {

        return this.category ===
            "general"

            ? state.completedGeneralStages

            : state.completedFunStages;

    },


    renderStages() {

        const container =
            document.getElementById(
                "stageList"
            );


        if (!container) return;


        const unlocked =
            this.getUnlockedStage();


        const completed =
            this.getCompletedStages();


        container.innerHTML =
            "";


        for (
            let stage = 1;
            stage <= 10;
            stage++
        ) {

            /*
             * مهمان فقط تا مرحله ۳
             * اجازه بازی دارد.
             */

            const guestLocked =
                !currentUser &&
                stage > 3;


            const locked =
                stage > unlocked ||
                guestLocked;


            const done =
                completed.includes(
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
                    done
                        ? "completed"
                        : ""
                }`;


            card.innerHTML = `

                <span class="stage-number">

                    ${
                        locked
                            ? "🔒"
                            : done
                                ? "✓"
                                : stage
                    }

                </span>


                <span class="stage-info">

                    <strong>
                        مرحله ${stage}
                    </strong>


                    <small>

                        ${
                            guestLocked

                                ? "نیاز به ثبت‌نام"

                                : locked

                                    ? "قفل است"

                                    : done

                                        ? "این مرحله را بردی ✓"

                                        : "آماده بازی"

                        }

                    </small>

                </span>


                <span class="stage-xp">

                    +${QUIZ_CONFIG.stageXP} XP

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

            } else if (
                guestLocked
            ) {

                card.addEventListener(
                    "click",
                    () =>
                        this.showGuestLimitMessage()
                );

            }


            container.appendChild(
                card
            );

        }

    },


    async startStage(stage) {

        const guestLimit =
            3;


        if (
            !currentUser &&
            stage > guestLimit
        ) {

            this.showGuestLimitMessage();

            return;

        }


        const completed =
            isStageCompleted(

                state,

                this.category,

                stage

            );


        const unlocked =
            this.getUnlockedStage();


        if (
            stage > unlocked
        ) {

            return;

        }


        let replay =
            false;


        if (completed) {

            replay =
                window.confirm(

                    "شما قبلاً امتیاز این مرحله را کسب کرده‌اید.\n\n" +

                    "آیا مایلید دوباره این مرحله را بازی کنید؟\n\n" +

                    "بازی کردن در این مرحله نه از شما قلب کم می‌کند و نه XP اضافه می‌کند."

                );


            if (!replay) {

                return;

            }

        }


        if (
            !replay &&
            state.hearts <= 0
        ) {

            alert(

                "قلب‌های شما تمام شده است. برای بازی دوباره باید منتظر بمانید."

            );


            return;

        }


        await quiz.loadCategory(
            this.category
        );


        quiz.startStage(

            this.category,

            stage,

            replay

        );


        if (
            !quiz.getQuestionCount()
        ) {

            alert(
                "برای این مرحله هنوز سوالی ثبت نشده است."
            );

            return;

        }


        this.currentAnswerLocked =
            false;


        this.showPage(
            "quiz"
        );


        this.renderQuestion();

    },


    showGuestLimitMessage() {

        const message =

            "حالت مهمان فقط اجازه بازی تا مرحله ۳ هر بخش را دارد.\n\n" +

            "برای ادامه مراحل، لطفاً ثبت‌نام کن.";


        const goToAuth =
            window.confirm(

                `${message}\n\n` +

                "می‌خواهی همین حالا وارد بخش ثبت‌نام شوی؟"

            );


        if (goToAuth) {

            this.setAuthMode(
                "register"
            );


            this.showPage(
                "auth"
            );

        }

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

            question.question ||
            question.q ||
            "";


        document.getElementById(
            "quizProgress"
        ).style.width =

            `${
                (
                    quiz.currentQuestion /
                    quiz.getQuestionCount()
                ) * 100
            }%`;


        const answers =
            document.getElementById(
                "answers"
            );


        answers.innerHTML =
            "";


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


        document.getElementById(
            "quizResult"
        ).innerHTML =
            "";


        document.getElementById(
            "nextQuestionBtn"
        ).classList.add(
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


        progress.style.width =

            `${
                (
                    this.timeLeft /
                    QUIZ_CONFIG.questionTime
                ) * 100
            }%`;

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


        buttons.forEach(
            button => {

                button.disabled =
                    true;

            }
        );


        const resultBox =
            document.getElementById(
                "quizResult"
            );


        if (result.correct) {

            if (
                !result.replay
            ) {

                updateStreak(
                    state
                );

            }


            resultBox.innerHTML = `

                <div class="result-success">

                    <strong>
                        ✓ درست!
                    </strong>

                    <span>

                        ${
                            result.finished

                                ? "امتیاز مرحله در پایان محاسبه می‌شود."

                                : "آفرین!"

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

                        این پاسخ فقط روی نتیجه نهایی مرحله اثر می‌گذارد.

                    </span>

                </div>

            `;

        }


        if (
            result.explanation
        ) {

            resultBox.innerHTML += `

                <p class="explanation">

                    ${
                        escapeHTML(
                            result.explanation
                        )
                    }

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


        box.innerHTML = `

            <div class="stage-result">

                <div class="stage-result-icon">

                    ${
                        result.passed
                            ? "🎉"
                            : "📚"
                    }

                </div>


                <h2>

                    ${
                        result.passed

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
                    result.passed

                        ? result.replay

                            ? `

                                <p class="result-message">

                                    این یک بازی مجدد بود؛

                                    XP و قلب تغییری نکرد.

                                </p>

                            `

                            : `

                                <p class="result-message">

                                    +${result.earnedXP} XP

                                    برای تکمیل مرحله گرفتی

                                    و مرحله بعد باز شد.

                                </p>

                            `

                        : result.replay

                            ? `

                                <p class="result-message">

                                    این بازی مجدد بود؛

                                    قلبی کم نشد.

                                </p>

                            `

                            : `

                                <p class="result-message">

                                    یک قلب بابت کامل نکردن

                                    مرحله کم شد.

                                </p>

                            `

                }


                <button
                    class="primary-btn"
                    id="closeResult"
                >

                    بازگشت به مراحل

                </button>

            </div>

        `;


        document.getElementById(
            "closeResult"
        ).onclick = () => {

            this.showPage(
                "quiz"
            );


            this.renderStages();


            document
                .getElementById(
                    "quizBox"
                )
                .classList.add(
                    "hidden"
                );

        };

    },


    updateCombo() {

        const combo =
            document.getElementById(
                "comboValue"
            );


        if (combo) {

            combo.textContent =
                quiz.combo;

        }

    },


    renderAll() {

        state.level =
            calculateLevel(
                state.xp
            );


        const values = {

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


        this.renderProfile();

        this.renderLeaderboard();

        this.renderAuthButton();


        saveState(

            state,

            currentUser ||
            "بازیکن مهمان"

        );

    },


    renderProfile() {

        const name =
            state.username ||
            "بازیکن مهمان";


        const set =
            (id, value) => {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.textContent =
                        value;

                }

            };


        set(
            "profileName",
            name
        );


        set(
            "profileLevel",
            `سطح ${state.level}`
        );


        set(
            "profileXP",
            state.xp
        );


        set(
            "profileStreak",
            state.streak
        );


        set(
            "profileGeneral",
            state.generalStage
        );


        set(
            "profileFun",
            state.funStage
        );


        set(
            "profileBestCombo",
            state.bestCombo
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


        const users =
            getRegisteredUsers();


        const players =
            users.map(
                user => {

                    const playerState =
                        loadState(

                            DEFAULT_STATE,

                            user.username

                        );


                    const generalCompleted =

                        Array.isArray(
                            playerState.completedGeneralStages
                        )

                            ? playerState.completedGeneralStages

                            : [];


                    const funCompleted =

                        Array.isArray(
                            playerState.completedFunStages
                        )

                            ? playerState.completedFunStages

                            : [];


                    return {

                        username:
                            user.username,

                        xp:
                            Number(
                                playerState.xp
                            ) || 0,

                        level:
                            calculateLevel(

                                Number(
                                    playerState.xp
                                ) || 0

                            ),

                        generalStage:

                            generalCompleted.length

                                ? Math.max(
                                    ...generalCompleted
                                )

                                : 0,

                        funStage:

                            funCompleted.length

                                ? Math.max(
                                    ...funCompleted
                                )

                                : 0

                    };

                }
            );


        players.sort(
            (a, b) => {

                if (
                    b.xp !==
                    a.xp
                ) {

                    return (
                        b.xp -
                        a.xp
                    );

                }


                return a.username.localeCompare(
                    b.username,
                    "fa"
                );

            }
        );


        if (
            !players.length
        ) {

            body.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="empty-leaderboard"
                    >

                        هنوز بازیکن ثبت‌نام‌شده‌ای وجود ندارد.

                    </td>

                </tr>

            `;


            return;

        }


        body.innerHTML =
            players
                .map(

                    (player, index) => `

                        <tr
                            class="${
                                currentUser ===
                                player.username
                                    ? "current-player"
                                    : ""
                            }"
                        >

                            <td>

                                ${index + 1}

                            </td>


                            <td>

                                <strong>

                                    ${
                                        escapeHTML(
                                            player.username
                                        )
                                    }

                                </strong>


                                ${
                                    currentUser ===
                                    player.username

                                        ? `

                                            <span
                                                class="you-badge"
                                            >

                                                شما

                                            </span>

                                        `

                                        : ""

                                }

                            </td>


                            <td>

                                ${player.xp}
                                XP

                            </td>


                            <td>

                                سطح
                                ${player.level}

                            </td>


                            <td>

                                ${player.generalStage}

                                /

                                ${player.funStage}

                            </td>

                        </tr>

                    `

                )
                .join("");

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

                    state.theme ===
                    "dark"

                        ? "light"

                        : "dark";


                saveState(

                    state,

                    currentUser ||
                    "بازیکن مهمان"

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

                state.theme ===
                "dark"

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
            !canClaimDailyReward(
                state
            )
        ) {

            button.disabled =
                true;


            button.textContent =
                "✓ جایزه امروز دریافت شده";


            return;

        }


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

                    currentUser ||
                    "بازیکن مهمان"

                );


                this.renderAll();


                alert(

                    `🎁 ${reward} XP جایزه روزانه گرفتی!`

                );

            }
        );

    },


    bindAuth() {

        const authButton =
            document.getElementById(
                "authButton"
            );


        const authSubmit =
            document.getElementById(
                "authSubmit"
            );


        const toggleAuth =
            document.getElementById(
                "toggleAuth"
            );


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (authButton) {

            authButton.addEventListener(
                "click",
                () => {

                    if (currentUser) {

                        logout();

                        location.reload();

                        return;

                    }


                    this.setAuthMode(
                        "login"
                    );


                    this.showPage(
                        "auth"
                    );

                }
            );

        }


        if (authSubmit) {

            authSubmit.addEventListener(
                "click",
                () =>
                    this.submitAuth()
            );

        }


        if (toggleAuth) {

            toggleAuth.addEventListener(
                "click",
                () => {

                    this.setAuthMode(

                        this.authMode ===
                        "login"

                            ? "register"

                            : "login"

                    );

                }
            );

        }


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                () => {

                    logout();

                    location.reload();

                }
            );

        }

    },


    setAuthMode(mode) {

        this.authMode =
            mode;


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


        const confirmWrap =
            document.getElementById(
                "confirmPasswordWrap"
            );


        const msg =
            document.getElementById(
                "authMsg"
            );


        if (title) {

            title.textContent =

                mode === "login"

                    ? "ورود به QuizDuo"

                    : "ساخت حساب QuizDuo";

        }


        if (submit) {

            submit.textContent =

                mode === "login"

                    ? "ورود"

                    : "ثبت‌نام";

        }


        if (toggle) {

            toggle.textContent =

                mode === "login"

                    ? "حساب نداری؟ ثبت‌نام کن"

                    : "قبلاً حساب ساخته‌ای؟ وارد شو";

        }


        if (confirmWrap) {

            confirmWrap.classList.toggle(

                "hidden",

                mode === "login"

            );

        }


        if (msg) {

            msg.textContent =
                "";

        }

    },


    submitAuth() {

        const name =
            document.getElementById(
                "authName"
            ).value;


        const password =
            document.getElementById(
                "authPassword"
            ).value;


        const confirm =
            document.getElementById(
                "authConfirmPassword"
            )?.value ||
            "";


        const msg =
            document.getElementById(
                "authMsg"
            );


        const result =

            this.authMode ===
            "login"

                ? login(
                    name,
                    password
                )

                : register(
                    name,
                    password,
                    confirm
                );


        if (!result.ok) {

            msg.textContent =
                result.message;


            msg.className =
                "auth-error";


            return;

        }


        msg.textContent =

            this.authMode ===
            "login"

                ? "ورود موفق بود. در حال ورود..."

                : "ثبت‌نام موفق بود. در حال ورود...";


        msg.className =
            "auth-success";


        setTimeout(
            () =>
                location.reload(),
            300
        );

    },


    renderAuthButton() {

        const button =
            document.getElementById(
                "authButton"
            );


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        const userLabel =
            document.getElementById(
                "userLabel"
            );


        if (button) {

            button.textContent =

                currentUser

                    ? "خروج"

                    : "ورود / ثبت‌نام";

        }


        if (logoutButton) {

            logoutButton.classList.toggle(

                "hidden",

                !currentUser

            );

        }


        if (userLabel) {

            userLabel.textContent =

                currentUser

                    ? `سلام، ${currentUser}`

                    : "بازیکن مهمان";

        }

    },


    bindSupport() {

        const button =
            document.getElementById(
                "supportSend"
            );


        if (!button) return;


        button.addEventListener(
            "click",
            () => {

                const message =
                    document.getElementById(
                        "supportMsg"
                    );


                if (message) {

                    message.textContent =
                        "پیام پشتیبانی در نسخه فعلی فقط به‌صورت نمایشی ثبت شد.";

                }

            }
        );

    }

};


app.init();
