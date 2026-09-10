const USERS_KEY =
    "quizduo_users";

const CURRENT_USER_KEY =
    "quizduo_current_user";


function getUsers() {

    try {

        const saved =
            localStorage.getItem(
                USERS_KEY
            );


        if (!saved) {

            return [];

        }


        const users =
            JSON.parse(saved);


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


function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

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
    confirmPassword
) {

    username =
        username.trim();


    if (!username) {

        return {
            success: false,
            message:
                "لطفاً نام کاربری را وارد کنید."
        };

    }


    if (username.length < 3) {

        return {
            success: false,
            message:
                "نام کاربری باید حداقل ۳ کاراکتر باشد."
        };

    }


    if (!password) {

        return {
            success: false,
            message:
                "لطفاً رمز عبور را وارد کنید."
        };

    }


    if (password.length < 6) {

        return {
            success: false,
            message:
                "رمز عبور باید حداقل ۶ کاراکتر باشد."
        };

    }


    if (password !== confirmPassword) {

        return {
            success: false,
            message:
                "رمزهای عبور با هم یکسان نیستند."
        };

    }


    const users =
        getUsers();


    const exists =
        users.some(
            user =>
                user.username.toLowerCase() ===
                username.toLowerCase()
        );


    if (exists) {

        return {
            success: false,
            message:
                "این نام کاربری قبلاً ثبت شده است."
        };

    }


    users.push({

        username,

        password

    });


    saveUsers(users);


    localStorage.setItem(
        CURRENT_USER_KEY,
        username
    );


    return {

        success: true,

        message:
            "ثبت‌نام با موفقیت انجام شد."

    };

}


export function login(
    username,
    password
) {

    username =
        username.trim();


    if (!username || !password) {

        return {

            success: false,

            message:
                "نام کاربری و رمز عبور را وارد کنید."

        };

    }


    const users =
        getUsers();


    const user =
        users.find(
            item =>
                item.username.toLowerCase() ===
                    username.toLowerCase() &&
                item.password ===
                    password
        );


    if (!user) {

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

        message:
            "ورود با موفقیت انجام شد."

    };

}


export function logout() {

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

}
