/**
 * 角色成员变更审核 @author zhangjf 2017年8月18日
 */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery', 'gritter' ], factory);
	} else {
		factory(jQuery);
	}
}(function($) {
		"use strict";
         horizon.language.getLanguage(['platform-permission-audit','message','base'], function(){});
		 var urls = {
		        authRole: horizon.paths.apppath + '/horizon/manager/auth/jurisdiction/role/approval.wf'
		 };
		var auth = {
			/**
			 * 通过角色变更审核
			 */
			checkRoleAgree:function(){
				auth.checkAuth(true);
			},
			/**
			 * 未通过角色变更审核
			 */
			checkNoRoleAgree:function(){
				auth.checkAuth(false);
			},
			/**
			 * 审核角色变更方法
			 */
			checkAuth:function(status){
				var ids = horizon.view.checkIds.join(";");
				if(ids == null || ids.length <= 0){
					parent.horizon.notice.error(horizon.lang["platform-permission-audit"]["rightToReviewed"]);
					return;
				}
				$.ajax({
					url:urls.authRole,
					cache: false,
					dataType:'json',
                    type: 'post',
					data:{
						ids:ids,
						status:status
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
		return horizon.manager['authrole'] = {
			checkRoleAgree:auth.checkRoleAgree,
			checkNoRoleAgree:auth.checkNoRoleAgree
		};
	})
);