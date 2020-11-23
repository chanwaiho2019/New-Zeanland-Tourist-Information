//store the leaflet map
var map;
//A list to store cities for recent search
var city_list = [];
//Current city
var city;
//mapquest api key
const MAPQUEST_KEY = "pyjiYU8xaneNlUkNAjlVjVSGTSyPkdGJ";

//A function to initialize the leaflet map
function initializeMap() {
    //set view to Hamilton initially
    map = L.map('map').setView([-37.78333, 175.28333], 8);

    //Add a tile layer to the map
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 10,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoid2FpaG8iLCJhIjoiY2tiNGhnd2hoMHZkMTJ2cDdoc2s2cW4xNyJ9.boBiSwr0h_JAnWFT4_Uc_g'
    }).addTo(map);
}

//center the map to a location
function centerMap(lat, lng) {
    map.setView([lat, lng], 10);
}

//initialize the map
initializeMap();

//Constructor function for City object
function City(name, lat, lng) {
    var _name = name;
    var _lat = lat;
    var _lng = lng;

    //A getter method for city name
    this.getName = function() {
        return _name;
    }

    //A getter method for the latitude of city
    this.getLat = function() {
        return _lat;
    }

    //A getter function for the longitude of city
    this.getLng = function() {
        return _lng;
    }
}

//Get the user input from the textfield and call geocode method
function processUserInput() {
    //Cast the user input to lower case
    // city = document.getElementById('textfield').value.toLowerCase();
    city = $('#textfield').val().toLowerCase(); //using jQuery 

    //get the latlng of city
    geocode(city);
}

//Request the lat, lon for a city from mapquest api and create a city object and store in the list
function geocode(city) {
    fetch('http://www.mapquestapi.com/geocoding/v1/address?key='+MAPQUEST_KEY+'&location='+city+',NZ&outFormat=json')
            .then(res => res.json())
            .then(result => {
                //Retrieve the latLng from json object
                var latLng = result.results[0].locations[0].latLng;

                //Recenter the map
                centerMap(latLng.lat, latLng.lng);

                //get the Sunrise sunset info
                getSunriseSunsetInfo(latLng.lat, latLng.lng);

                //get the weather info
                getWeather(city);

                //change the background color of info-container to white
                $('#info-container')[0].style.backgroundColor = 'white';

                //check if the city already exists in recent search list
                if (!isDuplicate(city)) {
                    //create a city object
                    var newCity = new City(city, latLng.lat, latLng.lng);

                    //add the city to the list
                    city_list.push(newCity);
                }

                //Display the list of recent searches
                displayRecentSearch();
            });      
}

//Display the cities in the city_list
function displayRecentSearch() {
    // var recent_search_list = document.getElementById('recent-search-list');
    var recent_search_list = $('#recent-search-list')[0]; //using jQuery to get the html dom object

    //clear the items of the ul tag
    while (recent_search_list.firstChild){
        recent_search_list.removeChild(recent_search_list.firstChild);

    }

    //iterate through the city list
    for (let i = 0; i < city_list.length; i++){
        var city_capitalLetter = city_list[i].getName().charAt(0).toUpperCase() + city_list[i].getName().slice(1);
        
        //create an item
        var item = document.createElement('li');
        item.innerHTML = city_capitalLetter;
        item.addEventListener('click', function(){
                //update the current city variable
                city = city_list[i].getName();

                //recenter the map
                centerMap(city_list[i].getLat(), city_list[i].getLng());

                //get the up-to-date sunrise sunset info
                getSunriseSunsetInfo(city_list[i].getLat(), city_list[i].getLng());

                //get the up-to-date weather indo
                getWeather(city);
            });
        // recent_search_list.appendChild(item);
        recent_search_list.append(item); //using jQuery
    }
}

