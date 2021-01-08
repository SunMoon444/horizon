/**
 * 字典回收站操作
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
        info:horizon.paths.apppath+'/horizon/manager/dict/info.wf',
        restore:horizon.paths.apppath+'/horizon/manager/dict/restore.wf',
        del:horizon.paths.apppath+'/horizon/manager/dict/delete.wf'
    };
    var operate = {
        openForm:function (obj) {
            var id = null;
            if (obj != null) {
                var id = horizon.view.getRowData(obj).id;
            }
            parent.horizon.manager['trash'].showInfo(id);
        },
        del:function () {
            var ids = horizon.view.checkIds.join(";");
            if (ids == null || ids.length <= 0) {
                parent.horizon.notice.error(parent.horizon.lang['message']['deleteHelp']);
            } else {
                $("#dialog-message").dialog({
                    title: parent.horizon.lang['message']['title'],
                    destroyAfterClose: true,
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
                                    data: {ids: ids, flag: "false"},
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
                        }
                    ]
                });
            }
        },
        //还原字典
        restore:function (obj) {
            var id = null;
            if (obj != null) {
                var id = horizon.view.getRowData(obj).id;
            }
            $("#dialog-message").dialog({
                title: parent.horizon.lang['message']['title'],
                destroyAfterClose: true,
                dialogText: parent.horizon.lang['platform-dict']['redictionConfirm'],
                dialogTextType: 'alert-danger',
                closeText: parent.horizon.lang['base']['close'],
                buttons: [
                    {
                        html: parent.horizon.lang['base']['ok'],
                        "class": "btn btn-primary btn-xs",
                        click: function () {
                            $(this).dialog('close');
                            $.ajax({
                                url: urls.restore,
                                data: {id: id},
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
                    }
                ]
            });
        }
    };
    return horizon.manager['trashOperate'] = {
        openForm:operate.openForm,
        del:operate.del,
        restore:operate.restore
    };
}));