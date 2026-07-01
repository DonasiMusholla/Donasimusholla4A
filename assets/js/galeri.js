/* Galeri client-side (localStorage)
   - Menyimpan data galeri di localStorage
   - Menampilkan galeri dengan URL gambar
   - Bisa tambah, hapus galeri
*/
(function () {
    const STORAGE_KEY = 'galeriList_v1';

    // helper: escape HTML
    function escapeHtml(s) {
        if (!s && s !== 0) return '';
        return String(s).replace(/[&<>"]+/g, function (m) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m] || m;
        });
    }

    const form = document.getElementById('galeriForm');
    const judulInput = document.getElementById('judulGaleri');
    const deskripsiInput = document.getElementById('deskripsiGaleri');
    const urlInput = document.getElementById('urlGaleri');
    const galeriContainer = document.getElementById('galeriContainer');
    const clearBtn = document.getElementById('clearGaleri');

    function loadGaleri() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Gagal membaca localStorage', e);
            return [];
        }
    }

    function saveGaleri(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            console.error('Gagal menyimpan ke localStorage', e);
        }
    }

    function renderGaleri() {
        const list = loadGaleri();
        if (!galeriContainer) return;
        
        galeriContainer.innerHTML = '';
        
        if (list.length === 0) {
            galeriContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
                    Belum ada galeri. Tambahkan galeri pertama Anda!
                </div>
            `;
        } else {
            list.forEach((item, index) => {
                const galeriCard = document.createElement('div');
                galeriCard.style.cssText = `
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    position: relative;
                `;
                galeriCard.innerHTML = `
                    <div style="position: relative;">
                        <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.judul)}" 
                             style="width: 100%; height: 200px; object-fit: cover; display: block;">
                        <button class="deleteGaleri" data-index="${index}" 
                                style="position: absolute; top: 10px; right: 10px; background: #f44336; color: white; 
                                        border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; 
                                        font-size: 20px; display: flex; align-items: center; justify-content: center;">
                            ✕
                        </button>
                    </div>
                    <div style="padding: 15px;">
                        <h4 style="margin: 0 0 8px 0; color: #0f1c3f; font-size: 1.1rem;">
                            ${escapeHtml(item.judul)}
                        </h4>
                        <p style="margin: 0; color: #666; font-size: 0.9rem;">
                            ${escapeHtml(item.deskripsi)}
                        </p>
                    </div>
                `;
                
                galeriContainer.appendChild(galeriCard);
            });
        }
        
        // Add event listeners untuk tombol delete
        document.querySelectorAll('.deleteGaleri').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                if (confirm('Hapus galeri ini?')) {
                    const list = loadGaleri();
                    list.splice(index, 1);
                    saveGaleri(list);
                    renderGaleri();
                }
            });
        });
    }

    function addGaleri(data) {
        const list = loadGaleri();
        list.unshift(data);
        saveGaleri(list);
        renderGaleri();
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const judul = judulInput ? judulInput.value.trim() : '';
            const deskripsi = deskripsiInput ? deskripsiInput.value.trim() : '';
            const url = urlInput ? urlInput.value.trim() : '';

            if (!judul || !url) {
                alert('Isi judul dan URL gambar dengan benar.');
                return;
            }

            addGaleri({ judul, deskripsi, url, createdAt: Date.now() });

            // reset form
            if (judulInput) judulInput.value = '';
            if (deskripsiInput) deskripsiInput.value = '';
            if (urlInput) urlInput.value = '';

            try { alert('Galeri berhasil ditambahkan!'); } catch (e) {}
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (!confirm('Hapus semua data galeri?')) return;
            localStorage.removeItem(STORAGE_KEY);
            renderGaleri();
        });
    }

    // init
    document.addEventListener('DOMContentLoaded', function () {
        renderGaleri();
    });

})();
