// ==========================================
// 1. THREE.JS 3D TELESCOPE BACKGROUND ENGINE
// ==========================================
let scene, camera, renderer, starField, nebulaParticles;
let mouseX = 0, mouseY = 0;
let targetScrollY = 0;

function init3DSpace() {
    console.log('1. init3DSpace called');

    const canvas = document.getElementById('space-canvas');
    console.log('2. canvas element:', canvas);
    if (!canvas) return;

    console.log('3. THREE available?', typeof THREE);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 400;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    console.log('4. renderer created:', renderer);

    // A. Create Starfield Particles
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 2500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 1200;
        starPositions[i + 1] = (Math.random() - 0.5) * 1200;
        starPositions[i + 2] = (Math.random() - 0.5) * 1200;

        // Phosphor Green + White star variations
        const isGreen = Math.random() > 0.75;
        starColors[i] = isGreen ? 0.49 : 0.9;     // R
        starColors[i + 1] = isGreen ? 1.0 : 0.9;  // G
        starColors[i + 2] = isGreen ? 0.62 : 0.9; // B
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starsMaterial = new THREE.PointsMaterial({
    size: 8,
    vertexColors: true,
    transparent: true,
    opacity: 1.0
    });

    starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // B. Create Nebular Cloud Particles
    const nebulaGeometry = new THREE.BufferGeometry();
    const nebulaCount = 600;
    const nebulaPositions = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount * 3; i += 3) {
        nebulaPositions[i] = (Math.random() - 0.5) * 800;
        nebulaPositions[i + 1] = (Math.random() - 0.5) * 800;
        nebulaPositions[i + 2] = (Math.random() - 0.5) * 500;
    }

    nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
    const nebulaMaterial = new THREE.PointsMaterial({
        size: 6.0,
        color: 0x7FFFA0,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
    });

    nebulaParticles = new THREE.Points(nebulaGeometry, nebulaMaterial);
    scene.add(nebulaParticles);

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onWindowScroll);

    console.log('5. calling animate3D');
    animate3D();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
}

function onWindowScroll() {
    targetScrollY = window.scrollY;
}

function animate3D() {
    requestAnimationFrame(animate3D);

    // Continuous subtle space movement
    starField.rotation.y += 0.0004;
    nebulaParticles.rotation.y -= 0.0002;

    // Interactive Mouse parallax
    camera.position.x += (mouseX - camera.position.x) * 0.03;
    camera.position.y += (-mouseY - camera.position.y) * 0.03;

    // Scroll-triggered Telescope depth zoom (traveling through space)
    camera.position.z = 400 - (targetScrollY * 0.15);
    starField.rotation.x = targetScrollY * 0.0003;

    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

// ==========================================
// 2. SCROLL REVEAL INTERSECTION OBSERVER
// ==========================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));
}

// Initialize 3D Space + Scroll Reveal on Load (single registration)
console.log('6. DOMContentLoaded listener about to be registered');
document.addEventListener('DOMContentLoaded', () => {
    console.log('7. DOMContentLoaded fired!');
    init3DSpace();
    initScrollReveal();
});

// ==========================================
// 3. APPLICATION & PLOTLY ENGINE LOGIC
// ==========================================
let currentData = null;

function analyzeStar() {
    const starInput = document.getElementById('starName').value.trim();
    const missionInput = document.getElementById('missionSelect').value;
    const errorDiv = document.getElementById('error');
    errorDiv.innerText = '';

    if (!starInput) {
        errorDiv.innerText = 'SYS_ERR: Target identifier required.';
        return;
    }

    fetchLightCurve(starInput, missionInput);
}

function presetSearch(target, mission) {
    document.getElementById('starName').value = target;
    document.getElementById('missionSelect').value = mission;
    analyzeStar();
}

