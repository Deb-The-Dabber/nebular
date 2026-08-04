from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import lightkurve as lk
import warnings

warnings.filterwarnings(
    "ignore",
    message=".*tpfmodel submodule.*"
)

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze', methods=['GET'])
def analyze_star():
    target = request.args.get('target', 'Kepler-10')

    try:
        search = lk.search_lightcurve(target, mission = 'Kepler', author = "Kepler", quarter=1, cadence='long')
        if len(search) == 0:
            return jsonify({"error": "No light curve data found for the specified target."}), 404
        lc = search.download()

        cleaned_lc = lc.remove_nans().remove_outliers(sigma=5).flatten(window_length=401)
        periodogram = cleaned_lc.to_periodogram(method='bls', minimum_period=0.5, maximum_period=15)
        best_period = periodogram.period_at_max_power.value
        folded_lc = cleaned_lc.fold(period=best_period)

        time_points = folded_lc.time.value.tolist()
        flux_points = folded_lc.flux.value.tolist()

        return jsonify({
            "target": target,
            "period": round(best_period, 4),
            "time_points": time_points,
            "flux_points": flux_points
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)