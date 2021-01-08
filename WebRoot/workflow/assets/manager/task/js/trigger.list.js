/**
 * 触发器列表
 * @author zhaohuan
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'moment', 'horizonTable', 'jqueryValidate', 'jqueryForm', 'daterangepicker', 'gritter', 'elementsSpinner'], factory);
    } else {
        factory(jQuery);
    }
}(function($, moment) {
    var $dialog=$('#myDialog');
    var dateFormat = 'YYYY-MM-DD HH:mm';
    var table = {
        initTable: function() {
            table.mytable = $('#myTable').horizonTable({
                settings: {
                    title: horizon.lang['base']['infoLis'],
                    multipleSearchable: true,
                    height: function() {
                        var _height = horizon.tools.getPageContentHeight(),
                            $pageHeader = $('.page-header');
                        if($pageHeader.css('display') != 'none') {
                            _height -= $pageHeader.outerHeight(true);
                        }
                        return _height;
                    },
                    checkbox: 0,
                    columns: [
                        {
                            dataProp: 'id'
                        },
                        {
                            name: 'name',
                            title: horizon.lang['trigger-list']['triggerName'],
                            width: '300px',
                            searchable: true,
                            multipleSearchable: true,
                            fnClick: operate.myInfo
                        },
                        {
                            name: 'triggerName',
                            title: horizon.lang['trigger-list']['triggerCode'],
                            width: '150px',
                            orderable: false
                        },
                        {
                            name: 'triggerGroup',
                            title: horizon.lang['trigger-list']['triggerBlockCode'],
                            width: '150px',
                            orderable: false
                        },
                        {
                            name: 'triggerTypeDisplay',
                            title: horizon.lang['trigger-list']['triggerType'],
                            width: '60px',
                            orderable: false,
                            columnClass: 'align-center'
                        },
                        {
                            name: 'jobNum',
                            title: horizon.lang['trigger-list']['numberRelatedTasks'],
                            width: '60px',
                            orderable: false,
                            columnClass: 'align-center'
                        }
                    ],
                    buttons: [
                        {
                            id: 'add',
                            text: horizon.lang['base']['new'],
                            icon: 'fa fa-plus green',
                            fnClick: function() {
                                operate.add();
                            }
                        },
                        {
                            id: 'del',
                            text: horizon.lang['base']['delete'],
                            icon: 'fa fa-times red2',
                            fnClick: function() {
                                var ids = table.mytable.checkRowKeyArray;
                                if(!ids.length){
                                    if($('.gritter-item-wrapper').length > 0){
                                            	horizon.notice.error(horizon.lang['trigger-list']['selectDatawantdelete']);
                                    }else{
                                    	horizon.notice.error( horizon.lang['trigger-list']['selectDatawantdelete']);
                                    }
                                }else{
                                    $dialog.dialog({
                                        title: horizon.lang['message']['title'],
                                        dialogText: horizon.lang['trigger-list']['confirmDelete'],
                                        dialogTextType:'alert-danger',
                                        closeText:horizon.lang['base']['close'],
                                        buttons: [
                                            {
                                                html: horizon.lang['base']['ok'],
                                                "class": "btn btn-primary btn-xs",
                                                click: function() {
                                                    table.mytable.showProcessing();
                                                    operate.del(ids.join(';'));
                                                    $(this).dialog('close');
                                                }
                                            }
                                        ]
                                    });
                                }
                            }
                        }
                    ]
                },
                ajaxDataSource: horizon.tools.formatUrl('/task/trigger/page')
            });
        }
    };
    var operate = {
        initdaterangepicker: function() {
            var week = moment().format('d');
            var option = {
                showDropdowns: true,
                timePicker: true,
                timePicker24Hour: true,
                applyClass : 'btn-success',
                cancelClass : 'btn-default',
                locale: {
                    separator: horizon.lang['trigger-list']['to'],
                    format: dateFormat
                },
                ranges: {
                    'Today': [moment().startOf('days'), moment().endOf('days')],
                    'This week': [moment().subtract('days', week).startOf('days'), moment().add('days', (6-week)).endOf('days')],
                    'This Month': [moment().startOf('month'), moment().endOf('month')]
                }
            };
            $.extend(option['locale'], horizon.lang.daterangepicker);
            option['ranges'] = function() {
                var obj = {};
                obj[horizon.lang['trigger-list']['today']]=[moment().startOf('days'), moment().endOf('days')],
                    obj[horizon.lang['trigger-list']['thisWeek']]=[moment().subtract('days', week).startOf('days'), moment().add('days', (6-week)).endOf('days')],
                    obj[horizon.lang['trigger-list']['thisMonth']]=[moment().startOf('month'), moment().endOf('month')]
                return obj;
            }();
            $('.simple input[name=date_range_picker]').daterangepicker(option, function(start, end, label) {
                $('.simple input[name="startTime"]').val(start.format(dateFormat));
                $('.simple input[name="endTime"]').val(end.format(dateFormat));
            });
        },
        initForm: function() {
            //验证表单
            operate.checkForm();
            $('select[name="triggerType"]').change(function() {
                var triggerType = $(this).val();
                // 触发器类型：0 简单型,1 cron型
                if(triggerType == '1'){
                    $('.simple').addClass('hidden').find('.form-control').addClass('ignore');
                    $('.cron').removeClass('hidden').find('.form-control').removeClass('ignore');
                    if(!$('.cron input[name="cronExpress"]').val()){
                        $('.cron input[name="cronExpress"]').val('* * * * * ?');
                    }
                    cron.initCronValues();
                }else{
                    $('.simple').removeClass('hidden').find('.form-control').removeClass('ignore');
                    $('.cron').addClass('hidden').find('.form-control').addClass('ignore');
                }
            }).trigger('change');
            $('select[name="intervalType"]').focus(function() {
                $('.form-group').removeClass('has-error');
                $('label[id*="-error"]').html('');
            });
            operate.initdaterangepicker();
        },
        myInfo: function() {
            $('#myForm')[0].reset();
            $('.cron-spinner').each(function(){
                var $this = $(this);
                var value = $this.val();
                $this.ace_spinner('value',value);
            });
            var rowData = arguments[2];
            $.each(rowData,function(i,key){
                $('#myForm input[name="' + i + '"]').val(key);
            });
            $.each(rowData,function(i,key){
                $('select[name="' + i + '"]').val(key);
            });
            $('select[name="triggerType"]').trigger('change');
            if($('select[name="triggerType"]').val() == '0'){
                $('.simple input[name=date_range_picker]').data('daterangepicker').setStartDate($('.simple input[name="startTime"]').val());
                $('.simple input[name=date_range_picker]').data('daterangepicker').setEndDate($('.simple input[name="endTime"]').val());
            }
            $('.simple select[name="repeatInterval"]').val(rowData.repeatInterval);
            $('input[name="triggerName"]').attr('readOnly', true);
            $('input[name="triggerGroup"]').attr('readOnly', true);
            $('input[name="triggerName"]').addClass('ignore');
            $('input[name="triggerGroup"]').addClass('ignore');
            //清除表单验证提示信息
            $('.form-group').removeClass('has-error');
            $('label[id*="-error"]').html('');
            $('#myInfo').dialog({
                width: $(window).width() > 900?'900':'auto',
                height: $(window).height() > 750?'750':'auto',
                maxHeight: $(window).height(),
                title: horizon.lang['trigger-list']['triggerInformation'],
                closeText: horizon.lang['base']['close'],
                buttons: [
                    {
                        html: horizon.lang['base']['save'],
                        "class": "btn btn-primary btn-xs",
                        click: function() {
                            $('#myForm').submit();
                        }
                    }
                ]
            });
        },
        add: function() {
            $('#myForm')[0].reset();
            $('.cron-spinner').each(function(){
                var $this = $(this);
                var value = $this.val();
                $this.ace_spinner('value',value);
            });
            $('input[name="id"]').val('');
            var curDatetime = new Date();
            $('.simple input[name=date_range_picker]').data('daterangepicker').setStartDate(curDatetime);
            $('.simple input[name=date_range_picker]').data('daterangepicker').setEndDate(curDatetime);
            $('.simple input[name="startTime"]').val($('.simple input[name=date_range_picker]').data('daterangepicker').startDate.format(dateFormat));
            $('.simple input[name="endTime"]').val($('.simple input[name=date_range_picker]').data('daterangepicker').endDate.format(dateFormat));
            $('select[name="triggerType"]').trigger('change');
            $('input[name="triggerName"]').attr('readOnly', false);
            $('input[name="triggerGroup"]').attr('readOnly', false);
            $('input[name="triggerName"]').removeClass('ignore');
            $('input[name="triggerGroup"]').removeClass('ignore');
            //清除表单验证提示信息
            $('.form-group').removeClass('has-error');
            $('label[id*="-error"]').html('');
            $('#myInfo').dialog({
                width: $(window).width() > 900?'900':'auto',
                height: $(window).height() > 750?'750':'auto',
                maxHeight: $(window).height(),
                title: horizon.lang['trigger-list']['triggerInformation'],
                closeText:horizon.lang['base']['close'],
                buttons: [
                    {
                        html: horizon.lang['base']['save'],
                        "class": "btn btn-primary btn-xs",
                        click: function() {
                            $('#myForm').submit();
                        }
                    }
                ]
            });
        },
        del: function(ids) {
            $.ajax({
                url: horizon.tools.formatUrl('/task/trigger/delete'),
                cache: false,
                dataType: 'json',
                data: {
                    ids: ids
                },
                error: function() {
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang.message['operateError']);
                },
                success: function(data) {
                    table.mytable.hideProcessing();
                    if(data.restype == 'success'){
                    	horizon.notice.success(horizon.lang['message']['deleteSuccess']);
                        table.mytable.reload();
                    }else{
                    	horizon.notice.error( horizon.lang['message']['deleteFail']);
                    }
                }
            });
        },
        checkForm: function() {
            $('#myForm').validate({
                ignore: '.ignore',
                errorClass: 'help-block no-margin-bottom',
                focusInvalid: false,
                rules: {
                    name: {
                        checkName: true
                    },
                    triggerName: {
                        isCode: true,
                        minlength: 3
                    },
                    triggerGroup: {
                        isCode: true,
                        minlength: 3
                    },
                    date_range_picker: {
                        checkEndTime: true
                    },
                    repeatInterval: {
                        checkRepeatInterval: true,
                        checkRepeatIntervalRange: true
                    },
                    repeatCount: {
                        checkRepeatCount: true
                    },
                    cronExpress: {
                        checkCronExpress: true
                    }
                },
                messages: {
                    triggerName: {
                        minlength: horizon.lang['trigger-list']['mustLessThanCharacters']
                    },
                    triggerGroup: {
                        minlength: horizon.lang['trigger-list']['mustLessThanCharacters']
                    }
                },
                highlight: function(e) {
                    $(e).closest('.form-group').addClass('has-error');
                },
                success: function(e) {
                    $(e).closest('.form-group').removeClass('has-error');
                    $(e).remove();
                },
                submitHandler: function(form) {
                    table.mytable.showProcessing();
                    $(form).ajaxSubmit({
                        url: horizon.tools.formatUrl('/task/trigger/save'),
                        type: 'post',
                        dataType: 'json',
                        cache: false,
                        error: function() {
                            table.mytable.hideProcessing();
                            horizon.notice.error(horizon.lang.message['operateError']);
                        },
                        success: function(data) {
                            table.mytable.hideProcessing();
                            if(data.restype == 'success'){
                            	horizon.notice.success(horizon.lang['message']['saveSuccess']);
                                $('#myInfo').dialog('close');
                                table.mytable.reload();
                            }else{
                                var msg  = data.msg && data.msg.length>0 ?  data.msg[0]:horizon.lang['message']['saveFail'];
                                horizon.notice.error(msg);
                            }
                        }
                    });
                }
            });
            jQuery.validator.addMethod('checkName', function(value, element) {
                var tel = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
                return tel.test(value);
            }, horizon.lang['trigger-list']['chineseCharacters']);
            jQuery.validator.addMethod('isCode', function(value, element) {
                var tel = /^[A-Za-z0-9]+$/;
                return tel.test(value);
            }, horizon.lang['trigger-list']['lettersNumbers']);
            jQuery.validator.addMethod('checkEndTime', function(value, element) {
                var startTime = $('.simple input[name="startTime"]').val();
                var endTime = $('.simple input[name="endTime"]').val();
                if(endTime < startTime){
                    return false;
                }else{
                    return true;
                }
            }, horizon.lang['trigger-list']['endTimeNotLessStart']);
            jQuery.validator.addMethod('checkRepeatInterval', function(value, element) {
                var tel = /^([1-9]\d*)$/;
                if(!(tel.test(value) && value <= 2147483647)){
                    return false;
                }else{
                    return true;
                }
            }, horizon.lang['trigger-list']['illegalData']);
            jQuery.validator.addMethod('checkRepeatIntervalRange', function(value, element) {
                var startTime = $('.simple input[name="startTime"]').val();
                var endTime = $('.simple input[name="endTime"]').val();
                var s = new Date(startTime.replace(/-/g, '/'));
                var e = new Date(endTime.replace(/-/g, '/'));
                var time = e.getTime() - s.getTime();
                var intervalType = $('.simple select[name="intervalType"]').val();
                if(intervalType == '1'){// 秒
                    value = value * 1000;
                }else if (intervalType == '2'){// 分
                    value = value * 60000;
                }else if (intervalType == '3'){// 时
                    value = value * 3600000;
                }
                if(value > time){
                    return false;
                }else{
                    return true;
                }
            }, horizon.lang['trigger-list']['noStartTimeEndRange']);
            jQuery.validator.addMethod('checkRepeatCount', function(value, element) {
                var tel = /^([1-9]\d*|0|-1)$/;
                if(!(tel.test(value) && value <= 2147483647)){
                    return false;
                }else{
                    return true;
                }
            }, horizon.lang['trigger-list']['illegalData']);
            jQuery.validator.addMethod('checkCronExpress', function(value, element) {
                var start, end, result = true;

                // 校验秒、分钟、小时、日、月、年：循环触发的开始值应小于结束值
                var cycleCheck = $('.cron .cycle').each(function() {
                    var $this = $(this);
                    var name = $this.attr('name');
                    if($this[0].checked){
                        var ns = $this.parent().find('.cron-spinner');
                        start = ns.eq(0).val();
                        end = ns.eq(1).val();
                        if (parseInt(start) >= parseInt(end)) {
                            result  = false;
                            return false;
                        }
                    }
                });
                return result;
            }, horizon.lang['trigger-list']['startValueLoopLessEnd']);
        }
    };

    var ace_spinner_dataoptions = {
        dataoptions_0_59: {
            min: 0,
            max: 59,
            value: 0
        },
        dataoptions_1_59: {
            min: 1,
            max: 59,
            value: 1
        },
        dataoptions_0_23: {
            min: 0,
            max: 23,
            value: 0
        },
        dataoptions_1_23: {
            min: 1,
            max: 23,
            value: 1
        },
        dataoptions_1_31: {
            min: 1,
            max: 31,
            value: 1
        },
        dataoptions_2_31: {
            min: 2,
            max: 31,
            value: 2
        },
        dataoptions_1_12: {
            min: 1,
            max: 12,
            value: 1
        },
        dataoptions_2_12: {
            min: 2,
            max: 12,
            value: 2
        },
        dataoptions_1_7: {
            min: 1,
            max: 7,
            value: 1
        },
        dataoptions_2_7: {
            value: 2,
            min: 2,
            max: 7
        },
        dataoptions_1_4: {
            min: 1,
            max: 4,
            value: 1
        },
        dataoptions_2015_3000: {
            min: 2015,
            max: 3000
        },
        dataoptions_2016_3000: {
            min: 2016,
            max: 3000
        }
    };
    var cron = {
        initCron: function() {
            // 生成spinner控件
            $('.cron .cron-spinner').each(function(){
                var $this = $(this);
                var dataoptions = $this.attr('data-options');
                $this.ace_spinner({
                    min: ace_spinner_dataoptions[dataoptions].min,
                    max: ace_spinner_dataoptions[dataoptions].max,
                    value: ace_spinner_dataoptions[dataoptions].value,
                    step: 1,
                    btn_up_class: 'btn-info',
                    btn_down_class: 'btn-info'
                }).closest('.ace-spinner').on('changed.fu.spinbox', function() {
                    if($this.val() != $this.attr('value')) {
                        $this.closest('label').children().eq(0).click();
                    }
                }).closest('.ace-spinner').on('focusin.fu.spinbox', function() {
                    $this.closest('label').children().eq(0).click();
                });
            });
            // 绑定事件
            $('.cron .everyTime').on('click', function(){
                cron.everyTime($(this));
            });
            $('.cron .cycle').on('click', function(){
                cron.cycle($(this));
            });
            $('.cron .startOn').on('click', function(){
                cron.startOn($(this));
            });
            $('.cron .unAppoint').on('click', function(){
                cron.unAppoint($(this));
            });
            $('.cron .workDay').on('click', function(){
                cron.workDay($(this));
            });
            $('.cron .lastDay').on('click', function(){
                cron.lastDay($(this));
            });
            $('.cron .weekOfDay').on('click', function(){
                cron.weekOfDay($(this));
            });
            $('.cron .lastWeek').on('click', function(){
                cron.lastWeek($(this));
            });
            $('.cron .checkDayAndWeek').on('click', function(){
                cron.checkDayAndWeek($(this));
            });

            // 初始化（秒、分、时、日、月、周）的指定选项
            $('.cron .appoint').each(function(){
                cron.initAppoint($(this));
            });

            var vals = $('.cron input[name^="v_"]');
            vals.change(function() {
                var item = [];
                vals.each(function() {
                    item.push(this.value);
                });
                $('.cron input[name="cronExpress"]').val(item.join(' '));
            });
        },
        // 每***
        everyTime: function($this) {
            var name = $this.attr('name');
            var item = $('.cron input[name="v_' + name + '"]');
            item.val('*');
            item.change();
        },
        // 循环
        cycle: function($this) {
            var ns = $this.parent().find('.cron-spinner');
            var start = ns.eq(0).val();
            var end = ns.eq(1).val();
            var name = $this.attr('name');
            var item = $('.cron input[name="v_' + name + '"]');
            item.val(start + '-' + end);
            item.change();
        },
        // 从***开始
        startOn: function($this) {
            var ns = $this.parent().find('.cron-spinner');
            var start = ns.eq(0).val();
            var end = ns.eq(1).val();
            var name = $this.attr('name');
            var item = $('.cron input[name="v_' + name + '"]');
            item.val(start + '/' + end);
            item.change();
        },
        // 不指定
        unAppoint: function($this) {
            var name = $this.attr('name');
            if (name == 'day' && $('.cron input[name="v_week"]').val() == '?') {
                $('.cron input[name="week"].everyTime.checkDayAndWeek').click();
            }
            if (name == 'week' && $('.cron input[name="v_day"]').val() == '?') {
                $('.cron input[name="day"].everyTime.checkDayAndWeek').click();
            }
            var val = '?';
            if (name == 'year') val = '';
            var item = $('.cron input[name="v_' + name + '"]');
            item.val(val);
            item.change();
        },
        //  每月***号最近的那个工作日
        workDay: function($this) {
            var ns = $this.parent().find('.cron-spinner');
            var start = ns.eq(0).val();
            var name = $this.attr('name');
            var item = $('.cron input[name="v_' + name + '"]');
            item.val(start + 'W');
            item.change();
        },
        // 本月最后一天
        lastDay: function($this) {
            var name = $this.attr('name');
            var item = $('.cron input[name="v_' + name + '"]');
            item.val('L');
            item.change();
        },
        // 序号触发：每月第***周 的周***触发
        weekOfDay: function($this) {
            var ns = $this.parent().find('.cron-spinner');
            var start = ns.eq(0).val();
            var end = ns.eq(1).val();
            var name = $this.attr('name');
            var item = $('.cron input[name="v_' + name + '"]');
            item.val(end + '#' + start);
            item.change();
        },
        // 最后触发：本月最后一个周***触发
        lastWeek: function($this) {
            var ns = $this.parent().find('.cron-spinner');
            var start = ns.eq(0).val();
            var name = $this.attr('name');
            var item = $('.cron input[name="v_' + name + '"]');
            item.val(start + 'L');
            item.change();
        },
        // 验证：日和周，其中必须有一个的值为 ?(问号)
        checkDayAndWeek: function($this) {
            var name = $this.attr('name');
            if (name == 'day' && $('.cron input[name="v_week"]').val() != '?') {
                $('.cron input[name="week"].unAppoint').click();
            }
            if (name == 'week' && $('.cron input[name="v_day"]').val() != '?') {
                $('.cron input[name="day"].unAppoint').click();
            }
        },
        // 初始化（秒、分、时、日、月、周）的指定选项
        initAppoint: function($this) {
            var name = $this.attr('name');
            var _html = '';
            var start_i = 0;// 开始
            var end_i = 59;// 结束
            var max = 60;
            if (name == 'hour') {
                end_i = 23;
                max = 24;
            } else if (name == 'day') {
                start_i = 1;
                end_i = 31;
                max = 31;
            } else if (name == 'month') {
                start_i = 1;
                end_i = 12;
                max = 12;
            } else if (name == 'week') {
                start_i = 1;
                end_i = 7;
                max = 7;
            }
            _html += '<div class="' + name + '_AppointList">';
            _html += '<div class="checkbox">';
            for (var i = start_i; i <= end_i; i++) {
                _html += '<label style="width:50px;height:28px;"><input type="checkbox" class="ace" value="'+i+'"/><span class="lbl"> '+i+'</span></label>';
            }
            _html += '</div></div>';
            $this.closest('div').after(_html);
            cron.appointListChange(name, max);
        },
        appointListChange: function(name, max) {
            var appoint = $('.cron input[name="' + name + '"].appoint');
            var appointList = $('.cron .' + name + '_AppointList input');
            appoint.click(function() {
                if (this.checked) {
                    appointList.eq(0).change();
                }
            });
            appointList.change(function() {
                appoint.prop('checked', true);
                var vals = [];
                appointList.each(function() {
                    if (this.checked) {
                        vals.push(this.value);
                    }
                });
                var val = '*';
                if (vals.length > 0 && vals.length < max) {
                    val = vals.join(',');
                } else if (vals.length == max) {
                    val = '*';
                }
                var item = $('.cron input[name="v_' + name + '"]');
                item.val(val);
                item.change();
                if(name == 'day' || name == 'week'){
                    cron.checkDayAndWeek(appoint);
                }
            });
        },
        initCronValues: function() {
            // Tab页默认显示第一页(秒)
            $('.cron #myTab').children().removeClass('active');
            $('.cron #myTab').children().eq(0).addClass('active');
            $('.cron .tab-pane').removeClass('active');
            $('.cron .tab-pane').eq(0).addClass('active');

            // 单选按钮、复选框，默认不选中
            $('.cron input[type="radio"]:checked').prop("checked", false);
            $('.cron input[type="checkbox"]:checked').prop("checked", false);

            // 将v_开头的隐藏域置空
            $('.cron input[name^="v_"]').val('');

            // 获取参数中表达式的值
            var txt = $('.cron input[name="cronExpress"]').val();
            if (txt) {
                var regs = txt.split(' ');
                $('.cron input[name="v_second"]').val(regs[0]);
                $('.cron input[name="v_min"]').val(regs[1]);
                $('.cron input[name="v_hour"]').val(regs[2]);
                $('.cron input[name="v_day"]').val(regs[3]);
                $('.cron input[name="v_month"]').val(regs[4]);
                $('.cron input[name="v_week"]').val(regs[5]);

                cron.initObj(regs[0], 'second');
                cron.initObj(regs[1], 'min');
                cron.initObj(regs[2], 'hour');
                cron.initDay(regs[3]);
                cron.initMonth(regs[4]);
                cron.initWeek(regs[5]);

                if (regs.length > 6) {
                    $('.cron input[name="v_year"]').val(regs[6]);
                    cron.initYear(regs[6]);
                }else{
                    $('.cron input[name="year"]').eq(0).prop('checked', true);
                }
            }
        },
        initObj: function(strVal, strid) {
            var ary = null;
            var objRadio = $('.cron input[name="' + strid + '"]');
            if (strVal == '*') {
                objRadio.eq(0).prop('checked', true);
            } else if (strVal.split('-').length > 1) {
                ary = strVal.split('-');
                objRadio.eq(1).prop('checked', true);
                $('.cron #' + strid + 'Start_0').ace_spinner('value', ary[0]);
                $('.cron #' + strid + 'End_0').ace_spinner('value', ary[1]);
            } else if (strVal.split('/').length > 1) {
                ary = strVal.split('/');
                objRadio.eq(2).prop('checked', true);
                $('.cron #' + strid + 'Start_1').ace_spinner('value', ary[0]);
                $('.cron #' + strid + 'End_1').ace_spinner('value', ary[1]);
            } else {
                objRadio.eq(3).prop('checked', true);
                if (strVal != '?') {
                    ary = strVal.split(',');
                    for (var i = 0; i < ary.length; i++) {
                        $('.cron .' + strid + '_AppointList input[value="' + ary[i] + '"]').prop("checked", true);
                    }
                }
            }
        },
        initDay: function(strVal) {
            var ary = null;
            var objRadio = $('.cron input[name="day"]');
            if (strVal == '*') {
                objRadio.eq(0).prop('checked', true);
            } else if (strVal == '?') {
                objRadio.eq(1).prop('checked', true);
            } else if (strVal.split('-').length > 1) {
                ary = strVal.split('-');
                objRadio.eq(2).prop('checked', true);
                $('.cron #dayStart_0').ace_spinner('value', ary[0]);
                $('.cron #dayEnd_0').ace_spinner('value', ary[1]);
            } else if (strVal.split('/').length > 1) {
                ary = strVal.split('/');
                objRadio.eq(3).prop('checked', true);
                $('.cron #dayStart_1').ace_spinner('value', ary[0]);
                $('.cron #dayEnd_1').ace_spinner('value', ary[1]);
            } else if (strVal.split('W').length > 1) {
                ary = strVal.split('W');
                objRadio.eq(4).prop('checked', true);
                $('.cron #dayStart_2').ace_spinner('value', ary[0]);
            } else if (strVal == 'L') {
                objRadio.eq(5).prop('checked', true);
            } else {
                objRadio.eq(6).prop('checked', true);
                ary = strVal.split(',');
                for (var i = 0; i < ary.length; i++) {
                    $('.cron .day_AppointList input[value="' + ary[i] + '"]').prop("checked", true);
                }
            }
        },
        initMonth: function(strVal) {
            var ary = null;
            var objRadio = $('.cron input[name="month"]');
            if (strVal == '*') {
                objRadio.eq(0).prop('checked', true);
            } else if (strVal.split('-').length > 1) {
                ary = strVal.split('-');
                objRadio.eq(1).prop('checked', true);
                $('.cron #monthStart_0').ace_spinner('value', ary[0]);
                $('.cron #monthEnd_0').ace_spinner('value', ary[1]);
            } else if (strVal.split('/').length > 1) {
                ary = strVal.split('/');
                objRadio.eq(2).prop('checked', true);
                $('.cron #monthStart_1').ace_spinner('value', ary[0]);
                $('.cron #monthEnd_1').ace_spinner('value', ary[1]);
            } else {
                objRadio.eq(3).prop('checked', true);
                ary = strVal.split(',');
                for (var i = 0; i < ary.length; i++) {
                    $('.cron .month_AppointList input[value="' + ary[i] + '"]').prop("checked", true);
                }
            }
        },
        initWeek: function(strVal) {
            var ary = null;
            var objRadio = $('.cron input[name="week"]');
            if (strVal == '*') {
                objRadio.eq(0).prop('checked', true);
            } else if (strVal == '?') {
                objRadio.eq(1).prop('checked', true);
            } else if (strVal.split('-').length > 1) {
                ary = strVal.split('-');
                objRadio.eq(2).prop('checked', true);
                $('.cron #weekStart_0').ace_spinner('value', ary[0]);
                $('.cron #weekEnd_0').ace_spinner('value', ary[1]);
            } else if (strVal.split('#').length > 1) {
                ary = strVal.split('#');
                objRadio.eq(3).prop('checked', true);
                $('.cron #weekStart_1').ace_spinner('value', ary[1]);
                $('.cron #weekEnd_1').ace_spinner('value', ary[0]);
            } else if (strVal.split('L').length > 1) {
                ary = strVal.split('L');
                objRadio.eq(4).prop('checked', true);
                $('.cron #weekStart_2').ace_spinner('value', ary[0]);
            } else {
                objRadio.eq(5).prop('checked', true);
                ary = strVal.split(',');
                for (var i = 0; i < ary.length; i++) {
                    $('.cron .week_AppointList input[value="' + ary[i] + '"]').prop("checked", true);
                }
            }
        },
        initYear: function(strVal) {
            var ary = null;
            var objRadio = $('.cron input[name="year"]');
            if (strVal == '*') {
                objRadio.eq(1).prop('checked', true);
            } else if (strVal.split('-').length > 1) {
                ary = strVal.split('-');
                objRadio.eq(2).prop('checked', true);
                $('.cron #yearStart_0').ace_spinner('value', ary[0]);
                $('.cron #yearEnd_0').ace_spinner('value', ary[1]);
            }
        }
    };
    return horizon.engine['trigger'] = {
        initTable: table.initTable,
        initForm: operate.initForm,
        initCron: cron.initCron
    };
}));