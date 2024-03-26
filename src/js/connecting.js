let model
let head
let content
let language

window.onload = function (){
    getModelDefines()

    language = loadCopyWriting()
    document.title = language['L12']
    head = document.getElementsByClassName('layout-title-head')[0]
    content = document.getElementsByClassName('layout-title-content')[0]
}

/**
 * 获取设备类型
 */
function getModelDefines(){
    let xmlHttp = new XMLHttpRequest()
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200){
            let modelDefines = JSON.parse(xmlHttp.responseText)
            console.log("Get the model name ", modelDefines.model)
            model = modelDefines.model
            head.innerHTML = language['L6'].replace("{0}", model)
            content.innerHTML = language['L7'].replace("{0}", model)
        }
    }
    xmlHttp.open("GET", '/json/configs/model.define.js', true)
    xmlHttp.send(null)
}
