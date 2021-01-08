/**
 *多数据源可视化配置
 * @author lihh 2017/04/06
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonTable', 'jqueryValidateAll', 'jqueryForm', 'gritter'], factory);
    }else {
        factory(jQuery);
    }
}(function($) {
	var $dialog=$('#systemList-dialog');
	var defaultDatabaseInfo = {
            Oracle: {
            	lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4Oracle',
                driverClassName: 'oracle.jdbc.driver.OracleDriver',
                url: 'jdbc:oracle:thin:@localhost:1521:orcl',
                userName: 'horizon',
                userPassword: '1234'
            },
            MySQL: {
            	lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4MySql',
                driverClassName: 'com.mysql.jdbc.Driver',
                url: 'jdbc:mysql://localhost:3306/horizon?useUnicode=true&characterEncoding=UTF-8&rewriteBatchedStatements=true',
                userName: 'root',
                userPassword: 'mysql'
            },
			MySQL8: {
				lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4MySql',
				driverClassName: 'com.mysql.cj.jdbc.Driver',
				url: 'jdbc:mysql://localhost:3306/horizon?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=UTC',
				userName: 'root',
				userPassword: 'mysql'
			},
            DB2: {
            	lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4DB2',
                driverClassName: 'com.ibm.db2.jcc.DB2Driver',
                url: 'jdbc:db2://localhost:50000/horizondb',
                userName: 'horizon',
                userPassword: '1234'
            },
            SqlServer: {
            	lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4SqlServer',
                driverClassName: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
                url: 'jdbc:sqlserver://localhost:1433;DatabaseName=horizon',
                userName: 'sa',
                userPassword: '1234'
            },
            DM: {
            	lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4DM',
                driverClassName: 'dm.jdbc.driver.DmDriver',
                url: 'jdbc:dm://localhost',
                userName: 'SYSDBA',
                userPassword: 'dmadmin'
            },
            GBase: {
            	lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4GBase',
                driverClassName: 'com.gbase.jdbc.Driver',
                url: 'jdbc:gbase://localhost:5258/sysdba',
                userName: 'sa',
                userPassword: 'admin'
            },
            GBase8s: {
                lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4GBase8s',
                driverClassName: 'com.gbasedbt.jdbc.IfxDriver',
                url: 'jdbc:gbasedbt-sqli://localhost:9088/horizon',
                userName: 'gbasedbt',
                userPassword: 'gbasedbt'
            },
            KingBase: {
            	lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4KingBase',
                driverClassName: 'com.kingbase.Driver',
                url: 'jdbc:kingbase://localhost:54321',
                userName: 'sa',
                userPassword: 'admin'
            },
			KingBase8: {
				lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4KingBase8',
				driverClassName: 'com.kingbase8.Driver',
				url: 'jdbc:kingbase8://localhost:54321/TESTDB',
				userName: 'SYSTEM',
				userPassword: '1234'
			},
            Postgresql: {
            	lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4Postgresql',
                driverClassName: 'org.postgresql.Driver',
                url: 'jdbc:postgresql://localhost:5432/horizon',
                userName: 'horizon',
                userPassword: '1234'
            },
			Highgo: {
				lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4Highgo',
				driverClassName: 'com.highgo.jdbc.Driver',
				url: 'jdbc:highgo://localhost:5866/horizon',
				userName: 'horizon',
				userPassword: '1234'
			},
			Oscar: {
                lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4Oscar',
                driverClassName: 'com.oscar.Driver',
                url: 'jdbc:oscar://localhost:2003/horizon',
				userName: 'horizon',
                userPassword: '1234'
			},
			Upbase: {
				lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4Upbase',
				driverClassName: 'org.srdbsql.Driver',
				url: 'jdbc:srdbsql://localhost:5435/horizon',
				userName: 'upbase',
				userPassword: '1234'
			}
        };
    var table = {
        //初始化视图数据
        init: function() {
			table.mytable =$('#myDatatable').horizonTable({
				 settings: {
	                    title: horizon.lang["datasource-config"]["tableTitle"],
	                    multipleSearchable: false,
		                searchable:true,
	                    height: function() {
	                    	 var _height = $(window).height()
	                    	 	 - parseInt($('.page-content').css('paddingTop')) * 2;
	                    	 _height -= !$('.page-header').hasClass('hidden') ? $('.page-header').outerHeight(true) : 0;
		                     var $body = $('body');
		                     if($body.attr('data-layout') != 'left' && $body.attr('data-layout') != 'left-hoversubmenu') {
		                         _height -= ($('#sidebar').css('visibility') != 'hidden'?$('#sidebar').outerHeight(true):0);
		                     }
		                     if(!$body.hasClass('embed')) {
		                         _height -= $('#navbar').outerHeight(true);
		                     }
		                     return _height;
	                    },
	                    checkbox: 0,
	                    columns: [
	                           {
	                                dataProp : 'id'
	                           },
	          	               { 
	          	                    name : 'identifier',
 	          	                    title :  horizon.lang["datasource-config"]["columnsIdentifier"],
	          	                    width : '150px',
	          	                    searchable : true,
	          	                    fnClick:operate.dataSourceInfo
	          	                },
	          	               {
	          	                    name : 'userName',
 	          	                    title :  horizon.lang["datasource-config"]["columnsUserName"],
	          	                    width : '150px',
	          	                    searchable : true,
	          	                    orderable :false
	          	                },
	          	                {
	          	                    name : 'databaseType',
 	          	                    title :  horizon.lang["datasource-config"]["columnsDbType"],
	          	                    width : '150px',
	          	                    columnClass :'center',
	          	                    orderable :false
	          	                    	
	          	                },
	          	                {
	          	                    name : 'driverClass',
 	          	                    title :  horizon.lang["datasource-config"]["columnsDriverClass"],
	          	                    width : '200px',
	          	                    columnClass :'center',
	          	                    orderable :false
	          	                }
	                    ],
	                    buttons : [
							{
							    id: 'save',
							    text: horizon.lang["base"]["new"],
							    icon: 'glyphicon glyphicon-pencil green',
							    fnClick: function(){
							    	operate.savedataSource();
							    }
							},
				
						   {
								id: 'del',
	                            text: horizon.lang["base"]["delete"],
	                            icon: 'fa fa-times red2',
	                            fnClick: function(){
	                            	var ids = table.mytable.checkRowKeyArray;
	                            	var allDatas = table.mytable.checkRowDataArray;
                                    var identifiers = "";
                                    $.each(allDatas, function(i, data) {
                                            identifiers += data.identifier+";"
                                    });
							    	if(!ids.length){
							    		horizon.notice.error(horizon.lang["message"]["deleteHelp"]);
							    	}else{    
							    		 $dialog.dialog({
							    			 title:horizon.lang["message"]["deleteHelp"],
			                                	dialogText:horizon.lang["message"]["deleteConfirm"],
			                                	dialogTextType:'alert-danger',
			                                	closeText:horizon.lang["base"]["close"],
			                                	buttons:[
			                                	         {
				                   				        	   html: horizon.lang["base"]["ok"],
				               				                    "class" : "btn btn-primary btn-xs",
				               				                    click: function() {
				               				                    	operate.deldataSource(ids.join(";"),identifiers);
				               				                    	$(this).dialog('close');
				               				                    }
				                   				          }   
			                                	         ]
			                                         });
							    	      }
								}
						   }
	                     ]
	                },
	                ajaxDataSource: horizon.tools.formatUrl('/system/datasource/page')
		        });
         	},
        };
    	
    var operate={
    		 initdataSourceForm:function() {
    			 //验证表单
    			 operate.checkForm();
    			 //选择数据库类型后将相应的隐藏域参数赋值
    			 $('select[name="databaseType"]').change(function() {
    				 var $this = $(this);
    	             var $form = $this.closest('form');
    	             var database = defaultDatabaseInfo[$this.val()];
    	             $form.find('input[name="driverClass"]').val(database.driverClassName);
    	             $form.find('input[name="userName"]').val(database.userName);
    	             $form.find('input[name="password"]').val(database.userPassword);
    	             $form.find('input[name="jdbcUrl"]').val(database.url);
    	             $form.find('input[name="lobProcessorClass"]').val(database.lobProcessorclass);
    			 }).trigger('change');
    		 },
    	     checkForm:function(){
        			return $("#dataSourceInfoForm").validate({
        				 ignore: '.ignore',
        		         errorClass: 'help-block no-margin-bottom',
        				 focusInvalid: false,
        		         highlight: function (e) {
        		             $(e).closest('.form-group').addClass('has-error');
        		         },
        		         success: function (e) {
        		             $(e).closest('.form-group').removeClass('has-error');
        		             $(e).remove();
        		         },
        		         submitHandler: function (form){
        		        	var type = $('input[name="type"]').val();
        		        	var url;
        		        	if(type == 'checkConn'){
        		        		//连接测试
        		        		url = '/system/datasource/check/conn';
        		        	}else{
        		        	    //保存数据源
        		        		url = '/system/datasource/save';	
        		        	}
        		        	table.mytable.showProcessing();
        		        	 $(form).ajaxSubmit({
        		        		 url: horizon.tools.formatUrl(url),
        		        		 dataType: 'json',
        		        		 type: 'post',
        		        		 cache: false,
        		        		 error: function() {
        		        			 table.mytable.hideProcessing();
        		        			 horizon.notice.error(horizon.lang["message"]["operateError"]); 
        		        		 },
        		            	 success: function(data) {
        		            		 table.mytable.hideProcessing();
        		            		 if(data.restype == 'success'){
        		            			 if(type == 'save'){
        		            				 horizon.notice.success(horizon.lang["message"]["saveSuccess"]);
        		            				 $('#dataSourceInfo').dialog('close');
        		            				 table.mytable.reload();
        		            			 }else{
        		            				 horizon.notice.success(horizon.lang["message"]["testSuccess"]);
            		            			$('input[name="haveConn"]').val(1);
        		            			 }
        		            		 } else {
        		            			 var msg = data.msg == '' ? horizon.lang["message"]["saveFail"] : data.msg;
        		            			 horizon.notice.error(msg[0]);
        		            	     }
        		            	 }
        		             });
        		         }
        		     });
        		},
        		//删除数据源
        	    deldataSource:function(ids,identifiers){
        	    	table.mytable.showProcessing();
        	    	$.ajax({
        	    		url:horizon.tools.formatUrl('/system/datasource/delete'),
    					cache: false,
        		        data:{
        		        	"id":ids,
        		           	"identifiers":identifiers
        		        },
        	    		error:function(){
        	    			 table.mytable.hideProcessing();
        	    			 horizon.notice.error(horizon.lang["message"]["operateError"]);
        	    		},
        	    		success:function(data){
        	    			table.mytable.hideProcessing();
        	    			if(data.restype != 'err'){
        	    				horizon.notice.success(horizon.lang["message"]["deleteSuccess"]);
        	    				table.mytable.reload();
        	    			}else{
        	    				horizon.notice.error(horizon.lang["message"]["deleteFail"]);
        	    			}
        	    		}
        	    	});
        	    },
        	    //回显输入框值
        	    dataSourceInfo:function() {
        	    	var rowData = arguments[2];
    				$('select[name="databaseType"]').val(rowData.databaseType);
    				$.each(rowData,function(key,value){
        	    		$('#dataSourceInfo').find('input[name="' + key + '"]').val(value);
        	    	});
    			  	var database = defaultDatabaseInfo[rowData["databaseType"]];
    			  	var $form = $('select[name="databaseType"]').closest('form');
    			  	$form.find('input[name="lobProcessorClass"]').val(database.lobProcessorclass);
    			  	$form.find('input[name="lobBufferSize"]').val("1048576");
    			  //修改数据源   
    			  	$('input[name="identifier"]').attr("readonly","true");
        	    	operate.commondataSource();
        	    },
        	    //新建数据源界面
        	    savedataSource:function() {
        	    	var $validate = operate.checkForm();
					$validate.resetForm();
					$('input[name="id"]').val('');
					$('input[name="identifier"]').removeAttr("readonly","true");
					$('select[name="databaseType"]').trigger('change');
        	    	operate.commondataSource();  
        	   },
        	   //修改和新建数据源提取的公共方法
        	   commondataSource:function(){
        	        $('.form-group').removeClass('has-error');
               	    $('label[id*="-error"]').html('');
               	    $('#dataSourceInfo').dialog({
               		 width: $(window).width() > 1200?'1200':'auto',
                         height: 'auto',
                         maxHeight: $(window).height(),
     			 		 title: horizon.lang["datasource-config"]["dataSourceInfo"],
     			 		 closeText: horizon.lang["base"]["close"],
     			 		 buttons:[
     			 		        {
					        	   html: horizon.lang["datasource-config"]["buttonsConnectionTest"],
				                    "class" : "btn btn-primary btn-xs",
				                    click: function() {
				                    	$('input[name="type"]').val('checkConn');
				                    	$('#dataSourceInfoForm').submit();
				                    }
					           },
     			 		       {
 					        	   html: horizon.lang["base"]["save"],
 				                    "class" : "btn btn-primary btn-xs",
 				                    click: function() {
 				                    	$('input[name="type"]').val('save');
				                    	$('#dataSourceInfoForm').submit();
 				                    }
 					           }
 					         
     			 		 ]
     			    });
        	   }
    };
    return horizon.engine['dataSourcelist'] = {
        initTable: table.init,
        initdataSourceForm:operate.initdataSourceForm
    };
}));