
var colMap ={
		colNames : ['流程ID','部署ID','流程名称','流程key','版本号','XML','图片','部署时间','是否挂起','是否挂起id'],
		colModel : [
		    {name:'processdefinitionid',index:'processdefinitionid', width:'25%',align:'center',sortable:false},
		    {name:'deploymentid',index:'deploymentid', width:'20%',align:'center',sortable:false},
		    {name:'lcmc',index:'lcmc', width:'25%',align:'center',sortable:false},
            {name:'lckey',index:'lckey', width:'20%',align:'center',sortable:false},
            {name:'bbh',index:'bbh', width:'20%',align:'center',sortable:false},
            {name:'xml',index:'xml', width:'30%',align:'center',sortable:false,formatter:cLink},
            {name:'img',index:'img', width:'30%',align:'center',sortable:false,formatter:cLink},
            {name:'bssj',index:'bssj', width:'30%',align:'center',sortable:false},
            {name:'isgqmc',index:'isgqmc', width:'20%',align:'center',sortable:false,formatter:cLink},
            {name:'isgq',index:'isgq', width:'20%', hidden:true}
        ]};

$(document).ready(function()
{
	initButton();//初始化按钮
	initGrid();//初始化界面
//	initAisinoCheck("checkForm");//初始化这个form的校验
	//initAutoComplete();
	resizeJqGrid("gridtable");//调整jqgrid自适应窗口大小
});

function initButton() 
{
	layui.use('layer',function(){
		var $ = layui.jquery,
			layer = layui.layer;		
		var active = {
				gzl_query: function(){
					queryAllGzl();
				},
				gzl_import: function(){
					gzlImport();			
				},
				gzl_delete: function(){
					gzlDelte();
				}
		};
		
		$('#gzl_btn .layui-btn').on('click', function(){
		    var clickBtn = $(this), 
		    	dataMethod = clickBtn.data('method');
		    active[dataMethod] ? active[dataMethod].call(this, clickBtn) : '';
		});		
	});


//	$("#gzl_query").button().click(function() {
//		queryAllGzl();
//	});
	
//	$("#gzl_add").button().click(function() {
//		openSMDialog("新增税目","");
//	});
	
//	$("#gzl_modify").button().click(function() {
//		var selectRows = $("#gridtable").jqGrid("getGridParam", "selarrrow");
//		
//		if(selectRows.length!=1)
//		{
//			jQuery.jqalert("请选中一行，再进行编辑！");
//			return;
//		}
//		else{
//			var rowData =  $("#gridtable").jqGrid("getRowData",selectRows[0]);
//			openSMDialog("修改税目",rowData);
//		}
//	});
}
//function gzlImport(){
//	var selectRows = $("#gridtable").jqGrid("getGridParam", "selarrrow");
//	var rowData =  $("#gridtable").jqGrid("getRowData",selectRows);
//	openImportDialog(rowData);
//}
function gzlDelte(){
	var selectRows = $("#gridtable").jqGrid("getGridParam", "selarrrow");
	layer.confirm('您确定要删除这 '+ selectRows.length +' 条流程信息吗？', {icon: 3, title:'删除流程信息提示'}, function(index){
		var idData = [];
		for(var i=0;i<selectRows.length;i++){
			var rowData = $("#gridtable").jqGrid("getRowData",selectRows[i]);
			idData.push({
				id : rowData.deploymentid
			});
		} //拼装
		var parm = {},msgId;
		parm["gzlGrid"] = idData;
		$.ajax({
			url :"../../gzlgl/bsgl/deleteGzl.action",
			data : parm,
			type : 'post',
			dataType : 'json',
			async: false,
			globle: false,
			beforeSend : function(){
				msgId = layer.msg('删除流程信息中......', {
					icon: 16,
					shade: 0.5,
					//time: 0,
					zIndex: layer.zIndex
				});			
			},		
			success : function(rndata) {
				if(rndata == "0"){
					layer.alert("删除成功，共删除 "+selectRows.length+" 条流程信息 !",{
						icon : 6,
						skin: 'layer-ext-moon', //该皮肤由layer.seaning.com友情扩展。
						zIndex: layer.zIndex
					});
//					$("#wwdz_modify").addClass("layui-btn-disabled").attr("disabled", true); 
					$("#gzl_delete").addClass("layui-btn-disabled").attr("disabled", true);					
					queryAllGzl();
				}
				return;
			},
			complete : function() {
				layer.close(msgId);
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				layer.alert('删除流程信息出现异常 !',{
					icon : 5,
		       		skin: 'layer-ext-moon', //该皮肤由layer.seaning.com友情扩展。
					zIndex: layer.zIndex
				});
				return;
			}
		});
		//layer.close(index);
	});

	
}
/**
 * @Describe 初始化列表展示
 */
