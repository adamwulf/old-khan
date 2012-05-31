#!/usr/bin/python
# -*- coding: utf-8 -*-
import cgi
import os
import datetime
import time
import random
import urllib
import logging
import re
from urlparse import urlparse
from pprint import pformat
from google.appengine.runtime.apiproxy_errors import CapabilityDisabledError
from google.appengine.runtime.apiproxy_errors import DeadlineExceededError 

import django.conf

try:
    django.conf.settings.configure(
        DEBUG=False,
        TEMPLATE_DEBUG=False,
        TEMPLATE_LOADERS=(
          'django.template.loaders.filesystem.load_template_source',
        ),
        TEMPLATE_DIRS=(os.path.dirname(__file__),)
    )
except EnvironmentError:
    pass

from django.template.loader import render_to_string
from django.utils import simplejson
from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db

import gdata.youtube
import gdata.youtube.service
import gdata.alt.appengine
import qbrary
import bulk_update.handler
import facebook
import layer_cache
import autocomplete
import coaches
import api
import knowledgemap
import consts

from search import Searchable
import search

from app import App
import app
import util
import request_handler
import points
import exercise_statistics
import backfill
import activity_summary

from models import UserExercise, Exercise, UserData, Video, Playlist, ProblemLog, VideoPlaylist, ExerciseVideo, ExercisePlaylist, ExerciseGraph, Setting, UserVideo, UserPlaylist, VideoLog

from discussion import comments
from discussion import qa
from discussion import notification

from badges import util_badges
from badges import last_action_cache

from profiles import util_profile

from topics_list import topics_list, all_topics_list, DVD_list

        
class VideoDataTest(request_handler.RequestHandler):

    def get(self):
        if not users.is_current_user_admin():
            self.redirect(users.create_login_url(self.request.uri))
            return
        self.response.out.write('<html>')
        videos = Video.all()
        for video in videos:
            self.response.out.write('<P>Title: ' + video.title)


class DataStoreTest(request_handler.RequestHandler):

    def get(self):
        if users.is_current_user_admin():
            self.response.out.write('<html>')
            user = util.get_current_user()
            if user:
                problems_done = ProblemLog.all()
                for problem in problems_done:
                    self.response.out.write('<P>' + problem.user.nickname() + ' ' + problem.exercise + ' done:' + str(problem.time_done) + ' taken:' + str(problem.time_taken) + ' correct:'
                                            + str(problem.correct))
        else:
            self.redirect(users.create_login_url(self.request.uri))


# Setting this up to make sure the old Video-Playlist associations are flushed before the bulk upload from the local datastore (with the new associations)


class DeleteVideoPlaylists(request_handler.RequestHandler):
# Deletes at most 200 Video-Playlist associations that are no longer live.  Should be run every-now-and-then to make sure the table doesn't get too big
    def get(self):
        if not users.is_current_user_admin():
            self.redirect(users.create_login_url(self.request.uri))
            return
        query = VideoPlaylist.all()
        all_video_playlists = query.fetch(200)
        video_playlists_to_delete = []
        for video_playlist in all_video_playlists:
            if video_playlist.live_association != True:
                video_playlists_to_delete.append(video_playlist)
        db.delete(video_playlists_to_delete)


class KillLiveAssociations(request_handler.RequestHandler):
    def get(self):
        if not users.is_current_user_admin():
            self.redirect(users.create_login_url(self.request.uri))
            return
        query = VideoPlaylist.all()
        all_video_playlists = query.fetch(100000)
        for video_playlist in all_video_playlists:
            video_playlist.live_association = False
        db.put(all_video_playlists)


class UpdateVideoReadableNames(request_handler.RequestHandler):  #Makes sure every video and playlist has a unique "name" that can be used in URLs

    def get(self):
        if not users.is_current_user_admin():
            self.redirect(users.create_login_url(self.request.uri))
            return
        query = Video.all()
        all_videos = query.fetch(100000)
        for video in all_videos:
            potential_id = re.sub('[^a-z0-9]', '-', video.title.lower());
            potential_id = re.sub('-+$', '', potential_id)  # remove any trailing dashes (see issue 1140)
            potential_id = re.sub('^-+', '', potential_id)  # remove any leading dashes (see issue 1526)                        
            if video.readable_id == potential_id: # id is unchanged
                continue
            number_to_add = 0
            current_id = potential_id
            while True:
                query = Video.all()
                query.filter('readable_id=', current_id)
                if (query.get() is None): #id is unique so use it and break out
                    video.readable_id = current_id
                    video.put()
                    break
                else: # id is not unique so will have to go through loop again
                    number_to_add+=1
                    current_id = potential_id+'-'+number_to_add                       
        
class UpdateVideoData(request_handler.RequestHandler):

    def get(self):
        if not users.is_current_user_admin():
            self.redirect(users.create_login_url(self.request.uri))
            return

        self.response.out.write('<html>')
        yt_service = gdata.youtube.service.YouTubeService()
        playlist_feed = yt_service.GetYouTubePlaylistFeed(uri='http://gdata.youtube.com/feeds/api/users/khanacademy/playlists?start-index=1&max-results=50')

        # deletes the specified entities, 10 at a time, to avoid:
        # http://code.google.com/p/googleappengine/issues/detail?id=3397
        # when using dev_appserver.py --use_sqlite
        def delete_entities(ents):
            start = 0
            while start < len(ents):
                end = min(start+10, len(ents))
                db.delete(ents[start:end])
                start = end
                
        # The next block makes all current VideoPlaylist entries false so that we don't get remnant associations
        query = VideoPlaylist.all()
        all_video_playlists = []
        for video_playlist in query:
            video_playlist.live_association = False
            all_video_playlists.append(video_playlist)
        db.put(all_video_playlists)

        for playlist in playlist_feed.entry:
            self.response.out.write('<p>Playlist  ' + playlist.id.text)
            playlist_id = playlist.id.text.replace('http://gdata.youtube.com/feeds/api/users/khanacademy/playlists/', '')
            playlist_uri = playlist.id.text.replace('users/khanacademy/', '')
            query = Playlist.all()
            query.filter('youtube_id =', playlist_id)
            playlist_data = query.get()
            if not playlist_data:
                playlist_data = Playlist(youtube_id=playlist_id)
                self.response.out.write('<p><strong>Creating Playlist: ' + playlist.title.text + '</strong>')
            playlist_data.url = playlist_uri
            playlist_data.title = playlist.title.text
            playlist_data.description = playlist.description.text
            playlist_data.put()
            playlist_data.index()
            playlist_data.indexed_title_changed()
            
            for i in range(0, 4):
                start_index = i * 50 + 1
                video_feed = yt_service.GetYouTubePlaylistVideoFeed(uri=playlist_uri + '?start-index=' + str(start_index) + '&max-results=50')
                video_data_list = []
                for video in video_feed.entry:

                    video_id = cgi.parse_qs(urlparse(video.media.player.url).query)['v'][0]
                    query = Video.all()
                    query.filter('youtube_id =', video_id.decode('windows-1252'))
                    video_data = query.get()
                    if not video_data:
                        video_data = Video(youtube_id=video_id.decode('windows-1252'))
                        self.response.out.write('<p><strong>Creating Video: ' + video.media.title.text.decode('windows-1252') + '</strong>')
                        video_data.playlists = []
                    video_data.title = video.media.title.text.decode('windows-1252')
                    video_data.url = video.media.player.url.decode('windows-1252')
                    video_data.duration = int(video.media.duration.seconds)
                    video_data.views = int(video.statistics.view_count)

                    if video.media.description.text is not None:
                        video_data.description = video.media.description.text.decode('windows-1252')
                    else:
                        video_data.decription = ' '

                    if playlist.title.text not in video_data.playlists:
                        video_data.playlists.append(playlist.title.text.decode('windows-1252'))
                    video_data.keywords = video.media.keywords.text.decode('windows-1252')
                    video_data.position = video.position
                    video_data_list.append(video_data)
                db.put(video_data_list)
                for video_data in video_data_list:
                    video_data.index()
                    video_data.indexed_title_changed()

                playlist_videos = []
                for video_data in video_data_list:                
                    query = VideoPlaylist.all()
                    query.filter('playlist =', playlist_data.key())
                    query.filter('video =', video_data.key())
                    playlist_video = query.get()
                    if not playlist_video:
                        playlist_video = VideoPlaylist(playlist=playlist_data.key(), video=video_data.key())
                        self.response.out.write('<p><strong>Creating VideoPlaylist(' + playlist_data.title + ',' + video_data.title + ')</strong>')
                    else:
                        self.response.out.write('<p>Updating VideoPlaylist(' + playlist_video.playlist.title + ',' + playlist_video.video.title + ')')
                    playlist_video.live_association = True
                    playlist_video.video_position = int(video_data.position.text)
                    playlist_videos.append(playlist_video)
                db.put(playlist_videos)


