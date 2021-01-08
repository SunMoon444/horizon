/**
 * 字典回收站
 * @author yw
 */
(function (factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery','jqueryValidateAll', 'jqueryForm'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
	"use strict";
	var _height = {
		outerHeight: function() {
			var _height = $(window).height()
				- parseInt($('.page-content').css('paddingTop')) * 2;
			_height -= !$('.page-header').hasClass('hidden') ? $('.page-header').outerHeight(true) : 0;
			var $body = $('body');
			if($body.attr('data-layout') != 'left' && $body.attr('data-layout') != 'left-hoversubmenu') {
				_height -= ($('#sidebar').css('visibility') != 'hidden'?$('#sidebar').outerHeight(true):0);
			}
			if(!$body.hasClass('embed')) {
				_height -= $('#navbar').outerHeight(true);
			}
			return _height;
		},
		tableHeight:function(){
			var height =  _height.outerHeight()-$("#baseInfo").height();
			if(height<_height.outerHeight()/2){
				height = _height.outerHeight()/2;
			}
			return height;
		}
	};
	var showView={
		showAppTrash:function(){
			var viewUrl=horizon.paths.viewpath+"?viewId=HZ28868f5d078995015d07bd6f3900c8";
			$("#trash").attr("height",_height.tableHeight()).attr("src",viewUrl);
		}
	};
	var operate = {
		showInfo:function(id){
			$('#trashForm')[0].reset();
			$('#trashForm').dialog({
				width: $(window).width() > 750 ? '750' : 'auto',
				height: 'auto',
				maxHeight: $(window).height(),
				title: horizon.lang['platform-dict']['dictInfo'],
				closeText:horizon.lang['base']['close'],
				destroyAfterClose: false
			});
			operate.initInfo(id);
		},
		initInfo: function (id) {
			if(id!=null){
				$.ajax({
					url: horizon.paths.apppath+'/horizon/manager/dict/info.wf',
					cache: false,
					dataType: 'json',
					data: {
						"id": id
					},
					success: function(data) {
						if(data){
							$.each(data,function(i,key){
								$(parent.document).find('#trashForm input[name="' + i + '"]').val(key);
							});
						}else{
							parent.horizon.notice.error(horizon.lang['platform-dict']['getInfoFailed']);
						}
					}
				});
			}
		}
	};
	return horizon.manager['trash'] = {
		init:function(){
			showView.showAppTrash();
		},
		showInfo:operate.showInfo
    };
}));