function initGrid(){
	//需要放在ready中定义，因为用到了dom pager
	window.defaultGridConfig = {  
			url :"../../gzlgl/bsgl/queryAllGzl.action",
			datatype:"json", //数据来源，本地数据
			mtype:"POST",//提交方式
			height:'360',//高度，表格高度。可为数值、百分比或'auto'
			autowidth:false,//自动宽
			colNames: colMap["colNames"],
			colModel: colMap["colModel"],
			rownumbers:true,//添加左侧行号
			cellEdit:false,//表格可编辑
			altRows:true,//隔行变色
			altclass:'GridClass',//隔行变色样式
			caption:"",
			viewrecords: true,//是否在浏览导航栏显示记录总数
			rowNum:10,//默认每页显示记录数
			rowList:[10,20,30,50,100],//可选每页显示记录数
			multiselect : true,
			onSelectRow: function (rowid){ //控制选中行与未选中行时修改或者删除按钮的显示效果
				var selectRows = $("#gridtable").jqGrid("getGridParam", "selarrrow");
				if(selectRows.length == 1){
//					$("#wwdz_modify").removeClass("layui-btn-disabled").attr("disabled", false); 
					$("#gzl_delete").removeClass("layui-btn-disabled").attr("disabled", false); 
				}else if(selectRows.length > 1){			
//					$("#wwdz_modify").addClass("layui-btn-disabled").attr("disabled", true); 
					$("#gzl_delete").removeClass("layui-btn-disabled").attr("disabled", false); 
				}else{
//					$("#wwdz_modify").addClass("layui-btn-disabled").attr("disabled", true); 
					$("#gzl_delete").addClass("layui-btn-disabled").attr("disabled", true); 		
				}
	        },
	        onSelectAll: function (rowids){//控制选中行与未选中行时修改或者删除按钮的显示效果
				var selectAllRows = $("#gridtable").jqGrid("getGridParam", "selarrrow");
				if(selectAllRows.length == 1){
//					$("#wwdz_modify").removeClass("layui-btn-disabled").attr("disabled", false); 
					$("#gzl_delete").removeClass("layui-btn-disabled").attr("disabled", false); 
				}else if(selectAllRows.length > 1){			
//					$("#wwdz_modify").addClass("layui-btn-disabled").attr("disabled", true); 
					$("#gzl_delete").removeClass("layui-btn-disabled").attr("disabled", false); 
				}else{
//					$("#wwdz_modify").addClass("layui-btn-disabled").attr("disabled", true); 
					$("#gzl_delete").addClass("layui-btn-disabled").attr("disabled", true); 				
				}       	
	        },
			jsonReader:{
				id: "processDefinitionId",//设置返回参数中，表格ID的名字为blackId
				repeatitems : false
			},
			loadComplete: function(data){
				//获取所有的ID
//				var ids = $('#gridtable').getDataIDs();                
//				for(var i=0;i<ids.length;i++)
//				{
//				}	          
			},
			pager:$('#pager'),
			width : $(window).width()*0.98,
			height:$(window).height()*0.65
	}; 
	$("#gridtable").jqGrid(defaultGridConfig);
	/////////////////////////////////////////////
	var table = this;
	setTimeout(function()
			{
		updatePagerIcons(table);//加载底部栏图标
			}, 0);
}



