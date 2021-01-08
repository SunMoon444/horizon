/**
 * 授权信息
 * @author yaodd
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery','jqueryValidateAll'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    var init={
        initLicense:function(){
            $.ajax({
                url:horizon.tools.formatUrl('/system/license/info'),
                cache: false,
                dataType:'json',
                success:function(data){
                    if(data){
                        var product=data.product;					
						
                        if(product == 'workflow'){
                            $('input[name="product"]').val(horizon.lang["license-info"]["flowEngine"]);
                        }else{
                            $('input[name="Horizon"]').val(horizon.lang["license-info"]["platform"]);
                        }
                        //版本
                        $('input[name="version"]').val(data.version);
                        //得到许可的人/组织
                        $('input[name="licensee"]').val(data.licensee);
                        //到期日期
                        var expiration1=data.expiration;
                        if(expiration1 != 'never'){
                            $('input[name="expiration"]').val(data.expiration);
                        }else{
                            $('input[name="expiration"]').val(horizon.lang["license-info"]["unlimit"]);
                        }
                        //版本信息
                        if(data.work == '2'){
                            $('input[name="instancenum"]').val(horizon.lang["license-info"]["develop"]);
                        }else{
                            $('input[name="instancenum"]').val(horizon.lang["license-info"]["formal"]);
                        }
                        //应用访问地址
                        $('input[name="ip"]').val(data.ip);
                        //端口
                        $('input[name="port"]').val(data.port);
                        //上下文
                        $('input[name="appname"]').val(data.app);
                        //单位数量
                        if(data.units !='unlimited'){
                            $('input[name="units"]').val(data.units);
                        }else{
                            $('input[name="units"]').val(horizon.lang["license-info"]["unlimit"]);
                        }
                        //用户数量
                        if(data.users != 'unlimited'){
                            $('input[name="users"]').val(data.users);
                        }else{
                            $('input[name="users"]').val(horizon.lang["license-info"]["unlimit"]);
                        }
                        //流程发布数量
                        if(data.flownum != 'unlimited'){
                            $('input[name="flownum"]').val(data.flow);
                        }else{
                            $('input[name="flownum"]').val(horizon.lang["license-info"]["unlimit"]);
                        }
                        //实例打开数量
                        if(data.instancenum != 'unlimited'){
                            $('input[name="instancenum"]').val(data.work);
                        }else{
                            $('input[name="instancenum"]').val(horizon.lang["license-info"]["unlimit"]);
                        }
                        //租户空间
                        if(data.tenantspace != 'unlimited'){
                            $('input[name="tenantspace"]').val(data.tenantspace);
                        }else{
                            $('input[name="tenantspace"]').val(horizon.lang["license-info"]["unlimit"]);
                        }
                        //允许组件
                        if(data.multiTrack == '1'){
                            $('input[name="multitrack"]')[0].checked = true;
                        }
                        if(data.simple == '1'){
                            $('input[name="simple"]')[0].checked = true;
                        }
                        if(data.multiServer == '1'){
                            $('input[name="multiserver"]')[0].checked = true;
                        }
                        if(data.clusters == '1'){
                            $('input[name="clusters"]')[0].checked = true;
                        }
                    }
                }
            });
            //注册码
            $.ajax({
                url:horizon.paths.apppath + '/workflow.hz',
                cache: false,
                success:function(data){
                    if(data){
                        $('#registerCode').val(data);
                    }
                }
            });
        }
    };
    return horizon.engine['licenseinitinfo'] = {
        init:init.initLicense
    };
}));