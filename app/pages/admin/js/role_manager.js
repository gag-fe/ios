// require('../../../js/config');
GAG.ios.role_manager = function() {
    // this.setting = {
    //     async : {
    //         url : "",
    //         enable : true,
    //         type : "post"
    //     },
    //     check : {
    //         enable : true
    //     },
    //     data : {
    //         key : {
    //             name : "authName"
    //         },
    //         simpleData : {
    //             enable : true,
    //             idKey : "id",
    //             pIdKey : "parentId",
    //             rootPId : 0
    //         }
    //     }
    // };
	this.colMap = {
        //colNames : ['roleid','jszt','bmid','角色名称','角色id','角色状态','操作','组织机构','角色描述', '创建人', '创建时间'],
        colNames : ['id','','角色名称','组织机构','角色属性','角色状态','角色描述', '操作','创建时间'],
        colModel : [
            {name:'id',index:'id', width:"10%",hidden:true},
            {name:'deptId',index:'deptId', width:"10%",hidden:true},
            {name:'roleName',index:'roleName', width:"13%",align:'center',sortable:true},
            {name:'deptName',index:'deptName', width:"18%",align:'center',sortable:false},
            {name:'roleType',index:'roleType', width:"13%",align:'center',sortable:false,formatter(cellvalue, options, rowObject){
                if(cellvalue == 1){
                    return "机构角色"
				}else{
                	return "系统角色"
				}
			}},

            {name:'status',index:'status', width:"15%",align:'center',sortable:false,formatter(cellvalue, options, rowObject){
                 if(cellvalue == 1){
					 return "启用"
				 }else{
                     return "禁用"
				 }

            }},
            {name:'description',index:'description', width:"30%",align:'center',sortable:false},
            {
                name: '操作',width: '20%', align: 'center', formatter: function (value,gird,rows,state) {
                	// return  "<a href='#' class='btn_look' style='display: inline-block;
				// width: 19px;height: 20px;margin: 0 4px' onclick='' >" + "<img src='../../image/action1.jpg' width='19px' height='20px'>" + "</a>" + "<a href='#' style='display: inline-block;margin: 0 4px'>" + "<img src='../../image/action2.jpg' width='19px' height='20px'>" + "</a>" + "<a href='#' style='display: inline-block;margin: 0 4px'>" + "<img src='../../image/action3.jpg' width='19px' height='20px'>" + "</a>"
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
            {name:'createTime',index:'createTime', width:"22%",align:'center',sortable:true,sortorder:'desc',formatter: function (value,gird,rows,state){
                return new Date(value).Format("yyyy-MM-dd hh:mm:ss")
			}}
        ]};
    this.defaultGridConfig = {
        ajaxGridOptions: {
            url: window.BASE_API_URL + "sysRole/querySysRolePage.do",
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
        width : $(window).width()*0.98,
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
//		onSelectRow: function (rowid){ //控制选中行与未选中行时修改或者删除按钮的显示效果
//			var selectRows = $("#wwdz_gridtable").jqGrid("getGridParam", "selarrrow");
//			if(selectRows.length == 1){
//				$("#wwdz_modify").removeClass("layui-btn-disabled");
//				$("#wwdz_delete").removeClass("layui-btn-disabled");
//			}else if(selectRows.length > 1){
//				$("#wwdz_modify").addClass("layui-btn-disabled");
//				$("#wwdz_delete").removeClass("layui-btn-disabled");
//			}else{
//				$("#wwdz_modify").addClass("layui-btn-disabled");
//				$("#wwdz_delete").addClass("layui-btn-disabled");
//			}
//        },
//        onSelectAll: function (rowids){//控制选中行与未选中行时修改或者删除按钮的显示效果
//			var selectAllRows = $("#wwdz_gridtable").jqGrid("getGridParam", "selarrrow");
//			if(selectAllRows.length == 1){
//				$("#wwdz_modify").removeClass("layui-btn-disabled");
//				$("#wwdz_delete").removeClass("layui-btn-disabled");
//			}else if(selectAllRows.length > 1){
//				$("#wwdz_modify").addClass("layui-btn-disabled");
//				$("#wwdz_delete").removeClass("layui-btn-disabled");
//			}else{
//				$("#wwdz_modify").addClass("layui-btn-disabled");
//				$("#wwdz_delete").addClass("layui-btn-disabled");
//			}
//        },
        jsonReader:{
            page:"data.pageIndex",
            root: "data.rows",
            total: function (obj) {
                return Math.ceil(obj.data.total/obj.data.pageSize);
            },
            records:"data.total",
            id: "id",//设置返回参数中，表格ID的名字为blackId
            repeatitems : true
        },
        pager:'#wwdz_pager'
    };
};
GAG.ios.role_manager.prototype.init = function () {
    this.hideTree();
    this.initButton();//初始化按钮
    this.initGrid();//初始化界面
	initAisinoCheck("xz_wwdz_form");//初始化这个form的校验

};

//获取查询参数，只提交有用数据
GAG.ios.role_manager.prototype.getQueryMap = function() {
	var rtnMap = {};
	rtnMap["pageIndex"] = 1;
	rtnMap["pageSize"] = 10;
	rtnMap["deptId"] = $.trim($("#organId").val());
	rtnMap["roleName"] = $.trim($("#jsmc").val());
	rtnMap["roleType"] = $.trim($("#js_wzlx option:selected").val());
	return rtnMap;
};
//初始化按钮
GAG.ios.role_manager.prototype.initButton = function (){
	var This = this;
	layui.use('layer',function(){
		var $ = layui.jquery,
		layer = layui.layer;		
		var active = {
			//查询
			btn_query: function(){
                This.queryAllRoleByPage();
			},
			//新增
			btn_add: function(){
                This.openAddDialog();
                //创建树之前销毁树
                $.jstree.destroy('#dialogMenuTree');
				var that = this;
				var addWwdz = layer.open({
					type: 1,
					title: "<big>角色管理-新增</big>",
					area: ['800px','auto'],
					shade: [0.6, '#393D49'],
					shadeClose: false,
			        maxmin: true,
			        resize: false,//是否允许拉伸
			        content: $('#xz_wwdz'),
			        btn: ['保存', '取消'] ,//只是为了演示
			        yes: function(){
						if($.trim($("#dialogRoleName").val())==""){
							layer.msg('角色名称不能为空！', {zIndex: layer.zIndex});
							$("#dialogRoleName").focus();
							return false;
						}
						else if( window.GAG.ios.tool.getELength($.trim($("#dialogRoleName").val())) < 4 || window.GAG.ios.tool.getELength($.trim($("#dialogRoleName").val())) > 50){
							layer.msg('请输入长度为4~50位角色名称！', {zIndex: layer.zIndex});
							$("#dialogRoleName").focus();
							return false;
						}
						if( window.GAG.ios.tool.getELength($.trim($("#dialogDescription").val()))>500 ){
						layer.msg('角色描述不能大于500个字符，请重新录入！', {zIndex: layer.zIndex});
						$("#dialogDescription").focus();
						return false;
					}
                        var nodeObj = $('#dialogMenuTree').jstree().get_checked(true);
                        var Arr = [];
                        for(var i=0; i< nodeObj.length; i++){
                            Arr.push(nodeObj[i].id);
                        }
						$.ajax({
							url :  window.BASE_API_URL + "sysRole/addSysRole.do ",
                            xhrFields: {
                                withCredentials: true
                            },
                            crossDomain: true,
							data : {
                                 "roleName" : $.trim($("#dialogRoleName").val()),//角色名称
								 "deptId" : $.trim($("#bmmc_id").val()),//组织机构
								 "description" : $.trim($("#dialogDescription").val()),//描述
								 "status" : $.trim($("#jszt input:checked").val()),//状态
								 "roleType" : $.trim($("#jssx option:selected").val()),
								 "authIdArr" : Arr
							},
							type : 'post',
							dataType : 'json',beforeSend: function(){
								$("#bgFilter").css("display", "block");
								$("#loadingProgress").css("display", "block");
							},
							success : function(data) {
								if(data.status=="S"){
									layer.msg('添加角色成功!', {zIndex: layer.zIndex});
									$(this).removeAttr("disabled");
                                    This.queryAllRoleByPage();
								}else if (data.status=="F") {
									layer.msg(data.msg, {zIndex: layer.zIndex});
									$(this).removeAttr("disabled");
								} else if (data.status=="T") {
                                    window.location.href = "index.html";
								}
							},
							complete: function(){
								$("#bgFilter").css("display", "none");
								$("#loadingProgress").css("display", "none");
							},
							error: function(XMLHttpRequest, textStatus, errorThrown){
								$(this).removeAttr("disabled");
								$(this).attr("disabled", false);
								layer.msg('操作失败!', {zIndex: layer.zIndex});
							}
						});
//			        	var checkResult = checkAisinoForm("xz_wwdz_form");
//			      	    if(checkResult == false)
//			      	    	return false;//校验不通过，提示错误信息
                        This.wwdzAdd(layer,addWwdz);
			        },
			        btn2: function(){
			        	layer.closeAll();
			        	$("input[name='res']").click(); 
			        	//$("#xz_wwdz_form").reset();
			        },
			        zIndex: 1000, //控制层叠顺序
			        success: function(layero){
			        	layer.setTop(layero); //置顶当前窗口
			        }
				});
			},
			//编辑
			btn_edit: function(){
				// var selectRows = $("#wwdz_gridtable").jqGrid("getGridParam", "selarrrow");
                var selectRows = $("#wwdz_gridtable").jqGrid("getGridParam","selarrrow");
                var rowData = $("#wwdz_gridtable").jqGrid("getRowData", selectRows);
                //创建树之前销毁树
                $.jstree.destroy('#dialogMenuTree');
				if(selectRows.length!=1){
					layer.msg('请选中一行，再进行编辑！', { btn: ['关闭']});
					return;
				}
				else{
                    This.openModifyDialog();
					$("#js-title").hide();
					var editWwdz = layer.open({
						type: 1,
						title: "<big>角色管理-编辑</big>",
						area: ['800px','auto'],
						shade: [0.6, '#393D49'],
						shadeClose: false,
				        maxmin: true,
				        resize: true,//是否允许拉伸
				        content: $('#xz_wwdz'),
				        btn: ['保存', '取消'] ,//只是为了演示
				        yes: function(){
						//var menuTree = $.fn.zTree.getZTreeObj("dialogMenuTree");
						//var checkNode = menuTree.getCheckedNodes(true);
						if($.trim($("#dialogRoleName").val())==""){
							layer.msg('角色名称不能为空！', {zIndex: layer.zIndex});
							$("#dialogRoleName").focus();
							return false;
						}
						else if( window.GAG.ios.tool.getELength($.trim($("#dialogRoleName").val())) < 4 || window.GAG.ios.tool.getELength($.trim($("#dialogRoleName").val())) > 50){
							layer.msg('请输入长度为4~50位角色名称！', {zIndex: layer.zIndex});
							$("#dialogRoleName").focus();
							return false;
						}
						if( window.GAG.ios.tool.getELength($.trim($("#dialogDescription").val()))>500 ){
							layer.msg('角色描述不能大于500个字符，请重新录入！', {zIndex: layer.zIndex});
							$("#dialogDescription").focus();
							return false;
						}
                            var nodeObj = $('#dialogMenuTree').jstree().get_checked(true);
                            var Arr = [];
                            for(var i=0; i< nodeObj.length; i++){
                                Arr.push(nodeObj[i].id);
                            }
						$.ajax({
							url : window.BASE_API_URL + "sysRole/editSysRole.do",
                            xhrFields: {
                                withCredentials: true
                            },
                            crossDomain: true,
							data : {
                                "id" : rowData.id,
                                "roleName" : $.trim($("#dialogRoleName").val()),//角色名称
                                "deptId" : $.trim($("#bmmc_id").val()),//组织机构
                                "description" : $.trim($("#dialogDescription").val()),//描述
                                "status" : $.trim($("#jszt input:checked").val()),//状态
                                "roleType" : $.trim($("#jssx option:selected").val()),
                                "authIdArr" : Arr
							},
							type : 'post',
							dataType : 'json',
							beforeSend: function() 
				    		{
				    			$("#bgFilter").css("display", "block");
				    			$("#loadingProgress").css("display", "block");
				    		},
							success : function(data){
								if(data.status=="S"){
									//layer.msg('角色为上级部门所创建，不能修改！', {zIndex: layer.zIndex});
                                    $("#wwdz_gridtable").trigger("reloadGrid");
                                    layer.msg('修改角色成功!', {zIndex: layer.zIndex});
                                    This.queryAllRoleByPage();
								}else if (data.status == "F")
								{
									//layer.msg('子企业的角色，不允许修改!', {zIndex: layer.zIndex});
									layer.msg(data.msg, {zIndex: layer.zIndex});
								} else if(data.status == "T"){
								    //layer.msg('角色名重复!', {zIndex: layer.zIndex});
                                    window.location.href = "index.html";
								}
							},
							complete: function(){
								$("#bgFilter").css("display", "none");
								$("#loadingProgress").css("display", "none");
							},
							error: function(XMLHttpRequest, textStatus, errorThrown) {
								layer.msg('操作失败!', {zIndex: layer.zIndex});
						    }
						});
						This.wwdzAdd(layer,editWwdz);
					},
				        btn2: function(){
							layer.closeAll();
							$("input[name='res']").click(); 
							//$("#xz_wwdz_form").reset();
				        },
				        zIndex: 1000, //控制层叠顺序
				        success: function(layero){
				        	layer.setTop(layero); //置顶当前窗口
				        }
					});
				}
				
			},
			//查看
			btn_look: function(){
                //创建树之前销毁树
                $.jstree.destroy('#dialogMenuTree');
				var selectRows = $("#wwdz_gridtable").jqGrid("getGridParam", "selarrrow");
				if(selectRows.length!=1){
					layer.msg('请选中一行，再进行查看！', { btn: ['关闭']});
					return;
				}else{
                    This.openLookDialog(layer);
				}
			},
			//删除
			btn_delete: function(){
				var selectRows = $("#wwdz_gridtable").jqGrid("getGridParam", "selarrrow");
				if(selectRows.length==0){
					//layer.msg('请选中一行，再进行删除！', {zIndex: layer.zIndex},{ btn: ['关闭']});
					layer.msg('请选中一行，再进行删除！', { btn: ['关闭']});
					return;
				}
				else{
					This.deleteDialog();
                    This.queryAllRoleByPage();
				}
			}
		};
		$('#LAY_demo .layui-btn').on('click', function(){
			var othis = $(this), method = othis.data('method');
			active[method] ? active[method].call(this, othis) : '';
		});
	});
};
/**
 * 查询
 */
GAG.ios.role_manager.prototype.queryAllRoleByPage = function (){
	$("#wwdz_gridtable").setGridParam({
		page : 1,
		url :window.BASE_API_URL + "sysRole/querySysRolePage.do",
		datatype : "json",
		postData : this.getQueryMap()
	}).trigger("reloadGrid")
};
//默认查询显示列表
GAG.ios.role_manager.prototype.initGrid = function (){
	var This = this;
	$("#wwdz_gridtable").jqGrid(This.defaultGridConfig).trigger('reloadGrid');
	setTimeout(function(){
        window.GAG.ios.common.updatePagerIcons($("#wwdz_gridtable"));//加载底部栏图标
	}, 0);
    window.GAG.ios.common.resizeJqGrid("wwdz_gridtable");
};
/**
 * 运行中提示
 */
GAG.ios.role_manager.prototype.wwdzAdd = function (layer,layerId){
	layer.msg('运行中', {
		  icon: 16,
		  shade: 0.6,
		  zIndex: layer.zIndex+100
	});
	//此处演示关闭
	setTimeout(function(){
	    layer.close(layerId);
	    //document.getElementById("wwdz_xz_form").reset(); 
	    layer.closeAll('loading');
	}, 1000);
};
//隐藏机构树
GAG.ios.role_manager.prototype.hideTree = function () {
    $('.layui-layer').on('click',function (e) {
        if (!$(e.target).hasClass('jstree-icon')) {
            $('.zzjgTree-init').hide();
        }
    });
};
//清空上级机构
GAG.ios.role_manager.prototype.clearOrg = function () {

    var bmmc = $("#bmmc").val();//上级机构名称
    if(!bmmc){
        $("#bmmc_id").val('');
        // $('#mparentDeptCode').val('');
        // $('#mtaxNo').val('');
        // $('#mparentTaxNo').val('');
    }
};

//获取机构树
GAG.ios.role_manager.prototype.getOrgTree = function () {
    $('.zzjgTree-init').show();
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
            $('.zzjgTree-init').show();
            var result = [];
            var list = data.data.sysDeptList;
            var length = list.length;
            for (var i = 0; i < length; i++) {
                result.push({
                    'id' : list[i].id,
                    'name' : list[i].deptName,
                    'parentId' : list[i].parentId == '-1' ?  '#' : list[i].parentId,
                    'text' : list[i].deptName,
                    'state': {'selected': false,"opened": false}
                });

            }
            $('.zzjgTree-init').jstree({
                'core' : {
                    'data' : result
                }
            });
            $('.zzjgTree-init').on('changed.jstree',function (e,data) {
                $('#bmmc').val(data.node.text);
                $('#bmmc_id').val(data.node.id);
            });
        }
    });
};

