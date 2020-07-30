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
    static log(main, detail1 = '', detail2 = '', detail3 = '', detail4 = '') {
    if (Debug.MODE === 'DEBUG') console.log(main + "\t", detail1 + "\t", detail2 + "\t",  detail3 + "\t", detail4);
    }
    static err(main, detail1 = '', detail2 = '', detail3 = '', detail4 = '') {
    if (Debug.MODE === 'DEBUG') console.error(main + "\t", detail1 + "\t", detail2 + "\t",  detail3 + "\t", detail4);
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
        this.db.run("CREATE TABLE if not exists meeting (email TEXT, fullname TEXT, nickname TEXT, age INTEGER, gender INTEGER, password TEXT, roomid TEXT, usercnt INTEGER)",
            function (err) {
                if (err) Debug.err(' Failed in migration database.', err)
            }
        );
    }

    // Load initial value
    loadData() {
        Debug.log("SQLite: load initial data.");
        this.db.each("SELECT email, fullname, nickname, age, gender, password, roomid, usercnt FROM meeting",
            function (err, row) {
                if (err) {
                    Debug.err(' Failed in load initial data.', err)
                } else {
                    Debug.log(' Initial room data.', row.email, row.nickname, row.roomid, row.usercnt)
                }
            }
        );
    }

    // Save Normal user
    saveSignUserData(email, fullname, nickname, age, gender, password, res) {
        var _DB = this.db;

        _DB.get("SELECT count(*) cnt, fullname FROM meeting WHERE email=? AND fullname=? AND nickname=? AND password=?",
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
                        const value = [email, fullname, nickname, age, gender, password, '', 0];
                        await insertNewUser(_DB, value)
                        Debug.log(' Succeed in creating Normal User account!', nickname)

                        return res.send({status: 3, message: 'Create Success: ' + fullname})
                    }
                }
            }
        );
    }

    // Save Nick user
    saveNicknameAndcheckRoom(nickname, age, gender, res) {
        var _DB = this.db
        _DB.get("SELECT count(*) cnt, nickname, roomid, usercnt FROM meeting WHERE nickname=?",
            [
                nickname,
            ],
            async function (err, row) {
                if (err) {
                    Debug.err('SQLite:  Failed in setting user with nickname', nickname);
                    return res.send({status: 2, message: err.message})
                } else {
                    if (row.cnt == 0) {
                        const value = ['', '', nickname, age, gender, '', '', 0];
                        await insertNewUser(_DB, value)
                        Debug.log(' Succeed in creating Nick User account!', nickname)

                        var roomid
                        try{
                            roomid = await getAvailableRoom(_DB, nickname); 
                        } catch(e){
                            Debug.err(e.message, e.user)
                            roomid = null
                        }

                        try{
                            roomid = await updateUserInfoWithRoomid(_DB, nickname, roomid)
                            row.roomid = roomid
                            row.nickname = nickname
                        } catch(e){
                            Debug.err(e.message, e.user)
                            return null;
                        }
                    } 

                    return res.send({status: 1, message: 'Login success: ' + row.nickname, nickname: row.nickname, roomid: row.roomid})
                }
            }
        );
    }

    // Get user 
    getSignUserData(emailOruser, password, res) {
        var _DB = this.db
        _DB.get("SELECT count(*) cnt, email, nickname, roomid, usercnt FROM meeting WHERE email=? AND password=?",
        [
            emailOruser,
            password
        ],
            async function (err, row) {
                if (err) {
                    Debug.err('SQLite:  Failed in getting user with email & password', emailOruser, password);
                    // getSignUserDataWithFullnameAndPassword(_DB, emailOruser, password, res)
                    return;
                } else {
                    if (row.cnt === 0) {
                        getSignUserDataWithFullnameAndPassword(_DB, emailOruser, password, res)
                        return;
                    } 

                    Debug.log('SQLite:  Succeed in getting user with email & password', row.email);

                    if (row.roomid === '' && row.usercnt === 0) {
                        var roomid
                        try{
                            roomid = await getAvailableRoom(_DB, row.email); 
                        } catch(e){
                            Debug.err(e.message, e.user)
                            roomid = null
                        }

                        try{
                            roomid = await updateUserInfoWithRoomid(_DB, row.nickname, roomid)
                            row.roomid = roomid
                        } catch(e){
                            Debug.err(e.message, e.user)
                            return null;
                        }
                    }

                    return res.send({status: 1, message: "Login succeed with email & password!", nickname: row.nickname, roomid: row.roomid})
                }
            }
        );
    }

    // Get forgot password
    getForgotPassword(emailOruser, res) {
        var _DB = this.db
        _DB.get("SELECT count(*) cnt, password FROM meeting WHERE email=?",
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
    
}
Sqlite.getInstance().init()

function insertNewUser(_DB, value) {
    const stmt = _DB.prepare("INSERT INTO meeting VALUES (?,?,?,?,?,?,?,?)");
    stmt.run(value);
    stmt.finalize();
}
function getSignUserDataWithFullnameAndPassword(_DB, emailOruser, password, res) {
    _DB.get("SELECT count(*) cnt, fullname, nickname, roomid, usercnt FROM meeting WHERE fullname=? AND password=?",
        [
            emailOruser,
            password
        ],
        async function (err, row1) {
            if (err) {
                Debug.err('SQLite:  Failed in getting user with fullname & password', emailOruser, password);
                return res.send({status: 2, message: "Create your account first!"})
            } else {
                if (row1.cnt === 0) {
                    Debug.log('SQLite:  Failed in getting user with fullname & password', emailOruser, password);
                    return res.send({status: 2, message: "Create your account first!"})
                } 

                Debug.log('SQLite:  Succeed in getting user with fullname & password', row1.fullname);

                if (row.roomid === '' && row.usercnt === 0) {
                    var roomid
                    try{
                        roomid = await getAvailableRoom(_DB, row1.fullname); 
                    } catch(e){
                        Debug.err(e.message, e.user)
                        roomid = null
                    }

                    try{
                        roomid = await updateUserInfoWithRoomid(_DB, row1.nickname, roomid)
                        row1.roomid = roomid
                    } catch(e){
                        Debug.err(e.message, e.user)
                        return null;
                    }
                }
                
                return res.send({status: 1, message: "Login succeed with fullname & password!", nickname: row1.nickname, roomid: row1.roomid})
            }
        }
    );
}
function getForgotPasswordWithFullname(_DB, emailOruser, res) {
    _DB.get("SELECT count(*) cnt, password FROM meeting WHERE fullname=?",
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
        await _DB.get("SELECT count(*) cnt, email, fullname, nickname, age, gender, password, roomid, usercnt FROM meeting WHERE usercnt=1 LIMIT 1",
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
                        resolve(roomid)
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
                        resolve(roomid)
                    }
                }
            );
        })
    }
}

app.post('/saveSignUserData', function (req, res) {
    const { email, fullname, nickname, age, gender, password } = req.body
    Sqlite.getInstance().saveSignUserData(email, fullname, nickname, age, gender, password, res)
})
app.post('/saveNicknameAndcheckRoom', function (req, res) {
    const { nickname, age, gender } = req.body
    Sqlite.getInstance().saveNicknameAndcheckRoom(nickname, age, gender, res)
})
app.post('/getSignUserData', function (req, res) {
    const { emailOruser, password } = req.body
    Sqlite.getInstance().getSignUserData(emailOruser, password, res)
})
app.post('/getForgotPassword', function (req, res) {
    const { emailOruser } = req.body
    const ret = Sqlite.getInstance().getForgotPassword(emailOruser, res)
})
app.use('*', (req, res) => {
    res.status(404).json({ msg: 'Not Found' })
})

require('http').createServer(app).listen(Global.serverPort);
Debug.log("Http server is running on Port: " + Global.serverPort)