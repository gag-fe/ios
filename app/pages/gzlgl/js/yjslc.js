
var colMap ={
		colNames : ['流程ID','流程定义ID','流程启动时间','流程结束时间','流程结束原因'],
		colModel : [
				    {name:'id',index:'id', width:'25%',align:'center',sortable:false},
				    {name:'processDefinitionId',index:'processDefinitionId', width:'20%',align:'center',sortable:false},
				    {name:'startTime',index:'startTime', width:'25%',align:'center',sortable:false},
		            {name:'endTime',index:'endTime', width:'20%',align:'center',sortable:false},
		            {name:'deleteReason',index:'deleteReason', width:'20%',align:'center',sortable:false}
		        ]};

$(document).ready(function()
{
	initButton();
	//initAisinoCheck("checkForm");//初始化这个form的校验
	
	//需要放在ready中定义，因为用到了dom pager
	window.defaultGridConfig = {  
			url :"../../gzlgl/lclb/queryAllYjslc.action",
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
	/////////////////////////////////////////////
	var table = this;
	setTimeout(function()
	{
		updatePagerIcons(table);//加载底部栏图标
	}, 0);
	
});

function initButton() 
{

	$("#yjslc_query").button().click(function() {
		queryAllYjslc();
	});
	
}
//cLink 为自定义方法，用于给某个单元格添加事件
function cLink(cellvalue, options, rowObject)
{	
	var name = options.colModel.name;
	var processdefinitionid = rowObject.processdefinitionid;
	if(name=="qdlc")
	{
		 return  '<a href ="#0" class="jqgridck" ' + 
		 'onClick="openLclbDialog(\'启动页\',\''+processdefinitionid+'\');"' + 
		 '>启动</a>';

	}
}
/**
 * 查询
 * @return
 */
function queryAllYjslc() 
{
	$("#gridtable").setGridParam({
		page : 1,
		url :"../../gzlgl/lclb/queryAllYjslc.action",
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


