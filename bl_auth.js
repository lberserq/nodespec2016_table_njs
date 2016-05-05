var db = require('./db_tarantool');
const Promise = require('bluebird');

var authUser = function(userName)
{
    console.log("authUser: Begins");
    return new Promise(function(resolve, reject)
    {
         isRegistredUser(userName)
         .then(function(result)
        {
            console.log("bl!authUser: isRU result:" + result);
            resolve(result);
            return result;
        },
        function(e)
        {
            console.log("bl!authUser: failed:isRegistredUser " + e)
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
    var list = []
    for (var i = 0; i < uids.length; ++i) {
        list.push("User #" + uids[i]);
    }
    return list;
}

var getUserList = function()
{
    var response = new Object();
    response.isOk = true;
    return new Promise(function(resolve, reject)
    {
        try
        {
            var userList = [];
        //db stuff getUserList
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



function isRegistredUser(userName)
{
    //db stuff
    return new Promise(function(resolve, reject)
    {
        return db.tdb_getUserList()
        .then(function(userList)
        {
            console.log("DB UL");
            console.log(userList);
            var found = false;
            for (var i = 0; i < userList.length && !found; ++i)
            {
                if (userName == userList[i]) 
                {
                    found = true;
                }
            }
            
            if (!found) {
                console.log(userName + " : not found");
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
}


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
    console.log(userIds);
    console.log("bl!getUserNames \t params: " + userIds);
    return db.tdb_uidsToUsers(userIds);
};

var getUIDs = function(userNames)
{
    console.log(userNames);
    console.log("bl!getUIDS \t params: " + userNames);
    return db.tdb_usersToUids(userNames);
}



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
            console.log("IRU result: "+ result);
            if (!result)
            {
                
                console.log("User " + userName + " not found, trying to register");
                //db stuff add to users table
                //    return Math.random() * 100;
                var CRC32 = require('crc-32');
                var userId = Number(CRC32.str(userName)) & 0x0FFFFFFF
                + (new Date()).getHours();
                
                return db.tdb_addUser(userName, userId)
                .then(function(data) {
                    console.log("bl!RegisterUser " + data);
                    response.data = "Registration token " + userId;
                    resolve(response);
                    return response
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
            reject(err)
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
            val = "User #" + data;
            resolve(val);
            return "User #" + data;
        },
        function(e) {
            reject(e);
        }); 
    });
}



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

