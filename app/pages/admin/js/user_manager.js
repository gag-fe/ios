GAG.ios.user_manager = function () {
    var This = this;
	this.sessionYhid = window.top["GlobalYh"].yhid;
	this.colMap = {
        colNames:['id','登录账号','用户名称','操作','组织机构','开票点','用户属性','账号有效期','锁定标志','创建时间'],
        colModel:[
            {name:'id',index:'id', width:'',align:'center',sortable:false,hidden:true},
            {name:'userId',index:'userId', width:'15%',align:'center',sortable:false,hidden:false},
            {name:'userName',index:'userName', width:'20%',align:'center',sortable:false,hidden:false},
            {
                name: '操作',width: '20%', align: 'center', formatter: function (value,gird,rows,state) {
                return  "<a href='#' class='btn_look' style='display: inline-block;width: 19px;height: 20px;margin: 0 4px' onclick='' >" +
                    "<i data-method='btn_check' class='btn-ev glyphicon glyphicon-eye-open pointer' style='font-size: 12px !important;'></i>" +
                    "</a>" +
                    "<a href='#' style='display: inline-block;margin: 0 4px'>" +
                    "<i data-method='btn_edit' class='btn-ev layui-icon'>&#xe642;</i> " +
                    "</a>" +
                    "<a href='#' style='display: inline-block;margin: 0 4px'>" +
                    "<i data-method='btn_del' class='btn-ev glyphicon glyphicon-trash' style='font-size: 12px !important;'></i>" +
                    "</a>"
            }
            },
            {name:'deptName',index:'deptName', width:'15%',align:'center',sortable:false},
            {name:'invoiceAddrNo',index:'invoiceAddrNo', width:'12%',align:'center',sortable:false},
            {name:'userType',index:'userType', width:'12%',align:'center',sortable:false,formatter(cellvalue, options, rowObject){
                if(cellvalue == 0){
                    return "超级管理用户"
                }
                else if(cellvalue == 1){
                    return "企业管理用户"
				}
                else{
                    return "企业普通用户"
                }
			}},
            {name:'validDate',index:'validDate', width:'20%',align:'center',sortable:false,formatter: function (value,gird,rows,state){
                if(value == null){
                    return '';
                }else{
                    return new Date(value).Format("yyyy-MM-dd");
                }
			}},
            {name:'lockStatus',index:'lockStatus', width:'12%',align:'center',sortable:false,formatter(cellvalue, options, rowObject){
                if(cellvalue == 0){
                    return "未锁定"
                }
                else if(cellvalue == 1){
                    return "已锁定"
                }
			}},
            {name:'createTime',index:'createTime', width:'20%',align:'center',sortable:true,sortorder:'desc',formatter: function (value,gird,rows,state){
                return new Date(value).Format("yyyy-MM-dd hh:mm:ss")
			}},
        ]};

	this.defaultGridConfig = {
        ajaxGridOptions: {
            url: window.BASE_API_URL +"sysUser/querySysUserPage.do",
            type: "post",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true
        },
        prmNames:{
           "page":"pageIndex",
           "rows":"pageSize",
        },
        postData:{
            "deptId":$.trim($("#organId").val()),//组织机构
            "userId":$.trim($("#txt_yhid").val()), //登录账号
            "lockStatus": $.trim($("#select_sdbj option:selected").val()),//锁定标记
        },
        datatype:"json", //数据来源，本地数据
        mtype:"POST",//提交方式
        autowidth:false,//自动宽,
        width : $(window).width()*0.99,
        height: $(window).height()*0.806,
        colNames: this.colMap["colNames"],
        colModel: this.colMap["colModel"],
        rownumbers:true,//添加左侧行号
        cellEdit:false,//表格可编辑
        altRows:true,//隔行变色
        altclass:'GridClass',//隔行变色样式
        caption:"",
        viewrecords: true,//是否在浏览导航栏显示记录总数
        rowNum:10,//每页显示记录数
        rowList:[10,20,30,50,100],
        multiselect: true,
        jsonReader:{
            /*page: "data.pageIndex",
            total: 'Math.ceil(Number(data.total)/Number(data.pageSize))',
            records: "data.total",*/
            id: "userId",//设置返回参数中，表格ID的名字为blackId
            root: "data.rows",
            page : "data.pageIndex",
            total: function (obj) {
                return Math.ceil(obj.data.total/obj.data.pageSize);
            },
            records : "data.total",
            repeatitems : false
        },
        pager:'#yhgl_pager'
    };
};

GAG.ios.user_manager.prototype.init = function () {
    //this.jgcheck();
    this.hideTree();
    this.initButton();//初始化按钮
    this.initGrid();//初始化界面
    initAisinoCheck("checkForm");
    window.GAG.ios.common.collapseLink();//修改折叠事件的绑定
    window.GAG.ios.common.resizeJqGrid("yhgl_gridtable");
};
/**
 * @Describe 初始化按钮事件
 */
