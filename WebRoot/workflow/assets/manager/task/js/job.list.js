/**
 * 任务列表
 * @author zhaohuan
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonTable', 'jqueryValidateAll','jqueryForm', 'gritter', 'chosenJquery'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    var $dialog=$('#myDialog');
    var table = {
        initTable: function() {
            table.mytable = $('#myTable').horizonTable({
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
                    columns: [
                        {
                            dataProp: 'id'
                        },
                        {
                            name: 'name',
                            title: horizon.lang['job-list']['taskName'],
                            width: '300px',
                            searchable: true,
                            multipleSearchable: true,
                            fnClick: operate.openForm
                        },
                        {
                            name: 'jobName',
                            title:horizon.lang['job-list']['taskCode'],
                            width: '180px',
                            orderable: false
                        },
                        {
                            name: 'jobGroup',
                            title: horizon.lang['job-list']['taskBlockCode'],
                            width: '180px',
                            orderable: false
                        },
                        {
                            name: 'triggerNum',
                            title: horizon.lang['job-list']['triggersNum'],
                            width: '60px',
                            orderable: false,
                            columnClass: 'align-center'
                        }
                    ],
                    buttons: [
                        {
                            id: 'add',
                            text: horizon.lang['base']['new'],
                            icon: 'fa fa-plus green',
                            fnClick: function() {
                                operate.openForm();
                            }
                        },
                        {
                            id: 'del',
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
                                        title: horizon.lang['message']['title'],
                                        dialogText: horizon.lang['job-list']['confirmDelete'],
                                        dialogTextType:'alert-danger',
                                        closeText:horizon.lang['base']['close'],
                                        buttons: [
                                            {
                                                html: horizon.lang['base']['ok'],
                                                "class": "btn btn-primary btn-xs",
                                                click: function() {
                                                    table.mytable.showProcessing();
                                                    operate.del(ids.join(';'));
                                                    $(this).dialog('close');
                                                }
                                            }
                                        ]
                                    });
                                }
                            }
                        }
                    ]
                },
                ajaxDataSource: horizon.tools.formatUrl('/task/job/page')
            });
        }
    };
    var operate = {
        initForm: function() {
            //验证表单
            operate.checkForm();
            $('select[name="jobRunRecordFlag"]').change(function() {
                var jobRunRecordFlag = $(this).val();
                if(jobRunRecordFlag == '1'){
                    $('.keepdays').removeClass('hidden').find('.form-control').removeClass('ignore');
                }else{
                    $('.keepdays').addClass('hidden').find('.form-control').addClass('ignore').val('');
                }
            });
        },
        openForm: function() {
            $('#myForm')[0].reset();
            $('select[name="jobRunRecordFlag"]').trigger('change');
            $('.keepdays').addClass('hidden');
            $('.form-group').removeClass('has-error');
            $('label[id*="-error"]').html('');
            $('input[name="id"]').val('');
            $('input[name="jobName"]').attr('readOnly', false).removeClass('ignore');
            $('input[name="jobGroup"]').attr('readOnly', false).removeClass('ignore');
            var rowData = arguments[2];
            if(rowData) {
                $.each(rowData,function(i,key){
                    $('#myForm input[name="' + i + '"]').val(key);
                });
                $.each(rowData,function(i,key){
                    $('select[name="' + i + '"]').val(key);
                });
                $.each(rowData,function(i,key){
                    $('textarea[name="' + i + '"]').val(key);
                });
                $('input[name="jobName"]').attr('readOnly', true).addClass('ignore');
                $('input[name="jobGroup"]').attr('readOnly', true).addClass('ignore');
                $('select[name="jobRunRecordFlag"]').trigger('change');
            }
            $('#myInfo').dialog({
                width: $(window).width() > 750 ? '750' : 'auto',
                height: 'auto',
                maxHeight: $(window).height(),
                title: horizon.lang['job-list']['taskInformation'],
                closeText: horizon.lang['base']['close'],
                buttons: [
                    {
                        html: horizon.lang['base']['save'],
                        "class": "btn btn-primary btn-xs",
                        click: function() {
                            $("#myForm").submit();
                        }
                    }
                ]
            });
            //初始化任务触发器、任务参数
            if(rowData) {
                operate.initInfo(rowData.id);
            }else{
                operate.initInfo();
            }
        },
        del: function(ids) {
            $.ajax({
                url: horizon.tools.formatUrl('/task/job/delete'),
                cache: false,
                dataType: 'json',
                data: {
                    ids: ids
                },
                error: function() {
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang.message['operateError']);
                },
                success: function(data) {
                    table.mytable.hideProcessing();
                    if(data.restype == 'success'){
                    	horizon.notice.success(horizon.lang['message']['deleteSuccess']);
                        table.mytable.reload();
                    }else{
                    	horizon.notice.error(horizon.lang['message']['deleteFail']);
                    }
                }
            });
        },
        checkForm: function() {
            $("#myForm").validate({
                ignore: '.ignore',
                errorClass: 'help-block no-margin-bottom',
                focusInvalid: false,
                rules: {
                    name: {
                        checkName: true
                    },
                    jobName: {
                        isCode: true,
                        minlength: 3
                    },
                    jobGroup: {
                        isCode: true,
                        minlength: 3
                    },
                    jobPara: {
                        checkJobPara: true
                    },
                    keepRunRecordDays: {
                        digits: true,
                        min: 1
                    }
                },
                messages: {
                    jobName: {
                        minlength: horizon.lang['job-list']['charactersNum']
                    },
                    jobGroup: {
                        minlength: horizon.lang['job-list']['charactersNum']
                    },
                    keepRunRecordDays: {
                        digits: horizon.lang['job-list']['enterInteger'],
                        min: horizon.lang['job-list']['enterInteger']
                    }
                },
                highlight: function(e) {
                    $(e).closest('.form-group').addClass('has-error');
                },
                success: function(e) {
                    $(e).closest('.form-group').removeClass('has-error');
                    $(e).remove();
                },
                errorPlacement: function (error, element) {
                    error.insertAfter(element.closest('div[class*="col-"]'));
                },
                submitHandler: function(form) {
                    table.mytable.showProcessing();
                    $(form).ajaxSubmit({
                        url: horizon.tools.formatUrl('/task/job/save'),
                        type: 'post',
                        dataType: 'json',
                        cache: false,
                        error: function() {
                            table.mytable.hideProcessing();
                            horizon.notice.error(horizon.lang.message['operateError']);
                        },
                        success: function(data) {
                            table.mytable.hideProcessing();
                            if(data.restype == 'success'){
                            	horizon.notice.success(horizon.lang.message['saveSuccess']);
                                $('#myInfo').dialog('close');
                                table.mytable.reload();
                            }else{
                                var msg = data.msg == '' ?  horizon.lang['message']['saveFail'] : data.msg;
                                horizon.notice.error(msg[0]);
                            }
                        }
                    });
                }
            });
            jQuery.validator.addMethod('checkName', function(value, element) {
                var tel = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
                return tel.test(value);
            }, horizon.lang['job-list']['formatCheckName']);
            jQuery.validator.addMethod("isCode", function(value, element) {
                var tel = /^[A-Za-z0-9]+$/;
                return tel.test(value);
            }, horizon.lang['job-list']['formatIsCode']);
            jQuery.validator.addMethod('checkJobPara', function(value, element) {
                if(value != null && value != ''){
                    var tel = /^([A-Za-z]{1}[A-Za-z0-9]*[=][^=;]+[;])+$/;
                    return tel.test(value);
                }
                return true;
            },horizon.lang['job-list']['parameterFormat'] +':paraN=valueN;');
        },
        initInfo: function(id) {
            var $jobTriggers = $('select[name="jobTriggers"]');
            $jobTriggers.children().remove();
            $.ajax({
                url: horizon.tools.formatUrl('/task/job/getJobInfo'),
                cache: false,
                dataType: 'json',
                data: {
                    id: id
                },
                error: function() {
                	horizon.notice.error(horizon.lang['job-list']['failedGetTriggerList']);
                },
                success: function(data) {
                    if(data){
                        if(data[0].length > 0){
                            $.each(data[0],function(i,trigger){
                                var $option = $('<option value="' + trigger.id + '"' + trigger.isChecked + '>' + trigger.name + '</option>');
                                $jobTriggers.append($option);
                            });
                        }else{
                        	horizon.notice.error(horizon.lang['job-list']['triggerEmpty']);
                        }
                        if($jobTriggers.data('chosen')) {
                            $jobTriggers.trigger('chosen:updated');
                        }else {
                            $jobTriggers.chosen({
                                no_results_text: horizon.lang['job-list']['notFind'],
                                allow_single_deselect:true
                            });
                        }
                    }
                }
            });
        }
    };
    return horizon.engine['job'] = {
        initTable: table.initTable,
        initForm: operate.initForm
    };
}));