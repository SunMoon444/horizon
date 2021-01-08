/**
 * Created by zhouwf on 2015-7-16.
 * 生成流程操作记录： 有时间轴和表格两种显示方式
 * PS: 除流程操作记录外也可用于其它数据的展示, 只需正确提供配置项即可
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define('horizonNote', ['jquery'], factory);
    }
    else {
        factory(jQuery);
    }
})(function($) {
    var horizonNote = {
        server_data: function(container, option) {
            $.ajax({
                url: option.url,
                data: option.data,
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if(!data) {
                        container.html(option.lang.empty_text);
                        return ;
                    }
                    container.data('horizonNote', data);
                    container.data('horizonNote_option', option);
                    horizonNote[option.type].apply(this, [container, option]);
                }
            });
        },
        local_data: function(container, option) {
            container.data('horizonNote', option.local_data);
            container.data('horizonNote_option', option);
            horizonNote[option.type].apply(this, [container, option]);
        },
        timeline: function(container, option) {
            var operationNote = container.data('horizonNote');
            var groups = {}, groupTitle = '';
            //先对数据进行分组
            if(option.group_column) {
                $.each(operationNote, function(i, data) {
                    if(option.group_type == 'datetime') {
                        var groupArr = data[option.group_column].split(' ');
                        groupTitle = groupArr[0];

                    }else {
                        groupTitle = data[option.group_column];
                    }
                    var replace_text = data[option.group_column + '_replace_text'];
                    if(replace_text && option.lang && typeof option.lang[replace_text] != 'undefined') {
                        groupTitle = option.lang[replace_text];
                    }
                    if(typeof groups[groupTitle] == 'undefined') {
                        groups[groupTitle] = [];
                    }
                    groups[groupTitle].push(data);
                });
            }else {
                groups['defaultGroup'] = operationNote;
            }

            //对分组数据循环输出
            var timeline_html = '';
            for(var title in groups) {
                var hasSub = (option.group_column && option.group_type == 'datetime') || !!option.sub_column || false;
                var timeline_container_html = '<div class="timeline-container timeline-style2 ' + (hasSub ? '' : 'noline') + '">';
                timeline_container_html += (title === 'defaultGroup' ? '' : '<span class="timeline-label ' + (hasSub ? '' : 'align-left') + '"><b>' + title + '</b></span>');
                timeline_container_html += '<div class="timeline-items">';
                $.each(groups[title], function(i, item) {
                    timeline_container_html += '<div class="timeline-item clearfix">';
                    if(hasSub) {
                        var subTitle = '';
                        if(option.group_column && option.group_type == 'datetime') {
                            subTitle = item[option.group_column].split(' ')[1];
                        }else if(option.sub_column) {
                            subTitle = item[option.sub_column]
                        }
                        timeline_container_html += '<div class="timeline-info">';
                        timeline_container_html += '<span class="timeline-date">' + subTitle + '</span>';
                        timeline_container_html += '<i class="timeline-indicator btn btn-info no-hover"></i>';
                        timeline_container_html += '</div>';
                        timeline_container_html += '<div class="widget-box transparent">';
                    }else {
                        timeline_container_html += '<div class="widget-box transparent no-margin-left">';
                    }
                    timeline_container_html += '<div class="widget-body">';
                    timeline_container_html += '<div class="widget-main no-padding">';
                    var content_dom = option.timeline_content_dom;
                    var replaceTextArr = content_dom.match(/\[[^\]]+\]/g);
                    $.each(replaceTextArr, function(i, text) {
                        var column = text.replace(/\[/g, '').replace(/\]/g, '');
                        if(column in item) {
                            var arr = content_dom.split(text);
                            content_dom = arr[0] + item[column] + (arr.length > 1 ? arr[1] : '');
                        }
                    });
                    timeline_container_html += content_dom;
                    timeline_container_html += '</div></div></div></div>';
                });
                timeline_container_html += '</div></div>';
                timeline_html += timeline_container_html;
            }
            var $timeline = $(timeline_html).hide();
            container.append($timeline);
            $timeline.show(option['time'], function() {
                if(typeof option['fnAfterSuccess'] === 'function') {
                    option['fnAfterSuccess'].apply(this, [container]);
                }
            });
        },
        table: function(container, option) {
            var operationNote = container.data('horizonNote');
            var table_html = '<table class="operation-table ' + option.table_class + ' ">';
            var thead_html = '<thead class="' + option.thead_class + '"><tr>';
            var tbody_html = '<tbody>';
            $.each(operationNote, function(i, _data) {
                var tr_html = '<tr>';
                $.each(option.columns, function(k, column) {
                    if(i == 0) {
                        thead_html += '<th class="' + column.head_class + '">' +
                            (column.head_icon != null && column.head_icon != '' ? '<i class="ace-icon ' + column.head_icon + '"></i> ' : '') +
                            option.lang.header_text[k] +
                            '</th>';
                    }
                    var td_html = '<td class="' + column.column_class + '">' + _data[column.column_name] + '</td>';
                    tr_html += td_html;
                });
                tr_html += '</tr>';
                tbody_html += tr_html;
            });
            thead_html += '</tr></thead>';
            tbody_html  += '</tbody>';
            table_html += thead_html + tbody_html + '</table>';
            var $table = $(table_html).hide();
            container.append($table);
            $table.show(option['time'], function() {
                if(typeof option['fnAfterSuccess'] === 'function') {
                    option['fnAfterSuccess'].apply(this, [container]);
                }
            });
        },
        change_showlist: function(container, option) {
            if(option.type == 'timeline') {
                var $timelines = container.find('.timeline-container');
                if($timelines.length > 0) {
                    container.find('.operation-table').hide();
                    $timelines.show(option['time']);
                }else {
                    horizonNote.timeline(container, option);
                    container.find('.operation-table').hide();
                }
            }else if(option.type == 'table') {
                var $table = container.find('.operation-table');
                if($table.length > 0) {
                    container.find('.timeline-container').hide();
                    $table.show(option['time']);
                }else {
                    horizonNote.table(container, option);
                    container.find('.timeline-container').hide();
                }
            }
        }
    };

    $.fn.horizonNote = function(option){
        var $this = $(this);
        if(typeof option == 'string') {
            var _option = $this.data('horizonNote_option');
            _option.type = option;
            horizonNote.change_showlist($this, _option);
        }else {
            option = option ? $.extend(true, {}, defaults, option) : defaults;
            var $load = $(option.load);
            $this.append($load);
            if(option.url) {
                horizonNote.server_data($this, option);
            }else if(option.local_data) {
                horizonNote.local_data($this, option);
            }else {
                $this.html(option.lang.empty_text);
            }
            $load.remove();
        }
    };
    var defaults = $.fn.horizonNote.defaults = {
        time: 0,
        load: '<div class="loaddiv">' +
            '<i class="ace-icon fa fa-spinner fa-spin orange bigger-125"></i>' +
            '</div>',
        url: null, //请求地址
        data: null, //请求参数
        local_data: null, //本地数据
        type: 'timeline', //timeline/table
        table_class: 'table table-striped table-bordered table-hover no-margin-bottom',// for table
        thead_class: 'thin-border-bottom',// for table
        columns: null,
        timeline_content_dom: null,
        group_column: null,// for timeline
        group_type: 'datetime',//datetime/string   // for timeline
        sub_column: null,// for timeline   如果 group_type 是 datetime ,此项无效
        lang: null,
        fnAfterSuccess: null
    };
});