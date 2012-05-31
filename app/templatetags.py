import re
import logging
import cgi
import math
from google.appengine.ext import webapp
from django import template

from app import App
import consts

# get registry, we need it to register our filter later.
register = webapp.template.create_template_register()

def highlight(parser, token):
    try:
        tag_name, phrases_to_highlight, text = token.split_contents()
    except ValueError:
        raise template.TemplateSyntaxError, "%r tag requires exactly 2 arguments" % token.contents[0] 
    return HighlightNode(phrases_to_highlight, text)

class HighlightNode(template.Node):
    def __init__(self, phrases_to_highlight, text):
        self.phrases_to_highlight = phrases_to_highlight
        self.text = text
    
    def render(self, context):
        phrases = []
        text = ''
        try:
            phrases = template.resolve_variable(self.phrases_to_highlight, context)
            text = template.resolve_variable(self.text, context)
        except VariableDoesNotExist:
            pass
        phrases = [(re.escape(p)+r'\w*') for p in phrases]
        regex = re.compile("(%s)" % "|".join(phrases), re.IGNORECASE)
        text = cgi.escape(text)
        text = re.sub(regex, r'<span class="highlight">\1</span>', text)
        return text

@register.inclusion_tag("column_major_order_videos.html")
def column_major_sorted_videos(videos, num_cols=3, column_width=300, gutter=20, font_size=12):

    items_in_column = len(videos) / num_cols
    remainder = len(videos) % num_cols
    link_height = font_size * 1.5 
    # Calculate the column indexes (tops of columns). Since video lists won't divide evenly, distribute
    # the remainder to the left-most columns first, and correctly increment the indices for remaining columns
    column_indices = [(items_in_column * multiplier + (multiplier if multiplier <= remainder else remainder)) for multiplier in range(1, num_cols + 1)]
        
    return {
               "videos": videos,
               "column_width": column_width,
               "column_width_plus_gutter": column_width + gutter,
               "font_size": font_size,
               "link_height": link_height,
               "column_indices": column_indices,
               "list_height": column_indices[0] * link_height,
          }

@register.inclusion_tag("youtube_player_embed.html")
def youtube_player_embed(youtube_id, width=800, height=480):
    return {"youtube_id": youtube_id, "width": width, "height": height}

@register.inclusion_tag("flv_player_embed.html")
def flv_player_embed(video_path, width=800, height=480, exercise_video=None):
    if exercise_video:
        video_path = video_path + exercise_video.video_folder + "/" + exercise_video.readable_id + ".flv"
    return {"video_path": video_path, "width": width, "height": height}

@register.inclusion_tag("knowledgemap_embed.html")
def knowledgemap_embed(exercises, map_coords):
    return {"App": App, "exercises": exercises, "map_coords": map_coords}

@register.inclusion_tag("related_videos.html")
def related_videos_with_points(exercise_videos):
    return related_videos(exercise_videos, True)

@register.inclusion_tag("related_videos.html")
def related_videos(exercise_videos, show_points=False):
    return {"exercise_videos": exercise_videos, "video_points_base": consts.VIDEO_POINTS_BASE, "show_points": show_points}

@register.inclusion_tag("exercise_icon.html")
def exercise_icon(exercise, App):
    s_prefix = "proficient-badge"
    if exercise.summative:
        s_prefix = "challenge"

    src = ""
    if exercise.review:
        src = "/images/proficient-badge-review.png" # No reviews for summative exercises yet
    elif exercise.suggested:
        src = "/images/%s-suggested.png" % s_prefix
    elif exercise.proficient:
        src = "/images/%s-complete.png" % s_prefix
    else:
        src = "/images/%s-not-started.png" % s_prefix

    return {"src": src, "version": App.version }

@register.inclusion_tag("exercise_message.html")
def exercise_message(exercise, coaches, endangered, reviewing, proficient, struggling):
    return {
            "exercise": exercise,
            "coaches": coaches,
            "endangered": endangered,
            "reviewing": reviewing,
            "proficient": proficient,
            "struggling": struggling
            }

@register.inclusion_tag("possible_points_badge.html")
def possible_points_badge(points, possible_points):
    return {"points": points, "possible_points": possible_points}

@register.inclusion_tag("streak_bar.html")
def streak_bar(user_exercise):

    streak = user_exercise.streak
    longest_streak = 0

    if hasattr(user_exercise, "longest_streak"):
        longest_streak = user_exercise.longest_streak

    streak_max_width = 228

    streak_width = min(streak_max_width, math.ceil((streak_max_width / float(user_exercise.required_streak())) * streak))
    longest_streak_width = min(streak_max_width, math.ceil((streak_max_width / float(user_exercise.required_streak())) * longest_streak))
    streak_icon_width = min(streak_max_width - 2, max(43, streak_width)) # 43 is width of streak icon

    width_required_for_label = 20
    show_streak_label = streak_width > width_required_for_label
    show_longest_streak_label = longest_streak_width > width_required_for_label and (longest_streak_width - streak_width) > width_required_for_label

    levels = []
    if user_exercise.summative:
        c_levels = user_exercise.required_streak() / consts.REQUIRED_STREAK
        level_offset = streak_max_width / float(c_levels)
        for ix in range(c_levels - 1):
            levels.append(math.ceil((ix + 1) * level_offset) + 1)

    if streak > consts.MAX_STREAK_SHOWN:
        streak = "Max"

    if longest_streak > consts.MAX_STREAK_SHOWN:
        longest_streak = "Max"

    return {
            "streak": streak,
            "longest_streak": longest_streak,
            "streak_width": streak_width, 
            "longest_streak_width": longest_streak_width, 
            "streak_max_width": streak_max_width,
            "streak_icon_width": streak_icon_width,
            "show_streak_label": show_streak_label,
            "show_longest_streak_label": show_longest_streak_label,
            "levels": levels
            }

@register.inclusion_tag("reports_navigation.html")
def reports_navigation(coach_email, current_report="classreport"):
    return {'coach_email': coach_email, 'current_report': current_report }
    
@register.inclusion_tag(("shared_javascript.html", "../shared_javascript.html"))
def shared_javascript():
    return {'App': App}
@register.inclusion_tag(("exercises_javascript.html", "../exercises_javascript.html"))
def exercises_javascript():
    return {'App': App}
@register.inclusion_tag(("maps_javascript.html", "../maps_javascript.html"))
def maps_javascript():
    return {'App': App}
@register.inclusion_tag(("profile_javascript.html", "../profile_javascript.html"))
def profile_javascript():
    return {'App': App}
@register.inclusion_tag(("shared_css.html", "../shared_css.html"))
def shared_css():
    return {'App': App}

register.tag(highlight)

webapp.template.register_template_library('discussion.templatetags')
webapp.template.register_template_library('badges.templatetags')
webapp.template.register_template_library('profiles.templatetags')

