<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<!DOCTYPE html>
<html lang='<path:i18n key="lang" />'>
<head>
	<meta name="format-detection" content="telephone=no,email=no,address=no"> 
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title><path:i18n group="base" key="appname" /></title>
    <%@include file="../common/bootstrap.css.include.jsp"%>
    <link rel="stylesheet" href="<path:frontPath/>/jquery/jquery-ui/css/jquery-ui.css" />
    <link rel="stylesheet" href="<path:frontPath/>/gritter/css/jquery.gritter.css" />
    <%@include file="../common/ace.css.include.jsp"%>
    <%@include file="../common/base.css.include.jsp"%>
    <%@include file="../common/oldbrowser.script.include.jsp"%>
</head>
<body class="no-skin <path:prop name="embed"/> hidden-sidebar2" data-layout="<path:prop name="layout.engine"/>" data-fixed-modal="<path:prop name="layout.fixedModal"/>">
	<div id="navbar" class="horizon-navbar navbar navbar-default navbar-fixed-top navbar-collapse h-navbar">
		<div class="navbar-container" id="navbar-container">
			<div class="navbar-header pull-left">
				<span class="navbar-brand">
					<small> 
					   <img src="<path:assetsPath/>/common/img/logo.png" width="20px" />
                       <path:i18n group="base" key="appname" />
					</small>
				</span>
				<button class="pull-right navbar-toggle collapsed"
					type="button" data-toggle="collapse"
					data-target=".navbar-buttons,.navbar-menu">
					<span class="sr-only">Toggle user menu</span>
                    <i class="ace-icon glyphicon glyphicon-user white bigger-125"></i>
				</button>
				<button id="toggle-sidebar" class="pull-right navbar-toggle collapsed" type="button"
					data-toggle="collapse" data-target="#sidebar">
					<span class="sr-only">Toggle横向菜单</span>
                    <span class="icon-bar"></span>
					<span class="icon-bar"></span>
                    <span class="icon-bar"></span>
				</button>
                <button id="toggle-sidebar2" class="pull-right menu-toggler navbar-toggle" type="button" data-target="#sidebar2" >
                    <span class="sr-only">Toggle左侧菜单</span>
                    <i class="ace-icon fa fa-dashboard white bigger-140"></i>
                </button>
			</div>
			<div class="navbar-buttons navbar-header pull-right  collapse navbar-collapse" role="navigation">
				<ul class="nav ace-nav">
                    <li class="transparent">
						<a data-toggle="dropdown" href="javascript:void(0)" class="dropdown-toggle"> 
							<i class="ace-icon glyphicon glyphicon-user"></i> 
							<span class="user-info"> 
								<small><path:i18n group="base" key="welcome" />,</small>
								<path:user/>
							</span> 
							<i class="ace-icon fa fa-caret-down"></i>
						</a>
						<ul class="user-menu dropdown-menu-right dropdown-menu dropdown-yellow dropdown-caret dropdown-close">
							<c:if test="${loginSource == 'system'}">
								<li>
									<a href="javascript:void(0)" id="updatePassword" data-operator="updatePassword">
										<i class="ace-icon fa fa-user"></i>
                                        <path:i18n group="base" key="updatePassword" />
									</a>
								</li>
								<li class="divider"></li>
							</c:if>
							<li>
                                <a href="javascript:void(0)" data-operator="logout">
                                    <i class="ace-icon fa fa-power-off"></i>
									<path:i18n group="base" key="logout" />
							    </a>
                            </li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	</div>
	<div class="main-container hidden-print" id="main-container">
		<div id="sidebar" class="sidebar h-sidebar navbar-collapse collapse sidebar-fixed">
			<!-- 横向菜单  -->
            <div class="nav-trigger"><i class="ace-icon fa fa-bars"></i></div>
            <ul class="nav nav-list"></ul>
            <div class="nav-horizontal-collapse">
                <div class="horizontal-collapse" data-toggle="left">
                    <i class="ace-icon fa fa-angle-left"></i>
                </div>
                <div class="horizontal-collapse" data-toggle="right">
                    <i class="ace-icon fa fa-angle-right"></i>
                </div>
            </div>
            <div class="sidebar-toggle sidebar-collapse hidden">
                <i class="ace-icon fa fa-angle-double-right"
                   data-icon1="ace-icon fa fa-angle-double-left"
                   data-icon2="ace-icon fa fa-angle-double-right"></i>
            </div>
		</div>
		<div class="main-content">
			<div class="main-content-inner">
                <div id="sidebar2" class="horizon-sidebar sidebar responsive sidebar-fixed menu-min">
					<!-- 纵向菜单  -->
					<ul class="nav nav-list"></ul>
					<div class="sidebar-toggle sidebar-collapse">
						<i class="ace-icon fa fa-angle-double-right"
							data-icon1="ace-icon fa fa-angle-double-left"
							data-icon2="ace-icon fa fa-angle-double-right"></i>
					</div>
				</div>
				<div class="page-content main-content no-margin-left no-padding-bottom">
                    <c:set value="page/home" var="defaultPage"></c:set>
                    <c:if test="${loginSource == 'system'}">
                        <c:set value="page/tenant.list" var="defaultPage"></c:set>
                    </c:if>
					<div class="page-content-area" data-ajax-content="true" data-default-page="<c:out value="${defaultPage}"/>">
						<!-- ajax content goes here -->
					</div>
				</div>
			</div>
		</div>
        <a href="javascript:void(0)" id="btn-scroll-up" class="btn-scroll-up btn btn-sm btn-inverse">
            <i class="ace-icon fa fa-angle-double-up icon-only bigger-110"></i>
        </a>
	</div>
	<div class="default-dom hidden">
		<ul id="default-nav">
			<li>
				<a href="javascript:void(0)">
					<i class="menu-icon"></i>
					<span class="menu-text"></span>
				</a>
				<b class="arrow"></b>
			</li>
			<li>
				<a href="javascript:void(0)" class="dropdown-toggle">
					<i class="menu-icon"></i>
					<span class="menu-text"></span>
					<b class="arrow fa fa-angle-down"></b>
				</a> 
				<b class="arrow"></b>
				<ul class="submenu"></ul>
			</li>
		</ul>
	</div>
	<div class="userContent hidden">
		<div class="space-6"></div>
		<form class="form-horizontal no-margin-bottom" id="userForm">
			<div class="row">
				<div class="col-xs-12">
					<div class="form-group">
						<label class="col-xs-12 col-sm-4 control-label"><path:i18n group="base" key="oldPassword" />:</label>
						<div class="col-xs-12 col-sm-8">
							<span class="input-icon input-icon-right">
	    						<input type="password" name="oldpassword" required/>
	    						<i class="ace-icon fa fa-lock blue"></i>
	    					</span>
	    					<span class='span-null'></span>
						</div>
					</div>
				</div>
				<div class="col-xs-12">
					<div class="form-group">
						<label class="col-xs-12 col-sm-4 control-label"><path:i18n group="base" key="newPassword" />:</label>
						<div class="col-xs-12 col-sm-8">
							<span class="input-icon input-icon-right">
	    						<input type="password" name="password" minlength="6" maxlength="16" id="newPassword" required/>
	    						<i class="ace-icon fa fa-lock blue"></i>
	    					</span>
	    					<span class='span-null'></span>
						</div>
					</div>
				</div>
				<div class="col-xs-12">
					<div class="form-group">
						<label class="col-xs-12 col-sm-4 control-label"><path:i18n group="base" key="confirmPassword" />:</label>
						<div class="col-xs-12 col-sm-8">
							<span class="input-icon input-icon-right">
	    						<input type="password" name="repassword" required minlength="6" maxlength="16" />
	    						<i class="ace-icon fa fa-retweet blue"></i>
	    					</span>
	    					<span class='span-null'></span>
						</div>
					</div>
				</div>
			</div>
		</form>
		</div>
    <div id="dialog-default" class="hidden"></div>
    <%@include file="../common/base.script.include.jsp"%>
    <script>
        horizon.lang.base = <path:i18n group="base"/>;
    </script>
    <script data-main="<path:assetsPath/>/manager/index/js/manager" src="<path:frontPath/>/require/require.js"></script>
</body>
</html>