/* Donatur client-side (localStorage)
   - Menyimpan daftar donatur di localStorage
   - Menampilkan di tabel, update progress bar dan ringkasan
   - Export CSV dan clear data
*/
(function () {
    const STORAGE_KEY = 'donaturList_v1';

    // helper: format angka ke Rupiah
    function formatRupiah(number) {
        const n = Number(number) || 0;
        return 'Rp ' + n.toLocaleString('id-ID');
    }

    // helper: escape HTML
    function escapeHtml(s) {
        if (!s && s !== 0) return '';
        return String(s).replace(/[&<>"]+/g, function (m) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m] || m;
        });
    }

    // baca target dari elemen #targetDonasi jika ada, atau gunakan default
    function readTarget() {
        const el = document.getElementById('targetDonasi');
        if (!el) return 30800000; // default
        const txt = el.innerText || el.textContent || '';
        // ambil angka dari teks, mis: "Rp 30.800.000"
        const digits = txt.replace(/[^0-9]/g, '');
        return digits ? Number(digits) : 30800000;
    }

    const TARGET = readTarget();

    // elemen (bisa ada beberapa varian pada halaman)
    const form = document.getElementById('donasiForm');
    const namaInput = document.getElementById('namaDonatur');
    const nominalInput = document.getElementById('nominalDonasi');
    const metodeInput = document.getElementById('metodeDonasi');
    const tanggalInput = document.getElementById('tanggalDonasi');
    const pesanInput = document.getElementById('pesanDonasi');

    const tbody = document.getElementById('donaturTable');
    const targetEl = document.getElementById('targetDonasi');

    // possible summary elements (some are in main progress section, some in donatur section)
    const terkumpulEls = [document.getElementById('terkumpul'), document.getElementById('terkumpul_small')].filter(Boolean);
    const sisaEls = [document.getElementById('sisa'), document.getElementById('sisa_small')].filter(Boolean);
    const progressEls = [document.getElementById('progressFill'), document.getElementById('progressFill_small')].filter(Boolean);
    const jumlahDonaturEl = document.getElementById('jumlahDonatur');

    const exportBtn = document.getElementById('exportCsv');
    const clearBtn = document.getElementById('clearDonatur');

    function loadDonatur() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Gagal membaca localStorage', e);
            return [];
        }
    }

    function saveDonatur(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            console.error('Gagal menyimpan ke localStorage', e);
        }
    }

    function renderTable() {
        const list = loadDonatur();
        if (!tbody) return;
        tbody.innerHTML = '';
        if (list.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="5">Belum ada donatur.</td>';
            tbody.appendChild(tr);
        } else {
            list.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escapeHtml(item.nama)}</td>
                    <td>${escapeHtml(item.tanggal)}</td>
                    <td>${formatRupiah(item.nominal)}</td>
                    <td>${escapeHtml(item.metode || '-')}</td>
                    <td>${escapeHtml(item.pesan || '-')}</td>
                `;
                tbody.appendChild(tr);
            });
        }
        updateSummary();
    }

    function updateSummary() {
        const list = loadDonatur();
        const total = list.reduce((s, it) => s + Number(it.nominal || 0), 0);
        const sisa = Math.max(0, TARGET - total);
        const persen = TARGET === 0 ? 0 : Math.min(100, Math.round((total / TARGET) * 100));

        // update all matching elements
        terkumpulEls.forEach(el => { el.innerText = formatRupiah(total); });
        sisaEls.forEach(el => { el.innerText = formatRupiah(sisa); });
        progressEls.forEach(el => {
            el.style.width = persen + '%';
            el.innerText = persen + '%';
        });
        if (jumlahDonaturEl) jumlahDonaturEl.innerText = String(list.length);

        // juga jika ada targetEl, tampilkan formatted target
        if (targetEl) targetEl.innerText = formatRupiah(TARGET);
    }

    function addDonatur(data) {
        const list = loadDonatur();
        list.unshift(data);
        saveDonatur(list);
        renderTable();
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const nama = namaInput ? namaInput.value.trim() : '';
            const nominal = nominalInput ? Number(nominalInput.value) : 0;
            const metode = metodeInput ? metodeInput.value.trim() : '';
            const tanggal = (tanggalInput && tanggalInput.value) ? tanggalInput.value : (new Date()).toISOString().slice(0, 10);
            const pesan = pesanInput ? pesanInput.value.trim() : '';

            if (!nama || !nominal || nominal <= 0) {
                alert('Isi nama dan nominal donasi dengan benar.');
                return;
            }

            addDonatur({ nama, nominal, metode, tanggal, pesan, createdAt: Date.now() });

            // reset form
            if (namaInput) namaInput.value = '';
            if (nominalInput) nominalInput.value = '';
            if (metodeInput) metodeInput.value = '';
            if (tanggalInput) tanggalInput.value = '';
            if (pesanInput) pesanInput.value = '';

            // optional: show quick thank you
            try { alert('Terima kasih, donasi Anda telah dicatat (client-side).'); } catch (e) {}
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', function () {
            const list = loadDonatur();
            if (!list.length) { alert('Belum ada data donatur.'); return; }
            const csv = [ ['Nama', 'Tanggal', 'Nominal', 'Metode', 'Pesan'], ...list.map(r => [r.nama, r.tanggal, r.nominal, r.metode || '', r.pesan || '']) ]
                .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'donatur.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (!confirm('Hapus semua data donatur dari localStorage?')) return;
            localStorage.removeItem(STORAGE_KEY);
            renderTable();
        });
    }

    // init
    document.addEventListener('DOMContentLoaded', function () {
        renderTable();
    });

})();
