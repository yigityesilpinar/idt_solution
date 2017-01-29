/**
 * Created by User on 28.01.2017.
 *
 *  server/statics/index.js
 *  Serve static files
 */
var node_static = require("node-static");
var fs = require('fs');
var url = require('url');


var SERVER_SLASH ='\\';
var removeFromEnd = function (path, number) {
    var pathParts = path.split(SERVER_SLASH);
    var _length = pathParts.length;

    return pathParts.slice(0,_length-number).join(SERVER_SLASH);
};

var staticRoot = removeFromEnd(__dirname, 2) + SERVER_SLASH + "dist";

// create a static file server
var static_files = new node_static.Server(staticRoot);
exports.serveStatics = function (req, res) {

    // check static url pattern
    var isHtml = /^\/(.+\.html$)/.test(req.url);
    var isJs = /^\/(.+\.js$)/.test(req.url);
    var isFavIcon = /^\/(favicon\.ico$)/.test(req.url);
    var isCss =/^\/(.+\.css$)/.test(req.url);
    var isIndex = (req.url === "" || req.url === "/");
    var isStatic = (isHtml || isJs || isFavIcon || isIndex || isCss);
    if (req.method === 'GET' && isStatic) {

        req.addListener("end", function () {

            // special cases for static files
            if(isIndex){
                var addHtml = req.url === "/" ? "index.html": "/index.html";
                 req.url  = req.url+addHtml;
            }
            else if(isFavIcon){
                req.url  = "/img/"+ req.url;
            }

            static_files.serve(req, res);
        });
        req.resume();
        return true;
    }
    return false;
};



