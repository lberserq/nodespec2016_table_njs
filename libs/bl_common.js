"use strict";
var auth = require('./bl_auth');
var noteEngine = require('./bl_notes');
var Promise = require('bluebird');

var commandProcessorImpl = function(packet, connectionNo)
{
    return new Promise(function(resolve, reject)
    {
        console.log('New packet' + packet);
    try 
    {    
        var unObsPacket = JSON.parse(packet);
        var login = unObsPacket.login;
        var password = unObsPacket.password;
        auth.authUser(unObsPacket.userName, login, password, connectionNo)
        .then(function(result)
        {
            console.log("bl:cp:Auth result :"  + result);
            
            if (result) 
            {
                return result;
            }
            
            console.log("bl:cp:CurrentCommand is :"  + unObsPacket.cmd);

            if (unObsPacket.cmd == 'register_user')
            {
                console.log("Trying to register " + unObsPacket.userName);
                return auth.registerUser(unObsPacket.userName);
            } else
            {
                console.log("Failing Auth!");
                var response = auth.failAuth(unObsPacket.userName);
                response.description = "Auth Rejected\t Unregistred User";
                return response;
            }
        }
        , function(e) 
        {
            console.log("bl:Auth failed " + e);
            var response = auth.failAuth(unObsPacket.userName);
            response.description = "bl:Auth failed ";
            if (typeof(e) != "undefined")
                response.data = response.data + e;
            reject(response);
            return response;
        })
        .then(function()
        {
            var UID = -1;
            return auth.getUID(unObsPacket.userName).then(function(data)
            {
                UID = data;
                console.log("bl!cp:getUID " + UID);
                return UID;
            } 
            , function(e)
            {
                console.log("bl:Auth rejected ");
                console.log(e);
                var response = new Object();
                response.description = "bl:Auth rejected";
                response.data = e;
                response.isOk = false;
                reject(response);
                //return response;
            });
        }
        ,function(e) 
        {
            console.log("bl:Auth rejected ");
            console.log(e);
            var response = new Object();
            response.description = "bl:Auth rejected";
            response.data = e;
            response.isOk = false;
            reject(response);
            //return response;
        })
        .then(function(UID)
        {
            if (UID == undefined) {
                console.log("bl!Assertion Error");
                var response = new Object();
                response.data = "Assertion user";
                response.description = response.data;
                response.isOk = false;
                reject(response);
            } else
            {
            
            console.log("MAIN PROCESSOR");
            var outPromise = undefined;
            console.log("UID", UID);
            if (unObsPacket.cmd == 'auth_user' || unObsPacket.cmd == 'register_user')
            {
                outPromise =  new Promise(function(resolve) {
                    var response = new Object();
                    response.data = 'OK';
                    response.isOk = true;
                    resolve(response);
                    return response;
                });
            } else if (unObsPacket.cmd == 'about_me') {
                outPromise = noteEngine.getNotesAboutMe(UID);
            } else if (unObsPacket.cmd == 'list_users'){
                outPromise =  auth.getUserList();
            } else if (unObsPacket.cmd == 'about_user') {
                let userName = unObsPacket.data;
                console.log("bl:about_user " + userName);
                outPromise =  noteEngine.getNotesByUserName(userName, UID);
            } else if (unObsPacket.cmd == 'reply_to') {
                let noteId = unObsPacket.data.noteId;
                let notePacket = unObsPacket.data.note;
                outPromise =  noteEngine.replyByNoteId(noteId, notePacket, UID);
            } else if (unObsPacket.cmd == 'update_note') {
                let notePacket = unObsPacket.data.note;
                outPromise = noteEngine.updateNote(notePacket.noteId, UID, notePacket);
            } else if (unObsPacket.cmd == 'new_note') {
                 let notePacket = unObsPacket.data.note;
                 outPromise = noteEngine.registerNewNote(notePacket, UID);
            } else {
                outPromise = new Promise(function(resolve) {
                    var response = new Object();
                    response.data = 'Invalid command:';
                    if (typeof(unObsPacket.cmd) != 'undefined')
                        response.data += unObsPacket.cmd;
                    response.isOk = false;
                    resolve(response);
                });
            }
            
            resolve(outPromise);
            
            return outPromise;
            }
        }
        ,function(e) 
        {
            console.log("bl:UID get failed");
            var response = new Object();
            response.description = "bl:UID get failed";
            response.data = e.name + ':' + e.message;
            response.isOk = false;
            reject(response);
            return response;
        });
        }
        catch (e)
        {
            return new Promise(function(resolve) {
                    var response = new Object();
                    response.data = e.name + ':' + e.message;
                    response.isOk = false;
                    resolve(response);
                    return response;
                });
        }
    });
    
};

var commandProcessor = function(packet, connectionNo)
{
    var data = new Object();
    return new Promise(function(resolve)
    {
        try
        {
            commandProcessorImpl(packet, connectionNo)
            .then(function(response)
            {
                    console.log("COMBINED REPONSE " + response);
                    data.response = response;
                    data.date = new Date();
                    var dataJSON = JSON.stringify(data);
                    resolve(dataJSON);
                    return dataJSON;
            }
            ,function(e)
            {
                data.response = e;
                console.log("BL:combine ");
                var dataJSON = JSON.stringify(data);
                console.log(dataJSON);
                resolve(dataJSON);
                return dataJSON;
                //throw "Combine error: " + e;
            });
        }
        catch (e)
        {
            data.response = e;
            console.log("BL:combine!Exception ");
            var dataJSON = JSON.stringify(data);
            console.log(dataJSON);
            resolve(dataJSON);
            return dataJSON;
        }
    });
};

module.exports.commandProcessor = commandProcessor;

