/**
 * Created by zhouwf on 2015-6-10.
 */
(function(root , undefined) {
    horizon.dialogMessage = document.getElementById('dialog-message');
    horizon.defaultDialogOption = {
        title: '提示',
        closeText: '关闭'
    };
    horizon.requireModule = [
        'jquery',
        ('ontouchstart' in document.documentElement?'jqueryMobileCustom' : ''),
        'bootstrap',
        'gritter',
        'horizonJqueryui',
        'horizonForm',
        'ace'
    ];
    /**@description 加载外部引用的JS*/
    horizon.tools.extend(horizon.vars.requirePaths, horizon.js.requirePaths);
    for(var module in horizon.js.requirePaths) {
        horizon.requireModule.push(module);
    }
    horizon.tools.extend(horizon.vars.requireShim, horizon.js.requireShim);

})(window);

require.config({
    baseUrl: horizon.paths.pluginpath,
    paths: horizon.vars.requirePaths,
    shim: horizon.vars.requireShim
});
require(horizon.requireModule, function($) {
    /**@description 加载外部引用的CSS*/
    $.each(horizon.css, function(i, _css) {
        if(!(/\.css$/.test(_css))) {
            _css += '.css';
        }
        if(!(/^(http[s]?|ftp):\/\//.test(_css)) && !(/^\//.test(_css))){
            _css = horizon.paths.apppath + '/' + _css;
        }
        horizon.tools.use(_css);
    });

    horizon.form.submitForm = function() {

        horizon.notice.loading('正在执行...');

        if(typeof horizon.impl_beforeSubmit == 'function' && horizon.impl_beforeSubmit() === false) {
            horizon.notice.closeAll();
            return;
        }
        var $dialogMessage = $(horizon.dialogMessage),
            type = 'cancel',
            formData = horizon.form.baseForm.serializeArray();
        if(horizon.form.history && horizon.form.history.enable) {
            formData.push({name: 'HISTORY', value: horizon.form.history.getData()});
        }
        $.ajax({
            url: horizon.paths.apppath + '/horizon/template/formdata/save.wf',
            type: 'post',
            dataType: 'json',
            data: formData,
            error: function() {
                $.gritter.removeAll({
                    after_close: function() {
                        $dialogMessage.removeClass('hide').dialog($.extend({
                            dialogText: '出错啦!',
                            dialogTextType: 'alert-danger'
                        }, horizon.defaultDialogOption));
                    }
                });
            },
            success: function(data) {
                $.gritter.removeAll({
                    after_close: function() {
                        if(data && data.result) {
                            $('input[name="' + horizon.form.formId + '_ID"]').val(data.dataId);
                            if(typeof horizon.impl_afterSubmitSuccess == 'function'){
                                horizon.impl_afterSubmitSuccess(data);
                                return;
                            }
                            var option = $.extend({
                                dialogText: '保存成功!是否继续编辑?',
                                dialogTextType: 'alert-info',
                                buttons: [
                                    {
                                        html: '确定',
                                        "class" : "btn btn-primary btn-xs",
                                        click: function() {
                                            window.location.href = horizon.paths.apppath + '/horizon/template/form/default.wf?formId=' + horizon.form.formId + '&dataId=' + data.dataId;
                                            type = 'OK';
                                            $(this).dialog('close');
                                        }
                                    }
                                ],
                                close: function() {
                                    if(type == 'cancel') {
                                        horizon.close();
                                    }
                                }
                            }, horizon.defaultDialogOption);
                            $dialogMessage.removeClass('hide').dialog(option);
                        }else{
                            $dialogMessage.removeClass('hide').dialog($.extend({
                                dialogText: '保存失败!',
                                dialogTextType: 'alert-danger'
                            }, horizon.defaultDialogOption));
                        }
                    }
                });
            }
        });
    };
    /**@description 表单提交与重置*/
    horizon.form.baseForm.on('reset', function() {
        $('select[data-type="select"]').trigger('chosen:updated.chosen');
        $('textarea[data-type="editor"]').each(function() {
            var $this = $(this);
            $this.siblings('.wysiwyg-toolbar').find('.active[data-view="source"]').click();
            $this.siblings('.wysiwyg-editor').html($this.val()).show();
        });
    });

    horizon.form.load(function() {
        //当有意见或者会签意见并且当前人员已经填写过数据时取消必填验证
        var $opinionDialogs = $('.opinion-dialogs');
        if($opinionDialogs.length) {
            $opinionDialogs.each(function() {
                var $this = $(this);
                if($this.find('[data-userid="' + $('input[name="USER_ID"]').val() + '"]').length
                    && $this.next().find('input.validate').length
                    ) {
                    $this.next().find('input.validate').rules('remove', 'required');
                }
            });
        }

        if(typeof horizon.impl_load == 'function'){
            horizon.impl_load();
        }
        if($('body').hasClass('print')) {
            if($('[data-type="ueditor"]').length > 0 ||$('[data-type="select"]').length > 0||$('[type="radio"]').length > 0) {
                setTimeout(function() {
                    window.print();
                }, 1000);
            }else {
                window.print();
            }
        }
    });


    setTimeout(function() {
        try{
            $('input[type="text"]:first')[0].focus();
        }catch(e){}
    }, 1);
});
