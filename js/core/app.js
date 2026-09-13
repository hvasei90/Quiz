import {
    DEFAULT_STATE,
    calculateLevel,
    getUnlockedStage,
    isStageCompleted
} from "./state.js";

import {
    loadState,
    saveState,
    getCurrentUser,
    setCurrentUser,
    logoutUser,
    getUsers,
    saveUsers,
    getLeaderboard,
    updateLeaderboard
} from "./storage.js";

import {
    updateStreak,
    escapeHTML
} from "./utils.js";

import {
    QuizEngine,
    QUIZ_CONFIG
} from "./quiz.js";


const currentUser =
    getCurrentUser();


const state =
    loadState(
        DEFAULT_STATE,
        currentUser || "guest"
    );


state.username =
    currentUser ||
    "بازیکن مهمان";


const quiz =
    new QuizEngine(
        state,
        () => {

            state.level =
                calculateLevel(
                    state.xp
                );

            saveState(
                state,
                currentUser || "guest"
            );

            if (currentUser) {

                updateLeaderboard(
                    state
                );

            }

        }
    );


const subscriptionPlans = {

    monthly: {
        name: "ماهانه",
        months: 1,
        price: 100000,
        gift: 0
    },

    quarterly: {
        name: "سه‌ماهه",
        months: 3,
        price: 270000,
        gift: 0
    },

    sixMonth: {
        name: "شش‌ماهه",
        months: 6,
        price: 480000,
        gift: 1
    },

    nineMonth: {
        name: "نه‌ماهه",
        months: 9,
        price: 660000,
        gift: 2
    }

};


const discountCodes = {

    QUIZDUO10: 10,

    WELCOME15: 15,

    STUDENT10: 10

};


