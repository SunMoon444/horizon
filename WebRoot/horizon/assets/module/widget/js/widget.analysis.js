/**
 * widget解析
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonJqueryui'], factory);
    }else {
        factory(jQuery);
    }
})(function($) {
    var urls = {
        customWidgetByLoginUser: horizon.paths.apppath + '/horizon/manager/widget/customWidgetByLoginUser.wf',
        savePersonCustom: horizon.paths.apppath + '/horizon/manager/widget/savePersonCustom.wf',
    };
    var $widgetContainer, sortableUpdateNum;

    var analysis = horizon.widget['analysis'] = {
        load: function() {
            $widgetContainer = $('.horizon-widget-container');
            sortableUpdateNum = 0;
            $.ajax({
                url: urls.customWidgetByLoginUser,
                data:{flag:'opt'},
                dataType: 'json',
                cache: false,
                error: function() {
                    horizon.notice.error(parent.horizon.lang["message"]["error"]);
                },
                success: function(data) {
                    if(data) {
                        var customWidgets = data.custom.customWidgets,
                            layoutAreas = data.layout.layoutAreas;
                        $widgetContainer.data('custom', data.custom);
                        if(horizon.vars.mobile) {
                            analysis.smaller(customWidgets);
                        }else {
                            analysis.large(customWidgets, layoutAreas);
                        }
                    }else {
                        $('.horizon-widget-empty').removeClass('hidden');
                    }
                }
            });
        },
        large: function(customWidgets, layoutAreas) {
            var $widgetTls = $('.widget-large-tls').children();
            if (!layoutAreas) return;
            $.each(layoutAreas, function(i, area) {
                var $area = $('<div data-area="' + (i + 1) + '" class="horizon-layout-area ui-sortable"></div>');
                $area.data('area', area);
                var areaClass = ['no-padding'];
                $.each(['xs', 'sm', 'md', 'lg'], function(k, size) {
                    area[size] ? areaClass.push('col-' + size + '-' + area[size]) : '';
                });
                $area.addClass(areaClass.join(' '));
                $.each(customWidgets, function(k, customWidget) {
                    if(area.id == customWidget.layoutAreaId){
                        var widget = customWidget.widget;
                        if(widget) {
                            var $widget = $widgetTls.clone();
                            $widget
                                .data({
                                    customWidget: customWidget
                                })
                                .attr('data-widget-id', customWidget.widgetId)
                                .addClass(widget.widgetClass)
                                .find('.widget-body')
                                .css('height', widget.height);
                            var title = [];
                            if(widget.iconType == 'class') {
                                title.push('<i class="ace-icon infobox-icon ' + widget.icon + '"></i>');
                            }else {
                                title.push('<img class="img-icon" src="' + widget.icon + '"></img>');
                            }
                            title.push('<span>' +widget.name+ '</span>');
                            $widget.find('.widget-title').append(title.join(''));
                            $widget.find('iframe')[0].src = widget.url;
                            $area.append($widget);
                        }
                    }
                });
                $widgetContainer.append($area);
            });
            $widgetContainer.find('.horizon-layout-area > .widget-box')
                .on('closed.ace.widget', function() {
                    $(this).remove();
                    var custom = $widgetContainer.data('custom');
                    if(custom.scope == 'user' && $widgetContainer.find('.widget-box').length){
                        analysis.update();
                    }
                })
                .on('reload.ace.widget', function() {
                    var $box = $(this),
                        $iframe = $box.find('iframe');
                    $iframe[0].contentWindow.location.reload();
                    setTimeout(function() {
                        $box.trigger('reloaded.ace.widget');
                    }, 1);
                });
            analysis.sortable();
        },
        smaller: function(customWidgets) {
            var $pill = $('<ul class="horizon-pills clearfix"></ul>'),
                $widgetTls = $('.widget-smaller-tls').children();
            $.each(customWidgets, function(i, customWidget) {
                var widget = customWidget.widget;
                if(widget) {
                    var $widget = $widgetTls.clone();
                    $widget.data({
                        customWidget: customWidget
                    }).attr('data-widget-id', customWidget.widgetId);
                    var title = [];
                    if(widget.iconType == 'class') {
                        title.push('<i class="ace-icon ' + widget.icon + '"></i>');
                    }else {
                        title.push('<img class="img-icon" src="' + widget.icon + '"></img>');
                    }
                    title.push('<span>' +widget.name+ '</span>');
                    $widget.find('a').append(title.join('')).on(horizon.tools.clickEvent(), function() {
                       horizon.open({
                           url: widget.url
                       })
                    });
                    $pill.append($widget);
                }
            });
            $widgetContainer.addClass('no-margin').append($pill);
        },
        //拖动
        sortable: function() {
            $('.horizon-layout-area').sortable({
                connectWith: '.horizon-layout-area',
                items:'> .widget-box',
                handle: horizon.vars.touch ? '.widget-header' : false,
                cancel: '.fullscreen',
                opacity: 0.8,
                revert: true,
                forceHelperSize: true,
                placeholder: 'widget-placeholder',
                forcePlaceholderSize: true,
                tolerance: 'pointer',
                start: function(event, ui) {
                    ui.placeholder.css({'min-height': ui.item.height()});
                    //组件开始拖动时触发，给每个iframe加上遮罩层
                    $widgetContainer.find('iframe').each(function() {
                        $("<div class='ui-sortable-iframeFix'></div>")
                            .css({
                                position: 'absolute',
                                top:'0px',
                                bottom: '0px',
                                filter: 'alpha(opacity:1)',
                                '-mozOpacity': '0.001',
                                opacity: '0.001',
                                backgroundColor: 'white',
                                zIndex: '1001',
                                width: '100%',
                                height: '100%'
                            })
                            .appendTo($(this).parent());
                    });
                },
                update: function(event, ui) {
                    if(sortableUpdateNum) return ;
                    sortableUpdateNum++;
                    ui.item.css('zIndex','');
                    analysis.update();
                },
                stop:function(event, ui) {
                    //组件拖动结束后触发，去除所有的遮罩层
                    $('div.ui-sortable-iframeFix').remove();
                }
            })
        },
        //拖动结束后保存个人定制信息
        update: function() {
            var custom = $widgetContainer.data('custom'),
                $areas = $('.horizon-layout-area');
            var _data = {
                areaCount: $areas.length,
                id: custom.id,
                scope: custom.scope,
                layoutId: custom.layoutId,
                description: custom.description,
                objectId: custom.objectId
            };
            $areas.each(function(i) {
                var $this = $(this),
                    layoutArea = $this.data('area'),
                    widgetIds = [];
                _data['area_id_' + i] = layoutArea.id;
                $this.children('.widget-box').each(function(k) {
                    var $widget = $(this),
                        widgetId = $widget.attr('data-widget-id');
                    widgetIds.push(widgetId);
                    _data[layoutArea.id + '_' + widgetId + '_ORDER'] = k;
                });
                _data[layoutArea.id+'_WIDGET'] = widgetIds.join(';');
            });
            $.ajax({
            	type:'POST',
                url: urls.savePersonCustom,
                data: _data,
                cache: false,
                dataType: 'json',
                error: function() {
                    horizon.notice.error(parent.horizon.lang["message"]["error"]);
                },
                success: function(data) {
                    if(data != null && data== true) {
                        $widgetContainer.data('custom', data.custom);
                        var $areas = $('.horizon-layout-area');
                        if(!data.custom) {
                            $areas.removeData('layoutArea');
                            return ;
                        }
                        $areas.each(function() {
                            var $this = $(this),
                                layoutArea = $this.data('layoutArea');
                            $.each(data.custom.customWidgets, function(i, customWidget) {
                                var widget = customWidget.widget;
                                if(layoutArea.id == customWidget.layoutAreaId){
                                    $this.find('.widget-box[data-widget-id="' + widget.id + '"]')
                                        .data('customWidget', customWidget);
                                }
                            });
                        });
                        sortableUpdateNum = 0;
                    }else if(data && data.delresult == 'true') {
                        $widgetContainer.removeData('custom');
                    }else{
                        horizon.notice.error( parent.horizon.lang["platform-widget"]["changeFailed"]);
                    }
                }
            });
        }
    };
    return analysis;
});
