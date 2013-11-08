var fs = require('fs') ;
var initdistricts = require("./init-collection-districts.js") ;

exports.onload = function(app) {
    this.step(initdistricts) ;
}
