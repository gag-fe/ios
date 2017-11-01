/**
 * Created by xuyanan on 2017/8/29.
 */
GAG.ios.xxfpcx = function () {
    //this.setting ;
    this.colMap ={
        //colNames : ['roleid','jszt','bmid','角色名称','角色id','角色状态','操作','组织机构','角色描述', '创建人', '创建时间'],
        colNames : ['id','发票代码','发票号码','操作','标签','报送状态','报送日志','销方名称','销方税号', '购方名称','购方税号','商品名称','数量','单价','税率','合计金额','合计税额',
            '价税合计','开票日期','销售单据编号','发票服务商'
        ],
        colModel : [
            {name:'id',index:'id', align:'center',width:"0%",hidden:true},
            {name:'invoiceCode',index:'invoiceCode', align:'center',width:"5%",hidden:false},
            {name:'invoiceNo',index:'invoiceNo', width:"5%",align:'center',hidden:false},
            {
                name: '操作',width: '12%', align: 'center', formatter: function (value,gird,rows,state) {
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
            {
                name: '标签',width: '5%', align: 'center', formatter: function (value,gird,rows,state) {
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
            {name:'submitStatus',index:'submitStatus', width:"5%",align:'center',sortable:true,formatter: function (value,gird,rows,state) {
                switch(value){
                    case '0': return '未报送';break;
                    case '1': return '已报送';break;
                    case '2': return '报送失败';break;
                    case '3': return '报送中';break;
                    case '4': return '验签失败';break;
                }
            }},
            {name:'submitLog',index:'submitLog', width:"5%",align:'center',sortable:false},
            {name:'sellerName',index:'sellerName', width:"5%",align:'center',sortable:false},
            {name:'sellerTaxNo',index:'sellerTaxNo', width:"5%",align:'center',sortable:false},
            {name:'custName',index:'custName', width:"5%",align:'center',sortable:false},
            {name:'custTaxNo',index:'custTaxNo', width:"5%",align:'center',sortable:true,formatter:function(cellvalue, options, rowObject){


            }},
            {name:'preTaxAmount',index:'preTaxAmount', width:"5%",align:'center',sortable:true,sortorder:'desc'},
            {name:'preTaxAmount',index:'preTaxAmount', width:"5%",align:'center',sortable:true,sortorder:'desc'},
            {name:'preTaxAmount',index:'preTaxAmount', width:"5%",align:'center',sortable:true,sortorder:'desc'},
            {name:'preTaxAmount',index:'preTaxAmount', width:"5%",align:'center',sortable:true,sortorder:'desc'},
            {name:'preTaxAmount',index:'preTaxAmount', width:"5%",align:'center',sortable:false},
            {name:'taxAmount',index:'taxAmount', width:"5%",align:'center',sortable:false},
            {name:'invoiceAmount',index:'invoiceAmount', width:"5%",align:'center',sortable:false},
            {name:'invoicePrintDate',index:'invoicePrintDate', width:"5%",align:'center',sortable:false,formatter: function (value,gird,rows,state) {
                return new Date(value).Format("yyyy-MM-dd hh:mm:ss");
            }},
            {name:'billId',index:'billId', width:"5%",align:'center',sortable:false},
            {name:'source',index:'source', width:"5%",align:'center',sortable:false,formatter: function(value,gird,rows,state){
                switch(value){
                    case '1': return '百望发票';break;
                    case '2': return '航信发票';break;
                    case '3': return '票通';break;
                }
            }},
        ]};
    //需要放在ready中定义，因为用到了dom pager
    this.defaultGridConfig = {
        ajaxGridOptions: {
            url: window.BASE_API_URL + "queryOutputInvoice/queryInvoiceList.do",
            //type: "post",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true
        },
        //url: window.BASE_API_URL  + "sellerInfo/queryTaxSellerInfoPage.do",
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
            total: "data.total",
            page:"data.pageIndex",
            root: "data.rows",
            repeatitems : true
        },
        pager: '#xxfpcx_pager'
    };
};
GAG.ios.xxfpcx.prototype.init = function () {
    var This = this;
    this.initButton();
    this.searchXf();
    this.queryAllxxfpcx();

    $("#xxfpcx_gridtable").jqGrid(This.defaultGridConfig).trigger('reloadGrid');
    setTimeout(function () {
        window.GAG.ios.common.updatePagerIcons($("#xxfpcx_gridtable"));//加载底部栏图标
    }, 0);
    window.GAG.ios.common.resizeJqGrid("xxfpcx_gridtable");
};

//初始化查询条件
GAG.ios.xxfpcx.prototype.searchXf = function(){
    $("#xfsh").val('');
    $("#xfmc").val('');
    $("#select_xf option:selected").val('');
    $.ajax({
        url : window.BASE_API_URL +"queryOutputInvoice/queryInvoiceList.do",
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

};
//初始化按钮
GAG.ios.xxfpcx.prototype.initButton = function () {
    var This = this;
    layui.use('layer', function () {
        var $ = layui.jquery,
            layer = layui.layer;
        var active = {
            //查询
            btn_query: function () {
                This.queryAllxxfpcx();
            }
        };
        $('#LAY_demo .layui-btn').on('click', function () {
            var othis = $(this), method = othis.data('method');
            console.log(method);
            active[method] ? active[method].call(this, othis) : '';
        });
    });
};
//获取查询参数，只提交有用数据
GAG.ios.xxfpcx.prototype.getQueryXfMap = function(){
    var rtnMap = {};
    rtnMap["pageIndex"] = 1;
    rtnMap["pageSize"] = 10;
    rtnMap["sellerTaxNo"] = $.trim($("#xfsh").val());
    rtnMap["sellerName"] = $.trim($("#xfmc").val());
    rtnMap["status"] = $.trim($("#select_xf option:selected").val());
    rtnMap["industry"] = $.trim($("#xf_hy option:selected").val());
    return rtnMap;
};
// 查询
GAG.ios.xxfpcx.prototype.queryAllxxfpcx =function () {
    var This = this;
    $("#xxfpcx_gridtable").setGridParam({
        page: 1,
        url: window.BASE_API_URL + "sellerInfo/queryTaxSellerInfoPage.do",
        datatype: "json",
        mtype: "POST",// 提交方式
        postData: This.getQueryXfMap()
    }).trigger("reloadGrid");
};
/*
 * 运行中提示
 */
GAG.ios.xxfpcx.prototype.wwdzAdd = function(layer,layerId){
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