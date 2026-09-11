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


const app = {

    category:
        "general",

    timer:
        null,

    timeLeft:
        0,

    answerLocked:
        false,


    init() {

        this.applyTheme();

        this.bindNavigation();

        this.bindAuth();

        this.bindQuiz();

        this.bindChat();

        this.bindSupport();

        this.bindTheme();

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

                            const page =
                                button.dataset.page;


                            this.showPage(
                                page
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


        document
            .getElementById(
                "nextQuestionBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    if (
                        quiz.finished
                    ) {

                        this.showStageResult(
                            quiz.lastResult
                        );

                    } else {

                        this.answerLocked =
                            false;

                        this.renderQuestion();

                    }

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


            this.showQuizError(
                "فایل سوالات پیدا نشد یا قابل خواندن نیست."
            );

        }

    },


    showQuizError(message) {

        const list =
            document.getElementById(
                "stageList"
            );


        if (list) {

            list.innerHTML = `

                <div class="panel error-panel">

                    ${escapeHTML(
                        message
                    )}

                </div>

            `;

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
            this.category ===
            "general"

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
                "برای ادامه مراحل باید ثبت‌نام یا وارد حساب کاربری شوی."
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

                    "شما قبلاً امتیاز این مرحله را کسب کرده‌اید.\n\n" +

                    "آیا مایلید دوباره این مرحله را بازی کنید؟\n\n" +

                    "بازی کردن در این مرحله نه از شما قلب کم می‌کند و نه XP اضافه می‌کند."

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


        if (
            !questions.length
        ) {

            alert(
                "برای این مرحله هنوز سوالی ثبت نشده است."
            );


            return;

        }


        this.answerLocked =
            false;


        this.renderQuestion();


        document
            .getElementById(
                "quizBox"
            )
            ?.scrollIntoView({
                behavior:
                    "smooth",
                block:
                    "start"
            });

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

            `${quiz.currentQuestion + 1} / ${quiz.getQuestionCount()}`;


        document.getElementById(
            "questionText"
        ).textContent =

            question.q ||
            question.question;


        document.getElementById(
            "quizProgress"
        ).style.width =

            `${
                (
                    quiz.currentQuestion /
                    Math.max(
                        quiz.getQuestionCount(),
                        1
                    )
                ) * 100
            }%`;


        const answers =
            document.getElementById(
                "answers"
            );


        answers.innerHTML =
            "";


        const options =
            question.options ||
            question.o ||
            [];


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


        quiz.lastResult =
            result;


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


        if (
            result.correct
        ) {

            resultBox.innerHTML = `

                <div class="result-success">

                    <strong>
                        ✓ درست!
                    </strong>

                    <span>
                        ${
                            result.finished
                                ? "پاسخ درست ثبت شد."
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
                        این پاسخ به‌تنهایی قلب کم نمی‌کند.
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


        const passed =
            result.passed;


        if (
            passed &&
            result.newlyCompleted &&
            currentUser
        ) {

            updateStreak(
                state
            );


            saveState(
                state,
                currentUser
            );


            updateLeaderboard(
                state
            );

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

                                ${
                                    result.newlyCompleted

                                        ? `+${QUIZ_CONFIG.stageXP} XP برای تکمیل مرحله گرفتی.`

                                        : "این مرحله قبلاً تکمیل شده بود؛ امتیاز دوباره داده نمی‌شود."

                                }

                            </p>

                        `

                        : `

                            <p class="result-message">

                                ${
                                    result.heartLost

                                        ? "یک قلب به خاطر کامل نکردن مرحله کم شد."

                                        : "در حالت تکرار، قلبی کم نمی‌شود."

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


        if (
            currentUser
        ) {

            updateLeaderboard(
                state
            );

        }

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

                        هنوز بازیکن ثبت‌شده‌ای
                        در این مرورگر وجود ندارد.

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


                document.getElementById(
                    "authMsg"
                ).textContent =
                    "";

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


                const confirmPassword =
                    document.getElementById(
                        "authConfirmPassword"
                    ).value;


                const msg =
                    document.getElementById(
                        "authMsg"
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


                const users =
                    getUsers();


                const existing =
                    users.find(
                        user =>
                            user.username.toLowerCase() ===
                            username.toLowerCase()
                    );


                if (
                    registerMode
                ) {

                    if (existing) {

                        msg.textContent =
                            "این نام کاربری قبلاً ثبت شده است. یک نام دیگر انتخاب کن.";

                        return;

                    }


                    if (
                        password !==
                        confirmPassword
                    ) {

                        msg.textContent =
                            "تکرار رمز عبور با رمز اصلی یکسان نیست.";

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


                    alert(
                        "حساب با موفقیت ساخته شد."
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

        const authButton =
            document.getElementById(
                "authButton"
            );


        const logout =
            document.getElementById(
                "logoutButton"
            );


        if (
            currentUser
        ) {

            authButton.textContent =
                currentUser;


            authButton.onclick =
                () =>
                    this.showPage(
                        "profile"
                    );


            logout.classList.remove(
                "hidden"
            );

        } else {

            authButton.textContent =
                "ورود / ثبت‌نام";


            authButton.onclick =
                () =>
                    this.showPage(
                        "auth"
                    );


            logout.classList.add(
                "hidden"
            );

        }

    },


    bindChat() {

        document
            .getElementById(
                "sendChat"
            )
            .addEventListener(
                "click",
                () => {

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

                        username:
                            state.username,

                        text,

                        time:
                            Date.now()

                    });


                    localStorage.setItem(
                        "quizduo_chat",
                        JSON.stringify(
                            messages
                        )
                    );


                    input.value =
                        "";


                    this.renderChat();

                }
            );


        this.renderChat();

    },


    renderChat() {

        const box =
            document.getElementById(
                "messages"
            );


        const messages =
            JSON.parse(
                localStorage.getItem(
                    "quizduo_chat"
                ) || "[]"
            );


        box.innerHTML =
            messages
                .map(
                    message => `

                        <div class="message">

                            <b>
                                ${escapeHTML(
                                    message.username
                                )}
                            </b>

                            <p>
                                ${escapeHTML(
                                    message.text
                                )}
                            </p>

                        </div>

                    `
                )
                .join("");

    },


    bindSupport() {

        document
            .getElementById(
                "supportSend"
            )
            .addEventListener(
                "click",
                () => {

                    const subject =
                        document.getElementById(
                            "supportSubject"
                        ).value.trim();


                    const text =
                        document.getElementById(
                            "supportText"
                        ).value.trim();


                    const msg =
                        document.getElementById(
                            "supportMsg"
                        );


                    if (
                        !subject ||
                        !text
                    ) {

                        msg.textContent =
                            "موضوع و پیام را کامل وارد کن.";

                        return;

                    }


                    const list =
                        JSON.parse(
                            localStorage.getItem(
                                "quizduo_support"
                            ) || "[]"
                        );


                    list.push({

                        username:
                            state.username,

                        subject,

                        text,

                        time:
                            Date.now()

                    });


                    localStorage.setItem(
                        "quizduo_support",
                        JSON.stringify(
                            list
                        )
                    );


                    msg.textContent =
                        "درخواست در این نسخه روی همین دستگاه ذخیره شد.";

                }
            );

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
