/**
 * 日志设置视图显示
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
		allModuleID:horizon.paths.apppath + '/horizon/manager/log/module/list.wf',
		logSetInfo : horizon.paths.apppath+ '/horizon/manager/log/logset/info.wf',
		logSetInfoSave : horizon.paths.apppath+ '/horizon/manager/log/logset/save.wf',
		delLogSetting : horizon.paths.apppath+ '/horizon/manager/log/logset/delete.wf'
	};
	var event = {
		/*修改或者添加信息*/
		saveInfo : function(id){
			$('#logSetForm')[0].reset();
			$('label[id*="-error"]').html('');
			$('input[name="id"]').val('');
			if (id != null) {
				$('.form-group').removeClass('has-error');
				$('#lookLogSetInfo').dialog({
					width : $(window).width() > 750 ? '750' : 'auto',
					height : 'auto',
					maxHeight : $(window).height(),
					title : horizon.lang['platform-log']['logSet'],
					closeText : horizon.lang['base']['close'],
					buttons : [
						{
							html : horizon.lang['base']['save'],
							"class" : "btn-primary",
							click : function() {
								$('#logSetForm').submit();
							}
						}
					]
				});
				$.ajax({
					url : urls.logSetInfo,
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
							/*回显数据*/
							$.each(data, function(key, value) {
								if(key!="active"){
									$('#logSetForm input[name="' + key + '"]').val(value);
									$('#logSetForm select[name="' + key + '"]').val(value);
									$('#logSetForm radio[name="' + key + '"]').val(value);
									$('#logSetForm textarea[name="' + key + '"]').val(value);
								}
							});
							/*回显单选按钮*/
							$("input[name='active']").each(function(){
								if($(this).val()==data.active){
									$(this).prop("checked",true);
								}else{
									$(this).prop("checked",false);
								}
							});
						} else {
							horizon.notice.error(horizon.lang['message']['getInfoFailed']);
						}
					}
				});
			} else {
				$('#key').addClass('has-error');
				$('#operUrl').addClass('has-error');
				$('#logName').addClass('has-error');
				$('#cycleValue').addClass('has-error');
				$('#lookLogSetInfo').dialog({
					width : $(window).width() > 750 ? '750' : 'auto',
					height : 'auto',
					maxHeight : $(window).height(),
					closeText :horizon.lang['base']['close'],
					buttons : [ {
						html :horizon.lang['base']['save'],
						"class" : "btn-primary",
						click : function() {
							$('#logSetForm').submit();
						}
					}]
				});
			}
		},
   		/*表单验证*/
		checkForm : function(){
			horizon.language.getLanguage(["message","validator"],function(){
				$('#logSetForm').validate({
					focusInvalid : false,
					rules : {
						cycleValue : {
							digits : true
						},
						operUrl : {
							oneOrTwo : true
						},
						logKey : {
							oneOrTwo : true
						}
					},
					messages : {
						cycleValue : {
							digits : horizon.lang['platform-log']['formatIsNum']
						}
					},
					errorClass: 'help-block no-margin-bottom',
					highlight : function(e) {
						$(e).closest('.form-group').addClass('has-error');
					},
					success : function(e) {
						if($('#logSetForm input[name="logKey"]').val()!="" ||
							$('#logSetForm input[name="operUrl"]').val()!=""){
							$('#logSetForm input[name="logKey"]').closest('.form-group').removeClass('has-error');
							$('#logSetForm input[name="operUrl"]').closest('.form-group').removeClass('has-error');
							$('#key-error').remove();
							$('#operUrl-error').remove();
						}
						$(e).closest('.form-group')
							.removeClass('has-error');
						$(e).remove();
					},
					submitHandler : function(form) {
						$(form).ajaxSubmit(
							{
								url : urls.logSetInfoSave,
								dataType : 'json',
								type : 'POST',
								cache : false,
								error : function() {
									horizon.notice.error(horizon.lang['message']['operateError']);
								},
								success : function(data) {
									if (data.restype == "success") {
										horizon.notice.success(data.msg[0]);
										$('#lookLogSetInfo').dialog('close');
										$("#logSetList")[0].contentWindow
											.horizon.view.dataTable.fnDraw(true);
									} else {
										horizon.notice.error(data.msg[0]);
									}
								}
							}
						);
					}
				});
				/*自定义验证*/
				 jQuery.validator.addMethod('oneOrTwo', function(value, element) {
					 var keyValue = $('#logSetForm input[name="logKey"]').val();
					 var operUrl = $('#logSetForm input[name="operUrl"]').val();
					 if(operUrl != ''){
					 	return true;
					 }else if(keyValue != ''){
					 	return true;
					 }
				 }, horizon.lang['platform-log']['formValidator']);
			})
		}
	};
	/*获取模块Id*/
	var moduleId ={
		module:function(){
			$.ajax({
				url:urls.allModuleID,
				dataType:'json',
				cache: false,
				error:function() {
					horizon.notice.error(horizon.lang['message']['getInfoFailed']);
				},
				success:function(data) {
					$.each(data,function(index,item){
						var $option = $('<option value="' +
							item.id + '">' + item.appName + '</option>');
						$("#moduleId").append($option);
					});
				}
			});
		}
	};
	var showView={
		showLogSetList:function(){
			var viewUrl = horizon.paths.viewpath + "?viewId=HZ28868a5d1a8978015d1ac285200032";
			$("#logSetList").attr("height",_height.outerHeight()).attr("src",viewUrl);
		}
	};
	return horizon.manager['logsetting'] = {
		init:function(){
			showView.showLogSetList();
     		moduleId.module();
		},
		saveLogSet : event.saveInfo,
		checkForm : event.checkForm
    };
}));
