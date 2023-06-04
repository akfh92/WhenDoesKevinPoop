// require
const express = require("express");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
var ejs = require("ejs");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const https = require("https");
// const { config } = require(__dirname + "/config.js");
const myFunction1 = require(__dirname+"/RIOT_API.js");
const myFunction2 = require(__dirname+"/etc.js");
const myFunction3 = require(__dirname+"/notification.js");
const PORT = process.env.PORT || 3030;
// const PORT = 3030;
const { Client, IntentsBitField } = require('discord.js');
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});
client.login(process.env.discord_token);



//————————————————————————Global Variables————————————————————————//
let LastGame = "NA1_4648782588";
let getTime;
//————————————————————————Global Variables————————————————————————//

//————————————————————————loadMainPage————————————————————————//
app.use(express.static("public"));

app.get("/", async function (req, res) {
  //get current level
  let currentLevel = await myFunction1.getSummonerInfo();
  //get current rank and other level/tier data
  let currentRankJson = await myFunction1.getCurrentRank();
  let currentTime = myFunction2.getCurrentTime();
  let i = ''
  switch (currentRankJson[0].rank) {
    case 'I': i = 1; break;
    case 'II': i = 2; break;
    case 'III': i = 3; break;
    case 'IV': i = 4; break;
    case 'V': i = 5; break;
    default: i = 0; break;

  }
  //get rank img
  let rankImg = "http://opgg-static.akamaized.net/images/medals/" + (currentRankJson[0].tier).toLowerCase() + "_" + i + ".png"
  res.render("mainPage", {
    data: { updatedTime: currentTime, level: currentLevel, tier: currentRankJson[0].tier, rank: currentRankJson[0].rank, wins: currentRankJson[0].wins, losses: currentRankJson[0].losses, lp: currentRankJson[0].leaguePoints, rankImgSrc: rankImg },
  });
});
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
//————————————————————————loadMainPage————————————————————————//


//————————————————————————MAIN FUNCTION————————————————————————//
async function main() {
  setInterval(async function () {
    getTime = myFunction2.getCurrentTime();
    let lastGameCheck = false;
    //call a function that returns true if kevin played another game, returns false if kevin didn't play another game.                ----> function name checkLastGame()
    lastGameCheck = await myFunction1.checkLastGame(LastGame);
    console.log(
      "Kevin played another game: " + lastGameCheck + " @:" + getTime
    );

    // if checkLastGame returns true, call check match which returns in-game data;                                                    -----> function name checkMatch()
    if (lastGameCheck) {
      let inGameData = await myFunction1.checkMatch();
      inGameData2 = inGameData;
    }

    // if checkLastGame returns true, check if kevin pooped in the game;                                                              -----> function name checkPooped()
    if (lastGameCheck) {
      checkPoopedOutput = myFunction1.checkPooped(inGameData2);
    }

    //if checkPooped return true, send email notification;                                                                             ----->  function name sendEmail()
    if (lastGameCheck && checkPoopedOutput) {
      myFunction3.sendEmail(inGameData2);
      myFunction3.sendDiscordMessage(inGameData2);
    }
  }, 1200000); // 1200000 miliseconds = 20 minutes
}
main(); // call main function
//————————————MAIN FUNCTION————————————//