class ViewExercise(request_handler.RequestHandler):

    def get(self):
        user = util.get_current_user()
        if user:
            exid = self.request.get('exid')
            key = self.request.get('key')
            problem_number = self.request.get('problem_number')
            time_warp = self.request.get('time_warp')

            user_data = UserData.get_or_insert_for(user)

            query = Exercise.all()
            query.filter('name =', exid)
            exercise = query.get()

            if not exid:
                exid = 'addition_1'

            userExercise = user_data.get_or_insert_exercise(exercise)

            if not problem_number:
                problem_number = userExercise.total_done+1

            # When viewing a problem out-of-order, show read-only view
            read_only = self.request_bool('read_only', default=False) or problem_number != (userExercise.total_done + 1)

            exercise_non_summative = exercise.non_summative_exercise(problem_number)

            # If read-only and an explicit exid is provided for non-summative content, use
            # overriding exercise
            if read_only:
                exid_non_summative = self.request_string('exid_non_summative', default=None)
                if exid_non_summative:
                    query = Exercise.all()
                    query.filter('name =', exid_non_summative)
                    exercise_non_summative = query.get()
                    
            exercise_videos = exercise_non_summative.related_videos().fetch(10)

            proficient = exercise.proficient = user_data.is_proficient_at(exid)
            suggested = exercise.suggested = user_data.is_suggested(exid)
            reviewing = exercise.review = user_data.is_reviewing(exid, userExercise, self.get_time())
            struggling = user_data.is_struggling_with(exid)
            endangered = proficient and userExercise.streak == 0 and userExercise.longest_streak >= exercise.required_streak()

            exercise_points = points.ExercisePointCalculator(exercise, userExercise, suggested, proficient)
                   
            logout_url = users.create_logout_url(self.request.uri)
            
            # Note: if they just need a single problem for review they can just print this page.
            num_problems_to_print = max(2, exercise.required_streak() - userExercise.streak)
            
            # If the user is proficient, assume they want to print a bunch of practice problems.
            if proficient:
                num_problems_to_print = exercise.required_streak()

            if exercise.summative:
                # Make sure UserExercise has proper summative value even before it's been set.
                userExercise.summative = True
                # We can't currently print summative exercises.
                num_problems_to_print = 0

            template_values = {
                'App' : App,
                'arithmetic_template': 'arithmetic_template.html',
                'username': user.nickname(),
                'user_data': user_data,
                'points': user_data.points,
                'exercise_points': exercise_points,
                'coaches': user_data.coaches,
                'proficient': proficient,
                'endangered': endangered,
                'reviewing': reviewing,
                'struggling': struggling,
                'suggested': suggested,
                'cookiename': user.nickname().replace('@', 'at'),
                'key': userExercise.key(),
                'exercise': exercise,
                'exid': exid,
                'start_time': time.time(),
                'exercise_videos': exercise_videos,
                'exercise_non_summative': exercise_non_summative,
                'extitle': exid.replace('_', ' ').capitalize(),
                'user_exercise': userExercise,
                'logout_url': logout_url,
                'streak': userExercise.streak,
                'time_warp': time_warp,
                'problem_number': problem_number,
                'read_only': read_only,
                'num_problems_to_print': num_problems_to_print,
                'issue_labels': ('Component-Code,Exercise-%s,Problem-%s' % (exid, problem_number))
                }
            template_file = exercise_non_summative.name + '.html'
            if not exercise.summative and exercise.raw_html is not None:
                exercise.ensure_sanitized()
                template_file = 'caja_template.html'

            path = os.path.join(os.path.dirname(__file__), template_file)
            self.response.out.write(template.render(path, template_values))
        else:

            self.redirect(util.create_login_url(self.request.uri))
    def get_time(self):
        time_warp = int(self.request.get('time_warp') or '0')
        return datetime.datetime.now() + datetime.timedelta(days=time_warp)


class OldViewVideo(request_handler.RequestHandler):

    def get(self):
        user = util.get_current_user()
        user_data = UserData.get_for_current_user()
        logout_url = users.create_logout_url(self.request.uri)
        video = None
        video_id = self.request.get('v')
        path = self.request.path
        readable_id  = urllib.unquote(path.rpartition('/')[2])
        if video_id: # Support for old links
            query = Video.all()
            query.filter('youtube_id =', video_id)
            video = query.get()
            readable_id = video.readable_id
            self.redirect("/video/"+urllib.quote(readable_id), True)
            return
        
        if readable_id:
            readable_id = re.sub('-+$', '', readable_id)  # remove any trailing dashes (see issue 1140)
            query = Video.all()
            query.filter('readable_id =', readable_id)
            # The following should just be:
            # video = query.get()
            # but the database currently contains multiple Video objects for a particular
            # video.  Some are old.  Some are due to a YouTube sync where the youtube urls
            # changed and our code was producing youtube_ids that ended with '_player'.
            # This hack gets the most recent valid Video object.
            key_id = 0
            for v in query:
                if v.key().id() > key_id and not v.youtube_id.endswith('_player'):
                    video = v
                    key_id = v.key().id()
            # End of hack
            
        if video is None:
            error_message = "No video found for ID '%s'" % readable_id
            logging.error(error_message)
            report_issue_handler = ReportIssue()
            report_issue_handler.initialize(self.request, self.response)
            report_issue_handler.write_response('Defect', {'issue_labels': 'Component-Videos,Video-%s' % readable_id,
                                                           'message': 'Error: %s' % error_message})
            return

            
        query = db.GqlQuery("SELECT * FROM VideoPlaylist WHERE video = :1 AND live_association = TRUE", video)
        video_playlists = query.fetch(5)

        for video_playlist in video_playlists:
            query = VideoPlaylist.all()
            query.filter('playlist =', video_playlist.playlist)
            query.filter('live_association = ', True) 
            query.order('video_position')
            video_playlist.videos = query.fetch(500)

            for videos_in_playlist in video_playlist.videos:
                if videos_in_playlist.video_position == video_playlist.video_position:
                    videos_in_playlist.current_video = True
                else:
                    videos_in_playlist.current_video = False
                if videos_in_playlist.video_position == video_playlist.video_position - 1:
                    video_playlist.previous_video = videos_in_playlist.video
                if videos_in_playlist.video_position == video_playlist.video_position + 1:
                    video_playlist.next_video = videos_in_playlist.video

        # If a QA question is being expanded, we want to clear notifications for its
        # answers before we render page_template so the notification icon shows
        # its updated count. 
        notification.clear_question_answers_for_current_user(self.request.get("qa_expand_id"))
                
        template_values = qa.add_template_values({'App': App,
                                                  'points': user_data.points,
                                                  'username': user and user.nickname() or "",
                                                  'login_url': util.create_login_url(self.request.uri),
                                                  'logout_url': logout_url,
                                                  'video': video,
                                                  'video_playlists': video_playlists, 
                                                  'issue_labels': ('Component-Videos,Video-%s' % readable_id)}, 
                                                 self.request)
        path = os.path.join(os.path.dirname(__file__), 'viewvideo.html')
        self.response.out.write(template.render(path, template_values))


def get_mangled_playlist_name(playlist_name):
    for char in " :()":
        playlist_name = playlist_name.replace(char, "")
    return playlist_name
    
 

class ViewVideo(request_handler.RequestHandler):

    def get(self):

        def report_missing_video(readable_id):
            error_message = "No video found for ID '%s'" % readable_id
            logging.error(error_message)
            report_issue_handler = ReportIssue()
            report_issue_handler.initialize(self.request, self.response)
            report_issue_handler.write_response('Defect', {'issue_labels': 'Component-Videos,Video-%s' % readable_id,
                                                           'message': 'Error: %s' % error_message})
            return

        # This method displays a video in the context of a particular playlist.
        # To do that we first need to find the appropriate playlist.  If we aren't 
        # given the playlist title in a query param, we need to find a playlist that
        # the video is a part of.  That requires finding the video, given it readable_id
        # or, to support old URLs, it's youtube_id.
        video = None
        playlist = None
        video_id = self.request.get('v')
        playlist_title = self.request.get('playlist')
        path = self.request.path
        readable_id  = urllib.unquote(path.rpartition('/')[2])
        readable_id = re.sub('-+$', '', readable_id)  # remove any trailing dashes (see issue 1140)
 
        # If either the readable_id or playlist title is missing, 
        # redirect to the canonical URL that contains them 
        redirect_to_canonical_url = False
        if video_id: # Support for old links
            query = Video.all()
            query.filter('youtube_id =', video_id)
            video = query.get()
            readable_id = video.readable_id
            playlist = video.first_playlist()
            redirect_to_canonical_url = True

        if playlist_title is not None and len(playlist_title) > 0:
            query = Playlist.all().filter('title =', playlist_title)
            key_id = 0
            for p in query:
                if p.key().id() > key_id and not p.youtube_id.endswith('_player'):
                    playlist = p
                    key_id = p.key().id()

        # If a playlist_title wasn't specified or the specified playlist wasn't found
        # use the first playlist for the requested video.
        if playlist is None:
            # Get video by readable_id just to get the first playlist for the video
            video = Video.get_for_readable_id(readable_id)
            if video is None:
                report_missing_video(readable_id)
                return
            playlist = video.first_playlist()
            redirect_to_canonical_url = True
 
        if redirect_to_canonical_url:
            self.redirect("/video/%s?playlist=%s" % (urllib.quote(readable_id), urllib.quote(playlist.title)), True)
            return
            
        # If we got here, we have a readable_id and a playlist_title, so we can display
        # the playlist and the video in it that has the readable_id.  Note that we don't 
        # query the Video entities for one with the requested readable_id because in some
        # cases there are multiple Video objects in the datastore with the same readable_id
        # (e.g. there are 2 "Order of Operations" videos).           
            
        videos = VideoPlaylist.get_cached_videos_for_playlist(playlist)
        previous_video = None
        next_video = None
        for v in videos:
            if v.readable_id == readable_id:
                v.selected = 'selected'
                video = v
            elif video is None:
                previous_video = v
            elif next_video is None:
                next_video = v

        if video is None:
            report_missing_video(readable_id)
            return

        playlists = VideoPlaylist.get_cached_playlists_for_video(video)
        for p in playlists:
            if (playlist is None or p.youtube_id == playlist.youtube_id):
                p.selected = 'selected'
                playlist = p
                playlists.remove(p)
                break

        if App.offline_mode:
            video_path = "/videos/" + get_mangled_playlist_name(playlist_title) + "/" + video.readable_id + ".flv" 
        else:
            video_path = "http://www.archive.org/download/KhanAcademy_" + get_mangled_playlist_name(playlist_title) + "/" + video.readable_id + ".flv" 

        exercise_videos = ExerciseVideo.all().filter('video =', video)
        exercise_video = exercise_videos.get()
        exercise = None
        if exercise_video:
            exercise = exercise_video.exercise.name            
                            
        if video.description == video.title:
            video.description = None

        user_video = UserVideo.get_for_video_and_user(video, util.get_current_user())
        awarded_points = 0
        if user_video is not None:
            awarded_points = user_video.points()

        # If a QA question is being expanded, we want to clear notifications for its
        # answers before we render page_template so the notification icon shows
        # its updated count. 
        notification.clear_question_answers_for_current_user(self.request.get("qa_expand_id"))

        template_values = qa.add_template_values({'playlist': playlist,
                                                  'playlists': playlists,
                                                  'video': video,
                                                  'videos': videos,
                                                  'video_path': video_path,
                                                  'user': util.get_current_user(),
                                                  'video_points_base': consts.VIDEO_POINTS_BASE,
                                                  'awarded_points': awarded_points,
                                                  'exercise': exercise,
                                                  'exercise_videos': exercise_videos,
                                                  'previous_video': previous_video,
                                                  'next_video': next_video,
                                                  'issue_labels': ('Component-Videos,Video-%s' % readable_id)}, 
                                                 self.request)
        self.render_template('viewvideo.html', template_values)

