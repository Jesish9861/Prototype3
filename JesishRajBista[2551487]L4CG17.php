<?php
// === CORS HEADERS (must be FIRST) ===
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
header('Content-Type: application/json');

// DB connection
$serverName = "localhost";
$userName = "root";
$password = "";
$conn = mysqli_connect($serverName, $userName, $password);

if (!$conn) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . mysqli_connect_error()]);
    exit;
}

// Create database
$createDatabase = "CREATE DATABASE IF NOT EXISTS prototype3";
if (!mysqli_query($conn, $createDatabase)) {
    http_response_code(500);
    echo json_encode(["error" => "Database creation failed: " . mysqli_error($conn)]);
    exit;
}

// Select the database
mysqli_select_db($conn, 'prototype3');

// Create table
$createTable = "CREATE TABLE IF NOT EXISTS weather ( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    City VARCHAR(100) NOT NULL,
    Temperature FLOAT NOT NULL,
    Pressure FLOAT NOT NULL,
    Humidity FLOAT NOT NULL,
    Wind FLOAT NOT NULL,
    Longitude FLOAT NOT NULL,
    Latitude FLOAT NOT NULL,
    Direction FLOAT NOT NULL,
    Weather VARCHAR(100) NOT NULL,
    Icon VARCHAR(100) NOT NULL,
    dt INT,
    timezone INT
)";
if (!mysqli_query($conn, $createTable)) {
    http_response_code(500);
    echo json_encode(["error" => "Table creation failed: " . mysqli_error($conn)]);
    exit;
}

//  get city
$cityName = isset($_GET['q']) ? mysqli_real_escape_string($conn, $_GET['q']) : "sefton";

// Fetch data from DB
$selectAllData = "SELECT * FROM weather WHERE City = '$cityName'";
$result = mysqli_query($conn, $selectAllData);
if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "DB read failed: " . mysqli_error($conn)]);
    exit;
}

$latestRow = mysqli_fetch_assoc($result);
$currentTime = time();
$needsUpdate = true;

if ($latestRow && isset($latestRow['dt'])) {
    $lastUpdated = $latestRow['dt'];
    if (($currentTime - $lastUpdated) < (2 * 60 * 60)) {
        // Data is fresh (under 2 hrs), return it
        echo json_encode([$latestRow]);
        exit;
    }
}

// Fetch from OpenWeatherMap API
$url = "http://api.openweathermap.org/data/2.5/weather?q=$cityName&appid=cb295e7c712f61412ee4d16aad637161&units=metric";
$response = @file_get_contents($url);

if ($response !== false) {
    $data = json_decode($response, true);

    if (isset($data['main'])) {
        $humidity = $data['main']['humidity'];
        $wind = $data['wind']['speed'];
        $pressure = $data['main']['pressure'];
        $latitude = $data['coord']['lat'];
        $longitude = $data['coord']['lon'];
        $direction = $data['wind']['deg'];
        $temperature = $data['main']['temp'];
        $city = mysqli_real_escape_string($conn, $data['name']);
        $weather = mysqli_real_escape_string($conn, $data['weather'][0]['description']);
        $icon = $data['weather'][0]['icon'];
        $dt = $data['dt'];
        $timezone = $data['timezone'];

        // Delete old data for this city (if exists)
        $deleteOld = "DELETE FROM weather WHERE City = '$city'";
        mysqli_query($conn, $deleteOld);

        // Insert new data
        $insertData = "INSERT INTO weather (Humidity, Wind, Pressure, Latitude, Longitude, Direction, City, Temperature, Weather, Icon, dt, timezone)
            VALUES ('$humidity', '$wind', '$pressure', '$latitude', '$longitude', '$direction', '$city', '$temperature', '$weather', '$icon', '$dt', '$timezone')";

        if (!mysqli_query($conn, $insertData)) {
            http_response_code(500);
            echo json_encode(["error" => "Insert failed: " . mysqli_error($conn)]);
            exit;
        }
    }
} else {
    // API failed: fallback to DB
    $error = error_get_last();
    $result = mysqli_query($conn, $selectAllData);
    $rows = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }

    if (count($rows) > 0) {
        echo json_encode($rows);
    } else {
        http_response_code(502);
        echo json_encode(["error" => "Failed to fetch weather data from API and no cached data available.", "details" => $error['message']]);
    }
    exit;
}

// Return updated/fresh data
$result = mysqli_query($conn, $selectAllData);
$rows = [];
while ($row = mysqli_fetch_assoc($result)) {
    $rows[] = $row;
}
echo json_encode($rows);
?>

