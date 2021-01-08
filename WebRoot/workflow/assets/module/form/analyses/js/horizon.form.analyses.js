(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'jqueryValidateAll'], factory);
    }else {
        factory(jQuery);
    }
})(function($) {
    $.extend(horizon.form, {
        formId: horizon.tools.getQueryString('formId') || horizon.tools.getQueryString('formid') || horizon.tools.getQueryString('FORMID'),
        dataId: horizon.tools.getQueryString('dataId') || horizon.tools.getQueryString('dataid') || horizon.tools.getQueryString('DATAID'),
        baseForm: $('.base-form'),
        lang: ['base', 'message', 'validator'],
        submit: function() {
            this.baseForm.submit();
        },
        reset: function() {
            this.baseForm.trigger('reset');
        },
        setParamVal: function() {
            if(!$('input[name="FORMID"]').length) {
                return ;
            }
            var urlSearch = window.location.search.substr(1);
            if(urlSearch != null && urlSearch!= '') {
                var paramArr = urlSearch.split('&');
                $.each(paramArr, function(i, con) {
                    var name = con.split('=')[0];
                    var value = con.split('=')[1];
                    if(value) {
                        value = decodeURI(value);
                    }
                    $('input[name="FORMID"]').each(function() {
                        var $field = $('[name="' + $(this).val() + '_' + name + '"]');
                        if($field && $field.length) {
                            $field.val(value);
                        }
                    });
                    $('input[name="RFORMID"]').each(function() {
                        var $field = $('[name="' + $(this).val() + '_' + name + '"]');
                        if($field && $field.length) {
                            $field.val(value);
                        }
                    });
                    $('input[name="SUBFORMID"]').each(function() {
                        var $field = $('[name="' + $(this).val() + '_' + name + '"]');
                        if($field && $field.length) {
                            $field.val(value);
                        }
                    });
                });
            }
        },
        validateOption: {
            errorElement: 'div',
            errorClass: 'help-block col-xs-12 col-sm-reset',
            focusInvalid: true,
            ignore: '.ignore, .ignore *',
            highlight : function(e) {
                $(e).closest('.form-group').addClass('has-error');
            },
            success: function (e) {
                $(e).closest('.form-group').removeClass('has-error');
                $(e).remove();
            },
            errorPlacement: function (error, element) {
                if($('#'+error.attr('id')).length) return;
                if(element.is('input[type=checkbox]') || element.is('input[type=radio]')) {
                    error.insertAfter(element.closest('.control-group'));
                }else if(element.is('.select2')) {
                    error.insertAfter(element.siblings('[class*="select2-container"]:eq(0)'));
                }else if(element.is('.chosen-select')) {
                    error.insertAfter(element.siblings('[class*="chosen-container"]:eq(0)'));
                }else if(element.is('textarea')) {
                    if(element.attr('data-type') == 'opinion') {
                        element.parent().siblings('.help-block').remove();
                        error.insertAfter(element.parent());
                    }else {
                        error.insertAfter(element);
                    }
                }else if(element.is('.spinbox-input')) {
                    error.insertAfter(element.closest('.input-icon'));
                }else {
                    element.parent().siblings('.help-block').remove();
                    error.insertAfter(element.parent());
                }
            },
            submitHandler: function () {
                horizon.form.submitForm();
            }
        },
        validate: function() {
            //重置长度验证方法, 中文占两个字符
            $.validator.addMethod('maxlength', function( value, element, param ) {
                var length = $.isArray( value ) ? value.length : this.getLength( value, element );
                if(typeof value === 'string' && value.match(/[^\x00-\xff]/ig)) {
                    length = value.replace(/[^\x00-\xff]/ig, '00').length;
                }
                return this.optional( element ) || length <= param;
            }, $.validator.messages.maxlength);

            horizon.form.baseForm.validate(horizon.form.validateOption);
        },
        load: function(_callback) {

            horizon.form.setParamVal();
            horizon.language.getLanguage(horizon.form.lang, function() {
                horizon.form.validate();
                if(_callback && typeof _callback === 'function') {
                    _callback.apply(this);
                }
            });

        }
    });

});
