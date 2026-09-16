# RENCANA PENELITIAN: EVALUASI PRAKTIKUM INFORMATIKA BERBASIS STATISTIKA INFERENSIAL & KUANTITATIF NLP

---

## 1. Ringkasan Eksekutif & Karakteristik Data

Dokumen ini memuat peta rencana penelitian komprehensif yang dirancang berdasarkan dataset aktual [**Form Survey Evaluasi Praktikum Informatika (Responses).xlsx**](file:///c:/Users/doeda/=RZK/Project%20pribadi/Form%20Survey%20Evaluasi%20Praktikum%20Informatika%20(Responses).xlsx) dan telaah literatur dari 5 paper referensi terkini.

### Profil Dataset:
* **Ukuran Sampel ($N$):** 226 responden mahasiswa aktif.
* **Sebaran Responden (Kohort/Angkatan):**
  * Angkatan 2024: 85 mahasiswa (37,6%)
  * Angkatan 2025: 73 mahasiswa (32,3%)
  * Angkatan 2023: 62 mahasiswa (27,4%)
  * Angkatan terdahulu: 6 responden (2,7%)
* **Struktur Variabel:**
  * **20 Indikator Kuantitatif (Skala Likert 1–5):** Mencakup dimensi Perangkat Keras & Lunak Lab, Jaringan & Internet, Lingkungan Fisik (AC/Cahaya/Kebersihan), Kualitas Modul Praktikum, dan Kinerja Dosen/Asisten.
  * **3 Atribut Kualitatif Teks Bebas:** 188 umpan balik masalah teknis, 159 umpan balik SDM, dan 169 umpan balik fasilitas/modul (total > 500 entri teks).

---

## 2. Peta Rencana Penelitian (Research Roadmaps)

Berdasarkan struktur data yang ada, terdapat **4 rencana penelitian** yang dapat dieksekusi, baik secara mandiri maupun terintegrasi (*mixed-method quantitative*):

```
                                  DATA EVALUASI PRAKTIKUM (N=226)
                                                 │
         ┌───────────────────────────────────────┴────────────────────────────────────────┐
         │                                                                                │
         ▼                                                                                ▼
[DATA KUANTITATIF RATING]                                                        [DATA TEKS KOMENTAR]
(20 Indikator Skala Likert)                                                      (3 Kolom Ulasan Terbuka)
         │                                                                                │
    ┌────┴───────────────────────────┐                                               ┌────┴───────────────────────────┐
    ▼                                ▼                                               ▼                                ▼
[RENCANA 1]                     [RENCANA 2]                                     [RENCANA 3]                      [RENCANA 4]
Pemodelan Kausal & Prioritas     Komparasi Antar-Kohort &                        Analisis Sentimen Kuantitatif    Triangulasi Multimodal
(SEM-PLS / Regresi + IPA/CSI)   Segmentasi (ANOVA + K-Means)                    & Pemodelan Topik (NLP)          (Rating-Text Integration)
```

---

## 3. Detail Rencana Penelitian

### Rencana 1: Pemodelan Kausal Determinan Kepuasan Praktikum (SEM-PLS & IPA-CSI)
* **Fokus Riset:** Menguji secara empiris faktor-faktor yang mempengaruhi kepuasan mahasiswa terhadap praktikum, serta menentukan prioritas perbaikan fasilitas secara presisi.
* **Kerangka Teoretis:** Integrasi *Service Quality* (SERVQUAL) dan *Technology Acceptance / Facility Satisfaction Model*.
* **Konstruk Laten & Indikator:**
  1. **Infrastruktur Lab ($X_1$):** Hardware PC, peripheral, kesiapan software.
  2. **Konektivitas Internet ($X_2$):** Kestabilan jaringan, kecepatan unduh.
  3. **Kualitas Modul Pembelajaran ($X_3$):** Sistematika, relevansi teori, kejelasan bahasa, contoh kasus, tingkat kesulitan tugas.
  4. **Kinerja Dosen & Asisten ($X_4$):** Ketepatan waktu, penguasaan materi, metode komunikasi, profesionalisme, pendampingan saat kesulitan.
  5. **Fasilitas Ruangan ($X_5$):** Kebersihan, suhu AC, pencahayaan, ketepatan jadwal.
  6. **Kepuasan Mahasiswa Keseluruhan ($Y$):** Variabel endogen (skor agregat).
* **Metode Analisis:**
  * **Uji Pengukuran (Outer Model):** *Convergent Validity* (Outer Loadings $> 0.7$, AVE $> 0.5$), *Discriminant Validity* (Fornell-Larcker Criterion & HTMT), dan Reliabilitas (*Cronbach’s Alpha* & *Composite Reliability* $> 0.7$).
  * **Uji Struktural (Inner Model):** Koefisien jalur ($\beta$), $t$-statistic melalui *bootstrapping* ($p < 0.05$), $R^2$ (*Coefficient of Determination*), dan $f^2$ (*Effect Size*).
  * **Importance-Performance Analysis (IPA):** Memetakan 20 indikator ke dalam 4 Kuadran Kartesius:
    * *Kuadran I (Prioritas Utama):* Internet lab & reliabilitas PC saat ujian.
    * *Kuadran II (Pertahankan Prestasi):* Pendingin ruangan (AC) & ketepatan jadwal.
    * *Kuadran III (Prioritas Rendah):* Aspek minor dengan skor sedang.
    * *Kuadran IV (Berlebihan):* Aspek berkinerja tinggi namun berurgensi rendah.
  * **Customer Satisfaction Index (CSI):** Menghitung nilai kepuasan kumulatif lab dalam skala persentase ($0\% - 100\%$).

---

### Rencana 2: Analisis Komparatif Antar-Angkatan & Segmentasi Karakteristik Mahasiswa
* **Fokus Riset:** Menjawab apakah terdapat kesenjangan persepsi yang signifikan antara mahasiswa angkatan baru (2025/2024) yang baru beradaptasi dengan mahasiswa senior (2023) yang mengambil mata kuliah komputasi berat.
* **Hipotesis Penelitian ($H_1$):** Terdapat perbedaan signifikan persepsi kepuasan terhadap spesifikasi hardware dan jaringan internet berdasarkan angkatan mahasiswa.
* **Metode Analisis:**
  1. **Uji Normalitas & Homogenitas:** Kolmogorov-Smirnov / Shapiro-Wilk dan Levene's Test.
  2. **Uji Komparasi Inferensial:**
     * *One-Way ANOVA* (jika terdistribusi normal) atau *Kruskal-Wallis H Test* (non-parametrik).
     * *Post-Hoc Test* (Tukey HSD atau Dunn-Bonferroni) untuk mengidentifikasi pasangan kohort yang memiliki deviasi persepsi paling tajam.
  3. **Segmentasi Klaster Mahasiswa (Unsupervised Machine Learning):**
     * Algoritma *K-Means Clustering* atau *Agglomerative Hierarchical Clustering*.
     * Penentuan jumlah klaster optimal via *Elbow Method* dan *Silhouette Score*.
     * Mengidentifikasi persona mahasiswa (misal: *Cluster 1: Critical Heavy-Users*, *Cluster 2: Moderate-Satisfied*, *Cluster 3: Passive-Satisfied*).

---

### Rencana 3: Analisis Kuantitatif NLP pada Komentar & Ulasan Mahasiswa
* **Fokus Riset:** Mengolah >500 data teks mentah pada 3 kolom saran terbuka menjadi wawasan kuantitatif yang terukur secara statistik.
* **Tahapan & Arsitektur Pemrosesan Teks:**
  ```
  [Raw Comments] ──> [Cleaning & Regex] ──> [Indonesian Slang Normalizer]
         │
         ▼
  [Tokenization & Sastrawi Stopwords] ──> [Lemmatization / Stemming]
         │
         ├────────────────────────────────────────┬───────────────────────────────────────┐
         ▼                                        ▼                                       ▼
  [Sentiment Scoring]                     [Feature Extraction]                    [Topic Modeling]
  - Lexicon (InSet)                       - TF-IDF Vectorizer                     - LDA (Dirichlet)
  - Transformer (IndoBERT)                - N-Gram (Bi-gram, Tri-gram)            - BERTopic Embedding
  ```
* **Metode Analisis Kuantitatif NLP:**
  1. **Polaritas Sentimen Komparatif:**
     * Mengukur rasio sentimen (Positif, Netral, Negatif) pada masing-masing dimensi masukan:
       * Saran Teknis (prediksi dominan: *Strong Negative* terkait internet dan PC mati).
       * Saran SDM (prediksi: *Mixed*, apresiasi asisten vs. keluhan metode pengajaran).
       * Saran Modul & Fasilitas (prediksi: *Constructive Negative* terkait kursi dan petunjuk langkah).
     * Uji Chi-Square ($\chi^2$) untuk menguji independensi distribusi sentimen antar-kategori saran.
  2. **Pemodelan Topik Probabilistik (Topic Modeling):**
     * *Latent Dirichlet Allocation* (LDA) untuk mengelompokkan keluhan ke dalam $k$-topik dominan (dioptimasi menggunakan *Coherence Score* $C_v$).
     * Ekstraksi frasa kunci dengan TF-IDF N-Gram (misal: `"koneksi internet"`, `"komputer mati"`, `"ujian praktikum"`, `"kursi lab"`, `"penjelasan asdos"`).
  3. **Klasifikasi Teks Otomatis:**
     * Pelatihan model klasifikasi (*Support Vector Machine*, *Naïve Bayes*, atau *IndoBERT*) untuk mengkategorikan keluhan secara otomatis berdasarkan departemen penanggung jawab (Sarana Prasarana, Tim Modul, atau Koordinator Asisten).

---

### Rencana 4: Triangulasi Riset *Mixed-Method* (Sintesis Kuantitatif Rating + Kuantitatif NLP)
* **Fokus Riset:** Menghubungkan skor kuantitatif rating dengan intensitas sentimen teks dari responden yang sama untuk menguji validitas keluhan.
* **Metode Analisis:**
  1. **Korelasi Skor Sentimen Teks vs Skor Rating Likert:**
     * Menghitung korelasi *Spearman Rank Correlation* ($r_s$) antara sentimen teks saran teknis dengan skor rating variabel internet ($X_2$) dan hardware ($X_1$).
     * Mengonfirmasi apakah mahasiswa yang memberi nilai 1–2 secara konsisten memberikan ulasan teks yang memiliki polaritas negatif tinggi (*convergence validity of responses*).
  2. **Model Regresi Logistik Ordinal / Multinomial:**
     * Menjadikan skor sentimen teks dan topik keluhan sebagai prediktor tambahan untuk memprediksi tingkat kepuasan praktikum keseluruhan.

---

## 4. Matriks Operasionalisasi Variabel

| Kode | Variabel | Indikator Instrumen Kuesioner | Tipe Data | Skala |
| :--- | :--- | :--- | :--- | :--- |
| **HW1** | Hardware Lab | Mampu menjalankan software tanpa kendala | Kuantitatif | Likert 1-5 |
| **HW2** | Perangkat Peripheral | Keyboard, Mouse, Monitor berfungsi baik | Kuantitatif | Likert 1-5 |
| **SW1** | Kesiapan Software | Software terinstal dengan versi yang tepat | Kuantitatif | Likert 1-5 |
| **NET1** | Stabilitas Jaringan | Koneksi internet stabil dan tidak terputus | Kuantitatif | Likert 1-5 |
| **NET2** | Kecepatan Jaringan | Kecepatan memadai untuk unduh materi/library | Kuantitatif | Likert 1-5 |
| **ENV1** | Kebersihan | Kebersihan meja, kursi, dan lantai terjaga | Kuantitatif | Likert 1-5 |
| **ENV2** | Suhu Ruangan | Suhu AC tetap sejuk dan nyaman | Kuantitatif | Likert 1-5 |
| **ENV3** | Pencahayaan | Pencahayaan mendukung kenyamanan kerja | Kuantitatif | Likert 1-5 |
| **MGT1** | Ketepatan Waktu | Jadwal praktikum berjalan tepat waktu | Kuantitatif | Likert 1-5 |
| **MGT2** | Responsivitas Staf | Staf lab responsif membantu kendala teknis | Kuantitatif | Likert 1-5 |
| **MOD1** | Sistematika Modul | Instruksi modul sistematis & mudah diikuti | Kuantitatif | Likert 1-5 |
| **MOD2** | Relevansi Modul | Materi relevan dengan teori di kelas | Kuantitatif | Likert 1-5 |
| **MOD3** | Bahasa Modul | Bahasa jelas dan tidak ambigu | Kuantitatif | Likert 1-5 |
| **MOD4** | Contoh Kasus Modul | Contoh kasus membantu pemahaman | Kuantitatif | Likert 1-5 |
| **MOD5** | Beban Tugas Modul | Tingkat kesulitan tugas sesuai | Kuantitatif | Likert 1-5 |
| **AST1** | Kehadiran Asisten | Dosen/Asisten hadir tepat waktu | Kuantitatif | Likert 1-5 |
| **AST2** | Penguasaan Materi | Dosen/Asisten menguasai materi praktikum | Kuantitatif | Likert 1-5 |
| **AST3** | Kejelasan Instruksi | Dosen/Asisten menerangkan dengan jelas | Kuantitatif | Likert 1-5 |
| **AST4** | Sikap Asisten | Dosen/Asisten bersikap sopan & profesional | Kuantitatif | Likert 1-5 |
| **AST5** | Pendampingan | Memberikan bimbingan saat mahasiswa kesulitan | Kuantitatif | Likert 1-5 |
| **TXT1** | Komentar Teknis | Saran masalah teknis perbaikan lab | Kualitatif / Teks | Teks Bebas |
| **TXT2** | Komentar SDM | Saran kinerja dosen & asisten | Kualitatif / Teks | Teks Bebas |
| **TXT3** | Komentar Fasilitas | Saran perbaikan fasilitas fisik & modul | Kualitatif / Teks | Teks Bebas |

---

## 5. Usulan Judul Paper & Target Publikasi Ilmiah

Berikut adalah alternatif judul publikasi yang dapat diturunkan dari rencana penelitian ini:

1. **Topik Pemodelan & Layanan Lab (Rencana 1):**
   * *Judul:* "Evaluasi Kualitas Layanan Laboratorium Informatika Menggunakan Integrasi Metode Structural Equation Modeling (SEM) dan Importance-Performance Analysis"
   * *Target Jurnal:* JEPIN (Jurnal Edukasi dan Penelitian Informatika) / JTIIK (Jurnal Teknologi Informasi dan Ilmu Komputer) — SINTA 2/3.
2. **Topik Natural Language Processing & Evaluasi Pembelajaran (Rencana 3 & 4):**
   * *Judul:* "Analisis Sentimen dan Topic Modeling Terhadap Umpan Balik Mahasiswa pada Laboratorium Komputer Menggunakan IndoBERT dan Latent Dirichlet Allocation"
   * *Target Jurnal:* Jurnal RESTI (Rekayasa Sistem dan Teknologi Informasi) / JUITA — SINTA 2.
3. **Topik Segmentasi & Evaluasi Komparatif (Rencana 2):**
   * *Judul:* "Segmentasi Karakteristik Kepuasan Mahasiswa Terhadap Pembelajaran Praktikum Informatika Berbasis Klastering K-Means dan Analisis Komparatif Kohort"
   * *Target Jurnal:* Jurnal Sistem Informasi (JSI) / Sisfotenika — SINTA 3/4.

---

## 6. Kebutuhan Perangkat Lunak & Ekosistem Komputasi

* **Bahasa Pemrograman & Lingkungan:** Python 3.10+ / Jupyter Notebook.
* **Pustaka Statistika:** `pandas`, `numpy`, `scipy.stats`, `statsmodels`, `pingouin` (uji psikometrik & ANOVA).
* **Pustaka Pemodelan & Machine Learning:** `scikit-learn` (K-Means, PCA, Klasifikasi), `semopy` atau R `lavaan` (SEM-PLS).
* **Pustaka NLP Bahasa Indonesia:** 
  * Preprocessing: `re`, `string`, `Sastrawi` (stemmer Bahasa Indonesia), `kamus-alay/slang dictionary`.
  * Representasi & Modeling: `gensim` (LDA topic modeling), `pyLDAvis` (visualisasi topik interaktif).
  * Transformer/Deep Learning: `transformers`, `huggingface/indobert-base-uncased`.
* **Pustaka Visualisasi Data:** `matplotlib`, `seaborn`, `plotly` (visualisasi kuadran IPA & word cloud).

---

## 7. Tahapan Eksekusi Step-by-Step

1. **Fase 1 — Data Cleaning & Feature Engineering:**
   * Ekstraksi dataset Excel, normalisasi tipe data numerik.
   * Standarisasi format identitas (NIM) menjadi variabel kategori `Angkatan`.
   * Ekstraksi dan pembersihan korpus teks komentar (penghapusan jawaban kosong/tanda hubung/stopword umum).
2. **Fase 2 — Analisis Statistika Deskriptif & Validasi Instrumen:**
   * Perhitungan Mean, Median, Standar Deviasi, Skewness, dan Kurtosis.
   * Uji Validitas Butir (Pearson) & Uji Reliabilitas (*Cronbach's Alpha*).
   * Perhitungan matriks IPA dan nilai agregat CSI.
3. **Fase 3 — Pemodelan Inferensial & Uji Komparatif:**
   * Analisis korelasi multivariat dan regresi berganda / SEM.
   * Uji beda ANOVA/Kruskal-Wallis antar-angkatan mahasiswa.
   * Eksekusi K-Means clustering untuk segmentasi responden.
4. **Fase 4 — Pemrosesan Kuantitatif NLP:**
   * Normalisasi slang teks bahasa Indonesia pada komentar mahasiswa.
   * Analisis polaritas sentimen (Positif, Netral, Negatif).
   * Ekstraksi kata kunci dengan TF-IDF N-Gram dan LDA Topic Modeling.
5. **Fase 5 — Sintesis & Penulisan Naskah Publikasi:**
   * Triangulasi temuan kuantitatif rating dengan temuan tematik ulasan teks.
   * Penyusunan laporan eksekutif dan naskah artikel ilmiah sesuai template jurnal sasaran.
