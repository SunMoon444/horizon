/**
 * 日志设置页面
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
		delLogSetting : horizon.paths.apppath
				+ '/horizon/manager/log/logset/delete.wf'
	};
	parent.horizon.manager['logsetting'].checkForm();
	/* 修改或新增日志设置信息 */
	var operate = {
		openLogSetInfo : function(obj) {
			var id = null;
			if (obj != null) {
				id = horizon.view.getRowData(obj).id;
			}
			parent.horizon.manager['logsetting'].saveLogSet(id);
		},
		/* 删除日志设置信息 */
		delLogSeting : function() {
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
								url : urls.delLogSetting,
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
										parent.horizon.notice.success(parent.horizon.lang['message']['deleteFailed']);
									}
								}
							});
						}
					} ]
				});
			}
		}
	};
	return horizon.manager['logsetting'] = {
		openLogSetInfo : operate.openLogSetInfo,
		delLogSeting : operate.delLogSeting
	};
}));
