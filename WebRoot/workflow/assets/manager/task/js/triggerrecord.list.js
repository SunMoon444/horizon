/**
 * 任务运行记录
 * @author zhaohuan
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonTable', 'horizonDatatables', 'jqueryValidate', 'jqueryForm', 'gritter'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    var $dialog=$('#myDialog');
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
                    checkbox: 0,
                    columns: [
                        {
                            dataProp: 'id'
                        },
                        {
                            name: 'jobTitle',
                            title: horizon.lang['triggerrecord-list']['taskName'],
                            width: '250px',
                            searchable: true,
                            multipleSearchable: true,
                            fnClick: operate.myInfo
                        },
                        {
                            name: 'triggerTitle',
                            title: horizon.lang['triggerrecord-list']['triggerName'],
                            width: '250px',
                            searchable: true,
                            multipleSearchable: true
                        },
                        {
                            name: 'startTime',
                            title: horizon.lang['triggerrecord-list']['triggerTime'],
                            width: '150px',
                            columnClass: 'align-center'
                        },
                        {
                            name: 'runTime',
                            title: horizon.lang['triggerrecord-list']['runTime'],
                            width: '80px',
                            orderable: false,
                            columnClass: 'align-center'
                        }
                    ],
                    buttons: [
                        {
                            id: 'del',
                            text: horizon.lang['base']['delete'],
                            icon: 'fa fa-times red2',
                            fnClick: function() {
                                var ids = table.mytable.checkRowKeyArray;
                                if(!ids.length){
                                    if($('.gritter-item-wrapper').length > 0){
                                            	horizon.notice.error(horizon.lang['message']['deleteHelp']);
                                    }else{
                                    	horizon.notice.error(horizon.lang['message']['deleteHelp']);
                                    }
                                }else{
                                    $dialog.dialog({
                                        title: horizon.lang['message']['title'],
                                        dialogText: horizon.lang['triggerrecord-list']['confirmDelete'],
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
                ajaxDataSource: horizon.tools.formatUrl('/task/triggerrecord/page')
            });
        }
    };
    var operate = {
        myInfo: function() {
            var rowData = arguments[2];
            $.each(rowData,function(i,key){
                $('#myForm input[name="' + i + '"]').val(key);
            });
            $('#myInfo').dialog({
                width: 700,
                title: horizon.lang['triggerrecord-list']['runRecordInfo'],
                closeText: '关闭'
            });
        },
        del: function(ids) {
            $.ajax({
                url: horizon.tools.formatUrl('/task/triggerrecord/delete'),
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
                    	horizon.notice.error(horizon.lang['message']['deleteFail']);
                    }
                }
            });
        }
    };
    return horizon.engine['jobrunrecord'] = {
        initTable: table.initTable
    };
}));