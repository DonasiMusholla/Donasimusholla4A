const TARGET_DANA = 30800000;

const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSTo4aYtAi1-rc_qgQP9ahWk7GTU_HSnspxXTx70fm8LH2BYPFe-s7mz5eda2saUbjb7lEQQ3X_hsfl/pub?output=csv";

// Data contoh (bisa dihapus setelah Google Sheets bekerja)
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
    const persen = Math.min(
        (total / TARGET_DANA) * 100,
        100
    );

    document.getElementById("terkumpul").innerHTML = formatRupiah(total);
    document.getElementById("sisa").innerHTML = formatRupiah(TARGET_DANA - total);

    const progressBar = document.getElementById("progressFill");
    progressBar.style.width = persen + "%";
    progressBar.innerHTML = persen.toFixed(1) + "%";
}

function parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue;
        
        // Handle CSV dengan atau tanpa quotes
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
    let html = "";
    let totalDonasi = 0;
    let jumlahDonatur = 0;

    donaturList.forEach(donatur => {
        const nominal = parseInt(donatur.nominal.toString().replace(/[^0-9]/g, "")) || 0;
        
        if (nominal > 0) {
            totalDonasi += nominal;
            jumlahDonatur++;

            html += `
            <tr>
                <td>${donatur.nama}</td>
                <td>${donatur.tanggal}</td>
                <td>${formatRupiah(nominal)}</td>
            </tr>`;
        }
    });

    if (html === "") {
        html = `
        <tr>
            <td colspan="3">
                Belum ada data donatur
            </td>
        </tr>`;
    }

    document.getElementById("donaturTable").innerHTML = html;

    if (document.getElementById("jumlahDonatur")) {
        document.getElementById("jumlahDonatur").innerHTML = jumlahDonatur;
    }

    updateProgress(totalDonasi);
}

// Fetch dari Google Sheets
fetch(csvUrl)
    .then(response => response.text())
    .then(data => {
        console.log("Raw CSV Data:", data);
        
        const donaturList = parseCSV(data);
        console.log("Parsed Data dari Google Sheets:", donaturList);
        
        if (donaturList.length > 0) {
            displayDonatur(donaturList);
            console.log("✅ Data dari Google Sheets berhasil ditampilkan");
        } else {
            console.log("⚠️ Google Sheets kosong, menampilkan data contoh");
            displayDonatur(dataContoh);
        }
    })
    .catch(error => {
        console.error("❌ Error fetching Google Sheets:", error);
        console.log("📌 Menampilkan data contoh karena error");
        
        // Tampilkan data contoh jika Google Sheets gagal
        displayDonatur(dataContoh);
        
        document.getElementById("donaturTable").innerHTML += `
        <tr style="background: #fff3cd;">
            <td colspan="3" style="color: #856404;">
                💡 Catatan: Menampilkan data contoh. 
                Pastikan Google Sheets sudah dipublish dengan benar.
            </td>
        </tr>`;
    });
