/**
 * 框架页面
 * @author zhouwf
 */
(function (factory) {
    if(typeof define === 'function' && define.amd) {
        var array = [
            'jquery',
            ('ontouchstart' in document.documentElement)?'jqueryMobileCustom' : null,
            'bootstrap',
            'horizonJqueryui',
            'elementsScroller',
            'ace'
        ];
        if(document.getElementById('updatePassword')) {
            array.push('jqueryValidateAll', 'gritter');
        }
        define(array, factory);
    }else {
        factory(jQuery);
    }
}(function($) {

    //----------------------ace模版中的方法-------------------------
    function basics() {
        if(ace.vars['non_auto_fixed']) {
            $('body').addClass('mob-safari');
        }
        try{
            ace.vars['transition'] = !!$.support.transition.end
        }catch(e){}
    }

    function enableSidebar() {
        var $sidebar = $('.sidebar');
        if($.fn.ace_sidebar) $sidebar.ace_sidebar();
        if($.fn.ace_sidebar_scroll) $sidebar.ace_sidebar_scroll({
            'scroll_to_active': true, //scroll to selected item? (one time only on page load)
            'include_shortcuts': true, //true = include shortcut buttons in the scrollbars
            'include_toggle': ace.vars['safari'] || ace.vars['ios_safari'], //true = include toggle button in the scrollbars
            'smooth_scroll': 150, //> 0 means smooth_scroll, time in ms, used in first approach only, better to be almost half the amount of submenu transition time
            'outside': false//true && ace.vars['touch'] //used in first approach only, true means the scrollbars should be outside of the sidebar
        });
        if($.fn.ace_sidebar_hover)	$sidebar.ace_sidebar_hover({
            'sub_hover_delay': 750,
            'sub_scroll_style': 'no-track scroll-thin scroll-margin scroll-visible'
        });
    }

    function handleScrollbars() {
        var has_scroll = !!$.fn.ace_scroll;
        if(has_scroll) $('.dropdown-content').ace_scroll({reset: false, mouseWheelLock: true});

        if(has_scroll && !ace.vars['old_ie']) {//IE has an issue with widget fullscreen on ajax?!!!
            $(window).on('resize.reset_scroll', function() {
                $('.ace-scroll:not(.scroll-disabled)').not(':hidden').ace_scroll('reset');
            });
            if(has_scroll) $(document).on('settings.ace.reset_scroll', function(e, name) {
                if(name == 'sidebar_collapsed') $('.ace-scroll:not(.scroll-disabled)').not(':hidden').ace_scroll('reset');
            });
        }
    }

    function dropdownAutoPos() {
        $(document).on('click.dropdown.pos', '.dropdown-toggle[data-position="auto"]', function() {
            var offset = $(this).offset();
            var parent = $(this.parentNode);

            if ( parseInt(offset.top + $(this).height()) + 50
                >
                (ace.helper.scrollTop() + ace.helper.winHeight() - parent.find('.dropdown-menu').eq(0).height())
                ) parent.addClass('dropup');
            else parent.removeClass('dropup');
        });
    }

    function navbarHelpers() {
        $('.ace-nav [class*="icon-animated-"]').closest('a').one(clickEvent, function(){
            var icon = $(this).find('[class*="icon-animated-"]').eq(0);
            var $match = icon.attr('class').match(/icon\-animated\-([\d\w]+)/);
            icon.removeClass($match[0]);
        });

        $(document).on(clickEvent, '.dropdown-navbar .nav-tabs', function(e){
            e.stopPropagation();
            var $this;
            if( ($this = $(e.target).closest('[data-toggle=tab]')) && $this.length > 0) {
                $this.tab('show');
                e.preventDefault();
                $(window).triggerHandler('resize.navbar.dropdown')
            }
        });
    }

    function sidebarTooltips() {
        $('.sidebar .nav-list .badge[title],.sidebar .nav-list .badge[title]').each(function() {
            var tooltip_class = $(this).attr('class').match(/tooltip\-(?:\w+)/);
            tooltip_class = tooltip_class ? tooltip_class[0] : 'tooltip-error';
            $(this).tooltip({
                'placement': function (context, source) {
                    var offset = $(source).offset();

                    if( parseInt(offset.left) < parseInt(document.body.scrollWidth / 2) ) return 'right';
                    return 'left';
                },
                container: 'body',
                template: '<div class="tooltip '+tooltip_class+'"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
            });
        });
    }

    function someBrowserFix() {
        if( ace.vars['webkit'] ) {
            var ace_nav = $('.ace-nav').get(0);
            if( ace_nav ) $(window).on('resize.webkit_fix' , function(){
                ace.helper.redraw(ace_nav);
            });
        }
        if(ace.vars['ios_safari']) {
            $(document).on('ace.settings.ios_fix', function(e, event_name, event_val) {
                if(event_name != 'navbar_fixed') return;

                $(document).off('focus.ios_fix blur.ios_fix', 'input,textarea,.wysiwyg-editor');
                if(event_val == true) {
                    $(document).on('focus.ios_fix', 'input,textarea,.wysiwyg-editor', function() {
                        $(window).on('scroll.ios_fix', function() {
                            var navbar = $('#navbar').get(0);
                            if(navbar) ace.helper.redraw(navbar);
                        });
                    }).on('blur.ios_fix', 'input,textarea,.wysiwyg-editor', function() {
                        $(window).off('scroll.ios_fix');
                    })
                }
            }).triggerHandler('ace.settings.ios_fix', ['navbar_fixed', $('#navbar').css('position') == 'fixed']);
        }
    }

    function bsCollapseToggle() {
        $(document).on('hide.bs.collapse show.bs.collapse', function (ev) {
            var panel_id = ev.target.getAttribute('id');
            var panel = $('a[href*="#'+ panel_id+'"]');
            if(panel.length == 0) panel = $('a[data-target*="#'+ panel_id+'"]');
            if(panel.length == 0) return;

            panel.find(ace.vars['.icon']).each(function(){
                var $icon = $(this);

                var $match;
                var $icon_down = null;
                var $icon_up = null;
                if( ($icon_down = $icon.attr('data-icon-show')) ) {
                    $icon_up = $icon.attr('data-icon-hide')
                }else if( $match = $icon.attr('class').match(/fa\-(.*)\-(up|down)/) ) {
                    $icon_down = 'fa-'+$match[1]+'-down';
                    $icon_up = 'fa-'+$match[1]+'-up';
                }
                if($icon_down) {
                    if(ev.type == 'show') $icon.removeClass($icon_down).addClass($icon_up);
                    else $icon.removeClass($icon_up).addClass($icon_down);

                    return false;
                }
            });
        })
    }

    function smallDeviceDropdowns() {
        if(ace.vars['old_ie']) return;
        $('.ace-nav > li')
            .on('shown.bs.dropdown.navbar', function() {
                adjustNavbarDropdown.call(this);
            })
            .on('hidden.bs.dropdown.navbar', function() {
                $(window).off('resize.navbar.dropdown');
                resetNavbarDropdown.call(this);
            });

        function adjustNavbarDropdown() {
            var $sub = $(this).find('> .dropdown-menu');
            if( $sub.css('position') == 'fixed' ) {
                var win_width = parseInt($(window).width());
                var offset_w = win_width > 320 ? 60 : (win_width > 240 ? 40 : 30);
                var avail_width = parseInt(win_width) - offset_w;
                var avail_height = parseInt($(window).height()) - 30;
                var width = parseInt(Math.min(avail_width , 320));
                $sub.css('width', width);
                var tabbed = false;
                var extra_parts = 0;
                var dropdown_content = $sub.find('.tab-pane.active .dropdown-content.ace-scroll');
                if(dropdown_content.length == 0) dropdown_content = $sub.find('.dropdown-content.ace-scroll');
                else tabbed = true;

                var parent_menu = dropdown_content.closest('.dropdown-menu');
                var scrollHeight = $sub[0].scrollHeight;
                if(dropdown_content.length == 1) {
                    var content =  dropdown_content.find('.scroll-content')[0];
                    if(content) {
                        scrollHeight = content.scrollHeight;
                    }
                    extra_parts += parent_menu.find('.dropdown-header').outerHeight();
                    extra_parts += parent_menu.find('.dropdown-footer').outerHeight();
                    var tab_content = parent_menu.closest('.tab-content');
                    if( tab_content.length != 0 ) {
                        extra_parts += tab_content.siblings('.nav-tabs').eq(0).height();
                    }
                }
                var height = parseInt(Math.min(avail_height , 480, scrollHeight + extra_parts));
                var left = parseInt(Math.abs((avail_width + offset_w - width)/2));
                var top = parseInt(Math.abs((avail_height + 30 - height)/2));
                var zindex = parseInt($sub.css('z-index')) || 0;
                $sub.css({'height': height, 'left': left, 'right': 'auto', 'top': top - (!tabbed ? 1 : 3)});
                if(dropdown_content.length == 1) {
                    if(!ace.vars['touch']) {
                        dropdown_content.ace_scroll('update', {size: height - extra_parts}).ace_scroll('enable').ace_scroll('reset');
                    }
                    else {
                        dropdown_content
                            .ace_scroll('disable').css('max-height', height - extra_parts).addClass('overflow-scroll');
                    }
                }
                $sub.css('height', height + (!tabbed ? 2 : 7));
                if($sub.hasClass('user-menu')) {
                    $sub.css('height', '');
                    var user_info = $(this).find('.user-info');
                    if(user_info.length == 1 && user_info.css('position') == 'fixed') {
                        user_info.css({'left': left, 'right': 'auto', 'top': top, 'width': width - 2, 'max-width': width - 2, 'z-index': zindex + 1});
                    }
                    else user_info.css({'left': '', 'right': '', 'top': '', 'width': '', 'max-width': '', 'z-index': ''});
                }
                $(this).closest('.navbar.navbar-fixed-top').css('z-index', zindex);
            }
            else {
                if($sub.length != 0) resetNavbarDropdown.call(this, $sub);
            }
            var self = this;
            $(window)
                .off('resize.navbar.dropdown')
                .one('resize.navbar.dropdown', function() {
                    $(self).triggerHandler('shown.bs.dropdown.navbar');
                })
        }

        //reset scrollbars and user menu
        function resetNavbarDropdown($sub) {
            $sub = $sub || $(this).find('> .dropdown-menu');

            if($sub.length > 0) {
                $sub
                    .css({'width': '', 'height': '', 'left': '', 'right': '', 'top': ''})
                    .find('.dropdown-content').each(function() {
                        if(ace.vars['touch']) {
                            $(this).css('max-height', '').removeClass('overflow-scroll');
                        }

                        var size = parseInt($(this).attr('data-size') || 0) || $.fn.ace_scroll.defaults.size;
                        $(this).ace_scroll('update', {size: size}).ace_scroll('enable').ace_scroll('reset');
                    });

                if( $sub.hasClass('user-menu') ) {
                    $(this).find('.user-info')
                            .css({'left': '', 'right': '', 'top': '', 'width': '', 'max-width': '', 'z-index': ''});
                }
            }

            $(this).closest('.navbar').css('z-index', '');
        }
    }
    //-------------------------------------------------------------

    var $body = $('body'),
        $sidebar = $('#sidebar'),//横向菜单
        $sidebar2 = $('#sidebar2'),//纵向菜单
        $defaultNav = $('#default-nav'),//导航默认DOM
        $pageContent = $('.page-content'),
        $pageContentArea = $('[data-ajax-content=true]'),
        $dialog= $('#dialog-default'),
        clickEvent = horizon.tools.clickEvent(),
        hasTwoNav = $.inArray(horizon.vars.layout, ['top-left', 'top-left-hoversubmenu', 'bottom-left', 'bottom-left-hoversubmenu']) != -1,
        hasBottomNav = $.inArray(horizon.vars.layout, ['bottom-left', 'bottom-left-hoversubmenu']) != -1,
        hoverNav = $.inArray(horizon.vars.layout, ['top', 'top-left-hoversubmenu', 'bottom-left-hoversubmenu', 'left-hoversubmenu']) != -1,

        navDefUrl = 'NAV_DEF_URL',
        navBottomPos = 'NAV_BOTTOM_POS';

    //执行ace模版方法
    basics();
    handleScrollbars();
    dropdownAutoPos();
    navbarHelpers();
    sidebarTooltips();
    someBrowserFix();
    bsCollapseToggle();
    smallDeviceDropdowns();

    horizon.framepage = {
        storageSpace: '',
        sources: {
            navmenu: null,
            logout: null,
            checkPassword: null,
            updatePassword: null,
            base: null
        },
        getBase: function(type, callback) {
            $.ajax({
                url: horizon.framepage.sources.base,
                dataType: 'json',
                cache: false,
                data: {
                    type: type
                },
                success: function (data) {
                    if(data) {
                        $body.addClass(data.embed)
                            .attr({
                                'data-layout': data.layout,
                                'data-fixed-modal': data['fixedModal']
                            });
                        $('.user-info .username').html(data.userName);
                        if(data.loginSource) {
                            if(data.loginSource == 'system') {
                                $('.page-content-area').attr('data-default-page', 'page/tenant.list');
                            }else {
                                $('#updatePassword').parent().next('.divider').remove().end().remove();
                            }
                        }
                        if(callback) {
                            callback(data);
                        }
                    }
                }
            });
        },
        //加载index页面
        initPage: function() {
            $pageContentArea.ace_ajax({
                'update_active': function(hash, url) {
                    var $sidebars = $('#sidebar, #sidebar2'),
                        link_element = $sidebars.find('a[href="#' + hash + '"]');
                    if(!link_element.length) {
                        hash = horizon.framepage.nav.getDefUrl();
                        link_element = $sidebars.find('a[href="#' + hash + '"]');
                        if(!link_element.length) {
                            return false;
                        }
                    }else if(link_element.attr('data-children') == 'true') {
                        var _id = link_element.attr('id'), _url = link_element.attr('data-url');
                        $sidebars.find('a[data-url="' + _url + '"]').each(function() {
                            var $this = $(this),
                                bool = true;
                            if(!($this.attr('data-children') == 'true'
                                && $this.siblings('.submenu').find('a[data-url="' + _url + '"]').length)) {
                                $this.parents('li').each(function() {
                                    if(_id == $(this).children('a').attr('data-parentid')) {
                                        link_element = $this;
                                        bool = false;
                                    }
                                    return bool;
                                });
                            }
                            return bool;
                        });
                    }
                    if(link_element.length) {
                        if(link_element.length == 1 && link_element.closest('.sidebar').is('#sidebar2')) {
                            link_element = link_element.add($sidebar.find('#' + link_element.parents('li:last').children('a').attr('data-parentid')));
                        }
                        var nav = $('.sidebar').find('.nav');
                        if(nav.length) {
                            var $preActive = nav.find('.active').removeClass('active'),
                                $active = link_element.closest('li').addClass('active')
                                    .parents('.nav li').addClass('active'),
                                reset = false;
                            $preActive.filter('.open').each(function() {
                                var $this = $(this);
                                if(!$this.is($active)) {
                                    $this.removeClass('open');
                                    $this.find(' > .submenu').removeClass('nav-show').css('display', '');
                                    reset = true;
                                }
                            });
                            if(reset) {
                                setTimeout(function() {
                                    nav.closest('.sidebar[data-sidebar-hover=true]').each(function() {
                                        var $this = $(this);
                                        $this.ace_sidebar_hover('reset');
                                    });
                                    nav.closest('.sidebar[data-sidebar-scroll=true]').each(function() {
                                        var $this = $(this);
                                        $this.ace_sidebar_scroll('reset');
                                        $this.ace_sidebar_scroll('scroll_to_active');
                                    });
                                }, $.support && $.support.transition && $.support.transition.end ? 300 : 0);
                            }
                        }
                    }
                },
                'content_url': function(hash) {
                    var $sidebars = $('#sidebar, #sidebar2'),
                        $a = $sidebars.find('a[href="#' + hash + '"]');
                    if(!$a.length) {
                        var defaultUrl = horizon.framepage.nav.getDefUrl();
                        $a = $sidebars.find('a[href="#' + defaultUrl + '"]');
                        if(!$a.length) {
                            return false;
                        }
                    }
                    if(hasTwoNav) {
                        $body.removeClass('hidden-sidebar2');
                        $sidebar2.removeClass('hidden');
                        $pageContent.removeClass('no-margin-left');
                        $('button[data-target="#sidebar2"]').removeClass('hidden');
                    }

                    if($a.closest('#sidebar').length) {
                        if($a.attr('data-children') == 'true') {
                            $sidebar2
                                .find('.nav > li').addClass('hidden')
                                .find('a[data-parentid="' + $a.attr('id') + '"]')
                                .parent().removeClass('hidden');
                        }else {
                            $body.addClass('hidden-sidebar2');
                            $sidebar2.addClass('hidden');
                            $pageContent.addClass('no-margin-left');
                            $('button[data-target="#sidebar2"]').addClass('hidden');
                        }
                    }else {
                        $sidebar2.find('.nav > li').addClass('hidden')
                            .find('a[data-parentid="' + $a.parents('li:last').children('a').attr('data-parentid') + '"]')
                            .parent().removeClass('hidden');
                    }
                    var url = $a.attr('data-url');
                    if($a.attr('data-type') == 'sysmain' || $a.attr('data-type') == 'iframe') {
                        url = horizon.paths.commonpath + '/iframe.ajaxpage.common.html';
                    }
                    horizon.framepage.nav.setDefUrl(hash);
                    return url;
                },
                'default_url': horizon.framepage.nav.getDefUrl(),
                /**
                 * 用于在获得html后进行对html进行格式化,主要用于国际化
                 * @auther lichao 2017-4-11
                 */
                'format_result': horizon.language.handlePage
            }).on('ajaxloadcomplete', function() {
                horizon.vars.ie ? $(':focusable').focus() : '';
            })
            .on('ajaxloadstart', function() {
                var $toggleSidebarBtn = $('.navbar-toggle[data-target="#sidebar"]');
                if($toggleSidebarBtn.css('display') != 'none' && $('#sidebar').hasClass('in')) {
                    $toggleSidebarBtn.trigger('click.bs.collapse.data-api');
                }
                var $toggleSidebar2Btn = $('.navbar-toggle[data-target="#sidebar2"]');
                if($toggleSidebar2Btn.css('display') != 'none' && $('#sidebar2').hasClass('display')) {
                    $toggleSidebar2Btn.trigger(clickEvent);
                }
                var $toggleNavbarBtn = $('.navbar-toggle[data-target=".navbar-buttons,.navbar-menu"]');
                if($toggleNavbarBtn.css('display') != 'none' && $('.navbar-buttons,.navbar-menu').hasClass('in')) {
                    $toggleNavbarBtn.trigger('click.bs.collapse.data-api');
                }
            });
        },
        nav: {
            data: null,
            getDefUrl: function() {
                var defaultUrl = horizon.storage.get(horizon.framepage.storageSpace, navDefUrl);
                if(defaultUrl) {
                    var $sidebars = $('#sidebar, #sidebar2'),
                        $a = $sidebars.find('a[href="#' + defaultUrl + '"]');
                    if(!$a.length) {
                        horizon.storage.remove(horizon.framepage.storageSpace, navDefUrl);
                        defaultUrl = $pageContentArea.attr('data-default-page');
                    }
                }else {
                    defaultUrl = $pageContentArea.attr('data-default-page');
                }
                return defaultUrl;
            },
            setDefUrl: function(hash) {
                var bool = this.isDefUrl;
                if($.isFunction(this.isDefUrl)) {
                    bool = this.isDefUrl(hash);
                }
                if(bool) {
                    horizon.storage.set(horizon.framepage.storageSpace, navDefUrl, hash);
                }
            },
            isDefUrl: false,
            init: function() {
                if($.inArray(horizon.vars.layout, ['left', 'left-hoversubmenu']) != -1) {
                    $('#navbar').removeClass('h-navbar');
                    $sidebar.removeClass('h-sidebar navbar-collapse collapse')
                        .addClass('responsive menu-min');
                    $sidebar.children('.sidebar-collapse').removeClass('hidden');
                    $('button[data-target="#sidebar"]')
                        .removeAttr('data-toggle')
                        .removeClass('collapsed')
                        .addClass('menu-toggler');
                }
                if($('body').hasClass('embed')) {
                    $(document).on(clickEvent, '.navbar-toggle.toggle-sidebar, .navbar-toggle.toggle-sidebar2', function() {
                        $($(this).attr('data-target')).trigger(clickEvent);
                    });
                }
                $.ajax({
                    url: horizon.framepage.sources.navmenu,
                    cache: false,
                    dataType: 'json',
                    error: function() {
                        $('.page-content-area').html(horizon.lang.base.error || 'error');
                    },
                    success: function(data) {
                        if(data && data.length) {
                            horizon.framepage.nav.data = data;
                            var $container = $sidebar.find('.nav');
                            $.each(horizon.framepage.nav.data,function(i, nav) {
                                horizon.framepage.nav.createNav(nav, $container);
                            });
                            horizon.framepage.initPage();
                            enableSidebar();
                            if(hasTwoNav) {
                                horizon.framepage.nav.initHorizontalCollapse();
                            }
                        }
                    }
                });
            },
            createNav: function(nav, $container) {
                var hasChildren = !!nav.children,
                    $navLi = $defaultNav.children('li:first').clone(),
                    $container2 = $sidebar2.find('.nav');
                if(!hasTwoNav) {
                    $container2 = $container;
                }
                if((!hasTwoNav || $container.closest('.sidebar').is('#sidebar2')) && hasChildren ) {
                    $navLi = $defaultNav.children('li:last').clone();
                    $container2 = $navLi.children('.submenu');
                }
                if((!hasTwoNav || $container.closest('.sidebar').is('#sidebar2')) && hoverNav) {
                    $navLi.addClass('hover');
                }
                var $a = $navLi.find('a');
                $a.attr({
                    'id': nav.id,
                    'data-children': hasChildren,
                    'data-type': nav.dataType,
                    'data-url': nav.dataUrl,
                    'data-parentid': nav.parentId,
                    'href': (function() {
                        var _href = 'javascript:void(0);';
                        if(nav.dataUrl) {
                            if(nav.dataType == 'blank') {
                                _href = 'javascript:horizon.open({url: \'' + nav.dataUrl + '\'})'
                            }else {
                                if(nav.dataType == 'ajax') {
                                    _href = nav.dataUrl.substring(nav.dataUrl.lastIndexOf('/') + 1, nav.dataUrl.lastIndexOf('.')) || nav.dataUrl;
                                    if($('#sidebar, #sidebar2').find('a[href="#page/' + _href + '"]').length) {
                                        _href = nav.id;
                                    }
                                }else {
                                    _href = nav.id;
                                }
                                _href =  '#page/' + _href;
                            }
                        }
                        return _href;
                    })()
                });
                $a.children('.menu-icon').addClass(nav.menuIcon);
                $a.children('.menu-text').attr('title', nav.menuText).text(nav.menuText);
                $a.data('nav', nav);
                if(nav.func) {
                    $a.on(clickEvent, function(e) {
                        eval(nav.func);
                    });
                }
                $container.append($navLi);
                if(hasChildren) {
                    $.each(nav.children,function(i, navChild) {
                        horizon.framepage.nav.createNav(navChild, $container2);
                    });
                }
            },
            initHorizontalCollapse: function() {
                var $scrollBody = $sidebar.find('.nav-wrap');
                var $btnLeft = $('.nav-horizontal-collapse > .horizontal-collapse[data-toggle="left"]');
                var $btnRight = $('.nav-horizontal-collapse > .horizontal-collapse[data-toggle="right"]');
                $btnLeft.on(clickEvent, function() {
                    $scrollBody.animate({
                        scrollLeft: $scrollBody.scrollLeft() - 420
                    });
                });
                $btnRight.on(clickEvent, function() {
                    $scrollBody.animate({
                        scrollLeft: $scrollBody.scrollLeft() + 420
                    });
                });
                $scrollBody.scroll(function() {
                    var $this = $(this);
                    if($this.scrollLeft() == 0) {
                        $btnLeft.hide();
                        $btnLeft.attr('data-show', false);
                    }else {
                        $btnLeft.show();
                        $btnLeft.attr('data-show', true);
                    }
                    if($this.scrollLeft() + $this[0].offsetWidth == $this[0].scrollWidth) {
                        $btnRight.hide();
                        $btnRight.attr('data-show', false);
                    }else {
                        $btnRight.show();
                        $btnRight.attr('data-show', true);
                    }
                    if($this[0].offsetWidth < $this[0].scrollWidth) {
                        $scrollBody.children('.nav-list').css('display', 'table');
                    }else {
                        $scrollBody.children('.nav-list').css('display', 'inherit');
                    }
                });
                $scrollBody.scroll();
                var timer, marginLeft;
                if(hasBottomNav) {
                    var $navTrigger = $('.nav-trigger');
                    $sidebar.draggable({
                        handle: $navTrigger,
                        drag: function(event, ui) {
                            var winHeight = parseInt($(window).height()),
                                winWidth = parseInt($(window).width());
                            ui.position.left += marginLeft;
                            if(ui.position.left < 0) {
                                ui.position.left = 0;
                            }else if(ui.position.left > winWidth - 70) {
                                ui.position.left = winWidth - 70;
                            }
                            if(ui.position.top < 45) {
                                ui.position.top = 45;
                            }else if(ui.position.top > winHeight - 54) {
                                ui.position.top = winHeight - 54;
                            }
                        },
                        start: function() {
                            var _marginLeft = parseInt($sidebar.css('marginLeft'));
                            if(_marginLeft != 0) {
                                marginLeft = _marginLeft;
                                $sidebar.css('marginLeft', 0);
                            }
                        },
                        stop: function(event, ui) {
                            $navTrigger.data('dragEnd', true);
                            marginLeft = 0;
                            horizon.storage.set(horizon.framepage.storageSpace, navBottomPos, JSON.stringify(ui.position));
                        }
                    });
                    $navTrigger.on(clickEvent, function() {
                        if($navTrigger.data('dragEnd')) {
                            $navTrigger.removeData('dragEnd');
                        }else {
                            $sidebar.toggleClass('hide-nav-list');
                        }
                    });
                    $(window).on('resize.nav-wrap', function() {
                        var winHeight = parseInt($(window).height()),
                            winWidth = parseInt($(window).width());
                        if(winWidth < 992) {
                            $sidebar.attr('style', '');
                            $btnLeft.attr('style', '');
                            $btnRight.attr('style', '');
                        }else {
                            var position = horizon.storage.get(horizon.framepage.storageSpace, navBottomPos);
                            if(position) {
                                marginLeft = 0;
                                $sidebar.css($.extend({
                                    marginLeft: marginLeft,
                                    width: '555px',
                                    height: '54px',
                                    right: 'auto',
                                    bottom: 'auto'
                                }, JSON.parse(position)));
                            }
                            if(parseInt($sidebar.css('left')) > winWidth - 70) {
                                $sidebar.css('left', winWidth - 70);
                            }
                            if(parseInt($sidebar.css('top')) > winHeight - 54) {
                                $sidebar.css('top', winHeight - 54);
                            }
                            if($btnLeft.attr('data-show') == 'true') {
                                $btnLeft.show();
                            }
                            if($btnRight.attr('data-show') == 'true') {
                                $btnRight.show();
                            }
                        }
                    });
                    if(horizon.storage.get(horizon.framepage.storageSpace, navBottomPos)) {
                        setTimeout(function() {
                            $(window).trigger('resize.nav-wrap');
                        }, 1000);
                    }
                }else {
                    $(window).on('resize.nav-wrap', function() {
                        window.clearTimeout(timer);
                        timer = setTimeout(function() {
                            $scrollBody.scroll();
                        }, 100);
                    });
                }
            }
        },
        initLogout: function() {
            $('[data-operator="logout"]').on(clickEvent, function() {
                $dialog.dialog({
                    closeText: horizon.lang.base.close,
                    title: horizon.lang.base.logout,
                    dialogText: horizon.lang.base.logoutConfirm,
                    dialogTextType: 'alert-danger',
                    buttons: [{
                        html: horizon.lang.base.ok,
                        "class" : "btn btn-primary btn-xs",
                        click: function() {
                            //window.location.href = horizon.framepage.sources.logout;
                            $.ajax({
                                url: horizon.framepage.sources.logout,
                                cache: false,
                                dataType: 'json',
                                success: function (data) {
                                    if(data) {
                                        window.location.href = horizon.paths.apppath + data;
                                    }
                                }
                            });
                        }
                    }]
                });
            });
        },
        initUpdatePassword: function() {
            var $updatePassword = $('[data-operator="updatePassword"]');
            if(!$updatePassword.length) return;
            $updatePassword.on(clickEvent, function() {
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
                            url: horizon.framepage.sources.checkPassword,
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
                errorPlacement: function (error, element) {
                    element.parent().siblings('.help-block').remove();
                    error.insertAfter(element.parent());
                },
                submitHandler: function(form) {
                    $.ajax({
                        url: horizon.framepage.sources.updatePassword,
                        cache: false,
                        type: 'POST',
                        data: $(form).serializeArray(),
                        dataType: 'json',
                        error: function() {
                        	horizon.notice.error(horizon.lang.message.updateError);
                        },
                        success: function(data) {
                            if(data.restype != 'err'){
                                location.href = horizon.paths.apppath+'/horizon/platform/reLogin.wf';
                                //location.href = horizon.framepage.sources.logout;
                            }else{
                            	horizon.notice.error(horizon.lang.message.updateFail);
                            }
                        }
                    });
                }
            });
        },
        init: function() {
            this.nav.init();
            this.initLogout();
            this.initUpdatePassword();
        }
    };

    $(document).on(clickEvent + '.ace.menu', '.sidebar-collapse', function() {
        $(window).trigger('resize.ace.sidebar_scroll');
        var $dataTables = $('.dataTable');
        if($dataTables.length) {
            $dataTables.each(function() {
                if($(this).data('horizonTable')) {
                    $(this).data('horizonTable').pluginTable.fnAdjustColumnSizing(false);
                }
            });
        }
    });

}));
