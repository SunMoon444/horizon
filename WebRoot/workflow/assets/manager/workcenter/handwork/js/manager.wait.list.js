/**
 * 移交接收
 * @author yaodd
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonFlowtree', 'horizonTable', 'gritter'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var $dialog=$('#handovermanager-dialog');
    var _height = {
        outerHeight: function() {
            var _height = horizon.tools.getPageContentHeight(),
                $pageHeader = $('.page-header');
            if($pageHeader.css('display') != 'none') {
                _height -= $pageHeader.outerHeight(true);
            }
            return _height;
        },
        treeHeight: function() {
            var outerHeight = this.outerHeight();
            var $container = $('.modal-dialog');
            return outerHeight - parseInt($container.css('borderTopWidth'))*2
                - parseInt($container.find('.modal-body').css('paddingTop'))*2
                - $container.find('.widget-header').outerHeight(true);
        }
    };
    var flowtree = {
        flowId:'',
        group: '',
        init: function() {
            //初始化流程树
            $('#flow-tree').flowtree({
                defaultNode: [
                    {
                        id: 'allWorkList',
                        type: 'item',
                        text: horizon.lang.base['allflow'],
                        additionalParameters: {
                            'item-selected': true
                        }
                    }
                ],
                defaultNodePosition: 'top',
                selected: flowtree.selected,
                deselected: flowtree.deselected,
                opened: flowtree.selGroup,
                closed: flowtree.selGroup
            });
        },
        selected: function() {
            flowtree.flowId=arguments[1].target.flowId;
            flowtree.group='';
            if(arguments[1].target.id == 'allWorkList') {//查询所有流程
                flowtree.flowId = '';
                table.getGroupData();
                table.mytable.setTitle(arguments[1].text);
            }else{
                table.getWorkListByFlowId();
                table.mytable.setTitle(arguments[1].target.text);
            }
        },
        deselected: function() {
            $(arguments[1].el).addClass('tree-selected');
        },
        selGroup: function() {
            $(arguments[0].target).find('.tree-item.tree-selected').removeClass('tree-selected');
            flowtree.group = arguments[1].group;
            flowtree.flowId = '';
            table.getGroupData();
            table.mytable.setTitle(arguments[1].text);
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
                            width : '100px',
                            columnClass: 'center'
                        },
                        {
                            name : 'newName',
                            title : horizon.lang['handwork-common']['columnsNewName'],
                            width : '100px',
                            columnClass: 'center'
                        },
                        {
                            name : 'startTime',
                            title : horizon.lang['handwork-common']['columnsStartTime'],
                            width : '150px',
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
                    ],
                    pluginSettings: {
                        "order":[[5,'desc']]
                    }
                },
                ajaxDataSource: horizon.tools.formatUrl('/workcenter/handwork/mwait/list')
            });
        },
        getWorkListByFlowId:function() {
            var aoServerParams = table.mytable.pluginTable.fnSettings().aoServerParams;
            aoServerParams.push({
                "fn": function(aoData){
                    aoData.push({
                        'name': 'flowId',
                        'value': flowtree.flowId
                    });
                    aoData.push({
                        'name': 'group',
                        'value': flowtree.group
                    });
                }
            });
            table.mytable.pluginTable.fnDraw(false);
        },
        getGroupData:function() {
            //清空简单搜索项
            table.mytable.pluginTable._fnFilterComplete(table.mytable.pluginTable.fnSettings(), {
                "sSearch": ''
            } );
            //清空高级搜索
            $('input[name="title"]').val('');
            $('input[name="flowName"]').val('');
            var aoServerParams = table.mytable.pluginTable.fnSettings().aoServerParams;
            aoServerParams.push({
                "fn": function(aoData){
                    aoData.push({
                        'name': 'group',
                        'value': flowtree.group
                    });
                }
            });
            table.mytable.pluginTable.fnDraw(false);
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
        rejectionFlows:function(idsList){
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
    return horizon.engine['managerwaitlist'] = {
        initFlowtree: flowtree.init,
        initTable: table.init
    };
}));