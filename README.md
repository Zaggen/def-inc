# Def-Inc
![travis.ci](https://travis-ci.org/Zaggen/def-inc.svg?branch=master "Build Status")

**This module is in active development, and still in beta, do not use in production.... yet**

## A Multiple composable inheritance module for js
def-inc is an npm module that allows you to easily define Objects and classes that can inherit from a single parent object by adding it to the prototype chain of the define object (via the 'extends' directive) or from multiple objects or "classes" (via 'merges' directive), and lets you to choose which attributes you merge/inherit (Pick/omit/delegate). It also allows you to work with true shared privacy with almost the same syntax.
 
## Installation
`npm install def-inc --save`

## Usage
```coffeescript
def = require('def-inc')
```
**Class definition** (All attributes not defined in the constructor will live in the prototype obj)
```coffeescript
Character = def.Class
 constructor: ()->
  # some code
 setSkills: (newSkills = [])->
  # some code
  
Player = def.Class
  extends: Character # It will add the Character.prototype to the Player.prototype chain
  constructor: (@playerName)->
    # some code
  sayMsg: ->
    # some code
  kill: ->
    # some code

plyr1 = new Player('zaggen')
```
**Object definition** (Pretty much the same as defining an object literal)
```coffeescript
enemyBoss = def.Object
  extends: Character # It sets Character.prototype as the prototype of the enemyBoss obj
  killThemAll: ->
    # some code
  regenHpWhenAlmostDead: ->
    # some code

```
**Mixin definition** This is exactly the same function as def.Object, it is just
an alias to sort of create a convention of defining objects that their sole purpose
is to be included, pretty much like ruby modules or php traits.
```coffeescript
accountTraits = def.Mixin
  logIn: (req, res)->
    # some code
  logOut: (req, res)->
    # some code

```
**Module definition** This is another alias for def.Object, it is recommended for npm style modules. So you can define functionality packed in a module(which is a regular object) that needs to expose a small public API, and is not suppose to be inherited/mixed-in.You can define your own rules, but this is what i use it for.
```coffeescript
injector = def.Module ->
  @set = (fn)->
    # some code
  @get =  ->
    # some code
    
  # Private fns
  import = (path)->
   # some code
  importGlobal = (globalName)->
   #some code

```
Here is a working example using this option:
[commonjs-injector](https://github.com/Zaggen/commonjs-injector/blob/master/index.coffee)

#### Usage with multiple inheritance and defined constructor
You can inherit from multiple "Classes" or objects, or a mixture of both. 
```coffeescript
Admin = def.Class
  merge: [ accountTraits, ['logIn', 'logOut'],  User] # here User is a class
  constructor: (@name)->
    @privileges = 'all'
  deleteUser: ->
    # Some Code
  modifyUser: ->
    # Some Code

zaggen = new Admin('zaggen')
```
Please note that 'merges' copies the attributes or references to the defined item, so any change in the parents won't
be reflected in the defined item.

#### Usage with real private methods and attrs(shared)
You can get true privacy when passing a lambda instead of an object, in this anonymous fn you will define your public
attrs as instance members of that fn, and your private attributes as local variables, the nice thing here is a that all
your public functions will have access to the private stuff (This is a closure that is executed internally) and you
can define your private variables at the bottom like in ruby, which is hard to do in cs because we only have fn 
expressions so we don't get hoisted fns... anyways, you can use private properties too (data) but this data will be 
shared across all instances of the class, so be aware of that, its usefull for objects, but not that much for classes.
You can use weakMaps to accomplish this but that is not something def-inc will do for you, additionally bare in mind that
if you add public functions later, this fns can't access the previously defined private properties, because they will be
out of scope, so monkey patching is not possible, also you can't inherit private members. Is probably better to use
the underscore convention for private attrs in most cases, but sometimes you really want this behavior, so here it is.
```coffeescript
Admin = def.Class ->
  # private properties have to be defined at the top in cs
  instanceNumber = 0
  # Public
  @constructor = (@name)->
    instanceNumber++
    
  @getInstanceQ = -> return instanceNumber
  @deleteUser = (id)->
    dbQuery('delete', id)
  @modifyUser = (id, data)->
    dbQuery('modify', id, data)
    
  # Private Methods
  dbQuery = (action, id, data = {})->
    # Some Code
    
zaggen = new Admin('zaggen')
zaggen.deleteUser(5) # Works
zaggen.dbQuery('delete',5) # Won't work
```

#### Usage with real private methods and attrs(shared) and accessors
```coffeescript
user = def.Object ->
  name = 'John'
  lastName =  'Doe'
  @accessors = ['fullName'] # Add the names of the properties that you want to define as accessors
  @fullName =
    get: -> "#{name} #{lastName}"
    set: (fullName)->
      nameParts = fullName.split(' ')
      name = nameParts[0]
      lastName = nameParts[1]
    
console.log user.fullName # Logs 'John Doe'
user.fullName = 'Max Payne' # Sets the private name and lastName variables with the value provided
console.log user.fullName # Logs 'Max Payne'
```

## Features
* Set another object/Class as the prototype of the defined element (Using extends).
* Merge properties from other objects/classes into the defined element  (Using merges).
* You have composite options, meaning you can pick which attributes you merge and even set the context of methods to
 their original objects.
* A `_super` object is created when extending the receivingObj, it will contain all of the inherited(extended and merged)
 methods into it. This is useful when you want to override an inherited parent method but you still want to have access
 to the original functionality.
* You can define 'classes' very easy, and extend them with out ,manually adding the parent class prototype to the 
currently defined class and setting back the original constructor, or adding methods to the prototype one by one.

## Merge options
When you pass an options array after the object to be merge, e.g:
```coffeescript
  merge: [ accountTraits, ['logIn', 'logOut'],  User]
```
You can specify which properties you merge into the defined obj/class, by combining the property names you want to
add or exclude from the mixin/class and/or a few optional flags (`!`, `*`,`~`).
* This are the options in details
  - `['attr1', 'attr2']` Will only include those selected attributes from the corresponding object
  - `['~publicMethod']` Delegate; Will only include those selected method and it will bind its context to the original
   baseObject. This is useful, when you have an object with "public" methods that make use of internal "private" methods,
   and you don't want to inherit those, this way this inherited method will be able to call all the needed attributes
   and methods from its original obj. Use this sparingly since it will bite you if you try to use it incorrectly.
   Just remember that the inherit method will not have access to any of your attributes/methods defined/inherited in
   the receivingObj. Also, this flag is ignored for non function attributes, and when the exclude flag is set,
   since we can't bind an excluded method...
  - `['!', 'privateAttr']` Will exclude the selected attr, and include the rest
  - `['!']` Will exclude all attributes. Only useful for debugging purposes
  - `['*']` Will include all attributes. By default if you don't provide a confArray there is no need to explicitly say
   to include all attributes, but if you like to be explicit here is the option.

## Examples
```coffeescript
def = require('def-inc')

hardObjTraits = def.Mixin
  colliding: false
  isInCollision: ->
    # Detects if object is colliding with other hardObjs

movableTraits = def.Mixin
  x: 0
  y: 0
  move: (x, y, time)->
    # Moves from current x,y to the new pos in the given time
    
spriteTraits = def.Mixin
  setBitmap: (bitmap)->
    # Sets sprite to the specified bitmap
  update: ->
    # Updates sprite
    
gameCharacter = def.Object
  merge: [movableTraits, spriteTraits, hardObjTraits]
  _exp: 0
  lvlUp: (newExp)->
    @_increaseExp(newExp) # Private Method Call
    # Lvl up based on exp
    
  _increaseExp: (newExp)-> @_exp += newExp

    
gameCharacter.move(100, 200, 100) # Moves the character to position (100,200) in 100 milliseconds

killableTraits = def.Mixin
  kill: ()-> 
    #Set hp to 0, and show dead animation

Player = def.Class
  merge: [ gameCharacter, ['~lvlUp'], killableTraits, ['kill'] ]
  constructor: (playerName)->
    @msg = "#{playerName} is ready to kill some goblins!"
  sayMsg: ->
    console.log @msg
  kill: ->
    @_super.kill()
    console.log 'Game Over'
  
zaggen = new Player('Zaggen')
zaggen.sayMsg() # Outputs "Zaggen is ready to kill some goblins!"
zaggen.lvlUp(100) #Increases exp, and if enough it'll lvl up the player
zaggen.move(15, 40, 10) # Moves the character to position (15,40) in 10 milliseconds
```


### Comming features?
* I've been thinking in how to implement real protected(shared) methods and private instance variables
with a nice syntax and so far i have two ideas, one involves using eval, and it'll be a little slower at definition time
since it has to eval every method once is defined, and using this method is not possible to have instance variables with
the same syntax. The syntax is pretty much what is on an example up there, where public methods use @ and private methods
don't.

* The other option which is more realistic and doable, and maybe performs better is something like this:
```coffeescript

Player = def.Class (pv)->
    @include = [ AccountTraits, ['logIn'] ]
    @constructor = (playerName)->
      pv(@).playerName = "#{playerName}-Sama"
      pv.each()

    @sayMsg = (msg)->
      console.log msg

    @kill = ->
      pv.calculateHp(0)
      @sayMsg "You are dead"

    pv.calculateHp = (hp)->
      return hp

    pv.beforeCreate = (values, next)->
      values.slug = Tools.slugify(values.name)
      next()

```

All pv methods are protected, meaning they can be inherited, and instance variables `pv(@)` won't be shared across
instances, this needs weakmaps to avoid memory leaks, but if not present, it will use objects and ids internally and
you will have to make sure to call the pv(@).__destroy__() method before removing the object.
With this syntax we get what other languages have, you can call public methods inside private ones, since they will be
internally bind to the public object, i won't make the public object as prototype to accomplish this since that will mess
up with the calling of @ inside those methods.
I'll try to work on this as soon as i have time, i think i like it better than most modules out there trying to do something
similar, the only thing i'm not sure yet is, "is it worth it"?

EDIT: Now i realize, that using this syntax, if i set the context of the pv fns to the currently defined class i'll lose
access to the other private methods, but if i don't i have to manually pass the context to each private fn.
Also, i think that to have protected (not shared) instance variables on a subclass i have to use eval, since the pv var
passed to the child won't be the same one passed to the parent.

## Bugs, questions, ideas?
Hell, yeah, just open an issue and i'll try to answer ASAP. I'll appreciate any bug report with a propper way to reproduce it.