let data = JSON.parse(localStorage.getItem("data") || "[]");

function saveData() {
    localStorage.setItem("data", JSON.stringify(data));
}

function addEntry() {
    const montantInput = document.getElementById("montant");
    const quiSelect = document.getElementById("qui");
    const lieuSelect = document.getElementById("lieu");
    const commentaireInput = document.getElementById("commentaire");

    const montant = montantInput.value;
    const qui = quiSelect.value;
    const lieu = lieuSelect.value;
    const commentaire = commentaireInput.value;

    if (!montant) {
        alert("Montant obligatoire !");
        return;
    }

    data.push({
        date: new Date().toLocaleString(),
        montant,
        qui,
        lieu,
        commentaire
    });

    // Sauvegarder dans localStorage
    localStorage.setItem("data", JSON.stringify(data));

    // Réinitialiser les champs
    montantInput.value = "";
    commentaireInput.value = "";
    quiSelect.selectedIndex = 0;    // remet le premier choix par défaut
    lieuSelect.selectedIndex = 0;   // remet le premier choix par défaut

    alert("Enregistré !");
}


document.getElementById("valider").onclick = addEntry;


// ----------- HISTORIQUE -----------------

document.getElementById("voir").onclick = () => {
    document.querySelector(".container").classList.add("hidden");
    document.getElementById("historique").classList.remove("hidden");

    const tbody = document.querySelector("#tableau tbody");
    tbody.innerHTML = "";

    data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.date}</td>
            <td>${row.montant}</td>
            <td>${row.qui}</td>
            <td>${row.lieu}</td>
            <td>${row.commentaire}</td>
        `;
        tbody.appendChild(tr);
    });
};

document.getElementById("back").onclick = () => {
    document.getElementById("historique").classList.add("hidden");
    document.querySelector(".container").classList.remove("hidden");
};


// -------- EXPORT EXCEL ---------

document.getElementById("export").onclick = () => {
    let csv = "Date;Montant;Qui;Lieu;Commentaire\n";

    data.forEach(r => {
        csv += `${r.date};${r.montant};${r.qui};${r.lieu};${r.commentaire}\n`;
    });

    const bom = "\uFEFF";
    let csv = `"Date";"Montant";"Qui";"Lieu";"Commentaire"\n`;
    data.forEach(r => {
        csv += `"${r.date}";"${r.montant}";"${r.qui}";"${r.lieu}";"${r.commentaire}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    a.click();

    URL.revokeObjectURL(url);
};
