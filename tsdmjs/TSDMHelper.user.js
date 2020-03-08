// ==UserScript==
// @name         天使动漫辅助
// @namespace    http://tampermonkey.net/
// @version      0.1.3
// @description  提供了一些便利的发帖和管理功能，持续更新中，需要更多功能请私信联系あおば (UID: 1639751)
// @author       Aoba xu
// @match        https://www.tsdm.live/*
// @grant        GM_xmlhttpRequest
// @connect      sm.ms
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

        // duplicate e_btn_local as e_btn_remote and append to e_image_ctrl
        var e_image_ctrl = document.getElementById("e_image_ctrl");
        var e_btn_local = document.getElementById("e_btn_local");
        var e_btn_remote = e_btn_local.cloneNode(true);
        e_image_ctrl.appendChild(e_btn_remote);

        // patch e_btn_remote
        e_btn_remote.id = 'e_btn_remote';
        var e_btn_remote_link = e_btn_remote.querySelector('a');
        e_btn_remote_link.setAttribute("onclick", "switchImagebutton('remote');");
        e_btn_remote_link.text = "图床上传";

        // duplicate e_local as e_remote and append to container
        var e_local = document.getElementById("e_local");
        var e_remote = e_local.cloneNode(true);
        e_image_ctrl.parentElement.appendChild(e_remote);

        // patch e_remote
        e_remote.id = "e_remote";
        e_remote.querySelector('#imgattachbtnhidden').remove()
        var e_remote_notice = e_remote.querySelector(".notice");
        e_remote_notice.innerText = "使用 sm.ms 图床";
        var e_remote_form = e_remote.querySelector('form');
        e_remote_form.removeAttribute("action");
        e_remote_form.querySelectorAll("input[type=hidden]").forEach(el => el.remove());
        var e_remote_btn = e_remote.querySelector("#imguploadbtn > button");
        e_remote_btn.removeAttribute("onclick");
        var e_remote_file = e_remote_form.querySelector("input[type=file]");

        var e_remote_btn_span = e_remote_btn.querySelector("span");
        var uploadHandler = _ev => {
            var pending_file = e_remote_file.files[0];
            if (!pending_file) return;

            if (pending_file.size > 5000000) {
                alert("图片不得超过 5M");
                return;
            }

            var pending_formdata = new FormData();
            pending_formdata.append("smfile", pending_file);

            e_remote_btn_span.innerText = "上传中……";
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://sm.ms/api/v2/upload",
                headers: { "Authorization": "0dYlZjbwhYrCcDdx0QYFUF8A5Wmf5ux3" },
                data: pending_formdata,
                onload: function () {
                    if (this.status === 200) {
                        var upload_response = JSON.parse(this.responseText);

                        var image_url = "";
                        if (upload_response.code === "success") {
                            image_url = upload_response.data.url;
                        } else if (upload_response.code === "image_repeated") {
                            image_url = upload_response.images;
                        }

                        var readImage = new Image();
                        readImage.onload = () => {
                            var image_width = readImage.width;
                            var image_height = readImage.height;

                            // resize image
                            var fit_width = 712;
                            if (image_width > fit_width) {
                                image_height = Math.round(image_height / image_width * fit_width);
                                image_width = fit_width;
                            }

                            // the ugly part
                            var image_code = unsafeWindow.wysiwyg
                                ? `<img src="${image_url}" width="${image_width}" height="${image_height}" border=0 />`
                                : `[img=${image_width},${image_height}]${image_url}[/img]`;

                            unsafeWindow.insertText(image_code);
                        };
                        readImage.src = image_url;
                    } else {
                        var upload_error = JSON.parse(this.responseText);
                        alert("图片上传出错：" + upload_error.message);
                    }
                    e_remote_btn_span.innerText = "上传";
                }
            });
        };
        e_remote_btn.onclick = uploadHandler;
    }
});
