
var Discussion = {
    player: null,

    init: function() {
        Discussion.prepareYouTubeLinks();
    },

    prepareYouTubeLinks: function() {
        if ($.browser.msie) return;

        $("span.youTube").addClass("playYouTube").removeClass("youTube").click(Discussion.playYouTube);
    },

    playYouTube: function() {
        var seconds = $(this).attr("seconds");
        if (Discussion.player && seconds)
        {
            Discussion.player.seekTo(Math.max(0, seconds - 2), true);

            // If user has scrolled below the youtube video, scroll to top of video
            // when a play link is clicked.
            var yTop = $(Discussion.player).offset().top - 2;
            if ($(window).scrollTop() > yTop) $(window).scrollTop(yTop);
        }
    },

    showThrobberOnRight: function(jTarget) {
        if (!Discussion.jThrobber)
        {
            Discussion.jThrobber = $("<img style='display:none;' src='/images/throbber.gif' class='throbber'/>");
            $(document.body).append(Discussion.jThrobber);
        }

        if (!jTarget.length) return;

        var offset = jTarget.offset();
        Discussion.jThrobber.css("top", (offset.top + (jTarget.height() / 2) - 8) + "px").css(
                                "left", (offset.left + jTarget.width() + 4) + "px").css(
                                "display", "");
    },

    hideThrobber: function() {
        if (Discussion.jThrobber) Discussion.jThrobber.css("display", "none");
    },

    updateRemaining: function(max, textSelector, charsSelector, charCountSelector, parent) {
        setTimeout(function(){
            var c = 0;
            try {
                c = max - parseInt($(textSelector, parent).val().length);
            }
            catch(e) {
                return;
            };

            if (c <= 0)
                $(charsSelector, parent).addClass("chars_remaining_none");
            else
                $(charsSelector, parent).removeClass("chars_remaining_none");

            // Disable submit buttons within form so user can't submit and lose clipped content.
            var jForm = $(textSelector, parent).parents("form");
            if (jForm.length)
            {
                if (c < 0)
                    $("input[type=button]", jForm).addClass("buttonDisabled").attr("disabled", "disabled");
                else
                    $("input[type=button]", jForm).removeClass("buttonDisabled").removeAttr("disabled");
            }
            
            $(charCountSelector, parent).html(c);
        }, 1);
    }
};

var Moderation = {

    init: function() {
        $(".mod_show").live("click", Moderation.showTools);
        $(".mod_tools .mod_edit").live("click", Moderation.editEntity);
        $(".mod_tools .mod_delete").live("click", Moderation.deleteEntity);
        $(".mod_tools .mod_change").live("click", Moderation.changeEntityType);
    },

    showTools: function() {

        var parent = $(this).parents(".mod_tools");
        if (!parent.length) return;

        $(".mod_tools_show", parent).css("display", "none");
        $(".mod_tools_hidden", parent).css("display", "");

        return false;
    },

    deleteEntity: function() {
        return Moderation.actionWithConfirmation(this, 
                "/discussion/deleteentity",
                null,
                "Are you sure you want to delete this?",
                "deleted!");
    },

    editEntity: function() {
        QA.edit(this);
        return false;
    },

    changeEntityType: function() {
        var target_type = $(this).attr("data-target_type");
        if (!target_type) return;

        return Moderation.actionWithConfirmation(this, 
                "/discussion/changeentitytype",
                {target_type: target_type},
                "Are you sure you want to change this to a " + target_type + "?",
                "changed to " + target_type + "!");
    },

    actionWithConfirmation: function(el, sUrl, data, sConfirm, sCompleted) {

        if (!confirm(sConfirm)) return false;

        var key = $(el).attr("data-key");
        if (!key) return false;

        if (!data) data = {};
        data["entity_key"] = key;

        $.post(sUrl, data, function(){ Moderation.finishedAction(el, sCompleted); });

        Discussion.showThrobberOnRight($(el));
        return false;
    },

    finishedAction: function(el, sMsg) {
        var parent = $(el).parents(".mod_tools_hidden");
        if (!parent.length) return;

        parent.text(sMsg);
        Discussion.hideThrobber();
    }

};

