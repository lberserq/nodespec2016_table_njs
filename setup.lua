#!/usr/bin/tarantool

local console = require('console')
console.listen('127.0.0.1:3112')

box.cfg {
    listen = 3111,
    logger = 'tarantool.log',
    slab_alloc_arena = 0.2
} 

dbuser = 'test'
dbpass = 'test'
if box.schema.user.exists(dbuser) then
    box.schema.user.create(dbuser, { password = dbpass })
    box.schema.user.grant(dbuser, 'read', 'space', '_space')
    box.schema.user.grant(dbuser, 'write', 'space', '_space')
    box.schema.user.grant(dbuser, 'read', 'space', '_index')
    box.schema.user.grant(dbuser, 'write', 'space', '_index')
    box.schema.user.grant(dbuser, 'execute', 'universe')
end


users = box.space.users
notes = box.space.notes

if users then
    users:drop()
end
if notes then
    notes:drop()
end
    
users = box.schema.space.create('users')
user_primary_index = users:create_index('primary', {type='tree',parts = {1, 'NUM'}})
users_secondary_index = users:create_index('secondary', {type = 'tree', unique=false, parts={2, 'STR'}})

users:insert({0, "SYSTEM"})


notes = box.schema.space.create('notes')
notes_primary_index = notes:create_index('primary', {type='tree', parts = {1, 'NUM'}})
notes_subject_index = notes:create_index('subject', {type='tree', unique =false, parts={3, 'NUM'}})


notes:insert({0, 0, 0, '{"date":"2016-05-04T11:25:58.445Z", "creator":0, "noteSubject":0, "noteText":"Simple note about System", "noteId":0}'})


box.schema.user.grant(dbuser, 'read', 'space', 'users')
box.schema.user.grant(dbuser, 'write', 'space', 'users')
box.schema.user.grant(dbuser, 'read', 'space', 'notes')
box.schema.user.grant(dbuser, 'write', 'space', 'notes')
