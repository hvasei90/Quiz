const STATE_PREFIX =
    "quizduo_state_";

const GUEST_KEY =
    "quizduo_state_guest";


function keyFor(username) {

    if (
        !username ||
        username === "بازیکن مهمان"
    ) {

        return GUEST_KEY;

    }


    return (
        STATE_PREFIX +
        encodeURIComponent(username)
    );

}


export function loadState(
    defaultState,
    username = "بازیکن مهمان"
) {

    try {

        const saved =
            localStorage.getItem(
                keyFor(username)
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


export function saveState(
    state,
    username = state.username
) {

    try {

        localStorage.setItem(

            keyFor(username),

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
    username = "بازیکن مهمان"
) {

    localStorage.removeItem(
        keyFor(username)
    );

}