class LogVideoProgress(request_handler.RequestHandler):
    
    def post(self):

        user = util.get_current_user()
        video_points_total = 0
        points_total = 0

        if user:

            video_key = self.request.get("video_key")
            video = db.get(video_key)

            if video:

                user_data = UserData.get_or_insert_for(user)
                user_video = UserVideo.get_for_video_and_user(video, user, insert_if_missing=True)

                video_points_previous = points.VideoPointCalculator(user_video)

                seconds_watched = 0
                try:
                    # Seconds watched is restricted by both the scrubber's position
                    # and the amount of time spent on the video page
                    # so we know how *much* of each video each student has watched
                    seconds_watched = int(float(self.request.get("seconds_watched")))
                except ValueError:
                    pass # Ignore if we can't parse

                # Cap seconds_watched at duration of video
                seconds_watched = min(seconds_watched, video.duration)

                last_second_watched = 0
                try:
                    last_second_watched = int(float(self.request.get("last_second_watched")))
                except ValueError:
                    pass # Ignore if we can't parse

                action_cache=last_action_cache.LastActionCache.get_for_user(user)
                last_video_log = action_cache.get_last_video_log()

                # If the last video logged is not this video and the times being credited
                # overlap, don't give points for this video. Can only get points for one video
                # at a time.
                if last_video_log and last_video_log.key_for_video() != video.key():
                    dt_now = datetime.datetime.now()
                    if last_video_log.time_watched > (dt_now - datetime.timedelta(seconds=seconds_watched)):
                        return

                video_log = VideoLog()
                video_log.user = user
                video_log.video = video
                video_log.video_title = video.title
                video_log.seconds_watched = seconds_watched

                if last_second_watched > user_video.last_second_watched:
                    user_video.last_second_watched = last_second_watched

                if seconds_watched > 0:
                    user_video.seconds_watched += seconds_watched
                    user_data.total_seconds_watched += seconds_watched

                    # Update seconds_watched of all associated UserPlaylists
                    query = VideoPlaylist.all()
                    query.filter('video =', video)
                    query.filter('live_association = ', True)

                    first_video_playlist = True
                    for video_playlist in query:
                        user_playlist = UserPlaylist.get_for_playlist_and_user(video_playlist.playlist, user, insert_if_missing=True)
                        user_playlist.title = video_playlist.playlist.title
                        user_playlist.seconds_watched += seconds_watched
                        user_playlist.last_watched = datetime.datetime.now()
                        user_playlist.put()

                        video_log.playlist_titles.append(user_playlist.title)

                        if first_video_playlist:
                            action_cache.push_video_log(video_log)

                        util_badges.update_with_user_playlist(
                                user, 
                                user_data, 
                                user_playlist,
                                include_other_badges = first_video_playlist,
                                action_cache = action_cache)

                        first_video_playlist = False

                user_video.last_watched = datetime.datetime.now()
                user_video.duration = video.duration

                user_data.last_activity = user_video.last_watched

                video_points_total = points.VideoPointCalculator(user_video)
                video_points_received = video_points_total - video_points_previous

                if not user_video.completed and video_points_total >= consts.VIDEO_POINTS_BASE:
                    # Just finished this video for the first time
                    user_video.completed = True
                    user_data.videos_completed = -1

                if video_points_received > 0:
                    video_log.points_earned = video_points_received
                    user_data.add_points(video_points_received)

                db.put([user_video, video_log, user_data])

                points_total = user_data.points

        json = simplejson.dumps({"points": points_total, "video_points": video_points_total}, ensure_ascii=False)
        self.response.out.write(json)

class ViewExerciseVideos(request_handler.RequestHandler):

    def get(self):
        user = util.get_current_user()
        if user:
            user_data = UserData.get_or_insert_for(user)
            exkey = self.request.get('exkey')
            if exkey:
                exercise = Exercise.get(db.Key(exkey))
                query = ExerciseVideo.all()
                query.filter('exercise =', exercise.key())

                exercise_videos = query.fetch(50)

                logout_url = users.create_logout_url(self.request.uri)
                first_video = None
                issue_labels = None
                if len(exercise_videos) > 0:
                    first_video = exercise_videos[0].video
                    issue_labels = 'Component-Videos,Video-%s' % exercise_videos[0].video.youtube_id
                for exercise_video in exercise_videos:
                    video = exercise_video.video
                    video.video_folder = get_mangled_playlist_name(video.playlists[0])  

                if App.offline_mode:
                    video_path = "/videos/" 
                else:
                    video_path = "http://www.archive.org/download/KhanAcademy_"
            
                template_values = {
                    'App' : App,
                    'points': user_data.points,
                    'user': user,
                    'username': user.nickname(),
                    'logout_url': logout_url,
                    'exercise': exercise,
                    'video_path': video_path,                    
                    'first_video': first_video,
                    'extitle': exercise.name.replace('_', ' ').capitalize(),
                    'exercise_videos': exercise_videos,
                    'issue_labels': issue_labels, 
                    }   

                path = os.path.join(os.path.dirname(__file__), 'exercisevideos.html')
                self.response.out.write(template.render(path, template_values))
        else:

            self.redirect(util.create_login_url(self.request.uri))

class PrintProblem(request_handler.RequestHandler):
    
    def get(self):
        
        exid = self.request.get('exid')
        problem_number = self.request.get('problem_number')
        
        template_values = {
                'App' : App,
                'arithmetic_template': 'arithmetic_print_template.html',
                'exid': exid,
                'extitle': exid.replace('_', ' ').capitalize(),
                'problem_number': self.request.get('problem_number')
                }
        
        path = os.path.join(os.path.dirname(__file__), exid + '.html')
        self.response.out.write(template.render(path, template_values))
        
class PrintExercise(request_handler.RequestHandler):

    def get(self):
        
        user = util.get_current_user()
        if user:
            exid = self.request.get('exid')
            key = self.request.get('key')
            problem_number = int(self.request.get('problem_number') or '0')
            num_problems = int(self.request.get('num_problems'))
            time_warp = self.request.get('time_warp')

            user_data = UserData.get_or_insert_for(user)

            query = Exercise.all()
            query.filter('name =', exid)
            exercise = query.get()

            exercise_videos = None
            query = ExerciseVideo.all()
            query.filter('exercise =', exercise.key())
            exercise_videos = query.fetch(50)

            if not exid:
                exid = 'addition_1'

            userExercise = user_data.get_or_insert_exercise(exercise)
            
            if not problem_number:
                problem_number = userExercise.total_done+1
            proficient = False
            endangered = False
            reviewing = False

            logout_url = users.create_logout_url(self.request.uri)

            template_values = {
                'App' : App,
                'arithmetic_template': 'arithmetic_print_template.html',
                'username': user.nickname(),
                'points': user_data.points,
                'proficient': proficient,
                'endangered': endangered,
                'reviewing': reviewing,
                'cookiename': user.nickname().replace('@', 'at'),
                'key': userExercise.key(),
                'exercise': exercise,
                'exid': exid,
                'expath': exid + '.html',
                'start_time': time.time(),
                'exercise_videos': exercise_videos,
                'extitle': exid.replace('_', ' ').capitalize(),
                'user_exercise': userExercise,
                'logout_url': logout_url,
                'time_warp': time_warp,
                'problem_numbers': range(problem_number, problem_number+num_problems),
                }
            
            path = os.path.join(os.path.dirname(__file__), 'print_template.html')
            self.response.out.write(template.render(path, template_values))
                
        else:

            self.redirect(util.create_login_url(self.request.uri))

class ExerciseAdminPage(request_handler.RequestHandler):

    def get(self):
        if not users.is_current_user_admin():
            self.redirect(users.create_login_url(self.request.uri))
            return
        user = util.get_current_user()
        query = Exercise.all().order('h_position')
        exercises = query.fetch(200)

        template_values = {'App' : App, 'exercises': exercises}

        path = os.path.join(os.path.dirname(__file__), 'exerciseadmin.html')
        self.response.out.write(template.render(path, template_values))