/**
 * 查询
 * @return
 */
function queryAllGzl() 
{
	$("#gridtable").setGridParam({
		beforeRequest : function(){
			layer.load(2);
		},
		page : 1,
		url : "../../gzlgl/bsgl/queryAllGzl.action",
		datatype : 'json',
		postData : getQueryMap(),
		gridComplete : function(){
			layer.closeAll("loading");						
		}		
	}).trigger('reloadGrid');
}

//获取查询参数，只提交有用数据
function getQueryMap() 
{
	var rtnMap = {};
	rtnMap["page"] = 1;
	rtnMap["rows"] = 10;
	return rtnMap;
}
//cLink 为自定义方法，用于给某个单元格添加事件
function cLink(cellvalue, options, rowObject)
{	
	var name = options.colModel.name;
	var processdefinitionid = rowObject.processdefinitionid;
	var xml = rowObject.xml;
	var img = rowObject.img;
	var isgq = rowObject.isgq;
	var state = "suspend";
	if(name=="xml")
	{
//		return  '<a target="_blank" href ="#0" class="jqgridck" ' + 
//		 'onClick="loadByDeployment(\''+processdefinitionid+'\',\'xml\');"' + 
//		 '>'+xml+'</a>';
		return  '<a target="_blank" href ="../../gzlgl/bsgl/loadByDeployment.action?processDefinitionId='+processdefinitionid+'&resourceType=xml" class="jqgridck" >'+xml+'</a>';
	}else if(name=="img"){
		return  '<a target="_blank" href ="../../gzlgl/bsgl/loadByDeployment.action?processDefinitionId='+processdefinitionid+'&resourceType=image" class="jqgridck" >'+img+'</a>';
	}else if(name=="isgqmc"){
		//false代表未挂起，显示挂起操作
		if(isgq == false){
			/*return '<a href ="#0" style="color:red;" ' + 
			 'onClick="handle(' + processdefinitionid + ');"' + 
			 '>' + '挂起' + '</a>';*/
			return '<a href ="#0" style="color:red;" ' + 
			 'onClick="hangup(\'' + state + '\', \'' + processdefinitionid + '\');"' + 
			 '>' + '挂起' + '</a>';
		}else{
			state = "active";
			return '<a href ="#0" style="color:red;" ' + 
			 'onClick="hangup(\'' + state + '\', \'' + processdefinitionid + '\');"' + 
			 '>' + '激活' + '</a>';
		}
	}
}
function hangup(state, processdefinitionid){
	var msg1 = "";
	if(state=="suspend"){
		msg1 = "挂起";
	}else if(state=="active"){
		msg1 = "激活";
	}
	$.ajax({
		url :"../../gzlgl/task/hangup.action",
		type : 'post',
		dataType : 'json',
		data:{
			'state':state,
			'processDefinitionId':processdefinitionid
		},
		async: false,
		globle: false,	
		success : function(rndata) {
			if(rndata == "success"){
				layer.alert(msg1+'成功！',{
					icon : 6,
					skin: 'layer-ext-moon', //该皮肤由layer.seaning.com友情扩展。
					zIndex: layer.zIndex
				});
			}
			queryAllGzl();
			return;
		},
		complete: function() 
		{
//			$("#bgFilter").css("display", "none");
//			$("#loadingProgress").css("display", "none");
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			layer.alert(msg1+'出现异常 !',{
				icon : 5,
	       		skin: 'layer-ext-moon', //该皮肤由layer.seaning.com友情扩展。
				zIndex: layer.zIndex
			});
			return;
		}
	});
}
/**
 * 打开启动流程
 */

//function loadByDeployment(processdefinitionid,resourceType) {
//	window.location.href='../../gzlgl/bsgl/loadByDeployment.action?processDefinitionId='+processdefinitionid+'&resourceType='+resourceType;
//	$.ajax({
//		url : "../../gzlgl/bsgl/loadByDeployment.action",
//		type : 'post',
//		dataType : 'json',
//		data:{'processDefinitionId':processdefinitionid,
//			  'resourceType':resourceType},
//		beforeSend: function() 
//		{
//			$("#bgFilter").css("display", "block");
//			$("#loadingProgress").css("display", "block");
//		},
//		success : function(data) {
//			
//	    },
//	    complete: function() 
//		{
//			$("#bgFilter").css("display", "none");
//			$("#loadingProgress").css("display", "none");
//		}
//	});
//}

