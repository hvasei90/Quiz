const STATE_PREFIX =
    "quizduo_state_";


function getStateKey(username) {

    const safeUsername =
        encodeURIComponent(
            username || "guest"
        );

    return `${STATE_PREFIX}${safeUsername}`;

}


export function loadState(
    defaultState,
    username = "guest"
) {

    try {

        const saved =
            localStorage.getItem(
                getStateKey(username)
            );


        if (!saved) {

            return structuredClone(
                defaultState
            );

        }


        const parsed =
            JSON.parse(saved);


        return {

            ...structuredClone(
                defaultState
            ),

            ...parsed

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


export function saveState(
    state,
    username = "guest"
) {

    try {

        localStorage.setItem(
            getStateKey(username),
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


export function clearState(
    username = "guest"
) {

    localStorage.removeItem(
        getStateKey(username)
    );

}
