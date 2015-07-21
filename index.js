// Generated by CoffeeScript 1.9.3
(function() {
  var _, conf, currentNonEnumConf, defInc, definedAttrs, filter, log, mixins, options, parentPrototype, staticMethods, useParentContext,
    hasProp = {}.hasOwnProperty;

  _ = require('lodash');

  filter = require('./properties-filter');

  log = console.log;

  defInc = {};

  options = null;

  mixins = null;

  definedAttrs = null;

  currentNonEnumConf = null;

  staticMethods = null;

  parentPrototype = null;

  useParentContext = null;

  conf = {
    nonEnum: {
      leadingChar: '_',
      enabled: true
    }
  };

  defInc = {
    defObject: function(propsDefiner) {
      return defInc.define(propsDefiner, 'object');
    },
    defClass: function(propsDefiner) {
      return defInc.define(propsDefiner, 'class');
    },
    defAbstract: function(propsDefiner) {
      if (propsDefiner.hasOwnProperty('constructor')) {
        return defInc.define(propsDefiner, 'class');
      } else {
        return defInc.define(propsDefiner, 'object');
      }
    },

    /**
    * Defines a new Object or a Class that can inherit properties from other objects/classes in
    * a composable way, i.e you can pick, omit and delegate(methods) from the parent objects.
    * @param {object|function} propsDefiner
    * @param {string} type
    * @return {object|function}
     */
    define: function(propsDefiner, type) {
      var definedObj, i, j, k, len, len1, mixin, property, propertyName, propertyNames;
      if (type == null) {
        type = 'object';
      }
      definedObj = this.setObj(propsDefiner, type);
      for (i = j = 0, len = mixins.length; j < len; i = ++j) {
        mixin = mixins[i];
        filter.set(options[i]);
        propertyNames = Object.getOwnPropertyNames(mixin);
        for (k = 0, len1 = propertyNames.length; k < len1; k++) {
          propertyName = propertyNames[k];
          if (!filter.skip(propertyName)) {
            property = mixin[propertyName];
            if (_.isFunction(property)) {
              this.addMethod(definedObj, propertyName, property, mixin, type);
            } else {
              this.addAttribute(definedObj, propertyName, property);
            }
          }
        }
        if (mixin.__static__ != null) {
          this.pushStaticMethods(mixin);
        }
      }
      this.markPropertiesAsNonEnum(definedObj);
      type = this.makeType(definedObj, type);
      this.clearData();
      return type;
    },

    /** @private */
    setObj: function(propsDefiner, type) {
      var accessors, definedObj, includedTypes, objWithProto, parent, prototype;
      definedObj = {};
      if (_.isFunction(propsDefiner)) {
        propsDefiner.call(definedObj);
      } else {
        definedObj = propsDefiner;
      }
      includedTypes = definedObj.merges;
      parent = definedObj["extends"];
      prototype = (parent != null ? parent.prototype : void 0) != null ? parent.prototype : parent;
      accessors = definedObj.accessors;
      currentNonEnumConf = this.makeNonEnumSettings.apply(this, definedObj.nonEnum);
      this.checkIfValid(definedObj, type);
      if (accessors != null) {
        this.defineAccessors(definedObj, accessors);
      }
      this.setIncludes(includedTypes);
      definedObj = this.clearConfigKeys(definedObj);
      definedAttrs = _.mapValues(definedObj, function(val) {
        return true;
      });
      staticMethods = {};
      if (parent != null) {
        objWithProto = Object.create(prototype);
        definedObj = _.merge(objWithProto, definedObj);
        definedObj._super = {
          constructor: prototype.constructor
        };
      } else {
        definedObj._super = {};
      }
      return definedObj;
    },

    /** @private */
    clearConfigKeys: function(definedObj) {
      var attr, key, reservedKeys, tempObj;
      tempObj = {};
      reservedKeys = ['merges', 'extends', 'accessors', 'nonEnum'];
      for (key in definedObj) {
        attr = definedObj[key];
        if (!_.contains(reservedKeys, key)) {
          tempObj[key] = attr;
        }
      }
      return tempObj;
    },

    /** @private */
    addMethod: function(definedObj, key, attr, mixin) {
      var fn;
      fn = attr;
      fn = useParentContext.hasOwnProperty(key) ? fn.bind(mixin) : fn;
      if (definedAttrs.hasOwnProperty(key)) {
        if (key !== 'constructor') {
          return definedObj._super[key] = fn;
        }
      } else {
        return definedObj[key] = definedObj._super[key] = fn;
      }
    },

    /** @private */
    addAttribute: function(definedObj, key, attr) {
      if (!definedAttrs.hasOwnProperty(key)) {
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
        msg = 'No constructor defined in the object. To create a class, a constructor must be defined as a key';
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

    /** @private */
    setIncludes: function(mixinList) {
      var balancer;
      mixins = [];
      options = [];
      useParentContext = {};
      balancer = {
        mixinsCount: 0,
        optionsCount: 0
      };
      return _.each(mixinList, (function(_this) {
        return function(mixin) {
          var fn, i, j, obj, padding, ref;
          if (!_.isObject(mixin)) {
            throw new Error('Def-inc only accepts objects/arrays/fns e.g (fn/{} parent objects/classes or an [] with options)');
          } else if (_this.isOptionArr(mixin)) {
            balancer.optionsCount++;
            padding = balancer.mixinsCount - balancer.optionsCount;
            for (i = j = 0, ref = padding; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
              options.push(_this.makeOptionsObj(['*']));
            }
            return options.push(_this.makeOptionsObj(mixin));
          } else if (_.isFunction(mixin)) {
            fn = mixin;
            obj = _.merge({}, fn.prototype);
            obj.constructor = fn;
            Object.defineProperty(obj, '__static__', {
              value: _.merge({}, fn),
              enumerable: false
            });
            mixins.push(obj);
            return balancer.mixinsCount++;
          } else {
            mixins.push(mixin);
            return balancer.mixinsCount++;
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
          useParentContext[attrName] = true;
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
          results.push(staticMethods[key] = attr);
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    markPropertiesAsNonEnum: function(definedObj) {
      var j, len, nonEnum, propertyName, propertyNames;
      nonEnum = currentNonEnumConf;
      if (nonEnum.enabled) {
        propertyNames = Object.getOwnPropertyNames(definedObj);
        for (j = 0, len = propertyNames.length; j < len; j++) {
          propertyName = propertyNames[j];
          if (propertyName.charAt(0) === nonEnum.leadingChar) {
            this.defNonEnumProp(definedObj, propertyName);
          }
        }
      } else {
        this.defNonEnumProp(definedObj, '_super');
      }
      this.freezeProp(definedObj, '_super');
      return true;
    },

    /** @private */
    makeNonEnumSettings: function() {
      var enabledStatus, leadingChar;
      if (arguments[0] != null) {
        leadingChar = arguments[0];
        enabledStatus = arguments[1] != null ? arguments[1] : true;
        return {
          nonEnum: {
            leadingChar: leadingChar,
            enabled: enabledStatus
          }
        };
      } else {
        return conf.nonEnum;
      }
    },

    /** @private */
    freezeProp: function(obj, attributeName) {
      if (obj[attributeName] != null) {
        return Object.freeze(obj[attributeName]);
      }
    },

    /** @private */
    defNonEnumProp: function(obj, attributeName) {
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
    makeConstructor: function(classPrototype) {
      var classFn;
      classFn = classPrototype.constructor;
      classFn.prototype = classPrototype;
      if (parentPrototype != null) {
        classFn.prototype = Object.create(parentPrototype);
        classFn.prototype = _.merge(classFn.prototype, classPrototype);
        classFn.prototype._super = classPrototype._super;
      }
      if (staticMethods != null) {
        _.merge(classFn, staticMethods);
      }
      return classFn;
    },
    clearData: function() {
      options = null;
      mixins = null;
      definedAttrs = null;
      currentNonEnumConf = null;
      staticMethods = null;
      return useParentContext = null;
    }
  };

  module.exports = {
    Class: defInc.defClass,
    Abstract: defInc.defAbstract,
    Object: defInc.defObject,
    Module: defInc.defObject,
    Mixin: defInc.defObject,
    setNonEnum: function() {
      return conf = defInc.makeNonEnumSettings(arguments[0], arguments[1]);
    },
    getNonEnum: function() {
      return conf.nonEnum;
    }
  };

}).call(this);

//# sourceMappingURL=index.js.map
