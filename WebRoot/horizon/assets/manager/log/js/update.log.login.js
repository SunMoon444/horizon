/**
 * 登录日志
 * 
 * @author lihh
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
		loginLogoutArchiving : horizon.paths.apppath
				+ '/horizon/manager/log/login/archive.wf',
		operateLogArchiving : horizon.paths.apppath
				+ '/horizon/manager/log/operate/archive.wf',
		delLoginLogout : horizon.paths.apppath
				+ '/horizon/manager/log/login/delete.wf',
		delOperateLog : horizon.paths.apppath
				+ '/horizon/manager/log/operate/delete.wf'
	};
	/* 登录注销日志查看 */
	var operate = {
		updateForm : function(obj) {
			var id = null;
			if (obj != null) {
				id = horizon.view.getRowData(obj).id;
			}
			parent.horizon.manager['loginlogout'].showLoginLog(id);
		},
		/* 其他日志查看 */
		openOperateLog : function(obj) {
			var id = null;
			if (obj != null) {
				id = horizon.view.getRowData(obj).id;
			}
			parent.horizon.manager['loginlogout'].showOprLog(id);
		},
		/* 登录注销日志与其他日志归档操作 */
		logArchiving : function(flag) {
			var logArchiving;
			if (flag == 1) {
				logArchiving = urls.loginLogoutArchiving;
			} else {
				logArchiving = urls.operateLogArchiving;
			}
			var ids = horizon.view.checkIds.join(";");
			if (ids == null || ids.length <= 0) {
				parent.horizon.notice.error(parent.horizon.lang['platform-log']['selectArchiveData']);
			} else {
				$("#dialog-message").dialog({
					title : parent.horizon.lang['message']['title'],
					dialogText : parent.horizon.lang['platform-log']['archiveConfirm'],
					dialogTextType : 'alert-danger',
					closeText : parent.horizon.lang['base']['close'],
					buttons : [ {
						html : parent.horizon.lang['base']['ok'],
						"class" : "btn btn-primary btn-xs",
						click : function() {
							$(this).dialog('close');
							$.ajax({
								url : logArchiving,
								cache : false,
								dataType : 'json',
								data : {
									"ids" : ids
								},
								error : function() {
									parent.horizon.notice
										.error(parent.horizon.lang['message']['operateError']);
								},
								success : function(data) {
									if (data.restype == "success") {
										parent.horizon.notice.success(data.msg[0]);
										horizon.view.checkIds = [];
										horizon.view.dataTable.fnDraw(true);
									} else {
										parent.horizon.notice.error(parent.horizon.lang['platform-log']['archivefailed']);
									}
								}
							});
						}
					} ]
				});
			}
		},
		/* 登录注销日志与其他日志删除操作 */
		delLog : function(flag) {
			var delLog;
			if (flag == 1) {
				delLog = urls.delLoginLogout;
			} else {
				delLog = urls.delOperateLog;
			}
			var ids = horizon.view.checkIds.join(";");
			if (ids == null || ids.length <= 0) {
				parent.horizon.notice.error(parent.horizon.lang['message']['operateHelp']);
			} else {
				$("#dialog-message").dialog({
					title : parent.horizon.lang['message']['title'],
					dialogText : parent.horizon.lang['message']['deleteConfirm'],
					dialogTextType : 'alert-danger',
					closeText : parent.horizon.lang['base']['close'],
					buttons : [ {
						html : parent.horizon.lang['base']['ok'],
						"class" : "btn btn-primary btn-xs",
						click : function() {
							$(this).dialog('close');
							$.ajax({
								url : delLog,
								cache : false,
								dataType : 'json',
								data : {
									ids : ids
								},
								error : function() {
									parent.horizon.notice.error(parent.horizon.lang['message']['operateError']);
								},
								success : function(data) {
									if (data.restype == "success") {
										parent.horizon.notice.success(data.msg[0]);
										horizon.view.checkIds = [];
										horizon.view.dataTable.fnDraw(true);
									} else {
										parent.horizon.notice.error(parent.horizon.lang['message']['deleteFailed']);
									}
								}
							});
						}
					} ]
				});
			}
		}
	};
	return horizon.manager['loginlogout'] = {
		updateForm:operate.updateForm,
		openOperateLog:operate.openOperateLog,
		logArchiving:operate.logArchiving,
		delLog:operate.delLog
	};
}));
