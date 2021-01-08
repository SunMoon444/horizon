/**
 * 全部密码列表
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
	var _height = {
		outerHeight: function() {
			var _height = horizon.tools.getPageContentHeight()-30;
			return _height;
		}
	};
	//打开视图
	var showView={
		allpassword:function(){
			var viewUrl = horizon.paths.viewpath+"?viewId=HZ2886895d167fc1015d16911bff0032";
			$("#allpassword").attr("height",_height.outerHeight()).attr("src",viewUrl);
		}
	};
	var formOperate={
		openPswFrom:function(id){
			$('#pswForm')[0].reset();
			$('input[name="id"]').val('');
			$('input[name="userId"]').val('');
			$('#pswInfo').dialog({
				width: $(window).width() > 750 ? '750' : 'auto',
				height: 'auto',
				maxHeight: $(window).height(),
				title: horizon.lang["platform-lasttime"]["info"],
				closeText:horizon.lang["base"]["close"]
			});
			formOperate.initInfo(id);
		},
		initInfo:function (id) {
			if(id!=null){
				$.ajax({
					url: horizon.paths.apppath + '/horizon/manager/org/user/password/show.wf',
					cache: false,
					dataType: 'json',
					data: {
						"id": id
					},
					error: function() {
						horizon.notice.error(horizon.lang["message"]["operateError"]);
					},
					success: function(data) {
						if(data){
							$.each(data,function(i,key){
								$('#pswForm input[name="' + i + '"]').val(key);
							});
						}else{
							horizon.notice.error(horizon.lang["message"]["getInfoFailed"]);
						}
					}
				});
			}else{
				horizon.notice.error(horizon.lang["message"]["getInfoFailed"]);
			}
		}
	};
	return horizon.manager['allpassword'] = {
		init:function(){
			showView.allpassword();
		},
		openForm:formOperate.openPswFrom
	};
}));