var Server = require('ws').Server;
var port = process.env.PORT || 443;
var ws = new Server({ port: port });
var clients = [];

ws.on('connection', function (w, req) {
  var id = Date.now();

  console.log("NEW CONN:", id)
  clients.push({
    id: id,
    con: w, 
    nick: 'Anon'
  })
  
  w.on('message', function (msg) {
    var parsedMsg = JSON.parse(msg)
    console.log('message from client', parsedMsg);
    if (parsedMsg.type == "NICK") {
      clients.find(function (e) { return e.id == id }).nick = parsedMsg.nick
      sendBroadcast(JSON.stringify({type: "LIST", list: clients}))
    } else sendBroadcast(msg)
  
  });

  w.on('close', function () {
    console.log('CLOSE CONN', id);
    removeClient(id)
  });
  w.send(JSON.stringify({id:id, type:"HELO"}));
  sendBroadcast(JSON.stringify({type: "LIST", list: clients}))
});

var removeClient = function (id) {
  var newArray = []
  for (i = 0; i < clients.length; i++) {
    if (clients[i].id != id) {
      newArray.push(clients[i])
    }
  }
  clients = newArray
  sendBroadcast(JSON.stringify({type: "LIST", list: clients}))
}

var sendBroadcast = function (msg) {
  for (i = 0; i < clients.length; i++) {
    clients[i].con.send(msg)
  }
}