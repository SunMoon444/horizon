/**
 * 事项移交
 * @author yaodd
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonFlowtree', 'horizonTable', 'horizonSelectuser', 'gritter'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var $dialog=$('#handoveritem-dialog');
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
        idsList:'',
        trackIds:'',
        subjectionIds:'',
        subjectionTypes:'',
        //初始化视图数据
        init: function() {
            table.mytable = $('#myDatatable').horizonTable({
                settings: {
                    title: horizon.lang.base['allflow'],
                    multipleSearchable: true,
                    height: _height.outerHeight,
                    checkbox: 0,
                    columns: [
                        {
                            dataProp: 'id'
                        },
                        {
                            name: 'title',
                            title: horizon.lang['handwork-common']['columnsTitle'],
                            width: '200px',
                            searchable: true,
                            multipleSearchable: true
                        },
                        {
                            name: 'flowName',
                            title: horizon.lang['handwork-common']['columnsFlowName'],
                            width: '200px',
                            searchable: true,
                            multipleSearchable: true
                        },
                        {
                            name: 'startTime',
                            title: horizon.lang['handwork-common']['columnsStartTime'],
                            width: '200px',
                            columnClass:'center'
                        },
                        {
                            name: 'subjectionType',
                            title: horizon.lang['item-list']['subjectionType'],
                            width: '100px',
                            orderable: false,
                            columnClass:'center'
                        }
                    ],
                    buttons : [
                        {
                            id: 'moveItem',
                            text: horizon.lang['handwork-common']['buttonsMoveItem'],
                            icon: 'fa fa-cog green',
                            fnClick: function(){
                                var ids = table.mytable.checkRowKeyArray;
                                if(!ids.length){
                                	horizon.notice.error(horizon.lang['handwork-common']['selectMove']);
                                }else{
                                    var ids = [];
                                    var trackid = [];
                                    var subjectionId = [];
                                    var subjectionType = [];
                                    $.each(table.mytable.checkRowDataArray,function(i,checkData){
                                        ids.push(checkData.id);
                                        trackid.push(checkData.trackId);
                                        subjectionId.push(checkData.subjectionId);
                                        subjectionType.push(checkData.subjectionType == null || checkData.subjectionType == ''  ? 'null' : checkData.subjectionType)
                                    })
                                    table.idsList = ids.join(';');
                                    table.trackIds = trackid.join(';');
                                    table.subjectionIds = subjectionId.join(';');
                                    table.subjectionTypes = subjectionType.join(';');
                                    operate.selectRecipient();
                                }
                            }
                        }
                    ],
                    fnCreateCell: function(nTd, nTdData, rowData, iRow, i){
                        var _html = '';
                        if(i == 4) {//操作列
                            var type = subjectType[nTdData] == undefined ? "" : subjectType[nTdData];
                            _html = '<label title="' + type + '">' + type + '</label>';
                        }
                        if(_html != '') {
                            var $ntd = $(nTd);
                            $ntd.html(_html);
                        }
                    },
                    pluginSettings: {
                        "order":[[3,'desc']]
                    }
                },
                ajaxDataSource: horizon.tools.formatUrl('/workcenter/handwork/item/list')
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
            $('input[name="title"]').val('');
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
    var operate= {
        selectRecipient:function(){
            $.horizon.selectUser({
                multiple: false,
                selectDept: false,
                selectPosition: false,
                selectGroup: false,
                fnBackData: function() {
                    var $orgCheckedList = $('#org-checked-list');
                    var checkedData = $orgCheckedList.data('org-checked-list');
                    var id;
                    var name;
                    $.each(checkedData, function(key, value) {
                        id = value.id;
                        name = value.name;
                    });
                    horizon.engine.itemlist.authorOk(id,name);
                }
            });
        },
        //验证所选择的人员
        authorOk:function(receiveUserId,receiveUserName) {
            if(receiveUserName == '' ||  receiveUserId == ''){
            	horizon.notice.error(horizon.lang['handwork-common']['noUser']);
                return;
            }
            $.ajax({
                url:horizon.tools.formatUrl('/workcenter/agent/check/userid'),
                dataType: 'json',
                data:{
                    selectUserId:receiveUserId
                },
                cache:false,
                errror:function() {
                	horizon.notice.error(horizon.lang.message['operateError']);
                },
                success:function(data) {
                    if(data != true){
                    	horizon.notice.error(horizon.lang['handwork-common']['sameError']);
                        return;
                    }else{
                        table.mytable.showProcessing();
                        operate.moveFlows(receiveUserId,receiveUserName);
                    }
                }
            })
        },
        moveFlows : function(receiveUserId,receiveUserName) {
            $.ajax({
                url:horizon.tools.formatUrl('/workcenter/handwork/transferItem'),
                dataType: 'json',
                cache:false,
                data:{
                    'receiveUserId':receiveUserId,
                    'receiveUserName':receiveUserName,
                    'idsList' : table.idsList,
                    'trackIds' : table.trackIds,
                    'subjectionIds' : table.subjectionIds,
                    'subjectionTypes' : table.subjectionTypes
                },
                error:function(){
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang.message['operateError']);
                },
                success:function(data){
                    table.mytable.hideProcessing();
                    if(data.restype == 'success'){
                    	horizon.notice.success(data.msg[0]);
                        table.mytable.reload();
                    }else{
                    	horizon.notice.error(data.msg[0]);
                    }
                }
            });
        }
    };
    var subjectType = {
        "D": horizon.lang['item-list']['subjectTypeDept'],
        "U": horizon.lang['item-list']['subjectTypeUser'],
        "R": horizon.lang['item-list']['subjectTypeUser'],
        "G": horizon.lang['item-list']['subjectTypeGroup'],
        "P": horizon.lang['item-list']['subjectTypePost'],
        "S": horizon.lang['item-list']['subjectTypeSubdept']
    };
    return horizon.engine['itemlist'] = {
        initFlowtree: flowtree.init,
        initTable: table.init,
        authorOk : operate.authorOk
    };
}));