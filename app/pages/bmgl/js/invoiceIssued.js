GAG.ios.invoiceIssued = function() {

};

GAG.ios.invoiceIssued.prototype.init = function() {
  this.getMsg();
  this.issued();
};
//默认查询显示列表
GAG.ios.invoiceIssued.prototype.getMsg = function() {
  // var This = this;
  $.ajax({
      url: window.BASE_API_URL + '/ptInvoiceAction/getBlueInvoicePage',
      type: 'POST',
      dataType: 'JSON',
      data: {
        shopEntityId: 'shopEntityId'
      },
    })
    .done(function(back) {
      if (back.status == 'S') {
        var back = {
          data: {
            blueInvoiceDetail: {
              shopId: 111, //机构id
              shopEntityId: 222, //实体店id
              invoiceSurplusNum: 333, //剩余发票数
              invoiceAmount: 444, //价税合计总金额
              caseInvoiceAmount: "叁千叁佰叁拾叁圆整", //大写价税合计总金额
              qymc: "北京购阿购技术服务有限公司", //销售方名称
              compTaxpayerId: 555555555, //纳税人识别号
              xhfYh: "招商银行（北京市朝阳区望京支行）", //销售方银行
              xhfYhzh: 6223123132138921, //销售银行账号
              xhfDz: "朝阳区利泽中二路望京科技创业园B座", //销售方地址
              xhfDh: "13876541234", //销售方电话
              kpy: "项羽", //开票人
            },
            //发票项目
            invoiceItems: [{
              code: "住宿费", //发票项目
              codeName: "0.06", //发票税率
              note: "数目", //发票项目编码
            }, {
              code: "交通费", //发票项目
              codeName: "0.03", //发票税率
              note: "数目", //发票项目编码
            }, {
              code: "餐饮费", //发票项目
              codeName: "0.02", //发票税率
              note: "数目", //发票项目编码
            }, {
              code: "管理费", //发票项目
              codeName: "0.01", //发票税率
              note: "数目", //发票项目编码
            }]
          }
        }
      };
    });
};

//开具保存
GAG.ios.invoiceIssued.prototype.issued = function() {

};