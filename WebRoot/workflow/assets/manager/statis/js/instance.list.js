/**
 * 实例状态[按流程统计]
 *
 * @author zhuql
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        var scripts = ['jquery','echarts','horizonFlowtree','horizonTable','gritter'];//当前模块的依赖
        define(scripts, factory);
    } else {
        factory(jQuery);
    }
}(function($, echarts) {
    "use strict";
    var $bodycontainer;//页面容器,表示使用哪个js

    //容器的大小
    var containerSize = {
        height: function() {
            var _height = horizon.tools.getPageContentHeight(),
                $pageHeader = $('.page-header');
            if($pageHeader.css('display') != 'none') {
                _height -= $pageHeader.outerHeight(true);
            }
            _height = _height - $('.flow-status-pic').outerHeight(true) - $('.widget-header-ram').outerHeight(true);
            return _height;
        },
        width: function() {
            return $('.page-content-area').outerWidth(true);
        },
        picHeight: function() {
            return containerSize.height();
        },
        treeHeight: function() {
            var outerHeight = containerSize.height();
            var $container = $('.modal-dialog');
            return outerHeight - parseInt($container.css('borderTopWidth'))*2
                - parseInt($container.find('.modal-body').css('paddingTop'))*2
                - $container.find('.widget-header').outerHeight(true);
        }
    };

    var flowtree = {
        flowId:'',
        nodeId:'',
        group: '',
        flowIds:[],
        init: function() {
            //初始化流程树
            flowtree.flowIds=[];
            $('#flow-tree').flowtree({
                multiSelect: 'true',
                defaultNodePosition: 'top',
                selected: flowtree.selected,
                deselected: flowtree.deselected
            });
        },
        selected: function() {
            flowtree.flowIds.push(arguments[1].target.flowId);
            init();

        },
        deselected: function() {
            var id = arguments[1].target.flowId;
            flowtree.flowIds.splice(jQuery.inArray(id,flowtree.flowIds),1);
            init();
        },
        getIds: function() {
            return flowtree.flowIds.join(';');
        }
    };
    function init(){
        //初始化流程树
        //1.进行判断应该显示什么表格

        var hasValue = flowtree.getIds();
        //$("#flownames_flows").val();
        if(hasValue){//统计条件选择某些流程的列表
            //当有选中某流程时,则显示流程的详细信息
            $('#statis-status-flow-container').removeClass("hidden");
            $('#statis-status-status-container').addClass("hidden");
            $bodycontainer = flows;//放入容器,用于列表和图表的转换
            $bodycontainer.init();
        }else{
            //当没有选中某流程时,则显示流程的总状态信息
            $('#statis-status-status-container').removeClass("hidden");
            $('#statis-status-flow-container').addClass("hidden");
            $bodycontainer = statusContainer;//放入容器,用于列表和图表的转换
            $bodycontainer.init();
        }
    }

    //按实例统计区域
    var statusContainer={
        urls:{
            list: horizon.tools.formatUrl('/statis/instance/status/list'),
            sublist: horizon.tools.formatUrl('/statis/instance/sub/page'),
            subwarnlist: horizon.tools.formatUrl('/statis/instance/subwarn/page'),
            chart: horizon.tools.formatUrl('/statis/instance/status/chart')
        },
        init:function(){
            //1.首先判断是显示表格,还是显示图表
            var isImage=$('#header-isflot').prop('checked');
            if(!isImage){//是图表展现
                $('#statusimage-container').removeClass("hidden");
                $('#statusdata-container').addClass("hidden");
                statusContainer.chart.initChart();
            }else{//不是图表展现
                //2然后判断是生成还是reload
                $('#statusdata-container').removeClass("hidden");
                $('#statusimage-container').addClass("hidden");
                statusContainer.table.init();
            }
        },
        table:{
            init:function(){
                statusContainer.table.initTable();
            },
            initTable:function(){
                if($('#tablebystatus').data('horizonTable')){
                    statusContainer.table.mytable.reload(true);
                }else{
                    statusContainer.table.mytable=$('#tablebystatus').horizonTable({
                        settings: {
                            title: horizon.lang['statis-common']['tableTitle'],
                            height: containerSize.height,
                            multipleSearchable: false,//高级搜索
                            multipleSearchAreaVisible: false,
                            searchable:false,
                            columns: statusContainer.table.columns
                        },
                        ajaxDataSource: statusContainer.urls.list
                    });
                }
            },
            columns:[
                {
                    name : 'statusName',
                    title : horizon.lang['instance-status']['subColumnsStatus'],
                    width : '150px',
                    multipleSearchable : false,
                    columnClass: 'center',
                    orderable : false
                },
                {
                    name : 'instanceCount',
                    title : horizon.lang['instance-status']['columnsInstanceCount'],
                    width : '150px',
                    orderable : false,
                    columnClass: 'center',
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        if(rowData.status == "warn"){
                            statusContainer.subwarntable.openDialog(rowData);
                        }else{
                            statusContainer.subtable.openDialog(rowData);
                        }
                    }
                }
            ]
        },
        subtable:{
            openDialog:function(rowdata){
                var statusCode=rowdata.status;
                var statusName = rowdata.statusName;
                var $dialog = $('#statusdata-container2');
                statusContainer.subtable.initsub(statusCode);
                $dialog.dialog({
                    addCloseBtn: false,
                    closeText: horizon.lang['base']['close'],
                    appendTo:'.page-content-area',
                    title: horizon.lang['instance-status']['subColumnsStatus']+':'+statusName,
                    width: $(window).width() > 995?'995':$(window).width(),
                    height: $(window).height() > 640?'640':'auto',
                    maxHeight: $(window).height(),
                    minHeight:'500',
                    open:function(){
                        if(!horizon.vars.touch){
                            $(window).trigger('resize.dataTable');
                        }
                    }
                });
            },
            initsub:function(statusCode){
                if($('#subtablebystatus').data('horizonTable')){

                    //清空简单搜索项
                    statusContainer.subtable.mytable.pluginTable._fnFilterComplete(statusContainer.subtable.mytable.pluginTable.fnSettings(), {
                        "sSearch": ''
                    } );
                    var aoServerParams = statusContainer.subtable.mytable.pluginTable.fnSettings().aoServerParams[1]=
                    {
                        "fn": function(aoData){
                            aoData.push({
                                'name': 'status',
                                'value': statusCode
                            });
                        }
                    };
                    statusContainer.subtable.mytable.pluginTable.fnDraw(false);
                }else{
                    statusContainer.subtable.mytable = $('#subtablebystatus').horizonTable({
                        settings: {
                            height:function(){
                                return $(".ui-dialog-content").height()-10;
                            },
                            columns: statusContainer.subtable.columns
                        },
                        ajaxDataSource:	statusContainer.urls.sublist
                    });
                    statusContainer.subtable.initsub(statusCode);
                }
            },
            columns: [
                {
                    name: 'flowName',
                    title: horizon.lang['instance-status']['subColumnsFlowName'],
                    width: '200px',
                    searchable: true,
                    multipleSearchable: true,
                    orderable: true
                },
                {
                    name: 'title',
                    title: horizon.lang['instance-status']['subColumnsTitle'],
                    width: '200px',
                    searchable: true,
                    multipleSearchable: true,
                    orderable: true
                },
                {
                    name: 'nodeName',
                    title: horizon.lang['instance-status']['subColumnsNodeName'],
                    width: '100px',
                    orderable: false,
                    columnClass: 'center'
                },
                {
                    name: 'statusName',
                    title: horizon.lang['instance-status']['subColumnsStatus'],
                    width: '100px',
                    orderable: false,
                    columnClass: 'center'
                },
                {
                    name: 'ver',
                    title: horizon.lang['instance-status']['subColumnsVersion'],
                    width: '100px',
                    orderable: false,
                    columnClass: 'center'
                }
            ]
        },
        subwarntable:{
            openDialog:function(rowdata){
                var statusCode=rowdata.status;
                var statusName = rowdata.statusName;
                var $dialog = $('#statusdata-container3');
                statusContainer.subwarntable.initsub(statusCode);
                $dialog.dialog({
                    addCloseBtn: false,
                    closeText: horizon.lang['base']['close'],
                    appendTo:'.page-content-area',
                    title: horizon.lang['instance-status']['subColumnsStatus']+':'+statusName,
                    width: $(window).width() > 995?'995':$(window).width(),
                    height: $(window).height() > 640?'640':'auto',
                    maxHeight: $(window).height(),
                    minHeight:'500',
                    open:function(){
                        if(!horizon.vars.touch){
                            $(window).trigger('resize.dataTable');
                        }
                    }
                });
            },
            initsub:function(statusCode){
                if($('#subwarntablebystatus').data('horizonTable')){
                    statusContainer.subwarntable.reloadTable();
                }else{
                    statusContainer.subwarntable.mytable = $('#subwarntablebystatus').horizonTable({
                        settings: {
                            height:function(){
                                return $(".ui-dialog-content").height()-10;
                            },
                            columns: statusContainer.subtable.columns
                        },
                        serverSideData: false
                    });
                    var $dataTablesContainer = statusContainer.subwarntable.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                    $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                        statusContainer.subwarntable.reloadTable();
                    });
                    statusContainer.subwarntable.reloadTable();
                }
            },
            reloadTable:function(){
                statusContainer.subwarntable.mytable.showProcessing();
                $.ajax({
                    url: horizon.tools.formatUrl('/statis/instance/subwarn/page'),
                    cache: false,
                    dataType: 'json',
                    data:{status:'warn'},
                    success: function(data) {
                        statusContainer.subwarntable.mytable.hideProcessing();
                        statusContainer.subwarntable.mytable.pluginTable.fnClearTable(true);
                        for(var i=0;i<data.data.length;i++){
                            var item = data.data[i];
                            statusContainer.subwarntable.mytable.pluginTable.fnAddData(item,false);
                        }
                        statusContainer.subwarntable.mytable.reload();
                    },
                    error: function() {
                    	horizon.notice.error(horizon.lang.message['operateError']);
                        statusContainer.subwarntable.mytable.hideProcessing();
                    }
                });
            },
            columns: [
                {
                    name: 'flowName',
                    title: horizon.lang['instance-status']['subColumnsFlowName'],
                    width: '200px',
                    searchable: true,
                    multipleSearchable: true,
                    orderable: true
                },
                {
                    name: 'title',
                    title: horizon.lang['instance-status']['subColumnsTitle'],
                    width: '200px',
                    searchable: true,
                    multipleSearchable: true,
                    orderable: true
                },
                {
                    name: 'nodeName',
                    title: horizon.lang['instance-status']['subColumnsNodeName'],
                    width: '100px',
                    orderable: false,
                    columnClass: 'center'
                },
                {
                    name: 'statusName',
                    title: horizon.lang['instance-status']['subColumnsStatus'],
                    width: '100px',
                    orderable: false,
                    columnClass: 'center'
                },
                {
                    name: 'ver',
                    title: horizon.lang['instance-status']['subColumnsVersion'],
                    width: '100px',
                    orderable: false,
                    columnClass: 'center'
                }
            ]
        },
        chart:{
            initChart:function(){
                var $flowStatus = $('#statis-status-status-placeholder');
                $flowStatus.css({
                    'width': '100%',
                    'height': containerSize.picHeight()
                });
                if(!statusContainer.chart.myChart){
                    statusContainer.chart.myChart=echarts.init($flowStatus[0]);
                }
                statusContainer.chart.myChart.resize();
                statusContainer.chart.initFlowStatusEcharts(statusContainer.chart.myChart);
                $('.sidebar-collapse').off(horizon.tools.clickEvent() + '.ace.menu').on(horizon.tools.clickEvent() + '.ace.menu', function(e){
                    setTimeout(function(){
                        statusContainer.chart.myChart.resize();
                    },100);
                });
            },
            initFlowStatusEcharts: function(flowStatusChart) {
                var optionFlowStatus = {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/> {b} : {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left',
                        data:[]
                    },
                    series: [
                        {
                            name: horizon.lang['flowstatus']['title'],
                            type: 'pie',
                            radius: '70%',
                            center: ['50%', '50%'],
                            data: [],
                            minAngle: 10,
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                flowStatusChart.showLoading();
                if (optionFlowStatus && typeof optionFlowStatus === 'object') {
                    flowStatusChart.setOption(optionFlowStatus, true);
                }
                //图表ajax数据
                statusContainer.chart.ajaxFlowStatusData(flowStatusChart);
            },
            ajaxFlowStatusData: function(flowStatusChart) {
                $.ajax({
                    url: statusContainer.urls.chart,
                    dataType: 'json',
                    cache: false,
                    error: function() {
                    	horizon.notice.error(horizon.lang.message['operateError']);
                    },
                    success: function(data) {
                        if(data) {
                            if(data.length==0){
                                flowStatusChart.hideLoading();
                            	flowStatusChart.setOption({
                                    title: {
                                        text: horizon.lang['statis-common']['successNodata'],
                                        textStyle: {
                                            fontFamily: 'Microsoft YaHei',
                                            fontSize: 14,
                                            fontWeight: 'normal',
                                            color: '#666'
                                        },
                                        left: 'center',
                                        top: 'middle'
                                    }
                                });
                            }else{
                                var name = [];
                                var itemStyle =function(){
                                    var obj = {};
                                    obj[horizon.lang['flowstatus']['normal']]={
                                        normal:{color:'#ABD4A5'}
                                    };
                                    obj[horizon.lang['flowstatus']['extended']]={
                                        normal:{color:'#d87c7c'}
                                    };
                                    obj[horizon.lang['flowstatus']['pause']]={
                                        normal:{color:'#ABDFE5'}
                                    };
                                    obj[horizon.lang['flowstatus']['warn']]={
                                        normal:{color:'#F3DD99'}
                                    };
                                    obj[horizon.lang['flowstatus']['exception']]={
                                        normal:{color:'#aaaaaa'}
                                    };
                                    obj[horizon.lang['flowstatus']['revoke']]={
                                        normal:{color:'#F5D5B8'}
                                    };
                                    return obj;
                                }()
                                var dataSeries = [];
                                $.each(data, function(key,value) {
                                    name.push(value.statusName + '(' + value.instanceCount + ')');
                                    var data = {
                                        "name":	value.statusName + '(' + value.instanceCount + ')',
                                        "value": value.instanceCount,
                                        "itemStyle": itemStyle[value.statusName],
                                        "status":value.status
                                    };
                                    dataSeries.push(data);
                                });
                                flowStatusChart.hideLoading();
                                var startAngle = 0;
                                if(data.length == 1) {
                                    startAngle = 90;
                                }
                                flowStatusChart.setOption({
                                    legend: {
                                        data: name
                                    },
                                    series: {
                                        startAngle: startAngle,
                                        data:dataSeries
                                    }
                                });
                                flowStatusChart.on(horizon.tools.clickEvent(), function (param) {
                                    if(param.data.status == 'warn'){
                                        statusContainer.subwarntable.openDialog({'status':param.data.status,'statusName':param.name});
                                    }else{
                                        statusContainer.subtable.openDialog({'status':param.data.status,'statusName':param.name});
                                    }
                                });
                                $(window).off('resize').on('resize',function(){
                                    $('#statis-status-status-placeholder').css({
                                        'width': '100%',
                                        'height':  containerSize.picHeight()
                                    });
                                    flowStatusChart.resize();

                                });
                            }
                        }
                    }
                });
            }
        }
    };


    //end 按状态统计
    //按流程统计
    var flows={
        urls:{
            list: horizon.tools.formatUrl('/statis/instance/flow/list'),//表格查询的url
            chart: horizon.tools.formatUrl('/statis/instance/flow/chart'),//表格查询的url
            sublist:horizon.tools.formatUrl('/statis/instance/sub/page')//表格查询的url
        },
        //页面初始化
        init:function(){
            //1.首先判断是显示表格,还是显示图表
            var isImage=$('#header-isflot').prop('checked');
            if(!isImage){//是图表展现
                $('#flowimage-container').removeClass("hidden");
                $('#flowsdata-container').addClass("hidden");
                flows.chart.initChart();
            }else{
                $('#flowsdata-container').removeClass("hidden");
                $('#flowimage-container').addClass("hidden");
                //2然后判断是生成还是reload
                flows.table.init();
            }
        },
        //表格
        table:{
            init:function(){
                flows.table.initTable();
            },
            initTable:function(){
                if($('#tablebyflows').data('horizonTable')){
                    var params = {flow_ids: flowtree.getIds()};
                    flows.table.mytable.showProcessing();
                    $.ajax({
                        url: flows.urls.list,
                        cache: false,
                        type:'post',
                        dataType: 'json',
                        data:params,
                        success: function(data) {
                            flows.table.mytable.hideProcessing();
                            flows.table.mytable.pluginTable.fnClearTable(false);
                            for(var i=0;i<data.data.length;i++){
                                var item = data.data[i];
                                flows.table.mytable.pluginTable.fnAddData(item,false);
                            }
                            flows.table.mytable.reload(true);
                        },
                        error: function() {
                        	horizon.notice.error(horizon.lang['statis-common']['readFail']);
                            flows.table.mytable.hideProcessing();
                        }
                    });
                }else{
                    flows.table.mytable = $('#tablebyflows').horizonTable({
                        settings: {
                            title: horizon.lang['statis-common']['tableTitle'],
                            multipleSearchable: false,//高级搜索
                            multipleSearchAreaVisible: false,
                            searchable: false,
                            columns: flows.table.columns,
                            height: containerSize.height,
                            fnDrawCallback:function(settings) {
                                var api = $('#tablebyflows').dataTable().api();
                                if(api){
                                    var info = api.page.info();
                                    if(info.page == (info.pages - 1)){
                                        var $lable = $('#tablebyflows tbody > tr').find('label[title='+horizon.lang['instance-status']["columnsCount"]+']');
                                        var $totaltr = $lable.closest('tr');
                                        $totaltr.css({color:'red'});
                                        $totaltr.children("td").children("label").removeClass("blue").unbind(horizon.tools.clickEvent()).css({
                                            cursor:'default'
                                        });
                                    }
                                }
                            }
                        },
                        serverSideData: false
                    });
                    var $dataTablesContainer = flows.table.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                    $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                        flows.table.initTable();
                    });
                    flows.table.initTable();
                }
            },
            columns: [
                {
                    name: 'flowId',
                    title: horizon.lang['instance-status']['flowtableFlowId'],
                    visible: false,
                    searchable: false,
                    multipleSearchable: true,
                    orderable: true
                },
                {
                    name: 'flowName',
                    title: horizon.lang['instance-status']['subColumnsFlowName'],
                    width: '200px',
                    searchable: true,
                    multipleSearchable: false,
                    orderable: true
                },
                {
                    name: 'normalCount',
                    title: horizon.lang['flowstatus']['normal'],
                    width: '100px',
                    columnClass: 'center',
                    multipleSearchable: false,
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        flows.subtable.openDialog(rowData, 'normal', horizon.lang['flowstatus']['normal']);
                    }
                },
                {
                    name: 'warnCount',
                    title: horizon.lang['flowstatus']['warn'],
                    width: '100px',
                    multipleSearchable: false,
                    columnClass: 'center',
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        flows.subwarntable.openDialog(rowData, 'warn', horizon.lang['flowstatus']['warn']);
                    }
                },
                {
                    name: 'extendedCount',
                    title: horizon.lang['flowstatus']['extended'],
                    width: '100px',
                    multipleSearchable: false,
                    columnClass: 'center',
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        flows.subtable.openDialog(rowData, 'extended', horizon.lang['flowstatus']['extended']);
                    }
                },
                {
                    name: 'exceptionCount',
                    title: horizon.lang['flowstatus']['exception'],
                    width: '100px',
                    multipleSearchable: false,
                    columnClass: 'center',
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        flows.subtable.openDialog(rowData, 'exception', horizon.lang['flowstatus']['exception']);
                    }
                },
                {
                    name: 'pauseCount',
                    title: horizon.lang['flowstatus']['pause'],
                    width: '100px',
                    multipleSearchable: false,
                    columnClass: 'center',
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        flows.subtable.openDialog(rowData, 'pause', horizon.lang['flowstatus']['pause']);
                    }
                },
                {
                    name: 'revokesCount',
                    title: horizon.lang['flowstatus']['revoke'],
                    width: '100px',
                    multipleSearchable: false,
                    columnClass: 'center',
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        flows.subtable.openDialog(rowData, 'revoke', horizon.lang['flowstatus']['revoke']);
                    }
                }
            ]
        },
        //子菜单
        subtable : {
            initTable:function(flowid, statusname){
                if($('#subtablebyflows').data('horizonTable')){
                    flows.subtable.mytable.pluginTable.fnDraw(false);
                    flows.subtable.mytable.pluginTable._fnFilterComplete(flows.subtable.mytable.pluginTable.fnSettings(), {
                        "sSearch": ''
                    } );
                    var aoServerParams = flows.subtable.mytable.pluginTable.fnSettings().aoServerParams[1]={
                        "fn": function(aoData){
                            aoData.push({
                                'name': 'flowId',
                                'value': flowid
                            });
                            aoData.push({
                                'name': 'status',
                                'value': statusname
                            });
                        }
                    };
                    flows.subtable.mytable.reload(true);
                }else{
                    flows.subtable.mytable = $('#subtablebyflows').horizonTable({
                        settings: {
                            height:function(){
                                return $(".ui-dialog-content").height()-10;
                            },
                            columns: [
                                {
                                    dataProp: 'id',
                                    visible: false
                                },
                                {
                                    name: 'title',
                                    title: horizon.lang['instance-status']['subColumnsTitle'],
                                    width: '300px',
                                    searchable : true,
                                    multipleSearchable : true
                                },
                                {
                                    name: 'nodeName',
                                    title: horizon.lang['instance-status']['subColumnsNodeName'],
                                    width: '150px',
                                    orderable: false,
                                    columnClass: 'center'
                                },
                                {
                                    name: 'ver',
                                    title: horizon.lang['instance-status']['subColumnsVersion'],
                                    width: '100px',
                                    columnClass: 'center'
                                }
                            ]
                        },
                        ajaxDataSource: flows.urls.sublist
                    });
                    flows.subtable.initTable(flowid,statusname);
                }
            },

            openDialog:function(obj, status, statusText){
                var rowdata = obj;
                var flowid = rowdata.flowId;
                var flowname = rowdata.flowName;
                var $dialog = $('#flowsdata-container2');
                $dialog.dialog({
                    addCloseBtn: false,
                    closeText: horizon.lang['base']['close'],
                    appendTo:'.page-content-area',
                    title: horizon.lang['instance-status']['subColumnsFlowName'] +':'+ flowname + '(' + statusText + ')',
                    width: $(window).width() > 995 ? '995' :$(window).width(),
                    height: $(window).height() > 640 ? '640' : 'auto',
                    maxHeight: $(window).height(),
                    minHeight: '500',
                    open:function(){
                        if(!horizon.vars.touch){
                            $(window).trigger('resize.dataTable');
                        }
                    }

                });
                flows.subtable.initTable(flowid,status);
            }
        },
        subwarntable : {
            initTable:function(flowid){
                if($('#subwarntablebyflows').data('horizonTable')){
                    flows.subwarntable.reloadTable(flowid);
                }else{
                    flows.subwarntable.mytable = $('#subwarntablebyflows').horizonTable({
                        settings: {
                            height:function(){
                                return $(".ui-dialog-content").height()-10;
                            },
                            columns: [
                                {
                                    dataProp: 'id',
                                    visible: false
                                },
                                {
                                    name: 'title',
                                    title: horizon.lang['instance-status']['subColumnsTitle'],
                                    width: '300px',
                                    searchable : true,
                                    multipleSearchable : true
                                },
                                {
                                    name: 'nodeName',
                                    title: horizon.lang['instance-status']['subColumnsNodeName'],
                                    width: '150px',
                                    orderable: false,
                                    columnClass: 'center'
                                },
                                {
                                    name: 'ver',
                                    title: horizon.lang['instance-status']['subColumnsVersion'],
                                    width: '100px',
                                    columnClass: 'center'
                                }
                            ]
                        },
                        serverSideData: false
                    });
                    flows.subwarntable.reloadTable(flowid);
                }
                var $dataTablesContainer = flows.subwarntable.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                $dataTablesContainer.unbind('reload.ace.widget').on('reload.ace.widget', function() {
                    flows.subwarntable.reloadTable(flowid);
                });
            },
            reloadTable:function(flowid){
                flows.subwarntable.mytable.showProcessing();
                $.ajax({
                    url: horizon.tools.formatUrl('/statis/instance/subwarn/page'),
                    cache: false,
                    dataType: 'json',
                    data:{flowId:flowid,status:'warn'},
                    success: function(data) {
                        flows.subwarntable.mytable.hideProcessing();
                        flows.subwarntable.mytable.pluginTable.fnClearTable(true);
                        for(var i=0;i<data.data.length;i++){
                            var item = data.data[i];
                            flows.subwarntable.mytable.pluginTable.fnAddData(item,false);
                        }
                        flows.subwarntable.mytable.reload();
                    },
                    error: function() {
                    	horizon.notice.error(horizon.lang['statis-common']['readFail']);
                        flows.subwarntable.mytable.hideProcessing();
                    }
                });
            },
            openDialog:function(obj, status, statusText){
                var rowdata = obj;
                var flowid = rowdata.flowId;
                var flowname = rowdata.flowName;
                var $dialog = $('#flowsdata-container3');
                flows.subwarntable.initTable(flowid,status);
                $dialog.dialog({
                    addCloseBtn: false,
                    closeText: horizon.lang['base']['close'],
                    appendTo:'.page-content-area',
                    title: horizon.lang['instance-status']['subColumnsFlowName'] +':'+ flowname + '(' + statusText + ')',
                    width: $(window).width() > 995 ? '995' :$(window).width(),
                    height: $(window).height() > 640 ? '640' : 'auto',
                    maxHeight: $(window).height(),
                    minHeight: '500',
                    open:function(){
                        if(!horizon.vars.touch){
                            $(window).trigger('resize.dataTable');
                        }
                    }
                });
            }
        },
        chart:{
            xalias:function(){
                return {1:{text:horizon.lang['flowstatus']['normal'],name:'normalCount',code:'normal'},
                    2:{text:horizon.lang['flowstatus']['warn'],name:'warnCount',code:'warn'},
                    3:{text:horizon.lang['flowstatus']['extended'],name:'extendedCount',code:'extended'},
                    4:{text:horizon.lang['flowstatus']['exception'],name:'exceptionCount',code:'exception'},
                    5:{text:horizon.lang['flowstatus']['pause'],name:'pauseCount',code:'pause'},
                    6:{text:horizon.lang['flowstatus']['revoke'],name:'revokesCount',code:'revoke'}
                }
            } ,
            settings:function(){
                return {
                    xaxis: flows.chart.xalias(),
                    selector: '#statis-status-flow-placeholder',//放置图表的容器
                    plotclick: function(tag, xalxs){
                        if(xalxs.code == 'warn'){
                            flows.subwarntable.openDialog(tag, xalxs.code, xalxs.text);
                        }else{
                            flows.subtable.openDialog(tag, xalxs.code, xalxs.text);
                        }
                    },
                    height: containerSize.picHeight,
                    nameField: 'flowName',
                    url: flows.urls.chart,
                    ajaxDateParam: {'flow_ids': flowtree.getIds()},
                    formatData:function(data){
                        //排序
                        var flowIds = flowtree.getIds().split(';')
                        var settingsData = {};
                        var returnData=[];
                        for(var i = 0; i < data.length; i ++) {
                            settingsData[data[i].flowId] = data[i];
                        }
                        for(var i = 0; i < flowIds.length; i ++) {
                            returnData[i] = settingsData[flowIds[i]];
                        }
                        return returnData;
                    }
                };
            },
            initChart:function(){
                $('#statis-status-flow-placeholder').css({
                    'width': '100%',
                    'height': containerSize.picHeight()
                });
                flows.chart.myChart= horizon.engine.statisplotline.getStackedChart(flows.chart.settings(), flows.chart.myChart);
            }
        }
    };

    //为选择流程绑定事件
    function bindFlowInput(){
        //选择流程单击事件
        $('#header-isflot').prop('checked',false).on(horizon.tools.clickEvent(), function() {
            $(this).prev().toggleClass('blue');
            init();
        });

        statusContainer.chart.myChart=null;
        flows.chart.myChart=null;

    }

    return horizon.engine['statisstatus'] = {
        init : init,
        bindFlowInput:bindFlowInput,
        flowtree:flowtree
    };
}));
