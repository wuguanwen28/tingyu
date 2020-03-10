$(function() {

	//获取用户定位
	class Weather {

		//构造器，创建实例时自动调用
		constructor() {

			this.days = ['日', '一', '二', '三', '四', '五', '六'];

			this.textdata = textdata;
			
			this.key = '13c1b867b2f34eaabb4736f2265b10d4';
			
			this.baseUrl = 'https://api.heweather.net/s6/weather/';

		};

		//腾讯地图IP定位
		getCity() {

			let self = this;

			$.ajax({
				type: 'get',
				url: 'https://apis.map.qq.com/ws/location/v1/ip',
				data: {
					key: 'GTCBZ-EYRYS-L7GOQ-6JO5T-HAIVV-KRF3T',
					output: 'jsonp'
				},

				dataType: 'jsonp',

				success: function(data) {
					
					let nowCity;
					
					if (data.message.slice(-2) == 'ok'){
						console.log('定位成功')
						nowCity = data.result.ad_info.district;
					}else {
						console.log('定位失败，默认为广州')
						nowCity = '广州';
					}

					$('.now-city').text(nowCity)

					self.getNow(nowCity);

					self.getHourly(nowCity);

					self.getDaily(nowCity);
				}
				
			})

		};

		//获取实况天气
		getNow(city) {

			var self = this;

			$.ajax({
				type: 'get',
				url: this.baseUrl + 'now',
				data: {
					location: city,
					key: this.key
				},
				success: function(result) {

//					console.log(result)

					//如果不存在城市
					if(result.HeWeather6[0].status !== 'ok') {
						alert('找不到' + city + '的天气');
						return;
					}

					let now = result.HeWeather6[0].now;

					$.each(self.textdata, function(i, v) {
						if(now.cond_txt.indexOf(v.title) > -1) {
							$('.now-title').text(v.text);
						}
					});

					$('.now-temperature').text(now.tmp).append($('<span>°</span>'));

					$('.now-weather>span:first-child').text(now.cond_txt);
					
					$('.now-city').text(result.HeWeather6[0].basic.location + '市')

					$('.windDirection>div:first-child').text(now.wind_sc + '级');

					$('.windDirection>div:last-child').text(now.wind_dir);

					$('.visibility>div:first-child').text(now.vis + 'km');

					$('.humidity>div:first-child').text(now.hum + '%')

				}
			})

		}

		//获取每小时天气
		getHourly(city) {

			var self = this;

			$.ajax({
				type: 'get',
				url: this.baseUrl + 'hourly',
				data: {
					location: city,
					key: this.key
				},
				success: function(res) {

					//如果不存在城市
					if(res.HeWeather6[0].status !== 'ok') {
						console.log('没有' + city + '的天气');
						return;
					}

					//清空24小时天气的li
					$('.hourList').empty();

					var hourly = res.HeWeather6[0].hourly.slice(0, 24);
					
//					console.log(hourly);

					var hourArr = [];

					for(var i = 0; i < hourly.length; i++) {

						let wind = hourly[i].wind_dir
						wind = wind == '无持续风向' ? '无风' : wind;

						var $li = $(`<li>
									<div>${hourly[i].time.slice(-5)}</div>
									<div>${hourly[i].cond_txt}</div>		
									<div>
										<div class="icon">
											<img src="img/icon/${hourly[i].cond_code}.png" class="img-auto" />
										</div>
									</div>
									<div>${wind}</div>
								</li>`);

						$('.hourList').append($li);

						hourArr.push(hourly[i].tmp);

					}

					self.drawcanvas('hourlyCanvas', hourArr);

				}
			})

		}

		//获取每天天气
		getDaily(city) {

			var self = this;

			$.ajax({
				type: 'get',
				url: this.baseUrl + 'forecast',
				data: {
					location: city,
					key: this.key
				},
				success: function(r) {

					//如果不存在城市
					if(r.HeWeather6[0].status !== 'ok') {
						console.log('没有' + city + '的天气');
						return;
					}

					//清空未来9天天气的li
					$('.dailyList').empty();

					var rd = r.HeWeather6[0].daily_forecast;

					$('.now-weather>span:last-child').text(rd[0].tmp_min + '°~' + rd[0].tmp_max + '°');

					let maxtmp = [];
					let mintmp = [];

					//未来9天天气
					for(var i = 1; i < rd.length; i++) {

						let wind = rd[i].wind_dir
						wind = wind == '无持续风向' ? '无风' : wind;

						maxtmp.push(rd[i].tmp_max);
						mintmp.push(rd[i].tmp_min);

						var $li = $(`<li>
									<div>周${self.days[new Date(rd[i].date).getDay()]}</div>
									<div>${rd[i].date.slice(-5)}</div>
									<div>${rd[i].cond_txt_d}</div>
									<div>
										<div class="icon">
											<img src="img/icon/${rd[i].cond_code_d}.png" class="img-auto" />
										</div>
									</div>
									<div>${wind}</div>
								</li>`);

						$('.dailyList').append($li);
					}

					self.drawcanvas('dailyCanvas', maxtmp, mintmp);

				}
			})

		}

		//切换小时和天数
		change() {

			$('.change>div').on('click', function() {

				if($(this).hasClass('active')) {
					return;
				}

				$(this).addClass('active').siblings().removeClass('active');

				if($(this).hasClass('daily')) {
					$('.dailyList').show();
					$('#dailyCanvas').show();
					$('.hourList').hide();
					$('#hourlyCanvas').hide()
				} else {
					$('.hourList').show()
					$('.dailyList').hide();
					$('#dailyCanvas').hide();
					$('#hourlyCanvas').show()
				}

			})

		}

		//搜索城市
		searchCity() {

			var self = this
			
			function search(){
				
				var city = $('.search-text').val().trim();

				if(city == '') {
					alert('请输入城市');
					return;
				}

				self.getNow(city);

				self.getHourly(city);

				self.getDaily(city);

				$('.search-text').val('');
				
			}

			$('.search-icon').on('click', function() {

				search();

			})

			//回车发送消息
			$('.search-text').on('keydown',function(e) {
				
				if(e.keyCode === 13) {
					
					search();			
					e.preventDefault();
					//失去焦点
					this.blur();
				}

			})

		}

		//绘画温度曲线
		drawcanvas(canvadId, maxArr, minArr) {

			var max_tmp = Math.max.apply(Math, maxArr);

			var min_tmp;

			if(minArr == undefined) {
				min_tmp = Math.min.apply(Math, maxArr);
			} else {
				min_tmp = Math.min.apply(Math, minArr);
			}

			let ratio = 100 / (max_tmp - min_tmp + 2);

			let istop = (max_tmp - min_tmp) / 2;

			function position(num) {
				return(max_tmp - num + 1) * ratio;
			}

			var canvas = document.getElementById(canvadId)
			var c = canvas.getContext("2d");

			//清除canvas图形
			c.clearRect(0, 0, canvas.width, canvas.height);

			//绘制最高温度线条
			c.beginPath();
			c.strokeStyle = "#ff0000";
			c.lineWidth = 1;
			c.moveTo(25, position(maxArr[0]));
			for(var i = 1; i < maxArr.length; i++) {
				c.lineTo(25 + 50 * i, position(maxArr[i]));
			}
			c.stroke();
			c.closePath();

			//绘制最高温度圆点
			c.beginPath();
			c.fillStyle = "#FFFFFF";
			c.beginPath();
			for(var i = 0; i < maxArr.length; i++) {
				c.moveTo(25 + 50 * i, position(maxArr[i]));
				c.arc(25 + 50 * i, position(maxArr[i]), 3, 0, Math.PI * 2);
			}
			c.fill();
			c.closePath();

			//绘制最高温度文字
			c.beginPath();
			c.fillStyle = "#ffffff";
			c.font = "14px 微软雅黑";
			c.textAlign = "center";
			for(var i = 0; i < maxArr.length; i++) {

				let num = max_tmp - maxArr[i] <= 3 ? 20 : -10;

				c.fillText(maxArr[i] + '°', 25 + 50 * i, position(maxArr[i]) + num);
			}
			c.closePath();

			if(minArr != undefined) {
				//绘制最低温度线条
				c.beginPath();
				c.strokeStyle = "#00ff00";
				c.lineWidth = 1;
				c.moveTo(25, position(minArr[0]));
				for(var i = 1; i < minArr.length; i++) {
					c.lineTo(25 + 50 * i, position(minArr[i]));
				}
				c.stroke();
				c.closePath();

				//绘制最低温度圆点
				c.beginPath();
				c.fillStyle = "#FFFFFF";
				c.beginPath();
				for(var i = 0; i < minArr.length; i++) {
					c.moveTo(25 + 50 * i, position(minArr[i]));
					c.arc(25 + 50 * i, position(minArr[i]), 3, 0, Math.PI * 2);
				}
				c.fill();
				c.closePath();

				//绘制最低温度文字
				c.beginPath();
				c.fillStyle = "#ffffff";
				c.font = "14px 微软雅黑";
				c.textAlign = "center";
				for(var i = 0; i < minArr.length; i++) {

					let num = minArr[i] - min_tmp <= 3 ? -10 : 20;

					c.fillText(minArr[i] + '°', 25 + 50 * i, position(minArr[i]) + num);
				}
				c.closePath();
			}

		}

		init() {

			this.getCity();

			this.change();

			this.searchCity();

		}

	}

	var newClass = new Weather();

	newClass.init();

})