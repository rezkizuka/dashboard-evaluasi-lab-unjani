# 🏛️ Dashboard Evaluasi Praktikum Informatika - Universitas Jenderal Achmad Yani (UNJANI)

<p align="center">
  <img src="logo_unjani.png" alt="Logo Universitas Jenderal Achmad Yani" width="140" style="margin-bottom: 12px;" />
  <br>
  <strong>Laboratorium Informatika &bull; Fakultas Sains dan Informatika</strong>
  <br>
  <em>Universitas Jenderal Achmad Yani, Cimahi - Jawa Barat</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-059669?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/Platform-GitHub%20Pages-047857?style=flat-square&logo=github" alt="GitHub Pages">
  <img src="https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-10b981?style=flat-square" alt="Tech Stack">
  <img src="https://img.shields.io/badge/Chart.js-v4.4.1-059669?style=flat-square" alt="Chart.js">
  <img src="https://img.shields.io/badge/Sample%20Size-N%3D226-064e3b?style=flat-square" alt="Sample Size">
  <img src="https://img.shields.io/badge/Cronbach's%20Alpha-0.938-d97706?style=flat-square" alt="Alpha">
</p>

---

## 📌 Ringkasan Proyek

**Dashboard Evaluasi Praktikum Informatika UNJANI** adalah aplikasi web visualisasi data berbasis *Single-Page Application* (SPA) yang dirancang untuk menganalisis hasil survei kepuasan mahasiswa terhadap pelaksanaan praktikum laboratorium secara komprehensif, interaktif, dan *real-time*.

Aplikasi ini menyajikan analisis statistika deskriptif univariat dan bivariat dengan fitur **Hierarchical Drill-Down & Drill-Up** multi-level (Dimensi Macro $\rightarrow$ Indikator Meso $\rightarrow$ Kohor & Aspirasi Teks Micro), matriks korelasi *Pearson*, serta analisis tematik umpan balik kualitatif mahasiswa.

Seluruh antarmuka dikembangkan dengan identitas visual **Nuansa Hijau Khas UNJANI** (*Emerald & Forest Green* berpadu aksen *Gold*), mendukung tema Terang (*Light Mode*) dan Gelap (*Dark Mode*), serta siap cetak (*print-friendly*).

---

## 📊 Sorotan Hasil Analisis Statistika

Survei dievaluasi dari **226 responden mahasiswa Informatika** (lintas Angkatan 2023, 2024, 2025, dan lainnya) yang mengukur 20 butir instrumen skala Likert (1 - 5) pada 6 dimensi strategis:

| Parameter Statistika | Nilai Temuan | Interpretasi Akademik |
| :--- | :---: | :--- |
| **Ukuran Sampel ($N$)** | **226 Mahasiswa** | Representasi solid dari populasi praktikan aktif |
| **Tingkat Kepuasan (CSI / CSAT)** | **74.8%** | Kategori **Puas / Baik** secara agregat |
| **Rata-Rata Agregat ($\mu$)** | **3.74 / 5.00** | Rata-rata skor berada pada spektrum positif |
| **Koefisien Reliabilitas ($\alpha$)** | **0.938** | *Cronbach's Alpha* sangat tinggi ($\alpha > 0.90$), instrumen sangat andal |
| **Dimensi Tertinggi** | **4.08 / 5.00** | **D6: Kinerja Dosen & Asisten Praktikum** (Sangat Baik) |
| **Dimensi Terendah (Prioritas)** | **3.27 / 5.00** | **D2: Jaringan & Konektivitas Internet Lab** (Perlu Peningkatan) |

### 6 Dimensi Evaluasi Laboratorium:
1. **D1: Perangkat Komputasi (Hardware & Software)** — $\mu = 3.65$
2. **D2: Jaringan & Konektivitas Lab (Internet)** — $\mu = 3.27$ *(Fokus Utama Perbaikan)*
3. **D3: Kenyamanan & Lingkungan Lab** — $\mu = 3.73$
4. **D4: Tata Kelola & Layanan Operasional** — $\mu = 3.72$
5. **D5: Kualitas Modul & Materi Praktikum** — $\mu = 3.96$
6. **D6: Kinerja Dosen & Asisten Praktikum** — $\mu = 4.08$ *(Apresiasi Tertinggi)*

---

## 🚀 Fitur Utama Dashboard