GAG.ios.user_manager.prototype.initButton = function (){
	var This = this;
	layui.use('layer',function(){
		var layer = layui.layer;		
		var active = {
			yhgl_query: function(){
                This.yhglQuery(layer);
			},
			yhgl_add: function(){
                This.yhglUserPage(layer,"新增用户信息","add");
			},
			yhgl_modify: function(){
                This.yhglUserPage(layer,"修改用户信息","modify");
			},
			yhgl_delete: function(){
                var selectRows = $("#yhgl_gridtable").jqGrid("getGridParam", "selarrrow"),
                    rowData = $("#yhgl_gridtable").jqGrid("getRowData",selectRows);
                if(selectRows.length == 0){
                    This.layuiAlert('请选中一行，再进行删除！', { btn: ['关闭']});
                    return;
                }
                This.yhglDelete(layer);
                This.yhglQuery(layer);
			},
			reset_password: function(){
                var selectRows = $("#yhgl_gridtable").jqGrid("getGridParam", "selarrrow"),
                    rowData = $("#yhgl_gridtable").jqGrid("getRowData",selectRows);
                if(selectRows.length == 0){
                    This.layuiAlert('请选中一行，再进行密码重置！', { btn: ['关闭']});
                    return;
                }
                This.resetPasswordPage(layer);
			},
			// add_Jg: function(){
             //    This.yhglUserPage(layer,"配置机构信息","addJg");
			// },
			yhgl_check: function(){
                This.yhglUserPage(layer,"查看用户信息","view");
			},
            yhgl_locking: function(){
                var selectRows = $("#yhgl_gridtable").jqGrid("getGridParam", "selarrrow"),
                    rowData = $("#yhgl_gridtable").jqGrid("getRowData",selectRows);
                if(selectRows.length == 0){
                    This.layuiAlert('请选中一行，再进行锁定！', { btn: ['关闭']});
                    return;
                }
                 This.yhglLocking(layer);
            },
            yhgl_unlock: function(){
                var selectRows = $("#yhgl_gridtable").jqGrid("getGridParam", "selarrrow"),
                    rowData = $("#yhgl_gridtable").jqGrid("getRowData",selectRows);
                if(selectRows.length == 0){
                    This.layuiAlert('请选中一行，再进行解锁！', { btn: ['关闭']});
                    return;
                }
                 This.yhglUnlock(layer);
            }
		};
		
		$('#yhgl_btn .layui-btn').on('click', function(){
		    var clickBtn = $(this), 
		    	dataMethod = clickBtn.data('method');
            console.log("btn",dataMethod);
		    active[dataMethod] ? active[dataMethod].call(this, clickBtn) : '';
		});
	});
	
	this.selectChange();
};
/**
 * 已选角色-全部角色切换按钮事件
 */
GAG.ios.user_manager.prototype.selectChange = function (){
	 //移到右边
    $('#btn_add_role').click(function(){ //获取选中的选项，删除并追加给对方
        $('#all_roles option:selected').appendTo('#select_roles');
        return false;
    });
    //移到左边
    $('#btn_remove_role').click(function(){
        $('#select_roles option:selected').appendTo('#all_roles');
        return false;
    });
    
    //全部移到右边
    $('#btn_add_all_role').click(function(){
        //获取全部的选项,删除并追加给对方
        $('#all_roles option').appendTo('#select_roles');
        return false;
    });
    //全部移到左边
    $('#btn_remove_all_role').click(function(){
        $('#select_roles option').appendTo('#all_roles');
        return false;
    });
    //双击选项，移到右边
    $('#all_roles').dblclick(function(){
        $("option:selected",this).appendTo('#select_roles');
        return false;
    });
    //双击选项，移到左边
    $('#select_roles').dblclick(function(){
       $("option:selected",this).appendTo('#all_roles');
        return false;
    });
};
/**
 * @Describe 初始化列表展示
 */
GAG.ios.user_manager.prototype.initGrid = function (){
	var This= this;
    $("#yhgl_gridtable").jqGrid(This.defaultGridConfig).trigger('reloadGrid');
    setTimeout(function(){
        window.GAG.ios.common.updatePagerIcons($("#yhgl_gridtable"));//加载底部栏图标
    }, 0);
    window.GAG.ios.common.resizeJqGrid("yhgl_gridtable");
	$("#yhgl_gridtable").jqGrid().trigger('reloadGrid');
};
/**
 * @Describe 用户信息查询
 */
GAG.ios.user_manager.prototype.yhglQuery = function (layer){
    var $ = layui.jquery,
        layer = layui.layer;
	$("#yhgl_gridtable").setGridParam({
		// page : 1,
		url : window.BASE_API_URL +"sysUser/querySysUserPage.do",
		datatype : 'json',
		postData : this.getQueryMap(),
		gridComplete : function(){
			layer.closeAll("loading");						
		}		
	}).trigger('reloadGrid');
};
/**
 * 获取主界面查询条件
 */
GAG.ios.user_manager.prototype.getQueryMap = function (){
	var rnMap = {};
    rnMap["pageIndex"] = 1;
    rnMap["pageSize"] = 10;
	rnMap["deptId"] = $.trim($("#organId").val());//组织机构
	rnMap["userId"] = $.trim($("#txt_yhid").val()); //登录账号
	rnMap["lockStatus"] = $.trim($("#select_sdbj option:selected").val());//锁定标记
	// rnMap["yxbz"] = $.trim($("#select_yxbz").val());//有效
	return rnMap;
}

//隐藏机构树
GAG.ios.user_manager.prototype.hideTree = function () {
    $('.layui-layer').on('click',function (e) {
        if (!$(e.target).hasClass('jstree-icon')) {
            $('.yhTree-init').hide();
        }
    });
};
//清空上级机构
GAG.ios.user_manager.prototype.clearOrg = function () {

    var txt_bm_mc1 = $("#txt_bm_mc1").val();//上级机构名称
    if(!txt_bm_mc1){
        $("#txt_bm_id1").val('');
        // $('#mparentDeptCode').val('');
        // $('#mtaxNo').val('');
        // $('#mparentTaxNo').val('');
    }
};

