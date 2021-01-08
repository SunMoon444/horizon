<%@page language="java" contentType="text/html;charset=utf-8" pageEncoding="utf-8" isELIgnored="true"%>
<%@taglib uri="http://java.sun.com/jstl/core" prefix="c"%>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title></title>
</head>
<body>
	<table width="300" cellpadding="0" cellspacing="0">
		<tr>
			<td width="20%"><span>请选择：</span></td>
			<td><select name="fieldList" id="fieldList" style="width: 100%">
			</select></td>
		</tr>
	</table>
<script type="text/javascript" language="JavaScript" src="<path:frontPath/>/ueditor/dialogs/internal.js"></script>
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
$(document).ready(function(){
	var list = parent.getList();
	var item = list.split("|");
	$.each(item,function(i,n){
		var m = n.split("~");
		$("<option value='"+m[1]+"'>"+m[0]+"</option>").appendTo("#fieldList")
	})
});
dialog.onok = function(){
	var val = "["+$("#fieldList option:selected").val()+"]";
	if($("#fieldList option:selected").val()=="undefined"){ //针对下拉框内没值情况的异常处理
	    return;
	}
	editor.execCommand('insertHtml', val)
}
</script>

</body>
</html>