### 1. 🔍 Eksplorasi Data Hierarkis (Drill-Down & Drill-Up)
- **Level 1 (Macro - Agregat Dimensi):**
  - *Radar Chart* profil kepuasan 6 dimensi.
  - Grafik batang peringkat rerata skor dimensi.
  - Kartu ringkasan metrik ($\mu$, $\sigma$, CSI, status evaluasi) dengan navigasi satu klik ke level indikator.
- **Level 2 (Meso - Butir Indikator dalam Dimensi):**
  - Perbandingan rerata tiap butir pertanyaan di dimensi terpilih.
  - Visualisasi distribusi frekuensi 100% *Stacked Bar* Skala Likert (Sangat Tidak Setuju s/d Sangat Setuju).
  - Tabel indikator lengkap dengan tombol penelusuran lebih dalam.
- **Level 3 (Micro - Deep Dive Indikator & Analisis Kohor):**
  - Ringkasan 5 Angka Tukey (*Five-Number Summary*: Min, $Q_1$, Median, $Q_3$, Max, IQR).
  - Histogram sebaran frekuensi dan koefisien *Skewness* & *Kurtosis*.
  - Perbandingan antar-angkatan (Kohor 2023 vs 2024 vs 2025).
  - Ekstraksi otomatis saran/kritik teks mahasiswa yang berkorelasi relevan dengan indikator tersebut.
- **Navigasi Intuitif:** *Breadcrumb trail* responsif dan tombol navigasi *Drill-Up* & *Kembali ke Beranda Dimensi*.

### 2. 📋 Matriks Statistika Deskriptif Lengkap
- Tabel komprehensif menampilkan seluruh parameter statistik untuk 20 butir indikator:
  - Ukuran Pemusatan: **Mean**, **Median**, **Modus**.
  - Ukuran Penyebaran: **Standar Deviasi**, **Varians**, **Rentang (Range)**, **IQR ($Q_3 - Q_1$)**.
  - Bentuk Distribusi: **Kuartil 1 ($Q_1$)**, **Kuartil 3 ($Q_3$)**, **Skewness (Kemiringan)**, **Excess Kurtosis (Keruncingan)**.
  - Indeks Evaluasi: **% Puas**, **% Tidak Puas**, dan **CSI**.
- Fitur pengurutan multi-kolom interaktif (klik *header* untuk *sort ascending/descending*).
- Filter dropdown berdasarkan dimensi evaluasi.

### 3. 🔥 Matriks Korelasi Pearson (Heatmap)
- Perhitungan bivariat otomatis koefisien korelasi $r$ antar-seluruh dimensi survei:
  $$r_{xy} = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \sum (y_i - \bar{y})^2}}$$
- *Heatmap* dinamis berskala warna hijau zamrud (*Emerald scale*).
- Panel analisis wawasan statistik otomatis (mendeteksi hubungan korelasi tertinggi dan faktor independen infrastruktur).

### 4. 💬 Analisis Umpan Balik Kualitatif (Aspirasi Mahasiswa)
- Kategorisasi tematik: **Masalah Teknis Lab**, **Kinerja SDM**, dan **Fasilitas & Modul**.
- *Interactive Tag Cloud* kata kunci populer (`#wifi`, `#internet_lemot`, `#keyboard_mouse`, `#ac_dingin`, `#modul_jelas`, `#asisten_baik`, dll).
- Pencarian teks langsung (*live search filter*) dengan sistem paginasi responsif.

### 5. 🗃️ Akses Data Mentah Responden & Ekspor
- Tabel data mentah 226 responden dengan pencarian instan (NIM, ID, tanggal, angkatan).
- Ekspor multi-format:
  - **Ekspor Ringkasan CSV:** Menyimpan seluruh parameter statistika deskriptif 20 butir ke format spreadsheet.
  - **Ekspor Data Mentah CSV:** Menyimpan seluruh baris jawaban responden untuk analisis lanjutan di SPSS, R, atau Python.
  - **Ekspor JSON:** Menyimpan struktur data mentah terformat.

### 6. 🎨 Tampilan & Aksesibilitas
- **Branding UNJANI:** Logo resmi Universitas Jenderal Achmad Yani beresolusi tinggi dengan skema warna hijau institusional.
- **Dukungan Dark / Light Mode:** Transisi halus dengan penyimpanan preferensi pengguna via `localStorage`.
- **Tata Letak Cetak (Print CSS):** Dioptimalkan untuk dicetak langsung sebagai laporan fisik atau diekspor ke PDF via peramban web.

---

## 🛠️ Arsitektur & Teknologi