/**
 * @Describe 上传文件界面
 */
//function openImportDialog(rowData)
//{
//	var str1 = "gzl_upload.html";
//	document.getElementById("gzl_test").src = str1;
//	layer = layui.layer;
//	importDia = $("#gzlUploadDialog").dialog({
//		autoOpen : false,
//		width : 800,
//		height: 380,
//		modal : true,
//		resizable : false,
//		title : "请选择需要部署的工作流文件"
//	});
//	
//	importDia.dialog({
//		close : function()
//		{
//			$(this).dialog("close");
////			document.getElementById("gzl_import").disabled = true;
//			queryAllGzl();
//		}
//	});
//	
//	importDia.dialog( "open" );
//}

/**
 * @Describe 导入界面
 */
function gzlImport(){
//	var str1 = "gzl_upload.html";
//	document.getElementById("gzl_test").src = str1;
	var layerHeight,layerWidth;
	var gzlImportDialog = layer.open({
		type: 1,
		title: "<big>请选择需要部署的工作流文件</big>",
		area: ['920px','400px'],
		shade: [0.3, '#393D49'],
		shadeClose: false,
        maxmin: true,
        resize: true,//是否允许拉伸
        content: $('#gzlUploadDialog'),
//        btn: ['关闭'] ,
//        yes: function(){  			      	  
//        	var aisinoResult = checkAisinoForm("xz_wwdz_form");
//      	    if(aisinoResult == false)
//      	    	return false;//校验不通过，提示错误信息
//        	gzlImportShow(layer,gzlImportDialog);
//        	layer.close();
//        	queryAllGzl();
//        },
//        btn2: function(){//取消按钮
//			$("#xz_wwdz_form input").val("");
//        	queryAllGzl();
//        },
        cancel: function(){ //右上角关闭按钮
//			$("#xz_wwdz_form input").val("");
        	queryAllGzl();
        },
	    //closeBtn: 2,//关闭按钮样式
        //btnAlign: 'l',// 'c' 'r' 按钮排序方式
        zIndex: layer.zIndex, //控制层叠顺序
        success: function(layero,index){//弹层成功回调方法  		
        	resizeJqGrid("gridtable");
        	layer.setTop(layero); //置顶当前窗口
        }
	});
}
/**
 * @Describe 导入展示
 */
function gzlImportShow(layerId){
	$.ajax({
		type: "POST",
		url: "../../admin/wwdz/insertWwdz.action",
		data: {},
		dataType: "json",
		beforeSend : function(){
			msgId = layer.msg('新增外网地址信息中......', {
				icon: 16,
				shade: 0.5,
				//time: 0,
				zIndex: layer.zIndex
			});			
		},
		success: function(rndata){
			if(rndata.rncode == "0"){
				layer.close(layerId);				
				$("#xz_wwdz_form input").val("");
				layer.alert('新增外网地址信息成功 !', {
		       		icon: 6,
		       		skin: 'layer-ext-moon', //该皮肤由layer.seaning.com友情扩展。
					zIndex: layer.zIndex
		   		});
				$("#wwdz_modify").addClass("layui-btn-disabled").attr("disabled", true); 
				$("#wwdz_delete").addClass("layui-btn-disabled").attr("disabled", true);
				wwdzQuery(layer);
			}
	 		return;
		},
		complete : function(){
			layer.close(msgId);
		},	
		error : function(XMLHttpRequest, textStatus, errorThrown){
			layer.alert('新增外网地址信息出现异常 !', {
	       		icon: 5,
	       		skin: 'layer-ext-moon', //该皮肤由layer.seaning.com友情扩展。
				zIndex: layer.zIndex
	   		});
	 		return;
		}		
	});	
}
