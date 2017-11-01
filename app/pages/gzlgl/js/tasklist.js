var colMap ={
		colNames : ['任务ID','任务Key','任务名称','流程定义ID','流程实例ID','优先级','任务创建日期','任务逾期日','任务描述','任务所属人','操作','assignee'],
		colModel : [
		    {name:'id',index:'id', width:'20%',align:'center',sortable:false},
		    {name:'taskDefinitionKey',index:'taskDefinitionKey', width:'20%',align:'center',sortable:false},
		    {name:'name',index:'name', width:'30%',align:'center',sortable:false},
            {name:'processDefinitionId',index:'processDefinitionId', width:'30%',align:'center',sortable:false},
            {name:'processInstanceId',index:'processInstanceId', width:'30%',align:'center',sortable:false},
            {name:'priority',index:'priority', width:'30%',align:'center',sortable:false},
            {name:'createTime',index:'createTime', width:'20%',align:'center',sortable:false},
            {name:'dueDate',index:'dueDate', width:'20%',align:'center',sortable:false},
            {name:'description',index:'description', width:'20%',align:'center',sortable:false},
            {name:'owner',index:'owner', width:'20%',align:'center',sortable:false},
            {name:'handle',index:'handle', width:'20%',align:'center',sortable:false,formatter:cLink},
            {name:'assignee',index:'assignee', width:'20%',align:'center',sortable:false,hidden:true}
        ]};

