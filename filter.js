function normalizeFeeds() {
    for(var feed in feeds)  {
        var checked = $("input[name='" + feed + "-idp[]']:checked");
        if(checked.length > 0) {
            var ft = ($("input[value='" + feed + "']"))[0];
            if(!ft.checked) {
                ft.click();
            }
        }
    }
}


function colorIdPs() {
    for(var feed in feeds)  {
        var ft = ($("input[name='" + feed + "-filterType']:checked"))[0];
        var checked = $("input[name='" + feed + "-idp[]']:checked").next();
        var unchecked = $("input[name='" + feed + "-idp[]']:not(:checked)").next();
        if(ft.value == "whitelist") {
            checked.removeClass("black red").addClass("green");
            unchecked.removeClass("green red").addClass("black");
        }
        else {
            checked.removeClass("black green").addClass("red");
            unchecked.removeClass("green red").addClass("black");
        }
    }
}


function regenerateFilter() {

    var filterInfo = document.getElementById('filterinfo');
    var filterVal = document.getElementById('filterval');
    var rawFilterArea = document.getElementById('rawfilter');
    var filterKey = "filter=";
    var hostel = document.getElementById('hostel');
    var social = document.getElementById('social');
    var hostelreg = document.getElementById('hostelreg');
    var kontrola = document.getElementById('kontrola');
    var filter = "";
    var checkedFeeds = new Array();
    var useFeeds = false;
    var fo = {};
    fo.ver = "2";

    colorIdPs();
    normalizeFeeds();
    var checkedFeeds = $("input[name='feed[]']:checked");
    if(checkedFeeds.length>0) {
        fo.allowFeeds = {};
        for(var i=0; i<checkedFeeds.length; i++) {
            var feed = checkedFeeds[i];
            fo.allowFeeds[feed.value] = {};
            var checkedIdPs = $("input[name='" + feed.value + "-idp[]']:checked");
            if(checkedIdPs.length>0) {
                var fds = Array();
                for(var j=0; j<checkedIdPs.length; j++) {
                    var idp = checkedIdPs[j];
                    var idpVal = idp.value;
                    fds.push(idpVal);
                }
                var ft = $("input[name='" + feed.value + "-filterType']:checked");
                var filterType = ft[0];
                var fts = filterType.value == "whitelist" ? "allowIdPs" : "denyIdPs";
                fo.allowFeeds[feed.value][fts] = fds;
            }
            else {
                fo.allowFeeds[feed.value] = {};
            }
        }
    }

    fo.allowHostel = hostel.checked;
    if(hostel.checked) {
        fo.allowHostelReg = hostelreg.checked;
    }

    var filter = JSON.stringify(fo);
    var filterValue = Base64.encode(filter);
    var filterLen = filterValue.length;
    var rawFilterValue = filterKey + filter;
    kontrola.innerText = filter;

    fPopis = "Následující hodnotu filtru použijte jako parametr poslaný WAYFu z vašeho SP." +
             " To lze udělat <ul><li>Parametrem \"<i>filter</i>\", který obsahuje přímo hodnotu" +
             " filtru uvedeného níže, nebo</li><li>Parametrem \"<i>efilter</i>\", který obsahuje URL," +
             " na kterém je dostupná hodnota filtru níže.</li></ul><b>Příklady použití:</b>" +
             "<ul><li>/wayf.php?filter=abcd</li><li>/wayf.php?efilter=www.example.com/someurl" +
             " (na www.example.com/someurl je vygenerovaný filtr)</li></ul>Pro více informací pokračujte na" +
             " dokumentaci WAYFu pro <a href=\"https://www.eduid.cz/wiki/eduid/admins/howto/wayf/wayf-sp\" target=\"_blank\">správce SP</a>" +
             " nebo <a href=\"https://www.eduid.cz/wiki/eduid/admins/howto/wayf/index\" target=\"_blank\">uživatele</a>.<br><br>" +
             " Maximální možná celková délka" +
             " všech parametrů posílaných na WAYF je 512 bytů.<br><b>Vygenerovaný filtr má nyní " +
             filterLen + " bytů.</b><br><br>" + 
             "Pro konfiguraci Shibboleth SP můžete použít např. následující kód:<br><br>" +
             
             "<div class=\"scroll nowrap\">&lt;<span class=\"tagname\">SessionInitiator</span> type=\"Chaining\" Location=\"/DS\" isDefault=\"false\" id=\"DS\"&gt;<br>" +
             "    &lt;SessionInitiator type=\"SAML2\" template=\"bindingTemplate.html\"/&gt;<br>" +
             "    &lt;SessionInitiator type=\"Shib1\"/&gt;<br>" + 
             "    &lt;SessionInitiator type=\"SAMLDS\" URL=\"/wayf.php?filter=<span class=\"red\"><br>" +

            "<span style=\"width:80em; word-wrap:break-word; display:inline-block;\">" +
             filterValue +
             "</span><br></span>\"/&gt;<br>" +
             "&lt;/<span class=\"tagname\">SessionInitiator</span>&gt;</div><br><br>" + 
             
             "Novější verze Shibboleth SP umožnuje zjednodušenou konfiguraci:<br><br>" + 
             
             "<div class=\"scroll nowrap\">&lt;<span class=\"tagname\">SSO</span> discoveryProtocol=\"SAMLDS\"<br>" + 
             "    discoveryURL=\"/wayf.php?filter=<span class=\"red\"><br>" + 
            "<span style=\"width:80em; word-wrap:break-word; display:inline-block;\">" +
             filterValue +
             "</span><br></span>\"&gt;<br>" + 
             "    SAML2 SAML1<br>" +
             "&lt;/<span class=\"tagname\">SSO</span>&gt;</div><br><br>" + 
             
             "Pokud jako SP používáte <a href=\"https://simplesamlphp.org/\">SimpleSAMLphp</a>, můžete použít v souboru config/authsources.php " + 
             "následující konfiguraci (jedná se pouze o část konfigurace):<br><br>" +
             
             "<div class=\"scroll nowrap\">\'<span class=\"tagname\">default-sp</span>\' => array(<br>" + 
             "    \'saml:SP\',<br>" + 
             "    \'idp\' => NULL,<br>" + 
             "    \'discoURL\' => \'/wayf.php?filter=<span class=\"red\"><br>" +
            "<span style=\"width:80em; word-wrap:break-word; display:inline-block;\">" +
              filterValue + 
             "</span><br></span>\',<br>" + 
             "    ...<br>" + 
             "),<div><br><br>" + 
             
             "Funkčnost vašeho filtru můžete ověřit na <a target=\"_blank\" href=\"https://ds.eduid.cz/wayf.php?filter=" + filterValue + "&entityID=sample&return=www.example.org\">tomto odkazu</a>.<br><br>";
            
    filterInfo.innerHTML = fPopis;
    filterVal.value = filterValue;

    $('#filterval').removeClass("errorfilter");
}

