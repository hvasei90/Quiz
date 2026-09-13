<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>QuizDuo</title>

    <link rel="stylesheet" href="css/style.css">
</head>

<body>

<header class="site-header">

    <a class="logo" data-page="home">
        Quiz<span>Duo</span>
    </a>

    <nav class="main-nav">

        <button data-page="home">
            خانه
        </button>

        <button data-page="quiz">
            سؤالات
        </button>

        <button data-page="subscription">
            اشتراک 👑
        </button>

        <button data-page="leaderboard">
            لیدربورد
        </button>

        <button data-page="chat">
            گفت‌وگو
        </button>

        <button data-page="support">
            پشتیبانی
        </button>

        <button data-page="profile">
            پروفایل
        </button>

    </nav>

    <div class="auth-area">

        <button
            id="themeToggle"
            class="icon-btn"
            type="button"
        >
            🌙
        </button>

        <button
            id="authButton"
            class="secondary-btn"
            type="button"
        >
            ورود
        </button>

        <button
            id="logoutButton"
            class="secondary-btn hidden"
            type="button"
        >
            خروج
        </button>

    </div>

</header>

<main>

    <!-- HOME -->

    <section
        id="home"
        class="page active"
    >

        <div class="hero">

            <div>

                <span class="eyebrow">
                    QUIZDUO
                </span>

                <h1>
                    بازی کن، یاد بگیر،
                    <span>پیشرفت کن.</span>
                </h1>

                <p>
                    QuizDuo یک فضای بازی‌محور برای
                    حل سؤال، رقابت و ساختن رکوردهای جدید است.
                </p>

                <div class="hero-actions">

                    <button
                        class="primary-btn"
                        data-page="quiz"
                    >
                        شروع بازی
                    </button>

                    <button
                        class="secondary-btn"
                        data-page="subscription"
                    >
                        مشاهده اشتراک‌ها
                    </button>

                </div>

            </div>

            <div class="hero-stats">

                <div>
                    <b id="homeXP">0</b>
                    <span>XP</span>
                </div>

                <div>
                    <b id="homeLevel">1</b>
                    <span>سطح</span>
                </div>

                <div>
                    <b id="homeStreak">0</b>
                    <span>Streak</span>
                </div>

            </div>

        </div>

        <div
            id="dailyRewardCard"
            class="daily-reward-card"
        ></div>

        <div class="feature-grid">

            <article class="feature-card">
                <span>🧠</span>
                <h3>اطلاعات عمومی</h3>
                <p>
                    سؤال‌های متنوع برای سنجش دانسته‌ها.
                </p>
            </article>

            <article class="feature-card">
                <span>🎮</span>
                <h3>تفریحی</h3>
                <p>
                    سؤال‌های سرگرم‌کننده و غیرمنتظره.
                </p>
            </article>

            <article class="feature-card">
                <span>🔥</span>
                <h3>Streak</h3>
                <p>
                    با برگشتن روزانه رکوردت را حفظ کن.
                </p>
            </article>

            <article class="feature-card">
                <span>🏆</span>
                <h3>رقابت</h3>
                <p>
                    XP جمع کن و در رتبه‌بندی بالا برو.
                </p>
            </article>

        </div>

    </section>


    <!-- AUTH -->

    <section
        id="auth"
        class="page"
    >

        <div class="panel auth-panel">

            <div class="section-heading">

                <span>👤</span>

                <div>

                    <h2 id="authTitle">
                        ورود
                    </h2>

                    <p>
                        وارد حساب QuizDuo شو.
                    </p>

                </div>

            </div>

            <input
                id="authName"
                placeholder="نام کاربری"
                autocomplete="username"
            >

            <input
                id="authPassword"
                type="password"
                placeholder="رمز عبور"
                autocomplete="current-password"
            >

            <div
                id="confirmPasswordWrap"
                class="hidden"
            >

                <input
                    id="authConfirmPassword"
                    type="password"
                    placeholder="تکرار رمز عبور"
                    autocomplete="new-password"
                >

            </div>

            <button
                id="authSubmit"
                class="primary-btn full-btn"
                type="button"
            >
                ورود
            </button>

            <p
                id="authMsg"
                class="form-message"
            ></p>

            <button
                id="toggleAuth"
                class="secondary-btn full-btn"
                type="button"
            >
                ساخت حساب جدید
            </button>

        </div>

    </section>


    <!-- QUIZ -->

    <section
        id="quiz"
        class="page"
    >

        <div class="section-heading">

            <span>🎯</span>

            <div>

                <h2>
                    سؤالات
                </h2>

                <p>
                    مرحله‌ها را کامل کن و XP بگیر.
                </p>

            </div>

        </div>

        <div class="quiz-tabs">

            <button
                class="active"
                data-category-tab="general"
            >
                🧠 اطلاعات عمومی
            </button>

            <button
                data-category-tab="fun"
            >
                🎮 تفریحی
            </button>

        </div>

        <div class="quiz-stats">

            <span>
                ⭐ XP:
                <b id="quizXP">0</b>
            </span>

            <span>
                🎁 XP روزانه:
                <b id="dailyXPValue">10</b>
            </span>

            <span>
                🔥 Streak:
                <b id="quizStreak">0</b>
            </span>

            <span>
                ❤️ قلب:
                <b id="heartValue">5</b>
            </span>

            <span>
                ⚡ Combo:
                <b id="comboValue">0</b>
            </span>

        </div>

        <div
            id="stageList"
            class="stage-grid"
        ></div>

        <div
            id="quizBox"
            class="quiz-box panel hidden"
        >

            <div class="quiz-topline">

                <span id="quizCategory"></span>

                <span id="questionNumber"></span>

            </div>

            <div class="progress-track">
                <div
                    id="quizProgress"
                    class="progress-fill"
                ></div>
            </div>

            <div class="timer-row">

                <span>
                    زمان
                </span>

                <b id="questionTimer">
                    20s
                </b>

            </div>

            <div class="timer-track">

                <div
                    id="timerProgress"
                    class="timer-fill"
                ></div>

            </div>

            <h2 id="questionText"></h2>

            <div
                id="answers"
                class="answers"
            ></div>

            <div id="quizResult"></div>

            <button
                id="nextQuestionBtn"
                type="button"
                class="primary-btn next-btn hidden"
            >
                سؤال بعدی →
            </button>

        </div>

    </section>


    <!-- SUBSCRIPTION -->

    <section
        id="subscription"
        class="page"
    >

        <div class="subscription-hero">

            <div>

                <span class="eyebrow">
                    QUIZDUO PREMIUM
                </span>

                <h1>
                    بیشتر بازی کن،
                    بیشتر پیشرفت کن 👑
                </h1>

                <p>
                    اشتراک Premium برای بازیکن‌هایی
                    که می‌خوان امکانات بیشتری داشته باشن.
                </p>

            </div>

            <div class="premium-orb">
                👑
            </div>

        </div>


        <div class="sub-section-title">

            <h2>
                پلن مناسب خودت رو انتخاب کن
            </h2>

            <span>
                ← برای دیدن همه پلن‌ها اسکرول کن
            </span>

        </div>


        <div class="subscription-scroll">

            <article
                class="subscription-card"
                data-plan-card="monthly"
            >

                <div class="plan-icon">
                    🌱
                </div>

                <span class="plan-tag">
                    شروع
                </span>

                <h3>
                    ماهانه
                </h3>

                <div class="price">
                    ۱۰۰,۰۰۰
                    <small>تومان</small>
                </div>

                <p>
                    ۱ ماه Premium
                </p>

                <button
                    class="primary-btn plan-select"
                    data-plan="monthly"
                >
                    انتخاب پلن
                </button>

            </article>


            <article
                class="subscription-card popular"
                data-plan-card="quarterly"
            >

                <div class="popular-badge">
                    محبوب‌ترین
                </div>

                <div class="plan-icon">
                    🚀
                </div>

                <span class="plan-tag">
                    به‌صرفه
                </span>

                <h3>
                    سه‌ماهه
                </h3>

                <div class="price">
                    ۲۷۰,۰۰۰
                    <small>تومان</small>
                </div>

                <p>
                    ۳ ماه Premium
                </p>

                <button
                    class="primary-btn plan-select"
                    data-plan="quarterly"
                >
                    انتخاب پلن
                </button>

            </article>


            <article
                class="subscription-card"
                data-plan-card="sixMonth"
            >

                <div class="plan-icon">
                    💎
                </div>

                <span class="plan-tag">
                    ارزشمند
                </span>

                <h3>
                    شش‌ماهه
                </h3>

                <div class="price">
                    ۴۸۰,۰۰۰
                    <small>تومان</small>
                </div>

                <p>
                    ۶ ماه + ۱ ماه هدیه
                </p>

                <button
                    class="primary-btn plan-select"
                    data-plan="sixMonth"
                >
                    انتخاب پلن
                </button>

            </article>


            <article
                class="subscription-card"
                data-plan-card="nineMonth"
            >

                <div class="plan-icon">
                    🏆
                </div>

                <span class="plan-tag">
                    ویژه
                </span>

                <h3>
                    نه‌ماهه
                </h3>

                <div class="price">
                    ۶۶۰,۰۰۰
                    <small>تومان</small>
                </div>

                <p>
                    ۹ ماه Premium + ۱ ماه هدیه
                </p>

                <button
                    class="primary-btn plan-select"
                    data-plan="nineMonth"
                >
                    انتخاب پلن
                </button>

            </article>

        </div>


        <div class="premium-benefits-section">

            <div class="sub-section-title">

                <h2>
                    با Premium چی می‌گیری؟
                </h2>

                <span>
                    مزایا بدون شلوغی اضافه
                </span>

            </div>

            <div class="benefit-grid">

                <article class="benefit-card">
                    <span>❤️</span>
                    <h3>قلب بیشتر</h3>
                    <p>
                        حداکثر ۸ قلب برای بازی راحت‌تر.
                    </p>
                </article>

                <article class="benefit-card">
                    <span>🔐</span>
                    <h3>مراحل ویژه</h3>
                    <p>
                        دسترسی به محتوای ویژه در نسخه‌های بعدی.
                    </p>
                </article>

                <article class="benefit-card">
                    <span>📊</span>
                    <h3>آمار پیشرفته</h3>
                    <p>
                        جزئیات بیشتر درباره عملکرد و رکوردها.
                    </p>
                </article>

                <article class="benefit-card">
                    <span>🎁</span>
                    <h3>هدیه‌های دوره‌ای</h3>
                    <p>
                        پاداش‌های کوچک و جذاب برای اعضای Premium.
                    </p>
                </article>

            </div>

        </div>


        <div class="referral-panel">

            <div>

                <span class="referral-icon">
                    🤝
                </span>

                <div>

                    <h2>
                        دوستات رو دعوت کن
                    </h2>

                    <p>
                        با رشد QuizDuo، خودت هم جایزه بگیر.
                    </p>

                </div>

            </div>

            <div class="referral-grid">

                <div>
                    <b>۵</b>
                    <span>دعوت موفق</span>
                    <strong>+۱ ماه</strong>
                </div>

                <div>
                    <b>۱۰</b>
                    <span>دعوت موفق</span>
                    <strong>+۲ ماه</strong>
                </div>

                <div>
                    <b>۲۰</b>
                    <span>دعوت موفق</span>
                    <strong>+۴ ماه</strong>
                </div>

            </div>

        </div>


        <div
            id="paymentPanel"
            class="payment-panel panel"
        >

            <div class="payment-header">

                <div>

                    <span class="eyebrow">
                        MANUAL PAYMENT
                    </span>

                    <h2>
                        تکمیل اشتراک
                    </h2>

                </div>

                <div class="secure-badge">
                    🧾 بررسی دستی
                </div>

            </div>


            <div class="payment-layout">


                <div class="selected-plan-box">

                    <span>
                        پلن انتخاب‌شده
                    </span>

                    <strong id="selectedPlanName">
                        ماهانه
                    </strong>

                    <b id="selectedPlanAmount">
                        ۱۰۰,۰۰۰ تومان
                    </b>

                </div>


                <div class="discount-box">

                    <label for="discountCode">
                        کد تخفیف
                    </label>

                    <div class="discount-row">

                        <input
                            id="discountCode"
                            placeholder="مثلاً TEST100K"
                        >

                        <button
                            id="applyDiscount"
                            type="button"
                            class="secondary-btn"
                        >
                            اعمال
                        </button>

                    </div>

                    <p
                        id="discountMsg"
                        class="form-message"
                    ></p>

                </div>


                <div class="payment-summary">

                    <div>

                        <span>
                            قیمت پلن
                        </span>

                        <b id="basePrice">
                            ۱۰۰,۰۰۰ تومان
                        </b>

                    </div>

                    <div>

                        <span>
                            تخفیف
                        </span>

                        <b id="discountAmount">
                            ۰ تومان
                        </b>

                    </div>

                    <div class="final-price">

                        <span>
                            مبلغ نهایی
                        </span>

                        <strong id="finalPrice">
                            ۱۰۰,۰۰۰ تومان
                        </strong>

                    </div>

                </div>


                <div class="bank-transfer-box">

                    <div class="bank-transfer-head">

                        <span class="gateway-logo">
                            🏦
                        </span>

                        <div>

                            <strong>
                                پرداخت دستی QuizDuo
                            </strong>

                            <p>
                                مبلغ نهایی را به حساب زیر واریز کن
                                و تصویر فیش را ارسال کن.
                            </p>

                        </div>

                    </div>


                    <div class="bank-details">

                        <div>

                            <span>
                                نام صاحب حساب
                            </span>

                            <b>
                                نام صاحب حساب را اینجا وارد کنید
                            </b>

                        </div>

                        <div>

                            <span>
                                شماره کارت / حساب
                            </span>

                            <b dir="ltr">
                                XXXX XXXX XXXX XXXX
                            </b>

                        </div>

                        <div>

                            <span>
                                مبلغ قابل واریز
                            </span>

                            <b id="bankAmount">
                                ۱۰۰,۰۰۰ تومان
                            </b>

                        </div>

                    </div>


                    <div class="transfer-warning">

                        ⚠️ لطفاً مبلغ دقیق نمایش‌داده‌شده
                        را واریز کن و سپس فیش را انتخاب کن.

                    </div>

                </div>


                <div class="receipt-upload-box">

                    <label
                        for="receiptFile"
                        class="upload-label"
                    >
                        📎 تصویر فیش واریزی
                    </label>

                    <input
                        id="receiptFile"
                        type="file"
                        accept="image/*"
                    >

                    <p
                        id="receiptMsg"
                        class="form-message"
                    >
                        فقط تصویر فیش، حداکثر ۵ مگابایت.
                    </p>

                </div>


                <button
                    id="paymentButton"
                    type="button"
                    class="primary-btn payment-button"
                >
                    ارسال فیش و ثبت درخواست
                </button>


                <p
                    id="paymentMsg"
                    class="form-message"
                ></p>


                <div
                    id="paymentStatusBox"
                    class="payment-status-box hidden"
                >

                    <span>
                        🕐
                    </span>

                    <div>

                        <strong>
                            درخواست در حال بررسی است
                        </strong>

                        <p id="paymentStatusText">
                            در انتظار بررسی فیش
                            • حداکثر تا ۲۴ ساعت
                        </p>

                        <small>
                            شناسه:
                            <b id="paymentRequestId"></b>
                        </small>

                    </div>

                </div>


                <div class="payment-note">

                    پس از ارسال فیش، درخواست و تصویر فیش
                    برای مدیر QuizDuo ارسال می‌شود.
                    مدیر پرداخت را
                    <b>به‌صورت دستی</b>
                    بررسی می‌کند و پس از تأیید،
                    <b>همان اشتراک انتخاب‌شده</b>
                    برای حساب شما فعال می‌شود.
                    حداکثر زمان فعال‌سازی ۲۴ ساعت است.

                </div>


                <div class="test-gateway-box">

                    <div class="gateway-logo">
                        Q
                    </div>

                    <div>

                        <strong>
                            حالت آزمایشی
                        </strong>

                        <p>
                            برای تست بدون پرداخت واقعی،
                            پلن ماهانه را انتخاب کن و کد
                            <b>TEST100K</b>
                            را وارد کن.
                            این کد فقط برای نسخه آزمایشی است.
                        </p>

                    </div>

                </div>

            </div>

        </div>

    </section>


    <!-- LEADERBOARD -->

    <section
        id="leaderboard"
        class="page"
    >

        <div class="section-heading">

            <span>🏆</span>

            <div>

                <h2>
                    لیدربورد
                </h2>

                <p>
                    رتبه‌بندی بازیکنان ثبت‌نام‌شده روی این نسخه.
                </p>

            </div>

        </div>

        <div class="panel table-panel">

            <table>

                <thead>

                    <tr>
                        <th>رتبه</th>
                        <th>بازیکن</th>
                        <th>XP</th>
                        <th>سطح</th>
                        <th>مرحله</th>
                    </tr>

                </thead>

                <tbody id="leaderboardBody"></tbody>

            </table>

        </div>

        <p class="muted">
            در این نسخه استاتیک، لیدربورد فقط بین حساب‌هایی
            که روی همین مرورگر ساخته شده‌اند مشترک است.
        </p>

    </section>


    <!-- PROFILE -->

    <section
        id="profile"
        class="page"
    >

        <div class="section-heading">

            <span>👤</span>

            <div>

                <h2>
                    پروفایل
                </h2>

                <p>
                    آمار پیشرفتت رو اینجا ببین.
                </p>

            </div>

        </div>

        <div class="profile-grid">

            <div class="profile-card panel">

                <div
                    class="avatar"
                    id="profileAvatar"
                >
                    م
                </div>

                <h2 id="profileName">
                    بازیکن مهمان
                </h2>

                <p>
                    سطح
                    <b id="profileLevel">
                        1
                    </b>
                </p>

                <span
                    id="premiumBadge"
                    class="premium-badge hidden"
                >
                    👑 Premium
                </span>

            </div>


            <div class="stats-card panel">

                <div>
                    <span>XP</span>
                    <b id="profileXP">0</b>
                </div>

                <div>
                    <span>Streak</span>
                    <b id="profileStreak">0</b>
                </div>

                <div>
                    <span>❤️ قلب</span>
                    <b id="profileHearts">5</b>
                </div>

                <div>
                    <span>عمومی</span>
                    <b id="profileGeneral">0</b>
                </div>

                <div>
                    <span>تفریحی</span>
                    <b id="profileFun">0</b>
                </div>

            </div>

        </div>

    </section>


    <!-- CHAT -->

    <section
        id="chat"
        class="page"
    >

        <div class="section-heading">

            <span>💬</span>

            <div>

                <h2>
                    گفت‌وگو
                </h2>

                <p>
                    فعلاً پیام‌ها فقط روی همین مرورگر ذخیره می‌شوند.
                </p>

            </div>

        </div>

        <div class="panel chat-panel">

            <div
                id="messages"
                class="messages"
            ></div>

            <div class="chat-input">

                <input
                    id="chatInput"
                    placeholder="پیامت رو بنویس..."
                >

                <button
                    id="sendChat"
                    class="primary-btn"
                >
                    ارسال
                </button>

            </div>

        </div>

    </section>


    <!-- SUPPORT -->

    <section
        id="support"
        class="page"
    >

        <div class="panel auth-panel">

            <div class="section-heading">

                <span>🎫</span>

                <div>

                    <h2>
                        پشتیبانی
                    </h2>

                    <p>
                        پیامت را ثبت کن.
                    </p>

                </div>

            </div>

            <input
                id="supportSubject"
                placeholder="موضوع"
            >

            <textarea
                id="supportText"
                placeholder="پیام"
            ></textarea>

            <button
                id="supportSend"
                class="primary-btn full-btn"
            >
                ارسال درخواست
            </button>

            <p
                id="supportMsg"
                class="form-message"
            ></p>

        </div>

    </section>

</main>

<footer>
    QuizDuo • نسخه آزمایشی
</footer>

<form
    id="paymentSubmitForm"
    class="hidden"
    aria-hidden="true"
></form>

<iframe
    id="paymentSubmitFrame"
    name="paymentSubmitFrame"
    class="hidden"
    title="payment-submit"
></iframe>

<script
    type="module"
    src="js/core/app.js"
></script>

</body>
</html>
