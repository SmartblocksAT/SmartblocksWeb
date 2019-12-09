let WebSocketServer = require('ws').Server;
const url = require('url');

let wss;

module.exports.start = (server) => {

    if(server === null || server === undefined) return;
    if(server.address() === null || server.address()  === undefined) return;
    wss = new WebSocketServer({
        port: server.address().port + 10
    });

    server.on('upgrade', function upgrade(request, socket, head) {
        const pathname = url.parse(request.url).pathname;

        if (pathname === '/ws') {
            wss.handleUpgrade(request, socket, head, function done(ws) {
                wss.emit('connection', ws, request);
            });
        } else {
            socket.destroy();
        }
    });

    wss.on('connection', function incoming(ws, request) {
        ws.on('open', (data) => {
            console.log("Opened for", JSON.stringify(data));
        });
        ws.on('message', (data) => {
            console.log("Message ", JSON.stringify(data));

            if(data.startsWith("GET ")){
                let tmp = data.substring(data.indexOf(" ") + 1, data.length);

                console.log(data, ">" + tmp);

                if(tmp.startsWith("RELAIS1")){
                    let t = Math.random();
                    console.log(data, t);
                    if(t > 0.5){
                        ws.send("SET RELAIS1 TRUE");
                    } else {
                        ws.send("SET RELAIS1 FALSE");
                    }
                }

            }

        })

    });
};