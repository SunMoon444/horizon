<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path"%>
<!DOCTYPE html>
<html lang='<path:i18n group="" key="lang" />'>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
<title><path:i18n group="base" key="appname" /></title>
<%@include file="../../common/bootstrap.css.include.jsp"%>
<link rel="stylesheet" href="<path:frontPath/>/jquery/jquery-ui/css/jquery-ui.css" />
<link rel="stylesheet" href="<path:frontPath/>/gritter/css/jquery.gritter.css" />
<%@include file="../../common/ace.css.include.jsp"%>
<%@include file="../../common/base.css.include.jsp"%>
<%@include file="../../common/oldbrowser.script.include.jsp"%>
</head>
<body class="no-skin">
	<div class="main-container hidden-print" id="main-container">
		<div class="main-content">
			<div class="main-content-inner">
				<div class="page-content main-content no-margin-left no-padding-bottom">
					<div class="page-content-area" data-ajax-content="true"></div>
				</div>
			</div>
		</div>
	</div>
	<div id="dialog-default" class="hidden"></div>
	<%@include file="../../common/base.script.include.jsp"%>
	<script src="<path:frontPath/>/require/require.js"></script>
	<script>
		(function() {
			require.config({
				baseUrl : horizon.paths.pluginpath,
				paths : horizon.vars.requirePaths,
				shim : horizon.vars.requireShim
			});
			require(['jquery', 'horizonJqueryui', 'bootstrap', 'elementsScroller', 'ace'], function($) {
                var formatUrl = function(hash) {
                    var url = '../' + hash;
                    if(!/^.+\.html$/.test(url)) {
                        url += '.html';
                    }
                    return url;
                };
                var defaultUrl = formatUrl(window.location.hash.substring(1));
                if(!/^.+\.html$/.test(defaultUrl)) {
                    defaultUrl += '.html';
                }
				$('[data-ajax-content=true]').ace_ajax({
					'content_url': function(hash) {
						return formatUrl(hash);
					},
					'default_url': defaultUrl,
					'format_result': horizon.language.handlePage
				}).on('ajaxloadcomplete', function() {
                    if($('.horizon-modal').length) {
                        horizon.tools.initHorizonModal();
                    }
                });
			});
		})();
	</script>
</body>
</html>