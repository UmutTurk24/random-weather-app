const express = require('express');
const expressHandlebars = require('express-handlebars');
const unirest = require("unirest"); // For retrieving the geo-location
const { Navigator } = require("node-navigator");
const navigator = new Navigator();
const request = require('request');

const port = 3000;
const app = express();

// app.engine('handlebars', expressHandlebars({
//     defaultLayout: 'main',
// }))

const weather_data = function (req, res, next) {
    navigator.geolocation.getCurrentPosition((success, error) => {
        if (error) console.error(error);
        else{
            var latitude = success.latitude;
            var longitude = success.longitude;

            // Get the current location (city/town name)
            var request_url = 'https://api-bdc.net/data/reverse-geocode?latitude=' + latitude + '&longitude=' + longitude + '&localityLanguage=en&key=bdc_6d69005a593841fc8312a576ddb14a06';
            var result = request( request_url, { json: true }, (err, res, body) => {
                if (err) { return console.log(err); }
                // console.log(body.locality); // get the town

                // Get the weather information in the current location
                var request_url2 = 'https://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude +'&appid=f5495a71a4b6e683120cbc8b11b3b556';
                var result2 = request( request_url2, { json: true }, (err, res, body1) => {
                    if (err) { return console.log(err); }
                    // console.log(body1);
                    const ret_value = [latitude, longitude, body.locality, body1];
                    // console.log(ret_value);
                    req.weather_data = ret_value;
                    next();
                    // return ret_value;
                    // https://openweathermap.org/img/wn/10d@2x.png // GETTING THE ICON
                });
            });
        }
    });
}

app.use(weather_data);

app.get('/',  (req, res) => {
    const cur_data = req.weather_data;
    console.log(cur_data);
})

app.listen(port, () => {
    console.log( `Express started on http://localhost:${port}` +
      '; press Ctrl-C to terminate.' )
})