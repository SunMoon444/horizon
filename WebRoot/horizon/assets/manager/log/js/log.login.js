/**
 * 登录日志
 *
 * @author lihh
 */
(function (factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery', 'jqueryValidateAll','ztree',
                'elementsFileinput'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
	"use strict";
	var _height = {
		outerHeight : function() {
			var _height = horizon.tools.getPageContentHeight() - 30;
			return _height;
		}
	};
	var urls ={
		loginLogoutInfo : horizon.paths.apppath + '/horizon/manager/log/login/info.wf',
		operateLogInfo : horizon.paths.apppath+ '/horizon/manager/log/operate/info.wf'
	};
	/*日志回显*/
	var showLog={
		/*登录注销日志回显*/
		showLogin:function(id){
			$('#lookLogInfo').dialog({
				width : $(window).width() > 750 ? '750' : 'auto',
				height : 'auto',
				maxHeight : $(window).height(),
				title : horizon.lang['platform-log']['loginOrOffInfo'],
				closeText : horizon.lang['base']['close']
			});
			if (id != null) {
				$.ajax({
					url : urls.loginLogoutInfo,
					cache : false,
					dataType : 'json',
					data : {
						"id" : id
					},
					error : function() {
						horizon.notice.error(horizon.lang['message']['operateError']);
					},
					success : function(data) {
						if (data) {
							$.each(data, function(key, value) {
								$('#logForm input[name="' + key + '"]').val(value);
							});
                            $('#logForm textarea[name="logContext"]').val(data.logContext);
							$('#lookLogInfo').removeClass("hidden");
							$('#lookOperateLogInfo').addClass("hidden");
						} else {
							horizon.notice.error(horizon.lang['message']['getInfoFailed']);
						}
					}
				});
			}
		},
		/*操作日志回显*/
		showOperate:function(id){
			$('#lookOperateLogInfo').dialog({
				width : $(window).width() > 750 ? '750' : 'auto',
				height : 'auto',
				maxHeight : $(window).height(),
				title : horizon.lang['platform-log']['opreateLogInfo'],
				closeText : horizon.lang['base']['close']
			});
			if (id != null) {
				$.ajax({
					url : urls.operateLogInfo,
					cache : false,
					dataType : 'json',
					data : {
						"id" : id
					},
					error : function() {
						horizon.notice.error(horizon.lang['message']['operateError']);
					},
					success : function(data) {
						if (data) {
							$.each(data, function(key, value) {
								$('#OperateLogForm input[name="' + key + '"]').val(value);
							});
							$('#OperateLogForm textarea[name="logContext"]').val(data.logContext);
							$('#lookOperateLogInfo').removeClass("hidden");
							$('#lookLogInfo').addClass("hidden");
						} else {
							horizon.notice.error(horizon.lang['message']['getInfoFailed']);
						}
					}
				});
			}
		}
	};
	/*根据前台的参数选择显示不同的视图*/
	var select = {
		selItem:function(logInfo){
			if(logInfo == 'login_log'){
                $("#logInfo").removeClass("hidden");
                showView.showLogList();
                $("#operateLogInfo").addClass("hidden")
			}else{
                $("#operateLogInfo").removeClass("hidden");
				showView.showOperateLogList();
                $("#logInfo").addClass("hidden")
			}
		}
	};
	var showView={
		 showLogList:function(){
			 var viewUrl = horizon.paths.viewpath + "?viewId=HZ2886865d121dc3015d127d6a260032";
			 $("#logList").attr("height",_height.outerHeight()).attr("src",viewUrl);  
		 }, 
		 showOperateLogList:function(){
			  var viewUrl = horizon.paths.viewpath + "?viewId=HZ28868a5e7e6b1b015e7f2d50bb017c";
			  $("#operatelogList").attr("height",_height.outerHeight()).attr("src",viewUrl);  
	     }
	};
	return horizon.manager['loginlogout'] = {
		init:function(){
			var logInfo = horizon.tools.getPageParam('loginType');
            select.selItem(logInfo)
		},
		showLoginLog:showLog.showLogin,
		showOprLog:showLog.showOperate
    };
}));



