(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'jqueryValidateAll', 'ztree',
            'elementsFileinput'], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    "use strict";
    var _height = {
        outerHeight: function () {
            var _height = horizon.tools.getPageContentHeight() - 30;
            return _height;
        }
    };
    var select = {
        selItem: function (logInfo) {
            if (logInfo == "login_log") {
                $("#loginArchivingInfo").removeClass("hidden");
                showView.showLoginArchiving();
                $("#logOtherArchivingInfo").addClass("hidden");
            } else {
                $("#logOtherArchivingInfo").removeClass("hidden");
                showView.showOtherArchiving();
                $("#loginArchivingInfo").addClass("hidden");
            }
        }
    };
    var showView = {
        showLoginArchiving: function () {
            var viewUrl = horizon.paths.viewpath + "?viewId=HZ28868a5e83114a015e83495e610133";
            $("#loginArchivingList").attr("height", _height.outerHeight()).attr("src", viewUrl);
        },
        showOtherArchiving: function () {
            var viewUrl = horizon.paths.viewpath + "?viewId=HZ28868a5e83114a015e836dd1420143";
            $("#logOtherArchivingList").attr("height", _height.outerHeight()).attr("src", viewUrl);
        }
    };
    return horizon.manager['logarchiving'] = {
        init: function () {
            var logInfo = horizon.tools.getPageParam('logType');
            select.selItem(logInfo)
        }
    };
}));



