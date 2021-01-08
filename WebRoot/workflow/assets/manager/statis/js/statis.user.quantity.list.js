/**
 * 数量统计[按人员统计]
 *
 * @author chengll
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        var scripts = ['jquery','echarts','moment','horizonTable','bootstrapDatetimepicker','horizonSelectuser','gritter','daterangepicker' ];//当前模块的依赖
        define(scripts, factory);
    } else {
        factory(jQuery, moment);
    }
}(function($ ,echarts, moment) {
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
            _height = _height - $('.flow-status-pic').outerHeight(true) - $('#statis-user-quantity-searcher .widget-box').outerHeight(true);
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
        $('#statis-user-quantity-searcher .dropdown-menu li').bind(horizon.tools.clickEvent(),function(){
            $("#statis-user-quantity-searcher .dropdown-menu li").removeClass('active');
            $(this).addClass('active');
            $('#statis-user-quantity-searcher .widget-title').html($(this).children('a').html());
            init();
        });
    }

    //绑定搜索和重置按钮
    function bindSearchButton(){
        $("#statis-user-quantity-searcher .btn-submit").bind(horizon.tools.clickEvent(),function(){
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
        var type = $("#statis-user-quantity-searcher .dropdown-menu li[class='active']").data('value');
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
                language:horizon.vars.lang,//horizon.vars.lang,
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
                language:horizon.vars.lang,//horizon.vars.lang,
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
        $("#statis-user-quantity-searcher form").validate({
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

    var optionData =  {
        grid:{
            left: '5%',
            right: '5%',
            top: '15%',
            bottom: '15%'
        },
        color:colors,
        tooltip: {
            trigger: 'axis',
            axisPointer: {type: 'none'}
        },
        legend: {
            x: 'right',
            data:[]
        },
        calculable: true,
        xAxis: {
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
        yAxis: [{type: 'value'}],
        series :[]
    };
    var itemStylePara = {
        'createCount':{ normal:{color:'#6699CC'} },
        'approvalCount':{ normal:{color:'#ABD4A5'} },
        'extendedCount':{ normal:{color:'#d87c7c'} }
    };
    var statisUserContainer={
        urls:{
        	'loginUser':horizon.tools.formatUrl('/statis/consuming/loginUser'),
            'userchart' : horizon.tools.formatUrl('/statis/quantity/person/list/chart'),
            'singlechart': horizon.tools.formatUrl('/statis/quantity/bysingle/list/chart'),
            'taskchart':horizon.tools.formatUrl('/statis/quantity/task/list/chart'),
            'usertable' : horizon.tools.formatUrl('/statis/quantity/person/list/table'),
            'singletable': horizon.tools.formatUrl('/statis/quantity/bysingle/list/table')
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
                var obj={name:xaxisitem.text,type:'bar',itemStyle:itemStylePara[xaxisitem.name],barMaxWidth:50};
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
            ajaxDateParam:function(mark){
                return {
                    "userId": $("#userids_user").val(),//实例统计参与者ID
                    "userName": $("#usernames_user").val(),//实例统计参与者名称
                    "statisType":mark?mark:$("#myTab ul a[aria-expanded='true']").data('value'),//统计类别
                    "autoStartTime":$("#auto_starttime").val(),//自定义的开始时间
                    "autoEndTime":$("#auto_endtime").val(),//自定义的结束时间
                    "dayTime":$("#day_time").val(),//日报的时间
                    "monthYear":$("#month_year").val(),//月报的年时间
                    "monthMonth":$("#month_month").val(),//月报的月时间
                    "quarterYear":$("#quarter_year").val(),//季报的年时间
                    "quarterQuarter":$("#quarter_quarter").val(),//季报的季时间
                    "yearYear":$("#year_year").val()//年报的年时间
                }
            },
            xalias:function(){
                return {
                    1:{text:horizon.lang.quantity['userCreateCount'],name:'createCount', itemStyle:{ normal:{color:'#6699CC'} } },
                    2:{text:horizon.lang.quantity['userApprovalCount'],name:'approvalCount' ,itemStyle:{ normal:{color:'#ABD4A5'} }},
                    3:{text:horizon.lang.quantity['userExtendedCount'],name:'extendedCount' ,itemStyle:{ normal:{color:'#d87c7c'} } }
                }
            },
            settings:function(mark){
                return {
                    xaxis:statisUserContainer.plot.xalias(),
                    selector:'#statis-user-image-quantity',//放置图表的容器
                    height:containerSize.height,
                    plotclick:function(tag){
                        statisUserContainer.subplot.initSubChart(true,tag.userName,tag.userId ,mark);
                    },
                    nameField:'userName',//折线名称字段，在data中的字段,
                    url:statisUserContainer.urls.userchart,
                    ajaxDateParam:statisUserContainer.plot.ajaxDateParam(mark)
                };
            },
            display:function(ishidden){
                var container=$('#statis-user-chart-quantity-container1');
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
            initSubChart:function(ishidden,name,creator ,mark){
                var $flowStatus = $('#statis-user-chart-quantity-container2');
                ishidden?$flowStatus.removeClass('hidden'):$flowStatus.addClass('hidden');
                $flowStatus.dialog({
                    addCloseBtn: false,
                    title: name+horizon.lang.quantity['userWorkload'],
                    width: $(window).width() > 995?'995':$(window).width(),
                    height: $(window).height() > 640?'640':'auto',
                    maxHeight: $(window).height(),
                    minHeight:'500',
                    close: function() {
                        statisUserContainer.subplot.myChart.dispose();
                    }
                });
                $('#statis-user-single-quantity').css({
                    'width': '100%',
                    'height':  $('#statis-user-chart-quantity-container2').height()
                });
                statisUserContainer.subplot.myChart=echarts.init($('#statis-user-single-quantity')[0]);//$('#statis-user-single-quantity')[0]
                statisUserContainer.subplot.initBySingleEcharts(statisUserContainer.subplot.myChart,creator ,mark);
                statisUserContainer.subplot.myChart.resize();
            },
            initBySingleEcharts: function(statisUserChart1,creator,mark ) {
                var singleOption = optionData;
                statisUserChart1.showLoading();
                // 为echarts对象加载数据
                if (singleOption && typeof singleOption === 'object') {
                    statisUserChart1.setOption(singleOption);
                }
                statisUserContainer.subplot.ajaxBySingleData(statisUserChart1,creator,mark );
            },
            ajaxBySingleData: function(statisUserChart1,creator,mark ) {
                $.ajax({
                    url: statisUserContainer.urls.singlechart,
                    dataType: 'json',
                    data:{"userId":creator,
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
                                    return {1:{text:horizon.lang.quantity['userCreateCount'],name:'createCount' },
                                        2:{text:horizon.lang.quantity['userApprovalCount'],name:'approvalCount' },
                                        3:{text:horizon.lang.quantity['userExtendedCount'],name:'extendedCount' }}
                                };
                                //---- 填充X轴数据-----
                                for(var i=0;i<data.recordsTotal;i++){
                                    var item = data.data[i];
                                    xaxisData.push(item.flowName);
                                }
                                //---- 填充显示数据 -----
                                statisUserContainer.paddata(data,xaxis(),legendData,seriesData);
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
                                    statisUserContainer.subplottask.initSubTaskChart(true,creator,params.name,flowid,mark);
                                });
                                $(window).off('resize').on('resize',function(){
                                    $('#statis-user-single-quantity').css({
                                        'width': '100%',
                                        'height':  $('#statis-user-chart-quantity-container2').height()
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
            initSubTaskChart:function(ishidden,creator,flowName,flowid,mark){
                var $flowStatus = $('#statis-user-chart-quantity-container3');
                ishidden?$flowStatus.removeClass('hidden'):$flowStatus.addClass('hidden');
                $flowStatus.dialog({
                    addCloseBtn: false,
                    title: flowName+horizon.lang.quantity['userNodeName'],
                    width: $(window).width() > 995?'995':$(window).width(),
                    height: $(window).height() > 640?'640':'auto',
                    maxHeight: $(window).height(),
                    minHeight:'500',
                    close: function() {
                        statisUserContainer.subplottask.myChart.dispose();
                    }
                });
                $('#statis-user-task-quantity').css({
                    'width': '100%',
                    'height':  $('#statis-user-chart-quantity-container3').height()
                });
                statisUserContainer.subplottask.myChart=echarts.init($('#statis-user-task-quantity')[0]);
                statisUserContainer.subplottask.initByTaskEcharts(statisUserContainer.subplottask.myChart,creator,flowid,mark);

                statisUserContainer.subplottask.myChart.resize();
            },
            initByTaskEcharts: function(statisUserChart2,creator,flowid,mark) {
                var taskOption =  optionData;
                statisUserChart2.showLoading();
                // 为echarts对象加载数据
                if (taskOption && typeof taskOption === 'object') {
                    statisUserChart2.setOption(taskOption);
                }
                statisUserContainer.subplottask.ajaxByTaskData(statisUserChart2,creator,flowid,mark);
            },
            ajaxByTaskData: function(statisUserChart2,creator,flowid,mark) {
                $.ajax({
                    url: statisUserContainer.urls.taskchart,
                    dataType: 'json',
                    data:{"userId":creator,
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
                    cache: false,
                    error: function() {
                        statisUserContainer.errorMsg();
                    },
                    success: function(data) {
                        if(data) {
                            if(data.recordsTotal==0){
                                statisUserChart2.clear();
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
                                    return {1:{text:horizon.lang.quantity['userApprovalCount'],name:'approvalCount' },
                                        2:{text:horizon.lang.quantity['userBack'],name:'extendedCount' }}
                                };
                                //---- 填充X轴数据-----
                                for(var i=0;i<data.recordsTotal;i++){
                                    var item = data.data[i];
                                    xaxisData.push(item.nodeName);
                                }
                                //---- 填充显示数据 -----
                                statisUserContainer.paddata(data,xaxis(),legendData,seriesData);
                                statisUserChart2.hideLoading();
                                statisUserChart2.setOption({
                                    legend: { data:legendData  },
                                    xAxis: { data:xaxisData  },
                                    series: seriesData
                                });
                                $(window).off('resize').on('resize',function(){
                                    $('#statis-user-task-quantity').css({
                                        'width': '100%',
                                        'height':  $('#statis-user-chart-quantity-container3').height()
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
                var container=$('#statis-user-table-quantity-container1');
                ishidden?container.removeClass('hidden'):container.addClass('hidden');
            },
            init:function(mark){
                statisUserContainer.table.initTable(mark);
            },
            initTable:function(mark){//初始化主表
                if($('#statis-user-table-quantity').data('horizonTable')){
                    statisUserContainer.table.mytable.showProcessing();
                    $.ajax({
                        url: statisUserContainer.urls.usertable,
                        cache: false,
                        type:'post',
                        dataType: 'json',
                        data:statisUserContainer.plot.ajaxDateParam(mark),
                        success: function(data) {
                            statisUserContainer.table.mytable.hideProcessing();
                            statisUserContainer.table.mytable.pluginTable.fnClearTable(true);
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
                    statisUserContainer.table.mytable =$('#statis-user-table-quantity').horizonTable({
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
                    title : horizon.lang.quantity['userName'],
                    width : '100px',
                    visible : true,
                    searchable : true,
                    multipleSearchable : false,
                    orderable : false ,
                    fnClick: function(nTd, nTdData, rowData, iRow, i,mark) {
                        statisUserContainer.subtable.opendialog(rowData,mark);
                    }
                },
                {
                    name : 'createCount',
                    title : horizon.lang.quantity['userCreateCount'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : true,
                    columnClass : 'align-left'
                }  ,
                {
                    name : 'approvalCount',
                    title : horizon.lang.quantity['userApprovalCount'],
                    width : '100px',
                    visible : true,
                    searchable : true,
                    multipleSearchable : false,
                    orderable : true ,
                    columnClass : 'align-left'
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
                var userId=rowdata.userId;
                var userName=rowdata.userName;
                var $dialog = $('#statis-user-table-quantity-container2');
                statisUserContainer.subtable.initTable(userId,mark);
                $dialog.dialog({
                    addCloseBtn: false,
                    closeText: horizon.lang.base['close'],
                    appendTo:'.page-content-area',
                    title: userName+horizon.lang.quantity['userWorkload'],
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
            initTable:function(userId,mark){//弹出框的子表格的初始化
                if($('#statis-user-single-table-quantity').data('horizonTable')){
                    statisUserContainer.subtable.mytable.pluginTable._fnFilterComplete(statisUserContainer.subtable.mytable.pluginTable.fnSettings(), {
                        "sSearch": ''
                    } );
                    var paramsTable = statisUserContainer.plot.ajaxDateParam(mark);

                    var aoServerParams= statisUserContainer.subtable.mytable.pluginTable.fnSettings().aoServerParams[1]={
                        "fn": function(aoData){
                            for(var i in paramsTable){
                                if(i == 'userId'){
                                    aoData.push({
                                            'name': 'userId',
                                            'value': userId
                                        }
                                    );
                                }else{
                                    aoData.push({
                                            'name': i,
                                            'value': paramsTable[i]
                                        }
                                    );
                                }
                            }
                        }
                    };
                    statisUserContainer.subtable.mytable.reload(true);
                }else{
                    statisUserContainer.subtable.mytable = $('#statis-user-single-table-quantity').horizonTable({
                        settings: {
                            columns:statisUserContainer.subtable.columns,
                            height:function(){
                                return $("#statis-user-table-quantity-container2").height()-10;
                            }
                        },
                        ajaxDataSource: statisUserContainer.urls.singletable
                    });
                    statisUserContainer.subtable.initTable(userId,mark);
                }
            },
            columns:[
                {
                    name : 'flowName',
                    title : horizon.lang.quantity['userFlowName'],
                    width : '200px',
                    visible : true,
                    searchable : true,
                    multipleSearchable : false,
                    orderable : false,
                    fnClick: function(nTd, nTdData, rowData, iRow, i,mark) {
                        statisUserContainer.subtask.opendialog(rowData,mark);
                    }
                },
                {
                    name : 'createCount',
                    title : horizon.lang.quantity['userCreateCount'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : true,
                    columnClass : 'align-left'
                }  ,
                {
                    name : 'approvalCount',
                    title : horizon.lang.quantity['userApprovalCount'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : true ,
                    columnClass : 'align-left'
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
        subtask :{
            opendialog:function(rowdata,mark){
                var userId=rowdata.userId;
                var flowId=rowdata.flowId;
                var flowName=rowdata.flowName;
                var $dialog = $('#statis-user-table-quantity-container3');
                statisUserContainer.subtask.initTable(userId,flowId,mark);
                $dialog.dialog({
                    addCloseBtn: false,
                    closeText: horizon.lang.base['close'],
                    appendTo:'.page-content-area',
                    title: flowName+horizon.lang.quantity['userNodeWorkload'],
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
            initTable: function(userId,flowId,mark) {
                if($('#statis-user-task-table-quantity').data('horizonTable')){
                    statisUserContainer.subtask.mytable.reload(true);
                }else{
                    statisUserContainer.subtask.mytable = $('#statis-user-task-table-quantity').horizonTable({
                        settings: {
                            searchable:false,
                            columns: [
                                {
                                    name : 'nodeName',
                                    title : horizon.lang.quantity['userNodeName'],
                                    width : '200px',
                                    visible : true,
                                    searchable : false,
                                    multipleSearchable : true,
                                    orderable : false
                                } ,
                                {
                                    name : 'approvalCount',
                                    title : horizon.lang.quantity['userApprovalCount'],
                                    width : '100px',
                                    visible : true,
                                    searchable : false,
                                    multipleSearchable : false,
                                    orderable : true ,
                                    columnClass : 'align-left'
                                },
                                {
                                    name : 'extendedCount',
                                    title : horizon.lang.quantity['userBack'],
                                    width : '100px',
                                    visible : true,
                                    searchable : false,
                                    multipleSearchable : false,
                                    orderable : true,
                                    columnClass : 'align-left'
                                }
                            ],
                            height:function(){
                                return $("#statis-user-table-quantity-container3").height()-10;
                            }
                        },
                        serverSideData: false
                        // data: data['data']
                    });
                }

                var $dataTablesContainer = statisUserContainer.subtask.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                    statisUserContainer.subtask.reloadTable(userId,flowId,mark);
                });
                statisUserContainer.subtask.reloadTable(userId,flowId,mark);

            },
            reloadTable:function(userId,flowId,mark){
                statisUserContainer.subtask.mytable.showProcessing();
                $.ajax({
                    url: statisUserContainer.urls.taskchart,
                    cache: false,
                    data:{
                        "userId":userId,
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
        }
        bindUserInput();
        bindSearchButton();
        statisUserContainer.plot.myChart=null;
    }

    return horizon.engine['statisbyuser'] = {
        init : init,
        loginUser:loginUser,
        initSearcher:initSearcher,
        showtime:convertime
    };
}));
