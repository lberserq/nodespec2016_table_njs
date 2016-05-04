var TarantoolConnection = require('tarantool-driver');
var conn = new TarantoolConnection({host:"192.168.1.68", port: 3111})
var gCon = null;

function dprint(msg)
{
    console.log(msg);
}

function tdb_connect()
{
var a = conn.connect().then(function(){
                                console.log("CONNECT");
				return conn.auth('test', 'test');
			}, function(e){ console.log(e);})
return a;
}


var tdb_promise = undefined;


function tdb_getNotesByIdImpl(NoteId)
{
    tdb_promise.then()
}

function tdb_getUserNameImpl(userId, callback)
{
    
    tdb_promise
    .then(function()
    {
        conn.select("users", "primary", 1, 0, 'eq', [userId]);
    }, function(e){throw "not-connected!";})
    .then(function(data){
        callback(data[0][1]);
    },
    function(e) {throw "Invalid select!";};
    );
}


function tdb_getUID(userName, callback)
{
    
    tdb_promise
    .then(function()
    {
        conn.select("users", "secondary", 1, 0, 'eq', [userName]);
    }, function(e){throw "not-connected!";})
    .then(function(data){
        callback(data[0][0]);
    },
    function(e) {throw "Invalid select!";}
    );
}

function tdb_getUserListImpl(callback)
{
    tdb_promise
    .then(function()
    {
        var maxint = 9007199254740991;
        conn.select("users", "primary", maxint, 0, 'all', []);
    }, function(e){throw "not-connected!";})
    .then(function(data){
        dataList = [];
        for(var i = 0; i < data.length; ++i)
            dataList.push(data[i][1]);
        callback(dataList);
    },
    function(e) {throw "Invalid select!";}
    );
}


function tdb_addUserImpl(user, userId, callback)
{
    tdb_promise
    .then(function()
    {
        conn.insert("users", [userId, user]);
    }, function(e){throw "not-connected!";})
    .then(function(data){
        callback(data);
    },
    function(e) {throw "Invalid select!";}
    );
}


function tdb_getNoteByIdImpl(noteId, callback)
{
    tdb_promise
    .then(function() {
        conn.select("notes", "primary", 1, 0, 'eq', [noteId]);
    }, function(e){throw "not-connected!";})
    .then(function(data){
        callback(data[0][3]);
    },
    function(e) {throw "Invalid select!";}
    );
}

function tdb_getNotesByUserIdImpl(userId, callback)
{
    tdb_promise
    .then(function() {
        var maxint = 9007199254740991;
        conn.select("notes", "subject", maxint, 0, 'eq', [userId]);
    }, function(e){throw "not-connected!";})
    .then(function(data){
        callback(data);
        dataList = [];
        for(var i = 0; i < data.length; ++i)
            dataList.push(data[i][3]);
    },
    function(e) {throw "Invalid select!";}
    );
}

function tdb_updateNoteByIdImpl(noteId, noteObject)
{
    tdb_promise
    .then(function()
    {
        var object = JSON.parse();
        var subject = object.noteSubject;
        var creator = object.creator;
        conn.update("notes", "primary", [noteId, creator, subject, noteObject]);
    }, function(e){throw "not-connected!";})
    .then(function(data){
        callback(data);
    },
    function(e) {throw "Invalid select!";}
    );
}

function tdb_getmax_noteIdImpl(callback)
{
   tdb_promise
    .then(function() {
        var maxint = 9007199254740991;
        conn.select("notes", "primary", maxint, 0, 'all', []);
    }, function(e){throw "not-connected!";})
    .then(function(data){
        id = data[data.length - 1][0]
        callback(id);
    },
    function(e) {throw "Invalid select!";}
    );
}

function tdb_insertNote(noteId, noteObject, callback)
{
    tdb_promise
    .then(function() 
    {
        var object = JSON.parse();
        var subject = object.noteSubject;
        var creator = object.creator;
        conn.insert("notes", [noteId, creator, subject, noteObject]);
    }, function(e){throw "not-connected!";})
    .then(function(data){
        callback(data);
    },
    function(e) {throw "Invalid select!";}
    );
}


function tdb_getNameImplCallback(data)
{
    data = data[0][0];
    return data;    
}


var getNoteById = function()
{
}


var destroy_connection = function()
{
    tdb_promise
    .then(function(){conn.destroy(true);}
    ,function(e){console.log(e);});
}

var create_connection = function() 
{
    tdb_promise = tdb_connect;
}
