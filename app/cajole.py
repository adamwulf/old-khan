# This is from the Caja corkboard demo which is available under the
# usual Caja source license:
#
#    Copyright (C) 2010 Google Inc.
#    
#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
#    
#    http://www.apache.org/licenses/LICENSE-2.0
#    
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.
#
# Since it is intended as part of a tutorial for Caja integration, if
# you are interested in reusing it under a license other than Apache 2.0,
# please let the Caja developers know.

"""
Interface for using the cajoling service.

Note that this makes use of the App Engine memcache service, so it will need
changes to work outside of App Engine or if you don't want it to touch memcache.

@author kpreid@switchb.org
"""

from google.appengine.api import memcache, urlfetch

from google.appengine.ext.webapp import template

from django.utils import simplejson as json

import urllib2, hashlib, logging, re, os

# config
cajaServer = "http://caja.appspot.com/"
memcacheNamespace = "cajoled"
timeToCacheErrors = 120
timeToCacheTimeouts = 10

# constants
cajoleRequestURL = cajaServer + "cajole?input-mime-type=text/html" \
                                    + "&output-mime-type=application/json"
dummyModule = "___.loadModule({'instantiate': function () {}})"
requestBodyEncoding = "utf-8"

def mimeTypeFromUrllib2(response):
  # For some reason response.info().gettype() is returning text/plain, at least
  # in the dev server.
  return response.info().getheader("Content-Type").split(";")[0]

def cajolingErrorModule(e):
  """Given a HTTP 400 error (as presented by urllib2), return a cajoling-result
  dict showing the error."""
  # For some reason e.info().gettype() is returning text/plain.
  mimetype = mimeTypeFromUrllib2(e)
  if mimetype == "application/json":
    value = json.load(e)
    errorHtml = template.render(os.path.join(os.path.dirname(__file__),
                                             "cajole-error.t.html"),
                                {"response": value})
  elif mimetype == "text/html":
    # kludge for before issue 1250, kept in case of glitch/reversion
    errorHtml = e.read()
    errorMatch = re.search(r'(?s)(<pre>.*</pre>)', errorHtml)
    if errorMatch:
      errorHtml = errorMatch.group(1)
    errorHtml = "<div><strong>Cajoling error</strong></div>" + errorHtml
  else:
    errorHtml = "<div><strong>(Error interpreting cajoling error)</strong></div>"
  return {"html": errorHtml, "js": dummyModule, "error": True}

def cajole(html):
  """ Given HTML, return a dict of its cajoled form with keys 'html' and 'js'.
  
  If the cajoling fails, the dict will also have the key 'error' with a true
  value and the HTML will describe the error.
  """
  if html == "":
    # workaround for http://code.google.com/p/google-caja/issues/detail?id=1248
    return {"html": "", "js": dummyModule}
  hash = hashlib.sha1(html.encode("utf-8"))
  key = hash.digest()
  value = memcache.get(key, namespace=memcacheNamespace)
  if value is None:
    logging.debug("Cache miss (HTML sha1 " + hash.hexdigest() +
                  "); invoking cajoler.")
    cacheTime = 0 # forever
    try:
      try:
        # TODO(kpreid): Use URL Fetch async requests for parallelism/network
        # latency.
        result = urllib2.urlopen(urllib2.Request(
          cajoleRequestURL,
          html.encode(requestBodyEncoding),
          {
            "Content-Type": "text/html;charset="+requestBodyEncoding,
            "Accept": "application/json",
          }))
        if mimeTypeFromUrllib2(result) != 'application/json':
          raise Exception("Unexpected mime-type from cajoler: " +
              result.info().gettype())
        value = json.load(result)
      except urllib2.HTTPError, e:
        logging.exception("Error in invoking cajoler (matched HTTPError).")
        if e.code == 400:
          # cajoler's input error
          value = cajolingErrorModule(e)
        else:
          raise
      except urlfetch.DownloadError, e:
        if len(e.args) == 1 \
             and isinstance(e.args[0], str) \
             and "timed out" in e.args[0]:
          # TODO(kpreid): complain to app engine about not being able to
          # distinguish this properly.
          logging.exception("Timeout invoking cajoler.")
          # don't cache timeouts because the next try might work
          cacheTime = timeToCacheTimeouts
          value = {
            "html": "<strong>(Timeout contacting Caja service)</strong>",
            "js": dummyModule,
            "error": True
          }
        else:
          logging.exception("Error in invoking cajoler (matched DownloadError).")
          cacheTime = timeToCacheErrors
          value = {
            "html": "<strong>(Error contacting Caja service)</strong>",
            "js": dummyModule,
            "error": True
          }
    except Exception, e:
      logging.exception("Error in invoking cajoler.")
      # don't put in cache, might be a transient error
      # TODO(kpreid): when not debugging, DO put in cache with a shorter timeout
      # for high-load handling
      cacheTime = timeToCacheErrors
      value = {
        "html": "<strong>(Unexpected Caja error)</strong>", 
        "js": dummyModule,
        "error": True
      }
    memcache.add(key, value, time=cacheTime, namespace=memcacheNamespace)
  return value
