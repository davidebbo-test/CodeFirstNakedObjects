var nakedObjects = (function () {

    var api = {};
    api.ajaxCount = 0;
    var disabledSubmits;
    var inAjaxLink;

    api.getDisabledSubmits = function () {
        return disabledSubmits;
    };



    api.checkForEnter = function (event) {
        if (event.keyCode === 13) { // enter key 

            if (this.nodeName.toLowerCase() === "button") {
                this.click();
                return false;
            }

            var form = $(this).closest("form");

            var okButton = form.find("button.OK:first");
            if (okButton.length > 0) {
                okButton.get(0).focus();
                okButton.get(0).click();
                return false;
            }

            var submitButton = form.find("button:submit[name='']:first");
            if (submitButton.length > 0) {
                submitButton.get(0).focus();
                submitButton.get(0).click();
                return false;
            }
            return true;
        }
        else {
            return true;
        }
    };

    api.focusOnFirst = function () {

        var okButton = $("button.OK:first");
        var saveButton = $("button.Save:first");

        if (okButton.length > 0) {
            var dialog = okButton.closest(".ActionDialog");
            if (dialog.length > 0) {
                dialog.find("input[type='text'], input[type='checkbox'], select, textarea").first().focus();
                dialog.find(".input-validation-error").first().focus();
            }
        }
        else if (saveButton.length > 0) {
            var object = saveButton.closest(".ObjectEdit");
            if (object.length > 0) {
                object.find("input[type='text'], input[type='checkbox'], select, textarea").first().focus();
                object.find(".input-validation-error").first().focus();
            }
        }
        else {
            $("input[type='text'], input[type='checkbox'], select, textarea").first().focus();
            $(".input-validation-error").first().focus();
        }
    };

    api.clearHistory = function () {

        api.ajaxCount++;
        $.post($(this).attr("action"), $(this).serialize(), function (response) {

            if ($(".History button").attr("value").split("=")[1].toLowerCase() === 'true') {
                $(".History div.Object").replaceWith("");
                $(".History > form").replaceWith($(""));
            }
            else {
                $(".History div.Object:not(:last)").replaceWith("");
                $(".History div.Object:first").replaceWith($(".History div.Object:first", response));
                $(".History button").attr("value", "clearAll=False"); // keep last value of clearAll flag (which must be false or no button)
            }

            bindToNewHtml(false);
            api.ajaxCount--;
        });
        return false;
    };

    function getButton() {
        return $("form button.lastClicked").get(0);
    }

    function errorDialog(title, msg) {

        $("div#main").append("<div id='_errorMessage' title='" + title + "'>" + msg + "</div>");
        $("#_errorMessage").dialog({ draggable: true, height: '500', width: '1000', close: function () { $("#_errorMessage").remove(); } });
    }

    function startSubmitFeedBack(button) {

        $(button).effect("highlight", {}, 500);
        disabledSubmits = $(":submit, this");
        disabledSubmits.attr("disabled", "disabled");
        $("body").css("cursor", "progress");
    }

    function endSubmitFeedBack() {
        if (disabledSubmits) {
            disabledSubmits.removeAttr("disabled");
            $("body").css("cursor", "auto");
            disabledSubmits = null;
            return true;
        }
        return false;
    }

    function startLinkFeedBack() {
        inAjaxLink = true;
        $("a").css("cursor", "progress");
    }

    function endLinkFeedBack() {
        if (inAjaxLink) {
            inAjaxLink = null;
            $("a").css("cursor", "pointer");
            return true;
        }
        return false;
    }

    api.bindAjaxError = function () {
        $("div#main").ajaxError(function (e, xhr, settings) {
            // check if we were doing a ajax call - if not ignore - must have been a validate 
            if (endSubmitFeedBack() || endLinkFeedBack()) {
                api.ajaxCount--;
            }
            errorDialog('Ajax Error', "Error in: " + settings.url + " \n" + "error:\n" + xhr.responseText);
        });
    };




    function setCollectionButtonStates() {
        $("div.Collection-Table button.Summary").show();
        $("div.Collection-Table button.List").show();
        $("div.Collection-Table button.Table").hide();
        $("div.Collection-List button.Summary").show();
        $("div.Collection-List button.List").hide();
        $("div.Collection-List button.Table").show();
        $("div.Collection-Summary button.Summary").hide();
        $("div.Collection-Summary button.List").show();
        $("div.Collection-Summary button.Table").show();
    }

    function setMinMaxButtonStates() {
        $("div.Property > div.Object > a").closest("div.Property").find("> div.Object > form button.Minimize").hide();
        $("div.Property > div.Object > a").closest("div.Property").find("> div.Object > form button.Maximize").show();
        $("div.Property > div.Object > div.PropertyList").closest("div.Property").find("> div.Object > form button.Maximize").hide();
        $("div.Property > div.Object > div.PropertyList").closest("div.Property").find("> div.Object > form button.Minimize").show();
    }

    function prefixAttribute(elements, attributeName, prefix) {
        elements.each(function (index, elem) {
            var existingId = $(elem).attr(attributeName);
            if (existingId) {
                $(elem).attr(attributeName, prefix + existingId);
            }
        });
    }


    api.redisplayInlineProperty = function (event) {
        api.ajaxCount++;

        var button = getButton(event);

        if (!button || button.name !== "Redisplay") {
            api.ajaxCount--;
            return true;
        }

        startSubmitFeedBack(button);

        var formSerialized = $(this).serializeArray();
        formSerialized[formSerialized.length] = { name: button.name, value: button.value };

        $.post($(this).attr("action"), formSerialized, function (response) {
            var property = $(button).closest("div.Property");
            var obj = property.find("> div.Object");
            var link = obj.find("> a");
            var propertyList = $("div.PropertyList", response);
            propertyList.find("> form").remove();

            var prefix = property.attr("id") + "-";
            prefixAttribute(propertyList.find("*"), "id", prefix);
         
            link.toggle();

            if ($(button).hasClass("Maximize")) {
                obj.append(propertyList);
                obj.find("> img").after($("<span>" + link.text() + "</span>"));
            }
            else {
                obj.find("> div.PropertyList").remove();
                obj.find("> span").remove();
            }

            setMinMaxButtonStates();
            setCollectionButtonStates();

            endSubmitFeedBack();
            api.ajaxCount--;
        });

        return false;
    };

    function truncateId(idToTruncate) {
        var subIds = idToTruncate.split("-");
        var count = subIds.length;
        return subIds[count - 2] + "-" + subIds[count - 1];
    }


    api.redisplayProperty = function (event) {
        api.ajaxCount++;

        var button = getButton(event);

        if (!button || button.name !== "Redisplay") {
            api.ajaxCount--;
            return true;
        }

        startSubmitFeedBack(button);

        var formSerialized = $(this).serializeArray();
        formSerialized[formSerialized.length] = { name: button.name, value: button.value };

        $.post($(this).attr("action"), formSerialized, function (response) {
            var property = $(button).closest("div.Property");
            var idToMatch = truncateId(property.attr("id"));
            var replaceWith = $(response).find("div#" + idToMatch);

            if (replaceWith.length > 0) {
                // replace the actual property
                property.replaceWith(replaceWith);
                // replace the hidden input fields to persist the setting 
                var value = $("input[id$='-displayFormats']:first", response).attr("value");
                $("form  input[id$='-displayFormats']").attr("value", value);
            }
            else {
                // replace the main body of the page
                $("div#main").replaceWith($("div#main", response));
            }

            setMinMaxButtonStates();
            setCollectionButtonStates();

            endSubmitFeedBack();
            api.ajaxCount--;
        });

        return false;
    };

    api.updateTitle = function (response) {
        var pattern = /<title>\s*?(.*?)\s*?<\/title>/;
        var matches = response.match(pattern);
        var title = matches ? matches[1] : "";
        document.title = $.trim(title);
    };

    function replace(tag, response) {

        var newvalue = $(tag, response);

        if (newvalue.length > 0) {
            $(tag).replaceWith(newvalue);
            return true;
        }
        return false;
    }

    function replacePageBody(response) {
        if (replace("div#main", response)) {
            return;
        }
        if (replace("body", response)) {
            return;
        }
        return;
    }

    function isTransientId() {
        if ($("div.ObjectEdit").hasClass("Transient")) {
            var action = $("div.ObjectEdit form.Edit").attr("action");
            if (action) {
                return getIdFromUrl(action);
            }
        }
        return false;
    }

    api.getLinkFromHistory = function () {
        var isDialog = $("div#main > div.ActionDialog").length > 0;
        var transientId = isTransientId();

        var link;
        if (isDialog) {
            link = $("div.ActionDialog > form").attr("action");
        }
        else if (transientId) {
            link = "/Transient?id=" + escape(transientId);
        }
        else {
            link = $(".History div.Object:last a").attr("href");
            var isEdit = $("div#main > div.ObjectEdit").length > 0;

            if (isEdit) {
                link = link.replace("/Details?", "/EditObject?");
            }
        }

        return link;
    };

    function updateLinkFromHistory() {
        var link = api.getLinkFromHistory();
        $.address.value(link);
    }

    function cacheIfTransient() {
        var transientId = isTransientId();
        if (transientId) {
            $.jStorage.set("transient:" + transientId, $("div#main").html());
        }
    }

    api.cacheFormValues = function (formSerialized) {
        $("form div.Parameter:has(div.Object), form div.Property:has(div.Object)").each(function (index, element) {
            $.jStorage.set(element.id, $(element).html());
        });

        var nameValues = {};

        for (var i = 0; i < formSerialized.length; i++) {

            // only write value if it evaluates to true or no previous value has been written (ie true or any value takes priority
            // over false or null/undefined)  
            if ((formSerialized[i].value.toLowerCase() !== 'false') || !nameValues[formSerialized[i].name]) {
                nameValues[formSerialized[i].name] = formSerialized[i].value;
            }
        }

        for (nv in nameValues) {
            $.jStorage.set(nv, nameValues[nv]);
        }
    };

    function cacheAllFormValues() {
        $("form.Edit, form.Dialog").each(function () {
            var formSerialized = $(this).serializeArray();
            api.cacheFormValues(formSerialized);
        });
    }

    function replaceFormValues() {
        $("form div.Parameter:has(div.Object), form div.Property:has(div.Object)").each(function (index, element) {
            var replaceWith = $.jStorage.get(element.id, null);
            if (replaceWith) {
                $(element).html(replaceWith);
            }
        });

        $("form input, form select, form textarea").each(function (index, element) {
            var replaceWith = $.jStorage.get($(element).attr("name"), null);
            if (replaceWith) {
                if ($(element).attr("type") === 'checkbox') {
                    if (replaceWith.toLowerCase() === 'true') {
                        $(element).attr('checked', 'checked');
                    }
                    else {
                        $(element).removeAttr('checked');
                    }
                }
                else if ($(element).attr("type") !== 'hidden' || !!$(element).id) {
                    $(element).val(replaceWith);
                }
            }
        });
    }

    api.updateChoices = function () {
        api.ajaxCount++;

        var choicesData = $(this).closest("div[data-choices]");

        var selects = choicesData.find("select");

        if (choicesData.length == 0 || selects.length == 0) {
            api.ajaxCount--;
            return true;
        }

        var form = $(this).closest("form");
        var url = choicesData.attr("data-choices");
        var parmsString = choicesData.attr("data-choices-parameters");
        var parms = parmsString.split(",");

        if (!parmsString || ($.inArray($(this).attr('id'), parms) === -1 && $.inArray($(this).attr('id'), "-encryptedField-" + parms) === -1)) {
            // not monitoring this field so return
            api.ajaxCount--;
            return true;
        }

        var inData = {};

        var formSerialized = form.serializeArray();

        function findValue(id) {
            for (var j = 0; j < formSerialized.length; j++) {
                var o = formSerialized[j];
                if (o.name === id) {
                    return o.value;
                }
            }
            return "";
        }

        for (var i = 0; i < parms.length; i++) {
            var parmId = parms[i];
            var encryptParmId = "-encryptedField-" + parmId;
            var encryptValue = findValue(encryptParmId);

            if (encryptValue) {
                inData[encryptParmId] = encryptValue;
            }
            else {
                inData[parmId] = findValue(parmId);
            }
        }

        $.ajaxSetup({ cache: false });
        $.getJSON(url, inData, function (data) {

            selects.each(function () {

                var id = $(this).attr("id");

                if (typeof data[id] !== "undefined") {

                    var values = data[id][0];
                    var content = data[id][1];

                    var contentAsString = "";

                    for (var k = 0; k < content.length; k++) {
                        contentAsString += content[k];
                    }

                    var options = $(this).find("option");
                    var optionsAsString = options.text();
                    if (optionsAsString !== contentAsString) {

                        options.replaceWith("");
                        $(this).append("<option/>");
                        for (var j = 0; j < values.length; j++) {
                            $(this).append($("<option value='" + values[j] + "'>" + content[j] + "</option>"));
                        }
                    }
                }
            });
            api.ajaxCount--;
        });

        return true; // ie8 needs two tabs to leave field otherwise  
    };

    api.updatePageFromAction = function (event) {
        api.ajaxCount++;

        var button = getButton(event);

        if (!button || button.name === "Redisplay") {
            api.ajaxCount--;
            return true;
        }

        if ($(button).closest("form").find(":input[type=file]").length > 0) {
            api.ajaxCount--;
            return true;
        }

        // cache before disabled
        cacheAllFormValues();
        startSubmitFeedBack(button);
        var formSerialized = $(this).serializeArray();
        formSerialized[formSerialized.length] = { name: button.name, value: button.value };
        var isDialog = $(this).attr("class") === "Dialog";

        $.post($(this).attr("action"), formSerialized, function (response) {

            if (button.name === "Finder" || button.name === "Selector" || button.name === "ActionAsFinder" || button.name === "InvokeActionAsFinder" || button.name === "InvokeActionAsSave") {

                var divClass = isDialog ? "Parameter" : "Property";

                var propertySelector = "div." + divClass + ":has(button[value='" + $(button).attr("value") + "'])";
                var propertyId = $(propertySelector).attr("id");

                var replaceWith = $("div#" + propertyId, response);

                if (replaceWith.length > 0) {
                    $(propertySelector).replaceWith(replaceWith);
                    $("#" + propertyId).find(":input").each(api.updateChoices);
                }
                else {
                    replacePageBody(response);
                }
            }
            else {
                api.updateTitle(response);
                replacePageBody(response);
            }

            bindToNewHtml(true);

            cacheIfTransient();

            endSubmitFeedBack();
            api.ajaxCount--;
        });
        return false;
    };

    function getIdFromUrl(url) {
        var id = url.substring(url.indexOf('id=') + 3);
        return unescape(id);
    }

    api.isValid = function (draggable, droppable) {
        api.ajaxCount++;

        var url = droppable.attr("data-validate");

        if (!url) {
            api.ajaxCount--;
            return;
        }

        var draggableUrl = draggable.find("a").attr("href");
        var value = getIdFromUrl(draggableUrl);
        var inData = { value: value };

        $.ajaxSetup({ cache: false });
        $.getJSON(url, inData, function (data) {
            if (data === true) {
                droppable.addClass("validdrop");

                // if we go valid when already inside droppable trigger hover
                var dd = $.ui.ddmanager.current;

                $.ui.ddmanager.prepareOffsets(dd);
                $.each($.ui.ddmanager.droppables[dd.options.scope] || [], function () {
                    if ($.ui.intersect(dd, this, dd.options.tolerance || 'intersect')) {
                        if (this.element.hasClass("validdrop")) {
                            this.element.addClass("withindrop");
                        }
                    }
                });
            }
            api.ajaxCount--;
        });
    };

    api.updateOnSelect = function () {
        var propOrParm = $(this).closest("div.Property > div.Object");

        if (propOrParm.length == 0) {
            propOrParm = $(this).closest("div.Parameter > div.Object");
        }

        var newObject = $(this).closest("div.Object");
        var a = propOrParm.find("> a");
        var newA = newObject.find("a");
        var newObjectUrl = newA.attr("href");
        var value = getIdFromUrl(newObjectUrl);

        if (a.length > 0) {
            a.replaceWith(newA);
        }
        else {
            propOrParm.prepend(newA);
        }

        propOrParm.find("> a").text(newObject.contents().filter(function () { return this.nodeType == 3; }).text());

        var img = propOrParm.find("> img");
        var newImg = newObject.find("img");

        if (img.length > 0) {
            img.replaceWith(newImg);
        }
        else {
            propOrParm.prepend(newImg);
        }

        propOrParm.find("input").attr("value", value);

        // if encrypted remove indication 
        var name = propOrParm.find("input").attr("name");

        if (name.indexOf("-encryptedField-") === 0) {
            name = name.substring(16);
            propOrParm.find("input").attr("name", name);
        }

        $(this).closest("div.Collection-List").remove();

        propOrParm.find("input").each(api.updateChoices);
    };

    function bindToNewHtml(updateLink) {

        $("div.History div.Object").draggable({
            helper: 'clone',
            start: function () {
                var draggable = $(this);
                $(".ui-droppable").each(function () {
                    api.isValid(draggable, $(this));
                });
            }
        });

        $("form div.Object").droppable({

            drop: function (event, ui) {
                var draggableUrl = ui.helper.find("a").attr("href");
                var value = getIdFromUrl(draggableUrl);

                var a = $(this).find("a");
                var newA = ui.helper.find("a");

                if (a.length > 0) {
                    a.replaceWith(newA);
                }
                else {
                    $(this).prepend(newA);
                }

                var img = $(this).find("img");
                var newImg = ui.helper.find("img");

                if (img.length > 0) {
                    img.replaceWith(newImg);
                }
                else {
                    $(this).prepend(newImg);
                }

                $(this).find("input").attr("value", value);

                // if encrypted remove indication 
                var name = $(this).find("input").attr("name");

                if (name.indexOf("-encryptedField-") === 0) {
                    name = name.substring(16);
                    $(this).find("input").attr("name", name);
                }
            },

            deactivate: function () {
                $(".validdrop").removeClass("validdrop");
                $(".withindrop").removeClass("withindrop");
            },

            accept: function () {
                return $(this).hasClass("validdrop");
            },

            hoverClass: 'withindrop'

        });
        api.focusOnFirst();
        if (updateLink) {
            updateLinkFromHistory();
        }

        $.validator.unobtrusive.parse($("div#main"));
        // if we are reloading html from cache may still have hasDatepicker attribute. This will prevent 
        // date picker being attached 
        $("input.datetime").removeClass("hasDatepicker");
        $("input.datetime").datepicker();
        $.validator.setDefaults({ onkeyup: false });

        setMinMaxButtonStates();
        setCollectionButtonStates();

        api.bindAjaxError();
    }

    function updatePage(doc, updateLink) {
        api.ajaxCount++;
        $.ajaxSetup({ cache: false });
        var link = doc.attr("href");

        cacheAllFormValues();

        if (link.substring(0, 14) === '/Transient?id=') {

            var id = unescape(link.substring(14));
            var cachedPage = $.jStorage.get("transient:" + id);

            if (cachedPage) {
                $("div#main").html(cachedPage);
                replaceFormValues();
                bindToNewHtml(updateLink);
                api.ajaxCount--;
                return false;
            }
        }


        $.get(link, function (response) {
            api.updateTitle(response);
            replacePageBody(response);
            replaceFormValues();
            bindToNewHtml(updateLink);
            endLinkFeedBack();
            api.ajaxCount--;
        });
        return false;
    }

    api.updatePageFromLink = function () {
        startLinkFeedBack();
        return updatePage($(this), true);
    };

    api.syncPageToAddress = function () {
        startLinkFeedBack();
        return updatePage($(this), false);
    };

    api.markedClicked = function () {
        $("form button.lastClicked").removeClass("lastClicked");
        $(this).addClass("lastClicked");
        return true;
    };

    api.allowSubmit = function () {
        // this allows these buttons to submit form even if invalid - for finders/selectors etc
        $(this).closest("form").validate().cancelSubmit = true;
        return true;
    };

    return api;
} ());