//check duplicates of the city list, return true if the city already exists in the list, else false
function isDuplicate(city) {
    for (let i = 0; i < city_list.length; i++){
        if (city_list[i].getName().localeCompare(city) == 0){
            return true;
        }
    }
    return false;
}

//Get the sunrise sunset info by using fetch to a php script, which will use cURL to get the data from the api
function getSunriseSunsetInfo(lat, lng) {
    fetch('/course_html/assignment3/getSunriseSunset.php?lat='+lat+'&lng='+lng, {   
        method: 'get',
    })
    .then(res => res.json())
    .then(result => {
        //convert the sunrise time 
        var sunrise_time = convertTime(result.results.sunrise);

        //conver the sunset time
        var sunset_time = convertTime(result.results.sunset);

        //Display the sunrise sunset info in the html
        displaySunriseSunset(sunrise_time, sunset_time);
    });      

}

//Convert the UTC time to NZ local time
function convertTime(time) {
    //get current date
    var today = new Date();
    var day = String(today.getDate());
    var month = String(today.getMonth() + 1);
    var year = String(today.getFullYear());

    //generate a useful format of date for later use
    today = month + '/' + day + '/' + year;
    
    //concatenate with time 
    date_time = today + " " + time + " UTC";

    //create a new date object
    var date = new Date(date_time);

    //convert to local time
    time_converted = date.toLocaleTimeString();

    return time_converted;
}

//Display the sunrise sunset time in the html
function displaySunriseSunset(sunrise, sunset) {
    var sunrise_sunset = document.getElementById('sunrise-sunset-info');
    
    //Make the city name with capital first letter
    var city_capitalLetter = city.charAt(0).toUpperCase() + city.slice(1);

    //display city name
    $('#city').text(city_capitalLetter);

    //display sunrise data
    var sunrise_text = 'Sunrise: ' + sunrise;
    $('#sunrise').text(sunrise_text);

    //display sunset data
    var sunset_text = 'Sunset: ' + sunset;
    $('#sunset').text(sunset_text);
    
    // //generate the required text
    // var text = city_capitalLetter + " currently: Sun rises at " + sunrise + " and sets at " + sunset;
    
    // //Put the text in the element
    // sunrise_sunset.innerHTML = text; 
}

//get the weather info by using ajax request to php, which will request the data from openweathermap api
function getWeather(city){
    ajaxRequest("GET", "getWeather.php?city="+city, "", displayWeather);
}

function displayWeather(response) {
    //get the elements
    var weather_el = document.getElementById('weather');
    var min_temp_el = document.getElementById('min-temp');
    var max_temp_el = document.getElementById('max-temp');
    var humidity_el = document.getElementById('humidity');

    //get the weather from the xml response
    var weather = response.getElementsByTagName('weather')[0].getAttribute('value');
    
    //get the min temperature from the xml response
    var min_temp = response.getElementsByTagName('temperature')[0].getAttribute('min');
   
    //get the max temperature from the xml response
    var max_temp = response.getElementsByTagName('temperature')[0].getAttribute('max');
   
    //get the humidity from the xml response
    var humidity = response.getElementsByTagName('humidity')[0].getAttribute('value') + response.getElementsByTagName('humidity')[0].getAttribute('unit');
    
    //Set the text of each element
    weather_el.innerHTML = "Weather: " + weather;
    min_temp_el.innerHTML = "Min temperature: " + min_temp + "&deg;C";
    max_temp_el.innerHTML = "Max temperature: " + max_temp + "&deg;C";
    humidity_el.innerHTML = "Humidity: " + humidity;
}

//A function to make an ajax request
function ajaxRequest(method, url, data, callback) {
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    
    if (method == "POST"){
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    //set the response type as xml
    request.overrideMimeType('text/xml');

    request.onreadystatechange = function(){
        if (request.readyState == 4){
            if (request.status == 200){
                let response = request.responseXML;
                callback(response);
            }
            else{
                alert("Error: " + request.statusText);
            }
        }
    }
    request.send(data);
}




