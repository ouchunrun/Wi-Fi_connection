let validation = document.getElementById('validation')
let modeSelect = document.getElementById('safeMode')
let ssidElement = document.getElementById('ssid')
let pwdElement = document.getElementById('pwd')
let wifiTitle = document.getElementById('wifi-title')
let wifiTip = document.getElementById('wifi-tip')
let language

validation.onclick = function(){
    let ssid = ssidElement.value
    let pwd = pwdElement.value

    ssid = ssid?.trim()
    if(!ssid || ssid.length > 32){
        mui.toast(language['L2'],{ duration:'long', type:'div' });
        return;
    }

    pwd = pwd?.trim()
    let pskType = modeSelect.options[modeSelect.selectedIndex].value
    if(Number(pskType) !== 0 && (!pwd || pwd.length < 8 || pwd.length > 32)){
        mui.toast(language['L3'],{ duration:'long', type:'div' });
        return
    }

    let type = modeSelect.options[modeSelect.selectedIndex].value
    connectWifi(ssid, pwd, type)
}

/**
 * 监听下拉选择框该改变事件
 * @type {checkSecurityModeType}
 */
modeSelect.onchange = checkSecurityModeType

/**
 * 监听密码输入
 * @param event
 */
pwdElement.onkeyup = function (event){
    let value = event.target.value
    if(findChinese(value)){
        mui.toast(language['L4'],{ duration:'long', type:'div' });
    }
    // 密码禁止输入中文
    event.target.value = value.replace(/[^\x00-\xff]/g, '')
}

/**
 * 判断是否包含中文
 * @param value
 * @returns {boolean}
 */
function findChinese(value){
    return /.*[\u4e00-\u9fa5]+.*$/.test(value);
}

/**
 * 检查当前安全模式
 */
function checkSecurityModeType(){
    let pskType = modeSelect.options[modeSelect.selectedIndex].value
    if(Number(pskType) === 0){
        // 开放模式下不需要输入密码
        pwdElement.value = ''
        pwdElement.disabled = true
    }else {
        // 其他模式时密码限制为 8-23 位
        pwdElement.disabled = false
    }
}

/**
 * 验证wifi热点
 * @param ssid wifi名
 * @param passwd 密码
 * @param securityType 安全模式
 */
function connectWifi(ssid, passwd, securityType) {
    let url = document.location.origin + '/cgi-bin/api-wifi_try_connect'
    mui.ajax(url, {
        data: {
            ssid: ssid,
            passwd: passwd,
            securityType: parseInt(securityType),
        },
        dataType: 'json',
        type: 'POST',
        timeout: 10000,
        headers: {'Content-Type': 'application/json;charset=UTF-8'},
        success: function (data) {
            console.log('success')
            // mui.toast('success', {duration: 'long', type: 'div'});
            mui.openWindow({url: 'connecting.html', id: 'connecting.html'})
        },
        error: function (xhr) {
            console.error(xhr)
            mui.toast(xhr.status + ' ' + xhr.statusText, {duration: 'long', type: 'div'});
        }
    });
}

window.onload = function (){
    language = loadCopyWriting()
    document.title = language['L12']
    wifiTitle.innerText =  language['L13']
    wifiTip.innerText =  language['L14']
    ssidElement.placeholder = language['L0']
    pwdElement.placeholder = language['L1']
    for(let i = 0; i<modeSelect.options.length; i++){
        let option = modeSelect.options[i]
        switch (option.value){
            case '8':
                option.innerText = language['L8']
                break
            case '0':
                option.innerText = language['L9']
                break
            case '4':
                option.innerText = language['L10']
                break
            case '11':
                option.innerText = language['L11']
                break
            default:
                break
        }
    }

    checkSecurityModeType()
}
