var colMap ={
		colNames : ['流程ID','部署ID','流程名称','流程key','版本号','XML','图片','操作'],
		colModel : [
				    {name:'processdefinitionid',index:'processdefinitionid', width:'25%',align:'center',sortable:false},
				    {name:'deploymentid',index:'deploymentid', width:'20%',align:'center',sortable:false},
				    {name:'lcmc',index:'lcmc', width:'25%',align:'center',sortable:false},
		            {name:'lckey',index:'lckey', width:'20%',align:'center',sortable:false},
		            {name:'bbh',index:'bbh', width:'20%',align:'center',sortable:false},
		            {name:'xml',index:'xml', width:'30%',align:'center',sortable:false},
		            {name:'img',index:'img', width:'30%',align:'center',sortable:false},
		            {name:'qdlc',index:'qdlc', width:'30%',align:'center',sortable:false,formatter:cLink}
		        ]};
$(document).ready(function()
{
	initButton();
//	initAisinoCheck("checkForm");//初始化这个form的校验
	window.defaultGridConfig = {  
			url :"../../gzlgl/lclb/queryAllLclb.action",
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
	        jsonReader:{
	            id: "id",//设置返回参数中，表格ID的名字为blackId
	            repeatitems : false
	        },
	        loadComplete: function(data){
		 },
	        pager:$('#pager'),
	     	width : $(window).width()*0.98,
			height:$(window).height()*0.65
	 }; 

	$("#gridtable").jqGrid(defaultGridConfig);
	var table = this;
	setTimeout(function()
	{
		updatePagerIcons(table);//加载底部栏图标
	}, 0);
	
});
/**
 * @Describe 初始化按钮事件
 */
function initButton(){
	layui.use('layer',function(){
		var $ = layui.jquery,
			layer = layui.layer;		
		var active = {
				gzl_query: function(){
				queryAllLclb();
			}
		};
		
		$('#wwdz_btn .layui-btn').on('click', function(){
		    var clickBtn = $(this), 
		    	dataMethod = clickBtn.data('method');
		    active[dataMethod] ? active[dataMethod].call(this, clickBtn) : '';
		});		
	});
}
//cLink 为自定义方法，用于给某个单元格添加事件
function cLink(cellvalue, options, rowObject)
{	
	var name = options.colModel.name;
	var processdefinitionid = rowObject.processdefinitionid;
	var lcmc = rowObject.lcmc;
	if(name=="qdlc")
	{
		 return  '<a href ="#0"  class="jqgridck" style="color:red"' + 
		 'onClick="showStartupProcessDialog(\'启动页\',\''+processdefinitionid+'\',\''+lcmc+'\');"' + 
		 '>启动</a>';

	}
}
/**
 * 查询
 * @return
 */
function queryAllLclb() 
{
	$("#gridtable").setGridParam({
		page : 1,
		url :"../../gzlgl/lclb/queryAllLclb.action",
		datatype : "json",
	    mtype:"POST",// 提交方式
		postData :getQueryMap()
		
	}).trigger("reloadGrid");
}

//获取查询参数，只提交有用数据
function getQueryMap() 
{
	var rtnMap = {};
	rtnMap["page"] = 1;
	rtnMap["rows"] = 10;
	return rtnMap;
}


function saveLclb(str,processdefinitionid){
	
//	var checkResult = checkAisinoForm("checkForm");
//	if(checkResult==false)
//		return false;//校验不通过，根据各个框的错误信息进行修改
	//取值
	var lrrqstart = $.trim($("#lrrqstart").val());
	var lrrqend = $.trim($("#lrrqend").val());
	var reason = $.trim($("#reason").val());
//	var processdefinitionid = rowData.processdefinitionid;
	//smmc=smmc.replace(/\ +/g,"");//去掉空格
	//smmc=smmc.replace(/[\r\n]/g,"");//去掉回车

	var rtnMap = {};
	//rtnMap["lclb"] =rowData.lclb;
	rtnMap["lrrqstart"] =lrrqstart;
	rtnMap["lrrqend"] =lrrqend;
	rtnMap["reason"] =reason;
	rtnMap["processdefinitionid"] =processdefinitionid;

	$.ajax({
		url : "../../gzlgl/lclb/startLc.action?processDefinitionId="+processdefinitionid,
		type : 'post',
		dataType : 'json',
		data : $('.dynamic-form').serialize(),
		beforeSend: function() 
		{
			$("#bgFilter").css("display", "block");
			$("#loadingProgress").css("display", "block");
		},
		success : function(data) {
			if(data=="1"){
				layer.msg('启动失败!', {zIndex: layer.zIndex});
				return false;
			}
			layer.msg('启动成功!', {zIndex: layer.zIndex});
			queryAllLclb();
		},
		complete: function() 
		{
			$("#bgFilter").css("display", "none");
			$("#loadingProgress").css("display", "none");
		}
	});
	return true;
}