class ReportIssue(request_handler.RequestHandler):

    def get(self):
        issue_type = self.request.get('type')
        self.write_response(issue_type, {'issue_labels': self.request.get('issue_labels'),})
        
    def write_response(self, issue_type, extra_template_values):
        user = util.get_current_user()
        user_data = UserData.get_for_current_user()
        logout_url = users.create_logout_url(self.request.uri)

        user_agent = self.request.headers.get('User-Agent')
        if user_agent is None:
            user_agent = ''
        user_agent = user_agent.replace(',',';') # Commas delimit labels, so we don't want them
        template_values = {
            'App' : App,
            'points': user_data.points,
            'username': user and user.nickname() or "",
            'referer': self.request.headers.get('Referer'),
            'user_agent': user_agent,
            'logout_url': logout_url,
            }
        template_values.update(extra_template_values)
        page = 'reportissue_template.html'
        if issue_type == 'Defect':
            page = 'reportproblem.html'
        elif issue_type == 'Enhancement':
            page = 'makesuggestion.html'
        elif issue_type == 'New-Video':
            page = 'requestvideo.html'
        elif issue_type == 'Comment':
            page = 'makecomment.html'
        elif issue_type == 'Question':
            page = 'askquestion.html'

        self.render_template(page, template_values)

class ProvideFeedback(request_handler.RequestHandler):

    def get(self):
        user = util.get_current_user()
        user_data = UserData.get_for_current_user()
        logout_url = users.create_logout_url(self.request.uri)

        template_values = {
            'App' : App,
            'points': user_data.points,
            'username': user and user.nickname() or "",
            'logout_url': logout_url,
            }

        self.render_template("provide_feedback.html", template_values)

class ViewAllExercises(request_handler.RequestHandler):

    def get(self):
        user = util.get_current_user()
        if user:
            user_data = UserData.get_or_insert_for(user)
            
            ex_graph = ExerciseGraph(user_data)
            if user_data.reassess_from_graph(ex_graph):
                user_data.put()

            recent_exercises = ex_graph.get_recent_exercises()
            review_exercises = ex_graph.get_review_exercises(self.get_time())
            suggested_exercises = ex_graph.get_suggested_exercises()
            proficient_exercises = ex_graph.get_proficient_exercises()

            for exercise in ex_graph.exercises:
                exercise.suggested = False
                exercise.proficient = False
                exercise.review = False
                exercise.status = ""
                if exercise in suggested_exercises:
                    exercise.suggested = True
                    exercise.status = "Suggested"
                if exercise in proficient_exercises:
                    exercise.proficient = True
                    exercise.status = "Proficient"
                if exercise in review_exercises:
                    exercise.review = True
                    exercise.status = "Review"

            logout_url = users.create_logout_url(self.request.uri)

            template_values = {
                'App' : App,
                'exercises': ex_graph.exercises,
                'recent_exercises': recent_exercises,
                'review_exercises': review_exercises,
                'suggested_exercises': suggested_exercises,
                'points': user_data.points,
                'username': user.nickname(),
                'user_data': user_data,
                'expanded_all_exercises': user_data.expanded_all_exercises,
                'map_coords': knowledgemap.deserializeMapCoords(user_data.map_coords),
                'logout_url': logout_url,
                }

            path = os.path.join(os.path.dirname(__file__), 'viewexercises.html')
            self.response.out.write(template.render(path, template_values))
        else:
            self.redirect(util.create_login_url(self.request.uri))

    def get_time(self):
        time_warp = int(self.request.get('time_warp') or '0')
        return datetime.datetime.now() + datetime.timedelta(days=time_warp)


class VideolessExercises(request_handler.RequestHandler):

    def get(self):
        query = Exercise.all().order('h_position')
        exercises = query.fetch(200)
        self.response.out.write('<html>')
        for exercise in exercises:
            query = ExerciseVideo.all()
            query.filter('exercise =', exercise.key())
            videos = query.fetch(200)
            if not videos:
                self.response.out.write('<P><A href="/exercises?exid=' + exercise.name + '">' + exercise.name + '</A>')

class KnowledgeMap(request_handler.RequestHandler):

    def get(self):
        self.redirect("/exercisedashboard")

class EditExercise(request_handler.RequestHandler):

    def get(self):
        if not users.is_current_user_admin():
            self.redirect(users.create_login_url(self.request.uri))
            return
        exercise_name = self.request.get('name')
        if exercise_name:
            query = Exercise.all().order('h_position')
            exercises = query.fetch(200)

            main_exercise = None
            for exercise in exercises:
                if exercise.name == exercise_name:
                    main_exercise = exercise

            query = ExercisePlaylist.all()
            query.filter('exercise =', main_exercise.key())
            exercise_playlists = query.fetch(50)

            query = Playlist.all()
            all_playlists = query.fetch(50)

            query = ExerciseVideo.all()
            query.filter('exercise =', main_exercise.key())
            exercise_videos = query.fetch(50)

            videos = []

            playlist_videos = None
            for exercise_playlist in exercise_playlists:
                query = VideoPlaylist.all()
                query.filter('playlist =', exercise_playlist.playlist)
                query.order('video_position')
                playlist_videos = query.fetch(200)
                for playlist_video in playlist_videos:
                    videos.append(playlist_video.video)

            template_values = {
                'App' : App,
                'exercises': exercises,
                'exercise_playlists': exercise_playlists,
                'all_playlists': all_playlists,
                'exercise_videos': exercise_videos,
                'playlist_videos': playlist_videos,
                'videos': videos,
                'main_exercise': main_exercise,
                }

            self.render_template("editexercise.html", template_values)

class UpdateExercise(request_handler.RequestHandler):
    
    def post(self):
        self.get()

    def get(self):
        if not users.is_current_user_admin():
            self.redirect(users.create_login_url(self.request.uri))
            return
        user = util.get_current_user()
        exercise_name = self.request.get('name')
        if exercise_name:
            query = Exercise.all()
            query.filter('name =', exercise_name)
            exercise = query.get()
            if not exercise:
                exercise = Exercise(name=exercise_name)
                exercise.prerequisites = []
                exercise.covers = []
                exercise.author = user
                exercise.summative = self.request_bool("summative", default=False)
                path = os.path.join(os.path.dirname(__file__), exercise_name + '.html')
                raw_html = self.request.get('raw_html')
                if not os.path.exists(path) and not exercise.summative and raw_html:
                    exercise.raw_html = db.Text(raw_html)
                    exercise.last_modified = datetime.datetime.now()
                    exercise.ensure_sanitized()

            add_prerequisite = self.request.get('add_prerequisite')
            delete_prerequisite = self.request.get('delete_prerequisite')
            add_covers = self.request.get('add_covers')
            delete_covers = self.request.get('delete_covers')
            v_position = self.request.get('v_position')
            h_position = self.request.get('h_position')
            seconds_per_fast_problem = self.request.get('seconds_per_fast_problem')
            short_display_name = self.request.get('short_display_name')

            add_video = self.request.get('add_video')
            delete_video = self.request.get('delete_video')
            add_playlist = self.request.get('add_playlist')
            delete_playlist = self.request.get('delete_playlist')

            if add_prerequisite:
                if add_prerequisite not in exercise.prerequisites:
                    exercise.prerequisites.append(add_prerequisite)
            if delete_prerequisite:
                if delete_prerequisite in exercise.prerequisites:
                    exercise.prerequisites.remove(delete_prerequisite)
            if add_covers:
                if add_covers not in exercise.covers:
                    exercise.covers.append(add_covers)
            if delete_covers:
                if delete_covers in exercise.covers:
                    exercise.covers.remove(delete_covers)
            if v_position:
                exercise.v_position = int(v_position)
            if h_position:
                exercise.h_position = int(h_position)
            if seconds_per_fast_problem:
                exercise.seconds_per_fast_problem = float(seconds_per_fast_problem)
            if short_display_name:
                exercise.short_display_name = short_display_name

            if add_video:
                query = ExerciseVideo.all()
                query.filter('video =', db.Key(add_video))
                query.filter('exercise =', exercise.key())
                exercise_video = query.get()
                if not exercise_video:
                    exercise_video = ExerciseVideo()
                    exercise_video.exercise = exercise
                    exercise_video.video = db.Key(add_video)
                    exercise_video.put()
            if delete_video:
                query = ExerciseVideo.all()
                query.filter('video =', db.Key(delete_video))
                query.filter('exercise =', exercise.key())
                exercise_videos = query.fetch(200)
                for exercise_video in exercise_videos:
                    exercise_video.delete()

            if add_playlist:
                query = ExercisePlaylist.all()
                query.filter('playlist =', db.Key(add_playlist))
                query.filter('exercise =', exercise.key())
                exercise_playlist = query.get()
                if not exercise_playlist:
                    exercise_playlist = ExercisePlaylist()
                    exercise_playlist.exercise = exercise
                    exercise_playlist.playlist = db.Key(add_playlist)
                    exercise_playlist.put()

            if delete_playlist:
                query = ExercisePlaylist.all()
                query.filter('playlist =', db.Key(delete_playlist))
                query.filter('exercise =', exercise.key())
                exercise_playlists = query.fetch(200)
                for exercise_playlist in exercise_playlists:
                    exercise_playlist.delete()

            exercise.put()

            self.redirect('/editexercise?name=' + exercise_name)

class GraphPage(request_handler.RequestHandler):

    def get(self):
        width = self.request.get('w')
        height = self.request.get('h')
        template_values = {'App' : App, 'width': width, 'height': height}

        path = os.path.join(os.path.dirname(__file__), 'graphpage.html')
        self.response.out.write(template.render(path, template_values))

class AdminViewUser(request_handler.RequestHandler):

    def get(self):
        if not users.is_current_user_admin():
            self.redirect(users.create_login_url(self.request.uri))
            return
        username = self.request.get('u')
        if username:

            userdata = None
            exercisedata = None
            query = UserData.all()
            for user_data in query:
                if user_data.user.nickname() == username:
                    userdata = user_data
                    query = UserExercise.all()
                    query.filter('user =', userdata.user)
                    exercisedata = query.fetch(300)
                    break

            template_values = {'App' : App, 'exercise_data': exercisedata, 'user_data': userdata}
            path = os.path.join(os.path.dirname(__file__), 'adminviewuser.html')
            self.response.out.write(template.render(path, template_values))

