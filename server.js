const express = require("express")
const expressWs = require("express-ws")
const http = require("http")
const uuid = require("uuid")

let port = 8081;
let app = express();
let server = http.createServer(app).listen(port);    
let matches = []

expressWs(app, server);

function remove(array, element) {
    var index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
}

app.ws('/', async function(ws, req) {
    ws.uuid = uuid.v4()
    ws.on('message', async function(msg) {
        matches.forEach((match) => {
            if (match.players.includes(ws)) {
                remove(match.players, ws)
                if (match.players.length == 0) {
                    remove(matches, match)
                } else {
                    match.players[0].send("[dc]"+ws.uuid)
                }
            }
        })
        if (msg.includes("join")) {

            matches.forEach((match) => {
                if (match.players.includes(ws)) {
                    console.log("Already in a match!")
                    return false;
                }
            })

            var key = msg.split(";")[1]
            var foundMatch = false;
            if (key === "[any]") {
                console.log("hi")
                matches.forEach((match) => {
                    if (match.players.length == 1 && match.public) {
                        match.players.push(ws)
                        ws.send("[joined]"+match.players[0].uuid)
                        match.players[0].send("[joined]"+ws.uuid)
                        foundMatch = true;
                    }
                })
            } else {
                matches.forEach((match) => {
                    if (match.players.length == 1 && match.key == key) {
                        match.players.push(ws)
                        ws.send("[joined]"+match.players[0].uuid)
                        match.players[0].send("[joined]"+ws.uuid)
                        foundMatch = true;
                    }
                })
            }
            ;
            if (!foundMatch) {
                ws.send("[nomatch]")
            }
        } if (msg.includes("creatematch;")) {
            matches.forEach((match) => {
                if (match.players.includes(ws)) {
                    remove(match.players, ws)
                    if (match.players.length == 0) {
                        remove(matches, match)
                    } else {
                        match.players[0].send("[dc]"+ws.uuid)
                    }
                }
            })
            var public = (msg.split(";")[1] === "public")
            var key = msg.split(";")[2]
            matches.push({
                public: public,
                key: key,
                players: [ws]
            })
            console.log(public)
            console.log(ws.uuid+" created a new match!")
        } if (msg.includes("[leave]")) {
            matches.forEach((match) => {
                if (match.players.includes(ws)) {
                    remove(match.players, ws)
                    if (match.players.length == 0) {
                        remove(matches, match)
                    } else {
                        match.players[0].send("[dc]"+ws.uuid)
                    }
                    ws.send("[left]")
                }
            })
        }
    });
    ws.on("close", function(err) {
        matches.forEach((match) => {
            if (match.players.includes(ws)) {
                remove(match.players, ws)
                if (match.players.length == 0) {
                    remove(matches, match)
                } else {
                    match.players[0].send("[dc]"+ws.uuid)
                }
            }
        })
    })
});
