const ws = new WebSocket("ws://localhost:8081");

ws.addEventListener("open", () =>{
    return false;
});
 
ws.addEventListener('message', (data) => {
    console.log(data.data)
    if (data.data == "[nomatch]") {
        console.log("No Match Found!")
    } if (data.data.includes("[joined]")) {
        console.log("You are now in a match with "+data.data.replace("[joined]", ""))
    } if (data.data.includes("[dc]")) {
        console.log(data.data.replace("[dc]", "")+" left the match")
    } if (data.data.includes("[left]")) {
        console.log("You left the match.")
    }
});

function joinMatch(key) {
    if (key == undefined) {
        ws.send("join;[any]")
    } else {
        ws.send("join;"+key)
    }
}

function createMatch(public, key) {
    if (public == undefined) {
        console.log("Please specify whether it is a private or public match")
    } if (public == true) {
        ws.send("creatematch;public;none")
        console.log("Create new public match!")
    } else {
        if (key == undefined) {
            console.log("Please specify the key of the private match!")
        } else {
            ws.send("creatematch;private;"+key)
            console.log("Create new private match with key: "+key)
        }
    }
}