class RegisterAnswer(request_handler.RequestHandler):

    def post(self):
        exid = self.request_string('exid')
        user = util.get_current_user()
        if user:

            dt_done = datetime.datetime.now()

            key = self.request_string('key')
            correct = self.request_bool('correct')
            problem_number = self.request_int('problem_number')
            start_time = self.request_float('start_time')
            hint_used = self.request_bool('hint_used', default=False)

            elapsed_time = int(float(time.time()) - start_time)

            userExercise = db.get(key)
            exercise = userExercise.exercise_model

            userExercise.last_done = datetime.datetime.now()
            userExercise.seconds_per_fast_problem = exercise.seconds_per_fast_problem
            userExercise.summative = exercise.summative

            user_data = UserData.get_for(userExercise.user)
            user_data.last_activity = userExercise.last_done
            
            # If a non-admin tries to answer a problem out-of-order, just ignore it and
            # display the next problem.
            if problem_number != userExercise.total_done+1 and not users.is_current_user_admin():
                # Only admins can answer problems out of order.
                self.redirect('/exercises?exid=' + exid)
                return

            suggested = user_data.is_suggested(exid)
            proficient = user_data.is_proficient_at(exid)
            points_possible = points.ExercisePointCalculator(exercise, userExercise, suggested, proficient)

            problem_log = ProblemLog()
                                
            if correct:
                problem_log.points_earned = points_possible
                user_data.add_points(points_possible)
            
            problem_log.user = user
            problem_log.exercise = exid
            problem_log.correct = correct
            problem_log.time_done = dt_done
            problem_log.time_taken = elapsed_time
            problem_log.problem_number = problem_number
            problem_log.hint_used = hint_used

            if exercise.summative:
                problem_log.exercise_non_summative = exercise.non_summative_exercise(problem_number).name

            if userExercise.total_done:
                userExercise.total_done = userExercise.total_done + 1
            else:
                userExercise.total_done = 1

            if correct:
                userExercise.streak = userExercise.streak + 1
                if userExercise.streak > userExercise.longest_streak:
                    userExercise.longest_streak = userExercise.streak
                if userExercise.streak >= exercise.required_streak() and not proficient:
                    userExercise.set_proficient(True, user_data)
                    userExercise.proficient_date = datetime.datetime.now()                    
                    user_data.reassess_if_necessary()
                    problem_log.earned_proficiency = True
            else:
                # Can't do the following here because RegisterCorrectness() already
                # set streak = 0.
                # if userExercise.streak == 0:
                    # 2+ in a row wrong -> not proficient
                    # userExercise.set_proficient(False)
                
                # Just in case RegisterCorrectness didn't get called.
                userExercise.reset_streak()

            util_badges.update_with_user_exercise(
                user, 
                user_data, 
                userExercise, 
                include_other_badges = True, 
                action_cache=last_action_cache.LastActionCache.get_cache_and_push_problem_log(user, problem_log))

            userExercise.clear_memcache()
            db.put([user_data, problem_log, userExercise])

            self.redirect('/exercises?exid=' + exid)
        else:
            # Redirect to display the problem again which requires authentication
            self.redirect('/exercises?exid=' + exid)

    def get_time(self):
        time_warp = int(self.request.get('time_warp') or '0')
        return datetime.datetime.now() + datetime.timedelta(days=time_warp)


class RegisterCorrectness(request_handler.RequestHandler):

# A POST request is made via AJAX when the user clicks "Check Answer".
# This allows us to reset the user's streak if the answer was wrong.  If we wait
# until he clicks the "Next Problem" button, he can avoid resetting his streak
# by just reloading the page.

    def post(self):
        user = util.get_current_user()
        if user:
            key = self.request.get('key')
            correct = int(self.request.get('correct'))
            hint_used = self.request_bool('hint_used', default=False)
            userExercise = db.get(key)
            userExercise.schedule_review(correct == 1, self.get_time())
            if correct == 0:
                if userExercise.streak == 0:
                    # 2+ in a row wrong -> not proficient
                    userExercise.set_proficient(False, UserData.get_or_insert_for(user))
                userExercise.reset_streak()
            if hint_used:
                userExercise.reset_streak()
            userExercise.put()
        else:
            self.redirect(util.create_login_url(self.request.uri))

    def get_time(self):
        time_warp = int(self.request.get('time_warp') or '0')
        return datetime.datetime.now() + datetime.timedelta(days=time_warp)


class ResetStreak(request_handler.RequestHandler):

# This resets the user's streak through an AJAX post request when the user
# clicks on the Hint button. 

    def post(self):
        user = util.get_current_user()
        if user:
            key = self.request.get('key')
            userExercise = db.get(key)
            userExercise.reset_streak()
            userExercise.put()
        else:
            self.redirect(util.create_login_url(self.request.uri))


class ViewUsers(request_handler.RequestHandler):

    def get(self):
        if not users.is_current_user_admin():
            self.redirect(users.create_login_url(self.request.uri))
            return
        user = util.get_current_user()
        query = UserData.all()
        count = 0
        for user in query:
            count = count + 1

        self.response.out.write('Users ' + str(count))

class GenerateHomepageContent(request_handler.RequestHandler):


    def get(self):
        def get_playlist(playlist_title):
            query = Playlist.all()
            query.filter('title =', playlist_title)
            playlist = query.get()
            query = VideoPlaylist.all()
            query.filter('playlist =', playlist)
            query.filter('live_association = ', True) #need to change this to true once I'm done with all of my hacks
            query.order('video_position')
            playlist_videos = query.fetch(500)
            videos = []
            for playlist_video in playlist_videos:
                videos.append(playlist_video.video)
            
            return { 
                    'id': playlist_title+"_playlist",
                    'title': playlist_title,
                    'description': playlist.description,
                    'videos': videos
                    }
        
        tree = {
                'title': "Videos by Topic",
                'children': 
                [
                 {
                  'title': "Math",
                  'children': [
                                get_playlist('Arithmetic'),
                                get_playlist('Developmental Math'),
                                {
                                 'title': 'Pre-algebra',
                                 'children': [
                                                get_playlist('Pre-algebra'),
                                                get_playlist('MA Tests for Education Licensure (MTEL) -Pre-Alg')
                                              ]
                                },
#                                ]
#                  }
#                 ]
#                }
        
                                {
                                 'title': 'Algebra',
                                 'children': [
                                                get_playlist('Algebra'),
                                                get_playlist('Algebra I Worked Examples'),
                                                get_playlist('ck12.org Algebra 1 Examples'),
                                                get_playlist('California Standards Test: Algebra I'),
                                                get_playlist('California Standards Test: Algebra II'),
                                              ]
                                },
                                get_playlist('Probability'),
                                get_playlist('Statistics'),
                                {
                                 'title': 'Geometry',
                                 'children': [
                                                get_playlist('Geometry'),
                                                get_playlist('California Standards Test: Geometry'),
                                              ]
                                },
                                get_playlist('Trigonometry'),
                                get_playlist('Precalculus'),
                                get_playlist('Calculus'),
                                get_playlist('Differential Equations'),
                                get_playlist('Linear Algebra'),
                               ]
                  },
                 {
                  'title': "Science",
                  'children': [
                                {
                                 'title': 'Chemistry',
                                 'children': [
                                                get_playlist('Chemistry'),
                                                get_playlist('Organic Chemistry'),
                                              ]
                                },
                                get_playlist('Biology'),
                                get_playlist('Physics'),
                               ]
                  },
                  get_playlist('History'),
                 {
                  'title': "Economics",
                  'children': [
                                get_playlist('Finance'),
                                get_playlist('Valuation and Investing'),
                                get_playlist('Banking and Money'),
                                get_playlist('Venture Capital and Capital Markets'),
                                {
                                 'title': 'Current Economics',
                                 'children': [
                                                get_playlist('Current Economics'),
                                                get_playlist('Credit Crisis'),
                                                get_playlist('Paulson Bailout'),
                                                get_playlist('Geithner Plan'),
                                              ]
                                },
                               ]
                  },
                 {
                  'title': "Test Preparation",
                  'children': [
                                get_playlist('SAT Preparation'),
                                get_playlist('GMAT: Problem Solving'),
                                get_playlist('GMAT Data Sufficiency'),
                               ]
                  },
                  get_playlist('Brain Teasers'),
                  get_playlist('Khan Academy-Related Talks and Interviews'),
                 ]
                }
        
        def get_activities(node):
            videos = node.get('videos', [])
            activities = {}
            for v in videos:
                activities[v.readable_id] = v
            for child in node.get('children', []):
                activities.update(get_activities(child))
            node['num_activities'] = len(activities)
            return activities
        
        tree['num_activities'] = len(get_activities(tree))
                
        def iterator(nodes, depth, topic_template_path, playlist_template_path = None):
            if playlist_template_path is None:
                playlist_template_path = topic_template_path
            for node in nodes:
                template_values = node.copy()
                if template_values.get('id') is None:
                    template_values['id'] = template_values['title']
                if node.get('videos'):
                    yield render_to_string(playlist_template_path, template_values)
                else:
                    children = iterator(node['children'], depth+1, topic_template_path, playlist_template_path)
                    template_values.update({
                                            'children': children
                                            })
                    html = render_to_string(topic_template_path, template_values)
                    yield html

        template_values = {
            'App' : App,
            'toc': iterator([tree], 0,
                             os.path.join(os.path.dirname(__file__), 'videolibrary_toc.html')),
            'contents': iterator([tree], 0,
                             os.path.join(os.path.dirname(__file__), 'videolibrary_topic.html'), 
                             os.path.join(os.path.dirname(__file__), 'videolibrary_playlist.html')),
            }
        path = os.path.join(os.path.dirname(__file__), 'homepage_content_template.html')
        self.response.out.write(template.render(path, template_values))

