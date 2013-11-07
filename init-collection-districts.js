var fs = require('fs') ;
var libxmljs = require("libxmljs");

module.exports = function(){

    var dcoll = helper.db.coll("districts") ; //.find() ;

    // make db index
    this.step(function(){

        function callback(err){ err && console.log(err) ; }
        helper.db.ensureIndex(
	    'ocxformer/districts'
	    , {
		_id:1
		, value:1
	      }
	    , {background:true,unique:true}
	    , callback
	) ;
	helper.db.ensureIndex( 'ocxformer/districts', {parent:1} , {background:true}, callback ) ;


    }) ;


    this.step(function(){

	var datafiles = [
	    {
		filename: "Provinces.xml"
		, nodes: {}
		, what: 'provinces'
	    }
	    , {
		filename: "Cities.xml"
		, attrname_pid: 'PID'
		, nodes: {}
		, what: 'cities'
	    }
	    , {
		filename: "Districts.xml"
		, attrname_pid: 'CID'
		, nodes: {}
		, what: 'districts'
	    }
	] ;

	var districtId = 0 ;

	this.each(
	    datafiles
	    , function(fileidx,file) {
		fs.readFile(
		    __dirname+'/data/'+file.filename
		    , this.holdButThrowError(function(err,buff){
			var xmlDoc = libxmljs.parseXml(buff.toString()) ;
			var nodes = xmlDoc.root().childNodes() ;

			process.stdin.write('inserting '+file.what+':') ;
			var count = 0 ;

			for(var i=0;i<nodes.length;i++){
			    var attrId = nodes[i].attr("ID") ;
			    if(!attrId)
				continue ;
			    var id = attrId.value () ;
			    var title = nodes[i].text().trim() ;
			    file.nodes[ id ] = {
				title: title
				, value: ++districtId
			    }

			    if(file.attrname_pid) {
				var parentFile = datafiles[fileidx-1] ;
				var pid = nodes[i].attr(file.attrname_pid).value() ;
				
				var parent = parentFile.nodes[pid].title ;
			    }
			    else
				var parent = null ;

			    // insert into collection
			    dcoll.insert(
				{
				    name: title
				    , value: title
				    , _id: districtId
				    , parent: parent
				}
				, {$safe:true}
				, this.hold(function(err) {
				    if(!err){
					count++ ;
					process.stdin.write('.') ;
				    }
				})
			    ) ;
			    
			}

			this.step(function(){
			    console.log("(inserted "+count+' '+file.what+")\n") ;
			}) ;
			
		    })
		) ;
	    }
	) ;

	this.step(function(){
	    
	}) ;
    }) ;


}
