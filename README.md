# Loot.js
Loot is a bunch of useful functions in the (gasp!) global scope, prefixed with $. Dont like that? you can inject them into some namespace, but that would be lame.
This is an experimental bag of tricks that is starting to look like a microframework.

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

### Objects
  * **$new(prototype)** optionally provide a prototype object for a new object instance. If an "init" function or an array of init functions exist it/they will be called.
  * **$copy(source, filter)** returns a deep copy of source. Optional filter(key, source, target) is called for every property traversed, if it returns true the property is copied over, if it returns false the property is ignored.
  * **$merge(target, source, filter)** returns a deep copy of source applied to target. Optional filter(key, source, target) is called for every property, if it returns true the property is copied over, if it returns false the property is ignored.
  * **$extend(obj)** obj will gain shallow copies of *all* properties of all other provided objects. This allows for building objects that share properties through composition vs prototype. This can save on memory and provide information sharing.
  * **$mixin(obj)** obj will gain deep copies of 'owned' properties of all other provided objects. The 'hasOwnProperty' test is applied to all properties during the deep copy.
  * **$make(prototype, extender, mixin)** All args are optional, extender and mixin may each be single objects or arrays of objects. $make calls $new on the prototype then extends it with extender and mixes in the mixin. "init" functions can exist as properties on any or all of the provided objects and will get called at the end with the new object as the "this". If any of the arguments is a speaker then the new object will also be a speaker. Also see tests and source for advanced message sharing capabilities.

### Object Pools
  Why use this? It is an experimental performance enhancement, ideally an object pool will limit the total ammount of work performed, memory used and garbage produced. Tests and benchmarks yet to be written, memory use and GC analysis yet to be performed.

  * **$recyclable(name, constructor, reducer, maxItems)** create an object pool, Arguments: name = string identifier for the pool, constructor = function that returns a new instance of the object (NOT called with new), reducer = function(obj) returns the object instance back to a reusable state. This is optional as there is a defalut which will call a reduce method on the object and if that does not exist will clear the object viea $clear, maxItems = number, defaults to 100, limits the maximum number of items that can be managed by the pool.
  * **$reuse(name)** creates a new object instance by calling the pool's construcor method or if one is available pulls an item from the pool and calls a "renew" method on the object if one exists.
  * **$recycle(obj)** calls the pool's reducer method passing in the provided object, all references to this object should be broken at this point. Arguments: obj = an object that was returned by the $reuse function.
  * **$recycleBin(name)** returns an object pool by name or all pools if no name is provided.

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

### Async
  Most of this code is derived from the excellent async.js, changes include different signatures with more information being passed around and support for objects in addition to arrays, (crazy right?) the multi-signature $parallel and $series functions are versitile enough that they are all you need to use.

  * **$parallel** a multi-signature async swiss army knife, iteration happens in parallel, completing in unknown order.
    * **$parallel(func1, func2, ...)** this is a a fairly useless case for parallel, much more useflu in $series, each argument is a function(push, index, results), each function is called in order, each finishes in unknown order.
    * **$parallel(tasks, callback)** an alias for $async.tasks
    * **$parallel(collection, iterator, callback)** an alias for $async.each
  * **$series** a multi-signature async swiss army knife, iteration happens in series, completing in given order.
    * **$series(func1, func2, ...)** each argument is a function(push, index, results), each function is called in sequence one after the other as push functions are called, alternately if "results" is not used "push" can be called "next" omitting the second argument when calling it.
    * **$series(tasks, callback)** an alias for $async.tasksSeries
    * **$series(collection, iterator, callback)** an alias for $async.eachSeries
  * **$async.each(collection, iterator, callback)** iteration happens as soon as possible (in parallel), completing in unknown order, fires the callback once all the done functions have been called. The first argument provided to the iterator function is a done function which accepts an error (anything that is non-falsey) which will cause iteration to halt and the callback to be fired with the error. Arguments: collection = array or object, iterator = function(done, val, key, collection), callback = function(err, collection)
  * **$async.eachSeries(collection, iterator, callback)** same as $async.each but iteration happens one after the other (in series), completing in given order.  Arguments: same as $async.each
  * **$async.map(collection, iterator, callback)** simmilar to $async.each, iteration happens in parallel, completing in unknown order, instead of a done function the iterator is provided a push function where the second argument gets pushed into a results array. Results are available to both iterator and callback functions. Arguments: collection = array or object, iterator = function(push, val, key, results, collection), callback = function(err, results, collection)
  * **$async.mapSeries(collection, iterator, callback)** same as $async.map but iteration happens in series, completing in given order;
  * **$async.tasks(tasks, callback)** woks like a map function calling each function in the tasks array/object, the first argument to each function must be called when the function is complete and can be used to pass along an error or push a value into results. Arguments: tasks = array of functions with the signature function(push, key, results), callback = function(err, results, tasks)
  * **$async.tasksSeries(tasks, callback)** same as $async.parallelTasks but tasks are executed in series, one after the other. Alternately if results is not used push can be called "next" omitting the second argument when calling it.


