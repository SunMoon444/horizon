<%@page language="java" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path" %>
<%@taglib uri="http://java.sun.com/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html lang='<path:i18n key="lang" />'>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
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

        .error-message {
            color: #d16e6c;
        }
    </style>
</head>
<head>
</head>
<body class="login-layout light-login">
<div class="main-container">
    <div class="main-content">
        <div class="row">
            <div class="col-sm-10 col-sm-offset-1">
                <div class="login-container">
                    <div class="center">
                        <h2>
                            <span>
                                <span class="logo">
                                    <img src="<path:assetsPath/>/common/img/logo.png" width="23px"/>
                                </span>
                            </span>
                            <span class="red">Workflow</span>
                            <span class="grey">Suites</span>
                        </h2>
                    </div>
                    <div class="space-6"></div>
                    <div class="position-relative">
                        <div id="login-box" class="login-box visible widget-box no-border">
                            <div class="widget-body">
                                <div class="widget-main">
                                    <h6 class="header blue lighter bigger">
                                        <i class="ace-icon fa fa-users green"></i>
                                        <path:i18n group="login" key="title"/>
                                    </h6>
                                    <div class="space-6"></div>
                                    <div class="loginInner">
                                        <form name="LoginForm" id="LoginForm"
                                              action="/login/system" method="post">
                                            <input class="inputlogin" name="loginSource" type="hidden" value="system"/>
                                            <fieldset>
                                                <label class="form-group block clearfix">
	                                                <span class="block input-icon input-icon-right">
	                                                    <input type="text" name="loginName"
                                                               class="form-control inputlogin"
                                                               placeholder='<path:i18n group="login" key="username" />'/>
	                                                    <i class="ace-icon fa fa-user"></i>
	                                                </span>
                                                </label>
                                                <label class="form-group block clearfix">
	                                                <span class="block input-icon input-icon-right">
	                                                    <input type="password" class="form-control password"
                                                               class="inputlogin" name="password" autocomplete="off"
                                                               placeholder='<path:i18n group="login" key="password" />'/>
	                                                    <i class="ace-icon fa fa-lock"></i>
	                                                </span>
                                                </label>
                                                <div class="space"></div>
                                                <div class="clearfix">
                                                    <label class="inline error-message"></label>
                                                    <div class="hidden msg">${msg}</div>
                                                    <button type="submit" id="login-btn"
                                                            class="width-35 btn btn-sm btn-primary pull-right">
                                                        <i class="ace-icon fa fa-key"></i>
                                                        <span class="bigger-110"><path:i18n group="login"
                                                                                            key="submit"/></span>
                                                    </button>
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
                                        <h6 class="grey" id="id-company-text">&copy; <path:i18n group="base"
                                                                                                key="company"/></h6>
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
<!-- /.main-container -->

<%@include file="/workflow/common/base.script.include.jsp" %>
<script src="<path:frontPath/>/require/require.js"></script>
<script type="text/javascript">
    horizon.lang.login = <path:i18n group="login"/>;
    horizon.lang.validator = <path:i18n group="validator"/>;
    horizon.vars.requirePaths.login = horizon.paths.assetspath + '/login/js/login';
    require.config({
        baseUrl: horizon.paths.pluginpath,
        paths: horizon.vars.requirePaths,
        shim: horizon.vars.requireShim
    });
    require([
        'login'
    ], function(login) {
        login.init();
    });
</script>
</body>
</html>
