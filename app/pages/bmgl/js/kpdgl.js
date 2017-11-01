GAG.ios.kpdgl = function (){
    //全局变量
    this.colMap = {
        colNames : ['id','销方税号','销方名称','操作','开票机号','开票点','开关状态','开票点编码','机器编号', '创建时间'],
        colModel : [
            {name:'id',index:'id', width:"10%",align:'center',hidden:true},
            {name:'sellerTaxNo',index:'sellerTaxNo', width:"10%",align:'center',hidden:false},
            //{name:'jszt',index:'jszt', width:"10%",hidden:true},
            {name:'machineNo',index:'machineNo', width:"10%",align:'center',hidden:false},
            {name: '操作',width: '20%', align: 'center', formatter: function (value,gird,rows,state) {
                return  "<a href='#' class='btn_look' style='display: inline-block;width: 19px;height: 20px;margin: 0 4px' onclick='' >" +
                    "<i data-method='btn_check' class='btn-ev glyphicon glyphicon-eye-open pointer' style='font-size: 12px !important;'></i>" +
                    "</a>" +
                    "<a href='#' style='display: inline-block;margin: 0 4px'>" +
                    "<i data-method='btn_edit' class='btn-ev layui-icon'>&#xe642;</i> " +
                    "</a>" +
                    "<a href='#' style='display: inline-block;margin: 0 4px'>" +
                    "<i data-method='btn_del' class='btn-ev glyphicon glyphicon-trash' style='font-size: 12px !important;'></i>" +
                    "</a>"
                }
            },
            {name:'billingNo',index:'billingNo', width:"10%",align:'center',sortable:false,hidden:false},
            {name:'billingPointName',index:'billingPointName', width:"10%",align:'center',sortable:true},
            {name:'lockStatus',index:'lockStatus', width:"10%",align:'center',sortable:false,formatter(cellvalue, options, rowObject){
                if(cellvalue == "Y"){
                    return "开启"
                }else{
                    return "关闭"
                }

            }},

            {name:'billingPointNum',index:'billingPointNum', width:"10%",align:'center',sortable:false},
            {name:'machineNo',index:'machineNo', width:"10%",align:'center',sortable:false},
            // {name:'yhzh',index:'yhzh', width:"10%",align:'center',sortable:false},
            // {name:'yxbz',index:'yxbz', width:"10%",align:'center',sortable:true},
            {name:'createTime',index:'createTime', width:"15%",align:'center',sortable:true,formatter(value,gird,rows,state){
                return new Date(value).Format("yyyy-MM-dd hh:mm:ss");
            }}
        ]
    };
    //需要放在ready中定义，因为用到了dom pager
    this.defaultGridConfig = {
        ajaxGridOptions: {
            url: window.BASE_API_URL + "billingPointInfo/queryTaxBillingPointInfoPage.do",
            type: "post",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true
        },
        prmNames:{
            "page":"pageIndex",
            "rows":"pageSize",
        },
        postData:{
            "deptId":$.trim($("#organId").val()),//组织机构
            "userId":$.trim($("#txt_yhid").val()), //登录账号
            "lockStatus": $.trim($("#select_sdbj option:selected").val()),//锁定标记
        },
        datatype: "json", //数据来源，本地数据
        mtype: "POST",//提交方式
        autowidth: false,//自动宽,
        width: $(window).width() * 0.98,
        height: $(window).height() * 0.806,
        colNames: this.colMap["colNames"],
        colModel: this.colMap["colModel"],
        rownumbers: true,//添加左侧行号
        cellEdit: false,//表格可编辑
        altRows: true,//隔行变色
        altclass: 'GridClass',//隔行变色样式
        caption: "",
        viewrecords: true,//是否在浏览导航栏显示记录总数
        rowNum: 10,//每页显示记录数
        rowList: [10, 20, 30, 50, 100],
        multiselect: true,
        jsonReader: {
            id: "id",//设置返回参数中，表格ID的名字为blackId
            repeatitems: true,
            root: "data.rows",
            page : "data.pageIndex",
            total: function (obj) {
                return Math.ceil(obj.data.total/obj.data.pageSize);
            },
            records : "data.total",
        },
        pager: '#kpgl_pager'
    };
};

