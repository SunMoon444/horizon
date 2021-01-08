/**
 * 撤办文件
 * @author yaodd
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonTable', 'gritter'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var $dialog=$('#flowundolist-dialog');
    var table = {
        init:function() {
            table.mytable = $('#myDatatable').horizonTable({
                settings: {
                    title: horizon.lang['todo-common']['undoTableTitle'],
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
                            dataProp : 'id'
                        },
                        {
                            name : 'title',
                            title : horizon.lang['todo-common']['columnsTitle'],
                            width : '400px',
                            searchable : true,
                            fnClick : operate.editFlow
                        },
                        {
                            name : 'startTime',
                            title : horizon.lang['todo-common']['hadstartedStartTime'],
                            width : '350px',
                            columnClass :'center'
                        }
                    ],
                    buttons:[
                        {
                            id: 'deleteflow',
                            text:horizon.lang.base['delete'],
                            icon: 'fa fa-times red2',
                            fnClick: function() {
                                var ids = table.mytable.checkRowKeyArray;
                                if(!ids.length){
                                    if($('.gritter-item-wrapper').length > 0){
                                            	horizon.notice.error(horizon.lang['todo-common']['deleteSelectInstance']);
                                    }else{
                                    	horizon.notice.error(horizon.lang['todo-common']['deleteSelectInstance']);
                                    }
                                }else{
                                    $dialog.dialog({
                                        closeText:horizon.lang.base['close'],
                                        title:horizon.lang.message['title'],
                                        dialogText:horizon.lang['todo-common']['deleteConfirmInstance'],
                                        dialogTextType:'alert-danger',
                                        buttons:[
                                            {
                                                html: horizon.lang.base['ok'],
                                                "class" : "btn btn-primary btn-xs",
                                                click: function() {
                                                    table.mytable.showProcessing();
                                                    operate.deleteWork(ids.join(';'));
                                                    $( this ).dialog( "close" );
                                                }
                                            }
                                        ]
                                    });
                                }
                            }
                        }
                    ],
                    pluginSettings: {
                        "order":[[2,'desc']]
                    }
                },
                ajaxDataSource: horizon.tools.formatUrl('/workcenter/undo/list')
            });
        }
    };
    var operate = {
        deleteWork:function(workIds) {
            $.ajax({
                url: horizon.tools.formatUrl('/monitor/instance/delete'),
                data: {workid: workIds},
                cache: false,
                dataType:'json',
                error: function(){
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang.message['operateError']);
                },
                success: function(data) {
                    table.mytable.hideProcessing();
                    if(data.restype == 'success') {
                    	horizon.notice.success(horizon.lang.message['deleteSuccess']);
                        table.mytable.reload();
                    }else{
                    	horizon.notice.error(horizon.lang.message['deleteFail']);
                    }
                }
            });
        },
        editFlow: function() {
            var workid = arguments[2].id;
            var trackid = arguments[2].trackId;
            var url = horizon.paths.flowpath + '?workId=' + workid + '&trackId=' + trackid;
            horizon.open({url:url});
        }
    };

    return horizon.engine['undolist'] = {
        initTable: table.init
    };

}));