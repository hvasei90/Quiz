import { DEFAULT_STATE, addXP, calculateLevel, getUnlockedStage, isStageCompleted } from './state.js';
import {
    loadState,
    saveState,
    getCurrentUser,
    setCurrentUser,
    logoutUser,
    getUsers,
    saveUsers,
    getLeaderboard,
    updateLeaderboard
} from './storage.js';
import { todayKey, updateStreak, escapeHTML } from './utils.js';
import { QuizEngine, QUIZ_CONFIG } from './quiz.js';

const DAILY_XP = 10;
const GUEST_LIMIT = 3;

// بعد از Deploy کردن backend/Code.gs در Google Apps Script، لینک /exec را اینجا قرار بده.
const PAYMENT_API_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
const PAYMENT_POLL_MS = 30000;
const MAX_RECEIPT_SIZE = 5 * 1024 * 1024;

const plans = {
    monthly: {
        name: 'ماهانه',
        months: 1,
        price: 100000,
        gift: 0
    },

    quarterly: {
        name: 'سه‌ماهه',
        months: 3,
        price: 270000,
        gift: 0
    },

    sixMonth: {
        name: 'شش‌ماهه',
        months: 6,
        price: 480000,
        gift: 1
    },

    nineMonth: {
        name: 'نه‌ماهه',
        months: 9,
        price: 660000,
        gift: 1
    }
};

const codes = {
    QUIZDUO10: {
        type: 'percent',
        value: 10
    },

    WELCOME15: {
        type: 'percent',
        value: 15
    },

    STUDENT10: {
        type: 'percent',
        value: 10
    },

    TEST100K: {
        type: 'fixed',
        value: 100000
    }
};

class App {

    constructor() {
        this.user = getCurrentUser();

        this.state = loadState(
            DEFAULT_STATE,
            this.user || 'guest'
        );

        this.state.username = this.user || 'بازیکن مهمان';

        this.category = 'general';

        this.quiz = new QuizEngine(
            this.state,
            () => this.save()
        );

        this.timer = null;
        this.paymentPollTimer = null;

        this.plan = 'monthly';
        this.discount = null;
        this.register = false;
    }

    init() {

        document.querySelectorAll('[data-page]').forEach(button => {
            button.onclick = () => this.go(button.dataset.page);
        });

        document.getElementById('authButton').onclick = () => {
            this.go('auth');
        };

        document.getElementById('logoutButton').onclick = () => {
            this.logout();
        };

        document.getElementById('themeToggle').onclick = () => {

            this.state.theme =
                this.state.theme === 'dark'
                    ? 'light'
                    : 'dark';

            this.theme();
            this.save(false);
        };

        this.auth();
        this.subscription();
        this.chat();
        this.support();

        document.querySelectorAll('[data-category-tab]').forEach(button => {

            button.onclick = async () => {

                document
                    .querySelectorAll('[data-category-tab]')
                    .forEach(x => x.classList.remove('active'));

                button.classList.add('active');

                this.category =
                    button.dataset.categoryTab;

                this.stages();
            };
        });

        this.theme();
        this.all();
        this.go('home');

        this.startPaymentPolling();
    }