//获取机构树
GAG.ios.user_manager.prototype.getOrgTree = function () {
    $('.yhTree-init').show();
    $.ajax({
        url : window.BASE_API_URL + "index/initSysDeptList.do",
        type : 'post',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        dataType : 'json',
        data:{
            type: '1'
        },
        success : function(data) {
            if (data.status == 'T') {
                window.location.href = '/login.html';
                return;
            }
            if (data.status == 'F') {
                layer.msg(data.msg, {zIndex: layer.zIndex});
                return;
            }
            $('.yhTree-init').show();
            var result = [];
            var list = data.data.sysDeptList;
            var length = list.length;
            for (var i = 0; i < length; i++) {
                result.push({
                    'id' : list[i].id,
                    'name' : list[i].deptName,
                    'parentId' : list[i].parentId == '-1' ?  '#' : list[i].parentId,
                    'parent' : list[i].parentId == '-1' ?  '#' : list[i].parentId,
                    'text' : list[i].deptName,
                    'state': {'selected': false,"opened": false}
                });

            }
            $('.yhTree-init').jstree({
                'core' : {
                    'data' : result
                }
            });
            $('.yhTree-init').on('changed.jstree',function (e,data) {
                $('#txt_bm_mc1').val(data.node.text);
                $('#txt_bm_id1').val(data.node.id);
            });
        }
    });
};



/**
 * @Describe 用户信息界面
 */
GAG.ios.user_manager.prototype.yhglUserPage = function (layer,title,btn){
	var This = this;
    var $ = layui.jquery,
        layer = layui.layer;
    if(btn == "add"){
		$("#yhgl_username").attr("disabled",false);
        $("#yh_password").show();
        This.addmodInit();//界面元素操作
        This.initAddPage();
	}else if(btn == "modify"){

		var selectRows = $("#yhgl_gridtable").jqGrid("getGridParam", "selarrrow"),
			rowData = $("#yhgl_gridtable").jqGrid("getRowData",selectRows);
		if($.trim(rowData.id) == "admin"){
            This.layuiAlert("系统管理员账号不允许修改 !");
			return;
		}else{
			if(selectRows.length!=1){
                This.layuiAlert('请选中一行，再进行编辑！', { btn: ['关闭']});
                return;
			}
		}
        This.addmodInit();//界面元素操作
        $("#yhgl_login").attr("readonly","true");
        This.initModifyCheckPage("modify");
	}else if(btn == "view"){
        var selectRows = $("#yhgl_gridtable").jqGrid("getGridParam", "selarrrow"),
            rowData = $("#yhgl_gridtable").jqGrid("getRowData",selectRows);
        if (selectRows.length != 1) {

            This.layuiAlert('请选中一行，再进行查看！', {btn: ['关闭']});
            return;

        }

		$("#yhgl_login").attr("readonly","true");
        $("#txt_bm_mc1").attr("readonly","true");
		$("#yhgl_realname").attr("readonly","true");
		$("#mdeptName").attr("disabled","disabled");//数据权限
		$("#yhgl_kpd").attr("disabled","disabled");
		$("#yh_sx").attr("disabled","disabled");

		$("#yh_sd").attr("readonly","true");
		$("#yh_zhyxq").attr("readonly","true");
		$("#yh_email").attr("readonly","true");
		$("#yh_phone").attr("readonly","true");
		$("#yh_dialogDescription").attr("disabled","true");
		$("#all_roles").attr("disabled","true");
		$("#select_roles").attr("disabled","true");

        This.initModifyCheckPage("");
	}else{
        This.initAddJgPage();
	}
	if(btn == 'view'){
        var userPage = layer.open({
            type: 1,
            title: "<big>" + title + "</big>",
            area: ['760px','530px'],
            shade: [0.3, '#393D49'],
            shadeClose: false,
            maxmin: true,
            resize: true,//是否允许拉伸
            content: btn != "addJg" ? $('#yhgl_userPage') : $('#yhgl_addJg'),
            btn: ['<big>关闭</big>'] ,
            yes: function(){
                if(btn != "view"){
                    This.userOperate(layer,userPage,btn);
                }else{
                    layer.close(userPage);
                    This.emptyPage();//初始化用户信息界面
                }
            },
            btn2: function(){//取消按钮
                This.emptyPage();//初始化用户信息界面
                layer.closeAll();

            },
            cancel: function(){ //右上角关闭按钮
                This.emptyPage();//初始化用户信息界面

            },
            //closeBtn: 2,关闭按钮样式
            //btnAlign: 'l',// 'c' 'r' 按钮排序方式
            zIndex: layer.zIndex, //控制层叠顺序
            success: function(layero,index){//弹层成功回调方法
                // window.GAG.ios.common.resizeJqGrid("yhgl_gridtable");
                layer.setTop(layero); //置顶当前窗口
            }
        });
        return;
    }
	var userPage = layer.open({
		type: 1,
		title: "<big>" + title + "</big>",
		area: ['760px','530px'],
		shade: [0.3, '#393D49'],
		shadeClose: false,
        maxmin: true,
        resize: true,//是否允许拉伸
        content: btn != "addJg" ? $('#yhgl_userPage') : $('#yhgl_addJg'),
        btn: ['<big>保存</big>', '<big>取消</big>'] ,
        yes: function(){  			      	
        	if(btn != "view"){
                This.userOperate(layer,userPage,btn);
        	}else{      		  
        		layer.close(userPage);
                This.emptyPage();//初始化用户信息界面
        	}
        },
        btn2: function(){//取消按钮
            This.emptyPage();//初始化用户信息界面

        },
        cancel: function(){ //右上角关闭按钮      
            This.emptyPage();//初始化用户信息界面

        },
	    //closeBtn: 2,关闭按钮样式
        //btnAlign: 'l',// 'c' 'r' 按钮排序方式
        zIndex: layer.zIndex, //控制层叠顺序
        success: function(layero,index){//弹层成功回调方法
            window.GAG.ios.common.resizeJqGrid("yhgl_gridtable");
        	layer.setTop(layero); //置顶当前窗口
        }
	});
	if(btn == "add"){		
		//bindKpxx(tree.bms[0].nsrsbh,tree.bms[0].ssnsrsbh,"add","","");
	}else if(btn == "modify"){		
		//bindKpxx(rowData.nsrsbh,rowData.ssnsrsbh,"modify",rowData.by1,rowData.by2);
	}
}
/**
 * @Describe 用户界面绑定开票信息
 */
