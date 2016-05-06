"use strict";

var vkAuth = require('vk-auth')(5450078 , 'friends');
 var VK = require('vksdk');
 var vk = new VK({
    'appId'     : 5450078,
    'appSecret' : 'wiex4ZrrthQsl5nyG8o8'
 });
 
  vkAuth.authorize('berserq_k_mail@mail.ru', 'N7B1LoSm');
  
  vkAuth.on('error', function(err) {
      console.log(err);
  });
  
  vkAuth.on('auth', function(tokenParams) {
      //do something with token parameters
      console.log(tokenParams);
      vk.setToken(tokenParams.access_token);
      vk.request('users.get', {'user_id' : tokenParams.user_id}, 
                 function(data) {
          console.log(data.response);
          console.log(data.response[0].first_name);
          console.log(data.response[0].last_name);
          
      });
  });
