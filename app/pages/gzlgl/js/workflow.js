function graphTrace(options) {
    var _defaults = {
        srcEle: this,
        pid: $(this).attr('pid'),
	    pdid: $(this).attr('pdid')
    };
    var opts = $.extend(true, _defaults, options);

/*    // 处理使用js跟踪当前节点坐标错乱问题
    $('#changeImg').on('click', function() {
        $('#workflowTraceDialog').dialog('close');
        if ($('#imgDialog').length > 0) {
            $('#imgDialog').remove();
        }
        $('<div/>', {
            'id': 'imgDialog',
            title: '此对话框显示的图片是由引擎自动生成的，并用红色标记当前的节点<button id="diagram-viewer">Diagram-Viewer</button>',
            html: "<img src=/VATServer/gzlgl/task/process.action' "+ opts.pid +" ' />"
        }).appendTo('body').dialog({
            modal: true,
            resizable: false,
            dragable: false,
            width: document.documentElement.clientWidth * 0.95,
            height: document.documentElement.clientHeight * 0.95
        });
    });*/

	/*
	用官方开发的Diagram-Viewer跟踪
	 */
/*	$('#diagram-viewer').on('click', function() {
		$('#workflowTraceDialog').dialog('close');
		if ($('#imgDialog').length > 0) {
			$('#imgDialog').remove();
		}

		var url =  '/diagram-viewer/index.html?processDefinitionId=' + opts.pdid + '&processInstanceId=' + opts.pid;

		$('<div/>', {
			'id': 'imgDialog',
			title: '此对话框显示的图片是由引擎自动生成的，并用红色标记当前的节点',
			html: '<iframe src="' + url + '" width="100%" height="' + document.documentElement.clientHeight * 0.90 + '" />'
		}).appendTo('body').dialog({
			modal: true,
			resizable: false,
			dragable: false,
			width: document.documentElement.clientWidth * 0.95,
			height: document.documentElement.clientHeight * 0.95
		});
	});
*/
    // 获取图片资源
    var imageUrl =  "gzlgl/task/resource/process-instance.action?pid=" + opts.pid + "&type=image";
    $.getJSON('gzlgl/task/traceProcess.action?pid=' + opts.pid, function(infos) {

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
			shade: [0.6, '#393D49'],
			shadeClose: false,
	        maxmin: true,
	        resize: true,//是否允许拉伸
	        content: $('#workflowTraceDialog'),
	        cancel: function(){ //右上角关闭按钮
		    	$("#workflowTraceDialog").remove();    	
		    },
		    zIndex: 666, //控制层叠顺序
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
      /*  // 打开对话框
        $('#workflowTraceDialog').dialog({-i
            modal: true,
            resizable: false,
            dragable: false,
            open: function() {
                $('#workflowTraceDialog').css('padding', '0.2em');
                $('#workflowTraceDialog .ui-accordion-content').css('padding', '0.2em').height($('#workflowTraceDialog').height() - 195);

                // 此处用于显示每个节点的信息，如果不需要可以删除
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
                    position: {
                        at: 'bottom left',
                        adjust: {
                            x: 3
                        }
                    }
                });
                // end qtip
            },
            close: function() {
                $('#workflowTraceDialog').remove();
            },
            width: document.documentElement.clientWidth * 0.95,
            height: document.documentElement.clientHeight * 0.95
        });*/

    });
}

/**
 * jQuery类添加扩展方法
 * 获取元素的outerHTML
 */
$.fn.outerHTML = function() {
    // IE, Chrome & Safari will comply with the non-standard outerHTML, all others (FF) will have a fall-back for cloning
    return (!this.length) ? this : (this[0].outerHTML ||
    (function(el) {
        var div = document.createElement('div');
        div.appendChild(el.cloneNode(true));
        var contents = div.innerHTML;
        div = null;
        return contents;
    })(this[0]));
};