<%@page import="com.horizon.profile.AppConfig" %>
<%@page language="java" pageEncoding="UTF-8"
        contentType="text/html; charset=UTF-8" %>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path" %>
<!DOCTYPE html>
<html lang='<path:i18n key="lang" />'>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta charset="utf-8"/>
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
    <title><path:i18n group="base" key="appname"/></title>
    <%@include file="/workflow/common/bootstrap.css.include.jsp" %>
    <%@include file="/workflow/common/ace.css.include.jsp" %>
    <%@include file="/workflow/common/oldbrowser.script.include.jsp" %>
    <style>
        .logo {
            border-radius: 100%;
            width: 36px;
            height: 36px;
            line-height: 30px;
            margin: -8px 1px 0px;
            background-color: #428BCA;
            display: inline-block;
            vertical-align: middle;
        }

        .other {
            color: #d16e6c;
            cursor: pointer;
        }

        .margin {
            margin-left: 20px;
        }

        .error-message {
            color: #d16e6c;
        }
    </style>
</head>
<body class="login-layout light-login">
<div class="main-container">
    <div class="main-content">
        <div class="row">
            <div class="col-sm-10 col-sm-offset-1">
                <div class="login-container">
                    <div class="center">
                        <h2>
                            <span class="logo">
                                <img src="<path:assetsPath/>/common/img/logo.png" width="23px"/>
                            </span>
                            <span class="red">Workflow</span> <span class="grey">Suites</span>
                        </h2>
                    </div>
                    <div class="space-6"></div>
                    <div class="position-relative">
                        <div id="login-box"
                             class="login-box visible widget-box no-border">
                            <div class="widget-body">
                                <div class="widget-main">
                                    <div class="space-6"></div>
                                    <div class="loginInner">
                                        <form id="LoginForm" class="form-horizontal"
                                              action="../../platform/login"
                                              method="post">
                                            <h6 class="form-group header blue lighter bigger">
                                                <i class="ace-icon fa fa-users green"></i>
                                                <path:i18n group="login" key="title"/>
                                            </h6>
                                            <input class="inputlogin" name="loginSource" type="hidden"
                                                   value="tenant"/>
                                            <fieldset>
                                                <label class="form-group block clearfix">
                                                    <span class="block input-icon input-icon-right"> <input
                                                        type="text" name="loginName" class="form-control"
                                                        placeholder='<path:i18n group="login" key="username" />'/>
															<i class="ace-icon fa fa-user"></i>
													</span>
                                                </label>
                                                <label class="form-group block clearfix">
                                                    <span class="block input-icon input-icon-right">
                                                        <input type="password" class="form-control" name="password"
                                                               autocomplete="off"
                                                               placeholder='<path:i18n group="login" key="password" />'/>
															<i class="ace-icon fa fa-lock"></i>
													</span>
                                                </label>
                                                <label class="form-group clearfix hide" id="displayCode">
														<span class="input-icon input-icon-right">  <input
                                                                type="text" name="checkCode" id="validateCode"
                                                                size="14" placeholder=<path:i18n group="platform-login" key="verificationCode" />>
															<img id='img'/>
															<span class="margin other" id="change"><path:i18n group="platform-login" key="change" /></span>
														</span>
                                                </label>
                                                <div class="form-group block clearfix">
                                                    <div class="item">
                                                        <label>
                                                            <input name="item" value="1" type="radio" class="ace" checked/>
                                                            <span class="lbl"><path:i18n group="platform-login" key="application" /></span>
                                                        </label>
                                                        <label class="margin">
                                                            <input name="item" value="0" type="radio" class="ace"/>
                                                            <span class="lbl"><path:i18n group="platform-login" key="manager" /></span>
                                                        </label>
                                                        <label class="margin">
                                                            <input name="item" value="2" type="radio" class="ace"/>
                                                            <span class="lbl"><path:i18n group="platform-login" key="design" /></span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <path:tenantHtml file='loginPage'/>
                                                <div class="space"></div>
                                                <div class="form-group block clearfix">
                                                    <button type="submit" id="login-btn"
                                                            class="btn btn-sm btn-primary btn-block">
                                                        <i class="ace-icon fa fa-key"></i> <span
                                                            class="bigger-110"><path:i18n group="login" key="submit" /></span>
                                                    </button>
                                                    <label class="inline error-message"></label>
                                                    <div class="hidden msg">${msg}</div>
                                                </div>
                                                <div class="space-4"></div>
                                            </fieldset>
                                        </form>
                                    </div>
                                    <div class="social-or-login center">
                                        <span class="bigger-110"></span>
                                    </div>
                                    <div class="space-6"></div>
                                    <div class="center">
                                        <h6 class="grey" id="id-company-text">
                                            &copy;
                                            <path:i18n group="base" key="company"/>
                                        </h6>
                                    </div>
                                </div>
                                <!-- /.widget-main -->
                            </div>
                            <!-- /.widget-body -->
                        </div>
                        <!-- /.login-box -->
                    </div>
                    <!-- /.position-relative -->
                </div>
            </div>
            <!-- /.col -->
        </div>
        <!-- /.row -->
    </div>
    <!-- /.main-content -->
</div>

<div class="hidden" id="login-dialog"></div>

<%@include file="/workflow/common/base.script.include.jsp" %>
<script src="<path:frontPath/>/require/require.js"></script>
<script type="text/javascript">
    horizon.lang.login = <path:i18n group="login"/>;
    horizon.lang.validator = <path:i18n group="validator"/>;
    horizon.vars.requirePaths.login = horizon.paths.assetspath + '/login/js/login';
    horizon.vars.requirePaths.platformLogin = horizon.paths.apppath + '/horizon/assets/login/js/login';
    horizon.vars.requireShim.platformLogin = ['jquery'];
    require.config({
        baseUrl: horizon.paths.pluginpath,
        paths: horizon.vars.requirePaths,
        shim: horizon.vars.requireShim
    });
    require([
        'login',
        'platformLogin'
    ], function(login) {
        login.init();
    });
</script>
</body>
</html>