//打开新增弹框
GAG.ios.role_manager.prototype.openAddDialog = function () {
	var This = this;
	$('#dialogDescription').attr('disabled',false);
	$('input, textarea').placeholder();
	$("#jszt").find("input[type = checkbox]").bind("click",function () {
        $('#jszt').find('input[type=checkbox]').not(this).attr("checked", false);
    });
    $.ajax({
        url :  window.BASE_API_URL + "index/initMenu.do",
        type : 'post',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        dataType : 'json',
        beforeSend: function()
        {
            $("#bgFilter").css("display", "block");
            $("#loadingProgress").css("display", "block");
        },
        success : function(data){
            var resultAdd = [];
            var item=data.data;
            if(item.length > 0){
                var length = item.length;
                for (var i = 0; i < length; i++) {
                    resultAdd.push({
                        'id' : item[i].id,
                        'name': item[i].authName,
                        'parent' : item[i].parentId == '0' ? '#' : item[i].parentId,
                        'text' : item[i].authName,
                        'state': {'selected': false},
                    });

                }
            }
            $('#dialogMenuTree').jstree({
                'core' : {
                    'data' : resultAdd
                },
                "plugins" : [
                    "checkbox"
                ]
            });

        },
        complete: function(){
            $("#bgFilter").css("display", "none");
            $("#loadingProgress").css("display", "none");
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
            layer.msg('操作失败请联系管理员!', {zIndex: layer.zIndex});
        }
    });
	$("#dialogRoleName").val("");
	$("#dialogDescription").val("");
	$("#bmmc").val("");
	$("#dialogRoleName").attr("disabled",false);
	$("#jszt").attr("disabled",false);
	$("#dialogRoleName").removeAttr("readonly");
	$("#dialogRoleName").removeAttr("disabled");

	$("#dialogRoleName").blur();
	$("#dialogDescription").blur();
};