GAG.ios.user_manager.prototype.bindKpxx = function (nsrsbh,ssnsrsbh,btnBind,selfwq,selkpd){
	//用户管理绑定开票服务器信息和开票点信息
	//如果是增加页面
	if(btnBind == "add"){
		if(nsrsbh!=null && nsrsbh!=''){
			//$.jqalert('使用机构对应【销方'+nsrsbh+'】进行绑定开票服务器/开票点信息');
			loadKpfwqList(nsrsbh,'yhgl_kpfwq','yhgl_kpd');
		}else if(ssnsrsbh!=null && ssnsrsbh!=''){
			//$.jqalert('使用机构【所属销方'+ssnsrsbh+'】进行绑定开票服务器/开票点信息');
			loadKpfwqList(ssnsrsbh,'yhgl_kpfwq','yhgl_kpd');
		}else{
			//$.jqalert('税号和所属税号均为空!无法绑定开票服务器和开票点');
			$("#yhgl_kpfwq").empty();
			$("#yhgl_kpd").empty();
		}
	}
	//如果是修改界面
	else if(btnBind == "modify"){
		if(selfwq==null || selfwq=='' || selkpd==null || selkpd==''){
			layuiAlert("之前未绑定开票服务器(开票点),建议您现在绑定！");
		}		
		if(nsrsbh !=null && nsrsbh != ''){
			//$.jqalert('使用机构对应【销方'+nsrsbh+'】进行绑定开票服务器/开票点信息');
			loadKpfwqList(nsrsbh,'yhgl_kpfwq','yhgl_kpd',selfwq);
			if(selfwq != undefined)
				getKpd('yhgl_kpfwq','yhgl_kpd',selkpd);
		}else if(ssnsrsbh !=null && ssnsrsbh != ''){
			//$.jqalert('使用机构【所属销方'+ssnsrsbh+'】进行绑定开票服务器/开票点信息');
			loadKpfwqList(ssnsrsbh,'yhgl_kpfwq','yhgl_kpd',selfwq);
			if(selfwq != undefined)
				getKpd('yhgl_kpfwq','yhgl_kpd',selkpd);
		}else{
			//$.jqalert('税号和所属税号均为空!无法绑定开票服务器和开票点');
			$("#yhgl_kpfwq").empty();
			$("#yhgl_kpd").empty();
		}
	}
}
/**
 * @Describe 清空页面内容
 */
GAG.ios.user_manager.prototype.emptyPage = function (){
    $("#yhgl_login").val("");//登录账号
    $("#txt_bm_mc1").val("");
    $("#txt_bm_id1").val("");//组织机构
    $("#yhgl_realname").val("");//用户名称
    $("#yh_email").val(""); //邮箱
    $("#yh_password").val("123456");//初始密码
    $("#yh_phone").val(""); //电话
    $("#yh_zhyxq").val("");//账号有效期ß
    $("#select_roles").val("");//已选角色
    $("#yh_sd").val("未锁定");//锁定标志
    $("#yh_sd").attr("readonly","true");//锁定标志
    $("#yc_sdyc").val("0");//锁定标志
    $("#all_roles").html("")
    $("#select_roles").html("")


}
/**
 * @Describe 新增-修改界面元素操作
 */
GAG.ios.user_manager.prototype.addmodInit = function (){
	$("#add_modify_tree").css("display","");
	$("#check_tree").css("display","none");
	$("#add_modify_kpxx").css("display","");
	$("#check_kpxx").css("display","none");
	$("#yhgl_realname").removeAttr("disabled");
	$("#add_modify_tree input").attr("disabled",false);
	$("#yhgl_userPage button").attr("disabled",false);
    //$("#yhgl_login").attr("readonly","true");

   // $("#yhgl_realname").attr("readonly","true");
    //$("#yh_sd").removeAttr("readonly");
    $("#yh_zhyxq").removeAttr("readonly");
    $("#txt_bm_mc1").removeAttr("readonly");
    $("#yh_email").removeAttr("readonly");
    $("#yh_phone").removeAttr("readonly");
    $("#yhgl_login").removeAttr("readonly");
    $("#yh_dialogDescription").removeAttr("disabled");
    $("#all_roles").removeAttr("disabled");
    $("#select_roles").removeAttr("disabled");
};
/**
 * @Describe 新增界面信息初始化
 */
GAG.ios.user_manager.prototype.initAddPage = function (){
    var This = this;
	This.emptyPage();
	$.ajax({
		url : window.BASE_API_URL +"sysRole/initSysRoleList.do",
		type : 'post',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
		dataType : 'json',
		//data: This.getQueryMap(),
		success : function(data) {
			$.each(data.data, function(i,item){
				$("#all_roles").append("<option value="+item.id+">"+item.roleName+"</option> ");
			});
	    }
	});
    $.ajax({
        url : window.BASE_API_URL +"billingPointInfo/queryTaxBillingPointInfoList.do",
        type : 'post',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        dataType : 'json',
        //data: This.getQueryMap(),
        success : function(data) {
            $.each(data.data, function(i,item){
                $("#yhgl_kpd").append("<option value="+item.billingNo+">"+item.billingPointName+"</option> ");
            });
        }
    });
};
GAG.ios.user_manager.prototype.getTree = function (item,result) {
    var This = this;
    if(item.length > 0){
        item.forEach(function (el,index) {
            result.push({
                'id' : el.id,
                'name': el.authName,
                'parentId': el.parentId,
                'parent' : el.parentId == '0' ? '#' : el.parentId,
                'text' : el.authName,
                'state': {'selected': false,"opened": false}
            });
        });
    }
};
/**
 * @Describe 修改-查看界面信息初始化
 */
