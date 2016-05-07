"use strict";
var db = require('./db_tarantool');
var Promise = require('bluebird');

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
    return isRegistredUser(userName)
         .then(function(result)
        {
            console.log("bl!authUser: isRU result:" + result);
            if (process.env.no_vk == "1" || process.env.no_vk == "true")
            {
                return result;
            }
            if (!result)
            {
                return result;
            }
            if (typeof(connectionUserName[connectionNo]) != "undefined" && connectionUserName[connectionNo] == userName)
            {
                return true;
            }
            else 
            return new Promise(function(resolve, reject)
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
                });
    });
};

var failAuth = function(userName)
{
    return {
        isOk: false, 
        description: 'failAuth:Auth-failed',
        data: 'Failed auth with credentials:\t' + userName
    };
};

var unImpersonateUIDs = function(uids)
{
    console.log("UnImpersonator:" + uids);
    return uids.map(uid => "User #" + uid);
};

var getUserList = function()
{
    var response = new Object();
    response.isOk = true;
    return new Promise(function(resolve, reject)
    {
        return db.tdb_getUserList()
        .then(function(data)
        {
            response.data = data;
            resolve(response);
            return data;
        }
        ,function(e)
        {
            console.log("ERROR " + e.name + ':' + e.message);
            response.description = "Note UserList error";
            response.data = e.name + ':' + e.message;
            response.isOk = false;
            reject(e);
        });
    });
};



var isRegistredUser = function(userName)
{
    //db stuff
    return db.tdb_getUserList() 
    .then(userList => userList.indexOf(userName) !== -1) 
    .catch(e => 
    { 
        console.log("Get UL failed " + e); 
        throw e; 
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
                var userId = Number(CRC32.str(userName)) & 0x0FFFFFFF;
                
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
            if (typeof(data) == "undefined")
            {
                reject("Invalid Invalid User");
            } else {
                var val = "User #" + data;
                resolve(val);
                return val;
            }
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
