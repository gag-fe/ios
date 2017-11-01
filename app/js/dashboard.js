/**
 * 主页初始化及相关方法
 */

var ieType = navigator.appVersion.match(/Trident\/\d/);

$(document).ready(function(){
	//setDivHeight();
	layui.use(['layer'],function(){
		var layer = layui.layer;
	});
	initMainHtml();//初始化首页内容
	
});

function setDivHeight(){
	var windowWidth = window.innerWidth == undefined ? $(window).width() : window.innerWidth;
	//if(ieType == "Trident/7" || ieType == "Trident/6")
	//	windowWidth -= 0;
	//else 
	if(ieType == "Trident/4")
		windowWidth += 16;
	
	$("#div1").width(windowWidth );
	$("#div2").width(windowWidth + 16);
	$("#div1").height($(window).height());
	$("#div2").height($(window).height());
}
//初始化首页内容
function initMainHtml(){
	Flot();
	Doughnut();
	daterangepicker();
	gauge();
	tasks();
	$(".trace").click(graphTrace);
}

function Flot(){
	var data1 = [
	  [gd(2012, 1, 1), 17],
	  [gd(2012, 1, 2), 74],
	  [gd(2012, 1, 3), 6],
	  [gd(2012, 1, 4), 39],
	  [gd(2012, 1, 5), 20],
	  [gd(2012, 1, 6), 85],
	  [gd(2012, 1, 7), 7]
	];

	var data2 = [
	  [gd(2012, 1, 1), 82],
	  [gd(2012, 1, 2), 23],
	  [gd(2012, 1, 3), 66],
	  [gd(2012, 1, 4), 9],
	  [gd(2012, 1, 5), 119],
	  [gd(2012, 1, 6), 6],
	  [gd(2012, 1, 7), 9]
	];
	$("#canvas_dahs").length && $.plot($("#canvas_dahs"), [
	  data1, data2
	], {
	  series: {
		lines: {
		  show: false,
		  fill: true
		},
		splines: {
		  show: true,
		  tension: 0.4,
		  lineWidth: 1,
		  fill: 0.4
		},
		points: {
		  radius: 0,
		  show: true
		},
		shadowSize: 2
	  },
	  grid: {
		verticalLines: true,
		hoverable: true,
		clickable: true,
		tickColor: "#d5d5d5",
		borderWidth: 1,
		color: '#fff'
	  },
	  colors: ["rgba(38, 185, 154, 0.38)", "rgba(3, 88, 106, 0.38)"],
	  xaxis: {
		tickColor: "rgba(51, 51, 51, 0.06)",
		mode: "time",
		tickSize: [1, "day"],
		//tickLength: 10,
		axisLabel: "Date",
		axisLabelUseCanvas: true,
		axisLabelFontSizePixels: 12,
		axisLabelFontFamily: 'Verdana, Arial',
		axisLabelPadding: 10
	  },
	  yaxis: {
		ticks: 8,
		tickColor: "rgba(51, 51, 51, 0.06)",
	  },
	  tooltip: false
	});

	function gd(year, month, day) {
	  return new Date(year, month - 1, day).getTime();
	}
}

function Doughnut(){
	var options = {
	  legend: false,
	  responsive: false
	};
	new Chart(document.getElementById("canvas1"), {
	  type: 'doughnut',
	  tooltipFillColor: "rgba(51, 51, 51, 0.55)",
	  data: {
		labels: [
		  "Symbian",
		  "Blackberry",
		  "Other",
		  "Android",
		  "IOS"
		],
		datasets: [{
		  data: [10, 20, 30, 10, 30],
		  backgroundColor: [
			"#BDC3C7",
			"#9B59B6",
			"#E74C3C",
			"#26B99A",
			"#3498DB"
		  ],
		  hoverBackgroundColor: [
			"#CFD4D8",
			"#B370CF",
			"#E95E4F",
			"#36CAAB",
			"#49A9EA"
		  ]
		}]
	  },
	  options: options
	});
}

