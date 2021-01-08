/**
 * 人员列表
 * @author yw
 */

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'jquery', 'gritter' ], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var urls ={
        moveUserUpOrDown:horizon.paths.apppath+'/horizon/manager/org/user/sort.wf',
        operate:horizon.paths.apppath+'/horizon/manager/org/user/disable.wf',
        logOut:horizon.paths.apppath+'/horizon/manager/org/user/logoff.wf',
        importCanceled:horizon.paths.apppath+'/horizon/manager/org/dept/canceled/user/save.wf',
        passwordReset:horizon.paths.apppath+'/horizon/manager/org/user/password/reset.wf',
        deleteLogOffUser: horizon.paths.apppath+'/horizon/manager/org/user/logoff/delete.wf',
        reductionLogOffUser: horizon.paths.apppath+'/horizon/manager/org/user/logoff/reduction.wf',
        addDeptUser:horizon.paths.apppath+'/horizon/manager/org/dept/user/save.wf'
    };
    var operate= {
        //用户上移和下移
        moveUserUpOrDown:function (obj) {
            var userId = horizon.view.getRowData(obj).id;
            var flag = arguments[1];
            var inDept = arguments[2];
            var deptId = horizon.view.getRowData(obj).deptid;
            $.ajax({
                url: urls.moveUserUpOrDown,
                data: {userId: userId, flag: flag, inDept: inDept, deptId: deptId},
                cache: false,
                dataType: 'json',
                error: function () {
                    parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
                },
                success: function (data) {
                    if (data.restype == "success") {
                        horizon.view.checkIds = [];
                        horizon.view.dataTable.fnDraw(true);
                    } else {
                        parent.horizon.notice.error(data.msg[0]);
                    }
                }
            });
        },
        //用户启用和禁用
        operate: function (obj) {
            var id = horizon.view.getRowData(obj).id;
            var active = horizon.view.getRowData(obj).active;
            $.ajax({
                url: urls.operate,
                data: {id: id, active: active},
                cache: false,
                dataType: 'json',
                error: function () {
                    parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
                },
                success: function (data) {
                    if (data.restype == "success") {
                        horizon.view.checkIds = [];
                        horizon.view.dataTable.fnDraw(true);
                    } else {
                        parent.horizon.notice.error(data.msg[0]);
                    }
                }
            });
        },
        //删除已注销人员
        deleteUser:function () {
            var ids = horizon.view.checkIds.join(";");
            if (ids == null || ids.length <= 0) {
                parent.horizon.notice.error(parent.horizon.lang["message"]["deleteHelp"]);
            } else {
            	$(parent.document).find("#dialog-default").dialog({
                    title: parent.horizon.lang["message"]["title"],
                    dialogText: parent.horizon.lang["message"]["deleteConfirm"],
                    dialogTextType: 'alert-danger',
                    closeText: parent.horizon.lang["base"]["close"],
                    buttons: [
                        {
                            html: parent.horizon.lang["base"]["ok"],
                            "class": "btn btn-primary btn-xs",
                            click: function () {
                                $(this).dialog('close');
                                $.ajax({
                                    data: {ids: ids},
                                    url: urls.deleteLogOffUser,
                                    cache: false,
                                    dataType: 'json',
                                    error: function () {
                                        parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
                                    },
                                    success: function (data) {
                                        if (data.restype == "success") {
                                            parent.horizon.notice.success(data.msg[0]);
                                            horizon.view.checkIds = [];
                                            horizon.view.dataTable.fnDraw(true);
                                        } else {
                                            parent.horizon.notice.error(data.msg[0]);
                                        }
                                    }
                                });
                            }
                        }
                    ]
                });
            }
        },
        //还原已注销人员
        reductionLogOffUser:function () {
            var ids = horizon.view.checkIds.join(";");
            if (ids == null || ids.length <= 0) {
                parent.horizon.notice.error(parent.horizon.lang["platform-user"]["restoreHelp"]);
            } else {
            	$(parent.document).find("#dialog-default").dialog({
                    title: parent.horizon.lang["message"]["title"],
                    dialogText: parent.horizon.lang["platform-user"]["restoreConfirm"],
                    dialogTextType: 'alert-danger',
                    closeText: parent.horizon.lang["base"]["close"],
                    buttons: [
                        {
                            html: parent.horizon.lang["base"]["ok"],
                            "class": "btn btn-primary btn-xs",
                            click: function () {
                                $(this).dialog('close');
                                $.ajax({
                                    data: {ids: ids},
                                    url: urls.reductionLogOffUser,
                                    cache: false,
                                    dataType: 'json',
                                    error: function () {
                                        parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
                                    },
                                    success: function (data) {
                                        if (data.restype == "success") {
                                            parent.horizon.notice.success(data.msg[0]);
                                            horizon.view.checkIds = [];
                                            horizon.view.dataTable.fnDraw(true);
                                        } else {
                                            parent.horizon.notice.error(data.msg[0]);
                                        }
                                    }
                                });
                            }
                        }
                    ]
                });
            }
        },
        openForm:function (obj) {
        	var treeObj = parent.horizon.manager['user'].getTreeNodes();
        	var nodes = treeObj.getSelectedNodes();
            var id;
            if (obj == null) {
                parent.horizon.manager['user'].openForm(nodes[0]);
            } else {
                id = horizon.view.getRowData(obj).id;
                parent.horizon.manager['user'].updateForm(id);
            }
        },
        //用户密码重置
        passwordReset:function () {
            var ids = horizon.view.checkIds.join(";");
            if (ids == null || ids.length <= 0) {
                parent.horizon.notice.error( parent.horizon.lang["message"]["operateHelp"]);
            } else {
            	$(parent.document).find("#dialog-default").dialog({
                    title: parent.horizon.lang["message"]["title"],
                    dialogText: parent.horizon.lang["platform-user"]["resetPasswordConfirm"],
                    dialogTextType: 'alert-danger',
                    closeText: parent.horizon.lang["base"]["close"],
                    buttons: [
                        {
                            html: parent.horizon.lang["base"]["ok"],
                            "class": "btn btn-primary btn-xs",
                            click: function () {
                                $(this).dialog('close');
                                $.ajax({
                                    url: urls.passwordReset,
                                    data: {ids: ids},
                                    cache: false,
                                    dataType: 'json',
                                    error: function () {
                                        parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
                                    },
                                    success: function (data) {
                                        if (data.restype == "success") {
                                            parent.horizon.notice.success(parent.horizon.lang["platform-user"]["resetSuccess"]);
                                            parent.horizon.manager['user'].treeReload();
                                            horizon.view.checkIds = [];
                                            horizon.view.dataTable.fnDraw(true);
                                        } else {
                                            parent.horizon.notice.error(parent.horizon.lang["platform-user"]["resetFailed"]);
                                        }
                                    }
                                });
                            }
                        }
                    ]
                });
            }
        },
        //注销人员
        logOffActive:function () {
            var ids = horizon.view.checkIds.join(";");
            if (ids == null || ids.length <= 0) {
                parent.horizon.notice.error(parent.horizon.lang["message"]["operateHelp"]);
            } else {
            	$(parent.document).find("#dialog-default").dialog({
                    title: parent.horizon.lang["message"]["title"],
                    dialogText: parent.horizon.lang["message"]["logoutConfirm"],
                    dialogTextType: 'alert-danger',
                    closeText: parent.horizon.lang["base"]["close"],
                    buttons: [
                        {
                            html: parent.horizon.lang["base"]["ok"],
                            "class": "btn btn-primary btn-xs",
                            click: function () {
                                $(this).dialog('close');
                                $.ajax({
                                    url: urls.logOut,
                                    data: {ids: ids},
                                    cache: false,
                                    dataType: 'json',
                                    error: function () {
                                        parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
                                    },
                                    success: function (data) {
                                        if (data.restype == "success") {
                                            parent.horizon.notice.success(data.msg[0]);
                                            parent.horizon.manager['user'].treeReload();
                                            horizon.view.checkIds = [];
                                            horizon.view.dataTable.fnDraw(true);
                                        } else {
                                            parent.horizon.notice.error(data.msg[0]);
                                        }
                                    }
                                });
                            }
                        }
                    ]
                });
            }
        },
        //引入已注销人员
        importCanceled:function () {
            parent.$.horizon.selectUser({
                orgTreeSource: horizon.tools.formatUrl(horizon.paths.apppath + '/horizon/manager/org/user/logoff/tree', 'urlsuffix'),
                //获取orgTree数据的请求路径
                selectTreeSource: horizon.tools.formatUrl(horizon.paths.apppath + '/horizon/manager/org/user/logoff/list', 'urlsuffix'),
                //搜索的请求路径
                searchSource: horizon.tools.formatUrl(horizon.paths.apppath + '/horizon/manager/org/user/logoff/search', 'urlsuffix'),
                otherParam: {active: "2"},
                idField: 'userIds',
                cnField: 'userNames',
                multiple: true,
                position: false,
                group: false,
                dept: true,
                selectDept: false,
                selectPosition: false,
                selectGroup: false,
                fnBackData: function () {
                    var checkSpan = $(parent.document).find('#org-checked-list').find("span");
                    var ids = "";
                    $.each(checkSpan, function (key, value) {
                        ids += value.id + ";";
                    });
                    operate.addLogOffUser(ids);
                }
            });
        },
        //部门引入人员
        selDeptUsers:function () {
            var url = $(parent.document).find("#userList").attr("src");
            var deptId = url.substr(url.indexOf("&deptId") + 8);
            parent.$.horizon.selectUser({
                multiple: true,
                selectDept: false,
                selectPosition: false,
                selectGroup: false,
                dept: true,
                position: false,
                group: false,
                role: false,
                fnBackData: function () {
                    var checkSpan = $(parent.document).find('#org-checked-list').find("span");
                    var ids = "";
                    $.each(checkSpan, function (key, value) {
                        ids += value.id + ";";
                    });
                    operate.addDeptUser(ids, deptId);
                }
            });
        },
        addLogOffUser:function (id) {
            var url = $(parent.document).find("#userList").attr("src");
            var deptId = url.substr(url.indexOf("&deptId") + 8);
            $.ajax({
                url: urls.importCanceled,
                data: {userId: id, deptId: deptId},
                cache: false,
                dataType: 'json',
                error: function () {
                    parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
                },
                success: function (data) {
                    if (data.restype == "success") {
                        parent.horizon.notice.success(data.msg[0]);
                        parent.horizon.manager['user'].treeReload();
                        horizon.view.checkIds = [];
                        horizon.view.dataTable.fnDraw(true);
                    } else {
                        parent.horizon.notice.error(data.msg[0]);
                    }
                }
            });
        },
        addDeptUser:function (userIds, deptId) {
            $.ajax({
                type: "POST",
                data: {userIds: userIds, deptId: deptId},
                url: urls.addDeptUser,
                dataType: "json",
                success: function (data) {
                    if (data.restype == "success") {
                        parent.horizon.notice.success(data.msg[0]);
                        parent.horizon.manager['user'].treeReload();
                        horizon.view.checkIds = [];
                        horizon.view.dataTable.fnDraw(true);
                    } else {
                        parent.horizon.notice.error(data.msg[0]);
                    }
                }
            });
        }
    };
    return horizon.manager['userOperate'] = {
        moveUserUpOrDown:operate.moveUserUpOrDown,
        operate:operate.operate,
        deleteUser:operate.deleteUser,
        reductionLogOffUser:operate.reductionLogOffUser,
        openForm:operate.openForm,
        passwordReset:operate.passwordReset,
        logOffActive:operate.logOffActive,
        importCanceled:operate.importCanceled,
        selDeptUsers:operate.selDeptUsers,
        addLogOffUser:operate.addLogOffUser,
        addDeptUser:operate.addDeptUser
    };
}));