### Pub/Sub
  This dude is optimized to perform insanely well, compared to other frameworks with a noop it can be upto 50x faster! That said, add in some work and most cross-frameowrk event system performance differences quickly diminsh to the point of being almost meaningless. Oh well.

  * **$speak(obj)** Creates a new speaker (pub/sub). Optionally provide an object to turn into a speaker.
    * __tell(topic, message, speaker)__ tell (publish) a message to listeners (and self), topic must be an exact string.
    * __listen(topic, responder, maxResponses)__ listnen (subscribe) to a specific message, topic = string (can be a catchall "*") messages with matching topics that get told to this speaker will fire the responder function. If max responses is provided responder will remove itselfe after that number of executions. Responder signature: function(message, topic, originalSpeaker)
    * __ignore(ignoreable)__ stop listening with (unsubscribe) the ignorable listener. If ignorable is expressed as a type string all listeners of that type will be removed. If a funciton is passed all listeners using that funciton will be removed.
    * __talksTo(speaker)__ messages spoken by or told to this speaker will then be relayed to the provided speaker as well
    * __listensTo(speaker)__ messages told to the provided speaker will be relayed to this speaker as well

  ``` javascript
  // create new speaker
  var mySpeaker = $speak();
  mySpeaker.name = "Mulder";

  // subscribe to an event and alert the message
  mySpeaker.listen("someEvent", function(msg) {
    alert(msg);
  });

  // now tell the event
  mySpeaker.tell("someEvent", "I want to believe.");

  // alerts "I want to believe."
  ```

  ``` javascript
  var someObject = {
    name: "Scully"
  }

  // add pub sub functionality to an existing object
  $speak(someObject);

  // lets forward all messages from mySpeaker to someObject
  // there are two ways to do this, the folloing two calls are equivalent
  mySpeaker.talksTo(someObject);
  // or
  someObject.listensTo(mySpeaker);


  // lets use a catch-all to fire our handler on all events
  someObject.listen("*", function(msg, type, originalSpeaker) {
    // the reciever of the function is bound to this
    alert(originalSpeaker.name + ' said: "' + msg + '" to ' + this.name + ' in a ' + type);
  });

  mySpeaker.tell("random comment", "The truth is out there!");

  // alerts 'Moulder said: "The truth is out there!" to Scully in a random comment'
  ```


  * **$isSpeaker(obj)** returns true if the provided object is a pub/sub speaker

### Models
  * **$define(type, options)** creates a schema definition (which is a speaker) with given options that will be associated with the given type string.

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
  ```

  * **$schema(type)** an alias for define which makes more sense for getter-syntax usage.
    * __getInstances__ returns an array of all model instances based on this schema, see "$models" alias below
    * __newInstance()__ returns a new model instances based on this schema, see "$model" alias below
    * __drop__ calls drop on all model instances for this schema and then removes the schema from the list of defined schemas

  ``` javascript
  // to delete a schema
  $schema("person").drop();
  ```

  * **$model(type, obj)** Creates a model instance of a previously defined schema with set and get methods that emits a "change" event.
    * __set(key, value)__ adds key:value pair to model and emits a change event containting the changes
    * __set(object)__ adds the given keys:value pairs to the model and emits a "change" event containting the changes
    * __set(key)__ sets key to undefined
    * __get()__ returns the entire model
    * __get(key)__ returns the value of the given key on the model
    * __get(array)__ given an array of key strings returns an obect of matching key value pairs from the model
    * __drop()__ deletes all properties on this model instance, schema no longer references model instance, emits a "drop" event whi
  
  ``` javascript
  // referencing the person schema we defined above, we create a new intance setting some properties up front.
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
  
  // all model instances talk to their schema so we can also listen for changes that happen to any person model by adding a change listener like so...
  $schema("person").listen("change", alertAgeChange);

  // the following will alert twice "Jim's age set to 25", firing first from the model then from the schema
  jim.set({
    first: "Jim",
    last: "Hipster",
    age: 25,
    height: "5'8\""
  });

  ```
  * **$models(type)** an alias of $schema(type).getModelInstances();
  * **$isSchema(obj)** returns true if obj is a product of $define or $schema constructors
  * **$isModel(obj)** returns true if obj is a product of $model constructor

### DOM
  * **$id** shortcut to document.getElementById
  * **$tpl** using the super-fast doT see https://github.com/olado/doT
  * **$el(selector, attributes, children) or (selector, children) or (selector)** a handy node builder / html string builder for those times you dont want to write a template or use the dom directly. eg. $el("button#buy.bigButton", {type:"submit"}, ["Buy It Now"]), will return a dom structure unless you call $el.outputStrings(true), then it will output an html string instead.  Makes uses of http://blog.fastmail.fm/2012/02/20/building-the-new-ajax-mail-ui-part-2-better-than-templates-building-highly-dynamic-web-pages/
  * **$escapeHTML(html)** see backbone

### Views
  * **$view(node, model, templateOrRenderFn)** create a view that renders when a model is updated
  * **$view(options)**

### Date
  * **$now** shortcut for new Date().getTime()
  * **$timeAgo(date, compareTo)** Human friendly time delta. Supports strings and numbers that can be passed to new Date() including some that can't (see source), optional compareTo value defaults to now

### String
  * **$trim** type agnostic string trim, just returns the original val if its not a string

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
