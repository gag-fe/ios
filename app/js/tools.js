// JavaScript Document
// JS工具脚本

//div鼠标拖动对象 
var div_moveDrag = function(a, o, barWith, barHeight) {

	var d = document;
	if (!a)
		a = window.event;
	if (!a.pageX)
		a.pageX = a.clientX;
	if (!a.pageY)
		a.pageY = a.clientY;
	var x = a.pageX, y = a.pageY;

	if (x < parseInt(o.style.left) || x > parseInt(o.style.left) + barWith)
		return;
	if (y < parseInt(o.style.top) || y > parseInt(o.style.top) + barHeight)
		return;

	if (o.setCapture)
		o.setCapture();
	else if (window.captureEvents)
		window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
	var backData = {
		x : o.style.top,
		y : o.style.left
	};
	d.onmousemove = function(a) {

		if (!a)
			a = window.event;
		if (!a.pageX)
			a.pageX = a.clientX;
		if (!a.pageY)
			a.pageY = a.clientY;
		var tx = a.pageX - x + parseInt(o.style.left), ty = a.pageY - y
				+ parseInt(o.style.top);
		o.style.left = tx + "px";
		o.style.top = ty + "px";
		x = a.pageX;
		y = a.pageY;
	};
	d.onmouseup = function(a) {

		if (!a)
			a = window.event;
		if (o.releaseCapture)
			o.releaseCapture();
		else if (window.captureEvents)
			window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
		d.onmousemove = null;
		d.onmouseup = null;
		if (!a.pageX)
			a.pageX = a.clientX;
		if (!a.pageY)
			a.pageY = a.clientY;
		if (!document.body.pageWidth)
			document.body.pageWidth = document.body.clientWidth;
		if (!document.body.pageHeight)
			document.body.pageHeight = document.body.clientHeight;
		if (a.pageX < 1 || a.pageY < 1 || a.pageX > document.body.pageWidth
				|| a.pageY > document.body.pageHeight) {
			o.style.left = backData.y;
			o.style.top = backData.x;
		}
	};
}

// 字符串截取(按字节)
function substr_zj(str, len) {
	if (!str || !len) {
		return '';
	}
	// 预期计数：中文2字节，英文1字节
	var a = 0;
	// 循环计数
	var i = 0;
	// 临时字串
	var temp = '';
	for (i = 0; i < str.length; i++) {
		if (str.charCodeAt(i) > 255) {
			// 按照预期计数增加2
			a += 2;
		} else {
			a++;
		}
		// 如果增加计数后长度大于限定长度，就直接返回临时字符串
		if (a > len) {
			return temp + "...";
		}
		// 将当前内容加到临时字符串
		temp += str.charAt(i);
	}
	// 如果全部是单字节字符，就直接返回源字符串
	return str;
}

/**
 * 在选定行下面添加一行（可多次添加） addRowData(rowid,data,position,srcrowid) rowid ：新行的id号；
 * data ：新行的数据对象，形式为{name1:value1,name2: value2…}，其中name为colModel中定义的列名称name；
 * position ：插入的位置（first：表格顶端；last：表格底端；before：srcrowid之前；after：srcrowid之后）；
 * srcrowid ：新行将插入到srcrowid指定行的前面或后面。 table: jqgrid表id
 */
function addRow(table)
{ 
	var list = $("#"+table.id);  
	var ids = list.jqGrid('getDataIDs');
	// 获得当前最大行号（数据编号）并+1
	var rowid = Math.max.apply(Math,ids)+1;
	if(rowid=="-Infinity")// 如果表格为空，行号从1开始添加
    {
		rowid=1;
    }
	for(var i=0;i<ids.length;i++)// 保存其他行数据（防止同时编辑几行数据）
    {
    	list.jqGrid('saveRow',ids[i]);
    }
	// 获取表格的初始model
    var colModel = list.jqGrid().getGridParam("colModel") ;    
    var newRow = JSON.stringify(colModel);  
    
    list.addRowData(rowid, newRow, "last"); 	// 增加行（新增行号：rowid，插入selectid行后面）
//    list.addRowData(rowid,opendata[0],"after", rowid-1);//opendata[]是预输入数据
	list.setSelection(rowid); // 设置行被选中
	list.jqGrid('editRow',rowid,true);// 编辑状态
}
/**
 * 根据行号删除一行 rowid: 所选行id table: jqgrid表id
 */
function delRow(rowid,table)
{
	var list = $('#'+table.id); 
	list.delRowData(rowid);// 删除行rowid
	
	var ids = list.jqGrid('getDataIDs');
	var rowid = Math.max.apply(Math,ids);// 获得当前最大行号（数据编号）
	if(rowid=="-Infinity")// 如果表格为空，则自动添加一行（删空表格的情况下调用）
    {
		addRow(table);// 调用添加方法
    }
}

/**
 * 对金额整数部分进行千分号换算
 * @param num
 * @return
 */