GAG.ios.kpdgl.prototype.init = function() {
    //var This = this;
    this.initButton();
    this.initGrid();//初始化界面
    this.queryAllKpdgl();
    initAisinoCheck("checkForm");//初始化这个form的校验
};
//默认查询显示列表
GAG.ios.kpdgl.prototype.initGrid = function (){
    var This = this;
    $("#kpgl_gridtable").jqGrid(This.defaultGridConfig).trigger('reloadGrid');
    setTimeout(function(){
        window.GAG.ios.common.updatePagerIcons($("#kpgl_gridtable"));//加载底部栏图标
    }, 0);
    window.GAG.ios.common.resizeJqGrid("kpgl_gridtable");
};
//初始化按钮
GAG.ios.kpdgl.prototype.initButton = function(){
    var This = this;
    layui.use('layer', function () {
        var $ = layui.jquery,
            layer = layui.layer;
        var active = {
            //查询
            btn_query: function () {
                This.queryAllKpdgl();

            },
            //新增
            btn_add: function(){
                // $('.jsTree-init').hide();
                var str = "新增开票点";
                This.openAddKpdDialog(str,"");
                var that = this;
                var addKpd = layer.open({
                    type: 1,
                    title: "<big>开票点管理-新增</big>",
                    area: ['800px','400px'],
                    shade: [0.6, '#393D49'],
                    shadeClose: false,
                    maxmin: true,
                    resize: true,//是否允许拉伸
                    content: $('#modal-kpddialog-1'),
                    btn: ['保存', '取消'] ,//只是为了演示
                    yes:function(){
                        if(This.saveKpdgl(str,"")){
                            This.kpdAdd(layer,addKpd);
                        }
                    },
                    btn2: function(){
                        layer.closeAll();
                        $("input[name='res']").click();
                        //$("#xz_wwdz_form").reset();
                    },
                    zIndex: 1000, //控制层叠顺序
                    success: function(layero){
                        layer.setTop(layero); //置顶当前窗口
                    }
                });
            },

            //修改
            btn_edit: function () {
                var str = "修改开票点管理";
                var selectRows = $("#kpgl_gridtable").jqGrid("getGridParam", "selarrrow");
                if (selectRows.length != 1) {
                    layer.msg('请选中一行，再进行编辑！', {btn: ['关闭']});
                    return;
                }
                else {
                    var rowData = $("#kpgl_gridtable").jqGrid("getRowData", selectRows[0]);
                    if (rowData.id == "0000") {
                        layer.msg('集团性质,不准许修改！', {zIndex: layer.zIndex});
                        return false;
                    }
                    This.openAddKpdDialog(str, rowData);
                    var editKpd = layer.open({
                        type: 1,
                        title: "<big>开票点管理-编辑</big>",
                        area: ['800px', '400px'],
                        shade: [0.6, '#393D49'],
                        shadeClose: false,
                        maxmin: true,
                        resize: true,//是否允许拉伸
                        content: $('#modal-kpddialog-1'),
                        btn: ['保存', '取消'],//只是为了演示
                        yes: function () {
                            if (This.saveKpdgl(str, rowData)) {//保存
                                This.kpdAdd(layer, editKpd);
                            }
                        },
                        btn2: function () {
                            layer.closeAll();
                            $("input[name='res']").click();
                            //$("#xz_wwdz_form").reset();
                        },
                        zIndex: 1000, //控制层叠顺序
                        success: function (layero) {
                            layer.setTop(layero); //置顶当前窗口
                        }
                    });
                }

            },
            //查看
            btn_check: function(){

                var str="查看开票点管理";
                var selectRows = $("#kpgl_gridtable").jqGrid("getGridParam", "selarrrow");
                if(selectRows.length!=1){
                    layer.msg('请选中一行，再进行查看！', { btn: ['关闭']});
                    return;
                }
                else{
                    var rowData =  $("#kpgl_gridtable").jqGrid("getRowData",selectRows[0]);
                    if(rowData.id == "0000"){
                        layer.msg('集团性质,不准许修改！', {zIndex: layer.zIndex});
                        return false;
                    }
                    This.openAddKpdDialog(str,rowData);
                    var editWwdz = layer.open({
                        type: 1,
                        title: "<big>开票点管理-查看</big>",
                        area: ['800px','400px'],
                        shade: [0.6, '#393D49'],
                        shadeClose: false,
                        maxmin: true,
                        resize: true,//是否允许拉伸
                        content: $('#modal-kpddialog-1'),
                        btn: ['关闭'] ,//只是为了演示
                        zIndex: 1000, //控制层叠顺序
                        success: function(layero){
                            layer.setTop(layero); //置顶当前窗口
                        }
                    });
                }

            },
            //删除
            btn_delete: function(){
                var selectRows = $("#kpgl_gridtable").jqGrid("getGridParam", "selarrrow");
                if(selectRows.length==0){
                    //layer.msg('请选中一行，再进行删除！', {zIndex: layer.zIndex},{ btn: ['关闭']});
                    layer.msg('请选中一行，再进行删除！', { btn: ['关闭']});
                    return;
                }
                else{
                    This.deleteKpdDialog();
                    This.queryAllKpdgl();
                }
            }


        };
        $('#LAY_demo .layui-btn').on('click', function () {
            var othis = $(this), method = othis.data('method');
            active[method] ? active[method].call(this, othis) : '';
        });
    });
};


