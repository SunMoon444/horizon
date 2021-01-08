/**
 * 密码最后一次修改
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
		showLastTime:function(){
			var viewUrl = horizon.paths.viewpath+"?viewId=HZ2886895d1657c2015d167ca3230035";
			$("#lasttime").attr("height",_height.outerHeight()).attr("src",viewUrl);
		}
	};
	//打开最近一次密码的详细信息
	var formOperate = {
		openForm:function(id){
			$('#pswLastTimeForm')[0].reset();
			$('input[name="id"]').val('');
			$('input[name="userId"]').val('');
			$('#pswLastTimeInfo').dialog({
				width: $(window).width() > 750 ? '750' : 'auto',
				height: 'auto',
				maxHeight: $(window).height(),
				title: horizon.lang["platform-lasttime"]["info"],
				closeText:horizon.lang["base"]["close"]
			});
			formOperate.initLastTimeInfo(id);
		},
		initLastTimeInfo:function (id) {
			if(id!=null){
				$.ajax({
					url:horizon.paths.apppath + '/horizon/manager/org/user/password/show.wf',
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
								$('#pswLastTimeForm input[name="' + i + '"]').val(key);
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
	return horizon.manager['lasttime'] = {
		init:function(){
			showView.showLastTime();
		},
		openForm:formOperate.openForm
	};
}));