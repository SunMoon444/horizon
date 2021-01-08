/**
 * 首页定制 @author zhangjf 2017年9月13日
 */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery', 
		         'jqueryValidateAll', 
		         'jqueryForm',
		         'horizonWidget'], factory);
	} else {
		factory(jQuery);
	}
}(function($) {
	"use strict";
	var urls = {
			savePersonCustom : horizon.paths.apppath+'/horizon/manager/widget/savePersonCustom.wf',
			customWidgetByLoginUser : horizon.paths.apppath + '/horizon/manager/widget/customWidgetByLoginUser.wf',
        	getCustomByLoginUserObjectId:horizon.paths.apppath+'/horizon/manager/widget/getCustomByLoginUserObjectId.wf',
	};
	/**
	 * 页面初始化操作
	 */
	var init = {
		//初始化个人首页定制
		initCustom : function(){
			$('.span-null').html('');
			$('#custom-info-form')[0].reset();
			//horizon.widgetapp.getSelectLayout();
			var scope="user";	
			var objectId= '';
			method.getCustomByLoginUserObjectId(scope,objectId);//根据objectId获取用户首页定制
			horizon.widgetapp.layoutSortable();//布局拖动
			horizon.widgetapp.widgetSortable();//组件拖动
		}
	};
	var method = {
		//保存个人首页定制信息
		savePersonCustom: function() {
			var flag=false;
			var selectVal=$('#layoutId');
			if(selectVal.size()==0){
				$('#layoutId').next('.span-null').html(horizon.lang["platform-widget"]["selectLayout"]);
			}else{
				flag=true;
			}
			if(flag){
				var objectId=$('input[name="INPUT_USER"]').val();
				var layoutId=$('#layoutId').val();
				var customId=$('#customId').val();
				var $areas=$('.widget-container-col');
				var _data = {
					areaCount: $areas.length,
					id:customId,
					scope:$('input[name="scope"]:checked').val(),
					layoutId:layoutId,
					objectId:objectId
				};
				$areas.each(function(i){
					var $this=$(this);
					var layoutArea=$this.data('layoutArea');
						layoutId=layoutArea.layeroutId;
					_data['area_id_' + i] = layoutArea.id;
					var widgetIdArr = [];
					$this.children('.widget-box').each(function(k) {
						var $this=$(this);
						var widget=$this.data('widget');
						var widgetId=widget.id;
						widgetIdArr.push(widgetId);
						_data[layoutArea.id + '_' + widgetId + '_ORDER'] = k;
					});
					_data[layoutArea.id+'_WIDGET'] = widgetIdArr.join(';');
				});
				$.ajax({
					url:urls.savePersonCustom,
					data:_data,
					cache:false,
					dataType:'json',
					success:function(data) {
						if(data!=null && data!='false'){
							horizon.notice.success(horizon.lang["message"]["saveSuccess"]);
							method.loadContent();
							window.location.href="#page/widget.analysis";
						}else{
							horizon.notice.error(horizon.lang["message"]["saveFail"]);
						}
					}
				});
			}
		},
		loadContent: function(){
			 var $widgetContainer=$('#widget-container');
			$.ajax({
				url:urls.customWidgetByLoginUser,
				dataType:'json',
				cache:false,
				success:function(data) {
					if(data[0] !=null && data[1] !=null && data.length>0){
						$('.prompt-span-operator').addClass('hidden');
						var layoutAreas=data[1].layoutAreas;
						var customWidgets=data[0].customWidgets;
						var $widgetOption=$('.widget-box-large-default').children();
							var $widgetSmallOption=$('.widget-box-small-default').children();
							$widgetSmallContainer.html('');
							$widgetContainer.html('');
							$widgetContainer.data('custom',data[0]);
							$.each(layoutAreas,function(i,area) {
								var $newOption=$('<div name="panel" panel="" class="widget-container-area-col ui-sortable"></div>');
								$newOption.data('layoutArea',area);
								$newOption.attr("panel",i+1);
								var addClass='col-xs-'+area.xs+' col-sm-'+area.sm+' col-md-'+area.md+' col-lg-'+area.lg;
								$newOption.addClass(addClass);
								$.each(customWidgets,function(i,customWidget) {
									if(area.id == customWidget.layoutAreaId){
										var widget=customWidget.widget;
										if(widget!=null) {
											var $widgetBox=$widgetOption.clone();
											var $widgetSmallBox=$widgetSmallOption.clone();
											$widgetBox.data('widget',widget);
											$widgetBox.data('customWidget',customWidget);
											$widgetBox.attr('widget-id',customWidget.widgetId);
											$widgetBox.find('.widget-main').attr('widget-main-height',widget.height+'px');
											$widgetBox.find('.widget-main').css('height',widget.height+'px');
											$widgetBox.find('iframe').css({'min-height':widget.height+'px',height:widget.height+'px'});
											$widgetSmallBox[0].href = widget.url;
											$widgetSmallBox.children('.widget-box-title').html(widget.name);
											if(widget.iconType == 'class') {
												$widgetBox.find('.widget-title').append('<i class="ace-icon infobox-icon ' + widget.icon + '" style="' + widget.widgetClass + '"></i>');
												$widgetBox.find('.widget-title').append('<span>' +widget.name+ '</span>');
												$widgetSmallBox.children('.widget-box-title').before('<i class="ace-icon infobox-icon ' + widget.icon + '" style="' + widget.widgetClass + '"></i>');
											}else {
												$widgetBox.find('.widget-title').append('<img class="img-icon" src="' + widget.icon + '" style="' + widget.widgetClass + '"></img>');
												$widgetBox.find('.widget-title').append('<span> ' +widget.name+ '</span>');
												$widgetSmallBox.children('.widget-box-title').before('<img class="img-icon-small" src="' + widget.icon + '" style="' + widget.widgetClass + '"></img>');
											}
											var url=widget.url;
											$widgetBox.find('iframe')[0].src=url;
											$newOption.append($widgetBox);
											$widgetSmallContainer.append($widgetSmallBox);
										}
									}
								});
								$widgetContainer.append($newOption);
							});
						}else {
							$('.prompt-span-operator').removeClass('hidden');
						}
						$widgetContainer.children('.widget-container-area-col').children('.widget-box').on('closed.ace.widget', function() {
							$(this).remove();
							var custom=$widgetContainer.data('custom');
							if(custom.scope != 'user' && $widgetContainer.find('.widget-box').length==0){
								return ;
							}else{
								method.sortableUpdate();
							}
						}).on('fullscreened.ace.widget', function() {
							var $this = $(this);
							if($widgetContainer.hasClass('hidden-xs')) {
								$widgetContainer.removeClass('hidden-xs');
								$this.find("iframe:first-child").height($this.innerHeight()-32);
							}else {
								$widgetContainer.addClass('hidden-xs');
								$this.find("iframe:first-child").height('');
							}
							setTimeout(function() {
								var $this = $(this);
								if($widgetContainer.hasClass('hidden-xs')) {
									$widgetContainer.removeClass('hidden-xs');
									$this.find("iframe:first-child").height($this.innerHeight()-32);
								}else {
									$widgetContainer.addClass('hidden-xs');
									$this.find("iframe:first-child").height('');
								}
							},1);
						});
						var custom=$widgetContainer.data('custom');
						method.widgetSortable(custom);
					}
				});
			},
			 //登录用户首页定制组件
			getCustomByLoginUserObjectId:function(scope,objectId) {
	            $.ajax({
	                url:urls.getCustomByLoginUserObjectId,
	                dataType:'json',
	                type:'GET',
	                cache:false,
	                data:{
	                	flag:'opt',
	                    scope:scope,
	                    objectId:objectId
	                },
	                success:function(data){
	                    var $customInfo=$('.custom-info-row');
	                    if(data!=null){
                            $('#custom-info-form').data('custom', data);
	                        $customInfo.removeClass('hidden');
	                        $('.layoutArea-row').removeClass('hidden');
	                        $('.desc-textarea').val(data.description);
	                        var data_scope=data.scope;
	                        if($('.radio-'+data_scope)[0]!=undefined){
	                        	$('input [name="scope"]').removeAttr("checked");
	                        	$('.radio-'+data_scope).val([data_scope]);
	            			}
	                        $('#customId').val(data.id);
	                        if(data_scope!='public'){
	                            var name="INPUT_"+data_scope.toUpperCase();
	                            $("input[name*='INPUT_']").val('');
	                            $('#input-'+data_scope).removeClass('hidden');
	                            if(data_scope == 'role'){
                                    $('input[name="INPUT_ROLE"]').val(data.objectId);
	                            } else{
	                                var object=data.objectId.split("-");
	                                $('input[name=' + name + ']').val(object[0]);
	                                $('input[name=T_' + name + '_ID]').val(object[0]);
	                                $('input[name=T_' + name + ']').val(object[1]);
	                            }
	                        }
	                        horizon.widgetapp.getSelectLayout();
	                    }else{
	                        $('.prompt-span').addClass('hidden').removeClass('hidden');
	                        $('.custom-info-row').addClass('hidden');
	                        $('.layoutArea-row').addClass('hidden');
	                    }
	                }
	            });
	        },
			//首页定制可拖动
			widgetSortable: function() {
				$('.widget-container-area-col').sortable({
					connectWith: '.widget-container-area-col',
					items:'> .widget-box',
					handle: ace.vars['touch'] ? '.widget-header' : false,
					cancel: '.fullscreen',
					opacity:0.8,
					revert:true,
					forceHelperSize:true,
					placeholder: 'widget-placeholder',
					forcePlaceholderSize:true,
					tolerance:'pointer',
					start: function(event, ui) {
						ui.placeholder.css({'min-height':ui.item.height()});
						//组件开始拖动时触发，给每个iframe加上遮罩层
						$widgetContainer.find('iframe').each(function() {
							$("<div class='ui-sortable-iframeFix'></div>").css({
								position: 'absolute',
								top:'0px',
								bottom: '0px',
								filter: 'alpha(opacity:1)',
								'-mozOpacity': '0.001',
								opacity: '0.001',
								backgroundColor: 'white',
								zIndex: '1001',
								width: '100%',
								height: '100%'
							}).appendTo($(this).parent());
						});
					},
					update: function(event, ui) {
						if(sortableUpdateNum==0){
							sortableUpdateNum++;
						}else{
							return ;
						}
						ui.item.css('zIndex','');
						this.sortableUpdate();
					},
					stop:function(event,ui) {//组件拖动结束后触发，去除所有的遮罩层
						$('div.ui-sortable-iframeFix').remove();
					}
				});
			},
			//拖动结束后保存个人定制信息
			sortableUpdate: function() {
				var custom=$widgetContainer.data('custom');
				var $areas=$('.widget-container-area-col');
				var _data = {
					areaCount: $areas.length,
					id:custom.id,
					scope:custom.scope,
					layoutId:custom.layoutId,
					description:custom.description,
					objectId:custom.objectId
				};
				$areas.each(function(i) {
					var $this=$(this);
					var layoutArea=$this.data('layoutArea');
					_data['area_id_' + i] = layoutArea.id;
					var widgetIdArr = [];
					$this.children('.widget-box').each(function(k){
						var $widget = $(this);
						var widgetId=$widget.attr('widget-id');
						widgetIdArr.push(widgetId);
						_data[layoutArea.id + '_' + widgetId + '_ORDER'] = k;
					});
					_data[layoutArea.id+'_WIDGET'] = widgetIdArr.join(';');
				});
				var $dialog = $('#dialog');
				var dialogOption = {
					width: 380,
					title: horizon.lang["message"]["title"],
					closeText:horizon.lang["base"]["close"],
					dialogTextType: 'alert-danger'
				};
				$.ajax({
					url: urls.savePersonCustom,
					data:_data,
					cache:false,
					dataType:'json',
					error:function() {
						dialogOption['dialogText'] = horizon.lang["message"]["error"];
						$dialog.removeClass('hidden').dialog(dialogOption);
					},
					success:function(data) {
						if(data!=null && data.result == true) {
							$widgetContainer.data('custom',data.custom);
							var $areas=$('.widget-container-area-col');
							if(data.custom == null) {
								$areas.data('layoutArea', null);
								return ;
							}
							$areas.each(function(i) {
								var $this=$(this);
								var layoutArea=$this.data('layoutArea');
								$.each(data.custom.customWidgets,function(i,customWidget) {
									var widget=customWidget.widget;
									if(layoutArea.id == customWidget.layoutAreaId){
										$this.find('.widget-box[widget-id="' + widget.id + '"]').data('customWidget',customWidget);
									}	
								});
							});

						}else if(data !=null && data.delresult == true) {
							$widgetContainer.removeData('custom');
						}else{
							dialogOption['dialogText'] = horizon.lang["platform-widget"]["changeFailed"];
							$dialog.removeClass('hidden').dialog(dialogOption);
						}
					}
				});
			},
	};
	var event = {
		//改变布局生成对应的区域
		changeLayout: function(){
			$("#layoutId").bind("change", function(){
				var $this=$(this);
			    var selectVal=$this.val();
			    if(selectVal==0){
			     	$('.layoutArea-row').addClass('hidden');
			       	$('.layoutArea-row').html('');
			    }else{
			       	$('.layoutArea-row').removeClass('hidden');
			       	horizon.widgetapp.layoutAreaSelectChange($this);
			    }
			});
		},
		checkButton:function(){
			$("#customSave").on(horizon.tools.clickEvent(),function(){
				method.savePersonCustom();
			});
		}
	};
	
	return horizon.manager['custom'] = {
		init : function() {
            init.initCustom();
			event.changeLayout();
			event.checkButton();
		}
	};
}));
