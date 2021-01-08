/**
 * 工作日设置
 * @author yaodd
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        if(horizon.vars.lang == 'en'){
            define(['jquery', 'fullcalendar', 'bootstrapDatetimepicker', 'gritter'], factory);
        } else {
            define(['jquery', 'fullcalendar-zh-CN', 'bootstrapDatetimepicker', 'gritter'], factory);
        }
    } else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var $dialog = $('#workday-dialog');
    var gzr = 0;
    var xxr = 0;
    var initCalendar={
        calendar: function() {
            var _height = initCalendar.outerHeight();
            $('#calendar').fullCalendar({
                height: _height,
                weekMode: 'liquid',
                buttonHtml: {
                    prev: '<i class="ace-icon fa fa-chevron-left"></i>',
                    next: '<i class="ace-icon fa fa-chevron-right"></i>'
                },
                header: {
                    left: '',
                    center: 'title',
                    right: ''
                },
                windowResize:function(view) {
                    var _height = initCalendar.outerHeight();
                    if(_height < 325) {
                        _height = 325;
                    }
                    $('#calendar').fullCalendar('option', 'height',  _height);
                },
                eventClick: function(calEvent, jsEvent, view) {
                    var deptid = $('select[name="dept"]').val();
                    if(calEvent.title == horizon.lang['work-day']['setWorkingDay']) {
                        initCalendar.saveWorkDay(calEvent.id, deptid);
                    }else{
                        initCalendar.cancelWorkDay(calEvent.id, deptid);
                    }
                }
            });
            $('.fc-right').append('<div class="selectDiv"><input type="text" class="form-control select-workday pointer" readonly name="YM" style="margin-left: 10px;"/>'+
                '<select class="form-control select-workday" name="dept"></select></div>');
        },
        outerHeight: function() {
            var _height = horizon.tools.getPageContentHeight(),
                $pageHeader = $('.page-header');
            if($pageHeader.css('display') != 'none') {
                _height -= $pageHeader.outerHeight(true);
            }
            return _height - 34;
        },
        //取消工作日
        cancelWorkDay:function(date, deptid) {
            $.ajax({
                url: horizon.tools.formatUrl('/manager/workcalendar/workday/cancel'),
                dateType: 'json',
                cache: false,
                data:{
                    'date': date,
                    'deptid': deptid
                },
                error:function() {
                	horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success:function(data) {
                    if(data.restype != 'err') {
                        $('#calendar').fullCalendar('removeEvents', date);
                        var event = {
                            id: date,
                            title:horizon.lang['work-day']['setWorkingDay'],
                            start: date,
                            className: 'label-info',
                            allDay: true
                        };
                        $('#calendar').fullCalendar('renderEvent', event);
                        gzr = parseInt(gzr) - 1;
                        xxr = parseInt(xxr) + 1;
                        $('#gzr').html(gzr);
                        $('#xxr').html(xxr);
                    }else{
                    	horizon.notice.error(horizon.lang['work-day']['cancelFail']);
                    }
                }
            });
        },
        //设置工作日
        saveWorkDay:function(date, deptid) {
            $.ajax({
                url: horizon.tools.formatUrl('/manager/workcalendar/workday/save'),
                dateType: 'json',
                cache: false,
                data: {
                    'date': date,
                    'deptid': deptid
                },
                error: function() {
                	horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success: function(data) {
                    if(data.restype != 'err') {
                        $('#calendar').fullCalendar('removeEvents', date);
                        var event={
                            id: date,
                            title: horizon.lang['work-day']['cancelWorkDay'],
                            start: date,
                            className: 'label-success',
                            allDay: true
                        };
                        $('#calendar').fullCalendar('renderEvent', event);
                        gzr = parseInt(gzr) + 1;
                        xxr = parseInt(xxr) - 1;
                        $('#gzr').html(gzr);
                        $('#xxr').html(xxr);
                    }else{
                    	horizon.notice.error(horizon.lang['work-day']['setupFail']);
                    }
                }
            });
        },
        //加载下拉菜单内容
        initData:function() {
            var $selectDept = $('select[name="dept"]');
            var $YM = $('input[name="YM"]');
            //初始化部门下拉菜单
            initCalendar.getDept();
            //默认为系统当前年月
            var date = new Date().toJSON();
            $YM.val(date.substring(0,7));
            $selectDept.change(function() {
                var deptid = $selectDept.val();
                var date = $YM.val();
                if(deptid != null && deptid != '') {
                    initCalendar.updateCalendar(deptid, date);
                }
            }).trigger('change');
            setTimeout(function() {
                $YM.datetimepicker({
                    language: horizon.vars.lang,
                    autoclose: true,
                    format: 'yyyy-mm',
                    startView: 'decade',
                    maxView: 'year',
                    minView: 'year'
                }).on('change', function() {
                    var deptid = $selectDept.val();
                    var ym = $YM.val();
                    initCalendar.updateCalendar(deptid, ym);
                }).on(horizon.tools.clickEvent(), function() {
                    $('.datetimepicker ').removeClass('datetimepicker-dropdown-bottom-right')
                        .addClass('datetimepicker-dropdown-bottom-left');
                });
            },1);
        },
        updateCalendar:function(deptid, date) {
            var $calendar = $('#calendar');
            $calendar.fullCalendar('removeEvents');
            $calendar.fullCalendar('gotoDate', date);
            $.gritter.add({
                text: '<i class="fa fa-spin fa-spinner bigger-200"></i> '+horizon.lang['work-day']['loading'],
                sticky: true,
                class_name: 'gritter-load',
                after_open: function() {
                    setTimeout(function() {
                        $.ajax({
                            url: horizon.tools.formatUrl('/manager/workcalendar/workday/month'),
                            dataType: 'json',
                            cache: false,
                            data: {
                                'deptid': deptid,
                                'yearmonth': date
                            },
                            error: function() {
                                   horizon.notice.error(horizon.lang['message']['operateError']);
                            },
                            success: function(data) {
                                if(data.gzr.length) {
                                    var workDayArr = data.gzr;
                                    gzr = workDayArr.length;
                                    xxr = data.xxr;
                                    $('#gzr').html(gzr);
                                    $('#xxr').html(xxr);
                                    var $day = $('.fc-bg .fc-day:not(.fc-other-month)');
                                    $day.each(function() {
                                        var $this = $(this);
                                        var _title,_className;
                                        var day = $this.attr('data-date');
                                        if($.inArray(day, workDayArr) != -1) {
                                            _title = horizon.lang['work-day']['cancelWorkDay'];
                                            _className = 'label-success';
                                        }else{
                                            _title =horizon.lang['work-day']['setWorkingDay'];
                                            _className = 'label-info';
                                        }
                                        var a = {
                                            id: day,
                                            title: _title,
                                            start: day,
                                            className: _className,
                                            allDay: true
                                        };
                                        $calendar.fullCalendar('renderEvent', a);

                                    });
                                    $.gritter.removeAll();
                                }else{
                                       horizon.notice.error(horizon.lang['work-day']['notinit']);
                                }
                            }
                        });
                    }, 1);
                }
            });
        },
        getDept:function() {
            //获取部门信息
            $.ajax({
                url: horizon.tools.formatUrl('/manager/workcalendar/load/dept'),
                dataType:'json',
                cache: false,
                async: false,
                error: function() {
                	horizon.notice.error(horizon.lang['message']['operateError']);
                },
                success: function(data) {
                    if(data != ''){
                        var $selectDept = $('select[name="dept"]');
                        $selectDept.children().remove();
                        $.each(data,function(i, dept){
                            if(i == 0){
                                var $option = $('<option selected value="' + dept.organId + '">' + dept.organName + '</option>');
                            }else{
                                var $option = $('<option value="' + dept.organId + '">' + dept.organName + '</option>');
                            }
                            $selectDept.append($option);
                        });
                    }else{
                        if($('.gritter-item-wrapper').length > 0){
                               horizon.notice.error(horizon.lang['work-day']['notInitWorkCalendar']);
                        }else{
                        	horizon.notice.error( horizon.lang['work-day']['notInitWorkCalendar']);
                        }
                        return;
                    }
                }
            });
        }
    };
    return horizon.engine['workdaysetup'] = {
        initCalendar : initCalendar.calendar,
        initData : initCalendar.initData
    };
}));