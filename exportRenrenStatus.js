
function _post(name, content, time) {
    this.name = name;
    this.content = content;
    this.time = time;
    
    this.toXML = function() {
        var str = "<name>" + this.name + "</name>"
        + "<time>" + this.time + "</time>"
        + "<content>" + this.content + "</content>";
        return str;
    }
}

function cloneTree(node) {
    var clone = node.cloneNode();
    var children = node.childNodes;
    for (var i = 0; i < children.length; i++) {
        clone.appendChild(cloneTree(children[i]));
    }
    return clone;
}

function convertPlainText(elem) {
    var element = cloneTree(elem);
    var all_img = element.getElementsByTagName("img");
    while (all_img.length > 0) {
        all_img[0].parentNode.replaceChild(document.createTextNode("(" + all_img[0].alt + ")"), all_img[0]);
    }
    
    var all_a = element.getElementsByTagName("a");
    while (all_a.length > 0) {
        all_a[0].parentNode.replaceChild(document.createTextNode(all_a[0].innerHTML), all_a[0]);
    }
    return element;
}

function parseSentence(elem_status) {
    var elem_content = elem_status.getElementsByTagName("h3")[0];
    var user_name = elem_content.getElementsByTagName("a")[0].innerHTML;
    var status_time = elem_status.getElementsByClassName("duration")[0].innerHTML;
    var plain_content = convertPlainText(elem_content);
    var status_content = plain_content.innerHTML;
    var user_status = new _post(user_name, status_content, status_time);
    return user_status;
}

function parseOrigin(elem_status) {
    var elem_content = elem_status.getElementsByTagName("h3")[0];
    var elem_origin = elem_status.getElementsByClassName("original-stauts")[0];
    if (elem_origin == null) {
        return null;
    }
    else {
        var plain_origin = convertPlainText(elem_origin);
        return plain_origin.innerHTML;
    }
}

function pullReplies(elem_first_status, user_id) {
    var elem_status = elem_first_status;
    while (elem_status != null) {
        var status_id = elem_status.id.substr(7);
        getReplyOfTheDoing(status_id, user_id, user_id, '', false, 3);
        elem_status = elem_status.nextSibling;
    }
}

function parseReplies(status_id) {
    var list_replies = document.getElementById("replyList" + status_id);
    if (list_replies == null) {
        throw "Please wait until the replies are ready and try again."
    }
    
    var list_reply_names = list_replies.getElementsByClassName("replyername");
    var plain_replies = convertPlainText(list_replies);
    var list_reply_contents = plain_replies.getElementsByClassName("replycontent");
    var list_reply_times = plain_replies.getElementsByClassName("time");
    
    var replies = new Array;
    for (var i = 0; i < list_reply_names.length; i++) {
        replies.push(new _post(list_reply_names[i].innerHTML, list_reply_contents[i].innerHTML, list_reply_times[i].innerHTML));
    }
    return replies;
}

function _status(status_id, sentence, origin, replies) {
    this.id = status_id;
    this.sentence = sentence;
    this.origin = origin;
    this.replies = replies;
    
    this.toXML = function() {
        var str = "<id>" + this.id + "</id>";
        str += "<sentence>" + this.sentence.toXML() + "</sentence>";
        if (this.origin != null) {
            str += "<origin>" + this.origin + "</origin>";
        }
        for (var i = 0; i < this.replies.length; i++) {
            str += "<reply>" + this.replies[i].toXML() + "</reply>";
        }
        return str;
    }
}

function extractStatusList() {
    var elem_first_status = document.getElementById("my_panel").firstChild;
    var elem_avatar = elem_first_status.getElementsByClassName("avatar")[0];
    var user_id = elem_avatar.getAttribute("namecard");
    
    pullReplies(elem_first_status, user_id);
    
    var elem_status = elem_first_status;
    var arr_status_list = new Array;
    while (elem_status != null) {
        var status_id = elem_status.id.substr(7);
        var sentence = parseSentence(elem_status);
        var origin = parseOrigin(elem_status);
        var replies = parseReplies(status_id);
        arr_status_list.push(new _status(status_id, sentence, origin, replies));
        elem_status = elem_status.nextSibling;
    }

    return arr_status_list;
}

function getStatusListXML() {
    try {
        arr = extractStatusList();
    }
    catch (err) {
        alert("Error loading status list:\n" + err);
        return;
    }
    
    var str = '<?xml version="1.0" encoding="utf-8"?>';
    str += "<catalog>";
    for (var i = 0; i < arr.length; i++) {
        str += "<status>" + arr[i].toXML() + "</status>";
    }
    str += "</catalog>";
    return str;
}

var str = getStatusListXML();
if (str != null)
    document.body.innerHTML = str;
