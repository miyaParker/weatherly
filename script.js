const query = selector => document.querySelector(selector)
const create = element => document.createElement(element)

var s,
    WeatherCard = {
        settings: {
            highlights: query('.highlights'),
            weatherParent: query('.weather'),
            locationParent: query('.location'),
            weather: query('.weather-data'),
            date: query('#date'),
            time: query('#time'),
            card: query('.weather'),
            dropdown: query('.dropdown'),
            spinner: query('.loading'),
            search: query('#search'),
            iconParent: query('.icon-parent'),
            error: query('#error'),
            locationFailed: query('.location-failed'),
            allowGeoBtn: query('#btn-allow'),
            loading: true
        },
        init() {
            s = this.settings
            this.bindEvents()
            this.updateTime()
            this.getCities()
            this.getLocation()

        },
        bindEvents() {
            s.dropdown.addEventListener('change', WeatherCard.getCityWeather)
            s.search.addEventListener('change', WeatherCard.getCityWeather)
            s.allowGeoBtn.addEventListener('click', WeatherCard.getLocation)
        },
        getCurrentTime() {
            const date = new Date
            const time = {
                hours: date.getHours(),
                minutes: date.getMinutes(),
                seconds: date.getSeconds()
            }
            let dateString = String(date).split(' ')
            let [dayOfWeek, month, day] = dateString
            const today = {
                dayOfWeek,
                month,
                day
            }
            view.init(time, today)
        },
        updateTime() {
            window.setInterval(WeatherCard.getCurrentTime, 1000)
        },
        getCities() {
            const url = `http://dataservice.accuweather.com/locations/v1/topcities/50?apikey=NXBrwtUK1gRd4qzjheWKVH3NTSisotV1&details=false`;
            fetch(url)
                .then(response => response.json())
                .then(view.loadCities)
                .catch(err => {
                    console.log(err)
                })
        },
        getLocation() {
            if (window.navigator.geolocation) {
                window.navigator.geolocation.getCurrentPosition(WeatherCard.locationSuccess, WeatherCard.locationFailed)
            }
        },
        locationFailed() {
            WeatherCard.showLoading(false)
            s.locationFailed.classList.remove('hidden')
        },
        locationSuccess({ coords: { latitude: lat, longitude: lon } }) {
            WeatherCard.getWeather(lat, lon)
        },
        getWeather(lat, lon) {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=fcf53cc4f5dd877e490e7a27ac3f83bd`;
            fetch(url)
                .then(response => response.json())
                .then(view.render)
                .catch(err => {
                    console.error(err)
                });
        },
        showLoading(loading) {
            if (!!loading && s.spinner.classList.value.includes('hidden')) {
                s.spinner.classList.remove('hidden')
            } else if (!!loading) {
                return;
            }
            else {
                s.spinner.classList.add('hidden')
            }
        },
        getCityWeather({ target }) {
            s.weather.innerText = ''
            s.iconParent.innerText = ''
            s.locationParent.innerText = ''
            WeatherCard.showLoading(true)
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${target.value}&appid=fcf53cc4f5dd877e490e7a27ac3f83bd&cnt=7`
            fetch(url)
                .then(WeatherCard.handleErrors)
                .then(response => response.json())
                .then(data => view.render(data))
                .catch(err => console.error(err.message))
        },
        handleErrors(response) {
            if (!response.ok) {
                switch (response.status) {
                    case 404:
                        WeatherCard.showError()
                        break;
                }
                throw Error(response.statusText)
            }
            return response
        },
        showError() {
            WeatherCard.showLoading(false)
            s.error.classList.remove('hidden')
        }
    }

const view = {
    icons: {
        '01d': './images/clearskyDay.svg',
        '02d': './images/fewcloudsDay.svg',
        '03d': './images/scatteredclouds.svg',
        '04d': './images/scatteredclouds.svg',
        '09d': './images/showerrain.svg',
        '10d': './images/rain.svg',
        '11d': './images/thunderstorm.svg',
        '13d': './images/snow.svg',
        '50d': './images/mist.svg',
        '01n': './images/clearskyNight.svg',
        '02n': './images/fewcloudsNight.svg',
        '03n': './images/scatteredclouds.svg',
        '04n': './images/scatteredclouds.svg',
        '09n': './images/showerrain.svg',
        '10n': './images/rain.svg',
        '11n': './images/thunderstorm.svg',
        '13n': './images/snow.svg',
        '50n': './images/mist.svg',
    },
    init(time, { dayOfWeek, day, month }) {
        s.date.innerText = `${dayOfWeek}, ${day} ${month}`
        WeatherCard.settings.time.innerText = `${String(time.hours).padStart(2, 0)} : ${String(time.minutes).padStart(2, 0)}`
    },
    render(data) {
        const dataset = {
            country: data.sys.country,
            city: data.name,
            altText: data.weather[0].main,
            temp: data.main.temp,
            description: data.weather[0].description,
            wind: data.wind.speed,
            humidity: data.main.humidity,
            pressure: data.main.pressure
        }
        let wind = create('span')
        wind.innerText = `${((+dataset.wind * 18) / 5).toFixed(2)} km/h`
        wind.classList.add('flex-item')
        s.highlights.appendChild(wind)

        let humidity = create('span')
        humidity.innerText = `${dataset.humidity} % `
        humidity.classList.add('flex-item')
        s.highlights.appendChild(humidity)

        let pressure = create('span')
        pressure.innerText = `${dataset.pressure} hPa `
        pressure.classList.add('flex-item')
        s.highlights.appendChild(pressure)

        let icon = create('img')
        icon.id = 'weather-icon'
        icon.src = view.icons[data.weather[0].icon]
        icon.alt = dataset.altText


        let location = create('span')
        location.id = 'location'
        location.innerText = `${dataset.city}, ${dataset.country}`

        let temp = create('span')
        temp.id = 'temp'
        temp.innerText = Math.round(+dataset.temp - 273.15)

        let desc = create('span')
        desc.id = 'description'
        desc.innerText = dataset.description

        let unit = create('sup')
        unit.innerText = '°C'
        temp.appendChild(unit)

        s.locationFailed.classList.add('hidden')
        s.error.classList.add('hidden')
        WeatherCard.showLoading(false)

        s.weather.appendChild(temp)
        s.iconParent.appendChild(icon)
        s.locationParent.appendChild(location)
        s.weather.appendChild(desc)
    },
    loadCities(cities) {
        cities.forEach(({ EnglishName: city }) => {
            let option = create('option')
            option.value = city
            option.innerText = city
            s.dropdown.appendChild(option)
        })
    }
}
function init() {
    WeatherCard.init()

}
init()
