// Generated by CoffeeScript 1.9.3
(function() {
  var mocks,
    slice = [].slice;

  mocks = {
    mixin1: {
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
    },
    mixin2: {
      pow: function(base, num) {
        var i, j, nums, ref;
        nums = [];
        for (i = j = 1, ref = num; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
          nums.push(num);
        }
        return this.multiply.apply(this, nums);
      }
    },
    mixin3: {
      increaseByOne: function(n) {
        return this.sum(n, 1);
      }
    },
    mixin4: {
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
    },
    mixin5: {
      enable: true,
      preferences: {
        fullScreen: true
      }
    },
    mixin6: {
      increaseByOne: function(n) {
        return this.sum(n, 1);
      },
      enable: false,
      itemList: ['item5']
    }
  };

  module.exports = mocks;

}).call(this);

//# sourceMappingURL=mocks.js.map
