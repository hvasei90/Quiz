const STORAGE_PREFIX =
    "quizduo_state_";


function getStorageKey(
    username
) {

    const normalized =
        String(
            username || "guest"
        )
            .trim()
            .toLowerCase();


    return (
        STORAGE_PREFIX +
        encodeURIComponent(
            normalized
        )
    );

}


export function loadState(
    defaultState,
    username = "guest"
) {

    try {

        const saved =
            localStorage.getItem(
                getStorageKey(
                    username
                )
            );


        if (!saved) {

            return structuredClone(
                defaultState
            );

        }


        const parsed =
            JSON.parse(
                saved
            );


        const result = {

            ...structuredClone(
                defaultState
            ),

            ...parsed

        };


        /*
         * سازگاری با نسخه‌های قدیمی
         */

        if (
            !result.completedStages
        ) {

            result.completedStages = {

                general: [],

                fun: []

            };

        }


        if (
            !Array.isArray(
                result.completedStages.general
            )
        ) {

            result.completedStages.general =
                [];

        }


        if (
            !Array.isArray(
                result.completedStages.fun
            )
        ) {

            result.completedStages.fun =
                [];

        }


        return result;


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
            getStorageKey(
                username
            ),
            JSON.stringify(
                state
            )
        );


        return true;


    } catch (error) {


        console.error(
            "Could not save QuizDuo state:",
            error
        );


        return false;

    }

}


export function clearState(
    username = "guest"
) {

    localStorage.removeItem(
        getStorageKey(
            username
        )
    );

}
