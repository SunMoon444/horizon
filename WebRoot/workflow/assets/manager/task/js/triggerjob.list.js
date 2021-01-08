/**
 * 正在运行任务
 * @author zhaohuan
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonTable', 'horizonDatatables', 'jqueryValidate', 'jqueryForm', 'bootstrapDatepicker', 'gritter'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    var table = {
        initTable: function() {
            table.mytable = $('#myTable').horizonTable({
                settings: {
                    title: horizon.lang['base']['infoList'],
                    multipleSearchable : true,
                    height: function() {
                        var _height = horizon.tools.getPageContentHeight(),
                            $pageHeader = $('.page-header');
                        if($pageHeader.css('display') != 'none') {
                            _height -= $pageHeader.outerHeight(true);
                        }
                        return _height;
                    },
                    checkbox: -1,
                    columns: [
                        {
                            name: 'id',
                            visible: false
                        },
                        {
                            name: 'jobName',
                            title: horizon.lang['triggerjob-list']['columnsTaskName'],
                            width: '250px',
                            searchable: true,
                            multipleSearchable: true
                        },
                        {
                            name: 'triggerName',
                            title: horizon.lang['triggerjob-list']['columnsTriggerName'],
                            width: '250px',
                            searchable: true,
                            multipleSearchable: true
                        },
                        {
                            name: 'triggerState',
                            title: horizon.lang['triggerjob-list']['columnsTriggerState'],
                            width: '60px',
                            orderable: false
                        },
                        {
                            name: 'id',
                            title: horizon.lang['triggerjob-list']['columnsOperation'],
                            width: '120px',
                            orderable: false,
                            columnClass: 'align-center'
                        }
                    ],
                    fnCreateCell: function(nTd, nTdData, rowData, iRow, i) {
                        var _html = '';
                        //[操作]列
                        if(i == 4) {//操作列
                            var _name = '';
                            var _para = '';
                            if($.trim(rowData.triggerState) == horizon.lang['triggerjob-list']['paused']) {
                                _name = horizon.lang['triggerjob-list']['awaken'];
                                _para = 'resume';
                            } else {
                                _name = horizon.lang['triggerjob-list']['pause'];
                                _para = 'pause';
                            }
                            _html = '<label class="blue pointer" href="#nogo" data-action="pauseResume" title="' + _name + '">' + _name + '</label>'
                                + '&nbsp;&nbsp;&nbsp;&nbsp;<label class="blue pointer" href="#nogo" data-action="unSchedule" title='+horizon.lang['triggerjob-list']['releaseTrigger']+'>'+horizon.lang['triggerjob-list']['releaseTrigger']+'</label>';
                            var $ntd = $(nTd);
                            $ntd.html(_html);
                            $ntd.find('label[data-action="pauseResume"]').on(horizon.tools.clickEvent(), function() {
                                operate.pauseResume($.trim(rowData.triggerCode), rowData.triggerGroup, _para);
                            });
                            $ntd.find('label[data-action="unSchedule"]').on(horizon.tools.clickEvent(), function() {
                                operate.unSchedule($.trim(rowData.triggerCode), rowData.triggerGroup, rowData.id);
                            });
                        }
                    }
                },
                ajaxDataSource: horizon.tools.formatUrl('/task/job/pagetriggerjob')
            });
        }
    };
    var operate = {
        pauseResume: function(triggerCode, triggerGroup, operType) {
            var _url = horizon.tools.formatUrl('/task/job/' + operType);
            $.ajax({
                url: _url,
                cache: false,
                dataType: 'json',
                data: {
                    triggerCode: triggerCode,
                    triggerGroup: triggerGroup
                },
                error: function() {
                	horizon.notice.error(horizon.lang.message['operateError']);
                },
                success: function(data) {
                    var msg = '';
                    if(operType == 'pause'){
                        msg = horizon.lang['triggerjob-list']['pause'];
                    }else{
                        msg = horizon.lang['triggerjob-list']['awaken'];
                    }
                    if(data.restype == 'success'){
                    	horizon.notice.success(msg +  horizon.lang['triggerjob-list']['success']);
                        table.mytable.reload();
                    }else{
                    	horizon.notice.error(msg + horizon.lang['triggerjob-list']['failure']);
                    }
                }
            });
        },
        unSchedule: function(triggerCode, triggerGroup, id) {
            $.ajax({
                url: horizon.tools.formatUrl('/task/job/unschedule'),
                cache: false,
                dataType: 'json',
                data: {
                    triggerCode: triggerCode,
                    triggerGroup: triggerGroup,
                    id: id
                },
                error: function() {
                	horizon.notice.error(horizon.lang.message['operateError']);
                },
                success: function(data) {
                    if(data.restype == 'success'){
                    	horizon.notice.success(horizon.lang['triggerjob-list']['releaseSuccess']);
                        table.mytable.reload();
                    }else{
                    	horizon.notice.error(horizon.lang['triggerjob-list']['releaseFailed']);
                    }
                }
            });
        }
    };
    return horizon.engine['jobrun'] = {
        initTable: table.initTable
    };
}));