"use strict";
var db = require('./db_tarantool');
const Promise = require('bluebird');

var vkAuth = require('vk-auth')(5450078 , 'friends');
var VK = require('vksdk');
    
var vk = new VK({
    'appId'     : 5450078,
    'appSecret' : 'wiex4ZrrthQsl5nyG8o8'
});


var connectionUserName = {};


function socialAuth(email, password, resolve, reject)
{
    vkAuth.authorize(email, password);
    vkAuth.on("auth", 
        function(tokenParams)
        {
            console.log("VK_AUTH_TOKEN_GET");
            vk.setToken(tokenParams.access_token);
            vk.request('users.get', {'user_id' : tokenParams.user_id}, 
                       function(data) 
                    {
                        console.log("VK_REQUEST_DATA");
                        console.log(data);
                        if (data.response.length) {
                            resolve(data.response[0].first_name + '_' + data.response[0].last_name);
                        } else {
                            reject("Assertion Failed data.response.length must be > 0");
                        }
                    });
        });
    vkAuth.on("error",  reject);
    
}
var authUser = function(userName, email, password, connectionNo)
{
    return new Promise(function(resolve, reject)
    {
         isRegistredUser(userName)
         .then(function(result)
        {
            console.log("bl!authUser: isRU result:" + result);
            if (!result)
            {
                resolve(result);
                return result;
            }
            if (typeof(connectionUserName[connectionNo]) != "undefined" && connectionUserName[connectionNo] == userName)
            {
                result = true;
                resolve(result);
            }
            else 
            {
                var succ = function(socialName)
                {
                    if (socialName == userName) {
                        connectionUserName[connectionNo] = userName;
                        result = true;
                        resolve(result);
                    } else {
                        result = false;
                        reject();
                    }
                };
                var error = function(err)
                {
                    console.log("VK rejects with error "  + err);
                    result = false;
                    resolve(false);
                };
                socialAuth(email, password, succ, error);
            }
            
        },
        function(e)
        {
            console.log("bl!authUser: failed:isRegistredUser " + e);
            reject(e);
        });
    });
};

var failAuth = function(userName)
{
    var response = new Object();
    response.isOk = false;
    response.description = 'failAuth:Auth-failed';
    response.data = 'Failed auth with credentials:\t' + userName;
    return response;
};

var unImpersonateUIDs = function(uids)
{
    console.log("UnImpersonator:" + uids);
    var list = [];
    for (var i = 0; i < uids.length; ++i) {
        list.push("User #" + uids[i]);
    }
    return list;
};

var getUserList = function()
{
    var response = new Object();
    response.isOk = true;
    return new Promise(function(resolve, reject)
    {
        try
        {
            return db.tdb_getUserList()
            .then(function(data)
            {
                response.data = data;
                resolve(response);
                return data;
            },
            function(e)
            {
                console.log("ERROR " + e.name + ':' + e.message);
                response.description = "Note UserList error";
                response.data = e.name + ':' + e.message;
                response.isOk = false;
                reject(e);
            });
            
        }
        catch(e)
        {
            console.log("ERROR " + e.name + ':' + e.message);
            response.description = "Note UserList error";
            response.data = e.name + ':' + e.message;
            response.isOk = false;
            resolve(e);
        }
    });
};



var isRegistredUser = function(userName)
{
    //db stuff
    return new Promise(function(resolve, reject)
    {
        return db.tdb_getUserList()
        .then(function(userList)
        {
            var found = false;
            for (var i = 0; i < userList.length && !found; ++i)
            {
                if (userName == userList[i]) 
                {
                    found = true;
                }
            }
            resolve(found);
            return found;
        }
        , function(e)
        {
            console.log("Get UL failed " + e);
            reject(e);
        });
    });
};


var getUID = function(userName)
{
    return db.tdb_getUID(userName);
};

var getUserName = function(userId)
{
    return db.tdb_getUserName(userId);
};

var getUserNames = function(userIds)
{
    return db.tdb_uidsToUsers(userIds);
};

var getUIDs = function(userNames)
{
    return db.tdb_usersToUids(userNames);
};



var registerUser = function(userName)
{
    console.log("Registering user: " + userName);
    var response = new Object();
    response.isOk = true;
    return new Promise(function(resolve, reject)
    {
        return isRegistredUser(userName)
        .then(function(result)
        {
            if (!result)
            {
                console.log("User " + userName + " not found, trying to register");

                var CRC32 = require('crc-32');
                var userId = Number(CRC32.str(userName)) & 0x0FFFFFFF
                + (new Date()).getHours();
                
                return db.tdb_addUser(userName, userId)
                .then(function(data) {
                    console.log("bl!RegisterUser " + data);
                    response.data = "Registration token " + userId;
                    resolve(response);
                    return response;
                },
                function (e) {
                    console.log("bl!RegisterUser:Exception " + e);
                    reject(e);
                });
            } else {
                console.log("bl!RegisterUser:AlreadyRegistred ");
                response.data = "Already registred";
                resolve(response);
                return response;
            }
        }
        ,function(err)
        {
            console.log("bl!RegisterUser!isRegistredUser:Exception " + err);
            console.log(err);
            reject(err);
        });
    });
};

var unImpersonateUser = function(userName)
{
    return new Promise(function(resolve, reject)
    {
       return getUID(userName)
       .then(function(data)
        {
            var val = "User #" + data;
            resolve(val);
            return "User #" + data;
        },
        function(e) {
            reject(e);
        }); 
    });
};



module.exports.authUser = authUser;
module.exports.unImpersonateUser = unImpersonateUser;
module.exports.unImpersonateUIDs = unImpersonateUIDs;

module.exports.registerUser = registerUser;
module.exports.failAuth = failAuth;
module.exports.getUID = getUID;
module.exports.getUIDs = getUIDs;
module.exports.getUserName = getUserName;
module.exports.getUserNames = getUserNames;
module.exports.getUserList = getUserList;
module.exports.connectionUserName = connectionUserName;

module.exports.isRegistredUser = isRegistredUser;
