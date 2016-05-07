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
    if (!fix) {
       return Promise.resolve(noteObjectIn);
    } else {
        return auth.getUIDs([noteObjectIn.creator, noteObjectIn.noteSubject])
            .then(function(uids)
            {
                console.log("bl!notes!fixNoteObject \t uids=");
                console.log(uids);
                noteObjectIn.creator = uids[0];
                noteObjectIn.noteSubject = uids[1];
                return noteObjectIn;
            });
    }
}


var registerNewNote = function(NoteObject,  UID, fix)
{
    var response = new Object();
    response.isOk = true;
    
    if (typeof(fix) == "undefined")
        fix = true;
        return fixNoteObject(NoteObject, fix)
        .then(function(NoteObjectFixed)
        {
            if (NoteObjectFixed.creator != UID)
            {
                console.log("Security Violation by:" + UID);
                response.isOk = false;
                response.description = "Security Violation";
                response.data = "bl!registerNewNote CreatorUID != sender UIDs";
                return response;
            } 
            else
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
                        response.description = data;
                        response.data = note_id;
                        return response;
                    });
                });
        });
};

//extract note by noteid
function getNoteByNoteId(noteId)
{
    return db.tdb_getNoteById(noteId);
}

//returns from bd notes about userid
function getNotesByUserId(userId)
{
    return db.tdb_getNotesByUserId(userId);
}


var getNotesByUserName = function(userName, UID)
{
    var response = new Object();
    response.isOk = true;
    return auth.getUID(userName)
    .then(function(userId)
    {
        if (UID == userId) {
            return getNotesAboutMe(userId);
        }
        return getNotesByUserId(userId)
        .then(function(notes)
        {
            var local_uids = notes.map(function(note) {return note.creator;});
            return auth.getUserNames(local_uids)
            .then(function(userNames)
            {
                for (var i = 0;i < notes.length; ++i) 
                {
                    notes[i].creator = userNames[i];
                }
                response.data = notes;
                return response;
            });
        });
    });
    
};

var replyByNoteId = function(noteId, NoteObject, UID)
{
    var response = new Object();
    response.isOk = true;
    return getNoteByNoteId(noteId, false)
        .then(function(note)
        {
            NoteObject.noteSubject = note.creator;
            NoteObject.creator = note.noteSubject;
            return registerNewNote(NoteObject, UID, false)
            .then(function(data)
            {
                response.data = data;
                return response;
            });
        });
};

var getNotesAboutMe = function(userId) 
{
    return getNotesByUserId(userId)
    .then(function(notes)
    {
            //todo refactor
            var local_uids = notes.map(function(note) {return note.creator;});
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
                return {
                    isOk: true,
                    data: notes
                };
            });
    });
};

var updateNoteById = function(noteId, userId, data)
{
    var response = new Object();
    response.isOk = true;

    return getNoteByNoteId(noteId)
        .then(function(note)
            {
                if (note.creator == userId) 
                {
                    if (typeof(data.noteText) != "undefined")
                        note.noteText = data.noteText;
                    else if (typeof(data) == "string")
                        note.noteText = data;
                    else {
                        response.isOk = false;
                        response.data = "Invalid dataType of input";
                        return response;
                    }
                    note.date = new Date();
                    return db.tdb_updateNoteById(noteId, note)
                        .then(function(data)
                        {
                            response.data = data;

                            return response;
                        });

                } else {
                    console.log("Security Violation by:" + userId);
                    response.isOk = false;
                    response.data =  noteId + " Is not your note!!!";
                    return response;
                }
            });
};

module.exports.registerNewNote = registerNewNote;
module.exports.getNotesByUserName = getNotesByUserName;

module.exports.replyByNoteId = replyByNoteId;
module.exports.updateNote = updateNoteById;

module.exports.getNotesAboutMe = getNotesAboutMe;


