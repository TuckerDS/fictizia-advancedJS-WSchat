var connection, btnSend, txtMsg, txtDisplay, cbxShuffle, chatbox, id

window.onload = function () {
  btnSend = document.getElementById('send')
  txtDisplay = document.getElementById('msgbox')
  cbxShuffle = document.getElementById('shuffle')
  txtMsg = document.getElementById('texto')
  chatbox = document.getElementById("msgbox")
  nickBox = document.getElementById("nickname")

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
  var type = msg.type
  var date = msg.date
  var nick = msg.nick || msg.id
  var text = msg.text

  if (type == 'HELO') id = nick;
  else if (type == 'LIST') {
    document.getElementById("counter").innerHTML = msg.list.length;
    updateList(msg.list)
  } else {
    txtDisplay.innerHTML +=
      '<div class="div_mensaje">' +
      '<p class="left nick">[' + nick + ']:</p>' +
      '<p class="left mensaje">' + text + '</p>' +
      '<p class="left hora">[' + date + ']</p>' +
      '</div>'
  }
}

var send = function () {
  var now = new Date();
  var msg = {
    id: id,
    nick: nickBox.value || 'Anon' ,
    text: txtMsg.value,
    date: now.getHours() + ":" + now.getMinutes()
  }

  if (cbxShuffle.checked) msg.text = shuffle(msg.text);

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
  var content = ''
  for (i=0; i < list.length; i++) {
    content += '<option value="'+ list[i].nick +'">'+list[i].nick+'</option>'
  }
  document.getElementById("list").innerHTML = content;
}
