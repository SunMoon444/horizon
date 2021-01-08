/**
 * Created by zhouwf on 2015-5-28.
 */
define(horizon.view.protocolRequireModule, function($){
    var isload = 0;
    var initDataTablesViewInfo = function() {
        //获取高度
        horizon.view.frameHeight = getHeight();
        //隐藏checkbox
        var defaultColumns = horizon.view.defaultViewOptions.columns;
        if(horizon.view.defaultViewOptions.isHaveCheckBox) {
            defaultColumns[0].bVisible = false;
        }
        //初始化视图数据
        horizon.view.dataTable = $('#myDatatable').dataTable( {
            sServerMethod: 'post',
            "bAutoWidth": false,
            "bProcessing": true,
            "sDom": "<'dataTables_widgetbox widget-box no-margin no-border hidden-print' <'dataTables_body widget-body' <'dataTables_main widget-main no-padding' rt> > >",
            "bServerSide": true,
            "iDisplayLength": parseInt(horizon.view.defaultViewOptions.linenum),
            "aLengthMenu": [[10,15,20,30,50,100],[10,15,20,30,50,100]],
            "aaSorting": [],
            "aoColumnDefs": [{
                fnCreatedCell: function(nTd, nTdData, rowData, iRow, i){
                    var columns = horizon.view.defaultViewOptions.columns;
                    var _html = '';
                    if(horizon.view.defaultViewOptions.isHaveCheckBox && i == 1) {
                        _html = horizon.view.defaultViewOptions.viewCheckbox;
                        var leftIndex = _html.indexOf("|");
                        var rightIndex = _html.lastIndexOf("|");
                        var checkboxField = _html.substring(leftIndex + 1, rightIndex);
                        _html = _html.replace("|", "").replace("|", "").replace(checkboxField, nTdData);
                        $(nTd).html('<label class="position-relative">' + _html + '<span class="lbl"></span></label>');
                        $(nTd).find('input').addClass('ace');
                        return;
                    }
                    var  _style = '', _width = columns[i].sWidth, func = columns[i].func,
                        replaceTextList = columns[i].replaceTextList,
                        replaceRange = columns[i].replaceRange;
                    if(replaceTextList) {
                        var replaceTextArr = replaceTextList.match(/\[[^\]]+\]/g);
                        for(var k = 0, iLen = replaceTextArr.length; k < iLen; k++) {
                            var replaceText = replaceTextArr[k].replace(/\[/g, '').replace(/\]/g, '');
                            var left='', right='';
                            if(replaceText.indexOf('=') != -1) {
                                var arr = replaceText.split('=');
                                left = arr[0];
                                right = arr[1];
                            }else {
                                left = replaceText;
                                right = replaceTextArr[k+1].replace(/\[/g, '').replace(/\]/g, '');
                                k++;
                            }
                            if(nTdData == left) {
                                if(replaceRange == 'cell') {
                                    nTdData = right;
                                    _html = right;
                                }else if (replaceRange == 'row') {
                                    $(nTd).parent().attr('style', right);
                                }
                            }
                        }
                    }
                    if(_width){
                        _width = _width.indexOf('%') > 0 || _width.indexOf('px') > 0?_width : _width + 'px';
                        _style = 'width:' + _width + ';overflow: hidden;text-overflow: ellipsis;word-break: break-all;';
                    }
                    if(func){
                        _style += 'cursor:pointer;';
                        _html = '<label title="' + nTdData + '" style="' + _style + '" class="blue" onclick = "' + func + '">' + nTdData + '</label>';
                    }else if(_width){
                        _html = '<div title="' + nTdData + '" style="' + _style + '">' + nTdData + '</div>';
                    }
                    if(_html) $(nTd).html(_html);
                },"aTargets": ["_all"]
            }],
            "aoColumns": defaultColumns,
            "sAjaxSource": horizon.paths.apppath + '/horizon/view/' + horizon.view.viewDataSource + '.wf'  + window.location.search,
            "sScrollX": "100%",
            "sScrollXInner": "100%",
            "fnServerParams": function(aoDate){
                aoDate.push(
                    {'name': 'viewId', value: horizon.view.viewId}
                );
                aoDate.push(
                    {'name': 'service', value: horizon.view.service}
                );
                aoDate.push(
                    {'name': 'isProtocolPage', value: true}
                );
            },
            "fnDrawCallback": function( settings ) {
                if(isload == 0 && !('ontouchstart' in document.documentElement)){
                	setTimeout(function() {
                    	try{
                        	$('body')[0].focus();
                        }catch(e){}
                    }, 1);
                    var $scrollBody = $('.dataTables_scrollBody');
                    var iHeight = horizon.view.frameHeight - $('.dataTables_scrollHead').outerHeight();
                    $scrollBody.height(iHeight);
                    $scrollBody.ace_scroll({
                        size: iHeight
                    }).css('overflowY', 'hidden').children('.scroll-content').css('overflowX', 'auto').scroll(function() {
                        $('.dataTables_scrollHead')[0].scrollLeft = this.scrollLeft;
                        $scrollBody.children('.scroll-track').css('right', (0-$(this).css('scrollLeft')));
                    });

                    isload++;
                }
            }
        } );
        //添加视图名称
        try{
            $('title').html(horizon.view.defaultViewOptions.viewName);
        }catch(e){}

        //获取单行数据
        horizon.view.getRowData = function(obj) {
            var result = null;
            var $tr = $(obj).closest('tr');
            var index = $tr.index();
            var allDatas = horizon.view.dataTable.fnGetData();
            if(allDatas != null && allDatas.length > 0) {
                result = allDatas[index];
            }
            return result;
        };
        //删除
        horizon.view.deleteData = function(option) {
            /*option = {
             tables: 'a;b;c',//表名,必填
             conditions: '',//条件
             type: 'real',//real物理删除,soft软删除,需配置修改各表修改列及值，默认real
             softCondition: '',//type为soft时生效且必填
             dbIdentifier: '',//数据源
             callback: function() {}//回调函数
             };*/
            var $dialogMessage = $(horizon.dialogMessage);
            if(option == null || option == '' || typeof option != 'object' || option.tables == null || option.tables == ''
                || (option.type == 'soft' && (option.softCondition == null || option.softCondition == ''))
                ) {
                $dialogMessage.removeClass('hide').dialog($.extend({
                    dialogText: '参数有误!',
                    dialogTextType: 'alert-danger'
                }, horizon.defaultDialogOption));
                return ;
            }
            if(option.dbIdentifier == null || option.dbIdentifier == '') {
                option.dbIdentifier = horizon.view.defaultViewOptions.dbIdentifier;
            }
            var dialogOption = $.extend({
                buttons: [
                    {
                        html: '删除',
                        'class' : 'btn btn-danger btn-xs',
                        click: function() {
                            $( this ).dialog('close');
                            var $myDatatableProcessing = $('#myDatatable_processing');
                            var $processing = $myDatatableProcessing.children('.processing');
                            var processingHtml = $processing.html();
                            $processing.html('<i class="fa fa-cog fa-spin"></i>正在删除...');
                            $myDatatableProcessing.show();
                            $.ajax({
                                url: horizon.paths.apppath + '/horizon/view/deleteData.wf',
                                data: option,
                                error: function(xhr) {
                                    $processing.html(processingHtml);
                                    $myDatatableProcessing.hide();
                                    $dialogMessage.removeClass('hide').dialog($.extend({
                                        dialogText: '删除失败!错误代码: ' + xhr.status,
                                        dialogTextType: 'alert-danger'
                                    }, horizon.defaultDialogOption));
                                },
                                success: function(data) {
                                    $processing.html(processingHtml);
                                    $myDatatableProcessing.hide();
                                    if(data == 'success') {
                                        var dialogOption = $.extend({
                                            dialogText: '删除成功!',
                                            dialogTextType: 'alert-info',
                                            close: function() {
                                                if(typeof option.callback == 'function') {
                                                    option.callback();
                                                }
                                                horizon.view.dataTable.fnDraw(true);
                                            }
                                        }, horizon.defaultDialogOption);
                                        $dialogMessage.removeClass('hide').dialog(dialogOption);
                                    }else {
                                        $dialogMessage.removeClass('hide').dialog($.extend({
                                            dialogText: '删除失败!',
                                            dialogTextType: 'alert-danger'
                                        }, horizon.defaultDialogOption));
                                    }
                                }
                            });
                        }
                    }
                ]
            }, horizon.defaultDialogOption);
            if(option.type == 'soft') {
                dialogOption.dialogTextType = 'alert-danger';
                dialogOption.dialogText = '确认删除?';
                $dialogMessage.html('<div class="alert alert-info bigger-110 no-margin center"> 确认删除? </div>');
            }else {
                dialogOption.dialogHtml ='<div class="alert alert-danger bigger-110 no-margin center"> 删除后将不可恢复? </div>' +
                    '<div class="space-6"></div><p class="bigger-110 bolder center grey">' +
                    '<i class="ace-icon fa fa-hand-o-right blue bigger-120"></i>' +
                    '是否确认?</p>';
            }
            $dialogMessage.removeClass('hide').dialog(dialogOption);
        };

        $(window).resize(function(){
            horizon.view.frameHeight = getHeight();
            if(!('ontouchstart' in document.documentElement)) {
                var iHeight = getResizeScrollBodyHeight();
                $(".dataTables_scrollBody").height(iHeight)
                    .ace_scroll('update', {size: iHeight})
                    .ace_scroll('enable').ace_scroll('reset');
            }
            horizon.view.dataTable.fnAdjustColumnSizing(false);
        });
    };
    /**@description 计算视图body部分高度*/
    var getResizeScrollBodyHeight = function(){
        var nextHeight = parseInt(horizon.view.frameHeight);
        nextHeight -= parseInt($('.dataTables_scrollHead').outerHeight());//表头高度
        return nextHeight;
    };

    /**@description 获取高度*/
    var getHeight = function(){
        var iHeight = $(window).height();
        return iHeight;
    };
    jQuery(function($){
        initDataTablesViewInfo();
        if(typeof horizon.impl_load == 'function'){
            horizon.impl_load();
        }
    });
});
