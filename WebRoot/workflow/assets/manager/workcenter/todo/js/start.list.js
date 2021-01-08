/**
 * 启动新工作
 * @author yaodd
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonTable', 'horizonFlowchart'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var table = {
        init:function() {
            table.mytable = $('#myDatatable').horizonTable({
                settings: {
                    title: horizon.lang['start-list']['tableTitle'],
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
                            dataProp : 'id',
                            visible : false
                        },
                        {
                            name : 'flowName',
                            title : horizon.lang['start-list']['columnsFlowName'],
                            searchable : true
                        },
                        {
                            name : 'flowId',
                            title : horizon.lang['start-list']['columnsOperate'],
                            width : '150px',
                            orderable : false,
                            columnClass :'center'
                        }
                    ],
                    fnCreateCell: function(nTd, nTdData, rowData, iRow, i){
                        var _html = '';
                        var isShowUseType = 'white-grey'; //是否显示外部启动
                        if( i==2 ) {
                            var useTypeUl = '';
                            if(rowData.useType !=null && rowData.useType.length > 0) {
                                isShowUseType = 'blue';
                                useTypeUl = '<ul class="dropdown-usetype dropdown-menu dropdown-only-icon dropdown-yellow dropdown-caret dropdown-close dropdown-menu-right" ';
                                useTypeUl += 'style="max-height: 143px;overflow-y: auto;overflow-x: hidden;min-width: 110px;">';
                                $.each(rowData.useType, function(i,type) {
                                    var li = '<li><a href="javascript:void(0)">' + type + '</a></li>';
                                    useTypeUl += li;
                                });
                                useTypeUl+= '</ul>';
                            }
                            //生成版本ul
                            var versionUl = '';
                            if(rowData.version != "1" && rowData.versionFlows.length > 0) {
                            	versionUl = '<ul class="dropdown-menu dropdown-only-icon dropdown-yellow dropdown-caret dropdown-close dropdown-menu-right" ';
                                if(rowData.versionFlows.length > 6) {
                                    versionUl += 'style="max-height: 143px;overflow-y: auto;min-width: 100px;">';
                                }else{
                                    versionUl += '>';
                                }
                                $.each(rowData.versionFlows, function(i,flow) {
                                    if(flow.active == '1') {
                                        var li = '<li><a href="javascript:void(0)" flow-id = ' + flow.id + '>'+horizon.lang['start-list']['columnsVersion']+'-' + flow.version+ '</a></li>';
                                        versionUl += li;
                                    }
                                });
                                versionUl+= '</ul>';
                            }
                            _html = '<div class="action-buttons">' +
                                '<div class="operate-icon action-icon position-relative dropdown-hover" data-action="startflow" title="'+horizon.lang['start-list']['startFlow']+'">' +
                                '<a href="javascript:void(0)" class="green pointer" data-toggle="dropdown" flow-id="' + nTdData + '">' +
                                '<i class="ace-icon fa fa-toggle-right bigger-150"></i>' +
                                '</a>' +
                                versionUl +
                                '</div>' +
                                '<div class="operate-icon action-icon position-relative dropdown-hover" data-action="startOutFlow" title="'+horizon.lang['start-list']['startOutFlow']+'">' +
                                '<a href="javascript:void(0)" class="' + isShowUseType + ' pointer" data-toggle="dropdown">' +
                                '<i class="ace-icon fa fa-play-circle-o bigger-150"></i>' +
                                '</a>' +
                                useTypeUl +
                                '</div>' +
                                '<div class="operate-icon action-icon position-relative dropdown-hover" data-action="openFlowMap" title="'+horizon.lang['start-list']['openFlowMap']+'">' +
                                '<a href="javascript:void(0)" class="orange pointer" data-toggle="dropdown" flow-id="' + nTdData + '">' +
                                '<i class="ace-icon fa fa-photo bigger-150"></i>' +
                                '</a>' +
                                versionUl +
                                '</div>' +
                                '</div>';
                        }
                        if(_html != '') {
                            var $ntd = $(nTd);
                            $ntd.html(_html);
                            if(i == 2) {
                                $ntd.css('overflow', 'visible');
                                //启动
                                $ntd.find('[data-action="startflow"]').find('a').on(horizon.tools.clickEvent(), function() {
                                    var $this = $(this);
                                    var url = horizon.paths.flowpath + '?flowId=' + $this.attr('flow-id');
                                    horizon.open({url:url});
                                });
                                //流程图
                                $ntd.find('[data-action="openFlowMap"]').find('a').on(horizon.tools.clickEvent(), function() {
                                    var $this = $(this);
                                    var flowId = $this.attr('flow-id');
                                    var $container = $('#flowchart-' + flowId);
                                    var showFlowchart = function() {
                                        $container.dialog({
                                            title: rowData['flowName'],
                                            width: '100%',
                                            minHeight: $(window).height(),
                                            maxWidth: $(window).width(),
                                            maxHeight: $(window).height(),
                                            closeText: horizon.lang.base['close']
                                        });
                                    };
                                    if($container.length) {
                                        showFlowchart();
                                    }else {
                                        $container = $('<div id="flowchart-' + flowId + '"></div>');
                                        $('.page-header').after($container);
                                        $container.horizonFlowChart($.extend(true, {
                                            url: horizon.tools.formatUrl('/flowchart/data'),
                                            downloadUrl: horizon.tools.formatUrl('/flowchart/download'),
                                            dataParam: {
                                                flowId: flowId
                                            },
                                            iconType: 'font-awesome',
                                            tools: {
                                                exportImg: true
                                            },
                                            fnAfterSuccess: function() {
                                                showFlowchart();
                                            }
                                        }, horizon.tools.getFlowchartOption()));
                                    }
                                });
                                //外部启动
                                $ntd.find('[data-action="startOutFlow"]').find('li').children('a').on(horizon.tools.clickEvent(), function() {
                                    var $this = $(this);
                                    var url = horizon.paths.flowpath  + '?flowId=' + rowData.flowId + '&outerConfig=' + $this.html();
                                    horizon.open({url:url});
                                });
                            }
                        }
                    }
                },
                ajaxDataSource: horizon.tools.formatUrl('/manager/flow/page'),
                ajaxDataParam: {
                    active: '1'
                }
            });
            setTimeout(function() {
                $('#myDatatable_wrapper').find('.scroll-content').css('height','inherit');
                $('[data-rel=tooltip]').tooltip();
            },100);
        }
    };
    return horizon.engine['startlist'] = {
        initTable: table.init
    };
}));