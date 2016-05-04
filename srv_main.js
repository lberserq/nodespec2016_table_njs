var ws = require("nodejs-websocket")
var bl = require("./bl_common")
var db = require("./db_tarantool")

// Scream server example: "hi" -> "HI!!!"
db.create_connection(); 

try
{
    var server = ws.createServer(function (conn) {
        console.log("New connection");
        //conn.accept();
        conn.on("text", function (str) {
            console.log("Received " +str);
            response = bl.commandProcessor(str);
            console.log(response);
            conn.sendText(response);
            if (JSON.parse(response).isOk != true) {
                conn.close();
            }
    
        })
        conn.on("close", function (code, reason) {
            console.log("Connection closed")
        })
    }).listen(8001);
}
catch(e)
{
    console.log(e);
}

db.destroy_connection();
