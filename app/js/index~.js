/**
 * 主页初始化及相关方法
 */


//	全局变量

var GlobalYh = {};		//用户信息
var GlobalBm = {};		//部门信息
var GlobalXfxx = {};	//销方信息

var GlobalBmList = new Array();//当前登录用户本级及下级组织机构数据

var GlobalBmUpList = new Array();//当前登录用户本级及上级组织机构数据


var ieType = navigator.appVersion.match(/Trident\/\d/);


/**
 * 窗口缩放事件绑定
 */
window.onresize = function(){
	$("#left_Menu").height($(window).height() - ($("body").hasClass("nav-md") ? 35 : 0));//减掉底部按钮高度
	$("#mainDiv").height($(window).height());
	$(".mainFrame").height($(window).height() - 31);//减掉顶部栏高度
	
	var menuWidth = ($("#sidebar-menu").width() == 230) ? 230 : ($("#sidebar-menu").width() == 0 ? 0 : 70);
	$(".mainFrame").width($(window).width() - menuWidth);
	$(".nav_menu").width($(window).width() - menuWidth);
	$("#menuTabs").width($(window).width() - menuWidth - 190);//190为顶部栏最左的40和最右的150(实际145，留5空隙)之和
	
	setMenuRightHeight();
	resetMenuTabWidths();
}

/**
 * 页面初始化执行方法
 */
$(document).ready(function(){
	
	//layui弹出层初始化，放在最前位置
	layui.use(['layer'], function(){
		var layer = layui.layer;
	});
	
	//检测登录状态并加载登录信息
	checkLogin();
	
	//左侧菜单滚动事件绑定
	$("#left_Menu").scroll(function() {
		setMenuRightHeight();
	});
	
	//菜单底总按钮提示语工具初始化
	$("[data-toggle='tooltip']").tooltip({
        container: "body"
    });
	
	//绑定按钮事件
	initButton();
	
	//设置顶部菜单的页签默认主页
	setMenuTab("00000");
	
	//设置主内容区域高度（默认为auto导致显示不出来）
	$("#mainDiv").height($(window).height());
	
	//调整顶部菜单页签的默认宽度（减去左侧缩进div的40和右侧信息div的160）
	$("#menuTabs").width($("#mainDiv iframe:first").width() - 190);
	$("#menuTabs a").css("width", $("#menuTabs").width() - 3);
	
	//当初始页面宽度较小时有些为默认高宽，但初始页面较大时部分div高宽需要调整
	if($(window).width() > 991 || ieType == "Trident/4"){//判断IE8
		$(".nav_menu").width($(window).width() - 230);
		$("#left_Menu").height($(window).height() - 35);
	}
});


/**
 * 检测是否已登录，并保存登录信息和相关数据
 */
function checkLogin(){
	
	$.ajax({
		url : "login/checkLogin.action",
		data : {},
		type : "post",
		dataType : "json",
		success : function(data) {
			if(data.retCode == 0){
				GlobalYh = data.yh;
				GlobalBm = data.bm;
				GlobalXfxx = data.xfxx;
				initMenu();
				initBmList();
				$("#username").text(GlobalYh.yhmc);
				if(data.lockYh == "1")
					setTimeout("openLockDiv()", 1);
			}
			else{
				window.location.href = "login.html";//退回到默认页，即登录页
			}
		},
		error : function(){
			
		}
	});
	
	
}

/**
 * 初始化菜单
 */