var QA = {

    page: 0,

    init: function() {

        var jQuestionText = $(".question_text");
        jQuestionText.focus(QA.focusQuestion);
        jQuestionText.change(QA.updateRemainingQuestion).keyup(QA.updateRemainingQuestion);
        jQuestionText.watermark(jQuestionText.attr("watermark"));

        $("form.questions").submit(function(){return false;});

        $("input.question_submit, input.answer_submit").live("click", QA.submit);
        $(".question_cancel, .answer_cancel").live("click", QA.cancel);

        $(window).resize(QA.repositionStickyNote);

        QA.initPagesAndQuestions();
        QA.enable();
    },

    initPagesAndQuestions: function() {
        $("form.answers").submit(function(){return false;});
        $("a.questions_page").click(function(){ QA.loadPage($(this).attr("page")); return false; });
        $(".questions_container .question_container").mouseover(QA.hover).mouseout(QA.unhover).click(QA.expand);
        $(".add_yours").click(QA.expandAndFocus);
        $(".answer_text").focus(QA.focusAnswer).watermark($(".answer_text").attr("watermark"));
    },

   submit: function() {

        var parent = QA.getQAParent(this);
        if (!parent.length) return;

        var type = $(parent).is(".answer_container") ? "answer" : "question";

        var jText = $("." + type + "_text", parent);

        if (!$.trim(jText.val()).length) return;
        if (jText.val() == jText.attr("watermark")) return;

        var data_suffix = "&page=" + QA.page;

        var sUrl = "/discussion/add" + type;
        var jData = $("form." + type, parent);

        var fxnCallback = type == "question" ? QA.finishSubmitQuestion : QA.finishSubmitAnswer;

        if (QA.isInsideExistingQA(this))
        {
            sUrl = "/discussion/editentity";
            jData = $("textarea:first, input[name=entity_key]:first", parent);
            var jPlaylist = $("#playlist_key:first");
            jData = jData.add(jPlaylist);
        }

        $.post(sUrl, 
                jData.serialize() + data_suffix, 
                function(data) {fxnCallback(data, jText[0]);});

        QA.disable();
        Discussion.showThrobberOnRight($("." + type + "_cancel", parent));
    },

    finishSubmitQuestion: function(data, el) {
        setTimeout(function(){QA.cancel.apply(el)}, 1);
        QA.finishLoadPage(data);
        QA.enable();
    },

    finishSubmitAnswer: function(data, el) {

        var parent = QA.getQuestionParent(el);
        if (!parent.length) return;

        try { eval("var dict_json = " + data); }
        catch(e) { return; }

        setTimeout(function(){QA.cancel.apply(el)}, 1);
        $(".answers_container", parent).html(dict_json.html);
        Discussion.prepareYouTubeLinks();
        Discussion.hideThrobber();
        QA.enable();
    },

    loadPage: function(page) {

        try { page = parseInt(page); }
        catch(e) { return; }

        if (page < 0) return;

        $.get("/discussion/pagequestions", 
                {
                    video_key: $("#video_key").val(), 
                    playlist_key: $("#playlist_key").val(),
                    page: page
                }, 
                QA.finishLoadPage);

        Discussion.showThrobberOnRight($(".questions_page_controls span"));
    },

    finishLoadPage: function(data) {
        try { eval("var dict_json = " + data); }
        catch(e) { return; }

        $(".questions_container").html(dict_json.html);
        QA.page = dict_json.page;
        QA.initPagesAndQuestions();
        Discussion.hideThrobber();
        Discussion.prepareYouTubeLinks();
    },

    getQAParent: function(el) {
        var parentAnswer = $(el).parents("div.answer_container");
        if (parentAnswer.length) return parentAnswer;
        return QA.getQuestionParent(el);
    },

    getQuestionParent: function(el) {
        return $(el).parents("div.question_container");
    },

    isInsideExistingQA: function(el) {
        var parent = QA.getQAParent(el);
        if (!parent.length) return false;
        return $(".sig", parent).length > 0;
    },

    updateRemainingQuestion: function() {
        Discussion.updateRemaining(500, ".question_text", 
                                        ".question_add_controls .chars_remaining",
                                        ".question_add_controls .chars_remaining_count");
    },

    disable: function() {
        $(".question_text, .answer_text").attr("disabled", "disabled");
        $(".question_submit, .answer_submit").addClass("buttonDisabled").attr("disabled", "disabled");
    },

    enable: function() {
        $(".question_text, .answer_text").removeAttr("disabled");
        $(".question_submit, .answer_submit").removeClass("buttonDisabled").removeAttr("disabled");
    },

    showNeedsLoginNote: function(el, sMsg) {
        var jNote = $(".login_note")
        if (jNote.length && el)
        {
            $(".login_action", jNote).text(sMsg);

            var jTarget = $(el);
            var offset = jTarget.offset();

            jNote.css("visibility", "hidden").css("display", "");
            var top = offset.top + (jTarget.height() / 2) - (jNote.height() / 2);
            var left = offset.left + (jTarget.width() / 2) - (jNote.width() / 2);
            jNote.css("top", top).css("left", left).css("visibility", "visible").css("display", "");

            setTimeout(function(){$(".login_link").focus();}, 50);
            return true;
        }
        return false;
    },

    edit: function(el) {
        var parent = QA.getQAParent(el);

        if (!parent.length) return;

        var type = $(parent).is(".answer_container") ? "answer" : "question";

        var jEntity = $("." + type, parent);
        var jControls = $("." + type + "_controls_container", parent);
        var jSignature = $("." + type + "_sig", parent);

        if (!jEntity.length || !jControls.length || !jSignature.length) return;

        jEntity.addClass(type + "_placeholder").removeClass(type);
        jSignature.css("display", "none");
        jControls.slideDown();

        // Build up a textarea with plaintext content
        var jTextarea = $("<textarea name='" + type + "_text' class='" + type + "_text' rows=2 cols=40></textarea>");

        // Replace BRs with newlines.  Must use {newline} placeholder instead of \n b/c IE
        // doesn't preserve newline content when asking for .text() content below.
        var reBR = /<br>/gi;
        var reBRReverse = /{newline}/g;
        var jContent = $("<div>").html(jEntity.html().replace(reBR, "{newline}"));

        // Remove any artificially inserted ellipsis
        $(".ellipsisExpand", jContent).remove();

        // Fill, insert, then focus textarea
        jTextarea.val($.trim(jContent.text().replace(reBRReverse, "\n")));
        $("span", jEntity).first().css("display", "none").after(jTextarea);

        setTimeout(function(){jTextarea.focus();}, 1);
    },

    focusQuestion: function() {

        if (QA.showNeedsLoginNote(this, "to ask your question.")) return false;

        var parent = QA.getQAParent(this);
        if (!parent.length) return;

        $(".question_controls_container", parent).slideDown("fast");
        QA.updateRemainingQuestion();
        QA.showStickyNote();
    },

    cancel: function() {
        var parent = QA.getQAParent(this);
        if (!parent.length) return;

        var type = $(parent).is(".answer_container") ? "answer" : "question";

        $("." + type + "_text", parent).val("").watermark($("." + type + "_text").attr("watermark"));

        if (type == "question") QA.hideStickyNote();

        $("." + type + "_controls_container", parent).slideUp("fast");

        if (QA.isInsideExistingQA(this))
        {
            $("textarea", parent).first().remove();
            $("span", parent).first().css("display", "");
            $("." + type + "_placeholder", parent).addClass(type).removeClass(type + "_placeholder");
            $("." + type + "_sig", parent).slideDown("fast");
        }

        return false;
    },

    focusAnswer: function() {

        if (QA.showNeedsLoginNote(this, "to answer this question.")) return false;

        var parent = QA.getQAParent(this);
        if (!parent.length) return;

        $(".answer_controls_container", parent).slideDown("fast");
    },

    hover: function() {
        if ($(this).is(".question_container_expanded")) return;

        $(this).addClass("question_container_hover");
    },

    unhover: function() {
        if ($(this).is(".question_container_expanded")) return;

        $(this).removeClass("question_container_hover");
    },

    repositionStickyNote: function() {
        if ($(".sticky_note").is(":visible")) QA.showStickyNote();
    },

    showStickyNote: function() {
        $(".sticky_note").slideDown("fast");
    },

    hideStickyNote: function() {
        $(".sticky_note").slideUp("fast");
    },

    expandAndFocus: function(e) {

        var parent = QA.getQAParent(this);
        if (!parent.length) return;

        QA.expand.apply(parent[0], [e, function(){$(".answer_text", parent).focus();}]);
        return false;
    },

    expand: function(e, fxnCallback) {
        if ($(this).is(".question_container_expanded")) return;

        var jContentUrlized = $(".question span.question_content_urlized", this);
        $(".question a.question_link", this).replaceWith(jContentUrlized);
        jContentUrlized.css("display", "");
        $(".question_answer_count", this).css("display", "none");
        $(".answers_and_form_container", this).slideDown("fast", fxnCallback);

        QA.unhover.apply(this);

        $(this).addClass("question_container_expanded");

        var id = $(".question", this).attr("data-question_id");
        $.post("/discussion/expandquestion", 
                {qa_expand_id: id}, 
                function(){ /* Fire and forget */ });

        // If user clicks on a link inside of a question during the expand, don't follow the link.
        // YouTube API "5:42"-style links will still control the player in this circumstance.
        if (e) e.preventDefault();
    }

};

