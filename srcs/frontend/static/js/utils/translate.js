let translationsData = {};


async function loadTranslations(lang) {
    try {
        const response = await fetch(`/static/translations.json`);
        if (!response.ok) {
            throw new Error(`Erreur de chargement des traductions: ${response.statusText}`);
        }
        const translations = await response.json();
        console.log("Données chargées depuis JSON :", translations);
        return translations[lang] || {};
    } catch (error) {
        console.error("Erreur lors du chargement des traductions :", error);
        return {};
    }
}
//gerer les variables 
async function fetchUserData() {
    try {
        const response = await fetch("/api/user"); 
        if (!response.ok) throw new Error("Erreur lors de la récupération des données utilisateur");
        
        const data = await response.json();
        
        // Met à jour les attributs dynamiques avant de traduire
        document.querySelectorAll("[data-username]").forEach(el => el.setAttribute("data-username", data.username));

        updateTexts(currentLang); 
    } catch (error) {
        console.error("Échec de la récupération des données utilisateur :", error);
    }
}





//MAJ texte et selector
async function updateTexts(lang) {
    console.log("Mise à jour du texte en:", lang);
    const translations = await loadTranslations(lang);
    console.log("Traductions chargées :", translations);

	// Sauvegarde les traductions pour les erreurs
	translationsData = translations; 

    document.querySelectorAll("[data-translate]").forEach(el => {
		const key = el.getAttribute("data-translate");
		console.log(`Élément détecté:`, el, `Clé:`, key);
	
		if (!translations[key]) {
			console.error(`La clé "${key}" n'a pas de traduction disponible !`);
			return;
		}
	
		let translatedText = translations[key];
	
		// Remplacement des variables dynamiques {username}, {date}, etc.
		[...el.attributes].forEach(attr => {
			if (attr.name.startsWith("data-") && attr.name !== "data-translate") {
				const placeholder = attr.name.replace("data-", ""); // Ex: "username"
				translatedText = translatedText.replace(`{${placeholder}}`, attr.value);
			}
		});
	
		if (el.placeholder !== undefined) {
			el.placeholder = translatedText;
		} else {
			const link = el.querySelector("a[data-translate]");
			if (link) {
				const linkKey = link.getAttribute("data-translate");
				link.textContent = translations[linkKey] || linkKey;
				el.innerHTML = translatedText.replace("{link}", link.outerHTML);
			} else {
				const existingIcon = el.querySelector("i");
				if (existingIcon) {
					// Trouver le premier nœud texte APRÈS l'icône
					let textNode = null;
					for (let node of el.childNodes) {
						if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
							textNode = node;
						}
					}
	
					if (textNode) {
						console.log(`Ancien texte: "${textNode.textContent.trim()}" -> Nouveau texte: "${translatedText}"`);
						textNode.textContent = " " + translatedText;
					} else {
						el.appendChild(document.createTextNode(" " + translatedText));
					}
				} else {
					console.log(`Ancien texte: "${el.textContent}" -> Nouveau texte: "${translatedText}"`);
					el.textContent = translatedText;
				}
			}
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
	await fetchUserData();
    await updateTexts(savedLang);
});
