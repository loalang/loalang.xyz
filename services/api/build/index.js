"use strict";
exports.__esModule = true;
var http_1 = require("http");
http_1.createServer(function (req, res) {
    res.end("Hello World");
}).listen(process.env.PORT || 8085);
