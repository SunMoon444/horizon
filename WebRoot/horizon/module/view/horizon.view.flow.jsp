<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path"%>
<!DOCTYPE html>
<html lang="<path:i18n key="lang" />">
<head>
 	<meta name="format-detection" content="telephone=no,email=no,address=no"> 
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title><path:i18n group="views" key="view" /></title>
    <!-- bootstrap & fontawesome bootstrap基础样式和字体 -->
    <link rel="stylesheet" href="<path:frontPath/>/bootstrap/bootstrap/css/bootstrap.css?ver=view.datatables" />
    <link rel="stylesheet" href="<path:frontPath/>/bootstrap/bootstrap/css/font-awesome.css" />
    <!-- page specific plugin styles -->
    <link rel="stylesheet" href="<path:frontPath/>/jquery/jquery-ui/css/jquery-ui.css" />
    <!-- ace styles & text fonts ace基础样式和字体 -->
    <link rel="stylesheet" href="<path:frontPath/>/bootstrap/ace/css/ace-fonts.css" />
    <link rel="stylesheet" href="<path:frontPath/>/bootstrap/ace/css/ace.css?ver=view.datatables" class="ace-main-stylesheet" id="main-ace-style" />
    <link rel="stylesheet" href="<path:assetsPath/>/common/css/horizon.base.css?ver=view.datatables" />
    <!-- 低版本IE样式 -->
    <!--[if lte IE 9]>
    <link rel="stylesheet" href="<path:frontPath/>/bootstrap/ace/css/ace-part2.css?ver=view.datatables" class="ace-main-stylesheet" />
    <link rel="stylesheet" href="<path:frontPath/>/bootstrap/ace/css/ace-ie.css?ver=view.datatables" />
    <![endif]-->
    <link rel="stylesheet" href="<path:ctx/>/horizon/assets/module/view/css/horizon.view.css?ver=view.datatables" />
    <!--
    HTML5shiv and Respond.js for IE8 to support HTML5 elements and media queries
    用于处理IE8不兼容HTML5和CSS3新特性
    -->
    <!--[if lte IE 8]>
    <script src="<path:frontPath/>/old-browser/html5shiv.js"></script>
    <script src="<path:frontPath/>/old-browser/respond.js"></script>
    <![endif]-->
    <!-- 网站LOGO -->
    <link rel="icon" type="image/png" href="<path:assetsPath/>/common/img/favicon.png" />

</head>

<body class="no-skin" >
<div class="page-heade flowtree-widget-box widget-box no-margin no-border">
    <div class="row page-content">
        <div class="col-md-2 no-padding-right" id="flowtree-container-view">
            <div class="flowtree-widget-box widget-box no-margin">
                <div class="widget-header widget-header-flat hidden-xs hidden-sm"  style="height: 42px;">
                    <div class="widget-title">
                        <i class="ace-icon fa fa-leaf"></i>
                        流程树
                    </div>
                </div>
                <div class="widget-body">
                    <div class="widget-main no-padding">
                        <div id="modal-flowtree" aria-hidden="true" class="modal aside aside-right aside-vc aside-fixed navbar-offset" data-body-scroll="false" data-offset="true" data-placement="right" data-fixed="true" data-backdrop="invisible" tabindex="-1">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header hidden-md hidden-lg">
                                        流程树
                                    </div>
                                    <div class="modal-body">
                                        <ul id="flow-tree"></ul>
                                    </div>
                                </div>
                                <button class="hidden-md hidden-lg aside-trigger btn btn-info btn-app btn-xs ace-settings-btn" data-target="#modal-flowtree" data-toggle="modal" type="button">
                                    <i class="ace-icon fa fa-leaf bigger-110 icon-only"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-10" id="flowdata-container">
            <table id="myDatatable" class="table table-striped table-bordered table-hover"></table>
        </div>
    </div>
</div>

<div class="hide" id="dialog-message"></div>
<!--[if !IE]> -->
<script type="text/javascript">
    window.jQuery || document.write("<script src='<path:frontPath/>/jquery/jquery-base/jquery.js'>"+"<"+"/script>");
</script>
<!-- <![endif]-->
<!--[if IE]>
<script type="text/javascript">
    window.jQuery || document.write("<script src='<path:frontPath/>/jquery/jquery-base/jquery1x.js'>"+"<"+"/script>");
</script>
<![endif]-->
<script type="text/javascript">
    var apppath = '<path:ctx/>',
        viewId = '${param.viewId}' || '${param.viewid}' || '${param.VIEWID}',
        widgetId = '${param.widgetId}' || '${param.widgetid}' || '${param.WIDGETID}',
        isProtocolPage = '${param.isProtocolPage}' || '${param.isprotocolpage}' || '${param.ISPROTOCOLPAGE}';
</script>

<%@include file="../../common/base.script.include.jsp"%>
<script data-main="<path:ctx/>/horizon/assets/module/view/js/horizon.view.main" src="<path:frontPath/>/require/require.js" defer async="true"></script>
<script>
    horizon.lang.views = <path:i18n group="views"/>;
    horizon.lang.base = <path:i18n group="base"/>;
    horizon.lang.message = <path:i18n group="message"/>;
</script>
</body>
</html>
