let WIFIPortal = {
    /**
     * 验证wifi热点
     * @param ssid wifi名
     * @param passwd 密码
     * @param securityType 安全模式
     */
    connectWifi: function (ssid, passwd, securityType) {
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
    },
}


let validation = document.getElementById('validation')
let authenticationSelect = document.getElementById('authenticationSelect')
let ssid
let pwd
validation.onclick = function(){
    ssid = document.getElementById('ssid').value
    pwd = document.getElementById('pwd').value

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
    WIFIPortal.connectWifi(ssid, pwd, type)
}

let scanQRButton = document.getElementById('scanQR')
scanQRButton.onclick = function (){
    mui.openWindow({
        url: 'scan.html',
        id: 'scan.html',
    })
}


//返回回来要执行的方法
function fun1(e){
    var val=e.detail.inputVal
    console.log('扫描后返回来的值：', val)
    // ssid.value = val
}
//自定义窗体事件  doit 要和b页面定义的 事件名称一致
window.addEventListener('doit',fun1);
