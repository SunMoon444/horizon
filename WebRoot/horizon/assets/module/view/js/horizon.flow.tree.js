/**
 * Created by pingyx on 2015-3-30.
 */
define(horizon.view.requireModule, function($) {
    var _height = {
        outerHeight: function() {
            var _height = $(window).height()- parseInt($('.page-content').css('paddingTop')) * 2-2;
            var $body = $('body');
            if($body.attr('data-layout') != 'left' && $body.attr('data-layout') != 'left-hoversubmenu') {
                _height -= ($('#sidebar').css('visibility') != 'hidden'?$('#sidebar').outerHeight(true):0);
            }
            if(!$body.hasClass('embed')) {
                _height -= $('#navbar').outerHeight(true);
            }
            return _height;
        },
        treeHeight: function() {
            var outerHeight = this.outerHeight();
            var $container = $('.flowtree-widget-box');
            var borderTop = $container.css('borderTopWidth')=='medium'?0:parseInt($container.css('borderTopWidth'));
            var paddingTop = $container.find('.modal-body').css('paddingTop')=='medium'?0:parseInt($container.find('.modal-body').css('paddingTop'));
            return outerHeight - borderTop*2 - paddingTop*2
                - $container.find('.widget-header').outerHeight(true);
        }
    };
    var flowtree = {
        flowId:'',
        group: '',
        init: function() {
            //初始化流程树
            $('#flow-tree').flowtree({
                defaultNode: [
                    {
                        id: 'allWorkList',
                        type: 'item',
                        text: horizon.lang.base['allflow'],
                        additionalParameters: {
                            'item-selected': true
                        }
                    }
                ],
                defaultNodePosition: 'top',
                selected: flowtree.selected,
                deselected: flowtree.deselected,
                opened: flowtree.selGroup,
                closed: flowtree.selGroup
            });
            $(document).on('reload.ace.widget', '#flowtree-widget-box', function (ev) {
                var $box = $(this);
                $('#flow-tree').flowtree('reload');
                setTimeout(function() {
                    $box.trigger('reloaded.ace.widget');
                }, parseInt(Math.random() * 1000));
            });
            var $container = $('#flow-tree').closest('.modal-body');
            if(horizon.vars.touch) {
                $container.css('minHeight', _height.treeHeight());
            }else {
                $(window)
                    .off('resize.flowtree-widget-box')
                    .on('resize.flowtree-widget-box', function() {
                        var iHeight = _height.treeHeight();
                        $container.height(iHeight).css('overflowY', 'auto');
                        if($.fn.ace_scroll) {
                            if(!$container.data('ace_scroll')) {
                                $container.ace_scroll({
                                    size: iHeight
                                }).css('overflowY', 'hidden');
                            }else {
                                $container.ace_scroll('update', {size: iHeight})
                                    .ace_scroll('enable').ace_scroll('reset');
                            }
                        }
                    }).trigger('resize.flowtree-widget-box');
            }
        },
        selected: function() {
            flowtree.flowId=arguments[1].target.flowId;
            flowtree.group='';
            horizon.view.flowGroup='';
            if(arguments[1].target.id == 'allWorkList') {//查询所有流程
                horizon.view.flowId='';
            }else{
                horizon.view.flowId=flowtree.flowId;
            }
            horizon.view.dataTable.fnDraw(false);
        },
        deselected: function() {
            $(arguments[1].el).addClass('tree-selected');
        },
        selGroup: function() {
            var $container = $('#flow-tree').closest('.modal-body');
            $container.ace_scroll('reset');
            $(arguments[0].target).find('.tree-item.tree-selected').removeClass('tree-selected');
            flowtree.group = arguments[1].group;
            flowtree.flowId = '';
            horizon.view.flowId='';
            horizon.view.flowGroup=flowtree.group;
            horizon.view.dataTable.fnDraw(false);
        }
    };


    jQuery(function($){
        flowtree.init();
    });
});
