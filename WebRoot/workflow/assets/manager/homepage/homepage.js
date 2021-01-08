/**
 * 内存监控图相关功能
 *
 * @since 2016-07-24
 * @author yaodd
 */
(function(factory) {
    if(typeof define === 'function' && define.amd) {
        var scripts = ['jquery', 'echarts', 'gritter'];
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

    var $flowStatus = $('#flow-status-chart');
    var $todoread = $('#todoread-monitor-chart');
    var $time = $('#time-charts');
    var $history = $('#history-charts');

    var flowStatusChart = null;
    var timeChart = null;
    var hisChart = null;
    var todoreadChart = null;

    var operatorError = function() {
    	horizon.notice.error(horizon.lang['message']['operateError']);
    };

    //容器的大小
    var containerSize = {
        height: function() {
            var _height = horizon.tools.getPageContentHeight();
            _height = _height - $('.flow-status-pic').outerHeight(true) - $('.widget-header-ram').outerHeight(true);
            if($(window).width() < 768) {
                _height = _height/3 - parseInt($('.page-content').css('paddingTop'))
            }else{
                _height = _height/2 - parseInt($('.page-content').css('paddingTop'))
            }
            return _height;
        },
        width: function() {
            return $('.page-content-area').outerWidth(true);
        },
        picHeight: function() {
            var _height = containerSize.height();
            _height -= $('.widget-header-flow').outerHeight(true);
            return _height;
        }
    };
    //历史监控
    var hisMonitor = {
        //初始化历史监控数据
        initEchartsHis: function(hisChart) {
            yearHis = new Date().toJSON().substring(0,4);
            currentYearHis = yearHis;
            //配置项基本信息
            var optionHis = {
                baseOption: {
                    tooltip: {},
                    toolbox: {
                        itemSize: 18,
                        feature: {
                            myPrev: {
                                show: true,
                                title: horizon.lang.homepage['prevYear'],
                                icon: 'image://' + horizon.paths.assetspath + '/manager/homepage/img/next.bmp',
                                onclick: function() {
                                    yearHis--;
                                    hisMonitor.ajaxHisData(yearHis,hisChart);
                                }
                            },
                            myNext: {
                                show: true,
                                title: horizon.lang.homepage['nextYear'],
                                icon: 'image://' + horizon.paths.assetspath + '/manager/homepage/img/prev.bmp',
                                onclick: function() {
                                    yearHis++;
                                    hisMonitor.ajaxHisData(yearHis,hisChart);
                                }
                            }
                        },
                        right: '10%'
                    },
                    xAxis: {
                        data: []
                    },
                    yAxis: {},
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
                            grid:{
                                left: '4%',
                                right: '3%',
                                top: '2%',
                                bottom: '15%'
                            },
                            title: {
                                text:''
                            },
                            legend: {
                                data:[]
                            }
                        }
                    },
                    {
                        query: {
                            maxWidth: 400
                        },
                        option: {
                            grid:{
                                left: '4%',
                                right: '3%',
                                top: '2%',
                                bottom: '20%'
                            },
                            title: {
                                text:''
                            },
                            legend: {
                                data:[]
                            }
                        }
                    },
                    {
                        query: {
                            maxWidth: 1240
                        },
                        option: {
                            grid:{
                                left: '4%',
                                right: '3%',
                                top: '15%',
                                bottom: '12%'
                            }
                        }
                    },
                    {
                        option: {
                            grid:{
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
                                data:[horizon.lang.homepage['activeNumInMemory'],
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
                hisChart.setOption(optionHis, true);
            }
        },
        ajaxHisData: function(year,hisChart) {
            $.ajax({
                url: horizon.tools.formatUrl('/monitor/memory/history'),
                dataType: 'json',
                data: {
                    year:year
                },
                cache: false,
                error: function() {
                    operatorError();
                    hisChart.hideLoading();
                },
                success: function(data) {
                    if(data) {
                        yearHis = data.date;
                        currentYearHis = data.date;
                        var licenseCount = 0;
                        for(var i = 0,len = data.license.length; i < len; i++) {
                            if(data.license[i] && data.license[i] != '') {
                                licenseCount++;
                            }
                        }
                        var typeChar = 'line';
                        if(licenseCount == 1) {
                            typeChar ='bar';
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
                    }else{
                        var errorGritter = function() {
                        	horizon.notice.error(yearHis + horizon.lang.homepage['noData']);
                            yearHis = currentYearHis;
                        };
                        if($('.gritter-item-wrapper').length) {
                            errorGritter();
                        }else {
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
                        boundaryGap: false,
                        data: dateTime
                    },
                    yAxis: {
                        boundaryGap: [0, '50%'],
                        type: 'value'
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
                                left: '3%',
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
                                left: '2%',
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
                url: horizon.tools.formatUrl('/monitor/memory/realtime'),
                dataType: 'json',
                cache: false,
                error: function() {
                    operatorError();
                    window.clearInterval(timeInterval);
                },
                success: function(data) {
                    if(data) {
                        timeChart.hideLoading();
                        var time = data.dateTime.substring(11,19);
                        dateTime.push(time);
                        activeData.push(data.active);
                        totleData.push(data.totle);
                        licenseData.push(data.license);
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
                flowStatusChart.showLoading('default',{
                    text: horizon.lang.homepage['noFlow'],
                    color: '#ffffff',
                    textColor: '#ff892a',
                    zlevel: 0
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
                            radius: ['50%', '92%'],
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
                url: horizon.tools.formatUrl('/monitor/flowstatus'),
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
    var todoreadMonitor = {
        initTodoreadEcharts: function(todoreadChart) {
            var optionTodoread = {
                baseOption: {
                    tooltip: {},
                    xAxis: {
                        data:[]
                    },
                    yAxis: {},
                    series: [
                        {
                            name: horizon.lang.homepage['todo'],
                            type: 'bar',
                            itemStyle: {
                                normal: {
                                    color: '#83C1EA'
                                }
                            },
                            data: []
                        },
                        {
                            name: horizon.lang.homepage['toread'],
                            type: 'bar',
                            itemStyle: {
                                normal: {
                                    color: '#CDC7DE'
                                }
                            },
                            data: []
                        }
                    ]
                },
                media: [
                    {
                        query: {
                            maxHeight: 160
                        },
                        option: {
                            grid:{
                                left: '10%',
                                right: '2%',
                                top: '2%',
                                bottom: '15%'
                            },
                            legend: {
                                data:[]
                            }
                        }
                    },
                    {
                        option: {
                            grid:{
                                left: '10%',
                                right: '2%',
                                top: '13%',
                                bottom: '15%'
                            },
                            legend: {
                                data:[horizon.lang.homepage['todo'],
                                    horizon.lang.homepage['toread']]
                            }
                        }
                    }
                ]
            };
            todoreadChart.showLoading();
            //显示图表
            if (optionTodoread && typeof optionTodoread === 'object') {
                todoreadChart.setOption(optionTodoread, true);
            }
            //图表ajax数据
            todoreadMonitor.ajaxTodoreadData(todoreadChart);
        },
        ajaxTodoreadData: function(todoreadChart) {
            $.ajax({
                url: horizon.tools.formatUrl('/monitor/todoread'),
                dataType: 'json',
                cache:false,
                error: function() {
                    operatorError();
                },
                success: function(data) {
                    if(data) {
                        todoreadChart.hideLoading();
                        todoreadChart.setOption({
                            xAxis: {
                                data:data.sendDay
                            },
                            series: [
                                {
                                    name: horizon.lang.homepage['todo'],
                                    data: data.todoNum
                                },
                                {
                                    name: horizon.lang.homepage['toread'],
                                    data: data.readNum
                                }
                            ]
                        });
                    }else{
                        operatorError();
                    }
                }
            });
        }
    };
    var memoryMonitorInit = {
        init: function() {
            $flowStatus = $('#flow-status-chart');
            $todoread = $('#todoread-monitor-chart');
            timeChart = null;
            hisChart = null;
            //初始化流程状态图
            $flowStatus.css({
                'width': '100%',
                'height': containerSize.picHeight()
            });
            flowStatusMonitor.ajaxFlowStatusData();
            //初始化代办监控图
            $todoread.css({
                'width': '100%',
                'height': containerSize.picHeight()
            });
            todoreadChart = echarts.init($todoread[0]);
            todoreadMonitor.initTodoreadEcharts(todoreadChart);
            //初始化实时监控
            $('#realtime').on(horizon.tools.clickEvent(), function() {
                $('.chart-icon').removeClass('fa fa-bar-chart-o').addClass('fa fa-area-chart');
                $time = $('#time-charts');
                $time.css({
                    'width': containerSize.width(),
                    'height': containerSize.height()
                });
                if(timeChart == null) {
                    timeChart = echarts.init($time[0]);
                }
                timeMonitor.initEchartsTime(timeChart);
                timeChart.resize();
            }).trigger(horizon.tools.clickEvent());
            // 历史监控
            $('#rt_his').on(horizon.tools.clickEvent(), function() {
                $('.chart-icon').removeClass('fa fa-area-chart').addClass('fa fa-bar-chart-o');
                $history = $('#history-charts');
                $history.css({
                    'width': containerSize.width(),
                    'height': containerSize.height()
                });
                if(hisChart == null) {
                    hisChart = echarts.init($('#history-charts')[0]);
                }
                hisMonitor.initEchartsHis(hisChart);
                hisChart.resize();
                window.clearInterval(timeInterval);
                //图表ajax数据
                hisMonitor.ajaxHisData('', hisChart);
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
            if(flowStatusChart != null) {
                $flowStatus.css({
                    'width': '100%',
                    'height': containerSize.picHeight()
                });
                flowStatusChart.resize();
            }
            $todoread.css({
                'width': '100%',
                'height': containerSize.picHeight()
            });
            todoreadChart.resize();
            if(hisChart != null) {
                $history.css({
                    'width': '100%',
                    'height': containerSize.height()
                });
                hisChart.resize();
            }
            $time.css({
                'width': '100%',
                'height': containerSize.height()
            });
            timeChart.resize();
        }
    };
    return horizon.engine['homepage'] = {
        init: memoryMonitorInit.init
    };
}));