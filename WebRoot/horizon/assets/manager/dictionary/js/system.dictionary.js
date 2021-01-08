/**
 * 系统字典操作
 * @author yw
 */
(function (factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonSelectuser','jqueryValidateAll', 'jqueryForm'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
	"use strict";
	var urls ={
		dictionaryTree:horizon.paths.apppath + '/horizon/manager/dict/tree.wf',
		info:horizon.paths.apppath+'/horizon/manager/dict/info.wf',
		save:horizon.paths.apppath+'/horizon/manager/dict/save.wf',
		checkCode:horizon.paths.apppath+'/horizon/manager/dict/code/check.wf',
        checkName:horizon.paths.apppath+'/horizon/manager/dict/name/check.wf',
        checkValue:horizon.paths.apppath+'/horizon/manager/dict/value/check.wf'
	};
	var _height = {
		outerHeight: function() {
			var _height = $(window).height()
				- parseInt($('.page-content').css('paddingTop')) * 2;
			_height -= !$('.page-header').hasClass('hidden') ? $('.page-header').outerHeight(true) : 0;
			var $body = $('body');
			if($body.attr('data-layout') != 'left' && $body.attr('data-layout') != 'left-hoversubmenu') {
				_height -= ($('#sidebar').css('visibility') != 'hidden'?$('#sidebar').outerHeight(true):0);
			}
			if(!$body.hasClass('embed')) {
				_height -= $('#navbar').outerHeight(true);
			}
			return _height;
		},
		tableHeight:function(){
			var height =  _height.outerHeight();
			if(height<_height.outerHeight()/2){
				height = _height.outerHeight()/2;
			}
			return height;
		}
	};
	var dictionaryTree = {
		nodeId:'',
		setting: {
			async: {
				url:urls.dictionaryTree,
				enable: true,
				dataType: "json",
				type:"post",
				otherParam:{
					dictType:"system"
				}
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
				showLine: false
			},
			callback: {
				onClick: function(event, treeId, treeNode, clickFlag) {
					operate.openTree(treeNode.name);
					var tree = $.fn.zTree.getZTreeObj("systemDictionary-tree");
					var node = tree.getNodeByParam("id", treeNode.id);
					tree.selectNode(node, false);// 指定选中ID的节点
					if (treeNode.open) {
						tree.expandNode(node, false, false);// 指定选中ID节点折叠
					} else {
						tree.expandNode(node, true, false);// 指定选中ID节点展开
					}
					if(treeNode.id != "root_node_id"){
						showView.showSystemDictionaryChildrenList(treeNode.id,treeNode.pid);
					}else{
						showView.showSystemDictionaryList();
					}
				},
				onAsyncSuccess: function(event, treeId, treeNode, msg){
					var tree = $.fn.zTree.getZTreeObj("systemDictionary-tree");
					var result = new Array();
					result  =  operate.getAllLeafNodes(tree.getNodes()[0],result);
					for (var i = 0; i < result.length; i++) {
						if(result[i].level!=2) {
							tree.removeNode(result[i]);
						}
					}
					var node = tree.getNodeByParam("id",dictionaryTree.nodeId);
					tree.selectNode(node,false);//指定选中ID的节点
					tree.expandNode(node, true, false);//指定选中ID节点展开
				}
			}
		},
		init: function(option) {
			dictionaryTree.nodeId=option;
			var $orgTree = $('#systemDictionary-tree');
			$.fn.zTree.init($orgTree, dictionaryTree.setting);
		}
	};
	 //选择上级字典
    var selectSysParentDict = {
        currentId:"",
		nodeId:"",
		setting: {
			async: {
				url:urls.dictionaryTree,
				enable: true,
				dataType: "json",
				type:"post",
				open:"true",
				otherParam:{dictType:"system"}
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
				showLine: false
			},
			callback: {
				onClick: function(event, treeId, treeNode, clickFlag) {
					var id = treeNode.id;
					var name = treeNode.name;
					if(id!=name && id!="root_node_id"){
						if(id!="root_node_id"){
							$("#dictCategory").addClass("hidden");
						}else{
							$("#dictCategory").removeClass("hidden");
							$('input[name="category"]').removeAttr("readonly");
						}
						$('input[name="parentId"]').val(treeNode.id);
						$('input[name="parentName"]').val(treeNode.name);
						$("#parentName").dropdown('toggle');
					}
				},
				onAsyncSuccess:function () {
					//展开父节点
					var tree = $.fn.zTree.getZTreeObj("sysDict-tree");
					var node = tree.getNodeByParam("id",selectSysParentDict.nodeId);
					tree.selectNode(node, false);// 指定选中ID的节点
					tree.expandNode(node, true, false);// 指定选中ID节点展开
					$('#sysDict-tree').attr("style","display:block;");
					if(selectSysParentDict.currentId != ""){
                    	var currentNode = tree.getNodeByParam("id",selectSysParentDict.currentId);
                    	tree.removeNode(currentNode);
                    }
				}
			}
		},
	    init: function(option,currentId) {
	      	var $orgTree = $('#sysDict-tree');
            selectSysParentDict.nodeId = option;
            selectSysParentDict.currentId = currentId;
            $.fn.zTree.init($orgTree, selectSysParentDict.setting);
	    }
    };
	var operate={
		//获取所有叶子节点
		getAllLeafNodes :function (treeNode, result) {
			if (treeNode.isParent) {
				var childrenNodes = treeNode.children;
				if (childrenNodes) {
					for (var i = 0; i < childrenNodes.length; i++) {
						if (!childrenNodes[i].isParent) {
							result.push(childrenNodes[i]);
						} else {
							result = operate.getAllLeafNodes(childrenNodes[i], result);
						}
					}
				}
			} else {
				result.push(treeNode);
			}
			return result;
		},
		//选择上级字典
		parentDict:function(){
			$("#sysDictForm input[name='parentName']").unbind(horizon.tools.clickEvent()).bind(horizon.tools.clickEvent(),function(){
				var id = $("#sysDictForm input[name='parentId']").val();
				var currentId = $("#sysDictForm input[name='id']").val();
				selectSysParentDict.init(id,currentId);
			});
		},
		//定位树节点
		openTree:function(category){
			var tree = $.fn.zTree.getZTreeObj("systemDictionary-tree");
			var node = tree.getNodeByParam("name",category);
			tree.selectNode(node,false);//指定选中ID的节点
		},
		//拿到选中的树节点
		getTreeNode:function(){
			var tree = $.fn.zTree.getZTreeObj("systemDictionary-tree");
			var nodes = tree.getSelectedNodes();
			return nodes[0];
		},
		//回显数据
		initInfo:function(id){
			if(id){
				$.ajax({
					url: urls.info,
					cache: false,
					dataType: 'json',
					data: {
						"id": id
					},
					success: function(data) {
						if(data){
							$.each(data,function(key,value){
								$('#systemDictionaryForm input[type="text"][name="' + key + '"]').val(value);
								$('#systemDictionaryForm input[type="hidden"][name="' + key + '"]').val(value);
								$('#systemDictionaryForm textarea[name="' + key + '"]').val(value);
							});
							$("input[type='radio'][name='active']").each(function(){
								if($(this).val()==data.active){
									$(this).prop("checked",true);
								}else{
									$(this).prop("checked",false);
								}
							});
							$('#systemDictionaryForm input[type="hidden"][name="parentId"]').val(data.pid);
						}else{
							parent.horizon.notice.error(horizon.lang['platform-dict']['getInfoFailed']);
						}
					}
				});
			}
		},
		checkForm:function(){
			$('#sysDictForm').validate({
				rules: {
					dictCode: {
						remote:{
							url:urls.checkCode,
							cache: false,
							data:{
								dictCode: function() {
									return $('#sysDictForm').find('input[name="dictCode"]').val();
								},
								id: function() {
									return $('#sysDictForm').find('input[name="id"]').val();
								}
							}
						}
					},
                    dictName: {
                        remote: {
                            url: urls.checkName,
                            cache: false,
                            data: {
                                dictName: function () {
                                    return $('#sysDictForm').find('input[name="dictName"]').val();
                                },
                                id: function () {
                                    return $('#sysDictForm').find('input[name="id"]').val();
                                }
                            }
                        }
                    },
                    dictValue: {
                        remote: {
                            url: urls.checkValue,
                            cache: false,
                            data: {
                                dictName: function () {
                                    return $('#sysDictForm').find('input[name="dictValue"]').val();
                                },
                                id: function () {
                                    return $('#sysDictForm').find('input[name="id"]').val();
                                }
                            }
                        }
                    }
				},
				messages: {
					dictCode: {
						remote: horizon.lang['platform-dict']['dictCodingRepeat']
					},
                    dictName: {
                        remote: horizon.lang['platform-dict']['dictNameRepeat']
                    },
                    dictValue: {
                        remote: horizon.lang['platform-dict']['dictValueRepeat']
                    }
				},
				focusInvalid: false,
				errorClass: 'help-block no-margin-bottom',
				highlight : function(e) {
					$(e).closest('.form-group').addClass('has-error');
				},
				success : function(e) {
					$(e).closest('.form-group').removeClass('has-error');
					$(e).remove();
				},
				submitHandler: function (form) {
					$(form).ajaxSubmit({
						url: urls.save,
						dataType: 'json',
						type: 'POST',
						cache: false,
						error: function() {
							parent.horizon.notice.error(horizon.lang['message']['operateError']);
						},
						success: function(data) {
							if(data.restype == "success"){
								parent.horizon.notice.success(data.msg[0]);
								$('#systemDictionaryForm').dialog('close');
								$("#systemDictionaryList")[0].contentWindow.horizon.view.dataTable.fnDraw(true);
								var node = operate.getTreeNode();
								dictionaryTree.init(node.id);
			        		 } else {
			        			 parent.horizon.notice.error(data.msg[0]);
			        	     }
				            }
				         });
				     }
				 });
			},
	  		//添加字典
	  		addDict:function(){
		    	formStyle.openStyle();
				$('#sysDictForm')[0].reset();
				$('input[type="hidden"]').val("");
				var node = operate.getTreeNode();
				if(typeof(node)!="undefined"){
                    if(node.id==node.name){
                        $('input[name="parentName"]').val(horizon.lang['platform-dict']['dictManager']);
                        $('input[name="parentId"]').val("root_node_id");
                    }else{
                        $('input[name="parentName"]').val(node.name);
                        $('input[name="parentId"]').val(node.id);
                    }
                    $('input[name="dictType"]').val("system");
                    if(node.pid!="root_node_id"){
                        $("#dictCategory").addClass("hidden");
                    }else{
                        $("#dictCategory").removeClass("hidden");
                        var category = node.name;
                        if(category == horizon.lang['platform-dict']['dictManager']&& node.id=="root_node_id"){
                        	category="";
                        }else if(category == horizon.lang['platform-dict']['noCategory']){
                        	category="";
                        }
                        $('input[name="category"]').val(category);
                    }
				}else{
                    $('input[name="parentName"]').val(horizon.lang['platform-dict']['dictManager']);
                    $('input[name="parentId"]').val("root_node_id");
                    $('input[name="dictType"]').val("system");
                    $("#dictCategory").removeClass("hidden");
				}
				$('#systemDictionaryForm').dialog({
					width: $(window).width() > 750 ? '750' : 'auto',
					height: 'auto',
					maxHeight: $(window).height(),
					title: horizon.lang['platform-dict']['dictInfo'],
					closeText:horizon.lang['base']['close'],
					destroyAfterClose: true,
					open: function(){
						$('input[name="dictName"]').removeAttr("readonly");
						$('input[name="dictCode"]').removeAttr("readonly");
						$('input[name="dictValue"]').removeAttr("readonly");
						$('input[name="dictAbbr"]').removeAttr("readonly");
						$('input[name="status"]').removeAttr("readonly");
						$('#instruction').removeAttr("readonly");
						$("#sysDictForm input[name='parentName']").removeAttr("disabled");
						operate.parentDict();
						$('label[id*="-error"]').remove();
					},
					buttons: [
			           {
						   html:horizon.lang['base']['save'],
						   "class" : "btn-primary",
						   click: function() {
							   $('#sysDictForm').submit();
						   }
					   }
					],
					close:function(){
						$('#sysDict-tree').fadeOut("fast");
						$('label[id*="-error"]').remove();
					}
				});
	  		},
	  		//更新字典
		  	updateDict:function(id,parent_id,categoryName){
	  			var url = $("#systemDictionaryList").attr("src");
				if(url.indexOf("HZ28868f5d0b2f8c015d0b3a10790032")>0){
					if(categoryName=="" || parent_id == "root_node_id"){
						operate.openTree(horizon.lang['platform-dict']['noCategory']);
				  	}else{
						operate.openTree(categoryName);
				  	}
				}
			  	operate.initInfo(id,categoryName);
			  	formStyle.closeStyle();
			  	var node = operate.getTreeNode();
			  	if(node.id == "root_node_id" || node.id==node.name){
			  		$("#dictCategory").removeClass("hidden");
					$('input[name="category"]').val(node.name);
				}else{
					$("#dictCategory").addClass("hidden");
				}
			  	if(parent_id != "root_node_id"){
					$('#systemDictionaryForm').dialog({
						width: $(window).width() > 750 ? '750' : 'auto',
						height: 'auto',
						maxHeight: $(window).height(),
						title: horizon.lang['platform-dict']['dictInfo'],
						closeText:horizon.lang['base']['close'],
						destroyAfterClose: false,
						open:function(){
							$('input[name="dictName"]').removeAttr("readonly");
							$('input[name="dictCode"]').removeAttr("readonly");
							$('input[name="dictValue"]').removeAttr("readonly");
							$('input[name="dictAbbr"]').removeAttr("readonly");
							$('input[name="status"]').removeAttr("readonly");
							$('#instruction').removeAttr("readonly");
							$("#sysDictForm input[name='parentName']").removeAttr("disabled");
							operate.parentDict();
						},
						buttons: [
							{
								html:horizon.lang['base']['save'],
								"class" : "btn-primary",
								click: function() {
									$('#sysDictForm').submit();
								}
							}
						],
						close:function(){
							$('#sysDict-tree').fadeOut("fast");
						}
					});
				}else{
					$('#systemDictionaryForm').dialog({
						width: $(window).width() > 750 ? '750' : 'auto',
						height: 'auto',
						maxHeight: $(window).height(),
						title: horizon.lang['platform-dict']['dictInfo'],
						closeText:horizon.lang['base']['close'],
						destroyAfterClose: false,
						open: function(){
							$('label[id*="-error"]').remove();
							$('input[name="dictName"]').attr("readonly","readonly");
							$('input[name="dictCode"]').attr("readonly","readonly");
							$('input[name="dictValue"]').attr("readonly","readonly");
							$('input[name="dictAbbr"]').attr("readonly","readonly");
							$('input[name="status"]').attr("readonly","readonly");
							$('#instruction').attr("readonly","readonly");
							$("#sysDictForm input[name='parentName']").attr("disabled",true);
						},
						close:function(){
							$('input[name="dictName"]').removeAttr("readonly");
							$('input[name="dictCode"]').removeAttr("readonly");
							$('input[name="dictValue"]').removeAttr("readonly");
							$('input[name="dictAbbr"]').removeAttr("readonly");
							$('input[name="status"]').removeAttr("readonly");
							$('#instruction').removeAttr("readonly");
							$("#sysDictForm input[name='parentName']").removeAttr("disabled");
							operate.parentDict();
						}
					});
				}
		  	}
    	};
		var formStyle = {
	    	openStyle:function(){
	    		$('input[name="dictName"]').parent().addClass("has-error");
				$('input[name="dictCode"]').parent().addClass("has-error");
				$('input[name="dictValue"]').parent().addClass("has-error");
	    	},
	    	closeStyle:function(){
	    		$('.form-group').removeClass('has-error');
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
		var showView={
		 	showSystemDictionaryList:function(){
		    	var viewUrl=horizon.paths.viewpath+"?viewId=HZ28868f5d0b2f8c015d0b3a10790032";
		    	$("#systemDictionaryList").attr("height",_height.tableHeight()).attr("src",viewUrl);
		    },
		 	showSystemDictionaryChildrenList:function(id,pid){
				var childrenUrl=horizon.paths.viewpath+"?viewId=HZ28868f5d106647015d11c14c2a0032&parentId="+id;
			 	var categoryUrl=horizon.paths.viewpath+"?viewId=HZ28868f5d106647015d11c14c2a0032&category="+id;
			 	//分类下显示字典
			 	if(pid == 'root_node_id'){
			 		if(id ==horizon.lang['platform-dict']['noCategory']){
			 			categoryUrl=horizon.paths.viewpath+"?viewId=HZ28868f5d81952e015d81b735b80074";
				 	}
			      	$("#systemDictionaryList").attr("height",_height.tableHeight()).attr("src",categoryUrl);
			 	}else{
				 	//父级字典下显示子字典
				 	$("#systemDictionaryList").attr("height",_height.tableHeight()).attr("src",childrenUrl);
			 	}
		    	$("input[name='category']").attr("readonly","readonly");
		    }
	  	};
		return horizon.manager['systemDictionary'] = {
			init:function(){
				dropTree.onClickDom();
				operate.parentDict();
				dictionaryTree.init("root_node_id");
				showView.showSystemDictionaryList();
				operate.checkForm()
			},
			treeReload:dictionaryTree.init,
			getTreeNode: operate.getTreeNode,
			parentDict:operate.parentDict,
			sysDictDialog:operate.sysDictDialog,
			addDict:operate.addDict,
			updateDict:operate.updateDict
		};
}));