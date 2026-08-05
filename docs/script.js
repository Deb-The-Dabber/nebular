// Store current global data object for chart switching
let currentData = null;

function analyzeStar() {
    const starInput = document.getElementById('starName').value.trim();
    const errorDiv = document.getElementById('error');
    errorDiv.innerText = '';

    if (!starInput) {
        errorDiv.innerText = 'Please enter a valid star name.';
        return;
    }

    fetchLightCurve(starInput);
}

function presetSearch(target) {
    document.getElementById('starName').value = target;
    analyzeStar();
}

async function fetchLightCurve(starName) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerText = '📡 Fetching and processing NASA light curve data...';

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/analyze?target=${encodeURIComponent(starName)}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        errorDiv.innerText = '';
        currentData = data; // Save dataset locally

        // Show toggle buttons
        document.getElementById('view-toggles').style.display = 'flex';
        
        // Render Folded Curve & Metadata Cards
        switchView('folded');
        renderStats(data);

    } catch (error) {
        console.error('Error fetching light curve data:', error);
        renderError(error.message);
    }
}

// Toggle between Folded Transit and BLS Periodogram
function switchView(viewType) {
    if (!currentData) return;

    const btnFolded = document.getElementById('btn-folded');
    const btnBls = document.getElementById('btn-bls');

    if (viewType === 'folded') {
        btnFolded.classList.add('active');
        btnBls.classList.remove('active');
        renderFoldedChart(currentData);
    } else {
        btnBls.classList.add('active');
        btnFolded.classList.remove('active');
        renderBlsChart(currentData);
    }
}

// Render Folded Light Curve Chart
function renderFoldedChart(data) {
    const rawTrace = {
        x: data.time_points,
        y: data.flux_points,
        mode: 'markers',
        type: 'scatter',
        name: 'Raw Flux',
        marker: { size: 3, color: '#38bdf8', opacity: 0.35 }
    };

    const binnedTrace = {
        x: data.binned_time,
        y: data.binned_flux,
        mode: 'lines',
        type: 'scatter',
        name: 'Binned Trend',
        line: { color: '#f43f5e', width: 2.5 }
    };

    const layout = {
        title: { text: `${data.target} Folded Light Curve — Best Period: ${data.period} days`, font: { color: '#f8fafc', size: 16 } },
        paper_bgcolor: '#0f172a',
        plot_bgcolor: '#0f172a',
        xaxis: { title: { text: 'Phase (days)', font: { color: '#94a3b8' } }, tickfont: { color: '#94a3b8' }, gridcolor: '#1e293b' },
        yaxis: { title: { text: 'Normalized Flux', font: { color: '#94a3b8' } }, tickfont: { color: '#94a3b8' }, gridcolor: '#1e293b' },
        hovermode: 'closest',
        responsive: true
    };

    Plotly.newPlot('chart', [rawTrace, binnedTrace], layout);
}

// Render BLS Periodogram Chart (Step 1c)
function renderBlsChart(data) {
    const blsTrace = {
        x: data.bls_periods,
        y: data.bls_powers,
        mode: 'lines',
        type: 'scatter',
        name: 'BLS Power',
        line: { color: '#a855f7', width: 2 }
    };

    const layout = {
        title: { text: `${data.target} Box-fitting Least Squares (BLS) Periodogram`, font: { color: '#f8fafc', size: 16 } },
        paper_bgcolor: '#0f172a',
        plot_bgcolor: '#0f172a',
        xaxis: { title: { text: 'Period (days)', font: { color: '#94a3b8' } }, tickfont: { color: '#94a3b8' }, gridcolor: '#1e293b' },
        yaxis: { title: { text: 'BLS Power Spectrum', font: { color: '#94a3b8' } }, tickfont: { color: '#94a3b8' }, gridcolor: '#1e293b' },
        hovermode: 'closest',
        responsive: true
    };

    Plotly.newPlot('chart', [blsTrace], layout);
}

// Render Metadata Cards (Step 1b)
function renderStats(data) {
    const statsGrid = document.getElementById('stats-grid');
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${data.period} d</div>
            <div class="stat-label">Orbital Period</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.planet_radius} R⊕</div>
            <div class="stat-label">Est. Planet Radius</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.transit_depth}%</div>
            <div class="stat-label">Transit Depth</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.transit_duration} hrs</div>
            <div class="stat-label">Transit Duration</div>
        </div>
    `;
}

function renderError(errorMessage) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerText = `⚠️ Error: ${errorMessage}`;
}