$(document).ready(function()
{
/*	initButton();
	initAisinoCheck("checkForm");//初始化这个form的校验
*/	//initAutoComplete();
	//需要放在ready中定义，因为用到了dom pager
	window.defaultGridConfig = {  
			url :"../../gzlgl/task/queryTaskList.action",
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
	 	       //获取所有的ID
//		        var ids = $('#gridtable').getDataIDs();                
//				for(var i=0;i<ids.length;i++)
//				{
//	            }	          
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
function cLink(cellvalue, options, rowObject)
{
	var name = options.colModel.name;
	var tname=rowObject.name;
	var taskId = rowObject.id;
	var assignee =rowObject.assignee;
	layer = layui.layer;			
	if(name=="handle")
	{
		if(assignee ==null){
			return '<a href ="#0"  class="jqgridcks" ' + 
			 'onClick="handle(\'' + taskId + '\');"' + 
			 '>' + '签收' + '</a>';
		}else{
			return '<a href ="#0"  class="jqgridcks" ' + 
			 'onClick="complete(\'' + taskId+ '\',\'' +tname+ '\');"' + 
			 '>' + '办理' + '</a>';
		}
	}
}
function handle(taskId){
	$.ajax({
		url:"../../gzlgl/task/chaim.action",
		datatype:"json",
		type:"post",
		data:{
			'taskId':taskId
		},
		success:function(data){
			layer.msg("签收成功！");
			query();
		}
	})
}

function query(){
	$("#gridtable").setGridParam({
		page : 1,
		url :"../../gzlgl/task/queryTaskList.action",
		datatype : "json",
	    mtype:"POST",// 提交方式
		postData :getQueryMap()
		
	}).trigger("reloadGrid");
}

/**
 * 打开办理对话框
 */
function complete(taskId,tname) {
	
	readFormFields.call(this, taskId);
	layer.open({
		type:1,
		title: "<big>办理任务</big>",
		skin: 'layui-layer-molv',
		area: ['370px','300px'],
		shade: 0,
		shadeClose: true,
        maxmin: true,
        resize: true,//是否允许拉伸
		btn: ['提交', '关闭'] ,
        content: $('#handleTemplate'),
        yes:function() {
			$.ajax({
				url:"../../gzlgl/task/completeTask.action?taskId="+taskId,
				datatype:"json",
				type:"post",
				data:$('.dynamic-form').serialize(),
				success:function(data){
					layer.msg("办理成功！");
					layer.closeAll('page');
					query();
				}
			})
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
	
	
	

/*	$('#handleTemplate').html('').dialog({
		modal: true,
		width: 400,
		title: '办理任务[' + tname + ']',
		open: function() {
			readFormFields.call(this, taskId);
		},
		buttons: [{
			text: '提交',
			click: function() {
				$.ajax({
					url:"../../gzlgl/task/completeTask.action?taskId="+taskId,
					datatype:"json",
					type:"post",
					data:$('.dynamic-form').serialize(),
					success:function(data){
						layer.msg("办理成功！");
						query();
					}
				})
				$(this).dialog('close');
			}
		}, {
			text: '关闭',
			click: function() {
				$(this).dialog('close');
			}
		}]
	});*/
}


/**
 * 读取表单字段
 */
function readFormFields(taskId) {

	// 清空对话框内容
	$('#handleTemplate').html("<form role='form' class='dynamic-form' method='post'><table class='table table-bordered'></table></form>");
	var $form = $('.dynamic-form');
	
	// 设置表单提交id
	//$form.attr('action',  '../../gzlgl/task/completeTask.action?taskId=' + taskId);
/*	
    // 添加隐藏域
    if ($('#processType').length == 0) {
        $('<input/>', {
            'id': 'processType',
            'name': 'processType',
            'type': 'hidden'
        }).val(processType).appendTo($form);
    }*/

	// 读取启动时的表单
    $.ajax({
		url:"../../gzlgl/task/findTaskForm.action",
		datatype:"json",
		type:"post",
		data:{
			'taskId':taskId
		},		
		success:function(object){
			datas = eval("(" + object + ")");
			var trs = "";
			$.each(datas.taskFormData.formProperties, function() {
				var className = this.required === true ? "required" : "";
				this.value = this.value ? this.value : "";
				trs += "<tr>" + createFieldHtml(this, datas, className)
				if (this.required === true) {
					trs += "<span style='color:red'>*</span>";
				}
				trs += "</td></tr>";
			});

			// 添加table内容
			$('.table').html(trs);
		/*	.find('tr').hover(function() {
				$(this).addClass('form-control'); 
			}, function() {
				$(this).removeClass('ui-state-hover');
			});*/

			// 初始化日期组件
	//		$form.find('.date').datepicker();

			// 表单验证
//			$form.validate($.extend({}, $.common.plugin.validator));
	
		}
		});
}

/**
 * form对应的string/date/long/enum/boolean类型表单组件生成器
 * fp_的意思是form paremeter
 */
var formFieldCreator = {
	'string': function(prop, datas, className) {
		var result = "<td width='120'>" + prop.name + "：</td>";
		if (prop.writable === true) {
			result += "<td><input type='text' id='" + prop.id + "' name='fp_" + prop.id + "' class='" + className + "' value='" + prop.value + "' />";
		} else {
			result += "<td>" + prop.value;
		}
		return result;
	},
	'date': function(prop, datas, className) {
		var result = "<td width='120'>" + prop.name + "：</td>";
		if (prop.writable === true) {
			result += "<td><input type='text' id='" + prop.id + "' name='fp_" + prop.id + "' class='date " + className + "' value='" + prop.value + "'/>";
		} else {
			result += "<td>" + prop.value;
		}
		return result;
	},
	'enum': function(prop, datas, className) {
		var result = "<td width='120'>" + prop.name + "：</td>";
		if (prop.writable === true) {
			result += "<td><select id='" + prop.id + "' name='fp_" + prop.id + "' class='" + className + "'>";
			$.each(datas[prop.id], function(k, v) {
				result += "<option value='" + k + "'>" + v + "</option>";
			});
			result += "</select>";
		} else {
			result += "<td>" + prop.value;
		}
		return result;
	},
	'users': function(prop, datas, className) {
		var result = "<td width='120'>" + prop.name + "：</td>";
		if (prop.writable === true) {
			result += "<td><input type='text' id='" + prop.id + "' name='fp_" + prop.id + "' class='" + className + "' value='" + prop.value + "' />";
		} else {
			result += "<td>" + prop.value;
		}
		return result;
	}
};

/**
 * 生成一个field的html代码
 */
function createFieldHtml(prop, className) {
	return formFieldCreator[prop.type.name](prop, className);
}

function getQueryMap() 
{
	var rtnMap = {};
	rtnMap["page"] = 1;
	rtnMap["rows"] = 10;
	return rtnMap;
}