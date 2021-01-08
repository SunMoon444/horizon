(function(root, undefined) {

    /**@description 加载外部引用的JS*/
    horizon.tools.extend(horizon.vars.requirePaths, horizon.js.requirePaths);
    horizon.tools.extend(horizon.vars.requireShim, horizon.js.requireShim);
    var requireModule = [
        'jquery',
        'jqueryUi',
        'gritter',
        'bootstrap',
        'elementsAside',
        'elementsScroller',
        'horizonFlowchart',
        'horizonNote',
        'horizonSelectuser',
        'horizonForm',
        'ace'
    ];
    for(var module in horizon.js.requirePaths) {
        requireModule.push(module);
    }

    require.config({
        baseUrl: horizon.paths.pluginpath,
        paths: horizon.vars.requirePaths,
        shim: horizon.vars.requireShim
    });
    require(requireModule, function($) {
    	
        /**@description 加载外部引用的CSS*/
        if(horizon.css && horizon.css.length) {
            $.each(horizon.css, function(i, _css) {
                if(!(/\.css$/.test(_css))) {
                    _css += '.css';
                }
                if(!(/^(http[s]?|ftp):\/\//.test(_css)) && !(/^\//.test(_css))){
                    _css = horizon.paths.apppath + '/' + _css;
                }
                horizon.tools.use(_css);
            });
        }

        var clickEvent = horizon.tools.clickEvent(),
            $focus = $('#focus');

        $focus.on(clickEvent, function() {
            $('<div style="display:none"></div>').dialog().dialog('close');
        });

        var workflow = {
            initFlowTrackTab: function() {
                var $flowTrack = $('#FlowTrack');
                if($flowTrack.length) {
                    var $flowTrackTab = $('a[href="#FlowTrack"]');
                    $flowTrackTab.on(clickEvent, function() {
                        if(!$flowTrack.hasClass('empty')) return ;
                        $flowTrack.removeClass('empty');
                        //初始化流程图
                        workflow.showFlowchart();
                    });
                    var $activeTab = $('#myTab > .active');
                    if(!$activeTab.length || $flowTrackTab.parent().hasClass('active')) {
                        $flowTrackTab.trigger(clickEvent);
                    }
                }
            },
            initOperate: function() {
                $('.flow-buttons a[data-toggle!="dropdown"]').on(clickEvent, function() {
                    var $this = $(this);
                    if(!$this.attr('data-operate')) return;
                    workflow['action']['actionData'] = {
                        operate: $this.attr('data-operate'),
                        operateClazz: $this.attr('data-clazz'),
                        operateText: $this.attr('data-text'),
                        operateFlag: 1,
                        reOpen: workflow.action.reopen
                    };
                    workflow.action.actionDo();
                });
            },
            resizeFlowNav: function() {
                var $nav = $('.flow-buttons').children('.nav');
                var $li = $nav.children('li:not(.more)');
                if($li.length <= 1) return ;//只有关闭按钮
                $nav.children('li').removeClass('hidden');
                var $moreLi = $nav.children('li.more');
                $moreLi.removeClass('open').children('a').attr('aria-expanded', 'false');
                var navWidth = $nav.innerWidth();
                var moreLiWidth = $moreLi.outerWidth(true);
                var liWidth = 0;
                $moreLi.addClass('hidden');
                for(var i = 0, iLen = $li.length; i < iLen; i++) {
                    var $this = $($li[i]);
                    liWidth += $this.outerWidth(true);
                    if(liWidth > navWidth) {
                        liWidth -= $this.outerWidth(true);
                        $nav.children('li:gt(' + i +')').addClass('hidden');
                        $moreLi.find('ul > li:gt(' + i +')').removeClass('hidden');
                        $this.addClass('hidden');
                        $moreLi.find('ul > li:eq(' + i +')').removeClass('hidden');
                        for(var k = i - 1; k >= 0; k--) {
                            if(navWidth - liWidth >= moreLiWidth) {
                                break;
                            }else {
                                liWidth -= $($li[k]).outerWidth(true);
                                $($li[k]).addClass('hidden');
                                $moreLi.find('ul > li:eq(' + k +')').removeClass('hidden');
                            }
                        }
                        $moreLi.removeClass('hidden');
                        break;
                    }else {
                        $moreLi.find('ul > li:eq(' + i + ')').addClass('hidden');
                    }
                }
            },
            resizeTabContent: function() {
                if(horizon.vars.ios || horizon.vars.android) return;
                var $flowButtons = $('.flow-buttons'),
                    $flowBody = $('.flow-body'),
                    $tabNav = $('#myTab'),
                    $tabContent = $('.flow-body .base-form > .tab-content'),
                    iHeight = $(window).height();
                if($flowButtons.css('position') != 'fixed') {
                    iHeight -= parseInt($flowButtons.height());
                }
                iHeight -= parseInt($flowBody.css('paddingTop'));
                iHeight -= parseInt($flowBody.css('paddingBottom'));
                iHeight -= parseInt($tabNav.height());
                iHeight -= parseInt($tabContent.css('paddingBottom'));
                $tabContent.height(iHeight);
            },
            showFlowchart: function(callback) {
                var _this = this,
                    $container = $('.flowchart-container');
                if($container.data('flowchart-content-option')) return;
                $container.horizonFlowChart($.extend(true, {
                    url: horizon.tools.formatUrl('/flowchart/data'),
                    downloadUrl: horizon.tools.formatUrl('/flowchart/download'),
                    dataParam: {
                        workId: $('input[name="workId"]').val(),
                        nodeId: $('input[name="nodeId"]').val()
                    },
                    iconType: 'font-awesome',
                    tools: {
                        status: true,
                        exportImg: true,
                        dynamicDemo: true
                    },
                    fnNodeClick: function(node, historys) {
                        if(!historys) {
                            $('<div></div>').dialog({
                                title: horizon.lang.workflow['prompt'],
                                dialogText: horizon.lang.workflow['noRecordForNode'],
                                dialogTextType: 'alert-info',
                                closeText: horizon.lang.workflow['close']
                            });
                            return;
                        }
                        var nodeId = node['ID'];
                        var $history = $('#' + nodeId + '-history');
                        var showHistory = function() {
                            $history.dialog({
                                title: node['Name'],
                                width: $(window).width() > 500 ? 500 : $(window).width(),
                                maxWidth: $(window).width(),
                                maxHeight: $(window).height(),
                                closeText: horizon.lang.workflow['close']
                            });
                        };
                        if($history.length) {
                            showHistory();
                        }else {
                            $history = $('<div id="' + nodeId + '-history"></div>');
                            $container.append($history);
                            var option = {
                                local_data: historys,
                                fnAfterSuccess: function() {
                                    showHistory();
                                }
                            };
                            $history.horizonNote($.extend(true, option, _this.noteOption));
                        }
                    },
                    fnFreeNodeClick: function(position) {
                        _this.action.setFreeNodePosition(position);
                    },
                    fnAfterSuccess: function(data) {
                        _this.operationNote(_this.formatHistory(data['Historys']));
                        if(callback) callback();
                    }
                }, horizon.tools.getFlowchartOption()));
            },
            formatHistory: function(historys) {
                if(historys && historys.length) {
                    $.each(historys, function(i, history) {
                        if(history['action'].toLowerCase() === 'subflow') {
                            var memo = history['memo'],
                                subflows = memo.match(/\[[^\]]+\]/g);
                            for(var k = 0, iLen = subflows.length; k < iLen; k+=2) {
                                var _flowName = subflows[k].replace(/\[/g, '').replace(/\]/g, ''),
                                    _workId = subflows[k+1].replace(/\[/g, '').replace(/\]/g, ''),
                                    _url = horizon.paths.flowpath;
                                _url += '?workId=' + _workId;
                                var flowNameLink = ['<a tabindex="-1" target="_blank" href="', _url, '">', _flowName, '</a>'].join('');
                                var index = memo.indexOf(subflows[k]);
                                memo = memo.substring(0, index+1) + flowNameLink + memo.substring(index-1 + subflows[k].length);
                            }
                            memo = memo.replace(/实例ID\[[^\]]+\]/g, '');
                            history['memo'] = memo;
                        }
                    });
                }
                return historys;
            },
            setNoteLang: function() {
                var contentDom = horizon.lang.workflow['contentDom'];
                if(contentDom) {
                    var contentTls = {
                        '_USERNAME_': '<span class="purple bolder"> [username] </span>',
                        '_NODENAME_': '<span class="bolder blue"> [nodename] </span>',
                        '_ACTIONNAME_': '<span class="green bolder"> [actionname] </span>',
                        '_MEMO_': '[memo]',
                        '_COMMENTS-ICON_': '<i class="ace-icon fa fa-pencil-square-o grey bigger-125"></i>',
                        '_COMMENTS_': '[comments]'
                    };
                    $.each(contentTls, function(key, value) {
                        contentDom = contentDom.replace(key, value);
                    });
                }
                workflow.noteOption.lang = {
                    empty_text: horizon.lang.workflow['noRecord'],
                    header_text: horizon.lang.workflow['historyTableHead']
                };
                workflow.noteOption['timeline_content_dom'] = contentDom;
            },
            noteOption: {
                columns: [
                    {
                        column_name: 'username',
                        head_icon: 'fa fa-user hidden-480',
                        column_class: 'nowrap',
                        head_class: 'nowrap'
                    },
                    {
                        column_name: 'actionname',
                        head_icon: 'glyphicon glyphicon-share hidden-480',
                        column_class: 'nowrap',
                        head_class: 'nowrap'
                    },
                    {
                        column_name: 'nodename',
                        head_icon: 'fa fa-circle-o hidden-480',
                        column_class: 'nowrap',
                        head_class: 'nowrap'
                    },
                    {
                        column_name: 'actiontime',
                        head_icon: 'fa fa-clock-o hidden-480',
                        column_class: 'nowrap',
                        head_class: 'nowrap'
                    },
                    {
                        column_name: 'dotime',
                        column_class: 'hidden-480 nowrap',
                        head_icon: 'fa fa-clock-o hidden-480',
                        head_class: 'hidden-480 nowrap'
                    },
                    {
                        column_name: 'memo',
                        column_class: 'hidden-480',// for table
                        head_icon: 'fa fa-pencil-square-o hidden-480',
                        head_class: 'hidden-480'// for tabl
                    },
                    {
                        column_name: 'comments',
                        column_class: 'hidden-480',// for table
                        head_icon: 'fa fa-pencil-square-o hidden-480',// for table
                        head_class: 'hidden-480'// for table
                    }
                ],
                timeline_content_dom: '',
                group_column: 'actiontime',
                group_type: 'datetime'
            },
            operationNote: function(notes) {
                var $noteContainer = $('.note-container');
                if(!$noteContainer.length) return;
                var option;
                if(notes) {
                    option = {
                        time: 'fast',
                        local_data: notes
                    };
                }else {
                    option = {
                        time: 'fast',
                        url: horizon.tools.formatUrl('/support/history'),
                        data: {
                            workId: $('input[name="workId"]').val()
                        }
                    }
                }
                $noteContainer.horizonNote($.extend(true, option, this.noteOption));
                $noteContainer.closest('.widget-box')
                    .find('.widget-menu > .dropdown-menu a').on(clickEvent, function() {
                        var $this = $(this);
                        var action = $this.attr('data-action');
                        $noteContainer.horizonNote(action);
                        $this.parent().addClass('active').siblings('li').removeClass('active');
                        var $icon = $this.closest('.widget-header').find('.widget-title > .ace-icon');
                        $icon[0].className = $this.children('.ace-icon')[0].className;
                    });
            },
            initFixedModal: function() {
                var $fixedModal = $('#fixed-modal'),
                    $icon = $fixedModal.children('i'),
                    fixedIcon = $icon.attr('data-fixed-icon'),
                    unFixedIcon = $icon.attr('data-unfixed-icon'),
                    $modal = $fixedModal.closest('.modal'),
                    $asideTrigger = $modal.find('.aside-trigger'),
                    $flowBody = $('.flow-body');

                $fixedModal.on(clickEvent, function() {
                    var $modalBackdrop = $modal.children('.modal-backdrop');
                    if($modal.attr('data-fixed') == 'false') {
                        $modal.css({
                            width: '260px',
                            top: '45px'
                        }).attr('data-fixed', 'true');
                        $icon.removeClass(unFixedIcon).addClass(fixedIcon);
                        $modalBackdrop.addClass('hidden');
                        $asideTrigger.addClass('hidden');
                        $flowBody.animate({
                            paddingRight: '260px'
                        }, 'fast', function() {
                            $focus.trigger(clickEvent);
                        });
                    }else {
                        $modal.css({
                            width: 'inherit',
                            top: '0px'
                        }).attr('data-fixed', 'false');
                        $icon.removeClass(fixedIcon).addClass(unFixedIcon);
                        $asideTrigger.trigger(clickEvent).removeClass('hidden');
                        $flowBody.animate({
                            paddingRight: '12px'
                        }, 'fast');
                    }
                });
                if($modal.attr('data-fixed') == 'true') {
                    $modal.attr('data-fixed', 'false');
                    $asideTrigger.trigger(clickEvent);
                    $fixedModal.trigger(clickEvent);
                }
                if(horizon.vars.ie) {
                    $modal.on('shown.bs.modal', function() {
                        var $sysword = $('#idSysword');
                        if($sysword.length && $sysword.closest('.tab-pane').hasClass('active')) {
                            $fixedModal.trigger(clickEvent);
                        }
                    });
                }
            },
            reloadParent: function() {
                try{
                    var $parent = window.parent;
                    if($parent && $parent.opener) {
                        $parent =  $parent.opener;
                    }
                    var $dataTable = $parent.jQuery('.dataTable');
                    if($dataTable && $dataTable.length) {
                        $parent.jQuery('.dataTable').each(function(i) {
                            if($parent.jQuery('.dataTable:eq(' + i + ')').data('horizonTable')) {
                                $parent.jQuery('.dataTable:eq(' + i + ')').data('horizonTable').reload();
                            }
                        });
                    }
                }catch(e) {}
                workflow['reloadParent'] = null;
            },
            closeFlow: function() {
                try{
                    horizon.closeModalObj = (arguments && arguments.length ? arguments[0] : null);
                    if(!horizon.closeModalObj) {
                        workflow.action.closeByButton = false;
                    }
                    workflow.action.actionDo({
                        operate: 'close',
                        reOpen: workflow.action.reopen
                    });
                }catch(e) {}
                workflow['closeFlow'] = null;
            },
            unload: function() {
                if(workflow.reloadParent) {
                    workflow.reloadParent.apply(this, arguments);
                }
                if(workflow.closeFlow) {
                    workflow.closeFlow.apply(this, arguments);
                }
                horizon['closeCallback'] = null;
            },
            action: {
                async: true,
                reopen: false,
                closeByButton: true,
                preSubmit: false,
                container: null,
                subNodeGroup: {},
                actionData: {},
                cancel: function() {
                    this.async = true;
                    this.reopen = false;
                    this.closeByButton = true;
                    this.preSubmit = false;
                    this.container = null;
                    this.subNodeGroup = {};
                    this.actionData = {};
                    var $sysword = $('#idSysword');
                    if($sysword.length && horizon.vars.ie) {
                        try{
                            $sysword.show();//显示正文
                        }catch(e) {}
                    }
                },
                isValidateAction: function(action) {
                    var $unValidate = $('input[name="unValidate"]');
                    if(!($unValidate && $unValidate.length)) {
                        return false;
                    }
                    return ($.inArray(action, $unValidate.val().split(";")) == -1);
                },
                getDefFreeNodeOpt: function() {
                    return {
                        nodeName: '',
                        axisX: '',
                        axisTypeX: 'absolute-x',
                        axisY: '',
                        axisTypeY: 'absolute-y',
                        authors: {
                            Author: {
                                authorId: 'Author',
                                isDefUser: 'false',
                                isFree: 'true',
                                isSelect: 'true',
                                isUser: 'false',
                                selectType: 'checkbox'
                            },
                            SecondAuthor: {
                                authorId: 'SecondAuthor',
                                isDefUser: 'false',
                                isFree: 'true',
                                isSelect: 'true',
                                isUser: 'false',
                                selectType: 'checkbox'
                            },
                            Reader: {
                                authorId: 'Reader',
                                isDefUser: 'false',
                                isFree: 'true',
                                isSelect: 'true',
                                isUser: 'false',
                                selectType: 'checkbox'
                            }
                        },
                        timeLimit: '0',
                        timeLimitType: '0'
                    };
                },
                getSetupTls: function() {
                    var $modal = $('.templates .horizon-dialog-modal').clone(),
                        $modalDialog = $modal.find('.modal-dialog'),
                        $modalBody = $modalDialog.find('.modal-body');
                    var setMaxHeight = function() {
                        var maxHeight = parseInt($(window).height())
                            - parseInt($modalDialog.css('top')) - 115;
                        $modalBody.css('maxHeight', maxHeight);
                    };
                    $modal.on('resize.modal-dialog', function() {
                        $modalDialog.removeData('drag').removeAttr('style');
                        var winHeight = parseInt($(window).height()),
                            modalHeight = parseInt($modalDialog.height()),
                            maxTop = (winHeight - modalHeight) || 0;
                        if(parseInt($modalDialog.css('top')) > maxTop) {
                            $modalDialog.css('top', maxTop);
                        }
                        setMaxHeight();
                    }).on('hide.bs.modal', function(e) {
                        $(e.target).remove();
                        workflow.action.cancel();
                    }).on('show.bs.modal', function() {
                        $modal.data('bs.modal').options.backdrop = false;
                        var left;
                        $modalDialog.draggable({
                            handle: ' > .modal-content > .modal-header',
                            drag: function(event, ui) {
                                var winWidth = parseInt($(window).width()),
                                    winHeight = parseInt($(window).height()),
                                    modalWidth = parseInt($modalDialog.width()),
                                    modalHeight = parseInt($modalDialog.height()),
                                    maxLeft = winWidth - modalWidth,
                                    maxTop = winHeight - modalHeight;
                                ui.position.left += left;
                                if(ui.position.left < 0) {
                                    ui.position.left = 0;
                                }else if(ui.position.left > maxLeft) {
                                    ui.position.left = maxLeft;
                                }
                                if(ui.position.top <= 0) {
                                    ui.position.top = 0;
                                }else if(ui.position.top > maxTop) {
                                    ui.position.top = maxTop;
                                }
                            },
                            start: function() {
                                if(!$modalDialog.data('drag')) {
                                    left = $modalDialog[0].offsetLeft;
                                    $modalDialog.css('margin', 0);
                                    $modalDialog.data('drag', true);
                                }
                            },
                            stop: function() {
                                left = 0;
                                setMaxHeight();
                            }
                        });
                        setMaxHeight();
                    }).on('shown.bs.modal', function() {
                        $modalDialog.find('.modal-footer button[data-action="submit"]').focus();
                    });
                    return $modal.appendTo('body');
                },
                setSubNodes: function(actionData, nodes) {
                    var action = this,
                        hasSubSelect = false;
                    $.each(nodes, function(i, node) {
                        if(node['isSelect'] == 'true') {
                            if(action.subNodeGroup[node['selectId']]) {
                                if(!action.setSubNodes(actionData, nodes)) {
                                    actionData['nextNodes'].push(node);
                                    hasSubSelect = true;
                                }
                            }else {
                                actionData['nextNodes'].push(node);
                                hasSubSelect = true;
                            }
                        }
                    });
                    return hasSubSelect;
                },
                setNextNodes: function(actionData) {
                    var action = this;
                    if(actionData['nextNodes']) {
                        var spliceArr = [];
                        $.each(actionData['nextNodes'], function(i, node) {
                            var selectId = node['selectId'];
                            if(node['isSelect'] == 'true' && action.subNodeGroup[selectId]) {
                                var hasSubSelect = action.setSubNodes(actionData, action.subNodeGroup[selectId]);
                                if(hasSubSelect) {
                                    spliceArr.push(i);
                                }
                            }
                        });
                        if(spliceArr.length) {
                            $.each(spliceArr, function(i, index) {
                                actionData['nextNodes'].splice(index - i, 1);
                            });
                        }
                    }
                },
                setFreeNodePosition: function(position) {
                    this.container
                        .find('input[name="axisX"]').val(position.x).trigger('blur').end()
                        .find('input[name="axisY"]').val(position.y).trigger('blur').end()
                        .find('[data-code="absolute-x"],[data-code="absolute-y"]').trigger(clickEvent);
                    $('.flowchart-container').dialog('close');
                },
                handleData: function(data) {
                    var action = this;
                    if(data['operateStatus'] == 'error') {
                        if(action.container.hasClass('empty')) {
                            action.container.removeClass('empty').html('');
                        }
                        action.container.append('<span class="red">' + data['operateMsg'] + '</span>');
                        return;
                    }
                    var $panel = action.container.closest('.panel'),
                        node = $panel.data('setup'),
                        curNode,
                        curNodeGroup = [];
                    $.each(data['nextNodes'], function(i, _node) {
                        if(_node['selectId'] == node['selectId']) {
                            $.extend(node, _node);
                            curNode = _node;
                            return false;
                        }else {
                            if(_node['nodeGroup'] == node['nodeId']) {
                                curNodeGroup.push(_node);
                            }else {
                                var selectIdArray = _node['selectId'].split(';');
                                if(selectIdArray.length == 1) return;
                                if(selectIdArray[selectIdArray.length - 2] == node['selectId']) {
                                    curNodeGroup.push(_node);
                                }
                            }
                        }
                    });
                    if(curNode) {
                        action.transactorSetup(curNode, action.container);
                    }else if(curNodeGroup.length) {
                        action.subNodeGroup[node['selectId']] = curNodeGroup;
                        $.each(curNodeGroup, function(i, _node) {
                            action.nodeSetup(_node, action.container);
                        });
                    }
                },
                actionDo: function() {
                    if(arguments && arguments.length) {
                        $.extend(this.actionData, arguments[0]);
                    }
                    if(this.actionData.operate.toLowerCase() !== 'close') {
                        if(typeof horizon.impl_beforeAction === 'function') {
                            if(!horizon.impl_beforeAction(this.actionData.operate)) return ;
                        }
                    }
                    if('submit' in horizon.form && this.isValidateAction(this.actionData.operate)) {
                        horizon['form']['submitForm'] = this.submitForm;
                        horizon.form.submit();
                    }else {
                        horizon['form']['submitForm'] = null;
                        horizon['form']['baseForm'].find('input[data-type="radio-read"]').attr("disabled", false);
                        horizon['form']['baseForm'].find('input[data-type="select-read"]').attr("disabled", false);
                        this.submitForm();
                    }
                },
                submitForm: function() {
                    //处理正文
                    var $idSysword = $('#idSysword');
                    if($idSysword.length && horizon.vars.ie) {
                        try{
                            //保存正文
                            idSysword.onsub();
                            //隐藏正文避免遮挡弹出框
                            $idSysword.hide();
                        }catch(e) {}
                    }
                    var action = workflow.action,
                        actionData = action.actionData;
                    if(actionData['operate'].toLowerCase() == 'freesubmit' && !actionData['freeNode']) {
                        actionData['operateMsg'] = horizon.lang.workflow['freeNodeSetup'];
                        actionData['freeNode'] = action.getDefFreeNodeOpt();
                        action.other();
                        return;
                    }
                    if(!action.preSubmit) {
                        horizon.notice.loading(horizon.lang.workflow['operating']);
                    }else {
                        actionData = $.extend(true, {}, actionData);
                    }
                    action.setNextNodes(actionData);
                    var data = $('.base-form').serializeArray();
                    data.push({name: 'actionData', value: JSON.stringify(actionData)});
                    data.push({name: 'comment', value: $('textarea[name="comment"]').val()});
                    var dataId = $('input[name="dataId"]').val();
                    if(dataId) {
                        data.push({name: 'dataId', value: dataId});
                    }
                    if(horizon.form.history && horizon.form.history.enable) {
                        data.push({name: 'HISTORY', value: horizon.form.history.getData()});
                    }
                    $.ajax({
                        url: horizon.tools.formatUrl('/support/action'),
                        type: 'post',
                        dataType: 'json',
                        data: data,
                        async: action.async,
                        error: function() {
                            action.error();
                        },
                        success: function(data) {
                            if(action['preSubmit']) {
                                action.handleData(data);
                                return;
                            }
                            action['actionData'] = data;
                            if(action[data['operateStatus']]) {
                                action[data['operateStatus']]();
                            }else {
                                action.other();
                            }
                        }
                    });
                },
                success: function() {
                    var actionData = this.actionData;
                    if(actionData.operate.toLowerCase() === 'close') {
                        if(this.closeByButton) {
                            workflow['closeFlow'] = null;
                            horizon['closeCallback'] = null;
                            horizon.close();
                        }
                        return;
                    }
                    if(typeof horizon.impl_afterActionSuccess === 'function') {
                        horizon.impl_afterActionSuccess(actionData);
                    }
                    var _callback = function() {
                        if(actionData.reOpen === 'true') {
                            workflow.action.reopen = true;
                            var _url = horizon.paths.flowpath;
                            _url += '?workId=' + actionData.workId;
                            if(actionData['trackId']) {
                                _url += '&trackId=' + actionData['trackId'];
                            }
                            if( actionData['subjection']){
                                _url += '&subjection=' + actionData['subjection'];
                            }
                            var dataId = $('input[name="dataId"]').val();
                            if(dataId) {
                                _url += '&dataId=' + dataId;
                            }
                            location.href = _url;
                        }else {
                            horizon.close();
                        }
                    };
                    horizon.notice.closeAll(function() {
                        if(actionData.alert === 'true') {
                            $('<div></div>').dialog({
                                closeText: horizon.lang.workflow['close'],
                                title: horizon.lang.workflow['prompt'],
                                dialogText: actionData['operateMsg'],
                                dialogTextType: 'alert-info',
                                close: function() {
                                    _callback();
                                }
                            });
                        }else {
                            _callback();
                        }
                    });
                },
                error: function() {
                    var msg = this.actionData['operateMsg'] ? this.actionData['operateMsg'] : horizon.lang.workflow['error'];
                    horizon.notice.error({
                        title: horizon.lang.workflow['prompt'],
                        text: msg
                    });
                    this.cancel();
                },
                other: function() {
                    var action = this,
                        actionData = action.actionData,
                        $container = action.getSetupTls(),
                        $modalBody = $container.find('.modal-body');
                    $container.find('.modal-title-text').html(actionData['operateMsg'])
                        .end()
                        .find('button[data-action="submit"]').on(clickEvent, function() {
                            var passRequired = true;
                            $container.find('div[data-required="true"]').each(function() {
                                var $this = $(this),
                                    $parentPanel = $this.closest('.panel'),
                                    parentSetup = $parentPanel.data('setup');
                                if(( !parentSetup || (parentSetup && parentSetup['isSelect'] == 'true') )
                                    && !$this.find('.panel-collapse.in').length) {
                                    passRequired = false;
                                    if(!$this.find('.help-block').length) {
                                        var type = actionData['operateStatus'] == 'selectSubflow' ? 'selectSubFlow' : 'selectNode';
                                        $this.append($('.templates .help-block').clone().html(horizon.lang.workflow[type]));
                                    }
                                }
                            });
                            if(passRequired) {
                                action.preSubmit = false;
                                actionData['operateFlag'] = 0;
                                horizon['form']['baseForm'].find('input[data-type="radio-read"]').attr("disabled", false);
                                horizon['form']['baseForm'].find('input[data-type="select-read"]').attr("disabled", false);
                                action.submitForm();
                                $container.modal('hide');
                            }
                        });
                    $container.on('hide.bs.collapse show.bs.collapse', '.panel-collapse', function(ev) {
                        var $this = $(ev.target);
                        if(!$this.is($(this))) return ;
                        var $panelTrigger = $('a[data-target="#' + $this.attr('id') + '"]');
                        if(!$panelTrigger.length) return;
                        var $icon = $panelTrigger.find('.panel-title-icon'),
                            showIcon = $icon.attr('data-icon-show'),
                            hideIcon = $icon.attr('data-icon-hide'),
                            $panel = $panelTrigger.closest('.panel'),
                            setup = $panel.data('setup'),
                            checked = ev.type == 'show' ? 'true' : 'false';
                        $icon.toggleClass(hideIcon).toggleClass(showIcon);
                        setup['isSelect'] = checked;
                    });
                    $container.on('shown.bs.collapse', '.panel-collapse', function(ev) {
                        var $this = $(ev.target);
                        if(!$this.is($(this))) return ;
                        if($this.children('.panel-body').hasClass('empty')) {
                            action.preSubmit = true;
                            horizon['form']['baseForm'].find('input[data-type="radio-read"]').attr("disabled", false);
                            horizon['form']['baseForm'].find('input[data-type="select-read"]').attr("disabled", false);
                            action.container = $this.children('.panel-body');
                            action.submitForm();
                        }
                    });
                    if($.isArray(actionData['nextNodes']) && actionData['nextNodes'].length) {
                        $.each(actionData['nextNodes'], function(i, node) {
                            action.nodeSetup(node, $modalBody);
                        });
                        action.msgTypeSetup($container.find('.msg-type-container'));
                    }else if($.isArray(actionData['subFlows']) && actionData['subFlows'].length) {
                        $.each(actionData['subFlows'], function(i, subflow) {
                            if(actionData['operateStatus'] == 'showSubflow' && !subflow['subWorks']) return;
                            action.subflowSetup(subflow, $modalBody);
                        });
                    }else if(actionData['freeNode']) {
                        action.freeNodeSetup(actionData['freeNode'], $modalBody);
                        action.msgTypeSetup($container.find('.msg-type-container'));
                    }
                    horizon.notice.closeAll(function() {
                        $container.modal('show');
                    });
                },
                /*自由提交节点设置*/
                freeNodeSetup: function(node, $container) {
                    if($container.hasClass('empty')) {
                        $container.removeClass('empty').html('');
                    }

                    var $freeNode = $('.templates .free-node-box').clone();
                    $freeNode.data('setup', node);
                    $container.append($freeNode);
                    this.container = $freeNode;

                    $freeNode.find('input').on('blur', function() {
                        var $this = $(this),
                            setup = $this.closest('[data-setup="true"]').data('setup') || node;
                        setup[$this.attr('name')] = $this.val();
                    });

                    if($freeNode.attr('data-axis') == 'true') {
                        $freeNode.find('.dropdown-menu > li').on(clickEvent, function() {
                            var $this = $(this),
                                setup = $this.closest('[data-setup="true"]').data('setup') || node,
                                code = $this.attr('data-code');
                            setup[$this.parent().attr('data-for')] = code;
                            $this.addClass('active').siblings().removeClass('active');
                            $this.parent().prev().find('span').html($this.children('a').html());
                            var defName, defVal;
                            if($.inArray(code, ['relative-top', 'relative-bottom']) != -1) {
                                defName = 'axisY';
                                defVal = '100';
                            }else if($.inArray(code, ['relative-left', 'relative-right']) != -1) {
                                defName = 'axisX';
                                defVal = '150';
                            }
                            if(defName) {
                                $freeNode.find('input[name="' + defName + '"]').val(defVal);
                                setup[defName] = defVal;
                            }
                        }).filter('[data-code="' + node['axisTypeX'] + '"], [data-code="' + node['axisTypeY'] + '"]').trigger(clickEvent);

                        $freeNode.find('button[data-action="position"]').on(clickEvent, function() {
                            var $this = $(this),
                                $flowchart = $('.flowchart-container'),
                                destroy = true;
                            $this.closest('.horizon-dialog-modal').hide();
                            if(!$flowchart.length) {
                                $flowchart = $('<div class="flowchart-container" data-destroy="false"></div>');
                                $('body').append($flowchart);
                                destroy = false;
                            }else if($flowchart.attr('data-destroy') == 'false') {
                                destroy = false;
                            }

                            var dialogChart = function() {
                                $flowchart.dialog({
                                    width: '100%',
                                    maxWidth: '100%',
                                    maxHeight: $(window).height(),
                                    closeText: horizon.lang.workflow['cancal'],
                                    destroyAfterClose: destroy,
                                    open: function() {
                                        $flowchart.trigger('flowchart:free.start');
                                    },
                                    close: function() {
                                        $this.closest('.horizon-dialog-modal').show();
                                        setTimeout(function() {
                                            $flowchart.trigger('flowchart:free.over').removeClass(destroy ? 'hidden' : '');
                                        }, 1);
                                    }
                                });
                            };
                            if($flowchart.data('flowchart-content-option')) {
                                dialogChart();
                            }else {
                                workflow.showFlowchart(function() {
                                    dialogChart();
                                });
                            }

                        });

                    }else {
                        $freeNode.find('[data-for="nodeName"]')
                            .attr('class', 'col-xs-12').end()
                            .find('[data-for="axis"]').remove();
                    }

                    this.transactorSetup(node, $freeNode.children().last());
                },
                /*节点设置*/
                nodeSetup: function(node, $container) {
                    if($container.hasClass('empty')) {
                        $container.removeClass('empty').html('');
                    }
                    var nodeGroup = node['nodeGroup'] ? node['nodeGroup'] : 'nodeGroup',
                        $nodeContainer = $container.find('div[data-group="' + nodeGroup + '"]');
                    if(!$nodeContainer.length) {
                        $nodeContainer = $('.templates .panel-group').clone().attr({
                            'data-group': nodeGroup
                        });
                        $container.append($nodeContainer);
                    }
                    var $node = $('.templates .panel').clone(),
                        random = '_' + parseInt(Math.random() * 10000),
                        isRadio = !!node['nodeGroup'],
                        isSelect = node['isSelect'] == 'true',
                        icon = {
                            'data-icon-show': (isRadio ? 'fa-dot-circle-o blue' : 'fa-check-square-o blue'),
                            'data-icon-hide': (isRadio ? 'fa-circle-o' : 'fa-square-o')
                        };
                    $node.data('setup', node)
                        .find('.panel-title').attr('title', node['selectName'])
                        .find('a').addClass(node['isDone'] === 'true' ? 'grey' : 'blue')
                        .addClass(isSelect ? '' : 'collapsed')
                        .attr({
                            'data-parent': (isRadio ? '[data-group=\'' + nodeGroup + '\']' : ''),
                            'data-target': (isSelect ? '' : '#' + node['nodeKey'] + random)
                        })
                        .find('.panel-title-icon')
                        .attr(icon)
                        .addClass(isSelect ? 'hidden' : icon['data-icon-hide'])
                        .siblings('.panel-title-text').html(node['selectName'])
                        .end().end().end().end()
                        .find('.panel-collapse')
                        .attr({
                            'id': node['nodeKey'] + random
                        })
                        .addClass(isSelect ? 'in' : '');
                    if($.inArray(this.actionData.operate.toLowerCase(), ['jumpreject']) != -1
                        || (node['nodeId'].toLowerCase().indexOf('gateway') != -1 && node['isSelect'] == 'true')
                        ) {
                        $node.find('.panel-collapse').addClass('hidden')
                            .find('.panel-body').removeClass('empty');
                    }
                    $nodeContainer.append($node);
                    if(!$.isEmptyObject(node['authors'])) {
                        this.transactorSetup(node, $node.find('.panel-body'));
                    }
                },
                /*子流程设置*/
                subflowSetup: function(subflow, $container) {
                    if($container.hasClass('empty')) {
                        $container.removeClass('empty').html('');
                    }
                    var subflowGroup = 'subflowGroup',
                        $subflowContainer = $container.find('div[data-group="' + subflowGroup + '"]');
                    if(!$subflowContainer.length) {
                        $subflowContainer = $('.templates .panel-group').clone().attr({
                            'data-group': subflowGroup
                        });
                        $container.append($subflowContainer);
                    }
                    var $subflow = $('.templates .panel').clone(),
                        isRadio = subflow['selectType'] === 'radio',
                        isSelect = subflow['isSelect'] == 'true'
                            || this.actionData['operateStatus'] == 'showSubflow',
                        icon = {
                            'data-icon-show': (isRadio ? 'fa-dot-circle-o blue' : 'fa-check-square-o blue'),
                            'data-icon-hide': (isRadio ? 'fa-circle-o' : 'fa-square-o')
                        };
                    $subflow.data('setup', subflow)
                        .find('.panel-title').attr('title', subflow['subFlowName'])
                        .find('a').addClass(subflow['isStarted'] == 'true' ? 'grey' : 'blue')
                        .addClass(isSelect ? '' : 'collapsed')
                        .attr({
                            'data-parent': (isRadio ? '[data-group=\'' + subflowGroup + '\']' : ''),
                            'data-target': (isSelect ? '' : '#' + subflow['subFlowId'])
                        })
                        .find('.panel-title-icon')
                        .attr(icon)
                        .addClass(isSelect ? 'hidden' : icon['data-icon-hide'])
                        .siblings('.panel-title-text').html(subflow['subFlowName'])
                        .siblings('.panel-list-icon').removeClass(subflow['subWorks'] ? 'hidden' : '')
                        .end().end().end().end().end()
                        .find('.panel-collapse')
                        .attr({
                            'id': subflow['subFlowId']
                        });
                    this.showSubWorks(subflow, $subflow);
                    $subflowContainer.append($subflow);
                    this.transactorSetup(subflow, $subflow.find('.panel-body'));
                },
                /*办理人设置*/
                transactorSetup: function(setup, $container) {
                    var action = this;
                    if(!$.isEmptyObject(setup['authors'])) {
                        var $authorsContainer = $('.templates .authors').clone();
                        //主办、协办、读者设置
                        action.authorsSetup(setup, $authorsContainer);
                        //办理时限设置
                        action.timeLimitSetup(setup, $authorsContainer);
                        $container.removeClass('empty').addClass('no-padding-top').html('').append($authorsContainer);
                        $authorsContainer.find('.tab a[data-toggle="tab"]').first().trigger('click.bs.tab.data-api');
                    }else {
                        $container.removeClass('empty').parent().addClass('hidden');
                    }
                },
                /*主办、协办、读者设置*/
                authorsSetup: function(setup, $container) {
                    var action = this,
                        authors = setup['authors'],
                        tabId = setup['subFlowId'] || (setup['selectId'] || 'tab').replace(/~/g, '').replace(/;/g, ''),
                        $tabPane,
                        hideTabs = setup['isShowTabs'] == 'false';
                    if(!(authors['Author'] || authors['SecondAuthor'] || authors['Reader'])) {
                        hideTabs = true;
                        authors =  {'Author': authors};
                    }
                    //初始化办理人TAB页签
                    $.each(authors, function(type, transactor) {
                        if(transactor && (transactor['isSelect'] == 'true' || transactor['selectAuthor'])) {
                            $container.find('.tab > li[data-type="' + type + '"] > a')
                                .attr({
                                    'href': '#' + tabId + '-' + type + '-tab',
                                    'data-toggle': 'tab'
                                })
                                .addClass(transactor['required'] == 'true' ? 'red' : '')
                                .data('transactor', transactor);
                            $tabPane = $container.find('.tab-content > .tab-pane[data-type="' + type + '"]');
                            $tabPane.attr('id', tabId + '-' + type + '-tab');
                            if(transactor['selectAuthor']) {
                                action.setTransactor(transactor['selectAuthor'], transactor['selectAuthorName'], $tabPane.find('.tags'));
                            }
                            if(transactor['isSelect'] !== 'true') {
                                $tabPane.find('.tag').addClass('no-close').find('.close').remove();
                            }
                        }
                    });
                    if(hideTabs) {
                        $container.find('.tab').addClass('hidden');
                    }
                    //删除单个办理人
                    $container.on(clickEvent, '.tag > .close', function() {
                        var $this = $(this),
                            dataId = $this.parent().attr('data-id'),
                            $tabPane = $this.parents('.tab-pane'),
                            $id = $tabPane.find('input[name="id"]'),
                            $cn = $tabPane.find('input[name="name"]'),
                            transactor = $this.closest('.horizon-tab')
                                .find('.tab > .active > a[data-toggle="tab"]').data('transactor');
                        action.removeTransactor(transactor, dataId, $id, $cn);
                        $this.closest('.tag-box').remove();
                    });
                    //初始化选择办理人按钮
                    var $btnSU = $container.find('.btn[data-action="selectuser"]');
                    $btnSU.on(clickEvent, function() {
                        $.horizon.selectUser(action.getTransactorOption($btnSU.closest('.authors')));
                        $btnSU.closest('.horizon-dialog-modal').hide();
                    });
                    $container.on('show.bs.tab', '.tab a[data-toggle="tab"]', function() {
                        if(authors[$(this).parent().attr('data-type')]['isSelect'] == 'true') {
                            $btnSU.removeAttr('disabled');
                        }else {
                            $btnSU.attr('disabled', 'disabled');
                        }
                    });
                },
                /*办理时限设置*/
                timeLimitSetup: function(setup, $container) {
                    if(!setup['timeLimit']) return;
                    var $timeLimitGroup = $('.templates .timeLimit-group').clone();
                    $container.find('.timeLimit-container').append($timeLimitGroup);
                    $timeLimitGroup.find('input[name="timeLimit"]').val(setup['timeLimit']).on('blur', function() {
                        var $this = $(this),
                            _setup = $this.closest('[data-setup="true"]').data('setup') || setup;
                        _setup['timeLimit'] = $(this).val();
                    });
                    if(setup['nodeId']&&setup['selectId']){
                    	if(setup['nodeId']==setup['selectId']){
                    		$timeLimitGroup.find('input[name="timeLimit"]').attr('disabled', 'disabled');
                    	}
                    }
                    $timeLimitGroup.find('.dropdown-menu > li').on(clickEvent, function() {
                        var $this = $(this),
                            _setup = $this.closest('[data-setup="true"]').data('setup') || setup;
                        _setup['timeLimitType'] = $this.attr('data-code');
                        $this.addClass('active').siblings().removeClass('active');
                        $timeLimitGroup.find('.timeLimitBtn > span').html($this.children('a').html());
                    });
                    if(setup['timeLimitType']) {
                        $timeLimitGroup.find('.dropdown-menu > li[data-code="' + setup['timeLimitType'] + '"]').trigger(clickEvent);
                    }else {
                        setup['timeLimitType'] = $timeLimitGroup.find('.dropdown-menu > li.active').attr('data-code');
                    }
                },
                /*设置办理人*/
                setTransactor: function(selectAuthor, selectAuthorName, $container) {
                    $container.children('.tag-box').remove();
                    $container.children('input[name="id"]').val(selectAuthor)
                        .siblings('input[name="name"]').val(selectAuthorName);
                    if(!selectAuthor) return ;
                    var idArr = selectAuthor.split(';'),
                        nameArr = selectAuthorName.split(';'),
                        $tagTls = $('.templates .tag-box');
                    $.each(idArr, function(i ,id) {
                        var $tag= $tagTls.clone();
                        $tag.children('.tag').attr('data-id', id)
                            .find('.tag-text').attr('title', nameArr[i]).html(nameArr[i]);
                        $container.append($tag);
                    });
                },
                /*删除办理人*/
                removeTransactor: function(transactor, dataId, $id, $cn) {
                    var idArr = $id.val().split(';');
                    var cnArr = $cn.val().split(';');
                    var i = $.inArray(dataId, idArr);
                    idArr.splice(i, 1);
                    cnArr.splice(i, 1);
                    $id.val(idArr.join(';'));
                    $cn.val(cnArr.join(';'));
                    transactor['selectAuthor'] = idArr.join(';');
                    transactor['selectAuthorName'] = cnArr.join(';');
                },
                /*获取选择办理人参数*/
                getTransactorOption: function($container) {
                    var action = this,
                        $tab = $container.find('.tab > .active > a[data-toggle="tab"]'),
                        $tabPane = $container.find('.tab-pane.active'),
                        transactor = $tab.data('transactor'),
                        $id = $tabPane.find('input[name="id"]'),
                        $cn = $tabPane.find('input[name="name"]');
                    var option = {
                        idField: $id,
                        cnField: $cn,
                        isFlow: true
                    };
                    if(transactor['selectType'] !== 'checkbox') {
                        option['multiple'] = false;
                    }
                    if(transactor['isFree'] !== 'true') {
                        option['dept'] = false;
                        option['position'] = false;
                        option['group'] = false;
                        option['role'] = false;
                        option['search'] = false;
                    }
                    if(transactor['isUser'] === 'true') {
                        option['selectDept'] = false;
                        option['selectPosition'] = false;
                        option['selectGroup'] = false;
                        option['selectRole'] = false;
                        option['selectUser'] = true;
                    }
                    if(transactor['isDefUser'] === 'true') {
                        option['flowDefines'] = transactor['initAuthor'];
                    }
                    option['fnClose'] = function() {
                        var idVal = $id.val(),
                            cnVal = $cn.val();
                        action.setTransactor(idVal, cnVal, $tabPane.find('.tags'));
                        transactor['selectAuthor'] = idVal;
                        transactor['selectAuthorName'] = cnVal;
                        $container.closest('.horizon-dialog-modal').show();
                    };
                    return option;
                },
                /*发送消息设置*/
                msgTypeSetup: function($container) {
                    var actionData = this.actionData,
                        $msgContainer = $('.templates .msg-type').clone(),
                        msgType = $msgContainer.attr('data-msg-type');
                    if(!msgType) return ;
                    var setMessageType = function() {
                        var arr = [];
                        $msgContainer.find('input[name="messageType"]:checked').each(function() {
                            arr.push($(this).val());
                        });
                        actionData.messageType = arr.join('|');
                    };
                    $msgContainer.find('input[name="messageType"]').each(function() {
                        var $this = $(this);
                        if(msgType.indexOf($this.val()) == -1) {
                            $this.parent().remove();
                        }
                    }).on(clickEvent, function() {
                        setMessageType();
                    });
                    if($msgContainer.find('input[name="messageType"]:checked').length) {
                        setMessageType();
                    }
                    $container.append($msgContainer);
                },
                /*已启动子流程列表*/
                showSubWorks: function(subflow, $container) {
                    if(subflow['subWorks']) {
                        var $list = $('.templates .subwork-list').clone(),
                            $workTls = $('.templates .panel');
                        $list.removeClass(subflow['isSelect'] == 'true' || this.actionData['operateStatus'] == 'showSubflow' ? 'hidden' : '');
                        $container.find('.panel-collapse').before($list);
                        $.each(subflow['subWorks'], function(key, value) {
                            var $work = $workTls.clone();
                            $work.find('.panel-collapse').remove()
                                .end()
                                .find('a')
                                .attr({
                                    target: '_blank',
                                    href: horizon.paths.flowpath + '?workId=' + key
                                })
                                .removeAttr('data-toggle').html(value);
                            $list.append($work);
                        });
                        $container.find('.panel-list-icon').on(clickEvent, function(ev) {
                            if($list.hasClass('hidden')) {
                                $list.removeClass('hidden').hide();
                            }
                            $list.slideToggle('fast');
                            ev.stopPropagation();
                        });
                    }
                }
            }
        };
       
        workflow.resizeFlowNav();
        workflow.resizeTabContent();
        workflow.initFixedModal();

        if(!horizon.closeCallback) {
            horizon['closeCallback'] = workflow.unload;
        }

        var resizeTimer;
        $(window).on('resize', function() {
            window.clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                workflow.resizeFlowNav();
                workflow.resizeTabContent();
                $('.horizon-dialog-modal').trigger('resize.modal-dialog');
            }, 10);
        });

        $(window).unload(function () {
            workflow.action.async = false;
            workflow.unload();
        });

        if(horizon.lang.workflow) {
            horizon.lang.workflow = horizon.language.formatLang(horizon.lang.workflow);
        }

        horizon.language.getLanguage(['workflow', 'flowchart', 'validator', 'selectuser'], function() {

            workflow.setNoteLang();
            workflow.initOperate();
            workflow.initFlowTrackTab();

            horizon.form.load(function() {
                $focus.trigger(clickEvent);
                if(typeof horizon['impl_load'] === 'function') {
                    horizon.impl_load();
                }
            });
        })

    });

})(window);
