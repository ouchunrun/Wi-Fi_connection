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
}

validation.onclick = function(){
    let ssid = ssidElement.value
    let pwd = pwdElement.value

    ssid = ssid?.trim()
    if(!ssid){
        mui.toast('Please enter SSID',{ duration:'long', type:'div' });
        return
    }
    pwd = pwd?.trim()
    if(!pwd){
        mui.toast('Please enter password',{ duration:'long', type:'div' });
        return
    }
    let type = authenticationSelect.options[authenticationSelect.selectedIndex].value
    connectWifi(ssid, pwd, type)
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
            "ssid": ssid,
            "passwd": passwd,
            "securityType": securityType,
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
                        // pwdElement.classList.remove('mui-input-password')
                        // pwdElement.classList.add('mui-input-clear')

                        pwdElement.value = value

                        // pwdElement.type = 'password'
                        // pwdElement.classList.remove('mui-input-clear')
                        // pwdElement.classList.add('mui-input-password')
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
        // 默认显示密码
        pwdElement.type = 'text'
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
    pwdVisibilityChange(true)
}

// window.addEventListener('refresh', function(e) {
//     console.warn('refresh')
//     alert('page refresh')
//     //在父页面中添加监听事件，刷新页面
//     let QRCode = e.newValue
//     console.warn('refresh QRCode:', QRCode)
//     alert('refresh code:', QRCode)
//     parseQRCode(QRCode)
// });
//
//
// window.addEventListener('load', function (){
//     console.log('load....')
//     let QRCode = sessionStorage.getItem('QRCode')
//     console.warn('load QRCode:', QRCode)
//     alert('load code:', QRCode)
//     parseQRCode(QRCode)
//     sessionStorage.setItem('QRCode', '')
// })

