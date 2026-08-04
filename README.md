# Nebular 🌌

Nebular is a web application that fetches, processes, and displays astronomical light curve data from NASA's Kepler mission to detect exoplanet transits automatically.

Users can input any Kepler target star (e.g., `Kepler-10`, `Kepler-8`), and the application cleans the raw photometric data, runs a period search algorithm, folds the light curve around the detected orbital period, and renders an interactive plot in the browser.

---

## 🛠️ How It Works

1. **Data Retrieval**: Uses `lightkurve` to fetch long-cadence light curve data directly from NASA archives.
2. **Signal Cleaning**: Removes NaN values, filters out extreme outliers (sigma clipping), and flattens long-term stellar variability using a Savitzky-Golay filter.
3. **Period Detection**: Runs Box-fitting Least Squares (BLS) periodogram analysis to locate repeating transit dips and identify the candidate orbital period.
4. **Phase Folding**: Folds the time-series flux data over the detected period to reveal the transit signature centered at phase zero.
5. **Interactive Visualization**: Sends the processed time and flux series to a lightweight web interface powered by Flask and Plotly.js.

---

## 🏗️ Tech Stack

* **Backend**: Python, Flask, Flask-CORS
* **Astronomy Data Processing**: `lightkurve`, `numpy`, `astropy`, `matplotlib`
* **Frontend**: HTML5, JavaScript (ES6+), CSS3
* **Plotting**: Plotly.js

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Python 3.9+ installed on your machine.

### 1. Clone the Repository

```bash
git clone [https://github.com/Deb-The-Dabber/nebular.git](https://github.com/Deb-The-Dabber/nebular.git)
cd nebular

```

### 2. Set Up a Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

```

### 3. Install Dependencies

```bash
pip install flask flask-cors lightkurve numpy matplotlib

```

### 4. Run the Application

Start the Flask server:

```bash
python app.py

```

Then open `index.html` in your browser (or use VS Code Live Server). Enter a star name like **Kepler-10** or **Kepler-8** and hit **Analyze**.

---

## 📌 Example Targets to Test

* **Kepler-10**: Home to Kepler-10b, a rocky exoplanet with a fast ~0.837-day period.
* **Kepler-8**: Displays a prominent transit dip corresponding to a hot Jupiter with a ~3.52-day period.
* **Kepler-12**: Features a clear ~4.43-day orbital signal.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
