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

var auth = require('./bl_auth')

function fixNoteObject(noteObjectIn)
{
    noteObjectIn.creator = auth.getUID(noteObjectIn.creator);
    noteObjectIn.noteSubject = auth.getUID(noteObjectIn.subject);
    return noteObjectIn;
}


var registerNewNote = function(NoteObject)
{
    var response = new Object();
    response.isOk = true;
    try
    {
        NoteObject = fixNoteObject(NoteObject)
        console.log('New Note + from '  + NoteObject.creator + '\t Note:\t' + NoteObject);
        note_id = 0;
        //update note_id //getValueNoteId()
        //db stuff
        response.data = note_id;
    }
    catch(e) {
        console.log("ERROR " + e.name + ':' + e.message);
        response.description = "Note Register ERROR";
        response.data = e.name + ':' + e.message;
        response.isOk = false;
    }
};


//extract note by noteid
function getNoteByNoteId(noteId)
{
    var notes = [];
    //db stuff
    
    
    var NoteObject = new Object();
    NoteObject.date = new Date();
    NoteObject.noteText = "ABACABA";
    NoteObject.creator = 0;
    NoteObject.noteSubject = 0;
    
    notes.push(NoteObject);
    return notes;
    
}

//returns from bd notes about userid
function getNotesByUserId(userId)
{
    console.log("Get notes by UserId\t" + userId);

    var notes = [];
    //    //db stuff
    
    var NoteObject = new Object();
    NoteObject.date = new Date();
    NoteObject.noteText = "ABACABA";
    NoteObject.creator = 0;
    NoteObject.noteSubject = 0;
    
    notes.push(NoteObject);
    
    
    return notes;  
};


var getNotesByUserName = function(userName)
{
    var response = new Object();
    response.isOk = true;
    try
    {
        var userId = auth.getUID(userName);
        console.log("Get notes by UserName\t" + userName)
        var notes = getNotesByUserId(userId);
        //db stuff
    
        for (var i = 0;i < notes.length; ++i) 
        {
            notes[i].creator = auth.getUserName(notes[i].creator);
        }
        response.data = notes;
    }
    catch(e)
    {
        response.data = e.name + ':' + e.message;
        response.isOk = false;
    }
    
    return response;
};

var replyByNoteId = function(noteId, NoteObject)
{
    var response = new Object();
    response.isOk = true;
    try 
    {
        var predcessor = getNoteByNoteId(noteId).creator;
        NoteObject.noteSubject = predcessor;
        response.data = registerNewNote(NoteObject);
    }
    catch (e)
    {
        response.data = e.name + ':' + e.message;
        response.isOk = false;
        return response;
    }
};

var getNotesAboutMe = function(userId) 
{
    var response = new Object();
    response.isOk = true;
    try
    {
        var notes = getNotesByUserId(userId);
        for (var i = 0;i < notes.length; ++i) 
        {
            notes[i].creator = auth.unImpersonateUser(auth.getUserName(notes[i].creator));
        }
        response.data = notes;
    }
    catch (e)
    {
        response = new Object();
        response.data = e.name + ':' + e.message;
        response.isOk = false;
    }
    return response;
};

var updateNoteById = function(noteId, userId, data)
{
    var response = new Object();
    response.isOk = true;
    try
    {
        var note = getNoteByNoteId(noteId);
        if (note.creator == userId) 
        {
            //db-tool
            response.data = data;
            //update
        } else {
            response.isOk = false;
            response.data =  noteId + " Is not your note!!!";
        }
    }
    catch (e)
    {
        response = new Object();
        response.data = e.name + ':' + e.message;
        response.isOk = false;
    }
    return response;
}

module.exports.registerNewNote = registerNewNote;
module.exports.getNotesByUserName = getNotesByUserName;

module.exports.replyByNoteId = replyByNoteId;
module.exports.updateNote = updateNoteById

module.exports.getNotesAboutMe = getNotesAboutMe;


