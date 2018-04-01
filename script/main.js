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
      case 'sunny-rainy':
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

  window.onload = () => {
    this.dayViews = [];
    this.dayViews.push(new DayView(document.querySelector('#forecast-today')));
    var days = document.querySelectorAll('#forecast-5-day li');
    for (var day of days) {
      this.dayViews.push(new DayView(day));
    }
    for (var v of this.dayViews) {
      v.setIcon('sunny');
      v.setDate(new Date('12/27/2017'));
      v.setTemperature(-1, 10);
    }
  }
}



view = new View(new Controller);
