/**
 * 组织机构-选择人员
 * @author zhouwf
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonJqueryui', 'ztree'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {

    var clickEvent = horizon.tools.clickEvent();

    var tree = {
        showIcon: function(treeId, treeNode) {
            var $orgTree = $('#org-tree'),
                option = $orgTree.data('org-tree-option');
            return $.inArray(treeNode.iconSkin, option['_showIcon']) !== -1;
        },
        orgTreeSetting: {
            async: {
                enable: true,
                dataType: 'json'
            },
            data : {
                simpleData : {
                    enable : true,
                    pIdKey : 'pid'
                }
            },
            view: {
                autoCancelSelected: false,
                dblClickExpand: false,
                showIcon: function() {
                    return tree.showIcon.apply(this, arguments);
                }
            },
            callback: {
                beforeClick: function() {
                    return tree.fnOrgTreeNodeBeforeClick.apply(this, arguments);
                },
                onClick: function() {
                    tree.fnOrgTreeNodeClick.apply(this, arguments);
                },
                onAsyncSuccess: function() {
                    tree.fnOrgTreeAsyncSuccess.apply(this, arguments);
                }
            }
        },
        selectTreeSetting: {
            async: {
                enable: true,
                dataType: 'json'
            },
            check: {
                enable: true,
                chkboxType: {"Y": "ps", "N": "ps"}
            },
            view: {
                autoCancelSelected: false,
                dblClickExpand: false,
                showIcon: function() {
                    return tree.showIcon.apply(this, arguments);
                },
                expandSpeed: ''
            },
            callback: {
                beforeAsync: function() {
                    return tree.fnSelectTreeBeforeAsync.apply(this, arguments);
                },
                onClick: function() {
                    tree.fnSelectTreeNodeClick.apply(this, arguments);
                },
                onCheck: function() {
                    tree.fnSelectTreeNodeCheck.apply(this, arguments);
                },
                onNodeCreated: function() {
                    tree.fnSelectTreeNodeCreated.apply(this, arguments);
                }
            }
        },
        selectTreeSettingForPaging: {
            check: {
                enable: true,
                chkboxType: {'Y': 'ps', 'N': 'ps'}
            },
            view: {
                autoCancelSelected: false,
                dblClickExpand: false,
                showIcon: function() {
                    return tree.showIcon.apply(this, arguments);
                },
                expandSpeed: ''
            },
            callback: {
                onClick: function() {
                    tree.fnSelectTreeNodeClick.apply(this, arguments);
                },
                onCheck: function() {
                    tree.fnSelectTreeNodeCheck.apply(this, arguments);
                },
                onNodeCreated: function() {
                    tree.fnSelectTreeNodeCreated.apply(this, arguments);
                }
            }
        },
        selectTreeDataForPaging: [],
        iconSkin: function(lang, key){
            var skin = {
                U: ' (' + lang.user + ') ',
                D: ' (' + lang.dept + ') ',
                S: ' (' + lang.dept + ') ',
                G: ' (' + lang.group + ') ',
                P: ' (' + lang.position + ') ',
                R: ' (' + lang.role + ') '
            };
            return skin[key];
        },
        fnOrgTreeInit: function(option) {
            var orgSetting = $.extend(true, this.orgTreeSetting, {
                async: {
                    url: option.orgTreeSource,
                    otherParam: $.extend({
                        auth: option.auth,
                        dept: option.dept,
                        position: option.position,
                        group: option.group,
                        role: option.role
                    }, option.otherParam)
                }
            });
            var showIcon = [];
            $.each(option.showIcon, function(key, value) {
                if(value) {
                    if(key === 'dept') {
                        showIcon.push('D', 'S');
                    }else if(key === 'position') {
                        showIcon.push('P');
                    }else if(key === 'group') {
                        showIcon.push('G');
                    }else if(key === 'role') {
                        showIcon.push('R');
                    }else if(key === 'user') {
                        showIcon.push('U');
                    }
                }
            });
            option['_showIcon'] = showIcon;
            var $orgTree = $('#org-tree');
            $orgTree.data('org-tree-option', option);
            $orgTree = $.fn.zTree.init($orgTree, orgSetting);
            if(option.flowDefines) {
                var nodes = [{id: "flowDefines", name:option.lang.flowDefines , iconSkin: 'F', pid: 'root', others: option.flowDefines.others}];
                if(option.flowDefines.depts && option.flowDefines.depts.length) {
                    nodes.push({id: "defineDept", name: option.lang.depts, iconSkin: 'D', pid: 'flowDefines'});
                    $.each(option.flowDefines.depts, function(i, _node) {
                        nodes.push(_node);
                    });
                }
                if(option.flowDefines.groups && option.flowDefines.groups.length) {
                    nodes.push({id: "defineGroup", name: option.lang.groups, iconSkin: 'G', pid: 'flowDefines'});
                    $.each(option.flowDefines.groups, function(i, _node) {
                        nodes.push(_node);
                    });
                }
                if(option.flowDefines.positions && option.flowDefines.positions.length) {
                    nodes.push({id: "definePosition", name:option.lang.positions, iconSkin: 'P', pid: 'flowDefines'});
                    $.each(option.flowDefines.positions, function(i, _node) {
                        nodes.push(_node);
                    });
                }
                if(option.flowDefines.roles && option.flowDefines.roles.length) {
                    nodes.push({id: "defineRole", name: option.lang.roles , iconSkin: 'R', pid: 'flowDefines'});
                    $.each(option.flowDefines.roles, function(i, _node) {
                        nodes.push(_node);
                    });
                }
                $orgTree.addNodes(null, nodes);
            }
        },
        fnOrgTreeNodeBeforeClick: function(treeId, treeNode) {
            var selectedNodes = $.fn.zTree.getZTreeObj(treeId).getSelectedNodes();
            if(selectedNodes.length > 0 && treeNode.id == selectedNodes[0].id) {
                if(treeNode.isParent) {
                    $.fn.zTree.getZTreeObj(treeId).expandNode(treeNode);
                }
                return false;
            }
            var option = $('#org-tree').data('org-tree-option');
            $('#select-tree').append($('<li>' + option.lang.loading + '</li>'));
        },
        fnOrgTreeNodeClick: function(event, treeId, treeNode) {
            var option = $('#org-tree').data('org-tree-option');
            if(option.search) {
                $('.selectuser-dialog').find('.input-search').val('');
            }
            var param = $.extend({
                auth: option.auth,
                dept: option.dept,
                position: option.position,
                group: option.group,
                role: option.role,
                selectDept: option.selectDept,
                selectPosition: option.selectPosition,
                selectGroup: option.selectGroup,
                selectRole: option.selectRole,
                selectUser: option.selectUser,
                subUserLevel: option.subUserLevel,
                type: treeNode.iconSkin,
                parentId: treeNode.id,
                parentName: treeNode.name
            }, option.otherParam);
            var $selectTree = $('#select-tree');
            $selectTree.removeData('search');
            if(option.paging) {
                if(treeNode.isParent) {
                    $.fn.zTree.getZTreeObj(treeId).expandNode(treeNode);
                }
                tree.fnGetSelectTreeDataForPaging(option.selectTreeSource, param);
            }else {
                var selectSetting = $.extend(true, tree.selectTreeSetting, {
                    async: {
                        url: option.selectTreeSource,
                        otherParam: param
                    },
                    check: {
                        chkStyle: (option.multiple ? 'checkbox' : 'radio')
                    }
                });
                if(treeNode.isParent) {
                    $.fn.zTree.getZTreeObj(treeId).expandNode(treeNode);
                    setTimeout(function() {
                        $.fn.zTree.init($selectTree, selectSetting);
                    }, 100);
                    return ;
                }
                $.fn.zTree.init($selectTree, selectSetting);
            }
        },
        fnOrgTreeAsyncSuccess: function(event, treeId) {
            var option = $('#org-tree').data('org-tree-option'),
                ztreeObj = $.fn.zTree.getZTreeObj(treeId),
                nodeId;
            if(option.openDept && option.dept) {
                nodeId = option.openDept;
                if(nodeId === true) {
                    nodeId = option.dept === true ? 'dept_root' : option.dept;
                }
            }else if(option.openPosition && option.position && option.position !== 'inDept') {
                nodeId = option.openPosition;
                if(nodeId === true) {
                    nodeId = option.position === true ? 'position_root' : option.position;
                }
            }else if(option.openGroup && option.group) {
                nodeId = option.openGroup;
                if(nodeId === true) {
                    nodeId = option.group === true ? 'group_root' : option.group;
                }
            }else if(option.openRole && option.role) {
                nodeId = option.openRole;
                if(nodeId === true) {
                    nodeId = option.role === true ? 'role_root' : option.role;
                }
            }
            if(nodeId) {
                var openNode = ztreeObj.getNodeByParam('id', nodeId);
                if(openNode) {
                    tree.fnOrgTreeNodeClick(event, treeId, openNode);
                    ztreeObj.selectNode(openNode);
                }
            }
        },
        fnGetSelectTreeDataForPaging: function(url, param) {
            var option = $('#org-tree').data('org-tree-option');
            var $treePagination = $('.selecttree-container .tree-pagination');
            $treePagination
                .find('input').val('0')
                .siblings('span').text('0');
            if(!tree.fnSelectTreeBeforeAsync('select-tree')) return ;
            $.ajax({
                type: 'post',
                dataType: 'json',
                cache: false,
                data: param,
                url: url,
                success: function(data) {
                    tree.selectTreeDataForPaging = data;
                    var pageNumber = 0, pageTotal = 0;
                    if(data && data.length) {
                        pageNumber = 1;
                        pageTotal = Math.ceil(data.length/option.pageSize);
                    }
                    $treePagination
                        .find('input[name="pageNumber"]').val(pageNumber)
                        .siblings('input[name="pageTotal"]').val(pageTotal)
                        .siblings('.page-number').text(pageNumber)
                        .siblings('.page-total').text(pageTotal);
                    tree.fnSetSelectTreeDataForPaging();
                }
            });
        },
        fnSetSelectTreeDataForPaging: function() {
            var $selectTree = $('#select-tree'),
                $treePagination = $('.selecttree-container .tree-pagination'),
                option = $('#org-tree').data('org-tree-option');
            if(option.multiple) {
                SelectUser._fnSetCheckAll(false);
            }
            var allNodes = tree.selectTreeDataForPaging,
                nodes = [],
                pageNumber = parseInt($treePagination.find('input[name="pageNumber"]').val());
            if(allNodes && allNodes.length) {
                var iLen=(allNodes.length > option.pageSize*pageNumber ? option.pageSize*pageNumber : allNodes.length);
                for(var i = option.pageSize*(pageNumber-1); i < iLen; i++) {
                    nodes.push(allNodes[i]);
                }
            }
            var selectSetting = $.extend(true, tree.selectTreeSettingForPaging, {
                check: {
                    chkStyle: (option.multiple?'checkbox':'radio')
                }
            });
            $.fn.zTree.init($selectTree, selectSetting, nodes);
        },
        fnSelectTreeNodeClick: function(event, treeId, treeNode) {
            var treeObj = $.fn.zTree.getZTreeObj('select-tree');
            if(treeNode.checked) {
                treeObj.checkNode(treeNode, false, true, true);
                var option = $('#org-tree').data('org-tree-option');
                if(option.multiple) {
                    SelectUser._fnSetCheckAll(false);
                }
            }else {
                treeObj.checkNode(treeNode, true, true, true);
            }
        },
        fnSelectTreeNodeCheck: function(event, treeId, treeNode) {
            var option = $('#org-tree').data('org-tree-option');
            var $orgCheckedList = $('#org-checked-list');
            var checkedData = $orgCheckedList.data('org-checked-list');
            if(!checkedData) {
                checkedData = {};
            }
            var id = treeNode.iconSkin + '_' + treeNode.id,
                name = treeNode.name,
                login = (treeNode.login || ''),
                subDeptId = '';
            var isHaveFix = false;
            if(option.isFlow && treeNode['userFromIconSkin'] && treeNode['userFromId']) {
                id = id + '/' + treeNode['userFromIconSkin'] + '_' + treeNode['userFromId'];
                if(treeNode['userFromName']) {
                    var $selectTree = $('#select-tree');
                    if(treeNode.form != 'flowDefines' && !$selectTree.data('search')) {
                        name = name + '(' + treeNode['userFromName'] + ')';
                    }
                    isHaveFix = true;
                }
            }
            if(treeNode.iconSkin == 'D') {
                subDeptId = 'S_' + treeNode.id;
            }
            var text, $tag;
            if(!option.multiple) {
                //单选
                checkedData = {};
                $orgCheckedList.html('');
                if(treeNode.checked) {
                    checkedData[id] = {
                        id: id,
                        name: name,
                        login: login
                    };
                    text = name + (isHaveFix ? '' : tree.iconSkin(option.lang, treeNode.iconSkin));
                    $tag = $('<div title="' + text + '"><span id="' + id.replace(/~/g, '').replace(/\//g, '') + '" data-id="' + id + '" class="tag">' +
                            text + '<button type="button" class="close selectuser-remove-tag">×</button></span></div>');
                    $orgCheckedList.append($tag);
                    SelectUser._fnSortData();
                }
            }else{
                if(treeNode.checked) {
                    if(checkedData[id] || checkedData[subDeptId]) return;
                    checkedData[id] = {
                        id: id,
                        name: name,
                        login: login
                    };
                    text = name + (isHaveFix ? '' : tree.iconSkin(option.lang, treeNode.iconSkin));
                    $tag = $('<div title="' + text + '"><span id="' + id.replace(/~/g, '').replace(/\//g, '') + '" data-id="' + id + '" class="tag">' +
                            text + '<button type="button" class="close selectuser-remove-tag">×</button></span></div>');
                    $orgCheckedList.append($tag);
                    SelectUser._fnSortData();
                }else {
                    delete checkedData[id];
                    delete checkedData[subDeptId];
                    $("#" + id.replace(/~/g, '').replace(/\//g, '')).parent().remove();
                    $("#" + subDeptId.replace(/~/g, '').replace(/\//g, '')).parent().remove();
                }
            }
            $orgCheckedList.data('org-checked-list', checkedData);
        },
        fnSelectTreeNodeCreated: function(event, treeId, treeNode) {
            var checkedData = $('#org-checked-list').data('org-checked-list');
            if(!checkedData || $.isEmptyObject(checkedData)) return ;
            var option = $('#org-tree').data('org-tree-option'),
                id = treeNode.iconSkin + '_' + treeNode.id,
                subDeptId = '';
            if(option.isFlow && treeNode['userFromIconSkin'] && treeNode['userFromId']) {
                id = id + '/' + treeNode['userFromIconSkin'] + '_' + treeNode['userFromId'];
            }
            if(treeNode.iconSkin == 'D') {
                subDeptId = 'S_' + id.substring(2);
            }
            if(checkedData[id] || checkedData[subDeptId]) {
                var treeObj = jQuery.fn.zTree.getZTreeObj('select-tree');
                treeObj.checkNode(treeNode, true, true);
            }
        },
        fnSelectTreeBeforeAsync: function(treeId) {
            var option = $('#org-tree').data('org-tree-option');
            if(option.multiple) {
                SelectUser._fnSetCheckAll(false);
            }
            var selectedNodes = $.fn.zTree.getZTreeObj('org-tree').getSelectedNodes();
            var arr = ['flowDefines', 'defineDept', 'defineGroup', 'definePosition', 'defineRole'];
            if(selectedNodes.length > 0 && $.inArray(selectedNodes[0].id, arr) != -1) {
                if(selectedNodes[0].id == 'flowDefines') {
                    var others = $.extend(true, [], selectedNodes[0].others);
                    $.each(others, function(i, other) {
                        if(other['userFromName']) {
                            other.name += '(' + other['userFromName'] + ')';
                            other['form'] = 'flowDefines';
                        }
                    });
                    if(option.paging) {
                        tree.selectTreeDataForPaging = others;
                        var pageNumber = 0, pageTotal = 0;
                        if(others && others.length) {
                            pageNumber = 1;
                            pageTotal = Math.ceil(others.length/option.pageSize);
                        }
                        var $treePagination = $('.selecttree-container .tree-pagination');
                        $treePagination
                            .find('input[name="pageNumber"]').val(pageNumber)
                            .siblings('input[name="pageTotal"]').val(pageTotal)
                            .siblings('.page-number').text(pageNumber)
                            .siblings('.page-total').text(pageTotal);
                        tree.fnSetSelectTreeDataForPaging();
                    }else {
                        $.fn.zTree.getZTreeObj(treeId).addNodes(null, others);
                    }
                }else if(option.paging) {
                    $.fn.zTree.getZTreeObj(treeId).destroy();
                }
                return false;
            }
            return true;
        }
    };
    var SelectUser = {
        container: null,
        init: function(option) {
            this._fnConvertOption(option);
            this._fnMakeDom(option);
            var title = this._fnMakeTitle(option);
            if(!option.multiple) {
                this.container.find('input[name="checkall"]').remove();
            }else {
                //初始化全选方法
                this._fnCheckAll();
            }
            if(option.paging) {
                //初始化分页
                this._fnPagination();
            }
            //初始化删除全部
            this._fnDeleteAll(option);
            //初始化单个删除
            this._fnDeleteSingle(option);
            //展示已选择数据
            this._fnShowChoiceData(option);

            this.container.dialog({
                title: title,
                titleHtml: true,
                closeText: option.lang.close,
                width: $(window).width() > 600? 600 : '100%',
                maxWidth: 500,
                height: $(window).height() > 480? 480 : $(window).height(),
                maxHeight: $(window).height(),
                dialogClass: 'selectuser-dialog no-close',
                cancelDrag: '.search-container',
                buttons: [
                    {
                        html: option.lang.ok,
                        'class' : 'btn btn-xs btn-primary no-margin-top no-margin-bottom',
                        click: function() {
                            SelectUser._fnBackData();
                            $(this).dialog('close');
                        }
                    }
                ],
                open: function() {
                    SelectUser._fnSortData();
                    if(!option.search) {
                        SelectUser.container.closest('.selectuser-dialog').find('.search-group').remove();
                    }else {
                        //初始化搜索方法
                        SelectUser._fnSearch();
                    }
                    if(option.fnOpen) {
                        if(typeof option.fnOpen === 'function') {
                            option.fnOpen.apply(this);
                        }else if(typeof option.fnOpen === 'string') {
                            eval(option.fnOpen);
                        }
                    }
                    tree.fnOrgTreeInit(option);
                },
                beforeClose: function() {
                    if(option.fnBeforeClose) {
                        if(typeof option.fnBeforeClose === 'function') {
                            option.fnBeforeClose.apply(this);
                        }else if(typeof option.fnBeforeClose === 'string') {
                            eval(option.fnBeforeClose);
                        }
                    }
                },
                close: function() {
                    $.fn.zTree.destroy('org-tree');
                    $.fn.zTree.destroy('select-tree');
                    if(option.fnClose) {
                        if(typeof option.fnClose === 'function') {
                            option.fnClose.apply(this);
                        }else if(typeof option.fnClose === 'string') {
                            eval(option.fnClose);
                        }
                    }
                }
            });
        },
        _fnConvertOption: function(option) {
            if(!option.dept) {
                option['selectDept'] = false;
            }
            if(!option.position) {
                option['selectPosition'] = false;
            }else if(option.position == 'inDept') {
                option.dept = true;
            }
            if(!option.group) {
                option['selectGroup'] = false;
            }
            if(!option.role) {
                option['selectRole'] = false;
            }
            return option;
        },
        _fnMakeTitle: function(option) {
            var title = '<div class="widget-header widget-header-flat widget-header-small">' +
                '<h5 class="smaller"> ' + (option.title || option.lang.defaultTitle) + ' </h5>' +
                '</div>';
            if(option.search) {
                title += '<div class="nav-search search-container">' +
                    '<span class="input-icon input-icon-right">' +
                    '<input placeholder="'+ option.lang.search +' ..." class="nav-search-input input-search" type="search"/>' +
                    '<i class="ace-icon fa fa-search nav-search-icon btn-search" title="'+ option.lang.clickSearch +'"></i>' +
                    '</span></div>';
            }
            return title;
        },
        _fnMakeDom: function(option) {
            this.container = $('<div>' +
                '<div class="row no-margin">' +
                '<div class="col-xs-6 col-sm-4 no-padding">' +
                '<h5 class="lighter blue smaller">' +
                '<i class="ace-icon fa fa-list"></i> '+ option.lang.org +
                '</h5>' +
                '<div class="orgtree-container">' +
                '<ul id="org-tree" class="ztree"></ul>' +
                '</div>' +
                '</div>' +
                '<div class="col-xs-6 col-sm-4 no-padding">' +
                '<h5 class="lighter blue smaller">' +
                '<i class="ace-icon fa ' + (option.multiple ? 'fa-check-square-o fa-square-o' : 'fa-circle-o') + '"></i> ' +
                '<span>' + option.lang.select + '</span>' +
                '<input name="checkall" class="hidden" type="checkbox">' +
                '</h5>' +
                '<div class="selecttree-container">' +
                '<ul id="select-tree" class="ztree"></ul>' +
                '<div class="tree-pagination hidden">' +
                '<span class="page info blue">' +
                '<input type="hidden" value="0" name="pageNumber"/>' +
                '<input type="hidden" value="0" name="pageTotal"/>' +
                '<span class="page-number">0</span>/<span class="page-total">0</span>' +
                '</span>' +
                '<a class="page first" title="' + option.lang.first +'"><i class="ace-icon fa fa-step-backward"></i></a>' +
                '<a class="page prev" title="' + option.lang.previous  +'"><i class="ace-icon fa fa-chevron-left"></i></a>' +
                '<a class="page next" title="' + option.lang.next +'"><i class="ace-icon fa fa-chevron-right"></i></a>' +
                '<a class="page last" title="' + option.lang.last +'"><i class="ace-icon fa fa-step-forward"></i></a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="col-xs-6 col-sm-4 no-padding">' +
                '<h5 class="lighter blue smaller"> ' + option.lang.selected+'' +
                '<a href="javascript:void(0)" class="pull-right" '+
                'data-action="delete-all" title="' + option.lang.deleteAll+'">' +
                '<i class="ace-icon fa fa-trash-o red bigger-120"></i>' +
                '</a>' +
                '</h5>' +
                '<div class="orgchecked-container" id="org-checked-list"></div>' +
                '</div>' +
                '</div>' +
                '</div>');
            return this.container;
        },
        _fnCheckAll: function() {
            var $checkall = this.container.find('input[name="checkall"]');
            $checkall.on(clickEvent, function() {
                var $this = $(this);
                var $selectTree = $.fn.zTree.getZTreeObj('select-tree');
                if($selectTree == null || $selectTree.getNodes().length == 0) {
                    $this[0].checked = false;
                    return;
                }
                var nodes = null;
                if($this[0].checked) {
                    nodes = $selectTree.getCheckedNodes(false);
                    if(!nodes.length) return;
                    $selectTree.checkAllNodes(true);
                }else {
                    nodes = $selectTree.getCheckedNodes(true);
                    if(!nodes) return;
                    $selectTree.checkAllNodes(false);
                }
                $.each(nodes, function(i, node) {
                    tree.fnSelectTreeNodeCheck.apply(this, [null, node.id, node]);
                });
            }).siblings().css('cursor', 'pointer').on(clickEvent, function() {
                $checkall.trigger(clickEvent);
                if($checkall.prop('checked')) {
                    $checkall.siblings('i').removeClass('fa-square-o');
                }else {
                    $checkall.siblings('i').addClass('fa-square-o');
                }
            });
        },
        _fnSetCheckAll: function(checked) {
            var $checkall = this.container.find('input[name="checkall"]');
            if($checkall.prop('checked') === checked) {
                return ;
            }
            $checkall.prop('checked', checked);
            if(checked) {
                $checkall.siblings('i').removeClass('fa-square-o');
            }else {
                $checkall.siblings('i').addClass('fa-square-o');
            }
        },
        _fnPagination: function() {
            var $treePagination = this.container.find('.selecttree-container .tree-pagination').removeClass('hidden');
            $treePagination.parent().addClass('has-paging');
            var $pageNumberInput = $treePagination.find('input[name="pageNumber"]');
            var $pageNumber = $treePagination.find('.page-number');
            var $pageTotalInput = $treePagination.find('input[name="pageTotal"]');
            $treePagination.find('.page.first').on(clickEvent, function() {
                if($pageNumberInput.val() == '1' || $pageTotalInput.val() == '0') return;
                $pageNumberInput.val('1');
                $pageNumber.text('1');
                tree.fnSetSelectTreeDataForPaging();
            });
            $treePagination.find('.page.prev').on(clickEvent, function() {
                if($pageNumberInput.val() == '1' || $pageTotalInput.val() == '0') return;
                var pageNumber = parseInt($pageNumberInput.val()) - 1;
                $pageNumberInput.val(pageNumber);
                $pageNumber.text(pageNumber);
                tree.fnSetSelectTreeDataForPaging();
            });
            $treePagination.find('.page.next').on(clickEvent, function() {
                if($pageNumberInput.val() == $pageTotalInput.val()) return;
                var pageNumber = parseInt($pageNumberInput.val()) + 1;
                $pageNumberInput.val(pageNumber);
                $pageNumber.text(pageNumber);
                tree.fnSetSelectTreeDataForPaging();
            });
            $treePagination.find('.page.last').on(clickEvent, function() {
                if($pageNumberInput.val() == $pageTotalInput.val()) return;
                var pageNumber = $pageTotalInput.val();
                $pageNumberInput.val(pageNumber);
                $pageNumber.text(pageNumber);
                tree.fnSetSelectTreeDataForPaging();
            });
        },
        _fnSearch: function() {
            var $searchInput = this.container.closest('.selectuser-dialog').find('.input-search');
            $searchInput.on('keypress',function(e){
                if(e.which == 13){
                    $(this).next('.btn-search').trigger(clickEvent);
                    e.preventDefault();
                }
            }).next('.btn-search').on(clickEvent, function() {
                var searchText = $searchInput.val();
                if(!searchText) return ;
                var $orgTree = $.fn.zTree.getZTreeObj('org-tree');
                $orgTree.cancelSelectedNode();
                var option = $('#org-tree').data('org-tree-option'),
                    param = $.extend({
                        auth: option.auth,
                        isFlow: option.isFlow,
                        dept: option.dept,
                        position: option.position,
                        group: option.group,
                        role: option.role,
                        selectDept: option.selectDept,
                        selectPosition: option.selectPosition,
                        selectGroup: option.selectGroup,
                        selectRole: option.selectRole,
                        selectUser: option.selectUser,
                        searchText: searchText
                    }, option.otherParam);
                var $selectTree = $('#select-tree');
                $selectTree.data('search', true);
                if(option.paging) {
                    tree.fnGetSelectTreeDataForPaging(option.searchSource, param);
                }else {
                    var selectSetting = $.extend(true, tree.selectTreeSetting, {
                        async: {
                            url: option.searchSource,
                            otherParam: param
                        },
                        check: {
                            chkStyle: (option.multiple ? 'checkbox' : 'radio')
                        }
                    });
                    $.fn.zTree.init($selectTree, selectSetting);
                    if(option.multiple) {
                        SelectUser._fnSetCheckAll(false);
                    }
                }
            });
            setTimeout(function() {
                $searchInput.focus();
            }, 300);
        },
        _fnDeleteAll: function(option) {
            var $orgCheckedList = this.container.find('#org-checked-list');
            this.container.find('a[data-action="delete-all"]').on(clickEvent, function() {
                $orgCheckedList.html('').removeData('org-checked-list');
                var $selectTree = $.fn.zTree.getZTreeObj("select-tree");
                if($selectTree == null || $selectTree.getNodes().length == 0) return;
                var nodes = $selectTree.getCheckedNodes(true);
                $.each(nodes, function(i, node) {
                    $selectTree.checkNode(node, false);
                });
                if(option.multiple) {
                    SelectUser._fnSetCheckAll(false);
                }
            });
        },
        _fnDeleteSingle: function(option) {
            var $orgCheckedList = this.container.find('#org-checked-list');
            this.container.on(clickEvent, 'button.selectuser-remove-tag', function() {
                var $this = $(this);
                var dataId = $this.parent().attr('data-id');
                $this.parent().parent().remove();
                var checkedData = $orgCheckedList.data('org-checked-list');
                delete checkedData[dataId];
                $orgCheckedList.data('org-checked-list', checkedData);
                var $selectTree = $.fn.zTree.getZTreeObj('select-tree');
                if($selectTree == null || $selectTree.getNodes().length == 0) return;
                var node = null;
                if(dataId.substring(0, 1) == 'U') {
                    var arr = dataId.split('/'),
                        userFromIconSkin = '',
                        userFromId = '';
                    dataId = arr[0].substring(2);
                    if(arr.length == 2) {
                        userFromIconSkin = arr[1].substring(0, 1);
                        userFromId = arr[1].substring(2);
                    }
                    node = $selectTree.getNodesByFilter(function(data) {
                        if(arr.length == 2) {
                            return data['id'] == dataId && data['userFromId'] == userFromId;
                        }
                        return data['id'] == dataId;
                    }, true);
                    if(node != null) {
                        if(arr.length == 2) {
                            if(!(node['userFromIconSkin'] == userFromIconSkin && node['userFromId'] == userFromId)) {
                                node = null;
                            }
                        }else if(node['userFromIconSkin'] && node['userFromId'] && option.isFlow) {
                            node = null;
                        }
                    }
                }else {
                    dataId = dataId.substring(2);
                    node = $selectTree.getNodeByParam('id', dataId);
                }
                if(node) {
                    $selectTree.checkNode(node, false);
                }
                if(option.multiple) {
                    SelectUser._fnSetCheckAll(false);
                }
            });
        },
        _fnBackData: function() {
            var option = $('#org-tree').data('org-tree-option');
            var $orgCheckedList = $('#org-checked-list');
            var checkedData = $orgCheckedList.data('org-checked-list');
            if(!$.isEmptyObject(checkedData)) {
                var tmpData = [];
                $orgCheckedList.find('.tag').each(function() {
                    var dataId = $(this).attr('data-id');
                    tmpData.push(checkedData[dataId]);

                });
                checkedData = tmpData;
            }
            if(typeof option.fnBackData === 'function') {
                option.fnBackData.apply(this, [checkedData, option.idField, option.cnField, option.loginField]);
                return ;
            }
            var id = '', name = '', login = '';
            if(checkedData) {
                var idArr = [], cnArr = [], loginArr = [];
                $.each(checkedData, function(i, value) {
                    idArr.push(value.id);
                    cnArr.push(value.name);
                    loginArr.push(value.login);
                });
                id = idArr.join(option.concat);
                name = cnArr.join(option.concat);
                login = loginArr.join(option.concat);
            }
            var $field;
            if(option.idField) {
                if(typeof option.idField === 'string') {
                    try{
                        if(option.idField.indexOf('#') > -1) {
                            $field = $(option.idField);
                        }else {
                            $field = $('[name="' + option.idField + '"]');
                        }
                        $field.val(id).trigger('change');
                    }catch(e){}
                }else if($.isArray(option.idField) && option.idField.length) {
                    $.each(option.idField, function(i, field) {
                        if(typeof field === 'string') {
                            try{
                                if(field.indexOf('#') > -1) {
                                    $field = $(field);
                                }else {
                                    $field = $('[name="' + field + '"]');
                                }
                                $field.val(id).trigger('change');
                            }catch(e){}
                        }else if(typeof field === 'object') {
                            try{
                                $field = $(field);
                                $field.val(id).trigger('change');
                            }catch(e){}
                        }
                    });
                }else if(typeof option.idField === 'object') {
                    try{
                        $field = $(option.idField);
                        $field.val(id).trigger('change');
                    }catch(e){}
                }
            }
            if(option.cnField) {
                if(typeof option.cnField === 'string') {
                    try{
                        if(option.cnField.indexOf('#') > -1) {
                            $field = $(option.cnField);
                        }else {
                            $field = $('[name="' + option.cnField + '"]');
                        }
                        $field.val(name).trigger('change');
                    }catch(e){}
                }else if($.isArray(option.cnField) && option.cnField.length) {
                    $.each(option.cnField, function(i, field) {
                        if(typeof field === 'string') {
                            try{
                                if(field.indexOf('#') > -1) {
                                    $field = $(field);
                                }else {
                                    $field = $('[name="' + field + '"]');
                                }
                                $field.val(name).trigger('change');
                            }catch(e){}
                        }else if(typeof field === 'object') {
                            try{
                                $field = $(field);
                                $field.val(name).trigger('change');
                            }catch(e){}
                        }
                    });
                }else if(typeof option.cnField === 'object') {
                    try{
                        $field = $(option.cnField);
                        $field.val(name).trigger('change');
                    }catch(e){}
                }
            }
            if(option.loginField) {
                if(typeof option.loginField === 'string') {
                    try{
                        if(option.loginField.indexOf('#') > -1) {
                            $field = $(option.loginField);
                        }else {
                            $field = $('[name="' + option.loginField + '"]');
                        }
                        $field.val(login).trigger('change');
                    }catch(e){}
                }else if($.isArray(option.loginField) && option.loginField.length) {
                    $.each(option.loginField, function(i, field) {
                        if(typeof field === 'string') {
                            try{
                                if(field.indexOf('#') > -1) {
                                    $field = $(field);
                                }else {
                                    $field = $('[name="' + field + '"]');
                                }
                                $field.val(login).trigger('change');
                            }catch(e){}
                        }else if(typeof field === 'object') {
                            try{
                                $field = $(field);
                                $field.val(login).trigger('change');
                            }catch(e){}
                        }
                    });
                }else if(typeof option.loginField === 'object') {
                    try{
                        $field = $(option.loginField);
                        $field.val(login).trigger('change');
                    }catch(e){}
                }
            }
        },
        _fnShowChoiceData: function(option) {
            var $orgCheckedList = this.container.find('#org-checked-list'),
                checkedData = {},
                $idfield = null,
                $cnfield = null,
                $loginfield = null;
            if(option.idField) {
                if(typeof option.idField === 'string') {
                    if(option.idField.indexOf('#') > -1) {
                        $idfield = $(option.idField);
                    }else {
                        $idfield = $('[name="' + option.idField + '"]');
                    }
                }else if($.isArray(option.idField) && option.idField.length) {
                    if(typeof option.idField[0] === 'string') {
                        if(option.idField.indexOf('#') > -1) {
                            $idfield = $(option.idField[0]);
                        }else {
                            $idfield = $('[name="' + option.idField[0] + '"]');
                        }
                    }else if(typeof option.idField[0] === 'object') {
                        $idfield = $(option.idField[0]);
                    }
                }else if(typeof option.idField === 'object') {
                    $idfield = $(option.idField);
                }
            }
            if($idfield == null || !$idfield.length) {
                return ;
            }
            var ids = $idfield.val().replace(' ', '');
            if(ids) {
                if(option.cnField) {
                    if(typeof option.cnField === 'string') {
                        if(option.cnField.indexOf('#') > -1) {
                            $cnfield = $(option.cnField);
                        }else {
                            $cnfield = $('[name="' + option.cnField + '"]');
                        }
                    }else if($.isArray(option.cnField) && option.cnField.length) {
                        if(typeof option.cnField[0] === 'string') {
                            if(option.cnField.indexOf('#') > -1) {
                                $cnfield = $(option.cnField[0]);
                            }else {
                                $cnfield = $('[name="' + option.cnField[0] + '"]');
                            }
                        }else if(typeof option.cnField[0] === 'object') {
                            $cnfield = $(option.cnField[0]);
                        }
                    }else if(typeof option.cnField === 'object') {
                        $cnfield = $(option.cnField);
                    }
                }
                if($cnfield == null || !$cnfield.length) {
                    $cnfield = $idfield;
                }
                if(option.loginField) {
                    if(typeof option.loginField === 'string') {
                        if(option.loginField.indexOf('#') > -1) {
                            $loginfield = $(option.loginField);
                        }else {
                            $loginfield = $('[name="' + option.loginField + '"]');
                        }
                    }else if($.isArray(option.loginField) && option.loginField.length) {
                        if(typeof option.loginField[0] === 'string') {
                            if(option.loginField.indexOf('#') > -1) {
                                $loginfield = $(option.loginField[0]);
                            }else {
                                $loginfield = $('[name="' + option.loginField[0] + '"]');
                            }
                        }else if(typeof option.loginField[0] === 'object') {
                            $loginfield = $(option.loginField[0]);
                        }
                    }else if(typeof option.loginField === 'object') {
                        $loginfield = $(option.loginField);
                    }
                }
                var cns = $cnfield.val().replace(' ', ''),
                    logins = $loginfield && $loginfield.length ? $loginfield.val().replace(' ', '') : '';
                if(ids.lastIndexOf(option.concat) == ids.length - 1) {
                    ids = ids.substring(0, ids.length - 1);
                }
                if(cns && cns.lastIndexOf(option.concat) == cns.length - 1) {
                    cns = cns.substring(0, cns.length - 1);
                }
                if(logins && logins.lastIndexOf(option.concat) == logins.length - 1) {
                    logins = logins.substring(0, logins.length - 1);
                }
                var idArr = ids.split(option.concat),
                    cnArr = cns.split(option.concat),
                    loginArr = logins.split(option.concat);
                $.each(idArr, function(i, id) {
                    checkedData[id] = {
                        id: id,
                        name: cnArr[i],
                        login: loginArr.length <= i ? '' : loginArr[i]
                    };
                    var text = cnArr[i] + (cnArr[i].indexOf('(') == -1 ? tree.iconSkin(option.lang, id.substring(0, 1)) : ''),
                        $tag = $('<div title="' + text + '"><span id="' + id.replace(/~/g, '').replace(/\//g, '') + '" data-id="' + id + '" class="tag">' +
                            text + '<button type="button" class="close selectuser-remove-tag">×</button></span></div>');
                    $orgCheckedList.append($tag);
                });
                $orgCheckedList.data('org-checked-list', checkedData);
            }
        },
        _fnSortData: function() {
            $('.orgchecked-container').sortable().disableSelection();
        }
    };

    if(!$.horizon) {
        $.horizon = {};
    }

    $.horizon.selectUser = function(option) {
		 option = $.extend({}, $.horizon.selectUser.defaults, option);
	     SelectUser.init(option);
    };

    $.horizon.selectUser.defaults = {
        title: null,           //标题
        search: true,          //支持搜索
        idField: null,         //ID字段名称
        cnField: null,         //中文字段名称
        loginField: null,      //登录名字段名称, 只能选择人员时有效
        multiple: true,        //是否多选
        concat: ';',           //拼接符
        paging: true,          //待选择列表是否分页
        pageSize: 15,          //每页显示数量
        isFlow: false,         //流程使用
        /**
         *  流程定义列表
         *  @examples: flowDefines: {
                            others: [
                                {
                                    id: 'HZ28821856ef63420156ef6342a30035',
                                    name: '用户47(负责人)',
                                    title: '用户47(负责人)',
                                    iconSkin: 'U',
                                    userFromId: 'HZ28821856ef63420156ef6342a30035',
                                    userFromName: '测试部门1',
                                    userFromIconSkin: 'D'
                                }
                            ],
                            depts: [
                                {
                                    id: 'HZ28821856ef63420156ef6342a40057',
                                    name: '测试部门11',
                                    iconSkin: 'D',
                                    pid: 'defineDept'
                                },
                                {
                                    id: 'HZ28821856ef63420156ef6342a40060',
                                    name: '测试部门12',
                                    iconSkin: 'D',
                                    pid: 'defineDept'
                                }
                            ],
                            groups: [
                                {
                                    id: 'HZ28821856ef63420156ef6342a600e1',
                                    name: '测试群组0',
                                    iconSkin: 'G',
                                    pid: 'defineGroup'
                                },
                                {
                                    id: 'HZ28821856ef63420156ef6342a700e7',
                                    name: '测试群组1',
                                    iconSkin: 'G',
                                    pid: 'defineGroup'
                                }
                            ],
                            positions: [
                                {
                                    id: 'HZ28821856ef63420156ef6342a700eb',
                                    name: '测试岗位0',
                                    iconSkin: 'P',
                                    pid: 'definePosition'
                                },
                                {
                                    id: 'HZ28821856ef63420156ef6342a700f1',
                                    name: '测试岗位1',
                                    iconSkin: 'P',
                                    pid: 'definePosition'
                                }
                            ],
                            roles: [
                                {
                                    id: 'aa',
                                    name: 'aaa',
                                    iconSkin: 'R',
                                    pid: 'defineRole'
                                },
                                {
                                    id: 'bb',
                                    name: 'bbb',
                                    iconSkin: 'R',
                                    pid: 'defineRole'
                                }
                            ]
                        }
         * */
        flowDefines: null,
        
        auth: false,           //是否开启权限过滤

        dept: true,            //是否显示部门树, 取值范围[true, false, '部门ID']
        position: true,        //是否显示岗位树, 取值范围[true, false, 'inDept', '岗位ID']
        group: true,           //是否显示群组树, 取值范围[true, false, '群组ID']
        role: false,           //是否显示角色树, 取值范围[true, false, '角色ID']

        //展开选中树节点参数只有一个有效, 如下面四个参数全部设置为true, 只展开并选中部门
        openDept: false,       //是否展开选中部门树, 取值范围[true, false, '部门ID']
        openPosition: false,   //是否展开选中岗位树, 取值范围[true, false, '岗位ID'], position为inDept时无效
        openGroup: false,      //是否展开选中群组树, 取值范围[true, false, '群组ID']
        openRole: false,       //是否展开选中角色树, 取值范围[true, false, '角色ID']

        selectDept: true,      //是否允许选择部门
        selectPosition: true,  //是否允许选择岗位
        selectGroup: true,     //是否允许选择群组
        selectRole: false,     //是否允许选择角色
        selectUser: true,      //是否允许选择人
        subUserLevel: -1,      //包含几级子部门人员,值为0时包含所有下级部门人员,为1向下包含1级，以此类推

        showIcon: {
            dept: false,       //是否显示部门图标
            position: false,   //是否显示岗位图标
            group: false,      //是否显示群组图标
            role: false,       //是否显示角色图标
            user: false        //是否显示用户图标
        },

        //获取orgTree数据的请求路径
        orgTreeSource: horizon.tools.formatUrl('/horizon/selectuser/treedata'),
        //获取orgTree数据的请求路径
        selectTreeSource: horizon.tools.formatUrl('/horizon/selectuser/select/nodedata'),
        //搜索的请求路径
        searchSource: horizon.tools.formatUrl('/horizon/selectuser/searchdata'),
        //请求参数
        otherParam: null,
        //语言对象
        lang: {
            defaultTitle: '请选择',
            user: '用户',
            dept: '部门',
            group: '群组',
            position: '岗位',
            role: '角色',
            flowDefines: '流程定义列表',
            depts: '部门列表',
            groups: '群组列表',
            positions: '岗位列表',
            roles: '角色列表',
            loading: '加载中...',
            search: '搜索',
            clickSearch: '点击搜索',
            org: '组织机构',
            selected: '已选择',
            deleteAll: '全删',
            select: '请选择',
            close: '关闭',
            ok: '确定',
            first: '首页',
            last: '尾页',
            previous: '上一页',
            next: '下一页'
        },

        /**
         * 返回数据方法
         * */
        fnBackData: null,

        // callbacks
        /**
         * 打开窗口事件
         * */
        fnOpen: null,
        /**
         * 关闭窗口前事件
         * */
        fnBeforeClose: null,
        /**
         * 关闭窗口事件
         * */
        fnClose: null
    };
}));
    