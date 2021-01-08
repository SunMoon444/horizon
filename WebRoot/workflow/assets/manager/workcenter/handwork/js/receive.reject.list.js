/**
 * 对方拒收工作
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
                            multipleSearchable : true
                        },
                        {
                            name : 'flowName',
                            title : horizon.lang['handwork-common']['columnsFlowName'],
                            width : '200px',
                            searchable : true,
                            multipleSearchable : true
                        },
                        {
                            name : 'newName',
                            title : horizon.lang['handwork-common']['columnsNewName'],
                            width : '200px',
                            columnClass:'center'
                        }
                    ]
                },
                ajaxDataSource: horizon.tools.formatUrl('/workcenter/handwork/rreject/list')
            });
        }
    };

    return horizon.engine['rrjectlst'] = {
        initTable: table.init
    };
}));