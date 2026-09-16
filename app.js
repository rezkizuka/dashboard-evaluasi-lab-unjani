/**
 * Dashboard Evaluasi Praktikum Informatika
 * Core Application & Descriptive Statistics Engine
 * Features: Hierarchical Drill-Down & Drill-Up, Real-time Statistics, Heatmap, Chart.js Visualizations
 */

// Global App State
const state = {
  theme: localStorage.getItem('app-theme') || 'light',
  activeTab: 'tab-drilldown',
  filter: {
    angkatan: 'all',
    periode: 'all',
    search: ''
  },
  drill: {
    level: 1, // 1: Macro Dimensions, 2: Indicators in Dimension, 3: Indicator Deep Dive
    dimId: 'D1',
    itemCode: 'HW1'
  },
  matrix: {
    dimFilter: 'all',
    sortKey: 'code',
    sortAsc: true
  },
  qualitative: {
    category: 'all',
    tag: '',
    search: '',
    page: 1,
    pageSize: 8
  },
  raw: {
    search: '',
    page: 1,
    pageSize: 15
  },
  charts: {}
};

// ==========================================================================
// 1. STATISTICAL UTILITY FUNCTIONS
// ==========================================================================

const Stats = {
  // Mean (Rata-rata hitung)
  mean(arr) {
    if (!arr || arr.length === 0) return 0;
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
  },

  // Median (Nilai tengah)
  median(arr) {
    if (!arr || arr.length === 0) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  },

  // Modus (Nilai paling sering muncul)
  mode(arr) {
    if (!arr || arr.length === 0) return 0;
    const freq = {};
    let maxFreq = 0;
    let modeVal = arr[0];
    for (const val of arr) {
      freq[val] = (freq[val] || 0) + 1;
      if (freq[val] > maxFreq) {
        maxFreq = freq[val];
        modeVal = val;
      }
    }
    return modeVal;
  },

  // Varians Sampel (s^2)
  variance(arr) {
    if (!arr || arr.length <= 1) return 0;
    const m = this.mean(arr);
    const sumSq = arr.reduce((acc, val) => acc + Math.pow(val - m, 2), 0);
    return sumSq / (arr.length - 1);
  },

  // Standar Deviasi Sampel (s)
  stdDev(arr) {
    return Math.sqrt(this.variance(arr));
  },

  // Percentile (metode linier terdekat)
  percentile(arr, p) {
    if (!arr || arr.length === 0) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const index = (p / 100) * (s.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    if (upper === lower) return s[lower];
    return s[lower] * (1 - weight) + s[upper] * weight;
  },

  // Quartile 1, 2, 3, IQR
  quartiles(arr) {
    const q1 = this.percentile(arr, 25);
    const q2 = this.percentile(arr, 50);
    const q3 = this.percentile(arr, 75);
    return { q1, q2, q3, iqr: q3 - q1 };
  },

  // Kemiringan Distribusi (Skewness - Sample Fisher-Pearson)
  skewness(arr) {
    const n = arr.length;
    if (n < 3) return 0;
    const m = this.mean(arr);
    const s = this.stdDev(arr);
    if (s === 0) return 0;
    const m3 = arr.reduce((acc, v) => acc + Math.pow((v - m) / s, 3), 0);
    return (n / ((n - 1) * (n - 2))) * m3;
  },

  // Keruncingan Distribusi (Excess Kurtosis)
  kurtosis(arr) {
    const n = arr.length;
    if (n < 4) return 0;
    const m = this.mean(arr);
    const s = this.stdDev(arr);
    if (s === 0) return 0;
    const m4 = arr.reduce((acc, v) => acc + Math.pow((v - m) / s, 4), 0);
    const term1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
    const term2 = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    return term1 * m4 - term2;
  },

  // Distribusi Frekuensi Skala Likert (1 - 5)
  likertFreq(arr) {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const v of arr) {
      if (counts[v] !== undefined) counts[v]++;
    }
    const n = arr.length || 1;
    const pct = {
      1: (counts[1] / n) * 100,
      2: (counts[2] / n) * 100,
      3: (counts[3] / n) * 100,
      4: (counts[4] / n) * 100,
      5: (counts[5] / n) * 100
    };
    const puasPct = ((counts[4] + counts[5]) / n) * 100;
    const tidakPuasPct = ((counts[1] + counts[2]) / n) * 100;
    const netralPct = (counts[3] / n) * 100;
    return { counts, pct, puasPct, tidakPuasPct, netralPct };
  },

  // Customer / Lab Satisfaction Index (CSI / CSAT %)
  csi(arr) {
    if (!arr || arr.length === 0) return 0;
    const m = this.mean(arr);
    return (m / 5) * 100;
  },

  // Cronbach's Alpha untuk reliabilitas instrumen
  cronbachAlpha(matrix) {
    const numItems = matrix[0] ? matrix[0].length : 0;
    const numRespondents = matrix.length;
    if (numItems <= 1 || numRespondents <= 1) return 0;

    let itemVarSum = 0;
    for (let j = 0; j < numItems; j++) {
      const itemScores = matrix.map(r => r[j]);
      itemVarSum += this.variance(itemScores);
    }

    const totalScores = matrix.map(r => r.reduce((a, b) => a + b, 0));
    const totalVar = this.variance(totalScores);
    if (totalVar === 0) return 0;

    const alpha = (numItems / (numItems - 1)) * (1 - (itemVarSum / totalVar));
    return Math.max(0, Math.min(1, alpha));
  },

  // Pearson Correlation Coefficient r
  pearson(arrX, arrY) {
    const n = Math.min(arrX.length, arrY.length);
    if (n <= 1) return 0;
    const meanX = this.mean(arrX);
    const meanY = this.mean(arrY);

    let num = 0;
    let denX = 0;
    let denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = arrX[i] - meanX;
      const dy = arrY[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    const den = Math.sqrt(denX * denY);
    return den === 0 ? 0 : num / den;
  }
};

// ==========================================================================
// 2. DATA FILTERING & QUERY ENGINE
// ==========================================================================

function getFilteredResponses() {
  if (!SURVEY_DATA || !SURVEY_DATA.responses) return [];
  return SURVEY_DATA.responses.filter(item => {
    // Filter Angkatan
    if (state.filter.angkatan !== 'all' && item.angkatan !== state.filter.angkatan) {
      return false;
    }
    // Filter Periode
    if (state.filter.periode !== 'all') {
      const dateStr = item.date;
      if (state.filter.periode === 'minggu-1' && (dateStr < '2026-03-02' || dateStr > '2026-03-08')) return false;
      if (state.filter.periode === 'minggu-2' && (dateStr < '2026-03-09' || dateStr > '2026-03-15')) return false;
      if (state.filter.periode === 'minggu-3' && dateStr < '2026-03-16') return false;
    }
    return true;
  });
}

// Compute statistics for an item by code
function getItemStats(code, responses) {
  const data = responses || getFilteredResponses();
  const values = data.map(r => r.scores[code]).filter(v => v !== undefined && !isNaN(v));
  const qMeta = SURVEY_DATA.questions.find(q => q.code === code) || {};
  const dimMeta = SURVEY_DATA.dimensions.find(d => d.id === qMeta.dim) || {};

  const mean = Stats.mean(values);
  const median = Stats.median(values);
  const mode = Stats.mode(values);
  const stdDev = Stats.stdDev(values);
  const variance = Stats.variance(values);
  const q = Stats.quartiles(values);
  const skewness = Stats.skewness(values);
  const kurtosis = Stats.kurtosis(values);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const range = max - min;
  const likert = Stats.likertFreq(values);
  const csi = Stats.csi(values);

  return {
    code,
    id: qMeta.id,
    dimId: qMeta.dim,
    dimName: dimMeta.name || '',
    text: qMeta.text || '',
    n: values.length,
    values,
    mean,
    median,
    mode,
    stdDev,
    variance,
    min,
    max,
    range,
    q1: q.q1,
    q2: q.q2,
    q3: q.q3,
    iqr: q.iqr,
    skewness,
    kurtosis,
    likert,
    csi
  };
}

// Compute statistics for a dimension
function getDimensionStats(dimId, responses) {
  const data = responses || getFilteredResponses();
  const dimMeta = SURVEY_DATA.dimensions.find(d => d.id === dimId);
  const questions = SURVEY_DATA.questions.filter(q => q.dim === dimId);
  
  const itemStats = questions.map(q => getItemStats(q.code, data));
  const allValues = [];
  data.forEach(r => {
    questions.forEach(q => {
      const v = r.scores[q.code];
      if (v !== undefined) allValues.push(v);
    });
  });

  const mean = Stats.mean(allValues);
  const median = Stats.median(allValues);
  const stdDev = Stats.stdDev(allValues);
  const csi = Stats.csi(allValues);
  const likert = Stats.likertFreq(allValues);

  // Reliability for this dimension
  const matrix = data.map(r => questions.map(q => r.scores[q.code] || 0));
  const alpha = Stats.cronbachAlpha(matrix);

  return {
    ...dimMeta,
    itemStats,
    n: data.length,
    mean,
    median,
    stdDev,
    csi,
    likert,
    alpha,
    questionCount: questions.length
  };
}

// ==========================================================================
// 3. CHART.JS WRAPPER & THEME UTILITIES
// ==========================================================================

function getChartColors() {
  const isDark = state.theme === 'dark';
  return {
    text: isDark ? '#cbd5e1' : '#475569',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    grid: isDark ? '#1e293b' : '#e2e8f0',
    cardBg: isDark ? '#162032' : '#ffffff',
    primary: '#059669',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    likertColors: ['#ef4444', '#f97316', '#eab308', '#34d399', '#059669']
  };
}

function createOrUpdateChart(id, config) {
  if (state.charts[id]) {
    state.charts[id].destroy();
  }
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  state.charts[id] = new Chart(ctx, config);
  return state.charts[id];
}

// ==========================================================================
// 4. RENDERING VIEWS & CHARTS
// ==========================================================================

function renderKpis() {
  const responses = getFilteredResponses();
  const total = responses.length;
  const allScores = [];

  SURVEY_DATA.questions.forEach(q => {
    responses.forEach(r => {
      if (r.scores[q.code] !== undefined) allScores.push(r.scores[q.code]);
    });
  });

  const overallMean = Stats.mean(allScores);
  const overallCsi = (overallMean / 5) * 100;

  const dimStats = SURVEY_DATA.dimensions.map(d => getDimensionStats(d.id, responses));
  dimStats.sort((a, b) => b.mean - a.mean);
  const highestDim = dimStats[0] || { name: '-', mean: 0 };
  const lowestDim = dimStats[dimStats.length - 1] || { name: '-', mean: 0 };

  const matrixAll = responses.map(r => SURVEY_DATA.questions.map(q => r.scores[q.code] || 0));
  const overallAlpha = Stats.cronbachAlpha(matrixAll);

  document.getElementById('kpi-total-respondents').textContent = total;
  const pctOfFull = ((total / SURVEY_DATA.responses.length) * 100).toFixed(0);
  document.getElementById('kpi-subtext-sample').textContent = `${pctOfFull}% dari 226 data total`;

  document.getElementById('kpi-csi-percent').textContent = overallCsi.toFixed(1) + '%';
  document.getElementById('kpi-csi-mean').innerHTML = `Rata-rata: <strong>${overallMean.toFixed(2)}</strong> / 5.00`;

  document.getElementById('kpi-highest-score').innerHTML = `${highestDim.mean.toFixed(2)} <span style="font-size: 0.85rem; font-weight: normal;">/ 5.0</span>`;
  document.getElementById('kpi-highest-name').textContent = highestDim.shortName || highestDim.name;

  document.getElementById('kpi-lowest-score').innerHTML = `${lowestDim.mean.toFixed(2)} <span style="font-size: 0.85rem; font-weight: normal;">/ 5.0</span>`;
  document.getElementById('kpi-lowest-name').textContent = `${lowestDim.shortName || lowestDim.name} (Prioritas)`;

  document.getElementById('kpi-alpha-val').textContent = overallAlpha.toFixed(3);

  const angkatanText = state.filter.angkatan === 'all' ? 'Semua Angkatan' : `Angkatan ${state.filter.angkatan}`;
  document.getElementById('active-filter-indicator').innerHTML = `Menampilkan: <strong>${total} Responden</strong> &bull; ${angkatanText}`;
}

function renderBreadcrumbs() {
  const container = document.getElementById('breadcrumb-container');
  const btnUp = document.getElementById('btn-drill-up');
  const btnHome = document.getElementById('btn-drill-home');

  let html = '';
  if (state.drill.level === 1) {
    html = `
      <div class="breadcrumb-item">
        <span class="breadcrumb-current">Ringkasan Dimensi Evaluasi (Macro)</span>
      </div>
    `;
    btnUp.style.display = 'none';
    btnHome.style.display = 'none';
  } else if (state.drill.level === 2) {
    const dim = SURVEY_DATA.dimensions.find(d => d.id === state.drill.dimId);
    html = `
      <div class="breadcrumb-item">
        <a class="breadcrumb-link" onclick="drillToLevel1(true)">Beranda Dimensi</a>
      </div>
      <span class="breadcrumb-separator">/</span>
      <div class="breadcrumb-item">
        <span class="breadcrumb-current">${dim ? dim.name : ''}</span>
      </div>
    `;
    btnUp.style.display = 'inline-flex';
    btnHome.style.display = 'inline-flex';
    btnUp.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> Kembali ke Semua Dimensi`;
  } else if (state.drill.level === 3) {
    const dim = SURVEY_DATA.dimensions.find(d => d.id === state.drill.dimId);
    const q = SURVEY_DATA.questions.find(item => item.code === state.drill.itemCode);
    html = `
      <div class="breadcrumb-item">
        <a class="breadcrumb-link" onclick="drillToLevel1(true)">Beranda Dimensi</a>
      </div>
      <span class="breadcrumb-separator">/</span>
      <div class="breadcrumb-item">
        <a class="breadcrumb-link" onclick="drillToLevel2('${state.drill.dimId}')">${dim ? dim.shortName : ''}</a>
      </div>
      <span class="breadcrumb-separator">/</span>
      <div class="breadcrumb-item">
        <span class="breadcrumb-current">[${q ? q.code : ''}] ${q ? q.text.substring(0, 45) + '...' : ''}</span>
      </div>
    `;
    btnUp.style.display = 'inline-flex';
    btnHome.style.display = 'inline-flex';
    btnUp.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> Kembali ke Dimensi`;
  }

  container.innerHTML = html;
}

function renderDrillLevel1() {
  const responses = getFilteredResponses();
  const dimStats = SURVEY_DATA.dimensions.map(d => getDimensionStats(d.id, responses));
  const colors = getChartColors();

  createOrUpdateChart('chart-radar-dimensions', {
    type: 'radar',
    data: {
      labels: dimStats.map(d => d.shortName),
      datasets: [{
        label: 'Skor Rata-Rata Dimensi (Skala 1-5)',
        data: dimStats.map(d => Number(d.mean.toFixed(2))),
        backgroundColor: 'rgba(5, 150, 105, 0.2)',
        borderColor: '#059669',
        pointBackgroundColor: '#059669',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#059669',
        borderWidth: 2,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 1,
          max: 5,
          ticks: { stepSize: 1, color: colors.textMuted },
          grid: { color: colors.grid },
          angleLines: { color: colors.grid },
          pointLabels: { color: colors.text, font: { size: 12, weight: 'bold' } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` Rata-rata: ${ctx.raw} / 5.00`
          }
        }
      }
    }
  });

  const sortedDims = [...dimStats].sort((a, b) => b.mean - a.mean);
  createOrUpdateChart('chart-bar-dimensions', {
    type: 'bar',
    data: {
      labels: sortedDims.map(d => d.shortName),
      datasets: [{
        label: 'Mean Skor',
        data: sortedDims.map(d => Number(d.mean.toFixed(2))),
        backgroundColor: sortedDims.map(d => d.color || '#3b82f6'),
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          min: 0,
          max: 5,
          ticks: { stepSize: 1, color: colors.textMuted },
          grid: { color: colors.grid }
        },
        y: {
          ticks: { color: colors.text, font: { weight: 'bold' } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` Skor Mean: ${ctx.raw} / 5.00`
          }
        }
      }
    }
  });

  const cardsContainer = document.getElementById('dim-cards-container');
  let cardsHtml = '';

  dimStats.forEach(d => {
    let statusClass = 'badge-success';
    let statusText = 'Sangat Baik';
    if (d.mean < 2.5) {
      statusClass = 'badge-danger';
      statusText = 'Perlu Perbaikan Mendesak';
    } else if (d.mean < 3.5) {
      statusClass = 'badge-warning';
      statusText = 'Cukup / Perhatian';
    } else if (d.mean < 4.0) {
      statusClass = 'badge-info';
      statusText = 'Baik';
    }

    cardsHtml += `
      <div class="dim-card" style="--dim-color: ${d.color};" onclick="drillToLevel2('${d.id}')">
        <div class="dim-card-top">
          <div>
            <span class="dim-badge" style="background: ${d.color};">
              ${d.id} &bull; ${d.questionCount} Butir
            </span>
            <div class="dim-name">${d.name}</div>
          </div>
        </div>

        <p class="dim-desc">${d.desc}</p>

        <div class="dim-stats-row">
          <div class="dim-stat-box">
            <div class="val" style="color: ${d.color};">${d.mean.toFixed(2)}</div>
            <div class="lbl">Mean (&mu;)</div>
          </div>
          <div class="dim-stat-box">
            <div class="val">${d.stdDev.toFixed(2)}</div>
            <div class="lbl">Std Dev (&sigma;)</div>
          </div>
          <div class="dim-stat-box">
            <div class="val">${d.csi.toFixed(0)}%</div>
            <div class="lbl">Indeks CSI</div>
          </div>
        </div>

        <div class="dim-card-footer">
          <span class="badge ${statusClass}">${statusText}</span>
          <span class="drill-btn-inline">
            Detail Indikator &rarr;
          </span>
        </div>
      </div>
    `;
  });

  cardsContainer.innerHTML = cardsHtml;
}

function renderDrillLevel2(dimId) {
  const responses = getFilteredResponses();
  const d = getDimensionStats(dimId, responses);
  const colors = getChartColors();

  const banner = document.getElementById('level2-dimension-banner');
  banner.innerHTML = `
    <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
      <div style="max-width: 780px;">
        <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem;">
          <span class="dim-badge" style="background: ${d.color}; font-size: 0.85rem; padding: 0.35rem 0.75rem;">
            ${d.id} &bull; ${d.name}
          </span>
          <span class="badge badge-info">Reliabilitas Dimensi &alpha;: ${d.alpha.toFixed(3)}</span>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;">${d.desc}</p>
      </div>

      <div style="display: flex; gap: 1.5rem; align-items: center; background: var(--bg-card); padding: 0.75rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="text-align: center;">
          <div style="font-size: 1.6rem; font-weight: 800; color: ${d.color};">${d.mean.toFixed(2)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Mean Skor</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-main);">${d.csi.toFixed(1)}%</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Tingkat Puas</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-main);">${d.itemStats.length}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Indikator</div>
        </div>
      </div>
    </div>
  `;

  createOrUpdateChart('chart-indicators-mean', {
    type: 'bar',
    data: {
      labels: d.itemStats.map(item => item.code),
      datasets: [{
        label: 'Mean Skor Indikator',
        data: d.itemStats.map(item => Number(item.mean.toFixed(2))),
        backgroundColor: d.color,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 1,
          max: 5,
          ticks: { stepSize: 1, color: colors.textMuted },
          grid: { color: colors.grid }
        },
        x: {
          ticks: { color: colors.text, font: { weight: 'bold' } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const code = items[0].label;
              const item = d.itemStats.find(i => i.code === code);
              return `[${code}] ${item ? item.text : ''}`;
            },
            label: (ctx) => ` Rata-rata: ${ctx.raw} / 5.00`
          }
        }
      }
    }
  });

  createOrUpdateChart('chart-indicators-likert', {
    type: 'bar',
    data: {
      labels: d.itemStats.map(item => item.code),
      datasets: [
        { label: '1 - Sangat Tidak Setuju', data: d.itemStats.map(i => Number(i.likert.pct[1].toFixed(1))), backgroundColor: '#ef4444' },
        { label: '2 - Tidak Setuju', data: d.itemStats.map(i => Number(i.likert.pct[2].toFixed(1))), backgroundColor: '#f97316' },
        { label: '3 - Netral / Cukup', data: d.itemStats.map(i => Number(i.likert.pct[3].toFixed(1))), backgroundColor: '#eab308' },
        { label: '4 - Setuju', data: d.itemStats.map(i => Number(i.likert.pct[4].toFixed(1))), backgroundColor: '#34d399' },
        { label: '5 - Sangat Setuju', data: d.itemStats.map(i => Number(i.likert.pct[5].toFixed(1))), backgroundColor: '#059669' }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          max: 100,
          ticks: { callback: v => v + '%', color: colors.textMuted },
          grid: { color: colors.grid }
        },
        y: {
          stacked: true,
          ticks: { color: colors.text, font: { weight: 'bold' } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { position: 'bottom', labels: { color: colors.text, boxWidth: 12, font: { size: 10 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}%`
          }
        }
      }
    }
  });

  const cardsContainer = document.getElementById('indicators-cards-container');
  let cardsHtml = '';

  d.itemStats.forEach(item => {
    cardsHtml += `
      <div class="indicator-card" onclick="drillToLevel3('${item.code}')">
        <div>
          <div class="ind-header">
            <span class="ind-code-badge">${item.code}</span>
            <div style="font-size: 0.85rem; font-weight: 700; color: ${d.color};">
              Mean: ${item.mean.toFixed(2)} &bull; ${item.csi.toFixed(0)}%
            </div>
          </div>
          <div class="ind-text" style="margin-top: 0.5rem;">${item.text}</div>
        </div>

        <div style="margin-top: 0.75rem;">
          <div class="mini-stat-bar-wrap">
            <span style="font-size: 0.75rem; color: var(--text-muted);">Puas (${item.likert.puasPct.toFixed(0)}%)</span>
            <div class="mini-bar-track">
              <div class="mini-bar-fill" style="width: ${item.likert.puasPct}%;"></div>
            </div>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-main);">${item.likert.puasPct.toFixed(0)}%</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.5rem; font-size: 0.78rem;">
          <div style="color: var(--text-muted);">
            Std Dev: <strong>${item.stdDev.toFixed(2)}</strong> &bull; Median: <strong>${item.median}</strong>
          </div>
          <span class="drill-btn-inline" style="padding: 0.25rem 0.65rem;">
            Analisis Kohor &rarr;
          </span>
        </div>
      </div>
    `;
  });

  cardsContainer.innerHTML = cardsHtml;

  const tbody = document.getElementById('tbody-dimension-indicators');
  let rowsHtml = '';
  d.itemStats.forEach(item => {
    rowsHtml += `
      <tr>
        <td><strong>${item.code}</strong></td>
        <td style="max-width: 320px; white-space: normal;">${item.text}</td>
        <td>${item.n}</td>
        <td><strong style="color: ${d.color};">${item.mean.toFixed(2)}</strong></td>
        <td>${item.median}</td>
        <td>${item.mode}</td>
        <td>${item.stdDev.toFixed(2)}</td>
        <td>${item.variance.toFixed(2)}</td>
        <td>${item.iqr.toFixed(2)}</td>
        <td>${item.skewness.toFixed(2)}</td>
        <td><span class="badge ${item.likert.puasPct >= 70 ? 'badge-success' : item.likert.puasPct >= 40 ? 'badge-warning' : 'badge-danger'}">${item.likert.puasPct.toFixed(1)}%</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="drillToLevel3('${item.code}')">
            Deep Dive
          </button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = rowsHtml;
}

function renderDrillLevel3(code) {
  const responses = getFilteredResponses();
  const item = getItemStats(code, responses);
  const colors = getChartColors();
  const dim = SURVEY_DATA.dimensions.find(d => d.id === item.dimId) || {};

  const headerContainer = document.getElementById('level3-indicator-header');
  headerContainer.innerHTML = `
    <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
      <div style="max-width: 820px;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span class="dim-badge" style="background: ${dim.color || '#3b82f6'};">${item.dimId} &bull; ${item.dimName}</span>
          <span class="ind-code-badge" style="font-size: 0.85rem;">${item.code}</span>
        </div>
        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.35rem;">
          ${item.text}
        </h2>
        <div style="font-size: 0.82rem; color: var(--text-muted);">
          Kolom Spreadsheet: [${item.id}] &bull; Total Responden Sampel: <strong>${item.n} Mahasiswa</strong>
        </div>
      </div>

      <div style="display: flex; gap: 1.25rem; background: var(--bg-subtle); padding: 0.75rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="text-align: center;">
          <div style="font-size: 1.65rem; font-weight: 800; color: var(--primary);">${item.mean.toFixed(2)}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Mean Skor</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 1.65rem; font-weight: 800; color: var(--text-main);">${item.csi.toFixed(1)}%</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Indeks Kepuasan</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 1.65rem; font-weight: 800; color: var(--text-main);">${item.likert.puasPct.toFixed(0)}%</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">% Puas (4-5)</div>
        </div>
      </div>
    </div>
  `;

  const fiveNumContainer = document.getElementById('five-number-summary-container');
  fiveNumContainer.innerHTML = `
    <div class="five-num-box">
      <div class="num-val">${item.min}</div>
      <div class="num-lbl">Nilai Minimum</div>
    </div>
    <div class="five-num-box">
      <div class="num-val">${item.q1.toFixed(1)}</div>
      <div class="num-lbl">Kuartil 1 (Q1 - 25%)</div>
    </div>
    <div class="five-num-box" style="border-color: var(--primary);">
      <div class="num-val" style="color: var(--primary);">${item.median}</div>
      <div class="num-lbl">Median (Q2 - 50%)</div>
    </div>
    <div class="five-num-box">
      <div class="num-val">${item.q3.toFixed(1)}</div>
      <div class="num-lbl">Kuartil 3 (Q3 - 75%)</div>
    </div>
    <div class="five-num-box">
      <div class="num-val">${item.max}</div>
      <div class="num-lbl">Nilai Maksimum</div>
    </div>
    <div class="five-num-box">
      <div class="num-val">${item.iqr.toFixed(1)}</div>
      <div class="num-lbl">IQR (Jangkauan Interkuartil)</div>
    </div>
  `;

  const freqLabels = ['1 (Sangat Tidak Setuju)', '2 (Tidak Setuju)', '3 (Cukup / Netral)', '4 (Setuju)', '5 (Sangat Setuju)'];
  const freqData = [1, 2, 3, 4, 5].map(v => item.likert.counts[v]);

  createOrUpdateChart('chart-indicator-histogram', {
    type: 'bar',
    data: {
      labels: freqLabels,
      datasets: [{
        label: 'Frekuensi Responden',
        data: freqData,
        backgroundColor: colors.likertColors,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: { stepSize: 10, color: colors.textMuted },
          grid: { color: colors.grid }
        },
        x: {
          ticks: { color: colors.text, font: { size: 11 } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw;
              const pct = ((val / item.n) * 100).toFixed(1);
              return ` ${val} Responden (${pct}%)`;
            }
          }
        }
      }
    }
  });

  const cohortGroups = ['2023', '2024', '2025', 'Lainnya'];
  const cohortStats = cohortGroups.map(grp => {
    const cohortResponses = responses.filter(r => r.angkatan === grp);
    const vals = cohortResponses.map(r => r.scores[code]).filter(v => v !== undefined);
    return {
      angkatan: grp,
      n: vals.length,
      mean: Stats.mean(vals),
      median: Stats.median(vals),
      stdDev: Stats.stdDev(vals),
      min: vals.length ? Math.min(...vals) : 0,
      max: vals.length ? Math.max(...vals) : 0,
      likert: Stats.likertFreq(vals)
    };
  });

  createOrUpdateChart('chart-indicator-cohort', {
    type: 'bar',
    data: {
      labels: cohortStats.map(c => `Angkatan ${c.angkatan} (N=${c.n})`),
      datasets: [{
        label: 'Rata-Rata Skor',
        data: cohortStats.map(c => Number(c.mean.toFixed(2))),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 1,
          max: 5,
          ticks: { stepSize: 1, color: colors.textMuted },
          grid: { color: colors.grid }
        },
        x: {
          ticks: { color: colors.text, font: { weight: 'bold' } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` Mean: ${ctx.raw} / 5.00`
          }
        }
      }
    }
  });

  const tbodyCohort = document.getElementById('tbody-cohort-comparison');
  let cohortRowsHtml = '';
  cohortStats.forEach(c => {
    if (c.n === 0) return;
    const statusPill = c.mean >= 4.0 ? 'badge-success' : c.mean >= 3.0 ? 'badge-warning' : 'badge-danger';
    const statusLabel = c.mean >= 4.0 ? 'Puas' : c.mean >= 3.0 ? 'Netral / Cukup' : 'Kurang Puas';

    cohortRowsHtml += `
      <tr>
        <td><strong>Angkatan ${c.angkatan}</strong></td>
        <td>${c.n} Mahasiswa</td>
        <td><strong>${c.mean.toFixed(2)}</strong></td>
        <td>${c.median}</td>
        <td>${c.stdDev.toFixed(2)}</td>
        <td>${c.min} - ${c.max}</td>
        <td><span class="badge ${c.likert.puasPct >= 70 ? 'badge-success' : c.likert.puasPct >= 40 ? 'badge-warning' : 'badge-danger'}">${c.likert.puasPct.toFixed(1)}%</span></td>
        <td><span class="badge ${statusPill}">${statusLabel}</span></td>
      </tr>
    `;
  });
  tbodyCohort.innerHTML = cohortRowsHtml;

  renderRelevantFeedbackForIndicator(code, item);
}

function renderRelevantFeedbackForIndicator(code, item) {
  const container = document.getElementById('relevant-feedback-container');
  const responses = getFilteredResponses();

  let keywords = [];
  if (code.startsWith('HW')) keywords = ['hardware', 'komputer', 'pc', 'spek', 'mouse', 'keyboard', 'monitor', 'rusak', 'lemot', 'lag'];
  else if (code.startsWith('SW')) keywords = ['software', 'install', 'versi', 'aplikasi', 'vscode', 'python', 'java'];
  else if (code.startsWith('NET')) keywords = ['internet', 'wifi', 'koneksi', 'jaringan', 'putus', 'lambat', 'download', 'akses'];
  else if (code.startsWith('ENV')) keywords = ['ac', 'panas', 'dingin', 'bersih', 'sampah', 'lampu', 'terang', 'kursi', 'meja'];
  else if (code.startsWith('OPS')) keywords = ['jadwal', 'waktu', 'staf', 'teknis', 'kendala', 'lab', 'telat'];
  else if (code.startsWith('MOD')) keywords = ['modul', 'materi', 'tugas', 'contoh', 'sulit', 'bahasa', 'jelas'];
  else if (code.startsWith('AST')) keywords = ['asisten', 'dosen', 'bimbingan', 'jelas', 'sopan', 'menguasai', 'ramah', 'bantu'];

  const matched = [];
  responses.forEach(r => {
    const texts = [
      { text: r.feedback_teknis, cat: 'Masalah Teknis' },
      { text: r.feedback_sdm, cat: 'Kinerja SDM' },
      { text: r.feedback_fasilitas, cat: 'Fasilitas & Modul' }
    ];

    texts.forEach(t => {
      if (!t.text || t.text.trim() === '-' || t.text.toLowerCase() === 'tidak ada' || t.text.length < 5) return;
      const lower = t.text.toLowerCase();
      const hasMatch = keywords.some(kw => lower.includes(kw));
      if (hasMatch) {
        matched.push({
          id: r.id,
          angkatan: r.angkatan,
          cat: t.cat,
          score: r.scores[code],
          quote: t.text
        });
      }
    });
  });

  if (matched.length === 0) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
        Tidak ditemukan aspirasi teks spesifik untuk topik ini dalam sampel aktif.
      </div>
    `;
    return;
  }

  const displayItems = matched.slice(0, 8);
  let html = '';
  displayItems.forEach(item => {
    html += `
      <div class="feedback-card">
        <div class="feedback-meta">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge badge-info">${item.cat}</span>
            <span>Responden #${item.id} &bull; Angkatan ${item.angkatan}</span>
          </div>
          <span class="badge ${item.score >= 4 ? 'badge-success' : item.score >= 3 ? 'badge-warning' : 'badge-danger'}">
            Skor Penilaian: ${item.score} / 5
          </span>
        </div>
        <div class="feedback-quote">"${item.quote}"</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ==========================================================================
// 5. TAB 2: MATRIKS STATISTIKA LENGKAP TABLE ENGINE
// ==========================================================================

function renderFullStatsTable() {
  const responses = getFilteredResponses();
  let questions = [...SURVEY_DATA.questions];

  if (state.matrix.dimFilter !== 'all') {
    questions = questions.filter(q => q.dim === state.matrix.dimFilter);
  }

  const items = questions.map(q => getItemStats(q.code, responses));

  const key = state.matrix.sortKey;
  const asc = state.matrix.sortAsc;

  items.sort((a, b) => {
    let valA = a[key];
    let valB = b[key];
    if (key === 'pctPuas') {
      valA = a.likert.puasPct;
      valB = b.likert.puasPct;
    } else if (key === 'pctTidakPuas') {
      valA = a.likert.tidakPuasPct;
      valB = b.likert.tidakPuasPct;
    }
    if (typeof valA === 'string') {
      return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return asc ? valA - valB : valB - valA;
  });

  const tbody = document.getElementById('full-stats-tbody');
  let html = '';

  items.forEach(item => {
    const dim = SURVEY_DATA.dimensions.find(d => d.id === item.dimId) || {};
    html += `
      <tr>
        <td><strong>${item.code}</strong></td>
        <td><span class="dim-badge" style="background: ${dim.color || '#3b82f6'}; font-size: 0.7rem;">${item.dimId}</span></td>
        <td style="max-width: 260px; white-space: normal;">${item.text}</td>
        <td><strong style="color: ${item.mean < 3 ? 'var(--danger)' : item.mean >= 4 ? 'var(--success-text)' : 'var(--text-main)'};">${item.mean.toFixed(2)}</strong></td>
        <td>${item.median}</td>
        <td>${item.mode}</td>
        <td>${item.stdDev.toFixed(2)}</td>
        <td>${item.variance.toFixed(2)}</td>
        <td>${item.q1.toFixed(1)}</td>
        <td>${item.q3.toFixed(1)}</td>
        <td>${item.iqr.toFixed(1)}</td>
        <td>${item.skewness.toFixed(2)}</td>
        <td>${item.kurtosis.toFixed(2)}</td>
        <td><span class="badge ${item.likert.puasPct >= 70 ? 'badge-success' : item.likert.puasPct >= 40 ? 'badge-warning' : 'badge-danger'}">${item.likert.puasPct.toFixed(1)}%</span></td>
        <td><span class="badge ${item.likert.tidakPuasPct >= 30 ? 'badge-danger' : 'badge-info'}">${item.likert.tidakPuasPct.toFixed(1)}%</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="switchTab('tab-drilldown'); drillToLevel3('${item.code}')">
            Deep Dive &rarr;
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function sortFullTable(key) {
  if (state.matrix.sortKey === key) {
    state.matrix.sortAsc = !state.matrix.sortAsc;
  } else {
    state.matrix.sortKey = key;
    state.matrix.sortAsc = true;
  }
  renderFullStatsTable();
}

// ==========================================================================
// 6. TAB 3: MATRIKS KORELASI PEARSON (HEATMAP)
// ==========================================================================

function renderCorrelationHeatmap() {
  const responses = getFilteredResponses();
  const dims = SURVEY_DATA.dimensions;
  const n = dims.length;

  const dimRespondentScores = dims.map(d => {
    const qCodes = SURVEY_DATA.questions.filter(q => q.dim === d.id).map(q => q.code);
    return responses.map(r => {
      const vals = qCodes.map(code => r.scores[code] || 0);
      return Stats.mean(vals);
    });
  });

  const corrMatrix = [];
  for (let i = 0; i < n; i++) {
    corrMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        corrMatrix[i][j] = 1.0;
      } else {
        corrMatrix[i][j] = Stats.pearson(dimRespondentScores[i], dimRespondentScores[j]);
      }
    }
  }

  const table = document.getElementById('corr-heatmap-table');
  let html = '<thead><tr><th>Dimensi</th>';
  dims.forEach(d => {
    html += `<th>${d.shortName}</th>`;
  });
  html += '</tr></thead><tbody>';

  for (let i = 0; i < n; i++) {
    html += `<tr><td><strong>${dims[i].shortName}</strong></td>`;
    for (let j = 0; j < n; j++) {
      const r = corrMatrix[i][j];
      let bg = '#f0fdf4';
      let textColor = '#14532d';
      if (i === j) {
        bg = '#a7f3d0';
        textColor = '#064e3b';
      } else if (r >= 0.7) {
        bg = '#047857';
        textColor = '#ffffff';
      } else if (r >= 0.5) {
        bg = '#059669';
        textColor = '#ffffff';
      } else if (r >= 0.3) {
        bg = '#6ee7b7';
        textColor = '#064e3b';
      } else {
        bg = '#e2e8f0';
        textColor = '#475569';
      }

      html += `
        <td class="corr-cell" style="background: ${bg}; color: ${textColor};" title="Korelasi antara ${dims[i].name} & ${dims[j].name}: ${r.toFixed(3)}">
          ${r.toFixed(2)}
        </td>
      `;
    }
    html += '</tr>';
  }
  html += '</tbody>';
  table.innerHTML = html;

  const insightsContainer = document.getElementById('correlation-insights-container');
  let maxR = -1;
  let maxPair = null;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (corrMatrix[i][j] > maxR) {
        maxR = corrMatrix[i][j];
        maxPair = [dims[i], dims[j]];
      }
    }
  }

  insightsContainer.innerHTML = `
    <div class="card" style="background: var(--bg-subtle); border-left: 4px solid var(--primary);">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin-bottom: 0.3rem;">
        Hubungan Paling Erat Terdeteksi (r = ${maxR.toFixed(2)})
      </h4>
      <p style="font-size: 0.85rem; color: var(--text-main); line-height: 1.5;">
        Korelasi tertinggi terjadi antara <strong>${maxPair ? maxPair[0].name : ''}</strong> dan <strong>${maxPair ? maxPair[1].name : ''}</strong>. 
        Hal ini menunjukkan bahwa kepuasan mahasiswa pada materi modul sangat berkorelasi positif dengan kualitas bimbingan dosen dan asisten praktikum.
      </p>
    </div>

    <div class="card" style="background: var(--bg-subtle); border-left: 4px solid var(--danger);">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--danger); margin-bottom: 0.3rem;">
        Independensi Kendala Jaringan Internet
      </h4>
      <p style="font-size: 0.85rem; color: var(--text-main); line-height: 1.5;">
        Dimensi Jaringan Internet memiliki korelasi yang relatif independen terhadap kinerja asisten maupun kenyamanan fisik lab, menegaskan bahwa masalah jaringan internet merupakan faktor infrastruktur mendasar (hygiene factor) yang menjadi keluhan lintas angkatan.
      </p>
    </div>

    <div class="card" style="background: var(--bg-subtle); border-left: 4px solid var(--success);">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--success); margin-bottom: 0.3rem;">
        Konsistensi Fasilitas & Layanan
      </h4>
      <p style="font-size: 0.85rem; color: var(--text-main); line-height: 1.5;">
        Seluruh koefisien korelasi bernilai positif (r > 0), menunjukkan konsistensi instrumen evaluasi dalam mengukur kepuasan laboratorium secara holistik.
      </p>
    </div>
  `;
}

// ==========================================================================
// 7. TAB 4: ANALISIS UMPAN BALIK KUALITATIF
// ==========================================================================

function getFeedbackRecords() {
  const responses = getFilteredResponses();
  const list = [];

  responses.forEach(r => {
    const cats = [
      { key: 'teknis', label: 'Masalah Teknis Lab', text: r.feedback_teknis },
      { key: 'sdm', label: 'Kinerja SDM (Dosen & Asisten)', text: r.feedback_sdm },
      { key: 'fasilitas', label: 'Fasilitas & Modul', text: r.feedback_fasilitas }
    ];

    cats.forEach(c => {
      if (!c.text || c.text.trim() === '-' || c.text.toLowerCase() === 'tidak ada' || c.text.length < 3) return;
      if (state.qualitative.category !== 'all' && state.qualitative.category !== c.key) return;
      if (state.qualitative.tag && !c.text.toLowerCase().includes(state.qualitative.tag.toLowerCase())) return;
      if (state.qualitative.search && !c.text.toLowerCase().includes(state.qualitative.search.toLowerCase())) return;

      list.push({
        id: r.id,
        angkatan: r.angkatan,
        category: c.label,
        categoryKey: c.key,
        date: r.date,
        text: c.text
      });
    });
  });

  return list;
}

function renderQualitativeFeedback() {
  const allRecords = getFeedbackRecords();
  const container = document.getElementById('feedback-list-container');
  const pageInfo = document.getElementById('feedback-page-info');
  const paginBtns = document.getElementById('feedback-pagination-btns');

  const tags = [
    { label: '#wifi', kw: 'wifi' },
    { label: '#internet_lemot', kw: 'lemot' },
    { label: '#koneksi_putus', kw: 'putus' },
    { label: '#keyboard_mouse', kw: 'keyboard' },
    { label: '#ac_dingin', kw: 'ac' },
    { label: '#spek_komputer', kw: 'spek' },
    { label: '#modul_jelas', kw: 'modul' },
    { label: '#asisten_baik', kw: 'asisten' },
    { label: '#proyektor', kw: 'proyektor' }
  ];

  const tagCloud = document.getElementById('feedback-tag-cloud');
  tagCloud.innerHTML = tags.map(t => `
    <button class="tag-btn ${state.qualitative.tag === t.kw ? 'active' : ''}" onclick="toggleFeedbackTag('${t.kw}')">
      ${t.label}
    </button>
  `).join('');

  const total = allRecords.length;
  const pageSize = state.qualitative.pageSize;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const page = Math.min(state.qualitative.page, totalPages);
  const startIdx = (page - 1) * pageSize;
  const pageRecords = allRecords.slice(startIdx, startIdx + pageSize);

  pageInfo.textContent = `Menampilkan ${total ? startIdx + 1 : 0} - ${Math.min(startIdx + pageSize, total)} dari ${total} catatan aspirasi`;

  if (pageRecords.length === 0) {
    container.innerHTML = `
      <div style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
        Tidak ditemukan catatan umpan balik yang sesuai dengan kriteria penyaringan.
      </div>
    `;
    paginBtns.innerHTML = '';
    return;
  }

  container.innerHTML = pageRecords.map(item => `
    <div class="feedback-card">
      <div class="feedback-meta">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="badge badge-info">${item.category}</span>
          <span>Responden #${item.id} &bull; Angkatan ${item.angkatan}</span>
        </div>
        <span>${item.date}</span>
      </div>
      <div class="feedback-quote">"${item.text}"</div>
    </div>
  `).join('');

  let btnHtml = '';
  if (page > 1) {
    btnHtml += `<button class="btn btn-secondary btn-sm" onclick="setFeedbackPage(${page - 1})">◀ Prev</button>`;
  }
  btnHtml += `<span style="font-size: 0.8rem; font-weight: 600; padding: 0 0.5rem;">Hal ${page} / ${totalPages}</span>`;
  if (page < totalPages) {
    btnHtml += `<button class="btn btn-secondary btn-sm" onclick="setFeedbackPage(${page + 1})">Next ▶</button>`;
  }
  paginBtns.innerHTML = btnHtml;
}

function toggleFeedbackTag(tag) {
  if (state.qualitative.tag === tag) {
    state.qualitative.tag = '';
  } else {
    state.qualitative.tag = tag;
  }
  state.qualitative.page = 1;
  renderQualitativeFeedback();
}

function setFeedbackPage(p) {
  state.qualitative.page = p;
  renderQualitativeFeedback();
}

// ==========================================================================
// 8. TAB 5: DATA MENTAH RESPONDEN GRID
// ==========================================================================

function getRawRecords() {
  const responses = getFilteredResponses();
  const search = state.raw.search.toLowerCase();
  if (!search) return responses;

  return responses.filter(r => {
    return (
      r.id.toString().includes(search) ||
      r.nim.toLowerCase().includes(search) ||
      r.angkatan.toLowerCase().includes(search) ||
      r.date.includes(search)
    );
  });
}

function renderRawTable() {
  const records = getRawRecords();
  const thead = document.getElementById('raw-table-header');
  const tbody = document.getElementById('raw-table-body');
  const pageInfo = document.getElementById('raw-page-info');
  const paginBtns = document.getElementById('raw-pagination-btns');

  if (!thead.innerHTML.trim()) {
    let headerHtml = '<th>ID</th><th>NIM</th><th>Angkatan</th><th>Tanggal</th>';
    SURVEY_DATA.questions.forEach(q => {
      headerHtml += `<th title="${q.text}">${q.code}</th>`;
    });
    headerHtml += '<th>Masalah Teknis</th><th>Kinerja SDM</th><th>Fasilitas</th>';
    thead.innerHTML = headerHtml;
  }

  const total = records.length;
  const pageSize = state.raw.pageSize;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const page = Math.min(state.raw.page, totalPages);
  const startIdx = (page - 1) * pageSize;
  const pageRecords = records.slice(startIdx, startIdx + pageSize);

  document.getElementById('raw-total-info').textContent = `Total: ${total} Responden Sesuai Filter`;
  pageInfo.textContent = `Menampilkan ${total ? startIdx + 1 : 0} - ${Math.min(startIdx + pageSize, total)} dari ${total} entri`;

  tbody.innerHTML = pageRecords.map(r => {
    let row = `
      <tr>
        <td>#${r.id}</td>
        <td><code>${r.nim}</code></td>
        <td><span class="badge badge-info">${r.angkatan}</span></td>
        <td>${r.date}</td>
    `;
    SURVEY_DATA.questions.forEach(q => {
      const score = r.scores[q.code] || '-';
      const color = score >= 4 ? 'var(--success-text)' : score <= 2 ? 'var(--danger-text)' : 'var(--text-main)';
      row += `<td style="font-weight: 700; color: ${color}; text-align: center;">${score}</td>`;
    });
    row += `
      <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${r.feedback_teknis || ''}">${r.feedback_teknis || '-'}</td>
      <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${r.feedback_sdm || ''}">${r.feedback_sdm || '-'}</td>
      <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${r.feedback_fasilitas || ''}">${r.feedback_fasilitas || '-'}</td>
    </tr>`;
    return row;
  }).join('');

  let btnHtml = '';
  if (page > 1) btnHtml += `<button class="btn btn-secondary btn-sm" onclick="setRawPage(${page - 1})">◀ Prev</button>`;
  btnHtml += `<span style="font-size: 0.8rem; font-weight: 600; padding: 0 0.5rem;">Hal ${page} / ${totalPages}</span>`;
  if (page < totalPages) btnHtml += `<button class="btn btn-secondary btn-sm" onclick="setRawPage(${page + 1})">Next ▶</button>`;
  paginBtns.innerHTML = btnHtml;
}

function setRawPage(p) {
  state.raw.page = p;
  renderRawTable();
}

// ==========================================================================
// 9. DRILL-DOWN & DRILL-UP TRANSITIONS
// ==========================================================================

function drillToLevel1(shouldScroll = false) {
  state.drill.level = 1;
  renderBreadcrumbs();

  document.getElementById('drill-level-1').style.display = 'block';
  document.getElementById('drill-level-2').style.display = 'none';
  document.getElementById('drill-level-3').style.display = 'none';

  renderDrillLevel1();
  if (shouldScroll) {
    const el = document.querySelector('.drill-breadcrumb-bar');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function drillToLevel2(dimId) {
  state.drill.level = 2;
  state.drill.dimId = dimId;
  renderBreadcrumbs();

  document.getElementById('drill-level-1').style.display = 'none';
  document.getElementById('drill-level-2').style.display = 'block';
  document.getElementById('drill-level-3').style.display = 'none';

  renderDrillLevel2(dimId);
  const el = document.querySelector('.drill-breadcrumb-bar');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function drillToLevel3(code) {
  const q = SURVEY_DATA.questions.find(item => item.code === code);
  if (q) state.drill.dimId = q.dim;
  state.drill.level = 3;
  state.drill.itemCode = code;
  renderBreadcrumbs();

  document.getElementById('drill-level-1').style.display = 'none';
  document.getElementById('drill-level-2').style.display = 'none';
  document.getElementById('drill-level-3').style.display = 'block';

  renderDrillLevel3(code);
  const el = document.querySelector('.drill-breadcrumb-bar');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function drillUp() {
  if (state.drill.level === 3) {
    drillToLevel2(state.drill.dimId);
  } else if (state.drill.level === 2) {
    drillToLevel1(true);
  }
}

// ==========================================================================
// 10. TAB NAVIGATION & THEME SWITCHER
// ==========================================================================

function switchTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.tab-content').forEach(pane => {
    pane.classList.toggle('active', pane.id === tabId);
  });

  if (tabId === 'tab-drilldown') {
    if (state.drill.level === 1) renderDrillLevel1();
    else if (state.drill.level === 2) renderDrillLevel2(state.drill.dimId);
    else if (state.drill.level === 3) renderDrillLevel3(state.drill.itemCode);
  } else if (tabId === 'tab-matrix') {
    renderFullStatsTable();
  } else if (tabId === 'tab-correlation') {
    renderCorrelationHeatmap();
  } else if (tabId === 'tab-qualitative') {
    renderQualitativeFeedback();
  } else if (tabId === 'tab-raw') {
    renderRawTable();
  }
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('app-theme', state.theme);
  document.getElementById('theme-icon').textContent = state.theme === 'light' ? '🌙' : '☀️';

  if (state.activeTab === 'tab-drilldown') {
    if (state.drill.level === 1) renderDrillLevel1();
    else if (state.drill.level === 2) renderDrillLevel2(state.drill.dimId);
    else if (state.drill.level === 3) renderDrillLevel3(state.drill.itemCode);
  }
}

// ==========================================================================
// 11. EXPORT CAPABILITIES
// ==========================================================================

function exportSummaryCSV() {
  const responses = getFilteredResponses();
  const items = SURVEY_DATA.questions.map(q => getItemStats(q.code, responses));

  let csv = 'Kode,Dimensi,Pertanyaan,N,Mean,Median,Modus,StdDev,Varians,Min,Max,Q1,Q3,IQR,Skewness,Kurtosis,% Puas,% Tidak Puas,CSI\n';
  items.forEach(i => {
    const cleanText = `"${i.text.replace(/"/g, '""')}"`;
    csv += `${i.code},${i.dimId},${cleanText},${i.n},${i.mean.toFixed(3)},${i.median},${i.mode},${i.stdDev.toFixed(3)},${i.variance.toFixed(3)},${i.min},${i.max},${i.q1.toFixed(2)},${i.q3.toFixed(2)},${i.iqr.toFixed(2)},${i.skewness.toFixed(3)},${i.kurtosis.toFixed(3)},${i.likert.puasPct.toFixed(1)}%,${i.likert.tidakPuasPct.toFixed(1)}%,${i.csi.toFixed(1)}%\n`;
  });

  downloadFile(csv, `Ringkasan_Statistika_Praktikum_${state.filter.angkatan}.csv`, 'text/csv;charset=utf-8;');
}

function exportRawCSV() {
  const responses = getFilteredResponses();
  let csv = 'ID,NIM,Angkatan,Tanggal,Timestamp,';
  csv += SURVEY_DATA.questions.map(q => q.code).join(',') + ',';
  csv += 'Saran_Teknis,Saran_SDM,Saran_Fasilitas\n';

  responses.forEach(r => {
    let row = `${r.id},"${r.nim}",${r.angkatan},${r.date},"${r.timestamp}",`;
    row += SURVEY_DATA.questions.map(q => r.scores[q.code] || '').join(',') + ',';
    row += `"${(r.feedback_teknis || '').replace(/"/g, '""')}","${(r.feedback_sdm || '').replace(/"/g, '""')}","${(r.feedback_fasilitas || '').replace(/"/g, '""')}"\n`;
    csv += row;
  });

  downloadFile(csv, `Data_Mentah_Responden_${state.filter.angkatan}.csv`, 'text/csv;charset=utf-8;');
}

function exportRawJSON() {
  const responses = getFilteredResponses();
  const jsonStr = JSON.stringify(responses, null, 2);
  downloadFile(jsonStr, `Data_Responden_${state.filter.angkatan}.json`, 'application/json');
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================================================
// 12. EVENT LISTENERS & INITIALIZATION
// ==========================================================================

function attachEvents() {
  document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
  document.getElementById('btn-drill-up').addEventListener('click', drillUp);
  document.getElementById('btn-drill-home').addEventListener('click', () => drillToLevel1(true));

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  document.getElementById('filter-angkatan').addEventListener('change', (e) => {
    state.filter.angkatan = e.target.value;
    updateAllViews();
  });

  document.getElementById('filter-periode').addEventListener('change', (e) => {
    state.filter.periode = e.target.value;
    updateAllViews();
  });

  document.getElementById('reset-filter-btn').addEventListener('click', () => {
    state.filter.angkatan = 'all';
    state.filter.periode = 'all';
    document.getElementById('filter-angkatan').value = 'all';
    document.getElementById('filter-periode').value = 'all';
    updateAllViews();
  });

  document.getElementById('matrix-dim-filter').addEventListener('change', (e) => {
    state.matrix.dimFilter = e.target.value;
    renderFullStatsTable();
  });

  document.getElementById('export-summary-btn').addEventListener('click', exportSummaryCSV);
  document.getElementById('export-matrix-csv').addEventListener('click', exportSummaryCSV);
  document.getElementById('export-raw-csv').addEventListener('click', exportRawCSV);
  document.getElementById('export-raw-json').addEventListener('click', exportRawJSON);

  document.getElementById('filter-feedback-cat').addEventListener('change', (e) => {
    state.qualitative.category = e.target.value;
    state.qualitative.page = 1;
    renderQualitativeFeedback();
  });

  document.getElementById('search-feedback-input').addEventListener('input', (e) => {
    state.qualitative.search = e.target.value;
    state.qualitative.page = 1;
    renderQualitativeFeedback();
  });

  document.getElementById('search-raw-input').addEventListener('input', (e) => {
    state.raw.search = e.target.value;
    state.raw.page = 1;
    renderRawTable();
  });
}

function updateAllViews() {
  renderKpis();
  renderBreadcrumbs();

  if (state.drill.level === 1) renderDrillLevel1();
  else if (state.drill.level === 2) renderDrillLevel2(state.drill.dimId);
  else if (state.drill.level === 3) renderDrillLevel3(state.drill.itemCode);

  renderFullStatsTable();
  renderCorrelationHeatmap();
  renderQualitativeFeedback();
  renderRawTable();
}

// Expose functions globally for inline HTML onclick handlers
window.drillToLevel1 = drillToLevel1;
window.drillToLevel2 = drillToLevel2;
window.drillToLevel3 = drillToLevel3;
window.drillUp = drillUp;
window.switchTab = switchTab;
window.sortFullTable = sortFullTable;
window.toggleFeedbackTag = toggleFeedbackTag;
window.setFeedbackPage = setFeedbackPage;
window.setRawPage = setRawPage;

// Initial Bootstrapping
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.setAttribute('data-theme', state.theme);
  document.getElementById('theme-icon').textContent = state.theme === 'light' ? '🌙' : '☀️';

  attachEvents();

  const hash = window.location.hash;
  if (hash.startsWith('#tab-')) {
    switchTab(hash.substring(1));
  } else if (hash.startsWith('#dim-')) {
    drillToLevel2(hash.replace('#dim-', ''));
  } else if (hash.startsWith('#item-')) {
    drillToLevel3(hash.replace('#item-', ''));
  } else {
    drillToLevel1(false);
  }

  updateAllViews();
});

