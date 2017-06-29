var http = require("http");
var morgan = require("morgan");
var fs = require("fs");
var express = require("express");

var port = process.env.PORT || 5000;

var app = express();

app.use(express.static(__dirname));

app.use(morgan("combined"));

var server = http.createServer(app).listen(port);



//app.listen(5000);

//var server = http.createServer(function(request,response){
//  response.writeHead(200);
//    var html = fs.readFileSync("./index.html");
//    response.write(html);
//  response.end();
//});

//server.listen(5000);

var webSocketServer = require("websocket").server;

wsServer = new webSocketServer({
   httpServer: server 
});

var count = 0;
var clients = {};

wsServer.on("request", function(r){
    var connection = r.accept("echo-protocol", r.origin);
    var color = randomColor();
    var id = count++;        //giving an id to a client
     connection["color"] = color;
    clients[id] = connection;//storing connection of a client so that we can loop through & contact all clients
    
    console.log( (new Date()) + "Connection accepted [" + id +"]" + connection.remoteAddress);
    //console.log(clients)
    connection.on("message", function(message){
        var msgString = message.utf8Data;
        var msgArr = msgString.split("@@");
        var dateTime = getDateTime();
        
      
        for(var i in clients){
            if(clients[i].remoteAddress == connection.remoteAddress){
                 var msgObject={text:msgArr[0],color:connection.color,sendBy:"Me",username:msgArr[1],timeStamp:dateTime};
                 clients[i].send(JSON.stringify(msgObject));
                //clients[i].sendUTF(msgString + connection.color);
            }else{
                var msgObject={text:msgArr[0],color:connection.color,sendBy:clients[i].remoteAddress,username:msgArr[1],timeStamp:dateTime};
                clients[i].send(JSON.stringify(msgObject));
                //clients[i].sendUTF(msgString + connection.remoteAddress + connection.color);   
            }
        }
    });
    
    connection.on("close", function(reasonCode, description){
        delete clients[id];
        console.log( (new Date()) +" Peer "+ connection.remoteAddress + "disconnected.");
    });
    
});

function randomColor(){
          return "#"+Math.floor(Math.random() * 16777215).toString(16);
        }

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return "  "+day + "/" + month + "/" + year + "-" + hour + ":" + min + ":" + sec;

}


console.log("server started on port 5000");
