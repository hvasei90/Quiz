import {
    DEFAULT_STATE,
    addXP,
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
    todayKey,
    updateStreak,
    escapeHTML
} from "./utils.js";

import {
    QuizEngine,
    QUIZ_CONFIG
} from "./quiz.js";


const DAILY_XP = 10;
const GUEST_LIMIT = 3;


const plans = {

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


const codes = {

    QUIZDUO10: {
        type: "percent",
        value: 10
    },

    WELCOME15: {
        type: "percent",
        value: 15
    },

    STUDENT10: {
        type: "percent",
        value: 10
    },

    // کد مخصوص تست
    TEST100K: {
        type: "fixed",
        value: 100000
    }

};


class App {

    constructor() {

        this.user = getCurrentUser();

        this.state = loadState(
            DEFAULT_STATE,
            this.user || "guest"
        );

        this.state.username =
            this.user || "بازیکن مهمان";

        this.category = "general";

        this.quiz = new QuizEngine(
            this.state,
            () => this.save()
        );

        this.timer = null;

        this.plan = "monthly";

        this.discount = null;

        this.register = false;

    }


    init() {

        document
            .querySelectorAll("[data-page]")
            .forEach(button => {

                button.onclick = () => {
                    this.go(button.dataset.page);
                };

            });


        document
            .getElementById("authButton")
            .onclick = () => this.go("auth");


        document
            .getElementById("logoutButton")
            .onclick = () => this.logout();


        document
            .getElementById("themeToggle")
            .onclick = () => {

                this.state.theme =
                    this.state.theme === "dark"
                        ? "light"
                        : "dark";

                this.theme();

                this.save(false);

            };


        this.auth();

        this.subscription();

        this.chat();

        this.support();


        document
            .querySelectorAll("[data-category-tab]")
            .forEach(button => {

                button.onclick = async () => {

                    document
                        .querySelectorAll("[data-category-tab]")
                        .forEach(x =>
                            x.classList.remove("active")
                        );

                    button.classList.add("active");

                    this.category =
                        button.dataset.categoryTab;

                    this.stages();

                };

            });


        this.theme();

        this.all();

        this.go("home");

    }


    go(id) {

        document
            .querySelectorAll(".page")
            .forEach(page =>
                page.classList.remove("active")
            );


        document
            .getElementById(id)
            ?.classList.add("active");


        if (id === "quiz") {
            this.stages();
        }


        if (id === "leaderboard") {
            this.leaderboard();
        }


        if (id === "subscription") {
            this.paymentUI();
        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    save(board = true) {

        this.state.level =
            calculateLevel(this.state.xp);


        saveState(
            this.state,
            this.user || "guest"
        );


        if (board && this.user) {
            updateLeaderboard(this.state);
        }


        this.stats();

        this.profile();

    }


    all() {

        this.stats();

        this.profile();

        this.authArea();

        this.daily();

        this.stages();

        this.leaderboard();

        this.renderChat();

        this.paymentUI();

    }


    stats() {

        const s = this.state;


        const values = [

            ["homeXP", s.xp],

            ["homeLevel", s.level],

            ["homeStreak", s.streak],

            ["quizXP", s.xp],

            ["quizStreak", s.streak],

            ["heartValue", s.hearts],

            ["comboValue", this.quiz.combo || 0]

        ];


        values.forEach(([id, value]) => {

            const element =
                document.getElementById(id);

            if (element) {
                element.textContent = value;
            }

        });

    }


    /*
     * XP روزانه
     *
     * روزی فقط یک بار قابل دریافت است.
     * این XP کاملاً جدا از XP مرحله است.
     */

    daily() {

        const element =
            document.getElementById(
                "dailyRewardCard"
            );

        if (!element) return;


        const received =
            this.state.lastDailyXPDate ===
            todayKey();


        if (received) {

            element.innerHTML = `

                <div>

                    <strong>
                        🎁 XP روزانه دریافت شد!
                    </strong>

                    <span>
                        امروز ${DAILY_XP} XP گرفتی؛
                        فردا دوباره برگرد.
                    </span>

                </div>

                <b>
                    +${DAILY_XP} XP
                </b>

            `;

        } else {

            element.innerHTML = `

                <div>

                    <strong>
                        🎁 جایزه روزانه آماده است!
                    </strong>

                    <span>
                        هر روز یک بار
                        ${DAILY_XP}
                        XP رایگان بگیر.
                    </span>

                </div>

                <button
                    id="claimDailyXP"
                    class="primary-btn">

                    دریافت +${DAILY_XP} XP

                </button>

            `;

        }


        document
            .getElementById("claimDailyXP")
            ?.addEventListener(
                "click",
                () => {

                    if (
                        this.state.lastDailyXPDate ===
                        todayKey()
                    ) {
                        return;
                    }


                    addXP(
                        this.state,
                        DAILY_XP
                    );


                    this.state.lastDailyXPDate =
                        todayKey();


                    updateStreak(this.state);


                    this.save();

                    this.daily();

                }
            );

    }


    theme() {

        document.body.classList.toggle(
            "dark",
            this.state.theme === "dark"
        );


        const button =
            document.getElementById(
                "themeToggle"
            );


        if (button) {

            button.textContent =
                this.state.theme === "dark"
                    ? "☀️"
                    : "🌙";

        }

    }


    /* AUTH */

    auth() {

        document
            .getElementById("toggleAuth")
            .onclick = () => {

                this.register =
                    !this.register;


                document
                    .getElementById("authTitle")
                    .textContent =
                    this.register
                        ? "ثبت‌نام"
                        : "ورود";


                document
                    .getElementById("authSubmit")
                    .textContent =
                    this.register
                        ? "ثبت‌نام"
                        : "ورود";


                document
                    .getElementById("toggleAuth")
                    .textContent =
                    this.register
                        ? "ورود به حساب"
                        : "ساخت حساب جدید";


                document
                    .getElementById(
                        "confirmPasswordWrap"
                    )
                    .classList.toggle(
                        "hidden",
                        !this.register
                    );

            };


        document
            .getElementById("authSubmit")
            .onclick =
            () => this.submitAuth();

    }


    submitAuth() {

        const name =
            document
                .getElementById("authName")
                .value
                .trim();


        const password =
            document
                .getElementById("authPassword")
                .value;


        const confirm =
            document
                .getElementById(
                    "authConfirmPassword"
                )
                .value;


        const message =
            document
                .getElementById("authMsg");


        if (
            name.length < 2 ||
            password.length < 6
        ) {

            message.textContent =
                "نام کاربری و رمز معتبر وارد کنید.";

            return;

        }


        const users =
            getUsers();


        const old =
            users.find(
                user =>
                    user.username.toLowerCase() ===
                    name.toLowerCase()
            );


        if (this.register) {

            if (old) {

                message.textContent =
                    "این نام کاربری قبلاً ثبت شده است.";

                return;

            }


            if (password !== confirm) {

                message.textContent =
                    "تکرار رمز عبور درست نیست.";

                return;

            }


            users.push({
                username: name,
                password
            });


            saveUsers(users);

        } else {

            if (
                !old ||
                old.password !== password
            ) {

                message.textContent =
                    "نام کاربری یا رمز عبور اشتباه است.";

                return;

            }

        }


        setCurrentUser(name);

        this.user = name;


        this.state =
            loadState(
                DEFAULT_STATE,
                name
            );


        this.state.username = name;


        this.quiz.state =
            this.state;


        this.save();


        message.textContent =
            "با موفقیت انجام شد.";


        this.authArea();


        setTimeout(
            () => this.go("home"),
            300
        );

    }


    authArea() {

        document
            .getElementById("authButton")
            .classList.toggle(
                "hidden",
                !!this.user
            );


        document
            .getElementById("logoutButton")
            .classList.toggle(
                "hidden",
                !this.user
            );

    }


    logout() {

        logoutUser();

        this.user = null;


        this.state =
            loadState(
                DEFAULT_STATE,
                "guest"
            );


        this.state.username =
            "بازیکن مهمان";


        this.quiz.state =
            this.state;


        this.all();

        this.go("home");

    }


    /* QUIZ */

    async stages() {

        const box =
            document.getElementById(
                "stageList"
            );


        if (!box) return;


        try {

            await this.quiz.loadCategory(
                this.category
            );


            const max =
                Math.max(
                    6,
                    ...this.quiz.questions.map(
                        q => +q.stage || 1
                    )
                );


            const unlocked =
                getUnlockedStage(
                    this.state,
                    this.category
                );


            box.innerHTML = "";


            for (
                let number = 1;
                number <= max;
                number++
            ) {

                const completed =
                    isStageCompleted(
                        this.state,
                        this.category,
                        number
                    );


                const locked =
                    number > unlocked;


                const guestLocked =
                    !this.user &&
                    number > GUEST_LIMIT;


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    `stage-card
                    ${completed ? "completed" : ""}
                    ${locked || guestLocked ? "locked" : ""}`;


                card.innerHTML = `

                    <div class="stage-number">
                        ${number}
                    </div>

                    <h3>
                        مرحله ${number}
                    </h3>

                    <small>

                        ${
                            completed
                                ? "✓ تکمیل‌شده"
                                : locked
                                    ? "🔒 قفل"
                                    : guestLocked
                                        ? "👤 نیاز به حساب"
                                        : "▶ آماده بازی"
                        }

                        • ۱۰ XP

                    </small>

                    <button
                        class="primary-btn stage-action"
                        ${locked || guestLocked
                            ? "disabled"
                            : ""}>

                        ${
                            completed
                                ? "بازی دوباره"
                                : "شروع مرحله"
                        }

                    </button>

                `;


                const button =
                    card.querySelector(
                        "button"
                    );


                if (
                    !locked &&
                    !guestLocked
                ) {

                    button.onclick =
                        () =>
                            this.start(
                                number,
                                completed
                            );

                } else if (
                    guestLocked &&
                    !locked
                ) {

                    button.onclick =
                        () =>
                            this.go("auth");

                }


                box.appendChild(card);

            }

        } catch {

            box.innerHTML = `

                <div class="notice">

                    فایل سؤال‌ها پیدا نشد.

                </div>

            `;

        }

    }


    async start(
        number,
        replay
    ) {

        if (replay) {

            const accepted =
                confirm(

                    "شما قبلاً امتیاز این مرحله را کسب کرده‌اید. " +
                    "آیا مایلید دوباره این مرحله را بازی کنید؟" +

                    "\n\n" +

                    "بازی کردن در این مرحله نه از شما قلب کم می‌کند " +
                    "و نه XP اضافه می‌کند."

                );


            if (!accepted) return;

        }


        if (
            number > GUEST_LIMIT &&
            !this.user
        ) {

            this.go("auth");

            return;

        }


        const questions =
            this.quiz.startStage(
                this.category,
                number,
                replay
            );


        if (!questions.length) {

            alert(
                "برای این مرحله هنوز سؤال ثبت نشده است."
            );

            return;

        }


        this.question();


        document
            .getElementById("quizBox")
            .scrollIntoView({
                behavior: "smooth"
            });

    }


    question() {

        clearInterval(
            this.timer
        );


        const question =
            this.quiz.getCurrentQuestion();


        const count =
            this.quiz.getQuestionCount();


        if (!question) return;


        document
            .getElementById("quizBox")
            .classList.remove("hidden");


        document
            .getElementById("quizCategory")
            .textContent =
            this.category === "general"
                ? "🧠 اطلاعات عمومی"
                : "🎮 تفریحی";


        document
            .getElementById("questionNumber")
            .textContent =
            `سؤال ${
                this.quiz.currentQuestion + 1
            } از ${count}`;


        document
            .getElementById("quizProgress")
            .style.width =
            `${this.quiz.currentQuestion / count * 100}%`;


        document
            .getElementById("questionText")
            .textContent =
            question.q;


        document
            .getElementById("quizResult")
            .textContent = "";


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


                button.onclick =
                    () =>
                        this.answer(index);


                answers.appendChild(
                    button
                );

            }
        );


        let left =
            QUIZ_CONFIG.questionTime;


        document
            .getElementById("questionTimer")
            .textContent =
            `${left}s`;


        document
            .getElementById("timerProgress")
            .style.width =
            "100%";


        this.timer =
            setInterval(
                () => {

                    left--;


                    document
                        .getElementById(
                            "questionTimer"
                        )
                        .textContent =
                        `${Math.max(left, 0)}s`;


                    document
                        .getElementById(
                            "timerProgress"
                        )
                        .style.width =
                        `${
                            Math.max(left, 0) /
                            QUIZ_CONFIG.questionTime *
                            100
                        }%`;


                    if (left <= 0) {

                        clearInterval(
                            this.timer
                        );

                        this.answer(null);

                    }

                },
                1000
            );

    }


    answer(index) {

        clearInterval(
            this.timer
        );


        document
            .querySelectorAll(".answer-btn")
            .forEach(
                button =>
                    button.disabled = true
            );


        const result =
            this.quiz.answer(index);


        this.stats();


        if (!result.finished) {

            document
                .getElementById("quizResult")
                .innerHTML =
                result.correct
                    ? "<p>✅ درست بود!</p>"
                    : "<p>❌ پاسخ درست نبود!</p>";


            const next =
                document
                    .getElementById(
                        "nextQuestionBtn"
                    );


            next.classList.remove(
                "hidden"
            );


            next.textContent =
                "سؤال بعدی →";


            next.onclick =
                () => this.question();


            return;

        }


        let text =
            result.passed
                ? "🎉 مرحله را با موفقیت کامل کردی!"
                : "😕 مرحله را کامل نکردی.";


        if (result.earnedXP) {

            text +=
                ` +${result.earnedXP} XP`;

        }


        if (result.heartLost) {

            text +=
                " • یک قلب کم شد.";

        }


        if (result.replay) {

            text +=
                " • تکرار بدون تغییر XP و قلب.";

        }


        document
            .getElementById("quizResult")
            .innerHTML = `

                <div class="notice">

                    <strong>
                        ${text}
                    </strong>

                    <br>

                    امتیاز:
                    ${Math.round(
                        result.percentage * 100
                    )}٪

                </div>

            `;


        const next =
            document
                .getElementById(
                    "nextQuestionBtn"
                );


        next.classList.remove(
            "hidden"
        );


        next.textContent =
            "بازگشت به مراحل";


        next.onclick = () => {

            document
                .getElementById(
                    "quizBox"
                )
                .classList.add(
                    "hidden"
                );


            this.stages();

        };


        this.save();

    }


    /* SUBSCRIPTION */

    subscription() {

        document
            .querySelectorAll(".plan-select")
            .forEach(button => {

                button.onclick =
                    () =>
                        this.selectPlan(
                            button.dataset.plan
                        );

            });


        document
            .getElementById("applyDiscount")
            .onclick =
            () =>
                this.applyDiscount();


        document
            .getElementById("paymentButton")
            .onclick =
            () =>
                this.pay();

    }


    selectPlan(plan) {

        this.plan = plan;

        this.discount = null;


        document
            .getElementById("discountCode")
            .value = "";


        document
            .getElementById("discountMsg")
            .textContent = "";


        this.paymentUI();


        document
            .getElementById("paymentPanel")
            .scrollIntoView({
                behavior: "smooth"
            });

    }


    applyDiscount() {

        const code =
            document
                .getElementById(
                    "discountCode"
                )
                .value
                .trim()
                .toUpperCase();


        const message =
            document
                .getElementById(
                    "discountMsg"
                );


        const discount =
            codes[code];


        if (!discount) {

            this.discount = null;

            message.textContent =
                "کد تخفیف معتبر نیست.";

            this.paymentUI();

            return;

        }


        this.discount = {
            code,
            ...discount
        };


        message.textContent =
            `کد اعمال شد:
            ${this.money(
                this.discountValue()
            )}
            تومان تخفیف.`;


        this.paymentUI();

    }


    discountValue() {

        const base =
            plans[this.plan].price;


        if (!this.discount) {
            return 0;
        }


        const value =
            this.discount.type === "fixed"

                ? this.discount.value

                : Math.round(
                    base *
                    this.discount.value /
                    100
                );


        return Math.min(
            base,
            value
        );

    }


    final() {

        return (
            plans[this.plan].price -
            this.discountValue()
        );

    }


    paymentUI() {

        const plan =
            plans[this.plan];


        const final =
            this.final();


        const set =
            (id, value) => {

                const element =
                    document.getElementById(id);

                if (element) {
                    element.textContent =
                        value;
                }

            };


        set(
            "selectedPlanName",
            plan.name
        );


        set(
            "selectedPlanAmount",
            this.money(plan.price) +
            " تومان"
        );


        set(
            "basePrice",
            this.money(plan.price) +
            " تومان"
        );


        set(
            "discountAmount",

            this.discountValue()

                ? `− ${
                    this.money(
                        this.discountValue()
                    )
                } تومان`

                : "۰ تومان"
        );


        set(
            "finalPrice",
            this.money(final) +
            " تومان"
        );


        document
            .querySelectorAll(
                "[data-plan-card]"
            )
            .forEach(card => {

                card.classList.toggle(
                    "selected",
                    card.dataset.planCard ===
                    this.plan
                );

            });


        document
            .getElementById(
                "paymentButton"
            )
            .textContent =
            final === 0
                ? "فعال‌سازی اشتراک آزمایشی"
                : "ادامه به پرداخت";

    }


    /*
     * درگاه آزمایشی
     *
     * فقط زمانی که مبلغ نهایی صفر باشد
     * اشتراک به صورت تست فعال می‌شود.
     *
     * پرداخت واقعی در نسخه GitHub Pages
     * نیاز به Backend دارد.
     */

    pay() {

        const message =
            document
                .getElementById(
                    "paymentMsg"
                );


        const final =
            this.final();


        const plan =
            plans[this.plan];


        if (!this.user) {

            message.textContent =
                "برای خرید اشتراک ابتدا وارد حساب شو.";

            this.go("auth");

            return;

        }


        if (final > 0) {

            message.textContent =
                "درگاه واقعی بانکی هنوز قابل فعال‌سازی نیست؛ " +
                "برای تست از پلن ماهانه + کد TEST100K استفاده کن.";

            return;

        }


        const requests =
            JSON.parse(
                localStorage.getItem(
                    "quizduo_payment_requests"
                ) || "[]"
            );


        requests.push({

            username: this.user,

            plan: this.plan,

            amount: 0,

            code:
                this.discount?.code || null,

            status:
                "test-approved",

            createdAt:
                Date.now()

        });


        localStorage.setItem(
            "quizduo_payment_requests",
            JSON.stringify(requests)
        );


        this.state.subscription =
            "premium";


        this.state.subscriptionPlan =
            this.plan;


        this.state.subscriptionMonths =
            plan.months +
            plan.gift;


        this.state.subscriptionActivatedAt =
            Date.now();


        this.state.maxHearts =
            8;


        this.state.hearts =
            8;


        this.save();


        message.textContent =
            `🎉 اشتراک ${plan.name} در حالت آزمایشی فعال شد!`;


        this.profile();

    }


    money(value) {

        return Number(value)
            .toLocaleString("fa-IR");

    }


    /* PROFILE */

    profile() {

        const s =
            this.state;


        const set =
            (id, value) => {

                const element =
                    document.getElementById(id);

                if (element) {
                    element.textContent =
                        value;
                }

            };


        set(
            "profileName",
            s.username
        );


        set(
            "profileLevel",
            s.level
        );


        set(
            "profileXP",
            s.xp
        );


        set(
            "profileStreak",
            s.streak
        );


        set(
            "profileHearts",
            s.hearts
        );


        set(
            "profileGeneral",
            Math.max(
                0,
                s.generalStage - 1
            )
        );


        set(
            "profileFun",
            Math.max(
                0,
                s.funStage - 1
            )
        );


        document
            .getElementById(
                "profileAvatar"
            )
            .textContent =
            (s.username || "م")[0];


        document
            .getElementById(
                "premiumBadge"
            )
            .classList.toggle(
                "hidden",
                s.subscription !== "premium"
            );

    }


    /* LEADERBOARD */

    leaderboard() {

        const body =
            document.getElementById(
                "leaderboardBody"
            );


        if (!body) return;


        const board =
            getLeaderboard();


        if (!board.length) {

            body.innerHTML = `

                <tr>
                    <td colspan="5">
                        هنوز داده‌ای وجود ندارد.
                    </td>
                </tr>

            `;

            return;

        }


        body.innerHTML =
            board
                .map(
                    (item, index) => `

                        <tr>

                            <td>
                                ${index + 1}
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
                                    ) - 1
                                }
                            </td>

                        </tr>

                    `
                )
                .join("");

    }


    /* CHAT */

    chat() {

        document
            .getElementById(
                "sendChat"
            )
            .onclick = () => {

                const input =
                    document.getElementById(
                        "chatInput"
                    );


                const text =
                    input.value.trim();


                if (!text) return;


                const messages =
                    JSON.parse(
                        localStorage.getItem(
                            "quizduo_chat"
                        ) || "[]"
                    );


                messages.push({

                    u: this.state.username,

                    t: text

                });


                localStorage.setItem(
                    "quizduo_chat",
                    JSON.stringify(
                        messages.slice(-100)
                    )
                );


                input.value = "";


                this.renderChat();

            };

    }


    renderChat() {

        const box =
            document.getElementById(
                "messages"
            );


        if (!box) return;


        const messages =
            JSON.parse(
                localStorage.getItem(
                    "quizduo_chat"
                ) || "[]"
            );


        box.innerHTML =
            messages
                .map(
                    item => `

                        <div class="message">

                            <b>
                                ${escapeHTML(item.u)}
                            </b>

                            <br>

                            ${escapeHTML(item.t)}

                        </div>

                    `
                )
                .join("");

    }


    /* SUPPORT */

    support() {

        document
            .getElementById(
                "supportSend"
            )
            .onclick = () => {

                const subject =
                    document
                        .getElementById(
                            "supportSubject"
                        )
                        .value
                        .trim();


                const text =
                    document
                        .getElementById(
                            "supportText"
                        )
                        .value
                        .trim();


                const message =
                    document
                        .getElementById(
                            "supportMsg"
                        );


                if (!subject || !text) {

                    message.textContent =
                        "موضوع و پیام را وارد کنید.";

                    return;

                }


                const requests =
                    JSON.parse(
                        localStorage.getItem(
                            "quizduo_support"
                        ) || "[]"
                    );


                requests.push({

                    u: this.state.username,

                    s: subject,

                    t: text,

                    date: Date.now()

                });


                localStorage.setItem(
                    "quizduo_support",
                    JSON.stringify(
                        requests
                    )
                );


                message.textContent =
                    "درخواست در این نسخه روی دستگاه ذخیره شد.";

            };

    }

}


new App().init();
