
const http = require('http');
var querystring = require('querystring');
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();
innerConn = null;

var wsHost = ('ws://192.168.151.11:8001/');
// var wsHost = 'ws://127.0.0.1:8081/';

var helper = console;
var host = "f2725i6528.zicp.vip";
var port = 8181;
var _server = null;
var _lastSuccessCollect = {
    "datetime": new Date().getTime(),
    "msg": null
};

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
    setTimeout(function(){
        clientReconnect();
    }, 2000);
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    innerConn = connection;
    connection.on('error', function(error) {
        innerConn = null;
        console.log("Connection Error: " + error.toString());
        setTimeout(function(){
            clientReconnect();
        }, 2000);
    });
    connection.on('close', function() {
        innerConn = null;
        console.log('Connection Closed');
        setTimeout(function(){
            clientReconnect();
        }, 2000);
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            //console.log("Received: '" + message.utf8Data + "'");
            if(typeof innerConn.callback == "function") {
                innerConn.callback(message.utf8Data);
            }
        }
    });
});

function sendCmd(cmd, callback) {
    if (innerConn && innerConn.connected) {
        innerConn.sendUTF(cmd);
        innerConn.callback = callback;
    } else {
        return  callback({"code": -1, "message": "connect is broken"});
    }
}

function clientReconnect() {
    console.log("connecting ws server", wsHost);
    if(!innerConn) {
        client.connect(wsHost);
    }
}
// client.connect('ws://localhost:8081/', 'echo-protocol');
clientReconnect();


// 创建 http server
_server = http.createServer((req, res) => {
    var buffers = [];
    var body = "";
    req.on('data', function (chunk) {
        buffers.push(chunk);
        body += chunk;  //一定要使用+=，如果body=chunk，因为请求favicon.ico，body会等于{}
    });
    req.on('end', function () {
        if(req.method == "POST") {
            let requestBody = Buffer.concat(buffers).toString();
            requestBody = querystring.parse(requestBody)
            try {
                requestBody = JSON.stringify(requestBody);
            } catch (error) {
                console.log(error)
            }
            //console.log(requestBody);
            _handlePostData(requestBody, req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Methods': 'GET,POST', 'Access-Control-Allow-Origin': '*' });
            res.end('404 not found');
        }
    });
});
_server.setTimeout(300000);
_server.listen(port, host, () => {
    helper.log('web server start up success ' + host + ':' + port);
});
function _handlePostData(data, req, res) {
    // 服务是否活跃，最近一次获取数据时间离现在的毫秒数
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Methods': 'GET,POST', 'Access-Control-Allow-Origin': '*' });
    if(req.url.indexOf('/sendCmd') == 0) {
        try {
            _data = JSON.parse(data);
        } catch(e) {
            _data = {};
        }
        var cmd = _data.cmd;
        sendCmd(cmd, function(msg){
            res.write(JSON.stringify(msg));
            res.end();
        });
    } else if(req.url.indexOf('/isAlive') == 0) {
        var s = "failed";
        if(new Date().getTime() - _lastSuccessCollect.datetime < 5*60*1000) {
            s = "success";
        }
        res.write(s);
        res.end();
    } else {
        res.end('404 not found');
    }
}