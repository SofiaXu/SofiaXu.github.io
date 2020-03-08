// ==UserScript==
// @name         天使动漫辅助
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  提供了一些便利的发帖和管理功能，持续更新中，需要更多功能请私信联系あおば (UID: 1639751)
// @author       Aoba xu
// @match        https://www.tsdm.live/*
// @grant        none
// ==/UserScript==

window.addEventListener("load", () => {
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
            var link = document.querySelector(".xw0.xs1.xg1>a:first-child");
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

    // 增加帖子发帖时缩放图像大小功能（仅限外链图片）
    if (/mod=post/.test(location.href)) {
        var box = document.createElement("div");
        box.style.float = "left";
        box.style.position = "relative";
        box.style.padding = "0 3px"
        var autoresizebtn = document.createElement("a");
        autoresizebtn.href = "javascript:;";
        autoresizebtn.id = "autoresize-btn";
        autoresizebtn.title = "一键缩放图片";
        autoresizebtn.innerText = "一键缩放图片";
        autoresizebtn.style.background = "none";
        autoresizebtn.style.lineHeight = "20px";
        autoresizebtn.addEventListener("click", () => {
            var imgUrlReg = /(?:\[img(?:\]|=\d+,\d+\])|)(http(?:s|):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+\.(?:bmp|jpg|jpeg|gif|png|tif|tiff|svg|webp)(?:[-A-Za-z0-9+&@#/%?=~_|]+|))(?:\[\/img\]|)/gi;
            var imgCount = 0;
            document.getElementById("e_textarea").value.replace(imgUrlReg, (all, imgUrl) => {
                imgCount++;
                var readImage = new Image();
                readImage.onload = () => {
                    var h = readImage.height;
                    var w = readImage.width;
                    if (w > 712) {
                        h = Math.round(readImage.height / (w / 712));
                        w = 712;
                    }
                    document.getElementById("e_textarea").value = document.getElementById("e_textarea").value.replace(all, "[img=" + w + "," + h + "]" + readImage.src + "[/img]");
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
                        console.log(readImage + "中的图片转换失败，可能是网络问题请重试");
                    }
                };
                readImage.src = imgUrl;
                return "";
            });

        });
        box.appendChild(autoresizebtn);
        document.getElementById("e_button").appendChild(box);
    }
});
