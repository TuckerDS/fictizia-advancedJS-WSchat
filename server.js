/*jshint esversion: 6*/
var Server = require('ws').Server;
var port = process.env.PORT || 443;
var ws = new Server({ port: port });
var clients = [];

ws.on('connection', function (w, req) {
  var id = Date.now();;
  clients.push({ 'id': id, 'con': w, 'nick': 'Anon'});
  console.log("NEW CONN:", id);
  
  w.on('message', function (msg) {
    var parsedMsg = JSON.parse(msg);
    console.log('NEW MSG:', parsedMsg);
    switch (parsedMsg.type) {
      case 'NICK':
        clients.find(e => e.id == id).nick = parsedMsg.nick;
        sendMsgs(clients, {type: "LIST", content: clients.map(e => { return {id: e.id, nick: e.nick}; })});
        break;
      case 'CHAT':
        var client = clients.find(e => e.id == parsedMsg.to);
        sendMsgs([client], parsedMsg);
        break;
      case 'TEXT':
        sendMsgs(clients, parsedMsg);
        break;
      case 'PING':
        w.send(JSON.stringify({id:id, type:"PONG"}));
        break;
    default: break;
    }
  });

  w.on('close', function () {
    console.log('CLOSE CONN:', id);
    removeClient(id);
  });

  w.send(JSON.stringify({id:id, type:"HELO"}));
  sendMsgs(clients, {type: "LIST", content: clients.map(e => {return {id: e.id, nick: e.nick};})});
});

var removeClient = function (id) {
  var newArray = clients.filter(e => e.id != id);
  clients = newArray;
  sendMsgs(clients, {type: "LIST", content: clients.map(e =>{return {id: e.id, nick: e.nick};})});
}

var sendMsgs = function (recipients, msg) {
  for (i = 0; i < recipients.length; i++) {
    try {recipients[i].con.send(JSON.stringify(msg));} catch (e) {console.log('Error:', e);}
  }
};