function daterangepicker(){
	var cb = function(start, end, label) {
	  console.log(start.toISOString(), end.toISOString(), label);
	  $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
	};

	var optionSet1 = {
	  startDate: moment().subtract(29, 'days'),
	  endDate: moment(),
	  minDate: '01/01/2012',
	  maxDate: '12/31/2015',
	  dateLimit: {
		days: 60
	  },
	  showDropdowns: true,
	  showWeekNumbers: true,
	  timePicker: false,
	  timePickerIncrement: 1,
	  timePicker12Hour: true,
	  ranges: {
		'Today': [moment(), moment()],
		'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
		'Last 7 Days': [moment().subtract(6, 'days'), moment()],
		'Last 30 Days': [moment().subtract(29, 'days'), moment()],
		'This Month': [moment().startOf('month'), moment().endOf('month')],
		'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
	  },
	  opens: 'left',
	  buttonClasses: ['btn btn-default'],
	  applyClass: 'btn-small btn-primary',
	  cancelClass: 'btn-small',
	  format: 'MM/DD/YYYY',
	  separator: ' to ',
	  locale: {
		applyLabel: 'Submit',
		cancelLabel: 'Clear',
		fromLabel: 'From',
		toLabel: 'To',
		customRangeLabel: 'Custom',
		daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
		monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		firstDay: 1
	  }
	};
	$('#reportrange span').html(moment().subtract(29, 'days').format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
	$('#reportrange').daterangepicker(optionSet1, cb);
	$('#reportrange').on('show.daterangepicker', function() {
	  console.log("show event fired");
	});
	$('#reportrange').on('hide.daterangepicker', function() {
	  console.log("hide event fired");
	});
	$('#reportrange').on('apply.daterangepicker', function(ev, picker) {
	  console.log("apply event fired, start/end dates are " + picker.startDate.format('MMMM D, YYYY') + " to " + picker.endDate.format('MMMM D, YYYY'));
	});
	$('#reportrange').on('cancel.daterangepicker', function(ev, picker) {
	  console.log("cancel event fired");
	});
	$('#options1').click(function() {
	  $('#reportrange').data('daterangepicker').setOptions(optionSet1, cb);
	});
	$('#options2').click(function() {
	  $('#reportrange').data('daterangepicker').setOptions(optionSet2, cb);
	});
	$('#destroy').click(function() {
	  $('#reportrange').data('daterangepicker').remove();
	});
}

function gauge(){
	var opts = {
	  lines: 12,
	  angle: 0,
	  lineWidth: 0.4,
	  pointer: {
		  length: 0.75,
		  strokeWidth: 0.042,
		  color: '#1D212A'
	  },
	  limitMax: 'false',
	  colorStart: '#1ABC9C',
	  colorStop: '#1ABC9C',
	  strokeColor: '#F0F3F3',
	  generateGradient: true
  };
  var target = document.getElementById('foo'),
	  gauge = new Gauge(target).setOptions(opts);

  gauge.maxValue = 6000;
  gauge.animationSpeed = 32;
  gauge.set(3200);
  gauge.setTextField(document.getElementById("gauge-text"));
}

function tasks(){
	/*$.ajax({
		url:"http://192.168.5.139:8090/VATServer/gzlgl/task/todoList.action",
		type:"post",
		async:false,
		dataType:'json',
		data:{},
		success:function(o, pio, data){
			
			var ct ='';
			if (data.length == 0) {
				ct="无待办任务！";
            }
			$.each(o, function() {
				ct += "<li>" + this.pdname + "->PID:" + this.pid + "-><span class='ui-state-highlight ui-corner-all'>" + this.name + "</span>";
				ct += "<span class='version' title='流程定义版本：" + this.pdversion + "'><b>V:</b>" + this.pdversion + "</span>";
				ct += "<a class='trace' href='#' pid='" + this.pid + "' title='点击查看流程图'>跟踪</a>";
				ct += "<span class='status' title='任务状态'>" + (this.status == 'claim' ? '未签收' : '') + "</span>";
				ct += "</li>";
			});
			$("ol").html(ct);
		}
	})*/
}