function formatMoney(money)
{
	var r1=money.toString().split(".")[1];//小数部分
	var r2=money.toString().split(".")[0];//整数部分
	var len = r2.length; //获取整数部分的长度
	var str2 = '';
	var max = Math.floor((len-1) / 3); //定义循环次数，比如3位以下不循环，4-6位循环一次，7-9位循环两次……
	for(var i = 0 ; i < max ; i++)
	{ 
		var s = r2.slice(len - 3, len); 
		r2 = r2.substr(0, len - 3); 
		str2 = (',' + s) + str2; 
		len = r2.length; //获取剩余的长度，方便循环取值
	} 
	r2+=str2+"."+r1; 
	return r2 
} 

/** 
 * 将数字转换成大写人民币
 * */ 
function cmycurd(num)
{  
  var str1 = '零壹贰叁肆伍陆柒捌玖';  // 0-9所对应的汉字
  var str2 = '万仟佰拾亿仟佰拾万仟佰拾元角分'; // 数字位所对应的汉字
  var str3;    // 从原num值中取出的值
  var str4;    // 数字的字符串形式
  var str5 = '';  // 人民币大写金额形式
  var i;    // 循环变量
  var j;    // num的值乘以100的字符串长度
  var ch1;    // 数字的汉语读法
  var ch2;    // 数字位的汉字读法
  var nzero = 0;  // 用来计算连续的零值是几个
  
  num = Math.abs(num).toFixed(2);  // 将num取绝对值并四舍五入取2位小数
  str4 = (num * 100).toFixed(0).toString();  // 将num乘100并转换成字符串形式
  j = str4.length;      // 找出最高位
  if (j > 15){return '溢出';} 
  str2 = str2.substr(15-j);    // 取出对应位数的str2的值。如：200.55,j为5所以str2=佰拾元角分
  
  // 循环取出每一位需要转换的值
  for(i=0;i<j;i++)
  { 
    str3 = str4.substr(i,1);   // 取出需转换的某一位的值
    if (i != (j-3) && i != (j-7) && i != (j-11) && i != (j-15))
    {    // 当所取位数不为元、万、亿、万亿上的数字时
    	if (str3 == '0')
    	{ 
		  ch1 = ''; 
		  ch2 = ''; 
		  nzero = nzero + 1; 
		} 
    else
    { 
     if(str3 != '0' && nzero != 0)
     { 
       ch1 = '零' + str1.substr(str3*1,1); 
       ch2 = str2.substr(i,1); 
       nzero = 0; 
     } 
     else{ 
    	 ch1 = str1.substr(str3*1,1); 
          ch2 = str2.substr(i,1); 
          nzero = 0; 
        } 
    } 
} 
else{ // 该位是万亿，亿，万，元位等关键位
      if (str3 != '0' && nzero != 0)
      { 
        ch1 = "零" + str1.substr(str3*1,1); 
        ch2 = str2.substr(i,1); 
        nzero = 0; 
      } 
      else{ 
		    if (str3 != '0' && nzero == 0){ 
		          ch1 = str1.substr(str3*1,1); 
		          ch2 = str2.substr(i,1); 
		          nzero = 0; 
		  } 
        else{ 
	    if (str3 == '0' && nzero >= 3){ 
	            ch1 = ''; 
	            ch2 = ''; 
	            nzero = nzero + 1; 
	       } 
       else{ 
      if (j >= 11){ 
              ch1 = ''; 
              nzero = nzero + 1; 
   } 
	   else{ 
	     ch1 = ''; 
	     ch2 = str2.substr(i,1); 
	     nzero = nzero + 1; 
	  	} 
    } 
  } 
 } 
} 
    if (i == (j-11) || i == (j-3)){  // 如果该位是亿位或元位，则必须写上
        ch2 = str2.substr(i,1); 
    } 
    str5 = str5 + ch1 + ch2; 
    
    if (i == j-1 && str3 == '0' ){   // 最后一位（分）为0时，加上“整”
      str5 = str5 + '整'; 
    } 
  } 
  if (num == 0){ 
    str5 = '零元整'; 
  } 
  return str5; 
}

/**
 * 日期格式化
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
 * 例子： 
 * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2015-11-25 10:09:04.423 
 * (new Date()).Format("yyyy-MM-dd") ==> 2015-11-25
 */
