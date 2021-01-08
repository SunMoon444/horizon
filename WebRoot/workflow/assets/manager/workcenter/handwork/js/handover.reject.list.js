/**
 * 对方拒收工作
 * @author yaodd
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonTable', 'gritter'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var $dialog=$('#handoverrefuse-dialog');
    var table = {
        //初始化视图数据
        init: function() {
            table.mytable = $('#myDatatable').horizonTable({
                settings: {
                    title: horizon.lang.base['infoList'],
                    multipleSearchable : true,
                    height: function() {
                        var _height = horizon.tools.getPageContentHeight(),
                            $pageHeader = $('.page-header');
                        if($pageHeader.css('display') != 'none') {
                            _height -= $pageHeader.outerHeight(true);
                        }
                        return _height;
                    },
                    checkbox:0,
                    columns: [
                        {
                            dataProp : 'id'
                        },
                        {
                            name : 'title',
                            title : horizon.lang['handwork-common']['columnsTitle'],
                            width : '200px',
                            searchable : true,
                            multipleSearchable : true
                        },
                        {
                            name : 'flowName',
                            title : horizon.lang['handwork-common']['columnsFlowName'],
                            width : '200px',
                            searchable : true,
                            multipleSearchable : true
                        },
                        {
                            name : 'newName',
                            title : horizon.lang['handwork-common']['columnsNewName'],
                            width : '200px',
                            columnClass:'center'
                        }
                    ],
                    buttons:[
                        {
                            id: 'reMoveFlow',
                            text: horizon.lang['handwork-common']['handoverRejectRemoveFlow'],
                            icon: 'glyphicon glyphicon-refresh green',
                            fnClick:function() {
                                var ids = table.mytable.checkRowKeyArray;
                                if(!ids.length){
                                    if($('.gritter-item-wrapper').length > 0){
                                            	horizon.notice.error(horizon.lang['handwork-common']['selectRemove']);
                                    }else {
                                    	horizon.notice.error(horizon.lang['handwork-common']['selectRemove']);
                                    }
                                    return;
                                }else{
                                    $dialog.dialog({
                                        title:horizon.lang.message['title'],
                                        dialogText:horizon.lang['handwork-common']['removeConfirm'],
                                        dialogTextType:'alert-danger',
                                        closeText:horizon.lang.base['close'],
                                        buttons:[
                                            {
                                                html: horizon.lang.base['ok'],
                                                "class" : "btn btn-primary btn-xs",
                                                click: function() {
                                                    table.mytable.showProcessing();
                                                    operate.reMoveFlows(ids.join(';'));
                                                    $(this).dialog('close');
                                                }
                                            }
                                        ]
                                    });
                                }
                            }
                        },
                        {
                            id: 'cancelMoveFlow',
                            text: horizon.lang['handwork-common']['buttonsCancelMoveFlow'],
                            icon: 'fa fa-times red2',
                            fnClick:function() {
                                var ids = table.mytable.checkRowKeyArray;
                                if(!ids.length){
                                    if($('.gritter-item-wrapper').length > 0){
                                            	horizon.notice.error(horizon.lang['handwork-common']['selectCancel']);
                                    }else {
                                    	horizon.notice.error(horizon.lang['handwork-common']['selectCancel']);
                                    }
                                    return;
                                }else{
                                    $dialog.dialog({
                                        title:horizon.lang.message['title'],
                                        dialogText:horizon.lang['handwork-common']['cancelConfirm'],
                                        dialogTextType:'alert-danger',
                                        closeText:horizon.lang.base['close'],
                                        buttons:[
                                            {
                                                html: horizon.lang.base['ok'],
                                                "class" : "btn btn-primary btn-xs",
                                                click: function() {
                                                    operate.cancelMoveFlows(ids.join(';'));
                                                    $(this).dialog('close');
                                                }
                                            }
                                        ]
                                    });
                                }
                            }
                        }
                    ]
                },
                ajaxDataSource: horizon.tools.formatUrl('/workcenter/handwork/hreject/list')
            });
        }
    };
    var operate={
        //重新移交操作
        reMoveFlows:function(idsList) {
            $.ajax({
                url:horizon.tools.formatUrl('/workcenter/handwork/update'),
                dataType: 'json',
                data:{
                    ids:idsList,
                    status:'0'
                },
                cache: false,
                error:function(){
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang.message['operateError']);
                },
                success:function(data){
                    table.mytable.hideProcessing();
                    if(data.restype == 'success'){
                    	horizon.notice.success(horizon.lang.message['operateSuccess']);
                        table.mytable.reload();
                    }else{
                    	horizon.notice.error(horizon.lang.message['operateFail']);
                    }
                }
            });
        },
        //取消移交操作
        cancelMoveFlows:function(idsList) {
            $.ajax({
                url:horizon.tools.formatUrl('/workcenter/handwork/cancel'),
                dataType: 'json',
                data:{
                    ids:idsList,
                },
                cache: false,
                error:function(){
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang.message['operateError']);
                },
                success:function(data){
                    table.mytable.hideProcessing();
                    if(data.restype == 'success'){
                    	horizon.notice.success(horizon.lang.message['operateSuccess']);
                        table.mytable.reload();
                    }else{
                    	horizon.notice.error(horizon.lang.message['operateFail']);
                    }
                }
            });
        }
    };
    return horizon.engine['hrejectlst'] = {
        initTable: table.init
    };
}));