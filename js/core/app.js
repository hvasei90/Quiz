const QuizDuo = {

    state: {

        user: null,

        score: 0,

        generalStage: 1,

        funStage: 1,

        completedGeneralStages: [],

        completedFunStages: [],

        streak: 0,

        hearts: 5,

        maxHearts: 5,

        subscription: "رایگان"

    },


    category: "general",

    currentStage: 0,

    currentQuestion: 0,

    stageQuestions: [],

    stageCorrect: 0,

    stageFinished: false,

    replayMode: false,


    save() {

        localStorage.setItem(
            "quizduo_state",
            JSON.stringify(this.state)
        );

    },


    load() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        "quizduo_state"
                    )
                );


            if (saved) {

                this.state = {

                    ...this.state,

                    ...saved

                };


                if (
                    !Array.isArray(
                        this.state.completedGeneralStages
                    )
                ) {

                    this.state.completedGeneralStages = [];

                }


                if (
                    !Array.isArray(
                        this.state.completedFunStages
                    )
                ) {

                    this.state.completedFunStages = [];

                }

            }

        } catch (error) {

            console.error(
                "Could not load QuizDuo state:",
                error
            );

        }

    },


    go(id) {

        document
            .querySelectorAll(".page")
            .forEach(
                page =>
                    page.classList.remove(
                        "active"
                    )
            );


        const page =
            document.getElementById(id);


        if (!page) {

            return;

        }


        page.classList.add("active");


        if (id === "quiz") {

            Quiz.renderStages();

        }


        if (id === "leaderboard") {

            Leaderboard.render();

        }


        Profile.render();

    },


    init() {

        this.load();


        /*
         * تمام دکمه‌های navigation
         */
        document
            .querySelectorAll(
                "[data-page]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.go(
                            button.dataset.page
                        );

                    }
                );

            });


        /*
         * ورود / ثبت‌نام
         */
        const authButton =
            document.getElementById(
                "authButton"
            );


        if (authButton) {

            authButton.addEventListener(
                "click",
                () => {

                    Auth.open();

                }
            );

        }


        /*
         * خرید اشتراک
         */
        const buyButton =
            document.getElementById(
                "buyButton"
            );


        if (buyButton) {

            buyButton.addEventListener(
                "click",
                () => {

                    alert(
                        "پرداخت واقعی در نسخه بعدی به Backend امن متصل می‌شود."
                    );

                }
            );

        }


        Auth.init();

        Quiz.init();

        Leaderboard.init();

        Chat.init();

        Support.init();

        Profile.render();

        this.go("home");

    }

};



/* =========================
   QUESTIONS
========================= */

const QUESTIONS = {

    general: [

        {

            q:
                "پایتخت ژاپن کدام است؟",

            o:
                [
                    "توکیو",
                    "سئول",
                    "پکن",
                    "بانکوک"
                ],

            a: 0,

            xp: 50

        },


        {

            q:
                "بزرگ‌ترین سیاره منظومه شمسی کدام است؟",

            o:
                [
                    "زمین",
                    "مشتری",
                    "مریخ",
                    "زهره"
                ],

            a: 1,

            xp: 50

        },


        {

            q:
                "بزرگ‌ترین اقیانوس جهان کدام است؟",

            o:
                [
                    "اطلس",
                    "هند",
                    "آرام",
                    "منجمد شمالی"
                ],

            a: 2,

            xp: 50

        },


        {

            q:
                "آب در فشار معمولی در چند درجه سلسیوس می‌جوشد؟",

            o:
                [
                    "50",
                    "80",
                    "100",
                    "120"
                ],

            a: 2,

            xp: 50

        },


        {

            q:
                "واحد جریان الکتریکی چیست؟",

            o:
                [
                    "ولت",
                    "آمپر",
                    "اهم",
                    "وات"
                ],

            a: 1,

            xp: 50

        }

    ],


    fun: [

        {

            q:
                "کدام حیوان معمولاً «بهترین دوست انسان» نامیده می‌شود؟",

            o:
                [
                    "گربه",
                    "سگ",
                    "اسب",
                    "خرگوش"
                ],

            a: 1,

            xp: 50

        },


        {

            q:
                "در شطرنج کدام مهره حرکت L شکل دارد؟",

            o:
                [
                    "فیل",
                    "رخ",
                    "اسب",
                    "وزیر"
                ],

            a: 2,

            xp: 50

        },


        {

            q:
                "کدام مورد بازی ویدیویی است؟",

            o:
                [
                    "Minecraft",
                    "Photoshop",
                    "Excel",
                    "Chrome"
                ],

            a: 0,

            xp: 50

        },


        {

            q:
                "کدام مورد ساز موسیقی است؟",

            o:
                [
                    "ویولن",
                    "تلسکوپ",
                    "میکروسکوپ",
                    "قطب‌نما"
                ],

            a: 0,

            xp: 50

        },


        {

            q:
                "ترکیب آبی و زرد چه رنگی می‌سازد؟",

            o:
                [
                    "بنفش",
                    "سبز",
                    "نارنجی",
                    "صورتی"
                ],

            a: 1,

            xp: 50

        }

    ]

};



