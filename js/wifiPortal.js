let Portal = {
    /**
     * 验证wifi热点
     * @param ssid wifi名
     * @param passwd 密码
     * @param securityType 安全模式
     */
    connectWifi: function (ssid, passwd, securityType) {
        let url = document.location.origin + '/cgi-bin/api-wifi_try_connect'
        url = 'http://192.168.131.190/cgi-bin/api-wifi_connect'  // 测试地址
        console.log('测试地址:', url)
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
