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
  list.addEventListener('change', function () {selectedChat = this.options[this.selectedIndex].value;});

  connect();
};

var connect = function () {
  clearInterval(intervalId);
  connection = new WebSocket('wss://fictizia-ws-chat.herokuapp.com');
  connection.onopen = (e) => { console.log('OPEN', e); if (nickBox.value != '') connection.send(JSON.stringify({ type: 'NICK', nick: nickBox.value}));};
  connection.onclose = (e) => { console.log('conexion close'); connect();};
  connection.onerror = (error) => { console.error(`WebSocket Error ${error}`); };
  connection.onmessage = e => receive(e);
  intervalId = setInterval(() => {console.log('PING'); connection.send(JSON.stringify({type:'PING'}))}, 30000);
};

var receive = function (e) {
  var msg = JSON.parse(e.data);
  console.log(msg.type, msg);

  var ACTIONS = {
    'HELO': () => id = msg.nick || msg.id,
    'TEXT': () => addMsg(msg.nick, msg.content, msg.date),
    'CHAT': () => addMsg(msg.nick, `(Private to ${users.find(e => e.id == msg.to).nick}) ${msg.content}`, msg.date),
    'LIST': () => {
      counter.innerHTML = msg.content.length;
      updateList(msg.content);
    }
  };

  if (ACTIONS[msg.type]) ACTIONS[msg.type]();
};

var send = function () {
  var now = new Date();
  var msg = {
    'id': id,
    'nick': nickBox.value || 'Anon' ,
    'content': txtMsg.value,
    'date': `${now.getHours()}:${now.getMinutes()}`
  };

  msg.type = selectedChat == 'all' ? 'TEXT' : 'CHAT';
  msg.to = selectedChat == 'all' ? null : selectedChat;

  if (cbxShuffle.checked) msg.content = shuffle(msg.content);
  if (msg.type == 'CHAT') receive({data:JSON.stringify(msg)});
  txtMsg.value = '';
  chatbox.scrollTop = chatbox.scrollHeight;
  connection.send(JSON.stringify(msg));
}

var shuffle = function (msg) {
  var res = [];
  msg.split(' ').forEach(p => {
    var chars = p.split('');
    res = [...res, ...p.split('').map(() => chars.splice(Math.floor(Math.random() * (chars.length - 1)), 1)), ' '];
  });
  return res.join('');
};

var addMsg = function(nick, content, date) {
   chatbox.innerHTML +=
      `<div class="div_mensaje">
      <p class="left nick">[${nick}]:</p><p class="left mensaje">${content}</p><p class="left hora">[${date}]</p>
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
