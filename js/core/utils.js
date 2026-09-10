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
        difference / (1000 * 60 * 60 * 24)
    );

}


export function updateStreak(state) {

    const today = todayKey();

    if (!state.lastActiveDate) {

        state.streak = 1;
        state.lastActiveDate = today;

        return;

    }


    if (state.lastActiveDate === today) {
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


    state.lastActiveDate = today;

}


export function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
