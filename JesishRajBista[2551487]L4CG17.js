// Date and Time 
function convertDateTime(dt, timezone) {
    dt = Number(dt);
    timezone = Number(timezone);

    if (isNaN(dt) || isNaN(timezone)) {
        return "Invalid date";
    }

    let utcMillis = dt * 1000;
    let localMillis = utcMillis + (timezone * 1000);
    let localDate = new Date(localMillis);

    let options = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    };

    return localDate.toLocaleString('en-US', options);
}


let searchBox = document.querySelector(".research input");
let searchBtn = document.querySelector(".research button");
let weatherIcon = document.querySelector(".weather-icon");

async function weather(city) {
    if (localStorage.when != null && parseInt(localStorage.when) + 10000 > Date.now()) {
        let freshness = Math.round((Date.now() - localStorage.when) / 1000) + " second(s)";

        document.querySelector(".city").innerHTML = localStorage.myCity;
        document.querySelector(".templ").innerHTML = localStorage.myTemperature;
        document.querySelector(".humidity").innerHTML = localStorage.myHumidity;
        document.querySelector(".wind").innerHTML = localStorage.myWind;
        document.querySelector(".pressure").innerHTML = localStorage.myPressure;
        document.querySelector(".climate").innerHTML = localStorage.myWeather;
        document.querySelector(".longitude").innerHTML = localStorage.myLongitude;
        document.querySelector(".latitude").innerHTML = localStorage.myLatitude;
        document.querySelector(".direction").innerHTML = localStorage.myDirection;
        document.querySelector(".datetime").innerHTML = localStorage.myDatetime;
        weatherIcon.src = localStorage.myIcon;

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";
        document.querySelector(".nothing").style.display = "block";
        document.querySelector(".climate").style.display = "block";
        document.querySelector(".datetime").style.display = "block";

        console.log("Loaded from cache (" + freshness + ")");
       
    } else {
        try {
            let response = await fetch(`http://localhost/prototype3/JesishRajBista[2551487]L4CG17.php?q=${city}`);

            if (!response.ok) throw new Error("HTTP error " + response.status);

            let contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                let raw = await response.text();
                throw new Error("Expected JSON, got: " + raw);
            }
            if (!response == 502) throw new Error ("")

            let data = await response.json();
            let weatherData = data[0];

            document.querySelector(".city").innerHTML = weatherData.City;
            document.querySelector(".templ").innerHTML = Math.floor(weatherData.Temperature) + "°C";
            document.querySelector(".humidity").innerHTML = weatherData.Humidity + " %";
            document.querySelector(".wind").innerHTML = weatherData.Wind + " M/s";
            document.querySelector(".pressure").innerHTML = weatherData.Pressure + " hPa";
            document.querySelector(".climate").innerHTML = "Weather: " + weatherData.Weather;
            document.querySelector(".longitude").innerHTML = "Lon: " + weatherData.Longitude;
            document.querySelector(".latitude").innerHTML = "Lat: " + weatherData.Latitude;
            document.querySelector(".direction").innerHTML = weatherData.Direction + "°";

            let formattedTime = convertDateTime(weatherData.dt, weatherData.timezone);
            document.querySelector(".datetime").innerHTML = formattedTime;

            let icon = weatherData.Icon;
            let iconURL = `http://openweathermap.org/img/w/${icon}.png`;
            weatherIcon.src = iconURL;

            document.querySelector(".weather").style.display = "block";
            document.querySelector(".error").style.display = "none";
            document.querySelector(".nothing").style.display = "block";
            document.querySelector(".climate").style.display = "block";
            document.querySelector(".datetime").style.display = "block";

            

            // Save to LocalStorage
            localStorage.myCity = weatherData.City;
            localStorage.myTemperature = Math.floor(weatherData.Temperature) + "°C";
            localStorage.myHumidity = weatherData.Humidity + " %";
            localStorage.myWind = weatherData.Wind + " M/s";
            localStorage.myPressure = weatherData.Pressure + " hPa";
            localStorage.myWeather = "Weather: " + weatherData.Weather;
            localStorage.myLongitude = "Lon: " + weatherData.Longitude;
            localStorage.myLatitude = "Lat: " + weatherData.Latitude;
            localStorage.myDirection = weatherData.Direction + "°";
            localStorage.myDatetime = formattedTime;
            localStorage.myIcon = iconURL;
            localStorage.when = Date.now();

            let cityKey = city.toLowerCase();
            let cityData = {
                City: weatherData.City,
                Temperature: Math.floor(weatherData.Temperature) + "°C",
                Humidity: weatherData.Humidity + " %",
                Wind: weatherData.Wind + " M/s",
                Pressure: weatherData.Pressure + " hPa",
                Weather: "Weather: " + weatherData.Weather,
                Longitude: "Lon: " + weatherData.Longitude,
                Latitude: "Lat: " + weatherData.Latitude,
                Direction: weatherData.Direction + "°",
                Datetime: formattedTime,
                Icon: iconURL,
                when: Date.now()
            }

            localStorage.setItem(cityKey, JSON.stringify(cityData));
            console.log(cityData);

            //converting object into JSON string:
            let stringData=JSON.stringify(cityData);
            console.log(stringData)
            localStorage.setItem("weather",stringData);

            let cityDatas = JSON.parse(localStorage.getItem("weather"));
            console.log(cityDatas)
            
            

        } catch (err) {
            console.log("Error fetching weather data:", err);


            let cityKey = city.toLowerCase();
            let cityData = null;

            if (localStorage.myCity && city.toLowerCase() === localStorage.myCity.toLowerCase()) {
                cityData = {
                    City: localStorage.myCity,
                    Temperature: localStorage.myTemperature,
                    Humidity: localStorage.myHumidity,
                    Wind: localStorage.myWind,
                    Pressure: localStorage.myPressure,
                    Weather: localStorage.myWeather,
                    Longitude: localStorage.myLongitude,
                    Latitude: localStorage.myLatitude,
                    Direction: localStorage.myDirection,
                    Datetime: localStorage.myDatetime,
                    Icon: localStorage.myIcon
                };


                 //converting object into JSON string:
                let stringData=JSON.stringify(cityData);
                console.log(stringData)
                localStorage.setItem("weather",stringData);
                let cityData = JSON.parse(localStorage.getItem("weather"));
                console.log(cityData)

            } else if (localStorage.getItem(cityKey)) {
                cityData = JSON.parse(localStorage.getItem(cityKey));
            }

            if (cityData) {
                document.querySelector(".city").innerHTML = cityData.City;
                document.querySelector(".templ").innerHTML = cityData.Temperature;
                document.querySelector(".humidity").innerHTML = cityData.Humidity;
                document.querySelector(".wind").innerHTML = cityData.Wind;
                document.querySelector(".pressure").innerHTML = cityData.Pressure;
                document.querySelector(".climate").innerHTML = cityData.Weather;
                document.querySelector(".longitude").innerHTML = cityData.Longitude;
                document.querySelector(".latitude").innerHTML = cityData.Latitude;
                document.querySelector(".direction").innerHTML = cityData.Direction;
                document.querySelector(".datetime").innerHTML = cityData.Datetime;
                weatherIcon.src = cityData.Icon;

                document.querySelector(".weather").style.display = "block";
                document.querySelector(".error").style.display = "none";
                document.querySelector(".nothing").style.display = "block";
                document.querySelector(".climate").style.display = "block";
                document.querySelector(".datetime").style.display = "block";

                console.log("Loaded cached data for " + city);
            } else {
                document.querySelector(".error").style.display = "block";
                document.querySelector(".weather").style.display = "none";
                document.querySelector(".nothing").style.display = "none";
                document.querySelector(".climate").style.display = "none";
                document.querySelector(".datetime").style.display = "none";
            }
        }
    }
}

// Button event listener
searchBtn.addEventListener("click", () => {
    weather(searchBox.value);
});

// Load default city on start
weather("sefton");