//打开查看弹框
GAG.ios.role_manager.prototype.openLookDialog = function (layer){
	var This = this;
    var id = $("#wwdz_gridtable").jqGrid("getGridParam","selrow");
    var rowData = $("#wwdz_gridtable").jqGrid("getRowData", id);


	var ckjsxx = layer.open({
		type: 1,
		title: "<big>查看信息</big>",
		area: ['800px','auto'],
		shade: [0.3, '#393D49'],
		shadeClose: false,
		maxmin: true,
		resize: true,//是否允许拉伸
	    content: $('#xz_wwdz'),//显示一个块里面的内容
	    cancel: function(){ //右上角关闭按钮
	    	$("#xz_ipdzmc").val("");
			$("#xz_ipdz").val("");
			$("#xz_wzqy").val("");
			$("#xz_ms").val("");
			$("#xz_dlfwyh").val("");
			$("#xz_dlfwmm").val("");
			$("#xz_ludk").val("");
			$("#xz_version").val("");
			$("#dialogRoleName").val("");
			$("#dialogDescription").val("");
	    },
		//closeBtn: 2,关闭按钮样式
	    //btnAlign: 'l',// 'c' 'r' 按钮排序方式
	    zIndex: layer.zIndex, //控制层叠顺序
	    success: function(layero,index){//弹层成功回调方法
	    layer.setTop(layero); //置顶当前窗口
	    }
	});


    $.ajax({
        url : window.BASE_API_URL +"index/initMenu.do",
        type : 'post',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        dataType : 'json',
        //data: This.getQueryMap(),
        success : function(data) {
            var result = [];
            window.top.GAG.ios.common.getTree(data.data,result);
            $('#dialogMenuTree').jstree({
                'core' : {
                    'data' : result
                },
                "plugins" : [
                    "checkbox"
                ]
            });
        }
    });

    $.ajax({
        url : window.BASE_API_URL +"sysRole/querySysRoleDetail.do",
        type : 'post',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        dataType : 'json',
        data:{"id" : rowData.id},
        success : function(data){
            console.log("data",data);
            var data = data.data;

            $("#dialogRoleName").val(data.roleName); //角色名称

            $("#dialogDescription").val(data.description);//描述
			$("#bmmc").val(data.deptName);
			$("#bmmc_id").val(data.deptId);

        }
    });

	$('input, textarea').placeholder();
	var id = $("#wwdz_gridtable").jqGrid("getGridParam", "selrow");
	var rowData = $("#wwdz_gridtable").jqGrid("getRowData", id);{
		$("#dialogRoleName").val(rowData.jsmc);
		$("#jszt").attr("disabled",true);
		$("#dialogRoleName").attr("readonly", "readonly");
		$("#dialogRoleName").attr("disabled", "disabled");
		$("#dialogRoleName").attr("disabled", "true");
		$("#dialogDescription").attr("disabled", "true");
	}
};

