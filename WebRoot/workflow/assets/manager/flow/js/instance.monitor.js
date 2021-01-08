/**
 * 实例监控
 * @author yaodd
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonFlowtree', 'horizonSelectuser',
            'horizonTable', 'horizonJqueryui', 'horizonFlowchart', 'gritter'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var $dialog = $('#instance-dialog');
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
    var flag = 0;
    var flowtree = {
        flowId:'',
        nodeId:'',
        group: '',
        flowStatus: '',
        init: function() {
            //初始化流程树
            $('#flow-tree').flowtree({
                defaultNode: [
                    {
                        id: 'allWorkList',
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
            if(arguments[1].target.id == 'allWorkList') {//查询所有流程
                flowtree.flowId = '';
                flowtree.nodeId = '';
                flowtree.flowStatus = '';
                table.getGroupData();
                $('#picture').addClass('hidden');
                $('#instance-pic').addClass('hidden');
                $('#instance-list').removeClass('hidden');
                table.mytable.setTitle(arguments[1].text);
            }else{
                instancePic.init();
                table.mytable.setTitle(arguments[1].target.text);
            }
        },
        deselected: function() {
            $(arguments[1].el).addClass('tree-selected');
        },
        selGroup: function() {
            $('#picture').addClass('hidden');
            $('#instance-pic').addClass('hidden');
            $('#instance-list').removeClass('hidden');
            $(arguments[0].target).find('.tree-item.tree-selected').removeClass('tree-selected');
            flowtree.group = arguments[1].group;
            flowtree.flowId = '';
            flowtree.nodeId = '';
            flowtree.flowStatus = '';
            table.getGroupData();
            table.mytable.setTitle(arguments[1].text);
        }
    };

    var instancePic = {
        init:function() {
            var _this = this;
            $('#picture').removeClass('hidden');
            $('#instance-list').addClass('hidden');
            var $instancePic = $('#instance-pic');
            $instancePic.removeClass('hidden');
            $('input[name="listCheckbox"]').prop('checked', false).prev().removeClass('blue');
            var $container = $('#flowchart-' + flowtree.flowId);
            if($container.length) {
                $container.remove();
            }
            $container = $('<div id="flowchart-' + flowtree.flowId + '"></div>');
            $instancePic.children().hide().end().append($container);
            $container.horizonFlowChart($.extend(true, {
                height: _height.outerHeight(),
                url: horizon.tools.formatUrl('/flowchart/data'),
                downloadUrl: horizon.tools.formatUrl('/flowchart/download'),
                dataParam: {
                    flowId: flowtree.flowId,
                    instanceNum: true
                },
                iconType: 'font-awesome',
                tools: {
                    exportImg: true
                },
                fnNodeClick: function(node) {
                    if(node['_nodeNum'] || node['sumnum']) {
                        _this.clickNode(flowtree.flowId, node['ID'] || node['nodeid']);
                    }
                }
            }, horizon.tools.getFlowchartOption()));
            if(!horizon.vars.touch) {
                $(window)
                    .off('resize.flowchart-container')
                    .on('resize.flowchart-container', function() {
                        $('.flowchart-container').css('height', _height.outerHeight());
                    });
            }
        },
        //单击节点
        clickNode:function(flowid, nodeid) {
            flowtree.flowId = flowid;
            flowtree.nodeId = nodeid;
            $('#instance-list').removeClass('hidden');
            $('#instance-pic').addClass('hidden');
            $('input[name="listCheckbox"]').prop('checked', true).prev().removeClass('blue');
            var aoServerParams = table.mytable.pluginTable.fnSettings().aoServerParams;
            aoServerParams.push({
                "fn": function(aoData){
                    aoData.push({
                        'name': 'flowId',
                        'value': flowtree.flowId
                    });
                    aoData.push({
                        'name': 'nodeId',
                        'value': flowtree.nodeId
                    });
                    aoData.push({
                        'name': 'flowStatus',
                        'value': flowtree.flowStatus
                    });
                }
            });
            table.mytable.pluginTable.fnDraw(false);
        }
    };
    var table = {
        //初始化视图数据
        settings: {
            title:horizon.lang['instance-monitor']['tableTitle'],
            height: _height.outerHeight,
            checkbox: 0,
            columns: [
                {
                    dataProp : 'id'
                },
                {
                    name : 'title',
                    title : horizon.lang['instance-monitor']['columnsTitle'],
                    width : '150px',
                    searchable : true,
                    fnClick :function(nTd, nTdData, rowData, iRow, i) {
                        table.openWorkFlowInfo(rowData);
                    }
                },
                {
                    name : 'flowName',
                    title :  horizon.lang['instance-monitor']['columnsFlowName'],
                    width : '150px',
                    searchable : true
                },
                {
                    name : 'created',
                    title :  horizon.lang['instance-monitor']['columnsCreateTime'],
                    width : '150px',
                    columnClass :'center'
                },
                {
                    name : 'nodeName',
                    title :  horizon.lang['instance-monitor']['columnsNodeName'],
                    width : '120px',
                    columnClass :'center'
                },
                {
                    name : 'status',
                    title :  horizon.lang['instance-monitor']['columnsState'],
                    width : '50px',
                    columnClass :'center'
                },
                {
                    name : 'id',
                    title :  horizon.lang['instance-monitor']['columnsGraphical'],
                    width : '50px',
                    orderable : false,
                    columnClass :'center'
                },
                {
                    name : 'id',
                    title : horizon.lang['instance-monitor']['columnsExample'],
                    width : '50px',
                    orderable : false,
                    columnClass :'center'
                },
                {
                    name : 'ver',
                    title :  horizon.lang['instance-monitor']['columnsVersion'],
                    width : '35px',
                    columnClass :'center'
                },
                {
                    name : 'typeName',
                    title :  horizon.lang['instance-monitor']['columnsTypeName'],
                    width : '100px',
                    visible : false,
                    searchable : false
                }
            ],
            buttons: [
                {
                    id: 'replaceWork',
                    text: horizon.lang['instance-monitor']['buttonsRecoveryVersion'],
                    icon: 'glyphicon glyphicon-repeat green',
                    fnClick: function() {
                        var ids = table.mytable.checkRowKeyArray;
                        if(!ids.length) {
                            horizon.notice.error(horizon.lang['instance-monitor']['selectRecovery']);
                            return;
                        }else if(ids.length >1) {
                            horizon.notice.error(horizon.lang['instance-monitor']['recoveryOnePerTime']);
                            return;
                        }else{
                            var id,ver,nodeId;
                            $.each(table.mytable.checkRowDataArray,function(i,checkData){
                                id = checkData.id
                                ver = checkData.ver;
                                nodeId = checkData.nodeId;
                            });
                            if(ver == '1'){
                                horizon.notice.error(horizon.lang['instance-monitor']['noRecoverableVersion']);
                                return;
                            }
                            operate.verNum(id, nodeId, ver);
                        }
                    }
                },
                {
                    id: 'pauseResumeWork',
                    text: horizon.lang['instance-monitor']['pausResume'],
                    icon: 'glyphicon glyphicon-pause green',
                    fnClick: function() {
                        var ids = table.mytable.checkRowKeyArray;
                        if(!ids.length){
                            horizon.notice.error(horizon.lang['instance-monitor']['selectOperate']);
                            return;
                        }else{
                            $dialog.dialog({
                                closeText:horizon.lang['base']['cancel'],
                                title:horizon.lang['message']['title'],
                                dialogText:horizon.lang['instance-monitor']['confirmExecution'],
                                dialogTextType:'alert-danger',
                                buttons: [
                                    {
                                        html: horizon.lang['base']['ok'],
                                        "class" : "btn btn-primary btn-xs",
                                        click: function() {
                                            var arrIds=[],arrTrackIds=[];
                                            $.each(table.mytable.checkRowDataArray,function(i,checkData) {
                                                arrIds.push(checkData.id);
                                                arrTrackIds.push(checkData.trackId);
                                            });
                                            operate.pauseResumeWork(arrIds.join(";"),arrTrackIds.join(";"),'pauseresume');
                                            $( this ).dialog( "close" );
                                        }
                                    }
                                ]
                            });
                        }
                    }
                },
                {
                    id: 'replaceAuthor',
                    text: horizon.lang['instance-monitor']['replacementManager'],
                    icon: 'glyphicon glyphicon-share green',
                    fnClick: function() {
                        var ids = table.mytable.checkRowKeyArray;
                        if(!ids.length) {
                            horizon.notice.error(horizon.lang['instance-monitor']['selectInstancehandle']);
                            return;
                        }else if(ids.length >1) {
                            horizon.notice.error(horizon.lang['instance-monitor']['replaceOnePerTime']);
                        }else{
                            $.each(table.mytable.checkRowDataArray,function(i,checkData){
                                operate.id=checkData.id;
                                operate.trackid=checkData.trackId;
                                operate.nodeid=checkData.nodeId;
                                operate.status=checkData.status;
                            });
                            if(operate.nodeid.indexOf('Node') < 0){
                                horizon.notice.error(horizon.lang['instance-monitor']['taskNotReplaced']);
                                return;
                            }
                            if(horizon.lang['instance-monitor']['jointly'] == operate.status){
                                horizon.notice.error(horizon.lang['instance-monitor']['replaceJointlyFailed']);
                            }else{
                                operate.replaceAuthor();
                            }
                        }
                    }
                },
                {
                    id: 'updateWork',
                    text: horizon.lang['instance-monitor']['update'],
                    icon: 'fa fa-refresh green',
                    fnClick: function() {
                        var ids = table.mytable.checkRowKeyArray;
                        if(!ids.length) {
                            horizon.notice.error( horizon.lang['instance-monitor']['selectUpdate']);
                            return;
                        }else{
                            $dialog.dialog({
                                closeText:  horizon.lang['base']['cancel'],
                                title: horizon.lang['message']['title'],
                                dialogText:horizon.lang['instance-monitor']['confirmUpdate'],
                                dialogTextType: 'alert-danger',
                                buttons: [
                                    {
                                        html: horizon.lang['base']['ok'],
                                        "class" : "btn btn-primary btn-xs",
                                        click: function() {
                                            var titleObj = {};
                                            $.each(table.mytable.checkRowDataArray,function(i,checkData){
                                                titleObj[checkData.id] = checkData.title;
                                            });
                                            operate.updateWork(ids.join(';'), titleObj);
                                            $( this ).dialog( "close" );
                                        }
                                    }
                                ]
                            });
                        }
                    }
                },
                {
                    id: 'stopWork',
                    text: horizon.lang['instance-monitor']['termination'],
                    icon: 'glyphicon glyphicon-stop red2',
                    fnClick: function() {
                        var id = table.mytable.checkRowKeyArray;
                        if(!id.length) {
                            horizon.notice.error(horizon.lang['instance-monitor']['selectTerminate']);
                            return;
                        }else{
                            $dialog.dialog({
                                closeText: horizon.lang['base']['cancel'],
                                title: horizon.lang['message']['title'],
                                dialogText: horizon.lang['instance-monitor']['confirmTerminate'],
                                dialogTextType: 'alert-danger',
                                buttons: [
                                    {
                                        html: horizon.lang['base']['ok'],
                                        "class" : "btn btn-primary btn-xs",
                                        click: function() {
                                            var arrIds=[],arrTrackIds=[];
                                            $.each(table.mytable.checkRowDataArray,function(i,checkData){
                                                arrIds.push(checkData.id);
                                                arrTrackIds.push(checkData.trackId);
                                            });
                                            operate.pauseResumeWork(arrIds.join(";"),arrTrackIds.join(";"),'end');
                                            $( this ).dialog( "close" );
                                        }
                                    }
                                ]
                            });
                        }
                    }
                },
                {
                    id: 'delWork',
                    text: horizon.lang['base']['delete'],
                    icon: 'fa fa-times red2',
                    fnClick: function() {
                        var ids = table.mytable.checkRowKeyArray;
                        if(!ids.length) {
                            horizon.notice.error(horizon.lang['instance-monitor']['selectDelete']);
                            return;
                        }else {
                            $dialog.dialog({
                                closeText:horizon.lang['base']['cancel'],
                                title:horizon.lang['message']['title'],
                                dialogText:horizon.lang['instance-monitor']['confirmDeleteOperate'],
                                dialogTextType:'alert-danger',
                                buttons: [
                                    {
                                        html: horizon.lang['base']['ok'],
                                        "class" : "btn btn-primary btn-xs",
                                        click: function() {
                                            operate.deleteWork(ids.join(';'));
                                            $( this ).dialog( "close" );
                                        }
                                    }
                                ]
                            });
                        }
                    }
                }
            ],
            fnCreateCell: function(nTd, nTdData, rowData, iRow, i){
                var _html = '';
                if(i == 6) {//操作列
                    _html = '<label class="blue"  data-action="flowpic" title="'+horizon.lang['instance-monitor']['columnsGraphical']+'" style="cursor:pointer">'+horizon.lang['instance-monitor']['columnsGraphical']+'</label>';
                }else if(i == 7) {
                    _html = '<label class="blue"  data-action="flowInstance" title="'+horizon.lang['instance-monitor']['columnsExample']+'" style="cursor:pointer">'+horizon.lang['instance-monitor']['columnsExample']+'</label>';
                }
                if(_html != '') {
                    var $ntd = $(nTd);
                    $ntd.html(_html);
                    if(i == 7) {
                        $ntd.find('label[data-action="flowInstance"]').on(horizon.tools.clickEvent(), function() {
                            var url = horizon.static ? (horizon.paths.syspath + '/module/flash/HorizonInstance.html')
                                : (horizon.paths.apppath + '/horizon/module/flash/flow/instance'+ horizon.paths.urlsuffix);
                            url += '?workid=' + nTdData;
                            horizon.open({url:url});
                        });
                    }else if(i == 6){
                        $ntd.find('label[data-action="flowpic"]').on(horizon.tools.clickEvent(), function() {
                            var id = '#flowchart-' + nTdData + '-' + rowData.nodeId,
                                $container = $(id);
                            var showFlowchart = function() {
                                $container.dialog({
                                    title: rowData['flowName'],
                                    width: '100%',
                                    maxWidth: $(window).width(),
                                    maxHeight: $(window).height(),
                                    closeText: horizon.lang['base']['close']
                                });
                            };
                            if($container.length) {
                                showFlowchart();
                            }else {
                                $container = $('<div id="' + id + '"></div>');
                                $('.page-header').after($container);
                                $container.horizonFlowChart($.extend(true, {
                                    url: horizon.tools.formatUrl('/flowchart/data'),
                                    downloadUrl: horizon.tools.formatUrl('/flowchart/download'),
                                    dataParam: {
                                        workId: nTdData,
                                        nodeId: rowData.nodeId
                                    },
                                    iconType: 'font-awesome',
                                    tools: {
                                        status: true,
                                        exportImg: true,
                                        dynamicDemo: true
                                    },
                                    fnAfterSuccess: function() {
                                        showFlowchart();
                                    }
                                }, horizon.tools.getFlowchartOption()));
                            }
                        });
                    }
                }
            },
            pluginSettings: {
                "order":[[3,'desc']]
            }
        },
        
        init: function() {
            flowtree.flowStatus = $('body').data('flowStatus') || '';
            flowtree.group = '';
            if(flowtree.flowStatus == '预警') {
                this.warn();
                flag = 1;
            }else {
                this.other();
            }
            if(flowtree.flowStatus) {
                $('body').removeData('flowStatus');
            }
        },
        warn: function() {
            $.ajax({
                url: horizon.tools.formatUrl('/monitor/instance/list'),
                cache: false,
                dataType: 'json',
                data:{flowStatus:'warn'},
                success: function(data) {
                    table.mytable = $('#myDatatable').horizonTable({
                        settings: table.settings,
                        serverSideData: false,
                        data: data.data
                    });
                },
                error: function() {
                    horizon.notice.error(horizon.lang['statis-common']['readFail']);
                    table.mytable.hideProcessing();
                }
            });
        },
        other: function() {
            table.mytable = $('#myDatatable').horizonTable({
                settings: table.settings,
                ajaxDataSource: horizon.tools.formatUrl('/monitor/instance/list'),
                ajaxDataParam: {
                    flowStatus: function() { return flowtree.flowStatus; },
                    group: function() { return flowtree.group; }
                }
            });
        },
        getGroupData:function() {
            var $body = $('body');
            if(flag == 1){
                if(table.mytable) {
                    //清空数据
                    table.mytable.pluginTable.fnClearTable(true);
                    table.mytable.pluginTable.fnDestroy();
                }
                this.other();
            }else{
                //清空简单搜索项
                table.mytable.pluginTable._fnFilterComplete(table.mytable.pluginTable.fnSettings(), {
                    "sSearch": ''
                } );
                $('#list').parent().addClass('active');
                $('#pic').parent().removeClass('active');
                $('#instance-list').addClass('active').addClass('in');
                $('#instance-pic').removeClass('active').removeClass('in');
                table.mytable.pluginTable.fnDraw(false);
            }
        },
        openWorkFlowInfo: function() {
            var workid = arguments[0].id;
            var trackid = arguments[0].trackId;
            var url = horizon.paths.flowpath + '?workId=' + workid + '&trackId=' + trackid;
            horizon.open({url:url});
        }
    };
    var operate = {
        id:'',
        trackid:'',
        nodeid:'',
        status:'',
        initCheckboxFun: function() {
            $('input[name="listCheckbox"]').on(horizon.tools.clickEvent(), function(){
                $(this).prev().toggleClass('blue');
                $('#instance-list').toggleClass('hidden');
                $('#instance-pic').toggleClass('hidden');
                flowtree.nodeId = '';
                flowtree.flowStatus = '';
                var aoServerParams = table.mytable.pluginTable.fnSettings().aoServerParams;
                aoServerParams.push({
                    "fn": function(aoData){
                        aoData.push({
                            'name': 'flowId',
                            'value': flowtree.flowId
                        });
                        aoData.push({
                            'name': 'nodeId',
                            'value': flowtree.nodeId
                        });
                        aoData.push({
                            'name': 'flowStatus',
                            'value': flowtree.flowStatus
                        });
                    }
                });
                table.mytable.pluginTable.fnDraw(false);
            });
        },
        //版本号
        verNum: function(id, nodeId, ver) {
            table.mytable.showProcessing();
            $.ajax({
                url:horizon.tools.formatUrl('/monitor/instance/recover/vernum'),
                dataType: 'json',
                cache:false,
                data:{
                    id: id
                },
                error: function() {
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success: function(data){
                    table.mytable.hideProcessing();
                    if(data.length && data != ver){
                        $('select[name="selectVer"]').html('');
                        $.each(data, function(i,ver) {
                            var $option;
                            if(i == data.length-1){
                                return;
                            }
                            if(i == (ver-1)){
                                $option = $('<option selected value="' + ver + '">'+horizon.lang['instance-monitor']['versionNumber']+'-' + ver + '</option>');
                            }else{
                                $option = $('<option value="' + ver + '">'+horizon.lang['instance-monitor']['versionNumber']+'-' + ver + '</option>');
                            }
                            $('select[name="selectVer"]').append($option);
                        });
                        operate.replaceWork(id, nodeId, ver);
                    }else{
                        horizon.notice.error(horizon.lang['instance-monitor']['versionNotExist']);
                        return;
                    }
                }
            });
        },
        //恢复版本
        replaceWork:function(id, nodeId ,ver) {
            $('.current-version').val(ver);
            $('input[name="id"]').val(id);
            $('#recoverVersion').dialog({
                closeText:horizon.lang['base']['cancel'],
                title:horizon.lang['instance-monitor']['recoveryVersion'],
                buttons: [
                    {
                        html: horizon.lang['instance-monitor']['buttonsRecovery'],
                        "class" : "btn btn-primary btn-xs",
                        click: function() {
                            operate.recoverVersionFromSubmit();
                        }
                    }
                ]
            });
        },
        recoverVersionFromSubmit:function() {
            table.mytable.showProcessing();
            $.ajax({
                url:horizon.tools.formatUrl('/monitor/instance/recover/version'),
                dataType: 'json',
                cache:false,
                data:$("#recoverVersion-from").serialize(),
                error: function() {
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success: function(data){
                    table.mytable.hideProcessing();
                    if(data.restype == 'success'){
                        $('#recoverVersion').dialog('close');
                        horizon.notice.success(horizon.lang['instance-monitor']['recoverySuccess']);
                        table.mytable.reload();
                    }else{
                        horizon.notice.error(horizon.lang['instance-monitor']['recoveryFailed']);
                    }
                }
            });
        },
        //暂定/恢复
        pauseResumeWork:function(workids,trackids,type) {
            table.mytable.showProcessing();
            $.ajax({
                url:horizon.tools.formatUrl('/monitor/instance/change/state'),
                dataType: 'json',
                data:{
                    workids:workids,
                    trackids:trackids,
                    type:type
                },
                cache:false,
                error: function() {
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success: function(data) {
                    table.mytable.hideProcessing();
                    var msg = '';
                    if(data.restype == 'success' ) {
                        if(type == 'pauseresume') {
                            msg = horizon.lang['message']['operateSuccess'];
                        }else{
                            msg = horizon.lang['instance-monitor']['terminationSuccess'];
                        }
                        horizon.notice.success(msg);
                        table.mytable.reload();
                    }else{
                        if(type == 'pauseresume') {
                            msg =horizon.lang['message']['operateFail'];
                        }else{
                            msg = horizon.lang['instance-monitor']['terminationfailed'];
                        }
                        horizon.notice.error(msg);
                    }
                }
            });
        },
        //替换办理人
        replaceAuthor:function() {
            var author=$('input[name="author"]').val();
            table.mytable.showProcessing();
            $.ajax({
                url:horizon.tools.formatUrl('/monitor/instance/repla/ceauthor'),
                dataType: 'json',
                cache:false,
                data:{
                    'workid':operate.id,
                    'trackid':operate.trackid,
                    'author':author
                },
                error: function() {
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success:function(data) {
                    table.mytable.hideProcessing();
                    if(data.msg != '') {
                        var _multiple = true;
                        if(data.msg[0] == 1){
                            _multiple = false;
                        }
                        $.horizon.selectUser({
                            multiple: _multiple,
                            selectDept: false,
                            selectPosition: false,
                            selectGroup: false,
                            isFlow:true,
                            fnBackData: function() {
                                var $orgCheckedList = $('#org-checked-list');
                                var checkedData = $orgCheckedList.data('org-checked-list');
                                var id = [];
                                var name = [];
                                $.each(checkedData, function(key, value) {
                                    id.push(value.id);
                                    name.push(value.name);
                                });
                                $('input[name="author"]').val(id.join(";"));
                                horizon.engine.instancemonitor.authorOk();
                            }
                        });
                    }else if(data.restype == 'success') {
                        horizon.notice.success(horizon.lang['instance-monitor']['replaceSuccess']);
                        table.mytable.reload();
                    }else{
                        horizon.notice.error(horizon.lang['instance-monitor']['replaceFailed']);
                    }
                    $('input[name="author"]').val('');
                }
            });
        },
        authorOk:function() {
            operate.replaceAuthor(operate.id,operate.trakid,operate.nodeid);
        },
        //更新
        updateWork:function(ids,titleObj) {
            table.mytable.showProcessing();
            $.ajax({
                url:horizon.tools.formatUrl('/monitor/instance/update'),
                dataType:'json',
                cache:false,
                data:{
                    'workids':ids
                },
                error:function() {
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success:function(data) {
                    table.mytable.hideProcessing();
                    var msg = '';
                    $.each(data, function(key,value) {
                        msg += '【' + titleObj[key] + '】' + (value == true ? horizon.lang['instance-monitor']['updateSuccess']+'</br>' : horizon.lang['instance-monitor']['updateFailed']+'</br>' );
                    });
                    horizon.notice.success(msg);
                    table.mytable.reload();
                }
            });
        },
        //删除
        deleteWork:function(ids) {
            table.mytable.showProcessing();
            $.ajax({
                url : horizon.tools.formatUrl('/monitor/instance/delete'),
                data : {workid: ids},
                dataType:'json',
                cache : false,
                error : function(){
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success : function(data) {
                    table.mytable.hideProcessing();
                    if(data.restype == 'success') {
                        horizon.notice.success(horizon.lang['message']['deleteSuccess']);
                        table.mytable.reload();
                    }else{
                        horizon.notice.error(horizon.lang['message']['deleteFail']);
                    }
                }
            });
        }
    };
    return horizon.engine['instancemonitor'] = {
        init: function() {
            flowtree.init();
            table.init();
            operate.initCheckboxFun();
        },
        clickNode : instancePic.clickNode,
        authorOk: operate.authorOk
    };
}));