async function fetchLightCurve(starName, mission) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerText = `📡 FETCHING TELEMETRY // MISSION: ${mission.toUpperCase()} // TARGET: ${starName}...`;

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/analyze?target=${encodeURIComponent(starName)}&mission=${encodeURIComponent(mission)}`);

        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errJson = JSON.parse(errorText);
                throw new Error(errJson.error || `HTTP_ERR_${response.status}`);
            } catch {
                throw new Error(`HTTP_ERR_${response.status} — Check Flask server process.`);
            }
        }

        const data = await response.json();
        errorDiv.innerText = '';
        currentData = data;

        document.getElementById('view-toggles').style.display = 'flex';
        switchView('folded');
        renderStats(data);

    } catch (error) {
        console.error('Error fetching light curve telemetry:', error);
        renderError(error.message);
    }
}

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

function renderFoldedChart(data) {
    const rawTrace = {
        x: data.time_points,
        y: data.flux_points,
        mode: 'markers',
        type: 'scatter',
        name: 'RAW FLUX DATA',
        marker: { size: 3, color: '#7FFFA0', opacity: 0.35 }
    };

    const binnedTrace = {
        x: data.binned_time,
        y: data.binned_flux,
        mode: 'lines',
        type: 'scatter',
        name: 'BINNED MODEL',
        line: { color: '#FFB000', width: 2.5 }
    };

    const layout = {
        title: {
            text: `[ ${data.target.toUpperCase()} ] PHASE-FOLDED TRANSIT — PERIOD: ${data.period} DAYS`,
            font: { family: 'JetBrains Mono, monospace', color: '#E8E6DC', size: 14 }
        },
        paper_bgcolor: 'rgba(18, 23, 33, 0)',
        plot_bgcolor: '#0B0E14',
        margin: { t: 50, b: 50, l: 60, r: 30 },
        xaxis: {
            title: { text: 'PHASE (DAYS)', font: { family: 'JetBrains Mono, monospace', color: '#64748B', size: 11 } },
            tickfont: { family: 'JetBrains Mono, monospace', color: '#E8E6DC', size: 10 },
            gridcolor: '#1E293B',
            zerolinecolor: '#1E293B'
        },
        yaxis: {
            title: { text: 'NORMALIZED FLUX', font: { family: 'JetBrains Mono, monospace', color: '#64748B', size: 11 } },
            tickfont: { family: 'JetBrains Mono, monospace', color: '#E8E6DC', size: 10 },
            gridcolor: '#1E293B',
            zerolinecolor: '#1E293B'
        },
        legend: {
            font: { family: 'JetBrains Mono, monospace', color: '#E8E6DC', size: 10 },
            bgcolor: '#121721',
            bordercolor: '#1E293B',
            borderwidth: 1
        },
        hovermode: 'closest',
        responsive: true
    };

    Plotly.newPlot('chart', [rawTrace, binnedTrace], layout, { displayModeBar: false });
}

function renderBlsChart(data) {
    const blsTrace = {
        x: data.bls_periods,
        y: data.bls_powers,
        mode: 'lines',
        type: 'scatter',
        name: 'BLS POWER SPECTRUM',
        line: { color: '#7FFFA0', width: 1.8 }
    };

    const layout = {
        title: {
            text: `[ ${data.target.toUpperCase()} ] BOX-FITTING LEAST SQUARES (BLS) PERIODOGRAM`,
            font: { family: 'JetBrains Mono, monospace', color: '#E8E6DC', size: 14 }
        },
        paper_bgcolor: 'rgba(18, 23, 33, 0)',
        plot_bgcolor: '#0B0E14',
        margin: { t: 50, b: 50, l: 60, r: 30 },
        xaxis: {
            title: { text: 'PERIOD (DAYS)', font: { family: 'JetBrains Mono, monospace', color: '#64748B', size: 11 } },
            tickfont: { family: 'JetBrains Mono, monospace', color: '#E8E6DC', size: 10 },
            gridcolor: '#1E293B',
            zerolinecolor: '#1E293B'
        },
        yaxis: {
            title: { text: 'POWER SPECTRUM', font: { family: 'JetBrains Mono, monospace', color: '#64748B', size: 11 } },
            tickfont: { family: 'JetBrains Mono, monospace', color: '#E8E6DC', size: 10 },
            gridcolor: '#1E293B',
            zerolinecolor: '#1E293B'
        },
        hovermode: 'closest',
        responsive: true
    };

    Plotly.newPlot('chart', [blsTrace], layout, { displayModeBar: false });
}

function renderStats(data) {
    const statsGrid = document.getElementById('stats-grid');
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${data.period} d</div>
            <div class="stat-label">ORBITAL_PERIOD</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.planet_radius} R⊕</div>
            <div class="stat-label">EST_PLANET_RADIUS</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.transit_depth}%</div>
            <div class="stat-label">TRANSIT_DEPTH</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.transit_duration} hrs</div>
            <div class="stat-label">TRANSIT_DURATION</div>
        </div>
    `;
}

function renderError(errorMessage) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerText = `SYS_ALERT // ERROR: ${errorMessage}`;
}