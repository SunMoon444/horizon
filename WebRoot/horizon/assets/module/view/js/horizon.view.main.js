/**
 * Created by zhouwf on 2015-5-25.
 */
(function(root , undefined) {
    if( !('horizon' in root) ) root['horizon'] = {};
    if( !('view' in horizon) ) horizon.view = {};
    horizon.dialogMessage = document.getElementById('dialog-message');
    horizon.defaultDialogOption = {
        title: '提示',
        closeText: '关闭'
    };
    horizon.view.name = window.name;
    /**@description 是否为protocol页面*/
    horizon.view.isProtocolPage = ('isProtocolPage' in window ? isProtocolPage : horizon.tools.getQueryString('isprotocolpage'));
    horizon.view.isProtocolPage = (horizon.view.isProtocolPage == 'true' ? true : false);
    /**@description 视图ID*/
    horizon.view.viewId = ('viewId' in window ? viewId : horizon.tools.getQueryString('viewid'));
    /**@description 自定义视图解析*/
    horizon.view.service =  horizon.tools.getQueryString('service') || 'viewDatatablesServiceImpl';
    /**@description 自定义视图基础数据请求地址*/
    horizon.view.viewInfoSource = horizon.tools.getQueryString('viewInfoSource') || 'getViewInfo';
    /**@description 自定义视图业务数据请求地址*/
    horizon.view.viewDataSource = horizon.tools.getQueryString('viewDataSource') || 'getViewDataInfo';
    /**@description 如果是嵌入iframe中的视图此值对应的是父级widget的属性[widget-id]*/
    horizon.view.widgetId = ('widgetId' in window ? widgetId : horizon.tools.getQueryString('widgetid'));
    /**@description DATATABLES对象*/
    horizon.view.dataTable = null;
    /**@description 选中的ID集合*/
    horizon.view.checkIds = [];
    /**@description 选中的数据集合*/
    horizon.view.checkDatas = [];
    /**@description 视图基础信息*/
    horizon.view.defaultViewOptions = null;
    /**@description datatables数据BODY部分高度*/
    horizon.view.frameHeight = 0;
    /**@description 初始化视图JS*/
    horizon.view.requirePaths = {
        'viewDatatables': horizon.paths.apppath + '/horizon/assets/module/view/js/horizon.view',
        'viewProtocolDatatables': horizon.paths.apppath + '/horizon/assets/module/view/js/horizon.view.protocol',
        'viewElementInit': horizon.paths.apppath + '/horizon/assets/module/view/js/horizon.view.element'
    };
    if (document.getElementById("flowtree-container-view")) {
        horizon.view.requirePaths.flowTree = horizon.paths.apppath + '/horizon/assets/module/view/js/horizon.flow.tree';
    }
    horizon.tools.extend(horizon.vars.requirePaths, horizon.view.requirePaths);
    horizon.view.requireModule = [
        'jquery',
        ('ontouchstart' in document.documentElement?'jqueryMobileCustom' : ''),
        'bootstrap',
        'horizonJqueryui',
        'horizonDatatables',
        (document.getElementById("flowtree-container-view")?'horizonFlowtree':''),
        'elementsScroller',
        'viewElementInit',
        (document.getElementById("flowtree-container-view")?'flowTree':''),
        'ace'
    ];
    horizon.view.protocolRequireModule = [
        'jquery',
        ('ontouchstart' in document.documentElement?'jqueryMobileCustom' : ''),
        'bootstrap',
        'horizonJqueryui',
        'horizonDatatables',
        (document.getElementById("flowtree-container-view")?'horizonFlowtree':''),
        (document.getElementById("flowtree-container-view")?'flowTree':''),
        'elementsScroller',
        'ace'
    ];
})(window);

jQuery(function($) {
    /**@description 获取视图基本信息*/
    $.ajax({
        url: horizon.paths.apppath + '/horizon/view/' + horizon.view.viewInfoSource + '.wf',
        cache: false,
        dataType: "json",
        data: {
            viewId: horizon.view.viewId,
            service: horizon.view.service
        },
        beforeSend : function() {
            $('body').append('<div id="loadingInfo" class="center"><h5 class="ajax-loading-animation"><i class="fa fa-spinner fa-spin"></i> 正在获取视图信息... </h5></div>');
        },
        error : function(xhr, ajaxOptions, thrownError) {
            $('#loadingInfo').html('<h5 class="ajax-loading-error red"><i class="fa fa-warning txt-color-orangeDark"></i> Error ' + xhr.status + '!</h5>');
        },
        success: function(data){
            if(data != null) {
                if(horizon.view.name == 'rightViewFrame') {
                    try{
                        parent.horizon.operator.hideRightViewHeader();
                        parent.horizon.operator.initHeight();
                    }catch(e){}
                }
                horizon.view.defaultViewOptions = data;
                //表头中添加全选checkbox
                var columns = [
                    {
                        mDataProp: 'rownumber_',
                        sName: 'rownumber_',
                        sTitle: '',
                        orderable: false,
                        sClass: 'center no-padding-left no-padding-right',
                        sWidth: '35px',
                        bVisible: true,
                        bSearchable: false
                    }
                ];
                if(horizon.view.defaultViewOptions.isHaveCheckBox
                    && horizon.view.defaultViewOptions.columns != null) {
                    columns.push({
                        mDataProp: 'checkbox',
                        sName: 'checkbox',
                        sTitle: '<label class="position-relative"><input type="checkbox" name="checkAll" class="ace" /><span class="lbl"></span></label>',
                        orderable: false,
                        sClass: 'center hidden-print',
                        sWidth: '50px',
                        bVisible: true,
                        bSearchable: false
                    });
                }
                horizon.view.defaultViewOptions.columns = columns.concat(horizon.view.defaultViewOptions.columns);
                //加载视图引入的JS文件
                if($.trim(horizon.view.defaultViewOptions.jsscript)) {
                    eval(horizon.view.defaultViewOptions.jsscript);
                    horizon.tools.extend(horizon.vars.requirePaths, horizon.js.requirePaths);
                    for(var module in horizon.js.requirePaths) {
                        if(horizon.view.isProtocolPage) {
                            horizon.view.protocolRequireModule.push(module);
                        }else {
                            horizon.view.requireModule.push(module);
                        }
                    }
                    horizon.tools.extend(horizon.vars.requireShim, horizon.js.requireShim);
                }
                if(horizon.view.isProtocolPage) {
                    $('body').addClass('protocolPage');
                }
                $('#loadingInfo').remove();
                require.config({
                    baseUrl: horizon.paths.pluginpath,
                    paths: horizon.vars.requirePaths,
                    shim: horizon.vars.requireShim
                });
                require([(horizon.view.isProtocolPage?'viewProtocolDatatables':'viewDatatables')],
                    function(){
                    /**@description 加载外部引用的CSS*/
                    $.each(horizon.css, function(i, _css) {
                        if(!(/\.css$/.test(_css))) {
                            _css += '.css';
                        }
                        if(!(/^(http[s]?|ftp):\/\//.test(_css)) && !(/^\//.test(_css))){
                            _css = horizon.paths.apppath + '/' + _css;
                        }
                        horizon.tools.use(_css);
                    });
                    setTimeout(function() {
                    	try{
                        	$('body')[0].focus();
                        }catch(e){}
                    }, 1);
                   
                });
            }else{
                $('#loadingInfo').html('<h3 class="ajax-loading-error"><i class="fa fa-warning txt-color-orangeDark"></i> 未获取到视图信息 </h3>');
            }
        }
    });
});
