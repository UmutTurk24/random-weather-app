const express = require('express');
const expressHandlebars = require('express-handlebars').engine;
const unirest = require("unirest"); // For retrieving the geo-location
const { Navigator } = require("node-navigator");
const request = require('request');
const { MongoClient } = require("mongodb");
const cookieParser = require('cookie-parser');

const navigator = new Navigator();
const app = express();
const port = 3000;
const db_name = "local_weather";

const d_url = 'mongodb+srv://umut1656:mycoolapp@cluster0.8w0gcuf.mongodb.net/?retryWrites=true&w=majority';

// const d_url = "mongodb+srv://umut1656:mycoolapp@clustername.mongodb.net/test?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true";
const client = new MongoClient(d_url);



app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts',
}))
app.set('view engine', 'handlebars')
app.use(express.static(__dirname + '/public'))



const weather_data = function (req, res, next) {
    navigator.geolocation.getCurrentPosition((success, error) => {
        if (error) console.error(error);
        else{
            var latitude = success.latitude;
            var longitude = success.longitude;

            // Get the current location (city/town name)
            var request_reverse_geolocation_url = 'https://api-bdc.net/data/reverse-geocode?latitude=' + latitude + '&longitude=' + longitude + '&localityLanguage=en&key=bdc_6d69005a593841fc8312a576ddb14a06';
            var result = request( request_reverse_geolocation_url, { json: true }, (err, res, body) => {
                if (err) { return console.log(err); }

                // Get the weather information in the current location
                var request_weather_info_url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude +'&appid=f5495a71a4b6e683120cbc8b11b3b556';
                var result2 = request( request_weather_info_url, { json: true }, (err, res, body1) => {
                    if (err) { return console.log(err); }

                    // Organize variables
                    var weather_description = body1.weather[0].description;
                    const icon_type = body1.weather[0].icon;
                    const town_name = body.locality;
                    const temperature = Math.ceil(body1.main.temp - 273);
                    const temperature_min = Math.ceil(body1.main.temp_min - 273);
                    const temperature_max = Math.ceil(body1.main.temp_max - 273);

                    // Format decription string
                    const words = weather_description.split(" ");
                    for (let i = 0; i < words.length; i++) {
                        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
                    }
                    weather_description = words.join(" ");


                    const ret_value = [temperature, town_name, weather_description, icon_type, temperature_min, temperature_max];
                    req.weather_data = ret_value;
                    next();
                });
            });
        }
    });
}

app.use(weather_data);
app.use(cookieParser());

app.get('/',  (req, res, next) => {
    const cur_data = req.weather_data;
    const db_data = add_get_data(cur_data).catch(console.dir);
    db_data.then((success) => {
        console.log(success);
        res.render('app', {layout : 'main', page_data: success});

    })
    
    // console.log(cur_data);
})

async function run_database() {
    try {
        // Connection Establisher
        await client.connect();
        console.log("Connected correctly to server");
        
    } catch (err) {
        console.log(err.stack);
    }
    finally {
        // await client.close();
    }
}

async function add_get_data(cur_data) {
    try {
        const db = client.db(db_name);
        const col = db.collection("weather_entries");

        let client_info = {
            "temperature": cur_data[0],
            "town": cur_data[1],                                                                                                                                 
            "weather_d": cur_data[2],                                                                                                                                
            "icon": cur_data[3],
            "temperature_max": cur_data[4],
            "temperature_min": cur_data[5],
        }
        const p = await col.insertOne(client_info);
        const myDoc = await col.find().limit(9).sort({$natural:-1}).toArray(function (err, data) {
            // console.log(data);
        });
        return myDoc;
        // Print to the console
        // console.log(myDoc);
    } catch (err) {
        console.log(err.stack);
    }
}

app.listen(port, () => {
    console.log( `Express started on http://localhost:${port}` +
      '; press Ctrl-C to terminate.' );
    run_database().catch(console.dir);
    
})