/* =========================
   AUTH
========================= */

const Auth = {

    registerMode: false,


    init() {

        const toggle =
            document.getElementById(
                "toggleAuth"
            );


        const submit =
            document.getElementById(
                "authSubmit"
            );


        if (toggle) {

            toggle.addEventListener(
                "click",
                () => {

                    this.registerMode =
                        !this.registerMode;

                    this.render();

                }
            );

        }


        if (submit) {

            submit.addEventListener(
                "click",
                () => {

                    this.submit();

                }
            );

        }


        [
            "authName",
            "authPassword",
            "authConfirmPassword"
        ]
            .forEach(id => {

                const input =
                    document.getElementById(id);


                if (input) {

                    input.addEventListener(
                        "keydown",
                        event => {

                            if (
                                event.key ===
                                "Enter"
                            ) {

                                this.submit();

                            }

                        }
                    );

                }

            });


        this.render();

    },


    open() {

        QuizDuo.go("auth");

        this.render();

    },


    getUsers() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    "quizduo_users"
                ) || "[]"
            );

        } catch {

            return [];

        }

    },


    saveUsers(users) {

        localStorage.setItem(
            "quizduo_users",
            JSON.stringify(users)
        );

    },


    render() {

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


        const confirmBox =
            document.getElementById(
                "confirmPasswordBox"
            );


        const confirmInput =
            document.getElementById(
                "authConfirmPassword"
            );


        if (
            !title ||
            !submit ||
            !toggle
        ) {

            return;

        }


        if (this.registerMode) {

            title.textContent =
                "ثبت‌نام";

            submit.textContent =
                "ثبت‌نام";

            toggle.textContent =
                "قبلاً حساب داری؟ ورود";

            confirmBox.classList.remove(
                "hidden"
            );

            confirmInput.required =
                true;

        } else {

            title.textContent =
                "ورود";

            submit.textContent =
                "ورود";

            toggle.textContent =
                "حساب نداری؟ ثبت‌نام";

            confirmBox.classList.add(
                "hidden"
            );

            confirmInput.required =
                false;

        }


        const message =
            document.getElementById(
                "authMsg"
            );


        if (message) {

            message.textContent = "";

            message.className =
                "auth-message";

        }

    },


    submit() {

        const name =
            document
                .getElementById(
                    "authName"
                )
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "authPassword"
                )
                .value;


        const confirm =
            document
                .getElementById(
                    "authConfirmPassword"
                )
                .value;


        const message =
            document.getElementById(
                "authMsg"
            );


        if (
            name.length < 3
        ) {

            this.showError(
                "نام کاربری باید حداقل ۳ کاراکتر باشد."
            );

            return;

        }


        if (
            password.length < 6
        ) {

            this.showError(
                "رمز عبور باید حداقل ۶ کاراکتر باشد."
            );

            return;

        }


        const users =
            this.getUsers();


        if (this.registerMode) {

            if (
                password !== confirm
            ) {

                this.showError(
                    "رمزهای عبور یکسان نیستند."
                );

                return;

            }


            const exists =
                users.some(
                    user =>
                        user.name.toLowerCase() ===
                        name.toLowerCase()
                );


            if (exists) {

                this.showError(
                    "این نام کاربری قبلاً ثبت شده است."
                );

                return;

            }


            users.push({

                name,

                password

            });


            this.saveUsers(
                users
            );


            QuizDuo.state.user =
                name;


            QuizDuo.save();


            this.showSuccess(
                "ثبت‌نام با موفقیت انجام شد."
            );


            setTimeout(
                () => {

                    QuizDuo.go("home");

                    Profile.render();

                },
                500
            );


            return;

        }


        const user =
            users.find(
                item =>
                    item.name.toLowerCase() ===
                        name.toLowerCase() &&
                    item.password ===
                        password
            );


        if (!user) {

            this.showError(
                "نام کاربری یا رمز عبور اشتباه است."
            );

            return;

        }


        QuizDuo.state.user =
            user.name;


        QuizDuo.save();


        this.showSuccess(
            "ورود با موفقیت انجام شد."
        );


        setTimeout(
            () => {

                QuizDuo.go("home");

                Profile.render();

            },
            500
        );

    },


    showError(text) {

        const message =
            document.getElementById(
                "authMsg"
            );


        message.textContent =
            text;

        message.className =
            "auth-message auth-error";

    },


    showSuccess(text) {

        const message =
            document.getElementById(
                "authMsg"
            );


        message.textContent =
            text;

        message.className =
            "auth-message auth-success";

    }

};



