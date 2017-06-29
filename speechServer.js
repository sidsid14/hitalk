const morgan = require("morgan");
const express = require("express");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const spawn = require("child_process").spawn;

const app = express();

app.use(morgan('combined'));

app.use(express.static(__dirname));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req,res ,next){
    res.header("Access-Control-Allow-Origin",req.headers.origin);
    res.header("Access-Control-Allow-Headers","Origin , X-Requested-With, Content-Type, Accept");
    next();
});


app.post('/getJson', function(request, response){
    var text = request.body.value;
    var dataString = "";
   // console.log(text);
    var Filepath =  __dirname + "/new.py";
    var py = spawn('python3',[Filepath , text]);
    
    //py.stdin.write(JSON.stringify(text));
    
    py.stdout.on("data",function(data){
        dataString += data.toString();
    });
    
    py.stdout.on("end", function(){
       // console.log("This is the output");
            response.send(dataString);
    });
    
});


app.listen(3000);

console.log('server started at port 3000');
