const events = require("events");
const fs = require("fs");
const watchFile = "test.log";
const bf = require('buffer');
const TRAILING_LINES = 10;
const buffer = new Buffer.alloc(bf.constants.MAX_STRING_LENGTH);
  
  
class Watcher extends events.EventEmitter {
  constructor(watchFile) {
    super();
    this.watchFile = watchFile;
    this.store = [];
  }
  getLogs()
  {
      return this.store;
  }

  watch(curr,prev) {
    const watcher = this;
    fs.open(this.watchFile,(err,fd) => {
        if(err) throw err;
        let data = '';
        let logs = [];
        fs.read(fd,buffer,0,buffer.length,prev.size,(err,bytesRead) => {
            if(err) throw err;
            if(bytesRead > 0)
            {
                data = buffer.slice(0,bytesRead).toString();
                logs = data.split("\n").slice(1);
                console.log("logs read:"+logs);
                if(logs.length >= TRAILING_LINES)
                {
                    logs.slice(-10).forEach((elem) => this.store.push(elem));
                }
                else{
                    logs.forEach((elem) => {
                        if(this.store.length == TRAILING_LINES)
                        {
                            console.log("queue is full");
                            this.store.shift();
                        }
                        this.store.push(elem);
                    });
                }
                watcher.emit("process",logs);
            }
        });
    });
   
    }


  start() {
    var watcher = this;
    fs.open(this.watchFile,(err,fd) => {
        if(err) throw err;
        let data = '';
        let logs = [];
        fs.read(fd,buffer,0,buffer.length,0,(err,bytesRead) => {
            if(err) throw err;
            if(bytesRead > 0)
            {   
                data = buffer.slice(0,bytesRead).toString();
                logs = data.split("\n");
                this.store = [];
                logs.slice(-10).forEach((elem) => this.store.push(elem));
            }
            fs.close(fd);
            });
    fs.watchFile(this.watchFile,{"interval":1000}, function(curr,prev) {
        watcher.watch(curr,prev);
    });
  });
}
}
  
module.exports = Watcher;