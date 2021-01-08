<%@page import="com.horizon.profile.AppConfig" %>
<%@page language="java" pageEncoding="UTF-8"
        contentType="text/html; charset=UTF-8" %>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path" %>
<!DOCTYPE html>

<html lang='<path:i18n key="lang"/>'>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta charset="utf-8"/>
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
    <title><path:i18n group="base" key="appname"/></title>
    <%@include file="/workflow/common/bootstrap.css.include.jsp" %>
    <%@include file="/workflow/common/ace.css.include.jsp" %>
    <%@include file="/workflow/common/oldbrowser.script.include.jsp" %>
    <%@ page import="com.horizon.profile.AppConfig" %>
    <style>
    .error-container{
    	text-align: center;
    }
    </style>
    
</head>
<body>
<!-- /.main-container -->
<div class="container-fluid">
<div class="row">
	<div class="col-xs-12">
		<!-- PAGE CONTENT BEGINS -->
		<!-- #section:pages/error -->
		<div class="error-container">
			<div class="well">
				<h1 class="grey lighter smaller">
					<span class="blue bigger-125">
						<i class="ace-icon fa fa-random"></i>
						500
					</span>
					<path:i18n group="error" key="systemError" />
				</h1>

				<hr />
				<h3 class="lighter smaller">
					<path:i18n group="error" key="systemErrorPrompt" />
					<i class="ace-icon fa fa-wrench icon-animated-wrench bigger-125"></i>

				</h3>

				<div class="space"></div>

				<div>
					<ul class="list-unstyled spaced inline bigger-110 margin-15">
						<li>
						</li>

						<li>
						</li>
					</ul>
				</div>
				<hr />
				<div class="space"></div>
				<div class="center">
					<a href="javascript:history.back()" class="btn btn-grey">
						<i class="ace-icon fa fa-arrow-left"></i>
						<path:i18n group="base" key="back" />
					</a>
					<!-- <a href="" class="btn btn-primary">
						<i class="ace-icon fa fa-home"></i>
						Home
					</a> -->
				</div>
			</div>
		</div>

		<!-- /section:pages/error -->
		<!-- PAGE CONTENT ENDS -->
	</div><!-- /.col -->
</div><!-- /.row -->
</div>

<!-- /.main-container -->
<%@include file="/workflow/common/jquery.script.include.jsp" %>
<%@include file="/workflow/common/base.script.include.jsp" %>
<script>
</script>
</body>
</html>
