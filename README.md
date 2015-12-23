
# SynRemote
Synchronous Remote Actions for SFDC
It is ugly to execute salesforce remote action in synchonously. SynRemote is a light weigh tool to make things easier.


# Installing
Include SynRemote on your page using a \<script\> tag


# Usage
Excample 1 Synchronize in pretty

    var w1 = SynRemote.factory('myController.remoteAction1');
    var w2 = SynRemote.factory('myController.remoteAction2', para);
    var w3 = SynRemote.factory('myController.remoteAction3', [para1,para2]);
    SynRemote.synAll([w1,w2,w3]);

Excample 2 Easy to make handlers

    var w1 = SynRemote.factory('myController.remoteAction1', null).then(function(result){
      if(result === true){
        console.log('Execution succeed')
      }
    }).fail(function(error){
      alert(error.message);
    });
    
    SynRemote.synAll([w1]);
    
Excample 3 Pass data dynamically

    var w1 = SynRemote.factory('myController.remoteAction1');
    ...
    w1.data = JSON.stringify(formData);
    SynRemote.synAll([w1]);


# Advanced
    var printRes = function(res){
 	console.log("Result:" + res);
    }
 
    var w1 = SynRemote.factory('synModelTest_Ctlr.regularTest');
    var w2 = SynRemote.factory('synModelTest_Ctlr.accountCount', null, {complete:printRes});
    var w3 = SynRemote.factory('synModelTest_Ctlr.randomNumber', null, {complete:printRes});
    var w4 = SynRemote.factory('synModelTest_Ctlr.square',50).then(function(res){
 	console.log("square of 50 is " + res);
    }).fail(function(){
 	console.log('Failed in calculate square.');
    });
    var w5 = SynRemote.factory('synModelTest_Ctlr.regularTest2', null, {
	error: function(error){
		console.log('error:' + error.message)
	},
	complete: function(){
		console.log('complete:regularTest2')
	}
   }, {buffer: true, timeout: 120000});

   var SynRemoteTest = SynRemote.synAll([w1,w2,w3,w4], function(){
		console.log('All Done!');
   });

   setTimeout(function(){
	alert(w1.result);//result is stored in wrapper, but only accessible after callback, watch out.
  },3000)
