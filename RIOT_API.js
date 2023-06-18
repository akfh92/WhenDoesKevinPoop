const express = require("express");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
var ejs = require("ejs");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const https = require("https");
const { config } = require(__dirname + "/config.js");

//————————————————————————checkLastGame————————————————————————//
async function checkLastGame() {
    //get api from riot match history with count of 1
    let url =
        "https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/Hu46PTPaSMgs3zU3HU4RyfVdQHkBKWHssLEaj8vWfd_19qzXg3xlKu_AsUkBQp1_EG-lSge7NXRx4A/ids?start=0&count=1&api_key=" +
        config.RIOT_API_KEY;
    let response = await fetch(url);
    let data = await response.json();
    //check this with global variable(LastGame) and if they match return false
    if (data[0] == config.LastGame) {
        return false;
    }
    //else return true
    config.LastGame = data[0];
    return true;
}
//————————————————————————checkLastGame————————————————————————//


//————————————————————————checkMatch————————————————————————//
async function checkMatch() {
    let url =
        "https://americas.api.riotgames.com/lol/match/v5/matches/" +
        config.LastGame +
        "?api_key=" +
        config.RIOT_API_KEY;
    let response = await fetch(url);
    let data = await response.json();
    //find participant
    jsonData1 = data.metadata.participants;
    let participantNum;
    for (let i = 0; i < jsonData1.length; i++) {
        if (jsonData1[i] == config.puuid) {
            participantNum = i;
        }
    }
    let retObject = {
        kda: data.info.participants[participantNum].challenges.kda,
        kill: data.info.participants[participantNum].kills,
        death: data.info.participants[participantNum].deaths,
        assist: data.info.participants[participantNum].assists,
        lane: data.info.participants[participantNum].lane,
        win: data.info.participants[participantNum].win,
    };
    return retObject;
}
//————————————————————————checkMatch-————————————————————————//


//————————————————————————checkPooped————————————————————————//
function checkPooped(inGameData) {
    kill_death_diff = inGameData.death - inGameData.kill;
    if (kill_death_diff >= 5) {
        return true;
    }
    return false;
}
//————————————————————————checkPooped————————————————————————//


//————————————————————————getCurrentRank————————————————————————//
async function getCurrentRank() {
    url =
        "https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/MiKfb4NIL4Y0v9UWBVCWQFPIDvV8Xp1aBckFZiTLK5upeI8?api_key=" +
        config.RIOT_API_KEY;
    let response = await fetch(url);
    let data = await response.json();
    return data;
}
//————————————————————————getCurrentRank————————————————————————//


//————————————————————————getSummonerInfo————————————————————————//
//returns summoner level
async function getSummonerInfo() {
    url =
        "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/Hu46PTPaSMgs3zU3HU4RyfVdQHkBKWHssLEaj8vWfd_19qzXg3xlKu_AsUkBQp1_EG-lSge7NXRx4A?api_key=" +
        config.RIOT_API_KEY;
    let response = await fetch(url);
    let data = await response.json();
    return data.summonerLevel;
}
  //————————————————————————getSummonerInfo————————————————————————//

  module.exports = {
    getSummonerInfo,
    getCurrentRank,
    checkMatch,
    checkPooped,
    checkLastGame

  };