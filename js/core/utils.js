export function todayKey() {

    const date = new Date();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");

}


export function daysBetween(dateA, dateB) {

    const a = new Date(dateA);
    const b = new Date(dateB);

    const difference =
        Math.abs(b - a);

    return Math.floor(
        difference /
        (1000 * 60 * 60 * 24)
    );

}


export function updateStreak(state) {

    const today = todayKey();


    if (!state.lastActiveDate) {

        state.streak = 1;

        state.lastActiveDate =
            today;

        return;

    }


    if (
        state.lastActiveDate ===
        today
    ) {

        return;

    }


    const difference =
        daysBetween(
            state.lastActiveDate,
            today
        );


    if (difference === 1) {

        state.streak += 1;

    } else {

        state.streak = 1;

    }


    state.lastActiveDate =
        today;

}


export function canClaimDailyReward(state) {

    return (
        state.lastRewardDate !==
        todayKey()
    );

}


export function claimDailyReward(state) {

    if (!canClaimDailyReward(state)) {

        return 0;

    }


    state.lastRewardDate =
        todayKey();


    return 25;

}


export function shuffle(array) {

    const result = [...array];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];

    }


    return result;

}


export function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}
