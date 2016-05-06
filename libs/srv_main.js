"use strict";
var ws = require("nodejs-websocket");
var bl = require("./bl_common");
var db = require("./db_tarantool");
var bl_auth = require("./bl_auth");
const Promise = require("bluebird");

var global_connection_no = 0;
var global_connections_set = {};
try
{
    db.create_connection();
    ws.createServer(function (conn) 
    {
        var connection_no = global_connection_no++;
        global_connections_set[connection_no] = true;
        
        console.log("New connection");
        //conn.accept();
        conn.on("text", function (str) {
            console.log("Received " +str);
            bl.commandProcessor(str, connection_no)
            .then(function(response)
            {
                console.log("SRV_MAIN:NEW response");
                console.log(response);
                console.log("RESPONSE_TYPE");
                console.log(typeof response);
                return new Promise(function(resolve)
                {
                    if (typeof(global_connections_set[connection_no]) != "undefined")
                        conn.sendText(response, function()
                        {
                            console.log("SEND_CBK");
                        });
                    else
                        console.log("Client disconnected");
                    
                    resolve(conn);
                });
                //if (JSON.parse(response).isOk != true) {
                //    conn.close();
                //}
            }, function(e)
            {
                console.log("SRV_MAIN:Error");
                console.log(e);
            })
            .then(function()
            {
                    console.log("SBK");
            });
    
        });
        conn.on("close", function (code, reason) {
            console.log("Connection closed by code: " + code + "reason: " + reason);
            delete bl_auth.connectionUserName[connection_no];
            delete global_connections_set[connection_no];
            
        });
    }).listen(8001);
}
catch(e)
{
    console.log(e);
}

//db.destroy_connection();
