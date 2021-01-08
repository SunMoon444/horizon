/**
 * 系统用户
 * @author yaodd
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonTablePageDefault', 'gritter','jqueryValidateAll'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    return horizon.engine['userlist'] = {
        initTable: function() {
            horizon.setTablePageDefault();
            $.extend(true, horizon.tablePageDefault, {
                tableObject : '#myDatatable',
                tableSettings: {
                    multipleSearchable: false,
                    columns : [
                        {
                            dataProp : 'id'
                        },
                        {
                            name : 'userName',
                            title : horizon.lang["user-list"]["columnsUserName"],
                            width : '250px',
                            searchable : true,
                            fnClick : horizon.tablePageDefault.info
                        }
                    ]
                },
                tableDataUrl: '/system/user/list',
                deleteUrl: '/system/user/delete',
                infoContainer: '#userInfo',
                infoForm: '#userInfoForm',
                infoFormAction: '/system/user/save',
                initFormValidate : function() {
                    return $(horizon.tablePageDefault.infoForm).validate({
                        rules: {
                            userName:{
                                remote:{
                                    url:horizon.tools.formatUrl('/system/user/checkusername'),
                                    cache: false,
                                    data:{
                                        userName : function(){
                                            return $('#userInfoForm').find('input[name="userName"]').val();
                                        },
                                        id : function(){
                                            return $('#userInfoForm').find('input[name="id"]').val();
                                        }
                                    }
                                }
                            },
                            repassword:{
                                equalTo:"#password"
                            },
                            password:{
                                minlength: 6
                            }
                        },
                        messages: {
                            userName:{
                                remote:horizon.lang["user-list"]["checkUserName"]
                            },
                            repassword:{
                                equalTo:horizon.lang["user-list"]["checkRepassword"]
                            },
                            password:{
                                minlength:horizon.lang["user-list"]["checkPassword"]
                            }
                        },
                        ignore : '.ignore',
                        errorElement: 'div',
                        errorClass: 'help-block col-xs-12 col-sm-reset inline',
                        focusInvalid : false,
                        highlight : function(e) {
                            $(e).closest('.form-group').addClass('has-error');
                        },
                        success : function(e) {
                            $(e).closest('.form-group').removeClass('has-error');
                            $(e).remove();
                        },
                        errorPlacement: function (error, element) {
                            error.insertAfter(element.closest('div[class*="col-"]'));
                        },
                        submitHandler : function(form) {
                            horizon.tablePageDefault.formSubmit();
                        }
                    });
                }
            });
            horizon.tablePageDefault.initTable();
        }
    };
}));