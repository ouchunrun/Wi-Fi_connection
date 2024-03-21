/**
 * 页面文案显示
 */
function loadCopyWriting(){
    const preLocalLang = localStorage.getItem('grpLocale')
    console.log('get pre local lang: ' + preLocalLang)
    // 获取当前浏览器设置的语言
    let userLanguage = navigator.language || navigator.userLanguage;
    console.log("The language of the current browser setting is:" + userLanguage);
    let localLang = preLocalLang || userLanguage
    if (localLang?.indexOf('en') >= 0) {
        localLang = 'en-US'
    } else if (localLang?.indexOf('zh') >= 0) {
        localLang = 'zh-CN'
    } else {
        // default en-US
        localLang = 'en-US'
    }
    console.log('The browser\'s current locale is：', localLang)
    let language = window.GRP_LOCALES[localLang]
    console.log('language:', language)
    return language
}
