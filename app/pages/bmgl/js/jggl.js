//全局变量
GAG.ios.jggl = function () {
    this.jgjcsz = 4;//机构级次设置，增加机构，最低可增加的级次，默认为0（不限）
    this.bmjc_0 = 0;//机构级次的初始值，在修改机构时用到
    this.str ="新增机构";
    this.rowDta = null;
    this.colMap ={
        colNames : ['ID','','','','','','机构编码','机构名称','操作','纳税人识别号','所属纳税人识别号','上级机构编码','上级机构名称','开票标志','有效标志','创建时间'],
        colModel : [
            {name:'id',index:'id', width:'',sortable:false,hidden:true},
            {name:'deptTel',index:'deptTel', width:'',sortable:false,hidden:true},
            {name:'deptManager',index:'deptManager', width:'',sortable:false,hidden:true},
            {name:'deptManager',index:'deptManager', width:'',sortable:false,hidden:true},
            {name:'parentId',index:'parentId', width:'',sortable:false,hidden:true},
            {name:'description',index:'description', width:'',sortable:false,hidden:true},
            {name:'deptCode',index:'deptCode', width:'10%',align:'center',sortable:false},
            {name:'deptName',index:'deptName', width:'10%',align:'center',sortable:false},
            {
                name: '操作',width: '10%', align: 'center', formatter: function (value,gird,rows,state) {
                	return  "<a href='#' class='btn_look' style='display: inline-block;width: 19px;height: 20px;margin: 0 4px' onclick='' >" +
								"<i data-method='btn_check'   class='btn-ev glyphicon glyphicon-eye-open pointer' style='font-size: 12px !important;'></i>" +
							"</a>" +
							"<a href='#' style='display: inline-block;margin: 0 4px'>" +
								"<i data-method='btn_edit' class='btn-ev layui-icon'>&#xe642;</i> " +
							"</a>" +
							"<a href='#' style='display: inline-block;margin: 0 4px'>" +
								"<i data-method='btn_del' class='btn-ev glyphicon glyphicon-ban-circle' style='font-size: 12px !important;'></i>" +
							"</a>"
            	}
            },
            {name:'taxNo',index:'taxNo', width:'10%',align:'center',sortable:false},
            {name:'parentTaxNo',index:'parentTaxNo', width:'10%',align:'center',sortable:false},
            {name:'parentDeptCode',index:'parentDeptCode', width:'10%',align:'center',sortable:false},
            {name:'parentDeptName',index:'parentDeptName', width:'10%',align:'center',sortable:false},
            {
            	name:'invoiceFlag',index:'invoiceFlag', width:'10%',align:'center',formatter: function (value,gird,rows,state) {
                if (value == '0') {
                    return '<span>不开票</span>';
                }
                return  "<span>开票</span>";
            }},
            {
            	name:'status',index:'status', width:'8%',align:'center',formatter: function (value,gird,rows,state) {
                if (value == '0') {
                    return "<span>无效</span>";
                }
                return  "<span>有效</span>";
            }},
            {
            	name:'createTime',index:'createTime', width:'12%',align:'center',sortable:true,sortorder:'desc',formatter: function (value,gird,rows,state) {
                 	return new Date(value).Format("yyyy-MM-dd hh:mm:ss")
            }}

        ]};
};
GAG.ios.jggl.prototype.init = function () {
	var This = this;
	this.hideTree();
    this.initButton();
    initAisinoCheck("checkForm");//初始化这个form的校验
    this.defaultGridConfig = {
        ajaxGridOptions: {
            url:window.BASE_API_URL + "sysDept/querySysDeptPage.do",
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
        colNames: This.colMap["colNames"],
        colModel: This.colMap["colModel"],
        rownumbers:true,//添加左侧行号
        cellEdit:false,//表格可编辑
        altRows:true,//隔行变色
        altclass:'GridClass',//隔行变色样式
        caption:"",
        viewrecords: true,//是否在浏览导航栏显示记录总数
        rowNum:10,//每页显示记录数
        rowList:[10,20,30,50,100],
        pgbuttons: true,
        multiselect: true,
        beforeSelectRow: function(rowid, e) {
            var $myGrid = $(this),
                i = $.jgrid.getCellIndex($(e.target).closest('td')[0]),
                cm = $myGrid.jqGrid('getGridParam', 'colModel');
            This.rowDta = $("#jgglTable").jqGrid("getRowData", rowid);
            return (cm[i].name === 'cb');
        },
        jsonReader:{
            /*
            page: "data.pageIndex",
            total: Math.ceil("data.total"/"data.pageSize"),
            records: "data.pageSize",
            */
            root: "data.rows",
            page:"data.pageIndex",
            // total: Math.ceil('data.total'/10),
            total: function (obj) {
                return Math.ceil(obj.data.total/obj.data.pageSize);
            },
            records:'data.total',
            id: "id",//设置返回参数中，表格ID的名字为blackId
            repeatitems : true
        },
        pager:'#jgglPager'
    };

    $("#jgglTable").jqGrid(This.defaultGridConfig).trigger('reloadGrid');
    setTimeout(function(){
        window.GAG.ios.common.updatePagerIcons($("#jgglTable"));//加载底部栏图标
    }, 0);
    window.GAG.ios.common.resizeJqGrid("jgglTable");
};
//初始化按钮
GAG.ios.jggl.prototype.initButton = function(){
	var This = this;
	layui.use('layer',function(){
		var $ = layui.jquery,
		layer = layui.layer;		
		var active = {
			//查询
			btn_query: function(){
                This.queryAllJggl();
			},
			//新增
			btn_add: function(){
				$('.jsTree-init').hide();
                 var str = "新增机构";
                This.openJgglDialog("新增机构","");
				var that = this;
				var addWwdz = layer.open({
					type: 1,
					title: "<big>新增机构</big>",
					area: ['800px','400px'],
					shade: [0.6, '#393D49'],
					shadeClose: false,
			        maxmin: true,
			        resize: true,//是否允许拉伸
			        content: $('#modal-dialog-1'),
			        btn: ['保存', '取消'] ,//只是为了演示
			        yes:function(){ 
						if(This.saveJggl(str,"")){
                            This.wwdzAdd(layer,addWwdz);
						}
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
			//修改
			btn_edit: function(){
                $('.jsTree-init').hide();
				var str="修改机构";
				var selectRows = $("#jgglTable").jqGrid("getGridParam", "selarrrow");
				if(selectRows.length!=1 && this.nodeName == 'BUTTON'){
					layer.msg('请选中一行，再进行编辑！', { btn: ['关闭']});
					return;
				}
				else{
					var rowData =  This.rowDta;
					if(rowData.id == "0000"){
						layer.msg('集团性质,不准许修改！', {zIndex: layer.zIndex});
						return false;
					}
                    This.openJgglDialog(str,rowData);
					var editWwdz = layer.open({
						type: 1,
						title: "<big>修改机构</big>",
						area: ['800px','400px'],
						shade: [0.6, '#393D49'],
						shadeClose: false,
				        maxmin: true,
				        resize: true,//是否允许拉伸
				        content: $('#modal-dialog-1'),
				        btn: ['保存', '取消'] ,//只是为了演示
				        yes: function(){
							if(This.saveJggl(str,rowData)){//保存
                                This.wwdzAdd(layer,editWwdz);
							} 	
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
            btn_check: function(){
                $('.jsTree-init').hide();
                var str="查看机构";
                var selectRows = $("#jgglTable").jqGrid("getGridParam", "selarrrow");
                if(selectRows.length!=1 && this.nodeName == 'BUTTON'){
                    layer.msg('请选中一行，再进行编辑！', { btn: ['关闭']});
                    return;
                }
                else{
                    var rowData =  This.rowDta;
                    if(rowData.id == "0000"){
                        layer.msg('集团性质,不准许修改！', {zIndex: layer.zIndex});
                        return false;
                    }
                    This.openJgglDialog(str,rowData);
                    var editWwdz = layer.open({
                        type: 1,
                        title: "<big>查看机构</big>",
                        area: ['800px','400px'],
                        shade: [0.6, '#393D49'],
                        shadeClose: false,
                        maxmin: true,
                        resize: true,//是否允许拉伸
                        content: $('#modal-dialog-1'),
                        btn: ['取消'] ,//只是为了演示
                        zIndex: 1000, //控制层叠顺序
                        success: function(layero){
                            layer.setTop(layero); //置顶当前窗口
                        }
                    });
                }

            },
            //注销
            btn_del: function(){
                var selectRows = $("#jgglTable").jqGrid("getGridParam", "selarrrow");
                if(selectRows.length != 1&& this.nodeName == 'BUTTON'){
                    layer.msg('请选中一行，再进行删除！', { btn: ['关闭']});
                    return;
                }
                else{
                    This.deleteDialog();
                }
            }
		};
		$('.tab-cont').on('click','.btn-ev',function () {
            var othis = $(this), method = othis.data('method');
            active[method] ? active[method].call(this, othis) : '';
        });
        $('.layui-btn').on('click', function(){
            var othis = $(this), method = othis.data('method');
            active[method] ? active[method].call(this, othis) : '';
        });
	});
};
GAG.ios.jggl.prototype.deleteDialog = function(){
    var This = this;
    var rowData = $("#jgglTable").jqGrid("getGridParam", "selarrrow");
    layer.confirm('<big>您确定要注销这1条机构信息吗？</big>', {icon: 3, title:'<span style="color:#2679b5;"><big>提示信息</big></span>'},
        function(index){
            $.ajax({
                type:'POST',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                url: window.BASE_API_URL + "sysDept/cancelSysDept.do",
                data: {
                    id : rowData.join(',')
                },
                dataType : 'json',
                async: false,
                globle: false,
                beforeSend: function(){
                    //msgId = layerMsg("删除外网地址信息中......");
                },
                success: function(data){
                    if(data.status == "T"){
                        window.location.href = '/login.html';
                    }
                    layer.msg(data.msg, {zIndex: layer.zIndex});
                    This.queryAllJggl();
                }
            });
        });
};
//供应商税号选择弹框
GAG.ios.jggl.prototype.openJgglDialog = function (str,rowData){
    $('#checkForm').find('input,textarea,select').removeAttr('disabled');
    $("#mparentTaxNo").attr('disabled','disabled');
    $("#mparentDeptCode").attr('disabled','disabled');
    $("#mdeptCode").val('');//机构编码
    $("#mdeptName").val('');//机构名称
    $("#mparentName").val('');//上级机构名称
    $("#mparentId").val('');//上级机构id
    $("#mparentDeptCode").val('');//上级机构编码
    $("#mdeptTel").val('');//机构电话
    $("#mdeptManager").val('');//机构负责人
    $("#mtaxNo").val('');//纳税人识别号
    $("#mparentTaxNo").val('');//所属纳税人识别号
    $("#minvoiceFlag").find("option[value='1']").attr("selected",true);//开票标志
    $("#mstatus").find("option[value='1']").attr("selected",true);//有效标志
    $("#mdeptType").find("option[value='00']").attr("selected",true);//机构属性
    $("#misParentDept").find("option[value='N']").attr("selected",true);//是否集团总机构
    $("#mdesciption").val('');//描述
	if( str == "修改机构" || str == '查看机构'){
        $("#mdeptCode").val(rowData.deptCode);//机构编码
        $("#mdeptName").val(rowData.deptName);//机构名称
        $("#mparentName").val(rowData.parentDeptName);//上级机构名称
        $("#mparentId").val(rowData.parentId);//上级机构id
        $("#mparentDeptCode").val(rowData.parentDeptCode);//上级机构编码
        $("#mdeptTel").val(rowData.deptTel);//机构电话
        $("#mdeptManager").val(rowData.deptManager);//机构负责人
        $("#mtaxNo").val(rowData.taxNo);//纳税人识别号
        $("#mparentTaxNo").val(rowData.parentTaxNo);//所属纳税人识别号
        if (rowData.invoiceFlag == '0') {
            $("#minvoiceFlag").find("option[value='0']").attr("selected",true).siblings('option').removeAttr('selected');//开票标志
        }
        if (rowData.status == '0') {
            $("#mstatus").find("option[value='0']").attr("selected",true).siblings('option').removeAttr('selected');
        }
        if (rowData.deptType == '01') {
            $("#mdeptType").find("option[value='01']").attr("selected",true).siblings('option').removeAttr('selected');
        } else if (rowData.deptType == '02') {
            $("#mdeptType").find("option[value='02']").attr("selected",true).siblings('option').removeAttr('selected');
        }
        $("#mdesciption").val(rowData.description);//描述
	}
	if(str == '查看机构'){
        $('#checkForm').find('input,textarea,select').attr('disabled',true);
    }
};
/**
 * 查询
 * @return
 */
GAG.ios.jggl.prototype.queryAllJggl = function (){
	var This = this;
    $("#jgglTable").jqGrid('setGridParam',{
    	mtype: 'GET',
        postData :This.getQueryMap()
	}).trigger("reloadGrid");
};
//获取查询参数，只提交有用数据
GAG.ios.jggl.prototype.getQueryMap = function () {
	var rtnMap = {};
	rtnMap["pageIndex"] = 1;
	rtnMap["pageSize"] = 10;
	rtnMap["deptName"] = $.trim($("#organName").val());
	rtnMap["taxNo"] = $.trim($("#taxNo").val());
	rtnMap["deptCode"] = $.trim($("#deptCode").val());
    rtnMap["status"] = $.trim($("#status").val());
	return rtnMap;
};
//隐藏机构树
GAG.ios.jggl.prototype.hideTree = function () {
    $('.layui-layer').on('click',function (e) {
        if (!$(e.target).hasClass('jstree-icon')) {
            $('.jsTree-init').hide();
        }
    });
};
//清空上级机构
GAG.ios.jggl.prototype.clearOrg = function () {
    console.log('...');
    var mparentName = $("#mparentName").val();//上级机构名称
    if(!mparentName){
        $("#mparentId").val('');
        $('#mparentDeptCode').val('');
        $('#mtaxNo').val('');
        $('#mparentTaxNo').val('');
    }
};
//获取机构树
GAG.ios.jggl.prototype.getOrgTree = function () {
    $('.jsTree-init').show();
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
            $('.jsTree-init').show();
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
			$('.jsTree-init').jstree({
				'core' : {
					'data' : result
			 	}
			});
            $('.jsTree-init').on('changed.jstree',function (e,data) {
                console.log(data);
				$('#mparentName').val(data.node.text);
				$('#mparentId').val(data.node.id);
                for (var i = 0; i < length; i++) {
                    if (list[i].deptName == data.node.text) {
                        $('#mparentDeptCode').val(list[i].parentDeptCode);
                        $('#mtaxNo').val(list[i].taxNo);
                        $('#mparentTaxNo').val(list[i].parentTaxNo);
                        return
                    }
                }
                $('#mparentDeptCode').val('');
                $('#mtaxNo').val('');
                $('#mparentTaxNo').val('');
            });
        }
    });
};
/*
 * 保存数据
 */
GAG.ios.jggl.prototype.saveJggl = function (str,rowData){
	var This = this;
	var checkResult = checkAisinoForm("checkForm");
	if( checkResult == false)
	return false;//校验不通过，根据各个框的错误信息进行修改
	//取值
	var mdeptCode = $("#mdeptCode").val();//机构编码
	var mdeptName = $("#mdeptName").val();//机构名称
	var mparentName = $("#mparentName").val();//上级机构名称
	var mparentId = $("#mparentId").val();//上级机构名称
	var mparentDeptCode = $("#mparentDeptCode").val();//上级机构编码
	var mdeptTel = $("#mdeptTel").val();//机构电话
	var mdeptManager = $("#mdeptManager").val();//机构负责人
	var mtaxNo = $("#mtaxNo").val();//纳税人识别号
	var mparentTaxNo = $("#mparentTaxNo").val();//所属纳税人识别号
	var minvoiceFlag = $("#minvoiceFlag").val();//开票标志
	var mstatus = $("#mstatus").val();//有效标志
	var mdeptType = $("#mdeptType").val();//机构属性
	var misParentDept = $("#misParentDept").val();//是否集团总机构
	var mdesciption = $("#mdesciption").val();//描述
	
	var rtnMap = {};
	rtnMap["deptCode"] = mdeptCode;
	rtnMap["deptName"] = mdeptName;
	rtnMap["parentName"] = mparentName;
	rtnMap["parentId"] = mparentId;
	rtnMap["parentDeptCode"] = mparentDeptCode;
	rtnMap["deptTel"] = mdeptTel;
	rtnMap["deptManager"] = mdeptManager;
	rtnMap["taxNo"] = mtaxNo;
	rtnMap["parentTaxNo"] = mparentTaxNo;
	rtnMap["invoiceFlag"] = minvoiceFlag;
	rtnMap["status"] = mstatus;
	rtnMap["deptType"] = mdeptType;
	rtnMap["isParentDept"] = misParentDept;
	rtnMap["description"] = mdesciption;

	if( str == "新增机构"){
		$.ajax({
            url:window.BASE_API_URL + "sysDept/addSysDept.do",
            type: "post",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
			data: rtnMap,
			success : function(data) {
                if (data.status == 'T') {
                    window.location.href = '/login.html';
                    return;
                }
                if (data.status == 'F') {
                    return false;
                }
                layer.msg(data.msg, {zIndex: layer.zIndex});
				This.queryAllJggl();
			}
		});
		return true;
	}
	else{
		rtnMap["id"]= rowData.id;
		$.ajax({
			url : window.BASE_API_URL + "sysDept/editSysDept.do",
			type : 'post',
			dataType : 'json',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
			data:rtnMap,
			success : function(data) {
                if (data.status == 'T') {
                    window.location.href = '/login.html';
                    return;
                }
                layer.msg(data.msg, {zIndex: layer.zIndex});
                This.queryAllJggl();
                if (data.status == 'F') {
                    return false;
                }
			}
		});
		return true;
	}
	
};
/**
 * 运行中提示
 */
GAG.ios.jggl.prototype.wwdzAdd = function (layer,layerId){
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
