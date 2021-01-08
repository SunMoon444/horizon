/**
 * 首页监控图相关功能
 *
 * @since 2017-07-17
 * @author chengll
 */
(function(factory) {
    if(typeof define === 'function' && define.amd) {
        var scripts = ['jquery', 'echarts','horizonTable','gritter'];
        define(scripts, factory);
    }else {
        factory(jQuery, echarts);
    }
}(function($, echarts) {
    "use strict";
    var optionTime = null;//实时监控数据配置项
    var timeInterval; //实时时间间隔对象
    var dateTime = []; //实时监控时间
    var activeData = []; //实时监控 --内存中活动实例数
    var totleData = [];  //实时监控 --内存中实例数总数
    var licenseData = []; //实时监控 --license
    var yearHis = 0; //实时监控 -- 后台返回的年份
    var currentYearHis = 0; //实时监控 -- 当前显示的年份

    var $instanceMonitor = $("#instance-monitoring");
    var $exceptionMonitor = $('#exception-monitor-chart');
    var $flowStatus = $('#flow-status-chart');
    var $time = $('#time-charts');
    var $history = $('#history-charts');

    var instanceMonitorChart = null;
    var exceptionMonitorChart = null;
    var flowStatusChart = null;
    var timeChart = null;
    var hisChart = null;

    var operatorError = function() {
        horizon.notice.error(horizon.lang.message['operateError']);
    };

    var urls = {
        getCount : horizon.tools.formatUrl('/home/find/count'),
        exception : horizon.tools.formatUrl('/home/find/exception'),
        findInstance : horizon.tools.formatUrl('/home/find/instance'),
        removeInstance : horizon.tools.formatUrl('/home/remove/instance'),
        history : horizon.tools.formatUrl('/monitor/memory/history'),
        realTime : horizon.tools.formatUrl('/monitor/memory/realtime'),
        flowStatus : horizon.tools.formatUrl('/monitor/flowstatus'),
        chartUrl : horizon.tools.formatUrl('/home/instance/monitor/chart')
    };

    //容器的大小
    var containerSize = {
        height: function() {
            var _height = horizon.tools.getPageContentHeight();
            _height = _height - $('.flow-status-pic').outerHeight(true) - $('.widget-header-ram').outerHeight(true);
            if($(window).width() < 768) {
                _height = _height/2.5 - parseInt($('.page-content').css('paddingTop'))
            }else{
                _height = _height/2 - parseInt($('.page-content').css('paddingTop'))
            }
            return _height;
        },
        width: function() {
            return $('.page-content-area').outerWidth(true);
        },
        picHeight: function() {
            var _picHeight = containerSize.height();
            _picHeight -= $('.widget-header-flow').outerHeight(true);
            _picHeight -= _picHeight/5;
            return _picHeight;
        }
    };
    var countList = {
        // 初始化数据总数
        init:function(){
            $.ajax({
                url : urls.getCount,
                dataType:'json',
                cache : false,
                error : function(){
                    horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success : function(data) {
                    if(data) {
                        $.each(data,function(key,value){
                            $("#"+key).html(value);
                        });
                    }else{
                        horizon.notice.error(horizon.lang['homepage']['getDataFail']);
                    }
                }
            });
        }
    };

    var instanceMonitoring = {
        //初始化实例监控图
        init: function() {
            instanceMonitorChart = echarts.init($instanceMonitor[0]);
            var option = {
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data:[]
                },
                grid: {
                    left: '4%',
                    right: '4%',
                    top:'15%',
                    bottom: '0%',
                    containLabel: true
                },
                xAxis:  {
                    type: 'category',
                    boundaryGap: false,
                    splitLine:{
                        show:false
                    },
                    axisLine:{
                        lineStyle:{
                            color:'#CCCCCC'
                        }
                    },
                    axisLabel:{
                        textStyle:{
                            color:'#000000'
                        }
                    },
                    data: []
                },
                yAxis: {
                    type: 'value',
                    splitLine:{
                        show:true,
                        lineStyle: {
                            color: ['#f3f5f9'],
                            type:'solid'
                        }
                    },
                    axisLine:{
                        lineStyle:{
                            color:'#CCCCCC'
                        }
                    },
                    axisLabel:{
                        textStyle:{
                            color:'#000000'
                        }
                    }
                },
                series: [{
                    name:horizon.lang['homepage']['finishInstance'],
                    type:'line',
                    data:[]
                },
                    {
                        name:horizon.lang['homepage']['notFinishInstance'],
                        type:'line',
                        data:[]
                    }]

            };
            $.ajax({
                url: urls.chartUrl,
                dataType: 'json',
                cache: false,
                error: function() {
                },
                success: function(data) {
                    if (data) {
                        if(data.length == 0) {
                        	instanceMonitorChart.clear();
                            instanceMonitorChart.hideLoading();
                            instanceMonitorChart.setOption({
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
                            var legendData =[];
                            var xaxisData=[];
                            var seriesData =[];
                            var itemStyleExecption = {
                                'createCount' : { normal:{color:'#478FCA'} },
                                'finishCount' : { normal:{color:'#ABD4A5'} }
                            };
                            var xaxis=function(){
                                return {1:{text:horizon.lang['homepage']['notFinishInstance'],name:'createCount' },
                                    2:{text:horizon.lang['homepage']['finishInstance'],name:'finishCount' }
                                }
                            };
                            //---- 填充X轴数据-----
                            for(var i=0;i<data.length;i++){
                                var item = data[i];
                                xaxisData.push(item.activeDate);
                            }
                            //---- 填充显示数据 -----
                            for(var key in xaxis()){
                                var xaxisitem = xaxis()[key];
                                legendData.push(xaxisitem.text);
                                var obj={name:xaxisitem.text,type:'line',itemStyle:itemStyleExecption[xaxisitem.name]};
                                var seriesd =[];
                                for(var i=0;i<data.length;i++){
                                    var item = data[i];
                                    seriesd.push(item[xaxisitem.name]);
                                }
                                obj.data=seriesd;
                                seriesData.push(obj);
                            }
                            instanceMonitorChart.hideLoading();
                            instanceMonitorChart.setOption({
                                legend: { data:legendData  },
                                xAxis: { data:xaxisData  },
                                series: seriesData
                            });
                            instanceMonitorChart.resize();
                        }
                    }
                }
            });
            instanceMonitorChart.setOption(option);
        }
    };

    var exceptionMonitor = {
        //初始化异常监控数据
        initExceptionMonitorEcharts: function(legendData,data) {
            exceptionMonitorChart = echarts.init($exceptionMonitor[0]);
            var optionExceptionMonitor = {
                tooltip : {
                    trigger: 'axis',
                    axisPointer:{
                        show: true,
                        type : 'cross',
                        lineStyle: {
                            type : 'solid',
                            width : 1
                        }
                    }
                },
                grid: {
                    left: '4%',
                    right: '2%',
                    top:'15%',
                    bottom: '0%',
                    containLabel: true
                },
                animation: false,
                legend: {
                    data:legendData
                },
                dataRange: {
                    min: 0,
                    max: 500,
                    orient: 'horizontal',
                    y: 50,
                    x: 'center'
                },
                xAxis: [
                    {
                        type : 'value',
                        axisLabel: {
                            formatter : function(v) {
                                return v
                            },
                            textStyle:{
                                color:'#000000'
                            }
                        },
                        splitLine:{
                            show:false
                        },
                        axisLine:{
                            lineStyle:{
                                color:'#CCCCCC'
                            }
                        },
                        data : function (){
                            var list = [];
                            var len = 0;
                            while (len++ < 31) {
                                list.push(len);
                            }
                            return list;
                        }()
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        splitLine:{
                            show:true,
                            lineStyle: {
                                color: ['#f3f5f9'],
                                type:'solid'
                            }
                        },
                        axisLine:{
                            lineStyle:{
                                color:'#CCCCCC'
                            }
                        },
                        axisLabel:{
                            textStyle:{
                                color:'#000000'
                            }
                        }
                    }
                ],
                series : data
            };
            if (optionExceptionMonitor && typeof optionExceptionMonitor === 'object') {
                exceptionMonitorChart.setOption(optionExceptionMonitor);
            }
            exceptionMonitorChart.resize();
        },
        ajaxExceptionMonitorData: function() {
            exceptionMonitorChart = echarts.init($exceptionMonitor[0]);
            $.ajax({
                url: urls.exception,
                dataType: 'json',
                cache: false,
                error: function() {
                    operatorError();
                },
                success: function(data) {
                    if(data.length == 0) {
                        exceptionMonitorChart.hideLoading();
                        exceptionMonitorChart.setOption({
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
                        var legendData =[];
                        var seriesData =[];
                        var itemStyleExecption = {
                            'extendedCount' : { normal:{color:'#d87c7c'} },
                            'exceptionCount' : { normal:{color:'#33CCCC'} },
                            'revokeCount' : { normal:{color:'#FF9966'} }
                        };
                        var xaxis=function(){
                            return {1:{text:horizon.lang['homepage']['extendedCount'],name:'extendedCount' },
                                2:{text:horizon.lang['homepage']['exceptionCount'],name:'exceptionCount' },
                                3:{text:horizon.lang['homepage']['revokeCount'],name:'revokeCount' }}
                        };
                        //---- 填充显示数据 -----
                        var i = 15;//控制散点的大小
                        //获取当前日期
                        var myDate = new Date();
                        for(var key in xaxis()){
                            var xaxisitem = xaxis()[key];
                            var text = xaxisitem.text;
                            legendData.push(text);
                            var obj = {name:text,type:'scatter',symbol: 'circle',symbolSize:i,tooltip:{
                                trigger: 'item',
                                formatter : function (params) {
                                    return params.seriesName + '<br/>'
                                        + params.value[2] + " " + horizon.lang['homepage']['day']
                                        + params.value[1] + " " + horizon.lang['homepage']['number'];
                                },
                                axisPointer:{
                                    show: true
                                }
                            },itemStyle:itemStyleExecption[xaxisitem.name]};//
                            var seriesd = [];
                            for(var k = 0, iLen = data.length; k < iLen; k++){
                                var item = data[k];
                                var temp = [];
                                var showDate = new Date((item.activeDate).replace(/-/g,"/"));
                                var num = parseInt(Math.ceil((myDate-showDate)/(1000*3600*24)));
                                temp.push((30-num));
                                temp.push(item[xaxisitem.name]=='0'?null:item[xaxisitem.name]);
                                temp.push(item.activeDate);
                                seriesd.push(temp);
                            }
                            obj.data = seriesd;
                            seriesData.push(obj);
                            i = i+10;
                        }
                        exceptionMonitor.initExceptionMonitorEcharts(legendData,seriesData);
                    }
                }
            });
        }
    };

    var table = {
        //初始化内存中实例列表数据
        init: function() {
            table.mytable = $('#myDatatable').horizonTable({
                settings: {
                    reload:false,
                    searchable:false,
                    multipleSearchable: false,
                    height: containerSize.picHeight,
                    checkbox: 0,
                    cache: false,
                    type:'post',
                    dataType: 'json',
                    columns: [
                        {
                            dataProp : 'id'
                        },
                        {
                            name : 'title',
                            title : horizon.lang['instance-monitor']['columnsTitle'],
                            width : '100px',
                            searchable : false,
                            orderable : false,
                            multipleSearchable : false
                        },
                        {
                            name : 'flowName',
                            title :  horizon.lang['instance-monitor']['columnsFlowName'],
                            width : '110px',
                            searchable : false,
                            orderable : false,
                            multipleSearchable : false
                        },
                        {
                            name : 'status',
                            title :  horizon.lang['instance-monitor']['columnsState'],
                            width : '40px',
                            orderable : false,
                            multipleSearchable : false
                        },
                        {
                            name : 'date',
                            title :  horizon.lang['homepage']['date'],
                            orderable : true,
                            width : '130px'
                        }
                    ]
                },
                ajaxDataSource: urls.findInstance
            });
            $('.dataTables_header').addClass('hidden');
            $('.dataTables_footer').addClass('hidden');
        }
    };

    var operate = {
        refreshOper:function(){
            $('#refresh').click(function(){
                table.mytable.reload();
            });
        },
        deleteOper:function(){
            $('#remove').click(function(){
                var dataArray = table.mytable.checkRowDataArray;
                if(!dataArray.length) {
                    horizon.notice.error(horizon.lang['homepage']['selectInstance']);
                    return;
                }else {
                    var  workids = [];
                    var hasActivity = false;
                    var confirmMsg;
                    for(var i=0;i<dataArray.length;i++){
                        var _id = dataArray[i].id;
                        var _status = dataArray[i].status;
                        workids.push(_id);
                        if(!hasActivity){
                            if(_status==horizon.lang['homepage']['active'])
                                hasActivity = true;
                        }
                    }
                    if(hasActivity){
                        confirmMsg = horizon.lang['homepage']['deleteActiveConfirm'];
                    }else{
                        confirmMsg = horizon.lang['homepage']['deleteConfirm'];
                    }
                    $('#deleteDialog').dialog({
                        closeText:horizon.lang['base']['cancel'],
                        title:horizon.lang['message']['title'],
                        dialogText:confirmMsg,
                        dialogTextType:'alert-danger',
                        buttons: [
                            {
                                html: horizon.lang['base']['ok'],
                                'class' : 'btn btn-primary btn-xs',
                                click: function() {
                                    operate.deleteWork(workids.join(';'));
                                    $( this ).dialog( "close" );
                                }
                            }
                        ]
                    });
                }
            });
        },
        deleteWork:function(ids){
            table.mytable.showProcessing();
            $.ajax({
                url : urls.removeInstance,
                data : {ids: ids},
                dataType:'json',
                cache : false,
                error : function(){
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success : function(data) {
                    table.mytable.hideProcessing();
                    if(data) {
                        horizon.notice.success(horizon.lang['message']['deleteSuccess']);
                        table.mytable.reload();
                    }else{
                        horizon.notice.error(horizon.lang['message']['deleteFail']);
                    }
                }
            });
        }
    };

    //历史监控
    var hisMonitor = {
        //初始化历史监控数据
        initEchartsHis: function (hisChart) {
            yearHis = new Date().toJSON().substring(0, 4);
            currentYearHis = yearHis;
            //配置项基本信息
            var optionHis = {
                baseOption: {
                    tooltip: {},
                    toolbox: {
                        show: true,
                        itemSize: 20,
                        feature: {
                            myPrev: {
                                show: true,
                                title: horizon.lang.homepage['prevYear'],
                                icon: 'image://' + horizon.paths.assetspath + '/manager/homepage/img/next.bmp',
                                onclick: function () {
                                    yearHis--;
                                    hisMonitor.ajaxHisData(yearHis, hisChart);
                                }
                            },
                            myNext: {
                                show: true,
                                title: horizon.lang.homepage['nextYear'],
                                icon: 'image://' + horizon.paths.assetspath + '/manager/homepage/img/prev.bmp',
                                onclick: function () {
                                    yearHis++;
                                    hisMonitor.ajaxHisData(yearHis, hisChart);
                                }
                            }
                        },
                        right: '10%'
                    },
                    xAxis: {
                        splitLine: {
                            show: false
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#CCCCCC'
                            }
                        },
                        axisLabel: {
                            textStyle: {
                                color: '#000000'
                            }
                        },
                        data: []
                    },
                    yAxis: {
                        splitLine: {
                            show: true,
                            lineStyle: {
                                color: ['#f3f5f9'],
                                type: 'solid'
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#CCCCCC'
                            }
                        },
                        axisLabel: {
                            textStyle: {
                                color: '#000000'
                            }
                        }
                    },
                    series: [
                        {
                            name: horizon.lang.homepage['activeNumInMemory'],
                            type: 'bar',
                            itemStyle: {
                                normal: {
                                    color: '#8FC6EA'
                                }
                            },
                            data: []
                        },
                        {
                            name: horizon.lang.homepage['licenseNum'],
                            type: 'bar',
                            itemStyle: {
                                normal: {
                                    color: '#d87c7c'
                                }
                            },
                            data: []
                        },
                        {
                            name: horizon.lang.homepage['instanceTotalInMemory'],
                            type: 'bar',
                            itemStyle: {
                                normal: {
                                    color: '#ABD4A5'
                                }
                            },
                            data: []
                        }
                    ]
                },
                media: [
                    {
                        query: {
                            maxHeight: 200
                        },
                        option: {
                            grid: {
                                left: '4%',
                                right: '3%',
                                top: '2%',
                                bottom: '15%'
                            },
                            title: {
                                text: ''
                            },
                            legend: {
                                data: []
                            }
                        }
                    },
                    {
                        query: {
                            maxWidth: 400
                        },
                        option: {
                            grid: {
                                left: '4%',
                                right: '3%',
                                top: '2%',
                                bottom: '20%'
                            },
                            title: {
                                text: ''
                            },
                            legend: {
                                data: []
                            }
                        }
                    },
                    {
                        query: {
                            maxWidth: 1240
                        },
                        option: {
                            grid: {
                                left: '4%',
                                right: '3%',
                                top: '15%',
                                bottom: '12%'
                            }
                        }
                    },
                    {
                        option: {
                            grid: {
                                left: '4%',
                                right: '2%',
                                top: '15%',
                                bottom: '12%'
                            },
                            title: {
                                x: 'center',
                                top: 5
                            },
                            legend: {
                                data: [horizon.lang.homepage['activeNumInMemory'],
                                    horizon.lang.homepage['licenseNum'],
                                    horizon.lang.homepage['instanceTotalInMemory']],
                                x: 'left'
                            }
                        }
                    }
                ]
            };
            hisChart.showLoading();
            //显示图表
            if (optionHis && typeof optionHis === 'object') {
                hisChart.setOption(optionHis);
            }
        },
        ajaxHisData: function (year, hisChart) {
            $.ajax({
                url: urls.history,
                dataType: 'json',
                data: {
                    year: year
                },
                cache: false,
                error: function () {
                    operatorError();
                    hisChart.hideLoading();
                },
                success: function (data) {
                    if (data) {
                        yearHis = data.date;
                        currentYearHis = data.date;
                        var licenseCount = 0;
                        for (var i = 0, len = data.license.length; i < len; i++) {
                            if (data.license[i] && data.license[i] != '') {
                                licenseCount++;
                            }
                        }
                        var typeChar = 'line';
                        if (licenseCount == 1) {
                            typeChar = 'bar';
                        }
                        hisChart.hideLoading();
                        hisChart.setOption({
                            title: {
                                text: data.date + horizon.lang.homepage['yearHistoryMonitor']
                            },
                            xAxis: {
                                data: horizon.lang.homepage.months
                            },
                            series: [
                                {
                                    name: horizon.lang.homepage['activeNumInMemory'],
                                    type: 'bar',
                                    data: data.active
                                },
                                {
                                    name: horizon.lang.homepage['licenseNum'],
                                    type: typeChar,
                                    data: data.license
                                },
                                {
                                    name: horizon.lang.homepage['instanceTotalInMemory'],
                                    type: 'bar',
                                    data: data.totle
                                }
                            ]
                        });
                    } else {
                        var errorGritter = function () {
                            horizon.notice.error(yearHis + horizon.lang.homepage['noData']);
                            yearHis = currentYearHis;
                        };
                        if ($('.gritter-item-wrapper').length) {
                            errorGritter();
                        } else {
                            errorGritter();
                        }
                        hisChart.hideLoading();
                    }
                }
            });
        }
    };
    //实时监控
    var timeMonitor = {
        initEchartsTime: function(timeChart) {
            //实时监控配置项
            optionTime = {
                baseOption: {
                	tooltip: {},
                    xAxis: {
                        type: 'category',
                        splitLine:{
                            show:false
                        },
                        axisLine:{
                            lineStyle:{
                                color:'#CCCCCC'
                            }
                        },
                        axisLabel:{
                            textStyle:{
                                color:'#000000'
                            }
                        },
                        boundaryGap: false,
                        data: dateTime
                    },
                    yAxis: {
                        boundaryGap: [0, '50%'],
                        type: 'value',
                        splitLine:{
                            show:true,
                            lineStyle: {
                                color: ['#f3f5f9'],
                                type:'solid'
                            }
                        },
                        axisLine:{
                            lineStyle:{
                                color:'#CCCCCC'
                            }
                        },
                        axisLabel:{
                            textStyle:{
                                color:'#000000'
                            }
                        }
                    },
                    legend:{
                    	data:[horizon.lang.homepage['licenseNum'],horizon.lang.homepage['instanceTotalInMemory'],horizon.lang.homepage['activeNumInMemory']]
                    },
                    series: [
                        {
                            name: horizon.lang.homepage['licenseNum'],
                            type: 'line',
                            data: licenseData
                        },
                        {
                            name: horizon.lang.homepage['instanceTotalInMemory'],
                            type: 'line',
                            areaStyle: {
                                normal: {
                                    color: '#8FC6EA'
                                }
                            },
                            smooth: true,
                            data: totleData
                        },
                        {
                            name: horizon.lang.homepage['activeNumInMemory'],
                            type: 'line',
                            areaStyle: {
                                normal: {
                                    color: '#EA8D8D'
                                }
                            },
                            smooth: true,
                            data: activeData
                        }
                    ]
                },
              media:[
                    {
                        query: {
                            maxHeight:200
                        },
                        option: {
                            grid:{
                                left: '4%',
                                right: '3%',
                                top: '2%',
                                bottom: '15%'
                            },
                            legend: {
                                data: []
                            }
                        }
                    },
                    {
                        query: {
                            maxWidth:400
                        },
                        option: {
                            grid:{
                                left: '10%',
                                right: '5%',
                                top: '2%',
                                bottom: '20%'
                            },
                            legend: {
                                data: []
                            }
                        }
                    },
                    {
                        option: {
                            grid:{
                                left: '4%',
                                right: '2%',
                                top: '10%',
                                bottom: '10%'
                            },
                            legend: {
                                data: [horizon.lang.homepage['licenseNum'],
                                    horizon.lang.homepage['activeNumInMemory'],
                                    horizon.lang.homepage['instanceTotalInMemory']],
                                x: 'center'
                            }
                        }
                    }
                ]
            };
            timeChart.showLoading();
            //实时监控ajax数据
            timeMonitor.ajaxTimeData(timeChart);
            //实时刷新
            timeMonitor.setTimeInterval(timeChart);
        },
        setTimeInterval: function(timeChart) {
            timeInterval = setInterval(function () {
                //切换其他菜单时停止实时刷新
                if (!$('.homepage').length) {
                    window.clearInterval(timeInterval);
                    return;
                }
                timeMonitor.ajaxTimeData(timeChart);
                timeChart.setOption({
                    xAxis: {
                        data: dateTime
                    },
                    series: [
                        {
                            name: horizon.lang.homepage['licenseNum'],
                            data: licenseData
                        },
                        {
                            name: horizon.lang.homepage['activeNumInMemory'],
                            data: activeData
                        },
                        {
                            name: horizon.lang.homepage['instanceTotalInMemory'],
                            data: totleData
                        }
                    ]
                });
            }, 5000);
        },
        ajaxTimeData: function(timeChart) {
            $.ajax({
                url: urls.realTime,
                dataType: 'json',
                cache: false,
                error: function() {
                    operatorError();
                    window.clearInterval(timeInterval);
                },
                success: function(data) {
                    if(data) {
                    	var selected = {}; //是一个对象
                        timeChart.hideLoading();
                        var time = data.dateTime.substring(11,19);
                        dateTime.push(time);
                        activeData.push(data.active);
                        totleData.push(data.totle);
                        var licenseNum = data.license;
                        var option = timeChart.getOption();
                        if(licenseNum==2147483647){
                        	licenseData.push(data.totle+10)
                        }else{
                        	licenseData.push(data.license)
                        }
                        if(option && option.legend){
                        	 selected = option.legend[0].selected? option.legend[0].selected:{};
                        }
                        optionTime.baseOption.legend.selected = selected;
                        if(dateTime.length > 15){
                            dateTime.shift();
                            activeData.shift();
                            totleData.shift();
                            licenseData.shift();
                        }
                        if(optionTime && typeof optionTime === 'object') {
                            timeChart.setOption(optionTime, true);
                        }
                    }
                }
            });
        }
    };
    var flowStatusMonitor = {
        initFlowStatusEcharts: function(data) {
            flowStatusChart = echarts.init($flowStatus[0]);
            if(data.length == 0) {
                flowStatusChart.hideLoading();
                flowStatusChart.setOption({
                    title: {
                        text: horizon.lang.homepage['noFlow'],
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
                return;
            }
            var name = [];
            var seriesdata = [];
            var itemStyle = function(){
                var obj = {};
                obj[horizon.lang.flowstatus['normal']] = { normal:{color:'#ABD4A5'} };
                obj[horizon.lang.flowstatus['extended']] = { normal:{color:'#d87c7c'} };
                obj[horizon.lang.flowstatus['pause']] = { normal:{color:'#ABDFE5'} };
                obj[horizon.lang.flowstatus['warn']] = { normal:{color:'#F3DD99'} };
                obj[horizon.lang.flowstatus['exception']] = { normal:{color:'#aaaaaa'} };
                obj[horizon.lang.flowstatus['revoke']] = { normal:{color:'#F5D5B8'} };

                return obj;
            }();
            $.each(data, function(key,value) {
                name.push(value.name);
                value['itemStyle'] = itemStyle[value.name];
            });
            var optionFlowStatus = {
                baseOption: {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/> {b} : {c} ({d}%)"
                    },
                    series: [
                        {
                            name: horizon.lang.flowstatus['title'],
                            type: 'pie',
                            radius: ['50%', '90%'],
                            center: ['50%', '50%'],
                            avoidLabelOverlap: false,
                            data: data,
                            minAngle: 10,
                            label: {
                                normal: {
                                    show: false,
                                    position: 'center',
                                    formatter: '{b} \n {d}%'
                                },
                                emphasis: {
                                    show: true,
                                    textStyle: {
                                        fontSize: '25'
                                    }
                                }
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                },
                media:[
                    {
                        query: {
                            maxWidth: 350
                        },
                        option: {
                            legend: {
                                data: ''
                            }
                        }
                    },
                    {
                        option: {
                            legend: {
                                orient: 'vertical',
                                left: 'left',
                                data: name
                            }
                        }
                    }
                ]
            };
            if (optionFlowStatus && typeof optionFlowStatus === 'object') {
                flowStatusChart.setOption(optionFlowStatus, true);
            }
            flowStatusChart.on(horizon.tools.clickEvent(), function(param) {
                $('body').data('flowStatus', param.name);
                var redirection = ($('[href="#page/instance.monitor"]').length ? '#page' : '#flow') + '/instance.monitor';
                window.location.hash = redirection;
            });
        },
        ajaxFlowStatusData: function() {
            $.ajax({
                url: urls.flowStatus,
                dataType: 'json',
                cache: false,
                error: function() {
                    operatorError();
                },
                success: function(data) {
                    flowStatusMonitor.initFlowStatusEcharts(data);
                }
            });
        }
    };

    var memoryMonitorInit = {
        init: function() {
            $instanceMonitor = $("#instance-monitoring");
            $exceptionMonitor = $('#exception-monitor-chart');
            $flowStatus = $('#flow-status-chart');
            timeChart = null;
            hisChart = null;

            //实例监控
            $instanceMonitor.css({
                'width': '100%',
                'height':  containerSize.picHeight()
            });
            instanceMonitoring.init();

            //异常监控
            $exceptionMonitor.css({
                'width': '100%',
                'height':  containerSize.picHeight()
            });
            exceptionMonitor.ajaxExceptionMonitorData();

            //初始化流程状态图
            $flowStatus.css({
                'width': '100%',
                'height': containerSize.picHeight()+4.5
            });
            flowStatusMonitor.ajaxFlowStatusData();

            //初始化实时监控
            $('#realtime').on(horizon.tools.clickEvent(), function() {
                $time = $('#time-charts');
                $('#history-charts').css('visibility', 'hidden');
                $('#time-charts').removeClass().css('visibility', 'visible');
                $('#rt_his').removeClass().attr("class","btn btn-white btn-sm btn-round border-width-1");
                $('#realtime').removeClass().attr("class","btn btn-primary btn-sm btn-round border-width-1");
                $time.css({
                    'width': containerSize.width(),
                    'height': containerSize.picHeight()
                });
                if(timeChart == null) {
                    timeChart = echarts.init($time[0]);
                }
                timeMonitor.initEchartsTime(timeChart);
                timeChart.resize();
                $('#history-charts').addClass('hidden')
            }).trigger(horizon.tools.clickEvent());

            // 历史监控
            $('#rt_his').on(horizon.tools.clickEvent(), function() {
                $history = $('#history-charts');
                $('#time-charts').css('visibility', 'hidden');
                $('#history-charts').removeClass().css('visibility', 'visible');
                $('#realtime').removeClass().attr("class","btn btn-white btn-sm btn-round border-width-1");
                $('#rt_his').removeClass().attr("class","btn btn-primary btn-sm btn-round border-width-1");
                $history.css({
                    'width': containerSize.width(),
                    'height': containerSize.picHeight()
                });
                if(hisChart == null) {
                    hisChart = echarts.init($('#history-charts')[0]);
                }
                hisMonitor.initEchartsHis(hisChart);
                hisChart.resize();
                window.clearInterval(timeInterval);
                //图表ajax数据
                hisMonitor.ajaxHisData(new Date().toJSON().substring(0, 4), hisChart);
                $('#time-charts').addClass('hidden');
            });
            var browser = horizon.tools.browser();
            if(browser.browser == 'IE' && browser.version <= 8.0) {
                window.attachEvent('onresize', function() {
                    memoryMonitorInit.resize();
                });
            }else{
                window.addEventListener('resize', function() {
                    memoryMonitorInit.resize();
                });
            }
            $('.sidebar-collapse').on(horizon.tools.clickEvent() + '.ace.menu', function(e){
                setTimeout(function(){
                    memoryMonitorInit.resize();
                },100);
            });
        },
        resize: function() {
            if($('body').hasClass('embed') && $(window).width() < 768) {
                $('.hid-left').removeClass('hidden');
                $('.hid-right').addClass('hidden');
            }else if($('body').hasClass('embed') && $(window).width() >= 768){
                $('.hid-right').removeClass('hidden');
                $('.hid-left').addClass('hidden');
            }
            if(instanceMonitorChart != null){
                $instanceMonitor.css({
                    'width': '100%',
                    'height':  containerSize.picHeight()
                });
                instanceMonitorChart.resize();
            }
            if(exceptionMonitorChart != null){
                $exceptionMonitor.css({
                    'width': '100%',
                    'height':  containerSize.picHeight()
                });
                exceptionMonitorChart.resize();
            }
            if(flowStatusChart != null) {
                $flowStatus.css({
                    'width': '100%',
                    'height': containerSize.picHeight()+4.5
                });
                flowStatusChart.resize();
            }
            if(hisChart != null) {
                $history.css({
                    'width': '100%',
                    'height': containerSize.picHeight()
                });
                hisChart.resize();
            }
            $time.css({
                'width': '100%',
                'height': containerSize.picHeight()
            });
            timeChart.resize();
        }
    };

    return horizon.engine['home'] = {
        init: function(){
            countList.init();
            memoryMonitorInit.init();
            table.init();
            operate.refreshOper();
            operate.deleteOper();
        }
    };
}));