/**
 * 流程移交
 * @author yaodd
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonTable', 'horizonSelectuser', 'gritter'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var $dialog=$('#handoverflow-dialog');
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
        ids:'',
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
                            name : 'flowName',
                            title : horizon.lang['handwork-common']['columnsFlowName'],
                            width : '200px',
                            searchable : true,
                            multipleSearchable : true
                        },
                        {
                            name : 'typeName',
                            title : horizon.lang['handwork-common']['flowTypeName'],
                            width : '200px',
                            searchable : true,
                            multipleSearchable:true
                        }
                    ],
                    buttons : [
                        {
                            id: 'moveFlow',
                            text: horizon.lang['handwork-common']['buttonsMoveItem'],
                            icon: 'fa fa-cog green',
                            fnClick: function(){
                                var flowIds = [];
                                $.each(table.mytable.checkRowDataArray,function(i,checkData){
                                    flowIds.push(checkData.flowId);
                                });
                                if(!flowIds.length){
                                	horizon.notice.error(horizon.lang['handwork-common']['selectMove']);
                                }else{
                                    table.ids = flowIds.join(";");
                                    operate.selectRecipient();
                                }
                            }
                        }
                    ]
                },
                ajaxDataSource: horizon.tools.formatUrl('/workcenter/handwork/flow/list')
            });
        }
    };
    var operate= {
        //打开人员选择框
        selectRecipient:function() {
            $.horizon.selectUser({
                multiple: false,
                selectDept: false,
                selectPosition: false,
                selectGroup: false,
               // isFlow: true,
                fnBackData: function() {
                    var $orgCheckedList = $('#org-checked-list');
                    var checkedData = $orgCheckedList.data('org-checked-list');
                    var id;
                    var name;
                    $.each(checkedData, function(key, value) {
                        id = value.id;
                        name = value.name;
                    });
                    horizon.engine.flowlist.authorOk(id,name);
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
                url: horizon.tools.formatUrl('/workcenter/handwork/transfer/flow'),
                dataType: 'json',
                cache: false,
                data: {
                    'receiveUserId':receiveUserId,
                    'receiveUserName':receiveUserName,
                    'flowId' : table.ids
                },
                error: function() {
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang.message['operateError']);
                },
                success: function(data) {
                    table.mytable.hideProcessing();
                    if(data.restype == 'success') {
                    	horizon.notice.success(data.msg[0]);
                        table.mytable.reload();
                    }else{
                    	horizon.notice.error(data.msg[0]);
                    }
                }
            });
        }
    };
    return horizon.engine['flowlist'] = {
        initTable: table.init,
        authorOk : operate.authorOk
    };
}));