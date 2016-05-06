"use strict";
function print(msg) {
    console.log(msg);
}

var con = undefined;

const ws = require("nodejs-websocket");

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
                print("Recieved:");
                //print(str);
                var q = JSON.parse(str);
                print(q);
                print(q.response);
                print(q.response.data);
            });
}

function auth()
{
        var conPacket = new Object();
        conPacket.userName = "Камиль_Хамитов";
        conPacket.date = new Date();
        conPacket.cmd = 'auth_user';
        conPacket.login = 'berserq_k_mail@mail.ru';
        conPacket.password = 'N7B1LoSm';
        var conJSON = JSON.stringify(conPacket);
        print(conJSON);
        con.sendText(JSON.stringify(conPacket));
        print("Text Sent!");
}

function register()
{
        var conPacket = new Object();
        conPacket.userName = "Камиль_Хамитов";
        conPacket.date = new Date();
        conPacket.cmd = 'register_user';
        conPacket.email = 'berserq_k_mail@mail.ru';
        conPacket.password = 'N7B1LoSm';
        var conJSON = JSON.stringify(conPacket);
        print(conJSON);
        con.sendText(JSON.stringify(conPacket));
        print("Text Sent!");
}

function about_me()
{
        var conPacket = new Object();
        conPacket.userName = "VOVAN17";
        conPacket.date = new Date();
        conPacket.cmd = 'about_me';
        var conJSON = JSON.stringify(conPacket);
        print(conJSON);
        con.sendText(JSON.stringify(conPacket));
        print("Text Sent!");
}


function list_users()
{
        var conPacket = new Object();
        conPacket.userName = "VOVAN17";
        conPacket.date = new Date();
        conPacket.cmd = 'list_users';
        var conJSON = JSON.stringify(conPacket);
        print(conJSON);
        con.sendText(JSON.stringify(conPacket));
        print("Text Sent!");
}


function about_user()
{
        var conPacket = new Object();
        conPacket.userName = "VOVAN17";
        conPacket.date = new Date();
        conPacket.data = "SYSTEM";
        conPacket.cmd = 'about_user';
        var conJSON = JSON.stringify(conPacket);
        print(conJSON);
        con.sendText(JSON.stringify(conPacket));
        print("Text Sent!");
}
/*
 * 
 * NoteObjectIn
 *      date
 *      creator     UserName
 *      noteSubject UserName
 *      noteText    
 *      noteId
 * 
 * 
 */

function add_note()
{
    var note = new Object();
    note.date = new Date();
    note.creator = "VOVAN17";
    note.noteSubject = "SYSTEM";
    note.noteText = "Strange tarantool system: " + new Date();
    note.noteId = -1;
    
    var conPacket = new Object();
    conPacket.userName = "VOVAN17";
    conPacket.date = new Date();
    conPacket.data = new Object();
    conPacket.data.note = note;
    conPacket.cmd = 'new_note';
    
    var conJSON = JSON.stringify(conPacket);
    print(conJSON);
    con.sendText(JSON.stringify(conPacket));
    print("Text Sent!");
}

function update_note()
{
    var note = new Object();
    note.date = new Date();
    note.creator = "SYSTEM";
    note.noteSubject = "SYSTEM";
    note.noteText = "Simple note about System 11";
    note.noteId = 0;
    
    var conPacket = new Object();
    conPacket.userName = "SYSTEM";
    conPacket.date = new Date();
    conPacket.data = new Object();
    conPacket.data.note = note;
    conPacket.cmd = 'update_note';
    
    var conJSON = JSON.stringify(conPacket);
    print(conJSON);
    con.sendText(JSON.stringify(conPacket));
    print("Text Sent!");
}

function reply_to()
{
     var note = new Object();
    note.date = new Date();
    note.creator = " ";
    note.noteSubject = " ";
    note.noteText = "Tarantool is Good";
    note.noteId = -1;
    
    
    var conPacket = new Object();
    conPacket.userName = "SYSTEM";
    conPacket.date = new Date();
    conPacket.data = new Object();
    conPacket.data.note = note;
    conPacket.data.noteId = 1;
    conPacket.cmd = 'reply_to';
    
    var conJSON = JSON.stringify(conPacket);
    print(conJSON);
    con.sendText(JSON.stringify(conPacket));
    print("Text Sent!");
}

function main()
{
        print("MainCallb");
        
        //auth();
        register();
        auth();
        //register();
        
         // auth();
          about_me();
          list_users();
          about_user();
        add_note();
        about_user();
        update_note();
        //about_me();
        update_note();
        //about_user();
        reply_to();
        //about_me();
        //about_user();
         //*/
}

ws.connect("ws://localhost:8001", 
    function callback()
    {
        setupCon(this);

        print(this.readyState);
        print("CallBackActivated");
        main(this);
    }
);

print("Want to connect");