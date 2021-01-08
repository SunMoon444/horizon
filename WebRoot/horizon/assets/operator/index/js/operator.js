/**
 * 应用端
 * @author zhouwf
 */
require.config({
    baseUrl: horizon.paths.pluginpath,
    paths: horizon.vars.requirePaths,
    shim: horizon.vars.requireShim
});
require(['jquery', 'horizonFramepage'], function($) {

    horizon.framepage.sources = {
    	navmenu: horizon.paths.apppath+'/horizon/manager/menu/navigation.wf?menuCategory=1',
        logout: horizon.paths.apppath + '/horizon/platform/logout.wf',
        checkPassword: horizon.paths.apppath +'/horizon/manager/org/user/check/password.wf',
	    updatePassword: horizon.paths.apppath +'/horizon/manager/org/user/update/password.wf'
    };

    horizon.framepage.storageSpace = 'OPERATOR';

    horizon.framepage.nav.isDefUrl = function(hash) {
        return (hash == 'page/home' || hash == 'page/widget.analysis');
    };

    $('[data-rel=tooltip]').tooltip({container: 'body'});


    horizon.language.getLanguage(['base', 'message', 'validator'], function() {

    	horizon.framepage.init();

        var $password = $('#newPassword');
        $password.on('change', function() {
            horizon.password.setStrong($('#userForm .pwd-strong'), $(this).val());
        });
        horizon.password.addStrongCheck($password, horizon.paths.apppath + '/horizon/manager/org/user/strongPwdAuth/check.wf');
        horizon.password.checkTimerUpdate($('input[name="pwdTimerUpdate"]'));
    });

    horizon.modal.init();
    horizon.tools.initHorizonModal();

});