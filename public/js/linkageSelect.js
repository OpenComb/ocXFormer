jQuery(function($){

    $.fn.linkageSelect = function(){

	var linkageSel = this.data('_linkageSelect') ;
	if(linkageSel)
	    return linkageSel ;

	linkageSel = new _linkageSel(this) ;
	this.data('_linkageSelect',linkageSel) ;
	return linkageSel ;

    } ;

    function _linkageSel($sel) {
	this.$sel = $sel ;
	var that = this ;
	// 安装 parent select 的 change 事件
	var parentSelector = $sel.attr("linkto") ;
console.log(parentSelector,$(parentSelector)) ;
	if(parentSelector){
	    $(parentSelector).change(function(){
		var parentValue = $(this).val() ;
console.log(parentValue) ;
		if(parentValue===undefined || parentValue===null)
		    return ;
		that.load(parentValue) ;
	    }) ;
	}
    }

    _linkageSel.prototype.load = function(parentValue){
	if(parentValue) parentValue = null ;

	this.$sel.html("") ;
	
	var url = "/ocxformer/linkageSelectInterface.js?$render=false"
	    + "&collection=" + (this.$sel.attr("collection")||"")
	    + "&coltitle=" + (this.$sel.attr("coltitle")||"")
	    + "&colvalue=" + (this.$sel.attr("colvalue")||"")
	    + "&colparent=" + (this.$sel.attr("colparent")||"")
	    + "&parent=" + (parentValue||"") ;

	var that = this ;
	$.get(url,function(data){
	    if(!data || !data.model ||!data.model.options)
		return ;

	    for(var i=0;i<data.model.options.length;i++){
		var optmodel = data.model.options[i] ;
		var $opthtml = $('<option></option>') ;
		
		if(optmodel.value!==undefined)
		    $opthtml.attr('value',optmodel.value) ;
		$opthtml.html( optmodel.title||optmodel.value ) ;

		that.$sel.append($opthtml) ;
	    }

	    that.$sel[0].selectedIndex = -1 ;
	},'json') ;
    }
}) ;
