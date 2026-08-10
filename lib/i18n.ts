"use client";

export type Language = "RO" | "RU";

export const translations = {
    RO: {
        // Coș / Cart
        cartTitle: "Panou Comenzi",
        myCart: "Coșul Meu",
        orderHistory: "Istoric Comenzi",
        emptyCart: "Coșul tău este momentan gol.",
        configurePlisse: "Configurează un Plisse",
        dimensions: "Dimensiuni",
        finish: "Finisaj",
        delete: "Șterge",
        orderSummary: "Sumar Comandă",
        totalPaid: "Total Platit",
        paySecured: "Plătește Securizat",
        waitingBank: "Așteptăm confirmarea băncii...",
        partnerProcessors: "Procesatori parteneri",
        emptyHistory: "Nu ai nicio comandă în istoric încă.",
        addedOn: "Adăugat pe",
        inProcessing: "În Procesare",
        choosePayment: "Alege metoda de plată",
        totalToPay: "Total de achitat",
        or: "sau",
        securedTransaction: "Tranzacție Securizată 256-bit",

        // Auth
        login: "Autentificare",
        welcomeBack: "Bine ai revenit pe",
        email: "Email",
        password: "Parolă",
        enterAccount: "Intră în cont",
        noAccount: "Nu ai cont?",
        registerHere: "Înregistrează-te aici",
        createAccount: "Creează cont",
        joinEcosystem: "Alătură-te ecosistemului",
        register: "Înregistrare",
        alreadyHaveAccount: "Ai deja cont?",
        loginHere: "Autentifică-te aici",

        // Home Page
        heroTitle: "Plase iPlisse",
        heroSubtitlePrefix: "Direct la tine acasă:",
        heroSubtitleMeas: "Măsori singur, instalezi în",
        heroSubtitleTime: "5 minute",
        heroSubtitleAnd: "și economisești",
        heroSubtitleSave: "inteligent",
        videoMeasureBtn: "Ghid video măsurare",
        videoInstallBtn: "Ghid video instalare",
        typeHorizontal: "Orizontal",
        descHorizontal: "Uși de balcon & terase",
        typeVertical: "Vertical",
        descVertical: "Ferestre standard",
        typeXL: "XL Dublu",
        descXL: "Deschideri mari (3m+)",
        proEasy: "Operare facilă",
        conThreshold: "Prag necesar",
        proDiscretion: "Discreție maximă",
        conHeightLimit: "Limită înălțime",
        proHugeCoverage: "Acoperire uriașă",
        conPremiumPrice: "Preț Premium",

        // Modale Video
        measureGuideTitle: "Ghid de măsurare",
        measureGuideDesc: "Video instructiv pentru măsurători precise",
        measureGuideFooter: "📏 Măsoară corect pentru o plasă perfectă",
        installGuideTitle: "Ghid de instalare",
        installGuideDesc: "Instalează în doar 5 minute",
        installGuideFooter: "🔧 Instalare rapidă și simplă — fără meșteri",

        // Secțiunea De ce să alegi
        whyChooseBadge: "✨ De ce să alegi plasele Plisse?",
        qualityTitle: "Calitate Premium",
        qualitySubtitle: "în 3 Pași Simpli",
        qualityDesc: "Calitate superioară de aluminiu premium, plasă de fibră și sistem de fibră de nylon. Plasele Plisse sunt moderne, elegante, ocupă spațiu minim și sunt extrem de fiabile.",

        step1Title: "Fără Meșteri",
        step1Desc: "Instalezi singur în 5 minute. Economisești costurile de montaj.",
        step1Tag: "Instalare rapidă",

        step2Title: "Fără Costuri Ascunse",
        step2Desc: "Plătești exact ce vezi în calculator. Preț transparent, fără surprize.",
        step2Tag: "Preț transparent",

        step3Title: "Livrare în maxim 5 zile",
        step3Desc: "Comanzi online, livrăm la ușă în maximum 5 zile lucrătoare.",
        step3Tag: "Livrare rapidă",

        // Beneficii & Specificații
        featHeader: "Caracteristici Premium",
        feat1: "Profil aluminiu premium",
        feat2: "Plasă din fibră de sticlă",
        feat3: "Sistem pe fire de nylon",

        benHeader: "Beneficii",
        ben1: "Fără meșteri necesari",
        ben2: "Fără costuri ascunse",
        ben3: "Livrare în 3 zile",

        warranty: "Garanție",
        warrantyTime: "1 an",
        orderNow: "Comandă Acum",
        freeKit: "Kit instalare gratuit inclus",
        smartOrderSystem: "Sistem inteligent de comandă",
        recordTime: "timp record",
        guaranteedQuality: "Calitate superioară garantată",

        // Section Configurator
        configuratorTitle: "Configurator Inteligent",
        configuratorDesc: "Alege dimensiunile și finisajele pentru a vedea prețul instant.",
        // Configurator
        sim3d: "Simulare 3D",
        dragToRotate: "Trage pentru rotire",
        tapAndDrag: "Atinge și trage",

        // Deschidere
        vertOpenLevel: "Nivel deschidere verticală",
        horizOpenLevel: "Nivel deschidere orizontală",
        doubleOpenLevel: "Nivel deschidere (2 canate)",

        // Pasul 1: Tip Plasă
        step1Mesh: "1. Selectează Tipul de Plasă",
        type1Label: "Tip 1",
        type1Desc: "1 canat - Vertical",
        type2Label: "Tip 2",
        type2Desc: "1 canat - Orizontal",
        type3Label: "Tip 3",
        type3Desc: "2 canate",

        // Pasul 2: Cote
        step2Dimensions: "2. Configurare Cote",
        widthLabel: "Lățime Gol",
        heightLabel: "Înălțime Gol",

        // Pasul 3: Finisaj
        step3Finish: "3. Selecție Finisaj",
        customColorTitle: "Culoare Custom / Atipic?",
        customColorSubtitle: "Apasă pt. ofertă personalizată.",
        customModalTitle: "Culoare Custom / Atipic?",
        customModalDesc: "Dorești o nuanță specială RAL sau imitație lemn? Contactează-ne direct.",
        discussWhatsapp: "Discută pe WhatsApp",
        sendEmail: "Trimite un Email",

        // Erori și Toaste
        widthError: "Lățimea trebuie să fie între 300 și 3000 mm.",
        heightError: "Înălțimea trebuie să fie între 500 și 3000 mm.",
        enterDimensionsError: "Introduceți dimensiunile plasei.",
        cartAddSuccess: "Produsul a fost adăugat cu succes în coș!",
        connectionError: "Eroare de conexiune la adăugarea în coș.",

        // Checkout Bar
        totalLabel: "Total:",
        finalPriceLabel: "Preț Final Calculat (TVA inclus)",
        adding: "Se adaugă...",
        processing: "Se procesează...",
        loginAndAdd: "Login & Adaugă",
        addToCart: "Adaugă în Coș",
        loginToAddToCart: "Autentificare pentru Coș",
        addProductToCart: "Adaugă produsul în Coș",
        curs: "Curs",
        // Footer & Profile
        allRightsReserved: "Toate drepturile rezervate.",
        viewProfile: "Vezi Profilul și Istoricul",
        // Profile
        profileLoading: "Se încarcă profilul tău...",
        greeting: "Salut",
        activeAccount: "Cont Activ",
        iPlisseClient: "Client iPlisse",
        aiInsightsTitle: "iPlisse AI Insights",
        aiInsightsTextPrefix: "Analizând istoricul tău, ai securizat un total de",
        aiInsightsTextMid: "de deschideri. Asta înseamnă că vei ține la distanță aproximativ",
        aiInsightsTextSuffix: "de insecte! Un mediu perfect curat pentru casa ta.",
        orderHistoryTitle: "Istoric Comenzi",
        noCompletedOrders: "Nicio comandă finalizată",
        noCompletedOrdersDesc: "Când vei finaliza o comandă din coș, aceasta va apărea aici.",
        goToCart: "Mergi la Coșul Meu",
        inWork: "În Lucru",
        totalPaidProfile: "Total Achitat",
        // Admin
        adminCheckingAccess: "Se verifică accesul...",
        adminPanelTitle: "Panou Control",
        backToSite: "Înapoi la Site",
        exchangeRateTitle: "Setare Curs Valutar",
        exchangeRateLabel: "1 EUR = ? RON",
        save: "Salvează",
        exchangeRateSuccess: "Curs valutar actualizat cu succes!",
        exchangeRateError: "Eroare la actualizarea cursului.",
        exchangeRateNote: "Acest curs va fi folosit instant pe site pentru calculul prețului plasei în coș.",
        reviewModerationTitle: "Aprobare Recenzii",
        reviewModerationNote: "Modulul de moderare recenzii va fi implementat aici.",
        ordersManagementTitle: "Management Comenzi Clients",
        noOrdersAdmin: "Nu există nicio comandă în baza de date.",
        customer: "Client",
        details: "Detalii",
        priceAndStatus: "Preț & Status",




    },
    RU: {
        // Coș / Cart
        cartTitle: "Панель заказов",
        myCart: "Моя корзина",
        orderHistory: "История заказов",
        emptyCart: "Ваша корзина пока пуста.",
        configurePlisse: "Конфигурировать Плиссе",
        dimensions: "Размеры",
        finish: "Отделка",
        delete: "Удалить",
        orderSummary: "Итог заказа",
        totalPaid: "Итого к оплате",
        paySecured: "Безопасная оплата",
        waitingBank: "Ожидаем подтверждения банка...",
        partnerProcessors: "Партнерские процессоры",
        emptyHistory: "У вас пока нет заказов в истории.",
        addedOn: "Добавлено",
        inProcessing: "В обработке",
        choosePayment: "Выберите способ оплаты",
        totalToPay: "Итого к оплате",
        or: "или",
        securedTransaction: "Защищенный 256-битный перевод",

        // Auth
        login: "Войти",
        welcomeBack: "С возвращением в",
        email: "Электронная почта",
        password: "Пароль",
        enterAccount: "Войти в аккаунт",
        noAccount: "Нет аккаунта?",
        registerHere: "Зарегистрируйтесь здесь",
        createAccount: "Создать аккаунт",
        joinEcosystem: "Присоединитесь к экосистеме",
        register: "Регистрация",
        alreadyHaveAccount: "Уже есть аккаунт?",
        loginHere: "Войдите здесь",

        // Home Page
        heroTitle: "Сетки iPlisse",
        heroSubtitlePrefix: "Прямо к вам домой:",
        heroSubtitleMeas: "Замеряете сами, установка за",
        heroSubtitleTime: "5 минут",
        heroSubtitleAnd: "и экономьте",
        heroSubtitleSave: "с умом",
        videoMeasureBtn: "Видео-инструкция по замеру",
        videoInstallBtn: "Видео-инструкция по монтажу",
        typeHorizontal: "Горизонтальная",
        descHorizontal: "Балконные двери и террасы",
        typeVertical: "Вертикальная",
        descVertical: "Стандартные окна",
        typeXL: "XL Двойная",
        descXL: "Большие проемы (3м+)",
        proEasy: "Легкое управление",
        conThreshold: "Нужен порог",
        proDiscretion: "Максимальная незаметность",
        conHeightLimit: "Ограничение по высоте",
        proHugeCoverage: "Огромное перекрытие",
        conPremiumPrice: "Премиум цена",

        // Modale Video
        measureGuideTitle: "Руководство по замеру",
        measureGuideDesc: "Инструкция для точного замера",
        measureGuideFooter: "📏 Замеряйте правильно для идеальной сетки",
        installGuideTitle: "Руководство по установке",
        installGuideDesc: "Установка всего за 5 минут",
        installGuideFooter: "🔧 Быстрый и простой монтаж — без мастеров",

        // Secțiunea De ce să alegi
        whyChooseBadge: "✨ Почему стоит выбрать сетки Plisse?",
        qualityTitle: "Премиум Качество",
        qualitySubtitle: "в 3 Простых Шага",
        qualityDesc: "Высокое качество премиального алюминия, стекловолоконная сетка и нейлоновая система. Сетки Плиссе современные, элегантные, занимают минимум места и надёжны.",

        step1Title: "Без Мастеров",
        step1Desc: "Устанавливаете сами за 5 минут. Экономите на монтаже.",
        step1Tag: "Быстрый монтаж",

        step2Title: "Без Скрытых Затрат",
        step2Desc: "Платите ровно столько, сколько видите в калькуляторе.",
        step2Tag: "Прозрачная цена",

        step3Title: "Доставка до 5 дней",
        step3Desc: "Заказываете онлайн, доставляем к двери за 5 рабочих дней.",
        step3Tag: "Быстрая доставка",

        // Beneficii & Specificații
        featHeader: "Премиум Характеристики",
        feat1: "Премиальный алюминиевый профиль",
        feat2: "Сетка из стекловолокна",
        feat3: "Система на нейлоновых нитях",

        benHeader: "Преимущества",
        ben1: "Мастера не требуются",
        ben2: "Без скрытых платежей",
        ben3: "Доставка за 3 дня",

        warranty: "Гарантия",
        warrantyTime: "1 год",
        orderNow: "Заказать Сейчас",
        freeKit: "Бесплатный монтажный комплект",
        smartOrderSystem: "Умная система заказа",
        recordTime: "рекордное время",
        guaranteedQuality: "Гарантированное высокое качество",

        // Section Configurator
        configuratorTitle: "Умный Конфигуратор",
        configuratorDesc: "Выберите размеры и отделку, чтобы мгновенно увидеть цену.",

        // Configurator
        sim3d: "3D Симуляция",
        dragToRotate: "Тяните для вращения",
        tapAndDrag: "Коснитесь и тяните",

        // Deschidere
        vertOpenLevel: "Уровень вертикального открытия",
        horizOpenLevel: "Уровень горизонтального открытия",
        doubleOpenLevel: "Уровень открытия (2 створки)",

        // Pasul 1: Tip Plasă
        step1Mesh: "1. Выберите Тип Сетки",
        type1Label: "Тип 1",
        type1Desc: "1 створка - Вертикальная",
        type2Label: "Тип 2",
        type2Desc: "1 створка - Горизонтальная",
        type3Label: "Tip 3",
        type3Desc: "2 створки",

        // Pasul 2: Cote
        step2Dimensions: "2. Настройка Размеров",
        widthLabel: "Ширина Проема",
        heightLabel: "Высота Проема",

        // Pasul 3: Finisaj
        step3Finish: "3. Выбор Отделки",
        customColorTitle: "Кастомный Цвет / Нестандарт?",
        customColorSubtitle: "Нажмите для персонального предложения.",
        customModalTitle: "Кастомный Цвет / Нестандарт?",
        customModalDesc: "Хотите особый оттенок RAL или имитацию дерева? Свяжитесь с нами напрямую.",
        discussWhatsapp: "Обсудить в WhatsApp",
        sendEmail: "Отправить Email",

        // Erori și Toaste
        widthError: "Ширина должна быть от 300 до 3000 мм.",
        heightError: "Высота должна быть от 500 до 3000 мм.",
        enterDimensionsError: "Введите размеры сетки.",
        cartAddSuccess: "Товар успешно добавлен в корзину!",
        connectionError: "Ошибка подключения при добавлении в корзину.",

        // Checkout Bar
        totalLabel: "Итого:",
        finalPriceLabel: "Итоговая Цена (с НДС)",
        adding: "Добавление...",
        processing: "Обработка...",
        loginAndAdd: "Войти и Добавить",
        addToCart: "Добавить в Корзину",
        loginToAddToCart: "Войти для Корзины",
        addProductToCart: "Добавить товар в Корзину",
        curs:"Курс",
        // Footer & Profile
        allRightsReserved: "Все права защищены.",
        viewProfile: "Профиль и история",
        // Profile
        profileLoading: "Загрузка вашего профиля...",
        greeting: "Привет",
        activeAccount: "Активный Аккаунт",
        iPlisseClient: "Клиент iPlisse",
        aiInsightsTitle: "iPlisse AI Insights",
        aiInsightsTextPrefix: "Анализируя вашу историю, вы защитили в общей сложности",
        aiInsightsTextMid: "проемов. Это значит, что вы защитите дом от примерно",
        aiInsightsTextSuffix: "насекомых! Идеально чистая среда для вашего дома.",
        orderHistoryTitle: "История Заказов",
        noCompletedOrders: "Нет завершенных заказов",
        noCompletedOrdersDesc: "Когда вы завершите заказ из корзины, он появится здесь.",
        goToCart: "Перейти в Мою Корзину",
        inWork: "В работе",
        totalPaidProfile: "Итого Оплачено",
        // Admin
        adminCheckingAccess: "Проверка доступа...",
        adminPanelTitle: "Панель Управления",
        backToSite: "Назад на Сайт",
        exchangeRateTitle: "Установка Курса Валют",
        exchangeRateLabel: "1 EUR = ? RON",
        save: "Сохранить",
        exchangeRateSuccess: "Курс валют успешно обновлен!",
        exchangeRateError: "Ошибка при обновлении курса.",
        exchangeRateNote: "Этот курс будет мгновенно использован на сайте для расчета цены в корзине.",
        reviewModerationTitle: "Модерация Отзывов",
        reviewModerationNote: "Модуль модерации отзывов будет реализован здесь.",
        ordersManagementTitle: "Управление Заказами Клиентов",
        noOrdersAdmin: "В базе данных нет заказов.",
        customer: "Клиент",
        details: "Детали",
        priceAndStatus: "Цена и Статус",

    }
};

import { useState, useEffect } from "react";

export function useLanguage() {
    const [lang, setLang] = useState<Language>("RO");

    useEffect(() => {
        // Citim limba din localStorage la încărcare
        const saved = localStorage.getItem("iplisse_lang") as Language;
        if (saved) setLang(saved);

        // Ascultăm evenimentul lansat de Navbar
        const handleLangChange = (e: Event) => {
            const newLang = (e as CustomEvent<{ lang: Language }>).detail.lang;
            setLang(newLang);
        };

        window.addEventListener("lang:changed", handleLangChange);
        return () => window.removeEventListener("lang:changed", handleLangChange);
    }, []);

    return { lang, t: translations[lang] };
}