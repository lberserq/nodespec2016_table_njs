var auth = require('./bl_auth');
var noteEngine = require('./bl_notes');


var commandProcessorImpl = function(packet)
{
    console.log('New packet' + packet);
    try 
    {
    
        var unObsPacket = JSON.parse(packet);
        if (!auth.authUser(unObsPacket.userName))
        {
            if (unObsPacket.cmd == 'register_user') {
                auth.registerUser(unObsPacket.userName);
            } else {
                return auth.failAuth();
            }
        }
        console.log("User Authentificated " + unObsPacket.userName);
        
        var UID = auth.getUID(unObsPacket.userName);
    
        console.log("UID", UID);
        if (unObsPacket.cmd == 'auth_user')
        {
            response = new Object();
            response.data = 'OK';
            response.isOk = true;
            return response;
        }
        
        
        if (unObsPacket.cmd == 'about_me') {
            return noteEngine.getNotesAboutMe(UID);
        }
        
        if (unObsPacket.cmd == 'list_users'){
            return auth.getUserList();
        }
    
    
        if (unObsPacket.cmd == 'about_user') {
            var userName = unObsPacket.data;
            return noteEngine.getNotesByUserName(userName);
        }
    
    
        if (unObsPacket.cmd == 'reply_to') {
            var noteId = Integer(unObsPacket.data.noteId);
            var notePacket = unObsPacket.data.note;
            return noteEngine.replyByNoteId(noteId, notePacket);
        }
        
        if (unObsPacket.cmd == 'update_note') {
            var noteId = Integer(unObsPacket.data.noteId);
            var notePacket = unObsPacket.data.note;
            return noteEngine.getNotesAboutMe(noteId, notePacket);
        }
    }
    catch (e)
    {
        var response = new Object();
        response.data = e.name + ':' + e.message;
        response.isOk = false;
        return response;
    }
    
    
};

var commandProcessor = function(packet)
{
    var response = commandProcessorImpl(packet);
    var data = new Object();
    data.response = response;
    data.date = new Date();
    
    var dataJSON = JSON.stringify(data);
    return dataJSON;
};

module.exports.commandProcessor = commandProcessor;

