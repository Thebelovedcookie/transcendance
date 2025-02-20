function updateLanguageSelector(lang) {
    const languageSelector = document.getElementById("languageSelector");
    if (languageSelector) {
        languageSelector.textContent = lang.toUpperCase(); // Afficher "EN", "FR", etc.
    }
}

async function loadTranslations(lang) {
    const response = await fetch(`/static/translations.json`);
    const translations = await response.json();
    return translations[lang];
}

async function updateTexts(lang) {
    const translations = await loadTranslations(lang);
    document.querySelectorAll("[data-translate]").forEach(el => {
        const key = el.getAttribute("data-translate");
        el.textContent = translations[key] || key;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("selectedLanguage") || "en"; // Défaut anglais
    updateLanguageSelector(savedLang);
    updateTexts(savedLang);
});
