const USERS_KEY =
    "quizduo_users";


const CURRENT_USER_KEY =
    "quizduo_current_user";



function loadUsers() {

    try {

        const saved =
            localStorage.getItem(
                USERS_KEY
            );


        if (!saved) {

            return {};

        }


        const users =
            JSON.parse(
                saved
            );


        if (
            typeof users !==
            "object" ||
            users === null
        ) {

            return {};

        }


        return users;


    } catch (error) {


        console.error(
            "Could not load QuizDuo users:",
            error
        );


        return {};

    }

}



function saveUsers(
    users
) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(
            users
        )
    );

}



function normalizeUsername(
    username
) {

    return String(
        username || ""
    )
        .trim()
        .toLowerCase();

}



export function getCurrentUser() {

    return localStorage.getItem(
        CURRENT_USER_KEY
    );

}



export function isLoggedIn() {

    return Boolean(
        getCurrentUser()
    );

}



export function register(
    username,
    password,
    passwordConfirm
) {


    const cleanUsername =
        String(
            username || ""
        ).trim();


    const normalized =
        normalizeUsername(
            cleanUsername
        );


    if (
        cleanUsername.length < 3
    ) {

        return {

            success: false,

            message:
                "نام کاربری باید حداقل ۳ کاراکتر باشد."

        };

    }


    if (
        !/^[a-zA-Z0-9_\u0600-\u06FF]+$/.test(
            cleanUsername
        )
    ) {

        return {

            success: false,

            message:
                "نام کاربری فقط می‌تواند شامل حروف، اعداد و _ باشد."

        };

    }


    if (
        String(password || "").length < 4
    ) {

        return {

            success: false,

            message:
                "رمز عبور باید حداقل ۴ کاراکتر باشد."

        };

    }


    if (
        password !==
        passwordConfirm
    ) {

        return {

            success: false,

            message:
                "رمزهای عبور یکسان نیستند."

        };

    }


    const users =
        loadUsers();


    if (
        users[normalized]
    ) {

        return {

            success: false,

            message:
                "این نام کاربری قبلاً ثبت شده است."

        };

    }


    /*
     * توجه:
     * این فقط نسخه آزمایشی Frontend است.
     * در نسخه واقعی رمز عبور نباید به این شکل
     * در localStorage ذخیره شود.
     */

    users[normalized] = {

        username:
            cleanUsername,

        password:
            password,

        createdAt:
            new Date().toISOString()

    };


    saveUsers(
        users
    );


    localStorage.setItem(
        CURRENT_USER_KEY,
        cleanUsername
    );


    return {

        success: true,

        username:
            cleanUsername,

        message:
            "حساب شما با موفقیت ساخته شد."

    };

}



export function login(
    username,
    password
) {


    const normalized =
        normalizeUsername(
            username
        );


    const users =
        loadUsers();


    const user =
        users[normalized];


    if (
        !user
    ) {

        return {

            success: false,

            message:
                "نام کاربری یا رمز عبور اشتباه است."

        };

    }


    if (
        user.password !==
        password
    ) {

        return {

            success: false,

            message:
                "نام کاربری یا رمز عبور اشتباه است."

        };

    }


    localStorage.setItem(
        CURRENT_USER_KEY,
        user.username
    );


    return {

        success: true,

        username:
            user.username,

        message:
            "ورود با موفقیت انجام شد."

    };

}



export function logout() {

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

}



export function getUserList() {

    return Object.values(
        loadUsers()
    );

}
