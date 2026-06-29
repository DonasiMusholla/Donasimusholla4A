const TARGET_DANA = 30800000;

const dataContoh = [
    {nama: "Hamba Allah", tanggal: "29 Juni 2026", nominal: 100000}
];

function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR", maximumFractionDigits: 0}).format(angka);
}

function updateProgress(total) {
    var progressBar = document.getElementById("progressFill");
    var terkumpul = document.getElementById("terkumpul");
    var sisa = document.getElementById("sisa");
    
    if (!progressBar || !terkumpul || !sisa) return;
    
    var persen = Math.min((total / TARGET_DANA) * 100, 100);
    terkumpul.innerHTML = formatRupiah(total);
    sisa.innerHTML = formatRupiah(TARGET_DANA - total);
    progressBar.style.width = persen + "%";
    progressBar.innerHTML = persen.toFixed(1) + "%";
}

function displayDonatur(donaturList) {
    var donaturTable = document.getElementById("donaturTable");
    if (!donaturTable) return;
    
    var html = "";
    var totalDonasi = 0;
    var jumlahDonatur = 0;

    for (var i = 0; i < donaturList.length; i++) {
        var donatur = donaturList[i];
        var nominal = parseInt(String(donatur.nominal).replace(/[^0-9]/g, "")) || 0;
        
        if (nominal > 0) {
            totalDonasi += nominal;
            jumlahDonatur++;
            html += "<tr><td>" + donatur.nama + "</td><td>" + donatur.tanggal + "</td><td>" + formatRupiah(nominal) + "</td></tr>";
        }
    }

    if (html === "") {
        html = "<tr><td colspan='3'>Belum ada data donatur</td></tr>";
    }

    donaturTable.innerHTML = html;
    updateProgress(totalDonasi);
}

function initApp() {
    displayDonatur(dataContoh);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