const app = {

    category:
        "general",

    timer:
        null,

    timeLeft:
        0,

    answerLocked:
        false,

    selectedPlan:
        null,

    discountPercent:
        0,


    init() {

        this.applyTheme();

        this.bindNavigation();

        this.bindAuth();

        this.bindQuiz();

        this.bindTheme();

        this.bindSubscription();

        this.renderAll();

        this.renderAuthState();

        this.showPage(
            "home"
        );

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
                        () => {

                            this.showPage(
                                button.dataset.page
                            );

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
            page === "quiz"
        ) {

            this.loadCategory();

        }


        if (
            page === "leaderboard"
        ) {

            this.renderLeaderboard();

        }


        if (
            page === "profile"
        ) {

            this.renderProfile();

        }

    },


    bindQuiz() {

        document
            .querySelectorAll(
                "[data-category-tab]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            document
                                .querySelectorAll(
                                    "[data-category-tab]"
                                )
                                .forEach(
                                    item =>
                                        item.classList.remove(
                                            "active"
                                        )
                                );


                            button.classList.add(
                                "active"
                            );


                            this.category =
                                button.dataset.categoryTab;


                            await this.loadCategory();

                        }
                    );

                }
            );

    },


    async loadCategory() {

        try {

            await quiz.loadCategory(
                this.category
            );

            this.renderStages();

        } catch (error) {

            console.error(
                error
            );

            const list =
                document.getElementById(
                    "stageList"
                );

            if (list) {

                list.innerHTML = `

                    <div class="panel error-panel">

                        فایل سوالات پیدا نشد.

                    </div>

                `;

            }

        }

    },


    renderStages() {

        const container =
            document.getElementById(
                "stageList"
            );


        if (!container) return;


        container.innerHTML =
            "";


        const unlocked =
            getUnlockedStage(
                state,
                this.category
            );


        const completed =
            this.category === "general"

                ? state.completedGeneralStages || []

                : state.completedFunStages || [];


        const maxStage =
            Math.max(
                10,
                unlocked,
                ...completed,
                1
            );


        for (
            let stage = 1;
            stage <= maxStage;
            stage++
        ) {

            const locked =
                stage > unlocked;


            const done =
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
                `stage-card
                ${locked ? "locked" : ""}
                ${done ? "completed" : ""}`;


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
                            locked
                                ? "قفل است"
                                : done
                                    ? "این مرحله را بردی ✓"
                                    : "برای شروع کلیک کن"
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
                            stage,
                            done
                        )
                );

            }


            container.appendChild(
                card
            );

        }

    },


    async startStage(
        stage,
        completed
    ) {

        if (
            !currentUser &&
            stage > 3
        ) {

            alert(
                "برای ادامه باید ثبت‌نام یا وارد حساب کاربری شوی."
            );

            this.showPage(
                "auth"
            );

            return;

        }


        let replay =
            false;


        if (completed) {

            replay =
                confirm(
                    "این مرحله را قبلاً کامل کرده‌ای.\n\n" +
                    "آیا می‌خواهی دوباره بازی کنی؟\n\n" +
                    "در بازی مجدد نه قلب کم می‌شود و نه XP جدید می‌گیری."
                );


            if (!replay) {

                return;

            }

        }


        await quiz.loadCategory(
            this.category
        );


        const questions =
            quiz.startStage(
                this.category,
                stage,
                replay
            );


        if (!questions.length) {

            alert(
                "برای این مرحله هنوز سوالی ثبت نشده است."
            );

            return;

        }


        this.answerLocked =
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


        if (!box || !question) {

            return;

        }


        box.classList.remove(
            "hidden"
        );


        document.getElementById(
            "quizCategory"
        ).textContent =

            this.category === "general"

                ? "🧠 اطلاعات عمومی"

                : "🎮 تفریحی";


        document.getElementById(
            "questionNumber"
        ).textContent =

            `${quiz.currentQuestion + 1} / ${quiz.getQuestionCount()}`;


        document.getElementById(
            "questionText"
        ).textContent =

            question.q ||
            question.question;


        const options =
            question.options ||
            question.o ||
            [];


        const answers =
            document.getElementById(
                "answers"
            );


        answers.innerHTML =
            "";


        options.forEach(
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
            "quizProgress"
        ).style.width =

            `${
                (
                    quiz.currentQuestion /
                    quiz.getQuestionCount()
                ) * 100
            }%`;


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

        }


        this.timer =
            null;

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


        if (timer) {

            timer.textContent =
                `${this.timeLeft}s`;

        }


        if (progress) {

            progress.style.width =

                `${
                    (
                        this.timeLeft /
                        QUIZ_CONFIG.questionTime
                    ) * 100
                }%`;

        }

    },


    submitAnswer(index) {

        if (
            this.answerLocked
        ) {

            return;

        }


        this.answerLocked =
            true;


        this.stopTimer();


        const result =
            quiz.answer(
                index
            );


        document
            .querySelectorAll(
                ".answer-btn"
            )
            .forEach(
                button => {

                    button.disabled =
                        true;

                }
            );


        const resultBox =
            document.getElementById(
                "quizResult"
            );


        resultBox.innerHTML = result.correct

            ? `

                <div class="result-success">

                    <strong>
                        ✓ درست!
                    </strong>

                    <span>
                        آفرین!
                    </span>

                </div>

            `

            : `

                <div class="result-error">

                    <strong>
                        ${
                            index === null
                                ? "⏰ زمان تمام شد!"
                                : "✕ پاسخ نادرست"
                        }
                    </strong>

                    <span>
                        این پاسخ به‌تنهایی قلب کم نمی‌کند.
                    </span>

                </div>

            `;


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


        this.renderAll();


        const next =
            document.getElementById(
                "nextQuestionBtn"
            );


        next.classList.remove(
            "hidden"
        );


        next.textContent =
            result.finished

                ? "مشاهده نتیجه مرحله"

                : "سؤال بعدی →";


        next.onclick =
            () => {

                if (
                    result.finished
                ) {

                    this.showStageResult(
                        result
                    );

                } else {

                    this.answerLocked =
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


        if (
            result.passed &&
            result.newlyCompleted
        ) {

            updateStreak(
                state
            );


            saveState(
                state,
                currentUser || "guest"
            );


            if (currentUser) {

                updateLeaderboard(
                    state
                );

            }

        }


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

                        ? `

                            <p class="result-message">

                                ${
                                    result.newlyCompleted

                                        ? `⭐ +${QUIZ_CONFIG.stageXP} XP`

                                        : "این مرحله قبلاً جایزه گرفته است."
                                }

                            </p>

                        `

                        : `

                            <p class="result-message">

                                ${
                                    result.heartLost

                                        ? "❤️ یک قلب کم شد."

                                        : "در بازی مجدد قلبی کم نمی‌شود."
                                }

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


        document
            .getElementById(
                "closeResult"
            )
            .onclick =
            () => {

                this.showPage(
                    "quiz"
                );

                this.renderStages();

            };

    },


    bindSubscription() {

        document
            .querySelectorAll(
                ".subscribe-btn"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            this.selectPlan(
                                button.dataset.plan
                            );

                        }
                    );

                }
            );


        document
            .getElementById(
                "applyDiscount"
            )
            .addEventListener(
                "click",
                () => {

                    this.applyDiscount();

                }
            );


        document
            .getElementById(
                "paymentRequest"
            )
            .addEventListener(
                "click",
                () => {

                    this.submitPaymentRequest();

                }
            );

    },


    selectPlan(
        planKey
    ) {

        if (!currentUser) {

            alert(
                "برای خرید اشتراک ابتدا باید ثبت‌نام یا وارد حساب کاربری شوی."
            );


            this.showPage(
                "auth"
            );


            return;

        }


        const plan =
            subscriptionPlans[
                planKey
            ];


        if (!plan) return;


        this.selectedPlan =
            planKey;


        this.discountPercent =
            0;


        document.getElementById(
            "discountCode"
        ).value =
            "";


        document.getElementById(
            "discountMessage"
        ).textContent =
            "";


        document.getElementById(
            "selectedPlanText"
        ).textContent =

            `${plan.name} • ${plan.months} ماه`;


        document.getElementById(
            "paymentAmount"
        ).textContent =

            this.formatPrice(
                plan.price
            );


        document.getElementById(
            "finalPaymentAmount"
        ).textContent =

            this.formatPrice(
                plan.price
            );


        document
            .getElementById(
                "paymentPanel"
            )
            .classList.remove(
                "hidden"
            );


        document
            .getElementById(
                "paymentPanel"
            )
            .scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

    },


    applyDiscount() {

        const input =
            document.getElementById(
                "discountCode"
            );


        const code =
            input.value
                .trim()
                .toUpperCase();


        const message =
            document.getElementById(
                "discountMessage"
            );


        if (!this.selectedPlan) {

            return;

        }


        if (
            !code
        ) {

            message.textContent =
                "کد تخفیف را وارد کن.";

            this.discountPercent =
                0;

            this.updateFinalPrice();

            return;

        }


        if (
            discountCodes[code]
        ) {

            this.discountPercent =
                discountCodes[code];


            message.textContent =
                `🎉 کد تخفیف ${this.discountPercent}٪ اعمال شد.`;


        } else {

            this.discountPercent =
                0;


            message.textContent =
                "❌ این کد تخفیف معتبر نیست.";

        }


        this.updateFinalPrice();

    },


    updateFinalPrice() {

        const plan =
            subscriptionPlans[
                this.selectedPlan
            ];


        if (!plan) return;


        const discount =
            plan.price *
            (
                this.discountPercent /
                100
            );


        const finalPrice =
            Math.max(
                0,
                Math.round(
                    plan.price -
                    discount
                )
            );


        document.getElementById(
            "finalPaymentAmount"
        ).textContent =

            this.formatPrice(
                finalPrice
            );

    },


    submitPaymentRequest() {

        if (!currentUser) {

            return;

        }


        if (!this.selectedPlan) {

            return;

        }


        const plan =
            subscriptionPlans[
                this.selectedPlan
            ];


        const discount =
            plan.price *
            (
                this.discountPercent /
                100
            );


        const finalPrice =
            Math.max(
                0,
                Math.round(
                    plan.price -
                    discount
                )
            );


        const requests =
            JSON.parse(
                localStorage.getItem(
                    "quizduo_payment_requests"
                ) || "[]"
            );


        requests.push({

            username:
                currentUser,

            plan:
                this.selectedPlan,

            planName:
                plan.name,

            amount:
                finalPrice,

            discount:
                this.discountPercent,

            status:
                "pending",

            createdAt:
                Date.now()

        });


        localStorage.setItem(
            "quizduo_payment_requests",
            JSON.stringify(
                requests
            )
        );


        document.getElementById(
            "paymentMessage"
        ).textContent =

            "✅ درخواست شما ثبت شد و پس از بررسی فعال خواهد شد.";

    },


    formatPrice(
        price
    ) {

        return (
            Number(price)
                .toLocaleString("fa-IR")
            + " تومان"
        );

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
            "homeLevel"
        ).textContent =
            state.level;


        document.getElementById(
            "homeStreak"
        ).textContent =
            state.streak;


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

    },


    renderProfile() {

        document.getElementById(
            "profileName"
        ).textContent =
            state.username;


        document.getElementById(
            "profileXP"
        ).textContent =
            state.xp;


        document.getElementById(
            "profileLevel"
        ).textContent =
            state.level;


        document.getElementById(
            "profileStreak"
        ).textContent =
            state.streak;


        document.getElementById(
            "profileGeneral"
        ).textContent =
            Math.max(
                0,
                state.generalStage - 1
            );


        document.getElementById(
            "profileFun"
        ).textContent =
            Math.max(
                0,
                state.funStage - 1
            );


        document.getElementById(
            "profileHearts"
        ).textContent =
            state.hearts;

    },


    renderLeaderboard() {

        const body =
            document.getElementById(
                "leaderboardBody"
            );


        if (!body) return;


        const board =
            getLeaderboard()
                .sort(
                    (a, b) =>
                        b.xp - a.xp ||
                        b.level - a.level
                );


        if (!board.length) {

            body.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="empty"
                    >
                        هنوز بازیکنی ثبت نشده است.
                    </td>

                </tr>

            `;

            return;

        }


        body.innerHTML =
            board
                .map(
                    (
                        item,
                        index
                    ) => `

                        <tr
                            class="${
                                item.username ===
                                state.username
                                    ? "me-row"
                                    : ""
                            }"
                        >

                            <td>
                                ${
                                    index === 0
                                        ? "🥇"
                                        : index === 1
                                            ? "🥈"
                                            : index === 2
                                                ? "🥉"
                                                : index + 1
                                }
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.username
                                )}
                            </td>

                            <td>
                                ${item.xp}
                            </td>

                            <td>
                                ${item.level}
                            </td>

                            <td>
                                ${
                                    Math.max(
                                        item.generalStage,
                                        item.funStage
                                    )
                                }
                            </td>

                        </tr>

                    `
                )
                .join("");

    },


    bindAuth() {

        const toggle =
            document.getElementById(
                "toggleAuth"
            );


        const submit =
            document.getElementById(
                "authSubmit"
            );


        const logout =
            document.getElementById(
                "logoutButton"
            );


        let registerMode =
            false;


        toggle.addEventListener(
            "click",
            () => {

                registerMode =
                    !registerMode;


                document.getElementById(
                    "authTitle"
                ).textContent =

                    registerMode
                        ? "ثبت‌نام"
                        : "ورود";


                submit.textContent =

                    registerMode
                        ? "ساخت حساب"
                        : "ورود";


                toggle.textContent =

                    registerMode
                        ? "حساب دارم؛ ورود"
                        : "ساخت حساب جدید";


                document
                    .getElementById(
                        "confirmPasswordWrap"
                    )
                    .classList.toggle(
                        "hidden",
                        !registerMode
                    );

            }
        );


        submit.addEventListener(
            "click",
            () => {

                const username =
                    document.getElementById(
                        "authName"
                    ).value.trim();


                const password =
                    document.getElementById(
                        "authPassword"
                    ).value;


                const confirm =
                    document.getElementById(
                        "authConfirmPassword"
                    ).value;


                const msg =
                    document.getElementById(
                        "authMsg"
                    );


                const users =
                    getUsers();


                const existing =
                    users.find(
                        user =>
                            user.username.toLowerCase() ===
                            username.toLowerCase()
                    );


                if (
                    username.length < 3
                ) {

                    msg.textContent =
                        "نام کاربری باید حداقل ۳ کاراکتر باشد.";

                    return;

                }


                if (
                    password.length < 6
                ) {

                    msg.textContent =
                        "رمز عبور باید حداقل ۶ کاراکتر باشد.";

                    return;

                }


                if (registerMode) {

                    if (existing) {

                        msg.textContent =
                            "این نام کاربری قبلاً استفاده شده است.";

                        return;

                    }


                    if (
                        password !==
                        confirm
                    ) {

                        msg.textContent =
                            "رمزهای عبور یکسان نیستند.";

                        return;

                    }


                    users.push({
                        username,
                        password
                    });


                    saveUsers(
                        users
                    );


                    setCurrentUser(
                        username
                    );


                    saveState(
                        {
                            ...DEFAULT_STATE,
                            username
                        },
                        username
                    );


                    location.reload();


                    return;

                }


                if (
                    !existing ||
                    existing.password !==
                    password
                ) {

                    msg.textContent =
                        "نام کاربری یا رمز عبور اشتباه است.";

                    return;

                }


                setCurrentUser(
                    existing.username
                );


                location.reload();

            }
        );


        logout.addEventListener(
            "click",
            () => {

                logoutUser();

                location.reload();

            }
        );

    },


    renderAuthState() {

        const auth =
            document.getElementById(
                "authButton"
            );


        const logout =
            document.getElementById(
                "logoutButton"
            );


        if (currentUser) {

            auth.textContent =
                `👤 ${currentUser}`;


            auth.onclick =
                () =>
                    this.showPage(
                        "profile"
                    );


            logout.classList.remove(
                "hidden"
            );

        } else {

            auth.textContent =
                "ورود / ثبت‌نام";


            auth.onclick =
                () =>
                    this.showPage(
                        "auth"
                    );


            logout.classList.add(
                "hidden"
            );

        }

    },


    bindTheme() {

        document
            .getElementById(
                "themeToggle"
            )
            .addEventListener(
                "click",
                () => {

                    state.theme =
                        state.theme === "dark"
                            ? "light"
                            : "dark";


                    saveState(
                        state,
                        currentUser || "guest"
                    );


                    this.applyTheme();

                }
            );

    },


    applyTheme() {

        document.documentElement.dataset.theme =
            state.theme;


        document.getElementById(
            "themeToggle"
        ).textContent =

            state.theme === "dark"

                ? "☀️ روشن"

                : "🌙 تاریک";

    }

};


app.init();
