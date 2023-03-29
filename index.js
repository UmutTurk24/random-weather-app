const express = require('express');
const expressHandlebars = require('express-handlebars');
const unirest = require("unirest"); // For retrieving the geo-location
const { Navigator } = require("node-navigator");
const navigator = new Navigator();
const request = require('request');

const port = 3000;
const app = express();

app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main',
}))

const weather_data = function (req, res, next) {
    navigator.geolocation.getCurrentPosition((success, error) => {
        if (error) console.error(error);
        else{
            const latitude = success.latitude;
            const longitude = success.longitude;

            // Get the current location (city/town name)
            var request_reverse_geolocation_url = 'https://api-bdc.net/data/reverse-geocode?latitude=' + latitude + '&longitude=' + longitude + '&localityLanguage=en&key=bdc_6d69005a593841fc8312a576ddb14a06';
            var result = request( request_reverse_geolocation_url, { json: true }, (err, res, res_body1) => {
                // Return if API request failed
                if (err) { return console.log(err); }

                // Get the weather information in the current location
                var request_weather_info_url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude +'&appid=f5495a71a4b6e683120cbc8b11b3b556';
                var result2 = request( request_weather_info_url, { json: true }, (err, res, res_body2) => {
                    // Return if API request failed
                    if (err) { return console.log(err); }

                    // Organize variables
                    const town_name = res_body1.locality;
                    const icon_name = res_body2.weather[0].icon;
                    const weather_description = res_body2.weather[0].description;

                    var request_icon = 'https://openweathermap.org/img/wn/' + icon_name + '@2x.png';
                    var result3 = request( request_weather_info_url, { json: true }, (err, res, res_body3) => { 
                        if (err) { return console.log(err); }
                        const icon_pic = res_body3;
                        // Return the captured data
                        const ret_value = [latitude, longitude, town_name, icon_name, weather_description, icon_pic];
                        req.weather_data = ret_value;
                        next();
                    });                    
                });
            });
        }
    });
}

app.use(weather_data);

app.get('/',  (req, res) => {
    const cur_data = req.weather_data;
    // console.log(cur_data);
})

app.listen(port, () => {
    console.log( `Express started on http://localhost:${port}` +
      '; press Ctrl-C to terminate.' )
})