from flask import Flask, request, jsonify
from flask_cors import CORS
import lightkurve as lk
import numpy as np
import warnings
#f
warnings.filterwarnings("ignore", message=".*tpfmodel submodule.*")

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze', methods=['GET'])
def analyze_star():
    target = request.args.get('target', 'Kepler-10')
    mission = request.args.get('mission', 'Kepler')  # Kepler or TESS

    try:
        # Search Lightkurve based on chosen mission
        search = lk.search_lightcurve(target, mission=mission)
        if len(search) == 0:
            return jsonify({"error": f"No data found for '{target}' in the {mission} mission archive."}), 404
        
        lc = search[0].download()

        cleaned_lc = lc.remove_nans().remove_outliers(sigma=5).flatten(window_length=401)
        
        # BLS Periodogram calculation
        periodogram = cleaned_lc.to_periodogram(method='bls', minimum_period=0.5, maximum_period=15)
        
        best_period = float(periodogram.period_at_max_power.value)
        best_depth = float(periodogram.depth_at_max_power.value)
        best_duration = float(periodogram.duration_at_max_power.value)

        # Derived metrics with NaN safety
        depth_val = max(0, best_depth) if not np.isnan(best_depth) else 0.0
        planet_radius_earth = round(109.1 * np.sqrt(depth_val), 2)
        depth_percentage = round(depth_val * 100, 3)
        transit_hours = round(best_duration * 24, 2) if not np.isnan(best_duration) else 0.0

        # Folded light curve
        folded_lc = cleaned_lc.fold(period=best_period)
        binned_lc = folded_lc.bin(time_bin_size=0.01).remove_nans()

        return jsonify({
            "target": target,
            "mission": mission,
            "period": round(best_period, 4),
            "transit_depth": depth_percentage,
            "transit_duration": transit_hours,
            "planet_radius": planet_radius_earth,
            # Folded Light Curve Data
            "time_points": folded_lc.time.value.tolist(),
            "flux_points": folded_lc.flux.value.tolist(),
            "binned_time": binned_lc.time.value.tolist(),
            "binned_flux": binned_lc.flux.value.tolist(),
            # BLS Periodogram Data
            "bls_periods": periodogram.period.value.tolist(),
            "bls_powers": periodogram.power.value.tolist()
        })
    except Exception as e:
        print(f"Backend Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)