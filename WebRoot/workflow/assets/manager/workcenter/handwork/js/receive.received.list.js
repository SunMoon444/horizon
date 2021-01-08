/**
 * 已接收工作
 * @author yaodd
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonTable'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var table = {
        //初始化视图数据
        init: function() {
            table.mytable = $('#myDatatable').horizonTable({
                settings: {
                    title: horizon.lang.base['infoList'],
                    multipleSearchable : true,
                    height: function() {
                        var _height = horizon.tools.getPageContentHeight(),
                            $pageHeader = $('.page-header');
                        if($pageHeader.css('display') != 'none') {
                            _height -= $pageHeader.outerHeight(true);
                        }
                        return _height;
                    },
                    checkbox:-1,
                    columns: [
                        {
                            dataProp : 'id',
                            visible: false
                        },
                        {
                            name : 'title',
                            title : horizon.lang['handwork-common']['columnsTitle'],
                            width : '200px',
                            searchable : true,
                            multipleSearchable : true,
                            fnClick:table.openToDoInfo
                        },
                        {
                            name : 'flowName',
                            title : horizon.lang['handwork-common']['columnsFlowName'],
                            width : '200px',
                            searchable : true,
                            multipleSearchable : true
                        },
                        {
                            name : 'doTime',
                            title : horizon.lang['handwork-common']['columnsDoTime'],
                            width : '200px',
                            columnClass: 'center'
                        }
                    ],
                    pluginSettings: {
                        "order":[[3,'desc']]
                    }
                },
                ajaxDataSource: horizon.tools.formatUrl('/workcenter/handwork/rreceived/list')
            });
        },
        //打开流程代办
        openToDoInfo: function() {
            var workid = arguments[2].id;
            var trackid = arguments[2].trackId;
            var url = horizon.paths.flowpath + '?workId=' + workid + '&trackId=' + trackid;
            horizon.open({url:url});
        }
    };
    return horizon.engine['hadreceivedlist'] = {
        initTable: table.init
    };
}));