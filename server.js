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
    var parsedMsg = JSON.parse(msg);
    console.log('message from client', parsedMsg);
    switch (parsedMsg.type) {
      case 'NICK':
        clients.find(function (e) { return e.id == id }).nick = parsedMsg.nick
        sendBroadcast(JSON.stringify({type: "LIST", content: clients.map(function (e){return {id: e.id, nick: e.nick}})}))
        break;
     case 'CHAT':
        var client = clients.find(function (e) { return e.id == parsedMsg.to })
        sendMsg(client, msg)
        break;
     case 'PING':
      break;
      default:
        sendBroadcast(msg)
        break;
    }
  });

  w.on('close', function () {
    console.log('CLOSE CONN', id);
    removeClient(id)
  });

  w.send(JSON.stringify({id:id, type:"HELO"}));
  sendBroadcast(JSON.stringify({type: "LIST", content: clients.map(function (e){return {id: e.id, nick: e.nick}})}))
});

var removeClient = function (id) {
  var newArray = []
  for (i = 0; i < clients.length; i++) {
    if (clients[i].id != id) {
      newArray.push(clients[i])
    }
  }
  clients = newArray
  sendBroadcast(JSON.stringify({type: "LIST", content: clients.map(function (e){return {id: e.id, nick: e.nick}})}))
}

var sendMsg= function(client, msg) {
  console.log("SEND CHAT FROM", msg, msg)
  try {client.con.send(msg)} catch (e) {console.log('Error:', e)}
}
var sendBroadcast = function (msg) {
  for (i = 0; i < clients.length; i++) {
    try {clients[i].con.send(msg)} catch (e) {console.log('Error:', e)}
  }
}