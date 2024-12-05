from flask import Flask, render_template, request, jsonify
from decouple import config
import requests
import json

app = Flask(__name__)

# Get API key from environment variable
API_KEY = config('OPENWEATHER_API_KEY')
BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

# Game points system
WEATHER_POINTS = {
    'Clear': 10,
    'Rain': 5,
    'Clouds': 7,
    'Snow': 15,
    'Thunderstorm': 20
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_weather', methods=['POST'])
def get_weather():
    try:
        data = request.get_json()
        city = data.get('city')
        
        # Make API call to OpenWeatherMap
        params = {
            'q': city,
            'appid': API_KEY,
            'units': 'metric'
        }
        
        response = requests.get(BASE_URL, params=params)
        weather_data = response.json()
        
        if response.status_code == 200:
            weather_main = weather_data['weather'][0]['main']
            points = WEATHER_POINTS.get(weather_main, 1)
            
            return jsonify({
                'success': True,
                'weather': weather_data,
                'points': points,
                'message': f'You earned {points} points for checking {city} weather!'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'City not found!'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
