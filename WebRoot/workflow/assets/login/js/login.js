/**
 * Login
 * */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'jqueryValidateAll'], factory);
    } else {
        factory();
    }
}(function () {
    "use strict";
    $.fn.serializeJson = function(){
        var serializeObj={};
        var array=this.serializeArray();
        var str=this.serialize();
        $(array).each(function(){
            if(serializeObj[this.name]){
                if($.isArray(serializeObj[this.name])){
                    serializeObj[this.name].push(this.value);
                }else{
                    serializeObj[this.name]=[serializeObj[this.name],this.value];
                }
            }else{
                serializeObj[this.name]=this.value;
            }
        });
        return serializeObj;
    };
    var login = {
        pageSet: function () {
            if (top != window) {
                top.location = window.location;
            }
            $('input[name="loginName"]').focus();
            $('input[name="password"],input[name="loginName"]').keyup(function (event) {
                if (event.keyCode == '13') {
                    $("#LoginForm").submit();
                }
            });
            // 解决IE下拉框宽度过大
            $('.loginInner select.form-control').mousedown(function () {
                var $focus = $(':focus');
                if (!$focus.is('.loginInner select.form-control')) {
                    $focus.blur();
                    $(this).focus();
                }
            });
        },
        setTenant: function() {
            var $tenantInfo = $('#tenant-info');
            if($tenantInfo.length) {
                $.ajax({
                    url: horizon.tools.formatUrl('/system/tenant/login'),
                    cache: false,
                    dataType: 'json',
                    success: function (data) {
                        if(data) {
                            var $tenantCode = $tenantInfo.find('select[name="tenantCode"]');
                            $.each(data['tenantList'], function(key, value) {
                                $tenantCode.append('<option value="' + key + '">' + value + '</option>');
                            });
                            if(data.type == '1') {
                                $tenantInfo.removeClass('hidden').addClass('block');
                            }
                        }
                    }
                });
            }
        },
        init: function () {
            if(horizon.static) {
                this.setTenant();
            }
            horizon.language.getLanguage(['base', 'login', 'validator'], function() {

                if(horizon.static) {
                    horizon.language.handleFullPage();
                    var browser = horizon.tools.browser();
                    if (browser.browser === 'IE' && browser.version === '8.0') {
                        document.title = horizon.lang.base.appname;
                    } else {
                        try {
                            $('title').html(horizon.lang.base.appname);
                        }catch (e) {
                            $('title').innerHTML = horizon.lang.base.appname;
                        }
                    }
                    $('input[name="loginName"]').attr('placeholder', horizon.lang.login.username);
                    $('input[name="password"]').attr('placeholder', horizon.lang.login.password);
                }

                login.pageSet();
                login.form();
            });
        },
        form: function () {
            var $form = $('#LoginForm');
            $form.validate({
                ignore: '.ignore',
                errorElement: 'div',
                errorClass: 'help-block no-margin-bottom',
                focusInvalid: false,
                onfocusout: false,
                rules: {
                    loginName: 'required',
                    password: 'required',
                    loginTenant: 'required'
                },
                messages: {
                    loginName: {
                        required: horizon.lang.login['usernameHelp']
                    },
                    password: {
                        required: horizon.lang.login['passwordHelp']
                    },
                    tenantCode: {
                        required: horizon.lang.login['selectTenantHelp']
                    }
                },
                highlight: function (e) {
                    $(e).closest('.form-group').addClass('has-error');
                },
                success: function (e) {
                    $(e).closest('.form-group').removeClass('has-error');
                    $(e).remove();
                },
                errorPlacement: function (error, element) {
                    error.insertAfter(element.parent());
                    if ($('.help-block').length > 0) {
                        $('.error-message').html('');
                    }
                },
                submitHandler: function () {
                    $.ajax({
                        url: horizon.tools.formatUrl($form.attr('action')),
                        dataType: 'json',
                        type: 'POST',
                        cache: false,
                        data: $form.serializeJson(),
                        success: function (data) {
                            if (data.indexOf(";") > -1) {
                                var message = data.split(";");
                                $('.error-message').html(message[1]);
                            } else {
                                self.location = horizon['paths'].apppath + data;
                            }
                        }
                    });
                }
            });
        }
    };
    return login
}));
