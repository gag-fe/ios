//机构下拉树形结构统一调用方法

var tree;

var upTree;

var upDownTree;


//标志要显示的树
var showTree;


/*机构树节点实体类*/
function TreeNode(bm,status){
	this.id       = bm.id;
	this.bmid     = bm.bmid;
	this.bmmc     = bm.bmmc;
	this.bmjc     = bm.bmjc;
	this.pid      = bm.sjbmid;
	this.nsrsbh   = bm.nsrsbh;
	this.ssnsrsbh = bm.ssnsrsbh;
	this.children = new Array();
}

/*机构树实体类*/
function Tree(bms){
	this.treeNodes = new Array();
	this.root;
	this.bms = bms;
	
	this.divId      = "BmDiv";
	this.treeId     = "BmTree";
	this.mcEl       = "txt_bm_mc";
	this.idEl       = "txt_bm_id";
	this.bmidEl     = "txt_bm_bmid";
	this.nsrsbhEl   = "txt_bm_nsrsbh";
	this.ssnsrsbhEl = "txt_bm_ssnsrsbh";
	
	
	//造树，深度遍历构造机构树
	this.createTree = function(){
		
		var stack = new Array();
		var pNode = new TreeNode(this.bms[0]);
		
		this.treeNodes = new Array();
		this.treeNodes.push(pNode);
		
		return;//此方法暂无作用，机构树数据有误时容易导致页面js报错，故屏蔽
		
		stack.push(pNode);
		
		for(var i=1; i < this.bms.length; i=i+1){
			
			var node = new TreeNode(this.bms[i]);
			
			while(true){
				if(this.bms[i].sjbmid == pNode.id){
					stack.push(node);
					pNode.children.push(node);
					pNode = node;
					break;
				} else {
					stack.pop();
					pNode = stack[stack.length-1];
				}
			}
		}
	};
	//画树，深度遍历
	this.drawTree = function(){
		
		var setting = {
			view : {
				selectedMulti: false	//单选
			},
			data : {
				key: {
					name: "bmmc"		//将哪一个属性显示
				},
				simpleData : {
					enable : true,		//简单数据，保持Array，不需要转换为嵌套的JSon
					idKey:   "id",		//关键字字段属性名
					pIdKey:  "sjbmid"	//父节点字段属性名
				}
			},
			callback : {
				beforeClick : this.beforeBmClick,
				onClick : this.onBmClick//点击之后调用的赋值方法
			}
		};
		
		//http://www.ztree.me/v3/api.php官网可查api参数说明
		
		$.fn.zTree.init($("#" + this.treeId), setting, this.bms);//调用JQuery的zTree框架初始化树形数据
		
		var zTree = $.fn.zTree.getZTreeObj(showTree.treeId);
		var node = zTree.getNodeByParam("id", showTree.bms[0].id);//通过id获得第一个节点，并展开
		zTree.expandNode(node, true, showTree==upTree, false, false);//参数1:节点，2:true展开，3:true影响子节点，4:true保证可视范围，5:是否回调
	};
	
	this.beforeBmClick = function(){
		return true;
	};
	
	this.onBmClick = function(){
		var zTree = $.fn.zTree.getZTreeObj(showTree.treeId);
		var nodes = zTree.getSelectedNodes();
		
		$("#" + showTree.mcEl      ).val(nodes[0].bmmc);
		$("#" + showTree.idEl      ).val(nodes[0].id);
		$("#" + showTree.bmidEl    ).val(nodes[0].bmid);
		$("#" + showTree.nsrsbhEl  ).val(nodes[0].nsrsbh);
		$("#" + showTree.ssnsrsbhEl).val(nodes[0].ssnsrsbh);
		
		//用于销方管理控制税号编码及税号名称输入
		if(!($("#xfgl_flag").val()==undefined) && $("#xfgl_flag").val()=="xfgl_flag"){
			if($("#txt_bm_nsrsbh").val()==""){
				$('#txt_bm_nsrsbh').attr("disabled",false);
				$('#add_nsrmc').attr("readonly",false);
				$("#add_nsrmc").val("");//销方名称，清除提示语
				$("#add_nsrmc").css("color","black");//输入文本为黑色
			}
			else{
				$("#txt_bm_nsrsbh").attr("disabled","disabled");
				$("#add_nsrmc").attr("readonly","readonly");
				$("#add_nsrmc").val("所属机构已有税号，请更换");//销方名称，默认提示语
				$("#add_nsrmc").css("color","#CCCCCC");//提示语为灰色
			}
		}
						
		$("#" + showTree.divId).fadeOut("fast");
		
		//系统设置-用户管理绑定开票信息
		if(document.title == "用户管理")
			bindKPX(nodes[0].nsrsbh,nodes[0].ssnsrsbh);
	};
	
	this.initBmShow = function(){
		
		var mcElement       = document.getElementById(showTree.mcEl);
		var idElement       = document.getElementById(showTree.idEl);
		var bmidElement     = document.getElementById(showTree.bmidEl);
		var nsrsbhElement   = document.getElementById(showTree.nsrsbhEl);
		var ssnsrsbhElement = document.getElementById(showTree.ssnsrsbhEl);
		
		if(mcElement != null && mcElement.value == "")
			mcElement.value = $.trim(showTree.treeNodes[0].bmmc);
		
		if(idElement != null && idElement.value == "")
			idElement.value = $.trim(showTree.treeNodes[0].id);
		
		if(bmidElement != null && bmidElement.value == "")
			bmidElement.value = $.trim(showTree.treeNodes[0].bmid);
		
		if(nsrsbhElement != null && nsrsbhElement.value == "")
			nsrsbhElement.value = $.trim(showTree.treeNodes[0].nsrsbh);
		
		if(ssnsrsbhElement != null && ssnsrsbhElement.value == "")
			ssnsrsbhElement.value = $.trim(showTree.treeNodes[0].ssnsrsbh);
	}
}





