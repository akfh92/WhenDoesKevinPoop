// require
const express = require("express");
const fetch = require("node-fetch");
const nodemailer = require('nodemailer');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const http = require('http');
// const { config } = require(__dirname + "/config.js");
const PORT = process.env.PORT || 3030;


////GLOBAL VARIABLES////
let LastGame = 'NA1_4648782588';


//————————————————————————loadMainPage————————————————————————//
app.use("/",express.static(__dirname + '/public'));
//————————————————————————loadMainPage————————————————————————//
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
  });

//————————————————————————checkLastGame————————————————————————//
async function checkLastGame() {
    //get api from riot match history with count of 1 
    let url = 'https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/Hu46PTPaSMgs3zU3HU4RyfVdQHkBKWHssLEaj8vWfd_19qzXg3xlKu_AsUkBQp1_EG-lSge7NXRx4A/ids?start=0&count=1&api_key=' + process.env.RIOT_API_KEY;
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


//————————————————————————checkMatch————————————————————————//
async function checkMatch() {

    let url = 'https://americas.api.riotgames.com/lol/match/v5/matches/' + LastGame + '?api_key=' + process.env.RIOT_API_KEY;
    let response = await fetch(url);
    let data = await response.json();
    //find participant
    jsonData1 = data.metadata.participants;
    let participantNum;
    for (let i = 0; i < jsonData1.length; i++) {
        if (jsonData1[i] == process.env.puuid) {
            participantNum = i;
        }
    }
    //console.log(data.info.participants[participantNum]);
    let retObject = {
        kda: data.info.participants[participantNum].challenges.kda,
        kill: data.info.participants[participantNum].kills,
        death: data.info.participants[participantNum].deaths,
        assist: data.info.participants[participantNum].assists,
        lane: data.info.participants[participantNum].lane,
        win: data.info.participants[participantNum].win
    };
    return retObject;



}
//————————————————————————checkMatch-————————————————————————//



//————————————————————————checkPooped————————————————————————//
function checkPooped(inGameData) {

    kill_death_diff = inGameData.death - inGameData.kills;
    if (kill_death_diff >= 5) {
        return true;
    }
    return false;




}
//————————————————————————checkPooped————————————————————————//


//————————————————————————sendEmail————————————————————————//
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'whendoeskevinpoop@gmail.com',
        pass: process.env.GMAIL_PASS
    }
});


function sendEmail(inGameData){
    let stringMessage = JSON.stringify(inGameData);
    var mailOptions = {
        from: 'whendoeskevinpoop@gmail.com',
        to: 'akfh92@live.com',
        subject: 'KEVIN HAS POOPED!',
        text: stringMessage
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

//————————————————————————sendEmail————————————————————————//

//————————————————————————MAIN FUNCTION————————————————————————//
async function main() {
    setInterval(async function () {
        //call a function that returns true if kevin played another game                           -> function name checkLastGame()
        let lastGameCheck = await checkLastGame();


        // if checkLastGame returns true, call check match which returns in-game data;             -> function name checkMatch()
        if(lastGameCheck){
            let inGameData = await checkMatch();
        }
        // if checkLastGame returns true, check if kevin pooped in the game;                       -> function name checkMatch()
        if(lastGameCheck){
            console.log(checkPooped(inGameData));
        }


        //if checkPooped return true, send kakao notification;                                     ->  function name sendEmail()
        if(lastGameCheck){
        sendEmail(inGameData);
        }
        app.get("/check",function(req,res){
            res.send(inGameData);
        });



    }, 120000) // 120000 miliseconds = 20 minutes
}
//————————————MAIN FUNCTION————————————//
main();