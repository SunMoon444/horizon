	var gTmpPara = null;
	//打开窗口
	function showModalWin(aUrl,aWidth,aHeight,tmpPara){
		gTmpPara = tmpPara;
		if(window.showModalDialog){
			var strFeatures1 = "dialogWidth:"+aWidth+"px;dialogHeight:"+aHeight+"px;help:no;maximize:no;minimize:no;status:no;scroll:auto;";
			showModalDialog(aUrl,window,strFeatures1);
		}
		else{
			var strFeatures2 = "width="+aWidth+"px,height="+aHeight+"px,help=no,maximize=no,minimize=no,status=no,scroll=auto";
			window.open(aUrl,window,strFeatures1);
		}
	}
	//视图预览
	function ShowPreviewView(){
	   var viewId =arguments[0];
	   if(viewId==""){
	     alert("未获得视图Id");
		 return;
	   }
       var aUrl =getContextPathSWF()+"/horizon/view/getViewTemplatePath.wf?viewId="+viewId;
		window.open(aUrl);
	}
	//表单预览
	function ShowPreviewForm(){
	   var formId =arguments[0];
	   if(formId==""){
	     alert("未获得表单Id");
		 return;
	   }
       var aUrl =getContextPathSWF()+"/horizon/template/form/getFormTemplatePath.wf?formId="+formId;
		window.open(aUrl);
	}
	
	//测试流程
	function openWorkSWF(){
		var path =arguments[2];//优先从配置文件取路径：horizon/module/flash/flow-conf/designer/flowconfig.xml的<TestFlow>
		if(path==null || path=="" || path == undefined){
			path = "/horizon/example/flowapi_index.jsp";
		}
		var aUrl =arguments[0]+path+"?flowId="+arguments[1];
		window.open(aUrl);
	}

	function autoTestFlowSWF(){
		//var path =arguments[2];//优先从配置文件取路径：horizon/module/flash/flow-conf/designer/flowconfig.xml的<TestFlow>
		//if(path==null || path=="" || path == undefined){			
		  var	path = "/horizon/module/flash/flow/test.wf";
		//}
		var aUrl =arguments[0]+path+"?flowid="+arguments[1]
		window.open(aUrl);
	}
	
	//选择人员,参数0＝对象标识，参数1＝已经选择的人员列表（ID=Name|ID=Name）
	//返回格式：参数0＝对象标识，参数1＝ID=Name|ID=Name
	function selectUserflowSWF(){
		/*var objID = (arguments[0]).substring(arguments[0].lastIndexOf(".")+1);
		var para = "seltype=2&cnfield=username&idfield=userid&";
		if(objID == "idAll"){
			if(arguments[2]!=""){
				if(arguments[2].substring(0,1)=="0") para += "onlyuser=2&";
				para += "scope="+arguments[2].substring(1)+"&";
			}
			else{
				para += "scope=1;0;1;1&"
			}
			para += "defaultshow=0"
		}
		else if(objID == "idUser"){
			para +="scope=1;1;1&onlyuser=1&defaultshow=0"
		}
		else if(objID == "idDept"){
			para +="scope=1;0;0&onlyuser=2&defaultshow=0"
		}
		else if(objID == "idRole"){
			para +="scope=0;1;0&onlyuser=2&defaultshow=1"
		}
		else if(objID == "idGroup"){
			para +="scope=0;0;1&onlyuser=2&defaultshow=2"
		}
		else if(objID == "idPosition"){
			para +="scope=0;0;0;1&onlyuser=2&defaultshow=2"
		}
		else{
			if(arguments[2]!=""){	//用户,部门,群组,角色
				if(arguments[2].substring(0,1)=="0") para += "onlyuser=2&";
				para += "scope="+arguments[2].substring(1)+"&";
			}
			else{
				para += "scope=1;0;1;1&"
			}
			para += "defaultshow=0"
		}
		//初始化值
		var tmpArr = arguments[1].split(";");
		var usernames="",userids="";
		for(var i=0,n=tmpArr.length;i<n;i++){
			if(tmpArr[i].length>0){
				var k = tmpArr[i].indexOf("=");
				if(k<0){
					usernames+= ";"+tmpArr[i];
					userids  += ";"+tmpArr[i];
				}
				else{
					usernames += ";"+tmpArr[i].substring(k+1);
					userids   += ";"+tmpArr[i].substring(0,k);
				}
			}
		}
		document.getElementById("username").value = (usernames==""?"":usernames.substring(1));
		document.getElementById("userid").value   = (userids==""?"":userids.substring(1));
		para += "&fun=selectUserflowBack";
		para += "&flowDesigner=1";
		
		var chromeFlag = navigator.userAgent.indexOf("Chrome");//判断浏览器是否Chrome37及以上版本，因为不支持window.showModalDialog
		if(chromeFlag != -1){
			var chromeVer = navigator.userAgent.substr(chromeFlag+7, 2);
			if(parseInt(chromeVer) < 37){
				chromeFlag = -1;
			}
		}
		if(chromeFlag == -1){//当浏览器不是Chrome37及以上版本时
			if(!window.showModalDialog){
				if(gTmpPara!=null){
					alert("有其他弹出窗口没有关闭,请先关闭");return;
				}
			}
		}
		
		gTmpPara = arguments[0];	//放入全局变量中
		//选择
		if(!selectuser(para)) return;*/

        gTmpPara = arguments[0];	//放入全局变量中

        var option = {
            idField: 'userid',
            cnField: 'username',
            isFlow: true,
            fnClose: function() {
                selectUserflowBack();
            }
        };
        //判断选择范围
        var objID = (arguments[0]).substring(arguments[0].lastIndexOf(".")+1);
        if(objID == "idUser"){
            //只能选人
            option['selectDept'] = false;
            option['selectPosition'] = false;
            option['selectGroup'] = false;
            option['selectUser'] = true;
        }else if(objID == "idDept"){
            //只能选部门
            option['selectDept'] = true;
            option['selectPosition'] = false;
            option['selectGroup'] = false;
            option['selectUser'] = false;
            
            option['position'] = false;
            option['group'] = false;
        }else if(objID == "idRole"){
            //只能选角色
            option['selectDept'] = false;
            option['selectPosition'] = false;
            option['selectGroup'] = false;
            option['selectRole'] = true;
            option['selectUser'] = false;

            option['dept'] = false;
            option['group'] = false;
            option['role'] = true;
            option['position'] = false;
        }else if(objID == "idGroup"){
            //只能选群组
            option['selectDept'] = false;
            option['selectPosition'] = false;
            option['selectGroup'] = true;
            option['selectUser'] = false;

            option['dept'] = false;
            option['position'] = false;
        }else if(objID == "idPosition"){
            //只能选岗位
            option['selectDept'] = false;
            option['selectPosition'] = true;
            option['selectGroup'] = false;
            option['selectUser'] = false;

            option['group'] = false;
            option['dept'] = false;
        }
        //初始化值
        var idArr = [];
        var nameArr = [];
        $.each(arguments[1].split(';'), function(i, val) {
            if(val) {
                var arr = val.split('=');
                if(arr.length === 1) {
                    idArr.push(val);
                    nameArr.push(val);
                }else if(arr.length == 2) {
                    idArr.push(arr[0]);
                    nameArr.push(arr[1]);
                }
            }
        });
        $('#userid').val(idArr.join(';'));
        $('#username').val(nameArr.join(';'));
        $.horizon.selectUser(option);

	}
	function selectUserflowBack(){
		var usernames = document.getElementById("username").value;
		var userids   = document.getElementById("userid").value;
		var tmpArr1 = usernames.split(";");
		var tmpArr2 = userids.split(";");
		var backUser = "";
		for(var i=0,n=tmpArr1.length;i<n;i++){
			if(tmpArr1[i].length ==0) continue;
			backUser += ";"+tmpArr2[i]+"="+tmpArr1[i];
		}
		backUser = backUser.length>0?backUser.substring(1):"";
		try{
				HorizonDesigner.setSelectUserResult(gTmpPara,backUser);
		}
		catch(e){
				HorizonInstance.setSelectUserResult(gTmpPara,backUser);
		}
		gTmpPara = null;
	}
	
	//选择表单列表
	//参数:Name=ID=TableID|Name=ID=TableID,选择时从列表中去掉已经选择的 表单,避免重复
	//返回参数:参数0,Name=formID=TableID|Name=formID=TableID
	//				 参数1,formid~actionid=name|actionid=name,formid~actionid=name|actionid=name
	//				 参数2,formid~fieldid=name|fieldid=name,formid~fieldid=name|fieldid=name
	function selectFormSWF(){
		var ids = "";
		if(arguments[0].length>0) {
			var tmpArr = arguments[0].split(";");
			for(var i=0,n=tmpArr.length;i<n;i++){
					var tmpForm = tmpArr[i].split("=");
					ids +=(";"+ tmpForm[1]);
			}
		}
		var tmpPara = arguments.length >1?arguments[1]:false;
		gTmpPara = tmpPara;
		window.open(getContextPathSWF()+"/workflow/module/flash/jsp/xmlflow.getFormList.jsp?flag="+(tmpPara?"radio":"checkbox")+"&id="+ids+"&userid="+alluserid,730,520,tmpPara);
		//showModalWin(getContextPathSWF()+"/workflow/module/flash/jsp/xmlflow.getFormList.jsp?flag="+(tmpPara?"radio":"checkbox")+"&id="+ids+"&userid="+alluserid,730,520,tmpPara);
	}
	function selectFormStaticSWF(){
		var ids = "";
		if(arguments[0].length>0) {
			var tmpArr = arguments[0].split("|");
			for(var i=0,n=tmpArr.length;i<n;i++){
					var tmpForm = tmpArr[i].split("=");
					ids +=("|"+ tmpForm[1]);
			}
		}
		var tmpPara = arguments.length >1?arguments[1]:false;
		showModalWin(getContextPathSWF()+"/workflow/module/flash/jsp/xmlflow.getFormStaticList.jsp?flag="+(tmpPara?"radio":"checkbox")+"&id="+ids+"&userid="+alluserid,730,520,tmpPara);
	}
	function selFormResult(myselect,backForm){
		try{
			if(gTmpPara){//替换表单
				HorizonDesigner.replSelectFormResult(myselect,backForm);
			}
			else{
				HorizonDesigner.setSelectFormResult(myselect,backForm);
			}
			
		}catch(e){
			if(gTmpPara){//替换表单
				HorizonInstance.replSelectFormResult(myselect,backForm);
			}
			else{
				HorizonInstance.setSelectFormResult(myselect,backForm);
			}
		}
	}
	
	
	//打开服务器上的数据
	function setFlowType(){
		try{
			HorizonDesigner.setFlowType(arguments[0]);
		}catch(e){
			HorizonInstance.setFlowType(arguments[0]);			
		}
	}
	
	//swf上控件ID ,用于回显
	var ruleObj = null;
	var flowinfo = null;
	var forminfo = null;
	//获取信息
	function initFlowAndFlormInfo(){
		try{
			flowinfo = HorizonWorkflow.getFlowInfo2Rule();
			forminfo = HorizonWorkflow.getFormInfo2Rule();
		}
		catch(e){
            try{
                flowinfo = HorizonDesigner.getFlowInfo2Rule();
                forminfo = HorizonDesigner.getFormInfo2Rule();
            }
            catch(e){
                flowinfo = HorizonInstance.getFlowInfo2Rule();
                forminfo = HorizonInstance.getFormInfo2Rule();
            }
		}
	}
	
	function addRuleResult(code,codeCN,dataid){
		try{
			HorizonDesigner.addRuleResult(ruleObj,code,codeCN,dataid);
		}catch(e){
			HorizonInstance.addRuleResult(ruleObj,code,codeCN,dataid);
		}
		ruleRs = null;
		flowinfo = null;
		forminfo = null;
	}
	
	function getConfig(){
	  return document.getElementById("Config").value;
	}
	function getAlluserid(){
		return alluserid;
	}
	function getUserid(){
		return userid;
	}
	function getUsername(){
		return username;
	}
    
	/**
      进入管理端界面
      @param defaultPath 样式文件路径
    **/
	function eneterManagerJS(defaultPath){	   
	   //window.location.href=getContextPathSWF()+"/horizon/manager/index.jsp";
	   window.open(getContextPathSWF()+"/horizon/manager/index.jsp");
       return false;
	}
	 /**
      进入应用端界面
      @param defaultPath 样式文件路径
    **/
	function eneterApplicationJS(defaultPath){
	    window.open(getContextPathSWF()+"/horizon/operator/index.jsp");
	    return false;
	}
	/**
	    进入登录页面
	**/
	function eneterIndexJS(){
	    //window.location.href=getContextPathSWF()+"/index.jsp";
		window.open(getContextPathSWF()+"/index.jsp",'IndexWindow','width=1024,height=750,top=0,left=0,status=yes,titlebar=no,toolbar=no,scrollbars=yes,resizable=yes');
        return false;
	}
	
	/**
	  退出设计器
	**/
    function exitApplicationJS(){
        $.ajax({
            url: getContextPathSWF()+"/horizon/platform/logout.wf",
            dataType: 'json',
            cache: false,
            async:true,
			type:"POST",
            success: function(data) {
                window.location.href=getContextPathSWF()+data;
            }
        });
	}