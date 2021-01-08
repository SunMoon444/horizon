/**
 * 租户管理
 * @author yaodd
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
            driverClass: 'oracle.jdbc.driver.OracleDriver',
            dbUrl: 'jdbc:oracle:thin:@localhost:1521:orcl',
            userName: 'horizon',
            userPassword: '1234'
        },
        MySQL: {
            lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4MySql',
            driverClass: 'com.mysql.jdbc.Driver',
            dbUrl: 'jdbc:mysql://localhost:3306/horizon?useUnicode=true&characterEncoding=UTF-8&rewriteBatchedStatements=true',
            userName: 'root',
            userPassword: 'mysql'
        },
        DB2: {
            lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4DB2',
            driverClass: 'com.ibm.db2.jcc.DB2Driver',
            dbUrl: 'jdbc:db2://localhost:50000/horizondb',
            userName: 'horizon',
            userPassword: '1234'
        },
        SqlServer: {
            lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4SqlServer',
            driverClass: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
            dbUrl: 'jdbc:sqlserver://localhost:1433;DatabaseName=horizon',
            userName: 'sa',
            userPassword: '1234'
        },
        DM: {
            lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4DM',
            driverClass: 'dm.jdbc.driver.DmDriver',
            dbUrl: 'jdbc:dm://localhost',
            userName: 'SYSDBA',
            userPassword: 'dmadmin'
        },
        GBase: {
            lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4GBase',
            driverClass: 'com.gbase.jdbc.Driver',
            dbUrl: 'jdbc:gbase://localhost:5258/sysdba',
            userName: 'sa',
            userPassword: 'admin'
        },
        GBase8s: {
            lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4GBase8s',
            driverClass: 'com.gbasedbt.jdbc.IfxDriver',
            dbUrl: 'jdbc:gbasedbt-sqli://localhost:9088/hz7sp3',
            userName: 'gbasedbt',
            userPassword: 'gbasedbt'
        },
        KingBase: {
            lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4KingBase',
            driverClass: 'com.kingbase.Driver',
            dbUrl: 'jdbc:kingbase://localhost:54321',
            userName: 'sa',
            userPassword: 'admin'
        },
        KingBase8: {
            lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4KingBase8',
            driverClass: 'com.kingbase8.Driver',
            dbUrl: 'jdbc:kingbase8://localhost:54321/TESTDB',
            userName: 'SYSTEM',
            userPassword: '1234'
        },
        Postgresql: {
            lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4Postgresql',
            driverClass: 'org.postgresql.Driver',
            dbUrl: 'jdbc:postgresql://localhost:5432/horizon',
            userName: 'horizon',
            userPassword: '1234'
        },
        Highgo: {
            lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4Highgo',
            driverClass: 'com.highgo.jdbc.Driver',
            dbUrl: 'jdbc:highgo://localhost:5866/horizon',
            userName: 'horizon',
            userPassword: '1234'
        },
        Oscar: {
        	lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4Oscar',
        	driverClass: 'com.oscar.Driver',
            dbUrl: 'jdbc:oscar://localhost:2003/horizon',
            userName: 'horizon',
            userPassword: '1234'
        },
        Upbase: {
            lobProcessorclass: 'com.horizon.db.xlob.XlobProcessorImpl4Upbase',
            driverClass: 'org.srdbsql.Driver',
            dbUrl: 'jdbc:srdbsql://localhost:5435/horizon',
            userName: 'upbase',
            userPassword: '1234'
        }
    };
    var table = {
        //初始化视图数据
        init: function() {
            table.mytable = $('#myDatatable').horizonTable({
                settings: {
                    title: horizon.lang["base"]["infoList"],
                    multipleSearchable : true,
                    height: function() {
                        var _height = horizon.tools.getPageContentHeight(),
                            $pageHeader = $('.page-header');
                        if($pageHeader.css('display') != 'none') {
                            _height -= $pageHeader.outerHeight(true);
                        }
                        return _height;
                    },
                    checkbox: 0,
                    columns: [
                        {
                            dataProp : 'id'
                        },
                        {
                            name : 'tenantCode',
                            title : horizon.lang["tenant-list"]["tenantCode"],
                            width : '200px',
                            searchable : true,
                            multipleSearchable : true,
                            fnClick:operate.tenantInfo
                        },
                        {
                            name : 'tenantName',
                            title : horizon.lang["tenant-list"]["tenantName"],
                            width : '200px',
                            searchable : true,
                            multipleSearchable:true
                        },
                        {
                            name : 'identifier',
                            title : horizon.lang["tenant-list"]["columnsIdentifier"],
                            width : '100px',
                            columnClass :'center'
                        },
                        {
                            name : 'databaseType',
                            title : horizon.lang["tenant-list"]["dbType"],
                            width : '150px',
                            columnClass :'center'
                        }
                    ],
                    buttons : [
                        {
                            id: 'add',
                            text: horizon.lang["base"]["new"],
                            icon: 'fa fa-plus green',
                            fnClick: function(){
                                operate.checkLicenseInfo('add');
                            }
                        },
                        {
                            id: 'save',
                            text: horizon.lang["base"]["register"],
                            icon: 'glyphicon glyphicon-pencil green',
                            fnClick: function(){
                                $('input[name="id"]').val('');
                                $('select[name="dbConnectionType"]').trigger('change');
                                operate.checkLicenseInfo('save');
                            }
                        },
                        {
                            id: 'del',
                            text: horizon.lang["base"]["delete"],
                            icon: 'fa fa-times red2',
                            fnClick: function(){
                                var ids = table.mytable.checkRowKeyArray;
                                if(!ids.length){
                                    if($('.gritter-item-wrapper').length > 0){
                                            	horizon.notice.error(horizon.lang["tenant-list"]["deleteSelect"]);
                                    }else {
                                    	horizon.notice.error(horizon.lang["tenant-list"]["deleteSelect"]);
                                    }
                                }else{
                                    $dialog.dialog({
                                        title:horizon.lang["message"]["title"],
                                        dialogText:horizon.lang["message"]["deleteConfirm"],
                                        dialogTextType:'alert-danger',
                                        closeText:horizon.lang["base"]["close"],
                                        buttons:[
                                            {
                                                html: horizon.lang["base"]["ok"],
                                                "class" : "btn btn-primary btn-xs",
                                                click: function() {
                                                    operate.delTenant(ids.join(";"));
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
                ajaxDataSource: horizon.tools.formatUrl('/system/tenant/page')
            });
        }
    };
    var operate={
        initTenantForm:function() {
            //验证表单
            operate.checkForm();
            //选择数据库连接方式
            $('select[name="dbConnectionType"]').change(function() {
                operate.selectConnectionType($(this));
                if($(this).val()=="DBCP"){
                    //选择数据库类型后将相应的隐藏域参数赋值
                    operate.getDbType();
                }
            }).trigger('change');
        },
        changeDbType:function(){
            var $this =$('input[name="databaseType"]');
            var $form = $this.closest('form');
            var database={};
            var dbtype=null;
            for(var item in defaultDatabaseInfo){
                if(item.toLowerCase()==operate.dbtype.toLowerCase()){
                    database= defaultDatabaseInfo[item];
                    dbtype=item;
                }
            }
            $('input[name="databaseType"]').val(dbtype);
            $form.find('input[name="driverClass"]').val(database.driverClass);
            $form.find('input[name="jdbcUrl"]').val(database.dbUrl);
            $form.find('input[name="userName"]').val(database.userName);
            $form.find('input[name="password"]').val(database.userPassword);
            $form.find('input[name="lobProcessorClass"]').val(database.lobProcessorclass);
            $form.find('input[name="connectionType"]').val("DBCP");
        },
        getDbType:function(){
            if(operate.dbtype){
                operate.changeDbType();
            }else{
                $.ajax({
                    url:horizon.tools.formatUrl('/system/dbtype/info'),
                    cache:false,
                    dataType:'json',
                    error:function() {
                        horizon.notice.error(horizon.lang.message['operateError']);
                    },
                    success:function(data) {
                        if(data.restype == 'success'){
                            operate.dbtype = data.msg[0];
                            operate.changeDbType();
                        }else{
                            horizon.notice.error(data.msg[0]);
                        }
                    }
                });
            }
        },
        checkLicenseInfo:function(type) {
            $.ajax({
                url:horizon.tools.formatUrl('/system/check/license/info'),
                cache:false,
                dataType:'json',
                error:function() {
                	horizon.notice.error(horizon.lang.message['operateError']);
                },
                success:function(data) {
                    if(data.restype == 'success'){

                        if(type == 'add'){
                            //新建
                            operate.addTenant();
                        }else{
                            //注册
                            var $validate = operate.checkForm();
                            $validate.resetForm();
                            $('select[name="dbConnectionType"]').trigger('change');
                            operate.getDbType();
                            // $('select[name="dbtype"]').trigger('change');
                            $('.jndi').addClass('hidden').find('.form-control').addClass('ignore');
                            $('.spring').removeClass('hidden').find('.form-control').removeClass('ignore');
                            operate.saveTenant();
                        }
                    }else{
                    	horizon.notice.error(data.msg[0]);
                    }
                }
            });
        },
        addTenant:function() {
            var $validate = operate.checkForm();
            $validate.resetForm();
            $('input[name="id"]').val('');
            $('.form-group').removeClass('has-error');
            $('select[name="dbConnectionType"]').trigger('change');
            operate.getDbType();
            //$('select[name="dbtype"]').trigger('change');
            $('.jndi').addClass('hidden').find('.form-control').addClass('ignore');
            $('.spring').removeClass('hidden').find('.form-control').removeClass('ignore');
            $('#tenantInfo').dialog({
                width: $(window).width() > 1200?'1200':'auto',
                height: 'auto',
                maxHeight: $(window).height(),
                title:horizon.lang["tenant-list"]["addTenant"],
                closeText:horizon.lang["base"]["close"],
                buttons:[
                    {
                        html:horizon.lang["tenant-list"]["buttonsEstablishConnection"],
                        "class" : "btn btn-primary btn-xs",
                        click: function() {
                            $('input[name="type"]').val('checkConn');
                            $('#tenantInfoForm').submit();
                        }
                    },
                    {
                        html:horizon.lang["tenant-list"]["buttonsInit"],
                        "class" : "btn btn-primary btn-xs",
                        click: function() {
                            $('input[name="type"]').val('initTen');
                            var haveConn=$('input[name="haveConn"]').val();
                            if (haveConn == "" || haveConn != "1") {
                            	horizon.notice.error(horizon.lang["tenant-list"]["operateEstablishConnection"]);
                                return false;
                            }
                            $('#tenantInfoForm').submit();
                        }
                    },
                    {
                        html: horizon.lang["base"]["reset"],
                        "class" : "btn btn-yellow btn-xs",
                        click: function() {
                            $validate.resetForm();
                            $('.form-group').removeClass('has-error');
                            $('select[name="dbConnectionType"]').trigger('change');
                            operate.getDbType();
                            $('.jndi').addClass('hidden').find('.form-control').addClass('ignore');
                            $('.spring').removeClass('hidden').find('.form-control').removeClass('ignore');
                        }
                    }
                ]
            });
        },
        checkForm:function(){
            return $("#tenantInfoForm").validate({
                ignore: '.ignore',
                errorClass: 'help-block no-margin-bottom',
                focusInvalid: false,
                rules: {
                    tenantName: {
                        remote:{
                            url:horizon.tools.formatUrl('/system/tenant/check/tenantname'),
                            cache: false,
                            data:{
                                tenantName : function() {
                                    return $('#tenantInfoForm').find('#tenantName').val();
                                },
                                id : function() {
                                    return $('#tenantInfoForm').find('input[name="id"]').val();
                                }
                            }
                        }
                    },
                    tenantCode: {
                        letterAndNumber:true,
                        remote:{
                            url:horizon.tools.formatUrl('/system/tenant/check/tenantcode'),
                            cache: false,
                            data:{
                                tenantCode : function() {
                                    return $('#tenantInfoForm').find('#tenantCode').val();
                                },
                                id : function() {
                                    return $('#tenantInfoForm').find('input[name="id"]').val();
                                }
                            }
                        }
                    },
                    identifier:{
                        letterAndNumber:true,
                        remote:{
                            url:horizon.tools.formatUrl('/system/tenant/check/identifier'),
                            cache: false,
                            data:{
                                identifier: function() {
                                    return $('#tenantInfoForm').find('input[name="identifier"]').val();
                                },
                                id : function() {
                                    return $('#tenantInfoForm').find('input[name="id"]').val();
                                }
                            }
                        }
                    },
                    lobBufferSize:{
                        digits:true
                    },
                    minPoolSize:{
                        digits:true
                    },
                    maxPoolSize:{
                        digits:true
                    },
                    initialPoolsize:{
                        digits:true
                    },
                    maxIdelTime:{
                        digits:true
                    }
                },
                messages: {
                    tenantName: {
                        remote:horizon.lang["tenant-list"]["checkTenantName"]
                    },
                    tenantCode: {
                        remote:horizon.lang["tenant-list"]["checkTenantCode"]
                    },
                    identifier: {
                        remote:horizon.lang["tenant-list"]["checkIdentifier"]
                    },
                    bufferSize:{
                        digits:horizon.lang["tenant-list"]["checkNumber"]
                    },
                    minPoolSize:{
                        digits:horizon.lang["tenant-list"]["checkNumber"]
                    },
                    maxPoolSize:{
                        digits:horizon.lang["tenant-list"]["checkNumber"]
                    },
                    initialPoolSize:{
                        digits:horizon.lang["tenant-list"]["checkNumber"]
                    },
                    maxidelTime:{
                        digits:horizon.lang["tenant-list"]["checkNumber"]
                    }
                },
                highlight: function (e) {
                    $(e).closest('.form-group').addClass('has-error');
                },
                success: function (e) {
                    $(e).closest('.form-group').removeClass('has-error');
                    $(e).remove();
                },
                submitHandler: function (form){
                	horizon.notice.loading(horizon.lang['load-license']['operating']);
                    var type = $('input[name="type"]').val();
                    var url;
                    if(type == 'checkConn'){
                        //建立连接
                        url = '/system/tenant/check/conn';
                    }else if(type == 'save'){
                        //注册
                        url = '/system/tenant/save';
                    }else{
                        //初始化
                        url = '/system/tenant/init/data';
                    }
                    table.mytable.showProcessing();
                    $(form).ajaxSubmit({
                        url: horizon.tools.formatUrl(url),
                        dataType: 'json',
                        type: 'post',
                        cache: false,
                        error: function() {
                            table.mytable.hideProcessing();
                            if(url=='/system/tenant/init/data'){
                            	horizon.notice.error(horizon.lang['load-license']['initFailed']);
                            }else if(url=='/system/tenant/check/conn'){
                                horizon.notice.error(horizon.lang.message['checkInfo']);
                            }else if(url=='/system/tenant/save'){
                                horizon.notice.error(horizon.lang.message['saveFail']);
                            }else{
                                horizon.notice.error(horizon.lang.message['operateError']);
                            }
                        },
                        success: function(data) {
                            table.mytable.hideProcessing();
                            if(data.restype == 'success'){
                                if(type == 'checkConn'){
                                	horizon.notice.success(horizon.lang["tenant-list"]["connectionSuccess"]);
                                    $('input[name="haveConn"]').val(1);
                                }else if(type == 'save'){
                                	horizon.notice.success(horizon.lang["message"]["saveSuccess"]);
                                    $('#tenantInfo').dialog('close');
                                    table.mytable.reload();
                                }else{
                                	horizon.notice.success(horizon.lang["tenant-list"]["initSuccess"]);
                                    $('#tenantInfo').dialog('close')
                                    table.mytable.reload();
                                }
                            }else{
                            	if(type == 'checkConn'){
                                    horizon.notice.error(horizon.lang.message['checkInfo']);
                                }else if(type == 'save'){
                                    horizon.notice.error(horizon.lang.message['saveFail']);
                                }else{
                                    var msg = data.msg == '' ? horizon.lang["message"]["saveFail"] : data.msg;
                                    horizon.notice.error(msg[0]);
                                }
                            }
                        }
                    });
                }
            });
        },
        //选择数据库连接方式
        selectConnectionType:function($this) {
            var connection_type = $this.val();
            if(connection_type == 'DBCP'){
                $('.jndi').addClass('hidden').find('.form-control').addClass('ignore');
                $('.spring').removeClass('hidden').find('.form-control').removeClass('ignore');
            }else{
                $('input[for="DBCP"]').val("");
                $('input[name="connectionType"]').val("JNDI");
                $('.jndi').removeClass('hidden').find('.form-control').removeClass('ignore');
                $('.spring').addClass('hidden').find('.form-control').addClass('ignore');
            }
        },
        //删除租户
        delTenant:function(ids){
            table.mytable.showProcessing();
            $.ajax({
                url:horizon.tools.formatUrl('/system/tenant/delete'),
                cache: false,
                data:{
                    ids:ids
                },
                error:function(){
                    table.mytable.hideProcessing();
                    horizon.notice.error(horizon.lang.message['operateError']);
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
        tenantInfo:function() {
            var rowData = arguments[2];
            $('select[name="dbConnectionType"]').val(rowData.dbConnectionType)
            $('input[name="databaseType"]').val(rowData.dbtype);
            $('select[name="dbConnectionType"]').trigger('change');
            $('.jndi').addClass('hidden').find('.form-control').addClass('ignore');
            $('.spring').removeClass('hidden').find('.form-control').removeClass('ignore');
            $.each(rowData,function(key,value){
                $('#tenantInfo').find('input[name="' + key + '"]').val(value);
            });
            operate.saveTenant();
        },
        saveTenant:function() {
            $('.form-group').removeClass('has-error');
            $('label[id*="-error"]').html('');
            $('#tenantInfo').dialog({
                width: $(window).width() > 1200?'1200':'auto',
                height: 'auto',
                maxHeight: $(window).height(),
                title:horizon.lang["tenant-list"]["dialogTitleTenantInfor"],
                closeText:horizon.lang["base"]["close"],
                buttons:[
                    {
                        html: horizon.lang["base"]["save"],
                        "class" : "btn btn-primary btn-xs",
                        click: function() {
                            $('input[name="type"]').val('save');
                            $('#tenantInfoForm').submit();
                        }
                    }
                ]
            });
        }
    };
    return horizon.engine['tenantlist'] = {
        initTable: table.init,
        initTenantForm:operate.initTenantForm
    };
}));