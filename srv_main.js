var ws = require("nodejs-websocket");
var bl = require("./bl_common");
var db = require("./db_tarantool");

// Scream server example: "hi" -> "HI!!!"
 
try
{
    db.create_connection();
    var server = ws.createServer(function (conn) {
        console.log("New connection");
        //conn.accept();
        conn.on("text", function (str) {
            console.log("Received " +str);
            bl.commandProcessor(str)
            .then(function(response)
            {
                console.log("SRV_MAIN:NEW response");
                console.log(response);
                console.log("RESPONSE_TYPE");
                console.log(typeof response);
                return new Promise(function(resolve, reject)
                {
                    conn.sendText(response, function()
                    {
                        console.log("SEND_CBK");
                    });
                    resolve(conn);
                });
                //if (JSON.parse(response).isOk != true) {
                //    conn.close();
                //}
            }, function(e)
            {
                console.log("SRV_MAIN:Error");
                console.log(err);
            })
            .then(function()
            {
                    console.log("SBK");
            });
    
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

//db.destroy_connection();
