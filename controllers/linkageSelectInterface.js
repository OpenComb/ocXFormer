module.exports = {

    layout: null
    , process: function(seed,nut){

	nut.model.options = [] ;

	if( !seed.collection ) {
	    nut.model.error = "缺少参数 collection" ;
	    return ;
	}

	if( !seed.coltitle )
	    seed.coltitle = "title" ;
	if( !seed.colparent )
	    seed.colparent = "parent" ;
	if( !seed.colvalue )
	    seed.colvalue = "value" ;

	var condition = {} ;
	condition[seed.colparent] = seed.parent || null ; 

	var release = this.hold() ;
	helper.db.coll(seed.collection)
	    .find(condition)
	    .each(function(err,doc){
		
		if(err)
		    heloper.log.error(err) ;

		if(!doc)
		    release() ;
		else
		    nut.model.options.push({
			value: doc[seed.colvalue]
			, title: doc[seed.coltitle]
		    }) ;
	    }
	    
	) ;
    }

}
