/**
 *  系统通用参数可视化配置
 *
 *  @author zhangsk 2017/3/31
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'jquery', 'horizonTable', 'jqueryValidateAll', 'jqueryForm',
            'gritter','elementsFileinput' ], factory);
    } else {
        factory();
    }
}(function(){
    var urls ={
        list:horizon.tools.formatUrl('/profile/sys/list'),
        update:horizon.tools.formatUrl('/profile/sys/update'),
        getdata : horizon.tools.formatUrl('/profile/locale/list'),
        setlang : horizon.tools.formatUrl('/profile/locale/value'),
        fileUpload:horizon.tools.formatUrl('/profile/locale/file')
    };
    //查看
    var profile ={
        init:function(){
            //文件上传的样式
            $('input:file').ace_file_input({
                allowExt: ['jar'],
                no_file: horizon.lang["system-config"]["languageSelectLanguage"],
                btn_choose: horizon.lang["system-config"]["languageSelect"],
                btn_change: horizon.lang["system-config"]["languageReselect"],
                no_icon: 'ace-icon fa fa-cloud-upload',
                droppable: false
            });
            //绑定修改按钮
            $(".changeset").bind(horizon.tools.clickEvent(),function(){
                modifys.changset(this);
            });
            //绑定取消按钮
            $(".reset").bind(horizon.tools.clickEvent(),function(){
                modifys.reset(this);
            });
            // 绑定确定按钮
            $("#confirm").bind(horizon.tools.clickEvent(), function() {
                profile.setLangPara();
            });

            // 绑定上传按钮
            $("#upload").unbind(horizon.tools.clickEvent()).bind(horizon.tools.clickEvent(), function() {
                upload.langFileUpload();
            });
            profile.initform();
            //初始化数据
            $.ajax({
                type : "get",
                url : urls.list,
                dataType : "json",
                data:{},
                success : function(data) {
                    var $container=$(".profile-table");
                    data.maxUploadSizeTmp = data.maxUploadSize/1024/1024;
                    for(var key in data){
                        profile.initvalue(key,data[key],$container);//初始化table
                    }
                },
                error:function(){
                	horizon.notice.error(horizon.lang["message"]["operateError"]);
                }
            });
            //获取已注册的语言
            $.ajax({
                url : urls.getdata,
                cache : false,
                dataType : 'json',
                type : 'post',
                error : function() {
                	horizon.notice.error(horizon.lang["message"]["operateError"]);
                },
                success : function(data) {
                    if (data != null) {
                        profile.putdata(data);
                    } else {
                    	horizon.notice.error(horizon.lang["message"]["updateFail"]);
                    }
                }
            });

        },
        putdata:function(data){
            var $form = $("#form-language");
            var langSelect = document.getElementById("langSelect");
            var langsTemp = "";
            var _html="";
            for ( var key in data) {
                if(key!="currentLang" && key!="res" && key!="msg"){
                    if(data[key]==data["currentLang"]){
                        _html=_html+"<option value="+key+" selected='true'>"+data[key]+"</option>";
                    }else{
                        _html=_html+"<option value="+key+">"+data[key]+"</option>";
                    }

                    langsTemp = langsTemp+ (data[key] + " , ");
                }
            }
            $(langSelect).html(_html);
            langsTemp = langsTemp.substring(0,langsTemp.length - 2);
            $form.parents(".profile-container ").find(".table td[data-id='localeVal'] ").attr("data-value",data["currentLang"]).html(profile.formatvalue(data["currentLang"]));
            $form.parents(".profile-container ").find(".table td[data-id='language'] ").attr("data-value",langsTemp).html(profile.formatvalue(langsTemp));

        },
        initvalue:function(key,value,$container){//初始化值
            if(key!="localeVal" && key != "language"){
                $container.find(".table td[data-id='"+key+"'] ").attr("data-value",value).html(profile.formatvalue(value,key));
            }
        },
        showtable:function($container){//显示table
            //按钮
            $container.find(".changeset").removeClass("hidden");
            $container.find(".reset").addClass("hidden");
            $container.find(".submit").addClass("hidden");
            $container.find(".submit1").addClass("hidden");
            //模块
            $container.find(".table").removeClass("hidden");
            var $form = $container.find(".profile-form");
            $form.addClass("hidden");
        },
        messageType:{
            Mail:horizon.lang["system-config"]["workflowMessageTypeMail"],
            Msg:horizon.lang["system-config"]["workflowMessageTypeMsg"],
            SMS:horizon.lang["system-config"]["workflowMessageTypeSms"],
            IM:horizon.lang["system-config"]["workflowMessageTypeIm"],
            D:horizon.lang["item-list"]["subjectTypeSubdept"],
            P:horizon.lang["item-list"]["subjectTypePost"],
            G:horizon.lang["item-list"]["subjectTypeGroup"]
        },

        formatvalue:function(value,key){//对内容进行格式化
            if(key=="workflow.messageType"||key=="workflow.authorParsingType"){
                var arr = value.split(";");
                var arr1 = [];
                for(var i=0;i<arr.length;i++ ){
                    arr1.push(profile.messageType[arr[i]]);
                }
                return arr1.join(";");
            }
            if(key=="initFlag"){
                if(value=="1"){
                    return horizon.lang["system-config"]["initFlag1"]
                }else{
                    return horizon.lang["system-config"]["initFlag3"]
                }
            }
            if (key=="realtimeflag"){
                if(value=="1"){
                    return horizon.lang["system-config"]["realtimeFlag1"]
                }else{
                    return horizon.lang["system-config"]["realtimeFlag0"]
                }
            }
            if (key=="saveType"){
                if(value=="1"){
                    return horizon.lang["system-config"]["saveType1"]
                }else{
                    return horizon.lang["system-config"]["saveType0"]
                }
            }
            if (key=="run.mode"){
                if(value=="develop"){
                    return horizon.lang["system-config"]["runMode1"]
                }else{
                    return horizon.lang["system-config"]["runMode2"]
                }
            }
            if(value=="true"){
                return horizon.lang["profile-common"]["true"];
            }
            if(value=="false"){
                return horizon.lang["profile-common"]["false"];
            }
            return value;
        },
        //设置语言
        setLangPara : function() {
            var selLocale = $('#langSelect option:selected').val();
            $.ajax({
                url : urls.setlang,
                cache : false,
                dataType : 'json',
                type : 'post',
                data : {"locale" : selLocale},
                error : function() {
                	horizon.notice.error(horizon.lang["message"]["operateError"]);
                },
                success : function(data) {
                    if (data.res == "true") {
                        $("#form-language").parents(".profile-container ").find(".table td[data-id='localeVal'] ").attr("data-value",data.currentLang).html(profile.formatvalue(data.currentLang));
                        horizon.notice.success(horizon.lang["message"]["updateSuccess"]);
                        profile.showtable($("#form-language").parents(".profile-container "));

                    } else {
                    	horizon.notice.error(horizon.lang["message"]["updateFail"]);
                    }
                }
            });
        },
        //初始化form
        initform:function(){
            $(".profile-container  form").each(function(){
                var $form = $(this);
                if($form.get(0).id=="form-language_file"){
                    return;
                }
                $form.validate({
                    submitHandler : function(){
                        var value = $("input[name='maxUploadSizeTmp']").val();
                        if(!isNaN(value)){
                            $("input[name='maxUploadSize']").val(value*1024*1024);
                        }
                        var arr = [];
                        $("input[name='workflow.messageTypeTmp']:checked").each(function(){
                            arr.push($(this).attr("data-value"));
                        });
                        $("input[name='workflow.messageType']").val(arr.join(";"));
                        arr = [];
                        $("input[name='workflow.authorParsingTypeTmp']:checked").each(function(){
                            arr.push($(this).attr("data-value"));
                        });
                        $("input[name='workflow.authorParsingType']").val(arr.join(";"));
                        $form.ajaxSubmit({
                            url : urls.update,
                            dataType : 'json',
                            type : 'POST',
                            cache : false,
                            error : function() {
                            	horizon.notice.error(horizon.lang["message"]["operateError"]);
                            },
                            success : function(data) {
                                if (data.success) {
                                    //回显
                                    var $container =$form.parents(".profile-container ")
                                    for(var key in data){
                                        profile.initvalue(key,data[key],$container);
                                    }
                                    profile.showtable($container);
                                } else {
                                	horizon.notice.error(horizon.lang["message"]["saveFail"]+(data.message?data.message:""));
                                }
                            }
                        });
                    }
                });

            });

        }
    };
    var upload={
        langFileUpload:function(){

            $('#form-language_file').ajaxSubmit({
                url : urls.fileUpload,
                dataType : 'json',
                type : 'POST',
                cache: false,
                error : function() {
                	horizon.notice.error(horizon.lang["message"]["operateError"]);
                },
                success: function(data) {
                    if(data.res=="true"){
                        profile.putdata(data);
                        horizon.notice.success(data.msg);
                    }else{
                    	horizon.notice.error(data.msg);
                    }
                }
            });
        }
    };
    //修改
    var modifys={
        init:function(){

        },
        //初始化from-control的内容
        initvalue:function(key,value,$container){
            if(key=="workflow.messageType"){
                var arr = value.split(";");
                for(var i=0;i<arr.length;i++){
                    $container.find("input[type='checkbox'][name='workflow.messageTypeTmp'][value='"+arr[i]+"']").attr("checked",'checked');
                }
            }
            if(key=="workflow.authorParsingType"){
                var arr = value.split(";");
                for(var i=0;i<arr.length;i++){
                    $container.find("input[type='checkbox'][name='workflow.authorParsingTypeTmp'][value='"+arr[i]+"']").attr("checked",'checked');
                }
            }
            $container.find("input[type='text'][name='"+key+"']").val(value);
            $container.find("select[name='"+key+"']").val(value);
            $container.find("input[type='radio'][name='"+key+"'][value='"+value+"']").attr("checked",'checked');
        },
        //修改设置按钮
        changset:function(obj){
            var $container = $(obj).parents(".profile-container ");
            //按钮
            $(obj).addClass("hidden");
            $container.find(".reset").removeClass("hidden");
            $container.find(".submit").removeClass("hidden");
            $container.find(".submit1").removeClass("hidden");
            //模块
            $container.find(".table").addClass("hidden");
            var $form = $container.find(".profile-form");
            $form.removeClass("hidden");
            var values = $container.find(".table td[data-id]");
            //进行修改的时候通过查看器进行初始化
            for(var i=0;i<values.length;i++){
                var $values = $(values.get(i));
                modifys.initvalue($values.data("id"),$values.attr("data-value"),$form);
            }
        },
        //取消的按钮
        reset:function(obj){
            profile.showtable($(obj).parents(".profile-container "));
        }

    };

    return horizon.engine['profile_sys'] = {
        init:function(){
            profile.init();
        }
    };

}));