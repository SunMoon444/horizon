/**
 * @pengys 2017-8-18
 * 主页 待办,待阅,已阅的js数据处理
 */
(function(factory) {
    if(typeof define === 'function' && define.amd) {
        var scripts = ['jquery', 'horizonNote'];
        define(scripts, factory);
    }else {
        factory(jQuery);
    }
}(function(){
	/**
	 * 我的待办列表
	 */
	var todealList={
		ajaxTodealList:function(){
			$.ajax({
				url: horizon.paths.apppath+'/horizon/operator/todeal.wf',
				cache: false,
				dataType:'json',
				error: function(){
					horizon.notice.error(horizon.lang.message['operateError']);
				},
				success: function(viewData) {
					//请求返回数据有误时,终止
					if(viewData){
                        var data = viewData.data;
                        if(data == null || data.length == 0 ) {
                            //没有数据时,进行提醒
                            $('.todo-container').css('position','relative');
                            var $message = $('<span style="position:absolute;top:50%;left:50%;font-family:Microsoft YaHei;color:#666;">'+horizon.lang["message"]["noData"]+'</span>');
                            $('.todo-container').prepend($message);
                            return;
                        }
                        $("#dealCount").html(viewData.recordsTotal);
                        todealList.init(data);
					}
				}
			});
		},
		init:function(data){
			$('.todo-container').horizonNote({
				timeline_content_dom: $('.todo-tpl').html(),
				group_type: 'string',
				sub_column: 'deadline',
				local_data:data,
				fnAfterSuccess: function($container) {
					//数据填充后,下边框(margin-bottom)会变长,设置它的(no-margin-bottom)属性
					$container.find('.timeline-style2').addClass("no-margin-bottom");
					//如果有截止时间限制,进行标红提醒
					$container.find('.timeline-date').each(function(index,element){
						if($(this).text().indexOf(horizon.lang["platform-home"]["extended"]) >= 0){
							$(this).css("color","#FF892A");
						}
					});
					$container.find('.horizon-list-item').on('click', function() {
						var url = horizon.paths.flowpath + '?workId=' + $(this).attr('data-workId')+'&trackId=' + $(this).attr('data-trackId');
						var subjection = $(this).attr('data-subjectionId');
						if(subjection != null && subjection != '') {
		                    url += '&subjection=' + subjection;
		                }
						horizon.open({
							url: url,
							closeCallback:"horizon.operator['home'].flushtodeal()"
						});
					});
				}
			});
		},
		
	};
	/**
	 * 已发起列表
	 */
	var hadstartedList={
		init:function(){
			$('.started-container').horizonNote({
				timeline_content_dom: $('.started-tpl').html(),
				url:horizon.paths.apppath+'/horizon/operator/hadstarted.wf',
				group_type: 'string',
				columns: [
					{
						column_name: 'workId'
					},
					{
						column_name: 'flowName'
					},
					{
						column_name: 'title'
					},
					{
						column_name: 'timeSuffix'
					},
					{
						column_name: 'startDate'
					},
					{
						column_name: 'remindCount'
					}
				],
				fnAfterSuccess: function($container) {
					$container.find('.horizon-list-item').on('click', function() {
						horizon.open({
							url: horizon.paths.flowpath + '?workId=' + $(this).attr('data-workId')
						});
						
					});
					//暂无数据提醒[可以从后台返回的数据情况判定,也可以从页面的显示情况判定]
					var contentLength = $container.find('.horizon-list-item').length;
					//0表示容器内的horizon-list-item个数没有变化即没有数据加载
					if(contentLength == 0){
						$container.css('position','relative');
						var $message = $('<span style="position:absolute;top:50%;left:50%;font-family:Microsoft YaHei;color:#666;">'+horizon.lang["message"]["noData"]+'</span>');
						$container.prepend($message);
						return;
					}
				}
			});
		}
	};
	/**
	 * 待阅列表
	 */
	var toreadList={
        ajaxToreadList:function(){
            $.ajax({
                url:horizon.paths.apppath+'/horizon/operator/toread.wf',
                cache: false,
                dataType:'json',
                error: function(){
                    horizon.notice.error(horizon.lang.message['operateError']);
                },
                success: function(viewData) {
                    if(viewData == null || viewData.data==null || viewData.data.length == 0 ) {
						$('.toread-container').css('position','relative');
						var $message = $('<span style="position:absolute;top:50%;left:50%;font-family:Microsoft YaHei;color:#666;">'+horizon.lang["message"]["noData"]+'</span>');
						$('.toread-container').prepend($message);
						return;
                    }
                    var data = viewData.data;
                    $("#readCount").html(viewData.recordsTotal);
                    toreadList.init(data);
                }
            });
        },
		init:function(data){
			$('.toread-container').horizonNote({
				type: 'timeline',
				timeline_content_dom: $('.toread-tpl').html(),
                local_data:data,
				group_type: 'string',
				columns: [
					{
						column_name: 'data.workId'
					},
					{
						column_name: 'data.SendUserName'
					},
					{
						column_name: 'data.title'
					},
					{
						column_name: 'data.timeSuffix'
					},
					{
						column_name: 'data.sendDate'
					}
				],
				fnAfterSuccess: function($container) {
					//没有数据时进行显示提醒
					$container.find('.horizon-list-item').on('click', function() {
		                horizon.open({
		                	url: horizon.paths.flowpath + '?workId=' + $(this).attr('data-workId'),
		                	closeCallback:"horizon.operator['home'].flushtoread()"
		                });
					});
					
				}
			});
		}
	};
	/**
	 * 我可以发起的
	 */
	var canLaunchList={
		init:function(){
			var $lis= $('.horizon-pills li');
			$lis.attr('style','visibility:hidden');
			$.ajax({
				url : horizon.paths.apppath+'/horizon/operator/flow/page.wf',
				dataType:'json',
				cache : false,
				error : function(){
					horizon.notice.error(horizon.lang['message']['operateError']);
				},
				success : function(data) {
					if(data.length == 0){
						$('#can-launch').css('position','relative');
						var $message = $('<span style="position:absolute;top:50%;left:50%;font-family:Microsoft YaHei;color:#666;">'+horizon.lang["message"]["noData"]+'</span>');
						$('#can-launch').prepend($message);
						return;
					}
					//将有数据的模块显示出来,最多显示9个
					for (var i = 0; i < data.length; i++) {
						var $each = $lis.eq(i);
						$each.attr("style","visibility:visible");
						$each.find("span").text(data[i].flowName);
						var flowId=data[i].flowId;
						$each.data('flow-id', flowId);
					}
					//给每个显示出来的模块添加一个点击事件
					$(".horizon-pills").on('click', 'li', function (e) {
						var flowId = $(e.currentTarget).data('flow-id')
						var url = horizon.paths.flowpath + '?flowId=' + flowId;
						horizon.open({url:url});
					});
				}
			});
		}
	};
	//刷新页面
	var flushList = {
		flushtodealList:function(){
			$('.todo-container').empty();
			todealList.ajaxTodealList();
		},				
		flushtoreadList:function(){
			$('.toread-container').empty();
			toreadList.ajaxToreadList();
		}
	}
	var click = {
		init:function(){
			$('#toreadCorn').on('click',function(){
				$('#change').attr("href","#page/toread.list");
			});
			$('#todealCorn').on('click',function(){
				$('#change').attr("href","#page/todo.list");
			});
		}
	}
	var licenseInfo = {
        init:function(){
            $.ajax({
                url: horizon.paths.apppath+'/horizon/operator/license/expire.wf',
                cache: false,
                dataType:'json',
                error: function(){
                    horizon.notice.error(horizon.lang.message['operateError']);
                },
                success: function(data) {
                	if (data){
                        $('#licenseInfo').empty().append("<strong>license到期时间:"+data+"</strong>");
                    }
                }
            });
		}
	}
	 return horizon.operator['home'] = {
		 init: function(){
			 todealList.ajaxTodealList();
			 hadstartedList.init();
			 toreadList.ajaxToreadList();
			 canLaunchList.init();
			 click.init();
             licenseInfo.init();
		 },
		 flushtodeal:flushList.flushtodealList,
		 flushtoread:flushList.flushtoreadList
	 };
}));