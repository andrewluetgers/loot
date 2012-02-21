# Loot.js
Underscore is cool but for some odd reason it annoys me to do _. for everything and I will never use much of
that library so I took some stuff from there and other sources and set up this to store all the little
snippets I like to use. Beware,
parts of the sauce extension are still under construction but the io module should work fine. Bugs, patches,
suggestions etc. welcome.

## Use it
Just load up the js file/s and call the global methods. Init process will protect existing globals by making backups under loot.oldValues. See loot.sauce.js for extending with custom methods.

## Methods


### Type Checking
see underscore.js

  * **$isNumber**
  * **$isEmpty**
  * **$isElement**
  * **$isArray**
  * **$isFunction**
  * **$isString**
  * **$isNaN**
  * **$isBoolean**
  * **$isRegExp**

### Collections
  * **$each** see underscore.js
  * **$map** see underscore.js
  * **$any** see underscore.js (a modifid implemntation but basically the same thing)
  * **$find** see underscore.js
  * **$reject** see underscore.js
  * **$length** see underscore.js
  * **$sliceIt(obj, start, end)** apply slice to a string, array or arguments object with optional start and end indexes
  * **$flat** flatten arrays recursively. Accepts any number of items. Returns an array of all values, any nested arrays are concated down to the one array.

### Objects
This is how I like to construct objects and do inheritance.

  * **$new(prototype)** optionally provide a prototype object for a new object instance. If an "init" function attribute exists it will be called then set to null.
  * **$deepCopy(source, filter)** returns a deep copy of source. Optional filter(key, source, target) is called for every property traversed, if it returns true the property is copied over, if it returns false the property is ignored.
  * **$deepMerge(target, source, filter)** returns a deep copy of source applied to target. Optional filter(key, source, target) is called for every property, if it returns true the property is copied over, if it returns false the property is ignored.
  * **$extend(obj)** obj will gain shallow copies of *all* properties of all other provided objects. This allows for building objects that share properties through composition vs prototype. This can save on memory and provide information sharing.
  * **$mixin(obj)** obj will gain deep copies of 'owned' properties of all other provided objects. The 'hasOwnProperty' test is applied to all properties during the deep copy.
  * **$make(prototype, extender, mixin)** All args are optional, extender and eixin may each be single objects or arrays of objects. $make calls $new with each of the arguments then extends prototype with extender and mixes in the mixin. Also adds support for "afterMake" functions. These functions can exist as properties on either or each of the arguments and will be called with the new object as the "this". If any of the arguments is a speaker the new object will also be a speaker. Also see tests and source for advanced message sharing capabilities.

### Date
  * **$now** shortcut for new Date().getTime()
  * **$timeAgo(date, compareTo)** Human friendly time delta. Supports strings and numbers that can be passed to new Date() including some that can't (see source), optional compareTo value defaults to now

### Pub/Sub
  * **$speak(obj)** Creates a new speaker (pub/sub). Optionally provide an object to turn into a speaker.
    * __tell(topic, message, speaker)__ tell (publish) a message to listeners (and self). Topic can be an exact string, a begins with matching string or a regex used for matching.
    * __listen(topic, responder, maxResponses)__ listnen (subscribe) to a specific message type (expressed as a stirng) told to this speaker and fire the responder function for it. If max responses is provided responder will remove itselfe after that number of executions.
    * __stopListening(ignoreable)__ stop listening with (unsubscribe) the ignorable listener. If ignorable is expressed as a type string all listeners of that type will be removed. If a funciton is passed all listeners using that funciton will be removed.
    * __talksTo(speaker)__ messages spoken by or told to this speaker will then be relayed to the provided speaker as well
    * __listensTo(speaker)__ messages told to the provided speaker will be relayed to this speaker as well
  * **$isSpeaker(obj)** returns true if the provided object is a pub/sub speaker

### String
  * **$trim** // type agnostic string trim, just returns the original val if its not a string

### DOM
  * **$id** shortcut to document.getElementById
  * **$tpl** see underscore.js template
  * **$el(selector, attributes, children) or (selector, children) or (selector)** super cool node builder / html string builder eg. $el("button#buy.bigButton", {type:"submit"}, ["Buy It Now"]), will return a dom structure unless you call $el.outputStrings(true), then it will output an html string instead.
  * **$escapeHTML(html)** see backbone

### Language Shims
a very short list
  * **String.splice(index, howManyToDelete, stringToInsert)** adds splice functionality for strings
  * **Object.keys()** adds ES5 Object.keys functionality to retrograde js engines

# loot.sauce.js
## $cache
  * **types** the in-memory storage location for typed/cached data
  * **getKey(url, req)** returns a cache key. for 1 args the cacheKey is just the url, eg. "/contents" for 2 args a key is generated with the url and the req , if the url was /user and post or get values were {name:"jim",age:25} then the key would be /user\[name:jim,age:25]
  * **get(typeId, url, req)** if given just a typeId returns that type object. Otherwise returns an existing item from the cache or creates a new bin corresponding to the provided typeId, url and optional request params.
  * **evict(typeId, evictionTest)** remove items from the cache. evictionTest(bin, cacheKey) is an optional function to filter the items to evict. an eviction notice will be told to the cache so others can listen in and respond as needed. Returns stats on how how many items were evicted out of how many and what remains.
  * **set(typeId, url, req, val, metaData)** sets/updates a response value in the cache corresponding to the provided typeId, url and request params. MetaData is optional. Returns the cache bin that was set.
  * **newType(typeId, customType)** provide a typeId string and optional typeObject to create a new type group in the cache.
  * **newRemoteType(typeId, spec)** an advanced cache type that abstracts away async io thorugh a sync mehod.

## $sauce
 as-yet untested :-(
 
  * **io(url, req, dataType, reqType)** abstracting away async io, currently depends on jquery
