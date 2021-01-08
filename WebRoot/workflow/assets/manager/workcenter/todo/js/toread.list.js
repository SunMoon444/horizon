/**
 * 待阅事宜
 * @author yaodd
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonFlowtree', 'horizonTable'], factory);
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
            table.mytable = $('#myDatatable').horizonTable( {
                settings:{
                    title: horizon.lang.base['allflow'],
                    multipleSearchable : true,
                    height: _height.outerHeight,
                    checkbox: -1,
                    columns :[
                        {
                            dataProp : 'workId',
                            visible:false
                        },
                        {
                            name : 'title',
                            title : horizon.lang['todo-common']['columnsTitle'],
                            width : '250px',
                            visible : true,
                            searchable : true,
                            multipleSearchable : true,
                            fnClick :table.openToDoInfo
                        },
                        {
                            name : 'flowName',
                            title : horizon.lang['todo-common']['columnsFlowName'],
                            width : '200px',
                            visible : true,
                            searchable : true,
                            multipleSearchable:true
                        },
                        {
                            name : 'sendUserName',
                            title : horizon.lang['todo-common']['columnsSendUserName'],
                            width : '100px',
                            visible : true,
                            columnClass :'center'
                        },
                        {
                            name : 'sendTime',
                            title : horizon.lang['todo-common']['columnsSendTime'],
                            width : '150px',
                            visible : true,
                            columnClass :'center'
                        },
                        {
                            name:'trackId',
                            visible:false
                        }
                    ],
                    pluginSettings: {
                        "order":[[4, 'desc']]
                    }
                },
                ajaxDataSource: horizon.tools.formatUrl('/workcenter/todo/toread/list')
            } );
        },
        initAdvancedSearch: function() {
            $('#advancedSearchSubBtn').bind(horizon.tools.clickEvent(), function() {
                var aoServerParams = table.mytable.fnSettings().aoServerParams;
                aoServerParams.push({
                    "fn": function(aoData){
                        aoData.push({
                            'name': 'advSearchTitle',
                            'value': $('.advancedSearchMain').find("input[name='title']").val()
                        });
                        aoData.push({
                            'name': 'advSearchFlowname',
                            'value': $('.advancedSearchMain').find("input[name='flowname']").val()
                        });
                    }
                });
                table.mytable.fnDraw(false);
            });
            $('#advancedSearchResetBtn').bind(horizon.tools.clickEvent(), function() {
                $('.form-search')[0].reset();
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
        },
        //打开流程待办认领
        openToDoInfo: function() {
            var workid = arguments[2].workId;
            var trackid = arguments[2].trackId;
            var url = horizon.paths.flowpath + '?workId=' + workid + '&trackId=' + trackid;
            horizon.open({url:url});
        }
    };
    return horizon.engine['toreadlist'] = {
        initFlowtree: flowtree.init,
        initTable: table.init
    };
}));