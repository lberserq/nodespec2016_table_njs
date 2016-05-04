function print(msg) {
    console.log(msg);
}


var ws = require("nodejs-websocket");

function setupCon(con)
{
        con.on("close", function(code, reason)
            {
                print("Closed with code: " + code + "Reason: " + reason);
    
            });

        con.on("error", function(err) 
            {
                print("Connection Error: " + err);
            });

        con.on("text", function(str) 
            {
                print(str);
            });
}

function main(con)
{
        print("MainCallb");
        var conPacket = new Object();
        conPacket.userName = "IVAN" + (new Date()).getHours();
        conPacket.date = new Date();
        conPacket.cmd = 'auth_user';
        conJSON = JSON.stringify(conPacket);
        print(conJSON);
        con.sendText(JSON.stringify(conPacket));
            
        print("Text Sent!");
}

var con = ws.connect("ws://localhost:8001", 
    function callback()
    {
        setupCon(this);
        print(this);
        print(this.readyState);
        print("CallBackActivated");
        main(this);
    }
);

print("Want to connect");
