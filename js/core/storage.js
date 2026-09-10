const STORAGE_KEY = "quizduo_state";


export function loadState(defaultState) {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return structuredClone(defaultState);
        }

        return {
            ...structuredClone(defaultState),
            ...JSON.parse(saved)
        };

    } catch (error) {

        console.error(
            "Failed to load QuizDuo state:",
            error
        );

        return structuredClone(defaultState);

    }

}


export function saveState(state) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

        return true;

    } catch (error) {

        console.error(
            "Failed to save QuizDuo state:",
            error
        );

        return false;

    }

}


export function clearState() {

    localStorage.removeItem(STORAGE_KEY);

}


export function loadCollection(key) {

    try {

        const data =
            localStorage.getItem(key);

        return data
            ? JSON.parse(data)
            : [];

    } catch {

        return [];

    }

}


export function saveCollection(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

}
