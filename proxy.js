/*
  This is the proxy that runs in an iFrame. 

*/

window.onload = function() {

    var JSON = require('JSON');

    var domain = "http://localhost/xhr-proxy/";

    var makeUrl = function(service) {
	return domain+service;
    }

    var onevent = function(name, fn) {
	(window.addEventListener || window.attachEvent)((window.attachEvent ? 'on' : '') + name, fn, false);
    };

    var post = function(data) {
	window.top.postMessage(JSON.stringify(data), '*');
    };

    var onmessage = function(data) {
	if(!typeof(data.settings) === "Object") {
	    throw Error("malformed input");
	}
	delete data.settings.success;
	delete data.settings.error;
	data.settings.complete = function(xhr, status) {
	    var err = false;
	    if(xhr.status != 200) {
		err = status;
	    }
	    post({id:data.id, err:err, value:{ xhr:xhr, status:status }});
	};
	
	$.ajax(makeUrl(data.service), data.settings);
    };

    onevent('message', function(e) {
	    var data = JSON.parse(e.data);

	    setTimeout(function() { onmessage(data) }, 1);
	});

    post('"curl_proxy init"');
};