$.address.externalChange(function (event) {
    if (event.value === "/") {
        // ignore root as it causes problems on IIS installations 
        return;
    }
    $("<a href='" + event.value + "'></a>").click(nakedObjects.syncPageToAddress).click();
});

$(window).unload(function () {
    $("form.Edit, form.Dialog").each(function () {
        var formSerialized = $(this).serializeArray();
        nakedObjects.cacheFormValues(formSerialized);
    });
});

$(window).load(function () {
    var url = location.href;
    if (url.indexOf('#') === -1) {
        var homepath = $("div#header > a").attr("href");
        if (location.pathname !== homepath) {
            var link = nakedObjects.getLinkFromHistory();
            if (link) {
                location.href = location.protocol + "//" + location.host + homepath + "/#" + link;
            }
        }
    }
    return true;
});

window.onerror = function (msg, url, linenumber) {
    alert('Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
    return true;
};

nakedObjects.bindAjaxError();

// jquery live binds
$(function () { $("form button").live("click", nakedObjects.markedClicked); });
$(function () { $("form button[name=Finder], form button[name=Redisplay], form button[name=Selector], form button[name=ActionAsFinder], form button[name=InvokeActionAsFinder]").live('click', nakedObjects.allowSubmit); });
$(function () { $("form button[title=Select]").live('click', nakedObjects.updateOnSelect); });
$(function () { $(":input").live("change", nakedObjects.updateChoices); });
$(function () { $(".History form").live("submit", nakedObjects.clearHistory); });
$(function () { $("form:has(button.Summary)").live("submit", nakedObjects.redisplayProperty); });
$(function () { $("form:has(button.Maximize)").live("submit", nakedObjects.redisplayInlineProperty); });
$(function () { $("form.Edit").live("submit", nakedObjects.redisplayProperty); });
$(function () { $(".Menu form.Action, .PropertyList form.Action, .ObjectEdit form.Action, .StandaloneTable form.Action, form.Edit, form.Dialog, .ActionDialog form.Action").live("submit", nakedObjects.updatePageFromAction); });
$(function () { $("div.Object a").live("click", nakedObjects.updatePageFromLink); });
$(function () { $('#checkboxAll').live("change", function () { $("input[type='checkbox']").attr('checked', $('#checkboxAll').is(':checked')); }); }); // use change not click for ie8
$(function () { $("form :input:not(textarea)").live("keydown", nakedObjects.checkForEnter); });