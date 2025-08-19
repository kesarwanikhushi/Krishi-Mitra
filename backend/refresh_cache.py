import os
from loaders import load_weather_sample, load_advisory_sample, load_market_sample, load_soil_sample

def refresh_all(data_dir):
    weather, _, _ = load_weather_sample(data_dir)
    advisories, _, _ = load_advisory_sample(data_dir)
    market, _, _ = load_market_sample(data_dir)
    soil, _, _ = load_soil_sample(data_dir)
    # Here you could update in-memory cache, or trigger reloads in a running server
    print('Weather:', len(weather), 'records')
    print('Advisories:', len(advisories), 'records')
    print('Market:', len(market), 'records')
    print('Soil:', len(soil), 'records')

if __name__ == '__main__':
    DATA_DIR = os.path.join(os.path.dirname(__file__), '../data')
    refresh_all(DATA_DIR)
