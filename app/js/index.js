/**
 * 
 * @authors ${author}
 * @date    2017-08-09 11:30:15
 * @version $Id$
 */
require('./config.js');
// const md5 = require('./md5.js');

// console.info(md5)
GAG.ios.index = function() {
  window.GlobalYh = {};    //用户信息
  window.GlobalBm = {};    //部门信息
  window.GlobalXfxx = {};  //销方信息
  this.GlobalBmList = new Array();//当前登录用户本级及下级组织机构数据
  this.GlobalBmUpList = new Array();//当前登录用户本级及上级组织机构数据
  this.ieType = navigator.appVersion.match(/Trident\/\d/);
};

GAG.ios.index.prototype.init = function() {
  var This = this;
  //layui弹出层初始化，放在最前位置
  layui.use(['layer'], function(){
    var layer = layui.layer;
  });
  
  //检测登录状态并加载登录信息
   //this.checkLogin();
  
  //左侧菜单滚动事件绑定
  $("#left_Menu").scroll(function() {
    This.setMenuRightHeight();
  });
  
  //菜单底总按钮提示语工具初始化
  $("[data-toggle='tooltip']").tooltip({
        container: "body"
    });
  
  //绑定按钮事件
  this.initButton();
  
  //设置顶部菜单的页签默认主页
  this.setMenuTab("00000");
  
  //设置主内容区域高度（默认为auto导致显示不出来）
  $("#mainDiv").height($(window).height());
  
  //调整顶部菜单页签的默认宽度（减去左侧缩进div的40和右侧信息div的160）
  $("#menuTabs").width($("#mainDiv iframe:first").width() - 190);
  $("#menuTabs a").css("width", $("#menuTabs").width() - 3);
  
  //当初始页面宽度较小时有些为默认高宽，但初始页面较大时部分div高宽需要调整
  if($(window).width() > 991 || This.ieType == "Trident/4"){//判断IE8
    $(".nav_menu").width($(window).width() - 230);
    $("#left_Menu").height($(window).height() - 35);
  }
};

/**
 * 设置子菜单右弹出框位置和高度
 */
