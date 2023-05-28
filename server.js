// require
const express = require("express");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const {Client,IntentsBitField}=require('discord.js');
const client = new Client({
  intents:[
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});
client.login("MTExMjQ0NTEwOTUxMDg4NTM3Ng.G1EpqO.ZHNN8mgHvyJL9MzW5bjaQ-5teDGNOB_GnWEZjE");
var ejs = require("ejs");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const https = require("https");
const { config } = require(__dirname + "/config.js");
// const PORT = process.env.PORT || 3030;
const PORT = 3030;

//————————————————————————Global Variables————————————————————————//
let LastGame = "NA1_4648782588";
let getTime;
//————————————————————————Global Variables————————————————————————//

//————————————————————————loadMainPage————————————————————————//
app.use(express.static("public"));

app.get("/", async function (req, res) {
  //get current level
  let currentLevel = await getSummonerInfo();
  //get current rank and other level/tier data
  let currentRankJson = await getCurrentRank();
  let currentTime = getCurrentTime();
  let i=''
  switch(currentRankJson[0].rank){
    case 'I': i = 1; break;
    case 'II': i = 2; break;
    case 'III': i = 3; break;
    case 'IV': i = 4; break;
    case 'V': i = 5; break;
    default: i = 0; break;

  }
  //get rank img
  let rankImg = "http://opgg-static.akamaized.net/images/medals/"+(currentRankJson[0].tier).toLowerCase()+"_"+i+".png"
  res.render("mainPage", {
    data: { updatedTime: currentTime, level: currentLevel,tier:currentRankJson[0].tier,rank:currentRankJson[0].rank,wins:currentRankJson[0].wins,losses:currentRankJson[0].losses,lp:currentRankJson[0].leaguePoints,rankImgSrc:rankImg},
  });
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
    subject: "KEVIN HAS POOPED!"
  };
  console.log(inGameData);
  ejs.renderFile(__dirname +"/views/"+ "email.ejs", { kill:inGameData.kill,death:inGameData.death,kda:inGameData.kda,lane:inGameData.lane,win:inGameData.win}, function (err, data) {
    if (err) {
        console.log(err);
    } else {
        var mainOptions = {
          from: "whendoeskevinpoop@gmail.com",
          to: "akfh92@live.com",
          subject: "KEVIN HAS POOPED!",
          html: data,
          attachments: [{
            filename: 'KEV_IMG2.jpg',
            path: __dirname +'/public/KEV_IMG2.jpg', // path contains the filename, do not just give path of folder where images are reciding.
            cid: 'img' // give any unique name to the image and make sure, you do not repeat the same string in given attachment array of object.
           }]
        };
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });
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
  return datetime;
}
//————————————————————————getCurrentTime————————————————————————//

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


//————————————————————————sendDiscordMessage————————————————————————//
function sendDiscordMessage(inGameData2){
  client.on('ready',(c)=>{
    console.log('${c.user.id}');
  })
}
//————————————————————————sendDiscordMessage————————————————————————//


//————————————————————————MAIN FUNCTION————————————————————————//
async function main() {
  setInterval(async function () {
    getTime = getCurrentTime();
    let lastGameCheck = false;
    //call a function that returns true if kevin played another game, returns false if kevin didn't play another game.                ----> function name checkLastGame()
    lastGameCheck = await checkLastGame();
    console.log(
      "Kevin played another game: " + lastGameCheck + " @:" + getTime
    );

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
    if (lastGameCheck && checkPoopedOutput) {
      sendEmail(inGameData2);
      sendDiscordMessage(inGameData2);
    }
  }, 120000); // 120000 miliseconds = 20 minutes
}
main(); // call main function
//————————————MAIN FUNCTION————————————//
