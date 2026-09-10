import {
    DEFAULT_STATE,
    createDefaultState,
    calculateLevel,
    addXP
} from "./state.js";

import {
    loadState,
    saveState
} from "./storage.js";

import {
    updateStreak,
    escapeHTML
} from "./utils.js";

import {
    QuizEngine
} from "./quiz.js";


const state =
    loadState(DEFAULT_STATE);


const quiz =
    new QuizEngine(
        state,
        () => saveState(state)
    );


const app = {

    category: state.currentCategory || "general",

    async init() {

        this.bindNavigation();

        this.bindQuizTabs();

        this.bindCategoryButtons();

        this.bindChat();

        this.renderAll();

        await this.loadQuiz();

    },


    bindNavigation() {

        document
            .querySelectorAll("[data-page]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

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

        if (page === "profile") {

            this.renderProfile();

        }

        if (page === "leaderboard") {

            this.renderLeaderboard();

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
                            .forEach(tab =>
                                tab.classList.remove(
                                    "active"
                                )
                            );

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

                        this.showPage("quiz");

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

            quiz.startStage(
                this.category,
                this.getUnlockedStage()
            );

            this.renderStages();

        } catch (error) {

            console.error(error);

        }

    },


    getUnlockedStage() {

        return this.category === "general"
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
                document.createElement("button");

            card.className =
                `stage-card ${
                    locked ? "locked" : ""
                }`;


            card.innerHTML = `

                <span class="stage-number">
                    ${locked ? "🔒" : stage}
                </span>

                <span>
                    <strong>
                        مرحله ${stage}
                    </strong>

                    <small>
                        ${
                            locked
                                ? "قفل است"
                                : "قابل بازی"
                        }
                    </small>
                </span>

            `;


            if (!locked) {

                card.addEventListener(
                    "click",
                    () => this.startStage(stage)
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

            box.classList.add("hidden");

            return;

        }


        box.classList.remove("hidden");


        document.getElementById(
            "quizCategory"
        ).textContent =
            this.category === "general"
                ? "🧠 اطلاعات عمومی"
                : "🎮 تفریحی";


        document.getElementById(
            "questionNumber"
        ).textContent =
            quiz.currentQuestion + 1;


        document.getElementById(
            "questionText"
        ).textContent =
            question.question;


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
                    () => {

                        this.submitAnswer(
                            index
                        );

                    }
                );


                answers.appendChild(
                    button
                );

            }
        );

    },


    submitAnswer(index) {

        const result =
            quiz.answer(index);


        const resultBox =
            document.getElementById(
                "quizResult"
            );


        if (result.correct) {

            updateStreak(state);

            resultBox.innerHTML =
                `<div class="correct">
                    ✓ پاسخ درست! +${result.xp} XP
                </div>`;

        } else {

            resultBox.innerHTML =
                `<div class="incorrect">
                    ✕ پاسخ نادرست
                </div>`;

        }


        saveState(state);

        this.renderAll();


        setTimeout(() => {

            if (result.finished) {

                resultBox.innerHTML =
                    `<div class="correct">
                        🎉 مرحله به پایان رسید!
                    </div>`;

                this.renderStages();

                document
                    .getElementById("quizBox")
                    .classList.add("hidden");

            } else {

                this.renderQuestion();

            }

        }, 900);

    },


    renderAll() {

        state.level =
            calculateLevel(state.xp);


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


        this.renderProfile();

        this.renderLeaderboard();

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
            "profileAvatar"
        ).textContent =
            name.charAt(0).toUpperCase();

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
                    ${escapeHTML(state.username)}
                </td>
                <td>${state.xp}</td>
                <td>${state.level}</td>
            </tr>

        `;

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


        if (!input || !button) return;


        button.addEventListener(
            "click",
            () => {

                if (!input.value.trim()) {
                    return;
                }


                alert(
                    "چت عمومی در نسخه آنلاین فعال خواهد شد."
                );


                input.value = "";

            }
        );

    }

};


app.init();
