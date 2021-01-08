/**
 * 管理端
 * @author zhouwf
 */
require.config({
    baseUrl: horizon.paths.pluginpath,
    paths: horizon.vars.requirePaths,
    shim: horizon.vars.requireShim
});
require(['jquery', 'horizonFramepage'], function($) {

    horizon.framepage.sources = {
        navmenu: horizon.tools.formatUrl('/system/navmenu'),
        logout: horizon.tools.formatUrl('/login/logout'),
        checkPassword: horizon.tools.formatUrl('/system/user/checkoldpassword'),
        updatePassword: horizon.tools.formatUrl('/system/user/update/password'),
        base: horizon.tools.formatUrl('/system/base')
    };

    horizon.framepage.storageSpace = 'ENGINE';

    var setup = function() {

        var hasUpdatePassword = !!$('[data-operator="updatePassword"]').length,
            languageArray = hasUpdatePassword ? ['base', 'message', 'validator'] : ['base'];

        horizon.language.getLanguage(languageArray, function() {
            if(horizon.static) {
                horizon.language.handleFullPage();
                try {
                    $('title').html(horizon.lang.base.appname);
                }catch (e) {
                    $('title').innerHTML = horizon.lang.base.appname;
                }
            }
            horizon.framepage.init();
        });

    };

    if(horizon.static) {
        horizon.framepage.getBase('ENGINE', setup);
    }else {
        setup();
    }

    horizon.tools.initHorizonModal();

});