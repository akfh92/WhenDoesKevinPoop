// require
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
const http = require('http');
const {config} = require(__dirname+"/config.js");

app.get("/",function(req,res){
   res.sendFile(__dirname+"/index.html");
});
app.listen(5000,function(){
    console.log("linstening on 5000");
    console.log(config.RIOT_API_KEY);
});


