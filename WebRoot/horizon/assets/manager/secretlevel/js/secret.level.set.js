/**
 * 人员密级设置 @author chengll
 */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery', 'gritter' ], factory);
	} else {
		factory(jQuery);
	}
}(function($) {
	"use strict";
	var urls ={
		save:horizon.paths.apppath+'/horizon/manager/secretlevel/save.wf',
		getLevel:horizon.paths.apppath+'/horizon/manager/secretlevel/info.wf',
		deleteSecret:horizon.paths.apppath+'/horizon/manager/secretlevel/delete.wf'
	};
	var check = {
		setLevel :function () {
			var ids = horizon.view.checkIds.join(";");
			if (ids == null || ids.length <= 0) {
				parent.horizon.notice.error(parent.horizon.lang['platform-secretlevel']['operateSecretLevel']);
			}else{
				check.openFrom(ids);
			}
		},
		deleteSecret : function (){
			var ids = horizon.view.checkIds.join(";");
			if (ids == null || ids.length <= 0) {
				parent.horizon.notice.error(parent.horizon.lang['platform-secretlevel']['deleteSecertLevelPersonnel']);
			}else{
				check.deleteSecretRequest(ids);
			}
		},
		deleteSecretRequest : function (ids){
			$(parent.document).find("#dialog-default").dialog({
                title: parent.horizon.lang['message']['title'],
                dialogText: parent.horizon.lang['platform-secretlevel']['cancelConfirm'],
                dialogTextType: 'alert-danger',
                closeText: parent.horizon.lang['base']['close'],
                buttons: [{
                	html: parent.horizon.lang['base']['ok'],
                    "class": "btn btn-primary btn-xs",
                    click: function () {
                        $(this).dialog('close');
						$.ajax({
							url : urls.deleteSecret,
							dataType:'json',
							data : {
								"ids" : ids
							},
							cache : false,
							type: 'post',
							error: function(){
								parent.horizon.notice.error(parent.horizon.lang['message']['operateError']);
							},
							success : function(data) {
                                if (data.restype=='success') {
                                    $(document).find('#secretLevelInfo').dialog('close');
                                    parent.horizon.notice.success(parent.horizon.lang['platform-secretlevel']['cancelSuccess']);
                                    horizon.view.checkIds = [];
                                    horizon.view.dataTable.fnDraw(true);
                                }else{
                                    parent.horizon.notice.success(data.msg[0]);
								}
							}
						});
                    }
                }]
			});
		},
		openFrom : function (id) {
			$(parent.document).find('#secretLevelInfo').removeClass('hidden');
			check.getLevel();
			$(parent.document).find('#secretLevelInfo').dialog({
				width: $(window).width() > 400 ? '400' : 'auto',
				height: '220',
				maxHeight: $(window).height(),
				title: parent.horizon.lang['platform-secretlevel']['secretLevelSetting'],
				closeText:parent.horizon.lang['base']['close'],
				buttons: [
					{
						html:parent.horizon.lang['base']['save'],
						"class" : "btn-primary",
						click: function() {
							var levelVal = $(parent.document).find('[name="secretLevel"]').find('option:selected').val();//选中的值;
							check.levelSubmit(id,levelVal);
						}
					}
				]
			});
		},
		levelSubmit : function (id,level){
			$.ajax({
				url : urls.save,
				dataType : 'json',
				data : {
					"ids" : id,
					"levelVal":level
				},
				cache : false,
				type: 'post',
				error : function() {
					parent.horizon.notice.error(parent.horizon.lang['message']['operateError']);
				},
				success : function(data) {
					if (data) {
						$(parent.document).find('#secretLevelInfo').dialog('close');
						parent.horizon.notice.success(parent.horizon.lang['message']['operateSuccess']);
						horizon.view.checkIds = [];
						horizon.view.dataTable.fnDraw(true);
					} else {
						parent.horizon.notice.error('操作失败！');
					}
				}
			});
		},
		getLevel : function (){
			$(parent.document).find("[name='secretLevel']").empty();
			$.ajax({
				url:urls.getLevel,
				cache: false,
				dataType:'json',
				type: 'post',
				error: function(){
					parent.horizon.notice.error(parent.horizon.lang['message']['operateError']);
				},
				success: function(data) {
					if(data) {
						var html="";
						for (var i=0;i<data.length;i++)
						{
							html +="<option  value ='"+data[i].dictValue+"'>"+data[i].dictName+"</option>";
						}
						$(parent.document).find("[name='secretLevel']").append(html);
					}else{
						parent.horizon.notice.error(parent.horizon.lang['platform-secretlevel']['failedSecretLevelInfor']);
					}
				}
			});
		}
	};
	return horizon.manager['setlevel'] = {
		setLevel:check.setLevel,
		deleteSecret:check.deleteSecret
	};
}));