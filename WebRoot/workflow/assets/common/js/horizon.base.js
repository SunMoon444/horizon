/*
 基础脚本
 @author zhouwf
 */
(function(global, undefined) {
    "use strict";

    global['horizon'] = {
        //静态
        static: true,
        //路径
        paths: null,
        //基础属性
        vars: null,
        //工具方法
        tools: null,
        //表单对象
        form: {},
        //国际化缓存对象
        lang: {},
        //引擎对象
        engine: {},
        //表单,视图引入js
        js: {
            //引入js的路径
            requirePaths: {},
            //引入js的依赖关系
            requireShim: {}
        },
        //表单,视图引入css
        css: [],
        //onload事件
        impl_load: null,
        //表单验提交前事件
        impl_beforeSubmit: null,
        //表单提交后事件
        impl_afterSubmitSuccess: null,
        //流程提交前事件
        impl_beforeAction: null,
        //流程提交后事件
        impl_afterActionSuccess: null,
        //modal层中打开页面
        open: function(option) {
            try{
                if(!horizon.vars.mobile) {
                    horizon.tools.extend(option, {
                        root: global
                    });
                    if(option.parent && option.parent.horizon && option.parent.horizon.modal && option.parent.horizon.modal.active) {
                        option.parent.horizon.modal.open(option)
                    }else if(horizon.modal && horizon.modal.active) {
                        horizon.modal.open(option);
                    }else if(parent && parent.horizon && parent.horizon.modal && parent.horizon.modal.active) {
                        parent.horizon.modal.open(option);
                    }else {
                        parent.horizon.operator.open(option);
                    }
                    return ;
                }
            }catch(e) {}
            window.open(option.url);
        },
        //modal层中关闭页面
        close: function(_parent) {
            try{
                if(!horizon.vars.mobile) {
                    if(_parent && _parent.horizon && _parent.horizon.modal && _parent.horizon.modal.active) {
                        _parent.horizon.modal.close(this.closeModalObj);
                    }else if(horizon.modal && horizon.modal.active) {
                        horizon.modal.close(this.closeModalObj);
                    }else if(parent && parent.horizon && parent.horizon.modal && parent.horizon.modal.active) {
                        parent.horizon.modal.close(this.closeModalObj);
                    }else {
                        parent.horizon.operator.close(this.closeModalObj);
                    }
                    this.closeModalObj = null;
                    return ;
                }else if(horizon.vars.android) {
                    try{
                        _mhy.closeWebView();
                        return ;
                    }catch(e) {}
                }else if(horizon.vars.ios) {
                    try{
                        closeWebView();
                        return ;
                    }catch(e) {}
                }
            }catch(e) {}
            window.close();
        },
        //modal层中关闭页面的回调函数
        closeCallback: null,
        //modal层中关闭页面的modal的对象
        closeModalObj: null
    };

    var path = (function() {
        var pp = (self.location + '').split('/');
        return pp[3] ? ('/' + pp[3]) : '';
    })();
    //远程服务器请求地址，默认为path例如：'http://localhost:8083/horizon-workflow-boot'
    var serverPath=path;
    horizon['paths'] = {
        //后台服务根路径
        serverPath:serverPath,
        //工程上下文路径
        apppath: path,
        //引擎文件根路径
        syspath: path + '/workflow',
        //第三方插件根路径
        pluginpath: path + '/workflow/plugins',
        //资源文件根路径
        assetspath: path + '/workflow/assets',
        //公用页面路径
        commonpath: path + '/workflow/common',
        //服务器请求前缀
        urlprefix: serverPath+ '/horizon/workflow',
        //服务器请求后缀
        urlsuffix: '.wf',
        //流程框架路径
        flowpath: serverPath+ '/horizon/workflow/support/open.wf'
    };

    if(global['horizonConfigPaths'] && typeof global['horizonConfigPaths'] === 'object') {
        try{
            for(var key in global['horizonConfigPaths']) {
                horizon['paths'][key] = global['horizonConfigPaths'][key];
            }
        }catch(e) {}
    }
    var agent = navigator.userAgent;
    horizon['vars'] = {
        //语言
        lang: (function() {
            var def = 'zh-CN',
                htmlTag = document.getElementsByTagName('html')[0],
                lang = htmlTag.getAttribute('lang');
            if(lang) return lang;
            htmlTag.setAttribute('lang', def);
            return def;
        })(),
        //是否触摸屏
        touch: ('ontouchstart' in document.documentElement),
        webkit: !!agent.match(/AppleWebKit/i),
        safari: !!agent.match(/Safari/i) && !agent.match(/Chrome/i),
        android: !!agent.match(/Android/i) || !!agent.match(/Adr/i),
        ios: !!agent.match(/OS ([4-9])(_\d)+ like Mac OS X/i) && !agent.match(/CriOS/i),
        ie: window.navigator.msPointerEnabled || (document.all && document.querySelector),//8-11
        oldIE: document.all && !document.addEventListener, // <=8
        veryOldIE: document.all && !document.querySelector, // <=7
        firefox: 'MozAppearance' in document.documentElement.style,
        //布局
        layout: (function() {
            //top-left|top|left
            return document.body && document.body.getAttribute('data-layout')?document.body.getAttribute('data-layout') : 'top-left';
        })()
    };

    horizon.vars['mobile'] = horizon.vars.ios || horizon.vars.android;

    //require文件路径配置
    horizon.vars['requirePaths'] = {
        /* 第三方插件 */
        'require': 'require/require',
        'excanvas': 'old-browser/excanvas',
        'jquery': (horizon.vars.oldIE?'jquery/jquery-base/jquery1x':'jquery/jquery-base/jquery'),
        'jqueryMobileCustom': 'jquery/jquery-mobile/jquery.mobile.custom',
        'jqueryForm': 'jquery/jquery-form/jquery-form',
        'bootstrap': 'bootstrap/bootstrap/bootstrap',
        'jqueryUi': 'jquery/jquery-ui/jquery-ui',
        'jqueryUiCustom': 'jquery/jquery-ui/jquery-ui.custom',
        'jqueryUiTouchPunch': 'jquery/jquery-ui/jquery.ui.touch-punch',
        'datatables': 'datatables/jquery.dataTables',
        'jqueryValidate': 'jquery/jquery-validate/jquery.validate',
        'jqueryValidateAll': 'jquery/jquery-validate/additional-methods',
        'chosenJquery': 'chosen/chosen.jquery',
        'fueluxSpinner': 'fuelux/fuelux.spinner',
        'moment': 'date-time/moment',
        'bootstrapDatepicker': 'date-time/date-picker/bootstrap-datepicker',
        'bootstrapTimepicker': 'date-time/time-picker/bootstrap-timepicker',
        'bootstrapDatetimepicker': 'date-time/datetime-picker/bootstrap-datetimepicker',
        'daterangepicker': 'date-time/daterange-picker/daterangepicker',
        'fullcalendar': 'date-time/fullcalendar/fullcalendar',
        'fullcalendar-zh-CN': 'date-time/fullcalendar/lang/zh-cn',
        'gritter': 'gritter/jquery.gritter',
        'elementsFileinput': 'bootstrap/ace/js/elements.fileinput',
        'elementsSpinner': 'fuelux/elements.spinner',
        'elementsScroller': 'bootstrap/ace/js/elements.scroller',
        'elementsAside': 'bootstrap/ace/js/elements.aside',
        'fueluxWizard': 'fuelux/fuelux.wizard',
        'elementsWizard': 'fuelux/elements.wizard',
        'fueluxTree': 'fuelux/fuelux.tree',
        'elementsTreeview': 'fuelux/elements.treeview',
        'aceElements': 'bootstrap/ace/ace-elements',
        'ace': 'bootstrap/ace/ace',
        'aceSmall': 'bootstrap/ace/js/ace',
        'ueditorConfig': 'ueditor/ueditor.config',
        'ueditorAll': 'ueditor/ueditor.all',
        'ueditor-zh-cn': 'ueditor/lang/zh-cn/zh-cn',
        'ueditor-en': 'ueditor/lang/en/en',
        'ztree': 'ztree/jquery.ztree.min',
        'echarts': 'echarts/echarts.min',
        'jqueryAutosize': 'autosize/jquery.autosize',
        'colorBox': 'colorbox/jquery.colorbox',
        'jqueryHotkeys': 'wysiwyg/jquery.hotkeys',
        'bootstrapWysiwyg': 'wysiwyg/bootstrap-wysiwyg',
        'elementsWysiwyg': 'wysiwyg/elements.wysiwyg',
        'laydate': 'laydate/laydate',

        /* 慧正应用JS */
        horizonFramepage: horizon.paths.assetspath + '/common/js/horizon.framepage',
        horizonFlowchart: horizon.paths.assetspath + '/common/js/horizon.flowchart.min',
        horizonNote: horizon.paths.assetspath + '/common/js/horizon.note',
        horizonTable: horizon.paths.assetspath + '/common/js/horizon.table',
        horizonDatatables: horizon.paths.assetspath + '/common/js/horizon.datatables',
        horizonTablePageDefault: horizon.paths.assetspath + '/common/js/horizon.tablepage.default',
        horizonJqueryui: horizon.paths.assetspath + '/common/js/horizon.jqueryui',
        horizonFlowtree: horizon.paths.assetspath + '/common/js/horizon.flowtree',
        horizonSelectuser: horizon.paths.assetspath + '/common/js/horizon.selectuser',
        horizonForm: horizon.paths.assetspath + '/module/form/analyses/js/horizon.form.analyses'
    };

    //require文件依赖配置
    horizon.vars['requireShim'] = {
        'bootstrap': ['jquery'],
        'chosenJquery': ['jquery'],
        'bootstrapDatepicker': ['jquery'],
        'gritter': ['jquery'],
        'fullcalendar-zh-CN': ['fullcalendar'],
        'elementsScroller':  ['jquery'],
        'elementsFileinput':  ['jquery', 'jqueryForm'],
        'elementsSpinner':  ['jquery', 'fueluxSpinner'],
        'elementsAside': ['jquery', 'elementsScroller'],
        'elementsWizard': ['jquery', 'fueluxWizard'],
        'elementsTreeview': ['jquery', 'fueluxTree'],
        'aceElements': ['jquery'],
        'ace': ['jquery'],
        'aceSmall': ['jquery'],
        'ueditorAll': ['ueditorConfig'],
        'ueditor-zh-cn': ['ueditorAll'],
        'ueditor-en': ['ueditorAll'],
        'ztree': ['jquery'],
        'bootstrapWysiwyg': ['jquery', 'jqueryHotkeys'],
        'elementsWysiwyg':  ['jquery', 'bootstrapWysiwyg']
    };

    /**
     * WEB数据存储
     * */
    horizon.storage = {
        prefix: 'HORIZON_',
        /**
         * 数据缓存类型
         * */
        type: (function() {
            if('localStorage' in window && window['localStorage'] !== null) {
                return 'localStorage';
            }else if('cookie' in document && document['cookie'] !== null) {
                return 'cookie';
            }
        })(),
        get: function(namespace, key) {
            if(!this.type) return null;
            var storage = horizon[this.type];
            if(key === undefined) {
                key = this.prefix + namespace;
                return storage.get(key);
            }else {
                namespace = this.prefix + namespace;
                if(this.type == 'localStorage') {
                    return storage.get(namespace + '_' + key);
                }else if(this.type == 'cookie') {
                    var val = storage.get(namespace),
                        tmp = val ? JSON.parse(val) : {};
                    return key in tmp ? tmp[key] : null;
                }
            }
        },
        set: function(namespace, key, value, options) {
            if(!this.type) return;
            var storage = horizon[this.type];
            if(value === undefined) {
                value = key;
                key = this.prefix + namespace;
                if(value == null) {
                    storage.remove(key);
                }else {
                    if(this.type == 'localStorage') {
                        storage.set(key, value);
                    }else if(this.type == 'cookie') {
                        storage.set(key, value, options)
                    }
                }
            }else {
                if(this.type == 'localStorage') {
                    var fullKey = this.prefix + namespace + '_' + key;
                    if(value == null) {
                        storage.remove(fullKey);
                    }else {
                        storage.set(fullKey, value);
                    }
                }else if(this.type == 'cookie') {
                    namespace = this.prefix + namespace;
                    var val = storage.get(namespace),
                        tmp = val ? JSON.parse(val) : {};
                    if(value == null) {
                        delete tmp[key];
                        if($.isEmptyObject(tmp)) {
                            //cookie中没有其它元素, 删除
                            storage.remove(namespace);
                            return;
                        }
                    }else {
                        tmp[key] = value;
                    }
                    storage.set(namespace , JSON.stringify(tmp), options);
                }
            }
        },
        remove: function(namespace, key) {
            if(!this.type) return;
            if(key === undefined) {
                key = namespace;
                this.set(key, null);
            }else {
                this.set(namespace, key, null);
            }
        }
    };

    /**
     * cookie storage
     */
    horizon.cookie = {
        config: {
            expires: 7,
            path: ''
        },
        /**
         * 获取cookie.
         */
        get: function(name) {
            var cookie = document.cookie, key = name + "=", begin, end;
            if (!cookie) return;
            begin = cookie.indexOf('; ' + key);
            if (begin == -1) {
                begin = cookie.indexOf(key);
                if (begin != 0) return null;
            }else {
                begin += 2;
            }
            end = cookie.indexOf(";", begin);
            if( end == -1 ) end = cookie.length;
            return decodeURIComponent(cookie.substring(begin + key.length, end));
        },
        /**
         * 设置cookie
         */
        set: function(name, value, options) {
            options = $.extend({}, this.config, options);
            if (typeof options.expires === 'number') {
                var days = options.expires;
                options.expires = new Date();
                options.expires.setDate(options.expires.getDate() + days);
            }

            return (document.cookie = [
                name, '=', encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '',
                options.path    ? '; path=' + options.path : '',
                options.domain  ? '; domain=' + options.domain : '',
                options.secure  ? '; secure' : ''
            ].join(''));
        },

        /**
         * 删除cookie
         */
        remove : function(name, path) {
            this.set(name, '', {
                expires: -1000,
                path: path
            });
        }
    };


    /**
     * local storage
     * */
    horizon.localStorage = {
        get: function(key) {
            return window['localStorage'].getItem(key);
        },
        set: function(key, value) {
            window['localStorage'].setItem(key , value);
        },
        remove: function(key) {
            window['localStorage'].removeItem(key);
        }
    };

    horizon['tools'] = {
        /**获取地址栏参数值*/
        getQueryString: function(name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        },
        /**获取框架内的页面地址中的参数*/
        getPageParam: function(name) {
            var _url, _value = '';
            if(horizon.framepage) {
                var $activeA = $('#sidebar2').find('li.active:last a[data-children="false"]');
                if(!$activeA.length) {
                    $activeA = $('#sidebar').find('li.active:last a[data-children="false"]');
                }
                _url = $activeA.attr('data-url');
            }else {
                _url = window.location.hash.substring(1);
            }
            if(_url && _url.indexOf('?') != -1) {
                var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'),
                    matchs = _url.substr(_url.indexOf('?') + 1).match(reg);
                if (matchs) _value = unescape(matchs[2]);
            }
            return _value;
        },
        /**获取content区域高度*/
        getPageContentHeight: function() {
            var _height = $(window).height() - parseInt($('.page-content').css('paddingTop')) * 2,
                $body = $('body'),
                $sidebar = $('#sidebar');
            if($.inArray(horizon.vars.layout, ['left', 'left-hoversubmenu', 'bottom-left', 'bottom-left-hoversubmenu']) == -1) {
                _height -= ($sidebar.css('visibility') != 'hidden' ? $sidebar.outerHeight(true) : 0);
            }
            if(!$body.hasClass('embed')) {
                _height -= $('#navbar').outerHeight(true);
            }
            return _height;
        },
        /**合并对象*/
        extend: function(target, source) {
            for(var key in source) {
                target[key] = source[key];
            }
            return target;
        },
        /**获取浏览器及版本信息  {browser: 'IE', version: '9.0'}*/
        browser: function () {
            var ua = navigator.userAgent.toLowerCase(),
                rMsie = /(msie\s|trident.*rv:)([\w.]+)/,
                rFirefox = /(firefox)\/([\w.]+)/,
                rOpera = /(opera).+version\/([\w.]+)/,
                rChrome = /(chrome)\/([\w.]+)/,
                rSafari = /version\/([\w.]+).*(safari)/,
                match = rMsie.exec(ua);
            if(match != null) {
                return { browser : 'IE', version : match[2] || '0' };
            }
            match = rFirefox.exec(ua);
            if(match != null) {
                return { browser : match[1] || '', version : match[2] || '0' };
            }
            match = rOpera.exec(ua);
            if(match != null) {
                return { browser : match[1] || '', version : match[2] || '0' };
            }
            match = rChrome.exec(ua);
            if(match != null) {
                return { browser : match[1] || '', version : match[2] || '0' };
            }
            match = rSafari.exec(ua);
            if(match != null) {
                return { browser : match[2] || '', version : match[1] || '0' };
            }
            if(match != null) {
                return { browser : '', version : '0' };
            }
        },
        /**获取数组中的元素下标  (arr: 数组 ele: 元素)*/
        inArray: function(elem, arr){
            var index = -1;
            if(arr != null && arr.length > 0){
                if('indexOf' in Array.prototype) {
                    index = arr.indexOf(elem);
                }else {
                    for(var i=0;i<arr.length;i++){
                        if(arr[i] === elem){
                            index = i;
                            break;
                        }
                    }
                }
            }
            return index;
        },
        /** 加载文件 */
        use: function(a) {
            var head = document.getElementsByTagName('head')[0],
                a = a.replace(/\s/g, ''),
                e = /\.css$/.test(a),
                f = document.createElement(e ? 'link': 'script'),
                g = a.replace(/\.|\//g, '');
            if(document.getElementById(g)) {
                return ;
            }
            if(e) {
                f.type = 'text/css';
                f.rel = 'stylesheet';
            }else {
                f.type = 'text/javascript';
            }
            f[e ? 'href': 'src'] = a;
            f.id = g;
            var mainStylesheet = null;
            if(document.getElementsByClassName) {
                mainStylesheet = document.getElementsByClassName('main-stylesheet');
            }else if (window.jQuery) {
                mainStylesheet = jQuery('.main-stylesheet');
            }
            if(e && mainStylesheet && mainStylesheet.length) {
                head.insertBefore(f, mainStylesheet[0]);
            }else {
                head.appendChild(f);
            }
            if(e) {
                if(horizon.vars.oldIE && respond) {
                    f.attachEvent('onload', function() {
                        respond.update();
                    });
                }
            }
        },
        //获取绑定事件方式
        clickEvent: function() {
            return ('ontouchstart' in document.documentElement) && $.fn.tap ? 'tap' : 'click';
        },
        //格式化URL
        formatUrl: function(url, type) {
            if(type == 'urlprefix') {
                return horizon.paths.urlprefix + url;
            }else if(type == 'urlsuffix') {
                return url + horizon.paths.urlsuffix;
            }else {
                return horizon.paths.urlprefix + url + horizon.paths.urlsuffix;
            }
        },
        //获取流程图参数
        getFlowchartOption: function() {
            return {
                images: {
                    'define': horizon.paths.assetspath + '/common/img/define.png',
                    'now': horizon.paths.assetspath + '/common/img/now.png',
                    'done': horizon.paths.assetspath + '/common/img/done.png',
                    'jump': horizon.paths.assetspath + '/common/img/jump.png',
                    'extended': horizon.paths.assetspath + '/common/img/extended.png'
                }
            };
        },
        //初始化右侧modal层
        initHorizonModal: function() {
            var $focus = $('#focus'),
                clickEvent = this.clickEvent();
            if(!($focus && $focus.length)) {
                $focus = $('<button id="focus" class="hidden" type="button"></button>');
                $('body').append($focus);
                $focus.on(clickEvent, function() {
                    $('<div style="display:none"></div>').dialog().dialog('close');
                });
            }
            $(document).on(clickEvent, '.horizon-modal-container [data-toggle="modal"][data-target=".horizon-modal"]', function() {
                $focus.click();
            });
            $(document).on(clickEvent, '.horizon-modal [data-action="fixed-modal"]', function() {
                var $this = $(this),
                    $body = $('body'),
                    $modal = $this.closest('.horizon-modal'),
                    $modalContainer = $modal.closest('.horizon-modal-container'),
                    $modalTrigger = $modalContainer.find('[data-toggle="modal"][data-target=".horizon-modal"]'),
                    $icon = $this.children('i'),
                    fixedIcon = $icon.attr('data-fixed-icon'),
                    unFixedIcon = $icon.attr('data-unfixed-icon'),
                    isFixed = $body.attr('data-fixed-modal') == 'true';
                if(isFixed) {
                    $body.attr('data-fixed-modal', 'false');
                    $icon.removeClass(fixedIcon).addClass(unFixedIcon);
                }else {
                    $body.attr('data-fixed-modal', 'true');
                    $icon.removeClass(unFixedIcon).addClass(fixedIcon);
                    $modalTrigger.trigger(clickEvent);
                }
                var $dt = $('.dataTable');
                if($dt.length) {
                    $dt.each(function() {
                        if($(this).data('horizonTable')) {
                            $(this).data('horizonTable').pluginTable.fnAdjustColumnSizing(false);
                        }
                    });
                }
            });

            if($.fn.ace_scroll) {
                $(window)
                    .off('resize.horizon-modal.modal.aside')
                    .on('resize.horizon-modal.modal.aside', function() {
                        var $modal = $('.horizon-modal'),
                            $content = $modal.find('.modal-content'),
                            size = $content.height();
                        if($content.data('ace_scroll')) {
                            if(!horizon.vars.touch) {
                                $content.ace_scroll('update', {'size': size})
                                    .ace_scroll('enable')
                                    .ace_scroll('reset');
                            }else {
                                $content.css('maxHeight', size);
                            }
                        }else {
                            if(!horizon.vars.touch) {
                                $content.ace_scroll({
                                    size: size,
                                    reset: true,
                                    mouseWheelLock: true,
                                    'observeContent': true
                                })
                            }else {
                                $content.addClass('overflow-scroll').css('maxHeight', size);
                            }
                        }
                    }).triggerHandler('resize.horizon-modal.modal.aside');
                $(document).on('mouseover', '.horizon-modal', function() {
                    var $this = $(this);
                    if(!$this.find('.modal-content.ace-scroll').length) {
                        $(window).triggerHandler('resize.horizon-modal.modal.aside');
                    }
                });
                $(document).on('click.horizon-modal', '.horizon-modal .modal-body', function() {
                    setTimeout(function() {
                        $(window).triggerHandler('resize.horizon-modal.modal.aside');
                    }, 300);
                });
            }
        }
    };

    horizon['notice'] = {
        options: {
            //显示前先关闭其他通知
            closeOthers: true,
            class_name: 'gritter-light',
            fade_out_speed: 500,
            time: 3000
        },
        //打开
        open: function(opts) {
            if(opts && typeof opts === 'string') {
                opts = this.formatOpts({}, opts);
            }
            opts = $.extend({}, this.options, opts);
            if(opts.closeOthers) {
                this.closeAll(function() {$.gritter.add(opts);});
            }else {
                $.gritter.add(opts);
            }
        },
        //关闭
        close: function(id, callback) {
            if($('#gritter-notice-wrapper').length) {
                var opts = callback ? {after_close: callback} : null;
                $.gritter.remove(id, opts);
            }else {
                callback ? callback() : '';
            }
        },
        //关闭所有
        closeAll: function(callback) {
            var $wrap = $('#gritter-notice-wrapper');
            if($wrap.length) {
                $wrap.remove();
            }
            callback ? callback() : '';
        },
        formatOpts: function(opts, options) {
            opts.title = (horizon.lang.message ? horizon.lang.message.title : '提示');
            if(typeof options === 'string') {
                opts.text = options;
            }else if(typeof options === 'object') {
                $.extend(opts, options);
            }
            return opts;
        },
        //默认
        normal: function(options) {
            if(!options) return;
            this.open(this.formatOpts({
                icon: 'ace-icon fa fa-coffee'
            }, options));
        },
        //成功
        success: function(options) {
            if(!options) return;
            this.open(this.formatOpts({
                icon: 'ace-icon fa fa-check icon-success'
            }, options));
        },
        //错误
        error: function(options) {
            if(!options) return;
            this.open(this.formatOpts({
                icon: 'ace-icon fa fa-close icon-error'
            }, options));
        },
        //信息
        info: function(options) {
            if(!options) return;
            this.open(this.formatOpts({
                icon: 'ace-icon fa fa-info icon-info'
            }, options));
        },
        //警告
        warning: function(options) {
            if(!options) return;
            this.open(this.formatOpts({
                icon: 'ace-icon fa fa-warning icon-warning'
            }, options));
        },
        //加载
        loading: function(text) {
            var textIcon = '<i class="fa fa-spin fa-spinner bigger-130"></i>';
            this.open({
                text : textIcon + (text ? ' ' + text : ''),
                sticky: true,
                class_name : 'gritter-load'
            });
        }
    };

    horizon['language'] = {
        /**
         * 格式化语言对象
         * @params: lang 语言对象
         * */
        formatLang: function(lang){
            var result = {};
            $.each(lang, function(key, value) {
                if(/^\[.*\]$/.test(value) || /^\{.*\}$/.test(value)) {
                    eval('(0 ? 0 : value = ' + value + ')');
                }
                if(key.indexOf('.') !== -1) {
                    var keyArray = key.split('.'),
                        iLen = keyArray.length,
                        current = {};
                    $.each(keyArray, function(i, subKey) {
                        if(i === 0) {
                            current = result[subKey] = result[subKey] || {};
                        }else if(i === iLen-1) {
                            current[subKey] = value;
                        }else {
                            current[subKey] = current[subKey] || {};
                            current = current[subKey];
                        }
                    });
                }else {
                    result[key] = value;
                }
            });
            return result;
        },
        /**
         * 替换HTML中的语言信息
         * @params: html 页面内容
         * */
        replaceHtmlLang: function(html) {
            var self = this,
                matchArray = html.match(/\hz\{\w.*\}/g);
            if(matchArray && matchArray.length) {
                $.each(matchArray, function(i, val) {
                    var key = $.trim(val.replace('hz{', '').replace('}', ''));
                    html = html.replace(val, self.getLangVal(key));
                });
            }
            return html;
        },
        getLangVal: function(key) {
            var val = horizon.lang;
            if(key.indexOf('.') != -1) {
                $.each(key.split('.'), function(i, _key) {
                    val = val[_key];
                });
            }else {
                val = horizon.lang[key];
            }
            return val;
        },
        /**
         * 获取语言对象
         * @params: group 分组值 Array
         * @params: callback 回调函数
         * @author lichao 2017-4-12
         */
        getLanguage: function(group, callback) {
            if(!(group && group.length)) return;
            var self = this,
                nonexistent = [];
            $.each(group, function(i, key) {
                if(!horizon.lang[key]) {
                    nonexistent.push(key);
                }
            });
            var execute = function() {
                if(!callback) return;
                if(typeof(callback) === 'function') {
                    callback();
                }else if(typeof(callback) === 'string') {
                    eval('(0 ? 0 : ' + callback + ')');
                }
            };
            if(nonexistent.length) {
                $.ajax({
                    url: horizon.tools.formatUrl('/profile/lang'),
                    cache: false,
                    dataType: 'json',
                    data:{
                        groups: nonexistent.join(";")
                    },
                    error: function() {
                    	horizon.notice.error("操作错误，请联系管理员");
                    },
                    success: function(data) {
                        $.each(data, function(key, value) {
                            horizon.lang[key] = self.formatLang(value);
                            if(self.plugins[key] && typeof self.plugins[key] === 'function') {
                                self.plugins[key].apply(this);
                            }
                        });
                        execute();
                    }
                });
            }else{
                execute();
            }
        },
        /**
         * 处理页面的国际化
         */
        handlePage: function(html, callback) {
            var regex = /<hi18n\s+.*\><\/hi18n>/gi,
                i18nMatchs = html.match(regex),
                group = [];
            if(i18nMatchs && i18nMatchs.length) {
                $.each(i18nMatchs, function(i, i18n) {
                    var groupStr = $(i18n).attr('groups');
                    if(groupStr) {
                        $.each(groupStr.split(';'), function(i, key) {
                            group.push(key);
                        })
                    }
                });
            }
            if(group.length) {
                horizon.language.getLanguage(group, function() {
                    callback(horizon.language.replaceHtmlLang(html));
                });
            }else {
                callback(html);
            }
        },
        handleFullPage: function() {
            $(document.getElementsByTagName('path:i18n')).each(function() {
                var $this = $(this),
                    group = $this.attr('group'),
                    key = $this.attr('key');
                try {
                    $this.html(horizon.lang[group] ? horizon.lang[group][key] : '');
                }catch (e) {
                    $this.after('<span>' + (horizon.lang[group] ? horizon.lang[group][key] : '') + '</span>');
                }
            });
        },
        plugins: {
            datatables: function() {
                if(!$.fn.dataTable) return;
                var lang = horizon.lang.datatables;
                if(lang.processing.indexOf('dataTables_processing_bg') == -1) {
                    lang.processing = '<div class="dataTables_processing_bg"></div><span class="dataTables_processing_verticalalign"></span><span class="dataTables_processing_content"><i class="ace-icon fa fa-spinner fa-spin"></i>  ' + lang.processing + '</span>';
                }
                $.extend($.fn.dataTable.defaults.language, lang);
            },
            validator: function() {
                if(!$.validator) return;
                var lang = horizon.lang.validator;
                $.extend(true, $.validator.messages, lang, {
                    maxlength: $.validator.format(lang.maxlength),
                    minlength: $.validator.format(lang.minlength),
                    rangelength: $.validator.format(lang.rangelength),
                    range: $.validator.format(lang.range),
                    max: $.validator.format(lang.max),
                    min: $.validator.format(lang.min)
                });
            },
            selectuser: function() {
                if(!($.horizon && $.horizon.selectUser)) return;
                $.extend($.horizon.selectUser.defaults.lang, horizon.lang.selectuser);
            },
            datetimepicker: function() {
                var lang = {};
                lang[horizon.vars.lang] = horizon.lang.datetimepicker;
                if($.fn.datetimepicker && $.fn.datetimepicker.dates) {
                    $.fn.datetimepicker.defaults.language = horizon.vars.lang;
                    $.extend($.fn.datetimepicker.dates, lang);
                }
                if($.fn.datepicker && $.fn.datepicker.dates) {
                    $.fn.datepicker.defaults.language = horizon.vars.lang;
                    $.extend($.fn.datepicker.dates, lang);
                }
                if($.fn.daterangepicker){
                    horizon.lang.daterangepicker = $.extend(horizon.lang.daterangepicker || {}, horizon.lang.datetimepicker);
                    $.extend(horizon.lang.daterangepicker, {
                        daysOfWeek: horizon.lang.datetimepicker.daysMin.slice(0,7),
                        monthNames: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
                    } );
                }
            },
            flowchart: function() {
                if(!($.fn.horizonFlowChart)) return;
                $.extend($.fn.horizonFlowChart.defaults.lang, horizon.lang.flowchart);
            }
        }
    };

    if (!('indexOf' in Array.prototype)) {
        Array.prototype.indexOf = function (find, i) {
            if (i === undefined) i = 0;
            if (i < 0) i += this.length;
            if (i < 0) i = 0;
            for (var n = this.length; i < n; i++) {
                if (i in this && this[i] === find) {
                    return i;
                }
            }
            return -1;
        }
    }

})(window);