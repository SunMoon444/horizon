/*
 * TABLE页面默认模板基础方法
 * @author zhouwf
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        var scripts = ['jquery', 'horizonJqueryui', 'jqueryValidate', 'jqueryForm', 'horizonTable', 'gritter'];
        define(scripts, factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    // 对话框对象
    var $dialog = $('#dialog-default');
	
    horizon.setTablePageDefault = function() {
        horizon.tablePageDefault = {};
        horizon.tablePageDefault ={
            table : null,
            tableSettings: {
                title:  horizon.lang.base.infoList,
                multipleSearchable: true,
                height : function() {
                    var _height = horizon.tools.getPageContentHeight(),
                        $pageHeader = $('.page-header');
                    if($pageHeader.css('display') != 'none') {
                        _height -= $pageHeader.outerHeight(true);
                    }
                    return _height;
                },
                checkbox : 0,
                columns: [],
                buttons: [
                    {
                        id: 'add',
                        text: horizon.lang.base['new'],
                        icon: 'fa fa-plus green',
                        fnClick: function() {
                            horizon.tablePageDefault.info.apply(this, arguments);
                        }
                    },
                    {
                        id: 'del',
                        text: horizon.lang.base['delete'],
                        icon: 'fa fa-times red2',
                        fnClick: function() {
                            horizon.tablePageDefault.deleteData.apply(this, arguments);
                        }
                    }
                ]
            },
            tableDataUrl: null,
            deleteUrl: null,
            infoUrl: null,
            infoContainer: null,
            infoForm: null,
            infoFormAction: null,
            /**
             * 初始化表格
             */
            initTable: function() {
                horizon.tablePageDefault.table = $(horizon.tablePageDefault.tableObject).horizonTable({
                    settings: horizon.tablePageDefault.tableSettings,
                    ajaxDataSource: horizon.tools.formatUrl(horizon.tablePageDefault.tableDataUrl)
                });
            },
            /**
             * 新建，编辑，查看
             */
            info : function() {
                var _option = {
                    closeText: horizon.lang.base.close,
                    title: horizon.lang.base.baseInfo,
                    width: $(window).width() > 700?'700':'auto',
                    height: 'auto',
                    maxHeight: $(window).height(),
                    buttons: [
                        {
                            html : horizon.lang.base.ok,
                            'class' : 'btn-info',
                            click : function() {
                                $(horizon.tablePageDefault.infoForm).submit();
                            }
                        }
                    ]
                };
                if(horizon.tablePageDefault.infoContainer) {
                    var $form = $(horizon.tablePageDefault.infoForm);
                    var $validate = horizon.tablePageDefault.initFormValidate();
                    $validate.resetForm();
                    $validate.elements().closest('.form-group').removeClass('has-error');
                    $form.find('input:hidden').val('');
                    if(arguments.length) {
                        var rowData = arguments[2];
                        $.each(rowData, function(key, value) {
                            $form.find('[name="' + key + '"]').val(value);
                        });
                    }
                    $(horizon.tablePageDefault.infoContainer).dialog(_option);
                }else {
                    $.ajax({
                        url: horizon.tools.formatUrl(horizon.tablePageDefault.infoUrl),
                        data: {
                            id: arguments.length ? arguments[2].id : ''
                        },
                        error: function() {
                        	horizon.notice.error(horizon.lang.message.operateError);
                        },
                        success: function(data) {
                            $dialog.dialog($.extend(_option,{
                                open: function() {
                                    horizon.tablePageDefault.initFormValidate();
                                },
                                dialogHtml: data
                            }));
                        }
                    });
                }
            },

            /**
             * 表单验证
             */
            initFormValidate : function() {
                return $(horizon.tablePageDefault.infoForm).validate({
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
                    submitHandler : function() {
                        horizon.tablePageDefault.formSubmit();
                    }
                });
            },

            /**
             * 提交表单
             * */
            formSubmit: function() {
            	horizon.notice.loading(horizon.lang.message.executing);
                $(horizon.tablePageDefault.infoForm).ajaxSubmit({
                    url : horizon.tools.formatUrl(horizon.tablePageDefault.infoFormAction),
                    cache : false,
                    dataType: 'json',
                    type : 'post',
                    error : function() {
                         horizon.notice.error(horizon.lang.message.operateError);
                    },
                    success : function(data) {
                        if(data.restype == 'success') {
                            horizon.tablePageDefault.table.reload();
                            if(horizon.tablePageDefault.infoContainer) {
                                $(horizon.tablePageDefault.infoContainer).dialog('close');
                            }else {
                                $dialog.dialog('close');
                            }
                            horizon.notice.success(horizon.lang.message.operateSuccess);
                        }else {
                            if (data.msg) {
                                horizon.notice.error(data.msg[0]);
                            }else {
                                horizon.notice.error(horizon.lang.message.operateFail);
                            }
                        }
                    }
                });
            },

            /**
             * 删除
             */
            deleteData : function() {
                var ids = horizon.tablePageDefault.table.checkRowKeyArray;
                if (!ids.length) {
                	 horizon.notice.error(horizon.lang.message.deleteHelp);
                    return;
                }
                $dialog.dialog({
                    closeText : horizon.lang.base.close,
                    title : horizon.lang.message.title,
                    dialogText : horizon.lang.message.deleteConfirm,
                    dialogTextType : 'alert-danger',
                    buttons : [
                        {
                            html : horizon.lang.base.ok,
                            'class' : 'btn-info',
                            click : function() {
                                $(this).dialog("close");
                                horizon.tablePageDefault.table.showProcessing();
                                $.ajax({
                                    url : horizon.tools.formatUrl(horizon.tablePageDefault.deleteUrl),
                                    data : {
                                        id : ids.join(";")
                                    },
                                    dataType: 'json',
                                    cache: false,
                                    error : function() {
                                        horizon.tablePageDefault.table.hideProcessing();
                                        horizon.notice.error(horizon.lang.message.operateError);
                                    },
                                    success : function(data) {
                                        if (data.restype == "success") {
                                            horizon.tablePageDefault.table.reload();
                                            horizon.notice.success(horizon.lang.message.operateSuccess);
                                        } else {
                                            horizon.tablePageDefault.table.hideProcessing();
                                            horizon.notice.error(horizon.lang.message.operateFail);
                                        }
                                    }
                                });
                            }
                        }
                    ]
                });
            }
        };
    };
}));
