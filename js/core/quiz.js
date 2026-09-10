export class QuizEngine {

    constructor(state, saveState) {

        this.state = state;
        this.saveState = saveState;

        this.questions = [];

        this.currentQuestion = 0;

        this.currentCategory = "general";

        this.currentStage = 1;

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


    startStage(category, stage) {

        this.currentCategory = category;

        this.currentStage = stage;

        this.currentQuestion = 0;

    }


    getCurrentQuestion() {

        const questions =
            this.getStageQuestions(
                this.currentStage
            );

        return questions[
            this.currentQuestion
        ];

    }


    getQuestionCount() {

        return this.getStageQuestions(
            this.currentStage
        ).length;

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
            answerIndex === question.answer;


        if (correct) {

            this.state.xp +=
                question.xp || 10;

        }


        this.currentQuestion++;


        const finished =
            this.currentQuestion >=
            this.getQuestionCount();


        if (finished && correct) {

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


        this.saveState();


        return {

            correct,
            finished,

            explanation:
                question.explanation || "",

            xp:
                correct
                    ? question.xp || 10
                    : 0

        };

    }

}
