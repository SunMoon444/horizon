/**
 *  系统通用参数可视化配置
 *
 *  @author zhangsk 2017/11/20
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
        list:horizon.paths.apppath + '/horizon/manager/profile/config/list.wf',
        update:horizon.paths.apppath + '/horizon/manager/profile/config/update.wf'
    };

    //查看
    var profile ={
        init:function(){
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

        formatvalue:function(value,key){//对内容进行格式化

            if(value=="true"){
                if(key=="allow.repeat.login"){
                    return horizon.lang["platform-config"]["permit"];
                }
                return horizon.lang["platform-config"]["open"];
            }
            if(value=="false"){
                if(key=="allow.repeat.login"){
                    return horizon.lang["platform-config"]["refusal"];
                }
                return horizon.lang["base"]["close"];
            }

            if(value=="0"){
                if(key=="solve.account.lock"){
                    return horizon.lang["platform-config"]["unlock"];
                }
                return value;
            }

            if(value=="1"){
                if(key=="solve.account.lock"){
                    return horizon.lang["platform-config"]["autoUnlock"];
                }
                return value;
            }
            if(value=="2"){
            	if(key=="solve.account.lock"){
            		return horizon.lang["platform-config"]["adminUnlock"];
            	}
            	return value;
            }
            return value;
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
                        var arr = [];
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

    return horizon.engine['platform_profile_sys'] = {
        init:function(){
            profile.init();
        }
    };

}));