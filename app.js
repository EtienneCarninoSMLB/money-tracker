// ===============================
//  CONFIGURATION
// ===============================
const WRITE_URL = "https://script.google.com/macros/s/AKfycbyqfvpvkbZC-xdAL5G1aHnfyh-Pm0qWF13uF4B4yUHrmrVf_sI2DSXpk0tGLhkJjCHLsg/exec";
const SECRET_TOKEN = "NjNAo5l_flPQfsl3";

// ===============================
//  AFFECTATION DES HANDLERS APRES DOM READY
// ===============================  
document.addEventListener("DOMContentLoaded", () => {
    const btnValider = document.getElementById("valider");
    const btnVoir = document.getElementById("voir");
    const btnExport = document.getElementById("export");
    const btnBack = document.getElementById("back");
    const container = document.querySelector(".container");
    const historique = document.getElementById("historique");
    const tbody = document.querySelector("#tableau tbody");

    // ===============================
    //  VALIDER
    // ===============================
    btnValider.addEventListener("click", async () => {
        const montant = document.getElementById("montant").value;
        const qui = document.getElementById("qui").value;
        const lieu = document.getElementById("lieu").value;
        const commentaire = document.getElementById("commentaire").value;

        if (!montant || !qui || !lieu) {
            alert("Merci de remplir Montant, Qui et Lieu");
            return;
        }

        const payload = {
            token: SECRET_TOKEN,
            date: new Date().toLocaleString("fr-FR"),
            montant,
            qui,
            lieu,
            commentaire
        };

        try {
            // Utilisation de 'no-cors' pour éviter le blocage
            await fetch(WRITE_URL + `?payload=${encodeURIComponent(JSON.stringify(payload))}`, {
                method: "GET",
                mode: "no-cors"
            });
            resetForm();
            alert("Enregistré !");
        } catch (e) {
            console.error("sendData error:", e);
            alert("Erreur lors de l'enregistrement.");
        }
    });

    // ===============================
    //  VOIR
    // ===============================
    btnVoir.addEventListener("click", () => {
        container.classList.add("hidden");
        historique.classList.remove("hidden");
        loadData();
    });

    // ===============================
    //  BACK
    // ===============================
    btnBack.addEventListener("click", () => {
        container.classList.remove("hidden");
        historique.classList.add("hidden");
    });

    // ===============================
    //  EXPORT CSV
    // ===============================
    btnExport.addEventListener("click", () => {
        const rows = Array.from(tbody.querySelectorAll("tr"));
        let csv = `"Date";"Montant";"Qui";"Lieu";"Commentaire"\n`;
        rows.forEach(tr => {
            const cells = Array.from(tr.children).map(td => `"${td.textContent.replace(/"/g,'""')}"`);
            csv += cells.join(";") + "\n";
        });
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "export.csv";
        a.click();
        URL.revokeObjectURL(url);
    });

    // ===============================
    //  CHARGEMENT DES DONNÉES
    // ===============================
    async function loadData() {
        try {
            const res = await fetch(WRITE_URL + "?action=get", { method: "GET", mode: "no-cors" });
            // Impossible de lire le JSON en 'no-cors', donc juste afficher ce qu'on a côté Apps Script
            // Pour voir les données réelles, on peut ouvrir la sheet directement
        } catch (e) {
            console.warn("Impossible de charger les données côté client en raison de CORS. Voir la Google Sheet directement.");
        }
    }

    // ===============================
    //  RESET FORMULAIRE
    // ===============================
    function resetForm() {
        document.getElementById("montant").value = "";
        document.getElementById("qui").value = "";
        document.getElementById("lieu").value = "";
        document.getElementById("commentaire").value = "";
    }
});
