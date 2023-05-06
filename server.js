
// require
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const http = require('http');
const { config } = require(__dirname + "/config.js");

let url = 'https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/Hu46PTPaSMgs3zU3HU4RyfVdQHkBKWHssLEaj8vWfd_19qzXg3xlKu_AsUkBQp1_EG-lSge7NXRx4A/ids?start=0&count=20&api_key=' + config.RIOT_API_KEY;

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");

});
app.get("/checkGame", function (req, res) {
    // res.send(didKevinPoop())
    console.log(didKevinPoop());
});
app.listen(3000, function () {
    console.log("linstening on 5000");
    getLastTenGames();
});




//// get last 10 games Kevin pooped ////

// Stack of last 10 games Kevin pooped

//function to get last 10 games Kevin Pooped
async function getLastTenGames(lastGame) {
    const response = await fetch(url);
    let data = await response.json();
    console.log(data);
}

//alert everytime kevin poop
// async function kevinPoop() {    

// }