function decodeFilter() {
    try {
        $('#filterval').removeClass("errorfilter");
        var filterArea = document.getElementById('filterval');
        var base64Filter = filterArea.value;
        var decoded = Base64.decode(base64Filter);
        var filter = JSON.parse(decoded);
        var encoded = Base64.encode(decoded);
        var kontrola = document.getElementById('kontrola');
        if(filter.ver == null) {
            throw "This is not compatible filter version.";
        }
        $(':checkbox').attr('checked', false);
        $("input[value='whitelist']").click();
        if(filter.allowFeeds != null) {
            for(var feed in filter.allowFeeds) {
                $("input[value='" + feed + "']").click();
                if(filter.allowFeeds[feed].allowIdPs != null) {
                    for(idp in filter.allowFeeds[feed].allowIdPs) {
                        $("input[value='" + filter.allowFeeds[feed].allowIdPs[idp] + "']").click();
                    }
                }
                else if(filter.allowFeeds[feed].denyIdPs != null) {
                    $("[name='" + feed + "-filterType'][value='blacklist']").click();
                    for(idp in filter.allowFeeds[feed].denyIdPs) {
                        $("input[value='" + filter.allowFeeds[feed].denyIdPs[idp] + "']").click();
                    }
                }
            }
        }
        if(filter.allowHostel != null) {
            if(filter.allowHostel instanceof Array) {
                throw "allowHostel is an Array";
            }
            else {
                if(filter.allowHostel == true) {
                    $('#hostel').click();
                    if(filter.allowHostelReg != null) {
                        if(filter.allowHostelReg instanceof Array) {
                            throw "allowHostelReg is an Array";
                        }
                        else {
                            if(filter.allowHostelReg == true) {
                                $('#hostelreg').click();
                            }
                        }
                    }
                }
            }
        }
        if(kontrola.innetText !== decoded) {
            $("#dfdialog").dialog("open");
        }
    }
    catch(err) {
        alert(err);
        $("#errdialog").dialog("open");
        $('#filterval').addClass("errorfilter");
    }
}

function sortEntities(e1, e2) {
    if(e1 == e2) {
        return 0;
    }
    else if(e1 < e2) {
        return -1;
    }
    else {
        return 1;
    }
}

var ea;

