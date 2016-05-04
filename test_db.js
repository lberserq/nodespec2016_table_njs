var TarantoolConnection = require('tarantool-driver');
const Promise = require('bluebird');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var sleep = require('sleep');

var conn = new TarantoolConnection({host:"192.168.1.68", port: 3111});
function db_get(){
var promise = conn.connect().then(function(){
                                console.log("CONNECT");
				return conn.auth('test', 'test');
			}, function(e){ console.log(e);})
return promise;
}

var con_promise = db_get();

function my_get(no)
{
var result = undefined
var fn = function(data) {
    console.log("DT\t" + data);
    console.log(data[1]);
    result = data[0][1];
}

timeout = 1000;
var promise = con_promise
.then(function(){console.log("DB_GET");}, function(e){console.log(e);})
.then(function() {console.log("AUTH SUCCESSFULL!"); return conn.select("users", "primary", 1000, 0, "all", []);}, function(e){ console.log(e); })
.then(function(data){fn(data);}, function(e){console.log(e); return e;})
.then(function(){return conn.destroy(true);})
.catch(function(e){console.log(e);});
q =  new Promise(function(resolve, reject){
setTimeout(function(){resolve(result);}
,timeout)});

sleep.usleep(timeout * 1000);
return result;
}

//var get = async(function(no){var p = await my_get(no); return p;});
//console.log(get.then(function(){console.log("AAAAA!");}));

console.log(my_get(0));
console.log(my_get(1))
