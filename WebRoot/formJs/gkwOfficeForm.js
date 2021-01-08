//获取该表单id
var formid=jQuery("input[name='FORMID']").val();

var miji = jQuery("select[name='"+formid+"_MIJI']:checked").val();//获取密级值
//根据密级判断稿头值
if(miji == "非密"){
	jQuery("input[name='"+formid+"_miji2']").val("公开");
	jQuery("input[name='"+formid+"_liushuihao']").val(0);
}else if (miji == "秘密") {
	jQuery("input[name='"+formid+"_miji2']").val("秘密");
	jQuery("input[name='"+formid+"_liushuihao']").val("10年");
}else {
	jQuery("input[name='"+formid+"_miji2']").val("机密");
	jQuery("input[name='"+formid+"_liushuihao']").val("20年");
}