GAG.ios.user_manager.prototype.initModifyCheckPage = function (modifycheck){
    var This = this;
    This.emptyPage();
	var selectRows = $("#yhgl_gridtable").jqGrid("getGridParam", "selarrrow"),

		rowData = $("#yhgl_gridtable").jqGrid("getRowData",selectRows);
    $(".password").hide();

	$.ajax({
        url : window.BASE_API_URL +"sysUser/querySysUserDetil.do",
        type : 'post',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        dataType : 'json',
        data:{"userId" : rowData.userId},
        success : function(data){
        	console.log("data11111",data);
        	var data = data.data;
            $("#yhgl_login").val(data.userId);
            $("#yhgl_realname").val(data.userName);
            //$("#mdeptName option:selected").val(data.userAuthType); //数据权限
            if(data.userAuthType == "1"){
                $("#mdeptName option[value='1']").attr("selected","selected");
            }else if(data.userAuthType == "0"){
                $("#mdeptName option[value='0']").attr("selected","selected");
            }else if(data.userAuthType == "2"){
                $("#mdeptName option[value='2']").attr("selected","selected");
            }
            $("#yh_sex option:selected").val(data.gender);
            $.ajax({
                url : window.BASE_API_URL +"billingPointInfo/queryTaxBillingPointInfoList.do",
                type : 'post',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                dataType : 'json',
                //data: This.getQueryMap(),
                success : function(data) {
                    $.each(data.data, function(i,item){
                        $("#yhgl_kpd").append("<option value="+item.billingNo+">"+item.billingPointName+"</option> ");
                    });
                }
            });
            $("#yhgl_kpd option[value='"+data.invoiceAddrNo+"']").attr("selected","selected");
            $("#yh_zhyxq").val(data.validDate);
            $("#yh_password").val(data.password);
            if(data.userType == "1"){
                $("#yh_sx option[value='1']").attr("selected","selected");
			}else if(data.userType == "0"){
                $("#yh_sx option[value='0']").attr("selected","selected");
			}else if(data.userType == "2"){
                $("#yh_sx option[value='2']").attr("selected","selected");
			}
            $("#yh_dialogDescription").val(data.description);
            $("#yh_email").val(data.email);//邮箱
            $("#yh_phone").val(data.mobile)
            $.each(data.sysRoleList, function(i,item){
                $("#select_roles").append("<option value="+item.id+">"+item.roleName+"</option> ");
            });

            $("#txt_bm_mc1").val(data.deptName);
            $("#txt_bm_id1").val(data.deptId);

            if(data.lockStatus == 0){
                $("#yh_sd").val("未锁定");
                $("#yh_sd").attr("readOnly","true");
                $("#yc_sdyc").val("0");
            }else{
                $("#yh_sd").val("已锁定");
                $("#yh_sd").attr("readOnly","true");
                $("#yc_sdyc").val("1");
            }

            //$("#userBind").val('true');
            if(modifycheck == "modify"){

            }

            $.ajax({
                url : window.BASE_API_URL +"sysRole/initSysRoleList.do",
                type : 'post',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                dataType : 'json',
                //data:{"userId" : rowData.userId},
                success : function(data){
                    $.each(data.data, function(i,item){
                        $("#all_roles").append("<option value="+item.id+">"+item.roleName+"</option> ");
                    });
                }
            });
        }
	})

};
/**
 * @Describe 配置机构信息界面
 */
GAG.ios.user_manager.prototype.initAddJgPage = function (layer){
    var This = this;
	var selectRows = $("#yhgl_gridtable").jqGrid("getGridParam", "selarrrow"),
		rowData = $("#yhgl_gridtable").jqGrid("getRowData",selectRows);
 	if($.trim(rowData.yhid) == "admin"){
 		layuiAlert("系统管理员账号不允许修改!");
	}else{
		$.ajax({
			url : "../../qxgl/user/chaZzjgs.action",
			data : {'yhid': rowData.yhid},
			type : 'post',
			dataType : "json",
			success : function(data){
				var zTree = $.fn.zTree.getZTreeObj('BmTree14');
				for(var i in data){
					var node = zTree.getNodeByParam("id", i);
					node.checked = true;
					zTree.updateNode(node);
				}
			},
			error: function(){
                This.layuiAlert("操作失败请联系管理员!");
			}
		}); 			
	}
};
/**
 * @Describe 统一处理用户操作
 */
GAG.ios.user_manager.prototype.userOperate = function (layer,layerId,btn){
	if(btn == "add"){
		this.userAdd(layer,layerId);//新增
	}else if(btn == "modify"){
		this.userModify(layer,layerId);//修改
	}else{
		this.userAddJg(layer,layerId);//配置机构
	}
};
/**
 * @Describe 新增用户信息
 */
