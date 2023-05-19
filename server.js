var express = require('express');
const { readFile } = require('fs');
var app = express();
app.use(express.static("public"))
app.set("view engine", 'ejs')
app.set('views', './views')

var server = require('http').Server(app)
var io = require("socket.io")(server);

var hostname = 'localhost'

var dbuserFile;
var dbuser = {};


var db_path = './dbuser.txt'


function updateDbUser(db_path, data) {
    var fs = require('fs');
    dbuserFile = fs.readFileSync(db_path, 'utf-8')
    var str = data.user + '|' + data.pass
    fs.writeFile(db_path, `\n` + str,
        {
            flag: "a"
        }, (err) => {
            if (err) throw (err)
        }
    )
}

server.listen(3000, hostname);
var mangUsers = [];
var mangSocket = {};
var mangPeerID = {};

function readDbUser(db_path) {
    var fs = require('fs');
    dbuserFile = fs.readFileSync(db_path, 'utf-8')
    dbuserFile.split(/\r?\n/).forEach(line => {
        // dbuser.push(line);
        var username = line.split('|')[0]
        var password = line.split('|')[1]
        dbuser[username] = password;
    });
    delete dbuser[""];
    console.log(dbuser)
}

function checkUserExist(data) {
    if (dbuser[data.username] === data.password) {
        return true;
    }
    else {
        return false;
    }
}

readDbUser(db_path)

io.on('connection', (socket) => {
    console.log("Connected: " + socket.id);

    socket.on('client-send-Username', (data) => {
        if (!checkUserExist({ username: data.user, password: data.pass })) {
            //fail
            socket.emit('server-send-dn-thatbai')
        }
        else {
            //thanhcong
            mangUsers.push(data.user);
            socket.Username = data.user;
            mangSocket[socket.Username] = socket.id;
            mangPeerID[socket.Username] = data.peerid;

            socket.emit('server-send-dnki-thanhcong', data.user);
            io.sockets.emit('server-send-danhsach-Users', mangUsers);

        }
    })

    socket.on('client-send-Username-dki', (data) => {
        if (!checkUserExist({ username: data.user, password: data.pass, peerid: data.peerid }) && !dbuser[data.user]) {
            //thanhcong
            // socket.emit('server-send-dn-thatbai')
            mangUsers.push(data.user);
            socket.Username = data.user;
            mangSocket[socket.Username] = socket.id;
            mangPeerID[socket.Username] = data.peerid;

            dbuser[data.user] = data.pass;

            updateDbUser(db_path, data)

            socket.emit('server-send-dnki-thanhcong', data.user);
            io.sockets.emit('server-send-danhsach-Users', mangUsers);
        }
        else {
            //fail
            socket.emit('server-send-dnki-thatbai');

        }
    })

    socket.on('logout', () => {
        delete mangSocket[socket.Username];
        delete mangPeerID[socket.Username];
        mangUsers.splice(mangUsers.indexOf(socket.Username), 1);

        socket.broadcast.emit('server-send-danhsach-Users', mangUsers)
    })


    socket.on('chat-to-user', (data) => {
        //console.log(username + ': ' + mangSocket[username])
        console.log(data)
        var user_to_chat = data.to;
        socket.broadcast.to(mangSocket[user_to_chat]).emit('chat-private', data)
        socket.emit('chat-private', data)
    })

    socket.on('get-peer-id-chat', (toUser) => {
        var otherID = mangPeerID[toUser];

        console.log(toUser + ": " + otherID);

        socket.emit('return-peer-id-chat', otherID)
        //socket.emit('chat-video', toUser)
    })

    socket.on('peer-id', (data) => {
        mangPeerID[socket.Username] = data;
    })

    socket.on('chat-file-open-box', (data) => {
        var user_to_chat = data.to;
        socket.broadcast.to(mangSocket[user_to_chat]).emit('chat-private', data)
    })

})

app.get('/', (req, res) => {
    res.render('trangchu');
})