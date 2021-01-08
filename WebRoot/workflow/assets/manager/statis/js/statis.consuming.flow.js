/**
 * 耗时统计 按流程统计
 * @author zhangsk
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        var scripts = ['jquery','echarts','moment','jqueryValidateAll','horizonTable','bootstrapDatetimepicker','horizonFlowtree','gritter','daterangepicker' ];//当前模块的依赖
        define(scripts, factory);
    } else {
        factory(jQuery, moment);
    }
}(function($ , echarts,moment) {
    "use strict";
    var colors= ['#6495ED','#ABD4A5',  '#FF6666', '#A0D1EA',  '#ca8622', '#EC9F9D'];
    //容器的大小
    var containerSize = {
        height: function() {
            var _height = horizon.tools.getPageContentHeight(),
                $pageHeader = $('.page-header');
            if($pageHeader.css('display') != 'none') {
                _height -= $pageHeader.outerHeight(true);
            }
            _height = _height - $('.flow-status-pic').outerHeight(true) - $('#statis-consuming-flow-searcher .widget-box').outerHeight(true);
            return _height;
        },
        width: function() {
            return $('.page-content-area').outerWidth(true);
        },
        picHeight: function() {
            return containerSize.height();
        },
        treeHeight: function() {
            var outerHeight = $(window).height()
                - parseInt($('.page-content').css('paddingTop')) * 2
                - $('.page-header').outerHeight(true)
                - $('.flow-status-pic').outerHeight(true);
            var $body = $('body');
            if($body.attr('data-layout') != 'left' && $body.attr('data-layout') != 'left-hoversubmenu') {
                outerHeight -= ($('#sidebar').css('visibility') != 'hidden'?$('#sidebar').outerHeight(true):0);
            }
            if(!$body.hasClass('embed')) {
                outerHeight -= $('#navbar').outerHeight(true);
            }
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
                multiSelect:'true',
                defaultNodePosition: 'top',
                selected: flowtree.selected,
                deselected: flowtree.deselected,
                opened: flowtree.selGroup,
                closed: flowtree.selGroup
            });
        },
        selected: function() {
            flowtree.flowIds.push(arguments[1].target.flowId);
            init();
        },
        deselected:function() {
            var id = arguments[1].target.flowId;
            flowtree.flowIds.splice(jQuery.inArray(id,flowtree.flowIds),1);
            init();
        },
        selGroup: function() {
        },
        getIds:function(){
            return flowtree.flowIds.join(';');
        }
    };

    //为选择流程绑定事件
    function bindUserInput(){
        //绑定tab事件
        $("#myTab a").each(function(){
            $(this).bind(horizon.tools.clickEvent(),function(){
                if($(this).parent().hasClass('active')) {
                    return;
                }
                convertime(this);
                init($(this).data('value'));
            });
        });

        //绑定图表切换菜单
        $('#statis-consuming-flow-searcher .dropdown-menu li').bind(horizon.tools.clickEvent(),function(){
            $("#statis-consuming-flow-searcher .dropdown-menu li").removeClass('active');
            $(this).addClass('active');
            $('#statis-consuming-flow-searcher .widget-title').html($(this).children('a').html());
            init();
        });
    }

    function init(mark){
        statisFlowContainer.init(mark);
    }

    function containerinit(container,mark){
        //1.判断是否是图形展现
        var type = $("#statis-consuming-flow-searcher .dropdown-menu li[class='active']").data('value');
        if(type=='table'){
            container.plot.display(false);
            container.table.display(true);
            container.table.init(mark);
        }else if(type=='pillar'){
            container.plot.display(true);
            container.table.display(false);
            container.plot.init(mark);
        }
    }

    //绑定搜索和重置按钮
    function bindSearchButton(){
        $("#statis-consuming-flow-searcher .btn-submit").bind(horizon.tools.clickEvent(),function(){
            init();
        });
    }

    // 时间控件区域分割线===========================================================
    var quarterName = [horizon.lang['statis-common']['timeInitQuarter1'],
        horizon.lang['statis-common']['timeInitQuarter2'],
        horizon.lang['statis-common']['timeInitQuarter3'],
        horizon.lang['statis-common']['timeInitQuarter4']];
    var timeinit = {
        //自定义
        auto: function() {
            var format = 'YYYY-MM-DD';
            var now = moment().format(format);
            var $autoStart = $('#auto_starttime');
            var $autoEnd = $('#auto_endtime');
            $autoStart.val(now);
            $autoEnd.val(now);
            var option = {
                startDate: now,
                endDate: now,
                showDropdowns: true,
                timePicker: false,
                timePicker24Hour: true,
                applyClass : 'btn-success',
                cancelClass : 'btn-default',
                locale: {
                    separator: '~',
                    format: format
                },
                ranges: {
                    'Today': [moment().startOf('days'), moment().endOf('days')],
                    'Yesterday': [moment().subtract('days', 1).startOf('days'), moment().subtract('days', 1).endOf('days')],
                    'Last 7 Days': [moment().subtract('days', 6).startOf('days'), moment().endOf('days')],
                    'Last 30 Days': [moment().subtract('days', 29).startOf('days'), moment().endOf('days')],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
                }
            };
            $.extend(option['locale'], horizon.lang.daterangepicker);
            option['ranges'] =function(){
                var obj = {};
                obj[horizon.lang['statis-common']['timeInitToday']]=[moment().startOf('days'), moment().endOf('days')];
                obj[horizon.lang['statis-common']['timeInitYesterday']]=[moment().subtract('days', 1).startOf('days'), moment().subtract('days', 1).endOf('days')];
                obj[horizon.lang['statis-common']['timeInitPast7']]=[moment().subtract('days', 6).startOf('days'), moment().endOf('days')];
                obj[horizon.lang['statis-common']['timeInitPast30']]=[moment().subtract('days', 29).startOf('days'), moment().endOf('days')];
                obj[horizon.lang['statis-common']['timeInitThisMonth']]=[moment().startOf('month'), moment().endOf('month')];
                obj[horizon.lang['statis-common']['timeInitLastMonth']]=[moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
                return obj;
            }();
            $('#auto_datepicker').daterangepicker(option, function(start, end, label) {
                $autoStart.val(start.format(format));
                $autoEnd.val(end.format(format));
            });
        },
        //日报
        day: function() {
            var now = moment().format('YYYY-MM-DD');
            $('#day_time').val(now).datetimepicker({
                language:horizon.vars.lang,
                minView: 'month',
                format: 'yyyy-mm-dd',
                autoclose: true,
                endDate: now
            });
        },
        //月报
        month: function() {
            var nowMonth = moment().format('YYYY-MM');
            $('#month_month').val(nowMonth).datetimepicker({
                language:horizon.vars.lang,
                autoclose: true,
                format: 'yyyy-mm',
                minView: 'year',
                startView: 'year',
                endDate: nowMonth
            });
        },
        //季报
        quarter: function() {
            var nowYear = moment().format('YYYY');
            $('#quarter_year').val(nowYear).datetimepicker({
                language:horizon.vars.lang,
                format: 'yyyy',
                endDate: nowYear,
                minView: 'decade',
                autoclose: true,
                startView: 'decade'
            })
                .on('changeDate', function(ev){
                    var year =ev.date.getFullYear();
                    initQuarterSelect(year, $("#quarter_quarter").val());
                });
            var nowMonth = new Date().getMonth();
            initQuarterSelect(nowYear, Math.floor(nowMonth/3));
        },
        //年报
        year: function() {
            var nowYear = moment().format('YYYY');
            $('#year_year').val(nowYear).datetimepicker({
                language:horizon.vars.lang,
                format: 'yyyy',
                endDate: nowYear,
                minView: 'decade',
                autoclose: true,
                startView: 'decade'
            });
        }
    };

    function initQuarterSelect(year,selected) {
        var now = new Date();
        var month1 = 11;//默认有4个季度
        if(year==now.getFullYear()){//如果是今年,则计算当前进度
            month1 = now.getMonth();
        }
        if(selected==null){
            selected =0;
        }
        if(year>now.getFullYear()){
            month1 = -1;
        }
        //计算当前所属的季度
        var current = Math.floor((month1)/3);
        var options = [];
        for(var i =0; i<=current;i++){
            var ischeck = selected==i?"selected='true'":"";
            var option = "<option value ='"+i+"' "+ischeck+" >";
            option += quarterName[i] + "</option>" ;
            options.push(option);
        }
        $("#quarter_quarter").html(options.join(""));
    }
    function convertime(obj){
        //1.首先所有都隐藏
        var mark = $(obj).data('value');
        //2.讲对应的进行显示
        $('.tab-container').addClass('hidden');
        $('#'+mark+'-tab-container').removeClass('hidden');
        $('#other-tab-container').removeClass('hidden');
    }
    // end时间控件区域分割线===========================================================

    function bindValidate(){
        $.validator.addMethod('statisAutoTime',function(value,element,params){
            var selector = params[0];
            var start = params[1];
            if($(selector).hasClass("active")){
                return value>=$(start).val();
            }
            return true;
        });
        $("#statis-consuming-flow-searcher form").validate({
            focusInvalid: false,
            rules:{
                usernames_user:"required",
                auto_endtime:{statisAutoTime:['#auto','#auto_starttime']}
            },
            errorClass: 'help-block no-margin-bottom',
            errorPlacement: function (error, element) {
                error.insertAfter(element.closest('div[class*="col-"]'));
            },
            highlight: function (e) {
                $(e).closest('.form-group').addClass('has-error');
            },
            success: function (e) {
                $(e).closest('.form-group').removeClass('has-error');
                $(e).remove();
            },
            messages:{auto_endtime:horizon.lang['static-common']['timeInitAutoValidate']}
        });
    }

    var option =  {
    	title:{
    		show:false
    	},
        grid:{
            left: '5%',
            right: '5%',
            top: '15%',
            bottom: '15%'
        },
        color:colors,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'none'
            }
        },
        legend: {
            x: 'right',
            data:[]
        },
        calculable: true,
        xAxis:
        {
            type: 'category',
            data:[],
            axisLabel : {
                interval : 0,
                rotate : 15,
                margin : 10,
                formatter: function (value) {
            	    // 若横坐标名字过长，截取前六个字符显示
            	    var length = value.length;
            	    var text = value;
            	    if (length >= 6) {
            	    	text = value.substring(0,6) + '……';
            	    }
            	    return text;
            	}
            }
        },
        yAxis: [
            {
                type: 'value',
                scale: true,
                name: horizon.lang.consuming['userConsuming'],
                min: 0,
                boundaryGap: [0.2, 0.2]
            },
            {
                type: 'value',
                scale: true,
                name: horizon.lang.consuming['userRatio'],
                max: 100,
                min: 0,
                splitNumber:10,
                boundaryGap: [0.2, 0.2],
                axisLabel: {
                    show: true,
                    interval: 'auto',
                    formatter: '{value} %'
                }
            }
        ],
        series :[]
    };
    var statisFlowContainer={
        urls:{
            'flowschart' : horizon.tools.formatUrl('/statis/consuming/flow/list/chart'),
            'singleflowchart': horizon.tools.formatUrl('/statis/consuming/singleflow/list/chart')
        },
        //初始化
        init:function(mark){
            containerinit(this,mark);
        },
        //错误操作提示
        errorMsg:function(){
        	horizon.notice.error(horizon.lang.message['operateError']);
        },
        //填充数据操作
        paddata:function(data,xaxis,legendData,seriesData){
            for(var key in xaxis){
                var xaxisitem = xaxis[key];
                legendData.push(xaxisitem.text);
                var obj;
                if(xaxisitem.doer=="1"){
                    obj={name:xaxisitem.text,type:'bar',barMaxWidth:50};
                }else{
                    obj={name:xaxisitem.text,type:'line', yAxisIndex: 1};
                }
                var seriesd =[];
                for(var i=0;i<data.recordsTotal;i++){
                    var item = data.data[i];
                    seriesd.push(item[xaxisitem.name]);
                }
                obj.data=seriesd;
                seriesData.push(obj);
            }

        },
        plot : {
            display:function(ishidden){
                var container=$('#statis-consuming-plot-flow-container1');
                ishidden?container.removeClass('hidden'):container.addClass('hidden');
            },
            init:function(mark){
                statisFlowContainer.plot.initChart(mark);
            },
            initChart:function(mark){
                var $flowStatus = $('#statis-flow-image-placeholder');
                $flowStatus.css({
                    'width': '100%',
                    'height': containerSize.height
                });
                if(!statisFlowContainer.plot.myChart){
                    statisFlowContainer.plot.myChart=echarts.init($flowStatus[0]);
                }
                statisFlowContainer.plot.myChart.resize();
                statisFlowContainer.plot.initByFlowsEcharts(statisFlowContainer.plot.myChart,mark);
            },
            initByFlowsEcharts: function(statisFlowChart,mark) {
                var useOption =  option;
                statisFlowChart.showLoading();
                // 为echarts对象加载数据
                if (useOption && typeof useOption === 'object') {
                    statisFlowChart.setOption(useOption);
                }
                statisFlowContainer.plot.ajaxByFlowsData(statisFlowChart,mark);
            },
            ajaxDateParam:function(mark){
                return {
                    "flowId": flowtree.getIds(),//实例统计参与者ID
                    "statisType" : mark ? mark : $("#myTab ul a[aria-expanded='true']").data('value'),// 统计类别
                    "autoStartTime" : $("#auto_starttime").val(),// 自定义的开始时间
                    "autoEndTime" : $("#auto_endtime").val(),// 自定义的结束时间
                    "dayTime" : $("#day_time").val(),// 日报的时间
                    "monthYear" : $("#month_year").val(),// 月报的年时间
                    "monthMonth" : $("#month_month").val(),// 月报的月时间
                    "quarterYear" : $("#quarter_year").val(),// 季报的年时间
                    "quarterQuarter" : $("#quarter_quarter").val(),// 季报的季时间
                    "yearYear" : $("#year_year").val()// 年报的年时间
                }
            },
            ajaxByFlowsData: function(statisFlowChart,mark) {
                var paramtemp = statisFlowContainer.plot.ajaxDateParam(mark);
                $.ajax({
                    url: statisFlowContainer.urls.flowschart,
                    dataType: 'json',
                    data:paramtemp,
                    cache: false,
                    error: function() {
                        statisFlowContainer.errorMsg();
                    },
                    success: function(data) {
                        if(data) {
                            if(data.recordsTotal==0){
                            	statisFlowChart.clear();
                            	statisFlowChart.hideLoading();
                            	statisFlowChart.setOption({
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
                                //处理数据，获取柱状图的X,Y坐标及数据
                                var legendData =[];
                                var xaxisData=[];
                                var seriesData =[];
                                var xaxis=function(){
                                    return {1:{text:horizon.lang.consuming['userTotalConsuming'],name:'consumingCount',doer:'1'},
                                        2:{text:horizon.lang.consuming['userRatio'],name:'percentage',doer:'2'} }
                                };
                                //---- 填充X轴数据-----
                                for(var i=0;i<data.recordsTotal;i++){
                                    var item = data.data[i];
                                    xaxisData.push(item.flowName);
                                }
                                //---- 填充显示数据 -----
                                statisFlowContainer.paddata(data,xaxis(),legendData,seriesData);
                                statisFlowChart.hideLoading();
                                statisFlowChart.setOption({
                                    legend: {data:legendData },
                                    xAxis: {data:xaxisData  },
                                    series: seriesData
                                });
                                //添加点击事件
                                statisFlowChart.off(horizon.tools.clickEvent());
                                statisFlowChart.on(horizon.tools.clickEvent(), function (params) {
                                    var index = params.dataIndex;
                                    var flowid= data.data[index].flowId;
                                    statisFlowContainer.subplot.initSubChart(params.name,flowid,mark);
                                });
                                $(window).off('resize').on('resize',function(){
                                    $('#statis-flow-image-placeholder').css({
                                        'width': '100%',
                                        'height':  containerSize.height
                                    });
                                    statisFlowChart.resize();
                                });
                            }
                        }
                    }
                });
            }
        },
        subplot : {
            initSubChart:function(name,creator,mark){
                var $flowStatus = $('#statis-flow-single-placeholder');
                if($flowStatus.is(":hidden")){
                    $flowStatus.removeClass('hidden');
                }
                $flowStatus.css({
                    'width': '100%',
                    'height': containerSize.height
                });
                $flowStatus.dialog({
                    addCloseBtn: false,
                    title: name+horizon.lang.consuming['userNodeConsuming'],
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
                statisFlowContainer.subplot.myChart=echarts.init($flowStatus[0]);
                statisFlowContainer.subplot.myChart.resize();
                statisFlowContainer.subplot.initBySingleEcharts(statisFlowContainer.subplot.myChart,creator,mark);
            },
            initBySingleEcharts: function(statisFlowChart1,creator,mark) {
                var singleOption =  option;
                statisFlowChart1.showLoading();
                // 为echarts对象加载数据
                if (singleOption && typeof singleOption === 'object') {
                    statisFlowChart1.setOption(singleOption);
                }
                statisFlowContainer.subplot.ajaxBySingleData(statisFlowChart1,creator,mark);
            },
            ajaxBySingleData: function(statisFlowChart1,creator,mark) {
                $.ajax({
                    url: statisFlowContainer.urls.singleflowchart,
                    dataType: 'json',
                    data:{
                        "flowId":creator,
                        "statisType" : mark ? mark : $("#myTab ul a[aria-expanded='true']").data('value'),// 统计类别
                        "autoStartTime" : $("#auto_starttime").val(),// 自定义的开始时间
                        "autoEndTime" : $("#auto_endtime").val(),// 自定义的结束时间
                        "dayTime" : $("#day_time").val(),// 日报的时间
                        "monthYear" : $("#month_year").val(),// 月报的年时间
                        "monthMonth" : $("#month_month").val(),// 月报的月时间
                        "quarterYear" : $("#quarter_year").val(),// 季报的年时间
                        "quarterQuarter" : $("#quarter_quarter").val(),// 季报的季时间
                        "yearYear" : $("#year_year").val()// 年报的年时间
                    },
                    cache: false,
                    error: function() {
                        statisFlowContainer.errorMsg();
                    },
                    success: function(data) {
                        if(data) {
                            if(data.recordsTotal==0){
                                statisFlowChart1.hideLoading();
                                statisFlowChart1.setOption({
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
                                //处理数据，获取柱状图的X,Y坐标及数据
                                var legendData =[];
                                var xaxisData=[];
                                var seriesData =[];
                                var xaxis=function(){
                                    return {1:{text:horizon.lang.consuming['userTotalConsuming'],name:'consumingCount',doer:'1',itemStyle:{ normal:{color:'#6495ED'} }},
                                        2:{text:horizon.lang.consuming['userRatio'],name:'percentage',doer:'2'} }
                                };
                                //---- 填充X轴数据-----
                                for(var i=0;i<data.recordsTotal;i++){
                                    var item = data.data[i];
                                    xaxisData.push(item.nodeName);
                                }
                                //---- 填充显示数据 -----
                                statisFlowContainer.paddata(data,xaxis(),legendData,seriesData);
                                statisFlowChart1.hideLoading();
                                statisFlowChart1.setOption({
                                    legend: { data:legendData  },
                                    xAxis: { data:xaxisData  },
                                    series: seriesData
                                });
                                //添加点击事件
                                statisFlowChart1.on('click', function (params) {
                                    var flowid= data.data[params.dataIndex].flowId;
                                    statisFlowContainer.subplottask.initSubTaskChart(creator,params.name,flowid,mark);
                                });
                                $(window).off('resize').on('resize',function(){
                                    $('#statis-flow-single-placeholder').css({
                                        'width': '100%',
                                        'height':  containerSize.height
                                    });
                                    statisFlowChart1.resize();
                                });
                            }
                        }
                    }
                });
            }
        },
        table:{
            display:function(ishidden){
                var container=$('#statis-consuming-table-flow-container1');
                ishidden?container.removeClass('hidden'):container.addClass('hidden');
            },
            init:function(mark){
                statisFlowContainer.table.initTable(mark);
            },
            initTable:function(mark){//初始化主表
                if($('#statis-consuming-flow-table-placeholder').data('horizonTable')){
                    statisFlowContainer.table.mytable.showProcessing();
                    $.ajax({
                        url: statisFlowContainer.urls.flowschart,
                        cache: false,
                        type:'post',
                        dataType: 'json',
                        data:statisFlowContainer.plot.ajaxDateParam(mark),
                        success: function(data) {
                            statisFlowContainer.table.mytable.hideProcessing();
                            statisFlowContainer.table.mytable.pluginTable.fnClearTable(false);
                            for(var i=0;i<data.data.length;i++){
                                var item = data.data[i];
                                statisFlowContainer.table.mytable.pluginTable.fnAddData(item,false);
                            }
                            statisFlowContainer.table.mytable.reload(true);
                        },
                        error: function() {
                        	horizon.notice.error(horizon.lang['statis-common']['readFail']);
                            statisFlowContainer.table.mytable.hideProcessing();
                        }
                    });

                }else{
                    statisFlowContainer.table.mytable =$('#statis-consuming-flow-table-placeholder').horizonTable({
                        settings: {
                            title: horizon.lang.base['infoList'],
                            multipleSearchable: false,//高级搜索
                            multipleSearchAreaVisible: false,
                            searchable:false,
                            height:containerSize.height,
                            columns: statisFlowContainer.table.column
                        },
                        serverSideData: false
                    });
                    var $dataTablesContainer = statisFlowContainer.table.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                    $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                        statisFlowContainer.table.initTable(mark);
                    });
                    statisFlowContainer.table.initTable(mark);
                }
            },
            column: [
                {
                    name : 'flowName',
                    title : horizon.lang.consuming['userFlowName'],
                    width : '200px',
                    visible : true,
                    searchable : true,
                    multipleSearchable : false,
                    orderable : false ,
                    fnClick: function(nTd, nTdData, rowData, iRow, i,mark) {
                        statisFlowContainer.subtable.opendialog(rowData,mark);
                    }
                },
                {
                    name : 'consumingCount',
                    title : horizon.lang.consuming['userTotalConsuming'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : true,
                    columnClass : 'align-left'
                },
                {
                    name : 'percentage',
                    title : horizon.lang.consuming['userRatio'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : true ,
                    columnClass : 'align-left'
                }
            ]
        },
        subtable :{
            opendialog:function(rowdata,mark){
                var flowId=rowdata.flowId;
                var flowName=rowdata.flowName;
                var $dialog = $('#statis-consuming-table-flow-container2');
                statisFlowContainer.subtable.initTable(flowId,mark);
                $dialog.dialog({
                    addCloseBtn: false,
                    title: flowName+horizon.lang.consuming['flowFlowConsuming'],
                    width: $(window).width() > 995?'995':'995',
                    height: $(window).height() > 640?'640':'auto',
                    maxHeight: $(window).height(),
                    minHeight:'500'
                });
            },
            initTable: function(flowId,mark) {
                if($('#statis-flow-single-table-placeholder').data('horizonTable')){
                    statisFlowContainer.subtable.mytable.reload(true);
                }else{
                    statisFlowContainer.subtable.mytable = $('#statis-flow-single-table-placeholder').horizonTable({
                        settings: {
                            destroy:true,
                            searchable:false,
                            columns: [
                                {
                                    name : 'nodeName',
                                    title : horizon.lang.consuming['userNodeName'],
                                    width : '200px',
                                    visible : true,
                                    searchable : true,
                                    multipleSearchable : true,
                                    orderable : false
                                },
                                {
                                    name : 'consumingCount',
                                    title : horizon.lang.consuming['userTotalConsuming'],
                                    width : '100px',
                                    visible : true,
                                    searchable : false,
                                    multipleSearchable : false,
                                    orderable : true,
                                    columnClass : 'align-left'
                                }  ,
                                {
                                    name : 'percentage',
                                    title : horizon.lang.consuming['userRatio'],
                                    width : '100px',
                                    visible : true,
                                    searchable : false,
                                    multipleSearchable : false,
                                    orderable : true ,
                                    columnClass : 'align-left'
                                }
                            ],
                            height:function(){
                                return $("#statis-consuming-table-flow-container2").height()-10;
                            }
                        },
                        serverSideData: false
                        // data: data['data']
                    });
                }

                var $dataTablesContainer = statisFlowContainer.subtable.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                    statisFlowContainer.subtable.reloadTable(flowId,mark);
                });
                statisFlowContainer.subtable.reloadTable(flowId,mark);

            },
            reloadTable:function(flowId,mark){
                statisFlowContainer.subtable.mytable.showProcessing();
                $.ajax({
                    url: statisFlowContainer.urls.singleflowchart,
                    cache: false,
                    data:{
                        "flowId":flowId,
                        "statisType":mark?mark:$("#myTab ul a[aria-expanded='true']").data('value'),//统计类别
                        "autoStartTime":$("#auto_starttime").val(),//自定义的开始时间
                        "autoEndTime":$("#auto_endtime").val(),//自定义的结束时间
                        "dayTime":$("#day_time").val(),//日报的时间
                        "monthYear":$("#month_year").val(),//月报的年时间
                        "monthMonth":$("#month_month").val(),//月报的月时间
                        "quarterYear":$("#quarter_year").val(),//季报的年时间
                        "quarterQuarter":$("#quarter_quarter").val(),//季报的季时间
                        "yearYear":$("#year_year").val()//年报的年时间
                    },
                    dataType: 'json',
                    success: function(data) {
                        statisFlowContainer.subtable.mytable.hideProcessing();
                        statisFlowContainer.subtable.mytable.pluginTable.fnClearTable(true);
                        for(var i=0;i<data.data.length;i++){
                            var item = data.data[i];
                            statisFlowContainer.subtable.mytable.pluginTable.fnAddData(item,false);
                        }
                        statisFlowContainer.subtable.mytable.reload(true);
                    },
                    error: function() {
                    	horizon.notice.error( horizon.lang['statis-common']['readFail']);
                        statisFlowContainer.subtable.mytable.hideProcessing();
                    }
                });
            }
        }
    };

    //此方法用来初始化搜索选项
    function initSearcher(){
        //初始化树
        flowtree.init();
        for(var item in timeinit){
            timeinit[item]();
        };
        bindUserInput();
        bindSearchButton();
        statisFlowContainer.plot.myChart=null;
      //右侧流程树隐藏和展开时图表重画
        $('.modal-dialog').off(horizon.tools.clickEvent() + '.fa-unlock').on(horizon.tools.clickEvent() + '.fa-unlock', function(e){
            setTimeout(function(){
            	statisFlowContainer.plot.myChart.resize();
            },100);
        });
        $('.modal-dialog').off(horizon.tools.clickEvent() + '.fa-lock').on(horizon.tools.clickEvent() + '.fa-lock', function(e){
            setTimeout(function(){
            	statisFlowContainer.plot.myChart.resize();
            },100);
        });
    }

    return horizon.engine['consumingbyflow'] = {
        init : init,
        initSearcher:initSearcher,
        flowtree:flowtree
    };
}));