function initMenu(){
	$.ajax({
		url : "index/initMenu.action",
		data : {},
		type : "post",
		dataType : "json",
		success : function(data) {
			
			var menuStr="";
			$("#menu_ul").empty();
			
			for(var i=0; i < data.length; ){
				if(data[i].gnjc == "2"){//二级菜单（一级菜单精简不显示）
					var iconClass = data[i].iconClass == undefined ? "fa-desktop" : data[i].iconClass;
					menuStr += '<li>';
					
					menuStr += '<a onClick="menuClick(this)"><i class="fa ' + iconClass + '"></i>' + data[i].gnmc;
					menuStr += '<span class="fa fa-chevron-down"></span></a>';
					
					menuStr += '<ul class="nav child_menu">';
					for(i++ ; i < data.length; ){
						if(data[i].gnjc == "2")
							break;
						
						iconClass = data[i].iconClass == undefined ? "fa-desktop" : data[i].iconClass;
						
						if(i + 1 < data.length && data[i+1].sjgnid == data[i].gnid){//三级菜单，还有下级菜单情况
							menuStr += '<li>';
							
							menuStr += '<a onClick="menuClick(this)"><i class="fa ' + iconClass + '"></i>' + data[i].gnmc;
							menuStr += '<span class="fa fa-chevron-down"></span></a>';
							
							menuStr += '<ul class="nav child_menu">';
							for(i++ ; i < data.length; i++){
								if(data[i].gnjc == "2" || data[i].gnjc == "3")
									break;
								
								iconClass = data[i].iconClass == undefined ? "fa-desktop" : data[i].iconClass;
								
								menuStr += '<li onClick="jumpToPage(\'' + data[i].gnid + '\', \'' + data[i].gnmc 
									+ '\', \'' + data[i].gnlj + '\',this)"><a><i class="fa ' + iconClass + '"></i>' + data[i].gnmc + '</a></li>';
							}
							menuStr += '</ul>';
							menuStr += '</li>';
						}
						else{//三级菜单，无下级菜单情况
							menuStr += '<li onClick="jumpToPage(\'' + data[i].gnid + '\', \'' + data[i].gnmc 
								+ '\', \'' + data[i].gnlj + '\',this)"><a><i class="fa ' + iconClass + '"></i>' + data[i].gnmc + '</a></li>';
							i++;
						}
					}
					menuStr += '</ul>';
					
					menuStr += '</li>';
				}
			}
			
			$("#menu_ul").append(menuStr);
		}
	});
	
}

/**
 * 加载组织机构数据
 */
function initBmList(){
	
	var initBmJson = {
		"id"		: GlobalBm.id,
		"bmid"		: GlobalBm.bmid,
		"bmjc"		: GlobalBm.bmjc,
		"bmmc"		: GlobalBm.bmmc,
		"nsrsbh"	: GlobalBm.nsrsbh,
		"ssnsrsbh"	: GlobalBm.ssnsrsbh,
		"isInit"	: true
	};
	
	GlobalBmList.push(initBmJson);
	GlobalBmUpList.push(initBmJson);
	
	//加载机构树
	$.ajax({
		url : "index/initBmList.action",
		data : "",
		type : 'post',
		dataType : "json",
		success : function(data){
			if (data.retCode == 0) {
				GlobalBmList = data.bmList;
				GlobalBmUpList = data.bmUpList;
			} else {
				layer.open({content: "机构信息加载失败，请退出重新登录！"}); 
			}
		},
		error :function(){
			layer.open({content: "机构信息加载失败，请退出重新登录！"}); 
		}
	});
	
}



/**
 * 打开用户信息弹窗
 */
function openUserInfo(){
	
	//设置用户信息
	$("#user_yhmc").val(GlobalYh.yhmc);
	$("#user_ssjg").val(GlobalBm.bmmc);
	$("#user_sssh").val(GlobalBm.ssnsrsbh);
	
	layer.open({
		type : 1,
		skin : 'layui-layer-molv', //样式类名
		area : '330px',
		title : '用户信息',
		content : $("#user_info"),
		btn : ['确定'],
		yes : function(index){
			layer.close(index);//关闭当前弹窗
		}
	});
}


/**
 * 初始化按钮
 */
