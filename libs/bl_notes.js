"use strict";
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

var auth = require('./bl_auth');
var db = require('./db_tarantool');
var Promise = require('bluebird');

function fixNoteObject(noteObjectIn, fix)
{
    if (typeof(fix) == "undefined")
        fix = true;
        
    console.log("bl!notes!fixNoteObject\tparams: fix" + fix);
    
    if (!fix) {
        console.log("NoFix");
        return new Promise(function(resolve)
        {
            resolve(noteObjectIn);
            return noteObjectIn;
        });
    } else {
        console.log("Fix It!");
        return auth.getUIDs([noteObjectIn.creator, noteObjectIn.noteSubject])
            .then(function(uids)
            {
                console.log("bl!notes!fixNoteObject \t uids=");
                console.log(uids);
                noteObjectIn.creator = uids[0];
                noteObjectIn.noteSubject = uids[1];
                return noteObjectIn;
            },
            function (err)
            {
                throw new Error(err);
            });
    }
}


var registerNewNote = function(NoteObject, fix)
{
    var response = new Object();
    response.isOk = true;
    
    if (typeof(fix) == "undefined")
        fix = true;
    
    return new Promise(function(resolve, reject)
    {
        try
        {
            return fixNoteObject(NoteObject, fix)
            .then(function(NoteObjectFixed)
            {
                console.log("bl!notes!registerNewNote!FixedObject");
                console.log(NoteObjectFixed);
                return db.tdb_getmaxNoteId()
                .then(function(note_id)
                {
                    console.log("bl!notes!registerNewNote!note_id " + note_id);
                    note_id = note_id + 1;
                    NoteObjectFixed.noteId = note_id;
                    response.data = note_id;
                    return db.tdb_insertNote(note_id, NoteObjectFixed)
                    .then(function(data)
                    {
                        console.log("bl!notes!tdb_insertNote!data " + data);
                        response.description = data;
                        response.data = note_id;
                        resolve(response);
                    } 
                    ,function (e)
                    {
                        console.log(e);
                        if (typeof(e) == "object")
                            reject(e);
                        else
                        {
                            response.description = "Note Register error";
                            response.data = e.name + ':' + e.message;
                            response.isOk = false;
                            reject(response);
                        }
                    });
                }
                ,function (e)
                {
                    console.log(e);
                    if (typeof(e) == "object")
                        reject(e);
                    else
                    {
                        response.description = "Note Register error";
                        response.data = e.name + ':' + e.message;
                        response.isOk = false;
                        reject(response);
                    }
                });
            }
            ,function (e)
            {
                console.log(e);
                if (typeof(e) == "object")
                    reject(e);
                else
                {
                    response.description = "Note Register error";
                    response.data = e.name + ':' + e.message;
                    response.isOk = false;
                    reject(response);
                }
            });
        }
        catch(e) {
            console.log(e);
            if (typeof(e) == "object")
                reject(e);
            else
            {
                response.description = "Note Register error";
                response.data = e.name + ':' + e.message;
                response.isOk = false;
                reject(response);
            }
        }
    });
};


//extract note by noteid
function getNoteByNoteId(noteId)
{
    return new Promise(function(resolve, reject)
    {
       return db.tdb_getNoteById(noteId)
       .then(function(note)
        {
            resolve(note);
            return note;
        },
        function (e)
        {
            reject(e);
        });
    });
}

//returns from bd notes about userid
function getNotesByUserId(userId)
{
    return new Promise(function(resolve, reject)
    {
        return db.tdb_getNotesByUserId(userId)
       .then(function(notes)
        {
            resolve(notes);
            return notes;
        },
        function (e)
        {
            reject(e);
        });
    });
}


var getNotesByUserName = function(userName)
{
    var response = new Object();
    response.isOk = true;
    return auth.getUID(userName)
    .then(function(userId)
    {
        console.log("bl!notes!Get notes by UserName\t" + userName);
        return getNotesByUserId(userId)
        .then(function(notes)
        {
            console.log("bl!notes!Get notes by UserName!getNotesByUserId\t" + notes);

            var local_uids = [];
            for (var i = 0;i < notes.length; ++i) 
            {
                local_uids.push(notes[i].creator);
            }
            return auth.getUserNames(local_uids)
            .then(function(data)
            {
                for (var i = 0;i < notes.length; ++i) 
                {
                    notes[i].creator = data[i];
                }
                response.data = notes;
                return response;
            },
            function(e)
            {
                var response = new Object();
                response.data = e.message;
                response.isOk = false;
                return response;
            });
        }
        ,function(e)
        {
            var response = new Object();
            response.data = e.message;
            response.isOk = false;
            return response;
        });
    }
    ,function(e)
    {
        var response = new Object();
        response.data = e.message;
        response.isOk = false;
        return response;
    });
    
};

