/**
 * 初始化资源 @author zhangjf 2017年8月18日
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
		        initResources:horizon.paths.apppath+"/horizon/manager/auth/jurisdiction/resources/init.wf"
		 };
		var init = {
			/**
			 * 初始化授权
			 */
			grantInit:function(){
                var datas = horizon.view.checkDatas;
				if(datas == null || datas.length <= 0) {
                    parent.horizon.notice.error(horizon.lang["platform-permission-audit"]["resourcesToInitialized"]);
                    return;
                }

                var data ="";
                for (var i=0;i<datas.length;i++)
                {
                	data+=datas[i]["id"]+"_"+datas[i]["res_group_code"]+";";
                }
				$.ajax({
					url:urls.initResources,
					cache: false,
					dataType:'json',
                    type: 'post',
					data:{
						ids:data
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
		return horizon.manager['initresources'] = {
			grantInit:init.grantInit
		};
	})
);