/**
 * 人员密级列表显示 @author chengll
 */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery', 'gritter' ], factory);
	} else {
		factory(jQuery);
	}
}(function($) {
	"use strict";
	var _height = {
		outerHeight : function() {
			var _height = $(window).height()
				- parseInt($('.page-content').css('paddingTop')) * 2;
			_height -= !$('.page-header').hasClass('hidden') ? $('.page-header').outerHeight(true) : 0;
			var $body = $('body');
			if ($body.attr('data-layout') != 'left' && $body.attr('data-layout') != 'left-hoversubmenu') {
				_height -= ($('#sidebar').css('visibility') != 'hidden' ? $('#sidebar').outerHeight(true) : 0);
			}
			if (!$body.hasClass('embed')) {
				_height -= $('#navbar').outerHeight(true);
			}
			return _height;
		}
	};
	var operate = {
		showViewList : function() {
			var viewUrl = horizon.paths.viewpath + "?viewId=HZ2881155d06291e015d062e61f90064";
			$("#secretLevelList").attr("height", _height.outerHeight()).attr("src", viewUrl);
		}
	};
	return horizon.manager['secretlevel'] = {
		init : function() {
			operate.showViewList();
		}
	};
}));