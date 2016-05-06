var chai = require('chai');
/* eslint-disable */
var should  = chai.should();
var ws = require("nodejs-websocket");
/* eslint-enable */

describe('Testing db', function(){
        var db = require("../db_tarantool");
	before(function(){
                db.create_connection("127.0.0.1", 3111, "test", "test");
	});

	after(function(){
                db.destroy_connection();
	});
        //DB_PART
	describe('#db#users', function(){
		it('length', function(done){
                    db.tdb_getUserList()
                    .then(function(data)
                    {
                        data.should.have.length(11);
                        done();
                    });
		});
		it('should have undefined on unregistred_user', function(done){
			db.tdb_getUID('invalid_user')
                        .then(function(data){
                                
                                const isUndefined = typeof(data) == "undefined";
				isUndefined.should.equal(true);
                                done();
			});
		});
                
		it('should return existed user UID', function(done){
			db.tdb_getUID('SYSTEM')
                        .then(function(data){
				data.should.equal(0);
				done();
			});
		});
                
                it('should return existed userName', function(done){
			db.tdb_getUserName(0)
                        .then(function(data){
				data.should.equal('SYSTEM');
				done();
			});
		});
                
                it('registred user appears in db', function(done){
			db.tdb_addUser("NEW_USER", 12)
                        .then(function() {
                            return db.tdb_getUID("NEW_USER");
			}).then(function(data)
                            {
                                data.should.equal(12);
                                done();
                            });
                });
                
                it('registering of existing user should fails', function(done){
			db.tdb_addUser("NEW_USER_2", 0)
                        .then(function() 
                        {
			}
                        , function(error)
                        {
                            var isUndefined = typeof(error) != "undefined";
                            isUndefined.should.equal(true);
                            done();
                        }
                        );
                });
                
                it('Uids to users', function(done){
			db.tdb_usersToUids(['SYSTEM', '1'])
                        .then(function(data){
				data.length.should.equal(2);
                                data[0].should.equal(0);
                                data[1].should.equal(1);
				done();
			});
		});
                
                it('users to uids', function(done){
			db.tdb_uidsToUsers([0, 1])
                        .then(function(data){
				data.length.should.equal(2);
                                data[0].should.equal('SYSTEM');
                                data[1].should.equal('1');
				done();
			});
		});
	});

        describe('#db#notes()', function(){
            it('get  existing note', function(done){
                db.tdb_getNoteById(0)
                    .then(function(data)
                    {
                                var note = data.noteText;
                                note.should.equal('Simple note about System');
                                done();
                    });
            });
            
            it('get  existing note', function(done){
                db.tdb_getNoteById(0)
                    .then(function(data)
                    {
                                var note = data.noteText;
                                note.should.equal('Simple note about System');
                                done();
                    });
            });
            
            it('get  inexisting note should be undefined', function(done){
                db.tdb_getNoteById(100500)
                    .then(function(data)
                    {
                                var isUndefined = typeof(data) == "undefined";
                                isUndefined.should.equal(true);
                                done();
                    });
            });
            
            it('Update note test', function(done) {
                        var data = '{"date":"2016-05-04T11:25:58.445Z", "creator":0, "noteSubject":0, "noteText":"ABACABA", "noteId":0}';
                        var noteObject = JSON.parse(data);
                        db.tdb_updateNoteById(0, noteObject)
                        .then(function()
                        {
                            return db.tdb_getNoteById(0);
                        })
                        .then(function(data)
                        {
                            data.noteText.should.equal("ABACABA");
                            done();
                        });
            });
        });
        
        
        describe('#bl#auth', function()
        {
            var bl_auth = require('../bl_auth');
            
            it('unImpersonateUser', function(done){
                bl_auth.unImpersonateUser("SYSTEM")
                    .then(function(data)
                    {
                        data.should.equal('User #0');
                        done();
                    });
            });

            it('failAuth', function(done){
                var response = bl_auth.failAuth("SYSTEM");
                response.isOk.should.equal(false);
                response.data.should.equal('Failed auth with credentials:\tSYSTEM');
                done();
            });

            it('getUserList', function(done){
                bl_auth.getUserList()
                    .then(function(data)
                    {
                        data.isOk.should.equal(true);
                        data.data.length.should.equal(12);
                        done();
                    });
            });

            it('isRegistredUser valid', function(done) 
            {
                        bl_auth.isRegistredUser("SYSTEM")
                        .then(function(data)
                        {
                            data.should.equal(true);
                            done();
                        });
            });

            it('isRegistredUser invalid', function(done) 
            {
                        bl_auth.isRegistredUser("invalid_user")
                        .then(function(data)
                        {
                            data.should.equal(false);
                            done();
                        });
            });
            
            it('registerUser valid', function(done) 
            {
                        bl_auth.registerUser("new_user")
                        .then(function(data)
                        {
                            data.isOk.should.equal(true);
                            done();
                        });
            });

            it('registerUser invalid', function(done) 
            {
                        bl_auth.registerUser("SYSTEM")
                        .then(function(data)
                        {
                             data.isOk.should.equal(true);
                             data.data.should.equal("Already registred");
                             done();
                        });
            });

        });
        
        
        
        describe('#bl#all', function()
        {
            process.env.no_vk = 1;
            var srv_main = require('../srv_main');
            srv_main.startServer();
            
            it ('ws_list_users', function(done) {
                var conn = ws.connect("ws://localhost:8001")
                .on("text", function(data) {
                    data = JSON.parse(data);
                    data.response.isOk.should.equal(true);
                    data.response.data.length.should.equal(13);
                    conn.close();
                    done();
                })
                .on("connect", function()
                {
                    var conPacket = new Object();
                    conPacket.userName = "SYSTEM";
                    conPacket.date = new Date();
                    conPacket.cmd = 'list_users';
                    conn.sendText(JSON.stringify(conPacket));
                });
            });
            
            it ('ws_about_me', function(done) {
                var conn = ws.connect("ws://localhost:8001")
                .on("text", function(data) {
                    var noteData = JSON.parse(data);
                    noteData.response.isOk.should.equal(true);
                    noteData.response.data.length.should.equal(1);
                    const otherPattern = "User #";
                    for (var i = 0; i < noteData.length; ++i) {
                        var noteObject = noteData[i];
                        var isOther = noteObject.creator.substr(0, otherPattern.length) == otherPattern;
                        var isMy = noteObject.creator;
                        var isValid = isOther || isMy;
                        isValid.should.equal(true);
                    }
                    conn.close();
                    done();
                }).on("connect", function()
                {
                    var conPacket = new Object();
                    conPacket.userName = "SYSTEM";
                    conPacket.date = new Date();
                    conPacket.cmd = 'about_me';
                    conn.sendText(JSON.stringify(conPacket));
                });
            });
            
            it ('ws_registerUser -- exists', function(done) {
                var conn = ws.connect("ws://localhost:8001")
                .on("text", function(data) {
                    console.log("DATA_DATA");
                    console.log(data);
                    var noteData = JSON.parse(data);
                    noteData.response.isOk.should.equal(true);
                    conn.close();
                    done();
                })
                .on("connect", function() {
                    var conPacket = new Object();
                    conPacket.userName = "SYSTEM";
                    conPacket.date = new Date();
                    conPacket.cmd = 'register_user';
                    conn.sendText(JSON.stringify(conPacket));
                });
            });
            
            
            it ('ws_registerUser -- new', function(done) {
                
                var conPacket = new Object();
                conPacket.userName = "new_new_user";
                conPacket.date = new Date();
                conPacket.cmd = 'register_user';
                
                var second_call = false;
                
                var conn = ws.connect("ws://localhost:8001")
                .on("text", function(data) {
                    if (second_call)
                        console.log("SECOND_CALL");
                    else
                        console.log("FIRST_CALL");
                    console.log(data);
                    var noteData = JSON.parse(data);
                    noteData.response.isOk.should.equal(true);
                    if (second_call)
                    {
                        conn.close();
                        done();
                    }
                    
                    second_call = true;
                    conPacket.cmd = 'auth_user';
                    conn.sendText(JSON.stringify(conPacket));
                })
                .on("connect", function() {
                    conn.sendText(JSON.stringify(conPacket));
                });
            });
            
            it ('auth_user_fail', function(done) {
                var conn = ws.connect("ws://localhost:8001")
                .on("text", function(data) {
                    var noteData = JSON.parse(data);
                    noteData.response.isOk.should.equal(false);
                    conn.close();
                     
                    done();
                })
                .on("connect", function() {
                    var conPacket = new Object();
                    conPacket.userName = "__abadaba__";
                    conPacket.date = new Date();
                    conPacket.cmd = 'auth_user';
                    conn.sendText(JSON.stringify(conPacket));
                });
            });
            
            
            it ('new_note', function(done) {
                
                var note = new Object();
                note.date = new Date();
                note.creator = "1";
                note.noteSubject = "SYSTEM";
                note.noteText = "Strange tarantool system:";
                note.noteId = -1;
                
                var conPacket = new Object();
                conPacket.userName = "1";
                conPacket.date = new Date();
                conPacket.data = new Object();
                conPacket.data.note = note;
                conPacket.cmd = 'new_note';
                
                var second_call = false;
                
                var conn = ws.connect("ws://localhost:8001")
                .on("text", function(data) {
                    var noteData = JSON.parse(data);
                    noteData.response.isOk.should.equal(true);
                    if (second_call)
                    {
                        noteData.response.data.length.should.equal(2);
                        conn.close();
                        done();
                    }
                    second_call = true;
                    conPacket.cmd = "about_me";
                    conPacket.userName = "SYSTEM";
                    conn.sendText(JSON.stringify(conPacket));
                })
                .on("connect", function() {
                    conn.sendText(JSON.stringify(conPacket));
                });
            });
            
    
            
            it ('new_note -- invalid_sender', function(done) {
                
                var note = new Object();
                note.date = new Date();
                note.creator = "1";
                note.noteSubject = "SYSTEM";
                note.noteText = "Strange tarantool system: ";
                note.noteId = -1;
                
                var conPacket = new Object();
                conPacket.userName = "2";
                conPacket.date = new Date();
                conPacket.data = new Object();
                conPacket.data.note = note;
                conPacket.cmd = 'new_note';
                
                var conn = ws.connect("ws://localhost:8001")
                .on("text", function(data) {
                    var noteData = JSON.parse(data);
                    noteData.response.isOk.should.equal(false);
                    conn.close();
                    done();
                }).on("connect", function() {
                    conn.sendText(JSON.stringify(conPacket));
                });
            });
            
            
            it ('update_note', function(done) {
                var note = new Object();
                
                note.date = new Date();
                note.creator = "SYSTEM";
                note.noteSubject = "SYSTEM";
                note.noteText = "Updated simple note";
                note.noteId = 0;
                
                var conPacket = new Object();
                conPacket.userName = "SYSTEM";
                conPacket.date = new Date();
                conPacket.data = new Object();
                conPacket.data.note = note;
                conPacket.cmd = 'update_note';
                
                var second_call = false;
                
                var conn = ws.connect("ws://localhost:8001")
                .on("text", function(data) {
                    var noteData = JSON.parse(data);
                    noteData.response.isOk.should.equal(true);
                    if (second_call) 
                    {
                        var found = false;
                        for (var i = 0; i < noteData.response.data.length && !found; ++i)
                        {
                            if (noteData.response.data[i].creator == "SYSTEM") {
                                found = true;
                                var noteText = noteData.response.data[i].noteText;
                                noteText.should.equal("Updated simple note");
                            }
                        }
                        found.should.equal(true);
                        conn.close();
                        done();
                    }
                    second_call = true;
                    conPacket.cmd = "about_me";
                    conn.sendText(JSON.stringify(conPacket));
                }).on("connect", function() {
                    conn.sendText(JSON.stringify(conPacket));
                });
            });
            
            it ('update_note -- invalid username', function(done) {
                
                var note = new Object();
                note.date = new Date();
                note.creator = "SYSTEM";
                note.noteSubject = "SYSTEM";
                note.noteText = "Updated simple note";
                note.noteId = 0;
                
                var conPacket = new Object();
                conPacket.userName = "3";
                conPacket.date = new Date();
                conPacket.data = new Object();
                conPacket.data.note = note;
                conPacket.cmd = 'update_note';
                
                
                var conn = ws.connect("ws://localhost:8001")
                .on("text", function(data) {
                    var noteData = JSON.parse(data);
                    noteData.response.isOk.should.equal(false);
                    conn.close();
                     
                    done();
                }).on("connect", function() {
                    conn.sendText(JSON.stringify(conPacket));
                });
                
            });
            
            it ('reply_by_id', function(done) {
                var second_call = false;
                
                var note = new Object();
                note.date = new Date();
                note.creator = "SYSTEM";
                note.noteSubject = "1";
                note.noteText = "Reply note";
                note.noteId = 0;
                
                var conPacket = new Object();
                conPacket.userName = "SYSTEM";
                conPacket.date = new Date();
                conPacket.data = new Object();
                conPacket.data.note = note;
                conPacket.data.noteId = 11;
                conPacket.cmd = 'reply_to';
                
                var conn = ws.connect("ws://localhost:8001")
                .on("text", function(data) {
                    var noteData = JSON.parse(data);
                    console.log("reply_by_id RESPONSE :" + data);
                    noteData.response.isOk.should.equal(true);
                    if (second_call)
                    {
                        noteData.response.data.length.should.equal(2);
                        conn.close();
                        done();
                    }
                    second_call = true;
                    conPacket.userName  = "1";
                    conPacket.cmd = "about_me";
                    conn.sendText(JSON.stringify(conPacket));
                }).on("connect", function() {
                    conn.sendText(JSON.stringify(conPacket));
                });
            });

        });

});

