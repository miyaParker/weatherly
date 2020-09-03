const staticWeather="dev-wather-app-v1"
const assets=[
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./images/celcius.svg",
    "./images/clearskyDay.svg",
    "./images/clearskyNight.svg",
    "./images/detective.png",
    "./images/fewcloudsDay.svg",
    "./images/fewcloudsNight.svg",
    "./images/mist.svg",
    "./images/rain.svg",
    "./images/scatteredclouds.svg",
    "./images/search.png",
    "./images/showerrain.svg",
    "./images/snow.svg",
    "./images/spinner.svg",
    "./images/thunderstorm.svg",
    "./images/zoom.png",
]

self.addEventListener("install", installEvent=>{
    installEvent.waitUntil(
        caches.open(staticWeather).then(cache=>{
            cache.addAll(assets)
        })
    )
})

self.addEventListener("fetch", fetchEvent=>{
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res=>{
            return res|| fetch(fetchEvent.request)
        })
    )
})