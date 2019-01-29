var connection, btnSend, txtMsg, txtDisplay, cbxShuffle, chatbox, id, users

window.onload = function () {
  users = []
  btnSend = document.getElementById('send')
  cbxShuffle = document.getElementById('shuffle')
  txtMsg = document.getElementById('texto')
  chatbox = document.getElementById("msgbox")
  nickBox = document.getElementById("nickname")
  list = document.getElementById("list")

  btnSend.addEventListener("click", send);
  txtMsg.addEventListener("keypress", function (e) {
    if (e.keyCode == 13) send()
  })
  nickBox.addEventListener("change", function () {
     connection.send(JSON.stringify({type: "NICK", nick: this.value}))
  });

  connect();
}

var connect = function () {
  connection = new WebSocket('wss://fictizia-ws-chat.herokuapp.com');
  connection.onopen = function (e) { console.log("OPEN", e); if (nickBox.value != '') connection.send(JSON.stringify({ type: "NICK", nick: nickBox.value}))};
  connection.onclose = function (e) { console.log("conexion close"); connect() };
  connection.onerror = function (error) { console.error('WebSocket Error ' + error); };
  connection.onmessage = function (e) { receive(e)};
}

var receive = function (e) {
  var msg = JSON.parse(e.data)
  console.log(msg.type, msg)

  switch (msg.type) {
    case 'HELO':
      id = msg.nick || msg.id;
      break;
    case 'LIST':
      document.getElementById("counter").innerHTML = msg.content.length;
      updateList(msg.content);
      break;
    case 'TEXT':
      chatbox.innerHTML +=
        '<div class="div_mensaje">' +
        '<p class="left nick">[' + msg.nick + ']:</p>' +
        '<p class="left mensaje">' + msg.content + '</p>' +
        '<p class="left hora">[' + msg.date + ']</p>' +
        '</div>'
      break;
    case 'CHAT':
    chatbox.innerHTML +=
      '<div class="div_mensaje">' +
      '<p class="left nick">[' + msg.nick + ']:</p>' +
      '<p class="left mensaje">(Private) ' + msg.content + '</p>' +
      '<p class="left hora">[' + msg.date + ']</p>' +
      '</div>'
    break;
    default: break;
  }
}

var send = function () {
  var now = new Date();
  var msg = {
    id: id,
    nick: nickBox.value || 'Anon' ,
    content: txtMsg.value,
    date: now.getHours() + ":" + now.getMinutes()
  }

  msg.type = list.options[list.selectedIndex].value == 'all' ? 'TEXT' : 'CHAT'
  msg.from = list.options[list.selectedIndex].value == 'all' ? null : users.find(function (e) { return e.id == id }).id

  console.log("selected", list.options[list.selectedIndex].value)

  if (cbxShuffle.checked) msg.content = shuffle(msg.content);

  connection.send(JSON.stringify(msg))
  txtMsg.value = ""
  
  chatbox.scrollTop = chatbox.scrollHeight
}

var shuffle = function (msg) {
  var str = msg
  var aux = str.split(" ");
  var result, temp, palabra;
  palabra = aux

  result = "";
  str = msg.split(" ")
  str = palabra
  for (var i = 0; i < palabra.length; i++) {
    temp = palabra[i].split("");
    for (var j = palabra[i].length - 1; j >= 0; j--)
      result += temp.pop(Math.floor(Math.random() * (j + 1)));
    result += (" ");
  }
  return result;
}

var updateList = function (list) {
  var content = '<option value="all">Todos</option>'
  users = list;
  for (i=0; i < list.length; i++) {
    content += '<option value="'+ list[i].id +'" disabled>'+list[i].nick+'</option>'
  }
  list.innerHTML = content;
}
