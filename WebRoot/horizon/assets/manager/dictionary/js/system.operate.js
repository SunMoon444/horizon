/**
 * 系统字典操作
 * @author yw
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'jquery', 'gritter' ], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    var urls ={
        del:horizon.paths.apppath+'/horizon/manager/dict/delete.wf',
        moveUpOrDown:horizon.paths.apppath+'/horizon/manager/dict/moveUpOrDown.wf',
        operate:horizon.paths.apppath+'/horizon/manager/dict/disable.wf'
    };
    var operate = {
        openForm:function (obj) {
            var id = null;
            if (obj != null) {
                id = horizon.view.getRowData(obj).id;
                var parent_id = horizon.view.getRowData(obj).parent_id;
                var categoryName = horizon.view.getRowData(obj).category;
                parent.horizon.manager['systemDictionary'].updateDict(id, parent_id, categoryName);
            } else {
                parent.horizon.manager['systemDictionary'].addDict();
            }
        },
        //删除字典
        del:function (flag) {
            var ids = horizon.view.checkIds.join(";");
            if (ids == null || ids.length <= 0) {
                parent.horizon.notice.error(parent.horizon.lang['message']['deleteHelp']);
            } else {
                $("#dialog-message").dialog({
                    title: parent.horizon.lang['message']['title'],
                    destroyAfterClose: false,
                    dialogText: parent.horizon.lang['message']['deleteConfirm'],
                    dialogTextType: 'alert-danger',
                    closeText: parent.horizon.lang['base']['close'],
                    buttons: [
                        {
                            html: parent.horizon.lang['base']['ok'],
                            "class": "btn btn-primary btn-xs",
                            click: function () {
                                $(this).dialog('close');
                                $.ajax({
                                    url: urls.del,
                                    data: {ids: ids, flag: flag},
                                    cache: false,
                                    dataType: 'json',
                                    error: function () {
                                        parent.horizon.notice.error(parent.horizon.lang['message']['operateError']);
                                    },
                                    success: function (data) {
                                        if (data.restype == "success") {
                                            parent.horizon.notice.success(data.msg[0]);
                                            horizon.view.checkIds = [];
                                            horizon.view.dataTable.fnDraw(true);
                                            var node = parent.horizon.manager['systemDictionary'].getTreeNode();
                                            parent.horizon.manager['systemDictionary'].treeReload(node.id);
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
        //应用字典上移和下移操作
        moveUpOrDown:function (obj) {
            var dictCode = horizon.view.getRowData(obj).dict_code;
            var flag = arguments[2];
            var moveType = arguments[1];
            if (flag == "false") {
                var node = parent.horizon.manager['systemDictionary'].getTreeNode();
                if (node.id != node.name) {
                    flag = "true";
                }
            }
            $.ajax({
                url: urls.moveUpOrDown,
                data: {dictCode: dictCode, moveType: moveType, flag: flag, dictType: "system"},
                cache: false,
                dataType: 'json',
                error: function () {
                    parent.horizon.notice.error(parent.horizon.lang['message']['operateError']);
                },
                success: function (data) {
                    if (data.restype == "success") {
                        parent.horizon.notice.success(data.msg[0]);
                        horizon.view.checkIds = [];
                        horizon.view.dataTable.fnDraw(true);
                        var node = parent.horizon.manager['systemDictionary'].getTreeNode();
                        parent.horizon.manager['systemDictionary'].treeReload(node.id);
                    } else {
                        parent.horizon.notice.error(data.msg[0]);
                    }
                }
            });
        },
        //字典状态操作
        operate:function (obj) {
            var dictId = horizon.view.getRowData(obj).id;
            var active = horizon.view.getRowData(obj).active == '启用' ? 1 : 0;
            $.ajax({
                url: urls.operate,
                data: {id: dictId, active: active},
                cache: false,
                dataType: 'json',
                error: function () {
                    parent.horizon.notice.error(parent.horizon.lang['message']['operateError']);
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
    };
    return horizon.manager['sysOperate'] = {
        openForm:operate.openForm,
        del:operate.del,
        moveUpOrDown:operate.moveUpOrDown,
        operate:operate.operate
    };
}));