const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser')
const shortid = require('shortid');
const PORT = 8080
const cors = require('cors');
const { SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG } = require('constants');
const { debuglog } = require('util');
server.listen(PORT);

// Cors resovle
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

app.use(cors(corsOpts));
app.use(function (req, res, next) {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
   res.setHeader('Access-Control-Allow-Credentials', true);
   next();
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Socket communication
io.on('connection', function (socket) {
    socket.on('join', function (data) {
        socket.join(data.roomId);
        socket.room = data.roomId;
        const sockets = io.of('/').in().adapter.rooms[data.roomId];
        if(sockets.length===1){
            socket.emit('init')
        }else{
            if (sockets.length===2){
                io.to(data.roomId).emit('ready')
            }else{
                socket.room = null
                socket.leave(data.roomId)
                socket.emit('full')
            }
        }
    });
    socket.on('signal', (data) => {
        io.to(data.room).emit('desc', data.desc)        
    })
    socket.on('disconnect', () => {
        const roomId = Object.keys(socket.adapter.rooms)[0]
        if (socket.room){
            io.to(socket.room).emit('disconnected')
        }
    })
    socket.on('newChatMessage', data => {
        io.to(data.roomId).emit('newChatMessage', { text: data.message, type: data.type, sender: socket.id });
    });
    socket.on('typing', data => {
        // must use socket instead of io to boradcast event to other sockets, not whole room
        socket.to(data.roomId).emit('typing', { typing: data.typing, sender: socket.id });
    });
});


// Database Management
class Global {
    // Listening server port
    static serverPort = 3113
}
class Debug {
    static MODE = 'DEBUG' // 'PRODUCTION', 'FILE'
    static log(main, detail1 = '', detail2 = '', detail3 = '', detail4 = '', detail5 = '') {
        if (Debug.MODE === 'DEBUG') console.log(main + "\t", detail1 + "\t", detail2 + "\t",  detail3 + "\t", detail4 + "\t", detail5);
    }
    static err(main, detail1 = '', detail2 = '', detail3 = '', detail4 = '', detail5 = '') {
        if (Debug.MODE === 'DEBUG') console.error(main + "\t", detail1 + "\t", detail2 + "\t",  detail3 + "\t", detail4 + "\t", detail5);
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

        this.db = new this.sqlite3.Database("./vt-chatting.db", 
            this.sqlite3.OPEN_READWRITE | this.sqlite3.OPEN_CREATE, 
            (err) => {
                if (err) {
                return Debug.err(' Failed in opening database.', err.message);
                }
                Debug.log('Connected to the in-memory SQlite database.');
            }
        );
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
        this.db.run("CREATE TABLE if not exists meeting (id INTEGER PRIMARY KEY, email TEXT, fullname TEXT, nickname TEXT, age INTEGER, gender INTEGER, password TEXT, roomid TEXT, usercnt INTEGER, country TEXT, photo TEXT, nickuser INTEGER)",
            function (err) {
                if (err) Debug.err(' Failed in migration database.', err)
            }
        );
    }

    // Load initial value
    loadData() {
        Debug.log("SQLite: load initial data.");
        this.db.each("SELECT * FROM meeting",
            function (err, row) {
                if (err) {
                    Debug.err(' Failed in load initial data.', err)
                } else {
                    Debug.log(' Initial room data.', row.id, row.nickname, row.roomid, row.usercnt, row.password)
                }
            }
        );
    }

    // Save Normal user
    async saveSignUserData(email, fullname, nickname, age, gender, password, photo, res) {
        var _DB = this.db;

        var lastId
        try{
            lastId = await getLastIdFromTable(_DB); 
        } catch(e){
            Debug.err(e.message)
            if (!lastId) {
                return res.send({status: 2, message: 'SQLite: Failed in updating user'})
            }
        }

        _DB.get("SELECT count(*) cnt, * FROM meeting WHERE email=? AND fullname=? AND nickname=? AND password=?",
            [
                email,
                fullname,
                nickname,
                password
            ],
            async function (err, row) {
                if (err) {
                    Debug.err('SQLite:  Failed in setting user with userData', email, fullname, nickname);
                    return res.send({status: 2, message: err.message})
                } else {
                    if (row.cnt > 0) {
                        Debug.err('Duplicate user!')
                        return res.send({status: 2, message: 'Duplicate user!'})
                    } else {
                        const value = [lastId, email, fullname, nickname, age, gender, password, '', 0, 'Colombia', photo, 0];
                        await insertNewUser(_DB, value)
                        Debug.log(' Succeed in creating Normal User account!', nickname)

                        return res.send({status: 3, message: 'Create Success: ' + fullname})
                    }
                }
            }
        );
    }

    // Update user
    updateSignUserData(id, email, fullname, nickname, gender, age, country, photo, res) {
        var _DB = this.db;

        _DB.run("UPDATE meeting SET email=?, fullname=?, nickname=?, gender=?, age=?, country=?, photo=? WHERE id=?",
            [
                email, fullname, nickname, gender, age, country, photo, id
            ],
            function (err, row) {
                if (err) {
                    Debug.err('SQLite:  Failed in updating user with id', id, nickname)
                } else {
                    Debug.log(' Succeed in updating User account!', id, nickname)
                    res.send({status: 1, record: row})
                }
            }
        );
    }

    // Save Nick user
    async saveNicknameAndcheckRoom(nickname, age, gender, photo, res) {
        var _DB = this.db

        var lastId
        try{
            lastId = await getLastIdFromTable(_DB); 
        } catch(e){
            Debug.err(e.message)
            if (!lastId) {
                return res.send({status: 2, message: 'SQLite: Failed in updating user'})
            }
        }

        _DB.get("SELECT count(*) cnt, * FROM meeting WHERE nickname=?",
            [
                nickname,
            ],
            async function (err, row) {
                if (err) {
                    Debug.err('SQLite:  Failed in setting user with nickname', nickname);
                    return res.send({status: 2, message: err.message})
                } else {
                    if (row.cnt == 0) {
                        // id email fullname nickname age gender password roomid usercnt country photo

                        const value = [lastId, '', '', nickname, age, gender, '', '', 0, 'Colombia', photo, 1];
                        await insertNewUser(_DB, value)
                        Debug.log(' Succeed in creating Nick User account!', nickname)

                        var room_id
                        try{
                            room_id = await getAvailableRoom(_DB, nickname); 
                        } catch(e){
                            Debug.err(e.message, e.user)
                            room_id = null
                        }

                        try{
                            const {roomid, usercnt} = await updateUserInfoWithRoomid(_DB, nickname, room_id)
                            row.id = lastId
                            row.roomid = roomid
                            row.nickname = nickname
                            row.age = age
                            row.gender = gender
                            row.country = 'Colombia'
                            row.photo = photo
                            row.usercnt = usercnt
                        } catch(e){
                            Debug.err(e.message, e.user)
                            return null;
                        }
                    } else {
                        Debug.err('Duplicate nickname!', nickname)
                        return res.send({status: 2, message: 'Duplicate nickname!'})
                    }

                    return res.send({status: 1, message: 'Login success: ' + row.nickname, record: row})
                }
            }
        );
    }

    // Get user 
    getSignUserData(emailOruser, password, res) {
        var _DB = this.db
        _DB.get("SELECT count(*) cnt, * FROM meeting WHERE email=? AND password=?",
        [
            emailOruser,
            password
        ],
            async function (err, row) {
                if (err) {
                    Debug.err('SQLite:  Failed in getting user with email & password', emailOruser, password);
                    return;
                } else {
                    if (row.cnt === 0) {
                        getSignUserDataWithFullnameAndPassword(_DB, emailOruser, password, res)
                        return;
                    } 

                    if (row.roomid === '' && row.usercnt === 0) {
                        var room_id
                        try{
                            room_id = await getAvailableRoom(_DB, row.email); 
                        } catch(e){
                            Debug.err(e.message, e.user)
                            room_id = null
                        }

                        try{
                            const {roomid, usercnt} = await updateUserInfoWithRoomid(_DB, row.nickname, room_id)
                            row.roomid = roomid
                            row.usercnt = usercnt
                        } catch(e){
                            Debug.err(e.message, e.user)
                            return null;
                        }
                    }

                    Debug.log(' Succeed in getting user with email & password', row.email);
                    return res.send({status: 1, message: "Login succeed with email & password!", nickname: row.nickname, record: row})
                }
            }
        );
    }

    // Get forgot password
    getForgotPassword(emailOruser, res) {
        var _DB = this.db
        _DB.get("SELECT count(*) cnt, * FROM meeting WHERE email=?",
        [
            emailOruser
        ],
            function (err, row) {
                if (err) {
                    Debug.err('SQLite:  Failed in getting password with email', emailOruser);
                    getForgotPasswordWithFullname(_DB, emailOruser, res)
                    return;
                } else {
                    if (row.cnt === 0) {
                        getForgotPasswordWithFullname(_DB, emailOruser, res)
                        return;
                    } 

                    Debug.log('SQLite:  Succeed in getting password with email', row.password);
                    return res.send({status: 4, message: "Retrive password: " + row.password})
                }
            }
        );
    }

    // Get Peer User data
    getPeerUserInfo(roomId, userId, res) {
        var _DB = this.db
        _DB.get("SELECT count(*) cnt, * FROM meeting WHERE roomid=? AND id!=?",
        [
            roomId, userId
        ],
            function (err, row) {
                if (err) {
                    Debug.err('SQLite:  Failed in getting remote user', roomId, userId);
                    return res.send({status: 2})
                } else {
                    Debug.log(' Succeed in getting remote user', roomId, userId);
                    return res.send({status: 1, record: row})
                }
            }
        );
    }

    // Set disconnected user data
    setDisconnectUser(roomId, userId, nickUser, res) {
        var _DB = this.db

        if (parseInt(nickUser) === 0) { //Logged user
            _DB.run("UPDATE meeting SET roomid=?, usercnt=? WHERE roomid=? AND id=?",
            [
                '', 0, roomId, userId
            ],
            function (err, row) {
                if (err) 
                    return Debug.err(' SQLITE: Failed in updating the disconnected normal user.', roomId, userId)
                
                Debug.log(' Succeed in updating the disconnected normal user.', roomId, userId)
                updateUserAfterRemoteUserDisconnet(_DB, roomId, userId, '', res)
            })
        } 
        if (parseInt(nickUser) === 1) { //Nick user
            _DB.run(`DELETE FROM meeting WHERE id=?`, userId, function(err) {
                if (err) 
                  return Debug.err(err.message);

                Debug.log(' Succeed in deleting the disconnect nick user.', roomId, userId);
                updateUserAfterRemoteUserDisconnet(_DB, roomId, userId, '', res)
            })
        }
    }

    // Set Remote user data
    setNextUser(roomId, userId, nickUser, res) {
        var _DB = this.db

        _DB.get("SELECT count(*) cnt, * FROM meeting WHERE roomId=?",
        [
            roomId,
        ],
            async function (err, row) {
                if (err) {
                    Debug.err('SQLite:  Failed in getting user with roomId', roomId, nickUser);
                    return;
                } else {
                    updateRoomUsers(_DB, roomId, userId, row.cnt, row.nickname, res)
                }
            }
        )
    }
}
Sqlite.getInstance().init()

function getLastIdFromTable(_DB) {
    return new Promise(async (resolve, reject) => {
        await _DB.get("SELECT count(*) cnt, * FROM meeting WHERE id = (SELECT MAX(id) FROM meeting)",
            function (err, row) {
                if (err) {
                    reject({ message: 'SQLite:  Failed in getting last User id' })
                } else {
                    if (row.cnt !== 0) {
                        Debug.log(' Last User id.', row.id, row.nickname)
                        resolve(row.id + 1)
                    } else {
                        Debug.log(' First User id.', 0)
                        resolve(0)
                    }
                }
            }
        );
    })
}
function insertNewUser(_DB, value) {
    const stmt = _DB.prepare("INSERT INTO meeting VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
    stmt.run(value);
    stmt.finalize();
}
function getSignUserDataWithFullnameAndPassword(_DB, emailOruser, password, res) {
    _DB.get("SELECT count(*) cnt, * FROM meeting WHERE fullname=? AND password=?",
        [
            emailOruser,
            password
        ],
        async function (err, row) {
            if (err) {
                Debug.err('SQLite:  Failed in getting user with fullname & password', emailOruser, password);
                return res.send({status: 2, message: "Create your account first!"})
            } else {
                if (row.cnt > 0) {
                    if (row.roomid === '' && row.usercnt === 0) {
                        var room_id
                        try{
                            room_id = await getAvailableRoom(_DB, row.fullname); 
                        } catch(e){
                            Debug.err(e.message, e.user)
                            room_id = null
                        }

                        try{
                            const {roomid, usercnt} = await updateUserInfoWithRoomid(_DB, row.nickname, room_id)
                            row.roomid = roomid
                            row.usercnt = usercnt
                        } catch(e){
                            Debug.err(e.message, e.user)
                            return null;
                        }
                    }
                    
                    return res.send({status: 1, message: "Login succeed with fullname " + row.fullname, record: row})
                } else {
                    return res.send({status: 2, message: "Create your account first. " + row.fullname, record: row})
                }
            }
        }
    );
}
function getForgotPasswordWithFullname(_DB, emailOruser, res) {
    _DB.get("SELECT count(*) cnt, * FROM meeting WHERE fullname=?",
        [
            emailOruser
        ],
        function (err, row1) {
            if (err) {
                Debug.err('SQLite:  Failed in getting password with fullname', emailOruser);
                return res.send({ status: 2, message: "Create your account first!" })
            } else {
                if (row1.cnt === 0) {
                    Debug.log('SQLite:  Failed in getting password with fullname', emailOruser);
                    return res.send({status: 2, message: "Create your account first!"})
                } 

                Debug.log('SQLite:  Succeed in getting password with fullname', row1.password);
                return res.send({status: 4, message: "Retrive password: " + row1.password })
            }
        }
    );
}
function getAvailableRoom(_DB, name) {
    return new Promise(async (resolve, reject) => {
        await _DB.get("SELECT count(*) cnt, * FROM meeting WHERE usercnt=1 LIMIT 1",
            function (err, row) {
                if (err) {
                    reject({ message: 'SQLite:  Failed in searching user', user: name })
                } else {
                    if (row.cnt !== 0) {
                        Debug.log(' Available room name.', row.roomid, row.usercnt, row.nickname)
                        resolve(row.roomid)
                    } else {
                        reject({ message: ' Failed in searching user', user: name })
                    }
                }
            }
        );
    })
}
function updateUserInfoWithRoomid(_DB, nickname, roomid) {
    var usercnt = 0
    if (!roomid) {
        usercnt = 1
        roomid = shortid.generate()
        return new Promise(async (resolve, reject) => {
            await _DB.run("UPDATE meeting SET roomid=?, usercnt=? WHERE nickname=?",
                [
                    roomid,
                    usercnt,
                    nickname
                ],
                function (err, row) {
                    if (err) {
                        reject({ message: 'SQLite:  Failed in updating user', user: nickname })
                    } else {
                        Debug.log(' Available room name with one user.', roomid, usercnt, nickname)
                        resolve( {roomid: roomid, usercnt: usercnt })
                    }
                }
            );
        })
    } else if (roomid) {
        usercnt = 2

        return new Promise(async (resolve, reject) => {
            await _DB.run("UPDATE meeting SET usercnt=?, roomid=? WHERE roomid=? OR nickname=?",
                [
                    usercnt,
                    roomid,
                    roomid,
                    nickname,
                ],
                function (err, row) {
                    if (err) {
                        reject({ message: 'SQLite:  Failed in updating user with roomid', user: nickname })
                    } else {
                        Debug.log(' Available room name with two user.', roomid, usercnt, nickname)
                        resolve( {roomid: roomid, usercnt: usercnt })
                    }
                }
            );
        })
    }
}
function updateUserAfterRemoteUserDisconnet(_DB, roomId, userId, nickname, res) {
    _DB.run("UPDATE meeting SET roomid=?, usercnt=? WHERE roomid=? AND id!=?",
    [
        roomId, 1, roomId, userId
    ],
    async function (err, row) {
        if (err) 
            return Debug.err(' SQLITE: Failed in updating the remote user.', roomId, userId)
        
        const room_id = await getAvailableRoom(_DB, nickname);
        await updateUserRoomId(_DB, room_id, userId);

        Debug.log(' Succeed in updating the remote user.', roomId, userId)
        return res.send({status: 1, message: 'Updated Room remote user', newroom: room_id})
    })
}
function updateRoomUsers(_DB, roomId, userId, userCount, nickname, res) {
    _DB.run("UPDATE meeting SET roomid=?, usercnt=? WHERE roomid=? AND id=?",
    [
        roomId, 1, roomId, userId
    ],
    async function (err, row) {
        if (err) 
            return Debug.err(' SQLITE: Failed in updating the Room users.', roomId, userId)
        
        if (userCount === 2) return updateUserAfterRemoteUserDisconnet(_DB, roomId, userId, nickname)

        const room_id = await getAvailableRoom(_DB, nickname);
        await updateUserRoomId(_DB, room_id, userId);

        Debug.log(' Succeed in updating the Room users.', room_id, userId)
        return res.send({status: 1, message: 'Updated Room user', newroom: room_id})
    })
}
function updateUserRoomId(_DB, roomId, userId) {
    _DB.run("UPDATE meeting SET roomid=?, usercnt=? WHERE id=?",
    [
        roomId, 2, userId
    ],
    async function (err, row) {
        if (err) 
            Debug.err(' SQLITE: Failed in updating the User roomid.', roomId, userId)
        else {
            Debug.log(' Succeed in updating the User roomid.', room_id, userId)
        }
    })
}

app.post('/saveSignUserData', function (req, res) {
    const { email, fullname, nickname, age, gender, password, photo } = req.body
    Sqlite.getInstance().saveSignUserData(email, fullname, nickname, age, gender, password, photo, res)
})
app.post('/saveNicknameAndcheckRoom', function (req, res) {
    const { nickname, age, gender, photo } = req.body
    Sqlite.getInstance().saveNicknameAndcheckRoom(nickname, age, gender, photo, res)
})
app.post('/updateSignUserData', function (req, res) {
    // const { photo } = req.body
    // var id, email, fullname, nickname, gender, age, country 
    const { id, email, fullname, nickname, gender, age, country, photo } = req.body
    Sqlite.getInstance().updateSignUserData(id, email, fullname, nickname, gender, age, country, photo, res)
})
app.post('/getSignUserData', function (req, res) {
    const { emailOruser, password } = req.body
    Sqlite.getInstance().getSignUserData(emailOruser, password, res)
})
app.post('/getForgotPassword', function (req, res) {
    const { emailOruser } = req.body
    const ret = Sqlite.getInstance().getForgotPassword(emailOruser, res)
})
app.post('/getPeerUserInfo', function (req, res) {
    const { roomId, userId } = req.body
    Sqlite.getInstance().getPeerUserInfo(roomId, userId, res)
})
app.post('/setDisconnectUser', function (req, res) {
    const { roomId, userId, nickUser } = req.body
    Sqlite.getInstance().setDisconnectUser(roomId, userId, nickUser, res)
})
app.post('/setNextUser', function (req, res) {
    const { roomId, userId, nickUser } = req.body
    Sqlite.getInstance().setNextUser(roomId, userId, nickUser, res)
})
app.use('*', (req, res) => {
    res.status(404).json({ msg: 'Not Found' })
})

require('http').createServer(app).listen(Global.serverPort);
Debug.log("Http server is running on Port: " + Global.serverPort)