/*jshint esversion: 6*/
var connection, btnSend, txtMsg, cbxShuffle, chatbox, id, users, counter, intervalId, selectedChat;

window.onload = function () {
  users = [];
  btnSend = document.getElementById('send');
  cbxShuffle = document.getElementById('shuffle');
  txtMsg = document.getElementById('texto');
  chatbox = document.getElementById('msgbox');
  nickBox = document.getElementById('nickname');
  list = document.getElementById('list');
  counter = document.getElementById('counter');

  btnSend.addEventListener('click', send);
  txtMsg.addEventListener('keypress', e => {if (e.keyCode == 13) send();});
  nickBox.addEventListener('change', () => connection.send(JSON.stringify({type: 'NICK', nick: this.value})));
  list.addEventListener('change', () => selectedChat = this.options[this.selectedIndex].value);

  connect();
};

var connect = function () {
  clearInterval(intervalId);
  connection = new WebSocket('wss://fictizia-ws-chat.herokuapp.com');
  connection.onopen = (e) => { console.log('OPEN', e); if (nickBox.value != '') connection.send(JSON.stringify({ type: 'NICK', nick: nickBox.value}));};
  connection.onclose = (e) => { console.log('conexion close'); connect();};
  connection.onerror = (error) => { console.error(`WebSocket Error ${error}`); };
  connection.onmessage = e => receive(e);
  intervalId = setInterval(() => {console.log('PING');connection.send(JSON.stringify({type:'PING'}))}, 30000);
};

var receive = function (e) {
  var msg = JSON.parse(e.data);
  console.log(msg.type, msg);

  switch (msg.type) {
    case 'HELO':
      id = msg.nick || msg.id;
      break;
    case 'LIST':
      counter.innerHTML = msg.content.length;
      updateList(msg.content);
      break;
    case 'TEXT':
      addMsg(msg.nick, msg.content, msg.date );
      break;
    case 'CHAT':
      var toNick = users.find(e => e.id == msg.to).nick;
      addMsg(msg.nick, `(Private to ${toNick}) msg.content`, msg.date );
      break;
    default: break;
  }
}

var send = function () {
  var now = new Date();
  var msg = {
    'id': id,
    'nick': nickBox.value || 'Anon' ,
    'content': txtMsg.value,
    'date': `${now.getHours()}:${now.getMinutes()}`
  };

  msg.type = list.options[list.selectedIndex].value == 'all' ? 'TEXT' : 'CHAT';
  msg.to = list.options[list.selectedIndex].value == 'all' ? null : list.options[list.selectedIndex].value;

  if (cbxShuffle.checked) msg.content = shuffle(msg.content);

  connection.send(JSON.stringify(msg));
  if (msg.type == 'CHAT') receive({data:JSON.stringify(msg)});
  txtMsg.value = '';
  
  chatbox.scrollTop = chatbox.scrollHeight;
}

var shuffle = function (msg) {
  var str = msg;
  var aux = str.split(' ');
  var result, temp, palabra;
  palabra = aux;

  result = '';
  str = msg.split(' ');
  str = palabra;
  // for (var i = 0; i < palabra.length; i++) {
  //   temp = palabra[i].split("");
  //   for (var j = palabra[i].length - 1; j >= 0; j--)
  //     result += temp.splice(Math.floor(Math.random() * (j + 1)), 1);
  //   result += (" ");
  // }

  palabra.split('').forEach(p=>{
    temp = p.split('');
    p.forEach((c, i) =>{
      result += temp.pop(Math.floor(Math.random() * (i + 1)));
    });
  });
  
  return result;
};

var addMsg = function(nick, content, date) {
   chatbox.innerHTML +=
      `<div class="div_mensaje">
      <p class="left nick">[${nick}]:</p>
      <p class="left mensaje">${content}</p>
      <p class="left hora">[${date}]</p>
      </div>`;
};

var updateList = function (userlist) {
  var selected = '';
  var content = `<option value="all" ${selected}>Todos</option>`;
  users = userlist;

  users.forEach(u=>{
    selected = u.id == selectedChat ? 'selected' : '';
    content += `<option value="${u.id}" ${selected}>${u.nick}</option>`;
  });

  list.innerHTML = content;
};
