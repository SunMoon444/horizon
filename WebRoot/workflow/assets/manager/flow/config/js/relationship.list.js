/**
 * 相对关系
 * @author chengll
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonTable','jqueryForm', 'gritter', 'validateMessagesZH'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    var $dialog=$('#myDialog');
    var table = {
        initTable: function() {
            table.mytable = $('#myTable').horizonTable({
                settings: {
                    title: '信息列表',
                    searchable:false,
                    columns: [
                        {
                            name: 'name',
                            title: '相对关系名称',
                            width: '200px',
                            orderable: true,
                            columnClass: 'align-left',
                            fnClick : relationship.updateRela
                        },
                        {
                            name: 'data',
                            title: '相对关系类型',
                            width: '80px',
                            orderable: true,
                            columnClass: 'align-center'
                        },
                        {
                            name: 'clazz',
                            title: '相对关系实现类',
                            width: '500px',
                            orderable: false,
                            columnClass: 'align-left'
                        }
                    ],
                    buttons : [ {
                        id : 'add',
                        text : '新建',
                        icon : 'fa fa-plus green',
                        fnClick : function() {
                            relationship.openFrom();
                        }
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
                serverSideData: false
                // data: data['data']
            });
            var $dataTablesContainer = table.mytable.getPlaceholder().closest('.dataTables_widgetbox');
            $dataTablesContainer.unbind().on('reload.ace.widget', function() {
                table.reloadTable();
            });
            table.reloadTable();

        },
        reloadTable:function(){
            table.mytable.showProcessing();
            $.ajax({
                url: horizon.tools.formatUrl('/config/relationship/page'),
                cache: false,
                dataType: 'json',
                success: function(data) {
                    table.mytable.hideProcessing();
                    table.mytable.pluginTable.fnClearTable(false);
                    for(var i=0;i<data.data.length;i++){
                        var item = data.data[i];
                        table.mytable.pluginTable.fnAddData(item,false);
                    }
                    table.mytable.reload();
                },
                error: function() {
                    $.gritter.add({
                        title: '提示信息',
                        text: '数据读取失败，请联系管理员！',
                        class_name: 'gritter-error'
                    });
                    table.mytable.hideProcessing();
                }
            });
        }
    };
    var relationship = {

        openFrom : function() {
            $('#myForm input[name="data"]').removeClass('ignore');
            var $validate = relationship.checkForm();
            $validate.resetForm();

            $('#myForm input[name="name"]')[0].readOnly = false;
            $('#myForm input[name="data"]')[0].readOnly = false;
            $('.form-group').removeClass('has-error');
            var $form = $('#myForm');
            $('#myInfo').dialog({
                width : $(window).width() > 600 ? '600' : 'auto',
                height : 'auto',
                maxHeight : $(window).height(),
                title : '相对关系信息',
                closeText : '取消',
                buttons : [ {
                    html : '确定',
                    "class" : "btn-primary",
                    click : function() {
                        $form.submit();
                    }
                },{
                    html : '重置',
                    "class" : "btn-yellow",
                    click : function() {
                        $validate.resetForm();
                        $('.form-group').removeClass('has-error');
                    }
                } ]
            });
        },
        checkForm : function() {
            return $('#myForm').validate({
                ignore : '.ignore',
                errorClass: 'help-block no-margin-bottom',
                focusInvalid: false,
                rules: {
                    name: {
                        remote:{
                            url : horizon.tools.formatUrl('/config/relationship/validName'),
                            cache: false,
                            data:{
                                data: function(){
                                    return $('#myForm').find('input[name="name"]').val();
                                }
                            }
                        }
                    },
                    data: {
                        digits: true,
                        remote:{
                            url : horizon.tools.formatUrl('/config/relationship/valid'),
                            cache: false,
                            data:{
                                data: function(){
                                    return $('#myForm').find('input[name="data"]').val();
                                }
                            }
                        },
                        min: 1
                    }
                },
                messages: {
                    name: {
                        remote: '该相对关系名称已存在，请重新输入'
                    },
                    data: {
                        digits: '请输入正整数',
                        remote: '该类型已存在，请重新输入',
                        min: '请输入正整数'
                    }
                },
                highlight : function(e) {
                    $(e).closest('.form-group').addClass('has-error');
                },
                success : function(e) {
                    $(e).closest('.form-group').removeClass('has-error');
                    $(e).remove();
                },
                errorPlacement: function (error, element) {
                    //错误信息换行显示
                    var p = $("<p />").append(error);
                    p.appendTo(element.parent());
                },
                submitHandler : function(form) {
                    table.mytable.showProcessing();
                    $(form).ajaxSubmit({
                        url : horizon.tools.formatUrl('/config/relationship/save'),
                        dataType : 'json',
                        type : 'POST',
                        cache: false,
                        error : function() {
                            table.mytable.hideProcessing();
                            $.gritter.add({
                                title : '提示信息',
                                text : '操作错误，请联系管理员 ！',
                                class_name : 'gritter-error'
                            });
                        },
                        success : function(data) {
                            table.mytable.hideProcessing();
                            if (data.restype == "success") {
                                $.gritter.add({
                                    title : '提示信息',
                                    text : '保存成功',
                                    class_name : 'gritter-success'
                                });
                                $('#myInfo').dialog('close');
                                table.reloadTable();
                            } else {
                                $.gritter.add({
                                    title : '提示信息',
                                    text : '保存失败 !',
                                    class_name : 'gritter-error'
                                });
                            }
                        }
                    });
                }
            });
        },

        updateRela: function() {
            $('#myInfo').removeClass('hidden');
            var rowData = arguments[2];
            $.each(rowData,function(i,key){
                $('input[name="' + i + '"]').val(key);
            });

            $('#myForm input[name="name"]').attr('readOnly', true).addClass('ignore');
            $('#myForm input[name="data"]').attr('readOnly', true).addClass('ignore');

            $('.form-group').removeClass('has-error');
            $('label[id*="-error"]').html('');
            $('#myInfo').dialog({
                width: 800,
                title: '参数信息 ',
                closeText: '关闭',
                buttons: [
                    {
                        html: '保存',
                        "class": "btn btn-primary btn-xs",
                        click: function() {
                            relationship.upd($('#myForm input[name="name"]').val(), $('#myForm input[name="data"]').val(),  $('#myForm input[name="clazz"]').val());
                        }
                    }
                ]
            });
        },
        upd: function(namePa, valuePa, classPa){
            $.ajax({
                url: horizon.tools.formatUrl('/config/relationship/update'),
                cache: false,
                dataType: 'json',
                type: 'post',
                data: {
                    "name": namePa,
                    "data": valuePa,
                    "clazz": classPa
                },
                error: function() {
                    $.gritter.add({
                        title: '提示信息',
                        text: '操作错误，请联系管理员！',
                        class_name: 'gritter-error'
                    });
                },
                success: function(data) {
                    if(data.restype == 'success'){
                        $.gritter.add({
                            title: '提示信息',
                            text: '修改成功',
                            class_name: 'gritter-success'
                        });
                        $('#myInfo').dialog('close');
                        table.reloadTable();
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
    return horizon.engine['relationship'] = {
        initTable: table.initTable
    };
}));