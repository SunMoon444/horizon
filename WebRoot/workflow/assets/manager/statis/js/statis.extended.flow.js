/**
 * 最热流程占比
 *
 * @author chengll
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        var scripts = ['jquery','echarts', 'moment','horizonTable','bootstrapDatetimepicker','gritter','daterangepicker' ];//当前模块的依赖
        define(scripts, factory);
    } else {
        factory(jQuery, moment);
    }
}(function($, echarts,moment) {
    "use strict";
    var $bodycontainer;//页面容器,表示使用哪个js
    var colors= ['#ABD4A5', '#F3DD99', '#ABDFE5', '#A0D1EA', '#EC9F9D', '#ca8622', '#bda29a',
        '#ff7f50', '#87cefa', '#da70d6', '#32cd32', '#6495ed',
        '#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0',
        '#1e90ff', '#ff6347', '#7b68ee', '#00fa9a', '#ffd700',
        '#6b8e23', '#ff00ff', '#3cb371', '#b8860b', '#30e0e0'];
    //容器的大小
    var containerSize = {
        height: function() {
            var _height = horizon.tools.getPageContentHeight(),
                $pageHeader = $('.page-header');
            if($pageHeader.css('display') != 'none') {
                _height -= $pageHeader.outerHeight(true);
            }
            _height = _height - $('.flow-status-pic').outerHeight(true) - $('#statis-extended-flow-searcher .widget-box').outerHeight(true);
            return _height;
        },
        width: function() {
            return $('.page-content-area').outerWidth(true);
        },
        picHeight: function() {
            return containerSize.height();
        }
    };

    //绑定tab事件
    function bindUserInput(){
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
        $('#statis-extended-flow-searcher .dropdown-menu li').bind(horizon.tools.clickEvent(),function(){
            $("#statis-extended-flow-searcher .dropdown-menu li").removeClass('active');
            $(this).addClass('active');
            $('#statis-extended-flow-searcher .widget-title').html($(this).children('a').html());
            init();
        });
    }

    //绑定搜索和重置按钮
    function bindSearchButton(){
        $("#statis-extended-flow-searcher .btn-submit").bind(horizon.tools.clickEvent(),function(){
            init();
        });
    }

    function resizeCallBack(myChart){
    	var $sele= $('#statis-extended-flow-placeholder');
        $(window).off('resize').on('resize',function(){
            if(myChart != null&&$sele) {
                $sele.css({
                    'width': '100%',
                    'height': containerSize.picHeight(),
                    'min-height':'500px'
                });
                myChart.resize();
            }
        });
        $('.sidebar-collapse').off(horizon.tools.clickEvent() + '.ace.menu').on(horizon.tools.clickEvent() + '.ace.menu', function(e){
            setTimeout(function(){
                myChart.resize();
            },100);
        });
    }

    function init(mark){
        extendedflowContainer.init(mark);
    }

    function containerinit(container,mark){
        //1.判断是否是图形展现
        var type = $("#statis-extended-flow-searcher .dropdown-menu li[class='active']").data('value');
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

    // 时间控件区域
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
        day:function() {
            var now = moment().format('YYYY-MM-DD');
            $('#day_time').val(now).datetimepicker({
                language: horizon.vars.lang,
                format: 'yyyy-mm-dd',
                endDate: now,
                autoclose: true,
                minView: 'month'
            });
        },
        //月报
        month: function() {
            var nowMonth= moment().format('YYYY-MM');
            $('#month_month').val(nowMonth).datetimepicker({
                language:horizon.vars.lang,
                format: 'yyyy-mm',
                endDate: nowMonth,
                minView: 'year',
                autoclose: true,
                startView: 'year'
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
                    var year = ev.date.getFullYear();
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

    function initQuarterSelect(year,selected){
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
        var current =  Math.floor((month1)/3);
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
    // end时间控件区域

    function bindValidate(){
        $.validator.addMethod('statisAutoTime',function(value,element,params){
            var selector = params[0];
            var start = params[1];

            if($(selector).hasClass("active")){
                return value>=$(start).val();
            }
            return true;
        });
        $("#statis-extended-flow-searcher form").validate({
            focusInvalid: false,
            rules:{
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
            messages:{
                auto_endtime:horizon.lang['statis-common']['timeInitAutoValidate']
            }
        });
    }

    //设置option
    var optionset={
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
                name: horizon.lang.quantity['extendedFlowRatio'],
                type: 'pie',
                radius: '70%',
                center: ['50%', '50%'],
                data: [],
                minAngle: 10,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0
                    }
                }
            }
        ]
    }
    //统计区域
    var extendedflowContainer={
        urls:{
            'charturl' : horizon.tools.formatUrl('/statis/extended/flow/list/chart'),
            'taskchart':horizon.tools.formatUrl('/statis/extended/task/list/chart'),
            'tasktable':horizon.tools.formatUrl('/statis/extended/task/list/table')
        },
        init:function(mark){
            //1.判断是否是图形展现
            containerinit(this,mark);
        },
        plot:{
            display:function(ishidden){
                var container=$('#statis-extended-flowimage-container');
                ishidden?container.removeClass('hidden'):container.addClass('hidden');
            },
            init:function(mark){
                extendedflowContainer.plot.initChart(mark);
            },
            initChart:function(mark){
                var $flowStatus = $('#statis-extended-flow-placeholder');
                $flowStatus.css({
                    'width': '100%',
                    'height':containerSize.height
                });
                if(extendedflowContainer.plot.myChart){
                	extendedflowContainer.plot.myChart.clear();
                }
                extendedflowContainer.plot.myChart=echarts.init($flowStatus[0]);
                extendedflowContainer.plot.myChart.resize();
                extendedflowContainer.plot.initExtendedFlowEcharts(extendedflowContainer.plot.myChart,mark);
            },
            ajaxDateParam:function(mark){
                return {
                    statisType:mark?mark:$("#myTab ul a[aria-expanded='true']").data('value'),//统计类别
                    autoStartTime:$("#auto_starttime").val(),//自定义的开始时间
                    autoEndTime:$("#auto_endtime").val(),//自定义的结束时间
                    dayTime:$("#day_time").val(),//日报的时间
                    monthYear:$("#month_year").val(),//月报的年时间
                    monthMonth:$("#month_month").val(),//月报的月时间
                    quarterYear:$("#quarter_year").val(),//季报的年时间
                    quarterQuarter:$("#quarter_quarter").val(),//季报的季时间
                    yearYear:$("#year_year").val(),//年报的年时间
                    "size":$("#size").val()//显示条数
                }
            },
            initExtendedFlowEcharts: function(flowStatusChart,mark) {
                var option =  optionset;
                flowStatusChart.showLoading();
                // 为echarts对象加载数据
                if (option && typeof option === 'object') {
                    flowStatusChart.setOption(option);
                }
                extendedflowContainer.plot.ajaxExtendeddFlowData(flowStatusChart,mark);
            },
            ajaxExtendeddFlowData: function(flowStatusChart,mark) {
                $.ajax({
                    url: extendedflowContainer.urls.charturl,
                    dataType: 'json',
                    data: extendedflowContainer.plot.ajaxDateParam(mark),
                    cache: false,
                    error: function() {
                    	horizon.notice.error(horizon.lang.message['operateError']);
                    },
                    success: function(data) {
                        if(data) {
                            if(data.recordsTotal==0){
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
                                var legenddata =[];
                                var seriesdata =[];
                                for(var i=0;i<data.data.length;i++){
                                    var item = data.data[i];
                                    var value={};
                                    legenddata.push(item.flowName);
                                    value.value=item.extendedCount;
                                    value.name=item.flowName;
                                    value.flowId=item.flowId;
                                    seriesdata.push(value);
                                };
                                flowStatusChart.hideLoading();
                                flowStatusChart.setOption({
                                    legend: {
                                        data:legenddata
                                    },
                                    series: {
                                        data:seriesdata
                                    }
                                });
                                //添加点击事件
                                flowStatusChart.on('click', function (params,mark) {
                                    var flowid= params.data.flowId;
                                    extendedflowContainer.subChart.initSubChart(true,flowid,params.name,mark);
                                });
                            }
                        }
                        resizeCallBack(flowStatusChart);
                    }
                });
            }
        },
        subChart:{
            initSubChart:function(ishidden,flowid,flowname,mark){
                var $flowStatus = $('#statis-extended-flowimage-container1');
                ishidden?$flowStatus.removeClass('hidden'):$flowStatus.addClass('hidden');
                $flowStatus.dialog({
                    addCloseBtn: false,
                    title: flowname+horizon.lang.quantity['extendedFlowNode'],
                    width: $(window).width() > 995?'995':$(window).width(),
                    height: $(window).height() > 640?'640':'auto',
                    maxHeight: $(window).height(),
                    minHeight:'500',
                    close: function() {
                        extendedflowContainer.subChart.myChart.dispose();
                    },
                    open:function(){
                        if(!horizon.vars.touch){
                            $(window).trigger('resize.dataTable');
                        }
                    }
                });
                $('#statis-extended-task-placeholder').css({
                    'width': '100%',
                    'height':containerSize.height
                });
                extendedflowContainer.subChart.myChart=echarts.init($('#statis-extended-task-placeholder')[0]);
                extendedflowContainer.subChart.initExtendedEcharts(extendedflowContainer.subChart.myChart,flowid,mark);
                extendedflowContainer.subChart.myChart.resize();
            },
            initExtendedEcharts: function(statisUserChart1,flowid,mark) {
                var singleOption =  optionset;
                statisUserChart1.showLoading();
                // 为echarts对象加载数据
                if (singleOption && typeof singleOption === 'object') {
                    statisUserChart1.setOption(singleOption);
                }
                extendedflowContainer.subChart.ajaxExtendedData(statisUserChart1,flowid,mark);
            },
            ajaxExtendedData: function(statisUserChart1,flowid,mark) {
                $.ajax({
                    url: extendedflowContainer.urls.taskchart,
                    dataType: 'json',
                    data:{"flowId":flowid,
                        statisType:mark?mark:$("#myTab ul a[aria-expanded='true']").data('value'),//统计类别
                        autoStartTime:$("#auto_starttime").val(),//自定义的开始时间
                        autoEndTime:$("#auto_endtime").val(),//自定义的结束时间
                        dayTime:$("#day_time").val(),//日报的时间
                        monthYear:$("#month_year").val(),//月报的年时间
                        monthMonth:$("#month_month").val(),//月报的月时间
                        quarterYear:$("#quarter_year").val(),//季报的年时间
                        quarterQuarter:$("#quarter_quarter").val(),//季报的季时间
                        yearYear:$("#year_year").val()//年报的年时间
                    },
                    cache: false,
                    error: function() {
                    	horizon.notice.error(horizon.lang.message['operateError']);
                    },
                    success: function(data) {
                        if(data) {
                            if(data.recordsTotal==0){
                                statisUserChart1.hideLoading();
                                statisUserChart1.setOption({
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
                                var legenddata =[];
                                var seriesdata =[];
                                for(var i=0;i<data.recordsTotal;i++){
                                    var item = data.data[i];
                                    var value={};
                                    legenddata.push(item.nodeName);
                                    value.value=item.extendedCount;
                                    value.name=item.nodeName;
                                    seriesdata.push(value);
                                };
                                statisUserChart1.hideLoading();
                                var startAngle = 0;
                                if(data.length == 1) {
                                    startAngle = 90;
                                }
                                statisUserChart1.setOption({
                                    legend: {
                                        data:legenddata
                                    },
                                    series: {
                                        startAngle: startAngle,
                                        data:seriesdata
                                    }
                                });
                                $(window).off('resize').on('resize',function(){
                                    $('#statis-extended-task-placeholder').css({
                                        'width': '100%',
                                        'height': containerSize.height
                                    });
                                    statisUserChart1.resize();
                                });
                            }
                        }
                    }
                });
            }
        },
        table:{
            display:function(ishidden){
                var container=$('#statis-extendflow-data-container');
                ishidden?container.removeClass('hidden'):container.addClass('hidden');
            },
            init:function(mark){
                extendedflowContainer.table.initTable(mark);
            },
            initTable:function(mark){//初始化主表
                if($('#statis-extendflow-table-data').data('horizonTable')){
                    extendedflowContainer.table.mytable.showProcessing();
                    $.ajax({
                        url: extendedflowContainer.urls.charturl,
                        cache: false,
                        type:'post',
                        dataType: 'json',
                        data:extendedflowContainer.plot.ajaxDateParam(mark),
                        success: function(data) {
                            extendedflowContainer.table.mytable.hideProcessing();
                            extendedflowContainer.table.mytable.pluginTable.fnClearTable(false);
                            for(var i=0;i<data.data.length;i++){
                                var item = data.data[i];
                                extendedflowContainer.table.mytable.pluginTable.fnAddData(item,false);
                            }
                            extendedflowContainer.table.mytable.reload(true);
                        },
                        error: function() {
                        	horizon.notice.error(horizon.lang['statis-common']['readFail']);
                            extendedflowContainer.table.mytable.hideProcessing();
                        }
                    });

                }else{
                    extendedflowContainer.table.mytable =$('#statis-extendflow-table-data').horizonTable({
                        settings: {
                            title: horizon.lang['statis-common']['tableTitle'],
                            multipleSearchable: false,//高级搜索
                            multipleSearchAreaVisible: false,
                            searchable:false,
                            height:containerSize.height,
                            columns: extendedflowContainer.table.column
                        },
                        serverSideData: false
                    });
                    var $dataTablesContainer = extendedflowContainer.table.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                    $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                        extendedflowContainer.table.initTable(mark);
                    });
                    extendedflowContainer.table.initTable(mark);
                }
            },
            column: [
                {
                    name : 'flowName',
                    title : horizon.lang.quantity['userFlowName'],
                    width : '200px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : false ,
                    fnClick: function(nTd, nTdData, rowData, iRow, i,mark) {
                        extendedflowContainer.subtable.opendialog(rowData,mark);
                    }
                },
                {
                    name : 'extendedCount',
                    title : horizon.lang.quantity['userExtendedCount'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : true,
                    columnClass : 'align-left'
                }
            ]
        },
        subtable :{
            opendialog:function(rowdata,mark){
                var flowid=rowdata.flowId;
                var flowname=rowdata.flowName;
                var $dialog = $('#statis-extendflow-data-container2');
                extendedflowContainer.subtable.initTable(flowid,mark);
                $dialog.dialog({
                    addCloseBtn: false,
                    closeText: horizon.lang.base['close'],
                    appendTo:'.page-content-area',
                    title: horizon.lang.quantity['userFlowName']+'：'+flowname,
                    width: $(window).width() > 995?'995':$(window).width(),
                    height: $(window).height() > 540?'540':'auto',
                    maxHeight: $(window).height(),
                    minHeight:'500',
                    open:function(){
                        if(!horizon.vars.touch){
                            $(window).trigger('resize.dataTable');
                        }
                    }
                });
            },
            initTable: function(flowid,mark) {
                if($('#statis-extendflow-table-data-sub').data('horizonTable')){
                    extendedflowContainer.subtable.mytable.reload(true);
                }else{
                    extendedflowContainer.subtable.mytable = $('#statis-extendflow-table-data-sub').horizonTable({
                        settings: {
                            searchable:false,
                            columns: [
                                {
                                    name : 'nodeName',
                                    title : horizon.lang.quantity['userNodeName'],
                                    width : '200px',
                                    visible : true,
                                    searchable : false,
                                    multipleSearchable : false,
                                    orderable : true
                                },
                                {
                                    name : 'extendedCount',
                                    title : horizon.lang.quantity['userExtendedCount'],
                                    width : '100px',
                                    visible : true,
                                    searchable : false,
                                    multipleSearchable : false,
                                    orderable : false,
                                    columnClass : 'align-left'
                                }
                            ],
                            height:function(){
                                return $("#statis-extendflow-data-container2").height()-10;
                            }
                        },
                        serverSideData: false
                        // data: data['data']
                    });
                }

                var $dataTablesContainer = extendedflowContainer.subtable.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                    extendedflowContainer.subtable.reloadTable(flowid,mark);
                });
                extendedflowContainer.subtable.reloadTable(flowid,mark);

            },
            reloadTable:function(flowid,mark){
                extendedflowContainer.subtable.mytable.showProcessing();
                $.ajax({
                    url: extendedflowContainer.urls.tasktable,
                    cache: false,
                    data:{
                        "flowId":flowid,
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
                        extendedflowContainer.subtable.mytable.hideProcessing();
                        extendedflowContainer.subtable.mytable.pluginTable.fnClearTable(true);
                        for(var i=0;i<data.data.length;i++){
                            var item = data.data[i];
                            extendedflowContainer.subtable.mytable.pluginTable.fnAddData(item,false);
                        }
                        extendedflowContainer.subtable.mytable.reload(true);
                    },
                    error: function() {
                    	horizon.notice.error(horizon.lang['statis-common']['readFail']);
                        extendedflowContainer.subtable.mytable.hideProcessing();
                    }
                });
            }
        }
    };
    //此方法用来初始化搜索选项
    function initSearcher(){
        for(var item in timeinit){
            timeinit[item]();
        }
        bindUserInput();
        bindSearchButton();
        extendedflowContainer.plot.myChart=null;
    }
    return horizon.engine['extendedflow'] = {
        init : init,
        showtime:convertime,
        initSearcher:initSearcher
    };
}));
