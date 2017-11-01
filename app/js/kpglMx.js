/**
 * 开票管理统一调用界面及方法
 */


//发票对象
var InvObjFpkj;
var bgFilterZ_inv = 1100;
var bgFilterZ_invQd = 1100;
var ShowDivType = "";
var Propath = "../";

var isPlkj = false;				//是否批量开具
var isPause = false;
var plkjStartTime;				//批量开具开始时间
var plkjPauseTime;				//批量开具暂停时间
var IdZlArray = new Array();	//批量开具的发票id、种类列表
var id_zl;						//当前开具的发票id、种类
var nowNum = 0, successNum = 0, halfNum = 0, errorNum = 0;

var browserVersion = "";		//浏览器版本

var wyptjk = 0;//51平台接口调用成功与否 0成功 -2不成功 add by mk

//批量开具调用，集中管理批量开具的各个步骤
function plkjCall(step, jsonArray){
	
	if(step == "begin"){
		
		isPlkj = true;
		isPause = false;
		plkjStartTime = new Date();
		plkjPauseTime = plkjStartTime;
		nowNum = 1, successNum = 0, halfNum = 0, errorNum = 0;
		IdZlArray = jsonArray;
		
		plkjCall("initNextInvoice");
	}
	else if(step == "initNextInvoice"){			//初始化票面数据，存入全局变量InvObjFpkj中
		
		if(IdZlArray.length > 0){
			if(isPause){
				plkjShowPauseMsg();				//点击暂停后，先开具完当前张，再使“继续”的按钮可点击
				return;
			}
			$("#plkjNumNow").html(nowNum ++);
			id_zl = IdZlArray.shift();			//返回并删除第一个元素
			showFpkjDetail('divDkFpInfo', id_zl.id, id_zl.zl, "isPlkj");
		}
		else{
			plkjCall("end");					//全部开完后，跳转到结束步骤
		}
		
	}
	else if(step == "invoiceOk"){				//票面数据准备好后，准备开具
		
		invNotPrint();
	}
	else if(step == "fpkjSuccess"){				//发票开具成功后，执行下一张发票的开具
		plkjShowSuccessMsg();
		plkjCall("initNextInvoice");
	}
	else if(step == "fpkjHalfSuccess"){			//发票开具成功但同步失败后，执行下一张发票的开具
		plkjShowHalfMsg();
		plkjCall("initNextInvoice");
	}
	else if(step == "fpkjError"){				//发票开具失败后，执行下一张发票的开具
		plkjShowErrorMsg();
		plkjCall("initNextInvoice");
	}
	else if(step == "fpkjStop_ajaxError"){		//发票开具出现ajax异常中断后，结束批量开具
		plkjShowErrorMsg();
		plkjCall("initNextInvoice");
	}
	else if(step == "fpkjStop_jspError"){		//发票开具出现金税盘连接异常中断后，结束批量开具
		isPause = true;
		plkjShowErrorMsg("jspError");
	}
	else if(step == "fpkjStop_netError"){		//发票开具出现网络连接异常中断后，结束批量开具
		isPause = true;
		plkjShowErrorMsg("netError");
	}
	else if(step == "end"){						//发票开具结束步骤
		
		plkjShowEndMsg();
	}
	
}

//显示暂停之后的提示信息（执行完当前张开票流程）
function plkjShowPauseMsg(){
	
	$("#plkjResultPre").html("开具暂停，剩余");
	$("#plkjNumResult").css("color", "blue").html(IdZlArray.length);
	
	$("#plkjStatusImg").attr("src", "../images/zan_ting.png");
	
	plkjShowTime();
	
	$("#plkjNowDiv").hide();
	$("#plkjResultDiv").show();
	$("#divPlkj ~ div button:last").removeAttr("disabled");
	$(".ui-dialog-titlebar-close").show();		//右上角的叉号按钮显示
	$("#div_plkj_logs").css("display", "none");
	$("#div_plkj_result").css("display", "block");
}

//显示批量开票成功提示信息
function plkjShowSuccessMsg(){
	successNum ++ ;
	$("#kjSuccess").html(successNum + halfNum);
	$("#tbSuccess").html(successNum);
}

//显示批量开票成功但同步失败提示信息
function plkjShowHalfMsg(){
	halfNum ++ ;
	$("#kjSuccess").html(successNum + halfNum);
	$("#tbError").html(errorNum+halfNum);
	$("#ytbErrorMsg").show();
	$("#divPlkj ~ div button:first").show();
}

//显示批量开票错误提示信息
function plkjShowErrorMsg(errorType){
	errorNum ++ ;
	$("#ykjErrorMsg").show();
	$("#ytbErrorMsg").show();
	$("#kjError").html(errorNum);
	$("#tbError").html(errorNum + halfNum);
	
	if(errorType == "jspError" || errorType == "netError"){
		if(errorType == "jspError")
			$("#plkjResultPre").html("税盘异常，未开");
		else
			$("#plkjResultPre").html("网络异常，未开");
		$("#plkjNumResult").css("color", "red").html(IdZlArray.length);
		$("#plkjStatusImg").attr("src", "../images/hong_cha.png");
		$("#plkjNowDiv").hide();
		$("#plkjResultDiv").show();
		$(".ui-dialog-titlebar-close").show();
		$("#divPlkj ~ div button:last").text("继续开票");
		nowNum -- ;
		errorNum -- ;
		IdZlArray.push(id_zl);//再塞回id_zl，以供继续开票
		$("#divPlkj ~ div button:last").text("重试").removeAttr("disabled");
		$(".ui-dialog-titlebar-close").show();//右上角的叉号按钮显示
		plkjShowTime();
		$("#div_plkj_logs").css("display", "none");
		$("#div_plkj_result").css("display", "block");
	}
	$("#divPlkj ~ div button:first").show();
}

//显示批量开票结束提示信息
function plkjShowEndMsg(){
	
	if(successNum + halfNum > 0){
		$("#plkjResultPre").html("开具完成！　共");
		$("#plkjNumResult").css("color", "blue").html($("#plkjTotal").html());
		$("#plkjStatusImg").attr("src", "../images/lv_gou.png");
	}
	else{
		$("#plkjResultPre").html("开具失败！　共");
		$("#plkjNumResult").css("color", "red").html($("#plkjTotal").html());
		$("#plkjStatusImg").attr("src", "../images/hong_cha.png");
	}
	
	if(successNum > 0 && successNum == $("#plkjTotal").html()){
		$("#plkjResultPre").html("开具成功！　共");
		$("#plkjNumResult").css("color", "green");
	}
	
	plkjShowTime();
	
	$("#plkjNowDiv").hide();
	$("#plkjResultDiv").show();

	$(".ui-dialog-titlebar-close").show();		//右上角的叉号按钮显示
	$("#divPlkj ~ div button:last").text("确定");
	
	//防止最后一张暂停时，瞬间失败变成了确定按钮后，因快速点击没有看清结果页面直接关闭了窗口
	if($("#divPlkj ~ div button:last").attr("disabled") == "disabled"){
		setTimeout(function(){
			$("#divPlkj ~ div button:last").removeAttr("disabled");
		}, 2000);
	}
}

function plkjShowTime(){
	//计算本次开具时间，和总共开具时间
	plkjEndTime = new Date();
	var thisTimeStr = (parseInt(plkjEndTime - plkjPauseTime)/1000).toFixed(3);
	var allTimeStr = (parseInt(plkjEndTime - plkjStartTime)/1000).toFixed(3);
	$("#plkjThisTime").html(thisTimeStr.substring(0, thisTimeStr.length-2));
	$("#plkjAllTime").html(allTimeStr.substring(0, allTimeStr.length-2));
}

function fpkjAlert(msg){
	if(isPlkj)
		$("#div_plkj_logs").append(msg + "<br/><br/>");
	else
		$.jqalert(msg);
}


//显示销售单据详细信息
function showSoldBillDetail(divid,sType,djid,fpzl){
	
	ShowDivType = sType;
	
	loadDivKpgl(divid,fpzl);
	getKpglMxInfo(divid,sType,djid,"getKpglMxInfo");
	
	$("#isHzfwQy").val($("#user_isHzfwQy").val());							//销方是否汉字防伪企业  0 否; 1 是;
	
}


//显示待开发票详细信息
function showDkfpDetail(divid,djid,fpzl){
	
	ShowDivType = "dk";
	isPlkj = false;
	
	loadDivKpgl(divid,fpzl);
	getKpglMxInfo(divid,'dk',djid,"getDkfpInfo");
	
	$("#isHzfwQy").val($("#user_isHzfwQy").val());							//销方是否汉字防伪企业  0 否; 1 是;
}


//显示发票开具待开票信息
function showFpkjDetail(divid,djid,fpzl,isPlkjStr){
	
	ShowDivType = "fpkj";
	isPlkj = isPlkjStr == "isPlkj";
	
	loadDivKpgl(divid,fpzl);
	getKpglMxInfo(divid,'fpkj',djid,"getDkfpInfo");
	
	$("#isHzfwQy").val($("#user_isHzfwQy").val());							//销方是否汉字防伪企业  0 否; 1 是;
}


//开票申请新增
function showSqfpAdd(divid){
	
	ShowDivType = "sqa";
	
	loadDivKpgl(divid, $("#page_kplx").val());
	
	$("#loadingProgress").css("display","block");
	setTimeout(function(){
		initBmKpfwq();//机构树 开票服务器下拉 初始化
		getSqdbh();//获取申请单编号并赋值
		$("#loadingProgress").css("display","none");
	},1);	//开票申请新增加载信息，延时加载
	
	showDivInfo(divid,'sqa',$("#page_kplx").val());
	
	$("#txtsq_sqrq").val(getNowDate("rq"));
	$("#txtsq_sqry").val($("#user_czrymc").val());
	$("#txtsq_sqryid").val($("#user_yhid").val());
	
	$("#xhdwsh").val($("#user_nsrsbh").val());
	$("#xhdwmc").val($("#user_nsrmc").val());
	$("#kprtxt").val($("#user_czrymc").val());
	$("#xhdwdzdh").val($("#user_xfdzdh").val());
	$("#xhdwyhzh").val($("#user_xfyhzh").val());
	
	
	$("#dkfpxx_xfkpfs").val(window.top["GlobalYh"].kpfs);					//销方开票方式 0 服务器版开票; 1 单机版开票;
	$("#isHzfwQy").val($("#user_isHzfwQy").val());							//销方是否汉字防伪企业  0 否; 1 是;
	initKpfsHzfw(window.top["GlobalYh"].kpfs, window.top["GlobalYh"].hzfw);	//初始化根据销方开票方式确定开票服务器及开票点信息展示
	
	initCezs_kceInputType();//初始化差额征税输入框只能输入两位小数的功能
}


//开票申请修改
function showSqfpUpdate(divid,sType,djid,fpzl){
	
	ShowDivType = sType;
	
	loadDivKpgl(divid,fpzl);
	
	$("#dkfpxx_xfkpfs").val(window.top["GlobalYh"].kpfs);					//销方开票方式 0 服务器版开票; 1 单机版开票;
	
	getKpglMxInfo(divid,sType,djid,"getDkfpInfo");
	
	initCezs_kceInputType();
}


//机构树 开票服务器下拉(根据当前操作员的销方税号) 初始化
function initBmKpfwq(sType){
	
	var qxbmmc = $('#user_qxbmmc').val();
	var qxbmid = $('#user_qxbmid').val();
	
	//带出申请部门和指定审核部门的名称及id
	if(qxbmmc != undefined && qxbmmc != null){
		$("#txtsq_sqbmmc").val(qxbmmc);
		$("#txtsq_shbmmc").val(qxbmmc);
	}
	if(qxbmid != undefined && qxbmid != null){
		$("#txtsq_sqbmid").val(qxbmid);
		$("#txtsq_shbmid").val(qxbmid);
	}
	
	var nsrsbh = $('#user_nsrsbh').val();
	loadKpfwqList(nsrsbh, 'selsq_kpfwq', 'selsq_kpd');
	loadYwlbList("selsq_ywlb");//加载业务类别

}


//初始化差额征税输入框只能输入两位小数的功能
function initCezs_kceInputType(){
	
	$("#cezs_kce").keyup(function() {
		var tmptxt = $(this).val();
		tmptxt = tmptxt.replace(/[^.0-9]/g, '');//限制只能输入数字和小数点
		while(tmptxt.length > 1 && tmptxt.charAt(0) == 0)
			tmptxt = tmptxt.substring(1, tmptxt.length);//去除数字开头多余的0
		$(this).val(tmptxt);
		
		var pointIndex = $(this).val().indexOf(".");
		if(pointIndex>=0){
			var zhengShu = $(this).val().substring(0, pointIndex);
			var xiaoShu  = $(this).val().substring(pointIndex + 1, $(this).val().length);
			$(this).val(zhengShu + "." + xiaoShu.replace(/\D/g, '').substring(0, 2));//限制小数点后最多两位小数
		}
	}).bind("paste", function() {
		var tmptxt = $(this).val();
		tmptxt = tmptxt.replace(/[^.0-9]/g, '');//限制只能输入数字和小数点
		while(tmptxt.length > 1 && tmptxt.charAt(0) == 0)
			tmptxt = tmptxt.substring(1, tmptxt.length);//去除数字开头多余的0
		$(this).val(tmptxt);
		
		var pointIndex = $(this).val().indexOf(".");
		if(pointIndex>=0){
			var zhengShu = $(this).val().substring(0, pointIndex);
			var xiaoShu  = $(this).val().substring(pointIndex + 1, $(this).val().length);
			$(this).val(zhengShu + "." + xiaoShu.replace(/\D/g, '').substring(0, 2));
		}
	}).css("ime-mode", "disabled");
}


//显示审核信息
function showShfpDetail(divid,sType,djid,fpzl,checkDef){
	
	ShowDivType = sType;
	isPlkj = false;
	
	loadDivKpgl(divid,fpzl);
	
	$("#txtsh_shsj").val(getNowDate("rq"));
	$("#txtsh_shry").val($("#user_czrymc").val());
	$("#txtsh_shryid").val($("#user_yhid").val());
	$("#dkfpxx_xfkpfs").val(window.top["GlobalYh"].kpfs);					//销方开票方式　0 服务器版开票; 1 单机版开票;
	
	var qxbmmc = $('#user_qxbmmc').val();
	var qxbmid = $('#user_qxbmid').val();
	
	//带出审核部门的名称及id
	if(qxbmmc != undefined && qxbmmc != null)
		$("#txtsh_shbmmc").val(qxbmmc);
	if(qxbmid != undefined && qxbmid != null)
		$("#txtsh_shbmid").val(qxbmid);
	
	getKpglMxInfo(divid,sType,djid,"getDkfpInfo");
	
	if(checkDef != undefined){
		$("#rad_pass").attr("disabled",true);
		$("#rad_reject").attr("disabled",true);
		if(checkDef == "rad_reject")
			$("#rad_reject").attr("checked","checked");
	}
}



//显示票面明细
function showDivInfo(divid,sType,fpzl){
	var title_xz = "";

	switch(sType){
		case "kpsh" : title_xz = "开票审核"; break;
		case "kpshv" : title_xz = "开票审核信息"; break;
		case "ckpsh" : title_xz = "重开票审核"; break;
		case "ckpshv" : title_xz = "重开票审核信息"; break;
		case "sqa" : title_xz = "开票申请"; break;
		case "sqv" : title_xz = "开票申请信息"; break;
		case "squ" : title_xz = "开票申请修改"; break;
		case "djv" : title_xz = "销售单据信息"; break;
		case "dju" : title_xz = "销售单据修改"; break;
		case "fpkj" : title_xz = "发票开具"; break;
		case "fpht" : title_xz = "发票回退"; break;
		default : title_xz = "待开发票信息";
	}
	
	$("#otherDivdj").css("display", "none");
	$("#otherDivsq").css("display", "none");
	$("#otherDivdk").css("display", "none");
	$("#checkDiv").css("display", "none");
	
	$("#divBtn_sq").css("display", "none");
	$("#checkKpsh").css("display", "none");
	$("#checkCkpsh").css("display", "none");
	$("#checkfpBack").css("display", "none");
	$("#savedj").css("display", "none");
	$("#InvPrint").css("display", "none");
	$("#InvNotPrint").css("display", "none");
	
	$("#list_id").attr("disabled", "disabled");
	$("#red_out").attr("disabled", "disabled");
	$("#blue_out").attr("disabled", "disabled");
	
	$("#txtsq_xsdjrq").css("display", "none");	//销售单据日期数据项默认隐藏
	
	if(sType == 'kpsh' || sType == 'kpshv'){
		$("#otherDivsq").css("display", "block");
		$("#checkDiv").css("display", "block");
		
		if(sType == 'kpsh')
			$("#checkKpsh").css("display", "block");
		
		if($("#djly").val() == 'xsd'){
			$("#txtsq_xsdjrq").css("display", "block");
			$("#txtsq_sqry").css("display", "none");
			$("#tr_sq_sqrqly").css("display", "none");
			$("#td_sq_sqrysj").html("单据日期：");
			$("#td_sq_djbh").html("单据编号：");
			$("#td_sq_sqjg").html("开具机构：");
		}
	}
	if(sType == 'ckpsh' || sType == 'ckpshv' || sType == 'fpht'){
		$("#otherDivdk").css("display", "block");
		$("#checkDiv").css("display", "block");
		$("#txtsh_shbmmc").attr("disabled","disabled");
		
		if(sType == 'ckpsh')
			$("#checkCkpsh").css("display", "block");
		if(sType == 'fpht')
			$("#checkfpBack").css("display", "block");			
	}
	if(sType == 'dk'){
		$("#otherDivdk").css("display", "block");
	}
	if(sType == 'sqa' || sType == 'squ'){
		$("#divBtn_sq").css("display", "block");
		$("#otherDivsq").css("display", "block");
		
		$("#xhdwsh").attr("disabled","disabled");
		$("#xhdwmc").attr("disabled","disabled");
		
		if(sType == 'sqa'){
			$("#copyBlueInv").css('opacity', 0.5);
			$("#copyBlueInv").attr('disabled', 'disabled');
		}
		
		$("#list_id").removeAttr("disabled");
		$("#red_out").removeAttr('disabled');
		$("#blue_out").removeAttr('disabled');
		$("#kprtxt").attr("disabled","disabled");
	}
	if(sType == 'djv'){
		$("#tr_fp_title").css("display", "none");
		$("#tr_fp_type").css("display", "none");
		$("#otherDivdj").css("display", "block");
		$("#divBtn_hsqdbz").css("display", "none");
		$("#divBtn_redAndBlue").css("display", "none");
	}
	if(sType == 'dju'){
		$("#tr_fp_title").css("display", "none");
		$("#tr_fp_type").css("display", "none");			
		$("#otherDivdj").css("display", "block");
		$("#savedj").css("display", "block");
		$("#divBtn_hsqdbz").css("display", "none");
		$("#divBtn_redAndBlue").css("display", "none");
	}
	if(sType == 'fpkj'){
		if($("#fpzl").val() == "51"){
			$("#InvPrint").css("display", "none");
			$("#InvNotPrint").html("<i class=\"ace-icon fa fa-print bigger-110\"></i>开具");
		}
		else
			$("#InvPrint").css("display", "block");
		
		$("#InvNotPrint").css("display", "block");
		$("#otherDivdk").css("display", "block");
		
	}
	if(sType == 'sqv' || sType == 'kpsh' || sType == 'kpshv' || sType == 'dk' || sType == 'fpkj'){
		$("#txtsq_sqbmmc").attr("disabled","disabled");
		$("#txtsq_shbmmc").attr("disabled","disabled");
		$("#txtsh_shbmmc").attr("disabled","disabled");	//审核机构不可更改
		$("#txtsq_sqly").attr("disabled","disabled");
		$("#selsq_kpfwq").attr("disabled","disabled");
		$("#selsq_kpd").attr("disabled","disabled");
		$("#selsq_hzbs").attr("disabled","disabled");
		$("#selsq_ywlb").attr("disabled","disabled");	//业务类别
		
		$("#list_id").attr("disabled","disabled");
		$("#red_out").removeAttr('onClick');
		$("#blue_out").removeAttr('onClick');
		
		if(sType == 'kpsh' || sType == 'fpkj')
			$("#hs_id").attr("disabled","disabled");
		else
			$("#hs_id").removeAttr("disabled");
		
		if(sType == 'sqv')
			$("#otherDivsq").css("display", "block");
	}
	if(sType == 'kpshv' || sType == 'ckpshv'){
		$("#txtsh_shbmmc").attr("disabled","disabled");
		$("#txtsh_shyj").attr("disabled","disabled");
		$("#rad_pass").attr("disabled","disabled");
		$("#rad_reject").attr("disabled","disabled");
	}
	
	if(window.top["GlobalisHaveHzbs"] == 0){
		$("[id=td_hzbs]").css("display", "none");
	}
	
	if(fpzl == "0" || fpzl == "2" || fpzl == "51"){
		if(fpzl == "51"){
			$("#list_id").hide();
			$("#list_span").hide();
		}
		
		if(sType != 'sqa' && sType != 'squ'){
			if(sType != 'dju'){
				$("#fpzl").attr("disabled","disabled");
				$("#ghdwmc").attr("disabled","disabled");
				$("#ghdwsh").attr("disabled","disabled");
				$("#xhdwmc").attr("disabled","disabled");
				$("#xhdwsh").attr("disabled","disabled");
				$("#xhdwdzdh").attr("disabled","disabled");
				$("#xhdwyhzh").attr("disabled","disabled");
				$("#bz").attr("disabled","disabled");
				$("#kprtxt").attr("disabled","disabled");
				
				if(sType != 'fpkj'){
					$("#ghdwdzdh").attr("disabled","disabled");
					$("#ghdwyhzh").attr("disabled","disabled");
					$("#skr").attr("disabled","disabled");
					$("#fhr").attr("disabled","disabled");
				}
			}
			$("[name='checkSp']").attr("disabled","disabled");
			$("[name='spmc_kp']").attr("disabled","disabled");
			$("[name='ggxh_kp']").attr("disabled","disabled");
			$("[name='jldw_kp']").attr("disabled","disabled");
			$("[name='sl_kp']").attr("disabled","disabled");
			$("[name='dj_kp']").attr("disabled","disabled");
			$("[name='je_kp']").attr("disabled","disabled");
			$("[name='slv_kp']").attr("disabled","disabled");
			$("[name='se_kp']").attr("disabled","disabled");
		}
	}
	
	if(fpzl == "11") {
		$("#discount").css("display", "none");
		$("#list_id").css("display", "none");
		$("#list_span").css("display", "none");
		$("#copyBlueInv").css("display", "none");
		//sqa开票申请 sqv开票申请信息 squ开票申请修改
		if(sType == 'sqa' || sType == 'squ' || sType == 'sqv'){	
			$("#blue_out").attr("disabled",true);
			$("#red_out").removeAttr('disabled');
		}
		if(sType != 'sqa' && sType != 'squ'){
			if(sType != 'dju'){
				$("#xhdwmc").attr("disabled","disabled");
				$("#xhdwsh").attr("disabled","disabled");
				$("#kprtxt").attr("disabled","disabled");
				
				$("#infoClientName").attr("disabled","disabled");
				$("#infoClientTaxCode").attr("disabled","disabled");
				$("#consignerName").attr("disabled","disabled");
				$("#consignerTaxCode").attr("disabled","disabled");
				$("#shipperName").attr("disabled","disabled");
				$("#shipperTaxCode").attr("disabled","disabled");
				$("#originViaArrivalPlace").attr("disabled","disabled");
				$("#infoListName").attr("disabled","disabled");
				
				$("#vehicleKindNo").attr("disabled","disabled");
				$("#vehicleTonnage").attr("disabled","disabled");
				$("#infoNotes").attr("disabled","disabled");
				$("#infoCashier").attr("disabled","disabled");
				$("#infoChecker").attr("disabled","disabled");
				$("#infoInvoicer").attr("disabled","disabled");
				$("#red_out").attr("disabled",true);
			}
			$("[name='checkSp']").attr("disabled","disabled");
			$("#infoTaxRate").attr("disabled","disabled");
			$("[name='spmc_kp']").attr("disabled","disabled");
			$("[name='je_kp']").attr("disabled","disabled");
		}
	}
	
	if(fpzl == "12"){
		$("#discount").css("display", "none");
		$("#spaddRow").css("display", "none");
		$("#spdelRow").css("display", "none");
		$("#hs_id").css("display", "none");
		$("#hs_span").css("display", "none");
		$("#list_id").css("display", "none");
		$("#list_span").css("display", "none");
		
		if(sType != 'sqa' && sType != 'squ'){
			if(sType != 'dju'){
				$("#xhdwmc").attr("disabled","disabled");
				$("#xhdwsh").attr("disabled","disabled");
				$("#kprtxt").attr("disabled","disabled");
				
				$("#jdc_gfmc").attr("disabled","disabled");
				$("#jdc_gmfzzjgdm").attr("disabled","disabled");
				$("#jdc_gmfnsrsbh").attr("disabled","disabled");
				$("#jdc_cllx").attr("disabled","disabled");
				$("#jdc_cpxh").attr("disabled","disabled");
				$("#jdc_cd").attr("disabled","disabled");
				$("#jdc_hgzh").attr("disabled","disabled");
				$("#jdc_jkzmsh").attr("disabled","disabled");
				$("#jdc_sjdh").attr("disabled","disabled");
				$("#jdc_fdjhm").attr("disabled","disabled");
				$("#jdc_clsbdh").attr("disabled","disabled");
				$("#jdc_jshjxx").attr("disabled","disabled");
				$("#jdc_xhdwdh").attr("disabled","disabled");
				$("#jdc_xhdwzh").attr("disabled","disabled");
				$("#jdc_xhdwdz").attr("disabled","disabled");
				$("#jdc_xhdwkhyh").attr("disabled","disabled");
				$("#jdc_zzssl").attr("disabled","disabled");
				$("#jdc_zgswjgmc").attr("disabled","disabled");
				$("#jdc_zgswjgdm").attr("disabled","disabled");
				$("#jdc_dw").attr("disabled","disabled");
				$("#jdc_xcrs").attr("disabled","disabled");
				$("#jdc_scqymc").attr("disabled","disabled");
				
			}
		}
	}
	
	if(fpzl == "41" ){
		$("#list_id").hide();
		$("#list_span").hide();
		$("#hs_id").hide();
		$("#hs_span").hide();
		
		if(sType != 'sqa' && sType != 'squ'){
			$("#fpzl").attr("disabled","disabled");
			$("#ghdwmc").attr("disabled","disabled");
			$("#ghdwsh").attr("disabled","disabled");
			$("#xfmcjp").attr("disabled","disabled");
			$("#xfshjp").attr("disabled","disabled");
			$("#sky").attr("disabled","disabled");
				
			$("[name='checkSp']").attr("disabled","disabled");
			$("[name='spmc_kp']").attr("disabled","disabled");
			$("[name='sl_kp']").attr("disabled","disabled");
			$("[name='dj_kp']").attr("disabled","disabled");
			$("[name='je_kp']").attr("disabled","disabled");
		
		}
	}
	
	openXxfpDialog(divid, title_xz);
	
}


