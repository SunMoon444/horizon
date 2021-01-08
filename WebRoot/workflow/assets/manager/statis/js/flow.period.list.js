/**
 * 实例状态[按流程统计]
 *
 * @author lichao
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        var scripts = ['jquery', 'moment', 'horizonTable', 'bootstrapDatetimepicker',
                       'horizonFlowtree','gritter','daterangepicker'];//当前模块的依赖
        define(scripts, factory);
    } else {
        factory(jQuery, moment);
    }
}(function($, moment) {
    "use strict";

    //容器的大小
    var containerSize = {
        height: function() {
            var _height = horizon.tools.getPageContentHeight(),
                $pageHeader = $('.page-header');
            if($pageHeader.css('display') != 'none') {
                _height -= $pageHeader.outerHeight(true);
            }
            _height = _height - $('.flow-status-pic').outerHeight(true) - $('#statis-flow-searcher .widget-box').outerHeight(true)+10;
            return _height;
        },
        width: function() {
            return $('.page-content-area').outerWidth(true);
        },
        picHeight: function() {
            return containerSize.height();
        },
        treeHeight: function() {
            var outerHeight = this.height() + $('#statis-flow-searcher .widget-box').outerHeight(true);
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
        //1.进行判断应该显示什么表格
        var iswithperiod = $("#statis-flow-iswithperiod input[type='radio']:checked").val();
        if(iswithperiod==0){//显示同期对比
            //当有选中某流程时,则显示流程的详细信息
            $('#statis-flow-period-container').removeClass("hidden");
            $('#statis-flow-notperiod-container').addClass("hidden");
            periodContainer.init(mark);//放入容器,用于列表和图表的转换
        }else{
            //不需要同期对比
            $('#statis-flow-notperiod-container').removeClass("hidden");
            $('#statis-flow-period-container').addClass("hidden");
            notPeriodContainer.init(mark);//放入容器,用于列表和图表的转换
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
        $('#statis-flow-searcher .dropdown-menu li').bind(horizon.tools.clickEvent(),function(){
            $("#statis-flow-searcher .dropdown-menu li").removeClass('active');
            $(this).addClass('active');
            $('#statis-flow-searcher .widget-title').html($(this).children('a').html());
            init();
        });
    }

    //绑定搜索和重置按钮
    function bindSearchButton(){
        $("#statis-flow-searcher form .btn-submit").bind(horizon.tools.clickEvent(),function(){
            var id = flowtree.getIds();
            if(!id||id==''){
            	horizon.notice.error(horizon.lang['statis-common']['selectFlow']);
                return;
            }
            init();
        });
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
                ranges: {}
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
        //3.调用相应的控件的初始化方法
        //timeinit[mark]();
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
        $("#statis-flow-searcher form").validate({
            focusInvalid: false,
            rules:{
                //flownames_flows:"required",
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



    function containerinit(container,mark){
        //1.判断是否是图形展现
        var type = $("#statis-flow-searcher .dropdown-menu li[class='active']").data('value');
        if(type=='line'){
            container.plot.display(true);
            container.table.display(false);
            container.line.init(mark);
        }else if(type=='table'){
            container.plot.display(false);
            container.table.display(true);
            container.table.init(mark);
        }else if(type=='pillar'){
            container.plot.display(true);
            container.table.display(false);
            container.pillar.init(mark);
        }
    }
    //同期查询的区域===============
    var periodContainer={
        urls:{
            'list' : horizon.tools.formatUrl('/statis/flows/period/list'),
            'sublist': horizon.tools.formatUrl('/statis/user/sub/page'),
            'chart':horizon.tools.formatUrl('/statis/flows/period/chart'),
            'sublistdoerInstance':horizon.tools.formatUrl('/statis/user/doer/flowinstance/page'),
            'sublistdoerOperate':horizon.tools.formatUrl('/statis/user/doer/flowoperate/page')
        },
        //初始化
        init:function(mark){
            //1.判断是否是图形展现
            containerinit(this,mark);
        },
        plot : {
            display:function(ishidden){
                var container=$('#statis-flow-period-plot-container');
                ishidden?container.removeClass('hidden'):container.addClass('hidden');
            },
            xalias:function(){
                return {1:{text:horizon.lang.instance['userPlotInstanceCount'],name:'instanceCount',type:'0',doer:'instance'},//type表示是否同期
                    2:{text:horizon.lang.instance['userPlotOperateCount'],name:'operateCount',type:'0',doer:'operate'},
                    3:{text:horizon.lang.instance['userPlotSameInstanceCount'],name:'sameInstanceCount',type:'1',doer:'instance'},
                    4:{text:horizon.lang.instance['userPlotSameOperateCount'],name:'sameOperateCount',type:'1',doer:'operate'}
                }
            },
            settings:function(mark){
                return {
                    xaxis:periodContainer.plot.xalias(),
                    //data:datas,//没列显示的为xalias.name字段上的值
                    selector:'#statis-flow-period-image-placeholder',//放置图表的容器
                    plotclick:function(tag,xalxs,xalxskey){
                        var startTime=(xalxs.type=='0')?tag.startTime:tag.sameStartTime,
                            endTime=(xalxs.type=='0')?tag.endTime:tag.sameEndTime;
                        periodContainer.subtabledoer[xalxs.doer].opendialog(tag,xalxs.name,tag[xalxs.name],startTime,endTime);
                    },
                    height:containerSize.picHeight,
                    nameField:'flowName',//折线名称字段，在data中的字段,
                    url:periodContainer.urls.chart,
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
                    },
                    ajaxDateParam:periodContainer.table.ajaxDateParam(mark)
                };
            }
        },
        //折线
        line:{
            init:function(mark){
                periodContainer.plot.myChart= horizon.engine.statisplotline.getChart(periodContainer.plot.settings(mark),periodContainer.plot.myChart);
            }
        },
        //柱状
        pillar:{
            init:function(mark){
                periodContainer.plot.myChart=horizon.engine.statisplotline.getBarChart(periodContainer.plot.settings(mark),periodContainer.plot.myChart);
            }
        },
        table:{

            display:function(ishidden){
                var container=$('#statis-flow-period-data-container');
                ishidden?container.removeClass('hidden'):container.addClass('hidden');
            },
            init:function(mark){
                //进行初始化带同期对比的表格
                periodContainer.table.initTable(mark);
            },
            initTable:function(mark){//初始化主表
                if($('#statis-flow-period-data').data('horizonTable')){
                    var params = this.ajaxDateParam(mark);
                    periodContainer.table.mytable.showProcessing();
                    $.ajax({
                        url: periodContainer.urls.list,
                        cache: false,
                        type:'post',
                        dataType: 'json',
                        data:params,
                        success: function(data) {
                            periodContainer.table.mytable.hideProcessing();
                            periodContainer.table.mytable.pluginTable.fnClearTable(false);
                            for(var i=0;i<data.data.length;i++){
                                var item = data.data[i];
                                periodContainer.table.mytable.pluginTable.fnAddData(item,false);
                            }
                            periodContainer.table.mytable.reload(true);
                        },
                        error: function() {
                        	horizon.notice.error(horizon.lang['statis-common']['gritterReadFail']);
                            periodContainer.table.mytable.hideProcessing();
                        }
                    });

                }else{
                    periodContainer.table.mytable =$('#statis-flow-period-data').horizonTable({
                        settings: {
                            title: horizon.lang.base['infoList'],
                            multipleSearchable: false,//高级搜索
                            multipleSearchAreaVisible: false,
                            searchable:false,
                            height:containerSize.height,
                            columns: periodContainer.table.column,
                            fnDrawCallback:function(settings){
                                var api = $('#statis-flow-period-data').dataTable().api();
                                if(api){
                                    var info = api.page.info();
                                    if(info.page==(info.pages-1)){
                                        var $totaltr  = $('#statis-flow-period-data tbody>tr:last');
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
                    var $dataTablesContainer = periodContainer.table.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                    $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                        periodContainer.table.initTable(mark);
                    });
                    periodContainer.table.initTable(mark);
                }
            },
            ajaxDateParam:function(mark){
                return {
                    flowId: flowtree.getIds(),// $("#flowids_flows").val(),//实例统计参与者
                    statisType:mark?mark:$("#myTab ul a[aria-expanded='true']").data('value'),//统计类别
                    autoStartTime:$("#auto_starttime").val(),//自定义的开始时间
                    autoEndTime:$("#auto_endtime").val(),//自定义的结束时间
                    dayTime:$("#day_time").val(),//日报的时间
                    monthYear:$("#month_year").val(),//月报的年时间
                    monthMonth:$("#month_month").val(),//月报的月时间
                    quarterYear:$("#quarter_year").val(),//季报的年时间
                    quarterQuarter:$("#quarter_quarter").val(),//季报的季时间
                    yearYear:$("#year_year").val()//年报的年时间
                }
            },
            column: [
                {
                    name : 'flowName',
                    title : horizon.lang.instance['userTableFlowName'],
                    width : '300px',
                    visible : true,
                    searchable : true,
                    multipleSearchable : false,
                    orderable : false,
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        periodContainer.subtable.opendialog(rowData);
                    }
                },
                {
                    name : 'instanceCount',
                    title : horizon.lang.instance['userPlotInstanceCount'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : false,
                    columnClass : 'align-left',
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        periodContainer.subtabledoer.instance.opendialog(rowData,'instanceCount',rowData.instanceCount,rowData.startTime,rowData.endTime);
                    }
                },
                {
                    name : 'operateCount',
                    title : horizon.lang.instance['userPlotOperateCount'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : false,
                    columnClass : 'align-left',
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        periodContainer.subtabledoer.operate.opendialog(rowData,'operateCount',rowData.operateCount,rowData.startTime,rowData.endTime);
                    }
                },
                {
                    name : 'sameInstanceCount',
                    title : horizon.lang.instance['userPlotSameInstanceCount'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : false,
                    columnClass : 'align-left',
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        periodContainer.subtabledoer.instance.opendialog(rowData,'sameInstanceCount',rowData.sameInstanceCount,rowData.sameStartTime,rowData.sameEndTime);
                    }

                },
                {
                    name : 'sameOperateCount',
                    title : horizon.lang.instance['userPlotSameOperateCount'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : false,
                    columnClass : 'align-left',
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        periodContainer.subtabledoer.operate.opendialog(rowData,'sameOperateCount',rowData.sameOperateCount,rowData.sameStartTime,rowData.sameEndTime);
                    }
                }
            ]
        },
        subtable :{
            opendialog:function(rowdata){
                var flowid=rowdata.flowId;
                var flowname=rowdata.flowName;
                var $dialog = $('#statis-flow-period-data-container2');
                periodContainer.subtable.initTable(flowid);
                $dialog.dialog({
                    addCloseBtn: false,
                    closeText: horizon.lang.base['close'],
                    appendTo:'.page-content-area',
                    title: horizon.lang.instance['userTableFlowName']+'：'+flowname,
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
            initTable:function(flowid,mark){//弹出框的子表格的初始化
                if($('#statis-flow-period-data-sub').data('horizonTable')){
                    periodContainer.subtable.mytable.pluginTable._fnFilterComplete(periodContainer.subtable.mytable.pluginTable.fnSettings(), {
                        "sSearch": ''
                    } );

                    var paramsTable = periodContainer.table.ajaxDateParam(mark);

                    var aoServerParams= periodContainer.subtable.mytable.pluginTable.fnSettings().aoServerParams[1]={
                        "fn": function(aoData){
                            paramsTable.flowId=flowid;
                            for(var i in paramsTable){
                                aoData.push({
                                    'name': i,
                                    'value': paramsTable[i]
                                } );
                            }
                        }
                    };
                    periodContainer.subtable.mytable.reload(true);
                }else{
                    periodContainer.subtable.mytable = $('#statis-flow-period-data-sub').horizonTable({
                        settings: {
                            columns:periodContainer.subtable.columns,
                            height:function(){
                                return $(".ui-dialog-content").height()-10;
                            }
                        },
                        ajaxDataSource: periodContainer.urls.sublist
                    });
                    periodContainer.subtable.initTable(flowid);
                }
            },
            columns:[
                {
                    name : 'nodeName',
                    title : horizon.lang.instance['userSubColumnsNodeName'],
                    width : '200px',
                    visible : true,
                    searchable : true,
                    multipleSearchable : true,
                    orderable : true
                },
                {
                    name : 'urgeCount',
                    title : horizon.lang.instance['userSubColumnsUrgeCount'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : false
                },
                {
                    name : 'extendedCount',
                    title : horizon.lang.instance['userSubColumnsExtendedCount'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : false,
                    columnClass : 'align-left'
                },
                {
                    name : 'standardTime',
                    title : horizon.lang.instance['userSubColumnsStandardTime'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : false,
                    columnClass : 'align-left'
                },
                {
                    name : 'totalTime',
                    title : horizon.lang.instance['userSubColumnsTotalTime'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : false,
                    columnClass : 'align-left'
                },
                {
                    name : 'efficiency',
                    title : horizon.lang.instance['userSubColumnsEfficiency'],
                    width : '100px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : false,
                    columnClass : 'align-left'
                }
            ]

        },
        subtabledoer:{
            types:{
                'instanceCount':{name:horizon.lang.instance['userPlotInstanceCount'],type:'0'},//type 表示是什么操作
                'operateCount':{name:horizon.lang.instance['userPlotOperateCount'],type:'1'},
                'sameInstanceCount':{name:horizon.lang.instance['userPlotSameInstanceCount'],type:'0'},
                'sameOperateCount':{name:horizon.lang.instance['userPlotSameOperateCount'],type:'1'}
            },
            instance:{
                opendialog:function(rowdata,type,num,starttime,endtime){
                    var flowid=rowdata.flowId;
                    var flowname=rowdata.flowName;
                    var $dialog = $('#statis-flow-data-container3');
                    var typeEnum = periodContainer.subtabledoer.types[type];
                    periodContainer.subtabledoer.instance.initTable(flowid,starttime,endtime);
                    $dialog.dialog({
                        addCloseBtn: false,
                        closeText: horizon.lang.base['close'],
                        appendTo:'.page-content-area',
                        title: horizon.lang.instance['userTableFlowName']+'：'+flowname +" "+ typeEnum.name +' : '+num,
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
                initTable: function(flowid,starttime,endtime) {
                    if($('#statis-flow-doer-data-sub-instance').data('horizonTable')){
                    	periodContainer.subtabledoer.instance.mytable.reload(true)
                    }else{
                    	periodContainer.subtabledoer.instance.mytable = $('#statis-flow-doer-data-sub-instance').horizonTable({
                            settings: {
                                searchable:false,
                                height:function(){
                                    return $(".ui-dialog-content").height()-10;
                                },
                                columns:[
                                         {
                                             name : 'title',
                                             title : horizon.lang.instance['userSubtabledoerTitle'],
                                             width : '250px',
                                             visible : true,
                                             searchable : false,
                                             multipleSearchable : false,
                                             orderable : false
                                         },
                                         {
                                             name : 'statusName',
                                             title : horizon.lang.instance['userSubtabledoerStatusName'],
                                             width : '150px',
                                             visible : true,
                                             searchable : false,
                                             multipleSearchable : false,
                                             orderable : false,
                                             columnClass : 'align-left'
                                         },
                                         {
                                             name : 'startTime',
                                             title : horizon.lang.instance['userSubtabledoerStartTime'],
                                             width : '150px',
                                             visible : true,
                                             searchable : false,
                                             multipleSearchable : false,
                                             orderable : true,
                                             columnClass : 'align-left'
                                         }
                                     ]
                            },
                            serverSideData: false
                        });
                    }

                    var $dataTablesContainer = periodContainer.subtabledoer.instance.mytable.getPlaceholder().closest('.dataTables_widgetbox');
                    $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                    	periodContainer.subtabledoer.instance.reloadTable(flowid,starttime,endtime);
                    });
                    periodContainer.subtabledoer.instance.reloadTable(flowid,starttime,endtime);

                },
                reloadTable:function(flowid,starttime,endtime){
                	periodContainer.subtabledoer.instance.mytable.showProcessing();
                    $.ajax({
                        url: periodContainer.urls.sublistdoerInstance,
                        cache: false,
                        data:{
                            "flowId":flowid,
                            "startDate":starttime,
                            "endDate":endtime
                        },
                        dataType: 'json',
                        success: function(data) {
                        	periodContainer.subtabledoer.instance.mytable.hideProcessing();
                        	periodContainer.subtabledoer.instance.mytable.pluginTable.fnClearTable(true);
                            for(var i=0;i<data.data.length;i++){
                                var item = data.data[i];
                                periodContainer.subtabledoer.instance.mytable.pluginTable.fnAddData(item,false);
                            }
                            periodContainer.subtabledoer.instance.mytable.reload(true);
                        },
                        error: function() {
                        	horizon.notice.error(horizon.lang['statis-common']['readFail']);
                        	periodContainer.subtabledoer.instance.mytable.hideProcessing();
                        }
                    });
                }
            },
            operate:{
                opendialog:function(rowdata,type,num,starttime,endtime){
                    var flowid=rowdata.flowId;
                    var flowname=rowdata.flowName;
                    var userid = rowdata.userId;
                    var $dialog = $('#statis-flow-data-container4');
                    var typeEnum = periodContainer.subtabledoer.types[type];
                    periodContainer.subtabledoer.operate.initTable(flowid,starttime,endtime);
                    $dialog.dialog({
                        addCloseBtn: false,
                        closeText: horizon.lang.base['close'],
                        appendTo:'.page-content-area',
                        title: horizon.lang.instance['userTableFlowName']+'：'+flowname +" "+ typeEnum.name +' : '+num,
                        width: $(window).width() > 995?'995':'auto',
                        height: $(window).height() > 640?'640':'auto',
                        maxHeight: $(window).height(),
                        minHeight:'500',
                        destroyAfterClose: false //关闭后自动销毁
                    });
                },
                initTable:function(flowid,starttime,endtime){//弹出框的子表格的初始化
                    if($('#statis-flow-doer-data-sub-operate').data('horizonTable')){
                        periodContainer.subtabledoer.operate.table.pluginTable._fnFilterComplete(periodContainer.subtabledoer.operate.table.pluginTable.fnSettings(), {
                            "sSearch": ''
                        } );
                        var aoServerParams= periodContainer.subtabledoer.operate.table.pluginTable.fnSettings().aoServerParams[1]={
                            "fn": function(aoData){
                                aoData.push({
                                    'name': 'flowId',
                                    'value': flowid
                                });
                                aoData.push({
                                    'name': 'startDate',
                                    'value': starttime
                                });
                                aoData.push({
                                    'name' : 'endDate',
                                    'value': endtime
                                });
                            }
                        };
                        periodContainer.subtabledoer.operate.table.reload(true);
                    }else{
                        periodContainer.subtabledoer.operate.table = $('#statis-flow-doer-data-sub-operate').horizonTable({
                            settings: {
                                height:function(){
                                    return $(".ui-dialog-content").height()-10;
                                },
                                columns:[
                                    {
                                        name : 'action',
                                        title : horizon.lang.instance['userSubtabledoerAction'],
                                        width : '200px',
                                        visible : true,
                                        searchable : false,
                                        multipleSearchable : false,
                                        orderable : false
                                    },
                                    {
                                        name : 'doerCount',
                                        title : horizon.lang.instance['userPlotOperateCount'],
                                        width : '200px',
                                        visible : true,
                                        searchable : false,
                                        multipleSearchable : false,
                                        orderable : false,
                                        columnClass : 'align-left'
                                    }
                                ]

                            },
                            ajaxDataSource: periodContainer.urls.sublistdoerOperate
                        });
                        periodContainer.subtabledoer.operate.initTable(flowid,starttime,endtime);
                    }
                }
            }

        }


    };

    //end同期查询的区域===============
    //非同期=====================
    var notPeriodContainer={
        urls:{
            list:horizon.tools.formatUrl('/statis/flows/notperiod/list'),
            chart:horizon.tools.formatUrl('/statis/flows/notperiod/chart')
        },
        init:function(mark){
            containerinit(this,mark);
        },
        table:{
            display:function(ishidden){
                var container=$('#statis-flow-notperiod-data-container');
                ishidden?container.removeClass('hidden'):container.addClass('hidden');
            },
            init:function(mark){
                notPeriodContainer.table.initTable(mark);
            },
            initTable:function(mark){
                if($('#statis-flow-notperiod-data').data('horizonTable')){
                    var params = periodContainer.table.ajaxDateParam(mark);
                    notPeriodContainer.table.mytable.showProcessing();
                    $.ajax({
                        url: notPeriodContainer.urls.list,
                        cache: false,
                        type:'post',
                        dataType: 'json',
                        data:params,
                        success: function(data) {
                            notPeriodContainer.table.mytable.hideProcessing();
                            notPeriodContainer.table.mytable.pluginTable.fnClearTable(false);
                            for(var i=0;i<data.data.length;i++){
                                var item = data.data[i];
                                notPeriodContainer.table.mytable.pluginTable.fnAddData(item,false);
                            }
                            notPeriodContainer.table.mytable.reload(true);
                        },
                        error: function() {
                        	horizon.notice.error(horizon.lang['statis-common']['readFail']);
                            notPeriodContainer.table.mytable.hideProcessing();
                        }
                    });
                }else{
                    notPeriodContainer.table.mytable =$('#statis-flow-notperiod-data').horizonTable({
                        settings: {
                            title: horizon.lang['statis-common']['tableTitle'],
                            multipleSearchable: false,//高级搜索
                            multipleSearchAreaVisible: false,
                            searchable:false,
                            height:containerSize.height,
                            columns: notPeriodContainer.table.column,
                            fnDrawCallback:function(settings){
                                var api = $('#statis-flow-notperiod-data').dataTable().api();
                                if(api){
                                    var info = api.page.info();
                                    if(info.page==(info.pages-1)){
                                        var $totaltr  = $('#statis-flow-notperiod-data tbody>tr:last');
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
                    var $dataTablesContainer =notPeriodContainer.table.mytable .getPlaceholder().closest('.dataTables_widgetbox');
                    $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                        notPeriodContainer.table.initTable(mark);
                    });
                    notPeriodContainer.table.initTable(mark);
                }

            },
            column:[
                {
                    name : 'statisType',
                    title : horizon.lang.instance['flowStatisType'],
                    width : '150px',
                    visible : false,
                    searchable : false,
                    multipleSearchable : true,
                    orderable : false
                },
                {
                    name : 'startTime',
                    title : horizon.lang.instance['userSubtabledoerStartTime'],
                    width : '150px',
                    visible : false,
                    searchable : false,
                    multipleSearchable : true,
                    orderable : false
                },
                {
                    name : 'endTime',
                    title : horizon.lang.instance['flowEndTime'],
                    width : '150px',
                    visible : false,
                    searchable : false,
                    multipleSearchable : true,
                    orderable : false
                },
                {
                    name : 'flowId',
                    title : horizon.lang.instance['flowFlowId'],
                    width : '150px',
                    visible : false,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : false
                },
                {
                    name : 'flowName',
                    title : horizon.lang.instance['userTableFlowName'],
                    width : '400px',
                    visible : true,
                    searchable : true,
                    multipleSearchable : false,
                    orderable : false,
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        periodContainer.subtable.opendialog(rowData);
                    }
                },
                {
                    name : 'instanceCount',
                    title : horizon.lang.instance['userPlotInstanceCount'],
                    width : '200px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : false,
                    columnClass : 'align-left',
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        periodContainer.subtabledoer.instance.opendialog(rowData,'instanceCount',rowData.instanceCount,rowData.startTime,rowData.endTime);
                    }
                },
                {
                    name : 'operateCount',
                    title : horizon.lang.instance['userPlotOperateCount'],
                    width : '200px',
                    visible : true,
                    searchable : false,
                    multipleSearchable : false,
                    orderable : false,
                    columnClass : 'align-left',
                    fnClick: function(nTd, nTdData, rowData, iRow, i) {
                        periodContainer.subtabledoer.operate.opendialog(rowData,'operateCount',rowData.operateCount,rowData.startTime,rowData.endTime);
                    }
                }
            ]
        },
        plot:{
            display:function(ishidden){
                var container=$('#statis-flow-notperiod-plot-container');
                ishidden?container.removeClass('hidden'):container.addClass('hidden');
            },
            xalias:function(){
                return {1:{text:horizon.lang.instance['userPlotInstanceCount'],name:'instanceCount',type:'0',doer:'instance'},//type表示是否同期
                    2:{text:horizon.lang.instance['userPlotOperateCount'],name:'operateCount',type:'0',doer:'operate'}
                }
            },
            settings:function(mark){
                return {
                    xaxis:notPeriodContainer.plot.xalias(),
                    //data:datas,//没列显示的为xalias.name字段上的值
                    selector:'#statis-flow-notperiod-image-placeholder',//放置图表的容器
                    plotclick:function(tag,xalxs,xalxskey){
                        var startTime=(xalxs.type=='0')?tag.startTime:tag.sameStartTime,
                            endTime=(xalxs.type=='0')?tag.endTime:tag.sameEndTime;
                        periodContainer.subtabledoer[xalxs.doer].opendialog(tag,xalxs.name,tag[xalxs.name],startTime,endTime);
                    },
                    height:containerSize.picHeight,
                    nameField:'flowName',//折线名称字段，在data中的字段,
                    url:notPeriodContainer.urls.chart,
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
                    },
                    ajaxDateParam:periodContainer.table.ajaxDateParam(mark)
                };
            }
        },
        //折线
        line:{
            init:function(mark){
                notPeriodContainer.plot.myChart= horizon.engine.statisplotline.getChart(notPeriodContainer.plot.settings(mark),notPeriodContainer.plot.myChart);
            }
        },
        //柱状
        pillar:{
            init:function(mark){
                notPeriodContainer.plot.myChart= horizon.engine.statisplotline.getBarChart(notPeriodContainer.plot.settings(mark),notPeriodContainer.plot.myChart);
            }
        }
    };

    //此方法用来初始化搜索选项
    function initSearcher(){
        //初始化树
        flowtree.init();
        //inittime();
        //timeinit.day();
        for(var item in timeinit){
            timeinit[item]();
        }
        bindUserInput();
        bindSearchButton();
        periodContainer.plot.myChart=null;
        notPeriodContainer.plot.myChart=null;
    }

    return horizon.engine['statisflowmain'] = {
        init : init,
        initSearcher:initSearcher,
        showtime:convertime,
        flowtree:flowtree
    };
}));
