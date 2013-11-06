var fs = require('fs') ;
var libxmljs = require("libxmljs");

exports.onload = function(app){

    var dcoll = helper.db.coll("districts") ; //.find() ;

    this.step(function(){



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

			    if(file.attrname_pid){
				var parentFile = datafiles[fileidx-1] ;
				var pid = nodes[i].attr(file.attrname_pid).value() ;
				
				var parentId = parentFile.nodes[pid].value ;
			    }
			    else
				var parentId = null ;

			    process.stdin.write('.') ;
			    // console.log("title:",title,'parent',parentId,'value',file.nodes[id].value) ;
			    // insert into collection
			    dcoll.insert(
				{}
				, {}
				, function(){
				    
				}
			    ) ;
			    
			    count++ ;
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