class GenerateLibraryContent(request_handler.RequestHandler):

    def get(self):
        library_content_html(bust_cache=True)
        self.response.out.write("Library content regenerated")  

@layer_cache.cache_with_key_fxn(
        lambda *args, **kwargs: "library_content_html_%s" % Setting.cached_library_content_date(),
        persist_across_app_versions = True
        ) 
def library_content_html(bust_cache = False):

    # No cache found -- regenerate HTML
    all_playlists = []

    dict_videos = {}
    dict_videos_counted = {}
    dict_playlists = {}
    dict_playlists_by_title = {}
    dict_video_playlists = {}

    for video in Video.all():
        dict_videos[video.key()] = video

    for playlist in Playlist.all():
        dict_playlists[playlist.key()] = playlist
        if playlist.title in topics_list:
            dict_playlists_by_title[playlist.title] = playlist

    for video_playlist in VideoPlaylist.all().filter('live_association = ', True).order('video_position'):
        playlist_key = VideoPlaylist.playlist.get_value_for_datastore(video_playlist)
        video_key = VideoPlaylist.video.get_value_for_datastore(video_playlist)

        if dict_videos.has_key(video_key) and dict_playlists.has_key(playlist_key):
            video = dict_videos[video_key]
            playlist = dict_playlists[playlist_key]
            fast_video_playlist_dict = {"video":video, "playlist":playlist}

            if dict_video_playlists.has_key(playlist_key):
                dict_video_playlists[playlist_key].append(fast_video_playlist_dict)
            else:
                dict_video_playlists[playlist_key] = [fast_video_playlist_dict]

            dict_videos_counted[video_key] = True

    # Update count of all distinct videos associated w/ a live playlist
    Setting.count_videos(len(dict_videos_counted.keys()))

    for topic in topics_list:

        playlist = dict_playlists_by_title[topic]
        playlist_key = playlist.key()
        playlist_videos = dict_video_playlists[playlist_key]

        playlist_data = {
                 'title': topic,
                 'topic': topic,
                 'playlist': playlist,
                 'videos': playlist_videos
                 }

        all_playlists.append(playlist_data)

    # Separating out the columns because the formatting is a little different on each column
    template_values = {
        'App' : App,
        'all_playlists': all_playlists,
        }
    path = os.path.join(os.path.dirname(__file__), 'library_content_template.html')
    html = template.render(path, template_values)

    # Set shared date of last generated content
    Setting.cached_library_content_date(str(datetime.datetime.now()))

    return html

class ShowUnusedPlaylists(request_handler.RequestHandler):

    def get(self):

        playlists = Playlist.all()
        playlists_unused = []

        for playlist in playlists:
            if not playlist.title in all_topics_list:
                playlists_unused.append(playlist)

        self.response.out.write("Unused playlists:<br/><br/>")
        for playlist_unused in playlists_unused:
            self.response.out.write(" + " + playlist_unused.title + "<br/>")
        self.response.out.write("</br>Done")

class GenerateVideoMapping(request_handler.RequestHandler):

    def get(self): 
        video_mapping = {}
        for playlist_title in all_topics_list:            
            query = Playlist.all()
            query.filter('title =', playlist_title)
            playlist = query.get()
            query = VideoPlaylist.all()
            query.filter('playlist =', playlist)
            query.filter('live_association = ', True)
            query.order('video_position')
            playlist_name = get_mangled_playlist_name(playlist_title)
            playlist = []   
            video_mapping[playlist_name] = playlist
            for pv in query.fetch(500):
                v = pv.video
                filename = v.title.replace(":", "").replace(",", ".")
                playlist.append((filename, v.youtube_id, v.readable_id)) 
        self.response.out.write("video_mapping = " + pformat(video_mapping))            
        
        
class YoutubeVideoList(request_handler.RequestHandler):

    def get(self):
        for playlist_title in all_topics_list:            
            query = Playlist.all()
            query.filter('title =', playlist_title)
            playlist = query.get()
            query = VideoPlaylist.all()
            query.filter('playlist =', playlist)
            query.filter('live_association = ', True)
            query.order('video_position')
            for pv in query.fetch(500):
                v = pv.video
                self.response.out.write('http://www.youtube.com/watch?v=' + v.youtube_id + '\n')       

class ExerciseAndVideoEntityList(request_handler.RequestHandler):

    def get(self):
        self.response.out.write("Exercises:\n")

        for exercise in Exercise.all():
            self.response.out.write(str(exercise.key().id()) + "\t" + exercise.display_name() + "\n")

        self.response.out.write("\n\nVideos:\n")
        for playlist_title in all_topics_list:
            query = Playlist.all()
            query.filter('title =', playlist_title)
            playlist = query.get()
            query = VideoPlaylist.all()
            query.filter('playlist =', playlist)
            query.filter('live_association = ', True)
            query.order('video_position')
            for pv in query.fetch(1000):
                v = pv.video
                self.response.out.write(str(v.key().id()) + "\t" + v.title + "\n")

class Crash(request_handler.RequestHandler):
    def get(self):
        if self.request_bool("capability_disabled", default=False):
            raise CapabilityDisabledError("Simulate scheduled GAE downtime")
        else:
            # Even Watson isn't perfect
            raise Exception("What is Toronto?")
            
class ViewHomePage(request_handler.RequestHandler):

    def get(self):

        user = util.get_current_user()
        user_data = UserData.get_for_current_user()
        logout_url = users.create_logout_url(self.request.uri)
        
        movie_youtube_id =   random.choice(['p6l8-1kHUsA', 'UuMTSU9DcqQ'])
        
        image_and_link_list = ['<A href="/press/fortune"><img src="/images/splashthumbnails/fortune_thumbnail.png" align=right></a>',
        		      	'<A href="/about#GEL"><img src="/images/splashthumbnails/gel_thumbnail.png" align=right></a>',
        		      	'<A href="/getinvolved#translation"><img src="/images/splashthumbnails/translation_thumbnail.png" align=right></a>',
        		       '<A href="/about#NEWSHOUR"><img src="/images/splashthumbnails/pbs_thumbnail.png" align=right></a>',
        		       '<A href="/about#OVERVIEW"><img src="/images/splashthumbnails/overview_thumbnail.png" align=right></a>']
        		       
        random.shuffle(image_and_link_list)
        		       
        link1 = image_and_link_list[0]
        link2 = image_and_link_list[1]
        link3 = image_and_link_list[2]
        link4 = image_and_link_list[3]
        
        # Get pregenerated library content from our in-memory/memcache two-layer cache
        library_content = library_content_html()
        
        template_values = qa.add_template_values({'App': App,
                                                  'points': user_data.points,
                                                  'username': user and user.nickname() or "",
                                                  'user_data': user_data,
                                                  'login_url': util.create_login_url(self.request.uri),
                                                  'video_id': movie_youtube_id,
                                                  'link1': link1,
                                                  'link2': link2,
                                                  'link3': link3,
                                                  'link4': link4,
                                                  'library_content': library_content,
                                                  'DVD_list': DVD_list,
                                                  'logout_url': logout_url}, 
                                                  self.request)
        path = os.path.join(os.path.dirname(__file__), 'homepage.html')
        self.response.out.write(template.render(path, template_values))
        
class ViewFAQ(request_handler.RequestHandler):

    def get(self):
        self.redirect("/about#faq", True)
        return

class ViewAboutUs(request_handler.RequestHandler):
    def get(self):
        user = util.get_current_user()
        user_data = UserData.get_for_current_user()
        logout_url = users.create_logout_url(self.request.uri)
        template_values = qa.add_template_values({'App': App,
                                                  'points': user_data.points,
                                                  'username': user and user.nickname() or "",
                                                  'login_url': util.create_login_url(self.request.uri),
                                                  'logout_url': logout_url}, 
                                                  self.request)
                                                  
        self.render_template('aboutus.html', template_values)

class ViewGetInvolved(request_handler.RequestHandler):
    def get(self):
        user = util.get_current_user()
        user_data = UserData.get_for_current_user()
        logout_url = users.create_logout_url(self.request.uri)
        template_values = qa.add_template_values({'App': App,
                                                  'points': user_data.points,
                                                  'username': user and user.nickname() or "",
                                                  'login_url': util.create_login_url(self.request.uri),
                                                  'logout_url': logout_url}, 
                                                  self.request)
                                                  
        self.render_template('getinvolved.html', template_values)

class Donate(request_handler.RequestHandler):

    def get(self):
        user = util.get_current_user()
        user_data = UserData.get_for_current_user()
        logout_url = users.create_logout_url(self.request.uri)
        template_values = qa.add_template_values({'App': App,
                                                  'points': user_data.points,
                                                  'username': user and user.nickname() or "",
                                                  'login_url': util.create_login_url(self.request.uri),
                                                  'logout_url': logout_url}, 
                                                  self.request)
                                                  
        self.render_template('donate.html', template_values)


class ViewDownloads(request_handler.RequestHandler):

    def get(self):
        user = util.get_current_user()
        user_data = UserData.get_for_current_user()
        logout_url = users.create_logout_url(self.request.uri)
        template_values = qa.add_template_values({'App': App,
                                                  'points': user_data.points,
                                                  'username': user and user.nickname() or "",
                                                  'login_url': util.create_login_url(self.request.uri),
                                                  'logout_url': logout_url}, 
                                                  self.request)
                                                  
        self.render_template('downloads.html', template_values)
        

class ViewStore(request_handler.RequestHandler):

    def get(self):
        user = util.get_current_user()
        user_data = UserData.get_for_current_user()
        logout_url = users.create_logout_url(self.request.uri)
        template_values = qa.add_template_values({'App': App,
                                                  'points': user_data.points,
                                                  'username': user and user.nickname() or "",
                                                  'login_url': util.create_login_url(self.request.uri),
                                                  'logout_url': logout_url}, 
                                                  self.request)
                                                  
        self.render_template('store.html', template_values)
        