Date.prototype.Format = function (fmt) 
{
	 var o = 
	 {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
     };
    if (/(y+)/.test(fmt))
    {
    	fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o)
    {
    	if (new RegExp("(" + k + ")").test(fmt)) 
    	{
    		fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;      
}

/**
 * 判断闰年  
 * 用法：
 * var now=new Date();
 * var flag=now.isLeapYear();
 */
Date.prototype.isLeapYear = function()   
{   
  return (0==this.getYear()%4&&((this.getYear()%100!=0)||(this.getYear()%400==0)));  
}   

/**
 * 增加天数
 * 用法：
 * var now=new Date();
 * var newDate=now.DateAdd(now,3);
 */
Date.prototype.DateAdd = function(date,Number) 
{   
 	return new Date(date.valueOf() + (86400000 * Number));  
}

/**
 * 比较日期差 dtEnd 格式为日期型或者有效日期格式字符串  
 * 返回相差的天数
 */
Date.prototype.DateDiff = function(dtStart,dtEnd) 
{  
 if (typeof dtStart == 'string' )//如果是字符串转换为日期型  
  {   
	 dtStart = StringToDate(dtStart);  
  } 
 else
 {
	 dtStart = StringToDate(dtStart.Format("yyyy-MM-dd"));  
 }
  if (typeof dtEnd == 'string' )//如果是字符串转换为日期型  
  {   
      dtEnd = StringToDate(dtEnd);  
  } 
  else
  {
	  dtEnd = StringToDate(dtEnd.Format("yyyy-MM-dd"));
  } 
  return parseInt((dtEnd - dtStart) / 86400000);  
}  

/**
 * 字符串转成日期类型   
 * 格式 MM/dd/YYYY MM-dd-YYYY YYYY/MM/dd YYYY-MM-dd  
 */ 
function StringToDate(DateStr)  
{   
  var converted = Date.parse(DateStr);  
  var myDate = new Date(converted);  
  if (isNaN(myDate))  
  {   
      var arys= DateStr.split('-');  
      myDate = new Date(arys[0],--arys[1],arys[2]);  
  }  
  return myDate;  
} 

/**
 * ACE jQgrid底部栏图标
 * 使用方法：
	setTimeout(function()
	{
		updatePagerIcons($("#gridtable"));//加载底部栏图标
	}, 0);
 */
function updatePagerIcons(table)
{
	var replacement = 
	{
		'ui-icon-seek-first' : 'ace-icon fa fa-angle-double-left bigger-140',
		'ui-icon-seek-prev' : 'ace-icon fa fa-angle-left bigger-140',
		'ui-icon-seek-next' : 'ace-icon fa fa-angle-right bigger-140',
		'ui-icon-seek-end' : 'ace-icon fa fa-angle-double-right bigger-140'
	};
	$('.ui-pg-table:not(.navtable) > tbody > tr > .ui-pg-button > .ui-icon').each(function(){
		var icon = $(this);
		var $class = $.trim(icon.attr('class').replace('ui-icon', ''));
		
		if($class in replacement) icon.attr('class', 'ui-icon '+replacement[$class]);
	})
}

/**
 * 字符判空方法
 * 
 */ 
function isnotEmpty(Str)  
{   
	if(Str==undefined || Str==null || Str.replace(/(^\s*)|(\s*$)/g, "")==""){
		return false;
	}else{
		return true;
	}
} 


/**
 * 输入框自动带出功能插件（特殊模糊匹配可在各自js文件中实现）
 * @param input 输入框ID
 * @param key 对应数据库中表的字段名称
 * @param sql 对应xml文件中的sql名字（特殊多层级sql可自定义），单层sql单查询条件可采用统一模板queryNsrsbhByMh
 * @param table 需要查询数据库表的名称
 */
function addAc(input,key,sql,table){
	$("#"+input).autocomplete({
		source:function(request,response){
			$.post("../../user/acfield.action",
				{
					top:10,
					key:key,
					sql:sql,
					table:table,
					field:request.term
				},
				function(data){
					response($.map(data,function(item){
						return {
							label:item.acfield,
							value:item.acfield
						}
					}));
				},"json");
		},
		select:function(event,ui){},
		minLength:1,
		autoFocus:false,
		delay:100
	});
}

/**
 * 字符判断是否为半角方法
 * 
 */ 
function isBj(str){
	var reg = /[^0-9a-zA-Z\.\u4E00-\u9FA5]/gm;
	var kigouArray = str.match(reg);
	if(kigouArray == null){
		return true;
	} else {
	    return false;
	}
}

/**
 * 返回字符串字节长度
 * 
 */

window.GAG.ios.tool.getELength = function (str) {
    str = $.trim(str);
    var a = 0;
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) {
            // 按照预期计数增加2
            a += 2;
        } else {
            a++;
        }
    }
    return a;
}
// function getELength(str) {
// 	str = $.trim(str);
// 	var a = 0;
// 	for (i = 0; i < str.length; i++) {
// 		if (str.charCodeAt(i) > 255) {
// 			// 按照预期计数增加2
// 			a += 2;
// 		} else {
// 			a++;
// 		}
// 	}
// 	return a;
// }

//清空divID下面清空input的值,select的值改为默认第一项
function clearDivContent(divID){
	$("#"+divID).find("input,select").each(function(){
	    if(this.type=="select-one")
	    	this.selectedIndex=0;
	    else
	    	this.value = "";
	 });
}

//获取divID下所有input select的值,封装进map
function getDivContent(divID){
	var map = {};
	$("#"+divID).find("input,select").each(function(){
	    var key = this.id;
	    var value = this.value;
	    map[key] = value;
	});
	return map;
}

//针对增加valiadate表单后,无法对autoCompelte进行点击
/*
function setAutoComplete(inputID){
	$(document).on('click', '.ui-menu-item', function () {
		var v = $(this).children(0)[0].innerText;
		$("#"+inputID).val(v);
	});
}
*/