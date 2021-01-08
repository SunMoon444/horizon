/**
 * 查看密码
 * @author zhangpei
 */
(function (factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery','horizonJqueryui'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var urls = {
        info : horizon.paths.apppath + '/horizon/manager/org/user/password/show.wf',
        deleteUserPassword : horizon.paths.apppath + '/horizon/manager/org/user/password/delete.wf'
    };
    var operate = {
        //查看密码详细信息
        openPswFrom:function (obj) {
            if (obj != null) {
                var userId = horizon.view.getRowData(obj).id;
                parent.horizon.manager['allpassword'].openForm(userId);
            }
        },
        //删除密码
        deleteUserPassword:function () {
            var ids = horizon.view.checkIds.join(";");
            if (ids == null || ids.length <= 0) {
                parent.horizon.notice.error(parent.horizon.lang["message"]["deleteHelp"]);
            } else {
            	$(parent.document).find("#dialog-default").dialog({
                    title:  parent.horizon.lang["message"]["title"],
                    dialogText: parent.horizon.lang["message"]["deleteConfirm"],
                    dialogTextType: 'alert-danger',
                    closeText: parent.horizon.lang["base"]["close"],
                    buttons: [
                        {
                            html:  parent.horizon.lang["base"]["ok"],
                            "class": "btn btn-primary btn-xs",
                            click: function () {
                                $(this).dialog('close');
                                $.ajax({
                                    data: {ids: ids},
                                    url: urls.deleteUserPassword,
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
        //打开最近一次密码信息
        openLastTimePswFrom:function (obj) {
            if (obj != null) {
                var userId = horizon.view.getRowData(obj).id;
                parent.horizon.manager['lasttime'].openForm(userId);
            }
        }
    };
    return horizon.manager['psword'] = {
        openPswFrom:operate.openPswFrom,
        deleteUserPassword:operate.deleteUserPassword,
        openLastTimePswFrom:operate.openLastTimePswFrom
    };
}));