function initButton(){
	
	//缩进按钮
	$("#menu_toggle").click(function(){
		setMenuToggle();
	});
	
	//设置按钮
	$("#Settings").click(function(){
		openSetting();
	});
	
	//锁定按钮
	$("#Lock").click(function(){
		lockAndOpenDiv();
	});
	
	//改密按钮
	$("#ModifyPassword").click(function(){
		openModifyDiv();
	});
	
	//退出按钮
	$("#Logout").click(function(){
		confirmExit();
	});
}


/**
 * 菜单缩进设置
 */
function setMenuToggle(){
	if ($("body").hasClass("nav-md"))
        $("#sidebar-menu li.active").addClass("active-sm").removeClass("active");
    else
        $("#sidebar-menu li.active-sm").addClass("active").removeClass("active-sm");
    
	$("body").toggleClass("nav-md nav-sm");
	
    var menuWidth = ($("#sidebar-menu").width() == 230) ? 230 : ($("#sidebar-menu").width() == 0 ? 0 : 70);
	$(".mainFrame").width($(window).width() - menuWidth);
	$(".nav_menu").width($(window).width() - menuWidth);
	$("#menuTabs").width($(window).width() - menuWidth - 190);
	$("#left_Menu").height($(window).height() - ($("body").hasClass("nav-md") ? 35 : 0));
	resetMenuTabWidths();
	
	if($(document.body).attr("class") == "nav-sm" && $("#menu_ul .active-sm").length == 1)
		setMenuRightHeight();
	else
		$("#menu_right").hide();
}


/**
 * 打开设置的弹窗
 */
function openSetting(){
	
	$("#setting_div input").each(function(){
		this.value = "";//清空原输入信息
	});
	
	layer.open({
		type : 1,
		skin : 'layui-layer-molv', //样式类名
		area : '330px',
		title : '设置',
		content : $("#setting_div"),
		btn : ['确定', '取消'],
		yes : function(index, layero){
			layer.msg(
				"设置选项一：" + $("#setting_div input:eq(0)").val() + "<br>" +
				"设置选项二：" + $("#setting_div input:eq(1)").val() + "<br>" +
				"设置选项三：" + $("#setting_div input:eq(2)").val() + "<br>"
			);
		}
	});
}


/**
 * 锁定并打开弹窗
 */
function lockAndOpenDiv(){
	$.ajax({
		url : "login/pageLockYh.action",
		type : "post",
		dataType : "json",
		success : function(data) {
			if(data.retCode == "0")
				openLockDiv();
			else
				layer.msg(data.retMsg);
		}
	});
}
/**
 * 打开锁定窗口
 */
function openLockDiv(){
	
	var contentStr = 
		'<div class="layui-input-inline">' +
		'  <input id="Lock_password" type="password" class="layui-input" required lay-verify="required"' +
		'    placeholder="请输入密码解锁" autocomplete="off" style="margin: 30px 30px 15px 30px; width: 220px"/>' +
		'</div>';
	
	layer.open({
		type : 1,
		closeBtn : 0,
		skin : 'layui-layer-molv', //样式类名
		area: '280px',
		resize : false,
		shade : 0.95,
		title : '当前用户已锁定',
		content : contentStr,
		btn : ['解锁'],
		yes : function(index, layero){
			var password = $("#Lock_password").val();
			$.ajax({
				url : "login/pageUnlockYh.action",
				data : {
					"password" : hex_md5(password)
				},
				type : "post",
				dataType : "json",
				success : function(data) {
					if(data.retCode == "0")
						layer.close(index);
					else
						layer.msg(data.retMsg);
				}
			});
		}
	});
	
}


/**
 * 打开修改密码弹窗
 */
function openModifyDiv(){
	
	$("#password_modify input").each(function(){
		this.value = "";//清空原输入信息
	});
	
	layer.open({
		type : 1,
		skin : 'layui-layer-molv', //样式类名
		area : '330px',
		title : '修改密码',
		content : $("#password_modify"),
		btn : ['确定', '取消'],
		yes : function(index, layero){
			modifyPassword();
		}
	});
}
/**
 * 点击确定按钮进行修改密码
 */
