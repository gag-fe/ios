
GAG.ios.xfgl = function () {
     //this.setting ;
     this.colMap ={
        //colNames : ['roleid','jszt','bmid','角色名称','角色id','角色状态','操作','组织机构','角色描述', '创建人', '创建时间'],
        colNames : ['id','销方税号','销方名称','操作','企业法人','企业经营地址','企业注册地址','联系电话','开户银行', '银行账号','有效标志','创建时间'],
        colModel : [
            {name:'id',index:'id', align:'center',width:"14%",hidden:true},
            {name:'sellerTaxNo',index:'sellerTaxNo', align:'center',width:"14%",hidden:false},
            //{name:'jszt',index:'jszt', width:"10%",hidden:true},
            {name:'sellerName',index:'sellerName', width:"10%",align:'center',hidden:false},
            {
                name: '操作',width: '12%', align: 'center', formatter: function (value,gird,rows,state) {
                // return  str = "<a href='#' class='btn_look' style='display: inline-block;width: 19px;height: 20px;margin: 0 4px' onclick='' >" + "<img src='../../image/action1.jpg' width='19px' height='20px'>" + "</a>" + "<a href='#' style='display: inline-block;margin: 0 4px'>" + "<img src='../../image/action2.jpg' width='19px' height='20px'>" + "</a>" + "<a href='#' style='display: inline-block;margin: 0 4px'>" + "<img src='../../image/action3.jpg' width='19px' height='20px'>" + "</a>"
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
            {name:'legalPerson',index:'legalPerson', width:"12%",align:'center',sortable:false,hidden:false},
            {name:'businessAddress',index:'businessAddress', width:"14%",align:'center',sortable:true},
            {name:'sellerRegisteredAddress',index:'sellerRegisteredAddress', width:"13%",align:'center',sortable:false},

            {name:'telephone',index:'telephone', width:"10%",align:'center',sortable:false},
            {name:'sellerBank',index:'sellerBank', width:"13%",align:'center',sortable:false},
            {name:'sellerBankAccount',index:'sellerBankAccount', width:"10%",align:'center',sortable:false},
            {name:'status',index:'status', width:"10%",align:'center',sortable:true,formatter(cellvalue, options, rowObject){
                if(cellvalue == 1){
                    return "有效"
                }else{
                    return "无效"
                }

            }},
            {name:'createTime',index:'createTime', width:"18%",align:'center',sortable:true,sortorder:'desc',formatter: function (value,gird,rows,state){
                return new Date(value).Format("yyyy-MM-dd hh:mm:ss");
            }}
        ]};
    //需要放在ready中定义，因为用到了dom pager
    this.defaultGridConfig = {
        ajaxGridOptions: {
            url: window.BASE_API_URL + "sellerInfo/queryTaxSellerInfoPage.do",
            //type: "post",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true
        },
        //url: window.BASE_API_URL  + "sellerInfo/queryTaxSellerInfoPage.do",
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
            root: "data.rows",
            total: function (obj) {
                return Math.ceil(obj.data.total/obj.data.pageSize);
            },
            records:"data.total",
            page:"data.pageIndex",
            repeatitecjsj: true
        },
        pager: '#xfgl_pager'
    };
}
GAG.ios.xfgl.prototype.init = function () {
    var This = this;
    this.initButton();
    this.searchXf();
    this.queryAllXfgl();
    initAisinoCheck("checkForm");//初始化这个form的校验

    $("#xfgl_gridtable").jqGrid(This.defaultGridConfig).trigger('reloadGrid');
    setTimeout(function () {
        window.GAG.ios.common.updatePagerIcons($("#xfgl_gridtable"));//加载底部栏图标
    }, 0);
    window.GAG.ios.common.resizeJqGrid("xfgl_gridtable");
}

//初始化查询条件
GAG.ios.xfgl.prototype.searchXf = function(){
    $("#xfsh").val('');
    $("#xfmc").val('');
    $("#select_xf option:selected").val('');
    $.ajax({
        url : window.BASE_API_URL +"sellerInfo/getIndustryInfos.do",
        type : 'post',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        dataType : 'json',
        //data: This.getQueryMap(),
        success : function(data) {
            $.each(data.data.industryTypes, function(i,item){
                $("#xf_hy").append("<option value="+item.code+">"+item.codeName+"</option> ");
            });
        }
    });

}
//初始化按钮
GAG.ios.xfgl.prototype.initButton = function () {
    var This = this;
    layui.use('layer', function () {
        var $ = layui.jquery,
            layer = layui.layer;
        var active = {
            //查询
            btn_query: function () {
                This.queryAllXfgl();
            },
            //新增
            btn_add: function () {
                var str = "新增";
                This.openXfglDialog(str, "");
                var that = this;
                var addWwdz = layer.open({
                    type: 1,
                    title: "<big>销方管理-新增</big>",
                    area: ['800px', '400px'],
                    shade: [0.6, '#393D49'],
                    shadeClose: false,
                    maxmin: true,
                    resize: true,//是否允许拉伸
                    content: $('#modal-dialog-1'),
                    btn: ['保存', '取消'],//只是为了演示
                    yes: function () {
                        if (This.saveXfgl(str, "")) {
                            This.wwdzAdd(layer, addWwdz);
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
            },
            //修改
            btn_edit: function () {
                var str = "修改";
                var selectRows = $("#xfgl_gridtable").jqGrid("getGridParam", "selarrrow");
                if (selectRows.length != 1) {
                    layer.msg('请选中一行，再进行编辑！', {btn: ['关闭']});
                    return;
                }
                else {
                    var rowData = $("#xfgl_gridtable").jqGrid("getRowData", selectRows[0]);
                    if (rowData.id == "0000") {
                        layer.msg('集团性质,不准许修改！', {zIndex: layer.zIndex});
                        return false;
                    }
                    This.openXfglDialog(str, rowData);
                    var editWwdz = layer.open({
                        type: 1,
                        title: "<big>销方管理-编辑</big>",
                        area: ['800px', '400px'],
                        shade: [0.6, '#393D49'],
                        shadeClose: false,
                        maxmin: true,
                        resize: true,//是否允许拉伸
                        content: $('#modal-dialog-1'),
                        btn: ['保存', '取消'],//只是为了演示
                        yes: function () {
                            if (This.saveXfgl(str, rowData)) {//保存
                                This.wwdzAdd(layer, editWwdz);
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

                var str="查看";
                var selectRows = $("#xfgl_gridtable").jqGrid("getGridParam", "selarrrow");
                if(selectRows.length!=1){
                    layer.msg('请选中一行，再进行查看！', { btn: ['关闭']});
                    return;
                }
                else{
                    var rowData =  $("#xfgl_gridtable").jqGrid("getRowData",selectRows[0]);
                    if(rowData.id == "0000"){
                        layer.msg('集团性质,不准许修改！', {zIndex: layer.zIndex});
                        return false;
                    }
                    This.openXfglDialog(str,rowData);
                    var editWwdz = layer.open({
                        type: 1,
                        title: "<big>查看</big>",
                        area: ['800px','400px'],
                        shade: [0.6, '#393D49'],
                        shadeClose: false,
                        maxmin: true,
                        resize: true,//是否允许拉伸
                        content: $('#modal-dialog-1'),
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
                var selectRows = $("#xfgl_gridtable").jqGrid("getGridParam", "selarrrow");
                if(selectRows.length==0){
                    //layer.msg('请选中一行，再进行删除！', {zIndex: layer.zIndex},{ btn: ['关闭']});
                    layer.msg('请选中一行，再进行删除！', { btn: ['关闭']});
                    return;
                }else if(selectRows.length > 1){
                    layer.msg('暂不支持多条数据删除，请选中一条删除！', { btn: ['关闭']});
                    return;
                }
                else{
                    This.deleteXfDialog();
                    This.queryAllXfgl();
                }
            }

        };
        $('#LAY_demo .layui-btn').on('click', function () {
            var othis = $(this), method = othis.data('method');
            console.log(method);
            active[method] ? active[method].call(this, othis) : '';
        });
    });
}

//供应商税号选择弹框
GAG.ios.xfgl.prototype.openXfglDialog = function (str,rowData) {
    var This = this;
    This.emptyXf();
    if (str == "修改" || str == '查看') {
        This.emptyXf();
        $("#xf_selected").find("input[type = checkbox]").bind("click",function () {
            $('#xf_selected').find('input[type=checkbox]').not(this).attr("checked", false);
        });
        $.ajax({
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            url: window.BASE_API_URL +"sellerInfo/getIndustryInfos.do",
            type: 'post',
            dataType: 'json',
            // data: rowData.id,
            success: function (data) {
                $.each(data.data.industryTypes, function(i,item){
                    $("#add_industry").append("<option value="+item.code+">"+item.codeName+"</option> ");
                });
            }
        })


        $.ajax({
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            url: window.BASE_API_URL +"sellerInfo/queryTaxSellerInfoDetail.do",
            type: 'post',
            dataType: 'json',
            data: {
                id: rowData.id
            },
            success: function (data) {
                var data = data.data;
                $(".search_xf #organId").val(data.deptId);//所属机构id
                $(".search_xf #organName").val(data.deptName);//所属机构名称？
                $(".search_xf #organName").attr("disabled","true");//所属机构名称

                // $("#add_industry option:selected").val(data.industry);//所属行业
                $("#add_industry option[value=" + data.industry +"]").attr("selected","selected");

                $("#xf_name").val(data.sellerName);//销方名称

                $("#duty_name").val(data.sellerTaxNo);//销方税号
                $("#duty_name").attr("disabled","true");//销方税号

                $("#legal_person").val(data.legalPerson);//企业法人
                $("#xf_address").val(data.businessAddress);//企业经营地址
                $("#registered_address").val(data.sellerRegisteredAddress);//企业注册地址
                $("#xf_phone").val(data.telephone);//联系电话
                $("#add_yhzh").val(data.sellerBankAccount);//银行账号
                $("#add_khyh").val(data.sellerBank);//开户银行
                $("#xf_selected input:checkbox[value= "+ data.status + "]").attr("checked","true").parent().siblings().children().removeAttr("checked"); //有效标志
            }

        });
    }
    else if(str == "新增"){

        This.emptyXf();
        $.ajax({
            url : window.BASE_API_URL +"sellerInfo/getIndustryInfos.do",
            type : 'post',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            dataType : 'json',
            success : function(data) {
                $.each(data.data.industryTypes, function(i,item){
                    $("#add_industry").append("<option value="+item.code+">"+item.codeName+"</option> ");
                });
            }
        });
        $("#xf_selected").find("input[type = checkbox]").bind("click",function () {
            $('#xf_selected').find('input[type=checkbox]').not(this).attr("checked", false);
        });
        $("#duty_name").removeAttr("disabled");//销方税号
        $(".search_xf #organName").removeAttr("disabled");
    }
}

GAG.ios.xfgl.prototype.emptyXf = function () {
    $(".search_xf #organId").val("");//所属机构id
    $(".search_xf #organName").val("");//所属
    // $("#add_industry option:selected").val("");//所属行业

    $("#xf_name").val("");//销方名称
    $("#duty_name").val("");//销方税号
    $("#legal_person").val("");//企业法人
    $("#xf_address").val("");//企业经营地址
    $("#registered_address").val("");//企业注册地址
    $("#xf_phone").val("");//联系电话
    $("#add_yhzh").val("");//银行账号
    $("#add_khyh").val("");//开户银行

    $("#add_industry").html("");

    $("#xf_selected option:checked").val("");//有效标志
}

//获取查询参数，只提交有用数据
GAG.ios.xfgl.prototype.getQueryXfMap = function(){
    var rtnMap = {};
    rtnMap["pageIndex"] = 1;
    rtnMap["pageSize"] = 10;
    rtnMap["sellerTaxNo"] = $.trim($("#xfsh").val());
    rtnMap["sellerName"] = $.trim($("#xfmc").val());
    rtnMap["status"] = $.trim($("#select_xf option:selected").val());
    rtnMap["industry"] = $.trim($("#xf_hy option:selected").val());
    return rtnMap;
}

// 查询
GAG.ios.xfgl.prototype.queryAllXfgl =function () {
    var This = this;
    $("#xfgl_gridtable").setGridParam({
        page: 1,
        url: window.BASE_API_URL + "sellerInfo/queryTaxSellerInfoPage.do",
        datatype: "json",
        mtype: "POST",// 提交方式
        postData: This.getQueryXfMap()
    }).trigger("reloadGrid");
}

// 保存数据
GAG.ios.xfgl.prototype.saveXfgl = function(str,rowData){
    var This = this;
    var checkResult = checkAisinoForm("checkForm");
    if (checkResult == false)
        return false;//校验不通过，根据各个框的错误信息进行修改
    //取值
    var xfsh = $(".search_xf #organId").val();//所属机构
    var xfmc = $("#add_industry option:selected").val();//所属行业
    var cz = $("#xf_name").val();//销方名称
    var kpjh = $("#duty_name").val();//销方税号
    var kpdmc = $("#legal_person").val();//企业法人
    var sskpdmc = $("#xf_address").val();//企业经营地址
    var kpdbm = $("#registered_address").val();//企业注册地址
    var jqbh = $("#xf_phone").val();//联系电话
    var yhzh = $("#add_yhzh").val();//银行账号
    var khyh = $("#add_khyh").val();//开户银行
    var yxbz = $("#xf_selected input:checked").val();//有效标志


    var rtnMap = {};
    rtnMap["deptId"] = xfsh;
    rtnMap["industry"] = xfmc;
    rtnMap["sellerName"] = cz;
    rtnMap["sellerTaxNo"] = kpjh;
    rtnMap["legalPerson"] = kpdmc;
    rtnMap["businessAddress"] = sskpdmc;
    rtnMap["sellerRegisteredAddress"] = kpdbm;
    rtnMap["telephone"] = jqbh;
    rtnMap["sellerBankAccount"] = yhzh; //银行账号
    rtnMap["sellerBank"] = khyh; //开户银行
    rtnMap["status"] = yxbz; //有效标志

    if (str == "新增") {
        $.ajax({
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            url: window.BASE_API_URL +"sellerInfo/addTaxSellerInfo.do",
            type: 'post',
            dataType: 'json',
            data: rtnMap,
            success: function (data) {
                if (data.status == 'T') {
                    window.location.href = '/login.html';
                    return;
                }
                layer.msg(data.msg, {zIndex: layer.zIndex});
                This.queryAllXfgl();
            }

        });
        return true;
    }
    else {
        rtnMap["id"] = rowData.id;
        $.ajax({
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            url: window.BASE_API_URL + "sellerInfo/editTaxSellerInfo.do",
            type: 'post',
            dataType: 'json',
            data: rtnMap,
            success: function (data) {
                if (data.status == 'T') {
                    window.location.href = '/login.html';
                    return;
                }
                layer.msg(data.msg, {zIndex: layer.zIndex});
                This.queryAllXfgl();

            }
        });
        return true;
    }

}


/**
 * 删除
 * @return
 */
GAG.ios.xfgl.prototype.deleteXfDialog = function(){
    var This = this;
    var id = $("#xfgl_gridtable").jqGrid("getGridParam","selrow");
    var rowData = $("#xfgl_gridtable").jqGrid("getRowData", id);
    {
        var selectRows = $("#xfgl_gridtable").jqGrid("getGridParam", "selarrrow");
        layer.confirm('确定要删除这 '+ selectRows.length +' 条数据吗？', {icon: 3, title:'删除角色信息提示'},
            function ok(data) {
                $(this).attr("disabled", true);
                var delFlag = false;
                var deleteStr="";
                for(var i=0;i<selectRows.length;i++){
                    var rowData =  $("#xfgl_gridtable").jqGrid("getRowData",selectRows[i]);
                    deleteStr = deleteStr + rowData.id +",";
                }
                deleteStr = deleteStr.substring(0,deleteStr.length-1);
                $.ajax({
                    type:'POST',
                    xhrFields: {
                        withCredentials: true
                    },
                    crossDomain: true,
                    url: window.BASE_API_URL + "sellerInfo/deleteTaxSellerInfo.do",
                    data: {
                        id: selectRows[0]
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
                            This.queryAllXfgl();
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
GAG.ios.xfgl.prototype.wwdzAdd = function(layer,layerId){
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
}