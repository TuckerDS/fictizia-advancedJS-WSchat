# fictizia-advancedJS-WSchat
Ejercicio de implementación de Websockets

## Run
* Arrancar servidor de estáticos:
```
json-server --watch db.json -c conf.json --static .
```
Se arranca por defecto en el puerto 3000, para cambiarlo editar el **conf.json**.

* Arrancar servidor websocket
```
node server.js
```
Se arranca por defecto en el puerto 3001, para cambiarlo editar el **sever.json** y el **index.html**.

## Dependecias
* **ws** https://github.com/websockets/ws
* **json-server** https://github.com/typicode/json-server

## DEMO
https://tuckerds.github.io/fictizia-advancedJS-WSchat/

