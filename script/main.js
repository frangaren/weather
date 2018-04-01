/*
 *  Model
 */

function Day (date, icon, minTemperature, maxTemperature) {
  this.date = date;
  this.icon = icon;
  this.temperature = {
    minimum: minTemperature,
    maximum: maxTemperature,
  }
}

/*
 *  Controller
 */

function Controller() {
  const API_KEY = 'vhBfT2oWhuYUoMQJVHyA3q57xTsX7C48';
  var lastLatitude = NaN;
  var lastLongitude = NaN;
  var locationKey = NaN;
  var locationName = null;
  var lastCheckDate = null;

  this.view = null;
  this.forecasts = null;

  function requestLocationData(latitude, longitude, callback) {
    var url = 'http://dataservice.accuweather.com/locations/v1/cities/' +
              'geoposition/search?apikey=' + API_KEY + '&q=' + latitude +
              ',' + longitude + '&language=es-es&details=true';
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        var result = JSON.parse(this.responseText);
        callback(result);
      }
    };
    request.open('GET', url, true);
    request.send();
  }

  function requestForecastData(callback) {
    var url = 'http://dataservice.accuweather.com/forecasts/v1/daily/5day/' +
              locationKey + '?apikey=' + API_KEY + '&language=es-es';
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        var result = JSON.parse(this.responseText);
        callback(result);
      }
    };
    request.open('GET', url, true);
    request.send();
  }

  function iconIndexToName(index) {
    if (index <= 5) return 'sunny';
    else if (index <= 8) return 'cloudy';
    else if (index == 11) return 'foggy';
    else if (index <= 13) return 'rainy';
    else if (index == 14) return 'rainy-sunny';
    else if (index <= 17) return 'stormy';
    else if (index == 18) return 'rainy';
    else if (index <= 29) return 'snowy';
    else if (index <= 31) return 'error';
    else if (index == 32) return 'windy';
    else if (index <= 37) return 'sunny';
    else if (index == 38) return 'cloudy';
    else if (index <= 40) return 'rainy';
    else if (index <= 42) return 'stormy';
    else if (index <= 44) return 'snowy';
    else return error;
  }

  function setForecastData(forecastData) {
    console.log(forecastData);
    this.forecasts = [];
    for (var dailyForecast of forecastData.DailyForecasts) {
      var date = new Date(dailyForecast.Date);
      var icon = iconIndexToName(dailyForecast.Day.Icon);
      var minTemperature = dailyForecast.Temperature.Minimum.Value;
      if (dailyForecast.Temperature.Minimum.UnitType == 18) {
        minTemperature = (minTemperature - 32) * 5 / 9;
      } else if (dailyForecast.Temperature.Minimum.UnitType == 19) {
        minTemperature = minTemperature - 273.15;
      }
      minTemperature = Math.round(minTemperature);
      var maxTemperature = dailyForecast.Temperature.Maximum.Value;
      if (dailyForecast.Temperature.Maximum.UnitType == 18) {
        maxTemperature = (maxTemperature - 32) * 5 / 9;
      } else if (dailyForecast.Temperature.Maximum.UnitType == 19) {
        maxTemperature = maxTemperature - 273.15;
      }
      maxTemperature = Math.round(maxTemperature);
      var forecast = new Day(date, icon, minTemperature, maxTemperature);
      this.forecasts.push(forecast);
    }
    lastCheckDate = Date.now();
    this.renderView();
  }

  function setLocationData(locationData) {
    locationName = locationData.LocalizedName;
    locationKey = locationData.Details.Key;
    lastLatitude = locationData.GeoPosition.Latitude;
    lastLongitude = locationData.GeoPosition.Longitude;
    requestForecastData(setForecastData.bind(this));
  }

  this.update = function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (lastLatitude != position.coords.latitude ||
          lastLongitude != position.coords.longitude) {
          requestLocationData(position.coords.latitude,
            position.coords.longitude, setLocationData.bind(this));
        } else {
          requestForecastData(setForecastData.bind(this));
        }
      });
    }
  }

  this.save = function () {
    if (window.localStorage) {
      window.localStorage.setItem('lastCheckDate', lastCheckDate);
      window.localStorage.setItem('lastLatitude', lastLatitude);
      window.localStorage.setItem('lastLongitude', lastLongitude);
      window.localStorage.setItem('locationName', locationName);
      window.localStorage.setItem('locationKey', locationKey);
      window.localStorage.setItem('forecasts', JSON.stringify(this.forecasts));
    }
  }

  this.load = function() {
    if (window.localStorage) {
      if (window.localStorage.getItem('lastCheckDate') == null) return;
      lastCheckDate = new Date(window.localStorage.getItem('lastCheckDate'));
      lastLatitude = +window.localStorage.getItem('lastLatitude');
      lastLongitude = +window.localStorage.getItem('lastLongitude');
      locationName = window.localStorage.getItem('locationName');
      locationKey = window.localStorage.getItem('locationKey');
      var forecasts = JSON.parse(window.localStorage.getItem('forecasts'));
      this.forecasts = [];
      for (var forecast of forecasts) {
        this.forecasts.push(new Day(new Date(forecast.date), forecast.icon,
          forecast.temperature.minimum, forecast.temperature.maximum));
      }
      this.renderView();
    }
  }

  this.renderView = function () {
    this.view.setLocation(locationName);
    for (var i in this.forecasts) {
      this.view.dayViews[i].setIcon(this.forecasts[i].icon);
      this.view.dayViews[i].setTemperature(
        this.forecasts[i].temperature.minimum,
        this.forecasts[i].temperature.maximum);
      this.view.dayViews[i].setDate(this.forecasts[i].date);
    }
  }
}

/*
 *  View
 */

function DayView(root) {
  var iconField = root.querySelector('.forecast-icon');
  var temperatureField = root.querySelector('.forecast-text .forecast-temperature');
  var dateField = root.querySelector('.forecast-text .forecast-day');

  this.setIcon = function (name) {
    var icon = null;
    switch (name) {
      case 'sunny':
        icon = '🌞';
        break;
      case 'cloudy':
        icon = '⛅';
        break;
      case 'foggy':
        icon = '🌁';
        break;
      case 'rainy':
        icon = '🌧';
        break;
      case 'rainy-sunny':
        icon = '🌦';
        break;
      case 'stormy':
        icon = '⛈';
        break;
      case 'snowy':
        icon = '🌨';
        break;
      case 'windy':
        icon = '🌬'
        break;
      default:
        icon = '❗';
        break;
    }
    iconField.innerHTML = icon;
  }

  this.setTemperature = function (minimum, maximum) {
    temperatureField.innerHTML = minimum + '/' + maximum + 'ºC';
  }

  this.setDate = function (date) {
    var dateFormat = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    dateField.innerHTML = date.toLocaleDateString(undefined, dateFormat);
  }
}

function View(controller) {
  this.dayViews = null;
  var locationField = null;

  controller.view = this;

  window.onload = () => {
    this.dayViews = [];
    this.dayViews.push(new DayView(document.querySelector('#forecast-today')));
    var days = document.querySelectorAll('#forecast-5-day li');
    for (var day of days) {
      this.dayViews.push(new DayView(day));
    }
    locationField = document.querySelector('#location');
    controller.load();
  }

  window.onbeforeunload = () => {
    controller.save();
    return null;
  }

  this.setLocation = function (location) {
    locationField.innerHTML = location;
  }

  this.update = function () {
    controller.update();
  }
}



view = new View(new Controller);
