/**
 * Created by zhouwf on 2015-4-17.
 * 生成高级查询内容及分组内容
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        var arr = [
            'jquery',
            'laydate',
            'fueluxTree',
            'elementsTreeview',
            'chosenJquery',
            'horizonSelectuser',
            'elementsScroller'
        ];
        define(arr, factory);
    }
    else {
        throw new Error('view.element.init error');
    }
})(function($, laydate) {
    "use strict";

    laydate.path = horizon.paths.pluginpath + '/laydate/';

    var viewElement = $.element = {
            /**
             * 生成高级查询内容方法
             * */
            initAdvancedSearchElementByDataType: function(info, container){
                if(info.dataType == '3' || info.dataType == '7') { // 日期, 日期时间
                    ele.addDateRangePickerDom(info, container, info.dataType == '7');
                }else if(info.dataType == '19' || info.dataType == '28' || info.dataType == '29'
                    || info.dataType == '25' || info.dataType == '22' || info.dataType == '2'){//下拉框
                    //19：下拉框name 28:下拉框value 29:下拉框id 2:字典name 22: 字典id 25: 字典value
                    ele.addSelectDom(info, container);
                }else if(info.dataType == '32' || info.dataType == '6' || info.dataType == '5'
                    || info.dataType == '30' || info.dataType == '31' || info.dataType == '51'){
                    //32:部门ID 6:部门name 5：用户name 30: 用户ID 31：用户LOGIN
                    ele.addOrgDom(info, container);
                }else if(info.dataType == '9' || info.dataType == '26' || info.dataType == '27'){
                    //9:单选多选框name 26:单选多选框value 27:单选多选框id
                    ele.addRadioOrCheckbox(info, container);
                }else{//文本框
                    ele.addTextDom(info, container);
                }
            },
            /**
             * 生成分组内容方法
             * */
            initGroupElementByField: function(container){
                horizon.tools.use(horizon.paths.pluginpath + '/chosen/css/chosen.css');
                if(horizon.view.defaultViewOptions.grouptype == '1'){
                    var groupArr = horizon.view.defaultViewOptions.groupfield.split(';');
                    $.each(groupArr, function(i){
                        ele.addGroupSelectDom(groupArr[i], container);
                    });
                }else if(horizon.view.defaultViewOptions.grouptype == '0'){
                    $.each(horizon.view.defaultViewOptions.multipleGroupField, function(i, group){
                        if(group.parentGroupid == null || group.parentGroupid == '') {
                            ele.addMultipleGroupDom(group, container);
                        }
                    });
                }
            }
        },
        /**
         * 生成DOM
         * */
        ele = {
            //文本框
            addTextDom: function(info, container){
                var $obj = $("<div class=\"form-group col-sm-4 col-md-3 no-padding\">" +
                    "<label class=\"col-sm-4 control-label no-padding-left no-padding-right\" title=\"" + info.sTitle + "\">" + info.sTitle + ":</label>" +
                    "<div class=\"col-sm-8\">" +
                    "<input class=\"col-sm-12 no-margin\" data-placeholder=\"请输入\" name=\"" + info.sName + "\" data-type=\"" + info.dataType + "\" type=\"text\"/>" +
                    "</div>" +
                    "</div>");
                container.append($obj);
            },
            //单选多选框
            addRadioOrCheckbox: function(info, container){
                var $obj = $("<div class=\"form-group col-sm-4 col-md-3 no-padding\">" +
                    "<label class=\"col-sm-4 control-label no-padding-left no-padding-right\" title=\"" + info.sTitle + "\">" + info.sTitle + ":</label>" +
                    "<div class=\"col-sm-8\">" +
                    "<div class=\"padding-4 no-padding-bottom no-padding-left no-padding-right\">" +
                    "</div></div></div>");
                container.append($obj);
                $.ajax({
                    url: horizon.paths.apppath + '/dict/getDictInfo.wf',
                    dataType: 'json',
                    data: {
                        dictId: info.dictId
                    },
                    success: function(data){
                        if(data != null && data.length > 0){
                            $.each(data, function(i, dict){
                                //9:单选多选框name 26:单选多选框value 27:单选多选框id
                                var inputValue = info.dataType == '9'?dict.dict_name:(info.dataType == '27'?dict.id:dict.dict_value);
                                var _html = '<label class="inline margin-5 no-margin-left no-margin-top">' +
                                    '<input type="' + (info.selectType == '0'?'radio':'checkbox') + '" value="' + inputValue + '" class="ace" name="' + info.sName + '" data-type="' + info.dataType + '" />' +
                                    '<span class="lbl"> ' + dict.dict_name + ' </span>' +
                                    '</label>' ;
                                $obj.children('div').children('div').append($(_html));
                            });
                        }
                    }
                });
            },
            //用户/部门
            addOrgDom: function(info, container){
                var $obj = $("<div class=\"form-group col-sm-4 col-md-3 no-padding\">" +
                    "<label class=\"col-sm-4 control-label no-padding-left no-padding-right\" title=\"" + info.sTitle + "\">" + info.sTitle + ":</label>" +
                    "<div class=\"col-sm-8\">" +
                    "<input class=\"col-sm-12 no-margin\" readonly data-placeholder=\"请输入\" name=\"T_" + info.sName + "\" data-type=\"" + info.dataType + "\" type=\"text\">" +
                    "<input name=\"T_" + info.sName + "_ID\" type=\"hidden\"/>" +
                    "<input name=\"" + info.sName + "\" type=\"hidden\"/>" +
                    "</div>" +
                    "</div>");
                horizon.tools.use(horizon.paths.pluginpath + '/ztree/css/zTreeStyle/zTreeStyle.css');
                init.initOrgDom($obj, info, container);
            },
            //下拉框
            addSelectDom: function(info, container){
                //19：下拉框name 28:下拉框value 29:下拉框id
                var $obj = $('<div class="form-group col-sm-4 col-md-3 no-padding">' +
                    '<label class="col-sm-4 control-label no-padding-left no-padding-right" title="' + info.sTitle + '">' + info.sTitle + ':</label>' +
                    '<div class="col-sm-8">' +
                    '<select class="chosen-select form-control" ' + (info.selectType == '0'?'':'multiple="" ') + ' data-placeholder="请选择" name="' + info.sName + '" data-type="' + info.dataType + '">' +
                    (info.selectType == '0'?'<option value=""></option>' : '') +
                    '</select>' +
                    '</div>' +
                    '</div>');
                container.append($obj);
                horizon.tools.use(horizon.paths.pluginpath + '/chosen/css/chosen.css');
                $.ajax({
                    url: horizon.paths.apppath + '/dict/getDictInfo.wf',
                    dataType: 'json',
                    data: {
                        dictId: info.dictId
                    },
                    success: function(data){
                        if(data != null && data.length > 0){
                            $.each(data, function(i, dict){
                                var optionValue = dict['dict_value'];
                                if(info.dataType == '19' || info.dataType == '2'){
                                    optionValue = dict['dict_name'];
                                }else if(info.dataType == '29' || info.dataType == '22'){
                                    optionValue = dict['id'];
                                }
                                var $option = $('<option value="' + optionValue + '">' + dict.dict_name + '</option>');
                                $obj.find('select').append($option);
                            });
                        }
                        $obj.find('select').chosen({
                            allow_single_deselect: true,
                            no_results_text: '未找到选项'
                        });
                    }
                });
            },
            //日期类型2(一个文本框放两个日期值)
            addDateRangePickerDom: function(info, container, showTimePicker){
                var $obj = $("<div class=\"form-group col-sm-4 col-md-3 no-padding\">" +
                    "<label class=\"col-sm-4 control-label no-padding-left no-padding-right\" title=\"" + info.sTitle + "\">" + info.sTitle + ":</label>" +
                    "<div class=\"col-sm-8\">" +
                    "<input class=\"col-sm-12 no-margin\" name=\"" + info.sName + "\" data-type=\"" + info.dataType + "\" type=\"text\">" +
                    "</div>" +
                    "</div>");
                init.initDateRangePickerDom($obj, container, showTimePicker);
            },
            //分组下拉框
            addGroupSelectDom: function(fieldName, container){
                var $obj = $('<select class="chosen-select form-control" data-placeholder="请选择" name="' + fieldName + '_group">' +
                    '<option value=""></option></select>');
                container.append($obj);
                $.ajax({
                    url: horizon.paths.apppath + '/horizon/view/getViewSingleGroupOptions.wf' + window.location.search,
                    data: {
                        fieldName: fieldName,
                        viewId: horizon.view.viewId
                    },
                    dataType: 'json',
                    cache: false,
                    success: function(data){
                        $.each(data, function(i, con){
                            var str= con[fieldName.toLowerCase().split('.')[fieldName.split('.').length -1]];
                            var $option = $("<option value=\"" + str + "\">" + (str == 'VIEW_GROUP_VALUE_EMPTY' ? '空' : str) + "</option>");
                            $obj.append($option);
                        });
                        init.initGroupSelectDom($obj);
                    }
                });
            },
            //多级分组
            addMultipleGroupDom: function(group, container) {
                var $obj = $('<div class="dropdown-hover pull-left multipleGroupDiv">' +
                    '<button class="horizon-btn btn btn-default btn-sm">' + group.queryName + '<i class="ace-icon fa fa-angle-down icon-on-right bigger-110"></i></button>'+
                    '<ul class="dropdown-menu dropdown-menu-left dropdown-caret">'+
                    '<li class="dropdown-header center">' + group.queryName + '</li>' +
                    '<li class="dropdown-content">'+
                    '<div style="padding: 0px 5px;"><ul class="groupTree" id="' + group.id + '"></ul></div>'+
                    '</li>'+
                    '<li class="dropdown-footer center"><a href="#nogo">清除</a></li>'+
                    '</ul>'+
                    '</div>');
                container.append($obj);
                multipleGroupInfo.multipleGroupFields[group.id] = [];
                multipleGroupInfo.multipleGroupFieldValues[group.id] = [];
                multipleGroupInfo.multipleGroupIdArr.push(group.id);
                init.initMultipleGroupDom($obj, group);
            }
        },

        /**
         * 初始化DOM控件
         * */
        init = {
            initOrgDom: function($obj, info, container){
                $obj.find('input[name="T_' + info.sName + '"]').bind('click', function(){
                    var objName = info.sName,
                        dataOrg = info.dataType;
                    var option = {
                        idField: ['T_' + objName + '_ID'],
                        cnField: ['T_' + objName],
                        loginField: []
                    };
                    if(dataOrg == '32' || dataOrg == '30' || dataOrg == '51') {
                        //32:部门ID  30: 用户ID  51:组织机构
                        option.idField.push(objName);
                    }else if(dataOrg == '6' || dataOrg == '5') {
                        //6:部门name  5：用户name
                        option.cnField.push(objName);
                    }else if(dataOrg == '31') {
                        //31：用户LOGIN
                        option.loginField.push(objName);
                    }
                    if(dataOrg == '32' || dataOrg == '6') {
                        //部门
                        $.extend(option, {
                            dept: true,
                            position: false,
                            group: false,
                            role: false,
                            selectDept: true,
                            selectPosition: false,
                            selectGroup: false,
                            selectUser: false
                        });
                    }else if(dataOrg == '5' || dataOrg == '30' || dataOrg == '31') {
                        //用户
                        $.extend(option, {
                            selectDept: false,
                            selectPosition: false,
                            selectGroup: false,
                            selectRole: false,
                            selectUser: true
                        });
                    }
                    if(info.selectType == '0') { //单选
                        option['multiple'] = false;
                    }
                    $.horizon.selectUser(option);
                });
                container.append($obj);
            },
            initDateRangePickerDom: function($obj, container, showTimePicker) {
                var opt = {
                    elem: $obj.find('input')[0],
                    theme: 'horizon',
                    range: '~'
                };
                if(horizon.vars.lang == 'en') {
                    opt.lang = 'en';
                }
                if(showTimePicker) {
                    opt.type = 'datetime';
                    opt.format = 'yyyy-MM-dd HH:mm';
                }
                laydate.render(opt);
                container.append($obj);
            },
            initGroupSelectDom: function($obj){
                $obj.unbind().bind('change', function(){
                    var aoServerParams = horizon.view.dataTable.fnSettings().aoServerParams;
                    aoServerParams.push({
                        "fn": function(aoData){
                            $('div.dataTables_operator_toolbox').find('select').each(function(){
                                var $this = $(this);
                                aoData.push({
                                    "name": $this.prop('name'),
                                    "value": $this.val()
                                });
                            });
                        }
                    });
                    horizon.view.dataTable.fnDraw();
                });
                $obj.chosen({
                    allow_single_deselect: true,
                    no_results_text: '未找到选项',
                    width: '200px'
                });
            },
            initMultipleGroupDom: function($obj, group) {
                $obj.find('#'+group.id).ace_tree({
                    dataSource: function (options, callback, $cur) {
                        if(!('parentFieldNames' in options)){
                            var parentFieldNameArr = [], parentTextArr = [];
                            $cur.parents('.tree-branch').each(function() {
                                var $data = $(this).data();
                                if($data.dataType == 'item'){
                                    parentFieldNameArr.push($data.fieldName);
                                    parentTextArr.push($data.value);
                                }
                            });//所有上级节点
                            $cur.data('parentFieldNames', parentFieldNameArr.join(';'));
                            $cur.data('parentTexts', parentTextArr.join(';'));
                            options['parentFieldNames'] = parentFieldNameArr.join(';');
                            options['parentTexts'] = parentTextArr.join(';');
                        }
                        //groupId:当前分组ID，fieldName：当前分组字段，text：当前分组选项值,
                        //dataType:节点值类型, parentFieldNames：上级分组字段名称， parentTexts：上级分组选项值
                        var groupId = '', fieldName = '', text = '', dataType = 'folder', parentFieldNames = '', parentTexts = '';
                        if ('type' in options && options['type' ] == 'folder' ) { //it has children
                            groupId = options['groupId'];
                            fieldName = options['fieldName'];
                            text = options['value'];
                            dataType = options['dataType'];
                            parentFieldNames = options['parentFieldNames'];
                            parentTexts = options['parentTexts'];
                        }else{
                            var group = horizon.view.defaultViewOptions.multipleGroupField[$('.groupTree').length-1];
                            fieldName = group.queryGroup;//分组字段
                            groupId = group.id;//分组ID
                        }
                        $.ajax({
                            url: horizon.paths.apppath + '/horizon/view/getViewMultipleGroupOptions.wf' + window.location.search,
                            data: {
                                groupId: groupId,
                                fieldName: fieldName,
                                text: text,
                                dataType: dataType,
                                parentFieldNames: parentFieldNames,
                                parentTexts: parentTexts,
                                viewId: horizon.view.viewId
                            },
                            type: 'post',
                            dataType: 'json' ,
                            cache: false,
                            success: function (data) {
                                for(var i = 0, iLen = data.length; i<iLen; i++) {
                                    if(data[i].text == 'VIEW_GROUP_VALUE_EMPTY') {
                                        data[i].text = '空';
                                        break;
                                    }
                                }
                                callback({ data: data });
                                $cur.closest('.ace-scroll').ace_scroll('reset');
                            }
                        });
                    },
                    multiSelect: false,
                    cacheItems: true,
                    'open-icon' : 'ace-icon tree-minus',
                    'close-icon' : 'ace-icon tree-plus',
                    'selectable' : true,
                    'selected-icon' : 'ace-icon fa fa-check',
                    'unselected-icon' : 'ace-icon fa fa-times',
                    loadingHTML : '<div class="tree-loading"><i class="ace-icon fa fa-refresh fa-spin blue"></i></div>'
                }).on('selected.fu.tree', function(e) {
                    multipleGroupInfo.selectedItem(arguments[1], 'selected', group.id);
                }).on('deselected.fu.tree', function(e) {
                    multipleGroupInfo.selectedItem(arguments[1], 'deselected', group.id);
                }).on('opened.fu.tree', function(e) {
                    multipleGroupInfo.checkMultipleGroupNode(arguments[1], 'opened', group.id);
                }).on('closed.fu.tree', function(e) {
                    multipleGroupInfo.checkMultipleGroupNode(arguments[1], 'closed', group.id);
                }).end().find('li.dropdown-footer > a').on('click', function(){
                    multipleGroupInfo.checkMultipleGroupNode({dataType: 'item'}, 'clear', group.id);
                    $obj.find('#'+group.id).find('.tree-branch')
                        .removeClass('tree-open')
                        .attr('aria-expanded', 'false')
                        .find('.tree-branch-children').addClass('hide')
                        .end()
                        .find('.icon-folder').removeClass('tree-minus').addClass('tree-plus');
                    $(this).blur();
                });
                $obj.find('#'+group.id).parent().ace_scroll({
                    size: 200
                });
            }
        },

        /**
         * 多级分组的节点点击方法
         * */
        multipleGroupInfo = {
            multipleGroupIdArr: [],
            multipleGroupFields: {},
            multipleGroupFieldValues: {},
            selectedItem: function(obj, type, groupId){
                var $el = obj.el;
                var parentFieldNameArr = [], parentTextArr = [];
                $el.parents('.tree-branch').each(function(){
                    var $data = $(this).data();
                    if($data.dataType == 'item'){
                        parentFieldNameArr.push($data.fieldName);
                        parentTextArr.push($data.value);
                    }
                });//所有上级节点
                obj.target['parentFieldNames'] = parentFieldNameArr.join(';');
                obj.target['parentTexts'] = parentTextArr.join(';');
                multipleGroupInfo.checkMultipleGroupNode(obj.target, type, groupId);
            },
            checkMultipleGroupNode: function(curNodeInfo, type, groupId) {
                if(curNodeInfo.dataType == 'item'){
                    if(type == 'opened' || type == 'closed' || type == 'clear'){
                        $('#' + groupId).find('.tree-item').removeClass('tree-selected');
                    }
                    var fieldArr = [], fieldValueArr = [];
                    if(type != 'clear' && type != 'deselected' && type != 'closed'){
                        fieldArr.push(curNodeInfo.fieldName);
                        fieldValueArr.push(curNodeInfo.value);
                        if(curNodeInfo.parentFieldNames != null && curNodeInfo.parentFieldNames != ''){
                            var parentFieldNameArr = curNodeInfo.parentFieldNames.split(';');
                            var parentFieldValueArr = curNodeInfo.parentTexts.split(';');
                            $.each(parentFieldNameArr, function(i){
                                fieldArr.push(parentFieldNameArr[i]);
                                fieldValueArr.push(parentFieldValueArr[i]);
                            });
                        }
                    }
                    multipleGroupInfo.multipleGroupFields[groupId] = fieldArr;
                    multipleGroupInfo.multipleGroupFieldValues[groupId] = fieldValueArr;
                    //查询表格数据
                    var aoServerParams = horizon.view.dataTable.fnSettings().aoServerParams;
                    aoServerParams.push({
                        "fn": function(aoData){
                            var multipleGroupFieldArr = [], multipleGroupFieldValueArr = [];
                            $.each(multipleGroupInfo.multipleGroupIdArr, function(i){
                                var groupid= multipleGroupInfo.multipleGroupIdArr[i];
                                if(multipleGroupInfo.multipleGroupFields[groupid] != null && multipleGroupInfo.multipleGroupFields[groupid].length > 0){
                                    multipleGroupFieldArr.push(multipleGroupInfo.multipleGroupFields[groupid].join(';'));
                                    multipleGroupFieldValueArr.push(multipleGroupInfo.multipleGroupFieldValues[groupid].join(';'));
                                }
                            });
                            aoData.push({
                                "name": 'multipleGroupFields',
                                "value": multipleGroupFieldArr.join(';')
                            });
                            aoData.push({
                                "name": 'multipleGroupFieldValues',
                                "value": multipleGroupFieldValueArr.join(';')
                            });
                        }
                    });
                    if(horizon.view.defaultViewOptions.isHaveCheckBox){
                        $("input[name='checkAll']")[0].checked = false;
                        horizon.view.checkIds = [];
                    }
                    horizon.view.dataTable.fnDraw(false);
                }
                $('#' + groupId).closest('.ace-scroll').ace_scroll('reset');
            }
        };
    return viewElement;
});

