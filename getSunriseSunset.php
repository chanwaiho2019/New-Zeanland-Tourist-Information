<?php
    //Get the latitude and longitude from request
    $lat = $_GET['lat'];
    $lng = $_GET['lng'];

    //Define the URL
    $request = 'https://api.sunrise-sunset.org/json?lat='.$lat.'&lng='.$lng.'&date=today';
    
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