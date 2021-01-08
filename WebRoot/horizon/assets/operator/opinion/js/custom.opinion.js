/**
 * 常用意见 @author zhangjf 2017年8月21日
 */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery', 'jqueryValidateAll', 'jqueryForm',
		            'elementsFileinput' ], factory);
	} else {
		factory(jQuery);
	}
}(function($) {
	"use strict";
	var heights = {
		outer: function() {
			var _height = horizon.tools.getPageContentHeight();
			return _height;
		},
		tabContent:function() {
			return heights.outer()-253;
	    }
	};
	var urls = {
		delOpinion : horizon.paths.apppath+"/horizon/operate/opinion/delete/opinion.wf",
		insertOpinion : horizon.paths.apppath+"/horizon/operate/opinion/insert/opinion.wf",
		getListOpinion : horizon.paths.apppath+"/horizon/operate/opinion/find/opinions.wf",
		upload : horizon.paths.apppath+'/horizon/template/formdata/uploadfile.wf',
		download : horizon.paths.apppath+'/horizon/template/formdata/downloadfile.wf?fileId=',
		insertSignature : horizon.paths.apppath+'/horizon/operate/opinion/save/signature.wf',
		getSignature : horizon.paths.apppath+"/horizon/operate/opinion/find/signature.wf"
	};
	/**
	 * 页面初始化操作
	 */
	var init = {
		/**
		 * 获取该用户的常用意见
		 */
		getOpinions : function(){
			$("#tasks").empty();
			$.ajax({
				url:urls.getListOpinion,
				cache: false,
				dataType:'json',
				type: 'post',
				error: function(){
					parent.horizon.notice.error(horizon.lang['message']['opreateError']);
				},
				success: function(data) {
					var html="";
					for(var i=0;i<data.length;i++){
						html += "<li class='item-orange clearfix'>"+
							"<label class='inline'>"+
								"<span class='lbl'>"+
									data[i].comments +
								"</span>"+
							"</label>";
						if(data[i].userId != 'public'){
							html += "<div class='pull-right action-buttons'>"+
								"<span class='change tooltip-info' data-rel='tooltip' data-placement='left' title='"+horizon.lang['base']['update']+"' data-original-title='"+horizon.lang['base']['update']+"'>"+
									"<i class='ace-icon fa fa-pencil bigger-125 pointer'></i>"+
								"</span>&nbsp;"+
								"<span class='vbar'></span>"+
								"<span class='delete tooltip-info' data-rel='tooltip' data-placement='left' title='"+horizon.lang['base']['delete']+"' data-original-title='"+horizon.lang['base']['delete']+"'>"+
									"<i class='ace-icon fa fa-times red bigger-125 pointer'></i>"+
								"</span>"+
								"<input type='hidden' name='opinionId' value='"+data[i].id+"'/>"+
							"</div>";
						}
						html += "</li>";
					}
					$("#tasks").append(html);
					$('[data-rel=tooltip]').tooltip();
					event.deleteOpinion();
					event.change();
				}
			});
		},
		getSignature : function(){
			$.ajax({
				url:urls.getSignature,
				cache: false,
				data : {
					type : "signature"
				},
				dataType:'json',
				type: 'GET',
				error: function(){
                    parent.horizon.notice.error(horizon.lang['message']['opreateError']);
				},
				success: function(data) {
					if(data){
                        var $container = $('input[name="signature"]').next().addClass('hide-placeholder '),
                            $fileName = $container.find('.ace-file-name').addClass('large').attr('data-title', ''),
                            $img = $fileName.find('#img');
                        if(!$img.length) {
                            $img = $('<img class="responsive middle" src="#" id="img"  width="144"height="145"/>');
                            $img.insertBefore($fileName.children('.ace-icon'));
                        }
						$("#img").removeClass("hidden");
						$("#img").attr('src',urls.download+data);
                        $(".profile-picture").mouseover(function(){
                            if($("#img").length){
                                $(".ace-file-name").attr('data-title',horizon.lang['base']['clickChange']);
                                $(".ace-file-container").addClass('selected');
                            }
                        });
                        $(".profile-picture").mouseout(function(){
                            $(".ace-file-name").attr('data-title','');
                            $(".ace-file-container").removeClass('selected');
                        });
						$("input[type='hidden'][name='fileId']").val(data);
                        $(".remove").click(function(){
                            $("input[name='fileId']").val("");
                            saveSignature($("input[name='fileId']").val());
                        });
					}
				}
			});
		},
		setScroll :function(){
			$(".ace-scroll").height(heights.tabContent()).ace_scroll({
		        size: heights.tabContent()
		    });
		}
	};
	/**
	 * 操作事件
	 */
	var operate = {
		/**
		 * 新增常用意见
		 */
		newOpinion : function(){
			if($("input[name='comments']").val()==""){
                parent.horizon.notice.error(horizon.lang['platform-opinion']['inputError']);
				return;
			}
			$.ajax({
				url : urls.insertOpinion,
				type: "POST",
				dataType : 'json',
				data : $("#opinionForm").serialize(),
				cache : false,
				error : function() {
                    parent.horizon.notice.error(horizon.lang['message']['opreateError']);
				},
				success : function(data) {
					if (data) {
                        parent.horizon.notice.success(horizon.lang['message']['saveSuccess']);
						$("input[name ='comments']").val("");
						$("input[name ='id']").val("");
						init.getOpinions();
					} else {
                        parent.horizon.notice.error(horizon.lang['message']['saveError']);
					}
				}
			});
		},
		/**
		 * 修改常用意见
		 */
		updateOpinion : function(obj){
			var	id = $(obj).parent().find("input").val();
			$("li.item-orange").css('background-color','');
			$(obj).parents('.item-orange').css('background-color','rgba(98, 168, 209, 0.1)');
			var	comments = $(obj).parent().parent().find(".lbl").text();
			$("input[name ='comments']").val(comments);
			$("input[name ='id']").val(id);
		},
		/**
		 * 删除常用意见
		 */
		deleteOpinion : function(obj){
			var	id = $(obj).parent().find("input").val();
			$("input[name ='comments']").val("");
			$("input[name ='id']").val("");
			$.ajax({
				url:urls.delOpinion,
				cache: false,
				type: 'post',
				dataType:'json',
				data:{
					id:id
				},
				error: function(){
                    parent.horizon.notice.error(horizon.lang['message']['opreateError']);
				},
				success: function(data) {
					if (data) {
                        parent.horizon.notice.success(horizon.lang['message']['deleteSuccess']);
						$(obj).parent().parent().remove();
					} else {
                        parent.horizon.notice.error(horizon.lang['message']['deleteFail']);
					}
				}
			});
		}
	};
	/**
	 * 绑定事件
	 */
	var event = {
		refresh : function(){
			$(".refresh").bind(horizon.tools.clickEvent(), function(){
				init.getOpinions();
			} );
		},
		change : function(){
			$(".change").bind(horizon.tools.clickEvent(), function(){
				operate.updateOpinion(this);
			});
		},
		newOpinion : function(){
			$("#newopinion").bind(horizon.tools.clickEvent(), function(){
				operate.newOpinion();
			});
		},
		deleteOpinion : function(){
			$(".delete").bind(horizon.tools.clickEvent(), function(){
				operate.deleteOpinion(this);
			});
		},
		resetOpinion : function(){
			$("#reset").bind(horizon.tools.clickEvent(), function(){
				$("input[name ='comments']").val("");
				$("input[name ='id']").val("");
			});
		},
        validateComments : function(){
            $("input[name ='comments']").keyup(function(){
            	var value=$(this).val();
                var pattern = new RegExp("[&|$<>^@#-\\/{}]");
                var rs = "";
                for (var i = 0; i < value.length; i++) {
                    rs = rs + value.substr(i, 1).replace(pattern, '');
                }
                $(this).val(rs);
            });
        }
	};
	/**
	 * 头像上传
	 */
	var upload ={
		init:function(){
			$('input:file').ace_file_input({
	            allowExt: ['jpg','png','bmp','gif','jpeg'],
	            no_file:horizon.lang['platform-opinion']['selectPictures'],
	            btn_choose:horizon.lang['platform-opinion']['selectPictures'],
	            droppable: false,
	            maxSize:1024*1024,
	            upload:function(){
                    $('#fileUp').ajaxSubmit({
                        url : urls.upload,
                        dataType : 'json',
                        type : 'POST',
                        cache: false,
                        success : function(data) {
                            if (data[0].fileId) {
                                var $container = $('input[name="signature"]').next().addClass('hide-placeholder '),
                                    $fileName = $container.find('.ace-file-name').addClass('large').attr('data-title', ''),
                                    $img = $fileName.find('#img');
                                if (!$img.length) {
                                    $img = $('<img class="responsive middle" src="#" id="img"  width="144"height="145"/>');
                                    $img.insertBefore($fileName.children('.ace-icon'));
                                }
                                $img.removeClass("hidden");
                                $img.attr('src', urls.download + data[0].fileId);
                                $("input[name='fileId']").val(data[0].fileId);
                                $(".profile-picture").mouseover(function () {
                                    if ($("#img").length) {
                                        $(".ace-file-name").attr('data-title', horizon.lang['base']['clickChange']);
                                        $(".ace-file-container").addClass('selected');
                                    }
                                });
                                $(".profile-picture").mouseout(function () {
                                    $(".ace-file-name").attr('data-title', '');
                                    $(".ace-file-container").removeClass('selected');
                                });
                            } else {
                                $("#img").remove();
                                var $container = $('input[name="signature"]').next().removeClass('hide-placeholder');
                                $container.find('.ace-file-name').removeClass('large');

                            }
                            saveSignature( data[0].fileId);
                        },
                        error: function() {
                            $("#img").remove();
                            var $container = $('input[name="avatar"]').next().removeClass('hide-placeholder');
                            $container.find('.ace-file-name').removeClass('large');
                            parent.horizon.notice.error(horizon.lang['message']['opreateError']);
                        }
                    })
	            }
			}).on('file.error.ace', function(event, info){
		        if(info.error_count['ext'] || info.error_count['mime']){
                    parent.horizon.notice.error(horizon.lang['message']['fileFormatError']);
		        }
				if(info.error_count['size']){
                    parent.horizon.notice.error(horizon.lang['platform-opinion']['fileSizeError']);
		        }

			});
			/**
			 * 
			 * 为图片绑定事件
			 */
			$("#img").bind(horizon.tools.clickEvent(),function() {
	            $("input[name='signature']").trigger('click');
			});
	}};

	var saveSignature= function(fileId){
            /**
             * 将用户和附件信息绑定
             */
            $.ajax({
                url : urls.insertSignature,
                type: "POST",
                dataType : 'json',
                data : {
                    id :fileId,
                    type : "signature"
                },
                cache : false,
                error : function() {
                    parent.horizon.notice.error(horizon.lang['message']['opreateError']);
                },
                success : function(data) {
                    if (data) {
                        parent.horizon.notice.success(horizon.lang['message']['saveSuccess']);
                    } else {
                        parent.horizon.notice.error(horizon.lang['message']['saveFail']);
                    }
                }
            });
    }
	return horizon.manager['opinion'] = {
		init : function() {
			init.getOpinions();
			init.getSignature();
			init.setScroll();
			event.resetOpinion();
			event.newOpinion();
			event.refresh();
            event.validateComments();
			upload.init();
		}
	};
}));
