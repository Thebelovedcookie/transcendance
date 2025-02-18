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

document.getElementById("languageSelector").addEventListener("change", (event) => {
    const selectedLang = event.target.value;
    localStorage.setItem("lang", selectedLang); 
    updateTexts(selectedLang);
});

// Chargement de la langue sauvegardée au chargement de la page
document.addEventListener("DOMContentLoaded", async () => {
    const savedLang = localStorage.getItem("selectedLang") || "en";
    document.getElementById("languageSelector").value = savedLang;
    await updateTexts(savedLang);
});



//derniere version
// document.addEventListener("DOMContentLoaded", () => {
//     const savedLang = localStorage.getItem("selectedLanguage") || "en"; // Défaut anglais
//     updateLanguageSelector(savedLang);
//     updateTexts(savedLang);
// });



//version garder anglais
// document.addEventListener("DOMContentLoaded", () => {
//     localStorage.setItem("lang", "en"); // Réinitialise la langue
//     document.getElementById("languageSelector").value = "en"; // Met le bouton en anglais
//     applyTranslations("en"); // Recharge en anglais
// });



// //garder la derniere langue
// // Chargement de la langue sauvegardée au chargement de la page
// document.addEventListener("DOMContentLoaded", async () => {
//     const savedLang = localStorage.getItem("selectedLang") || "en";
//     document.getElementById("languageSelector").value = savedLang;
//     await updateTexts(savedLang);
// });

// // // Sauvegarde la langue choisie
// document.getElementById("languageSelector").addEventListener("change", (event) => {
//     const selectedLang = event.target.value;
//     localStorage.setItem("lang", selectedLang); 
//     updateTexts(selectedLang);
// });