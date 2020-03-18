// ==UserScript==
// @name         天使动漫辅助
// @namespace    http://tampermonkey.net/
// @version      0.1.7
// @description  提供了一些便利的发帖和管理功能，持续更新中，需要更多功能请私信联系あおば (UID: 1639751)
// @author       Aoba xu
// @match        https://www.tsdm.live/*
// @grant        GM_xmlhttpRequest
// @connect      sm.ms
// @connect      www.52loli.top
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';
    // 1. 帖子预览页面增加 PID 显示
    // 2. 复制链接非使用原生功能(仅测试 Chromium 系浏览器，理论上通用)
    if (/mod=viewthread/.test(location.href) && /tid=\d+/.test(location.href)) {
        document.querySelectorAll("[id^=pid]").forEach((item, key, parent) => {
            var pidLabel = document.createElement("em");
            pidLabel.innerText = item.id.replace("pid", "PID: ");
            item.querySelector(".authi").appendChild(pidLabel);
        });
        document.querySelector(".xw0.xs1.xg1>a:last-child").onclick = () => {
            var link = document.querySelector(".xw0.xs1.xg1>a.thread_hidden");
            var copyBox = document.createElement("textarea");
            copyBox.value = link.innerHTML + "\n" + link.href;
            document.body.appendChild(copyBox);
            copyBox.select();
            document.execCommand("Copy");
            document.body.removeChild(copyBox);
            alert("复制成功");
            return false;
        };
        document.querySelectorAll(".pi>strong>a").forEach((item, key, parent) => {
            item.onclick = () => {
                var copyBox = document.createElement("textarea");
                copyBox.value = item.href;
                document.body.appendChild(copyBox);
                copyBox.select();
                document.execCommand("Copy");
                document.body.removeChild(copyBox);
                alert("复制成功");
                return false;
            };
        });
    }

    // 1. 帖子发帖时缩放图像大小功能（仅限外链图片）
    // 2. 增加图床上传功能，感谢 vizv
    if (/mod=post|mod=viewthread|mod=forumdisplay/.test(location.href)) {
        var isAdvance = /mod=post/.test(location.href);

        var autoResizeBtn = document.createElement("a");
        autoResizeBtn.href = "javascript:;";
        autoResizeBtn.id = isAdvance ? "autoresize-btn" : "autoresize-btn-end";
        autoResizeBtn.title = "一键缩放图片";
        autoResizeBtn.innerText = "一键缩放图片";
        autoResizeBtn.style.background = "none";
        autoResizeBtn.style.lineHeight = "20px";
        autoResizeBtn.addEventListener("click", (e) => {
            var imgUrlReg = /(?:\[img(?:\]|=\d+,\d+\])|)(http(?:s|):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+\.(?:bmp|jpg|jpeg|gif|png|tif|tiff|svg|webp)(?:[-A-Za-z0-9+&@#/%?=~_|]+|))(?:\[\/img\]|)/gi;
            var imgCount = 0;
            var btnId = e.target.id;
            var textareaId = btnId == "autoresize-btn" ? "e_textarea" : btnId == "autoresize-btn-end" ? "fastpostmessage" : "postmessage";
            document.getElementById(textareaId).value.replace(imgUrlReg, (all, imgUrl) => {
                imgCount++;
                var readImage = new Image();
                readImage.onload = () => {
                    var h = readImage.height;
                    var w = readImage.width;
                    if (w > 712) {
                        h = Math.round(readImage.height / (w / 712));
                        w = 712;
                    }
                    document.getElementById(textareaId).value = document.getElementById(textareaId).value.replace(all, `[img=${w},${h}]${readImage.src}[/img]`);
                    imgCount--;
                    if (imgCount == 0) {
                        alert("全部缩放完成");
                    }
                };
                readImage.onerror = () => {
                    if (readImage.src.match("https:")) {
                        readImage.src = readImage.src.replace("https:", "http:");
                    }
                    else {
                        alert(readImage + "中的图片转换失败，可能是网络问题请重试");
                    }
                };
                readImage.src = imgUrl;
                return "";
            });

        });
        if (isAdvance) {
            var box = document.createElement("div");
            box.style.float = "left";
            box.style.position = "relative";
            box.style.padding = "0 3px";
            box.appendChild(autoResizeBtn);
            document.getElementById("e_button").appendChild(box);
            addSMMSImg();
            addLoliImg();
        }
        else {
            var pipeLine = document.createElement("span");
            pipeLine.classList.add("pipe", "z");
            pipeLine.innerText = "|";
            document.querySelector("#fastposteditor .bar").appendChild(pipeLine);
            document.querySelector("#fastposteditor .bar").appendChild(autoResizeBtn);
        }
    }
})();

