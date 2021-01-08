/**
 * 部门信息
 * 
 * @author chengll
 */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery', 'horizonSelectuser', 'ztree', 'jqueryValidateAll',
				'jqueryForm' ], factory);
	} else {
		factory(jQuery);
	}
}(function($) {
	"use strict";
	var urls = {
		checkCode : horizon.paths.apppath + '/horizon/manager/org/dept/code/check.wf',
		save : horizon.paths.apppath + '/horizon/manager/org/dept/save.wf',
		info : horizon.paths.apppath + '/horizon/manager/org/dept/info.wf',
		deptTree : horizon.paths.apppath + '/horizon/manager/org/dept/tree.wf',
		sort : horizon.paths.apppath + '/horizon/manager/org/dept/sort.wf',
		deptDelete : horizon.paths.apppath + '/horizon/manager/org/dept/delete.wf',
		deptPositionDelete : horizon.paths.apppath + '/horizon/manager/org/dept/position/delete.wf'
	};
	var _height = {
		outerHeight : function() {
			var _height = horizon.tools.getPageContentHeight() - 30;
			return _height;
		}
	};
	// 部门树
	var deptTree = {
		nodeId : '',
		setting : {
			async : {
				url : urls.deptTree,
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
				beforeClick : function() {
				},
				onClick : function(event, treeId, treeNode, clickFlag) {
					var tree = $.fn.zTree.getZTreeObj("dept-tree");
					var node = tree.getNodeByParam("id", treeNode.id);
					tree.selectNode(node, false);// 指定选中ID的节点
					if (treeNode.open) {
						tree.expandNode(node, false, false);// 指定选中ID节点折叠
					} else {
						tree.expandNode(node, true, false);// 指定选中ID节点展开
					}
					if (treeNode.id != "dept_root"
						&& treeNode.id != "allDept") {
						deptForm.updateForm(treeNode.id);
						$('#deptInfo').removeClass("hidden");
						$('#deptIfream').addClass("hidden");
						// 禁止岗位页签
						$('#myTab a:first').tab('show');
						$('#liPosi').removeClass("hidden");
						$('[data-pane="posiInfo"]').removeClass("hidden");
						
					} else if (treeNode.id == "allDept") {
						$('#return').addClass("hidden");
						$('#deptInfo').addClass("hidden");
						$('#deptIfream').removeClass("hidden");
						$('#baseInfo').addClass("hidden");
						$('#up').addClass("hidden");
						$('#down').addClass("hidden");
						showView.showDeptList();
					}
				},
				onAsyncSuccess : function(event, treeId, treeNode, msg) {
					var tree = $.fn.zTree.getZTreeObj("dept-tree");
					var node = tree.getNodeByParam("id", deptTree.nodeId);
					tree.selectNode(node, false);// 指定选中ID的节点
					tree.expandNode(node, true, false);// 指定选中ID节点展开
				}
			}
		},
		init : function() {
			deptTree.nodeId = "dept_root";
			var $orgTree = $('#dept-tree');
			$orgTree = $.fn.zTree.init($orgTree, deptTree.setting);
			var nodes = [ {
				id : "allDept",
				name : horizon.lang["platform-dept"]["allDept"],
				iconSkin : 'D',
				pid : 'root'
			} ];
			$orgTree.addNodes(null, nodes);
		}
	};
	// 页面功能
	var operate = {
		checkForm : function() {
            //验证部门名称
            jQuery.validator.addMethod('deptName', function(value, element) {
                if(value != null && value != ''){
                    var tel = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
                    return tel.test(value);
                }
                return true;
            }, horizon.lang["platform-validator"]["formatCheckName"]);
			return $("#deptForm").validate({
				ignore : '.ignore',
				rules : {
                    deptName:{
                        deptName:true
                    },
					deptCode : {
						remote : {
							url : urls.checkCode,
							cache : false,
							data : {
								deptCode : function() {
									return $('#deptForm').find('input[name="deptCode"]').val();
								},
								id : function() {
									return $('#deptForm').find('input[name="id"]').val();
								}
							}
						}
					}
				},
				messages : {
					deptCode : {
						remote : horizon.lang["platform-dept"]["codeExistsError"]
					}
				},
				errorPlacement : function(error, element) {
					var $formGroup = $(element)
						.closest('.form-group');
					if ($formGroup.find('.help-block').length)
						return;
					$formGroup.append(error);
				},
				errorClass : 'help-block no-margin-bottom',
				focusInvalid : false,
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
						type : 'post',
						cache : false,
						error : function() {
							horizon.notice.error(horizon.lang["message"]["operateError"]);
						},
						success : function(data) {
							if (data.restype == "success") {
								horizon.notice.success(data.msg[0]);
								pageOperate.pageReturn();
								$("#deptList")[0].contentWindow.horizon.view.dataTable.fnDraw(true);
							} else {
								horizon.notice.error(data.msg[0]);
							}
						}
					});
				}
			});
		}
	};
	// 打开视图
	var showView = {
		showPositionList : function(deptId) {
			var viewUrl = horizon.paths.viewpath + "?viewId=HZ2881e55cbf37c4015cbf4821830064&deptId=" + deptId;
			$("#posiList").attr("height", _height.outerHeight() - $(".tab").height() - 20).attr("src", viewUrl);
			$('#posiList').removeClass("hidden");
			$('#deptList').addClass("hidden");
			$('#puser').addClass("hidden");
		},
		showDeptList : function() {
			var viewUrl = horizon.paths.viewpath + "?viewId=HZ2881e55cbe09c3015cbe5d9fec00c8&service=deptViewServiceImpl";
			$("#deptList").attr("height", _height.outerHeight()).attr("src", viewUrl);
			$('#posiList').addClass("hidden");
			$('#deptList').removeClass("hidden");
			$('#puser').addClass("hidden");
		}
	};
	function event() {
		//用户性别选择
        $('input[name="unit"]').change(function(){
            var $this = $(this);
            $(document).find("input[name='unit']").each(function(){
                if($(this).val()==$this.val()){
                    $(this).parent().addClass("btn-primary");
                }else{
                    $(this).parent().removeClass("btn-primary");
                }
            });
        });
		// 点击重置按钮
		$("#replacement").bind(
			horizon.tools.clickEvent(),
			function() {
				$('#deptForm')[0].reset();
				$('#deptForm').find("input[type='hidden']").val('');
				$('label[id*="-error"]').remove();
				$('input[name="deptName"]').parent().addClass('has-error');
				$('input[name="deptCode"]').parent().addClass('has-error');
				$('input[name="parentName"]').parent().addClass('has-error');
			});
		// 设置根节点
		$("#setnode").bind(
			horizon.tools.clickEvent(),
			function() {
				$("input[name='parentId']").val("D_root_node_id");
				$('input[name="parentName"]').parent().removeClass('has-error');
				$('input[name="parentName"]').parent().parent().removeClass('has-error');
				$('label[id="parentName-error"]').remove();
				$('input[name="parentName"]').val(horizon.lang["platform-dept"]["navigate"]);
			}
		);
		// 部门上移
		$("#up").bind(
			horizon.tools.clickEvent(),
			function() {
				var parentId = $("input[name='parentId']").val(); // 上级部门id
				var deptId = $("input[type='hidden'][name='id']").val(); // 部门id
				var orderNo = $("input[type='hidden'][name='orderNo']").val();// 部门排序值
				$.ajax({
					type : "POST",
					data : {
						parentId : parentId,
						id : deptId,
						orderNo : orderNo,
						type : "up"
					},
					url : urls.sort,
					dataType : "json",
					error : function() {
						horizon.notice.error(horizon.lang["message"]["operateError"]);
					},
					success : function(data) {
						if (data.restype == "success") {
							horizon.notice.success(data.msg[0]);
							deptTree.nodeId = deptId;
							var treeObj = $.fn.zTree.getZTreeObj("dept-tree");
							treeObj.reAsyncChildNodes(null, "refresh");
						} else {
							horizon.notice.error(data.msg[0])
						}
					}
				});
			}
		);
		// 部门下移
		$("#down").bind(
			horizon.tools.clickEvent(),
			function() {
				var parentId = $("input[name='parentId']").val(); // 上级部门id
				var deptId = $("input[type='hidden'][name='id']").val(); // 部门id
				var orderNo = $("input[type='hidden'][name='orderNo']").val();// 部门排序值
				$.ajax({
					type : "POST",
					data : {
						parentId : parentId,
						id : deptId,
						orderNo : orderNo,
						type : "down"
					},
					url : urls.sort,
					dataType : "json",
					error : function() {
						horizon.notice.error(horizon.lang["message"]["operateError"]);
					},
					success : function(data) {
						if (data.restype == "success") {
							horizon.notice.success(data.msg[0]);
							deptTree.nodeId = deptId;
							var treeObj = $.fn.zTree.getZTreeObj("dept-tree");
							treeObj.reAsyncChildNodes(null, "refresh");
						} else {
							horizon.notice.error(data.msg[0]);
						}
					}
				});
			}
		);
		// 部门负责人
		$('input[name="no1LeaderName"]').bind(
			horizon.tools.clickEvent(), function() {
				$.horizon.selectUser({
					idField : 'no1LeaderId',
					cnField : 'no1LeaderName',
					multiple : false,
					selectDept : false,
					selectPosition : false,
					selectGroup : false
				});
			}
		);
		// 部门接口人
		$('input[name="humanInterName"]').bind(
			horizon.tools.clickEvent(), function() {
				$.horizon.selectUser({
					idField : 'humanInterId',
					cnField : 'humanInterName',
					multiple : true,
					selectDept : false,
					selectPosition : false,
					selectGroup : false
				});
			}
		);
		// 部门管理员
		$('input[name="adminName"]').bind(horizon.tools.clickEvent(),
			function() {
			$.horizon.selectUser({
					idField : 'adminId',
					cnField : 'adminName',
					multiple : true,
					selectDept : false,
					selectPosition : false,
					selectGroup : false
				});
			}
		);
		// 上级主管领导
		$('input[name="upLeaderName"]').bind(
			horizon.tools.clickEvent(), function() {
				$.horizon.selectUser({
					idField : 'upLeaderId',
					cnField : 'upLeaderName',
					multiple : false,
					selectDept : false,
					selectPosition : false,
					selectGroup : false
				});
			});
		// 上级部门
		$('input[name="parentName"]').bind(
			horizon.tools.clickEvent(),
			function() {
				$.horizon.selectUser({
					idField : 'parentId',
					cnField : 'parentName',
					multiple : false,
					selectDept : true,
					selectPosition : false,
					selectGroup : false,
					selectUser : false,
					dept : true,
					position : false,
					group : false,
					role : false,
				});
				$('input[name="parentName"]').parent().removeClass('has-error');
				$('input[name="parentName"]').parent().parent().removeClass('has-error');
				$('label[id="parentName-error"]').remove();
			}
		);
		// 部门返回按钮
		$("#return").bind(horizon.tools.clickEvent(), function() {
			pageOperate.pageReturn();
		});
		$("#allDept").bind(horizon.tools.clickEvent(), function() {
			$('#deptInfo').addClass("hidden");
			$('#deptIfream').removeClass("hidden");
			$('#positionInfo').addClass("hidden");
			$('#baseInfo').addClass("hidden");
			$('#close').addClass("hidden");
			$('#up').addClass("hidden");
			$('#down').addClass("hidden");
			showView.showDeptList();
			deptTree.nodeId = "dept_root";
			var treeObj = $.fn.zTree.getZTreeObj("dept-tree");
			treeObj.reAsyncChildNodes(null, "refresh");
		});
	}
	// 页面操作
	var pageOperate = {
		// 页面返回
		pageReturn : function() {
			if ($('#deptList').hasClass('hidden')) {
				if ($('#deptInfo').hasClass('hidden')) {
					$("#puser").addClass("hidden");
					$("#deptInfo").removeClass("hidden");
					$("#posiList")[0].contentWindow.horizon.view.dataTable.fnDraw(true);
				} else {
					$("#return").addClass("hidden");
					$("#deptInfo").addClass("hidden");
					$('#deptList').removeClass("hidden");
					deptTree.nodeId = "dept_root";
					var treeObj = $.fn.zTree.getZTreeObj("dept-tree");
					treeObj.reAsyncChildNodes(null, "refresh");
					var nodes = [ {
						id : "allDept",
						name :horizon.lang["platform-dept"]["allDept"],
						iconSkin : 'F',
						pid : 'root'
					} ];
					treeObj.addNodes(null, nodes);
					$("#deptList")[0].contentWindow.horizon.view.dataTable.fnDraw(true);
				}
			}
		}
	};
	// 部门操作
	var deptForm = {
		// 打开添加部门页面
		openFrom : function() {
			$("#deptForm")[0].reset();
			$("#deptForm").find("input[type='hidden']").val('');
			// 清除验证信息
			$('label[id*="-error"]').remove();
			$('input[name="deptName"]').parent().addClass('has-error');
			$('input[name="deptCode"]').parent().addClass('has-error');
            var treeObj = $.fn.zTree.getZTreeObj("dept-tree");
            var selectedNode = treeObj.getSelectedNodes()[0];
            if (selectedNode){
                $('input[name="parentName"]').val(selectedNode.name);
                $('input[name="parentId"]').val(selectedNode.fixId);
            }else {
                $('input[name="parentName"]').parent().addClass('has-error');
            }
			$('#deptInfo').removeClass("hidden");
			$('#deptList').addClass("hidden");
			$('#up').addClass("hidden");
			$('#down').addClass("hidden");
			$('#replacement').removeClass('hidden');
			$("#return").removeClass("hidden");
			// 禁止岗位页签
			$('#myTab a:first').tab('show');
			$('#liPosi').addClass("hidden");
			$('[data-pane="posiInfo"]').addClass("hidden");
			$(document).find("input[name='unit']").each(function(){
                if($(this).val()=="0"){
                    $(this).prop("checked",true).parent().addClass("active").addClass("btn-primary");
                }else{
                    $(this).prop("checked",false).parent().removeClass("active").removeClass("btn-primary");
                }
            });
		},
		// 打开更新部门页面
		updateForm : function(id) {
			deptForm.deptData(id);
		},
		// 查询单个部门信息
		deptData : function(id) {
			$.ajax({
				type : "POST",
				data : {
					id : id
				},
				url : urls.info,
				dataType : "json",
				success : function(data) {
					if (data != null && data != "/error/403") {
						showView.showPositionList(id);
						$('#liPosi').removeClass("hidden");
						$('[data-pane="posiInfo"]').removeClass("hidden");
						$('.form-group').removeClass('has-error');
						$('label[id*="-error"]').remove();
						$('#deptInfo').removeClass("hidden");
						$('#deptList').addClass("hidden");
						$('#myTab a:first').tab('show');
						$('[data-pane="baseInfo"]').addClass('in active');
						$('[data-pane="posiInfo"]').removeClass("in active");
						$('#posiList').removeClass("hidden");
						$('#up').removeClass("hidden");
						$('#down').removeClass("hidden");
						$('#replacement').addClass('hidden');
						$("#return").removeClass("hidden");
						locateTree.openNode("dept-tree", "id", id);
						showView.showPositionList(id);
						$('#deptForm')[0].reset();
						$('#deptForm').find("input[type='hidden']").val('');
						deptForm.addData(data);
					}
				}
			});
		},
		// 部门信息回显
		addData : function(data) {
			$.each(data, function(key, value) {
				var $form = $('#deptForm', window.parent.document);
				$form.find('input[type="text"][name="' + key + '"]').val(value);
				$form.find('textarea[name="' + key + '"]').val(value);
				$form.find('input[type="hidden"][name="' + key + '"]').val(value);
			});
			$(parent.document).find("input[name='unit']").each(function(){
                if($(this).val() == data.unit){
                    $(this).prop("checked",true).parent().addClass("active").addClass("btn-primary");
                }else{
                    $(this).prop("checked",false).parent().removeClass("active").removeClass("btn-primary");
                }
            });
		}
	};
	// 部门下对岗位的操作
	var positionOperate = {
		// 打开position页面
		openPosition : function(deptId, positionId) {
			var viewUrl = horizon.paths.viewpath
				+ "?viewId=HZ2886865ce37555015ce3b8e8bc0065&deptId="
				+ deptId + "&positionId=" + positionId
				+ "&service=positionUserServiceImpl";
			$("#puser").removeClass("hidden");
			$("#deptInfo").addClass("hidden");
			$("#puserList").attr("height", _height.outerHeight()).attr(
				"src", viewUrl);
		}
	};
	var locateTree = {
		openNode : function(divId, key, value, scope) {
			var tree = $.fn.zTree.getZTreeObj(divId);
			var node = tree.getNodeByParam(key, value);
			tree.selectNode(node, false);// 指定选中ID的节点
		},
		/**
		 * 刷新当前节点
		 */
		refreshNode : function() {
			var treeObj = $.fn.zTree.getZTreeObj("dept-tree");
			treeObj.reAsyncChildNodes(null, "refresh");
		}
	};
	return horizon.manager['dept'] = {
		init : function() {
			deptTree.init();
			showView.showDeptList();
			event();
			operate.checkForm();
		},
		treeReload : deptTree.init,
		treeRefresh : locateTree.refreshNode,
		table : _height.outerHeight,
		locateTree : locateTree.openNode,
		verifyForm : operate.checkForm,
		// 更新部门
		echoInformation : deptForm.updateForm,
		// 添加部门
		openInformation : deptForm.openFrom,
		// 岗位
		openPosition : positionOperate.openPosition
	};
}));