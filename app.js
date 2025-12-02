// ===============================
// CONFIGURATION
// ===============================
const SHEET_ID = "1ZwR_Nt6t_ppZ2LeG-4GmettHI2c4Dkh7-o2ABm_Zg-I";
const RANGE = "Feuille 1";
const WRITE_URL = "https://script.google.com/macros/s/AKfycbyqfvpvkbZC-xdAL5G1aHnfyh-Pm0qWF13uF4B4yUHrmrVf_sI2DSXpk0tGLhkJjCHLsg/exec";
const SECRET_TOKEN = "NjNAo5l_flPQfsl3";

// ===============================
// AFFICHAGE TABLEAU
// ===============================
function updateTable(data) {
    const tbody = document.querySelector("#tableau tbody");
    if (!tbody) return;
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
// LECTURE DES DONNÉES
// ===============================
async function loadData() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?alt=json&key=AIzaSyAyq3Sd8kDDSmwDY8Q5VWDTV-ay48FSrm0`;
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
// ENVOI D’UNE LIGNE (GET)
// ===============================
async function sendData(params) {
    const query = new URLSearchParams(params).toString();
    const url = `${WRITE_URL}?${query}`;

    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.error("sendData error:", e);
        return { success: false, error: e.message };
    }
}

// ===============================
// RESET FORMULAIRE
// ===============================
function resetForm() {
    document.getElementById("montant").value = "";
    document.getElementById("qui").value = "";
    document.getElementById("lieu").value = "";
    document.getElementById("commentaire").value = "";
}

// ===============================
// HANDLERS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const btnValider = document.getElementById("valider");
    const btnVoir = document.getElementById("voir");
    const btnExport = document.getElementById("export");
    const btnBack = document.getElementById("back");

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
            montant, qui, lieu, commentaire
        };

        const result = await sendData(payload);

        if (result.success) {
            resetForm();
            await loadData();
            alert("Enregistré !");
        } else {
            alert("Erreur lors de l'enregistrement");
        }
    });

    btnVoir.addEventListener("click", async () => {
        document.querySelector(".container").classList.add("hidden");
        document.getElementById("historique").classList.remove("hidden");
        await loadData();
    });

    btnBack.addEventListener("click", () => {
        document.querySelector(".container").classList.remove("hidden");
        document.getElementById("historique").classList.add("hidden");
    });

    btnExport.addEventListener("click", async () => {
        const data = await loadData();
        let csv = `"Date";"Montant";"Qui";"Lieu";"Commentaire"\n`;
        data.forEach(row => {
            const safe = v => (v || "").toString().replace(/"/g, '""');
            csv += `"${safe(row.date)}";"${safe(row.montant)}";"${safe(row.qui)}";"${safe(row.lieu)}";"${safe(row.commentaire)}"\n`;
        });
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "export.csv";
        a.click();
        URL.revokeObjectURL(a.href);
    });

    loadData();
    setInterval(loadData, 5000);
});
