# import the webapp module
from google.appengine.ext import webapp

import badges
import util_badges

register = webapp.template.create_template_register()

@register.inclusion_tag(("../badges/notifications.html", "badges/notifications.html"))
def badge_notifications():
    user_badges = badges.UserBadgeNotifier.pop_for_current_user()

    all_badges_dict = util_badges.all_badges_dict()
    for user_badge in user_badges:
        user_badge.badge = all_badges_dict.get(user_badge.badge_name)

    user_badges = filter(lambda user_badge: user_badge.badge is not None, user_badges)

    if len(user_badges) > 1:
        user_badges = sorted(user_badges, reverse=True, key=lambda user_badge: user_badge.badge.points)[:badges.UserBadgeNotifier.NOTIFICATION_LIMIT]

    return {"user_badges": user_badges}

@register.inclusion_tag(("../badges/badge_counts.html", "badges/badge_counts.html"))
def badge_counts(user_data=None):

    counts_dict = {}
    if user_data is None:
        counts_dict = badges.BadgeCategory.empty_count_dict()
    else:
        counts_dict = util_badges.get_badge_counts(user_data)

    sum_counts = 0
    for key in counts_dict:
        sum_counts += counts_dict[key]

    return {
            "sum": sum_counts,
            "bronze": counts_dict[badges.BadgeCategory.BRONZE],
            "silver": counts_dict[badges.BadgeCategory.SILVER],
            "gold": counts_dict[badges.BadgeCategory.GOLD],
            "platinum": counts_dict[badges.BadgeCategory.PLATINUM],
            "diamond": counts_dict[badges.BadgeCategory.DIAMOND],
            "master": counts_dict[badges.BadgeCategory.MASTER],
    }

@register.inclusion_tag(("../badges/badge_block.html", "badges/badge_block.html"))
def badge_block(badge, user_badge=None, show_frequency=False):
    extended_description = badge.extended_description()
    if badge.is_teaser_if_unknown and user_badge is None:
        extended_description = "???"

    frequency = None
    if show_frequency:
        frequency = badge.frequency()

    return {"badge": badge, "user_badge": user_badge, "extended_description": extended_description, "frequency": frequency}
