export const DEFAULT_STATE = {
    username: "بازیکن مهمان",

    xp: 0,

    level: 1,

    streak: 0,

    lastActiveDate: null,

    lastRewardDate: null,

    generalStage: 1,

    funStage: 1,

    completedGeneralStages: [],

    completedFunStages: [],

    currentCategory: "general",

    subscription: "free",

    hearts: 5,

    maxHearts: 5,

    combo: 0,

    bestCombo: 0,

    theme: "dark"
};


export function createDefaultState() {

    return structuredClone(
        DEFAULT_STATE
    );

}


export function calculateLevel(xp) {

    return Math.floor(xp / 100) + 1;

}


export function addXP(state, amount) {

    state.xp += amount;

    state.level =
        calculateLevel(
            state.xp
        );

}


export function getCurrentStage(
    state,
    category
) {

    if (category === "general") {

        return state.generalStage;

    }

    return state.funStage;

}


export function unlockNextStage(
    state,
    category
) {

    if (category === "general") {

        state.generalStage += 1;

    } else {

        state.funStage += 1;

    }

}


export function isStageCompleted(
    state,
    category,
    stage
) {

    const list =
        category === "general"

            ? state.completedGeneralStages

            : state.completedFunStages;


    return (
        Array.isArray(list) &&
        list.includes(stage)
    );

}


export function markStageCompleted(
    state,
    category,
    stage
) {

    const key =
        category === "general"

            ? "completedGeneralStages"

            : "completedFunStages";


    if (!Array.isArray(state[key])) {

        state[key] = [];

    }


    if (!state[key].includes(stage)) {

        state[key].push(stage);

        state[key].sort(
            (a, b) => a - b
        );

    }

}
