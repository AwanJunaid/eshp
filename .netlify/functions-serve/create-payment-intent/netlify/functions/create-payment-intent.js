var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/dotenv/package.json
var require_package = __commonJS({
  "node_modules/dotenv/package.json"(exports2, module2) {
    module2.exports = {
      name: "dotenv",
      version: "16.3.1",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        "lint-readme": "standard-markdown",
        pretest: "npm run lint && npm run dts-check",
        test: "tap tests/*.js --100 -Rspec",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      funding: "https://github.com/motdotla/dotenv?sponsor=1",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@definitelytyped/dtslint": "^0.0.133",
        "@types/node": "^18.11.3",
        decache: "^4.6.1",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-markdown": "^7.1.0",
        "standard-version": "^9.5.0",
        tap: "^16.3.0",
        tar: "^6.1.11",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports2, module2) {
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    var crypto = require("crypto");
    var packageJson = require_package();
    var version = packageJson.version;
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj2 = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj2[key] = value;
      }
      return obj2;
    }
    function _parseVault(options) {
      const vaultPath = _vaultPath(options);
      const result = DotenvModule.configDotenv({ path: vaultPath });
      if (!result.parsed) {
        throw new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _log(message) {
      console.log(`[dotenv@${version}][INFO] ${message}`);
    }
    function _warn(message) {
      console.log(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          throw new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenv.org/vault/.env.vault?environment=development");
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        throw new Error("INVALID_DOTENV_KEY: Missing key part");
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        throw new Error("INVALID_DOTENV_KEY: Missing environment part");
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        throw new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let dotenvPath = path.resolve(process.cwd(), ".env");
      if (options && options.path && options.path.length > 0) {
        dotenvPath = options.path;
      }
      return dotenvPath.endsWith(".vault") ? dotenvPath : `${dotenvPath}.vault`;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      _log("Loading env from encrypted .env.vault");
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      let dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options && options.debug);
      if (options) {
        if (options.path != null) {
          dotenvPath = _resolveHome(options.path);
        }
        if (options.encoding != null) {
          encoding = options.encoding;
        }
      }
      try {
        const parsed = DotenvModule.parse(fs.readFileSync(dotenvPath, { encoding }));
        let processEnv = process.env;
        if (options && options.processEnv != null) {
          processEnv = options.processEnv;
        }
        DotenvModule.populate(processEnv, parsed, options);
        return { parsed };
      } catch (e) {
        if (debug) {
          _debug(`Failed to load ${dotenvPath} ${e.message}`);
        }
        return { error: e };
      }
    }
    function config(options) {
      const vaultPath = _vaultPath(options);
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      if (!fs.existsSync(vaultPath)) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.slice(0, 12);
      const authTag = ciphertext.slice(-16);
      ciphertext = ciphertext.slice(12, -16);
      try {
        const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const msg = "INVALID_DOTENV_KEY: It must be 64 characters long (or more)";
          throw new Error(msg);
        } else if (decryptionFailed) {
          const msg = "DECRYPTION_FAILED: Please check your DOTENV_KEY";
          throw new Error(msg);
        } else {
          console.error("Error: ", error.code);
          console.error("Error: ", error.message);
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (typeof parsed !== "object") {
        throw new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse,
      populate
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  }
});

// node_modules/stripe/package.json
var require_package2 = __commonJS({
  "node_modules/stripe/package.json"(exports2, module2) {
    module2.exports = {
      name: "stripe",
      version: "4.25.0",
      description: "Stripe API wrapper",
      keywords: [
        "stripe",
        "payment processing",
        "credit cards",
        "api"
      ],
      homepage: "https://github.com/stripe/stripe-node",
      author: "Stripe <support@stripe.com> (https://stripe.com/)",
      contributors: [
        "Ask Bj\xF8rn Hansen <ask@develooper.com> (http://www.askask.com/)",
        "Michelle Bu <michelle@stripe.com>",
        "Alex Sexton <alex@stripe.com>",
        "James Padolsey"
      ],
      repository: {
        type: "git",
        url: "git://github.com/stripe/stripe-node.git"
      },
      "bugs:": "https://github.com/stripe/stripe-node/issues",
      engines: {
        node: ">= v0.10.0"
      },
      main: "lib/stripe.js",
      devDependencies: {
        chai: "~1.10.0",
        "chai-as-promised": "~4.1.1",
        jscs: "^2.3.5",
        mocha: "~2.1.0",
        "stripe-javascript-style": "^1.0.1"
      },
      dependencies: {
        bluebird: "^2.10.2",
        "lodash.isplainobject": "^4.0.6",
        "object-assign": "^4.1.0",
        qs: "~6.0.4"
      },
      license: "MIT",
      scripts: {
        mocha: "mocha",
        test: "npm run lint && mocha",
        lint: "jscs ."
      }
    };
  }
});

// node_modules/object-assign/index.js
var require_object_assign = __commonJS({
  "node_modules/object-assign/index.js"(exports2, module2) {
    "use strict";
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === void 0) {
        throw new TypeError("Object.assign cannot be called with null or undefined");
      }
      return Object(val);
    }
    function shouldUseNative() {
      try {
        if (!Object.assign) {
          return false;
        }
        var test1 = new String("abc");
        test1[5] = "de";
        if (Object.getOwnPropertyNames(test1)[0] === "5") {
          return false;
        }
        var test2 = {};
        for (var i = 0; i < 10; i++) {
          test2["_" + String.fromCharCode(i)] = i;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
          return test2[n];
        });
        if (order2.join("") !== "0123456789") {
          return false;
        }
        var test3 = {};
        "abcdefghijklmnopqrst".split("").forEach(function(letter) {
          test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    module2.exports = shouldUseNative() ? Object.assign : function(target, source) {
      var from;
      var to = toObject(target);
      var symbols;
      for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);
        for (var key in from) {
          if (hasOwnProperty.call(from, key)) {
            to[key] = from[key];
          }
        }
        if (getOwnPropertySymbols) {
          symbols = getOwnPropertySymbols(from);
          for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
              to[symbols[i]] = from[symbols[i]];
            }
          }
        }
      }
      return to;
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/es5.js
var require_es5 = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/es5.js"(exports2, module2) {
    var isES5 = function() {
      "use strict";
      return this === void 0;
    }();
    if (isES5) {
      module2.exports = {
        freeze: Object.freeze,
        defineProperty: Object.defineProperty,
        getDescriptor: Object.getOwnPropertyDescriptor,
        keys: Object.keys,
        names: Object.getOwnPropertyNames,
        getPrototypeOf: Object.getPrototypeOf,
        isArray: Array.isArray,
        isES5,
        propertyIsWritable: function(obj2, prop) {
          var descriptor = Object.getOwnPropertyDescriptor(obj2, prop);
          return !!(!descriptor || descriptor.writable || descriptor.set);
        }
      };
    } else {
      has = {}.hasOwnProperty;
      str = {}.toString;
      proto = {}.constructor.prototype;
      ObjectKeys = function(o) {
        var ret2 = [];
        for (var key in o) {
          if (has.call(o, key)) {
            ret2.push(key);
          }
        }
        return ret2;
      };
      ObjectGetDescriptor = function(o, key) {
        return { value: o[key] };
      };
      ObjectDefineProperty = function(o, key, desc) {
        o[key] = desc.value;
        return o;
      };
      ObjectFreeze = function(obj2) {
        return obj2;
      };
      ObjectGetPrototypeOf = function(obj2) {
        try {
          return Object(obj2).constructor.prototype;
        } catch (e) {
          return proto;
        }
      };
      ArrayIsArray = function(obj2) {
        try {
          return str.call(obj2) === "[object Array]";
        } catch (e) {
          return false;
        }
      };
      module2.exports = {
        isArray: ArrayIsArray,
        keys: ObjectKeys,
        names: ObjectKeys,
        defineProperty: ObjectDefineProperty,
        getDescriptor: ObjectGetDescriptor,
        freeze: ObjectFreeze,
        getPrototypeOf: ObjectGetPrototypeOf,
        isES5,
        propertyIsWritable: function() {
          return true;
        }
      };
    }
    var has;
    var str;
    var proto;
    var ObjectKeys;
    var ObjectGetDescriptor;
    var ObjectDefineProperty;
    var ObjectFreeze;
    var ObjectGetPrototypeOf;
    var ArrayIsArray;
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/util.js
var require_util = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/util.js"(exports, module) {
    "use strict";
    var es5 = require_es5();
    var canEvaluate = typeof navigator == "undefined";
    var haveGetters = function() {
      try {
        var o = {};
        es5.defineProperty(o, "f", {
          get: function() {
            return 3;
          }
        });
        return o.f === 3;
      } catch (e) {
        return false;
      }
    }();
    var errorObj = { e: {} };
    var tryCatchTarget;
    function tryCatcher() {
      try {
        var target = tryCatchTarget;
        tryCatchTarget = null;
        return target.apply(this, arguments);
      } catch (e) {
        errorObj.e = e;
        return errorObj;
      }
    }
    function tryCatch(fn) {
      tryCatchTarget = fn;
      return tryCatcher;
    }
    var inherits = function(Child, Parent) {
      var hasProp = {}.hasOwnProperty;
      function T() {
        this.constructor = Child;
        this.constructor$ = Parent;
        for (var propertyName in Parent.prototype) {
          if (hasProp.call(Parent.prototype, propertyName) && propertyName.charAt(propertyName.length - 1) !== "$") {
            this[propertyName + "$"] = Parent.prototype[propertyName];
          }
        }
      }
      T.prototype = Parent.prototype;
      Child.prototype = new T();
      return Child.prototype;
    };
    function isPrimitive(val) {
      return val == null || val === true || val === false || typeof val === "string" || typeof val === "number";
    }
    function isObject(value) {
      return !isPrimitive(value);
    }
    function maybeWrapAsError(maybeError) {
      if (!isPrimitive(maybeError))
        return maybeError;
      return new Error(safeToString(maybeError));
    }
    function withAppended(target, appendee) {
      var len = target.length;
      var ret2 = new Array(len + 1);
      var i;
      for (i = 0; i < len; ++i) {
        ret2[i] = target[i];
      }
      ret2[i] = appendee;
      return ret2;
    }
    function getDataPropertyOrDefault(obj2, key, defaultValue) {
      if (es5.isES5) {
        var desc = Object.getOwnPropertyDescriptor(obj2, key);
        if (desc != null) {
          return desc.get == null && desc.set == null ? desc.value : defaultValue;
        }
      } else {
        return {}.hasOwnProperty.call(obj2, key) ? obj2[key] : void 0;
      }
    }
    function notEnumerableProp(obj2, name, value) {
      if (isPrimitive(obj2))
        return obj2;
      var descriptor = {
        value,
        configurable: true,
        enumerable: false,
        writable: true
      };
      es5.defineProperty(obj2, name, descriptor);
      return obj2;
    }
    function thrower(r) {
      throw r;
    }
    var inheritedDataKeys = function() {
      var excludedPrototypes = [
        Array.prototype,
        Object.prototype,
        Function.prototype
      ];
      var isExcludedProto = function(val) {
        for (var i = 0; i < excludedPrototypes.length; ++i) {
          if (excludedPrototypes[i] === val) {
            return true;
          }
        }
        return false;
      };
      if (es5.isES5) {
        var getKeys = Object.getOwnPropertyNames;
        return function(obj2) {
          var ret2 = [];
          var visitedKeys = /* @__PURE__ */ Object.create(null);
          while (obj2 != null && !isExcludedProto(obj2)) {
            var keys;
            try {
              keys = getKeys(obj2);
            } catch (e) {
              return ret2;
            }
            for (var i = 0; i < keys.length; ++i) {
              var key = keys[i];
              if (visitedKeys[key])
                continue;
              visitedKeys[key] = true;
              var desc = Object.getOwnPropertyDescriptor(obj2, key);
              if (desc != null && desc.get == null && desc.set == null) {
                ret2.push(key);
              }
            }
            obj2 = es5.getPrototypeOf(obj2);
          }
          return ret2;
        };
      } else {
        var hasProp = {}.hasOwnProperty;
        return function(obj2) {
          if (isExcludedProto(obj2))
            return [];
          var ret2 = [];
          enumeration:
            for (var key in obj2) {
              if (hasProp.call(obj2, key)) {
                ret2.push(key);
              } else {
                for (var i = 0; i < excludedPrototypes.length; ++i) {
                  if (hasProp.call(excludedPrototypes[i], key)) {
                    continue enumeration;
                  }
                }
                ret2.push(key);
              }
            }
          return ret2;
        };
      }
    }();
    var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
    function isClass(fn) {
      try {
        if (typeof fn === "function") {
          var keys = es5.names(fn.prototype);
          var hasMethods = es5.isES5 && keys.length > 1;
          var hasMethodsOtherThanConstructor = keys.length > 0 && !(keys.length === 1 && keys[0] === "constructor");
          var hasThisAssignmentAndStaticMethods = thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;
          if (hasMethods || hasMethodsOtherThanConstructor || hasThisAssignmentAndStaticMethods) {
            return true;
          }
        }
        return false;
      } catch (e) {
        return false;
      }
    }
    function toFastProperties(obj) {
      function f() {
      }
      f.prototype = obj;
      var l = 8;
      while (l--)
        new f();
      return obj;
      eval(obj);
    }
    var rident = /^[a-z$_][a-z$_0-9]*$/i;
    function isIdentifier(str) {
      return rident.test(str);
    }
    function filledRange(count, prefix, suffix) {
      var ret2 = new Array(count);
      for (var i = 0; i < count; ++i) {
        ret2[i] = prefix + i + suffix;
      }
      return ret2;
    }
    function safeToString(obj2) {
      try {
        return obj2 + "";
      } catch (e) {
        return "[no string representation]";
      }
    }
    function markAsOriginatingFromRejection(e) {
      try {
        notEnumerableProp(e, "isOperational", true);
      } catch (ignore) {
      }
    }
    function originatesFromRejection(e) {
      if (e == null)
        return false;
      return e instanceof Error["__BluebirdErrorTypes__"].OperationalError || e["isOperational"] === true;
    }
    function canAttachTrace(obj2) {
      return obj2 instanceof Error && es5.propertyIsWritable(obj2, "stack");
    }
    var ensureErrorObject = function() {
      if (!("stack" in new Error())) {
        return function(value) {
          if (canAttachTrace(value))
            return value;
          try {
            throw new Error(safeToString(value));
          } catch (err) {
            return err;
          }
        };
      } else {
        return function(value) {
          if (canAttachTrace(value))
            return value;
          return new Error(safeToString(value));
        };
      }
    }();
    function classString(obj2) {
      return {}.toString.call(obj2);
    }
    function copyDescriptors(from, to, filter) {
      var keys = es5.names(from);
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if (filter(key)) {
          try {
            es5.defineProperty(to, key, es5.getDescriptor(from, key));
          } catch (ignore) {
          }
        }
      }
    }
    var ret = {
      isClass,
      isIdentifier,
      inheritedDataKeys,
      getDataPropertyOrDefault,
      thrower,
      isArray: es5.isArray,
      haveGetters,
      notEnumerableProp,
      isPrimitive,
      isObject,
      canEvaluate,
      errorObj,
      tryCatch,
      inherits,
      withAppended,
      maybeWrapAsError,
      toFastProperties,
      filledRange,
      toString: safeToString,
      canAttachTrace,
      ensureErrorObject,
      originatesFromRejection,
      markAsOriginatingFromRejection,
      classString,
      copyDescriptors,
      hasDevTools: typeof chrome !== "undefined" && chrome && typeof chrome.loadTimes === "function",
      isNode: typeof process !== "undefined" && classString(process).toLowerCase() === "[object process]"
    };
    ret.isRecentNode = ret.isNode && function() {
      var version = process.versions.node.split(".").map(Number);
      return version[0] === 0 && version[1] > 10 || version[0] > 0;
    }();
    if (ret.isNode)
      ret.toFastProperties(process);
    try {
      throw new Error();
    } catch (e) {
      ret.lastLineError = e;
    }
    module.exports = ret;
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/schedule.js
var require_schedule = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/schedule.js"(exports2, module2) {
    "use strict";
    var schedule;
    var util = require_util();
    var noAsyncScheduler = function() {
      throw new Error("No async scheduler available\n\n    See http://goo.gl/m3OTXk\n");
    };
    if (util.isNode && typeof MutationObserver === "undefined") {
      GlobalSetImmediate = global.setImmediate;
      ProcessNextTick = process.nextTick;
      schedule = util.isRecentNode ? function(fn) {
        GlobalSetImmediate.call(global, fn);
      } : function(fn) {
        ProcessNextTick.call(process, fn);
      };
    } else if (typeof MutationObserver !== "undefined" && !(typeof window !== "undefined" && window.navigator && window.navigator.standalone)) {
      schedule = function(fn) {
        var div = document.createElement("div");
        var observer = new MutationObserver(fn);
        observer.observe(div, { attributes: true });
        return function() {
          div.classList.toggle("foo");
        };
      };
      schedule.isStatic = true;
    } else if (typeof setImmediate !== "undefined") {
      schedule = function(fn) {
        setImmediate(fn);
      };
    } else if (typeof setTimeout !== "undefined") {
      schedule = function(fn) {
        setTimeout(fn, 0);
      };
    } else {
      schedule = noAsyncScheduler;
    }
    var GlobalSetImmediate;
    var ProcessNextTick;
    module2.exports = schedule;
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/queue.js
var require_queue = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/queue.js"(exports2, module2) {
    "use strict";
    function arrayMove(src, srcIndex, dst, dstIndex, len) {
      for (var j = 0; j < len; ++j) {
        dst[j + dstIndex] = src[j + srcIndex];
        src[j + srcIndex] = void 0;
      }
    }
    function Queue(capacity) {
      this._capacity = capacity;
      this._length = 0;
      this._front = 0;
    }
    Queue.prototype._willBeOverCapacity = function(size) {
      return this._capacity < size;
    };
    Queue.prototype._pushOne = function(arg) {
      var length = this.length();
      this._checkCapacity(length + 1);
      var i = this._front + length & this._capacity - 1;
      this[i] = arg;
      this._length = length + 1;
    };
    Queue.prototype._unshiftOne = function(value) {
      var capacity = this._capacity;
      this._checkCapacity(this.length() + 1);
      var front = this._front;
      var i = (front - 1 & capacity - 1 ^ capacity) - capacity;
      this[i] = value;
      this._front = i;
      this._length = this.length() + 1;
    };
    Queue.prototype.unshift = function(fn, receiver, arg) {
      this._unshiftOne(arg);
      this._unshiftOne(receiver);
      this._unshiftOne(fn);
    };
    Queue.prototype.push = function(fn, receiver, arg) {
      var length = this.length() + 3;
      if (this._willBeOverCapacity(length)) {
        this._pushOne(fn);
        this._pushOne(receiver);
        this._pushOne(arg);
        return;
      }
      var j = this._front + length - 3;
      this._checkCapacity(length);
      var wrapMask = this._capacity - 1;
      this[j + 0 & wrapMask] = fn;
      this[j + 1 & wrapMask] = receiver;
      this[j + 2 & wrapMask] = arg;
      this._length = length;
    };
    Queue.prototype.shift = function() {
      var front = this._front, ret2 = this[front];
      this[front] = void 0;
      this._front = front + 1 & this._capacity - 1;
      this._length--;
      return ret2;
    };
    Queue.prototype.length = function() {
      return this._length;
    };
    Queue.prototype._checkCapacity = function(size) {
      if (this._capacity < size) {
        this._resizeTo(this._capacity << 1);
      }
    };
    Queue.prototype._resizeTo = function(capacity) {
      var oldCapacity = this._capacity;
      this._capacity = capacity;
      var front = this._front;
      var length = this._length;
      var moveItemsCount = front + length & oldCapacity - 1;
      arrayMove(this, 0, this, oldCapacity, moveItemsCount);
    };
    module2.exports = Queue;
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/async.js
var require_async = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/async.js"(exports2, module2) {
    "use strict";
    var firstLineError;
    try {
      throw new Error();
    } catch (e) {
      firstLineError = e;
    }
    var schedule = require_schedule();
    var Queue = require_queue();
    var util = require_util();
    function Async() {
      this._isTickUsed = false;
      this._lateQueue = new Queue(16);
      this._normalQueue = new Queue(16);
      this._trampolineEnabled = true;
      var self2 = this;
      this.drainQueues = function() {
        self2._drainQueues();
      };
      this._schedule = schedule.isStatic ? schedule(this.drainQueues) : schedule;
    }
    Async.prototype.disableTrampolineIfNecessary = function() {
      if (util.hasDevTools) {
        this._trampolineEnabled = false;
      }
    };
    Async.prototype.enableTrampoline = function() {
      if (!this._trampolineEnabled) {
        this._trampolineEnabled = true;
        this._schedule = function(fn) {
          setTimeout(fn, 0);
        };
      }
    };
    Async.prototype.haveItemsQueued = function() {
      return this._normalQueue.length() > 0;
    };
    Async.prototype.throwLater = function(fn, arg) {
      if (arguments.length === 1) {
        arg = fn;
        fn = function() {
          throw arg;
        };
      }
      if (typeof setTimeout !== "undefined") {
        setTimeout(function() {
          fn(arg);
        }, 0);
      } else
        try {
          this._schedule(function() {
            fn(arg);
          });
        } catch (e) {
          throw new Error("No async scheduler available\n\n    See http://goo.gl/m3OTXk\n");
        }
    };
    function AsyncInvokeLater(fn, receiver, arg) {
      this._lateQueue.push(fn, receiver, arg);
      this._queueTick();
    }
    function AsyncInvoke(fn, receiver, arg) {
      this._normalQueue.push(fn, receiver, arg);
      this._queueTick();
    }
    function AsyncSettlePromises(promise) {
      this._normalQueue._pushOne(promise);
      this._queueTick();
    }
    if (!util.hasDevTools) {
      Async.prototype.invokeLater = AsyncInvokeLater;
      Async.prototype.invoke = AsyncInvoke;
      Async.prototype.settlePromises = AsyncSettlePromises;
    } else {
      if (schedule.isStatic) {
        schedule = function(fn) {
          setTimeout(fn, 0);
        };
      }
      Async.prototype.invokeLater = function(fn, receiver, arg) {
        if (this._trampolineEnabled) {
          AsyncInvokeLater.call(this, fn, receiver, arg);
        } else {
          this._schedule(function() {
            setTimeout(function() {
              fn.call(receiver, arg);
            }, 100);
          });
        }
      };
      Async.prototype.invoke = function(fn, receiver, arg) {
        if (this._trampolineEnabled) {
          AsyncInvoke.call(this, fn, receiver, arg);
        } else {
          this._schedule(function() {
            fn.call(receiver, arg);
          });
        }
      };
      Async.prototype.settlePromises = function(promise) {
        if (this._trampolineEnabled) {
          AsyncSettlePromises.call(this, promise);
        } else {
          this._schedule(function() {
            promise._settlePromises();
          });
        }
      };
    }
    Async.prototype.invokeFirst = function(fn, receiver, arg) {
      this._normalQueue.unshift(fn, receiver, arg);
      this._queueTick();
    };
    Async.prototype._drainQueue = function(queue) {
      while (queue.length() > 0) {
        var fn = queue.shift();
        if (typeof fn !== "function") {
          fn._settlePromises();
          continue;
        }
        var receiver = queue.shift();
        var arg = queue.shift();
        fn.call(receiver, arg);
      }
    };
    Async.prototype._drainQueues = function() {
      this._drainQueue(this._normalQueue);
      this._reset();
      this._drainQueue(this._lateQueue);
    };
    Async.prototype._queueTick = function() {
      if (!this._isTickUsed) {
        this._isTickUsed = true;
        this._schedule(this.drainQueues);
      }
    };
    Async.prototype._reset = function() {
      this._isTickUsed = false;
    };
    module2.exports = new Async();
    module2.exports.firstLineError = firstLineError;
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/errors.js
var require_errors = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/errors.js"(exports2, module2) {
    "use strict";
    var es52 = require_es5();
    var Objectfreeze = es52.freeze;
    var util = require_util();
    var inherits2 = util.inherits;
    var notEnumerableProp2 = util.notEnumerableProp;
    function subError(nameProperty, defaultMessage) {
      function SubError(message) {
        if (!(this instanceof SubError))
          return new SubError(message);
        notEnumerableProp2(
          this,
          "message",
          typeof message === "string" ? message : defaultMessage
        );
        notEnumerableProp2(this, "name", nameProperty);
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        } else {
          Error.call(this);
        }
      }
      inherits2(SubError, Error);
      return SubError;
    }
    var _TypeError;
    var _RangeError;
    var Warning = subError("Warning", "warning");
    var CancellationError = subError("CancellationError", "cancellation error");
    var TimeoutError = subError("TimeoutError", "timeout error");
    var AggregateError = subError("AggregateError", "aggregate error");
    try {
      _TypeError = TypeError;
      _RangeError = RangeError;
    } catch (e) {
      _TypeError = subError("TypeError", "type error");
      _RangeError = subError("RangeError", "range error");
    }
    var methods = "join pop push shift unshift slice filter forEach some every map indexOf lastIndexOf reduce reduceRight sort reverse".split(" ");
    for (i = 0; i < methods.length; ++i) {
      if (typeof Array.prototype[methods[i]] === "function") {
        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
      }
    }
    var i;
    es52.defineProperty(AggregateError.prototype, "length", {
      value: 0,
      configurable: false,
      writable: true,
      enumerable: true
    });
    AggregateError.prototype["isOperational"] = true;
    var level = 0;
    AggregateError.prototype.toString = function() {
      var indent = Array(level * 4 + 1).join(" ");
      var ret2 = "\n" + indent + "AggregateError of:\n";
      level++;
      indent = Array(level * 4 + 1).join(" ");
      for (var i2 = 0; i2 < this.length; ++i2) {
        var str = this[i2] === this ? "[Circular AggregateError]" : this[i2] + "";
        var lines = str.split("\n");
        for (var j = 0; j < lines.length; ++j) {
          lines[j] = indent + lines[j];
        }
        str = lines.join("\n");
        ret2 += str + "\n";
      }
      level--;
      return ret2;
    };
    function OperationalError(message) {
      if (!(this instanceof OperationalError))
        return new OperationalError(message);
      notEnumerableProp2(this, "name", "OperationalError");
      notEnumerableProp2(this, "message", message);
      this.cause = message;
      this["isOperational"] = true;
      if (message instanceof Error) {
        notEnumerableProp2(this, "message", message.message);
        notEnumerableProp2(this, "stack", message.stack);
      } else if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
    inherits2(OperationalError, Error);
    var errorTypes = Error["__BluebirdErrorTypes__"];
    if (!errorTypes) {
      errorTypes = Objectfreeze({
        CancellationError,
        TimeoutError,
        OperationalError,
        RejectionError: OperationalError,
        AggregateError
      });
      notEnumerableProp2(Error, "__BluebirdErrorTypes__", errorTypes);
    }
    module2.exports = {
      Error,
      TypeError: _TypeError,
      RangeError: _RangeError,
      CancellationError: errorTypes.CancellationError,
      OperationalError: errorTypes.OperationalError,
      TimeoutError: errorTypes.TimeoutError,
      AggregateError: errorTypes.AggregateError,
      Warning
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/thenables.js
var require_thenables = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/thenables.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, INTERNAL) {
      var util = require_util();
      var errorObj2 = util.errorObj;
      var isObject2 = util.isObject;
      function tryConvertToPromise(obj2, context) {
        if (isObject2(obj2)) {
          if (obj2 instanceof Promise2) {
            return obj2;
          } else if (isAnyBluebirdPromise(obj2)) {
            var ret2 = new Promise2(INTERNAL);
            obj2._then(
              ret2._fulfillUnchecked,
              ret2._rejectUncheckedCheckError,
              ret2._progressUnchecked,
              ret2,
              null
            );
            return ret2;
          }
          var then = util.tryCatch(getThen)(obj2);
          if (then === errorObj2) {
            if (context)
              context._pushContext();
            var ret2 = Promise2.reject(then.e);
            if (context)
              context._popContext();
            return ret2;
          } else if (typeof then === "function") {
            return doThenable(obj2, then, context);
          }
        }
        return obj2;
      }
      function getThen(obj2) {
        return obj2.then;
      }
      var hasProp = {}.hasOwnProperty;
      function isAnyBluebirdPromise(obj2) {
        return hasProp.call(obj2, "_promise0");
      }
      function doThenable(x, then, context) {
        var promise = new Promise2(INTERNAL);
        var ret2 = promise;
        if (context)
          context._pushContext();
        promise._captureStackTrace();
        if (context)
          context._popContext();
        var synchronous = true;
        var result = util.tryCatch(then).call(
          x,
          resolveFromThenable,
          rejectFromThenable,
          progressFromThenable
        );
        synchronous = false;
        if (promise && result === errorObj2) {
          promise._rejectCallback(result.e, true, true);
          promise = null;
        }
        function resolveFromThenable(value) {
          if (!promise)
            return;
          promise._resolveCallback(value);
          promise = null;
        }
        function rejectFromThenable(reason) {
          if (!promise)
            return;
          promise._rejectCallback(reason, synchronous, true);
          promise = null;
        }
        function progressFromThenable(value) {
          if (!promise)
            return;
          if (typeof promise._progress === "function") {
            promise._progress(value);
          }
        }
        return ret2;
      }
      return tryConvertToPromise;
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/promise_array.js
var require_promise_array = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/promise_array.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, INTERNAL, tryConvertToPromise, apiRejection) {
      var util = require_util();
      var isArray = util.isArray;
      function toResolutionValue(val) {
        switch (val) {
          case -2:
            return [];
          case -3:
            return {};
        }
      }
      function PromiseArray(values) {
        var promise = this._promise = new Promise2(INTERNAL);
        var parent;
        if (values instanceof Promise2) {
          parent = values;
          promise._propagateFrom(parent, 1 | 4);
        }
        this._values = values;
        this._length = 0;
        this._totalResolved = 0;
        this._init(void 0, -2);
      }
      PromiseArray.prototype.length = function() {
        return this._length;
      };
      PromiseArray.prototype.promise = function() {
        return this._promise;
      };
      PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
        var values = tryConvertToPromise(this._values, this._promise);
        if (values instanceof Promise2) {
          values = values._target();
          this._values = values;
          if (values._isFulfilled()) {
            values = values._value();
            if (!isArray(values)) {
              var err = new Promise2.TypeError("expecting an array, a promise or a thenable\n\n    See http://goo.gl/s8MMhc\n");
              this.__hardReject__(err);
              return;
            }
          } else if (values._isPending()) {
            values._then(
              init,
              this._reject,
              void 0,
              this,
              resolveValueIfEmpty
            );
            return;
          } else {
            this._reject(values._reason());
            return;
          }
        } else if (!isArray(values)) {
          this._promise._reject(apiRejection("expecting an array, a promise or a thenable\n\n    See http://goo.gl/s8MMhc\n")._reason());
          return;
        }
        if (values.length === 0) {
          if (resolveValueIfEmpty === -5) {
            this._resolveEmptyArray();
          } else {
            this._resolve(toResolutionValue(resolveValueIfEmpty));
          }
          return;
        }
        var len = this.getActualLength(values.length);
        this._length = len;
        this._values = this.shouldCopyValues() ? new Array(len) : this._values;
        var promise = this._promise;
        for (var i = 0; i < len; ++i) {
          var isResolved = this._isResolved();
          var maybePromise = tryConvertToPromise(values[i], promise);
          if (maybePromise instanceof Promise2) {
            maybePromise = maybePromise._target();
            if (isResolved) {
              maybePromise._ignoreRejections();
            } else if (maybePromise._isPending()) {
              maybePromise._proxyPromiseArray(this, i);
            } else if (maybePromise._isFulfilled()) {
              this._promiseFulfilled(maybePromise._value(), i);
            } else {
              this._promiseRejected(maybePromise._reason(), i);
            }
          } else if (!isResolved) {
            this._promiseFulfilled(maybePromise, i);
          }
        }
      };
      PromiseArray.prototype._isResolved = function() {
        return this._values === null;
      };
      PromiseArray.prototype._resolve = function(value) {
        this._values = null;
        this._promise._fulfill(value);
      };
      PromiseArray.prototype.__hardReject__ = PromiseArray.prototype._reject = function(reason) {
        this._values = null;
        this._promise._rejectCallback(reason, false, true);
      };
      PromiseArray.prototype._promiseProgressed = function(progressValue, index) {
        this._promise._progress({
          index,
          value: progressValue
        });
      };
      PromiseArray.prototype._promiseFulfilled = function(value, index) {
        this._values[index] = value;
        var totalResolved = ++this._totalResolved;
        if (totalResolved >= this._length) {
          this._resolve(this._values);
        }
      };
      PromiseArray.prototype._promiseRejected = function(reason, index) {
        this._totalResolved++;
        this._reject(reason);
      };
      PromiseArray.prototype.shouldCopyValues = function() {
        return true;
      };
      PromiseArray.prototype.getActualLength = function(len) {
        return len;
      };
      return PromiseArray;
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/captured_trace.js
var require_captured_trace = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/captured_trace.js"(exports2, module2) {
    "use strict";
    module2.exports = function() {
      var async = require_async();
      var util = require_util();
      var bluebirdFramePattern = /[\\\/]bluebird[\\\/]js[\\\/](main|debug|zalgo|instrumented)/;
      var stackFramePattern = null;
      var formatStack = null;
      var indentStackFrames = false;
      var warn;
      function CapturedTrace(parent) {
        this._parent = parent;
        var length = this._length = 1 + (parent === void 0 ? 0 : parent._length);
        captureStackTrace(this, CapturedTrace);
        if (length > 32)
          this.uncycle();
      }
      util.inherits(CapturedTrace, Error);
      CapturedTrace.prototype.uncycle = function() {
        var length = this._length;
        if (length < 2)
          return;
        var nodes = [];
        var stackToIndex = {};
        for (var i = 0, node = this; node !== void 0; ++i) {
          nodes.push(node);
          node = node._parent;
        }
        length = this._length = i;
        for (var i = length - 1; i >= 0; --i) {
          var stack = nodes[i].stack;
          if (stackToIndex[stack] === void 0) {
            stackToIndex[stack] = i;
          }
        }
        for (var i = 0; i < length; ++i) {
          var currentStack = nodes[i].stack;
          var index = stackToIndex[currentStack];
          if (index !== void 0 && index !== i) {
            if (index > 0) {
              nodes[index - 1]._parent = void 0;
              nodes[index - 1]._length = 1;
            }
            nodes[i]._parent = void 0;
            nodes[i]._length = 1;
            var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;
            if (index < length - 1) {
              cycleEdgeNode._parent = nodes[index + 1];
              cycleEdgeNode._parent.uncycle();
              cycleEdgeNode._length = cycleEdgeNode._parent._length + 1;
            } else {
              cycleEdgeNode._parent = void 0;
              cycleEdgeNode._length = 1;
            }
            var currentChildLength = cycleEdgeNode._length + 1;
            for (var j = i - 2; j >= 0; --j) {
              nodes[j]._length = currentChildLength;
              currentChildLength++;
            }
            return;
          }
        }
      };
      CapturedTrace.prototype.parent = function() {
        return this._parent;
      };
      CapturedTrace.prototype.hasParent = function() {
        return this._parent !== void 0;
      };
      CapturedTrace.prototype.attachExtraTrace = function(error) {
        if (error.__stackCleaned__)
          return;
        this.uncycle();
        var parsed = CapturedTrace.parseStackAndMessage(error);
        var message = parsed.message;
        var stacks = [parsed.stack];
        var trace = this;
        while (trace !== void 0) {
          stacks.push(cleanStack(trace.stack.split("\n")));
          trace = trace._parent;
        }
        removeCommonRoots(stacks);
        removeDuplicateOrEmptyJumps(stacks);
        util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
        util.notEnumerableProp(error, "__stackCleaned__", true);
      };
      function reconstructStack(message, stacks) {
        for (var i = 0; i < stacks.length - 1; ++i) {
          stacks[i].push("From previous event:");
          stacks[i] = stacks[i].join("\n");
        }
        if (i < stacks.length) {
          stacks[i] = stacks[i].join("\n");
        }
        return message + "\n" + stacks.join("\n");
      }
      function removeDuplicateOrEmptyJumps(stacks) {
        for (var i = 0; i < stacks.length; ++i) {
          if (stacks[i].length === 0 || i + 1 < stacks.length && stacks[i][0] === stacks[i + 1][0]) {
            stacks.splice(i, 1);
            i--;
          }
        }
      }
      function removeCommonRoots(stacks) {
        var current = stacks[0];
        for (var i = 1; i < stacks.length; ++i) {
          var prev = stacks[i];
          var currentLastIndex = current.length - 1;
          var currentLastLine = current[currentLastIndex];
          var commonRootMeetPoint = -1;
          for (var j = prev.length - 1; j >= 0; --j) {
            if (prev[j] === currentLastLine) {
              commonRootMeetPoint = j;
              break;
            }
          }
          for (var j = commonRootMeetPoint; j >= 0; --j) {
            var line = prev[j];
            if (current[currentLastIndex] === line) {
              current.pop();
              currentLastIndex--;
            } else {
              break;
            }
          }
          current = prev;
        }
      }
      function cleanStack(stack) {
        var ret2 = [];
        for (var i = 0; i < stack.length; ++i) {
          var line = stack[i];
          var isTraceLine = stackFramePattern.test(line) || "    (No stack trace)" === line;
          var isInternalFrame = isTraceLine && shouldIgnore(line);
          if (isTraceLine && !isInternalFrame) {
            if (indentStackFrames && line.charAt(0) !== " ") {
              line = "    " + line;
            }
            ret2.push(line);
          }
        }
        return ret2;
      }
      function stackFramesAsArray(error) {
        var stack = error.stack.replace(/\s+$/g, "").split("\n");
        for (var i = 0; i < stack.length; ++i) {
          var line = stack[i];
          if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
            break;
          }
        }
        if (i > 0) {
          stack = stack.slice(i);
        }
        return stack;
      }
      CapturedTrace.parseStackAndMessage = function(error) {
        var stack = error.stack;
        var message = error.toString();
        stack = typeof stack === "string" && stack.length > 0 ? stackFramesAsArray(error) : ["    (No stack trace)"];
        return {
          message,
          stack: cleanStack(stack)
        };
      };
      CapturedTrace.formatAndLogError = function(error, title) {
        if (typeof console !== "undefined") {
          var message;
          if (typeof error === "object" || typeof error === "function") {
            var stack = error.stack;
            message = title + formatStack(stack, error);
          } else {
            message = title + String(error);
          }
          if (typeof warn === "function") {
            warn(message);
          } else if (typeof console.log === "function" || typeof console.log === "object") {
            console.log(message);
          }
        }
      };
      CapturedTrace.unhandledRejection = function(reason) {
        CapturedTrace.formatAndLogError(reason, "^--- With additional stack trace: ");
      };
      CapturedTrace.isSupported = function() {
        return typeof captureStackTrace === "function";
      };
      CapturedTrace.fireRejectionEvent = function(name, localHandler, reason, promise) {
        var localEventFired = false;
        try {
          if (typeof localHandler === "function") {
            localEventFired = true;
            if (name === "rejectionHandled") {
              localHandler(promise);
            } else {
              localHandler(reason, promise);
            }
          }
        } catch (e) {
          async.throwLater(e);
        }
        var globalEventFired = false;
        try {
          globalEventFired = fireGlobalEvent(name, reason, promise);
        } catch (e) {
          globalEventFired = true;
          async.throwLater(e);
        }
        var domEventFired = false;
        if (fireDomEvent) {
          try {
            domEventFired = fireDomEvent(name.toLowerCase(), {
              reason,
              promise
            });
          } catch (e) {
            domEventFired = true;
            async.throwLater(e);
          }
        }
        if (!globalEventFired && !localEventFired && !domEventFired && name === "unhandledRejection") {
          CapturedTrace.formatAndLogError(reason, "Unhandled rejection ");
        }
      };
      function formatNonError(obj2) {
        var str;
        if (typeof obj2 === "function") {
          str = "[function " + (obj2.name || "anonymous") + "]";
        } else {
          str = obj2.toString();
          var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
          if (ruselessToString.test(str)) {
            try {
              var newStr = JSON.stringify(obj2);
              str = newStr;
            } catch (e) {
            }
          }
          if (str.length === 0) {
            str = "(empty array)";
          }
        }
        return "(<" + snip(str) + ">, no stack trace)";
      }
      function snip(str) {
        var maxChars = 41;
        if (str.length < maxChars) {
          return str;
        }
        return str.substr(0, maxChars - 3) + "...";
      }
      var shouldIgnore = function() {
        return false;
      };
      var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
      function parseLineInfo(line) {
        var matches = line.match(parseLineInfoRegex);
        if (matches) {
          return {
            fileName: matches[1],
            line: parseInt(matches[2], 10)
          };
        }
      }
      CapturedTrace.setBounds = function(firstLineError, lastLineError) {
        if (!CapturedTrace.isSupported())
          return;
        var firstStackLines = firstLineError.stack.split("\n");
        var lastStackLines = lastLineError.stack.split("\n");
        var firstIndex = -1;
        var lastIndex = -1;
        var firstFileName;
        var lastFileName;
        for (var i = 0; i < firstStackLines.length; ++i) {
          var result = parseLineInfo(firstStackLines[i]);
          if (result) {
            firstFileName = result.fileName;
            firstIndex = result.line;
            break;
          }
        }
        for (var i = 0; i < lastStackLines.length; ++i) {
          var result = parseLineInfo(lastStackLines[i]);
          if (result) {
            lastFileName = result.fileName;
            lastIndex = result.line;
            break;
          }
        }
        if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName || firstFileName !== lastFileName || firstIndex >= lastIndex) {
          return;
        }
        shouldIgnore = function(line) {
          if (bluebirdFramePattern.test(line))
            return true;
          var info = parseLineInfo(line);
          if (info) {
            if (info.fileName === firstFileName && (firstIndex <= info.line && info.line <= lastIndex)) {
              return true;
            }
          }
          return false;
        };
      };
      var captureStackTrace = function stackDetection() {
        var v8stackFramePattern = /^\s*at\s*/;
        var v8stackFormatter = function(stack, error) {
          if (typeof stack === "string")
            return stack;
          if (error.name !== void 0 && error.message !== void 0) {
            return error.toString();
          }
          return formatNonError(error);
        };
        if (typeof Error.stackTraceLimit === "number" && typeof Error.captureStackTrace === "function") {
          Error.stackTraceLimit = Error.stackTraceLimit + 6;
          stackFramePattern = v8stackFramePattern;
          formatStack = v8stackFormatter;
          var captureStackTrace2 = Error.captureStackTrace;
          shouldIgnore = function(line) {
            return bluebirdFramePattern.test(line);
          };
          return function(receiver, ignoreUntil) {
            Error.stackTraceLimit = Error.stackTraceLimit + 6;
            captureStackTrace2(receiver, ignoreUntil);
            Error.stackTraceLimit = Error.stackTraceLimit - 6;
          };
        }
        var err = new Error();
        if (typeof err.stack === "string" && err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
          stackFramePattern = /@/;
          formatStack = v8stackFormatter;
          indentStackFrames = true;
          return function captureStackTrace3(o) {
            o.stack = new Error().stack;
          };
        }
        var hasStackAfterThrow;
        try {
          throw new Error();
        } catch (e) {
          hasStackAfterThrow = "stack" in e;
        }
        if (!("stack" in err) && hasStackAfterThrow && typeof Error.stackTraceLimit === "number") {
          stackFramePattern = v8stackFramePattern;
          formatStack = v8stackFormatter;
          return function captureStackTrace3(o) {
            Error.stackTraceLimit = Error.stackTraceLimit + 6;
            try {
              throw new Error();
            } catch (e) {
              o.stack = e.stack;
            }
            Error.stackTraceLimit = Error.stackTraceLimit - 6;
          };
        }
        formatStack = function(stack, error) {
          if (typeof stack === "string")
            return stack;
          if ((typeof error === "object" || typeof error === "function") && error.name !== void 0 && error.message !== void 0) {
            return error.toString();
          }
          return formatNonError(error);
        };
        return null;
      }([]);
      var fireDomEvent;
      var fireGlobalEvent = function() {
        if (util.isNode) {
          return function(name, reason, promise) {
            if (name === "rejectionHandled") {
              return process.emit(name, promise);
            } else {
              return process.emit(name, reason, promise);
            }
          };
        } else {
          var customEventWorks = false;
          var anyEventWorks = true;
          try {
            var ev = new self.CustomEvent("test");
            customEventWorks = ev instanceof CustomEvent;
          } catch (e) {
          }
          if (!customEventWorks) {
            try {
              var event = document.createEvent("CustomEvent");
              event.initCustomEvent("testingtheevent", false, true, {});
              self.dispatchEvent(event);
            } catch (e) {
              anyEventWorks = false;
            }
          }
          if (anyEventWorks) {
            fireDomEvent = function(type, detail) {
              var event2;
              if (customEventWorks) {
                event2 = new self.CustomEvent(type, {
                  detail,
                  bubbles: false,
                  cancelable: true
                });
              } else if (self.dispatchEvent) {
                event2 = document.createEvent("CustomEvent");
                event2.initCustomEvent(type, false, true, detail);
              }
              return event2 ? !self.dispatchEvent(event2) : false;
            };
          }
          var toWindowMethodNameMap = {};
          toWindowMethodNameMap["unhandledRejection"] = "onunhandledRejection".toLowerCase();
          toWindowMethodNameMap["rejectionHandled"] = "onrejectionHandled".toLowerCase();
          return function(name, reason, promise) {
            var methodName = toWindowMethodNameMap[name];
            var method = self[methodName];
            if (!method)
              return false;
            if (name === "rejectionHandled") {
              method.call(self, promise);
            } else {
              method.call(self, reason, promise);
            }
            return true;
          };
        }
      }();
      if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
        warn = function(message) {
          console.warn(message);
        };
        if (util.isNode && process.stderr.isTTY) {
          warn = function(message) {
            process.stderr.write("\x1B[31m" + message + "\x1B[39m\n");
          };
        } else if (!util.isNode && typeof new Error().stack === "string") {
          warn = function(message) {
            console.warn("%c" + message, "color: red");
          };
        }
      }
      return CapturedTrace;
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/debuggability.js
var require_debuggability = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/debuggability.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, CapturedTrace) {
      var getDomain = Promise2._getDomain;
      var async = require_async();
      var Warning = require_errors().Warning;
      var util = require_util();
      var canAttachTrace2 = util.canAttachTrace;
      var unhandledRejectionHandled;
      var possiblyUnhandledRejection;
      var debugging = util.isNode && (!!process.env["BLUEBIRD_DEBUG"] || process.env["NODE_ENV"] === "development");
      if (util.isNode && process.env["BLUEBIRD_DEBUG"] == 0)
        debugging = false;
      if (debugging) {
        async.disableTrampolineIfNecessary();
      }
      Promise2.prototype._ignoreRejections = function() {
        this._unsetRejectionIsUnhandled();
        this._bitField = this._bitField | 16777216;
      };
      Promise2.prototype._ensurePossibleRejectionHandled = function() {
        if ((this._bitField & 16777216) !== 0)
          return;
        this._setRejectionIsUnhandled();
        async.invokeLater(this._notifyUnhandledRejection, this, void 0);
      };
      Promise2.prototype._notifyUnhandledRejectionIsHandled = function() {
        CapturedTrace.fireRejectionEvent(
          "rejectionHandled",
          unhandledRejectionHandled,
          void 0,
          this
        );
      };
      Promise2.prototype._notifyUnhandledRejection = function() {
        if (this._isRejectionUnhandled()) {
          var reason = this._getCarriedStackTrace() || this._settledValue;
          this._setUnhandledRejectionIsNotified();
          CapturedTrace.fireRejectionEvent(
            "unhandledRejection",
            possiblyUnhandledRejection,
            reason,
            this
          );
        }
      };
      Promise2.prototype._setUnhandledRejectionIsNotified = function() {
        this._bitField = this._bitField | 524288;
      };
      Promise2.prototype._unsetUnhandledRejectionIsNotified = function() {
        this._bitField = this._bitField & ~524288;
      };
      Promise2.prototype._isUnhandledRejectionNotified = function() {
        return (this._bitField & 524288) > 0;
      };
      Promise2.prototype._setRejectionIsUnhandled = function() {
        this._bitField = this._bitField | 2097152;
      };
      Promise2.prototype._unsetRejectionIsUnhandled = function() {
        this._bitField = this._bitField & ~2097152;
        if (this._isUnhandledRejectionNotified()) {
          this._unsetUnhandledRejectionIsNotified();
          this._notifyUnhandledRejectionIsHandled();
        }
      };
      Promise2.prototype._isRejectionUnhandled = function() {
        return (this._bitField & 2097152) > 0;
      };
      Promise2.prototype._setCarriedStackTrace = function(capturedTrace) {
        this._bitField = this._bitField | 1048576;
        this._fulfillmentHandler0 = capturedTrace;
      };
      Promise2.prototype._isCarryingStackTrace = function() {
        return (this._bitField & 1048576) > 0;
      };
      Promise2.prototype._getCarriedStackTrace = function() {
        return this._isCarryingStackTrace() ? this._fulfillmentHandler0 : void 0;
      };
      Promise2.prototype._captureStackTrace = function() {
        if (debugging) {
          this._trace = new CapturedTrace(this._peekContext());
        }
        return this;
      };
      Promise2.prototype._attachExtraTrace = function(error, ignoreSelf) {
        if (debugging && canAttachTrace2(error)) {
          var trace = this._trace;
          if (trace !== void 0) {
            if (ignoreSelf)
              trace = trace._parent;
          }
          if (trace !== void 0) {
            trace.attachExtraTrace(error);
          } else if (!error.__stackCleaned__) {
            var parsed = CapturedTrace.parseStackAndMessage(error);
            util.notEnumerableProp(
              error,
              "stack",
              parsed.message + "\n" + parsed.stack.join("\n")
            );
            util.notEnumerableProp(error, "__stackCleaned__", true);
          }
        }
      };
      Promise2.prototype._warn = function(message) {
        var warning = new Warning(message);
        var ctx = this._peekContext();
        if (ctx) {
          ctx.attachExtraTrace(warning);
        } else {
          var parsed = CapturedTrace.parseStackAndMessage(warning);
          warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
        }
        CapturedTrace.formatAndLogError(warning, "");
      };
      Promise2.onPossiblyUnhandledRejection = function(fn) {
        var domain = getDomain();
        possiblyUnhandledRejection = typeof fn === "function" ? domain === null ? fn : domain.bind(fn) : void 0;
      };
      Promise2.onUnhandledRejectionHandled = function(fn) {
        var domain = getDomain();
        unhandledRejectionHandled = typeof fn === "function" ? domain === null ? fn : domain.bind(fn) : void 0;
      };
      Promise2.longStackTraces = function() {
        if (async.haveItemsQueued() && debugging === false) {
          throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/DT1qyG\n");
        }
        debugging = CapturedTrace.isSupported();
        if (debugging) {
          async.disableTrampolineIfNecessary();
        }
      };
      Promise2.hasLongStackTraces = function() {
        return debugging && CapturedTrace.isSupported();
      };
      if (!CapturedTrace.isSupported()) {
        Promise2.longStackTraces = function() {
        };
        debugging = false;
      }
      return function() {
        return debugging;
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/context.js
var require_context = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/context.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, CapturedTrace, isDebugging) {
      var contextStack = [];
      function Context() {
        this._trace = new CapturedTrace(peekContext());
      }
      Context.prototype._pushContext = function() {
        if (!isDebugging())
          return;
        if (this._trace !== void 0) {
          contextStack.push(this._trace);
        }
      };
      Context.prototype._popContext = function() {
        if (!isDebugging())
          return;
        if (this._trace !== void 0) {
          contextStack.pop();
        }
      };
      function createContext() {
        if (isDebugging())
          return new Context();
      }
      function peekContext() {
        var lastIndex = contextStack.length - 1;
        if (lastIndex >= 0) {
          return contextStack[lastIndex];
        }
        return void 0;
      }
      Promise2.prototype._peekContext = peekContext;
      Promise2.prototype._pushContext = Context.prototype._pushContext;
      Promise2.prototype._popContext = Context.prototype._popContext;
      return createContext;
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/catch_filter.js
var require_catch_filter = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/catch_filter.js"(exports2, module2) {
    "use strict";
    module2.exports = function(NEXT_FILTER) {
      var util = require_util();
      var errors = require_errors();
      var tryCatch2 = util.tryCatch;
      var errorObj2 = util.errorObj;
      var keys = require_es5().keys;
      var TypeError2 = errors.TypeError;
      function CatchFilter(instances, callback, promise) {
        this._instances = instances;
        this._callback = callback;
        this._promise = promise;
      }
      function safePredicate(predicate, e) {
        var safeObject = {};
        var retfilter = tryCatch2(predicate).call(safeObject, e);
        if (retfilter === errorObj2)
          return retfilter;
        var safeKeys = keys(safeObject);
        if (safeKeys.length) {
          errorObj2.e = new TypeError2("Catch filter must inherit from Error or be a simple predicate function\n\n    See http://goo.gl/o84o68\n");
          return errorObj2;
        }
        return retfilter;
      }
      CatchFilter.prototype.doFilter = function(e) {
        var cb = this._callback;
        var promise = this._promise;
        var boundTo = promise._boundValue();
        for (var i = 0, len = this._instances.length; i < len; ++i) {
          var item = this._instances[i];
          var itemIsErrorType = item === Error || item != null && item.prototype instanceof Error;
          if (itemIsErrorType && e instanceof item) {
            var ret2 = tryCatch2(cb).call(boundTo, e);
            if (ret2 === errorObj2) {
              NEXT_FILTER.e = ret2.e;
              return NEXT_FILTER;
            }
            return ret2;
          } else if (typeof item === "function" && !itemIsErrorType) {
            var shouldHandle = safePredicate(item, e);
            if (shouldHandle === errorObj2) {
              e = errorObj2.e;
              break;
            } else if (shouldHandle) {
              var ret2 = tryCatch2(cb).call(boundTo, e);
              if (ret2 === errorObj2) {
                NEXT_FILTER.e = ret2.e;
                return NEXT_FILTER;
              }
              return ret2;
            }
          }
        }
        NEXT_FILTER.e = e;
        return NEXT_FILTER;
      };
      return CatchFilter;
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/promise_resolver.js
var require_promise_resolver = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/promise_resolver.js"(exports2, module2) {
    "use strict";
    var util = require_util();
    var maybeWrapAsError2 = util.maybeWrapAsError;
    var errors = require_errors();
    var TimeoutError = errors.TimeoutError;
    var OperationalError = errors.OperationalError;
    var haveGetters2 = util.haveGetters;
    var es52 = require_es5();
    function isUntypedError(obj2) {
      return obj2 instanceof Error && es52.getPrototypeOf(obj2) === Error.prototype;
    }
    var rErrorKey = /^(?:name|message|stack|cause)$/;
    function wrapAsOperationalError(obj2) {
      var ret2;
      if (isUntypedError(obj2)) {
        ret2 = new OperationalError(obj2);
        ret2.name = obj2.name;
        ret2.message = obj2.message;
        ret2.stack = obj2.stack;
        var keys = es52.keys(obj2);
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          if (!rErrorKey.test(key)) {
            ret2[key] = obj2[key];
          }
        }
        return ret2;
      }
      util.markAsOriginatingFromRejection(obj2);
      return obj2;
    }
    function nodebackForPromise(promise) {
      return function(err, value) {
        if (promise === null)
          return;
        if (err) {
          var wrapped = wrapAsOperationalError(maybeWrapAsError2(err));
          promise._attachExtraTrace(wrapped);
          promise._reject(wrapped);
        } else if (arguments.length > 2) {
          var $_len = arguments.length;
          var args = new Array($_len - 1);
          for (var $_i = 1; $_i < $_len; ++$_i) {
            args[$_i - 1] = arguments[$_i];
          }
          promise._fulfill(args);
        } else {
          promise._fulfill(value);
        }
        promise = null;
      };
    }
    var PromiseResolver;
    if (!haveGetters2) {
      PromiseResolver = function(promise) {
        this.promise = promise;
        this.asCallback = nodebackForPromise(promise);
        this.callback = this.asCallback;
      };
    } else {
      PromiseResolver = function(promise) {
        this.promise = promise;
      };
    }
    if (haveGetters2) {
      prop = {
        get: function() {
          return nodebackForPromise(this.promise);
        }
      };
      es52.defineProperty(PromiseResolver.prototype, "asCallback", prop);
      es52.defineProperty(PromiseResolver.prototype, "callback", prop);
    }
    var prop;
    PromiseResolver._nodebackForPromise = nodebackForPromise;
    PromiseResolver.prototype.toString = function() {
      return "[object PromiseResolver]";
    };
    PromiseResolver.prototype.resolve = PromiseResolver.prototype.fulfill = function(value) {
      if (!(this instanceof PromiseResolver)) {
        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\n\n    See http://goo.gl/sdkXL9\n");
      }
      this.promise._resolveCallback(value);
    };
    PromiseResolver.prototype.reject = function(reason) {
      if (!(this instanceof PromiseResolver)) {
        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\n\n    See http://goo.gl/sdkXL9\n");
      }
      this.promise._rejectCallback(reason);
    };
    PromiseResolver.prototype.progress = function(value) {
      if (!(this instanceof PromiseResolver)) {
        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\n\n    See http://goo.gl/sdkXL9\n");
      }
      this.promise._progress(value);
    };
    PromiseResolver.prototype.cancel = function(err) {
      this.promise.cancel(err);
    };
    PromiseResolver.prototype.timeout = function() {
      this.reject(new TimeoutError("timeout"));
    };
    PromiseResolver.prototype.isResolved = function() {
      return this.promise.isResolved();
    };
    PromiseResolver.prototype.toJSON = function() {
      return this.promise.toJSON();
    };
    module2.exports = PromiseResolver;
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/progress.js
var require_progress = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/progress.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, PromiseArray) {
      var util = require_util();
      var async = require_async();
      var tryCatch2 = util.tryCatch;
      var errorObj2 = util.errorObj;
      Promise2.prototype.progressed = function(handler) {
        return this._then(void 0, void 0, handler, void 0, void 0);
      };
      Promise2.prototype._progress = function(progressValue) {
        if (this._isFollowingOrFulfilledOrRejected())
          return;
        this._target()._progressUnchecked(progressValue);
      };
      Promise2.prototype._progressHandlerAt = function(index) {
        return index === 0 ? this._progressHandler0 : this[(index << 2) + index - 5 + 2];
      };
      Promise2.prototype._doProgressWith = function(progression) {
        var progressValue = progression.value;
        var handler = progression.handler;
        var promise = progression.promise;
        var receiver = progression.receiver;
        var ret2 = tryCatch2(handler).call(receiver, progressValue);
        if (ret2 === errorObj2) {
          if (ret2.e != null && ret2.e.name !== "StopProgressPropagation") {
            var trace = util.canAttachTrace(ret2.e) ? ret2.e : new Error(util.toString(ret2.e));
            promise._attachExtraTrace(trace);
            promise._progress(ret2.e);
          }
        } else if (ret2 instanceof Promise2) {
          ret2._then(promise._progress, null, null, promise, void 0);
        } else {
          promise._progress(ret2);
        }
      };
      Promise2.prototype._progressUnchecked = function(progressValue) {
        var len = this._length();
        var progress = this._progress;
        for (var i = 0; i < len; i++) {
          var handler = this._progressHandlerAt(i);
          var promise = this._promiseAt(i);
          if (!(promise instanceof Promise2)) {
            var receiver = this._receiverAt(i);
            if (typeof handler === "function") {
              handler.call(receiver, progressValue, promise);
            } else if (receiver instanceof PromiseArray && !receiver._isResolved()) {
              receiver._promiseProgressed(progressValue, promise);
            }
            continue;
          }
          if (typeof handler === "function") {
            async.invoke(this._doProgressWith, this, {
              handler,
              promise,
              receiver: this._receiverAt(i),
              value: progressValue
            });
          } else {
            async.invoke(progress, promise, progressValue);
          }
        }
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/method.js
var require_method = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/method.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, INTERNAL, tryConvertToPromise, apiRejection) {
      var util = require_util();
      var tryCatch2 = util.tryCatch;
      Promise2.method = function(fn) {
        if (typeof fn !== "function") {
          throw new Promise2.TypeError("fn must be a function\n\n    See http://goo.gl/916lJJ\n");
        }
        return function() {
          var ret2 = new Promise2(INTERNAL);
          ret2._captureStackTrace();
          ret2._pushContext();
          var value = tryCatch2(fn).apply(this, arguments);
          ret2._popContext();
          ret2._resolveFromSyncValue(value);
          return ret2;
        };
      };
      Promise2.attempt = Promise2["try"] = function(fn, args, ctx) {
        if (typeof fn !== "function") {
          return apiRejection("fn must be a function\n\n    See http://goo.gl/916lJJ\n");
        }
        var ret2 = new Promise2(INTERNAL);
        ret2._captureStackTrace();
        ret2._pushContext();
        var value = util.isArray(args) ? tryCatch2(fn).apply(ctx, args) : tryCatch2(fn).call(ctx, args);
        ret2._popContext();
        ret2._resolveFromSyncValue(value);
        return ret2;
      };
      Promise2.prototype._resolveFromSyncValue = function(value) {
        if (value === util.errorObj) {
          this._rejectCallback(value.e, false, true);
        } else {
          this._resolveCallback(value, true);
        }
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/bind.js
var require_bind = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/bind.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, INTERNAL, tryConvertToPromise) {
      var rejectThis = function(_, e) {
        this._reject(e);
      };
      var targetRejected = function(e, context) {
        context.promiseRejectionQueued = true;
        context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
      };
      var bindingResolved = function(thisArg, context) {
        if (this._isPending()) {
          this._resolveCallback(context.target);
        }
      };
      var bindingRejected = function(e, context) {
        if (!context.promiseRejectionQueued)
          this._reject(e);
      };
      Promise2.prototype.bind = function(thisArg) {
        var maybePromise = tryConvertToPromise(thisArg);
        var ret2 = new Promise2(INTERNAL);
        ret2._propagateFrom(this, 1);
        var target = this._target();
        ret2._setBoundTo(maybePromise);
        if (maybePromise instanceof Promise2) {
          var context = {
            promiseRejectionQueued: false,
            promise: ret2,
            target,
            bindingPromise: maybePromise
          };
          target._then(INTERNAL, targetRejected, ret2._progress, ret2, context);
          maybePromise._then(
            bindingResolved,
            bindingRejected,
            ret2._progress,
            ret2,
            context
          );
        } else {
          ret2._resolveCallback(target);
        }
        return ret2;
      };
      Promise2.prototype._setBoundTo = function(obj2) {
        if (obj2 !== void 0) {
          this._bitField = this._bitField | 131072;
          this._boundTo = obj2;
        } else {
          this._bitField = this._bitField & ~131072;
        }
      };
      Promise2.prototype._isBound = function() {
        return (this._bitField & 131072) === 131072;
      };
      Promise2.bind = function(thisArg, value) {
        var maybePromise = tryConvertToPromise(thisArg);
        var ret2 = new Promise2(INTERNAL);
        ret2._setBoundTo(maybePromise);
        if (maybePromise instanceof Promise2) {
          maybePromise._then(function() {
            ret2._resolveCallback(value);
          }, ret2._reject, ret2._progress, ret2, null);
        } else {
          ret2._resolveCallback(value);
        }
        return ret2;
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/finally.js
var require_finally = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/finally.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, NEXT_FILTER, tryConvertToPromise) {
      var util = require_util();
      var isPrimitive2 = util.isPrimitive;
      var thrower2 = util.thrower;
      function returnThis() {
        return this;
      }
      function throwThis() {
        throw this;
      }
      function return$(r) {
        return function() {
          return r;
        };
      }
      function throw$(r) {
        return function() {
          throw r;
        };
      }
      function promisedFinally(ret2, reasonOrValue, isFulfilled) {
        var then;
        if (isPrimitive2(reasonOrValue)) {
          then = isFulfilled ? return$(reasonOrValue) : throw$(reasonOrValue);
        } else {
          then = isFulfilled ? returnThis : throwThis;
        }
        return ret2._then(then, thrower2, void 0, reasonOrValue, void 0);
      }
      function finallyHandler(reasonOrValue) {
        var promise = this.promise;
        var handler = this.handler;
        var ret2 = promise._isBound() ? handler.call(promise._boundValue()) : handler();
        if (ret2 !== void 0) {
          var maybePromise = tryConvertToPromise(ret2, promise);
          if (maybePromise instanceof Promise2) {
            maybePromise = maybePromise._target();
            return promisedFinally(
              maybePromise,
              reasonOrValue,
              promise.isFulfilled()
            );
          }
        }
        if (promise.isRejected()) {
          NEXT_FILTER.e = reasonOrValue;
          return NEXT_FILTER;
        } else {
          return reasonOrValue;
        }
      }
      function tapHandler(value) {
        var promise = this.promise;
        var handler = this.handler;
        var ret2 = promise._isBound() ? handler.call(promise._boundValue(), value) : handler(value);
        if (ret2 !== void 0) {
          var maybePromise = tryConvertToPromise(ret2, promise);
          if (maybePromise instanceof Promise2) {
            maybePromise = maybePromise._target();
            return promisedFinally(maybePromise, value, true);
          }
        }
        return value;
      }
      Promise2.prototype._passThroughHandler = function(handler, isFinally) {
        if (typeof handler !== "function")
          return this.then();
        var promiseAndHandler = {
          promise: this,
          handler
        };
        return this._then(
          isFinally ? finallyHandler : tapHandler,
          isFinally ? finallyHandler : void 0,
          void 0,
          promiseAndHandler,
          void 0
        );
      };
      Promise2.prototype.lastly = Promise2.prototype["finally"] = function(handler) {
        return this._passThroughHandler(handler, true);
      };
      Promise2.prototype.tap = function(handler) {
        return this._passThroughHandler(handler, false);
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/direct_resolve.js
var require_direct_resolve = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/direct_resolve.js"(exports2, module2) {
    "use strict";
    var util = require_util();
    var isPrimitive2 = util.isPrimitive;
    module2.exports = function(Promise2) {
      var returner = function() {
        return this;
      };
      var thrower2 = function() {
        throw this;
      };
      var returnUndefined = function() {
      };
      var throwUndefined = function() {
        throw void 0;
      };
      var wrapper = function(value, action) {
        if (action === 1) {
          return function() {
            throw value;
          };
        } else if (action === 2) {
          return function() {
            return value;
          };
        }
      };
      Promise2.prototype["return"] = Promise2.prototype.thenReturn = function(value) {
        if (value === void 0)
          return this.then(returnUndefined);
        if (isPrimitive2(value)) {
          return this._then(
            wrapper(value, 2),
            void 0,
            void 0,
            void 0,
            void 0
          );
        } else if (value instanceof Promise2) {
          value._ignoreRejections();
        }
        return this._then(returner, void 0, void 0, value, void 0);
      };
      Promise2.prototype["throw"] = Promise2.prototype.thenThrow = function(reason) {
        if (reason === void 0)
          return this.then(throwUndefined);
        if (isPrimitive2(reason)) {
          return this._then(
            wrapper(reason, 1),
            void 0,
            void 0,
            void 0,
            void 0
          );
        }
        return this._then(thrower2, void 0, void 0, reason, void 0);
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/synchronous_inspection.js
var require_synchronous_inspection = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/synchronous_inspection.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2) {
      function PromiseInspection(promise) {
        if (promise !== void 0) {
          promise = promise._target();
          this._bitField = promise._bitField;
          this._settledValue = promise._settledValue;
        } else {
          this._bitField = 0;
          this._settledValue = void 0;
        }
      }
      PromiseInspection.prototype.value = function() {
        if (!this.isFulfilled()) {
          throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\n\n    See http://goo.gl/hc1DLj\n");
        }
        return this._settledValue;
      };
      PromiseInspection.prototype.error = PromiseInspection.prototype.reason = function() {
        if (!this.isRejected()) {
          throw new TypeError("cannot get rejection reason of a non-rejected promise\n\n    See http://goo.gl/hPuiwB\n");
        }
        return this._settledValue;
      };
      PromiseInspection.prototype.isFulfilled = Promise2.prototype._isFulfilled = function() {
        return (this._bitField & 268435456) > 0;
      };
      PromiseInspection.prototype.isRejected = Promise2.prototype._isRejected = function() {
        return (this._bitField & 134217728) > 0;
      };
      PromiseInspection.prototype.isPending = Promise2.prototype._isPending = function() {
        return (this._bitField & 402653184) === 0;
      };
      PromiseInspection.prototype.isResolved = Promise2.prototype._isResolved = function() {
        return (this._bitField & 402653184) > 0;
      };
      Promise2.prototype.isPending = function() {
        return this._target()._isPending();
      };
      Promise2.prototype.isRejected = function() {
        return this._target()._isRejected();
      };
      Promise2.prototype.isFulfilled = function() {
        return this._target()._isFulfilled();
      };
      Promise2.prototype.isResolved = function() {
        return this._target()._isResolved();
      };
      Promise2.prototype._value = function() {
        return this._settledValue;
      };
      Promise2.prototype._reason = function() {
        this._unsetRejectionIsUnhandled();
        return this._settledValue;
      };
      Promise2.prototype.value = function() {
        var target = this._target();
        if (!target.isFulfilled()) {
          throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\n\n    See http://goo.gl/hc1DLj\n");
        }
        return target._settledValue;
      };
      Promise2.prototype.reason = function() {
        var target = this._target();
        if (!target.isRejected()) {
          throw new TypeError("cannot get rejection reason of a non-rejected promise\n\n    See http://goo.gl/hPuiwB\n");
        }
        target._unsetRejectionIsUnhandled();
        return target._settledValue;
      };
      Promise2.PromiseInspection = PromiseInspection;
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/join.js
var require_join = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/join.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, PromiseArray, tryConvertToPromise, INTERNAL) {
      var util = require_util();
      var canEvaluate2 = util.canEvaluate;
      var tryCatch2 = util.tryCatch;
      var errorObj2 = util.errorObj;
      var reject;
      if (true) {
        if (canEvaluate2) {
          var thenCallback = function(i2) {
            return new Function("value", "holder", "                             \n            'use strict';                                                    \n            holder.pIndex = value;                                           \n            holder.checkFulfillment(this);                                   \n            ".replace(/Index/g, i2));
          };
          var caller = function(count) {
            var values = [];
            for (var i2 = 1; i2 <= count; ++i2)
              values.push("holder.p" + i2);
            return new Function("holder", "                                      \n            'use strict';                                                    \n            var callback = holder.fn;                                        \n            return callback(values);                                         \n            ".replace(/values/g, values.join(", ")));
          };
          var thenCallbacks = [];
          var callers = [void 0];
          for (var i = 1; i <= 5; ++i) {
            thenCallbacks.push(thenCallback(i));
            callers.push(caller(i));
          }
          var Holder = function(total, fn) {
            this.p1 = this.p2 = this.p3 = this.p4 = this.p5 = null;
            this.fn = fn;
            this.total = total;
            this.now = 0;
          };
          Holder.prototype.callers = callers;
          Holder.prototype.checkFulfillment = function(promise) {
            var now = this.now;
            now++;
            var total = this.total;
            if (now >= total) {
              var handler = this.callers[total];
              promise._pushContext();
              var ret2 = tryCatch2(handler)(this);
              promise._popContext();
              if (ret2 === errorObj2) {
                promise._rejectCallback(ret2.e, false, true);
              } else {
                promise._resolveCallback(ret2);
              }
            } else {
              this.now = now;
            }
          };
          var reject = function(reason) {
            this._reject(reason);
          };
        }
      }
      Promise2.join = function() {
        var last = arguments.length - 1;
        var fn;
        if (last > 0 && typeof arguments[last] === "function") {
          fn = arguments[last];
          if (true) {
            if (last < 6 && canEvaluate2) {
              var ret2 = new Promise2(INTERNAL);
              ret2._captureStackTrace();
              var holder = new Holder(last, fn);
              var callbacks = thenCallbacks;
              for (var i2 = 0; i2 < last; ++i2) {
                var maybePromise = tryConvertToPromise(arguments[i2], ret2);
                if (maybePromise instanceof Promise2) {
                  maybePromise = maybePromise._target();
                  if (maybePromise._isPending()) {
                    maybePromise._then(
                      callbacks[i2],
                      reject,
                      void 0,
                      ret2,
                      holder
                    );
                  } else if (maybePromise._isFulfilled()) {
                    callbacks[i2].call(
                      ret2,
                      maybePromise._value(),
                      holder
                    );
                  } else {
                    ret2._reject(maybePromise._reason());
                  }
                } else {
                  callbacks[i2].call(ret2, maybePromise, holder);
                }
              }
              return ret2;
            }
          }
        }
        var $_len = arguments.length;
        var args = new Array($_len);
        for (var $_i = 0; $_i < $_len; ++$_i) {
          args[$_i] = arguments[$_i];
        }
        if (fn)
          args.pop();
        var ret2 = new PromiseArray(args).promise();
        return fn !== void 0 ? ret2.spread(fn) : ret2;
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/map.js
var require_map = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/map.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL) {
      var getDomain = Promise2._getDomain;
      var async = require_async();
      var util = require_util();
      var tryCatch2 = util.tryCatch;
      var errorObj2 = util.errorObj;
      var PENDING = {};
      var EMPTY_ARRAY = [];
      function MappingPromiseArray(promises, fn, limit, _filter) {
        this.constructor$(promises);
        this._promise._captureStackTrace();
        var domain = getDomain();
        this._callback = domain === null ? fn : domain.bind(fn);
        this._preservedValues = _filter === INTERNAL ? new Array(this.length()) : null;
        this._limit = limit;
        this._inFlight = 0;
        this._queue = limit >= 1 ? [] : EMPTY_ARRAY;
        async.invoke(init, this, void 0);
      }
      util.inherits(MappingPromiseArray, PromiseArray);
      function init() {
        this._init$(void 0, -2);
      }
      MappingPromiseArray.prototype._init = function() {
      };
      MappingPromiseArray.prototype._promiseFulfilled = function(value, index) {
        var values = this._values;
        var length = this.length();
        var preservedValues = this._preservedValues;
        var limit = this._limit;
        if (values[index] === PENDING) {
          values[index] = value;
          if (limit >= 1) {
            this._inFlight--;
            this._drainQueue();
            if (this._isResolved())
              return;
          }
        } else {
          if (limit >= 1 && this._inFlight >= limit) {
            values[index] = value;
            this._queue.push(index);
            return;
          }
          if (preservedValues !== null)
            preservedValues[index] = value;
          var callback = this._callback;
          var receiver = this._promise._boundValue();
          this._promise._pushContext();
          var ret2 = tryCatch2(callback).call(receiver, value, index, length);
          this._promise._popContext();
          if (ret2 === errorObj2)
            return this._reject(ret2.e);
          var maybePromise = tryConvertToPromise(ret2, this._promise);
          if (maybePromise instanceof Promise2) {
            maybePromise = maybePromise._target();
            if (maybePromise._isPending()) {
              if (limit >= 1)
                this._inFlight++;
              values[index] = PENDING;
              return maybePromise._proxyPromiseArray(this, index);
            } else if (maybePromise._isFulfilled()) {
              ret2 = maybePromise._value();
            } else {
              return this._reject(maybePromise._reason());
            }
          }
          values[index] = ret2;
        }
        var totalResolved = ++this._totalResolved;
        if (totalResolved >= length) {
          if (preservedValues !== null) {
            this._filter(values, preservedValues);
          } else {
            this._resolve(values);
          }
        }
      };
      MappingPromiseArray.prototype._drainQueue = function() {
        var queue = this._queue;
        var limit = this._limit;
        var values = this._values;
        while (queue.length > 0 && this._inFlight < limit) {
          if (this._isResolved())
            return;
          var index = queue.pop();
          this._promiseFulfilled(values[index], index);
        }
      };
      MappingPromiseArray.prototype._filter = function(booleans, values) {
        var len = values.length;
        var ret2 = new Array(len);
        var j = 0;
        for (var i = 0; i < len; ++i) {
          if (booleans[i])
            ret2[j++] = values[i];
        }
        ret2.length = j;
        this._resolve(ret2);
      };
      MappingPromiseArray.prototype.preservedValues = function() {
        return this._preservedValues;
      };
      function map(promises, fn, options, _filter) {
        var limit = typeof options === "object" && options !== null ? options.concurrency : 0;
        limit = typeof limit === "number" && isFinite(limit) && limit >= 1 ? limit : 0;
        return new MappingPromiseArray(promises, fn, limit, _filter);
      }
      Promise2.prototype.map = function(fn, options) {
        if (typeof fn !== "function")
          return apiRejection("fn must be a function\n\n    See http://goo.gl/916lJJ\n");
        return map(this, fn, options, null).promise();
      };
      Promise2.map = function(promises, fn, options, _filter) {
        if (typeof fn !== "function")
          return apiRejection("fn must be a function\n\n    See http://goo.gl/916lJJ\n");
        return map(promises, fn, options, _filter).promise();
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/cancel.js
var require_cancel = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/cancel.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2) {
      var errors = require_errors();
      var async = require_async();
      var CancellationError = errors.CancellationError;
      Promise2.prototype._cancel = function(reason) {
        if (!this.isCancellable())
          return this;
        var parent;
        var promiseToReject = this;
        while ((parent = promiseToReject._cancellationParent) !== void 0 && parent.isCancellable()) {
          promiseToReject = parent;
        }
        this._unsetCancellable();
        promiseToReject._target()._rejectCallback(reason, false, true);
      };
      Promise2.prototype.cancel = function(reason) {
        if (!this.isCancellable())
          return this;
        if (reason === void 0)
          reason = new CancellationError();
        async.invokeLater(this._cancel, this, reason);
        return this;
      };
      Promise2.prototype.cancellable = function() {
        if (this._cancellable())
          return this;
        async.enableTrampoline();
        this._setCancellable();
        this._cancellationParent = void 0;
        return this;
      };
      Promise2.prototype.uncancellable = function() {
        var ret2 = this.then();
        ret2._unsetCancellable();
        return ret2;
      };
      Promise2.prototype.fork = function(didFulfill, didReject, didProgress) {
        var ret2 = this._then(
          didFulfill,
          didReject,
          didProgress,
          void 0,
          void 0
        );
        ret2._setCancellable();
        ret2._cancellationParent = void 0;
        return ret2;
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/using.js
var require_using = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/using.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, apiRejection, tryConvertToPromise, createContext) {
      var TypeError2 = require_errors().TypeError;
      var inherits2 = require_util().inherits;
      var PromiseInspection = Promise2.PromiseInspection;
      function inspectionMapper(inspections) {
        var len = inspections.length;
        for (var i = 0; i < len; ++i) {
          var inspection = inspections[i];
          if (inspection.isRejected()) {
            return Promise2.reject(inspection.error());
          }
          inspections[i] = inspection._settledValue;
        }
        return inspections;
      }
      function thrower2(e) {
        setTimeout(function() {
          throw e;
        }, 0);
      }
      function castPreservingDisposable(thenable) {
        var maybePromise = tryConvertToPromise(thenable);
        if (maybePromise !== thenable && typeof thenable._isDisposable === "function" && typeof thenable._getDisposer === "function" && thenable._isDisposable()) {
          maybePromise._setDisposable(thenable._getDisposer());
        }
        return maybePromise;
      }
      function dispose(resources, inspection) {
        var i = 0;
        var len = resources.length;
        var ret2 = Promise2.defer();
        function iterator() {
          if (i >= len)
            return ret2.resolve();
          var maybePromise = castPreservingDisposable(resources[i++]);
          if (maybePromise instanceof Promise2 && maybePromise._isDisposable()) {
            try {
              maybePromise = tryConvertToPromise(
                maybePromise._getDisposer().tryDispose(inspection),
                resources.promise
              );
            } catch (e) {
              return thrower2(e);
            }
            if (maybePromise instanceof Promise2) {
              return maybePromise._then(
                iterator,
                thrower2,
                null,
                null,
                null
              );
            }
          }
          iterator();
        }
        iterator();
        return ret2.promise;
      }
      function disposerSuccess(value) {
        var inspection = new PromiseInspection();
        inspection._settledValue = value;
        inspection._bitField = 268435456;
        return dispose(this, inspection).thenReturn(value);
      }
      function disposerFail(reason) {
        var inspection = new PromiseInspection();
        inspection._settledValue = reason;
        inspection._bitField = 134217728;
        return dispose(this, inspection).thenThrow(reason);
      }
      function Disposer(data, promise, context) {
        this._data = data;
        this._promise = promise;
        this._context = context;
      }
      Disposer.prototype.data = function() {
        return this._data;
      };
      Disposer.prototype.promise = function() {
        return this._promise;
      };
      Disposer.prototype.resource = function() {
        if (this.promise().isFulfilled()) {
          return this.promise().value();
        }
        return null;
      };
      Disposer.prototype.tryDispose = function(inspection) {
        var resource = this.resource();
        var context = this._context;
        if (context !== void 0)
          context._pushContext();
        var ret2 = resource !== null ? this.doDispose(resource, inspection) : null;
        if (context !== void 0)
          context._popContext();
        this._promise._unsetDisposable();
        this._data = null;
        return ret2;
      };
      Disposer.isDisposer = function(d) {
        return d != null && typeof d.resource === "function" && typeof d.tryDispose === "function";
      };
      function FunctionDisposer(fn, promise, context) {
        this.constructor$(fn, promise, context);
      }
      inherits2(FunctionDisposer, Disposer);
      FunctionDisposer.prototype.doDispose = function(resource, inspection) {
        var fn = this.data();
        return fn.call(resource, resource, inspection);
      };
      function maybeUnwrapDisposer(value) {
        if (Disposer.isDisposer(value)) {
          this.resources[this.index]._setDisposable(value);
          return value.promise();
        }
        return value;
      }
      Promise2.using = function() {
        var len = arguments.length;
        if (len < 2)
          return apiRejection(
            "you must pass at least 2 arguments to Promise.using"
          );
        var fn = arguments[len - 1];
        if (typeof fn !== "function")
          return apiRejection("fn must be a function\n\n    See http://goo.gl/916lJJ\n");
        var input;
        var spreadArgs = true;
        if (len === 2 && Array.isArray(arguments[0])) {
          input = arguments[0];
          len = input.length;
          spreadArgs = false;
        } else {
          input = arguments;
          len--;
        }
        var resources = new Array(len);
        for (var i = 0; i < len; ++i) {
          var resource = input[i];
          if (Disposer.isDisposer(resource)) {
            var disposer = resource;
            resource = resource.promise();
            resource._setDisposable(disposer);
          } else {
            var maybePromise = tryConvertToPromise(resource);
            if (maybePromise instanceof Promise2) {
              resource = maybePromise._then(maybeUnwrapDisposer, null, null, {
                resources,
                index: i
              }, void 0);
            }
          }
          resources[i] = resource;
        }
        var promise = Promise2.settle(resources).then(inspectionMapper).then(function(vals) {
          promise._pushContext();
          var ret2;
          try {
            ret2 = spreadArgs ? fn.apply(void 0, vals) : fn.call(void 0, vals);
          } finally {
            promise._popContext();
          }
          return ret2;
        })._then(
          disposerSuccess,
          disposerFail,
          void 0,
          resources,
          void 0
        );
        resources.promise = promise;
        return promise;
      };
      Promise2.prototype._setDisposable = function(disposer) {
        this._bitField = this._bitField | 262144;
        this._disposer = disposer;
      };
      Promise2.prototype._isDisposable = function() {
        return (this._bitField & 262144) > 0;
      };
      Promise2.prototype._getDisposer = function() {
        return this._disposer;
      };
      Promise2.prototype._unsetDisposable = function() {
        this._bitField = this._bitField & ~262144;
        this._disposer = void 0;
      };
      Promise2.prototype.disposer = function(fn) {
        if (typeof fn === "function") {
          return new FunctionDisposer(fn, this, createContext());
        }
        throw new TypeError2();
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/generators.js
var require_generators = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/generators.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, apiRejection, INTERNAL, tryConvertToPromise) {
      var errors = require_errors();
      var TypeError2 = errors.TypeError;
      var util = require_util();
      var errorObj2 = util.errorObj;
      var tryCatch2 = util.tryCatch;
      var yieldHandlers = [];
      function promiseFromYieldHandler(value, yieldHandlers2, traceParent) {
        for (var i = 0; i < yieldHandlers2.length; ++i) {
          traceParent._pushContext();
          var result = tryCatch2(yieldHandlers2[i])(value);
          traceParent._popContext();
          if (result === errorObj2) {
            traceParent._pushContext();
            var ret2 = Promise2.reject(errorObj2.e);
            traceParent._popContext();
            return ret2;
          }
          var maybePromise = tryConvertToPromise(result, traceParent);
          if (maybePromise instanceof Promise2)
            return maybePromise;
        }
        return null;
      }
      function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
        var promise = this._promise = new Promise2(INTERNAL);
        promise._captureStackTrace();
        this._stack = stack;
        this._generatorFunction = generatorFunction;
        this._receiver = receiver;
        this._generator = void 0;
        this._yieldHandlers = typeof yieldHandler === "function" ? [yieldHandler].concat(yieldHandlers) : yieldHandlers;
      }
      PromiseSpawn.prototype.promise = function() {
        return this._promise;
      };
      PromiseSpawn.prototype._run = function() {
        this._generator = this._generatorFunction.call(this._receiver);
        this._receiver = this._generatorFunction = void 0;
        this._next(void 0);
      };
      PromiseSpawn.prototype._continue = function(result) {
        if (result === errorObj2) {
          return this._promise._rejectCallback(result.e, false, true);
        }
        var value = result.value;
        if (result.done === true) {
          this._promise._resolveCallback(value);
        } else {
          var maybePromise = tryConvertToPromise(value, this._promise);
          if (!(maybePromise instanceof Promise2)) {
            maybePromise = promiseFromYieldHandler(
              maybePromise,
              this._yieldHandlers,
              this._promise
            );
            if (maybePromise === null) {
              this._throw(
                new TypeError2(
                  "A value %s was yielded that could not be treated as a promise\n\n    See http://goo.gl/4Y4pDk\n\n".replace("%s", value) + "From coroutine:\n" + this._stack.split("\n").slice(1, -7).join("\n")
                )
              );
              return;
            }
          }
          maybePromise._then(
            this._next,
            this._throw,
            void 0,
            this,
            null
          );
        }
      };
      PromiseSpawn.prototype._throw = function(reason) {
        this._promise._attachExtraTrace(reason);
        this._promise._pushContext();
        var result = tryCatch2(this._generator["throw"]).call(this._generator, reason);
        this._promise._popContext();
        this._continue(result);
      };
      PromiseSpawn.prototype._next = function(value) {
        this._promise._pushContext();
        var result = tryCatch2(this._generator.next).call(this._generator, value);
        this._promise._popContext();
        this._continue(result);
      };
      Promise2.coroutine = function(generatorFunction, options) {
        if (typeof generatorFunction !== "function") {
          throw new TypeError2("generatorFunction must be a function\n\n    See http://goo.gl/6Vqhm0\n");
        }
        var yieldHandler = Object(options).yieldHandler;
        var PromiseSpawn$ = PromiseSpawn;
        var stack = new Error().stack;
        return function() {
          var generator = generatorFunction.apply(this, arguments);
          var spawn = new PromiseSpawn$(
            void 0,
            void 0,
            yieldHandler,
            stack
          );
          spawn._generator = generator;
          spawn._next(void 0);
          return spawn.promise();
        };
      };
      Promise2.coroutine.addYieldHandler = function(fn) {
        if (typeof fn !== "function")
          throw new TypeError2("fn must be a function\n\n    See http://goo.gl/916lJJ\n");
        yieldHandlers.push(fn);
      };
      Promise2.spawn = function(generatorFunction) {
        if (typeof generatorFunction !== "function") {
          return apiRejection("generatorFunction must be a function\n\n    See http://goo.gl/6Vqhm0\n");
        }
        var spawn = new PromiseSpawn(generatorFunction, this);
        var ret2 = spawn.promise();
        spawn._run(Promise2.spawn);
        return ret2;
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/nodeify.js
var require_nodeify = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/nodeify.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2) {
      var util = require_util();
      var async = require_async();
      var tryCatch2 = util.tryCatch;
      var errorObj2 = util.errorObj;
      function spreadAdapter(val, nodeback) {
        var promise = this;
        if (!util.isArray(val))
          return successAdapter.call(promise, val, nodeback);
        var ret2 = tryCatch2(nodeback).apply(promise._boundValue(), [null].concat(val));
        if (ret2 === errorObj2) {
          async.throwLater(ret2.e);
        }
      }
      function successAdapter(val, nodeback) {
        var promise = this;
        var receiver = promise._boundValue();
        var ret2 = val === void 0 ? tryCatch2(nodeback).call(receiver, null) : tryCatch2(nodeback).call(receiver, null, val);
        if (ret2 === errorObj2) {
          async.throwLater(ret2.e);
        }
      }
      function errorAdapter(reason, nodeback) {
        var promise = this;
        if (!reason) {
          var target = promise._target();
          var newReason = target._getCarriedStackTrace();
          newReason.cause = reason;
          reason = newReason;
        }
        var ret2 = tryCatch2(nodeback).call(promise._boundValue(), reason);
        if (ret2 === errorObj2) {
          async.throwLater(ret2.e);
        }
      }
      Promise2.prototype.asCallback = Promise2.prototype.nodeify = function(nodeback, options) {
        if (typeof nodeback == "function") {
          var adapter = successAdapter;
          if (options !== void 0 && Object(options).spread) {
            adapter = spreadAdapter;
          }
          this._then(
            adapter,
            errorAdapter,
            void 0,
            this,
            nodeback
          );
        }
        return this;
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/call_get.js
var require_call_get = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/call_get.js"(exports2, module2) {
    "use strict";
    var cr = Object.create;
    if (cr) {
      callerCache = cr(null);
      getterCache = cr(null);
      callerCache[" size"] = getterCache[" size"] = 0;
    }
    var callerCache;
    var getterCache;
    module2.exports = function(Promise2) {
      var util = require_util();
      var canEvaluate2 = util.canEvaluate;
      var isIdentifier2 = util.isIdentifier;
      var getMethodCaller;
      var getGetter;
      if (true) {
        var makeMethodCaller = function(methodName) {
          return new Function("ensureMethod", "                                    \n        return function(obj) {                                               \n            'use strict'                                                     \n            var len = this.length;                                           \n            ensureMethod(obj, 'methodName');                                 \n            switch(len) {                                                    \n                case 1: return obj.methodName(this[0]);                      \n                case 2: return obj.methodName(this[0], this[1]);             \n                case 3: return obj.methodName(this[0], this[1], this[2]);    \n                case 0: return obj.methodName();                             \n                default:                                                     \n                    return obj.methodName.apply(obj, this);                  \n            }                                                                \n        };                                                                   \n        ".replace(/methodName/g, methodName))(ensureMethod);
        };
        var makeGetter = function(propertyName) {
          return new Function("obj", "                                             \n        'use strict';                                                        \n        return obj.propertyName;                                             \n        ".replace("propertyName", propertyName));
        };
        var getCompiled = function(name, compiler, cache) {
          var ret2 = cache[name];
          if (typeof ret2 !== "function") {
            if (!isIdentifier2(name)) {
              return null;
            }
            ret2 = compiler(name);
            cache[name] = ret2;
            cache[" size"]++;
            if (cache[" size"] > 512) {
              var keys = Object.keys(cache);
              for (var i = 0; i < 256; ++i)
                delete cache[keys[i]];
              cache[" size"] = keys.length - 256;
            }
          }
          return ret2;
        };
        getMethodCaller = function(name) {
          return getCompiled(name, makeMethodCaller, callerCache);
        };
        getGetter = function(name) {
          return getCompiled(name, makeGetter, getterCache);
        };
      }
      function ensureMethod(obj2, methodName) {
        var fn;
        if (obj2 != null)
          fn = obj2[methodName];
        if (typeof fn !== "function") {
          var message = "Object " + util.classString(obj2) + " has no method '" + util.toString(methodName) + "'";
          throw new Promise2.TypeError(message);
        }
        return fn;
      }
      function caller(obj2) {
        var methodName = this.pop();
        var fn = ensureMethod(obj2, methodName);
        return fn.apply(obj2, this);
      }
      Promise2.prototype.call = function(methodName) {
        var $_len = arguments.length;
        var args = new Array($_len - 1);
        for (var $_i = 1; $_i < $_len; ++$_i) {
          args[$_i - 1] = arguments[$_i];
        }
        if (true) {
          if (canEvaluate2) {
            var maybeCaller = getMethodCaller(methodName);
            if (maybeCaller !== null) {
              return this._then(
                maybeCaller,
                void 0,
                void 0,
                args,
                void 0
              );
            }
          }
        }
        args.push(methodName);
        return this._then(caller, void 0, void 0, args, void 0);
      };
      function namedGetter(obj2) {
        return obj2[this];
      }
      function indexedGetter(obj2) {
        var index = +this;
        if (index < 0)
          index = Math.max(0, index + obj2.length);
        return obj2[index];
      }
      Promise2.prototype.get = function(propertyName) {
        var isIndex = typeof propertyName === "number";
        var getter;
        if (!isIndex) {
          if (canEvaluate2) {
            var maybeGetter = getGetter(propertyName);
            getter = maybeGetter !== null ? maybeGetter : namedGetter;
          } else {
            getter = namedGetter;
          }
        } else {
          getter = indexedGetter;
        }
        return this._then(getter, void 0, void 0, propertyName, void 0);
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/props.js
var require_props = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/props.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, PromiseArray, tryConvertToPromise, apiRejection) {
      var util = require_util();
      var isObject2 = util.isObject;
      var es52 = require_es5();
      function PropertiesPromiseArray(obj2) {
        var keys = es52.keys(obj2);
        var len = keys.length;
        var values = new Array(len * 2);
        for (var i = 0; i < len; ++i) {
          var key = keys[i];
          values[i] = obj2[key];
          values[i + len] = key;
        }
        this.constructor$(values);
      }
      util.inherits(PropertiesPromiseArray, PromiseArray);
      PropertiesPromiseArray.prototype._init = function() {
        this._init$(void 0, -3);
      };
      PropertiesPromiseArray.prototype._promiseFulfilled = function(value, index) {
        this._values[index] = value;
        var totalResolved = ++this._totalResolved;
        if (totalResolved >= this._length) {
          var val = {};
          var keyOffset = this.length();
          for (var i = 0, len = this.length(); i < len; ++i) {
            val[this._values[i + keyOffset]] = this._values[i];
          }
          this._resolve(val);
        }
      };
      PropertiesPromiseArray.prototype._promiseProgressed = function(value, index) {
        this._promise._progress({
          key: this._values[index + this.length()],
          value
        });
      };
      PropertiesPromiseArray.prototype.shouldCopyValues = function() {
        return false;
      };
      PropertiesPromiseArray.prototype.getActualLength = function(len) {
        return len >> 1;
      };
      function props(promises) {
        var ret2;
        var castValue = tryConvertToPromise(promises);
        if (!isObject2(castValue)) {
          return apiRejection("cannot await properties of a non-object\n\n    See http://goo.gl/OsFKC8\n");
        } else if (castValue instanceof Promise2) {
          ret2 = castValue._then(
            Promise2.props,
            void 0,
            void 0,
            void 0,
            void 0
          );
        } else {
          ret2 = new PropertiesPromiseArray(castValue).promise();
        }
        if (castValue instanceof Promise2) {
          ret2._propagateFrom(castValue, 4);
        }
        return ret2;
      }
      Promise2.prototype.props = function() {
        return props(this);
      };
      Promise2.props = function(promises) {
        return props(promises);
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/race.js
var require_race = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/race.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, INTERNAL, tryConvertToPromise, apiRejection) {
      var isArray = require_util().isArray;
      var raceLater = function(promise) {
        return promise.then(function(array) {
          return race(array, promise);
        });
      };
      function race(promises, parent) {
        var maybePromise = tryConvertToPromise(promises);
        if (maybePromise instanceof Promise2) {
          return raceLater(maybePromise);
        } else if (!isArray(promises)) {
          return apiRejection("expecting an array, a promise or a thenable\n\n    See http://goo.gl/s8MMhc\n");
        }
        var ret2 = new Promise2(INTERNAL);
        if (parent !== void 0) {
          ret2._propagateFrom(parent, 4 | 1);
        }
        var fulfill = ret2._fulfill;
        var reject = ret2._reject;
        for (var i = 0, len = promises.length; i < len; ++i) {
          var val = promises[i];
          if (val === void 0 && !(i in promises)) {
            continue;
          }
          Promise2.cast(val)._then(fulfill, reject, void 0, ret2, null);
        }
        return ret2;
      }
      Promise2.race = function(promises) {
        return race(promises, void 0);
      };
      Promise2.prototype.race = function() {
        return race(this, void 0);
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/reduce.js
var require_reduce = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/reduce.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL) {
      var getDomain = Promise2._getDomain;
      var async = require_async();
      var util = require_util();
      var tryCatch2 = util.tryCatch;
      var errorObj2 = util.errorObj;
      function ReductionPromiseArray(promises, fn, accum, _each) {
        this.constructor$(promises);
        this._promise._captureStackTrace();
        this._preservedValues = _each === INTERNAL ? [] : null;
        this._zerothIsAccum = accum === void 0;
        this._gotAccum = false;
        this._reducingIndex = this._zerothIsAccum ? 1 : 0;
        this._valuesPhase = void 0;
        var maybePromise = tryConvertToPromise(accum, this._promise);
        var rejected = false;
        var isPromise = maybePromise instanceof Promise2;
        if (isPromise) {
          maybePromise = maybePromise._target();
          if (maybePromise._isPending()) {
            maybePromise._proxyPromiseArray(this, -1);
          } else if (maybePromise._isFulfilled()) {
            accum = maybePromise._value();
            this._gotAccum = true;
          } else {
            this._reject(maybePromise._reason());
            rejected = true;
          }
        }
        if (!(isPromise || this._zerothIsAccum))
          this._gotAccum = true;
        var domain = getDomain();
        this._callback = domain === null ? fn : domain.bind(fn);
        this._accum = accum;
        if (!rejected)
          async.invoke(init, this, void 0);
      }
      function init() {
        this._init$(void 0, -5);
      }
      util.inherits(ReductionPromiseArray, PromiseArray);
      ReductionPromiseArray.prototype._init = function() {
      };
      ReductionPromiseArray.prototype._resolveEmptyArray = function() {
        if (this._gotAccum || this._zerothIsAccum) {
          this._resolve(this._preservedValues !== null ? [] : this._accum);
        }
      };
      ReductionPromiseArray.prototype._promiseFulfilled = function(value, index) {
        var values = this._values;
        values[index] = value;
        var length = this.length();
        var preservedValues = this._preservedValues;
        var isEach = preservedValues !== null;
        var gotAccum = this._gotAccum;
        var valuesPhase = this._valuesPhase;
        var valuesPhaseIndex;
        if (!valuesPhase) {
          valuesPhase = this._valuesPhase = new Array(length);
          for (valuesPhaseIndex = 0; valuesPhaseIndex < length; ++valuesPhaseIndex) {
            valuesPhase[valuesPhaseIndex] = 0;
          }
        }
        valuesPhaseIndex = valuesPhase[index];
        if (index === 0 && this._zerothIsAccum) {
          this._accum = value;
          this._gotAccum = gotAccum = true;
          valuesPhase[index] = valuesPhaseIndex === 0 ? 1 : 2;
        } else if (index === -1) {
          this._accum = value;
          this._gotAccum = gotAccum = true;
        } else {
          if (valuesPhaseIndex === 0) {
            valuesPhase[index] = 1;
          } else {
            valuesPhase[index] = 2;
            this._accum = value;
          }
        }
        if (!gotAccum)
          return;
        var callback = this._callback;
        var receiver = this._promise._boundValue();
        var ret2;
        for (var i = this._reducingIndex; i < length; ++i) {
          valuesPhaseIndex = valuesPhase[i];
          if (valuesPhaseIndex === 2) {
            this._reducingIndex = i + 1;
            continue;
          }
          if (valuesPhaseIndex !== 1)
            return;
          value = values[i];
          this._promise._pushContext();
          if (isEach) {
            preservedValues.push(value);
            ret2 = tryCatch2(callback).call(receiver, value, i, length);
          } else {
            ret2 = tryCatch2(callback).call(receiver, this._accum, value, i, length);
          }
          this._promise._popContext();
          if (ret2 === errorObj2)
            return this._reject(ret2.e);
          var maybePromise = tryConvertToPromise(ret2, this._promise);
          if (maybePromise instanceof Promise2) {
            maybePromise = maybePromise._target();
            if (maybePromise._isPending()) {
              valuesPhase[i] = 4;
              return maybePromise._proxyPromiseArray(this, i);
            } else if (maybePromise._isFulfilled()) {
              ret2 = maybePromise._value();
            } else {
              return this._reject(maybePromise._reason());
            }
          }
          this._reducingIndex = i + 1;
          this._accum = ret2;
        }
        this._resolve(isEach ? preservedValues : this._accum);
      };
      function reduce(promises, fn, initialValue, _each) {
        if (typeof fn !== "function")
          return apiRejection("fn must be a function\n\n    See http://goo.gl/916lJJ\n");
        var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
        return array.promise();
      }
      Promise2.prototype.reduce = function(fn, initialValue) {
        return reduce(this, fn, initialValue, null);
      };
      Promise2.reduce = function(promises, fn, initialValue, _each) {
        return reduce(promises, fn, initialValue, _each);
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/settle.js
var require_settle = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/settle.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, PromiseArray) {
      var PromiseInspection = Promise2.PromiseInspection;
      var util = require_util();
      function SettledPromiseArray(values) {
        this.constructor$(values);
      }
      util.inherits(SettledPromiseArray, PromiseArray);
      SettledPromiseArray.prototype._promiseResolved = function(index, inspection) {
        this._values[index] = inspection;
        var totalResolved = ++this._totalResolved;
        if (totalResolved >= this._length) {
          this._resolve(this._values);
        }
      };
      SettledPromiseArray.prototype._promiseFulfilled = function(value, index) {
        var ret2 = new PromiseInspection();
        ret2._bitField = 268435456;
        ret2._settledValue = value;
        this._promiseResolved(index, ret2);
      };
      SettledPromiseArray.prototype._promiseRejected = function(reason, index) {
        var ret2 = new PromiseInspection();
        ret2._bitField = 134217728;
        ret2._settledValue = reason;
        this._promiseResolved(index, ret2);
      };
      Promise2.settle = function(promises) {
        return new SettledPromiseArray(promises).promise();
      };
      Promise2.prototype.settle = function() {
        return new SettledPromiseArray(this).promise();
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/some.js
var require_some = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/some.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, PromiseArray, apiRejection) {
      var util = require_util();
      var RangeError2 = require_errors().RangeError;
      var AggregateError = require_errors().AggregateError;
      var isArray = util.isArray;
      function SomePromiseArray(values) {
        this.constructor$(values);
        this._howMany = 0;
        this._unwrap = false;
        this._initialized = false;
      }
      util.inherits(SomePromiseArray, PromiseArray);
      SomePromiseArray.prototype._init = function() {
        if (!this._initialized) {
          return;
        }
        if (this._howMany === 0) {
          this._resolve([]);
          return;
        }
        this._init$(void 0, -5);
        var isArrayResolved = isArray(this._values);
        if (!this._isResolved() && isArrayResolved && this._howMany > this._canPossiblyFulfill()) {
          this._reject(this._getRangeError(this.length()));
        }
      };
      SomePromiseArray.prototype.init = function() {
        this._initialized = true;
        this._init();
      };
      SomePromiseArray.prototype.setUnwrap = function() {
        this._unwrap = true;
      };
      SomePromiseArray.prototype.howMany = function() {
        return this._howMany;
      };
      SomePromiseArray.prototype.setHowMany = function(count) {
        this._howMany = count;
      };
      SomePromiseArray.prototype._promiseFulfilled = function(value) {
        this._addFulfilled(value);
        if (this._fulfilled() === this.howMany()) {
          this._values.length = this.howMany();
          if (this.howMany() === 1 && this._unwrap) {
            this._resolve(this._values[0]);
          } else {
            this._resolve(this._values);
          }
        }
      };
      SomePromiseArray.prototype._promiseRejected = function(reason) {
        this._addRejected(reason);
        if (this.howMany() > this._canPossiblyFulfill()) {
          var e = new AggregateError();
          for (var i = this.length(); i < this._values.length; ++i) {
            e.push(this._values[i]);
          }
          this._reject(e);
        }
      };
      SomePromiseArray.prototype._fulfilled = function() {
        return this._totalResolved;
      };
      SomePromiseArray.prototype._rejected = function() {
        return this._values.length - this.length();
      };
      SomePromiseArray.prototype._addRejected = function(reason) {
        this._values.push(reason);
      };
      SomePromiseArray.prototype._addFulfilled = function(value) {
        this._values[this._totalResolved++] = value;
      };
      SomePromiseArray.prototype._canPossiblyFulfill = function() {
        return this.length() - this._rejected();
      };
      SomePromiseArray.prototype._getRangeError = function(count) {
        var message = "Input array must contain at least " + this._howMany + " items but contains only " + count + " items";
        return new RangeError2(message);
      };
      SomePromiseArray.prototype._resolveEmptyArray = function() {
        this._reject(this._getRangeError(0));
      };
      function some(promises, howMany) {
        if ((howMany | 0) !== howMany || howMany < 0) {
          return apiRejection("expecting a positive integer\n\n    See http://goo.gl/1wAmHx\n");
        }
        var ret2 = new SomePromiseArray(promises);
        var promise = ret2.promise();
        ret2.setHowMany(howMany);
        ret2.init();
        return promise;
      }
      Promise2.some = function(promises, howMany) {
        return some(promises, howMany);
      };
      Promise2.prototype.some = function(howMany) {
        return some(this, howMany);
      };
      Promise2._SomePromiseArray = SomePromiseArray;
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/promisify.js
var require_promisify = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/promisify.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, INTERNAL) {
      var THIS = {};
      var util = require_util();
      var nodebackForPromise = require_promise_resolver()._nodebackForPromise;
      var withAppended2 = util.withAppended;
      var maybeWrapAsError2 = util.maybeWrapAsError;
      var canEvaluate2 = util.canEvaluate;
      var TypeError2 = require_errors().TypeError;
      var defaultSuffix = "Async";
      var defaultPromisified = { __isPromisified__: true };
      var noCopyProps = [
        "arity",
        "length",
        "name",
        "arguments",
        "caller",
        "callee",
        "prototype",
        "__isPromisified__"
      ];
      var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");
      var defaultFilter = function(name) {
        return util.isIdentifier(name) && name.charAt(0) !== "_" && name !== "constructor";
      };
      function propsFilter(key) {
        return !noCopyPropsPattern.test(key);
      }
      function isPromisified(fn) {
        try {
          return fn.__isPromisified__ === true;
        } catch (e) {
          return false;
        }
      }
      function hasPromisified(obj2, key, suffix) {
        var val = util.getDataPropertyOrDefault(
          obj2,
          key + suffix,
          defaultPromisified
        );
        return val ? isPromisified(val) : false;
      }
      function checkValid(ret2, suffix, suffixRegexp) {
        for (var i = 0; i < ret2.length; i += 2) {
          var key = ret2[i];
          if (suffixRegexp.test(key)) {
            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
            for (var j = 0; j < ret2.length; j += 2) {
              if (ret2[j] === keyWithoutAsyncSuffix) {
                throw new TypeError2("Cannot promisify an API that has normal methods with '%s'-suffix\n\n    See http://goo.gl/iWrZbw\n".replace("%s", suffix));
              }
            }
          }
        }
      }
      function promisifiableMethods(obj2, suffix, suffixRegexp, filter) {
        var keys = util.inheritedDataKeys(obj2);
        var ret2 = [];
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          var value = obj2[key];
          var passesDefaultFilter = filter === defaultFilter ? true : defaultFilter(key, value, obj2);
          if (typeof value === "function" && !isPromisified(value) && !hasPromisified(obj2, key, suffix) && filter(key, value, obj2, passesDefaultFilter)) {
            ret2.push(key, value);
          }
        }
        checkValid(ret2, suffix, suffixRegexp);
        return ret2;
      }
      var escapeIdentRegex = function(str) {
        return str.replace(/([$])/, "\\$");
      };
      var makeNodePromisifiedEval;
      if (true) {
        var switchCaseArgumentOrder = function(likelyArgumentCount) {
          var ret2 = [likelyArgumentCount];
          var min = Math.max(0, likelyArgumentCount - 1 - 3);
          for (var i = likelyArgumentCount - 1; i >= min; --i) {
            ret2.push(i);
          }
          for (var i = likelyArgumentCount + 1; i <= 3; ++i) {
            ret2.push(i);
          }
          return ret2;
        };
        var argumentSequence = function(argumentCount) {
          return util.filledRange(argumentCount, "_arg", "");
        };
        var parameterDeclaration = function(parameterCount2) {
          return util.filledRange(
            Math.max(parameterCount2, 3),
            "_arg",
            ""
          );
        };
        var parameterCount = function(fn) {
          if (typeof fn.length === "number") {
            return Math.max(Math.min(fn.length, 1023 + 1), 0);
          }
          return 0;
        };
        makeNodePromisifiedEval = function(callback, receiver, originalName, fn) {
          var newParameterCount = Math.max(0, parameterCount(fn) - 1);
          var argumentOrder = switchCaseArgumentOrder(newParameterCount);
          var shouldProxyThis = typeof callback === "string" || receiver === THIS;
          function generateCallForArgumentCount(count) {
            var args = argumentSequence(count).join(", ");
            var comma = count > 0 ? ", " : "";
            var ret2;
            if (shouldProxyThis) {
              ret2 = "ret = callback.call(this, {{args}}, nodeback); break;\n";
            } else {
              ret2 = receiver === void 0 ? "ret = callback({{args}}, nodeback); break;\n" : "ret = callback.call(receiver, {{args}}, nodeback); break;\n";
            }
            return ret2.replace("{{args}}", args).replace(", ", comma);
          }
          function generateArgumentSwitchCase() {
            var ret2 = "";
            for (var i = 0; i < argumentOrder.length; ++i) {
              ret2 += "case " + argumentOrder[i] + ":" + generateCallForArgumentCount(argumentOrder[i]);
            }
            ret2 += "                                                             \n        default:                                                             \n            var args = new Array(len + 1);                                   \n            var i = 0;                                                       \n            for (var i = 0; i < len; ++i) {                                  \n               args[i] = arguments[i];                                       \n            }                                                                \n            args[i] = nodeback;                                              \n            [CodeForCall]                                                    \n            break;                                                           \n        ".replace("[CodeForCall]", shouldProxyThis ? "ret = callback.apply(this, args);\n" : "ret = callback.apply(receiver, args);\n");
            return ret2;
          }
          var getFunctionCode = typeof callback === "string" ? "this != null ? this['" + callback + "'] : fn" : "fn";
          return new Function(
            "Promise",
            "fn",
            "receiver",
            "withAppended",
            "maybeWrapAsError",
            "nodebackForPromise",
            "tryCatch",
            "errorObj",
            "notEnumerableProp",
            "INTERNAL",
            "'use strict';                            \n        var ret = function (Parameters) {                                    \n            'use strict';                                                    \n            var len = arguments.length;                                      \n            var promise = new Promise(INTERNAL);                             \n            promise._captureStackTrace();                                    \n            var nodeback = nodebackForPromise(promise);                      \n            var ret;                                                         \n            var callback = tryCatch([GetFunctionCode]);                      \n            switch(len) {                                                    \n                [CodeForSwitchCase]                                          \n            }                                                                \n            if (ret === errorObj) {                                          \n                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n            }                                                                \n            return promise;                                                  \n        };                                                                   \n        notEnumerableProp(ret, '__isPromisified__', true);                   \n        return ret;                                                          \n        ".replace("Parameters", parameterDeclaration(newParameterCount)).replace("[CodeForSwitchCase]", generateArgumentSwitchCase()).replace("[GetFunctionCode]", getFunctionCode)
          )(
            Promise2,
            fn,
            receiver,
            withAppended2,
            maybeWrapAsError2,
            nodebackForPromise,
            util.tryCatch,
            util.errorObj,
            util.notEnumerableProp,
            INTERNAL
          );
        };
      }
      function makeNodePromisifiedClosure(callback, receiver, _, fn) {
        var defaultThis = /* @__PURE__ */ function() {
          return this;
        }();
        var method = callback;
        if (typeof method === "string") {
          callback = fn;
        }
        function promisified() {
          var _receiver = receiver;
          if (receiver === THIS)
            _receiver = this;
          var promise = new Promise2(INTERNAL);
          promise._captureStackTrace();
          var cb = typeof method === "string" && this !== defaultThis ? this[method] : callback;
          var fn2 = nodebackForPromise(promise);
          try {
            cb.apply(_receiver, withAppended2(arguments, fn2));
          } catch (e) {
            promise._rejectCallback(maybeWrapAsError2(e), true, true);
          }
          return promise;
        }
        util.notEnumerableProp(promisified, "__isPromisified__", true);
        return promisified;
      }
      var makeNodePromisified = canEvaluate2 ? makeNodePromisifiedEval : makeNodePromisifiedClosure;
      function promisifyAll(obj2, suffix, filter, promisifier) {
        var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
        var methods = promisifiableMethods(obj2, suffix, suffixRegexp, filter);
        for (var i = 0, len = methods.length; i < len; i += 2) {
          var key = methods[i];
          var fn = methods[i + 1];
          var promisifiedKey = key + suffix;
          if (promisifier === makeNodePromisified) {
            obj2[promisifiedKey] = makeNodePromisified(key, THIS, key, fn, suffix);
          } else {
            var promisified = promisifier(fn, function() {
              return makeNodePromisified(key, THIS, key, fn, suffix);
            });
            util.notEnumerableProp(promisified, "__isPromisified__", true);
            obj2[promisifiedKey] = promisified;
          }
        }
        util.toFastProperties(obj2);
        return obj2;
      }
      function promisify(callback, receiver) {
        return makeNodePromisified(callback, receiver, void 0, callback);
      }
      Promise2.promisify = function(fn, receiver) {
        if (typeof fn !== "function") {
          throw new TypeError2("fn must be a function\n\n    See http://goo.gl/916lJJ\n");
        }
        if (isPromisified(fn)) {
          return fn;
        }
        var ret2 = promisify(fn, arguments.length < 2 ? THIS : receiver);
        util.copyDescriptors(fn, ret2, propsFilter);
        return ret2;
      };
      Promise2.promisifyAll = function(target, options) {
        if (typeof target !== "function" && typeof target !== "object") {
          throw new TypeError2("the target of promisifyAll must be an object or a function\n\n    See http://goo.gl/9ITlV0\n");
        }
        options = Object(options);
        var suffix = options.suffix;
        if (typeof suffix !== "string")
          suffix = defaultSuffix;
        var filter = options.filter;
        if (typeof filter !== "function")
          filter = defaultFilter;
        var promisifier = options.promisifier;
        if (typeof promisifier !== "function")
          promisifier = makeNodePromisified;
        if (!util.isIdentifier(suffix)) {
          throw new RangeError("suffix must be a valid identifier\n\n    See http://goo.gl/8FZo5V\n");
        }
        var keys = util.inheritedDataKeys(target);
        for (var i = 0; i < keys.length; ++i) {
          var value = target[keys[i]];
          if (keys[i] !== "constructor" && util.isClass(value)) {
            promisifyAll(value.prototype, suffix, filter, promisifier);
            promisifyAll(value, suffix, filter, promisifier);
          }
        }
        return promisifyAll(target, suffix, filter, promisifier);
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/any.js
var require_any = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/any.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2) {
      var SomePromiseArray = Promise2._SomePromiseArray;
      function any(promises) {
        var ret2 = new SomePromiseArray(promises);
        var promise = ret2.promise();
        ret2.setHowMany(1);
        ret2.setUnwrap();
        ret2.init();
        return promise;
      }
      Promise2.any = function(promises) {
        return any(promises);
      };
      Promise2.prototype.any = function() {
        return any(this);
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/each.js
var require_each = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/each.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, INTERNAL) {
      var PromiseReduce = Promise2.reduce;
      Promise2.prototype.each = function(fn) {
        return PromiseReduce(this, fn, null, INTERNAL);
      };
      Promise2.each = function(promises, fn) {
        return PromiseReduce(promises, fn, null, INTERNAL);
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/timers.js
var require_timers = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/timers.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, INTERNAL) {
      var util = require_util();
      var TimeoutError = Promise2.TimeoutError;
      var afterTimeout = function(promise, message) {
        if (!promise.isPending())
          return;
        var err;
        if (!util.isPrimitive(message) && message instanceof Error) {
          err = message;
        } else {
          if (typeof message !== "string") {
            message = "operation timed out";
          }
          err = new TimeoutError(message);
        }
        util.markAsOriginatingFromRejection(err);
        promise._attachExtraTrace(err);
        promise._cancel(err);
      };
      var afterValue = function(value) {
        return delay(+this).thenReturn(value);
      };
      var delay = Promise2.delay = function(value, ms) {
        if (ms === void 0) {
          ms = value;
          value = void 0;
          var ret2 = new Promise2(INTERNAL);
          setTimeout(function() {
            ret2._fulfill();
          }, ms);
          return ret2;
        }
        ms = +ms;
        return Promise2.resolve(value)._then(afterValue, null, null, ms, void 0);
      };
      Promise2.prototype.delay = function(ms) {
        return delay(this, ms);
      };
      function successClear(value) {
        var handle = this;
        if (handle instanceof Number)
          handle = +handle;
        clearTimeout(handle);
        return value;
      }
      function failureClear(reason) {
        var handle = this;
        if (handle instanceof Number)
          handle = +handle;
        clearTimeout(handle);
        throw reason;
      }
      Promise2.prototype.timeout = function(ms, message) {
        ms = +ms;
        var ret2 = this.then().cancellable();
        ret2._cancellationParent = this;
        var handle = setTimeout(function timeoutTimeout() {
          afterTimeout(ret2, message);
        }, ms);
        return ret2._then(successClear, failureClear, void 0, handle, void 0);
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/filter.js
var require_filter = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/filter.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Promise2, INTERNAL) {
      var PromiseMap = Promise2.map;
      Promise2.prototype.filter = function(fn, options) {
        return PromiseMap(this, fn, options, INTERNAL);
      };
      Promise2.filter = function(promises, fn, options) {
        return PromiseMap(promises, fn, options, INTERNAL);
      };
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/promise.js
var require_promise = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/promise.js"(exports2, module2) {
    "use strict";
    module2.exports = function() {
      var makeSelfResolutionError = function() {
        return new TypeError2("circular promise resolution chain\n\n    See http://goo.gl/LhFpo0\n");
      };
      var reflect = function() {
        return new Promise2.PromiseInspection(this._target());
      };
      var apiRejection = function(msg) {
        return Promise2.reject(new TypeError2(msg));
      };
      var util = require_util();
      var getDomain;
      if (util.isNode) {
        getDomain = function() {
          var ret2 = process.domain;
          if (ret2 === void 0)
            ret2 = null;
          return ret2;
        };
      } else {
        getDomain = function() {
          return null;
        };
      }
      util.notEnumerableProp(Promise2, "_getDomain", getDomain);
      var UNDEFINED_BINDING = {};
      var async = require_async();
      var errors = require_errors();
      var TypeError2 = Promise2.TypeError = errors.TypeError;
      Promise2.RangeError = errors.RangeError;
      Promise2.CancellationError = errors.CancellationError;
      Promise2.TimeoutError = errors.TimeoutError;
      Promise2.OperationalError = errors.OperationalError;
      Promise2.RejectionError = errors.OperationalError;
      Promise2.AggregateError = errors.AggregateError;
      var INTERNAL = function() {
      };
      var APPLY = {};
      var NEXT_FILTER = { e: null };
      var tryConvertToPromise = require_thenables()(Promise2, INTERNAL);
      var PromiseArray = require_promise_array()(
        Promise2,
        INTERNAL,
        tryConvertToPromise,
        apiRejection
      );
      var CapturedTrace = require_captured_trace()();
      var isDebugging = require_debuggability()(Promise2, CapturedTrace);
      var createContext = require_context()(Promise2, CapturedTrace, isDebugging);
      var CatchFilter = require_catch_filter()(NEXT_FILTER);
      var PromiseResolver = require_promise_resolver();
      var nodebackForPromise = PromiseResolver._nodebackForPromise;
      var errorObj2 = util.errorObj;
      var tryCatch2 = util.tryCatch;
      function Promise2(resolver) {
        if (typeof resolver !== "function") {
          throw new TypeError2("the promise constructor requires a resolver function\n\n    See http://goo.gl/EC22Yn\n");
        }
        if (this.constructor !== Promise2) {
          throw new TypeError2("the promise constructor cannot be invoked directly\n\n    See http://goo.gl/KsIlge\n");
        }
        this._bitField = 0;
        this._fulfillmentHandler0 = void 0;
        this._rejectionHandler0 = void 0;
        this._progressHandler0 = void 0;
        this._promise0 = void 0;
        this._receiver0 = void 0;
        this._settledValue = void 0;
        if (resolver !== INTERNAL)
          this._resolveFromResolver(resolver);
      }
      Promise2.prototype.toString = function() {
        return "[object Promise]";
      };
      Promise2.prototype.caught = Promise2.prototype["catch"] = function(fn) {
        var len = arguments.length;
        if (len > 1) {
          var catchInstances = new Array(len - 1), j = 0, i;
          for (i = 0; i < len - 1; ++i) {
            var item = arguments[i];
            if (typeof item === "function") {
              catchInstances[j++] = item;
            } else {
              return Promise2.reject(
                new TypeError2("Catch filter must inherit from Error or be a simple predicate function\n\n    See http://goo.gl/o84o68\n")
              );
            }
          }
          catchInstances.length = j;
          fn = arguments[i];
          var catchFilter = new CatchFilter(catchInstances, fn, this);
          return this._then(
            void 0,
            catchFilter.doFilter,
            void 0,
            catchFilter,
            void 0
          );
        }
        return this._then(void 0, fn, void 0, void 0, void 0);
      };
      Promise2.prototype.reflect = function() {
        return this._then(reflect, reflect, void 0, this, void 0);
      };
      Promise2.prototype.then = function(didFulfill, didReject, didProgress) {
        if (isDebugging() && arguments.length > 0 && typeof didFulfill !== "function" && typeof didReject !== "function") {
          var msg = ".then() only accepts functions but was passed: " + util.classString(didFulfill);
          if (arguments.length > 1) {
            msg += ", " + util.classString(didReject);
          }
          this._warn(msg);
        }
        return this._then(
          didFulfill,
          didReject,
          didProgress,
          void 0,
          void 0
        );
      };
      Promise2.prototype.done = function(didFulfill, didReject, didProgress) {
        var promise = this._then(
          didFulfill,
          didReject,
          didProgress,
          void 0,
          void 0
        );
        promise._setIsFinal();
      };
      Promise2.prototype.spread = function(didFulfill, didReject) {
        return this.all()._then(didFulfill, didReject, void 0, APPLY, void 0);
      };
      Promise2.prototype.isCancellable = function() {
        return !this.isResolved() && this._cancellable();
      };
      Promise2.prototype.toJSON = function() {
        var ret2 = {
          isFulfilled: false,
          isRejected: false,
          fulfillmentValue: void 0,
          rejectionReason: void 0
        };
        if (this.isFulfilled()) {
          ret2.fulfillmentValue = this.value();
          ret2.isFulfilled = true;
        } else if (this.isRejected()) {
          ret2.rejectionReason = this.reason();
          ret2.isRejected = true;
        }
        return ret2;
      };
      Promise2.prototype.all = function() {
        return new PromiseArray(this).promise();
      };
      Promise2.prototype.error = function(fn) {
        return this.caught(util.originatesFromRejection, fn);
      };
      Promise2.getNewLibraryCopy = module2.exports;
      Promise2.is = function(val) {
        return val instanceof Promise2;
      };
      Promise2.fromNode = function(fn) {
        var ret2 = new Promise2(INTERNAL);
        var result = tryCatch2(fn)(nodebackForPromise(ret2));
        if (result === errorObj2) {
          ret2._rejectCallback(result.e, true, true);
        }
        return ret2;
      };
      Promise2.all = function(promises) {
        return new PromiseArray(promises).promise();
      };
      Promise2.defer = Promise2.pending = function() {
        var promise = new Promise2(INTERNAL);
        return new PromiseResolver(promise);
      };
      Promise2.cast = function(obj2) {
        var ret2 = tryConvertToPromise(obj2);
        if (!(ret2 instanceof Promise2)) {
          var val = ret2;
          ret2 = new Promise2(INTERNAL);
          ret2._fulfillUnchecked(val);
        }
        return ret2;
      };
      Promise2.resolve = Promise2.fulfilled = Promise2.cast;
      Promise2.reject = Promise2.rejected = function(reason) {
        var ret2 = new Promise2(INTERNAL);
        ret2._captureStackTrace();
        ret2._rejectCallback(reason, true);
        return ret2;
      };
      Promise2.setScheduler = function(fn) {
        if (typeof fn !== "function")
          throw new TypeError2("fn must be a function\n\n    See http://goo.gl/916lJJ\n");
        var prev = async._schedule;
        async._schedule = fn;
        return prev;
      };
      Promise2.prototype._then = function(didFulfill, didReject, didProgress, receiver, internalData) {
        var haveInternalData = internalData !== void 0;
        var ret2 = haveInternalData ? internalData : new Promise2(INTERNAL);
        if (!haveInternalData) {
          ret2._propagateFrom(this, 4 | 1);
          ret2._captureStackTrace();
        }
        var target = this._target();
        if (target !== this) {
          if (receiver === void 0)
            receiver = this._boundTo;
          if (!haveInternalData)
            ret2._setIsMigrated();
        }
        var callbackIndex = target._addCallbacks(
          didFulfill,
          didReject,
          didProgress,
          ret2,
          receiver,
          getDomain()
        );
        if (target._isResolved() && !target._isSettlePromisesQueued()) {
          async.invoke(
            target._settlePromiseAtPostResolution,
            target,
            callbackIndex
          );
        }
        return ret2;
      };
      Promise2.prototype._settlePromiseAtPostResolution = function(index) {
        if (this._isRejectionUnhandled())
          this._unsetRejectionIsUnhandled();
        this._settlePromiseAt(index);
      };
      Promise2.prototype._length = function() {
        return this._bitField & 131071;
      };
      Promise2.prototype._isFollowingOrFulfilledOrRejected = function() {
        return (this._bitField & 939524096) > 0;
      };
      Promise2.prototype._isFollowing = function() {
        return (this._bitField & 536870912) === 536870912;
      };
      Promise2.prototype._setLength = function(len) {
        this._bitField = this._bitField & -131072 | len & 131071;
      };
      Promise2.prototype._setFulfilled = function() {
        this._bitField = this._bitField | 268435456;
      };
      Promise2.prototype._setRejected = function() {
        this._bitField = this._bitField | 134217728;
      };
      Promise2.prototype._setFollowing = function() {
        this._bitField = this._bitField | 536870912;
      };
      Promise2.prototype._setIsFinal = function() {
        this._bitField = this._bitField | 33554432;
      };
      Promise2.prototype._isFinal = function() {
        return (this._bitField & 33554432) > 0;
      };
      Promise2.prototype._cancellable = function() {
        return (this._bitField & 67108864) > 0;
      };
      Promise2.prototype._setCancellable = function() {
        this._bitField = this._bitField | 67108864;
      };
      Promise2.prototype._unsetCancellable = function() {
        this._bitField = this._bitField & ~67108864;
      };
      Promise2.prototype._setIsMigrated = function() {
        this._bitField = this._bitField | 4194304;
      };
      Promise2.prototype._unsetIsMigrated = function() {
        this._bitField = this._bitField & ~4194304;
      };
      Promise2.prototype._isMigrated = function() {
        return (this._bitField & 4194304) > 0;
      };
      Promise2.prototype._receiverAt = function(index) {
        var ret2 = index === 0 ? this._receiver0 : this[index * 5 - 5 + 4];
        if (ret2 === UNDEFINED_BINDING) {
          return void 0;
        } else if (ret2 === void 0 && this._isBound()) {
          return this._boundValue();
        }
        return ret2;
      };
      Promise2.prototype._promiseAt = function(index) {
        return index === 0 ? this._promise0 : this[index * 5 - 5 + 3];
      };
      Promise2.prototype._fulfillmentHandlerAt = function(index) {
        return index === 0 ? this._fulfillmentHandler0 : this[index * 5 - 5 + 0];
      };
      Promise2.prototype._rejectionHandlerAt = function(index) {
        return index === 0 ? this._rejectionHandler0 : this[index * 5 - 5 + 1];
      };
      Promise2.prototype._boundValue = function() {
        var ret2 = this._boundTo;
        if (ret2 !== void 0) {
          if (ret2 instanceof Promise2) {
            if (ret2.isFulfilled()) {
              return ret2.value();
            } else {
              return void 0;
            }
          }
        }
        return ret2;
      };
      Promise2.prototype._migrateCallbacks = function(follower, index) {
        var fulfill = follower._fulfillmentHandlerAt(index);
        var reject = follower._rejectionHandlerAt(index);
        var progress = follower._progressHandlerAt(index);
        var promise = follower._promiseAt(index);
        var receiver = follower._receiverAt(index);
        if (promise instanceof Promise2)
          promise._setIsMigrated();
        if (receiver === void 0)
          receiver = UNDEFINED_BINDING;
        this._addCallbacks(fulfill, reject, progress, promise, receiver, null);
      };
      Promise2.prototype._addCallbacks = function(fulfill, reject, progress, promise, receiver, domain) {
        var index = this._length();
        if (index >= 131071 - 5) {
          index = 0;
          this._setLength(0);
        }
        if (index === 0) {
          this._promise0 = promise;
          if (receiver !== void 0)
            this._receiver0 = receiver;
          if (typeof fulfill === "function" && !this._isCarryingStackTrace()) {
            this._fulfillmentHandler0 = domain === null ? fulfill : domain.bind(fulfill);
          }
          if (typeof reject === "function") {
            this._rejectionHandler0 = domain === null ? reject : domain.bind(reject);
          }
          if (typeof progress === "function") {
            this._progressHandler0 = domain === null ? progress : domain.bind(progress);
          }
        } else {
          var base = index * 5 - 5;
          this[base + 3] = promise;
          this[base + 4] = receiver;
          if (typeof fulfill === "function") {
            this[base + 0] = domain === null ? fulfill : domain.bind(fulfill);
          }
          if (typeof reject === "function") {
            this[base + 1] = domain === null ? reject : domain.bind(reject);
          }
          if (typeof progress === "function") {
            this[base + 2] = domain === null ? progress : domain.bind(progress);
          }
        }
        this._setLength(index + 1);
        return index;
      };
      Promise2.prototype._setProxyHandlers = function(receiver, promiseSlotValue) {
        var index = this._length();
        if (index >= 131071 - 5) {
          index = 0;
          this._setLength(0);
        }
        if (index === 0) {
          this._promise0 = promiseSlotValue;
          this._receiver0 = receiver;
        } else {
          var base = index * 5 - 5;
          this[base + 3] = promiseSlotValue;
          this[base + 4] = receiver;
        }
        this._setLength(index + 1);
      };
      Promise2.prototype._proxyPromiseArray = function(promiseArray, index) {
        this._setProxyHandlers(promiseArray, index);
      };
      Promise2.prototype._resolveCallback = function(value, shouldBind) {
        if (this._isFollowingOrFulfilledOrRejected())
          return;
        if (value === this)
          return this._rejectCallback(makeSelfResolutionError(), false, true);
        var maybePromise = tryConvertToPromise(value, this);
        if (!(maybePromise instanceof Promise2))
          return this._fulfill(value);
        var propagationFlags = 1 | (shouldBind ? 4 : 0);
        this._propagateFrom(maybePromise, propagationFlags);
        var promise = maybePromise._target();
        if (promise._isPending()) {
          var len = this._length();
          for (var i = 0; i < len; ++i) {
            promise._migrateCallbacks(this, i);
          }
          this._setFollowing();
          this._setLength(0);
          this._setFollowee(promise);
        } else if (promise._isFulfilled()) {
          this._fulfillUnchecked(promise._value());
        } else {
          this._rejectUnchecked(
            promise._reason(),
            promise._getCarriedStackTrace()
          );
        }
      };
      Promise2.prototype._rejectCallback = function(reason, synchronous, shouldNotMarkOriginatingFromRejection) {
        if (!shouldNotMarkOriginatingFromRejection) {
          util.markAsOriginatingFromRejection(reason);
        }
        var trace = util.ensureErrorObject(reason);
        var hasStack = trace === reason;
        this._attachExtraTrace(trace, synchronous ? hasStack : false);
        this._reject(reason, hasStack ? void 0 : trace);
      };
      Promise2.prototype._resolveFromResolver = function(resolver) {
        var promise = this;
        this._captureStackTrace();
        this._pushContext();
        var synchronous = true;
        var r = tryCatch2(resolver)(function(value) {
          if (promise === null)
            return;
          promise._resolveCallback(value);
          promise = null;
        }, function(reason) {
          if (promise === null)
            return;
          promise._rejectCallback(reason, synchronous);
          promise = null;
        });
        synchronous = false;
        this._popContext();
        if (r !== void 0 && r === errorObj2 && promise !== null) {
          promise._rejectCallback(r.e, true, true);
          promise = null;
        }
      };
      Promise2.prototype._settlePromiseFromHandler = function(handler, receiver, value, promise) {
        if (promise._isRejected())
          return;
        promise._pushContext();
        var x;
        if (receiver === APPLY && !this._isRejected()) {
          x = tryCatch2(handler).apply(this._boundValue(), value);
        } else {
          x = tryCatch2(handler).call(receiver, value);
        }
        promise._popContext();
        if (x === errorObj2 || x === promise || x === NEXT_FILTER) {
          var err = x === promise ? makeSelfResolutionError() : x.e;
          promise._rejectCallback(err, false, true);
        } else {
          promise._resolveCallback(x);
        }
      };
      Promise2.prototype._target = function() {
        var ret2 = this;
        while (ret2._isFollowing())
          ret2 = ret2._followee();
        return ret2;
      };
      Promise2.prototype._followee = function() {
        return this._rejectionHandler0;
      };
      Promise2.prototype._setFollowee = function(promise) {
        this._rejectionHandler0 = promise;
      };
      Promise2.prototype._cleanValues = function() {
        if (this._cancellable()) {
          this._cancellationParent = void 0;
        }
      };
      Promise2.prototype._propagateFrom = function(parent, flags) {
        if ((flags & 1) > 0 && parent._cancellable()) {
          this._setCancellable();
          this._cancellationParent = parent;
        }
        if ((flags & 4) > 0 && parent._isBound()) {
          this._setBoundTo(parent._boundTo);
        }
      };
      Promise2.prototype._fulfill = function(value) {
        if (this._isFollowingOrFulfilledOrRejected())
          return;
        this._fulfillUnchecked(value);
      };
      Promise2.prototype._reject = function(reason, carriedStackTrace) {
        if (this._isFollowingOrFulfilledOrRejected())
          return;
        this._rejectUnchecked(reason, carriedStackTrace);
      };
      Promise2.prototype._settlePromiseAt = function(index) {
        var promise = this._promiseAt(index);
        var isPromise = promise instanceof Promise2;
        if (isPromise && promise._isMigrated()) {
          promise._unsetIsMigrated();
          return async.invoke(this._settlePromiseAt, this, index);
        }
        var handler = this._isFulfilled() ? this._fulfillmentHandlerAt(index) : this._rejectionHandlerAt(index);
        var carriedStackTrace = this._isCarryingStackTrace() ? this._getCarriedStackTrace() : void 0;
        var value = this._settledValue;
        var receiver = this._receiverAt(index);
        this._clearCallbackDataAtIndex(index);
        if (typeof handler === "function") {
          if (!isPromise) {
            handler.call(receiver, value, promise);
          } else {
            this._settlePromiseFromHandler(handler, receiver, value, promise);
          }
        } else if (receiver instanceof PromiseArray) {
          if (!receiver._isResolved()) {
            if (this._isFulfilled()) {
              receiver._promiseFulfilled(value, promise);
            } else {
              receiver._promiseRejected(value, promise);
            }
          }
        } else if (isPromise) {
          if (this._isFulfilled()) {
            promise._fulfill(value);
          } else {
            promise._reject(value, carriedStackTrace);
          }
        }
        if (index >= 4 && (index & 31) === 4)
          async.invokeLater(this._setLength, this, 0);
      };
      Promise2.prototype._clearCallbackDataAtIndex = function(index) {
        if (index === 0) {
          if (!this._isCarryingStackTrace()) {
            this._fulfillmentHandler0 = void 0;
          }
          this._rejectionHandler0 = this._progressHandler0 = this._receiver0 = this._promise0 = void 0;
        } else {
          var base = index * 5 - 5;
          this[base + 3] = this[base + 4] = this[base + 0] = this[base + 1] = this[base + 2] = void 0;
        }
      };
      Promise2.prototype._isSettlePromisesQueued = function() {
        return (this._bitField & -1073741824) === -1073741824;
      };
      Promise2.prototype._setSettlePromisesQueued = function() {
        this._bitField = this._bitField | -1073741824;
      };
      Promise2.prototype._unsetSettlePromisesQueued = function() {
        this._bitField = this._bitField & ~-1073741824;
      };
      Promise2.prototype._queueSettlePromises = function() {
        async.settlePromises(this);
        this._setSettlePromisesQueued();
      };
      Promise2.prototype._fulfillUnchecked = function(value) {
        if (value === this) {
          var err = makeSelfResolutionError();
          this._attachExtraTrace(err);
          return this._rejectUnchecked(err, void 0);
        }
        this._setFulfilled();
        this._settledValue = value;
        this._cleanValues();
        if (this._length() > 0) {
          this._queueSettlePromises();
        }
      };
      Promise2.prototype._rejectUncheckedCheckError = function(reason) {
        var trace = util.ensureErrorObject(reason);
        this._rejectUnchecked(reason, trace === reason ? void 0 : trace);
      };
      Promise2.prototype._rejectUnchecked = function(reason, trace) {
        if (reason === this) {
          var err = makeSelfResolutionError();
          this._attachExtraTrace(err);
          return this._rejectUnchecked(err);
        }
        this._setRejected();
        this._settledValue = reason;
        this._cleanValues();
        if (this._isFinal()) {
          async.throwLater(function(e) {
            if ("stack" in e) {
              async.invokeFirst(
                CapturedTrace.unhandledRejection,
                void 0,
                e
              );
            }
            throw e;
          }, trace === void 0 ? reason : trace);
          return;
        }
        if (trace !== void 0 && trace !== reason) {
          this._setCarriedStackTrace(trace);
        }
        if (this._length() > 0) {
          this._queueSettlePromises();
        } else {
          this._ensurePossibleRejectionHandled();
        }
      };
      Promise2.prototype._settlePromises = function() {
        this._unsetSettlePromisesQueued();
        var len = this._length();
        for (var i = 0; i < len; i++) {
          this._settlePromiseAt(i);
        }
      };
      util.notEnumerableProp(
        Promise2,
        "_makeSelfResolutionError",
        makeSelfResolutionError
      );
      require_progress()(Promise2, PromiseArray);
      require_method()(Promise2, INTERNAL, tryConvertToPromise, apiRejection);
      require_bind()(Promise2, INTERNAL, tryConvertToPromise);
      require_finally()(Promise2, NEXT_FILTER, tryConvertToPromise);
      require_direct_resolve()(Promise2);
      require_synchronous_inspection()(Promise2);
      require_join()(Promise2, PromiseArray, tryConvertToPromise, INTERNAL);
      Promise2.version = "2.11.0";
      Promise2.Promise = Promise2;
      require_map()(Promise2, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL);
      require_cancel()(Promise2);
      require_using()(Promise2, apiRejection, tryConvertToPromise, createContext);
      require_generators()(Promise2, apiRejection, INTERNAL, tryConvertToPromise);
      require_nodeify()(Promise2);
      require_call_get()(Promise2);
      require_props()(Promise2, PromiseArray, tryConvertToPromise, apiRejection);
      require_race()(Promise2, INTERNAL, tryConvertToPromise, apiRejection);
      require_reduce()(Promise2, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL);
      require_settle()(Promise2, PromiseArray);
      require_some()(Promise2, PromiseArray, apiRejection);
      require_promisify()(Promise2, INTERNAL);
      require_any()(Promise2);
      require_each()(Promise2, INTERNAL);
      require_timers()(Promise2, INTERNAL);
      require_filter()(Promise2, INTERNAL);
      util.toFastProperties(Promise2);
      util.toFastProperties(Promise2.prototype);
      function fillTypes(value) {
        var p = new Promise2(INTERNAL);
        p._fulfillmentHandler0 = value;
        p._rejectionHandler0 = value;
        p._progressHandler0 = value;
        p._promise0 = value;
        p._receiver0 = value;
        p._settledValue = value;
      }
      fillTypes({ a: 1 });
      fillTypes({ b: 2 });
      fillTypes({ c: 3 });
      fillTypes(1);
      fillTypes(function() {
      });
      fillTypes(void 0);
      fillTypes(false);
      fillTypes(new Promise2(INTERNAL));
      CapturedTrace.setBounds(async.firstLineError, util.lastLineError);
      return Promise2;
    };
  }
});

// node_modules/stripe/node_modules/bluebird/js/main/bluebird.js
var require_bluebird = __commonJS({
  "node_modules/stripe/node_modules/bluebird/js/main/bluebird.js"(exports2, module2) {
    "use strict";
    var old;
    if (typeof Promise !== "undefined")
      old = Promise;
    function noConflict() {
      try {
        if (Promise === bluebird)
          Promise = old;
      } catch (e) {
      }
      return bluebird;
    }
    var bluebird = require_promise()();
    bluebird.noConflict = noConflict;
    module2.exports = bluebird;
  }
});

// node_modules/stripe/node_modules/qs/lib/utils.js
var require_utils = __commonJS({
  "node_modules/stripe/node_modules/qs/lib/utils.js"(exports2) {
    "use strict";
    var hexTable = function() {
      var array = new Array(256);
      for (var i = 0; i < 256; ++i) {
        array[i] = "%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase();
      }
      return array;
    }();
    var has = Object.prototype.hasOwnProperty;
    exports2.arrayToObject = function(source, options) {
      var obj2 = options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
      for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== "undefined") {
          obj2[i] = source[i];
        }
      }
      return obj2;
    };
    exports2.merge = function(target, source, options) {
      if (!source) {
        return target;
      }
      if (typeof source !== "object") {
        if (Array.isArray(target)) {
          target.push(source);
        } else if (typeof target === "object") {
          if (options.plainObjects || options.allowPrototypes || !has.call(Object.prototype, source)) {
            target[source] = true;
          }
        } else {
          return [target, source];
        }
        return target;
      }
      if (typeof target !== "object") {
        return [target].concat(source);
      }
      var mergeTarget = target;
      if (Array.isArray(target) && !Array.isArray(source)) {
        mergeTarget = exports2.arrayToObject(target, options);
      }
      return Object.keys(source).reduce(function(acc, key) {
        var value = source[key];
        if (has.call(acc, key)) {
          acc[key] = exports2.merge(acc[key], value, options);
        } else {
          acc[key] = value;
        }
        return acc;
      }, mergeTarget);
    };
    exports2.decode = function(str) {
      try {
        return decodeURIComponent(str.replace(/\+/g, " "));
      } catch (e) {
        return str;
      }
    };
    exports2.encode = function(str) {
      if (str.length === 0) {
        return str;
      }
      var string = typeof str === "string" ? str : String(str);
      var out = "";
      for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);
        if (c === 45 || // -
        c === 46 || // .
        c === 95 || // _
        c === 126 || // ~
        c >= 48 && c <= 57 || // 0-9
        c >= 65 && c <= 90 || // a-z
        c >= 97 && c <= 122) {
          out += string.charAt(i);
          continue;
        }
        if (c < 128) {
          out = out + hexTable[c];
          continue;
        }
        if (c < 2048) {
          out = out + (hexTable[192 | c >> 6] + hexTable[128 | c & 63]);
          continue;
        }
        if (c < 55296 || c >= 57344) {
          out = out + (hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63]);
          continue;
        }
        i += 1;
        c = 65536 + ((c & 1023) << 10 | string.charCodeAt(i) & 1023);
        out += hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
      }
      return out;
    };
    exports2.compact = function(obj2, references) {
      if (typeof obj2 !== "object" || obj2 === null) {
        return obj2;
      }
      var refs = references || [];
      var lookup = refs.indexOf(obj2);
      if (lookup !== -1) {
        return refs[lookup];
      }
      refs.push(obj2);
      if (Array.isArray(obj2)) {
        var compacted = [];
        for (var i = 0; i < obj2.length; ++i) {
          if (typeof obj2[i] !== "undefined") {
            compacted.push(obj2[i]);
          }
        }
        return compacted;
      }
      var keys = Object.keys(obj2);
      for (var j = 0; j < keys.length; ++j) {
        var key = keys[j];
        obj2[key] = exports2.compact(obj2[key], refs);
      }
      return obj2;
    };
    exports2.isRegExp = function(obj2) {
      return Object.prototype.toString.call(obj2) === "[object RegExp]";
    };
    exports2.isBuffer = function(obj2) {
      if (obj2 === null || typeof obj2 === "undefined") {
        return false;
      }
      return !!(obj2.constructor && obj2.constructor.isBuffer && obj2.constructor.isBuffer(obj2));
    };
  }
});

// node_modules/stripe/node_modules/qs/lib/stringify.js
var require_stringify = __commonJS({
  "node_modules/stripe/node_modules/qs/lib/stringify.js"(exports2, module2) {
    "use strict";
    var Utils = require_utils();
    var internals = {
      delimiter: "&",
      arrayPrefixGenerators: {
        brackets: function(prefix) {
          return prefix + "[]";
        },
        indices: function(prefix, key) {
          return prefix + "[" + key + "]";
        },
        repeat: function(prefix) {
          return prefix;
        }
      },
      strictNullHandling: false,
      skipNulls: false,
      encode: true
    };
    internals.stringify = function(object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encode, filter, sort) {
      var obj2 = object;
      if (typeof filter === "function") {
        obj2 = filter(prefix, obj2);
      } else if (Utils.isBuffer(obj2)) {
        obj2 = String(obj2);
      } else if (obj2 instanceof Date) {
        obj2 = obj2.toISOString();
      } else if (obj2 === null) {
        if (strictNullHandling) {
          return encode ? Utils.encode(prefix) : prefix;
        }
        obj2 = "";
      }
      if (typeof obj2 === "string" || typeof obj2 === "number" || typeof obj2 === "boolean") {
        if (encode) {
          return [Utils.encode(prefix) + "=" + Utils.encode(obj2)];
        }
        return [prefix + "=" + obj2];
      }
      var values = [];
      if (typeof obj2 === "undefined") {
        return values;
      }
      var objKeys;
      if (Array.isArray(filter)) {
        objKeys = filter;
      } else {
        var keys = Object.keys(obj2);
        objKeys = sort ? keys.sort(sort) : keys;
      }
      for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];
        if (skipNulls && obj2[key] === null) {
          continue;
        }
        if (Array.isArray(obj2)) {
          values = values.concat(internals.stringify(obj2[key], generateArrayPrefix(prefix, key), generateArrayPrefix, strictNullHandling, skipNulls, encode, filter));
        } else {
          values = values.concat(internals.stringify(obj2[key], prefix + "[" + key + "]", generateArrayPrefix, strictNullHandling, skipNulls, encode, filter));
        }
      }
      return values;
    };
    module2.exports = function(object, opts) {
      var obj2 = object;
      var options = opts || {};
      var delimiter = typeof options.delimiter === "undefined" ? internals.delimiter : options.delimiter;
      var strictNullHandling = typeof options.strictNullHandling === "boolean" ? options.strictNullHandling : internals.strictNullHandling;
      var skipNulls = typeof options.skipNulls === "boolean" ? options.skipNulls : internals.skipNulls;
      var encode = typeof options.encode === "boolean" ? options.encode : internals.encode;
      var sort = typeof options.sort === "function" ? options.sort : null;
      var objKeys;
      var filter;
      if (typeof options.filter === "function") {
        filter = options.filter;
        obj2 = filter("", obj2);
      } else if (Array.isArray(options.filter)) {
        objKeys = filter = options.filter;
      }
      var keys = [];
      if (typeof obj2 !== "object" || obj2 === null) {
        return "";
      }
      var arrayFormat;
      if (options.arrayFormat in internals.arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
      } else if ("indices" in options) {
        arrayFormat = options.indices ? "indices" : "repeat";
      } else {
        arrayFormat = "indices";
      }
      var generateArrayPrefix = internals.arrayPrefixGenerators[arrayFormat];
      if (!objKeys) {
        objKeys = Object.keys(obj2);
      }
      if (sort) {
        objKeys.sort(sort);
      }
      for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];
        if (skipNulls && obj2[key] === null) {
          continue;
        }
        keys = keys.concat(internals.stringify(obj2[key], key, generateArrayPrefix, strictNullHandling, skipNulls, encode, filter, sort));
      }
      return keys.join(delimiter);
    };
  }
});

// node_modules/stripe/node_modules/qs/lib/parse.js
var require_parse = __commonJS({
  "node_modules/stripe/node_modules/qs/lib/parse.js"(exports2, module2) {
    "use strict";
    var Utils = require_utils();
    var internals = {
      delimiter: "&",
      depth: 5,
      arrayLimit: 20,
      parameterLimit: 1e3,
      strictNullHandling: false,
      plainObjects: false,
      allowPrototypes: false,
      allowDots: false
    };
    var has = Object.prototype.hasOwnProperty;
    internals.parseValues = function(str, options) {
      var obj2 = {};
      var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? void 0 : options.parameterLimit);
      for (var i = 0; i < parts.length; ++i) {
        var part = parts[i];
        var pos = part.indexOf("]=") === -1 ? part.indexOf("=") : part.indexOf("]=") + 1;
        if (pos === -1) {
          obj2[Utils.decode(part)] = "";
          if (options.strictNullHandling) {
            obj2[Utils.decode(part)] = null;
          }
        } else {
          var key = Utils.decode(part.slice(0, pos));
          var val = Utils.decode(part.slice(pos + 1));
          if (has.call(obj2, key)) {
            obj2[key] = [].concat(obj2[key]).concat(val);
          } else {
            obj2[key] = val;
          }
        }
      }
      return obj2;
    };
    internals.parseObject = function(chain, val, options) {
      if (!chain.length) {
        return val;
      }
      var root = chain.shift();
      var obj2;
      if (root === "[]") {
        obj2 = [];
        obj2 = obj2.concat(internals.parseObject(chain, val, options));
      } else {
        obj2 = options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
        var cleanRoot = root.charAt(0) === "[" && root.charAt(root.length - 1) === "]" ? root.slice(1, -1) : root;
        var index = parseInt(cleanRoot, 10);
        if (!isNaN(index) && root !== cleanRoot && String(index) === cleanRoot && index >= 0 && (options.parseArrays && index <= options.arrayLimit)) {
          obj2 = [];
          obj2[index] = internals.parseObject(chain, val, options);
        } else {
          obj2[cleanRoot] = internals.parseObject(chain, val, options);
        }
      }
      return obj2;
    };
    internals.parseKeys = function(givenKey, val, options) {
      if (!givenKey) {
        return;
      }
      var key = options.allowDots ? givenKey.replace(/\.([^\.\[]+)/g, "[$1]") : givenKey;
      var brackets = /(\[[^[\]]*])/;
      var child = /(\[[^[\]]*])/g;
      var segment = brackets.exec(key);
      var parent = segment ? key.slice(0, segment.index) : key;
      var keys = [];
      if (parent) {
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
          if (!options.allowPrototypes) {
            return;
          }
        }
        keys.push(parent);
      }
      var i = 0;
      while ((segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
          if (!options.allowPrototypes) {
            return;
          }
        }
        keys.push(segment[1]);
      }
      if (segment) {
        keys.push("[" + key.slice(segment.index) + "]");
      }
      return internals.parseObject(keys, val, options);
    };
    module2.exports = function(str, opts) {
      var options = opts || {};
      options.delimiter = typeof options.delimiter === "string" || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;
      options.depth = typeof options.depth === "number" ? options.depth : internals.depth;
      options.arrayLimit = typeof options.arrayLimit === "number" ? options.arrayLimit : internals.arrayLimit;
      options.parseArrays = options.parseArrays !== false;
      options.allowDots = typeof options.allowDots === "boolean" ? options.allowDots : internals.allowDots;
      options.plainObjects = typeof options.plainObjects === "boolean" ? options.plainObjects : internals.plainObjects;
      options.allowPrototypes = typeof options.allowPrototypes === "boolean" ? options.allowPrototypes : internals.allowPrototypes;
      options.parameterLimit = typeof options.parameterLimit === "number" ? options.parameterLimit : internals.parameterLimit;
      options.strictNullHandling = typeof options.strictNullHandling === "boolean" ? options.strictNullHandling : internals.strictNullHandling;
      if (str === "" || str === null || typeof str === "undefined") {
        return options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
      }
      var tempObj = typeof str === "string" ? internals.parseValues(str, options) : str;
      var obj2 = options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
      var keys = Object.keys(tempObj);
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = internals.parseKeys(key, tempObj[key], options);
        obj2 = Utils.merge(obj2, newObj, options);
      }
      return Utils.compact(obj2);
    };
  }
});

// node_modules/stripe/node_modules/qs/lib/index.js
var require_lib = __commonJS({
  "node_modules/stripe/node_modules/qs/lib/index.js"(exports2, module2) {
    "use strict";
    var Stringify = require_stringify();
    var Parse = require_parse();
    module2.exports = {
      stringify: Stringify,
      parse: Parse
    };
  }
});

// node_modules/lodash.isplainobject/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.isplainobject/index.js"(exports2, module2) {
    var objectTag = "[object Object]";
    function isHostObject(value) {
      var result = false;
      if (value != null && typeof value.toString != "function") {
        try {
          result = !!(value + "");
        } catch (e) {
        }
      }
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectCtorString = funcToString.call(Object);
    var objectToString = objectProto.toString;
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isPlainObject(value) {
      if (!isObjectLike(value) || objectToString.call(value) != objectTag || isHostObject(value)) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
      return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }
    module2.exports = isPlainObject;
  }
});

// node_modules/stripe/lib/utils.js
var require_utils2 = __commonJS({
  "node_modules/stripe/lib/utils.js"(exports2, module2) {
    "use strict";
    var qs = require_lib();
    var crypto = require("crypto");
    var hasOwn = {}.hasOwnProperty;
    var isPlainObject = require_lodash();
    var objectAssign = require_object_assign();
    var utils = module2.exports = {
      isAuthKey: function(key) {
        return typeof key == "string" && /^(?:[a-z]{2}_)?[A-z0-9]{32}$/.test(key);
      },
      isOptionsHash: function(o) {
        return isPlainObject(o) && ["api_key", "idempotency_key", "stripe_account", "stripe_version"].some(function(key) {
          return hasOwn.call(o, key);
        });
      },
      /**
       * Stringifies an Object, accommodating nested objects
       * (forming the conventional key 'parent[child]=value')
       */
      stringifyRequestData: function(data) {
        return qs.stringify(data, { arrayFormat: "brackets" });
      },
      /**
       * Outputs a new function with interpolated object property values.
       * Use like so:
       *   var fn = makeURLInterpolator('some/url/{param1}/{param2}');
       *   fn({ param1: 123, param2: 456 }); // => 'some/url/123/456'
       */
      makeURLInterpolator: /* @__PURE__ */ function() {
        var rc = {
          "\n": "\\n",
          '"': '\\"',
          "\u2028": "\\u2028",
          "\u2029": "\\u2029"
        };
        return function makeURLInterpolator(str) {
          var cleanString = str.replace(/["\n\r\u2028\u2029]/g, function($0) {
            return rc[$0];
          });
          return function(outputs) {
            return cleanString.replace(/\{([\s\S]+?)\}/g, function($0, $1) {
              return encodeURIComponent(outputs[$1] || "");
            });
          };
        };
      }(),
      /**
       * Return the data argument from a list of arguments
       */
      getDataFromArgs: function(args) {
        if (args.length > 0) {
          if (isPlainObject(args[0]) && !utils.isOptionsHash(args[0])) {
            return args.shift();
          }
        }
        return {};
      },
      /**
       * Return the options hash from a list of arguments
       */
      getOptionsFromArgs: function(args) {
        var opts = {
          auth: null,
          headers: {}
        };
        if (args.length > 0) {
          var arg = args[args.length - 1];
          if (utils.isAuthKey(arg)) {
            opts.auth = args.pop();
          } else if (utils.isOptionsHash(arg)) {
            var params = args.pop();
            if (params.api_key) {
              opts.auth = params.api_key;
            }
            if (params.idempotency_key) {
              opts.headers["Idempotency-Key"] = params.idempotency_key;
            }
            if (params.stripe_account) {
              opts.headers["Stripe-Account"] = params.stripe_account;
            }
            if (params.stripe_version) {
              opts.headers["Stripe-Version"] = params.stripe_version;
            }
          }
        }
        return opts;
      },
      /**
       * Provide simple "Class" extension mechanism
       */
      protoExtend: function(sub) {
        var Super = this;
        var Constructor = hasOwn.call(sub, "constructor") ? sub.constructor : function() {
          Super.apply(this, arguments);
        };
        objectAssign(Constructor, Super);
        Constructor.prototype = Object.create(Super.prototype);
        objectAssign(Constructor.prototype, sub);
        return Constructor;
      },
      /**
       * Convert an array into an object with integer string attributes
       */
      arrayToObject: function(arr) {
        if (Array.isArray(arr)) {
          var obj2 = {};
          arr.map(function(item, i) {
            obj2[i.toString()] = item;
          });
          return obj2;
        }
        return arr;
      },
      /**
      * Secure compare, from https://github.com/freewil/scmp
      */
      secureCompare: function(a, b) {
        var a = asBuffer(a);
        var b = asBuffer(b);
        if (a.length !== b.length) {
          return false;
        }
        if (crypto.timingSafeEqual) {
          return crypto.timingSafeEqual(a, b);
        }
        var len = a.length;
        var result = 0;
        for (var i = 0; i < len; ++i) {
          result |= a[i] ^ b[i];
        }
        return result === 0;
      },
      /**
      * Remove empty values from an object
      */
      removeEmpty: function(obj2) {
        if (typeof obj2 !== "object") {
          throw new Error("Argument must be an object");
        }
        Object.keys(obj2).forEach(function(key) {
          if (obj2[key] === null || obj2[key] === void 0) {
            delete obj2[key];
          }
        });
        return obj2;
      }
    };
    function asBuffer(thing) {
      if (Buffer.isBuffer(thing)) {
        return thing;
      }
      if (Buffer.from) {
        try {
          return Buffer.from(thing);
        } catch (e) {
          if (e instanceof TypeError) {
            return new Buffer(thing);
          } else {
            throw e;
          }
        }
      } else {
        return new Buffer(thing);
      }
    }
  }
});

// node_modules/stripe/lib/Error.js
var require_Error = __commonJS({
  "node_modules/stripe/lib/Error.js"(exports2, module2) {
    "use strict";
    var utils = require_utils2();
    module2.exports = _Error;
    function _Error(raw) {
      this.populate.apply(this, arguments);
      this.stack = new Error(this.message).stack;
    }
    _Error.prototype = Object.create(Error.prototype);
    _Error.prototype.type = "GenericError";
    _Error.prototype.populate = function(type, message) {
      this.type = type;
      this.message = message;
    };
    _Error.extend = utils.protoExtend;
    var StripeError = _Error.StripeError = _Error.extend({
      type: "StripeError",
      populate: function(raw) {
        this.type = this.type;
        this.stack = new Error(raw.message).stack;
        this.rawType = raw.type;
        this.code = raw.code;
        this.param = raw.param;
        this.message = raw.message;
        this.detail = raw.detail;
        this.raw = raw;
        this.headers = raw.headers;
        this.requestId = raw.requestId;
        this.statusCode = raw.statusCode;
      }
    });
    StripeError.generate = function(rawStripeError) {
      switch (rawStripeError.type) {
        case "card_error":
          return new _Error.StripeCardError(rawStripeError);
        case "invalid_request_error":
          return new _Error.StripeInvalidRequestError(rawStripeError);
        case "api_error":
          return new _Error.StripeAPIError(rawStripeError);
      }
      return new _Error("Generic", "Unknown Error");
    };
    _Error.StripeCardError = StripeError.extend({ type: "StripeCardError" });
    _Error.StripeInvalidRequestError = StripeError.extend({ type: "StripeInvalidRequestError" });
    _Error.StripeAPIError = StripeError.extend({ type: "StripeAPIError" });
    _Error.StripeAuthenticationError = StripeError.extend({ type: "StripeAuthenticationError" });
    _Error.StripePermissionError = StripeError.extend({ type: "StripePermissionError" });
    _Error.StripeRateLimitError = StripeError.extend({ type: "StripeRateLimitError" });
    _Error.StripeConnectionError = StripeError.extend({ type: "StripeConnectionError" });
    _Error.StripeSignatureVerificationError = StripeError.extend({ type: "StripeSignatureVerificationError" });
  }
});

// node_modules/stripe/lib/StripeMethod.js
var require_StripeMethod = __commonJS({
  "node_modules/stripe/lib/StripeMethod.js"(exports2, module2) {
    "use strict";
    var objectAssign = require_object_assign();
    var path = require("path");
    var Promise2 = require_bluebird();
    var utils = require_utils2();
    var OPTIONAL_REGEX = /^optional!/;
    function stripeMethod(spec) {
      var commandPath = typeof spec.path == "function" ? spec.path : utils.makeURLInterpolator(spec.path || "");
      var requestMethod = (spec.method || "GET").toUpperCase();
      var urlParams = spec.urlParams || [];
      var encode = spec.encode || function(data) {
        return data;
      };
      return function() {
        var self2 = this;
        var args = [].slice.call(arguments);
        var callback = typeof args[args.length - 1] == "function" && args.pop();
        var urlData = this.createUrlData();
        return this.wrapTimeout(new Promise2(function(resolve, reject) {
          for (var i = 0, l2 = urlParams.length; i < l2; ++i) {
            var arg = args[0];
            var param = urlParams[i];
            var isOptional = OPTIONAL_REGEX.test(param);
            param = param.replace(OPTIONAL_REGEX, "");
            if (param == "id" && typeof arg !== "string") {
              var path2 = this.createResourcePathWithSymbols(spec.path);
              var err = new Error(
                'Stripe: "id" must be a string, but got: ' + typeof arg + " (on API request to `" + requestMethod + " " + path2 + "`)"
              );
              reject(err);
              return;
            }
            if (!arg) {
              if (isOptional) {
                urlData[param] = "";
                continue;
              }
              var path2 = this.createResourcePathWithSymbols(spec.path);
              var err = new Error(
                'Stripe: Argument "' + urlParams[i] + '" required, but got: ' + arg + " (on API request to `" + requestMethod + " " + path2 + "`)"
              );
              reject(err);
              return;
            }
            urlData[param] = args.shift();
          }
          var data = encode(utils.getDataFromArgs(args));
          var opts = utils.getOptionsFromArgs(args);
          if (args.length) {
            var path2 = this.createResourcePathWithSymbols(spec.path);
            var err = new Error(
              "Stripe: Unknown arguments (" + args + "). Did you mean to pass an options object? See https://github.com/stripe/stripe-node/wiki/Passing-Options. (on API request to " + requestMethod + " `" + path2 + "`)"
            );
            reject(err);
            return;
          }
          var requestPath = this.createFullPath(commandPath, urlData);
          var options = { headers: objectAssign(opts.headers, spec.headers) };
          if (spec.validator) {
            try {
              spec.validator(data, options);
            } catch (err2) {
              reject(err2);
              return;
            }
          }
          function requestCallback(err2, response) {
            if (err2) {
              reject(err2);
            } else {
              resolve(
                spec.transformResponseData ? spec.transformResponseData(response) : response
              );
            }
          }
          ;
          self2._request(requestMethod, requestPath, data, opts.auth, options, requestCallback);
        }.bind(this)), callback);
      };
    }
    module2.exports = stripeMethod;
  }
});

// node_modules/stripe/lib/StripeMethod.basic.js
var require_StripeMethod_basic = __commonJS({
  "node_modules/stripe/lib/StripeMethod.basic.js"(exports2, module2) {
    "use strict";
    var Promise2 = require_bluebird();
    var isPlainObject = require_lodash();
    var stripeMethod = require_StripeMethod();
    var utils = require_utils2();
    module2.exports = {
      create: stripeMethod({
        method: "POST"
      }),
      list: stripeMethod({
        method: "GET"
      }),
      retrieve: stripeMethod({
        method: "GET",
        path: "/{id}",
        urlParams: ["id"]
      }),
      update: stripeMethod({
        method: "POST",
        path: "{id}",
        urlParams: ["id"]
      }),
      // Avoid 'delete' keyword in JS
      del: stripeMethod({
        method: "DELETE",
        path: "{id}",
        urlParams: ["id"]
      }),
      setMetadata: function(id, key, value, auth, cb) {
        var self2 = this;
        var data = key;
        var isObject2 = isPlainObject(key);
        var isNull = data === null || isObject2 && !Object.keys(data).length;
        if ((isNull || isObject2) && typeof value == "string") {
          auth = value;
        } else if (typeof auth != "string") {
          if (!cb && typeof auth == "function") {
            cb = auth;
          }
          auth = null;
        }
        var urlData = this.createUrlData();
        var path = this.createFullPath("/" + id, urlData);
        return this.wrapTimeout(new Promise2(function(resolve, reject) {
          if (isNull) {
            sendMetadata(null, auth);
          } else if (!isObject2) {
            var metadata = {};
            metadata[key] = value;
            sendMetadata(metadata, auth);
          } else {
            this._request("POST", path, {
              metadata: null
            }, auth, {}, function(err, response) {
              if (err) {
                return reject(err);
              }
              sendMetadata(data, auth);
            });
          }
          function sendMetadata(metadata2, auth2) {
            self2._request("POST", path, {
              metadata: metadata2
            }, auth2, {}, function(err, response) {
              if (err) {
                reject(err);
              } else {
                resolve(response.metadata);
              }
            });
          }
        }.bind(this)), cb);
      },
      getMetadata: function(id, auth, cb) {
        if (!cb && typeof auth == "function") {
          cb = auth;
          auth = null;
        }
        var urlData = this.createUrlData();
        var path = this.createFullPath("/" + id, urlData);
        return this.wrapTimeout(new Promise2(function(resolve, reject) {
          this._request("GET", path, {}, auth, {}, function(err, response) {
            if (err) {
              reject(err);
            } else {
              resolve(response.metadata);
            }
          });
        }.bind(this)), cb);
      }
    };
  }
});

// node_modules/stripe/lib/StripeResource.js
var require_StripeResource = __commonJS({
  "node_modules/stripe/lib/StripeResource.js"(exports2, module2) {
    "use strict";
    var http = require("http");
    var https = require("https");
    var objectAssign = require_object_assign();
    var path = require("path");
    var Promise2 = require_bluebird();
    var utils = require_utils2();
    var Error2 = require_Error();
    var hasOwn = {}.hasOwnProperty;
    StripeResource.extend = utils.protoExtend;
    StripeResource.method = require_StripeMethod();
    StripeResource.BASIC_METHODS = require_StripeMethod_basic();
    function StripeResource(stripe2, urlData) {
      this._stripe = stripe2;
      this._urlData = urlData || {};
      this.basePath = utils.makeURLInterpolator(stripe2.getApiField("basePath"));
      this.resourcePath = this.path;
      this.path = utils.makeURLInterpolator(this.path);
      if (this.includeBasic) {
        this.includeBasic.forEach(function(methodName) {
          this[methodName] = StripeResource.BASIC_METHODS[methodName];
        }, this);
      }
      this.initialize.apply(this, arguments);
    }
    StripeResource.prototype = {
      path: "",
      initialize: function() {
      },
      // Function to override the default data processor. This allows full control
      // over how a StripeResource's request data will get converted into an HTTP
      // body. This is useful for non-standard HTTP requests. The function should
      // take method name, data, and headers as arguments.
      requestDataProcessor: null,
      // String that overrides the base API endpoint. If `overrideHost` is not null
      // then all requests for a particular resource will be sent to a base API
      // endpoint as defined by `overrideHost`.
      overrideHost: null,
      // Function to add a validation checks before sending the request, errors should
      // be thrown, and they will be passed to the callback/promise.
      validateRequest: null,
      createFullPath: function(commandPath, urlData) {
        return path.join(
          this.basePath(urlData),
          this.path(urlData),
          typeof commandPath == "function" ? commandPath(urlData) : commandPath
        ).replace(/\\/g, "/");
      },
      // Creates a relative resource path with symbols left in (unlike
      // createFullPath which takes some data to replace them with). For example it
      // might produce: /invoices/{id}
      createResourcePathWithSymbols: function(pathWithSymbols) {
        return "/" + path.join(
          this.resourcePath,
          pathWithSymbols
        ).replace(/\\/g, "/");
      },
      createUrlData: function() {
        var urlData = {};
        for (var i in this._urlData) {
          if (hasOwn.call(this._urlData, i)) {
            urlData[i] = this._urlData[i];
          }
        }
        return urlData;
      },
      wrapTimeout: function(promise, callback) {
        if (callback) {
          return promise.then(function(res) {
            setTimeout(function() {
              callback(null, res);
            }, 0);
          }, function(err) {
            setTimeout(function() {
              callback(err, null);
            }, 0);
          });
        }
        return promise;
      },
      _timeoutHandler: function(timeout, req, callback) {
        var self2 = this;
        return function() {
          var timeoutErr = new Error2("ETIMEDOUT");
          timeoutErr.code = "ETIMEDOUT";
          req._isAborted = true;
          req.abort();
          callback.call(
            self2,
            new Error2.StripeConnectionError({
              message: "Request aborted due to timeout being reached (" + timeout + "ms)",
              detail: timeoutErr
            }),
            null
          );
        };
      },
      _responseHandler: function(req, callback) {
        var self2 = this;
        return function(res) {
          var response = "";
          res.setEncoding("utf8");
          res.on("data", function(chunk) {
            response += chunk;
          });
          res.on("end", function() {
            var headers = res.headers || {};
            res.requestId = headers["request-id"];
            var responseEvent = utils.removeEmpty({
              api_version: headers["stripe-version"],
              account: headers["stripe-account"],
              idempotency_key: headers["idempotency-key"],
              method: req._requestEvent.method,
              path: req._requestEvent.path,
              status: res.statusCode,
              request_id: res.requestId,
              elapsed: Date.now() - req._requestStart
            });
            self2._stripe._emitter.emit("response", responseEvent);
            try {
              response = JSON.parse(response);
              if (response.error) {
                var err;
                response.error.headers = headers;
                response.error.statusCode = res.statusCode;
                response.error.requestId = res.requestId;
                if (res.statusCode === 401) {
                  err = new Error2.StripeAuthenticationError(response.error);
                } else if (res.statusCode === 403) {
                  err = new Error2.StripePermissionError(response.error);
                } else if (res.statusCode === 429) {
                  err = new Error2.StripeRateLimitError(response.error);
                } else {
                  err = Error2.StripeError.generate(response.error);
                }
                return callback.call(self2, err, null);
              }
            } catch (e) {
              return callback.call(
                self2,
                new Error2.StripeAPIError({
                  message: "Invalid JSON received from the Stripe API",
                  response,
                  exception: e,
                  requestId: headers["request-id"]
                }),
                null
              );
            }
            Object.defineProperty(response, "lastResponse", {
              enumerable: false,
              writable: false,
              value: res
            });
            callback.call(self2, null, response);
          });
        };
      },
      _errorHandler: function(req, callback) {
        var self2 = this;
        return function(error) {
          if (req._isAborted) {
            return;
          }
          callback.call(
            self2,
            new Error2.StripeConnectionError({
              message: "An error occurred with our connection to Stripe",
              detail: error
            }),
            null
          );
        };
      },
      _defaultHeaders: function(auth, contentLength, apiVersion) {
        var userAgentString = "Stripe/v1 NodeBindings/" + this._stripe.getConstant("PACKAGE_VERSION");
        if (this._stripe._appInfo) {
          userAgentString += " " + this._stripe.getAppInfoAsString();
        }
        var headers = {
          // Use specified auth token or use default from this stripe instance:
          "Authorization": auth ? "Bearer " + auth : this._stripe.getApiField("auth"),
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": contentLength,
          "User-Agent": userAgentString
        };
        if (apiVersion) {
          headers["Stripe-Version"] = apiVersion;
        }
        return headers;
      },
      _request: function(method, path2, data, auth, options, callback) {
        var self2 = this;
        var requestData;
        if (self2.requestDataProcessor) {
          requestData = self2.requestDataProcessor(method, data, options.headers);
        } else {
          requestData = utils.stringifyRequestData(data || {});
        }
        var apiVersion = this._stripe.getApiField("version");
        var headers = self2._defaultHeaders(auth, requestData.length, apiVersion);
        this._stripe.getClientUserAgent(function(cua) {
          headers["X-Stripe-Client-User-Agent"] = cua;
          if (options.headers) {
            objectAssign(headers, options.headers);
          }
          makeRequest();
        });
        function makeRequest() {
          var timeout = self2._stripe.getApiField("timeout");
          var isInsecureConnection = self2._stripe.getApiField("protocol") == "http";
          var host = self2.overrideHost || self2._stripe.getApiField("host");
          var req = (isInsecureConnection ? http : https).request({
            host,
            port: self2._stripe.getApiField("port"),
            path: path2,
            method,
            agent: self2._stripe.getApiField("agent"),
            headers,
            ciphers: "DEFAULT:!aNULL:!eNULL:!LOW:!EXPORT:!SSLv2:!MD5"
          });
          var requestEvent = utils.removeEmpty({
            api_version: apiVersion,
            account: headers["Stripe-Account"],
            idempotency_key: headers["Idempotency-Key"],
            method,
            path: path2
          });
          req._requestEvent = requestEvent;
          req._requestStart = Date.now();
          self2._stripe._emitter.emit("request", requestEvent);
          req.setTimeout(timeout, self2._timeoutHandler(timeout, req, callback));
          req.on("response", self2._responseHandler(req, callback));
          req.on("error", self2._errorHandler(req, callback));
          req.on("socket", function(socket) {
            socket.on(isInsecureConnection ? "connect" : "secureConnect", function() {
              req.write(requestData);
              req.end();
            });
          });
        }
      }
    };
    module2.exports = StripeResource;
  }
});

// node_modules/stripe/lib/resources/Accounts.js
var require_Accounts = __commonJS({
  "node_modules/stripe/lib/resources/Accounts.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    var utils = require_utils2();
    module2.exports = StripeResource.extend({
      // Since path can either be `account` or `accounts`, support both through stripeMethod path
      create: stripeMethod({
        method: "POST",
        path: "accounts"
      }),
      list: stripeMethod({
        method: "GET",
        path: "accounts"
      }),
      update: stripeMethod({
        method: "POST",
        path: "accounts/{id}",
        urlParams: ["id"]
      }),
      // Avoid 'delete' keyword in JS
      del: stripeMethod({
        method: "DELETE",
        path: "accounts/{id}",
        urlParams: ["id"]
      }),
      reject: stripeMethod({
        method: "POST",
        path: "accounts/{id}/reject",
        urlParams: ["id"]
      }),
      retrieve: function(id) {
        if (typeof id === "string") {
          return stripeMethod({
            method: "GET",
            path: "accounts/{id}",
            urlParams: ["id"]
          }).apply(this, arguments);
        } else {
          if (id === null || id === void 0) {
            [].shift.apply(arguments);
          }
          return stripeMethod({
            method: "GET",
            path: "account"
          }).apply(this, arguments);
        }
      },
      /**
       * Accounts: External account methods
       */
      createExternalAccount: stripeMethod({
        method: "POST",
        path: "accounts/{accountId}/external_accounts",
        urlParams: ["accountId"]
      }),
      listExternalAccounts: stripeMethod({
        method: "GET",
        path: "accounts/{accountId}/external_accounts",
        urlParams: ["accountId"]
      }),
      retrieveExternalAccount: stripeMethod({
        method: "GET",
        path: "accounts/{accountId}/external_accounts/{externalAccountId}",
        urlParams: ["accountId", "externalAccountId"]
      }),
      updateExternalAccount: stripeMethod({
        method: "POST",
        path: "accounts/{accountId}/external_accounts/{externalAccountId}",
        urlParams: ["accountId", "externalAccountId"]
      }),
      deleteExternalAccount: stripeMethod({
        method: "DELETE",
        path: "accounts/{accountId}/external_accounts/{externalAccountId}",
        urlParams: ["accountId", "externalAccountId"]
      }),
      /**
      * Accounts: LoginLink methods
      */
      createLoginLink: stripeMethod({
        method: "POST",
        path: "accounts/{accountId}/login_links",
        urlParams: ["accountId"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/ApplePayDomains.js
var require_ApplePayDomains = __commonJS({
  "node_modules/stripe/lib/resources/ApplePayDomains.js"(exports2, module2) {
    "use strict";
    module2.exports = require_StripeResource().extend({
      path: "apple_pay/domains",
      includeBasic: ["create", "list", "retrieve", "del"]
    });
  }
});

// node_modules/stripe/lib/resources/Balance.js
var require_Balance = __commonJS({
  "node_modules/stripe/lib/resources/Balance.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "balance",
      retrieve: stripeMethod({
        method: "GET"
      }),
      listTransactions: stripeMethod({
        method: "GET",
        path: "history"
      }),
      retrieveTransaction: stripeMethod({
        method: "GET",
        path: "history/{transactionId}",
        urlParams: ["transactionId"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/Charges.js
var require_Charges = __commonJS({
  "node_modules/stripe/lib/resources/Charges.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "charges",
      includeBasic: [
        "create",
        "list",
        "retrieve",
        "update",
        "setMetadata",
        "getMetadata"
      ],
      capture: stripeMethod({
        method: "POST",
        path: "/{id}/capture",
        urlParams: ["id"]
      }),
      refund: stripeMethod({
        method: "POST",
        path: "/{id}/refund",
        urlParams: ["id"]
      }),
      updateDispute: stripeMethod({
        method: "POST",
        path: "/{id}/dispute",
        urlParams: ["id"]
      }),
      closeDispute: stripeMethod({
        method: "POST",
        path: "/{id}/dispute/close",
        urlParams: ["id"]
      }),
      /**
       * Charge: Refund methods
       * (Deprecated)
       */
      createRefund: stripeMethod({
        method: "POST",
        path: "/{chargeId}/refunds",
        urlParams: ["chargeId"]
      }),
      listRefunds: stripeMethod({
        method: "GET",
        path: "/{chargeId}/refunds",
        urlParams: ["chargeId"]
      }),
      retrieveRefund: stripeMethod({
        method: "GET",
        path: "/{chargeId}/refunds/{refundId}",
        urlParams: ["chargeId", "refundId"]
      }),
      updateRefund: stripeMethod({
        method: "POST",
        path: "/{chargeId}/refunds/{refundId}",
        urlParams: ["chargeId", "refundId"]
      }),
      markAsSafe: function(chargeId) {
        return this.update(chargeId, { "fraud_details": { "user_report": "safe" } });
      },
      markAsFraudulent: function(chargeId) {
        return this.update(chargeId, { "fraud_details": { "user_report": "fraudulent" } });
      }
    });
  }
});

// node_modules/stripe/lib/resources/CountrySpecs.js
var require_CountrySpecs = __commonJS({
  "node_modules/stripe/lib/resources/CountrySpecs.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "country_specs",
      includeBasic: [
        "list",
        "retrieve"
      ]
    });
  }
});

// node_modules/stripe/lib/resources/Coupons.js
var require_Coupons = __commonJS({
  "node_modules/stripe/lib/resources/Coupons.js"(exports2, module2) {
    "use strict";
    module2.exports = require_StripeResource().extend({
      path: "coupons",
      includeBasic: ["create", "list", "update", "retrieve", "del"]
    });
  }
});

// node_modules/stripe/lib/resources/Customers.js
var require_Customers = __commonJS({
  "node_modules/stripe/lib/resources/Customers.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var utils = require_utils2();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "customers",
      includeBasic: [
        "create",
        "list",
        "retrieve",
        "update",
        "del",
        "setMetadata",
        "getMetadata"
      ],
      /**
       * Customer: Subscription methods
       */
      _legacyUpdateSubscription: stripeMethod({
        method: "POST",
        path: "{customerId}/subscription",
        urlParams: ["customerId"]
      }),
      _newstyleUpdateSubscription: stripeMethod({
        method: "POST",
        path: "/{customerId}/subscriptions/{subscriptionId}",
        urlParams: ["customerId", "subscriptionId"]
      }),
      _legacyCancelSubscription: stripeMethod({
        method: "DELETE",
        path: "{customerId}/subscription",
        urlParams: ["customerId"]
      }),
      _newstyleCancelSubscription: stripeMethod({
        method: "DELETE",
        path: "/{customerId}/subscriptions/{subscriptionId}",
        urlParams: ["customerId", "subscriptionId"]
      }),
      createSubscription: stripeMethod({
        method: "POST",
        path: "/{customerId}/subscriptions",
        urlParams: ["customerId"]
      }),
      listSubscriptions: stripeMethod({
        method: "GET",
        path: "/{customerId}/subscriptions",
        urlParams: ["customerId"]
      }),
      retrieveSubscription: stripeMethod({
        method: "GET",
        path: "/{customerId}/subscriptions/{subscriptionId}",
        urlParams: ["customerId", "subscriptionId"]
      }),
      updateSubscription: function(customerId, subscriptionId) {
        if (typeof subscriptionId == "string") {
          return this._newstyleUpdateSubscription.apply(this, arguments);
        } else {
          return this._legacyUpdateSubscription.apply(this, arguments);
        }
      },
      cancelSubscription: function(customerId, subscriptionId) {
        if (typeof subscriptionId == "string" && !utils.isAuthKey(subscriptionId)) {
          return this._newstyleCancelSubscription.apply(this, arguments);
        } else {
          return this._legacyCancelSubscription.apply(this, arguments);
        }
      },
      /**
       * Customer: Card methods
       */
      createCard: stripeMethod({
        method: "POST",
        path: "/{customerId}/cards",
        urlParams: ["customerId"]
      }),
      listCards: stripeMethod({
        method: "GET",
        path: "/{customerId}/cards",
        urlParams: ["customerId"]
      }),
      retrieveCard: stripeMethod({
        method: "GET",
        path: "/{customerId}/cards/{cardId}",
        urlParams: ["customerId", "cardId"]
      }),
      updateCard: stripeMethod({
        method: "POST",
        path: "/{customerId}/cards/{cardId}",
        urlParams: ["customerId", "cardId"]
      }),
      deleteCard: stripeMethod({
        method: "DELETE",
        path: "/{customerId}/cards/{cardId}",
        urlParams: ["customerId", "cardId"]
      }),
      /**
       * Customer: Source methods
       */
      createSource: stripeMethod({
        method: "POST",
        path: "/{customerId}/sources",
        urlParams: ["customerId"]
      }),
      listSources: stripeMethod({
        method: "GET",
        path: "/{customerId}/sources",
        urlParams: ["customerId"]
      }),
      retrieveSource: stripeMethod({
        method: "GET",
        path: "/{customerId}/sources/{sourceId}",
        urlParams: ["customerId", "sourceId"]
      }),
      updateSource: stripeMethod({
        method: "POST",
        path: "/{customerId}/sources/{sourceId}",
        urlParams: ["customerId", "sourceId"]
      }),
      deleteSource: stripeMethod({
        method: "DELETE",
        path: "/{customerId}/sources/{sourceId}",
        urlParams: ["customerId", "sourceId"]
      }),
      verifySource: stripeMethod({
        method: "POST",
        path: "/{customerId}/sources/{sourceId}/verify",
        urlParams: ["customerId", "sourceId"]
      }),
      /**
       * Customer: Discount methods
       */
      deleteDiscount: stripeMethod({
        method: "DELETE",
        path: "/{customerId}/discount",
        urlParams: ["customerId"]
      }),
      deleteSubscriptionDiscount: stripeMethod({
        method: "DELETE",
        path: "/{customerId}/subscriptions/{subscriptionId}/discount",
        urlParams: ["customerId", "subscriptionId"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/Disputes.js
var require_Disputes = __commonJS({
  "node_modules/stripe/lib/resources/Disputes.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "disputes",
      includeBasic: [
        "list",
        "retrieve",
        "update",
        "setMetadata",
        "getMetadata"
      ],
      close: stripeMethod({
        method: "POST",
        path: "/{id}/close",
        urlParams: ["id"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/EphemeralKeys.js
var require_EphemeralKeys = __commonJS({
  "node_modules/stripe/lib/resources/EphemeralKeys.js"(exports2, module2) {
    "use strict";
    var utils = require_utils2();
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      create: stripeMethod({
        method: "POST",
        validator: function(data, options) {
          if (!options.headers || !options.headers["Stripe-Version"]) {
            throw new Error("stripe_version must be specified to create an ephemeral key");
          }
        }
      }),
      path: "ephemeral_keys",
      includeBasic: ["del"]
    });
  }
});

// node_modules/stripe/lib/resources/Events.js
var require_Events = __commonJS({
  "node_modules/stripe/lib/resources/Events.js"(exports2, module2) {
    "use strict";
    module2.exports = require_StripeResource().extend({
      path: "events",
      includeBasic: ["list", "retrieve"]
    });
  }
});

// node_modules/stripe/lib/resources/Invoices.js
var require_Invoices = __commonJS({
  "node_modules/stripe/lib/resources/Invoices.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    var utils = require_utils2();
    module2.exports = StripeResource.extend({
      path: "invoices",
      includeBasic: ["create", "list", "retrieve", "update"],
      retrieveLines: stripeMethod({
        method: "GET",
        path: "{invoiceId}/lines",
        urlParams: ["invoiceId"]
      }),
      pay: stripeMethod({
        method: "POST",
        path: "{invoiceId}/pay",
        urlParams: ["invoiceId"]
      }),
      retrieveUpcoming: stripeMethod({
        method: "GET",
        path: function(urlData) {
          var url = "upcoming?customer=" + urlData.customerId;
          if (urlData.invoiceOptions && typeof urlData.invoiceOptions === "string") {
            return url + "&subscription=" + urlData.invoiceOptions;
          } else if (urlData.invoiceOptions && typeof urlData.invoiceOptions === "object") {
            if (urlData.invoiceOptions.subscription_items !== void 0) {
              urlData.invoiceOptions.subscription_items = utils.arrayToObject(urlData.invoiceOptions.subscription_items);
            }
            return url + "&" + utils.stringifyRequestData(urlData.invoiceOptions);
          }
          return url;
        },
        urlParams: ["customerId", "optional!invoiceOptions"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/InvoiceItems.js
var require_InvoiceItems = __commonJS({
  "node_modules/stripe/lib/resources/InvoiceItems.js"(exports2, module2) {
    "use strict";
    module2.exports = require_StripeResource().extend({
      path: "invoiceitems",
      includeBasic: [
        "create",
        "list",
        "retrieve",
        "update",
        "del",
        "setMetadata",
        "getMetadata"
      ]
    });
  }
});

// node_modules/stripe/lib/resources/LoginLinks.js
var require_LoginLinks = __commonJS({
  "node_modules/stripe/lib/resources/LoginLinks.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    module2.exports = StripeResource.extend({
      path: "accounts/{accountId}/login_links",
      includeBasic: ["create"]
    });
  }
});

// node_modules/stripe/lib/resources/Payouts.js
var require_Payouts = __commonJS({
  "node_modules/stripe/lib/resources/Payouts.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "payouts",
      includeBasic: [
        "create",
        "list",
        "retrieve",
        "update",
        "setMetadata",
        "getMetadata"
      ],
      cancel: stripeMethod({
        method: "POST",
        path: "{payoutId}/cancel",
        urlParams: ["payoutId"]
      }),
      listTransactions: stripeMethod({
        method: "GET",
        path: "{payoutId}/transactions",
        urlParams: ["payoutId"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/Plans.js
var require_Plans = __commonJS({
  "node_modules/stripe/lib/resources/Plans.js"(exports2, module2) {
    "use strict";
    module2.exports = require_StripeResource().extend({
      path: "plans",
      includeBasic: ["create", "list", "retrieve", "update", "del"]
    });
  }
});

// node_modules/stripe/lib/resources/RecipientCards.js
var require_RecipientCards = __commonJS({
  "node_modules/stripe/lib/resources/RecipientCards.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    module2.exports = StripeResource.extend({
      path: "recipients/{recipientId}/cards",
      includeBasic: ["create", "list", "retrieve", "update", "del"]
    });
  }
});

// node_modules/stripe/lib/resources/Recipients.js
var require_Recipients = __commonJS({
  "node_modules/stripe/lib/resources/Recipients.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "recipients",
      includeBasic: [
        "create",
        "list",
        "retrieve",
        "update",
        "del",
        "setMetadata",
        "getMetadata"
      ],
      createCard: stripeMethod({
        method: "POST",
        path: "/{recipientId}/cards",
        urlParams: ["recipientId"]
      }),
      listCards: stripeMethod({
        method: "GET",
        path: "/{recipientId}/cards",
        urlParams: ["recipientId"]
      }),
      retrieveCard: stripeMethod({
        method: "GET",
        path: "/{recipientId}/cards/{cardId}",
        urlParams: ["recipientId", "cardId"]
      }),
      updateCard: stripeMethod({
        method: "POST",
        path: "/{recipientId}/cards/{cardId}",
        urlParams: ["recipientId", "cardId"]
      }),
      deleteCard: stripeMethod({
        method: "DELETE",
        path: "/{recipientId}/cards/{cardId}",
        urlParams: ["recipientId", "cardId"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/Refunds.js
var require_Refunds = __commonJS({
  "node_modules/stripe/lib/resources/Refunds.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "refunds",
      includeBasic: [
        "create",
        "list",
        "retrieve",
        "update"
      ]
    });
  }
});

// node_modules/stripe/lib/resources/Tokens.js
var require_Tokens = __commonJS({
  "node_modules/stripe/lib/resources/Tokens.js"(exports2, module2) {
    "use strict";
    module2.exports = require_StripeResource().extend({
      path: "tokens",
      includeBasic: ["create", "retrieve"]
    });
  }
});

// node_modules/stripe/lib/resources/Transfers.js
var require_Transfers = __commonJS({
  "node_modules/stripe/lib/resources/Transfers.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "transfers",
      includeBasic: [
        "create",
        "list",
        "retrieve",
        "update",
        "setMetadata",
        "getMetadata"
      ],
      reverse: stripeMethod({
        method: "POST",
        path: "/{transferId}/reversals",
        urlParams: ["transferId"]
      }),
      cancel: stripeMethod({
        method: "POST",
        path: "{transferId}/cancel",
        urlParams: ["transferId"]
      }),
      listTransactions: stripeMethod({
        method: "GET",
        path: "{transferId}/transactions",
        urlParams: ["transferId"]
      }),
      /**
       * Transfer: Reversal methods
       */
      createReversal: stripeMethod({
        method: "POST",
        path: "/{transferId}/reversals",
        urlParams: ["transferId"]
      }),
      listReversals: stripeMethod({
        method: "GET",
        path: "/{transferId}/reversals",
        urlParams: ["transferId"]
      }),
      retrieveReversal: stripeMethod({
        method: "GET",
        path: "/{transferId}/reversals/{reversalId}",
        urlParams: ["transferId", "reversalId"]
      }),
      updateReversal: stripeMethod({
        method: "POST",
        path: "/{transferId}/reversals/{reversalId}",
        urlParams: ["transferId", "reversalId"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/ApplicationFees.js
var require_ApplicationFees = __commonJS({
  "node_modules/stripe/lib/resources/ApplicationFees.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "application_fees",
      includeBasic: [
        "list",
        "retrieve"
      ],
      refund: stripeMethod({
        method: "POST",
        path: "/{id}/refund",
        urlParams: ["id"]
      }),
      createRefund: stripeMethod({
        method: "POST",
        path: "/{feeId}/refunds",
        urlParams: ["feeId"]
      }),
      listRefunds: stripeMethod({
        method: "GET",
        path: "/{feeId}/refunds",
        urlParams: ["feeId"]
      }),
      retrieveRefund: stripeMethod({
        method: "GET",
        path: "/{feeId}/refunds/{refundId}",
        urlParams: ["feeId", "refundId"]
      }),
      updateRefund: stripeMethod({
        method: "POST",
        path: "/{feeId}/refunds/{refundId}",
        urlParams: ["feeId", "refundId"]
      })
    });
  }
});

// node_modules/stripe/lib/MultipartDataGenerator.js
var require_MultipartDataGenerator = __commonJS({
  "node_modules/stripe/lib/MultipartDataGenerator.js"(exports2, module2) {
    "use strict";
    function multipartDataGenerator(method, data, headers) {
      var segno = (Math.round(Math.random() * 1e16) + Math.round(Math.random() * 1e16)).toString();
      headers["Content-Type"] = "multipart/form-data; boundary=" + segno;
      var buffer = new Buffer(0);
      function push(l2) {
        var prevBuffer = buffer;
        var newBuffer = l2 instanceof Buffer ? l2 : new Buffer(l2);
        buffer = new Buffer(prevBuffer.length + newBuffer.length + 2);
        prevBuffer.copy(buffer);
        newBuffer.copy(buffer, prevBuffer.length);
        buffer.write("\r\n", buffer.length - 2);
      }
      function q(s) {
        return '"' + s.replace(/"|"/g, "%22").replace(/\r\n|\r|\n/g, " ") + '"';
      }
      for (var k in data) {
        var v = data[k];
        push("--" + segno);
        if (v.hasOwnProperty("data")) {
          push("Content-Disposition: form-data; name=" + q(k) + "; filename=" + q(v.name || "blob"));
          push("Content-Type: " + (v.type || "application/octet-stream"));
          push("");
          push(v.data);
        } else {
          push("Content-Disposition: form-data; name=" + q(k));
          push("");
          push(v);
        }
      }
      ;
      push("--" + segno + "--");
      return buffer;
    }
    module2.exports = multipartDataGenerator;
  }
});

// node_modules/stripe/lib/resources/FileUploads.js
var require_FileUploads = __commonJS({
  "node_modules/stripe/lib/resources/FileUploads.js"(exports2, module2) {
    "use strict";
    var utils = require_utils2();
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    var multipartDataGenerator = require_MultipartDataGenerator();
    module2.exports = StripeResource.extend({
      overrideHost: "uploads.stripe.com",
      requestDataProcessor: function(method, data, headers) {
        data = data || {};
        if (method === "POST") {
          return multipartDataGenerator(method, data, headers);
        } else {
          return utils.stringifyRequestData(data);
        }
      },
      path: "files",
      includeBasic: [
        "retrieve",
        "list"
      ],
      create: stripeMethod({
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
    });
  }
});

// node_modules/stripe/lib/resources/BitcoinReceivers.js
var require_BitcoinReceivers = __commonJS({
  "node_modules/stripe/lib/resources/BitcoinReceivers.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "bitcoin/receivers",
      includeBasic: [
        "create",
        "list",
        "retrieve",
        "update",
        "setMetadata",
        "getMetadata"
      ],
      listTransactions: stripeMethod({
        method: "GET",
        path: "/{receiverId}/transactions",
        urlParams: ["receiverId"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/Products.js
var require_Products = __commonJS({
  "node_modules/stripe/lib/resources/Products.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    var utils = require_utils2();
    module2.exports = StripeResource.extend({
      path: "products",
      includeBasic: [
        "list",
        "retrieve",
        "update",
        "del"
      ],
      create: stripeMethod({
        method: "POST",
        required: ["name"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/SKUs.js
var require_SKUs = __commonJS({
  "node_modules/stripe/lib/resources/SKUs.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    var utils = require_utils2();
    module2.exports = StripeResource.extend({
      path: "skus",
      includeBasic: [
        "list",
        "retrieve",
        "update",
        "del"
      ],
      create: stripeMethod({
        method: "POST",
        required: ["currency", "inventory", "price", "product"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/Orders.js
var require_Orders = __commonJS({
  "node_modules/stripe/lib/resources/Orders.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    var utils = require_utils2();
    module2.exports = StripeResource.extend({
      path: "orders",
      includeBasic: [
        "list",
        "retrieve",
        "update"
      ],
      create: stripeMethod({
        method: "POST",
        required: ["currency"]
      }),
      pay: stripeMethod({
        method: "POST",
        path: "/{orderId}/pay",
        urlParams: ["orderId"]
      }),
      returnOrder: stripeMethod({
        method: "POST",
        path: "/{orderId}/returns",
        urlParams: ["orderId"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/OrderReturns.js
var require_OrderReturns = __commonJS({
  "node_modules/stripe/lib/resources/OrderReturns.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    var utils = require_utils2();
    module2.exports = StripeResource.extend({
      path: "order_returns",
      includeBasic: [
        "list",
        "retrieve"
      ]
    });
  }
});

// node_modules/stripe/lib/resources/Subscriptions.js
var require_Subscriptions = __commonJS({
  "node_modules/stripe/lib/resources/Subscriptions.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var utils = require_utils2();
    var stripeMethod = StripeResource.method;
    function encode(data) {
      if (data.items !== void 0) {
        data.items = utils.arrayToObject(data.items);
      }
      return data;
    }
    module2.exports = StripeResource.extend({
      path: "subscriptions",
      includeBasic: ["list", "retrieve", "del"],
      create: stripeMethod({
        method: "POST",
        encode
      }),
      update: stripeMethod({
        method: "POST",
        path: "{id}",
        urlParams: ["id"],
        encode
      }),
      /**
       * Subscription: Discount methods
       */
      deleteDiscount: stripeMethod({
        method: "DELETE",
        path: "/{subscriptionId}/discount",
        urlParams: ["subscriptionId"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/SubscriptionItems.js
var require_SubscriptionItems = __commonJS({
  "node_modules/stripe/lib/resources/SubscriptionItems.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    module2.exports = StripeResource.extend({
      path: "subscription_items",
      includeBasic: ["create", "list", "retrieve", "update", "del"]
    });
  }
});

// node_modules/stripe/lib/resources/ThreeDSecure.js
var require_ThreeDSecure = __commonJS({
  "node_modules/stripe/lib/resources/ThreeDSecure.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "3d_secure",
      includeBasic: [
        "create",
        "retrieve"
      ]
    });
  }
});

// node_modules/stripe/lib/resources/Sources.js
var require_Sources = __commonJS({
  "node_modules/stripe/lib/resources/Sources.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "sources",
      includeBasic: [
        "create",
        "retrieve",
        "update",
        "setMetadata",
        "getMetadata"
      ],
      verify: stripeMethod({
        method: "POST",
        path: "/{id}/verify",
        urlParams: ["id"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/CustomerCards.js
var require_CustomerCards = __commonJS({
  "node_modules/stripe/lib/resources/CustomerCards.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    module2.exports = StripeResource.extend({
      path: "customers/{customerId}/cards",
      includeBasic: ["create", "list", "retrieve", "update", "del"]
    });
  }
});

// node_modules/stripe/lib/resources/CustomerSubscriptions.js
var require_CustomerSubscriptions = __commonJS({
  "node_modules/stripe/lib/resources/CustomerSubscriptions.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    var stripeMethod = StripeResource.method;
    module2.exports = StripeResource.extend({
      path: "customers/{customerId}/subscriptions",
      includeBasic: ["create", "list", "retrieve", "update", "del"],
      /**
       * Customer: Discount methods
       */
      deleteDiscount: stripeMethod({
        method: "DELETE",
        path: "/{subscriptionId}/discount",
        urlParams: ["customerId", "subscriptionId"]
      })
    });
  }
});

// node_modules/stripe/lib/resources/ChargeRefunds.js
var require_ChargeRefunds = __commonJS({
  "node_modules/stripe/lib/resources/ChargeRefunds.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    module2.exports = StripeResource.extend({
      path: "charges/{chargeId}/refunds",
      includeBasic: ["create", "list", "retrieve", "update"]
    });
  }
});

// node_modules/stripe/lib/resources/ApplicationFeeRefunds.js
var require_ApplicationFeeRefunds = __commonJS({
  "node_modules/stripe/lib/resources/ApplicationFeeRefunds.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    module2.exports = StripeResource.extend({
      path: "application_fees/{feeId}/refunds",
      includeBasic: ["create", "list", "retrieve", "update"]
    });
  }
});

// node_modules/stripe/lib/resources/TransferReversals.js
var require_TransferReversals = __commonJS({
  "node_modules/stripe/lib/resources/TransferReversals.js"(exports2, module2) {
    "use strict";
    var StripeResource = require_StripeResource();
    module2.exports = StripeResource.extend({
      path: "transfers/{transferId}/reversals",
      includeBasic: ["create", "list", "retrieve", "update"]
    });
  }
});

// node_modules/stripe/lib/Webhooks.js
var require_Webhooks = __commonJS({
  "node_modules/stripe/lib/Webhooks.js"(exports2, module2) {
    var crypto = require("crypto");
    var utils = require_utils2();
    var Error2 = require_Error();
    var Webhook = {
      DEFAULT_TOLERANCE: 300,
      constructEvent: function(payload, header, secret, tolerance) {
        var jsonPayload = JSON.parse(payload);
        this.signature.verifyHeader(payload, header, secret, tolerance || Webhook.DEFAULT_TOLERANCE);
        return jsonPayload;
      }
    };
    var signature = {
      EXPECTED_SCHEME: "v1",
      _computeSignature: function(payload, secret) {
        return crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
      },
      verifyHeader: function(payload, header, secret, tolerance) {
        var details = parseHeader(header, this.EXPECTED_SCHEME);
        if (!details || details.timestamp === -1) {
          throw new Error2.StripeSignatureVerificationError({
            message: "Unable to extract timestamp and signatures from header",
            detail: {
              header,
              payload
            }
          });
        }
        if (!details.signatures.length) {
          throw new Error2.StripeSignatureVerificationError({
            message: "No signatures found with expected scheme",
            detail: {
              header,
              payload
            }
          });
        }
        var expectedSignature = this._computeSignature(details.timestamp + "." + payload, secret);
        var signatureFound = !!details.signatures.filter(utils.secureCompare.bind(utils, expectedSignature)).length;
        if (!signatureFound) {
          throw new Error2.StripeSignatureVerificationError({
            message: "No signatures found matching the expected signature for payload",
            detail: {
              header,
              payload
            }
          });
        }
        var timestampAge = Math.floor(Date.now() / 1e3) - details.timestamp;
        if (tolerance > 0 && timestampAge > tolerance) {
          throw new Error2.StripeSignatureVerificationError({
            message: "Timestamp outside the tolerance zone",
            detail: {
              header,
              payload
            }
          });
        }
        return true;
      }
    };
    function parseHeader(header, scheme) {
      if (typeof header !== "string") {
        return null;
      }
      return header.split(",").reduce(function(accum, item) {
        var kv = item.split("=");
        if (kv[0] === "t") {
          accum.timestamp = kv[1];
        }
        if (kv[0] === scheme) {
          accum.signatures.push(kv[1]);
        }
        return accum;
      }, {
        timestamp: -1,
        signatures: []
      });
    }
    Webhook.signature = signature;
    module2.exports = Webhook;
  }
});

// node_modules/stripe/lib/stripe.js
var require_stripe = __commonJS({
  "node_modules/stripe/lib/stripe.js"(exports2, module2) {
    "use strict";
    Stripe.DEFAULT_HOST = "api.stripe.com";
    Stripe.DEFAULT_PORT = "443";
    Stripe.DEFAULT_BASE_PATH = "/v1/";
    Stripe.DEFAULT_API_VERSION = null;
    Stripe.DEFAULT_TIMEOUT = require("http").createServer().timeout;
    Stripe.PACKAGE_VERSION = require_package2().version;
    Stripe.USER_AGENT = {
      bindings_version: Stripe.PACKAGE_VERSION,
      lang: "node",
      lang_version: process.version,
      platform: process.platform,
      publisher: "stripe",
      uname: null
    };
    Stripe.USER_AGENT_SERIALIZED = null;
    var APP_INFO_PROPERTIES = ["name", "version", "url"];
    var EventEmitter = require("events").EventEmitter;
    var exec = require("child_process").exec;
    var objectAssign = require_object_assign();
    var util = require("util");
    var resources = {
      // Support Accounts for consistency, Account for backwards compat
      Account: require_Accounts(),
      Accounts: require_Accounts(),
      ApplePayDomains: require_ApplePayDomains(),
      Balance: require_Balance(),
      Charges: require_Charges(),
      CountrySpecs: require_CountrySpecs(),
      Coupons: require_Coupons(),
      Customers: require_Customers(),
      Disputes: require_Disputes(),
      EphemeralKeys: require_EphemeralKeys(),
      Events: require_Events(),
      Invoices: require_Invoices(),
      InvoiceItems: require_InvoiceItems(),
      LoginLinks: require_LoginLinks(),
      Payouts: require_Payouts(),
      Plans: require_Plans(),
      RecipientCards: require_RecipientCards(),
      Recipients: require_Recipients(),
      Refunds: require_Refunds(),
      Tokens: require_Tokens(),
      Transfers: require_Transfers(),
      ApplicationFees: require_ApplicationFees(),
      FileUploads: require_FileUploads(),
      BitcoinReceivers: require_BitcoinReceivers(),
      Products: require_Products(),
      Skus: require_SKUs(),
      Orders: require_Orders(),
      OrderReturns: require_OrderReturns(),
      Subscriptions: require_Subscriptions(),
      SubscriptionItems: require_SubscriptionItems(),
      ThreeDSecure: require_ThreeDSecure(),
      Sources: require_Sources(),
      // The following rely on pre-filled IDs:
      CustomerCards: require_CustomerCards(),
      CustomerSubscriptions: require_CustomerSubscriptions(),
      ChargeRefunds: require_ChargeRefunds(),
      ApplicationFeeRefunds: require_ApplicationFeeRefunds(),
      TransferReversals: require_TransferReversals()
    };
    Stripe.StripeResource = require_StripeResource();
    Stripe.resources = resources;
    function Stripe(key, version) {
      if (!(this instanceof Stripe)) {
        return new Stripe(key, version);
      }
      Object.defineProperty(this, "_emitter", {
        value: new EventEmitter(),
        enumerable: false,
        configurable: false,
        writeable: false
      });
      this.on = this._emitter.on.bind(this._emitter);
      this.off = this._emitter.removeListener.bind(this._emitter);
      this._api = {
        auth: null,
        host: Stripe.DEFAULT_HOST,
        port: Stripe.DEFAULT_PORT,
        basePath: Stripe.DEFAULT_BASE_PATH,
        version: Stripe.DEFAULT_API_VERSION,
        timeout: Stripe.DEFAULT_TIMEOUT,
        agent: null,
        dev: false
      };
      this._prepResources();
      this.setApiKey(key);
      this.setApiVersion(version);
      this.webhooks = require_Webhooks();
    }
    Stripe.prototype = {
      setHost: function(host, port, protocol) {
        this._setApiField("host", host);
        if (port) {
          this.setPort(port);
        }
        if (protocol) {
          this.setProtocol(protocol);
        }
      },
      setProtocol: function(protocol) {
        this._setApiField("protocol", protocol.toLowerCase());
      },
      setPort: function(port) {
        this._setApiField("port", port);
      },
      setApiVersion: function(version) {
        if (version) {
          this._setApiField("version", version);
        }
      },
      setApiKey: function(key) {
        if (key) {
          this._setApiField(
            "auth",
            "Bearer " + key
          );
        }
      },
      setTimeout: function(timeout) {
        this._setApiField(
          "timeout",
          timeout == null ? Stripe.DEFAULT_TIMEOUT : timeout
        );
      },
      setAppInfo: function(info) {
        if (info && typeof info !== "object") {
          throw new Error("AppInfo must be an object.");
        }
        if (info && !info.name) {
          throw new Error("AppInfo.name is required");
        }
        info = info || {};
        var appInfo = APP_INFO_PROPERTIES.reduce(function(accum, prop) {
          if (typeof info[prop] == "string") {
            accum = accum || {};
            accum[prop] = info[prop];
          }
          return accum;
        }, void 0);
        Stripe.USER_AGENT_SERIALIZED = void 0;
        this._appInfo = appInfo;
      },
      setHttpAgent: function(agent) {
        this._setApiField("agent", agent);
      },
      _setApiField: function(key, value) {
        this._api[key] = value;
      },
      getApiField: function(key) {
        return this._api[key];
      },
      getConstant: function(c) {
        return Stripe[c];
      },
      // Gets a JSON version of a User-Agent and uses a cached version for a slight
      // speed advantage.
      getClientUserAgent: function(cb) {
        if (Stripe.USER_AGENT_SERIALIZED) {
          return cb(Stripe.USER_AGENT_SERIALIZED);
        }
        this.getClientUserAgentSeeded(Stripe.USER_AGENT, function(cua) {
          Stripe.USER_AGENT_SERIALIZED = cua;
          cb(Stripe.USER_AGENT_SERIALIZED);
        });
      },
      // Gets a JSON version of a User-Agent by encoding a seeded object and
      // fetching a uname from the system.
      getClientUserAgentSeeded: function(seed, cb) {
        var self2 = this;
        exec("uname -a", function(err, uname) {
          var userAgent = {};
          for (var field in seed) {
            userAgent[field] = encodeURIComponent(seed[field]);
          }
          userAgent.uname = encodeURIComponent(uname) || "UNKNOWN";
          if (self2._appInfo) {
            userAgent.application = self2._appInfo;
          }
          cb(JSON.stringify(userAgent));
        });
      },
      getAppInfoAsString: function() {
        if (!this._appInfo) {
          return "";
        }
        var formatted = this._appInfo.name;
        if (this._appInfo.version) {
          formatted += "/" + this._appInfo.version;
        }
        if (this._appInfo.url) {
          formatted += " (" + this._appInfo.url + ")";
        }
        return formatted;
      },
      _prepResources: function() {
        for (var name in resources) {
          this[name[0].toLowerCase() + name.substring(1)] = new resources[name](this);
        }
      }
    };
    module2.exports = Stripe;
    module2.exports.Stripe = Stripe;
  }
});

// node_modules/uuid/lib/rng.js
var require_rng = __commonJS({
  "node_modules/uuid/lib/rng.js"(exports2, module2) {
    var crypto = require("crypto");
    module2.exports = function nodeRNG() {
      return crypto.randomBytes(16);
    };
  }
});

// node_modules/uuid/lib/bytesToUuid.js
var require_bytesToUuid = __commonJS({
  "node_modules/uuid/lib/bytesToUuid.js"(exports2, module2) {
    var byteToHex = [];
    for (i = 0; i < 256; ++i) {
      byteToHex[i] = (i + 256).toString(16).substr(1);
    }
    var i;
    function bytesToUuid(buf, offset) {
      var i2 = offset || 0;
      var bth = byteToHex;
      return [
        bth[buf[i2++]],
        bth[buf[i2++]],
        bth[buf[i2++]],
        bth[buf[i2++]],
        "-",
        bth[buf[i2++]],
        bth[buf[i2++]],
        "-",
        bth[buf[i2++]],
        bth[buf[i2++]],
        "-",
        bth[buf[i2++]],
        bth[buf[i2++]],
        "-",
        bth[buf[i2++]],
        bth[buf[i2++]],
        bth[buf[i2++]],
        bth[buf[i2++]],
        bth[buf[i2++]],
        bth[buf[i2++]]
      ].join("");
    }
    module2.exports = bytesToUuid;
  }
});

// node_modules/uuid/v1.js
var require_v1 = __commonJS({
  "node_modules/uuid/v1.js"(exports2, module2) {
    var rng = require_rng();
    var bytesToUuid = require_bytesToUuid();
    var _nodeId;
    var _clockseq;
    var _lastMSecs = 0;
    var _lastNSecs = 0;
    function v1(options, buf, offset) {
      var i = buf && offset || 0;
      var b = buf || [];
      options = options || {};
      var node = options.node || _nodeId;
      var clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
      if (node == null || clockseq == null) {
        var seedBytes = rng();
        if (node == null) {
          node = _nodeId = [
            seedBytes[0] | 1,
            seedBytes[1],
            seedBytes[2],
            seedBytes[3],
            seedBytes[4],
            seedBytes[5]
          ];
        }
        if (clockseq == null) {
          clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
        }
      }
      var msecs = options.msecs !== void 0 ? options.msecs : (/* @__PURE__ */ new Date()).getTime();
      var nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
      var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
      if (dt < 0 && options.clockseq === void 0) {
        clockseq = clockseq + 1 & 16383;
      }
      if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
        nsecs = 0;
      }
      if (nsecs >= 1e4) {
        throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
      }
      _lastMSecs = msecs;
      _lastNSecs = nsecs;
      _clockseq = clockseq;
      msecs += 122192928e5;
      var tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
      b[i++] = tl >>> 24 & 255;
      b[i++] = tl >>> 16 & 255;
      b[i++] = tl >>> 8 & 255;
      b[i++] = tl & 255;
      var tmh = msecs / 4294967296 * 1e4 & 268435455;
      b[i++] = tmh >>> 8 & 255;
      b[i++] = tmh & 255;
      b[i++] = tmh >>> 24 & 15 | 16;
      b[i++] = tmh >>> 16 & 255;
      b[i++] = clockseq >>> 8 | 128;
      b[i++] = clockseq & 255;
      for (var n = 0; n < 6; ++n) {
        b[i + n] = node[n];
      }
      return buf ? buf : bytesToUuid(b);
    }
    module2.exports = v1;
  }
});

// node_modules/uuid/v4.js
var require_v4 = __commonJS({
  "node_modules/uuid/v4.js"(exports2, module2) {
    var rng = require_rng();
    var bytesToUuid = require_bytesToUuid();
    function v4(options, buf, offset) {
      var i = buf && offset || 0;
      if (typeof options == "string") {
        buf = options === "binary" ? new Array(16) : null;
        options = null;
      }
      options = options || {};
      var rnds = options.random || (options.rng || rng)();
      rnds[6] = rnds[6] & 15 | 64;
      rnds[8] = rnds[8] & 63 | 128;
      if (buf) {
        for (var ii = 0; ii < 16; ++ii) {
          buf[i + ii] = rnds[ii];
        }
      }
      return buf || bytesToUuid(rnds);
    }
    module2.exports = v4;
  }
});

// node_modules/uuid/index.js
var require_uuid = __commonJS({
  "node_modules/uuid/index.js"(exports2, module2) {
    var v1 = require_v1();
    var v4 = require_v4();
    var uuid = v4;
    uuid.v1 = v1;
    uuid.v4 = v4;
    module2.exports = uuid;
  }
});

// netlify/functions/create-payment-intent.js
require_main().config();
var stripe = require_stripe()("sk_test_51IB0pzCfi2aJ1VQ5mSpRO4kO6wzvpikkxhLfu7ylWBkGM4mDq0VMV7zqQJkMIjkO7eWVFDVWHRyCfoo8XL0Sdz8400ZDOSkbWZ");
var { v4: uuidv4 } = require_uuid();
exports.handler = async (event) => {
  try {
    const { items, shipping, description } = JSON.parse(event.body);
    console.log("Received data:", { items, shipping, description });
    const calculateOrderAmount = (items2) => {
      const array = [];
      items2.forEach((item) => {
        const { price, cartQuantity } = item;
        const cartItemAmount = price * cartQuantity;
        array.push(cartItemAmount);
      });
      const totalAmount = array.reduce((a, b) => a + b, 0);
      return totalAmount * 100;
    };
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "usd",
      // Change as per your requirement
      description
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret
      })
    };
  } catch (error) {
    console.error({ error });
    return {
      statusCode: 400,
      body: JSON.stringify({ error })
    };
  }
};
/*! Bundled license information:

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)
*/
//# sourceMappingURL=create-payment-intent.js.map
