var fs = require('fs') ;

module.exports = function(){

    var dcoll = helper.db.coll("districts") ; //.find() ;

    // make db index
    this.step(function(){

        function callback(err){ err && console.log(err) ; }
        helper.db.ensureIndex(
	    'ocxformer/districts'
	    , {
		id:1
		, value:1
	      }
	    , {background:true,unique:true}
	    , callback
	) ;
	helper.db.ensureIndex( 'ocxformer/districts', {parent:1} , {background:true}, callback ) ;
    }) ;

    this.step(function(){
	console.log("inserting provinces, cities, and districts into db ...") ;
	dcoll.insert(
	    require("./data/districts.json")
	    , {}
	    , function(err,inserted){}
	) ;
    }) ;


}
