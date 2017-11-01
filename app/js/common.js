/**
 * 公用js文件
 */
/**
 * ACE jQgrid 加载底部栏图标s
 */
window.GAG.ios.common.updatePagerIcons = function updatePagerIcons(table){
	var replacement = {
		'ui-icon-seek-first' : 'ace-icon fa fa-angle-double-left bigger-140',
		'ui-icon-seek-prev' : 'ace-icon fa fa-angle-left bigger-140',
		'ui-icon-seek-next' : 'ace-icon fa fa-angle-right bigger-140',
		'ui-icon-seek-end' : 'ace-icon fa fa-angle-double-right bigger-140'
	};
	$('.ui-pg-table:not(.navtable) > tbody > tr > .ui-pg-button > .ui-icon').each(function(){
		var icon = $(this);
		var $class = $.trim(icon.attr('class').replace('ui-icon', ''));		
		if($class in replacement) icon.attr('class', 'ui-icon '+replacement[$class]);
	});
};
/**
 * 关闭当前显示的页面，跳回第一页签
 */
window.GAG.ios.common.closeCurrentPage = function closeCurrentPage(){
	window.parent.$("#menuTabs span.active").click();	
};
/**
 * 窗口缩放事件绑定,调整jqgrid自适应窗口大小
 */
window.GAG.ios.common.resizeJqGrid = function (gridTableId){
	var This = this;
	window.onresize = function doResize(){
		var ps = This.pageSize();
		$("#"+ gridTableId).jqGrid('setGridWidth', ps.winWidths - 25).jqGrid('setGridHeight', ps.winHeights - 180);
	}
};
window.GAG.ios.common.pageSize = function (){
	var winWidth, winHeight; 
	if(window.innerHeight){// all except IE 
		winWidth = window.innerWidth; 
		winHeight = window.innerHeight; 
	}else if(document.documentElement && document.documentElement.clientHeight) {// IE 6 Strict Mode
		winWidth = document.documentElement.clientWidth; 
		winHeight = document.documentElement.clientHeight; 
	}else if(document.body){ // other 
		winWidth = document.body.clientWidth; 
		winHeight = document.body.clientHeight; 
	}//for small pages with total size less then the viewport 
	return {winWidths:winWidth, winHeights:winHeight}; 
};
/**
 * @Describe 修改折叠事件的绑定
 */
window.GAG.ios.common.collapseLink = function (){
	$('.collapse-link').off("click");
	$('.collapse-link').on('click', function() {
        var $BOX_PANEL = $(this).closest('.x_panel'),
            $ICON = $(this).find('i'),
            $BOX_CONTENT = $BOX_PANEL.find('.x_content');
        
        if($BOX_PANEL.attr('style')){
            $BOX_CONTENT.slideToggle(200, function(){
                $BOX_PANEL.removeAttr('style');
            });
        }else{
            $BOX_CONTENT.slideToggle(200,function(){
                $BOX_PANEL.css({"padding-bottom":"0px","margin-bottom":"0px"});             	
            });  
        }

        $ICON.toggleClass('fa-chevron-up fa-chevron-down');
    });
};
window.GAG.ios.common.getTree = function (item,result) {
    if(item.length > 0){
        var length = item.length;
        for (var i = 0; i < length; i++) {
            result.push({
                'id' : item[i].id,
                'name': item[i].authName,
                'parent' : item[i].parentId == '0' ? '#' : item[i].parentId,
                'text' : item[i].authName,
                'state': {'selected': false},
            });

        }
    }
    return result;
};


//获取机构树

window.GAG.ios.common.getOrgTree = function (treeClass,parClass) {
    $('.' + treeClass).show();
    $.ajax({
        url : window.BASE_API_URL + "index/initSysDeptList.do",
        type : 'post',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        dataType : 'json',
        data:{
            type: '1'
        },
        success : function(data) {
            if (data.status == 'T') {
                window.location.href = '/login.html';
                return;
            }
            if (data.status == 'F') {
                layer.msg(data.msg, {zIndex: layer.zIndex});
                return;
            }
            $('.' + treeClass).show();
            var result = [];
            var list = data.data.sysDeptList;
            var length = list.length;
            for (var i = 0; i < length; i++) {
                result.push({
                    'id' : list[i].id,
                    'name' : list[i].deptName,
                    'parent' : list[i].parentId == '-1' ?  '#' : list[i].parentId,
                    'text' : list[i].deptName,
                    'state': {'selected': false,"opened": false}
                });

            }
            $('.' + treeClass ).jstree({
                'core' : {
                    'data' : result
                }
            });
            $('.' + treeClass ).on('changed.jstree',function (e,data) {
                $('.' + parClass + '> #organName').val(data.node.text);
                $('.' + parClass + '> #organId').val(data.node.id);
                for (var i = 0; i < length; i++) {
                    if (list[i].deptName == data.node.text) {
                        $('#mparentDeptCode').val(list[i].parentDeptCode);
                        $('#mtaxNo').val(list[i].taxNo);
                        $('#mparentTaxNo').val(list[i].parentTaxNo);
                        return
                    }
                }
            });
            return data;
        }
    });
};

//清空上级机构
window.GAG.ios.common.clearOrg = function (parClass) {
    var organName = $('.' + parClass +'> #organName').val();//上级机构名称
    if(!organName){
        $('.' + parClass + '> #organId').val('');
    }
};
//隐藏机构树
window.GAG.ios.common.hideTree = function (treeClass,parClass) {
    $('.'+parClass).on('click',function (e) {


        if (!$(e.target).hasClass('jstree-icon')) {
            $('.' + treeClass).hide();
        }
    });
};