/**
 * 删除
 * @return
 */
GAG.ios.role_manager.prototype.deleteDialog = function(){
	var This = this;
	var id = $("#wwdz_gridtable").jqGrid("getGridParam","selrow");
	var rowData = $("#wwdz_gridtable").jqGrid("getRowData", id);
	{
		var selectRows = $("#wwdz_gridtable").jqGrid("getGridParam", "selarrrow");
		//console.log("rrrrrrr",selectRows);
		layer.confirm('确定要删除这 '+ selectRows.length +' 条数据吗？', {icon: 3, title:'删除角色信息提示'},
		function ok(data) {
			$(this).attr("disabled", true);
			var delFlag = false;
			var deleteStr="";
			for(var i=0;i<selectRows.length;i++){
				var rowData =  $("#wwdz_gridtable").jqGrid("getRowData",selectRows[i]);
				// if(1 == rowData.id){
				// 	delFlag=true;
				// }
				deleteStr = deleteStr + rowData.id +",";
			} 						
			// if(delFlag){
			// 	layer.msg('超级管理员角色不能删除！', {zIndex: layer.zIndex});
			// 	return;
			// }
			deleteStr = deleteStr.substring(0,deleteStr.length-1);
			$.ajax({
				type:'POST',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
				url: window.BASE_API_URL + "sysRole/deleteSysRole.do",
				data: {
					idArr: selectRows
				},
				dataType:'json',
				async: false,
				globle: false,
				error: function(){
					$(this).removeAttr("disabled");
					layer.msg('数据处理错误！', {zIndex: layer.zIndex});
					return false;
				},
				beforeSend: function(){
					$("#bgFilter").css("display", "block");
					$("#loadingProgress").css("display", "block");
				},
				success: function(data){
					if (data.status == "S"){
						layer.msg('删除成功,共删除'+selectRows.length+'条角色!', {zIndex: layer.zIndex});
						$(this).removeAttr("disabled");
                        This.queryAllRoleByPage();
					}else{
						layer.msg(data.msg);
						$(this).removeAttr("disabled");
					}
				},
				complete: function() {
					$("#bgFilter").css("display", "none");
					$("#loadingProgress").css("display", "none");
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					layer.msg('操作失败!', {zIndex: layer.zIndex});
					$(this).removeAttr("disabled");
				}
			});
		});
	}
};
//获取新增角色数据
GAG.ios.role_manager.prototype.getAddRoleData = function() {
	var map = {};
	map["roleName"] = $.trim($("#dialogRoleName").val());//角色名称
	map["description"] = $.trim($("#dialogDescription").val());//描述
	map["status"] = $.trim($("#jszt input:checked").val());//状态
	map["roleType"] = $.trim($("#jssx option:selected").val());
	map["deptId"] = $.trim($("#bmmc").val());//组织机构
    //$('#dialogMenuTree').on("changed.jstree", function (e, data) {
    // $('#dialogMenuTree').on("changed.jstree", function (e, data) {
    //         map["authIdArr"] = data.selected;
    // });
    // console.log(map);
	return map;

};
//打开修改弹框
GAG.ios.role_manager.prototype.openModifyDialog = function () {
    var This = this;
	$('input, textarea').placeholder();

	var id = $("#wwdz_gridtable").jqGrid("getGridParam", "selrow");
	var rowData = $("#wwdz_gridtable").jqGrid("getRowData", id);
    $("#jszt").find("input[type = checkbox]").bind("click",function () {
        $('#jszt').find('input[type=checkbox]').not(this).attr("checked", false);
    });

		$.ajax({
			url : window.BASE_API_URL + "sysRole/querySysRoleDetail.do",
			data : This.getRoleid(),
			type : 'post',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
			//async: false,
			globle:false,
			error: function(){
				layer.msg('数据处理错误', {zIndex: layer.zIndex});
				return false;
			},
			beforeSend: function() {
    			$("#bgFilter").css("display", "block");
    			$("#loadingProgress").css("display", "block");
    		},
			success: function(data) {

				var sysAuthorityList = data.data.sysAuthorityList;
				$.ajax({
					url : window.BASE_API_URL + "index/initMenu.do",
                    type : 'post',
                    xhrFields: {
                        withCredentials: true
                    },
                    crossDomain: true,
                    dataType : 'json',
                    success : function(data) {
                        if (data.status == 'T') {
                            window.location.href = '/login.html';
                            return;
                        }
						var treeData = data.data;
                        var result = [];
                        if (treeData) {
                            var treeDataLength = treeData.length;
                            for (var i = 0; i < treeDataLength; i++) {
                                treeData[i].flag = false;
                                if (sysAuthorityList) {
                                    var sysAuthorityListLength = sysAuthorityList.length;
                                    for (var j = 0; j < sysAuthorityListLength; j++) {
                                        if (sysAuthorityList[j].id == treeData[i].id) {
                                            treeData[i] = sysAuthorityList[j];
                                            treeData[i].flag = true;
                                        }

                                    }
                                }
                                result.push({
                                    'id' : treeData[i].id,
                                    'name': treeData[i].authName,
                                    'parent' : treeData[i].parentId == 0 ? '#' : treeData[i].parentId,
                                    'text' : treeData[i].authName,
                                    'state': {'selected': treeData[i].flag}
                                });

                            }
                        }
                        $('#dialogMenuTree').jstree({
                            'core': {
                                'data': result
                            },
                            "plugins": [
                                "checkbox"
                            ]

                        });
                    }
				});
                This.updateRole();

			},
			complete: function() {
				$("#bgFilter").css("display", "none");
				$("#loadingProgress").css("display", "none");
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
			    layer.msg('操作失败请联系管理员!', {zIndex: layer.zIndex});
		    }
		});
	//}
};
//修改角色信息
GAG.ios.role_manager.prototype.updateRole = function (){
	var This = this;
	//$('#dialogDescription').attr('disabled',false);
	var id = $("#wwdz_gridtable").jqGrid("getGridParam", "selrow");
	var rowData = $("#wwdz_gridtable").jqGrid("getRowData", id);
	$("#dialogRoleName").val(rowData.roleName);
    $("#bmmc").val(rowData.deptName);
    $("#bmmc_id").val(rowData.deptId);
	$("#dialogDescription").val(rowData.description);

    if(rowData.status == "启用"){
        // $("#jszt input[value=1]").removeAttr("checked");
        // $("#jszt input[value=1]").attr("checked").parents().siblings().children().removeAttr("checked");
    }else if(rowData.status == "禁用"){
        // $("#jszt input[value=0]").removeAttr("checked");
        // $("#jszt input[value=0]").attr("checked").parents().siblings().children().removeAttr("checked");
    }
	// $("#jssx option[value='"+ rowData.roleType+"']").attr("selected",true);
    if(rowData.roleType == "机构角色"){
        $("#jssx option[value='1']").attr("selected","selected");
    }else if(rowData.roleType == "系统角色"){
        $("#jssx option[value='0']").attr("selected","selected");
    }

	//$("#dialogDescription").val(rowData.ms);
};
//获取角色id
GAG.ios.role_manager.prototype.getRoleid = function () {
	var map = {};
	var id = $("#wwdz_gridtable").jqGrid("getGridParam", "selrow");
	var rowData = $("#wwdz_gridtable").jqGrid("getRowData", id);
	map["id"]=rowData.id;
	return map;
};
//获取修改角色数据
GAG.ios.role_manager.prototype.getModifyRoleData = function () {
	var map = {};
	var id = $("#wwdz_gridtable").jqGrid("getGridParam", "selrow");
	// var menuTree = $.fn.zTree.getZTreeObj("dialogMenuTree");
	// var checkNode = menuTree.getCheckedNodes(true);
	// var treeData = "";
	var rowData = $("#wwdz_gridtable").jqGrid("getRowData", id);
    var nodeObj = $('#dialogMenuTree').jstree().get_checked(true);
    var nodeLength = nodeObj.length;
    var authIdArr = [];
    for (var i = 0; i < nodeLength; i++) {
        authIdArr.push(nodeObj[i].id);

    }
	console.log(nodeObj);
	map["id"]= rowData.id;
	map["roleName"] = $.trim($("#dialogRoleName").val());
	map["description"] = $.trim($("#dialogDescription").val());
    map["roleType"] = $.trim($("#jssx option:selected").val());
    map["deptId"] = $.trim($("#bmmc_id").val());//组织机构
	map["status"] = $.trim($("#jszt input:checked").val());
	map["authIdArr"] = authIdArr;
	return map;

};