let validation = document.getElementById('validation')
let authenticationSelect = document.getElementById('authenticationSelect')
let ssidElement = document.getElementById('ssid')
let pwdElement = document.getElementById('pwd')
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
    // url = 'http://192.168.131.190/cgi-bin/api-wifi_connect'  // 测试地址
    // console.log('测试地址:', url)
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

let scanQRButton = document.getElementById('scanQR')
scanQRButton.onclick = function (){
    mui.openWindow({
        url: 'scan.html',
        id: 'scan.html',
    })
}

window.addEventListener('refresh', function(e) {
    console.warn('refresh')
    alert('page refresh')
//在父页面中添加监听事件，刷新页面
    location.reload();
});


window.addEventListener('load', function (){
    let QRCode = sessionStorage.getItem('QRCode')
    console.warn('QRCode:', QRCode)
    if(QRCode) {
        let list = QRCode.slice(QRCode.indexOf(':') + 1).split(';')
        list.forEach(function (data) {
            console.log('data:', data)
            let value = data.split(':')[1]
            if (data.startsWith('S:')) {   // SSID
                ssidElement.value = value
            } else if (data.startsWith('P:')) {  // 密码
                pwdElement.value = value
            } else if (data.startsWith('T:')) {  // 加密方式
                console.log('security type: ', value)
            }
            if (data.startsWith('H:')) {  // 网络是否隐藏
                console.log('network hide ?', value)
            }
        })
    }
    sessionStorage.setItem('QRCode', '')
})
