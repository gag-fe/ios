GAG.ios.ssfl = function () {
    //全局变量
    // this.jgjcsz = 4;//机构级次设置，增加机构，最低可增加的级次，默认为0（不限）
    // this.bmjc_0 = 0;//机构级次的初始值，在修改机构时用到
    // this.str = "1234";
    this.colMap = {
        colNames: ['编码', '合并编码', '名称', '税率', '增值税特殊管理', '是否汇总项', '是否隐藏', '编码表版本号'],
        colModel: [
            {name: 'code', index: 'code', width: '10',align: 'center', sortable: false, hidden: false},
            {name: 'mergeCode', index: 'mergeCode', width: '15%', align: 'center', sortable: false},
            {name: 'name', index: 'name', width: '15%', align: 'center', sortable: false},
            {name: 'taxRate', index: 'taxRate', width: '12%', align: 'center', sortable: false,formatter: function (value,gird,rows,state){
                return value * 100 + '%';
            }
            },
            {name: 'specialManage', index: 'specialManage', width: '10%', align: 'center', sortable: false},
            {name: 'isSumItem', index: 'isSumItem', width: '10%', align: 'center', sortable: false,formatter(cellvalue, options, rowObject){
                if(cellvalue == "Y"){
                    return "是"
                }
                else if(cellvalue == "N"){
                    return "否"
                }
            }},
            {name: 'isHide', index: 'isHide', width: '10%', align: 'center', sortable: false,formatter(cellvalue, options, rowObject){
                if(cellvalue == "1"){
                    return "是"
                }
                else if(cellvalue == "0"){
                    return "否"
                }
            }},
            {name: 'versionNum', index: 'versionNum', width: '10%', align: 'center', sortable: false}



        ]
    };
    //需要放在ready中定义，因为用到了dom pager
    this.defaultGridConfig = {
        ajaxGridOptions: {
            url: window.BASE_API_URL +"categoryCodeInfo/queryTaxCategoryCodeInfoPage.do",
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
            root: "data.rows",
            // total: 'data.total',
            page: "data.pageIndex", //初始页码
            total: function (obj) {
                return Math.ceil(obj.data.total/obj.data.pageSize);
            },
            records:'data.total',
            repeatitems: false,
        },
        pager: '#ssgl_pager'
    };
};
GAG.ios.ssfl.prototype.init = function () {
    var This = this;
    this.initButton();
    initAisinoCheck("checkForm");//初始化这个form的校验

    $("#ssgl_gridtable").jqGrid(This.defaultGridConfig).trigger('reloadGrid');
    setTimeout(function () {
        window.GAG.ios.common.updatePagerIcons($("#ssgl_gridtable"));//加载底部栏图标
    }, 0);
    window.GAG.ios.common.resizeJqGrid("ssgl_gridtable");
};
GAG.ios.ssfl.prototype.initButton = function (){
    var This = this;
    layui.use('layer',function(){
        var $ = layui.jquery,
            layer = layui.layer;
        var active = {
            //查询
            btn_query: function(){
                This.queryAllSsgl();
            },
        };
        $('#LAY_demo .layui-btn').on('click', function(){
            var othis = $(this), method = othis.data('method');
            console.log("sssss",method);
            active[method] ? active[method].call(this, othis) : '';
        });
    });
}

/**
 * 查询
 * @return
 */
GAG.ios.ssfl.prototype.queryAllSsgl = function () {

    $("#ssgl_gridtable").setGridParam({
        page: 1,
        url: window.BASE_API_URL +"categoryCodeInfo/queryTaxCategoryCodeInfoPage.do",
        datatype: "json",
        mtype: "POST",// 提交方式
        postData: this.getQuerySsMap()
    }).trigger("reloadGrid");
};
//获取查询参数，只提交有用数据
GAG.ios.ssfl.prototype.getQuerySsMap = function () {
    var rtnMap = {};
    // rtnMap["page"] = 1;
    // rtnMap["rows"] = 10;
    rtnMap["mergeCode"] = $.trim($("#merge_encoding").val());
    rtnMap["name"] = $.trim($("#good_name").val());
    rtnMap["taxRate"] = $.trim($("#tax_rate option:selected").val());
    rtnMap["isSumItem"] = $.trim($("#gather option:selected").val());
    return rtnMap;
};

