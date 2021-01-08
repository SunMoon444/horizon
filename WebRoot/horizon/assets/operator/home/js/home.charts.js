/**
 * 
 * @pengys 2017-8-18
 * 主页 相关图表的js数据处理
 */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		var scripts = [ 'jquery', 'echarts'];
		define(scripts, factory);
	} else {
		factory(jQuery, echarts);
	}
}(function($, echarts) {
	"use strict";
	var flowStatusChart = null;
	var userConsumeTimeChart = null;
	var completionRateChart = null;
	function singleCount() {
		$.ajax({
			url:horizon.paths.apppath+'/horizon/operator/single/count.wf',
			dataType: 'json',
			cache: false,
			error: function() {
				horizon.notice.error(horizon.lang.message['operateError']);
			},
			success: function(data) {
				if (data){
					flowStatusMonitor.initFlowStatusEcharts(data.flowStatus);
					userConsumeTimeMonitor.initUserConsumeTime(data.userConsume);
					completionRateMonitor.initCompletionRate(data.completeRate);
				}
			}
		});
	}
	// 容器的大小
	var containerSize = {
		height: function() {
			//可视区高度
			var maxH = $('.page-content-area').outerHeight(true);
			//内容区高度
			var _height = horizon.tools.getPageContentHeight();
			var $hCon = 0;
			var minH = 650;
			if(_height > maxH){
				$hCon = maxH;	
			} else if(_height < minH){
				$hCon = minH;
			} else{
				$hCon = _height;
			}
			return $hCon;
		},
		width: function() {
			return $('.page-content-area').outerWidth(true);
		},
		picHeight: function() {
			return this.height() * 0.35;
		}
	};
	/**
	 * 流程状态
	 */
	var flowStatusMonitor = {
		//初始化流程状态函数
		initFlowStatusEcharts: function(data) {
			var $flowStatus = $('#flow-status');
			if(!$flowStatus) return false;
			flowStatusChart = echarts.init($flowStatus[0]);
            $flowStatus.css('zIndex', '99');
			if(data.length == 0) {
				flowStatusChart.setOption({
					title: {
						text:horizon.lang["message"]["noData"],
						textStyle: {
							fontFamily: 'Microsoft YaHei',
							fontSize: 14,
							fontWeight: 'normal',
							color: '#666'
						},
						left: 'center',
						top: 'middle'
					}
				});
				return;
			}
			var name = [];
			var itemStyle = function(){
				var obj = {};
				obj[horizon.lang.flowstatus['normal']] = { normal:{color:'#ABD4A5'} };
				obj[horizon.lang.flowstatus['extended']] = { normal:{color:'#d87c7c'} };
				obj[horizon.lang.flowstatus['pause']] = { normal:{color:'#ABDFE5'} };
				obj[horizon.lang.flowstatus['warn']] = { normal:{color:'#F3DD99'} };
				obj[horizon.lang.flowstatus['exception']] = { normal:{color:'#aaaaaa'} };
				obj[horizon.lang.flowstatus['revoke']] = { normal:{color:'#F5D5B8'} };
				return obj;
			}();
			$.each(data, function(key,value) {
				name.push(value.name);
				value['itemStyle'] = itemStyle[value.name];
			});
			var optionFlowStatus = {
				tooltip : {
					trigger: 'item',
					formatter: "{a} <br/>{b} : {c} ({d}%)"
				},
				grid: {
					left: '6%',
					right: '6%',
					top: '15%',
					bottom: '0%',
					containLabel: true
				},
				series : [
					{
						name:horizon.lang["platform-home"]["instanceStatus"],
						type: 'pie',
						radius : '75%',
						center: ['50%', '50%'],
						roseType: 'angle',
                        data:data,
						itemStyle: {
							emphasis: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							},
							normal : {
								labelLine : { length:2, length2:5 }
							}
						}
					}
				]
			};
			if (optionFlowStatus && typeof optionFlowStatus === 'object') {
				flowStatusChart.setOption(optionFlowStatus, true);
			}
			//添加流程状态图的点击事件
			flowStatusChart.on(horizon.tools.clickEvent(), function(param) {
				$('body').data('flowStatus', param.name);
			});
		}
	};
	/**
	 * 个人每周耗费时间
	 */
	var userConsumeTimeMonitor = {
		//初始化该图表的函数
		initUserConsumeTime:function(data){
			var $userConsumeTime = $('#user-consume-time');
			if(!$userConsumeTime) return false;
			userConsumeTimeChart = echarts.init($userConsumeTime[0]);
            $userConsumeTime.css('zIndex', '99');
			if(data.length == 0) {
				userConsumeTimeChart.setOption({
					title: {
						text:horizon.lang["message"]["noData"],
						textStyle: {
							fontFamily: 'Microsoft YaHei',
							fontSize: 14,
							fontWeight: 'normal',
							color: '#666'
						},
						left: 'center',
						top: 'middle'
					}
				});
				return;
			}
			var seriesData =[];
			var countHours = 0;
			//--填充横,纵坐标数据
			for(var i=0;i<data.length;i++){
				var item = data[i];
				seriesData.push(parseInt(item.cosumingCountHours));
				//对每周总的耗时进行累加
				countHours = parseInt(item.cosumingCountHours)+countHours;
			}
			//个人一周总的耗时时间
			$('#consumeWeek').append('&nbsp;&nbsp;<span class="badge badge-primary radius-2 no-padding-top no-padding-bottom">'+countHours+' h</span>');
			var optionUserConsume = {
				tooltip: {
					trigger: 'axis'
				},
				grid: {
					left: '6%',
					right: '6%',
					top: '15%',
					bottom: '0%',
					containLabel: true
				},
				legend: {
					x:'left',
					data:[]
				},
				xAxis: {
					type: 'category',
					boundaryGap: false,
					axisLine:{
	                    lineStyle:{
	                    	color:'#CCCCCC'
	                    }
	                },
	                axisLabel:{
	                    textStyle:{
	                    	color:'#000000'
	                    }
	                },
	                data: [horizon.lang["platform-home"]["monday"],
	                       horizon.lang["platform-home"]["Tuesday"],
	                       horizon.lang["platform-home"]["Wednesday"],
	                       horizon.lang["platform-home"]["Thursday"],
	                       horizon.lang["platform-home"]["Friday"],
	                       horizon.lang["platform-home"]["Saturday"],
	                       horizon.lang["platform-home"]["Sunday"]]
				},
				yAxis:{
					 name:horizon.lang["platform-home"]["hour"],
					 type: 'value',
	                 splitLine:{
	                     show:true,
	                     lineStyle: {
	                         color: ['#f3f5f9'],
	                         type:'solid'
	                     }
	                 },
	                 axisLine:{
	                 	lineStyle:{
	                 		color:'#CCCCCC'
	                 	}
	                 },
	                 axisLabel:{
	                 	textStyle:{
	                 		color:'#000000'
	                 	}
	                 }
				},
				series: [
					{
						name:horizon.lang["platform-home"]["consume"],
	                    type:'line',
	                    data: seriesData,
	                    label: {normal: {show: true, textStyle:{color : '#EEC591'}}}
	                 }
				]
			};
			//参数绑定
			if (optionUserConsume && typeof optionUserConsume === 'object') {
				userConsumeTimeChart.setOption(optionUserConsume);
			}
		}
	};
	/**
	 * 个人完成率
	 */
	var completionRateMonitor = {
		//初始化该图表的函数
		initCompletionRate:function(data){
			var $completionRate = $('#completion-rate');
			if(!$completionRate) return false;
			completionRateChart = echarts.init($completionRate[0]);
            $completionRate.css('zIndex', '99');
			if(data == null ) {
				completionRateChart.setOption({
					title: {
						text:horizon.lang["message"]["noData"],
						textStyle: {
							fontFamily: 'Microsoft YaHei',
							fontSize: 14,
							fontWeight: 'normal',
							color: '#666'
						},
						left: 'center',
						top: 'middle'
					}
				});
				return;
			}
			var optionCompletionRate = {
				tooltip : {
					formatter: "{a} <br/>{b} : {c}%"
				},
				grid: {
					left: '6%',
					right: '6%',
					top: '15%',
					bottom: '0%',
					containLabel: true
				},
				toolbox: {
					show : true,
					feature : {
						mark : {show: true},
					}
				},
				series: [
					{
						name: horizon.lang["platform-home"]["completionRate"],
						type: 'gauge',
						radius: '95%',
						data: [{value: data, name: horizon.lang["platform-home"]["completionRate"]}],//为仪表盘填充数据
						detail: {
							formatter:'{value}%',
							textStyle: {
								color: '#000',//此处有个bug,如果颜色不设置或者只是设置成'auto',指示百分比是显示不出来的
								fontSize: 25
							}
						},
						axisLine: {            // 坐标轴线
							lineStyle: {
								color: [[0.2, '#F43932'],[0.8, '#2770BB'],[1, '#38E183']], // 属性lineStyle控制线条样式
								width: 4
							}
						},
						axisTick: {show:true},
						axisLabel: {
							show: true,
							textStyle: {
								color: '#000',//此处有个bug,如果颜色不设置或者只是设置成'auto',刻度盘上的刻度值是显示不出来的
								fontSize: 12
							}
						},
						splitLine: {
							length: 12,
							lineStyle: {
								color: 'auto'
							}
						},
						//指针
						pointer: {
							color: 'auto',
							shadowColor : '#000', //默认透明
							shadowBlur: 5
						}
					}
				]
			};
			if (optionCompletionRate && typeof optionCompletionRate === 'object') {
				completionRateChart.setOption(optionCompletionRate,true);
				$("#singleRate").html(data+'%');
			}
		}
	};
	var allMonitorInit = {
	        init: function() {
	        	var $flowStatus = $('#flow-status');
	        	var $userConsumeTime = $('#user-consume-time');
	        	var $completionRate = $('#completion-rate');
	            //初始化流程状态图
	            $flowStatus.css({
	                'width': '100%',
	                'height': containerSize.picHeight()+15
	            });
	            //浏览器处理
	          //初始化个人耗费时间状态折线图
	            $userConsumeTime.css({
	            	'width': '100%',
	                'height': containerSize.picHeight()
	            });
	            //初始化个人完成率
	            $completionRate.css({
            		'width': '100%',
            		'height': containerSize.picHeight()
            	});
	           $(window).on('resize', function() {
	        	   allMonitorInit.resize();
	           })
	        },
	        resize: function() {
	        	var $flowStatus = $('#flow-status');
	        	var $userConsumeTime = $('#user-consume-time');
	        	var $completionRate = $('#completion-rate');
	            if($('body').hasClass('embed') && $(window).width() < 768) {
	                $('.hid-left').removeClass('hidden');
	                $('.hid-right').addClass('hidden');
	            }else if($('body').hasClass('embed') && $(window).width() >= 768){
	                $('.hid-right').removeClass('hidden');
	                $('.hid-left').addClass('hidden');
	            }
	            if(flowStatusChart != null) {
	            	$flowStatus.css({
		                'width': '100%',
		                'height': containerSize.picHeight()
		            });
	                flowStatusChart.resize();
	            }
	           if(userConsumeTimeChart != null) {
	        	   $userConsumeTime.css({
		            	'width': '100%',
		                'height': containerSize.picHeight()
		            });
	            	userConsumeTimeChart.resize();
	            }
	           if(completionRateChart != null) {
	        	   $completionRate.css({
	            		'width': '100%',
	            		'height': containerSize.picHeight()
	            	});
	            	completionRateChart.resize();
	            }
	        }
	    };
	return horizon.operator['homecharts'] = {
		init: function(){
			allMonitorInit.init()
			singleCount()
		}
	};
}));