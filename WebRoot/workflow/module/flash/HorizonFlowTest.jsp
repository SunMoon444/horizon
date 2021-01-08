<%@page language="java" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@page import="com.horizon.third.SessionInfo"%>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@page import="com.horizon.third.ThirdAdapterFactory"%>
<%@page import="com.horizon.utils.HorizonPorps"%>
<%
SessionInfo sessionInfo=  ThirdAdapterFactory.getSessionInfo();
String tenantCode = sessionInfo.getTenantCode(session);
String dbIdentifier = sessionInfo.getDbIdentifierByTenantCode(session);
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
<title>流程运行测试</title>
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
    <script type="text/javascript" language="javascript" src="<path:assetsPath/>/module/flash/js/HorizonWorkflow.js"></script>
    <script>
        jQuery(function($) {
            $('#HorizonFlowTest').height($(window).height());
            $(window).resize(function() {
                $('#HorizonFlowTest').height($(window).height());
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
    var requiredRevision = 124;
    // -----------------------------------------------------------------------------
    // -->
     function getContextPath(){
      return "<%=request.getContextPath()%>";
     }
     function getConfigPathSWF(){
        return "<%=HorizonPorps.getSysPath()%>/module/flash/flow-conf/designer/";
     }
     function getTenantid(){
         return "<%=tenantCode%>";
     }
     function getIdentifier(){
         return "<%=dbIdentifier%>";
     }
    //设计元素的图片路径,默认返回空时,在当前目录下的assets/image/下查找
     function getImgPathForFlex(){
         return "<%=HorizonPorps.getSysPath()%>/module/flash";
     }
     //返回是否允许显示路由条件的提示符号1=显示,0=不显示
     function showMsgForLineName(){
         return "1";
     }
    //objName回写对象名称，seltype 单选多选，onlyuser只选择人员，
    //freeselect是否允许自由选择，initvalue定义的列表
    var backObjName="";
    function selectUserflowSWF(objName,seltype,onlyuser,freeselect,initvalue,uname,uid)
     {
         var option = {
             idField: 'userid',
             cnField: 'username',
             isFlow: true,
             fnClose: function() {
                 backSelUser();
             }
         };
         if(seltype == '1') {
             option['multiple'] = false;
         }
         if(onlyuser == '1') {
             //只能选择人
             option['selectDept'] = false;
             option['selectPosition'] = false;
             option['selectRole'] = false;
             option['selectGroup'] = false;
             option['selectUser'] = true;
         }else if(onlyuser == '2') {
             //不能选择人
             option['selectUser'] = false;
         }
         if(!freeselect) {
             //不允许自由选择
             option['dept'] = false;
             option['position'] = false;
             option['role'] = false;
             option['group'] = false;
             option['search'] = false;
         }
         if(initvalue) {
             option['flowUser'] = {
                 id: initvalue,
                 name: ''
             };
         }
         backObjName = objName;
         $('#username').val(uname);
         $('#userid').val(uid);
         $.horizon.selectUser(option);
         /*var para = "cnfield=username&idfield=userid&defaultshow=0&fun=backSelUser";
            para += "&seltype="+seltype;
            para += "&onlyuser="+onlyuser;
            if(freeselect){
                para += "&scope=1;1;1";
            }
            else{
                para += "&hidesearch=1";
            }
            if(!(initvalue == null || initvalue=="")){
                para += "&flowuser=inituser";
                document.getElementById("inituser").value=initvalue;
            }
            backObjName = objName;
            //清空临时字段
            document.getElementById("username").value=uname;
            document.getElementById("userid").value=uid;

            if(!selectuser(para)) return;*/
     }
    function backSelUser(){
        var usernames = document.getElementById("username").value;
        var userids   = document.getElementById("userid").value;

        HorizonFlowTest.setSelectUserResult(backObjName,usernames,userids);

     }
     //选择认领人
     function selectClaimUserSWF(subjectionid,subjectiontype){
         var option = {
             idField: 'userid',
             cnField: 'username',
             isFlow: true,
             multiple: false,
             selectDept: false,
             selectPosition: false,
             selectGroup: false,
             selectRole: false,
             selectUser: true,
             fnClose: function() {
                 backClaimUser();
             }
         };
         if(subjectiontype=="D" || subjectiontype =="S") {
             option['dept'] = subjectionid;
             option['position'] = false;
             option['role'] = false;
             option['group'] = false;
         }
         else if(subjectiontype=="R"){
             option['dept'] = false;
             option['position'] = false;
             option['role'] = subjectionid;
             option['group'] = false;
         }
         else if(subjectiontype=="G"){
             option['dept'] = false;
             option['position'] = false;
             option['role'] = false;
             option['group'] = subjectionid;
         }
         else if(subjectiontype=="P"){
             option['dept'] = false;
             option['position'] = subjectionid;
             option['role'] = false;
             option['group'] = false;
         }
         $('#username').val('');
         $('#userid').val('');
         $.horizon.selectUser(option);

         /*var para = "cnfield=username&idfield=userid&defaultshow=0&fun=backClaimUser&hidesearch=1";
            para += "&seltype=1";
            para += "&onlyuser=1";
            //(部门;角色;群组;岗位),
            if(subjectiontype=="D" || subjectiontype =="S"){
                para += "&scope="+subjectionid+";0;0;0";
            }
            else if(subjectiontype=="R"){
                para += "&scope=0;"+subjectionid+";0;0";
            }
            else if(subjectiontype=="G"){
                para += "&scope=0;0;"+subjectionid+";0";
            }
            else if(subjectiontype=="P"){
                para += "&scope=0;0;0;"+subjectionid;
            }
            //清空临时字段
            document.getElementById("username").value="";
            document.getElementById("userid").value="";
            if(!selectuser(para)) return;*/
     }
     function backClaimUser(){
        var usernames = document.getElementById("username").value;
        var userids   = document.getElementById("userid").value;
        HorizonFlowTest.selectClaimUserResult(usernames,userids);
     }

     /**
      * 流程测试需要的参数
      */
     function getWorkflowParam(){
         var flowid = '<c:out value="${flowid}"/>';
         var identifier = '<c:out value="${identifier}"/>';
         var tenantCode = '<c:out value="${tenantCode}"/>';
         var userid =  '<c:out value="${userid}"/>';

         return 'flowid=' + flowid + '&identifier=' + identifier + '&tenantCode=' + tenantCode+ '&userid=' + userid;
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
		"id", "HorizonFlowTest",
		"quality", "high",
		"bgcolor", "#869ca7",
		"name", "HorizonFlowTest",
		"allowScriptAccess","sameDomain",
		"type", "application/x-shockwave-flash",
		"pluginspage", "http://www.adobe.com/go/getflashplayer"
	);
} else if (hasRequestedVersion) {
	// if we've detected an acceptable version
	// embed the Flash Content SWF when all tests are passed
	AC_FL_RunContent(
			"src", "<path:ctx/><%=HorizonPorps.getSysPath()%>/module/flash/HorizonFlowTest",
			"width", "100%",
			"height", "100%",
			"align", "middle",
			"wmode","transparent",
			"id", "HorizonFlowTest",
			"quality", "high",
			"bgcolor", "#869ca7",
			"name", "HorizonFlowTest",
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
			id="HorizonFlowTest" width="100%" height="100%"
			codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab">
			<param name="movie" value="HorizonFlowTest.swf" />
			<param name="wmode" value="transparent"> 
			<param name="quality" value="high" />
			<param name="bgcolor" value="#869ca7" />
			<param name="allowScriptAccess" value="sameDomain" />
			<embed src="HorizonFlowTest.swf" quality="high" bgcolor="#869ca7"
				width="100%" height="100%" name="HorizonFlowTest" align="middle"
				play="true"
				loop="false"
				quality="high"
				allowScriptAccess="sameDomain"
				type="application/x-shockwave-flash"
				pluginspage="http://www.adobe.com/go/getflashplayer">
			</embed>
	</object>
</noscript>
<div style="display:none">
<input type="text" id="userid" name="userid" /><!--选择人员临时域-->
<input type="text" id="username" name="username" />
<input type="text" id="inituser" name="inituser" />
</div>
</body>
</html>
