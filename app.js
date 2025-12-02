// ===============================
//  CONFIGURATION
// ===============================

// Google Sheets
const SHEET_ID = "1ZwR_Nt6t_ppZ2LeG-4GmettHI2c4Dkh7-o2ABm_Zg-I";
const API_KEY = "AIzaSyAyq3Sd8kDDSmwDY8Q5VWDTV-ay48FSrm0";
const RANGE = "Feuille1";

// Google Apps Script (écriture)
const WRITE_URL = "https://script.google.com/macros/s/AKfycbwoWJVxVZ0Ff2OfUJuu2eKLFJCLM_5WzaE9wqjNBD8sGWJnVuYwpHF3T9uhmIJ64Axr9A/exec";
const SECRET_TOKEN = "NjNAo5l_flPQfsl3";  // même token que dans ton Apps Script

// ===============================
//  LECTURE DES DONNÉES
// ===============================

async function loadData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?alt=json&key=${API_KEY}`;

    const res = await fetch(url);
    const json = await res.json();

    if (!json.values) return [];

    // Enlever la première ligne (en-têtes)
    const rows = json.values.slice(1).map(r => ({
        date: r[0] || "",
        montant: r[1] || "",
        qui: r[2] || "",
        lieu: r[3] || "",
        commentaire: r[4] || ""
    }));

    updateTable(rows);
    return rows;
}

// ===============================
//  AFFICHAGE DU TABLEAU
// ===============================

function updateTable(data) {
    const tbody = document.getElementById("table-body");
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
//  AJOUT D’UNE LIGNE (WRITE)
// ===============================

async function sendData(payload) {
    const res = await fetch(WRITE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    return res.json();
}

// ===============================
//  BOUTON VALIDER
// ===============================

document.getElementById("btn-valider").onclick = async () => {
    const montant = document.getElementById("montant").value;
    const qui = document.getElementById("qui").value;
    const lieu = document.getElementById("lieu").value;
    const commentaire = document.getElementById("commentaire").value;

    if (!montant || !qui || !lieu) {
        alert("Merci de remplir au minimum Montant + Qui + Lieu");
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

    if (result.success) {
        alert("Enregistré !");
        resetForm();
        loadData();
    } else {
        alert("Erreur lors de l’enregistrement !");
    }
};

// ===============================
//  RESET FORMULAIRE
// ===============================

function resetForm() {
    document.getElementById("montant").value = "";
    document.getElementById("qui").value = "";
    document.getElementById("lieu").value = "";
    document.getElementById("commentaire").value = "";
}

// ===============================
//  EXPORT CSV
// ===============================

document.getElementById("btn-export").onclick = async () => {
    const data = await loadData();

    let csv = `"Date";"Montant";"Qui";"Lieu";"Commentaire"\n`;

    data.forEach(row => {
        csv += `"${row.date}";"${row.montant}";"${row.qui}";"${row.lieu}";"${row.commentaire}"\n`;
    });

    const bom = "\uFEFF"; // UTF-8 BOM
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "export.csv";
    a.click();

    URL.revokeObjectURL(url);
};

// ===============================
//  AUTO-REFRESH (toutes 5s)
// ===============================

loadData();
setInterval(loadData, 5000);
