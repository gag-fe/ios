/**
 * 设置未来(全局)的AJAX请求默认选项
 * 主要设置了AJAX请求遇到Session过期的情况
 */
$.ajaxSetup({
    type: 'POST',
    complete: function(xhr,status) {
        var sessionStatus = xhr.getResponseHeader('sessionstatus');
        var href = xhr.getResponseHeader('href');
        
        //session校验
        if(sessionStatus == 'timeout') {
            var top = getTopWinow();
            var yes = confirm('由于长时间没有操作, 请重新登录。');
            if (yes) {
                top.location.href = href;            
            }
        }
        
        //跨站请求校验
        else if(sessionStatus == 'csrf') {
            var top = getTopWinow();
            var yes = confirm('发生跨站请求, 请联系管理员。');
            if (yes) {
                top.location.href = href;            
            }
        }
        
        //统一异常校验
        else if(sessionStatus == 'error') {
            var top = getTopWinow();
            //var mes = xhr.getResponseHeader('message');
            var mes = xhr.responseText;
            mes = eval('('+mes+')');
            if(mes!=null && mes !="")
            	alert(mes.error);
        }
    }
});

/**
 * 在页面中任何嵌套层次的窗口中获取顶层窗口
 * @return 当前页面的顶层窗口对象
 */
function getTopWinow(){
    var p = window;
    while(p != p.parent){
        p = p.parent;
    }
    return p;
}



/**
 * 以下是获取页面表格和处理显示隐藏和列宽的方法
 * 
 * @Auther HomyZhu
 */
$(document).ready(function(){
	
	var gridViewArray = $(".ui-jqgrid-view");//获取jqgrid框架设置的表格模型列表
	
	for(var i=0; i < gridViewArray.length; i++){
		
		var gridId = gridViewArray[i].id.substring(6);//框架默认设置的id为gview_拼接上页面中gridId
		
		var initColNames = $("#" + gridId).getGridParam("colNames");
		var initColModel = $("#" + gridId).getGridParam("colModel");
		
		initGridCookieDiv(gridId, initColNames, initColModel);//必须在readGridCookie前，防止initColNames已被改
		
		try{
			readGridCookie(gridId);//如果读取cookie失败，也不应该影响后续添加图片和点击、拖动等功能
		}
		catch(e){
			
		}
		addImgClickAndResize(gridId);//添加源表格左上角的图片和点击事件，以及拖动列宽后的触发方法
	}
});


/**
 * 初始化，给页面添加弹窗div，并生成表格jqgrid
 * 
 * @Auther HomyZhu
 */
function initGridCookieDiv(gridId, initColNames, initColModel){
	
	var divStr = "<div class='center hide'>" +
				 "	<div id='gridCookieDiv" + "_" + gridId + "'>" +
				 "		<div align='center'>" +
				 "			<table id='gridCookieDiv" + "_" + gridId + "_table'></table>" +
				 "			<div id='gridCookieDiv" + "_" + gridId + "_paper'></div>" +
				 "		</div>" +
				 "	</div>" +
				 "</div>";
	
	$(document.body).append(divStr);
	
	var gridCookieGridConfig = {
		datatype : "json", //数据来源，本地数据
		autowidth : false,//自动宽
		rownumbers : true,//添加左侧行号
		multiselect : true,//是否可多选
		pgbuttons : false,//是否显示翻页按钮
		pginput : false,//是否显示跳转页面的输入框
		viewrecords : true,//是否要显示总记录数
		height : 328,//10行高度
		pager : $("#gridCookieDiv" + "_" + gridId + "_paper"),
		colNames : [ '列名', '宽度'],
		colModel : [
			{name:'gridCookieColName', width:'370',align:'center',sortable:false,resizable:false},
			{name:'gridCookieColWidth', width:'230',align:'center',sortable:false,resizable:false,editable:true}
		],
		//以下配置请搜索：jqGrid单元格编辑配置，事件及方法
		cellEdit : true,
		cellsubmit : 'clientArray',//定义了单元格内容保存位置，可用值'remote' 或者'clientArray',
		afterEditCell : function (rowid, cellname, value, iRow, iCol){
			$("#" + iRow + "_gridCookieColWidth").blur(function(){//添加输入框的失去焦点事件
				$("#gridCookieDiv" + "_" + gridId + "_table").saveCell(iRow, iCol);//失去焦点后即保存
			});
			$("#" + iRow + "_gridCookieColWidth").css("height", "19px");
			$("#" + iRow + "_gridCookieColWidth").css("line-height", "13px");
		},
		afterSaveCell : function (rowid, cellname, value, iRow, iCol){
			if(!/^[1-9]\d{0,2}$/.test(value)){
				$.jqalert("请输入 0 到 1000 之间的整数！");
				$("#gridCookieDiv" + "_" + gridId + "_table").restoreCell(iRow, iCol);
			}
		},
		onSelectCell : function (rowid, celname, value, iRow, iCol){
			$("#gridCookieDiv" + "_" + gridId + "_table").setSelection(rowid, false);//选中当前行
	    }
	};
	
	$("#gridCookieDiv" + "_" + gridId + "_table").jqGrid(gridCookieGridConfig);
	
	var rowId = initColModel[1].name == "cb" ? 3 : 2;//有无复选列
	for( ; rowId < initColNames.length; rowId++){
		if(initColModel[rowId].hidden == false){
			$("#gridCookieDiv" + "_" + gridId + "_table").addRowData(rowId, {
				"gridCookieColName"  : initColNames[rowId],
				"gridCookieColWidth" : parseInt(initColModel[rowId].width)//舍弃小数部分
			});
		}
	}
}


