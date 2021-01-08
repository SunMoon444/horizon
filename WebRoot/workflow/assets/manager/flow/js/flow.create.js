/**
 * 流程建模
 * @author zhouwf
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonFlowtree', 'horizonTable', 'gritter'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
    "use strict";

    var $dialog = $('#dialog-default');

    var flowDesignerUrl = horizon.static ? (horizon.paths.syspath + '/module/flash/HorizonWorkflow.html')
        : (horizon.paths.apppath + '/horizon/module/flash/flow/designer'+ horizon.paths.urlsuffix);

    var _height = {
        outerHeight : function() {
            var _height = horizon.tools.getPageContentHeight(),
                $pageHeader = $('.page-header');
            if($pageHeader.css('display') != 'none') {
                _height -= $pageHeader.outerHeight(true);
            }
            return _height;
        },
        treeHeight : function() {
            var outerHeight = this.outerHeight();
            var $container = $('.flowtree-widget-box');
            return outerHeight - parseInt($container.css('borderTopWidth'))*2
                - parseInt($container.find('.modal-body').css('paddingTop'))*2
                - $container.find('.widget-header').outerHeight(true);
        },
        flowframeHeight: function() {
            var $flowframeWidgetBox = $('#flowframe-widget-box');
            if($flowframeWidgetBox.hasClass('fullscreen')) {
                return $(window).height()-$flowframeWidgetBox.find('.widget-header').outerHeight(true);
            }else {
                return this.outerHeight();
            }
        }
    };

    var flowcreate = {
        commonDeleteFlow:function(flowIds, versions ,flowNameObj) {
            $.ajax({
                url : horizon.tools.formatUrl('/manager/flow/delflow'),
                data : {'flowids': flowIds, 'versions' : versions},
                cache : false,
                dataType : 'json',
                error : function () {
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang.message['operateError']);
                },
                success : function(data) {
                    table.mytable.hideProcessing();
                    $.gritter.removeAll();
                    var msg = '';
                    $.each(data, function(key,value) {
                        if(value == 'undel') {
                            msg += '【' + flowNameObj[key] + '】'+horizon.lang["flow-create"]["canNotDelete"]+'</br>';
                        }else if(value == 'true') {
                            msg += '【' + flowNameObj[key] + '】'+horizon.lang.message["deleteSuccess"]+'</br>';
                        }else if(value == 'false') {
                            msg += '【' + flowNameObj[key] + '】'+horizon.lang.message["deleteFail"]+'</br>';
                        }
                    });
                    horizon.notice.success(msg);
                    //删除成功后刷新流程树
                    $('#flow-tree').flowtree('reload');
                    table.mytable.reload();
                }
            });
        },
        deleteFlow: function(flowIds, versions, flowNameObj) {
            $dialog.dialog({
                title: horizon.lang.message['title'],
                dialogText: horizon.lang.message["deleteConfirm"],
                dialogTextType: 'alert-danger',
                closeText: horizon.lang.base["close"],
                buttons:[
                    {
                        html: horizon.lang.base["ok"],
                        'class' : 'btn btn-primary btn-xs',
                        click: function() {
                            table.mytable.showProcessing();
                            $(this).dialog('close');
                            flowcreate.commonDeleteFlow(flowIds, versions, flowNameObj);
                        }
                    }
                ]
            });
        },
        updateFlow : function() {
            var $flowTree = $('#flow-tree');
            var flowId = arguments[1];
            //编辑流程时清除流程树中的选中
            $flowTree.find('.tree-item.tree-selected').removeClass('tree-selected');
            flowcreate.editFlow(flowId);
        },
        editFlow: function(flowId) {
            $('#flowdata-container').addClass('hidden');
            $('#flowframe-container').removeClass('hidden');
            $('#fullscreen').removeClass('hidden');

            var $flowframe = $('#flowframe');
            try{
                $flowframe[0].contentWindow.checkReload(flowId);
            }catch(e){
                $flowframe[0].src = flowDesignerUrl + '?flowid=' + flowId;
                if(horizon.vars.touch) {
                    $flowframe.css('height', _height.flowframeHeight());
                }else {
                    $(window)
                        .off('resize.flowframe')
                        .on('resize.flowframe', function() {
                            $flowframe.css('height', _height.flowframeHeight());
                        }).trigger('resize.flowframe');
                }
            }
        },
        createFlow: function() {
            $('#flowdata-container').addClass('hidden');
            $('#flowframe-container').removeClass('hidden');
            $('#fullscreen').removeClass('hidden');

            var $flowframe = $('#flowframe');
            try{
                $flowframe[0].contentWindow.checkReload('');
            }catch(e){
                $flowframe[0].src = flowDesignerUrl;
                if(horizon.vars.touch) {
                    $flowframe.css('height', _height.flowframeHeight());
                }else {
                    $(window)
                        .off('resize.flowframe')
                        .on('resize.flowframe', function() {
                            $flowframe.css('height', _height.flowframeHeight());
                        }).trigger('resize.flowframe');
                }
            }
        }
    };

    var flowtree = {
        group: '',
        init: function() {
            //初始化流程树
            var $flowTree = $('#flow-tree');
            $flowTree.flowtree({
                data: {
                    type: 'flow'
                },
                defaultNode: [
                    {
                        id: 'createFlow',
                        type: 'item',
                        text: horizon.lang.base["new"]
                    },
                    {
                        id: 'allFlow',
                        type: 'item',
                        text: horizon.lang.base["allflow"],	//无法显示   显示后请删除
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
            if(arguments[1].target.id == 'allFlow') {//查询所有流程
                flowtree.group = '';
                table.getGroupData();
                table.mytable.setTitle(arguments[1].target.text);
            }else if(arguments[1].target.id == 'createFlow') {
                flowcreate.createFlow();
            }else {
                flowcreate.editFlow(arguments[1].target.flowId);
            }
        },
        deselected: function() {
            $(arguments[1].el).addClass('tree-selected');
        },
        selGroup: function() {
            $(arguments[0].target).find('.tree-item.tree-selected').removeClass('tree-selected');
            flowtree.group = arguments[1].group;
            table.getGroupData();
            table.mytable.setTitle(arguments[1].text);
        }
    };

    var table = {
        checkSelectedRow: function() {
            if(table.mytable.checkRowKeyArray.length) return true;
            var errorGritter = function() {
            	horizon.notice.error(horizon.lang.message["deleteHelp"]);
            };
            if($('.gritter-item-wrapper').length > 0){
                errorGritter();
            }else{
                errorGritter();
            }
            return false;
        },
        init:function() {
            table.mytable = $('#flowdataDatatable').horizonTable({
                settings: {
                    title: horizon.lang.base["allflow"],
                    height: _height.outerHeight,
                    checkbox: 0,
                    columns: [
                        {
                            dataProp : 'id'
                        },
                        {
                            name : 	'flowId',
                            title : horizon.lang["flow-create"]["flowId"],
                            width : '250px',
                            searchable : true,
                            fnClick :flowcreate.updateFlow
                        },
                        {
                            name : 'flowName',
                            title : horizon.lang["flow-create"]["flowName"],
                            width : '300px',
                            searchable : true
                        },
                        {
                            name : 'typeName',
                            title : horizon.lang["flow-create"]["classify"],
                            width : '100px',
                            columnClass :'center'
                        },
                        {
                            name : 'version',
                            title : horizon.lang["flow-create"]["versionNo"],
                            width : '50px',
                            columnClass :'center',
                            fnClick :table.openHistory
                        },
                        {
                            name : 'flowId',
                            title : horizon.lang["flow-create"]["createInstance"],
                            width : '50px',
                            orderable : false,
                            columnClass :'center'
                        }
                    ],
                    buttons: [
                        {
                            id: 'deleteflow-edition',
                            text: horizon.lang["flow-create"]["deleteVersion"],
                            icon: 'fa fa-times red2',
                            fnClick: function() {
                                if(table.checkSelectedRow()) {
                                    var versions = [],
                                        itemIds = [];
                                    var	 flowNameObj = {};
                                    $.each(table.mytable.checkRowDataArray, function(i, data) {
                                        itemIds.push(data.id + '~' + data.flowId);
                                        versions.push(data.id + '~' + data.version);
                                        flowNameObj[data.flowId] = data.flowName;
                                    });
                                    flowcreate.deleteFlow(itemIds.join(';'), versions.join(';'), flowNameObj);
                                }
                            }
                        },
                        {
                            id: 'deleteflow',
                            text: horizon.lang.base["delete"],
                            icon: 'fa fa-times red2',
                            fnClick: function() {
                                if(table.checkSelectedRow()) {
                                    var itemIds = [];
                                    var flowNameObj = {};
                                    $.each(table.mytable.checkRowDataArray, function(i, data) {
                                        itemIds.push(data.id + '~' + data.flowId);
                                        flowNameObj[data.flowId] = data.flowName;
                                    });
                                    flowcreate.deleteFlow(itemIds.join(';'), '', flowNameObj);
                                }
                            }
                        }
                    ],
                    fnCreateCell: function(nTd, nTdData, rowData, iRow, i){
                        var _html = '';
                        if(i == 5) {//操作列
                            var className = '';
                            if(rowData.active == '1') {
                                className = 'blue';
                            }
                            var flows = [];
                            $.each(rowData.versionFlows,function(i,flow) {
                                if(flow.active == "1") {
                                    flows.push(flow);
                                }
                            });
                            if(rowData.version != "1" && rowData.versionFlows.length > 0) {
                                _html = '<label class="' + className + '" data-action="startflow" data-active="' + rowData.active + '" title="'+ horizon.lang["flow-create"]["createTest"]+'" style="cursor:pointer">'+ horizon.lang["flow-create"]["createTest"]+'</label>' +
                                    '<div class="inline start-version action-buttons"><a data-toggle="dropdown" href="javascript:void(0)" class="dropdown-toggle"><i class="ace-icon fa fa-angle-down"></i></a>' +
                                    '<ul class="dropdown-menu-right dropdown-only-icon dropdown-menu dropdown-yellow dropdown-caret dropdown-close" ';
                                if(rowData.versionFlows.length > 6) {
                                    _html += 'style="max-height: 143px;overflow-y: auto;min-width: 100px;">';
                                }else{
                                    _html += '>';
                                }
                                $.each(flows, function(i,flow) {
                                    if(flow.active == "1") {
                                        var li = '<li><a href="javascript:void(0)" flow-id = ' + flow.id + '>'+ horizon.lang["flow-create"]["version"]+'-' + flow.version+ '</a>';
                                        _html += li;
                                    }
                                });
                                _html+= '</ul></div>';
                            }else{
                                _html = '<label class="' + className + '" data-action="startflow" data-active="' + rowData.active + '" title="'+ horizon.lang["flow-create"]["createTest"]+'" style="cursor:pointer">'+horizon.lang["flow-create"]["createTest"]+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>';
                            }
                        }
                        if(_html != '') {
                            var $ntd = $(nTd);
                            $ntd.html(_html);
                            if(i == 5) {
                                $ntd.css('overflow', 'visible');
                                $ntd.find('label[data-action="startflow"][data-active="1"]').on(horizon.tools.clickEvent(), function() {
                                    var url = horizon.paths.flowpath + '?flowId=' + nTdData + '&isembedded=false';
                                    horizon.open({url:url});
                                });
                                $ntd.find('.start-version').find('li').on(horizon.tools.clickEvent(), function() {
                                    var $this = $(this);
                                    var url = horizon.paths.flowpath + '?flowId=' + $this.children('a').attr('flow-id') + '&isembedded=false';
                                    horizon.open({url:url});
                                });
                            }
                        }
                    }
                },
                ajaxDataSource: horizon.tools.formatUrl('/manager/flow/page')
            });
            setTimeout(function() {
                $('#flowdata-container').find('.scroll-content').css('height','inherit');
            },100);
        },
        getGroupData: function() {
            //清空简单搜索项
            table.mytable.pluginTable._fnFilterComplete(table.mytable.pluginTable.fnSettings(), {
                "sSearch": ''
            });
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
            $('#flowdata-container').removeClass('hidden');
            $('#flowframe-container').addClass('hidden');
            $('#fullscreen').addClass('hidden');
        },
        openHistory: function() {
            var versionFlows = arguments[2].versionFlows;
            var $container = $('.history-container');
            $container.html('');
            $.each(versionFlows, function(i,flow) {
                var $widget = $('.profile-widget').children().clone();
                $widget.find('.thumbicon').html(flow.version);
                var $creator = $widget.find('.grid2').eq(0);
                var $modified = $widget.find('.grid2').eq(1);
                $creator.children('.title').children('span').html(flow.creator);
                $creator.find('.time').children('span').html(flow.created);
                $modified.children('.title').children('span').html(flow.modified);
                $modified.find('.time').children('span').html(flow.modificator);
                $container.append($widget);
            });
            $container.removeClass('hidden').dialog({
                title:  horizon.lang["flow-create"]["history"],
                closeText: horizon.lang.base["close"],
                width: $(window).width() > 700?'700':'auto',
                maxHeight: $(window).height(),
                height:'450'
            });
        }
    };
    var fullscreen = function() {
        var $fullscreen = $('#fullscreen');
        var $flowframeWidgetBox = $('#flowframe-widget-box');
        var $widgetHeader = $flowframeWidgetBox.find('.widget-header');
        var event = horizon.tools.clickEvent();
        $fullscreen.on(event, function() {
            $widgetHeader.find('a[data-action="fullscreen"]').trigger(event);
        });
        $flowframeWidgetBox.on('fullscreened.ace.widget', function() {
            if(!$flowframeWidgetBox.hasClass('fullscreen')) {
                $widgetHeader.addClass('hidden');
            }else {
                $widgetHeader.removeClass('hidden');
            }
            $('#flowframe').css('height', _height.flowframeHeight());
        });
    };
    return horizon.engine['flowcreate'] = {
        init: function() {
            flowtree.init();
            table.init();
            fullscreen();
        }
    };
}));