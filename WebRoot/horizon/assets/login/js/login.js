/**
 * 验证码更新js
 *
 * @author lihh  2017.9.14
 */
jQuery(function ($) {
    //判断验证码开关
    $.ajax({
        url: horizon.paths.apppath + '/horizon/platform/validate/switch.wf',
        dataType: 'json',
        success: function (data) {
            if (data) {
                //初始验证码
                $("#img").attr("src", horizon.paths.apppath + "/horizon/platform/validate/code.wf?date=" + Math.random());
                $("#displayCode").removeClass("hide");
            }
        }
    });
    //点击换一张验证码
    $("#change").on(horizon.tools.clickEvent(), function () {
        $("#img").attr("src", horizon.paths.apppath + "/horizon/platform/validate/code.wf?date=" + Math.random())
    });
    //验证码输入框绑定回车登录事件
    $('#validateCode').keyup(function(event) {
        if(event.keyCode == '13') {
            $("#LoginForm").submit();
        }
        return;
    }).keydown(function() {
        $('.error-message').html('');
    });
});