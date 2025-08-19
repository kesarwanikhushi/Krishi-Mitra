import os
import json
import csv
from datetime import datetime

def load_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)

def load_csv(path):
    with open(path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

def get_file_mtime(path):
    return datetime.utcfromtimestamp(os.path.getmtime(path)).strftime('%a, %d %b %Y %H:%M:%S GMT')

def get_etag(path):
    return str(os.path.getmtime(path))

# Loader functions for each data type

def load_weather_sample(data_dir):
    path = os.path.join(data_dir, 'weather.json')
    return load_json(path), get_file_mtime(path), get_etag(path)

def load_advisory_sample(data_dir):
    path = os.path.join(data_dir, 'advisories.json')
    return load_json(path), get_file_mtime(path), get_etag(path)

def load_market_sample(data_dir):
    path = os.path.join(data_dir, 'market.json')
    return load_json(path), get_file_mtime(path), get_etag(path)

def load_soil_sample(data_dir):
    path = os.path.join(data_dir, 'soil.json')
    return load_json(path), get_file_mtime(path), get_etag(path)
