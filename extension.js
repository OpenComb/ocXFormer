var fs = require('fs') ;
var libxmljs = require("libxmljs");
var initdistricts = require("./init-collection-districts.js") ;

exports.onload = function(app) {
    this.step(initdistricts) ;
}
