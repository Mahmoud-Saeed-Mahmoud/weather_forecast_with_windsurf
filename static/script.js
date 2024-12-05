let totalScore = 0;
const achievements = {
    'explorer': { name: 'Weather Explorer', description: 'Check weather for 5 different cities', progress: 0, required: 5 },
    'storm_chaser': { name: 'Storm Chaser', description: 'Find a thunderstorm', achieved: false },
    'snow_seeker': { name: 'Snow Seeker', description: 'Find a snowy location', achieved: false }
};

const checkedCities = new Set();

async function checkWeather() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    
    if (!city) return;

    try {
        const response = await fetch('/get_weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ city })
        });

        const data = await response.json();

        if (data.success) {
            updateWeatherDisplay(data.weather, city);
            updateScore(data.points);
            checkAchievements(data.weather);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching weather data!');
    }
}

function updateWeatherDisplay(weather, city) {
    const weatherResult = document.getElementById('weatherResult');
    const cityName = document.getElementById('cityName');
    const temperature = document.getElementById('temperature');
    const weatherDescription = document.getElementById('weatherDescription');
    const pointsEarned = document.getElementById('pointsEarned');
    const weatherIcon = document.getElementById('weatherIcon');

    weatherResult.classList.remove('d-none');
    cityName.textContent = city;
    temperature.textContent = `${Math.round(weather.main.temp)}°C`;
    weatherDescription.textContent = weather.weather[0].description;
    
    // Set weather emoji based on condition
    const weatherType = weather.weather[0].main;
    const weatherEmojis = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Snow': '❄️',
        'Thunderstorm': '⛈️',
        'Drizzle': '🌦️',
        'Mist': '🌫️'
    };
    weatherIcon.textContent = weatherEmojis[weatherType] || '🌈';
}

function updateScore(points) {
    totalScore += points;
    document.getElementById('totalScore').textContent = totalScore;
    
    const pointsEarned = document.getElementById('pointsEarned');
    pointsEarned.textContent = `+${points} points!`;
    pointsEarned.style.animation = 'none';
    pointsEarned.offsetHeight; // Trigger reflow
    pointsEarned.style.animation = null;
}

function checkAchievements(weather) {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();

    // Check for new city
    if (!checkedCities.has(city)) {
        checkedCities.add(city);
        achievements.explorer.progress++;
    }

    // Check weather-specific achievements
    if (weather.weather[0].main === 'Thunderstorm' && !achievements.storm_chaser.achieved) {
        achievements.storm_chaser.achieved = true;
    }
    if (weather.weather[0].main === 'Snow' && !achievements.snow_seeker.achieved) {
        achievements.snow_seeker.achieved = true;
    }

    updateAchievementsDisplay();
}

function updateAchievementsDisplay() {
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = '';

    for (const [key, achievement] of Object.entries(achievements)) {
        const achievementElement = document.createElement('div');
        achievementElement.className = 'col-md-4';
        achievementElement.innerHTML = `
            <div class="achievement ${achievement.achieved ? 'achieved' : ''}">
                <h5>${achievement.name}</h5>
                <p>${achievement.description}</p>
                ${achievement.progress !== undefined 
                    ? `<div class="progress">
                         <div class="progress-bar" role="progressbar" 
                              style="width: ${(achievement.progress/achievement.required)*100}%">
                           ${achievement.progress}/${achievement.required}
                         </div>
                       </div>`
                    : `<p>${achievement.achieved ? '✅ Completed!' : '🔒 Locked'}</p>`
                }
            </div>
        `;
        achievementsList.appendChild(achievementElement);
    }
}

// Theme handling
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Update body classes for Bootstrap
    document.body.classList.remove(`bg-${currentTheme === 'dark' ? 'dark' : 'light'}`);
    document.body.classList.remove(`text-${currentTheme === 'dark' ? 'light' : 'dark'}`);
    document.body.classList.add(`bg-${newTheme === 'dark' ? 'dark' : 'light'}`);
    document.body.classList.add(`text-${newTheme === 'dark' ? 'light' : 'dark'}`);
}

// Initialize theme
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.getElementById('checkbox').checked = savedTheme === 'light';
    
    // Set initial body classes
    document.body.classList.add(`bg-${savedTheme === 'dark' ? 'dark' : 'light'}`);
    document.body.classList.add(`text-${savedTheme === 'dark' ? 'light' : 'dark'}`);
});

// Add theme toggle event listener
document.getElementById('checkbox').addEventListener('change', toggleTheme);

// Initialize achievements display
updateAchievementsDisplay();