//获取销售单据或待开发票信息
function getKpglMxInfo(divid,sType,djid,subValue){
	if(!isPlkj){
		$("#bgFilter").css("display", "block");
		$("#loadingProgress").css("display", "block");
	}
	
	$.ajax({
		type : "post",
		url : "../../kpgl/dkpgl/queryDkpById.action",
		data : {
			'xsdid' : djid, 
			'saveType' : sType 
		},
		dataType : 'json',
		success : function(data){
			
			if(data.retCode != 0){
				if(isPlkj){
					fpkjAlert("读取发票信息异常，无法从服务器加载待开发票数据，停止批量开票！<br>" + data.retMsg);
					if(data.retCode == -1)
						plkjCall("fpkjStop_ajaxError");	//ajax异常返回-1
					else
						plkjCall("fpkjStop_netError");	//网络异常返回-2
				}
				else{
					fpkjAlert("读取发票信息异常，无法从服务器加载待开发票数据！<br>" + data.retMsg);
					$("#bgFilter").css("display", "none");
					$("#loadingProgress").css("display", "none");
				}
				return;
			}
			
			var obj = data;
			var xxfpMxList;
			
			$("#dkfpxx_xfkpfs").val(obj["master"].kpfs); 			//开票方式
			//$("#isHzfwQy").val(obj["master"].hzfw);					//是否汉字防伪企业
			initKpfsHzfw($("#dkfpxx_xfkpfs").val(), $("#isHzfwQy").val());	//初始化根据销方开票方式确定开票服务器及开票点信息展示
			
			//审核时判断是否已审核
			if(sType == "kpsh" || sType == "ckpsh"){
				if(obj["master"].ywzt == 2 || obj["master"].ywzt == 3){
					$.jqalert("该待开销项发票信息已审核！");
					$("#divDkFpInfo").dialog("close");
					return false;
				}
			}
			if(sType == "dju" || sType == "djv"){
				xxfpMxList = obj.xsdMxList;
				$("#hiddj_id").val(obj["master"].id);
				$("#txtdj_xsdjbh").val(obj["master"].xsdjbh);
				$("#txtdj_kjrq").val(obj["master"].kjrq);
				$("#txtdj_xsdzt").val(obj["master"].xsdzt == "0" ? "未拆分" : "已拆分");
			}
//			if(sType == "fpht" && obj["master"].sjly == 0 && obj["master"].isXsdckp == "N"){//销售单拆分的待开发票，不能回退
//				$.jqalert("该待开销项发票信息来源为销售单，无法回退！");
//				$("#divDkFpInfo").dialog("close");
//				return false;
//			}
			if(sType == "dk" || sType == "ckpsh" || sType == "ckpshv" || sType == "fpkj" || sType == "fpht"){
				xxfpMxList = obj.dkXxfpMx;
				
				var sjly = obj["master"].sjly;
				if(sjly == 0)	sjly = "销售单";
				else if(sjly == 1)	sjly = "开票申请单";
				else if(sjly == 2)	sjly = "红票申请单";
				else sjly = "";
				
				var kpbz = obj["master"].kpbz;
				if(kpbz == 0)	kpbz = "未开";
				else if(kpbz == 1)	kpbz = "已开";
				else if(kpbz == 2)	kpbz = "重开";
				else kpbz = "";
				
				var hzbs = obj["master"].hzbs;
				if(hzbs == "Y")		hzbs = "汇总业务";
				else if(hzbs == "N")	hzbs = "属地业务";
				else hzbs = "";
				
				$("#txtdk_djbh").val(obj["master"].djbh);
				$("#txtdk_bmmc").val(obj["master"].sqjgmc);
				$("#txtdk_sjly").val(sjly);
				$("#txtdk_kpbz").val(kpbz);
				$("#txtdk_kpfwqmc").val(obj["master"].kpfwqmc);
				$("#txtdk_kpdmc").val(obj["master"].kpdmc);
				$("#txtdk_kpfwqmc").attr("title", obj["master"].kpfwqh);
				$("#txtdk_kpdmc").attr("title", obj["master"].kpdh);
				$("#txtdk_hzbs").val(hzbs);
				$("#txtdk_ywlb").val(obj["master"].ywxtmc);
				$("#dk_wddm").val(obj["master"].wddm);
				
				$("#fplbdm").html(obj["master"].fpdm);
				$("#fphm").html(obj["master"].fphm);
				
				$("#kprq").html((obj["master"].kprq != null && obj["master"].kprq != "") ? obj["master"].kprq.substring(0,10) : obj["master"].kprq);
				
				if(obj["master"].sjly == "0"){//待开发票，单据来源为销售单，就显示销售单编号字段
					$("#txtdk_xsdjbh").val(obj["master"].xsdjbh);
				}
				else{//非销售单，就隐藏销售单据编号
					$("#txtdk_xsdjbh_title").css("display", "none");
					$("#txtdk_xsdjbh").css("display", "none");
				}
				
				//如果“开票人”缺失，则增加当前用户名称为开票人
				if( obj["master"].kpr==null || obj["master"].kpr=="" )
					obj["master"].kpr = $("#user_czrymc").val();//开票人初始化
				
				$("#hiddj_id").val(obj["master"].id);
				$("#hidsq_id").val(obj["master"].id);
				
				if(obj["master"].kpfs == "1") //如果销方开票方式为单机版，开票点名称显示开票机号
					$("#txtdk_kpdmc").val(obj["master"].kpdh);
			}
			if(sType == "squ" || sType == "sqv" || sType == "kpsh" || sType == "kpshv"){
				xxfpMxList = obj.dkXxfpMx;
				
				$("#hidsq_id").val(obj["master"].id);
				$("#hiddj_id").val(obj["master"].id);
				$("#txtsq_sqdbh").val(obj["master"].djbh);
				
				loadKpfwqList(obj["master"].xfsh, 'selsq_kpfwq', 'selsq_kpd', obj["master"].kpfwqh);
				getKpd('selsq_kpfwq', 'selsq_kpd', obj["master"].kpdh, obj["master"].kpfwqh, obj["master"].xfsh);
				loadYwlbList("selsq_ywlb",obj["master"].djlybs);//加载业务类别
				
				$("#txtsq_sqbmmc").val(getBmmcById(obj["master"].sqbmid));
				$("#txtsq_sqbmid").val(obj["master"].sqbmid);
				$("#txtsq_sqry").val(obj["master"].sqry);
				$("#txtsq_sqryid").val(obj["master"].sqryid);
				$("#txtsq_shbmmc").val(getUpBmmcById(obj["master"].shbmid));
				$("#txtsq_shbmid").val(obj["master"].shbmid);
				$("#txtsq_sqrq").val(obj["master"].sqsj);	//申请日期
				$("#txtsq_xsdjrq").val(obj["master"].sqsj);	//销售单据日期
				$("#txtsq_sqly").val(obj["master"].sqly);
				$("#selsq_hzbs").val(obj["master"].hzbs);
				
				$("#txtsh_lcid").val(obj["master"].lcmxid);
				
				if(sType == "kpsh")
					obj["master"].fhr = $("#user_czrymc").val();
			}
			if(sType == "kpshv" || sType == "ckpshv"){
				$("#txtsh_shbmmc").val(obj["master"].sjshbmmc);
				$("#txtsh_shbmid").val(obj["master"].sjshbmid);
				$("#txtsh_shsj").val(obj["master"].shsj);
				$("#txtsh_shry").val(obj["master"].shr);
				$("#txtsh_shryid").val(obj["master"].shry);
				$("#txtsh_shyj").val(obj["master"].shyj);
				
				if(obj["master"].ywzt == 2)
					$("#rad_reject").attr("checked","checked");
				if(obj["master"].ywzt == 3)
					$("#rad_pass").attr("checked","checked");
			}
			
			$("#fpzl").val(obj["master"].fpzl);
			if(obj["master"].fpzl == 2){
				$("#span_fpzl").html("增值税普通发票");
			} else if(obj["master"].fpzl == 51){
				$("#span_fpzl").html("电子增值税普通发票");
			}
			
			//正数负数发票转换
			var tkType = obj["master"].hjje < 0 ? "red" : "blue";
			pthzfptksq(tkType, "1");
			
			//以下为三个票种不同的票面赋值
			InvObjFpkj = objToInvoice(obj, xxfpMxList, 1);//1表示申请单或待开，2表示选择蓝票，3表示发票复制，4表示已开查询
			
			/*if(sType == "fpkj"){		//发票开具时带出当前操作员名称
				if(obj["master"].fpzl == 0 || obj["master"].fpzl == 2 || obj["master"].fpzl == 51)
					InvObjFpkj.issuer = $("#user_czrymc").val();//专普票开票人
				else
					InvObjFpkj.infoInvoicer = $("#user_czrymc").val();//货运机动车票开票人
			}*/
			
			setInvoicePage(InvObjFpkj);//设置票面
			
			//货运票负票，需要把合计金额、税额转为负数
			if(obj["master"].fpzl == 11 && obj["master"].hjje < 0){
				var hjje = $('#zje').html();
				hjje = hjje.substr(1, hjje.length);
				$('#zje').html('￥-' + hjje);
				
				var hjse = $('#zse').html();
				hjse = hjse.substr(1, hjse.length);
				$('#zse').html('￥-' + hjse);
				
				var jshj = $('#jshj').html();
				jshj = jshj.substr(1, jshj.length);
				$('#jshj').html('￥-' + jshj);
				$('#jshjdx').html(todx(-jshj));//价税合计大写
			}
			
			if(sType == "squ" && xxfpMxList != null && xxfpMxList.length > 0){
				if(xxfpMxList[0].cezs != undefined && xxfpMxList[0].cezs != null && xxfpMxList[0].cezs != ""){
					$("#list_id").attr("disabled","disabled");
					$("#cezs_img").removeClass("fa-times");
					$("#cezs_img").addClass("fa-times-circle");
				}
			}
			
			if(sType == "fpkj")
				getInvInfo(obj["master"].fpzl, "fpno");//获取下张代码号码，在此方法中再来调用显示票面的showDivInfo方法
			else{
				showDivInfo(divid,sType,obj["master"].fpzl);
				$("#bgFilter").css("display", "none");
				$("#loadingProgress").css("display", "none");
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			if(isPlkj){
				fpkjAlert("读取发票信息异常，无法从服务器加载待开发票数据，停止批量开票！");
				plkjCall("fpkjStop");
			}
			else{
				$("#bgFilter").css("display", "none");
				$("#loadingProgress").css("display", "none");
			}
		}
	});

}



//保存销售单据或待开发票信息	xsdjEdit:销售单据保存; kpsqEdit:申请单保存 审核保存; shlcEdit:开票申请，重开票申请 审核保存
function saveBillXxfpInfo(subValue, subType, fpzl){
	
	if($("#cezs_0").val() != "" && $("#cezs_0").val() != undefined){
		if($("#flbm_0").val() == "" || $("#flbm_0").val() == undefined){
			$.jqalert("差额征税的发票商品行必须为已录入分类编码的商品！");
			return;
		}
	}
	
	var xxfpJson = {};
	var xxfpMxListJson = new Array();
	var lcmxJson = {};
	var saveType = "";
	
	var invObj = getInvoiceFromPage();
	
	//过滤前后空格 tab 回车
	if($('#fpzl').val()=="41"){
		invObj = checkJpStr(invObj);
	}else if(fpzl == "0" || fpzl == "2" || fpzl == "51"){
		invObj = checkGLStr(invObj);
	}else if(fpzl == "11"){
		invObj = checkHypStr(invObj);
	}
	
	if(subValue == "kpsqEdit"){
		if(!checkInv(invObj, "", "checkAllNotFlbm"))	//开票信息校验
			return;
	}
	
	xxfpJson = InvoiceToXxfpJson(invObj, subValue);
	xxfpMxListJson = InvoiceToXxfpMxListJson(invObj, subValue);
	
	if(subValue == "xsdjEdit" && subType == "djbc"){
		xxfpJson["id"] = $("#hiddj_id").val();
	}
	
	if(subValue == "kpsqEdit"){
		xxfpJson["id"] = $("#hidsq_id").val();
		
		saveType = $("#hidsq_id").val() == "" ? "add" : "edit";
		
		var kpfwqh_yz = $("#selsq_kpfwq").val();
		var kpdh_yz = $("#selsq_kpd").val();
		if(kpfwqh_yz == null || kpfwqh_yz == "" || kpdh_yz == null || kpdh_yz == ""){
			if($("#dkfpxx_xfkpfs").val() == "1")
				$.jqalert("开票申请必须指定开票机号！");
			else
				$.jqalert("开票申请必须指定开票服务器跟开票点！");
			return;
		}
		
		xxfpJson["djbh"] = $("#txtsq_sqdbh").val();
		
		if(xxfpJson["djbh"] == ""){
			$.jqalert("开票申请必须获取申请单编号！");
			return;
		}
		
		xxfpJson["kpfwqh"] = $("#selsq_kpfwq").val();
		xxfpJson["kpdh"] = $("#selsq_kpd").val();
		xxfpJson["hzbs"] = $("#selsq_hzbs").val();
		
		if(subType == "sqzc")
			xxfpJson["ywzt"] = "0";
		if(subType == "sqtj")
			xxfpJson["ywzt"] = "1";
		xxfpJson["sqry"] = $("#txtsq_sqry").val();
		xxfpJson["sqczryid"] = $("#txtsq_sqryid").val();
		xxfpJson["sqczrymc"] = $("#txtsq_sqry").val();
		xxfpJson["sqbmid"] = $("#txtsq_sqbmid").val();
		xxfpJson["sqly"] = $("#txtsq_sqly").val();
		xxfpJson["shbmid"] = $("#txtsq_shbmid").val();
		xxfpJson["djlybs"] = $("#selsq_ywlb").val();		//业务类别获取，已更名为系统编码//2016-09-07 重新更名为业务类别
	}
	
	if(subValue == "shlcEdit"){
		saveType = subType;
		
		var ywzt = $('input:radio[name="rd_sh"]:checked').val();
		if(ywzt == undefined || ywzt == null){
			$.jqalert("请选择审核结果！");
			return;
		}
		xxfpJson["id"] = $("#hiddj_id").val();
		xxfpJson["ywzt"] = ywzt;
		xxfpJson["shry"] = $("#user_yhid").val();
		xxfpJson["shczryid"] = $("#user_czryid").val();
		xxfpJson["shczrymc"] = $("#txtsh_shry").val();
		xxfpJson["shyj"] = $("#txtsh_shyj").val();
		xxfpJson["sjshbmid"] = $("#txtsh_shbmid").val();
	}
	var url = "../../kpgl/kpsq/" + subValue + ".action";
	
	if(subType == 'auditRe'){
		url = "../../kpgl/dkpgl/checkBackDkpgl.action";
	}
	else if(subType == 'auditKp'){
		url = "../../kpgl/kpsh/shlcEditKpsh.action";
	}else if (subType == 'auditCkp'){
		url = "../../kpgl/ckpsh/shCkpsh.action";
	}
	
	
	$.ajax({
		type : "post",
		url : url,
		data : {
			'xsdxxJsonStr' : $.toJSON(xxfpJson), 
			'xxfpJsonStr' : $.toJSON(xxfpJson), 
			'mxListJsonStr' : $.toJSON(xxfpMxListJson), 
		/*	'lcmxJsonStr' : $.toJSON(lcmxJson), */
			'saveType' : saveType 
		},
		dataType : 'json',
		beforeSend : function() {
			$("#bgFilter").css("display", "block");
			$("#loadingProgress").css("display", "block");
		},
	  	complete : function() {
			$("#bgFilter").css("display", "none");
			$("#loadingProgress").css("display", "none");
		},
		success : function(data) {
			
            var code = data.code;
            var message = data.msg;
            
            if(subType == "auditRe" && code == 0)
            	message = "发票回退成功.";
            if(subType == "auditCkp" && code == 0)
            	message = "重开票审核成功.";
            
            if(code == 0){
            	$.jqalert(message);
            	$("#divDkFpInfo").dialog("close");
            	if(document.title == "增值税开票申请")
            		queryKpsq();
            	else if(document.title == "待开票管理")
            		query("dkpgl");
            	else if(document.title == "发票开具管理")
            		query("fpkjgl");
            	else if(document.title == "重开票审核")
            		query("ckpsh");
            	else if(document.title == "开票审核")
            		queryKpsh();
            }else{
            	$.jqalert(message);
            }
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
			return;
	  	}
	});
	
}

/**
 * 发票信息 过滤前后空格 回车换行 开票前对发票数据统一处理
 * @param {invGl}
 */
function checkGLStr(invGl) {
	invGl.customerName = GLStrEnterSp(invGl.customerName);
	invGl.customerTaxNr = GLStrEnterSp(invGl.customerTaxNr);
	invGl.customerAddressTel = GLStrEnterSp(invGl.customerAddressTel);
	invGl.customerBankAccountNr = GLStrEnterSp(invGl.customerBankAccountNr);
	invGl.sellerName = GLStrEnterSp(invGl.sellerName);
	invGl.sellerTaxNr = GLStrEnterSp(invGl.sellerTaxNr);
	invGl.sellerAddressTel = GLStrEnterSp(invGl.sellerAddressTel);
	invGl.sellerBankAccountNr = GLStrEnterSp(invGl.sellerBankAccountNr);
	//invGl.memo = GLStrEnterSp(invGl.memo);
	//invGl.memo = $.trim(invGl.memo).replace(/[\r\n]+/g," ");
	invGl.issuer = GLStrEnterSp(invGl.issuer);
	invGl.checker = GLStrEnterSp(invGl.checker);
	invGl.payee = GLStrEnterSp(invGl.payee);
	
	for(var i in invGl.invoiceItems){
		invGl.invoiceItems[i].productName = GLStrEnterSp(invGl.invoiceItems[i].productName);
		invGl.invoiceItems[i].productUnit = GLStrEnterSp(invGl.invoiceItems[i].productUnit);
		invGl.invoiceItems[i].productSpec = GLStrEnterSp(invGl.invoiceItems[i].productSpec);
		
		//单价数量不为空，则计量单位传全角空格
		if($("#dkfpxx_xfkpfs").val() == "1" && invGl.invoiceItems[i].price != "" && invGl.invoiceItems[i].quantity != "" && invGl.invoiceItems[i].productUnit == "")
			invGl.invoiceItems[i].productUnit = "　";
	}
	
	return invGl;
}
/**
 * 货运票发票信息 过滤前后空格 回车换行 开票前对发票数据统一处理
 * @param {invGl}
 */
function checkHypStr(inv) {

	inv.invoiceCode = GLStrEnterSp(inv.invoiceCode);
	inv.invoiceNr = GLStrEnterSp(inv.invoiceNr);
	inv.infoClientName = GLStrEnterSp(inv.infoClientName);
	inv.infoClientTaxCode = GLStrEnterSp(inv.infoClientTaxCode);
	inv.consignerName =  GLStrEnterSp(inv.consignerName);
	inv.consignerTaxCode =  GLStrEnterSp(inv.consignerTaxCode);
	inv.shipperName =  GLStrEnterSp(inv.shipperName);
	inv.shipperTaxCode =  GLStrEnterSp(inv.shipperTaxCode);
	inv.originViaArrivalPlace = GLStrEnterSp(inv.originViaArrivalPlace);
	inv.infoListName =  GLStrEnterSp(inv.infoListName);
	inv.vehicleKindNo = GLStrEnterSp(inv.vehicleKindNo);
	inv.vehicleTonnage = GLStrEnterSp(inv.vehicleTonnage);
	inv.infoTaxRate =  GLStrEnterSp(inv.infoTaxRate);
	inv.infoNotes = GLStrEnterSp(inv.infoNotes);
	inv.infoInvoicer = GLStrEnterSp(inv.infoInvoicer);
	inv.infoChecker = GLStrEnterSp(inv.infoChecker);
	inv.infoCashier = GLStrEnterSp(inv.infoCashier);
	inv.sellerName =  GLStrEnterSp(inv.sellerName);
	inv.sellerTaxNr =  GLStrEnterSp(inv.sellerTaxNr);;

	for(var i in inv.invoiceItems){
		inv.invoiceItems[i].listGoodsName = GLStrEnterSp(inv.invoiceItems[i].listGoodsName);
	}

	return inv;
}
/**
 * 卷票发票信息 过滤前后空格 回车换行 开票前对发票数据统一处理
 * author：金涛
 * @param {invGl}
 */
function checkJpStr(inv){
	inv.infoCashier = GLStrEnterSp(inv.infoCashier);
	inv.sellerName =  GLStrEnterSp(inv.sellerName);
	inv.sellerTaxNr =  GLStrEnterSp(inv.sellerTaxNr);;
	inv.customerName =  GLStrEnterSp(inv.customerName);
	inv.customerTaxNr =  GLStrEnterSp(inv.customerTaxNr);
	
	for(var i in inv.invoiceItems){
		inv.invoiceItems[i].spmc = GLStrEnterSp(inv.invoiceItems[i].spmc);
		inv.invoiceItems[i].sl = GLStrEnterSp(inv.invoiceItems[i].sl);
		inv.invoiceItems[i].dj = GLStrEnterSp(inv.invoiceItems[i].dj);
		inv.invoiceItems[i].je = GLStrEnterSp(inv.invoiceItems[i].je);
		inv.invoiceItems[i].se = GLStrEnterSp(inv.invoiceItems[i].se);
		inv.invoiceItems[i].slv = GLStrEnterSp(inv.invoiceItems[i].slv);
	}

	return inv;
}
/**
 * 过滤前后空格 回车换行
 * @param {str}
 */
function GLStrEnterSp(str) {
	str = $.trim(str);
	str = str.replace(/[\r\n]/g,"");
	return str;
}

//业务类别数据下拉列表赋值
function loadYwlbList(listId, ywxtdm, pd, ywxtbz){
	if(ywxtbz == undefined || ywxtbz == null)
		ywxtbz = "N";
	if(ywxtbz == "ALL")
		ywxtbz = "";
	
	if(window.top["GlobalywlbListInfo"] != null && ywxtbz == window.top["GlobalywlbYwxtbz"]){
		ywlbListSetData(window.top["GlobalywlbListInfo"], listId, ywxtdm, pd);
		return;
	}
	
	$.ajax({
  		type: 'POST',
  		url: '../../kpgl/kpsq/queryYwlb.action',
  		data: {"ywxtbz" : ywxtbz},
  		async: false,
  		dataType: 'json', 
  		success: function(data){
	  		var objs = data;
	  		ywlbListSetData(objs, listId, ywxtdm, pd);
	  		window.top["GlobalywlbListInfo"] = objs;
	  		window.top["GlobalywlbYwxtbz"] = ywxtbz;
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
			return false;
	  	}
	});
}

//业务类别下拉列表绑定数据
function ywlbListSetData(objs, listId, ywxtdm, pd){
	$("#" + listId).html('');
	
	var AllText = "全部";
	if(listId == "tzdgl_ywlb")
		AllText = "----请选择----";
	
	if(pd == "pd"){//开票管理使用
		var optionAll = $("<option>").text(AllText).val("-1");
		$("#" + listId).append(optionAll);
	}
	if(pd == "pbxsd"){//销售单使用
		var optionAll = $("<option>").text(AllText).val("");
		$("#" + listId).append(optionAll);
	}
	
	for(var i in objs){
		var obj = objs[i];
		var option = $("<option>").text(obj.ywxtmc).val(obj.ywxtdm);
		
		if(ywxtdm != undefined && ywxtdm != null && ywxtdm == obj.ywxtdm)
			option.attr("selected", "selected");
		$("#" + listId).append(option);
	}
}


//根据纳税人识别号（nsrsbh）异步加载指定开票服务器
function loadKpfwqList(nsrsbh, selkpfwqid, selkpdid, kpfwqh){
	
	$("#" + selkpfwqid).empty();
	if(document.title  == "用户管理"){
		var option = $("<option>").text("请选择").val("");
		$("#" + selkpfwqid).append(option);
	}
	
	$.ajax({
  		type: 'POST',
  		url: '../../kpgl/kpsq/kpsqQueryKpfwqList.action',
  		data: {"nsrsbh" : nsrsbh},
  		async:false,
  		dataType:'json', 
  		success: function(data){
  			//$.jqalert(data);
	  		var objs = data;
	  		
	  		var yhKpfwqh = window.top["GlobalYh"].by1;//用户所属的开票服务器号
	  		var hasYhKpfwqh = false;
	  		
	  		for(var i in objs){
				var obj = objs[i];
				var option = $("<option>").text(obj.kpfwqmc).val(obj.kpfwqh)
				.attr("zpxe",obj.zpxe).attr("ppxe",obj.ppxe)
				.attr("hyxe",obj.hyxe).attr("jdcxe",obj.jdcxe)
				.attr("dzxe",obj.dzfpxe)
				.attr("jqbh",obj.jqbh).attr("nsrsbh",nsrsbh)
				.attr("title",obj.kpfwqmc);
				
				if(kpfwqh == obj.kpfwqh){
					option.attr("selected", "selected");
				}
				if(yhKpfwqh == obj.kpfwqh){
					option.attr("selected", "selected");
					hasYhKpfwqh = true;
				}
				
				$("#" + selkpfwqid).append(option);
	  		}
	  		if(yhKpfwqh != undefined && yhKpfwqh != null && yhKpfwqh != "" && document.title  != "用户管理"){
	  			if(hasYhKpfwqh)
	  				$("#" + selkpfwqid).attr("disabled", "disabled");
	  			else{
	  				$("#" + selkpfwqid).empty();
	  				var option = $("<option>").text("用户绑定的开票服务器号不存在或已删除").val("");
					$("#" + selkpfwqid).append(option);
	  			}
	  		}
	  		
	  		//带出默认选择的开票服务器的开票点信息
	  		if(kpfwqh == undefined || kpfwqh == null)
	  			getKpd(selkpfwqid, selkpdid);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
			return false;
	  	}
	});
}

//根据开票服务器获取开票点信息
/**
 * 描述：获取开票点号
 * 参数：selkpfwqid　开票点下拉框id
 * 参数：selkpdid　
 */
function getKpd(selkpfwqid, selkpdid, kpdh, kpfwqh, xfsh){
	$("#macNo").html($("#selsq_kpfwq option:selected").attr("jqbh"));//顺手更新下机器编号
	
	$("#" + selkpdid).empty();
	
	var kpfwqh_t = $("#" + selkpfwqid).val();
	var nsrsbh = $("#" + selkpfwqid + " option:selected").attr("nsrsbh");
	
	if($('#xhdwsh').val() != null && $('#xhdwsh').val() != "")
		nsrsbh = $('#xhdwsh').val();
	if(kpfwqh != undefined && kpfwqh != null && xfsh != undefined && xfsh != null){
		kpfwqh_t = kpfwqh;
		nsrsbh = xfsh;
	}
	if((kpfwqh_t == undefined || kpfwqh_t == null || (kpfwqh_t+"") == "") && (nsrsbh == undefined || nsrsbh == null || (nsrsbh+"") == ""))
		return;
	
	var yhKpfwqh = window.top["GlobalYh"].by1;//用户所属的开票服务器号
	if(document.title  != "用户管理" && yhKpfwqh != undefined && yhKpfwqh != null && yhKpfwqh != ""){
		kpfwqh_t = yhKpfwqh;
	}
	
	$.ajax({
		type : "POST",
		url : "../../kpgl/kpsq/kpsqQueryKpdList.action",
		data : {"kpfwqh" : kpfwqh_t, "nsrsbh" : nsrsbh},
		async:false,
  		dataType : "json",
		success : function(data){
			//$.jqalert(data);
			var objs = data;
			
			if(window.top["GlobalYh"].kpfs == "0"){
				var option = $("<option>").text("请选择").val("");
				$("#" + selkpdid).append(option);
			}
			var yhKpdh = window.top["GlobalYh"].by2;//用户所属的开票点号
			var hasYhKpdh = false;
			
		    for(var i in objs){
   				var obj = objs[i];
   				var option;
   				
   				if(window.top["GlobalYh"].kpfs == "1")
   					option = $("<option>").text(obj.kpdh).val(obj.kpdh)
   							.attr("title",obj.kpdh);
   				else
   					option = $("<option>").text(obj.kpdmc).val(obj.kpdh)
   							.attr("title",obj.kpdmc);
                //原单据存储的开票点号如果和用户绑定的开票点号不一致，以用户绑定的为准
				if(kpdh == obj.kpdh){
					option.attr("selected", "selected");
				}
				if(document.title  != "用户管理" && yhKpdh == obj.kpdh){
					option.attr("selected", "selected");
					hasYhKpdh = true;
				}
                $("#" + selkpdid).append(option);
	    	}
		    if(yhKpdh != undefined && yhKpdh != null && yhKpdh != "" && document.title  != "用户管理"){
				if(hasYhKpdh)
					$("#" + selkpdid).attr("disabled", "disabled");
	  			else{
	  				$("#" + selkpdid).empty();
	  				var option = $("<option>").text("用户绑定的开票点号不存在或已删除").val("");
					$("#" + selkpdid).append(option);
	  			}
			}
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
  			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
  			return false;
	  	}
	});
}

//获取申请单编号
function getSqdbh(){
	$.ajax({
		type : "POST",
		url : "../../kpgl/kpsq/getSqdbh.action",
		data : {},
		dataType : "json",
		success : function(data){
			if(data != null && data != "")
				$("#txtsq_sqdbh").val(data);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
  			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
  			return "";
	  	}
	});
}

var fpzlArray = ["0", "2", "11", "12", "51"];

//获取下张发票及金税盘信息，第四个参数为尝试开卡用的发票种类下标
function getInvInfo(kind, getType, method, tryNo){
	
	if(tryNo != undefined)
		kind = fpzlArray[tryNo];
	
	if(!isPlkj){
		$("#bgFilter").css("display", "block");
		$("#loadingProgress").css("display", "block");
	}
	
	window.top["frames"][2].TaxCore.tax.invInfo(kind, function(json){
		
		if(json.retcode == 3011){
			
			$("#zfkpfwqh").val(json.Kpfwqh);
			$("#zfMachineNo").val(json.MachineNo);
			$("#zfUploadMode").val(json.UploadMode);
			
			if(getType == "fpno"){
				
				getInvInfoFpno(json, kind);//设置下张发票代码号码，并显示出开票页面（批量开量时不显示，执行后续步骤）
			}
			else if(getType == "cardInfo"){
				
				getInvInfoCardInfo(json, method);//获取金税盘信息，设置服务器号、开票点号、销方税号
			}
			else if(getType == "fpnozf"){
				
				getInvInfoWrite(json);
				
				$("#kbzf_Fpdm").text(json.InfoTypeCode);
				$("#kbzf_Fphm").text(json.InfoNumber);
			}
		}
		else if(json.retcode == "9013"){
			if(json.retmsg.indexOf("设备通讯异常") != -1 || json.retmsg.indexOf("服务无响应") != -1){
				if(isPlkj)
					plkjCall("fpkjStop_jspError");
				else
					$.jqalert(json.retmsg);
			}
			else if(tryNo != undefined && tryNo < 4){
				if(json.retmsg.indexOf("金税盘无可用发票") != -1){
					getInvInfoCardInfo(json, method);
				}
				else if(json.retmsg.indexOf("没有票种授权") != -1){
					getInvInfo(kind, getType, method, tryNo + 1);
					return;
				}
				else{//其他未知情况暂时和“没有票种授权”的处理方式一致
					getInvInfo(kind, getType, method, tryNo + 1);
					return;
				}
			}
			else if(tryNo != undefined && tryNo == 4){
				$.jqalert("获取发票授权信息失败！<br>" + json.retmsg);
			}
			else if(getType == "fpnozf"){
				$.jqalert("发票空白作废失败！<br> " + json.retmsg);
				$("#kbzf_Fpdm").text("");
				$("#kbzf_Fphm").text("");
			}
			else if(getType == "fpno"){
				fpkjAlert("读取金税盘信息失败，无法读取金税盘下张发票代码、号码！<br> " + json.retmsg);
			}
		}
		else {
			if(getType == "cardInfo")
				$.jqalert("读取金税盘信息失败，无法读取金税盘服务器号、开票点号、销方税号！<br>" + json.retmsg);
			else if(getType == "fpno"){
				if(isPlkj){
					fpkjAlert("读取金税盘信息失败，无法读取金税盘下张发票代码、号码，停止批量开票！<br> " + json.retmsg);
					plkjCall("fpkjStop_jspError");
				}
				else
					$.jqalert("读取金税盘信息失败，无法读取金税盘下张发票代码、号码！<br> " + json.retmsg);
			}
			else
				$.jqalert("获取发票信息失败！ " + json.retmsg);
		}
		
		if(!isPlkj){
			$("#bgFilter").css("display", "none");
			$("#loadingProgress").css("display", "none");
		}
	});
}


function getInvInfoFpno(json, fpzl){
	
	var ssnsrsh  = window.top["GlobalYh"].ssnsrsh;	//用户所在销方名称
	var ssnsrmc  = window.top["GlobalYh"].ssnsrmc;	//用户所在销方名称
	var userFwqh = window.top["GlobalYh"].by1;		//用户绑定的开票服务器号
	var userKpdh = window.top["GlobalYh"].by2;		//用户绑定的开票点号
	
	if(ssnsrsh != null && ssnsrsh != "" && json.TaxCode != ssnsrsh){
		fpkjAlert("当前设备 税号 与操作员对应 销方税号 不一致，不能开票！");
	}
	else if(ssnsrmc != null && ssnsrmc != "" && json.CorpName != ssnsrmc){
		fpkjAlert("当前设备 企业名称 与操作员对应 销方名称 不一致，不能开票！");
	}
	else if(userFwqh != null && userFwqh != "" && json.Kpfwqh != userFwqh){
		fpkjAlert("当前设备 " + 
				(window.top["GlobalYh"].kpfs == "0" ? "开票服务器号" : "单机开票点号") +
				" 与操作员绑定的 " + 
				(window.top["GlobalYh"].kpfs == "0" ? "开票服务器号" : "单机开票点号") + 
				" 不一致，不能开票！");
	}
	else if(userKpdh != null && userKpdh != "" && json.MachineNo != userKpdh){
		fpkjAlert("当前设备 开票点号 与操作员绑定的 开票点号 不一致，不能开票！");
	}
	else{
		$("#fplbdm").text(json.InfoTypeCode);
		$("#fphm").text(json.InfoNumber);
		
		if(isPlkj){
			$("#plkjFpdm").html(json.InfoTypeCode);
			$("#plkjFphm").html(json.InfoNumber);
			
			plkjCall("invoiceOk");
			return;
		}
		else{
			showDivInfo("divDkFpInfo", "fpkj", fpzl);
			return;
		}
	}
	
	if(isPlkj)
		plkjCall("fpkjStop_jspError");
}


function getInvInfoCardInfo(json, method){
	
	var ssnsrsh  = window.top["GlobalYh"].ssnsrsh;	//用户所在销方名称
	var ssnsrmc  = window.top["GlobalYh"].ssnsrmc;	//用户所在销方名称
	var userFwqh = window.top["GlobalYh"].by1;		//用户绑定的开票服务器号
	var userKpdh = window.top["GlobalYh"].by2;		//用户绑定的开票点号
	
	if(ssnsrsh != null && ssnsrsh != "" && json.TaxCode != ssnsrsh){
		$.jqalert("当前设备 税号 与操作员对应 销方税号 不一致，不能开票！");
	}
	else if(ssnsrmc != null && ssnsrmc != "" && json.CorpName != ssnsrmc){
		$.jqalert("当前设备 企业名称 与操作员对应 销方名称 不一致，不能开票！");
	}
	else if(userFwqh != null && userFwqh != "" && json.Kpfwqh != userFwqh){
		$.jqalert("当前设备 " + 
				(window.top["GlobalYh"].kpfs == "0" ? "开票服务器号" : "单机开票点号") +
				" 与操作员绑定的 " + 
				(window.top["GlobalYh"].kpfs == "0" ? "开票服务器号" : "单机开票点号") + 
				" 不一致，不能开票！");
	}
	else if(userKpdh != null && userKpdh != "" && json.MachineNo != userKpdh){
		$.jqalert("当前设备 开票点号 与操作员绑定的 开票点号 不一致，不能开票！");
	}
	else{
		getInvInfoWrite(json);
		
		$("#xfsh").val(json.TaxCode);
		$("#kpfwqh").val(json.Kpfwqh);
		$("#kpdh").val(json.MachineNo);
		
		method();
	}
}


//系统获取金税盘信息全局变量赋值
function getInvInfoWrite(jsonObj){
	
	if(window.top["GlobalVal_Card_MachineCode"] == ""){
		window.top["GlobalVal_Card_MachineCode"] = jsonObj.CheckCode;//判断为第一次开卡金税盘设备编号赋值
	}
	
	window.top["GlobalVal_Card_nsrsbh"] = jsonObj.TaxCode;
	window.top["GlobalVal_Card_kpfwqh"] = jsonObj.Kpfwqh;
	window.top["GlobalVal_Card_kpdh"] = jsonObj.MachineNo;
	window.top["GlobalVal_Card_UploadMode"] = jsonObj.UploadMode;
	window.top["GlobalVal_Card_nsrmc"] = jsonObj.CorpName;
	window.top["GlobalVal_Card_InvMcType"] = jsonObj.InvMcType;
}


//发票上传
function InvDoUpload(fpzl, fpdm, fphm, xfsh, kpfwqh, kpdh, callback){
	var alertMsg = "";
	
	var xxfpListJson = new Array();
	var xxfpJson = {};
	xxfpJson["fpzl"] = fpzl;
	xxfpJson["fpdm"] = fpdm;
	xxfpJson["fphm"] = fphm;
	xxfpJson["xfsh"] = xfsh;
	xxfpJson["kpfwqh"] = kpfwqh;
	xxfpJson["kpdh"] = kpdh;
	xxfpJson["bszt"] = 3;
	xxfpJson["fpscfs"] = "0";
	xxfpListJson.push(xxfpJson);
	
	ConsolePrintDebugLog("调用组件接口执行发票上传动作.", "i");
	
	window.top["frames"][2].TaxCore.tax.InvUploadSub(fpdm, fphm, function(jsonUp) {
		if(jsonUp.retcode == "0"){
			ConsolePrintDebugLog("发票上传成功,执行更新发票上传下载记录表及发票报送状态.", "i");
			InvUpDownloadRecord(xxfpListJson, "up", callback);
		}
		else{
			ConsolePrintDebugLog("发票上传失败：" + jsonUp.retmsg + " 正在查询该张发票状态.", "i");
			window.top["frames"][2].TaxCore.tax.QryInvInfoDetail("", fpzl, fpdm, fphm, function(jsonfp) {
				if (jsonfp.retcode == "0") {
					ConsolePrintDebugLog("发票代码:" + fpdm + ";发票号码:" + fphm + " 的发票报送状态为:" + jsonfp.fpbszt, "i");
					if(jsonfp.fpbszt != 0){
						xxfpListJson[0]["bszt"] = jsonfp.fpbszt;
						ConsolePrintDebugLog("发票代码:" + fpdm + ";发票号码:" + fphm + " 的发票报送状态不是未报送,执行更新发票上传下载记录表及发票报送状态.", "i");
						InvUpDownloadRecord(xxfpListJson, "up", callback);
					}
					else{
						$.jqalert("该张发票报送失败.");
			            callback();
					}
				} else {
					$.jqalert("发票信息获取失败，无法上传发票: " + jsonfp.retmsg);
		            callback();
				}
			});
		}
	});
}

//发票上传状态更新
function InvStatusUpdate(callback){
	var alertMsg = "";
	window.top["frames"][2].TaxCore.tax.InvStatusUpdateSub(function(json_statusUp) {
		//$.jqalert($.toJSON(json_statusUp));
		if(json_statusUp.retcode == "0"){
			ConsolePrintDebugLog("调用组件接口更新上传状态成功.", "i");
		}
		else{
			ConsolePrintDebugLog("调用组件接口更新上传状态失败,错误信息：" + json_statusUp.retmsg, "i");
			//$.jqalert(json_statusUp.retmsg); callback();
		}

		ConsolePrintDebugLog("执行组件接口查询金税盘信息,获取税号及开票机号.", "i");
		window.top["frames"][2].TaxCore.tax.invInfo("0", function(json_getinfo) {
			if (json_getinfo.retcode == 3011) {
				getInvInfoWrite(json_getinfo);
				
				ConsolePrintDebugLog("调用组件接口查询金税盘信息成功,税号:" + json_getinfo.TaxCode + "开票机号:" + json_getinfo.MachineNo + ". 加载报送状态为报送中的发票上传记录.", "i");
				//加载报送状态为报送中的发票上传记录
				$.ajax({
					type : "POST",
					url : "fptb_InvScxzjlList.action",
					data : {
						"taxNr" : json_getinfo.TaxCode, 
						"kpfwqh" : json_getinfo.Kpfwqh, 
						"kpdh" : json_getinfo.MachineNo, 
						"bszt" : "3" 
					},
					dataType : "json",
					success : function(data){
						//$.jqalert(data);
						var listObj = eval("(" + data + ")");//转换成json对象
						var xxfpListJson = new Array();
					    for(var i in listObj){
			   				var obj = listObj[i].master;
			   				var xxfpJson = {};

			   				xxfpJson["xsdjbh"] = "";
			   				xxfpJson["fpzl"] = obj.fpzl;
			   				xxfpJson["fpdm"] = obj.fpdm;
			   				xxfpJson["fphm"] = obj.fphm;

			   				xxfpListJson.push(xxfpJson);
				    	}
					    
						ConsolePrintDebugLog("已加载发票上传记录, 调用组件接口批量查询所加载记录发票的报送状态.", "i");

						window.top["frames"][2].TaxCore.tax.QryInvInfoDetailList(xxfpListJson, function(json_fplist) {
							if(json_fplist.retcode == "0"){
								var listfpObj = json_fplist.record;
								var xxfpListJson = new Array();
								
							    for(var j in listfpObj){
					   				var retcodefpInfo = listfpObj[j]["retcode"];
					   				if(retcodefpInfo == "0"){
					   					//$.jqalert(listfpObj[j]["fphm"]);$.jqalert(listfpObj[j]["fpbszt"]);
										var xxfpJson = {};
										xxfpJson["fpzl"] = listfpObj[j]["fpzl"];
										xxfpJson["fpdm"] = listfpObj[j]["fpdm"];
										xxfpJson["fphm"] = listfpObj[j]["fphm"];
										xxfpJson["xfsh"] = window.top["GlobalVal_Card_nsrsbh"];
										xxfpJson["kpfwqh"] = window.top["GlobalVal_Card_kpfwqh"];
										xxfpJson["kpdh"] = window.top["GlobalVal_Card_kpdh"];
										xxfpJson["bszt"] = listfpObj[j]["fpbszt"];
										xxfpJson["fpscfs"] = "0";
										xxfpListJson.push(xxfpJson);
					   				}
						    	}
								ConsolePrintDebugLog("已调用组件接口批量查询所加载记录发票的报送状态,发票信息：" + $.toJSON(xxfpListJson), "i");
								ConsolePrintDebugLog("根据批量查询出的发票报送状态信息,更新发票上传下载记录表及发票报送状态.", "i");
							    InvUpDownloadRecord(xxfpListJson, "down", callback);
							}
							else{
								ConsolePrintDebugLog("调用组件接口批量查询所加载记录发票的报送状态失败,错误信息：" + json_fplist.retmsg, "i");
								$.jqalert(json_fplist.retmsg); callback();
							}
						});
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
						ConsolePrintDebugLog("加载发票上传记录失败.", "e");
						AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
						callback();
				  	},
					complete : function(XMLHttpRequest, status) {
						//callback();
					}
				});

			} else {
				ConsolePrintDebugLog("调用组件接口查询金税盘信息失败,错误信息：" + json_getinfo.retmsg, "i");
				$.jqalert(json_getinfo.retmsg); callback();
			}
		});
	});
}

//更新发票上传下载记录表及发票报送状态
function InvUpDownloadRecord(fpInfoList, ulType, callback){
	$.ajax({
		type : "POST",
		url : "../../kpgl/fptb/invUpload.action",
		data : {
			"fpData" : $.toJSON(fpInfoList) 
		},
		dataType : "json",
		success : function(data){
			var obj = data;//转换成json对象
			
            var code = obj.retcode;
            var message = obj.retMsg;
            
        /*    if(ulType == "up" && code == 0)
            	$.jqalert("发票上传成功.");
            else if(ulType == "down" && code == 0)
            	$.jqalert("发票报送状态更新成功.");
            else
            	$.jqalert(message);*/
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
			callback();
	  	},
		complete : function(XMLHttpRequest, status) {
			if(callback != undefined)
				callback();
		}
	});
}

//获取金税盘信息
function jspInformation(callback,callback1){
	var inputXml = "<?xml version='1.0' encoding='GBK'?> <FPXT_COM_INPUT> <ID>0400</ID> <DATA></DATA> </FPXT_COM_INPUT>";
	window.top["frames"][2].TaxCore.tax.InvGetInvoiceInfoData(inputXml, function(jsonRet) {
		ConsolePrintDebugLog("===>调用组件接口返回的输出报文：" + jsonRet.responseMsg, "i");
		if(jsonRet.retcode == "0"){
			window.top["GlobalVal_Card_XmlData"] = jsonRet.responseMsg;   //金税盘报文
			window.top["GlobalVal_Card_nsrsbh"] = jsonRet.TaxCode;		//销方税号
			window.top["GlobalVal_Card_nsrmc"] = jsonRet.CorpName;		//销方名称
			window.top["GlobalVal_Card_kpfwqh"] = jsonRet.MachineNo;		//开票服务器号
			window.top["GlobalVal_Card_MachineCode"] = jsonRet.CheckCode;	//金税设备编号
			window.top["GlobalVal_Card_InvMcType"] = jsonRet.InvMcType;	//开票方式 0：单机版; 1：开票服务器版;	
//2016-9-26新增字段
			window.top["GlobalVal_Card_Yhzh"] = jsonRet.XFYH;	//银行账号	
			window.top["GlobalVal_Card_Lxdh"] = jsonRet.XFDH;	//联系电话	
			window.top["GlobalVal_Card_Xfdz"] = jsonRet.XFDZ;	//销方地址	
			callback(jsonRet.retcode);
		} else {
			/*$("#loadingProgress").css("display","none");
			$("#bgFilter").css("display","none");*/
        	$.jqalert("调用金税盘状态信息接口失败：" + jsonRet.retmsg);
        	callback(jsonRet.retcode);    	
		}
	});
}

//更新金税盘信息  type上传动作   nsrsbh纳税人识别号  kpjh开票机号 ，nsrmc纳税人名称
function JspBatchupload(type,nsrsbh,kpjh,xfmc,kpfs){
	$.ajax({
		type : "POST",
		url : "../../jkgl/savejspxx.action",
		data : {
			"outXml" : window.top["GlobalVal_Card_XmlData"],  //金税盘报文取全局变量
			"type" : type,
			"jnsrsbh" : nsrsbh,
			"jkpjh" : kpjh,
			"jnsrmc" : xfmc,
			"kpfs" : kpfs
			},
		dataType : "json",
		success : function(data){
			//var obj = eval("(" + data + ")");//转换成json对象
			$.jqalert(data.remsg);
			$("#loadingProgress").css("display","none");
			$("#bgFilter").css("display","none");
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			$("#loadingProgress").css("display","none");
			$("#bgFilter").css("display","none");
			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
	  	}
	});
}

//销方管理 获取金税盘信息统一入口
function  XfglJsBatchUp(pagename){
	var divname = "#djkpdEditDialog";
	if(pagename == "kpfwqgl" ){
		divname = "#kpfwqEditDialog";
	}else if(pagename == "djkpdgl"){
		divname = "#djkpdEditDialog";
	}else if(pagename == "xfgl"){
		var xfshInputVal = $("#txt_bm_nsrsbh").val();
		var xfshInputDis = $("#txt_bm_nsrsbh").attr("disabled");
		/*if(xfshInputVal != "" && xfshInputDis == "disabled"){
			$.jqalert("当前所属机构已有税号，请更换所属机构!");
			return false;
		}*/
	}
	
	$("#loadingProgress").css("display","block");
	//$("#bgFilter").css("z-index", $(divname).css("z-index") + 1);
	$("#bgFilter").css("display","block");
	
	jspInformation(
	 function(retcode){
		 if(retcode=="0"){
			 XfglJsBatchUpload(pagename,divname);
		 } else{
			$("#loadingProgress").css("display","none");
			$("#bgFilter").css("display","none");
			//$("#bgFilter").css("z-index", $(divname).css("z-index") - 1);
		 }
	});
}
//金税盘信息赋值
function XfglJsBatchUpload(pagename,divname){
	if(window.top["GlobalVal_Card_InvMcType"] == 0 && pagename == "kpfwqgl"){
		$.jqalert("当前开票软件开票方式为单机版，无法维护开票服务器信息!");
		$("#loadingProgress").css("display","none");
		$("#bgFilter").css("display","none");
		//$("#bgFilter").css("z-index", parseInt($(divname).css("z-index") - 1));
		return false;
	}
	if(window.top["GlobalVal_Card_InvMcType"] == 1 && pagename == "djkpdgl"){
		$.jqalert("当前开票软件开票方式为服务器版，无法维护单机开票点信息!");
		$("#loadingProgress").css("display","none");
		$("#bgFilter").css("display","none");
		//$("#bgFilter").css("z-index", parseInt($(divname).css("z-index")) - 1);
		return false;
	}
			
	$.ajax({
		type : "POST",
		url : "../../hpgl/hpscxz/jsList.action",
		data : {
			"outXml" : window.top["GlobalVal_Card_XmlData"],
			"jspname" : pagename
		},
		dataType : "json",
		success : function(data){
			//var obj = eval("(" + data + ")");//转换成json对象
			var obj =data
			//var jspname = obj.jspname;
			//销方管理页面
			if(data.code == 0){
				if(pagename=="xfgl"){
					//jsbreturn = "{xfsh:"+xfsh+",hzfzbs:"+hzfzbs+",kpfs:"+kpfs+",jspname:'"+jspname+"'}"
					var xfshInputVal = $("#txt_bm_nsrsbh").val();
					var xfshInputDis = $("#txt_bm_nsrsbh").attr("disabled");
					if((xfshInputVal != "" && xfshInputDis == "disabled") && xfshInputVal != obj.xfsh ){
						$.jqalert("当前所属机构已有税号，请更换所属机构!");
						$("#loadingProgress").css("display","none");
						$("#bgFilter").css("display","none");
						return false;
					}
					$("#txt_bm_nsrsbh").val(obj.xfsh);//销方税号
					$("#add_nsrmc").val(window.top["GlobalVal_Card_nsrmc"]);//销方名称
					$("#add_hzfw").val( obj.hzfzbs);//汉字防伪
					
					$("#add_khyhzh").val(window.top["GlobalVal_Card_Yhzh"]);//银行账号				
					$("#add_dhhm").val(window.top["GlobalVal_Card_Lxdh"]);//联系电话
					$("#add_zcdz").val(window.top["GlobalVal_Card_Xfdz"]);//销方地址
					$("#add_scjydz").val(window.top["GlobalVal_Card_Xfdz"]);//销方地址	
					
					var flag=0;
					if(window.top["GlobalVal_Card_InvMcType"]==0){
						flag=1;
					}
					$("#add_kpfs").val(flag);//开票方式
					
				//开票服务器 单机开票点管理
				}else if(pagename == "kpfwqgl" || pagename == "djkpdgl"){
					//jsbreturn = "{xfsh:"+xfsh+",ptxe:"+ptxe+",zyxe:"+zyxe+",hyxe:"+hyxe+",jdxe:"+jdxe+",ptlxxe:"
					//+ptlxxe+",zylxxe:"+zylxxe+",hylxxe:"+hylxxe+",jdlxxe:"+jdlxxe+",jqbh:"+jqbh+",djkpjh:"+djkpjh+"}";
					var ckpxe = obj.ptxe==null?(obj.zyxe==null?(obj.dzfpxe==null?"0.0":obj.dzfpxe):obj.zyxe): obj.ptxe;
					var clxxe = obj.ptlxxe==null?(obj.zylxxe==null?(obj.dzfplxxe==null?"0.0":obj.dzfplxxe):obj.zylxxe): obj.ptlxxe;
					
					$("#nsrsbh").val(obj.xfsh);//销方税号
					//$("#a_nsrsbh").val(obj.xfsh);//销方税号
					$("#nsrmc").val(window.top["GlobalVal_Card_nsrmc"]);//销方名称
					//$("#a_nsrmc").val(window.top["GlobalVal_Card_nsrmc"]);//销方名称
					$("#jqbh").val(obj.jqbh);//机器编号
					$("#kpdh").val(obj.djkpjh);//开票机号 --单机
					//$("#a_kpfwqh").val(obj.djkpjh);//开票机号--开票服务器
					//$("#xfmc_con").val(window.top["GlobalVal_Card_nsrmc);//开票服务器号
					//处理普票限额和专票限额
					$("#ppxe").val(obj.ptxe==null?ckpxe:obj.ptxe);//普通限额
					$("#zpxe").val(obj.zyxe==null?ckpxe:obj.zyxe);//专限额
					/*$("#a_hyxe").val(obj.hyxe);//货运限额
					$("#a_jdcxe").val(obj.jdxe);//机动限额*/					
					$("#pplxxe").val(obj.ptlxxe ==null?clxxe:obj.ptlxxe);//普通离线限额
					$("#zplxxe").val(obj.zylxxe ==null?clxxe:obj.zylxxe);//专离线限额
					$("#dzfpxe").val(obj.dzfpxe==null?ckpxe:obj.dzfpxe);//电子票限额
					$("#dzfplxxe").val(obj.dzfplxxe ==null?clxxe:obj.dzfplxxe);//电子离线限额
					if( pagename == "djkpdgl"){
						$("#kpdmc").val(window.top["GlobalVal_Card_nsrmc"]);//开票点名称
						$("#kpdbm").val(obj.xfsh + "-" + obj.djkpjh);//开票点名称
					}else if(pagename == "kpfwqgl"){
						$("#kpfwqmc").val(window.top["GlobalVal_Card_nsrmc"]);//开票服务器名称
					}
					/*$("#a_hylxxe").val(obj.hylxxe);//货运离线限额
					$("#a_jdclxxe").val(obj.jdlxxe);//机动离线限额*/	}
			}else{
				alert(data.mess);
				$("#loadingProgress").css("display","none");
				$("#bgFilter").css("display","none");
				//$("#bgFilter").css("z-index", parseInt($(divname).css("z-index")) - 1);
				return;
			}
			$("#loadingProgress").css("display","none");
			$("#bgFilter").css("display","none");
			//$("#bgFilter").css("z-index", parseInt($(divname).css("z-index")) - 1);
			
		},error : function(XMLHttpRequest, textStatus, errorThrown) {
			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
			$("#loadingProgress").css("display","none");
			$("#bgFilter").css("display","none");
			//$("#bgFilter").css("z-index", parseInt($(divname).css("z-index")) - 1);
	  	}
	});

}

function zpxe(xe){
	var pxe = xe+"";
	if(pxe.indexOf(".")>-1){
		pxe = pxe.split(".")[0];
	}
	$.jqalert(pxe);
	$.jqalert(pxe.length);
	if(pxe.length==3){
		pxe="1000";
	}else if(pxe.length == 4){
		pxe="10000";
	}else if(pxe.length == 5){
		pxe="100000";
	}else if(pxe.length == 6){
		pxe="1000000";
	}else if(pxe.length == 7){
		pxe="10000000";
	}else if(pxe.length == 8){
		pxe="100000000";
	}else{
		pxe="1000";
	}
	return pxe;
}

//红字发票信息表上传下载调用后台解析xml及base64加解密处理
function InvHzfpUpDownBwCon(fplx, actionUrl, xxblshList, tkrqq, tkrqz, gfsh, xfsh, xxbbh, xxbfw, outXml, outType, callbackfinal, callback){
	$.ajax({
		type : "POST",
		url : actionUrl + ".action",
		data : {
			"xxblshList" : $.toJSON(xxblshList), 
			"nsrsbh" : window.top["GlobalVal_Card_nsrsbh"], 
			"sbbh" : window.top["GlobalVal_Card_MachineCode"], 
			"kpdh" : window.top["GlobalVal_Card_kpdh"], 
			"tkrqq" : tkrqq, 
			"tkrqz" : tkrqz, 
			"gfsh" : gfsh, 
			"xfsh" : xfsh, 
			"xxbbh" : xxbbh, 
			"xxbfw" : xxbfw, 
			"outXml" : outXml, 
			"outType" : outType, 
			"fplx" : fplx 
		},
		dataType : "json",
		success : function(data){
			//$.jqalert(data);
			//var obj = eval("(" + data + ")");//转换成json对象
			
            var code = data.retcode;
            var message = data.retMsg;
            var inputXml = data.inputXml;
            var outputList = data.outputList;

            var messConsole = outType == "upload" ? "上传" : "下载" + inputXml == "" ? "输出报文：" + outputList : "输入报文：" + inputXml;
            ConsolePrintDebugLog("===>调用后台解析" + messConsole, "i");

            if(code == "0"){
            	if(inputXml != null && inputXml != ""){
                	window.top["frames"][2].TaxCore.tax.InvBatchUploadSub(inputXml, function(jsonRet) {
                		ConsolePrintDebugLog("===>调用组件接口返回的输出报文：" + jsonRet.responseMsg, "i");
                		if(jsonRet.retcode == "0"){
                			callback(jsonRet.responseMsg);
                		} else {
                        	$.jqalert("调用组件接口红票上传下载接口失败：" + jsonRet.retmsg);
                        	callbackfinal();
                		}
                	});
            	} else if(outputList != null && $.toJSON(outputList) != "" && $.toJSON(outputList) != "{}"){
            		//$.jqalert($.toJSON(outputList));
            		var messalt = outType == "upload" ? "信息表上传成功." : "信息表下载成功.[符合条件的全部记录数：" + outputList.SALLCOUNT + "]";
            		messalt += "[保存成功记录数：" + outputList.okNum + "；保存失败记录数：" + outputList.errorNum + "]";
            		if(outputList.errorNum != 0)
            			messalt += "[保存失败的信息表流水号：" + outputList.errorSQDH + "]";
            		$.jqalert(messalt);
            		callbackfinal();
            	}
            } else {
            	$.jqalert(message + "[" + code + "]");
            	callbackfinal();
            }
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
			callbackfinal();
	  	},
		complete : function(XMLHttpRequest, status) {
			//callback();
		}
	});
}

//红字发票信息表上传
function InvHzfpUpload(fplx, xxblshList, callback){
	ConsolePrintDebugLog("===>要上传的红字发票信息表流水号：" + $.toJSON(xxblshList), "i");
	
	InvHzfpUpDownBwCon(fplx, "../../hpgl/hpscxz/hpxxscsrcl", xxblshList, "", "", "", "", "", "", "", "upload", callback, function(outputXml) {
		InvHzfpUpDownBwCon(fplx, "../../hpgl/hpscxz/hpxxscfhcl", "", "", "", "", "", "", "", outputXml, "upload", callback);
	});
}

//红字发票信息表下载
function InvHzfpUpdate(fplx, tkrqq, tkrqz, gfsh, xfsh, xxbbh, xxbfw, callback){
	ConsolePrintDebugLog("===>下载红字发票信息表前调用开启金税盘及金税盘信息获取.", "i");
	
	window.top["frames"][2].TaxCore.tax.invInfo("0", function(json_getinfo) {
		if (json_getinfo.retcode == 3011) {
			getInvInfoWrite(json_getinfo);

			InvHzfpUpDownBwCon(fplx, "../../hpgl/hpscxz/hpxxxzsrcl", "", tkrqq, tkrqz, gfsh, xfsh, xxbbh, xxbfw, "", "update", callback, function(outputXml) {
				InvHzfpUpDownBwCon(fplx, "../../hpgl/hpscxz/hpxxscfhcl", "", "", "", "", "", "", "", outputXml, "update", callback);
			});
		} else {
			$.jqalert(json_getinfo.retmsg); callback();
		}
	});
}


//空白发票作废
function kbInvCancel(fpzl, callback){
//	var invZF = null;
//	if(fpzl == "0" || fpzl == "2" || fpzl == "51"){
//		invZF = new Invoice();
//		invZF.invoiceType = fpzl;
//	}
//	if(fpzl == "11"){
//		invZF = new InvoiceHY();
//		invZF.infoKind = fpzl;
//	}
//	if(fpzl == "12"){
//		invZF = new InvoiceJDC();
//		invZF.infoKind = fpzl;
//	}

	var invZF = new Invoice();
	invZF.invoiceType = fpzl;
	invZF.CheckEWM = 2;			//设置为空白发票作废属性
	
	//增加用户所属税号、绑定的开票服务器号、开票点号，控制台判断是否和金税盘一致所用
	var user = window.top["GlobalYh"];
	invZF.TaxCode = $.trim(user.ssnsrsbh);
	invZF.Kpfwqh = $.trim(user.by1);
	invZF.MachineNo = $.trim(user.by2);

	window.top["frames"][2].TaxCore.tax.inv(fpzl, invZF, function(json){
		if (json.retcode == 4011) {
			//$.jqalert("发票空白作废成功.");
			callback();
		} else {
			$.jqalert("发票空白作废失败：" + json.retmsg);
			callback("sb");
		}
	});
}

//发票开具不打印
function invNotPrint() {
	
	var inv = invGetEditInfo(InvObjFpkj);
	
	if(!checkInv(inv, isPlkj)){//校验Invoice开票对象是否通过,InvoiceUtils.js中
		if(isPlkj)
			plkjCall("fpkjError");//批量开具时校验出错时，走批量开具的分支
		return;
	}
	if(!isPlkj){
		$("#bgFilter").css("display", "block");
		$("#loadingProgress").css("display", "block");
	}
	
	var kpfwqh = $("#txtdk_kpfwqmc").attr("title");
	var kpdh = $("#txtdk_kpdmc").attr("title");
	if(kpfwqh == null || kpfwqh == "")
		kpfwqh = window.top["GlobalVal_Card_kpfwqh"];
	if(kpdh == null || kpdh == "")
		kpdh = window.top["GlobalVal_Card_kpdh"];
	
	//校验发票是否可以开具
	DkSdbjAllowInv($("#hidsq_id").val(), function(){
		
		//开具发票
		window.top["frames"][2].TaxCore.tax.inv($("#fpzl").val(), inv, function(json){
			//开具成功
			if (json.retcode == 4011) {
				//发票回传待开及同步数据
				InvDkWriteBackTbsj(json, "1", "", inv, kpfwqh, kpdh);
			} else {
				//开票失败回传待开
				InvDkWriteBackTbsj(json, "0", "", inv, kpfwqh, kpdh);
			}
			
		});
	});
}

//发票开具并打印
function invAndPrint() {
	
	var inv = invGetEditInfo(InvObjFpkj);
	
	if(!checkInv(inv, isPlkj))//校验Invoice开票对象是否通过,InvoiceUtils.js中
		return;
	
	$("#bgFilter").css("display", "block");
	$("#loadingProgress").css("display", "block");
	
	var kpfwqh = $("#txtdk_kpfwqmc").attr("title");
	var kpdh = $("#txtdk_kpdmc").attr("title");
	if(kpfwqh == null || kpfwqh == "")
		kpfwqh = window.top["GlobalVal_Card_kpfwqh"];
	if(kpdh == null || kpdh == "")
		kpdh = window.top["GlobalVal_Card_kpdh"];
	
	//校验发票是否可以开具
	DkSdbjAllowInv($("#hidsq_id").val(), function(){
		//开具发票
		window.top["frames"][2].TaxCore.tax.inv($("#fpzl").val(), inv, function(json) {
			//开具成功
			if (json.retcode == 4011) {
				//打印发票
				window.top["frames"][2].TaxCore.tax.printInv($("#fpzl").val(), json.InfoTypeCode, json.InfoNumber,'0','1', function(json2) {
					var dybz = "";
					if (json2.retcode == 5011) {
						dybz = "1";
					}else{
						$.jqalert("此张发票没有打印！<br> " + json2.retmsg);
					}
					//发票回传待开及同步数据
					InvDkWriteBackTbsj(json, "1", dybz, inv, kpfwqh, kpdh);
				});
			} else {
				//开票失败回传待开
				InvDkWriteBackTbsj(json, "0", "", inv, kpfwqh, kpdh);
			}
		});
	});
}

//发票开具回传及数据同步
function InvDkWriteBackTbsj(jsonInfo, kpbz, dybz, invInfo, kpfwqh, kpdh) {
	if(kpbz == "1"){
		//发票成功回传待开
		InvDkWriteBack($("#hidsq_id").val(), kpbz, dybz, "",jsonInfo.hisInfoKind, jsonInfo.InfoTypeCode, jsonInfo.InfoNumber, invInfo.issuer!=undefined?invInfo.issuer:invInfo.infoInvoicer,
				jsonInfo.InfoDate, kpfwqh, kpdh, jsonInfo.Cipher, jsonInfo.CheckCode, function(){
			//发票数据同步
			InvInfoDetailTbsj($("#hidsq_id").val(), $("#fpzl").val(), jsonInfo.InfoTypeCode, jsonInfo.InfoNumber, kpfwqh, kpdh, function(json){
				//上一张开具或作废的发票报送状态更新处理
				//HisInvStatusUpdate(jsonInfo, function(){
					if(isPlkj){//批量开具时
						if(json.retcode == "0")//无须同步或同步成功
							plkjCall("fpkjSuccess");
						else{//有同步且出现同步失败
							fpkjAlert("单据编号为 " + invInfo.documentNr + " 的发票开具成功，但同步失败！<br>" + json.retMsg);
							plkjCall("fpkjHalfSuccess");
						}
					}
					else{//非批量开具，即单张开具时
						$("#divDkFpInfo").dialog("close");
						
						if(json.retcode == "0")//无须同步或同步成功
							$.jqalert("发票开具成功" + (window.top["GlobalInvAutoGet"] == "1" ? "，并同步完成！" : "！"));
						else//有同步且出现同步失败
							$.jqalert("发票开具成功，但同步失败！<br>" + json.retMsg);
						
						$("#bgFilter").css("display", "none");
						$("#loadingProgress").css("display", "none");
						
						queryFpkjList();//重新查询发票开具管理列表
					}
				//});
			});
			if(wyptjk==-2)
				$.jqalert("签章接口调用失败！");
			if(wyptjk==-3)
				$.jqalert("推送接口调用失败！");
		});
	} else {
		//开票失败回传待开
		InvDkWriteBack($("#hidsq_id").val(), "0", "", "", "", "", "", "", "", "", "", "", "", function(){
			
			if(isPlkj){//批量开具时
				fpkjAlert("单据编号为 " + invInfo.documentNr + " 的发票开具失败！<br>" + jsonInfo.retmsg);
				plkjCall("fpkjError");
			}
			else {
				$.jqalert("发票开具失败！<br>" + jsonInfo.retmsg);//请求开具发票信息
				$("#bgFilter").css("display", "none");
				$("#loadingProgress").css("display", "none");
			}
		});
	}
}

//上一张开具或作废的发票报送状态更新处理
function HisInvStatusUpdate(jsonInfo, callback) {
	if(window.top["GlobalInvAutoGet"] == "0"){
		callback();
		return;//如果发票开具后不自动同步发票数据，同时也不执行上一张状态更新处理。
	}
	
	var fpscfs = window.top["GlobalVal_Card_UploadMode"];
	var hisfpzl = jsonInfo.hisInfoKind;
	var hisfpdm = jsonInfo.hisInfoTypeCode;
	var hisfphm = jsonInfo.hisInfoNumber;
	
	ConsolePrintDebugLog("||||||||||--> 发票上传方式：" + fpscfs + ";上张票种：" + hisfpzl + ";上张代码：" + hisfpdm + ";上张号码：" + hisfphm + "; ", "i");
	
	if(fpscfs == 1 && hisfpzl != -1 && hisfpdm != "" && hisfphm != ""){
		//上一张开具的发票信息查询
		window.top["frames"][2].TaxCore.tax.QryInvInfoDetail("", hisfpzl, hisfpdm, hisfphm, function(jsonfp) {
			if (jsonfp.retcode == "0") {
				var xxfpListJson = new Array();
				var xxfpJson = {};
				xxfpJson["fpzl"] = hisfpzl;
				xxfpJson["fpdm"] = hisfpdm;
				xxfpJson["fphm"] = hisfphm;
				xxfpJson["xfsh"] = window.top["GlobalVal_Card_nsrsbh"];
				xxfpJson["kpfwqh"] = window.top["GlobalVal_Card_kpfwqh"];
				xxfpJson["kpdh"] = window.top["GlobalVal_Card_kpdh"];
				xxfpJson["bszt"] = jsonfp.fpbszt;
				xxfpJson["fpscfs"] = "1";
				xxfpListJson.push(xxfpJson);
				
				InvUpDownloadRecord(xxfpListJson, "down", function(){
					ConsolePrintDebugLog("||||||||||--> 上一张发票状态更新成功, 发票开具后处理完成.", "i");
					callback();
				});
			} else {
				ConsolePrintDebugLog("||||||||||--> 上一张发票查询错误.", "i");
				callback();
			}
		});
		
	} else {
		ConsolePrintDebugLog("||||||||||--> 上传方式为手动上传，或为第一张发票，不做上一张发票处理.", "i");
		callback();
	}
}



//发票开具取修改后的 购方地址电话，购方银行账号，收款人，复核人
function invGetEditInfo(invPageObj) {
	if(invPageObj.invoiceType=='0'||invPageObj.invoiceType=='2'||invPageObj.invoiceType=='51'||invPageObj.invoiceType=='41'){
		invPageObj.checker = $.trim($("#fhr").val());
		invPageObj.payee = $.trim($("#skr").val());
		invPageObj.customerAddressTel = $.trim($("#ghdwdzdh").val());
		invPageObj.customerBankAccountNr = $.trim($("#ghdwyhzh").val());
		invPageObj.CheckEWM = 0;
		
		//增加用户所属税号、绑定的开票服务器号、开票点号，控制台判断是否和金税盘一致所用
		var user = window.top["GlobalYh"];
		invPageObj.TaxCode = $.trim(user.ssnsrsbh);
		invPageObj.Kpfwqh = $.trim(user.by1);
		invPageObj.MachineNo = $.trim(user.by2);
		
		//过滤前后空格 tab 回车
		invPageObj = checkGLStr(invPageObj);
		//但备注的回车符要保留，而且为了跟组件接口转换规则一致，需要增加一个反斜杠
		invPageObj.memo = $.trim(invPageObj.memo).replace(/[\n]/g,"\\n");
		
		for(var i in invPageObj.invoiceItems){
			if(invPageObj.invoiceItems[i].taxRate == 0.015)
				invPageObj.invoiceItems[i].taxRate = 1.5;//1.5的税率要传给组件接口的税率值为150，后续还有乘100的操作
		}
		
		checkFlbmAndSlv(invPageObj.invoiceItems);
		
	} else if(invPageObj.infoKind=='11'){
		//invPageObj.infoCashier = $.trim(document.getElementById('infoCashier').value);
		if(invPageObj.infoTaxRate<1){
			invPageObj.infoTaxRate = invPageObj.infoTaxRate * 100;
		}
		//红字明细金额税额取正数
		if(invPageObj.isRed==1){
			//明细
			for(var i in invPageObj.invoiceItems){
				invPageObj.invoiceItems[i].listAmount = Math.abs(invPageObj.invoiceItems[i].listAmount);	//金额
				invPageObj.invoiceItems[i].listTaxAmount = Math.abs(invPageObj.invoiceItems[i].listTaxAmount);	//税额
			}
		}
		/*invPageObj.isRed = 0;*/
		invPageObj.CheckEWM = 0;
		invPageObj = checkHypStr(invPageObj);
	} else if(invPageObj.infoKind=='12'){
		if(invPageObj.infoTaxRate<1){
			invPageObj.infoTaxRate = parseInt(invPageObj.infoTaxRate * 100);
		}
		
		invPageObj.CheckEWM = 0;
	}
	
	return invPageObj;
}


//检查分类编码和税率，如果税率和享受优惠对应税率不一致，则修改享受优惠标志为否
function checkFlbmAndSlv(invoiceItems){
	
	for(var i in invoiceItems){
		
		var item = invoiceItems[i];
		
		//TaxPre 是否享受税收优惠政策 String  0：不享受，1：享受
		//TaxPreCon 享受税收优惠政策内容 String
		//taxRate 商品税率 Number
		//ZeroTax 零税率标识，空：非零税率，0：出口退税，1：免税，2：不征税，3: 普通零税率

		if(item.ZeroTax == "0" || item.ZeroTax == "1" || item.ZeroTax == "2"){//初始的优惠政策为0税类的，未享受时清除0税率标识
			if(item.TaxPre == "0")
				item.ZeroTax = "";
		}
		
		if(item.TaxPreCon == "出口零税" || item.TaxPreCon == "免税" || item.TaxPreCon == "不征税"){
			if(item.taxRate != 0 && item.taxRate != 0.0 && item.taxRate != 0.00){
				item.TaxPre = "0";
				item.TaxPreCon = "";
				item.ZeroTax = "";
			}
			else if(item.TaxPreCon == "出口零税")
				item.ZeroTax = "0";
			else if(item.TaxPreCon == "免税")
				item.ZeroTax = "1";
			else if(item.TaxPreCon == "不征税")
				item.ZeroTax = "2";
		}
		else if(item.TaxPreCon == "简易征收"){
			if(item.taxRate != 0.05 && item.taxRate != 0.04 && item.taxRate != 0.03){
				item.TaxPre = "0";
				item.TaxPreCon = "";
			}
		}
		else if(item.TaxPreCon == "按5%简易征收"){
			if(item.taxRate != 0.05){
				item.TaxPre = "0";
				item.TaxPreCon = "";
			}
		}
		else if(item.TaxPreCon == "按3%简易征收"){
			if(item.taxRate != 0.03){
				item.TaxPre = "0";
				item.TaxPreCon = "";
			}
		}
		else if(item.TaxPreCon == "减按1.5征收"){
			if(item.taxRate != 1.5){
				item.TaxPre = "0";
				item.TaxPreCon = "";
			}
		}
		else if(item.TaxPreCon == "按5%简易征收减按1.5%计征"){
			if(item.taxRate != 1.5){
				item.TaxPre = "0";
				item.TaxPreCon = "";
			}
		}
	}
}



//发票开具前校验待开是否被锁定及是否允许开票
function DkSdbjAllowInv(dkfpid, callback){
	/*if($("#dk_wddm").val() == null || $("#dk_wddm").val() == ""){//如果待开票信息没有网点代码，则不需要校验锁定状态。
		callback();
		return;
	}*/
	$.ajax({
		type : "POST",
		url : "../../kpgl/fpkjgl/fpkjsdbjcheck.action",
		data : {
			"dkfpid" : dkfpid 
		},
		dataType : "json",
		success : function(data){
			
            if(data.code == 0){
            	
            	callback();
            	
            }else{
            	if(isPlkj){
            		fpkjAlert("单据编号为 " + InvObjFpkj.documentNr + " 的发票开具失败！<br>" + data.msg);
            		plkjCall("fpkjError");
            	}
            	else{
            		$.jqalert(data.msg);
	            	$("#bgFilter").css("display", "none");
	    			$("#loadingProgress").css("display", "none");
            	}
            }
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			if(isPlkj){
				fpkjAlert("单据编号为 " + InvObjFpkj.documentNr + " 的发票开具失败！<br>校验待开是否被锁定及是否允许开票时异常！");
        		plkjCall("fpkjError");
        	}
        	else{
        		AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
    			$("#bgFilter").css("display", "none");
    			$("#loadingProgress").css("display", "none");
        	}
			
	  	}
	});
}

//发票开具 打印 作废 回写待开发票信息
function InvDkWriteBack(dkfpid,kpbz,dybz,ykpzfbz,fpzl,fpdm,fphm,kpr,kprq,kpfwqh,kpdh,fp_mw,jym,callback){
	
	$.ajax({
		type : "POST",
		url : "../../kpgl/fpkjgl/fpkjglKp.action",
		data : {
			"dkfpid" : dkfpid,
			"kpbz" : kpbz,
			"dybz" : dybz,
			"ykpzfbz" : ykpzfbz,
			"fpzl" : fpzl,
			"fpdm" : fpdm,
			"fphm" : fphm,
			"kpr" : kpr,
			"kprq" : kprq,
			"kpfwqh" : kpfwqh,
			"kpdh" : kpdh,
			"fpscfs" : window.top["GlobalVal_Card_UploadMode"],
			"fp_mw" : fp_mw,
			"jym" : jym
		},
		dataType : "json",
		success : function(data){
			//$.jqalert(data);
			var obj = data;
			
            var code = obj.code;
            var message = obj.msg;
            
            wyptjk = code;//add by mk
            
            ConsolePrintDebugLog("||||||||||-->发票回写待开发票返回码：" + code + ", 返回信息：" + message, "i");
            
            if(callback != undefined){
            	callback();
            }
        	//向客户端推送发票信息
        	$.ajax({
        		type : "POST",
        		url : "../../kpgl/fpxxts/returnInvoice.action",
        		data : {
        			"sid" : "KPGL",
        			"dkfpid" : dkfpid,
        			"kpbz" : kpbz,
        			"dybz" : dybz,
        			"ykpzfbz" : ykpzfbz,
        			"fpzl" : fpzl,
        			"fpdm" : fpdm,
        			"fphm" : fphm
        		}
        	});
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
            if(callback != undefined)
            	callback();
	  	}
	});
}

//发票开具成功后自动调用组件接口同步发票信息
function InvInfoDetailTbsj(xsdbh,fpzl,fpdm,fphm,kpfwqh,kpdh,callback){
	if(window.top["GlobalInvAutoGet"] == "0" || fpzl=="11" || fpzl=="12"){
		callback({"code":"0"});
		return ;
	}
	//单张发票查询
	window.top["frames"][2].TaxCore.tax.QryInvInfoDetail("", fpzl, fpdm, fphm, function(jsonfp) {
		if (jsonfp.retcode == "0") {
			$.ajax({
				type : "POST",
				url : "../../kpgl/fptb/tbSingleInvoData.action",
				data : {
					"fpData" : $.toJSON(jsonfp), 
					"kpfwqh" : kpfwqh, 
					"kpdh" : kpdh, 
					"dkid" : xsdbh, 
					"fpscfs" : window.top["GlobalVal_Card_UploadMode"],
					"hsjgbz" : $('#hs_id').is(':checked') ? "1" : "0"
				},
				dataType : "json",
				success : function(data){
					
					var obj = data;//转换成json对象
					
		            var code = obj.retcode;
		            var message = obj.retMsg;
		            
		            ConsolePrintDebugLog("||||||||||-->发票数据同步返回码：" + code + ", 返回信息：" + message, "i");
		            
		            if(callback != undefined)
		            	callback(obj);
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
					if(callback != undefined)
						callback({"code":"-1", "retMsg":errorThrown});
			  	}
			});
		} else {
			if(callback != undefined)
				callback({"code":"-1", "retMsg":jsonfp.retmsg});
		}
	});
}

//正数负数发票转换
function pthzfptksq(tkType, view) {
	
	var fpmc = $("#span_fpzl").text();
	if(view != undefined){
		if (tkType == "red" && view == "1"){
			$("#ghdwmc").attr("disabled", "disabled");
			$("#ghdwsh").attr("disabled", "disabled");
			$("#ghdwdzdh").attr("disabled", "disabled");
			$("#ghdwyhzh").attr("disabled", "disabled");
		}
		changeBlueRed(tkType);
		if (view != "1"){
			emptyInvoicePage();
		}
		
	} else {
		if(fpmc=="货物运输业增值税专用发票"){
			alert("货物运输业增值税专用发票只能申请填开正数发票！");
			return;
		}
		var infoKind = $("#fpzl").val();
		if (infoKind == 0 && tkType == "red") {
			$.jqalert("专用发票只能申请填开正数发票！");
			return;
		}
		var msgType = tkType == "blue" ? "正数" : "负数";
		var confirmResult = false;
		$.jqconfirm("是否将页面内数据清空并转换为填开" + msgType + "发票？", "", 
			function ok(data){
				changeBlueRed(tkType);
				if (view != "1"){
					emptyInvoicePage();
				}
			}
		);
	}
}

function changeBlueRed(tkType){
	if (tkType == "blue") {
		$("#negFlag").val('0');
		$("#balance").css('opacity', 1);
		$("#balance").removeAttr('disabled');
		$("#discount").css('opacity', 1);
		$("#discount").removeAttr('disabled');
		$("#copyInv").css('opacity', 1);
		$("#copyInv").removeAttr('disabled');
		$("#copyBlueInv").css('opacity', 0.5);
		$("#copyBlueInv").attr('disabled', 'disabled');
		$("#list_id").css('opacity', 1);
		$("#list_id").removeAttr('disabled');
		$("#keepBzPtVal").val("");
    	
		$("#ghdwmc").removeAttr("disabled");
		$("#ghdwsh").removeAttr("disabled");
		$("#ghdwdzdh").removeAttr("disabled");
		$("#ghdwyhzh").removeAttr("disabled");
	  	$("#lphjse").val(0);//对应蓝税额
	  	$("#lphjje").val(0);//对应蓝金额
		$("#lpslv").val(0);//对应蓝税率
		
		$("#blue_in").css('display', 'block');
		$("#blue_out").css('display', 'none');
		$("#red_in").css('display', 'none');
		$("#red_out").css('display', 'block');
	}
	if (tkType == "red") {
		$("#negFlag").val('1');
		$("#balance").css('opacity', 0.5);
		$("#balance").attr('disabled', 'disabled');
		$("#discount").css('opacity', 0.5);
		$("#discount").attr('disabled', 'disabled');
		$("#copyBlueInv").css('opacity', 1);
		$("#copyBlueInv").removeAttr('disabled');
		$("#copyInv").css('opacity', 0.5);
		$("#copyInv").attr('disabled', 'disabled');
		$("#list_id").css('opacity', 0.5);
		$("#list_id").attr('disabled', 'disabled');
		$("#list_id").removeAttr('checked');
		$("#keepBzPtVal").val("");
    	
		$("#blue_in").css('display', 'none');
		$("#blue_out").css('display', 'block');
		$("#red_in").css('display', 'block');
		$("#red_out").css('display', 'none');
	}
}


//红票开具，带出蓝票信息校验并赋值
function InvRedIsCan(fpzl, fpdm, fphm, method){
	
	if(fpzl == "0"){
		$.jqalert('本张发票为专用发票，请选择普通发票！');
		return;
	}
	
	$.ajax({
		type : "POST",
		url : "../../kpgl/kpsq/queryYkfpByZlDmHm.action",
		data : {
			'fpzl' : fpzl, 
			'fpdm' : fpdm, 
			'fphm' : fphm,
			'type' : 'blue' 
		},
		dataType : "json",
		success : function(data){
			//$.jqalert(data);
			
			var obj = data;
			
			if (obj.code == 0) {
				$.jqalert(obj.msg);
				
				$("#blueExist").val("1");
				
				// 禁用购方信息
				$("#ghdwmc").attr("disabled", "disabled");
				$("#ghdwsh").attr("disabled", "disabled");
				$("#ghdwdzdh").attr("disabled", "disabled");//专普票的
				$("#ghdwyhzh").attr("disabled", "disabled");//专普票的
				$("#jdc_gmfnsrsbh").attr("disabled", "disabled");//机动车票的
				
				$("#balance").css('opacity', 0.5);
				$("#balance").attr('disabled', 'disabled');
				
				ptfplpOk(obj, fpdm, fphm, method);
			}
			else if (obj.code == 10) {
				$.jqalert("本张发票可以开负数，但在当前发票库中没有找到相应蓝字发票信息！");
				
				$("#blueExist").val("0");
				
				$("#ghdwmc").attr("disabled", false);
				$("#ghdwsh").attr("disabled", false);
				$("#ghdwdzdh").attr("disabled", false);//专普票的
				$("#ghdwyhzh").attr("disabled", false);//专普票的
				$("#jdc_gmfnsrsbh").attr("disabled", false);//机动车票的
				
				$("#keepBzPtVal").val("");
				$("#dylpfpdm").val(fpdm);//对应蓝票发票代码
				$("#dylpfphm").val(fphm);//对应蓝票发票号码
				$("#lphjse").val("");//对应蓝票税额
				$("#lphjje").val("");//对应蓝票金额
				$("#lpslv").val("");//对应蓝票税率
				$("#lpqdbz").val("");//对应蓝票清单标志
		        
				emptyInvoicePage();
				//$("#keepBzPtVal").val("对应正数发票代码:" + fpdm + "号码:" + fphm);
				$("#bz").val("对应正数发票代码:" + fpdm + "号码:" + fphm + "\n");
				
				$("#balance").css('opacity', 1);
				$("#balance").removeAttr('disabled');
				
				method();
			}
			else{
				$.jqalert('本张发票不可以开负数！原因：' + obj.msg);
				$("#blueExist").val("0");
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
	  	}
	});
}

/**
 * 普通发票红字发票选择蓝票信息
 */
function ptfplpOk(obj, fpdm, fphm, method) {
	
	$("#keepBzPtVal").val("对应正数发票代码:" + fpdm + "号码:" + fphm);
	
	if (obj.master == null) {
		$("#bz").val("对应正数发票代码:" + fpdm + "号码:" + fphm + "\n");
		$("#blueExist").val("0");
		method();
		return;
	}
	//找到蓝字发票
	if ($("#blueExist").val() == "1") {
		
		obj["master"].skr = null;
		obj["master"].fhr = null;
		obj["master"].kpr = null;
		
		if(obj["master"].gfsh == "000000000000000")
			obj["master"].gfsh = "";
		
		InvObjFpkj = objToInvoice(obj, obj.xxfpMxList, 2);//1表示申请单或待开，2表示选择蓝票，3表示发票复制，4表示已开查询
		
		InvObjFpkj.refInvoiceCode = fpdm;
		InvObjFpkj.refInvoiceNr = fphm;
		
		if(obj["master"]["fpzl"]=="2" || obj["master"]["fpzl"]=="51"){//普通发票或电子发票
			InvObjFpkj.meno = InvObjFpkj.redMemo();
			if($("#kprtxt").val()!=null || $("#kprtxt").val()!="")
				InvObjFpkj.issuer = $("#kprtxt").val();
			
			if(obj.xxfpMxList != null && obj.xxfpMxList.length > 0)
				$("#lpslv").val(obj.xxfpMxList[0]["slv"]);//对应蓝票税率
			
		} else if(obj["master"].master["fpzl"]=="12"){
			if($("#kprtxt").val()!=null || $("#kprtxt").val()!="")
				InvObjFpkj.infoInvoicer = $("#kprtxt").val();
			
			InvObjFpkj.amountTaxTotal = -InvObjFpkj.amountTaxTotal;
			InvObjFpkj.InfoTaxAmount = -InvObjFpkj.InfoTaxAmount;
			
			$("#lpslv").val(obj["master"]["fpsl"]);//对应蓝票税率
			
			//机动车选择蓝票后不允许再修改信息
			$("#xhdwmc").attr("disabled","disabled");
			$("#xhdwsh").attr("disabled","disabled");
			$("#kprtxt").attr("disabled","disabled");
			
			$("#jdc_gfmc").attr("disabled","disabled");
			$("#jdc_gmfzzjgdm").attr("disabled","disabled");
			$("#jdc_gmfnsrsbh").attr("disabled","disabled");
			$("#jdc_cllx").attr("disabled","disabled");
			$("#jdc_cpxh").attr("disabled","disabled");
			$("#jdc_cd").attr("disabled","disabled");
			$("#jdc_hgzh").attr("disabled","disabled");
			$("#jdc_jkzmsh").attr("disabled","disabled");
			$("#jdc_sjdh").attr("disabled","disabled");
			$("#jdc_fdjhm").attr("disabled","disabled");
			$("#jdc_clsbdh").attr("disabled","disabled");
			$("#jdc_jshjxx").attr("disabled","disabled");
			$("#jdc_xhdwdh").attr("disabled","disabled");
			$("#jdc_xhdwzh").attr("disabled","disabled");
			$("#jdc_xhdwdz").attr("disabled","disabled");
			$("#jdc_xhdwkhyh").attr("disabled","disabled");
			$("#jdc_zzssl").attr("disabled","disabled");
			$("#jdc_zgswjgmc").attr("disabled","disabled");
			$("#jdc_zgswjgdm").attr("disabled","disabled");
			$("#jdc_dw").attr("disabled","disabled");
			$("#jdc_xcrs").attr("disabled","disabled");
			$("#jdc_scqymc").attr("disabled","disabled");
		}
		
		setInvoicePage(InvObjFpkj);//设置票面
		
		$("#dylpfpdm").val(fpdm);//对应蓝票发票代码
		$("#dylpfphm").val(fphm);//对应蓝票发票号码
		$("#lphjse").val(obj["master"]["hjse"]);//对应蓝票税额
		$("#lphjje").val(obj["master"]["hjje"]);//对应蓝票金额
		
		$("#lpqdbz").val(obj["master"]["qdbz"]);//对应蓝票清单标志
		
		//去掉备注中的差额征税字样
		var bz = $.trim($("#bz").val());
		while(true){
			var cezs = bz.match(/差额征税：.*?。/);//.*表示0或多个任意字符，后面的?表示非贪婪匹配，匹配到第一个。即可
			if(cezs == null)
				break;
			bz = bz.replace(cezs[0], "");
		}
		if(obj.xxfpMxList.length > 0 && obj.xxfpMxList[0].cezs != undefined && obj.xxfpMxList[0].cezs != "")
			bz = "差额征税。" + bz;
		$("#bz").val(bz);
		
		method();
	}
}

//发票复制
function copyInvSetPage(fpzl, fpdm, fphm, method) {
	
	$.ajax({
		type : "post",
		url : "../../kpgl/kpsq/queryYkfpByZlDmHm.action",
		data : {
			'fpzl' : fpzl, 
			'fpdm' : fpdm, 
			'fphm' : fphm,
			'type' : 'copy'
		},
		dataType : 'json', 
		beforeSend : function() {
		},
		success : function(data) {
			//$.jqalert(data);
			var obj = data;
			
			obj["master"].xfmc = $("#user_nsrmc").val();
			obj["master"].xfsh = $("#user_nsrsbh").val();
			
			if(obj["master"].gfsh == "000000000000000")
				obj["master"].gfsh = "";
			
			//以下为三个票种不同的票面赋值
			obj["master"].skr = null;
			obj["master"].fhr = null;
			obj["master"].kpr = null;
			
			if($("#macNo").html() != ""){
				obj["master"].jqbh = "";
			}
			InvObjFpkj = objToInvoice(obj, obj.xxfpMxList, 3);//1表示申请单或待开，2表示选择蓝票，3表示发票复制，4表示已开查询
			
			setInvoicePage(InvObjFpkj);//设置票面
			
			showDivInfo("divDkFpInfo","squ",obj["master"].fpzl);
			
			if(obj.xxfpMxList != null && obj.xxfpMxList.length > 0 && obj.xxfpMxList[0].cezs != "" && obj.xxfpMxList[0].cezs != undefined){
				$("#cezs_img").removeClass("fa-times");
				$("#cezs_img").addClass("fa-times-circle");
				
				$("#list_id").attr("disabled", "disabled");
			}
			
			method();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
  			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
	  	},
		complete : function() {
		}
	});
}


//切换发票种类
function selectFpzl(){
	var fpzlVal = $('#fpzl').find("option:selected").text();
	var fpzl = $('#fpzl').find("option:selected").val();
	var negFlag = $("#negFlag").val();
	
	
	

	
	/*if(fpzl == "51"){
		$("#list_id").hide();
		$("#list_span").hide();
	} else {
		$("#list_id").removeAttr("checked");
		$("#list_id").show();
		$("#list_span").show();
	}*/
	switch (fpzl)
	{
	case "51":
		$("#list_id").hide();
		$("#list_span").hide();
		$("#hs_id").removeAttr("checked");
		$("#hs_id").show();
		$("#hs_span").show();
		$("#balance").show();
		$("#div_InvInfoOutput").empty();
		var invInfoOutput = GetInvInfoZzsfp();
		$("#div_InvInfoOutput").append(invInfoOutput);
		fuzhi();
		break;
	case "41":
		$("#list_id").hide();
		$("#list_span").hide();
		$("#hs_id").attr("checked", true);
		$("#hs_id").hide();
		$("#hs_span").hide();
		$("#balance").hide();
		$("#div_InvInfoOutput").empty();
		var invInfoOutput = GetInvInfoJpfp();
		$("#div_InvInfoOutput").append(invInfoOutput);
		Jpfuzhi();
		break;
	default:
		$("#list_id").removeAttr("checked");
		$("#list_id").show();
		$("#list_span").show();
		$("#hs_id").removeAttr("checked");
		$("#hs_id").show();
		$("#hs_span").show();
		$("#balance").show();
		$("#div_InvInfoOutput").empty();
		var invInfoOutput = GetInvInfoZzsfp();
		$("#div_InvInfoOutput").append(invInfoOutput);
		fuzhi();
		break;
	}
	if(fpzl == "0" && negFlag == "1"){
		$.jqalert("当前申请填开为负数发票，不能转为专票填开！请切换为正数发票填开。");
		if($("#span_fpzl").html().indexOf("电子")!=-1){
			$('#fpzl').val("51");
			$("#span_fpzl").html("电子增值税普通发票 ");
		}else if($("#span_fpzl").html().indexOf("卷票")!=-1){
			$('#fpzl').val("41");
			$("#span_fpzl").html("增值税普通发票（卷票） ");
		}else{
			$('#fpzl').val("2");
			$("#span_fpzl").html("增值税普通发票 ");
		}
		return;
	}else{
		$('#fpzl').val(fpzl);
		$("#span_fpzl").html("增值税" + fpzlVal);
	}
	
	initKpfsHzfw("", $("#isHzfwQy").val());
	//emptyInvoicePage();
	
	$("#cezs_img").removeClass("fa-times-circle");
	$("#cezs_img").addClass("fa-times");
}


//开票管理关闭窗口，删除页面元素
function closeDivEmpty(divid){
	$("#bgFilter").css("display", "none");
	$("#" + divid).css("display", "none");
	$("#" + divid).html("");
}

var divDkFpInfoStr = "";//全局变量，存储复制发票时原待开发票页面信息字符串

//关闭窗口，删除页面元素，遮罩层还原
function closeDivEmptyFilter(divid,hytype,isShowDivDkFp){//isShowDivDkFp，是否还原暂存的待开发票页面
	
	if(hytype == "inv")
		$("#bgFilter").css("z-index", bgFilterZ_inv);
	if(hytype == "invQd")
		$("#bgFilter").css("z-index", bgFilterZ_invQd);
	if(divid == "divInvInfoXxfp")
		$("#bgFilter").css("display", "none");
	
	$("#" + divid).css("display", "none");
	$("#" + divid).html("");
	
}


//获取发票明细信息
function getInvDetail(divid,divQdid,fpdm,fphm,fpzl,kpfs) {
	
	$("#" + divid).empty();
	
	var strDiv = 
		
		"<table id=\"tbl_kpToolBar_mx\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:751px;height: 25px\">" + 
		"<tr style=\"background-image:url(" + Propath + "images/toolbar.png);\">" + 
		"<td colspan=\"10\" style=\"vertical-align: middle;\">" + 
		
		"<div id=\"divBtn_hsqdbz_mx\" style=\"float: left;vertical-align: middle;margin-top:3px;\">" + 
		"	<input type=\"checkBox\" id=\"hs_id_mx\" onclick=\"jezh('sph_mx',this.checked,'',"+fpzl+",'_mx')\" style=\"margin-left:5px; margin-top:-4px; width: 18px; height: 18px; vertical-align: middle;\" />" + 
		"	<span id=\"hs_span_mx\">含税</span>" + 
		"	<input type=\"checkbox\" id=\"list_id_mx\" style=\"margin-left:5px; margin-top:-4px; width: 18px; height: 18px; vertical-align: middle;\" disabled=\"disabled\"/>" + 
		"	<span id=\"list_span_mx\">清单</span>" + 
		"</div>" + 
		
		"<div id=\"divBtn_redAndBlue_mx\" style=\"float: right; margin-right:0px;\">" + 
		"   <button id=\"blue_in_mx\" class=\" btn btn-primary btn-xs \" style=\"height:25px;margin-left:0px;float: left;\" onClick=\"\">正数</button>" +
		"   <button id=\"blue_out_mx\" class=\" btn btn-info btn-xs \" style=\"height:25px;margin-left:0px;display:none;float: left;\" onClick=\"\">正数</button>" +
		"   <button id=\"red_in_mx\" class=\" btn btn-danger btn-xs \" style=\"height:25px;margin-left:0px;display:none;float: left;\" onClick=\"\">负数</button>" +
		"   <button id=\"red_out_mx\" class=\" btn btn-info btn-xs \" style=\"height:25px;margin-left:0px;float: left;\" onClick=\"\">负数</button>" +
		"</div>" + 
		
		"<div id=\"divBtn_xfkpfs_mx\" style=\"float: right; margin-right:10px; height:25px\">" + 
		"	<select id=\"dkfpxx_xfkpfs_mx\" name=\"dkfpxx_xfkpfs\" style=\"height:25px;line-height:25px;\" disabled=\"disabled\">" + 
		"		<option value=\"0\">服务器</option>" + 
		"		<option value=\"1\">单机版</option>" + 
		"	</select>" + 
		"</div>" + 
		"</td>" + 
		"</tr>" + 
		"</table>" + 
		
		"<input type=\"hidden\" id=\"negFlag_mx\" value=\"0\" />" +		//负数发票标志  1为负数 0为正数
		
		"<div id=\"contentView_mx\" style=\"overflow-y: hidden; overflow-x: hidden;\">" + 
		"   <input type=\"checkbox\" id=\"hs_id_mx\" style=\"display:none;\"/>" + 
		"	<div id=\"div_InvInfoView_mx\"></div>" + 
		"</div>" ;
	
	$("#" + divid).append(strDiv);
	if(fpzl==0 || fpzl==2 || fpzl==51){
		$("#div_InvInfoView_mx").append(GetInvInfoZzsfp_mx());
	} else if(fpzl==11){
		$("#div_InvInfoView_mx").append(GetInvInfoHyfp());
	} else if(fpzl==12){
		$("#div_InvInfoView_mx").append(GetInvInfoJdcfp());
	}else if(fpzl==41){
		$("#div_InvInfoView_mx").append(GetInvInfoJpfp());
	}
	
	setHsidOnClick("hs_id_mx", fpzl);
	
  	$.ajax({
  		type : "post", 
  		url :  "../../kpgl/kpsq/queryYkfpByZlDmHm.action", 
  		data : {
	  		'fpzl' : fpzl,
			'fpdm' : fpdm,
			'fphm' : fphm 
  		},
  		dataType : 'json',					//服务器返回的数据类型 可选XML ,Json jsonp script html text等
		beforeSend:function(){
			$("#bgFilter").css("display","block");
			$("#loadingProgress").css("display","block");
		},
		complete:function(){
			$("#bgFilter").css("display","none");
			$("#loadingProgress").css("display","none");
		},
  		success : function(data) {
			
			var obj = data;
			
			if(obj["master"].fpsl!="" && obj["master"].fpsl!="10.02" && obj["master"].fpsl>=1){//从税盘读取的税率，有些是3代表3%的数据，要还原成小数
				obj["master"].fpsl = obj["master"].fpsl * 0.01;
			}
			if(obj["master"].gfsh == "000000000000000")
				obj["master"].gfsh = "";
			
  			InvObjFpkj = objToInvoice(obj, obj.xxfpMxList, 4);//1表示申请单或待开，2表示选择蓝票，3表示发票复制，4表示已开查询
			
  			var fpzl = obj["master"].fpzl;
  			
  			if(fpzl == "51"){
  				$("#list_id_mx").css("display","none");
  				$("#list_span_mx").css("display","none");
  			}
  			
  			$("#fpzl_mx").val(fpzl);
  			$("#dkfpxx_xfkpfs_mx").val(obj["master"].kpfs);	//销方开票方式 0 服务器版开票; 1 单机版开票;
  			$('#fplbdm_mx').html(obj["master"].fpdm);
  			$('#fphm_mx').html(obj["master"].fphm);
  			$("#kprq_mx").html( (obj["master"].kprq != null && obj["master"].kprq != "") ? obj["master"].kprq.substring(0,10) : obj["master"].kprq );
  			
  			setInvoicePage(InvObjFpkj, "_mx");//设置票面
			
			//货运票负票，需要把合计金额、税额转为负数
			if(obj["master"].fpzl == 11 && obj["master"].hjje < 0){
				var hjje = $('#zje').html();
				hjje = hjje.substr(1, hjje.length);
				$('#zje').html('￥-' + hjje);
				
				var hjse = $('#zse').html();
				hjse = hjse.substr(1, hjse.length);
				$('#zse').html('￥-' + hjse);
				
				var jshj = $('#jshj').html();
				jshj = jshj.substr(1, jshj.length);
				$('#jshj').html('￥-' + jshj);
				$('#jshjdx').html(todx(-jshj));//价税合计大写
			}
			
			//添加正、负、红票图片标志
  			var fpimg = "<img id=\"fpFlag_mx\" style=\"margin-left:65px; margin-top:55px; position: absolute;\" />";
			$("#span_fpzl_mx").append(fpimg);
			
			//正数负数发票转换
			if(obj["master"].hjje < 0){
				$("#blue_in_mx").css('display', 'none');
				$("#blue_out_mx").css('display', 'block');
				$("#red_in_mx").css('display', 'block');
				$("#red_out_mx").css('display', 'none');
				if(fpzl == 0)
					$('#fpFlag_mx').attr("src", Propath + "images/redFlag.gif");
				else
					$('#fpFlag_mx').attr("src", Propath + "images/fushu.png");
			}
			else {
				$('#fpFlag_mx').attr("src", Propath + "images/zhengshu.gif");
			}
			if(obj.master["zfbz"] == 1){
				$('#fpFlag_mx').attr("src", Propath + "images/cancelFlag.gif");
			}
			
  			//处理带清单的发票
			if($("#spmc_mx_0").val() =="(详见销货清单)"){
				document.getElementById("spmc_mx_0")["parentNode"].innerHTML = "<a href=\"javascript:getSaleDetail('"
						+divQdid+"','"+divid+"','"+fpdm+"','"+fphm+"','"+fpzl+"');\">"+"(详见销货清单)"+"</a>";
			}
			
			openYkfpDialog("详细信息");
  		},
  		error: function(XMLHttpRequest, textStatus, errorThrown) {
  			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);	  			
	  	}
  	});
  	
}


//获取发票销货清单信息
function getSaleDetail(divid,divInvid,fpdm,fphm,fpzl) {
	
	showDivInvQdInfo(divid);
	
  	$.ajax({
  		type : "post", 
  		url :  "../../kpgl/kpsq/queryYkfpQdByZlDmHm.action", 
  		data : {
	  		'fpzl' : fpzl,
			'fpdm' : fpdm,
			'fphm' : fphm 
  		},
  		dataType : 'json',					//服务器返回的数据类型 可选XML ,Json jsonp script html text等
  		beforeSend:function(){
			$("#bgFilter").css("display","block");
			$("#loadingProgress").css("display","block");
		},
		complete:function(){
			$("#bgFilter").css("display","none");
			$("#loadingProgress").css("display","none");
		},
  		success : function(data) {
  			//$.jqalert(data);
  			var obj = data;
  			
  			var tr_class = "bgTrEven";
  			
			var str = "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"msgTblGrid\" >";
			
			for(var i in obj){
				i = parseInt(i);
				if(i%2==1)
					tr_class = "bgTrOdd";
				else
					tr_class = "bgTrEven";
				
				var num = i+1;
				var hsjgbz = obj[i]["hsjgbz"];
				var spmc = obj[i]["spmc"];
				var ggxh = obj[i]["ggxh"];
				var jldw = obj[i]["jldw"];
				var sl = "";
				var dj = "";
				var hsdj = "";
				var bhsdj = "";
				if(obj[i]["dj"] != null){
					dj = ConStrNumSetZero(obj[i]["dj"]);
					hsdj = gethsdjRet(hsjgbz, ConStrNumSetZero(obj[i]["dj"]), obj[i]["slv"]);
					bhsdj = getbhsdjRet(hsjgbz, ConStrNumSetZero(obj[i]["dj"]), obj[i]["slv"]);
				}
				if(obj[i]["sl"] != null){
					sl = ConStrNumSetZero(obj[i]["sl"]);
				}
				var je = obj[i]["je"];
				var slv = famount(obj[i]["slv"]);
				var se = obj[i]["se"];
				
				var includeTax = $('#hs_id_mx').is(':checked');
				
				if(includeTax){
					je = (parseFloat(je) + parseFloat(se)).toFixed(2);//页面菜单上含税时，金额也要含税
					dj = hsdj;
				}
				else
					dj = bhsdj;//页面上不含税时
				
				sl = famount(sl);
				dj = famount(dj);
				je = fmoney(je,2);
				se = fmoney(se,2);
				
				if(slv == null || slv == "" || (slv == "0" && obj[i]["se"] != 0)){
					slv = "";
				} else if(slv == "0") {
					slv = "0%";
				} else if(slv == "0.015"){
					slv = "1.5%";
				} else {
					slv = parseInt(slv*100) + "%";
				}
				
				str += 
					"<tr class=\"" + tr_class + "\">\n" +
					" <td  nowrap=\"nowrap\" style=\"width:35px; height:25px; text-align:center; vertical-align:middle;\"><span>" + num + "</span></td>\n" + 
					" <td  nowrap=\"nowrap\" style=\"width:160px;\" title='"+spmc+"'><span style=\"margin-left: 5px;\">"+(spmc==''?'&nbsp':substr_zj(spmc,12))+"</span></td>\n" + 
					" <td  nowrap=\"nowrap\" style=\"width:90px;\" title='"+ggxh+"'><span style=\"margin-left: 5px;\">" + (ggxh==''?'&nbsp':substr_zj(ggxh,6)) + "</span></td>\n" +
					" <td  nowrap=\"nowrap\" style=\"width:65px;\" title='"+jldw+"'><span style=\"margin-left: 5px;\">" + (jldw==''?'&nbsp':substr_zj(jldw,4)) + "</span></td>\n" + 
					" <td  nowrap=\"nowrap\" style=\"width:150px;text-align: right;word-break: break-all;\"><span style=\"margin-right: 5px;\">" +(sl == 0 ? '' : sl)+ "</span></td>\n" + 
					" <td  nowrap=\"nowrap\" style=\"width:150px;text-align: right;word-break: break-all;\"><span style=\"margin-right: 5px;\">" + (dj == 0 ? '' : dj) + "</span></td>\n" + 
					" <td  nowrap=\"nowrap\" style=\"width:150px;text-align: right;word-break: break-all;\"><span style=\"margin-right: 5px;\">" + je + "</span></td>\n" + 
					" <td  nowrap=\"nowrap\" style=\"width:40px;text-align: right;word-break: break-all;\"><span style=\"margin-right: 5px;\">" + slv + "</span></td>\n" + 
					" <td  nowrap=\"nowrap\" style=\"width:150px;text-align: right;word-break: break-all;\"><span style=\"margin-right: 5px;\">" + se + "</span></td>\n" + 
					" <td  nowrap=\"nowrap\" ></td>\n" + 
					"</tr>";
			}
			
			str += "</table>";
			
			$("#div_SaleDetail").append(str);
			
		  	openYkfpQdDialog("查看销货清单", obj.length);
  		},
  		error: function(XMLHttpRequest, textStatus, errorThrown) {
  			AjaxErrorManage(XMLHttpRequest,textStatus,errorThrown);
	  	}
  	});
}

//处理返回不含税单价
function getbhsdjRet(hsjgbz, dj, slv) {
	if(hsjgbz == 1 && dj != null && dj != "" && slv != null && slv != ""){
		if(slv == 0.015)
			dj = accCount(cfCount(dj, 69, 15), 70, 15);
		else
			dj = dj = accCount(dj, (slv * 1 + 1), 15);
	}
	return dj;
}

//处理返回含税单价
function gethsdjRet(hsjgbz, dj, slv) {
	if(hsjgbz == 0 && dj != null && dj != "" && slv != null && slv != ""){
		if(slv == 0.015)
			dj = accCount(cfCount(dj, 70, 15), 69, 15);
		else
			dj = cfCount(dj, (slv * 1 + 1), 15);
	}
	return dj;
}


//将待开发票头部信息层隐藏
function showInvTopInfo(obj){
	if(obj == undefined)
		obj = document.getElementById("imgShowHide");
	
	var divId = "";
	switch(ShowDivType){
		case "kpsh" : divId = "otherDivsq"; break;
		case "kpshv" : divId = "otherDivsq"; break;
		case "ckpsh" : divId = "otherDivdk"; break;
		case "ckpshv" : divId = "otherDivdk"; break;
		case "sqa" : divId = "otherDivsq"; break;
		case "sqv" : divId = "otherDivsq"; break;
		case "squ" : divId = "otherDivsq"; break;
		case "djv" : divId = "otherDivdj"; break;
		case "dju" : divId = "otherDivdj"; break;
		case "fpkj" : divId = "otherDivdk"; break;
		case "fpht" : divId = "otherDivdk"; break;
		default : divId = "otherDivdk";
	}
	
	var targetDiv = document.getElementById(divId);
	var showAddHeight = (ShowDivType == "kpsh" || ShowDivType == "kpshv" || ShowDivType == "ckpsh" || ShowDivType == "ckpshv" || ShowDivType == "fpht") ? 80 : 0;
	var hideAddHeight = (ShowDivType == "kpsh" || ShowDivType == "ckpsh" || ShowDivType == "fpht") ? 80 : 0;
	
	if (targetDiv.style.display=="none"){
		targetDiv.style.display="block";
		obj.src = Propath + "images/moveShow.png";
		
		$("#content").css("height", 613 + showAddHeight);
		xxfpDialog = $("#divDkFpInfo" ).dialog({
			height : 685 + showAddHeight
		});
	} else {
		targetDiv.style.display="none";
		obj.src = Propath + "images/moveHide.png";
		
		$("#content").css("height", 488 + hideAddHeight);
		xxfpDialog = $("#divDkFpInfo" ).dialog({
			height : 560 + hideAddHeight
		});
	}
}


//开票管理弹出窗初始化页面元素
function loadDivKpgl(divid, fpzl){
	
	$("#" + divid).empty();
	
	var strDiv = 
//"<div class=\"divMsgBoxTitleBar\">\n" +
//"  <span class=\"divMsgBoxIcon\" style=\"background-image:url(" + Propath + "images/detailIcon.png)\"></span>\n" + 
//"  <span class=\"divMsgBoxTitle\" id=\"span_title_xz\" style=\"padding-top:-2px;\">待开发票信息</span>\n" + 
//"  <span class=\"divCloseIcon\" onClick=\"closeDivEmpty('divDkFpInfo');\"></span>\n" + 
//"</div>\n" + 
//"\n" + 

"<div id = \"table_div\">" + 
"<table id=\"tbl_kpToolBar\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%; width:751px;height: 27px\">\n" + 
"<tr style=\"background-image:url(" + Propath + "images/toolbar.png);\">\n" + 
"<td colspan=\"10\" style=\"vertical-align: middle;\">\n" + 

"<div class=\"btnToolbar\" style=\"float: left !important;\">\n" + 

"<button id=\"savedj\" class=\" btn btn-primary btn-xs \" style=\"height:25px;margin-left:0px;margin-right:-10px;\" onClick=\"saveBillXxfpInfo('xsdjEdit', 'djbc'," + fpzl + ");\"><i class=\"ace-icon fa fa-floppy-o bigger-110\"></i>保存</button>" +
//"<img id=\"savedj\" class=\"btnSave\" onClick=\"saveBillXxfpInfo('xsdjEdit', 'djbc'," + fpzl + ");\" src=\"" + Propath + "images/save.png\" style=\" margin-left:5px; float: left;\" />\n" + 

"<button id=\"checkKpsh\" class=\" btn btn-primary btn-xs \" style=\"height:25px;margin-left:0px;margin-right:-10px;\" onClick=\"saveBillXxfpInfo('shlcEdit', 'auditKp'," + fpzl + ");\"><i class=\"ace-icon fa fa-check-square-o bigger-110\"></i>审核</button>" +
//"<img id=\"checkKpsh\" class=\"btnSave\" onClick=\"saveBillXxfpInfo('shlcEdit', 'auditKp'," + fpzl + ");\" src=\"" + Propath + "images/checkOver.png\" style=\" margin-left:5px; float: left;\" />\n" + 

"<button id=\"checkCkpsh\" class=\" btn btn-primary btn-xs \" style=\"height:25px;margin-left:0px;margin-right:-10px;\" onClick=\"saveBillXxfpInfo('shlcEdit', 'auditCkp'," + fpzl + ");\"><i class=\"ace-icon fa fa-check-square-o bigger-110\"></i>审核</button>" +
//"<img id=\"checkCkpsh\" class=\"btnSave\" onClick=\"saveBillXxfpInfo('shlcEdit', 'auditCkp'," + fpzl + ");\" src=\"" + Propath + "images/checkOver.png\" style=\" margin-left:5px; float: left;\" />\n" + 

"<button id=\"checkfpBack\" class=\" btn btn-primary btn-xs \" style=\"height:25px;margin-left:0px;margin-right:-10px;\" onClick=\"saveBillXxfpInfo('shlcEdit', 'auditRe'," + fpzl + ");\"><i class=\"ace-icon fa fa-reply bigger-110\"></i>回退</button>" +
//"<img id=\"checkfpBack\" class=\"btnSave\" onClick=\"saveBillXxfpInfo('shlcEdit', 'auditRe'," + fpzl + ");\" src=\"" + Propath + "images/checkBack.png\" style=\" margin-left:5px; float: left;\" />\n" + 

"<button id=\"InvPrint\" class=\" btn btn-primary btn-xs \" style=\"height:25px;margin-left:0px;float: left !important;\" onClick=\"invAndPrint();\"><i class=\"ace-icon fa fa-print bigger-110\"></i>开具并打印</button>" +
//"<img id=\"InvPrint\" class=\"btnSave\" onClick=\"invAndPrint()\" src=\"" + Propath + "images/saveAndPrint.png\" style=\" margin-left:5px; float: left;\" />\n" + 

"<button id=\"InvNotPrint\" class=\" btn btn-success btn-xs \" style=\"height:25px;margin-left:10px;margin-right:-10px;float: left !important;\" onClick=\"invNotPrint();\"><i class=\"ace-icon fa fa-print bigger-110\"></i>开具不打印</button>" +
//"<img id=\"InvNotPrint\" class=\"btnSave\" onClick=\"invNotPrint()\" src=\"" + Propath + "images/saveNotPrint.png\" style=\" margin-left:5px; float: left;\" />\n" + 

"</div>" +

"<div id=\"divBtn_sq\" class=\"btnToolbar\" style=\"float: left !important;\">\n" + 

"<button id=\"temporarySave\" class=\" btn btn-primary btn-xs \" style=\"height:25px;margin-left:0px;\" onClick=\"saveBillXxfpInfo('kpsqEdit', 'sqzc'," + fpzl + ");\"><i class=\"ace-icon fa fa-floppy-o bigger-110\"></i>暂存</button>" +
//"<img id=\"temporarySave\" onClick=\"saveBillXxfpInfo('kpsqEdit', 'sqzc'," + fpzl + ");\" src=\"" + Propath + "images/temporarySave.png\" style=\"margin-left:10px;vertical-align: -25%;\" />\n" + 

"<button id=\"submit\" class=\" btn btn-primary btn-xs \" style=\"height:25px;margin-left:3px;\" onClick=\"saveBillXxfpInfo('kpsqEdit', 'sqtj'," + fpzl + ");\"><i class=\"ace-icon fa fa-check-square-o bigger-110\"></i>提交</button>" +
//"<img id=\"submit\" onClick=\"saveBillXxfpInfo('kpsqEdit', 'sqtj'," + fpzl + ");\" src=\"" + Propath + "images/submit.png\" style=\"vertical-align: -25%;\" />\n" + 

"<button id=\"copyBlueInv\" class=\" btn btn-info btn-xs \" style=\"height:25px;margin-left:3px;\" onClick=\"showYkfpList();\"><i class=\"ace-icon fa fa-hand-o-up bigger-110\"></i>蓝票</button>" +
//"<img id=\"copyBlueInv\" onclick=\"showYkfpList();\" src=\"" + Propath + "images/copyBlueInv.png\" style=\"vertical-align: -25%;\" />\n" + 

"<button id=\"copyInv\" class=\" btn btn-info btn-xs \" style=\"height:25px;margin-left:3px;\" onClick=\"showYkfpList();\"><i class=\"ace-icon fa fa-files-o bigger-110\"></i>复制</button>" +
//"<img id=\"copyInv\" onClick=\"showYkfpList();\" src=\"" + Propath + "images/copy.png\" style=\"vertical-align: -25%;\" />\n" + 

"<button id=\"discount\" class=\" btn btn-success btn-xs \" style=\"height:25px;margin-left:3px;\" onClick=\"addDiscount(checkIdList());\"><i class=\"ace-icon fa fa-pencil-square-o bigger-110\"></i>折扣</button>" +
//"<img id=\"discount\" onClick=\"addDiscount(checkIdList());\" src=\"" + Propath + "images/discount.png\" style=\"vertical-align: -25%;\" />\n" + 

"<button id=\"balance\" class=\" btn btn-success btn-xs \" style=\"height:25px;margin-left:3px;\" onClick=\"openCezsDialog()\"><i id=\"cezs_img\" class=\"ace-icon fa fa-times bigger-110\" style=\"width:13px;\"></i>差额</button>" +
//差额征税

"<button id=\"spaddRow\" class=\" btn btn-info btn-xs \" style=\"height:25px;margin-left:3px;\" onClick=\"addRow(checkIdList(),"+fpzl+");\"><img src=\"" + Propath + "images/addItem.png\" style=\"width:18px;height:19px;margin-top:-5px;margin-left:-5px;margin-right:-5px;\" /></button>" +
"<button id=\"spdelRow\" class=\" btn btn-info btn-xs \" style=\"height:25px;margin-left:3px;margin-right:-10px;\" onClick=\"delRow(checkIdList(),"+fpzl+");\"><img src=\"" + Propath + "images/removeItem.png\" style=\"width:18px;height:19px;margin-top:-5px;margin-left:-5px;margin-right:-5px;\" /></button>" +
//"<img id=\"spaddRow\" onClick=\"addRow(checkIdList(),"+fpzl+");\" src=\"" + Propath + "images/addItem.png\" style=\"margin-left:10px;margin-top:-1px;cursor:pointer;\" />\n" + 
//"<img id=\"spdelRow\" onClick=\"delRow(checkIdList(),"+fpzl+");\" src=\"" + Propath + "images/removeItem.png\" style=\"margin-left:5px; margin-top:-1px; margin-right:-10px;cursor:pointer;\" />\n" + 

"</div>\n" + 

"<div id=\"divBtn_hsqdbz\" style=\"float: left;vertical-align: middle;margin-top:3px;\">\n" + 
"<input type=\"checkBox\" id=\"hs_id\" onclick=\"jezh('sph',this.checked,'',"+fpzl+");\" style=\"margin-top:-4px;margin-left:5px;width: 18px; height: 18px; vertical-align: middle;cursor:pointer;\" />\n" + 
"<span id=\"hs_span\" style=\"margin-left:-3px;\">含税</span>\n" + 
"<input type=\"checkbox\" id=\"list_id\" style=\"margin-top:-4px;width: 18px; height: 18px; vertical-align: middle;cursor:pointer;\" />\n" + 
"<span id=\"list_span\" style=\"margin-left:-3px;\">清单</span>\n" + 
"</div>\n" + 
"<div id=\"divBtn_redAndBlue\" style=\"float: right; margin-right:0px;\">\n" + 
"<button id=\"blue_in\" class=\" btn btn-primary btn-xs \" style=\"height:25px;margin-left:0px;float: left;\" onClick=\"\"><font>正数</font></button>" +
//"<img id=\"blue_in\" class=\"btnSave\" onClick=\"\" src=\"" + Propath + "images/blue_in.png\" style=\"float: left;cursor:pointer;\" />\n" + 

"<button id=\"blue_out\" class=\" btn btn-info btn-xs \" style=\"height:25px;margin-left:0px;display:none;float: left;\" onClick=\"pthzfptksq('blue');\"><font>正数</font></button>" +
//"<img id=\"blue_out\" class=\"btnSave\" onClick=\"pthzfptksq('blue')\" src=\"" + Propath + "images/blue_out.png\" style=\"float: left;display:none;cursor:pointer;\" />\n" + 

"<button id=\"red_in\" class=\" btn btn-danger btn-xs \" style=\"height:25px;margin-left:0px;display:none;float: left;\" onClick=\"\"><font>负数</font></button>" +
//"<img id=\"red_in\" class=\"btnSave\" onClick=\"\" src=\"" + Propath + "images/red_in.png\" style=\"float: left;display:none;cursor:pointer;\" />\n" + 

"<button id=\"red_out\" class=\" btn btn-info btn-xs \" style=\"height:25px;margin-left:0px;float: left;\" onClick=\"pthzfptksq('red');\"><font>负数</font></button>" +
//"<img id=\"red_out\" class=\"btnSave\" onClick=\"pthzfptksq('red')\" src=\"" + Propath + "images/red_out.png\" style=\"float: left;cursor:pointer;\" />\n" + 
"</div>" + 
"<div id=\"divBtn_xfkpfs\" style=\"float: right; margin-left:-5px; margin-right:5px;height:25px\">\n" + 
//"<button class=\" btn btn-info btn-xs \" style=\"height:25px;margin-left:10px;margin-right:-5px;\" onClick=\"showInvTopInfo();\"><img id=\"imgShowHide\" src=\"" + Propath + "images/moveShow.png\" style=\"margin-top:-5px;margin-left:-5px;margin-right:-5px;\"></img></button>" +
"<img src=\"" + Propath + "images/moveShow.png\" style=\"margin-left:0px;margin-right:0px; margin-top:-2px;cursor:pointer;\" onClick=\"showInvTopInfo(this);\"></img>\n" + 

"<select id=\"dkfpxx_xfkpfs\" name=\"dkfpxx_xfkpfs\" disabled=\"disabled\" style=\"height:25px;line-height:25px;\">" + 
"<option value=\"0\">服务器</option>" + 
"<option value=\"1\">单机版</option>" + 
"</select>" + 
"</div>" + 
"</td>\n" + 
"</tr>\n" + 
"</table>\n" + 
"</div>" + 
"\n" + 

"<div id=\"content\" style=\"overflow-y: hidden; overflow-x: hidden; width:751px;\">\n" + 
"\n" + 
"<div id=\"otherDivdj\" class=\"ItemInputDiv\" style=\"margin-left:0px;margin-top:5px;width:751px;\">\n" + 
"  <table id=\"otherTable\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;height:100px;\">\n" + 
"    <tr>\n" + 
"      <td class=\"leftTd\">单据编号：</td>\n" + 
"      <td class=\"rightTd\">\n" + 
"      <input id=\"txtdj_xsdjbh\" type=\"text\" class=\"form-control col-sm-12\" value=\"\" disabled=\"disabled\" style=\"margin-top:2px;height:20px;line-height:20px;\"/>\n" + 
"      <input id=\"hiddj_id\" type=\"hidden\" />\n" + 
"      </td>\n" + 
"      <td class=\"leftTd\">单据日期：</td>\n" + 
"      <td class=\"rightTd\"><input id=\"txtdj_kjrq\" type=\"text\" value=\"\" disabled=\"disabled\" style=\"margin-top:2px;height:20px;line-height:20px;\"/></td>\n" + 
"    </tr>\n" + 
"    <tr>\n" + 
"      <td class=\"leftTd\">单据状态：</td>\n" + 
"      <td class=\"rightTd\"><input id=\"txtdj_xsdzt\" type=\"text\" value=\"\" disabled=\"disabled\" style=\"margin-top:2px;height:20px;line-height:20px;\"/></td>\n" + 
"      <td class=\"leftTd\"></td>\n" + 
"      <td class=\"rightTd\"></td>\n" + 
"    </tr>\n" + 
"  </table>\n" + 
"</div>\n" + 
"\n" + 
"\n" + 
"<div id=\"otherDivdk\" class=\"ItemInputDiv\" style=\"margin-left:0px;margin-top:5px;margin-bottom:15px;width:751px;\">\n" + 
"  <table id=\"otherTable\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;height:100px;\">\n" + 
"    <tr>\n" + 
"      <td class=\"leftTd\">单据编号：</td>\n" + 
"      <td class=\"rightTd\"><input id=\"txtdk_djbh\" type=\"text\" class=\"form-control col-sm-12\" value=\"\" disabled=\"disabled\" style=\"margin-top:2px;height:20px;line-height:20px;\"/></td>\n" + 
"      <td class=\"leftTd\">机构名称：</td>\n" + 
"      <td class=\"rightTd\"><input id=\"txtdk_bmmc\" type=\"text\" value=\"\" disabled=\"disabled\" style=\"margin-top:2px;height:20px;line-height:20px;\"/></td>\n" + 
"    </tr>\n" + 
"    <tr>\n" + 
"      <td class=\"leftTd\">数据来源：</td>\n" + 
"      <td class=\"rightTd\"><input id=\"txtdk_sjly\" type=\"text\" value=\"\" disabled=\"disabled\" style=\"margin-top:2px;height:20px;line-height:20px;\"/></td>\n" + 
"      <td class=\"leftTd\">开票标志：</td>\n" + 
"      <td class=\"rightTd\"><input id=\"txtdk_kpbz\" type=\"text\" value=\"\" disabled=\"disabled\" style=\"height:20px;line-height:20px;\"/></td>\n" + 
"    </tr>\n" + 
"    <tr>\n" + 
"      <td class=\"leftTd\" id='td_dk_kpfwqmc'>开票服务器名称：</td>\n" + 
"      <td class=\"rightTd\"><input id=\"txtdk_kpfwqmc\" type=\"text\" value=\"\" disabled=\"disabled\" title='' style=\"margin-top:2px;height:20px;line-height:20px;\"/></td>\n" + 
"      <td class=\"leftTd\" id='td_dk_kpdmc'>开票点名称：</td>\n" + 
"      <td class=\"rightTd\"><input id=\"txtdk_kpdmc\" type=\"text\" value=\"\" disabled=\"disabled\" title='' style=\"height:20px;line-height:20px;\"/></td>\n" + 
"    </tr>\n" + 
"    <tr>\n" + 
"      <td class=\"leftTd\">业务类别：</td>\n" + 
"      <td class=\"rightTd\"><input id=\"txtdk_ywlb\" type=\"text\" value=\"\" disabled=\"disabled\" style=\"margin-top:2px;margin-bottom:2px;height:20px;line-height:20px;\"/></td>\n" + 
"      <td class=\"leftTd\" id=\"td_hzbs\">汉字标识：</td>\n" + 
"      <td class=\"rightTd\" id=\"td_hzbs\"><input id=\"txtdk_hzbs\" type=\"text\" value=\"\" disabled=\"disabled\"/></td>\n" + 
"      <td class=\"leftTd\" id=\"txtdk_xsdjbh_title\">销售单据编号：</td>\n" + 
"      <td class=\"rightTd\"><input id=\"txtdk_xsdjbh\" type=\"text\" value=\"\" disabled=\"disabled\" style=\"margin-top:2px;margin-bottom:2px;height:20px;line-height:20px\"/></td>\n" + 
"    </tr>\n" + 
"  </table>\n" + 
"</div>\n" + 
"\n" + 
"<div id=\"otherDivsq\" class=\"ItemInputDiv\" style=\"margin-left:0px;margin-top:5px;width:751px;\">\n" + 
"  <table id=\"otherTable\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;\">\n" + 
"    <tr>\n" + 
"      <td class=\"leftTd\" id='td_sq_djbh'>申请单编号：</td>\n" + 
"      <td class=\"rightTd\">\n" + 
"        <input type=\"text\" class=\"form-control col-sm-12\" id=\"txtsq_sqdbh\" disabled=\"disabled\" style=\"margin-top:2px;height:20px;line-height:20px;\"/>\n" + 
"        <input type=\"hidden\" id=\"hidsq_id\" />\n" + 
"      </td>\n" + 
"      <td class=\"leftTd\" id='td_sq_sqjg'>申请机构：</td>\n" + 
"      <td class=\"rightTd\" style=\"padding-top:1px;\" >\n" + 
"        <input type=\"text\" id=\"txtsq_sqbmmc\" onClick=\"showBmDiv('sqbmDiv','sqbmTree','txtsq_sqbmmc','txtsq_sqbmid','','')\" readonly=\"readonly\" />\n" + 
"        <input type=\"hidden\" id=\"txtsq_sqbmid\" />\n" + 
"      </td>\n" + 
"    </tr>\n" + 
"    <tr>\n" + 
"      <td class=\"leftTd\" id='td_sq_sqrysj'>申请人：</td>\n" + 
"      <td class=\"rightTd\" style=\"padding-top:2px;\">\n" + 
"        <input type=\"text\" id=\"txtsq_sqry\" disabled=\"disabled\" />\n" + 
"        <input type=\"hidden\" id=\"txtsq_sqryid\" />\n" + 
"        <input type=\"text\" id=\"txtsq_xsdjrq\" disabled=\"disabled\" />\n" + 
"      </td>\n" + 
"      <td class=\"leftTd\">指定审核机构：</td>\n" + 
"      <td class=\"rightTd\">\n" + 
"        <input type=\"text\" id=\"txtsq_shbmmc\" onClick=\"showBmUpDiv('zdshbmDiv','zdshbmTree','txtsq_shbmmc','txtsq_shbmid','','')\" readonly=\"readonly\" />\n" + 
"        <input type=\"hidden\" id=\"txtsq_shbmid\" />\n" + 
"      </td>\n" + 
"    </tr>\n" + 
"    <tr id='tr_sq_sqrqly'>\n" + 
"      <td class=\"leftTd\">申请日期：</td>\n" + 
"      <td class=\"rightTd\"><input type=\"text\" id=\"txtsq_sqrq\" style=\"margin-top:2px;\" disabled=\"disabled\" /></td>\n" + 
"      <td class=\"leftTd\">申请理由：</td>\n" + 
"      <td class=\"rightTd\"><input type=\"text\" id=\"txtsq_sqly\" /></td>\n" + 
"    </tr>\n" + 
"    <tr>\n" + 
"      <td class=\"leftTd\" id='td_sq_zdkpfwq'>指定开票服务器：</td>\n" + 
"      <td class=\"rightTd\"><select id=\"selsq_kpfwq\" onchange=\"getKpd('selsq_kpfwq', 'selsq_kpd');\" style=\"width: 270px; height: 23px;margin-top:1px;\"></select></td>\n" + 
"      <td class=\"leftTd\" id='td_sq_zdkpd'>指定开票点：</td>\n" + 
"      <td class=\"rightTd\"><select id=\"selsq_kpd\" style=\"width: 270px; height: 23px\"></select></td>\n" + 
"    </tr>\n" + 
"	 <tr>\n" + 
"  	   <td class=\"leftTd\">业务类别：</td>\n" + 
"  	   <td class=\"rightTd\"><select id=\"selsq_ywlb\" style=\"width: 270px; height: 23px;margin-bottom:1px;\"></select></td>\n" + 
"  	   <td class=\"leftTd\" id=\"td_hzbs\">汉字标识：</td>\n" + 
"  	   <td class=\"rightTd\" id=\"td_hzbs\">\n" + 
"  	   <select id=\"selsq_hzbs\" style=\"width: 270px; height: 23px\">\n" + 
"  	   <option value=\"Y\">汇总业务</option>\n" + 
"  	   <option value=\"N\">属地业务</option>\n" + 
"  	   </select></td>\n" + 
"	 </tr>\n" + 
"  </table>\n" + 
"</div>\n" + 
"\n" + 
"\n" + 
"<div id=\"div_InvInfoOutput\" style=\"margin-left:0px;\">\n" + 
"</div>\n" + 
"\n" + 
"<div id=\"checkDiv\" style=\"margin-top: 10px;margin-left:0px;width:751px;\" class=\"ItemInputDiv\">\n" + 
"  <table id=\"checkTable\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:100%;\">\n" + 
"  <tr>\n" + 
"    <td class=\"leftTd\">审核机构：</td>\n" + 
"    <td class=\"rightTd\">\n" + 
"    <input type=\"text\" id=\"txtsh_shbmmc\" style=\"margin-top:2px;\" onClick=\"showBmUpDiv('shbmDiv','shbmTree','txtsh_shbmmc','txtsh_shbmid','','')\" readonly=\"readonly\" />\n" + 
"    <input type=\"hidden\" id=\"txtsh_shbmid\" />\n" + 
"    </td>\n" + 
"    <td class=\"leftTd\">审核日期：</td>\n" + 
"    <td class=\"rightTd\"><input type=\"text\" id=\"txtsh_shsj\" disabled=\"disabled\" /></td>\n" + 
"  </tr>\n" + 
"  <tr>\n" + 
"    <td class=\"leftTd\">审核人：</td>\n" + 
"    <td class=\"rightTd\">\n" + 
"    <input type=\"text\" id=\"txtsh_shry\"disabled=\"disabled\" />\n" + 
"    <input type=\"hidden\" id=\"txtsh_shryid\" />\n" + 
"    </td>\n" + 
"    <td class=\"leftTd\">审核意见：</td>\n" + 
"    <td class=\"rightTd\"><input type=\"text\" id=\"txtsh_shyj\" maxlength=\"100\"/></td>\n" + 
"  </tr>\n" + 
"  <tr>\n" + 
"    <td class=\"leftTd\">审核结果：</td>\n" + 
"    <td style=\"height: 25px;\">\n" + 
"    <input id=\"rad_pass\" type=\"radio\" name=\"rd_sh\" value=\"3\" title=\"通过\"\n" + 
"       style=\"width: 20px; height: 20px; margin-left: 30px;padding-top:-5px;vertical-align: bottom;\" >通过</input>\n" + 
"    <input id=\"rad_reject\" type=\"radio\" name=\"rd_sh\" value=\"2\" title=\"驳回\"\n" + 
"       style=\"width: 20px; height: 20px; margin-left: 30px;padding-top:-5px;vertical-align: bottom;\" >驳回</input>\n" + 
"    <input type=\"hidden\" id=\"txtsh_lcid\" />\n" + 
"    </td>\n" + 
"  </tr>\n" + 
"  </table>\n" + 
"</div>\n" + 
"\n" + 
"<input type=\"hidden\" id=\"negFlag\" value=\"0\" />\n" +		//负数发票标志  1为负数 0为正数
"<input type=\"hidden\" id=\"blueExist\" value=\"0\" />\n" + 	//是否存在对应蓝票
"<input type=\"hidden\" id=\"zpxe\" value=\"\" />\n" + 			//专票开票限额
"<input type=\"hidden\" id=\"ppxe\" value=\"\" />\n" + 			//普票开票限额
"<input type=\"hidden\" id=\"dylpfpdm\" value=\"\" />\n" + 		//红票对应蓝票发票代码
"<input type=\"hidden\" id=\"dylpfphm\" value=\"\" />\n" + 		//红票对应蓝票发票号码
"<input type=\"hidden\" id=\"lphjse\" value=\"0\" />\n" + 		//对应蓝票税额
"<input type=\"hidden\" id=\"lphjje\" value=\"0\" />\n" + 		//对应蓝票金额
"<input type=\"hidden\" id=\"lpslv\" value=\"0\" />\n" + 		//对应蓝票税率
"<input type=\"hidden\" id=\"lpqdbz\" value=\"0\" />\n" + 		//对应蓝票清单标志
"<input type=\"hidden\" id=\"keepBzPtVal\" value=\"\" />\n" + 	//记录备注
"<input type=\"hidden\" id=\"isHzfwQy\" value=\"0\" />\n" + 	//是否汉字防伪企业
"<input type=\"hidden\" id=\"dk_wddm\" value=\"\" />\n" + 		//网点代码

//机构框Div和机构Tree
"<div id='sqbmDiv' style='display: none; position: absolute;'>" +	//申请机构
"	<ul id='sqbmTree' class='ztree'></ul>" +
"</div>" +
"<div id='zdshbmDiv' style='display: none; position: absolute;'>" +	//指定审核机构
"	<ul id='zdshbmTree' class='ztree'></ul>" +
"</div>" +
"<div id='shbmDiv' style='display: none; position: absolute;'>" +	//审核机构
"	<ul id='shbmTree' class='ztree'></ul>" +
"</div>" +

"</div>" ;
	


	$("#" + divid).append(strDiv);
	
	var invInfoOutput = "";
	if(fpzl == "0" || fpzl == "2" || fpzl == "51")
		invInfoOutput = GetInvInfoZzsfp();
	if(fpzl == "11")
		invInfoOutput = GetInvInfoHyfp();
	if(fpzl == "12")
		invInfoOutput = GetInvInfoJdcfp();
	if(fpzl == "41")
		invInfoOutput = GetInvInfoJpfp();
	
	$("#div_InvInfoOutput").append(invInfoOutput);
	
	setHsidOnClick("hs_id", fpzl);
}


//获取增值税发票票面信息明细，所有id后添加_mx
function GetInvInfoZzsfp_mx(){
	var strDiv = 
		"<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"font-size:12px;\">\n" + 
		"  <tr id=\"tr_fp_title\">\n" + 
		"    <td colspan=\"7\" style=\"text-align: center; padding-top: 3px;\">\n" + 
		"    <font class=\"invoiceTypeTitle\"><span id=\"span_fpzl_mx\" class=\"span_fpzl\">增值税专用发票</span></font>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"  <tr id=\"tr_fp_type_mx\">\n" + 
		"    <td colspan=\"7\">\n" + 
		"    <table width=\"0\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"padding-bottom: 3px ;\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 4%\"></td>\n" + 
		"        <td style=\"width: 180px;\">发票种类：\n" + 
		"        <select id=\"fpzl_mx\" onchange='selectFpzl()' style=\"height:23px;margin-bottom:1px;\" value='0' disabled='disabled'>\n" + 
		"          <option value=\"0\" >专用发票</option>\n" + 
		"          <option value=\"2\" >普通发票</option>\n" + 
		"          <option value=\"51\">电子发票</option>\n" + 
		"          <option value=\"41\">普通发票（卷票）</option>\n" + 	
		"        </select></td>\n" + 
		"        <td style=\"width: 230px;\">发票代码：<font style=\"color: red;font-weight: bold;\" id=\"fplbdm_mx\"></font></td>\n" + 
		"        <td style=\"width: 200px; vertical-align: middle;\">开票日期：<font id=\"kprq_mx\"></font></td>\n" + 
		"        <td style=\"width: 210px; padding-right: 1%;\">发票号码：<font style=\"color: red;font-weight: bold;\" id=\"fphm_mx\"></font></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"  <tr>\n" + 
		"    <td colspan=\"7\">\n" + 
		"    <table class=\"tbShowAllBorder\" style=\"width: 751px;\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"      <tr>\n" + 
		"        <td class=\"tdPort\" rowspan=\"4\" style=\"height:85px;\">购<br>买<br>方</td>\n" + 
		"        <td style=\"text-align: center; vertical-align: middle; border-bottom: solid 0; border-right: solid 0;\">购&nbsp;方&nbsp;&nbsp;名&nbsp;称：</td>\n" + 
		"        <td style=\"border-bottom: solid 0;\"><input class=\"inputTy\" id=\"ghdwmc_mx\" disabled='disabled'/></td>\n" + 
		"        <td class=\"tdPort\" rowspan=\"4\" style=\"height:85px;\">密<br>码<br>区</td>\n" + 
		"        <td rowspan=\"4\" style=\"width: 310px; text-align: left;\" id=\"MimaQu_mx\">&nbsp;</td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"text-align: center; vertical-align: middle; border-bottom: solid 0; border-right: solid 0;\">纳税人识别号：</td>\n" + 
		"        <td style=\"border-bottom: solid 0;\"><input class=\"inputTy\" id=\"ghdwsh_mx\" maxlength=\"20\" disabled='disabled'/></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"text-align: center; vertical-align: middle; border-bottom: solid 0; border-right: solid 0;\">地址&nbsp;、&nbsp;电话：</td>\n" + 
		"        <td style=\"border-bottom: solid 0;\"><input class=\"inputTy\" id=\"ghdwdzdh_mx\" disabled='disabled'/></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"text-align: center; vertical-align: middle; border-right: solid 0;\">开户行及账号：</td>\n" + 
		"        <td><input class=\"inputTy\"  id=\"ghdwyhzh_mx\" disabled='disabled'/></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		
		"  <tr>\n" + 
		"  <td colspan=\"7\">\n" + 
		"    <table class=\"tbShowAllBorderCen\" style=\"width: 751px; background-color: #E1E9FA; text-align: center;\" width=\"0\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 22px;\"><input type=\"hidden\" id=\"checkAll_mx\" onClick=\"selAllorDesel('checkSp',this)\" />&nbsp;</td>\n" + 
		"        <td style=\"width: auto;\">货物或应税劳务、服务名称</td>\n" + 
		"        <td style=\"width: 62px;\">规格型号</td>\n" + 
		"        <td style=\"width: 39px;\">单位</td>\n" + 
		"        <td style=\"width: 60px;\">数量</td>\n" + 
		"        <td style=\"width: 100px;\" id=\"dj_title_mx\">单价（不含税）</td>\n" + 
		"        <td style=\"width: 90px;\" id=\"je_title_mx\">金额（不含税）</td>\n" + 
		"        <td style=\"width: 81px;\">税率</td>\n" + 
		"        <td style=\"width: 82px;\">税额</td>\n" + 
		"        <td style=\"width: 18px;\">&nbsp;</td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"  </td>\n" + 
		"  </tr>\n" + 
		"  <tr>\n" + 
		"    <td>\n" + 
		"      <div class=\"tblItem\" style=\"width: 751px; height: 168px; border-bottom: solid 1px;\">\n" + 
		"      <table id=\"sph_mx\" style=\"width: 749px; border-left: solid 0;\" class=\"tbShowAllBorderCen\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"        <tr id='rowId_mx_0' class=\"trA\" sequence=\"0\" beDiscounted=\"false\" title='第1行'>\n" + 
		"          <td style=\"width: 21px; padding: 0px; text-align: center;\"><input type=\"checkbox\" class=\"INPUTTXTA\" id=\"check_mx_0\" name=\"checkSp\" style='margin-left: 0px; margin-top: 2px;'/></td>\n" + 
		"          <td style=\"width: auto;word-break: break-all;\"><input id='spmc_mx_0' class=\"INPUTTXTA\" name='spmc_kp'/></td>\n" + 
		"          <td style=\"width: 62px;word-break: break-all;\"><input id='ggxh_mx_0' class=\"INPUTTXTA\" name='ggxh_kp'/></td>\n" + 
		"          <td style=\"width: 39px;word-break: break-all;\"><input id='jldw_mx_0' class=\"INPUTTXTA\" name='jldw_kp'/></td>\n" + 
		"          <td style=\"width: 60px;word-break: break-all;\"><input id='sl_mx_0' class=\"INPUTTXTA\" name='sl_kp'/></td>\n" + 
		"          <td style=\"width: 100px;word-break: break-all;\"><input id='dj_mx_0' class=\"INPUTTXTA\" name='dj_kp'/></td>\n" + 
		"          <td style=\"width: 90px;word-break: break-all;\"><input id='je_mx_0' class=\"INPUTTXTA\" name='je_kp'/></td>\n" + 
		"          <td style=\"width: 81px;text-align: center;\"><select id='slv_mx_0' name='slv_kp' style='width: 80px; height: 20px;'>" + 
		"            <option value=\"0.17\" selected=\"selected\">17%</option>" + 
		"            <option value=\"0.13\">13%</option>" + 
		"            <option value=\"0.11\">11%</option>" + 
		"            <option value=\"0.06\">6%</option>" + 
		"            <option value=\"0.05\">5%</option>" + 
		"            <option value=\"0.04\">4%</option>" + 
		"            <option value=\"0.03\">3%</option>" + 
		"            <option value=\"0.015\"></option></select></td>" + 
		"          <td style=\"width: 82px;word-break: break-all;\"><input id='se_mx_0' class=\"INPUTTXTA\" name='se_kp' disabled=\"disabled\" /></td>\n" + 
		"          <td style=\"width: 18px;\">&nbsp;</td>\n" + 
		"          <td style=\"display:none;\"><input id='spbh_mx_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='bmbbh_mx_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='flbm_mx_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='xsyh_mx_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='yhsm_mx_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='lslvbs_mx_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='cezs_mx_0'></input></td>\n" + 
		"        </tr>\n" + 
		"      </table>\n" + 
		"      </div>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		
		"  <tr>\n" + 
		"    <td colspan=\"7\">\n" + 
		"      <table class=\"tbShowAllBorderCen\" cellspacing=\"0\" cellpadding=\"0\" style=\"width: 751px;\">\n" + 
		"        <tr style=\"background-color: #E1E9FA;\">\n" + 
		"          <td style=\"width: 118px; text-align: center; vertical-align: middle; letter-spacing: 30px; padding-left:30px;\">合计</td>\n" + 
		"          <td style=\"width: 316px; text-align: left; border-right: solid 0;\">&nbsp;</td>\n" + 
		"          <td style=\"width: 39px; text-align: left; border-right: solid 0;\">&nbsp;</td>\n" + 
		"          <td style=\"width: 160px; text-align: left; border-right: solid 0;\" id=\"zje_mx\">￥0.00</td>\n" + 
		"          <td style=\"width: 117px; text-align: left;\" id=\"zse_mx\">￥0.00</td>\n" + 
		"        </tr>\n" + 
		"        <tr style=\"background-color: #E1E9FA;\">\n" + 
		"          <td style=\"width: 118px; text-align: center; vertical-align: middle;\">价税合计(大写)</td>\n" + 
		"          <td style=\"width: 316px; text-align: left; border-right: solid 0; padding-left: 10px;\" id=\"jshjdx_mx\">零圆整</td>\n" + 
		"          <td style=\"width: 39px; text-align: left; border-right: solid 0;\">(小写)</td>\n" + 
		"          <td colspan='2' style=\"width: 277px; text-align: left;\" id=\"jshj_mx\">￥0.00</td>\n" + 
		"        </tr>\n" + 
		"      </table></td>\n" + 
		"  </tr>\n" + 
		
		"  <tr>\n" + 
		"    <td>\n" + 
		"    <table class=\"tbShowAllBorderCen\" style=\"width: 751px;\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"      <tr>\n" + 
		"        <td class=\"tdPort\" rowspan=\"4\" style=\"height:85px;\">销<br>售<br>方</td>\n" + 
		"        <td style=\"text-align: center; vertical-align: middle; border-bottom: solid 0; border-right: solid 0;height:21px;\">销&nbsp;方&nbsp;&nbsp;名&nbsp;称：</td>\n" + 
		"        <td style=\"border-bottom: solid 0;height:21px;\"><input class=\"inputTy\" id=\"xhdwmc_mx\" value=''  style=\"margin-top:1px;\" disabled='disabled'></td>\n" + 
		"        <td class=\"tdPort\" rowspan=\"4\" style=\"height:85px;\">备<br><br>注</td>\n" + 
		"        <td style=\"width: 310px; text-align: left; margin: 0px; padding: 0px;\" rowspan=\"4\">\n" + 
		"        <textarea style=\"width: 310px; height: 82px; border: 0px;resize: none;\" id=\"bz_mx\" wrap='virtual' disabled='disabled'></textarea>\n" + 
		"        </td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"text-align: center;vertical-align: middle; border-bottom: solid 0; border-right: solid 0;height:21px;\">纳税人识别号：</td>\n" + 
		"        <td style=\"border-bottom: solid 0;height:21px;\"><input class=\"inputTy\" id=\"xhdwsh_mx\" value='' disabled='disabled'></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"text-align: center;vertical-align: middle; border-bottom: solid 0; border-right: solid 0;height:21px;\">地址&nbsp;、&nbsp;电话：</td>\n" + 
		"        <td style=\"border-bottom: solid 0;height:21px;\"><input class=\"inputTy\" id=\"xhdwdzdh_mx\" value='' disabled='disabled'></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"text-align: center;vertical-align: middle; border-right: solid 0;height:22px;\">开户行及账号：</td>\n" + 
		"        <td style=\"height:22px;\"><input class=\"inputTy\" id=\"xhdwyhzh_mx\" value='' disabled='disabled'></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"  <tr>\n" + 
		"    <td>\n" + 
		"    <table style=\"width: 651px;margin-top:5px;\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width:113px;\"></td>\n" + 
		"        <td style=\"text-align: right;vertical-align: middle;\">收款人：</td>\n" + 
		"        <td><input class=\"inputTy\" type=\"text\" id=\"skr_mx\" name=\"skr\" style=\"width: 80px;padding-top:0px; padding-bottom:0px;\" disabled='disabled'></td>\n" + 
		"        <td style=\"text-align: right;vertical-align: middle;\">复核人：</td>\n" + 
		"        <td><input class=\"inputTy\" type=\"text\" id=\"fhr_mx\" name=\"fhr\" style=\"width: 80px;padding-top:0px; padding-bottom:0px;\" disabled='disabled'></td>\n" + 
		"        <td style=\"text-align: right;vertical-align: middle;\">开票人：</td>\n" + 
		"        <td><input class=\"inputTy\" type=\"text\" id=\"kprtxt_mx\" name=\"kprtxt\" style=\"width: 80px;padding-top:0px; padding-bottom:0px;\" disabled='disabled'></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"</table>\n" ;
	
	return strDiv;
}


//获取增值税发票票面信息
function GetInvInfoZzsfp(){
	var strDiv = 
		"<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" >\n" + 
		"  <tr id=\"tr_fp_title\">\n" + 
		"    <td colspan=\"7\" style=\"text-align: center; padding-top: 3px;\">\n" + 
		"    <font class=\"invoiceTypeTitle\"><span id=\"span_fpzl\">增值税专用发票</span></font>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"  <tr id=\"tr_fp_type\">\n" + 
		"    <td colspan=\"7\">\n" + 
		"    <table width=\"0\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"padding-bottom: 3px ;\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 4%\"></td>\n" + 
		"        <td style=\"width: 220px;\">发票种类：\n" + 
		"        <select id=\"fpzl\" onchange='selectFpzl()' style=\"height:23px;margin-bottom:1px;\" value='0'>\n" + 
		"          <option value=\"0\" >专用发票</option>\n" + 
		"          <option value=\"2\" >普通发票</option>\n" + 
		"          <option value=\"51\">电子发票</option>\n" + 
		"		   <option value=\"41\">普通发票（卷票）</option>\n" + 
		"        </select></td>\n" + 
		"        <td style=\"width: 230px;\">发票代码：<font style=\"color: red;font-weight: bold;\" id=\"fplbdm\"></font></td>\n" + 
		"        <td style=\"width: 200px; vertical-align: middle;\">开票日期：<font id=\"kprq\"></font></td>\n" + 
		"        <td style=\"width: 210px; padding-right: 1%;\">发票号码：<font style=\"color: red;font-weight: bold;\" id=\"fphm\"></font></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"  <tr>\n" + 
		"    <td colspan=\"7\">\n" + 
		"    <table class=\"tbShowAllBorder\" style=\"width: 751px;\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"      <tr>\n" + 
		"        <td class=\"tdPort\" rowspan=\"4\" style=\"height:85px;\">购<br>买<br>方</td>\n" + 
		"        <td style=\"text-align: center; vertical-align: middle; border-bottom: solid 0; border-right: solid 0;\">购&nbsp;方&nbsp;&nbsp;名&nbsp;称：</td>\n" + 
		"        <td style=\"border-bottom: solid 0;\"><input class=\"inputTy\" id=\"ghdwmc\"  ondblclick=\"showGfglList();\" /></td>\n" + 
		"        <td class=\"tdPort\" rowspan=\"4\" style=\"height:85px;\">密<br>码<br>区</td>\n" + 
		"        <td rowspan=\"4\" style=\"width: 310px; text-align: left;\" id=\"MimaQu\">&nbsp;</td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"text-align: center; vertical-align: middle; border-bottom: solid 0; border-right: solid 0;\">纳税人识别号：</td>\n" + 
		"        <td style=\"border-bottom: solid 0;\"><input class=\"inputTy\" onclick=\"\" id=\"ghdwsh\" maxlength=\"20\" onChange=\"this.value = this.value.toUpperCase()\"/></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"text-align: center; vertical-align: middle; border-bottom: solid 0; border-right: solid 0;\">地址&nbsp;、&nbsp;电话：</td>\n" + 
		"        <td style=\"border-bottom: solid 0;\"><input class=\"inputTy\"  id=\"ghdwdzdh\" /></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"text-align: center; vertical-align: middle; border-right: solid 0;\">开户行及账号：</td>\n" + 
		"        <td><input class=\"inputTy\"  id=\"ghdwyhzh\" /></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		
		"  <tr>\n" + 
		"  <td colspan=\"7\">\n" + 
		"    <table class=\"tbShowAllBorderCen\" style=\"width: 751px; background-color: #E1E9FA; text-align: center;\" width=\"0\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 22px;\"><input type=\"hidden\" id=\"checkAll\" onClick=\"selAllorDesel('checkSp',this)\" />&nbsp;</td>\n" + 
		"        <td style=\"width: auto;\">货物或应税劳务、服务名称</td>\n" + 
		"        <td style=\"width: 62px;\">规格型号</td>\n" + 
		"        <td style=\"width: 39px;\">单位</td>\n" + 
		"        <td style=\"width: 60px;\">数量</td>\n" + 
		"        <td style=\"width: 100px;\" id=\"dj_title\">单价（不含税）</td>\n" + 
		"        <td style=\"width: 90px;\" id=\"je_title\">金额（不含税）</td>\n" + 
		"        <td style=\"width: 81px;\">税率</td>\n" + 
		"        <td style=\"width: 82px;\">税额</td>\n" + 
		"        <td style=\"width: 18px;\">&nbsp;</td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"  </td>\n" + 
		"  </tr>\n" + 
		"  <tr>\n" + 
		"    <td>\n" + 
		"      <div class=\"tblItem\" style=\"width: 751px; height: 168px; border-bottom: solid 1px;\">\n" + 
		"      <table id=\"sph\" style=\"width: 749px; border-left: solid 0;\" class=\"tbShowAllBorderCen\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"        <tr id='rowId_0' class=\"trA\" sequence=\"0\" beDiscounted=\"false\" title='第1行'>\n" + 
		"          <td style=\"width: 21px; padding: 0px; text-align: center;\"><input type=\"checkbox\" class=\"INPUTTXTA\" id=\"check_0\" name=\"checkSp\" style='margin-left: 0px; margin-top: 2px;'/></td>\n" + 
		"          <td style=\"width: auto;word-break: break-all;\"><input id='spmc_0' class=\"INPUTTXTA\" name='spmc_kp' ondblclick=\"showSpbmList(0);\" onchange=\"clearMxFlbm(0)\"/></td>\n" + 
		"          <td style=\"width: 62px;word-break: break-all;\"><input id='ggxh_0' class=\"INPUTTXTA\" name='ggxh_kp' /></td>\n" + 
		"          <td style=\"width: 39px;word-break: break-all;\"><input id='jldw_0' class=\"INPUTTXTA\" name='jldw_kp' /></td>\n" + 
		"          <td style=\"width: 60px;word-break: break-all;\"><input id='sl_0' class=\"INPUTTXTA\" name='sl_kp'  onchange=\"slJeChange(this);\" style=\"text-align: center;\"/></td>\n" + 
		"          <td style=\"width: 100px;word-break: break-all;\"><input id='dj_0' class=\"INPUTTXTA\" name='dj_kp' onchange=\"djChange(this);\" /></td>\n" + 
		"          <td style=\"width: 90px;word-break: break-all;\"><input id='je_0' class=\"INPUTTXTA\" name='je_kp' onchange=\"slJeChange(this);\" /></td>\n" + 
		"          <td style=\"width: 81px;text-align: center;\"><select id='slv_0' onchange=\"slvChange(this);\" name='slv_kp' style='width: 80px; height: 20px;'>" + 
		"            <option value=\"0.17\" selected=\"selected\">17%</option>" + 
		"            <option value=\"0.13\">13%</option>" + 
		"            <option value=\"0.11\">11%</option>" + 
		"            <option value=\"0.06\">6%</option>" + 
		"            <option value=\"0.05\">5%</option>" + 
		"            <option value=\"0.04\">4%</option>" + 
		"            <option value=\"0.03\">3%</option>" + 
		"            <option value=\"0.015\">减按1.5%计算</option></select></td>" + 
		"          <td style=\"width: 82px;word-break: break-all;\"><input id='se_0' class=\"INPUTTXTA\" name='se_kp'  onchange=\"slJeChange(this);\" disabled=\"disabled\" /></td>\n" + 
		"          <td style=\"width: 17px;\">&nbsp;</td>\n" + 
		"          <td style=\"display:none;\"><input id='spbh_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='bmbbh_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='flbm_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='xsyh_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='yhsm_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='lslvbs_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='cezs_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='slv_0_hide'></input></td>\n" + 
		"        </tr>\n" + 
		"      </table>\n" + 
		"      </div>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		
		"  <tr>\n" + 
		"    <td colspan=\"7\">\n" + 
		"      <table class=\"tbShowAllBorderCen\" cellspacing=\"0\" cellpadding=\"0\" style=\"width: 751px;\">\n" + 
		"        <tr style=\"background-color: #E1E9FA;\">\n" + 
		"          <td style=\"width: 118px; text-align: center; vertical-align: middle; letter-spacing: 30px; padding-left:30px;\">合计</td>\n" + 
		"          <td style=\"width: 316px; text-align: left; border-right: solid 0;\">&nbsp;</td>\n" + 
		"          <td style=\"width: 39px; text-align: left; border-right: solid 0;\">&nbsp;</td>\n" + 
		"          <td style=\"width: 160px; text-align: left; border-right: solid 0;\" id=\"zje\">￥0.00</td>\n" + 
		"          <td style=\"width: 117px; text-align: left;\" id=\"zse\">￥0.00</td>\n" + 
		"        </tr>\n" + 
		"        <tr style=\"background-color: #E1E9FA;\">\n" + 
		"          <td style=\"width: 118px; text-align: center; vertical-align: middle;\">价税合计(大写)</td>\n" + 
		"          <td style=\"width: 316px; text-align: left; border-right: solid 0; padding-left: 4px;\" id=\"jshjdx\">零圆整</td>\n" + 
		"          <td style=\"width: 39px; text-align: left; border-right: solid 0;\">(小写)</td>\n" + 
		"          <td colspan='2' style=\"width: 277px; text-align: left;\" id=\"jshj\">￥0.00</td>\n" + 
		"        </tr>\n" + 
		"      </table></td>\n" + 
		"  </tr>\n" + 

		"  <tr>\n" + 
		"    <td>\n" + 
		"    <table class=\"tbShowAllBorderCen\" style=\"width: 751px;\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"      <tr>\n" + 
		"        <td class=\"tdPort\" rowspan=\"4\" style=\"height:85px;\">销<br>售<br>方</td>\n" + 
		"        <td style=\"text-align: center; vertical-align: middle; border-bottom: solid 0; border-right: solid 0;height:21px;\">销&nbsp;方&nbsp;&nbsp;名&nbsp;称：</td>\n" + 
		"        <td style=\"border-bottom: solid 0;height:21px;\"><input class=\"inputTy\" id=\"xhdwmc\" value=''  style=\"margin-top:1px;\"></td>\n" + 
		"        <td class=\"tdPort\" rowspan=\"4\" style=\"height:85px;\">备<br><br>注</td>\n" + 
		"        <td style=\"width: 310px; text-align: left; margin: 0px; padding: 0px;\" rowspan=\"4\">\n" + 
		"        <textarea style=\"width: 310px; height: 82px; border: 0px;resize: none;\" id=\"bz\" wrap='virtual' ></textarea>\n" + 
		"        </td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"text-align: center;vertical-align: middle; border-bottom: solid 0; border-right: solid 0;height:21px;\">纳税人识别号：</td>\n" + 
		"        <td style=\"border-bottom: solid 0;height:21px;\"><input class=\"inputTy\" id=\"xhdwsh\" value=''></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"text-align: center;vertical-align: middle; border-bottom: solid 0; border-right: solid 0;height:21px;\">地址&nbsp;、&nbsp;电话：</td>\n" + 
		"        <td style=\"border-bottom: solid 0;height:21px;\"><input class=\"inputTy\" id=\"xhdwdzdh\" value='' ></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"text-align: center;vertical-align: middle; border-right: solid 0;height:22px;\">开户行及账号：</td>\n" + 
		"        <td style=\"height:22px;\"><input class=\"inputTy\" id=\"xhdwyhzh\" value='' ></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"  <tr>\n" + 
		"    <td>\n" + 
		"    <table style=\"width: 651px;margin-top:5px;\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width:113px;\"></td>\n" + 
		"        <td style=\"text-align: right;vertical-align: middle;\">收款人：</td>\n" + 
		"        <td><input class=\"inputTy\" type=\"text\" id=\"skr\" name=\"skr\" style=\"width: 80px;padding-top:0px; padding-bottom:0px;\"></td>\n" + 
		"        <td style=\"text-align: right;vertical-align: middle;\">复核人：</td>\n" + 
		"        <td><input class=\"inputTy\" type=\"text\" id=\"fhr\" name=\"fhr\" style=\"width: 80px;padding-top:0px; padding-bottom:0px;\"></td>\n" + 
		"        <td style=\"text-align: right;vertical-align: middle;\">开票人：</td>\n" + 
		"        <td><input class=\"inputTy\" type=\"text\" id=\"kprtxt\" name=\"kprtxt\" style=\"width: 80px;padding-top:0px; padding-bottom:0px;\"></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"</table>\n" ;
	
	return strDiv;
}

//获取货运发票票面信息
function GetInvInfoHyfp(){
	var strDiv = 
		"<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" >\n" + 
		"  <tr id=\"tr_fp_title\" style=\"height: 30px;\">\n" + 
		"    <td colspan=\"7\" style=\"text-align: center; padding-top: 3px;\">\n" + 
		"    <font class=\"invoiceTypeTitle\"><span id=\"span_fpzl\">货物运输业增值税专用发票</span></font>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"  <tr id=\"tr_fp_type\">\n" + 
		"    <td colspan=\"7\">\n" + 
		"    <table width=\"0\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"padding-bottom: 3px ;\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 4%\"><input id='fpzl' value='11' style=\"display:none\"/></td>\n" + 
		"        <td style=\"width: 230px;\">发票代码：<font style=\"color: red;font-weight: bold;\" id=\"fplbdm\"></font></td>\n" + 
		"        <td style=\"width: 200px; vertical-align: middle;\">开票日期：<font id=\"kprq\"></font></td>\n" + 
		"        <td style=\"width: 210px; padding-right: 1%;\">发票号码：<font style=\"color: red;font-weight: bold;\" id=\"fphm\"></font></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 

		"  <tr>\n" + 
		"    <td colspan=\"7\">\n" + 
		"    <table class=\"tbShowAllBorder\" style=\"width: 751px;\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 85px; text-align: center; vertical-align: middle; background-color: #E1E9FA; border-bottom: solid 0;\">承运人及</td>\n" + 
		"        <td style=\"width: 285px; border-bottom: solid 0;\"><input class=\"inputTy\" id=\"xhdwmc\"  /></td>\n" + 
		"        <td class=\"tdPort\" rowspan=\"4\" style=\"letter-spacing: 20px;\">密码区</td>\n" + 
		"        <td rowspan=\"4\" style=\"width: 352px; text-align: left;\">&nbsp;</td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 85px; text-align: center; vertical-align: middle; background-color: #E1E9FA;\">纳税人识别号</td>\n" + 		
		"        <td style=\"width: 285px;\"><input class=\"inputTy\" id=\"xhdwsh\" /></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 85px; text-align: center; vertical-align: middle; background-color: #E1E9FA; border-bottom: solid 0;\">实际受票方及</td>\n" + 
		"        <td style=\"width: 285px; border-bottom: solid 0;\"><input class=\"inputTy\" id=\"infoClientName\"  ondblclick=\"Refer.showSfhrRefer('CzDiv',this,{infoClientName:'mc',infoClientTaxCode:'sh'});\" /></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 85px; text-align: center; vertical-align: middle; background-color: #E1E9FA;\">纳税人识别号</td>\n" + 
		"        <td style=\"width: 285px;\"><input class=\"inputTy\" onclick=\"\" id=\"infoClientTaxCode\" /></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 

		"  <tr>\n" + 
		"    <td colspan=\"7\">\n" + 
		"    <table class=\"tbShowAllBorderCen\" style=\"width: 751px;\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 85px; text-align: center; vertical-align: middle; background-color: #E1E9FA; border-bottom: solid 0;\">收货人及</td>\n" + 
		"        <td style=\"width: 283px; border-bottom: solid 0;\"><input class=\"inputTy\" onclick=\"\" id=\"consignerName\" ondblclick=\"Refer.showSfhrRefer('CzDiv',this,{consignerName:'mc',consignerTaxCode:'sh'});\"/></td>\n" + 
		"        <td style=\"width: 85px; text-align: center; vertical-align: middle; background-color: #E1E9FA; border-bottom: solid 0;\">发货人及</td>\n" + 
		"        <td style=\"width: 290px; border-bottom: solid 0;\"><input class=\"inputTy\" onclick=\"\" id=\"shipperName\" ondblclick=\"Refer.showSfhrRefer('CzDiv',this,{shipperName:'mc',shipperTaxCode:'sh'});\"/></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 85px; text-align: center; vertical-align: middle; background-color: #E1E9FA;\">纳税人识别号</td>\n" + 
		"        <td style=\"width: 283px;\"><input class=\"inputTy\" onclick=\"\" id=\"consignerTaxCode\" /></td>\n" + 
		"        <td style=\"width: 85px; text-align: center; vertical-align: middle; background-color: #E1E9FA;\">纳税人识别号</td>\n" + 
		"        <td style=\"width: 283px;\"><input class=\"inputTy\" onclick=\"\" id=\"shipperTaxCode\" /></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 85px; text-align: center; vertical-align: middle; background-color: #E1E9FA;\">起运地、经由、到达地</td>\n" + 
		"        <td style=\"width: 650px;\" colspan=\"3\"><input class=\"inputTy\" style=\"width: 647px;\" id=\"originViaArrivalPlace\" /></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 

		"  <tr>\n" + 
		"    <td>\n" + 
		"    <table class=\"tbShowAllBorderCen\" cellspacing=\"0\" cellpadding=\"0\" style=\"width: 751px; height: 143px;\">\n" + 
		"      <tr>\n" + 
		"        <td class=\"tdPort\" rowspan=\"4\" style=\"letter-spacing: 8px;\">费用项目及金额</td>\n" + 
		"        <td style=\"width: 441px; vertical-align: top;\">" + 
		"    	 	<table id=\"sphid\" class=\"tblHead\" style=\"width: 441px;\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"      		<tr>\n" + 
		"        	<td style=\"width: 20px; border-left: 0px;\"><input type=\"hidden\" id=\"checkAll\" onClick=\"selAllorDesel('checkSp',this)\" />&nbsp;</td>\n" + 
		"        	<td style=\"width: 260px;\">费用项目</td>\n" + 
		"        	<td style=\"width: 135px;\" id=\"je_title\">金额（不含税）</td>\n" + 
		"        	<td style=\"width: 18px; border-right: solid 0;\">&nbsp;</td>\n" + 
		"      		</tr>\n" + 
		"    		</table>\n" + 
		"      		<div class=\"tblItem\" style=\"width: 441px; height: 125px; border-left: 0px; border-right: 0px;\">\n" + 
		"      		<table id=\"sph\" style=\"width: 441px;\" class=\"tblBody\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"        	<tr class='trA' sequence=\"0\" beDiscounted=\"false\">\n" + 
		"          		<td style=\"width: 20px; padding: 0px; text-align: center; border-left:0px;\"><input class='INPUTTXTA' type=\"checkbox\" id=\"check_0\" name=\"checkSp\" style='margin-left: -2px;' /></td>\n" + 
		"          		<td style=\"width: 260px; word-break: break-all;\"><input id='listGoodsName_0' class='INPUTTXTA' name='spmc_kp'  ondblclick=\"Refer.showFyxmRefer('CzDiv',this,{listGoodsName_0:'fymc'});\" /></td>\n" + 
		"          		<td style=\"width: 135px; word-break: break-all;\"><input id='listAmount_0' class='INPUTTXTA' name='je_kp' onchange=\"slJeChange(this);\"  /><input id='listTax_0' type=\"hidden\"/></td>\n" + 
		"          		<td style=\"width: 18px; border-right: solid 0;\">&nbsp;</td>\n" + 
		"        	</tr>\n" + 
		"      		</table>\n" + 
		"      		</div>\n" + 
		"		 </td>\n" + 
		"        <td class=\"tdPort\" rowspan=\"4\">运输货物信息</td>\n" + 
		"        <td style=\"width: 255px; height: 143px; text-align: center; margin: 0px; padding: 0px;\" colspan=\"2\" rowspan=\"4\">\n" + 
		"        <textarea style=\"width: 255px; height: 143px; border: 0px;\" id=\"infoListName\" wrap='virtual' ></textarea>\n" + 
		"        </td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 

		"  <tr>\n" + 
		"    <td colspan=\"7\">\n" + 
		"      <table class=\"tbShowAllBorderCen\" cellspacing=\"0\" cellpadding=\"0\" style=\"width: 751px; height: 125px;\">\n" + 
		"        <tr style=\"background-color: #E1E9FA; height: 25px;\">\n" + 
		"          <td style=\"width: 90px; text-align: center; vertical-align: middle;\">合计金额</td>\n" + 
		"          <td style=\"width: 130px; text-align: left; padding-left:5px;\" id=\"zje\">￥0.00</td>\n" + 
		"          <td style=\"width: 55px; text-align: center;\">税率 </td>\n" + 
		"          <td style=\"width: 55px; text-align: center;\">\n" +
		"		     <input id=\"befortaxRate\" value=\"0.11\" style=\"display:none\" />"+
		"            <select id='infoTaxRate' onchange=\"Hypchangeslv();\" style=\"width: 52px;\" >\n" + 
		"              <option value=\"0.11\" selected=\"selected\">11%</option>\n" + 
	//	"              <option value=\"0.03\">3%</option>\n" + 
		"            </select></td>\n" + 
		"          <td style=\"width: 40px; text-align: center;\">税额</td>\n" + 
		"          <td style=\"width: 25px; border-right: solid 0;\">&nbsp;</td>\n" + 
		"          <td style=\"width: 110px; text-align: left;\" id=\"zse\">￥0.00</td>\n" + 
		"          <td style=\"width: 60px; text-align: center;\">机器编号</td>\n" + 
		"          <td style=\"width: 170px; text-align: left; padding-left:5px;\"><label id=\"macNo\"></label>&nbsp;</td>\n" + 
		"        </tr>\n" + 
		"        <tr style=\"background-color: #E1E9FA; height: 25px;\">\n" + 
		"          <td style=\"width: 90px; text-align: center; vertical-align: middle;\">价税合计(大写)</td>\n" + 
		"          <td colspan=\"6\" style=\"width: 400px; text-align: left; border-right: solid 0; padding-left:5px;\" id=\"jshjdx\">零圆整</td>\n" + 
		"          <td style=\"width: 60px; text-align: center; border-right: solid 0;\">(小写)</td>\n" + 
		"          <td style=\"width: 170px; text-align: left;\" id=\"jshj\">￥0.00</td>\n" + 
		"        </tr>\n" + 
		"        <tr>\n" + 
		"          <td style=\"background-color: #E1E9FA; width: 90px; text-align: center; vertical-align: middle;\">车种车号</td>\n" + 
		"          <td style=\"width: 130px; text-align: left;\" id=\"zje\"><input style=\"width: 120px;\" class=\"inputTy\" onclick=\"\" id=\"vehicleKindNo\" /></td>\n" + 
		"          <td style=\"background-color: #E1E9FA; width: 60px; text-align: center;\">车船吨位</td>\n" + 
		"          <td colspan=\"2\" style=\"width: 70px; text-align: left;\" id=\"machineNo\"><input style=\"width: 80px;\" class=\"inputTy\" onclick=\"\" id=\"vehicleTonnage\" /></td>\n" + 
		"          <td class=\"tdPort\" rowspan=\"3\" style=\"letter-spacing: 20px;\">备注</td>\n" + 
		"          <td colspan=\"4\" rowspan=\"3\" style=\"text-align: left;\">" +
		"        	<textarea style=\"width: 340px; height: 70px; border: 0px;\" id=\"infoNotes\" wrap='virtual' ></textarea>\n" + 
		"		   </td>\n" + 
		"        </tr>\n" + 
		"        <tr>\n" + 
		"          <td style=\"background-color: #E1E9FA; width: 90px; text-align: center; vertical-align: middle; border-bottom: solid 0;\">主管税务机关</td>\n" + 
		"          <td colspan=\"4\" style=\"width: 220px; text-align: left;  border-bottom: solid 0; padding-left:5px;\"><label id=\"TaxJGName\"></label>&nbsp;</td>\n" + 
		"        </tr>\n" + 
		"        <tr>\n" + 
		"          <td style=\"background-color: #E1E9FA; width: 90px; text-align: center; vertical-align: middle;\">及代码</td>\n" + 
		"          <td colspan=\"4\" style=\"width: 220px; text-align: left; padding-left:5px;\"><label id=\"TaxJGNo\"></label>&nbsp;</td>\n" + 
		"        </tr>\n" + 
		"      </table>\n" + 
		"	 </td>\n" + 
		"  </tr>\n" + 

		"  <tr>\n" + 
		"    <td>\n" + 
		"    <table style=\"width: 751px;\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"text-align: right;vertical-align: middle;\">收款人：</td>\n" + 
		"        <td><input class=\"inputTy\" type=\"text\" id=\"infoCashier\" name=\"infoCashier\" style=\"width: 80px;\" /></td>\n" + 
		"        <td style=\"text-align: right;vertical-align: middle;\">复核人：</td>\n" + 
		"        <td><input class=\"inputTy\" type=\"text\" id=\"infoChecker\" name=\"infoChecker\" style=\"width: 80px;\" /></td>\n" + 
		"        <td style=\"text-align: right;vertical-align: middle;\">开票人：</td>\n" + 
		"        <td><input class=\"inputTy\" type=\"text\" id=\"kprtxt\" name=\"infoInvoicer\" style=\"width: 80px;\" /></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"</table>\n" ;

	return strDiv;
}

/**
 * 获取机动车发票票面信息
 * @author homy
 */
function GetInvInfoJdcfp(){
	var strDiv = 
		"<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" >" + 
		"  <tr id=\"tr_fp_title\" style=\"height: 30px;\">" + 
		"    <td colspan=\"7\" style=\"text-align: center; padding-top: 3px;\">" + 
		"    <font class=\"invoiceTypeTitle\"><span id=\"span_fpzl\">机动车销售统一发票</span></font>" + 
		"    </td>" + 
		"  </tr>" + 
		"  <tr id=\"tr_fp_type\">" + 
		"    <td colspan=\"7\">" + 
		"    <table width=\"0\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"padding-bottom: 3px ;\">" + 
		"      <tr>\n" + 
		"        <td style=\"width: 4%\"><input id='fpzl' value='12' style=\"display:none\"/></td>\n" + 
		"        <td style=\"width: 230px;\">发票代码：<font style=\"color: red;font-weight: bold;\" id=\"fplbdm\"></font></td>" + 
		"        <td style=\"width: 200px; vertical-align: middle;\">开票日期：<font id=\"kprq\"></font></td>" + 
		"        <td style=\"width: 210px; padding-right: 1%;\">发票号码：<font style=\"color: red;font-weight: bold;\" id=\"fphm\"></font></td>" + 
		"      </tr>" + 
		"    </table>" + 
		"    </td>" + 
		"  </tr>" + 
		
		
		"  <tr>" + 
		"    <td>" + 
		"    <table class=\"tbShowAllBorderCen\" style=\"width: 751px;\" cellspacing=\"0\" cellpadding=\"0\">" + 
		
		"      <tr >" + //此tr行不可删，界定表格各列宽度之用。高度为0，可作为顶部直线用，加些img只是占位，让td框显示
		"        <td style=\"width: 85px; height: 0px;\"><img style=\"width: 0px; height: 0px\"/></td>" + 
		"        <td style=\"width:109px; height: 0px;\"><img style=\"width: 0px; height: 0px\"/></td>" + 
		"        <td style=\"width: 79px; height: 0px;\"><img style=\"width: 0px; height: 0px\"/></td>" + 
		"        <td style=\"width: 69px; height: 0px;\"><img style=\"width: 0px; height: 0px\"/></td>" + 
		"        <td style=\"width: 24px; height: 0px;\"><img style=\"width: 0px; height: 0px\"/></td>" + 
		"        <td style=\"width: 79px; height: 0px;\"><img style=\"width: 0px; height: 0px\"/></td>" + 
		"        <td style=\"width: 79px; height: 0px;\"><img style=\"width: 0px; height: 0px\"/></td>" + 
		"        <td style=\"width: 39px; height: 0px;\"><img style=\"width: 0px; height: 0px\"/></td>" + 
		"        <td style=\"width: 20px; height: 0px;\"><img style=\"width: 0px; height: 0px\"/></td>" + 
		"        <td style=\"width: 39px; height: 0px;\"><img style=\"width: 0px; height: 0px\"/></td>" + 
		"        <td style=\"width: 59px; height: 0px;\"><img style=\"width: 0px; height: 0px\"/></td>" + 
		"        <td style=\"width: 55px; height: 0px;\"><img style=\"width: 0px; height: 0px\"/></td>" + 
		"      </tr>" + //85+110+80+70+25+80+80+40+20+40+60+55 = 745
		
		"      <tr style=\"height: 30px;\">" + 
		"        <td style=\"text-align: center;  vertical-align: bottom; padding-bottom:5px; background-color: #E1E9FA; border-bottom: solid 0; letter-spacing: 5px;\">机打代码</td>" + 
		"        <td colspan=\"3\" style=\"border-bottom: solid 0; vertical-align: bottom; padding-bottom:6px; padding-left:5px;\"><label id=\"jdc_jddm\"></label>&nbsp;</td>" + 
		"        <td class=\"tdPort\" rowspan=\"3\" >税控码</td>" + 
		"        <td colspan=\"7\" rowspan=\"3\" >&nbsp;</td>" + 
		"      </tr>" + 
		"      <tr style=\"height: 20px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; background-color: #E1E9FA; border-bottom: solid 0; letter-spacing: 5px;\">机打号码</td>" + 	
		"        <td colspan=\"3\" style=\"border-bottom: solid 0; padding-left:5px;\"><label id=\"jdc_jdhm\"></label>&nbsp;</td>" + 
		"      </tr>" + 
		"      <tr style=\"height: 30px;\">" + 
		"        <td style=\"text-align: center; vertical-align: top; padding-top:5px; background-color: #E1E9FA; letter-spacing: 5px;\">机器编号</td>" + 
		"        <td colspan=\"3\" style=\"vertical-align: top; padding-top:6px; padding-left:5px;\"><label id=\"macNo\"></label>&nbsp;</td>" + 
		"      </tr>" + 
		
		"      <tr style=\"height: 17px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; background-color: #E1E9FA; border-bottom: solid 0;\">购买方名称及</td>\n" + 
		"        <td colspan=\"4\" rowspan=\"3\" style=\"width: 285px;\">" + 
		"          <input id=\"jdc_gfmc\" class=\"inputTy\" ondblclick=\"Refer.showGhdwRefer('CzDiv',this,{jdc_gfmc:'mc', jdc_gmfnsrsbh:'sh', jdc_gmfzzjgdm:'zzjgdm'});\"/>" + 
		"          <input id=\"jdc_gmfzzjgdm\" class=\"inputTy\" ondblclick=\"Refer.showGhdwRefer('CzDiv',this,{jdc_gfmc:'mc', jdc_gmfnsrsbh:'sh', jdc_gmfzzjgdm:'zzjgdm'});\"/>" + 
		"        </td>\n" + //必须设置宽度，以防两框同一行
		"        <td colspan=\"2\" rowspan=\"3\" style=\"text-align: center; background-color: #E1E9FA; letter-spacing: 1px;\">纳税人识别号</td>\n" + 
		"        <td colspan=\"5\" rowspan=\"3\" ><input id=\"jdc_gmfnsrsbh\" class=\"inputTy\" style=\"width: 206px;\" ondblclick=\"Refer.showGhdwRefer('CzDiv',this,{jdc_gfmc:'mc', jdc_gmfnsrsbh:'sh', jdc_gmfzzjgdm:'zzjgdm'});\"/></td>\n" + 
		"      </tr>" + 
		"      <tr style=\"height: 16px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; background-color: #E1E9FA; border-bottom: solid 0;\">身份证号码/<font color=\"red\">*</font></td>\n" + 
		"      </tr>" + 
		"      <tr style=\"height: 17px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; background-color: #E1E9FA;\">组织机构代码</td>\n" + 
		"      </tr>" + 
		
		"      <tr style=\"height: 30px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; background-color: #E1E9FA;letter-spacing: 4px;\">车辆类型<font color=\"red\">*</font></td>\n" + 
		"        <td colspan=\"2\" ><input id=\"jdc_cllx\" class=\"inputTy\" style=\"width: 178px;\" ondblclick=\"Refer.showClbmRefer('CzDiv',this,{jdc_cllx:'clxh', jdc_cpxh:'csxh', jdc_cd:'cd'});\"/></td>\n" + 
		"        <td style=\"text-align: center; background-color: #E1E9FA; letter-spacing: 1px;\">厂牌型号<font color=\"red\">*</font></td>\n" + 
		"        <td colspan=\"5\" ><input id=\"jdc_cpxh\" class=\"inputTy\" style=\"width: 235px;\"/></td>\n" + 
		"        <td style=\"text-align: center; background-color: #E1E9FA; letter-spacing: 1px;\">产地<font color=\"red\">*</font></td>\n" + 
		"        <td colspan=\"2\" ><input id=\"jdc_cd\" class=\"inputTy\" style=\"width: 104px;\"/></td>\n" + 
		"      </tr>" + 
		
		"      <tr style=\"height: 30px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; background-color: #E1E9FA;letter-spacing: 8px;\">合格证号</td>" + 
		"        <td colspan=\"2\" ><input id=\"jdc_hgzh\" class=\"inputTy\" style=\"width: 178px;\"/></td>" + 
		"        <td colspan=\"2\" style=\"text-align: center; background-color: #E1E9FA; letter-spacing: 1px;\">进口证明书号</td>" + 
		"        <td colspan=\"3\" ><input id=\"jdc_jkzmsh\" class=\"inputTy\" style=\"width: 189px;\"/></td>" + 
		"        <td colspan=\"2\" style=\"text-align: center; background-color: #E1E9FA; letter-spacing: 1px;\">商检单号</td>" + 
		"        <td colspan=\"2\" ><input id=\"jdc_sjdh\" class=\"inputTy\" style=\"width: 104px;\"/></td>" + 
		"      </tr>" + 
		
		"      <tr style=\"height: 30px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; background-color: #E1E9FA;letter-spacing: 3px;\">发动机号码</td>" + 
		"        <td colspan=\"4\" ><input id=\"jdc_fdjhm\" class=\"inputTy\" style=\"width: 275px\";/></td>" + 
		"        <td colspan=\"2\" style=\"text-align: center; background-color: #E1E9FA; letter-spacing: 1px;\">车辆识别代号/车架号码<font color=\"red\">*</font></td>" + 
		"        <td colspan=\"5\" ><input id=\"jdc_clsbdh\" class=\"inputTy\" style=\"width: 206px;\"/></td>" + 
		"      </tr>" + 
		
		"      <tr style=\"height: 30px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; background-color: #E1E9FA;letter-spacing: 8px;\">价税合计</td>" + 
		"        <td colspan=\"7\" style=\"border-right: solid 0; padding-left:5px;\"  id=\"jdc_jshj\">零圆整</td>" + 
		"        <td colspan=\"2\" style=\"text-align: center; border-right: solid 0; letter-spacing: 5px;\">小写<font color=\"red\">*</font></td>" + 
		"        <td colspan=\"2\" ><input id=\"jdc_jshjxx\" class=\"inputTy\" style=\"width: 104px;\" onchange=\"JdcpJshjxxChange(this);\" value=\"0.00\"></td>" + 
		"      </tr>" + 
		
		"      <tr style=\"height: 30px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; background-color: #E1E9FA;letter-spacing: 0px;\">销货单位名称</td>" + 
		"        <td colspan=\"6\" id=\"jdc_xhdwmc\"><input class=\"inputTy\" id=\"xhdwmc\" style=\"width: 431px;\"/></td>" + 
		"        <td style=\"text-align: center; background-color: #E1E9FA; \">电话</td>" + 
		"        <td colspan=\"4\" ><input id=\"jdc_xhdwdh\" class=\"inputTy\" style=\"width: 166px;\"/></td>" + 
		"      </tr>" + 
		
		"      <tr style=\"height: 30px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; background-color: #E1E9FA;letter-spacing: 0px;\">纳税人识别号</td>" + 
		"        <td colspan=\"6\" id=\"jdc_xhdwnsrsbh\"><input class=\"inputTy\" id=\"xhdwsh\" style=\"width: 431px;\"/></td>" + 
		"        <td style=\"text-align: center; background-color: #E1E9FA; \">账号</td>" + 
		"        <td colspan=\"4\" ><input id=\"jdc_xhdwzh\" class=\"inputTy\" style=\"width: 166px;\"/></td>" + 
		"      </tr>" + 
		
		"      <tr style=\"height: 30px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; background-color: #E1E9FA;letter-spacing: 49px;\">地址</td>" + 
		"        <td colspan=\"5\" ><input id=\"jdc_xhdwdz\" class=\"inputTy\" style=\"width: 354px;\"/></td>" + 
		"        <td style=\"text-align: center; background-color: #E1E9FA; letter-spacing: 4px;\">开户银行</td>" + 
		"        <td colspan=\"5\" ><input id=\"jdc_xhdwkhyh\" class=\"inputTy\" style=\"width: 206px;\"/></td>" + 
		"      </tr>" + 
		
		"      <tr style=\"height: 20px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; border-bottom: solid 0; background-color: #E1E9FA;letter-spacing: 3px;\">增值税税率</td>" + 
		"        <td style=\"text-align: center;\" rowspan=\"2\">" + 
		"          <select id=\"jdc_zzssl\" style=\"width: 103px;\" onchange=\"JdcpZzsslChange(this);\">\n" + 
		"            <option value=\"0.17\" selected=\"selected\">17%</option>\n" + 
		"            <option value=\"0.13\">13%</option>\n" + 
		"            <option value=\"0.06\">6%</option>\n" + 
		"            <option value=\"0.04\">4%</option>\n" + 
		"            <option value=\"0.03\">3%</option>\n" + 
		"			 <option value=\"0\">免税</option>\n" +
		"          </select></td>\n" + 
		"        </td>" + 
		"        <td style=\"text-align: center; border-bottom: solid 0; background-color: #E1E9FA; letter-spacing: 1px;\">增值税</td>" + 
		"        <td colspan=\"3\" style=\"padding-left:5px;\" rowspan=\"2\" id=\"jdc_zzsse\">￥0.00&nbsp;</td>" + 
		"        <td style=\"text-align: center; border-bottom: solid 0; background-color: #E1E9FA; letter-spacing: 4px;\">主管税务</td>" + 
		"        <td colspan=\"5\" style=\"border-bottom: solid 0; padding-left:5px;\"><label id=\"TaxJGName\"></label>&nbsp;</td>" + 
		"      </tr>" + 
		"      <tr style=\"height: 20px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; background-color: #E1E9FA;letter-spacing: 8px;\">或征收率</td>" + 
		"        <td style=\"text-align: center; background-color: #E1E9FA; letter-spacing: 13px;\">税额</td>" + 
		"        <td style=\"text-align: center; background-color: #E1E9FA; letter-spacing: 0px;\">机关及代码</td>" + 
		"        <td colspan=\"5\" style=\"padding-left:5px;\"><label id=\"TaxJGNo\"></label>&nbsp;</td>" + 
		"      </tr>" + 
		
		"      <tr style=\"height: 30px;\">" + 
		"        <td style=\"text-align: center; vertical-align: middle; background-color: #E1E9FA;letter-spacing: 8px;\">不含税价</td>" + 
		"        <td colspan=\"2\" style=\"padding-left:5px;\" id=\"jdc_bhsj\">小写 ￥0.00</td>" + 
		"        <td colspan=\"2\" style=\"text-align: center; background-color: #E1E9FA;\">完税凭证号码</td>" + 
		"        <td colspan=\"2\" style=\"padding-left:5px;\"><label id=\"jdc_wspzhm\"></label>&nbsp;</td>" + 
		"        <td style=\"text-align: center; background-color: #E1E9FA; letter-spacing: 1px;\">吨位</td>" + 
		"        <td colspan=\"2\" ><input id=\"jdc_dw\" class=\"inputTy\" style=\"width: 50px;\"/></td>" + 
		"        <td style=\"text-align: center; background-color: #E1E9FA; letter-spacing: 1px;\">限乘人数</td>" + 
		"        <td ><input id=\"jdc_xcrs\" class=\"inputTy\" style=\"width: 44px;\"/></td>" + 
		"      </tr>" + 
		
		
		"    </table>" + 
		"    </td>" + 
		"  </tr>" + 
		
		
		"  <tr>" + 
		"    <td>" + 
		"    <table style=\"width: 751px;\" cellspacing=\"0\" cellpadding=\"0\">" + 
		"      <tr>" + 
		"        <td style=\"width: 85px; height: 35px; text-align: center; vertical-align: middle;\">销货单位盖章</td>" + 
		"        <td style=\"width: 190px;\"></td>" + 
		"        <td style=\"width: 95px; text-align: center;\">开票人</td>" + 
		"        <td style=\"width: 200px; padding-left:5px;\" id=\"jdc_kpr\"><input class=\"inputTy\" id=\"kprtxt\" name=\"kprtxt\" style=\"width: 140px;\"></td>" + 
		"        <td style=\"width: 60px; text-align: center; \">备注：</td>" + 
		"        <td style=\"width: 110px; \" id=\"jdc_bz\">一车一票<textarea style=\"display:'none';\" id=\"bz\" wrap='virtual' ></textarea></td>" + 
		"      </tr>" + 
		"      <tr>" + 
		"        <td style=\"width: 85px; height: 20px; text-align: center; vertical-align: middle;\">生产企业名称</td>" + 
		"        <td colspan=\"5\" style=\"\"><input id=\"jdc_scqymc\" class=\"inputTy\" style=\"width: 650px;\"/></td>" + 
		"      </tr>" + 
		"    </table>" + 
		"    </td>" + 
		"  </tr>" + 
		
		
		
		"</table>\n" ;
	
	return strDiv;
}

/**
 * 获取卷票发票票面信息
 * @author 金涛
 */
function GetInvInfoJpfp(){
	var strDiv = 
		"<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" >\n" + 
		"  <tr id=\"tr_fp_title\">\n" + 
		"    <td colspan=\"7\" style=\"text-align: center; padding-top: 3px;\">\n" + 
		"    <font class=\"invoiceTypeTitle\"><span id=\"span_fpzl\">增值税普通发票（卷票）</span></font>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"  <tr id=\"tr_fp_type\">\n" + 
		"    <td colspan=\"7\">\n" + 
		"    <table width=\"0\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"padding-bottom: 3px ;\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 4%\"></td>\n" + 
		"        <td style=\"width: 220px;\">发票种类：\n" + 
		"        <select id=\"fpzl\" onchange='selectFpzl()' style=\"height:23px;margin-bottom:1px;\" value='0'>\n" + 
		"          <option value=\"0\" >专用发票</option>\n" + 
		"          <option value=\"2\" >普通发票</option>\n" + 
		"          <option value=\"51\">电子发票</option>\n" + 
		"		   <option value=\"41\">普通发票（卷票）</option>\n" + 
		"        </select></td>\n" +
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"  <tr>\n" + 
		"    <td colspan=\"7\">\n" + 
		"    <table class=\"tbShowAllBorder\" style=\"width: 751px;\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 230px;\">&nbsp;&nbsp;发票代码：<font style=\"color: red;font-weight: bold;\" id=\"fplbdm\"></font></td>\n" + 
		
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 230px;\">&nbsp;&nbsp;发票号码：<font style=\"color: red;font-weight: bold;\" id=\"fphm\"></font></td>\n" + 	
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 230px;\">&nbsp;&nbsp;机器编号：<font style=\"font-weight: bold;\" id=\"jqbhjp\"></font></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 230px;\">&nbsp;&nbsp;销售方名称：<font style=\"font-weight: bold;\" id=\"xfmcjp\"></font></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" +
		"        <td style=\"width: 230px;\">&nbsp;&nbsp;销售方税号：<font style=\"font-weight: bold;\" id=\"xfshjp\"></font></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 230px;\">&nbsp;&nbsp;开票日期：<font style=\"font-weight: bold;\" id=\"kprq\"></font></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 230px;\">&nbsp;&nbsp;收款员：<font style=\"font-weight: bold;\" id=\"sky\"></font></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"  <tr>\n" + 
		"    <td colspan=\"7\">\n" + 
		"    <table class=\"tbShowAllBorder\" style=\"width: 751px;\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 330px;\" \"border-bottom: solid 1; border-right: solid 1;\">&nbsp;&nbsp;购方名称：</td>\n" + 
		"        <td style=\"border-bottom: solid 1;\"><input class=\"inputTy\" id=\"ghdwmc\"  ondblclick=\"showGfglList();\" /></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\" border-bottom: solid 1; border-right: solid 1;\">&nbsp;&nbsp;纳税人识别号：</td>\n" + 
		"        <td style=\"border-bottom: solid 1;\"><input class=\"inputTy\" onclick=\"\" id=\"ghdwsh\" maxlength=\"20\" onChange=\"this.value = this.value.toUpperCase()\"/></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" +
		"  <tr>\n" + 
		"  <td colspan=\"7\">\n" + 
		"    <table class=\"tbShowAllBorderCen\" style=\"width: 751px; background-color: #E1E9FA; text-align: center;\" width=\"0\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 21px;\"><input type=\"hidden\" id=\"checkAll\" onClick=\"selAllorDesel('checkSp',this)\" />&nbsp;</td>\n" + 
		"        <td style=\"width: auto;\">项目</td>\n" + 
		"        <td style=\"width: 150px;\">数量</td>\n" + 
		"        <td style=\"width: 150px;\" id=\"dj_title\">含税单价</td>\n" + 
		"        <td style=\"width: 150px;\" id=\"je_title\">含税金额</td>\n" + 
		"        <td style=\"width: 18px;\">&nbsp;</td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"  </td>\n" + 
		"  </tr>\n" + 
		"  <tr>\n" + 
		"    <td>\n" + 
		"      <div class=\"tblItem\" style=\"width: 751px; height: 168px; border-bottom: solid 1px;\">\n" + 
		"      <table id=\"sph\" style=\"width: 749px; border-left: solid 0;\" class=\"tbShowAllBorderCen\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"        <tr id='rowId_0' class=\"trA\" sequence=\"0\" beDiscounted=\"false\" title='第1行'>\n" + 
		"          <td style=\"width: 21px; padding: 0px; text-align: center;\"><input type=\"checkbox\" class=\"INPUTTXTA\" id=\"check_0\" name=\"checkSp\" style='margin-left: 0px; margin-top: 2px;'/></td>\n" + 
		"          <td style=\"width: auto;word-break: break-all;\"><input id='spmc_0' class=\"INPUTTXTA\" name='spmc_kp' ondblclick=\"showSpbmList(0);\" onchange=\"clearMxFlbm(0)\"/></td>\n" + 
		"          <td style=\"width: 150px;word-break: break-all;\"><input id='sl_0' class=\"INPUTTXTA\" name='sl_kp'  onchange=\"slJeChange(this);\" style=\"text-align: right;\"/></td>\n" + 
		"          <td style=\"width: 150px;word-break: break-all;\"><input id='dj_0' class=\"INPUTTXTA\" name='dj_kp' onchange=\"djChange(this);\" style=\"text-align: right;\" /></td>\n" + 
		"          <td style=\"width: 150px;word-break: break-all;\"><input id='je_0' class=\"INPUTTXTA\" name='je_kp' onchange=\"slJeChange(this);\" style=\"text-align: right;\"/></td>\n" +
		"          <td style=\" display:none; \"><input id='se_0'  name='se_kp' value='0' /></td>\n" +
		"          <td style=\" display:none; \"><input id='slv_0'  name='slv_kp' value='10.02' /></td>\n" +
		"          <td style=\"width: 18px;\">&nbsp;</td>\n" + 
		"          <td style=\"display:none;\"><input id='spbh_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='bmbbh_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='flbm_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='xsyh_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='yhsm_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='lslvbs_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='cezs_0'></input></td>\n" + 
		"          <td style=\"display:none;\"><input id='slv_0_hide'></input></td>\n" + 
		"        </tr>\n" + 
		"      </table>\n" + 
		"      </div>\n" + 
		"    </td>\n" + 
		"  </tr>\n" +
		"  <tr>\n" + 
		"    <td colspan=\"7\">\n" + 
		"    <table class=\"tbShowAllBorder\" style=\"width: 751px;\" cellspacing=\"0\" cellpadding=\"0\">\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 230px;\">合计金额（小写）：<font style=\"font-weight: bold;\" id=\"jshj\">￥0.00</font></td>\n" + 
		"      </tr>\n" + 
		"      <tr>\n" + 
		"        <td style=\"width: 230px;\">合计金额（大写）：<font style=\"font-weight: bold;\" id=\"jshjdx\">零圆整</font></td>\n" + 
		"      </tr>\n" + 
		"    </table>\n" + 
		"    </td>\n" + 
		"  </tr>\n" + 
		"</table>\n" ;
	return strDiv;
}

//查看发票明细清单 输出DIV内容
function showDivInvQdInfo(divid){
	var includeTax = $('#hs_id_mx').is(':checked');
	var djTitle = includeTax ? "单价（含税）" : "单价（不含税）";
	var jeTitle = includeTax ? "金额（含税）" : "金额（不含税）";
	
	var strDiv = 

//"<div class=\"divMsgBoxTitleBar\">\n" +
//"<span class=\"divMsgBoxIcon\" style=\"background-image:url(" + Propath + "images/detailIcon.png)\"></span>\n" + 
//"<span class=\"divMsgBoxTitle\">查看销货清单</span>\n" + 
//"<span class=\"divCloseIcon\" onClick=\"closeDivEmptyFilter('" + divid + "','invQd',true)\"></span>\n" + 
//"</div>\n" + 
//"\n" + 
"<div  style=\"overflow-x:hidden;overflow-y:hidden;\" style=\"font-size:12px;\">\n" + 
"  <div  class=\"gridTitleA\">\n" + 
"    <table cellpadding=\"0\" cellspacing=\"0\"  border=\"0\"  >\n" + 
"      <tr>\n" + 
"      <td  nowrap=\"nowrap\" style=\"width:35px;\">序号</td>\n" + 
"      <td  nowrap=\"nowrap\" style=\"width:160px;\">商品名称</td>\n" + 
"      <td  nowrap=\"nowrap\" style=\"width:90px;\">规格型号</td>\n" + 
"      <td  nowrap=\"nowrap\" style=\"width:65px;\">单位</td>\n" + 
"      <td  nowrap=\"nowrap\" style=\"width:150px;\">数量</td>\n" + 
"      <td  nowrap=\"nowrap\" style=\"width:150px;\">" + djTitle + "</td>\n" + 
"      <td  nowrap=\"nowrap\" style=\"width:150px;\">" + jeTitle + "</td>\n" + 
"      <td  nowrap=\"nowrap\" style=\"width:40px;\">税率</td>\n" + 
"      <td  nowrap=\"nowrap\" style=\"width:150px;\">税额</td>\n" + 
"      <td  nowrap=\"nowrap\" >&nbsp;&nbsp;</td>\n" + 
"      </tr>\n" + 
"    </table>\n" + 
"  </div>\n" + 
"\n" + 
"  <div id=\"div_SaleDetail\" style=\"overflow-y:scroll;overflow-x:hidden;width:auto;height: 251px;\">\n" + 
"  </div>\n" + 
"</div>";
	
	$("#" + divid).append(strDiv);
}


/**
 * 解决数值类型科学计数法问题
 * @param {val}
 */
function dokxjsf(val){
	if(val == null)
		return "";
	
	var valStr = val.toString();
	valStr = valStr.replace('E', 'e');
 	if(valStr.indexOf('e') != -1){
		var len = valStr.length;
		var arr1 = valStr.split('e');
		var left = arr1[0];
		var arrLeft = left.split('.');
		var leftws = 0;
		if(arrLeft.length >1){
			leftws= arrLeft[1].length;
		}
		var jingdu = leftws-parseInt(arr1[1])<0 ? 0 : leftws-parseInt(arr1[1]);//精度为正
		//val = val.toFixed(leftws+jingdu);//已替换为后一句的方法实现
		val = new BigDecimal(valStr).setScale(jingdu, BigDecimal.prototype.ROUND_HALF_UP).toString();
		return val;
	}else{
		return val;
	}
}


/**
 * 初始化购方销方命名名称
 */
function initgfxf(){
	var gfsh = "购方税号";
	var gfmc = "购方名称";
	var xfsh = "销方税号";
	var xfmc = "销方名称";

	$("[id=gfsh_list]").html(gfsh);
	$("[id=gfmc_list]").html(gfmc);
	$("[id=xfsh_list]").html(xfsh);
	$("[id=xfmc_list]").html(xfmc);

//	$("[id=gfsh_con]").css("font-size","11px");
//	$("[id=gfmc_con]").css("font-size","11px");
//	$("[id=xfsh_con]").css("font-size","11px");
//	$("[id=xfmc_con]").css("font-size","11px");

	$("[id=gfsh_con]").html(gfsh + "：");
	$("[id=gfmc_con]").html(gfmc + "：");
	$("[id=xfsh_con]").html(xfsh + "：");
	$("[id=xfmc_con]").html(xfmc + "：");
}

/**
 * 初始化开票方式及是否汉字防伪开票显示方式 kpfs: 1 单机版; 0 服务器版    hzfw : 0 否; 1 是
 */
function initKpfsHzfw(kpfs, hzfw){
	if(kpfs == "1"){
		$("#td_sq_zdkpfwq").html("指定单机开票点：");
		$("#td_sq_zdkpd").html("开票机号：");
		$("#td_dk_kpfwqmc").html("单机开票点名称：");
		$("#td_dk_kpdmc").html("开票机号：");
		
		$("#selsq_kpd").attr("disabled","disabled");
	}
	if(kpfs == "0"){
		$("#td_sq_zdkpfwq").html("指定开票服务器：");
		$("#td_sq_zdkpd").html("指定开票点：");
		$("#td_dk_kpfwqmc").html("开票服务器名称：");
		$("#td_dk_kpdmc").html("开票点名称：");
	}
	
	var fpzl = $('#fpzl').find("option:selected").val();
	if(hzfw == "1" && fpzl == "0"){
		$("#list_id").css('opacity', 0.5);
		$("#list_id").attr('disabled', 'disabled');
		$("#list_id").removeAttr('checked');
	}
	if(hzfw == "1" && fpzl == "2"){
		$("#list_id").css('opacity', 1);
		$("#list_id").removeAttr('disabled');
	}
}

/**
 * 根据显示项的名称显示title属性
 */
function showItemTitle(obj){
	$(obj).attr("title", $(obj).val());
}

//商品行名称改变后，清除相关的分类编码信息，后续如有需要可根据新名称从后台重新查询相关分类编码信息
function clearMxFlbm(i){
	
	if($("#flbm_" + i).val() == "")
		return;
	
	$("#bmbbh_" + i).val("");//编码版本号
	$("#flbm_" + i).val("");//税收分类编码
	$("#xsyh_" + i).val("");//是否享受税收优惠政策 0：不享受，1：享受
	$("#yhsm_" + i).val("");//享受税收优惠政策内容
	$("#lslvbs_" + i).val("");//零税率标识，空：非零税率，0：出口退税，1：免税，2：不征税，3: 普通零税率
	$("#spbh_" + i).val("");//企业自编码 ，该字段可为空
	$("#slv0_" + i).html("0%");//免税税率显示为默认的0%
	
	$.jqalert("商品名称已改变，该明细行分类编码信息已清空！");
}

//购方名称自动填充
function addAutoComplete(){
	$("#ghdwsh").autocomplete({
		//souce:指定来源
		source:function(request,response){
				$.post("../../common/findXfxxListMH.action",
				{
					nsrsbh:$("#ghdwsh").val()
				},
				function(data){
					response($.map(data,function(item){
						return {
							label:item.nsrsbh+"_"+item.nsrmc,
							value:item.nsrsbh
						}
					}));
					
				},"json");
		},
		//选中的时候
		select:function(event,ui){
			var temp = ui.item.label;
			var index = temp.indexOf("_");
			$("#ghdwmc").val(temp.substring(index+1));
		},
		minLength:1,
		autoFocus:false,
		delay:100
	});
}


//解决ie9、ie10、ie11下双击含税复选框导致计算出错的bug
function setHsidOnClick(hsid, fpzl){
	var version = browserVersion;
	if(version == "IE9" || version == "IE1"){//截取3位，IE1包含了IE10和IE11
		$("#" + hsid).removeAttr("onclick");
		if(hsid == "hs_id")
			$("#" + hsid).attr("onchange", "jezh('sph',this.checked,''," + fpzl + ");");
		else
			$("#" + hsid).attr("onchange", "jezh('sph_mx',this.checked,''," + fpzl + ",'_mx')");
	}
}


/**
 * 获取浏览器类型和版本号
 * @return String 例如IE10
 */
function getBrowserVersion(){
	var userAgent = navigator.userAgent.toLowerCase();
	
	if(userAgent.match(/msie ([\d.]+)/)!=null){//ie6--ie9
		
		uaMatch = userAgent.match(/msie ([\d.]+)/);
		return 'IE'+uaMatch[1];
	}
	else if(userAgent.match(/(trident)\/([\w.]+)/)){
		
		uaMatch = userAgent.match(/trident\/([\w.]+)/);
		switch (uaMatch[1]){
			case "4.0": return "IE8" ;break;
			case "5.0": return "IE9" ;break;
			case "6.0": return "IE10";break;
			case "7.0": return "IE11";break;
			default:return "undefined";
		}
	}
	
	return "notIE";
}

$(document).ready(function(){
	browserVersion = getBrowserVersion().substring(0, 3);
});


//时间赋值，取当月起止日期 
function setRqqRqz(rqq, rqz){
	
	var now = new Date();
	var year = now.getFullYear();		//年
	var month = now.getMonth() + 1;     //月
	var day = now.getDate();            //日
	
	$("#" + rqq).val("" + year + (month < 10 ? "-0" + month : "-" + month) + "-01");
	$("#" + rqz).val("" + year + (month < 10 ? "-0" + month : "-" + month) + (day < 10 ? "-0" + day : "-" + day));
}


function openXxfpDialog(divid, title){
	
	var addHeight = (ShowDivType == "kpsh" || ShowDivType == "kpshv" || ShowDivType == "ckpsh" || ShowDivType == "ckpshv" || ShowDivType == "fpht") ? 86 : 0;
	var fpHeight = 685 + addHeight;
	
	$("#content").css("height", 613 + addHeight);
	
	$("#divDkFpInfo").dialog({
		title : title,
		width : 785,
		height : fpHeight,
		position: [ ($(window).width() - 785) / 2 , ($(window).height() - fpHeight) / 2 ],
		modal : true,
		autoOpen : false,
		resizable : false,
		open:function(event, ui){//转移默认选中焦点
			$("#tr_fp_title").focus();
			$("#bgFilter").height(fpHeight > $(window).height() ? fpHeight : $(window).height());//修复因为票面将winodw撑大后，遮罩层无法完全盖住的bug
	    },
		close : function() {
			$(this).dialog("close");
		}
	}).dialog( "open" );
}


function openYkfpDialog(title){
	
	$("#divInvInfoXxfp").dialog({
		title : title,
		width : 785,
		height : 555,
		position: [ ($(window).width() - 783) / 2 , ($(window).height() - 555) / 2],
		modal : true,
		autoOpen : false,
		resizable : false,
		open:function(event, ui){//转移默认选中焦点
	        $("#tr_fp_title").focus();
	    },
		close : function() {
			$(this).dialog("close");
			$("#divInvInfoXxfp").empty();
		}
	}).dialog( "open" );
	
}


function openYkfpQdDialog(title, qdRows){
	
	var winHeight = $(window).height();
	var addRows = qdRows > 10 ? (qdRows - 10) : 0;
	var maxAddRows = parseInt((winHeight - 330) / 25);
	
	if(addRows > maxAddRows)
		addRows = maxAddRows;
	
	var dialogHeight = 330 + addRows * 25;
	
	$("#div_SaleDetail").height($("#div_SaleDetail").height() + addRows * 25);
	
	$("#divInvQdInfoXxfp").dialog({
		title : title,
		width : 1040,
		height : dialogHeight,
		position: [ ($(window).width() - 1040) / 2, (winHeight - dialogHeight) / 2 ],
		modal : true,
		autoOpen : false,
		resizable : false,
		open:function(event, ui){//转移默认选中焦点
	        //$("#tr_fp_title").focus();
	    },
		close : function() {
			$(this).dialog("close");
			$("#divInvQdInfoXxfp").empty();
		}
	}).dialog( "open" );
	
}



function openCezsDialog(){
	
	if($("#slv_0").val() == "0.015"){
		$.jqalert("特殊税率商品明细不能开具差额税发票！");
		return;
	}
	
	if($("#cezs_0").val() != ""){
		$.jqconfirm("已添加扣除额，是否清除？", "", 
			function ok(data){
				var cezs = $("#negFlag").val() == 1 ? ("差额征税。") : ("差额征税：" + parseFloat($("#cezs_0").val()).toFixed(2) + "。") ;
				var bz = $.trim($("#bz").val());
				$("#bz").val(bz.replace(cezs, ""));
				
				$("#cezs_0").val("");
				$("#cezs_img").removeClass("fa-times-circle");
				$("#cezs_img").addClass("fa-times");
				
				$("#list_id").removeAttr("disabled");
				
				calLine(document.getElementById('je_0'));
			}
		);
	}
	else
		showCezsDialog();
}


function showCezsDialog(){
	var table_id = document.getElementById('sph');// 获取表格id
	if(table_id.rows.length != 1){
		$.jqalert("清单发票或者明细行超过两行不能转化成差额税发票！");
		return;
	}
	
	$("#divCezs").dialog({
		title : "输入扣除额",
		width : 460,
		height : 230,
		position: [ ($(window).width() - 430) / 2 ,($(window).height() - 270) / 2],
		modal : true,
		autoOpen : false,
		resizable : false,
		open:function(event, ui){//转移默认选中焦点
			$("#discount_discountRate").focus();
	    },
		close : function() {
	    	$("#cezs_kce").val("");
			$(this).dialog("close");
		},
		buttons:{
			"确定" : function(){
				var kce = $.trim($("#cezs_kce").val());
				if(!/^\d+\.?\d{0,2}$/.test(kce)){
					$.jqalert("输入信息格式有误！");
					return;
				}
				var bz = $.trim($("#bz").val());
				while(true){
					var cezs = bz.match(/差额征税：.*?。/);//.*表示0或多个任意字符，后面的?表示非贪婪匹配，匹配到第一个。即可
					if(cezs == null)
						break;
					bz = bz.replace(cezs[0], "");
				}
				
				if($("#negFlag").val() == 1){//负数发票标志
					kce = -kce;
					$("#bz").val("差额征税。" + bz);
				}
				else
					$("#bz").val("差额征税：" + parseFloat(kce).toFixed(2) + "。\n" + bz);
				
				$("#sl_0").val("");
				$("#je_0").val("");
				$("#se_0").val("");
				$("#cezs_0").val(kce);
				$("#cezs_img").removeClass("fa-times");
				$("#cezs_img").addClass("fa-times-circle");
				$(this).dialog("close");
				
				$("#list_id").attr("checked", false);
				$("#list_id").attr("disabled", "disabled");
			},
			"取消" : function(){
		    	$("#cezs_kce").val("");
				$(this).dialog("close");
			}
		}
	}).dialog( "open" );
}

function fuzhi(){
	$("#txtsq_sqrq").val(getNowDate("rq"));
	$("#txtsq_sqry").val($("#user_czrymc").val());
	$("#txtsq_sqryid").val($("#user_yhid").val());
	
	$("#xhdwsh").val($("#user_nsrsbh").val());
	$("#xhdwmc").val($("#user_nsrmc").val());
	$("#kprtxt").val($("#user_czrymc").val());
	$("#xhdwdzdh").val($("#user_xfdzdh").val());
	$("#xhdwyhzh").val($("#user_xfyhzh").val());
	
	
	$("#dkfpxx_xfkpfs").val(window.top["GlobalYh"].kpfs);					//销方开票方式 0 服务器版开票; 1 单机版开票;
	$("#isHzfwQy").val($("#user_isHzfwQy").val());							//销方是否汉字防伪企业  0 否; 1 是;
	initKpfsHzfw(window.top["GlobalYh"].kpfs, window.top["GlobalYh"].hzfw);	//初始化根据销方开票方式确定开票服务器及开票点信息展示
	
	initCezs_kceInputType();//初始化差额征税输入框只能输入两位小数的功能
}
function Jpfuzhi(){
	$("#xfmcjp").html($("#user_nsrmc").val());
	$("#xfshjp").html($("#user_nsrsbh").val());
	$("#sky").html($("#user_czrymc").val());
}