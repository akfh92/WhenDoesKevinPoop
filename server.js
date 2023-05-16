// require
const express = require("express");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const app = express();
//const https = require("")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const https = require("https");
const { config } = require(__dirname + "/config.js");
// const PORT = config.PORT || 3030;
const PORT = 3030;

//————————————————————————Global Variables————————————————————————//
let LastGame = "NA1_4648782588";
let getTime;
//————————————————————————Global Variables————————————————————————//

//————————————————————————loadMainPage————————————————————————//
app.use(express.static("public"));
let currentLevel = await getSummonerInfo();
app.get("/", function (req, res) {
  res.render("mainPage", { data: { updatedTime: getTime, level:currentLevel} });
});
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
//————————————————————————loadMainPage————————————————————————//

//————————————————————————checkLastGame————————————————————————//
async function checkLastGame() {
  //get api from riot match history with count of 1
  let url =
    "https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/Hu46PTPaSMgs3zU3HU4RyfVdQHkBKWHssLEaj8vWfd_19qzXg3xlKu_AsUkBQp1_EG-lSge7NXRx4A/ids?start=0&count=1&api_key=" +
    config.RIOT_API_KEY;
  let response = await fetch(url);
  let data = await response.json();
  //check this with global variable(LastGame) and if they match return false
  if (data[0] == LastGame) {
    return false;
  }
  //else return true
  LastGame = data[0];
  return true;
}
//————————————————————————checkLastGame————————————————————————//

//————————————————————————checkMatch————————————————————————//
async function checkMatch() {
  let url =
    "https://americas.api.riotgames.com/lol/match/v5/matches/" +
    LastGame +
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

//————————————————————————sendEmail————————————————————————//
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "whendoeskevinpoop@gmail.com",
    pass: config.GMAIL_PASS,
  },
});

function sendEmail(inGameData) {
  let stringMessage = JSON.stringify(inGameData);
  var mailOptions = {
    from: "whendoeskevinpoop@gmail.com",
    to: "akfh92@live.com",
    subject: "KEVIN HAS POOPED!",
    text: stringMessage,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

//————————————————————————sendEmail————————————————————————//ƒ


//————————————————————————getCurrentTime————————————————————————//
function getCurrentTime() {
  var currentdate = new Date();
  var datetime =
    "Last Sync: " +
    currentdate.getDate() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getFullYear() +
    " @ " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds();
  return currentdate;
}
//————————————————————————getCurrentTime————————————————————————//


//————————————————————————getSummonerInfo————————————————————————//
//returns summoner level
async function getSummonerInfo(){
url = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/Hu46PTPaSMgs3zU3HU4RyfVdQHkBKWHssLEaj8vWfd_19qzXg3xlKu_AsUkBQp1_EG-lSge7NXRx4A?api_key="+config.RIOT_API_KEY;
let response = await fetch(url);
let data = await response.json();
console.log(data.summonerLevel);
}
//————————————————————————getSummonerInfo————————————————————————//


//————————————————————————MAIN FUNCTION————————————————————————//
async function main() {
  setInterval(async function () {
    getTime = getCurrentTime();
    let lastGameCheck = false;
    //call a function that returns true if kevin played another game, returns false if kevin didn't play another game.                ----> function name checkLastGame()
    lastGameCheck = await checkLastGame();
    console.log("Kevin played another game: " + lastGameCheck + " @:"+getTime);

    // if checkLastGame returns true, call check match which returns in-game data;                                                    -----> function name checkMatch()
    if (lastGameCheck) {
      let inGameData = await checkMatch();
      inGameData2 = inGameData;
    }

    // if checkLastGame returns true, check if kevin pooped in the game;                                                              -----> function name checkPooped()
    if (lastGameCheck) {
      checkPoopedOutput = checkPooped(inGameData2);
    }

    //if checkPooped return true, send email notification;                                                                             ----->  function name sendEmail()
    if (lastGameCheck&&checkPoopedOutput) {
      sendEmail(inGameData2);
    }
  }, 1200); // 120000 miliseconds = 20 minutes
}
main(); // call main function
//————————————MAIN FUNCTION————————————//
