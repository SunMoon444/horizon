/**
 * 流程共享设置
 * @author yaodd
 */
(function (factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonFlowtree', 'horizonTable', 'horizonSelectuser',
            'jqueryValidateAll', 'jqueryForm', 'gritter', 'elementsSpinner'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var $dialog = $('#dialog-default');
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
        group: '',
        init: function() {
            //初始化流程树
            $('#flow-tree').flowtree({
                data: {
                    type: 'flow'
                },
                defaultNode: [
                    {
                        id: 'allFlow',
                        type: 'item',
                        text: horizon.lang['base']['allflow'],
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
            if(arguments[1].target.id == 'allFlow') {//查询所有流程
                flowtree.flowId = '';
                table.getGroupData();
                table.mytable.setTitle(arguments[1].text);
                $('#add').addClass('hidden');
            }else{
                table.getWorkListByFlowId();
                table.mytable.setTitle(arguments[1].target.text);
                $('#add').removeClass('hidden');
                $('input[name="flowId"]').val(flowtree.flowId);
            }
        },
        deselected: function() {
            $(arguments[1].el).addClass('tree-selected');
        },
        selGroup: function() {
            $(arguments[0].target)
                .find('.tree-item.tree-selected').removeClass('tree-selected');
            flowtree.group = arguments[1].group;
            flowtree.flowId = '';
            table.getGroupData();
            table.mytable.setTitle(arguments[1].text);
            $('#add').addClass('hidden');
        }
    };
    var table = {
        init:function() {
            table.mytable = $('#myDatatable').horizonTable({
                settings: {
                    title: horizon.lang['base']['allflow'],
                    height: _height.outerHeight,
                    checkbox: 0,
                    columns: [
                        {
                            dataProp: 'flowId'
                        },
                        {
                            name: 'flowId',
                            title: horizon.lang['flow-share']['columnsFlowId'],
                            searchable: true,
                            width: '250px',
                            fnClick: operate.getNode
                        },
                        {
                            name: 'flowName',
                            title: horizon.lang['flow-share']['columnsFlowName'],
                            searchable: true,
                            width: '300px'
                        },
                        {
                            name: 'useType',
                            title: horizon.lang['flow-share']['applicationType'],
                            columnClass: 'align-center',
                            searchable: true
                        }
                    ],
                    buttons: [
                        {
                            id: 'add',
                            text: horizon.lang['base']['new'],
                            icon: 'fa fa-plus green',
                            fnClick: function() {
                                operate.getNode();
                            }
                        },
                        {
                            id: 'delete',
                            text: horizon.lang['base']['delete'],
                            icon: 'fa fa-times red2',
                            fnClick: function() {
                                var param = [];
                                $.each(table.mytable.checkRowDataArray,function(i,checkData){
                                    var flowId = checkData.flowId;
                                    var useType = checkData.useType;
                                    param.push(flowId + '-' +useType);
                                });

                                if (!param.length) {
                                    if($('.gritter-item-wrapper').length > 0){
                                        $.gritter.removeAll({
                                            after_close: function() {
                                            	horizon.notice.error(horizon.lang['flow-share']['selectDataToDelete']);
                                            }
                                        });
                                    }else{
                                    	horizon.notice.error(horizon.lang['flow-share']['selectDataToDelete']);
                                    }
                                    return;
                                }else{
                                    $dialog.dialog({
                                        closeText:horizon.lang['base']['cancel'],
                                        title:horizon.lang['message']['title'],
                                        dialogText:horizon.lang['flow-share']['confirmDelete'],
                                        dialogTextType:'alert-danger',
                                        buttons: [
                                            {
                                                html: horizon.lang['base']['ok'],
                                                "class" : "btn btn-primary btn-xs",
                                                click: function() {
                                                    table.mytable.showProcessing();
                                                    operate.del(param.join(';'));
                                                    $( this ).dialog( "close" );
                                                }
                                            }
                                        ]
                                    });
                                }
                            }
                        }
                    ]
                },
                ajaxDataSource: horizon.tools.formatUrl('/manager/exterioruser/list')
            });
            $('#add').addClass('hidden');
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
        getGroupData: function() {
            //清空简单搜索项
            table.mytable.pluginTable._fnFilterComplete(table.mytable.pluginTable.fnSettings(), {
                "sSearch": ''
            } );
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
    var operate = {
        getNode:function() {
            $('input[name="useType"]')[0].readOnly = false;
            $('input[name="useType"]').removeClass('ignore');
            $('input[name="nodeId"]').val('');
            var flowId = $('input[name="flowId"]').val();
            var $validate = operate.checkForm();
            $validate.resetForm();
            //清除表单验证提示信息
            $('.form-group').removeClass('has-error');
            var rowData = arguments[2];
            if(rowData == undefined){
                //获取节点列表数据
                $.ajax({
                    url:horizon.tools.formatUrl('/manager/exterioruser/nodelist'),
                    cache: false,
                    data:{
                        flowId:flowId
                    },
                    error:function(){
                    	horizon.notice.error(horizon.lang['message']['operateError']);
                    },
                    success:function(data) {
                        operate.createNodeList(data);
                    }
                });
            }else{
                flowtree.flowId = rowData.flowId;
                $('input[name="flowId"]').val(rowData.flowId);
                $('input[name="useType"]').val(rowData.useType).attr('readOnly','readOnly').addClass('ignore');
                operate.createNodeList(JSON.stringify(rowData.nodeList));
                operate.findNodeValue(rowData.flowId,rowData.useType);
            }

        },
        //回显节点列表数据
        findNodeValue:function(flowId,useType){
            $.ajax({
                url:horizon.tools.formatUrl('/manager/exterioruser/flow/list'),
                dataType:'json',
                data:{
                    'flowId': flowId,
                    'useType': useType
                },
                cache:false,
                error:function() {
                	horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success:function(data) {
                    if(data){
                        $.each(data,function(i,row) {
                            $('input[name="' + row.nodeId+ '_author"]').val(row.author);
                            $('input[name="' + row.nodeId+ '_authorName"]').val(row.authorName);
                            $('input[name="' + row.nodeId+ '_reader"]').val(row.reader);
                            $('input[name="' + row.nodeId+ '_readerName"]').val(row.readerName);
                            $('input[name="' + row.nodeId+ '_limitTime"]').val(row.limitTime);
                        });
                    }
                }
            });
        },
        //生成节点列表
        createNodeList:function(data) {
            if(data){
                $('#nodeTbody').html('');
                var nodeId = '';
                $.each($.parseJSON(data), function(i,row) {
                	var nodeid = row.nodeid;
                	if(nodeid.indexOf("Virtual") < 0){
                		 var option = '<tr><td class="center">' + row.nodename + '<input class="hidden" name="nodeId" type="text" value="' + row.nodeid + '"></td>';
                         var limit;
                         if(row.IsSelAuthor == '1') {
                             option += '<td><input class="col-sm-12 pointer" name="' + row.nodeid + '_authorName" readonly type="text" /><input name="' + row.nodeid + '_author" type="hidden" /></td>';
                             limit = '<td class="center"><input class="col-sm-12" name="' + row.nodeid + '_limitTime" type="text"/></td>';
                         }else{
                             option += '<td><input name="' + row.nodeid + '_author" type="hidden" /></td>';
                             limit = '<td><input name="' + row.nodeid + '_limitTime" type="hidden" /></td>';
                         }
                         if(row.IsSelReader == '1') {
                             option += '<td><input class="col-sm-12 pointer" name="' + row.nodeid + '_readerName" readonly type="text" /><input name="' + row.nodeid + '_reader" type="hidden" /></td>';
                         }else{
                             option += '<td><input name="' + row.nodeid + '_reader" type="hidden" /></td>';
                         }
                         option += limit;
                         option += '</tr>'
                         $('#nodeTbody').append($(option));
                         $('input[name="' + row.nodeid + '_authorName"]').on(horizon.tools.clickEvent(), function() {
                             $.horizon.selectUser({
                                 idField: row.nodeid + '_author',
                                 cnField: row.nodeid + '_authorName',
                                 fnClose:function() {
                                     $('#infoContainer').closest('.ui-dialog').show().next().show();
                                 }
                             });
                             $('#infoContainer').closest('.ui-dialog').hide().next().hide();
                         });
                         $('input[name="' + row.nodeid + '_readerName"]').on(horizon.tools.clickEvent(), function() {
                             $.horizon.selectUser({
                                 idField: row.nodeid + '_reader',
                                 cnField: row.nodeid + '_readerName',
                                 fnClose:function() {
                                     $('#infoContainer').closest('.ui-dialog').show().next().show();
                                 }
                             });
                             $('#infoContainer').closest('.ui-dialog').hide().next().hide();
                         });
                         //初始化办理期限框
                         $('input[name*="_limitTime"][type!="hidden"]').ace_spinner({
                             value:0,
                             min:0,
                             step:1,
                             btn_up_class:'btn-info' ,
                             btn_down_class:'btn-info'
                         });
                         //办理期限不能输入小数
                         $('input[name*="_limitTime"][type!="hidden"]').blur(function () {
                             var g = /^[1-9]*[1-9][0-9]*$/;
                             if (!g.test($(this).val())){
                             	$('input[name*="_limitTime"][type!="hidden"]').val(0);
                             }
                         });
                	}
                });
            }
            operate.openFrom(data);
        },
        //打开表单
        openFrom:function(data) {
            var flowId = flowtree.flowId;
            var flowName = null;
            $.each($.parseJSON(data), function(i,row) {
                if(flowId == row.flowid){
                    flowName = row.flowname;
                }
            });
            $('input[name="flowId"]').val(flowId);
            $('#infoContainer').dialog({
                width: $(window).width() > 900?'900':'auto',
                height: 'auto',
                maxHeight: $(window).height(),
                title:flowName,
                closeText:horizon.lang['base']['cancel'],
                buttons:[
                    {
                        html: horizon.lang['base']['save'],
                        "class" : "btn btn-primary btn-xs",
                        click: function() {
                            $("#infoFrom").submit();
                        }
                    }
                ]
            });
        },
        //验证表单
        checkForm:function(){
            return $('#infoFrom').validate({
                ignore: '.ignore',
                rules: {
                    useType: {
                        letterAndNumber: true,
                        remote:{
                            url:horizon.tools.formatUrl('/manager/exterioruser/check/usetype'),
                            cache: false,
                            data:{
                                useType : function(){
                                    return $('#infoFrom').find('input[name="useType"]').val();
                                },
                                flowId : function(){
                                    return $('#infoFrom').find('input[name="flowId"]').val();
                                }
                            }
                        }
                    },
                    limitTime :{
                        number:true
                    }
                },
                messages: {
                    useType:{
                        remote:horizon.lang['flow-share']['appTypeExists']
                    },
                    limitTime :{
                        number:horizon.lang['flow-share']['mustNumeric']
                    }
                },
                errorClass: 'help-block col-xs-12 col-sm-reset inline',
                errorPlacement: function (error, element) {
                    error.insertAfter(element.closest('div[class*="col-"]'));
                },
                focusInvalid : false,
                highlight : function(e) {
                    $(e).closest('.form-group').addClass('has-error');
                },
                success : function(e) {
                    $(e).closest('.form-group').removeClass('has-error');
                    $(e).remove();
                },
                submitHandler: function (form){
                    table.mytable.showProcessing();
                    $(form).ajaxSubmit({
                        url:horizon.tools.formatUrl('/manager/exterioruser/save'),
                        dataType:'json',
                        type:'post',
                        error:function() {
                            table.mytable.hideProcessing();
                            horizon.notice.error(horizon.lang['message']['operateError']);
                        },
                        success: function(data) {
                            table.mytable.hideProcessing();
                            if(data.restype == 'success'){
                                $("#infoContainer").dialog('close');
                                horizon.notice.success(horizon.lang['message']['saveSuccess']);
                                table.mytable.pluginTable.fnDraw(false);
                            }else{
                            	horizon.notice.error(horizon.lang['message']['saveFail']);
                            }
                        }
                    });
                }
            });
        },
        //删除
        del:function(param) {
            $.ajax({
                url:horizon.tools.formatUrl('/manager/exterioruser/delete'),
                dataType:'json',
                data:{
                    'param':param
                },
                cache:false,
                error:function() {
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success:function(data) {
                    table.mytable.hideProcessing();
                    if(data.restype == 'success'){
                    	horizon.notice.success(horizon.lang['message']['deleteSuccess']);
                        table.mytable.reload();
                    }else{
                    	horizon.notice.error(horizon.lang['message']['deleteFail']);
                    }
                }
            });
        }
    };

    return horizon.engine['flowshare'] = {
        init:function(){
            table.init();
            flowtree.init();
            operate.checkForm();
        }
    };
}));