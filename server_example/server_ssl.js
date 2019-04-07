// Load required modules
var https   = require("https");     // https server core module
var fs      = require("fs");        // file system core module
var express = require("express");   // web framework external module
var io      = require("socket.io"); // web socket external module
var fs=require('fs')
var path=require('path')
var multer=require('multer')
var unirest = require("unirest");
// This sample is using the easyrtc from parent folder.
// To use this server_example folder only without parent folder:
// 1. you need to replace this "require("../");" by "require("easyrtc");"
// 2. install easyrtc (npm i easyrtc --save) in server_example/package.json

var easyrtc = require("../"); // EasyRTC internal module

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var httpApp = express();
httpApp.use(express.static(__dirname + "/static/"));
var reqURL = unirest("GET", "https://www.fast2sms.com/dev/bulk");
httpApp.post('/sendsms',function(req,res){
    reqURL.query({
        "authorization": "KiQ3ZX2IkyY18w0N4WufFp6rBzqhTmvED9GxRsHebMV5nolAJLMidkyIf94tjsZ7bB6wzXrGTQClgU3D",
        "sender_id": "FSTSMS",
        "message": "https://157.230.171.151:8443/demos/demo_audio_video_simple.html",
        "language": "english",
        "route": "p",
        "numbers": "8802985527",
      });
      
      reqURL.headers({
        "cache-control": "no-cache"
      });
    
    reqURL.end(function (resp) {
        if (resp.error){
            res.end('error')
        } 
      });
      res.end('success')
});


httpApp.post('/blob',function(req,res){
    var storage = multer.diskStorage({
        destination: __dirname+'/videos',
        filename: function (req, file, cb) {
            cb(null, Date.now() + '.webm') //Appending .jpg
          }
    });
    var upload = multer({
        storage: storage
    }).any();

    upload(req, res, function(err) {
        if (err) {
            console.log(err);
            return res.end('Error');
        } else {
            console.log(req.body);
            req.files.forEach(function(item) {
                console.log(item);
                // move your file to destination
            });
            res.end('File uploaded');
        }
    }); 
})
// Start Express https server on port 8443
var webServer = https.createServer({
    key:  fs.readFileSync(__dirname + "/certs/localhost.key"),
    cert: fs.readFileSync(__dirname + "/certs/localhost.crt")
}, httpApp);

// Start Socket.io so it attaches itself to Express server
var socketServer = io.listen(webServer, {"log level":1});

// Start EasyRTC server
var rtc = easyrtc.listen(httpApp, socketServer);

// Listen on port 8443
webServer.listen(8443, function () {
    console.log('listening on https://localhost:8443');
});
