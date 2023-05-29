const express = require("express");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
var ejs = require("ejs");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const https = require("https");
const { Client, IntentsBitField } = require('discord.js');
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});
const { config } = require(__dirname + "/config.js");
client.login(config.discord_token);

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
    ejs.renderFile(__dirname + "/views/" + "email.ejs", { kill: inGameData.kill, death: inGameData.death, kda: inGameData.kda, lane: inGameData.lane, win: inGameData.win }, function (err, data) {
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
                    path: __dirname + '/public/KEV_IMG2.jpg', // path contains the filename, do not just give path of folder where images are reciding.
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



//————————————————————————sendEmail————————————————————————//


//————————————————————————sendDiscordMessage————————————————————————//
function sendDiscordMessage(inGameData2) {
    const guild = client.guilds.cache.get(config.discord_server_id);
    const channel = guild.channels.cache.get(config.discord_channel_id);
    if (inGameData2.win) {
        message_str2 = "Although KEVIN was shit in the game, his team won!"
    } else {
        message_str2 = "Because of KEVIN, his team lost...."
    }
    poopEmoji = "💩 💩 💩 💩";
    message_str = poopEmoji + poopEmoji + poopEmoji + poopEmoji + poopEmoji + "\n" + poopEmoji + " KEVIN has pooped once again\n" + poopEmoji + "KILLS:" + inGameData2.kill + "\n" + poopEmoji + "DEATHS:" + inGameData2.death + "\n" + poopEmoji + "ASSISTS: " + inGameData2.assist + "\n" + poopEmoji + "KDA: " + inGameData2.kda + "\n" + poopEmoji + "LANE: " + inGameData2.lane + "\n" + poopEmoji + message_str2 + "\n" + poopEmoji + poopEmoji + poopEmoji + poopEmoji + poopEmoji;
    channel.send(message_str);


}
  //————————————————————————sendDiscordMessage————————————————————————//


  module.exports = {
    sendDiscordMessage,
    sendEmail
  };