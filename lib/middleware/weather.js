
  
//   const weatherMiddleware = (req, res, next) => {
//     if(!res.locals.partials) res.locals.partials = {}
//     res.locals.partials.weatherContext = getWeatherData()
//     next()
//   }
const { Navigator } = require("node-navigator");
const navigator = new Navigator();
const request = require('request');

async function get_weather_data() {
    navigator.geolocation.getCurrentPosition((success, error) => {
        if (error) console.error(error);
        else{
            var latitude = success.latitude;
            var longitude = success.longitude;

            // Get the current location (city/town name)
            var request_url = 'https://api-bdc.net/data/reverse-geocode?latitude=' + latitude + '&longitude=' + longitude + '&localityLanguage=en&key=bdc_6d69005a593841fc8312a576ddb14a06';
            var result = request( request_url, { json: true }, (err, res, body) => {
                if (err) { return console.log(err); }
                console.log(body.locality); // get the town

                // Get the weather information in the current location
                var request_url2 = 'https://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude +'&appid=f5495a71a4b6e683120cbc8b11b3b556';
                var result2 = request( request_url2, { json: true }, (err, res, body1) => {
                    if (err) { return console.log(err); }
                    console.log(body1);
                    return [latitude, longitude, body.locality, body1];
                    // https://openweathermap.org/img/wn/10d@2x.png // GETTING THE ICON
                });
            });
        }
    });
}

const resss = await get_weather_data();
console.log("final" + resss);

const get_data = () => {
    // Get the geolocation (coordinates)
    const resultt = get_weather_data();
    console.log(resultt)
}

// const weather_middleware = (req, res, next) => {
//     if(!res.locals.partials) res.locals.partials = {}
//     res.locals.partials.weather_context = get_weather_data();
//     next();
// }

// module.exports = weather_middleware;
