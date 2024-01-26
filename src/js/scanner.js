// 1.取流，获取相机权限
let Scanner = {
    showPlay: false,
    useBackCamera: true,  // 默认后置摄像头
    lineColor: '#03C03C',
    drawOnFound: true,
    scanned: '', // 扫描结果
    containerWidth: null,
    containerHeight: null,

    video: null,
    canvas: null,
    canvasContext: null,
    outputContainer: null,

    /**
     * 初始化
     */
    init: function (){
        this.canvas = document.getElementById("scan-canvas")
        this.canvasContext = this.canvas.getContext("2d")
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
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            const facingMode = Scanner.useBackCamera ? { exact: 'environment' } : 'user';
            navigator.mediaDevices
                .getUserMedia({ video: { facingMode } })
                .then(Scanner.handleGumSuccess)
                .catch(() => {
                    navigator.mediaDevices
                        .getUserMedia({ video: true })
                        .then(Scanner.handleGumSuccess)
                        .catch(error => {
                            console.error(error)
                            mui.toast(error, {duration: 'long', type: 'div'}); // 这里的提示不对
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

        requestAnimationFrame(Scanner.tick);
    },

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
            }
            if (code) {
                This.drawBox(code.location);

                This.codeScanned(code.data)
                // This.found(code.data);
            }
        }
        requestAnimationFrame(This.tick);
    },

    /**
     * 画框
     */
    drawBox: function (){
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
        this.canvas.beginPath();
        this.canvas.moveTo(begin.x, begin.y);
        this.canvas.lineTo(end.x, end.y);
        this.canvas.lineWidth = this.lineWidth;
        this.canvas.strokeStyle = this.lineColor;
        this.canvas.stroke();
    },

    found: function (code){
        if (this.previousCode !== code) {
            this.previousCode = code;
        } else if (this.previousCode === code) {
            this.parity += 1;
        }
        if (this.parity > 2) {
            this.parity = 0;
            this.codeScanned(code)
        }
    },

    codeScanned: function (code){
        this.scanned = code;
        setTimeout(() => {
            mui.toast(`扫码解析成功: ${code}`, {duration: 'long', type: 'div'});
            // 返回上一页并自动填充扫描值


        }, 200)
    },
}


window.onload = function (){
    console.log('window onload')
    Scanner.init()
}

mui.init({});
