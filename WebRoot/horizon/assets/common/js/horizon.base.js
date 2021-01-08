/*
  平台基础脚本
  @author zhouwf
*/
(function(root, undefined) {	
    "use strict";

    horizon.tools.extend(horizon, {
    	manager:{},
        operator: {},
        widget: {}
    });

    horizon.tools.extend(horizon.paths, {
        viewpath: horizon.paths.apppath + '/horizon/module/view/horizon.view.jsp'
    });

    horizon.tools.extend(horizon.vars['requirePaths'], {
        //第三方插件
        jqueryAutosize: horizon.paths.apppath + '/horizon/plugins/autosize/jquery.autosize',
        bootstrapWysiwyg: horizon.paths.apppath + '/horizon/plugins/wysiwyg/bootstrap-wysiwyg',
        jqueryHotkeys: horizon.paths.apppath + '/horizon/plugins/wysiwyg/jquery.hotkeys',
        elementsWysiwyg: horizon.paths.apppath + '/horizon/plugins/wysiwyg/elements.wysiwyg',
        colorBox: horizon.paths.apppath + '/horizon/plugins/colorbox/jquery.colorbox',
        iconsetGlyphicon: horizon.paths.apppath + '/horizon/plugins/iconPicker/js/iconset-glyphicon.min',
        iconsetFontawesome: horizon.paths.apppath + '/horizon/plugins/iconPicker/js/iconset-fontawesome-4.2.0.min',
        iconPicker: horizon.paths.apppath + '/horizon/plugins/iconPicker/js/bootstrap-iconpicker',


        //慧正JS
        horizonForm: horizon.paths.apppath + '/horizon/assets/module/form/js/horizon.form',
        horizonFormHistory: horizon.paths.apppath + '/horizon/assets/module/form/js/horizon.form.history',
        horizonWidget: horizon.paths.apppath + '/horizon/assets/module/widget/js/widget.base'
    });

    horizon.tools.extend(horizon.vars['requireShim'], {
        iconsetGlyphicon: ['jquery'],
        iconsetFontawesome: ['jquery'],
        iconPicker: ['jquery', 'iconsetGlyphicon', 'iconsetFontawesome']
    });

    horizon['modal'] = {
        active: false,
        openModalNum: 0,
        /**
         * 打开modal层
         * @params: option { url: 页面路径, root: window对象, closeCallback: 回调函数 }
         * */
        open: function(option) {
            var modalId = 'modal' + (this.openModalNum++),
                $widget = $('.horizon-task-modal .horizon-task-widget'),
                $asideTrigger = $('.aside-trigger[data-target=".horizon-task-modal"]'),
                $dropdownMenu = $widget.find('.dropdown-menu'),
                $tabContent = $widget.find('.tab-content'),
                $menu = $dropdownMenu.children('.menu-tls').clone()
                    .removeClass('hidden menu-tls').addClass('active').data(option)
                    .find('a[data-toggle="tab"]').data('target', '#' + modalId).end(),
                $pane = $tabContent.children('.pane-tls').clone()
                    .removeClass('pane-tls').addClass('active')
                    .attr({
                        id: modalId,
                        'widget-id': modalId
                    });
            $dropdownMenu.children(':not(.menu-tls)').removeClass('active').end().append($menu);
            $tabContent.children(':not(.pane-tls)').removeClass('active').end().append($pane);
            $widget.find('.widget-title').html($menu.find('a[data-toggle="tab"]').html());
            this.setTaskNum();
            setTimeout(function() {
                var $iframe = $pane.find('iframe');
                $iframe[0].name = modalId;
                $iframe[0].src = option.url;
                if(typeof option.title == 'string') {
                    $menu.find('a[data-toggle="tab"]').html(option.title);
                    $widget.find('.widget-title').html(option.title);
                }else {
                    if($iframe[0].attachEvent) {
                        $iframe[0].attachEvent('onload', function() {
                            try{
                                var _title = window.frames[modalId].document.getElementsByTagName('title')[0].innerHTML;
                                if(_title != null && _title != '') {
                                    $menu.find('a[data-toggle="tab"]').html(_title);
                                    $widget.find('.widget-title').html(_title);
                                }
                            }catch(e){}
                        });
                    }else {
                        $iframe[0].onload = function() {
                            try{
                                var _title = '';
                                if(window.frames[modalId].document) {
                                    _title = window.frames[modalId].document.getElementsByTagName('title')[0].innerHTML;
                                }else {
                                    _title = $iframe[0].contentWindow.document.getElementsByTagName('title')[0].innerHTML;
                                }
                                if(_title != null && _title != '') {
                                    $menu.find('a[data-toggle="tab"]').html(_title);
                                    $widget.find('.widget-title').html(_title);
                                }
                            }catch(e){}
                        }
                    }
                }
            }, 1);
            $asideTrigger.removeClass('hidden');
            if(!$asideTrigger.hasClass('open')) {
                $asideTrigger.trigger(horizon.tools.clickEvent());
            }
        },
        /**
         * 关闭modal层
         * */
        close: function($target) {
            var $widget = $('.horizon-task-modal .horizon-task-widget'),
                $asideTrigger = $('.aside-trigger[data-target=".horizon-task-modal"]'),
                $dropdownMenu = $widget.find('.dropdown-menu'),
                $tabContent = $widget.find('.tab-content'),
                $menu = $target ? $target : $dropdownMenu.children('.active'),
                $pane = $tabContent.find($menu.children('a[data-toggle="tab"]').data('target')),
                $iframeWin = $pane.find('iframe')[0].contentWindow;
            try{
                if($iframeWin && $iframeWin.horizon && typeof $iframeWin.horizon.closeCallback == 'function') {
                    try{
                        $iframeWin.horizon.closeCallback($menu);
                    }catch(e) {
                        alert(e.message);
                    }
                    return ;
                }
            }catch(e) {}

            if($menu.hasClass('active')) {
                var $nextActive;
                if(!$menu.prev().is('.hidden')) {
                    $nextActive = $menu.prev();
                }else if($menu.next().length) {
                    $nextActive = $menu.next();
                }
                if($nextActive) {
                    var $tabA = $nextActive.children('a[data-toggle="tab"]');
                    $nextActive.addClass('active');
                    $widget.find('.widget-title').html($tabA.html());
                    $tabContent.find($tabA.data('target')).addClass('active');
                }else {
                    $asideTrigger.trigger(horizon.tools.clickEvent());
                    $asideTrigger.addClass('hidden');
                }
            }
            try{
                var pRoot = $menu.data('root'),
                    pCloseCallback = $menu.data('closeCallback');
                setTimeout(function() {
                    horizon.vars.ie ? $(':focusable').focus() : '';
                    pRoot.document.getElementsByTagName('body')[0].focus();
                }, 1);
                if(pCloseCallback) {
                    pRoot.eval(pCloseCallback);
                }
            }catch(e) {
                // IE: 原页面已被释放
                horizon.vars.ie ? setTimeout(function() { $(':focusable').focus() }, 1) : '';
            }
            $menu.remove();
            $pane.remove();
            this.setTaskNum();

        },
        setTaskNum: function() {
            var $widget = $('.horizon-task-modal .horizon-task-widget'),
                $asideTrigger = $('.aside-trigger[data-target=".horizon-task-modal"]'),
                $num = $asideTrigger.find('.task-num');
            $num.html($widget.find('.tab-pane:not(.pane-tls)').length);
        },
        init: function() {
            var $widget = $('.horizon-task-modal .horizon-task-widget'),
                $asideTrigger = $('.aside-trigger[data-target=".horizon-task-modal"]'),
                event = horizon.tools.clickEvent();
            $widget.find('[data-action="remove"]').on(event, function() {
                horizon.modal.close();
            });
            $widget.find('[data-action="hide"]').on(event, function() {
                $asideTrigger.trigger(event);
            });
            $widget.on('reload.ace.widget', function () {
                var $box = $(this),
                    $iframe = $box.find('.tab-pane.active iframe');
                $iframe[0].contentWindow.location.reload();
                setTimeout(function() {
                    $box.trigger('reloaded.ace.widget');
                }, 1);
            });
            $widget.on('show.bs.tab', '.widget-menu [data-toggle="tab"]', function () {
                var $this = $(this);
                $this.closest('.widget-menu').find('.active').removeClass('active');
            }).on('shown.bs.tab', '.widget-menu [data-toggle="tab"]', function () {
                var $this = $(this),
                    $widgetTitle = $this.closest('.widget-header').find('.widget-title'),
                    $tabA = $this.closest('.widget-menu').find('.active').find('a[data-toggle="tab"]');
                $widgetTitle.html($tabA.html());
            });
            this.active = true;
        }
    };

    horizon['password'] = {
        addStrongCheck: function($password, checkUrl) {
            var pwd = this;
            $password.rules('add', {
                remote: {
                    url: checkUrl,
                    cache: false,
                    data: {
                        strong :function() {
                            return pwd.getStrong($password.val());
                        }
                    }
                },
                messages: {
                    remote: horizon.lang.message.formatCheckPassword
                }
            });
        },
        setStrong: function($Strong, password) {
            var modes = this.getStrong(password);
            $Strong.removeClass('active btn-danger btn-warning btn-primary');
            switch(modes) {
                case 0:
                    break;
                case 1:
                    $($Strong[0]).addClass('active btn-danger');
                    break;
                case 2:
                    $($Strong[1]).addClass('active btn-warning');
                    break;
                default :
                    $($Strong[2]).addClass('active btn-primary');
                    break;
            }
        },
        getStrong: function(password) {
            var pwd = this,
                modes = 0;
            if(password && password.length >= 6) {
                for(var i= 0, iLen = password.length; i < iLen; i++) {
                    //测试每一个字符的类别并统计一共有多少种模式.
                    modes |= pwd.charMode(password.charCodeAt(i));
                }
                modes = pwd.bitTotal(modes);
            }
            return modes
        },
        charMode: function (iN){
            if (iN >= 48 && iN <= 57) //数字
                return 1;
            if (iN >= 65 && iN <= 90) //大写字母
                return 2;
            if (iN >= 97 && iN <= 122) //小写
                return 4;
            else
                return 8; //特殊字符
        },
        bitTotal: function bitTotal(num){
            var modes = 0;
            for (var i = 0; i < 4; i++) {
                if (num & 1) modes++;
                num>>=1;
            }
            return modes;
        },
        checkTimerUpdate: function($pwdTimerUpdate) {
            if($pwdTimerUpdate.length && $pwdTimerUpdate.val() == 'on'){
                horizon.notice.error(horizon.lang.message.updatePassword);
            }
        }
    };

})(window);
