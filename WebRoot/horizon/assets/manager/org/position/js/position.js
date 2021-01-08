/**
 * 岗位视图显示
 * 
 * @author chengll
 */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery', 'ztree', 'jqueryValidateAll', 'jqueryForm',
				'horizonSelectuser' ], factory);
	} else {
		factory(jQuery);
	}
}(function() {
	"use strict";
	var urls = {
		tree : horizon.paths.apppath + '/horizon/manager/org/position/tree.wf',
		posiTree : horizon.paths.apppath + '/horizon/manager/org/position/tree/by/type.wf',
		typeTree : horizon.paths.apppath + '/horizon/manager/org/position/type/tree.wf',
		checkCode : horizon.paths.apppath + '/horizon/manager/org/position/code/check.wf',
		save : horizon.paths.apppath + '/horizon/manager/org/position/save.wf',
		info : horizon.paths.apppath + '/horizon/manager/org/position/info.wf'
	};
	var _height = {
		outerHeight : function() {
			var _height = horizon.tools.getPageContentHeight() - 30;
			return _height;
		}
	};
	// 左侧岗位树
	var positionTree = {
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
					var tree = $.fn.zTree.getZTreeObj("position-tree");
					var node = tree.getNodeByParam("id", treeNode.id);
					tree.selectNode(node, false);// 指定选中ID的节点
					if (treeNode.open) {
						tree.expandNode(node, false, false);// 指定选中ID节点折叠
					} else {
						tree.expandNode(node, true, false);// 指定选中ID节点展开
					}
					if (treeNode.id == "position_root"
						|| treeNode.id == "allPosition") {
						operate.showViewList();
					} else {
						operate.showViewList(treeNode.id);
					}
				},
				onAsyncSuccess : function(event, treeId, treeNode, msg) {
					var tree = $.fn.zTree.getZTreeObj("position-tree");
					var node = tree.getNodeByParam("id", positionTree.nodeId);
					tree.selectNode(node, false);// 指定选中ID的节点
					tree.expandNode(node, true, false);// 指定选中ID节点展开
				}
			}
		},
		init : function(option) {
			positionTree.nodeId = option;
			var $orgTree = $('#position-tree');
			$orgTree = $.fn.zTree.init($orgTree, positionTree.setting);
			var nodes = [ {
				id : "allPosition",
				name : horizon.lang["platform-position"]["allPosition"],
				iconSkin : 'P',
				pid : 'root'
			} ];
			$orgTree.addNodes(null, nodes);
		}
	};
	// 岗位类别选择树
	var selectTypetree = {
		nodeId : '',
		setting : {
			async : {
				url : urls.typeTree,
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
				showLine: false
			},
			callback : {
				onClick : function(event, treeId, treeNode, clickFlag) {
					var tree = $.fn.zTree.getZTreeObj("selType-tree");
					var node = tree.getNodeByParam("id", treeNode.id);
					tree.selectNode(node, false);// 指定选中ID的节点
					tree.expandNode(node, true, false);// 指定选中ID节点展开
					$('input[name="positionTypeId"]').val(treeNode.id);
					$('input[name="positionTypeName"]').val(treeNode.name);
					$("#positionTypeName").dropdown('toggle');
					$('input[name="positionTypeName"]').parent("#positionType").removeClass("has-error");
				},
				onAsyncSuccess : function(event, treeId, treeNode, msg) {
					var tree = $.fn.zTree.getZTreeObj("selType-tree");
					var node = tree.getNodeByParam("id", selectTypetree.nodeId);
					tree.selectNode(node, false);// 指定选中ID的节点
					tree.expandNode(node, true, false);// 指定选中ID节点展开
				}
			}
		},
		init : function() {
			selectTypetree.nodeId = "root_node_id";
			var $orgTree = $('#selType-tree');
			$.fn.zTree.init($orgTree, selectTypetree.setting);
		}
	};
	// 根据已选择的岗位类别选择上级岗位树
	var selPositree = {
		setting : {
			async : {
				url : urls.tree,
				enable : true,
				dataType : "json",
				type : "post",
				otherParam : {
					positionTypeId : 1
				}
			},
			data : {
				simpleData : {
					enable : true,
					pIdKey : "pid"
				}
			},
			view : {
				dblClickExpand : false,
				showIcon : false
			},
			callback : {
				onClick : function(event, treeId, treeNode, clickFlag) {
					$('input[name="parentId"]').val(treeNode.id);
					$('input[name="parentName"]').val(treeNode.name);
					$("#parentName").dropdown('toggle');
					$('input[name="parentName"]').parent("#parentPosition").removeClass("has-error");
				},
				onAsyncSuccess : function(event, treeId, treeNode, msg) {
					var tree = $.fn.zTree.getZTreeObj("selPosi-tree");
					var nodes = tree.getNodes();
					for (var i = 0; i < nodes.length; i++) {
						if (nodes[i].getParentNode() == null) {
							tree.expandNode(nodes[i], true, false);// 指定选中ID节点展开
						}
					}
				}
			}
		},
		init : function(option) {
			var $orgTree = $('#selPosi-tree');
			selPositree.setting.async.otherParam.positionTypeId = option;
			$.fn.zTree.init($orgTree, selPositree.setting);
		}
	};
	var operate = {
		// 点击选择岗位类别事件
		selectType : function() {
			$('input[name="positionTypeName"]').unbind(
				horizon.tools.clickEvent()).bind(
				horizon.tools.clickEvent(), function() {
					selectTypetree.init();
					// 清空上级岗位内容
					$('input[name="parentName"]').val("");
					$('input[name="parentId"]').val("");
				}
			);
		},
		// 点击上级岗位事件
		selectPosition : function() {
			$('input[name="parentName"]').unbind(
				horizon.tools.clickEvent()).bind(
				horizon.tools.clickEvent(),
				function() {
					var typeVal = $('input[name="positionTypeId"]').val();
					if (typeVal == "") {
						horizon.notice.error(horizon.lang["platform-position"]["selectFirstType"]);
					} else {
						selPositree.init(typeVal);
						$("#parentName").attr({"data-toggle" : "dropdown"});
						$("#parentName").dropdown();
					}
				}
			);
		},
		// 点击上级部门事件
		selectDept : function() {
			$('input[name="objectName"]').bind(
				horizon.tools.clickEvent(), function() {
					parent.$.horizon.selectUser({
						idField : 'objectId',
						cnField : 'objectName',
						multiple : true,
						position : false,
						dept : true,
						group : false,
						selectDept : true,
						selectPosition : false,
						selectGroup : false,
						selectUser : false
					});
				}
			);
		},
		showViewList : function(pId) {
			var viewUrl;
			if (pId == null || pId == "" || pId == "root_node_id") {
				viewUrl = horizon.paths.viewpath + "?viewId=HZ2881e55cab001c015cab30f9bd0037";
			} else {
				viewUrl = horizon.paths.viewpath + "?viewId=HZ2881e55cd38f74015cd39a33980064&id=" + pId;
			}
			$("#positionList").attr("height", _height.outerHeight()).attr("src", viewUrl);
		},
		// 显示所有岗位
		showAllPosition : function() {
			$("#allPosition").bind(horizon.tools.clickEvent(),
				function() {
					operate.showViewList();
				}
			);
		}
	};
	var validateForm = {
		checkForm : function() {
			$("#positionForm").validate({
				focusInvalid : false,
				rules : {
					positionCode : {
						isCode : true,
						required : true,
						minlength : 3,
						remote : {
							url : urls.checkCode,
							cache : false,
							data : {
								objectName : function() {
									return $("#positionForm").find('input[name="positionCode"]').val();
								},
								id : function() {
									return $("#positionForm").find('input[name="id"]').val();
								}
							}
						}
					}
				},
				messages : {
					positionCode : {
						minlength :  horizon.lang["platform-validator"]["charactersNum"],
						remote : horizon.lang["platform-position"]["codeExistsError"]
					}
				},
				errorClass : 'help-block no-margin-bottom',
				highlight : function(e) {
					$(e).closest('.form-group').addClass('has-error');
				},
				success : function(e) {
					$(e).closest('.form-group').removeClass('has-error');
					$(e).remove();
				},
				submitHandler : function(form) {
					$(form).ajaxSubmit({
						url : urls.save,
						dataType : 'json',
						type : 'POST',
						cache : false,
						error : function() {
							horizon.notice.error(horizon.lang["message"]["operateError"]);
						},
						success : function(data) {
							if (data.restype == "success") {
								horizon.notice.success(data.msg[0]);
								$('#positionInfo').dialog('close');
								$("#positionList")[0].contentWindow.horizon.view.dataTable.fnDraw(true);
								var treeObj = parent.$.fn.zTree.getZTreeObj("position-tree");
								var nodes = treeObj.getSelectedNodes();
								positionTree.init(nodes[0].id);
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
			},horizon.lang["platform-validator"]["formatCheckName"]);
			jQuery.validator.addMethod("isCode", function(value, element) {
				var tel = /^[A-Za-z0-9]+$/;
				return tel.test(value);
			}, horizon.lang["platform-validator"]["formatIsCode"]);
		}
	};
	var positionOperate = {
		// 打开弹出框
		openDialog : function(id) {
			var tree = $.fn.zTree.getZTreeObj("position-tree");
			var node = tree.getNodeByParam("id", id);
			tree.selectNode(node, false);// 指定选中ID的节点
			tree.expandNode(node, true, false);// 指定选中ID节点展开
			$("#positionForm")[0].reset();
			$("#positionForm").find("input[type='hidden']").val('');
			$("#parentName").removeAttr("data-toggle");
			if (id != null && id != "") {
				$('.form-group').removeClass('has-error');
				$('label[id*="-error"]').remove();
				positionOperate.initInfo(id);
			} else {
				$('input[name="id"]').val('');
				$('label[id*="-error"]').remove();
				$('input[name="positionName"]').parent().addClass('has-error');
				$('input[name="positionCode"]').parent().addClass('has-error');
				$('input[name="positionTypeName"]').parent().addClass('has-error');
				$('input[name="parentName"]').parent().addClass('has-error');
			}
			$('#positionInfo').dialog({
				width : $(window).width() > 750 ? '750' : 'auto',
				height : 'auto',
				maxHeight : $(window).height(),
				title : horizon.lang["platform-position"]["largeTitle"],
				closeText : horizon.lang["base"]["close"],
				buttons : [ {
					html : horizon.lang["base"]["ok"],
					"class" : "btn-primary",
					click : function() {
						$("#positionForm").submit();
					}
				} ]
			});
		},
		initInfo : function(id) {
			if (id != null) {
				$.ajax({
					url : urls.info,
					cache : false,
					dataType : 'json',
					data : {
						"id" : id
					},
					error : function() {
						horizon.notice.error(horizon.lang["message"]["operateError"]);
					},
					success : function(data) {
						if (data) {
							$.each(data, function(key, value) {
								$('#positionForm input[name="' + key + '"]').val(value);
							});
							$('#positionForm input[name="parentId"]').val(data.pid);
						} else {
							horizon.notice.success(horizon.lang["message"]["getInfoFailed"]);
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
	return horizon.manager['position'] = {
		init : function() {
			validateForm.checkForm();
			dropTree.onClickDom();
			positionTree.init("position_root");
			operate.selectType();
			operate.selectPosition();
			operate.selectDept();
			operate.showViewList("");
			operate.showAllPosition();
		},
		treeReload : positionTree.init,
		openForm : positionOperate.openDialog
	};
}));
