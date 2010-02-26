PolyGlop = {
    "languages": { 
        'af':'AFRIKAANS', 'sq':'ALBANIAN', 'am':'AMHARIC', 'ar':'ARABIC', 'hy':'ARMENIAN', 'az':'AZERBAIJANI', 'eu':'BASQUE', 
        'be':'BELARUSIAN', 'bn':'BENGALI', 'bh':'BIHARI', 'bg':'BULGARIAN', 'my':'BURMESE', 'ca':'CATALAN', 'chr':'CHEROKEE', 
        'zh':'CHINESE', 'zh-CN':'CHINESE_SIMPLIFIED', 'zh-TW':'CHINESE_TRADITIONAL', 'hr':'CROATIAN', 'cs':'CZECH', 'da':'DANISH', 
        'dv':'DHIVEHI',  'nl':'DUTCH',  'en':'ENGLISH', 'eo':'ESPERANTO', 'et':'ESTONIAN', 'tl':'FILIPINO', 'fi':'FINNISH', 
        'fr':'FRENCH', 'gl':'GALICIAN', 'ka':'GEORGIAN', 'de':'GERMAN', 'el':'GREEK', 'gn':'GUARANI', 'gu':'GUJARATI', 
        'iw':'HEBREW', 'hi':'HINDI', 'hu':'HUNGARIAN', 'is':'ICELANDIC', 'id':'INDONESIAN', 'iu':'INUKTITUT', 'ga':'IRISH', 
        'it':'ITALIAN', 'ja':'JAPANESE', 'kn':'KANNADA', 'kk':'KAZAKH', 'km':'KHMER', 'ko':'KOREAN',  'ku':'KURDISH',  'ky':'KYRGYZ', 
         'lo':'LAOTHIAN', 'lv':'LATVIAN', 'lt':'LITHUANIAN', 'mk':'MACEDONIAN', 'ms':'MALAY', 'ml':'MALAYALAM', 'mt':'MALTESE', 
        'mr':'MARATHI', 'mn':'MONGOLIAN', 'ne':'NEPALI', 'no':'NORWEGIAN', 'or':'ORIYA', 'ps':'PASHTO', 'fa':'PERSIAN', 'pl':'POLISH', 
        'pt-PT':'PORTUGUESE', 'pa':'PUNJABI', 'ro':'ROMANIAN', 'ru':'RUSSIAN', 'sa':'SANSKRIT', 'sr':'SERBIAN', 'sd':'SINDHI', 
        'si':'SINHALESE', 'sk':'SLOVAK', 'sl':'SLOVENIAN', 'es':'SPANISH', 'sw':'SWAHILI', 'sv':'SWEDISH', 'tg':'TAJIK', 'ta':'TAMIL', 
        'tl':'TAGALOG', 'te':'TELUGU', 'th':'THAI', 'bo':'TIBETAN', 'tr':'TURKISH', 'uk':'UKRAINIAN', 'ur':'URDU', 'uz':'UZBEK', 
        'ug':'UIGHUR', 'vi':'VIETNAMESE', 'cy':'WELSH', 'yi':'YIDDISH'
    },
    "settings":{
        // prefs
        "host_lang": null,
        "conv_lang": null,
        "min_word_length": null,
        "max_word_length": null,
        "word_limit": null
    },
    "on": false,
    "prefs": Components.classes["@mozilla.org/preferences-service;1"
        ].getService(Components.interfaces.nsIPrefService).getBranch("extensions.polyglop."),
    "loadSettings": function() {
        PolyGlop.settings.host_lang = PolyGlop.prefs.getCharPref("host_lang");
        PolyGlop.settings.conv_lang = PolyGlop.prefs.getCharPref("conv_lang");
        PolyGlop.settings.min_word_length = PolyGlop.prefs.getIntPref("min_word_length");
        PolyGlop.settings.max_word_length = PolyGlop.prefs.getIntPref("max_word_length");
        PolyGlop.settings.word_limit = PolyGlop.prefs.getIntPref("word_limit");
        PolyGlop.loadSettings = function() {};
    },
    "setNativeLanguage": function(lang_code) {
        PolyGlop.settings.host_lang = lang_code;
        PolyGlop.prefs.setCharPref("host_lang", lang_code);
    },
    "setTranslateLanguage": function(lang_code) {
        PolyGlop.settings.conv_lang = lang_code;
        PolyGlop.prefs.setCharPref("host_lang", lang_code);
    },
    "setWordsPerPage": function(count) {
        count = parseInt(count);
        if (count >= 1) {
            PolyGlop.settings.word_limit = count;
            PolyGlop.prefs.setIntPref("word_limit", count);
        }
    },
    "turnOff": function() {
        PolyGlop.on = false;
        document.getElementById("polyglop-icon").src = "chrome://polyglop/content/polyglop_icon_off.png";
    },
    "turnOn": function() {
        PolyGlop.on = true;
        document.getElementById("polyglop-icon").src = "chrome://polyglop/content/polyglop_icon_on.png";
    },
    "run": function() {
        PolyGlop.readDocument();
    },
    "init": function() {
        PolyGlop.loadSettings();
        document.getElementById("appcontent").addEventListener(
                "DOMContentLoaded", PolyGlop.onPageLoad, true);
        PolyGlop.initLanguageSelect("polyglop-native-language", PolyGlop.settings.host_lang);
        PolyGlop.initLanguageSelect("polyglop-translate-language", PolyGlop.settings.conv_lang);
        document.getElementById("polyglop-words-per-page").value = PolyGlop.settings.word_limit;
    },
    "initLanguageSelect": function(sel_id, selected_lang_code) {
        var sel = document.getElementById(sel_id);
        for (var k in PolyGlop.languages) {
            if (k !== selected_lang_code) {
                sel.insertItemAt(0, PolyGlop.languages[k], k);
            }
        }
        sel.insertItemAt(0, PolyGlop.languages[selected_lang_code], selected_lang_code);
        sel.selectedIndex = 0;
    },
    "onPageLoad": function(e) {
        var doc = e.originalTarget;
        if (doc.nodeName === "#document" && PolyGlop.on) {
            PolyGlop.run();
        }
    },
    "toggle": function() {
        PolyGlop.on = !PolyGlop.on;
        if (PolyGlop.on) {
            PolyGlop.turnOn();
            PolyGlop.run();
        } else {
            PolyGlop.turnOff();
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
            return /^[a-zA-Z]+$/.test(word);
        },
        function(word) {
            return !(/^(JustinTV|Google|Mozilla|Firefox|Twitter|Facebook)$/i.test(word));
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
        xhr.setRequestHeader("referrer", "https://addons.mozilla.org/en-US/firefox/addon/86091/");
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

