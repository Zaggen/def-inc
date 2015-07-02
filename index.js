// Generated by CoffeeScript 1.9.3
(function() {
  var _, defIncModule, filter,
    slice = [].slice,
    hasProp = {}.hasOwnProperty;

  _ = require('lodash');

  filter = require('./properties-filter');

  defIncModule = {
    settings: {
      nonEnumOnPrivate: true
    },

    /**
    * Defines a new Object or a Class that can inherit properties from other objects/classes in
    * a composable way, i.e you can pick, omit and delegate(methods) from the parent objects.
    * @param {object|function} propsDefiner
    * @param {string} type
    * @return {object|function}
     */
    define: function(propsDefiner, type) {
      var definedObj, i, j, k, len, len1, mixin, property, propertyName, propertyNames, ref;
      if (type == null) {
        type = 'object';
      }
      definedObj = this.setObj(propsDefiner, type);
      ref = this.mixins;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        mixin = ref[i];
        filter.set(this.options[i]);
        propertyNames = Object.getOwnPropertyNames(mixin);
        for (k = 0, len1 = propertyNames.length; k < len1; k++) {
          propertyName = propertyNames[k];
          if (!filter.skip(propertyName)) {
            property = mixin[propertyName];
            if (_.isFunction(property)) {
              this.addMethod(definedObj, propertyName, property, mixin);
            } else {
              this.addAttribute(definedObj, propertyName, property);
            }
          }
        }
        if (mixin.__static__ != null) {
          this.pushStaticMethods(mixin);
        }
      }
      this.markPseudoPrivateAsNonEnum(definedObj);
      return this.makeType(definedObj, type);
    },

    /** @private */
    setObj: function(propsDefiner, type) {
      var accessors, definedObj, includedTypes;
      definedObj = {};
      if (_.isFunction(propsDefiner)) {
        propsDefiner.call(definedObj);
      } else {
        definedObj = propsDefiner;
      }
      includedTypes = definedObj.include;
      accessors = definedObj.accessors;
      this.checkIfValid(definedObj, type);
      if (accessors != null) {
        this.defineAccessors(definedObj, accessors);
      }
      this.setIncludes(includedTypes);
      definedObj = this.clearConfigKeys(definedObj);
      this.definedAttrs = _.mapValues(definedObj, function(val) {
        return true;
      });
      this.staticMethods = {};
      return definedObj;
    },

    /** @private */
    clearConfigKeys: function(definedObj) {
      var attr, key, reservedKeys, tempObj;
      tempObj = {};
      reservedKeys = ['include', 'prototype', 'accessors'];
      for (key in definedObj) {
        attr = definedObj[key];
        if (!_.contains(reservedKeys, key)) {
          tempObj[key] = attr;
        }
      }
      tempObj._super = {};
      return tempObj;
    },

    /** @private */
    addMethod: function(definedObj, key, attr, mixin) {
      var fn;
      fn = attr;
      fn = this.useParentContext.hasOwnProperty(key) ? fn.bind(mixin) : fn;
      if (this.definedAttrs.hasOwnProperty(key)) {
        if (key === 'constructor') {
          return this.setSuperConstructor(definedObj, fn);
        } else {
          return definedObj._super[key] = fn;
        }
      } else {
        return definedObj[key] = definedObj._super[key] = fn;
      }
    },

    /** @private */
    addAttribute: function(definedObj, key, attr) {
      if (!this.definedAttrs.hasOwnProperty(key)) {
        return definedObj[key] = _.cloneDeep(attr);
      } else if (_.isArray(attr)) {
        return definedObj[key] = definedObj[key].concat(attr);
      } else if (_.isObject(attr) && key !== '_super') {
        return definedObj[key] = _.merge(definedObj[key], attr);
      }
    },

    /**
    * Checks if the object that is supposed to be a class has a constructor, and
    * that the one that is supposed to be a plainObject does not have one.
    * @private
     */
    checkIfValid: function(obj, type) {
      var hasConstructor, msg;
      hasConstructor = obj.hasOwnProperty('constructor');
      if (type === 'object' && hasConstructor) {
        msg = 'Constructor is a reserved keyword, to define classes\nwhen using def.Class method, but you are\ndefining an object';
        throw new Error(msg);
      } else if (type === 'class' && !hasConstructor) {
        msg('No constructor defined in the object. To create a class a constructor must be defined as a key');
        throw new Error(msg);
      }
    },

    /** @private */
    defineAccessors: function(obj, accessorsList) {
      var j, len, propertyName, results;
      results = [];
      for (j = 0, len = accessorsList.length; j < len; j++) {
        propertyName = accessorsList[j];
        results.push(Object.defineProperty(obj, propertyName, obj[propertyName]));
      }
      return results;
    },

    /**
    * @TODO Needs to support multiple constructor calling
    * @private
     */
    setSuperConstructor: function(target, constructor) {
      return target._super.constructor = function() {
        var superArgs;
        superArgs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return constructor.apply(superArgs.shift(), superArgs);
      };
    },

    /** @private */
    setIncludes: function(mixins) {
      this.mixins = [];
      this.options = [];
      this.useParentContext = {};
      return _.each(mixins, (function(_this) {
        return function(mixin) {
          var fn, obj;
          if (!_.isObject(mixin)) {
            throw new Error('Def-inc only accepts objects/arrays/fns e.g (fn/{} parent objects/classes or an [] with options)');
          } else if (_this.isOptionArr(mixin)) {
            return _this.options.push(_this.makeOptionsObj(mixin));
          } else if (_.isFunction(mixin)) {
            fn = mixin;
            obj = _.merge({}, fn.prototype);
            obj.constructor = fn;
            Object.defineProperty(obj, '__static__', {
              value: _.merge({}, fn),
              enumerable: false
            });
            return _this.mixins.push(obj);
          } else {
            return _this.mixins.push(mixin);
          }
        };
      })(this));
    },

    /** @private */
    isOptionArr: function(arg) {
      var isStringsArray;
      if (_.isArray(arg)) {
        isStringsArray = _.every(arg, function(item) {
          if (_.isString(item)) {
            return true;
          } else {
            return false;
          }
        });
        if (isStringsArray) {
          return true;
        } else {
          throw new Error('Array contains illegal types: The config [] should only contain strings i.e: (attr names or filter symbols (! or *) )');
        }
      } else {
        return false;
      }
    },

    /** @private */
    makeOptionsObj: function(attrNames) {
      var filterKey;
      filterKey = attrNames[0];
      switch (filterKey) {
        case '!':
          if (attrNames[1] != null) {
            attrNames.shift();
            attrNames = this.filterParentContextFlag(attrNames, true);
            return {
              'exclude': attrNames
            };
          } else {
            return {
              'excludeAll': true
            };
          }
          break;
        case '*':
          return {
            'includeAll': true
          };
        default:
          attrNames = this.filterParentContextFlag(attrNames);
          return {
            'include': attrNames
          };
      }
    },

    /** @private */
    filterParentContextFlag: function(attrNames, warningOnMatch) {
      var attrName, j, len, newAttrNames;
      newAttrNames = [];
      for (j = 0, len = attrNames.length; j < len; j++) {
        attrName = attrNames[j];
        if (attrName.charAt(0) === '~') {
          if (warningOnMatch) {
            console.warn('The ~ should only be used when including methods, not excluding them');
          }
          attrName = attrName.replace('~', '');
          newAttrNames.push(attrName);
          this.useParentContext[attrName] = true;
        } else {
          newAttrNames.push(attrName);
        }
      }
      return newAttrNames;
    },

    /**
    @private
     */
    checkForBalance: function(mixins, options) {
      if (options.length > 0 && mixins.length !== options.length) {
        throw new Error('Invalid number of conf-options: If you provide a conf obj, you must provide one for each mixin');
      }
      return true;
    },

    /** @private */
    pushStaticMethods: function(mixin) {
      var attr, key, ref, results;
      ref = mixin.__static__;
      results = [];
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        attr = ref[key];
        if (!filter.skip(key)) {
          results.push(this.staticMethods[key] = attr);
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    markPseudoPrivateAsNonEnum: function(definedObj) {
      var j, len, propertyName, propertyNames;
      propertyNames = Object.getOwnPropertyNames(definedObj);
      for (j = 0, len = propertyNames.length; j < len; j++) {
        propertyName = propertyNames[j];
        if (propertyName.charAt(0) === '_') {
          this.makeNonEnumProp(definedObj, propertyName);
        }
      }
      return this.freezeProp(definedObj, '_super');
    },

    /** @private */
    freezeProp: function(obj, attributeName) {
      if (obj[attributeName] != null) {
        return Object.freeze(obj[attributeName]);
      }
    },

    /** @private */
    makeNonEnumProp: function(obj, attributeName) {
      if (obj[attributeName] != null) {
        return Object.defineProperty(obj, attributeName, {
          enumerable: false
        });
      }
    },

    /**
    * Makes a pseudoClass (Constructor) and returns it when type is 'class' or
    * it returns the currently defined object as it is (when type is 'object')
    * @private
     */
    makeType: function(definedObj, type) {
      if (type === 'class') {
        return this.makeConstructor(definedObj);
      } else {
        return definedObj;
      }
    },

    /** @private */
    makeConstructor: function(obj) {
      var classFn;
      classFn = obj.constructor;
      _.merge(classFn, this.staticMethods);
      classFn.prototype = obj;
      return classFn;
    }
  };

  module.exports = {
    Object: function(obj) {
      return defIncModule.define.call(defIncModule, obj, 'object');
    },
    Class: function(obj) {
      return defIncModule.define.call(defIncModule, obj, 'class');
    },
    settings: function(conf) {
      if (_.isString(conf)) {
        return defIncModule.settings[conf];
      } else if (_.isObject(conf)) {
        return _.merge(defIncModule.settings, conf);
      }
    }
  };

}).call(this);

//# sourceMappingURL=index.js.map
