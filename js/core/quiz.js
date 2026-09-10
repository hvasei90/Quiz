import {
    shuffle
} from "./utils.js";


export const QUIZ_CONFIG = {

    questionsPerStage: 2,

    passingPercentage: 0.50,

    questionTime: 15,

    baseXP: 10,

    comboBonus: 5,

    wrongAnswerPenalty: 1

};


export class QuizEngine {

    constructor(
        state,
        saveState
    ) {

        this.state = state;

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


    async loadCategory(category) {

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


    getStageQuestions(stage) {

        return this.questions.filter(
            question =>
                question.stage === stage
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


        this.currentQuestion = 0;

        this.correctAnswers = 0;

        this.wrongAnswers = 0;

        this.combo = 0;

        this.finished = false;


        const stageQuestions =
            this.getStageQuestions(
                stage
            );


        /*
         * سؤال‌ها ابتدا shuffle می‌شوند
         * و بعد فقط تعداد مشخصی انتخاب می‌شود.
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

        if (
            this.getQuestionCount() === 0
        ) {

            return 0;

        }


        return (
            this.currentQuestion /
            this.getQuestionCount()
        );

    }


    answer(answerIndex) {

        const question =
            this.getCurrentQuestion();


        if (!question) {

            return {
                finished: true,
                correct: false
            };

        }


        const correct =
            answerIndex ===
            question.answer;


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
                (question.xp ||
                    QUIZ_CONFIG.baseXP) +
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

                this.state.hearts -=
                    QUIZ_CONFIG.wrongAnswerPenalty;

            }

        }


        this.currentQuestion++;


        const finished =
            this.currentQuestion >=
            this.selectedQuestions.length;


        let passed = false;


        if (finished) {

            const percentage =
                this.correctAnswers /
                this.selectedQuestions.length;


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
                question.explanation || ""

        };

    }

}