function addSMMSImg() {
    var imageCtrl = document.getElementById("e_image_ctrl");
    var btnLocal = document.getElementById("e_btn_local");
    var btnRemote = btnLocal.cloneNode(true);
    imageCtrl.appendChild(btnRemote);
    btnRemote.id = 'e_btn_remote';
    var btnRemoteLink = btnRemote.querySelector('a');
    btnRemoteLink.setAttribute("onclick", "switchImagebutton('remote');");
    btnRemoteLink.text = "sm.ms 图床上传";
    var localPanel = document.getElementById("e_local");
    var remotePanel = localPanel.cloneNode(true);
    imageCtrl.parentElement.appendChild(remotePanel);
    remotePanel.id = "e_remote";
    remotePanel.querySelector('#imgattachbtnhidden').remove()
    remotePanel.querySelector(".notice").innerText = "使用 sm.ms 图床（请注意，如长时间未插入可能是图片过大或网络拥堵）";
    var remoteForm = remotePanel.querySelector('form');
    remoteForm.removeAttribute("action");
    remoteForm.querySelectorAll("input[type=hidden]").forEach(el => el.remove());
    var remoteBtn = remotePanel.querySelector("#imguploadbtn > button");
    remoteBtn.removeAttribute("onclick");
    var remoteFile = remoteForm.querySelector("input[type=file]");
    remoteFile.accept = "image/*";
    var imageUrlPreviewTip = document.createElement("p");
    imageUrlPreviewTip.innerText = "图片链接: ";
    remoteForm.appendChild(imageUrlPreviewTip);

    var remoteBtnSpan = remoteBtn.querySelector("span");
    var uploadHandler = _ev => {
        var pendingFile = remoteFile.files[0];
        if (!pendingFile) return;

        if (pendingFile.size > 5000000) {
            alert("图片不得超过 5M");
            return;
        }

        var pendingFormdata = new FormData();
        pendingFormdata.append("smfile", pendingFile);
        pendingFormdata.append("file_id", "0");

        remoteBtnSpan.innerText = "上传中……";
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://sm.ms/api/v2/upload?inajax=1",
            data: pendingFormdata,
            onload: function () {
                if (this.status === 200) {
                    var uploadResponse = JSON.parse(this.responseText);

                    var imageUrl = "";
                    if (uploadResponse.code === "success") {
                        imageUrl = uploadResponse.data.url;
                        var imageWidth = uploadResponse.data.width;
                        var imageHeight = uploadResponse.data.height;

                        var fitWidth = 712;
                        if (imageWidth > fitWidth) {
                            imageHeight = Math.round(imageHeight / imageWidth * fitWidth);
                            imageWidth = fitWidth;
                        }

                        var imageCode = unsafeWindow.wysiwyg
                            ? `<img src="${imageUrl}" width="${imageWidth}" height="${imageHeight}" border=0 />`
                            : `[img=${imageWidth},${imageHeight}]${imageUrl}[/img]`;

                        unsafeWindow.insertText(imageCode);
                    } else if (uploadResponse.code === "image_repeated") {
                        imageUrl = uploadResponse.images;
                        var readImage = new Image();
                        readImage.onload = () => {
                            var imageWidth = readImage.width;
                            var imageHeight = readImage.height;

                            var fitWidth = 712;
                            if (imageWidth > fitWidth) {
                                imageHeight = Math.round(imageHeight / imageWidth * fitWidth);
                                imageWidth = fitWidth;
                            }

                            var imageCode = unsafeWindow.wysiwyg
                                ? `<img src="${imageUrl}" width="${imageWidth}" height="${imageHeight}" border=0 />`
                                : `[img=${imageWidth},${imageHeight}]${imageUrl}[/img]`;

                            unsafeWindow.insertText(imageCode);
                        };
                        readImage.src = imageUrl;
                    }

                    var imageUrlPreview = document.createElement("p");
                    imageUrlPreview.innerText = imageUrl;
                    remoteForm.appendChild(imageUrlPreview);
                } else {
                    var uploadError = JSON.parse(this.responseText);
                    alert("图片上传出错：" + uploadError.message);
                }
                remoteBtnSpan.innerText = "上传";
            }
        });
    };
    remoteBtn.onclick = uploadHandler;
}