var replyByNoteId = function(noteId, NoteObject)
{
    var response = new Object();
    response.isOk = true;
    return new Promise(function(resolve, reject)
    {
        return getNoteByNoteId(noteId, false)
        .then(function(note)
        {
            NoteObject.noteSubject = note.creator;
            NoteObject.creator = note.noteSubject;
            console.log("Registering new note");
            
            return registerNewNote(NoteObject, false)
            .then(function(data)
            {
                response.data = data;
                resolve(response);
            },
            function(e)
            {
                if (typeof(e) == "object")
                    reject(e);
                else
                {
                    var response = new Object();
                    response.data = e.name + ':' + e.message;
                    response.isOk = false;
                    reject(response);
                }
            });
            
        },
        function(e)
        {
            if (typeof(e) == "object")
                reject(e);
            else
            {
                var response = new Object();
                response.data = e.name + ':' + e.message;
                response.isOk = false;
                reject(response);
            }
        });
    });
};

var getNotesAboutMe = function(userId) 
{
    return new Promise(function(resolve, reject)
    {
        return getNotesByUserId(userId)
        .then(function(notes)
        {
            try 
            {
            //todo refactor
                var local_uids = [];
                for (var i = 0;i < notes.length; ++i) 
                {
                    local_uids.push(notes[i].creator);
                }
                return auth.getUserName(userId)
                .then(function(userName)
                {
                    var data = auth.unImpersonateUIDs(local_uids);
                    
                    for (var i = 0;i < notes.length; ++i) 
                    {
                        if (notes[i].creator != userId)
                            notes[i].creator = data[i];
                        else 
                            notes[i].creator = userName;
                    }
                    
                    
                    var response = new Object();
                    response.isOk = true;
                    response.data = notes;
                    resolve(response);
                },
                function(e)
                {
                    if (typeof(e) == "object")
                        reject(e);
                    else
                    {
                        var response = new Object();
                        response.data = e.name + ':' + e.message;
                        response.isOk = false;
                        reject(response);
                    }
                });
            }
            catch (e)
            {
                if (typeof(e) == "object")
                    reject(e);
                else
                {
                    var response = new Object();
                    response.data = e.name + ':' + e.message;
                    response.isOk = false;
                    reject(response);
                }
            }
        },
        function(e) 
        {
            if (typeof(e) == "object")
                reject(e);
            else
            {
                var response = new Object();
                response.data = e.name + ':' + e.message;
                response.isOk = false;
                reject(response);
            }
        });
    });
};

var updateNoteById = function(noteId, userId, data)
{
    return new Promise(function(resolve, reject) 
    {
        var response = new Object();
        response.isOk = true;
        try
        {
            return getNoteByNoteId(noteId).then(function(note)
            {
                console.log("bl!notes!updateNoteById!NOTEID " + noteId);
                console.log("bl!notes!updateNoteById!NOTE=\t");
                console.log(note);
                if (note.creator == userId) 
                {
                    note.noteText = data;
                    return db.tdb_updateNoteById(noteId, note)
                        .then(function(data)
                        {
                            response.data = data;
                            resolve(response);
                            return response;
                        }, function(e)
                        {
                            console.log(e);
                            var response = new Object();
                            response.data = JSON.stringify(e);
                            
                            console.log(response.data);
                            response.isOk = false;
                            reject(response);
                            
                        });

                } else {
                    response.isOk = false;
                    response.data =  noteId + " Is not your note!!!";
                    reject(response);
                }
            }
            , function(e)
            {
                if (typeof(e) == "object")
                    reject(e);
                else
                {
                    let  response = new Object();
                    response.data = JSON.stringify(e);
                    response.isOk = false;
                    reject(response);
                }
            });
        }
        catch (e)
        {
            if (typeof(e) == "object")
                reject(e);
            else
            {
                let response = new Object();
                response.data = JSON.stringify(e);
                response.isOk = false;
                reject(response);
            }
        }
    });
};

module.exports.registerNewNote = registerNewNote;
module.exports.getNotesByUserName = getNotesByUserName;

module.exports.replyByNoteId = replyByNoteId;
module.exports.updateNote = updateNoteById;

module.exports.getNotesAboutMe = getNotesAboutMe;


