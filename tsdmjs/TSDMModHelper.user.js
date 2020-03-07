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

    // 举报页面将链接替换成相应标题并显示 PID 和 TID
    if (/mod=modcp/.test(location.href) && /action=report/.test(location.href)) {
        document.querySelectorAll("#list_modcp_logs td>strong+a").forEach((item, key, parent) => {
            var xhr = new XMLHttpRequest();
            xhr.overrideMimeType = "text/html";
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        item.innerText = xhr.responseText.match(/<title>(.*)<\/title>/)[0].replace("<title>", "").replace("</title>", "");
                        if (/pid=\d+/.test(item.href)) {
                            item.title = "TID: " + xhr.responseURL.match(/tid=\d+/)[0].replace("tid=", "") + " PID: " + item.href.match(/pid=\d+/)[0].replace("pid=", "");
                        }
                    }
                    else {
                        console.log(item.href + " 读取失败可能是网络问题或主题已删除，请手动查看");
                    }
                }
            }
            xhr.open("GET", item.href, true);
            xhr.send(null);
        });
    }
});
