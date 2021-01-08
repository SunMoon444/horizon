(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'jquery', 'gritter' ], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var urls = {
        userDelete : horizon.paths.apppath
                + '/horizon/manager/org/group/user/delete.wf',
        groupDelete : horizon.paths.apppath
                + '/horizon/manager/org/group/delete.wf',
        info : horizon.paths.apppath + '/horizon/manager/org/group/info.wf',
        addUser : horizon.paths.apppath + '/horizon/manager/org/group/user/save.wf'
    };
    var _height = {
        tableHeight : function() {
            return parent.horizon.manager['group'].table() - 55;
        }
    };
    var showView = {
        showUserList : function(groupId) {
            if (!groupId) {
                groupId = "root_node_id";
            }
            var viewUrl = horizon.paths.viewpath
                    + "?viewId=HZ28868a5ce71f39015ce8270a230064&groupId="
                    + groupId;
            $(parent.document).find("#userList").attr("height",
                    _height.tableHeight()).attr("src", viewUrl);
            $(parent.document).find('#userList').removeClass("hidden");
        }
    };
    var operate = {
        updateForm:function (obj) {
            $(parent.document).find('#replacement').removeClass("hidden");
            if (obj) {
                $(parent.document).find('#replacement').addClass("hidden");
                var id = horizon.view.getRowData(obj).id;
                parent.horizon.manager['group'].updateForm(id);
            } else {
                parent.horizon.manager['group'].openForm();
            }
        },
        deleteGroup:function () {
            var ids = horizon.view.checkIds.join(";");
            //判断用户是否选中了数据
            if (ids == null || ids.length <= 0) {
                parent.horizon.notice.error(parent.horizon.lang["message"]["deleteHelp"]);
            } else {
            	$(parent.document).find("#dialog-default").dialog({
                    title: parent.horizon.lang["message"]["title"],
                    dialogText: parent.horizon.lang["message"]["deleteConfirm"],
                    dialogTextType: 'alert-danger',
                    closeText: parent.horizon.lang["base"]["close"],
                    buttons: [{
                        html: parent.horizon.lang["base"]["ok"],
                        "class": "btn btn-primary btn-xs",
                        click: function () {
                            $(this).dialog('close');
                            $.ajax({
                                type: "POST",
                                data: {
                                    ids: ids
                                },
                                url: urls.groupDelete,
                                dataType: "json",
                                error: function () {
                                    parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
                                },
                                success: function (data) {
                                    if (data.restype == "success") {
                                        parent.horizon.notice.success(parent.horizon.lang["message"]["deleteSuccess"]);
                                        horizon.view.checkIds = [];
                                        horizon.view.dataTable.fnDraw(true);
                                        parent.horizon.manager['group'].treeReload();
                                    } else {
                                        parent.horizon.notice.error(parent.horizon.lang["message"]["deleteFailed"]);
                                    }
                                }
                            });
                        }
                    }]
                });
            }
        },
        selectUser:function () {
            var groupId = $(parent.document).find("input[name='id']").val();
            	parent.$.horizon.selectUser({
                multiple: true,
                selectDept: false,
                selectPosition: false,
                selectGroup: false,
                fnBackData: function () {
                    var checkedSpan = $(parent.document).find('#org-checked-list')
                        .find("span");
                    var ids = "";
                    $.each(checkedSpan, function (key, value) {
                        ids += value.id + ";";
                    });
                    if (ids.length < 1)
                        return;
                    operate.addUsers(groupId, ids);
                }
            });
        },
        addUsers: function (groupId, ids) {
            $.ajax({
                type: "POST",
                data: {
                    workGroupId: groupId,
                    userIds: ids
                },
                url: urls.addUser,
                dataType: "json",
                success: function (data) {
                    if (data.restype == "success") {
                        parent.horizon.notice.success(parent.horizon.lang["message"]["saveSuccess"]);
                        horizon.view.checkIds = [];
                        horizon.view.dataTable.fnDraw(true);
                    } else {
                        parent.horizon.notice.error(parent.horizon.lang["message"]["saveFailed"]);
                    }
                }
            });
        },
        deleteUser:function () {
            var groupId = $(parent.document).find("input[name='id']").val();
            var ids = horizon.view.checkIds.join(";");
            //判断用户是否选中了数据
            if (ids == null || ids.length <= 0) {
                parent.horizon.notice.error(parent.horizon.lang["message"]["deleteHelp"]);
            } else {
            	$(parent.document).find("#dialog-default").dialog({
                    title: parent.horizon.lang["message"]["title"],
                    dialogText: parent.horizon.lang["message"]["deleteConfirm"],
                    dialogTextType: 'alert-danger',
                    closeText: parent.horizon.lang["base"]["close"],
                    buttons: [{
                        html: parent.horizon.lang["base"]["ok"],
                        "class": "btn btn-primary btn-xs",
                        click: function () {
                            $(this).dialog('close');
                            $.ajax({
                                type: "POST",
                                data: {
                                    workGroupId: groupId,
                                    userIds: ids
                                },
                                url: urls.userDelete,
                                dataType: "json",
                                error: function () {
                                    parent.horizon.notice.error(parent.horizon.lang["message"]["deleteFailed"]);
                                },
                                success: function (data) {
                                    if (data.restype == "success") {
                                        parent.horizon.notice.success(parent.horizon.lang["message"]["deleteSuccess"]);
                                        horizon.view.checkIds = [];
                                        horizon.view.dataTable.fnDraw(true);
                                        parent.horizon.manager['group'].treeReload(groupId);
                                        var treeObj = $.fn.zTree.getZTreeObj("group-tree");
                                        treeObj.reAsyncChildNodes(null, "refresh");
                                    } else {
                                        parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
                                    }
                                }
                            });
                        }
                    }]
                });
            }
        }
    };
    return horizon.manager['groupOperate'] = {
        showUserList:showView.showUserList,
        updateForm:operate.updateForm,
        deleteGroup:operate.deleteGroup,
        selectUser:operate.selectUser,
        deleteUser:operate.deleteUser

    };
}));