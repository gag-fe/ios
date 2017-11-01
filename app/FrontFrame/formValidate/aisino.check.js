//初始化表单校验
function initAisinoCheck(formID){	
	$("#"+formID).validate({
		//只校验 不提交
		//debug:true,
		ignore : ":hidden",
		errorPlacement : function(error, element) { 
		   error.appendTo(element.parent());
           $(error).addClass('aisinoCheckError').wrap('<div></div>');
		},
		errorElement : "em",
		onfocusout : function(element){ $(element).valid(); }
	});
	
	//初始化常用的规则
	addAisinoCheck();
}

//校验一个form
function checkAisinoForm(formID){
	var rtnFlag = false;
	layui.use('layer',function(){
		var layer = layui.layer,	
			message = "校验异常！\n [html规范或aisinoCheck配置可能有误]...\n 错误信息: ";
			try{
				rtnFlag = $("#"+formID).valid();
			}catch(e){
				 layer.alert(message+e, {
					icon: 0,
					skin: 'layer-ext-moon' //该皮肤由layer.seaning.com友情扩展。
				 });
			//alert(message+e);
			return false;
			}
	});
	 
	 //处理异常(window.aisinoErrorFlag 这个全局变量在jquery.validate.js中)
	 /*
	 if(window.aisinoErrorFlag == false){
	 	alert(message+e);
	 	return false;
	 }
	 */
	 
	 return rtnFlag;
}

//清空formID下aisinoError的提示
function clearAisinoError(formID){
	//简单的隐藏界面信息
	//$("#"+formID+" div[class=aisinoError]").remove();
	
	//真实的resetForm
	$("#"+formID).validate().resetForm();
}

//自定义正则
//如果需要直接使用message_cn.js中定义的变量。将addMethod第三个参数设置为null
function addAisinoCheck(){
	/*判断当前控件的值是否满足邮政编码格式*/
	jQuery.validator.addMethod("code", function(value, element) {
		var tel = /^[0-9]{6}$/;
		return this.optional(element) || (tel.test(value));
	},"邮政编码格式错误");
	
	/*判断当前控件的值是否满足ip格式*/
	jQuery.validator.addMethod("ip", function(value, element) { 
		var ip = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/; 
		return this.optional(element) || (ip.test(value) && (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256)); 
	},"IP地址格式错误");
	
	/*判断当前控件的值是否满足域名格式*/
	jQuery.validator.addMethod("domain", function(value, element) { 
		var domain = /^([a-zA-Z\d][a-zA-Z\d-_]+\.)+[a-zA-Z\d-_][^ ]*$/;
		return this.optional(element) || (domain.test(value)); 
	},"域名格式错误");
	
	/*判断当前控件的值是否满足ip或域名格式*/
	jQuery.validator.addMethod("ipordomain", function(value, element) { 
		var ip = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/; 
		var domain = /^([a-zA-Z\d][a-zA-Z\d-_]+\.)+[a-zA-Z\d-_][^ ]*$/;
		return this.optional(element) || (ip.test(value) && (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256)) || (domain.test(value)); 
	},"ip或域名格式错误");
	
	/*当前控件的长度固定param位*/
	jQuery.validator.addMethod("length", function(value,element,param) { 
		return this.optional(element) || value.length==param;
	},jQuery.validator.format("长度固定{0}位"));
	
	/*当前控件的数字值要大于param[0]的值 需要两个input都使用number:true 且在前,以避免字符串转数字失败*/
	jQuery.validator.addMethod("gt", function(value,element,param) { 
		return this.optional(element) || value > parseFloat($("#"+param[0]).val());
	},jQuery.validator.format("必须大于{1}的值"));
	
	/*表示这个控件是靠另一个控件自动填充过来的 param为上个控件的说明值 用来提示
		return this.optional(element) || value.length == 0
		不能这样用，这样返回的false被当成了字符串，所以才采用下面的?号表达式
	*/
	jQuery.validator.addMethod("refer", function(value,element,param) {
		return this.optional(element) || value.length == 0?false:true;
	},jQuery.validator.format("请从{0}选择自动填充"));
	
	jQuery.validator.addMethod("number16_2", function(value,element) {
		
		var number16_2 = /^(?!0+(?:\.0+)?$)\d{1,16}(?:\.\d{1,2})?$/;
		return this.optional(element) || number16_2.test(value);
	},"精度为16位(包括2位小数)");
	
	jQuery.validator.addMethod("tax_rate", function(value,element) {
		var tax_rate = /^1$|^0(\.\d{1,6})?$/;
		return this.optional(element) || tax_rate.test(value);
	},"数值应在0到1之间(小数位最多6)");
}