/**
 * 显示部门方框，参数可为空，为空时取默认id
 * 
 * @param divId	部门树的外框div
 * @param treeId 部门树
 * @param mcEl 部门名称输入框
 * @param idEl 部门ID隐藏框
 * @param bmidEl 部门bmid隐藏框
 * @param nsrsbhEl 部门纳税人识别号隐藏框
 * @return
 */
function showBmDiv(divId,treeId,mcEl,idEl,bmidEl,nsrsbhEl,ssnsrsbhEl){
	
	showTree = tree;
	
	openShowTreeDiv(divId,treeId,mcEl,idEl,bmidEl,nsrsbhEl,ssnsrsbhEl,window.top["GlobalBmList"]);
}


/**
 * 显示上级部门方框，参数可为空，为空时取默认id
 * 
 * @param divId	部门树的外框div
 * @param treeId 部门树
 * @param mcEl 部门名称输入框
 * @param idEl 部门ID隐藏框
 * @param bmidEl 部门bmid隐藏框
 * @param nsrsbhEl 部门纳税人识别号隐藏框
 * @return
 */
function showBmUpDiv(divId,treeId,mcEl,idEl,bmidEl,nsrsbhEl,ssnsrsbhEl){
	
	showTree = upTree;
	
	openShowTreeDiv(divId,treeId,mcEl,idEl,bmidEl,nsrsbhEl,ssnsrsbhEl,window.top["GlobalBmUpList"]);
}


/**
 * 显示上级和下级部门方框，参数可为空，为空时取默认id
 * 
 * @param divId	部门树的外框div
 * @param treeId 部门树
 * @param mcEl 部门名称输入框
 * @param idEl 部门ID隐藏框
 * @param bmidEl 部门bmid隐藏框
 * @param nsrsbhEl 部门纳税人识别号隐藏框
 * @return
 */
function showBmUpDownDiv(divId,treeId,mcEl,idEl,bmidEl,nsrsbhEl,ssnsrsbhEl){
	
	showTree = upDownTree;
	
	openShowTreeDiv(divId,treeId,mcEl,idEl,bmidEl,nsrsbhEl,ssnsrsbhEl,appendTreeToUpTree());
}




