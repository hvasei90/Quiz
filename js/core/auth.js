const USERS_KEY =
    "quizduo_users";

const CURRENT_USER_KEY =
    "quizduo_current_user";


function readUsers() {

    try {

        const value =
            localStorage.getItem(
                USERS_KEY
            );


        const users =
            value
                ? JSON.parse(value)
                : [];


        return Array.isArray(users)
            ? users
            : [];

    } catch (error) {

        console.error(
            "QuizDuo users error:",
            error
        );


        return [];

    }

}


function writeUsers(users) {

    localStorage.setItem(

        USERS_KEY,

        JSON.stringify(users)

    );

}


function normalizeUsername(username) {

    return username
        .trim()
        .toLocaleLowerCase();

}


export function getRegisteredUsers() {

    return readUsers();

}


export function getCurrentUser() {

    return localStorage.getItem(
        CURRENT_USER_KEY
    ) || null;

}


export function isLoggedIn() {

    return Boolean(
        getCurrentUser()
    );

}


export function register(
    username,
    password,
    confirmPassword
) {

    username =
        username.trim();


    if (username.length < 3) {

        return {

            ok: false,

            message:
                "نام کاربری باید حداقل ۳ کاراکتر باشد."

        };

    }


    if (username.length > 24) {

        return {

            ok: false,

            message:
                "نام کاربری نمی‌تواند بیشتر از ۲۴ کاراکتر باشد."

        };

    }


    if (
        !/^[\p{L}\p{N}_-]+$/u.test(
            username
        )
    ) {

        return {

            ok: false,

            message:
                "نام کاربری فقط می‌تواند شامل حروف، عدد، _ و - باشد."

        };

    }


    if (password.length < 6) {

        return {

            ok: false,

            message:
                "رمز عبور باید حداقل ۶ کاراکتر باشد."

        };

    }


    if (
        password !==
        confirmPassword
    ) {

        return {

            ok: false,

            message:
                "تکرار رمز عبور با رمز اصلی یکسان نیست."

        };

    }


    const users =
        readUsers();


    const normalized =
        normalizeUsername(
            username
        );


    const duplicate =
        users.some(
            user =>
                normalizeUsername(
                    user.username
                ) === normalized
        );


    if (duplicate) {

        return {

            ok: false,

            message:
                "این نام کاربری قبلاً ثبت شده است. یک نام دیگر انتخاب کن."

        };

    }


    users.push({

        username,

        password,

        createdAt:
            new Date().toISOString()

    });


    writeUsers(users);


    localStorage.setItem(

        CURRENT_USER_KEY,

        username

    );


    return {

        ok: true,

        username

    };

}


export function login(
    username,
    password
) {

    username =
        username.trim();


    const users =
        readUsers();


    const normalized =
        normalizeUsername(
            username
        );


    const user =
        users.find(

            item =>
                normalizeUsername(
                    item.username
                ) === normalized

        );


    if (
        !user ||
        user.password !== password
    ) {

        return {

            ok: false,

            message:
                "نام کاربری یا رمز عبور اشتباه است."

        };

    }


    localStorage.setItem(

        CURRENT_USER_KEY,

        user.username

    );


    return {

        ok: true,

        username:
            user.username

    };

}


export function logout() {

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

}
