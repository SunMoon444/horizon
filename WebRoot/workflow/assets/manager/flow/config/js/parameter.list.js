/**
 * 页面参数
 * @author chengll
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonTable','jqueryForm','gritter'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    var table = {
        initTable : function() {
            table.mytable = $('#myTable').horizonTable(
                {
                    settings : {
                        title : '信息列表',
                        searchable : false,
                        columns : [ {
                            name : 'name',
                            title : '参数名称',
                            width : '200px',
                            orderable: false,
                            columnClass : 'align-left',
                            fnClick : parameter.updatePara
                        }, {
                            name : 'value',
                            title : '参数值',
                            width : '400px',
                            orderable: false,
                            columnClass : 'align-left'
                        } ],
                        height: function() {
                            var _height = horizon.tools.getPageContentHeight(),
                                $pageHeader = $('.page-header');
                            if($pageHeader.css('display') != 'none') {
                                _height -= $pageHeader.outerHeight(true);
                            }
                            return _height;
                        }
                    },
                    ajaxDataSource : horizon.tools.formatUrl('/config/parameter/page')
                });
        }
    };
    var parameter = {
        updatePara: function() {
            $('#myInfo').removeClass('hidden');
            var rowData = arguments[2];
            $('#myForm input[name="paraName"]').val(rowData.name);
            $('#myForm input[name="paraValue"]').val(rowData.value);
            $('#myForm input[name="paraName"]').attr('readOnly', true).addClass('ignore');

            $('.form-group').removeClass('has-error');
            $('label[id*="-error"]').html('');
            $('#myInfo').dialog({
                width: 700,
                title: '参数信息 ',
                closeText: '关闭',
                buttons: [
                    {
                        html: '保存',
                        "class": "btn btn-primary btn-xs",
                        click: function() {
                            table.mytable.showProcessing();
                            parameter.upd($('#myForm input[name="paraName"]').val(), $('#myForm input[name="paraValue"]').val());
                        }
                    }
                ]
            });
        },
        upd: function(namePa,valuePa){
            $.ajax({
                url: horizon.tools.formatUrl('/config/parameter/update'),
                cache: false,
                dataType: 'json',
                type: 'post',
                data: {
                    "name": namePa,
                    "value": valuePa
                },
                error: function() {
                    table.mytable.hideProcessing();
                    $.gritter.add({
                        title: '提示信息',
                        text: '操作错误，请联系管理员！',
                        class_name: 'gritter-error'
                    });
                },
                success: function(data) {
                    table.mytable.hideProcessing();
                    if(data.restype == 'success'){
                        $.gritter.add({
                            title: '提示信息',
                            text: '修改成功',
                            class_name: 'gritter-success'
                        });
                        $('#myInfo').dialog('close');
                        table.mytable.reload();
                    }else{
                        $.gritter.add({
                            title: '提示信息',
                            text: '修改失败！',
                            class_name: 'gritter-error'
                        });
                    }
                }
            });
        }
    };
    return horizon.engine['parameter'] = {
        initTable: table.initTable
    };
}));