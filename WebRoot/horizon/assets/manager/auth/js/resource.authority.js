/**
 * 资源权限检索
 * @author yw
 */
(function (factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery', 'jqueryValidateAll','horizonTable', 'jqueryForm', 'ztree'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
	"use strict";
	var urls ={
		authorityTree:horizon.paths.apppath+'/horizon/manager/role/auth/search/tree.wf',
		result:horizon.paths.apppath+'/horizon/manager/role/auth/search/result.wf'
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
		aceHeight:function(){
			var outerHeight = _height.outerHeight();
			outerHeight = outerHeight-parseInt($(".aceheight").height())*2
				-parseInt($(".aceHeight").height())*2 - parseInt($('.page-content').css('paddingTop')) * 2;
			return outerHeight;
		}
	};
	//应用空间树结构
	var appInfoTree = {
	    nodeId:"",
		setting: {
			async: {
				url:urls.authorityTree,
				dataType: "json",
				enable: true,
				type:"post",
				otherParam:{
					resId:"app"
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
				showIcon: false
			},
			callback: {
				onClick: function(event, treeId, treeNode, clickFlag) {
					var id = treeNode.id;
					operate.showResult("appRes","appTable",id);
					//展开节点
					operate.openNode("app",treeNode.id);
	            },
                onAsyncSuccess : function(event, treeId, treeNode, msg) {
				    var id = appInfoTree.nodeId;
                    operate.openNode("app",id);
                    if(id.indexOf("HZ")!=-1){
                        operate.showResult("appRes","appTable",id);
                    }
                }
	        }
        },
        init: function() {
            var $orgTree = $('#app');
            $.fn.zTree.init($orgTree, appInfoTree.setting);
        }
	};
	//组织机构树结构
	var orgInfoTree = {
	    nodeId:"",
		setting: {
			async: {
				url:urls.authorityTree,
				enable: true,
				dataType: "json",
				type:"post",
				otherParam:{
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
				showIcon: false
			},
			callback: {
				onClick: function(event, treeId, treeNode, clickFlag) {
					var id = treeNode.id;
					if(id.indexOf("HZ")!=-1 || id=="users" || id=="SYSTEM_ADMINISTRATOR"){
                        operate.showResult("orgRes","orgTable",id);
					}
					//展开节点
					operate.openNode("org",treeNode.id);
	            },
                onAsyncSuccess : function(event, treeId, treeNode, msg) {
				    var id = orgInfoTree.nodeId;
                    operate.openNode("org",id);
                    if(id.indexOf("HZ")!=-1){
                        operate.showResult("orgRes","orgTable",id);
                    }
                }
	         }
	       },
	       init: function() {
	            var $orgTree = $('#org');
	            $.fn.zTree.init($orgTree, orgInfoTree.setting);
	     }
	};
	//系统菜单树结构
	var sysmenuInfoTree = {
	    nodeId:"",
		setting: {
			async: {
				url:urls.authorityTree,
				enable: true,
				dataType: "json",
				type:"post",
				otherParam:{
					resId:"sysMenu"}
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
	                showIcon: false
	            },
	            callback: {
	                onClick: function(event, treeId, treeNode, clickFlag) {
	                	var id = treeNode.id;
	                	if(id.indexOf("HZ")!=-1){
                            operate.showResult("sysMenuRes","sysMenuTable",id);
	                	}
                        //展开节点
                        operate.openNode("sysMenu",treeNode.id);
	               },
                    onAsyncSuccess : function(event, treeId, treeNode, msg) {
	                    var id = sysmenuInfoTree.nodeId;
                        operate.openNode("sysMenu",id);
                        if(id.indexOf("HZ")!=-1){
                            operate.showResult("sysMenuRes","sysMenuTable",id);
                        }
                    }
	            }
	        },
	        init: function() {
	            var $orgTree = $('#sysMenu');
	             $.fn.zTree.init($orgTree, sysmenuInfoTree.setting);
	        }
	};
	//应用菜单树结构
	var appmenuInfoTree = {
	    nodeId:"",
		setting: {
			async: {
				url:urls.authorityTree,
				enable: true,
				dataType: "json",
				type:"post",
				otherParam:{
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
				showIcon: false
			},
			callback: {
				onClick: function(event, treeId, treeNode, clickFlag) {
					var id = treeNode.id;
					if(id.indexOf("HZ")!=-1){
                        operate.showResult("appMenuRes","appMenuTable",id);
					}
					//展开节点
					operate.openNode("appMenu",treeNode.id);
				},
                onAsyncSuccess : function(event, treeId, treeNode, msg) {
				    var id = appmenuInfoTree.nodeId;
                    operate.openNode("appMenu",id);
                    if(id.indexOf("HZ")!=-1){
                        operate.showResult("appMenuRes","appMenuTable",id);
                    }
                }
			}
		},
		init: function() {
			var $orgTree = $('#appMenu');
			$.fn.zTree.init($orgTree, appmenuInfoTree.setting);
		}
	};
	//模块树结构
	var moduleInfoTree = {
	    nodeId:"",
		setting: {
			async: {
				url:urls.authorityTree,
				enable: true,
				dataType: "json",
				type:"post",
				otherParam:{
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
				showIcon: false
			},
			callback: {
				onClick: function(event, treeId, treeNode, clickFlag) {
					var id = treeNode.id;
					if(id.indexOf("HZ")!=-1&& id.indexOf("HZ")==0){
                        operate.showResult("moduleRes","moduleTable",id);
					}
					//展开节点
					operate.openNode("module",treeNode.id);
				},
                onAsyncSuccess : function(event, treeId, treeNode, msg) {
				    var id = moduleInfoTree.nodeId;
                    operate.openNode("module",id);
                    if(id.indexOf("HZ")!=-1&& id.indexOf("HZ")==0){
                        operate.showResult("moduleRes","moduleTable",id);
                    }
                }
			}
		},
		init: function() {
			var $orgTree = $('#module');
			$.fn.zTree.init($orgTree, moduleInfoTree.setting);
		}
	};
	//流程树结构
	var flowInfoTree = {
	    nodeId:"",
		setting: {
			async: {
				url:urls.authorityTree,
				enable: true,
				dataType: "json",
				type:"post",
				otherParam:{
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
				showIcon: false
			},
			callback: {
				onClick: function(event, treeId, treeNode, clickFlag) {
					var id = treeNode.id;
					if(id!="flow"){
					    operate.showResult("flowRes","flowTable",id);
					}
					//展开节点
					operate.openNode("flow",treeNode.id);
				},
                onAsyncSuccess : function(event, treeId, treeNode, msg) {
				    var id = flowInfoTree.nodeId;
                    operate.openNode("flow",id);
                    if(id!="flow"){
                        operate.showResult("flowRes","flowTable",id);
                    }
                }
			}
		},
		init: function() {
			var $orgTree = $('#flow');
			$.fn.zTree.init($orgTree, flowInfoTree.setting);
		}
	};

	var operate = {
		openNode:function (tree,id) {
            var tree = $.fn.zTree.getZTreeObj(tree);
            var node = tree.getNodeByParam("id",id);
            tree.selectNode(node,false);//指定选中ID的节点
            tree.expandNode(node, true, false);//指定选中ID节点展开
        },
        //检索结果显示
        showResult:function(res,table,id){
            $.ajax({
                url: urls.result,
                data:{resId:id},
                type: 'post',
                dataType:'json',
                success: function (data) {
                    $("#"+res).removeClass("hidden");
                    $("#"+table).html("");
                    $("#"+table).append("<tr><td>" + horizon.lang['platform-permission-retrieval']['role'] + "</td><td>" + horizon.lang['platform-permission-retrieval']['permission'] + "</td></tr>");
                    $.each(data,function(key,value){
                        $("#"+table).append("<tr><td>"+key+"</td><td>"+value+"</td></tr>");
                    });
                }
            });
        }
	};


	function event(){
		//回显应用空间中的权限数据
		$('#appSpacePermissions').bind("click",function() {
			$("#openAll").removeClass("hidden");
			$("#collapseAll").addClass("hidden");
			appInfoTree.init();
		});
		//回显组织机构中的权限数据
		$('#orgPermissions').bind("click",function() {
			$("#openAll").removeClass("hidden");
			$("#collapseAll").addClass("hidden");
			orgInfoTree.init();
		});
		//回显系统菜单中的权限数据
		$('#sysMenuPermissions').bind("click",function() {
			$("#openAll").removeClass("hidden");
			$("#collapseAll").addClass("hidden");
			sysmenuInfoTree.init();
		});
		//回显应用菜单中的权限数据
		$('#appMenuPermissions').bind("click",function() {
			$("#openAll").removeClass("hidden");
			$("#collapseAll").addClass("hidden");
			appmenuInfoTree.init();
		});
		//回显模块中的权限数据
		$('#modulePermissions').bind("click",function() {
			$("#openAll").removeClass("hidden");
			$("#collapseAll").addClass("hidden");
			moduleInfoTree.init();
		});
		//回显流程中的权限数据
		$('#flowPermissions').bind("click",function() {
			$("#openAll").removeClass("hidden");
			$("#collapseAll").addClass("hidden");
			flowInfoTree.init();
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
                var tree = $.fn.zTree.getZTreeObj("org");
                var nodes = tree.getSelectedNodes();
                if(nodes.length) {
                    orgInfoTree.nodeId = nodes[0].id;
                }
				orgInfoTree.init();
			}else if(bizType=="ADMINMENUOPER"){
                var tree = $.fn.zTree.getZTreeObj("sysMenu");
                var nodes = tree.getSelectedNodes();
                if(nodes.length) {
                    sysmenuInfoTree.nodeId = nodes[0].id;
                }
				sysmenuInfoTree.init();
			}else if(bizType=="USERMENUOPER"){
                var tree = $.fn.zTree.getZTreeObj("appMenu");
                var nodes = tree.getSelectedNodes();
                if(nodes.length) {
                    appmenuInfoTree.nodeId = nodes[0].id;
                }
				appmenuInfoTree.init();
			}else if(bizType=="MODULEOPER"){
                var tree = $.fn.zTree.getZTreeObj("module");
                var nodes = tree.getSelectedNodes();
                if(nodes.length) {
                    moduleInfoTree.nodeId = nodes[0].id;
                }
				moduleInfoTree.init();
			}else if(bizType=="FLOWOPER"){
                var tree = $.fn.zTree.getZTreeObj("flow");
                var nodes = tree.getSelectedNodes();
                if(nodes.length) {
                    flowInfoTree.nodeId = nodes[0].id;
                }
				flowInfoTree.init();
			}else if(bizType=="TENANTOPER"){
                var tree = $.fn.zTree.getZTreeObj("app");
                var nodes = tree.getSelectedNodes();
                if(nodes.length) {
                    appInfoTree.nodeId = nodes[0].id;
                }
				appInfoTree.init();
			}
		});
		//设置高度
		$(".searchResult").height(_height.aceHeight).ace_scroll({
			size:_height.aceHeight()
		});
	}
	return horizon.manager['resourceAuthority'] = {
		init:function(){
			event();
			appInfoTree.init();
		}
    };
}));