//获取查询参数，只提交有用数据
GAG.ios.kpdgl.prototype.getQueryMap = function () {
    var rtnMap = {};
    rtnMap["pageIndex"] = 1;
    rtnMap["pageSize"] = 10;
    rtnMap["sellerName"] = $.trim($("#xfmc").val());
    rtnMap["sellerTaxNo"] = $.trim($("#xfsh").val());
    rtnMap["billingPointName"] = $.trim($("#kpdid").val());
    var lockStatus = $.trim($("#ww_wzlx option:selected").val());
    if (lockStatus == "-1") {
        rtnMap["lockStatus"] = "Y";
    }
    else if(lockStatus == "0"){
        rtnMap["lockStatus"] = "";
    }else {
        rtnMap["lockStatus"] = "N";
    }
    return rtnMap;
};
/**
 * 查询
 * @return
 */
GAG.ios.kpdgl.prototype.queryAllKpdgl = function () {
    var This = this;
    $("#kpgl_gridtable").setGridParam({
        page: 1,
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        url: window.BASE_API_URL + "billingPointInfo/queryTaxBillingPointInfoPage.do",
        datatype: "json",
        mtype: "POST",// 提交方式
        postData: This.getQueryMap()
    }).trigger("reloadGrid");
};

//清空税务弹框信息
GAG.ios.kpdgl.prototype.emptyMessage = function(){
   $(".search_kpd #organName").val(""); //机构名称
   $(".search_kpd #organId").val("");  // 机构id
   $("#kpd_number").val("");  // 开票机号
   $("#kpd_duty").val("");   // 销方税号
   $("#kpd_point").val("");   // 开票点
   $("#sales_name").val("");   // 销方名称
   $("#kpd_encoding").val("");   // 开票点编码
   $("#kpd_state").val("开启");   // 开机状态名称
   $("#kpd_state").attr("readonly","true");
   $("#kpd_id").val("Y");   // 开机状态id
   $("#kpd_coding").val("");   // 机器编码
};
//隐藏机构树
GAG.ios.kpdgl.prototype.hideTree = function () {
    $('.search_kpd').on('click',function (e) {
        if (!$(e.target).hasClass('jstree-icon')) {
            $('.kpdTree-init').hide();
        }
    });
};
//清空上级机构
GAG.ios.role_manager.prototype.clearOrg = function () {

    var kpd_bmmc = $(".search_kpd #organName").val();//机构名称
    if(!kpd_bmmc){
        $(".search_kpd #organId").val('');
    }
};
//获取机构树
GAG.ios.kpdgl.prototype.getOrgTree = function () {
    $('.kpdTree-init').show();
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
            $('.jsTree-init').show();
            var result = [];
            var list = data.data.sysDeptList;
            console.log("sssss",data.data);
            var length = list.length;
            for (var i = 0; i < length; i++) {
                result.push({
                    'id' : list[i].id,
                    'name' : list[i].deptName,
                    'parentId' : list[i].parentId == '-1' ?  '#' : list[i].parentId,
                    'parent' : list[i].parentId == '-1' ?  '#' : list[i].parentId,
                    'text' : list[i].deptName,
                    'state': {'selected': false,"opened": false}
                });

            }
            $('.kpdTree-init').jstree({
                'core' : {
                    'data' : result
                }
            });
            $('.kpdTree-init').on('changed.jstree',function (e,data) {
                console.log("qqqqq",data);
                $('.search_kpd #organName').val(data.node.text);
                $('.search_kpd #organId').val(data.node.id);
                for (var i = 0; i < length; i++) {
                    if (list[i].deptName == data.node.text) {
                        $('#kpd_duty').val(list[i].taxNo);
                        $('#sales_name').val(list[i].sellerName);
                        // $('#mparentTaxNo').val(list[i].parentTaxNo);
                        return
                    }
                }
                $('#kpd_duty').val('');
                $('#sales_name').val('');
                // $('#mparentTaxNo').val('');
            });
        }
    });
};