//显示showTree的部门框
function openShowTreeDiv(divId,treeId,mcEl,idEl,bmidEl,nsrsbhEl,ssnsrsbhEl,bms){
	
	showTree.divId      =      divId == undefined ? "BmDiv"           : divId;
	showTree.treeId     =     treeId == undefined ? "BmTree"          : treeId;
	showTree.mcEl       =       mcEl == undefined ? "txt_bm_mc"       : mcEl;
	showTree.idEl       =       idEl == undefined ? "txt_bm_id"       : idEl;
	showTree.bmidEl     =     bmidEl == undefined ? "txt_bm_bmid"     : bmidEl;
	showTree.nsrsbhEl   =   nsrsbhEl == undefined ? "txt_bm_nsrsbh"   : nsrsbhEl;
	showTree.ssnsrsbhEl = ssnsrsbhEl == undefined ? "txt_bm_ssnsrsbh" : ssnsrsbhEl;
	
	if(bms[0].isInit == true){
		alert("由于机构较多，正在初始化机构数据，请稍后重试！");
		return;
	}
	
	if(showTree.bms[0].isInit == true){
		showTree.bms = bms;
		showTree.createTree();
		showTree.initBmShow();
	}
	
	if($("#" + showTree.divId).attr("drawed") == undefined){
		showTree.drawTree();
		$("#" + showTree.divId).attr("drawed","drawed");
	}
	
	slideDownBmDiv();
}



//显示ztree，根据不同输入显示相应ztree
function slideDownBmDiv(input, menuId) {
	var bmOffset = $("#" + showTree.mcEl).offset();
	var bmHeight = $("#" + showTree.mcEl).css("height");
	var bmWidth  = $("#" + showTree.mcEl).width();
	
	bmHeight = parseInt(bmHeight.substring(0, bmHeight.length-2));
	
	//如果宽度为初值，就设置树显示宽度和机构名称框一致，已拉伸调整过的维持原样
	if($("#" + showTree.treeId).width() == 191)//初始值为191
		$("#" + showTree.treeId).width(bmWidth > 175 ? bmWidth-2 : 173);
	
	//先可见，设置偏移才准确
	$("#" + showTree.divId).css("display", "block");
	$("#" + showTree.divId).css("z-index", "6000");
	
	//设置树显示位置，在机构名称框正下方1px之后
	$("#" + showTree.divId).offset({
		left: bmOffset.left,
		top: bmOffset.top + bmHeight - 9 //测试得出的差值
	}).slideDown("fast");
	
	$("body").bind("mousedown", onBodyDown);
	
	
	//调用本js末尾的DragResize脚本实现机构框的大小可拉伸效果
	$("#" + showTree.treeId).addClass("drsElement drsMoveHandle"); 
	
	var dragresize = new DragResize('dragresize', {minWidth: 150, minHeight: 100});
	
	dragresize.isElement = function(elm){
		if (elm.className && elm.className.indexOf('drsElement') > -1) return true;
	};
	dragresize.isHandle  = function(elm){
		if (elm.className && elm.className.indexOf('drsMoveHandle') > -1) return true;
	};
	
	dragresize.apply(document);
}


function onBodyDown(event) {
	if (!(event.target.id == showTree.mcEl || event.target.id == showTree.divId || 
			$(event.target).parents("#"+showTree.divId).length > 0)) {
		hideMenu(showTree.mcEl, showTree.divId);
	}
}


