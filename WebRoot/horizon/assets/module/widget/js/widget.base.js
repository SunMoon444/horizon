/**
 *
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonJqueryui', 'elementsSpinner', 'jqueryValidateAll', 'jqueryForm','ace','gritter'], factory);
    }
    else {
        factory(jQuery);
    }
})(function($) {
    var $addWidget = $('#add-widget');//增加组件
    var $widgetGroupContainer = $('#widget-group-container');//存放组件
    var $addLayout = $('#add-layout');//增加布局区域
    var $baseArea = $('#default-area-info').children('.area');//区域
    var $baseLayeroutArea = $('#default-area-info').children('.layerout-area');//布局对应的区域块
    var $dialog=$('#dialog');//用于提示框
    var heights = {
     	outer: function() {
	        var _height = horizon.tools.getPageContentHeight();
	        return _height;
     	},
     	tabContent:function() {
     		return heights.outer()-250;
     	}
 	};
    return horizon.widgetapp = {
    		//组件URL模块树初始化
    		setting: {
                async: {
                	url:horizon.paths.apppath+'/horizon/manager/menu/module/tree.wf',
                    enable: true,
                    dataType: "json",
                    type:"post",
                    otherParam:{urlType:"view"}
                },
                data : {
                    simpleData : {
                        enable : true,
                        pIdKey : "pid"
                    }
                },
                view: {
                    dblClickExpand: false,
                    showIcon: false
                },
                callback: {
                    onClick: function(event, treeId, treeNode, clickFlag) {
                    	var tree = $.fn.zTree.getZTreeObj("page-tree");
    					var node = tree.getNodeByParam("id", treeNode.id);
    					tree.selectNode(node, false);// 指定选中ID的节点
    					if (treeNode.open) {
    						tree.expandNode(node, false, false);// 指定选中ID节点折叠
    					} else {
    						tree.expandNode(node, true, false);// 指定选中ID节点展开
    					}
                    	if(treeNode.parentTId!=null){
	                    	$("#widgetForm").find('input[name="link"]').val(treeNode.name);
	                    	$("#widgetForm").find('input[name="url"]').val(treeNode.id);
	                    	$("#widgetForm").find('input[name="url"]').dropdown('toggle');
                    	}
                    }
                }
            },
            moduleTreeInit: function() {
                var $orgTree = $('#page-tree');
                $orgTree = $.fn.zTree.init($orgTree, horizon.widgetapp.setting);
            },
            onClickDom:	function () {
                var $content = $(".select-tree");
                if($content.data('ace_scroll')) {
                    $content.ace_scroll('update', {'size': 200})
                        .ace_scroll('enable')
                        .ace_scroll('reset');
                }else {
                    $content.on('click', function(e) {
                        e.stopPropagation();
                    }).ace_scroll({
                        size: 200,
                        reset: true,
                        mouseWheelLock: true,
                        observeContent: true
                    });
                }
			},
			//点击选择视图事件
			/**
    		selectUrl:function(){
    			$('input[name="url"]').unbind(horizon.tools.clickEvent()).bind(horizon.tools.clickEvent(),function(){
    				horizon.widgetapp.moduleTreeInit();
  				  $('input[name="url"]').val("");
  				 $('input[name="link"]').val("");
  			  });
    		},
    		*/
    		//组件列表滚动条
	        setScroll :function(){
		    	$(".componentList").height(heights.tabContent()).ace_scroll({
		            size: heights.tabContent()
		        });
	        },
	      //选择模块事件
			linkTarget:function(){
				var url = $('#widgetForm').find('input[name="url"]');
				var link = $('#widgetForm').find('input[name="link"]');
				$('#widgetForm').find('input[name="urlType"]').change(function(){
					var $urlType = $('input[name="urlType"]:checked').val();
					link.val("");
					url.val("");
					if($urlType!="url"){
						url.addClass("hidden");
						link.unbind(horizon.tools.clickEvent());
						link.attr("readonly","readonly").removeClass("hidden");
						link.bind(horizon.tools.clickEvent(),function(){
							horizon.widgetapp.moduleTreeInit();
						});
			  		}else{
						link.addClass("hidden");
						url.removeClass("hidden");
			  			url.unbind(horizon.tools.clickEvent());
					}
				});
			},
        	 //保存组件
	        saveWidget:function(){
	        	
	        	return $("#widgetForm").validate({
                    rules: {
                        code: {
                            digits: true,
                            remote: {
                                url: horizon.paths.apppath + '/horizon/manager/widget/getWethersByCode.wf',
                                cache: false,
                                data: {
                                    deptCode: function() {
                                        return $('#widgetForm').find('input[name="code"]').val();
                                    },
                                    id: function() {
                                        return $('#widgetForm').find('input[name="id"]').val();
                                    }
                                }
                            }
                        },
                        height: {
                            digits: true
                        }
                    },
                    messages: {
                        code: {
                            digits: parent.horizon.lang["platform-widget"]["codeIsDigits"],
                            remote: parent.horizon.lang["platform-widget"]["codeExistsError"]
                        },
                        height:{
                            digits: parent.horizon.lang["platform-widget"]["heightIsDigits"]
                        }
                    },
                    errorClass: 'help-block no-margin-bottom',
                    focusInvalid: false,
                    highlight: function (e) {
                        $(e).closest('.form-group').addClass('has-error');
                    },
                    success: function (e) {
                        $(e).closest('.form-group').removeClass('has-error');
                        $(e).remove();
                    },
                    submitHandler: function(form) {
                        $(form).ajaxSubmit({
                            url: horizon.paths.apppath + '/horizon/manager/widget/saveWidget.wf',
                            dataType: 'json',
                            type: 'post',
                            cache: false,
                            error: function() {
                            	parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
                            },
                            success: function(data) {
                                if(data.result){
                                	var groupId = data.widget.groupId;
                            		horizon.widgetapp.formSavaSuccess(data.widget,groupId);
                            		$('#widgetForm').find('input[name="id"]').val(data.widget.id);
                                } else {
                                	parent.horizon.notice.error(parent.horizon.lang["message"]["saveFail"]);
                                }
                            }
                        });
                    }
                });
            },
            //from表单成功后
            formSavaSuccess:function(data,groupId) {
            	$('#btnIconF').children('i').attr('class', 'empty');
                $('#btnIconG').children('i').attr('class', 'empty');
                var option = $.extend({
                    dialogText: parent.horizon.lang["message"]["saveSuccess"],
                    dialogTextType: 'alert-info',
                    close: function() {
                        var flag=true;
                        $('#widget-group').children().each(function(i){
                            var $this=$(this);
                            var id=$this.children('a').attr('id');
                            if(id==groupId){
                                flag=false;
                            }
                        });
                        $('#' + groupId).parent().addClass('active').siblings('li').removeClass('active');
                        horizon.widgetapp.getWidgetsByGroupId(groupId);
                        $('.main-widget-infobox').next('.space-12').removeClass('hidden');
                    }
                }, horizon.widgetapp.defaultDialogOption);
                $dialog.removeClass('hidden').dialog(option);
            },
            //初始化区域数量文本框
        initLayoutCount: function() {
            $('#layoutCount').ace_spinner({
                min: 1,
                max: 100,
                step:1,
                value:1,
                on_sides: true,
                icon_up: 'ace-icon fa fa-plus smaller-75',
                icon_down:'ace-icon fa fa-minus smaller-75',
                btn_up_class:'btn-success' ,
                btn_down_class:'btn-danger'
            }).closest('.ace-spinner').on('changed.fu.spinbox', function() {
                horizon.widgetapp.changeLayoutCount();
            });
        },
        //提示框
        defaultDialogOption: {
            width: 380,
            title: parent.horizon.lang["message"]["title"],
            closeText: parent.horizon.lang["base"]["close"]
        },
        setProtocolBox: function(option) {
            var $box = $protocolGroup.children('.infobox:first').clone();
            $box.find('.infobox-icon').html('<i class="ace-icon ' + option.icon + '"></i>');
            $box.find('.infobox-data-title').html(option.name);
            $box.find('.infobox-content').html(option.des);
            $protocolGroup.append($box);
        },
        //初始化布局
        initLayoutNumber: function($layoutNumbers) {
            $layoutNumbers.ace_spinner({
                min: 1,
                max: 12,
                step:1,
                on_sides: true,
                icon_up: 'ace-icon fa fa-plus smaller-75',
                icon_down:'ace-icon fa fa-minus smaller-75',
                btn_up_class:'btn-success' ,
                btn_down_class:'btn-danger'
            }).closest('.ace-spinner').on('changed.fu.spinbox', function() {
                var $layoutNumber = $(arguments[0].target).find('.layoutNumber');
                var dataArea = $layoutNumber.attr('data-area');
                var _className = 'layerout-area ';
                $('input[data-area="' + dataArea + '"]').each(function() {
                    var $this = $(this);
                    dataCol = $this.attr('data-col');
                    _className += ' col-' + dataCol + '-' + $this.val();
                });
                $('#layerout-area-' + dataArea)[0].className = _className;
            });
        },
        //给布局区域赋值
        setLayoutArea: function(layoutAreas) {
        	$('#area-container').val('');
            $.each(layoutAreas, function(i, area) {
                var $baseAreaClone = $baseArea.clone();
                var $baseLayeroutAreaClone = $baseLayeroutArea.clone();
                $baseAreaClone.children('.area-name').html(parent.horizon.lang["platform-widget"]["area"] + (i+1));
                $baseAreaClone.children('.area-content').find('input.layoutNumber').val(12);
                var areaClass = '';
                $baseAreaClone.children('.area-content').find('input.layoutNumber').each(function() {
                    var $this = $(this);
                    var dataCol = $this.attr('data-col');
                    $this.val(area[dataCol]).attr({
                        'data-area': (i+1),
                        name: dataCol + '-' + (i+1)
                    });
                    areaClass += ' col-' + dataCol + '-' + area[dataCol] + ' ';
                });
                $baseLayeroutAreaClone.children('div').html(parent.horizon.lang["platform-widget"]["area"] + (i+1));
                $baseLayeroutAreaClone.attr('id', 'layerout-area-'+(i+1));
                $baseLayeroutAreaClone.addClass(areaClass);
                $('#area-container').append($baseAreaClone);
                $('#layerout-container').append($baseLayeroutAreaClone);
            });
            horizon.widgetapp.initLayoutNumber($('#area-container > .area > .area-content').find('input.layoutNumber'));
        },
        changeLayoutCount: function() {
            var num = $('#layoutCount').val();
            for(var i = 0; i < num; i++ ) {
                if($('#layerout-area-' + (i+1)).length == 0) {
                    var $baseAreaClone = $baseArea.clone();
                    var $baseLayeroutAreaClone = $baseLayeroutArea.clone();
                    $baseAreaClone.children('.area-name').html(parent.horizon.lang["platform-widget"]["area"] + (i+1));
                    $baseAreaClone.children('.area-content').find('input.layoutNumber').attr('data-area', (i+1));
                    $baseAreaClone.children('.area-content').find('input.layoutNumber').val(12);
                    var $layoutNumber= $baseAreaClone.children('.area-content').find('input.layoutNumber');
                    $layoutNumber.each(function() {
                        var col = $(this).attr('data-col');
                        $(this).attr('name',col+'-'+(i+1));
                    });
                    $baseLayeroutAreaClone.children('div').html(parent.horizon.lang["platform-widget"]["area"] + (i+1));
                    $baseLayeroutAreaClone.attr('id', 'layerout-area-'+(i+1));
                    $('#area-container').append($baseAreaClone);
                    $('#layerout-container').append($baseLayeroutAreaClone);
                    horizon.widgetapp.initLayoutNumber($baseAreaClone.children('.area-content').find('input.layoutNumber'));
                }
            }
            var $areas = $('#area-container').children('.area');
            var $layeroutAreas = $('#layerout-container').children('.layerout-area');
            for(var i = $layeroutAreas.length; i > num; i--) {
                $($areas.get(i-1)).remove();
                $($layeroutAreas.get(i-1)).remove();
            }
        },
        //获取组件分组
        getWidgetGroups: function() {
        	var $addWidget = $('#add-widget');//增加组件
        	var $groupId = $('#widgetForm').find('select[name="groupId"]');
        	$groupId.children().filter(':gt(0)').remove();
            $.ajax({
                url: horizon.paths.apppath+'/horizon/manager/widget/getGroups.wf',
                cache: false,
                dataType: 'json',
                method:'post',
                success: function(data) {
                    if(data && data.length > 0) {
                        $.each(data, function(i, option) {
                        	var $option = $('<option value="' + option.id + '">' + option.dictName + '</option>');
                        	$groupId.append($option);
                            var $newOption = $('<li><a href="#nogo" tabindex="-1" class="widget-group-option" id="' + option.id + '">' + option.dictName + '</a></li>');
                            if( i == data.length-1 ) {
                                $newOption.addClass("active");
                                $("select[name='groupId']").find($("option")).last().attr('selected',true);
                            }
                            $('.dropdown-toggle-widget').parent().before($newOption);
                            var $dropdown=$('<li><a href="#nogo" tabindex="-1" class="widget-group-option" id="' + option.id + '">' + option.dictName + '</a></li>');
                            $('#dropdown-widget-group').append($dropdown);
                        });
                        $('.widget-group-option').click(function() {
                        	horizon.widgetapp.clearAuthMethod();
                        	$('#widgetForm').find('input[name="id"]').val('');
                            var $this= $(this);
                            $.each(data, function(i, option) {
                       		 	if($this.attr("id")==option.id){
                       		 		$("select[name='groupId']").find($("option[value="+option.id+"]")).attr('selected',true);
                       		 		$("select[name='groupId']").children().not($("option[value="+option.id+"]")).attr('selected',false);
                       		 	}
                       	 	});
                            $('#widget-info').find('h4').html('<i class="ace-icon fa  fa-list green"></i>'+parent.horizon.lang["platform-widget"]["info"]);
                            horizon.widgetapp.clickWidgetGroupOption($this);
                            return false;
                        });
                        var groupId=$addWidget.parent().siblings('.active').children('.widget-group-option').attr('id');
                        horizon.widgetapp.getWidgetsByGroupId(groupId);
                    }else {
                        $addWidget.parent().addClass('active');
                    }
                    $('.dropdown-toggle-widget').click(function() {
                        var $this=$(this);
                        $this.parent().addClass('active').siblings('li').removeClass('active');
                        $this.next('ul').children('li').removeClass('active');
                    });
                    $addWidget.click(function() {
                        var $this= $(this);
                        $this.parent().addClass('active').siblings('li').removeClass('active');
                        $("#widgetForm")[0].reset();
                        $("#widgetForm").find("input[type='hidden']").val('');
                        horizon.widgetapp.clearAuthMethod();
    				    //清除验证信息
    				     $('label[id*="-error"]').remove();
    				     $("#widgetForm").find('input[name="code"]').parent().addClass('has-error');
    				     $("#widgetForm").find('input[name="groupId"]').parent().addClass('has-error');
    				     $("#widgetForm").find('input[name="name"]').parent().addClass('has-error');
    				     $("#widgetForm").find('input[name="height"]').parent().addClass('has-error');
    				     $("#widgetForm").find('input[name="icon"]').parent().addClass('has-error');
    				     $("#widgetForm").find('input[name="url"]').parent().addClass('has-error');
                         $('#btnIconF').children('i').attr('class', 'empty');
                         $('#btnIconG').children('i').attr('class', 'empty');
                         $('#widget-info').find('h4').html('<i class="ace-icon fa fa-cog green"></i>'+parent.horizon.lang["platform-widget"]["addWidget"]);
                         //$('#widget-group-container').empty();
                         return false;
                    });
                }
            });
        },
        clearAuthMethod:function(){
        	//清楚权限公开
            $('#deptAndUser').addClass('hidden');
            $('#role').addClass('hidden');
            $('input[name="deptId"]').val('');
            $('input[name="userId"]').val('');
            $('input[name="deptName"]').val('');
            $('input[name="userName"]').val('');
            $('select[name="roleId"]').val('');
			$('select[name="roleId"]').trigger("chosen:updated");
        },
        clickWidgetGroupOption:function($this) {
            $this.parent().addClass('active').siblings('li').removeClass('active');
            $("#widgetForm")[0].reset();
            $('#btnIconF').children('i').attr('class', 'empty');
            $('#btnIconG').children('i').attr('class', 'empty');
            var groupId=$this.attr('id');
            horizon.widgetapp.getWidgetsByGroupId(groupId);
        },
        //单个组件信息回显
        getWidgetByDataId: function(dataId) {
            $.ajax({
                url: horizon.paths.apppath+'/horizon/manager/widget/getWidgetById.wf',
                data:{
                	id: dataId
                },
                cache:false,
                dataType:'json',
                method:'post',
                success:function(data){
                	var $form = $('#widgetForm');
                	$('.form-group').removeClass('has-error');
                	$('#btnIconG').children('i').attr('class', 'empty');
                	$('#btnIconF').children('i').attr('class', 'empty');
                	$.each(data,function(key,value){
                			//图标回显
						   if(key=="iconType"){
							   if(value=="class"){
								   $('#iconBtn').removeClass('hidden');
					               $('#iconInput').addClass('hidden');
					               $('.iconpicker ').find('span').remove();
					               if(data.icon.indexOf("fa") >= 0){
					            	   $('#btnIconF').children('i').addClass(data.icon);
					            	   $('#btnIconF').find('span').remove();
					               }else{
					            	   $('#btnIconG').children('i').addClass(data.icon);
					            	   $('#btnIconG').find('span').remove();
					               }
					               $('#btnIconF').find('input').val(data.icon);
							   }else if(value=="image"){
								   $('#iconBtn').addClass('hidden');
					               $('#iconInput').removeClass('hidden');
								   $form.find('input[name="icon"]').val(data.icon);
							   }
						   }
						   //权限范围回显
						   if(key=="auth"){
							   if(value=="protected"){
								   $("#deptAndUser").removeClass('hidden');
								   $("#role").removeClass('hidden');
								   $form.find("select[name="+key+"] > option[value='"+value+"']").prop("selected","selected");
							   }
						   }
						   //角色回显
						   if(key=="roleId"){
							  $('select[name="roleId"]').val(value);
							  $('select[name="roleId"]').trigger("chosen:updated");
						   }
						   if(key=="groupId"){
							   $('select[name="groupId"]').val(value);
								$('select[name="groupId"]').trigger("chosen:updated");
						   }
						   $form.find('input[type="text"][name="' + key + '"]').val(value);
						   $form.find('input[type="hidden"][name="' + key + '"]').val(value);
						   $form.find('input[name="' + key + '"]:radio').prop('checked', '').filter('[value="' + value + '"]').trigger("click");
						   horizon.widgetapp.module(key,value);
                	});
                	  //地址回显
					$form.find('input[name="url"]').val(data.url);
					$form.find('input[name="link"]').val(data.viewName);
                }
            });
        },
        //菜单链接类型赋值
        module:function(key,value){
        	var $form = $('#widgetForm');
			var link = $form.find('input[name="link"]');
			var url = $form.find('input[name="url"]');
			if(key =="viewName"){
				//viewName 值为空说明点击选择的
				if(value != ""){
					url.addClass("hidden");
					$('#urlInput').removeClass('active');
	       			$('#viewSelect').addClass('active');
	       			$form.find('input[name="urlType"]:first').prop("checked",true);
					link.attr("readonly","readonly").removeClass("hidden");
					link.unbind(horizon.tools.clickEvent());
					link.bind(horizon.tools.clickEvent(),function(){
						horizon.widgetapp.moduleTreeInit();
					}); 
	       		}else{
	       			//说明是 手写输入的
	       			$form.find('input[name="urlType"]:last').prop("checked",true);
	       			$('#viewSelect').removeClass('active');
	       			$('#urlInput').addClass('active');
	       			link.addClass("hidden");
	       			url.removeClass("hidden");
					link.removeAttr("readonly"); 
					link.unbind(horizon.tools.clickEvent());
				}
			}
			$(".has-error").find('label[id*="-error"]').remove();
			$(".form-group").removeClass("has-error");
		},
        //显示有哪些适用角色
        getRoleList:function(){
        	 $.ajax({
		            url: horizon.paths.apppath + '/horizon/manager/widget/getRoles.wf',
		            dataType:'json',
		            cathe:false,
		            success:function(data){
		            	if(data && data.length > 0){
		            		var optionHtml = '<option value="" selected="true">'+parent.horizon.lang["base"]["selectPlaceholder"]+'</option>';
		                    $.each(data,function(i,option){		
		                   	optionHtml = optionHtml+'<option value="'+ option.id +'">' + option.roleName + '</option>';
		                    });
		                    $('#role').find($('select[name="roleId"]')).html(optionHtml);
		                }
		            }
		     });
        },
        //显示每个分组中有那些组件
        getWidgetsByGroupId: function(groupId) {
        	var $widgetGroupContainer = $('#widget-group-container');//存放组件
        	if(groupId!=null && groupId!=""){
        		$.ajax({
                    url: horizon.paths.apppath+'/horizon/manager/widget/getWidgetsByGroupId.wf',
                    data:{
                    	groupId: groupId
                    },
                    cache:false,
                    dataType:'json',
                    method:'post',
                    success:function(data){
                        $widgetGroupContainer.removeClass('hidden');
                        $widgetGroupContainer.html('');
                        if(data && data.length > 0) {
                        	for(var i=0;i<data.length;i++){
                        		var widget = data[i];
                        		var $defaultInfobox = $('.widget-item-defaule').children().clone();
                                $defaultInfobox.find('.widget-content').html(" "+widget.name);
                                if(widget.iconType == 'class'){
                                    $defaultInfobox.find('.widget-content').before('<i class="ace-icon '+ widget.icon +'" style="' + widget.widgetClass + '"></i>');
                                }else{
                                    $defaultInfobox.find('.widget-content').before('<img class="widget-item-img" src="' + widget.icon + '" style="' + widget.widgetClass + '"></img>');
                                }
                                $defaultInfobox.data('widget', widget);
                                $widgetGroupContainer.append($defaultInfobox);
                        	}
                            $('.edit-widget').click(function() {
                                var widget = $(this).closest('.widget-item').data('widget');
                                $('.space-12').removeClass('hidden');
                                horizon.widgetapp.getWidgetByDataId(widget.id);
                                return false;
                            });
                            $('.delete-widget').click(function() {
                                var widget=$(this).closest('.widget-item').data('widget');
                                var flag=false;
                                flag = horizon.widgetapp.whetherWidgetByWidgetId(widget.id,flag);
                                if(flag){
                                    var option = $.extend({
                                        dialogText: parent.horizon.lang["message"]["deleteConfirm"],
                                        dialogTextType: 'alert-danger',
                                        buttons: [
                                            {
                                                html: parent.horizon.lang["base"]["ok"],
                                                "class" : "btn btn-primary btn-xs",
                                                click: function() {
                                                    $.ajax({
                                                        url:horizon.paths.apppath+'/horizon/manager/widget/delWidgetById.wf',
                                                        data:{
                                                            dataId:widget.id
                                                        },
                                                        cache:false,
                                                        dataType:'json',
                                                        error:function(){
                                                            $dialog.removeClass('hidden').dialog($.extend({
                                                                dialogText: parent.horizon.lang["message"]["deleteFail"],
                                                                dialogTextType: 'alert-danger'
                                                            }, horizon.widgetapp.defaultDialogOption));
                                                        },
                                                        success:function(data){
                                                        	if(data == true){
                                                        		var groupId=$addWidget.parent().siblings('.active').children('.widget-group-option').attr('id');
                                                                horizon.widgetapp.getWidgetsByGroupId(groupId);
                                                                $("#widgetForm")[0].reset();
                                                                $('#btnIconF').children('i').attr('class', 'empty');
                                                                $('#btnIconG').children('i').attr('class', 'empty');
                                                                $('.space-12').addClass('hidden');
                                                                if($('#widget-group-container').children().length -1 == 0){
                                                                    $('#' + groupId).parent().prev().children().trigger('click');
                                                                    $('#' + groupId).parent().remove();
                                                                }
                                                        	}else{
                                                        		 $dialog.removeClass('hidden').dialog($.extend({
                                                                     dialogText: parent.horizon.lang["message"]["deleteFail"],
                                                                     dialogTextType: 'alert-danger'
                                                                 }, horizon.widgetapp.defaultDialogOption));
                                                        	}
                                                        }
                                                    });
                                                    $(this).dialog('close');
                                                }
                                            }
                                        ]
                                    }, horizon.widgetapp.defaultDialogOption);
                                    $dialog.removeClass('hidden').dialog(option);
                                }
                                return false;
                            });
                        }else {
                             $widgetGroupContainer.html('<h4 class="span-null">'+parent.horizon.lang["platform-widget"]["noWidgets"]+'</h4>');
                        }
                    }
                });
        	}
        },
      //判断组件是否被应用
        whetherWidgetByWidgetId:function(widgetId,flag){
            $.ajax({
                url:horizon.paths.apppath+'/horizon/manager/widget/whetherWidgetByWidgetId.wf',
                data:{
                    widgetId:widgetId
                },
                cache:false,
                dataType:'json',
                async:false,
                success:function(data){
                    if(data == true){
                        flag=true;
                    }else{
                        $dialog.removeClass('hidden').dialog($.extend({
                            dialogText: parent.horizon.lang["platform-widget"]["widgetNoDelete"],
                            dialogTextType: 'alert-danger'
                        }, horizon.widgetapp.defaultDialogOption));
                    }
                }
            });
            return flag;
        },
        //显示所有布局
        getLayout:function(){
        	var $addLayout = $('#add-layout');//增加布局区域
            $.ajax({
                url: horizon.paths.apppath +'/horizon/manager/widget/getAllLayout.wf',
                cache:false,
                dataType:'json',
                success:function(data){
                    if(data && data.length >0){
                        $.each(data,function(i,option){
                            var $newOption=$('<li><a href="#nogo" class="layerout-option" tabindex="-1" id="'+option.id+'">'+option.name+'</a></li>');
                            if( i == data.length-1 ){
                                $newOption.addClass("active");
                            }
                            $newOption.data('layout',option);
                            $('.dropdown-toggle-layout').parent().before($newOption);
                            var $dropdown=$('<li><a href="#nogo" class="layerout-option" tabindex="-1" id="'+option.id+'">'+option.name+'</a></li>');
                            $dropdown.data('layout',option);
                            $('#dropdown-layout-group').append($dropdown);
                        });
                        $('.dropdown-toggle-layout').click(function() {
                            var $this=$(this);
                            $this.parent().addClass('active').siblings('li').removeClass('active');
                            $this.next('ul').children('li').removeClass('active');
                        });
                        horizon.widgetapp.setLayoutInfo();
                        $('#layout-infobox').removeClass('hidden');
                        $('#layerout-container').removeClass('hidden');
                        $('.layerout-option').click(function(){
                            var $this=$(this);
                            $('.span-null').html('');
                            $this.parent().addClass('active').siblings('li').removeClass('active');
                            $('#reset-layout-btn').addClass('hidden');
                            $('#delete-layout-btn').removeClass('hidden');
                            horizon.widgetapp.setLayoutInfo($this);
                            return false;
                        });
                    }else{
                        $addLayout.parent().addClass('active');
                        $('#layout-infobox').removeClass('hidden');
                        $('#layerout-container').removeClass('hidden');
                        $('.layout-form')[0].reset();
                        horizon.widgetapp.changeLayoutCount();
                    }
                }
            });
        },
        //为每个布局回显值
        setLayoutInfo: function($this) {
            $('#default-area-info').siblings('.area').remove();
            $('#layerout-container').html('');
            var layout=$('.layout-ul').children('.active').data('layout');
            if($this){
                layout=$this.parent().data('layout');
            }
            $('#layoutCount').ace_spinner('value',layout.layeroutCount);
            $('#layoutName').val(layout.name);
            $('#description').val(layout.description);
            $('#layoutId').val(layout.id);
            $('#layout-infobox').removeClass('hidden');
            $('#layerout-container').removeClass('hidden');
            horizon.widgetapp.setLayoutArea(layout.layoutAreas);
        },
        
        //判断布局是否被应用
        whetherLayoutByLayoutId:function(layoutId,flag){
        	$.ajax({
	               url:horizon.paths.apppath+'/horizon/manager/widget/whetherLayoutByLayoutId.wf',
	               data:{
	                   layoutId:layoutId
	               },
	               cache:false,
	               dataType:'json',
	               async:false,
	               success:function(data){
	                   if(data == true){
	                       flag = true;
	                   }else{
	                       flag = false;
	                       $dialog.removeClass('hidden').dialog($.extend({
	                           dialogText:  parent.horizon.lang["platform-widget"]["layoutNoDelete"],
	                           dialogTextType: 'alert-danger'
	                       }, horizon.widgetapp.defaultDialogOption));
	                       horizon.widgetapp.setLayoutInfo();
	                   }
	               }
        	});
        	return flag;
        },
        //布局区域中的组件可以互相拖动
        layoutSortable:function(){
            $('.widget-container-col').sortable({
                connectWith: '.widget-container-col',
                items:'> .widget-box',
                opacity:0.8,
                revert:true,
                forceHelperSize:true,
                placeholder: 'widget-placeholder',
                forcePlaceholderSize: false,
                tolerance:'pointer',
                start: function(event, ui) {
                    ui.placeholder.css({'min-height':ui.item.height()});
                },
                update: function(event, ui) {
                }
            });
        },
        //从组件容器拖到区域
        widgetSortable:function(){
            $('.widget-container').sortable({
                connectWith: '.widget-container-col',
                items:'> .widget-item',
                opacity:0.8,
                revert:true,
                forceHelperSize:true,
                placeholder: 'widget-placeholder',
                forcePlaceholderSize:true,
                tolerance:'pointer',
                start: function(event, ui) {
                    ui.placeholder.addClass('item-list');
                },
                update: function(event, ui) {
                    if(ui.item.parent().hasClass('widget-container')){
                        return ;
                    }
                    var widget=ui.item.data('widget');
                    var $widgetBox=$('.widget-box-default').children().clone();
                    $widgetBox.data('widget',widget);
                    $widgetBox.css('height',widget.height+'px');
                    if(widget.iconType == 'class'){
                        $widgetBox.children('.widget-header').children('.widget-title').append('<i class="ace-icon infobox-icon ' + widget.icon + '"></i>');
                        $widgetBox.children('.widget-header').children('.widget-title').append('<span>' +widget.name+ '</span>');
                    }else{
                        $widgetBox.children('.widget-header').children('.widget-title').append('<img class="img-icon" src="' + widget.icon + '"></img>');
                        $widgetBox.children('.widget-header').children('.widget-title').append('<span> ' +widget.name+ '</span>');
                    }
                    ui.item.parent().append($widgetBox);
                    ui.item.remove();
                    $widgetBox.on('closed.ace.widget', function() {
                        horizon.widgetapp.returnWidget($(this));
                    });
                }
            });
        },
        returnWidget:function($this) {
            var widget=$this.closest('.widget-box').data('widget');
            var $smallWidget=$('.widget-box-list').children().clone();
            $smallWidget.data('widget',widget);
            $smallWidget.find('span').html(" "+widget.name);
            $('.widget-container').append($smallWidget);
            $smallWidget.find('.widget-checkbox').on('click',function() {
                horizon.widgetapp.clickWidgetCheckbox($(this));
            });
        },
        //根据不同的范围获取不同的组件
        getWidgetsByParam:function() {
            var auth=$('input[name="scope"]:checked').val();
            var name="INPUT_"+auth.toUpperCase();
            var objectId= $('input[name=' + name + ']').val();
            if(!objectId && auth == 'role'){
                objectId = $('#input-objectId-role').val();
                if(!objectId){
                    objectId = $('#input-search-role').val();
                }
            }
            $.ajax({
                url:horizon.paths.apppath+'/horizon/manager/widget/getWidgetsByParam.wf',
                data:{
                    auth:auth,
                    objectId:objectId
                },
                dataType:'json',
                type:'GET',
                cache:false,
                success:function(data){
                    if(data && data.length>0){
                        $('.layoutArea-row > .widget-container-col').html('');
                        var $layoutArea = $('.layoutArea-row > .widget-container-col');
                        var $bigWidgetBox=$('.widget-box-default').children();
                        if($layoutArea!=null && $layoutArea.length>0){
                            for(var i=0,length=$layoutArea.length;i<length;i++){
                                var widgets=$($layoutArea[i]).data('widgets');
                                var widgetsId=[];
                                if(widgets){
                                    widgetsId=widgets.split(';');
                                }
                                for(var j=0,size=widgetsId.length;j<size;j++){
                                    $.each(data,function(k,widget) {
                                        if(widget!=null){
                                            var $bigWidget=$bigWidgetBox.clone();
                                            $bigWidget.data('widget',widget);
                                            $bigWidget.css('height',widget.height+'px');
                                            if(widget.iconType == 'class'){
                                                $bigWidget.children('.widget-header').children('.widget-title').append('<i class="ace-icon infobox-icon ' + widget.icon + '" style="' + widget.widgetClass + '"></i>');
                                                $bigWidget.children('.widget-header').children('.widget-title').append('<span>' +widget.name+ '</span>');
                                            }else{
                                                $bigWidget.children('.widget-header').children('.widget-title').append('<img class="img-icon" src="' + widget.icon + '" style="' + widget.widgetClass + '"></img>');
                                                $bigWidget.children('.widget-header').children('.widget-title').append('<span> ' +widget.name+ '</span>');
                                            }
                                            if(widgets!=null && widgets!="" && widgetsId[j] == widget.id){
                                                $($layoutArea[i]).append($bigWidget);
                                                data[k]=null;
                                            }
                                            $bigWidget.on('closed.ace.widget', function() {
                                                horizon.widgetapp.returnWidget($(this));
                                            });
                                        }
                                    });
                                }
                            }
                        }
                        $('.widget-container').html('');
                        var $smallWidgetBox=$('.widget-box-list').children();
                        $.each(data,function(i,widget) {
                            if(widget!=null){
                                var $smallWidget=$smallWidgetBox.clone();
                                $smallWidget.data('widget',widget);
                                $smallWidget.find('span').html(" "+widget.name);
                                $('.widget-container').append($smallWidget);
                            }
                        });
                        $('.widget-item').find('.widget-checkbox').click(function() {
                            horizon.widgetapp.clickWidgetCheckbox($(this));
                        });
                    }
                }
            });
        },
        //单击widget复选框按钮，自动在最少的组件的布局中插入所单击的组件
        clickWidgetCheckbox:function($this) {
            var $item=$this.parent('.inline').parent('.widget-item');
            var widget=$item.data('widget');
            var $bigWidgetBox=$('.widget-box-default').children();
            var $layoutArea=$('.widget-container-col');
            if($layoutArea!=null && $layoutArea.length>0){
                var minLayout=0;
                var n=$($layoutArea[0]).find('.widget-box').length;
                for(var i=1,length=$layoutArea.length;i<length;i++){
                    var m=$($layoutArea[i]).find('.widget-box').length;
                    if(n>m){
                        minLayout=i;
                        n=m;
                    }
                }
                var $bigWidget=$bigWidgetBox.clone();
                $bigWidget.data('widget',widget);
                $bigWidget.css('height',widget.height+'px');
                if(widget.iconType == 'class'){
                    $bigWidget.children('.widget-header').children('.widget-title').append('<i class="ace-icon infobox-icon ' + widget.icon + '"></i>');
                    $bigWidget.children('.widget-header').children('.widget-title').append('<span>' +widget.name+ '</span>');
                }else{
                    $bigWidget.children('.widget-header').children('.widget-title').append('<img class="img-icon" src="' + widget.icon + '"></img>');
                    $bigWidget.children('.widget-header').children('.widget-title').append('<span> ' +widget.name+ '</span>');
                }
                $($layoutArea[minLayout]).append($bigWidget);
                $item.remove();
                $bigWidget.on('closed.ace.widget', function() {
                    horizon.widgetapp.returnWidget($(this));
                });
            }
        },
        //生成布局下拉列表
        getSelectLayout:function() {
            $('select[name="layoutId"]').children('.chosen-select-first').nextAll().remove();
            $.ajax({
                url: horizon.paths.apppath +'/horizon/manager/widget/getAllLayout.wf',
                cache:false,
                dataType:'json',
                success:function(data){
                    if(data && data.length>0){
                        var $chosenSelect = $('.chosen-select');
                        var custom = $('#custom-info-form').data('custom');
                        var layeroutVal='';
                        $.each(data,function(i, layout) {
                            var $newOption=$('<option value="'+layout.id+'">'+layout.name+'</option>');
                            if(custom!=null && custom.layoutId!=null && custom.layoutId==layout.id){
                                layeroutVal=layout.id;
                                $newOption.data('widgets', custom.customWidgets);
                            }
                            $newOption.data('layout',layout);
                            $chosenSelect.append($newOption);
                        });
                        $chosenSelect.val(layeroutVal);
                        if($chosenSelect.val() != '') {
                            $chosenSelect.trigger('change');
                        }
                    }
                }
            });
        },
        //首页定制组件
        getCustomByObjectId:function(scope,objectId) {
            $.ajax({
                url:horizon.paths.apppath+'/horizon/manager/widget/getCustomByObjectId.wf',
                dataType:'json',
                type:'post',
                cache:false,
                data:{
                    scope:scope,
                    objectId:objectId
                },
                success:function(data){
                    var $customInfo=$('.custom-info-row');
                    $('#custom-info-form').data('custom', data);
                    if(data!=null){
                        $customInfo.removeClass('hidden');
                        $('.layoutArea-row').removeClass('hidden');
                        $('.desc-textarea').val(data.description);
                        if($('.radio-'+data.scope)[0]!=undefined){
                        	this.checked = true;
            			}
                        $('#customId').val(data.id);
                        if(data.scope!='public'){
                            var name="INPUT_"+scope.toUpperCase();
                            $("input[name*='INPUT_']").val('');
                            $('#input-'+data.scope).removeClass('hidden');
                            if(data.scope != 'role'){
                                var object=data.objectId.split("-");
                                $('input[name=' + name + ']').val(object[0]);
                                $('input[name=T_' + name + '_ID]').val(object[0]);
                                $('input[name=T_' + name + ']').val(object[1]);
                            }else{
                                $('#input-objectId-role').val(data.objectId);
                            }
                        }
                        horizon.widgetapp.getSelectLayout();
                    }else{
                        $('.prompt-span').addClass('hidden').removeClass('hidden');
                        $('.custom-info-row').addClass('hidden');
                        $('.layoutArea-row').addClass('hidden');
                    }
                }
            });
        },
        //保存首页定制信息
        saveCustom:function() {
            var $areas = $('.widget-container-col');
            var _data = {
                areaCount: $areas.length
            };
            $areas.each(function(i) {
                var $this = $(this);
                var layoutArea=$this.data('layoutArea');
                _data['area_id_' + i] = layoutArea.id;
                var widgetIdArr = [];
                $this.children('.widget-box').each(function(k) {
                    var $widget = $(this);
                    var widget = $widget.data('widget');
                    widgetIdArr.push(widget.id);
                    _data[layoutArea.id + '_' + widget.id + '_ORDER'] = k;
                });
                _data[layoutArea.id+'_WIDGET'] = widgetIdArr.join(';');
            });
            var flag=false;
            var selectVal=$('.chosen-select').val();
            var auth=$('.radio-scope').children().children('input:checked').val();
            var name="INPUT_"+auth.toUpperCase();
            var objectId= $('input[name=' + name + ']').val();
            if(auth == 'role'){
                objectId=$('#input-objectId-role').val();
            }
            var customId=$('#customId').val();
            if(auth=='public'){
                if(selectVal.length==0){
                    $('.chosen-select').next('.span-null').html(parent.horizon.lang["platform-widget"]["selectLayout"]);
                }else if(customId.length==0){
                    $.ajax({
                        url: horizon.paths.apppath + '/horizon/manager/widget/whetherByPublic.wf',
                        dataType: 'json',
                        cache: false,
                        async: false,
                        success: function(data) {
                            if(data == true){
                                flag=true;
                            }else{
                                $dialog.removeClass('hidden').dialog($.extend({
                                    dialogText: parent.horizon.lang["platform-widget"]["publicCustomExists"],
                                    dialogTextType: 'alert-danger'
                                }, horizon.widgetapp.defaultDialogOption));
                            }
                        }
                    });
                }else{
                    flag=true;
                }
            }else{
                if(objectId.length==0){
                    $('#input-objectId-'+auth).next('.span-null').html(parent.horizon.lang["message"]["emptyError"]);
                }else if(selectVal.length==0){
                    $('.chosen-select').next('.span-null').html(parent.horizon.lang["platform-widget"]["selectLayout"]);
                }else if(objectId.length>0){
                    $.ajax({
                        url:horizon.paths.apppath+'/horizon/manager/widget/whetherByObjectId.wf',
                        dataType:'json',
                        cache:false,
                        async:false,
                        data:{
                            objectId:objectId,
                            customId:customId
                        },
                        success:function(data){
                            if(data == true){
                                flag=true;
                            }else{
                                $dialog.removeClass('hidden').dialog($.extend({
                                    dialogText: parent.horizon.lang["platform-widget"]["publicCustomExistsInScope"],
                                    dialogTextType: 'alert-danger'
                                }, horizon.widgetapp.defaultDialogOption));
                            }
                        }
                    });
                }
            }
            if(flag){
                $.ajax({
                    url:horizon.paths.apppath+'/horizon/manager/widget/saveCustom.wf?' + $('#custom-info-form').serialize(),
                    dataType:'json',
                    type:'post',
                    data:_data,
                    cache: false,
                    error:function(){
                        $dialog.removeClass('hidden').dialog($.extend({
                            dialogText: parent.horizon.lang["message"]["error"],
                            dialogTextType: 'alert-danger'
                        }, horizon.widgetapp.defaultDialogOption));
                    },
                    success:function(data){
                        if(data!=null && data.result == true){
                            $dialog.removeClass('hidden').dialog($.extend({
                                dialogText: parent.horizon.lang["message"]["saveSuccess"],
                                dialogTextType: 'alert-info'
                            }, horizon.widgetapp.defaultDialogOption));
                            $('option:not(:selected)').removeData('widgets');
                            if(auth == 'public'){
                                $('.edit-custom-ul').children('li').children('a[data-type="public"]').parent().addClass('active').siblings('li').removeClass('active');
                            }
                            var custom=data.custom;
                            $('#customId').val(custom.id);
                            $('#reset-custom-success').addClass('hidden');
                            $('#delete-custom-success').removeClass('hidden');
                        }else{
                            $dialog.removeClass('hidden').dialog($.extend({
                                dialogText: parent.horizon.lang["message"]["saveFail"],
                                dialogTextType: 'alert-danger'
                            }, horizon.widgetapp.defaultDialogOption));
                        }
                    }
                });
            }
        },
        //改变布局生成对应的区域
        layoutAreaSelectChange:function($this) {
            var selectVal=$this.val();
            $this.next('.span-null').html('');
            if(selectVal.length!=0){
                var layout=$this.children('option:selected').data('layout');
                var widgets=$this.children('option:selected').data('widgets');
                var layoutAreas=layout.layoutAreas;
                $('.layoutArea-row').removeClass('hidden');
                $('.layoutArea-row').html('');
                var $baseLayeroutArea = $('.layerout-area-default-container').children();
                $.each(layoutAreas, function(i, area) {
                    var areaClass='widget-container-col col-xs-'+area.xs+' col-sm-'+area.sm+' col-md-'+area.md+' col-lg-'+area.lg;
                    var $layoutDiv= $baseLayeroutArea.clone();
                    $layoutDiv.data('layoutArea',area);
                    $layoutDiv.addClass(areaClass);
                    if(widgets!=null && widgets.length>0){
                        var widgetArr = [];
                        $.each(widgets,function(i,widget){
                            if(widget.layoutAreaId==area.id){
                                widgetArr.push(widget.widgetId);
                            }
                        });
                        $layoutDiv.data('widgets', widgetArr.join(";"));
                    }
                    $('.layoutArea-row').append($layoutDiv);
                });
                horizon.widgetapp.getWidgetsByParam();
                horizon.widgetapp.layoutSortable();
            }else{
                $('.layoutArea-row').addClass('hidden');
            }
        },
       
        //初始化导航按钮的位置
        initFlowNavStyle:function(type) {
            var $nav = $('.buttons-'+type).children('.nav');
            var $li = $nav.children('li:not(.more)');
            $li.removeClass('hidden');
            var $moreLi = $nav.children('li.more');
            $moreLi.removeClass('open');
            var navWidth = $nav.innerWidth() - 100;
            var liWidth = 0;
            $li.each(function(i) {
                var $this = $(this);
                liWidth += $this.outerWidth();
                if(liWidth >= navWidth) {
                    $this.addClass('hidden');
                    $moreLi.children('ul').children().eq(i-1).removeClass('hidden');
                    $moreLi.removeClass('hidden');
                }else {
                    $this.removeClass('hidden');
                    $moreLi.children('ul').children().eq(i-1).addClass('hidden');
                    $moreLi.addClass('hidden');
                }
            });
        },
        colseSelectuser:function() {
            $('.widget-container-col').html('');
            $('.chosen-select').val('');
        }
    }
});