    go(id) {

        document
            .querySelectorAll('.page')
            .forEach(page => page.classList.remove('active'));

        document
            .getElementById(id)
            ?.classList.add('active');

        if (id === 'quiz') {
            this.stages();
        }

        if (id === 'leaderboard') {
            this.leaderboard();
        }

        if (id === 'subscription') {
            this.paymentUI();
            this.checkPaymentStatus();
        }

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    save(board = true) {

        this.state.level =
            calculateLevel(this.state.xp);

        saveState(
            this.state,
            this.user || 'guest'
        );

        if (board && this.user) {
            updateLeaderboard(this.state);
        }

        this.stats();
        this.profile();
    }

    all() {

        this.stats();
        this.profile();
        this.authArea();
        this.daily();
        this.stages();
        this.leaderboard();
        this.renderChat();
        this.paymentUI();
        this.renderPaymentStatus();
    }

    stats() {

        const s = this.state;

        [
            ['homeXP', s.xp],
            ['homeLevel', s.level],
            ['homeStreak', s.streak],
            ['quizXP', s.xp],
            ['quizStreak', s.streak],
            ['heartValue', s.hearts],
            ['comboValue', this.quiz.combo || 0]
        ].forEach(([id, value]) => {

            const element =
                document.getElementById(id);

            if (element) {
                element.textContent = value;
            }
        });
    }

    daily() {

        const element =
            document.getElementById('dailyRewardCard');

        if (!element) return;

        const received =
            this.state.lastDailyXPDate === todayKey();

        element.innerHTML = received

            ? `
                <div>
                    <strong>🎁 XP روزانه دریافت شد!</strong>
                    <span>
                        امروز ${DAILY_XP} XP گرفتی؛
                        فردا دوباره برگرد.
                    </span>
                </div>
                <b>+${DAILY_XP} XP</b>
            `

            : `
                <div>
                    <strong>🎁 جایزه روزانه آماده است!</strong>
                    <span>
                        هر روز یک بار ${DAILY_XP}
                        XP رایگان بگیر.
                    </span>
                </div>

                <button
                    id="claimDailyXP"
                    class="primary-btn"
                >
                    دریافت +${DAILY_XP} XP
                </button>
            `;

        document
            .getElementById('claimDailyXP')
            ?.addEventListener('click', () => {

                if (
                    this.state.lastDailyXPDate ===
                    todayKey()
                ) {
                    return;
                }

                addXP(
                    this.state,
                    DAILY_XP
                );

                this.state.lastDailyXPDate =
                    todayKey();

                updateStreak(this.state);

                this.save();

                this.daily();
            });
    }

    theme() {

        document.body.classList.toggle(
            'dark',
            this.state.theme === 'dark'
        );

        const button =
            document.getElementById('themeToggle');

        if (button) {
            button.textContent =
                this.state.theme === 'dark'
                    ? '☀️'
                    : '🌙';
        }
    }

    auth() {

        document.getElementById('toggleAuth').onclick = () => {

            this.register = !this.register;

            document.getElementById('authTitle').textContent =
                this.register
                    ? 'ثبت‌نام'
                    : 'ورود';

            document.getElementById('authSubmit').textContent =
                this.register
                    ? 'ثبت‌نام'
                    : 'ورود';

            document.getElementById('toggleAuth').textContent =
                this.register
                    ? 'ورود به حساب'
                    : 'ساخت حساب جدید';

            document
                .getElementById('confirmPasswordWrap')
                .classList
                .toggle(
                    'hidden',
                    !this.register
                );
        };

        document.getElementById('authSubmit').onclick =
            () => this.submitAuth();
    }

    submitAuth() {

        const username =
            document.getElementById('authName')
                .value
                .trim();

        const password =
            document.getElementById('authPassword')
                .value;

        const confirmPassword =
            document.getElementById('authConfirmPassword')
                .value;

        const message =
            document.getElementById('authMsg');

        if (
            username.length < 2 ||
            password.length < 6
        ) {
            message.textContent =
                'نام کاربری و رمز معتبر وارد کنید.';

            return;
        }

        const users = getUsers();

        const old =
            users.find(
                user =>
                    user.username.toLowerCase() ===
                    username.toLowerCase()
            );

        if (this.register) {

            if (old) {

                message.textContent =
                    'این نام کاربری قبلاً ثبت شده است.';

                return;
            }

            if (password !== confirmPassword) {

                message.textContent =
                    'تکرار رمز عبور درست نیست.';

                return;
            }

            users.push({
                username,
                password
            });

            saveUsers(users);

        } else if (
            !old ||
            old.password !== password
        ) {

            message.textContent =
                'نام کاربری یا رمز عبور اشتباه است.';

            return;
        }

        setCurrentUser(username);

        this.user = username;

        this.state =
            loadState(
                DEFAULT_STATE,
                username
            );

        this.state.username = username;

        this.quiz.state = this.state;

        this.save();

        message.textContent =
            'با موفقیت انجام شد.';

        this.authArea();

        this.checkPaymentStatus();

        setTimeout(
            () => this.go('home'),
            300
        );
    }

    authArea() {

        document
            .getElementById('authButton')
            .classList
            .toggle(
                'hidden',
                !!this.user
            );

        document
            .getElementById('logoutButton')
            .classList
            .toggle(
                'hidden',
                !this.user
            );
    }

    logout() {

        logoutUser();

        this.user = null;

        this.state =
            loadState(
                DEFAULT_STATE,
                'guest'
            );

        this.state.username =
            'بازیکن مهمان';

        this.quiz.state =
            this.state;

        this.all();

        this.go('home');
    }

    async stages() {

        const box =
            document.getElementById('stageList');

        if (!box) return;

        try {

            await this.quiz.loadCategory(
                this.category
            );

            const max =
                Math.max(
                    6,
                    ...this.quiz.questions.map(
                        question => +question.stage || 1
                    )
                );

            const unlocked =
                getUnlockedStage(
                    this.state,
                    this.category
                );

            box.innerHTML = '';

            for (
                let number = 1;
                number <= max;
                number++
            ) {

                const done =
                    isStageCompleted(
                        this.state,
                        this.category,
                        number
                    );

                const locked =
                    number > unlocked;

                const guest =
                    !this.user &&
                    number > GUEST_LIMIT;

                const card =
                    document.createElement('article');

                card.className =
                    `stage-card
                    ${done ? 'completed' : ''}
                    ${locked || guest ? 'locked' : ''}`;

                card.innerHTML = `
                    <div class="stage-number">
                        ${number}
                    </div>

                    <h3>
                        مرحله ${number}
                    </h3>

                    <small>
                        ${
                            done
                                ? '✓ تکمیل‌شده'
                                : locked
                                    ? '🔒 قفل'
                                    : guest
                                        ? '👤 نیاز به حساب'
                                        : '▶ آماده بازی'
                        }
                        • ۱۰ XP
                    </small>

                    <button
                        class="primary-btn stage-action"
                        ${locked || guest ? 'disabled' : ''}
                    >
                        ${done ? 'بازی دوباره' : 'شروع مرحله'}
                    </button>
                `;

                const button =
                    card.querySelector('button');

                if (!locked && !guest) {

                    button.onclick =
                        () => this.start(
                            number,
                            done
                        );

                } else if (guest && !locked) {

                    button.disabled = false;

                    button.onclick =
                        () => this.go('auth');
                }

                box.appendChild(card);
            }

        } catch {

            box.innerHTML =
                '<div class="notice">فایل سؤال‌ها پیدا نشد.</div>';
        }
    }

    async start(number, replay) {

        if (
            replay &&
            !confirm(
                'شما قبلاً امتیاز این مرحله را کسب کرده‌اید. آیا مایلید دوباره این مرحله را بازی کنید؟\n\nبازی کردن در این مرحله نه از شما قلب کم می‌کند و نه XP اضافه می‌کند.'
            )
        ) {
            return;
        }

        if (
            number > GUEST_LIMIT &&
            !this.user
        ) {
            this.go('auth');
            return;
        }

        const questions =
            this.quiz.startStage(
                this.category,
                number,
                replay
            );

        if (!questions.length) {

            alert(
                'برای این مرحله هنوز سؤال ثبت نشده است.'
            );

            return;
        }

        this.question();

        document
            .getElementById('quizBox')
            .scrollIntoView({
                behavior: 'smooth'
            });
    }

    question() {

        clearInterval(this.timer);

        const question =
            this.quiz.getCurrentQuestion();

        const count =
            this.quiz.getQuestionCount();

        if (!question) return;

        document
            .getElementById('quizBox')
            .classList
            .remove('hidden');

        document.getElementById('quizCategory').textContent =
            this.category === 'general'
                ? '🧠 اطلاعات عمومی'
                : '🎮 تفریحی';

        document.getElementById('questionNumber').textContent =
            `سؤال ${this.quiz.currentQuestion + 1} از ${count}`;

        document.getElementById('quizProgress').style.width =
            `${this.quiz.currentQuestion / count * 100}%`;

        document.getElementById('questionText').textContent =
            question.q;

        document.getElementById('quizResult').textContent =
            '';

        const answers =
            document.getElementById('answers');

        answers.innerHTML = '';

        question.options.forEach(
            (text, index) => {

                const button =
                    document.createElement('button');

                button.className =
                    'answer-btn';

                button.textContent =
                    text;

                button.onclick =
                    () => this.answer(index);

                answers.appendChild(button);
            }
        );

        let left =
            QUIZ_CONFIG.questionTime;

        document.getElementById('questionTimer').textContent =
            `${left}s`;

        document.getElementById('timerProgress').style.width =
            '100%';

        this.timer =
            setInterval(() => {

                left--;

                document.getElementById('questionTimer').textContent =
                    `${Math.max(left, 0)}s`;

                document.getElementById('timerProgress').style.width =
                    `${Math.max(left, 0) / QUIZ_CONFIG.questionTime * 100}%`;

                if (left <= 0) {

                    clearInterval(this.timer);

                    this.answer(null);
                }

            }, 1000);
    }

    answer(index) {

        clearInterval(this.timer);

        document
            .querySelectorAll('.answer-btn')
            .forEach(
                button => button.disabled = true
            );

        const result =
            this.quiz.answer(index);

        this.stats();

        if (!result.finished) {

            document.getElementById('quizResult').innerHTML =
                result.correct
                    ? '<p>✅ درست بود!</p>'
                    : '<p>❌ پاسخ درست نبود!</p>';

            const button =
                document.getElementById(
                    'nextQuestionBtn'
                );

            button.classList.remove('hidden');

            button.textContent =
                'سؤال بعدی →';

            button.onclick =
                () => this.question();

            return;
        }

        let text =
            result.passed
                ? '🎉 مرحله را با موفقیت کامل کردی!'
                : '😕 مرحله را کامل نکردی.';

        if (result.earnedXP) {
            text += ` +${result.earnedXP} XP`;
        }

        if (result.heartLost) {
            text += ' • یک قلب کم شد.';
        }

        if (result.replay) {
            text +=
                ' • تکرار بدون تغییر XP و قلب.';
        }

        document.getElementById('quizResult').innerHTML =
            `
                <div class="notice">
                    <strong>${text}</strong>
                    <br>
                    امتیاز:
                    ${Math.round(result.percentage * 100)}٪
                </div>
            `;

        const button =
            document.getElementById(
                'nextQuestionBtn'
            );

        button.classList.remove('hidden');

        button.textContent =
            'بازگشت به مراحل';

        button.onclick = () => {

            document
                .getElementById('quizBox')
                .classList
                .add('hidden');

            this.stages();
        };

        this.save();
    }

    subscription() {

        document
            .querySelectorAll('.plan-select')
            .forEach(button => {

                button.onclick =
                    () => this.selectPlan(
                        button.dataset.plan
                    );
            });

        document.getElementById(
            'applyDiscount'
        ).onclick =
            () => this.applyDiscount();

        document.getElementById(
            'paymentButton'
        ).onclick =
            () => this.pay();
    }

    selectPlan(plan) {

        this.plan = plan;

        this.discount = null;

        document.getElementById(
            'discountCode'
        ).value = '';

        document.getElementById(
            'discountMsg'
        ).textContent = '';

        this.paymentUI();

        document
            .getElementById('paymentPanel')
            .scrollIntoView({
                behavior: 'smooth'
            });
    }

    applyDiscount() {

        const code =
            document
                .getElementById('discountCode')
                .value
                .trim()
                .toUpperCase();

        const message =
            document.getElementById(
                'discountMsg'
            );

        const item =
            codes[code];

        if (!item) {

            this.discount = null;

            message.textContent =
                'کد تخفیف معتبر نیست.';

            this.paymentUI();

            return;
        }

        this.discount = {
            code,
            ...item
        };

        message.textContent =
            `کد اعمال شد: ${this.money(
                this.discountValue()
            )} تومان تخفیف.`;

        this.paymentUI();
    }

    discountValue() {

        const base =
            plans[this.plan].price;

        return Math.min(
            base,
            this.discount?.type === 'fixed'
                ? this.discount.value
                : Math.round(
                    base *
                    (this.discount?.value || 0) /
                    100
                )
        );
    }

    final() {

        return (
            plans[this.plan].price -
            this.discountValue()
        );
    }

    paymentUI() {

        const plan =
            plans[this.plan];

        const finalPrice =
            this.final();

        const set =
            (id, value) => {

                const element =
                    document.getElementById(id);

                if (element) {
                    element.textContent = value;
                }
            };

        set(
            'selectedPlanName',
            plan.name
        );

        set(
            'selectedPlanAmount',
            this.money(plan.price) +
            ' تومان'
        );

        set(
            'basePrice',
            this.money(plan.price) +
            ' تومان'
        );

        set(
            'discountAmount',
            this.discountValue()
                ? `− ${this.money(
                    this.discountValue()
                )} تومان`
                : '۰ تومان'
        );

        set(
            'finalPrice',
            this.money(finalPrice) +
            ' تومان'
        );

        set(
            'bankAmount',
            this.money(finalPrice) +
            ' تومان'
        );

        document
            .querySelectorAll('[data-plan-card]')
            .forEach(card => {

                card.classList.toggle(
                    'selected',
                    card.dataset.planCard ===
                    this.plan
                );
            });

        const button =
            document.getElementById(
                'paymentButton'
            );

        if (button) {

            button.textContent =
                finalPrice === 0
                    ? 'ثبت درخواست آزمایشی'
                    : 'ارسال فیش و ثبت درخواست';
        }
    }

    async pay() {

        const message =
            document.getElementById(
                'paymentMsg'
            );

        const receiptMessage =
            document.getElementById(
                'receiptMsg'
            );

        const fileInput =
            document.getElementById(
                'receiptFile'
            );

        const finalPrice =
            this.final();

        const plan =
            plans[this.plan];

        if (!this.user) {

            message.textContent =
                'برای خرید اشتراک ابتدا وارد حساب شو.';

            this.go('auth');

            return;
        }

        // کد تست فقط برای نسخه آزمایشی است.
        if (
            finalPrice === 0 &&
            this.discount?.code === 'TEST100K'
        ) {

            this.activateSubscription(
                this.plan,
                'TEST-' + Date.now()
            );

            message.textContent =
                `🎉 اشتراک ${plan.name} در حالت آزمایشی فعال شد!`;

            return;
        }

        if (
            PAYMENT_API_URL.includes(
                'PASTE_YOUR_APPS_SCRIPT'
            )
        ) {

            message.textContent =
                'اتصال سیستم پرداخت هنوز تنظیم نشده است. لینک Web App مربوط به Google Apps Script را در app.js قرار بده.';

            return;
        }

        const file =
            fileInput.files?.[0];

        if (!file) {

            receiptMessage.textContent =
                'لطفاً تصویر فیش واریزی را انتخاب کن.';

            return;
        }

        if (!file.type.startsWith('image/')) {

            receiptMessage.textContent =
                'فقط فایل تصویری فیش قابل ارسال است.';

            return;
        }

        if (file.size > MAX_RECEIPT_SIZE) {

            receiptMessage.textContent =
                'حجم تصویر باید حداکثر ۵ مگابایت باشد.';

            return;
        }

        const requestId =
            'QD-' +
            crypto
                .randomUUID()
                .replace(/-/g, '')
                .slice(0, 10)
                .toUpperCase();

        const base64 =
            await this.fileToBase64(file);

        const payload = {

            action: 'create_request',

            requestId,

            username: this.user,

            plan: this.plan,

            planName: plan.name,

            amount: finalPrice,

            receiptName: file.name,

            receiptType: file.type,

            receiptBase64: base64
        };

        const button =
            document.getElementById(
                'paymentButton'
            );

        button.disabled = true;

        button.textContent =
            'در حال ارسال فیش...';

        message.textContent = '';

        try {

            // text/plain عمداً انتخاب شده تا
            // ارسال cross-origin به Web App ساده‌تر باشد.
            await fetch(
                PAYMENT_API_URL,
                {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type':
                            'text/plain;charset=utf-8'
                    },
                    body: JSON.stringify(payload)
                }
            );

            this.state.subscriptionStatus =
                'pending';

            this.state.pendingPaymentRequestId =
                requestId;

            this.state.pendingSubscriptionPlan =
                this.plan;

            this.state.pendingSubscriptionAmount =
                finalPrice;

            this.state.pendingPaymentCreatedAt =
                Date.now();

            this.save(false);

            this.renderPaymentStatus();

            message.textContent =
                '✅ فیش ارسال شد. پرداخت شما در انتظار بررسی مدیر است.';

            receiptMessage.textContent =
                'فیش با موفقیت برای بررسی ارسال شد.';

            fileInput.value = '';

            this.startPaymentPolling();

        } catch (error) {

            console.error(error);

            message.textContent =
                'ارسال فیش انجام نشد. اتصال اینترنت و تنظیمات Web App را بررسی کن.';
        }

        finally {

            button.disabled = false;

            this.paymentUI();
        }
    }