function getNameFromId(id) {
    var name = id["label"]["cs"];
    if(name == null) {
        var name = id["label"]["en"];
    }
    if(name == null) {
        var name = id["label"]["de"];
    }
    if(name == null) {
        var name = id["label"]["fr"];
    }
    if(name == null) {
        var name = id["label"]["it"];
    }
    return name;
}

function sortIdps(a, b) {
    var idpNameA = getNameFromId(ea[a]);
    var idpNameB = getNameFromId(ea[b]);
    return idpNameA.localeCompare(idpNameB);
}

function showIdps(url, content, feed) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        return function(cont, fd) {
            if(xmlhttp.readyState == 4 ) {
                switch(xmlhttp.status) {
                    case 200:
                        var feedData = JSON.parse(xmlhttp.responseText);
                        var eArray = feedData.entities;
                        ea = eArray;
                        var keys = [];
                        for (var key in eArray) {
                            if (eArray.hasOwnProperty(key)) {
                                keys.push(key);
                            }
                        }
                        keys.sort(sortIdps);
                        for(var e in keys) {
                            var ent = keys[e];
                            var value = eArray[ent];
                            var idpName = getNameFromId(value);
                            var i = document.createElement("input");
                            var l = document.createElement("label");
                            i.type = "checkbox";
                            i.name = fd + "-idp[]";
                            i.value = ent;
                            i.classList.add("oc");
                            var s = document.createElement("span");
                            s.innerHTML = idpName + " (" + ent + ")";
                            var b = document.createElement("br");

                            l.appendChild(i);
                            l.appendChild(s);
                            
                            cont.appendChild(l);
                            cont.appendChild(b);
                        }
                        break;
                    case 304:
                        break;
                    default:
                        break;
                }
            }
        }(content, feed);
    };
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
}

function fillFeeds() {

    $("#gendialog").dialog({
        autoOpen: true,
        modal: true,
        closeOnEscape: false,
    });
    var feedsDiv = document.getElementById("feedsDiv");
    for(var key in feeds)  {
        var i = document.createElement("input");
        i.type = "checkbox";
        i.name = "feed[]";
        i.value = key;
        i.className = "oc";

        var i1 = document.createElement("input");
        var l1 = document.createElement("label");
        i1.type = "radio";
        i1.name = key + "-filterType";
        i1.value = "whitelist";
        i1.checked = "checked";
        i1.className = "oc";
        var s1 = document.createElement("span");
        s1.innerHTML = "Vybraná IdP budou viditelná, ostatní budou skrytá";
        var b1 = document.createElement("br");
        l1.appendChild(i1);
        l1.appendChild(s1);

        var i2 = document.createElement("input");
        var l2 = document.createElement("label");
        i2.type = "radio";
        i2.name = key + "-filterType";
        i2.value = "blacklist";
        i2.className = "oc";
        var s2 = document.createElement("span");
        s2.innerHTML = "Vybraná IdP nebudou viditelná, všechna ostatní budou viditelná";
        var b2 = document.createElement("br");
        l2.appendChild(i2);
        l2.appendChild(s2);

        var l = document.createElement("label");
        var s = document.createElement("span");
        s.innerHTML = key;
        var b = document.createElement("br");
        l.appendChild(i);
        l.appendChild(s);
        feedsDiv.appendChild(l);
        feedsDiv.appendChild(b);
        var value = feeds[key];
        var idpAcc = document.getElementById("idpaccordion");
        var title = document.createElement("h3");
        var cont = document.createElement("div");
        cont.id = key;
        title.innerHTML = key;
        idpAcc.appendChild(title);
        idpAcc.appendChild(cont);

        cont.appendChild(l1);
        cont.appendChild(b1);

        cont.appendChild(l2);
        cont.appendChild(b2);

        var bb = document.createElement("br");
        cont.appendChild(bb);

        showIdps(value, cont, key);
    }

    $('.oc').change(function(){ regenerateFilter(); });
    $("#accordion,#idpaccordion").accordion({
        heightStyle: "content"
    });
    $("#tabs").tabs();
    $(".info").addClass('ui-state-highlight ui-corner-all').css('margin-bottom', '1em').css('padding', '1em 1em');
    $("button").button().click(function(event) {
        event.preventDefault();
        decodeFilter();
    });
    $("#errdialog").dialog({
        autoOpen: false,
        buttons: [ {text: "Ok", click: function(){ $(this).dialog("close"); } } ],
        dialogClass: "alert",
        modal: true
    });
    $("#dfdialog").dialog({
        autoOpen: false,
        buttons: [ {text: "Ok", click: function(){ $(this).dialog("close"); } } ],
        dialogClass: "alert",
        modal: true
    });
    $("#gendialog").dialog("close");
}
