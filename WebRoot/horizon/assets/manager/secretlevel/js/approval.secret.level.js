/**
 * 人员密级设置 @author zhangjf 2017年8月18日
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
		auth:horizon.paths.apppath+'/horizon/manager/secretlevel/approval.wf'
	};
	var authLevel = {
		examineUserSecretLevel : function (status) {
			var ids = horizon.view.checkIds.join(";");
			if (ids == null || ids.length <= 0) {
				parent.horizon.notice.error(parent.horizon.lang['platform-secretlevel']['reviewSecretLevel']);
			}else{
				authLevel.openFrom(ids,status);
			}
		},
		openFrom : function (id,status){
			$.ajax({
				url : urls.auth,
				dataType : 'json',
				data : {
					"ids" : id,
					"status":status
				},
				cache : false,
				type: 'post',
				error : function() {
					parent.horizon.notice.error(parent.horizon.lang['message']['operateError']);
				},
				success : function(data) {
                    if (data.restype=='success') {
						$(parent.document).find('#secretLevelInfo').dialog('close');
						parent.horizon.notice.success(parent.horizon.lang['message']['operateSuccess']);
						horizon.view.checkIds = [];
						horizon.view.dataTable.fnDraw(true);
					} else {
						parent.horizon.notice.error(data.msg[0]);
					}
				}
			});
		}
	};
	return horizon.manager['authlevel'] = {
			examineUserSecretLevel:authLevel.examineUserSecretLevel
	};
}));