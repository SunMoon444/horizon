/**
 * 岗位类别设置视图显示
 * 
 * @author chengll
 */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery', 'ztree', 'jqueryValidateAll', 'jqueryForm' ],
				factory);
	} else {
		factory(jQuery);
	}
}(function($) {
	"use strict";
	var urls = {
		tree : horizon.paths.apppath + '/horizon/manager/org/position/type/tree.wf',
		checkCode : horizon.paths.apppath + '/horizon/manager/org/position/type/code/check.wf',
		save : horizon.paths.apppath + '/horizon/manager/org/position/type/save.wf',
		info : horizon.paths.apppath + '/horizon/manager/org/position/type/info.wf'
	};
	var _height = {
		outerHeight : function() {
			var _height = horizon.tools.getPageContentHeight() - 30;
			return _height;
		}
	};
	var selectTypetree = {
		nodeId : '',
		setting : {
			async : {
				url : urls.tree,
				enable : true,
				dataType : "json",
				type : "post"
			},
			data : {
				simpleData : {
					enable : true,
					pIdKey : "pid"
				}
			},
			view : {
				dblClickExpand : false,
				showIcon : false,
				showLine : false
			},
			callback : {
				onClick : function(event, treeId, treeNode, clickFlag) {
					$('input[name="parentId"]').val(treeNode.id);
					$('input[name="parentName"]').val(treeNode.name);
					$("#parentName").dropdown('toggle');
					$('input[name="parentName"]').parent("#parentType").removeClass("has-error");
				},
				onAsyncSuccess : function(event, treeId, treeNode, msg) {
					var tree = $.fn.zTree.getZTreeObj("selectType-tree");
					var node = tree.getNodeByParam("id", selectTypetree.nodeId);
					tree.selectNode(node, false);// 指定选中ID的节点
					tree.expandNode(node, true, false);// 指定选中ID节点展开
				}
			}
		},
		init : function() {
			selectTypetree.nodeId = "root_node_id";
			var $orgTree = $('#selectType-tree');
			$.fn.zTree.init($orgTree, selectTypetree.setting);
		}
	};
	var typeTree = {
		nodeId : "",
		setting : {
			async : {
				url : urls.tree,
				enable : true,
				dataType : "json",
				type : "post"
			},
			data : {
				simpleData : {
					enable : true,
					pIdKey : "pid"
				}
			},
			view : {
				dblClickExpand : false,
				showIcon : false,
				showLine : false
			},
			callback : {
				onClick : function(event, treeId, treeNode, clickFlag) {
					var tree = $.fn.zTree.getZTreeObj("type-tree");
					var node = tree.getNodeByParam("id", treeNode.id);
					tree.selectNode(node, false);// 指定选中ID的节点
					if (treeNode.open) {
						tree.expandNode(node, false, false);// 指定选中ID节点折叠
					} else {
						tree.expandNode(node, true, false);// 指定选中ID节点展开
					}
					if (treeNode.id == "allType") {
						operate.showViewList("root_node_id");
					} else {
						operate.showViewList(treeNode.id);
					}
				},
				onAsyncSuccess : function(event, treeId, treeNode, msg) {
					var tree = $.fn.zTree.getZTreeObj("type-tree");
					var node = tree.getNodeByParam("id", typeTree.nodeId);
					tree.selectNode(node, false);// 指定选中ID的节点
					tree.expandNode(node, true, false);// 指定选中ID节点展开
				}
			}
		},
		init : function(option) {
			typeTree.nodeId = option;
			var $orgTree = $('#type-tree');
			$orgTree = $.fn.zTree.init($orgTree, typeTree.setting);
			var nodes = [ {
				id : "allType",
				name : horizon.lang["platform-positiontype"]["allType"],
				iconSkin : 'P',
				pid : 'root'
			} ];
			$orgTree.addNodes(null, nodes);
		}
	};
	var operate = {
		// 显示所有岗位类别
		showAllPosition : function() {
			$("#allPositionType").bind(horizon.tools.clickEvent(), function() {
				operate.showViewList("");
			});
		},
		// 点击上级类别事件
		selParentType : function() {
			$('input[name="parentName"]').unbind(
				horizon.tools.clickEvent()).bind(
				horizon.tools.clickEvent(), function() {
					selectTypetree.init();
				}
			);
		},
		showViewList : function(pId) {
			var viewUrl;
			if (pId == null || pId == "" || pId == "root_node_id") {
				viewUrl = horizon.paths.viewpath + "?viewId=HZ2881e55cd265bc015cd2789a430064";
			} else {
				viewUrl = horizon.paths.viewpath + "?viewId=HZ2881e55c99e3d2015c99f6f6a80032&typeId=" + pId;
			}
			$("#typeList").attr("height", _height.outerHeight()).attr("src", viewUrl);
		}
	};
	var validateForm = {
		checkForm : function() {
			$("#positiontypeForm").validate({
				ignore : '.ignore',
				focusInvalid : false,
				errorClass : 'help-block no-margin-bottom',
				rules : {
					categoryCode : {
						isCode : true,
						minlength : 3,
						required : true,
						remote : {
							url : urls.checkCode,
							cache : false,
							data : {
								objectName : function() {
									return $("#positiontypeForm").find('input[name="categoryCode"]').val();
								},
								id : function() {
									return $("#positiontypeForm").find('input[name="id"]').val();
								}
							}
						}
					}
				},
				messages : {
					categoryCode : {
						minlength : horizon.lang["platform-validator"]["charactersNum"],
						remote : horizon.lang["platform-positiontype"]["codeExistsError"],
						required : horizon.lang["platform-validator"]["charactersRequired"]
					}
				},
				highlight : function(e) {
					$(e).closest('.form-group').addClass('has-error');
				},
				success : function(e) {
					$(e).closest('.form-group').removeClass('has-error');
					$(e).remove();
				},
				submitHandler : function(form) {
					$(form).ajaxSubmit({
						url : horizon.paths.apppath + '/horizon/manager/org/position/type/save.wf',
						dataType : 'json',
						type : 'POST',
						cache : false,
						error : function() {
							parent.horizon.notice.error(horizon.lang["message"]["operateError"]);
						},
						success : function(data) {
							if (data.restype == "success") {
								horizon.notice.success(data.msg[0]);
								$('#positiontypeInfo').dialog('close');
								$("#typeList")[0].contentWindow.horizon.view.dataTable.fnDraw(true);
								var treeObj = $.fn.zTree.getZTreeObj("type-tree");
								var nodes = treeObj.getSelectedNodes();
								typeTree.init(nodes[0].id);
							} else {
								horizon.notice.error(data.msg[0]);
							}
						}
					});
				}
			});
			jQuery.validator.addMethod('checkName', function(value, element) {
				var tel = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
				return tel.test(value);
			}, horizon.lang["platform-validator"]["formatCheckName"]);
			jQuery.validator.addMethod("isCode", function(value, element) {
				var tel = /^[A-Za-z0-9]+$/;
				return tel.test(value);
			}, horizon.lang["platform-validator"]["formatIsCode"]);
		}
	};
	var typeOperate = {
		openForm : function(id) {
			var tree = $.fn.zTree.getZTreeObj("type-tree");
			var node = tree.getNodeByParam("id", id);
			tree.selectNode(node, false);// 指定选中ID的节点
			tree.expandNode(node, true, false);// 指定选中ID节点展开
			$("#positiontypeForm")[0].reset();
			if (id != null && id != "") {
				typeOperate.initInfo(id);
				$('.form-group').removeClass('has-error');
				$('label[id*="-error"]').remove();
			} else {
				$('input[name="id"]').val('');
				$('label[id*="-error"]').remove();
				$('input[name="categoryName"]').parent().addClass('has-error');
				$('input[name="categoryCode"]').parent().addClass('has-error');
				$('input[name="parentName"]').parent().addClass('has-error');
			}
			$('#positiontypeInfo').dialog({
				width : $(window).width() > 750 ? '750' : 'auto',
				height : 'auto',
				maxHeight : $(window).height(),
				title :horizon.lang["platform-positiontype"]["largeTitle"],
				closeText : horizon.lang["base"]["close"],
				buttons : [ {
					html :horizon.lang["base"]["save"],
					"class" : "btn-primary",
					click : function() {
						$("#positiontypeForm").submit();
					}
				}]
			});
		},
		initInfo : function(id) {
			if (id != null) {
				$.ajax({
					url : urls.info,
					cache : false,
					dataType : 'json',
					data : {
						"typeId" : id
					},
					error : function() {
						horizon.notice.error(horizon.lang["message"]["operateError"]);
					},
					success : function(data) {
						if (data) {
							$.each(data, function(i, key) {
								$('#positiontypeForm input[name="' + i + '"]').val(key);
							});
							$('textarea[name="comments"]').val(data.comments);
						} else {
							horizon.notice.error(horizon.lang["message"]["getInfoFailed"]);
						}
					}
				});
			}
		}
	};
	var dropTree = {
		onClickDom : function() {
			$(".select-tree").on('click', function(e) {
				e.stopPropagation();
			}).ace_scroll({
				size : 180
			});
		}
	};
	return horizon.manager['positiontype'] = {
		init : function() {
			validateForm.checkForm();
			dropTree.onClickDom();
			typeTree.init("root_node_id");
			operate.selParentType();
			operate.showViewList("");
			operate.showAllPosition();
		},
		treeReload : typeTree.init,
		openForm : typeOperate.openForm
	};
}));
