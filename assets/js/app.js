const TARGET_DANA = 30800000;

const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSTo4aYtAi1-rc_qgQP9ahWk7GTU_HSnspxXTx70fm8LH2BYPFe-s7mz5eda2saUbjb7lEQQ3X_hsfl/pub?output=csv";

// Data contoh
const dataContoh = [
    { nama: "Hamba Allah", tanggal: "29 Juni 2026", nominal: 100000 }
];

function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
}

function updateProgress(total) {
    const progressBar = document.getElementById("progressFill");
    const terkumpul = document.getElementById("terkumpul");
    const sisa = document.getElementById("sisa");
    
    if (!progressBar || !terkumpul || !sisa) {
        console.error("❌ Element tidak ditemukan!");
        return;
    }
    
    const persen = Math.min(
        (total / TARGET_DANA) * 100,
        100
    );

    terkumpul.innerHTML = formatRupiah(total);
    sisa.innerHTML = formatRupiah(TARGET_DANA - total);
    progressBar.style.width = persen + "%";
    progressBar.innerHTML = persen.toFixed(1) + "%";
    
    console.log("✅ Progress updated:", persen.toFixed(1) + "%");
}

function parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue;
        
        let cols = [];
        let current = "";
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
                cols.push(current.trim().replace(/"/g, ""));
                current = "";
            } else {
                current += char;
            }
        }
        cols.push(current.trim().replace(/"/g, ""));
        
        if (cols.length >= 3) {
            result.push({
                nama: cols[0],
                tanggal: cols[1],
                nominal: cols[2]
            });
        }
    }
    
    return result;
}

function displayDonatur(donaturList) {
    const donaturTable = document.getElementById("donaturTable");
    
    if (!donaturTable) {
        console.error("❌ Element #donaturTable tidak ditemukan!");
        return;
    }
    
    let html = "";
    let totalDonasi = 0;
    let jumlahDonatur = 0;

    donaturList.forEach(donatur => {
        const nominal = parseInt(donatur.nominal.toString().replace(/[^0-9]/g, "")) || 0;
        
        if (nominal > 0) {
            totalDonasi += nominal;
            jumlahDonatur++;

            html += `<tr>
                <td>${donatur.nama}</td>
                <td>${donatur.tanggal}</td>
                <td>${formatRupiah(nominal)}</td>
            </tr>`;
        }
    });

    if (html === "") {
        html = `<tr>
            <td colspan="3">Belum ada data donatur</td>
        </tr>`;
    }

    donaturTable.innerHTML = html;

    const jumlahElement = document.getElementById("jumlahDonatur");
    if (jumlahElement) {
        jumlahElement.innerHTML = jumlahDonatur;
    }

    updateProgress(totalDonasi);
    console.log("✅ Donatur berhasil ditampilkan:", jumlahDonatur, "donatur");
}

function loadDonaturData() {
    console.log("🔄 Loading data donatur...");
    
    fetch(csvUrl, { mode: 'no-cors' })
        .then(response => response.text())
        .then(data => {
            console.log("📥 Raw CSV Data received");
            
            const donaturList = parseCSV(data);
            console.log("📊 Parsed data:", donaturList);
            
            if (donaturList.length > 0) {
                displayDonatur(donaturList);
                console.log("✅ Data dari Google Sheets berhasil");
            } else {
                console.log("⚠️ Google Sheets kosong, gunakan data contoh");
                displayDonatur(dataContoh);
            }
        })
        .catch(error => {
            console.error("❌ Error:", error.message);
            console.log("📌 Menampilkan data contoh");
            displayDonatur(dataContoh);
        });
}

// Tunggu DOM fully loaded sebelum eksekusi
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDonaturData);
} else {
    loadDonaturData();
}
