// 1.取流，获取相机权限
let Scanner = {
    mobile: true,
    errorMessage: '',
    showPlay: false,
    parity: 0,
    previousCode: '',
    active: false,
    useBackCamera: true,  // 默认后置摄像头
    stopOnScanned: true,   // 扫描识别后停止
    drawOnFound: true,
    lineColor: '#03C03C',  // 线条颜色
    lineWidth: 2, // 线条宽度
    scanned: '', // 扫描结果
    containerWidth: null, // 视频宽度
    containerHeight: null,  // 视频高度
    responsive: false,

    video: null,
    canvas: null,
    canvasContext: null,
    outputContainer: null,

    /**
     * 初始化
     */
    init: function (){
        this.canvas = document.getElementById("scan-canvas")
        this.outputContainer = document.getElementById("output")

        let scannerElement = document.getElementsByClassName('scaner')[0]
        this.containerWidth = scannerElement.clientWidth
        this.containerHeight = scannerElement.clientHeight
        console.log(`container size: ${this.containerWidth} * ${this.containerHeight}`)

        let closeElement = document.getElementsByClassName('close_icon')[0]
        closeElement.onclick = function (){
            console.log('close tip')
            closeElement.parentElement.remove();
        }

        console.log('start gum')
        Scanner.gum()
    },

    /**
     * 获取摄像机权限
     */
    gum: function (){
        let str = navigator.userAgent.toLowerCase();
        let ver = str.match(/cpu iphone os (.*?) like mac os/);
        if (ver && ver[1].replace(/_/g,".") < '10.3.3') {
            console.warn('相机调用失败');
            mui.toast("The camera call failed", {duration: 'long', type: 'div'});
            return
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            this.previousCode = null;
            this.stopOnScanned = false
            this.active = true;
            this.canvasContext = this.canvas.getContext("2d")
            const facingMode = Scanner.useBackCamera ? { exact: 'environment' } : 'user';
            let constraints = {
                audio: false,
                video: true,
            }
            if(Scanner.mobile){
                constraints.video = {
                    facingMode
                }
            }
            navigator.mediaDevices.getUserMedia(constraints)
                .then(Scanner.handleGumSuccess)
                .catch(() => {
                    navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: true
                    })
                        .then(Scanner.handleGumSuccess)
                        .catch(error => {
                            Scanner.errorCaptured(error)
                        });
                });
        }
    },

    /**
     * 取流成功，设置video，canvas和截图
     * @param stream
     */
    handleGumSuccess: function (stream){
        console.log('get stream success')
        let video = document.getElementById('scan-video')
        if (video.srcObject !== undefined) {
            video.srcObject = stream;
        } else if (window.mozSrcObject !== undefined) {
            video.mozSrcObject = stream;
        } else if (window.URL.createObjectURL) {
            video.src = window.URL.createObjectURL(stream);
        } else if (window.webkitURL) {
            video.src = window.webkitURL.createObjectURL(stream);
        } else {
            video.src = stream;
        }
        Scanner.video = video
        video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        video.play();

        if(Scanner.active){
            requestAnimationFrame(Scanner.tick);
        }else {
            console.warn('扫描结束。。。')
        }
    },

    /**
     * 相机访问失败处理
     * @param error
     */
    errorCaptured: function (error){
        switch (error.name) {
            case "NotAllowedError":
                this.errorMessage = "Camera permission denied.";
                break;
            case "NotFoundError":
                this.errorMessage = "There is no connected camera.";
                break;
            case "NotSupportedError":
                this.errorMessage =
                    "Seems like this page is served in non-secure context.";
                break;
            case "NotReadableError":
                this.errorMessage = "Couldn't access your camera. Is it already in use?";
                break;
            case "OverconstrainedError":
                this.errorMessage = "Constraints don't match any installed camera.";
                break;
            default:
                this.errorMessage = "UNKNOWN ERROR: " + error.message;
        }
        console.error(this.errorMessage);
        console.warn('相机调用失败');
        mui.toast(this.errorMessage, {duration: 'long', type: 'div'});
    },

    /**
     * 识别扫描二维码
     */
    tick: function (){
        let This = Scanner
        if (This.video && This.video.readyState === This.video.HAVE_ENOUGH_DATA) {
            This.canvas.width = This.containerWidth
            This.canvas.height = This.containerHeight
            This.canvasContext.drawImage(This.video, 0, 0, This.canvas.width, This.canvas.height);
            const imageData = This.canvasContext.getImageData(0, 0, This.canvas.width, This.canvas.height);
            let code = false;
            try {
                code = jsQR(imageData.data, imageData.width, imageData.height);
            } catch (e) {
                console.error(e);
                mui.toast(e, {duration: 'long', type: 'div'});
            }
            if (code) {
                This.drawBox(code.location);
                This.found(code.data);
            }
        }
        requestAnimationFrame(This.tick);
    },

    /**
     * 画框
     */
    drawBox: function (location){
        if (this.drawOnFound) {
            this.drawLine(location.topLeftCorner, location.topRightCorner);
            this.drawLine(location.topRightCorner, location.bottomRightCorner);
            this.drawLine(location.bottomRightCorner, location.bottomLeftCorner);
            this.drawLine(location.bottomLeftCorner, location.topLeftCorner);
        }
    },

    /**
     * 画线
     * @param begin
     * @param end
     */
    drawLine: function (begin, end){
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(begin.x, begin.y);
        this.canvasContext.lineTo(end.x, end.y);
        this.canvasContext.lineWidth = this.lineWidth;
        this.canvasContext.strokeStyle = this.lineColor;
        this.canvasContext.stroke();
    },

    found: function (code){
        if (this.previousCode !== code) {
            this.previousCode = code;
        } else if (this.previousCode === code) {
            this.parity += 1;
        }
        if (this.parity > 2) {
            this.active = !this.stopOnScanned;
            console.log('this.active：', this.active)
            this.parity = 0;
            this.codeScanned(code)
            this.fullStop();  // 停止扫描
        }
    },

    /**
     * 扫描完成的处理时间
     * @param code
     */
    codeScanned: function (code){
        console.log('扫描成功')
        this.scanned = code;
        setTimeout(() => {
            mui.toast(`scan success: ${code}`, {duration: 'long', type: 'div'});
            // 返回上一页并自动填充扫描值

            let view = plus.webview.getWebviewById("connection")
            mui.fire(view, 'doit', {inputVal: code});
            mui.back()
        }, 200)
    },

    /**
     * 停止video stream
     */
    fullStop: function (){
        console.log('full stop: close stream')
        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(t => t.stop());
        }
        this.stopOnScanned = true
    },

    isMobile: function (){
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}

window.onload = function (){
    console.log('window onload')
    Scanner.mobile = Scanner.isMobile()
    if (Scanner.mobile) {
        console.log("mobile");
    } else {
        console.log("pc");
    }
    Scanner.init()
}

mui.init({});


if(window.plus){
    plusReady();
}else{
    document.addEventListener("plusready",plusReady,false);
}
function plusReady(){
    mui("body").on("tap",".jump",function(){
        let view = plus.webview.getWebviewById("connection")
        mui.fire(view, 'doit', {inputVal: Scanner.scanned});
        mui.back()

    })
}