/**
 * 添加源表格左上角的图片和点击事件，以及拖动列宽后的触发方法
 * 
 * @Auther HomyZhu
 */
function addImgClickAndResize(gridId){
	
	//添加title显示和图片样式
	$("#" + gridId + "_rn").attr("title", "设置列表显示内容");
	$("#" + gridId + "_rn").css("cursor", "pointer");
	$("#jqgh_" + gridId + "_rn").append(
			"<img src='../../image/8.png' style='margin-top:-7px;margin-left:2px;'>"
	);
	
	//添加左上角区域的点击事件，改为添加到图片上点击也行
	$("#" + gridId + "_rn").click(function(){
		showGridCookieDiv(gridId);//调用弹窗方法
	});
	
	//添加拖动列宽度后的触发方法
	$("#" + gridId).setGridParam({
		"resizeStop" : function(){
			var nowColModel = $("#" + gridId).getGridParam("colModel");
			var colWidthArray = [];
			var i = nowColModel[1].name == "cb" ? 3 : 2;//有无复选列
			for( ; i < nowColModel.length; i++){
				if(!nowColModel[i].hidden){
					var width_px = $("#" + gridId + "_" + nowColModel[i].name).css("width");
					colWidthArray.push(parseInt(width_px.substring(0,width_px.length - 2)));
				}
			}
			writeGridCookie(gridId, colWidthArray);//调用写入cookie方法
		}
	});
}


/**
 * 读取cookie，并设置显示隐藏和宽度值到列表上
 * 
 * @Auther HomyZhu
 */
function readGridCookie(gridId){
	
	var cookieName = window.top["GlobalYh"].yhid + window.top["nowMenuId"] + gridId;
	var arr,reg=new RegExp("(^| )" + cookieName + "=([^;]*)(;|$)");
	
	if(arr=document.cookie.match(reg)){
		
		var cookieArray   = arr[2].split("&");
		var colWidthArray = cookieArray[0].split(",");
		var hideColRowIds = cookieArray[1].split(",");//没有隐藏列时，&之后为空，但split结果还是有一个""元素
		
		//显示宽度的列数，和隐藏列的列数，之和应该等于初始可显示列的总数。若不等，则重置此cookie，等用户重新添加
		var allRowIds = $("#gridCookieDiv" + "_" + gridId + "_table").getDataIDs();
		if(hideColRowIds[0] != "" && colWidthArray.length + hideColRowIds.length != allRowIds.length){
			document.cookie = cookieName + "=&";
			return;
		}
		
		var showColRowIds = [];
		var hideColNames  = [];
		var showColNames  = [];
		
		var gridWidth = $("#" + gridId).getGridParam("width");//记录原始宽度
		var allRowIds = $("#gridCookieDiv" + "_" + gridId + "_table").getDataIDs();
		var colModel  = $("#" + gridId).getGridParam("colModel");
		var hideI = 0;
		for(var i in allRowIds){
			if(allRowIds[i] == hideColRowIds[hideI]){
				hideColNames.push(colModel[allRowIds[i]].name);
				hideI++;
			}
			else{
				showColRowIds.push(allRowIds[i]);
				showColNames.push(colModel[allRowIds[i]].name);
			}
		}
		if(hideColNames.length > 0)
			$("#" + gridId).hideCol(hideColNames);	//隐藏列
		$("#" + gridId).showCol(showColNames);		//显示列
		
		$("#" + gridId).setGridWidth(gridWidth);	//恢复原始宽度
		
		for(var i in showColRowIds){
			//此处不要用.width(colWidthArray[i-3])方法，以免设置的宽度和实际有偏差
			$("#" + gridId + "_" + showColNames[i]).css("width", colWidthArray[i] + "px");
			$("#" + gridId + " td:eq(" + showColRowIds[i] + ")").css("width", colWidthArray[i] + "px");
		}
		
		var footDiv = $("#" + gridId).parent().parent().next();
		if(footDiv.length > 0)//grid底部存在汇总栏时，也要设置其宽度
			for(var i in showColRowIds)
				footDiv.find("td:eq(" + showColRowIds[i] + ")").css("width", colWidthArray[i] + "px");
	}
}


