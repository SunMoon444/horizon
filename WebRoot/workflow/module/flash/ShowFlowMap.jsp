<%@page contentType="text/html; charset=UTF-8" %>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@page import="com.horizon.utils.HorizonPorps"%>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>流程跟踪图</title>
<script type="text/javascript" language="javascript" src="<path:assetsPath/>/module/flash/js/AC_OETags.js"></script>
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
var requiredRevision = 124;
// -----------------------------------------------------------------------------
// -->
 function getContextPath(){
  return "<%=request.getContextPath()%>";
 }
 function getConfigPathSWF(){
	return "<%=HorizonPorps.getSysPath()%>/module/flash/flow-conf/designer/";
 }
//设计元素的图片路径,默认返回空时,在当前目录下的assets/image/下查找
 function getImgPathForFlex(){
	 return "<%=HorizonPorps.getSysPath()%>/module/flash";
 }
 //返回是否允许显示路由条件的提示符号1=显示,0=不显示
 function showMsgForLineName(){
	 return "1";
 }
 /**
  * 流程跟踪需要的参数
  */
 function getWorkflowParam(){
	 var workid = '<c:out value="${workid}"/>';
	 var nodeid = '<c:out value="${nodeid}"/>';
	 var identifier = '<c:out value="${identifier}"/>';
	 var tenantCode = '<c:out value="${tenantCode}"/>';
	 if(workid == ''){
         return self.location.search.substring(1);
     }
	 return 'workid=' + workid + '&nodeid='+nodeid+'&identifier=' + identifier + '&tenantCode=' + tenantCode;
 }
 //页面上的文字说明
 function getMsg(){
	 //0-9
	 var msg = "超期;已办理;正在办理;跳过;未办理;动态演示;停止演示;放大;缩小;原大小"
	 //10-14
	 msg += ";节点;全部;办理记录;子流程记录;关闭";
	 //15-21
	 msg += ";节点名称;处理人;操作时间;操作;累计时间;规定时限;意见";
	 //22-26
	 msg += ";子流程名称;实例标题;开始时间;查看;子流程查看:";
	 //27-28
	 msg += ";提示信息;节点没有办理记录和子流程";
	 return msg;
 }
 
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
		"id", "ShowFlowMap",
		"quality", "high",
		"bgcolor", "#869ca7",
		"name", "ShowFlowMap",
		"allowScriptAccess","sameDomain",
		"type", "application/x-shockwave-flash",
		"pluginspage", "http://www.adobe.com/go/getflashplayer"
	);
} else if (hasRequestedVersion) {
	// if we've detected an acceptable version
	// embed the Flash Content SWF when all tests are passed
	AC_FL_RunContent(
			"src", "<path:ctx/><%=HorizonPorps.getSysPath()%>/module/flash/ShowFlowMap",
			"width", "100%",
			"height", "100%",
			"align", "middle",
			"wmode","transparent",
			"id", "ShowFlowMap",
			"quality", "high",
			"bgcolor", "#869ca7",
			"name", "ShowFlowMap",
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
			id="ShowFlowMap" width="100%" height="100%"
			codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab">
			<param name="movie" value="ShowFlowMap.swf" />
			<param name="wmode" value="transparent">			
			<param name="quality" value="high" />
			<param name="bgcolor" value="#869ca7" />
			<param name="allowScriptAccess" value="sameDomain" />
			<embed src="ShowFlowMap.swf" quality="high" bgcolor="#869ca7"
				width="100%" height="100%" name="ShowFlowMap" align="middle"
				play="true"
				loop="false"
				quality="high"
				allowScriptAccess="sameDomain"
				type="application/x-shockwave-flash"
				pluginspage="http://www.adobe.com/go/getflashplayer">
			</embed>
	</object>
</noscript>
</body>
</html>
