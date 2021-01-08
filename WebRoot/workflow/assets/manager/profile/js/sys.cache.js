/**
 *  统一缓存框架的
 *
 *  @author lichao 2017/3/30
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'jquery', 'horizonTable', 'jqueryValidateAll', 'jqueryForm',
            'gritter' ], factory);
    } else {
        factory();
    }
}(function(){
    var urls ={
        list:horizon.tools.formatUrl('/profile/cache/list'),
        update:horizon.tools.formatUrl('/profile/cache/update')
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
                if(this.id=="default-reset"){
                    modifys.init($('td[data-id="cache.type"]').attr("data-value"));
                }
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
                    for(var key in data){
                        profile.initvalue(key,data[key],$container);//初始化table
                    }
                    //显示页面
                    modifys.init(data["cache.type"]);
                },
                error:function(){
                	horizon.notice.error(horizon.lang["message"]["operateError"]);
                }
            });

            $("select[name='cache.type']").change(function(){
                modifys.init($(this).val());
            });
        },
        initvalue:function(key,value,$container){//初始化值
            $container.find(".table td[data-id='"+key+"'] ").attr("data-value",value).html(profile.formatvalue(value));
        },
        showtable:function($container){//显示table
            //按钮
            $container.find(".changeset").removeClass("hidden");
            $container.find(".reset").addClass("hidden");
            $container.find(".submit").addClass("hidden");
            //模块
            $container.find(".table").removeClass("hidden");
            var $form = $container.find(".profile-form");
            $form.addClass("hidden");
        },
        formatvalue:function(value){//对内容进行格式化
            if(value=="true"){
                return horizon.lang["profile-common"]["true"];
            }
            if(value=="false"){
                return horizon.lang["profile-common"]["false"];
            }
            return value;
        },
        //初始化form
        initform:function(){
            $(".profile-container form").each(function(){
                var $form = $(this);
                $form.validate({
                    submitHandler : function(){
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
                                    var $container =$form.parents(".profile-container")
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
        init:function(mark){
            $(".profile-container").addClass("hidden");
            $("#cache-default-container").removeClass("hidden");
            $("#cache-"+mark+"-container").removeClass("hidden");
        },
        //初始化from-control的内容
        initvalue:function(key,value,$container){
            $container.find("input[type='text'][name='"+key+"']").val(value);
            $container.find("select[name='"+key+"']").val(value);
            $container.find("input[type='radio'][name='"+key+"'][value='"+value+"']").attr("checked",'checked');
        },
        //修改设置按钮
        changset:function(obj){
            var $container = $(obj).parents(".profile-container");
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
            profile.showtable($(obj).parents(".profile-container"));

        }

    };

    return horizon.engine['profile_cache'] = {
        init:function(){
            profile.init();
        }
    };

}));