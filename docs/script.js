// Function called when user clicks the "Analyze" button
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

// Function called when user clicks quick preset buttons (e.g. Kepler-10)
function presetSearch(target) {
    document.getElementById('starName').value = target;
    analyzeStar();
}

// Fetch light curve data from the Flask API
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
        console.log(`Detected Period for ${data.target}: ${data.period} days`);
        
        renderChart(data.time_points, data.flux_points, data.target, data.period);

    } catch (error) {
        console.error('Error fetching light curve data:', error);
        renderError(error.message);
    }
}

// Render Plotly scatter plot with dark-space styling
function renderChart(timePoints, fluxPoints, targetName, period) {
    const trace = {
        x: timePoints,
        y: fluxPoints,
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 3,
            color: '#38bdf8',
            opacity: 0.6
        },
        name: targetName
    };

    const layout = {
        title: {
            text: `${targetName} Folded Light Curve — Best Period: ${period} days`,
            font: { color: '#f8fafc', size: 16 }
        },
        paper_bgcolor: '#0f172a',
        plot_bgcolor: '#0f172a',
        xaxis: { 
            title: { text: 'Phase (days)', font: { color: '#94a3b8' } },
            tickfont: { color: '#94a3b8' },
            gridcolor: '#1e293b',
            zerolinecolor: '#475569'
        },
        yaxis: { 
            title: { text: 'Normalized Flux', font: { color: '#94a3b8' } },
            tickfont: { color: '#94a3b8' },
            gridcolor: '#1e293b',
            zerolinecolor: '#475569'
        },
        hovermode: 'closest',
        responsive: true
    };

    Plotly.newPlot('chart', [trace], layout);
}

function renderError(errorMessage) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerText = `⚠️ Error: ${errorMessage}`;
}