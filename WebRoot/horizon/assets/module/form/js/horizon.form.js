(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'jquery',
            'jqueryValidateAll',
            (horizon.form.history && horizon.form.history.enable ? 'horizonFormHistory' : null)
        ], factory);
    } else {
        factory(jQuery);
    }
})(function ($) {
    $.extend(horizon.form, {
        formId: horizon.tools.getQueryString('formId') || horizon.tools.getQueryString('formid'),
        dataId: horizon.tools.getQueryString('dataId') || horizon.tools.getQueryString('dataid'),
        baseForm: $('.base-form'),
        lang: ['validator', 'platform-form', 'base'],
        submit: function () {
            this.baseForm.submit();
        },
        reset: function () {
            this.baseForm.trigger('reset');
        },
        print: function () {
            var formId = horizon.form.formId,
                dataId = horizon.form.dataId;
            if (!formId) {
                $('input[name="FORMID"]').each(function () {
                    var $this = $(this);
                    if ($this.closest('.tab-pane').hasClass('active')) {
                        formId = $this.val();
                        dataId = $('input[name="' + formId + '_ID"]').val();
                        return false;
                    }
                });
            }
            window.open(horizon.paths.apppath + '/horizon/template/form/print.wf?formId=' + formId + '&dataId=' + dataId);
        },
        pluginArr: [
            'number',
            'date',
            'datetime',
            'textarea',
            'select',
            'org',
            'file',
            'editor',
            'ueditor'],
        plugins: {
            number: {
                css: [],
                js: ['elementsSpinner']
            },
            date: {
                css: [],
                js: ['laydate']
            },
            datetime: {
                css: [],
                js: ['laydate']
            },
            textarea: {
                css: [],
                js: ['jqueryAutosize']
            },
            select: {
                css: ['chosen/css/chosen.css'],
                js: ['chosenJquery']
            },
            org: {
                css: ['ztree/css/zTreeStyle/zTreeStyle.css'],
                js: ['horizonSelectuser']
            },
            file: {
                css: [horizon.paths.apppath + '/horizon/plugins/colorbox/css/colorbox.css'],
                js: ['elementsFileinput', 'colorBox']
            },
            editor: {
                css: [],
                js: ['elementsWysiwyg']
            },
            ueditor: {
                css: [],
                js: ['ueditor-' + horizon.vars.lang.toLowerCase()]
            }
        },
        css: [],
        module: [
            'jquery',
            'horizonJqueryui'
        ],
        setParamVal: function () {
            if (!$('input[name="FORMID"]').length) {
                return;
            }
            var urlSearch = window.location.search.substr(1);
            if (urlSearch != null && urlSearch != '') {
                var paramArr = urlSearch.split('&');
                $.each(paramArr, function (i, con) {
                    var name = con.split('=')[0];
                    var value = con.split('=')[1];
                    if (value) {
                        value = decodeURI(value);
                    }
                    $('input[name="FORMID"]').each(function () {
                        var $field = $('[name="' + $(this).val() + '_' + name + '"]');
                        if ($field && $field.length) {
                            $field.val(value);
                        }
                    });
                    $('input[name="RFORMID"]').each(function () {
                        var $field = $('[name="' + $(this).val() + '_' + name + '"]');
                        if ($field && $field.length) {
                            $field.val(value);
                        }
                    });
                    $('input[name="SUBFORMID"]').each(function () {
                        var $field = $('[name="' + $(this).val() + '_' + name + '"]');
                        if ($field && $field.length) {
                            $field.val(value);
                        }
                    });
                });
            }
        },
        validateOption: {
            errorElement: 'div',
            errorClass: 'help-block col-xs-12 col-sm-reset inline',
            focusInvalid: true,
            ignore: '.ignore, .ignore *',
            highlight: function (e) {
                $(e).closest('.form-group').addClass('has-error');
            },
            success: function (e) {
                $(e).closest('.form-group').removeClass('has-error');
                $(e).remove();
            },
            errorPlacement: function (error, element) {
                if ($('#' + error.attr('id')).length) return;
                if (element.is('input[type=checkbox]') || element.is('input[type=radio]')) {
                    var controls = element.closest('div[class*="' + element.attr('type') + '"]');
                    if (controls.find(':checkbox,:radio').length > 1) {
                        error.insertAfter(controls);
                        controls.css('height', controls.innerHeight());
                    } else error.insertAfter(element.nextAll('.lbl:eq(0)').eq(0));
                } else if (element.is('.select2')) {
                    error.insertAfter(element.siblings('[class*="select2-container"]:eq(0)'));
                } else if (element.is('.chosen-select')) {
                    error.insertAfter(element.siblings('[class*="chosen-container"]:eq(0)'));
                } else if (element.is('textarea')) {
                    if (element.attr('data-type') == 'opinion') {
                        element.parent().siblings('.help-block').remove();
                        error.insertAfter(element.parent());
                    } else {
                        error.insertAfter(element);
                    }
                } else if (element.is('.spinbox-input')) {
                    error.insertAfter(element.closest('.input-icon'));
                } else {
                    element.parent().siblings('.help-block').remove();
                    error.insertAfter(element.parent());
                }
            },
            submitHandler: function (form) {
                /*if (horizon.form.history && horizon.form.history.enable) {
                 var history = horizon.form.history.getData(),
                 $history = horizon.form.baseForm.find('input[name="HISTORY"]');
                 if ($history.length) {
                 $history = $('<input name="HISTORY" type="hidden"/>');
                 horizon.form.baseForm.append($history);
                 }
                 $history.val((history ? history : ''));
                 }*/
                horizon.form.baseForm.find('input[data-type="radio-read"]').attr("disabled", false);
                horizon.form.baseForm.find('input[data-type="select-read"]').attr("disabled", false);
                horizon.form.submitForm();
            }
        },
        validate: function () {
            //附件验证方法
            $.validator.addMethod('checkFile', function (value, element) {
                return !!$(element).closest('.ace-file-input').siblings('.ace-attachment').length;
            }, $.validator.messages.required);
            //重置长度验证方法, 中文占两个字符
            $.validator.addMethod('maxlength', function (value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength(value, element);
                if (typeof value === 'string' && value.match(/[^\x00-\xff]/ig)) {
                    length = value.replace(/[^\x00-\xff]/ig, '00').length;
                }
                return this.optional(element) || length <= param;
            }, $.validator.messages.maxlength);

            horizon.form.baseForm.validate(horizon.form.validateOption);
        },
        load: function (_callback) {

            $.each(horizon.form.pluginArr, function (i, dt) {
                if ($('[data-type="' + dt + '"]').length) {
                    if (horizon.form.plugins[dt].css.length) {
                        $.each(horizon.form.plugins[dt].css, function (i, _css) {
                            horizon.form.css.push(_css);
                        });
                    }
                    if (horizon.form.plugins[dt].js.length) {
                        $.each(horizon.form.plugins[dt].js, function (i, _js) {
                            horizon.form.module.push(_js);
                        });
                    }
                    if (horizon.form.plugins[dt].lang && horizon.form.plugins[dt].lang.length) {
                        $.each(horizon.form.plugins[dt].lang, function (i, _lang) {
                            horizon.form.lang.push(_lang);
                        });
                    }
                }
            });

            /**@description 加载plugins的CSS*/
            $.each(horizon.form.css, function (i, _css) {
                if (!(/\.css$/.test(_css))) {
                    _css += '.css';
                }
                if (!(/^(http[s]?|ftp):\/\//.test(_css)) && !(/^\//.test(_css))) {
                    _css = horizon.paths.pluginpath + '/' + _css;
                }
                horizon.tools.use(_css);
            });


            horizon.form.setParamVal();

            horizon.language.getLanguage(horizon.form.lang, function () {

                require(horizon.form.module, function ($) {

                    horizon.form.validate();

                    // 字典联动
                    var isRelationFieldLoad = false;
                    horizon.form.relationField = function (obj, relName, connField) {
                        var $this = $(obj);
                        var objName = $this.attr('name');

                        var formId = objName.substring(0, objName.indexOf('_'));
                        var rowNo = '';//用于动态表格
                        var $rel; //关联列
                        //判断是否是动态表格里的控件
                        if ($('table[id="subTable.' + formId + '"]').length) {
                            rowNo = '_' + objName.substring(objName.lastIndexOf('_') + 1);
                            $rel = $('[name="' + formId + '_' + relName.toUpperCase() + rowNo + '"]');
                        } else {
                            $rel = $('[name="' + formId + '_' + relName.toUpperCase() + '"]');
                        }
                        var relDataType = $rel.attr('data-type');
                        // 上一级是可编辑,下一级是不可编辑,此时,上一级的变化不应该引起下一级的变化
                        // 上一级是不可编辑,下一级也是不可编辑,因为下一级的变化需要上一级
                        //var disabledTypeofThis = $this.prop("disabled");
                       // var disabledTypeofNext = $rel.prop('disabled');
                        var type = $this.attr('input-type');
                        var param = Array.isArray($this.val()) ? $this.val().join(';') : $this.val();
                        if (!param || param.length <= 0) {
                            return;
                        }
                        $.ajax({
                            url: horizon.paths.apppath + '/dict/getRelationData.wf',
                            dataType: 'json',
                            cache: false,
                            async: isRelationFieldLoad,
                            data: {
                                param: param,
                                type: type,
                                dictId: $rel.attr('dict-id'),
                                connField: connField
                            },
                            success: function (data) {
                                if (data && data.length > 0) {
                                    var isPrint = $('body').hasClass('print');
                                    var selectedName = '';
                                    if (relDataType == 'select') {
                                        var value = $rel.attr('default-value');
                                        var arr = value.split(";");
                                        $rel.html('<option></option>');
                                        $.each(data, function (i, item) {
                                            var selected = '';
                                            if ($.inArray(item.value, arr) > -1) {
                                                selected = 'selected';
                                                selectedName += item.name + ";";
                                            }
                                            var $option = $('<option ' + selected + ' value="' + item.value + '">' + item.name + '</option>');
                                            $rel.attr('default-value', '').append($option);
                                        });
                                        //打印表单
                                        if (isPrint && selectedName != '' && (connField == '' || connField == undefined)) {
                                            $rel.prev().html(selectedName.substring(0, selectedName.length - 1));
                                        }
                                        $rel.trigger('chosen:updated');
                                        $rel.trigger('change');
                                    } else if (relDataType == 'select-read') {
                                        var value = $rel.attr('default-value');
                                        var arr = value.split(";");
                                        //$rel.html('<option></option>');
                                        $.each(data, function (i, item) {
                                            var selected = '';
                                            if ($.inArray(item.value, arr) > -1) {
                                                selected = 'selected';
                                                selectedName += item.name + ";";
                                            }
                                           // var $option = $('<option ' + selected + ' value="' + item.value + '">' + item.name + '</option>');
                                           // $rel.attr('default-value', '').append($option);
                                        });
                                        //流程表单
                                        if (selectedName != '' && (connField == '' || connField == undefined)) {
                                            $rel.prev().html(selectedName.substring(0, selectedName.length - 1));
                                        }
                                        $rel.trigger('chosen:updated');
                                        $rel.trigger('change');
                                        // $rel.prop("disabled",true);
                                    } else if (relDataType == 'radio-read') {
                                        var $container = $rel.closest('.radio');
                                        if ($container.length > 0) {
                                            var $label = $container.children().first().removeClass('hidden').clone();
                                            var value = $label.find('input').attr('default-value');
                                            $container.html('');
                                            $.each(data, function (i, item) {
                                                var $option = $label.clone();
                                                if (value) {
                                                    var arr = value.split(";");
                                                    if ($.inArray(item.value, arr) > -1) {
                                                        $option.children('input')[0].checked = true;
                                                        selectedName += item.name + ";";
                                                    }
                                                }
                                                $option.children('input').attr('value', item.value);
                                                $option.children('span').attr('data-original-title', item.name).html(item.name);
                                                $container.append($option);
                                                $option.find('input:checked').trigger('change');
                                            });
                                        }
                                    } else {
                                        var $container = $rel.closest('.radio');
                                        if ($container.length > 0) {
                                            var $label = $container.children().first().removeClass('hidden').clone();
                                            var value = $label.find('input').attr('default-value');
                                            $container.html('');
                                            $.each(data, function (i, item) {
                                                var $option = $label.clone();
                                                if (value == '') {
                                                    if (i == 0) {
                                                        $option.children('input')[0].checked = true;
                                                    } else {
                                                        $option.children('input')[0].checked = false;
                                                    }
                                                } else {
                                                    var arr = value.split(";");
                                                    if ($.inArray(item.value, arr) > -1) {
                                                        $option.children('input')[0].checked = true;
                                                        selectedName += item.name + ";";
                                                    }
                                                }
                                                $option.children('input').attr('value', item.value);
                                                $option.children('span').attr('data-original-title', item.name).html(item.name);
                                                $container.append($option);
                                                $option.find('input:checked').trigger('change');
                                            });
                                            //打印表单
                                            if (isPrint && selectedName != '' && (connField == '' || connField == undefined)) {
                                                var $lable = '<label class="form-print-label">' + selectedName.substring(0, selectedName.length - 1) + '</label>';
                                                $container.parent().append($lable);
                                            }
                                        }
                                    }
                                } else {
                                    $rel.html('<option></option>');
                                    $rel.trigger('chosen:updated');
                                    $rel.trigger('change');
                                }
                            }
                        });
                    };
                    $('[dict-id][onchange*="relationField"]').each(function () {
                        var $this = $(this);
                        if ($this.is('select') || $this.is('input') && $this[0].checked == true || $('body').hasClass('print')) {
                            if ($this.closest('tr.hidden').length == 0) {
                                $this.trigger('change');
                            }
                        }
                        if ($this.is('input') && $this.attr('data-type')=="select-read") {
                            if ($this.closest('tr.hidden').length == 0) {
                                $this.trigger('change');
                            }
                        }
                    });
                    isRelationFieldLoad = true;

                    if (horizon.form.history && horizon.form.history.enable) {
                        horizon.form.history.init();
                    }

                    // 密级标识onchange方法
                    horizon.form.secretLevel = function (obj) {
                        var $this = $(obj);
                        $('input[name="' + $this.attr('name').split('_')[0] + '_HORIZON_SECRETLEVEL"]').val($this.val());
                    };

                    // 字段控件
                    var init = {
                        textarea: function () {
                            if ($('.graphic').length) {
                                return;
                            }
                            var $textarea = arguments.length ? arguments[0] : $('textarea[data-type="textarea"]');
                            if ($textarea.length) {
                                $textarea.autosize({append: '\n'});
                            }
                        },
                        number: function () {
                            var $number = arguments.length ? arguments[0] : $('input[data-type="number"]');
                            if ($number.length) {
                                $number.each(function () {
                                    var $this = $(this),
                                        maxVal = 1,
                                        minVal = -1,
                                        maxLength = $this.attr('maxlength');
                                    if (!maxLength) {
                                        maxLength = 10;
                                    }
                                    maxLength = parseInt(maxLength);
                                    for (var i = 0; i < maxLength; i++) {
                                        maxVal *= 10;
                                        minVal *= 10;
                                    }
                                    maxVal -= 1;
                                    minVal += 1;
                                    $this.ace_spinner({
                                        value: $this.val(),
                                        max: maxVal,
                                        min: minVal,
                                        step: ($this.attr('data-number') === 'int' ? 1 : 0.1),
                                        btn_up_class: 'btn-info',
                                        btn_down_class: 'btn-info'
                                    }).closest('.ace-spinner')
                                        .addClass('form-control no-padding').removeAttr("style")
                                        .on('changed.fu.spinbox', function () {
                                            if ($this.attr('data-number') === 'int') {
                                                $this.ace_spinner('value', parseInt($this.val(), 10) || 0);
                                            }
                                            if ($this.attr('event-change')) {
                                                eval($this.attr('event-change'));
                                            }
                                        });
                                });
                            }
                        },
                        date: function () {
                            var $dates = arguments.length ? arguments[0] : $('input[data-type="date"], input[data-type="datetime"]');
                            if ($dates.length) {
                                var laydate = require('laydate');
                                laydate.path = horizon.paths.pluginpath + '/laydate/';
                                $dates.each(function () {
                                    var $this = $(this),
                                        opt = {
                                            elem: $this[0],
                                            theme: 'horizon'
                                        };
                                    if (horizon.vars.lang == 'en') {
                                        opt.lang = 'en';
                                    }
                                    if ($this.attr('data-type') == 'datetime') {
                                        opt.type = 'datetime';
                                        opt.format = 'yyyy-MM-dd HH:mm:ss';
                                    }
                                    if ($this.attr('onchange')) {
                                        opt.ready = function () {
                                            this.preData = $(this.elem).val();
                                        };
                                        opt.done = function (value) {
                                            if (this.preData != value) {
                                                setTimeout(function () {
                                                    eval($this.attr('onchange'))
                                                }, 1);
                                            }
                                            this.preData = null;
                                        }
                                    }
                                    laydate.render(opt);
                                });
                            }
                        },
                        file: function () {
                            var fileIcon = function (filename) {
                                var format = 'file';
                                if ((/\.(jpe?g|png|gif|svg|bmp|tiff?)$/i).test(filename)) {
                                    format = 'image';
                                }
                                else if ((/\.(mpe?g|flv|mov|avi|swf|mp4|mkv|webm|wmv|3gp)$/i).test(filename)) {
                                    format = 'video';
                                }
                                else if ((/\.(mp3|ogg|wav|wma|amr|aac)$/i).test(filename)) {
                                    format = 'audio';
                                }
                                var fileIcons = {
                                    'file': 'fa fa-file',
                                    'image': 'fa fa-picture-o file-image',
                                    'video': 'fa fa-film file-video',
                                    'audio': 'fa fa-music file-audio'
                                };
                                return fileIcons[format];
                            };
                            //@Author zhangsk 附件管理start--
                            //附件删除按钮绑定事件
                            var $deleteIcon = $("input[data-type='file']").closest(".form-group").find(".ace-attachment").find("a[data-action='delete']");
                            $deleteIcon.each(function () {
                                $(this).on('click', function () {
                                    //当没有附件时删除"附件管理按钮"
                                    var files = $(this).closest(".form-group").find(".ace-attachment");
                                    //因为ace的附件删除方法后执行，所以当files==1时 即可判定为files没有了
                                    if (files.length == 1) {
                                        $(this).closest(".form-group").find("input[type='button']").remove();
                                    }
                                })
                            });

                            $("input[data-button='fileOperate']").each(function () {
                                $(this).on('click', function () {
                                    var form_data_id = $(this).attr("formDataId");
                                    var formId = $(this).attr("form-id");
                                    var formDataId = $("input[name='" + form_data_id + "']").val();
                                    var filedName = $(this).attr("data-name");
                                    initTable(formDataId, filedName);
                                    $("#attachmentDialog").dialog({
                                        width: $(window).width() > 995 ? '995' : $(window).width(),
                                        height: $(window).height() > 640 ? '640' : 'auto',
                                        maxHeight: $(window).height(),
                                        minHeight: '500',
                                        closeText: horizon.lang['base']['close'],
                                        title: horizon.lang['platform-form']['title'],
                                        buttons: [
                                            {
                                                html: horizon.lang['platform-form']['dialogButton'],
                                                "class": "btn btn-primary btn-xs",
                                                click: function () {
                                                    var id = "";
                                                    $("input[type='checkbox'][flag='" + formDataId + "_D']").each(function () {
                                                        if ($(this).is(":checked")) {
                                                            id = id + $(this).attr("data-id") + ";"
                                                        }
                                                    });
                                                    if (id) {
                                                        var $downloadMultiplefile = $("#downloadMultiplefile");
                                                        if ($downloadMultiplefile.length == 0) {
                                                            var downUrl=horizon.paths.apppath + '/horizon/template/formdata/downloadMultiplefile.wf';
                                                            var $downloadForm = $('<form id="downloadMultiplefile" class="hidden" action="' + downUrl + '"></form>');
                                                            $downloadForm.append($('<input name="formId" value="' + formId + '"/>'));
                                                            $downloadForm.append($('<input name="fileId" value="' + id + '"/>'));
                                                            if(horizon['tools'].getQueryString("accessToken")){
                                                                $downloadForm.append($('<input name="accessToken" value="' + horizon['tools'].getQueryString("accessToken") + '"/>'));
                                                            }
                                                            $downloadForm.append($('<button id="downloadMultiple" type="submit"/>'));
                                                            $("#attachmentDialog").append($downloadForm);
                                                        }
                                                        $downloadMultiplefile.find("input[name='fileId']").val(id);
                                                        $("#downloadMultiple").click();
                                                    }
                                                }
                                            }
                                        ]
                                    });
                                });

                            });
                            var initTable = function (formDataId, fieldName) {
                                $("#attachmentDialog").remove();
                                var $table = $('<div id="attachmentDialog" class="hidden table-responsive"><table id="downloadFile"  class="table table-hover"></table></div>');
                                $("body").append($table);
                                //显示各附件版本号最高的
                                $.ajax({
                                    type: "POST",
                                    url: horizon.paths.apppath + '/horizon/template/formdata/attachments/list.wf',
                                    data: {formDataId: formDataId, fieldName: fieldName},
                                    dataType: 'json',
                                    success: function (data) {
                                        if (data) {
                                            $("#downloadFile").html("");
                                            $("#downloadFile").append(
                                                "<tr>" +
                                                "<th style='border:none;width: 30px''></th>" +
                                                "<th style='border:none;'>" + horizon.lang['platform-form']['attachmentName'] + "</th>" +
                                                "<th style='border:none;text-align:center;'>" + horizon.lang['platform-form']['attachmentVersion'] + "</th>" +
                                                "<th style='border:none;text-align:center;'>" + horizon.lang['platform-form']['attachmentSaveTime'] + "</th>" +
                                                "<th style='border:none;text-align:center;'>" + horizon.lang['platform-form']['attachmentUploadMan'] + "</th>" +
                                                "<th style='border:none;text-align:center;'></th>" +
                                                "</tr>"
                                            );
                                            for (var index in data) {
                                                var downloadFileHtml = "<tr  file-formDataId='" + data[index].fullFileName + "' data-list='" + formDataId + ";" + fieldName + ";" + data[index].fullFileName + ";" + data[index].version + "'>" +
                                                    "<td style='border:none;width: 30px''><label><input class='ace' name='checkbox' type='checkbox' flag='" + formDataId + "_D' data-id='" + data[index].id + "'/><span class='lbl'></span></label></td>" +
                                                    "<td style='border:none;' file-down='down'><a href='#nogo' title='下载' data-action='download' data-version='" + data[index].version + "'   data-id='" + data[index].id + "' class='middle'>" + data[index].fullFileName + "</a></td>" +
                                                    "<td style='border:none;text-align:center;'>" + data[index].version + "</td>" +
                                                    "<td style='border:none;text-align:center;'>" + data[index].saveTime + "</td>" +
                                                    "<td style='border:none;text-align:center;'>" + data[index].name + "</td>";
                                                //如果版本号是 1 不显示下拉箭头
                                                if (data[index].version != 1) {
                                                    downloadFileHtml = downloadFileHtml + "<td style='border:none;' file-list='fileList' data-list='" + formDataId + ";" + fieldName + ";" + data[index].fullFileName + ";" + data[index].version + "'>" +
                                                        "<span style='font-size:21px;cursor:pointer'  id='" + data[index].fullFileName + "' class='fa fa-angle-right'  aria-hidden='true'></span>" +
                                                        "</td></tr>";
                                                } else {
                                                    downloadFileHtml = downloadFileHtml + "<td style='border:none;' file-list='fileList' data-list='" + formDataId + ";" + fieldName + ";" + data[index].fullFileName + ";" + data[index].version + "'>" +
                                                        "</td></tr>";
                                                }
                                                $("#downloadFile").append(downloadFileHtml);

                                            }
                                        }
                                        //点击下拉箭头，加载附件的其他版本
                                        $("td[file-list='fileList']").on('click', function () {
                                            var parendData = $(this).attr("data-list").split(";");
                                            //如果附件版本不是 1 则加载附件版本列表
                                            if (parendData[3] != "1") {
                                                var parentTR = $(this).parent();
                                                var flag = parendData[0] + ";" + parendData[2];
                                                var $trFlag = $("tr[flag='" + flag + "']");
                                                var $span = $("span[id='" + parendData[2] + "']");
                                                var flag = 0;
                                                if ($span.hasClass("fa fa-angle-right")) {
                                                    $trFlag.removeClass("hidden");
                                                    $span.attr("class", "fa fa-angle-down");
                                                    $(parentTR).attr("style", "background:#f0f6fb");
                                                    flag = 1;
                                                }
                                                if ($span.hasClass("fa fa-angle-down") && flag == 0) {
                                                    $trFlag.addClass("hidden");
                                                    $span.attr("class", "fa fa-angle-right");
                                                    $(parentTR).removeAttr("style");
                                                }
                                                if ($trFlag.length == 0) {
                                                    $.ajax({
                                                        type: "POST",
                                                        url: horizon.paths.apppath + '/horizon/template/formdata/attachments/list.wf',
                                                        data: {
                                                            formDataId: parendData[0],
                                                            fieldName: parendData[1],
                                                            fullFileName: parendData[2]
                                                        },
                                                        dataType: 'json',
                                                        success: function (data) {
                                                            $("span[id='" + parendData[2] + "']").attr("class", "fa fa-angle-down");
                                                            $(parentTR).attr("style", "background:#f0f6fb");
                                                            for (var index in data) {
                                                                $("tr[file-formDataId='" + parendData[2] + "']").after(
                                                                    "<tr flag='" + parendData[0] + ";" + parendData[2] + "'>" +
                                                                    "<td style='border:none;width: 30px'></td>" +
                                                                    "<td style='border:none;' file-down='down'><a href='#nogo' title='下载' data-action='download' data-version='" + data[index].version + "' data-id='" + data[index].id + "' class='middle'>" + data[index].fullFileName + "</a></td>" +
                                                                    "<td style='border:none;text-align:center;'>" + data[index].version + "</td>" +
                                                                    "<td style='border:none;text-align:center;'>" + data[index].saveTime + "</td>" +
                                                                    "<td style='border:none;text-align:center;'>" + data[index].name + "</td>" +
                                                                    "<td style='border:none;'></td>" +
                                                                    "</tr>"
                                                                );
                                                            }
                                                            //附件管理列表下载单个文件
                                                            $("td[file-down='down']").find("a").unbind().on('click', function () {
                                                                downloadFile($(this), $(this).attr("data-id"), $(this).attr("data-version"));
                                                            });
                                                        }

                                                    });
                                                }

                                            }
                                        });
                                        //附件管理列表下载单个文件
                                        $("td[file-down='down']").find("a").unbind().on('click', function () {
                                            downloadFile($(this), $(this).attr("data-id"), $(this).attr("data-version"));
                                        });

                                    }
                                });
                                //zhangsk end---
                                var downloadFile = function ($aceAttachment, fileId, version) {
                                    var $downloadForm = $aceAttachment.children('.downloadForm');
                                    if ($downloadForm.length == 0) {
                                        $downloadForm = $('<form class="downloadForm hidden" action="' + horizon.paths.apppath + '/horizon/template/formdata/downloadfile.wf"></form>');
                                        $downloadForm.append($('<input name="fileId" value="' + fileId + '"/>'));
                                        if(horizon['tools'].getQueryString("accessToken")){
                                            $downloadForm.append($('<input name="accessToken" value="' + horizon['tools'].getQueryString("accessToken") + '"/>'));
                                        }
                                        if (version) {
                                            $downloadForm.append($('<input name="version" value="' + version + '"/>'));
                                        }
                                        $aceAttachment.append($downloadForm);
                                    }
                                    $downloadForm.get(0).submit();
                                };
                            };


                            var downloadFile = function ($aceAttachment, fileId) {
                                var $downloadForm = $aceAttachment.children('.downloadForm');
                                if ($downloadForm.length == 0) {
                                    $downloadForm = $('<form class="downloadForm hidden" action="' + horizon.paths.apppath + '/horizon/template/formdata/downloadfile.wf"></form>');
                                    $downloadForm.append($('<input name="fileId" value="' + fileId + '"/>'));
                                    if(horizon['tools'].getQueryString("accessToken")){
                                        $downloadForm.append($('<input name="accessToken" value="' + horizon['tools'].getQueryString("accessToken") + '"/>'));
                                    }
                                    $aceAttachment.append($downloadForm);
                                }
                                $downloadForm.get(0).submit();
                            };
                            var deleteFile = function ($aceAttachment, fileId) {
                                $aceAttachment.hide(300, function () {
                                    $.ajax({
                                        url: horizon.paths.apppath + '/horizon/template/formdata/deletefile.wf',
                                        data: {fileId: fileId},
                                        dataType: 'json',
                                        error: function () {
                                            $aceAttachment.addClass('red').show();
                                        },
                                        success: function (data) {
                                            if (data.state == 'success') {
                                                //删除 附件字段中已经被删除附件的id
                                                var columnName = $aceAttachment.context.name;
                                                if (columnName == undefined) {
                                                    var inputElement = $($aceAttachment.context.parentNode).find("input");
                                                    columnName = inputElement[inputElement.length - 1].name;
                                                }
                                                var rowIndex = '';
                                                var tempColumnName = columnName;
                                                if ($aceAttachment.closest('.subtable').length > 0) {//动态表格
                                                    rowIndex = '_' + columnName.substring(columnName.lastIndexOf('_') + 1, columnName.length);
                                                    tempColumnName = columnName.substring(0, columnName.lastIndexOf('_'));
                                                }
                                                var $columnIds = $('input[name="' + tempColumnName + '_ID' + rowIndex + '"]');
                                                var delidArr = $columnIds.val().split(';');
                                                var delNewArr = [];
                                                for (var i = 0; i < delidArr.length; i++) {
                                                    if (delidArr[i] != fileId) {
                                                        delNewArr.push(delidArr[i]);
                                                    }
                                                }
                                                $columnIds.val(delNewArr.join(';'));
                                                //删除id结束
                                                $aceAttachment.remove();
                                                try {
                                                    if (typeof horizon.form.deleteFileCallback == 'function') {
                                                        horizon.form.deleteFileCallback(fileId);
                                                    }
                                                } catch (e) {
                                                }
                                            } else {
                                                $aceAttachment.addClass('red').show();
                                            }
                                        }
                                    });
                                });
                            };
                            var uploadProgress = function ($aceAttachment, position, total, percent) {
                                if (total > 1024 * 1024 * 1024 * 1024) {
                                    $aceAttachment.find('.handle').children('.unit').html('/' + ((total / (1024 * 1024 * 1024 * 1024)).toFixed(1)) + 'TB');
                                    $aceAttachment.find('.handle').children('.orange').html((position / (1024 * 1024 * 1024 * 1024)).toFixed(1));
                                } else if (total >= 1024 * 1024 * 1024) {
                                    $aceAttachment.find('.handle').children('.unit').html('/' + ((total / (1024 * 1024 * 1024)).toFixed(1)) + 'GB');
                                    $aceAttachment.find('.handle').children('.orange').html((position / (1024 * 1024 * 1024)).toFixed(1));
                                } else if (total >= 1024 * 1024) {
                                    $aceAttachment.find('.handle').children('.unit').html('/' + ((total / (1024 * 1024)).toFixed(1)) + 'MB');
                                    $aceAttachment.find('.handle').children('.orange').html((position / (1024 * 1024)).toFixed(1));
                                } else if (total >= 1024) {
                                    $aceAttachment.find('.handle').children('.unit').html('/' + ((total / 1024).toFixed(1)) + 'KB');
                                    $aceAttachment.find('.handle').children('.orange').html((position / (1024)).toFixed(1));
                                } else {
                                    $aceAttachment.find('.handle').children('.orange').html(position);
                                }
                                $aceAttachment.find('.progress').progressbar('option', 'value', percent);
                            };
                            if (!arguments.length) {
                                $('.ace-attachment').each(function () {
                                    var $this = $(this), $filename = $this.find('.filename > a'),
                                        filename = $.trim($filename.html());
                                    $('<i class="' + fileIcon(filename) + ' orange2"></i>').insertBefore($filename);
                                    if ((/\.(jpe?g|png|gif|svg|bmp|tiff?)$/i).test(filename)) {
                                        var url = horizon.paths.apppath + '/horizon/template/formdata/downloadfile.wf?fileId=' + $filename.attr('data-fileid');
                                        var $img = $('<img class="file-image pointer" src="' + url + '" data-rel="colorbox"/>');
                                        $filename.before($img);
                                        $img.prev('i').remove();
                                        $img.colorbox({
                                            rel: 'colorbox',
                                            opacity: 0.5,
                                            title: filename,
                                            close: '&times;',
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            photo: true,
                                            href: url,
                                            overlayClose: false,
                                            previous: '<i class="ace-icon fa fa-arrow-left"></i>',
                                            next: '<i class="ace-icon fa fa-arrow-right"></i>',
                                            current: ''
                                        });
                                    }
                                    $this.find('a[data-action="download"]').on('click', function () {
                                        downloadFile($this, $(this).attr('data-fileid'));
                                    });
                                    $this.find('a[data-action="delete"]').on('click', function () {
                                        deleteFile($this, $(this).attr('data-fileid'));
                                    });
                                });
                            }
                            var $files = arguments.length ? arguments[0] : $('input[data-type="file"][type="file"]');
                            if ($files.length) {
                                var fileOption = {
                                    no_file: '',
                                    icon_remove: null,
                                    btn_choose: '选择',
                                    btn_change: '选择',
                                    droppable: false,
                                    maxSize: 1024 * 1024 * 1024,
                                    thumbnail: false,
                                    allowExt: [],//允许上传的类型
                                    upload: function ($ele, files) {
                                        if (!$ele.attr('data-multiple') && $ele.parent().siblings('.ace-attachment').length > 0) {
                                            var $aceAttachment = $ele.parent().siblings('.ace-attachment');
                                            $aceAttachment.hide();
                                            var column_name = $ele.attr('name');
                                            var fileId = $('input[name="' + column_name + '_ID"]').val();
                                            if (!fileId) {
                                                fileId = $aceAttachment.find('a[data-action="download"]').attr('data-fileid');
                                            }
                                            deleteFile($aceAttachment, fileId);
                                        }
                                        var columnName = $ele.attr('name'),
                                            filename = '', size = 100,
                                            $tool = null,
                                            $fileDes = null,
                                            $handle = null,
                                            $progress = null,
                                            $form = null,
                                            $aceFileInput = $ele.parent(),
                                            $fileOperate = $aceFileInput.siblings('.btn[data-button="fileOperate"]'),
                                            aceAttachmentLength = $aceFileInput.siblings('.ace-attachment').length;
                                        $.each(files, function (i) {
                                            $tool = $('<div class="ace-attachment"></div>');
                                            $fileDes = $('<div class="file-des col-xs-5 no-padding"><div class="filename"></div></div>');
                                            $progress = $('<div class="progressbar col-xs-4 no-padding"></div>');
                                            $handle = $('<div class="handle col-xs-3 col-md-6 col-sm-6 no-padding align-right "></div>');
                                            $tool.append($fileDes).append($progress).append($handle);
                                            var isFile = (typeof files[i] !== 'string');
                                            $form = (!isFile ? $ele : $ele.clone()).wrap('<form action="' + horizon.paths.apppath + '/horizon/template/formdata/uploadfile.wf" class="hidden" method="post" enctype="multipart/form-data"></form>').parent();
                                            var $aceAttachment = null;
                                            var checkFileSize = false;

                                            if (!isFile) {
                                                checkFileSize = true;
                                                filename = files[i];
                                                var index = filename.lastIndexOf("\\") + 1;
                                                if (index == 0) index = filename.lastIndexOf("/") + 1;
                                                filename = filename.substr(index);
                                                $tool.insertBefore(($fileOperate.length ? $fileOperate : $aceFileInput));
                                            } else {
                                                filename = $.trim(files[i].name);
                                                $tool.append($form).insertBefore(($fileOperate.length ? $fileOperate : $aceFileInput));
                                            }
                                            $aceAttachment = $aceFileInput.parent().children('.ace-attachment:eq(' + (i + aceAttachmentLength) + ')');
                                            $fileDes.children('.filename').html('<i class="' + fileIcon(filename) + ' orange2"></i>' + '<a href="#nogo">' + filename + '</a>').attr('title', filename);
                                            $handle.html('<span class="orange">0</span><span class="unit">B</span>');
                                            $progress.progressbar({
                                                value: 0,
                                                max: size,
                                                create: function (event, ui) {
                                                    $(this).addClass('progress progress-striped active')
                                                        .children(0).addClass('progress-bar progress-bar-success');
                                                }
                                            });
                                            var interval = null;
                                            var coluArray = columnName.split('_');
                                            var dataId = $('input[name="' + coluArray[0] + '_ID"]').val();
                                            var coluSize = coluArray.length;
                                            if (coluSize > 2) {
                                                dataId = $('input[name="' + coluArray[0] + '_ID_' + coluArray[coluSize - 1] + '"]').val();
                                            }

                                            var submitOption = {
                                                dataType: 'json',
                                                data: {
                                                    dataId: dataId,
                                                    multiple: $ele.attr('data-multiple'),
                                                    checkFileSize: checkFileSize,
                                                    maxSize: $ele.attr('maxlength')
                                                },
                                                error: function () {
                                                    var $uploadIcon = $('<a href="#nogo" title="上传" data-action="upload" class="middle"><i class="ace-icon fa fa-cloud-upload bigger-130 middle"></i></a>');
                                                    $uploadIcon.on('click', function () {
                                                        $aceAttachment.find('.handle').html('<span class="orange">0</span><span class="unit">B</span>');
                                                        $aceAttachment.removeClass('red');
                                                        if (!isFile) {
                                                            $form.ajaxSubmit(submitOption);
                                                        } else {
                                                            $aceAttachment.find('form').ajaxSubmit(submitOption);
                                                        }
                                                    });
                                                    var $deleteIcon = $(' <a href="#nogo" title="删除" data-action="delete" class="middle"><i class="ace-icon fa fa-trash-o red bigger-130 middle"></i></a>');
                                                    $deleteIcon.on('click', function () {
                                                        $deleteIcon.closest('.ace-attachment').hide(300, function () {
                                                            $(this).remove()
                                                        });
                                                    });
                                                    $aceAttachment.find('.handle').html('').append($uploadIcon).append($deleteIcon);
                                                    $aceAttachment.find('.progress').progressbar('option', 'value', 0);
                                                    $aceAttachment.addClass('red');
                                                },
                                                success: function (data) {
                                                    if (data && data.length) {
                                                        $.each(data, function (i, upInfo) {
                                                            if (upInfo.state === 'success') {
                                                                var rowIndex = '';
                                                                var tempColumnName = columnName;
                                                                if ($ele.closest('.subtable').length > 0) {//动态表格
                                                                    rowIndex = '_' + columnName.substring(columnName.lastIndexOf('_') + 1, columnName.length);
                                                                    tempColumnName = columnName.substring(0, columnName.lastIndexOf('_'));
                                                                }
                                                                var $columnIds = $('input[name="' + tempColumnName + '_ID' + rowIndex + '"]');
                                                                if ($columnIds.val() && $ele.attr('data-multiple') == 'multiple') {
                                                                    var idArr = $columnIds.val().split(';');
                                                                    var newArr = [];
                                                                    if ($.inArray(upInfo.fileId, idArr) == -1) {
                                                                        if ($fileOperate.length) {
                                                                            newArr = idArr;
                                                                        } else {
                                                                            var oldFileList = $columnIds.closest(".form-group").find(".ace-attachment").find("a[data-action='download']").parent().prev().find("a[class='green']");
                                                                            oldFileList.each(function (i) {
                                                                                if ($(this).html() != upInfo.fileName) {
                                                                                    newArr.push(idArr[i]);
                                                                                }
                                                                            });
                                                                        }
                                                                        newArr.push(upInfo.fileId);
                                                                        $columnIds.val(newArr.join(';'));
                                                                    }
                                                                } else {
                                                                    $columnIds.val(upInfo.fileId);
                                                                }
                                                                var $link = $aceAttachment.find('.filename > a');
                                                                if ($link.prev('i').hasClass('fa-picture-o')) {
                                                                    var url = horizon.paths.apppath + '/horizon/template/formdata/downloadfile.wf?fileId=' + upInfo.fileId;
                                                                    var $img = $('<img class="file-image pointer" src="' + url + '" data-rel="colorbox"/>');
                                                                    $link.before($img);
                                                                    $img.prev('i').remove();
                                                                    $img.colorbox({
                                                                        rel: 'colorbox',
                                                                        opacity: 0.5,
                                                                        title: $link.html(),
                                                                        close: '&times;',
                                                                        maxWidth: '100%',
                                                                        maxHeight: '100%',
                                                                        photo: true,
                                                                        overlayClose: false,
                                                                        href: url,
                                                                        previous: '<i class="ace-icon fa fa-arrow-left"></i>',
                                                                        next: '<i class="ace-icon fa fa-arrow-right"></i>',
                                                                        current: ''
                                                                    });
                                                                }
                                                                var $downloadIcon = $('<a href="#nogo" title="下载" data-action="download" class="middle"> <i class="ace-icon fa fa-cloud-download green bigger-130 middle"></i> </a> ');
                                                                $downloadIcon.on('click', function () {
                                                                    downloadFile($aceAttachment, upInfo.fileId);
                                                                });
                                                                var $deleteIcon = $(' <a href="#nogo" title="删除" data-action="delete" class="middle"> <i class="ace-icon fa fa-trash-o red bigger-130 middle"></i> </a>');
                                                                $deleteIcon.on('click', function () {
                                                                    deleteFile($aceAttachment, upInfo.fileId);
                                                                });
                                                                $link.addClass('green').on('click', function () {
                                                                    downloadFile($aceAttachment, upInfo.fileId);
                                                                });
                                                                $aceAttachment.find('.handle').html('').append($downloadIcon).append($deleteIcon);
                                                                $aceAttachment.find('.progress').remove();
                                                                $aceAttachment.find('.file-des').removeClass('col-xs-5').addClass('col-xs-9 col-md-6 col-sm-6');
                                                                if (!isFile) {
                                                                    $ele.parent()[0].reset();
                                                                    $ele.unwrap();
                                                                } else {
                                                                    $aceAttachment.find('form').remove();
                                                                    $ele.wrap('<form></form>').parent()[0].reset();
                                                                    $ele.unwrap();
                                                                }
                                                                if ($ele.attr('data-multiple')) {
                                                                    var oldFileList = $aceAttachment.siblings('.ace-attachment').find("a[class='green']");
                                                                    oldFileList.each(function (i) {
                                                                        if ($(this).html() == upInfo.fileName) {
                                                                            $aceAttachment.siblings('.ace-attachment')[i].remove();
                                                                        }
                                                                    });
                                                                } else {
                                                                    $aceAttachment.siblings('.ace-attachment').remove();
                                                                }
                                                                try {
                                                                    if (typeof horizon.form.uploadFileCallback == 'function') {
                                                                        horizon.form.uploadFileCallback(columnName, upInfo.fileId);
                                                                    }
                                                                } catch (e) {
                                                                }
                                                            } else if (upInfo.state === 'checkSizeError') {
                                                                window.clearInterval(interval);
                                                                $aceAttachment.remove();
                                                                $ele.closest('form')[0].reset();
                                                                $ele.unwrap();
                                                                var $helpBlock = $ele.parent().siblings('.help-block');
                                                                if ($helpBlock.length == 0) {
                                                                    $helpBlock = $('<div class="help-block red no-margin" id="' + $ele.attr('name') + '-error"></div>');
                                                                    $helpBlock.insertAfter($ele.parent());
                                                                }
                                                                $helpBlock.html('附件大小异常! 最大为 ' + parseInt($ele.attr('maxlength')) / 1024 + 'KB');
                                                            } else {
                                                                submitOption.error();
                                                            }
                                                        });
                                                    } else {
                                                        submitOption.error();
                                                    }
                                                }
                                            };
                                            $tool.show(500, function () {
                                                if (!isFile) {
                                                    interval = setInterval(function () {
                                                        $.ajax({
                                                            url: horizon.paths.apppath + '/horizon/template/formdata/progress.wf',
                                                            cache: false,
                                                            dataType: 'json',
                                                            success: function (data) {
                                                                if ($.isEmptyObject(data)) {
                                                                    window.clearInterval(interval);
                                                                    return;
                                                                }
                                                                var position = data.bytesRead,
                                                                    total = data.contentLength,
                                                                    percent = Math.ceil(position / total * 100);
                                                                uploadProgress($aceAttachment, position, total, percent);
                                                                if (position == total) {
                                                                    window.clearInterval(interval);
                                                                }
                                                            }
                                                        });
                                                    }, 100);
                                                } else {
                                                    var formData_object = new FormData();
                                                    formData_object.append(columnName, files[i]);
                                                    formData_object.append('dataId', dataId);
                                                    formData_object.append('multiple', $ele.attr('data-multiple'));
                                                    submitOption['formData'] = formData_object;
                                                    submitOption['uploadProgress'] = function (event, position, total, percent) {
                                                        uploadProgress($aceAttachment, position, total, percent);
                                                    };
                                                }
                                                $form.ajaxSubmit(submitOption);
                                            });
                                        });
                                    }
                                };
                                $files.each(function () {
                                    var $this = $(this),
                                        allowExt = $this.attr('data-extension').split(';'),
                                        maxSize = $this.attr('maxlength'),
                                        _fileOption = {
                                            allowExt: allowExt
                                        };
                                    _fileOption = $.extend({}, fileOption, _fileOption);
                                    if (maxSize != null && maxSize != '') {
                                        _fileOption['maxSize'] = maxSize;
                                    }
                                    $this
                                        .on('change', function () {
                                            $this.parent().siblings('.help-block').remove();
                                        })
                                        .on('file.error.ace', function (ev, info) {
                                            var $helpBlock = $this.parent().siblings('.help-block');
                                            if ($helpBlock.length == 0) {
                                                $helpBlock = $('<div class="help-block red no-margin" id="' + $this.attr('name') + '-error"></div>');
                                                $helpBlock.insertAfter($this.parent());
                                            }
                                            if (info.error_count['ext'] || info.error_count['mime']) $helpBlock.html('附件类型异常!');
                                            if (info.error_count['size']) $helpBlock.html('附件大小异常! 最大为 ' + _fileOption.maxSize / 1024 + 'KB');
                                            $this.ace_file_input('reset_input');
                                        })
                                        .ace_file_input(_fileOption)
                                        .closest('.ace-file-input')
                                        .addClass('form-control');
                                });
                            }
                        },
                        org: function () {
                            var $orgs = arguments.length ? arguments[0] : $('input[data-type="org"]');
                            if ($orgs.length) {
                                $orgs.on('click', function () {
                                    var $this = $(this),
                                        dataOrg = $this.attr('data-org');
                                    //51:组织机构
                                    if (dataOrg == '51' && $this.attr('onclick')) return;
                                    var fullname = $this.attr('name'),
                                        objName = fullname.substring(2),
                                        //formid
                                        fid = objName.substring(0, objName.indexOf("_")),
                                        //用于动态表格
                                        rowNo = '';

                                    //判断是否是动态表格里的控件
                                    if ($('table[id="subTable.' + fid + '"]').length) {
                                        rowNo = "_" + objName.substring(objName.lastIndexOf("_") + 1);
                                        objName = objName.substring(0, objName.lastIndexOf("_"));
                                    }
                                    var option = {
                                        idField: ['T_' + objName + '_ID' + rowNo, objName + '_ID' + rowNo],
                                        cnField: ['T_' + objName + rowNo, objName + '_NAME' + rowNo],
                                        loginField: ['T_' + objName + '_EN' + rowNo, objName + '_EN' + rowNo]
                                    };
                                    if (dataOrg == '32' || dataOrg == '30' || dataOrg == '51') {
                                        //32:部门ID  30: 用户ID  51:组织机构
                                        option.idField.push(objName + rowNo);
                                    } else if (dataOrg == '6' || dataOrg == '5') {
                                        //6:部门name  5：用户name
                                        option.cnField.push(objName + rowNo);
                                    } else if (dataOrg == '31') {
                                        //31：用户LOGIN
                                        option.loginField.push(objName + rowNo);
                                    }
                                    if (dataOrg == '32' || dataOrg == '6') {
                                        //部门
                                        $.extend(option, {
                                            dept: true,
                                            position: false,
                                            group: false,
                                            role: false,
                                            selectDept: true,
                                            selectPosition: false,
                                            selectGroup: false,
                                            selectUser: false
                                        });
                                    } else if (dataOrg == '5' || dataOrg == '30' || dataOrg == '31') {
                                        //用户
                                        $.extend(option, {
                                            selectDept: false,
                                            selectPosition: false,
                                            selectGroup: false,
                                            selectRole: false,
                                            selectUser: true
                                        });
                                    }
                                    if (!$this.attr('multiple')) { //单选
                                        option['multiple'] = false;
                                    }
                                    $.horizon.selectUser(option);
                                });
                            }
                        },
                        select: function () {
                            var $select = arguments.length ? arguments[0] : $('select[data-type="select"]');
                            if ($select.length) {
                                $select.each(function () {
                                    var $this = $(this);
                                    if ($this.hasClass('hidden')) {
                                        return;
                                    }
                                    var newvalue = $this.attr('data-newvalue');
                                    $this.chosen({
                                        allow_single_deselect: true,
                                        no_results_text: '未找到选项' + (newvalue == 'true' ? '<label class="blue">[回车(Enter)新增选项]</label>' : '')
                                    }).change(function () {
                                        var $this = $(this);
                                        var name = $this.attr('name');
                                        var fid = name.substring(0, name.indexOf("_"));
                                        var rowNo = '';
                                        if (name && $('#subTable.' + fid) != null && jQuery('#subTable.' + fid).length > 0) {
                                            rowNo = "_" + name.substring(name.lastIndexOf('_') + 1);
                                            name = name.substring(0, name.lastIndexOf('_'));
                                        }
                                        try {
                                            $('[name="' + name + '_ID' + rowNo + '"]').val($this.val());
                                        } catch (e) {
                                        }
                                        try {
                                            var textArr = [];
                                            $this.children(':selected').each(function () {
                                                textArr.push($.trim($(this).text()));
                                            });
                                            $('[name="' + name + '_NAME' + rowNo + '"]').val(textArr.join(','));
                                        } catch (e) {
                                        }
                                    });
                                    if (newvalue == 'true') {
                                        var $chosenContainer = $this.next();
                                        $chosenContainer.find('input').on('keyup', function (e) {
                                            var code = e.which || e.keyCode;
                                            var $input = $(this);
                                            var val = $input.val();
                                            if (code != 13 || !val) return;
                                            if ($chosenContainer.find('.chosen-results > .no-results').length) {
                                                $this.append('<option value="' + val + '" selected>' + val + '</option>');
                                                $this.trigger('chosen:updated.chosen');
                                                $this.trigger('change');
                                            }
                                        });
                                    }
                                });
                            }
                        },
                        editor: function () {
                            var $editor = arguments.length ? arguments[0] : $('.wysiwyg-editor');
                            if ($editor.length) {
                                $editor.ace_wysiwyg({
                                    toolbar: [
                                        {name: 'font', title: '字体'},
                                        null,
                                        {name: 'fontSize', title: '字体大小'},
                                        null,
                                        {name: 'bold', className: 'btn-info', title: '粗体 (Ctrl/Cmd+B)'},
                                        {name: 'italic', className: 'btn-info', title: '斜体 (Ctrl/Cmd+I)'},
                                        {name: 'strikethrough', className: 'btn-info', title: '删除线'},
                                        {name: 'underline', className: 'btn-info', title: '下划线'},
                                        null,
                                        {name: 'insertunorderedlist', className: 'btn-success', title: '无序列表'},
                                        {name: 'insertorderedlist', className: 'btn-success', title: '有序列表'},
                                        {name: 'outdent', className: 'btn-purple', title: '减少缩进 (Shift+Tab)'},
                                        {name: 'indent', className: 'btn-purple', title: '缩进 (Tab)'},
                                        null,
                                        {name: 'justifyleft', className: 'btn-primary', title: '左对齐 (Ctrl/Cmd+L)'},
                                        {name: 'justifycenter', className: 'btn-primary', title: '居中 (Ctrl/Cmd+E)'},
                                        {name: 'justifyright', className: 'btn-primary', title: '右对齐 (Ctrl/Cmd+R)'},
                                        {name: 'justifyfull', className: 'btn-inverse', title: '两端对齐 (Ctrl/Cmd+J)'},
                                        null,
                                        horizon.vars.ie ? '' : {
                                            name: 'undo',
                                            className: 'btn-grey',
                                            title: '撤销 (Ctrl/Cmd+Z)'
                                        },
                                        horizon.vars.ie ? '' : {
                                            name: 'redo',
                                            className: 'btn-grey',
                                            title: '反撤销 (Ctrl/Cmd+Y)'
                                        },
                                        {name: 'viewSource', className: 'btn-grey', title: '源码'}
                                    ]
                                }).on('blur', function () {
                                    var $this = $(this);
                                    $this.next().val($this.html());
                                }).prev().addClass('wysiwyg-style2')
                                    .end()
                                    .next().on('blur', function () {
                                    var $this = $(this);
                                    $this.prev().html($this.val());
                                });
                            }
                        },
                        ueditor: function () {
                            var $ueditor = arguments.length ? arguments[0] : $('[data-type="ueditor"]');
                            $ueditor.each(function () {
                                var editorId = $(this).attr('id');
                                if ($(this).prop('readonly')) {
                                    UE.getEditor(editorId, {
                                        initialFrameWidth: '100%',
                                        toolbars: null,
                                        readonly: true,
                                        allowDivTransToP: false
                                    });
                                    $('#' + editorId).find('.edui-editor-bottomContainer').addClass('hidden');
                                } else {
                                    UE.getEditor(editorId, {
                                        initialFrameWidth: '100%',
                                        toolbars: [[
                                            'source', '|', 'undo', 'redo', '|',
                                            'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'autotypeset', 'pasteplain', '|',
                                            'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'cleardoc', '|',
                                            'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
                                            'directionalityltr', 'directionalityrtl', 'indent', '|',
                                            'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|', 'link', 'unlink', '|',
                                            'searchreplace', '|', 'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
                                            'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
                                            'simpleupload', 'insertimage', 'attachment', 'insertframe', 'insertcode', 'pagebreak', 'background', '|',
                                            'horizontal', 'date', 'time', 'spechars', '|',
                                            'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols'
                                        ]],
                                        allowDivTransToP: false,
                                        zIndex: 99,
                                        insertorderedlist: {
                                            'decimal': '1,2,3...',
                                            'lower-alpha': 'a,b,c...',
                                            'lower-roman': 'i,ii,iii...',
                                            'upper-alpha': 'A,B,C...',
                                            'upper-roman': 'I,II,III...'
                                        },
                                        insertunorderedlist: {
                                            'circle': '○ 大圆圈',
                                            'disc': '● 小黑点',
                                            'square': '■ 小方块 '
                                        }
                                    });
                                }
                            });
                        },
                        opinion: function () {
                            //意见的下拉选项换成popover
                            var $btnOpinion = $('.btn-opinion');
                            //popover参数
                            $btnOpinion.popover({
                                html: true,
                                container: 'body',
                                placement: 'bottom',
                                content: function () {
                                    return $(this).next().html();
                                },
                                trigger: 'manual'
                            });
                            //显示popover
                            $btnOpinion.on('click', function () {
                                var $this = $(this);
                                $this.popover('show');
                            });
                            //在现实popover后绑定意见选项事件
                            $btnOpinion.on('shown.bs.popover', function () {
                                var $btnOpinion = $(this).closest('.btn-opinion');
                                var $popoverContainer = $('#' + $btnOpinion.attr('aria-describedby'));
                                $popoverContainer.find('.opinion-menu > li').on('click', function () {
                                    var $this = $(this);
                                    $btnOpinion.closest('.input-group').find('textarea').val($this.children('a').html()).trigger('change');
                                    $btnOpinion.popover('hide');
                                });
                            });
                            //在鼠标单击其他的地方隐藏popover
                            $(window).on('click', function (e) {
                                var $this = $(e.target);
                                if ($this.closest('.btn-opinion').length > 0) {
                                    return;
                                }
                                if ($this.length > 0 && $this.closest('.popover').length == 0) {
                                    $('[data-rel="popover"]').popover('hide');
                                }
                            });
                            $('.opinion-showothers-btn').on('click', function () {
                                var $this = $(this);
                                $this.prev().children().last().siblings().toggle();
                                if ($this.children().hasClass('fa-angle-double-down')) {
                                    $this.children().removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
                                } else {
                                    $this.children().removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
                                }
                            });
                            $('.opinion-dialogs').find('a[data-action="delete"]').on('click', function () {
                                var $this = $(this);
                                var $dialogMessage = $('<div></div>');
                                $dialogMessage.removeClass('hide hidden').dialog({
                                    title: '提示',
                                    closeText: '关闭',
                                    dialogText: '确认删除?',
                                    dialogTextType: 'alert-danger',
                                    buttons: [
                                        {
                                            html: '删除',
                                            "class": "btn btn-danger btn-xs",
                                            click: function () {
                                                $this.closest('.itemdiv').find('.opinion-dialog-load').removeClass('hidden');
                                                var opinionId = $this.attr('data-opinionid');
                                                $.ajax({
                                                    url: horizon.paths.apppath + '/opinion/deleteOpinion.wf',
                                                    cache: false,
                                                    data: {
                                                        opinionId: opinionId
                                                    },
                                                    success: function (data) {
                                                        if (data) {
                                                            var $itemdiv = $this.closest('.itemdiv');
                                                            if ($itemdiv.siblings().length <= 1) {
                                                                $itemdiv.parent().next('.opinion-showothers-btn').addClass('hidden');
                                                            }
                                                            $itemdiv.fadeOut(function () {
                                                                if ($itemdiv.siblings().length) {
                                                                    $itemdiv.prev().show();
                                                                }
                                                                $itemdiv.remove();
                                                            });
                                                        } else {
                                                            $this.closest('.itemdiv').find('.opinion-dialog-load').append('<span class="red">删除失败!</span>');
                                                            setTimeout(function () {
                                                                $this.closest('.itemdiv').find('.opinion-dialog-load').addClass('hidden').children('.red').remove();
                                                            }, 2000);
                                                        }
                                                    },
                                                    error: function () {
                                                        $this.closest('.itemdiv').find('.opinion-dialog-load').addClass('hidden');
                                                    }
                                                });
                                                $(this).dialog('close');
                                            }
                                        }
                                    ]
                                });
                            });
                            /*$('.btn-opinion').next().find('a').on('click', function () {
                             var $this = $(this);
                             $this.closest('.input-group').find('textarea').val($this.html()).trigger('change');
                             });*/
                        },
                        manualNumber: function () {
                            $('.btn-manual-number').on('click', function () {
                                var $this = $(this), $icon = $this.children(),
                                    $inputGroup = $this.closest('.input-group'),
                                    $input = $inputGroup.find('input[data-type="manual-number"]');
                                $.ajax({
                                    url: horizon.paths.apppath + '/horizon/template/formdata/manualnumber.wf',
                                    data: {
                                        serialnoid: $input.attr('data-numberid')
                                    },
                                    dataType: 'json',
                                    cache: false,
                                    beforeSend: function () {
                                        $this.attr('disabled', true);
                                        $icon.addClass('fa-spin');
                                    },
                                    error: function (xhr, ajaxOptions, thrownError) {
                                        $this.attr('disabled', false);
                                        $icon.removeClass('fa-spin');
                                        var $helpBlock = $inputGroup.siblings('.help-block');
                                        if ($helpBlock.length == 0) {
                                            $helpBlock = $('<div class="help-block red no-margin" id="' + $input.attr('name') + '-error"></div>');
                                            $helpBlock.insertAfter($inputGroup);
                                        }
                                        $helpBlock.html('请求失败: Error ' + xhr.status + '!');
                                    },
                                    success: function (data) {
                                        $this.attr('disabled', false);
                                        $icon.removeClass('fa-spin');
                                        if (data.state === 'success') {
                                            var result = '', formid = $input.attr('name').split('_')[0];//当前文本框所属表单ID
                                            $.each(data.result.split('|'), function (i, con) {
                                                var columnName = formid + '_' + con;
                                                if ($('[name="' + columnName + '"]').length) {
                                                    result += $('[name="' + columnName + '"]').val();
                                                } else {
                                                    result += con;
                                                }
                                            });
                                            $input.val(result);
                                            try {
                                                $input.trigger('change');
                                            } catch (e) {
                                            }
                                        } else {
                                            var $helpBlock = $inputGroup.siblings('.help-block');
                                            if ($helpBlock.length == 0) {
                                                $helpBlock = $('<div class="help-block red no-margin" id="' + $input.attr('name') + '-error"></div>');
                                                $helpBlock.insertAfter($inputGroup);
                                            }
                                            $helpBlock.html(data.message);
                                        }
                                    }
                                });
                            });
                        },
                        sign: function () {
                            var $signAction = arguments.length ? arguments[0] : $('[data-action="sign"]');
                            if ($signAction.length) {
                                $signAction.each(function () {
                                    var $this = $(this);
                                    var $signInput = $this.next();
                                    var $signContainer = $this.parent().siblings('.sign-container');
                                    if (!$signContainer.children().length) {
                                        $signContainer.addClass('hidden');
                                    }
                                    $signContainer.on(horizon.tools.clickEvent(), '[data-action="delete-sign"]', function () {
                                        var $delete = $(this);
                                        var signId = $delete.attr('data-signid');
                                        var allSign = JSON.parse($signInput.val());
                                        $.each(allSign, function (i, sign) {
                                            if (sign.id == signId) {
                                                allSign.splice(i, 1);
                                                return;
                                            }
                                        });
                                        $delete.closest('.sign').fadeOut(function () {
                                            $(this).remove();
                                        });
                                        $signContainer.addClass(allSign.length ? '' : 'hidden');
                                        $signInput.val(allSign.length ? JSON.stringify(allSign) : '');
                                    });
                                });
                                $signAction.on(horizon.tools.clickEvent(), function () {
                                    var $this = $(this);
                                    var getSign = function (pwd) {
                                        var data = {
                                            password: pwd ? pwd : ''
                                        };
                                        $.ajax({
                                            url: horizon.paths.apppath + '/sign/getSign.wf',
                                            cache: false,
                                            dataType: 'json',
                                            data: data,
                                            success: function (data) {
                                                if (data) {
                                                    if (data.status == 'success') {
                                                        var sign = data.sign;
                                                        var $signInput = $this.next();
                                                        var $signContainer = $this.parent().siblings('.sign-container');
                                                        var signHtml = ['<div class="sign">'];
                                                        signHtml.push('<span class="sign-name' + (sign.pic ? ' hidden' : '') + '">' + sign.name + '</span>');
                                                        signHtml.push('<img class="sign-pic' + (sign.pic ? '' : ' hidden') + '" src="' + sign.pic + '" height="32px" width="90px">');
                                                        signHtml.push(' <span class="sign-datetime">' + sign.datetime + '</span> ');
                                                        signHtml.push('<a class="sign-delete pull-right" data-signid="' + sign.id + '" href="javascript:void(0);" data-action="delete-sign">');
                                                        signHtml.push('<i class="ace-icon fa fa-trash-o red bigger-110"></i> </a>');
                                                        signHtml.push('</div>');
                                                        delete sign['pic'];
                                                        var allSign = [];
                                                        if ($signInput.attr('multiple') != 'multiple') {
                                                            $signContainer.html('');
                                                        } else {
                                                            if ($signInput.val()) {
                                                                allSign = JSON.parse($signInput.val());
                                                            }
                                                            $.each(allSign, function (i, _sign) {
                                                                if (_sign.id == sign.id) {
                                                                    allSign.splice(i, 1);
                                                                    $signContainer.find('[data-signid="' + sign.id + '"]').closest('.sign').remove();
                                                                    return;
                                                                }
                                                            });
                                                        }
                                                        allSign.push(sign);
                                                        eval("var signstr = '" + JSON.stringify(allSign) + "';");
                                                        $signInput.val(signstr);
                                                        $signContainer.removeClass('hidden').append(signHtml.join(''));
                                                    } else if (data.status == 'password') {
                                                        $('<div></div>').dialog({
                                                            title: '请输入密码',
                                                            closeText: '关闭',
                                                            dialogHtml: '<input name="signPassword" class="form-control" type="password"/>',
                                                            buttons: [
                                                                {
                                                                    html: '确定',
                                                                    "class": "btn btn-primary btn-xs",
                                                                    click: function () {
                                                                        var $password = $(this).find('input[name="signPassword"]');
                                                                        if (!$password.val()) {
                                                                            $password.focus();
                                                                            return;
                                                                        }
                                                                        getSign($password.val());
                                                                        $(this).dialog('close');
                                                                    }
                                                                }
                                                            ]
                                                        });
                                                    } else {
                                                        $('<div></div>').dialog({
                                                            title: '提示',
                                                            closeText: '关闭',
                                                            dialogText: '密码错误',
                                                            dialogTextType: 'alert-danger'
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                    };
                                    getSign();
                                });
                            }
                        },
                        subtable: function () {
                            var $subtable = $('.subtable');
                            if ($subtable.length) {
                                var deleteFun = function () {
                                    if ($('#deleteRowConfirm').length) {
                                        return;
                                    }
                                    var $this = arguments[0];
                                    var $dialogMessage = $('<div id="deleteRowConfirm"></div>');
                                    $dialogMessage.removeClass('hide').dialog({
                                        title: '提示',
                                        closeText: '关闭',
                                        dialogText: '确认删除?',
                                        dialogTextType: 'alert-danger',
                                        buttons: [
                                            {
                                                html: '删除',
                                                "class": "btn btn-danger btn-xs",
                                                click: function () {
                                                    var $tr = $this.closest('tr'),
                                                        $tbody = $tr.parent();
                                                    $tr.hide(300, function () {
                                                        $tr.remove();
                                                        var $allTR = $tbody.children('tr:gt(0)');
                                                        $allTR.each(function (i) {
                                                            $(this).find('input,select,textarea').each(function () {
                                                                var $this = $(this),
                                                                    name = $this.attr('name');
                                                                if (name) {
                                                                    var index = name.lastIndexOf('_');
                                                                    name = name.substring(0, index) + '_' + i;
                                                                    $this.attr('name', name);
                                                                    var ariaDescribedby = $this.attr('aria-describedby');
                                                                    if (ariaDescribedby != null && ariaDescribedby != '') {
                                                                        if ($('#' + ariaDescribedby) != null && $('#' + ariaDescribedby).length > 0) {
                                                                            $('#' + ariaDescribedby).attr('id', name + '-error');
                                                                        }
                                                                        $this.attr('aria-describedby', name + '-error');
                                                                    }
                                                                }
                                                            })
                                                        });
                                                    });
                                                    $(this).dialog('close');
                                                }
                                            }
                                        ]
                                    });
                                };
                                $subtable.each(function () {
                                    var $table = $(this);
                                    var $addIcon = $table.find('a[data-action="addRow"]');
                                    var $deleteIcon = $table.find('a[data-action="deleteRow"]');
                                    var $tbody = $table.children('tbody');
                                    //初始化表格列宽
                                    var $th = $table.find('th:not(.hidden)');
                                    if ($th.last().find('.action-buttons').length > 0) {
                                        $th = $table.find('th:not(.hidden, :last)');
                                    }
                                    var thLen = $th.length;
                                    if (thLen) {
                                        $th.each(function () {
                                            var $this = $(this);
                                            var _width = $this.attr('data-width');
                                            if (!(_width && parseInt(_width))) {
                                                $th.css('width', 100 / thLen + '%');
                                                return false;
                                            }
                                            if (_width.indexOf('%') == -1) {
                                                _width += '%';
                                            }
                                            $this.css('width', _width);

                                        })
                                    }

                                    $deleteIcon.bind('click', function () {
                                        deleteFun($(this));
                                    });
                                    $addIcon.bind('click', function () {
                                        var $baseTR = $tbody.children('tr:eq(0)');
                                        var $tr = $baseTR.clone().removeClass('ignore');
                                        $tr.find('a[data-action="deleteRow"]').unbind().bind('click', function () {
                                            deleteFun($(this));
                                        });
                                        $tbody.append($tr.hide().removeClass('hidden'));
                                        $tr.show('fast', function () {
                                            $tr.find('input,select,textarea').each(function () {
                                                var $ele = $(this),
                                                    eleName = $ele.attr('name'),
                                                    rowIndex = $ele.closest('tr').index();
                                                $ele.attr('name', eleName + '_' + (rowIndex - 1));
                                                if ($ele.attr('data-type') == 'textarea') {
                                                    if ($ele.val() == $ele.attr('placeholder')) {
                                                        $ele.val('');
                                                    }
                                                    init.textarea($ele);
                                                } else if ($ele.attr('data-type') == 'number') {
                                                    $ele.next().remove();
                                                    $ele.unwrap().unwrap();
                                                    init.number($ele);
                                                } else if ($ele.attr('data-type') == 'date' ||
                                                    $ele.attr('data-type') == 'datetime') {
                                                    $ele.removeAttr('lay-key');
                                                    init.date($ele);
                                                } else if ($ele.attr('data-type') == 'select') {
                                                    $ele.next().remove();
                                                    $ele.show();
                                                    init.select($ele);
                                                } else if ($ele.attr('data-type') == 'file' && $ele.attr('type') == 'file') {
                                                    $ele.unwrap().next().remove();
                                                    init.file($ele);
                                                } else if ($ele.attr('data-type') == 'org') {
                                                    init.org($ele);
                                                }
                                            });
                                        });
                                    });
                                });
                            }
                        },
                        graphic: function () {
                            $('.form-graphic-itemdiv').each(function () {
                                var $itemdiv = $(this);
                                var $text = $itemdiv.find('.text');
                                var $tools = $itemdiv.find('.tools');
                                var $edit = $tools.children('a[data-action="edit"]');
                                var $over = $tools.children('a[data-action="over"]');
                                var _for = $itemdiv.attr('for');
                                var $for = $('[name="' + _for + '"]');
                                if (!$.trim($text.html())) {
                                    $text.html('空');
                                }
                                $itemdiv.find('.text, .tools > a[data-action="edit"]').on('click', function () {
                                    $('.form-graphic-itemdiv').find('a[data-action="over"]:not(.hidden)').trigger('click');
                                    $edit.addClass('hidden');
                                    $over.removeClass('hidden');
                                    $text.addClass('hidden');
                                    $tools.addClass('show');
                                    $itemdiv.siblings(':not(#' + _for + '-error, .opinion-dialogs)').removeClass('hidden');
                                    if ($.inArray($for.attr('data-type'), ['date', 'datetime']) == -1) {
                                        $for.focus().click();
                                    }
                                    $itemdiv.parent().css({
                                        overflow: '',
                                        zIndex: 1
                                    });
                                    if ($for.attr('data-type') == 'select') {
                                        $for.next().css({'width': $for.parent().width()});
                                    }
                                });
                                $over.on('click', function () {
                                    $edit.removeClass('hidden');
                                    $over.addClass('hidden');
                                    $text.removeClass('hidden');
                                    $tools.removeClass('show');
                                    $itemdiv.siblings(':not(#' + _for + '-error, .opinion-dialogs)').addClass('hidden');
                                    var value = $for.val();
                                    if ($for.attr('data-type') == 'select') {
                                        if ($for.attr('multiple')) {
                                            var arr = [];
                                            $for.children('option:selected').each(function () {
                                                arr.push($(this).text());
                                            });
                                            value = arr.join(';');
                                        } else {
                                            value = $for.children('option:selected').text();
                                        }
                                    }
                                    if (!value) {
                                        value = '空'
                                    }
                                    $text.html(value);
                                    $itemdiv.parent().css({
                                        overflow: 'auto',
                                        zIndex: ''
                                    });
                                });
                                var changeArr = ['org', 'select', 'manual-number', 'date', 'datetime'];
                                if ($.inArray($for.attr('data-type'), changeArr) > -1) {
                                    $for.on('change', function () {
                                        $over.trigger('click');
                                    });
                                } else if ($for.attr('data-type') != 'opinion') {
                                    $for.on('blur', function () {
                                        $over.trigger('click');
                                    });
                                }
                            });
                        }
                    };

                    $.each(init, function (key) {
                        init[key]();
                    });

                    if (_callback && typeof _callback === 'function') {
                        _callback.apply(this);
                    }
                });
            });

        }
    });

});
