<%@page language="java" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@page import="com.horizon.third.SessionInfo"%>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@page import="com.horizon.third.ThirdAdapterFactory"%>
<%@page import="com.horizon.third.Organization"%>
<%@page import="com.horizon.utils.HorizonPorps"%>
<%@page import="java.util.Map"%>

<%@page import="com.horizon.core.HorizonCore"%>
<%@page import="com.horizon.platform.constants.permission.ResourceAuthEnum"%>
<%@page import="com.horizon.platform.permission.service.api.ResourceAuthValidate"%>


<%
Boolean isHasAuth=ResourceAuthValidate.validateLoginModule(HorizonCore.USER_ID.value(),ResourceAuthEnum.TEANANT_DESINGER.getCode());
if(!isHasAuth){
	// String errorUrl =  "/error.jsp?disclose='1'";
	// com.horizon.context.Context context = com.horizon.context.ContextFactory.getContext();		
	// context.setMessage("无权限访问设计器!");	
    request.getRequestDispatcher("/index.jsp").forward(request,response);
	return;
}


String ctxPath = request.getContextPath();
SessionInfo sessionInfo=  ThirdAdapterFactory.getSessionInfo();
String tenantCode = sessionInfo.getTenantCode(session);
String dbIdentifier = sessionInfo.getDbIdentifierByTenantCode(session);
String userid = sessionInfo.getUserId(session);
String username = sessionInfo.getUserName(session);

Organization orgImpl = ThirdAdapterFactory.getOrganizationInstance(tenantCode);
String alluserid = orgImpl.getAllUserids(userid, dbIdentifier);

//ConfigurationInfo configInfo = ConfigurationInfoFactory.getConfigurationInfo();
//Map<String,String> itemMaps = configInfo.getProjectConfigItems("appIndex");
String bootstrap = "off";//itemMaps.get("app_type");

%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
<title>流程设计器</title>
    <%@include file="../../common/bootstrap.css.include.jsp"%>
    <link rel="stylesheet" href="<path:frontPath/>/jquery/jquery-ui/css/jquery-ui.css" />
    <%@include file="../../common/ace.css.include.jsp"%>
    <link rel="stylesheet" type="text/css" href="<path:frontPath/>/ztree/css/zTreeStyle/zTreeStyle.css"/>
    <%@include file="../../common/base.css.include.jsp"%>
    <%@include file="../../common/oldbrowser.script.include.jsp"%>
    <%@include file="../../common/base.script.include.jsp"%>
    <%@include file="../../common/jquery.script.include.jsp"%>
    <script type="text/javascript" language="JavaScript" src="<path:frontPath/>/jquery/jquery-ui/jquery-ui.js"></script>
    <script type="text/javascript" language="JavaScript" src="<path:frontPath/>/ztree/jquery.ztree.min.js"></script>
    <script type="text/javascript" language="JavaScript" src="<path:assetsPath/>/common/js/horizon.jqueryui.js"></script>
    <script type="text/javascript" language="JavaScript" src="<path:assetsPath/>/common/js/horizon.selectuser.js"></script>

    <script type="text/javascript" language="javascript" src="<path:assetsPath/>/module/flash/js/AC_OETags.js"></script>
    <script type="text/javascript" language="javascript" src="<path:assetsPath/>/module/flash/js/HorizonDesigner.js"></script>
    <script>
        jQuery(function($) {
            $('#HorizonDesigner').height($(window).height());
            $(window).resize(function() {
                $('#HorizonDesigner').height($(window).height());
            });
        });
    </script>
<style>
body { margin: 0px; overflow:hidden }
</style>

<script language="JavaScript" type="text/javascript">
<!--
// -----------------------------------------------------------------------------
// Globals
// Major version of Flash required
var requiredMajorVersion = 10;
// Minor version of Flash required
var requiredMinorVersion = 0;
// Minor version of Flash required
var requiredRevision = 0;

