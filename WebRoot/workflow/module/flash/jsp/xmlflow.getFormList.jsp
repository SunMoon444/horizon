<%@page contentType="text/html; charset=UTF-8" %>
<%@page import="java.util.List"%>
<%@page import="com.horizon.third.SessionInfo"%>
<%@page import="com.horizon.third.ThirdAdapterFactory,com.horizon.third.Form"%>
<%
    response.setHeader("Pragma","no-cache"); //HTTP 1.0
    response.setHeader("Cache-Control","no-cache"); //HTTP 1.1
    response.setDateHeader("Expires", 0); //prevents caching at the proxy
    String ctxPath = request.getContextPath();


    String selFlag = request.getParameter("flag");
    String formIDs = request.getParameter("id");

    Form hzformImpl = ThirdAdapterFactory.getFormInstance();
    SessionInfo sessionInfo=  ThirdAdapterFactory.getSessionInfo();

    String dbIdentifier = sessionInfo.getDbIdentifierByTenantCode(session);

    List alllist = hzformImpl.getFormList(dbIdentifier);
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 TRANSITIONAL//EN" "HTTP://WWW.W3.ORG/TR/XHTML1/DTD/XHTML1-TRANSITIONAL.DTD">
<html>
<head>
    <title>选择表单</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style type="text/css">
        <!--
        body {
            margin-left: 0px;
            margin-top: 0px;
        }
        .STYLE1 {
            font-size: 14px;
            font-weight: bold;
        }
        -->
    </style>
    <script>
        var winObj = window.dialogArguments ;
        winObj =(winObj+"") =="undefined"?opener:winObj;
        var objForm = window;
        var formIDs="";
        var backForm="";
        var ckFlag = "<%=selFlag%>";
        function OKSet(){
            //获取选择内容
            if(ckFlag=="checkbox")getCheckList();
            else getRadioList();

            winObj.selFormResult(formIDs,backForm);
            self.close();
        }

        function cancel(){
            //	window.returnValue ="";
            self.close();
        }
        function getCheckList(){
            formIDs="";backForm="";
            var  myids = document.getElementsByName("selFormID");
            if(myids == null) return "";
            if(typeof myids.length == "undefined"){
                if(myids.checked) {
                    backForm = myids.value;
                    formIDs  = myids.getAttribute("formid");
                    return ;
                }else{
                    return ;
                }
            }
            for(i=0;i<myids.length;i++){
                if(myids[i].checked) {
                    backForm += (";"+myids[i].value);
                    formIDs  += (";"+myids[i].getAttribute("formid"));
                }
            }
            backForm = backForm.length>0?backForm.substring(1):"";
            formIDs  = formIDs.length>0?formIDs.substring(1):"";
            return ;
        }
        function getRadioList(){
            formIDs="";backForm="";
            var  myids = document.getElementsByName("selFormID");
            if(myids == null) return "";
            if(typeof myids.length == "undefined"){
                if(myids.checked) {
                    backForm = myids.value;
                    formIDs  = myids.getAttribute("formid");
                    return ;
                }
                return ;
            }
            for(i=0;i<myids.length;i++){
                if(myids[i].checked) {
                    backForm = myids[i].value;
                    formIDs  = myids[i].getAttribute("formid");
                    return ;
                }
            }
            return ;
        }
        function showForm(){
            document.getElementById("divForm0").style.display = arguments[0]==0?"":"none";
            document.getElementById("divForm1").style.display = arguments[0]==1?"":"none";
        }
    </script>
</head>

<body>
<table width="100%" border="0" align="center" cellpadding="8" cellspacing="1" bgcolor="#89ABCB">
    <tr><td height="25"  bgcolor="#F6F9FB" align=center>请选择表单(列表不包含已经选择的表单)</td></tr>
    <tr>
        <td bgcolor="#EDF2F7" height="427">
            <input type="button" onclick="showForm(0)" value="HTML表单"  class="CheckTrigger"  />
            <input type="button" onclick="showForm(1)" value="图形表单"  class="CheckTrigger"  />

            <%	for(int k=0;k<2;k++){%>
            <div style="width:100%;height:400px;OVERFLOW:auto;display:<%=k==0?"":"none"%>" id="divForm<%=k%>">
                <table width="100%" border="0" align="center" cellpadding="1" cellspacing="1" bgcolor="#CCCCCC">
                    <tr>
                        <td width="15" bgcolor="#F6F9FB"></td>
                        <td width="33%" bgcolor="#F6F9FB">表所属模块</td>
                        <td width="33%" bgcolor="#F6F9FB">表单名称</td>
                        <td width="30%" bgcolor="#F6F9FB">对应表</td>
                    </tr>
                    <%
                        if(alllist!=null){
                            List formlist = (List) alllist.get(k);
                            String tmpModel ="";
                            if(formlist!=null&&formlist.size()>0){
                                for(int i=0,n=formlist.size();i<n;i++){
                                    List tmpLst = (List)formlist.get(i);
                                    String formID = (String)tmpLst.get(0);
                                    if(formIDs.indexOf(formID)!=-1) continue;
                                    String nowModel=(String)tmpLst.get(4);
                                    String showModel = (String)tmpLst.get(3);
                                    if(nowModel ==null || nowModel.length()==0){
                                        nowModel = (String)tmpLst.get(1);
                                        showModel = (String)tmpLst.get(1);
                                    }
                                    if(tmpModel.equals(nowModel)){
                                        nowModel="";
                                    }
                                    else{
                                        tmpModel = nowModel;
                                    }
                    %>
                    <tr>
                        <td bgcolor="#FFFFFF"><input type=<%=selFlag%> name="selFormID" formid="<%=formID%>" value="<%=(String)tmpLst.get(1)%>=<%=formID%>=<%=(String)tmpLst.get(2)%>"></td>
                        <td bgcolor="#FFFFFF"><%=nowModel.length()==0?"":(showModel)%></td>
                        <td bgcolor="#FFFFFF"><%=(String)tmpLst.get(1)%></td>
                        <td bgcolor="#FFFFFF"><%=(String)tmpLst.get(2)%></td>
                    </tr>
                    <%}}
                    }
                    %>



                </table>
            </div>
            <%}%>
        </td>
    </tr>
    <tr>
        <td height="25" colspan="8" bgcolor="#E8E8E8"><div align="center">
            <input type="button" onclick="OKSet()" value="确定"  class="CheckTrigger" />
            <input type="button" onclick="cancel()"  value="取消"  class="CheckTrigger" />
        </div>
        </td>
    </tr>
</table>

</body>
</html>
