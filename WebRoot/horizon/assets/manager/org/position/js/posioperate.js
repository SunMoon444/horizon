/**
 * 岗位视图操作，包括增删改
 * 
 * @author chengll
 */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery','ztree','jqueryValidateAll','jqueryForm',
				'horizonSelectuser'], factory);
	} else {
		factory(jQuery);
	}
}(function() {
	"use strict";
	var urls ={
		del:horizon.paths.apppath+'/horizon/manager/org/position/delete.wf'
	};
	var position ={
		openFrom:function(obj){
			var id=null;
			if(obj!=null){
				id = horizon.view.getRowData(obj).id;
			}
			parent.horizon.manager['position'].openForm(id);
		},
		del:function(){
			var ids = horizon.view.checkIds.join(";");
			if(ids == null || ids.length<=0){
				parent.horizon.notice.error(parent.horizon.lang["message"]["deleteHelp"]);
			}else{
				$(parent.document).find("#dialog-default").dialog({
					title: parent.horizon.lang["message"]["title"],
					dialogText: parent.horizon.lang["message"]["deleteConfirm"],
					dialogTextType:'alert-danger',
					closeText: parent.horizon.lang["base"]["close"],
					buttons: [
						{
							html: parent.horizon.lang["base"]["ok"],
							"class": "btn btn-primary btn-xs",
							click: function() {
								$(this).dialog('close');
								$.ajax({
									url: urls.del ,
									data: {positionIds: ids},
									cache: false,
									dataType:'json',
									error: function(){
										parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
									},
									success: function(data) {
										if(data.restype == "success") {
											parent.horizon.notice.success(data.msg[0]);
											var treeObj = parent.$.fn.zTree.getZTreeObj("position-tree");
											var nodes = treeObj.getSelectedNodes();
											if(ids.indexOf(nodes[0].id)!=-1){
												parent.window.location.reload();
											}else{
												parent.horizon.manager['position'].treeReload(nodes[0].id);
												horizon.view.checkIds = [];
												horizon.view.dataTable.fnDraw(true);
											}
										}else{
											parent.horizon.notice.error(data.msg[0]);
										}
									}
								});
							}
						}
					]
				});
			}
		}
	};
	return horizon.manager['posioperate'] = {
		openForm:position.openFrom,
		del:position.del
	};
}));