GAG.ios.user_manager.prototype.userAdd = function (layer,layerId){
	var This = this;
    var $ = layui.jquery,
        layer = layui.layer;
	var zzjg = $.trim($("#txt_bm_id1").val()); //组织机构
	var sjqx = $.trim($("#mdeptName").val());//数据权限
	var dlzh = $.trim($("#yhgl_login").val());//登录账号
	var yhmc = $.trim($("#yhgl_realname").val());//用户名称
	var sex = $.trim($("#yh_sex option:selected").val());//用户性别
	var yh_email = $.trim($("#yh_email").val());//邮箱
	var yh_phone = $.trim($("#yh_phone").val());//手机号
	var yh_sd = $("#yh_sd").val();//锁定标志

	if(yh_sd = "未锁定"){
        $("#yc_sdyc").val(0);
	}else{
        $("#yc_sdyc").val(1);
	}
	var real_sd = $.trim($("#yc_sdyc").val());

	var yh_zhyxq = $.trim($("#yh_zhyxq").val());//账号有效期
	var yh_password = $.trim($("#yh_password").val());//用户密码
	var yh_sx = $.trim($("#yh_sx option:selected").val());//用户属性
	var yh_dialogDescription = $.trim($("#yh_dialogDescription").val());//描述


    $.ajax({
        url : window.BASE_API_URL +"sysRole/initSysRoleList.do",
        type : 'post',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        dataType : 'json',
        //data: This.getQueryMap(),
        success : function(data) {
            $.each(data.data, function(i,item){
                $("#yhgl_kpd").append("<option value="+item.id+">"+item.roleName+"</option> ");
            });
            // var result = [];
            // This.getTree(data.data,result);
            // $('#dialogMenuTree').jstree({
            //     'core' : {
            //         'data' : result
            //     },
            //     "plugins" : [
            //         "checkbox"
            //     ]
            // });
        }
    });
    var yhgl_kpd = $.trim($("#yhgl_kpd option:selected").val());//开票点


    var length = This.strlen(yhmc);
	if($.trim(dlzh) == ""){
        This.layuiAlert("登录账号为必填项，请您录入信息！");
		return false;
	}
	if($.trim(yhmc) == ""){
        This.layuiAlert("用户名称为必填项，请您录入信息！");
		return false;
	}
	if(window.GAG.ios.tool.getELength(dlzh)>30 || window.GAG.ios.tool.getELength(dlzh) < 10){
        This.layuiAlert("登录账号字符数不能小于10个字符并且不能大于30个字符，请重新输入！");
		return false;
	}	
	if(Number(length)>Number(10)){
        This.layuiAlert("用户名称不能超过10个字符，请重新输入！");
		return false;
	}
	var jsidlist = "";
	$('#select_roles'+' option').each(function(){
		jsidlist += $(this).attr("value")+",";
	});
	jsidlist = jsidlist.substring(0,jsidlist.length-1);
    //console.log("rrrrr",jsidlist)
	var roleIdArr;
    roleIdArr = jsidlist.split(",");
	//console.log("arr",roleIdArr);
	var map = {};
	map["userId"]=dlzh;
	map["userName"]=yhmc;
	map["deptId"]=zzjg;
	map["userAuthType"]=sjqx;//数据权限
	map["lockStatus"]=real_sd;
	map["gender"]=sex;
	map["email"]=yh_email;
	map["mobile"]=yh_phone;
	map["invoiceAddrNo"]=yhgl_kpd;
    map["invoiceServerNo"]=yhgl_kpd;
	map["validDate"]=yh_zhyxq;
	map["password"]=yh_password;//密码
	map["userType"]=yh_sx;//属性
	map["desciption"]=yh_dialogDescription;//描述
	map["roleIdArr"]=roleIdArr;
	var msgId;
	$.ajax({
		url :  window.BASE_API_URL + "sysUser/addSysUser.do",
		data : map,
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
		type : 'post',
		dataType : 'json',
		beforeSend: function(){
			//msgId = layerMsg("新增用户信息中......");
		},
		success : function(data){
            if(data.status=="T"){
                window.location.href = "login.html";
                return;
			}else{
                // alert(data.msg);
                // layer.msg(data.msg, {zIndex: layer.zIndex});
                layer.closeAll();
                This.layuiAlert(data.msg);
                This.yhglQuery();
            }
		},
		complete: function(){
			 // layer.closeAll();
            // $(".layui-layer-page").css("display", "none");
            // $(".layui-layer-shade").css("display", "none");
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			This.layuiAlert("操作失败请重试！");
	    }
	});	
};
/**
 * @Describe 修改用户信息
 */
GAG.ios.user_manager.prototype.userModify = function (layer,layerId){
    var This = this;
    var $ = layui.jquery,
        layer = layui.layer;
	var selectRows = $("#yhgl_gridtable").jqGrid("getGridParam", "selarrrow"),
		rowData = $("#yhgl_gridtable").jqGrid("getRowData",selectRows);
    var zzjg = $.trim($("#txt_bm_id1").val()); //组织机构
    var sjqx = $.trim($("#mdeptName").val());//数据权限
    var dlzh = $.trim($("#yhgl_login").val());//登录账号
    var yhmc = $.trim($("#yhgl_realname").val());//用户名称
    var sex = $.trim($("#yh_sex option:selected").val());//用户性别
    var yh_email = $.trim($("#yh_email").val());//邮箱
    var yh_phone = $.trim($("#yh_phone").val());//手机号
    var yh_dialogDescription = $.trim($("#yh_dialogDescription").val());//描述
    var yh_sd = $("#yh_sd").val();//锁定标志

    if(yh_sd = "未锁定"){
        $("#yc_sdyc").val(0);
    }else{
        $("#yc_sdyc").val(1);
    }
    var real_sd = $.trim($("#yc_sdyc").val());

    var yh_zhyxq = $.trim($("#yh_zhyxq").val());//账号有效期
    var yh_password = $.trim($("#yh_password").val());//用户密码
    var yh_sx = $.trim($("#yh_sx option:selected").val());//用户属性
    var yhgl_kpd = $.trim($("#yhgl_kpd option:selected").val());//开票点

    var length = This.strlen(yhmc);
	if(window.GAG.ios.tool.getELength(dlzh)>30 || window.GAG.ios.tool.getELength(dlzh) < 10){
        This.layuiAlert("登录账号字符数不能大于30且不能小于10，请重新输入！");
		return false;
	}	
	// if(Number(length)>Number(10)){
	if(window.GAG.ios.tool.getELength(length)>10){
        This.layuiAlert("用户名称不能超过10个字符，请重新输入！");
		return false;
	}
	if($.trim(dlzh)==""){
        This.layuiAlert("登录账号为必填项，请您录入该信息！");
		return false;
	}
	if($.trim(yhmc)==""){
        This.layuiAlert("用户名称为必填项，请您录入该信息！");
		return false;
	}
	var jsidlist = "";
	$('#select_roles option').each(function() {
		jsidlist += $(this).attr("value")+",";
	});
	jsidlist = jsidlist.substring(0,jsidlist.length-1);
    var roleIdArr;
    roleIdArr = jsidlist.split(",");
	var map = {},msgId;
    map["userId"]=dlzh;
    map["userName"]=yhmc;
    map["deptId"]=zzjg;
    map["userAuthType"]=sjqx;//数据权限
    map["lockStatus"]=real_sd;
    map["gender"]=sex;
    map["email"]=yh_email;
    map["mobile"]=yh_phone;
    map["invoiceServerNo"]=yhgl_kpd;
    map["invoiceAddrNo"]=yhgl_kpd;
    map["validDate"]=yh_zhyxq;
    map["password"]=yh_password;//密码
    map["desciption"]=yh_dialogDescription;//描述
    map["userType"]=yh_sx;//属性
    map["roleIdArr"]=roleIdArr;

    //map["jsidlist"]=jsidlist;
	//map["jgId"]=jgId;
	
	var jgId = rowData.qx_bmid,
		data_yhid = rowData.yhid;
	
	$.ajax({
		url : window.BASE_API_URL + "sysUser/editSysUser.do",
		data : map,
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
		type : 'post',
		dataType : 'json',
		beforeSend: function(){
			// msgId = layerMsg("修改用户信息中......");
		},
		success : function(data){
			if(data.status=="T"){
                window.location.href = "login.html";
                return;
			}else {
                layer.closeAll();
                This.layuiAlert(data.msg);
                This.yhglQuery();
            }
		},
		complete: function(){
			// layer.closeAll();

		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
            This.layuiAlert("操作失败!");
	    }
	});
};
/**
 * @Describe 配置机构信息
 */
