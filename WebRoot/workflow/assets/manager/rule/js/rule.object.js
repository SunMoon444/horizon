/**
 * 规则对象库
 *
 * @author mawr
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonTable' , 'jqueryValidateAll', 'jqueryForm', 'chosenJquery', 'gritter'], factory);
    }else {
        factory();
    }
}(function() {
    "use strict";
    var $dialog = $('#ruleobject-dialog');
    var table = {
        init:function() {
            table.mytable = $('#ruleobjectDatatable').horizonTable({
                settings: {
                    title: horizon.lang['base']['infoList'],
                    multipleSearchable : true,
                    height: function() {
                        var _height = horizon.tools.getPageContentHeight(),
                            $pageHeader = $('.page-header');
                        if($pageHeader.css('display') != 'none') {
                            _height -= $pageHeader.outerHeight(true);
                        }
                        return _height;
                    },
                    checkbox: 0,
                    columns : [
                        {
                            dataProp : 'id'
                        },
                        {
                            name : 'objectName',
                            title : horizon.lang['rule-object']['columnsRuleObjectName'],
                            width : '350px',
                            searchable : true,
                            multipleSearchable : true,
                            fnClick : operate.openFrom
                        },
                        {
                            name : 'objectCode',
                            title : horizon.lang['rule-object']['columnsRuleObjectCode'],
                            width : '350px',
                            searchable : true,
                            multipleSearchable : true
                        },
                        {
                            name : 'objectType',
                            title : horizon.lang['rule-object']['columnsRuleObjectClass'],
                            width : '200px',
                            searchable : true
                        }
                    ],
                    buttons:[
                        {
                            id: 'add',
                            text: horizon.lang['base']['new'],
                            icon: 'fa fa-plus green',
                            fnClick: function() {
                                operate.openFrom();
                            }
                        },
                        {
                            id: 'delete',
                            text: horizon.lang['base']['delete'],
                            icon: 'fa fa-times red2',
                            fnClick: function() {
                                var ids = table.mytable.checkRowKeyArray;
                                if(!ids.length){
                                    if($('.gritter-item-wrapper').length > 0){
                                            	horizon.notice.error(horizon.lang['message']['deleteHelp']);
                                    }else{
                                    	horizon.notice.error(horizon.lang['message']['deleteHelp']);
                                    }
                                }else{
                                    $dialog.dialog({
                                        closeText:horizon.lang['base']['close'],
                                        title:horizon.lang['message']['title'],
                                        dialogText:horizon.lang['rule-object']['youSureToDelete'],
                                        dialogTextType:'alert-danger',
                                        buttons:[
                                            {
                                                html:horizon.lang['base']['ok'],
                                                "class" : "btn btn-primary btn-xs",
                                                click: function() {
                                                    table.mytable.showProcessing();
                                                    operate.del(ids.join(';'));
                                                    $( this ).dialog( "close" );
                                                }
                                            }
                                        ]
                                    });
                                }
                            }
                        }
                    ]
                },
                ajaxDataSource: horizon.tools.formatUrl('/rule/page')
            });
        }
    };
    var operate = {
        initSelect : function(value) {
            var $validObj = $('select[name="validObj"]');
            $validObj.children().remove();
            $.ajax({
                url: horizon.tools.formatUrl('/rule/code'),
                dataType:'json',
                cache: false,
                error:function() {
                	horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success:function(data) {
                    $.each(data,function(i,objectCode){
                        var $option = $('<option value="' + objectCode + '">' + objectCode + '</option>');
                        $validObj.append($option);
                    });
                    if(value) {
                        $validObj.val(value);
                    }
                    if($validObj.data('chosen')) {
                        $validObj.trigger('chosen:updated');
                    }else {
                        $validObj.chosen({
                            no_results_text: horizon.lang['rule-object']['noFind'],
                            allow_single_deselect:true
                        });
                    }
                }
            });
            $('input[name="objectCode"]').focusout(function() {
                var val = $(this).val();
                $validObj.find('#new').remove();
                $('select[name="validObj"]').append($('<option id="new" value="' + val + '">' + val + '</option>'));
                $('select[name="validObj"]').trigger('chosen:updated');
            });
        },
        openFrom : function() {
            var $textarea = $('textarea[name="objectInput"]');
            $('input[name="id"]').val('');
            $textarea.html('');
            var $validate = operate.checkForm();
            $validate.resetForm();
            $('.form-group').removeClass('has-error');
            //回显数据
            var $form = $('#ruleObjectForm');
            if(arguments[2]) {
                $.each(arguments[2], function(key, value) {
                    $form.find('input[name="' + key + '"]').val(value);
                });
                $('select[name="objectType"]').val(arguments[2].objectType);
                $('select[name="returnType"]').val(arguments[2].returnType);
                $textarea.val(arguments[2].objectInput);
                if(arguments[2].objectInput.indexOf('&') > -1){
                    var $div = $('#ruleobject-dialog');
                    $div.html(arguments[2].objectInput);
                    var html = $div.text();
                    $textarea.val(html);
                    $div.html('');
                }
            }
            var $validBds = $('select[name="validBds"]');
            var $validObj = $('select[name="validObj"]');
            $('#ruleObjectFormContainer').dialog({
                width: $(window).width() > 700?'700':'auto',
                height: 'auto',
                maxHeight: $(window).height(),
                title:horizon.lang['rule-object']['objectInformation'],
                closeText:horizon.lang['base']['cancel'],
                buttons:[
                    {
                        html: horizon.lang['base']['ok'],
                        "class" : "btn-primary",
                        click: function() {
                            $form.submit();
                        }
                    },
                    {
                        html: horizon.lang['base']['reset'],
                        "class" : "btn-yellow",
                        click: function() {
                            $validate.resetForm();
                            $('.form-group').removeClass('has-error');
                            $('.chosen-select').trigger('chosen:updated');
                        }
                    }
                ]
            });
            if(arguments[2]) {
                var validBds = arguments[2].validBds.split(',');//运算符
                var validObj = arguments[2].validObj.split(',');//适用对象
                //回显适用对象
                operate.initSelect(validObj);
                //回显适用运算符
                $validBds.val(validBds);
            }else {
                operate.initSelect();
            }
            if($validBds.data('chosen')) {
                $validBds.trigger('chosen:updated');
            }else {
                $validBds.chosen({
                    no_results_text: horizon.lang['rule-object']['noFind'],
                    allow_single_deselect:true
                });
            }
        },
        checkForm: function() {
            return $('#ruleObjectForm').validate({
                focusInvalid: false,
                rules: {
                    objectName: {
                        remote:{
                            url:horizon.tools.formatUrl('/rule/check/objectname'),
                            cache: false,
                            data:{
                                objectName: function() {
                                    return $('#ruleObjectForm').find('input[name="objectName"]').val();
                                },
                                id: function() {
                                    return $('#ruleObjectForm').find('input[name="id"]').val();
                                }
                            }
                        }
                    },
                    objectCode: {
                        remote:{
                            url:horizon.tools.formatUrl('/rule/check/objectcode'),
                            cache: false,
                            data:{
                                objectName: function() {
                                    return $('#ruleObjectForm').find('input[name="objectCode"]').val();
                                },
                                id: function() {
                                    return $('#ruleObjectForm').find('input[name="id"]').val();
                                }
                            }
                        }
                    }
                },
                messages: {
                    objectName: {
                        remote: horizon.lang['rule-object']['objectNameExists']
                    },
                    objectCode: {
                        remote: horizon.lang['rule-object']['objectCodeExists']
                    }
                },
                errorClass: 'help-block col-xs-12 col-sm-reset inline',
                errorPlacement: function (error, element) {
                    error.insertAfter(element.closest('div[class*="col-"]'));
                },
                highlight : function(e) {
                    $(e).closest('.form-group').addClass('has-error');
                },
                success : function(e) {
                    $(e).closest('.form-group').removeClass('has-error');
                    $(e).remove();
                },
                submitHandler: function (form) {
                    table.mytable.showProcessing();
                    $(form).ajaxSubmit({
                        url: horizon.tools.formatUrl('/rule/save'),
                        dataType: 'json',
                        type: 'POST',
                        cache: false,
                        error: function() {
                            table.mytable.hideProcessing();
                            horizon.notice.error(horizon.lang['message']['operateError']);
                        },
                        success: function(data) {
                            table.mytable.hideProcessing();
                            if(data.restype == "success") {
                            	horizon.notice.success(horizon.lang['message']['saveSuccess']);
                                $('#ruleObjectFormContainer').dialog('close');
                                table.mytable.reload();
                            }else{
                            	horizon.notice.error(horizon.lang['message']['saveFail']);
                            }
                        }
                    });
                }
            });
        },
        del: function(ids) {
            $.ajax({
                url: horizon.tools.formatUrl('/rule/delete'),
                data: {id: ids},
                cache: false,
                dataType:'json',
                error: function(){
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success: function(data) {
                    table.mytable.hideProcessing();
                    if(data.restype == 'success') {
                    	horizon.notice.success(horizon.lang['message']['deleteSuccess']);
                        table.mytable.reload();
                    }else{
                    	horizon.notice.error(horizon.lang['message']['deleteFail']);
                    }
                }
            });
        }
    };
    return horizon.engine['ruleobject'] = {
        init:function(){
            table.init();
            operate.checkForm();
        }
    };
}));
