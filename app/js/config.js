/**
 * 
 * @authors ${author} (duke 365650070@qq.com)
 * @date    2017-08-09 11:21:00
 * @version $Id$
 */

window.GAG = {};
window.GAG.ios = {};
window.GAG.ios.userData = {};
window.GAG.ios.common = {};
window.GAG.ios.tool = {};

if (window.location.hash.indexOf('gooagoo.com') > 0) {
    window.gooagoodomain = '.gooagoo.com';
} else if (window.location.hash.indexOf('test.goago.cn') > 0) {
    window.gooagoodomain = '.test.goago.cn';
} else if (window.location.hash.indexOf('pressure.goago.cn') > 0) {
    window.gooagoodomain = '.pressure.goago.cn';
} else {
    window.gooagoodomain = '.dev.goago.cn';
}
window.BASE_API_URL = 'http://vat' + window.gooagoodomain + "/vat/";
