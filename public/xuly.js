var hostname = 'localhost'

var socket = io('http://' + hostname + ':3000')
var mangChatBoxID = [];
var preBoxID = '';
var mypeerID = '';
var otherID = '';

var mystream;

var file_name, file_size, chunkLength = 1000 * 6000;

var myFile;
var IDbox_sendfile;
var preClickUser;
//var conn;

const peer = new Peer(randomID(), {
    host: hostname,
    port: 9000,
    path: '/myapp'
})

peer.on('connection', (conn) => {
    conn.on('data', (data) => {
        // if (data.file_name) {
        //     handleData(data)
        // }
        // else {
        //     console.log(data)
        // }

        handleData(data)
    })
})

socket.on('server-send-dn-thatbai', () => {
    alert('Wrong username or password')
})

socket.on('server-send-danhsach-Users', (data) => {
    $('#boxContent').html('');
    //data.splice(data.indexOf($('#currentUser')), 1);
    data.forEach(element => {
        $(document).ready(() => {
            $('#boxContent').append("<li id='" + element + "'class='user'>" + element + "</li>");
        })

    });
})

socket.on('server-send-dnki-thanhcong', (data) => {
    $('#currentUser').html(data);
    $('#loginForm2').hide(2000);
    $('#chatForm').show(1000);
    $('#listMessage').hide(1);

})

socket.on('server-send-dnki-thatbai', () => {
    alert('Tai khoan da ton tai tren he thong')
})

// socket.on('server-send-message', (data) => {
//     $('#listMessage').append("<div class='ms'>" + data.un + ": " + data.nd + "</div>")
// })

// socket.on('ai-do-dang-go-chu', (data) => {
//     $('#thongbao').html(data);
// })

// socket.on('ai-do-ngung-go-chu', () => {
//     $('#thongbao').html('');
// })


fileInput.onchange = evt => {
    const [file] = fileInput.files
    if (file) {
        myFile = URL.createObjectURL(file)
    }
}


socket.on('chat-private', (data) => {
    //alert(username + " hi")
    var from_user = data.from;
    var to_user = data.to;
    var msg = data.msg;

    var currentUser = $('#currentUser').text();

    if (to_user == currentUser) {
        var boxID = currentUser + "-" + from_user;
        if (mangChatBoxID.indexOf(boxID) == -1) {
            var html = "<div id='" + boxID + "' style='height: 300px; background-color: #ffff; display:none'></div>"
            $('#listMessage').append(html);
            mangChatBoxID.push(boxID);
            //preBoxID = boxID;
            IDbox_sendfile = boxID;
        }

        if (msg != "") $('#' + boxID).append("<div class='msl'>" + from_user + ": " + msg + "</div>")
    }
    else {
        var boxID = currentUser + "-" + to_user;
        if (msg != "") $('#' + boxID).append("<div class='msr'>" + msg + " :" + from_user + "</div>")
    }

})