/* =========================
   PROFILE
========================= */

const Profile = {

    render() {

        const s =
            QuizDuo.state;


        document.getElementById(
            "profileName"
        ).textContent =
            s.user || "مهمان";


        document.getElementById(
            "profileScore"
        ).textContent =
            s.score;


        document.getElementById(
            "profileStreak"
        ).textContent =
            s.streak;


        document.getElementById(
            "profileStage"
        ).textContent =
            Math.max(
                s.generalStage,
                s.funStage
            );


        document.getElementById(
            "profileHearts"
        ).textContent =
            s.hearts;


        document.getElementById(
            "subscription"
        ).textContent =
            s.subscription;

    }

};



/* =========================
   QUIZ
========================= */

const Quiz = {

    init() {

        document
            .querySelectorAll(
                "[data-category]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "[data-category]"
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


                        QuizDuo.category =
                            button.dataset.category;


                        Quiz.renderStages();

                    }
                );

            });


        this.renderStages();

    },


    getUnlockedStage() {

        return QuizDuo.state[
            QuizDuo.category +
            "Stage"
        ];

    },


    getCompletedStages() {

        return QuizDuo.state[
            QuizDuo.category === "general"
                ? "completedGeneralStages"
                : "completedFunStages"
        ];

    },


    isCompleted(stage) {

        return this
            .getCompletedStages()
            .includes(stage);

    },


    renderStages() {

        const box =
            document.getElementById(
                "stages"
            );


        if (!box) {

            return;

        }


        box.innerHTML = "";


        const unlocked =
            this.getUnlockedStage();


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            const locked =
                i > unlocked;


            const completed =
                this.isCompleted(i);


            const d =
                document.createElement(
                    "div"
                );


            d.className =
                "panel stage" +
                (
                    locked
                        ? " locked"
                        : ""
                ) +
                (
                    completed
                        ? " completed"
                        : ""
                );


            let status;


            if (locked) {

                status =
                    "ابتدا مرحله قبلی را تکمیل کن 🔒";

            } else if (completed) {

                status =
                    "این مرحله را قبلاً بردی ✓";

            } else {

                status =
                    "برای شروع کلیک کن";

            }


            d.innerHTML = `

                <h3>
                    مرحله ${i}
                    ${
                        locked
                            ? "🔒"
                            : completed
                                ? "✓"
                                : "🔓"
                    }
                </h3>

                <p class="stage-status">
                    ${status}
                </p>

            `;


            if (!locked) {

                d.addEventListener(
                    "click",
                    () => {

                        this.start(i);

                    }
                );

            }


            box.appendChild(d);

        }


        const quizBox =
            document.getElementById(
                "quizBox"
            );


        quizBox.classList.add(
            "hidden"
        );


        quizBox.innerHTML = "";

    },


    start(stage) {

        const completed =
            this.isCompleted(
                stage
            );


        const previous =
            stage <
            this.getUnlockedStage();


        let replay =
            completed ||
            previous;


        /*
         * اگر مرحله قبلاً برده شده،
         * دلیل صفر بودن XP و صفر بودن قلب
         * به کاربر گفته می‌شود.
         */
        if (replay) {

            const accepted =
                confirm(
                    "شما قبلاً امتیاز این مرحله را کسب کرده‌اید.\n\n" +
                    "آیا مایلید دوباره این مرحله را بازی کنید؟\n\n" +
                    "بازی کردن در این مرحله نه از شما قلب کم می‌کند " +
                    "و نه به شما امتیاز اضافه می‌کند."
                );


            if (!accepted) {

                return;

            }

        }


        /*
         * اگر مرحله جدید است و قلب نداریم
         */
        if (
            !replay &&
            QuizDuo.state.hearts <= 0
        ) {

            alert(
                "❤️ قلبی باقی نمانده است.\n\n" +
                "برای بازی کردن مرحله جدید باید قلب داشته باشی."
            );

            return;

        }


        QuizDuo.currentStage =
            stage;


        QuizDuo.replayMode =
            replay;


        /*
         * هر مرحله یک مجموعه سؤال دارد.
         * در این نسخه سؤال‌ها از بانک موجود انتخاب می‌شوند.
         */
        this.stageQuestions =
            this.getQuestionsForStage(
                stage
            );


        QuizDuo.currentQuestion =
            0;


        QuizDuo.stageCorrect =
            0;


        QuizDuo.stageFinished =
            false;


        this.renderQuestion();

    },


    getQuestionsForStage(stage) {

        const all =
            QUESTIONS[
                QuizDuo.category
            ] || [];


        /*
         * در نسخه فعلی بانک سوال،
         * برای هر مرحله سؤال مشخص نشده.
         * بنابراین هر مرحله از یک سؤال
         * متناظر با شماره مرحله استفاده می‌کند.
         */
        const index =
            stage - 1;


        if (all[index]) {

            return [all[index]];

        }


        /*
         * اگر برای مرحله سؤال جداگانه وجود نداشت،
         * از سؤال‌های موجود استفاده می‌کنیم.
         */
        if (all.length) {

            return [
                all[
                    index %
                    all.length
                ]
            ];

        }


        return [];

    },


    renderQuestion() {

        const box =
            document.getElementById(
                "quizBox"
            );


        if (
            !this.stageQuestions.length
        ) {

            box.innerHTML = `

                <div class="quiz-result quiz-fail">

                    <strong>
                        سوالی برای این مرحله وجود ندارد.
                    </strong>

                </div>

            `;

            box.classList.remove(
                "hidden"
            );

            return;

        }


        const q =
            this.stageQuestions[
                QuizDuo.currentQuestion
            ];


        box.classList.remove(
            "hidden"
        );


        box.innerHTML = `

            <h3>
                مرحله ${QuizDuo.currentStage}
            </h3>

            <p>
                سوال
                ${QuizDuo.currentQuestion + 1}
                از
                ${this.stageQuestions.length}
            </p>

            <h2 class="quiz-question">
                ${this.escape(q.q)}
            </h2>

            <div class="answers">

                ${
                    q.o
                        .map(
                            (option, index) =>
                                `
                                    <button
                                        class="option"
                                        data-i="${index}"
                                    >
                                        ${this.escape(option)}
                                    </button>
                                `
                        )
                        .join("")
                }

            </div>

            <div id="questionResult"></div>

        `;


        box
            .querySelectorAll(
                ".option"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.answer(
                            Number(
                                button.dataset.i
                            )
                        );

                    }
                );

            });


        box.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    },


    answer(choice) {

        const q =
            this.stageQuestions[
                QuizDuo.currentQuestion
            ];


        if (!q) {

            return;

        }


        const box =
            document.getElementById(
                "quizBox"
            );


        box
            .querySelectorAll(
                ".option"
            )
            .forEach(
                button =>
                    button.disabled = true
            );


        const correct =
            choice === q.a;


        if (correct) {

            QuizDuo.stageCorrect++;

        }


        const result =
            document.getElementById(
                "questionResult"
            );


        if (correct) {

            result.innerHTML = `

                <div class="quiz-result quiz-success">

                    <strong>
                        ✓ درست!
                    </strong>

                    <span>
                        نتیجه نهایی بعد از کامل شدن مرحله محاسبه می‌شود.
                    </span>

                </div>

                <button
                    class="primary next-button"
                    id="nextQuestion"
                >
                    ${
                        QuizDuo.currentQuestion + 1 >=
                        this.stageQuestions.length
                            ? "مشاهده نتیجه مرحله"
                            : "سوال بعدی"
                    }
                </button>

            `;

        } else {

            result.innerHTML = `

                <div class="quiz-result quiz-fail">

                    <strong>
                        ✕ پاسخ نادرست
                    </strong>

                    <span>
                        برای یک پاسخ اشتباه، هنوز قلبی کم نمی‌شود.
                        قلب فقط اگر کل مرحله را ببازی کم می‌شود.
                    </span>

                </div>

                <button
                    class="primary next-button"
                    id="nextQuestion"
                >
                    ${
                        QuizDuo.currentQuestion + 1 >=
                        this.stageQuestions.length
                            ? "مشاهده نتیجه مرحله"
                            : "سوال بعدی"
                    }
                </button>

            `;

        }


        document
            .getElementById(
                "nextQuestion"
            )
            .addEventListener(
                "click",
                () => {

                    this.nextQuestion();

                }
            );

    },


    nextQuestion() {

        QuizDuo.currentQuestion++;


        if (
            QuizDuo.currentQuestion >=
            this.stageQuestions.length
        ) {

            this.finishStage();

            return;

        }


        this.renderQuestion();

    },


    finishStage() {

        const total =
            this.stageQuestions.length;


        const percentage =
            total
                ? QuizDuo.stageCorrect /
                  total
                : 0;


        const passed =
            percentage >= 0.5;


        /*
         * XP فقط همین‌جا اضافه می‌شود.
         */
        let earnedXP = 0;


        /*
         * مرحله‌ای که قبلاً برده شده
         */
        if (
            QuizDuo.replayMode
        ) {

            earnedXP = 0;

        }


        /*
         * برد مرحله برای اولین بار
         */
        else if (passed) {

            this.completeStage();


            earnedXP =
                this.stageQuestions.reduce(
                    (
                        totalXP,
                        question
                    ) =>
                        totalXP +
                        (
                            question.xp ||
                            50
                        ),
                    0
                );


            QuizDuo.state.score +=
                earnedXP;


            QuizDuo.state.streak++;


        }


        /*
         * باخت مرحله برای اولین بار
         *
         * فقط یک قلب کم می‌شود.
         */
        else if (
            QuizDuo.state.hearts > 0
        ) {

            QuizDuo.state.hearts--;

        }


        QuizDuo.save();

        Profile.render();


        const box =
            document.getElementById(
                "quizBox"
            );


        let title;

        let message;

        let className;


        if (
            QuizDuo.replayMode
        ) {

            title =
                "🔄 بازی مجدد مرحله";

            message =
                "این مرحله را قبلاً برده بودی." +
                "<br><br>" +
                "این بار <strong>XP اضافه نشد</strong> و <strong>قلبی هم کم نشد</strong>.";

            className =
                "quiz-replay";

        } else if (passed) {

            title =
                "🎉 مرحله را بردی!";

            message =
                `+${earnedXP} XP به امتیازت اضافه شد.` +
                "<br><br>" +
                "مرحله بعد برایت باز شد.";

            className =
                "quiz-success";

        } else {

            title =
                "📚 مرحله را نبردی";

            message =
                "برای این مرحله XP نگرفتی." +
                "<br><br>" +
                "❤️ فقط یک قلب بابت شکست کل مرحله کم شد." +
                "<br><br>" +
                "می‌توانی دوباره تلاش کنی.";

            className =
                "quiz-fail";

        }


        box.innerHTML = `

            <div class="stage-result">

                <div class="stage-result-icon">
                    ${
                        passed
                            ? "🎉"
                            : QuizDuo.replayMode
                                ? "🔄"
                                : "📚"
                    }
                </div>

                <h2>
                    ${title}
                </h2>

                <div class="stage-result-score">
                    ${Math.round(
                        percentage * 100
                    )}%
                </div>

                <p>
                    ${QuizDuo.stageCorrect}
                    پاسخ درست از
                    ${total}
                    سؤال
                </p>

                <div
                    class="quiz-result ${className}"
                >
                    ${message}
                </div>

                <button
                    class="primary next-button"
                    id="backToStages"
                >
                    بازگشت به مراحل
                </button>

            </div>

        `;


        document
            .getElementById(
                "backToStages"
            )
            .addEventListener(
                "click",
                () => {

                    this.renderStages();

                }
            );

    },


    completeStage() {

        const key =
            QuizDuo.category === "general"
                ? "completedGeneralStages"
                : "completedFunStages";


        const stage =
            QuizDuo.currentStage;


        if (
            !QuizDuo.state[key].includes(
                stage
            )
        ) {

            QuizDuo.state[key].push(
                stage
            );

        }


        const stageKey =
            QuizDuo.category +
            "Stage";


        /*
         * فقط اگر این مرحله همان مرحله فعلی
         * بوده باشد، مرحله بعد باز می‌شود.
         */
        if (
            QuizDuo.state[stageKey] ===
            stage
        ) {

            QuizDuo.state[stageKey] =
                stage + 1;

        }

    },


    escape(value) {

        return String(value)

            .replaceAll(
                "&",
                "&amp;"
            )

            .replaceAll(
                "<",
                "&lt;"
            )

            .replaceAll(
                ">",
                "&gt;"
            )

            .replaceAll(
                '"',
                "&quot;"
            )

            .replaceAll(
                "'",
                "&#039;"
            );

    }

};



