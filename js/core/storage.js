const STATE_PREFIX =
    "quizduo_state_";


const USERS_KEY =
    "quizduo_users";


const CURRENT_USER_KEY =
    "quizduo_current_user";


const LEADERBOARD_KEY =
    "quizduo_leaderboard";


function userKey(username) {

    return (
        STATE_PREFIX +
        encodeURIComponent(
            String(
                username ||
                "guest"
            ).toLowerCase()
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
                userKey(username)
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

            ...parsed,

            completedGeneralStages:
                Array.isArray(
                    parsed.completedGeneralStages
                )
                    ? parsed.completedGeneralStages
                    : [],

            completedFunStages:
                Array.isArray(
                    parsed.completedFunStages
                )
                    ? parsed.completedFunStages
                    : []

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
    username =
        state.username ||
        "guest"
) {

    try {

        localStorage.setItem(
            userKey(username),
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


export function getCurrentUser() {

    return localStorage.getItem(
        CURRENT_USER_KEY
    ) || null;

}


export function setCurrentUser(
    username
) {

    localStorage.setItem(
        CURRENT_USER_KEY,
        username
    );

}


export function logoutUser() {

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

}


export function getUsers() {

    try {

        const users =
            JSON.parse(
                localStorage.getItem(
                    USERS_KEY
                ) || "[]"
            );


        return Array.isArray(users)
            ? users
            : [];

    } catch {

        return [];

    }

}


export function saveUsers(
    users
) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

}


export function getLeaderboard() {

    try {

        const board =
            JSON.parse(
                localStorage.getItem(
                    LEADERBOARD_KEY
                ) || "[]"
            );


        return Array.isArray(board)
            ? board
            : [];

    } catch {

        return [];

    }

}


export function updateLeaderboard(
    state
) {

    if (
        !state.username ||
        state.username ===
        "بازیکن مهمان"
    ) {

        return;

    }


    const board =
        getLeaderboard().filter(
            item =>
                item.username.toLowerCase() !==
                state.username.toLowerCase()
        );


    board.push({

        username:
            state.username,

        xp:
            state.xp,

        level:
            state.level,

        generalStage:
            Math.max(
                0,
                state.generalStage - 1
            ),

        funStage:
            Math.max(
                0,
                state.funStage - 1
            ),

        updatedAt:
            Date.now()

    });


    board.sort(
        (a, b) =>
            b.xp - a.xp ||
            b.level - a.level ||
            b.updatedAt - a.updatedAt
    );


    localStorage.setItem(
        LEADERBOARD_KEY,
        JSON.stringify(
            board.slice(0, 100)
        )
    );

}