function modifyPassword(){
	var oldPwd = $("#password_modify input:eq(0)").val();
	var newPwd = $("#password_modify input:eq(1)").val();
	var confirmPwd = $("#password_modify input:eq(2)").val();
	
	if(oldPwd == "" || newPwd == "" || confirmPwd == ""){
		layer.msg("请输入原密码、新密码和确认密码！");
		return;
	}
	if(newPwd != confirmPwd){
		layer.msg("新密码和确认密码不一致，请重新输入！");
		return;
	}
	
	//继续验证时，后台验证旧密码正误，并保存新密码
	$.ajax({
		type : "post", 
		url :  "index/modifyPassword.action", 
		data : {
			"oldPwd" : hex_md5(oldPwd),
			"newPwd" : hex_md5(newPwd)
		},
		dataType : 'json',
		success : function(data) {
			if(data.retCode == "0"){
				layer.alert("密码修改成功，请重新登录！", {skin: 'layui-layer-molv', closeBtn: 0}, function(){
					exit();
				});
			}
			else{
				layer.msg(data.retMsg);
			}
		},
  		error : function(XMLHttpRequest, textStatus, errorThrown) {
			layer.msg("请求出错！" + errorThrown);
  		}
	});
	$(this).dialog("close");
}


/**
 * 弹窗确认是否退出
 */
function confirmExit(){
	
	layer.confirm("确定退出登录吗？", {skin: 'layui-layer-lan', title: "确定", btn: ['确定', '取消']}, function(){
		exit();
	});
}
/**
 * 退出登录
 */
function exit(){
	$.ajax({
		url : "login/logoff.action",
		data : {},
		type : "post",
		dataType : "json",
		success : function(data) {
			if(data.retCode == 0)
				window.location.href = "login.html";//退回到默认页，即登录页
			else
				layer.msg(data.retMsg);
		}
	});
}



/**
 * 重设页签栏各个页签的宽度
 */
function resetMenuTabWidths(){
	
	var num = $("#mainDiv iframe").length;
	var tabWidths = $("#menuTabs").width() - num * 3;
	$("#menuTabs a").css("width", parseInt(tabWidths / num));
}

/**
 * 设置页签
 */
function setMenuTab(frameClass){
	
	$("#mainDiv iframe." + frameClass).height($(window).height() - 31);
	$("#mainDiv iframe." + frameClass).width($(window).width());
	if($(window).width() > 991 || ieType == "Trident/4")//判断IE8
		$("#mainDiv iframe." + frameClass).width($(window).width() - 230);
	if($(document.body).attr("class") == "nav-sm")
		$("#mainDiv iframe." + frameClass).width($(window).width() - 70);
	
	resetMenuTabWidths();
	
	//页签的点击事件
	$("#menuTabs a." + frameClass).click(function(e){
		
		$("#menuTabs a").removeClass("active");
		$("#menuTabs span").removeClass("active");
		
		$("#mainDiv iframe").hide();
		$("#mainDiv iframe." + frameClass).fadeIn("slow");
		
		$(this).addClass("active");
		$(this).next().addClass("active");
	});/**/
	
	//关闭按钮的点击事件
	$("#menuTabs a." + frameClass).next().click(function(e){
		clickOnCloseMenuTab(this, frameClass);
	});
}

/**
 * 菜单点击的处理方法
 */