    fileToBase64(file) {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();

                reader.onload =
                    () => resolve(
                        String(reader.result)
                            .split(',')[1]
                    );

                reader.onerror =
                    reject;

                reader.readAsDataURL(file);
            }
        );
    }

    startPaymentPolling() {

        clearInterval(
            this.paymentPollTimer
        );

        if (
            !this.user ||
            !this.state.pendingPaymentRequestId
        ) {
            return;
        }

        this.checkPaymentStatus();

        this.paymentPollTimer =
            setInterval(
                () =>
                    this.checkPaymentStatus(),
                PAYMENT_POLL_MS
            );
    }

    checkPaymentStatus() {

        if (
            !this.user ||
            !this.state.pendingPaymentRequestId
        ) {

            this.renderPaymentStatus();

            return;
        }

        if (
            PAYMENT_API_URL.includes(
                'PASTE_YOUR_APPS_SCRIPT'
            )
        ) {
            return;
        }

        const callbackName =
            `quizDuoStatus_${Date.now()}_${Math.floor(
                Math.random() * 10000
            )}`;

        const script =
            document.createElement('script');

        const cleanup = () => {

            delete window[callbackName];

            script.remove();
        };

        window[callbackName] =
            result => {

                cleanup();

                if (!result?.ok) {
                    return;
                }

                if (
                    result.status ===
                    'approved'
                ) {

                    this.activateSubscription(
                        this.state.pendingSubscriptionPlan,
                        this.state.pendingPaymentRequestId
                    );

                    this.state.subscriptionStatus =
                        'approved';

                    this.save(false);

                    this.renderPaymentStatus();

                } else if (
                    result.status ===
                    'rejected'
                ) {

                    this.state.subscriptionStatus =
                        'rejected';

                    this.save(false);

                    this.renderPaymentStatus();

                    clearInterval(
                        this.paymentPollTimer
                    );
                }
            };

        script.onerror =
            cleanup;

        script.src =
            `${PAYMENT_API_URL}` +
            `?action=status` +
            `&requestId=${encodeURIComponent(
                this.state.pendingPaymentRequestId
            )}` +
            `&username=${encodeURIComponent(
                this.user
            )}` +
            `&callback=${callbackName}`;

        document.body.appendChild(script);
    }

    activateSubscription(
        planId,
        requestId
    ) {

        const plan =
            plans[planId];

        if (!plan) return;

        this.state.subscription =
            'premium';

        this.state.subscriptionPlan =
            planId;

        this.state.subscriptionMonths =
            plan.months +
            plan.gift;

        this.state.subscriptionActivatedAt =
            Date.now();

        this.state.subscriptionRequestId =
            requestId;

        this.state.subscriptionStatus =
            'approved';

        this.state.maxHearts = 8;
        this.state.hearts = 8;

        this.state.pendingPaymentRequestId =
            null;

        this.state.pendingSubscriptionPlan =
            null;

        this.state.pendingSubscriptionAmount =
            null;

        this.state.pendingPaymentCreatedAt =
            null;

        this.save(false);
    }

    renderPaymentStatus() {

        const box =
            document.getElementById(
                'paymentStatusBox'
            );

        const title =
            box?.querySelector('strong');

        const text =
            document.getElementById(
                'paymentStatusText'
            );

        const id =
            document.getElementById(
                'paymentRequestId'
            );

        if (
            !box ||
            !title ||
            !text ||
            !id
        ) {
            return;
        }

        const status =
            this.state.subscriptionStatus;

        const requestId =
            this.state.pendingPaymentRequestId ||
            this.state.subscriptionRequestId;

        if (!requestId || !status) {

            box.classList.add('hidden');

            return;
        }

        box.classList.remove('hidden');

        box.classList.remove(
            'status-pending',
            'status-approved',
            'status-rejected'
        );

        id.textContent =
            requestId;

        if (status === 'pending') {

            box.classList.add(
                'status-pending'
            );

            title.textContent =
                'درخواست در حال بررسی است';

            text.textContent =
                'فیش شما ثبت شده و پرداخت توسط مدیر به‌صورت دستی بررسی می‌شود. حداکثر تا ۲۴ ساعت.';

        } else if (
            status === 'approved'
        ) {

            box.classList.add(
                'status-approved'
            );

            title.textContent =
                'اشتراک شما فعال شد 🎉';

            text.textContent =
                'پرداخت تأیید شد و اشتراک انتخاب‌شده برای حساب شما فعال است.';

        } else if (
            status === 'rejected'
        ) {

            box.classList.add(
                'status-rejected'
            );

            title.textContent =
                'پرداخت تأیید نشد';

            text.textContent =
                'فیش ارسالی تأیید نشده است. در صورت نیاز می‌توانی فیش جدیدی ارسال کنی.';
        }
    }

    money(number) {

        return Number(number)
            .toLocaleString('fa-IR');
    }

    profile() {

        const s = this.state;

        const set =
            (id, value) => {

                const element =
                    document.getElementById(id);

                if (element) {
                    element.textContent =
                        value;
                }
            };

        set(
            'profileName',
            s.username
        );

        set(
            'profileLevel',
            s.level
        );

        set(
            'profileXP',
            s.xp
        );

        set(
            'profileStreak',
            s.streak
        );

        set(
            'profileHearts',
            s.hearts
        );

        set(
            'profileGeneral',
            Math.max(
                0,
                s.generalStage - 1
            )
        );

        set(
            'profileFun',
            Math.max(
                0,
                s.funStage - 1
            )
        );

        document
            .getElementById('profileAvatar')
            .textContent =
            (s.username || 'م')[0];

        document
            .getElementById('premiumBadge')
            .classList
            .toggle(
                'hidden',
                s.subscription !== 'premium'
            );
    }

    leaderboard() {

        const body =
            document.getElementById(
                'leaderboardBody'
            );

        if (!body) return;

        const board =
            getLeaderboard();

        body.innerHTML =
            board.length

                ? board.map(
                    (item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>
                                ${escapeHTML(
                                    item.username
                                )}
                            </td>
                            <td>${item.xp}</td>
                            <td>${item.level}</td>
                            <td>
                                ${
                                    Math.max(
                                        item.generalStage,
                                        item.funStage
                                    ) - 1
                                }
                            </td>
                        </tr>
                    `
                ).join('')

                : `
                    <tr>
                        <td colspan="5">
                            هنوز داده‌ای وجود ندارد.
                        </td>
                    </tr>
                `;
    }

    chat() {

        document.getElementById(
            'sendChat'
        ).onclick = () => {

            const input =
                document.getElementById(
                    'chatInput'
                );

            const text =
                input.value.trim();

            if (!text) return;

            const messages =
                JSON.parse(
                    localStorage.getItem(
                        'quizduo_chat'
                    ) || '[]'
                );

            messages.push({
                u: this.state.username,
                t: text
            });

            localStorage.setItem(
                'quizduo_chat',
                JSON.stringify(
                    messages.slice(-100)
                )
            );

            input.value = '';

            this.renderChat();
        };
    }

    renderChat() {

        const box =
            document.getElementById(
                'messages'
            );

        if (!box) return;

        const messages =
            JSON.parse(
                localStorage.getItem(
                    'quizduo_chat'
                ) || '[]'
            );

        box.innerHTML =
            messages.map(
                item => `
                    <div class="message">
                        <b>
                            ${escapeHTML(item.u)}
                        </b>
                        <br>
                        ${escapeHTML(item.t)}
                    </div>
                `
            ).join('');
    }

    support() {

        document.getElementById(
            'supportSend'
        ).onclick = () => {

            const subject =
                document
                    .getElementById(
                        'supportSubject'
                    )
                    .value
                    .trim();

            const text =
                document
                    .getElementById(
                        'supportText'
                    )
                    .value
                    .trim();

            const message =
                document.getElementById(
                    'supportMsg'
                );

            if (!subject || !text) {

                message.textContent =
                    'موضوع و پیام را وارد کنید.';

                return;
            }

            const requests =
                JSON.parse(
                    localStorage.getItem(
                        'quizduo_support'
                    ) || '[]'
                );

            requests.push({
                u: this.state.username,
                s: subject,
                t: text,
                date: Date.now()
            });

            localStorage.setItem(
                'quizduo_support',
                JSON.stringify(requests)
            );

            message.textContent =
                'درخواست در این نسخه روی دستگاه ذخیره شد.';
        };
    }
}

new App().init();