Aplikasi ini dibangun dengan prinsip **Zero Build Step / Zero External Runtime Dependency**, sehingga dapat langsung dijalankan secara *offline* di lingkungan lokal tanpa perlu instalasi Node.js atau package manager:

- **HTML5:** Struktur semantik, aksesibel, dan modular.
- **CSS3:** Menggunakan CSS Variables (*Design Tokens*), Flexbox, dan CSS Grid untuk responsivitas penuh dari layar ponsel hingga monitor 4K.
- **Vanilla JavaScript (ES6+):** Engine komputasi statistik murni tanpa framework berat, menjamin waktu muat instan (< 100 ms).
- **Chart.js (v4.4.1 UMD):** Pustaka visualisasi grafik yang dibundel secara lokal (`chart.umd.min.js`) untuk menjamin kemandirian jaringan saat digunakan *offline*.
- **Data Embedded (`data.js`):** 226 entri survei beserta metadata pertanyaan dan dimensi yang tersimpan dalam format objek JavaScript terstruktur.

---

## 📁 Struktur Direktori

```text
├── index.html              # Antarmuka utama aplikasi dashboard
├── style.css               # Gaya tampilan responsif bernuansa hijau UNJANI (Light & Dark)
├── app.js                  # Engine statistika deskriptif, visualisasi, dan logika drill-down/up
├── data.js                 # Dataset survei 226 responden dan metadata instrumen
├── chart.umd.min.js        # Pustaka Chart.js v4.4.1 lokal (offline-friendly)
├── logo_unjani.png         # Logo resmi Universitas Jenderal Achmad Yani
└── README.md               # Dokumentasi komprehensif proyek
```

---

## 💻 Cara Menjalankan Secara Lokal

### Opsi 1: Buka Langsung di Browser (Paling Cepat)
Cukup klik dua kali pada berkas `index.html` atau klik kanan dan pilih **Open With** $\rightarrow$ **Google Chrome / Microsoft Edge / Firefox**. Aplikasi akan langsung berjalan 100% tanpa kendala CORS.

### Opsi 2: Menggunakan Server Lokal Ringan

**Menggunakan Python:**
```bash
python -m http.server 8000
```
Buka peramban di `http://localhost:8000`.

**Menggunakan Node.js / npx:**
```bash
npx serve .
```

---

## 🌐 Panduan Deploy ke GitHub Pages

Untuk mempublikasikan dashboard ini ke **GitHub Pages** (`https://<username>.github.io/<nama-repo>/`), ikuti langkah-langkah berikut:

### 1. Inisialisasi Repositori Git & Commit
Buka terminal / PowerShell di direktori proyek ini:
```bash
git init
git add .
git commit -m "feat: inisialisasi dashboard evaluasi praktikum informatika unjani"
```

### 2. Login ke Akun GitHub Menggunakan GitHub CLI
```bash
gh auth login
```
- Pilih: `GitHub.com`
- Protokol: `HTTPS`
- Autentikasi git credential: `Yes`
- Metode login: `Login with a web browser`
- Masukkan kode satu kali (*one-time code*) yang muncul di terminal pada browser Anda.

### 3. Buat Repositori Remote & Unggah Kode
```bash
gh repo create dashboard-evaluasi-lab-unjani --public --source=. --push
```

### 4. Aktifkan Fitur GitHub Pages
Jalankan perintah berikut melalui GitHub CLI:
```bash
gh api -X POST repos/{owner}/dashboard-evaluasi-lab-unjani/pages -f source='{"branch":"main","path":"/"}'
```
*Atau lakukan melalui antarmuka web GitHub:*
1. Masuk ke halaman repositori di GitHub.
2. Buka menu **Settings** $\rightarrow$ **Pages**.
3. Pada bagian **Build and deployment** $\rightarrow$ **Branch**, pilih cabang `main` dan folder `/ (root)`.
4. Klik tombol **Save**.

Dalam 1-2 menit, dashboard Anda akan aktif dan dapat diakses publik di:
```text
https://<username>.github.io/dashboard-evaluasi-lab-unjani/
```

---

## 📜 Lisensi & Hak Cipta

Proyek ini dikembangkan untuk keperluan akademik dan evaluasi mutu laboratorium di lingkungan **Program Studi Informatika, Fakultas Sains dan Informatika, Universitas Jenderal Achmad Yani (UNJANI)**.

Lisensi di bawah naungan [MIT License](LICENSE). Bebas digunakan, dipelajari, dan dikembangkan kembali dengan mencantumkan atribusi.
