/**
 * 部门岗位下人员列表
 * 
 * @author 马磊
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'jquery', 'gritter' ], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var  operate = {
        initUsers: function () {
            var allDatas = horizon.view.dataTable.fnGetData();
            $.each(allDatas, function (i, data) {
                pUserView.userIds += data.userid + ";";
                pUserView.userNames += data.name + ";";
            });
            var $form = "<div class='form'><input type='hidden' name='userIds' value='" + pUserView.userIds + "'/>" +
                "<input type='hidden' name='userNames' value='" + pUserView.userNames + "'/></div>";
            $("body").append($form);
        },
        getUrlParam:function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg);  //匹配目标参数
            if (r != null) return unescape(r[2]);
            return null; //返回参数值
        }
    };
    var pUserView = {
        userIds: '',
        userNames: '',
        initUsers: function () {
            var allDatas = horizon.view.dataTable.fnGetData();
            $.each(allDatas, function (i, data) {
                pUserView.userIds += data.userid + ";";
                pUserView.userNames += data.name + ";";
            });
            var $form = "<div class='form'><input type='hidden' id='userIds' name='userIds' value='" + pUserView.userIds + "'/>" +
                "<input type='hidden' id='userNames' name='userNames' value='" + pUserView.userNames + "'/></div>";
            $("body").append($form);
        },
        showSelectUsers: function () {
            pUserView.initUsers();
                var allDatas = horizon.view.dataTable.fnGetData();
                pUserView.userIds = '';
                $.each(allDatas, function (i, data) {
                    pUserView.userIds += data.userid + ";";
                });
                $("#userIds").val("");
                $("#userNames").val("");
                parent.$.horizon.selectUser({
                idField: 'userIds',
                cnField: 'userNames',
                multiple: true,
                position: false,
                group: false,
                dept: operate.getUrlParam('deptId'),
                selectDept: false,
                selectPosition: false,
                selectGroup: false,
                fnBackData: function () {
                    var $orgCheckedList = parent.$('#org-checked-list');
                    var checkedData = $orgCheckedList.data('org-checked-list');
                    var id = [];
                    var name = [];
                    $.each(checkedData, function (key, value) {
                        id.push(value.id);
                        name.push(value.name);
                    });
                    $('input[name="userIds"]').val(id.join(";") + ';');
                    $('input[name="userNames"]').val(name.join(";") + ';');
                    pUserView.addUsers();
                }
            });
        },
        addUsers: function () {
            var newUserIds = $('input[name="userIds"]').val();
            var newUserNames = $('input[name="userNames"]').val();
            $.ajax({
                type: "POST",
                data: {userIds: pUserView.userIds, newUserIds: newUserIds, positionId: operate.getUrlParam("positionId")},
                url: horizon.paths.apppath + "/horizon/manager/org/position/user/sava.wf",
                dataType: "json",
                success: function (data) {
                    if (data.restype == "success") {
                        parent.horizon.notice.success(data.msg[0]);
                        pUserView.userIds = newUserIds;
                        pUserView.userNames = newUserNames;
                        horizon.view.checkIds = [];
                        horizon.view.dataTable.fnDraw(true);
                        $('input[name="userIds"]').val("");
                        $('input[name="userNames"]').val("");
                    } else {
                        parent.horizon.notice.error(data.msg[0]);
                    }
                }
            });
        },
        //删除岗位下的人员
        deletePositionUser: function () {
            var positionUserIds = horizon.view.checkIds.join(";");
            if (positionUserIds == null || positionUserIds.length <= 0) {
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
                                    data: {positionUserId: positionUserIds},
                                    url: horizon.paths.apppath + "/horizon/manager/org/position/user/delete.wf",
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
        }
    };
    return horizon.manager['dpu'] = {
        showSelectUsers:pUserView.showSelectUsers,
        deletePositionUser:pUserView.deletePositionUser
    };
}));