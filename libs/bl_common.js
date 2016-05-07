"use strict";
var auth = require('./bl_auth');
var noteEngine = require('./bl_notes');
var Promise = require('bluebird');

var commandProcessorImpl = function(packet, connectionNo)
{
    return new Promise(function(resolve, reject)
    {
        console.log('New packet' + packet);
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
        })
        .then(function()
        {
            var UID = -1;
            return auth.getUID(unObsPacket.userName).then(function(data)
            {
                UID = data;
                console.log("bl!cp:getUID " + UID);
                return UID;
            });
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
            }
            else 
            {
                var outPromise = undefined;
                if (unObsPacket.cmd == 'auth_user' || unObsPacket.cmd == 'register_user')
                {
                    outPromise =  new Promise(function(resolve) 
                    {
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
                    outPromise = new Promise(function(resolve) 
                    {
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
        });
    });
};

var commandProcessor = function(packet, connectionNo)
{
    var data = new Object();
    return commandProcessorImpl(packet, connectionNo)
            .then(function(response)
            {
                    console.log("COMBINED REPONSE " + response);
                    data.response = response;
                    data.date = new Date();
                    var dataJSON = JSON.stringify(data);
                    return dataJSON;
            }
            ,function(e)
            {
                data.response = new Object();
                data.response.isOk = false;
                data.response.data = e;
                console.log("BL:combine ");
                var dataJSON = JSON.stringify(data);
                console.log(dataJSON);
                return dataJSON;
            });
};

module.exports.commandProcessor = commandProcessor;