GAG.ios.index.prototype.setMenuRightHeight = function() {
  
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
 * 重设页签栏各个页签的宽度
 */
GAG.ios.index.prototype.resetMenuTabWidths = function() {
  var num = $("#mainDiv iframe").length;
  var tabWidths = $("#menuTabs").width() - num * 3;
  $("#menuTabs a").css("width", parseInt(tabWidths / num));
};

/**
 * 窗口缩放事件绑定
 */
GAG.ios.index.prototype.windowResize = function() {
  var This = this;
  window.onresize = function(){
    $("#left_Menu").height($(window).height() - ($("body").hasClass("nav-md") ? 35 : 0));//减掉底部按钮高度
    $("#mainDiv").height($(window).height());
    $(".mainFrame").height($(window).height() - 31);//减掉顶部栏高度
    
    var menuWidth = ($("#sidebar-menu").width() == 230) ? 230 : ($("#sidebar-menu").width() == 0 ? 0 : 70);
    $(".mainFrame").width($(window).width() - menuWidth);
    $(".nav_menu").width($(window).width() - menuWidth);
    $("#menuTabs").width($(window).width() - menuWidth - 190);//190为顶部栏最左的40和最右的150(实际145，留5空隙)之和
    
    This.setMenuRightHeight();
    This.resetMenuTabWidths();
  }
};

/**
 * 初始化菜单
 */
GAG.ios.index.prototype.initMenu = function() {
  var This = this;
  $.ajax({
    url : window.BASE_API_URL + "index/initMenu.do",
    data : {
      authType: 0
    },
    type: "post",
     xhrFields: {
          withCredentials: true
     },
      crossDomain: true,
    dataType : "json",
    success : function(data) {
    //var data = [{"gnid":"10006","gnidx":1,"gnmc":"系统设置","gnlj":"pages/xtsz","gnjc":"2","sjgnid":"0","dmXtgn":null,"yxbz":"1","ms":"功能描述:<系统设置>","by1":null,"by2":null,"iconClass":"fa fa-cog"},{"gnid":"10010","gnidx":1,"gnmc":"角色管理","gnlj":"pages/admin/role_manager.html","gnjc":"3","sjgnid":"10006","dmXtgn":null,"yxbz":"1","ms":"功能描述:<角色管理>","by1":null,"by2":null,"iconClass":"fa fa-group"},{"gnid":"10011","gnidx":2,"gnmc":"用户管理","gnlj":"pages/admin/user_manager.html","gnjc":"3","sjgnid":"10006","dmXtgn":null,"yxbz":"1","ms":"功能描述:<用户管理>","by1":null,"by2":null,"iconClass":"fa fa-user"},{"gnid":"10191","gnidx":3,"gnmc":"授权管理","gnlj":"pages/admin/auth_manager.html","gnjc":"3","sjgnid":"10006","dmXtgn":null,"yxbz":"1","ms":"功能描述:<授权管理>","by1":null,"by2":null,"iconClass":"fa fa-check-square-o"},{"gnid":"10009","gnidx":4,"gnmc":"参数设置","gnlj":"pages/admin/cspz_manager.html","gnjc":"3","sjgnid":"10006","dmXtgn":null,"yxbz":"1","ms":"功能描述:<参数管理>","by1":null,"by2":null,"iconClass":null},{"gnid":"10016","gnidx":5,"gnmc":"外网管理","gnlj":"pages/admin/wwgl_main.html","gnjc":"3","sjgnid":"10006","dmXtgn":null,"yxbz":"1","ms":"功能描述:<外网管理>","by1":null,"by2":null,"iconClass":"fa-share-alt"},{"gnid":"10037","gnidx":6,"gnmc":"操作日志","gnlj":"pages/rzgl/czrz_main.html","gnjc":"3","sjgnid":"10006","dmXtgn":null,"yxbz":"1","ms":"功能描述:<前台日志>","by1":null,"by2":null,"iconClass":null},{"gnid":"10012","gnidx":7,"gnmc":"菜单管理","gnlj":"pages/admin/menu_manager.html","gnjc":"3","sjgnid":"10006","dmXtgn":null,"yxbz":"1","ms":"功能描述:<菜单管理>","by1":null,"by2":null,"iconClass":null},{"gnid":"10123","gnidx":8,"gnmc":"站内信息管理","gnlj":"pages/admin/zngl_manager.html","gnjc":"3","sjgnid":"10006","dmXtgn":null,"yxbz":"1","ms":"功能描述:<站内信息管理>","by1":null,"by2":null,"iconClass":"fa fa-envelope-o"},{"gnid":"10330","gnidx":9,"gnmc":"客户端访问记录","gnlj":"pages/rzgl/kztkkxx_main.html","gnjc":"3","sjgnid":"10006","dmXtgn":null,"yxbz":"1","ms":"功能描述:<客户端访问记录>","by1":null,"by2":null,"iconClass":" fa-file -text-o"},{"gnid":"10340","gnidx":10,"gnmc":"外网地址管理","gnlj":"pages/admin/wwdzgl.html","gnjc":"3","sjgnid":"10006","dmXtgn":null,"yxbz":"1","ms":"功能描述:<外网地址管理>","by1":null,"by2":null,"iconClass":null},{"gnid":"10350","gnidx":11,"gnmc":"客户端自动注册","gnlj":"pages/admin/zdzc_main.html","gnjc":"3","sjgnid":"10006","dmXtgn":null,"yxbz":"1","ms":"功能描述:<客户端自动注册>","by1":null,"by2":null,"iconClass":"fa-thumbs-o-up"},{"gnid":"10360","gnidx":12,"gnmc":"日志下载","gnlj":"pages/rzgl/xzrz_main.html","gnjc":"3","sjgnid":"10006","dmXtgn":null,"yxbz":"1","ms":"功能描述:<系统日志下载>","by1":null,"by2":null,"iconClass":"fa-download"},{"gnid":"10007","gnidx":2,"gnmc":"编码管理","gnlj":"pages/bmgl","gnjc":"2","sjgnid":"0","dmXtgn":null,"yxbz":"1","ms":"功能描述:<编码管理>","by1":null,"by2":null,"iconClass":"fa fa-barcode"}]
      if(data.status == 'T'){
        window.location.href = 'login.html';
        return;
      }
      if(data.status == 'F'){

      }
      var menuStr="";
      $("#menu_ul").empty();
      var data = data.data;

      for(var i=0; i < data.length; ){
        if(data[i].level == "1"){//二级菜单（一级菜单精简不显示）
          var iconClass = data[i].iconClass == undefined ? "fa-desktop" : data[i].iconClass;
          menuStr += '<li>';
          
          menuStr += '<a onClick="index.menuClick(this)"><i class="fa ' + iconClass + '"></i>' + data[i].authName;
          menuStr += '<span class="fa fa-chevron-down"></span></a>';
          
          menuStr += '<ul class="nav child_menu">';
          for(i++ ; i < data.length; ){
            if(data[i].level == "1")
              break;
            
            iconClass = data[i].iconClass == undefined ? "fa-desktop" : data[i].iconClass;
            
            if(i + 1 < data.length && data[i+1].parentId == data[i].id){//三级菜单，还有下级菜单情况
              menuStr += '<li>';
              
              menuStr += '<a onClick="index.menuClick(this)"><i class="fa ' + iconClass + '"></i>' + data[i].authName;
              menuStr += '<span class="fa fa-chevron-down"></span></a>';
              
              menuStr += '<ul class="nav child_menu">';
              for(i++ ; i < data.length; i++){
                if(data[i].level == "1" || data[i].level == "2")
                  break;
                
                iconClass = data[i].iconClass == undefined ? "fa-desktop" : data[i].iconClass;
                
                menuStr += '<li onClick="index.jumpToPage(\'' + data[i].id + '\', \'' + data[i].authName
                  + '\', \'' + data[i].link + '\',this)"><a><i class="fa ' + iconClass + '"></i>' + data[i].authName + '</a></li>';
              }
              menuStr += '</ul>';
              menuStr += '</li>';
            }
            else{//三级菜单，无下级菜单情况
              menuStr += '<li onClick="index.jumpToPage(\'' + data[i].id + '\', \'' + data[i].authName
                + '\', \'' + data[i].link + '\',this)"><a><i class="fa ' + iconClass + '"></i>' + data[i].authName + '</a></li>';
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
};

/**
 * 加载组织机构数据
 */
GAG.ios.index.prototype.initBmList = function (){
  var This = this;
  var initBmJson = {
    "id"    : this.GlobalBm.id,
    "bmid"    : this.GlobalBm.bmid,
    "bmjc"    : this.GlobalBm.bmjc,
    "bmmc"    : this.GlobalBm.bmmc,
    "nsrsbh"  : this.GlobalBm.nsrsbh,
    "ssnsrsbh"  : this.GlobalBm.ssnsrsbh,
    "isInit"  : true
  };
  
  this.GlobalBmList.push(initBmJson);
  this.GlobalBmUpList.push(initBmJson);
  
  //加载机构树
  $.ajax({
    url : window.BASE_API_URL + "index/initBmList.action",
    data : "",
    type : 'post',
    dataType : "json",
    success : function(data){
      if (data.retCode == 0) {
        This.GlobalBmList = data.bmList;
        This.GlobalBmUpList = data.bmUpList;
      } else {
        layer.open({content: "机构信息加载失败，请退出重新登录！"}); 
      }
    },
    error :function(){
      layer.open({content: "机构信息加载失败，请退出重新登录！"}); 
    }
  });
};

/**
 * 检测是否已登录，并保存登录信息和相关数据
 */
GAG.ios.index.prototype.checkLogin = function() {
  var This = this;
  This.initMenu();
  // $.ajax({
  //   url : window.BASE_API_URL + "/VATServer/login/checkLogin.action",
  //   data : {},
  //   type : "post",
  //   dataType : "json",
  //   success : function(data) {
  //     if(data.retCode == 0){
  //       GlobalYh = data.yh;
  //       GlobalBm = data.bm;
  //       GlobalXfxx = data.xfxx;
  //       This.initMenu();
  //       This.initBmList();
  //       $("#username").text(GlobalYh.yhmc);
  //       if(data.lockYh == "1")
  //         setTimeout("openLockDiv()", 1);
  //     } else {
  //       window.location.href = "login.html";//退回到默认页，即登录页
  //     }
  //   }
  // });
};

/**
 * 打开用户信息弹窗
 */
GAG.ios.index.prototype.openUserInfo = function() {
  //设置用户信息
    $.ajax({
        url : window.BASE_API_URL + "login/queryloginUserDetail.do",
        type : "post",
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        dataType : "json",
        success : function(data){
          var data = data.data;
            // window.GlobalYh = data;
            // console.log("hhhh",GlobalYh);
            // console.log(typeof (GlobalYh));
            // console.log("ooooo",data);
            $("#user_yhmc").val(data.userName);
            $("#user_yhid").val(data.userId);

            $("#user_ssjg").val(data.deptName); //所属机构
            $("#user_ssid").val(data.deptId); //所属机构id
            $("#user_sssh").val(data.taxNo); //所属税号
        }
    })
  
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
};

/**
 * 菜单缩进设置
 */
GAG.ios.index.prototype.setMenuToggle = function() {
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
  this.resetMenuTabWidths();
  
  if($(document.body).attr("class") == "nav-sm" && $("#menu_ul .active-sm").length == 1)
    this.setMenuRightHeight();
  else
    $("#menu_right").hide();
}


/**
 * 打开设置的弹窗
 */
GAG.ios.index.prototype.openSetting = function() {
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
};

/**
 * 锁定并打开弹窗
 */
GAG.ios.index.prototype.lockAndOpenDiv = function() {
  var This = this;
  $.ajax({
    url : window.BASE_API_URL + "login/pageLockYh.action",
    type : "post",
    dataType : "json",
    success : function(data) {
      if(data.retCode == "0")
        This.openLockDiv();
      else
        layer.msg(data.retMsg);
    }
  });
};

/**
 * 打开锁定窗口
 */
GAG.ios.index.prototype.openLockDiv = function() {
  
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
        url : window.BASE_API_URL + "login/pageUnlockYh.action",
        data : {
          "password" : md5.hex_md5(password)
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
  
};

/**
 * 打开修改密码弹窗
 */
GAG.ios.index.prototype.openModifyDiv = function() {
  var This = this;
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
      This.modifyPassword();
    }
  });
}
/**
 * 点击确定按钮进行修改密码
 */
GAG.ios.index.prototype.modifyPassword = function() {
  var This = this;
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
    url :  window.BASE_API_URL + "index/modifyPassword.action", 
    data : {
      "oldPwd" : md5.hex_md5(oldPwd),
      "newPwd" : md5.hex_md5(newPwd)
    },
    dataType : 'json',
    success : function(data) {
      if(data.retCode == "0"){
        layer.alert("密码修改成功，请重新登录！", {skin: 'layui-layer-molv', closeBtn: 0}, function(){
          This.exit();
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
};

/**
 * 弹窗确认是否退出
 */
GAG.ios.index.prototype.confirmExit = function () {
    var This = this;
    layer.confirm("确定退出登录吗？", {skin: 'layui-layer-lan', title: "确定", btn: ['确定', '取消']}, function () {
        This.exit();
    });
}

/**
 * 退出登录
 */
GAG.ios.index.prototype.exit = function () {
    $.ajax({
        url: window.BASE_API_URL + "login/offLogin.do",
        data: {},
        type: "post",
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        success: function (data) {
            if (data.status == "S")
                window.location.href = "login.html";//退回到默认页，即登录页
            else
                layer.msg(data.msg);
        }
    });
}

/**
 * 初始化按钮
 */
GAG.ios.index.prototype.initButton = function() {
  var This = this;
  //缩进按钮
  $("#menu_toggle").click(function(){
    This.setMenuToggle();
  });
  
  //设置按钮
  $("#Settings").click(function(){
    This.openSetting();
  });
  
  //锁定按钮
  $("#Lock").click(function(){
    This.lockAndOpenDiv();
  });
  
  //改密按钮
  $("#ModifyPassword").click(function(){
    This.openModifyDiv();
  });
  
  //退出按钮
  $("#Logout").click(function(){
    This.confirmExit();
  });
};

/**
 * 设置页签
 */
GAG.ios.index.prototype.setMenuTab = function(frameClass) {
  var This = this;
  $("#mainDiv iframe." + frameClass).height($(window).height() - 31);
  $("#mainDiv iframe." + frameClass).width($(window).width());
  if($(window).width() > 991 || This.ieType == "Trident/4")//判断IE8
    $("#mainDiv iframe." + frameClass).width($(window).width() - 230);
  if($(document.body).attr("class") == "nav-sm")
    $("#mainDiv iframe." + frameClass).width($(window).width() - 70);
  
  this.resetMenuTabWidths();
  
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
    This.clickOnCloseMenuTab(this, frameClass);
  });
};

/**
 * 菜单点击的处理方法
 */
GAG.ios.index.prototype.menuClick = function(clickMenu) {
  var This = this;
  var $li = $(clickMenu).parent();
  
  if ($li.is(".active")) {
    $li.removeClass("active active-sm");
    $("ul:first", $li).slideUp();
    $("#menu_right").slideUp();
  } else {
    if ($li.parent().is('.child_menu')){
      $li.parent().find("li.active ul").slideUp();
      $li.parent().find("li").removeClass("active active-sm");
    } else {
      $("#sidebar-menu").find('li').removeClass('active active-sm');
      $("#sidebar-menu").find('li ul').slideUp();
    }
    $li.addClass("active active-sm");
    
    $("ul:first", $li).slideDown();
    $("#menu_right > div > ul").html(clickMenu.nextSibling.innerHTML);//第一个nextSibling为空白的间隔
    
    $("#menu_right > div > ul > li > a[onClick]").attr("onClick", "rightMenuClick(this)");
    
    if($(document.body).attr("class") == "nav-sm"){
      $("#menu_right").hide();
      This.setMenuRightHeight();
      $("#menu_right").slideDown();
    }
  }
};

/**
 * 子菜单右弹出框中的菜单点击处理方法
 */
function rightMenuClick(clickMenu){
  var This = this;
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
    This.setMenuRightHeight();
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
  } else {

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
    This.setMenuRightHeight();
  }, 300);
  
}

/**
 * 点击菜单的跳转方法
 */
GAG.ios.index.prototype.jumpToPage = function(gnid, gnmc, gnlj, clickMenu) {
  var This = this;
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
      } else {
        $("#mainDiv").empty();
        $("#menuTabs").empty();
      }
    }
    
    var icon = $(clickMenu).find("i")[0].outerHTML;
    $("#menuTabs").append('<a title="' + gnmc + '" class="active ' + gnid + '">' + icon +
      gnmc + '</a>' + '<span class="fa fa-close active"></span>');
    $("#mainDiv").append('<iframe class="mainFrame ' + frameClass + '" src="../' + gnlj + '" frameborder="0" id="frame' + frameClass + '" ></iframe>');
    //console.log('../'+gnlj)
    // setTimeout(function() {
    //   $('#frame'+frameClass).css('display', 'block');
    //   $('#frame'+frameClass).contents().find('.context').eq(0).html('').load('../'+gnlj, function(responseTxt, statusTxt, xhr) {
    //       if (statusTxt == "success") {
            This.setMenuTab(frameClass);
            $(".menuTabs a." + frameClass).mousedown();
            $(".menuTabs a." + frameClass).click();
    //       }
    //   });
    // }, 500);
    
  } else {
    //被点击菜单对应的页签和内容都存在后，调用一次页签点击的切换效果
    $(".menuTabs a." + frameClass).click();
  }
  
  //窄菜单时，点完右侧菜单即隐藏右侧菜单
  if($(document.body).attr("class") == "nav-sm"){
    $("#menu_right").hide();
    $("#sidebar-menu li.active > ul").hide();
    $("#sidebar-menu li.active").removeClass('active active-sm');
  }
};

/**
 * 页签上的关闭按钮点击事件
 */
GAG.ios.index.prototype.clickOnCloseMenuTab = function(element, frameClass) {
    var This = this;
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
          'src="dashboard.html" frameborder="0"></iframe>');

        This.setMenuTab("00000");
    } else {
      var newActive = $("#menuTabs a:first");
      $(newActive).addClass("active");
      $(newActive).next().addClass("active");
      $("#mainDiv iframe:first").show();
    }
  } else {
    if(This.ieType == "Trident/5")//IE9
      document.getElementById("menuTabs").removeChild(element.previousSibling);
    else
      $(element).prev().remove();
    $(element).closest("span").remove();
    document.getElementById("mainDiv").removeChild($("#mainDiv iframe." + frameClass)[0]);
  }

    This.resetMenuTabWidths();
};


