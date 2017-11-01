/**
 * 机构树弹出层公共js（所需前提文件：layui.css、layui.js）
 * 
 * @version 2017-04-21
 * @author HomyZhu
 * 
 * 使用说明及示例：
 * 
 * onClick="showBmTree()"
 * 默认赋值到id为bm_bmmc、bm_id、bm_bmid、bm_bmjc、bm_nsrsbh、bm_ssnsrsbh的页面元素中
 * 可以只有bm_bmmc的元素，也可以有其中一到多个元素
 * 适用于页面查询区域的组织机构显示，一加载即可有值
 * 
 * onClick="showBmTree(this)"
 * 赋值到点击的部门名称输入框及其兄弟输入框中，只需他们的id以bmmc、id、bmid、bmjc、nsrsbh、ssnsrsbh结尾即可
 * 可以只有点击的部门名称输入框，也可以有其中一到多个输入框
 * 
 * onClick="showBmTree(this, 1)"
 * 打开的机构树类型为本级及上级机构
 * 
 * onClick="showBmTree(this, 2)"
 * 打开的机构树类型为本级及上下级机构
 * 
 */


//	全局变量

var tree;

var upTree;

var upDownTree;

var clickElement;


/**
 * 页面初始化执行方法
 */
$(document).ready(function(){
	
	setBmData(new TreeNode(window.top["GlobalBmList"][0]));//设置默认查询区域的组织机构数据，前提是id为规命名
	
	//添加机构树，原页面不可有相同id的元素以防冲突
	var treeStr = 
		'<ul id="bmTree" style="display: none;"></ul>' +
		'<ul id="bmUpTree" style="display: none;"></ul>' +
		'<ul id="bmUpDownTree" style="display: none;"></ul>';
	
	$("body").append(treeStr);
	
	//初始化机构树
	tree   = new Tree(window.top["GlobalBmList"]);
	upTree = new Tree(window.top["GlobalBmUpList"]);
	upDownTree = new Tree(appendTreeToUpTree());
	
	//构造机构树并生成隐藏的layui树形结构
	tree.initTree("#bmTree");
	upTree.initTree("#bmUpTree");
	upDownTree.initTree("#bmUpDownTree");
	
});


/**
 * 机构树节点实体类
 */
function TreeNode(bm){
	this.id			= bm.id;		//机构主键
	this.bmid		= bm.bmid;		//公司内部实际编码
	this.bmjc		= bm.bmjc;		//部门级次
	this.name		= bm.bmmc;		//显示名称
	this.nsrsbh		= bm.nsrsbh;	//税号
	this.ssnsrsbh	= bm.ssnsrsbh;	//所属税号
	this.children	= new Array();	//子结点
}


/**
 * 机构树实体类
 */
function Tree(bms){
	
	this.bms = bms;
	
	this.treeNodes = new Array();
	
	
	//机构树初始化，在mysql环境中如果后台返回的机构数组中缺少部分中间机构，会导致机构树画不全
	this.initTree = function(element){

		var nowTree = this;
		
		if(this.bms[0].isInit == true){//如果机构太多仍在加载中，就每隔1秒重新构造机构树
			setTimeout(function(){
				nowTree.initTree(element);
			}, 1000);
			return;
		}
		
		//深度遍历构造机构树
		var stack = new Array();
		var pNode = new TreeNode(this.bms[0]);
		
		this.treeNodes = new Array();
		this.treeNodes.push(pNode);
		
		stack.push(pNode);
		
		for(var i=1; i < this.bms.length; i=i+1){
			
			var node = new TreeNode(this.bms[i]);
			
			while(true){
				if(pNode == null)
					break;//跳出内层循环，外层循环不用设置跳出，毕竟也会全部走到此处break出去
				
				if(this.bms[i].sjbmid == pNode.id){
					stack.push(node);
					pNode.children.push(node);
					pNode = node;
					break;
				}
				else{
					stack.pop();
					pNode = stack[stack.length-1];
				}
			}
		}
		
		//生成机构树的页面元素
		layui.use(['tree', 'layer'], function(){
			layui.tree({
				elem : element, //指定元素
				target : '_blank', //是否新选项卡打开（比如节点返回href才有效）
				nodes : nowTree.treeNodes,
				click : function(node){ //点击节点回调
					setBmData(node);
					layer.close(layer.index);
			    }
			});
		});
		
	};
	
}



