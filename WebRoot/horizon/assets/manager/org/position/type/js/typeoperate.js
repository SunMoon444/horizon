/**
 * 岗位类别设置视图操作，包括增删改
 * 
 * @author chengll
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
		del:horizon.paths.apppath+'/horizon/manager/org/position/type/delete.wf'
	};
	var operate = {
        del:function (){
			var ids = horizon.view.checkIds.join(";");
			if (ids == null || ids.length <= 0) {
				parent.horizon.notice.error(parent.horizon.lang["message"]["deleteHelp"]);
			} else {
				$(parent.document).find("#dialog-default").dialog({
					title: parent.horizon.lang["message"]["title"],
					dialogText: parent.horizon.lang["message"]["deleteConfirm"],
					dialogTextType: 'alert-danger',
					closeText: parent.horizon.lang["base"]["close"],
					buttons: [
						{
							html: parent.horizon.lang["base"]["ok"],
							"class": "btn btn-primary btn-xs",
							click: function () {
								$(this).dialog('close');
								$.ajax({
									url: urls.del,
									dataType: 'json',
									data: {
										"ids": ids
									},
									cache: false,
									error: function () {
										parent.horizon.notice.error(parent.horizon.lang["message"]["operateError"]);
									},
									success: function (data) {
										if (data.restype == "success") {
											parent.horizon.notice.success(data.msg[0]);
											var treeObj = parent.$.fn.zTree.getZTreeObj("type-tree");
											var nodes = treeObj.getSelectedNodes();
											if (ids.indexOf(nodes[0].id) != -1) {
												parent.window.location.reload();
											} else {
												parent.horizon.manager['positiontype'].treeReload(nodes[0].id);
												horizon.view.checkIds = [];
												horizon.view.dataTable.fnDraw(true);
											}
										} else {
											parent.horizon.notice.error(data.msg[0]);
										}
									}
								});
							}
						}
					]
				});
			}
		},
    	openFrom: function (obj) {
        	var id;
        	if (obj == null) {
            	id = null;
        	} else {
            	id = horizon.view.getRowData(obj).id;
       	 	}
        	parent.horizon.manager['positiontype'].openForm(id);
    	}
	};
    return horizon.manager['typeOperate'] = {
        del:operate.del,
        openFrom:operate.openFrom
    };
}));
    	