/**
 * 系统菜单
 * @author zhangsk
 */
(function (factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery','ztree',
				'jqueryValidateAll','iconsetFontawesome','iconPicker', 'elementsSpinner'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
	"use strict";
	var urls ={
			selectMenu:horizon.paths.apppath+'/horizon/manager/menu/tree.wf',
			save:horizon.paths.apppath+'/horizon/manager/menu/save.wf',
			moduleTree:horizon.paths.apppath+'/horizon/manager/menu/module/tree.wf',
			info:horizon.paths.apppath+'/horizon/manager/menu/info.wf',
			checkMenuCode:horizon.paths.apppath+'/horizon/manager/menu/check/code.wf',
			menuDelete:horizon.paths.apppath+'/horizon/manager/menu/delete.wf'
		};
	//选择模块
    var moduletree = {
        setting: {
            async: {
            	url:urls.moduleTree,
                enable: true,
                dataType: "json",
                type:"post",
                otherParam:{urlType:"View"}
            },
            data : {
                simpleData : {
                    enable : true,
                    pIdKey : "pid"
                }
            },
            view: {
                dblClickExpand: false,
                showIcon: false,
                showLine:false
            },
            callback: {
                onClick: function(event, treeId, treeNode, clickFlag) {
                	if(!treeNode.isParent){
                	$('input[name="menuLink"]').val(treeNode.id);
                	$('input[name="cellNodulName"]').val(treeNode.name);
                	$('input[name="appId"][type="hidden"]').val(treeNode.pid);
                	$("#cellNodulName").dropdown('toggle');
                	}
                },
                onAsyncSuccess:function(event, treeId, treeNode, msg){
                    var id = $("input[name='menuLink']").val();
                    if(id != "" && typeof(id) != "undefined") {
                        var treeObj = $.fn.zTree.getZTreeObj("page-tree");
                        var node = treeObj.getNodeByParam("id", id);
                        var pId = $("input[name='appId']").val();
                        var pNode = treeObj.getNodeByParam("id", pId);
                        treeObj.expandAll(false);
                        treeObj.cancelSelectedNode();
                        treeObj.expandNode(pNode);
                        treeObj.selectNode(node, true);
                    }
                }
            }
        },
        init: function(option) {
			var $orgTree = $('#page-tree');
			moduletree.setting.async.otherParam.urlType=option;
			$.fn.zTree.init($orgTree, moduletree.setting);
        }
    };
    //选择上级菜单树
    var selectMenutree = {
        currentMenuId:"",
		setting: {
			async: { 
				url:urls.selectMenu,
				enable: true,
				dataType: "json",
				type:"post",
				open:"true",
				otherParam:{menuCategory:2}
			},
			data : {
				simpleData : {
					enable : true,
					pIdKey : "pid"
				}
			},
			view: {
				dblClickExpand: false,
				showIcon: false,
				showLine:false
			},
			callback: {
				onClick: function(event, treeId, treeNode, clickFlag) {
					var menuId=treeNode.id;
					var menuName=treeNode.name;
					$('input[name="parentId"]').val(menuId);
					$('input[name="parentName"]').val(menuName);
					$("#parentName").dropdown('toggle');
					$("#parentName").parent().removeClass("has-error");
				},
				onAsyncSuccess:function(event, treeId, treeNode, msg){
					var id = $("input[name='parentId']").val();
					if(id==null || id==''){
						var treeObj = $.fn.zTree.getZTreeObj("selectMenu-tree");
						var root = treeObj.getNodeByTId("selectMenu-tree_1");
						treeObj.expandNode(root, true, false, true);
					}else{
						var treeObj = $.fn.zTree.getZTreeObj("selectMenu-tree");
						var node = treeObj.getNodeByParam("id",id);
						var root = treeObj.getNodeByTId("selectMenu-tree_1");
						treeObj.expandAll(false);
						treeObj.expandNode(root, true, false, true);
						treeObj.expandNode(node, true, false, true);
						treeObj.selectNode(node,false);
					}
					if(selectMenutree.currentMenuId!=""){
                        var currentNode = treeObj.getNodeByParam("id",selectMenutree.currentMenuId);
                        treeObj.removeNode(currentNode);
					}
				}
			}
		},
		init: function(option,menuId) {
			var $orgTree = $('#selectMenu-tree');
            selectMenutree.currentMenuId=menuId;
			selectMenutree.setting.async.otherParam.menuCategory=option;
			$.fn.zTree.init($orgTree, selectMenutree.setting);
		}
    };
    //左侧菜单树
    var menuTree = {
		setting: {
			async: {
				url:urls.selectMenu,
				enable: true,
				dataType: "json",
				type:"post",
				otherParam:{menuCategory:2}
			},
			data : {
				simpleData : {
					enable : true,
					pIdKey : "pid"
				}
			},
			view: {
				dblClickExpand: false,
				showIcon: false,
				showLine:false
			},
			callback: {
				onClick: function(event, treeId, treeNode, clickFlag) {
					var menuId=treeNode.id;
					var tree = $.fn.zTree.getZTreeObj("menu-tree");
					var node = tree.getNodeByParam("id", treeNode.id);
					tree.selectNode(node, false);// 指定选中ID的节点
					if (treeNode.open) {
						tree.expandNode(node, false, false);// 指定选中ID节点折叠
					} else {
						tree.expandNode(node, true, false);// 指定选中ID节点展开
					}
					if(menuId=='newMenu'){
						formOpr.resertFromNoChecked();
						return;
					}
					if(menuId!='root_node_id'){
						formOpr.menuInfo(menuId);
						$("#delete").removeClass("hidden");
						$("#menuRest").addClass("hidden");
					}
				},
				onAsyncSuccess:function(event, treeId, treeNode, msg){
					var id = $("input[name='id']").val();
					if(id==null || id==''){
						formOpr.resertFromNoChecked();
						var treeObj = $.fn.zTree.getZTreeObj("menu-tree");
						var root = treeObj.getNodeByTId("tree_1");
						treeObj.expandNode(root, true, false, true);
           			}else{
						var treeObj = $.fn.zTree.getZTreeObj("menu-tree");
						var node = treeObj.getNodeByParam("id",id);
						var root = treeObj.getNodeByTId("tree_1");
						treeObj.expandNode(root, true, false, true);
						treeObj.expandNode(node, true, false, true);
						treeObj.selectNode(node,false);
					}
				}
			}
		},
		init: function() {
			var $orgTree = $('#menu-tree');
			$.fn.zTree.init($orgTree, menuTree.setting);
		}
	};
    //页面操作
	var operate={
		checkForm:function(){
			return $("#menuInfoForm").validate({
				rules: {
					menuCode: {
						  remote:{
							url:urls.checkMenuCode,
							cache: false,
							data:{
								menuCode: function() {
									return $('input[name="menuCode"]').val();
								},
								id: function() {
									return $('input[name="id"]').val();
								}
							}
						}
					}
				},
				messages: {
					menuCode: {				
						remote: horizon.lang['platform-menu']['menuCodeRepeat'],
					}
				},
				ignore: '.ignore',
				errorClass: 'help-block no-margin-bottom',
				focusInvalid: false,
				highlight: function (e) {
					$(e).closest('.form-group').addClass('has-error');
				},
				success: function (e) {
					$(e).closest('.form-group').removeClass('has-error');
					$(e).remove();
				},
				submitHandler: function (form){
					$.ajax({
						url: urls.save,
						dataType: 'json',
						type: 'post',
						data: $(form).serializeArray(),
						cache: false,
						error: function() {
							horizon.notice.error(horizon.lang['message']['operateError']);
						},
						success: function(data) {
							if(data.restype == "success"){
								if(data.msg[0]=='save'){
									horizon.notice.success(horizon.lang['message']['saveSuccess']);
								}else{
									horizon.notice.success(horizon.lang['message']['updateSuccess']);
								}
								menuTree.init();
							} else {
								horizon.notice.error(horizon.lang['message']['operateError']);
							}
						}
					});
				}
			});
		}
	};
	//绑定各种事件
	var event={
		//新建菜单
		newMenu:function(){
			$("#newMenu").bind(horizon.tools.clickEvent(),function(){
				formOpr.resertFromNoChecked();
			});
		},
        //文本框输入事件,任何非正整数的输入都重置为1
        orderNoLimit:function(){
            $("#orderNo").blur(function () {
                var g = /^[1-9]*[1-9][0-9]*$/;
                if (!g.test($(this).val())){
                    $("#orderNo").val(0);
                }
            });
        },
		//选择上级菜单事件
		parentMenu:function(){
			$("input[name='parentName']").bind(horizon.tools.clickEvent(),function(){
				selectMenutree.init($('input[name="menuCategory"]').val(),$('input[name="id"]').val());
			});
		},
		//选择模块事件
		linkTarget:function(){
			var link =$('input[name="menuLink"]');
			var cellNodulName =$('input[name="cellNodulName"]');
			$('input[name="urlType"]').change(function(){
				var $urlType = $('input[name="urlType"]:checked').val();
				cellNodulName.val("");
				link.val("");
				if($urlType!="url"){
					link.addClass("hidden");
					cellNodulName.unbind(horizon.tools.clickEvent());
					cellNodulName.attr("readonly","readonly").removeClass("hidden");
					if($('input:radio[name="target"]:checked').val()=='ajax'){
                        $('input[name="target"]:radio').prop('checked', '').filter('[value="sysmain"]').trigger("click");
					}
                    $("input[value='ajax']").attr("checked", false).parent().removeClass("btn-primary").removeClass("active").attr("disabled", true);
					cellNodulName.bind(horizon.tools.clickEvent(),function(){
						moduletree.init($urlType);
					});
		  		}else{
					$("input[value='ajax']").parent().attr("disabled",false);
					cellNodulName.addClass("hidden");
					link.removeClass("hidden");
		  			link.unbind(horizon.tools.clickEvent());
				}
			});
		},
		//图片选择事件
		img:function(){
			$('#btnIcon').iconpicker({
				labelFooter: '',
				selectedClass: 'btn-warning',
				unselectedClass: 'btn-white',
				iconset: 'fontawesome',
                search:true,
				icon:'fa-coffee'
			}).on('change', function(e) {
				if(e.icon == undefined) {
					return;
				}
				if('empty' == e.icon){
					$('input[name="menuImg"]').val('');
				}else{
					$('input[name="menuImg"]').val('fa ' + e.icon);
				}
				$('#menuImg').html('&nbsp;');
			});
		},
		spinner:function(){
			$('#orderNo').ace_spinner({value:0,min:0,max:1000,step:1, btn_up_class:'btn-info' , btn_down_class:'btn-info'});
		},
		//单选框事件
		overlapRadio:function(){
			$(".btn-overlap").find("label").bind(horizon.tools.clickEvent(),function(){
				$(this).parent().find("label").removeClass("btn-primary");
				$(this).addClass("btn-primary");
			});
		},
		//重置按钮
		menuRest:function(){
			$("#menuRest").bind(horizon.tools.clickEvent(),function(){
				formOpr.resertFromNoChecked();
			});
		},
		//删除事件
		menuDelete:function(){
			$("#delete").bind(horizon.tools.clickEvent(),function(){
				var menuId = $("input[name='id']").val();
				$("#dialog").dialog({
					title: horizon.lang['message']['title'],
					dialogText: horizon.lang['message']['deleteConfirm'],
					dialogTextType:'alert-danger',
					closeText:horizon.lang['base']['close'],
					buttons: [
						{
							html: horizon.lang['base']['ok'],
							"class": "btn btn-primary btn-xs",
							click: function() {
								$(this).dialog('close');
								$.ajax({
									type: "POST",
									data:{menuId:menuId},
									url:urls.menuDelete,
									dataType:"json",
									success: function(data){
										if(data.restype == "success"){
											horizon.notice.success(data.msg[0]);
											menuTree.init();
											formOpr.resertFromNoChecked();
										}else{
											horizon.notice.error(data.msg[0]);
										}
									}
								});
							}
						}
					]
				});
			});
		}
	};
	  //菜单链接类型赋值
	var method={
	  	module:function(key,value){
			var link =$('input[name="cellNodulName"]');
			if(key=="urlType"){
				if(value!="url"){
					$('input[name="menuLink"]').addClass("hidden");
					link.attr("readonly","readonly").removeClass("hidden");
					link.unbind(horizon.tools.clickEvent());
					link.bind(horizon.tools.clickEvent(),function(){
						moduletree.init(value);
					}); 
	       		}else{
					link.removeAttr("readonly"); 
					link.unbind(horizon.tools.clickEvent());
				}
			}
			$(".has-error").find('label[id*="-error"]').remove();
			$(".form-group").removeClass("has-error");
		}
	};
	//drop下拉框点击设置默认不关闭
	var  dropTree={
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
		}
	};
	//form表单对象
	var formOpr = {
		//回显输入框值
	    menuInfo:function(menuId) {
			$.ajax({
				type: "POST",
				data:{menuId:menuId},
				url:urls.info,
				dataType:"json",
				success: function(data){
					if(data && data!='/error/403'){
						$.each(data,function(key,value){
							if(key=="menuImg"){
								$('.iconpicker').find('i').attr("class",value);
								$('input[name="menuImg"]').val(value);
							}
							if(key=="func"){
								$('textarea[name="'+key+'"]').val(value);
							}
							$('input[type="text"][name="' + key + '"]').val(value);
							$('input[type="hidden"][name="' + key + '"]').val(value);
							$('input[name="' + key + '"]:radio').prop('checked', '').filter('[value="' + value + '"]').trigger("click");
							method.module(key,value);
						});
						$('input[name="cellNodulName"]').val(data.cellNodulName);
						$('input[name="menuLink"]').val(data.menuLink);
						$('input[name="parentId"]').val(data.pid);
					}
				}
			});
		},
		//重置表单
		resertFromNoChecked:function(){
			$('#menuInfoForm')[0].reset();
			$('#menuInfoForm').find('input[type="hidden"]').val('');
			$('.iconpicker').find("i").removeClass().addClass('fa fa-coffee');
			$("#orderNo").val("0");
			$("#menuCategory").val("2");
            var treeObj = $.fn.zTree.getZTreeObj("menu-tree");
            var selectedNode = treeObj.getSelectedNodes()[0];
            if (selectedNode){
                $("#parentName").val(selectedNode.menuName);
                $('input[name="parentId"]').val(selectedNode.id);
			}else {
                $("#parentName").parent().addClass("has-error");
			}
			$("#menuName").parent().addClass("has-error");
			$("#menuCode").parent().addClass("has-error");
			$(".help-block").hide();
			$("#delete").addClass("hidden");
			$("#menuRest").removeClass("hidden");
            $("input[type='radio']:checked").trigger("click");
            $("input[value='ajax']").parent().attr("disabled",false);
            $('input[name="urlType"]:radio').prop('checked', '').filter('[value="url"]').trigger("click");
            $('input[name="target"]:radio').prop('checked', '').filter('[value="ajax"]').trigger("click");


		}
	};
	return horizon.manager['sysmenu'] = {
		init:function(){
			menuTree.init();
			operate.checkForm();
			event.newMenu();
			event.parentMenu();
			event.linkTarget();
			event.img();
			event.menuDelete();
			event.menuRest();
			event.spinner();
			event.overlapRadio();
			event.orderNoLimit();
			dropTree.onClickDom();
		}
    };
}));