function menuClick(clickMenu){
	
	var $li = $(clickMenu).parent();
	
	if ($li.is(".active")) {
		$li.removeClass("active active-sm");
		$("ul:first", $li).slideUp();
		$("#menu_right").slideUp();
	}
	else {
		if ($li.parent().is('.child_menu')){
			$li.parent().find("li.active ul").slideUp();
			$li.parent().find("li").removeClass("active active-sm");
		}
		else{
			$("#sidebar-menu").find('li').removeClass('active active-sm');
			$("#sidebar-menu").find('li ul').slideUp();
		}
		$li.addClass("active active-sm");
		
		$("ul:first", $li).slideDown();
		$("#menu_right > div > ul").html(clickMenu.nextSibling.innerHTML);//第一个nextSibling为空白的间隔
		
		$("#menu_right > div > ul > li > a[onClick]").attr("onClick", "rightMenuClick(this)");
		
		if($(document.body).attr("class") == "nav-sm"){
			$("#menu_right").hide();
			setMenuRightHeight();
			$("#menu_right").slideDown();
		}
	}
}

/**
 * 子菜单右弹出框中的菜单点击处理方法
 */
function rightMenuClick(clickMenu){
	
	$(clickMenu).parent().toggleClass("active-sm");
	
	if($(clickMenu).parent().hasClass("active-sm"))
		$(clickMenu).next().show();
	else
		$(clickMenu).next().hide();
	
	var oldActiveLi = $(clickMenu).parent().siblings("li.active-sm");
	oldActiveLi.find("ul").hide();
	oldActiveLi.removeClass("active-sm");
	oldActiveLi.height(25);
	
	$(clickMenu).parent().height(25);
	setMenuRightHeight();
	return;/**/
	
	$("#menu_right").css("height", "auto");
	$("#menu_right > div").css("height", "auto");
	$(clickMenu).css("height", "auto");
	$(clickMenu).parent().css("height", "auto");
	
	if($(clickMenu).parent().hasClass("active-sm")){
		setTimeout(function(){
			$(clickMenu).parent().toggleClass("active-sm");
			$(clickMenu).css("height", "19px");
			//$(clickMenu).parent().css("height", "19px");
		}, 1000);
		$(clickMenu).next().slideUp(300);
	}
	else{

		setTimeout(function(){
			var oldActiveLi = $(clickMenu).parent().siblings("li.active-sm");
			oldActiveLi.find("ul").slideUp(300);
			oldActiveLi.removeClass("active-sm");

			oldActiveLi.height(25);
			
		}, 1000);
		
		$(clickMenu).parent().toggleClass("active-sm");
		
		$(clickMenu).next().hide();
		$(clickMenu).next().slideDown(300);
	}
	
	setTimeout(function(){
		var oldActiveLi = $(clickMenu).parent().siblings("li.active-sm");
		oldActiveLi.find("ul").slideUp(300);
		oldActiveLi.removeClass("active-sm");
		
		oldActiveLi.height(25);
		
		$(clickMenu).parent().height(25);
		
		setMenuRightHeight();
	}, 300);
	
}

/**
 * 点击菜单的跳转方法
 */
function jumpToPage(gnid, gnmc, gnlj, clickMenu){

	$("#menu_ul > li.active li.active").removeClass("active active-sm");
	$(clickMenu).parent().parent().addClass("active active-sm");//当前被点击菜单的父级菜单添加选中状态
	$(clickMenu).addClass("active active-sm");
	
	if(gnmc == "首页"){
		$("#sidebar-menu li.active ul, #sidebar-menu li.active-sm ul").slideUp();
		$("#sidebar-menu li.active, #sidebar-menu li.active-sm").removeClass("active active-sm");
	}
	
	var frameClass = gnid;
	
	if($("#mainDiv iframe." + frameClass).length == 0){
		
		if($("#menuTabs a:first").width() < 100){
			if($("#mainDiv iframe").length > 1){
				
				layer.msg("窗口打开过多，请关闭部分后重试！");
				
				if($("body").hasClass("nav-sm")){
					$("#menu_right").hide();
					$("#menu_ul li.active-sm").removeClass("active");
				}
				return;
			}
			else{
				$("#mainDiv").empty();
				$("#menuTabs").empty();
			}
		}
		
		var icon = $(clickMenu).find("i")[0].outerHTML;
		$("#menuTabs").append('<a title="' + gnmc + '" class="active ' + gnid + '">' + icon +
			gnmc + '</a>' + '<span class="fa fa-close active"></span>');
		$("#mainDiv").append('<iframe class="mainFrame ' + frameClass + 
			'" src="' + gnlj + '" frameborder="0"></iframe>');
		
		setMenuTab(frameClass);
		
		$(".menuTabs a." + frameClass).mousedown();
	}
	
	//被点击菜单对应的页签和内容都存在后，调用一次页签点击的切换效果
	$(".menuTabs a." + frameClass).click();
	
    //窄菜单时，点完右侧菜单即隐藏右侧菜单
    if($(document.body).attr("class") == "nav-sm"){
    	$("#menu_right").hide();
    	$("#sidebar-menu li.active > ul").hide();
    	$("#sidebar-menu li.active").removeClass('active active-sm');
    }
}