/**
 * 打开启动流程
 */

function showStartupProcessDialog(str,processdefinitionid,lcmc) {
	var $ele = $(this);
	readFormFields.call(this, processdefinitionid);
	layer.open({
		type:1,
		title: "<big>办理任务</big>",
		skin: 'layui-layer-molv',
		area: ['370px','280px'],
		shade: 0,
		shadeClose: true,
        maxmin: true,
        resize: true,//是否允许拉伸
		btn: ['提交', '关闭'] ,
        content: $('#handleTemplate'),
        yes:function() {
        	saveLclb(str,processdefinitionid);
        },
        btn2:function(){
        	
        },
        cancel: function(index){ //右上角关闭按钮

	    	},
	    zIndex: 99999, //控制层叠顺序
	    success: function(layero,index){//弹层成功回调方法
	    	layer.setTop(layero); //置顶当前窗口
	    }
	});

}

/**
 * 读取表单字段
 */

function readFormFields(processDefinitionId) {
	var dialog = this;

	// 清空对话框内容
	$('#handleTemplate').html("<form role='form' class='dynamic-form' method='post'><table class='table table-bordered'></table></form>");
	var $form = $('.dynamic-form');

	// 设置表单提交id
//	$form.attr('action', ctx + '/form/dynamic/start-process/' + processDefinitionId);

    // 添加隐藏域
//    if ($('#processType').length == 0) {
//        $('<input/>', {
//            'id': 'processType',
//            'name': 'processType',
//            'type': 'hidden'
//        }).val(processType).appendTo($form);
//    }

	// 读取启动时的表单
	$.ajax({
		url : "../../gzlgl/lclb/findStartForm.action",
		type : 'post',
		dataType : 'json',
		data:{'processDefinitionId':processDefinitionId},
//		beforeSend: function() 
//		{
//			$("#bgFilter").css("display", "block");
//			$("#loadingProgress").css("display", "block");
//		},
		success : function(data) {

			var trs = "";
			$.each(data.form.formProperties, function() {
				var className = (this.required === true ? "required" : "");
				trs += "<tr>" + createFieldHtml(data, this, className);	
				if(this.required === true) {
					trs += "<span style='color:red'>*</span>";
				}else{
					trs += "&nbsp;";
				}
				trs += "</td></tr>";
			});

			// 添加table内容
			$('.table').html(trs);
//			.find('tr').hover(function() {
//				$(this).addClass('ui-state-hover');
//			}, function() {
//				$(this).removeClass('ui-state-hover');
//			});

			// 初始化日期组件
//			$form.find('.dateISO').datepicker();

			// 表单验证
//			$form.validate($.extend({}, $.common.plugin.validator));
		
//			jQuery.jqalert("启动成功!");
//			queryAllLclb();
		}
//		,
//		complete: function() 
//		{
//			$("#bgFilter").css("display", "none");
//			$("#loadingProgress").css("display", "none");
//		}
	});
}

/**
 * 生成一个field的html代码
 */

function createFieldHtml(formData, prop, className) {
	return formFieldCreator[prop.type.name](formData, prop, className);
}

/**
 * form对应的string/date/long/enum/boolean类型表单组件生成器
 * fp_的意思是form paremeter
 */
var formFieldCreator = {
	'string': function(formData, prop, className) {
		var result = "<td width='120'>" + prop.name + "：</td><td><input type='text' id='" + prop.id + "' name='fp_" + prop.id + "' />";
		return result;
	},
	'date': function(formData, prop, className) {
		var result = "<td>" + prop.name + "：</td><td><input type='text' id='" + prop.id + "' name='fp_" + prop.id + "' onfocus='dateShow();' />";
		return result;
	},
	'enum': function(formData, prop, className) {
		console.log(prop);
		var result = "<td width='120'>" + prop.name + "：</td>";
		if(prop.writable === true) {
			result += "<td><select id='" + prop.id + "' name='fp_" + prop.id + "' class='" + className + "'>";
			//result += "<option>" + datas + "</option>";
			
			$.each(formData['enum_' + prop.id], function(k, v) {
				result += "<option value='" + k + "'>" + v + "</option>";
			});
			 
			result += "</select>";
		} else {
			result += "<td>" + prop.value;
		}
		return result;
	},
	'users': function(formData, prop, className) {
		var result = "<td width='120'>" + prop.name + "：</td><td><input type='text' id='" + prop.id + "' name='fp_" + prop.id + "' class='" + className + "' />";
		return result;
	}
};

function dateShow(){
	WdatePicker({dateFmt:'yyyy-MM-dd'});
}