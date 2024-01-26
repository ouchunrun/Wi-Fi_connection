
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
	Portal.connectWifi(ssid, pwd, type)
}

