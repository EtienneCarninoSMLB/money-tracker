// ===============================
//  CONFIGURATION
// ===============================

// Google Sheets
const SHEET_ID = "1ZwR_Nt6t_ppZ2LeG-4GmettHI2c4Dkh7-o2ABm_Zg-I";
const API_KEY = "AIzaSyAyq3Sd8kDDSmwDY8Q5VWDTV-ay48FSrm0";
const RANGE = "Feuille1";

// Google Apps Script (écriture)
const WRITE_URL = "https://script.google.com/macros/s/AKfycbwoWJVxVZ0Ff2OfUJuu2eKLFJCLM_5WzaE9wqjNBD8sGWJnVuYwpHF3T9uhmIJ64Axr9A/exec";
const SECRET_TOKEN = "TERANGA_2025";

// ===============================
//  LECTURE DES DONNÉES
// ===============================
async function loadData() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?alt=json&key=${API_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        if (!json.values) return [];
        const rows = json.values.slice(1).map(r => ({
            date: r[0] || "",
            montant: r[1] || "",
            qui: r[2] || "",
            lieu: r[3] || "",
            commentaire: r[4] || ""
        }));
        updateTable(rows);
        return rows;
    } catch (e) {
        console.error("loadData error:", e);
        return [];
    }
}

// ===============================
//  AFFICHAGE TABLEAU
// ===============================
function updateTable(data) {
    const tbody = document.querySelector("#tableau tbody");
    if (!tbody) {
        console.warn("tbody #tableau tbody introuvable");
        return;
    }
    tbody.innerHTML = "";
    data.forEach(entry => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.montant}</td>
            <td>${entry.qui}</td>
            <td>${entry.lieu}</td>
            <td>${entry.commentaire}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ===============================
//  ENVOI D’UNE LIGNE
// ===============================
async function sendData(payload) {
    try {
        const res = await fetch(WRITE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        return await res.json();
    } catch (e) {
        console.error("sendData error:", e);
        return { success: false, error: e.message };
    }
}

// ===============================
//  AFFECTATION DES HANDLERS APRES DOM READY
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    // Références sûres aux éléments
    const btnValider = document.getElementById("valider");
    const btnVoir = document.getElementById("voir");
    const btnExport = document.getElementById("export");
    const btnBack = document.getElementById("back");

    // Vérifications utiles pour debug
    if (!btnValider) console.warn("Element #valider introuvable");
    if (!btnVoir) console.warn("Element #voir introuvable");
    if (!btnExport) console.warn("Element #export introuvable");
    if (!btnBack) console.warn("Element #back introuvable");
    if (!document.querySelector("#tableau tbody")) console.warn("Element #tableau tbody introuvable");

    // VALIDER
    if (btnValider) {
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

            const result = await sendData(payload);
            if (result && result.success) {
                resetForm();
                await loadData();
                alert("Enregistré !");
            } else {
                console.error("Write failed:", result);
                alert("Erreur lors de l'enregistrement.");
            }
        });
    }

    // VOIR
    if (btnVoir) {
        btnVoir.addEventListener("click", async () => {
            document.querySelector(".container").classList.add("hidden");
            document.getElementById("historique").classList.remove("hidden");
            await loadData();
        });
    }

    // BACK
    if (btnBack) {
        btnBack.addEventListener("click", () => {
            document.querySelector(".container").classList.remove("hidden");
            document.getElementById("historique").classList.add("hidden");
        });
    }

    // EXPORT
    if (btnExport) {
        btnExport.addEventListener("click", async () => {
            const data = await loadData();
            let csv = `"Date";"Montant";"Qui";"Lieu";"Commentaire"\n`;
            data.forEach(row => {
                // échapper les guillemets
                const safe = v => (v || "").toString().replace(/"/g, '""');
                csv += `"${safe(row.date)}";"${safe(row.montant)}";"${safe(row.qui)}";"${safe(row.lieu)}";"${safe(row.commentaire)}"\n`;
            });
            const bom = "\uFEFF";
            const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "export.csv";
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // Lancement initial
    loadData();
    // rafraîchissement périodique (optionnel)
    setInterval(loadData, 5000);
});