/* =========================
   LEADERBOARD
========================= */

const Leaderboard = {

    init() {},


    render() {

        const body =
            document.getElementById(
                "leaderBody"
            );


        if (!body) {

            return;

        }


        let local;


        try {

            local =
                JSON.parse(
                    localStorage.getItem(
                        "quizduo_local_leaderboard"
                    ) || "[]"
                );

        } catch {

            local = [];

        }


        const s =
            QuizDuo.state;


        let arr =
            [...local];


        if (s.user) {

            arr =
                arr.filter(
                    item =>
                        item.name !==
                        s.user
                );


            arr.push({

                name:
                    s.user,

                score:
                    s.score,

                stage:
                    Math.max(
                        s.generalStage,
                        s.funStage
                    )

            });

        }


        arr.sort(
            (a, b) =>
                b.score -
                a.score
        );


        if (!arr.length) {

            arr = [

                {

                    name:
                        "هنوز داده‌ای وجود ندارد",

                    score:
                        0,

                    stage:
                        1

                }

            ];

        }


        body.innerHTML =
            arr
                .map(
                    (item, index) =>
                        `

                            <tr>

                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    ${Quiz.escape(
                                        item.name
                                    )}
                                </td>

                                <td>
                                    ${item.score}
                                </td>

                                <td>
                                    ${item.stage}
                                </td>

                            </tr>

                        `
                )
                .join("");

    }

};



