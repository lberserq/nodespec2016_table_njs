"use strict";
const TarantoolConnection = require('tarantool-driver');
var conn = new TarantoolConnection({host:"192.168.1.68", port: 3111});
const Promise = require('bluebird');


function tdb_connect()
{
    return conn.connect().then(function(){
                                console.log("CONNECT");
				return conn.auth('test', 'test');
			}, function(e){ console.log(e);});
}


var tdb_promise = undefined;


var tdb_getUserNameImpl = function(userId)
{
    console.log("tdb!getUserName: \t params: UserId " + userId);
    return tdb_promise
    .then(function()
    {
        return conn.select("users", "primary", 1, 0, 'eq', [userId]);
    }, function(e){console.log(e); throw new Error("db-not-connected!");})
    .then(function(data){
        return data[0][1];
    },
    function(e) {console.log(e); throw new Error(e + " Invalid select!");}
    );
};


var tdb_getUIDImpl = function(userName)
{
    
    return tdb_promise
    .then(function()
    {
        return conn.select("users", "secondary", 1, 0, 'eq', [userName]);
    }, function(e){console.log(e);throw new Error("db-not-connected!");})
    .then(function(data){
        return data[0][0];
    },
    function(e) {throw new Error(e + " Invalid select!");}
    );
};

var tdb_getUserListImpl = function()
{
    console.log("gUL");
    return tdb_promise
    .then(function()
    {
        var maxint = 2135999999; 
        return conn.select("users", "primary", maxint, 0, 'all', []);
    }, function(e){console.log(e); throw new Error("db-not-connected!");})
    .then(function(data){
        console.log("Data in getUL");
        console.log(data);
        var dataList = [];
        for(var i = 0; i < data.length; ++i)
            dataList.push(data[i][1]);
        return dataList;
    },
    function(e) {throw new Error(e + " Invalid select!");}
    );
};


var tdb_addUserImpl = function(user, userId)
{
    console.log("TDB Registering " + user + " : " + userId);
    console.log(typeof userId);
    return tdb_promise
    .then(function()
    {
        return conn.insert("users", [userId, user]);
    }, function(e) {
        console.log("TDB_ADDUSER!Exception1st " + e);
        throw new Error("db-not-connected!");
    })
    .then(function(data){
        console.log("TDB_ADDUSER!Data " + data);
        return data;
    },
    function(e) {
        console.log("TDB_ADDUSER!Exception2nd " + e);
        throw new Error(e + " Invalid insert!");}
    );
};


var tdb_getNoteByIdImpl = function(noteId)
{
    return tdb_promise
    .then(function() {
        return conn.select("notes", "primary", 1, 0, 'eq', [noteId]);
    }, function(e){console.log(e); throw new Error("db-not-connected!");})
    .then(function(data){
        return JSON.parse(data[0][3]);
    },
    function(e) {throw new Error(e + " Invalid select!");}
    );
};

var tdb_getNotesByUserIdImpl = function(userId)
{
    return tdb_promise
    .then(function() {
        var maxint = 2135999999; 
        return conn.select("notes", "subject", maxint, 0, 'eq', [userId]);
    }, function(e){console.log(e);throw new Error("db-not-connected!");})
    .then(function(data){
        var dataList = [];
        for(var i = 0; i < data.length; ++i)
            dataList.push(JSON.parse(data[i][3]));
        return dataList;
        
    },
    function(e) {throw new Error(e + " Invalid select!");}
    );
};

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
        return conn.replace("notes", [noteId, creator, subject, noteObjectJSON]);
    }, function(e){console.log(e); throw new Error("db-not-connected!");})
    .then(function(data){
        return data;
    },
    function(e) {console.log(e); throw new Error(e + " Invalid update!");}
    );
};

