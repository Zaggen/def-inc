// Generated by CoffeeScript 1.9.3
(function() {
  var def, expect,
    slice = [].slice;

  expect = require('chai').expect;

  def = require('../index');

  describe('def-inc Module', function() {
    var baseObj5, mixin1, mixin2, mixin3, mixin4, objWithAttrs;
    mixin1 = {
      sum: function() {
        var j, len, n, numbers, r;
        numbers = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        r = 0;
        for (j = 0, len = numbers.length; j < len; j++) {
          n = numbers[j];
          r += n;
        }
        return r;
      },
      multiply: function() {
        var j, len, n, numbers, r;
        numbers = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        r = 1;
        for (j = 0, len = numbers.length; j < len; j++) {
          n = numbers[j];
          r *= n;
        }
        return r;
      }
    };
    mixin2 = {
      pow: function(base, num) {
        var i, j, nums, ref;
        nums = [];
        for (i = j = 1, ref = num; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
          nums.push(num);
        }
        return this.multiply.apply(this, nums);
      }
    };
    mixin3 = {
      increaseByOne: function(n) {
        return this.sum(n, 1);
      }
    };
    mixin4 = {
      _privateAttr: 5,
      publicMethod: function(x) {
        return this._privateMethod(x);
      },
      _privateMethod: function(x) {
        return x * this._privateAttr;
      },
      _privateMethod4: function(x) {
        return x / this._privateAttr;
      },
      _privateMethod2: function(x) {
        return x + this._privateAttr;
      },
      _privateMethod3: function(x) {
        return x - this._privateAttr;
      }
    };
    objWithAttrs = {
      enable: true,
      preferences: {
        fullScreen: true
      }
    };
    baseObj5 = {
      increaseByOne: function(n) {
        return this.sum(n, 1);
      },
      enable: false,
      itemList: ['item5']
    };
    return describe('def.Object method define an object that can inherit attributes from multiple objects/classes', function() {
      describe('The def-inc module', function() {
        it('should have an Object method', function() {
          expect(def.Object).to.exist;
          return expect(def.Object).to.be.a('function');
        });
        return it('should have a Class method', function() {
          expect(def.Class).to.exist;
          return expect(def.Class).to.be.a('function');
        });
      });
      describe('The defined object', function() {
        it('should have all methods from the included mixins and their original attributes', function() {
          var definedObj;
          definedObj = def.Object({
            include: [mixin1, mixin2, baseObj5]
          });
          return expect(definedObj).to.have.all.keys('increaseByOne', 'sum', 'multiply', 'pow', 'enable', 'itemList');
        });
        it('should be able to call the included methods', function() {
          var definedObj;
          definedObj = def.Object({
            include: [mixin1, mixin2, baseObj5]
          });
          expect(definedObj.sum(5, 10)).to.equal(15);
          expect(definedObj.increaseByOne(3)).to.equal(4);
          expect(definedObj.multiply(4, 2)).to.equal(8);
          return expect(definedObj.pow(2, 3)).to.equal(9);
        });
        it('should include(clone) attributes from the objects in the include array', function() {
          var definedObj;
          definedObj = def.Object({
            include: [objWithAttrs, baseObj5]
          });
          expect(definedObj.enable).to.exist;
          expect(definedObj.preferences.fullScreen).to.exist.and.to.be["true"];
          delete objWithAttrs.preferences.fullScreen;
          expect(definedObj.preferences.fullScreen).to.exist;
          return objWithAttrs.preferences = {
            fullScreen: true
          };
        });
        it('should not clone an attribute from a base object if its being defined in the obj passed to def.Object', function() {
          var definedObj;
          definedObj = def.Object({
            include: [objWithAttrs],
            increaseByOne: function(n) {
              return this.sum(n, 1);
            },
            enable: false,
            itemList: ['item5']
          });
          return expect(definedObj.enable).to.be["false"];
        });
        it('should have the attributes of the last baseObj that had an attr nameConflict (Override attrs in arg passing order)', function() {
          var definedObj;
          definedObj = def.Object({
            include: [
              {
                overridden: false,
                itemList: ['item2']
              }, {
                overridden: true
              }, baseObj5
            ]
          });
          expect(definedObj.overridden).to.be["true"];
          return expect(definedObj.itemList).to.deep.equal(['item5']);
        });
        it('should be able to only include the specified attributes from a baked baseObject, when an attr list [] is provided', function() {
          var definedObj;
          definedObj = def.Object({
            include: [mixin1, ['sum'], mixin4, ['publicMethod'], baseObj5, ['*']]
          });
          expect(definedObj.sum).to.exist;
          expect(definedObj.multiply).to.not.exist;
          expect(definedObj._privateAttr).to.not.exist;
          expect(definedObj._privateMethod).to.not.exist;
          expect(definedObj._privateMethod2).to.not.exist;
          return expect(definedObj._privateMethod3).to.not.exist;
        });
        it('should be able to exclude an attribute from a baked baseObject, when an "!" flag is provided e.g: ["!", "attr1", "attr2"]', function() {
          var definedObj;
          definedObj = def.Object({
            include: [mixin1, ['!', 'multiply'], baseObj5, ['*']]
          });
          expect(definedObj.sum).to.exist;
          return expect(definedObj.multiply).to.not.exist;
        });
        it('should include all attributes from a baked baseObject when an ["*"] (includeAll)  flag is provided', function() {
          var definedObj;
          definedObj = def.Object({
            include: [mixin1, ['*'], baseObj5, ['*']]
          });
          expect(definedObj.sum).to.exist;
          expect(definedObj.multiply).to.exist;
          return expect(definedObj.increaseByOne).to.exist;
        });
        it('should exclude all attributes from a baked baseObject when an ["!"] (excludeAll) flag is provided', function() {
          var definedObj;
          definedObj = def.Object({
            include: [mixin1, ['!'], baseObj5, ['*']]
          });
          expect(definedObj.sum).to.not.exist;
          expect(definedObj.multiply).to.not.exist;
          return expect(definedObj.increaseByOne).to.exist;
        });
        it('should have the _.super property hidden and frozen (non: enumerable, configurable, writable)', function() {
          var definedObj;
          definedObj = def.Object({
            include: [mixin1, baseObj5, ['*']]
          });
          expect(definedObj.propertyIsEnumerable('_super')).to.be["false"];
          return expect(Object.isFrozen(definedObj._super)).to.be["true"];
        });
        it('should include attributes from constructor functions/classes prototypes, when constructor is excluded', function() {
          var Parent, definedObj;
          Parent = (function() {
            function Parent() {}

            Parent.prototype.someMethod = function() {
              return 'x';
            };

            return Parent;

          })();
          definedObj = def.Object({
            include: [Parent, ['!', 'constructor'], baseObj5, ['*']]
          });
          expect(definedObj.someMethod).to.exist;
          return expect(definedObj.someMethod()).to.equal('x');
        });
        describe('When the accessors property is defined', function() {
          describe('In the object passed as argument to the def method (Object/Class)', function() {
            var definedObj;
            definedObj = def.Object({
              accessors: ['fullName'],
              _name: 'John',
              _lastName: 'Doe',
              fullName: {
                get: function() {
                  return this._name + " " + this._lastName;
                },
                set: function(fullName) {
                  var nameParts;
                  nameParts = fullName.split(' ');
                  this._name = nameParts[0];
                  return this._lastName = nameParts[1];
                }
              }
            });
            it('should set the getter to the specified attribute', function() {
              return expect(definedObj.fullName).to.equal('John Doe');
            });
            return it('should set the setter to the specified attribute', function() {
              definedObj.fullName;
              return expect(definedObj.fullName).to.equal('John Doe');
            });
          });
          return describe('In a fn passed as argument to the def method (Object/Class)', function() {
            var definedObj;
            definedObj = def.Object(function() {
              var lastName, name;
              name = 'John';
              lastName = 'Doe';
              this.accessors = ['fullName'];
              return this.fullName = {
                get: function() {
                  return name + " " + lastName;
                },
                set: function(fullName) {
                  var nameParts;
                  nameParts = fullName.split(' ');
                  name = nameParts[0];
                  return lastName = nameParts[1];
                }
              };
            });
            it('should set the getter to the specified attribute', function() {
              return expect(definedObj.fullName).to.equal('John Doe');
            });
            return it('should set the setter to the specified attribute', function() {
              definedObj.fullName;
              return expect(definedObj.fullName).to.equal('John Doe');
            });
          });
        });
        describe('when using a function as argument instead of an obj', function() {
          it('should be able to call truly static private attributes, when defining it as a local variable of the fn', function() {
            var definedObj;
            definedObj = def.Object(function() {
              var privateVar;
              privateVar = 5;
              this.set = function(n) {
                return privateVar = n;
              };
              return this.get = function() {
                return privateVar;
              };
            });
            expect(definedObj.privateVar).to.not.exist;
            expect(definedObj.get()).to.equal(5);
            definedObj.set(4);
            return expect(definedObj.get()).to.equal(4);
          });
          return it('should be able to call truly private methods, when defining it as a local variable of the fn', function() {
            var definedObj;
            definedObj = def.Object(function() {
              var square;
              this.calculate = function(n) {
                return square(n);
              };
              return square = function(n) {
                return n * n;
              };
            });
            console.log(definedObj);
            return expect(definedObj.calculate(5)).to.equal(25);
          });
        });
        describe('When an attribute(Only methods) is marked with the ~ flag in the filter array, e.g: ["~methodName"]', function() {
          it('should bind the method context to the original obj (parent) instead of the target obj', function() {
            var definedObj;
            definedObj = def.Object({
              include: [mixin4, ['~publicMethod']]
            });
            expect(definedObj._privateAttr).to.not.exist;
            expect(definedObj._privateMethod).to.not.exist;
            expect(definedObj.publicMethod).to.exist;
            return expect(definedObj.publicMethod(2)).to.equal(10);
          });
          return it('should ignore ~ when using the exclude flag', function() {
            var definedObj;
            definedObj = def.Object({
              include: [mixin4, ['!', '~_privateMethod']]
            });
            return expect(definedObj._privateMethod).to.not.exist;
          });
        });
        describe('When inheriting from multiple objects', function() {
          return it('should include/inherit attributes in the opposite order they were passed to the function, so the last ones takes precedence over the first ones, when an attribute is found in more than one object', function() {
            var definedObj, definedObj2;
            definedObj = def.Object({
              include: [
                mixin1, {
                  multiply: function(x) {
                    return x;
                  }
                }
              ]
            });
            expect(definedObj.multiply(5)).to.equal(5);
            definedObj2 = def.Object({
              include: [definedObj, mixin1]
            });
            return expect(definedObj2.multiply(5, 5)).to.equal(25);
          });
        });
        return describe('When redefining a function in the receiving object', function() {
          return it('should be able to call the parent obj method via the _super obj', function() {
            var definedObj;
            definedObj = def.Object({
              include: [mixin1],
              multiply: function() {
                var numbers;
                numbers = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                return this._super.multiply.apply(this, numbers) * 2;
              }
            });
            return expect(definedObj.multiply(2, 2)).to.equal(8);
          });
        });
      });
      return describe('def.Class method defines a Class/Type/Constructor that can inherit attributes from multiple objects/classes', function() {
        it('should include static attributes (classAttributes) from constructor functions/classes, to the resulting constructor, when one is defined', function() {
          var Parent, definedObj, instanceOfBaked;
          Parent = (function() {
            function Parent() {}

            Parent.staticMethod = function() {
              return 'y';
            };

            return Parent;

          })();
          definedObj = def.Class({
            include: [Parent],
            constructor: function() {
              return true;
            }
          });
          instanceOfBaked = new definedObj;
          expect(instanceOfBaked.staticMethod).to.exist;
          return expect(instanceOfBaked.staticMethod()).to.equal('y');
        });
        it('should not include static attributes (classAttributes) from constructor functions/classes, when a constructor is not defined', function() {
          var Parent, definedObj;
          Parent = (function() {
            function Parent() {}

            Parent.staticMethod = function() {
              return 'y';
            };

            return Parent;

          })();
          definedObj = def.Object({
            include: [Parent, ['!', 'constructor']]
          });
          expect(definedObj.staticMethod).to.exist;
          return expect(definedObj.staticMethod()).to.equal('y');
        });
        return describe('When any of the included element defines a constructor method', function() {
          return it('should be a constructor function that calls the constructor defined in the receiving obj ', function() {
            var definedObj, instance;
            definedObj = def.Class({
              include: [
                {
                  constructor: function(msg) {
                    return this.msg = msg;
                  }
                }
              ],
              constructor: function() {
                return this._super.constructor(this, "I'm baked");
              }
            });
            instance = new definedObj("I'm baked");
            return expect(instance.msg).to.equal("I'm baked");
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=index.spec.js.map