class ViewHowToHelp(request_handler.RequestHandler):

    def get(self):
        self.redirect("/getinvolved", True)
        return


class ViewSAT(request_handler.RequestHandler):

    def get(self):
        user = util.get_current_user()
        user_data = UserData.get_for_current_user()
        logout_url = users.create_logout_url(self.request.uri)
        playlist_title = "SAT Preparation"
        query = Playlist.all()
        query.filter('title =', playlist_title)
        playlist = query.get()
        query = VideoPlaylist.all()
        query.filter('playlist =', playlist)
        query.filter('live_association = ', True) #need to change this to true once I'm done with all of my hacks
        query.order('video_position')
        playlist_videos = query.fetch(500)
        template_values = qa.add_template_values({'App': App,
                                                  'points': user_data.points,
                                                  'username': user and user.nickname() or "",
                                                  'videos': playlist_videos,
                                                  'login_url': util.create_login_url(self.request.uri),
                                                  'logout_url': logout_url}, 
                                                  self.request)
                                                  
        path = os.path.join(os.path.dirname(__file__), 'sat.html')
        self.response.out.write(template.render(path, template_values))

class ViewGMAT(request_handler.RequestHandler):

    def get(self):
        user = util.get_current_user()
        user_data = UserData.get_for_current_user()
        logout_url = users.create_logout_url(self.request.uri)
        problem_solving = VideoPlaylist.get_query_for_playlist_title("GMAT: Problem Solving")
        data_sufficiency = VideoPlaylist.get_query_for_playlist_title("GMAT Data Sufficiency")
        template_values = qa.add_template_values({'App': App,
                                                  'points': user_data.points,
                                                  'username': user and user.nickname() or "",
                                                  'data_sufficiency': data_sufficiency,
                                                  'problem_solving': problem_solving,
                                                  'login_url': util.create_login_url(self.request.uri),
                                                  'logout_url': logout_url}, 
                                                  self.request)
                                                  
        path = os.path.join(os.path.dirname(__file__), 'gmat.html')
        self.response.out.write(template.render(path, template_values))
                       

class RetargetFeedback(bulk_update.handler.UpdateKind):
    def get_keys_query(self, kind):
        """Returns a keys-only query to get the keys of the entities to update"""
        return db.GqlQuery('select __key__ from Feedback')

    def use_transaction(self):
        return False
    
    def update(self, feedback):
        orig_video = feedback.first_target()

        if orig_video == None or type(orig_video).__name__ != "Video":
            return False
        readable_id = orig_video.readable_id
        query = Video.all()
        query.filter('readable_id =', readable_id)
        # The database currently contains multiple Video objects for a particular
        # video.  Some are old.  Some are due to a YouTube sync where the youtube urls
        # changed and our code was producing youtube_ids that ended with '_player'.
        # This hack gets the most recent valid Video object.
        key_id = 0
        for v in query:
            if v.key().id() > key_id and not v.youtube_id.endswith('_player'):
                video = v
                key_id = v.key().id()
        # End of hack
        if video is not None and video.key() != orig_video.key():
            logging.info("Retargeting Feedback %s from Video %s to Video %s", feedback.key().id(), orig_video.key().id(), video.key().id())
            feedback.targets[0] = video.key()
            return True
        else:
            return False

class DeleteStaleVideoPlaylists(bulk_update.handler.UpdateKind):
    def get_keys_query(self, kind):
        """Returns a keys-only query to get the keys of the entities to update"""
        return db.GqlQuery('select __key__ from VideoPlaylist')

    def use_transaction(self):
        return False
    
    def update(self, video_playlist):
        if video_playlist.live_association == True:
            logging.debug("Keeping VideoPlaylist %s", video_playlist.key().id())
            return False
        logging.info("Deleting stale VideoPlaylist %s", video_playlist.key().id())
        video_playlist.delete()
        return False

class DeleteStaleVideos(bulk_update.handler.UpdateKind):
    def get_keys_query(self, kind):
        """Returns a keys-only query to get the keys of the entities to update"""
        return db.GqlQuery('select __key__ from Video')

    def use_transaction(self):
        return False
    
    def update(self, video):
        query = ExerciseVideo.all()
        query.filter('video =', video)
        referrer = query.get()
        if referrer is not None:
            logging.debug("Keeping Video %s.  It is still referenced by ExerciseVideo %s", video.key().id(), referrer.key().id())
            return False
        query = VideoPlaylist.all()
        query.filter('video =', video)
        referrer = query.get()
        if referrer is not None:
            logging.debug("Keeping Video %s.  It is still referenced by VideoPlaylist %s", video.key().id(), referrer.key().id())
            return False
        logging.info("Deleting stale Video %s", video.key().id())
        video.delete()
        return False


class DeleteStalePlaylists(bulk_update.handler.UpdateKind):
    def get_keys_query(self, kind):
        """Returns a keys-only query to get the keys of the entities to update"""
        return db.GqlQuery('select __key__ from Playlist')

    def use_transaction(self):
        return False
    
    def update(self, playlist):
        query = ExercisePlaylist.all()
        query.filter('playlist =', playlist)
        referrer = query.get()
        if referrer is not None:
            logging.debug("Keeping Playlist %s.  It is still referenced by ExercisePlaylist %s", playlist.key().id(), referrer.key().id())
            return False
        query = VideoPlaylist.all()
        query.filter('playlist =', playlist)
        referrer = query.get()
        if referrer is not None:
            logging.debug("Keeping Playlist %s.  It is still referenced by VideoPlaylist %s", playlist.key().id(), referrer.key().id())
            return False
        logging.info("Deleting stale Playlist %s", playlist.key().id())
        playlist.delete()
        return False


class FixVideoRef(bulk_update.handler.UpdateKind):
    def use_transaction(self):
        return False
    
    def update(self, entity):
        orig_video = entity.video

        if orig_video == None or type(orig_video).__name__ != "Video":
            return False
        readable_id = orig_video.readable_id
        query = Video.all()
        query.filter('readable_id =', readable_id)
        # The database currently contains multiple Video objects for a particular
        # video.  Some are old.  Some are due to a YouTube sync where the youtube urls
        # changed and our code was producing youtube_ids that ended with '_player'.
        # This hack gets the most recent valid Video object.
        key_id = 0
        for v in query:
            if v.key().id() > key_id and not v.youtube_id.endswith('_player'):
                video = v
                key_id = v.key().id()
        # End of hack
        if video is not None and video.key() != orig_video.key():
            logging.info("Retargeting %s %s from Video %s to Video %s", type(entity), entity.key().id(), orig_video.key().id(), video.key().id())
            entity.video = video
            return True
        else:
            return False
            
class FixPlaylistRef(bulk_update.handler.UpdateKind):
    def use_transaction(self):
        return False
    
    def update(self, entity):
        orig_playlist = entity.playlist

        if orig_playlist == None or type(orig_playlist).__name__ != "Playlist":
            return False
        youtube_id = orig_playlist.youtube_id
        query = Playlist.all()
        query.filter('youtube_id =', youtube_id)
        # The database currently contains multiple Playlist objects for a particular
        # playlist.  Some are old.
        # This hack gets the most recent valid Playlist object.
        key_id = 0
        for p in query:
            if p.key().id() > key_id:
                playlist = p
                key_id = p.key().id()
        # End of hack
        if playlist is not None and playlist.key() != orig_playlist.key():
            logging.info("Retargeting %s %s from Playlist %s to Playlist %s", type(entity), entity.key().id(), orig_playlist.key().id(), playlist.key().id())
            entity.playlist = playlist
            return True
        else:
            return False
            
class ViewInfoPage(request_handler.RequestHandler):

    def get(self):
        user = util.get_current_user()
        user_data = UserData.get_for_current_user()
        logout_url = users.create_logout_url(self.request.uri)
        template_values = qa.add_template_values({'App': App,
                                                  'points': user_data.points,
                                                  'username': user and user.nickname() or "",
                                                  'login_url': util.create_login_url(self.request.uri),
                                                  'logout_url': logout_url}, 
                                                  self.request)
        # Get the corresponding page from the info site
        path = urllib.unquote(self.request.path.rpartition('/')[2])
        scraped = urllib.urlopen('http://info.khanacademy.org/' + path).read()
        # Convert it to a template that extends page_template.html
        scraped = '{% extends "info_page_template.html" %}' + scraped
        scraped = scraped.replace('<td id="sites-canvas-wrapper">', '{% block pagecontent %}')
        scraped = scraped.replace('</td> \n<td id="sites-chrome-sidebar-right" class="sites-layout-sidebar-right">', '{% endblock pagecontent %}')

        # Render the template
        t = template.Template(scraped)
        c = template.Context(template_values)        
        self.response.out.write(t.render(c))

class ViewArticle(request_handler.RequestHandler):

    def get(self):
        user = util.get_current_user()
        user_data = UserData.get_for_current_user()
        logout_url = users.create_logout_url(self.request.uri)
        video = None
        path = self.request.path
        readable_id  = urllib.unquote(path.rpartition('/')[2])
        
        article_url = "http://money.cnn.com/2010/08/23/technology/sal_khan_academy.fortune/index.htm"
        if readable_id == "fortune":
            article_url = "http://money.cnn.com/2010/08/23/technology/sal_khan_academy.fortune/index.htm"
            
        
        
        template_values = qa.add_template_values({'App': App,
                                                  'points': user_data.points,
                                                  'username': user and user.nickname() or "",
                                                  'login_url': util.create_login_url(self.request.uri),
                                                  'article_url': article_url,
                                                  'logout_url': logout_url,
                                                  'issue_labels': ('Component-Videos,Video-%s' % readable_id)}, 
                                                 self.request)

        self.render_template("article.html", template_values)
            