// 打开税务弹框
GAG.ios.kpdgl.prototype.openAddKpdDialog = function (str,rowData){
    var This = this;
    This.emptyMessage();
    // console.log("kkkkk",rowData);

    if( str == "修改开票点管理" || str == '查看开票点管理'){
        $.ajax({
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            url: window.BASE_API_URL +"billingPointInfo/queryTaxBillingPointInfoDetail.do",
            type: 'post',
            dataType: 'json',
            data: {
                id : rowData.id
            },
            success: function (data) {
                var data = data.data;
                $(".search_kpd #organName").val(data.deptName); //机构名称
                $(".search_kpd #organName").attr("disabled","true"); //机构名称


                $(".search_kpd #organId").val(data.deptId);  // 机构id
                $("#kpd_number").val(data.billingNo);  // 开票机号
                $("#kpd_number").attr("disabled","true");  // 开票机号

                $("#kpd_duty").val(data.sellerTaxNo);   // 销方税号
                $("#kpd_duty").attr("disabled","true");   // 销方税号

                $("#kpd_point").val(data.billingPointName);   // 开票点
                $("#sales_name").val(data.sellerName);   // 销方名称
                $("#sales_name").attr("disabled","true");   // 销方名称

                $("#kpd_encoding").val(data.billingPointNum);   // 开票点编码
                $("#kpd_state").val("开启");   // 开机状态名称
                if (data.lockStatus == 'Y') {
                    $("#kpd_state").val("开启");//开票标志
                    $("#kpd_state").attr("readonly","true");
                    $("#kpd_state").attr("readonly","true");
                    $("#kpd_state").attr("readonly","true");
                    $("#kpd_id").val("Y");   // 开机状态id
                }else if(data.lockStatus == 'N'){
                    $("#kpd_state").val("关闭");
                    $("#kpd_state").attr("readonly","true");
                    $("#kpd_id").val("N");   // 开机状态id
                }

                // $("#kpd_state").attr("readonly","true");
                // $("#kpd_id").val("Y");   // 开机状态id
                $("#kpd_coding").val(data.machineNo);   // 机器编码

            }
        })
    }
    if(str == '新增开票点'){
        $(".search_kpd #organName").removeAttr("disabled"); //机构名称
        $("#kpd_number").removeAttr("disabled");  // 开票机号
        $("#kpd_duty").removeAttr("disabled");   // 销方税号
        $("#sales_name").removeAttr("disabled");   // 销方名称
    }
};

/*
 * 保存数据
 */
