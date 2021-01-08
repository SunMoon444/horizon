/**
 * 应用字典
 * @author yw
 */
(function (factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonSelectuser',
            'jqueryValidateAll', 'jqueryForm'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var urls ={
        dictionaryTree:horizon.paths.apppath + '/horizon/manager/dict/tree.wf',
        save:horizon.paths.apppath+'/horizon/manager/dict/save.wf',
        info:horizon.paths.apppath+'/horizon/manager/dict/info.wf',
        validate:horizon.paths.apppath+'/horizon/manager/dict/sql/check.wf',
        checkCode:horizon.paths.apppath+'/horizon/manager/dict/code/check.wf',
        checkName:horizon.paths.apppath+'/horizon/manager/dict/name/check.wf',
        checkValue:horizon.paths.apppath+'/horizon/manager/dict/value/check.wf',
        findDataSource:horizon.paths.apppath+'/horizon/manager/dict/datasource.wf'
    };
    var _height = {
        outerHeight: function() {
            var _height = $(window).height()
                - parseInt($('.page-content').css('paddingTop')) * 2;
            _height -= !$('.page-header').hasClass('hidden') ? $('.page-header').outerHeight(true) : 0;
            var $body = $('body');
            if($body.attr('data-layout') != 'left' && $body.attr('data-layout') != 'left-hoversubmenu') {
                _height -= ($('#sidebar').css('visibility') != 'hidden'?$('#sidebar').outerHeight(true):0);
            }
            if(!$body.hasClass('embed')) {
                _height -= $('#navbar').outerHeight(true);
            }
            return _height;
        },
        tableHeight:function(){
            var height =  _height.outerHeight();
            if(height<_height.outerHeight()/2){
                height = _height.outerHeight()/2;
            }
            return height;
        }
    };
    //右侧字典树
    var dictionaryTree = {
        nodeId:'',
        setting: {
            async: {
                url:urls.dictionaryTree,
                enable: true,
                dataType: "json",
                type:"post",
                otherParam:{
                    dictType:"application"
                }
            },
            data : {
                simpleData : {
                    enable : true,
                    pIdKey : "pid"
                }
            },
            view: {
                dblClickExpand: false,
                showIcon: false,
                showLine: false
            },
            callback: {
                onClick: function(event, treeId, treeNode, clickFlag) {
                    operate.openTree(treeNode.name);
                    var tree = $.fn.zTree.getZTreeObj("dictionary-tree");
                    var node = tree.getNodeByParam("id", treeNode.id);
                    tree.selectNode(node, false);// 指定选中ID的节点
                    if (treeNode.open) {
                        tree.expandNode(node, false, false);// 指定选中ID节点折叠
                    } else {
                        tree.expandNode(node, true, false);// 指定选中ID节点展开
                    }
                    $('input[name="category"]').val(treeNode.name);
                    if(treeNode.id != "root_node_id"){
                        showView.showDictionaryChildrenList(treeNode.id,treeNode.pid);
                    }else{
                        showView.showDictionaryList();
                    }
                },
                onAsyncSuccess: function(event, treeId, treeNode, msg){
                    var tree = $.fn.zTree.getZTreeObj("dictionary-tree");
                    var result = new Array();
                    result  =  operate.getAllLeafNodes(tree.getNodes()[0],result);
                    var resultSize = result.length;
                    for (var i = 0; i < resultSize; i++) {
                        if(result[i].level!=2) {
                            tree.removeNode(result[i]);
                        }
                    }
                    var node = tree.getNodeByParam("id",dictionaryTree.nodeId);
                    tree.selectNode(node,false);//指定选中ID的节点
                    tree.expandNode(node, true, false);//指定选中ID节点展开
                }
            }
        },
        init: function(option) {
            dictionaryTree.nodeId=option;
            var $orgTree = $('#dictionary-tree');
            $.fn.zTree.init($orgTree, dictionaryTree.setting);
        }
    };
    //选择上级字典
    var selectParentDict = {
        currentId:"",
        nodeId:"",
        setting: {
            async: {
                url:urls.dictionaryTree,
                enable: true,
                dataType: "json",
                type:"post",
                open:"true",
                otherParam:{
                    dictType:"application"
                }
            },
            data : {
                simpleData : {
                    enable : true,
                    pIdKey : "pid"
                }
            },
            view: {
                dblClickExpand: false,
                showIcon: false,
                showLine: false
            },
            callback: {
                onClick: function(event, treeId, treeNode, clickFlag) {
                    var id=treeNode.id;
                    var name=treeNode.name;
                    if(id!=name){
                        if(id!="root_node_id"){
                            $("#dictCategory").addClass("hidden");
                        }else{
                            $("#dictCategory").removeClass("hidden");
                        }
                        $('input[name="parentId"]').val(id);
                        $('input[name="parentName"]').val(name);
                        $("#parentName").dropdown('toggle');
                    }
                },
                onAsyncSuccess:function () {
                    var tree = $.fn.zTree.getZTreeObj("appDict-tree");
                    var node = tree.getNodeByParam("id",selectParentDict.nodeId);
                    tree.selectNode(node, false);// 指定选中ID的节点
                    tree.expandNode(node, true, false);// 指定选中ID节点展开
                    $('#sysDict-tree').attr("style","display:block;");
                    if(selectParentDict.currentId != "") {
                        var currentNode = tree.getNodeByParam("id", selectParentDict.currentId);
                        tree.removeNode(currentNode);
                    }
                }
            }
        },
        init: function(option,currentId) {
            var $orgTree = $('#appDict-tree');
            selectParentDict.nodeId = option;
            selectParentDict.currentId = currentId;
            $.fn.zTree.init($orgTree, selectParentDict.setting);
        }
    };
    var showView={
        showDictionaryList:function(){
            var viewUrl=horizon.paths.viewpath+"?viewId=HZ28868f5cf78721015cf7896bfc0064";
            $("#dictionaryList").attr("height",_height.tableHeight()).attr("src",viewUrl);
        },
        showDictionaryChildrenList:function(id,pid){
            var childrenUrl=horizon.paths.viewpath+"?viewId=HZ28868f5cf78fa5015cf7bdca9b00fe&parentId="+id;
            var categoryUrl=horizon.paths.viewpath+"?viewId=HZ28868f5cf78fa5015cf7bdca9b00fe&category="+id;
            if(pid == 'root_node_id'){
                //分类下显示字典
                if(id==horizon.lang['platform-dict']['noCategory']){
                    categoryUrl=horizon.paths.viewpath+"?viewId=HZ28868f5d81952e015d81a600780032";
                }
                $("#dictionaryList").attr("height",_height.tableHeight()).attr("src",categoryUrl);
            }else{
                //父级字典下显示子字典
                $("#dictionaryList").attr("height",_height.tableHeight()).attr("src",childrenUrl);
            }
        }
    };
    //字典信息
    var dictInfo={
        initInfo:function(id) {
            if(id!=null){
                $.ajax({
                    url: urls.info,
                    cache: false,
                    dataType: 'json',
                    data: {
                        "id": id
                    },
                    success: function(data) {
                        if(data){
                            var variableType = data.dictSql;
                            var $identifier = $('#dictionaryForm select[name="identifier"]');
                            $.each(data,function(i,key){
                                if(i=="identifier"){
                                    operate.getdataSourceList(key);
                                }else{
                                    $('#dictionaryForm input[type="text"][name="' + i + '"]').val(key);
                                    $('#dictionaryForm input[type="hidden"][name="' + i + '"]').val(key);
                                    $('#dictionaryForm textarea[name="' + i + '"]').val(key);
                                    $('#dictionaryForm select[name="' + i + '"]').val(key);
                                    if(i=="dictType"){
                                        if(key == "variable"){
                                            $('#getType').removeClass("hidden");
                                            $(".valid-sql").show();
                                            if(variableType==null || variableType==""){
                                                $('#dictionaryForm select[name="variableType"]').val("clazz");
                                                $('#clazzIden').removeClass("hidden");
                                                $('#iden').addClass("hidden");
                                            }else{
                                                $('#dictionaryForm select[name="variableType"]').val("datasource");
                                                $identifier.val(data.identifier);
                                                $('#clazzIden').addClass("hidden");
                                                $('#iden').removeClass("hidden");
                                                $('#variableSql').removeClass("hidden");
                                            }
                                        }else{
                                            $('#getType').addClass("hidden");
                                            $('#clazzIden').addClass("hidden");
                                            $('#iden').addClass("hidden");
                                            $('#variableSql').addClass("hidden");
                                            $(".valid-sql").hide();
                                        }
                                    }
                                }
                            });
                            $("input[type='radio'][name='active']").each(function(){
                                if($(this).val()==data.active){
                                    $(this).prop("checked",true);
                                }else{
                                    $(this).prop("checked",false);
                                }
                            });
                            $('input[type="hidden"][name="parentId"]').val(data.pid);
                        }else{
                            parent.horizon.notice.error(horizon.lang['platform-dict']['getInfoFailed']);
                        }
                    }
                });
            }
        }
    };
    var operate={
        checkForm:function() {
            $('#appDictForm').validate({
                rules: {
                    dictCode: {
                        remote:{
                            url:urls.checkCode,
                            cache: false,
                            data:{
                                dictCode: function() {
                                    return $('#appDictForm').find('input[name="dictCode"]').val();
                                },
                                id: function() {
                                    return $('#appDictForm').find('input[name="id"]').val();
                                }
                            }
                        }
                    },
                    dictName: {
                        remote: {
                            url: urls.checkName,
                            cache: false,
                            data: {
                                dictName: function () {
                                    return $('#appDictForm').find('input[name="dictName"]').val();
                                },
                                id: function () {
                                    return $('#appDictForm').find('input[name="id"]').val();
                                }
                            }
                        }
                    },
                    dictValue: {
                        remote: {
                            url: urls.checkValue,
                            cache: false,
                            data: {
                                dictName: function () {
                                    return $('#appDictForm').find('input[name="dictValue"]').val();
                                },
                                id: function () {
                                    return $('#appDictForm').find('input[name="id"]').val();
                                }
                            }
                        }
                    }

                },
                messages: {
                    dictCode: {
                        remote: horizon.lang['platform-dict']['dictCodingRepeat']
                    },
                    dictName: {
                        remote: horizon.lang['platform-dict']['dictNameRepeat']
                    },
                    dictValue: {
                        remote: horizon.lang['platform-dict']['dictValueRepeat']
                    }
                },
                focusInvalid: false,
                errorClass: 'help-block no-margin-bottom',
                highlight : function(e) {
                    $(e).closest('.form-group').addClass('has-error');
                },
                success : function(e) {
                    $(e).closest('.form-group').removeClass('has-error');
                    $(e).remove();
                },
                submitHandler: function (form) {
                    $(form).ajaxSubmit({
                        url: horizon.paths.apppath+'/horizon/manager/dict/save.wf',
                        dataType: 'json',
                        type: 'POST',
                        cache: false,
                        error: function() {
                            parent.horizon.notice.error(horizon.lang['message']['operateError']);
                        },
                        success: function(data) {
                            if(data.restype == "success") {
                                parent.horizon.notice.success(data.msg[0]);
                                $("#dictionaryList")[0].contentWindow.horizon.view.dataTable.fnDraw(true);
                                $('#dictionaryForm').dialog('close');
                            }else{
                                parent.horizon.notice.error(data.msg[0]);
                            }
                        }
                    });
                }
            });
        },
        //获取所有叶子节点
        getAllLeafNodes :function (treeNode, result) {
            if (treeNode.isParent) {
                var childrenNodes = treeNode.children;
                if (childrenNodes) {
                    for (var i = 0; i < childrenNodes.length; i++) {
                        if (!childrenNodes[i].isParent) {
                            result.push(childrenNodes[i]);
                        } else {
                            result = operate.getAllLeafNodes(childrenNodes[i], result);
                        }
                    }
                }
            } else {
                result.push(treeNode);
            }
            return result;
        },
        //选择上级字典
        parentDict:function(){
            $("input[name='parentName']").unbind(horizon.tools.clickEvent()).bind(horizon.tools.clickEvent(),function(){
                $("#appDict-tree").css("display","block;");
                var id = $("input[name='parentId']").val();
                var currentId = $("input[name='id']").val();
                selectParentDict.init(id,currentId);
            });
        },
        openForm:function(id){
            var node = operate.getTreeNode();
            $('input[type="hidden"][name="id"]').val("");
            var category = $('input[name="category"]').val();
            if(category == horizon.lang['platform-dict']['dictManager'] && node.id=="root_node_id"){
                category="";
            }else if(category == horizon.lang['platform-dict']['noCategory']){
                category="";
            }
            $('#appDictForm')[0].reset();
            $('input[name="category"]').val(category);
            $('#dictionaryForm select[name="identifier"]').html('');
            $('#dictionaryForm').dialog({
                width: $(window).width() > 750 ? '750' : 'auto',
                height: 'auto',
                maxHeight: $(window).height(),
                title: horizon.lang['platform-dict']['dictInfo'],
                closeText:horizon.lang['base']['close'],
                destroyAfterClose: true,
                open: function(){
                    $(".valid-sql").hide();
                },
                buttons: [
                    {
                        html:horizon.lang['platform-dict']['validateSql'],
                        "class" : "btn-primary valid-sql",
                        click: function() {
                            $.ajax({
                                url: urls.validate,
                                cache: false,
                                dataType:'json',
                                data:{sql:$("textarea[name='dictSql']").val(),identifier:$("#identifier option:selected").val()},
                                error: function(){
                                    parent.horizon.notice.error(horizon.lang['message']['operateError']);
                                },
                                success: function(data) {
                                    if(data.restype == "success") {
                                        parent.horizon.notice.success(data.msg[0]);
                                    }else{
                                        parent.horizon.notice.error(data.msg[0]);
                                    }
                                }
                            });
                        }
                    },
                    {
                        html:horizon.lang['base']['save'],
                        "class" : "btn-primary",
                        click: function() {
                            $('#appDictForm').submit();
                        }
                    }
                ],
                close:function(){
                    $('#dictType').val("static");
                    $('#variableSql').addClass("hidden");
                    $('#getType').addClass("hidden");
                    $("input[name='dictionaryName']").parent("div").parent().removeClass("has-error");
                    $("input[name='dictionaryCode']").parent("div").parent().removeClass("has-error");
                    $("input[name='dictionaryValue']").parent("div").parent().removeClass("has-error");
                    $('label[id*="-error"]').remove();
                    $('#dictionaryForm select[name="identifier"]').html('');
                    //初始化树，重新选择树节点
                    var url = $("#dictionaryList").attr("src");
                    var node = operate.getTreeNode();
                    if(url.indexOf("HZ28868f5cf78721015cf7896bfc0064")>0){
                        if(node.id==node.name){
                            node.id="root_node_id";
                        }
                    }
                    dictionaryTree.init(node.id);
                }
            });
            dictInfo.initInfo(id);
            $('#dictType').unbind("change").bind("change",function(){
                var dictType = $('#dictType').val();
                $('#dictionaryForm select[name="identifier"]').html('');
                if(dictType == "variable"){
                    $('#variableSql').removeClass("hidden");
                    $('#getType').removeClass("hidden");
                    $(".valid-sql").show();
                    $('#clazzIden').addClass("hidden");
                    $('#iden').removeClass("hidden");
                    $('#variableType').removeClass("hidden");
                    operate.getdataSourceList();
                }else{
                    $('#variableSql').addClass("hidden");
                    $('#getType').addClass("hidden");
                    $(".valid-sql").hide();
                    $('#clazzIden').addClass("hidden");
                    $('#iden').addClass("hidden");
                    $('#variableType').addClass("hidden");
                }
            });
            $('#variableType').unbind("change").bind("change",function(){
                var variableType = $('#variableType').val();
                $('#dictionaryForm select[name="identifier"]').html('');
                if(variableType == "clazz"){
                    $('#clazzIden').removeClass("hidden");
                    $('#variableSql').addClass("hidden");
                    $('#iden').addClass("hidden");
                    $(".valid-sql").hide();
                }else{
                    $('#clazzIden').addClass("hidden");
                    $('#variableSql').removeClass("hidden");
                    $(".valid-sql").show();
                    $('#iden').removeClass("hidden");
                    operate.getdataSourceList();
                }
            });

        },
        getdataSourceList:function(key){
            var $identifier = $('#identifier');
            //获取数据源
            $.ajax({
                url: urls.findDataSource,
                cache: false,
                dataType: 'json',
                success: function(data) {
                    if(data){
                        var $option = $('<option value="' + data.identifier + '">' + data.identifier + '</option>');
                        $identifier.append($option);
                        $identifier.find("option[value = '"+data.identifier+"']").attr("selected","selected");
                        $.each(data.dataSourceList,function(i,item){
                            if(item.identifier!=data.identifier){
                                var $option = $('<option value="' + item.identifier + '">' + item.identifier + '</option>');
                                $identifier.append($option);
                            }
                        });
                        for(var i=0; i<data.tenantIdentifier.length; i++){
                            if(data.tenantIdentifier[i]!=data.identifier){
                                var $option = $('<option value="' + data.tenantIdentifier[i] + '">'
                                    + data.tenantIdentifier[i] + '</option>');
                                $identifier.append($option);
                            }
                        };
                        if(key){
                            $('#identifier').find("option[value = '"+key+"']").attr("selected","selected");
                        }
                    }else{
                        parent.horizon.notice.error('获取数据源失败！');
                    }
                }
            });
        },
        getUrlParam: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg);  //匹配目标参数
            if (r != null) return unescape(r[2]); return null; //返回参数值
        },
        //定位树节点
        openTree:function(category){
            var tree = $.fn.zTree.getZTreeObj("dictionary-tree");
            var node = tree.getNodeByParam("name",category);
            tree.selectNode(node,false);//指定选中ID的节点
        },
        //拿到选中的树节点
        getTreeNode:function(){
            var tree = $.fn.zTree.getZTreeObj("dictionary-tree");
            var nodes = tree.getSelectedNodes();
            return nodes[0];
        },
        openStyle:function(){
            var node = operate.getTreeNode();
            if(typeof(node) != "undefined" && node.id!=node.name){
                $('input[name="parentName"]').attr("value",node.name);
                $('input[name="parentId"]').val(node.id);
            }else{
                $('input[name="parentName"]').attr("value",horizon.lang['platform-dict']['dictManager']);
                $('input[name="parentId"]').val("root_node_id");
            }
            if(typeof(node) != "undefined"){
                if(node.id=="root_node_id" || node.id==node.name){
                    $("#dictCategory").removeClass("hidden");
                }else{
                    $("#dictCategory").addClass("hidden")
                }
            }else {
                $('input[name="category"]').val("");
                $("#dictCategory").removeClass("hidden");
            }
            $('input[name="dictName"]').parent("div").addClass("has-error");
            $('input[name="dictClass"]').parent("div").addClass("has-error");
            $('input[name="dictCode"]').parent("div").addClass("has-error");
            $('input[name="dictValue"]').parent("div").addClass("has-error");
        },
        closeStyle:function(){
            var node = operate.getTreeNode();
            $('input[name="parentName"]').val(node.name);
            $('input[name="parentId"]').val(node.id);
            if(node.id=="root_node_id"){
                $("#dictCategory").removeClass("hidden");
            }else{
                if(node.id==node.name){
                    $("#dictCategory").removeClass("hidden")
                    $('input[name="parentName"]').val(horizon.lang['platform-dict']['dictManager']);
                    $('input[name="parentId"]').val("root_node_id");
                }else{
                    $("#dictCategory").addClass("hidden");
                }
            }
            $('input[name="dictName"]').parent("div").removeClass("has-error");
            $('input[name="dictCode"]').parent("div").removeClass("has-error");
            $('input[name="dictClass"]').parent("div").removeClass("has-error");
            $('input[name="dictValue"]').parent("div").removeClass("has-error");
        }
    };
    //drop下拉框点击设置默认不关闭
    var  dropTree={
        onClickDom:	function () {
            var $content = $(".select-tree");
            if($content.data('ace_scroll')) {
                $content.ace_scroll('update', {'size': 200})
                    .ace_scroll('enable')
                    .ace_scroll('reset');
            }else {
                $content.on('click', function(e) {
                    e.stopPropagation();
                }).ace_scroll({
                    size: 200,
                    reset: true,
                    mouseWheelLock: true,
                    observeContent: true
                });
            }
        }
    };
    return horizon.manager['dictionary'] = {
        init:function(){
            dropTree.onClickDom();
            operate.parentDict();
            dictionaryTree.init("root_node_id");
            showView.showDictionaryList();
            operate.checkForm();
        },
        treeReload:dictionaryTree.init,
        openForm:operate.openForm,
        openTree:operate.openTree,
        openStyle:operate.openStyle,
        closeStyle:operate.closeStyle,
        getTreeNode: operate.getTreeNode
    };
}));