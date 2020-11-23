<?php
    
    //get the city from the request
    $city = $_GET['city'];
    //openweathermap api key
    $OWM_KEY = "758637736095f794a0fca6f164dedd06";

    //Define the URL
    $request = 'api.openweathermap.org/data/2.5/weather?q='.$city.',nz&appid='.$OWM_KEY.'&mode=xml&units=metric';
    
    //initialise the connection for the given URL 
    $connection = curl_init($request);

    //configure the connection
    curl_setopt($connection, CURLOPT_RETURNTRANSFER, true);
    
    //make the request and get the response 
    $response = curl_exec($connection);
    
    //close the connection 
    curl_close($connection);
    
    //return the response 
    echo $response;