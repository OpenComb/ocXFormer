module.exports = {

    layout: null
    , view: "ocxformer/templates/formEditor.html"
    , viewIn: function(){

        var $form = $("#main-editarea>form") ;
        var $dropPos = $('#main-editarea>.insert-pos') ;

	var tipbarHeight = $form.find('.tipbar').height() ;
	var tipbarMargin = ($form.find('.tipbar').outerHeight() - tipbarHeight)/2 ;

        $form.sortable({
            items: ".control-group"
            , forcePlaceholderSizeType: true
            , stop: function(event,ui){
		// 将控件放入表单中
                if( !ui.item.hasClass('control-group') && ui.item.size() ){
                    createControlFromLabel(ui.item[0]).insertBefore(ui.item) ;
                    ui.item[0].parentNode.removeChild(ui.item[0]) ;
                }
		// 从表单中移除控件
                else if ( !$form.hitTest(event.pageX,event.pageY) ){
                    ui.item[0].parentNode.removeChild(ui.item[0]) ;
                }

		// 是否显示提示
		displyEmptyForm() ;

		// 
		$form.find('.tipbar')
		    .animate(
			{
			    opacity: 'hide'
			    , height: 0
			    , 'padding-top': '0px'
			    , 'padding-bottom': '0px'
			}
			, 300
		    ) ;
            }
	    , over: function(){
		$form.find('.tipbar')
		    .animate(
			{
			    opacity: 'show'
			    , height: tipbarHeight
			    , 'padding-top': tipbarMargin
			    , 'padding-bottom': tipbarMargin
			}
			, 300
		    ) ;

	    }
        }) ;

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


        function createControlFromLabel(eleLabel){
            var controlname = $(eleLabel).attr("name") ;
            return initControl( $("#control-templates .control-group[name="+controlname+"]")
                                .clone() ) ;
        }
        function initControl(control){
	    // 随机id
	    var id = 'control_'+Math.ceil( (Math.random()*999999) ).toString(16) ;
	    $(control)
		.attr('id',id)
		.find("select,textarea,input[type=text]")
		.attr({
		    'v:label':'#'+id+' p.help-block'
		    , 'v:failedclass': 'text-error'
		}) ;

            return $(control).click(function(){
                openProps(this) ;
            }) ;
        }

        // 表单名称也作为一个可编辑的控件
        initControl( $(".theformname")[0] ) ;


	function displyEmptyForm (){
            if( !$form.find('.control-group').size() ){
                if( !$form.find('div.alert').size() ){
		    $('<div class="alert alert-info">'
		      + '<i class="icon-plus"></i> '
                      + '请从左侧菜单中拖拽输入控件到当前表单.'
                      + '</div>')
			.hide()
			.appendTo($form)
			.animate(
			    {
				opacity: 'show'
			    }
			    , 300
			) ;
		}
            }else{
                $form.find('div.alert')
		    .animate(
			{
			    opacity: 'hide'
			    , height: 0
			    , 'padding-top': 0
			    , 'padding-bottom': 0
			    , "margin-top": 0
			    , "margin-bottom": 0
			}
			, 300
			, function(){
			    $(this).remove() ;
			}
		    ) ;
            }
        }
        // first call
        displyEmptyForm() ;


        function openProps(control){

            // 清理状态
            $("[data-prop-name]").hide() ;
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

                var propCtrlSelector = propconf.prop_selector || "[data-prop-name="+ props[i] +']' ;
                var $propControl = $(propCtrlSelector) ;
                $propControl
                    .data('forcontrol',control)
                    .data('propconf',propconf)
                    .show() ;

                var value = propconf.data_accessor.call($propControl[0],control) ;
                propconf.prop_accessor.call( $propControl[0], value, propconf ) ;
            }
        }

        function applyToControl(propControl){
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



        // ---------------------------------------
        // 控件的属性定义 /////////////

        /**
         * 当点击 form editor 中的控件时， 依次调用各项属性的 data_accessor() ，从控件中取得属性值，然后调用 prop_accessor(value) 将值设置到属性面板
         * 当编辑属性面板时，调用对应属性的 prop_accessor() 取得新的属性值，再调用该属性所定义的 data_accessor()，设置给 form editor 的控件
         *  data_accessor() / prop_accessor() 既是 setter 也是 getter
         *
         * data_accessor: Function(control,value)
         *   对form editor中的控件，设置(setter)或返回(getter) 一项属性值
         *
         * prop_accessor: function(value,propconf){}
         *   设置(setter)或返回(getter) 一项属性值
         */
        var ControlProps = {
            name: {
                data_accessor: makeDataAccessor('.controls input[type=text],select','name')
                , prop_accessor: inputAccessor
            }
            , title: {
                data_accessor: makeDataAccessor('.control-label','@text')
                , prop_accessor: inputAccessor
            }
	    , titlestyle: makeClassPropconf('.control-label','titlestyle') 
	    , controlstyle: makeClassPropconf('','controlstyle') 
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
            , inputsize: makeClassPropconf('input[type=text],select','inputsize') 
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
            // 表单标题
            , theformname: {
                data_accessor: makeDataAccessor('legend','@text')
                , prop_accessor: inputAccessor
            }
            , validation: {
                data_accessor: function(control,value){
                    var $mainInput = $(control).find('select,textarea,input[type=text],input[name=checkbox],input[name=radio]').first() ;
                    var rules = validationRuls( $mainInput[0] ) ;

                    // getter
                    if(value===undefined){
                        value = [] ;
                        for(var i=0;i<rules.length;i++){
                            var rule = { name : rules[i].replace(/^v:/i,'') } ;
                            var v = $mainInput.attr(rules[i]) ;
                            if( v!=rules[i] )
                                rule.value = v ;
                            value.push(rule) ;
                        }
                        return value ;
                    }
                    // setter
                    else {
                        // clear rules
                        for(var i=0;i<rules.length;i++)
                            $mainInput.removeAttr(rules[i]) ;

                        for(var i=0;i<value.length;i++) {
                            $mainInput.attr(
                                'v:'+value[i].name
                                , value[i].value===undefined ?
                                    ('v:'+value[i].name) :
                                    value[i].value
                            ) ;
                        }
                    }
                }
                , prop_accessor: function(value,propconf){
                    // getter
                    if(value===undefined){
                        var value = [] ;
                        $(this).find('ul.validator-rules li').each(function(){
                            var vtype = $(this).attr('vtype') ;
                            if(!vtype)
                                return ;
                            var rule = {name:vtype} ;
                            var $input = $(this).find('input[name=setting]') ;
                            if( $input.size() )
                                rule.value = $input.val() ;
                            value.push(rule) ;
                        }) ;
                        return value ;
                    }
                    // setter
                    else{
                        // 清理原有设定
                        $('.validator-rules').html('') ;

                        for(var i=0;i<value.length;i++){
                            var selector = 'select[name=vtype] option[value='+value[i].name+']' ;
                            var option = $(selector) [0] ;
                            if(option)
                                createRuleInputByOption(option) ;
                        }
                    }
                }
            }
	    , validationmessage: {
                data_accessor: makeDataAccessor('input[type=text]select,textarea,input[type=text],input[name=checkbox],input[name=radio]','v:message')
                , prop_accessor: inputAccessor
	    }
        } ;
        for(var name in ControlProps)
            ControlProps[name].name = name ;
        function makeDataAccessor(selector,attr){
            return function(control,value) {
		var element = selector? $(control).find(selector): $(control) ;
                // getter
                if(value===undefined){
                    if(attr=='@text')
                        return element.text() ;
                    else if(attr=='value')
                        return element.val() ;
                    else
                        return element.attr(attr) || '' ;
                }

                // setter
                else {
                    if(attr=='@text')
                        element.text(value) ;
                    else if(attr=='value')
			element.val(value) ;
                    else
                        element.attr( attr, value ) ;
                }
            } ;
        } ;

        function inputAccessor(value){
            // getter
            if(value===undefined)
                return $(this).find('input.input-large').val() ;
            // setter
            else
                $(this).find('input.input-large').val( value ) ;
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
	function makeClassPropconf (elementSelector,propname){
	    return {
                data_accessor: function(control,className) {
                    var $element = elementSelector? $(control).find(elementSelector) : $(control) ;
                    var $alloptions = $('[data-prop-name='+propname+'] select option') ;

                    // gettter
                    if( className===undefined )
                    {
                        var value = "" ;
                        $alloptions.each(function(){
                            if( $element.hasClass($(this).val()) ){
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
                        $alloptions.each(function(){
                            $element.removeClass( $(this).val() ) ;
                        }) ;
                        // 设置新class
                        $element.addClass(className) ;
                    }
                }
                , prop_accessor: selectAccessor
            }
	}

        // 初始化 prop input change event
        $('[data-prop-name]').each(function(){

            var propControl = this ;

            function onchangeProp(){
                applyToControl(propControl) ;
            }
            $(this).find('input,textarea')
                .keyup(onchangeProp) ;
            $(this).find('select')
                .change(onchangeProp) ;
        }) ;

        // 将表单导出为一个json
        if(!jQuery.fn.ocxformerExport) {
            jQuery.fn.ocxformerExport = function(){

		var $tmpform = $(this).clone() ;

		// 清理内容
		$tmpform.find('.tipbar,.alert,.ocvalidation-message').remove() ;

		// 清理样式
		for(var classname in {
		    // 测试 输入检查时 留下的状态
		    "ocvalidation-success": 1
		    , "ocvalidation-failed": 1
		})
		    $tmpform.find('.'+classname).removeClass(classname) ;

                var json = {
                    title: $(this).find('.theformname legend').text()
                    , controls: []
                    , html: $tmpform.html()
                } ;
                $(this).find('.control-group').each(function(){
                    var type = $(this).attr('name') ;
                    var jsoncontrol = {
                        type: type
                        , props: {}
                    } ;

                    var props = $('.control-item[name='+type+']').attr('data-control-props').split(',') ;
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
		// 清除表单
		$(this).find('.control-group,.theformname').remove() ;

		// 恢复表单
                $(this).append(json.html) ;

                $(this).find('.control-group').each(function(){
                    initControl(this) ;
                }) ;

                // 表单名称也作为一个可编辑的控件
                initControl( $(".theformname")[0] ) ;

		// 
		displyEmptyForm() ;
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

        // ------------------------------------------------
        //   数据校验
        var propValidation = $('[data-prop-name=validation]')[0] ;
        $('select[name=vtype]').change(function(){

            var option = this.options[this.selectedIndex] ;

            createRuleInputByOption(option) ;

            // 恢复 select
            this.selectedIndex = 0 ;

            //
            applyToControl(propValidation) ;
        }) ;
        function validationRuls (input) {
            var rules = [] ;
            for(var i=0;i<input.attributes.length;i++){
                if( input.attributes[i].name.match(/^v:.+/) 
		    && input.attributes[i].name!='v:label'
		    && input.attributes[i].name!='v:failedclass'
		  )
                    rules.push(input.attributes[i].name) ;
            }
            return rules ;
        }
        function createRuleInputByOption(option){

            var $li = $("<li></span>"
                        + $(option).text()
                        + "</span>"
                        + "<span style='float:right' width='30px'> <a class='icon-pencil' href='javascript:void'></a> <a class='icon-minus-sign' href='javascript:void'></a> </span></li>")
                    .appendTo($('ul.validator-rules'))
                    .attr('vtype',option.value) ;

            $li.find('.icon-minus-sign').click(function(){
                $(this).parents('li').first().animate(
                    {
                        "margin-left": $li.width()
                        , height: 0
                        , opacity: 0
                    }
                    , 200
                    ,function(){
                        $(this).remove() ;
                        applyToControl(propValidation) ;
                    }
                ) ;
            }) ;

            var defaultSetting = $(option).attr('defaultSetting') ;
            if( defaultSetting!==undefined ){
                $li.find('.icon-pencil').click(function(){
                }) ;

                $("<div style='clear:both;text-align:right;'><input type=text class='input-large' name='setting' value=\""+defaultSetting+"\" style='margin-bottom:0px'></div>")
                    .appendTo($li)
                    .find('input')
                    .keyup(function(){
                        applyToControl(propValidation) ;
                    }) ;
            }
            else{
                $li.find('.icon-pencil').hide() ;
            }
        }

        $('.test-validation-rules').click(function(){
            $('.ocxformeditor .control-group')
                .find('input,select,textarea')
		.validate(false) ;
        }) ;


        // --------------------------------------------
        $(document).trigger("ocxformer.ready") ;
    }
} ;

