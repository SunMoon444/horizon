/**
 * 正在移交
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
    var $dialog=$('#handover-dialog');
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
                    checkbox: 0,
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
                            columnClass: 'center'
                        },
                        {
                            name : 'startTime',
                            title : horizon.lang['handwork-common']['columnsStartTime'],
                            width : '200px',
                            columnClass: 'center'
                        }
                    ],
                    buttons : [
                        {
                            id: 'cancelMoveFlow',
                            text: horizon.lang['handwork-common']['buttonsCancelMoveFlow'],
                            icon: 'fa fa-times red2',
                            fnClick: function(){
                                var ids = table.mytable.checkRowKeyArray;
                                if(!ids.length){
                                	horizon.notice.error(horizon.lang['handwork-common']['selectCancel']);
                                }else{
                                    var ids=ids.join(';');
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
                                                    table.mytable.showProcessing();
                                                    operate.cancelMoveFlow(ids);
                                                    $(this).dialog('close');
                                                }
                                            }
                                        ]
                                    });
                                }
                            }
                        }
                    ],
                    pluginSettings: {
                        "order":[[4,'desc']]
                    }
                },
                ajaxDataSource: horizon.tools.formatUrl('/workcenter/handwork/hwait/list')
            });
        },
    };
    var operate={
        cancelMoveFlow:function(ids) {
            $.ajax({
                url:horizon.tools.formatUrl('/workcenter/handwork/cancel'),
                data:{
                    ids:ids
                },
                dataType: 'json',
                cache:false,
                error:function(){
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang.message['operateError']);
                },
                success:function(data){
                    table.mytable.hideProcessing();
                    if(data.restype == 'success'){
                    	horizon.notice.success(horizon.lang['handwork-common']['handoverWaitMoveSuccess']);
                        table.mytable.reload();
                    }else{
                    	horizon.notice.error(horizon.lang['handwork-common']['handoverWaitMoveFail']);
                    }
                }
            });
        }
    };
    return horizon.engine['hwaitlst'] = {
        initTable: table.init
    };
}));