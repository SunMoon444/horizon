/*
* 慧正表格插件
* */
(function (root, factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery', 'horizonDatatables'], factory);
    }else {
        factory(root.jQuery);
    }
}(this, function($) {
    "use strict";
    $.horizonTable = function(placeholder, options) {
        options = options?$.extend(true, {}, $.fn.horizonTable.defaults, options) : $.fn.horizonTable.defaults;
        if(options.type == 'datatable') {
            $.extend(true, $.fn.horizonDatatable.defaults, $.fn.horizonTable.defaults);
            return $.horizonDatatable(placeholder, options);
        }
    };

    $.horizonTable.version = '1.0.0';

    $.fn.horizonTable = function(options) {
        return $.horizonTable(this[0], options);
    };

    $.fn.horizonTable.defaults = {
        type: 'datatable',

        serverSideSettings: false, //服务器加载基础配置
        ajaxSettingsSource: null, //请求基础配置路径
        ajaxSettingsParam: null, //请求基础配置参数
        ajaxSettingsDbIdentifier: null, //请求基础配置数据源

        settings: {
            /**
             * 视图title
             * @examples
             *  title: '查询结果'
             *  or
             *  title: {
             *      en: 'result',
             *      'zh-cn': '查询结果'
             *  }
             * */
            title: null,
            checkbox: -1, //CHECKBOX列下标, 为-1时默认不生成CHECKBOX
            pagingMemory: false, //是否支持分页记忆
            searchable: true, //是否支持搜索
            multipleSearchable: false, //是否支持高级搜索
            multipleSearchAreaVisible: false, //高级搜索区域是否默认展示
            /**
             * 表格容器的高度
             * @examples
             *  height: function() {
             *      return $(window).height();
             *  }
             *  or
             *  height: '600px'
             * */
            height: null,

            reload: true, //刷新
            fullscreen: false, //全屏
            collapse: false, //收缩
            excel: false, //导出EXCEL
            print: false, //打印

            /**
             * columns值为数组, 存放列对象
             * @examples: columns: [
             *                    {
             *                        //表头显示内容
             *                          @examples
             *                              title: '列一'
             *                              or
             *                              title: {
             *                                  en: 'one',
             *                                  'zh-cn': '列一'
             *                              }
             *                        title: null,
             *                        name: null, //名称
             *                        dataProp: null, //匹配DATA中对应KEY的VALUE值
             *
             *                        width: null, //宽度
             *                        visible: true, //是否显示
             *                        searchable: false, //简单搜索
             *                        multipleSearchable: false, //高级搜索
             *                        orderable: false, //点击列排序
             *                        columnClass: null, //列样式
             *                        fnClick: null //ONCLICK方法
             *                    }
             *                ]
             * */
            columns: null,

            /**
             * buttons值为数组, 存放按钮对象
             * @examples: buttons: [
             *                  {
             *                     id: '', //按钮ID
             *                     //按钮文本
             *                          @examples
             *                          text: '按钮一'
             *                          or
             *                          text: {
             *                              en: 'button1',
             *                              'zh-cn': '按钮一'
             *                          }
             *                     text: '',
             *                     icon: 'fa fa-coffee', //图标
             *                     buttonClass: '', //样式
             *                     fnClick: null //ONCLICK方法
             *                  }
             *              ]
             *
             * */
            buttons: null,

            fnCreateCell: null,
            fnDrawCallback: null,

            pluginSettings: null
        },

        serverSideData: true, //服务器加载数据
        ajaxDataSource: null, //请求数据路径
        ajaxDataParam: null, //请求数据参数
        ajaxDataDbIdentifier: null, //请求数据数据源

        data: null //本地数据

    };
}));

