/**
 * 角色详情页
 * 
 * @author chengll
 */
$delUserDialog = $(parent.document).find("#delUserDialog");
$startContainDialog = $(parent.document).find("#startContainDialog");

var urls = {
	resourceTree : horizon.paths.apppath + '/horizon/manager/role/resource/tree.wf',
	addRoleUser : horizon.paths.apppath + '/horizon/manager/role/user/save.wf',
	delRoleUser : horizon.paths.apppath + '/horizon/manager/role/user/delete.wf',
	authManage : horizon.paths.apppath + '/horizon/manager/role/auth/manage.wf'
};

//角色成员选择人员框
function selRoleUser() {
	var roleId = $(parent.document).find("input[name='id']").val();
	parent.$.horizon.selectUser({
		multiple : true,
		selectDept : true,
		selectPosition : true,
		selectGroup : true,
		selsectUser : true,
		dept : true,
		position : true,
		group : true,
		role : false,
		fnBackData : function() {
			var checkSpan = $(parent.document).find('#org-checked-list').find(
					"span");
			var ids = "";
			$.each(checkSpan, function(key, value) {
				ids += value.id + ";";
			});
			addRoleUser(ids, roleId);
		}
	});
}
function addRoleUser(userIds, roleId) {
    if (roleId == null || userIds == null || userIds.length <= 0) {
        parent.horizon.notice.error(parent.horizon.lang["message"]["selectAddData"]);
        return;
    }
	$.ajax({
				type : "POST",
				data : {
					ids : userIds,
					roleId : roleId
				},
				url : urls.addRoleUser,
				dataType : "json",
				success : function(data) {
					parent.horizon.notice.success(data.msg[0]);
					horizon.view.checkIds = [];
					horizon.view.dataTable.fnDraw(true);
				}
			});
}

//删除角色成员
function delRoleUser() {
	var roleId = $(parent.document).find("input[name='id']").val();
	var ids = horizon.view.checkIds.join(";");
	if (ids == null || ids.length <= 0) {
		parent.horizon.notice.error(parent.horizon.lang["message"]["deleteHelp"]);
	} else {
		$delUserDialog.dialog(
				{
					title : parent.horizon.lang["message"]["title"],
					dialogText : parent.horizon.lang["message"]["deleteConfirm"],
					dialogTextType : 'alert-danger',
					closeText : parent.horizon.lang["base"]["close"],
					buttons : [ {
						html : parent.horizon.lang["base"]["ok"],
						"class" : "btn btn-primary btn-xs",
						click : function() {
							$(this).dialog('close');
							$.ajax({
								data : {
									ids : ids,
									roleId : roleId
								},
								url : urls.delRoleUser,
								cache : false,
								dataType : 'json',
								error : function() {
									parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
								},
								success : function(data) {
									if (data.restype == "success") {
										parent.horizon.notice.success(data.msg[0]);
										horizon.view.checkIds = []
										horizon.view.dataTable.fnDraw(true);
									} else {
										parent.horizon.notice.error(data.msg[0]);
									}
								}
							});
						}
					} ]
				});
	}
}

//启用包含
function authManage(flag) {
	var roleId = $(parent.document).find("input[name='id']").val();
	var ids = horizon.view.checkIds.join(";");
	var verifyType = flag;
	var msg;
	if(flag==1){
		msg = parent.horizon.lang["platform-role"]["enableDownAuth"];
	}else{
		msg = parent.horizon.lang["platform-role"]["cancelDownAuth"];
	}
	if (ids == null || ids.length <= 0) {
		parent.horizon.notice.error(parent.horizon.lang["message"]["operateHelp"]);
	} else {
		$startContainDialog.dialog(
				{
					title : parent.horizon.lang["message"]["title"],
					dialogText : msg,
					dialogTextType : 'alert-danger',
					closeText :  parent.horizon.lang["base"]["close"],
					buttons : [ {
						html : parent.horizon.lang["base"]["ok"],
						"class" : "btn btn-primary btn-xs",
						click : function() {
							$(this).dialog('close');
							$.ajax({
								data : {
									ids : ids,
									roleId : roleId,
									verifyType : verifyType
								},
								url : urls.authManage,
								cache : false,
								dataType : 'json',
								error : function() {
									parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
								},
								success : function(data) {
									if (data.restype == "success") {
										parent.horizon.notice.success(data.msg[0]);
										horizon.view.checkIds = []
										horizon.view.dataTable.fnDraw(true);
									} else {
										parent.horizon.notice.error(data.msg[0]);
									}
								}
							});
						}
					} ]

				});
	}
}