GAG.ios.kpdgl.prototype.saveKpdgl = function (str,rowData){
    var This = this;
    var checkResult = checkAisinoForm("checkForm");
    if( checkResult == false)
        return false;//校验不通过，根据各个框的错误信息进行修改
    //取值

    // var mdeptCode = $(".search_kpd #organName").val(""); //机构名称
    var deptId = $(".search_kpd #organId").val();  // 机构id
    var billingNo = $("#kpd_number").val();  // 开票机号

    var sellerTaxNo = $("#kpd_duty").val();   // 销方税号

    var billingPointName = $("#kpd_point").val();   // 开票点

    var sellerName = $("#sales_name").val();   // 销方名称

    var billingPointNum = $("#kpd_encoding").val();   // 开票点编码

    // var mtaxNo = $("#kpd_state").val("开启");   // 开机状态名称

    var lockStatus = $("#kpd_id").val();   // 开机状态id

    var machineNo =  $("#kpd_coding").val();   // 机器编码


    var rtnMap = {};
    rtnMap["deptId"] = deptId;
    rtnMap["billingNo"] = billingNo;
    rtnMap["sellerTaxNo"] = sellerTaxNo;
    rtnMap["billingPointName"] = billingPointName;
    rtnMap["sellerName"] = sellerName;
    rtnMap["billingPointNum"] = billingPointNum;
    rtnMap["lockStatus"] = lockStatus;
    rtnMap["machineNo"] = machineNo;
    if( str == "新增开票点"){
        $.ajax({
            url:window.BASE_API_URL + "billingPointInfo/addTaxBillingPointInfo.do",
            type:'POST',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            dataType: 'json',
            data: rtnMap,

            success : function(data) {
                if (data.status == 'T') {
                    window.location.href = '/login.html';
                    return;
                }
                layer.msg(data.msg, {zIndex: layer.zIndex});
                This.queryAllKpdgl();
            }
        });
        return true;
    }
    else{
        rtnMap["id"]= rowData.id;
        $.ajax({
            url : window.BASE_API_URL + "billingPointInfo/editTaxBillingPointInfo.do",
            type : 'post',
            dataType : 'json',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            data:rtnMap,
            success : function(data) {
                if (data.status == 'T') {
                    window.location.href = '/login.html';
                    return;
                }
                layer.msg(data.msg, {zIndex: layer.zIndex});
                This.queryAllKpdgl();
            }
        });
        return true;
    }

};

/**
 * 删除
 * @return
 */
GAG.ios.kpdgl.prototype.deleteKpdDialog = function(){
    var This = this;
    var id = $("#kpgl_gridtable").jqGrid("getGridParam","selrow");
    var rowData = $("#kpgl_gridtable").jqGrid("getRowData", id);
    {
        var selectRows = $("#kpgl_gridtable").jqGrid("getGridParam", "selarrrow");
        // console.log("rrrrrrr",selectRows);
        layer.confirm('确定要删除这 '+ selectRows.length +' 条数据吗？', {icon: 3, title:'删除角色信息提示'},
            function ok(data) {
                $(this).attr("disabled", true);
                var delFlag = false;
                var deleteStr="";
                for(var i=0;i<selectRows.length;i++){
                    var rowData =  $("#kpgl_gridtable").jqGrid("getRowData",selectRows[i]);
                    deleteStr = deleteStr + rowData.id +",";
                }
                deleteStr = deleteStr.substring(0,deleteStr.length-1);
                $.ajax({
                    type:'POST',
                    xhrFields: {
                        withCredentials: true
                    },
                    crossDomain: true,
                    url: window.BASE_API_URL + "billingPointInfo/deleteTaxBillingPointInfo.do",
                    data: {
                        id: selectRows
                    },
                    dataType:'json',
                    async: false,
                    globle: false,
                    error: function(){
                        $(this).removeAttr("disabled");
                        layer.msg('数据处理错误！', {zIndex: layer.zIndex});
                        return false;
                    },
                    beforeSend: function(){
                        $("#bgFilter").css("display", "block");
                        $("#loadingProgress").css("display", "block");
                    },
                    success: function(data){
                        if (data.status == "S"){
                            layer.msg('删除成功,共删除'+selectRows.length+'条角色!', {zIndex: layer.zIndex});
                            $(this).removeAttr("disabled");
                            This.queryAllKpdgl();
                        }
                        else if(data.status == 'T'){
                            window.location.href = '/login.html';
                            return;
                        }
                        else {
                            layer.msg(data.msg);
                            // $(this).removeAttr("disabled");
                        }
                    },
                    complete: function() {
                        $("#bgFilter").css("display", "none");
                        $("#loadingProgress").css("display", "none");
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        layer.msg('操作失败!', {zIndex: layer.zIndex});
                        $(this).removeAttr("disabled");
                    }
                });
            });
    }
};



/**
 * 运行中提示
 */
GAG.ios.kpdgl.prototype.kpdAdd = function (layer, layerId) {
    layer.msg('运行中', {
        icon: 16,
        shade: 0.6,
        zIndex: layer.zIndex + 100
    });
    //此处演示关闭
    setTimeout(function () {
        layer.close(layerId);
        //document.getElementById("wwdz_xz_form").reset();
        layer.closeAll('loading');
    }, 1000);
};
