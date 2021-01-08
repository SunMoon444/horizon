/**
 * 角色信息
 * @author chengll
 */
(function (factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery', 'jqueryValidateAll','horizonSelectuser','ztree'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
	"use strict";
	var urls ={
		roleInfo:horizon.paths.apppath+'/horizon/manager/role/auth/search/role/info.wf',
		resourceTree:horizon.paths.apppath+'/horizon/manager/role/auth/search/resource/tree.wf'
	};
	var _height = {
		outerHeight: function() {
			var _height = horizon.tools.getPageContentHeight(),
				$pageHeader = $('.page-header');
			if($pageHeader.css('display') != 'none') {
				_height -= $pageHeader.outerHeight(true);
			}
			return _height;
		},
		treeHeight: function() {
			var outerHeight = _height.outerHeight();
			return outerHeight-290;
		},
		aceHeight:function(){
			var outerHeight = _height.outerHeight();
			outerHeight = outerHeight-parseInt($(".aceheight").height())*2
				-parseInt($(".aceHeight").height())*2
				- parseInt($('.page-content').css('paddingTop')) * 2
				-parseInt($('.formheight').height());
			return outerHeight;
		}
	};
	function getHtml($tree,treeNode){
		var ss = '<span id="' + treeNode.tId + '_auth" class="auth pull-right" >';
		if(treeNode.visit=="1"){
			ss = ss+'<label class="inline"><span class="lbl middle" style="margin-right: 20px">' + horizon.lang['platform-permission-retrieval']['access'] + '</span></label>';
		}
		if(treeNode.design=="1"){
			ss = ss+'<label class="inline"><span class="lbl middle" style="margin-right: 20px">' + horizon.lang['platform-permission-retrieval']['design'] + '</span></label>';
		}
		if(treeNode.manage=="1"){
			ss = ss+'<label class="inline"><span class="lbl middle" style="margin-right: 20px">' + horizon.lang['platform-permission-retrieval']['management'] + '</span></label>';
		}
		if(treeNode.grant=="1"){
			ss = ss+'<label class="inline"><span class="lbl middle" style="margin-right: 20px">' + horizon.lang['platform-permission-retrieval']['gradingAuthorization'] + '</span></label>';
		}
		ss = ss+"</span>";
		$tree.append(ss);
	}
	//添加自定义控件
	function addDiyDom(treeId, treeNode) {
		var $tree = $("#" + treeNode.tId + "_a");
		if(treeId == "appMenu" || treeId == "sysMenu" ){
			getHtml($tree,treeNode);
		}
		else if(treeId == "org"){
			getHtml($tree,treeNode);
		}
		else if(treeId == "module"){
			getHtml($tree,treeNode);
		}
		else if (treeId == "flow"){
			getHtml($tree,treeNode);
		}
    }
	//组织机构树结构
	var orgInfoTree = {
		setting: {
			async: {
				url:urls.resourceTree,
				enable: true,
				dataType: "json",
				type:"post",
				otherParam:{
					userId:1,
					resId:"org"
				}
			},
			data : {
				simpleData : {
					enable : true,
					pIdKey : "pid"
				}
			},
			view: {
				showLine: false,
				selectedMulti: false,
				dblClickExpand: false,
				showIcon: false,
				addDiyDom: addDiyDom
			},
			callback: {
				onClick: function(event, treeId, treeNode) {
					//展开节点
					operate.openNode("org",treeNode);
				}
			}
		},
		init: function(option1) {
			var $orgTree = $('#org');
			orgInfoTree.setting.async.otherParam.userId=option1;
			$.fn.zTree.init($orgTree, orgInfoTree.setting);
		}
	};
	//系统菜单树结构
	var sysmenuInfoTree = {
		setting: {
			async: {
				url:urls.resourceTree,
				enable: true,
				dataType: "json",
				type:"post",
				otherParam:{
					userId:1,
					resId:"sysMenu"
				}
			},
			data : {
				simpleData : {
					enable : true,
					pIdKey : "pid"
				}
			},
			view: {
				showLine: false,
				selectedMulti: false,
				dblClickExpand: false,
				showIcon: false,
				addDiyDom: addDiyDom
			},
			callback: {
				onClick: function(event, treeId, treeNode) {
					//展开节点
					operate.openNode("sysMenu",treeNode);
				}
			}
		},
		init: function(option1) {
			var $orgTree = $('#sysMenu');
			sysmenuInfoTree.setting.async.otherParam.userId=option1;
			$.fn.zTree.init($orgTree, sysmenuInfoTree.setting);
		}
	};
	//应用菜单树结构
	var appmenuInfoTree = {
		setting: {
			async: {
				url:urls.resourceTree,
				enable: true,
				dataType: "json",
				type:"post",
				otherParam:{
					userId:1,
					resId:"appMenu"
				}
			},
			data : {
				simpleData : {
					enable : true,
					pIdKey : "pid"
				}
			},
			view: {
				showLine: false,
				selectedMulti: false,
				dblClickExpand: false,
				showIcon: false,
				addDiyDom: addDiyDom
			},
			callback: {
				onClick: function(event, treeId, treeNode) {
					//展开节点
					operate.openNode("appMenu",treeNode);
				}
			}
		},
		init: function(option1) {
			var $orgTree = $('#appMenu');
			appmenuInfoTree.setting.async.otherParam.userId=option1;
			$.fn.zTree.init($orgTree, appmenuInfoTree.setting);
		}
	};
	//模块树结构
	var moduleInfoTree = {
		setting: {
			async: {
				url:urls.resourceTree,
				enable: true,
				dataType: "json",
				type:"post",
				otherParam:{
					userId:1,
					resId:"module"
				}
			},
			data : {
				simpleData : {
					enable : true,
					pIdKey : "pid"
				}
			},
			view: {
				showLine: false,
				selectedMulti: false,
				dblClickExpand: false,
				showIcon: false,
				addDiyDom: addDiyDom
			},
			callback: {
				onClick: function(event, treeId, treeNode) {
					//展开节点
					operate.openNode("module",treeNode);
				}
			}
		},
		init: function(option1) {
			var $orgTree = $('#module');
			moduleInfoTree.setting.async.otherParam.userId=option1;
			$.fn.zTree.init($orgTree, moduleInfoTree.setting);
		}
	};
	//流程树结构
	var flowInfoTree = {
		setting: {
			async: {
				url:urls.resourceTree,
				enable: true,
				dataType: "json",
				type:"post",
				otherParam:{
					userId:1,
					resId:"rootFlow"
				}
			},
			data : {
				simpleData : {
					enable : true,
					pIdKey : "pid"
				}
			},
			view: {
				showLine: false,
				selectedMulti: false,
				dblClickExpand: false,
				showIcon: false,
				addDiyDom: addDiyDom
			},
			callback: {
				onClick: function(event, treeId, treeNode) {
					//展开节点
					operate.openNode("flow",treeNode);
				}
			}
		},
		init: function(option1) {
			var $orgTree = $('#flow');
			flowInfoTree.setting.async.otherParam.userId=option1;
			$.fn.zTree.init($orgTree, flowInfoTree.setting);
		}
	};
	var showResult={
		showRoleResult:function(id) {
			if (id) {
				$.ajax({
					data: {userId: id},
					url: urls.roleInfo,
					cache: false,
					dataType: 'json',
					error: function () {
						horizon.notice.error(horizon.lang['message']['operateError']);
					},
					success: function (data) {
						$("#rolelist").html("");
						if (data.status) {
							var roles = data.roles;
							for (var i = 0; i < roles.length; i++) {
								$("#rolelist").append("<li><i class='ace-icon fa fa-caret-right blue'></i>" + roles[i].roleName + "</li>");
							}
							operate.switchTab("appSpacePermissions");
							$("#tt").attr("disabled", "disabled");
							operate.spacePermissions();
						} else {
							horizon.notice.error(data.msg ? data.msg : horizon.lang['platform-permission-retrieval']['queryFailed']);
						}
					}
				});
			}else{
				horizon.notice.error(horizon.lang['platform-permission-retrieval']['noStaffSelected']);
			}
		}
	};
	function event(){
		//单击第一个搜索按钮时，隐藏大搜索框，显示搜索结果
		$('#search').bind("click",function(){
			//显示结果
			var id = $('input[name="userId"]').val();
			if(id) {
				showResult.showRoleResult(id);
			}else {
				horizon.notice.error(horizon.lang['platform-permission-retrieval']['noStaffSelected']);
			}
		});
		//回显应用空间中的权限数据
		$('#appSpacePermissions').bind("click",function() {
			operate.spacePermissions();
			$("#collapseAll").addClass("hidden");
			$("#openAll").addClass("hidden");
		});
		//回显组织机构中的权限数据
		$('#orgPermissions').bind("click",function() {
			$("#openAll").removeClass("hidden");
			$("#collapseAll").addClass("hidden");
			orgInfoTree.init($('input[name="userId"]').val());
		});
		//回显系统菜单中的权限数据
		$('#sysMenuPermissions').bind("click",function() {
			$("#openAll").removeClass("hidden");
			$("#collapseAll").addClass("hidden");
			sysmenuInfoTree.init($('input[name="userId"]').val());
		});
		//回显应用菜单中的权限数据
		$('#appMenuPermissions').bind("click",function() {
			$("#openAll").removeClass("hidden");
			$("#collapseAll").addClass("hidden");
			appmenuInfoTree.init($('input[name="userId"]').val());
		});
		//回显模块中的权限数据
		$('#modulePermissions').bind("click",function() {
			$("#openAll").removeClass("hidden");
			$("#collapseAll").addClass("hidden");
			moduleInfoTree.init($('input[name="userId"]').val());
		});
		//回显流程中的权限数据
		$('#flowPermissions').bind("click",function() {
			$("#openAll").removeClass("hidden");
			$("#collapseAll").addClass("hidden");
			flowInfoTree.init($('input[name="userId"]').val());
		});
		//设置高度
		$(".searchResult").height(_height.aceHeight).ace_scroll({
			size:_height.aceHeight()
		});
		//切换tab
		$("#switchtab").find("li").click(function(){
			$("#switchtab").find("li").removeClass("active");
			$(this).addClass("active");
			$("#tab").children().removeClass("in active");
			$("#tt").find("span").text($(this).find("a").text());
			$("#tt").find("span").append(' <i class="ace-icon fa fa-angle-down icon-on-right"></i>');
			var b=$(this).find("a").attr("data-target").substring(12,21);
			$("#tab").children().each(function(){
				if($(this).attr("data-pane") == b){
					$(this).addClass("in active");
				}
			});
		});
		//用户范围
		$('input[name="userName"]').bind(horizon.tools.clickEvent(),function() {
			$.horizon.selectUser({
				idField: 'userId',
				cnField: 'userName',
				multiple: false,
				selectDept: false,
				selectPosition: false,
				selectGroup: false
			});
		});
		//展开所有
		$("#openAll").click(function(e){
			var bizType=$("#switchtab li[class='active']>a").attr("data-value");
			if(bizType=="ORGOPER"){
				$.fn.zTree.getZTreeObj("org").expandAll(true);
			}else if(bizType=="ADMINMENUOPER"){
				$.fn.zTree.getZTreeObj("sysMenu").expandAll(true);
			}else if(bizType=="USERMENUOPER"){
				$.fn.zTree.getZTreeObj("appMenu").expandAll(true);
			}else if(bizType=="MODULEOPER"){
				$.fn.zTree.getZTreeObj("module").expandAll(true);
			}else if(bizType=="FLOWOPER"){
				$.fn.zTree.getZTreeObj("flow").expandAll(true);
			}
			$(this).addClass("hidden");
			$("#collapseAll").removeClass("hidden");
		});
		//收缩全部
		$("#collapseAll").click(function(e){
			var bizType=$("#switchtab li[class='active']>a").attr("data-value");
			if(bizType=="ORGOPER"){
				$.fn.zTree.getZTreeObj("org").expandAll(false);
			}else if(bizType=="ADMINMENUOPER"){
				$.fn.zTree.getZTreeObj("sysMenu").expandAll(false);
			}else if(bizType=="USERMENUOPER"){
				$.fn.zTree.getZTreeObj("appMenu").expandAll(false);
			}else if(bizType=="MODULEOPER"){
				$.fn.zTree.getZTreeObj("module").expandAll(false);
			}else if(bizType=="FLOWOPER"){
				$.fn.zTree.getZTreeObj("flow").expandAll(false);
			}
			$(this).addClass("hidden");
			$("#openAll").removeClass("hidden");
		});
		//刷新
		$("#refreshPermissions").bind("click",function() {
			var bizType=$("#switchtab li[class='active']>a").attr("data-value");
			if(bizType=="ORGOPER"){
				var userId = $('input[name="userId"]').val();
				orgInfoTree.init(userId);
			}else if(bizType=="ADMINMENUOPER"){
				var userId = $('input[name="userId"]').val();
				sysmenuInfoTree.init(userId);
			}else if(bizType=="USERMENUOPER"){
				var userId = $('input[name="userId"]').val();
				appmenuInfoTree.init(userId);
			}else if(bizType=="MODULEOPER"){
				var userId = $('input[name="userId"]').val();
				moduleInfoTree.init(userId);
			}else if(bizType=="FLOWOPER"){
				var userId = $('input[name="userId"]').val();
				flowInfoTree.init(userId);
			}else if(bizType=="TENANTOPER"){
				$("#collapseAll").addClass("hidden");
				$("#openAll").addClass("hidden");
                operate.spacePermissions();
			}
		});
	}
	var operate = {
		openNode:function (tree,treeNode) {
			var tree = $.fn.zTree.getZTreeObj(tree);
			var node = tree.getNodeByParam("id",treeNode.id);
			tree.selectNode(node,false);//指定选中ID的节点
			tree.expandNode(node, true, false);//指定选中ID节点展开
		},
		//切换tab
        switchTab:function(id) {
			var $this = $('#'+id).parent();
			$("#switchtab").find("li").removeClass("active");
			$this.addClass("active");
			$("#tab").children().removeClass("in active");
			$("#tt").find("span").text($this.find("a").text());
			$("#tt").find("span").append(' <i class="ace-icon fa fa-angle-down icon-on-right"></i>');
			var b = $this.find("a").attr("data-target").substring(12, 21);
			$("#tab").children().each(function () {
				if ($(this).attr("data-pane") == b) {
					$(this).addClass("in active");
				}
			});
		},
		spacePermissions:function() {
			var userId = $("input[name='userId']").val();
			$.ajax({
				type : "POST",
				data : {
					userId : userId,
					resId:"app"
				},
				url : urls.resourceTree,
				dataType : "json",
				success : function(data) {
					var tenant = $('input[type="checkbox"][value="TEANANT_APP"]').parent();
					var manage = $('input[type="checkbox"][value="TEANANT_MANAGE"]').parent();
					var desinger = $('input[type="checkbox"][value="TEANANT_DESINGER"]').parent();
					var grant = $('input[type="checkbox"][value="GRANT"]').parent();
					if(data.restype!="err"){
						if(data[0].tenant=="0"||data[0].tenant=="-1"||data[0].tenant==""){
							tenant.attr("disabled",true);
							tenant.removeClass("active");
						}else if(data[0].tenant=="1"){
							tenant.attr("disabled",true);
							tenant.addClass("active");
						}
						if(data[0].manage=="0"||data[0].manage=="-1"||data[0].manage==""){
							manage.attr("disabled",true);
							manage.removeClass("active");
						}else if(data[0].manage=="1"){
							manage.attr("disabled",true);
							manage.addClass("active");
						}
						if(data[0].design=="0"||data[0].design=="-1"||data[0].design==""){
							desinger.attr("disabled",true);
							desinger.removeClass("active");
						}else if(data[0].design=="1"){
							desinger.attr("disabled",true);
							desinger.addClass("active");
						}
						if(data[0].grant=="0"||data[0].grant=="-1"||data[0].grant==""){
							grant.attr("disabled",true);
							grant.removeClass("active");
						}else if(data[0].grant=="1"){
							grant.attr("disabled",true);
							grant.addClass("active");
						}
						$("#tt").removeAttr("disabled");
					}else{
						tenant.removeClass("active");
						desinger.removeClass("active");
						grant.removeClass("active");
						manage.removeClass("active");
						parent.horizon.notice.warning(horizon.lang['platform-permission-retrieval']['notJoinedAnyRole']);
					}
				}
			});
		}
	};
	return horizon.manager['usersearch'] = {
		init:function(){
			event();
		}
    };
}));