/**
 * 设置子菜单右弹出框位置和高度
 */
function setMenuRightHeight(){
	
	if($(document.body).attr("class") == "nav-sm" && $("#menu_ul .active-sm").length == 1){
		
		var windowHeight = $(window).height();
		var menuHeight = $("#menu_right > div > ul > li").length * 30;
		
		var childMenuLength = $("#menu_right li.active-sm ul li").length;
		if(childMenuLength > 0){
			menuHeight += childMenuLength * 30;
			$("#menu_right li.active-sm").height(25 + childMenuLength * 30);
			$("#menu_right li.active-sm .child_menu").removeAttr("style");//宽菜单时展开二级菜单，切换到窄菜单导致其不可见
		}
		
		if(windowHeight - 31 < menuHeight){//可视高度比菜单高度小
			$("#menu_right").height(windowHeight - 31);
			$("#menu_right > div").height(windowHeight - 31);
			
			$("#menu_right").css("top", "31px");
		}
		else{
			$("#menu_right").height(menuHeight);
			$("#menu_right > div").height(menuHeight);
			
			var offsetTop = $("#menu_ul > li.active-sm").offset().top;
			if(offsetTop < 31)
				offsetTop = 31;
			
			if(offsetTop + menuHeight < windowHeight)//菜单底部在可视范围之内，则与一级菜单对齐，反之需要上移
				$("#menu_right").css("top", offsetTop + "px");
			else
				$("#menu_right").css("top", windowHeight - menuHeight +"px");
		}
	}
}

/**
 * 页签上的关闭按钮点击事件
 */
function clickOnCloseMenuTab(element, frameClass){

	//ie9下不能直接用$("#mainDiv").remove(),会导致浏览器崩溃
	
	if($(element).hasClass("active")){
		$(element).prev().closest("a").remove();
		$(element).closest("span").remove();
		
		document.getElementById("mainDiv").removeChild($("#mainDiv iframe." + frameClass)[0]);
		
		if($("#menuTabs a").length == 0){
			$("#menuTabs").empty();
			$("#menuTabs").append('<a title="首页" class="active 00000"><i class="fa fa-desktop"></i>首页</a>' +
					'<span class="fa fa-close active"></span>');
			$("#mainDiv").append('<iframe id="dddddd" class="mainFrame 00000" ' +
					'src="main.html" frameborder="0"></iframe>');
			
			setMenuTab("00000");
		}
		else{
			var newActive = $("#menuTabs a:first");
			$(newActive).addClass("active");
			$(newActive).next().addClass("active");
			$("#mainDiv iframe:first").show();
		}
	}
	else{
		if(ieType == "Trident/5")//IE9
			document.getElementById("menuTabs").removeChild(element.previousSibling);
		else
			$(element).prev().remove();
		$(element).closest("span").remove();
		document.getElementById("mainDiv").removeChild($("#mainDiv iframe." + frameClass)[0]);
	}
	
	resetMenuTabWidths();
}