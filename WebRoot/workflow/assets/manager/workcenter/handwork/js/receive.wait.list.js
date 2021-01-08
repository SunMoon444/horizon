/**
 * 移交接收
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
    var $dialog=$('#handoverreceive-dialog');
    var _height = {
        outerHeight: function() {
            var _height = horizon.tools.getPageContentHeight(),
                $pageHeader = $('.page-header');
            if($pageHeader.css('display') != 'none') {
                _height -= $pageHeader.outerHeight(true);
            }
            return _height;
        }
    };
    var table = {
        //初始化视图数据
        init: function() {
            table.mytable = $('#myDatatable').horizonTable({
                settings: {
                    title: horizon.lang.base['allflow'],
                    multipleSearchable : true,
                    height:_height.outerHeight,
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
                            name : 'oldName',
                            title : horizon.lang['handwork-common']['columnsOldName'],
                            width : '200px',
                            columnClass: 'center'
                        }
                    ],
                    buttons : [
                        {
                            id: 'receiveFlow',
                            text: horizon.lang['handwork-common']['receiveFlow'],
                            icon: 'fa fa-cog green',
                            fnClick: function() {
                                var ids = table.mytable.checkRowKeyArray;
                                if(!ids.length){
                                    if($('.gritter-item-wrapper').length > 0){
                                            	horizon.notice.error(horizon.lang['handwork-common']['selectReceive']);
                                    }else {
                                    	horizon.notice.error(horizon.lang['handwork-common']['selectReceive']);
                                    }
                                    return;
                                }else{
                                    $dialog.dialog({
                                        title:horizon.lang.message['title'],
                                        closeText:horizon.lang.base['close'],
                                        dialogText:horizon.lang['handwork-common']['receiveConfirm'],
                                        dialogTextType:'alert-danger',
                                        buttons:[
                                            {
                                                html: horizon.lang.base['ok'],
                                                "class" : "btn btn-primary btn-xs",
                                                click: function() {
                                                    table.mytable.showProcessing();
                                                    var titleObj = {};
                                                    $.each(table.mytable.checkRowDataArray,function(i,checkData){
                                                        titleObj[checkData.id] = checkData.title;
                                                    });
                                                    operate.receiveFlows(ids.join(";"), titleObj);
                                                    $(this).dialog('close');
                                                }
                                            }
                                        ]
                                    });
                                }
                            }
                        },
                        {
                            id: 'rejectionFlow',
                            text: horizon.lang['handwork-common']['rejectionFlow'],
                            icon: 'fa fa-times red2',
                            fnClick:function() {
                                var ids = table.mytable.checkRowKeyArray;
                                if(!ids.length){
                                    if($('.gritter-item-wrapper').length > 0){
                                            	horizon.notice.error(horizon.lang['handwork-common']['selectReject']);
                                    }else {
                                    	horizon.notice.error(horizon.lang['handwork-common']['selectReject']);
                                    }
                                }else{
                                    $dialog.dialog({
                                        title:horizon.lang.message['title'],
                                        closeText:horizon.lang.base['close'],
                                        dialogText:horizon.lang['handwork-common']['rejectConfirm'],
                                        dialogTextType:'alert-danger',
                                        buttons:[
                                            {
                                                html: horizon.lang.base['ok'],
                                                "class" : "btn btn-primary btn-xs",
                                                click: function() {
                                                    table.mytable.showProcessing();
                                                    operate.rejectionFlows(ids.join(";"));
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
                ajaxDataSource: horizon.tools.formatUrl('/workcenter/handwork/rwait/list')
            });
        }
    };
    var operate={
        //接收操作
        receiveFlows:function(idsList, titleObj) {
            $.ajax({
                url:horizon.tools.formatUrl('/workcenter/handwork/receivework'),
                dataType: 'json',
                data:{
                    idsList:idsList
                },
                cache: false,
                error:function(){
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang.message['operateError']);
                },
                success:function(data){
                    table.mytable.hideProcessing();
                    var msg = '';
                    $.each(data, function(key,value) {
                        msg += '【' + titleObj[key] + '】' + (value == 'true' ? horizon.lang['handwork-common']['managerRejectSuccess']+'</br>' : horizon.lang['handwork-common']['managerRejectFail']+'</br>' );
                    });
                    horizon.notice.success(msg);
                    table.mytable.reload();
                }
            });
        },
        //拒收操作
        rejectionFlows:function(idsList) {
            $.ajax({
                url:horizon.tools.formatUrl('/workcenter/handwork/update'),
                dataType: 'json',
                data:{
                    ids:idsList,
                    status:'99'
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
    return horizon.engine['rwaitlst'] = {
        initTable: table.init
    };
}));