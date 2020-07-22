/**
 * @file tuber-time web server.
 * @version 2.0.0
 */

'use strict';

var easyrtc = require('open-easyrtc');
var express = require('express');
var io = require('socket.io');
var bodyParser = require('body-parser')
const request = require('request')
const cors = require('cors')

var webServer = null;
var webrtcApp = express();

const corsOpts = {
   origin: '*',
   methods: [
      'GET',
      'POST',
   ],
   allowedHeaders: [
      'Content-Type',
   ],
};

webrtcApp.use(cors(corsOpts));
webrtcApp.use(function (req, res, next) {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
   res.setHeader('Access-Control-Allow-Credentials', true);
   next();
});

webrtcApp.use(bodyParser.urlencoded({ extended: false }))
webrtcApp.use(bodyParser.json())
// Set up routes for static resources
webrtcApp.use('/', express.static(__dirname + '/public'));
webrtcApp.use('/room', express.static(__dirname + '/public'));
webrtcApp.use('/login', express.static(__dirname + '/public'));
webrtcApp.use('/join', express.static(__dirname + '/public'));
webrtcApp.use('/js', express.static(__dirname + '/public/js'));
webrtcApp.use('/static', express.static(__dirname + '/public/static'));
webrtcApp.use('/static/css', express.static(__dirname + '/public/static/css'));
webrtcApp.use('/static/js', express.static(__dirname + '/public/static/js'));
webrtcApp.use('/static/media', express.static(__dirname + '/public/static/media'));


class Global {
   // static password = "Lokesh09876"
   // static rooms = {}

   // Listening server port
   static serverPort = 3333
   // static makeRoomNameFrom(username, meetingId) {
   //    const meetingIDs = meetingId.split("-")
   //    return username + '-' + meetingIDs[1] + meetingIDs[2] + meetingIDs[3]
   // }
   // static makeOwnerUrl(roomName, userName) {
   //    return 'https://chat.contactprocrm.com/login?room=' + roomName + '&username=' + userName
   // }
   // static makeJoinerUrl(roomName) {
   //    return 'https://chat.contactprocrm.com/join?room=' + roomName
   // }
}

class RoomInfo {
   constructor(email, firstName, lastName, age, password) {
      this.email = email;
      this.firstName = firstName;
      this.lastName = lastName;
      this.age = age;
      this.password = password;
   }
}

class Debug {
   static MODE = 'DEBUG' // 'PRODUCTION', 'FILE'
   static log(main, detail1 = '', detail2 = '', detail3 = '') {
      if (Debug.MODE === 'DEBUG') console.log(main + "\t", detail1 + "\t", detail2 + "\t", detail3);
   }
   static err(main, detail1 = '', detail2 = '', detail3 = '') {
      if (Debug.MODE === 'DEBUG') console.error(main + "\t", detail1 + "\t", detail2 + "\t", detail3);
   }

}
class Sqlite {
   static _sqlite = null
   // Static function to create instance if not exists and return its instance.
   static getInstance() {
      if (!Sqlite._sqlite) {
         Sqlite._sqlite = new Sqlite()
      }
      return Sqlite._sqlite;
   }

   // Load sqlite3 library and open database
   constructor() {
      this.sqlite3 = require('sqlite3').verbose();
      Debug.log("SQLite: open database.");
      this.db = new this.sqlite3.Database('vt-chatting.db', function (err) {
         Debug.err(' Failed in opening database.', err)
      });
   }

   // Initialize Sqlite (migaration and load saved data)
   init() {
      Debug.log("SQLite: initialize.");
      this.migration();
      this.loadData();
   }
   // Migration Sqlite. Function to create data table if it is not exists.
   migration() {
      Debug.log("SQLite: execute migration.");
      this.db.run("CREATE TABLE if not exists meeting (email TEXT PRIMARY KEY, firstName TEXT, lastName TEXT, age INTEGER, password TEXT)",
         function (err) {
            if (err) Debug.err(' Failed in migration database.', err)
         }
      );
   }

   // Load initial value
   loadData() {
      Debug.log("SQLite: load initial data.");
      this.db.each("SELECT email, firstName, lastName, age, password FROM meeting",
         function (err, row) {
            if (err) {
               Debug.err(' Failed in load initial data.', err)
            } else {
               Debug.log(' Initial room data.', row)
            }
         }
      );
   }

   // Set user
   setSignUserData(age, email, firstName, lastName, password) {
      Debug.log('SQLite: create room.', { age, email, firstName, lastName, password })

      const stmt = this.db.prepare("INSERT INTO meeting VALUES (?,?,?,?,?)");
      
      const today = new Date().toLocaleDateString(undefined, {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit'
      })

      stmt.run(today, age, email, firstName, lastName, password);
      stmt.finalize();
   }

