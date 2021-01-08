/**
 * 修改密码 @author zhangjf 2017年9月18日
 */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery' ], factory);
	} else {
		factory(jQuery);
	}
}(function($) {
	"use strict";
	var urls = {
		checkPassword: horizon.paths.apppath +'/horizon/manager/org/user/check/password.wf',
	    updatePassword: horizon.paths.apppath +'/horizon/manager/org/user/update/password.wf'
	};
	/**
	 * 页面初始化操作
	 */
	var modify = {
		initUpdatePassword: function() {
	        var $updatePassword = $('[data-operator="updatePlatformPassword"]');
	        if(!$updatePassword.length) return;
	        $updatePassword.on(horizon.tools.clickEvent(), function() {
	            $('#userForm')[0].reset();
	            //清除表单验证提示信息
	            $('.form-group').removeClass('has-error');
	            $('label[id*="-error"]').html('');

	            $('.userContent').dialog({
	                width: $(window).width() > 500 ? '500' : 'auto',
	                height: 'auto',
	                maxHeight: $(window).height(),
	                closeText: horizon.lang.base.cancel,
	                title: horizon.lang.base.updatePassword,
	                buttons:[
	                    {
	                        html: horizon.lang.base.ok,
	                        "class" : "btn btn-primary btn-xs",
	                        click: function() {
	                            $('#userForm').submit();
	                        }
	                    }
	                ]
	            });
	        });
	        this.initValidUserForm();
	    },
	    initValidUserForm: function() {
	        $('#userForm').validate({
	            ignore: '.ignore',
	            errorClass: 'help-block no-margin-bottom',
	            focusInvalid: false,
	            rules: {
	                oldpassword: {
	                    remote: {
	                        url: urls.checkPassword,
	                        cache: false,
	                        data: {
	                            password :function() {
	                                return $('#userForm').find('input[name="oldpassword"]').val();
	                            }
	                        }
	                    }
	                },
	                repassword: {
	                    equalTo: '#newPassword'
	                }
	            },
	            messages: {
	                oldpassword: {
	                    remote: horizon.lang.base.oldPasswordError
	                },
	                repassword: {
	                    equalTo: horizon.lang.base.rePasswordError
	                }
	            },
	            highlight: function (e) {
	                $(e).closest('.form-group').addClass('has-error');
	            },
	            success: function (e) {
	                $(e).closest('.form-group').removeClass('has-error');
	                $(e).remove();
	            },
	            submitHandler: function(form) {
	            	
	                $.ajax({
	                    url: urls.updatePassword,
	                    cache: false,
	                    type: 'POST',
	                    data: $(form).serializeArray(),
	                    dataType: 'json',
	                    error: function() {
	                    	horizon.notice.error(horizon.lang.message.updateError);
	                    },
	                    success: function(data) {
	                        if(data.restype != 'err'){
	                            location.href = horizon.paths.apppath+'/horizon/manager/logout.wf';
	                        }else{
	                        	horizon.notice.error(horizon.lang.message.updateFail);
	                        }
	                    }
	                });
	            }
	        });
	    }
	};
	
	return horizon.manager['modify'] = {
		init : function() {
			modify.initUpdatePassword();
		}
	};
}));
