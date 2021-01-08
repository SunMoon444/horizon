/**
 * 部门列表
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
    var urls = {
        deptDelete: horizon.paths.apppath + '/horizon/manager/org/dept/delete.wf',
        addPosition: horizon.paths.apppath + '/horizon/manager/org/dept/position/save.wf',
        addUser: horizon.paths.apppath + '/horizon/manager/org/dept/user/save.wf',
        deptPositionDelete: horizon.paths.apppath + '/horizon/manager/org/dept/position/delete.wf'
    };
    var operate ={
        //打开表单
        openForm:function () {
            parent.horizon.manager['dept'].openInformation();
        },
        //更新表单
        updateForm:function (obj) {
            if (obj) {
                var id = horizon.view.getRowData(obj).id;
                parent.horizon.manager['dept'].echoInformation(id);
            }
        },
        //删除部门
        deleteDept:function () {
            var ids = horizon.view.checkIds.join(";");
            if (ids == null || ids.length <= 0) {
                parent.horizon.notice.error(parent.horizon.lang["message"]["deleteHelp"]);
            } else {
            	$(parent.document).find("#dialog-default").dialog({
                    title: parent.horizon.lang["message"]["title"],
                    dialogText: parent.horizon.lang["message"]["deleteConfirm"],
                    dialogTextType: 'alert-danger',
                    closeText:parent.horizon.lang["base"]["close"],
                    buttons: [
                        {
                            html: parent.horizon.lang["base"]["ok"],
                            "class": "btn btn-primary btn-xs",
                            click: function () {
                                $(this).dialog('close');
                                $.ajax({
                                    data: {ids: ids},
                                    url: urls.deptDelete,
                                    cache: false,
                                    dataType: 'json',
                                    error: function () {
                                        parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
                                    },
                                    success: function (data) {
                                        if (data.restype == "success") {
                                            parent.horizon.notice.success(data.msg[0]);
                                            parent.horizon.manager['dept'].treeReload();
                                            horizon.view.checkIds = [];
                                            horizon.view.dataTable.fnDraw(true);
                                            var treeObj = $.fn.zTree.getZTreeObj("dept-tree");
                                            treeObj.reAsyncChildNodes(null, "refresh");
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
        //选择岗位
        selPosition:function () {
            var deptId = $(parent.document).find("input[name='id']").val();
            parent.$.horizon.selectUser({
                multiple: true,
                selectDept: false,
                selectPosition: true,
                selectGroup: false,
                selectUser: false,
                dept: false,
                position: true,
                group: false,
                role: false,
                fnBackData: function () {
                    var checkSpan = $(parent.document).find('#org-checked-list').find("span");
                    var ids = "";
                    $.each(checkSpan, function (key, value) {
                        ids += value.id + ";";
                    });
                    operate.addPosition(ids, deptId);
                }
            });
        },
        //添加岗位
        addPosition:function (positionIds, deptId) {
            $.ajax({
                type: "POST",
                data: {positionIds: positionIds, deptId: deptId},
                url: urls.addPosition,
                dataType: "json",
                success: function () {
                    horizon.view.checkIds = [];
                    horizon.view.dataTable.fnDraw(true);
                }
            });
        },
        //删除岗位
        delPosition:function () {
            var deptId = $(parent.document).find("input[name='id']").val();
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
                                    data: {ids: ids, deptId: deptId},
                                    url: urls.deptPositionDelete,
                                    cache: false,
                                    dataType: 'json',
                                    error: function () {
                                        parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
                                    },
                                    success: function (data) {
                                        if (data.restype == "success") {
                                            parent.horizon.notice.success(data.msg[0]);
                                            parent.horizon.manager['dept'].treeReload();
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
        // 打开岗位信息
        openPosition:function () {
            var data = horizon.view.getRowData(arguments[0]);
            var positionId = data.id;
            var deptId = data.object_id;
            parent.horizon.manager['dept'].openPosition(deptId, positionId);
        }
    };
    return horizon.manager['deptOperate'] = {
        updateForm:operate.updateForm,
        deleteDept:operate.deleteDept,
        selPosition:operate.selPosition,
        addPosition:operate.addPosition,
        openForm:operate.openForm,
        delPosition:operate.delPosition,
        openPosition:operate.openPosition
    };
}));