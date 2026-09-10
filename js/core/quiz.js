import {
    shuffle
} from "./utils.js";


export const QUIZ_CONFIG = {

    /*
     * تعداد سؤال‌هایی که در هر اجرای
     * یک مرحله به صورت تصادفی انتخاب می‌شوند.
     */

    questionsPerStage: 2,


    /*
     * حداقل درصد لازم برای قبولی.
     *
     * 0.50 = پنجاه درصد
     * 0.60 = شصت درصد
     * 0.80 = هشتاد درصد
     * 1.00 = صد درصد
     */

    passingPercentage: 0.50,


    /*
     * زمان هر سؤال بر حسب ثانیه
     */

    questionTime: 15,


    /*
     * XP پایه
     */

    baseXP: 10,


    /*
     * XP اضافه برای Combo
     */

    comboBonus: 5,


    /*
     * تعداد Heart کم‌شده برای پاسخ غلط
     */

    wrongAnswerPenalty: 1

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
            stage;


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


        const stageQuestions =
            this.getStageQuestions(
                stage
            );


        /*
         * ابتدا کل سؤال‌های این مرحله
         * Shuffle می‌شوند.
         *
         * سپس فقط N سؤال انتخاب می‌شود.
         */

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

                passed: false

            };

        }


        const correct =
            answerIndex !== null &&
            answerIndex ===
            Number(
                question.answer
            );


        let earnedXP = 0;



        if (correct) {


            this.correctAnswers++;


            this.combo++;


            if (
                this.combo >
                this.state.bestCombo
            ) {

                this.state.bestCombo =
                    this.combo;

            }


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


        } else {


            this.wrongAnswers++;


            this.combo = 0;


            if (
                this.state.hearts > 0
            ) {

                this.state.hearts =
                    Math.max(
                        0,
                        this.state.hearts -
                        QUIZ_CONFIG.wrongAnswerPenalty
                    );

            }

        }



        this.currentQuestion++;



        const finished =
            this.currentQuestion >=
            this.selectedQuestions.length;



        let passed = false;



        if (finished) {


            const total =
                this.selectedQuestions.length;


            const percentage =
                total > 0
                    ? this.correctAnswers /
                      total
                    : 0;


            /*
             * قبولی کل مرحله
             * بر اساس تمام پاسخ‌های مرحله است،
             * نه پاسخ سؤال آخر.
             */

            passed =
                percentage >=
                QUIZ_CONFIG.passingPercentage;



            if (passed) {


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

            }

        }



        this.saveState();



        return {

            correct,

            finished,

            passed,

            earnedXP,

            combo: this.combo,

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