GAG.ios.user_manager.prototype.userAddJg = function (layer,layerId){
	var menuTree = $.fn.zTree.getZTreeObj("BmTree14");
	var checkNode = menuTree.getCheckedNodes(true);
	var id = $("#yhgl_gridtable").jqGrid("getGridParam", "selrow");
	var rowData = $("#yhgl_gridtable").jqGrid("getRowData", id);
	var yhid = rowData.yhid;
	var treeData = [];
	for(var i=0;i<checkNode.length;i++){
		treeData.push(checkNode[i].id);
	}
	treeData = treeData.toString();
	$.ajax({
		type:'POST',
		url:'../../qxgl/user/addZzjg.action',
		dataType : 'json',
		data:{
			'yhid':yhid,
			'treeData':treeData
		},
		success : function(data) {
			if(data.returnCode == 0){
				ajaxSuccessAlert(data.returnMsg);
			}else if(data.returnCode == 1){
				layuiAlert(data.returnMsg);
			}else{
				layuiAlert(data.returnMsg);
			}
			return;
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
  			//window.top.AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
  			layuiAlert("配置机构信息失败！");
  		}
	});
};
/**
 * @Describe 删除用户信息
 */
GAG.ios.user_manager.prototype.yhglDelete = function (layer){
	var This = this;
    var $ = layui.jquery,
        layer = layui.layer;
    var rowData = $("#yhgl_gridtable").jqGrid("getGridParam", "selarrrow");
	layer.confirm('<big>您确定要删除这 '+ rowData.length +' 条用户信息吗？</big>', {icon: 3, title:'<span style="color:#2679b5;"><big>提示信息</big></span>'},
		function(index){
			$.ajax({
				type:'POST',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
				url: window.BASE_API_URL + "sysUser/deleteSysUser.do",
				data: {
					userIdArr : rowData
				},
				dataType : 'json',
				async: false,
				globle: false,
				beforeSend: function(){
					//msgId = layerMsg("删除外网地址信息中......");
				},
				success: function(data){
					 if(data.status == "S"){
						$("#yhgl_gridtable").trigger("reloadGrid");
                         This.ajaxSuccessAlert("删除成功，共删除 "+rowData.length+" 条用户信息 !");
					}else if(data.status == "F"){
                         This.ajaxSuccessAlert(data.msg);
					}else if(data.status == "T"){
                         window.location.href = '/login.html';
                     }
				},
				complete: function(){
					 layer.close(msgId);
				},
				error: function(XMLHttpRequest, textStatus, errorThrown){
				    //layuiAlert("操作失败!");
                    This.ajaxSuccessAlert("操作失败!");
			    }
			});
		});	
};
/**
 * @Describe 重置密码信息界面
 */
GAG.ios.user_manager.prototype.resetPasswordPage = function (layer){
    var This = this;
    var $ = layui.jquery,
        layer = layui.layer;
    var selectRows = $("#yhgl_gridtable").jqGrid("getGridParam", "selarrrow");
    console.log("selectRows",selectRows);
	layer.confirm('<big>您确定要重置这 '+ selectRows.length +' 条用户密码信息吗？</big>', {icon: 3, title:'<span style="color:#2679b5;"><big>提示信息</big></span>'},
		function(index){
			$.ajax({
				type:'POST',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                url: window.BASE_API_URL + "sysUser/resetPassword.do",
				data: {
                    userIdArr : selectRows
                },
				dataType : 'json',
				async: false,
				globle: false,
				beforeSend: function(){
					// msgId = layerMsg("重置信息中......");
				},
				success: function(data){						
					if(data.status == "S"){  //重置成功提示
                        This.ajaxSuccessAlert("重置成功，共重置  "+selectRows.length+" 条用户密码信息!");
					}else if(data.status == "F"){
                        This.layuiAlert(data.msg);
					}			
				},
				complete: function(){
                    layer.close(msgId);
				},
				error: function(XMLHttpRequest, textStatus, errorThrown){
                    This.layuiAlert("操作失败!");
			    }
			});
	});
};

