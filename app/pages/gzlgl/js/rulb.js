var colMap ={
		colNames : ['任务ID','流程实例ID','流程定义ID','当前节点','是否挂起'],
		colModel : [
		    {name:'id',index:'id', width:'20%',align:'center',sortable:false},
		    {name:'processInstanceId',index:'processInstanceId', width:'20%',align:'center',sortable:false},
		    {name:'processDefinitionId',index:'processDefinitionId', width:'30%',align:'center',sortable:false},
            {name:'name',index:'name', width:'30%',align:'center',sortable:false,formatter:click},
            {name:'suspended',index:'suspended', width:'30%',align:'center',sortable:false}
        ]};

$(document).ready(function()
		{
	
		layui.use(['layer'],function(){
			var layer = layui.layer;
		});
	
	/*	initButton();
			initAisinoCheck("checkForm");//初始化这个form的校验
		*/	//initAutoComplete();
			//需要放在ready中定义，因为用到了dom pager
			window.defaultGridConfig = {  
					url :"../../gzlgl/task/running.action",
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
//				        var ids = $('#gridtable').getDataIDs();                
//						for(var i=0;i<ids.length;i++)
//						{
//			            }	          
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

function click(cellvalue, options, rowObject){
	
	var id=rowObject.processInstanceId;
	return '<a href ="#0"  class="trace" ' + 
	 'onClick="flowView(\''+id+'\');"' +
	 '>'+ rowObject.name+'</a>';
}
function flowView(id){
	  var imageUrl =  "../../gzlgl/task/resource/process-instance.action?pid=" + id + "&type=image";
	    $.getJSON('../../gzlgl/task/traceProcess.action?pid='+id, function(infos) {

	        var positionHtml = "";

	        // 生成图片
	        var varsArray = new Array();
	        $.each(infos, function(i, v) {
	            var $positionDiv = $('<div/>', {
	                'class': 'activity-attr'
	            }).css({
	                position: 'absolute',
	                left: (v.x - 1),
	                top: (v.y - 1),
	                width: (v.width ),
	                height: (v.height ),
	                backgroundColor: 'black',
	                opacity: 0,
	                zIndex: $.fn.qtip.zindex - 1
	            });

	            // 节点边框
	            var $border = $('<div/>', {
	                'class': 'activity-attr-border'
	            }).css({
	                position: 'absolute',
	                left: (v.x - 1),
	                top: (v.y - 1),
	                width: (v.width +1),
	                height: (v.height +1),
	                zIndex: $.fn.qtip.zindex - 2
	            });

	            if (v.currentActiviti) {
	                $border.addClass('ui-corner-all-12').css({
	                    border: '3px solid red'
	                });
	            }
	            positionHtml += $positionDiv.outerHTML() + $border.outerHTML();
	            varsArray[varsArray.length] = v.vars;
	        });

	        if ($('#workflowTraceDialog').length == 0) {
	            $('<div/>', {
	                id: 'workflowTraceDialog',
	                title:'流程跟踪图',
	                html: "<div><img src='" + imageUrl + "' style='position:absolute; left:0px; top:0px;' />" +
	                "<div id='processImageBorder'>" +
	                positionHtml +
	                "</div>" +
	                "</div>"
	            }).appendTo('body');
	        } else {
	            $('#workflowTraceDialog img').attr('src', imageUrl);
	            $('#workflowTraceDialog #processImageBorder').html(positionHtml);
	        }

	        // 设置每个节点的data
	        $('#workflowTraceDialog .activity-attr').each(function(i, v) {
	        	$(this).data('vars', varsArray[i]);
	        });

			layer.open({
				type:1,
				title: "<big>流程图</big>",
				skin: 'layui-layer-rim',
				area: ['900px','600px'],
				shade: 0,
				shadeClose: true,
		        maxmin: true,
		        resize: true,//是否允许拉伸
		        content: $('#workflowTraceDialog'),
		        cancel: function(index){ //右上角关闭按钮
			    	$("#workflowTraceDialog").remove();
			    	$(".layui-layer-content").remove();
			    	$(".layui-layer").remove();
			    	},
			    zIndex: 999, //控制层叠顺序
			    success: function(layero,index){//弹层成功回调方法
			    	layer.setTop(layero); //置顶当前窗口
			    }
			});

			$('.activity-attr').qtip({
	            content: function() {
	                var vars = $(this).data('vars');
	                var tipContent = "<table class='table table-striped table-hover'>";
	                $.each(vars, function(varKey, varValue) {
	                    if (varValue) {
	                        tipContent += "<tr><td class=''>" + varKey + "</td><td>" + varValue + "<td/></tr>";
	                    }
	                });
	                tipContent += "</table>";
	                return tipContent;
	            },
	            show: 'mouseover',
	            hide: 'mouseout',
	            zIndex: 99999,
	            position: {
	                at: 'bottom left',
	                adjust: {
	                    x: 3
	                }
	            }
	        });
	    });
	}