function hideMenu(input, menuId) {
	$("#" + showTree.divId).fadeOut("fast");
	$("body").unbind("mousedown", onBodyDown);
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


//合并上级机构树和下级机构树，本级只显示一次
function appendTreeToUpTree(){
	var newTree = new Array();
	
	for(var i = 0; i < upTree.bms.length; i++)
		newTree.push(upTree.bms[i]);
	for(var i = 1; i < tree.bms.length; i++)
		newTree.push(tree.bms[i]);
	
	return newTree;
}


$(document).ready(function(){
	
	tree   = new Tree(window.top["GlobalBmList"]);
	upTree = new Tree(window.top["GlobalBmUpList"]);
	upDownTree = new Tree(appendTreeToUpTree());
	
	showTree = tree;
	
	tree.createTree();
	upTree.createTree();
	upDownTree.createTree();
	
	tree.initBmShow();
});




/*

机构框拉伸效果需要用到以下js文件

参考来源：https://www.twinhelix.com/javascript/dragresize/demo/

DragResize v1.0
(c) 2005-2006 Angus Turnbull, TwinHelix Designs http://www.twinhelix.com

Licensed under the CC-GNU LGPL, version 2.1 or later:
http://creativecommons.org/licenses/LGPL/2.1/
This is distributed WITHOUT ANY WARRANTY; without even the implied
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

*/


if(typeof addEvent!='function'){var addEvent=function(o,t,f,l){var d='addEventListener',n='on'+t,rO=o,rT=t,rF=f,rL=l;if(o[d]&&!l)return o[d](t,f,false);if(!o._evts)o._evts={};if(!o._evts[t]){o._evts[t]=o[n]?{b:o[n]}:{};o[n]=new Function('e','var r=true,o=this,a=o._evts["'+t+'"],i;for(i in a){o._f=a[i];r=o._f(e||window.event)!=false&&r;o._f=null}return r');if(t!='unload')addEvent(window,'unload',function(){removeEvent(rO,rT,rF,rL)})}if(!f._i)f._i=addEvent._i++;o._evts[t][f._i]=f};addEvent._i=1;var removeEvent=function(o,t,f,l){var d='removeEventListener';if(o[d]&&!l)return o[d](t,f,false);if(o._evts&&o._evts[t]&&f._i)delete o._evts[t][f._i]}}function cancelEvent(e,c){e.returnValue=false;if(e.preventDefault)e.preventDefault();if(c){e.cancelBubble=true;if(e.stopPropagation)e.stopPropagation()}};function DragResize(myName,config){var props={myName:myName,enabled:true,handles:['tl','tm','tr','ml','mr','bl','bm','br'],isElement:null,isHandle:null,element:null,handle:null,minWidth:10,minHeight:10,minLeft:0,maxLeft:9999,minTop:0,maxTop:9999,zIndex:1,mouseX:0,mouseY:0,lastMouseX:0,lastMouseY:0,mOffX:0,mOffY:0,elmX:0,elmY:0,elmW:0,elmH:0,allowBlur:true,ondragfocus:null,ondragstart:null,ondragmove:null,ondragend:null,ondragblur:null};for(var p in props)this[p]=(typeof config[p]=='undefined')?props[p]:config[p]};DragResize.prototype.apply=function(node){var obj=this;addEvent(node,'mousedown',function(e){obj.mouseDown(e)});addEvent(node,'mousemove',function(e){obj.mouseMove(e)});addEvent(node,'mouseup',function(e){obj.mouseUp(e)})};DragResize.prototype.select=function(newElement){with(this){if(!document.getElementById||!enabled)return;if(newElement&&(newElement!=element)&&enabled){element=newElement;element.style.zIndex=++zIndex;if(this.resizeHandleSet)this.resizeHandleSet(element,true);elmX=parseInt(element.style.left);elmY=parseInt(element.style.top);elmW=element.offsetWidth;elmH=element.offsetHeight;if(ondragfocus)this.ondragfocus()}}};DragResize.prototype.deselect=function(delHandles){with(this){if(!document.getElementById||!enabled)return;if(delHandles){if(ondragblur)this.ondragblur();if(this.resizeHandleSet)this.resizeHandleSet(element,false);element=null}handle=null;mOffX=0;mOffY=0}};DragResize.prototype.mouseDown=function(e){with(this){if(!document.getElementById||!enabled)return true;var elm=e.target||e.srcElement,newElement=null,newHandle=null,hRE=new RegExp(myName+'-([trmbl]{2})','');while(elm){if(elm.className){if(!newHandle&&(hRE.test(elm.className)||isHandle(elm)))newHandle=elm;if(isElement(elm)){newElement=elm;break}}elm=elm.parentNode}if(element&&(element!=newElement)&&allowBlur)deselect(true);if(newElement&&(!element||(newElement==element))){if(newHandle)cancelEvent(e);select(newElement,newHandle);handle=newHandle;if(handle&&ondragstart)this.ondragstart(hRE.test(handle.className))}}};DragResize.prototype.mouseMove=function(e){with(this){if(!document.getElementById||!enabled)return true;mouseX=e.pageX||e.clientX+document.documentElement.scrollLeft;mouseY=e.pageY||e.clientY+document.documentElement.scrollTop;var diffX=mouseX-lastMouseX+mOffX;var diffY=mouseY-lastMouseY+mOffY;mOffX=mOffY=0;lastMouseX=mouseX;lastMouseY=mouseY;if(!handle)return true;var isResize=false;if(this.resizeHandleDrag&&this.resizeHandleDrag(diffX,diffY)){isResize=true}else{var dX=diffX,dY=diffY;if(elmX+dX<minLeft)mOffX=(dX-(diffX=minLeft-elmX));else if(elmX+elmW+dX>maxLeft)mOffX=(dX-(diffX=maxLeft-elmX-elmW));if(elmY+dY<minTop)mOffY=(dY-(diffY=minTop-elmY));else if(elmY+elmH+dY>maxTop)mOffY=(dY-(diffY=maxTop-elmY-elmH));elmX+=diffX;elmY+=diffY}with(element.style){left=elmX+'px';width=elmW+'px';top=elmY+'px';height=elmH+'px'}if(window.opera&&document.documentElement){var oDF=document.getElementById('op-drag-fix');if(!oDF){var oDF=document.createElement('input');oDF.id='op-drag-fix';oDF.style.display='none';document.body.appendChild(oDF)}oDF.focus()}if(ondragmove)this.ondragmove(isResize);cancelEvent(e)}};DragResize.prototype.mouseUp=function(e){with(this){if(!document.getElementById||!enabled)return;var hRE=new RegExp(myName+'-([trmbl]{2})','');if(handle&&ondragend)this.ondragend(hRE.test(handle.className));deselect(false)}};DragResize.prototype.resizeHandleSet=function(elm,show){with(this){if(!elm._handle_tr){for(var h=0;h<handles.length;h++){var hDiv=document.createElement('div');hDiv.className=myName+' '+myName+'-'+handles[h];elm['_handle_'+handles[h]]=elm.appendChild(hDiv)}}for(var h=0;h<handles.length;h++){elm['_handle_'+handles[h]].style.visibility=show?'inherit':'hidden'}}};DragResize.prototype.resizeHandleDrag=function(diffX,diffY){with(this){var hClass=handle&&handle.className&&handle.className.match(new RegExp(myName+'-([tmblr]{2})'))?RegExp.$1:'';var dY=diffY,dX=diffX,processed=false;if(hClass.indexOf('t')>=0){rs=1;if(elmH-dY<minHeight)mOffY=(dY-(diffY=elmH-minHeight));else if(elmY+dY<minTop)mOffY=(dY-(diffY=minTop-elmY));elmY+=diffY;elmH-=diffY;processed=true}if(hClass.indexOf('b')>=0){rs=1;if(elmH+dY<minHeight)mOffY=(dY-(diffY=minHeight-elmH));else if(elmY+elmH+dY>maxTop)mOffY=(dY-(diffY=maxTop-elmY-elmH));elmH+=diffY;processed=true}if(hClass.indexOf('l')>=0){rs=1;if(elmW-dX<minWidth)mOffX=(dX-(diffX=elmW-minWidth));else if(elmX+dX<minLeft)mOffX=(dX-(diffX=minLeft-elmX));elmX+=diffX;elmW-=diffX;processed=true}if(hClass.indexOf('r')>=0){rs=1;if(elmW+dX<minWidth)mOffX=(dX-(diffX=minWidth-elmW));else if(elmX+elmW+dX>maxLeft)mOffX=(dX-(diffX=maxLeft-elmX-elmW));elmW+=diffX;processed=true}return processed}};
