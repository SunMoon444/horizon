<%@page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8"%>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
    <style type="text/css">
        div{
            width:100%;
        }
    </style>
  
</head>

<body onload="init()">
<script id="editor" type="text/plain" style="width:1024px;height:500px;">
</script>
<script type="text/javascript">
 var apppath = '<path:ctx/>';
 var pluginpath='<path:frontPath/>';
</script>

<script type="text/javascript" language="javascript" src="<path:assetsPath/>/module/flash/js/ueditor.config.js"></script>
<script type="text/javascript" charset="utf-8" src= "<path:frontPath/>/ueditor/ueditor.all.min.js"></script>
<script type="text/javascript" charset="utf-8" src="<path:frontPath/>/ueditor/lang/zh-cn/zh-cn.js"></script>
<script type="text/javascript" language="javascript" src="<path:assetsPath/>/module/flash/js/addfield.js"></script>
<script type="text/javascript">

function getParent(){
	return parent.document.HorizonDesigner;
}
function getList(){
	
	return getParent().getFieldList();
}
function IsDirty(){
	return true;
}
function getHtml(){
	var html =  UE.getEditor('editor').getContent();
	return html;
} 
function  init (){
	var ue = UE.getEditor('editor',{
		allowDivTransToP:false,
		 insertorderedlist: {
             'decimal':'1,2,3...',
             'lower-alpha':'a,b,c...',
             'lower-roman':'i,ii,iii...',
             'upper-alpha':'A,B,C...',
             'upper-roman':'I,II,III...'
         },
         insertunorderedlist: {
             'circle':'○ 大圆圈',
             'disc':'● 小黑点',
             'square':'■ 小方块 '
         },
         enterTag: ''
	});
	ue.ready(function(){
		var html = getParent().getContent() ;
		ue.setContent(html);
	})
	getParent().isLoad();
}
</script>
</body>
</html>