PolyGlop = {
    "settings" : {
        "min_word_length": 5,
        "max_word_length": 30,
        "word_limit": 3,
        "en_word_rx": /^[a-zA-Z]+$/,
        "brands_rx": /^(JustinTV|Google|Mozilla|Firefox|Twitter|Facebook)$/i,
        "referrer": "http://mozilla.org/",
        "host_lang": "en",
        "conv_lang": "ja"
    },
    "on": false,
    "onClickStatusIcon": function(e) {
        PolyGlop.on = !PolyGlop.on;
        if (PolyGlop.on) {
            document.getElementById("polyglop-icon").src = "chrome://polyglop/content/polyglop_icon_on.png";
            PolyGlop.readDocument();
        } else {
            document.getElementById("polyglop-icon").src = "chrome://polyglop/content/polyglop_icon_off.png";
        }
    },
    "readDocument": function() {
        var words = [];
        var word_collector = function(txt_node) {
            words = words.concat(PolyGlop.filterWords(txt_node.nodeValue));
        };
        PolyGlop.walkTextNodes(content.document.body, word_collector);
        words = words.slice(0, PolyGlop.settings.word_limit);
        for (var i=0; i<words.length; i++) {
            PolyGlop.translate(words[i], function(native_text, trans_text) {
                PolyGlop.walkTextNodes(content.document.body, function(text_node) {
                    if (text_node.nodeValue.indexOf(native_text) > -1) {

                        // Replace text 
                        var span = content.document.createElement("span");
                        span.innerHTML = trans_text;
                        span.setAttribute("style", "display:inline;");
                        span.setAttribute("title", native_text);

                        var split_line = text_node.nodeValue.split(native_text);
                        if (split_line.length == 1) {
                            text_node.parentNode.replaceChild(span, text_node);
                        } else {
                            text_node.parentNode.insertBefore(span, text_node);
                            text_node.parentNode.insertBefore(
                                document.createTextNode(split_line.shift()), span);
                            text_node.parentNode.insertBefore(
                                document.createTextNode(split_line.join(native_text)), text_node);
                            text_node.parentNode.removeChild(text_node);
                        }
                    }
                });
            });
        }
    },
    "walkTextNodes": function(node, onTextNode) {
        if (node.nodeType === 3 && node.nodeName === "#text") {
            onTextNode(node);
        }

        if (node.nodeName !== "SCRIPT" && node.nodeName !== "STYLE" && node.childNodes.length > 0) {
            for (var i=0; i<node.childNodes.length; i++) {
                PolyGlop.walkTextNodes(node.childNodes[i], onTextNode);
            }
        }
    },
    "wordFilters": [
        function(word) {
            return (word.length > PolyGlop.settings.min_word_length && 
                    word.length < PolyGlop.settings.max_word_length);
        },
        function(word) {
            return PolyGlop.settings.en_word_rx.test(word);
        },
        function(word) {
            return !(PolyGlop.settings.brands_rx.test(word));
        }
    ],
    "filterWords": function(text) {
        var ret = [];
        var words = text.split(/\s/gi);
        var passed = true;

        for (var i=0; i<words.length; i++) {
            passed = true;
            for (var j=0; j<PolyGlop.wordFilters.length; j++) {
                if (!PolyGlop.wordFilters[j](words[i])) {
                    passed = false;
                    break;
                }
            }
            if (passed) {
                ret.push(words[i]);
            }
        }

        return ret;
    },
    "translate": function(native_text, callback) {
        var uri = [
            "http://ajax.googleapis.com/ajax/services/language/translate?",
            "langpair=", PolyGlop.settings.host_lang, "%7C", PolyGlop.settings.conv_lang, "&v=1.0",
            "&q=", native_text].join("");

        var xhr = XMLHttpRequest();
        xhr.open("GET", uri, true);
        xhr.setRequestHeader("referrer", PolyGlop.settings.referrer);
        xhr.onreadystatechange = function() { 
            if (xhr.readyState === 4) { // COMPLETE
                var jso = JSON.parse(xhr.responseText);
                if (!jso || jso.responseStatus !== 200) {
                    document.getElementById("polyglop-icon").src = "chrome://polyglop/content/polyglop_icon_error.png";
                    return;
                }
                callback(native_text, jso.responseData.translatedText.toString());
            }
        };
        xhr.send();
    }
};

