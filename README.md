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
  * **$isNull**
  * **$isBoolean**
  * **$isRegExp**

### Collections (objects, arrays)
  * **$clear(obj)** deletes all properties also removes all items if obj is an array, if you want to be anal about deleting things here you go
  * **$each** see underscore.js
  * **$map** see underscore.js
  * **$any** see underscore.js (a modifid implemntation but basically the same thing)
  * **$find** see underscore.js
  * **$reject** see underscore.js
  * **$length** see underscore.js
  * **$flat** flatten arrays recursively. Accepts any number of items. Returns an array of all values, any nested arrays are concated down to the one array.
  * **$slice(obj, start, end)** apply slice to a string, array or arguments object with optional start and end indexes
  * **$splice(obj, start, howMany, items)** apply splice to a string, array or arguments object, accepts multiple arguments or an array for "items" arg

### Objects
  * **$new(prototype)** optionally provide a prototype object for a new object instance. If an "init" function or an array of init functions exist it/they will be called.
  * **$copy(source, filter)** returns a deep copy of source. Optional filter(key, source, target) is called for every property traversed, if it returns true the property is copied over, if it returns false the property is ignored.
  * **$merge(target, source, filter)** returns a deep copy of source applied to target. Optional filter(key, source, target) is called for every property, if it returns true the property is copied over, if it returns false the property is ignored.
  * **$extend(obj)** obj will gain shallow copies of *all* properties of all other provided objects. This allows for building objects that share properties through composition vs prototype. This can save on memory and provide information sharing.
  * **$mixin(obj)** obj will gain deep copies of 'owned' properties of all other provided objects. The 'hasOwnProperty' test is applied to all properties during the deep copy.
  * **$make(prototype, extender, mixin)** All args are optional, extender and mixin may each be single objects or arrays of objects. $make calls $new on the prototype then extends it with extender and mixes in the mixin. "init" functions can exist as properties on any or all of the provided objects and will get called at the end with the new object as the "this". If any of the arguments is a speaker then the new object will also be a speaker. Also see tests and source for advanced message sharing capabilities.

### Date
  * **$now** shortcut for new Date().getTime()
  * **$timeAgo(date, compareTo)** Human friendly time delta. Supports strings and numbers that can be passed to new Date() including some that can't (see source), optional compareTo value defaults to now

### Pub/Sub
  * **$speak(obj)** Creates a new speaker (pub/sub). Optionally provide an object to turn into a speaker.
    * __tell(topic, message, speaker)__ tell (publish) a message to listeners (and self). Topic can be an exact string, a begins with matching string or a regex used for matching.
    * __listen(topic, responder, maxResponses)__ listnen (subscribe) to a specific message type (expressed as a stirng) told to this speaker and fire the responder function for it. If max responses is provided responder will remove itselfe after that number of executions. Responder signature: function(message, topic, originalSpeaker)
    * __ignore(ignoreable)__ stop listening with (unsubscribe) the ignorable listener. If ignorable is expressed as a type string all listeners of that type will be removed. If a funciton is passed all listeners using that funciton will be removed.
    * __talksTo(speaker)__ messages spoken by or told to this speaker will then be relayed to the provided speaker as well
    * __listensTo(speaker)__ messages told to the provided speaker will be relayed to this speaker as well
  * **$isSpeaker(obj)** returns true if the provided object is a pub/sub speaker

### Models
  * **$define(type, options)** creates a schema definition (which is a speaker) with given options that will be associated with the given type string. Once this is done you can use $model to create an instance of that type. Provide only a pre existing schema type string and it will return that schema.
  * **$schema(type)** an alias for define which makes more sense for getter-syntax usage.
    * __getModelInstances__ returns an array of all model instances based on this schema, see "$models" alias below
    * __destroy__ calls die on all model instances for this schema and then removes the schema from the list of defined schemas
  * **$model(type, obj)** Creates a model instance (which is a speaker) with set and get methods that emits a "change" event.
    * __set(key, value)__ adds key:value pair to model and emits a change event containting the changes
    * __set(object)__ adds the given keys:value pairs to the model and emits a "change" event containting the changes
    * __set(key)__ sets key to undefined
    * __get()__ returns the entire model
    * __get(key)__ returns the value of the given key on the model
    * __get(array)__ given an array of key strings returns an obect of matching key value pairs from the model
    * __die()__ deletes all properties on this model instance, schema no longer references model instance, emits a "dead" event whi
  * **$models(type)** an alias of $schema(type).getModelInstances();
  * **$isSchema(obj)** returns true if obj is a product of $define or $schema constructors
  * **$isModel(obj)** returns true if obj is a product of $model constructor
  
  ``` javascript
  // define a schema
  $define("person", {
    defaults: {
      first: "John",
      last: "Doe",
      fullName: function() {
        return this.first + " " +  this.last;
      }
    }
  });

  // now reference the schema to create a model
  var jim = $model("person", {
    first: "Jim",
    last: "Hipster"
  });

  // lets listen for a change in jim's age and alert that
  var alertAgeChange = function(changes, topic, originalSpeaker) {
    if ("age" in changes) {
      // lets grab all the values from the model
      var values = originalSpeaker.get();
      alert(values.first + "'s age set to " + changes.age);
    }
  };
  
  jim.listen("change", alertAgeChange);
  
  // we can also listen for changes that happen to any person model
  $schema("person").listen("change", alertAgeChange);

  jim.set({
    first: "Jim",
    last: "Hipster",
    age: 25,
    height: "5'8\""
  });
  // will alert twice "Jim's age set to 25"
  ```

### String
  * **$trim** // type agnostic string trim, just returns the original val if its not a string

### DOM
  * **$id** shortcut to document.getElementById
  * **$tpl** using the super-fast doT see https://github.com/olado/doT
  * **$el(selector, attributes, children) or (selector, children) or (selector)** a handy node builder / html string builder for those times you dont want to write a template or use the dom directly. eg. $el("button#buy.bigButton", {type:"submit"}, ["Buy It Now"]), will return a dom structure unless you call $el.outputStrings(true), then it will output an html string instead.  Makes uses of http://blog.fastmail.fm/2012/02/20/building-the-new-ajax-mail-ui-part-2-better-than-templates-building-highly-dynamic-web-pages/
  * **$escapeHTML(html)** see backbone

### Language Shims
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
