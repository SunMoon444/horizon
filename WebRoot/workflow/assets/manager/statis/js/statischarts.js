/**
 *实例统计，生成折线图表的方法
 *
 * @author zhuql
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        var scripts = ['jquery', 'echarts', 'gritter'];
        define(scripts, factory);
    } else {
        factory(jQuery);
    }
}(function($, echarts) {
    "use strict";

    var colors= ['#ABD4A5', '#F3DD99', '#FF6666','#ABDFE5', '#A0D1EA', '#EC9F9D', '#ca8622', '#bda29a',
        '#ff7f50', '#87cefa', '#da70d6', '#32cd32', '#6495ed',
        '#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0',
        '#1e90ff', '#ff6347', '#7b68ee', '#00fa9a', '#ffd700',
        '#6b8e23', '#ff00ff', '#3cb371', '#b8860b', '#30e0e0'];
    var itemStyle = {
        normal: {
            color: function(params) {
                colors[params.dataIndex%(colors.length - 1)];
            }
        }
    };
    function resizeCallBack(myChart,settings){
        var $sele= $(settings.selector);
        $(window).off('resize').on('resize',function(){
            if(myChart != null&&$sele) {
                $sele.css({
                    'width': '100%',
                    'height': settings.height(),
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
        
        //右侧流程树隐藏和展开时图表重画
        $('.modal-dialog').off(horizon.tools.clickEvent() + '.fa-unlock').on(horizon.tools.clickEvent() + '.fa-unlock', function(e){
            setTimeout(function(){
                myChart.resize();
            },100);
        });
        $('.modal-dialog').off(horizon.tools.clickEvent() + '.fa-lock').on(horizon.tools.clickEvent() + '.fa-lock', function(e){
            setTimeout(function(){
                myChart.resize();
            },100);
        });
    }

    var ajax ={
        getData:function(settings,callback,myChart){
            $(settings.selector).css({
                'width': '100%',
                'height': settings.height(),
                'min-height':'500px'
            });
            if(!myChart){
                myChart = echarts.init($(settings.selector)[0]);
            }
            myChart.resize();
            myChart.showLoading();
            ajax.ajaxChart(settings,myChart,callback);
            return myChart;
        },
        ajaxChart:function(settings,myChart,callback){
            $.ajax({
                type:'post',
                url:settings.url,
                dataType:'json',
                data:settings.ajaxDateParam,
                cache: false,
                error: function() {
                    myChart.hideLoading();
                    horizon.notice.error(horizon.lang.message['operateError']);
                },
                success:function(data){
                    myChart.clear();
                    myChart.hideLoading();
                    if(data.data&&data.data.length!=0){
                        //对结果进行处理
                        if(settings.formatData){
                            settings.data = settings.formatData(data.data);
                        }else{
                            settings.data=data.data;
                        }
                        callback(settings,myChart)
                    }else{
                    	myChart.setOption({
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
                         /*myChart.showLoading('default',{
                         text: '暂无数据',
                         color: '#ffffff',
                         textColor: '#ff892a',
                         zlevel: 0
                         });*/
                        /*if($('.gritter-item-wrapper').length > 0){
                             horizon.notice.error(horizon.lang['statis-common']['nodata']);
                        }else{
                        	horizon.notice.error(horizon.lang['statis-common']['nodata']);
                        }
                        var browser = horizon.tools.browser();
                        if(browser.browser == 'IE' && browser.version == '8.0') {
                            setTimeout(function() {
                                var $container = $(myChart.getDom());
                                var $shape = $container.children().children().children().last().css('z-index',1000);
                            },1000);
                        }*/
                    }
                }
            });
        }
    };

    //折现图表
    var chart={
        init:function(settings,myChart){
            return  ajax.getData(settings,chart.getEChart,myChart);
        },
        getEChart:function(settings,myChart){
            var legend =[];
            var xaxis=[];
            var series =[];

            //处理数据
            //获得所有的标签名称
            for(var i=0;i<settings.data.length;i++){
                var item = settings.data[i];
                //1.legend
                legend.push(item[settings.nameField]);
                var obj={name:item[settings.nameField],type:'line'};
                var seriesdata =[];
                for(var xaxisitem in settings.xaxis){
                    seriesdata.push(item[settings.xaxis[xaxisitem].name]);
                }
                obj.data=seriesdata;
                series.push(obj);
            }
            //xaxis
            for(var item in settings.xaxis){
                xaxis.push(settings.xaxis[item].text);
            }

            //init chart
            var option =  {
                color:colors,
                grid:{
                    left: '5%',
                    right: '5%',
                    top: '15%',
                    bottom: '15%'
                },
                tooltip : {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'none'
                    }
                },
                legend: {
                    data:legend
                },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data : xaxis,
                        axisLabel:{
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
                    }
                ],
                yAxis : [
                    {
                        type : 'value'
                    }
                ],
                series :series
            };
            // 为echarts对象加载数据

            myChart.setOption(option);
            //绑定点击事件
            if(settings.plotclick){
                myChart.off(horizon.tools.clickEvent());
                myChart.on(horizon.tools.clickEvent(),function(select){
                    var seriesIndex = select.seriesIndex;
                    var dataIndex = select.dataIndex;
                    var xalxs= settings.xaxis[dataIndex+1];
                    var tag= settings.data[seriesIndex];
                    settings.plotclick(tag,xalxs,dataIndex+1);
                });
            }

            resizeCallBack(myChart,settings);

        }
    };

    //柱状图表
    var bar={
        init:function(settings,myChart){
            return  ajax.getData(settings,bar.getEChart,myChart);
        },
        getEChart:function(settings,myChart){
            var legend =[];
            var xaxis=[];
            var series =[];
            //处理数据
            //获得所有的标签名称
            for(var i=0;i<settings.data.length;i++){
                var item = settings.data[i];
                //1.legend
                xaxis.push(item[settings.nameField]);

            }
            //xaxis
            for(var key in settings.xaxis){
                var xaxisitem = settings.xaxis[key];
                legend.push(xaxisitem.text);

                var obj={name:xaxisitem.text,type:'bar',barMaxWidth:50};
                if(xaxisitem.itemStyle){
                    obj.itemStyle=xaxisitem.itemStyle;
                }


                var seriesdata =[];
                for(var i=0;i<settings.data.length;i++){
                    var item = settings.data[i];
                    seriesdata.push(item[xaxisitem.name]);
                }
                obj.data=seriesdata;
                series.push(obj);
            }
            //init chart
            var option =  {
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
                    data:legend
                },
                calculable: true,
                xAxis:
                {
                    type: 'category',
                    data:xaxis,
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
                }
                ,
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series :series
            };
            myChart.hideLoading();
            // 为echarts对象加载数据
            myChart.clear();
            myChart.setOption(option);
            //绑定点击事件
            if(settings.plotclick){
                myChart.off(horizon.tools.clickEvent());
                myChart.on(horizon.tools.clickEvent(),function(select){
                    var seriesIndex = select.seriesIndex;
                    var dataIndex = select.dataIndex;
                    settings.plotclick(settings.data[dataIndex],settings.xaxis[seriesIndex+1],seriesIndex+1);
                });

            }
            resizeCallBack(myChart,settings);
        }
    };

    //层叠推挤表
    var stacked = {
        init:function(settings, myChart){
            return ajax.getData(settings, stacked.getEChart, myChart);
        },
        getEChart:function(settings, myChart){
            var legend =[];
            var xaxis=[];
            var series =[];
            var itemStyle =function(){
                var obj = {};
                obj[ horizon.lang['flowstatus']['normal']]={
                    normal:{color:'#ABD4A5'}
                };
                obj[ horizon.lang['flowstatus']['extended']]={
                    normal:{color:'#d87c7c'}
                };
                obj[ horizon.lang['flowstatus']['pause']]={
                    normal:{color:'#ABDFE5'}
                };
                obj[ horizon.lang['flowstatus']['warn']]={
                    normal:{color:'#F3DD99'}
                };
                obj[ horizon.lang['flowstatus']['exception']]={
                    normal:{color:'#aaaaaa'}
                };
                obj[ horizon.lang['flowstatus']['revoke']]={
                    normal:{color:'#F5D5B8'}
                };
                return obj;
            }()
            //处理数据
            //获取legend
            //获得所有的标签名称
            for(var item in settings.xaxis){
                var legendText = settings.xaxis[item].text;
                var nameText = settings.xaxis[item].name;
                legend.push(legendText);
                var obj = {
                    name: legendText,
                    type: 'bar',
                    stack: '1',
                    barMaxWidth:50,
                    itemStyle : itemStyle[legendText]
                };
                var data = [];
                for(var i = 0,len = settings.data.length; i < len; i++){
                    var item = settings.data[i];
                    data.push(item[nameText]);
                }
                obj.data = data;
                series.push(obj);
            }
            $.each(settings.data, function(i, item) {
                xaxis.push(item[settings.nameField]);
            });
            var option = {
                grid:{
                    left: '5%',
                    right: '5%',
                    top: '15%',
                    bottom: '15%'
                },
                tooltip : {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'none'        // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                legend: {
                    data:legend
                },
                calculable : true,
                xAxis:
                {
                    type: 'category',
                    data: xaxis,
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
                }
                ,
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: series
            };
            // 为echarts对象加载数据
            myChart.setOption(option);
            //绑定点击事件
            if(settings.plotclick){
                myChart.off(horizon.tools.clickEvent());
                myChart.on(horizon.tools.clickEvent(), function(select) {
                    var seriesIndex = select.seriesIndex;
                    var dataIndex = select.dataIndex;
                    var xalxs = settings.xaxis[seriesIndex + 1];
                    var tag= settings.data[dataIndex];
                    settings.plotclick(tag, xalxs);
                });
            }
            resizeCallBack(myChart, settings);
        }

    };

    return horizon.engine['statisplotline'] = {
        getChart: chart.init,
        getBarChart: bar.init,
        getStackedChart: stacked.init
    };
}));