class Login(request_handler.RequestHandler):

    def get(self):
        return self.post()

    def post(self):
        cont = self.request.get('continue')
        openid_identifier = self.request.get('openid_identifier')
        if openid_identifier is not None and len(openid_identifier) > 0:
            if App.accepts_openid:
                self.redirect(users.create_login_url(cont, federated_identity = openid_identifier))
                return
            self.redirect(users.create_login_url(cont))
            return
                    
        if App.facebook_app_secret is None:
            self.redirect(users.create_login_url(cont))
            return
        path = os.path.join(os.path.dirname(__file__), 'login.html')
        template_values = {
                           'App': App,
                           'continue': cont                              
                           }
        self.response.out.write(template.render(path, template_values))

class Search(request_handler.RequestHandler):

    def get(self):        
        query = self.request.get('page_search_query')
        template_values = { 'page_search_query': query }
        query = query.strip()
        query_too_short = None 
        if len(query) < search.SEARCH_PHRASE_MIN_LENGTH:
            if len(query) > 0:
                template_values.update({'query_too_short': search.SEARCH_PHRASE_MIN_LENGTH})
            self.render_template("searchresults.html", template_values)
            return
        searched_phrases = []
        playlists = Playlist.search(query, limit=50, searched_phrases_out=searched_phrases)
        videos = Video.search(query, limit=50, searched_phrases_out=searched_phrases)
        template_values.update({
                           'playlists': playlists,
                           'videos': videos,
                           'searched_phrases': searched_phrases
                           })
        self.render_template("searchresults.html", template_values)
                    
                        
def real_main():    
    webapp.template.register_template_library('templatefilters')
    webapp.template.register_template_library('templatetags')    
    webapp.template.register_template_library('templateext')    
    application = webapp.WSGIApplication([ 
        ('/', ViewHomePage),
        ('/frequently-asked-questions', ViewFAQ),
        ('/about', ViewAboutUs),
        ('/getinvolved', ViewGetInvolved),
        ('/donate', Donate),
        ('/exercisedashboard', ViewAllExercises),
        ('/library_content', GenerateLibraryContent),
        ('/video_mapping', GenerateVideoMapping),  
        ('/youtube_list', YoutubeVideoList),
        ('/exerciseandvideoentitylist', ExerciseAndVideoEntityList),
        ('/syncvideodata', UpdateVideoData),
        ('/readablevideonames', UpdateVideoReadableNames),
        ('/exercises', ViewExercise),
        ('/editexercise', EditExercise),
        ('/printexercise', PrintExercise),
        ('/printproblem', PrintProblem),
        ('/viewexercisevideos', ViewExerciseVideos),
        ('/viewexercisesonmap', KnowledgeMap),
        ('/testdatastore', DataStoreTest),
        ('/admin94040', ExerciseAdminPage),
        ('/adminusers', ViewUsers),
        ('/videoless', VideolessExercises),
        ('/adminuserdata', AdminViewUser),
        ('/updateexercise', UpdateExercise),
        ('/graphpage.html', GraphPage),
        ('/registeranswer', RegisterAnswer),
        ('/registercorrectness', RegisterCorrectness),
        ('/resetstreak', ResetStreak),
        ('/video/.*', ViewVideo),
        ('/video', ViewVideo),
        ('/logvideoprogress', LogVideoProgress),
        ('/sat', ViewSAT),
        ('/gmat', ViewGMAT),
        ('/downloads', ViewDownloads),
        ('/store', ViewStore),        
        ('/info/how-to-help', ViewHowToHelp),
        ('/info/.*', ViewInfoPage),
        ('/reportissue', ReportIssue),
        ('/provide-feedback', ProvideFeedback),
        ('/search', Search),
        ('/autocomplete', autocomplete.Autocomplete),
        ('/savemapcoords', knowledgemap.SaveMapCoords),
        ('/saveexpandedallexercises', knowledgemap.SaveExpandedAllExercises),
        ('/showunusedplaylists', ShowUnusedPlaylists),
        ('/crash', Crash),
        
        ('/admin/reput', bulk_update.handler.UpdateKind),
        ('/admin/retargetfeedback', RetargetFeedback),
        ('/admin/fixvideoref', FixVideoRef),
        ('/admin/deletestalevideoplaylists', DeleteStaleVideoPlaylists),
        ('/admin/deletestalevideos', DeleteStaleVideos),
        ('/admin/fixplaylistref', FixPlaylistRef),
        ('/admin/deletestaleplaylists', DeleteStalePlaylists),
        ('/admin/startnewbadgemapreduce', util_badges.StartNewBadgeMapReduce),
        ('/admin/startnewexercisestatisticsmapreduce', exercise_statistics.StartNewExerciseStatisticsMapReduce),
        ('/admin/backfill', backfill.StartNewBackfillMapReduce),
        ('/admin/dailyactivitylog', activity_summary.StartNewDailyActivityLogMapReduce),

        ('/coaches', coaches.ViewCoaches),
        ('/registercoach', coaches.RegisterCoach),  
        ('/unregistercoach', coaches.UnregisterCoach),          
        ('/individualreport', coaches.ViewIndividualReport),
        ('/progresschart', coaches.ViewProgressChart),        
        ('/sharedpoints', coaches.ViewSharedPoints),        
        ('/students', coaches.ViewStudents), 
        ('/classreport', coaches.ViewClassReport),
        ('/classtime', coaches.ViewClassTime),
        ('/charts', coaches.ViewCharts),

        ('/profile/graph/activity', util_profile.ActivityGraph),
        ('/profile/graph/focus', util_profile.FocusGraph),
        ('/profile/graph/exercisesovertime', util_profile.ExercisesOverTimeGraph),
        ('/profile/graph/exerciseproblems', util_profile.ExerciseProblemsGraph),
        ('/profile/graph/exerciseprogress', util_profile.ExerciseProgressGraph),
        ('/profile', util_profile.ViewProfile),

        ('/profile/graph/classexercisesovertime', util_profile.ClassExercisesOverTimeGraph),
        ('/profile/graph/classprogressreport', util_profile.ClassProgressReportGraph),
        ('/profile/graph/classenergypointsperminute', util_profile.ClassEnergyPointsPerMinuteGraph),
        ('/profile/graph/classtime', util_profile.ClassTimeGraph),
        ('/class_profile', util_profile.ViewClassProfile),

        ('/api/export', api.Export),
        ('/api/import', api.ViewImport),
        ('/api/importuserdata', api.ImportUserData),
        ('/api/playlists', api.Playlists),          
        ('/api/playlistvideos', api.PlaylistVideos), 
        
        ('/press/.*', ViewArticle),
        ('/login', Login),
        
        # These are dangerous, should be able to clean things manually from the remote python shell

        ('/deletevideoplaylists', DeleteVideoPlaylists), 
        ('/killliveassociations', KillLiveAssociations),

        # Below are all qbrary related pages
        ('/qbrary', qbrary.IntroPage),
        ('/worldhistory', qbrary.IntroPage),
        ('/managequestions', qbrary.ManageQuestions),
        ('/subjectmanager', qbrary.SubjectManager),
        ('/editsubject', qbrary.CreateEditSubject),
        ('/viewsubject', qbrary.ViewSubject),
        ('/deletequestion', qbrary.DeleteQuestion),
        ('/deletesubject', qbrary.DeleteSubject),
        ('/changepublished', qbrary.ChangePublished),
        ('/pickquestiontopic', qbrary.PickQuestionTopic),
        ('/pickquiztopic', qbrary.PickQuizTopic),
        ('/answerquestion', qbrary.AnswerQuestion),
        ('/previewquestion', qbrary.PreviewQuestion),
        ('/rating', qbrary.Rating),
        ('/viewquestion', qbrary.ViewQuestion),
        ('/editquestion', qbrary.CreateEditQuestion),
        ('/addquestion', qbrary.CreateEditQuestion),
        ('/checkanswer', qbrary.CheckAnswer),
        ('/sessionaction', qbrary.SessionAction),
        ('/flagquestion', qbrary.FlagQuestion),
        ('/viewauthors', qbrary.ViewAuthors),

        # Below are all discussion related pages
        ('/discussion/addcomment', comments.AddComment),
        ('/discussion/pagecomments', comments.PageComments),

        ('/discussion/addquestion', qa.AddQuestion),
        ('/discussion/expandquestion', qa.ExpandQuestion),
        ('/discussion/addanswer', qa.AddAnswer),
        ('/discussion/editentity', qa.EditEntity),
        ('/discussion/answers', qa.Answers),
        ('/discussion/pagequestions', qa.PageQuestions),
        ('/discussion/deleteentity', qa.DeleteEntity),
        ('/discussion/changeentitytype', qa.ChangeEntityType),
        ('/discussion/videofeedbacklist', qa.VideoFeedbackList),
        ('/discussion/videofeedbacknotificationlist', notification.VideoFeedbackNotificationList),
        ('/discussion/videofeedbacknotificationfeed', notification.VideoFeedbackNotificationFeed),
        ('/discussion/moderatorlist', qa.ModeratorList),

        ('/badges/view', util_badges.ViewBadges),

        ], debug=True)
    run_wsgi_app(application)

def profile_main():
    # This is the main function for profiling
    # We've renamed our original main() above to real_main()
    import cProfile, pstats
    prof = cProfile.Profile()
    prof = prof.runctx("real_main()", globals(), locals())
    print "<pre>"
    stats = pstats.Stats(prof)
    stats.sort_stats("cumulative")  # time or cumulative
    stats.print_stats(80)  # 80 = how many to print
    # The rest is optional.
    # stats.print_callees()
    stats.print_callers()
    print "</pre>"
    
main = real_main
# Uncomment the following line to enable profiling
# main = profile_main

if __name__ == '__main__':
    main()
