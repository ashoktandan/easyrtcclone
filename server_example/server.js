// Load required modules
var http    = require("http");              // http server core module
var express = require("express");           // web framework external module
var serveStatic = require('serve-static');  // serve static files
var socketIo = require("socket.io");        // web socket external module
var fs=require('fs')
var path=require('path')
var multer=require('multer')
var unirest = require("unirest");
// This sample is using the easyrtc from parent folder.
// To use this server_example folder only without parent folder:
// 1. you need to replace this "require("../");" by "require("easyrtc");"
// 2. install easyrtc (npm i easyrtc --save) in server_example/package.json

var easyrtc = require("../"); // EasyRTC internal module

// Set process name
process.title = "node-easyrtc";
// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var app = express();
app.use(serveStatic('static', {'index': ['index.html']}));

var reqURL = unirest("GET", "https://www.fast2sms.com/dev/bulk");
app.post('/sendsms',function(req,res){
    reqURL.query({
        "authorization": "KiQ3ZX2IkyY18w0N4WufFp6rBzqhTmvED9GxRsHebMV5nolAJLMidkyIf94tjsZ7bB6wzXrGTQClgU3D",
        "sender_id": "FSTSMS",
        "message": "http://157.230.171.151/demos/demo_audio_video_simple.html",
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


app.post('/blob',function(req,res){
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
// Start Express http server on port 8080
var webServer = http.createServer(app);

// Start Socket.io so it attaches itself to Express server
var socketServer = socketIo.listen(webServer, {"log level":1});

easyrtc.setOption("logLevel", "debug");

// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", function(socket, easyrtcid, msg, socketCallback, callback) {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

        console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
    console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

// Start EasyRTC server
var rtc = easyrtc.listen(app, socketServer, null, function(err, rtcRef) {
    console.log("Initiated");

    rtcRef.events.on("roomCreate", function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
        console.log("roomCreate fired! Trying to create: " + roomName);

        appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    });
});

// Listen on port 8080
webServer.listen(8080, function () {
    console.log('listening on http://localhost:8080');
});