var Comments = {

    page: 0,

    init: function() {
        $("a.comment_add").click(Comments.add);
        $("a.comment_show").click(Comments.show);
        $("a.comment_cancel").click(Comments.cancel);
        $("input.comment_submit").click(Comments.submit);
        $("form.comments").submit(function(){return false;});
        $(".comment_text").change(Comments.updateRemaining).keyup(Comments.updateRemaining);

        Comments.initPages();
        Comments.enable();
    },

    initPages: function() {
        $("a.comments_page").click(function(){ Comments.loadPage($(this).attr("page")); return false; });
        $("span.ellipsisExpand").click(Comments.expand);
    },

    expand: function() {
        var parent = $(this).parents("div.comment");
        if (!parent.length) return;

        $(this).css("display", "none");
        $("span.hiddenExpand", parent).removeClass("hiddenExpand");
    },

    loadPage: function(page) {

        try { page = parseInt(page); }
        catch(e) { return; }

        if (page < 0) return;

        $.get("/discussion/pagecomments", 
                {
                    video_key: $("#video_key").val(), 
                    playlist_key: $("#playlist_key").val(),
                    page: page
                }, 
                Comments.finishLoadPage);

        Discussion.showThrobberOnRight($(".comments_page_controls span"));
    },

    finishLoadPage: function(data) {
        try { eval("var dict_json = " + data); }
        catch(e) { return; }

        $(".comments_container").html(dict_json.html);
        Comments.page = dict_json.page;
        Comments.initPages();
        Discussion.hideThrobber();
        Discussion.prepareYouTubeLinks();
    },

    add: function() {
        $(this).css("display", "none");
        $("div.comment_form").slideDown("fast", function(){$(".comment_text").focus();});
        Comments.updateRemaining();
        return false;
    },

    cancel: function() {
        $("a.comment_add").css("display", "");
        $("div.comment_form").slideUp("fast");
        $(".comment_text").val("");
        return false;
    },

    show: function() {
        $("div.comments_hidden").slideDown("fast");
        $(".comments_show_more").css("display", "none");
        return false;
    },

    submit: function() {

        if (!$.trim($(".comment_text").val()).length) return;

        var fCommentsHidden = $("div.comments_hidden").length && !$("div.comments_hidden").is(":visible");
        var data_suffix = "&comments_hidden=" + (fCommentsHidden ? "1" : "0");
        $.post("/discussion/addcomment", 
                $("form.comments").serialize() + data_suffix, 
                Comments.finishSubmit);

        Comments.disable();
        Discussion.showThrobberOnRight($(".comment_cancel"));
    },

    finishSubmit: function(data) {
        Comments.finishLoadPage(data);
        $(".comment_text").val("");
        Comments.updateRemaining();
        Comments.enable();
        Comments.cancel();
    },

    disable: function() {
        $(".comment_text, .comment_submit").attr("disabled", "disabled");
    },

    enable: function() {
        $(".comment_text, .comment_submit").removeAttr("disabled");
    },

    updateRemaining: function() {
        Discussion.updateRemaining(300, ".comment_text", 
                                        ".comment_add_controls .chars_remaining",
                                        ".comment_add_controls .chars_remaining_count");
    }

};

$(document).ready(Discussion.init);
$(document).ready(Comments.init);
$(document).ready(QA.init);
$(document).ready(Moderation.init);

// Now that we enable YouTube's JS api so we can control the player w/ "{minute}:{second}"-style links,
// we are vulnerable to a bug in IE's flash player's removeCallback implementation.  This wouldn't harm
// most users b/c it only manifests itself during page unload, but for anybody with IE's "show all errors"
// enabled, it becomes an annoying source of "Javascript error occurred" popups on unload.
// So we manually fix up the removeCallback function to be a little more forgiving.
// See http://www.fusioncharts.com/forum/Topic12189-6-1.aspx#bm12281, http://swfupload.org/forum/generaldiscussion/809,
// and http://www.longtailvideo.com/support/forums/jw-player/bug-reports/10374/javascript-error-with-embed.
$(window).unload(
function() {
    (function($){
        $(function(){
            if (typeof __flash__removeCallback != 'undefined'){
                __flash__removeCallback = function(instance, name){
                    if (instance != null && name != null)
                        instance[name] = null;
                };
            }
        });
    })(jQuery);
});
