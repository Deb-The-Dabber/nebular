async function fetchLightCurve(starName) {
    try{
        const response = await fetch(`http://127.0.0.1:5000/api/analyze?target=${encodeURIComponent(starName)}`)
        const data = await response.json()

        if (data.error) {
            throw new Error(data.error)
        }

        console.log(`Detected Period for ${data.target}: ${data.period} days`)
        renderChart(data.time_points, data.flux_points, data.target, data.period)
    } catch (error) {
        console.error('Error fetching light curve data:', error)
        renderError(error.message)
    }
}

function presetSearch(target) {
    document.getElementById('starName').value = target;
    analyzeStar();
}

// Function called when user clicks the "Analyze" button
function analyzeStar() {
    const starInput = document.getElementById('starName').value.trim();
    const errorDiv = document.getElementById('error');
    errorDiv.innerText = ''; // Clear previous errors

    if (!starInput) {
        errorDiv.innerText = 'Please enter a valid star name.';
        return;
    }

    // Call your backend API function
    fetchLightCurve(starInput);
}

async function fetchLightCurve(starName) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerText = 'Fetching and processing light curve data...';

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/analyze?target=${encodeURIComponent(starName)}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        errorDiv.innerText = ''; // Clear loading message
        console.log(`Detected Period for ${data.target}: ${data.period} days`);
        
        renderChart(data.time_points, data.flux_points, data.target, data.period);

    } catch (error) {
        console.error('Error fetching light curve data:', error);
        renderError(error.message);
    }
}

function renderChart(timePoints, fluxPoints, targetName, period) {
    const trace = {
        x: timePoints,
        y: fluxPoints,
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 3,
            color: '#007bff',
            opacity: 0.5
        },
        name: targetName
    };

    const layout = {
        title: `${targetName} Folded Light Curve — Best Period: ${period} days`,
        xaxis: { title: 'Phase (days)' },
        yaxis: { title: 'Normalized Flux' },
        hovermode: 'closest'
    };

    Plotly.newPlot('chart', [trace], layout);
}

function renderError(errorMessage) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerText = `⚠️ Error: ${errorMessage}`;
}