/**
 * 写入cookie，有效期设置为10年
 * 
 * @Auther HomyZhu
 */
function writeGridCookie(gridId, colWidthArray, hideColRowIds){
	
	var cookieName = window.top["GlobalYh"].yhid + window.top["nowMenuId"] + gridId;
	
	if(hideColRowIds == undefined){
		var arr,reg=new RegExp("(^| )" + cookieName + "=([^;]*)(;|$)");
		if(arr=document.cookie.match(reg))
			hideColRowIds = arr[2].split("&")[1];
		else
			hideColRowIds = [];
	}
	var cookieValue = "" + colWidthArray + "&" + hideColRowIds;
	
    var expiresDate = new Date();
    expiresDate.setTime(expiresDate.getTime() + 315360000000);//10*365*24*60*60*1000《十年》如果那两个字没有颤抖……
	
	document.cookie = cookieName + "=" + cookieValue+ ";expires=" + expiresDate.toGMTString();
}


/**
 * 显示设置列表的弹窗，设置选中和各列宽度值，点击确定后，先写入cookie再读出cookie并设置到源列表
 * 
 * @Auther HomyZhu
 */
function showGridCookieDiv(gridId){
	
	$("#gridCookieDiv" + "_" + gridId + "_table").trigger("reloadGrid");//取消所有选中的行
	
	var nowColModel = $("#" + gridId).getGridParam("colModel");
	var rowId = nowColModel[1].name == "cb" ? 3 : 2;//有无复选列
	for( ; rowId < nowColModel.length; rowId++){
		var width_px = $("#" + gridId + "_" + nowColModel[rowId].name).css("width");//获取实际宽度值，而不是框架的值
		$("#gridCookieDiv" + "_" + gridId + "_table").setRowData(rowId, {
			"gridCookieColWidth" : parseInt(width_px.substring(0,width_px.length - 2))
		});
		if(!nowColModel[rowId].hidden)
			$("#gridCookieDiv" + "_" + gridId + "_table").setSelection(rowId);//反选id为rowId的行
	}
	
	$("#gridCookieDiv" + "_" + gridId).dialog({
		autoOpen : false,
		modal : true,
		resizable : false,
		title : "设置列表显示内容",
		buttons : {
			
			"确定" : function(){
				var colWidthArray = [];
				var hideColRowIds = [];
				
				var selectRowIds = $("#gridCookieDiv" + "_" + gridId + "_table").getGridParam("selarrrow");
				if(selectRowIds.length == 0){
					$.jqalert("请至少保留一列显示！");
					return;
				}
				selectRowIds = selectRowIds.sort(function(a, b){//排序
					return parseInt(a) - parseInt(b);
				});
				
				var allRowIds = $("#gridCookieDiv" + "_" + gridId + "_table").getDataIDs();
				var totalWidth = 0;
				var i = 0;
				for(var rowId in allRowIds){
					var rowData = $("#gridCookieDiv" + "_" + gridId + "_table").getRowData(allRowIds[rowId]);
					if(allRowIds[rowId] == selectRowIds[i]){
						totalWidth += parseInt(rowData.gridCookieColWidth);
						colWidthArray.push(rowData.gridCookieColWidth);
						i++;
					}
					else
						hideColRowIds.push(allRowIds[rowId]);
				}
				
				//如果保留下的列总宽度比列表窄，就相应全部拉宽
				var gridWidth = parseInt($("#" + gridId).getGridParam("width") - 100);//去掉序号、复选框、滚动条宽度
				if(totalWidth < gridWidth)
					for(var i in colWidthArray)
						colWidthArray[i] = parseInt(parseInt(colWidthArray[i]) * gridWidth / totalWidth);
				
				writeGridCookie(gridId, colWidthArray, hideColRowIds);
				readGridCookie(gridId);
				
				$("#gridCookieDiv" + "_" + gridId).dialog("close");
			},
			"取消" : function(){
				$("#gridCookieDiv" + "_" + gridId).dialog("close");
			}
		},
		width  : 700,
		height : 500,
		position: [ ($(window).width() - 700) / 2, ($(window).height()- 500) / 2 ]
	}).dialog("open");
	
}