/**
 * 
 * 显示部门方框，参数可为空，为空时取默认id
 * 
 * @param element	点击的部门输入框元素
 * @param type 		部门树类型，0(或空)为本级及下级，1为本级及上级，2为本级及上下级
 * 
 */
function showBmTree(element, type){
	
	if(tree.bms[0].isInit == true){//如果tree还是初始值，那upTree、upDownTree肯定也还是初始值
		layer.msg("由于机构较多，仍在加载中，请稍后重试！");
		return;
	}
	if(element == undefined)
		element = $("#bm_bmmc");
	
	clickElement = element;
	
	var treeElement = "#bmTree";
	if(type == "1")
		treeElement = "#bmUpTree";
	else if(type == "2")
		treeElement = "#bmUpDownTree";
	
	var elementHeight = $(element).css("height");//以px结尾
	elementHeight = parseInt(elementHeight.substring(0, elementHeight.length-2));
	
	var elementOffset = $(element).offset();
	var bmTop = elementOffset.top + elementHeight;
	var bmLeft = elementOffset.left;
	
	var divWidth = 260; //宽度不小于260，同时不大于窗口可视宽度
	var divHeight = 190; //高度不小于190，同时不大于窗口可视高度
	
	if(divWidth > $(window).width() - bmLeft)
		divWidth = $(window).width() - bmLeft;
	if(divHeight > $(window).height() - bmTop)
		divHeight = $(window).height() - bmTop;
	
	var index = layer.open({
		type: 1,
		title: false,
		content: $(treeElement),
		closeBtn: 0,
		shade: 0,
		zIndex: layer.zIndex,//此句相当重要，可保证点开的弹窗总在最上层
		area: [divWidth + "px", divHeight + "px"],
		offset: [bmTop + "px", bmLeft + "px"]
	});
	
	$("body").bind("mousedown", function(event){//设置点击机构框之外的任意位置都关闭机构框
		if (event.pageX < elementOffset.left ||
			event.pageX > elementOffset.left + $(treeElement).parent().width() ||
			event.pageY < elementOffset.top + elementHeight ||
			event.pageY > elementOffset.top + $(treeElement).parent().height() + elementHeight)
			
			layer.close(index);
	});
	
}


/**
 * 
 * 设置部门数据，若点击元素为空，则设置到默认id的页面元素上
 * 
 * @param node		需要设置的部门数据
 * 
 */
function setBmData(node){
	if(clickElement == undefined){
		$("#bm_bmmc").val(node.name);
		$("#bm_id").siblings("input[id$='id']").val(node.id);//兄弟结点中id属性以id结尾的输入框
		$("#bm_bmid").siblings("input[id$='bmid']").val(node.bmid);//若有，上句先赋值,本句后刷新
		$("#bm_bmjc").siblings("input[id$='bmjc']").val(node.bmjc);
		$("#bm_nsrsbh").siblings("input[id$='nsrsbh']").val(node.nsrsbh);
		$("#bm_ssnsrsbh").siblings("input[id$='ssnsrsbh']").val(node.ssnsrsbh);
	}
	else{
		$(clickElement).val(node.name);
		$(clickElement).siblings("input[id$='id']").val(node.id);
		$(clickElement).siblings("input[id$='bmid']").val(node.bmid);
		$(clickElement).siblings("input[id$='bmjc']").val(node.bmjc);
		$(clickElement).siblings("input[id$='nsrsbh']").val(node.nsrsbh);
		$(clickElement).siblings("input[id$='ssnsrsbh']").val(node.ssnsrsbh);
	}
}


/**
 * 合并上级机构树和下级机构树，本级只显示一次
 */
function appendTreeToUpTree(){
	var newTree = new Array();
	
	for(var i = 0; i < upTree.bms.length; i++)
		newTree.push(upTree.bms[i]);
	for(var i = 1; i < tree.bms.length; i++)
		newTree.push(tree.bms[i]);
	
	return newTree;
}



//通过机构名称查询机构id
function getBmmcById(id){
	for(var i in tree.bms){
		if(tree.bms[i].id == id)
			return tree.bms[i].bmmc;
	}
	return "";
}


//通过机构名称查询上级机构中的id
function getUpBmmcById(id){
	for(var i in upTree.bms){
		if(upTree.bms[i].id == id)
			return upTree.bms[i].bmmc;
	}
	return "";
}
