//��ȡ�ñ�id
var formid=jQuery("input[name='FORMID']").val();

var miji = jQuery("select[name='"+formid+"_MIJI']:checked").val();//��ȡ�ܼ�ֵ
//�����ܼ��жϸ�ͷֵ
if(miji == "����"){
	jQuery("input[name='"+formid+"_miji2']").val("����");
	jQuery("input[name='"+formid+"_liushuihao']").val(0);
}else if (miji == "����") {
	jQuery("input[name='"+formid+"_miji2']").val("����");
	jQuery("input[name='"+formid+"_liushuihao']").val("10��");
}else {
	jQuery("input[name='"+formid+"_miji2']").val("����");
	jQuery("input[name='"+formid+"_liushuihao']").val("20��");
}