/* =========================
   CHAT
========================= */

const Chat = {

    init() {

        this.load();


        const send =
            document.getElementById(
                "sendChat"
            );


        if (send) {

            send.addEventListener(
                "click",
                () => {

                    const input =
                        document.getElementById(
                            "chatInput"
                        );


                    const text =
                        input.value.trim();


                    if (!text) {

                        return;

                    }


                    let messages;


                    try {

                        messages =
                            JSON.parse(
                                localStorage.getItem(
                                    "quizduo_chat"
                                ) || "[]"
                            );

                    } catch {

                        messages = [];

                    }


                    messages.push({

                        u:
                            QuizDuo.state.user ||
                            "مهمان",

                        t:
                            text

                    });


                    localStorage.setItem(
                        "quizduo_chat",
                        JSON.stringify(
                            messages
                        )
                    );


                    input.value = "";


                    this.load();

                }
            );

        }

    },


    load() {

        const box =
            document.getElementById(
                "messages"
            );


        if (!box) {

            return;

        }


        let messages;


        try {

            messages =
                JSON.parse(
                    localStorage.getItem(
                        "quizduo_chat"
                    ) || "[]"
                );

        } catch {

            messages = [];

        }


        box.innerHTML =
            messages
                .map(
                    message =>
                        `

                            <div class="message">

                                <b>
                                    ${Quiz.escape(
                                        message.u
                                    )}
                                </b>

                                <br>

                                ${Quiz.escape(
                                    message.t
                                )}

                            </div>

                        `
                )
                .join("");

    }

};



/* =========================
   SUPPORT
========================= */

const Support = {

    init() {

        const send =
            document.getElementById(
                "supportSend"
            );


        if (!send) {

            return;

        }


        send.addEventListener(
            "click",
            () => {

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
                    document.getElementById(
                        "supportMsg"
                    );


                if (
                    !subject ||
                    !text
                ) {

                    message.textContent =
                        "موضوع و پیام را وارد کنید.";

                    return;

                }


                let requests;


                try {

                    requests =
                        JSON.parse(
                            localStorage.getItem(
                                "quizduo_support"
                            ) || "[]"
                        );

                } catch {

                    requests = [];

                }


                requests.push({

                    u:
                        QuizDuo.state.user ||
                        "مهمان",

                    s:
                        subject,

                    t:
                        text,

                    date:
                        new Date().toISOString()

                });


                localStorage.setItem(
                    "quizduo_support",
                    JSON.stringify(
                        requests
                    )
                );


                message.textContent =
                    "درخواست در این نسخه روی دستگاه ذخیره شد.";


                document
                    .getElementById(
                        "supportSubject"
                    )
                    .value = "";


                document
                    .getElementById(
                        "supportText"
                    )
                    .value = "";

            }
        );

    }

};



QuizDuo.init();
