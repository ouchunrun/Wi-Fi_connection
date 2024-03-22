
## Reference

### 多语言配置

* localstorage 配置项如下
```js
localStorage.setItem('grpLocale', 'en-US') 
localStorage.setItem('grpLocale', 'zh-CN')  
```

* 目前仅支持中英文设置，默认显示英文。

### 登录处理

* Wi-Fi名称输入框，1-32位，string型
* Wi-Fi密码输入框，0/8-32位，string型
* 安全模式选择：枚举包括
  * 自动: 密码范围为0或8-32位
  * 开放: 不需要密码
  * WPA2 (默认):校验8-32位密码
  * WPA3: 校验8-32位密码

* Toast 提示：
  * 网络名称未填时，Toast提示【请填写网络名称】
  * 密码必填时，Toast提示【请填写密码】
  * 网络名或密码错误时，Toast提示【网络名称或密码错误】
  * 其他请求错误时，Toast提示【请求错误】

### ~~jsQR~~

* github: https://github.com/cozmo/jsQR
* 在线体验：https://dragonir.github.io/h5-scan-qrcode
* Copyright: 遵循Apache License 2.0 (https://github.com/cozmo/jsQR/blob/master/LICENSE)
* ~~扫码功能: captive.apple.com 页面通常是用于认证Wi-Fi网络的登录页面，不具有访问相机权限的功能。无法调用相机进行扫码，故不支持扫码功能。~~

### mui

* github: https://github.com/dcloudio/mui
* 参考文档：https://dev.dcloud.net.cn/mui/ui/
* Copyright: mui遵循MIT License (https://github.com/dcloudio/mui/blob/master/LICENSE)

