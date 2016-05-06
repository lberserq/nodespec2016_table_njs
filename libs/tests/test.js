var chai = require('chai');
/* eslint-disable */
var should  = chai.should();
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
});
/*
describe('Testing functionality', function(){
	var main = require('./main');
	var dbClient = redis.createClient();
	var websocket = new WebSocket('ws://127.0.0.1:2000');
	websocket.on('open', function(){
		websocket.send(JSON.stringify({type: 'authorize', username : 'admin', password : 'admin'}));
	});
	var messages = [];
	websocket.on('message', function(message, flags){
		messages.push(JSON.parse(message));
	});
	describe('authorize', function(){
		it('receive authorization', function(done){
			chai.assert.notEqual(messages.filter(function(x){return x.type === 'authorize';}).length, 0, 'server authorized me');
			done();
		});
	});

	describe('#handle_logout', function(){
		it('logout', function(done){
			main.onlineUsers.push({websocket : main.wss.clients[0]});
			main.handle_logout(main.wss.clients[0]);
			setTimeout(function(){
				chai.assert.notEqual(messages.filter(function(x){return x.type === 'logout';}).length, 0, 'logout success');
				done();
			}, 10);
			
		});
	});

	describe('#handle_online', function(){
		it('online', function(done){
			main.onlineUsers.forEach(function(x){
				main.handle_online(true, dbClient, x.websocket);
			});
			setTimeout(function(){
				chai.assert.notEqual(messages.filter(function(x){return x.type === 'online';}).length, 0, 'receive online list');
				done();
			}, 10);
		});
	});

	describe('#register_new_user', function(){
		it('register', function(done){
			main.register_new_user(main.wss.clients[0], dbClient, 
				{
					username : 'test1',
					password : 'test1',
					firstname : 'TEST',
					lastname : 'TEST'
				});
			setTimeout(function(){
				chai.assert.notEqual(messages.filter(function(x){return x.type === 'register';}).length, 0, 'response registering');
				done();
			}, 10);
		})
	});

	describe('#delete_user', function(){
		it('delete', function(done){
			main.delete_user(true, true, {username : 'test1'}, dbClient, main.wss.clients[0]);
			setTimeout(function(){
				chai.assert.notEqual(messages.filter(function(x){return x.type === 'delete';}).length, 0, 'response registering');
				done();
			}, 10);
		});
	});

	describe('#handle_message', function(){
		it('message', function(done){
			main.handle_message({text : 'HELLLO'}, 'admin', true, dbClient, main.wss.clients[0]);
			setTimeout(function(){
				chai.assert.notEqual(messages.filter(function(x){return x.type === 'message' && x.text === 'HELLLO';}).length, 
					0, 'sent message receiving');
				done();
			}, 10);
		});
	});

});*/