$(document).ready(() => {
    peer.on('open', id => {
        mypeerID = id;
        console.log(mypeerID);
    });

    $('#loginForm').show();
    $('#chatForm').hide();

    $('#btnLogin').click(() => {
        socket.emit('client-send-Username',
            {
                user: $('#txtUsername').val(),
                pass: $('#txtPassword').val(),
                peerid: mypeerID
            }
        )

    })

    $('#btnRegister').click(() => {
        socket.emit('client-send-Username-dki',
            {
                user: $('#txtUsername').val(),
                pass: $('#txtPassword').val(),
                peerid: mypeerID
            }
        )
    })

    $('#btnLogout').click(() => {
        socket.emit("logout");
        $('#chatForm').hide(1000);
        $('#loginForm').show(1000);
        window.location.reload();
    })

    $('#btnSendMessage').click(() => {
        var myMsg = $('#txtMessage').val()
        if (preBoxID != "" && myMsg != "") {
            var x = preBoxID.split('-');
            var currentUser = x[0];
            var user_to_chat = x[1];
            socket.emit('chat-to-user', { to: user_to_chat, from: currentUser, msg: myMsg });
            //socket.emit("user-send-message", $('#txtMessage').val())

            var txtField = document.getElementById('txtMessage');
            txtField.value = '';
        }

        var elementFile = document.getElementById('fileInput')
        var file = elementFile.files[0]
        if (file && preBoxID != "") {
            var x = preBoxID.split('-');
            var currentUser = x[0];
            var user_to_chat = x[1];
            // console.log(file.name);
            // console.log(file.size);
            file_name = file.name;
            file_size = file.size;

            //conn = peer.connect(otherID);

            socket.emit('chat-file-open-box', currentUser);
            sliceAndSend(file)

            $('#' + preBoxID).append('<div class="msr"><a class="" download="' + file_name + '" href="' + myFile + '">' + file_name + '(' + file_size / 1000 + 'KB)</a> :' + currentUser + '</div>')
            socket.emit('chat-file-open-box', { from: currentUser, to: user_to_chat, msg: "" });
            elementFile.value = null;
        }

        // conn = peer.connect(otherID);
        // conn.on('open', function(){
        //     // here you have conn.id
        //     conn.send('hi!');
        // });

    })

    // $('#txtMessage').focusin(() => {
    //     socket.emit('toi-dang-go-chu');
    // })

    // $('#txtMessage').focusout(() => {
    //     socket.emit('toi-ngung-go-chu');
    // })

    $('#boxContent').on('click', 'li', function () {
        var user_to_chat = $(this).attr('id');
        if (preClickUser) {
            preClickUser.css("background-color", "transparent")

        }
        $(this).css("background-color", "yellow")
        preClickUser = $(this)
        var currentUser = $('#currentUser').text();

        var id_chat_box = currentUser + "-" + user_to_chat;

        if (mangChatBoxID.indexOf(id_chat_box) >= 0) {
            if (preBoxID != "") $('#' + preBoxID).hide(1);
            $('#listMessage').show(1);
            $('#' + id_chat_box).show(1);
            preBoxID = id_chat_box;
        }
        else {
            if (preBoxID != "") {
                $('#' + preBoxID).hide(1);
            }
            var html = "<div id='" + id_chat_box + "' style='height: 300px; background-color: #ffff; display:none'></div>"
            $('#listMessage').append(html);
            $('#listMessage').show(1);
            $('#' + id_chat_box).show(1);
            preBoxID = id_chat_box;
            //mangChatBoxID.push(id_chat_box);
        }

        socket.emit('get-peer-id-chat', user_to_chat)
    })

    $('#btnCall').click(() => {
        $('.vid').show(1);
        console.log(otherID)
        openStream()
            .then(stream => {
                playStream('localStream', stream);
                const call = peer.call(otherID, stream);
                call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
                mystream = stream;
            });

    })

    $('#btnStopCall').click(() => {
        mystream.getTracks().forEach(function (track) {
            if (track.readyState == 'live') {
                track.stop();
            }
        });

        $('.vid').hide(1)
    })
})

socket.on('return-peer-id-chat', (id) => {
    otherID = id;
})

peer.on('call', call => {
    openStream()
        .then(stream => {
            call.answer(stream);
            playStream('localStream', stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
            mystream = stream;
        });

    $('.vid').show(1);
});


function randomID() {
    return Math.round(Math.random() * 1000000).toString()
}

function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}



function sliceAndSend(file) {
    var fileSize = file.size;
    var name = file.name;
    var mime = file.type;
    var chunkSize = 64 * 1024;
    var offset = 0;
    var sendProgress = 0;

    function readChunk() {
        var data = {};

        data.file_name = file_name;
        data.file_size = file_size;

        var r = new FileReader();

        var blob = file.slice(offset, chunkSize + offset);

        r.onload = function (evt) {
            if (!evt.target.error) {
                offset += chunkSize;

                if (offset >= fileSize) {
                    data.message = evt.target.result;
                    data.last = true;
                    data.mime = mime;

                    var conn = peer.connect(otherID);
                    conn.on('open', function () {
                        conn.send(data);
                        //conn.send('SendFile')
                    })
                    console.log(evt.target.result)
                    console.log("Done reading file " + name + " " + mime);

                    return;
                }

                else {
                    data.message = evt.target.result;
                    data.last = false;
                    data.mime = mime;

                    var conn = peer.connect(otherID);
                    conn.on('open', function () {
                        conn.send(data);
                    })
                }
            }

            else {
                console.log("Read error: " + evt.target.error);
                return;
            }

            readChunk();
        }

        r.readAsArrayBuffer(blob);
    }

    readChunk();
}

var receivedSize = 0;
var recProgress = 0;
var arrayToStoreChunks = [];
var counterBytes = 0;

function handleData(data) {
    receivedSize += data.message.byteLength;
    counterBytes = counterBytes + receivedSize;

    arrayToStoreChunks.push(data.message);

    if (data.last) {
        const received = new Blob(arrayToStoreChunks);
        downloadBuffer(URL.createObjectURL(received), data.file_name, data.file_size, data.mime)

        arrayToStoreChunks = [];
        receivedSize = 0;
    }

}

function downloadBuffer(fileUrl, fileName, fileSize, mime) {
    var user_chat = IDbox_sendfile.split('-')[1];
    console.log(fileUrl);
    $('#' + IDbox_sendfile).append('<div class="msl">' + user_chat + ': <a class="" download="' + fileName + '" href="' + fileUrl + '">' + fileName + '(' + fileSize / 1000 + 'KB)</a></div>')
}