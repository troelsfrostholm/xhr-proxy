/*
  XHRProxy

  This is the programmer's interface to the xhr proxy, which enables the user to make cross origin xhr requests to the domain on which it is served. 
  
  See README.markdown and example.html for usage. 
 */

(function(exports) {
    var JSON   = require('JSON');
    var common = require('common');
    
    var onevent = function(name, fn) {
	(window.addEventListener || window.attachEvent)((window.attachEvent ? 'on' : '') + name, fn, false);
    };
    
    exports.supported = typeof window.postMessage === 'function';
    
    /*
      Returns an instance of the XHRProxy. 
      Arguments: 
        proxy : the full url of proxy.html
    */
    exports.create = function(proxy) {
	var that = {};
	
	var onframe = common.future();
	var iframe = document.createElement('iframe');
	
	iframe.style.position   = 'absolute';
	iframe.style.left       = '-1000px';
	iframe.style.top        = '-1000px';
	iframe.style.visibility = 'hidden';
	
	iframe.src = proxy;
	
	var onbody = function() {
	    document.body.appendChild(iframe);
	};
	
	if (document.body) {
	    onbody();
	} else {
	    onevent('load', onbody);
	}
	
	var onmessage = function(event) {
	    onframe.put(iframe.contentWindow);
	    
	    onmessage = function(event) {
		var data;
		try {
		    data = JSON.parse(event.data);
		} catch (ex) {
		    data = {};
		}
		
		var callback = callbacks[data.id];
		
		if (!callback) {
		    return;
		}
		delete callbacks[data.id];
		
		callback(data.err && new Error(data.err), data.value);
	    };
	};
	var callbacks = {};
	
	onevent('message', function(event) {
		if (proxy.indexOf(event.origin) !== 0) {
		    return;
		}
		onmessage(event);
	    });

	/*
	  Sends message to the iFrame. 
	  Callback is invoked, when the iFrame responds. 
	*/
	var send = function(message, callback) {
	    var id = common.gensym();

	    callbacks[id] = callback;
	    message.id = id;

	    onframe.get(function(frame) {
		    frame.postMessage(JSON.stringify(message), proxy);
		});
	};

	/*
	  Send a cross-origin xhr request. 
	  Arguments: 
	    service : The request is sent to the url: domain/service, 
	              where domain is the domain on which the proxy is served. 
            settings : Same as in jQuery-1.6.2's $.ajax() method. 

	 */
	that.ajax = function() {
	    var callbacks = { };
	    return function(service, settings) {

		var id = common.gensym();
		callbacks[id] = { success : settings.success,
				  error : settings.error,
				  complete : settings.complete };
		
		send({ service : service, settings : settings}, function(err, result) {
			var callback = callbacks[id];
			delete callbacks[id];
			if(err && typeof(callback.error) === "function") {
			    callback.error(result.xhr, result.status, result.xhr.status); 
			}
			else if(typeof(callback.success) === "function") {
			    callback.success(result.xhr.responseText);
			}
			if(typeof(callback.complete) === "function") {
			    callback.complete(result.xhr, result.status);
			}
		    });
	    }
	}();
	    
	that.destroy = function() {
	    onframe.get(function() {
		    iframe.parentNode.removeChild(iframe);
		});
	};

	return that;
    };

})(XHRProxy = {});