function addLoliImg() {
    document.getElementById("e_button").appendChild(box);
    var imageCtrl = document.getElementById("e_image_ctrl");
    var btnLocal = document.getElementById("e_btn_local");
    var btnRemote = btnLocal.cloneNode(true);
    imageCtrl.appendChild(btnRemote);
    btnRemote.id = 'e_btn_remote';
    var btnRemoteLink = btnRemote.querySelector('a');
    btnRemoteLink.setAttribute("onclick", "switchImagebutton('remote');");
    btnRemoteLink.text = "52loli 图床上传";
    var localPanel = document.getElementById("e_local");
    var remotePanel = localPanel.cloneNode(true);
    imageCtrl.parentElement.appendChild(remotePanel);
    remotePanel.id = "e_remote";
    remotePanel.querySelector('#imgattachbtnhidden').remove()
    remotePanel.querySelector(".notice").innerText = "使用 www.52loli.top 图床（请注意，如长时间未插入可能是图片过大或网络拥堵）";
    var remoteForm = remotePanel.querySelector('form');
    remoteForm.removeAttribute("action");
    remoteForm.querySelectorAll("input[type=hidden]").forEach(el => el.remove());
    var remoteBtn = remotePanel.querySelector("#imguploadbtn > button");
    remoteBtn.removeAttribute("onclick");
    var remoteFile = remoteForm.querySelector("input[type=file]");
    remoteFile.accept = "image/*";
    var imageUrlPreviewTip = document.createElement("p");
    imageUrlPreviewTip.innerText = "图片链接: ";
    remoteForm.appendChild(imageUrlPreviewTip);

    var remoteBtnSpan = remoteBtn.querySelector("span");
    var uploadHandler = _ev => {
        var pendingFile = remoteFile.files[0];
        if (!pendingFile) return;

        if (pendingFile.size > 5000000) {
            alert("图片不得超过 5M");
            return;
        }

        var pendingFormdata = new FormData();
        pendingFormdata.append("image", pendingFile);
        pendingFormdata.append("file_id", "0");

        remoteBtnSpan.innerText = "上传中……";
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://www.52loli.top/api/upload",
            data: pendingFormdata,
            onload: function () {
                if (this.status === 200) {
                    var uploadResponse = JSON.parse(this.responseText);

                    var imageUrl = "";
                    if (uploadResponse.code === 200) {
                        imageUrl = uploadResponse.data.url;
                        var readImage = new Image();
                        readImage.onload = () => {
                            var imageWidth = readImage.width;
                            var imageHeight = readImage.height;

                            var fitWidth = 712;
                            if (imageWidth > fitWidth) {
                                imageHeight = Math.round(imageHeight / imageWidth * fitWidth);
                                imageWidth = fitWidth;
                            }

                            var imageCode = unsafeWindow.wysiwyg
                                ? `<img src="${imageUrl}" width="${imageWidth}" height="${imageHeight}" border=0 />`
                                : `[img=${imageWidth},${imageHeight}]${imageUrl}[/img]`;

                            unsafeWindow.insertText(imageCode);
                        };
                        readImage.src = imageUrl;
                    }

                    var imageUrlPreview = document.createElement("p");
                    imageUrlPreview.innerText = imageUrl;
                    remoteForm.appendChild(imageUrlPreview);
                } else {
                    var uploadError = JSON.parse(this.responseText);
                    alert("图片上传出错：" + uploadError.message);
                }
                remoteBtnSpan.innerText = "上传";
            }
        });
    };
    remoteBtn.onclick = uploadHandler;
}
