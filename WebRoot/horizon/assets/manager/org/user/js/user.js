/**
 * 人员列表
 * @author yw
 */
(function (factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonSelectuser', 'jqueryValidateAll', 'jqueryForm', 'chosenJquery',
            'elementsFileinput','ztree'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    "use strict";
    var _height = {
        outerHeight: function() {
            var _height = horizon.tools.getPageContentHeight()-30;
            return _height;
        }
    };
    var urls = {
    	strongPwdAuth: horizon.paths.apppath + '/horizon/manager/org/user/strongPwdAuth/check.wf',
        save:horizon.paths.apppath+'/horizon/manager/org/user/save.wf',
        autoGeneration:horizon.paths.apppath+'/horizon/manager/org/user/password/generation.wf',
        deptTree:horizon.paths.apppath + '/horizon/manager/org/dept/tree.wf',
        selCancelUser:horizon.paths.apppath + '/horizon/manager/org/user/status/list.wf',
        posiTree: horizon.paths.apppath+'/horizon/manager/org/position/tree/by/deptid.wf',
        info:horizon.paths.apppath+'/horizon/manager/org/user/info.wf',
        upload:horizon.paths.apppath+'/horizon/template/formdata/uploadfile.wf',
        download:horizon.paths.apppath+'/horizon/template/formdata/downloadfile.wf?fileId=',
        validateDeptAuht:horizon.paths.apppath+'/horizon/manager/org/dept/validateDeptAuht.wf'
    };
    //打开视图
    var showView = {
        showUserList:function(deptId){
            if(deptId != null && deptId!="" && deptId!=undefined) {
                $.ajax({
                    url: urls.validateDeptAuht,
                    cache: false,
                    dataType: "json",
                    type: 'post',
                    data: {
                        deptId: deptId
                    },
                    err:function(){
                        horizon.notice.error(horizon.lang["message"]["operateError"]);
                    },
                    success:function(data){
                        if(data.restype=='success'){
                            var viewUrl = horizon.paths.viewpath+'?viewId=HZ28868f5ce93819015ced4a80c10065&service=allUserViewServiceImpl&deptId='+ deptId;
                            $("#userList").attr("height", _height.outerHeight()).attr("src", viewUrl);
                        }
                    }
                });
            }else{
                var viewUrl = horizon.paths.viewpath+"?viewId=HZ28868f5cc38cbf015cc392f90b0032";
                $("#userList").attr("height",_height.outerHeight()).attr("src",viewUrl);
            }
        }
    };
    //更新表单
    var updateFrom = {
        cleanFrom: function(){
            $('#myTab a:first').tab('show');
            $('#update_password').removeClass("hidden");
            $('#update_generator').removeClass("hidden");
            $('#userInfo').removeClass("hidden");
            $('#userListInfo').addClass("hidden");
            $('#addUserForm')[0].reset();
            $('label[id*="-error"]').remove();
            $('#addUserForm').find("input[type='hidden']").val('');
            $('#loginName').addClass("has-error");
            $('#userName').addClass("has-error");
            $('#deptName').addClass("has-error");
            $('#secret').addClass("has-error");
            $('#confirmPassword').addClass("has-error");
            $('#firstName').addClass("has-error");
            $(".profile-picture .remove").trigger("click");
            $("#autoPassword").remove();
            $(".remove").click(function(){
            	$("input[name='fileId']").val("");
            });
            $(document).find("input[name='sex']").each(function(){
                if($(this).val()=="0"){
                    $(this).prop("checked",true).parent().addClass("active").addClass("btn-primary");
                }else{
                    $(this).prop("checked",false).parent().removeClass("active").removeClass("btn-primary");
                }
            });
            $(document).find("input[name='active']").each(function(){
                if($(this).val()=="1"){
                    $(this).prop("checked",true).parent().addClass("active").addClass("btn-primary");
                }else{
                    $(this).prop("checked",false).parent().removeClass("active").removeClass("btn-primary");
                }
            });

        },
        openForm: function(obj){
        	$('#addUserForm')[0].reset();
            updateFrom.cleanFrom();
            $('#close').removeClass("hidden");
            $('#replacement').removeClass("hidden");
            $('input[name="loginName"]').removeAttr("readonly","true");
            $('#img').remove();
            $(".ace-file-container").removeClass("hide-placeholder");
            $(".ace-file-container").removeClass("selected");
            $(".ace-file-name").removeClass("large");
            $(".ace-file-name").attr('data-title','');
            if(obj!=null && obj.id!='dept_root' && obj.id!='allUser'){
            	$('input[name="deptId"]').val("D_"+obj.id);
                $('input[name="deptName"]').val(obj.name);
                $('#deptName').removeClass("has-error");
            }
        },
        updateForm: function(id){
            updateFrom.cleanFrom();
            $('#close').removeClass("hidden");
            $('#replacement').addClass("hidden");
            $('#update_password').addClass("hidden");
            $('#update_generator').addClass("hidden");
            $('input[name="loginName"]').attr("readonly","true");
            updateFrom.initInfo(id);
        },
        getTreeNodes:function(){
        	 var tree = parent.$.fn.zTree.getZTreeObj("dept-tree");
        	 return tree;
        },
        initInfo: function (id) {
            if(id != null){
                $(parent.document).find('.form-group').removeClass('has-error');
                $.ajax({
                    url: urls.info,
                    cache: false,
                    dataType: 'json',
                    data: {
                        "userId": id,"fieldName":"avatar"
                    },
                    error: function() {
                        parent.horizon.notice.error(horizon.lang["message"]["operateError"]);
                    },
                    success: function(data) {
                        if(data){
                            $.each(data,function(i,key){
                                if(i!="sex" && i!="active"){
                                    $(parent.document).find('#addUserForm input[name="' + i + '"]').val(key);
                                }
                                if(i=="certificate"){
                                    $(parent.document).find("select[name="+i+"] > option[value='"+key+"']").prop("selected","selected");
                                }
                                $(parent.document).find('#addUserForm textarea[name="'+i+'"]').val(key);
                            });
                            if(data.fileId){
                                var $container = $('input[name="avatar"]').next().addClass('hide-placeholder '),
                                    $fileName = $container.find('.ace-file-name').addClass('large').attr('data-title', ''),
                                    $img = $fileName.find('#img');
                                if(!$img.length) {
                                    $img = $('<img class="responsive middle" src="#" id="img"  width="134"height="145"/>');
                                    $img.insertBefore($fileName.children('.ace-icon'));
                                }
                                $img.removeClass("hidden");
                                $img.attr('src',urls.download+data.fileId);
                                $(".profile-picture").mouseover(function(){
                                    if($("#img").length){
                                        $(".ace-file-name").attr('data-title',horizon.lang["platform-user"]["clickToUpdate"]);
                                        $(".ace-file-container").addClass('selected');
                                    }
                                });
                                $(".profile-picture").mouseout(function(){
                                    $(".ace-file-name").attr('data-title','');
                                    $(".ace-file-container").removeClass('selected');
                                });

                            }else{
                                $("#img").remove();
                                var $container = $('input[name="avatar"]').next().removeClass('hide-placeholder');
                                $container.find('.ace-file-name').removeClass('large');
                            }
                            $(parent.document).find('input[name="password"]').val('123456789');
                            $(parent.document).find('input[name="confirmPassword"]').val('123456789');
                            $(parent.document).find("input[name='sex']").each(function(){
                                if($(this).val() == data.sex){
                                    $(this).prop("checked",true).parent().addClass("active").addClass("btn-primary");
                                }else{
                                    $(this).prop("checked",false).parent().removeClass("active").removeClass("btn-primary");
                                }
                            });
                            $(parent.document).find("input[name='active']").each(function(){
                                if($(this).val() == data.active){
                                    $(this).prop("checked",true).parent().addClass("active").addClass("btn-primary");
                                }else{
                                    $(this).prop("checked",false).parent().removeClass("active").removeClass("btn-primary");
                                }
                            });
                        }else{
                            parent.horizon.notice.error(horizon.lang["message"]["getInfoFailed"]);
                        }
                    }
                });
            }
        }
    };
    //部门树
    var deptTree = {
    	nodeId:"",
        setting: {
            async: {
                url:urls.deptTree,
                enable: true,
                dataType: "json",
                type:"post"
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
                beforeClick: function() {
                },
                onClick: function(event, treeId, treeNode, clickFlag) {
                    var tree = $.fn.zTree.getZTreeObj("dept-tree");
                    var node = tree.getNodeByParam("id",treeNode.id);
                    tree.selectNode(node,false);//指定选中ID的节点
                    if (treeNode.open) {
                        tree.expandNode(node, false, false);// 指定选中ID节点折叠
                    } else {
                        tree.expandNode(node, true, false);// 指定选中ID节点展开
                    }
                    if(treeNode.id == "dept_root"){
                        $('#userInfo').addClass("hidden");
                        $('#userListInfo').removeClass("hidden");
                        showView.showUserList();
                    }else if(treeNode.id == "allUser"){
                        $('#userInfo').addClass("hidden");
                        $('#userListInfo').removeClass("hidden");
                        showView.showUserList();
                    }else{
                        showView.showUserList(treeNode.id);
                        $('#userInfo').addClass("hidden");
                        $('#userListInfo').removeClass("hidden");
                        $('input[name="deptId"]').val(treeNode.id)
                        $('input[name="deptName"]').val(treeNode.name);
                    }
                    $('#close').addClass("hidden");
                },
                onAsyncSuccess: function(event, treeId, treeNode, msg){
                    var tree = $.fn.zTree.getZTreeObj("dept-tree");
                    var node = tree.getNodeByParam("id",deptTree.nodeId);
                    tree.selectNode(node,false);//指定选中ID的节点
                    tree.expandNode(node, true, false);//指定选中ID节点展开
                }
            }
        },
        init: function(option) {
            deptTree.nodeId=option;
            var $orgTree = $('#dept-tree');
            $orgTree = $.fn.zTree.init($orgTree, deptTree.setting);
            var nodes=[{id: "allUser", name:horizon.lang["platform-user"]["allUser"] , iconSkin: 'D', pid: ''}];
            $orgTree.addNodes(null, nodes);
        }
    };
    //表单事件
    var operate = {
            
        checkForm:function() {
            var $addUserForm = $("#addUserForm"),
                $password = $addUserForm.find('#password');
            $addUserForm.validate({
                ignore: '.ignore',
                errorClass: 'help-block no-margin-bottom',
                focusInvalid: false,
                highlight: function (e) {
                    $(e).closest('.form-group').addClass('has-error');
                },
                success: function (e) {
                    $(e).closest('.form-group').removeClass('has-error');
                    $(e).remove();
                },
                errorPlacement: function (error, element) {
                    var $formGroup = $(element).closest('.form-group');
                    if($formGroup.find('.help-block').length) return;
                    $formGroup.append(error);
                },
                rules: {
                    loginName:{
                        loginName:true
                    },
                    engName:{
                        engName:true
                    },
                    password: {
                        password:true,
                        remote: {
                            url: urls.strongPwdAuth,
                            cache: false,
                            data: {
                                strong :function() {
                                    return horizon.password.getStrong($password.val());
                                }
                            }
                        }
                    },
                    confirmPassword: {
                        equalTo:"#password"
                    },
                    firstName: {
                        checkName: true
                    },
                    givenName: {
                        checkName: true
                    },
                    certNo: {
                        isCardNo123: true
                    },
                    email: {
                        email: true
                    },
                    cellPhone: {
                        cellPhone: true
                    },
                    telephoneHome: {
                        telephoneHome: true
                    },
                    upload: {
                        upload: true
                    },
                    postCode: {
                        postCode: true
                    },
                    telephone: {
                        telephoneHome: true
                    }
                },
                messages: {
                    password: {
                        remote: horizon.lang["message"]["formatCheckPassword"]
                    },
                    confirmPassword:{
                        equalTo:horizon.lang["base"]["rePasswordError"]
                    }
                },
                submitHandler: function (form){
                    addUser(form);
                }
            });

            $password.on('change', function() {
                horizon.password.setStrong($addUserForm.find('.pwd-strong'), $(this).val());
            });

            //验证英文名
            jQuery.validator.addMethod('engName', function(value, element) {
                if(value != null && value != ''){
                    var tel = /^[a-zA-Z]*$/g;
                    return tel.test(value);
                }
                return true;
            }, horizon.lang["platform-user"]["formatEnglish"]);
            //验证用户账号
            jQuery.validator.addMethod('loginName', function(value, element) {
                if(value != null && value != ''){
                    var tel = /^[0-9a-zA-Z\_]+$/;
                    return tel.test(value);
                }
                return true;
            }, horizon.lang["platform-validator"]["formatName"]);
            //验证密码
            jQuery.validator.addMethod('password', function(value, element) {
                if(value != null && value != ''){
                    var tel = /^[a-zA-Z0-9]\w{5,24}$/;
                    return tel.test(value);
                }
                return true;
            }, horizon.lang["message"]["formatCheckPassword"]);
            //验证姓名
            jQuery.validator.addMethod('checkName', function(value, element) {
                if(value != null && value != ''){
                    var tel = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/;
                    return tel.test(value);
                }
                return true;
            },horizon.lang["platform-user"]["formatCheckUserName"]);
            // 身份证号码验证
            jQuery.validator.addMethod("isCardNo123", function(value, element) {
                if(value != null && value != ''){
                    return idCardNoUtil.checkIdCardNo(value);
                }
                return true;
            }, horizon.lang["platform-user"]["formatCheckCardNo"]);
            //验证手机号
            jQuery.validator.addMethod('cellPhone', function(value, element) {
                if(value != null && value != ''){
                    var tel = /^(((13[0-9]{1})|(17[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
                    return tel.test(value);
                }
                return true;
            },horizon.lang["platform-user"]["formatCheckCellphone"]);
            //家庭电话
            jQuery.validator.addMethod('telephoneHome', function(value, element) {
                if(value != null && value != ''){
                    var tel = /\d{3}-\d{8}|\d{4}-\d{7}/;

                    return tel.test(value);
                }
                return true;
            },horizon.lang["platform-user"]["formatCheckTelephone"]);
            //邮编
            jQuery.validator.addMethod('postCode', function(value, element) {
                if(value != null && value != ''){
                    var tel = /^[0-9]{6}$/;
                    return tel.test(value);
                }
                return true;
            }, horizon.lang["platform-user"]["formatCheckMail"]);
        }
    };
    function addUser(form){
        $(form).ajaxSubmit({
            url: urls.save,
            dataType: 'json',
            type: 'post',
            cache: false,
            data:{fieldName:"avatar"},
            error: function() {
                horizon.notice.error(horizon.lang["message"]["operateError"]);
            },
            success: function(data) {
                if(data.restype == 'success'){
                    horizon.notice.success(horizon.lang["message"]["saveSuccess"]);
                    pageOperate.pageReturn();
                    var nodes = updateFrom.getTreeNodes().getSelectedNodes();
                    if(nodes[0].id!='dept_root' && nodes[0].id!='allUser'){
                    	showView.showUserList(nodes[0].id);
                    }else{
                    	showView.showUserList();
                    }
                    deptTree.init(nodes[0].id);
                } else {
                    var message = "";
                    if(data.msg[0]=="1"){
                        message =horizon.lang["platform-user"]["loginNameSameError"];
                    }else if(data.msg[0]=="2") {
                        message = horizon.lang["platform-user"]["deptSameError"];
                    }else if(data.msg[0]=="3"){
                        message = horizon.lang["platform-user"]["positionSameError"];
                    }else if(data.msg[0]=="5"){
                        message = horizon.lang["platform-user"]["exceedLicenseNum"];
                    }else{
                        message = horizon.lang["message"]["saveFail"];
                    }
                    horizon.notice.error(message);
                }
            }
        });
    }

    function event() {
        //用户状态选择
        $('input[name="active"]').change(function(){
            var $this = $(this);
            $(document).find("input[name='active']").each(function(){
                if($(this).val()==$this.val()){
                    $(this).parent().addClass("btn-primary");
                }else{
                    $(this).parent().removeClass("btn-primary");
                }
            });
        });
        //用户性别选择
        $('input[name="sex"]').change(function(){
            var $this = $(this);
            $(document).find("input[name='sex']").each(function(){
                if($(this).val()==$this.val()){
                    $(this).parent().addClass("btn-primary");
                }else{
                    $(this).parent().removeClass("btn-primary");
                }
            });
        });
        //重置
        $("#replacement").bind(horizon.tools.clickEvent(),function() {
            updateFrom.cleanFrom();
            $('#replacement').removeClass("hidden");
            $('input[name="loginName"]').removeAttr("readonly","true");
        });
        //全部人员列表
        $("#allPersonnel").bind(horizon.tools.clickEvent(),function() {
            $('#userInfo').addClass("hidden");
            $('#userListInfo').removeClass("hidden");
            showView.showUserList();
        });
        //选择所属部门
        $('input[name="deptName"]').bind(horizon.tools.clickEvent(),function() {
            $.horizon.selectUser({
                idField: 'deptId',
                cnField: 'deptName',
                multiple: false,
                selectDept: true,
                selectUser:false,
                dept:true,
                position:false,
                group:false,
                selectPosition: false,
                selectGroup: false
            });
            $('input[name="workPost"]').val("");
            $('input[name="workPostName"]').val("");
        });
        //选择兼职部门
        $('input[name="otherDeptName"]').bind(horizon.tools.clickEvent(),function() {
            $.horizon.selectUser({
                idField: 'otherDeptId',
                cnField: 'otherDeptName',
                multiple: true,
                selectDept: true,
                selectUser:false,
                dept:true,
                position:false,
                group:false,
                selectPosition: false,
                selectGroup: false
            });
        });
        //选择岗位
        $('input[name="workPostName"]').bind(horizon.tools.clickEvent(),function() {
            $.horizon.selectUser({
                idField: 'workPost',
                cnField: 'workPostName',
                multiple: false,
                selectDept: false,
                selectUser:false,
                dept:false,
                position:true,
                group:false,
                selectPosition: true,
                selectGroup: false
            });
        });
        //选择兼职岗位
        $('input[name="ptWorkPostName"]').bind(horizon.tools.clickEvent(),function() {
            $.horizon.selectUser({
                idField: 'ptWorkPost',
                cnField: 'ptWorkPostName',
                multiple: true,
                selectDept: false,
                selectUser:false,
                dept:false,
                position:true,
                group:false,
                selectPosition: true,
                selectGroup: false
            });
        });
        //选择秘书
        $('input[name="secName"]').bind(horizon.tools.clickEvent(),function() {
            $.horizon.selectUser({
                idField: 'secId',
                cnField: 'secName',
                multiple: false,
                selectDept: false,
                selectPosition: false,
                selectGroup: false
            });
        });
        //选择群组
        $('input[name="workGroupName"]').bind(horizon.tools.clickEvent(),function() {
            $.horizon.selectUser({
                idField: 'workGroupId',
                cnField: 'workGroupName',
                multiple: false,
                selectDept: false,
                selectPosition: false,
                selectGroup: false
            });
        });
        $('select').chosen({
            allow_single_deselect: true,
            no_results_text: horizon.lang["platform-user"]["noSelectOption"]
        });
        //返回用户列表
        $("#close").click(function(){
            pageOperate.pageReturn();
        });
        //自动生成密码
        $("#autoGeneration").click(function(){
            //清空生成的密码
            var $this = $(this);
            $("#autoPassword").remove();
            $.ajax({
                url: urls.autoGeneration,
                cache: false,
                dataType: 'json',
                error: function() {
                    horizon.notice.error(horizon.lang["message"]["operateError"]);
                },
                success: function(data) {
                    if(data) {
                        var validator = $("#addUserForm").validate(),
                            $password = $('input[name="password"]'),
                            $confirmPassword = $('input[name="confirmPassword"]');
                        $password.val(data).trigger('change');
                        validator.element($password);
                        $confirmPassword.val(data);
                        validator.element($confirmPassword);
                        $this.parent().prev().append("<span id='autoPassword' class='green'> [ " + data + " ] </span>")
                    }else {
                        horizon.notice.error(horizon.lang["message"]["getInfoFailed"]);
                    }
                }
            });
        });
    }
    var pageOperate={
        //返回用户列表
        pageReturn:function(){
            $('#close').addClass("hidden");
            $('#userInfo').addClass("hidden");
            $('#baseInfo').addClass("in active");
            $('#workInfo').removeClass("in active");
            $('#userListInfo').removeClass("hidden");
        }
    };
    //头像上传
    var upload ={
        init:function(){
            $('input[name="avatar"]').ace_file_input({
                allowExt: ['jpg','png','bmp','gif','jpeg'],
                style:'well',
                btn_choose:horizon.lang["message"]["selectFile"],
                btn_change: '',
                no_icon:'ace-icon fa fa-picture-o',
                thumbnail: 'large',
                no_file: horizon.lang["message"]["selectFile"],
                droppable: true,
                maxSize: 1024*1024,
                upload: function($ele, files) {
                    $('#addUserForm').ajaxSubmit({
                        url : urls.upload,
                        dataType : 'json',
                        type : 'POST',
                        cache: false,
                        success : function(data) {
                            upload.setImg(data[0]['fileId']);
                        },
                        error: function() {
                            parent.horizon.notice.error(horizon.lang["message"]["operateError"]);
                        }
                    });
                }
            }).on('file.error.ace', function(event, info){
                if(info.error_count['ext'] || info.error_count['mime']){
                    parent.horizon.notice.error(horizon.lang["message"]["fileFormatError"]);
                }
                if(info.error_count['size']){
                    parent.horizon.notice.error(horizon.lang["message"]["fileSizeError"]);
                }
            });
        },
        setImg: function(fileId) {
            $("input[name='fileId']").val(fileId);
            var $container = $('input[name="avatar"]').next().addClass('hide-placeholder selected'),
                $fileName = $container.find('.ace-file-name').addClass('large').attr('data-title',  horizon.lang["platform-user"]["clickToUpdate"]),
                $img = $fileName.find('img');
            if(!$img.length) {
                $img = $('<img class="responsive middle" src="#" id="img" width="130"height="145"/>');
                $img.insertBefore($fileName.children('.ace-icon'));
            }
            $img[0].src = urls.download + fileId;
            $img.removeClass("hidden");
            $("#img").mouseover(function(){
                if($("#img").length){
                    $(".ace-file-name").attr('data-title',horizon.lang["platform-user"]["clickToUpdate"]);
                    $(".ace-file-container").addClass('selected');
                }
            });
            $(".profile-picture").mouseout(function(){
                $(".ace-file-name").attr('data-title','');
                $(".ace-file-container").removeClass('selected');
            });
        }
    };
    var idCardNoUtil = {
        provinceAndCitys: {11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",
            31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",
            45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",
            65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"},
        powers: ["7","9","10","5","8","4","2","1","6","3","7","9","10","5","8","4","2"],
        parityBit: ["1","0","X","9","8","7","6","5","4","3","2"],
        genders: {male:"男",female:"女"},
        checkAddressCode: function(addressCode){
            var check = /^[1-9]\d{5}$/.test(addressCode);
            if(!check) return false;
            if(idCardNoUtil.provinceAndCitys[parseInt(addressCode.substring(0,2))]){
                return true;
            }else{
                return false;
            }
        },
        checkBirthDayCode: function(birDayCode){
            var check = /^[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))$/.test(birDayCode);
            if(!check) return false;
            var yyyy = parseInt(birDayCode.substring(0,4),10);
            var mm = parseInt(birDayCode.substring(4,6),10);
            var dd = parseInt(birDayCode.substring(6),10);
            var xdata = new Date(yyyy,mm-1,dd);
            if(xdata > new Date()){
                return false;//生日不能大于当前日期
            }else if ( ( xdata.getFullYear() == yyyy ) && ( xdata.getMonth () == mm - 1 ) && ( xdata.getDate() == dd ) ){
                return true;
            }else{
                return false;
            }
        },
        getParityBit: function(idCardNo){
            var id17 = idCardNo.substring(0,17);

            var power = 0;
            for(var i=0;i<17;i++){
                power += parseInt(id17.charAt(i),10) * parseInt(idCardNoUtil.powers[i]);
            }
            var mod = power % 11;
            return idCardNoUtil.parityBit[mod];
        },
        checkParityBit: function(idCardNo){
            var parityBit = idCardNo.charAt(17).toUpperCase();
            if(idCardNoUtil.getParityBit(idCardNo) == parityBit){
                return true;
            }else{
                return false;
            }
        },
        checkIdCardNo: function(idCardNo){
            //15位和18位身份证号码的基本校验
            var check = /^\d{15}|(\d{17}(\d|x|X))$/.test(idCardNo);
            if(!check) return false;
            //判断长度为15位或18位
            if(idCardNo.length==15){
                return idCardNoUtil.check15IdCardNo(idCardNo);
            }else if(idCardNo.length==18){
                return idCardNoUtil.check18IdCardNo(idCardNo);
            }else{
                return false;
            }
        },
        //校验15位的身份证号码
        check15IdCardNo: function(idCardNo){
            //15位身份证号码的基本校验
            var check = /^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/.test(idCardNo);
            if(!check) return false;
            //校验地址码
            var addressCode = idCardNo.substring(0,6);
            check = idCardNoUtil.checkAddressCode(addressCode);
            if(!check) return false;
            var birDayCode = '19' + idCardNo.substring(6,12);
            //校验日期码
            return idCardNoUtil.checkBirthDayCode(birDayCode);
        },
        //校验18位的身份证号码
        check18IdCardNo: function(idCardNo){
            //18位身份证号码的基本格式校验
            var check = /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/.test(idCardNo);
            if(!check) return false;
            //校验地址码
            var addressCode = idCardNo.substring(0,6);
            check = idCardNoUtil.checkAddressCode(addressCode);
            if(!check) return false;
            //校验日期码
            var birDayCode = idCardNo.substring(6,14);
            check = idCardNoUtil.checkBirthDayCode(birDayCode);
            if(!check) return false;
            //验证校检码
            return idCardNoUtil.checkParityBit(idCardNo);
        }
    };
    return horizon.manager['user'] = {
        init:function(){
            showView.showUserList();
            operate.checkForm();
            event();
            deptTree.init("dept_root");
            upload.init();
        },
        treeReload:deptTree.init,
        openForm:updateFrom.openForm,
        updateForm:updateFrom.updateForm,
        getTreeNodes:updateFrom.getTreeNodes
    };
}));