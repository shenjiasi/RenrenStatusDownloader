
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
        var str = "<name>" + this.name + "</name>"
        + "<time>" + this.time + "</time>"
        + "<content>" + this.content + "</content>";
        return str;
    }
}

function parseSentence(elem_status) {
    var elem_content = elem_status.getElementsByTagName("h3")[0];
    var status_content = elem_content.innerHTML;
    var status_time = elem_status.getElementsByClassName("duration")[0].innerHTML;
    var elem_origin = elem_status.getElementsByClassName("original-stauts")[0];
    if (elem_origin != null)
        status_content += elem_origin.innerHTML;
    
    var user_name = elem_content.getElementsByTagName("a")[0].innerHTML;
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
    var list_reply_names = list_replies.getElementsByClassName("replyername");
    var list_reply_contents = list_replies.getElementsByClassName("replycontent");
    var list_reply_times = list_replies.getElementsByClassName("time");
    
    var replies = new Array;
    for (var i = 0; i < list_reply_names.length; i++) {
        replies.push(new _post(list_reply_names[i].innerHTML, list_reply_contents[i]. innerHTML, list_reply_times[i].innerHTML));
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
        var str = "<sentence>" + this.sentence.toXML() + "</sentence>";
        for (var i = 0; i < this.replies.length; i++) {
            str += "<reply>" + this.replies[i].toXML() + "</reply>";
        }
        return str;
    }
}

var elem_first_status = document.getElementById("my_panel").firstChild;
var elem_avatar = elem_first_status.getElementsByClassName("avatar")[0];
var user_id = elem_avatar.getAttribute("namecard");

pullReplies(elem_first_status, user_id);

var elem_status = elem_first_status;
while (elem_status != null) {
    var status_id = elem_status.id.substr(7);
    var sentence = parseSentence(elem_status);
    var replies = parseReplies(status_id, user_id);
    var the_status = new _status(status_id, sentence, replies);
    
    alert(the_status.toXML());
    
    elem_status = elem_status.nextSibling;
}
