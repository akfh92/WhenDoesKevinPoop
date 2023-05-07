// require
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const http = require('http');
const { config } = require(__dirname + "/config.js");

////GLOBAL VARIABLES////
let LastGame = 'NA1_4648782588';
//Main page
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");

});
app.listen(3000, function () {
    console.log("linstening on 5000");
});

//-------------------------checkLastGame-------------------------//
async function checkLastGame() {
    //get api from riot match history with count of 1 
    let url = 'https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/Hu46PTPaSMgs3zU3HU4RyfVdQHkBKWHssLEaj8vWfd_19qzXg3xlKu_AsUkBQp1_EG-lSge7NXRx4A/ids?start=0&count=1&api_key=' + config.RIOT_API_KEY;
    let response = await fetch(url);
    let data = await response.json()
    //check this with global variable(LastGame) and if they match return false
    if(data[0]==LastGame){
        return false;
    }
    //else return true
    LastGame = data[0];
    return true;

}
//-------------------------checkLastGame-------------------------//



//————————————MAIN FUNCTION————————————//
async function main(){
    setInterval(async function () {
        //call a function that returns true if kevin played another game                           -> function name checkLastGame()
        // let jsondata = await checkLastGame();
        console.log(await checkLastGame());
        // console.log(jsondata);
        // if checkLastGame returns true, check if he pooped; if pooped, return true.              -> function name checkPooped()
    
        //if checkPooped return true, send kakao notification;                                     ->  function name sendKakako()
    
    
    
    
    }, 2000)
}
//————————————MAIN FUNCTION————————————//
main()