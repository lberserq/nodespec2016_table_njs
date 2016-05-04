function isRegistredUser(userName)
{
    //db stuff
    return false;
}

var authUser = function(userName)
{
    if (isRegistredUser(userName)) {
        return false;
    }
    
    return true;
};

var failAuth = function(userName)
{
    response = new Object();
    response.isOk = false;
    response.description = 'AUTH-FAILED';
    response.data = 'Failed auth with credentials:\t' + userName;
    return response;
};


var getUserList = function()
{
    var response = new Object();
    response.isOk = true;
    try
    {
        var userList = [];
        //db stuff getUserList
        
        userList.push("IVAN");
        response.data = userList;
    }
    catch(e)
    {
        console.log("ERROR " + e.name + ':' + e.message);
        response.description = "Note Register ERROR";
        response.data = e.name + ':' + e.message;
        response.isOk = false;
    }
    return response;
};

var getUID = function(userName)
{
    return Math.random() * 100;
};

var getUserName = function(userId)
{
    //db stuff
    return "Ivan";
};

var registerUser = function(userName)
{
    if (!isRegistredUser(userName))
    {
        //db stuff add to users table
    //    return Math.random() * 100;
    }
};

var unImpersonateUser = function(userName)
{
    return userName + getUID(userName);
}



module.exports.authUser = authUser;
module.exports.unImpersonateUser = unImpersonateUser;
module.exports.registerUser = registerUser;
module.exports.failAuth = failAuth;
module.exports.getUID = getUID;
module.exports.getUserName = getUserName;
