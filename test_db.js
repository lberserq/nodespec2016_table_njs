var TarantoolConnection = require('tarantool-driver');
const Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var sleep = require('sleep');

var conn = new TarantoolConnection({host:"192.168.1.68", port: 3111});
function db_get(){
var promise = conn.connect().then(function(){
                                console.log("CONNECT");
				return conn.auth('test', 'test');
			}, function(e){ console.log(e);})
return promise;
}

var con_promise = db_get();

function my_get(no)
{
var result = undefined
var fn = function(data) {
    console.log("DT\t" + data);
    //console.log(data[1]);
    //result = data[0][1];
}

timeout = 10;
var maxint = 2135999999;
var promise1 = con_promise
.then(function() {console.log("AUTH SUCCESSFULL!"); return conn.select("users", "primary", maxint, 0, "all", []);}, function(e){ console.log(e); })
.then(function(data){
    fn(data); 
    console.log("PP1:\t")
    console.log(promise1); 
    console.log("CP1:");
    console.log(con_promise); 
    return data;
}, function(e){console.log(e);})
.catch(function(e){console.log(e);});
q =  new Promise(function(resolve, reject){
setTimeout(function(){resolve(result);}
,timeout)});

sleep.usleep(timeout * 1000);
return result;
}

var tdb_promise = con_promise;

var tdb_getUserListImpl = function()
{
    console.log("gULI");
    return tdb_promise
    .then(function()
    {
        var maxint = 213599999; 
        return conn.select("users", "primary", maxint, 0, "all", []);
    }, function(e){throw new Error("db-not-connected!");})
    .then(function(data){
        console.log("Data in getUL");
        console.log(data);
        dataList = [];
        for(var i = 0; i < data.length; ++i)
            dataList.push(data[i][1]);
        return dataList;
    },
    function(e) {throw new Error(e + "Invalid select!");}
    );
}

//var get = async(function(no){var p = await my_get(no); return p;});
//console.log(get.th11111en(function(){console.log("AAAAA!");}));
//my_get(0);


//tdb_getUserListImpl();



var tdb_addUserImpl = function(user, userId)
{
    console.log("TDB Registering " + user + " : " + userId);
    return tdb_promise
    .then(function()
    {
        return conn.insert("users", [userId, user]);
    }, function(e){throw new Error("db-not-connected!");})
    .then(function(data){
        console.log(data);
        return data;
    },
    function(e) {throw new Error(e + "Invalid select!");}
    );
}

var tdb_updateNoteByIdImpl = function(noteId, noteObject)
{
    return tdb_promise
    .then(function()
    {
        if (noteId < 0) 
        {
            throw new Error("noteId mustBe > 0");
        }
        
        if (noteId != noteObject.noteId)
        {
            throw new Error("noteId must be equal");
        }
        var subject = noteObject.noteSubject;
        var creator = noteObject.creator;
        var noteObjectJSON = JSON.stringify(noteObject);
        return conn.update("notes", "primary", [noteId], [['=', 4, noteObjectJSON]]);
    }, function(e){throw new Error("db-not-connected!");})
    .then(function(data){
        console.log(data);
        return data;
    },
    function(e) {throw new Error(e + " Invalid update!");}
    );
}
//noteObject.
var noteObject = new Object();
noteObject.date = new Date();
noteObject.creator = 0;
noteObject.noteSubject = 0;
noteObject.noteText = "ABACABA";
noteObject.noteId = 0;


tdb_updateNoteByIdImpl(0, noteObject);



//tdb_addUserImpl("IVAN_PACAN", 2007).catch(function(error) {console.log(error);});
