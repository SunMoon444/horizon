/**
 * 日历初始化
 * @author yaodd
 */
(function (factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery',
            'horizonTablePageDefault',
            'bootstrapTimepicker',
            'bootstrapDatetimepicker',
            'horizonSelectuser'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    $.validator.addMethod("isEndY", function(value, element) {
        var startYM = $('input[name="startYM"]').val();
        var endYM = $('input[name="endYM"]').val();
        var start = startYM.split('-');
        var end = endYM.split('-');
        if(parseInt(start[0] + start[1],10) > parseInt(end[0] + end[1],10)) {
            return false;
        }else{
            return true;
        }
    }, horizon.lang['calendar-init']['timeValidate']);

    var initForm = function() {
        var $form = $('#calendarInfoForm');
        $form.find('input[name="startYM"], input[name="endYM"]').datetimepicker({
            language: horizon.vars.lang,
            autoclose: true,
            format: 'yyyy-mm',
            startView: 'decade',
            maxView: 'year',
            minView: 'year',
            zIndex: 1050
        });
        $form.find('input[name="startHM"]').timepicker({
            minuteStep: 1,
            defaultTime: '8:00',
            showSeconds: false,
            showMeridian: false
        });
        $form.find('input[name="endHM"]').timepicker({
            minuteStep: 1,
            defaultTime: '17:00',
            showSeconds: false,
            showMeridian: false
        });
        $form.find('input[name="organName"]').unbind().on(horizon.tools.clickEvent(), function() {
            $.horizon.selectUser({
                idField: 'organId',
                cnField: 'organName',
                multiple: false,
                selectUser: false,
                selectGroup: false,
                selectPosition: false,
                group: false,
                position: false,
                fnClose:function() {
                    $('#calendarInfoContainer').closest('.ui-dialog').show().next().show();
                }
            });
            $('#calendarInfoContainer').closest('.ui-dialog').hide().next().hide();
        });
    };
    var formInfo = function() {
        var _option = {
            closeText: horizon.lang['base']['close'],
            title: horizon.lang['calendar-init']['title'],		
            width: $(window).width() > 700?'700':'auto',
            height: 'auto',
            maxHeight: $(window).height(),
            buttons: [
                {
                    html : horizon.lang['base']['ok'],
                    'class' : 'btn-primary',
                    click : function() {
                        $(horizon.tablePageDefault.infoForm).submit();
                    }
                }
            ]
        };
        var $form = $(horizon.tablePageDefault.infoForm);
        var $validate = horizon.tablePageDefault.initFormValidate();
        $validate.resetForm();
        $validate.elements().closest('.form-group').removeClass('has-error');
        $form.find('input:hidden').val('');
        if(arguments.length) {
            var rowData = arguments[2];
            $form.find('input[name="id"]').val(rowData.id);
            $form.find('input[name="startYM"]').val(rowData.startY + '-' + rowData.startM);
            $form.find('input[name="endYM"]').val(rowData.endY + '-' + rowData.endM);
            $form.find('input[name="startHM"]').val(rowData.hourStart + ':' + rowData.minStart);
            $form.find('input[name="endHM"]').val(rowData.hourEnd + ':' + rowData.minEnd);
            $form.find('input[name="organName"]').val(rowData.organName);
            $form.find('input[name="organId"]').val('D_'+rowData.organId);
            $form.find('input[name="startHM"]').timepicker('setTime', rowData.hourStart + ':' + rowData.minStart);
            $form.find('input[name="endHM"]').timepicker('setTime', rowData.hourEnd + ':' + rowData.minEnd);
        }else{
            $form.find('input[name="startHM"]').val('8:00');
            $form.find('input[name="endHM"]').val('17:00');
            $form.find('input[name="startHM"]').timepicker('setTime', '8:00');
            $form.find('input[name="endHM"]').timepicker('setTime', '17:00');
        }
        if(arguments.length) {
            $form.find('input[name="organId"]').attr('autofocus', 'autofocus');
        }else{
            $form.find('input[name="organId"]').attr('autofocus', false);
        }
        $(horizon.tablePageDefault.infoContainer).dialog(_option);
    };

    return horizon.engine['calendarinitlist'] = {
        initTable: function() {
            horizon.setTablePageDefault();
            $.extend(true, horizon.tablePageDefault, {
                tableObject : '#myDatatable',
                tableSettings: {
                    searchable : false,
                    multipleSearchable : false,
                    columns: [
                        {
                            dataProp: 'id'
                        },
                        {
                            searchable: false,
                            orderable: false,
                            title:  horizon.lang['calendar-init']['startYear'],
                            name: 'startY',
                            fnClick: formInfo
                        },
                        {
                            searchable: true,
                            orderable: false,
                            title: horizon.lang['calendar-init']['startMonth'],
                            name: 'startM'
                        },
                        {
                            searchable: true,
                            orderable: false,
                            title: horizon.lang['calendar-init']['endOfYear'],
                            name: 'endY'
                        },
                        {
                            searchable: true,
                            orderable: false,
                            title: horizon.lang['calendar-init']['endOfMonth'],
                            name: 'endM'
                        }
                    ]
                },
                tableDataUrl: '/manager/workcalendar/init/page',
                deleteUrl: '/manager/workcalendar/init/delete',
                infoContainer: '#calendarInfoContainer',
                infoForm: '#calendarInfoForm',
                infoFormAction: '/manager/workcalendar/init/save',
                initFormValidate : function() {
                    return $(horizon.tablePageDefault.infoForm).validate({
                        rules: {
                            startYM: {
                                isEndY: true
                            },
                            endYM: {
                                isEndY: true
                            }
                        },
                        groups: {
                            startYM: 'startYM endYM',
                            endYM: 'startYM endYM',
                            startHM: 'startHM endHM',
                            endHM: 'startHM endHM'
                        },
                        ignore : '.ignore',
                        errorElement: 'div',
                        errorClass: 'help-block col-xs-12 col-sm-reset inline',
                        errorPlacement: function (error, element) {
                            error.insertAfter(element.closest('div[class*="col-"]'));
                        },
                        focusInvalid : false,
                        highlight : function(e) {
                            $(e).closest('.form-group').addClass('has-error');
                        },
                        success : function(e) {
                            $(e).closest('.form-group').removeClass('has-error');
                            $(e).remove();
                        },
                        submitHandler : function(form) {
                            horizon.tablePageDefault.formSubmit();
                        }
                    });
                },
                info : function() {
                    formInfo();
                },
                /**
                 * 删除
                 */
                deleteData : function() {
                    var ids = horizon.tablePageDefault.table.checkRowKeyArray;
                    if (!ids.length) {
                    	horizon.notice.error(horizon.lang['message']['deleteHelp']);
                        return;
                    }
                    var $dialog = $('#dialog-default');
                    $dialog.dialog({
                        closeText : horizon.lang['base']['close'],
                        title : horizon.lang['message']['title'],
                        dialogText :  horizon.lang['message']['deleteConfirm'],
                        dialogTextType : 'alert-danger',
                        buttons : [
                            {
                                html : horizon.lang['base']['ok'],
                                'class' : 'btn-primary',
                                click : function() {
                                    $(this).dialog('close');
                                    horizon.tablePageDefault.table.showProcessing();
                                    var _data = {
                                        id : ids.join(";")
                                    };
                                    var startYArray = [],
                                        startMArray = [],
                                        endYArray = [],
                                        endMArray = [],
                                        organidArray = [];
                                    $.each(horizon.tablePageDefault.table.checkRowDataArray, function(i, row) {
                                        startYArray.push(row['startY']);
                                        startMArray.push(row['startM']);
                                        endYArray.push(row['endY']);
                                        endMArray.push(row['endM']);
                                        organidArray.push(row['organId']);
                                    });
                                    _data['startY'] = startYArray.join(";");
                                    _data['startM'] = startMArray.join(";");
                                    _data['endY'] = endYArray.join(";");
                                    _data['endM'] = endMArray.join(";");
                                    _data['organId'] = organidArray.join(";");
                                    $.ajax({
                                        url: horizon.tools.formatUrl(horizon.tablePageDefault.deleteUrl),
                                        data: _data,
                                        dataType: 'json',
                                        cache: false,
                                        error: function() {
                                            horizon.tablePageDefault.table.hideProcessing();
                                            horizon.notice.error(horizon.lang['message']['operateError']);
                                        },
                                        success: function(data) {
                                            if(data.restype == "success") {
                                                horizon.tablePageDefault.table.reload();
                                                horizon.notice.success(horizon.lang['message']['deleteSuccess']);
                                            }else {
                                                horizon.tablePageDefault.table.hideProcessing();
                                                horizon.notice.error(horizon.lang['message']['deleteFail']);
                                            }
                                        }
                                    });
                                }
                            }
                        ]
                    });
                }
            });
            horizon.tablePageDefault.initTable();
            initForm();
        }
    };
}));