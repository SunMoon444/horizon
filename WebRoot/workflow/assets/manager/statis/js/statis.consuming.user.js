/**
 * 人员耗时统计
 *
 * @author chengll 2017年01月03
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        var scripts = ['jquery','echarts','moment','horizonTable','bootstrapDatetimepicker','horizonSelectuser','gritter','daterangepicker' ];//当前模块的依赖
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
            _height = _height - $('.flow-status-pic').outerHeight(true) - $('#statis-consuming-user-searcher .widget-box').outerHeight(true);
            return _height;
        },
        width: function() {
            return $('.page-content-area').outerWidth(true);
        },
        picHeight: function() {
            return containerSize.height();
        }
    };

    //为选择流程绑定事件
    function bindUserInput(){
        $('#usernames_user').bind(horizon.tools.clickEvent(),function() {
            $.horizon.selectUser({
                idField: 'userids_user',
                cnField: 'usernames_user',
                multiple: true,
                selectDept: false,
                selectPosition: false,
                selectGroup: false
            });
        });

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
        $('#statis-consuming-user-searcher .dropdown-menu li').bind(horizon.tools.clickEvent(),function(){
            $("#statis-consuming-user-searcher .dropdown-menu li").removeClass('active');
            $(this).addClass('active');
            $('#statis-consuming-user-searcher .widget-title').html($(this).children('a').html());
            init();
        });
    }

    //绑定搜索和重置按钮
    function bindSearchButton(){
        $("#statis-consuming-user-searcher .btn-submit").bind(horizon.tools.clickEvent(),function(){
            init();
        });
    }


    function init(mark){
        statisUserContainer.init(mark);
    }
    function loginUser(){
        $.ajax({
            url: statisUserContainer.urls.loginUser,
            cache: false,
            dataType: 'json',
            success: function(data) {
                if(data){
                	$('input[name="usernames_user"]').val(data.userName);
                	$('input[name="userids_user"]').val(data.id);
                }
            },
            error: function() {
            	horizon.notice.error(horizon.lang['message']['operateError']);
            }
        });
    }
    function containerinit(container,mark){
        //1.判断是否是图形展现
        var type = $("#statis-consuming-user-searcher .dropdown-menu li[class='active']").data('value');
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
        $("#statis-consuming-user-searcher form").validate({
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
            messages:{auto_endtime:horizon.lang['statis-common']['timeInitAutoValidate']}
        });
    }

    var option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            x: 'right',
            data:[]
        },
        xAxis: [
            {
                type: 'category',
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
                },
                data: []
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: horizon.lang.consuming['userConsuming'],
                scale: true,
                min: 0,
                boundaryGap: [0.2, 0.2]
            },
            {
                type: 'value',
                name: horizon.lang.consuming['userRatio'],
                scale: true,
                min: 0,
                max: 100,
                interval: 10,
                boundaryGap: [0.2, 0.2],
                axisLabel: {
                    formatter: '{value} %'
                }
            }
        ],
        series: []
    } ;
    //填充数据
    function dataSet(xaxis,data,legendData,seriesData){
        for(var key in xaxis){
            var xaxisitem = xaxis[key];
            legendData.push(xaxisitem.text);
            if(xaxisitem.doer=="1"){
                var obj={name:xaxisitem.text,type:'bar',itemStyle:xaxisitem.itemStyle,barMaxWidth:50};
            }else if(xaxisitem.doer=="2"){
                var obj={name:xaxisitem.text,type:'line',yAxisIndex: 1};
            }
            var seriesd =[];
            for(var i=0;i<data.recordsTotal;i++){
                var item = data.data[i];
                seriesd.push(item[xaxisitem.name]);
            }
            obj.data=seriesd;
            seriesData.push(obj);
        }
    }
    var statisUserContainer={
        urls:{
        	'loginUser':horizon.tools.formatUrl('/statis/consuming/loginUser'),
            'userchart' : horizon.tools.formatUrl('/statis/consuming/person/list/chart'),
            'singlechart': horizon.tools.formatUrl('/statis/consuming/bysingle/list/chart'),
            'taskchart':horizon.tools.formatUrl('/statis/consuming/task/list/chart'),
            'usertable' : horizon.tools.formatUrl('/statis/consuming/person/list/table'),
            'singletable': horizon.tools.formatUrl('/statis/consuming/bysingle/list/table')
        },
        //初始化
        init:function(mark){
            containerinit(this,mark);
        },
        //错误操作提示
        errorMsg:function(){
        	horizon.notice.error(horizon.lang.message['operateError']);
        },
        plot : {
            ajaxDateParam:function(mark){
                return {
                    "userId" : $("#userids_user").val(),// 实例统计参与者ID
                    "userName" : $("#usernames_user").val(),// 实例统计参与者名称
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
            xalias:function(){
                return {
                    1:{text:horizon.lang.consuming['userTotalConsuming'],name:'consumingCount',type:'0',itemStyle:{ normal:{color:'#6495ED'} }},
                    2:{text:horizon.lang.consuming['userSameTotalConsuming'],name:'sameConsumingCount',type:'1',itemStyle:{ normal:{color:'#ABD4A5'} }}
                }
            },
            settings:function(mark){
                return {
                    xaxis:statisUserContainer.plot.xalias(),
                    selector:'#statis-user-image-consuming',//放置图表的容器
                    height:containerSize.height,
                    plotclick:function(tag,xalxs,xalxskey){
                        var startTime=(xalxs.type=='0')?tag.startTime:tag.sameStartTime,
                            endTime=(xalxs.type=='0')?tag.endTime:tag.sameEndTime;
                        statisUserContainer.subplot.initSubChart(true,tag.userName,tag.userId,startTime,endTime);
                    },
                    nameField:'userName',//折线名称字段，在data中的字段,
                    url:statisUserContainer.urls.userchart,
                    ajaxDateParam:statisUserContainer.plot.ajaxDateParam(mark)
                };
            },
            display:function(ishidden){
                var container=$('#statis-consuming-plot-consuming-container1');
                ishidden?container.removeClass('hidden'):container.addClass('hidden');
            },
            init:function(mark){
                statisUserContainer.plot.initChart(mark);
            },
            initChart:function(mark){
                statisUserContainer.plot.myChart=horizon.engine.statisplotline.getBarChart(statisUserContainer.plot.settings(mark),statisUserContainer.plot.myChart);
            }
        },
        subplot : {
            initSubChart:function(ishidden,name,creator,startTime,endTime){
                var $flowStatus = $('#statis-consuming-plot-consuming-container2');
                ishidden?$flowStatus.removeClass('hidden'):$flowStatus.addClass('hidden');
                $flowStatus.dialog({
                    addCloseBtn: false,
                    title: name+horizon.lang.consuming['userDialogTitle'],
                    width: $(window).width() > 995?'995':'auto',
                    height: $(window).height() > 640?'640':'auto',
                    maxHeight: $(window).height(),
                    minHeight:'500'
                });
                $('#statis-user-single-consuming').css({
                    'width': '100%',
                    'height':  $('#statis-consuming-plot-consuming-container2').height()
                });
                statisUserContainer.subplot.myChart=echarts.init($('#statis-user-single-consuming')[0]);
                statisUserContainer.subplot.initBySingleEcharts(statisUserContainer.subplot.myChart,creator,startTime,endTime);
                statisUserContainer.subplot.myChart.resize();
            },
            initBySingleEcharts: function(statisUserChart1,creator,startTime,endTime) {
                var singleOption = option;
                //statisUserChart1.showLoading();
                // 为echarts对象加载数据
                if (singleOption && typeof singleOption === 'object') {
                    statisUserChart1.setOption(singleOption);
                }
                statisUserContainer.subplot.ajaxBySingleData(statisUserChart1,creator,startTime,endTime);
            },
            ajaxBySingleData: function(statisUserChart1,creator,startTime,endTime) {
                $.ajax({
                    url: statisUserContainer.urls.singlechart,
                    dataType: 'json',
                    data:{"userId":creator,
                        "autoStartTime" : startTime,// 自定义的开始时间
                        "autoEndTime" : endTime// 自定义的结束时间
                    },
                    cache: false,
                    error: function() {
                        statisUserContainer.errorMsg();
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
                                    xaxisData.push(item.flowName);
                                }
                                dataSet(xaxis(),data,legendData,seriesData);
                                statisUserChart1.hideLoading();
                                statisUserChart1.setOption({
                                    legend: { data:legendData  },
                                    xAxis: { data:xaxisData  },
                                    series: seriesData
                                });
                                //添加点击事件
                                statisUserChart1.off(horizon.tools.clickEvent());
                                statisUserChart1.on(horizon.tools.clickEvent(), function (params) {
                                    var flowid= data.data[params.dataIndex].flowId;
                                    var startTime=data.data[params.dataIndex].startTime,
                                        endTime=data.data[params.dataIndex].endTime;
                                    statisUserContainer.subplottask.initSubTaskChart(true,creator,params.name,flowid,startTime,endTime);
                                });
                                $(window).off('resize').on('resize',function(){
                                    $('#statis-user-single-consuming').css({
                                        'width': '100%',
                                        'height':  $('#statis-consuming-plot-consuming-container2').height()
                                    });
                                    statisUserChart1.resize();
                                });
                            }
                        }
                    }
                });
            }
        },
        subplottask : {
            initSubTaskChart:function(ishidden,creator,flowName,flowid,startTime,endTime){
                var $flowStatus = $('#statis-consuming-plot-consuming-container3');
                ishidden?$flowStatus.removeClass('hidden'):$flowStatus.addClass('hidden');
                $flowStatus.dialog({
                    addCloseBtn: false,
                    title: flowName+horizon.lang.consuming['userNodeConsuming'],
                    width: $(window).width() > 995?'995':'auto',
                    height: $(window).height() > 640?'640':'auto',
                    maxHeight: $(window).height(),
                    minHeight:'500'
                });
                $('#statis-user-task-consuming').css({
                    'width': '100%',
                    'height':  $('#statis-consuming-plot-consuming-container3').height()
                });
                statisUserContainer.subplottask.myChart=echarts.init($('#statis-user-task-consuming')[0]);
                statisUserContainer.subplottask.initByTaskEcharts(statisUserContainer.subplottask.myChart,creator,flowid,startTime,endTime);
                statisUserContainer.subplottask.myChart.resize();
            },
            initByTaskEcharts: function(statisUserChart2,creator,flowid,startTime,endTime) {
                var taskOption =  option;
                statisUserChart2.showLoading();
                // 为echarts对象加载数据
                if (taskOption && typeof taskOption === 'object') {
                    statisUserChart2.setOption(taskOption);
                }
                statisUserContainer.subplottask.ajaxByTaskData(statisUserChart2,creator,flowid,startTime,endTime);
            },
            ajaxByTaskData: function(statisUserChart2,creator,flowid,startTime,endTime) {
                $.ajax({
                    url: statisUserContainer.urls.taskchart,
                    dataType: 'json',
                    data:{"userId":creator,
                        "flowId":flowid,
                        "autoStartTime" : startTime,// 自定义的开始时间
                        "autoEndTime" : endTime// 自定义的结束时间
                    },
                    cache: false,
                    error: function() {
                        statisUserContainer.errorMsg();
                    },
                    success: function(data) {
                        if(data) {
                            if(data.recordsTotal==0){
                            	statisUserChart2.hideLoading();
                            	statisUserChart2.setOption({
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
                                dataSet(xaxis(),data,legendData,seriesData)
                                statisUserChart2.hideLoading();
                                statisUserChart2.setOption({
                                    legend: { data:legendData  },
                                    xAxis: { data:xaxisData  },
                                    series: seriesData
                                });
                                $(window).off('resize').on('resize',function(){
                                    $('#statis-user-task-consuming').css({
                                        'width': '100%',
                                        'height':  $('#statis-consuming-plot-consuming-container3').height()
                                    });
                                    statisUserChart2.resize();
                                });
                            }
                        }
                    }
                });
            }
        },
        table:{
            display:function(ishidden){
                var container=$('#statis-consuming-table-consuming-container1');
                ishidden?container.removeClass('hidden'):container.addClass('hidden');
            },
            init:function(mark){
                statisUserContainer.table.initTable(mark);
            },
            initTable:function(mark){//初始化主表
                if($('#statis-consuming-table-consuming').data('horizonTable')){
                    statisUserContainer.table.mytable.showProcessing();
                    $.ajax({
                        url: statisUserContainer.urls.usertable,
                        cache: false,
                        type:'post',
                        dataType: 'json',
                        data:statisUserContainer.plot.ajaxDateParam(mark),
                        success: function(data) {
                            statisUserContainer.table.mytable.hideProcessing();
                            statisUserContainer.table.mytable.pluginTable.fnClearTable(false);
                            for(var i=0;i<data.data.length;i++){
                                var item = data.data[i];
                                statisUserContainer.table.mytable.pluginTable.fnAddData(item,false);
                            }
                            statisUserContainer.table.mytable.reload(true);
                        },
                        error: function() {
                        	horizon.notice.error(horizon.lang['statis-common']['readFail']);
                            statisUserContainer.table.mytable.hideProcessing();
                        }
                    });

                }else{
                    statisUserContainer.table.mytable =$('#statis-consuming-table-consuming').horizonTable({
                        settings: {
                            title: horizon.lang.base['infoList'],
                            multipleSearchable: false,//高级搜索
                            multipleSearchAreaVisible: false,
                            searchable:false,
                            height:containerSize.height,
                            columns: statisUserContainer.table.column
                        },
                        serverSideData: false
                    });
                    var $dataTablesContainer = statisUserContainer.table.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                    $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                        statisUserContainer.table.initTable(mark);
                    });
                    statisUserContainer.table.initTable(mark);
                }
            },
            column: [
                {
                    name : 'userName',
                    title : horizon.lang.consuming['userName'],
                    width : '100px',
                    visible : true,
                    searchable : true,
                    multipleSearchable : false,
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
                    columnClass : 'align-left' ,
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        statisUserContainer.subtable.opendialog(rowData,i);
                    }
                }  ,
                {
                    name : 'sameConsumingCount',
                    title : horizon.lang.consuming['userSameTotalConsuming'],
                    width : '100px',
                    visible : true,
                    searchable : true,
                    multipleSearchable : false,
                    orderable : true ,
                    columnClass : 'align-left' ,
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        statisUserContainer.subtable.opendialog(rowData,i);
                    }
                }
            ]
        },
        subtable :{
            opendialog:function(rowdata,i){
            	var userId=rowdata.userId;
                var userName=rowdata.userName;
                var startTime = i==1?rowdata.startTime:rowdata.sameStartTime;
                var endTime = i==1?rowdata.endTime:rowdata.sameEndTime;
                var $dialog = $('#statis-consuming-table-consuming-container2');
                statisUserContainer.subtable.initTable(userId,startTime,endTime);
                $dialog.dialog({
                    addCloseBtn: false,
                    closeText: horizon.lang.base['close'],
                    appendTo:'.page-content-area',
                    title: userName+horizon.lang.consuming['userWorkload'],
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
            initTable: function(userId,startTime,endTime) {
            	if($('#statis-consuming-single-table-consuming').data('horizonTable')){
                    statisUserContainer.subtable.mytable.reload(true);
                }else{
                	statisUserContainer.subtable.mytable = $('#statis-consuming-single-table-consuming').horizonTable({
                        settings: {
                            destroy:true,
                            searchable:false,
                            columns:[
                                     {
                                         name : 'flowName',
                                         title : horizon.lang.consuming['userFlowName'],
                                         width : '200px',
                                         visible : true,
                                         searchable : true,
                                         multipleSearchable : false,
                                         orderable : false,
                                         fnClick: function(nTd, nTdData, rowData, iRow, i) {
                                             statisUserContainer.subtask.opendialog(rowData);
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
                                return $("#statis-consuming-table-consuming-container2").height()-10;
                            }
                        },
                        serverSideData: false
                    });
                }

                var $dataTablesContainer = statisUserContainer.subtable.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                	statisUserContainer.subtable.reloadTable(userId,startTime,endTime);
                });
                statisUserContainer.subtable.reloadTable(userId,startTime,endTime);

            },
            reloadTable:function(userId,startTime,endTime){
            	statisUserContainer.subtable.mytable.showProcessing();
                $.ajax({
                    url: statisUserContainer.urls.singlechart,
                    cache: false,
                    data:{
                        "userId":userId,
                        "autoStartTime":startTime,//自定义的开始时间
                        "autoEndTime":endTime//自定义的结束时间
                    },
                    dataType: 'json',
                    success: function(data) {
                    	statisUserContainer.subtable.mytable.hideProcessing();
                    	statisUserContainer.subtable.mytable.pluginTable.fnClearTable(true);
                        for(var i=0;i<data.data.length;i++){
                            var item = data.data[i];
                            statisUserContainer.subtable.mytable.pluginTable.fnAddData(item,false);
                        }
                        statisUserContainer.subtable.mytable.reload(true);
                    },
                    error: function() {
                    	horizon.notice.error( horizon.lang['statis-common']['readFail']);
                    	statisUserContainer.subtable.mytable.hideProcessing();
                    }
                });
            }
        },
        subtask :{
            opendialog:function(rowdata){
                var userId=rowdata.userId;
                var flowId=rowdata.flowId;
                var flowName=rowdata.flowName;
                var startTime=rowdata.startTime;
                var endTime=rowdata.endTime;
                var $dialog = $('#statis-consuming-table-consuming-container3');
                statisUserContainer.subtask.initTable(userId,flowId,startTime,endTime);
                $dialog.dialog({
                    addCloseBtn: false,
                    closeText: horizon.lang.base['close'],
                    appendTo:'.page-content-area',
                    title: flowName+horizon.lang.consuming['userNodeConsuming'],
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
            initTable: function(userId,flowId,startTime,endTime) {
                if($('#statis-consuming-task-table-consuming').data('horizonTable')){
                    statisUserContainer.subtask.mytable.reload(true);
                }else{
                    statisUserContainer.subtask.mytable = $('#statis-consuming-task-table-consuming').horizonTable({
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
                                return $("#statis-consuming-table-consuming-container3").height()-10;
                            }
                        },
                        serverSideData: false
                        // data: data['data']
                    });
                }

                var $dataTablesContainer = statisUserContainer.subtask.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                    statisUserContainer.subtask.reloadTable(userId,flowId,startTime,endTime);
                });
                statisUserContainer.subtask.reloadTable(userId,flowId,startTime,endTime);

            },
            reloadTable:function(userId,flowId,startTime,endTime){
                statisUserContainer.subtask.mytable.showProcessing();
                $.ajax({
                    url: statisUserContainer.urls.taskchart,
                    cache: false,
                    data:{
                        "userId":userId,
                        "flowId":flowId,
                        "autoStartTime":startTime,//自定义的开始时间
                        "autoEndTime":endTime//自定义的结束时间
                    },
                    dataType: 'json',
                    success: function(data) {
                        statisUserContainer.subtask.mytable.hideProcessing();
                        statisUserContainer.subtask.mytable.pluginTable.fnClearTable(true);
                        for(var i=0;i<data.data.length;i++){
                            var item = data.data[i];
                            statisUserContainer.subtask.mytable.pluginTable.fnAddData(item,false);
                        }
                        statisUserContainer.subtask.mytable.reload(true);
                    },
                    error: function() {
                    	horizon.notice.error(horizon.lang['statis-common']['readFail']);
                        statisUserContainer.subtask.mytable.hideProcessing();
                    }
                });
            }
        }
    };

    //此方法用来初始化搜索选项
    function initSearcher(){
        for(var item in timeinit){
            timeinit[item]();
        };
        bindUserInput();
        bindSearchButton();
        statisUserContainer.plot.myChart=null;
    }

    return horizon.engine['consumingbyuser'] = {
        init : init,
        loginUser:loginUser,
        initSearcher:initSearcher,
        showtime:convertime
    };
}));
