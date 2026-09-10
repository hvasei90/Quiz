import {
    shuffle
} from "./utils.js";


import {
    hasCompletedStage,
    markStageCompleted
} from "./state.js";


export const QUIZ_CONFIG = {

    questionsPerStage: 2,

    passingPercentage: 0.50,

    questionTime: 15,

    baseXP: 10,

    comboBonus: 5,

    /*
     * Heart فقط برای باخت کل مرحله استفاده می‌شود.
     */

    failedStageHeartPenalty: 1

};


export class QuizEngine {


    constructor(
        state,
        saveState
    ) {

        this.state =
            state;


        this.saveState =
            saveState;


        this.questions = [];

        this.selectedQuestions = [];

        this.currentQuestion = 0;

        this.currentCategory =
            "general";

        this.currentStage = 1;

        this.correctAnswers = 0;

        this.wrongAnswers = 0;

        this.combo = 0;

        this.finished = false;

        /*
         * آیا این بازی Replay است؟
         */

        this.isReplay = false;

    }



    async loadCategory(
        category
    ) {

        const response =
            await fetch(
                `data/${category}.json`
            );


        if (!response.ok) {

            throw new Error(
                `Could not load ${category}.json`
            );

        }


        const data =
            await response.json();


        this.questions =
            data.questions || [];


        this.currentCategory =
            category;

    }



    getStageQuestions(
        stage
    ) {

        return this.questions.filter(
            question =>
                Number(
                    question.stage
                ) ===
                Number(stage)
        );

    }



    startStage(
        category,
        stage
    ) {

        this.currentCategory =
            category;


        this.currentStage =
            Number(stage);


        this.currentQuestion =
            0;


        this.correctAnswers =
            0;


        this.wrongAnswers =
            0;


        this.combo =
            0;


        this.finished =
            false;


        /*
         * بررسی می‌کنیم که آیا این مرحله
         * قبلاً با موفقیت تمام شده است.
         */

        this.isReplay =
            hasCompletedStage(
                this.state,
                category,
                stage
            );


        const stageQuestions =
            this.getStageQuestions(
                stage
            );


        this.selectedQuestions =
            shuffle(
                stageQuestions
            ).slice(
                0,
                Math.min(
                    QUIZ_CONFIG.questionsPerStage,
                    stageQuestions.length
                )
            );


        return this.selectedQuestions;

    }



    getCurrentQuestion() {

        return this.selectedQuestions[
            this.currentQuestion
        ];

    }



    getQuestionCount() {

        return this.selectedQuestions.length;

    }



    getProgress() {

        const total =
            this.getQuestionCount();


        if (!total) {

            return 0;

        }


        return (
            this.currentQuestion /
            total
        );

    }



    answer(
        answerIndex
    ) {

        const question =
            this.getCurrentQuestion();


        if (!question) {

            return {

                finished: true,

                correct: false,

                passed: false,

                replay: this.isReplay

            };

        }


        const correct =
            answerIndex !== null &&
            answerIndex ===
            Number(
                question.answer
            );


        let earnedXP = 0;



        /*
         * در Replay:
         *
         * پاسخ درست Combo را تغییر می‌دهد
         * اما XP اضافه نمی‌شود.
         */

        if (
            correct
        ) {


            this.correctAnswers++;


            this.combo++;


            if (
                this.combo >
                this.state.bestCombo
            ) {

                this.state.bestCombo =
                    this.combo;

            }


            if (
                !this.isReplay
            ) {

                earnedXP =
                    (
                        question.xp ||
                        QUIZ_CONFIG.baseXP
                    ) +
                    Math.max(
                        0,
                        this.combo - 1
                    ) *
                    QUIZ_CONFIG.comboBonus;


                this.state.xp +=
                    earnedXP;

            }


        } else {


            this.wrongAnswers++;


            this.combo = 0;

            /*
             * هیچ Heart اینجا کم نمی‌شود.
             *
             * Heart فقط بعد از مشخص شدن
             * نتیجه کل مرحله کم خواهد شد.
             */

        }



        this.currentQuestion++;



        const finished =
            this.currentQuestion >=
            this.selectedQuestions.length;



        let passed = false;

        let heartLost = false;

        let stageCompletedNow =
            false;



        if (
            finished
        ) {


            const total =
                this.selectedQuestions.length;


            const percentage =
                total > 0

                    ? this.correctAnswers /
                      total

                    : 0;


            passed =
                percentage >=
                QUIZ_CONFIG.passingPercentage;



            /*
             * اگر Replay باشد:
             *
             * نه XP
             * نه Heart
             * نه Unlock
             */

            if (
                this.isReplay
            ) {

                stageCompletedNow =
                    false;


            } else if (
                passed
            ) {


                /*
                 * اولین بار است که مرحله را
                 * با موفقیت تمام کرده‌ایم.
                 */

                markStageCompleted(
                    this.state,
                    this.currentCategory,
                    this.currentStage
                );


                stageCompletedNow =
                    true;



                /*
                 * باز کردن مرحله بعد
                 */

                if (
                    this.currentCategory ===
                    "general"
                ) {


                    if (
                        this.state.generalStage ===
                        this.currentStage
                    ) {

                        this.state.generalStage++;

                    }


                } else {


                    if (
                        this.state.funStage ===
                        this.currentStage
                    ) {

                        this.state.funStage++;

                    }

                }


            } else {


                /*
                 * کل مرحله باخته شده.
                 *
                 * فقط یک Heart کم می‌شود.
                 */

                if (
                    this.state.hearts > 0
                ) {


                    this.state.hearts =
                        Math.max(
                            0,
                            this.state.hearts -
                            QUIZ_CONFIG.failedStageHeartPenalty
                        );


                    heartLost =
                        true;

                }

            }

        }



        this.saveState();



        return {

            correct,

            finished,

            passed,

            replay:
                this.isReplay,

            heartLost,

            stageCompletedNow,

            earnedXP,

            combo:
                this.combo,

            correctAnswers:
                this.correctAnswers,

            wrongAnswers:
                this.wrongAnswers,

            total:
                this.selectedQuestions.length,

            percentage:
                this.selectedQuestions.length

                    ? this.correctAnswers /
                      this.selectedQuestions.length

                    : 0,

            explanation:
                question.explanation ||
                "",

            correctAnswer:
                question.options[
                    Number(
                        question.answer
                    )
                ]

        };

    }

}
