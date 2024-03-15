let validation = document.getElementById('validation')
let authenticationSelect = document.getElementById('authenticationSelect')
let ssidElement = document.getElementById('ssid')
let pwdElement = document.getElementById('pwd')

let scanQRButton = document.getElementById('scanQR')
scanQRButton.onclick = function (){
    mui.openWindow({
        url: 'scan.html',
        id: 'scan.html',
    })

    if(mui.os.ios){
        // Todo: ios safari 隐藏密码后扫描二维码，密码无法自动填充！
        pwdElement.type = 'text'
        let visibilityChange = document.getElementsByClassName('mui-icon mui-icon-eye')[0]
        visibilityChange.classList.add('mui-active')
    }
}

validation.onclick = function(){
    let ssid = ssidElement.value
    let pwd = pwdElement.value

    ssid = ssid?.trim()
    if(!ssid || ssid.length > 32){
        mui.toast('Please enter 1~32 digit SSID',{ duration:'long', type:'div' });
    }

    pwd = pwd?.trim()
    if(!pwd || pwd.length < 8 || pwd.length > 32){
        mui.toast('Please enter 8~32 digit password',{ duration:'long', type:'div' });
        return
    }

    let type = authenticationSelect.options[authenticationSelect.selectedIndex].value
    connectWifi(ssid, pwd, type)
}

/**
 * 监听下拉选择框该改变事件
 * @type {checkSecurityModeType}
 */
authenticationSelect.onchange = checkSecurityModeType

/**
 * 监听密码输入
 * @param event
 */
pwdElement.onkeyup = function (event){
    let value = event.target.value
    if(findChinese(value)){
        mui.toast('Chinese password is not supported',{ duration:'long', type:'div' });
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
    let target = authenticationSelect
    let pskType = target.options[target.selectedIndex].value
    if(Number(pskType) === 0){
        // 开放模式下不需要输入密码
        // pwdElement.value = ''
        pwdElement.disabled = true
        console.log('disabled password input')
    }else {
        // 其他模式时密码限制为 8-23 位
        pwdElement.disabled = false
        console.log('enabled password input')
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
            mui.toast('success', {duration: 'long', type: 'div'});
        },
        error: function (xhr, type, errorThrown) {
            console.error('error type:', type)
            console.error('error errorThrown:', errorThrown)
            mui.toast(type, {duration: 'long', type: 'div'});
        }
    });
}

/**
 * 处理扫描获取二维码数据
 * @param QRCode
 */
function parseQRCode(QRCode){
    if(QRCode) {
        try {
            let list = QRCode.slice(QRCode.indexOf(':') + 1).split(';')
            list.forEach(function (data) {
                if(data){
                    let value = data.split(':')[1]
                    if (data.startsWith('S:')) {   // SSID
                        ssidElement.value = value
                    } else if (data.startsWith('P:')) {  // 密码
                        //  iOS Safari 已知问题：为了保护用户的隐私安全，使用 JavaScript 设置 <input type="password"> 元素的值是无效的。
                        pwdElement.type = 'text'
                        pwdElement.value = value
                        pwdVisibilityChange(true)
                    } else if (data.startsWith('T:')) {  // 加密方式
                        console.log('security type: ', value)
                    }else if (data.startsWith('H:')) {  // 网络是否隐藏
                        console.log('network hide ?', value)
                    }
                }
            })
        }catch (e){
            console.error('QRcode parsed error:', e)
        }
    }else {
        console.log('QRCode is empty!')
    }
}

/**
 * 切换密码显示和隐藏
 * @param visible
 */
function pwdVisibilityChange(visible){
    console.log('set password visible ', visible)
    let visibilityChange = document.getElementsByClassName('mui-icon mui-icon-eye')[0]
    if(visible){
        pwdElement.type = 'text' // default show password
        visibilityChange.classList.add('mui-active')
    }else {
        pwdElement.type = 'password'
        visibilityChange.classList.remove('mui-active')
    }
}

/**
 * 监听页面变化，自动填充页面扫描值
 */
document.addEventListener('visibilitychange', function() {
    let isHidden = document.hidden;
    console.log(`document visibilityState is ${document.visibilityState}`)
    if (isHidden) {
        sessionStorage.setItem('QRCode', '')
    } else {
        let QRCode = sessionStorage.getItem('QRCode')
        parseQRCode(QRCode)
        pwdVisibilityChange(true)
    }
})

window.onload = function (){
    let QRCode = sessionStorage.getItem('QRCode')
    if(QRCode){
        parseQRCode(QRCode)
    }
    pwdVisibilityChange(true)
    checkSecurityModeType()
}
