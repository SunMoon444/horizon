/**
 * Created by zhouwf on 2016-4-18.
 */
(function () {
    require.config({
        baseUrl: horizon.paths.pluginpath,
        paths: horizon.vars.requirePaths,
        shim: horizon.vars.requireShim
    });
    require([
            'jquery',
            'jqueryForm',
            'jqueryValidateAll',
            (loadFlag == '2' ? '' : 'elementsFileinput'),
            'elementsWizard',
            'aceSmall',
            'gritter'
        ],
        function ($) {
            var $databaseForm = $('#database-form');
            var $uploadLicenseForm = $('#upload-license-form');
            var $wizard = $('#fuelux-wizard-container');
            var defaultDatabaseInfo = {
                Oracle: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4Oracle',
                    driverClass: 'oracle.jdbc.driver.OracleDriver',
                    jdbcUrl: 'jdbc:oracle:thin:@localhost:1521:orcl',
                    userName: 'horizon',
                    password: '1234'
                },
                MySQL: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4MySql',
                    driverClass: 'com.mysql.jdbc.Driver',
                    jdbcUrl: 'jdbc:mysql://localhost:3306/horizon?useUnicode=true&characterEncoding=UTF-8',
                    userName: 'root',
                    password: 'mysql'
                },
                MySQL8: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4MySql',
                    driverClass: 'com.mysql.cj.jdbc.Driver',
                    jdbcUrl: 'jdbc:mysql://localhost:3306/horizon?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=UTC',
                    userName: 'root',
                    password: 'mysql'
                },
                DB2: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4DB2',
                    driverClass: 'com.ibm.db2.jcc.DB2Driver',
                    jdbcUrl: 'jdbc:db2://localhost:50000/horizondb',
                    userName: 'horizon',
                    password: '1234'
                },
                SqlServer: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4SqlServer',
                    driverClass: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
                    jdbcUrl: 'jdbc:sqlserver://localhost:1433;DatabaseName=horizon',
                    userName: 'sa',
                    password: '1234'
                },
                DM: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4DM',
                    driverClass: 'dm.jdbc.driver.DmDriver',
                    jdbcUrl: 'jdbc:dm://localhost',
                    userName: 'SYSDBA',
                    password: 'dmadmin'
                },
                GBase: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4GBase',
                    driverClass: 'com.gbase.jdbc.Driver',
                    jdbcUrl: 'jdbc:gbase://localhost:5258/sysdba',
                    userName: 'sa',
                    password: 'admin'
                },
                GBase8s: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4GBase8s',
                    driverClass: 'com.gbasedbt.jdbc.IfxDriver',
                    jdbcUrl: 'jdbc:gbasedbt-sqli://localhost:9088/hz7sp3',
                    userName: 'gbasedbt',
                    password: 'gbasedbt'
                },
                KingBase: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4KingBase',
                    driverClass: 'com.kingbase.Driver',
                    jdbcUrl: 'jdbc:kingbase://localhost:54321',
                    userName: 'sa',
                    password: 'admin'
                },
                KingBase8: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4KingBase8',
                    driverClass: 'com.kingbase8.Driver',
                    jdbcUrl: 'jdbc:kingbase8://localhost:54321/TESTDB',
                    userName: 'SYSTEM',
                    password: '1234'
                },
                Postgresql: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4Postgresql',
                    driverClass: 'org.postgresql.Driver',
                    jdbcUrl: 'jdbc:postgresql://localhost:5432/horizon',
                    userName: 'horizon',
                    password: '1234'
                },
                Highgo: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4Highgo',
                    driverClass: 'com.highgo.jdbc.Driver',
                    jdbcUrl: 'jdbc:highgo://localhost:5866/horizon',
                    userName: 'horizon',
                    password: '1234'
                },
                Oscar: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4Oscar',
                    driverClass: 'com.oscar.Driver',
                    jdbcUrl: 'jdbc:oscar://localhost:2003/horizon',
                    userName: 'horizon',
                    password: '1234'
                },
                Upbase: {
                    lobProcessorClass: 'com.horizon.db.xlob.XlobProcessorImpl4Upbase',
                    driverClass: 'org.srdbsql.Driver',
                    jdbcUrl: 'jdbc:srdbsql://localhost:5435/horizon',
                    userName: 'upbase',
                    password: '1234'
                }
            };

            var getLicenseInfo = function () {
                var $uploadLicense = $('#btn-upload-license');
                $.get(horizon.paths.apppath + '/workflow.hz', function (data) {
                    $('div[id="registerCode"]').html(data);
                    $('input:file').removeClass('hidden').ace_file_input({
                        allowExt: ['xml'],
                        no_file: horizon.lang['load-license']['inputFile'],
                        btn_choose: horizon.lang['load-license']['buttonsChoose'],
                        btn_change: horizon.lang['load-license']['buttonsRechoose'],
                        no_icon: 'ace-icon fa fa-cloud-upload',
                        droppable: false
                    });
                    $uploadLicense.removeClass('hidden');
                });
                $uploadLicense.siblings('button').addClass('hidden');
            };
            $wizard.ace_wizard(loadFlag == '3' ? {step: 2} : null)
                .on('actionclicked.fu.wizard', function (e, info) {
                    if (info.step == 1 && loadFlag == '1') {
                        getLicenseInfo();
                    } else {
                        if (loadFlag == 2) {//hasLicense
                            var $wizardData = $wizard.data('fu.wizard');
                            $wizardData.currentStep = 2;
                            $wizardData.setState();
                        }
                        $('.btn-next').removeClass('hidden').siblings('button').addClass('hidden');
                        setInterval(function () {
                            var $time = $('.step-pane[data-step="3"]').find('#time');
                            var time = parseInt($time.html());
                            time -= 1;
                            if (time == 0) {
                                $wizard.data('fu.wizard').next();
                            } else {
                                $time.html(time);
                            }
                        }, 1000);
                    }
                })
                .on('finished.fu.wizard', function () {//点击完成按钮后的后续页面跳转

                    if (loadFlag == 2) {//只有初始化数据界面  $databaseForm.find('input[name="initServletName"]').val();

                        var initFlag = $('input[name="initFlag"]').val(); //$('input[name="initFlag"]:checked').val()
                         window.location.href = horizon.paths.apppath + '/index.jsp';

                       
                    }
                    if (loadFlag == 3) {//只有License界面
                        //window.location.href = horizon.paths.apppath + '/workflow.hz?isReload=true&gotoPage=' + gotoPage;
						window.location.href = horizon.paths.apppath + '/index.jsp';						
                    }


                    if (loadFlag == 1 || loadFlag == "") {//手动输入或者拦截初始化界面

                        var initFlag = $('input[name="initFlag"]').val();
						 window.location.href = horizon.paths.apppath + '/index.jsp';
                         //判断是否是单租户模式
                        /**
						if (initFlag == '3') {
                            window.location.href = horizon.paths.apppath + '/index.jsp';
                        } else {
                            window.location.href = horizon.paths.apppath + '/index_system.jsp';
                        }**/
						
                    }

                })
                .on('stepclicked.fu.wizard', function (e) {
                    e.preventDefault();
                });

            var validateOption = {
                errorElement: 'div',
                errorClass: 'help-block col-xs-12 col-sm-reset inline',
                focusInvalid: false,
                highlight: function (e) {
                    $(e).closest('.form-group').removeClass('has-info').addClass('has-error');
                },
                success: function (e) {
                    $(e).closest('.form-group').removeClass('has-error').addClass('has-info');
                    $(e).remove();
                },
                errorPlacement: function (error, element) {
                    error.insertAfter(element.closest('div[class*="col-"]'));
                }
            };
            /**验证数据源方法
             $.validator.addMethod("checkDbidentifier", function(value, element) {
                if(value == $databaseForm.find('input[name="defaultDbIdentifier"]').val()) {
                    return false;
                }
                return true;
            }, '数据源标识符不能与系统默认数据源标识相同');**/
            var dataBaseValidate = function () {
                //数据库配置表单验证
                $databaseForm.validate($.extend({}, validateOption, {
                    ignore: '.ignore',
                    rules: {
                        initFlag: 'required',
                        identifier: {
                            letterAndNumber: true,
                            required: true,
                            maxlength: 100
                            //checkDbidentifier: true
                        },
                        connectionType: 'required',
                        jndiName: {
                            required: true,
                            maxlength: 100
                        },
                        driverClass: {
                            required: true,
                            maxlength: 100
                        },
                        databaseType: 'required',
                        jdbcUrl: {
                            required: true,
                            maxlength: 200
                        },
                        userName: {
                            required: true,
                            maxlength: 50
                        },
                        password: {
                            required: true,
                            maxlength: 50
                        }
                    },
                    submitHandler: function (form) {
                        horizon.notice.loading(horizon.lang['load-license']['operating']);
                        $(form).ajaxSubmit({
                            dataType: 'json',
                            success: function (data) {
                                var initServletName = $databaseForm.find('input[name="initServletName"]').val();

                                if (initServletName == 'initSetUpData') {
                                    if (data.restype == "success") {
                                        horizon.notice.success(horizon.lang['load-license']['operateFinish']);
                                        $wizard.data('fu.wizard').next();
                                    } else {
                                        horizon.notice.error(horizon.lang['load-license']['initFailed']);
                                    }

                                } else {
                                    if (data.restype == "success") {
                                        horizon.notice.success(horizon.lang['load-license']['connectSuccess']);
                                        $('input[name="haveConn"]').val(1);

                                    } else {
                                        horizon.notice.error(data.msg);

                                    }
                                }
                            }
                        });
                    }
                }));

            };


            //初始化和测试连接按钮点击方法
            $('#btn-test-connection, #btn-init-database').on(horizon.tools.clickEvent(), function (e) {
                $databaseForm.find('input[name="initServletName"]').val($(this).attr('data-initservletname'));

                var initServletName = $databaseForm.find('input[name="initServletName"]').val();
                var submiturl = horizon.tools.formatUrl('/init/data');
                if (initServletName == 'initSetUpCheckConn') {

                    submiturl = horizon.tools.formatUrl('/init/check/conn');
                } else {
                    var haveConn = $('input[name="haveConn"]').val();
                    if (haveConn == "" || haveConn != "1") {
                        horizon.notice.error(horizon.lang['load-license']['firstConnect']);
                        return false;
                    }
                }
                $databaseForm.attr('action', submiturl);

                $databaseForm.submit();
            });
            //数据库类型onchange
            $('select[name="databaseType"]').change(function () {
                if( $('select[name="connectionType"]').val()=="JNDI"){
                    $('input[for="DBCP"]').val("");
                }else{
                    var $this = $(this);
                    var $form = $this.closest('form');
                    var database = defaultDatabaseInfo[$this.val()];
                    $form.find('input[name="driverClass"]').val(database.driverClass);
                    $form.find('input[name="jdbcUrl"]').val(database.jdbcUrl);
                    $form.find('input[name="userName"]').val(database.userName);
                    $form.find('input[name="password"]').val(database.password);
                    $form.find('input[name="lobProcessorClass"]').val(database.lobProcessorClass);
                }
            }).trigger('change');
            //数据库连接方式onchange
            $('select[name="connectionType"]').change(function () {
                if ($(this).val() == 'JNDI') {
                    $('input[for="DBCP"]').val("");
                    $('div[for="DBCP"]').addClass('hidden').find('.form-control').addClass('ignore');
                    $('div[for="JNDI"]').removeClass('hidden').find('.form-control').removeClass('ignore');
                } else {
                    $('div[for="DBCP"]').removeClass('hidden').find('.form-control').removeClass('ignore');
                    $('div[for="JNDI"]').addClass('hidden').find('.form-control').addClass('ignore');
                    var database = defaultDatabaseInfo[$('select[name="databaseType"]').val()];
                    var $form = $('#database-form');
                    $form.find('input[name="driverClass"]').val(database.driverClass);
                    $form.find('input[name="jdbcUrl"]').val(database.jdbcUrl);
                    $form.find('input[name="userName"]').val(database.userName);
                    $form.find('input[name="password"]').val(database.password);
                    $form.find('input[name="lobProcessorClass"]').val(database.lobProcessorClass);
                }
            }).trigger('change');

            var licenseValidate = function () {
                //License上传
                $uploadLicenseForm.validate($.extend({}, validateOption, {
                    errorClass: 'help-block col-xs-12',
                    rules: {
                        license: 'required'
                    },
                    messages: {
                        license: {
                            required: horizon.lang['load-license']['selectFile']
                        }
                    },
                    highlight: function (e) {
                        $(e).closest('.form-group').addClass('has-error');
                    },
                    success: function (e) {
                        $(e).closest('.form-group').removeClass('has-error');
                        $(e).remove();
                    },
                    submitHandler: function (form) {
                        horizon.notice.loading(horizon.lang['load-license']['operating']);
                        $(form).ajaxSubmit({
                            dataType: 'json',
                            success: function (data) {
                                if (data.restype == 'success') {
                                    $.gritter.removeAll({
                                        after_close: function () {
                                            $wizard.data('fu.wizard').next();
                                        }
                                    });
                                } else {
                                    horizon.notice.error(horizon.lang['load-license']['uploadFailed']);
                                }

                            }
                        });
                    }
                }));
                //上传按钮
                $('#btn-upload-license').on(horizon.tools.clickEvent(), function (e) {
                    var submiturl = horizon.tools.formatUrl('/init/uploadlicense');

                    $uploadLicenseForm.attr('action', submiturl);
                    $uploadLicenseForm.submit();
                });
            };

            //获取国际化
            horizon.language.getLanguage(['validator', 'load-license'], function () {
                if(horizon.static) {
                    horizon.language.handleFullPage();
                    $('title').html(horizon.lang['load-license']['largeTitle']);
                }
                if (loadFlag == 3) {
                    getLicenseInfo();
                }
                dataBaseValidate();
                licenseValidate();
            })

        }
    );
})();
