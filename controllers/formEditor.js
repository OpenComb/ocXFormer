module.exports = {

    layout: null
    , view: "ocxformer/templates/formEditor.html"
    , viewIn: function(){


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
            return initControl( $("#control-templates .control-group[name="+controlname+"]")
                                .clone() ) ;
        }
        function initControl(control){
            return $(control).click(function(){
                openProps(this) ;
            }) ;
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

        // 表单名称也作为一个可编辑的控件
        initControl( $(".theformname")[0] ) ;

        function openProps(control){

            // 清理状态
            $(".control-props .control-group").hide() ;
            $(".control-active").removeClass('control-active') ;

            // 设置状态
            $(control).addClass('control-active') ;

            // 取 control 对应的属性定义
            var controlname = $(control).attr('name') ;
            var props = $('.control-item[name='+controlname+']').attr('data-control-props').split(',') ;

            //
            for(var i=0;i<props.length;i++){
                var propconf = ControlProps[props[i]] ;
                if(!ControlProps[props[i]]) {
                    console.log("unknow control name:",props[i]) ;
                    continue ;
                }

                var $propControl = $(propconf.prop_selector || ".control-props [data-prop-name="+ props[i] +']') ;
                $propControl
                    .data('forcontrol',control)
                    .data('propconf',propconf)
                    .show() ;

                var value = propconf.data_accessor.call($propControl[0],control) ;
                propconf.prop_accessor.call( $propControl[0], value, propconf ) ;
            }
        }

        // 控件的属性定义 /////////////
        // update
        var ControlProps = {
            title: {
                data_accessor: makeDataAccessor('.control-label','@text')
                , prop_accessor: inputAccessor
            }
            , name: {
                data_accessor: makeDataAccessor('.controls input[type=text],select','name')
                , prop_accessor: inputAccessor
            }
            , textvalue: {
                data_accessor: makeDataAccessor('.controls input[type=text]','value')
                , prop_accessor: inputAccessor
            }
            , placeholder: {
                data_accessor: makeDataAccessor('.controls input[type=text]','placeholder')
                , prop_accessor: inputAccessor
            }
            , help: {
                data_accessor: makeDataAccessor('.help-block','@text')
                , prop_accessor: inputAccessor
            }
            , inputsize: {
                data_accessor: function(control,className) {
                    var $input = $(control).find('input[type=text],select') ;
                    var $allsize = $('.control-props select[name=inputsize] option')
                    // gettter
                    if( className===undefined )
                    {
                        var value = null ;
                        $allsize.each(function(){
                            if( $input.hasClass($(this).val()) ){
                                value = $(this).val() ;
                                return false ;
                            }
                        }) ;
                        return value ;
                    }
                    // setter
                    else
                    {
                        // 清理 class
                        $allsize.each(function(){
                            $input.removeClass( $(this).val() ) ;
                        }) ;
                        // 设置新class
                        $input.addClass(className) ;
                    }
                }
                , prop_accessor: selectAccessor
            }
            , multipleradios: {
                data_accessor: makeDataAccessorMultiInput('radio')
                , prop_accessor: multpleItemAccessor
                , prop_selector: '.control-props [data-prop-name=multipleitems]'
            }
            , multiplecheckboxes: {
                data_accessor: makeDataAccessorMultiInput('checkbox')
                , prop_accessor: multpleItemAccessor
                , prop_selector: '.control-props [data-prop-name=multipleitems]'
            }
            , selectoptions: {
                data_accessor: dataAccessorOptions
                , prop_accessor: multpleItemAccessor
                , prop_selector: '.control-props [data-prop-name=multipleitems]'
            }
            , theformname: {
                data_accessor: makeDataAccessor('legend','@text')
                , prop_accessor: inputAccessor
            }
        } ;
        for(var name in ControlProps)
            ControlProps[name].name = name ;
        function makeDataAccessor(selector,attr){
            return function(control,value) {
                // getter
                if(value===undefined){
                    if(attr=='@text')
                        return $(control).find(selector).text() ;
                    else if(attr=='value')
                        return $(control).find(selector).val() ;
                    else
                        return $(control).find(selector).attr(attr) || '' ;
                }

                // setter
                else {
                    if(attr=='@text')
                        $(control).find(selector).text(value) ;
                    else if(attr=='value')
                        $(control).find(selector).val(value) ;
                    else
                        $(control).find(selector).attr( attr, value ) ;
                }
            } ;
        } ;

        function inputAccessor(value){
            // getter
            if(value===undefined)
                return $(this).find('input.input').val() ;
            // setter
            else
                $(this).find('input.input').val( value ) ;
        }

        function selectAccessor(value){
            // getter
            if(value===undefined){
                var select = $(this).find("select")[0] ;
                var option = select.options[select.selectedIndex] ;
                return $(option).val() || $(option).text() ;
            }
            // setter
            else {
                if(value===null)
                    $(this).find("select")[0].selected = -1 ;
                else
                    $("select option[value="+value+"]").attr('selected','selected') ;
            }
        }
        /**
         * value = [ {value:'xxx', text:'ooo', active:true} ] ;
         */
        function multpleItemAccessor(value) {
            // getter
            if(value===undefined){
                var text = $(this).find('textarea').val() ;
                var lines = text.split("\n") ;
                for(var i=lines.length-1;i>=0;i--) {
                    lines[i] = lines[i].trim() ;
                    if(!lines[i])
                        lines.splice(i,1) ;
                    else
                        lines[i] = {
                            value: lines[i]
                            , text: lines[i]
                        } ;
                }
                return lines ;
            }
            // setter
            else {
                var text = '' ;
                for(var i=0;i<value.length;i++){
                    text+= value[i].text+"\r\n"
                }
                $(this).find('textarea').val(text) ;
            }
        }

        function makeDataAccessorMultiInput(type){
            return function (control,items) {
                // getter
                if(items===undefined) {
                    items = [] ;
                    $(control).find('label.'+type).each(function(){
                        var text = $(this).text().trim() ;
                        var $input = $(this).find('input[type='+type+']') ;
                        items.push({
                            value: $input.val() || text
                            , text: text
                        }) ;
                    }) ;
                    return items ;
                }
                // setter
                else{
                    // 清理原有内容
                    var controls = $(control).find("div.controls").html('') ;
                    // 设置选项
                    for(var i=0;i<items.length;i++){
                        controls.append("<label class="+type+"> <input name='radio' type='"+type+"' value\""+items[i].value.replace('\\','\\\\').replace('"','\\"')+"\"> "+items[i].text+" </label>") ;
                    }
                }
            }
        }

        function dataAccessorOptions(control,items){
            // getter
            if(items===undefined) {
                items = [] ;
                $(control).find('select option').each(function(){
                    var text = $(this).text().trim() ;
                    items.push({
                        value: $(this).val() || text
                        , text: text
                    }) ;
                }) ;
                return items ;
            }
            // setter
            else{
                // 清理原有内容
                var options = $(control).find("select").html('') ;
                // 设置选项
                for(var i=0;i<items.length;i++){
                    options.append("<option value\""+items[i].value.replace('\\','\\\\').replace('"','\\"')+"\"> "+items[i].text+" </option>") ;
                }
            }
        }

        // 初始化 prop input change event
        $('.control-props [data-prop-name]').each(function(){

            var propControl = this ;

            function onchangeProp(){
                var activecontrol = $(propControl).data('forcontrol') ;
                var propconf = $(propControl).data('propconf') ;

                if(activecontrol && propconf) {
                    if( propconf.prop_accessor ) {
                        // get prop value
                        var value = propconf.prop_accessor.call(propControl,undefined,propconf) ;
                        // set to control
                        propconf.data_accessor.call(propControl,activecontrol,value) ;
                    }else{
                        console.log('unknow prop has changed') ;
                    }
                }
            }
            $(this).find('input,textarea')
                .keyup(onchangeProp) ;
            $(this).find('select')
                .change(onchangeProp) ;
        }) ;

        // 将表单导出为一个json
        if(!jQuery.fn.ocxformerExport) {
            jQuery.fn.ocxformerExport = function(){
                var json = {
                    title: $(this).find('.theformname legend').text()
                    , controls: []
                    , html: $(this).html()
                } ;
                $(this).find('.control-group').each(function(){
                    var type = $(this).attr('name') ;
                    var jsoncontrol = {
                        type: type
                        , props: {}
                    } ;

                    var props = $('.control-item[name='+type+']').attr('data-control-props').split(',') ;
                    console.log(props) ;
                    for(var i=0;i<props.length;i++){
                        var propname = props[i] ;
                        var propconf = ControlProps[ propname ] ;
                        if( !propconf )
                            continue ;
                        jsoncontrol.props[propname] = propconf.data_accessor(this) ;
                    }
                    json.controls.push( jsoncontrol ) ;
                }) ;
                return json ;
            } ;
        }

        // 根据 ocxformerExport 导出的json恢复表单
        if(!jQuery.fn.ocxformerRestore) {
            jQuery.fn.ocxformerRestore = function(json){
                $(this).html(json.html) ;
                $(this).find('.control-group').each(function(){
                    console.log(this) ;
                    initControl(this) ;
                }) ;

                // 表单名称也作为一个可编辑的控件
                initControl( $(".theformname")[0] ) ;
            } ;
        }

        if(!jQuery.fn.hitTest) {
            jQuery.fn.hitTest = function(x, y){
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

        $(document).trigger("ocxformer.ready")
    }
} ;

