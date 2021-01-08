
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonSelectuser', 'ztree'], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    "use strict";
    var urls = {
        checkCode: horizon.paths.apppath + '/horizon/manager/org/group/code/check.wf',
        save: horizon.paths.apppath + '/horizon/manager/org/group/save.wf',
        info: horizon.paths.apppath + '/horizon/manager/org/group/info.wf',
        groupTree: horizon.paths.apppath + '/horizon/manager/org/group/tree.wf'
    };
    var _height = {
        outerHeight: function () {
            var _height = horizon.tools.getPageContentHeight() - 30;
            return _height;
        }
    };
    var groupTree = {
        nodeId: '',
        setting: {
            async: {
                url: urls.groupTree,
                enable: true,
                dataType: "json",
                type: "post"
            },
            data: {
                simpleData: {
                    enable: true,
                    pIdKey: "pid"
                }
            },
            view: {
                dblClickExpand: false,
                showIcon: false,
                showLine: false
            },
            callback: {
                onClick: function (event, treeId, treeNode, clickFlag) {
                    var tree = $.fn.zTree.getZTreeObj("group-tree");
                    var node = tree.getNodeByParam("id", treeNode.id);
                    tree.selectNode(node, false);//指定选中ID的节点
                    if (treeNode.open) {
						tree.expandNode(node, false, false);// 指定选中ID节点折叠
					} else {
						tree.expandNode(node, true, false);// 指定选中ID节点展开
					}
                    if (treeNode.id == "allGroup") {
                        showView.showGroupList();
                        $('#groupInfo').addClass("hidden");
                        $('#groupList').removeClass("hidden");
                        $("#close").addClass("hidden");
                    } else if (treeNode.id != "group_root" && treeNode.id != "allGroup") {
                        groupOperate.updateForm(treeNode.id);
                    }
                },
                onAsyncSuccess: function (event, treeId, treeNode, msg) {
                    var tree = $.fn.zTree.getZTreeObj("group-tree");
                    var node = tree.getNodeByParam("id", groupTree.nodeId);
                    tree.selectNode(node, false);//指定选中ID的节点
                    tree.expandNode(node, true, false);//指定选中ID节点展开
                }
            }
        },
        init: function (option) {
            groupTree.nodeId = option;
            var $orgTree = $('#group-tree');
            $orgTree = $.fn.zTree.init($orgTree, groupTree.setting);
            var nodes = [{id: "allGroup", name: horizon.lang["platform-group"]["allGroup"], iconSkin: 'F', pid: 'root'}];
            $orgTree.addNodes(null, nodes);
            var $container = $('#group-tree').closest('.modal-body');
        }
    };
    var operate = {
        checkForm: function () {
            return $("#groupForm").validate({
                rules: {
                    groupCode: {
                        remote: {
                            url: urls.checkCode,
                            cache: false,
                            data: {
                                groupCode: function () {
                                    return $('#groupForm').find('input[name="groupCode"]').val();
                                },
                                id: function () {
                                    return $('#groupForm').find('input[name="id"]').val();
                                }
                            }
                        }
                    }
                },
                messages: {
                    groupCode: {
                        remote: horizon.lang["platform-group"]["codeExistsError"]
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
                errorPlacement: function (error, element) {
                    var $formGroup = $(element).closest('.form-group');
                    if($formGroup.find('.help-block').length) return;
                    $formGroup.append(error);
                },
                submitHandler: function (form) {
                    $(form).ajaxSubmit({
                        url: urls.save,
                        dataType: 'json',
                        type: 'post',
                        cache: false,
                        error: function () {
                            horizon.notice.error(horizon.lang["message"]["operateError"]);
                        },
                        success: function (data) {
                            if (data.restype == "success") {
                                horizon.notice.success(data.msg[0]);
                                pageOperate.pageReturn();
                                $("#groupList")[0].contentWindow.horizon.view.dataTable.fnDraw(true);
                            } else {
                                horizon.notice.error(data.msg[0]);
                            }
                        }
                    });
                }
            });
        }
    };
    var showView = {
        showUserList: function (groupId) {
            if (!groupId) {
                groupId = "root_node_id";
            }
            var viewUrl = horizon.paths.viewpath + "?viewId=HZ28868a5ce71f39015ce8270a230064&groupId=" + groupId;
            $("#userList").attr("height", _height.outerHeight() - 60).attr("src", viewUrl);
            $('#userList').removeClass("hidden");
            $('#groupList').addClass("hidden");
        },
        showGroupList: function () {
            var viewUrl = horizon.paths.viewpath + "?viewId=HZ28868a5cd923e8015cd93f5c040032&service=groupViewServiceImpl";
            $("#groupList").attr("height", _height.outerHeight()).attr("src", viewUrl);
            $('#groupList').removeClass("hidden");
            $('#userList').addClass("hidden");
        }
    };
    function event() {
        //重置
        $("#replacement").click(function () {
        	$('#groupForm').find("input[type='hidden']").val('');
        	$('input[name="groupName"]').parent().addClass(
			'has-error');
        	$('input[name="groupCode"]').parent().addClass(
			'has-error');
        	$('input[name="parentName"]').parent().addClass(
        	'has-error');
        });
        //返回群组列表
        $("#close").click(function () {
            pageOperate.pageReturn();
        });
        //设置根节点
		$("#setnode").bind(horizon.tools.clickEvent(),function() {
			  $("input[name='parentId']").val("G_root_node_id");
			  $('input[name="parentName"]').parent().removeClass('has-error');
			  $('input[name="parentName"]').parent().parent().removeClass('has-error');
			  $('label[id="parentName-error"]').remove();
			  $('input[name="parentName"]').val(horizon.lang["platform-group"]["navigate"]);
		  });
        //群组负责人
        $('input[name="leaderName"]').bind(horizon.tools.clickEvent(), function () {
            $.horizon.selectUser({
                idField: 'leader',
                cnField: 'leaderName',
                multiple: false,
                selectDept: false,
                selectPosition: false,
                selectGroup: false,
                dept: true,
                position: true,
                group: true
            });
        });
        //群组接口人
        $('input[name="humanInterName"]').bind(horizon.tools.clickEvent(), function () {
            $.horizon.selectUser({
                idField: 'humanInter',
                cnField: 'humanInterName',
                multiple: true,
                selectDept: false,
                selectPosition: false,
                selectGroup: false,
                dept: true,
                position: true,
                group: true
            });
        });
        //群组管理员
        $('input[name="groupAdminName"]').bind(horizon.tools.clickEvent(), function () {
            $.horizon.selectUser({
                idField: 'groupAdmin',
                cnField: 'groupAdminName',
                multiple: true,
                selectDept: false,
                selectPosition: false,
                selectGroup: false,
                dept: true,
                position: true,
                group: true
            });
        });
        //上级主管领导
        $('input[name="upLeaderName"]').bind(horizon.tools.clickEvent(), function () {
            $.horizon.selectUser({
                idField: 'upLeader',
                cnField: 'upLeaderName',
                multiple: false,
                selectDept: false,
                selectPosition: false,
                selectGroup: false,
                selectUser: true,
                dept: true,
                position: true,
                group: true
            });
        });
        //上级群组
        $('input[name="parentName"]').bind(horizon.tools.clickEvent(), function () {
            $.horizon.selectUser({
                idField: 'parentId',
                cnField: 'parentName',
                multiple: false,
                selectDept: false,
                selectPosition: false,
                selectGroup: true,
                selectUser: false,
                dept: false,
                position: false,
                group: true
            });
            $('input[name="parentName"]').parent().removeClass('has-error');
			$('input[name="parentName"]').parent().parent().removeClass('has-error');
			$('label[id="parentName-error"]').remove();
        });
        //向群组中添加人员
        $('input[name="usersName"]').bind(horizon.tools.clickEvent(), function () {
            $.horizon.selectUser({
                idField: 'usersID',
                cnField: 'usersName',
                multiple: true,
                selectGroup: false,
                selectPosition: false,
                selectDept: false
            });
        });
        $("#allGroup").bind(horizon.tools.clickEvent(), function () {
            showView.showGroupList();
            $('#groupInfo').addClass("hidden");
            $('#groupList').removeClass("hidden");
            groupTree.nodeId = "group_root";
            var treeObj = $.fn.zTree.getZTreeObj("group-tree");
            treeObj.reAsyncChildNodes(null, "refresh");
        });
    }
    //页面操作
    var pageOperate = {
        pageReturn: function () {
            $('label[id="close"]').addClass("hidden");
            $('#groupInfo').addClass("hidden");
            $('#groupList').removeClass("hidden");
            groupTree.nodeId = "group_root";
            var treeObj = $.fn.zTree.getZTreeObj("group-tree");
            treeObj.reAsyncChildNodes(null, "refresh");
            var nodes = [{id: "allGroup", name: horizon.lang["platform-group"]["allGroup"], iconSkin: 'F', pid: 'root'}];
            treeObj.addNodes(null, nodes);
            $("#groupList")[0].contentWindow.horizon.view.dataTable.fnDraw(true);
        }
    };
    //群组操作
    var groupOperate = {
        //打开增加群组页面
        openForm: function () {
            $('#groupList').addClass("hidden");
            $('#groupInfo').removeClass("hidden");
            $('#replacement').removeClass("hidden");
            $('#close').removeClass("hidden");
            $('#groupForm')[0].reset();
            $('label[id*="-error"]').remove();
            $('input[name="groupName"]').parent().addClass(
                'has-error');
            $('input[name="groupCode"]').parent().addClass(
                'has-error');
            $('input[name="parentName"]').parent().addClass(
                'has-error');
            $("input[type='hidden']").val('');
            //禁止另外两个页签
            $('#myTab a:first').tab('show');
            $('[data-pane="baseInfo"]').addClass("in active");
            $('[data-pane="userInfo"]').removeClass('in active');
            $('#liUser').addClass("hidden");
            $('[data-pane="userInfo"]').addClass("hidden");
        },
        //打开更新群组页面
        updateForm: function (id) {
        	
            groupOperate.groupData(id);
            $('#liUser').addClass("hidden").removeClass("hidden");
            $('[data-pane="userInfo"]').addClass("hidden").removeClass("hidden");
            treeOperate.openNode("group-tree", "id", id);
        },
        groupData: function (id) {
            $.ajax({
                type: "POST",
                data: {id: id},
                url: urls.info,
                dataType: "json",
                success: function (data) {
                    if (data!=null && data!= "/error/403") {
                    	$('label[id="close"]').removeClass("hidden");
                        $('#groupForm')[0].reset();
                        $('#groupList').addClass("hidden");
                        $('#groupInfo').removeClass("hidden");
                        $('#close').removeClass("hidden");
                        $('#myTab a:first').tab('show');
                        $('[data-pane="baseInfo"]').addClass("in active");
                        $('[data-pane="userInfo"]').removeClass('in active');
                        $('.form-group').removeClass('has-error');
                        $('label[id*="-error"]').remove();
                        showView.showUserList(id);
                        $.each(data, function (i, key) {
                            $('#groupForm input[name="' + i + '"]').val(key);
                        });
                        $('#groupForm textarea[name="groupRemark"]').val(data.groupRemark);
                        $('#groupForm textarea[name="comments"]').val(data.comments);
                    }
                }
            });
        }
    };
    var treeOperate = {
        openNode: function (divId, key, value, scope) {
            var tree = $.fn.zTree.getZTreeObj(divId);
            var node = tree.getNodeByParam(key, value);
            tree.selectNode(node, false);//指定选中ID的节点
            tree.expandNode(node, true, false);//指定选中ID节点展开
        }
    };
    return horizon.manager['group'] = {
        init: function () {
            groupTree.init("group_root");
            showView.showGroupList();
            event();
            operate.checkForm();
        },
        treeReload: groupTree.init,
        treeOpen: treeOperate.openNode,
        table: _height.outerHeight,
        openForm: groupOperate.openForm,
        updateForm: groupOperate.updateForm
    };
}));