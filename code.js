var connection, btnSend, txtMsg, txtDisplay, cbxShuffle, chatbox, id

window.onload = function () {
  btnSend = document.getElementById('send')
  txtDisplay = document.getElementById('chatbox')
  cbxShuffle = document.getElementById('shuffle')
  txtMsg = document.getElementById('texto')
  chatbox = document.getElementById("chatbox")

  btnSend.addEventListener("click", send);
  txtMsg.addEventListener("keypress", function (e) {
    if (e.keyCode == 13) send()
  })

  connect();
}

var connect = function () {
  connection = new WebSocket('wss://fictizia-ws-chat.herokuapp.com');
  connection.onopen = function (e) { console.log("OPEN", e) };
  connection.onclose = function (e) { console.log("conexion close"); connect() };
  connection.onerror = function (error) { console.error('WebSocket Error ' + error); };
  connection.onmessage = function (e) { receive(e)};
}

var receive = function (e) {
  var msg = JSON.parse(e.data)
  var type = msg.type
  var date = msg.date
  var nick = msg.id
  var text = msg.text

  if (type == 'HELO') id = nick;
  else {
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
  var input = document.getElementById("texto")
  var msg = {
    id: id,
    text: input.value,
    date: now.getHours() + ":" + now.getMinutes()
  }

  if (cbxShuffle.checked) msg.text = shuffle(msg.text);

  connection.send(JSON.stringify(msg))
  input.value = ""
  
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