   // Get user
   getSignUserData(email, password) {
      Debug.log('SQLite: create room.', { email, password })

      this.db.run("SELECT count(*) cnt WHERE email=?, password=?",
         [
            email,
            password
         ],
         function (err, row) {
            if (err) {
               return Debug.err('SQLite:  Failed in entering owner', err.message);
            } else {
               return row
            }
         }
      );
   
   }
}
Sqlite.getInstance().init()


// Post/Get Messages
webrtcApp.post('/setSignUserData', function (req, res) {
   const { age, email, firstName, lastName, password } = req.body
   // Save info to Sqlite database
   Sqlite.getInstance().setSignUserData(age, email, firstName, lastName, password)
   // response to client
   res.send({ value: 'Success' });
})

webrtcApp.post('/getSignUserData', function (req, res) {
   const { email, password } = req.body
   // Save info to Sqlite database
   const ret = Sqlite.getInstance().getSignUserData(email, password)
   // response to client
   console.log('getSignUserData ------------', ret)
   res.send({ value: ret });
})

// Catch all to handle all other requests that come into the app.
webrtcApp.use('*', (req, res) => {
   res.status(404).json({ msg: 'Not Found' })
})

webServer = require('http').createServer(webrtcApp).listen(Global.serverPort);
Debug.log("Http server is running on Port: " + Global.serverPort)
const socketServer = io.listen(webServer, { 'log level': 0 });


// Set up easyrtc specific options
easyrtc.setOption('demosEnable', false);

// Use appIceServers from settings.json if provided. The format should be the same
// as that used by easyrtc (http://easyrtc.com/docs/guides/easyrtc_server_configuration.php)
easyrtc.setOption('appIceServers', [
   {
      'url': 'turn:turn.contactprocrm.com:3478', "username": "bruno", "credential": "crmsite"
   },
   {
      'url': 'turn:csturn.contactprocrm.com:3478', "username": "bruno", "credential": "crmsite"
   }
]);
easyrtc.listen(webrtcApp, socketServer);

/// Chating
const saveMsgContent = (peerName, roomName, content) => {
   const retMessage = { username: peerName, message: content.message, time: content.time }
   const retFile = { username: peerName, content: content.message, time: content.time, name: content.title }

   if (Global.rooms[roomName]) {
      content.title ? Global.rooms[roomName].file.push(retFile) : Global.rooms[roomName].chat.push(retMessage)
   }
}

easyrtc.events.on("easyrtcMsg", function (connectionObj, message, callback) {
   switch (message.msgType) {
      case 'save_message_content':
         saveMsgContent( message.msgData.clientName, message.msgData.roomName, message.msgData.content);
         // saveMsgContent(message.msgData.clientId, message.msgData.clientName, message.msgData.roomName, message.msgData.content);

         return true
   }
   connectionObj.events.emitDefault("easyrtcMsg", connectionObj, message, callback);
});

// Owner leave the Room via socket.io
easyrtc.events.on("roomLeave", function (connectionObj, roomName, callback) {  
   connectionObj.events.emitDefault("roomLeave", connectionObj, roomName, callback);
   if (roomName != 'default') {
      if (!Global.rooms[roomName]) {
         Debug.err(' RoomLeave. ', roomName)
      } else {
         if (Global.rooms[roomName].owner === roomName && Global.rooms[roomName].child.length !== 0) {
            var duration = Math.floor((Date.now() - Global.rooms[roomName].enterTime) / 1000);

            const exithistory = { meeting_id: Global.rooms[roomName].meeting_id, duration: duration, chat: Global.rooms[roomName].chat, 
                                    file: Global.rooms[roomName].file }
            console.log(' Chatting History: ', roomName, Global.rooms[roomName], exithistory)

            for (const childConnectionObj of Global.rooms[roomName].child) {
               childConnectionObj.disconnect(() => { });
            }

            request.post(Global.rooms[roomName].return_url, {
               json: {
                  reqData: exithistory
               }
            }, (err, res, body) => {
               if (err) {
                  Debug.err(' Failed in sending room history. ', err)
                  return
               }

               Global.rooms[roomName].enter_room = 'leave'
               Global.rooms[roomName].owner = ''
               Global.rooms[roomName].chat = []
               Global.rooms[roomName].file = []
               Global.rooms[roomName].child = []
               // Sqlite.getInstance().ownerStatus(roomName, 'leave');
            })
         }
      }
   }
});

// Owner Join the Room via socket.io
easyrtc.events.on("roomJoin", function (connectionObj, roomName, roomParam, callback) {  // Owner create the Room
   if (roomName != 'default') {
      if (!Global.rooms[roomName])
         return

      if (Global.rooms[roomName].child.length === 0) {
         Global.rooms[roomName].enterTime = Date.now()
         Global.rooms[roomName].owner = roomName
         Global.rooms[roomName].chat = []
         Global.rooms[roomName].file = []
         Global.rooms[roomName].child.push(connectionObj); // means owner
      }
      Debug.log(' All data after joining to room', Global.rooms)
   }
   connectionObj.events.emitDefault("roomJoin", connectionObj, roomName, roomParam, callback);
});


