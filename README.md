chat_system_node
================

School project srp chat systeem gemaakt met nodejs

Simpele chat systeem gemaakt waarbij je nieuwe gebruikers kunt aanmaken. Iedereen kan met elkaar chatten en dit 
wordt in realtime getoont. 

Modules:
Express
Socket.io
http
path
mongodb

Controller - app.js
Hiermee kun je de app aanroepen doormiddel van de command: node app.js

In dit bestand wordt alles geregeld en kun je zien als een grote controller.

Model Mongodb - Prover
Ik heb een Provider class gemaakt waarme je queries kunt aanroepen met mongodb. 
Hierin kun je aangeven wat je wilt opvragen en in welke collectie van mongodb.

Socket.io
Socket.io regelt de realtime communicatie met de server en de client.

Chat.js
Dit is de client script voor het regelen van de socket.io.


