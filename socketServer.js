var http = require("http");
var morgan = require("morgan");
var fs = require("fs");
var express = require("express");

var path = require("path");

var port = process.env.PORT || 5000;

var app = express();

app.use(express.static(__dirname));

app.use(morgan("combined"));

var server = http.createServer(app).listen(port);

var jsonData;

app.get("/load",function(req,res){

    
    var onlyDate = "./chat_file/"+getTodayDate()+".json";
      fs.exists(onlyDate , function(exists){
          if(exists){
              jsonData = fs.readFileSync(onlyDate,'utf-8');
              var prevMsgs = JSON.parse(jsonData);
            
              res.send(prevMsgs);
          }         
      });
    
});


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
    
    connection.on("message", function(message){
        var msgString = message.utf8Data;
        var msgArr = msgString.split("@@");
        var dateTime = getDateTime();
        var onlyDate = "./chat_file/"+getTodayDate()+".json";
      
        fs.exists(onlyDate , function(exists){
         var obj = {text:msgArr[0],color:connection.color,sendBy:"",username:msgArr[1],timeStamp:dateTime};
        
         if(exists){
            
             jsonData = jsonData.substr(0,jsonData.length-1);
             jsonData += ','+JSON.stringify(obj) + ']';
             fs.writeFile(onlyDate,jsonData);
             
          
         }else{
            
             //Delete rest of the files
             const directory = "chat_file";
             
             fs.readdir("./"+directory, (err, files) => {
             if(err) throw err;
            
                for(var file of files){
                    fs.unlink(path.join(directory, file));
                }
             });
             
             fs.writeFileSync(onlyDate,'['+JSON.stringify(obj)+']');
             jsonData = fs.readFileSync(onlyDate,'utf-8');
           } 
        });
        
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

function getTodayDate(){
    var date = new Date();
    
    var year = date.getFullYear();
    
    var month = date.getMonth();    
    month = (month < 10 ? "0" : "") + month;
    
    var day = date.getDate(); 
    day = (day < 10 ? "0" : "") + day;
    
    return day+month+year;
}

console.log("server started on port 5000");
