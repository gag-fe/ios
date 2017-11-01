/**
 * 登录初始化及相关方法
 */
require('./config.js');
$(document).ready(function(){
	
	initButton();
	
});

function initButton(){
	
	$("#login").click(function(){
		var username = $.trim($("#input_username").val());
		var password = $.trim($("#input_password").val());
		
		$.ajax({
			url : window.BASE_API_URL+"login/login.do",
			data : {
				"userId" : username,
				"password" : password
			},
			type : "post",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
			dataType : "json",
			success : function(data) {
				if(data.status != "S"){
                    alert(data.msg);
				}

				else
					window.location.href = "index.html";
			}
		});
		
	});
}
