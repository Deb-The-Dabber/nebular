import warnings

warnings.filterwarnings(
    "ignore",
    message=".*tpfmodel submodule.*"
)

import lightkurve as lk
import matplotlib.pyplot as plt
import numpy as np



TARGET = "Kepler-10"
# Download the light curve data for Kepler-10
search = lk.search_lightcurve(TARGET, mission='Kepler', author = "Kepler", quarter=1, cadence='long')

print(search)



lc = search.download()

cleaned_lc = lc.remove_nans().remove_outliers(sigma=5).flatten(window_length=401)

periodogram = cleaned_lc.to_periodogram(method='bls', minimum_period=0.5, maximum_period=15)
best_period = periodogram.period_at_max_power
print(f"Best period: {best_period.value:.4f} days")

folded_lc = cleaned_lc.fold(period=best_period)

time_points = folded_lc.time.value.tolist()
flux_points = folded_lc.flux.value.tolist()
plt.plot(time_points, flux_points, 'o')
plt.xlabel('Time (days)')
plt.ylabel('Flux')
plt.title(f'Folded Light Curve - Best Period: {best_period.value:.4f} days')
plt.show()