//锁定用户
GAG.ios.user_manager.prototype.yhglLocking = function (layer){
    var This = this;
    var $ = layui.jquery,
        layer = layui.layer;
    var selectRows = $("#yhgl_gridtable").jqGrid("getGridParam", "selarrrow");
    var rowData =  $("#yhgl_gridtable").jqGrid("getRowData",selectRows);
    var yhids = "";
    yhids = yhids + rowData.userId + ",";


    yhids = yhids.substring(0,yhids.length-1);
    layer.confirm('<big>您确定要锁定这 '+ selectRows.length +' 条用户信息吗？</big>', {icon: 3, title:'<span style="color:#2679b5;"><big>提示信息</big></span>'},
        function(index){
            var queryMap = [],msgId;
            queryMap.push(rowData.userId) ;
            $.ajax({
                type:'POST',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                url: window.BASE_API_URL + "sysUser/lockSysUser.do",
                data: {
                    userIdArr : selectRows
                },
                dataType : 'json',
                async: false,
                globle: false,
                beforeSend: function(){
                    //msgId = layerMsg("删除外网地址信息中......");
                },
                success: function(data){
                    if(data.status == "S"){
                        $("#yhgl_gridtable").trigger("reloadGrid");

                    }else if(data.status == "F"){
                        This.ajaxSuccessAlert(data.msg);
                        //layer.msg("锁定用户失败!");
                    }
                },
                complete: function(){
                    layer.close(msgId);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    //layuiAlert("操作失败!");
                    This.ajaxSuccessAlert("操作失败!");
                }
            });
        });
};


//解锁用户
GAG.ios.user_manager.prototype.yhglUnlock = function (layer){
    var This = this;
    var selectRows = $("#yhgl_gridtable").jqGrid("getGridParam", "selarrrow");
    var rowData =  $("#yhgl_gridtable").jqGrid("getRowData",selectRows);
    var yhids = "";
    yhids = yhids + rowData.userId + ",";


    yhids = yhids.substring(0,yhids.length-1);
    layer.confirm('<big>您确定要锁定这 '+ selectRows.length +' 条用户信息吗？</big>', {icon: 3, title:'<span style="color:#2679b5;"><big>提示信息</big></span>'},
        function(index){
            var queryMap = [],msgId;
            queryMap.push(rowData.userId) ;
            $.ajax({
                type:'POST',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                url: window.BASE_API_URL + "sysUser/unLockSysUser.do",
                data: {
                    userIdArr : selectRows
                },
                dataType : 'json',
                async: false,
                globle: false,
                beforeSend: function(){
                    //msgId = layerMsg("删除外网地址信息中......");
                },
                success: function(data){
                    if(data.status == "S"){
                        $("#yhgl_gridtable").trigger("reloadGrid");
                        This.ajaxSuccessAlert("锁定成功，共锁定 "+selectRows.length+" 条用户信息 !");
                    }else if(data.status == "F"){
                        This.ajaxSuccessAlert(data.msg);
                    }
                },
                complete: function(){
                    layer.close(msgId);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    //layuiAlert("操作失败!");
                    This.ajaxSuccessAlert("操作失败!");
                }
            });
        });
};



/**
 * 返回字符串的实际长度, 一个汉字算2个长度 
 */
GAG.ios.user_manager.prototype.strlen = function (str){
	return str.replace(/[^\x00-\xff]/g, "**").length; 
};
/**
 * 获取是否需要切换多个机构标识
 */
GAG.ios.user_manager.prototype.jgcheck = function (){
	$.ajax({
		url:"../../login/jgCheck.action",
		type:"post",
		async:false,
		dataType:'json',
		success:function(data){
			isjg = data.jg;
			if(isjg == "0"){
				$("#add_Jg").remove();
			}
		}
	});
};
/**
 * @Describe 初始化配置界面机构树
 */
GAG.ios.user_manager.prototype.initZtree = function (){
	var bms=window.top["GlobalBmList"];
	var setting = {
		view : {
			selectedMulti: true	//单选
		},
		check: {
			enable: true,
			chkboxType :{ "Y" : "", "N" : "" }
		},
		data : {
			key: {
				name: "bmmc"		//将哪一个属性显示
			},
			simpleData : {
				enable : true,		//简单数据，保持Array，不需要转换为嵌套的JSon
				idKey:   "id",		//关键字字段属性名
				pIdKey:  "sjbmid"	//父节点字段属性名
			}
		}
	};
	$.fn.zTree.init($("#BmTree14"), setting, bms);//调用JQuery的zTree框架初始化树形数据	
};
/**
 * @Describe ajax请求beforeSend（遮罩层）
 */
GAG.ios.user_manager.prototype.layerMsg = function (msg){
	var msgId = layer.msg('<big>' +msg+ '</big>', {
		icon: 16,
		shade: 0.5,
   		title: '<span style="color:#2679b5;"><big>提示信息</big></span>',
		time: 1000000,
		zIndex: layer.zIndex
	});
	return msgId;
};
/**
 * @Describe ajax成功信息提示
 */
GAG.ios.user_manager.prototype.ajaxSuccessAlert = function (alertMsg,layerId){
	layer.close(layerId);			
	layer.alert('<big>'+ alertMsg +'</big>', {
   		icon: 6,
   		title: '<span style="color:#2679b5;"><big>提示信息</big></span>',
   		skin: 'layer-ext-moon', //该皮肤由layer.seaning.com友情扩展。
		zIndex: layer.zIndex
	});
};
/**
 * @Describe alert提示
 */
GAG.ios.user_manager.prototype.layuiAlert = function layuiAlert(alertMsg){
	layer.alert('<big>'+ alertMsg +'</big>', {
   		icon: 0,
   		title: '<span style="color:#2679b5;"><big>提示信息</big></span>',
   		skin: 'layer-ext-moon', //该皮肤由layer.seaning.com友情扩展。
		zIndex: layer.zIndex
	});
};
