
function _post(name, content, time) {
    this.name = name;
    this.content = content;
    this.time = time;
    
    this.toString = function() {
        var str = this.name + "\t" + this.time + "\t" + this.content;
        return str;
    }
    
    this.toHTML = function() {
        var str = "<li class=\"post\">"
        + "<ul class=\"username\">" + this.name + "</ul>"
        + "<ul class=\"time\">" + this.time + "</ul>"
        + "<ul class=\"content\">" + this.content + "</ul>"
        + "</li>";
        return str;
    }
    
    this.toXML = function() {
        var str = "<name>" + this.name + "</name>\n"
        + "<time>" + this.time + "</time>\n"
        + "<content>" + this.content + "</content>\n";
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
    var elem_origin = elem_status.getElementsByClassName("original-stauts")[0];
    var status_time = elem_status.getElementsByClassName("duration")[0].innerHTML;
    
    var plain_content = convertPlainText(elem_content);
    var status_content = plain_content.innerHTML;
    if (elem_origin != null) {
        var plain_origin = convertPlainText(elem_origin);
        status_content += plain_origin.innerHTML;
    }
    
    var user_status = new _post(user_name, status_content, status_time);
    return user_status;
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
    
    var plain_replies = convertPlainText(list_replies);

    var list_reply_names = plain_replies.getElementsByClassName("replyername");
    var list_reply_contents = plain_replies.getElementsByClassName("replycontent");
    var list_reply_times = plain_replies.getElementsByClassName("time");
    
    var replies = new Array;
    for (var i = 0; i < list_reply_names.length; i++) {
        replies.push(new _post(list_reply_names[i].innerHTML, list_reply_contents[i].innerHTML, list_reply_times[i].innerHTML));
    }
    return replies;
}

function _status(status_id, sentence, replies) {
    this.id = status_id;
    this.sentence = sentence;
    this.replies = replies;
    
    this.toString = function() {
        var str = this.id + "\n";
        str += this.sentence.toString();
        for (var i = 0; i < this.replies.length; i++) {
            str += "\n" + this.replies[i].toString();
        }
        return str;
    }
    
    this.toHTML = function() {
        var str = "<li id=\"status-" + this.id + "\">";
        str += this.sentence.toHTML();
        for (var i = 0; i < this.replies.length; i++) {
            str += this.replies[i].toHTML();
        }
        str += "</li>";
        return str;
    }
    
    this.toXML = function() {
        var str = "<id>" + this.id + "</id>\n";
        str += "<sentence>" + this.sentence.toXML() + "</sentence>\n";
        for (var i = 0; i < this.replies.length; i++) {
            str += "<reply>" + this.replies[i].toXML() + "</reply>\n";
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
        var replies = parseReplies(status_id);
        arr_status_list.push(new _status(status_id, sentence, replies));
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
    str += "<catalog>\n";
    for (var i = 0; i < arr.length; i++) {
        str += "<status>\n" + arr[i].toXML() + "</status>\n";
    }
    str += "</catalog>\n";
    return str;
}

var str = getStatusListXML();
if (str != null)
    document.body.innerHTML = str;
