async function loadTranslations(lang) {
    try {
        const response = await fetch(`/static/translations.json`);
        if (!response.ok) {
            throw new Error(`Erreur de chargement des traductions: ${response.statusText}`);
        }
        const translations = await response.json();
        return translations[lang] || {};
    } catch (error) {
        console.error("Erreur lors du chargement des traductions :", error);
        return {};
    }
}
//MAJ texte et selector
async function updateTexts(lang) {
    console.log("Mise à jour du texte en:", lang);
    const translations = await loadTranslations(lang);
    document.querySelectorAll("[data-translate]").forEach(el => {
        const key = el.getAttribute("data-translate");
        if (translations[key]) {
            el.textContent = translations[key];
        }
    });

    // Met à jour le sélecteur 
    const languageSelector = document.getElementById("languageSelector");
    if (languageSelector) {
        languageSelector.value = lang;
    }
}

//Appliquer la langue sauvegardée au chargement de la page
document.addEventListener("DOMContentLoaded", async () => {
    const savedLang = localStorage.getItem("selectedLang") || "en";
    await updateTexts(savedLang);
});
