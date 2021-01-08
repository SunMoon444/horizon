<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<!DOCTYPE html>
<html lang='<path:i18n key="lang"/>'>
<head>
	<meta name="format-detection" content="telephone=no,email=no,address=no">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title><path:i18n group="base" key="appname" /></title>
    <%@include file="../../workflow/common/bootstrap.css.include.jsp"%>
    <link rel="stylesheet" href="<path:frontPath/>/jquery/jquery-ui/css/jquery-ui.css" />
    <link rel="stylesheet" href="<path:frontPath/>/gritter/css/jquery.gritter.css" />
    <%@include file="../../workflow/common/ace.css.include.jsp"%>
    <%@include file="../common/base.css.include.jsp"%>
    <%@include file="../../workflow/common/oldbrowser.script.include.jsp"%>
</head>
<body class="no-skin <path:prop name="embed"/> hidden-sidebar2" data-layout="<path:prop file="configuration" name="layout.manager"/>" data-fixed-modal="<path:prop name="layout.fixedModal"/>">
	<div id="navbar" class="horizon-navbar navbar navbar-default navbar-fixed-top navbar-collapse h-navbar">
		<div class="navbar-container no-padding" id="navbar-container">
			<div class="navbar-header pull-left">
			<c:if test="${sessionScope.pwdTimerUpdate == 'on'}">
				<input name="pwdTimerUpdate" type="hidden" value="on"/>
			</c:if>
			<c:remove var="pwdTimerUpdate" scope="session"/>
                <a href="#page/home">
                    <span class="navbar-brand">
                        <small>
                            <img src="<path:assetsPath/>/common/img/logo.png" width="20px" />
							Administrator
                            <!--<path:i18n group="base" key="appname" />-->
                        </small>
                    </span>
                </a>
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
			<div class="navbar-buttons navbar-header pull-right collapse navbar-collapse" role="navigation">
				<ul class="nav ace-nav">
                    <li class="transparent">
						<path:permission bizId="app_space" resourceAuth="TEANANT_APP">
							<a data-rel="tooltip" data-placement="bottom" title="<path:i18n group="platform-login" key="application" />" href="<path:ctx/>/horizon/operator/index.jsp" target="_blank">
								<i class="ace-icon fa fa-laptop"></i>
							</a>
						</path:permission>
                    </li>
                    <li class="transparent no-border">
						<path:permission bizId="app_space" resourceAuth="TEANANT_DESINGER">
							<a data-rel="tooltip" data-placement="bottom" title="<path:i18n group="platform-login" key="design" />" href="<path:ctx/>/horizon/module/flash/flow/moduledesigner<path:urlSuffix/>" target="_blank">
								<i class="ace-icon fa fa-eye-slash"></i>
							</a>
						</path:permission>
                    </li>
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
							<li>
								<a href="javascript:void(0)">
									<path:tenantHtml file='homepage'/>
								</a>
							</li>
							<li class="divider"></li>
                            <li>
                                <a href="javascript:void(0)" id="updatePassword" data-operator="updatePassword">
                                    <i class="ace-icon fa fa-user"></i>
                                    <path:i18n group="base" key="updatePassword" />
                                </a>
                            </li>
                            <li class="divider"></li>
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
		<div id="sidebar" class="horizon-sidebar sidebar h-sidebar navbar-collapse collapse sidebar-fixed">
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
					<div class="page-content-area" data-ajax-content="true" data-default-page="page/home">
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
	    						<input type="password" name="oldpassword" autocomplete="off" required/>
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
	    						<input type="password" name="password" minlength="6" maxlength="25" id="newPassword" notChinese="true" autocomplete="off" required/>
	    						<i class="ace-icon fa fa-lock blue"></i>
	    					</span>
	    					<span class='span-null'></span>
						</div>
					</div>
				</div>
				<div class="col-xs-12" id="update_generator">
					<div class="form-group">
					<label class="col-xs-12 col-sm-4 control-label"><path:i18n group="platform-user" key="passwordLevel" />:</label> 
					<div class="col-xs-12 col-sm-8">   
                             <label class="btn btn-white input-icon input-icon-right disabled pwd-strong">
                                       	<path:i18n group="platform-user" key="weak" />
                             </label>
                             <label class="btn btn-white input-icon input-icon-right disabled pwd-strong">
                                      	<path:i18n group="platform-user" key="center" />
                             </label>
                             <label class="btn btn-white input-icon input-icon-right disabled pwd-strong">
                                    	<path:i18n group="platform-user" key="strong" />
                             </label>
                       </div>
                     </div>
                 </div>           
				<div class="col-xs-12">
					<div class="form-group">
						<label class="col-xs-12 col-sm-4 control-label"><path:i18n group="base" key="confirmPassword" />:</label>
						<div class="col-xs-12 col-sm-8">
							<span class="input-icon input-icon-right">
	    						<input type="password" name="repassword" minlength="6" maxlength="16" autocomplete="off" required />
	    						<i class="ace-icon fa fa-retweet blue"></i>
	    					</span>
	    					<span class='span-null'></span>
						</div>
					</div>
				</div>
			</div>
		</form>
    </div>
    <div class="horizon-task-modal modal aside aside-bottom aside-hz aside-fixed" data-body-scroll="false" data-fixed="true" data-placement="bottom" data-background="true" data-backdrop="invisible" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-body no-padding">
                    <div class="widget-box horizon-task-widget no-margin no-border">
                        <div class="widget-header no-padding">
                            <h5 class="widget-title"></h5>
                            <div class="widget-toolbar no-border pull-left">
                                <div class="widget-menu">
                                    <a href="javascript:void(0);" data-toggle="dropdown">
                                        <i class="ace-icon fa fa-bars bigger-120"></i>
                                    </a>
                                    <ul class="dropdown-menu dropdown-light-blue dropdown-caret dropdown-closer">
                                        <li class="hidden menu-tls">
                                            <a href="javascript:void(0);" data-toggle="tab"> <path:i18n group="platform-login" key="newDialog" /></a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="widget-toolbar">
                                <a href="javascript:void(0);" data-action="hide">
                                    <i class="ace-icon fa fa-chevron-down grey bigger-150"></i>
                                </a>
                            </div>
                            <div class="widget-toolbar no-border">
                                <a href="javascript:void(0);" data-action="reload">
                                    <i class="ace-icon fa fa-refresh bigger-120"></i>
                                </a>
                                <a href="javascript:void(0);" data-action="remove">
                                    <i class="ace-icon fa fa-times red bigger-120"></i>
                                </a>
                            </div>
                        </div>
                        <div class="widget-body">
                            <div class="tab-content no-padding no-border">
                                <div class="tab-pane pane-tls">
                                    <iframe width="100%" height="100%" frameborder="0" src="" style="display: block;"></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button class="horizon-task-trigger aside-trigger hidden hidden-print" data-target=".horizon-task-modal" data-toggle="modal" type="button">
            <span class="badge badge-warning task-num">0</span>
            <i class="ace-icon fa fa-tasks"></i>
        </button>
    </div>
    <div id="dialog-default" class="hidden"></div>
    <%@include file="../common/base.script.include.jsp"%>
    <script>
        horizon.lang.base = <path:i18n group="base"/>;
    </script>
    <script data-main="<path:ctx/>/horizon/assets/manager/index/js/manager" src="<path:frontPath/>/require/require.js"></script>
</body>
</html>