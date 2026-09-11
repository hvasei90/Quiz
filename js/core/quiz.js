import { shuffle } from "./utils.js";

import {
    addXP,
    markStageCompleted,
    isStageCompleted
} from "./state.js";


export const QUIZ_CONFIG = {

    questionsPerStage: 2,

    passingPercentage: 0.5,

    questionTime: 20,

    stageXP: 10,

    failedStageHeartPenalty: 1

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

        this.isReplay = false;

        this.stageRewardGiven = false;

        this.lastResult = null;

    }


    async loadCategory(category) {

        const response =
            await fetch(
                `data/${category}.json`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Could not load ${category}.json`
            );

        }


        const data =
            await response.json();


        if (Array.isArray(data.questions)) {

            this.questions =
                data.questions;

        } else if (
            Array.isArray(data.stages)
        ) {

            this.questions =
                data.stages.flatMap(
                    stage =>
                        (stage.questions || [])
                            .map(question => ({
                                ...question,
                                stage: stage.stage
                            }))
                );

        } else {

            this.questions = [];

        }


        this.currentCategory =
            category;

    }


    getStageQuestions(stage) {

        return this.questions.filter(
            question =>
                Number(question.stage) ===
                Number(stage)
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

        this.finished = false;

        this.stageRewardGiven = false;


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


    answer(answerIndex) {

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
            question.answer;


        if (correct) {

            this.correctAnswers++;

            this.combo++;

        } else {

            this.wrongAnswers++;

            this.combo = 0;

        }


        this.currentQuestion++;


        const finished =
            this.currentQuestion >=
            this.selectedQuestions.length;


        let passed = false;

        let earnedXP = 0;

        let heartLost = false;

        let newlyCompleted = false;


        if (finished) {

            const percentage =
                this.selectedQuestions.length

                    ? this.correctAnswers /
                      this.selectedQuestions.length

                    : 0;


            passed =
                percentage >=
                QUIZ_CONFIG.passingPercentage;


            if (passed) {

                const alreadyCompleted =
                    isStageCompleted(
                        this.state,
                        this.currentCategory,
                        this.currentStage
                    );


                if (
                    !this.isReplay &&
                    !alreadyCompleted
                ) {

                    addXP(
                        this.state,
                        QUIZ_CONFIG.stageXP
                    );


                    earnedXP =
                        QUIZ_CONFIG.stageXP;


                    markStageCompleted(
                        this.state,
                        this.currentCategory,
                        this.currentStage
                    );


                    newlyCompleted =
                        true;

                    this.stageRewardGiven =
                        true;

                }

            } else if (
                !this.isReplay
            ) {

                /*
                 * مهم:
                 * قلب اینجا کم می‌شود،
                 * نه هنگام هر سؤال اشتباه.
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

                    heartLost = true;

                }

            }

        }


        this.finished =
            finished;


        const result = {

            correct,

            finished,

            passed,

            earnedXP,

            heartLost,

            newlyCompleted,

            replay: this.isReplay,

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


        this.lastResult =
            result;


        this.saveState();


        return result;

    }

}