var operatorType='<%=bootstrap%>';
// -----------------------------------------------------------------------------
var userid="<%=userid%>";
var username = "<%=username%>";
var alluserid="<%=alluserid%>";
//返回上下文路径
function getContextPathSWF(){
	 return ("<%=request.getContextPath()%>");
}
function winopen(aUrl){
		window.open(aUrl);
}
function getConfig(){
  var configXML =  document.getElementById("Config").value;
  return configXML.replace("<EditorPath>htmleditorpath","<EditorPath><%=request.getContextPath()%>"); 
  
}
//返回配置文件路径
function getConfigPathSWF(){
	return "<%=HorizonPorps.getSysPath()%>/module/flash/flow-conf/designer/";
}
//返回租户id
function getTenantid(){
	 return "<%=tenantCode%>";
}
//返回数据源标识
function getIdentifier(){
	 return "<%=dbIdentifier%>";
}
//加载指定flowid的流程定义
function checkReload(flowid){
    try{
        if(jQuery('.selectuser-dialog').length) {
            jQuery('.selectuser-dialog > .ui-dialog-content').dialog('close');
        }
    }catch(e){}
	HorizonDesigner.reloadFlow(flowid);
}
//保存流程后刷新列表
function refreshAfterSaveFlow(){
	parent.jQuery('#flow-tree').flowtree('reload');
    //parent.jQuery('.flowtree-widget-box').trigger('reload.ace.widget');
}
//设计元素的图片路径,默认返回空时,在当前目录下的assets/image/下查找
function getImgPathForFlex(){	
	return "<%=HorizonPorps.getSysPath()%>/module/flash";
}
/**
 * 流程定义需要的参数
 */
function getWorkflowParam(){
	return 'flowid=<c:out value="${flowid}"/>';
}
// -->
</script>
</head>

<body scroll="no">
<script language="JavaScript" type="text/javascript">
<!--
// Version check for the Flash Player that has the ability to start Player Product Install (6.0r65)
var hasProductInstall = DetectFlashVer(6, 0, 65);

// Version check based upon the values defined in globals
var hasRequestedVersion = DetectFlashVer(requiredMajorVersion, requiredMinorVersion, requiredRevision);

if ( hasProductInstall && !hasRequestedVersion ) {
	// DO NOT MODIFY THE FOLLOWING FOUR LINES
	// Location visited after installation is complete if installation is required
	var MMPlayerType = (isIE == true) ? "ActiveX" : "PlugIn";
	var MMredirectURL = encodeURI(window.location);//特殊字符转码
    document.title = document.title.slice(0, 47) + " - Flash Player Installation";
    var MMdoctitle = document.title;

	AC_FL_RunContent(
		"src", "playerProductInstall",
		"FlashVars", "MMredirectURL="+MMredirectURL+'&MMplayerType='+MMPlayerType+'&MMdoctitle='+MMdoctitle+"",
		"width", "100%",
		"height", "100%",
		"align", "middle",
		"wmode","transparent",
		"id", "HorizonDesigner",
		"quality", "high",
		"bgcolor", "#869ca7",
		"name", "HorizonDesigner",
		"allowScriptAccess","sameDomain",
		"type", "application/x-shockwave-flash",
		"pluginspage", "http://www.adobe.com/go/getflashplayer"
	);
} else if (hasRequestedVersion) {
	// if we've detected an acceptable version
	// embed the Flash Content SWF when all tests are passed
	AC_FL_RunContent(
			"src", "<path:ctx/><%=HorizonPorps.getSysPath()%>/module/flash/HorizonDesigner",
			"width", "100%",
			"height", "100%",
			"align", "middle",
			"wmode","transparent",
			"id", "HorizonDesigner",
			"quality", "high",
			"bgcolor", "#869ca7",
			"name", "HorizonDesigner",
			"allowScriptAccess","sameDomain",
			"type", "application/x-shockwave-flash",
			"pluginspage", "http://www.adobe.com/go/getflashplayer"
	);
  } else {  // flash is too old or we can't detect the plugin
    var alternateContent = 'Alternate HTML content should be placed here. '
  	+ 'This content requires the Adobe Flash Player. '
   	+ '<a href=http://www.adobe.com/go/getflash/>Get Flash</a>';
    document.write(alternateContent);  // insert non-flash content
  }
// -->
</script>
<noscript>
  	<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
			id="HorizonDesigner" width="100%" height="100%"
			codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab">
			<param name="movie" value="HorizonDesigner.swf" />
			<param name="wmode" value="transparent">
			<param name="quality" value="high" />
			<param name="bgcolor" value="#869ca7" />
			<param name="allowScriptAccess" value="sameDomain" />
			<embed src="HorizonDesigner.swf" quality="high" bgcolor="#869ca7"
				width="100%" height="100%" name="HorizonDesigner" align="middle"
				play="true"
				loop="false"
				quality="high"
				allowScriptAccess="sameDomain"
				allowFullScreen="true"
				type="application/x-shockwave-flash"
				pluginspage="http://www.adobe.com/go/getflashplayer">
			</embed>
	</object>
</noscript>
<div style="display:none">
<input type="text" id="userid" name="userid" /><!--选择人员临时域-->
<input type="text" id="username" name="username" />
<input type="text" name="saveflag">
<textarea name="XML"></textarea>
<textarea name="Config" id="Config"><%@ include file="config.xml" %></textarea>
</div>
</body>
</html>
