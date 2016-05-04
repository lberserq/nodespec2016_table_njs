#!/usr/bin/tarantool
local console = require('console')
console.listen('127.0.0.1:3112')

box.cfg {
    listen = 3311,
    logger = 'tarantool.log',
    slab_alloc_arena = 0.2
} 

dbuser = 'test'
dbpass = 'test'

if box.space._user.index.name:select{dbuser} == 0 then
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
users_secondary_index = users:create_index('secodary', {type = 'tree', parts={2, 'STR'}})

users:insert({0, "SYSTEM"})
for i = 1, 10 do
    users:insert({i, tostring(i)})
end




notes = box.schema.space.create('notes')
notes_primary_index = notes:create_index('primary', {type='tree', parts = {1, 'NUM'}})
notes_subject_index = notes:create_index('subject', {type='tree', parts={3, 'NUM'}})

notes:insert({0, 0, 0, '{"date":"2016-05-04T11:25:58.445Z", "creator":0, "noteSubject":0, "noteText":"Simple note about System", "noteId":0}'})

for i = 1, 10 do
    str = '{"date":"2016-05-04T11:25:58.445Z", "creator":0, "noteSubject":0, "noteText":"Simple note about System"' ..  tostring(i) .. ' ,"noteId: ' .. tostring(i)
    notes:insert({i, i, i, str})
end


