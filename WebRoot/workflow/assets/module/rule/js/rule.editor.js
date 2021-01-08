/**
 * 规则
 */
require.config({
    baseUrl: horizon.paths.pluginpath,
    paths: horizon.vars.requirePaths,
    shim: horizon.vars.requireShim
});
require(['jquery', 'jqueryUi', 'bootstrap', 'horizonSelectuser', 'ace', 'horizonJqueryui'], function($) {

    //供外部SWF使用----begin

    //SWF确定时,获取规则代码
    ckValidityInfo = function() {
        return horizon.ruleView.checkRule();
    }; 
    getCodeResult = function() {
        var code = $('#ruleCode').val();
        return code;
    };
    //SWF确定时,获取规则代码中文
    getCodeCNResult = function() {
        var codeCN = $('#ruleCN').val();
        return codeCN;
    };
    //SWF确定时,获取代码存入数据库中的数据id
    getCodeId = function() {
        return horizon.ruleView.ajaxId();
    };
    //SWF确定时,获取规则代码html,用于编辑回显
    getCodeHtml = function() {
        return horizon.ruleView.codeHtml();
    };
    //从SWF中获取html内容,用于前台回显
    getCodeHtmlSWF = function() {
        try {
            return window.parent.HorizonWorkflow.getCodeHtmlSWF();
        } catch (e) {
        	 try {
                 return window.parent.HorizonDesigner.getCodeHtmlSWF();
             } catch (e) {
                 return window.parent.HorizonInstance.getCodeHtmlSWF();
             }
        }
    };
    //从SWF中获取当前节点id
    function getNodeidSWF() {
		try {
			return window.parent.HorizonWorkflow.getNodeid();
		} catch (e) {
			try {
                return window.parent.HorizonDesigner.getNodeid();
            } catch (e) {
                return window.parent.HorizonInstance.getNodeid();
            }
		}
	}
	var currentNodeId = getNodeidSWF();
    var codeHtml = getCodeHtmlSWF();
    //供外部SWF使用----end
	
    var validityInfo = '';//规则是否合法的提示信息
	var ruleNum = 1;//规则数量
	var arrayObj = new Array(); //结果部集合
	var hasKH = false; //是否存在括号
	var code = '';//规则脚本
	var strCN = '';//规则脚本中文
	var flowinfo = new Array(3); //from node flowvar
	var forminfo = null;//流程表单信息
	var html = ''; //规则Html
	var $dialog = $('#dialog');
	var codeId = '';
	horizon['rule'] = {};
   
	//父窗口,总有一个有吧
	if(winObj == undefined){
		winObj = parent;
	}
	if(winObj != undefined){
		winObj.initFlowAndFlormInfo();
	}
	//相对关系
	horizon.rule['orgRelation'] = {
		//初始化调用
		init : function($li) {
			$('#orgRelation-form').css({'margin-top':'70px','margin-left':'30px'});
			horizon.rule.orgRelation.initOrgRelation();
 		    horizon.rule.orgRelation.returnValue($li);
			//改变相对节点
			$('#node').change(function() {
				horizon.rule.orgRelation.nodeChange();
			});
			//改变相对基准
			$('#base').change(function() {
				horizon.rule.orgRelation.baseChange();
			});
		},
		//回显值
		returnValue : function($li) {
			var $bds = $li.closest('div[class*="bds-"]');
 		    var value = $bds.children('a').attr('value');
 		    var datacode = $bds.children('a').attr('datacode');
 		    if(datacode == 'orgRelation'){
 		    	var valArr = value.split(',');
				$('#node').val(valArr[0]);
				horizon.rule.orgRelation.nodeChange();
				$('#relativeNodeid').val(valArr[1]);
				$('#base').val(valArr[2]);
				horizon.rule.orgRelation.baseChange();
				$('#relation').val(valArr[3]);
 		    }else{
				$('#orgRelation-form')[0].reset();
 		    }
		},
		//初始化相对关系下拉菜单
		initOrgRelation : function() {
			horizon.rule.orgRelation.nodeChange();
			if(flowinfo[1] != '' && flowinfo[1] != null){
				var itm = flowinfo[1].split('~');
				for(var i=0;i<itm.length;i++){
					if(itm[i] != ''){
						var temp = itm[i].split('=');
						//添加节点列表，筛选去除开始结束、自动、网关、事件、引擎交互类型的节点
						if(temp[0].indexOf('Start') != -1 || temp[0].indexOf('End') != -1 
						   || temp[0].indexOf('Gateway') != -1 || temp[0].indexOf('Event') != -1 
						   || temp[0].indexOf('Cluster') != -1 || temp[0].indexOf('Robot') != -1 
						   || (currentNodeId != '' && temp[0].indexOf(currentNodeId)!= -1)
						   || temp[0].indexOf('Virtual') != -1||temp[0].indexOf('SubFlow') != -1) continue;
						$('#relativeNodeid').append("<option value='" + temp[0] + "'>" + temp[1] + "</option>");
					}
				}
			}
		},
		//改变相对节点
		nodeChange : function() {
			var data = $('#node').val();
			var $base = $('#base');
			var $relativeNodeid = $('#relativeNodeid');
			$base.children().remove();
			$relativeNodeid.hide();
			if(data == '0'){
				var $option = $('<option value="0">无</option><option value="2">流程启动者</option><option value="3">当前执行人</option>');
				$base.append($option);
			}else if(data == '1'){
				var $option = $('<option value="1">办理人</option>');
				$base.append($option);
			}else if(data == '2'){
				$relativeNodeid.show();
				$('#relativeNodeid option:first-child')[0].selected = true;
				var $option = $('<option value="1">办理人</option>');
				$base.append($option);
			}
			$('#base option:first-child')[0].selected = true;
			horizon.rule.orgRelation.baseChange();
		},
		//改变相对基准
		baseChange : function() {
			var data = $('#base').val();
			var $relation = $('#relation');
			$relation.children().remove();
			if(data == '0'){//无
				if($('#node').val() == '0'){
					var $option = $('<option value="10">流程启动者</option><option value="0">上一节点办理人</option><option value="CurUser">当前执行人</option>');
					$relation.append($option);
				}
			}else if(data == '1' || data == '2' || data == '3'){
				$.ajax({
	                url: horizon.tools.formatUrl('/config/relationship/list'),
	    			dataType: 'json',
	                cache: false,
	                async: false,
	                success:function(data) {
	                	if(data){
                            $.each(data, function(i,org){
                                var $option = $('<option value="' + org.data + '">' + org.name + '</option>');
                                $relation.append($option);
                            });
						}
	                }
	             });
				if($('#relation option:first-child').length>0){
                    $('#relation option:first-child')[0].selected = true;
				}
			}
		},
		//content：要显示的字符串    code:规则脚本    value:用于回显
		isOk : function() {
			var $node = $('#node');
			var $relativeNodeid = $('#relativeNodeid');
			var $base = $('#base');
			var $relation = $('#relation');
					
			var nodetext = $node.val() == '2' ? $relativeNodeid.find('option:selected').text() : $node.find('option:selected').text();
			var basetext = $base.find('option:selected').text();
			var relationtext = $relation.find('option:selected').text();
			var content = '相对[' + nodetext + ']基准[' + basetext + ']的[' + relationtext + ']';
			var value = $node.val() + ',' + $relativeNodeid.val() + ',' + $base.val() + ',' + $relation.val();
			    	
		    var nodeVal = $node.val() == '2' ? $relativeNodeid.find('option:selected').val() : $node.find('option:selected').val();
			if(nodeVal == undefined){
			    nodeVal='null';
			}
			var baseVal = $base.find('option:selected').val();
			var relationVal = $relation.find('option:selected').val();
			var code = '$rulefun.getRelationUser("' + nodeVal + '","' + baseVal + '","' + relationVal + '")';
			return content + '--' + code + '--' + value;
		}
	};
	//组织机构
	horizon.rule['orgSelected'] = {
		init : function($li) {
			$('input[name="orgname"]').on(horizon.tools.clickEvent(),function() {
				$.horizon.selectUser({
					 idField: 'orgid', 
					 cnField: 'orgname',
					 isFlow: true,
				     fnClose: function() {
		   		          $('#orgSelected-form').closest('.ui-dialog').show().next().show();
		   		     }
		   		});
	    		$('#orgSelected-form').closest('.ui-dialog').hide().next().hide();
			});
			var $form = $('#orgSelected-form');
			$form.css({'margin-top':'100px','margin-left':'20px'});
			var $bds = $li.closest('div[class*="bds-"]');
 		    var datacode = $bds.children('a').attr('datacode');
 		    if(datacode == 'orgSelected'){
 		    	var value = $bds.children('a').attr('value');
 		    	var name = $bds.children('a').html();
 		   	    $('input[name="orgid"]').val(value);
 		   	    $('input[name="orgname"]').val(name);
 		    }else{
 		    	$form[0].reset();
 		    }
		},
		// name：要显示的字符串 code:规则脚本 id:用于回显值
		isOk : function() {
			var id = $('input[name="orgid"]').val();
			var $orgName = $('input[name="orgname"]');
			var name = $orgName.val() == "" ? "\"\"" : $orgName.val();
			var code = "\"" + id + "\"";
			return name + '--' + code + '--' + id;
		}
	};
	//字符串
	horizon.rule['stringConstant'] = {
		init: function($li) {
			var $area = $('#StringConstant-form').children();
			$area.css({'width':'100%','height':'276px'});
			$area.children().focus();
			horizon.rule.stringConstant.returnValue($li);
		},
		//回显值
		returnValue : function($li) {
			var $form = $('#StringConstant-form');
			var $bds = $li.closest('div[class*="bds-"]');
 		    var datacode = $bds.children('a').attr('datacode');
 		    if(datacode == 'stringConstant'){
 		    	var value = $bds.children('a').attr('value');
 		    	$form.children().val(value);
 		    }else{
 		    	$form[0].reset();
 		    }
		},
		//要显示的字符串 -- 规则脚本 -- 用于回显值   
		isOk: function() {
			var value = $('#StringConstant-form').children().val();
		    var code = '\"' + value + '\"';
		    return code + '--' + code + '--' + value;
		}
	};
	//数字
	horizon.rule['numConstant'] = {
		init : function($li) {
			var $textarea = $('#NumConstant-form').children('textarea');
			$textarea.focus();
			$textarea.css({'width':'100%','height':'265px'});
			$textarea.keyup(function() {
				var $this = $(this);
				if(isNaN($this.val())){
					$this.val('');
				}
			});
			horizon.rule.numConstant.returnValue($li);
		},
		returnValue : function($li) {
			var $form = $('#NumConstant-form');
			var $bds = $li.closest('div[class*="bds-"]');
 		    var datacode = $bds.children('a').attr('datacode');
 		    if(datacode == 'numConstant'){
 		    	var value = $bds.children('a').attr('value');
 		    	$form.children().val(value);
 		    }else{
 		    	$form[0].reset();
 		    }
		},
		//要显示的字符串 -- 规则脚本 -- 用于回显值   
		isOk : function() {
			var content = $('#NumConstant-form').children('textarea').val();
			var code = "\"" + content +"\"";
		    return content + '--' + code + '--' + content;
		}
	};
	//是否到达合并节点
	horizon.rule['trackReached'] = {
		init : function($li) {
			horizon.rule.trackReached.initSelect();
			horizon.rule.trackReached.returnValue($li);
		},
		returnValue : function($li) {
			var $form = $('#trackReached-form');
			$form.css({'margin-top':'110px','margin-left':'15px'});
			var $bds = $li.closest('div[class*="bds-"]');
 		    var datacode = $bds.children('a').attr('datacode');
			if(datacode == 'trackReached'){
				var value = $bds.children('a').attr('value');
				$('#mergeNodeid').val(value);
			}else{
				$form[0].reset();
			}
		},
		// 初始化合并节点的下拉列表
	    initSelect : function() {
			if (flowinfo[1] != "" && flowinfo[1] != null) {
				var itm = flowinfo[1].split("~");
				for (var i = 0; i < itm.length; i++) {
					if (itm[i] != "") {
						var temp = itm[i].split("=");
						if(temp[0].indexOf('Start') != -1 || temp[0].indexOf('End') != -1 
								   || temp[0].indexOf('Gateway') != -1 || temp[0].indexOf('Event') != -1 
								   || temp[0].indexOf('Cluster') != -1 || temp[0].indexOf('Robot') != -1
								   || temp[0].indexOf('Virtual') != -1) continue;
						$('#mergeNodeid').append("<option value='" + temp[0] + "'>" + temp[1] + "</option>");
					}
				}
			}
		},
		// content：要显示的字符串 code:规则脚本 value:用于回显值
		isOk : function() {
			var $nodeId = $('#mergeNodeid').find('option:selected');
			var content = '实例节点【' + $nodeId.text() + '】是否到达合并节点';
			var value = $nodeId.val();
			var code = '$rulefun.TrackReached("' + value + '")';
			return content + '--' + code + '--' + value;
		}
	};
	//节点状态值
	horizon.rule['nodeStatusValue'] = {
		init : function($li) {
			var $form = $('#NodeStatusValue-form');
			$form.css({'margin-top':'60px','margin-left':'130px'});
			var $bds = $li.closest('div[class*="bds-"]');
			var datacode = $bds.children('a').attr('datacode');
			if(datacode == 'nodeStatusValue'){
				var value = $bds.children('a').attr('value');
				$form.find('input[value="' + value + '"]')[0].checked = true;
			}else{
				$form[0].reset();
			}
		},
		// content：要显示的字符串 code:规则脚本 value:用于回显值
		isOk : function() {
			var $form = $('#NodeStatusValue-form');
			var $node = $form.find("input[name='NodeStatusValue'][type='radio']:checked");
			var val = $node.next('.lbl').html(); 
		    var value = $node.attr('value'); 
		    var code = "\"" + value + "\"";
		    var content = "\"" + val + "\"";
			return content + '--' + code + '--' + value;
		}
	};
	//布尔值
	horizon.rule['boolean'] = {
		init : function($li) {
			var $form = $('#boolean-form');
			$form.css({'margin-top':'100px','margin-left':'160px'});
			var $bds = $li.closest('div[class*="bds-"]');
			var datacode = $bds.children('a').attr('datacode');
			if(datacode == 'boolean'){
				var value = $bds.children('a').attr('value');
				$form.find('input[value="' + value + '"]')[0].checked = true;
			}else{
				$form[0].reset();
			}
		},
		//要显示的字符串 -- 规则脚本 -- 用于回显值
		isOk : function() {
			var content = $('#boolean-form').find("input[name='booleanValue'][type='radio']:checked").val(); 
			return content + '--' + content + '--' + content;
		}
	};
	//布尔值(字符串)
	horizon.rule['booleanString'] = {
		init : function($li) {
			var $form = $('#booleanString-form');
			$form.css({'margin-top':'100px','margin-left':'160px'});
			var $bds = $li.closest('div[class*="bds-"]');
			var datacode = $bds.children('a').attr('datacode');
			if(datacode == 'booleanString'){
				var value = $bds.children('a').attr('value');
				$form.find('input[value="' + value + '"]')[0].checked = true;
			}else{
				$form[0].reset();
			}
		},
		//要显示的字符串 -- 规则脚本 -- 用于回显值
		isOk : function() {
			var value = $('#booleanString-form').find("input[name='booleanValue'][type='radio']:checked").val(); 
	    	var content = "\"" + value + "\"";
			return content + '--' + content + '--' + value;
		}
	};
	//流程变量
	horizon.rule['varValue'] = {
		init : function($li) {
			horizon.rule.varValue.initVar();
			var $form = $('#varValue-form');
			$form.css({'margin-top':'100px','margin-left':'20px'});
			var $bds = $li.closest('div[class*="bds-"]');
			var datacode = $bds.children('a').attr('datacode');
			if(datacode == 'varValue'){
				var value = $bds.children('a').attr('value');
				$('#varid').val(value);
			}else{
				$form[0].reset();
			}
		},
		//初始化流程变量下拉列表
		initVar : function() {
			if(flowinfo[2] != '' && flowinfo[2] != null){
				var itm = flowinfo[2].split("~");
				for(var i=0;i<itm.length;i++){
					if(itm[i] != ''){
						var temp = itm[i].split('=');
						$('#varid').append("<option value='" + temp[0] + "'>" + temp[1] + "</option>");
					}
				}
			}
		},
		// content：要显示的字符串 code:规则脚本 value:用于回显值
		isOk : function() {
			var $var = $('#varid').find('option:selected');
			var content = $var.text();
		    var value = $var.val();
		    if(value == undefined){
		    	value = '';
		    	content = "\"" + "" + "\"";;
		    }
		    var code = '$rulefun.getVarValue("' + value + '")';
			return content + '--' + code + '--' + value;
		}
	};
	//分支全部到达
	horizon.rule['simpleMerge'] = {
		init : function(){
			$div = $('#simpleMerge-container').css({'margin':'80px','font-size':'15px'});
		},
		// content：要显示的字符串 code:规则脚本 value:用于回显值
		isOk : function() {
			var content = "所有分支是否到达";
			var code = '$rulefun.allTrackReached()';
			return content + '--' + code + '--' + content;
		}
	};
	//节点状态
	horizon.rule['nodeStatus'] = {
		init : function($li) {
			horizon.rule.nodeStatus.initNode();
			var $form = $('#nodeStatus-form');
			$form.css({'margin-top':'110px','margin-left':'10px'});
			var $bds = $li.closest('div[class*="bds-"]');
			var datacode = $bds.children('a').attr('datacode');
			if(datacode == 'nodeStatus'){
				var value = $bds.children('a').attr('value');
				$('#nodeidStatus').val(value);
			}else{
				$form[0].reset();
			}
		},
		initNode : function() {
			if(flowinfo[1] != '' && flowinfo[1] != null){
				var itm=flowinfo[1].split('~');
				for(var i=0;i<itm.length;i++){
					if(itm[i]!=''){
						var temp = itm[i].split('=');
						if(temp[0].indexOf('Start') != -1 || temp[0].indexOf('End') != -1 
								   || temp[0].indexOf('Gateway') != -1 || temp[0].indexOf('Event') != -1 
								   || temp[0].indexOf('Cluster') != -1 || temp[0].indexOf('Robot') != -1
								   || temp[0].indexOf('Virtual') != -1) continue;
						$('#nodeidStatus').append("<option value='"+temp[0]+"'>"+temp[1]+"</option>");
					}
				}
			}
		},
		// content：要显示的字符串 code:规则脚本 value:用于回显值
		isOk : function() {
			var $nodeId = $('#nodeidStatus').find('option:selected');
			var content = "实例节点【" + $nodeId.text() + "】状态";
		    var value = $nodeId.val();
		    var code = '$rulefun.getNodeStatus("' + value + '")';
			return content + '--' + code + '--' + value;
		}	
	};
	//表单字段(字符串)
	horizon.rule['formFieldValue'] = {
		init : function($li) {
			formFieldInit.initForm('val');
			//给表单赋值
			$('#formnameVal').change(function() {
				formFieldInit.formchange($(this));
			});
			var $form = $('#formFieldValue-form');
			$form.css({'margin-top':'90px','margin-left':'40px'});
			var $bds = $li.closest('div[class*="bds-"]');
			var datacode = $bds.children('a').attr('datacode');
			if(datacode == 'formFieldValue'){
				var value = $bds.children('a').attr('value');
				$('#formnameVal').val(value.slice(0,value.indexOf('_')));
                formFieldInit.formchange($('#formnameVal'));
				$('#fieldnameVal').val(value.slice(value.indexOf('_') + 1,value.length));
			}else{
				$form[0].reset();
			}
		},
		//content：要显示的字符串 code:规则脚本 value:用于回显值
		isOk : function() {
			var $formnameVal = $('#formnameVal');
			var $fieldnameVal2 = $('#fieldnameVal2');
			var $fieldnameVal = $('#fieldnameVal');
			var content = '定制表单字段[' + $formnameVal.find('option:selected').text() + '_' +
				 			  ($fieldnameVal.is(':hidden') ? $fieldnameVal2.val() : 
				 				 $fieldnameVal.find('option:selected').text()) + ']';
		    var value = $formnameVal.val() + '_' + ($fieldnameVal.is(':hidden') ?
		        			$fieldnameVal2.val() : $fieldnameVal.val());
		    var code = '$rulefun.getFieldValue("' + value + '")';
		    return content + '--' + code + '--' + value;
		}	
	};
	//表单字段(数字)
	horizon.rule['formFieldNum'] = {
		init : function($li) {
			formFieldInit.initForm('num');
			//给表单赋值
			$('#formnameNum').change(function() {
				formFieldInit.formchange($(this));
			});
			var $form = $('#formFieldNum-form');
			$form.css({'margin-top':'90px','margin-left':'40px'});
			var $bds = $li.closest('div[class*="bds-"]');
			var datacode = $bds.children('a').attr('datacode');
			if(datacode == 'formFieldNum'){
				var value = $bds.children('a').attr('value');
				$('#formnameNum').val(value.slice(0,value.indexOf('_')));
                formFieldInit.formchange($('#formnameNum'));
				$('#fieldnameNum').val(value.slice(value.indexOf('_') + 1,value.length));
			}else{
				$form[0].reset();
			}
		},
		isOk : function() {
			var $formnameNum = $('#formnameNum');
			var $fieldnameNum2 = $('#fieldnameNum2');
			var $fieldnameNum = $('#fieldnameNum');
			var content = '定制表单字段[' + $formnameNum.find('option:selected').text() + '_' + 
							      ($fieldnameNum.is(':hidden') ? $fieldnameNum2.val() : $fieldnameNum
							     .find('option:selected').text()) + ']';
			var value = $formnameNum.val() + '_' + ($fieldnameNum.is(':hidden') ?
						$fieldnameNum2.val() : $fieldnameNum.val());
			var code = '$rulefun.getFieldValue("' + value + '")';
			return content + '--' + code + '--' + value;
		}
	};
	//初始化表单
	var formFieldInit = {
		//初始化表单的下拉列表
		initForm : function(type) {
			if(forminfo != null && forminfo != ''){
				var its = forminfo.split(';');
				if(its != ''){
					for(var i = 0 ; i < its.length ; i++){
						var forms = its[i].split(':');
						//添加表单列表，筛选去除流程跟踪表单和正文
						if(its[i].indexOf('FlowTrack') != -1 || its[i].indexOf('HZsTInZZ9sqlT5DGsrIMYLl6AjMDCemp')!=-1) continue;
						if(type == 'val'){
							$('#formnameVal').append("<option value='" + forms[0] + "'>" + forms[1] + "</option>");
						}else{
							$('#formnameNum').append("<option value='" + forms[0] + "'>" + forms[1] + "</option>");
						}
					}
					if(type == 'val'){
						formFieldInit.formchange($('#formnameVal'));
					}else{
						formFieldInit.formchange($('#formnameNum'));
					}
				}
			}
		},
		//改变表单
		formchange : function($this) {
			var formid = $this.val();
			var type = $this.attr('id').slice(-3);
			var $formname = $this;
			var $fieldname = $('#fieldname' + type);
			var $fieldneme2 = $('#fieldname' + type + '2');
            $.ajax({
                url: horizon.tools.formatUrl('/rule/form/field'),
                data:{
                	formid: formid
    			},
    			dataType:'json',
                cache:false,
                async:false,
                success:function(data){
                	formFieldInit.callbackRule(data,$formname,$fieldname,$fieldneme2);
                }
             });
		},
		callbackRule : function(data,$formname,$fieldname,$fieldneme2){
			var isnew = 0;
			var c= null;
			$fieldname.empty();
			if(data == '' || data == 'undefined'){
				$formname.hide();
				$fieldname.hide();
				$fieldneme2.hide();
				if(c != null && c.length > 1)
					$fieldneme2.val(c[1]);
			}else{
				$fieldname.show();
				$fieldneme2.hide();
				var info = data.split('^');
				var field = info[1].split('~');
				var fields = field[1].split(';');
				if(fields == ''){
					$fieldname.hide();
					$fieldneme2.show();
				}else{
					for(var i = 0 ; i < fields.length ; i++){
						if(fields[i] == '') continue;
						var forms = fields[i].split('=');
						$fieldname.append("<option value='" + forms[0] + "'>" + forms[1] + "</option>");
					}
					if(isnew == 0 && c != null){
						$fieldname.val(c[1]);
						isnew++;
					}
				}
			}
		}
	};
	horizon.ruleView = {
		//生成id
		ajaxId : function() {
			if(dataid == '' || dataid == null){
				var id = '';
				$.ajax({
				     url : horizon.tools.formatUrl('/rule/create/id'),
			     	 dataType:'json',
				     cache:false,
				     async:false,
				     success:function(data){
				           id=data;
				     }
				});
			}
			return id;
		},
		//获取规则html
		codeHtml : function() {
			html = $('.if-container').html() + '--codeHtml--' + $('.else-container').html();
			var $msg = $('.msg');
			$msg.each(function(){
				var $this = $(this);
				html += '--codeHtml--' + $this.val();
			});
			return html;
		},
		//获取流程变量和表单数据
		initData : function() {
			try{
				if(winObj.flowinfo != null){
					flowinfo = winObj.flowinfo.split(';');
				}
				if(winObj.forminfo != null){
					forminfo = winObj.forminfo;
				}
			}catch(e){

			}
		},
		//初始化规则对象
		initRuleObject : function() {
			$('.menu-ruleObject-type').html('');
        	$('.menu-ruleObject-return').html('');
			$.ajax({
				url: horizon.tools.formatUrl('/rule/list'),
				cache:false,
	            dataType:'json',
	            success:function(data){
	                if(data && data.length>0) {
	                	var $newRuleObject = $('.default-menu-ruleObject').children().clone();
	                	var objectType = data[0].objectType;
	                	$newRuleObject.find('.pull-left').html(objectType);
	                	$newRuleObject.find('a').attr('datatype',objectType);
	                	var $option = $('<li><a href="#nogo">' + data[0].objectName + '</a></li>');
	                	$option.attr('datacode',data[0].objectCode);
	                	$option.attr('validbds',data[0].validBds);
	                	$option.attr('validobj',data[0].validObj);
	                	$option.attr('returntype',data[0].returnType);
	                	$option.attr('objectInput',data[0].objectInput);
	                	$option.data('ruleObject',data[0]);
	                	$newRuleObject.find('.menu-ruleObject-name').append($option);
	                		
	                	$('.menu-ruleObject-type').append($newRuleObject);
	                	$('.menu-ruleObject-return').append($newRuleObject);
	                		
	                	for(var i=1,len=data.length;i<len;i++) {
	                		var $option=$('<li><a href="#nogo">' + data[i].objectName + '</a></li>');
	                		$option.attr('datacode',data[i].objectCode);
	                		$option.attr('validbds',data[i].validBds);
		                	$option.attr('validobj',data[i].validObj);
		                	$option.attr('returntype',data[i].returnType);
		                	$option.attr('objectInput',data[i].objectInput);
    	                	$option.data('ruleObject',data[i]);
    	                		
	                		if(objectType == data[i].objectType) {
	                			$('a[datatype="' + objectType + '"]').next('.menu-ruleObject-name').append($option);
	                		}else{
	                			objectType = data[i].objectType;
	                			$newRuleObject = $('.default-menu-ruleObject').children().clone();
	                			$newRuleObject.find('.pull-left').html(objectType);
	                			$newRuleObject.find('a').attr('datatype',objectType);
	    	                	$newRuleObject.find('.menu-ruleObject-name').append($option);
	    	                	$('.menu-ruleObject-type').append($newRuleObject);
	    	                	$('.menu-ruleObject-return').append($newRuleObject);
	                		}
	                	}
	                		
	                	horizon.ruleView.initReturnRuleObject();
	                		
	                	$('.menu-ruleObject-name').children('li').on(horizon.tools.clickEvent(),function() {
	                		horizon.ruleView.openRuleObject($(this));
	                	});
	                }
	            }
			});
		},
		openRuleObject : function($this) {
			var objectInput = $this.attr('objectInput');
			var objectCode = $this.attr('datacode');
			var title = $this.children('a').html();
     		var $ruleContainer = $('.rule-container');
     		$ruleContainer.html(objectInput);
     		if(objectInput.indexOf('&') > -1){
     			var html = $ruleContainer.text();
         		$ruleContainer.html(html);
     		}
     		//给修改赋参数
     		var $bds = $this.closest('div[class*="bds-"]');
     		$bds.find('.update-return-bds').parent('li').attr('objectInput',objectInput);
     		//初始化规则对象
     		horizon.rule[objectCode].init($this);
     		$ruleContainer.dialog({
     			width: $(window).width() > 400 ? '400':'auto',
		        height: $(window).width() > 380 ? '380':'auto',
		        maxHeight: $(window).height(),
				title:title,
				closeText:'取消',
				buttons:[
				    {
				    	html: '确定',
				    	"class" : "btn btn-primary btn-xs",
				    	click: function() {
				    	     var ruleObjectvalue =  horizon.rule[objectCode].isOk();
				    	     horizon.ruleView.returnObject($this,ruleObjectvalue.split('--'));
				    	     $(this).dialog('close');
				    	} 
					}
				]
     		});
		},
		//根据RETURNTYPE显示返回值中不同的规则对象
		initReturnRuleObject : function() {
			if(RETURNTYPE != null && RETURNTYPE != ''){
				var $returnRuleObject = $('.menu-ruleObject-return').children();
				$returnRuleObject.each(function() {
					var $li = $(this);
					var flag = false;
					var $name = $li.find('.menu-ruleObject-name').children();
					$name.each(function() {
						var $this = $(this);
						if($this.attr('returntype').toLowerCase() == RETURNTYPE.toLowerCase()) {
							flag = true;
	                	}else{
	                		$this.hide();
	                	}
					});
					if(flag == false){
						$li.hide();
					}
				});
			}
		},
		//返回选择对象
		returnObject : function($li,arrValue) {
			var objectcode = $li.attr('datacode');
			var validbds = $li.attr('validbds');
			var validobj = $li.attr('validobj');
			var ruleObject = $li.data('ruleObject');
				
			var $bds = $li.parents('div[class*="bds-"]');
			var $a = $bds.first().children('a');
			$a.attr('value',arrValue[2]);
			$a.attr('code',arrValue[1]);
			$a.html(arrValue[0]);
			$bds.attr('data-original-title',arrValue[0]);
				
			$a.attr('datacode',objectcode);
			$bds.find('.update-return-bds').parent('li')
					.attr({'datacode':objectcode,'validbds':validbds,'validobj':validobj})
					.removeClass('hidden').prev('li').removeClass('hidden');
				
			var arrBds = validbds.split(',');
			var arrObj = validobj.split(',');
				
			//显示对应的运算符
			var $ysfBoxUl = $bds.next('.ysf-box').children('ul');
			var $ysf = $ysfBoxUl.children().addClass('hidden');
			$ysf.each(function(i){
				var $this = $(this);
				var type = $this.children('a').attr('codeType');
				for(var j=0,len=arrBds.length;j<len;j++){
					if(type == arrBds[j]){
						$this.removeClass('hidden');
					}
				}
			});
			if($bds.hasClass('bds-left')) {
				var $firstLi = $ysfBoxUl.find('li[class!="hidden"]').eq(0);	
				horizon.ruleView.changeYsf($firstLi.children());
			}
			//显示对应的规则对象
			var $objName = $bds.next().next('.bds-right').find('.menu-ruleObject-name');
			$objName.each(function(){
				var $name = $(this);
				$name.parent().addClass('hidden');
				$name.children().each(function(i){
					var $obj = $(this);
					$obj.addClass('hidden');
					var datacode = $obj.attr('datacode');
					for(var j=0,len=arrObj.length;j<len;j++){
						if(datacode == arrObj[j]){
							$obj.removeClass('hidden');
							$name.parent().removeClass('hidden');
						}
					}
				});
			});
		},
		//初始化规则
		initRule : function() {
			ruleNum = 1;
			var $ifBox =  $('.if-container').children('.if-box');
			var $elseBox = $('.else-container').children('.else-box');
			$ifBox.find('.widget-title').html('规则' + ruleNum);
			if(codeHtml == '' || codeHtml == null || codeHtml == undefined){
				$ifBox.find('a[data-action="close"]').parent('.widget-toolbar').addClass('hidden');
			}else{
				var codeHtmlArr = codeHtml.split('--codeHtml--');
				$('.if-container').html(codeHtmlArr[0]);
				$('.else-container').html(codeHtmlArr[1]);
				var i = 1;
				$('.msg').each(function(){
					var $this = $(this);
					if(codeHtmlArr[i+1] != null || codeHtmlArr[i+1] != undefined){
						$this.val(codeHtmlArr[i+1]);
					}
					i++;
				});
				$ifBox = $('.if-container').children('.if-box');
				$elseBox = $('.else-container').children('.else-box');
				//删除逻辑判断条件
				$ifBox.find('.del-ljpd').on(horizon.tools.clickEvent(),function() {
					horizon.ruleView.delLjpd($(this));
				});
				// 删除规则
				$ifBox.on('closed.ace.widget',function() {
					horizon.ruleView.delRule($(this));
				});
				//变换交集并集
				$ifBox.find('.UN').on(horizon.tools.clickEvent(),function() {
					horizon.ruleView.changeUN($(this));
				});
				//删除括号
				$ifBox.find('.delKh').on(horizon.tools.clickEvent(),function() {
					$(this).parents('.kh-box').remove();
				});
				//删除表达式
				$ifBox.find('.del-return-bds').on(horizon.tools.clickEvent(),function() {
					horizon.ruleView.delReturnBds($(this));
				});
				//变换逻辑运算符(或者/并且)
				$ifBox.find('.ljf').on(horizon.tools.clickEvent(),function() {
					horizon.ruleView.changeAndOr($(this));
				});
				//变换交集并集
				$elseBox.find('.UN').on(horizon.tools.clickEvent(),function() {
					horizon.ruleView.changeUN($(this));
				});
				//删除括号
				$elseBox.find('.delKh').on(horizon.tools.clickEvent(),function() {
					$(this).parents('.kh-box').remove();
				});
				//删除表达式
				$elseBox.find('.del-return-bds').on(horizon.tools.clickEvent(),function() {
					horizon.ruleView.delReturnBds($(this));
				});
			}
			// 删除规则
			$ifBox.on('closed.ace.widget',function() {
				horizon.ruleView.delRule($(this));
			});
			//变换逻辑运算符(或者/并且)
			$ifBox.find('.ljf').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.changeAndOr($(this));
			});
			//if修改规则规则
			$ifBox.find('.update-return-bds').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.updateRuleObject($(this));
			});
			//else修改规则规则
			$elseBox.find('.update-return-bds').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.updateRuleObject($(this));
			});
		},
		//变换逻辑运算符(或者/并且)
		changeAndOr : function($this) {
			var type = $this.attr('type');
			var code = $this.attr('code');
			var $parent = $this.parent();
			$parent.parent().prev().attr('code',code);
			if(type == 'or') {
				$parent.parent().prev().html('或者');
				$parent.addClass('hidden');
				$parent.next().removeClass('hidden');
			}else{
				$parent.parent().prev().html('并且');
				$parent.addClass('hidden');
				$parent.prev().removeClass('hidden');
			}
		},
		//变换交集并集
		changeUN : function($this) {
			var code = $this.attr('code');
			var $parent = $this.parent();
			if(code == 'U') {
				$parent.parent().prev().html('并');
				$parent.parent().prev().attr('code','U');
				$parent.prev().removeClass('hidden');
				$parent.addClass('hidden');
			}else{
				$parent.parent().prev().html('交');
				$parent.parent().prev().attr('code','N');
				$parent.next().removeClass('hidden');
				$parent.addClass('hidden');
			}
		},
		//修改规则对象
		updateRuleObject : function($this) {
			var objectcode = $this.parent().attr('datacode');
			var $li = $this.parent().prev().prev().find('li[datacode="' + objectcode + '"]');
			var value = $li.parents('div[class*="bds-"]').first().children('a').attr('value');
			horizon.ruleView.openRuleObject($li);
		},
		//删除逻辑判断条件
		delLjpd : function($this) {
			$this.parents('.ljpd-box').hide(500, function() {
				$this.parent().parent('.ljpd-box').remove();
			});
		},
		//添加判断条件
		addLjpd : function($this) {
			var $newLjpd = $('.hidden-box').children('.ljpd-box').clone();
			$this.parent().parent().after($newLjpd);
			//添加逻辑判断条件
			$newLjpd.find('.add-ljpd').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.addLjpd($(this));
			});
			//删除逻辑判断条件
			$newLjpd.find('.del-ljpd').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.delLjpd($(this));
			});
			//修改规则
			$newLjpd.find('.update-return-bds').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.updateRuleObject($(this));
			});
			//添加括号
			$newLjpd.find('.kh').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.addkh($(this));
			});
			//变换逻辑运算符(或者/并且)
			$newLjpd.find('.ljf').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.changeAndOr($(this));
			});
			//变换运算符
			$newLjpd.find('.ysf').on(horizon.tools.clickEvent(),function(){
				horizon.ruleView.changeYsf($(this));
			});
			//选择规则对象
        	$newLjpd.find('.menu-ruleObject-name').children('li').on(horizon.tools.clickEvent(),function() {
        		horizon.ruleView.openRuleObject($(this));
        	});
			//激活提示框
			$('[data-rel=tooltip]').tooltip();
		},
		//添加括号
		addkh : function($this) {
			var type = $this.attr('dataType');
			var $kh = $('.hidden-box').children('.kh-box').clone();
			var $parent = $this.parent().parent().parent();
			if(type == 'addZkh') {
				$kh.children('a').attr({'type':'zkh','code':'('}).html('&nbsp;(&nbsp;');
				$parent.before($kh);
			}else{
				$kh.children('a').attr({'type':'ykh','code':')'}).html('&nbsp;)&nbsp;');
				$parent.after($kh);
			}
			//删除括号
			$kh.find('.delKh').on(horizon.tools.clickEvent(),function() {
				$(this).parents('.kh-box').remove();
			});
		},
		//添加交集并集
		addYsfUN : function($this) {
			var type = $this.attr('type');
			var $UN = $('.hidden-box').children('.UN-box').clone();
			var $bds = $('.hidden-box').children('.bds-return').clone();
				
			if(type == 'orgIntersection'){
				//添加交集
				$UN.addClass('orgIntersection-box').children('a').html('交');
				$UN.addClass('orgUnion-box').children('a').attr('code','N');
				$UN.find('a[class="UN"][code="N"]').parent().addClass('hidden');
			}else{
				//添加并集
				$UN.addClass('orgUnion-box').children('a').html('并');
				$UN.addClass('orgUnion-box').children('a').attr('code','U');
				$UN.find('a[class="UN"][code="U"]').parent().addClass('hidden');
			}
			$this.parents('.bds-return').after($UN);
			$this.parents('.bds-return').next('.UN-box').after($bds);
				
			//单击表达式时更改方向
			$bds.children('a').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.changeReturnCaret($bds);
			});
			//添加交集并集
			$bds.find('.ysfUN').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.addYsfUN($(this));
			});
			//删除表达式
			$bds.find('.del-return-bds').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.delReturnBds($(this));
			});
			//添加括号
			$bds.find('.kh').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.addkh($(this));
			});
			//变换交集并集
			$UN.find('.UN').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.changeUN($(this));
			});
			//修改规则
			$bds.find('.update-return-bds').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.updateRuleObject($(this));
			});
			//选择规则对象
			$bds.find('.menu-ruleObject-name').children('li').on(horizon.tools.clickEvent(),function() {
        		horizon.ruleView.openRuleObject($(this));
        	});
			$('[data-rel=tooltip]').tooltip();
		},
		//更改表达式方向
		changeReturnCaret : function($this) {
			var allWidth = $this.parent('.div-return').innerWidth();
			var curLeft = $this[0].offsetLeft; //当前对象距父对象的距离
			var $dropdown = $this.find('.dropdown-hover');
			if(curLeft > allWidth/2){
				$dropdown.find('.dropdown-menu').addClass('dropdown-menu-right');
				$dropdown.find('i').removeClass('fa-caret-right').addClass('fa-caret-left');
			}else{
				$dropdown.find('.dropdown-menu').removeClass('dropdown-menu-right');
				$dropdown.find('i').removeClass('fa-caret-left').addClass('fa-caret-right');
			}
		},
		//删除表达式
		delReturnBds : function($this) {
			var $bdsReturn = $this.parents('.bds-return');
			$bdsReturn.prevUntil('.UN-box').remove();
			$bdsReturn.prev().remove();
			$bdsReturn.next('.tooltip').remove();//删除tooltip遗留下来的div
			$bdsReturn.remove();
		},
		//验证规则是否合法
		checkRule : function() {
			$('.tooltip').remove();
			validityInfo = '';
			//验证规则
			var $ifBox = $('.if-container').children('.if-box');
			$ifBox.each(function(i){
				var $thisIf = $(this);
				var $whenInfo = $thisIf.find('.when-info');//如果
				var flag = '0';//提示信息标识  0：规则合法  1：没有设置有效的条件  2：缺少左括号 3：缺少右括号
				var zkhLen = 0;
				var ykhLen = 0;
				for(var j=0,len = $whenInfo.children().length;j<len;j++){
					var $box = $($whenInfo.children()[j]);
					var leftValue = $box.children('.bds-left').children('a').attr('code');//左表达式的value
					var rightValue = $box.children('.bds-right').children('a').attr('code');//左表达式的value
					zkhLen += $box.children('.kh-box').children('a[type="zkh"]').length;
					ykhLen += $box.children('.kh-box').children('a[type="ykh"]').length;
					if(leftValue == '' || rightValue == ''){
						flag = '1';
						break;
					}
				}
				if(flag == '1'){
					validityInfo += (validityInfo != '' ? '<br/>' : '') + '第' + (i + 1) + '条规则的"如果"中没有设置有效的条件！';
				}else if(zkhLen < ykhLen){
					validityInfo += (validityInfo != '' ? '<br/>' : '') + '第' + (i + 1) + '条规则的"如果"中缺少左括号！';
				}else if(zkhLen > ykhLen){
					validityInfo += (validityInfo != '' ? '<br/>' : '') + '第' + (i + 1) + '条规则的"如果"中缺少右括号！';
				}
				flag='0';
				var $thenInfo = $thisIf.find('.then-info');//那么
				var $bdsReturn = $thenInfo.find('.bds-return');
				for(var j=0,len = $bdsReturn.length;j<len;j++){
					var $box = $($bdsReturn[j]);
					var value = $box.children('a').attr('code');
					if(value == ''){
						flag = '1';
						break;
					}
				}
				var $khBox = $thenInfo.children().children('.div-return').children('.kh-box');
				var zkhLen = $khBox.children('a[type="zkh"]').length;
				var ykhLen = $khBox.children('a[type="ykh"]').length;
				if(flag == '1'){
					validityInfo += (validityInfo != '' ? '<br/>' : '') + '第' + (i + 1) + '条规则的"那么"中没有设置有效的条件！';
				}else if(zkhLen > ykhLen){
					validityInfo += (validityInfo != '' ? '<br/>' : '') + '第' + (i + 1) + '条规则的"那么"中缺少右括号！';
				}else if(zkhLen < ykhLen){
					validityInfo += (validityInfo != '' ? '<br/>' : '') + '第' + (i + 1) + '条规则的"那么"中缺少左括号！';
				}
			});
			//验证否则
			flag = '0'; 
			var $elseInfo = $('.else-container').find('.else-box').find('.else-info');
			var $elseBds = $elseInfo.find('.bds-return');
			for(var j=0,len = $elseBds.length;j<len;j++){
				var $box = $($elseBds[j]);
				var value = $box.children('a').attr('code');
				if(value == ''){
					flag = '1';
					break;
				}
			}
			var $kh = $elseInfo.children().children('.div-return').children('.kh-box');
			var zkhLen = $kh.children('a[type="zkh"]').length;
			var ykhLen = $kh.children('a[type="ykh"]').length;
			if(flag == '1'){
				validityInfo += (validityInfo != '' ? '<br/>' : '') + '否则中没有设置有效的返回值！';
			}else if(zkhLen > ykhLen){
				validityInfo += (validityInfo != '' ? '<br/>' : '') + '否则中缺少右括号！';
			}else if(zkhLen < ykhLen){
				validityInfo += (validityInfo != '' ? '<br/>' : '') + '否则中缺少左括号！';
			}
			if(validityInfo != ''){
				$dialog.dialog({
					width:'350',
					title:'提示',
					dialogText: validityInfo,
					dialogTextType:'alert-danger',
					   closeText:'关闭'
				});
				$('.rule-script').children('#ruleCodeShow').html('');
				$('#ruleCN').val('');
				$('#ruleCode').val('');
			}else{
				var code = horizon.ruleView.ruleScript();//生成规则脚本代码
				$('.rule-script').children('#ruleCodeShow').html(code);
				$('#ruleCN').val(strCN);
				$('#ruleCode').val(code);
			}
			return validityInfo;
		},
		//生成规则脚本脚本
		ruleScript : function() {
			code = " package com.sample;\n import com.horizon.wf.third.hz.rule.drools.ScriptBean;\n import com.horizon.wf.third.hz.rule.drools.RuleFun;";
			strCN = "";
			var $ifBox = $('.if-container').children('.if-box');
			var num = 0;
			$ifBox.each(function(i){
				num = i;
				var $thisIf = $(this);
				code += "\n\n rule \"r" + i + "\" \n salience " + i + " \n when \n $ta:ScriptBean() &&\n $rulefun:RuleFun() && (";
					
				//如果
				var $whenInfo = $thisIf.find('.when-info');
					
				if(strCN != "") strCN += "\n\n如果:\n";
				else strCN += "如果:\n";
					
				code += horizon.ruleView.whenCode($whenInfo);
					
				//那么
				var $thenInfo = $thisIf.find('.then-info');
				strCN += "\n那么: \n"
				strCN += "  返回值等于:  ";
				code += " \n then $ta.returnValue =";
				horizon.ruleView.litRHS($thenInfo);
				code += ";\n $ta.setRunruleFlg(true);";	//增加运行标志
				if($thenInfo.find('.msg').val() != ""){//消息提示
					code += "\n $rulefun.setReturnMsg(\"" + $thenInfo.find('.msg').val() + "\");";
					strCN += "\n  消息提示:  \"" + $thenInfo.find('.msg').val() + "\"";
				}
				code += " \n end ";
					
			});
			//否则
			var $elseInfo = $('.else-container').children('.else-box').find('.row');
			if($elseInfo.length > 0){
				strCN += "\n\n否则：\n";
				strCN += "  返回值等于:  ";
				code += " \n\n rule \"else1\"";
				code += " \n salience "+ ++num;
				code += " \n when $ta:ScriptBean() &&$rulefun:RuleFun()&& eval(!$ta.runruleFlg)";
				code +=" \n then $ta.returnValue =";
				horizon.ruleView.litRHS($elseInfo);
				code += ";";
				if($elseInfo.find('.msg').val() != ""){//消息提示
					code += "\n $rulefun.setReturnMsg(\""+ $elseInfo.find('.msg').val() +"\");";
					strCN += "\n  消息提示:  \"" + $elseInfo.find('.msg').val() + "\"";
				}
				code += " \n end ";
			}
			
			strCN = strCN.replace(new RegExp("&nbsp;","g"), " ");
			strCN = strCN.replace(new RegExp("&lt;","g"),"<");
			strCN = strCN.replace(new RegExp("&gt;","g"),">");
			return code;
		},
		//规则脚本------
		//结果部
		litRHS : function($info){
			arrayObj = new Array();
			hasKH = false;
			horizon.ruleView.pasRHS($info);
			horizon.ruleView.buildRs(arrayObj,hasKH);
		},
		pasRHS : function($info){
			var $box = $info.find('.div-return').children();
			$box.each(function() {
				$obj = $(this);
				var o = new Object;
				var str = $obj.attr('class');
				o["code"] = $obj.children('a').attr("code");
					
				//增加页面回显中文
				strCN += $obj.children().html() + " ";
					
				if(str.indexOf("UN-box") >= 0){
					o["codetype"] = 'ysf';
				}else if(str =="bds-return"){
					o["codetype"] = undefined;
				}else if(str == "kh-box"){
					o["codetype"] = 'kh';
					hasKH = true;
				}
				arrayObj.push(o);	
			});
		},
		buildRs : function(arrayObj,hasKH) {
			var excNum = 0;
			var dataArr = new Array(),o = new Object;
				
			if(hasKH==true){
				var temArr = new Array();
				for(var i=0;i<arrayObj.length;i++){
					var obj = arrayObj[i];
						
					if(obj['code'] == ')'){
						while(true){
							excNum++;
							o = dataArr.pop();
							if(o['code'] == '('){
								var temcode = horizon.ruleView.buildSubRs(temArr.reverse());
								dataArr.push(temcode);
								temArr = new Array();
								break;
							}else{
								temArr.push(o);
							}
								
							if(excNum>1000){
								alert(1);
								break;
							}
						}
					}else{
						dataArr.push(arrayObj[i]);
					}
						
					if(excNum>2000){
						alert(2)
						break;
					}
				}
				var temcode = horizon.ruleView.buildSubRs(dataArr);
				dataArr.unshift(temcode);//unshift在头部插入对象
			}else{
					var temcode = horizon.ruleView.buildSubRs(arrayObj);
					dataArr.push(temcode);
			}
			var rscode = dataArr[0]['code'];
			code += rscode.substring(1);
		},
		buildSubRs : function(arrayObj){
			var subRsCode = '';
			var str1 = '',str2 = '',str3 = '';
			var func = '';
			var ysf = false;
			for(var i=0;i<arrayObj.length;i++){
				var obj = arrayObj[i];
				if(obj['codetype'] == 'ysf'){//ysf：组织机构交并
					str2 = obj['code'];
					ysf = true;
				}else if(obj['codetype'] == 'func'){//func:组织机构函数
					func = obj["code"];
					if(str1 != ''){
						str1 = '$rulefun.' + func + '(' + str1 + ')';
						func = '';
					}else{
						subRsCode = subRsCode.replace('=','= $rulefun.' + func + '(') + ')';
						str1 = '';
						func = '';
					}
				}else if(ysf){
					str3 = obj['code'];
				}else{
					subRsCode += str1 + ' ';
					str1 = obj['code'];
				}
					
				if(str3 != ''){
					str1 = "$rulefun.orgUN( " + str1 + ",\"" + str2 + "\"," + str3 + " )";
					str2 = '';str3 = '';
					ysf = false;
				}
			}
			subRsCode += str1;
			var temcode = new Object;
			temcode['code'] = subRsCode;
			return temcode;
		},
		//----规则脚本end------
		//生成"如果"规则脚本
		whenCode : function($whenInfo) {
			var tmpcode = '';
			$whenInfo.children().each(function() {
				var $box = $(this);
				var obj1 = null;
				var obj2 = null;//运算符
				var obj3 = null;
				var lj = '';//记录逻辑表达式：&&，||
				var zkh = '';//记录左括号：(
				var $newobj = undefined;
					
				for(var j=0,len=$box.children().length;j<len;j++){
					$newobj = $($box.children()[j]);
					var str = $newobj.attr('class');
					if(str.indexOf('-ljpd-div') == -1){
						strCN += (str == 'ljf-box' ? '\n ' : '') + '  ' + $newobj.children().html() + '  ';
					}
					switch(str){
						case 'ysf-box':
							obj2 = $newobj.children().attr('code');
							break;
						case 'ljf-box'://并且或者
							lj = $newobj.children().attr('code');
							obj1 = null;
							obj2 = null;
							obj3 = null;
							break;
						case 'kh-box'://括号
							if($newobj.children().attr('code') == '(') zkh += ' ( ';
							else tmpcode += horizon.ruleView.KHCheck(tmpcode) > 0 ? ' ) ' : ''; //校验有没有前括号进行匹配
							break;
						default:
							if(obj1 == null) {
								obj1 = $newobj.children().attr('code');
							}else{
								obj3 = $newobj.children().attr('code');
								tmpcode += " \n "+ (lj != "" ? lj : "") + zkh + horizon.ruleView.build(obj1,obj3,obj2);
								obj1 = null;
								obj2 = null;
								obj3 = null;
								lj = '';
								zkh = '';
							}
							break;
					}
				}
			});
			return tmpcode + "\n )";
		},
		//构建单条规则脚本
		build:function (code1,code2,ysf) {
			var buildcode = "";
			switch(ysf){
				case "==":
					buildcode += " eval($rulefun.numCompare(" + code1 + "," + code2 + ",'=='))";
					break;
				case "!=":
					buildcode += " eval($rulefun.numCompare(" + code1 + "," + code2 + ",'!='))";
					break;
				case ">":
					buildcode += " eval($rulefun.numCompare(" + code1 + "," + code2 + ",'> '))";//需要一个空格，否则会被当为char类型
					break;
				case ">=":
					buildcode += " eval($rulefun.numCompare(" + code1 + "," + code2 + ",'>='))";
					break;
				case "<":
					buildcode += " eval($rulefun.numCompare(" + code1 + "," + code2 + ",'< '))";//需要一个空格，否则会被当为char类型
					break;
				case "<=":
					buildcode += " eval($rulefun.numCompare(" + code1 + "," + code2 + ",'<='))";
					break;
				case "equal":
					buildcode += " eval(" + code1 + ".equals(" + code2 + "))";
					break;
				case "unequal":
					buildcode += " eval(!" + code1 +".equals(" + code2 + "))";
					break;
				case "in":
					buildcode += " eval($rulefun.strContains(" + code1 + "," + code2 + "))";
					break;
				case "unin":
					buildcode += " eval(!$rulefun.strContains(" + code1 + "," + code2 + "))";
					break;
			}
			return buildcode;
		},
		//条件部括号是否匹配:0匹配，正数缺少右括号，负数缺少左括号
		KHCheck : function (str) {
			var _str = "";
			var num = 0;
			for(var i = 0;i < str.length;i++) {
				_str = str.charAt(i);
				if("(" == _str) {
					num++;
				}
				if(")" == _str) {
					num--;
				}
			}
			return num;
		},
		//变换运算符
		changeYsf : function($this) {
			var type = $this.html();
			var code = $this.attr('codetype');
			var codeType = $this.attr('code');
			var codeCN = $this.attr('codeCN');
			var $a = $this.parents('.ysf-box').children('a');
			$a.html(type);
			$a.attr('codetype',code);
			$a.attr('code',codeType);
			$a.attr('data-original-title',codeCN);
		},
		//折叠widget
		foldWidget : function($this) {
			var display = $this.next('.widget-body').css('display');
		   	if(display != 'none' ){
		        $this.next('.widget-body').hide(500);
		        $this.find('.addRule').parent().removeClass('hidden');
		    }else{
		    	$this.next('.widget-body').show(500);
		    	$this.find('.addRule').parent().addClass('hidden');
		    }
		},
		addRule : function($this) {
			var $newIf = $('.hidden-box').children('.if-box').clone();
			$this.parents('.if-box').after($newIf);
			var $ifBoxs = $('.if-container').children('.if-box');
			$ifBoxs.find('a[data-action="close"]').parent('.widget-toolbar').removeClass('hidden');
			//添加规则标题
			$ifBoxs.each(function(i) {
				$(this).find('.widget-title').html('规则'+ (i + 1));
			});
			//添加规则
			$newIf.find('.addRule').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.addRule($(this));
			});
			//触发折叠事件
			$newIf.find('.rule-header').dblclick(function() {
				horizon.ruleView.foldWidget($(this));
			});
			$newIf.find('.rule-header').mouseover(function() {
		    	$(this).css('cursor','pointer');
		    });
			//添加逻辑判断
			$newIf.find('.add-ljpd').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.addLjpd($(this));
			});
			//变换运算符
			$newIf.find('.ysf').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.changeYsf($(this));
			});
			//删除规则
			$newIf.on('closed.ace.widget',function() {
				horizon.ruleView.delRule($(this));
			});
			//修改规则
			$newIf.find('.update-return-bds').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.updateRuleObject($(this));
			});
			//添加括号
			$newIf.find('.kh').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.addkh($(this));
			});
			//添加交集并集
			$newIf.find('.ysfUN').on(horizon.tools.clickEvent(),function() {
				horizon.ruleView.addYsfUN($(this));
			});
			//选择规则对象
			$newIf.find('.menu-ruleObject-name').children('li').on(horizon.tools.clickEvent(),function() {
        		horizon.ruleView.openRuleObject($(this));
        	});
			//激活提示框
		    $('[data-rel=tooltip]').tooltip();
		},
		//规则可拖动
	    widgetSortable : function() {
	    	$('.if-container').sortable({
	    		connectWith: '.if-container',
	            items:'> .if-box',
	            handle: ace.vars['touch'] ? '.widget-header' : false,
	            opacity:0.8,
	            revert:true,
	            forceHelperSize:true,
	            placeholder: 'widget-placeholder',
	            forcePlaceholderSize:true,
	            tolerance:'pointer',
	            start: function(event, ui) {
	            	ui.placeholder.css({'min-height':ui.item.height()});
	            },
	            update: function(event, ui) {
	                ui.item.parent({'min-height':''})
	            },
	            stop:function(event,ui) {
	                $('.if-container').children('.if-box').each(function(i) {
	    				$(this).find('.widget-title').html('规则'+(i+1));
	    			});
	            }
	         })
	     },
	    //删除规则
	    delRule : function($this) {
			$this.remove();
			var $ifBoxs = $('.if-container').children('.if-box');
			if($ifBoxs.length == 1){
				$ifBoxs.find('a[data-action="close"]').parent('.widget-toolbar').addClass('hidden');
			}
			$ifBoxs.each(function(i) {
				$(this).find('.widget-title').html('规则' + (i + 1));
			});
	    },
	};
	//初始化规则
 	horizon.ruleView.initRule();
 	
	//初始化规则对象
	horizon.ruleView.initRuleObject();
	
	//获取流程变量和表单数据
	horizon.ruleView.initData();
	
	//规则模块可拖动
	horizon.ruleView.widgetSortable();
	
	//添加规则
	$('.addRule').on(horizon.tools.clickEvent(),function() {
		horizon.ruleView.addRule($(this));
	});
	//添加逻辑判断
	$('.add-ljpd').on(horizon.tools.clickEvent(),function() {
		horizon.ruleView.addLjpd($(this));
	});
	//显示规则脚本编辑框
	$('.btn-rule-script').on(horizon.tools.clickEvent(),function() {
		horizon.ruleView.checkRule();//验证规则是否成功的提示信息
		if(validityInfo == ""){
			$('.rule-script').dialog({
				width:450,
				height:430,
				title:'规则脚本',
			    closeText:'关闭'
			});
		}
	});
	//添加括号
	$('.kh').on(horizon.tools.clickEvent(),function() {
		horizon.ruleView.addkh($(this));
	});
	//添加交集/并集
	$('.ysfUN').on(horizon.tools.clickEvent(),function() {
		horizon.ruleView.addYsfUN($(this));
	});
	//变换运算符
	$('.ysf').on(horizon.tools.clickEvent(),function() {
		horizon.ruleView.changeYsf($(this));
	});
	//给表单赋值
	$('#formnameVal').change(function() {
		horizon.ruleView.formchange($(this));
	});
	$('#formnameNum').change(function() {
		horizon.ruleView.formchange($(this));
	});
	
	//激活提示框
    $('[data-rel=tooltip]').tooltip();
    
    //双击标题栏打开或关闭规则
    $('.rule-header').dblclick(function() {
    	horizon.ruleView.foldWidget($(this));
    });
    //鼠标移动到规则标题时鼠标指针变为小手样式
    $('.rule-header').mouseover(function() {
    	$(this).css('cursor','pointer');
    });

    $('div[id*="idFrameHtml"]',parent.document).last().css('overflow','hidden');
    
    
});