let validation = document.getElementById('validation')
let modeSelect = document.getElementById('safeMode')
let ssidElement = document.getElementById('ssid')
let pwdElement = document.getElementById('pwd')
let wifiTitle = document.getElementById('wifi-title')
let wifiTip = document.getElementById('wifi-tip')
let language

const WIFI_PSK_TYPES = {
    WIFI_PSK_AUTO: 8,
    WIFI_PSK_OPEN: 0,
    WIFI_PSK_WPA2: 4,
    WIFI_PSK_WPA3: 11,
}

/**
 * 动态创建PSK option 列表
 */
function createPSKOptions(){
    Object.keys(WIFI_PSK_TYPES).forEach(function (key){
        let option = document.createElement('option')
        let id = WIFI_PSK_TYPES[key]
        option.id = id
        switch (id){
            case WIFI_PSK_TYPES.WIFI_PSK_AUTO:
                option.innerText = language['L8']
                break
            case WIFI_PSK_TYPES.WIFI_PSK_OPEN:
                option.innerText = language['L9']
                break
            case WIFI_PSK_TYPES.WIFI_PSK_WPA2:
                option.innerText = language['L10']
                option.selected = true
                break
            case WIFI_PSK_TYPES.WIFI_PSK_WPA3:
                option.innerText = language['L11']
                break
            default:
                break
        }
        modeSelect.appendChild(option)
    })
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
 * 输入验证和请求
 */
validation.onclick = function(){
    let ssid = ssidElement.value
    let pwd = pwdElement.value
    let selectOption = modeSelect.options[modeSelect.selectedIndex]
    let PSKId = Number(selectOption.id)

    ssid = ssid?.trim()
    pwd = pwd?.trim()
    if(!ssid){
        mui.toast(language['L2'],{ duration:'long', type:'div' });
        return;
    }

    // 开放: 不需要密码  自动: 密码范围为0或8-32位
    if(!pwd && PSKId !== WIFI_PSK_TYPES.WIFI_PSK_OPEN && PSKId !== WIFI_PSK_TYPES.WIFI_PSK_AUTO){
        mui.toast(language['L3'],{ duration:'long', type:'div' });
        return
    }
    // Wi-Fi名称: 1-32位
    if(ssid.length > 32){
        mui.toast(language['L15'],{ duration:'long', type:'div' });
        return;
    }

    if(PSKId === WIFI_PSK_TYPES.WIFI_PSK_OPEN || (PSKId === WIFI_PSK_TYPES.WIFI_PSK_AUTO && !pwd)){

    }else if(pwd.length < 8 || pwd.length > 32){  // WPA2、WPA3:校验8-32位密码
        mui.toast(language['L15'],{ duration:'long', type:'div' });
        return
    }

    connectWifi(ssid, pwd, PSKId)
}

/**
 * 监听下拉选择框该改变事件
 * @type {checkSecurityModeType}
 */
modeSelect.onchange = checkSecurityModeType

/**
 * 检查当前安全模式
 * 自动时校验密码范围为0 或 8-32位
 * 开放时不需要密码
 * WPA2、WPA23需要校验8-32位密码
 */
function checkSecurityModeType(){
    let selectOption = modeSelect.options[modeSelect.selectedIndex]
    if(Number(selectOption.id) === WIFI_PSK_TYPES.WIFI_PSK_OPEN){
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
            console.log('wifi try connect response data: ', data)
            if(data && data.reason && data.reason.toUpperCase() === 'OK'){
                console.log('request success')
                mui.openWindow({url: 'connecting.html', id: 'connecting.html'})
            }else {
                console.error('request error')
                mui.toast(language['L16'],{ duration:'long', type:'div' });
            }
            validation.disabled = false
        },
        error: function (xhr) {
            console.error(xhr)
            mui.toast(language['L16'],{ duration:'long', type:'div' });
            validation.disabled = false
        }
    })
    validation.disabled = true
}

window.onload = function (){
    language = loadCopyWriting()
    document.title = language['L12']
    wifiTitle.innerText =  language['L13']
    wifiTip.innerText =  language['L14']
    ssidElement.placeholder = language['L0']
    pwdElement.placeholder = language['L1']

    createPSKOptions()
    checkSecurityModeType()
}
