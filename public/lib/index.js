if(!$.fn.hitTest) {
    $.fn.hitTest = function(x, y){
        var bounds = this.offset();
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();
        if(x >= bounds.left){
            if(x <= bounds.right){
                if(y >= bounds.top){
                    if(y <= bounds.bottom){
                        return {
                            left: x - bounds.left
                            , top: y - bounds.top
                        };
                    }
                }
            }
        }
        return false;
    } ;
}


$(function(){

    var $form = $("#main-editarea>form") ;
    var $dropPos = $('#main-editarea>.insert-pos') ;

    $form.sortable({
        items: ".control-group"
        , forcePlaceholderSizeType: true
        , stop: function(event,ui){
            if( !ui.item.hasClass('control-group') && ui.item.size() ){
                createControlFromLabel(ui.item[0]).insertBefore(ui.item) ;
                ui.item[0].parentNode.removeChild(ui.item[0]) ;
            }
            else if ( !$form.hitTest(event.pageX,event.pageY) ){
                ui.item[0].parentNode.removeChild(ui.item[0]) ;
            }
        }
    }) ;

    function createControlFromLabel(eleLabel){
        var controlname = $(eleLabel).attr("name") ;
        return $("#control-templates .control-group[name="+controlname+"]").clone() ;
    }

    $(".control-item")
        .draggable({
            stop: function(event,ui){
                $dropPos.insertAfter($form).hide() ;
            }
            , helper: function(){
                return createControlFromLabel(this) ;
            }
            , connectToSortable: "#main-editarea>form"
        }) ;
    
return ;

    
    function controlDragging(event,ui){
        var offset = $form.hitTest(event.pageX,event.pageY) ;
        if(!offset)
        {
            $form.after($dropPos.hide()) ;
            return ;
        }

        // 插入到末尾
        $form.append($dropPos.show()) ;

        // 或者插入到某个空间之前、之后
        $form.find('.control-group').each(function(){
            var controlOffset = $(this).hitTest(event.pageX,event.pageY) ;
            if(controlOffset){
                if( controlOffset.top > $(this).outerHeight()/2 )
                    $(this).after($dropPos) ;
                else
                    $(this).before($dropPos) ;
            }
        }) ;
    } ;
    
    $form.droppable({

        hoverClass: "hoverclass"
        , drop: function( event, ui ) {

            console.log('drop on form') ;

            if( ui.draggable.hasClass("control-group") ){
                var putinEle = ui.draggable.data("remove out",false) ;
            }
            else
            {
                var putinEle = ui.helper.clone()
                        .css({
                            position: 'static'
                        })
                        .removeAttr("name")
                        /*.draggable({
                            stop: function(event,ui){

                                $dropPos.insertAfter($form).hide() ;

                                // remove control
                                if( $(this).show().data('remove out') ){
                                    console.log("remove it") ;
                                    this.parentNode.removeChild(this) ;
                                }
                            }
                            , drag: function() {
                                controlDragging.apply(this,arguments) ;
                            }
                            , start: function(event,ui){
                                $(this).data('remove out',true).hide() ;
                                
                                //console.log(ui)
                                //$(document.body).append(this) ;
                                //$(ui.helper).css("position","fixed") ;
                                //this.parentNode.removeChild(this) ;
                            }
                            , helper: "clone"
                        }) ;*/
            }

            putinEle
                .css({
                    "top":""
                    , "left":""
                }) ;

            if( $form.find('.insert-pos').size() )
                $dropPos.after(putinEle) ;
            else
                $form.append(putinEle) ;
        }

    }) ;
})