var tdb_getmaxNoteIdImpl = function()
{
   return tdb_promise
    .then(function() {
        var maxint = 2135999999; 
        return conn.select("notes", "primary", maxint, 0, 'all', []);
    }, function(e){console.log(e); throw new Error("db-not-connected!");})
    .then(function(data){
        var id = data[data.length - 1][0];
        return id;
    },
    function(e) {throw new Error(e + " Invalid select!");}
    );
};

var tdb_insertNoteImpl = function(noteId, noteObject)
{
    console.log("tdb!insertNoteImpl\tparams:\t noteId=" + noteId + " noteObject=");
    console.log(noteObject);
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
        return conn.insert("notes", [noteId, creator, subject, noteObjectJSON]);
    }, function(e){console.log(e); throw new Error("db-not-connected!");})
    .then(function(data){
        return data;
    },
    function(e) {console.log(e); throw new Error(e + " Invalid insert!");}
    );
};

function tdb_getUidsToUsers(uids, id)
{
    console.log("tdb!getUids2Users\t params:" + uids + ', ' + id);
    console.log("First dataVal " + uids[0]);
    return new Promise(function(resolve, reject)
    {
        return tdb_getUserNameImpl(uids[id])
            .then(function(data)
        {
            if (id == uids.length - 1)
            {
                resolve ([data]);
                return [data];
            }
            else
                return tdb_getUidsToUsers(uids, id + 1)
                    .then(function(dataList)
                {
                        dataList.unshift(data);
                        resolve(dataList);
                        return dataList;
                }
                ,function(e)
                {
                    reject(e);
                });
        }
        ,function(e)
        {
            reject(e);
        });
    });
}


function tdb_getUsersToUids(userNames, id)
{
    console.log("tdb!getUsersToUids\t params:" + userNames + ', ' + id);
    console.log("First dataVal " + userNames[0]);
    return new Promise(function(resolve, reject)
    {
        return tdb_getUIDImpl(userNames[id])
            .then(function(data)
        {
            console.log("DATA =" + data);
            if (id == userNames.length - 1) 
            {
                console.log("TRUE_BRANCH");
                resolve([data]);
                return [data];
            }
            else {
                return tdb_getUsersToUids(userNames, id + 1)
                    .then(function(dataList)
                {
                        console.log("FALSE_BRANCH");
                        console.log(dataList);
                        dataList.unshift(data);
                        console.log(dataList);
                        resolve(dataList);
                        return dataList;
                }
                ,function(e)
                {
                    console.log(e);
                    reject(e);
                });
            }
        }
        ,function(e)
        {
            console.log(e);
            reject(e);
        });
    });
}

var tdb_uidsToUsers = function(uids)
{
    return tdb_getUidsToUsers(uids, 0); 
};

var tdb_usersToUids = function(userNames)
{
    return tdb_getUsersToUids(userNames, 0);
};

var destroy_connection = function()
{
    return tdb_promise
    .then(function(){conn.destroy(true);}
    ,function(e){console.log(e);});
};

var create_connection = function() 
{
    console.log("tdb_connect");
    tdb_promise = tdb_connect();
};


module.exports.destroy_connection = destroy_connection;
module.exports.create_connection = create_connection;
module.exports.tdb_insertNote = tdb_insertNoteImpl;
module.exports.tdb_getmaxNoteId = tdb_getmaxNoteIdImpl;
module.exports.tdb_updateNoteById = tdb_updateNoteByIdImpl;

module.exports.tdb_getNoteById = tdb_getNoteByIdImpl;
module.exports.tdb_getNotesByUserId = tdb_getNotesByUserIdImpl;

module.exports.tdb_usersToUids = tdb_usersToUids;
module.exports.tdb_uidsToUsers = tdb_uidsToUsers;




module.exports.tdb_addUser = tdb_addUserImpl;
module.exports.tdb_getUserList = tdb_getUserListImpl;

module.exports.tdb_getUID = tdb_getUIDImpl;
module.exports.tdb_getUserName = tdb_getUserNameImpl;

module.exports.tdb_promise = tdb_promise;

