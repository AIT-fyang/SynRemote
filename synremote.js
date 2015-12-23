/**
 * SynRemote    A light framework that executing SF Remote Actions in synchronous sequence
 * Author   	fyang
 * Date			2015 12/22
 **/
(function(){
	var SynRemote = {
		executeSyn: function(queue, callback){
			if(!queue || !(queue instanceof Array) || queue.length == 0){
				throw new Error('invalid input parameters');
			}

			for(var i = 0; i < queue.length; i++){
				var m = queue[i];
				if(i != queue.length - 1){
					m.nextCall = queue[i + 1];
				}else{
					m.nextCall = callback;
				}
			}

			//fire the first one of chaining
			queue[0].run();

			return this;
		},
		synAll: function(){
			return SynRemote.executeSyn.apply(SynRemote, arguments);
		},
		factory: function(remoteAction, data, handlers, settings){//remoteAction - str, parameters object, handlers obj, settings obj
			var wrapper = {};
			wrapper.remoteAction = remoteAction;
			if(settings){
				wrapper.buffer = settings.buffer;
				wrapper.timeout = settings.timeout;
			}else{
				wrapper.buffer = false;
				wrapper.timeout = 120000;
			}
			if(handlers){
				wrapper.errorhandler = handlers.error;
				wrapper.oncomplete = handlers.complete; //call immediately after getting response
			}
			
			wrapper.nextCall = null; //preserved for chaining execution
			wrapper.data = data;
			wrapper.run = function(){
				var wrapper = this;
				var params = {
					action: wrapper.remoteAction,
					data: wrapper.data,
					callback: function(result,event){
						wrapper.result = result;

						if(wrapper.oncomplete){
							wrapper.oncomplete(result);
						}
						if(wrapper.nextCall){
							if(wrapper.nextCall instanceof Function){
								wrapper.nextCall();
							}else if(wrapper.nextCall instanceof Object){
								wrapper.nextCall.run();
							}
						}
					},
					errorHandler: wrapper.errorhandler,
					escape: wrapper.escape,
				};

				SynRemote.callRemoteAction(params);
				return this;
			};
			wrapper.fail = function(handler){
				this.errorhandler = handler;
				return this;
			};
			wrapper.then = function(handler){
				this.oncomplete = handler;
				return this;
			}

			return wrapper;
		},
		callRemoteAction: function(params){
			var handler = function(result,event){
	            if(event.status){
	                //console.log(event);
	                if(params.callback){
	                    params.callback(result,event);
	                }
	            }else{
	            	if(event.type === "exception"){
	            		console.log('There is an exception raised during the process of remote action, detail following.');
	            		console.log(event);
	            		if(params.errorHandler && params.errorHandler instanceof Function){
	            			params.errorHandler(event);
	            		}
		            }else{
		            	throw new Error("unexpected error: " + event.message);
		            }
	            }
	        }

	        var Manager = Visualforce.remoting.Manager;

	        var args;
	        if(params.data){
	        	if(params.data instanceof Array){
	        		args = Array.prototype.slice.apply(params.data);
	        	}else{
	        		args = [params.data];
	        	}
	        }else{
	        	args = [];
	        }

	        args.splice(0,0,params.action);
	        args.push(handler);
	        args.push({escape: params.escape});
	        Manager.invokeAction.apply(Manager, args);
		}
	};

	window.SynRemote = SynRemote;
})();