(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery','horizonJqueryui', 'bootstrap', 'horizonSelectuser', 'horizonWidget', 'ztree','ace','iconPicker','elementsSpinner'], factory);
    }
    else {
        factory(jQuery);
    }
})(function($){
    var $addLayout=$('#add-layout');//增加布局区域
    var $dialog=$('#dialog');//用于提示框
    var $addWidget = $('#add-widget');//增加组件
	var main = {
			load:function(){
			    horizon.language.getLanguage(["validator"],function(){
			    	horizon.language.plugins.validator();
			    })
			    //初始化Glyphicon图标
			    $('#btnIconG').iconpicker({
			        labelFooter: '',
                    search:true,
			        selectedClass: 'btn-warning',
			        unselectedClass: 'btn-white'
			    }).on('change', function(e) {
			        if(e.icon == undefined) {
			            return;
			        }
			        if('empty' == e.icon){
			            $('input[name="icon"]').val('');
			        }else{
			            $('input[name="icon"]').val('glyphicon ' + e.icon);
			            $('#btnIconF').find('input').val('glyphicon ' + e.icon);
			        }
			        $('#btnIconF').children('i').attr('class', 'empty');
			    }).on('click', function() {
			        $('#btnIconF').removeClass('active');
			        $('.search-control').css('width','none');
			    });

			    //初始化Fontawesome图标
			    $('#btnIconF').iconpicker({
			        labelFooter: '',
                    search:true,
			        selectedClass: 'btn-warning',
			        unselectedClass: 'btn-white',
			        iconset: 'fontawesome'
			    }).on('change', function(e) {
			        if(e.icon == undefined) {
			            return;
			        }
			        if('empty' == e.icon){
			            $('input[name="icon"]').val('');
			            $(this).find('input').val('');
			        }else{
			            $('input[name="icon"]').val('fa ' + e.icon);
			        }
			        $('#btnIconG').children('i').attr('class', 'empty');
			    }).on('click', function() {
			        $('#btnIconG').removeClass('active');
			        $('.search-control').css('width','none');
			    });

			    //部门
			    $('input[name="deptName"]').bind(horizon.tools.clickEvent(),function() {
			        $.horizon.selectUser({
			            idField: 'deptId',
			            cnField: 'deptName',
			            multiple: true,
			            selectDept: true,
			            selectPosition: false,
			            selectGroup: false,
			            selectUser:false,
			            dept:true,
			            position:false,
			            group:false,
			            role: false
			        });
			    });
			    //人员
			    $('input[name="userName"]').bind(horizon.tools.clickEvent(),function() {
			        $.horizon.selectUser({
			            idField: 'userId',
			            cnField: 'userName',
			            multiple: true,
			            selectDept: false,
			            selectPosition: false,
			            selectGroup: false,
			            selectUser:true,
			            dept:true,
			            position:false,
			            group:false,
			            role: false
			        });
			    });

			    //变换权限范围
			    $('input[name="auth"]').click(function() {
			        if($(this).val() == 'protected'){
			            $('#deptAndUser').removeClass('hidden');
			            $('#role').removeClass('hidden');
			            if(!ace.vars['touch']) {
			                $(window).trigger('resize.chosen');
			            }
			        }else{
			        	horizon.widgetapp.clearAuthMethod();
			        }
			    });
			    //增加布局
			    $('#add-layout').click(function() {
			        var $this=$(this);
			        $('#reset-layout-btn').removeClass('hidden');
			        $('#delete-layout-btn').addClass('hidden');
			        $('#layoutId').val('layoutId').val('');
			        $this.parent().addClass('active').siblings('li').removeClass('active');
			        $('#layerout-container').removeClass('hidden');
			        $('#area-container').children('.area').remove();
			        $('#layerout-container').children('.layerout-area').remove();
			        $('.layout-form')[0].reset();
			        $('.layout-form').find('')
			        $('#layoutCount').ace_spinner('value','1');
			        horizon.widgetapp.changeLayoutCount();
			        return false;
			    });
			    //重置添加布局表单
			    $('#reset-layout-btn').click(function() {
			        $('.span-null').html('');
			        $('#add-layout').trigger('click');
			    });
			    //删除布局
			    $('#delete-layout-btn').click(function(){
			        var layoutId=$('#layoutId').val();
			        var flag=false;
			        flag = horizon.widgetapp.whetherLayoutByLayoutId(layoutId,flag);
			        if(flag){
			            var option = $.extend({
			                dialogText: horizon.lang["message"]["deleteConfirm"],
			                dialogTextType: 'alert-danger',
			                buttons: [
			                    {
			                        html: '<i class="ace-icon glyphicon glyphicon-ok bigger-110"></i> '+horizon.lang["base"]["ok"],
			                        "class" : "btn btn-primary btn-xs",
			                        click: function() {
			                            $.ajax({
			                                url:horizon.paths.apppath+'/horizon/manager/widget/delLayoutById.wf',
			                                data:{
			                                    dataId:layoutId
			                                },
			                                cache:false,
			                                dataType:'json',
			                                error:function() {
			                                    $dialog.removeClass('hidden').dialog($.extend({
			                                        dialogText: horizon.lang["message"]["deleteFail"],
			                                        dialogTextType: 'alert-danger'
			                                    }, horizon.widgetapp.defaultDialogOption));
			                                },
			                                success:function(data){
			                                	if(data == true) {
			                                		 var $layoutUl=$('.layout-ul').children('.active');
			                                         $layoutUl.remove();
			                                         $('#add-layout').trigger('click');
			                                	}else{
			                                		$dialog.removeClass('hidden').dialog($.extend({
			                                            dialogText: horizon.lang["message"]["deleteFail"],
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
			    });
			    
			    //保存布局
			    $('#save-btn-success').click(function(){
			        var flag=true;
			        $('#layoutName').next('.span-null').html('');
			        var layoutName = $('#layoutName').val();
			        if(layoutName == null||$.trim(layoutName).replace(/(^s*)|(s*$)/g, "").length == 0){
			            $('#layoutName').next('.span-null').html(horizon.lang["message"]["emptyError"]);
			            flag=false;
			        }
			        var layoutId=$('#layoutId').val();
			        if(layoutId!=null && layoutId!=""){
			        	 flag = horizon.widgetapp.whetherLayoutByLayoutId(layoutId,flag);
			        	 var layoutName = $('#layoutName').val();
					     if(layoutName == null||$.trim(layoutName).replace(/(^s*)|(s*$)/g, "").length == 0){
						     $('#layoutName').next('.span-null').html(horizon.lang["message"]["emptyError"]);
						     flag=false;
					    }
			        }
			        if(flag){
			            var $form=$('.layout-form');
			            $.ajax({
			                url: horizon.paths.apppath+'/horizon/manager/widget/saveLayout.wf',
			                dataType:'json',
			                type:'post',
			                cache: false,
			                data: $('.layout-form').serialize(),
			                error:function(){
			                    $dialog.removeClass('hidden').dialog($.extend({
			                        dialogText: horizon.lang["message"]["error"],
			                        dialogTextType: 'alert-danger'
			                    }, horizon.widgetapp.defaultDialogOption));
			                },
			                success:function(data){
			                	var flag = data.result;
			                	if(flag){
			                		var layout = data.layout;
			                		$dialog.removeClass('hidden').dialog($.extend({
			                            dialogText: horizon.lang["message"]["saveSuccess"],
			                            dialogTextType: 'alert-info'
			                        }, horizon.widgetapp.defaultDialogOption));
			                        var flag=true;
			                        $('.layerout-option').each(function() {
			                            if($(this).attr('id')==layout.id){
			                                flag=false;
			                            }
			                        });
			                        var  $newOption=$('<li><a href="#" class="layerout-option" tabindex="-1" id="'+layout.id+'">'+layout.name+'</a></li>');
			                        if(flag){
			                            $('#add-layout').parent().removeClass('active');
			                            $newOption.addClass("active");
			                            $newOption.data('layout',layout);
			                            $addLayout.parent().after($newOption);
			                            $('#reset-layout-btn').addClass('hidden');
			                            $('#delete-layout-btn').removeClass('hidden');
			                        }else{
			                            $('#add-layout').parent().siblings('.active').children('.layerout-option').html(layout.name);
			                            $('#add-layout').parent().siblings('.active').data('layout',layout);
			                            horizon.widgetapp.setLayoutInfo();
			                        }
			                        $('#layoutId').val(layout.id);
			                        $newOption.children('.layerout-option').click(function(){
			                            var $this=$(this);
			                            $this.parent().addClass('active').siblings('li').removeClass('active');
			                            $('#reset-layout-btn').addClass('hidden');
			                            $('#delete-layout-btn').removeClass('hidden');
			                            $('#layoutName').next('label').html('');
			                            horizon.widgetapp.setLayoutInfo();
			                            return false;
			                        });
			                	}else{
			                		$dialog.removeClass('hidden').dialog($.extend({
			                            dialogText: horizon.lang["message"]["saveFail"],
			                            dialogTextType: 'alert-info'
			                        }, horizon.widgetapp.defaultDialogOption));
			                	}
			                }
			            });
			        }
			    });
			    //保存首页定制组件
			    $('#save-custom-success').click(function(){
			        horizon.widgetapp.saveCustom();
			    });
			    //删除首页定制信息
			    $('#delete-custom-success').click(function() {
			        var customId=$('#customId').val();
			        var option = $.extend({
			            dialogText: horizon.lang["message"]["deleteConfirm"],
			            dialogTextType: 'alert-danger',
			            buttons: [
			                {
			                    html: '<i class="ace-icon glyphicon glyphicon-ok bigger-110"></i> '+horizon.lang["base"]["ok"],
			                    "class" : "btn btn-primary btn-xs",
			                    click: function() {
			                        $.ajax({
			                            url:horizon.paths.apppath+'/horizon/manager/widget/delCustomById.wf',
			                            data:{
			                                customId:customId
			                            },
			                            cache:false,
			                            dataType:'json',
			                            error:function(){
			                                $dialog.removeClass('hidden').dialog($.extend({
			                                    dialogText: horizon.lang["message"]["deleteFail"],
			                                    dialogTextType: 'alert-danger'
			                                }, horizon.widgetapp.defaultDialogOption));
			                            },
			                            success:function(data){
			                            	if(data == true) {
			                            		$('#add-custom').parent().addClass('active');
			                                    $('#add-custom').trigger('click');
			                            	}else{
			                            		$dialog.removeClass('hidden').dialog($.extend({
			                                        dialogText: horizon.lang["message"]["deleteFail"],
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
			    });

			    //按条件查询首页定制组件
			    $('#custom-search-button').click(function(){
			        var scope= $('.edit-custom').parent().siblings('.active').children().attr('data-type');
			        var name="SEARCH_"+scope.toUpperCase();
			        var objectId = "";
			        if (scope != 'role'){
                        objectId= $('input[name=' + name + ']').val().trim();
					} else {
                        objectId=$('#input-search-role').val().trim();
					}
					if(objectId){
                        horizon.widgetapp.getCustomByObjectId(scope,objectId);
			        }else{
						$dialog.removeClass('hidden').dialog($.extend({
							dialogText: horizon.lang["platform-widget"]["selectToSearch"],
			                dialogTextType: 'alert-danger'
			            }, horizon.widgetapp.defaultDialogOption));
			        }
			    });

			    //增加首页定制组件
			    $('#add-custom').click(function() {
			        var $this=$(this);
			        $this.parent().addClass('active').siblings('li').removeClass('active');
			        $('#custom-info-form').removeData('custom');
			        $('#custom-info-form').find("customId").val('');
			        $('.radio-public')[0].checked = true;
			        horizon.widgetapp.getSelectLayout();
			        $('.layoutArea-row').html('');
			        $('#custom-info').removeClass('hidden');
			        $('.prompt-span').addClass('hidden');  //隐藏提示信息
			        $('.custom-info-row').removeClass('hidden');
			        $('.custom-prompt').html('');
			        $('#customId').val('');
			        $('#custom-edit-search').addClass('hidden').next().addClass('hidden');
			        $('#custom-info-form').children('.input-dru').addClass('hidden');
			        $('#custom-info-form')[0].reset();//重置按钮显示
			        $('#reset-custom-success').removeClass('hidden');
			        $('#delete-custom-success').addClass('hidden');
			        return false;
			    });
			    //重置首页定制表单
			    $('#reset-custom-success').click(function() {
			        $('.span-null').html('');
			        $('#add-custom').trigger('click');
			    });
			    //编辑首页定制组件
			    $('.edit-custom').click(function() {
			        var $this = $(this);
			        $('#reset-custom-success').addClass('hidden');
			        $('#delete-custom-success').removeClass('hidden');
			        $('.desc-textarea').val('');
			        $('.chosen-select').val('');
			        $('.custom-prompt').html('');
			        $("input[name*='INPUT_']").val('');
			        $("input[name*='SEARCH_']").val('');
			        $('#custom-info-form').removeData('custom');
			        $('#custom-info-form').children('.input-dru').addClass('hidden');
			        $this.parent().addClass('active').siblings('li').removeClass('active');
			        var type = $this.attr('data-type');
			        var $customEditSearch = $('#custom-edit-search');
			        $('.radio-scope').find('input[value='+type+']').prop('checked',true);
			        $('.radio-scope').find('input[value!='+type+']').prop('checked',false);
			        if(type == 'public') {
			            $customEditSearch.addClass('hidden').next().addClass('hidden');
			            var scope= $('.edit-custom').parent().siblings('.active').children().attr('data-type');
			            var name="SEARCH_"+scope.toUpperCase();
			            var objectId= $('input[name=' + name + ']').val();
			            horizon.widgetapp.getCustomByObjectId(scope,objectId);
			        }else {
			            $('.prompt-span').addClass('hidden');
			            $('.custom-info-row').addClass('hidden');
			            $('.layoutArea-row').addClass('hidden');
			            $customSearchForm = $('#custom-search-form');
			            $customSearchForm[0].reset();
			            $customSearchForm.children().addClass('hidden');
			            $customSearchForm.children('#custom-' + type + '-search').removeClass('hidden');
			            $customEditSearch.removeClass('hidden');
			            if(type == 'role'){
			                $.ajax({
			                    url: horizon.paths.apppath + '/horizon/manager/widget/getRoles.wf',
			                    dataType:'json',
			                    cathe:false,
			                    success:function(data){
			                        if(data && data.length > 0){
			                        	 var $searchRole = $('#input-search-role');
			                        	 var $objectRole = $('#input-objectId-role');
			                        	 $objectRole.children('.chosen-select-first').nextAll().remove();
			                        	 $searchRole.children('.chosen-select-first').nextAll().remove();
			                            $.each(data,function(i,option){
			                                var $option='<option value="'+ option.id +'">' + option.roleName + '</option>';
			                                $searchRole.append($option);
			                                $('#input-objectId-role').append($option);
			                            });
			                        }
			                    }
			                });
			            }
			        }
			        return false;
			    });
			    //适用范围单选按钮单击事件
			    $('input[name="scope"]').click(function() {
			        var $this=$(this);
			        var type=$this.val();
			        $("input[name*='INPUT_']").val('');
			        $("input[name*='SEARCH_']").val('');
			        if(type!='public'){
			            $('.input-objectId').val('');
			            $('.widget-container').html('');
			            if(type == 'role'){
			                $.ajax({
			                    url: horizon.paths.apppath + '/horizon/manager/widget/getRoles.wf',
			                    dataType:'json',
			                    cathe:false,
			                    success:function(data){
			                        if(data && data.length > 0){
			                            $('#input-objectId-role').children('.chosen-select-first').nextAll().remove();
			                            $.each(data,function(i,option){
			                                var $option=$('<option value="'+ option.id +'">' + option.roleName + '</option>');
			                                $('#input-objectId-role').append($option);
			                            });
			                        }
			                    }
			                });
			            }
			        }else{
			            $('.widget-container-col').html('');
			            horizon.widgetapp.getWidgetsByParam();
			        }
			        $('.form-ridio-scope').nextAll('.input-dru').addClass('hidden')
			        $('.form-ridio-scope').nextAll('#input-'+type).removeClass('hidden');
			    });
			    
			    $('.input-objectId').change(function() {
			        var $this=$(this);
			        var type=$('.radio-scope').children().children('input:checked').val();
			        var objectId=$('#input-objectId-'+type).val();
			        if(objectId!=undefined && objectId.length>0){
			            $this.next('.span-null').html('');
			            horizon.widgetapp.getWidgetsByParam();
			        }else{
			            $this.next('.span-null').html(horizon.lang["message"]["emptyError"]);
			        }
			    });
			    //改变布局生成对应的区域
			    $('.chosen-select').change(function() {
			        var $this=$(this);
			        horizon.widgetapp.layoutAreaSelectChange($this);
			    });
			    //单击自定义布局
			    $('.pane-two-layout').on('click',function(){
			        $('.space-12').removeClass('hidden');
			        if(!$(this).hasClass('empty')) {
			            return ;
			        }
			        $(this).removeClass('empty');
			        $('#reset-layout-btn').addClass('hidden');
			        $('#delete-layout-btn').removeClass('hidden');
			        horizon.widgetapp.getLayout();
			    }).on('shown.bs.tab',function(e) {
			        var $this=$(this);
			        var type=$this.attr('data-type');
			        horizon.widgetapp.initFlowNavStyle(type);
			    });
			    //验证布局名不能为空
			    $('#layoutName').blur(function(){
			        var $this=$(this);
			        $this.next('.span-null').html('');
			        if($.trim($this.val()).replace(/(^s*)|(s*$)/g, "").length==0){
			            $this.next('.span-null').html(horizon.lang["message"]["emptyError"])
			        }
			    });
			    //单击首页定制
			    $('.pane-four-custom').on('click',function() {
			        $('.space-12').removeClass('hidden');
			        $('.edit-custom-ul').children('li').removeClass('active');
			        $('.edit-custom-ul li:last-child').prev().addClass('active');
			        $('#custom-edit-search').addClass('hidden');
			        $('#reset-custom-success').addClass('hidden');
			        $('#delete-custom-success').removeClass('hidden');
			        $('.space-12').removeClass('hidden');
			        var scope= $('.edit-custom').parent().siblings('.active').children().attr('data-type');
			        var name="SEARCH_"+scope.toUpperCase();
			        var objectId= $('input[name=' + name + ']').val();
			        horizon.widgetapp.getCustomByObjectId(scope,objectId);
			    }).on('shown.bs.tab',function(e) {
			        var $this=$(this);
			        var type=$this.attr('data-type');
			        horizon.widgetapp.initFlowNavStyle(type);
			    });
			    $('.dropdown-toggle-custom').click(function() {
			        var $this=$(this);
			        $this.parent().addClass('active').siblings('li').removeClass('active');
			        $this.next('ul').children('li').removeClass('active');
			    });
			    
			    //单击应用组件
			    $('.pane-one-widget').on('click',function() {
			        $('#widget-group').children('li').removeClass('active');
			        $('#widget-group li:last-child').prev().addClass('active');
			        var groupId=$addWidget.parent().siblings('.active').children('.widget-group-option').attr('id');
			        horizon.widgetapp.getWidgetsByGroupId(groupId);
			        $("select[name='groupId']").find($("option[value="+groupId+"]")).prop('selected',true);
			        $("select[name='groupId']").children().not($("option[value="+groupId+"]")).prop('selected',false)
			        
			    }).on('shown.bs.tab',function(e) {
			        var $this=$(this);
			        var type=$this.attr('data-type');
			        horizon.widgetapp.initFlowNavStyle(type);
			    });
			    
			    //查询部门定制模板时,选择项设置
			    $('#input-search-dept').click(function() {
			        $('.prompt-span').addClass('hidden');
			        $.horizon.selectUser({
			        	idField: 'SEARCH_DEPT', 
			        	cnField: 'T_SEARCH_DEPT',
				        selectDept: true, 
				        multiple: false,  
				        selectUser: false,
				        position: false,
				        group: false
				   });
			    });
			    
			    //查询用户定制模板时,选择项设置
			    $('#input-search-user').click(function() {
			        $('.prompt-span').addClass('hidden');
			        $.horizon.selectUser({
			        	idField: 'SEARCH_USER', 
			        	cnField: 'T_SEARCH_USER',
			        	multiple: false,   
				        selectDept: false, 
				        selectPosition: false,
				        selectGroup: false,
				        dept:true,
				        position: false,
				        group: false
				   });
			    });
			  //添加部门定制模板时,选择项
			    $('#input-objectId-dept').click(function() {
			        $.horizon.selectUser({
			        	idField: 'INPUT_DEPT', 
			        	cnField: 'T_INPUT_DEPT',
				        selectDept: true, 
				        selectUser: false,
				        selectPosition: false,
				        selectGroup: false,
				        position: false,
				        group: false
				   });
			    });
			    //添加用户定制模板时,选择项设置
			    $('#input-objectId-user').click(function() {
			        $.horizon.selectUser({
			        	idField: 'INPUT_USER', 
			        	cnField: 'T_INPUT_USER',
				        selectDept: false, 
				        selectPosition: false,
				        selectGroup: false,
				        dept:true,
				        position: false,
				        group: false
				   });
			    });
			  //变换图标类型
			    $('input[name="iconType"]').click(function() {
			        if($(this).val() == 'class'){
			            $('#iconBtn').removeClass('hidden');
			            $('#iconInput').addClass('hidden');
			            $('#image-icon-text').text(horizon.lang["platform-widget"]["imgClass"])
			        }else{
			            $('#iconBtn').addClass('hidden');
			            $('#iconInput').removeClass('hidden');
			            $('#image-icon-text').text(horizon.lang["platform-widget"]["image"])
			        }
			    });
			    //窗口大小变化后导航按钮的位置
			    $(window).resize(function() {
			        var type=$('#myTab').children('.active').children().attr('data-type');
			        horizon.widgetapp.initFlowNavStyle(type);
			    });
			    //获取分组
			    horizon.widgetapp.getWidgetGroups();
			    //初始化区域数量文本框
			    horizon.widgetapp.initLayoutCount();
			    //组件拖动
			    horizon.widgetapp.widgetSortable();
			    //保存组件
			    horizon.widgetapp.saveWidget();
			    //角色列表
			    horizon.widgetapp.getRoleList();
			    //初始化模块树
			    horizon.widgetapp.moduleTreeInit();
			    horizon.widgetapp.onClickDom();
			    //点击选择视图事件
			   // horizon.widgetapp.selectUrl();
			    horizon.widgetapp.linkTarget();
			    //组件滚动条
			    horizon.widgetapp.setScroll();
			    
			}
	};
	return horizon.widget['main']={
		load:function(){
			main.load()
		}	
	};
});