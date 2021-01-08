/**
 * Created by zhouwf on 2015-3-30.
 */
define(horizon.view.requireModule, function($) {
    var isload = 0, initDataTablesViewInfo, dt;
    initDataTablesViewInfo = function () {
        //获取高度
        horizon.view.frameHeight = dt.getHeight();
        //初始化视图数据
        horizon.view.dataTable = $('#myDatatable').dataTable({
            sServerMethod: 'post',
            "bAutoWidth": false,
            "bProcessing": true,
            "sDom": dt.sDom(),
            "bServerSide": true,
            "iDisplayLength": parseInt(horizon.view.defaultViewOptions.linenum),
            "aLengthMenu": [[ 10, 15, 20, 30, 50, 100], [10, 15, 20, 30, 50,100]],
            "aaSorting": [],
            "aoColumnDefs": [{
                fnCreatedCell: function (nTd, nTdData, rowData, iRow, i) {
                    var columns = horizon.view.defaultViewOptions.columns;
                    var _html = '';
                    if (horizon.view.defaultViewOptions.isHaveCheckBox && i == 1) {
                        _html = horizon.view.defaultViewOptions.viewCheckbox;
                        var leftIndex = _html.indexOf("|");
                        var rightIndex = _html.lastIndexOf("|");
                        var checkboxField = _html.substring(leftIndex + 1, rightIndex);
                        _html = _html.replace("|", "").replace("|", "").replace(checkboxField, nTdData);
                        $(nTd).html('<label class="position-relative">' + _html + '<span class="lbl"></span></label>');
                        $(nTd).addClass('hidden-print').find('input').addClass('ace');
                        return;
                    }
                    var _style = '', _width = columns[i].sWidth, func = columns[i].func,
                        replaceTextList = columns[i].replaceTextList,
                        replaceRange = columns[i].replaceRange;
                    if (replaceTextList) {
                        var replaceTextArr = replaceTextList.match(/\[[^\]]+\]/g);
                        for (var k = 0, iLen = replaceTextArr.length; k < iLen; k++) {
                            var replaceText = replaceTextArr[k].replace(/\[/g, '').replace(/\]/g, '');
                            var left = '', right = '';
                            if (replaceText.indexOf('=') != -1) {
                                var arr = replaceText.split('=');
                                left = arr[0];
                                right = arr[1];
                            } else {
                                left = replaceText;
                                right = replaceTextArr[k + 1].replace(/\[/g, '').replace(/\]/g, '');
                                k++;
                            }
                            if (nTdData == left) {
                                if (replaceRange == 'cell') {
                                    nTdData = right;
                                    _html = right;
                                } else if (replaceRange == 'row') {
                                    $(nTd).parent().attr('style', right);
                                }
                            }
                        }
                    }
                    if (_width) {
                        _width = _width.indexOf('%') > 0 || _width.indexOf('px') > 0 ? _width : _width + 'px';
                        _style = 'width:' + _width + ';overflow: hidden;text-overflow: ellipsis;word-break: break-all;';
                    }
                    if (func) {
                        _style += 'cursor:pointer;';
                        _html = '<label title="' + nTdData + '" style="' + _style + '" class="blue" onclick = "' + func + '">' + nTdData + '</label>';
                    } else if (_width) {
                        _html = '<div title="' + nTdData + '" style="' + _style + '">' + nTdData + '</div>';
                    }
                    if (_html) $(nTd).html(_html);
                }, "aTargets": ["_all"]
            }],
            "aoColumns": horizon.view.defaultViewOptions.columns,
            "sAjaxSource": horizon.paths.apppath + '/horizon/view/' + horizon.view.viewDataSource + '.wf',
            "sScrollX": "100%",
            "sScrollXInner": "100%",
            "fnServerParams": function (aoDate) {
                aoDate.push(
                    {'name': 'viewId', value: horizon.view.viewId}
                );
                aoDate.push(
                    {'name': 'service', value: horizon.view.service}
                );
                aoDate.push(
                    {'name': 'flowGroup', value: horizon.view.flowGroup||''}
                );
                aoDate.push(
                    {'name': 'flowId', value: horizon.view.flowId||''}
                );
                var locationSearch = decodeURI(window.location.search);
                if (locationSearch) {
                    locationSearch = locationSearch.substr(1);
                    $.each(locationSearch.split('&'), function (i, value) {

                        var param = value.split('=');
                        if ($.inArray(param[0].toLowerCase(), ['viewid', 'service']) != -1) return;
                        aoDate.push(
                            {'name': param[0], value: param[1]}
                        );
                    });
                }
            },
            "fnCreatedRow": function (nRow, aData, iDataIndex) {
                if (horizon.view.defaultViewOptions.isHaveCheckBox) {
                    //创建行时根据view.checkIds判断每行选中状态
                    if (horizon.view.checkIds.length) {
                        var $checkbox = $("input[name='ids']:checkbox", nRow);
                        if ($.inArray($checkbox.val(), horizon.view.checkIds) != -1) {
                            $checkbox[0].checked = true;
                            $(nRow).addClass("selected");
                        }
                    }
                }
            },
            "fnPreSearchCallback": function (settings) {
                if (horizon.view.defaultViewOptions.isHaveCheckBox) {
                    horizon.view.checkIds = [];
                    horizon.view.checkDatas = [];
                }
            },
            "fnPageChangeCallback": function () {
                if (horizon.view.defaultViewOptions.isHaveCheckBox) {
                    if (!$("input[name='pagingMemoryBtn']")[0].checked) {//未开启分页记忆
                        horizon.view.checkIds = [];
                        horizon.view.checkDatas = [];
                    }
                }
            },
            "fnDrawCallback": function (settings) {
                //刷新保持翻页记录
                var displayStart = settings._iDisplayStart,
                    recordsTotal = settings._iRecordsTotal;
                if (displayStart >= recordsTotal && displayStart > 0) {
                    var displayLength = settings._iDisplayLength,
                        totalPage = parseInt(recordsTotal / displayLength) + (recordsTotal % displayLength ? 1 : 0);
                    settings._iDisplayStart = (totalPage - 1) * displayLength;
                    setTimeout(function () {
                        horizon.view.dataTable.fnDraw(true);
                    }, 1);
                    return;
                }
                if (horizon.view.defaultViewOptions.isHaveCheckBox) {
                    $("input[name='checkAll']")[0].checked = false;
                }
                if (!('ontouchstart' in document.documentElement)) {
                    var $scrollBody = $('.dataTables_scrollBody'),
                        $scrollHead = $('.dataTables_scrollHead'),
                        $dataTablesOperator = $('.dataTables_operator_toolbox'),
                        iHeight;
                    if (isload == 0) {
                        setTimeout(function () {
                            $('body')[0].focus();
                        }, 1);
                        iHeight = horizon.view.frameHeight
                            - $('.widget-header:first').outerHeight(true)
                            - $scrollHead.outerHeight(true)
                            - (!$dataTablesOperator.hasClass('hidden') ? $dataTablesOperator.outerHeight(true) : 0)
                            - $('.dataTables_footer').outerHeight(true);
                        $scrollBody.height(iHeight);
                        $scrollBody.ace_scroll({
                            size: iHeight
                        }).css('overflowY', 'hidden').children('.scroll-content').css('overflowX', 'auto').scroll(function () {
                            $scrollHead[0].scrollLeft = this.scrollLeft;
                            $scrollBody.children('.scroll-track').css('right', (0 - $(this).css('scrollLeft')));
                        });
                        isload++;
                    } else {
                        iHeight = dt.getResizeScrollBodyHeight();
                        $scrollBody.height(iHeight);
                        $scrollBody
                            .ace_scroll('update', {size: iHeight})
                            .ace_scroll('enable').ace_scroll('reset');
                    }
                }
            }
        });
        //添加视图名称
        if($("#flowtree-container-view").length>0){
            $('.dataTables_header>div:first').html(horizon.view.defaultViewOptions.viewName);
        }else{
            $('.widget-title:first').html(horizon.view.defaultViewOptions.viewName);
        }
        try {
            $('title').html(horizon.view.defaultViewOptions.viewName);
        } catch (e) {
        }

        //是否添加高级查询
        if (horizon.view.defaultViewOptions.enablequery == '1') {
            dt.addAdvancedSearch();
        }
        //是否添加分页记忆开关, 绑定checkbox点击事件, 加载视图自定义按钮
        if (horizon.view.defaultViewOptions.isHaveCheckBox) {
            dt.addPagingMemoryBtn();
            dt.initCheckboxFun();
            dt.addViewAutoBtns();
        }
        //添加简单搜索提示信息
        dt.initSearchTitle();

        var $firstWidgetToolbar = $('.widget-toolbar:first');
        if (horizon.view.name == 'rightViewFrame') {
            //添加全屏按钮
            $firstWidgetToolbar.append($(dt.btns.parentFullscreen));
            $('a[data-action="parentFullscreen"]').bind('click', function () {
                try {
                    var $parentFullscreen = parent.horizon.operator.rightViewFullscreen();
                    $(this).find('i')[0].className = $parentFullscreen.find('i')[0].className;
                    parent.horizon.operator.initHeight();
                } catch (e) {
                }
            });
            //添加title
            $('.widget-title:first').html(parent.horizon.operator.getRightViewTitle());
        }
        //添加刷新按钮
        $firstWidgetToolbar.append($(dt.btns.reload));
        $('a[data-action="drawView"]').bind('click', function () {
            window.location.reload();
        });

        //是否添加分组
        if ((horizon.view.defaultViewOptions.grouptype == '1'
                && horizon.view.defaultViewOptions.groupfield != null
                && horizon.view.defaultViewOptions.groupfield != '')
            || (horizon.view.defaultViewOptions.grouptype == '0'
                && horizon.view.defaultViewOptions.multipleGroupField != null
                && horizon.view.defaultViewOptions.multipleGroupField.length > 0
            )) {
            $('.dataTables_operator_toolbox').removeClass('hidden');
            $.element.initGroupElementByField($('.dataTables_operator_toolbox'));
        }

        //添加默认提供的视图操作方法
        $.extend(horizon.view, {
            /**获取选中行DOM*/
            getSelectedRows: function () {
                var returnArr = [];
                var allTrs = horizon.view.dataTable.fnGetNodes();
                $.each(allTrs, function (i, tr) {
                    if ($(tr).hasClass('selected')) {
                        returnArr.push(tr);
                    }
                });
                return returnArr;
            },
            /**获取选中行数据*/
            getSelectedDatas: function () {
                return horizon.view.checkDatas;
            },
            /**获取单行数据*/
            getRowData: function (obj) {
                var result = null;
                var $tr = $(obj).closest('tr');
                var index = $tr.index();
                var allDatas = horizon.view.dataTable.fnGetData();
                if (allDatas && allDatas.length) {
                    result = allDatas[index];
                }
                return result;
            },
            /**EXCEL导出*/
            exportExcel: function () {
                var $exportExcelForm = $('#export-excel-form');
                var showHideColumn = arguments.length > 0 && arguments[0].showHideColumn != null ? arguments[0].showHideColumn : false;
                if ($exportExcelForm != null && $exportExcelForm.length > 0) {
                    $exportExcelForm.find('input[name="dataIds"]').val(horizon.view.checkIds.join(';'));
                    $exportExcelForm.find('input[name="service"]').val(horizon.view.service);
                    $exportExcelForm.find('input[name="param"]').val(JSON.stringify(horizon.view.dataTable.fnSettings().oAjaxData));
                    $exportExcelForm.find('input[name="showHideColumn"]').val(showHideColumn);
                } else {
                    var $dataIds = $('<input name="dataIds" value="' + horizon.view.checkIds.join(';') + '"/>');
                    var $service = $('<input name="service" value="' + horizon.view.service + '"/>');
                    var $param = $('<input name="param"/>').val(JSON.stringify(horizon.view.dataTable.fnSettings().oAjaxData));
                    var $showHideColumn = $('<input name="showHideColumn" value="' + showHideColumn + '"/>');
                    var $exportExcelForm = $('<form id="export-excel-form" method="post" class="hidden"></form>')
                        .append($dataIds)
                        .append($service)
                        .append($param)
                        .append($showHideColumn);
                    $exportExcelForm.attr({
                        action: horizon.paths.apppath + '/horizon/view/viewExportExcel.wf'
                    }).appendTo('body');
                }
                $exportExcelForm[0].submit();
            },
            /**删除数据*/
            deleteData: function (option) {
                /*option = {
                 tables: 'a;b;c',//表名,必填
                 conditions: '',//条件
                 type: 'real',//real物理删除,soft软删除,需配置修改各表修改列及值，默认real
                 softCondition: '',//type为soft时生效且必填
                 dbIdentifier: '',//数据源
                 callback: function() {}//回调函数
                 };*/
                var $dialogMessage = $(horizon.dialogMessage);
                if (option == null || option == '' || typeof option != 'object' || option.tables == null || option.tables == ''
                    || (option.type == 'soft' && (option.softCondition == null || option.softCondition == ''))
                ) {
                    $dialogMessage.removeClass('hide').dialog($.extend({
                        dialogText: horizon.lang.view['paramError'],
                        dialogTextType: 'alert-danger'
                    }, horizon.defaultDialogOption));
                    return;
                }
                if (option.dbIdentifier == null || option.dbIdentifier == '') {
                    option.dbIdentifier = horizon.view.defaultViewOptions.dbIdentifier;
                }
                var dialogOption = $.extend({
                    buttons: [
                        {
                            html:horizon.lang.base['delete'],
                            'class': 'btn btn-danger btn-xs',
                            click: function () {
                                $(this).dialog('close');
                                var $myDatatableProcessing = $('#myDatatable_processing');
                                var $processing = $myDatatableProcessing.children('.processing');
                                var processingHtml = $processing.html();
                                $processing.html('<i class="fa fa-cog fa-spin"></i>'+horizon.lang.message['deleting']);
                                $myDatatableProcessing.show();
                                $.ajax({
                                    url: horizon.paths.apppath + '/horizon/view/deleteData.wf',
                                    data: option,
                                    error: function (xhr) {
                                        $processing.html(processingHtml);
                                        $myDatatableProcessing.hide();
                                        $dialogMessage.removeClass('hide').dialog($.extend({
                                            dialogText: horizon.lang.views['deleteFailCode']+ xhr.status,
                                            dialogTextType: 'alert-danger'
                                        }, horizon.defaultDialogOption));
                                    },
                                    success: function (data) {
                                        $processing.html(processingHtml);
                                        $myDatatableProcessing.hide();
                                        if (data == 'success') {
                                            var dialogOption = $.extend({
                                                dialogText: horizon.lang.message['deleteSuccess'],
                                                dialogTextType: 'alert-info',
                                                close: function () {
                                                    if (typeof option.callback == 'function') {
                                                        option.callback();
                                                    }
                                                    horizon.view.dataTable.fnDraw(true);
                                                }
                                            }, horizon.defaultDialogOption);
                                            $dialogMessage.removeClass('hide').dialog(dialogOption);
                                        } else {
                                            $dialogMessage.removeClass('hide').dialog($.extend({
                                                dialogText: horizon.lang.message['deleteFail'],
                                                dialogTextType: 'alert-danger'
                                            }, horizon.defaultDialogOption));
                                        }
                                    }
                                });
                            }
                        }
                    ]
                }, horizon.defaultDialogOption);
                if (option.type == 'soft') {
                    dialogOption.dialogTextType = 'alert-danger';
                    dialogOption.dialogText = horizon.lang.message['deleteConfirm'];
                    $dialogMessage.html('<div class="alert alert-info bigger-110 no-margin center"> '+horizon.lang.message['deleteConfirm'] +'</div>');
                } else {
                    dialogOption.dialogHtml = '<div class="alert alert-danger bigger-110 no-margin center">'+horizon.lang.views['deleteNoRestore']+' </div>' +
                        '<div class="space-6"></div><p class="bigger-110 bolder center grey">' +
                        '<i class="ace-icon fa fa-hand-o-right blue bigger-120"></i>' +
                        horizon.lang.views['isConfirm']+' </p>';
                }
                $dialogMessage.removeClass('hide').dialog(dialogOption);
            },
            /**删除勾选数据*/
            deleteCheckData: function (option) {
                var $dialogMessage = $(horizon.dialogMessage);
                if (option == null || option == '' || typeof option != 'object'
                    || option.tableName == null || option.tableName == ''
                    || option.column == null || option.column == ''
                ) {
                    $dialogMessage.removeClass('hide').dialog($.extend({
                        dialogText: horizon.lang.view['paramError'],
                        dialogTextType: 'alert-danger'
                    }, horizon.defaultDialogOption));
                    return;
                }
                if (!horizon.view.checkIds.length) {
                    $dialogMessage.removeClass('hide').dialog($.extend({
                        dialogText: horizon.lang.message['operateHelp'],
                        dialogTextType: 'alert-danger'
                    }, horizon.defaultDialogOption));
                    return;
                }
                var conditions = option.column + " in ( ";
                $.each(horizon.view.checkIds, function (i, con) {
                    conditions += i == 0 ? '' : ',';
                    conditions += "'" + con + "'";
                });
                conditions += " ) ";
                horizon.view.deleteData(
                    {
                        tables: option.tableName,
                        conditions: conditions,
                        softCondition: option.softCondition,
                        type: option.type,
                        callback: function () {
                            horizon.view.checkIds = [];
                            horizon.view.checkDatas = [];
                        }
                    }
                );
            },
            /**删除勾选数据到回收站*/
            deleteToRecycle: function (option) {
                $.extend(option, {
                    softCondition: "RECYCLE='1'",
                    type: 'soft'
                });
                horizon.view.deleteCheckData(option);
            },
            /**打印*/
            printView: function () {
                var $cloneTable = $('#myDatatable').clone();
                $cloneTable.addClass('table-print').attr({id: '', style: ''})
                    .find('tr').attr('style', '')
                    .find('th').attr('style', '')
                    .find('.dataTables_sizing').attr('style', '');
                var $dialogMessage;
                var hasOverflow = false;
                try {
                    $dialogMessage = parent.horizon.operator.getDialog();
                    if ($dialogMessage && $dialogMessage.length) {
                        if (parent.horizon.operator.hasClass('body', 'overflow-hidden')) {
                            hasOverflow = true;
                            parent.horizon.operator.removeClass('body', 'overflow-hidden');
                        }
                    } else {
                        $dialogMessage = $(horizon.dialogMessage);
                    }
                } catch (e) {
                    $dialogMessage = $(horizon.dialogMessage);
                }
                $dialogMessage.html('').append($cloneTable);
                $dialogMessage.removeClass('hide').removeClass('hidden').dialog({
                    closeText: horizon.lang.base['close'],
                    dialogClass: 'dialog-print',
                    title: '<div class="hidden-print widget-header widget-header-small dialog-message-title"><h4 class="smaller"><i class="ace-icon fa fa-print"></i> '+horizon.lang.base['print']+' </h4></div>',
                    titleHtml: true,
                    width: '100%',
                    height: 'auto',
                    minHeight: $(window).height(),
                    close: function () {
                        if (hasOverflow) {
                            parent.horizon.operator.addClass('body', 'overflow-hidden');
                        }
                        horizon.view.dataTable.fnAdjustColumnSizing(false);
                    }
                });
            }
        });
        $(window).resize(function () {
            dt.resizeWin();
        });
    };
    dt =  {
            /**@description 初始化sDom*/
            sDom: function () {
                var _sDom = "<'dataTables_widgetbox widget-box no-margin no-border hidden-print' " +
                    "<'dataTables_header widget-header' " +
                    "<'dataTables_title widget-title'><'dataTables_toolbar widget-toolbar'><'dataTables_toolbar widget-toolbar'>" +
                    "<'dataTables_filter_toolbar widget-toolbar no-border'" +
                    (horizon.view.defaultViewOptions.enablequery == '1' ? "f" : '') +
                    "> " +
                    "> " +
                    "<'dataTables_body widget-body' " +
                    "<'dataTables_operator_toolbox widget-toolbox clearfix hidden'>" +
                    "<'dataTables_multipleSearch_toolbox widget-toolbox clearfix hidden'> " +
                    "<'dataTables_main widget-main no-padding' <'viewDataBox' rt> >" +
                    "<'dataTables_footer widget-toolbox no-padding' <'row' <'col-xs-4'l i><'col-xs-8'p> > > " +
                    "> " +
                    ">";
                return _sDom;
            },
            /**@description 自定义按钮*/
            btns: {
                advancedSearchBtn: '<label class="hidden-xs">' +
                '<small class="muted smaller-90 grey pointer">'+horizon.lang.base['multipleSearch']+'</small>' +
                '<input name="advancedSearchBtn" class="ace ace-switch ace-switch-4 width-0" type="checkbox">' +
                '<span class="lbl middle" data-lbl="'+horizon.lang.base['switch']+'"></span>' +
                '</label>',
                advancedSearchSubBtn: '<button type="button" class="horizon-btn btn btn-default btn-sm" id="advancedSearchSubBtn"><i class="fa fa-search green hidden-sm hidden-xs"></i><span> '+horizon.lang.base['search']+' </span></button>',
                advancedSearchResetBtn: '<button type="button" class="horizon-btn btn btn-default btn-sm" id="advancedSearchResetBtn"><i class="ace-icon fa fa-undo hidden-sm hidden-xs"></i><span> '+ horizon.lang.base['reset']+' </span></button>',
                pagingMemoryBtn: "<label class=\"hidden-xs\">" +
                "<small class=\"muted smaller-90 grey pointer\">" +horizon.lang.base['pagingMemory']+ "</small>" +
                "<input name=\"pagingMemoryBtn\" class=\"ace ace-switch ace-switch-4 width-0\" type=\"checkbox\">" +
                "<span class=\"lbl middle\" data-lbl=\""+horizon.lang.base['switch']+"\"></span>" +
                "</label>",
                fullscreen: '<a href="#nogo" data-action="fullscreen" class="orange2"><i class="ace-icon fa fa-expand"></i></a>',
                parentFullscreen: '<a href="#nogo" data-action="parentFullscreen" class="orange2"><i class="ace-icon fa fa-expand"></i></a>',
                reload: '<a href="#" data-action="drawView" class="green2"><i class="ace-icon fa fa-refresh"></i></a>'
            },
            /**@description 添加高级查询*/
            addAdvancedSearch: function () {
                //高级搜索开关
                $('.widget-toolbar:eq(1)').append(dt.btns.advancedSearchBtn);
                //初始化高级查询FORM
                $("div.dataTables_multipleSearch_toolbox").html('<form class="form-horizontal no-margin-bottom" onsubmit="return false"><div class="row"></div></form>');

                //添加高级查询内容
                var $container = $('div.dataTables_multipleSearch_toolbox').find('.row');
                $.each(horizon.view.defaultViewOptions.columns, function (index, content) {
                    if (content['bHighSearchable']) {
                        $.element.initAdvancedSearchElementByDataType(content, $container);
                    }
                });

                //添加提交和重置按钮
                var $action = $('<div class="form-group col-sm-4 col-md-3 no-padding align-right pull-right dataTables_multipleSearch_action"></div>');
                $action.append(dt.btns.advancedSearchSubBtn + dt.btns.advancedSearchResetBtn);
                $container.append($action);

                var $advancedSearchForm = $('div.dataTables_multipleSearch_toolbox > form');
                //高级搜索开关点击事件
                $("input[name='advancedSearchBtn']").bind("click", function () {
                    var isChecked = this.checked;
                    $(".dataTables_filter > label:last-child > input").attr("disabled", isChecked);
                    if (!('ontouchstart' in document.documentElement)) {
                        var nextHeight = horizon.view.frameHeight;
                        nextHeight -= $(".widget-header:first").outerHeight(true);//头部高度
                        if (!$('.dataTables_operator_toolbox').hasClass('hidden')) {
                            nextHeight -= $('.dataTables_operator_toolbox').outerHeight(true);
                        }
                        nextHeight -= parseInt($(".dataTables_scrollHead").outerHeight(true));//表头高度
                        nextHeight -= $(".dataTables_footer").outerHeight(true);//底部高度
                        $('body').css('overflowY', 'hidden');
                        $(".dataTables_multipleSearch_toolbox").toggleClass('hidden');
                        $(this).prev().toggleClass('grey');
                        //高级搜索区域高度
                        if (isChecked) {
                            nextHeight -= $('.dataTables_multipleSearch_toolbox').outerHeight(true);
                        }
                        $(".dataTables_scrollBody").height(nextHeight);
                        horizon.view.dataTable.fnAdjustColumnSizing(false);
                    }
                    var oSettings = horizon.view.dataTable.fnSettings();
                    if (!isChecked) {//关闭高级搜索时清空高级搜索项
                        var columns = oSettings.aoColumns, preColSearch = oSettings.aoPreSearchCols;
                        for (var i = 0, iLen = columns.length; i < iLen; i++) {
                            if (columns[i].bHighSearchable) {
                                preColSearch[i].sSearch = "";
                            }
                        }
                        $advancedSearchForm[0].reset();
                    } else {
                        //打开高级搜索时清空简单搜索项
                        horizon.view.dataTable._fnFilterComplete(oSettings, {
                            "sSearch": ""
                        });
                    }
                    $('.dataTables_scrollHead').css('overflowY', 'hidden');
                    horizon.view.dataTable.fnDraw(false);
                });
                //高级搜索Submit
                $advancedSearchForm.on("submit", function () {
                    try {
                        var columns = horizon.view.dataTable.fnSettings().aoColumns,
                            preColSearch = horizon.view.dataTable.fnSettings().aoPreSearchCols,
                            aoServerParams = horizon.view.dataTable.fnSettings().aoServerParams;
                        aoServerParams.push({
                            "fn": function (aoData) {
                                var columns = horizon.view.dataTable.fnSettings().aoColumns;
                                $.each(columns, function (i, con) {
                                    if (con.bHighSearchable) {
                                        aoData.push({
                                            'name': con.sName + '_dataType',
                                            'value': con.dataType
                                        });
                                    }
                                });
                            }
                        });
                        $.each(columns, function (i, con) {
                            if (con['bHighSearchable']) {
                                var $multiSearchBox = $('div.dataTables_multipleSearch_toolbox');
                                if ($.inArray(con.dataType, [9, 26, 27]) != -1) {
                                    var arr = [];
                                    $multiSearchBox.find("input[name='" + con.sName + "']:checked").each(function () {
                                        arr.push($(this).val());
                                    });
                                    preColSearch[i].sSearch = arr.join(';');
                                } else if ($.inArray(con.dataType, [2, 22, 25, 19, 28, 29]) != -1) {
                                    var selValue = $multiSearchBox.find("*[name='" + con.sName + "']").val();
                                    selValue = typeof selValue == 'object' && selValue != null ? selValue.join(';') : selValue;
                                    preColSearch[i].sSearch = selValue;
                                } else if ($.inArray(con.dataType, [3, 7]) != -1) {
                                    preColSearch[i].sSearch = $multiSearchBox.find("*[name='" + con.sName + "']").val().replace(' ~ ', '~');
                                } else {
                                    preColSearch[i].sSearch = $multiSearchBox.find("*[name='" + con.sName + "']").val();
                                }
                            }
                        });
                        if (horizon.view.defaultViewOptions.isHaveCheckBox) {
                            $("input[name='checkAll']")[0].checked = false;
                            horizon.view.checkIds = [];
                            horizon.view.checkDatas = [];
                        }
                        horizon.view.dataTable.fnDraw(false);
                    } catch (e) {
                        alert(e.message)
                    }
                    return false;
                }).on('reset', function () {
                    $advancedSearchForm.find('input[type="hidden"]').val('');
                    $advancedSearchForm.find('select').val('').trigger('chosen:updated.chosen');
                });
                $('#advancedSearchSubBtn').on('click', function () {
                    $advancedSearchForm.submit();
                });
                $('#advancedSearchResetBtn').on('click', function () {
                    $advancedSearchForm[0].reset();
                });
            },
            /**@description 添加分页记忆按钮*/
            addPagingMemoryBtn: function () {
                $('.widget-toolbar:eq(1)').append(dt.btns.pagingMemoryBtn);
                //分页记忆开关点击事件
                $(document).on('click', 'input[name="pagingMemoryBtn"]', function () {
                    $(this).prev().toggleClass('grey');
                    horizon.view.checkIds = [];
                    horizon.view.checkDatas = [];
                    $("input[name='ids']:checked").each(function () {
                        var $checkbox = $(this);
                        horizon.view.checkIds.push($checkbox.val());
                        horizon.view.checkDatas.push(horizon.view.getRowData($checkbox));
                    });
                });
            },
            /**@description 初始化checkbox点击方法*/
            initCheckboxFun: function () {
                //全选功能
                $(document).on('click', 'th label input[name="checkAll"]', function () {
                    var that = this;
                    if (!horizon.view.dataTable.fnGetData().length) return;
                    var thIndex = $(this).closest('th').index();
                    $(horizon.view.dataTable.fnGetNodes()).each(function () {
                        var $this = $(this);
                        var $idsCheckBox = $this.find('td:eq(' + thIndex + ') > label > input[name="ids"]');
                        if ($idsCheckBox[0].checked == that.checked) return;
                        $idsCheckBox[0].checked = that.checked;
                        if (that.checked) {
                            horizon.view.checkIds.push($idsCheckBox.val());
                            horizon.view.checkDatas.push(horizon.view.getRowData($idsCheckBox));
                            $idsCheckBox.closest('tr').addClass("selected");
                        } else {
                            if (!$("input[name='pagingMemoryBtn']")[0].checked) {//未开启分页记忆
                                horizon.view.checkIds = [];
                                horizon.view.checkDatas = [];
                            } else {
                                var index = $.inArray($idsCheckBox.val(), horizon.view.checkIds);
                                if (index != -1) {
                                    horizon.view.checkIds.splice(index, 1);
                                    horizon.view.checkDatas.splice(index, 1);
                                }
                            }
                            $idsCheckBox.closest('tr').removeClass('selected');
                        }
                    });
                });
                //checkbox点击事件
                $(document).on('click', 'td label input[name="ids"]:checkbox', function () {
                    var $this = $(this);
                    if ($this[0].checked) {
                        horizon.view.checkIds.push($this.val());
                        horizon.view.checkDatas.push(horizon.view.getRowData($this));
                        if (!$this.closest('tr').hasClass("selected")) {
                            $this.closest('tr').addClass("selected");
                        }
                    } else {
                        var index = $.inArray($this.val(), horizon.view.checkIds);
                        horizon.view.checkIds.splice(index, 1);
                        horizon.view.checkDatas.splice(index, 1);
                        $this.closest('tr').removeClass("selected");
                        $('th label input[name="checkAll"]:checkbox')[0].checked = false;
                    }
                });
            },
            /**@description 添加视图定制按钮*/
            addViewAutoBtns: function () {
                //添加视图自定义按钮
                var btnJS = '';
                $('.dataTables_operator_toolbox').removeClass('hidden');
                $.each(horizon.view.defaultViewOptions.buttons.reverse(), function (i, btnInfo) {
                    var $btn = $('<button class="horizon-btn btn btn-default btn-sm pull-right" id="' + btnInfo.id + '" ' + btnInfo.buttonHtml + ' >' +
                        '<i class="hidden-xs blue ace-icon ' + (btnInfo.buttonIcon == null || btnInfo.buttonIcon == '' ? 'fa fa-coffee' : btnInfo.buttonIcon) + '"></i> ' +
                        '<span>' + btnInfo.buttonName + '</span></button>');
                    if (btnInfo.script) {
                        btnJS += btnInfo.script;
                    }
                    $btn.bind('click', function () {
                        eval(btnInfo.func);
                    });
                    $('.dataTables_operator_toolbox').append($btn);
                });
                if (btnJS) {
                    eval('(0 ? 0 : ' + btnJS + ')');
                }
            },
            /**@description 计算视图body部分高度*/
            getResizeScrollBodyHeight: function () {
                var nextHeight = horizon.view.frameHeight;
                nextHeight -= $(".widget-header:first").outerHeight(true);//头部高度
                //高级搜索区域高度
                if ($("input[name='advancedSearchBtn']").length && $("input[name='advancedSearchBtn']")[0].checked) {
                    nextHeight -= $(".dataTables_multipleSearch_toolbox").outerHeight(true);
                }
                if (!$('.dataTables_operator_toolbox').hasClass('hidden')) {
                    nextHeight -= $('.dataTables_operator_toolbox').outerHeight(true);
                }
                nextHeight -= $(".dataTables_scrollHead").outerHeight(true);//表头高度
                nextHeight -= $(".dataTables_footer").outerHeight(true);//底部高度
                if (horizon.tools.browser.browser === 'IE') {
                    nextHeight -= 1;
                }
                return nextHeight;
            },
            /**@description on window resize*/
            resizeWin: function () {
                horizon.view.frameHeight = dt.getHeight();
                if (!('ontouchstart' in document.documentElement)) {
                    var iHeight = dt.getResizeScrollBodyHeight();
                    $('.dataTables_scrollBody').height(iHeight)
                        .ace_scroll('update', {size: iHeight})
                        .ace_scroll('enable').ace_scroll('reset');
                }
                horizon.view.dataTable.fnAdjustColumnSizing(false);
                $('.dataTables_scrollBody .scroll-content')[0].scrollLeft = 0;
            },
            /**@description 获取高度*/
            getHeight: function () {
                var iHeight = $(window).height();
                if($("#flowtree-container-view").length>0){
                    iHeight -= parseInt($('.page-content').css('paddingTop')) * 2-2
                }
                return iHeight;
            },
            /**@description 获取宽度*/
            getWidth: function () {
                var iWidth = $(window).width() - 32;
                return iWidth;
            },
            /**
             * @description 添加简单搜索提示信息
             */
            initSearchTitle: function () {
                var text = [];
                $.each(horizon.view.defaultViewOptions.columns, function (index, content) {
                    if (content['bSearchable'] && content['bVisible']) {
                        text.push(content.sTitle);
                    }
                });
                $('#myDatatable_filter').find('input[type="search"]').attr('title',  horizon.lang.views['accordingTo'] + text.join(', ') + horizon.lang.base['search']);
            }

    };


    jQuery(function($){

        initDataTablesViewInfo();
        if(typeof horizon.impl_load == 'function'){
            horizon.impl_load();
        }
    });
});
