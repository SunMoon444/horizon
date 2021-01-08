/**
 * 表单历史纪录
 * @author zhouwf
 * */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonNote'], factory);
    }else {
        factory(jQuery);
    }
})(function($) {
    horizon.form.history = horizon.form.history || {};
    horizon.form.history = $.extend({
        /**
         * 是否开启
         * */
        enable: false,
        /**
         * 修改前数据
         * */
        preData: null,
        /**
         * 所有历史数据
         * */
        records: null,
        /**
         * 所有历史数据分组
         * */
        recordsGroup: null,
        /**
         * 获取表单数据
         * */
        getFormData: function() {
            var $formIds = $('input[name="FORMID"]'),
                hasDataForm = [],
                formData = {};
            if($formIds.length) {
                $formIds.each(function() {
                    var formId = $(this).val(),
                        dataId = $('[name="' + formId + '_ID"]').val();
                    if(dataId) {
                        hasDataForm.push(formId);
                    }
                });
            }
            if(hasDataForm.length) {
            	var passFields = [];
                $('input[data-type="file"][type="file"]').each(function() {
                    passFields.push($(this).attr('name') + '_ID');
                });
                $.each(horizon.form.baseForm.serializeArray(), function(i, data) {
                    $.each(hasDataForm, function(i, formId) {
                        var bool = data['name'].indexOf(formId) != -1;
                        if(!bool) {
                            //是否是关联表字段
                            var $reFormId = $('input[name="' + formId + '_REFORMID"]');
                            if($reFormId.length) {
                                var reFormIdArr = $reFormId.val().split(';');
                                $.each(reFormIdArr, function(k, reFormId) {
                                    bool = data['name'].indexOf(reFormId) != -1;
                                    return !bool;
                                });
                            }
                        }

                        if(bool) {
                            var $field = $('[name="' + data['name'] + '"]:first'),
                                dataType = $field.attr('data-type'),
                                value = data['value'];
                            if($.inArray(dataType, ['file', 'opinion', 'editor', 'ueditor', 'sign']) != -1) return;
                            if($.inArray(data['name'], passFields) != -1) return;
                            if(dataType == 'select') {
                            	if($field.attr('multiple') == 'multiple') {
                            		value = [];
                            		$.each($field.val(), function(i, v) {
                            			value.push(v + '-' + $.trim($field.children('option[value="' + v + '"]').html()));
                            		});
                            	}else{
                            		value = $field.val() + '-' + $.trim($field.children('option[value="' + value + '"]').html());
                            	}
                            }else if(dataType == 'radio') {
                            	$field = $('[name="' + data['name'] + '"]:checked');
                            	value = $field.val() + '-' + $.trim($field.next('span').html());
                            }else if(dataType == 'checkbox') {
                            	value = [];
                                $('[name="' + data['name'] + '"]:checked').each(function() {
                                    value.push($(this).val() + '-' + $.trim($field.next('span').html()));
                                });
                            }
                            formData[formId] = formData[formId] || {};
                            formData[formId][data['name']] = value;
                            return false;
                        }
                    });
                });
            }
            return $.isEmptyObject(formData) ? null : formData;
        },
        /**
         * 获取被修改字段的历史数据
         * */
        getData: function() {
            var records = [],
                preData = $.extend(true, {}, this.preData),
                formData = this.getFormData(),
                ht = this;

            $('input[name="FORMID"]').each(function() {
                var formId = $(this).val(),
                    data = {},
                    created = '',
                    creator = '',
                    creatorName = '';
                if(ht.recordsGroup && ht.recordsGroup[formId]) {
                    var pre = ht.recordsGroup[formId][0];
                    created = pre['modified'];
                    creator = pre['modificator'];
                    creatorName = pre['modificatorName'];
                }
                if(!$.isEmptyObject(preData) && formData && formData[formId]) {
                    $.each(formData[formId], function(key, value) {
                        var preValue = preData[formId][key];
                        if(preValue == null) {
                            data[key] = "";
                        }else if(
                            ($.isArray(value) && preValue.join(';') != value.join(';')) ||
                            (!$.isArray(value) && preValue != value)
                            ) {
                            data[key] = preValue;
                        }
                        delete preData[formId][key];
                    });
                    if(!$.isEmptyObject(preData[formId])) {
                        $.extend(data, preData[formId]);
                    }
                }
                records.push(JSON.stringify({
                    formId: formId,
                    created: created,
                    creator: creator,
                    creatorName: creatorName,
                    history: $.isEmptyObject(data) ? '' : data
                }));
            });

            return records.length ? '[' + records.join(',') + ']' : null;
        },
        /**
         * 初始化页面字段历史记录
         * */
        init: function() {
            this.preData = this.getFormData();
            if(!(this.records && this.records.length)) return;
            var ht = this,
                records = {};
            ht.recordsGroup = {};
            $.each(this.records, function(i, record) {
                ht.recordsGroup[record.formId] = ht.recordsGroup[record.formId] || [];
                ht.recordsGroup[record.formId].push(record);
                if(!record.history) return;
                var history = JSON.parse(record.history);
                $.each(history, function(key, value) {
                    var arr = records[key] || [],
                        $field = $('[name="' + key + '"]:first'),
                        dataType = $field.attr('data-type');
                    if($.inArray(dataType, ['select', 'checkbox', 'radio']) != -1) {
                        var multiple = $field.attr('multiple') == 'multiple' || dataType == 'checkbox',
                            textArr = [],
                            valueArr = multiple ? value : [value];
                        $.each(valueArr, function(i, val) {
                            var value = val.split('-');
                            var text = val;
                            if(dataType == 'select') {
                                var $option = $field.children('option[value="' + value[0] + '"]');
                                if($option.length) {
                                    text = $option.text();
                                }else{
                                	text = value[1];
                                }
                            }else {
                                var $obj = $('[name="' + key + '"][value="' + value[0] + '"]');
                                if($obj.length) {
                                    text = $obj.next().html();
                                }else{
                                	text = value[1];
                                }
                            }
                            textArr.push(text);
                        });
                        value = textArr.join(';');
                    }
                    arr.push({
                        created: record.created,
                        creatorName: record.creatorName,
                        modified: record.modified,
                        modificatorName: record.modificatorName,
                        value:  value
                    });
                    records[key] = arr;
                });
            });
            if(!$.isEmptyObject(records)) {
                var $iconTls = $('<i data-rel="popover" class="history-icon hidden-print fa fa-lightbulb-o orange2 pointer position-absolute" style="z-index: 1;top:-5px;right:-4px;"></i>');
                $.each(records, function(key, value) {
                    var $field = $('[name="' + key + '"]'),
                        fieldType = $field.attr('type'),
                        $icon = $iconTls.clone();
                    if($field.closest('.graphic').length) {
                        var $formGroup = $field.closest('.form-group');
                        $icon.css({
                            left: parseInt($formGroup.css('left')) + parseInt($formGroup.css('width')) - 4 + 'px',
                            top: parseInt($formGroup.css('top')) - 5 + 'px',
                            right: 'inherit'
                        });
                        $formGroup.after($icon);
                    }else {
                        if(fieldType == 'hidden') {
                            var $read = $field.prev('.form-read-lable');
                            if($read.length) {
                                //只读
                                $read.append($icon);
                            }else return;
                        }else if(fieldType == 'checkbox' || fieldType == 'radio') {
                            $field.closest('.' + fieldType).append($icon);
                        }else {
                            $field.before($icon);
                        }
                    }
                    $icon.data('history', value);
                });
                $('i[data-rel="popover"]').popover({
                    html: true,
                    placement: 'right auto',
                    trigger: 'hover',
                    container: 'body',
                    title: function() {
                        var data = $(this).data('history')[0];
                        return data.modificatorName + '(' + data.modified + ')';
                    },
                    content: function() {
                        return ht.getContent($(this).data('history'));
                    }
                });
            }
        },
        getContent: function(history) {
            var $history = $('<div style="width:248px"></div>');
            var option = {
                local_data: history,
                columns: [
                    {
                        column_name: 'creatorName'
                    },
                    {
                        column_name: 'created'
                    },
                    {
                        column_name: 'value'
                    }
                ],
                timeline_content_dom: '<div class="purple bolder"> [creatorName] </div><div style="word-break: break-all;"> [value] </div>',
                group_column: 'created',
                group_type: 'datetime'
            };
            $history.horizonNote(option);
            return $history;
        }
    }, horizon.form.history);
});