/**
 * 数量统计[按流程统计]
 *
 * @author chengll
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        var scripts = ['jquery', 'moment','bootstrapDatetimepicker','horizonFlowtree','horizonTable','gritter','daterangepicker' ];//当前模块的依赖
        define(scripts, factory);
    } else {
        factory(jQuery, moment);
    }
}(function($ ,  moment) {
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
            _height = _height - $('.flow-status-pic').outerHeight(true) - $('#statis-flow-quantity-searcher .widget-box').outerHeight(true);
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
                - $('.statis-instance-quantity-container').outerHeight(true);
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
                deselected: flowtree.deselected
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
        getIds:function(){
            return flowtree.flowIds.join(';');
        }
    };

    function init(mark){
        statisByFlowsContainer.init(mark);//放入容器
    }

    function containerinit(container,mark){
        //1.判断是否是图形展现
        var type = $("#statis-flow-quantity-searcher .dropdown-menu li[class='active']").data('value');
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

    //为选择流程绑定事件
    function bindUserInput(){
        //选择流程单击事件
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
        $('#statis-flow-quantity-searcher .dropdown-menu li').bind(horizon.tools.clickEvent(),function(){
            $("#statis-flow-quantity-searcher .dropdown-menu li").removeClass('active');
            $(this).addClass('active');
            $('#statis-flow-quantity-searcher .widget-title').html($(this).children('a').html());
            init();
        });
    }

    //绑定搜索和重置按钮
    function bindSearchButton(){
        $("#statis-flow-quantity-searcher form .btn-submit").bind(horizon.tools.clickEvent(),function(){
            init();
        });
    }

    function convertime(obj){
        //1.首先所有都隐藏
        var mark = $(obj).data('value');
        //2.讲对应的进行显示
        $('.tab-container').addClass('hidden');
        $('#'+mark+'-tab-container').removeClass('hidden');
        $('#other-tab-container').removeClass('hidden');
    }

    // 时间控件区域
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
        //月报--年
        month: function() {
            var nowYear= moment().format('YYYY');
            $('#month_year').val(nowYear).datetimepicker({
                language:horizon.vars.lang,
                format: 'yyyy',
                endDate: nowYear,
                minView: 'decade',
                autoclose: true,
                startView: 'decade'
            });
        },
        //季报--年
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

    function bindValidate(){
        $.validator.addMethod('statisAutoTime',function(value,element,params){
            var selector = params[0];
            var start = params[1];

            if($(selector).hasClass("active")){
                return value>=$(start).val();
            }
            return true;
        });
        $("#statis-flow-quantity-searcher form").validate({
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

    //查询的区域===============
    var statisByFlowsContainer={
        urls:{"chartUrl":horizon.tools.formatUrl('/statis/quantity/byflows/list/chart'),
            "tableUrl":horizon.tools.formatUrl('/statis/quantity/byflows/list/table')},
        //初始化
        init:function(mark){
            containerinit(this,mark);
        },
        plot : {
            display:function(ishidden){
                var container=$('#statis-instance-quantity-plot-container');
                ishidden?container.removeClass('hidden'):container.addClass('hidden');
            },
            init:function(mark){
                statisByFlowsContainer.plot.initChart(mark);
            },
            ajaxDateParam:function(mark){
                return {
                    "flowId": flowtree.getIds(),//实例统计参与者
                    "statisType":mark?mark:$("#myTab ul a[aria-expanded='true']").data('value'),//统计类别
                    "autoStartTime":$("#auto_starttime").val(),//自定义的开始时间
                    "autoEndTime":$("#auto_endtime").val(),//自定义的结束时间
                    "dayTime":$("#day_time").val(),//日报的时间
                    "monthYear":$("#month_year").val(),//月报的年时间
                    "quarterYear":$("#quarter_year").val(),//季报的年时间
                    "yearYear":$("#year_year").val()//年报的年时间
                }
            },
            xalias:function(){
                return{
                    1:{text:horizon.lang.quantity['userCreateCount'],name:'createCount' ,itemStyle:{ normal:{color:'#6699CC'} } },
                    2:{text:horizon.lang.quantity['userApprovalCount'],name:'approvalCount' ,itemStyle:{ normal:{color:'#ABD4A5'}} },
                    3:{text:horizon.lang.quantity['instanceFinishCount'],name:'finishCount' ,itemStyle:{ normal:{color:'#d87c7c'} }}
                }
            },
            settings:function(mark){
                return {
                    xaxis:statisByFlowsContainer.plot.xalias(),
                    selector:'#statis-instance-quantity-chart-placeholder',//放置图表的容器
                    height:containerSize.height,
                    nameField:'statisTime',//折线名称字段，在data中的字段,
                    url:statisByFlowsContainer.urls.chartUrl,
                    ajaxDateParam:statisByFlowsContainer.plot.ajaxDateParam(mark)
                };
            },
            initChart:function(mark){
                statisByFlowsContainer.plot.myChart=horizon.engine.statisplotline.getBarChart(statisByFlowsContainer.plot.settings(mark),statisByFlowsContainer.plot.myChart);
            }
        },
        table:{
            display:function(ishidden){
                var container=$('#statis-instance-quantity-table-container');
                ishidden?container.removeClass('hidden'):container.addClass('hidden');
            },
            init:function(mark){
                statisByFlowsContainer.table.initTable(mark);
            },
            initTable:function(mark){//初始化主表
                if($('#statis-instance-quantity-list-table').data('horizonTable')){
                    statisByFlowsContainer.table.mytable.showProcessing();
                    $.ajax({
                        url: statisByFlowsContainer.urls.tableUrl,
                        cache: false,
                        type:'post',
                        dataType: 'json',
                        data:statisByFlowsContainer.plot.ajaxDateParam(mark),
                        success: function(data) {
                            statisByFlowsContainer.table.mytable.hideProcessing();
                            statisByFlowsContainer.table.mytable.pluginTable.fnClearTable(false);
                            for(var i=0;i<data.data.length;i++){
                                var item = data.data[i];
                                statisByFlowsContainer.table.mytable.pluginTable.fnAddData(item,false);
                            }
                            statisByFlowsContainer.table.mytable.reload(true);
                        },
                        error: function() {
                        	horizon.notice.error(horizon.lang['statis-common']['readFail']);
                            statisByFlowsContainer.table.mytable.hideProcessing();
                        }
                    });

                }else{
                    statisByFlowsContainer.table.mytable =$('#statis-instance-quantity-list-table').horizonTable({
                        settings: {
                            title: horizon.lang.base['infoList'],
                            multipleSearchable: false,//高级搜索
                            multipleSearchAreaVisible: false,
                            searchable:false,
                            height:containerSize.height,
                            columns: statisByFlowsContainer.table.column
                        },
                        serverSideData: false
                    });
                    var $dataTablesContainer = statisByFlowsContainer.table.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                    $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                        statisByFlowsContainer.table.initTable(mark);
                    });
                    statisByFlowsContainer.table.initTable(mark);
                }
            },
            column: [
                {
                    name : 'statisTime',
                    title : horizon.lang.quantity['instanceStatisTime'],
                    width : '200px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : true
                }  ,
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
                    name : 'finishCount',
                    title : horizon.lang.quantity['instanceFinishCount'],
                    width : '100px',
                    visible : true,
                    searchable : true,
                    multipleSearchable : false,
                    orderable : true ,
                    columnClass : 'align-left'
                }

            ]
        }

    }
    //end查询的区域===============

    //此方法用来初始化搜索选项
    function initSearcher(){
        //初始化树
        flowtree.init();
        for(var item in timeinit){
            timeinit[item]();
        };
        bindUserInput();
        bindSearchButton();
        statisByFlowsContainer.plot.myChart=null;
    }

    return horizon.engine['statisbyflows'] = {
        init : init,
        initSearcher:initSearcher,
        showtime:convertime,
        flowtree:flowtree
    };
}));
