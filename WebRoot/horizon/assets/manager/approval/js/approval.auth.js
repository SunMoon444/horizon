/**
 * 审核权限 @author zhangjf 2017年8月16日
 */

(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery', 'gritter' ], factory);
	} else {
		factory(jQuery);
	}
}(function($) {
	horizon.language.getLanguage(['platform-permission-audit','message','base'], function(){});
	var urls = {
		authPass:horizon.paths.apppath+"/horizon/manager/auth/jurisdiction/authorization/approval.wf",
		delPass:horizon.paths.apppath+"/horizon/manager/auth/jurisdiction/delete.wf"
	};
	var check = {
		/**
		 * 权限通过审核
		 */
		checkAgree : function (){
			check.checkAuth(true);
		},
		/**
		 * 权限未通过审核
		 */
		checkNoAgree: function (){
			check.checkAuth(false);
		},
		/**
		 * 删除权限方法
		 */
		del : function (){
			var ids = horizon.view.checkIds.join(";");
			if(ids == null || ids.length <= 0){
				parent.horizon.notice.error(horizon.lang["platform-permission-audit"]["permissionsToDelete"]);
				return;
			}
			$(parent.document).find("#dialog-default").dialog({
                title: horizon.lang["message"]["title"],
                dialogText: horizon.lang["message"]["deleteConfirm"],
                dialogTextType: 'alert-danger',
                closeText: horizon.lang["base"]["close"],
                buttons: [{
                	html: horizon.lang["base"]["ok"],
                    "class": "btn btn-primary btn-xs",
                    click: function () {
                        $(this).dialog('close');
						$.ajax({
							url:urls.delPass,
							cache: false,
							dataType:'json',
					        type: 'post',
							data:{
								ids:ids
							},
							error: function(){
								parent.horizon.notice.error(horizon.lang["message"]["operateError"]);
							},
							success: function(data) {
								if (data.restype=='success') {
									parent.horizon.notice.success(horizon.lang["message"]["operateSuccess"]);
									horizon.view.checkIds = [];
									horizon.view.dataTable.fnDraw(true);
								} else {
									parent.horizon.notice.error(data.msg[0]);
								}
							}
						});
                    }
                }]
			});
		},
		/**
		 * 审核权限方法
		 */
		checkAuth : function(checkStatus){
			var ids = horizon.view.checkIds.join(";");
			if(ids == null || ids.length <= 0){
				parent.horizon.notice.error(horizon.lang["platform-permission-audit"]["rightToReviewed"]);
				return;
			}
			$.ajax({
				url:urls.authPass,
				cache: false,
				dataType:'json',
				type: 'post',
				data:{
					ids:ids,
					checkStatus:checkStatus
				},
				error: function(){
					parent.horizon.notice.error(horizon.lang["message"]["operateError"]);
				},
				success: function(data) {
                    if (data.restype=='success') {
						parent.horizon.notice.success(horizon.lang["message"]["operateSuccess"]);
						horizon.view.checkIds = [];
						horizon.view.dataTable.fnDraw(true);
					} else {
                        parent.horizon.notice.error(data.msg[0]);
					}
				}
			});
		}
	};
	return horizon.manager['authapproval'] = {
		checkAgree : check.checkAgree,
		checkNoAgree : check.checkNoAgree,
		del : check.del
	};
})
);
