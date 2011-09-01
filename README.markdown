Purpose
=========

Proxy for cross domain XmlHttpRequests intended for browsers that don't
support the CORS protocol. The proxy mirrors the signature of jQuerys ajax method, and indeed internally uses jQuery to perform the xhr request. 
  
Use it like this
================
* Change the variable 'domain' in proxy.js to the domain you wish to send cross-domain XHR requests to. 
* Serve xhr-proxy.js, proxy.js, proxy.html and jQuery-1.6.2.js from that same domain. 
* Use it from your javascript on some other domain. Look at example.html to see how. 

It works like this
================
An iFrame is created, in which proxy.html runs, which includes proxy.js. Since they are served on the foreign domain, they can make ordinary xhr requests to it. Calling XHRProxy's ajax method sends a message to the iFrame, which in turn makes the xhr request and sends a message back to its parent frame. 
