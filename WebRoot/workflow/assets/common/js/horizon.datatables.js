/*
  慧正表格 - DATATABLES
  @author zhouwf
*/
(function (root, factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery', 'datatables'], factory);
    }else if (typeof exports === 'object') {
        factory(require('jquery'), require( 'datatables' ));
    }else {
        factory(root.jQuery);
    }
}(this, function($) {	
    "use strict";
    function resetDataTableOption() {
        /* 重置默认参数 */
        $.extend(true, $.fn.dataTable.defaults, {
            bProcessing: true,
            sScrollX: '100%',
            sScrollXInner: '100%',
            aLengthMenu: [[10,15,20,30,50,100], [10,15,20,30,50,100]],
            language: {
                'searchPlaceholder': 'Search ...',
                'lengthMenu': '_MENU_',
                'infoFiltered': '',
                'search': '<i class="ace-icon fa fa-search dataTables_filter_icon"></i>',
                'processing': '<div class="dataTables_processing_bg"></div><span class="dataTables_processing_verticalalign"></span><span class="dataTables_processing_content"><i class="ace-icon fa fa-spinner fa-spin"></i>  Loading... </span>'
            }
        });
        if('horizon' in window && horizon.vars.lang && horizon.vars.lang.toLowerCase() == 'zh-cn') {
            $.extend(true, $.fn.dataTable.defaults, {
                language: {
                    'searchPlaceholder': '请输入搜索条件',
                    'zeroRecords': '未搜索到符合条件的信息',
                    'emptyTable': '未获取到相关数据',
                    'info': '第 _START_ 至 _END_ 条 共 _TOTAL_ 条',
                    'infoEmpty': '显示第 0 至 0 条 共计 0 条',
                    'paginate': {
                        'previous': '上一页',
                        'next': "下一页"
                    },
                    'processing': '<div class="dataTables_processing_bg"></div><span class="dataTables_processing_verticalalign"></span><span class="dataTables_processing_content"><i class="ace-icon fa fa-spinner fa-spin "></i>  正在加载,请稍后...</span>',
                    'loadingRecords': '正在加载,请稍后...'
                }
            });
        }

        /* 重置默认异常信息提示方式 */
        $.extend($.fn.dataTableExt, {
        	sErrMode: '',
        	errMode: ''
        });
        /* 重置默认样式 */
        $.extend( $.fn.dataTableExt.oStdClasses, {
            'sWrapper': 'horizon-table-wrapper dataTables_wrapper',
            'sFilterInput': 'dataTables_filter_input form-control input-sm',
            'sLengthSelect': 'dataTables_length_select form-control input-sm',
            'sLength': 'dataTables_length inline',
            'sInfo': 'dataTables_info visible-sm-inline visible-md-inline visible-lg-inline'
        } );

        // 重置翻页按钮样式
        if ( $.fn.dataTable.Api ) {
            $.fn.dataTable.defaults.renderer = 'bootstrap';
            $.fn.dataTable.ext.renderer.pageButton.bootstrap = function ( settings, host, idx, buttons, page, pages ) {
                var api = new $.fn.dataTable.Api( settings );
                var classes = settings.oClasses;
                var lang = settings.oLanguage.oPaginate;
                var btnDisplay, btnClass;

                var attach = function( container, buttons ) {
                    var i, ien, node, button;
                    var clickHandler = function ( e ) {
                        e.preventDefault();
                        if ( e.data.action !== 'ellipsis' ) {
                            api.page( e.data.action ).draw( false );
                        }
                    };

                    for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
                        button = buttons[i];

                        if ( $.isArray( button ) ) {
                            attach( container, button );
                        }
                        else {
                            btnDisplay = '';
                            btnClass = '';

                            switch ( button ) {
                                case 'ellipsis':
                                    btnDisplay = '&hellip;';
                                    btnClass = 'disabled';
                                    break;

                                case 'first':
                                    btnDisplay = lang.sFirst;
                                    btnClass = button + (page > 0 ?
                                        '' : ' disabled');
                                    break;

                                case 'previous':
                                    btnDisplay = lang.sPrevious;
                                    btnClass = button + (page > 0 ?
                                        '' : ' disabled');
                                    break;

                                case 'next':
                                    btnDisplay = lang.sNext;
                                    btnClass = button + (page < pages-1 ?
                                        '' : ' disabled');
                                    break;

                                case 'last':
                                    btnDisplay = lang.sLast;
                                    btnClass = button + (page < pages-1 ?
                                        '' : ' disabled');
                                    break;

                                default:
                                    btnDisplay = button + 1;
                                    btnClass = page === button ?
                                        'active' : '';
                                    break;
                            }

                            if ( btnDisplay ) {
                                node = $('<li>', {
                                    'class': classes.sPageButton+' '+btnClass,
                                    'aria-controls': settings.sTableId,
                                    'tabindex': settings.iTabIndex,
                                    'id': idx === 0 && typeof button === 'string' ?
                                        settings.sTableId +'_'+ button :
                                        null
                                } )
                                    .append( $('<a>', {
                                        'href': '#'
                                    } )
                                        .html( btnDisplay )
                                )
                                    .appendTo( container );

                                settings.oApi._fnBindAction(
                                    node, {action: button}, clickHandler
                                );
                            }
                        }
                    }
                };

                attach(
                    $(host).empty().html('<ul class="pagination"/>').children('ul'),
                    buttons
                );
            }
        }
        else {
            // Integration for 1.9-
            $.fn.dataTable.defaults.sPaginationType = 'bootstrap';

            /* API method to get paging information */
            $.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings )
            {
                return {
                    "iStart":         oSettings._iDisplayStart,
                    "iEnd":           oSettings.fnDisplayEnd(),
                    "iLength":        oSettings._iDisplayLength,
                    "iTotal":         oSettings.fnRecordsTotal(),
                    "iFilteredTotal": oSettings.fnRecordsDisplay(),
                    "iPage":          oSettings._iDisplayLength === -1 ?
                        0 : Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
                    "iTotalPages":    oSettings._iDisplayLength === -1 ?
                        0 : Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
                };
            };

            /* Bootstrap style pagination control */
            $.extend( $.fn.dataTableExt.oPagination, {
                "bootstrap": {
                    "fnInit": function( oSettings, nPaging, fnDraw ) {
                        var oLang = oSettings.oLanguage.oPaginate;
                        var fnClickHandler = function ( e ) {
                            e.preventDefault();
                            if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
                                fnDraw( oSettings );
                            }
                        };

                        //Pagination Buttons
                        $(nPaging).append(
                                '<ul class="pagination">'+
                                '<li class="prev disabled"><a href="#"><i class="fa fa-angle-double-left"></i></a></li>'+//first
                                '<li class="prev disabled"><a href="#"><i class="fa fa-angle-left"></i></a></li>'+//next
                                '<li class="next disabled"><a href="#"><i class="fa fa-angle-right"></i></a></li>'+//prev
                                '<li class="next disabled"><a href="#"><i class="fa fa-angle-double-right"></i></a></li>'+//last
                                '</ul>'
                        );
                        var els = $('a', nPaging);
                        $(els[0]).bind( 'click.DT', { action: "first" }, fnClickHandler );//first
                        $(els[1]).bind( 'click.DT', { action: "previous" }, fnClickHandler );//next
                        $(els[2]).bind( 'click.DT', { action: "next" }, fnClickHandler );//prev
                        $(els[3]).bind( 'click.DT', { action: "last" }, fnClickHandler );//last
                        //if you don't want the "first & last" buttons, you can remove the relevant HTML line and event handlers
                    },

                    "fnUpdate": function ( oSettings, fnDraw ) {
                        var iListLength = 5;
                        var oPaging = oSettings.oInstance.fnPagingInfo();
                        var an = oSettings.aanFeatures.p;
                        var i, ien, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);

                        if ( oPaging.iTotalPages < iListLength) {
                            iStart = 1;
                            iEnd = oPaging.iTotalPages;
                        }
                        else if ( oPaging.iPage <= iHalf ) {
                            iStart = 1;
                            iEnd = iListLength;
                        } else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
                            iStart = oPaging.iTotalPages - iListLength + 1;
                            iEnd = oPaging.iTotalPages;
                        } else {
                            iStart = oPaging.iPage - iHalf + 1;
                            iEnd = iStart + iListLength - 1;
                        }

                        for ( i=0, ien=an.length ; i<ien ; i++ ) {
                            // Remove the middle elements
                            $('li:gt(0)', an[i]).filter(':not(.next,.prev)').remove();//ACE

                            // Add the new list items and their event handlers
                            for ( j=iStart ; j<=iEnd ; j++ ) {
                                sClass = (j==oPaging.iPage+1) ? 'class="active"' : '';
                                $('<li '+sClass+'><a href="#">'+j+'</a></li>')
                                    .insertBefore( $('li.next:eq(0)', an[i])[0] )//ACE
                                    .bind('click', function (e) {
                                        e.preventDefault();
                                        oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
                                        fnDraw( oSettings );
                                    } );
                            }

                            // Add / remove disabled classes from the static elements
                            //ACE
                            if ( oPaging.iPage === 0 ) {
                                $('li.prev', an[i]).addClass('disabled');
                            } else {
                                $('li.prev', an[i]).removeClass('disabled');
                            }

                            if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
                                $('li.next', an[i]).addClass('disabled');
                            } else {
                                $('li.next', an[i]).removeClass('disabled');
                            }
                        }
                    }
                }
            } );
        }
    }

    resetDataTableOption();
    
    var clickEvent = horizon.tools.clickEvent();

    function HorizonDatatable($placeholder, options) {

        var table = this;

        //DATATABLE对象
        table.pluginTable = null;
        //选中行CHECKBOX的值集合
        table.checkRowKeyArray = [];
        //选中行DATA集合
        table.checkRowDataArray = [];
        //获取TABLE对象
        table.getPlaceholder = function() {
            return $placeholder;
        };
        //刷新表格 默认为保留翻页, 如不保留翻页传入参数true
        table.reload = function(complete) {
            table.pluginTable.fnDraw(!complete);
        };
        //显示PROCESSING
        table.showProcessing = function() {
            $dataTablesContainer.find('.dataTables_processing').show();
        };
        //隐藏PROCESSING
        table.hideProcessing = function() {
            $dataTablesContainer.find('.dataTables_processing').hide();
        };
        //获取点击列所在行数据
        table.getRowData = function(_this) {
            var allDatas = table.pluginTable.fnGetData();
            if(allDatas != null && allDatas.length > 0) {
                return allDatas[$(_this).closest('tr').index()];
            }
        };
        //打印
        table.print = function() {
            var $cloneTable = table.getPlaceholder().clone();
            $cloneTable.addClass('table-print').attr({id: '', style: ''})
                .find('tr').attr('style', '')
                .find('th').attr('style', '')
                .find('.dataTables_sizing').attr('style', '');
            $('<div></div>').dialog({
                dialogClass: 'dialog-print',
                title:  horizon.lang.base.print,
                dialogHtml: $cloneTable,
                width: '100%',
                height: 'auto',
                minHeight: $(window).height(),
                addCloseBtn: false
            });
        };
        table.setTitle = function(title) {
            _fnSetTitle(title);
        };

        //表格容器
        var $dataTablesContainer,
            //工具栏
            $toolbarContainer,
            //操作栏
            $operatorContainer,
            //分页记忆按钮
            $pagingMemory,
            //高级查询按钮
            $multipleSearch,
            //高级查询容器
            $multipleSearchContainer;

        //工具栏多语言
        var toolbarLang = {
            pagingMemory: '分页记忆',
            multipleSearch: '高级查询',
            multipleSearchSubmit: '搜索',
            multipleSearchReset: '重置',
            switchText: '开&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;关'
        };

        if(horizon.lang.base) {
            $.extend(toolbarLang, {
                pagingMemory:  horizon.lang.base.pagingMemory,
                multipleSearch:  horizon.lang.base.multipleSearch,
                multipleSearchSubmit: horizon.lang.base.search,
                multipleSearchReset: horizon.lang.base.reset,
                switchText: horizon.lang.base['switch']
            });
        }

        //工具栏
        var toolbar = {
            //刷新
            reload: '<a href="#nogo" data-action="reload">' +
                '<i class="ace-icon fa fa-refresh bigger-120"></i>' +
                '</a>',
            //全屏
            fullscreen: '<a href="#nogo" data-action="fullscreen" class="orange2">' +
                            '<i class="ace-icon fa fa-expand bigger-120"></i>' +
                        '</a>',
            //收缩
            collapse: '<a href="#nogo" data-action="collapse">' +
                '<i class="ace-icon fa fa-chevron-up bigger-120"></i>' +
                '</a>',
            //导出EXCEL
            excel: '<a href="#nogo" data-action="excel" class="green">' +
                '<i class="ace-icon fa fa-download bigger-120"></i>' +
                '</a>',
            //打印
            print: '<a href="#nogo" data-action="print">' +
                '<i class="ace-icon fa fa-print bigger-120"></i>' +
                '</a>',
            //分页记忆
            pagingMemory: '<label class="pointer hidden-xs">' +
                    ' <small class=\"muted smaller-90 grey\"> ' +
                        (toolbarLang.pagingMemory) +
                    ' </small> ' +
                    '<input name="pagingMemory" class="ace ace-switch ace-switch-4" onfocus="this.blur()" type="checkbox">' +
                    '<span class="lbl middle" '+
                    'data-lbl="' + toolbarLang.switchText + '"></span>' +
                '</label>',
            //高级查询
            multipleSearch: '<label class="pointer hidden-xs">' +
                    ' <small class=\"muted smaller-90 grey\"> ' +
                    (toolbarLang.multipleSearch) +
                    ' </small> ' +
                    '<input name="multipleSearch" class="ace ace-switch ace-switch-4" onfocus="this.blur()" type="checkbox">' +
                    '<span class="lbl middle" '+
                    'data-lbl=' + toolbarLang.switchText + '></span>' +
                '</label>',
            //高级查询搜索按钮
            multipleSearchSubmit: '<button type="button" class="horizon-btn btn btn-default btn-sm btn-submit">' +
                    '<i class="ace-icon fa fa-search green"></i>' +
                    (toolbarLang.multipleSearchSubmit) +
                '</button>',
            //高级查询重置按钮
            multipleSearchReset: '<button type="button" class="horizon-btn btn btn-default btn-sm btn-reset">' +
                    '<i class="ace-icon fa fa-undo"></i>' +
                    (toolbarLang.multipleSearchReset) +
                '</button>'
        };

        //生成DATATABLE列配置信息
        function _fnMakeDatatableColumn(columns) {
            var dtCols = [];
            $.each(columns, function(i, column) {
                var dtCol = {
                    bSearchable: column.searchable,
                    sClass: column.columnClass,
                    orderable: column.orderable,
                    bVisible: column.visible,
                    sWidth: column.width,
                    mDataProp: column.dataProp?column.dataProp:column.name,
                    sName: column.name
                };
                var title = column.title;
                if(column.title && typeof column.title == 'object') {
                    title = column.title[horizon.vars.lang.toLowerCase()];
                }
                dtCol['sTitle'] = title;
                if(parseInt(options.settings.checkbox) == i) {
                    dtCol['sTitle'] = '<label class="position-relative">' +
                        '<input type="checkbox" class="ace" name="checkAll"/>' +
                        '<span class="lbl"></span></label>';
                    dtCol['name'] = 'checkbox';
                    dtCol['bSearchable'] = false;
                    dtCol['orderable'] = false;
                    if(!dtCol['sClass']) {
                        dtCol['sClass'] = 'center';
                    }
                    dtCol['sClass'] += ' hidden-print';
                    if(!dtCol['sWidth']) {
                        dtCol['sWidth'] = '50px';
                    }
                }
                dtCols.push(dtCol);
            });
            return dtCols;
        }

        //生成DATATABLE的DOM布局
        function _fnMakeDatatableDom() {
            var dom = "<'dataTables_widgetbox widget-box no-margin hidden-print' " +
                            "<'dataTables_header widget-header widget-header-flat' " +
                                "<'dataTables_title widget-title'>" +
                                "<'dataTables_toolbar widget-toolbar no-border'>" +
                                (
                                    options.settings.searchable?
                                        "<'dataTables_filter_toolbar widget-toolbar no-border'f>"
                                        :''
                                ) +
                            ">" +
                            "<'dataTables_body widget-body' " +
                                (
                                    options.settings.buttons && options.settings.buttons.length?
                                        "<'dataTables_operator_toolbox widget-toolbox clearfix align-right'>":''
                                ) +
                                (
                                    options.settings.multipleSearchable?
                                    "<'dataTables_multipleSearch_toolbox hidden-xs widget-toolbox clearfix " +
                                        (
                                            options.settings.multipleSearchAreaVisible?
                                                "'"
                                                :"hidden'"
                                        ) +
                                        "<'form-group col-sm-6 col-md-3 no-padding align-right pull-right dataTables_multipleSearch_action'> " +
                                    ">":''
                                ) +
                                "<'dataTables_main widget-main no-padding' rt>" +
                                "<'dataTables_footer widget-toolbox no-padding' " +
                                    "<'row' " +
                                        "<'col-xs-4'l i><'col-xs-8'p>" +
                                    ">" +
                                ">" +
                            "> " +
                        ">";
            return dom;
        }

        //生成DATATABLE配置信息
        function _fnMakeDatatableOption() {
            var opts = null;
            if(options.settings && options.settings.columns && $.isArray(options.settings.columns)) {
                opts = {
                    aoColumns: _fnMakeDatatableColumn(options.settings.columns),
                    aoColumnDefs: [{
                        fnCreatedCell: function(nTd, nTdData, rowData, iRow, i){
                            var curColumn = options.settings.columns[i],
                                _html = '';
                            if(parseInt(options.settings.checkbox) == i) {
                                var _checked = '';
                                if(options.settings.pagingMemory && $pagingMemory.prop('checked') && $.inArray(nTdData, table.checkRowKeyArray) > -1) {
                                    //开启分页记忆且被勾选
                                    _checked = 'checked';
                                    $(nTd).parent().addClass('selected');
                                }
                                //CHECKBOX列
                                _html = '<label class="position-relative">' +
                                    '<input class="ace" type="checkbox" name="checkbox" value="' + nTdData + '" ' + _checked + '>' +
                                    '<span class="lbl"></span></label>';
                            }else {
                                var _style = '',
                                    _width = curColumn.width,
                                    _fnClick = curColumn.fnClick;
                                if(_width){
                                    _width = _width.indexOf('%') > 0 || _width.indexOf('px') > 0?_width : _width + 'px';
                                    _style = 'width:' + _width + ';overflow: hidden;text-overflow: ellipsis;word-break: break-all;';
                                }
                                if(_fnClick) {
                                    _style += 'cursor:pointer;';
                                }
                                if(_style) {
                                	//yaodd update title中特殊字符转义
                                    _html = '<label title="' + escapeHtml(nTdData) + '" style="' + _style + '"' +
                                        (_fnClick?' class="blue" ' : '') +
                                        '>' + nTdData + '</label>';
                                }
                            }
                            if(_html) {
                                var $ntd = $(nTd);
                                $ntd.html(_html);
                                if(curColumn.fnClick) {
                                    $ntd.children('label.blue').on(clickEvent, function() {
                                        if($.isFunction(curColumn.fnClick)) {
                                            curColumn.fnClick.apply(this, [nTd, nTdData, rowData, iRow, i]);
                                        }else if($.type(curColumn.fnClick) === 'string') {
                                            eval(curColumn.fnClick);
                                        }
                                    });
                                }
                            }
                            if(options.settings.fnCreateCell) {
                                if($.isFunction(options.settings.fnCreateCell)) {
                                    options.settings.fnCreateCell.apply(this, [nTd, nTdData, rowData, iRow, i]);
                                }else if($.type(options.settings.fnCreateCell) === 'string') {
                                    eval(options.settings.fnCreateCell);
                                }
                            }
                        }, 'aTargets': ['_all']
                    }],
                    aaSorting: [],

                    fnDrawCallback: function(settings) {
                        var $dataTablesContainer = table.getPlaceholder().closest('.dataTables_widgetbox');
                        //刷新保持翻页记录
                        if(options.serverSideData) {
                            var displayStart = settings._iDisplayStart,
                                recordsTotal = settings._iRecordsTotal;
                            if(displayStart >= recordsTotal && displayStart > 0) {
                                var displayLength = settings._iDisplayLength,
                                    totalPage = parseInt(recordsTotal/displayLength) + (recordsTotal%displayLength ? 1 : 0);
                                settings._iDisplayStart = (totalPage - 1) * displayLength;
                                setTimeout(function() {
                                    table.pluginTable.fnDraw(true);
                                }, 1);
                                return ;
                            }
                        }
                        if(parseInt(options.settings.checkbox) > -1 && parseInt(options.settings.checkbox) < options.settings.columns.length) {
                            //取消全选状态
                            $dataTablesContainer.find('input[name="checkAll"]')[0].checked = false;
                            if(!(options.settings.pagingMemory && $pagingMemory.prop('checked'))) {
                                //未开启分页记忆
                                table.checkRowKeyArray.length = 0;
                                table.checkRowDataArray.length = 0;
                            }
                        }
                        if(options.settings.fnDrawCallback) {
                            try{
                                if($.isFunction(options.settings.fnDrawCallback)) {
                                    options.settings.fnDrawCallback.apply(this, [settings]);
                                }else if($.type(options.settings.fnDrawCallback) === 'string') {
                                    eval(options.settings.fnDrawCallback);
                                }
                            }catch(e){
                                alert('settings.fnDrawCallback error:' + e.message);
                            }
                        }
                        $dataTablesContainer.trigger('reloaded.ace.widget');
                    }
                };
                if(options.serverSideData) {
                    $.extend(opts, {
                        bServerSide: options.serverSideData,
                        sAjaxSource: options.ajaxDataSource,
                        fnServerParams: function(aoData) {
                            if(options.settings.dbIdentifier) {
                                aoData.push({
                                    'name': 'dbIdentifier',
                                    'value': options.settings.dbIdentifier
                                });
                            }
                            if(!options.ajaxDataParam) return ;
                            for(var key in options.ajaxDataParam) {
                                var value = options.ajaxDataParam[key];
                                if(typeof value === 'function') {
                                    value = value();
                                }
                                aoData.push({
                                    'name': key,
                                    'value': value
                                });
                            }
                        }
                    });
                }else {
                    opts['data'] = options.data;
                }
                opts['sDom'] = _fnMakeDatatableDom();
            }
            if(options.settings && options.settings.pluginSettings) {
                opts = $.extend({}, options.settings.pluginSettings, opts);
            }
           
            return opts;
        }
        //yaodd add   
        function escapeHtml(string) {
            var entityMap = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': '&quot;',
                "'": '&#39;',
                "/": '&#x2F;',
                "%": '&#37;',
                " ": '&nbsp;'
            };
            return String(string).replace(/[&<>"'\/%\s]/g, function(s) {
                return entityMap[s];
            });
        }
        //初始化TITLE
        function _fnSetTitle(title) {
            var _title = null;
            if(title) {
                _title = title;
            }else if(options.settings.title) {
                _title = options.settings.title
            }else {
                return ;
            }
            var $titleContainer = $dataTablesContainer.find('.dataTables_title');
            if(typeof _title == 'string') {
                $titleContainer.html(_title);
            }else if(typeof _title == 'object') {
                $titleContainer.html(_title[horizon.vars.lang.toLowerCase()]);
            }
        }

        //初始化工具栏
        function _fnSetToolbar() {
            $toolbarContainer = $dataTablesContainer.find('.dataTables_toolbar');
            //添加高级查询
            if(options.settings.multipleSearchable) {
                $toolbarContainer.append(toolbar.multipleSearch);
                $multipleSearch = $toolbarContainer.find('input[name="multipleSearch"]');
                $multipleSearchContainer = $dataTablesContainer.find('.dataTables_multipleSearch_toolbox');
                var $action = $multipleSearchContainer.find('.dataTables_multipleSearch_action'),
                    $searchInput = $dataTablesContainer.find('.dataTables_filter_input');
                $multipleSearch.on(clickEvent, function() {
                    $multipleSearchContainer.toggleClass('hidden');
                    $multipleSearch.prev().toggleClass('grey');
                    if($multipleSearch.prop('checked')) {
                        var oSettings = table.pluginTable.fnSettings();
                        table.pluginTable._fnFilterComplete(oSettings, {'sSearch': ''});
                        $searchInput.attr('disabled', 'disabled');
                        table.pluginTable.fnDraw(false);
                    }else {
                        $searchInput.removeAttr('disabled');
                        $action.find('.btn-reset').trigger(clickEvent);
                    }
                    if(!horizon.vars.touch) {
                        $(window).trigger('resize.dataTable');
                    }
                });

                if(options.settings.multipleSearchAreaVisible) {
                    $multipleSearch.prop('checked', true);
                    $searchInput.attr('disabled', 'disabled');
                }
                var _html = '';
                $.each(options.settings.columns, function(index, column){
                    if(column.multipleSearchable) {
                        var title = column.title;
                        if(column.title && typeof column.title == 'object') {
                            title = column.title[horizon.vars.lang.toLowerCase()];
                        }
                        _html += '<div class="form-group col-sm-6 col-md-3 no-padding">' +
                                '<label class="col-sm-4 control-label no-padding-right" title="' + title + '"> ' + title + ' </label>' +
                                '<div class="col-sm-8">' +
                                    '<input type="text" name="' + column.name + '" placeholder="' + title + '" />' +
                                '</div>' +
                            '</div>';
                    }
                });
                $action.wrap('<form class="form-horizontal no-margin-bottom" onsubmit="return false"><div class="row"></div></form>');
                $action.before(_html);
                $action.append(toolbar.multipleSearchSubmit).append(toolbar.multipleSearchReset);
                var $form = $multipleSearchContainer.find('form');
                $action.find('.btn-submit').on(clickEvent, function() {
                    var data = $form.serializeArray(),
                        preColSearch = table.pluginTable.fnSettings().aoPreSearchCols;
                    var num = 0;
                    $.each(options.settings.columns, function(index, column){
                        if(column.multipleSearchable) {
                            preColSearch[index].sSearch = data[num]['value'];
                            num++;
                        }
                    });
                    table.pluginTable.fnDraw(false);
                });
                $action.find('.btn-reset').on(clickEvent, function() {
                    $form[0].reset();
                    $action.find('.btn-submit').trigger(clickEvent);
                });
            }
            //添加分页记忆
            if(parseInt(options.settings.checkbox) > -1
                && parseInt(options.settings.checkbox) < options.settings.columns.length
                && options.settings.pagingMemory) {

                $toolbarContainer.append(toolbar.pagingMemory);
                $pagingMemory = $toolbarContainer.find('input[name="pagingMemory"]');
                $pagingMemory.on(clickEvent, function() {
                    $pagingMemory.prev().toggleClass('grey');
                    if(!$pagingMemory.prop('checked')) {
                        table.checkRowKeyArray.length = 0;
                        table.checkRowDataArray.length = 0;
                        var allData = table.pluginTable.fnGetData();
                        if(!allData.length) {
                            return ;
                        }
                        $placeholder.find('input[name="checkbox"]:checked').each(function() {
                            var $this = $(this);
                            table.checkRowKeyArray.push($this.val());
                            table.checkRowDataArray.push(table.pluginTable.fnGetData( $this.closest('tr')[0] ));
                            $this.addClass("selected");
                        });
                    }
                });
            }
            //添加导出EXCEL
            if(options.settings.excel) {
                $toolbarContainer.append(toolbar.excel);
            }
            //添加打印
            if(options.settings.print) {
                var $print = $(toolbar.print);
                $print.on(clickEvent, function() {
                    table.print();
                });
                $toolbarContainer.append($print);
            }
            //添加全屏按钮
            if(options.settings.fullscreen) {
                $toolbarContainer.append(toolbar.fullscreen);
                $dataTablesContainer.on('fullscreen.ace.widget', function (ev) {
                    if(!horizon.vars.touch) {
                        setTimeout(function() {
                            $(window).trigger('resize.dataTable');
                        }, 1);
                    }else {
                        setTimeout(function() {
                            table.pluginTable.fnAdjustColumnSizing(false);
                        }, 1);
                    }
                });
            }
            //添加刷新按钮
            if(options.settings.reload) {
                $toolbarContainer.append(toolbar.reload);
                $dataTablesContainer.on('reload.ace.widget', function (ev) {
                    table.pluginTable.fnDraw(false);
                });
            }
            //添加收缩按钮
            if(options.settings.collapse) {
                $toolbarContainer.append(toolbar.collapse);
                $dataTablesContainer.on('shown.ace.widget', function (ev) {
                    if(!horizon.vars.touch) {
                        $(window).trigger('resize.dataTable');
                    }else {
                        table.pluginTable.fnAdjustColumnSizing(false);
                    }
                });
            }
            if($toolbarContainer.children().length) {
                $toolbarContainer.removeClass('no-border');
            }
        }

        //添加按钮
        function _fnSetButton() {
            $operatorContainer = $dataTablesContainer.find('.dataTables_operator_toolbox');
            if(options.settings.buttons && options.settings.buttons.length) {
                $.each(options.settings.buttons, function(i, button) {
                    var id = button.id ? button.id : '',
                        text = button.text ? button.text : '',
                        icon = button.icon ? button.icon : 'fa fa-coffee green',
                        btnClass = button.buttonClass ? button.buttonClass : '';
                    if(text && typeof text == 'object') {
                        text = button.text[horizon.vars.lang.toLowerCase()];
                    }
                    var $button = $('<a href="javascript:void(0);" title="' + text + '" id="' + button.id + '" ' +
                                    'class="horizon-btn btn btn-sm btn-default ' + btnClass + '">' +
                                        '<i class="bigger-110 ace-icon ' + icon + ' "></i>' +
                                        '<span class="hidden-xs">' + text + '</span>' +
                                    '</a>');
                    if(button.fnClick) {
                        $button.on(clickEvent, function(e) {
                            if($.isFunction(button.fnClick)) {
                                button.fnClick.call();
                            }else if($.type(button.fnClick) === 'string') {
                                eval(button.fnClick);
                            }
                            this.blur();
                        });
                    }
                    $operatorContainer.append($button);
                });
                $operatorContainer.removeClass('hidden');
            }
        }

        //初始化CHECKBOX点击方法
        function _fnInitCheckboxFun() {
            if(parseInt(options.settings.checkbox) > -1 && parseInt(options.settings.checkbox) < options.settings.columns.length) {
                //全选功能
                $dataTablesContainer.on('click', 'input[name="checkAll"]:first', function() {
                    var _this = this;
                    var allData = table.pluginTable.fnGetData();
                    if(!allData.length) {
                        return ;
                    }
                    var allNode = table.pluginTable.fnGetNodes();
                    var $allNode = $(allNode);
                    if(!(options.settings.pagingMemory && $pagingMemory.prop('checked'))) {
                        //未开启分页记忆
                        table.checkRowKeyArray.length = 0;
                        table.checkRowDataArray.length = 0;
                    }
                    $allNode.each(function(i) {
                        var $this = $(this);
                        if(!$.contains($dataTablesContainer[0], $this[0])) return;
                        var $checkbox = $this.find('input[name="checkbox"]');
                        if(options.settings.pagingMemory && $pagingMemory.prop('checked')) {
                            //开启分页记忆
                            var index = $.inArray($checkbox.val(), table.checkRowKeyArray);
                            if(index > -1) {
                                table.checkRowKeyArray.splice(index, 1);
                                table.checkRowDataArray.splice(index, 1);
                            }
                        }
                        $checkbox[0].checked = _this.checked;
                        if(_this.checked) {
                            table.checkRowKeyArray.push($checkbox.val());
                            table.checkRowDataArray.push(table.pluginTable.fnGetData( $allNode[i] ));
                            $this.addClass("selected");
                        }else {
                            $this.removeClass("selected");
                        }
                    });
                });
                //CHECKBOX点击事件
                $dataTablesContainer.on('click', 'input[name="checkbox"]', function() {
                    var $this = $(this);
                    var $tr = $this.closest('tr');
                    if($this[0].checked) {
                        table.checkRowKeyArray.push($this.val());
                        table.checkRowDataArray.push(table.pluginTable.fnGetData( $tr[0] ));
                        $tr.addClass('selected');
                    }else {
                        var index = $.inArray($this.val(), table.checkRowKeyArray);
                        table.checkRowKeyArray.splice(index, 1);
                        table.checkRowDataArray.splice(index, 1);
                        $tr.removeClass('selected');
                        $dataTablesContainer.find('input[name="checkAll"]:first')[0].checked = false;
                    }
                });
            }
        }

        function _fnGetScrollBodyHeight() {
            var _height;
            if(options.settings.height) {
                if($.type(options.settings.height) === 'string' || $.type(options.settings.height) === 'number') {
                    _height = options.settings.height;
                }else if($.isFunction(options.settings.height)) {
                    if($dataTablesContainer.hasClass('fullscreen')) {
                        _height = $(window).height();
                    }else {
                        _height = options.settings.height();
                    }
                }
                if(_height) {
                    _height = parseInt(_height);
                    _height -= parseInt($dataTablesContainer.css('borderTopWidth'));
                    _height -= parseInt($dataTablesContainer.css('borderBottomWidth'));
                    _height -= $dataTablesContainer.find('.dataTables_header').outerHeight(true);
                    _height -= $dataTablesContainer.find('.dataTables_footer').outerHeight(true);
                    _height -= $dataTablesContainer.find('.dataTables_scrollHead').outerHeight(true);
                    if($operatorContainer) {
                        _height -= $operatorContainer.outerHeight(true);
                    }
                    if($multipleSearchContainer) {
                        _height -= $multipleSearchContainer.outerHeight(true);
                    }
                }
            }
            return _height;
        }

        //初始化高度
        function _fnInitHeight() {
            if(horizon.vars.touch) {
                var _height = _fnGetScrollBodyHeight();
                if(!_height) return;
                $dataTablesContainer.find('.dataTables_scrollBody').css('minHeight', _height);
                table.pluginTable.fnAdjustColumnSizing(false);
            }else {
                $(window)
                    .off('resize.dataTable')
                    .on('resize.dataTable', function() {
                        var _height = _fnGetScrollBodyHeight();
                        if(!_height) return;
                        var $scrollHead = $dataTablesContainer.find('.dataTables_scrollHead');
                        var $scrollBody = $dataTablesContainer.find('.dataTables_scrollBody');
                        $scrollBody.height(_height);
                        if($.fn.ace_scroll) {
                            if(!$scrollBody.data('ace_scroll')) {
                                $scrollBody.ace_scroll({
                                    size: _height
                                }).css('overflowY', 'hidden').children('.scroll-content').css('overflowX', 'auto').scroll(function() {
                                    $scrollHead[0].scrollLeft = this.scrollLeft;
                                    $scrollBody.children('.scroll-track').css('right', (0-$(this).css('scrollLeft')));
                                });
                            }else {
                                $scrollBody.ace_scroll('update', {size: _height})
                                    .ace_scroll('enable').ace_scroll('reset');
                            }

                        }
                        table.pluginTable.fnAdjustColumnSizing(false);
                    });
                setTimeout(function() {
                    $(window).trigger('resize.dataTable');
                }, 100);
            }
        }

        //初始化简单搜索框提示信息
        function _fnInitSearchTitle() {
            if(options.settings.searchable) {
                var text = [];
                $.each(options.settings.columns, function(i, column) {
                    if(column.searchable) {
                        var title = column.title;
                        if(column.title && typeof column.title == 'object') {
                            title = column.title[horizon.vars.lang.toLowerCase()];
                        }
                        text.push(title);
                    }
                });
                $dataTablesContainer.find('.dataTables_filter_input').attr('title', text.join(', '));
            }
        }

        //初始化DATATABLE
        function _fnInitDatatable() {
            var datatableOption = _fnMakeDatatableOption();
            if(!datatableOption) {
                throw new Error(horizon.lang.base.error);
                return;
            }
            table.pluginTable = $placeholder.dataTable(datatableOption);
            $dataTablesContainer = $placeholder.closest('.dataTables_widgetbox');
            //添加TITLE
            _fnSetTitle();
            //工具栏
            _fnSetToolbar();
            //添加按钮
            _fnSetButton();
            //初始化CHECKBOX点击方法
            _fnInitCheckboxFun();
            //初始化高度
            _fnInitHeight();
            //初始化简单搜索框提示信息
            _fnInitSearchTitle();
        }

        //初始化表格
        function _fnInit() {
            if(options.serverSideSettings) {
                $.ajax({
                    url: options.ajaxSettingsSource,
                    data: options.ajaxSettingsParam,
                    dataType: 'json',
                    cache: false,
                    success: function(data) {
                        if(data) {
                            $.extend(options.settings, data);
                        }
                        _fnInitDatatable();
                    }
                });
            }else {
                _fnInitDatatable();
            }
        }

        _fnInit();

        $placeholder.data('horizonTable', table);
    }

    $.horizonDatatable = function(placeholder, options) {
        options = options ? $.extend(true, {}, $.fn.horizonDatatable.defaults, options) : $.fn.horizonDatatable.defaults;
        var horizonTable = new HorizonDatatable($(placeholder), options);
        return horizonTable;
    };

    $.horizonDatatable.version = '1.0.0';

    $.fn.horizonDatatable = function(options) {
        return $.horizonDatatable(this[0], options);
    };

    $.fn.horizonDatatable.defaults = {

        serverSideSettings: false, //服务器加载基础配置
        ajaxSettingsSource: null, //请求基础配置路径
        ajaxSettingsParam: null, //请求基础配置参数

        settings: {
            /**
             * 视图title
             * @examples
             *  title: '查询结果'
             *  or
             *  title: {
             *      en: 'result',
             *      'zh-cn': '查询结果'
             *  }
             * */
            title: null,
            checkbox: -1, //CHECKBOX列下标, 为-1时默认不生成CHECKBOX
            pagingMemory: false, //是否支持分页记忆
            searchable: true, //是否支持搜索
            multipleSearchable: false, //是否支持高级搜索
            multipleSearchAreaVisible: false, //高级搜索区域是否默认展示
            /**
             * 表格容器的高度
             * @examples
             *  height: function() {
             *      return $(window).height();
             *  }
             *  or
             *  height: '600px'
             * */
            height: null,

            reload: true, //刷新
            fullscreen: false, //全屏
            collapse: false, //收缩
            excel: false, //导出EXCEL
            print: false, //打印

            /**
             * columns值为数组, 存放列对象
             * @examples: columns: [
             *                    {
             *                        //表头显示内容
             *                          @examples
             *                              title: '列一'
             *                              or
             *                              title: {
             *                                  en: 'one',
             *                                  'zh-cn': '列一'
             *                              }
             *                        title: null,
             *                        name: null, //名称
             *                        dataProp: null, //匹配DATA中对应KEY的VALUE值
             *
             *                        width: null, //宽度
             *                        visible: true, //是否显示
             *                        searchable: false, //简单搜索
             *                        multipleSearchable: false, //高级搜索
             *                        orderable: false, //点击列排序
             *                        columnClass: null, //列样式
             *                        fnClick: null //ONCLICK方法
             *                    }
             *                ]
             * */
            columns: null,

            /**
             * buttons值为数组, 存放按钮对象
             * @examples: buttons: [
             *                  {
             *                     id: '', //按钮ID
             *                     //按钮文本
             *                          @examples
             *                          text: '按钮一'
             *                          or
             *                          text: {
             *                              en: 'button1',
             *                              'zh-cn': '按钮一'
             *                          }
             *                     text: '',
             *                     icon: 'fa fa-coffee', //图标
             *                     buttonClass: '', //样式
             *                     fnClick: null //ONCLICK方法
             *                  }
             *              ]
             *
             * */
            buttons: null,

            fnCreateCell: null,
            fnDrawCallback: null,

            dbIdentifier: null, //请求数据数据源

            pluginSettings: null
        },

        serverSideData: true, //服务器加载数据
        ajaxDataSource: null, //请求数据路径
        ajaxDataParam: null, //请求数据参数

        data: null //本地数据

    };

}));


