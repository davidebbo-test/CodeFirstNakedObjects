var nakedObjectsBasic = (function () {

    var api = {};
    api.checkForEnter = function (event) {
        if (event.keyCode === 13) { // 13 = Enter
            // Prevent the standard 'enter' action from occurring, and click on the first found OK button instead.
            $("button.OK").first().click();
            // Return false to prevent the standard 'enter' action.
            return false;
        }
        else {
            return true;
        }
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

    api.focusOnFirst = function () {
        setMinMaxButtonStates();
        setCollectionButtonStates();

        $("input[type='text'],input[type='checkbox'],select,textarea").first().focus();
        $("div.ActionDialog input[type='text'], div.FindDialog input[type='text']").keydown(checkForEnter);
    };

    return api;
} ());

$(document).ready(nakedObjectsBasic.focusOnFirst);
$(function () { $('#checkboxAll').live("click", function () { $("input[type='checkbox']").attr('checked', $('#checkboxAll').is(':checked')); }); });
$(function () { $('.datetime').datepicker(); });
$(document).keypress(nakedObjectsBasic.checkForEnter);