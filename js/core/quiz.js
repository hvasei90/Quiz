import {
    shuffle
} from "./utils.js";

import {
    markStageCompleted,
    isStageCompleted
} from "./state.js";


export const QUIZ_CONFIG = {

    questionsPerStage: 2,

    passingPercentage: 0.50,

    questionTime: 15,

    baseXP: 10,

    comboBonus: 5,

    failedStagePenalty: 1

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

        this.isReplay = false;

        this.pendingXP = 0;

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
        stage,
        replay = false
    ) {

        this.currentCategory =
            category;

        this.currentStage =
            stage;

        this.isReplay =
            replay;


        this.currentQuestion = 0;

        this.correctAnswers = 0;

        this.wrongAnswers = 0;

        this.combo = 0;

        this.pendingXP = 0;

        this.finished = false;


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


        let questionXP = 0;


        if (correct) {

            this.correctAnswers++;

            this.combo++;


            if (
                !this.isReplay &&
                this.combo >
                    this.state.bestCombo
            ) {

                this.state.bestCombo =
                    this.combo;

            }


            questionXP =
                (question.xp ||
                    QUIZ_CONFIG.baseXP) +
                Math.max(
                    0,
                    this.combo - 1
                ) *
                QUIZ_CONFIG.comboBonus;


            if (!this.isReplay) {

                this.pendingXP +=
                    questionXP;

            }

        } else {

            this.wrongAnswers++;

            this.combo = 0;

        }


        this.currentQuestion++;


        const finished =
            this.currentQuestion >=
            this.selectedQuestions.length;


        let passed = false;

        let heartLost = false;

        let earnedXP = 0;


        if (finished) {

            const percentage =
                this.selectedQuestions.length
                    ? this.correctAnswers /
                      this.selectedQuestions.length
                    : 0;


            passed =
                percentage >=
                QUIZ_CONFIG.passingPercentage;


            /*
             * XP فقط وقتی اضافه می‌شود که
             * کل مرحله با موفقیت تمام شده باشد.
             */
            if (
                passed &&
                !this.isReplay
            ) {

                earnedXP =
                    this.pendingXP;

                this.state.xp +=
                    earnedXP;

                markStageCompleted(
                    this.state,
                    this.currentCategory,
                    this.currentStage
                );


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


            /*
             * اگر مرحله برای اولین بار
             * با شکست تمام شود فقط یک قلب کم می‌شود.
             */
            if (
                !passed &&
                !this.isReplay &&
                this.state.hearts > 0
            ) {

                this.state.hearts -=
                    QUIZ_CONFIG.failedStagePenalty;

                heartLost = true;

            }


            this.finished = true;

        }


        this.saveState();


        return {

            correct,

            finished,

            passed,

            earnedXP,

            pendingXP:
                this.pendingXP,

            heartLost,

            isReplay:
                this.isReplay,

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
                question.explanation || ""

        };

    }


    isCompletedStage() {

        return isStageCompleted(
            this.state,
            this.currentCategory,
            this.currentStage
        );

    }

}
