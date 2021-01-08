/**
 * 应用中心组件表单js
 */
define(['jquery', 'iconsetFontawesome', 'iconsetGlyphicon', 'iconPicker'], function($) {
	horizon.impl_load = function() {
		//验证编号不能重复并且只能是数字
		$('input[name="' + horizon.form.formId + '_CODE"]').rules("add", {
			digits: true,
			remote: {
				url: horizon.paths.apppath + '/horizon/widgetapp/getWethersByCode.wf',
				type: 'post',
				cache: false,
				data: {
					code: function() { return $('input[name="' + horizon.form.formId + '_CODE"]').val()},
					dataId: function() { return $('input[name="' + horizon.form.formId + '_ID"]').val()}
				}
			},
			messages:{
				digits: "编号必须是数字并且为整数！",
				remote: "编号已经存在！"
			}
		});
		//验证高为数字
		$('input[name="' + horizon.form.formId + '_HEIGHT"]').rules("add", {
			digits: true,
			messages: {digits: "高必须是数字并且为整数!"}
		});
		//是否隐藏文本框
		if($('input[name="' + horizon.form.formId + '_AUTH"]:checked').val() == 'protected') {
			$('.widget-protected').removeClass('hidden');
			if(!ace.vars['touch']) {
		        $(window).trigger('resize.chosen');
		    }
		}else{
			$('.widget-protected').addClass('hidden');
		}
		//变换权限范围
		$('input[name="' + horizon.form.formId + '_AUTH"]').click(function() {
			if($(this).val() == 'protected'){
				$('.widget-protected').removeClass('hidden');
				if(!ace.vars['touch']) {
			        $(window).trigger('resize.chosen');
			    }
			}else{
				 $('.widget-protected').addClass('hidden');
				 $('input[name="' + horizon.form.formId + '_USER_ID"]').val('');
		  		 $('input[name="' + horizon.form.formId + '_DEPT_ID"]').val('');
		  		 $('input[name="' + horizon.form.formId + '_ROLE_ID"]').val('');
		  		 
		  		 $('input[name="T_' + horizon.form.formId + '_USER_ID"]').val('');
		  		 $('input[name="T_' + horizon.form.formId + '_DEPT_ID"]').val('');
		  		 $('input[name="T_' + horizon.form.formId + '_ROLE_ID"]').val('');
		  		 
		  		 $('input[name="T_' + horizon.form.formId + '_USER_ID_ID"]').val('');
		  		 $('input[name="T_' + horizon.form.formId + '_DEPT_ID_ID"]').val('');
		  		 $('input[name="T_' + horizon.form.formId + '_ROLE_ID_ID"]').val('');
		  		 
		  		 $('input[name="T_' + horizon.form.formId + '_USER_ID_EN"]').val('');
		  		 $('input[name="T_' + horizon.form.formId + '_DEPT_ID_EN"]').val('');
		  		 $('input[name="T_' + horizon.form.formId + '_ROLE_ID_EN"]').val('');
			}
		});
		var $icon = $('input[name="' + horizon.form.formId + '_ICON"]'); //图标
		var $btnIconG = $('#btnIconG');
		var $btnIconF = $('#btnIconF');
		$btnIconG.iconpicker({
			labelFooter: '',
			selectedClass: 'btn-warning',
			unselectedClass: 'btn-white'
		}).on('change', function(e) {
			if(e.icon == undefined) {
				return;
			}
			if('empty' == e.icon){
				$icon.val('');
			}else{
				$icon.val('glyphicon ' + e.icon);
				$btnIconF.find('input').val('glyphicon ' + e.icon);
			}
			$btnIconF.children('i').attr('class', 'empty');
	    }).on('click', function() {
	    	$btnIconF.removeClass('active');
	    	var $a = $('.search-control').css('width','none');
	    });
		$btnIconF.iconpicker({
			labelFooter: '',
			selectedClass: 'btn-warning',
			unselectedClass: 'btn-white',
			iconset: 'fontawesome'
		}).on('change', function(e) {
			if(e.icon == undefined) {
				return;
			}
			if('empty' == e.icon){
				$icon.val('');
				$(this).find('input').val('');
			}else{
				$icon.val('fa ' + e.icon);
			}
			$btnIconG.children('i').attr('class', 'empty');
	    }).on('click', function() {
	    	$btnIconG.removeClass('active');
	    	$('.search-control').css('width','none');
	    });
		$('.iconpicker ').find('span').remove();
		$btnIconF.find('input').attr('required',true);
		var iconType = $('input[name="' + horizon.form.formId + '_ICON_TYPE"]:checked').val(); //图标类型
		var classIcon = '';
		var imageIcon = '';
		if(iconType == 'class'){
			classIcon = $icon.val();
			if(classIcon.indexOf('glyphicon') > -1) {
				$btnIconG.children('i').addClass(classIcon);
				$btnIconG.find('span').remove();
			}else if(classIcon.indexOf('fa') > -1){
				$btnIconF.children('i').addClass(classIcon);
				$btnIconF.find('span').remove();
			}
			$btnIconF.find('input').val(classIcon);
			$('#iconBtn').removeClass('hidden');
			$('#iconInput').addClass('hidden');
		}else{
			imageIcon = $icon.val();
			$('#iconBtn').addClass('hidden');
			$('#iconInput').removeClass('hidden');
		}
		//变换图标类型
		$('input[name="' + horizon.form.formId + '_ICON_TYPE"]').click(function() {
			if($(this).val() == 'class'){
				$icon.val(classIcon);
				$('#iconBtn').removeClass('hidden');
				$('#iconInput').addClass('hidden');
			}else{
				$icon.val(imageIcon);
				$('#iconBtn').addClass('hidden');
				$('#iconInput').removeClass('hidden');
			}
		});
	};
	horizon.impl_afterSubmitSuccess = function(data) {
		var groupId = $('.chosen-select').val();
		parent.horizon.widgetapp.formSavaSuccess(data,groupId);
	};
});