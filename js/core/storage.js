const STORAGE_KEY =
    "quizduo_state";


export function loadState(defaultState) {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {

            return structuredClone(
                defaultState
            );

        }


        return {

            ...structuredClone(
                defaultState
            ),

            ...JSON.parse(saved)

        };

    } catch (error) {

        console.error(
            "QuizDuo state error:",
            error
        );


        return structuredClone(
            defaultState
        );

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
            "Could not save state:",
            error
        );

        return false;

    }

}


export function clearState() {

    localStorage.removeItem(
        STORAGE_KEY
    );

}
