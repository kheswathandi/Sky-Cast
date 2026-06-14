const apiKey = "8b8ce6ffa7c5f347d962do7b74bc0tb0";
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const day = days[date.getDay()];
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${hours}:${minutes}`;
}

function weatherMood(description) {
  const d = description.toLowerCase();
  if (d.includes("thunder") || d.includes("storm"))
    return "Stay safe and indoors ⛈️";
  if (d.includes("rain") || d.includes("drizzle"))
    return "Take an umbrella today ☔";
  if (d.includes("snow")) return "Bundle up, it's snowy! ❄️";
  if (d.includes("fog") || d.includes("mist"))
    return "Drive carefully in the fog 🌫️";
  if (d.includes("cloud")) return "A cozy cloudy day ☁️";
  if (d.includes("clear") || d.includes("sunny"))
    return "Perfect weather for a walk 🌞";
  return "Have a wonderful day ✨";
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️ Good Morning";
  if (hour < 18) return "🌤️ Good Afternoon";
  return "🌙 Good Evening";
}

function setLoading(isLoading) {
  const cityInput = document.querySelector("#city-input");
  const submitBtn = document.querySelector("#search-btn");
  const locationBtn = document.querySelector("#location-btn");
  cityInput.disabled = isLoading;
  submitBtn.disabled = isLoading;
  locationBtn.disabled = isLoading;
  
}

function displayWeather(response) {
  const weather = response.data;
  document.querySelector("#city").textContent = weather.city;
  document.querySelector("#temperature").textContent = Math.round(
    weather.temperature.current,
  );
  document.querySelector("#description").textContent =
    weather.condition.description;
  document.querySelector("#humidity").textContent =
    `${weather.temperature.humidity}%`;
  document.querySelector("#wind").textContent =
    `${Math.round(weather.wind.speed)} km/h`;
  document.querySelector("#date-time").textContent = formatDate(
    weather.time * 1000,
  );
  document.querySelector("#weather-mood").textContent = weatherMood(
    weather.condition.description,
  );

  const icon = document.querySelector("#icon");
  icon.src = weather.condition.icon_url;
  icon.alt = weather.condition.description;

  document.querySelector("#results").classList.remove("hidden");
}

function displayForecast(response) {
  const forecastEl = document.querySelector("#forecast");
  const daily = response.data.daily;

  // Skip index 0 (today) and show the next 5 days
  forecastEl.innerHTML = daily
    .slice(1, 6)
    .map(function (day) {
      const date = new Date(day.time * 1000);
      const dayName = shortDays[date.getDay()];
      const high = Math.round(day.temperature.maximum);
      const low = Math.round(day.temperature.minimum);
      const icon = day.condition.icon_url;
      const desc = day.condition.description;

      return `
      <div class="forecast-card">
        <p class="forecast-day">${dayName}</p>
        <img class="forecast-icon" src="${icon}" alt="${desc}" />
        <p class="forecast-high">${high}°</p>
        <p class="forecast-low">${low}°</p>
      </div>
    `;
    })
    .join("");
}

function searchCity(city) {
  document.querySelector("#city").textContent = "Loading...";

  const currentUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}`;
  const forecastUrl = `https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${apiKey}`;

  // Fetch current weather and forecast in parallel
  return Promise.all([
    axios.get(currentUrl).then(displayWeather),
    axios.get(forecastUrl).then(displayForecast),
  ]).catch(function () {
    document.querySelector("#city").textContent = "—";
    alert("City not found. Please try another city.");
  });
}

function searchByCoordinates(lat, lon) {
  document.querySelector("#city").textContent = "Locating...";

  const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=10`;

  return axios
    .get(geocodeUrl, { headers: { "Accept-Language": "en" } })
    .then(function (response) {
      const address = response.data.address;

      const city =
        address.city ||
        address.town ||
        address.municipality ||
        address.city_district ||
        address.village ||
        address.suburb ||
        address.state_district ||
        address.county;

      if (!city) throw new Error("No city found in geocode response.");

      const cityInput = document.querySelector("#city-input");
      cityInput.value = city;

      return searchCity(city);
    })
    .catch(function (err) {
      console.error("Geocode error:", err);
      document.querySelector("#city").textContent = "—";
      alert(
        "Could not detect your city automatically.\n" +
          "Tip: Your browser may be using your IP instead of GPS.\n" +
          "Please type your city name manually.",
      );
    });
}

function handleSubmit(event) {
  event.preventDefault();
  const cityInput = document.querySelector("#city-input");
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }
  setLoading(true);
  searchCity(city).finally(() => setLoading(false));
}

function handleLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }
  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude, longitude } = position.coords;
      searchByCoordinates(latitude, longitude).finally(() => setLoading(false));
    },
    function (error) {
      setLoading(false);
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Location access was denied. Please allow it in your browser settings and try again.",
        );
      } else {
        alert(
          "Unable to retrieve your location. Please try searching manually.",
        );
      }
    },
    // Request high accuracy GPS rather than IP-based location
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
}

function updateGreeting() {
  document.querySelector("#greeting").textContent = getGreeting();
}
updateGreeting();
setInterval(updateGreeting, 60000);

document.querySelector("#search-form").addEventListener("submit", handleSubmit);
document
  .querySelector("#location-btn")
  .addEventListener("click", handleLocation);

searchCity("Durban");function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}
 
function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }
}
 
document.querySelector("#theme-toggle").addEventListener("click", function () {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});
 
initTheme();
