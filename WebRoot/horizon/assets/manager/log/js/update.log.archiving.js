/**
 * 归档日志
 * 
 * @author 李欢欢
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
		delOtherLogArching : horizon.paths.apppath
				+ '/horizon/manager/log/archiving/operate/delete.wf',
		delLoginArchiving : horizon.paths.apppath
				+ '/horizon/manager/log/archiving/login/delete.wf'
	};
	var operate = {
		/* 归档登录注销日志与其他日志删除操作 */
		delArchivingLog : function(flag) {
			var delLogArchiving;
			if (flag == 1) {
				delLogArchiving = urls.delLoginArchiving;
			} else {
				delLogArchiving = urls.delOtherLogArching;
			}
			var ids = horizon.view.checkIds.join(";");
			if (ids == null || ids.length <= 0) {
				parent.horizon.notice.error(parent.horizon.lang['message']['deleteHelp']);
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
								url : delLogArchiving,
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
										parent.horizon.notice.error(data.msg[0]);
									}
								}
							});
						}
					} ]
				});
			}
		}
	};
	return horizon.manager['logarchiving'] = {
		delArchivingLog : operate.delArchivingLog
	};
}));
