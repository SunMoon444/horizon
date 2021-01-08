/**
 * 流程日志
 *
 * @author mawr
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        var scripts = [];
        if (!window.jQuery) {
            scripts.push('jquery');
        }
        scripts.push('horizonFlowtree', 'horizonTable');
        define(scripts, factory);
    }else {
        factory();
    }
}(function() {
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
        }
    };
    var flowLog = {
        tableObj: null,
        tree: {
            nodeId: null,
            groupId: null,
            init: function() {
                $('#flow-tree').flowtree({
                    defaultNode: [ {
                        id: 'allList',
                        type: 'item',
                        text: horizon.lang['base']['allflow'],
                        additionalParameters: {
                            'item-selected': true
                        }
                    } ],
                    defaultNodePosition: 'top',
                    selected: flowLog.tree.selNode,
                    deselected: flowLog.tree.deselected,
                    opened: flowLog.tree.selGroup,
                    closed: flowLog.tree.selGroup
                });
            },
            selNode: function() {
                if (arguments[1].target.id == 'allList') {
                    flowLog.tree.groupId = null;
                    flowLog.tree.nodeId = null;
                    flowLog.tableObj.setTitle(arguments[1].text);
                } else {
                    flowLog.tree.nodeId = arguments[1].target.flowId;
                    flowLog.tree.groupId = arguments[1].group;
                    flowLog.tableObj.setTitle(arguments[1].target.text);
                }
                flowLog.table.groupData();
            },
            selGroup: function() {
                $(arguments[0].target).find('.tree-item.tree-selected').removeClass('tree-selected');
                flowLog.tree.nodeId = null;
                flowLog.tree.groupId = arguments[1].group;
                flowLog.table.groupData();
                flowLog.tableObj.setTitle(arguments[1].text);
            },
            deselected: function() {
                $(arguments[1].el).addClass('tree-selected');
            }
        },
        table: {
            init: function() {
                flowLog.tableObj = $('#flowLogDatatable').horizonTable({
                    settings: {
                        title: horizon.lang['base']['allflow'],
                        multipleSearchable: true,
                        height: _height.outerHeight,
                        checkbox: -1,
                        columns: [ {
                            dataProp : 'id',
                            visible:false
                        }, {
                            name: 'title',
                            title: horizon.lang['flow-log']['formTitle'],
                            width: '200px',
                            searchable: true,
                            multipleSearchable: true,
                            fnClick: flowLog.info
                        }, {
                            name: 'flowName',
                            title: horizon.lang['flow-log']['formFlowName'],
                            width: '150px',
                            searchable: true,
                            multipleSearchable: true
                        }, {
                            name: 'nodeName',
                            title: horizon.lang['flow-log']['formNodeName'],
                            width: '80px',
                            searchable: true,
                            multipleSearchable: true,
                            columnClass: 'center'
                        }, {
                            name: 'actionName',
                            title: horizon.lang['flow-log']['formOperationName'],
                            width: '80px',
                            searchable: true,
                            columnClass: 'center'
                        }, {
                            name: 'userName',
                            title: horizon.lang['flow-log']['formOperator'],
                            width: '60px',
                            searchable: true,
                            columnClass: 'center'
                        },{
                            name: 'actionTime',
                            title: horizon.lang['flow-log']['formOperatingTime'],
                            width: '150px',
                            columnClass: 'center'
                        }, {
                            name: 'doTime',
                            title: horizon.lang['flow-log']['formCompletionTime'],
                            width: '100px',
                            orderable: false,
                            columnClass: 'center'
                        } ],
                        pluginSettings: {
                            "order":[[6, 'desc']]
                        }
                    },
                    ajaxDataSource: horizon.tools.formatUrl('/monitor/flowlog/page')
                });
            },
            groupData: function() {
                // 清空简单搜索项
                flowLog.tableObj.pluginTable._fnFilterComplete(flowLog.tableObj.pluginTable.fnSettings(), {
                    "sSearch": ''
                });
                var aoServerParams = flowLog.tableObj.pluginTable.fnSettings().aoServerParams;
                aoServerParams.push({
                    "fn": function(aoData) {
                        aoData.push({
                            'name': 'flowId',
                            'value': flowLog.tree.nodeId
                        });
                        aoData.push({
                            'name': 'type',
                            'value': flowLog.tree.groupId
                        });
                    }
                });
                flowLog.tableObj.pluginTable.fnDraw(false);
            }
        },
        info: function() {
            var $infoFormContainer = $('#infoFormContainer');
            var $formData = $('#flowLogForm');
            var rowData = arguments[2];
            $.each(rowData, function(key, val) {
                $formData.find('input[name="' + key + '"]').val(val);
            });
            $formData.find('input[name="name"]').val(rowData.nodeName);
            $infoFormContainer.dialog({
                width: $(window).width() > 700 ? '700' : 'auto',
                height: 'auto',
                maxHeight: $(window).height(),
                closeText:  horizon.lang['base']['close'],
                title: horizon.lang['flow-log']['information']
            });
        }
    };
    return horizon.engine['flowLog'] = {
        initFlowTree: flowLog.tree.init,
        initTable: flowLog.table.init
    };
}));
