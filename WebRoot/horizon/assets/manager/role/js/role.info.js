/**
 * 角色信息
 * @author chengll
 */
(function(factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonSelectuser','horizonTable','jqueryValidateAll','ztree'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
	"use strict";
    var overflowHidden = horizon.vars.oldIE ? '' : 'overflow-hidden';

    var heights = {
        outer: function() {
            var _height = horizon.tools.getPageContentHeight(),
                $pageHeader = $('.page-header');
            if($pageHeader.css('display') != 'none') {
                _height -= $pageHeader.outerHeight(true);
            }
            return _height;
        },
        tabContent:function() {
            var $hTab = roleInfo.container.find('.horizon-tab'),
                $tab = $hTab.children('.tab'),
                $tabContent = $hTab.children('.tab-content');
            return this.outer() - $tab.outerHeight(true)
                - parseInt($tabContent.css('paddingTop'))
                - parseInt($tabContent.css('paddingBottom'));
        },
        tree: function() {
            var $authOperate = roleInfo.container.find('.auth-operate'),
                $tabContent = $authOperate.next().find('.tab-content');
            return this.tabContent()
                - $authOperate.outerHeight(true)
                - parseInt($tabContent.css('paddingBottom'));
        }
    };
    var $back,
        clickEvent = horizon.tools.clickEvent();
    //基础信息
    var role = {
        url: {
            saveAuth: horizon.paths.apppath + '/horizon/manager/role/permissions/change/permissions.wf',
            authCheck: horizon.paths.apppath + '/horizon/manager/role/permissions/auth/check.wf',
            tree: horizon.paths.apppath + '/horizon/manager/role/permissions/resource/tree.wf',
            page: horizon.paths.apppath + '/horizon/manager/role/page.wf',
            info: horizon.paths.apppath + '/horizon/manager/role/info.wf',
            save: horizon.paths.apppath + '/horizon/manager/role/save.wf',
            checkCode: horizon.paths.apppath +'/horizon/manager/role/check/code.wf',
            delRole: horizon.paths.apppath + '/horizon/manager/role/delete.wf',
            findParent: horizon.paths.apppath +'/horizon/manager/role/find/parent.wf',
            roleUsers: horizon.paths.viewpath + '?viewId=HZ2881155d0b9a6d015d0c5414460032&roleId='
        },
        clazz: null,
        clazzInfo: {
            'public_user': horizon.lang['platform-role']['classPublicUser'],
            'system_manager': horizon.lang['platform-role']['classSystemManager'],
            'check_administrator': horizon.lang['platform-role']['classCheckAdministrator'],
            'safe_administrator': horizon.lang['platform-role']['classSafeAdministrator'],
            'business_administrator': horizon.lang['platform-role']['classBusinessAdministrator'],
            'app_role': horizon.lang['platform-role']['classAppRole']
        },
        toggle: function() {
            roleList.container.toggleClass('hidden');
            roleInfo.container.toggleClass('hidden')
                .find('.horizon-tab > .tab > .active, .horizon-tab > .tab-content > .tab-pane.active')
                .removeClass('active in');
            roleList.hzTable.pluginTable.fnAdjustColumnSizing(false);
            $back.toggleClass('hidden');
            $(window).trigger('resize.dataTable');
        }
    };
    //角色信息
    var roleInfo = {
        container: null,
        init: function() {
            var info = this;
            info.container = $('#roleInfo');
            roleForm.init();
            roleAuth.init();
            info.container.off()
                .on('shown.bs.tab', '[data-toggle="tab"]', function(ev) {
                	$(window).trigger('resize.role-container');
                    var $this = $(ev.target),
                        roleData = info.container.data('role');
                    if(!$this.is($(this))) return ;
                    var $tabPane = $($(ev.target).attr('data-target')),
                        dataPane = $tabPane.attr('data-pane'),
                        dataRoleId = $tabPane.attr('data-role');
                    if($this.closest('ul').hasClass('dropdown-menu')) {
                        $this.parent().siblings().removeClass('active')
                            .closest('.auth-group').find('.btn > span').html($this.html());
                        var $collapse = $tabPane.closest('[data-pane="authInfo"]')
                            .find('.auth-operate [data-action="collapse"]');
                        if(dataPane == 'app') {
                            $collapse.addClass('hidden');
                        }else {
                            $collapse.removeClass('hidden');
                        }
                    }
                    if(roleData && roleData.id == dataRoleId) return;
                    $tabPane.attr('data-role', (roleData ? roleData.id : ''));
                    if(dataPane == 'baseInfo') {
                        roleForm.reset();
                        if(roleData){
                            $(".has-error").find('label[id*="-error"]').remove();
                            $(".form-group").removeClass("has-error");
                        }else{
                            $('[required="true"]').parent().addClass('has-error');
                        }
                        roleForm.setForm(roleData);
                    }else if(dataPane == 'userInfo') {
                        var $iframe = $tabPane.children('iframe');
                        $iframe[0].src = role.url.roleUsers + roleData.id;
                    }else if(dataPane == 'authInfo') {
                        $tabPane.find('.auth-group a[data-toggle="tab"]').first()
                            .removeClass('active').trigger('click.bs.tab.data-api');
                    }else {
                        roleAuth.load($tabPane);
                    }
                })
                .on('mouseover', '.ztree', function() {
                    var $this = $(this);
                    if(!$this.hasClass('showIcon')) {
                        $this.addClass('showIcon');
                    }
                })
                .on('mouseout', '.ztree',  function() {
                    $(this).removeClass('showIcon');
                })
                .on(clickEvent, '.ztree .auth-input', function() {
                    var $this = $(this);
                    var callback = function() {
                        var name = $this.attr('name'),
                            checked = $this.prop('checked'),
                            $tree = $this.closest('.ztree'),
                            $zTreeObj =  $.fn.zTree.getZTreeObj($tree.attr('id')),
                            tId = $this.closest('.auth').attr('id').replace('_auth', ''),
                            treeNode = $zTreeObj.getNodeByTId(tId),
                            ids = treeNode.level != 0 ? [treeNode.id] : [],
                            type = $tree.closest('.tab-pane').attr('data-pane'),
                            checkVal = checked ? '1' : '-1'; 
                        if(roleAuth.tree.auth.check && checked && treeNode.level != 0 && (type != 'org' || (type == 'org' && treeNode.level !== 1))) {
                            checkVal = '0';
                            $this.attr('disabled', 'disabled');
                        }                        
                        treeNode[name] = checkVal;
                        //模块树非访问权限的二级及以下级别节点不做子节点级联
                        if(treeNode.isParent && !(type == 'module' && name != 'visit' && treeNode.level != 0)) {
                            roleAuth.tree.auth.childrenCK(ids, name, checked, treeNode.children, $tree);
                        }
                        //访问权限级联父级节点
                        if(name == 'visit') {
                            roleAuth.tree.auth.parentCK(ids, name, checked, treeNode, $tree);
                        }
                        if(type == 'org') {
                        	if(treeNode.id.charAt(0) == 'G') {
                        		type = 'group';
                        	}else if(treeNode.id.charAt(0) == 'D') {
                        		type = 'dept';
                        	}else if(treeNode.id.charAt(0) == 'R') {
                        		type = 'role';
                        	}
                        }
                        var bizType = roleAuth['bizType'][type];
                        if(ids.length != 0) { 
                        	roleAuth.tree.auth.save(ids.join(';'), name, bizType, checked);
                        }
                    };
                    if(roleAuth.tree.auth.check == null) {
                        roleAuth.tree.auth.getCheck(callback);
                    }else {
                        callback();
                    }
                });
            $(window).trigger('resize.role-container');
        },
        show: function(data) {
            var cacheData = this.container.data('role'),
                $tab = this.container.find('.horizon-tab > .tab > li > a');
            if(cacheData && cacheData == data) {
                $tab.first().trigger('click.bs.tab.data-api');
                return;
            }
            if(data) {
                this.container.data('role', data);
                $tab.filter(':gt(0)').attr({
                    'data-toggle': 'tab'
                }).removeAttr('disabled').removeAttr('style');
            }else {
                this.container.removeData('role');
                $("input[name='roleName']").val("");
                $("input[name='roleCode']").val("");
                $("input[name='simpleName']").val("");
                $tab.filter(':gt(0)').attr({
                    disabled: 'disabled',
                    'data-toggle': 'not-allowed'
                }).css({
                    color: '#ccc',
                    cursor: 'not-allowed'
                });
            }
            $tab.first().trigger('click.bs.tab.data-api');
        }
    };
    //表单
    var roleForm = {
        $form: null,
        validForm: null,
        init: function() {
            this.$form = $('#roleForm');
            this.validate();
        },
        reset: function() {
            var form = this;
            form.validForm.resetForm();
            form.$form.find('input:hidden').val('').end()
                .find('[required="true"]').parent().addClass('has-error');
            setTimeout(function() {
                form.setData(roleInfo.container.data('role'));
            }, 1);
        },
        validate: function() {
            var form = this;
            return form.validForm = form.$form.validate({
                rules: {
                    roleCode: {
                        remote:{
                            url: role.url.checkCode,
                            cache: false,
                            data: {
                                roleCode: function() {
                                    return form.$form.find('input[name="roleCode"]').val();
                                },
                                id: function() {
                                    return form.$form.find('input[name="id"]').val();
                                }
                            }
                        }
                    }
                },
                messages: {
                    roleCode: {
                        remote: horizon.lang["platform-role"]["roleCodeExists"]
                    }
                },
                errorClass: 'help-block no-margin-bottom',
                focusInvalid: false,
                highlight: function (e) {
                    $(e).closest('.form-group').addClass('has-error');
                },
                success: function (e) {
                    $(e).closest('.form-group').removeClass('has-error');
                    $(e).remove();
                },
                submitHandler: function (){
                    form.save();
                }
            });
        },
        save: function() {
            var formData = this.$form.serializeArray();
            $.ajax({
                url: role.url.save,
                dataType: 'json',
                type: 'post',
                cache: false,
                data: formData,
                error: function() {
                    horizon.notice.error(horizon.lang["message"]["operateError"]);
                },
                success: function(data) {
                    if(data['restype'] == 'success') {
                        horizon.notice.success(data['msg'][0]);
                        roleList.hzTable.reload();
                        role.toggle();
                    }else {
                        horizon.notice.error(data['msg']);
                    }
                }
            });
        },
        setParentRole: function(roleId, callback) {
            var $parentId = this.$form.find('select[name="parentId"]');
            $parentId.children().filter(':gt(0)').remove();
            if(!role.clazz) {
                horizon.notice.error(horizon.lang["platform-role"]["noClass"]);
            }else{
                $.ajax({
                    data:{
                        type: role.clazz,
                        roleId: roleId
                    },
                    url: role.url.findParent,
                    cache: false,
                    dataType: 'json',
                    error: function() {
                        horizon.notice.error(horizon.lang["message"]["operateError"]);
                    },
                    success: function(data) {
                        if(data) {
                            $.each(data, function(i, item) {
                                var $option = $('<option value="' + item.id + '">' + item.roleName + '</option>');
                                $parentId.append($option);
                            });
                            callback();
                        }else{
                            horizon.notice.error(data['msg']);
                        }
                    }
                });
            }
        },
        setData: function(data) {
            var form = this;
            if(typeof(data) != "undefined"){
            	$("button[type='reset']").hide();
            }else{
            	$("button[type='reset']").show();
            }
            $.each(data || {
                roleClass: role.clazz
            }, function(key, value) {
                var $ele = form.$form.find('[name="' + key + '"]');
                $ele.val(value);
                if($ele.attr('required') == 'true' && value) {
                    $ele.closest('.has-error').removeClass('has-error');
                }
                if(key == 'roleClass') {
                    $ele.next().val(role.clazzInfo[value]);
                }
            });
        },
        setForm: function(data) {
            var form = this,
                roleId = data ? data.id : '';
            form.setParentRole(roleId, function() {
                form.setData(data);
            });
        }
    };
    //权限
    var roleAuth = {
        init: function() {
            var auth = this;
            roleInfo.container.find('#reload').on(clickEvent, function() {
                auth.operate.refresh();
            });
            roleInfo.container.find('.auth-operate [data-action="refresh"]').on(clickEvent, function() {
                auth.operate.refresh();
            });
            roleInfo.container.find('.auth-operate [data-action="collapse"]').on(clickEvent, function() {
                var $this = $(this),
                    $icon = $this.children('i'),
                    $text = $this.children('span'),
                    collapse = $this.attr('data-collapse');
                $icon.removeClass($this.attr('data-icon-' + collapse));
                if(collapse == 'collapse') {
                    collapse = 'collapsed';
                }else {
                    collapse = 'collapse';
                }
                $icon.addClass($this.attr('data-icon-' + collapse));
                $text.html($this.attr('data-text-' + collapse));
                $this.attr('data-collapse', collapse);
                auth.operate.expandAll(collapse);
            });
            //应用空间权限多选框选择
            roleInfo.container.find('[data-pane="app"] .btn').on(clickEvent, function() {
                var $this = $(this),
                    $input = $this.children(),
                    checked = !$input.prop('checked'),
                    resAuth = $input.val();
                auth.tree.auth.save('app_space', resAuth, auth.bizType['app'], checked);
                if(checked) {
                    var callback = function() {
                        if(roleAuth.tree.auth.check) {
                            $this.attr('disabled', 'disabled');
                        }
                    };
                    if(roleAuth.tree.auth.check == null) {
                        roleAuth.tree.auth.getCheck(callback);
                    }else {
                        callback();
                    }
                }
            });
        },
        bizType: {
            app: 'TENANTOPER',
            org: 'ORG',
            dept:'ORGOPER',
            group:'WORKGROUPOPER',
            role:'ROLEOPER',
            sysMenu: 'ADMINMENUOPER',
            appMenu: 'USERMENUOPER',
            module: 'MODULEOPER',
            rootFlow: 'FLOWOPER'
        },
        operate: {
            refresh: function() {
                var $tabPane = roleInfo.container.find('[data-pane="authInfo"]').find('.tab-pane.active');
                roleAuth.load($tabPane);
            },
            expandAll: function(collapse) {
                var $tabPane = roleInfo.container.find('[data-pane="authInfo"]').find('.tab-pane.active'),
                    zTreeObj = $.fn.zTree.getZTreeObj($tabPane.find('.ztree').attr('id'));
                roleAuth.tree.setting.callback.beforeExpand();
                zTreeObj.expandAll(collapse == 'collapse');
                setTimeout(function() {
                    roleAuth.tree.setting.callback.onExpand();
                }, 200);
            }
        },
        load: function($container) {
            var dataPane = $container.attr('data-pane');
            if(dataPane == 'app') {
                this.tenant(dataPane, $container);
            }else {
                this.tree.init(dataPane, $container);
            }
        },
        tenant: function(type, $container) {
            var roleData = roleInfo.container.data('role');
            $.ajax({
                data: {
                    roleId: roleData.id,
                    bizType: this.bizType[type],
                    resId: type
                },
                cache:false,
                url: role.url.tree,
                dataType: 'json',
                success: function(data) {
                    if(data) {
                        var result = data[0],
                            $btn = $container.find('.btn');
                        $btn.removeAttr('disabled').removeClass('active');
                        if(result.isDisabled == '0') {
                            $btn.attr('disabled', 'disabled');
                        }else {
                            $btn.each(function() {
                                var $this = $(this),
                                    $input = $this.children('input'),
                                    name = $input.attr('name');
                                if(result[name] == '0') {
                                    $this.attr('disabled', 'disabled');
                                }else if(result[name] == '1') {
                                    $this.addClass('active');
                                    $input.prop('checked', true);
                                }
                            });
                        }
                    }else {
                        horizon.notice.error(horizon.lang["message"]["getDataFailed"]);
                    }
                }
            });
        },
        tree: {
            auth: {
                //是否开启审核
                check: null,
                getCheck: function(callback) {
                    var auth = this;
                    $.ajax({
                        url: role.url.authCheck,
                        dataType: 'json',
                        success: function(data) {
                            auth.check = data['msg'] == '1';
                            if(callback) {
                                callback();
                            }
                        }
                    });
                },
                lang: {
                    visit: horizon.lang["platform-role"]["authVisit"],
                    manage: horizon.lang["platform-role"]["authManage"],
                    design: horizon.lang["platform-role"]["authDesign"],
                    grant: horizon.lang["platform-role"]["authSelectGrant"]
                },
                group: {
                    org: ['manage', 'grant'],
                    sysMenu: ['visit', 'manage', 'grant'],
                    appMenu: ['visit', 'manage', 'grant'],
                    module: ['visit', 'design', 'grant'],
                    rootFlow: ['visit','design', 'grant']
                },
                childrenCK: function(ids, name, checked, nodes, $tree) {
                    var auth = this,
                        type = $tree.closest('.tab-pane').attr('data-pane');
                    $.each(nodes, function(i, child) {
                        var $sub = $tree.find('#' + child.tId + '_auth input[name="' + name + '"]'),
                            checkVal = checked ? '1' : '-1';
                        if(roleAuth.tree.auth.check) {
                        	if($sub.attr('disabled')!='disabled' && child[name]!='1'){
                        		checkVal = '0';
                        	}
                        }
                        if(child[name] != checkVal) {
                        	if(!$sub.prop('disabled')&& child.isDisabled!='0'){
                        		ids.push(child.id);
                        		}
                        }
                        if($sub.attr('disabled')!='disabled'){
                        	 if(child.isDisabled!='0'){
                        		 child[name] = checkVal;
                        		 $sub.prop('checked', checked);
                            }
                        }
                        if(roleAuth.tree.auth.check && checked) {
                        	if($sub.attr('disabled')!='disabled' && child[name]!='1'){
                                $sub.attr('disabled', 'disabled');
                        	}
                        }
                        //模块树非访问权限的二级及以下级别节点不做子节点级联
                        if(child.isParent && !(type == 'module' && name != 'visit')) {
                            auth.childrenCK(ids, name, checked, child.children, $tree);
                        }
                    });
                },
                moduleChildren: function(nodes) {
                	var auth = this;
                    $.each(nodes, function(i, child) {
                    	child['isDisabled'] = '0';
                    	if(child.children) {
                    		auth.moduleChildren(child.children);
                        }
                    });
                },
                parentCK: function(ids, name, checked, node, $tree) {
                    var auth = this,
                        parentNode = node.getParentNode();
                    if(parentNode) {
                        var $parent = $tree.find('#' + parentNode.tId + '_auth input[name="' + name + '"]'),
                            checkVal = checked ? '1' : '-1';
                        if(checked && parentNode.level !== 0) {
                            if(!$parent.prop('checked')){
                                var type = $tree.closest('.tab-pane').attr('data-pane');
                                if(roleAuth.tree.auth.check && (type != 'org' || (type == 'org' && parentNode.level !== 1))) {
                                    checkVal = '0';
                                    $parent.attr('disabled', 'disabled');
                                }
                                if(parentNode[name] != checkVal) {
                                    ids.push(parentNode.id);
                                }
                                parentNode[name] = checkVal;
                                $parent.prop('checked', checked);
                                auth.parentCK(ids, name, checked, parentNode, $tree);
                            }
                        }else if(parentNode.level === 0) {
                            parentNode[name] = '-1';
                            $parent.prop('checked', false);
                        }
                    }
                },
                getDomObj: function(type, treeNode) {
                    var auth = this,
                        $authGroup = $('<span id="' + treeNode.tId + '_auth" class="auth pull-right"></span>'),
                        $labelTls = $('<label class="inline">' +
                            '<input type="checkbox" class="ace auth-input"/>' +
                            '<span class="lbl middle"></span></label>');
                    $.each(auth.group[type], function(i, _type) {
                        var $label = $labelTls.clone(),
                            prop = {},
                            sClass = '';
                        
                        if(type == 'module' && _type != 'visit' && $.inArray(treeNode.level, [0, 1]) == -1) {
                            prop = {
                                disabled: 'disabled'
                            };
                            sClass = 'grey';
                        }else {
                            prop = {
                                name: _type,
                                checked: treeNode[_type] !='' && treeNode[_type] != '-1'
                            };
                            if(treeNode[_type] == '0' || treeNode['isDisabled'] == '0') {
                                prop['disabled'] = 'disabled';
                                sClass = 'grey';
                            }
                            
                        }
                        $label.addClass(sClass)
                            .children('.auth-input').prop(prop)
                            .siblings('span').html(' ' + auth.lang[_type] + ' ');
                        $authGroup.append($label);
                    });
                    return $authGroup;
                },
                addAuthDom: function(treeId, treeNode) {
                    var $switchObj = $('#' + treeNode.tId + '_switch'),
                        $treeA = $('#' + treeNode.tId + '_a'),
                        $icoObj = $('#' + treeNode.tId + '_ico'),
                        $tree = $.fn.zTree.getZTreeObj(treeId),
                        type = $tree.setting.async.otherParam.resId;
                    if(type == 'module' && treeNode['isDisabled'] == '0' && treeNode.children) {
                    	roleAuth.tree.auth.moduleChildren(treeNode.children);
                    }
                    $switchObj.remove();
                    $icoObj.before($switchObj);
                    $treeA.append(roleAuth.tree.auth.getDomObj(type, treeNode));
                },
                save: function(ids, resAuth, bizType, checked) {
                    var roleData = roleInfo.container.data('role');
                    horizon.notice.loading(horizon.lang["message"]["saving"]);
                    $.ajax({
                        type: 'POST',
                        data: {
                            roleId: roleData.id,
                            resAuth: resAuth.toUpperCase(),
                            treeIds: ids,
                            bizType: bizType,
                            checked: checked
                        },
                        cache: false,
                        url: role.url.saveAuth,
                        dataType: 'json',
                        success: function(data) {
                            if(data['restype'] == 'err') {
                                horizon.notice.error(data['msg']);
                            }else {
                                horizon.notice.closeAll();
                            }
                        }
                    });
                }
            },
            setting: {
                view: {
                    showLine: false,
                    showIcon: false,
                    selectedMulti: false,
                    dblClickExpand: false
                },
                async: {
                    url: role.url.tree,
                    enable: true,
                    dataType: 'json',
                    type: 'post'
                },
                data : {
                    simpleData: {
                        enable: true,
                        pIdKey: 'pid'
                    }
                },
                callback: {
                	onClick: function(event, treeId, treeNode) {
                		var $tabPane = roleInfo.container.find('[data-pane="authInfo"]').find('.tab-pane.active').attr("data-pane"),
                            tree = $.fn.zTree.getZTreeObj($tabPane);
     					tree.selectNode(treeNode);
                        if(!($(event.target).hasClass('auth-input') || $(event.target).prev().hasClass('auth-input'))) {
                            tree.expandNode(treeNode, null, false, true, true);
                        }
                	},
                    beforeCollapse: function() {
                        $('body').addClass(overflowHidden);
                    },
                    beforeExpand: function() {
                        $('body').addClass(overflowHidden);
                    },
                    onCollapse: function() {
                        $(window).trigger('resize.role-container');
                    },
                    onExpand: function() {
                        $(window).trigger('resize.role-container');
                    }
                }
            },
            init: function(type, $container) {
                var roleData = roleInfo.container.data('role'),
                    setting = $.extend(true, {}, this.setting, {
                        view: {
                            addDiyDom: this.auth.addAuthDom
                        },
                        async: {
                            otherParam:{
                                roleId: roleData.id,
                                resId: type
                            }
                        }
                    });
                $.fn.zTree.init($container.find('.ztree'), setting);
            }
        }
    };
    //角色列表
    var roleList = {
        container: null,
        hzTable: null,
        init: function() {
            var list = this;
            list.container = $('#roleList');
            list.hzTable = list.container.find('.table').horizonTable({
                settings: {
                    title: horizon.lang["platform-role"]["tableTitle"],
                    multipleSearchable : true,
                    height: heights.outer,
                    checkbox: 0,
                    columns: [
                        {
                            dataProp : 'id'
                        },
                        {
                            name : 'roleName',
                            title : horizon.lang["platform-role"]["roleName"],
                            width : '200px',
                            searchable : true,
                            multipleSearchable : true,
                            orderable : true,
                            fnClick : function() {
                                role.toggle();
                                roleInfo.show(arguments[2]);
                            }
                        },
                        {
                            name : 'roleCode',
                            title : horizon.lang["platform-role"]["roleCode"],
                            width : '200px',
                            searchable : true,
                            orderable : true,
                            multipleSearchable : true
                        },
                        {
                            name : 'simpleName',
                            title : horizon.lang["platform-role"]["simpleName"],
                            width : '200px',
                            orderable : true,
                            searchable : false
                        }
                        ,
                        {
                            name : 'created',
                            title : horizon.lang["platform-role"]["columnsCreated"],
                            width : '350px',
                            orderable : true,
                            searchable : false
                        }
                    ],
                    buttons:[
                        {
                            id: 'add',
                            text: horizon.lang["base"]["add"],
                            icon: 'fa fa-plus green',
                            fnClick: function() {
                                role.toggle();
                                roleInfo.show();
                            }
                        },
                        {
                            id: 'delete',
                            text: horizon.lang["base"]["delete"],
                            icon: 'fa fa-times red2',
                            fnClick: function() {
                                var ids = list.hzTable.checkRowKeyArray;
                                if(!ids.length) {
                                    horizon.notice.error(horizon.lang["message"]["deleteHelp"]);
                                }else {
                                    $('<div></div>').dialog({
                                        closeText: horizon.lang["base"]["close"],
                                        title: horizon.lang["message"]["title"],
                                        dialogText: horizon.lang["message"]["deleteConfirm"],
                                        dialogTextType: 'alert-danger',
                                        buttons: [
                                            {
                                                html: horizon.lang["base"]["ok"],
                                                'class': 'btn btn-primary btn-xs',
                                                click: function() {
                                                    list.hzTable.showProcessing();
                                                    list.deleteRoles(ids.join(';'));
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
                ajaxDataSource: role.url.page,
                ajaxDataParam: {
                    roleClass: role.clazz
                }
            });
        },
        deleteRoles: function(roles) {
            var list = this;
            $.ajax({
                data: {
                    ids : roles
                },
                url: role.url.delRole,
                cache: false,
                dataType: 'json',
                error: function() {
                    list.hzTable.hideProcessing();
                    horizon.notice.error(horizon.lang["message"]["operateError"]);
                },
                success: function(data) {
                    list.hzTable.hideProcessing();
                    if(data['restype'] == 'success') {
                        horizon.notice.success(data['msg'][0]);
                        list.hzTable.reload();
                    }else {
                        horizon.notice.error(data['msg'][0]);
                    }
                }
            });
        }
    };
    if(!(horizon.vars.ios || horizon.vars.android)) {
        var timer;
        $(window).off('resize.role-container')
            .on('resize.role-container', function() {
                if(roleInfo.container) {
                    window.clearTimeout(timer);
                    var $body = $('body');
                    $body.addClass(overflowHidden);
                    timer = setTimeout(function() {
                        roleInfo.container.find('iframe').height(heights.tabContent());
                        var $content = roleInfo.container.find('.ztree').closest('.tab-pane'),
                            size = heights.tree();
                        if(horizon.vars.oldIE) {
                            $content.css('overflow', 'auto').height(size);
                        }else {
                            if($content.data('ace_scroll')) {
                                $content.ace_scroll('update', {'size': size})
                                    .ace_scroll('enable')
                                    .ace_scroll('reset');
                            }else {
                                $content.ace_scroll({
                                    size: size,
                                    reset: true,
                                    mouseWheelLock: true,
                                    'observeContent': true
                                });
                            }
                        }
                        $body.removeClass(overflowHidden);
                    }, 20);
                }
            });
    }
    return horizon.manager['role'] = {
        init: function() {
            role.clazz = horizon.tools.getPageParam('roleClass');
            $back = $('[data-action="back"]').on(clickEvent, function() {
                role.toggle();
            });
            roleList.init();
            roleInfo.init();
        }
    };
}));
