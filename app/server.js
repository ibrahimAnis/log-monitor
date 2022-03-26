const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path'); 
const Watcher = require('./watcher');

//app.use(express.static(path.join(__dirname, '/index.html')))


 
let watcher = new Watcher("test.log");

watcher.start();


app.get('/log', (req, res) => {
    console.log("request received");
    var options = {
        root: path.join(__dirname)
    };
     
    var fileName = 'index.html';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
})

io.on('connection', function(socket){
   // console.log(socket);
    console.log("new connection established:"+socket.id);

      watcher.on("process", function process(data) {
        socket.emit("update-log",data);
      });
      let data = watcher.getLogs();
      socket.emit("init",data);
   });

http.listen(3000, function(){
    console.log('listening on localhost:3000');
});
