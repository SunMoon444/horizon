/**
 * 代办历史纪录
 * @author yaodd
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonFlowtree', 'horizonTable', 'horizonJqueryui'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
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
        },
        infoTableHeight: function() {
            return $('#agentDealInfo').outerHeight(true) - $('.row-date').outerHeight(true) - 50;
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
                deselected:flowtree.deselected,
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
                    checkbox: -1,
                    columns: [
                        {
                            dataProp : 'id',
                            visible:false
                        },
                        {
                            name : 'flowName',
                            title : horizon.lang['agent-common']['flowName'],
                            width : '200px',
                            searchable : true,
                            multipleSearchable:true,
                            fnClick: infoTable.open
                        },
                        {
                            name : 'agentUserName',
                            title : horizon.lang['agent-common']['agentUserName'],
                            width : '150px',
                            multipleSearchable:true,
                            columnClass :'center'
                        },
                        {
                            name : 'beginDate',
                            title : horizon.lang['agent-common']['beginDate'],
                            width : '100px',
                            columnClass :'center'
                        },
                        {
                            name : 'endDate',
                            title : horizon.lang['agent-common']['endDate'],
                            width : '100px',
                            columnClass :'center'
                        },
                        {
                            name : 'status',
                            title : horizon.lang['agent-common']['status'],
                            width : '100px',
                            columnClass :'center'
                        }
                    ],
                    pluginSettings: {
                        "order":[[3,'desc'],[4,'desc']]
                    }
                },
                ajaxDataSource: horizon.tools.formatUrl('/workcenter/agent/history/list')
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
            $('input[name="flowName"]').val('');
            $('input[name="agentUserName"]').val('');
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

    var infoTable = {
        flowId: '',
        open: function(nTd, nTdData, rowData) {
            var $agentDealInfo = $('#agentDealInfo');
            $agentDealInfo.find('input[name="begindateInfo"]').val(rowData.beginDate);
            $agentDealInfo.find('input[name="enddateInfo"]').val(rowData.endDate);
            infoTable.flowId = rowData.id;
            infoTable.init();
            $agentDealInfo.dialog({
                width: $(window).width() > 900 ? '900':$(window).width(),
                height: $(window).height() > 600 ? '600' : 'auto',
                maxHeight: $(window).height(),
                minHeight:'500',
                title: '【' + rowData.flowName +'】' + horizon.lang['history-agent']['dialog'],
                addCloseBtn: false,
                open:function(){
                    if(!horizon.vars.touch){
                        $(window).trigger('resize.dataTable');
                    }
                }
            });
        },
        //初始化视图数据
        init: function() {
            var $infoTable = $('#infoTable');
            if($infoTable.data('horizonTable')) {
                infoTable.myTable.reload(true);
            }else {
                infoTable.myTable = $infoTable.horizonTable({
                    settings: {
                        title: horizon.lang.base['infoList'],
                        checkbox: -1,
                        height: _height.infoTableHeight,
                        searchable: false,
                        columns: [
                            {
                                dataProp : 'flowId',
                                visible:false
                            },
                            {
                                name : 'title',
                                title : horizon.lang['history-agent']['columnsTitle'],
                                width : '150px'
                            },
                            {
                                name : 'flowName',
                                title : horizon.lang['history-agent']['columnsFlowName'],
                                width : '150px'
                            },
                            {
                                name : 'saveTime',
                                title : horizon.lang['history-agent']['columnsSaveTime'],
                                width : '150px',
                                columnClass :'center'
                            }
                        ]
                    },
                    ajaxDataSource: horizon.tools.formatUrl('/workcenter/agent/dealinfo'),
                    ajaxDataParam: {
                        id: function() {
                            return infoTable.flowId;
                        }
                    }
                });
            }
        }
    };
    return horizon.engine['historyagentlist'] = {
        init:function() {
            flowtree.init();
            table.init();
        }
    };
}));