(function () {
    'use strict';

    class ErrorHandler {
      constructor() {
        this.listeners = [];
        this.unexpectedErrorHandler = function(e) {
          setTimeout(() => {
            if (e.stack) {
              throw new Error(e.message + "\n\n" + e.stack);
            }
            throw e;
          }, 0);
        };
      }
      emit(e) {
        this.listeners.forEach((listener) => {
          listener(e);
        });
      }
      onUnexpectedError(e) {
        this.unexpectedErrorHandler(e);
        this.emit(e);
      }
      onUnexpectedExternalError(e) {
        this.unexpectedErrorHandler(e);
      }
    }
    const errorHandler = new ErrorHandler();
    function onUnexpectedError(e) {
      if (!isPromiseCanceledError(e)) {
        errorHandler.onUnexpectedError(e);
      }
      return void 0;
    }
    function transformErrorForSerialization(error) {
      if (error instanceof Error) {
        let { name, message } = error;
        const stack = error.stacktrace || error.stack;
        return {
          $isError: true,
          name,
          message,
          stack
        };
      }
      return error;
    }
    const canceledName = "Canceled";
    function isPromiseCanceledError(error) {
      return error instanceof Error && error.name === canceledName && error.message === canceledName;
    }

    function once(fn) {
      const _this = this;
      let didCall = false;
      let result;
      return function() {
        if (didCall) {
          return result;
        }
        didCall = true;
        result = fn.apply(_this, arguments);
        return result;
      };
    }

    var Iterable;
    (function(Iterable2) {
      function is(thing) {
        return thing && typeof thing === "object" && typeof thing[Symbol.iterator] === "function";
      }
      Iterable2.is = is;
      const _empty = Object.freeze([]);
      function empty() {
        return _empty;
      }
      Iterable2.empty = empty;
      function* single(element) {
        yield element;
      }
      Iterable2.single = single;
      function from(iterable) {
        return iterable || _empty;
      }
      Iterable2.from = from;
      function isEmpty(iterable) {
        return !iterable || iterable[Symbol.iterator]().next().done === true;
      }
      Iterable2.isEmpty = isEmpty;
      function first(iterable) {
        return iterable[Symbol.iterator]().next().value;
      }
      Iterable2.first = first;
      function some(iterable, predicate) {
        for (const element of iterable) {
          if (predicate(element)) {
            return true;
          }
        }
        return false;
      }
      Iterable2.some = some;
      function find(iterable, predicate) {
        for (const element of iterable) {
          if (predicate(element)) {
            return element;
          }
        }
        return void 0;
      }
      Iterable2.find = find;
      function* filter(iterable, predicate) {
        for (const element of iterable) {
          if (predicate(element)) {
            yield element;
          }
        }
      }
      Iterable2.filter = filter;
      function* map(iterable, fn) {
        let index = 0;
        for (const element of iterable) {
          yield fn(element, index++);
        }
      }
      Iterable2.map = map;
      function* concat(...iterables) {
        for (const iterable of iterables) {
          for (const element of iterable) {
            yield element;
          }
        }
      }
      Iterable2.concat = concat;
      function* concatNested(iterables) {
        for (const iterable of iterables) {
          for (const element of iterable) {
            yield element;
          }
        }
      }
      Iterable2.concatNested = concatNested;
      function reduce(iterable, reducer, initialValue) {
        let value = initialValue;
        for (const element of iterable) {
          value = reducer(value, element);
        }
        return value;
      }
      Iterable2.reduce = reduce;
      function* slice(arr, from2, to = arr.length) {
        if (from2 < 0) {
          from2 += arr.length;
        }
        if (to < 0) {
          to += arr.length;
        } else if (to > arr.length) {
          to = arr.length;
        }
        for (; from2 < to; from2++) {
          yield arr[from2];
        }
      }
      Iterable2.slice = slice;
      function consume(iterable, atMost = Number.POSITIVE_INFINITY) {
        const consumed = [];
        if (atMost === 0) {
          return [consumed, iterable];
        }
        const iterator = iterable[Symbol.iterator]();
        for (let i = 0; i < atMost; i++) {
          const next = iterator.next();
          if (next.done) {
            return [consumed, Iterable2.empty()];
          }
          consumed.push(next.value);
        }
        return [consumed, { [Symbol.iterator]() {
          return iterator;
        } }];
      }
      Iterable2.consume = consume;
      function equals(a, b, comparator = (at, bt) => at === bt) {
        const ai = a[Symbol.iterator]();
        const bi = b[Symbol.iterator]();
        while (true) {
          const an = ai.next();
          const bn = bi.next();
          if (an.done !== bn.done) {
            return false;
          } else if (an.done) {
            return true;
          } else if (!comparator(an.value, bn.value)) {
            return false;
          }
        }
      }
      Iterable2.equals = equals;
    })(Iterable || (Iterable = {}));

    function trackDisposable(x) {
      return x;
    }
    function setParentOfDisposable(child, parent) {
    }
    class MultiDisposeError extends Error {
      constructor(errors) {
        super(`Encountered errors while disposing of store. Errors: [${errors.join(", ")}]`);
        this.errors = errors;
      }
    }
    function dispose(arg) {
      if (Iterable.is(arg)) {
        let errors = [];
        for (const d of arg) {
          if (d) {
            try {
              d.dispose();
            } catch (e) {
              errors.push(e);
            }
          }
        }
        if (errors.length === 1) {
          throw errors[0];
        } else if (errors.length > 1) {
          throw new MultiDisposeError(errors);
        }
        return Array.isArray(arg) ? [] : arg;
      } else if (arg) {
        arg.dispose();
        return arg;
      }
    }
    function combinedDisposable(...disposables) {
      const parent = toDisposable(() => dispose(disposables));
      return parent;
    }
    function toDisposable(fn) {
      const self = trackDisposable({
        dispose: once(() => {
          fn();
        })
      });
      return self;
    }
    class DisposableStore {
      constructor() {
        this._toDispose = new Set();
        this._isDisposed = false;
      }
      dispose() {
        if (this._isDisposed) {
          return;
        }
        this._isDisposed = true;
        this.clear();
      }
      clear() {
        try {
          dispose(this._toDispose.values());
        } finally {
          this._toDispose.clear();
        }
      }
      add(o) {
        if (!o) {
          return o;
        }
        if (o === this) {
          throw new Error("Cannot register a disposable on itself!");
        }
        if (this._isDisposed) {
          if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
            console.warn(new Error("Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!").stack);
          }
        } else {
          this._toDispose.add(o);
        }
        return o;
      }
    }
    DisposableStore.DISABLE_DISPOSED_WARNING = false;
    class Disposable {
      constructor() {
        this._store = new DisposableStore();
        setParentOfDisposable(this._store);
      }
      dispose() {
        this._store.dispose();
      }
      _register(o) {
        if (o === this) {
          throw new Error("Cannot register a disposable on itself!");
        }
        return this._store.add(o);
      }
    }
    Disposable.None = Object.freeze({ dispose() {
    } });

    var _a;
    const LANGUAGE_DEFAULT = "en";
    let _isWindows = false;
    let _isMacintosh = false;
    let _isLinux = false;
    let _locale = void 0;
    let _language = LANGUAGE_DEFAULT;
    let _translationsConfigFile = void 0;
    let _userAgent = void 0;
    const globals = typeof self === "object" ? self : typeof global === "object" ? global : {};
    let nodeProcess = void 0;
    if (typeof globals.vscode !== "undefined" && typeof globals.vscode.process !== "undefined") {
      nodeProcess = globals.vscode.process;
    } else if (typeof process !== "undefined") {
      nodeProcess = process;
    }
    const isElectronRenderer = typeof ((_a = nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.versions) === null || _a === void 0 ? void 0 : _a.electron) === "string" && nodeProcess.type === "renderer";
    if (typeof navigator === "object" && !isElectronRenderer) {
      _userAgent = navigator.userAgent;
      _isWindows = _userAgent.indexOf("Windows") >= 0;
      _isMacintosh = _userAgent.indexOf("Macintosh") >= 0;
      (_userAgent.indexOf("Macintosh") >= 0 || _userAgent.indexOf("iPad") >= 0 || _userAgent.indexOf("iPhone") >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
      _isLinux = _userAgent.indexOf("Linux") >= 0;
      _locale = navigator.language;
      _language = _locale;
    } else if (typeof nodeProcess === "object") {
      _isWindows = nodeProcess.platform === "win32";
      _isMacintosh = nodeProcess.platform === "darwin";
      _isLinux = nodeProcess.platform === "linux";
      _isLinux && !!nodeProcess.env["SNAP"] && !!nodeProcess.env["SNAP_REVISION"];
      _locale = LANGUAGE_DEFAULT;
      _language = LANGUAGE_DEFAULT;
      const rawNlsConfig = nodeProcess.env["VSCODE_NLS_CONFIG"];
      if (rawNlsConfig) {
        try {
          const nlsConfig = JSON.parse(rawNlsConfig);
          const resolved = nlsConfig.availableLanguages["*"];
          _locale = nlsConfig.locale;
          _language = resolved ? resolved : LANGUAGE_DEFAULT;
          _translationsConfigFile = nlsConfig._translationsConfigFile;
        } catch (e) {
        }
      }
    } else {
      console.error("Unable to resolve platform.");
    }
    const isWindows = _isWindows;
    const isMacintosh = _isMacintosh;
    const setImmediate = function defineSetImmediate() {
      if (globals.setImmediate) {
        return globals.setImmediate.bind(globals);
      }
      if (typeof globals.postMessage === "function" && !globals.importScripts) {
        let pending = [];
        globals.addEventListener("message", (e) => {
          if (e.data && e.data.vscodeSetImmediateId) {
            for (let i = 0, len = pending.length; i < len; i++) {
              const candidate = pending[i];
              if (candidate.id === e.data.vscodeSetImmediateId) {
                pending.splice(i, 1);
                candidate.callback();
                return;
              }
            }
          }
        });
        let lastId = 0;
        return (callback) => {
          const myId = ++lastId;
          pending.push({
            id: myId,
            callback
          });
          globals.postMessage({ vscodeSetImmediateId: myId }, "*");
        };
      }
      if (typeof (nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.nextTick) === "function") {
        return nodeProcess.nextTick.bind(nodeProcess);
      }
      const _promise = Promise.resolve();
      return (callback) => _promise.then(callback);
    }();

    function getAllPropertyNames(obj) {
      let res = [];
      let proto = Object.getPrototypeOf(obj);
      while (Object.prototype !== proto) {
        res = res.concat(Object.getOwnPropertyNames(proto));
        proto = Object.getPrototypeOf(proto);
      }
      return res;
    }
    function getAllMethodNames(obj) {
      const methods = [];
      for (const prop of getAllPropertyNames(obj)) {
        if (typeof obj[prop] === "function") {
          methods.push(prop);
        }
      }
      return methods;
    }
    function createProxyObject(methodNames, invoke) {
      const createProxyMethod = (method) => {
        return function() {
          const args = Array.prototype.slice.call(arguments, 0);
          return invoke(method, args);
        };
      };
      let result = {};
      for (const methodName of methodNames) {
        result[methodName] = createProxyMethod(methodName);
      }
      return result;
    }

    const INITIALIZE = "$initialize";
    class SimpleWorkerProtocol {
      constructor(handler) {
        this._workerId = -1;
        this._handler = handler;
        this._lastSentReq = 0;
        this._pendingReplies = Object.create(null);
      }
      setWorkerId(workerId) {
        this._workerId = workerId;
      }
      sendMessage(method, args) {
        let req = String(++this._lastSentReq);
        return new Promise((resolve, reject) => {
          this._pendingReplies[req] = {
            resolve,
            reject
          };
          this._send({
            vsWorker: this._workerId,
            req,
            method,
            args
          });
        });
      }
      handleMessage(message) {
        if (!message || !message.vsWorker) {
          return;
        }
        if (this._workerId !== -1 && message.vsWorker !== this._workerId) {
          return;
        }
        this._handleMessage(message);
      }
      _handleMessage(msg) {
        if (msg.seq) {
          let replyMessage = msg;
          if (!this._pendingReplies[replyMessage.seq]) {
            console.warn("Got reply to unknown seq");
            return;
          }
          let reply = this._pendingReplies[replyMessage.seq];
          delete this._pendingReplies[replyMessage.seq];
          if (replyMessage.err) {
            let err = replyMessage.err;
            if (replyMessage.err.$isError) {
              err = new Error();
              err.name = replyMessage.err.name;
              err.message = replyMessage.err.message;
              err.stack = replyMessage.err.stack;
            }
            reply.reject(err);
            return;
          }
          reply.resolve(replyMessage.res);
          return;
        }
        let requestMessage = msg;
        let req = requestMessage.req;
        let result = this._handler.handleMessage(requestMessage.method, requestMessage.args);
        result.then((r) => {
          this._send({
            vsWorker: this._workerId,
            seq: req,
            res: r,
            err: void 0
          });
        }, (e) => {
          if (e.detail instanceof Error) {
            e.detail = transformErrorForSerialization(e.detail);
          }
          this._send({
            vsWorker: this._workerId,
            seq: req,
            res: void 0,
            err: transformErrorForSerialization(e)
          });
        });
      }
      _send(msg) {
        let transfer = [];
        if (msg.req) {
          const m = msg;
          for (let i = 0; i < m.args.length; i++) {
            if (m.args[i] instanceof ArrayBuffer) {
              transfer.push(m.args[i]);
            }
          }
        } else {
          const m = msg;
          if (m.res instanceof ArrayBuffer) {
            transfer.push(m.res);
          }
        }
        this._handler.sendMessage(msg, transfer);
      }
    }
    class SimpleWorkerServer {
      constructor(postMessage, requestHandlerFactory) {
        this._requestHandlerFactory = requestHandlerFactory;
        this._requestHandler = null;
        this._protocol = new SimpleWorkerProtocol({
          sendMessage: (msg, transfer) => {
            postMessage(msg, transfer);
          },
          handleMessage: (method, args) => this._handleMessage(method, args)
        });
      }
      onmessage(msg) {
        this._protocol.handleMessage(msg);
      }
      _handleMessage(method, args) {
        if (method === INITIALIZE) {
          return this.initialize(args[0], args[1], args[2], args[3]);
        }
        if (!this._requestHandler || typeof this._requestHandler[method] !== "function") {
          return Promise.reject(new Error("Missing requestHandler or method: " + method));
        }
        try {
          return Promise.resolve(this._requestHandler[method].apply(this._requestHandler, args));
        } catch (e) {
          return Promise.reject(e);
        }
      }
      initialize(workerId, loaderConfig, moduleId, hostMethods) {
        this._protocol.setWorkerId(workerId);
        const proxyMethodRequest = (method, args) => {
          return this._protocol.sendMessage(method, args);
        };
        const hostProxy = createProxyObject(hostMethods, proxyMethodRequest);
        if (this._requestHandlerFactory) {
          this._requestHandler = this._requestHandlerFactory(hostProxy);
          return Promise.resolve(getAllMethodNames(this._requestHandler));
        }
        if (loaderConfig) {
          if (typeof loaderConfig.baseUrl !== "undefined") {
            delete loaderConfig["baseUrl"];
          }
          if (typeof loaderConfig.paths !== "undefined") {
            if (typeof loaderConfig.paths.vs !== "undefined") {
              delete loaderConfig.paths["vs"];
            }
          }
          if (typeof loaderConfig.trustedTypesPolicy !== void 0) {
            delete loaderConfig["trustedTypesPolicy"];
          }
          loaderConfig.catchError = true;
          self.require.config(loaderConfig);
        }
        return new Promise((resolve, reject) => {
          self.require([moduleId], (module) => {
            this._requestHandler = module.create(hostProxy);
            if (!this._requestHandler) {
              reject(new Error(`No RequestHandler!`));
              return;
            }
            resolve(getAllMethodNames(this._requestHandler));
          }, reject);
        });
      }
    }

    class DiffChange {
      constructor(originalStart, originalLength, modifiedStart, modifiedLength) {
        this.originalStart = originalStart;
        this.originalLength = originalLength;
        this.modifiedStart = modifiedStart;
        this.modifiedLength = modifiedLength;
      }
      getOriginalEnd() {
        return this.originalStart + this.originalLength;
      }
      getModifiedEnd() {
        return this.modifiedStart + this.modifiedLength;
      }
    }

    function splitLines(str) {
      return str.split(/\r\n|\r|\n/);
    }
    function firstNonWhitespaceIndex(str) {
      for (let i = 0, len = str.length; i < len; i++) {
        const chCode = str.charCodeAt(i);
        if (chCode !== 32 && chCode !== 9) {
          return i;
        }
      }
      return -1;
    }
    function lastNonWhitespaceIndex(str, startIndex = str.length - 1) {
      for (let i = startIndex; i >= 0; i--) {
        const chCode = str.charCodeAt(i);
        if (chCode !== 32 && chCode !== 9) {
          return i;
        }
      }
      return -1;
    }

    function numberHash(val, initialHashVal) {
      return (initialHashVal << 5) - initialHashVal + val | 0;
    }
    function stringHash(s, hashVal) {
      hashVal = numberHash(149417, hashVal);
      for (let i = 0, length = s.length; i < length; i++) {
        hashVal = numberHash(s.charCodeAt(i), hashVal);
      }
      return hashVal;
    }

    class StringDiffSequence {
      constructor(source) {
        this.source = source;
      }
      getElements() {
        const source = this.source;
        const characters = new Int32Array(source.length);
        for (let i = 0, len = source.length; i < len; i++) {
          characters[i] = source.charCodeAt(i);
        }
        return characters;
      }
    }
    function stringDiff(original, modified, pretty) {
      return new LcsDiff(new StringDiffSequence(original), new StringDiffSequence(modified)).ComputeDiff(pretty).changes;
    }
    class Debug {
      static Assert(condition, message) {
        if (!condition) {
          throw new Error(message);
        }
      }
    }
    class MyArray {
      static Copy(sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
        for (let i = 0; i < length; i++) {
          destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
        }
      }
      static Copy2(sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
        for (let i = 0; i < length; i++) {
          destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
        }
      }
    }
    class DiffChangeHelper {
      constructor() {
        this.m_changes = [];
        this.m_originalStart = 1073741824;
        this.m_modifiedStart = 1073741824;
        this.m_originalCount = 0;
        this.m_modifiedCount = 0;
      }
      MarkNextChange() {
        if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
          this.m_changes.push(new DiffChange(this.m_originalStart, this.m_originalCount, this.m_modifiedStart, this.m_modifiedCount));
        }
        this.m_originalCount = 0;
        this.m_modifiedCount = 0;
        this.m_originalStart = 1073741824;
        this.m_modifiedStart = 1073741824;
      }
      AddOriginalElement(originalIndex, modifiedIndex) {
        this.m_originalStart = Math.min(this.m_originalStart, originalIndex);
        this.m_modifiedStart = Math.min(this.m_modifiedStart, modifiedIndex);
        this.m_originalCount++;
      }
      AddModifiedElement(originalIndex, modifiedIndex) {
        this.m_originalStart = Math.min(this.m_originalStart, originalIndex);
        this.m_modifiedStart = Math.min(this.m_modifiedStart, modifiedIndex);
        this.m_modifiedCount++;
      }
      getChanges() {
        if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
          this.MarkNextChange();
        }
        return this.m_changes;
      }
      getReverseChanges() {
        if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
          this.MarkNextChange();
        }
        this.m_changes.reverse();
        return this.m_changes;
      }
    }
    class LcsDiff {
      constructor(originalSequence, modifiedSequence, continueProcessingPredicate = null) {
        this.ContinueProcessingPredicate = continueProcessingPredicate;
        this._originalSequence = originalSequence;
        this._modifiedSequence = modifiedSequence;
        const [originalStringElements, originalElementsOrHash, originalHasStrings] = LcsDiff._getElements(originalSequence);
        const [modifiedStringElements, modifiedElementsOrHash, modifiedHasStrings] = LcsDiff._getElements(modifiedSequence);
        this._hasStrings = originalHasStrings && modifiedHasStrings;
        this._originalStringElements = originalStringElements;
        this._originalElementsOrHash = originalElementsOrHash;
        this._modifiedStringElements = modifiedStringElements;
        this._modifiedElementsOrHash = modifiedElementsOrHash;
        this.m_forwardHistory = [];
        this.m_reverseHistory = [];
      }
      static _isStringArray(arr) {
        return arr.length > 0 && typeof arr[0] === "string";
      }
      static _getElements(sequence) {
        const elements = sequence.getElements();
        if (LcsDiff._isStringArray(elements)) {
          const hashes = new Int32Array(elements.length);
          for (let i = 0, len = elements.length; i < len; i++) {
            hashes[i] = stringHash(elements[i], 0);
          }
          return [elements, hashes, true];
        }
        if (elements instanceof Int32Array) {
          return [[], elements, false];
        }
        return [[], new Int32Array(elements), false];
      }
      ElementsAreEqual(originalIndex, newIndex) {
        if (this._originalElementsOrHash[originalIndex] !== this._modifiedElementsOrHash[newIndex]) {
          return false;
        }
        return this._hasStrings ? this._originalStringElements[originalIndex] === this._modifiedStringElements[newIndex] : true;
      }
      ElementsAreStrictEqual(originalIndex, newIndex) {
        if (!this.ElementsAreEqual(originalIndex, newIndex)) {
          return false;
        }
        const originalElement = LcsDiff._getStrictElement(this._originalSequence, originalIndex);
        const modifiedElement = LcsDiff._getStrictElement(this._modifiedSequence, newIndex);
        return originalElement === modifiedElement;
      }
      static _getStrictElement(sequence, index) {
        if (typeof sequence.getStrictElement === "function") {
          return sequence.getStrictElement(index);
        }
        return null;
      }
      OriginalElementsAreEqual(index1, index2) {
        if (this._originalElementsOrHash[index1] !== this._originalElementsOrHash[index2]) {
          return false;
        }
        return this._hasStrings ? this._originalStringElements[index1] === this._originalStringElements[index2] : true;
      }
      ModifiedElementsAreEqual(index1, index2) {
        if (this._modifiedElementsOrHash[index1] !== this._modifiedElementsOrHash[index2]) {
          return false;
        }
        return this._hasStrings ? this._modifiedStringElements[index1] === this._modifiedStringElements[index2] : true;
      }
      ComputeDiff(pretty) {
        return this._ComputeDiff(0, this._originalElementsOrHash.length - 1, 0, this._modifiedElementsOrHash.length - 1, pretty);
      }
      _ComputeDiff(originalStart, originalEnd, modifiedStart, modifiedEnd, pretty) {
        const quitEarlyArr = [false];
        let changes = this.ComputeDiffRecursive(originalStart, originalEnd, modifiedStart, modifiedEnd, quitEarlyArr);
        if (pretty) {
          changes = this.PrettifyChanges(changes);
        }
        return {
          quitEarly: quitEarlyArr[0],
          changes
        };
      }
      ComputeDiffRecursive(originalStart, originalEnd, modifiedStart, modifiedEnd, quitEarlyArr) {
        quitEarlyArr[0] = false;
        while (originalStart <= originalEnd && modifiedStart <= modifiedEnd && this.ElementsAreEqual(originalStart, modifiedStart)) {
          originalStart++;
          modifiedStart++;
        }
        while (originalEnd >= originalStart && modifiedEnd >= modifiedStart && this.ElementsAreEqual(originalEnd, modifiedEnd)) {
          originalEnd--;
          modifiedEnd--;
        }
        if (originalStart > originalEnd || modifiedStart > modifiedEnd) {
          let changes;
          if (modifiedStart <= modifiedEnd) {
            Debug.Assert(originalStart === originalEnd + 1, "originalStart should only be one more than originalEnd");
            changes = [
              new DiffChange(originalStart, 0, modifiedStart, modifiedEnd - modifiedStart + 1)
            ];
          } else if (originalStart <= originalEnd) {
            Debug.Assert(modifiedStart === modifiedEnd + 1, "modifiedStart should only be one more than modifiedEnd");
            changes = [
              new DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, 0)
            ];
          } else {
            Debug.Assert(originalStart === originalEnd + 1, "originalStart should only be one more than originalEnd");
            Debug.Assert(modifiedStart === modifiedEnd + 1, "modifiedStart should only be one more than modifiedEnd");
            changes = [];
          }
          return changes;
        }
        const midOriginalArr = [0];
        const midModifiedArr = [0];
        const result = this.ComputeRecursionPoint(originalStart, originalEnd, modifiedStart, modifiedEnd, midOriginalArr, midModifiedArr, quitEarlyArr);
        const midOriginal = midOriginalArr[0];
        const midModified = midModifiedArr[0];
        if (result !== null) {
          return result;
        } else if (!quitEarlyArr[0]) {
          const leftChanges = this.ComputeDiffRecursive(originalStart, midOriginal, modifiedStart, midModified, quitEarlyArr);
          let rightChanges = [];
          if (!quitEarlyArr[0]) {
            rightChanges = this.ComputeDiffRecursive(midOriginal + 1, originalEnd, midModified + 1, modifiedEnd, quitEarlyArr);
          } else {
            rightChanges = [
              new DiffChange(midOriginal + 1, originalEnd - (midOriginal + 1) + 1, midModified + 1, modifiedEnd - (midModified + 1) + 1)
            ];
          }
          return this.ConcatenateChanges(leftChanges, rightChanges);
        }
        return [
          new DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, modifiedEnd - modifiedStart + 1)
        ];
      }
      WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr) {
        let forwardChanges = null;
        let reverseChanges = null;
        let changeHelper = new DiffChangeHelper();
        let diagonalMin = diagonalForwardStart;
        let diagonalMax = diagonalForwardEnd;
        let diagonalRelative = midOriginalArr[0] - midModifiedArr[0] - diagonalForwardOffset;
        let lastOriginalIndex = -1073741824;
        let historyIndex = this.m_forwardHistory.length - 1;
        do {
          const diagonal = diagonalRelative + diagonalForwardBase;
          if (diagonal === diagonalMin || diagonal < diagonalMax && forwardPoints[diagonal - 1] < forwardPoints[diagonal + 1]) {
            originalIndex = forwardPoints[diagonal + 1];
            modifiedIndex = originalIndex - diagonalRelative - diagonalForwardOffset;
            if (originalIndex < lastOriginalIndex) {
              changeHelper.MarkNextChange();
            }
            lastOriginalIndex = originalIndex;
            changeHelper.AddModifiedElement(originalIndex + 1, modifiedIndex);
            diagonalRelative = diagonal + 1 - diagonalForwardBase;
          } else {
            originalIndex = forwardPoints[diagonal - 1] + 1;
            modifiedIndex = originalIndex - diagonalRelative - diagonalForwardOffset;
            if (originalIndex < lastOriginalIndex) {
              changeHelper.MarkNextChange();
            }
            lastOriginalIndex = originalIndex - 1;
            changeHelper.AddOriginalElement(originalIndex, modifiedIndex + 1);
            diagonalRelative = diagonal - 1 - diagonalForwardBase;
          }
          if (historyIndex >= 0) {
            forwardPoints = this.m_forwardHistory[historyIndex];
            diagonalForwardBase = forwardPoints[0];
            diagonalMin = 1;
            diagonalMax = forwardPoints.length - 1;
          }
        } while (--historyIndex >= -1);
        forwardChanges = changeHelper.getReverseChanges();
        if (quitEarlyArr[0]) {
          let originalStartPoint = midOriginalArr[0] + 1;
          let modifiedStartPoint = midModifiedArr[0] + 1;
          if (forwardChanges !== null && forwardChanges.length > 0) {
            const lastForwardChange = forwardChanges[forwardChanges.length - 1];
            originalStartPoint = Math.max(originalStartPoint, lastForwardChange.getOriginalEnd());
            modifiedStartPoint = Math.max(modifiedStartPoint, lastForwardChange.getModifiedEnd());
          }
          reverseChanges = [
            new DiffChange(originalStartPoint, originalEnd - originalStartPoint + 1, modifiedStartPoint, modifiedEnd - modifiedStartPoint + 1)
          ];
        } else {
          changeHelper = new DiffChangeHelper();
          diagonalMin = diagonalReverseStart;
          diagonalMax = diagonalReverseEnd;
          diagonalRelative = midOriginalArr[0] - midModifiedArr[0] - diagonalReverseOffset;
          lastOriginalIndex = 1073741824;
          historyIndex = deltaIsEven ? this.m_reverseHistory.length - 1 : this.m_reverseHistory.length - 2;
          do {
            const diagonal = diagonalRelative + diagonalReverseBase;
            if (diagonal === diagonalMin || diagonal < diagonalMax && reversePoints[diagonal - 1] >= reversePoints[diagonal + 1]) {
              originalIndex = reversePoints[diagonal + 1] - 1;
              modifiedIndex = originalIndex - diagonalRelative - diagonalReverseOffset;
              if (originalIndex > lastOriginalIndex) {
                changeHelper.MarkNextChange();
              }
              lastOriginalIndex = originalIndex + 1;
              changeHelper.AddOriginalElement(originalIndex + 1, modifiedIndex + 1);
              diagonalRelative = diagonal + 1 - diagonalReverseBase;
            } else {
              originalIndex = reversePoints[diagonal - 1];
              modifiedIndex = originalIndex - diagonalRelative - diagonalReverseOffset;
              if (originalIndex > lastOriginalIndex) {
                changeHelper.MarkNextChange();
              }
              lastOriginalIndex = originalIndex;
              changeHelper.AddModifiedElement(originalIndex + 1, modifiedIndex + 1);
              diagonalRelative = diagonal - 1 - diagonalReverseBase;
            }
            if (historyIndex >= 0) {
              reversePoints = this.m_reverseHistory[historyIndex];
              diagonalReverseBase = reversePoints[0];
              diagonalMin = 1;
              diagonalMax = reversePoints.length - 1;
            }
          } while (--historyIndex >= -1);
          reverseChanges = changeHelper.getChanges();
        }
        return this.ConcatenateChanges(forwardChanges, reverseChanges);
      }
      ComputeRecursionPoint(originalStart, originalEnd, modifiedStart, modifiedEnd, midOriginalArr, midModifiedArr, quitEarlyArr) {
        let originalIndex = 0, modifiedIndex = 0;
        let diagonalForwardStart = 0, diagonalForwardEnd = 0;
        let diagonalReverseStart = 0, diagonalReverseEnd = 0;
        originalStart--;
        modifiedStart--;
        midOriginalArr[0] = 0;
        midModifiedArr[0] = 0;
        this.m_forwardHistory = [];
        this.m_reverseHistory = [];
        const maxDifferences = originalEnd - originalStart + (modifiedEnd - modifiedStart);
        const numDiagonals = maxDifferences + 1;
        const forwardPoints = new Int32Array(numDiagonals);
        const reversePoints = new Int32Array(numDiagonals);
        const diagonalForwardBase = modifiedEnd - modifiedStart;
        const diagonalReverseBase = originalEnd - originalStart;
        const diagonalForwardOffset = originalStart - modifiedStart;
        const diagonalReverseOffset = originalEnd - modifiedEnd;
        const delta = diagonalReverseBase - diagonalForwardBase;
        const deltaIsEven = delta % 2 === 0;
        forwardPoints[diagonalForwardBase] = originalStart;
        reversePoints[diagonalReverseBase] = originalEnd;
        quitEarlyArr[0] = false;
        for (let numDifferences = 1; numDifferences <= maxDifferences / 2 + 1; numDifferences++) {
          let furthestOriginalIndex = 0;
          let furthestModifiedIndex = 0;
          diagonalForwardStart = this.ClipDiagonalBound(diagonalForwardBase - numDifferences, numDifferences, diagonalForwardBase, numDiagonals);
          diagonalForwardEnd = this.ClipDiagonalBound(diagonalForwardBase + numDifferences, numDifferences, diagonalForwardBase, numDiagonals);
          for (let diagonal = diagonalForwardStart; diagonal <= diagonalForwardEnd; diagonal += 2) {
            if (diagonal === diagonalForwardStart || diagonal < diagonalForwardEnd && forwardPoints[diagonal - 1] < forwardPoints[diagonal + 1]) {
              originalIndex = forwardPoints[diagonal + 1];
            } else {
              originalIndex = forwardPoints[diagonal - 1] + 1;
            }
            modifiedIndex = originalIndex - (diagonal - diagonalForwardBase) - diagonalForwardOffset;
            const tempOriginalIndex = originalIndex;
            while (originalIndex < originalEnd && modifiedIndex < modifiedEnd && this.ElementsAreEqual(originalIndex + 1, modifiedIndex + 1)) {
              originalIndex++;
              modifiedIndex++;
            }
            forwardPoints[diagonal] = originalIndex;
            if (originalIndex + modifiedIndex > furthestOriginalIndex + furthestModifiedIndex) {
              furthestOriginalIndex = originalIndex;
              furthestModifiedIndex = modifiedIndex;
            }
            if (!deltaIsEven && Math.abs(diagonal - diagonalReverseBase) <= numDifferences - 1) {
              if (originalIndex >= reversePoints[diagonal]) {
                midOriginalArr[0] = originalIndex;
                midModifiedArr[0] = modifiedIndex;
                if (tempOriginalIndex <= reversePoints[diagonal] && 1447 > 0 && numDifferences <= 1447 + 1) {
                  return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                } else {
                  return null;
                }
              }
            }
          }
          const matchLengthOfLongest = (furthestOriginalIndex - originalStart + (furthestModifiedIndex - modifiedStart) - numDifferences) / 2;
          if (this.ContinueProcessingPredicate !== null && !this.ContinueProcessingPredicate(furthestOriginalIndex, matchLengthOfLongest)) {
            quitEarlyArr[0] = true;
            midOriginalArr[0] = furthestOriginalIndex;
            midModifiedArr[0] = furthestModifiedIndex;
            if (matchLengthOfLongest > 0 && 1447 > 0 && numDifferences <= 1447 + 1) {
              return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
            } else {
              originalStart++;
              modifiedStart++;
              return [
                new DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, modifiedEnd - modifiedStart + 1)
              ];
            }
          }
          diagonalReverseStart = this.ClipDiagonalBound(diagonalReverseBase - numDifferences, numDifferences, diagonalReverseBase, numDiagonals);
          diagonalReverseEnd = this.ClipDiagonalBound(diagonalReverseBase + numDifferences, numDifferences, diagonalReverseBase, numDiagonals);
          for (let diagonal = diagonalReverseStart; diagonal <= diagonalReverseEnd; diagonal += 2) {
            if (diagonal === diagonalReverseStart || diagonal < diagonalReverseEnd && reversePoints[diagonal - 1] >= reversePoints[diagonal + 1]) {
              originalIndex = reversePoints[diagonal + 1] - 1;
            } else {
              originalIndex = reversePoints[diagonal - 1];
            }
            modifiedIndex = originalIndex - (diagonal - diagonalReverseBase) - diagonalReverseOffset;
            const tempOriginalIndex = originalIndex;
            while (originalIndex > originalStart && modifiedIndex > modifiedStart && this.ElementsAreEqual(originalIndex, modifiedIndex)) {
              originalIndex--;
              modifiedIndex--;
            }
            reversePoints[diagonal] = originalIndex;
            if (deltaIsEven && Math.abs(diagonal - diagonalForwardBase) <= numDifferences) {
              if (originalIndex <= forwardPoints[diagonal]) {
                midOriginalArr[0] = originalIndex;
                midModifiedArr[0] = modifiedIndex;
                if (tempOriginalIndex >= forwardPoints[diagonal] && 1447 > 0 && numDifferences <= 1447 + 1) {
                  return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                } else {
                  return null;
                }
              }
            }
          }
          if (numDifferences <= 1447) {
            let temp = new Int32Array(diagonalForwardEnd - diagonalForwardStart + 2);
            temp[0] = diagonalForwardBase - diagonalForwardStart + 1;
            MyArray.Copy2(forwardPoints, diagonalForwardStart, temp, 1, diagonalForwardEnd - diagonalForwardStart + 1);
            this.m_forwardHistory.push(temp);
            temp = new Int32Array(diagonalReverseEnd - diagonalReverseStart + 2);
            temp[0] = diagonalReverseBase - diagonalReverseStart + 1;
            MyArray.Copy2(reversePoints, diagonalReverseStart, temp, 1, diagonalReverseEnd - diagonalReverseStart + 1);
            this.m_reverseHistory.push(temp);
          }
        }
        return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
      }
      PrettifyChanges(changes) {
        for (let i = 0; i < changes.length; i++) {
          const change = changes[i];
          const originalStop = i < changes.length - 1 ? changes[i + 1].originalStart : this._originalElementsOrHash.length;
          const modifiedStop = i < changes.length - 1 ? changes[i + 1].modifiedStart : this._modifiedElementsOrHash.length;
          const checkOriginal = change.originalLength > 0;
          const checkModified = change.modifiedLength > 0;
          while (change.originalStart + change.originalLength < originalStop && change.modifiedStart + change.modifiedLength < modifiedStop && (!checkOriginal || this.OriginalElementsAreEqual(change.originalStart, change.originalStart + change.originalLength)) && (!checkModified || this.ModifiedElementsAreEqual(change.modifiedStart, change.modifiedStart + change.modifiedLength))) {
            const startStrictEqual = this.ElementsAreStrictEqual(change.originalStart, change.modifiedStart);
            const endStrictEqual = this.ElementsAreStrictEqual(change.originalStart + change.originalLength, change.modifiedStart + change.modifiedLength);
            if (endStrictEqual && !startStrictEqual) {
              break;
            }
            change.originalStart++;
            change.modifiedStart++;
          }
          let mergedChangeArr = [null];
          if (i < changes.length - 1 && this.ChangesOverlap(changes[i], changes[i + 1], mergedChangeArr)) {
            changes[i] = mergedChangeArr[0];
            changes.splice(i + 1, 1);
            i--;
            continue;
          }
        }
        for (let i = changes.length - 1; i >= 0; i--) {
          const change = changes[i];
          let originalStop = 0;
          let modifiedStop = 0;
          if (i > 0) {
            const prevChange = changes[i - 1];
            originalStop = prevChange.originalStart + prevChange.originalLength;
            modifiedStop = prevChange.modifiedStart + prevChange.modifiedLength;
          }
          const checkOriginal = change.originalLength > 0;
          const checkModified = change.modifiedLength > 0;
          let bestDelta = 0;
          let bestScore = this._boundaryScore(change.originalStart, change.originalLength, change.modifiedStart, change.modifiedLength);
          for (let delta = 1; ; delta++) {
            const originalStart = change.originalStart - delta;
            const modifiedStart = change.modifiedStart - delta;
            if (originalStart < originalStop || modifiedStart < modifiedStop) {
              break;
            }
            if (checkOriginal && !this.OriginalElementsAreEqual(originalStart, originalStart + change.originalLength)) {
              break;
            }
            if (checkModified && !this.ModifiedElementsAreEqual(modifiedStart, modifiedStart + change.modifiedLength)) {
              break;
            }
            const touchingPreviousChange = originalStart === originalStop && modifiedStart === modifiedStop;
            const score = (touchingPreviousChange ? 5 : 0) + this._boundaryScore(originalStart, change.originalLength, modifiedStart, change.modifiedLength);
            if (score > bestScore) {
              bestScore = score;
              bestDelta = delta;
            }
          }
          change.originalStart -= bestDelta;
          change.modifiedStart -= bestDelta;
          const mergedChangeArr = [null];
          if (i > 0 && this.ChangesOverlap(changes[i - 1], changes[i], mergedChangeArr)) {
            changes[i - 1] = mergedChangeArr[0];
            changes.splice(i, 1);
            i++;
            continue;
          }
        }
        if (this._hasStrings) {
          for (let i = 1, len = changes.length; i < len; i++) {
            const aChange = changes[i - 1];
            const bChange = changes[i];
            const matchedLength = bChange.originalStart - aChange.originalStart - aChange.originalLength;
            const aOriginalStart = aChange.originalStart;
            const bOriginalEnd = bChange.originalStart + bChange.originalLength;
            const abOriginalLength = bOriginalEnd - aOriginalStart;
            const aModifiedStart = aChange.modifiedStart;
            const bModifiedEnd = bChange.modifiedStart + bChange.modifiedLength;
            const abModifiedLength = bModifiedEnd - aModifiedStart;
            if (matchedLength < 5 && abOriginalLength < 20 && abModifiedLength < 20) {
              const t = this._findBetterContiguousSequence(aOriginalStart, abOriginalLength, aModifiedStart, abModifiedLength, matchedLength);
              if (t) {
                const [originalMatchStart, modifiedMatchStart] = t;
                if (originalMatchStart !== aChange.originalStart + aChange.originalLength || modifiedMatchStart !== aChange.modifiedStart + aChange.modifiedLength) {
                  aChange.originalLength = originalMatchStart - aChange.originalStart;
                  aChange.modifiedLength = modifiedMatchStart - aChange.modifiedStart;
                  bChange.originalStart = originalMatchStart + matchedLength;
                  bChange.modifiedStart = modifiedMatchStart + matchedLength;
                  bChange.originalLength = bOriginalEnd - bChange.originalStart;
                  bChange.modifiedLength = bModifiedEnd - bChange.modifiedStart;
                }
              }
            }
          }
        }
        return changes;
      }
      _findBetterContiguousSequence(originalStart, originalLength, modifiedStart, modifiedLength, desiredLength) {
        if (originalLength < desiredLength || modifiedLength < desiredLength) {
          return null;
        }
        const originalMax = originalStart + originalLength - desiredLength + 1;
        const modifiedMax = modifiedStart + modifiedLength - desiredLength + 1;
        let bestScore = 0;
        let bestOriginalStart = 0;
        let bestModifiedStart = 0;
        for (let i = originalStart; i < originalMax; i++) {
          for (let j = modifiedStart; j < modifiedMax; j++) {
            const score = this._contiguousSequenceScore(i, j, desiredLength);
            if (score > 0 && score > bestScore) {
              bestScore = score;
              bestOriginalStart = i;
              bestModifiedStart = j;
            }
          }
        }
        if (bestScore > 0) {
          return [bestOriginalStart, bestModifiedStart];
        }
        return null;
      }
      _contiguousSequenceScore(originalStart, modifiedStart, length) {
        let score = 0;
        for (let l = 0; l < length; l++) {
          if (!this.ElementsAreEqual(originalStart + l, modifiedStart + l)) {
            return 0;
          }
          score += this._originalStringElements[originalStart + l].length;
        }
        return score;
      }
      _OriginalIsBoundary(index) {
        if (index <= 0 || index >= this._originalElementsOrHash.length - 1) {
          return true;
        }
        return this._hasStrings && /^\s*$/.test(this._originalStringElements[index]);
      }
      _OriginalRegionIsBoundary(originalStart, originalLength) {
        if (this._OriginalIsBoundary(originalStart) || this._OriginalIsBoundary(originalStart - 1)) {
          return true;
        }
        if (originalLength > 0) {
          const originalEnd = originalStart + originalLength;
          if (this._OriginalIsBoundary(originalEnd - 1) || this._OriginalIsBoundary(originalEnd)) {
            return true;
          }
        }
        return false;
      }
      _ModifiedIsBoundary(index) {
        if (index <= 0 || index >= this._modifiedElementsOrHash.length - 1) {
          return true;
        }
        return this._hasStrings && /^\s*$/.test(this._modifiedStringElements[index]);
      }
      _ModifiedRegionIsBoundary(modifiedStart, modifiedLength) {
        if (this._ModifiedIsBoundary(modifiedStart) || this._ModifiedIsBoundary(modifiedStart - 1)) {
          return true;
        }
        if (modifiedLength > 0) {
          const modifiedEnd = modifiedStart + modifiedLength;
          if (this._ModifiedIsBoundary(modifiedEnd - 1) || this._ModifiedIsBoundary(modifiedEnd)) {
            return true;
          }
        }
        return false;
      }
      _boundaryScore(originalStart, originalLength, modifiedStart, modifiedLength) {
        const originalScore = this._OriginalRegionIsBoundary(originalStart, originalLength) ? 1 : 0;
        const modifiedScore = this._ModifiedRegionIsBoundary(modifiedStart, modifiedLength) ? 1 : 0;
        return originalScore + modifiedScore;
      }
      ConcatenateChanges(left, right) {
        let mergedChangeArr = [];
        if (left.length === 0 || right.length === 0) {
          return right.length > 0 ? right : left;
        } else if (this.ChangesOverlap(left[left.length - 1], right[0], mergedChangeArr)) {
          const result = new Array(left.length + right.length - 1);
          MyArray.Copy(left, 0, result, 0, left.length - 1);
          result[left.length - 1] = mergedChangeArr[0];
          MyArray.Copy(right, 1, result, left.length, right.length - 1);
          return result;
        } else {
          const result = new Array(left.length + right.length);
          MyArray.Copy(left, 0, result, 0, left.length);
          MyArray.Copy(right, 0, result, left.length, right.length);
          return result;
        }
      }
      ChangesOverlap(left, right, mergedChangeArr) {
        Debug.Assert(left.originalStart <= right.originalStart, "Left change is not less than or equal to right change");
        Debug.Assert(left.modifiedStart <= right.modifiedStart, "Left change is not less than or equal to right change");
        if (left.originalStart + left.originalLength >= right.originalStart || left.modifiedStart + left.modifiedLength >= right.modifiedStart) {
          const originalStart = left.originalStart;
          let originalLength = left.originalLength;
          const modifiedStart = left.modifiedStart;
          let modifiedLength = left.modifiedLength;
          if (left.originalStart + left.originalLength >= right.originalStart) {
            originalLength = right.originalStart + right.originalLength - left.originalStart;
          }
          if (left.modifiedStart + left.modifiedLength >= right.modifiedStart) {
            modifiedLength = right.modifiedStart + right.modifiedLength - left.modifiedStart;
          }
          mergedChangeArr[0] = new DiffChange(originalStart, originalLength, modifiedStart, modifiedLength);
          return true;
        } else {
          mergedChangeArr[0] = null;
          return false;
        }
      }
      ClipDiagonalBound(diagonal, numDifferences, diagonalBaseIndex, numDiagonals) {
        if (diagonal >= 0 && diagonal < numDiagonals) {
          return diagonal;
        }
        const diagonalsBelow = diagonalBaseIndex;
        const diagonalsAbove = numDiagonals - diagonalBaseIndex - 1;
        const diffEven = numDifferences % 2 === 0;
        if (diagonal < 0) {
          const lowerBoundEven = diagonalsBelow % 2 === 0;
          return diffEven === lowerBoundEven ? 0 : 1;
        } else {
          const upperBoundEven = diagonalsAbove % 2 === 0;
          return diffEven === upperBoundEven ? numDiagonals - 1 : numDiagonals - 2;
        }
      }
    }

    let safeProcess;
    if (typeof globals.vscode !== "undefined" && typeof globals.vscode.process !== "undefined") {
      const sandboxProcess = globals.vscode.process;
      safeProcess = {
        get platform() {
          return sandboxProcess.platform;
        },
        get arch() {
          return sandboxProcess.arch;
        },
        get env() {
          return sandboxProcess.env;
        },
        cwd() {
          return sandboxProcess.cwd();
        },
        nextTick(callback) {
          return setImmediate(callback);
        }
      };
    } else if (typeof process !== "undefined") {
      safeProcess = {
        get platform() {
          return process.platform;
        },
        get arch() {
          return process.arch;
        },
        get env() {
          return process.env;
        },
        cwd() {
          return process.env["VSCODE_CWD"] || process.cwd();
        },
        nextTick(callback) {
          return process.nextTick(callback);
        }
      };
    } else {
      safeProcess = {
        get platform() {
          return isWindows ? "win32" : isMacintosh ? "darwin" : "linux";
        },
        get arch() {
          return void 0;
        },
        nextTick(callback) {
          return setImmediate(callback);
        },
        get env() {
          return {};
        },
        cwd() {
          return "/";
        }
      };
    }
    const cwd = safeProcess.cwd;
    const env = safeProcess.env;
    const platform = safeProcess.platform;

    const CHAR_UPPERCASE_A = 65;
    const CHAR_LOWERCASE_A = 97;
    const CHAR_UPPERCASE_Z = 90;
    const CHAR_LOWERCASE_Z = 122;
    const CHAR_DOT = 46;
    const CHAR_FORWARD_SLASH = 47;
    const CHAR_BACKWARD_SLASH = 92;
    const CHAR_COLON = 58;
    const CHAR_QUESTION_MARK = 63;
    class ErrorInvalidArgType extends Error {
      constructor(name, expected, actual) {
        let determiner;
        if (typeof expected === "string" && expected.indexOf("not ") === 0) {
          determiner = "must not be";
          expected = expected.replace(/^not /, "");
        } else {
          determiner = "must be";
        }
        const type = name.indexOf(".") !== -1 ? "property" : "argument";
        let msg = `The "${name}" ${type} ${determiner} of type ${expected}`;
        msg += `. Received type ${typeof actual}`;
        super(msg);
        this.code = "ERR_INVALID_ARG_TYPE";
      }
    }
    function validateString(value, name) {
      if (typeof value !== "string") {
        throw new ErrorInvalidArgType(name, "string", value);
      }
    }
    function isPathSeparator(code) {
      return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
    }
    function isPosixPathSeparator(code) {
      return code === CHAR_FORWARD_SLASH;
    }
    function isWindowsDeviceRoot(code) {
      return code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z || code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z;
    }
    function normalizeString(path, allowAboveRoot, separator, isPathSeparator2) {
      let res = "";
      let lastSegmentLength = 0;
      let lastSlash = -1;
      let dots = 0;
      let code = 0;
      for (let i = 0; i <= path.length; ++i) {
        if (i < path.length) {
          code = path.charCodeAt(i);
        } else if (isPathSeparator2(code)) {
          break;
        } else {
          code = CHAR_FORWARD_SLASH;
        }
        if (isPathSeparator2(code)) {
          if (lastSlash === i - 1 || dots === 1) ; else if (dots === 2) {
            if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
              if (res.length > 2) {
                const lastSlashIndex = res.lastIndexOf(separator);
                if (lastSlashIndex === -1) {
                  res = "";
                  lastSegmentLength = 0;
                } else {
                  res = res.slice(0, lastSlashIndex);
                  lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                }
                lastSlash = i;
                dots = 0;
                continue;
              } else if (res.length !== 0) {
                res = "";
                lastSegmentLength = 0;
                lastSlash = i;
                dots = 0;
                continue;
              }
            }
            if (allowAboveRoot) {
              res += res.length > 0 ? `${separator}..` : "..";
              lastSegmentLength = 2;
            }
          } else {
            if (res.length > 0) {
              res += `${separator}${path.slice(lastSlash + 1, i)}`;
            } else {
              res = path.slice(lastSlash + 1, i);
            }
            lastSegmentLength = i - lastSlash - 1;
          }
          lastSlash = i;
          dots = 0;
        } else if (code === CHAR_DOT && dots !== -1) {
          ++dots;
        } else {
          dots = -1;
        }
      }
      return res;
    }
    function _format(sep2, pathObject) {
      if (pathObject === null || typeof pathObject !== "object") {
        throw new ErrorInvalidArgType("pathObject", "Object", pathObject);
      }
      const dir = pathObject.dir || pathObject.root;
      const base = pathObject.base || `${pathObject.name || ""}${pathObject.ext || ""}`;
      if (!dir) {
        return base;
      }
      return dir === pathObject.root ? `${dir}${base}` : `${dir}${sep2}${base}`;
    }
    const win32 = {
      resolve(...pathSegments) {
        let resolvedDevice = "";
        let resolvedTail = "";
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= -1; i--) {
          let path;
          if (i >= 0) {
            path = pathSegments[i];
            validateString(path, "path");
            if (path.length === 0) {
              continue;
            }
          } else if (resolvedDevice.length === 0) {
            path = cwd();
          } else {
            path = env[`=${resolvedDevice}`] || cwd();
            if (path === void 0 || path.slice(0, 2).toLowerCase() !== resolvedDevice.toLowerCase() && path.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
              path = `${resolvedDevice}\\`;
            }
          }
          const len = path.length;
          let rootEnd = 0;
          let device = "";
          let isAbsolute = false;
          const code = path.charCodeAt(0);
          if (len === 1) {
            if (isPathSeparator(code)) {
              rootEnd = 1;
              isAbsolute = true;
            }
          } else if (isPathSeparator(code)) {
            isAbsolute = true;
            if (isPathSeparator(path.charCodeAt(1))) {
              let j = 2;
              let last = j;
              while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                const firstPart = path.slice(last, j);
                last = j;
                while (j < len && isPathSeparator(path.charCodeAt(j))) {
                  j++;
                }
                if (j < len && j !== last) {
                  last = j;
                  while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                    j++;
                  }
                  if (j === len || j !== last) {
                    device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                    rootEnd = j;
                  }
                }
              }
            } else {
              rootEnd = 1;
            }
          } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
            device = path.slice(0, 2);
            rootEnd = 2;
            if (len > 2 && isPathSeparator(path.charCodeAt(2))) {
              isAbsolute = true;
              rootEnd = 3;
            }
          }
          if (device.length > 0) {
            if (resolvedDevice.length > 0) {
              if (device.toLowerCase() !== resolvedDevice.toLowerCase()) {
                continue;
              }
            } else {
              resolvedDevice = device;
            }
          }
          if (resolvedAbsolute) {
            if (resolvedDevice.length > 0) {
              break;
            }
          } else {
            resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute;
            if (isAbsolute && resolvedDevice.length > 0) {
              break;
            }
          }
        }
        resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
        return resolvedAbsolute ? `${resolvedDevice}\\${resolvedTail}` : `${resolvedDevice}${resolvedTail}` || ".";
      },
      normalize(path) {
        validateString(path, "path");
        const len = path.length;
        if (len === 0) {
          return ".";
        }
        let rootEnd = 0;
        let device;
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        if (len === 1) {
          return isPosixPathSeparator(code) ? "\\" : path;
        }
        if (isPathSeparator(code)) {
          isAbsolute = true;
          if (isPathSeparator(path.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              const firstPart = path.slice(last, j);
              last = j;
              while (j < len && isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                  j++;
                }
                if (j === len) {
                  return `\\\\${firstPart}\\${path.slice(last)}\\`;
                }
                if (j !== last) {
                  device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                  rootEnd = j;
                }
              }
            }
          } else {
            rootEnd = 1;
          }
        } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
          device = path.slice(0, 2);
          rootEnd = 2;
          if (len > 2 && isPathSeparator(path.charCodeAt(2))) {
            isAbsolute = true;
            rootEnd = 3;
          }
        }
        let tail = rootEnd < len ? normalizeString(path.slice(rootEnd), !isAbsolute, "\\", isPathSeparator) : "";
        if (tail.length === 0 && !isAbsolute) {
          tail = ".";
        }
        if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
          tail += "\\";
        }
        if (device === void 0) {
          return isAbsolute ? `\\${tail}` : tail;
        }
        return isAbsolute ? `${device}\\${tail}` : `${device}${tail}`;
      },
      isAbsolute(path) {
        validateString(path, "path");
        const len = path.length;
        if (len === 0) {
          return false;
        }
        const code = path.charCodeAt(0);
        return isPathSeparator(code) || len > 2 && isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON && isPathSeparator(path.charCodeAt(2));
      },
      join(...paths) {
        if (paths.length === 0) {
          return ".";
        }
        let joined;
        let firstPart;
        for (let i = 0; i < paths.length; ++i) {
          const arg = paths[i];
          validateString(arg, "path");
          if (arg.length > 0) {
            if (joined === void 0) {
              joined = firstPart = arg;
            } else {
              joined += `\\${arg}`;
            }
          }
        }
        if (joined === void 0) {
          return ".";
        }
        let needsReplace = true;
        let slashCount = 0;
        if (typeof firstPart === "string" && isPathSeparator(firstPart.charCodeAt(0))) {
          ++slashCount;
          const firstLen = firstPart.length;
          if (firstLen > 1 && isPathSeparator(firstPart.charCodeAt(1))) {
            ++slashCount;
            if (firstLen > 2) {
              if (isPathSeparator(firstPart.charCodeAt(2))) {
                ++slashCount;
              } else {
                needsReplace = false;
              }
            }
          }
        }
        if (needsReplace) {
          while (slashCount < joined.length && isPathSeparator(joined.charCodeAt(slashCount))) {
            slashCount++;
          }
          if (slashCount >= 2) {
            joined = `\\${joined.slice(slashCount)}`;
          }
        }
        return win32.normalize(joined);
      },
      relative(from, to) {
        validateString(from, "from");
        validateString(to, "to");
        if (from === to) {
          return "";
        }
        const fromOrig = win32.resolve(from);
        const toOrig = win32.resolve(to);
        if (fromOrig === toOrig) {
          return "";
        }
        from = fromOrig.toLowerCase();
        to = toOrig.toLowerCase();
        if (from === to) {
          return "";
        }
        let fromStart = 0;
        while (fromStart < from.length && from.charCodeAt(fromStart) === CHAR_BACKWARD_SLASH) {
          fromStart++;
        }
        let fromEnd = from.length;
        while (fromEnd - 1 > fromStart && from.charCodeAt(fromEnd - 1) === CHAR_BACKWARD_SLASH) {
          fromEnd--;
        }
        const fromLen = fromEnd - fromStart;
        let toStart = 0;
        while (toStart < to.length && to.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
          toStart++;
        }
        let toEnd = to.length;
        while (toEnd - 1 > toStart && to.charCodeAt(toEnd - 1) === CHAR_BACKWARD_SLASH) {
          toEnd--;
        }
        const toLen = toEnd - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for (; i < length; i++) {
          const fromCode = from.charCodeAt(fromStart + i);
          if (fromCode !== to.charCodeAt(toStart + i)) {
            break;
          } else if (fromCode === CHAR_BACKWARD_SLASH) {
            lastCommonSep = i;
          }
        }
        if (i !== length) {
          if (lastCommonSep === -1) {
            return toOrig;
          }
        } else {
          if (toLen > length) {
            if (to.charCodeAt(toStart + i) === CHAR_BACKWARD_SLASH) {
              return toOrig.slice(toStart + i + 1);
            }
            if (i === 2) {
              return toOrig.slice(toStart + i);
            }
          }
          if (fromLen > length) {
            if (from.charCodeAt(fromStart + i) === CHAR_BACKWARD_SLASH) {
              lastCommonSep = i;
            } else if (i === 2) {
              lastCommonSep = 3;
            }
          }
          if (lastCommonSep === -1) {
            lastCommonSep = 0;
          }
        }
        let out = "";
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
          if (i === fromEnd || from.charCodeAt(i) === CHAR_BACKWARD_SLASH) {
            out += out.length === 0 ? ".." : "\\..";
          }
        }
        toStart += lastCommonSep;
        if (out.length > 0) {
          return `${out}${toOrig.slice(toStart, toEnd)}`;
        }
        if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
          ++toStart;
        }
        return toOrig.slice(toStart, toEnd);
      },
      toNamespacedPath(path) {
        if (typeof path !== "string") {
          return path;
        }
        if (path.length === 0) {
          return "";
        }
        const resolvedPath = win32.resolve(path);
        if (resolvedPath.length <= 2) {
          return path;
        }
        if (resolvedPath.charCodeAt(0) === CHAR_BACKWARD_SLASH) {
          if (resolvedPath.charCodeAt(1) === CHAR_BACKWARD_SLASH) {
            const code = resolvedPath.charCodeAt(2);
            if (code !== CHAR_QUESTION_MARK && code !== CHAR_DOT) {
              return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
            }
          }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0)) && resolvedPath.charCodeAt(1) === CHAR_COLON && resolvedPath.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
          return `\\\\?\\${resolvedPath}`;
        }
        return path;
      },
      dirname(path) {
        validateString(path, "path");
        const len = path.length;
        if (len === 0) {
          return ".";
        }
        let rootEnd = -1;
        let offset = 0;
        const code = path.charCodeAt(0);
        if (len === 1) {
          return isPathSeparator(code) ? path : ".";
        }
        if (isPathSeparator(code)) {
          rootEnd = offset = 1;
          if (isPathSeparator(path.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                  j++;
                }
                if (j === len) {
                  return path;
                }
                if (j !== last) {
                  rootEnd = offset = j + 1;
                }
              }
            }
          }
        } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
          rootEnd = len > 2 && isPathSeparator(path.charCodeAt(2)) ? 3 : 2;
          offset = rootEnd;
        }
        let end = -1;
        let matchedSlash = true;
        for (let i = len - 1; i >= offset; --i) {
          if (isPathSeparator(path.charCodeAt(i))) {
            if (!matchedSlash) {
              end = i;
              break;
            }
          } else {
            matchedSlash = false;
          }
        }
        if (end === -1) {
          if (rootEnd === -1) {
            return ".";
          }
          end = rootEnd;
        }
        return path.slice(0, end);
      },
      basename(path, ext) {
        if (ext !== void 0) {
          validateString(ext, "ext");
        }
        validateString(path, "path");
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (path.length >= 2 && isWindowsDeviceRoot(path.charCodeAt(0)) && path.charCodeAt(1) === CHAR_COLON) {
          start = 2;
        }
        if (ext !== void 0 && ext.length > 0 && ext.length <= path.length) {
          if (ext === path) {
            return "";
          }
          let extIdx = ext.length - 1;
          let firstNonSlashEnd = -1;
          for (i = path.length - 1; i >= start; --i) {
            const code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
              if (!matchedSlash) {
                start = i + 1;
                break;
              }
            } else {
              if (firstNonSlashEnd === -1) {
                matchedSlash = false;
                firstNonSlashEnd = i + 1;
              }
              if (extIdx >= 0) {
                if (code === ext.charCodeAt(extIdx)) {
                  if (--extIdx === -1) {
                    end = i;
                  }
                } else {
                  extIdx = -1;
                  end = firstNonSlashEnd;
                }
              }
            }
          }
          if (start === end) {
            end = firstNonSlashEnd;
          } else if (end === -1) {
            end = path.length;
          }
          return path.slice(start, end);
        }
        for (i = path.length - 1; i >= start; --i) {
          if (isPathSeparator(path.charCodeAt(i))) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
        }
        if (end === -1) {
          return "";
        }
        return path.slice(start, end);
      },
      extname(path) {
        validateString(path, "path");
        let start = 0;
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        if (path.length >= 2 && path.charCodeAt(1) === CHAR_COLON && isWindowsDeviceRoot(path.charCodeAt(0))) {
          start = startPart = 2;
        }
        for (let i = path.length - 1; i >= start; --i) {
          const code = path.charCodeAt(i);
          if (isPathSeparator(code)) {
            if (!matchedSlash) {
              startPart = i + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
          if (code === CHAR_DOT) {
            if (startDot === -1) {
              startDot = i;
            } else if (preDotState !== 1) {
              preDotState = 1;
            }
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
          return "";
        }
        return path.slice(startDot, end);
      },
      format: _format.bind(null, "\\"),
      parse(path) {
        validateString(path, "path");
        const ret = { root: "", dir: "", base: "", ext: "", name: "" };
        if (path.length === 0) {
          return ret;
        }
        const len = path.length;
        let rootEnd = 0;
        let code = path.charCodeAt(0);
        if (len === 1) {
          if (isPathSeparator(code)) {
            ret.root = ret.dir = path;
            return ret;
          }
          ret.base = ret.name = path;
          return ret;
        }
        if (isPathSeparator(code)) {
          rootEnd = 1;
          if (isPathSeparator(path.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                  j++;
                }
                if (j === len) {
                  rootEnd = j;
                } else if (j !== last) {
                  rootEnd = j + 1;
                }
              }
            }
          }
        } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
          if (len <= 2) {
            ret.root = ret.dir = path;
            return ret;
          }
          rootEnd = 2;
          if (isPathSeparator(path.charCodeAt(2))) {
            if (len === 3) {
              ret.root = ret.dir = path;
              return ret;
            }
            rootEnd = 3;
          }
        }
        if (rootEnd > 0) {
          ret.root = path.slice(0, rootEnd);
        }
        let startDot = -1;
        let startPart = rootEnd;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        let preDotState = 0;
        for (; i >= rootEnd; --i) {
          code = path.charCodeAt(i);
          if (isPathSeparator(code)) {
            if (!matchedSlash) {
              startPart = i + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
          if (code === CHAR_DOT) {
            if (startDot === -1) {
              startDot = i;
            } else if (preDotState !== 1) {
              preDotState = 1;
            }
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (end !== -1) {
          if (startDot === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            ret.base = ret.name = path.slice(startPart, end);
          } else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
            ret.ext = path.slice(startDot, end);
          }
        }
        if (startPart > 0 && startPart !== rootEnd) {
          ret.dir = path.slice(0, startPart - 1);
        } else {
          ret.dir = ret.root;
        }
        return ret;
      },
      sep: "\\",
      delimiter: ";",
      win32: null,
      posix: null
    };
    const posix = {
      resolve(...pathSegments) {
        let resolvedPath = "";
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          const path = i >= 0 ? pathSegments[i] : cwd();
          validateString(path, "path");
          if (path.length === 0) {
            continue;
          }
          resolvedPath = `${path}/${resolvedPath}`;
          resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
        }
        resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
        if (resolvedAbsolute) {
          return `/${resolvedPath}`;
        }
        return resolvedPath.length > 0 ? resolvedPath : ".";
      },
      normalize(path) {
        validateString(path, "path");
        if (path.length === 0) {
          return ".";
        }
        const isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
        const trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;
        path = normalizeString(path, !isAbsolute, "/", isPosixPathSeparator);
        if (path.length === 0) {
          if (isAbsolute) {
            return "/";
          }
          return trailingSeparator ? "./" : ".";
        }
        if (trailingSeparator) {
          path += "/";
        }
        return isAbsolute ? `/${path}` : path;
      },
      isAbsolute(path) {
        validateString(path, "path");
        return path.length > 0 && path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      },
      join(...paths) {
        if (paths.length === 0) {
          return ".";
        }
        let joined;
        for (let i = 0; i < paths.length; ++i) {
          const arg = paths[i];
          validateString(arg, "path");
          if (arg.length > 0) {
            if (joined === void 0) {
              joined = arg;
            } else {
              joined += `/${arg}`;
            }
          }
        }
        if (joined === void 0) {
          return ".";
        }
        return posix.normalize(joined);
      },
      relative(from, to) {
        validateString(from, "from");
        validateString(to, "to");
        if (from === to) {
          return "";
        }
        from = posix.resolve(from);
        to = posix.resolve(to);
        if (from === to) {
          return "";
        }
        const fromStart = 1;
        const fromEnd = from.length;
        const fromLen = fromEnd - fromStart;
        const toStart = 1;
        const toLen = to.length - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for (; i < length; i++) {
          const fromCode = from.charCodeAt(fromStart + i);
          if (fromCode !== to.charCodeAt(toStart + i)) {
            break;
          } else if (fromCode === CHAR_FORWARD_SLASH) {
            lastCommonSep = i;
          }
        }
        if (i === length) {
          if (toLen > length) {
            if (to.charCodeAt(toStart + i) === CHAR_FORWARD_SLASH) {
              return to.slice(toStart + i + 1);
            }
            if (i === 0) {
              return to.slice(toStart + i);
            }
          } else if (fromLen > length) {
            if (from.charCodeAt(fromStart + i) === CHAR_FORWARD_SLASH) {
              lastCommonSep = i;
            } else if (i === 0) {
              lastCommonSep = 0;
            }
          }
        }
        let out = "";
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
          if (i === fromEnd || from.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            out += out.length === 0 ? ".." : "/..";
          }
        }
        return `${out}${to.slice(toStart + lastCommonSep)}`;
      },
      toNamespacedPath(path) {
        return path;
      },
      dirname(path) {
        validateString(path, "path");
        if (path.length === 0) {
          return ".";
        }
        const hasRoot = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
        let end = -1;
        let matchedSlash = true;
        for (let i = path.length - 1; i >= 1; --i) {
          if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              end = i;
              break;
            }
          } else {
            matchedSlash = false;
          }
        }
        if (end === -1) {
          return hasRoot ? "/" : ".";
        }
        if (hasRoot && end === 1) {
          return "//";
        }
        return path.slice(0, end);
      },
      basename(path, ext) {
        if (ext !== void 0) {
          validateString(ext, "ext");
        }
        validateString(path, "path");
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (ext !== void 0 && ext.length > 0 && ext.length <= path.length) {
          if (ext === path) {
            return "";
          }
          let extIdx = ext.length - 1;
          let firstNonSlashEnd = -1;
          for (i = path.length - 1; i >= 0; --i) {
            const code = path.charCodeAt(i);
            if (code === CHAR_FORWARD_SLASH) {
              if (!matchedSlash) {
                start = i + 1;
                break;
              }
            } else {
              if (firstNonSlashEnd === -1) {
                matchedSlash = false;
                firstNonSlashEnd = i + 1;
              }
              if (extIdx >= 0) {
                if (code === ext.charCodeAt(extIdx)) {
                  if (--extIdx === -1) {
                    end = i;
                  }
                } else {
                  extIdx = -1;
                  end = firstNonSlashEnd;
                }
              }
            }
          }
          if (start === end) {
            end = firstNonSlashEnd;
          } else if (end === -1) {
            end = path.length;
          }
          return path.slice(start, end);
        }
        for (i = path.length - 1; i >= 0; --i) {
          if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
        }
        if (end === -1) {
          return "";
        }
        return path.slice(start, end);
      },
      extname(path) {
        validateString(path, "path");
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        for (let i = path.length - 1; i >= 0; --i) {
          const code = path.charCodeAt(i);
          if (code === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              startPart = i + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
          if (code === CHAR_DOT) {
            if (startDot === -1) {
              startDot = i;
            } else if (preDotState !== 1) {
              preDotState = 1;
            }
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
          return "";
        }
        return path.slice(startDot, end);
      },
      format: _format.bind(null, "/"),
      parse(path) {
        validateString(path, "path");
        const ret = { root: "", dir: "", base: "", ext: "", name: "" };
        if (path.length === 0) {
          return ret;
        }
        const isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
        let start;
        if (isAbsolute) {
          ret.root = "/";
          start = 1;
        } else {
          start = 0;
        }
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        let preDotState = 0;
        for (; i >= start; --i) {
          const code = path.charCodeAt(i);
          if (code === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              startPart = i + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i + 1;
          }
          if (code === CHAR_DOT) {
            if (startDot === -1) {
              startDot = i;
            } else if (preDotState !== 1) {
              preDotState = 1;
            }
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (end !== -1) {
          const start2 = startPart === 0 && isAbsolute ? 1 : startPart;
          if (startDot === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            ret.base = ret.name = path.slice(start2, end);
          } else {
            ret.name = path.slice(start2, startDot);
            ret.base = path.slice(start2, end);
            ret.ext = path.slice(startDot, end);
          }
        }
        if (startPart > 0) {
          ret.dir = path.slice(0, startPart - 1);
        } else if (isAbsolute) {
          ret.dir = "/";
        }
        return ret;
      },
      sep: "/",
      delimiter: ":",
      win32: null,
      posix: null
    };
    posix.win32 = win32.win32 = win32;
    posix.posix = win32.posix = posix;
    platform === "win32" ? win32.normalize : posix.normalize;
    platform === "win32" ? win32.resolve : posix.resolve;
    platform === "win32" ? win32.relative : posix.relative;
    platform === "win32" ? win32.dirname : posix.dirname;
    platform === "win32" ? win32.basename : posix.basename;
    platform === "win32" ? win32.extname : posix.extname;
    platform === "win32" ? win32.sep : posix.sep;

    const _schemePattern = /^\w[\w\d+.-]*$/;
    const _singleSlashStart = /^\//;
    const _doubleSlashStart = /^\/\//;
    function _validateUri(ret, _strict) {
      if (!ret.scheme && _strict) {
        throw new Error(`[UriError]: Scheme is missing: {scheme: "", authority: "${ret.authority}", path: "${ret.path}", query: "${ret.query}", fragment: "${ret.fragment}"}`);
      }
      if (ret.scheme && !_schemePattern.test(ret.scheme)) {
        throw new Error("[UriError]: Scheme contains illegal characters.");
      }
      if (ret.path) {
        if (ret.authority) {
          if (!_singleSlashStart.test(ret.path)) {
            throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
          }
        } else {
          if (_doubleSlashStart.test(ret.path)) {
            throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
          }
        }
      }
    }
    function _schemeFix(scheme, _strict) {
      if (!scheme && !_strict) {
        return "file";
      }
      return scheme;
    }
    function _referenceResolution(scheme, path) {
      switch (scheme) {
        case "https":
        case "http":
        case "file":
          if (!path) {
            path = _slash;
          } else if (path[0] !== _slash) {
            path = _slash + path;
          }
          break;
      }
      return path;
    }
    const _empty = "";
    const _slash = "/";
    const _regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
    class URI$1 {
      constructor(schemeOrData, authority, path, query, fragment, _strict = false) {
        if (typeof schemeOrData === "object") {
          this.scheme = schemeOrData.scheme || _empty;
          this.authority = schemeOrData.authority || _empty;
          this.path = schemeOrData.path || _empty;
          this.query = schemeOrData.query || _empty;
          this.fragment = schemeOrData.fragment || _empty;
        } else {
          this.scheme = _schemeFix(schemeOrData, _strict);
          this.authority = authority || _empty;
          this.path = _referenceResolution(this.scheme, path || _empty);
          this.query = query || _empty;
          this.fragment = fragment || _empty;
          _validateUri(this, _strict);
        }
      }
      static isUri(thing) {
        if (thing instanceof URI$1) {
          return true;
        }
        if (!thing) {
          return false;
        }
        return typeof thing.authority === "string" && typeof thing.fragment === "string" && typeof thing.path === "string" && typeof thing.query === "string" && typeof thing.scheme === "string" && typeof thing.fsPath === "string" && typeof thing.with === "function" && typeof thing.toString === "function";
      }
      get fsPath() {
        return uriToFsPath(this, false);
      }
      with(change) {
        if (!change) {
          return this;
        }
        let { scheme, authority, path, query, fragment } = change;
        if (scheme === void 0) {
          scheme = this.scheme;
        } else if (scheme === null) {
          scheme = _empty;
        }
        if (authority === void 0) {
          authority = this.authority;
        } else if (authority === null) {
          authority = _empty;
        }
        if (path === void 0) {
          path = this.path;
        } else if (path === null) {
          path = _empty;
        }
        if (query === void 0) {
          query = this.query;
        } else if (query === null) {
          query = _empty;
        }
        if (fragment === void 0) {
          fragment = this.fragment;
        } else if (fragment === null) {
          fragment = _empty;
        }
        if (scheme === this.scheme && authority === this.authority && path === this.path && query === this.query && fragment === this.fragment) {
          return this;
        }
        return new Uri(scheme, authority, path, query, fragment);
      }
      static parse(value, _strict = false) {
        const match = _regexp.exec(value);
        if (!match) {
          return new Uri(_empty, _empty, _empty, _empty, _empty);
        }
        return new Uri(match[2] || _empty, percentDecode(match[4] || _empty), percentDecode(match[5] || _empty), percentDecode(match[7] || _empty), percentDecode(match[9] || _empty), _strict);
      }
      static file(path) {
        let authority = _empty;
        if (isWindows) {
          path = path.replace(/\\/g, _slash);
        }
        if (path[0] === _slash && path[1] === _slash) {
          const idx = path.indexOf(_slash, 2);
          if (idx === -1) {
            authority = path.substring(2);
            path = _slash;
          } else {
            authority = path.substring(2, idx);
            path = path.substring(idx) || _slash;
          }
        }
        return new Uri("file", authority, path, _empty, _empty);
      }
      static from(components) {
        const result = new Uri(components.scheme, components.authority, components.path, components.query, components.fragment);
        _validateUri(result, true);
        return result;
      }
      static joinPath(uri, ...pathFragment) {
        if (!uri.path) {
          throw new Error(`[UriError]: cannot call joinPath on URI without path`);
        }
        let newPath;
        if (isWindows && uri.scheme === "file") {
          newPath = URI$1.file(win32.join(uriToFsPath(uri, true), ...pathFragment)).path;
        } else {
          newPath = posix.join(uri.path, ...pathFragment);
        }
        return uri.with({ path: newPath });
      }
      toString(skipEncoding = false) {
        return _asFormatted(this, skipEncoding);
      }
      toJSON() {
        return this;
      }
      static revive(data) {
        if (!data) {
          return data;
        } else if (data instanceof URI$1) {
          return data;
        } else {
          const result = new Uri(data);
          result._formatted = data.external;
          result._fsPath = data._sep === _pathSepMarker ? data.fsPath : null;
          return result;
        }
      }
    }
    const _pathSepMarker = isWindows ? 1 : void 0;
    class Uri extends URI$1 {
      constructor() {
        super(...arguments);
        this._formatted = null;
        this._fsPath = null;
      }
      get fsPath() {
        if (!this._fsPath) {
          this._fsPath = uriToFsPath(this, false);
        }
        return this._fsPath;
      }
      toString(skipEncoding = false) {
        if (!skipEncoding) {
          if (!this._formatted) {
            this._formatted = _asFormatted(this, false);
          }
          return this._formatted;
        } else {
          return _asFormatted(this, true);
        }
      }
      toJSON() {
        const res = {
          $mid: 1
        };
        if (this._fsPath) {
          res.fsPath = this._fsPath;
          res._sep = _pathSepMarker;
        }
        if (this._formatted) {
          res.external = this._formatted;
        }
        if (this.path) {
          res.path = this.path;
        }
        if (this.scheme) {
          res.scheme = this.scheme;
        }
        if (this.authority) {
          res.authority = this.authority;
        }
        if (this.query) {
          res.query = this.query;
        }
        if (this.fragment) {
          res.fragment = this.fragment;
        }
        return res;
      }
    }
    const encodeTable = {
      [58]: "%3A",
      [47]: "%2F",
      [63]: "%3F",
      [35]: "%23",
      [91]: "%5B",
      [93]: "%5D",
      [64]: "%40",
      [33]: "%21",
      [36]: "%24",
      [38]: "%26",
      [39]: "%27",
      [40]: "%28",
      [41]: "%29",
      [42]: "%2A",
      [43]: "%2B",
      [44]: "%2C",
      [59]: "%3B",
      [61]: "%3D",
      [32]: "%20"
    };
    function encodeURIComponentFast(uriComponent, allowSlash) {
      let res = void 0;
      let nativeEncodePos = -1;
      for (let pos = 0; pos < uriComponent.length; pos++) {
        const code = uriComponent.charCodeAt(pos);
        if (code >= 97 && code <= 122 || code >= 65 && code <= 90 || code >= 48 && code <= 57 || code === 45 || code === 46 || code === 95 || code === 126 || allowSlash && code === 47) {
          if (nativeEncodePos !== -1) {
            res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
            nativeEncodePos = -1;
          }
          if (res !== void 0) {
            res += uriComponent.charAt(pos);
          }
        } else {
          if (res === void 0) {
            res = uriComponent.substr(0, pos);
          }
          const escaped = encodeTable[code];
          if (escaped !== void 0) {
            if (nativeEncodePos !== -1) {
              res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
              nativeEncodePos = -1;
            }
            res += escaped;
          } else if (nativeEncodePos === -1) {
            nativeEncodePos = pos;
          }
        }
      }
      if (nativeEncodePos !== -1) {
        res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
      }
      return res !== void 0 ? res : uriComponent;
    }
    function encodeURIComponentMinimal(path) {
      let res = void 0;
      for (let pos = 0; pos < path.length; pos++) {
        const code = path.charCodeAt(pos);
        if (code === 35 || code === 63) {
          if (res === void 0) {
            res = path.substr(0, pos);
          }
          res += encodeTable[code];
        } else {
          if (res !== void 0) {
            res += path[pos];
          }
        }
      }
      return res !== void 0 ? res : path;
    }
    function uriToFsPath(uri, keepDriveLetterCasing) {
      let value;
      if (uri.authority && uri.path.length > 1 && uri.scheme === "file") {
        value = `//${uri.authority}${uri.path}`;
      } else if (uri.path.charCodeAt(0) === 47 && (uri.path.charCodeAt(1) >= 65 && uri.path.charCodeAt(1) <= 90 || uri.path.charCodeAt(1) >= 97 && uri.path.charCodeAt(1) <= 122) && uri.path.charCodeAt(2) === 58) {
        if (!keepDriveLetterCasing) {
          value = uri.path[1].toLowerCase() + uri.path.substr(2);
        } else {
          value = uri.path.substr(1);
        }
      } else {
        value = uri.path;
      }
      if (isWindows) {
        value = value.replace(/\//g, "\\");
      }
      return value;
    }
    function _asFormatted(uri, skipEncoding) {
      const encoder = !skipEncoding ? encodeURIComponentFast : encodeURIComponentMinimal;
      let res = "";
      let { scheme, authority, path, query, fragment } = uri;
      if (scheme) {
        res += scheme;
        res += ":";
      }
      if (authority || scheme === "file") {
        res += _slash;
        res += _slash;
      }
      if (authority) {
        let idx = authority.indexOf("@");
        if (idx !== -1) {
          const userinfo = authority.substr(0, idx);
          authority = authority.substr(idx + 1);
          idx = userinfo.indexOf(":");
          if (idx === -1) {
            res += encoder(userinfo, false);
          } else {
            res += encoder(userinfo.substr(0, idx), false);
            res += ":";
            res += encoder(userinfo.substr(idx + 1), false);
          }
          res += "@";
        }
        authority = authority.toLowerCase();
        idx = authority.indexOf(":");
        if (idx === -1) {
          res += encoder(authority, false);
        } else {
          res += encoder(authority.substr(0, idx), false);
          res += authority.substr(idx);
        }
      }
      if (path) {
        if (path.length >= 3 && path.charCodeAt(0) === 47 && path.charCodeAt(2) === 58) {
          const code = path.charCodeAt(1);
          if (code >= 65 && code <= 90) {
            path = `/${String.fromCharCode(code + 32)}:${path.substr(3)}`;
          }
        } else if (path.length >= 2 && path.charCodeAt(1) === 58) {
          const code = path.charCodeAt(0);
          if (code >= 65 && code <= 90) {
            path = `${String.fromCharCode(code + 32)}:${path.substr(2)}`;
          }
        }
        res += encoder(path, true);
      }
      if (query) {
        res += "?";
        res += encoder(query, false);
      }
      if (fragment) {
        res += "#";
        res += !skipEncoding ? encodeURIComponentFast(fragment, false) : fragment;
      }
      return res;
    }
    function decodeURIComponentGraceful(str) {
      try {
        return decodeURIComponent(str);
      } catch (_a) {
        if (str.length > 3) {
          return str.substr(0, 3) + decodeURIComponentGraceful(str.substr(3));
        } else {
          return str;
        }
      }
    }
    const _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
    function percentDecode(str) {
      if (!str.match(_rEncodedAsHex)) {
        return str;
      }
      return str.replace(_rEncodedAsHex, (match) => decodeURIComponentGraceful(match));
    }

    class Position$1 {
      constructor(lineNumber, column) {
        this.lineNumber = lineNumber;
        this.column = column;
      }
      with(newLineNumber = this.lineNumber, newColumn = this.column) {
        if (newLineNumber === this.lineNumber && newColumn === this.column) {
          return this;
        } else {
          return new Position$1(newLineNumber, newColumn);
        }
      }
      delta(deltaLineNumber = 0, deltaColumn = 0) {
        return this.with(this.lineNumber + deltaLineNumber, this.column + deltaColumn);
      }
      equals(other) {
        return Position$1.equals(this, other);
      }
      static equals(a, b) {
        if (!a && !b) {
          return true;
        }
        return !!a && !!b && a.lineNumber === b.lineNumber && a.column === b.column;
      }
      isBefore(other) {
        return Position$1.isBefore(this, other);
      }
      static isBefore(a, b) {
        if (a.lineNumber < b.lineNumber) {
          return true;
        }
        if (b.lineNumber < a.lineNumber) {
          return false;
        }
        return a.column < b.column;
      }
      isBeforeOrEqual(other) {
        return Position$1.isBeforeOrEqual(this, other);
      }
      static isBeforeOrEqual(a, b) {
        if (a.lineNumber < b.lineNumber) {
          return true;
        }
        if (b.lineNumber < a.lineNumber) {
          return false;
        }
        return a.column <= b.column;
      }
      static compare(a, b) {
        let aLineNumber = a.lineNumber | 0;
        let bLineNumber = b.lineNumber | 0;
        if (aLineNumber === bLineNumber) {
          let aColumn = a.column | 0;
          let bColumn = b.column | 0;
          return aColumn - bColumn;
        }
        return aLineNumber - bLineNumber;
      }
      clone() {
        return new Position$1(this.lineNumber, this.column);
      }
      toString() {
        return "(" + this.lineNumber + "," + this.column + ")";
      }
      static lift(pos) {
        return new Position$1(pos.lineNumber, pos.column);
      }
      static isIPosition(obj) {
        return obj && typeof obj.lineNumber === "number" && typeof obj.column === "number";
      }
    }

    class Range$1 {
      constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
        if (startLineNumber > endLineNumber || startLineNumber === endLineNumber && startColumn > endColumn) {
          this.startLineNumber = endLineNumber;
          this.startColumn = endColumn;
          this.endLineNumber = startLineNumber;
          this.endColumn = startColumn;
        } else {
          this.startLineNumber = startLineNumber;
          this.startColumn = startColumn;
          this.endLineNumber = endLineNumber;
          this.endColumn = endColumn;
        }
      }
      isEmpty() {
        return Range$1.isEmpty(this);
      }
      static isEmpty(range) {
        return range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn;
      }
      containsPosition(position) {
        return Range$1.containsPosition(this, position);
      }
      static containsPosition(range, position) {
        if (position.lineNumber < range.startLineNumber || position.lineNumber > range.endLineNumber) {
          return false;
        }
        if (position.lineNumber === range.startLineNumber && position.column < range.startColumn) {
          return false;
        }
        if (position.lineNumber === range.endLineNumber && position.column > range.endColumn) {
          return false;
        }
        return true;
      }
      containsRange(range) {
        return Range$1.containsRange(this, range);
      }
      static containsRange(range, otherRange) {
        if (otherRange.startLineNumber < range.startLineNumber || otherRange.endLineNumber < range.startLineNumber) {
          return false;
        }
        if (otherRange.startLineNumber > range.endLineNumber || otherRange.endLineNumber > range.endLineNumber) {
          return false;
        }
        if (otherRange.startLineNumber === range.startLineNumber && otherRange.startColumn < range.startColumn) {
          return false;
        }
        if (otherRange.endLineNumber === range.endLineNumber && otherRange.endColumn > range.endColumn) {
          return false;
        }
        return true;
      }
      strictContainsRange(range) {
        return Range$1.strictContainsRange(this, range);
      }
      static strictContainsRange(range, otherRange) {
        if (otherRange.startLineNumber < range.startLineNumber || otherRange.endLineNumber < range.startLineNumber) {
          return false;
        }
        if (otherRange.startLineNumber > range.endLineNumber || otherRange.endLineNumber > range.endLineNumber) {
          return false;
        }
        if (otherRange.startLineNumber === range.startLineNumber && otherRange.startColumn <= range.startColumn) {
          return false;
        }
        if (otherRange.endLineNumber === range.endLineNumber && otherRange.endColumn >= range.endColumn) {
          return false;
        }
        return true;
      }
      plusRange(range) {
        return Range$1.plusRange(this, range);
      }
      static plusRange(a, b) {
        let startLineNumber;
        let startColumn;
        let endLineNumber;
        let endColumn;
        if (b.startLineNumber < a.startLineNumber) {
          startLineNumber = b.startLineNumber;
          startColumn = b.startColumn;
        } else if (b.startLineNumber === a.startLineNumber) {
          startLineNumber = b.startLineNumber;
          startColumn = Math.min(b.startColumn, a.startColumn);
        } else {
          startLineNumber = a.startLineNumber;
          startColumn = a.startColumn;
        }
        if (b.endLineNumber > a.endLineNumber) {
          endLineNumber = b.endLineNumber;
          endColumn = b.endColumn;
        } else if (b.endLineNumber === a.endLineNumber) {
          endLineNumber = b.endLineNumber;
          endColumn = Math.max(b.endColumn, a.endColumn);
        } else {
          endLineNumber = a.endLineNumber;
          endColumn = a.endColumn;
        }
        return new Range$1(startLineNumber, startColumn, endLineNumber, endColumn);
      }
      intersectRanges(range) {
        return Range$1.intersectRanges(this, range);
      }
      static intersectRanges(a, b) {
        let resultStartLineNumber = a.startLineNumber;
        let resultStartColumn = a.startColumn;
        let resultEndLineNumber = a.endLineNumber;
        let resultEndColumn = a.endColumn;
        let otherStartLineNumber = b.startLineNumber;
        let otherStartColumn = b.startColumn;
        let otherEndLineNumber = b.endLineNumber;
        let otherEndColumn = b.endColumn;
        if (resultStartLineNumber < otherStartLineNumber) {
          resultStartLineNumber = otherStartLineNumber;
          resultStartColumn = otherStartColumn;
        } else if (resultStartLineNumber === otherStartLineNumber) {
          resultStartColumn = Math.max(resultStartColumn, otherStartColumn);
        }
        if (resultEndLineNumber > otherEndLineNumber) {
          resultEndLineNumber = otherEndLineNumber;
          resultEndColumn = otherEndColumn;
        } else if (resultEndLineNumber === otherEndLineNumber) {
          resultEndColumn = Math.min(resultEndColumn, otherEndColumn);
        }
        if (resultStartLineNumber > resultEndLineNumber) {
          return null;
        }
        if (resultStartLineNumber === resultEndLineNumber && resultStartColumn > resultEndColumn) {
          return null;
        }
        return new Range$1(resultStartLineNumber, resultStartColumn, resultEndLineNumber, resultEndColumn);
      }
      equalsRange(other) {
        return Range$1.equalsRange(this, other);
      }
      static equalsRange(a, b) {
        return !!a && !!b && a.startLineNumber === b.startLineNumber && a.startColumn === b.startColumn && a.endLineNumber === b.endLineNumber && a.endColumn === b.endColumn;
      }
      getEndPosition() {
        return Range$1.getEndPosition(this);
      }
      static getEndPosition(range) {
        return new Position$1(range.endLineNumber, range.endColumn);
      }
      getStartPosition() {
        return Range$1.getStartPosition(this);
      }
      static getStartPosition(range) {
        return new Position$1(range.startLineNumber, range.startColumn);
      }
      toString() {
        return "[" + this.startLineNumber + "," + this.startColumn + " -> " + this.endLineNumber + "," + this.endColumn + "]";
      }
      setEndPosition(endLineNumber, endColumn) {
        return new Range$1(this.startLineNumber, this.startColumn, endLineNumber, endColumn);
      }
      setStartPosition(startLineNumber, startColumn) {
        return new Range$1(startLineNumber, startColumn, this.endLineNumber, this.endColumn);
      }
      collapseToStart() {
        return Range$1.collapseToStart(this);
      }
      static collapseToStart(range) {
        return new Range$1(range.startLineNumber, range.startColumn, range.startLineNumber, range.startColumn);
      }
      static fromPositions(start, end = start) {
        return new Range$1(start.lineNumber, start.column, end.lineNumber, end.column);
      }
      static lift(range) {
        if (!range) {
          return null;
        }
        return new Range$1(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
      }
      static isIRange(obj) {
        return obj && typeof obj.startLineNumber === "number" && typeof obj.startColumn === "number" && typeof obj.endLineNumber === "number" && typeof obj.endColumn === "number";
      }
      static areIntersectingOrTouching(a, b) {
        if (a.endLineNumber < b.startLineNumber || a.endLineNumber === b.startLineNumber && a.endColumn < b.startColumn) {
          return false;
        }
        if (b.endLineNumber < a.startLineNumber || b.endLineNumber === a.startLineNumber && b.endColumn < a.startColumn) {
          return false;
        }
        return true;
      }
      static areIntersecting(a, b) {
        if (a.endLineNumber < b.startLineNumber || a.endLineNumber === b.startLineNumber && a.endColumn <= b.startColumn) {
          return false;
        }
        if (b.endLineNumber < a.startLineNumber || b.endLineNumber === a.startLineNumber && b.endColumn <= a.startColumn) {
          return false;
        }
        return true;
      }
      static compareRangesUsingStarts(a, b) {
        if (a && b) {
          const aStartLineNumber = a.startLineNumber | 0;
          const bStartLineNumber = b.startLineNumber | 0;
          if (aStartLineNumber === bStartLineNumber) {
            const aStartColumn = a.startColumn | 0;
            const bStartColumn = b.startColumn | 0;
            if (aStartColumn === bStartColumn) {
              const aEndLineNumber = a.endLineNumber | 0;
              const bEndLineNumber = b.endLineNumber | 0;
              if (aEndLineNumber === bEndLineNumber) {
                const aEndColumn = a.endColumn | 0;
                const bEndColumn = b.endColumn | 0;
                return aEndColumn - bEndColumn;
              }
              return aEndLineNumber - bEndLineNumber;
            }
            return aStartColumn - bStartColumn;
          }
          return aStartLineNumber - bStartLineNumber;
        }
        const aExists = a ? 1 : 0;
        const bExists = b ? 1 : 0;
        return aExists - bExists;
      }
      static compareRangesUsingEnds(a, b) {
        if (a.endLineNumber === b.endLineNumber) {
          if (a.endColumn === b.endColumn) {
            if (a.startLineNumber === b.startLineNumber) {
              return a.startColumn - b.startColumn;
            }
            return a.startLineNumber - b.startLineNumber;
          }
          return a.endColumn - b.endColumn;
        }
        return a.endLineNumber - b.endLineNumber;
      }
      static spansMultipleLines(range) {
        return range.endLineNumber > range.startLineNumber;
      }
    }

    const MINIMUM_MATCHING_CHARACTER_LENGTH = 3;
    function computeDiff(originalSequence, modifiedSequence, continueProcessingPredicate, pretty) {
      const diffAlgo = new LcsDiff(originalSequence, modifiedSequence, continueProcessingPredicate);
      return diffAlgo.ComputeDiff(pretty);
    }
    class LineSequence {
      constructor(lines) {
        const startColumns = [];
        const endColumns = [];
        for (let i = 0, length = lines.length; i < length; i++) {
          startColumns[i] = getFirstNonBlankColumn(lines[i], 1);
          endColumns[i] = getLastNonBlankColumn(lines[i], 1);
        }
        this.lines = lines;
        this._startColumns = startColumns;
        this._endColumns = endColumns;
      }
      getElements() {
        const elements = [];
        for (let i = 0, len = this.lines.length; i < len; i++) {
          elements[i] = this.lines[i].substring(this._startColumns[i] - 1, this._endColumns[i] - 1);
        }
        return elements;
      }
      getStrictElement(index) {
        return this.lines[index];
      }
      getStartLineNumber(i) {
        return i + 1;
      }
      getEndLineNumber(i) {
        return i + 1;
      }
      createCharSequence(shouldIgnoreTrimWhitespace, startIndex, endIndex) {
        const charCodes = [];
        const lineNumbers = [];
        const columns = [];
        let len = 0;
        for (let index = startIndex; index <= endIndex; index++) {
          const lineContent = this.lines[index];
          const startColumn = shouldIgnoreTrimWhitespace ? this._startColumns[index] : 1;
          const endColumn = shouldIgnoreTrimWhitespace ? this._endColumns[index] : lineContent.length + 1;
          for (let col = startColumn; col < endColumn; col++) {
            charCodes[len] = lineContent.charCodeAt(col - 1);
            lineNumbers[len] = index + 1;
            columns[len] = col;
            len++;
          }
        }
        return new CharSequence(charCodes, lineNumbers, columns);
      }
    }
    class CharSequence {
      constructor(charCodes, lineNumbers, columns) {
        this._charCodes = charCodes;
        this._lineNumbers = lineNumbers;
        this._columns = columns;
      }
      getElements() {
        return this._charCodes;
      }
      getStartLineNumber(i) {
        return this._lineNumbers[i];
      }
      getStartColumn(i) {
        return this._columns[i];
      }
      getEndLineNumber(i) {
        return this._lineNumbers[i];
      }
      getEndColumn(i) {
        return this._columns[i] + 1;
      }
    }
    class CharChange {
      constructor(originalStartLineNumber, originalStartColumn, originalEndLineNumber, originalEndColumn, modifiedStartLineNumber, modifiedStartColumn, modifiedEndLineNumber, modifiedEndColumn) {
        this.originalStartLineNumber = originalStartLineNumber;
        this.originalStartColumn = originalStartColumn;
        this.originalEndLineNumber = originalEndLineNumber;
        this.originalEndColumn = originalEndColumn;
        this.modifiedStartLineNumber = modifiedStartLineNumber;
        this.modifiedStartColumn = modifiedStartColumn;
        this.modifiedEndLineNumber = modifiedEndLineNumber;
        this.modifiedEndColumn = modifiedEndColumn;
      }
      static createFromDiffChange(diffChange, originalCharSequence, modifiedCharSequence) {
        let originalStartLineNumber;
        let originalStartColumn;
        let originalEndLineNumber;
        let originalEndColumn;
        let modifiedStartLineNumber;
        let modifiedStartColumn;
        let modifiedEndLineNumber;
        let modifiedEndColumn;
        if (diffChange.originalLength === 0) {
          originalStartLineNumber = 0;
          originalStartColumn = 0;
          originalEndLineNumber = 0;
          originalEndColumn = 0;
        } else {
          originalStartLineNumber = originalCharSequence.getStartLineNumber(diffChange.originalStart);
          originalStartColumn = originalCharSequence.getStartColumn(diffChange.originalStart);
          originalEndLineNumber = originalCharSequence.getEndLineNumber(diffChange.originalStart + diffChange.originalLength - 1);
          originalEndColumn = originalCharSequence.getEndColumn(diffChange.originalStart + diffChange.originalLength - 1);
        }
        if (diffChange.modifiedLength === 0) {
          modifiedStartLineNumber = 0;
          modifiedStartColumn = 0;
          modifiedEndLineNumber = 0;
          modifiedEndColumn = 0;
        } else {
          modifiedStartLineNumber = modifiedCharSequence.getStartLineNumber(diffChange.modifiedStart);
          modifiedStartColumn = modifiedCharSequence.getStartColumn(diffChange.modifiedStart);
          modifiedEndLineNumber = modifiedCharSequence.getEndLineNumber(diffChange.modifiedStart + diffChange.modifiedLength - 1);
          modifiedEndColumn = modifiedCharSequence.getEndColumn(diffChange.modifiedStart + diffChange.modifiedLength - 1);
        }
        return new CharChange(originalStartLineNumber, originalStartColumn, originalEndLineNumber, originalEndColumn, modifiedStartLineNumber, modifiedStartColumn, modifiedEndLineNumber, modifiedEndColumn);
      }
    }
    function postProcessCharChanges(rawChanges) {
      if (rawChanges.length <= 1) {
        return rawChanges;
      }
      const result = [rawChanges[0]];
      let prevChange = result[0];
      for (let i = 1, len = rawChanges.length; i < len; i++) {
        const currChange = rawChanges[i];
        const originalMatchingLength = currChange.originalStart - (prevChange.originalStart + prevChange.originalLength);
        const modifiedMatchingLength = currChange.modifiedStart - (prevChange.modifiedStart + prevChange.modifiedLength);
        const matchingLength = Math.min(originalMatchingLength, modifiedMatchingLength);
        if (matchingLength < MINIMUM_MATCHING_CHARACTER_LENGTH) {
          prevChange.originalLength = currChange.originalStart + currChange.originalLength - prevChange.originalStart;
          prevChange.modifiedLength = currChange.modifiedStart + currChange.modifiedLength - prevChange.modifiedStart;
        } else {
          result.push(currChange);
          prevChange = currChange;
        }
      }
      return result;
    }
    class LineChange {
      constructor(originalStartLineNumber, originalEndLineNumber, modifiedStartLineNumber, modifiedEndLineNumber, charChanges) {
        this.originalStartLineNumber = originalStartLineNumber;
        this.originalEndLineNumber = originalEndLineNumber;
        this.modifiedStartLineNumber = modifiedStartLineNumber;
        this.modifiedEndLineNumber = modifiedEndLineNumber;
        this.charChanges = charChanges;
      }
      static createFromDiffResult(shouldIgnoreTrimWhitespace, diffChange, originalLineSequence, modifiedLineSequence, continueCharDiff, shouldComputeCharChanges, shouldPostProcessCharChanges) {
        let originalStartLineNumber;
        let originalEndLineNumber;
        let modifiedStartLineNumber;
        let modifiedEndLineNumber;
        let charChanges = void 0;
        if (diffChange.originalLength === 0) {
          originalStartLineNumber = originalLineSequence.getStartLineNumber(diffChange.originalStart) - 1;
          originalEndLineNumber = 0;
        } else {
          originalStartLineNumber = originalLineSequence.getStartLineNumber(diffChange.originalStart);
          originalEndLineNumber = originalLineSequence.getEndLineNumber(diffChange.originalStart + diffChange.originalLength - 1);
        }
        if (diffChange.modifiedLength === 0) {
          modifiedStartLineNumber = modifiedLineSequence.getStartLineNumber(diffChange.modifiedStart) - 1;
          modifiedEndLineNumber = 0;
        } else {
          modifiedStartLineNumber = modifiedLineSequence.getStartLineNumber(diffChange.modifiedStart);
          modifiedEndLineNumber = modifiedLineSequence.getEndLineNumber(diffChange.modifiedStart + diffChange.modifiedLength - 1);
        }
        if (shouldComputeCharChanges && diffChange.originalLength > 0 && diffChange.originalLength < 20 && diffChange.modifiedLength > 0 && diffChange.modifiedLength < 20 && continueCharDiff()) {
          const originalCharSequence = originalLineSequence.createCharSequence(shouldIgnoreTrimWhitespace, diffChange.originalStart, diffChange.originalStart + diffChange.originalLength - 1);
          const modifiedCharSequence = modifiedLineSequence.createCharSequence(shouldIgnoreTrimWhitespace, diffChange.modifiedStart, diffChange.modifiedStart + diffChange.modifiedLength - 1);
          let rawChanges = computeDiff(originalCharSequence, modifiedCharSequence, continueCharDiff, true).changes;
          if (shouldPostProcessCharChanges) {
            rawChanges = postProcessCharChanges(rawChanges);
          }
          charChanges = [];
          for (let i = 0, length = rawChanges.length; i < length; i++) {
            charChanges.push(CharChange.createFromDiffChange(rawChanges[i], originalCharSequence, modifiedCharSequence));
          }
        }
        return new LineChange(originalStartLineNumber, originalEndLineNumber, modifiedStartLineNumber, modifiedEndLineNumber, charChanges);
      }
    }
    class DiffComputer {
      constructor(originalLines, modifiedLines, opts) {
        this.shouldComputeCharChanges = opts.shouldComputeCharChanges;
        this.shouldPostProcessCharChanges = opts.shouldPostProcessCharChanges;
        this.shouldIgnoreTrimWhitespace = opts.shouldIgnoreTrimWhitespace;
        this.shouldMakePrettyDiff = opts.shouldMakePrettyDiff;
        this.originalLines = originalLines;
        this.modifiedLines = modifiedLines;
        this.original = new LineSequence(originalLines);
        this.modified = new LineSequence(modifiedLines);
        this.continueLineDiff = createContinueProcessingPredicate(opts.maxComputationTime);
        this.continueCharDiff = createContinueProcessingPredicate(opts.maxComputationTime === 0 ? 0 : Math.min(opts.maxComputationTime, 5e3));
      }
      computeDiff() {
        if (this.original.lines.length === 1 && this.original.lines[0].length === 0) {
          if (this.modified.lines.length === 1 && this.modified.lines[0].length === 0) {
            return {
              quitEarly: false,
              changes: []
            };
          }
          return {
            quitEarly: false,
            changes: [{
              originalStartLineNumber: 1,
              originalEndLineNumber: 1,
              modifiedStartLineNumber: 1,
              modifiedEndLineNumber: this.modified.lines.length,
              charChanges: [{
                modifiedEndColumn: 0,
                modifiedEndLineNumber: 0,
                modifiedStartColumn: 0,
                modifiedStartLineNumber: 0,
                originalEndColumn: 0,
                originalEndLineNumber: 0,
                originalStartColumn: 0,
                originalStartLineNumber: 0
              }]
            }]
          };
        }
        if (this.modified.lines.length === 1 && this.modified.lines[0].length === 0) {
          return {
            quitEarly: false,
            changes: [{
              originalStartLineNumber: 1,
              originalEndLineNumber: this.original.lines.length,
              modifiedStartLineNumber: 1,
              modifiedEndLineNumber: 1,
              charChanges: [{
                modifiedEndColumn: 0,
                modifiedEndLineNumber: 0,
                modifiedStartColumn: 0,
                modifiedStartLineNumber: 0,
                originalEndColumn: 0,
                originalEndLineNumber: 0,
                originalStartColumn: 0,
                originalStartLineNumber: 0
              }]
            }]
          };
        }
        const diffResult = computeDiff(this.original, this.modified, this.continueLineDiff, this.shouldMakePrettyDiff);
        const rawChanges = diffResult.changes;
        const quitEarly = diffResult.quitEarly;
        if (this.shouldIgnoreTrimWhitespace) {
          const lineChanges = [];
          for (let i = 0, length = rawChanges.length; i < length; i++) {
            lineChanges.push(LineChange.createFromDiffResult(this.shouldIgnoreTrimWhitespace, rawChanges[i], this.original, this.modified, this.continueCharDiff, this.shouldComputeCharChanges, this.shouldPostProcessCharChanges));
          }
          return {
            quitEarly,
            changes: lineChanges
          };
        }
        const result = [];
        let originalLineIndex = 0;
        let modifiedLineIndex = 0;
        for (let i = -1, len = rawChanges.length; i < len; i++) {
          const nextChange = i + 1 < len ? rawChanges[i + 1] : null;
          const originalStop = nextChange ? nextChange.originalStart : this.originalLines.length;
          const modifiedStop = nextChange ? nextChange.modifiedStart : this.modifiedLines.length;
          while (originalLineIndex < originalStop && modifiedLineIndex < modifiedStop) {
            const originalLine = this.originalLines[originalLineIndex];
            const modifiedLine = this.modifiedLines[modifiedLineIndex];
            if (originalLine !== modifiedLine) {
              {
                let originalStartColumn = getFirstNonBlankColumn(originalLine, 1);
                let modifiedStartColumn = getFirstNonBlankColumn(modifiedLine, 1);
                while (originalStartColumn > 1 && modifiedStartColumn > 1) {
                  const originalChar = originalLine.charCodeAt(originalStartColumn - 2);
                  const modifiedChar = modifiedLine.charCodeAt(modifiedStartColumn - 2);
                  if (originalChar !== modifiedChar) {
                    break;
                  }
                  originalStartColumn--;
                  modifiedStartColumn--;
                }
                if (originalStartColumn > 1 || modifiedStartColumn > 1) {
                  this._pushTrimWhitespaceCharChange(result, originalLineIndex + 1, 1, originalStartColumn, modifiedLineIndex + 1, 1, modifiedStartColumn);
                }
              }
              {
                let originalEndColumn = getLastNonBlankColumn(originalLine, 1);
                let modifiedEndColumn = getLastNonBlankColumn(modifiedLine, 1);
                const originalMaxColumn = originalLine.length + 1;
                const modifiedMaxColumn = modifiedLine.length + 1;
                while (originalEndColumn < originalMaxColumn && modifiedEndColumn < modifiedMaxColumn) {
                  const originalChar = originalLine.charCodeAt(originalEndColumn - 1);
                  const modifiedChar = originalLine.charCodeAt(modifiedEndColumn - 1);
                  if (originalChar !== modifiedChar) {
                    break;
                  }
                  originalEndColumn++;
                  modifiedEndColumn++;
                }
                if (originalEndColumn < originalMaxColumn || modifiedEndColumn < modifiedMaxColumn) {
                  this._pushTrimWhitespaceCharChange(result, originalLineIndex + 1, originalEndColumn, originalMaxColumn, modifiedLineIndex + 1, modifiedEndColumn, modifiedMaxColumn);
                }
              }
            }
            originalLineIndex++;
            modifiedLineIndex++;
          }
          if (nextChange) {
            result.push(LineChange.createFromDiffResult(this.shouldIgnoreTrimWhitespace, nextChange, this.original, this.modified, this.continueCharDiff, this.shouldComputeCharChanges, this.shouldPostProcessCharChanges));
            originalLineIndex += nextChange.originalLength;
            modifiedLineIndex += nextChange.modifiedLength;
          }
        }
        return {
          quitEarly,
          changes: result
        };
      }
      _pushTrimWhitespaceCharChange(result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn) {
        if (this._mergeTrimWhitespaceCharChange(result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn)) {
          return;
        }
        let charChanges = void 0;
        if (this.shouldComputeCharChanges) {
          charChanges = [new CharChange(originalLineNumber, originalStartColumn, originalLineNumber, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedLineNumber, modifiedEndColumn)];
        }
        result.push(new LineChange(originalLineNumber, originalLineNumber, modifiedLineNumber, modifiedLineNumber, charChanges));
      }
      _mergeTrimWhitespaceCharChange(result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn) {
        const len = result.length;
        if (len === 0) {
          return false;
        }
        const prevChange = result[len - 1];
        if (prevChange.originalEndLineNumber === 0 || prevChange.modifiedEndLineNumber === 0) {
          return false;
        }
        if (prevChange.originalEndLineNumber + 1 === originalLineNumber && prevChange.modifiedEndLineNumber + 1 === modifiedLineNumber) {
          prevChange.originalEndLineNumber = originalLineNumber;
          prevChange.modifiedEndLineNumber = modifiedLineNumber;
          if (this.shouldComputeCharChanges && prevChange.charChanges) {
            prevChange.charChanges.push(new CharChange(originalLineNumber, originalStartColumn, originalLineNumber, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedLineNumber, modifiedEndColumn));
          }
          return true;
        }
        return false;
      }
    }
    function getFirstNonBlankColumn(txt, defaultValue) {
      const r = firstNonWhitespaceIndex(txt);
      if (r === -1) {
        return defaultValue;
      }
      return r + 1;
    }
    function getLastNonBlankColumn(txt, defaultValue) {
      const r = lastNonWhitespaceIndex(txt);
      if (r === -1) {
        return defaultValue;
      }
      return r + 2;
    }
    function createContinueProcessingPredicate(maximumRuntime) {
      if (maximumRuntime === 0) {
        return () => true;
      }
      const startTime = Date.now();
      return () => {
        return Date.now() - startTime < maximumRuntime;
      };
    }

    function toUint8(v) {
      if (v < 0) {
        return 0;
      }
      if (v > 255) {
        return 255;
      }
      return v | 0;
    }
    function toUint32(v) {
      if (v < 0) {
        return 0;
      }
      if (v > 4294967295) {
        return 4294967295;
      }
      return v | 0;
    }

    class PrefixSumIndexOfResult {
      constructor(index, remainder) {
        this._prefixSumIndexOfResultBrand = void 0;
        this.index = index;
        this.remainder = remainder;
      }
    }
    class PrefixSumComputer {
      constructor(values) {
        this.values = values;
        this.prefixSum = new Uint32Array(values.length);
        this.prefixSumValidIndex = new Int32Array(1);
        this.prefixSumValidIndex[0] = -1;
      }
      insertValues(insertIndex, insertValues) {
        insertIndex = toUint32(insertIndex);
        const oldValues = this.values;
        const oldPrefixSum = this.prefixSum;
        const insertValuesLen = insertValues.length;
        if (insertValuesLen === 0) {
          return false;
        }
        this.values = new Uint32Array(oldValues.length + insertValuesLen);
        this.values.set(oldValues.subarray(0, insertIndex), 0);
        this.values.set(oldValues.subarray(insertIndex), insertIndex + insertValuesLen);
        this.values.set(insertValues, insertIndex);
        if (insertIndex - 1 < this.prefixSumValidIndex[0]) {
          this.prefixSumValidIndex[0] = insertIndex - 1;
        }
        this.prefixSum = new Uint32Array(this.values.length);
        if (this.prefixSumValidIndex[0] >= 0) {
          this.prefixSum.set(oldPrefixSum.subarray(0, this.prefixSumValidIndex[0] + 1));
        }
        return true;
      }
      changeValue(index, value) {
        index = toUint32(index);
        value = toUint32(value);
        if (this.values[index] === value) {
          return false;
        }
        this.values[index] = value;
        if (index - 1 < this.prefixSumValidIndex[0]) {
          this.prefixSumValidIndex[0] = index - 1;
        }
        return true;
      }
      removeValues(startIndex, count) {
        startIndex = toUint32(startIndex);
        count = toUint32(count);
        const oldValues = this.values;
        const oldPrefixSum = this.prefixSum;
        if (startIndex >= oldValues.length) {
          return false;
        }
        let maxCount = oldValues.length - startIndex;
        if (count >= maxCount) {
          count = maxCount;
        }
        if (count === 0) {
          return false;
        }
        this.values = new Uint32Array(oldValues.length - count);
        this.values.set(oldValues.subarray(0, startIndex), 0);
        this.values.set(oldValues.subarray(startIndex + count), startIndex);
        this.prefixSum = new Uint32Array(this.values.length);
        if (startIndex - 1 < this.prefixSumValidIndex[0]) {
          this.prefixSumValidIndex[0] = startIndex - 1;
        }
        if (this.prefixSumValidIndex[0] >= 0) {
          this.prefixSum.set(oldPrefixSum.subarray(0, this.prefixSumValidIndex[0] + 1));
        }
        return true;
      }
      getTotalSum() {
        if (this.values.length === 0) {
          return 0;
        }
        return this._getPrefixSum(this.values.length - 1);
      }
      getPrefixSum(index) {
        if (index < 0) {
          return 0;
        }
        index = toUint32(index);
        return this._getPrefixSum(index);
      }
      _getPrefixSum(index) {
        if (index <= this.prefixSumValidIndex[0]) {
          return this.prefixSum[index];
        }
        let startIndex = this.prefixSumValidIndex[0] + 1;
        if (startIndex === 0) {
          this.prefixSum[0] = this.values[0];
          startIndex++;
        }
        if (index >= this.values.length) {
          index = this.values.length - 1;
        }
        for (let i = startIndex; i <= index; i++) {
          this.prefixSum[i] = this.prefixSum[i - 1] + this.values[i];
        }
        this.prefixSumValidIndex[0] = Math.max(this.prefixSumValidIndex[0], index);
        return this.prefixSum[index];
      }
      getIndexOf(sum) {
        sum = Math.floor(sum);
        this.getTotalSum();
        let low = 0;
        let high = this.values.length - 1;
        let mid = 0;
        let midStop = 0;
        let midStart = 0;
        while (low <= high) {
          mid = low + (high - low) / 2 | 0;
          midStop = this.prefixSum[mid];
          midStart = midStop - this.values[mid];
          if (sum < midStart) {
            high = mid - 1;
          } else if (sum >= midStop) {
            low = mid + 1;
          } else {
            break;
          }
        }
        return new PrefixSumIndexOfResult(mid, sum - midStart);
      }
    }

    class MirrorTextModel {
      constructor(uri, lines, eol, versionId) {
        this._uri = uri;
        this._lines = lines;
        this._eol = eol;
        this._versionId = versionId;
        this._lineStarts = null;
        this._cachedTextValue = null;
      }
      dispose() {
        this._lines.length = 0;
      }
      get version() {
        return this._versionId;
      }
      getText() {
        if (this._cachedTextValue === null) {
          this._cachedTextValue = this._lines.join(this._eol);
        }
        return this._cachedTextValue;
      }
      onEvents(e) {
        if (e.eol && e.eol !== this._eol) {
          this._eol = e.eol;
          this._lineStarts = null;
        }
        const changes = e.changes;
        for (const change of changes) {
          this._acceptDeleteRange(change.range);
          this._acceptInsertText(new Position$1(change.range.startLineNumber, change.range.startColumn), change.text);
        }
        this._versionId = e.versionId;
        this._cachedTextValue = null;
      }
      _ensureLineStarts() {
        if (!this._lineStarts) {
          const eolLength = this._eol.length;
          const linesLength = this._lines.length;
          const lineStartValues = new Uint32Array(linesLength);
          for (let i = 0; i < linesLength; i++) {
            lineStartValues[i] = this._lines[i].length + eolLength;
          }
          this._lineStarts = new PrefixSumComputer(lineStartValues);
        }
      }
      _setLineText(lineIndex, newValue) {
        this._lines[lineIndex] = newValue;
        if (this._lineStarts) {
          this._lineStarts.changeValue(lineIndex, this._lines[lineIndex].length + this._eol.length);
        }
      }
      _acceptDeleteRange(range) {
        if (range.startLineNumber === range.endLineNumber) {
          if (range.startColumn === range.endColumn) {
            return;
          }
          this._setLineText(range.startLineNumber - 1, this._lines[range.startLineNumber - 1].substring(0, range.startColumn - 1) + this._lines[range.startLineNumber - 1].substring(range.endColumn - 1));
          return;
        }
        this._setLineText(range.startLineNumber - 1, this._lines[range.startLineNumber - 1].substring(0, range.startColumn - 1) + this._lines[range.endLineNumber - 1].substring(range.endColumn - 1));
        this._lines.splice(range.startLineNumber, range.endLineNumber - range.startLineNumber);
        if (this._lineStarts) {
          this._lineStarts.removeValues(range.startLineNumber, range.endLineNumber - range.startLineNumber);
        }
      }
      _acceptInsertText(position, insertText) {
        if (insertText.length === 0) {
          return;
        }
        let insertLines = splitLines(insertText);
        if (insertLines.length === 1) {
          this._setLineText(position.lineNumber - 1, this._lines[position.lineNumber - 1].substring(0, position.column - 1) + insertLines[0] + this._lines[position.lineNumber - 1].substring(position.column - 1));
          return;
        }
        insertLines[insertLines.length - 1] += this._lines[position.lineNumber - 1].substring(position.column - 1);
        this._setLineText(position.lineNumber - 1, this._lines[position.lineNumber - 1].substring(0, position.column - 1) + insertLines[0]);
        let newLengths = new Uint32Array(insertLines.length - 1);
        for (let i = 1; i < insertLines.length; i++) {
          this._lines.splice(position.lineNumber + i - 1, 0, insertLines[i]);
          newLengths[i - 1] = insertLines[i].length + this._eol.length;
        }
        if (this._lineStarts) {
          this._lineStarts.insertValues(position.lineNumber, newLengths);
        }
      }
    }

    const USUAL_WORD_SEPARATORS = "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?";
    function createWordRegExp(allowInWords = "") {
      let source = "(-?\\d*\\.\\d\\w*)|([^";
      for (const sep of USUAL_WORD_SEPARATORS) {
        if (allowInWords.indexOf(sep) >= 0) {
          continue;
        }
        source += "\\" + sep;
      }
      source += "\\s]+)";
      return new RegExp(source, "g");
    }
    const DEFAULT_WORD_REGEXP = createWordRegExp();
    function ensureValidWordDefinition(wordDefinition) {
      let result = DEFAULT_WORD_REGEXP;
      if (wordDefinition && wordDefinition instanceof RegExp) {
        if (!wordDefinition.global) {
          let flags = "g";
          if (wordDefinition.ignoreCase) {
            flags += "i";
          }
          if (wordDefinition.multiline) {
            flags += "m";
          }
          if (wordDefinition.unicode) {
            flags += "u";
          }
          result = new RegExp(wordDefinition.source, flags);
        } else {
          result = wordDefinition;
        }
      }
      result.lastIndex = 0;
      return result;
    }
    const _defaultConfig = {
      maxLen: 1e3,
      windowSize: 15,
      timeBudget: 150
    };
    function getWordAtText(column, wordDefinition, text, textOffset, config = _defaultConfig) {
      if (text.length > config.maxLen) {
        let start = column - config.maxLen / 2;
        if (start < 0) {
          start = 0;
        } else {
          textOffset += start;
        }
        text = text.substring(start, column + config.maxLen / 2);
        return getWordAtText(column, wordDefinition, text, textOffset, config);
      }
      const t1 = Date.now();
      const pos = column - 1 - textOffset;
      let prevRegexIndex = -1;
      let match = null;
      for (let i = 1; ; i++) {
        if (Date.now() - t1 >= config.timeBudget) {
          break;
        }
        const regexIndex = pos - config.windowSize * i;
        wordDefinition.lastIndex = Math.max(0, regexIndex);
        const thisMatch = _findRegexMatchEnclosingPosition(wordDefinition, text, pos, prevRegexIndex);
        if (!thisMatch && match) {
          break;
        }
        match = thisMatch;
        if (regexIndex <= 0) {
          break;
        }
        prevRegexIndex = regexIndex;
      }
      if (match) {
        let result = {
          word: match[0],
          startColumn: textOffset + 1 + match.index,
          endColumn: textOffset + 1 + match.index + match[0].length
        };
        wordDefinition.lastIndex = 0;
        return result;
      }
      return null;
    }
    function _findRegexMatchEnclosingPosition(wordDefinition, text, pos, stopPos) {
      let match;
      while (match = wordDefinition.exec(text)) {
        const matchIndex = match.index || 0;
        if (matchIndex <= pos && wordDefinition.lastIndex >= pos) {
          return match;
        } else if (stopPos > 0 && matchIndex > stopPos) {
          return null;
        }
      }
      return null;
    }

    class CharacterClassifier {
      constructor(_defaultValue) {
        let defaultValue = toUint8(_defaultValue);
        this._defaultValue = defaultValue;
        this._asciiMap = CharacterClassifier._createAsciiMap(defaultValue);
        this._map = new Map();
      }
      static _createAsciiMap(defaultValue) {
        let asciiMap = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
          asciiMap[i] = defaultValue;
        }
        return asciiMap;
      }
      set(charCode, _value) {
        let value = toUint8(_value);
        if (charCode >= 0 && charCode < 256) {
          this._asciiMap[charCode] = value;
        } else {
          this._map.set(charCode, value);
        }
      }
      get(charCode) {
        if (charCode >= 0 && charCode < 256) {
          return this._asciiMap[charCode];
        } else {
          return this._map.get(charCode) || this._defaultValue;
        }
      }
    }

    class Uint8Matrix {
      constructor(rows, cols, defaultValue) {
        const data = new Uint8Array(rows * cols);
        for (let i = 0, len = rows * cols; i < len; i++) {
          data[i] = defaultValue;
        }
        this._data = data;
        this.rows = rows;
        this.cols = cols;
      }
      get(row, col) {
        return this._data[row * this.cols + col];
      }
      set(row, col, value) {
        this._data[row * this.cols + col] = value;
      }
    }
    class StateMachine {
      constructor(edges) {
        let maxCharCode = 0;
        let maxState = 0;
        for (let i = 0, len = edges.length; i < len; i++) {
          let [from, chCode, to] = edges[i];
          if (chCode > maxCharCode) {
            maxCharCode = chCode;
          }
          if (from > maxState) {
            maxState = from;
          }
          if (to > maxState) {
            maxState = to;
          }
        }
        maxCharCode++;
        maxState++;
        let states = new Uint8Matrix(maxState, maxCharCode, 0);
        for (let i = 0, len = edges.length; i < len; i++) {
          let [from, chCode, to] = edges[i];
          states.set(from, chCode, to);
        }
        this._states = states;
        this._maxCharCode = maxCharCode;
      }
      nextState(currentState, chCode) {
        if (chCode < 0 || chCode >= this._maxCharCode) {
          return 0;
        }
        return this._states.get(currentState, chCode);
      }
    }
    let _stateMachine = null;
    function getStateMachine() {
      if (_stateMachine === null) {
        _stateMachine = new StateMachine([
          [1, 104, 2],
          [1, 72, 2],
          [1, 102, 6],
          [1, 70, 6],
          [2, 116, 3],
          [2, 84, 3],
          [3, 116, 4],
          [3, 84, 4],
          [4, 112, 5],
          [4, 80, 5],
          [5, 115, 9],
          [5, 83, 9],
          [5, 58, 10],
          [6, 105, 7],
          [6, 73, 7],
          [7, 108, 8],
          [7, 76, 8],
          [8, 101, 9],
          [8, 69, 9],
          [9, 58, 10],
          [10, 47, 11],
          [11, 47, 12]
        ]);
      }
      return _stateMachine;
    }
    let _classifier = null;
    function getClassifier() {
      if (_classifier === null) {
        _classifier = new CharacterClassifier(0);
        const FORCE_TERMINATION_CHARACTERS = ` 	<>'"\u3001\u3002\uFF61\uFF64\uFF0C\uFF0E\uFF1A\uFF1B\u2018\u3008\u300C\u300E\u3014\uFF08\uFF3B\uFF5B\uFF62\uFF63\uFF5D\uFF3D\uFF09\u3015\u300F\u300D\u3009\u2019\uFF40\uFF5E\u2026`;
        for (let i = 0; i < FORCE_TERMINATION_CHARACTERS.length; i++) {
          _classifier.set(FORCE_TERMINATION_CHARACTERS.charCodeAt(i), 1);
        }
        const CANNOT_END_WITH_CHARACTERS = ".,;";
        for (let i = 0; i < CANNOT_END_WITH_CHARACTERS.length; i++) {
          _classifier.set(CANNOT_END_WITH_CHARACTERS.charCodeAt(i), 2);
        }
      }
      return _classifier;
    }
    class LinkComputer {
      static _createLink(classifier, line, lineNumber, linkBeginIndex, linkEndIndex) {
        let lastIncludedCharIndex = linkEndIndex - 1;
        do {
          const chCode = line.charCodeAt(lastIncludedCharIndex);
          const chClass = classifier.get(chCode);
          if (chClass !== 2) {
            break;
          }
          lastIncludedCharIndex--;
        } while (lastIncludedCharIndex > linkBeginIndex);
        if (linkBeginIndex > 0) {
          const charCodeBeforeLink = line.charCodeAt(linkBeginIndex - 1);
          const lastCharCodeInLink = line.charCodeAt(lastIncludedCharIndex);
          if (charCodeBeforeLink === 40 && lastCharCodeInLink === 41 || charCodeBeforeLink === 91 && lastCharCodeInLink === 93 || charCodeBeforeLink === 123 && lastCharCodeInLink === 125) {
            lastIncludedCharIndex--;
          }
        }
        return {
          range: {
            startLineNumber: lineNumber,
            startColumn: linkBeginIndex + 1,
            endLineNumber: lineNumber,
            endColumn: lastIncludedCharIndex + 2
          },
          url: line.substring(linkBeginIndex, lastIncludedCharIndex + 1)
        };
      }
      static computeLinks(model, stateMachine = getStateMachine()) {
        const classifier = getClassifier();
        let result = [];
        for (let i = 1, lineCount = model.getLineCount(); i <= lineCount; i++) {
          const line = model.getLineContent(i);
          const len = line.length;
          let j = 0;
          let linkBeginIndex = 0;
          let linkBeginChCode = 0;
          let state = 1;
          let hasOpenParens = false;
          let hasOpenSquareBracket = false;
          let inSquareBrackets = false;
          let hasOpenCurlyBracket = false;
          while (j < len) {
            let resetStateMachine = false;
            const chCode = line.charCodeAt(j);
            if (state === 13) {
              let chClass;
              switch (chCode) {
                case 40:
                  hasOpenParens = true;
                  chClass = 0;
                  break;
                case 41:
                  chClass = hasOpenParens ? 0 : 1;
                  break;
                case 91:
                  inSquareBrackets = true;
                  hasOpenSquareBracket = true;
                  chClass = 0;
                  break;
                case 93:
                  inSquareBrackets = false;
                  chClass = hasOpenSquareBracket ? 0 : 1;
                  break;
                case 123:
                  hasOpenCurlyBracket = true;
                  chClass = 0;
                  break;
                case 125:
                  chClass = hasOpenCurlyBracket ? 0 : 1;
                  break;
                case 39:
                  chClass = linkBeginChCode === 34 || linkBeginChCode === 96 ? 0 : 1;
                  break;
                case 34:
                  chClass = linkBeginChCode === 39 || linkBeginChCode === 96 ? 0 : 1;
                  break;
                case 96:
                  chClass = linkBeginChCode === 39 || linkBeginChCode === 34 ? 0 : 1;
                  break;
                case 42:
                  chClass = linkBeginChCode === 42 ? 1 : 0;
                  break;
                case 124:
                  chClass = linkBeginChCode === 124 ? 1 : 0;
                  break;
                case 32:
                  chClass = inSquareBrackets ? 0 : 1;
                  break;
                default:
                  chClass = classifier.get(chCode);
              }
              if (chClass === 1) {
                result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, j));
                resetStateMachine = true;
              }
            } else if (state === 12) {
              let chClass;
              if (chCode === 91) {
                hasOpenSquareBracket = true;
                chClass = 0;
              } else {
                chClass = classifier.get(chCode);
              }
              if (chClass === 1) {
                resetStateMachine = true;
              } else {
                state = 13;
              }
            } else {
              state = stateMachine.nextState(state, chCode);
              if (state === 0) {
                resetStateMachine = true;
              }
            }
            if (resetStateMachine) {
              state = 1;
              hasOpenParens = false;
              hasOpenSquareBracket = false;
              hasOpenCurlyBracket = false;
              linkBeginIndex = j + 1;
              linkBeginChCode = chCode;
            }
            j++;
          }
          if (state === 13) {
            result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, len));
          }
        }
        return result;
      }
    }
    function computeLinks(model) {
      if (!model || typeof model.getLineCount !== "function" || typeof model.getLineContent !== "function") {
        return [];
      }
      return LinkComputer.computeLinks(model);
    }

    class BasicInplaceReplace {
      constructor() {
        this._defaultValueSet = [
          ["true", "false"],
          ["True", "False"],
          ["Private", "Public", "Friend", "ReadOnly", "Partial", "Protected", "WriteOnly"],
          ["public", "protected", "private"]
        ];
      }
      navigateValueSet(range1, text1, range2, text2, up) {
        if (range1 && text1) {
          let result = this.doNavigateValueSet(text1, up);
          if (result) {
            return {
              range: range1,
              value: result
            };
          }
        }
        if (range2 && text2) {
          let result = this.doNavigateValueSet(text2, up);
          if (result) {
            return {
              range: range2,
              value: result
            };
          }
        }
        return null;
      }
      doNavigateValueSet(text, up) {
        let numberResult = this.numberReplace(text, up);
        if (numberResult !== null) {
          return numberResult;
        }
        return this.textReplace(text, up);
      }
      numberReplace(value, up) {
        let precision = Math.pow(10, value.length - (value.lastIndexOf(".") + 1));
        let n1 = Number(value);
        let n2 = parseFloat(value);
        if (!isNaN(n1) && !isNaN(n2) && n1 === n2) {
          if (n1 === 0 && !up) {
            return null;
          } else {
            n1 = Math.floor(n1 * precision);
            n1 += up ? precision : -precision;
            return String(n1 / precision);
          }
        }
        return null;
      }
      textReplace(value, up) {
        return this.valueSetsReplace(this._defaultValueSet, value, up);
      }
      valueSetsReplace(valueSets, value, up) {
        let result = null;
        for (let i = 0, len = valueSets.length; result === null && i < len; i++) {
          result = this.valueSetReplace(valueSets[i], value, up);
        }
        return result;
      }
      valueSetReplace(valueSet, value, up) {
        let idx = valueSet.indexOf(value);
        if (idx >= 0) {
          idx += up ? 1 : -1;
          if (idx < 0) {
            idx = valueSet.length - 1;
          } else {
            idx %= valueSet.length;
          }
          return valueSet[idx];
        }
        return null;
      }
    }
    BasicInplaceReplace.INSTANCE = new BasicInplaceReplace();

    class Node {
      constructor(element) {
        this.element = element;
        this.next = Node.Undefined;
        this.prev = Node.Undefined;
      }
    }
    Node.Undefined = new Node(void 0);
    class LinkedList {
      constructor() {
        this._first = Node.Undefined;
        this._last = Node.Undefined;
        this._size = 0;
      }
      get size() {
        return this._size;
      }
      isEmpty() {
        return this._first === Node.Undefined;
      }
      clear() {
        let node = this._first;
        while (node !== Node.Undefined) {
          const next = node.next;
          node.prev = Node.Undefined;
          node.next = Node.Undefined;
          node = next;
        }
        this._first = Node.Undefined;
        this._last = Node.Undefined;
        this._size = 0;
      }
      unshift(element) {
        return this._insert(element, false);
      }
      push(element) {
        return this._insert(element, true);
      }
      _insert(element, atTheEnd) {
        const newNode = new Node(element);
        if (this._first === Node.Undefined) {
          this._first = newNode;
          this._last = newNode;
        } else if (atTheEnd) {
          const oldLast = this._last;
          this._last = newNode;
          newNode.prev = oldLast;
          oldLast.next = newNode;
        } else {
          const oldFirst = this._first;
          this._first = newNode;
          newNode.next = oldFirst;
          oldFirst.prev = newNode;
        }
        this._size += 1;
        let didRemove = false;
        return () => {
          if (!didRemove) {
            didRemove = true;
            this._remove(newNode);
          }
        };
      }
      shift() {
        if (this._first === Node.Undefined) {
          return void 0;
        } else {
          const res = this._first.element;
          this._remove(this._first);
          return res;
        }
      }
      pop() {
        if (this._last === Node.Undefined) {
          return void 0;
        } else {
          const res = this._last.element;
          this._remove(this._last);
          return res;
        }
      }
      _remove(node) {
        if (node.prev !== Node.Undefined && node.next !== Node.Undefined) {
          const anchor = node.prev;
          anchor.next = node.next;
          node.next.prev = anchor;
        } else if (node.prev === Node.Undefined && node.next === Node.Undefined) {
          this._first = Node.Undefined;
          this._last = Node.Undefined;
        } else if (node.next === Node.Undefined) {
          this._last = this._last.prev;
          this._last.next = Node.Undefined;
        } else if (node.prev === Node.Undefined) {
          this._first = this._first.next;
          this._first.prev = Node.Undefined;
        }
        this._size -= 1;
      }
      *[Symbol.iterator]() {
        let node = this._first;
        while (node !== Node.Undefined) {
          yield node.element;
          node = node.next;
        }
      }
    }

    const hasPerformanceNow = globals.performance && typeof globals.performance.now === "function";
    class StopWatch {
      constructor(highResolution) {
        this._highResolution = hasPerformanceNow && highResolution;
        this._startTime = this._now();
        this._stopTime = -1;
      }
      static create(highResolution = true) {
        return new StopWatch(highResolution);
      }
      stop() {
        this._stopTime = this._now();
      }
      elapsed() {
        if (this._stopTime !== -1) {
          return this._stopTime - this._startTime;
        }
        return this._now() - this._startTime;
      }
      _now() {
        return this._highResolution ? globals.performance.now() : Date.now();
      }
    }

    var Event;
    (function(Event2) {
      Event2.None = () => Disposable.None;
      function once(event) {
        return (listener, thisArgs = null, disposables) => {
          let didFire = false;
          let result;
          result = event((e) => {
            if (didFire) {
              return;
            } else if (result) {
              result.dispose();
            } else {
              didFire = true;
            }
            return listener.call(thisArgs, e);
          }, null, disposables);
          if (didFire) {
            result.dispose();
          }
          return result;
        };
      }
      Event2.once = once;
      function map(event, map2) {
        return snapshot((listener, thisArgs = null, disposables) => event((i) => listener.call(thisArgs, map2(i)), null, disposables));
      }
      Event2.map = map;
      function forEach(event, each) {
        return snapshot((listener, thisArgs = null, disposables) => event((i) => {
          each(i);
          listener.call(thisArgs, i);
        }, null, disposables));
      }
      Event2.forEach = forEach;
      function filter(event, filter2) {
        return snapshot((listener, thisArgs = null, disposables) => event((e) => filter2(e) && listener.call(thisArgs, e), null, disposables));
      }
      Event2.filter = filter;
      function signal(event) {
        return event;
      }
      Event2.signal = signal;
      function any(...events) {
        return (listener, thisArgs = null, disposables) => combinedDisposable(...events.map((event) => event((e) => listener.call(thisArgs, e), null, disposables)));
      }
      Event2.any = any;
      function reduce(event, merge, initial) {
        let output = initial;
        return map(event, (e) => {
          output = merge(output, e);
          return output;
        });
      }
      Event2.reduce = reduce;
      function snapshot(event) {
        let listener;
        const emitter = new Emitter({
          onFirstListenerAdd() {
            listener = event(emitter.fire, emitter);
          },
          onLastListenerRemove() {
            listener.dispose();
          }
        });
        return emitter.event;
      }
      function debounce(event, merge, delay = 100, leading = false, leakWarningThreshold) {
        let subscription;
        let output = void 0;
        let handle = void 0;
        let numDebouncedCalls = 0;
        const emitter = new Emitter({
          leakWarningThreshold,
          onFirstListenerAdd() {
            subscription = event((cur) => {
              numDebouncedCalls++;
              output = merge(output, cur);
              if (leading && !handle) {
                emitter.fire(output);
                output = void 0;
              }
              clearTimeout(handle);
              handle = setTimeout(() => {
                const _output = output;
                output = void 0;
                handle = void 0;
                if (!leading || numDebouncedCalls > 1) {
                  emitter.fire(_output);
                }
                numDebouncedCalls = 0;
              }, delay);
            });
          },
          onLastListenerRemove() {
            subscription.dispose();
          }
        });
        return emitter.event;
      }
      Event2.debounce = debounce;
      function latch(event, equals = (a, b) => a === b) {
        let firstCall = true;
        let cache;
        return filter(event, (value) => {
          const shouldEmit = firstCall || !equals(value, cache);
          firstCall = false;
          cache = value;
          return shouldEmit;
        });
      }
      Event2.latch = latch;
      function split(event, isT) {
        return [
          Event2.filter(event, isT),
          Event2.filter(event, (e) => !isT(e))
        ];
      }
      Event2.split = split;
      function buffer(event, nextTick = false, _buffer = []) {
        let buffer2 = _buffer.slice();
        let listener = event((e) => {
          if (buffer2) {
            buffer2.push(e);
          } else {
            emitter.fire(e);
          }
        });
        const flush = () => {
          if (buffer2) {
            buffer2.forEach((e) => emitter.fire(e));
          }
          buffer2 = null;
        };
        const emitter = new Emitter({
          onFirstListenerAdd() {
            if (!listener) {
              listener = event((e) => emitter.fire(e));
            }
          },
          onFirstListenerDidAdd() {
            if (buffer2) {
              if (nextTick) {
                setTimeout(flush);
              } else {
                flush();
              }
            }
          },
          onLastListenerRemove() {
            if (listener) {
              listener.dispose();
            }
            listener = null;
          }
        });
        return emitter.event;
      }
      Event2.buffer = buffer;
      class ChainableEvent {
        constructor(event) {
          this.event = event;
        }
        map(fn) {
          return new ChainableEvent(map(this.event, fn));
        }
        forEach(fn) {
          return new ChainableEvent(forEach(this.event, fn));
        }
        filter(fn) {
          return new ChainableEvent(filter(this.event, fn));
        }
        reduce(merge, initial) {
          return new ChainableEvent(reduce(this.event, merge, initial));
        }
        latch() {
          return new ChainableEvent(latch(this.event));
        }
        debounce(merge, delay = 100, leading = false, leakWarningThreshold) {
          return new ChainableEvent(debounce(this.event, merge, delay, leading, leakWarningThreshold));
        }
        on(listener, thisArgs, disposables) {
          return this.event(listener, thisArgs, disposables);
        }
        once(listener, thisArgs, disposables) {
          return once(this.event)(listener, thisArgs, disposables);
        }
      }
      function chain(event) {
        return new ChainableEvent(event);
      }
      Event2.chain = chain;
      function fromNodeEventEmitter(emitter, eventName, map2 = (id) => id) {
        const fn = (...args) => result.fire(map2(...args));
        const onFirstListenerAdd = () => emitter.on(eventName, fn);
        const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
        const result = new Emitter({ onFirstListenerAdd, onLastListenerRemove });
        return result.event;
      }
      Event2.fromNodeEventEmitter = fromNodeEventEmitter;
      function fromDOMEventEmitter(emitter, eventName, map2 = (id) => id) {
        const fn = (...args) => result.fire(map2(...args));
        const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);
        const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);
        const result = new Emitter({ onFirstListenerAdd, onLastListenerRemove });
        return result.event;
      }
      Event2.fromDOMEventEmitter = fromDOMEventEmitter;
      function toPromise(event) {
        return new Promise((resolve) => once(event)(resolve));
      }
      Event2.toPromise = toPromise;
    })(Event || (Event = {}));
    class EventProfiling {
      constructor(name) {
        this._listenerCount = 0;
        this._invocationCount = 0;
        this._elapsedOverall = 0;
        this._name = `${name}_${EventProfiling._idPool++}`;
      }
      start(listenerCount) {
        this._stopWatch = new StopWatch(true);
        this._listenerCount = listenerCount;
      }
      stop() {
        if (this._stopWatch) {
          const elapsed = this._stopWatch.elapsed();
          this._elapsedOverall += elapsed;
          this._invocationCount += 1;
          console.info(`did FIRE ${this._name}: elapsed_ms: ${elapsed.toFixed(5)}, listener: ${this._listenerCount} (elapsed_overall: ${this._elapsedOverall.toFixed(2)}, invocations: ${this._invocationCount})`);
          this._stopWatch = void 0;
        }
      }
    }
    EventProfiling._idPool = 0;
    class Emitter {
      constructor(options) {
        var _a;
        this._disposed = false;
        this._options = options;
        this._leakageMon = void 0;
        this._perfMon = ((_a = this._options) === null || _a === void 0 ? void 0 : _a._profName) ? new EventProfiling(this._options._profName) : void 0;
      }
      get event() {
        if (!this._event) {
          this._event = (listener, thisArgs, disposables) => {
            var _a;
            if (!this._listeners) {
              this._listeners = new LinkedList();
            }
            const firstListener = this._listeners.isEmpty();
            if (firstListener && this._options && this._options.onFirstListenerAdd) {
              this._options.onFirstListenerAdd(this);
            }
            const remove = this._listeners.push(!thisArgs ? listener : [listener, thisArgs]);
            if (firstListener && this._options && this._options.onFirstListenerDidAdd) {
              this._options.onFirstListenerDidAdd(this);
            }
            if (this._options && this._options.onListenerDidAdd) {
              this._options.onListenerDidAdd(this, listener, thisArgs);
            }
            const removeMonitor = (_a = this._leakageMon) === null || _a === void 0 ? void 0 : _a.check(this._listeners.size);
            const result = toDisposable(() => {
              if (removeMonitor) {
                removeMonitor();
              }
              if (!this._disposed) {
                remove();
                if (this._options && this._options.onLastListenerRemove) {
                  const hasListeners = this._listeners && !this._listeners.isEmpty();
                  if (!hasListeners) {
                    this._options.onLastListenerRemove(this);
                  }
                }
              }
            });
            if (disposables instanceof DisposableStore) {
              disposables.add(result);
            } else if (Array.isArray(disposables)) {
              disposables.push(result);
            }
            return result;
          };
        }
        return this._event;
      }
      fire(event) {
        var _a, _b;
        if (this._listeners) {
          if (!this._deliveryQueue) {
            this._deliveryQueue = new LinkedList();
          }
          for (let listener of this._listeners) {
            this._deliveryQueue.push([listener, event]);
          }
          (_a = this._perfMon) === null || _a === void 0 ? void 0 : _a.start(this._deliveryQueue.size);
          while (this._deliveryQueue.size > 0) {
            const [listener, event2] = this._deliveryQueue.shift();
            try {
              if (typeof listener === "function") {
                listener.call(void 0, event2);
              } else {
                listener[0].call(listener[1], event2);
              }
            } catch (e) {
              onUnexpectedError(e);
            }
          }
          (_b = this._perfMon) === null || _b === void 0 ? void 0 : _b.stop();
        }
      }
      dispose() {
        var _a, _b, _c, _d, _e;
        if (!this._disposed) {
          this._disposed = true;
          (_a = this._listeners) === null || _a === void 0 ? void 0 : _a.clear();
          (_b = this._deliveryQueue) === null || _b === void 0 ? void 0 : _b.clear();
          (_d = (_c = this._options) === null || _c === void 0 ? void 0 : _c.onLastListenerRemove) === null || _d === void 0 ? void 0 : _d.call(_c);
          (_e = this._leakageMon) === null || _e === void 0 ? void 0 : _e.dispose();
        }
      }
    }

    const shortcutEvent = Object.freeze(function(callback, context) {
      const handle = setTimeout(callback.bind(context), 0);
      return { dispose() {
        clearTimeout(handle);
      } };
    });
    var CancellationToken;
    (function(CancellationToken2) {
      function isCancellationToken(thing) {
        if (thing === CancellationToken2.None || thing === CancellationToken2.Cancelled) {
          return true;
        }
        if (thing instanceof MutableToken) {
          return true;
        }
        if (!thing || typeof thing !== "object") {
          return false;
        }
        return typeof thing.isCancellationRequested === "boolean" && typeof thing.onCancellationRequested === "function";
      }
      CancellationToken2.isCancellationToken = isCancellationToken;
      CancellationToken2.None = Object.freeze({
        isCancellationRequested: false,
        onCancellationRequested: Event.None
      });
      CancellationToken2.Cancelled = Object.freeze({
        isCancellationRequested: true,
        onCancellationRequested: shortcutEvent
      });
    })(CancellationToken || (CancellationToken = {}));
    class MutableToken {
      constructor() {
        this._isCancelled = false;
        this._emitter = null;
      }
      cancel() {
        if (!this._isCancelled) {
          this._isCancelled = true;
          if (this._emitter) {
            this._emitter.fire(void 0);
            this.dispose();
          }
        }
      }
      get isCancellationRequested() {
        return this._isCancelled;
      }
      get onCancellationRequested() {
        if (this._isCancelled) {
          return shortcutEvent;
        }
        if (!this._emitter) {
          this._emitter = new Emitter();
        }
        return this._emitter.event;
      }
      dispose() {
        if (this._emitter) {
          this._emitter.dispose();
          this._emitter = null;
        }
      }
    }
    class CancellationTokenSource {
      constructor(parent) {
        this._token = void 0;
        this._parentListener = void 0;
        this._parentListener = parent && parent.onCancellationRequested(this.cancel, this);
      }
      get token() {
        if (!this._token) {
          this._token = new MutableToken();
        }
        return this._token;
      }
      cancel() {
        if (!this._token) {
          this._token = CancellationToken.Cancelled;
        } else if (this._token instanceof MutableToken) {
          this._token.cancel();
        }
      }
      dispose(cancel = false) {
        if (cancel) {
          this.cancel();
        }
        if (this._parentListener) {
          this._parentListener.dispose();
        }
        if (!this._token) {
          this._token = CancellationToken.None;
        } else if (this._token instanceof MutableToken) {
          this._token.dispose();
        }
      }
    }

    class KeyCodeStrMap {
      constructor() {
        this._keyCodeToStr = [];
        this._strToKeyCode = Object.create(null);
      }
      define(keyCode, str) {
        this._keyCodeToStr[keyCode] = str;
        this._strToKeyCode[str.toLowerCase()] = keyCode;
      }
      keyCodeToStr(keyCode) {
        return this._keyCodeToStr[keyCode];
      }
      strToKeyCode(str) {
        return this._strToKeyCode[str.toLowerCase()] || 0;
      }
    }
    const uiMap = new KeyCodeStrMap();
    const userSettingsUSMap = new KeyCodeStrMap();
    const userSettingsGeneralMap = new KeyCodeStrMap();
    (function() {
      function define(keyCode, uiLabel, usUserSettingsLabel = uiLabel, generalUserSettingsLabel = usUserSettingsLabel) {
        uiMap.define(keyCode, uiLabel);
        userSettingsUSMap.define(keyCode, usUserSettingsLabel);
        userSettingsGeneralMap.define(keyCode, generalUserSettingsLabel);
      }
      define(0, "unknown");
      define(1, "Backspace");
      define(2, "Tab");
      define(3, "Enter");
      define(4, "Shift");
      define(5, "Ctrl");
      define(6, "Alt");
      define(7, "PauseBreak");
      define(8, "CapsLock");
      define(9, "Escape");
      define(10, "Space");
      define(11, "PageUp");
      define(12, "PageDown");
      define(13, "End");
      define(14, "Home");
      define(15, "LeftArrow", "Left");
      define(16, "UpArrow", "Up");
      define(17, "RightArrow", "Right");
      define(18, "DownArrow", "Down");
      define(19, "Insert");
      define(20, "Delete");
      define(21, "0");
      define(22, "1");
      define(23, "2");
      define(24, "3");
      define(25, "4");
      define(26, "5");
      define(27, "6");
      define(28, "7");
      define(29, "8");
      define(30, "9");
      define(31, "A");
      define(32, "B");
      define(33, "C");
      define(34, "D");
      define(35, "E");
      define(36, "F");
      define(37, "G");
      define(38, "H");
      define(39, "I");
      define(40, "J");
      define(41, "K");
      define(42, "L");
      define(43, "M");
      define(44, "N");
      define(45, "O");
      define(46, "P");
      define(47, "Q");
      define(48, "R");
      define(49, "S");
      define(50, "T");
      define(51, "U");
      define(52, "V");
      define(53, "W");
      define(54, "X");
      define(55, "Y");
      define(56, "Z");
      define(57, "Meta");
      define(58, "ContextMenu");
      define(59, "F1");
      define(60, "F2");
      define(61, "F3");
      define(62, "F4");
      define(63, "F5");
      define(64, "F6");
      define(65, "F7");
      define(66, "F8");
      define(67, "F9");
      define(68, "F10");
      define(69, "F11");
      define(70, "F12");
      define(71, "F13");
      define(72, "F14");
      define(73, "F15");
      define(74, "F16");
      define(75, "F17");
      define(76, "F18");
      define(77, "F19");
      define(78, "NumLock");
      define(79, "ScrollLock");
      define(80, ";", ";", "OEM_1");
      define(81, "=", "=", "OEM_PLUS");
      define(82, ",", ",", "OEM_COMMA");
      define(83, "-", "-", "OEM_MINUS");
      define(84, ".", ".", "OEM_PERIOD");
      define(85, "/", "/", "OEM_2");
      define(86, "`", "`", "OEM_3");
      define(110, "ABNT_C1");
      define(111, "ABNT_C2");
      define(87, "[", "[", "OEM_4");
      define(88, "\\", "\\", "OEM_5");
      define(89, "]", "]", "OEM_6");
      define(90, "'", "'", "OEM_7");
      define(91, "OEM_8");
      define(92, "OEM_102");
      define(93, "NumPad0");
      define(94, "NumPad1");
      define(95, "NumPad2");
      define(96, "NumPad3");
      define(97, "NumPad4");
      define(98, "NumPad5");
      define(99, "NumPad6");
      define(100, "NumPad7");
      define(101, "NumPad8");
      define(102, "NumPad9");
      define(103, "NumPad_Multiply");
      define(104, "NumPad_Add");
      define(105, "NumPad_Separator");
      define(106, "NumPad_Subtract");
      define(107, "NumPad_Decimal");
      define(108, "NumPad_Divide");
    })();
    var KeyCodeUtils;
    (function(KeyCodeUtils2) {
      function toString(keyCode) {
        return uiMap.keyCodeToStr(keyCode);
      }
      KeyCodeUtils2.toString = toString;
      function fromString(key) {
        return uiMap.strToKeyCode(key);
      }
      KeyCodeUtils2.fromString = fromString;
      function toUserSettingsUS(keyCode) {
        return userSettingsUSMap.keyCodeToStr(keyCode);
      }
      KeyCodeUtils2.toUserSettingsUS = toUserSettingsUS;
      function toUserSettingsGeneral(keyCode) {
        return userSettingsGeneralMap.keyCodeToStr(keyCode);
      }
      KeyCodeUtils2.toUserSettingsGeneral = toUserSettingsGeneral;
      function fromUserSettings(key) {
        return userSettingsUSMap.strToKeyCode(key) || userSettingsGeneralMap.strToKeyCode(key);
      }
      KeyCodeUtils2.fromUserSettings = fromUserSettings;
    })(KeyCodeUtils || (KeyCodeUtils = {}));
    function KeyChord(firstPart, secondPart) {
      const chordPart = (secondPart & 65535) << 16 >>> 0;
      return (firstPart | chordPart) >>> 0;
    }

    class Selection extends Range$1 {
      constructor(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn) {
        super(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn);
        this.selectionStartLineNumber = selectionStartLineNumber;
        this.selectionStartColumn = selectionStartColumn;
        this.positionLineNumber = positionLineNumber;
        this.positionColumn = positionColumn;
      }
      toString() {
        return "[" + this.selectionStartLineNumber + "," + this.selectionStartColumn + " -> " + this.positionLineNumber + "," + this.positionColumn + "]";
      }
      equalsSelection(other) {
        return Selection.selectionsEqual(this, other);
      }
      static selectionsEqual(a, b) {
        return a.selectionStartLineNumber === b.selectionStartLineNumber && a.selectionStartColumn === b.selectionStartColumn && a.positionLineNumber === b.positionLineNumber && a.positionColumn === b.positionColumn;
      }
      getDirection() {
        if (this.selectionStartLineNumber === this.startLineNumber && this.selectionStartColumn === this.startColumn) {
          return 0;
        }
        return 1;
      }
      setEndPosition(endLineNumber, endColumn) {
        if (this.getDirection() === 0) {
          return new Selection(this.startLineNumber, this.startColumn, endLineNumber, endColumn);
        }
        return new Selection(endLineNumber, endColumn, this.startLineNumber, this.startColumn);
      }
      getPosition() {
        return new Position$1(this.positionLineNumber, this.positionColumn);
      }
      setStartPosition(startLineNumber, startColumn) {
        if (this.getDirection() === 0) {
          return new Selection(startLineNumber, startColumn, this.endLineNumber, this.endColumn);
        }
        return new Selection(this.endLineNumber, this.endColumn, startLineNumber, startColumn);
      }
      static fromPositions(start, end = start) {
        return new Selection(start.lineNumber, start.column, end.lineNumber, end.column);
      }
      static liftSelection(sel) {
        return new Selection(sel.selectionStartLineNumber, sel.selectionStartColumn, sel.positionLineNumber, sel.positionColumn);
      }
      static selectionsArrEqual(a, b) {
        if (a && !b || !a && b) {
          return false;
        }
        if (!a && !b) {
          return true;
        }
        if (a.length !== b.length) {
          return false;
        }
        for (let i = 0, len = a.length; i < len; i++) {
          if (!this.selectionsEqual(a[i], b[i])) {
            return false;
          }
        }
        return true;
      }
      static isISelection(obj) {
        return obj && typeof obj.selectionStartLineNumber === "number" && typeof obj.selectionStartColumn === "number" && typeof obj.positionLineNumber === "number" && typeof obj.positionColumn === "number";
      }
      static createWithDirection(startLineNumber, startColumn, endLineNumber, endColumn, direction) {
        if (direction === 0) {
          return new Selection(startLineNumber, startColumn, endLineNumber, endColumn);
        }
        return new Selection(endLineNumber, endColumn, startLineNumber, startColumn);
      }
    }

    class Token {
      constructor(offset, type, language) {
        this._tokenBrand = void 0;
        this.offset = offset | 0;
        this.type = type;
        this.language = language;
      }
      toString() {
        return "(" + this.offset + ", " + this.type + ")";
      }
    }

    var AccessibilitySupport;
    (function(AccessibilitySupport2) {
      AccessibilitySupport2[AccessibilitySupport2["Unknown"] = 0] = "Unknown";
      AccessibilitySupport2[AccessibilitySupport2["Disabled"] = 1] = "Disabled";
      AccessibilitySupport2[AccessibilitySupport2["Enabled"] = 2] = "Enabled";
    })(AccessibilitySupport || (AccessibilitySupport = {}));
    var CompletionItemInsertTextRule;
    (function(CompletionItemInsertTextRule2) {
      CompletionItemInsertTextRule2[CompletionItemInsertTextRule2["KeepWhitespace"] = 1] = "KeepWhitespace";
      CompletionItemInsertTextRule2[CompletionItemInsertTextRule2["InsertAsSnippet"] = 4] = "InsertAsSnippet";
    })(CompletionItemInsertTextRule || (CompletionItemInsertTextRule = {}));
    var CompletionItemKind$1;
    (function(CompletionItemKind2) {
      CompletionItemKind2[CompletionItemKind2["Method"] = 0] = "Method";
      CompletionItemKind2[CompletionItemKind2["Function"] = 1] = "Function";
      CompletionItemKind2[CompletionItemKind2["Constructor"] = 2] = "Constructor";
      CompletionItemKind2[CompletionItemKind2["Field"] = 3] = "Field";
      CompletionItemKind2[CompletionItemKind2["Variable"] = 4] = "Variable";
      CompletionItemKind2[CompletionItemKind2["Class"] = 5] = "Class";
      CompletionItemKind2[CompletionItemKind2["Struct"] = 6] = "Struct";
      CompletionItemKind2[CompletionItemKind2["Interface"] = 7] = "Interface";
      CompletionItemKind2[CompletionItemKind2["Module"] = 8] = "Module";
      CompletionItemKind2[CompletionItemKind2["Property"] = 9] = "Property";
      CompletionItemKind2[CompletionItemKind2["Event"] = 10] = "Event";
      CompletionItemKind2[CompletionItemKind2["Operator"] = 11] = "Operator";
      CompletionItemKind2[CompletionItemKind2["Unit"] = 12] = "Unit";
      CompletionItemKind2[CompletionItemKind2["Value"] = 13] = "Value";
      CompletionItemKind2[CompletionItemKind2["Constant"] = 14] = "Constant";
      CompletionItemKind2[CompletionItemKind2["Enum"] = 15] = "Enum";
      CompletionItemKind2[CompletionItemKind2["EnumMember"] = 16] = "EnumMember";
      CompletionItemKind2[CompletionItemKind2["Keyword"] = 17] = "Keyword";
      CompletionItemKind2[CompletionItemKind2["Text"] = 18] = "Text";
      CompletionItemKind2[CompletionItemKind2["Color"] = 19] = "Color";
      CompletionItemKind2[CompletionItemKind2["File"] = 20] = "File";
      CompletionItemKind2[CompletionItemKind2["Reference"] = 21] = "Reference";
      CompletionItemKind2[CompletionItemKind2["Customcolor"] = 22] = "Customcolor";
      CompletionItemKind2[CompletionItemKind2["Folder"] = 23] = "Folder";
      CompletionItemKind2[CompletionItemKind2["TypeParameter"] = 24] = "TypeParameter";
      CompletionItemKind2[CompletionItemKind2["User"] = 25] = "User";
      CompletionItemKind2[CompletionItemKind2["Issue"] = 26] = "Issue";
      CompletionItemKind2[CompletionItemKind2["Snippet"] = 27] = "Snippet";
    })(CompletionItemKind$1 || (CompletionItemKind$1 = {}));
    var CompletionItemTag$1;
    (function(CompletionItemTag2) {
      CompletionItemTag2[CompletionItemTag2["Deprecated"] = 1] = "Deprecated";
    })(CompletionItemTag$1 || (CompletionItemTag$1 = {}));
    var CompletionTriggerKind;
    (function(CompletionTriggerKind2) {
      CompletionTriggerKind2[CompletionTriggerKind2["Invoke"] = 0] = "Invoke";
      CompletionTriggerKind2[CompletionTriggerKind2["TriggerCharacter"] = 1] = "TriggerCharacter";
      CompletionTriggerKind2[CompletionTriggerKind2["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
    })(CompletionTriggerKind || (CompletionTriggerKind = {}));
    var ContentWidgetPositionPreference;
    (function(ContentWidgetPositionPreference2) {
      ContentWidgetPositionPreference2[ContentWidgetPositionPreference2["EXACT"] = 0] = "EXACT";
      ContentWidgetPositionPreference2[ContentWidgetPositionPreference2["ABOVE"] = 1] = "ABOVE";
      ContentWidgetPositionPreference2[ContentWidgetPositionPreference2["BELOW"] = 2] = "BELOW";
    })(ContentWidgetPositionPreference || (ContentWidgetPositionPreference = {}));
    var CursorChangeReason;
    (function(CursorChangeReason2) {
      CursorChangeReason2[CursorChangeReason2["NotSet"] = 0] = "NotSet";
      CursorChangeReason2[CursorChangeReason2["ContentFlush"] = 1] = "ContentFlush";
      CursorChangeReason2[CursorChangeReason2["RecoverFromMarkers"] = 2] = "RecoverFromMarkers";
      CursorChangeReason2[CursorChangeReason2["Explicit"] = 3] = "Explicit";
      CursorChangeReason2[CursorChangeReason2["Paste"] = 4] = "Paste";
      CursorChangeReason2[CursorChangeReason2["Undo"] = 5] = "Undo";
      CursorChangeReason2[CursorChangeReason2["Redo"] = 6] = "Redo";
    })(CursorChangeReason || (CursorChangeReason = {}));
    var DefaultEndOfLine;
    (function(DefaultEndOfLine2) {
      DefaultEndOfLine2[DefaultEndOfLine2["LF"] = 1] = "LF";
      DefaultEndOfLine2[DefaultEndOfLine2["CRLF"] = 2] = "CRLF";
    })(DefaultEndOfLine || (DefaultEndOfLine = {}));
    var DocumentHighlightKind$1;
    (function(DocumentHighlightKind2) {
      DocumentHighlightKind2[DocumentHighlightKind2["Text"] = 0] = "Text";
      DocumentHighlightKind2[DocumentHighlightKind2["Read"] = 1] = "Read";
      DocumentHighlightKind2[DocumentHighlightKind2["Write"] = 2] = "Write";
    })(DocumentHighlightKind$1 || (DocumentHighlightKind$1 = {}));
    var EditorAutoIndentStrategy;
    (function(EditorAutoIndentStrategy2) {
      EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["None"] = 0] = "None";
      EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Keep"] = 1] = "Keep";
      EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Brackets"] = 2] = "Brackets";
      EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Advanced"] = 3] = "Advanced";
      EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Full"] = 4] = "Full";
    })(EditorAutoIndentStrategy || (EditorAutoIndentStrategy = {}));
    var EditorOption;
    (function(EditorOption2) {
      EditorOption2[EditorOption2["acceptSuggestionOnCommitCharacter"] = 0] = "acceptSuggestionOnCommitCharacter";
      EditorOption2[EditorOption2["acceptSuggestionOnEnter"] = 1] = "acceptSuggestionOnEnter";
      EditorOption2[EditorOption2["accessibilitySupport"] = 2] = "accessibilitySupport";
      EditorOption2[EditorOption2["accessibilityPageSize"] = 3] = "accessibilityPageSize";
      EditorOption2[EditorOption2["ariaLabel"] = 4] = "ariaLabel";
      EditorOption2[EditorOption2["autoClosingBrackets"] = 5] = "autoClosingBrackets";
      EditorOption2[EditorOption2["autoClosingDelete"] = 6] = "autoClosingDelete";
      EditorOption2[EditorOption2["autoClosingOvertype"] = 7] = "autoClosingOvertype";
      EditorOption2[EditorOption2["autoClosingQuotes"] = 8] = "autoClosingQuotes";
      EditorOption2[EditorOption2["autoIndent"] = 9] = "autoIndent";
      EditorOption2[EditorOption2["automaticLayout"] = 10] = "automaticLayout";
      EditorOption2[EditorOption2["autoSurround"] = 11] = "autoSurround";
      EditorOption2[EditorOption2["bracketPairColorization"] = 12] = "bracketPairColorization";
      EditorOption2[EditorOption2["codeLens"] = 13] = "codeLens";
      EditorOption2[EditorOption2["codeLensFontFamily"] = 14] = "codeLensFontFamily";
      EditorOption2[EditorOption2["codeLensFontSize"] = 15] = "codeLensFontSize";
      EditorOption2[EditorOption2["colorDecorators"] = 16] = "colorDecorators";
      EditorOption2[EditorOption2["columnSelection"] = 17] = "columnSelection";
      EditorOption2[EditorOption2["comments"] = 18] = "comments";
      EditorOption2[EditorOption2["contextmenu"] = 19] = "contextmenu";
      EditorOption2[EditorOption2["copyWithSyntaxHighlighting"] = 20] = "copyWithSyntaxHighlighting";
      EditorOption2[EditorOption2["cursorBlinking"] = 21] = "cursorBlinking";
      EditorOption2[EditorOption2["cursorSmoothCaretAnimation"] = 22] = "cursorSmoothCaretAnimation";
      EditorOption2[EditorOption2["cursorStyle"] = 23] = "cursorStyle";
      EditorOption2[EditorOption2["cursorSurroundingLines"] = 24] = "cursorSurroundingLines";
      EditorOption2[EditorOption2["cursorSurroundingLinesStyle"] = 25] = "cursorSurroundingLinesStyle";
      EditorOption2[EditorOption2["cursorWidth"] = 26] = "cursorWidth";
      EditorOption2[EditorOption2["disableLayerHinting"] = 27] = "disableLayerHinting";
      EditorOption2[EditorOption2["disableMonospaceOptimizations"] = 28] = "disableMonospaceOptimizations";
      EditorOption2[EditorOption2["domReadOnly"] = 29] = "domReadOnly";
      EditorOption2[EditorOption2["dragAndDrop"] = 30] = "dragAndDrop";
      EditorOption2[EditorOption2["emptySelectionClipboard"] = 31] = "emptySelectionClipboard";
      EditorOption2[EditorOption2["extraEditorClassName"] = 32] = "extraEditorClassName";
      EditorOption2[EditorOption2["fastScrollSensitivity"] = 33] = "fastScrollSensitivity";
      EditorOption2[EditorOption2["find"] = 34] = "find";
      EditorOption2[EditorOption2["fixedOverflowWidgets"] = 35] = "fixedOverflowWidgets";
      EditorOption2[EditorOption2["folding"] = 36] = "folding";
      EditorOption2[EditorOption2["foldingStrategy"] = 37] = "foldingStrategy";
      EditorOption2[EditorOption2["foldingHighlight"] = 38] = "foldingHighlight";
      EditorOption2[EditorOption2["foldingImportsByDefault"] = 39] = "foldingImportsByDefault";
      EditorOption2[EditorOption2["unfoldOnClickAfterEndOfLine"] = 40] = "unfoldOnClickAfterEndOfLine";
      EditorOption2[EditorOption2["fontFamily"] = 41] = "fontFamily";
      EditorOption2[EditorOption2["fontInfo"] = 42] = "fontInfo";
      EditorOption2[EditorOption2["fontLigatures"] = 43] = "fontLigatures";
      EditorOption2[EditorOption2["fontSize"] = 44] = "fontSize";
      EditorOption2[EditorOption2["fontWeight"] = 45] = "fontWeight";
      EditorOption2[EditorOption2["formatOnPaste"] = 46] = "formatOnPaste";
      EditorOption2[EditorOption2["formatOnType"] = 47] = "formatOnType";
      EditorOption2[EditorOption2["glyphMargin"] = 48] = "glyphMargin";
      EditorOption2[EditorOption2["gotoLocation"] = 49] = "gotoLocation";
      EditorOption2[EditorOption2["hideCursorInOverviewRuler"] = 50] = "hideCursorInOverviewRuler";
      EditorOption2[EditorOption2["highlightActiveIndentGuide"] = 51] = "highlightActiveIndentGuide";
      EditorOption2[EditorOption2["hover"] = 52] = "hover";
      EditorOption2[EditorOption2["inDiffEditor"] = 53] = "inDiffEditor";
      EditorOption2[EditorOption2["inlineSuggest"] = 54] = "inlineSuggest";
      EditorOption2[EditorOption2["letterSpacing"] = 55] = "letterSpacing";
      EditorOption2[EditorOption2["lightbulb"] = 56] = "lightbulb";
      EditorOption2[EditorOption2["lineDecorationsWidth"] = 57] = "lineDecorationsWidth";
      EditorOption2[EditorOption2["lineHeight"] = 58] = "lineHeight";
      EditorOption2[EditorOption2["lineNumbers"] = 59] = "lineNumbers";
      EditorOption2[EditorOption2["lineNumbersMinChars"] = 60] = "lineNumbersMinChars";
      EditorOption2[EditorOption2["linkedEditing"] = 61] = "linkedEditing";
      EditorOption2[EditorOption2["links"] = 62] = "links";
      EditorOption2[EditorOption2["matchBrackets"] = 63] = "matchBrackets";
      EditorOption2[EditorOption2["minimap"] = 64] = "minimap";
      EditorOption2[EditorOption2["mouseStyle"] = 65] = "mouseStyle";
      EditorOption2[EditorOption2["mouseWheelScrollSensitivity"] = 66] = "mouseWheelScrollSensitivity";
      EditorOption2[EditorOption2["mouseWheelZoom"] = 67] = "mouseWheelZoom";
      EditorOption2[EditorOption2["multiCursorMergeOverlapping"] = 68] = "multiCursorMergeOverlapping";
      EditorOption2[EditorOption2["multiCursorModifier"] = 69] = "multiCursorModifier";
      EditorOption2[EditorOption2["multiCursorPaste"] = 70] = "multiCursorPaste";
      EditorOption2[EditorOption2["occurrencesHighlight"] = 71] = "occurrencesHighlight";
      EditorOption2[EditorOption2["overviewRulerBorder"] = 72] = "overviewRulerBorder";
      EditorOption2[EditorOption2["overviewRulerLanes"] = 73] = "overviewRulerLanes";
      EditorOption2[EditorOption2["padding"] = 74] = "padding";
      EditorOption2[EditorOption2["parameterHints"] = 75] = "parameterHints";
      EditorOption2[EditorOption2["peekWidgetDefaultFocus"] = 76] = "peekWidgetDefaultFocus";
      EditorOption2[EditorOption2["definitionLinkOpensInPeek"] = 77] = "definitionLinkOpensInPeek";
      EditorOption2[EditorOption2["quickSuggestions"] = 78] = "quickSuggestions";
      EditorOption2[EditorOption2["quickSuggestionsDelay"] = 79] = "quickSuggestionsDelay";
      EditorOption2[EditorOption2["readOnly"] = 80] = "readOnly";
      EditorOption2[EditorOption2["renameOnType"] = 81] = "renameOnType";
      EditorOption2[EditorOption2["renderControlCharacters"] = 82] = "renderControlCharacters";
      EditorOption2[EditorOption2["renderIndentGuides"] = 83] = "renderIndentGuides";
      EditorOption2[EditorOption2["renderFinalNewline"] = 84] = "renderFinalNewline";
      EditorOption2[EditorOption2["renderLineHighlight"] = 85] = "renderLineHighlight";
      EditorOption2[EditorOption2["renderLineHighlightOnlyWhenFocus"] = 86] = "renderLineHighlightOnlyWhenFocus";
      EditorOption2[EditorOption2["renderValidationDecorations"] = 87] = "renderValidationDecorations";
      EditorOption2[EditorOption2["renderWhitespace"] = 88] = "renderWhitespace";
      EditorOption2[EditorOption2["revealHorizontalRightPadding"] = 89] = "revealHorizontalRightPadding";
      EditorOption2[EditorOption2["roundedSelection"] = 90] = "roundedSelection";
      EditorOption2[EditorOption2["rulers"] = 91] = "rulers";
      EditorOption2[EditorOption2["scrollbar"] = 92] = "scrollbar";
      EditorOption2[EditorOption2["scrollBeyondLastColumn"] = 93] = "scrollBeyondLastColumn";
      EditorOption2[EditorOption2["scrollBeyondLastLine"] = 94] = "scrollBeyondLastLine";
      EditorOption2[EditorOption2["scrollPredominantAxis"] = 95] = "scrollPredominantAxis";
      EditorOption2[EditorOption2["selectionClipboard"] = 96] = "selectionClipboard";
      EditorOption2[EditorOption2["selectionHighlight"] = 97] = "selectionHighlight";
      EditorOption2[EditorOption2["selectOnLineNumbers"] = 98] = "selectOnLineNumbers";
      EditorOption2[EditorOption2["showFoldingControls"] = 99] = "showFoldingControls";
      EditorOption2[EditorOption2["showUnused"] = 100] = "showUnused";
      EditorOption2[EditorOption2["snippetSuggestions"] = 101] = "snippetSuggestions";
      EditorOption2[EditorOption2["smartSelect"] = 102] = "smartSelect";
      EditorOption2[EditorOption2["smoothScrolling"] = 103] = "smoothScrolling";
      EditorOption2[EditorOption2["stickyTabStops"] = 104] = "stickyTabStops";
      EditorOption2[EditorOption2["stopRenderingLineAfter"] = 105] = "stopRenderingLineAfter";
      EditorOption2[EditorOption2["suggest"] = 106] = "suggest";
      EditorOption2[EditorOption2["suggestFontSize"] = 107] = "suggestFontSize";
      EditorOption2[EditorOption2["suggestLineHeight"] = 108] = "suggestLineHeight";
      EditorOption2[EditorOption2["suggestOnTriggerCharacters"] = 109] = "suggestOnTriggerCharacters";
      EditorOption2[EditorOption2["suggestSelection"] = 110] = "suggestSelection";
      EditorOption2[EditorOption2["tabCompletion"] = 111] = "tabCompletion";
      EditorOption2[EditorOption2["tabIndex"] = 112] = "tabIndex";
      EditorOption2[EditorOption2["unusualLineTerminators"] = 113] = "unusualLineTerminators";
      EditorOption2[EditorOption2["useShadowDOM"] = 114] = "useShadowDOM";
      EditorOption2[EditorOption2["useTabStops"] = 115] = "useTabStops";
      EditorOption2[EditorOption2["wordSeparators"] = 116] = "wordSeparators";
      EditorOption2[EditorOption2["wordWrap"] = 117] = "wordWrap";
      EditorOption2[EditorOption2["wordWrapBreakAfterCharacters"] = 118] = "wordWrapBreakAfterCharacters";
      EditorOption2[EditorOption2["wordWrapBreakBeforeCharacters"] = 119] = "wordWrapBreakBeforeCharacters";
      EditorOption2[EditorOption2["wordWrapColumn"] = 120] = "wordWrapColumn";
      EditorOption2[EditorOption2["wordWrapOverride1"] = 121] = "wordWrapOverride1";
      EditorOption2[EditorOption2["wordWrapOverride2"] = 122] = "wordWrapOverride2";
      EditorOption2[EditorOption2["wrappingIndent"] = 123] = "wrappingIndent";
      EditorOption2[EditorOption2["wrappingStrategy"] = 124] = "wrappingStrategy";
      EditorOption2[EditorOption2["showDeprecated"] = 125] = "showDeprecated";
      EditorOption2[EditorOption2["inlayHints"] = 126] = "inlayHints";
      EditorOption2[EditorOption2["editorClassName"] = 127] = "editorClassName";
      EditorOption2[EditorOption2["pixelRatio"] = 128] = "pixelRatio";
      EditorOption2[EditorOption2["tabFocusMode"] = 129] = "tabFocusMode";
      EditorOption2[EditorOption2["layoutInfo"] = 130] = "layoutInfo";
      EditorOption2[EditorOption2["wrappingInfo"] = 131] = "wrappingInfo";
    })(EditorOption || (EditorOption = {}));
    var EndOfLinePreference;
    (function(EndOfLinePreference2) {
      EndOfLinePreference2[EndOfLinePreference2["TextDefined"] = 0] = "TextDefined";
      EndOfLinePreference2[EndOfLinePreference2["LF"] = 1] = "LF";
      EndOfLinePreference2[EndOfLinePreference2["CRLF"] = 2] = "CRLF";
    })(EndOfLinePreference || (EndOfLinePreference = {}));
    var EndOfLineSequence;
    (function(EndOfLineSequence2) {
      EndOfLineSequence2[EndOfLineSequence2["LF"] = 0] = "LF";
      EndOfLineSequence2[EndOfLineSequence2["CRLF"] = 1] = "CRLF";
    })(EndOfLineSequence || (EndOfLineSequence = {}));
    var IndentAction;
    (function(IndentAction2) {
      IndentAction2[IndentAction2["None"] = 0] = "None";
      IndentAction2[IndentAction2["Indent"] = 1] = "Indent";
      IndentAction2[IndentAction2["IndentOutdent"] = 2] = "IndentOutdent";
      IndentAction2[IndentAction2["Outdent"] = 3] = "Outdent";
    })(IndentAction || (IndentAction = {}));
    var InlayHintKind;
    (function(InlayHintKind2) {
      InlayHintKind2[InlayHintKind2["Other"] = 0] = "Other";
      InlayHintKind2[InlayHintKind2["Type"] = 1] = "Type";
      InlayHintKind2[InlayHintKind2["Parameter"] = 2] = "Parameter";
    })(InlayHintKind || (InlayHintKind = {}));
    var InlineCompletionTriggerKind;
    (function(InlineCompletionTriggerKind2) {
      InlineCompletionTriggerKind2[InlineCompletionTriggerKind2["Automatic"] = 0] = "Automatic";
      InlineCompletionTriggerKind2[InlineCompletionTriggerKind2["Explicit"] = 1] = "Explicit";
    })(InlineCompletionTriggerKind || (InlineCompletionTriggerKind = {}));
    var KeyCode;
    (function(KeyCode2) {
      KeyCode2[KeyCode2["DependsOnKbLayout"] = -1] = "DependsOnKbLayout";
      KeyCode2[KeyCode2["Unknown"] = 0] = "Unknown";
      KeyCode2[KeyCode2["Backspace"] = 1] = "Backspace";
      KeyCode2[KeyCode2["Tab"] = 2] = "Tab";
      KeyCode2[KeyCode2["Enter"] = 3] = "Enter";
      KeyCode2[KeyCode2["Shift"] = 4] = "Shift";
      KeyCode2[KeyCode2["Ctrl"] = 5] = "Ctrl";
      KeyCode2[KeyCode2["Alt"] = 6] = "Alt";
      KeyCode2[KeyCode2["PauseBreak"] = 7] = "PauseBreak";
      KeyCode2[KeyCode2["CapsLock"] = 8] = "CapsLock";
      KeyCode2[KeyCode2["Escape"] = 9] = "Escape";
      KeyCode2[KeyCode2["Space"] = 10] = "Space";
      KeyCode2[KeyCode2["PageUp"] = 11] = "PageUp";
      KeyCode2[KeyCode2["PageDown"] = 12] = "PageDown";
      KeyCode2[KeyCode2["End"] = 13] = "End";
      KeyCode2[KeyCode2["Home"] = 14] = "Home";
      KeyCode2[KeyCode2["LeftArrow"] = 15] = "LeftArrow";
      KeyCode2[KeyCode2["UpArrow"] = 16] = "UpArrow";
      KeyCode2[KeyCode2["RightArrow"] = 17] = "RightArrow";
      KeyCode2[KeyCode2["DownArrow"] = 18] = "DownArrow";
      KeyCode2[KeyCode2["Insert"] = 19] = "Insert";
      KeyCode2[KeyCode2["Delete"] = 20] = "Delete";
      KeyCode2[KeyCode2["KEY_0"] = 21] = "KEY_0";
      KeyCode2[KeyCode2["KEY_1"] = 22] = "KEY_1";
      KeyCode2[KeyCode2["KEY_2"] = 23] = "KEY_2";
      KeyCode2[KeyCode2["KEY_3"] = 24] = "KEY_3";
      KeyCode2[KeyCode2["KEY_4"] = 25] = "KEY_4";
      KeyCode2[KeyCode2["KEY_5"] = 26] = "KEY_5";
      KeyCode2[KeyCode2["KEY_6"] = 27] = "KEY_6";
      KeyCode2[KeyCode2["KEY_7"] = 28] = "KEY_7";
      KeyCode2[KeyCode2["KEY_8"] = 29] = "KEY_8";
      KeyCode2[KeyCode2["KEY_9"] = 30] = "KEY_9";
      KeyCode2[KeyCode2["KEY_A"] = 31] = "KEY_A";
      KeyCode2[KeyCode2["KEY_B"] = 32] = "KEY_B";
      KeyCode2[KeyCode2["KEY_C"] = 33] = "KEY_C";
      KeyCode2[KeyCode2["KEY_D"] = 34] = "KEY_D";
      KeyCode2[KeyCode2["KEY_E"] = 35] = "KEY_E";
      KeyCode2[KeyCode2["KEY_F"] = 36] = "KEY_F";
      KeyCode2[KeyCode2["KEY_G"] = 37] = "KEY_G";
      KeyCode2[KeyCode2["KEY_H"] = 38] = "KEY_H";
      KeyCode2[KeyCode2["KEY_I"] = 39] = "KEY_I";
      KeyCode2[KeyCode2["KEY_J"] = 40] = "KEY_J";
      KeyCode2[KeyCode2["KEY_K"] = 41] = "KEY_K";
      KeyCode2[KeyCode2["KEY_L"] = 42] = "KEY_L";
      KeyCode2[KeyCode2["KEY_M"] = 43] = "KEY_M";
      KeyCode2[KeyCode2["KEY_N"] = 44] = "KEY_N";
      KeyCode2[KeyCode2["KEY_O"] = 45] = "KEY_O";
      KeyCode2[KeyCode2["KEY_P"] = 46] = "KEY_P";
      KeyCode2[KeyCode2["KEY_Q"] = 47] = "KEY_Q";
      KeyCode2[KeyCode2["KEY_R"] = 48] = "KEY_R";
      KeyCode2[KeyCode2["KEY_S"] = 49] = "KEY_S";
      KeyCode2[KeyCode2["KEY_T"] = 50] = "KEY_T";
      KeyCode2[KeyCode2["KEY_U"] = 51] = "KEY_U";
      KeyCode2[KeyCode2["KEY_V"] = 52] = "KEY_V";
      KeyCode2[KeyCode2["KEY_W"] = 53] = "KEY_W";
      KeyCode2[KeyCode2["KEY_X"] = 54] = "KEY_X";
      KeyCode2[KeyCode2["KEY_Y"] = 55] = "KEY_Y";
      KeyCode2[KeyCode2["KEY_Z"] = 56] = "KEY_Z";
      KeyCode2[KeyCode2["Meta"] = 57] = "Meta";
      KeyCode2[KeyCode2["ContextMenu"] = 58] = "ContextMenu";
      KeyCode2[KeyCode2["F1"] = 59] = "F1";
      KeyCode2[KeyCode2["F2"] = 60] = "F2";
      KeyCode2[KeyCode2["F3"] = 61] = "F3";
      KeyCode2[KeyCode2["F4"] = 62] = "F4";
      KeyCode2[KeyCode2["F5"] = 63] = "F5";
      KeyCode2[KeyCode2["F6"] = 64] = "F6";
      KeyCode2[KeyCode2["F7"] = 65] = "F7";
      KeyCode2[KeyCode2["F8"] = 66] = "F8";
      KeyCode2[KeyCode2["F9"] = 67] = "F9";
      KeyCode2[KeyCode2["F10"] = 68] = "F10";
      KeyCode2[KeyCode2["F11"] = 69] = "F11";
      KeyCode2[KeyCode2["F12"] = 70] = "F12";
      KeyCode2[KeyCode2["F13"] = 71] = "F13";
      KeyCode2[KeyCode2["F14"] = 72] = "F14";
      KeyCode2[KeyCode2["F15"] = 73] = "F15";
      KeyCode2[KeyCode2["F16"] = 74] = "F16";
      KeyCode2[KeyCode2["F17"] = 75] = "F17";
      KeyCode2[KeyCode2["F18"] = 76] = "F18";
      KeyCode2[KeyCode2["F19"] = 77] = "F19";
      KeyCode2[KeyCode2["NumLock"] = 78] = "NumLock";
      KeyCode2[KeyCode2["ScrollLock"] = 79] = "ScrollLock";
      KeyCode2[KeyCode2["US_SEMICOLON"] = 80] = "US_SEMICOLON";
      KeyCode2[KeyCode2["US_EQUAL"] = 81] = "US_EQUAL";
      KeyCode2[KeyCode2["US_COMMA"] = 82] = "US_COMMA";
      KeyCode2[KeyCode2["US_MINUS"] = 83] = "US_MINUS";
      KeyCode2[KeyCode2["US_DOT"] = 84] = "US_DOT";
      KeyCode2[KeyCode2["US_SLASH"] = 85] = "US_SLASH";
      KeyCode2[KeyCode2["US_BACKTICK"] = 86] = "US_BACKTICK";
      KeyCode2[KeyCode2["US_OPEN_SQUARE_BRACKET"] = 87] = "US_OPEN_SQUARE_BRACKET";
      KeyCode2[KeyCode2["US_BACKSLASH"] = 88] = "US_BACKSLASH";
      KeyCode2[KeyCode2["US_CLOSE_SQUARE_BRACKET"] = 89] = "US_CLOSE_SQUARE_BRACKET";
      KeyCode2[KeyCode2["US_QUOTE"] = 90] = "US_QUOTE";
      KeyCode2[KeyCode2["OEM_8"] = 91] = "OEM_8";
      KeyCode2[KeyCode2["OEM_102"] = 92] = "OEM_102";
      KeyCode2[KeyCode2["NUMPAD_0"] = 93] = "NUMPAD_0";
      KeyCode2[KeyCode2["NUMPAD_1"] = 94] = "NUMPAD_1";
      KeyCode2[KeyCode2["NUMPAD_2"] = 95] = "NUMPAD_2";
      KeyCode2[KeyCode2["NUMPAD_3"] = 96] = "NUMPAD_3";
      KeyCode2[KeyCode2["NUMPAD_4"] = 97] = "NUMPAD_4";
      KeyCode2[KeyCode2["NUMPAD_5"] = 98] = "NUMPAD_5";
      KeyCode2[KeyCode2["NUMPAD_6"] = 99] = "NUMPAD_6";
      KeyCode2[KeyCode2["NUMPAD_7"] = 100] = "NUMPAD_7";
      KeyCode2[KeyCode2["NUMPAD_8"] = 101] = "NUMPAD_8";
      KeyCode2[KeyCode2["NUMPAD_9"] = 102] = "NUMPAD_9";
      KeyCode2[KeyCode2["NUMPAD_MULTIPLY"] = 103] = "NUMPAD_MULTIPLY";
      KeyCode2[KeyCode2["NUMPAD_ADD"] = 104] = "NUMPAD_ADD";
      KeyCode2[KeyCode2["NUMPAD_SEPARATOR"] = 105] = "NUMPAD_SEPARATOR";
      KeyCode2[KeyCode2["NUMPAD_SUBTRACT"] = 106] = "NUMPAD_SUBTRACT";
      KeyCode2[KeyCode2["NUMPAD_DECIMAL"] = 107] = "NUMPAD_DECIMAL";
      KeyCode2[KeyCode2["NUMPAD_DIVIDE"] = 108] = "NUMPAD_DIVIDE";
      KeyCode2[KeyCode2["KEY_IN_COMPOSITION"] = 109] = "KEY_IN_COMPOSITION";
      KeyCode2[KeyCode2["ABNT_C1"] = 110] = "ABNT_C1";
      KeyCode2[KeyCode2["ABNT_C2"] = 111] = "ABNT_C2";
      KeyCode2[KeyCode2["MAX_VALUE"] = 112] = "MAX_VALUE";
    })(KeyCode || (KeyCode = {}));
    var MarkerSeverity;
    (function(MarkerSeverity2) {
      MarkerSeverity2[MarkerSeverity2["Hint"] = 1] = "Hint";
      MarkerSeverity2[MarkerSeverity2["Info"] = 2] = "Info";
      MarkerSeverity2[MarkerSeverity2["Warning"] = 4] = "Warning";
      MarkerSeverity2[MarkerSeverity2["Error"] = 8] = "Error";
    })(MarkerSeverity || (MarkerSeverity = {}));
    var MarkerTag;
    (function(MarkerTag2) {
      MarkerTag2[MarkerTag2["Unnecessary"] = 1] = "Unnecessary";
      MarkerTag2[MarkerTag2["Deprecated"] = 2] = "Deprecated";
    })(MarkerTag || (MarkerTag = {}));
    var MinimapPosition;
    (function(MinimapPosition2) {
      MinimapPosition2[MinimapPosition2["Inline"] = 1] = "Inline";
      MinimapPosition2[MinimapPosition2["Gutter"] = 2] = "Gutter";
    })(MinimapPosition || (MinimapPosition = {}));
    var MouseTargetType;
    (function(MouseTargetType2) {
      MouseTargetType2[MouseTargetType2["UNKNOWN"] = 0] = "UNKNOWN";
      MouseTargetType2[MouseTargetType2["TEXTAREA"] = 1] = "TEXTAREA";
      MouseTargetType2[MouseTargetType2["GUTTER_GLYPH_MARGIN"] = 2] = "GUTTER_GLYPH_MARGIN";
      MouseTargetType2[MouseTargetType2["GUTTER_LINE_NUMBERS"] = 3] = "GUTTER_LINE_NUMBERS";
      MouseTargetType2[MouseTargetType2["GUTTER_LINE_DECORATIONS"] = 4] = "GUTTER_LINE_DECORATIONS";
      MouseTargetType2[MouseTargetType2["GUTTER_VIEW_ZONE"] = 5] = "GUTTER_VIEW_ZONE";
      MouseTargetType2[MouseTargetType2["CONTENT_TEXT"] = 6] = "CONTENT_TEXT";
      MouseTargetType2[MouseTargetType2["CONTENT_EMPTY"] = 7] = "CONTENT_EMPTY";
      MouseTargetType2[MouseTargetType2["CONTENT_VIEW_ZONE"] = 8] = "CONTENT_VIEW_ZONE";
      MouseTargetType2[MouseTargetType2["CONTENT_WIDGET"] = 9] = "CONTENT_WIDGET";
      MouseTargetType2[MouseTargetType2["OVERVIEW_RULER"] = 10] = "OVERVIEW_RULER";
      MouseTargetType2[MouseTargetType2["SCROLLBAR"] = 11] = "SCROLLBAR";
      MouseTargetType2[MouseTargetType2["OVERLAY_WIDGET"] = 12] = "OVERLAY_WIDGET";
      MouseTargetType2[MouseTargetType2["OUTSIDE_EDITOR"] = 13] = "OUTSIDE_EDITOR";
    })(MouseTargetType || (MouseTargetType = {}));
    var OverlayWidgetPositionPreference;
    (function(OverlayWidgetPositionPreference2) {
      OverlayWidgetPositionPreference2[OverlayWidgetPositionPreference2["TOP_RIGHT_CORNER"] = 0] = "TOP_RIGHT_CORNER";
      OverlayWidgetPositionPreference2[OverlayWidgetPositionPreference2["BOTTOM_RIGHT_CORNER"] = 1] = "BOTTOM_RIGHT_CORNER";
      OverlayWidgetPositionPreference2[OverlayWidgetPositionPreference2["TOP_CENTER"] = 2] = "TOP_CENTER";
    })(OverlayWidgetPositionPreference || (OverlayWidgetPositionPreference = {}));
    var OverviewRulerLane;
    (function(OverviewRulerLane2) {
      OverviewRulerLane2[OverviewRulerLane2["Left"] = 1] = "Left";
      OverviewRulerLane2[OverviewRulerLane2["Center"] = 2] = "Center";
      OverviewRulerLane2[OverviewRulerLane2["Right"] = 4] = "Right";
      OverviewRulerLane2[OverviewRulerLane2["Full"] = 7] = "Full";
    })(OverviewRulerLane || (OverviewRulerLane = {}));
    var RenderLineNumbersType;
    (function(RenderLineNumbersType2) {
      RenderLineNumbersType2[RenderLineNumbersType2["Off"] = 0] = "Off";
      RenderLineNumbersType2[RenderLineNumbersType2["On"] = 1] = "On";
      RenderLineNumbersType2[RenderLineNumbersType2["Relative"] = 2] = "Relative";
      RenderLineNumbersType2[RenderLineNumbersType2["Interval"] = 3] = "Interval";
      RenderLineNumbersType2[RenderLineNumbersType2["Custom"] = 4] = "Custom";
    })(RenderLineNumbersType || (RenderLineNumbersType = {}));
    var RenderMinimap;
    (function(RenderMinimap2) {
      RenderMinimap2[RenderMinimap2["None"] = 0] = "None";
      RenderMinimap2[RenderMinimap2["Text"] = 1] = "Text";
      RenderMinimap2[RenderMinimap2["Blocks"] = 2] = "Blocks";
    })(RenderMinimap || (RenderMinimap = {}));
    var ScrollType;
    (function(ScrollType2) {
      ScrollType2[ScrollType2["Smooth"] = 0] = "Smooth";
      ScrollType2[ScrollType2["Immediate"] = 1] = "Immediate";
    })(ScrollType || (ScrollType = {}));
    var ScrollbarVisibility;
    (function(ScrollbarVisibility2) {
      ScrollbarVisibility2[ScrollbarVisibility2["Auto"] = 1] = "Auto";
      ScrollbarVisibility2[ScrollbarVisibility2["Hidden"] = 2] = "Hidden";
      ScrollbarVisibility2[ScrollbarVisibility2["Visible"] = 3] = "Visible";
    })(ScrollbarVisibility || (ScrollbarVisibility = {}));
    var SelectionDirection;
    (function(SelectionDirection2) {
      SelectionDirection2[SelectionDirection2["LTR"] = 0] = "LTR";
      SelectionDirection2[SelectionDirection2["RTL"] = 1] = "RTL";
    })(SelectionDirection || (SelectionDirection = {}));
    var SignatureHelpTriggerKind;
    (function(SignatureHelpTriggerKind2) {
      SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["Invoke"] = 1] = "Invoke";
      SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["TriggerCharacter"] = 2] = "TriggerCharacter";
      SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["ContentChange"] = 3] = "ContentChange";
    })(SignatureHelpTriggerKind || (SignatureHelpTriggerKind = {}));
    var SymbolKind$1;
    (function(SymbolKind2) {
      SymbolKind2[SymbolKind2["File"] = 0] = "File";
      SymbolKind2[SymbolKind2["Module"] = 1] = "Module";
      SymbolKind2[SymbolKind2["Namespace"] = 2] = "Namespace";
      SymbolKind2[SymbolKind2["Package"] = 3] = "Package";
      SymbolKind2[SymbolKind2["Class"] = 4] = "Class";
      SymbolKind2[SymbolKind2["Method"] = 5] = "Method";
      SymbolKind2[SymbolKind2["Property"] = 6] = "Property";
      SymbolKind2[SymbolKind2["Field"] = 7] = "Field";
      SymbolKind2[SymbolKind2["Constructor"] = 8] = "Constructor";
      SymbolKind2[SymbolKind2["Enum"] = 9] = "Enum";
      SymbolKind2[SymbolKind2["Interface"] = 10] = "Interface";
      SymbolKind2[SymbolKind2["Function"] = 11] = "Function";
      SymbolKind2[SymbolKind2["Variable"] = 12] = "Variable";
      SymbolKind2[SymbolKind2["Constant"] = 13] = "Constant";
      SymbolKind2[SymbolKind2["String"] = 14] = "String";
      SymbolKind2[SymbolKind2["Number"] = 15] = "Number";
      SymbolKind2[SymbolKind2["Boolean"] = 16] = "Boolean";
      SymbolKind2[SymbolKind2["Array"] = 17] = "Array";
      SymbolKind2[SymbolKind2["Object"] = 18] = "Object";
      SymbolKind2[SymbolKind2["Key"] = 19] = "Key";
      SymbolKind2[SymbolKind2["Null"] = 20] = "Null";
      SymbolKind2[SymbolKind2["EnumMember"] = 21] = "EnumMember";
      SymbolKind2[SymbolKind2["Struct"] = 22] = "Struct";
      SymbolKind2[SymbolKind2["Event"] = 23] = "Event";
      SymbolKind2[SymbolKind2["Operator"] = 24] = "Operator";
      SymbolKind2[SymbolKind2["TypeParameter"] = 25] = "TypeParameter";
    })(SymbolKind$1 || (SymbolKind$1 = {}));
    var SymbolTag$1;
    (function(SymbolTag2) {
      SymbolTag2[SymbolTag2["Deprecated"] = 1] = "Deprecated";
    })(SymbolTag$1 || (SymbolTag$1 = {}));
    var TextEditorCursorBlinkingStyle;
    (function(TextEditorCursorBlinkingStyle2) {
      TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Hidden"] = 0] = "Hidden";
      TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Blink"] = 1] = "Blink";
      TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Smooth"] = 2] = "Smooth";
      TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Phase"] = 3] = "Phase";
      TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Expand"] = 4] = "Expand";
      TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Solid"] = 5] = "Solid";
    })(TextEditorCursorBlinkingStyle || (TextEditorCursorBlinkingStyle = {}));
    var TextEditorCursorStyle;
    (function(TextEditorCursorStyle2) {
      TextEditorCursorStyle2[TextEditorCursorStyle2["Line"] = 1] = "Line";
      TextEditorCursorStyle2[TextEditorCursorStyle2["Block"] = 2] = "Block";
      TextEditorCursorStyle2[TextEditorCursorStyle2["Underline"] = 3] = "Underline";
      TextEditorCursorStyle2[TextEditorCursorStyle2["LineThin"] = 4] = "LineThin";
      TextEditorCursorStyle2[TextEditorCursorStyle2["BlockOutline"] = 5] = "BlockOutline";
      TextEditorCursorStyle2[TextEditorCursorStyle2["UnderlineThin"] = 6] = "UnderlineThin";
    })(TextEditorCursorStyle || (TextEditorCursorStyle = {}));
    var TrackedRangeStickiness;
    (function(TrackedRangeStickiness2) {
      TrackedRangeStickiness2[TrackedRangeStickiness2["AlwaysGrowsWhenTypingAtEdges"] = 0] = "AlwaysGrowsWhenTypingAtEdges";
      TrackedRangeStickiness2[TrackedRangeStickiness2["NeverGrowsWhenTypingAtEdges"] = 1] = "NeverGrowsWhenTypingAtEdges";
      TrackedRangeStickiness2[TrackedRangeStickiness2["GrowsOnlyWhenTypingBefore"] = 2] = "GrowsOnlyWhenTypingBefore";
      TrackedRangeStickiness2[TrackedRangeStickiness2["GrowsOnlyWhenTypingAfter"] = 3] = "GrowsOnlyWhenTypingAfter";
    })(TrackedRangeStickiness || (TrackedRangeStickiness = {}));
    var WrappingIndent;
    (function(WrappingIndent2) {
      WrappingIndent2[WrappingIndent2["None"] = 0] = "None";
      WrappingIndent2[WrappingIndent2["Same"] = 1] = "Same";
      WrappingIndent2[WrappingIndent2["Indent"] = 2] = "Indent";
      WrappingIndent2[WrappingIndent2["DeepIndent"] = 3] = "DeepIndent";
    })(WrappingIndent || (WrappingIndent = {}));

    class KeyMod {
      static chord(firstPart, secondPart) {
        return KeyChord(firstPart, secondPart);
      }
    }
    KeyMod.CtrlCmd = 2048;
    KeyMod.Shift = 1024;
    KeyMod.Alt = 512;
    KeyMod.WinCtrl = 256;
    function createMonacoBaseAPI() {
      return {
        editor: void 0,
        languages: void 0,
        CancellationTokenSource,
        Emitter,
        KeyCode: KeyCode,
        KeyMod,
        Position: Position$1,
        Range: Range$1,
        Selection,
        SelectionDirection: SelectionDirection,
        MarkerSeverity: MarkerSeverity,
        MarkerTag: MarkerTag,
        Uri: URI$1,
        Token
      };
    }

    var __awaiter$1 = undefined && undefined.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    class MirrorModel extends MirrorTextModel {
      get uri() {
        return this._uri;
      }
      get eol() {
        return this._eol;
      }
      getValue() {
        return this.getText();
      }
      getLinesContent() {
        return this._lines.slice(0);
      }
      getLineCount() {
        return this._lines.length;
      }
      getLineContent(lineNumber) {
        return this._lines[lineNumber - 1];
      }
      getWordAtPosition(position, wordDefinition) {
        let wordAtText = getWordAtText(position.column, ensureValidWordDefinition(wordDefinition), this._lines[position.lineNumber - 1], 0);
        if (wordAtText) {
          return new Range$1(position.lineNumber, wordAtText.startColumn, position.lineNumber, wordAtText.endColumn);
        }
        return null;
      }
      words(wordDefinition) {
        const lines = this._lines;
        const wordenize = this._wordenize.bind(this);
        let lineNumber = 0;
        let lineText = "";
        let wordRangesIdx = 0;
        let wordRanges = [];
        return {
          *[Symbol.iterator]() {
            while (true) {
              if (wordRangesIdx < wordRanges.length) {
                const value = lineText.substring(wordRanges[wordRangesIdx].start, wordRanges[wordRangesIdx].end);
                wordRangesIdx += 1;
                yield value;
              } else {
                if (lineNumber < lines.length) {
                  lineText = lines[lineNumber];
                  wordRanges = wordenize(lineText, wordDefinition);
                  wordRangesIdx = 0;
                  lineNumber += 1;
                } else {
                  break;
                }
              }
            }
          }
        };
      }
      getLineWords(lineNumber, wordDefinition) {
        let content = this._lines[lineNumber - 1];
        let ranges = this._wordenize(content, wordDefinition);
        let words = [];
        for (const range of ranges) {
          words.push({
            word: content.substring(range.start, range.end),
            startColumn: range.start + 1,
            endColumn: range.end + 1
          });
        }
        return words;
      }
      _wordenize(content, wordDefinition) {
        const result = [];
        let match;
        wordDefinition.lastIndex = 0;
        while (match = wordDefinition.exec(content)) {
          if (match[0].length === 0) {
            break;
          }
          result.push({ start: match.index, end: match.index + match[0].length });
        }
        return result;
      }
      getValueInRange(range) {
        range = this._validateRange(range);
        if (range.startLineNumber === range.endLineNumber) {
          return this._lines[range.startLineNumber - 1].substring(range.startColumn - 1, range.endColumn - 1);
        }
        let lineEnding = this._eol;
        let startLineIndex = range.startLineNumber - 1;
        let endLineIndex = range.endLineNumber - 1;
        let resultLines = [];
        resultLines.push(this._lines[startLineIndex].substring(range.startColumn - 1));
        for (let i = startLineIndex + 1; i < endLineIndex; i++) {
          resultLines.push(this._lines[i]);
        }
        resultLines.push(this._lines[endLineIndex].substring(0, range.endColumn - 1));
        return resultLines.join(lineEnding);
      }
      offsetAt(position) {
        position = this._validatePosition(position);
        this._ensureLineStarts();
        return this._lineStarts.getPrefixSum(position.lineNumber - 2) + (position.column - 1);
      }
      positionAt(offset) {
        offset = Math.floor(offset);
        offset = Math.max(0, offset);
        this._ensureLineStarts();
        let out = this._lineStarts.getIndexOf(offset);
        let lineLength = this._lines[out.index].length;
        return {
          lineNumber: 1 + out.index,
          column: 1 + Math.min(out.remainder, lineLength)
        };
      }
      _validateRange(range) {
        const start = this._validatePosition({ lineNumber: range.startLineNumber, column: range.startColumn });
        const end = this._validatePosition({ lineNumber: range.endLineNumber, column: range.endColumn });
        if (start.lineNumber !== range.startLineNumber || start.column !== range.startColumn || end.lineNumber !== range.endLineNumber || end.column !== range.endColumn) {
          return {
            startLineNumber: start.lineNumber,
            startColumn: start.column,
            endLineNumber: end.lineNumber,
            endColumn: end.column
          };
        }
        return range;
      }
      _validatePosition(position) {
        if (!Position$1.isIPosition(position)) {
          throw new Error("bad position");
        }
        let { lineNumber, column } = position;
        let hasChanged = false;
        if (lineNumber < 1) {
          lineNumber = 1;
          column = 1;
          hasChanged = true;
        } else if (lineNumber > this._lines.length) {
          lineNumber = this._lines.length;
          column = this._lines[lineNumber - 1].length + 1;
          hasChanged = true;
        } else {
          let maxCharacter = this._lines[lineNumber - 1].length + 1;
          if (column < 1) {
            column = 1;
            hasChanged = true;
          } else if (column > maxCharacter) {
            column = maxCharacter;
            hasChanged = true;
          }
        }
        if (!hasChanged) {
          return position;
        } else {
          return { lineNumber, column };
        }
      }
    }
    class EditorSimpleWorker {
      constructor(host, foreignModuleFactory) {
        this._host = host;
        this._models = Object.create(null);
        this._foreignModuleFactory = foreignModuleFactory;
        this._foreignModule = null;
      }
      dispose() {
        this._models = Object.create(null);
      }
      _getModel(uri) {
        return this._models[uri];
      }
      _getModels() {
        let all = [];
        Object.keys(this._models).forEach((key) => all.push(this._models[key]));
        return all;
      }
      acceptNewModel(data) {
        this._models[data.url] = new MirrorModel(URI$1.parse(data.url), data.lines, data.EOL, data.versionId);
      }
      acceptModelChanged(strURL, e) {
        if (!this._models[strURL]) {
          return;
        }
        let model = this._models[strURL];
        model.onEvents(e);
      }
      acceptRemovedModel(strURL) {
        if (!this._models[strURL]) {
          return;
        }
        delete this._models[strURL];
      }
      computeDiff(originalUrl, modifiedUrl, ignoreTrimWhitespace, maxComputationTime) {
        return __awaiter$1(this, void 0, void 0, function* () {
          const original = this._getModel(originalUrl);
          const modified = this._getModel(modifiedUrl);
          if (!original || !modified) {
            return null;
          }
          const originalLines = original.getLinesContent();
          const modifiedLines = modified.getLinesContent();
          const diffComputer = new DiffComputer(originalLines, modifiedLines, {
            shouldComputeCharChanges: true,
            shouldPostProcessCharChanges: true,
            shouldIgnoreTrimWhitespace: ignoreTrimWhitespace,
            shouldMakePrettyDiff: true,
            maxComputationTime
          });
          const diffResult = diffComputer.computeDiff();
          const identical = diffResult.changes.length > 0 ? false : this._modelsAreIdentical(original, modified);
          return {
            quitEarly: diffResult.quitEarly,
            identical,
            changes: diffResult.changes
          };
        });
      }
      _modelsAreIdentical(original, modified) {
        const originalLineCount = original.getLineCount();
        const modifiedLineCount = modified.getLineCount();
        if (originalLineCount !== modifiedLineCount) {
          return false;
        }
        for (let line = 1; line <= originalLineCount; line++) {
          const originalLine = original.getLineContent(line);
          const modifiedLine = modified.getLineContent(line);
          if (originalLine !== modifiedLine) {
            return false;
          }
        }
        return true;
      }
      computeMoreMinimalEdits(modelUrl, edits) {
        return __awaiter$1(this, void 0, void 0, function* () {
          const model = this._getModel(modelUrl);
          if (!model) {
            return edits;
          }
          const result = [];
          let lastEol = void 0;
          edits = edits.slice(0).sort((a, b) => {
            if (a.range && b.range) {
              return Range$1.compareRangesUsingStarts(a.range, b.range);
            }
            let aRng = a.range ? 0 : 1;
            let bRng = b.range ? 0 : 1;
            return aRng - bRng;
          });
          for (let { range, text, eol } of edits) {
            if (typeof eol === "number") {
              lastEol = eol;
            }
            if (Range$1.isEmpty(range) && !text) {
              continue;
            }
            const original = model.getValueInRange(range);
            text = text.replace(/\r\n|\n|\r/g, model.eol);
            if (original === text) {
              continue;
            }
            if (Math.max(text.length, original.length) > EditorSimpleWorker._diffLimit) {
              result.push({ range, text });
              continue;
            }
            const changes = stringDiff(original, text, false);
            const editOffset = model.offsetAt(Range$1.lift(range).getStartPosition());
            for (const change of changes) {
              const start = model.positionAt(editOffset + change.originalStart);
              const end = model.positionAt(editOffset + change.originalStart + change.originalLength);
              const newEdit = {
                text: text.substr(change.modifiedStart, change.modifiedLength),
                range: { startLineNumber: start.lineNumber, startColumn: start.column, endLineNumber: end.lineNumber, endColumn: end.column }
              };
              if (model.getValueInRange(newEdit.range) !== newEdit.text) {
                result.push(newEdit);
              }
            }
          }
          if (typeof lastEol === "number") {
            result.push({ eol: lastEol, text: "", range: { startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0 } });
          }
          return result;
        });
      }
      computeLinks(modelUrl) {
        return __awaiter$1(this, void 0, void 0, function* () {
          let model = this._getModel(modelUrl);
          if (!model) {
            return null;
          }
          return computeLinks(model);
        });
      }
      textualSuggest(modelUrls, leadingWord, wordDef, wordDefFlags) {
        return __awaiter$1(this, void 0, void 0, function* () {
          const sw = new StopWatch(true);
          const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
          const seen = new Set();
          outer:
            for (let url of modelUrls) {
              const model = this._getModel(url);
              if (!model) {
                continue;
              }
              for (let word of model.words(wordDefRegExp)) {
                if (word === leadingWord || !isNaN(Number(word))) {
                  continue;
                }
                seen.add(word);
                if (seen.size > EditorSimpleWorker._suggestionsLimit) {
                  break outer;
                }
              }
            }
          return { words: Array.from(seen), duration: sw.elapsed() };
        });
      }
      computeWordRanges(modelUrl, range, wordDef, wordDefFlags) {
        return __awaiter$1(this, void 0, void 0, function* () {
          let model = this._getModel(modelUrl);
          if (!model) {
            return Object.create(null);
          }
          const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
          const result = Object.create(null);
          for (let line = range.startLineNumber; line < range.endLineNumber; line++) {
            let words = model.getLineWords(line, wordDefRegExp);
            for (const word of words) {
              if (!isNaN(Number(word.word))) {
                continue;
              }
              let array = result[word.word];
              if (!array) {
                array = [];
                result[word.word] = array;
              }
              array.push({
                startLineNumber: line,
                startColumn: word.startColumn,
                endLineNumber: line,
                endColumn: word.endColumn
              });
            }
          }
          return result;
        });
      }
      navigateValueSet(modelUrl, range, up, wordDef, wordDefFlags) {
        return __awaiter$1(this, void 0, void 0, function* () {
          let model = this._getModel(modelUrl);
          if (!model) {
            return null;
          }
          let wordDefRegExp = new RegExp(wordDef, wordDefFlags);
          if (range.startColumn === range.endColumn) {
            range = {
              startLineNumber: range.startLineNumber,
              startColumn: range.startColumn,
              endLineNumber: range.endLineNumber,
              endColumn: range.endColumn + 1
            };
          }
          let selectionText = model.getValueInRange(range);
          let wordRange = model.getWordAtPosition({ lineNumber: range.startLineNumber, column: range.startColumn }, wordDefRegExp);
          if (!wordRange) {
            return null;
          }
          let word = model.getValueInRange(wordRange);
          let result = BasicInplaceReplace.INSTANCE.navigateValueSet(range, selectionText, wordRange, word, up);
          return result;
        });
      }
      loadForeignModule(moduleId, createData, foreignHostMethods) {
        const proxyMethodRequest = (method, args) => {
          return this._host.fhr(method, args);
        };
        const foreignHost = createProxyObject(foreignHostMethods, proxyMethodRequest);
        let ctx = {
          host: foreignHost,
          getMirrorModels: () => {
            return this._getModels();
          }
        };
        if (this._foreignModuleFactory) {
          this._foreignModule = this._foreignModuleFactory(ctx, createData);
          return Promise.resolve(getAllMethodNames(this._foreignModule));
        }
        return Promise.reject(new Error(`Unexpected usage`));
      }
      fmr(method, args) {
        if (!this._foreignModule || typeof this._foreignModule[method] !== "function") {
          return Promise.reject(new Error("Missing requestHandler or method: " + method));
        }
        try {
          return Promise.resolve(this._foreignModule[method].apply(this._foreignModule, args));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }
    EditorSimpleWorker._diffLimit = 1e5;
    EditorSimpleWorker._suggestionsLimit = 1e4;
    if (typeof importScripts === "function") {
      globals.monaco = createMonacoBaseAPI();
    }

    let initialized = false;
    function initialize(foreignModule) {
      if (initialized) {
        return;
      }
      initialized = true;
      const simpleWorker = new SimpleWorkerServer((msg) => {
        self.postMessage(msg);
      }, (host) => new EditorSimpleWorker(host, foreignModule));
      self.onmessage = (e) => {
        simpleWorker.onmessage(e.data);
      };
    }
    self.onmessage = (e) => {
      if (!initialized) {
        initialize(null);
      }
    };

    function createScanner$1(text, ignoreTrivia) {
      if (ignoreTrivia === void 0) {
        ignoreTrivia = false;
      }
      var len = text.length;
      var pos = 0, value = "", tokenOffset = 0, token = 16, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0;
      function scanHexDigits(count, exact) {
        var digits = 0;
        var value2 = 0;
        while (digits < count || !exact) {
          var ch = text.charCodeAt(pos);
          if (ch >= 48 && ch <= 57) {
            value2 = value2 * 16 + ch - 48;
          } else if (ch >= 65 && ch <= 70) {
            value2 = value2 * 16 + ch - 65 + 10;
          } else if (ch >= 97 && ch <= 102) {
            value2 = value2 * 16 + ch - 97 + 10;
          } else {
            break;
          }
          pos++;
          digits++;
        }
        if (digits < count) {
          value2 = -1;
        }
        return value2;
      }
      function setPosition(newPosition) {
        pos = newPosition;
        value = "";
        tokenOffset = 0;
        token = 16;
        scanError = 0;
      }
      function scanNumber() {
        var start = pos;
        if (text.charCodeAt(pos) === 48) {
          pos++;
        } else {
          pos++;
          while (pos < text.length && isDigit(text.charCodeAt(pos))) {
            pos++;
          }
        }
        if (pos < text.length && text.charCodeAt(pos) === 46) {
          pos++;
          if (pos < text.length && isDigit(text.charCodeAt(pos))) {
            pos++;
            while (pos < text.length && isDigit(text.charCodeAt(pos))) {
              pos++;
            }
          } else {
            scanError = 3;
            return text.substring(start, pos);
          }
        }
        var end = pos;
        if (pos < text.length && (text.charCodeAt(pos) === 69 || text.charCodeAt(pos) === 101)) {
          pos++;
          if (pos < text.length && text.charCodeAt(pos) === 43 || text.charCodeAt(pos) === 45) {
            pos++;
          }
          if (pos < text.length && isDigit(text.charCodeAt(pos))) {
            pos++;
            while (pos < text.length && isDigit(text.charCodeAt(pos))) {
              pos++;
            }
            end = pos;
          } else {
            scanError = 3;
          }
        }
        return text.substring(start, end);
      }
      function scanString() {
        var result = "", start = pos;
        while (true) {
          if (pos >= len) {
            result += text.substring(start, pos);
            scanError = 2;
            break;
          }
          var ch = text.charCodeAt(pos);
          if (ch === 34) {
            result += text.substring(start, pos);
            pos++;
            break;
          }
          if (ch === 92) {
            result += text.substring(start, pos);
            pos++;
            if (pos >= len) {
              scanError = 2;
              break;
            }
            var ch2 = text.charCodeAt(pos++);
            switch (ch2) {
              case 34:
                result += '"';
                break;
              case 92:
                result += "\\";
                break;
              case 47:
                result += "/";
                break;
              case 98:
                result += "\b";
                break;
              case 102:
                result += "\f";
                break;
              case 110:
                result += "\n";
                break;
              case 114:
                result += "\r";
                break;
              case 116:
                result += "	";
                break;
              case 117:
                var ch3 = scanHexDigits(4, true);
                if (ch3 >= 0) {
                  result += String.fromCharCode(ch3);
                } else {
                  scanError = 4;
                }
                break;
              default:
                scanError = 5;
            }
            start = pos;
            continue;
          }
          if (ch >= 0 && ch <= 31) {
            if (isLineBreak(ch)) {
              result += text.substring(start, pos);
              scanError = 2;
              break;
            } else {
              scanError = 6;
            }
          }
          pos++;
        }
        return result;
      }
      function scanNext() {
        value = "";
        scanError = 0;
        tokenOffset = pos;
        lineStartOffset = lineNumber;
        prevTokenLineStartOffset = tokenLineStartOffset;
        if (pos >= len) {
          tokenOffset = len;
          return token = 17;
        }
        var code = text.charCodeAt(pos);
        if (isWhiteSpace(code)) {
          do {
            pos++;
            value += String.fromCharCode(code);
            code = text.charCodeAt(pos);
          } while (isWhiteSpace(code));
          return token = 15;
        }
        if (isLineBreak(code)) {
          pos++;
          value += String.fromCharCode(code);
          if (code === 13 && text.charCodeAt(pos) === 10) {
            pos++;
            value += "\n";
          }
          lineNumber++;
          tokenLineStartOffset = pos;
          return token = 14;
        }
        switch (code) {
          case 123:
            pos++;
            return token = 1;
          case 125:
            pos++;
            return token = 2;
          case 91:
            pos++;
            return token = 3;
          case 93:
            pos++;
            return token = 4;
          case 58:
            pos++;
            return token = 6;
          case 44:
            pos++;
            return token = 5;
          case 34:
            pos++;
            value = scanString();
            return token = 10;
          case 47:
            var start = pos - 1;
            if (text.charCodeAt(pos + 1) === 47) {
              pos += 2;
              while (pos < len) {
                if (isLineBreak(text.charCodeAt(pos))) {
                  break;
                }
                pos++;
              }
              value = text.substring(start, pos);
              return token = 12;
            }
            if (text.charCodeAt(pos + 1) === 42) {
              pos += 2;
              var safeLength = len - 1;
              var commentClosed = false;
              while (pos < safeLength) {
                var ch = text.charCodeAt(pos);
                if (ch === 42 && text.charCodeAt(pos + 1) === 47) {
                  pos += 2;
                  commentClosed = true;
                  break;
                }
                pos++;
                if (isLineBreak(ch)) {
                  if (ch === 13 && text.charCodeAt(pos) === 10) {
                    pos++;
                  }
                  lineNumber++;
                  tokenLineStartOffset = pos;
                }
              }
              if (!commentClosed) {
                pos++;
                scanError = 1;
              }
              value = text.substring(start, pos);
              return token = 13;
            }
            value += String.fromCharCode(code);
            pos++;
            return token = 16;
          case 45:
            value += String.fromCharCode(code);
            pos++;
            if (pos === len || !isDigit(text.charCodeAt(pos))) {
              return token = 16;
            }
          case 48:
          case 49:
          case 50:
          case 51:
          case 52:
          case 53:
          case 54:
          case 55:
          case 56:
          case 57:
            value += scanNumber();
            return token = 11;
          default:
            while (pos < len && isUnknownContentCharacter(code)) {
              pos++;
              code = text.charCodeAt(pos);
            }
            if (tokenOffset !== pos) {
              value = text.substring(tokenOffset, pos);
              switch (value) {
                case "true":
                  return token = 8;
                case "false":
                  return token = 9;
                case "null":
                  return token = 7;
              }
              return token = 16;
            }
            value += String.fromCharCode(code);
            pos++;
            return token = 16;
        }
      }
      function isUnknownContentCharacter(code) {
        if (isWhiteSpace(code) || isLineBreak(code)) {
          return false;
        }
        switch (code) {
          case 125:
          case 93:
          case 123:
          case 91:
          case 34:
          case 58:
          case 44:
          case 47:
            return false;
        }
        return true;
      }
      function scanNextNonTrivia() {
        var result;
        do {
          result = scanNext();
        } while (result >= 12 && result <= 15);
        return result;
      }
      return {
        setPosition,
        getPosition: function() {
          return pos;
        },
        scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
        getToken: function() {
          return token;
        },
        getTokenValue: function() {
          return value;
        },
        getTokenOffset: function() {
          return tokenOffset;
        },
        getTokenLength: function() {
          return pos - tokenOffset;
        },
        getTokenStartLine: function() {
          return lineStartOffset;
        },
        getTokenStartCharacter: function() {
          return tokenOffset - prevTokenLineStartOffset;
        },
        getTokenError: function() {
          return scanError;
        }
      };
    }
    function isWhiteSpace(ch) {
      return ch === 32 || ch === 9 || ch === 11 || ch === 12 || ch === 160 || ch === 5760 || ch >= 8192 && ch <= 8203 || ch === 8239 || ch === 8287 || ch === 12288 || ch === 65279;
    }
    function isLineBreak(ch) {
      return ch === 10 || ch === 13 || ch === 8232 || ch === 8233;
    }
    function isDigit(ch) {
      return ch >= 48 && ch <= 57;
    }

    function format$2(documentText, range, options) {
      var initialIndentLevel;
      var formatText;
      var formatTextStart;
      var rangeStart;
      var rangeEnd;
      if (range) {
        rangeStart = range.offset;
        rangeEnd = rangeStart + range.length;
        formatTextStart = rangeStart;
        while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
          formatTextStart--;
        }
        var endOffset = rangeEnd;
        while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
          endOffset++;
        }
        formatText = documentText.substring(formatTextStart, endOffset);
        initialIndentLevel = computeIndentLevel(formatText, options);
      } else {
        formatText = documentText;
        initialIndentLevel = 0;
        formatTextStart = 0;
        rangeStart = 0;
        rangeEnd = documentText.length;
      }
      var eol = getEOL(options, documentText);
      var lineBreak = false;
      var indentLevel = 0;
      var indentValue;
      if (options.insertSpaces) {
        indentValue = repeat(" ", options.tabSize || 4);
      } else {
        indentValue = "	";
      }
      var scanner = createScanner$1(formatText, false);
      var hasError = false;
      function newLineAndIndent() {
        return eol + repeat(indentValue, initialIndentLevel + indentLevel);
      }
      function scanNext() {
        var token = scanner.scan();
        lineBreak = false;
        while (token === 15 || token === 14) {
          lineBreak = lineBreak || token === 14;
          token = scanner.scan();
        }
        hasError = token === 16 || scanner.getTokenError() !== 0;
        return token;
      }
      var editOperations = [];
      function addEdit(text, startOffset, endOffset2) {
        if (!hasError && (!range || startOffset < rangeEnd && endOffset2 > rangeStart) && documentText.substring(startOffset, endOffset2) !== text) {
          editOperations.push({ offset: startOffset, length: endOffset2 - startOffset, content: text });
        }
      }
      var firstToken = scanNext();
      if (firstToken !== 17) {
        var firstTokenStart = scanner.getTokenOffset() + formatTextStart;
        var initialIndent = repeat(indentValue, initialIndentLevel);
        addEdit(initialIndent, formatTextStart, firstTokenStart);
      }
      while (firstToken !== 17) {
        var firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
        var secondToken = scanNext();
        var replaceContent = "";
        var needsLineBreak = false;
        while (!lineBreak && (secondToken === 12 || secondToken === 13)) {
          var commentTokenStart = scanner.getTokenOffset() + formatTextStart;
          addEdit(" ", firstTokenEnd, commentTokenStart);
          firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
          needsLineBreak = secondToken === 12;
          replaceContent = needsLineBreak ? newLineAndIndent() : "";
          secondToken = scanNext();
        }
        if (secondToken === 2) {
          if (firstToken !== 1) {
            indentLevel--;
            replaceContent = newLineAndIndent();
          }
        } else if (secondToken === 4) {
          if (firstToken !== 3) {
            indentLevel--;
            replaceContent = newLineAndIndent();
          }
        } else {
          switch (firstToken) {
            case 3:
            case 1:
              indentLevel++;
              replaceContent = newLineAndIndent();
              break;
            case 5:
            case 12:
              replaceContent = newLineAndIndent();
              break;
            case 13:
              if (lineBreak) {
                replaceContent = newLineAndIndent();
              } else if (!needsLineBreak) {
                replaceContent = " ";
              }
              break;
            case 6:
              if (!needsLineBreak) {
                replaceContent = " ";
              }
              break;
            case 10:
              if (secondToken === 6) {
                if (!needsLineBreak) {
                  replaceContent = "";
                }
                break;
              }
            case 7:
            case 8:
            case 9:
            case 11:
            case 2:
            case 4:
              if (secondToken === 12 || secondToken === 13) {
                if (!needsLineBreak) {
                  replaceContent = " ";
                }
              } else if (secondToken !== 5 && secondToken !== 17) {
                hasError = true;
              }
              break;
            case 16:
              hasError = true;
              break;
          }
          if (lineBreak && (secondToken === 12 || secondToken === 13)) {
            replaceContent = newLineAndIndent();
          }
        }
        if (secondToken === 17) {
          replaceContent = options.insertFinalNewline ? eol : "";
        }
        var secondTokenStart = scanner.getTokenOffset() + formatTextStart;
        addEdit(replaceContent, firstTokenEnd, secondTokenStart);
        firstToken = secondToken;
      }
      return editOperations;
    }
    function repeat(s, count) {
      var result = "";
      for (var i = 0; i < count; i++) {
        result += s;
      }
      return result;
    }
    function computeIndentLevel(content, options) {
      var i = 0;
      var nChars = 0;
      var tabSize = options.tabSize || 4;
      while (i < content.length) {
        var ch = content.charAt(i);
        if (ch === " ") {
          nChars++;
        } else if (ch === "	") {
          nChars += tabSize;
        } else {
          break;
        }
        i++;
      }
      return Math.floor(nChars / tabSize);
    }
    function getEOL(options, text) {
      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        if (ch === "\r") {
          if (i + 1 < text.length && text.charAt(i + 1) === "\n") {
            return "\r\n";
          }
          return "\r";
        } else if (ch === "\n") {
          return "\n";
        }
      }
      return options && options.eol || "\n";
    }
    function isEOL(text, offset) {
      return "\r\n".indexOf(text.charAt(offset)) !== -1;
    }

    var ParseOptions;
    (function(ParseOptions2) {
      ParseOptions2.DEFAULT = {
        allowTrailingComma: false
      };
    })(ParseOptions || (ParseOptions = {}));
    function parse$2(text, errors, options) {
      if (errors === void 0) {
        errors = [];
      }
      if (options === void 0) {
        options = ParseOptions.DEFAULT;
      }
      var currentProperty = null;
      var currentParent = [];
      var previousParents = [];
      function onValue(value) {
        if (Array.isArray(currentParent)) {
          currentParent.push(value);
        } else if (currentProperty !== null) {
          currentParent[currentProperty] = value;
        }
      }
      var visitor = {
        onObjectBegin: function() {
          var object = {};
          onValue(object);
          previousParents.push(currentParent);
          currentParent = object;
          currentProperty = null;
        },
        onObjectProperty: function(name) {
          currentProperty = name;
        },
        onObjectEnd: function() {
          currentParent = previousParents.pop();
        },
        onArrayBegin: function() {
          var array = [];
          onValue(array);
          previousParents.push(currentParent);
          currentParent = array;
          currentProperty = null;
        },
        onArrayEnd: function() {
          currentParent = previousParents.pop();
        },
        onLiteralValue: onValue,
        onError: function(error, offset, length) {
          errors.push({ error, offset, length });
        }
      };
      visit(text, visitor, options);
      return currentParent[0];
    }
    function getNodePath$2(node) {
      if (!node.parent || !node.parent.children) {
        return [];
      }
      var path = getNodePath$2(node.parent);
      if (node.parent.type === "property") {
        var key = node.parent.children[0].value;
        path.push(key);
      } else if (node.parent.type === "array") {
        var index = node.parent.children.indexOf(node);
        if (index !== -1) {
          path.push(index);
        }
      }
      return path;
    }
    function getNodeValue$2(node) {
      switch (node.type) {
        case "array":
          return node.children.map(getNodeValue$2);
        case "object":
          var obj = Object.create(null);
          for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var prop = _a[_i];
            var valueNode = prop.children[1];
            if (valueNode) {
              obj[prop.children[0].value] = getNodeValue$2(valueNode);
            }
          }
          return obj;
        case "null":
        case "string":
        case "number":
        case "boolean":
          return node.value;
        default:
          return void 0;
      }
    }
    function contains$1(node, offset, includeRightBound) {
      if (includeRightBound === void 0) {
        includeRightBound = false;
      }
      return offset >= node.offset && offset < node.offset + node.length || includeRightBound && offset === node.offset + node.length;
    }
    function findNodeAtOffset$1(node, offset, includeRightBound) {
      if (includeRightBound === void 0) {
        includeRightBound = false;
      }
      if (contains$1(node, offset, includeRightBound)) {
        var children = node.children;
        if (Array.isArray(children)) {
          for (var i = 0; i < children.length && children[i].offset <= offset; i++) {
            var item = findNodeAtOffset$1(children[i], offset, includeRightBound);
            if (item) {
              return item;
            }
          }
        }
        return node;
      }
      return void 0;
    }
    function visit(text, visitor, options) {
      if (options === void 0) {
        options = ParseOptions.DEFAULT;
      }
      var _scanner = createScanner$1(text, false);
      function toNoArgVisit(visitFunction) {
        return visitFunction ? function() {
          return visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter());
        } : function() {
          return true;
        };
      }
      function toOneArgVisit(visitFunction) {
        return visitFunction ? function(arg) {
          return visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter());
        } : function() {
          return true;
        };
      }
      var onObjectBegin = toNoArgVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisit(visitor.onObjectProperty), onObjectEnd = toNoArgVisit(visitor.onObjectEnd), onArrayBegin = toNoArgVisit(visitor.onArrayBegin), onArrayEnd = toNoArgVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisit(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
      var disallowComments = options && options.disallowComments;
      var allowTrailingComma = options && options.allowTrailingComma;
      function scanNext() {
        while (true) {
          var token = _scanner.scan();
          switch (_scanner.getTokenError()) {
            case 4:
              handleError(14);
              break;
            case 5:
              handleError(15);
              break;
            case 3:
              handleError(13);
              break;
            case 1:
              if (!disallowComments) {
                handleError(11);
              }
              break;
            case 2:
              handleError(12);
              break;
            case 6:
              handleError(16);
              break;
          }
          switch (token) {
            case 12:
            case 13:
              if (disallowComments) {
                handleError(10);
              } else {
                onComment();
              }
              break;
            case 16:
              handleError(1);
              break;
            case 15:
            case 14:
              break;
            default:
              return token;
          }
        }
      }
      function handleError(error, skipUntilAfter, skipUntil) {
        if (skipUntilAfter === void 0) {
          skipUntilAfter = [];
        }
        if (skipUntil === void 0) {
          skipUntil = [];
        }
        onError(error);
        if (skipUntilAfter.length + skipUntil.length > 0) {
          var token = _scanner.getToken();
          while (token !== 17) {
            if (skipUntilAfter.indexOf(token) !== -1) {
              scanNext();
              break;
            } else if (skipUntil.indexOf(token) !== -1) {
              break;
            }
            token = scanNext();
          }
        }
      }
      function parseString(isValue) {
        var value = _scanner.getTokenValue();
        if (isValue) {
          onLiteralValue(value);
        } else {
          onObjectProperty(value);
        }
        scanNext();
        return true;
      }
      function parseLiteral() {
        switch (_scanner.getToken()) {
          case 11:
            var tokenValue = _scanner.getTokenValue();
            var value = Number(tokenValue);
            if (isNaN(value)) {
              handleError(2);
              value = 0;
            }
            onLiteralValue(value);
            break;
          case 7:
            onLiteralValue(null);
            break;
          case 8:
            onLiteralValue(true);
            break;
          case 9:
            onLiteralValue(false);
            break;
          default:
            return false;
        }
        scanNext();
        return true;
      }
      function parseProperty() {
        if (_scanner.getToken() !== 10) {
          handleError(3, [], [2, 5]);
          return false;
        }
        parseString(false);
        if (_scanner.getToken() === 6) {
          onSeparator(":");
          scanNext();
          if (!parseValue()) {
            handleError(4, [], [2, 5]);
          }
        } else {
          handleError(5, [], [2, 5]);
        }
        return true;
      }
      function parseObject() {
        onObjectBegin();
        scanNext();
        var needsComma = false;
        while (_scanner.getToken() !== 2 && _scanner.getToken() !== 17) {
          if (_scanner.getToken() === 5) {
            if (!needsComma) {
              handleError(4, [], []);
            }
            onSeparator(",");
            scanNext();
            if (_scanner.getToken() === 2 && allowTrailingComma) {
              break;
            }
          } else if (needsComma) {
            handleError(6, [], []);
          }
          if (!parseProperty()) {
            handleError(4, [], [2, 5]);
          }
          needsComma = true;
        }
        onObjectEnd();
        if (_scanner.getToken() !== 2) {
          handleError(7, [2], []);
        } else {
          scanNext();
        }
        return true;
      }
      function parseArray() {
        onArrayBegin();
        scanNext();
        var needsComma = false;
        while (_scanner.getToken() !== 4 && _scanner.getToken() !== 17) {
          if (_scanner.getToken() === 5) {
            if (!needsComma) {
              handleError(4, [], []);
            }
            onSeparator(",");
            scanNext();
            if (_scanner.getToken() === 4 && allowTrailingComma) {
              break;
            }
          } else if (needsComma) {
            handleError(6, [], []);
          }
          if (!parseValue()) {
            handleError(4, [], [4, 5]);
          }
          needsComma = true;
        }
        onArrayEnd();
        if (_scanner.getToken() !== 4) {
          handleError(8, [4], []);
        } else {
          scanNext();
        }
        return true;
      }
      function parseValue() {
        switch (_scanner.getToken()) {
          case 3:
            return parseArray();
          case 1:
            return parseObject();
          case 10:
            return parseString(true);
          default:
            return parseLiteral();
        }
      }
      scanNext();
      if (_scanner.getToken() === 17) {
        if (options.allowEmptyContent) {
          return true;
        }
        handleError(4, [], []);
        return false;
      }
      if (!parseValue()) {
        handleError(4, [], []);
        return false;
      }
      if (_scanner.getToken() !== 17) {
        handleError(9, [], []);
      }
      return true;
    }

    var createScanner = createScanner$1;
    var parse$1 = parse$2;
    var findNodeAtOffset = findNodeAtOffset$1;
    var getNodePath$1 = getNodePath$2;
    var getNodeValue$1 = getNodeValue$2;
    function format$1(documentText, range, options) {
      return format$2(documentText, range, options);
    }

    function equals(one, other) {
      if (one === other) {
        return true;
      }
      if (one === null || one === void 0 || other === null || other === void 0) {
        return false;
      }
      if (typeof one !== typeof other) {
        return false;
      }
      if (typeof one !== "object") {
        return false;
      }
      if (Array.isArray(one) !== Array.isArray(other)) {
        return false;
      }
      var i, key;
      if (Array.isArray(one)) {
        if (one.length !== other.length) {
          return false;
        }
        for (i = 0; i < one.length; i++) {
          if (!equals(one[i], other[i])) {
            return false;
          }
        }
      } else {
        var oneKeys = [];
        for (key in one) {
          oneKeys.push(key);
        }
        oneKeys.sort();
        var otherKeys = [];
        for (key in other) {
          otherKeys.push(key);
        }
        otherKeys.sort();
        if (!equals(oneKeys, otherKeys)) {
          return false;
        }
        for (i = 0; i < oneKeys.length; i++) {
          if (!equals(one[oneKeys[i]], other[oneKeys[i]])) {
            return false;
          }
        }
      }
      return true;
    }
    function isNumber(val) {
      return typeof val === "number";
    }
    function isDefined(val) {
      return typeof val !== "undefined";
    }
    function isBoolean(val) {
      return typeof val === "boolean";
    }
    function isString(val) {
      return typeof val === "string";
    }

    function startsWith(haystack, needle) {
      if (haystack.length < needle.length) {
        return false;
      }
      for (var i = 0; i < needle.length; i++) {
        if (haystack[i] !== needle[i]) {
          return false;
        }
      }
      return true;
    }
    function endsWith(haystack, needle) {
      var diff = haystack.length - needle.length;
      if (diff > 0) {
        return haystack.lastIndexOf(needle) === diff;
      } else if (diff === 0) {
        return haystack === needle;
      } else {
        return false;
      }
    }
    function extendedRegExp(pattern) {
      if (startsWith(pattern, "(?i)")) {
        return new RegExp(pattern.substring(4), "i");
      } else {
        return new RegExp(pattern);
      }
    }

    var integer;
    (function(integer2) {
      integer2.MIN_VALUE = -2147483648;
      integer2.MAX_VALUE = 2147483647;
    })(integer || (integer = {}));
    var uinteger;
    (function(uinteger2) {
      uinteger2.MIN_VALUE = 0;
      uinteger2.MAX_VALUE = 2147483647;
    })(uinteger || (uinteger = {}));
    var Position;
    (function(Position2) {
      function create(line, character) {
        if (line === Number.MAX_VALUE) {
          line = uinteger.MAX_VALUE;
        }
        if (character === Number.MAX_VALUE) {
          character = uinteger.MAX_VALUE;
        }
        return { line, character };
      }
      Position2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.uinteger(candidate.line) && Is.uinteger(candidate.character);
      }
      Position2.is = is;
    })(Position || (Position = {}));
    var Range;
    (function(Range2) {
      function create(one, two, three, four) {
        if (Is.uinteger(one) && Is.uinteger(two) && Is.uinteger(three) && Is.uinteger(four)) {
          return { start: Position.create(one, two), end: Position.create(three, four) };
        } else if (Position.is(one) && Position.is(two)) {
          return { start: one, end: two };
        } else {
          throw new Error("Range#create called with invalid arguments[" + one + ", " + two + ", " + three + ", " + four + "]");
        }
      }
      Range2.create = create;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Position.is(candidate.start) && Position.is(candidate.end);
      }
      Range2.is = is;
    })(Range || (Range = {}));
    var Location;
    (function(Location2) {
      function create(uri, range) {
        return { uri, range };
      }
      Location2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Range.is(candidate.range) && (Is.string(candidate.uri) || Is.undefined(candidate.uri));
      }
      Location2.is = is;
    })(Location || (Location = {}));
    var LocationLink;
    (function(LocationLink2) {
      function create(targetUri, targetRange, targetSelectionRange, originSelectionRange) {
        return { targetUri, targetRange, targetSelectionRange, originSelectionRange };
      }
      LocationLink2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Range.is(candidate.targetRange) && Is.string(candidate.targetUri) && (Range.is(candidate.targetSelectionRange) || Is.undefined(candidate.targetSelectionRange)) && (Range.is(candidate.originSelectionRange) || Is.undefined(candidate.originSelectionRange));
      }
      LocationLink2.is = is;
    })(LocationLink || (LocationLink = {}));
    var Color;
    (function(Color2) {
      function create(red, green, blue, alpha) {
        return {
          red,
          green,
          blue,
          alpha
        };
      }
      Color2.create = create;
      function is(value) {
        var candidate = value;
        return Is.numberRange(candidate.red, 0, 1) && Is.numberRange(candidate.green, 0, 1) && Is.numberRange(candidate.blue, 0, 1) && Is.numberRange(candidate.alpha, 0, 1);
      }
      Color2.is = is;
    })(Color || (Color = {}));
    var ColorInformation;
    (function(ColorInformation2) {
      function create(range, color) {
        return {
          range,
          color
        };
      }
      ColorInformation2.create = create;
      function is(value) {
        var candidate = value;
        return Range.is(candidate.range) && Color.is(candidate.color);
      }
      ColorInformation2.is = is;
    })(ColorInformation || (ColorInformation = {}));
    var ColorPresentation;
    (function(ColorPresentation2) {
      function create(label, textEdit, additionalTextEdits) {
        return {
          label,
          textEdit,
          additionalTextEdits
        };
      }
      ColorPresentation2.create = create;
      function is(value) {
        var candidate = value;
        return Is.string(candidate.label) && (Is.undefined(candidate.textEdit) || TextEdit.is(candidate)) && (Is.undefined(candidate.additionalTextEdits) || Is.typedArray(candidate.additionalTextEdits, TextEdit.is));
      }
      ColorPresentation2.is = is;
    })(ColorPresentation || (ColorPresentation = {}));
    var FoldingRangeKind;
    (function(FoldingRangeKind2) {
      FoldingRangeKind2["Comment"] = "comment";
      FoldingRangeKind2["Imports"] = "imports";
      FoldingRangeKind2["Region"] = "region";
    })(FoldingRangeKind || (FoldingRangeKind = {}));
    var FoldingRange;
    (function(FoldingRange2) {
      function create(startLine, endLine, startCharacter, endCharacter, kind) {
        var result = {
          startLine,
          endLine
        };
        if (Is.defined(startCharacter)) {
          result.startCharacter = startCharacter;
        }
        if (Is.defined(endCharacter)) {
          result.endCharacter = endCharacter;
        }
        if (Is.defined(kind)) {
          result.kind = kind;
        }
        return result;
      }
      FoldingRange2.create = create;
      function is(value) {
        var candidate = value;
        return Is.uinteger(candidate.startLine) && Is.uinteger(candidate.startLine) && (Is.undefined(candidate.startCharacter) || Is.uinteger(candidate.startCharacter)) && (Is.undefined(candidate.endCharacter) || Is.uinteger(candidate.endCharacter)) && (Is.undefined(candidate.kind) || Is.string(candidate.kind));
      }
      FoldingRange2.is = is;
    })(FoldingRange || (FoldingRange = {}));
    var DiagnosticRelatedInformation;
    (function(DiagnosticRelatedInformation2) {
      function create(location, message) {
        return {
          location,
          message
        };
      }
      DiagnosticRelatedInformation2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Location.is(candidate.location) && Is.string(candidate.message);
      }
      DiagnosticRelatedInformation2.is = is;
    })(DiagnosticRelatedInformation || (DiagnosticRelatedInformation = {}));
    var DiagnosticSeverity;
    (function(DiagnosticSeverity2) {
      DiagnosticSeverity2.Error = 1;
      DiagnosticSeverity2.Warning = 2;
      DiagnosticSeverity2.Information = 3;
      DiagnosticSeverity2.Hint = 4;
    })(DiagnosticSeverity || (DiagnosticSeverity = {}));
    var DiagnosticTag;
    (function(DiagnosticTag2) {
      DiagnosticTag2.Unnecessary = 1;
      DiagnosticTag2.Deprecated = 2;
    })(DiagnosticTag || (DiagnosticTag = {}));
    var CodeDescription;
    (function(CodeDescription2) {
      function is(value) {
        var candidate = value;
        return candidate !== void 0 && candidate !== null && Is.string(candidate.href);
      }
      CodeDescription2.is = is;
    })(CodeDescription || (CodeDescription = {}));
    var Diagnostic;
    (function(Diagnostic2) {
      function create(range, message, severity, code, source, relatedInformation) {
        var result = { range, message };
        if (Is.defined(severity)) {
          result.severity = severity;
        }
        if (Is.defined(code)) {
          result.code = code;
        }
        if (Is.defined(source)) {
          result.source = source;
        }
        if (Is.defined(relatedInformation)) {
          result.relatedInformation = relatedInformation;
        }
        return result;
      }
      Diagnostic2.create = create;
      function is(value) {
        var _a;
        var candidate = value;
        return Is.defined(candidate) && Range.is(candidate.range) && Is.string(candidate.message) && (Is.number(candidate.severity) || Is.undefined(candidate.severity)) && (Is.integer(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code)) && (Is.undefined(candidate.codeDescription) || Is.string((_a = candidate.codeDescription) === null || _a === void 0 ? void 0 : _a.href)) && (Is.string(candidate.source) || Is.undefined(candidate.source)) && (Is.undefined(candidate.relatedInformation) || Is.typedArray(candidate.relatedInformation, DiagnosticRelatedInformation.is));
      }
      Diagnostic2.is = is;
    })(Diagnostic || (Diagnostic = {}));
    var Command;
    (function(Command2) {
      function create(title, command) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          args[_i - 2] = arguments[_i];
        }
        var result = { title, command };
        if (Is.defined(args) && args.length > 0) {
          result.arguments = args;
        }
        return result;
      }
      Command2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.title) && Is.string(candidate.command);
      }
      Command2.is = is;
    })(Command || (Command = {}));
    var TextEdit;
    (function(TextEdit2) {
      function replace(range, newText) {
        return { range, newText };
      }
      TextEdit2.replace = replace;
      function insert(position, newText) {
        return { range: { start: position, end: position }, newText };
      }
      TextEdit2.insert = insert;
      function del(range) {
        return { range, newText: "" };
      }
      TextEdit2.del = del;
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.newText) && Range.is(candidate.range);
      }
      TextEdit2.is = is;
    })(TextEdit || (TextEdit = {}));
    var ChangeAnnotation;
    (function(ChangeAnnotation2) {
      function create(label, needsConfirmation, description) {
        var result = { label };
        if (needsConfirmation !== void 0) {
          result.needsConfirmation = needsConfirmation;
        }
        if (description !== void 0) {
          result.description = description;
        }
        return result;
      }
      ChangeAnnotation2.create = create;
      function is(value) {
        var candidate = value;
        return candidate !== void 0 && Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.boolean(candidate.needsConfirmation) || candidate.needsConfirmation === void 0) && (Is.string(candidate.description) || candidate.description === void 0);
      }
      ChangeAnnotation2.is = is;
    })(ChangeAnnotation || (ChangeAnnotation = {}));
    var ChangeAnnotationIdentifier;
    (function(ChangeAnnotationIdentifier2) {
      function is(value) {
        var candidate = value;
        return typeof candidate === "string";
      }
      ChangeAnnotationIdentifier2.is = is;
    })(ChangeAnnotationIdentifier || (ChangeAnnotationIdentifier = {}));
    var AnnotatedTextEdit;
    (function(AnnotatedTextEdit2) {
      function replace(range, newText, annotation) {
        return { range, newText, annotationId: annotation };
      }
      AnnotatedTextEdit2.replace = replace;
      function insert(position, newText, annotation) {
        return { range: { start: position, end: position }, newText, annotationId: annotation };
      }
      AnnotatedTextEdit2.insert = insert;
      function del(range, annotation) {
        return { range, newText: "", annotationId: annotation };
      }
      AnnotatedTextEdit2.del = del;
      function is(value) {
        var candidate = value;
        return TextEdit.is(candidate) && (ChangeAnnotation.is(candidate.annotationId) || ChangeAnnotationIdentifier.is(candidate.annotationId));
      }
      AnnotatedTextEdit2.is = is;
    })(AnnotatedTextEdit || (AnnotatedTextEdit = {}));
    var TextDocumentEdit;
    (function(TextDocumentEdit2) {
      function create(textDocument, edits) {
        return { textDocument, edits };
      }
      TextDocumentEdit2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && OptionalVersionedTextDocumentIdentifier.is(candidate.textDocument) && Array.isArray(candidate.edits);
      }
      TextDocumentEdit2.is = is;
    })(TextDocumentEdit || (TextDocumentEdit = {}));
    var CreateFile;
    (function(CreateFile2) {
      function create(uri, options, annotation) {
        var result = {
          kind: "create",
          uri
        };
        if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
          result.options = options;
        }
        if (annotation !== void 0) {
          result.annotationId = annotation;
        }
        return result;
      }
      CreateFile2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && candidate.kind === "create" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
      }
      CreateFile2.is = is;
    })(CreateFile || (CreateFile = {}));
    var RenameFile;
    (function(RenameFile2) {
      function create(oldUri, newUri, options, annotation) {
        var result = {
          kind: "rename",
          oldUri,
          newUri
        };
        if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
          result.options = options;
        }
        if (annotation !== void 0) {
          result.annotationId = annotation;
        }
        return result;
      }
      RenameFile2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && candidate.kind === "rename" && Is.string(candidate.oldUri) && Is.string(candidate.newUri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
      }
      RenameFile2.is = is;
    })(RenameFile || (RenameFile = {}));
    var DeleteFile;
    (function(DeleteFile2) {
      function create(uri, options, annotation) {
        var result = {
          kind: "delete",
          uri
        };
        if (options !== void 0 && (options.recursive !== void 0 || options.ignoreIfNotExists !== void 0)) {
          result.options = options;
        }
        if (annotation !== void 0) {
          result.annotationId = annotation;
        }
        return result;
      }
      DeleteFile2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && candidate.kind === "delete" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.recursive === void 0 || Is.boolean(candidate.options.recursive)) && (candidate.options.ignoreIfNotExists === void 0 || Is.boolean(candidate.options.ignoreIfNotExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
      }
      DeleteFile2.is = is;
    })(DeleteFile || (DeleteFile = {}));
    var WorkspaceEdit;
    (function(WorkspaceEdit2) {
      function is(value) {
        var candidate = value;
        return candidate && (candidate.changes !== void 0 || candidate.documentChanges !== void 0) && (candidate.documentChanges === void 0 || candidate.documentChanges.every(function(change) {
          if (Is.string(change.kind)) {
            return CreateFile.is(change) || RenameFile.is(change) || DeleteFile.is(change);
          } else {
            return TextDocumentEdit.is(change);
          }
        }));
      }
      WorkspaceEdit2.is = is;
    })(WorkspaceEdit || (WorkspaceEdit = {}));
    var TextEditChangeImpl = function() {
      function TextEditChangeImpl2(edits, changeAnnotations) {
        this.edits = edits;
        this.changeAnnotations = changeAnnotations;
      }
      TextEditChangeImpl2.prototype.insert = function(position, newText, annotation) {
        var edit;
        var id;
        if (annotation === void 0) {
          edit = TextEdit.insert(position, newText);
        } else if (ChangeAnnotationIdentifier.is(annotation)) {
          id = annotation;
          edit = AnnotatedTextEdit.insert(position, newText, annotation);
        } else {
          this.assertChangeAnnotations(this.changeAnnotations);
          id = this.changeAnnotations.manage(annotation);
          edit = AnnotatedTextEdit.insert(position, newText, id);
        }
        this.edits.push(edit);
        if (id !== void 0) {
          return id;
        }
      };
      TextEditChangeImpl2.prototype.replace = function(range, newText, annotation) {
        var edit;
        var id;
        if (annotation === void 0) {
          edit = TextEdit.replace(range, newText);
        } else if (ChangeAnnotationIdentifier.is(annotation)) {
          id = annotation;
          edit = AnnotatedTextEdit.replace(range, newText, annotation);
        } else {
          this.assertChangeAnnotations(this.changeAnnotations);
          id = this.changeAnnotations.manage(annotation);
          edit = AnnotatedTextEdit.replace(range, newText, id);
        }
        this.edits.push(edit);
        if (id !== void 0) {
          return id;
        }
      };
      TextEditChangeImpl2.prototype.delete = function(range, annotation) {
        var edit;
        var id;
        if (annotation === void 0) {
          edit = TextEdit.del(range);
        } else if (ChangeAnnotationIdentifier.is(annotation)) {
          id = annotation;
          edit = AnnotatedTextEdit.del(range, annotation);
        } else {
          this.assertChangeAnnotations(this.changeAnnotations);
          id = this.changeAnnotations.manage(annotation);
          edit = AnnotatedTextEdit.del(range, id);
        }
        this.edits.push(edit);
        if (id !== void 0) {
          return id;
        }
      };
      TextEditChangeImpl2.prototype.add = function(edit) {
        this.edits.push(edit);
      };
      TextEditChangeImpl2.prototype.all = function() {
        return this.edits;
      };
      TextEditChangeImpl2.prototype.clear = function() {
        this.edits.splice(0, this.edits.length);
      };
      TextEditChangeImpl2.prototype.assertChangeAnnotations = function(value) {
        if (value === void 0) {
          throw new Error("Text edit change is not configured to manage change annotations.");
        }
      };
      return TextEditChangeImpl2;
    }();
    var ChangeAnnotations = function() {
      function ChangeAnnotations2(annotations) {
        this._annotations = annotations === void 0 ? Object.create(null) : annotations;
        this._counter = 0;
        this._size = 0;
      }
      ChangeAnnotations2.prototype.all = function() {
        return this._annotations;
      };
      Object.defineProperty(ChangeAnnotations2.prototype, "size", {
        get: function() {
          return this._size;
        },
        enumerable: false,
        configurable: true
      });
      ChangeAnnotations2.prototype.manage = function(idOrAnnotation, annotation) {
        var id;
        if (ChangeAnnotationIdentifier.is(idOrAnnotation)) {
          id = idOrAnnotation;
        } else {
          id = this.nextId();
          annotation = idOrAnnotation;
        }
        if (this._annotations[id] !== void 0) {
          throw new Error("Id " + id + " is already in use.");
        }
        if (annotation === void 0) {
          throw new Error("No annotation provided for id " + id);
        }
        this._annotations[id] = annotation;
        this._size++;
        return id;
      };
      ChangeAnnotations2.prototype.nextId = function() {
        this._counter++;
        return this._counter.toString();
      };
      return ChangeAnnotations2;
    }();
    (function() {
      function WorkspaceChange2(workspaceEdit) {
        var _this = this;
        this._textEditChanges = Object.create(null);
        if (workspaceEdit !== void 0) {
          this._workspaceEdit = workspaceEdit;
          if (workspaceEdit.documentChanges) {
            this._changeAnnotations = new ChangeAnnotations(workspaceEdit.changeAnnotations);
            workspaceEdit.changeAnnotations = this._changeAnnotations.all();
            workspaceEdit.documentChanges.forEach(function(change) {
              if (TextDocumentEdit.is(change)) {
                var textEditChange = new TextEditChangeImpl(change.edits, _this._changeAnnotations);
                _this._textEditChanges[change.textDocument.uri] = textEditChange;
              }
            });
          } else if (workspaceEdit.changes) {
            Object.keys(workspaceEdit.changes).forEach(function(key) {
              var textEditChange = new TextEditChangeImpl(workspaceEdit.changes[key]);
              _this._textEditChanges[key] = textEditChange;
            });
          }
        } else {
          this._workspaceEdit = {};
        }
      }
      Object.defineProperty(WorkspaceChange2.prototype, "edit", {
        get: function() {
          this.initDocumentChanges();
          if (this._changeAnnotations !== void 0) {
            if (this._changeAnnotations.size === 0) {
              this._workspaceEdit.changeAnnotations = void 0;
            } else {
              this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
            }
          }
          return this._workspaceEdit;
        },
        enumerable: false,
        configurable: true
      });
      WorkspaceChange2.prototype.getTextEditChange = function(key) {
        if (OptionalVersionedTextDocumentIdentifier.is(key)) {
          this.initDocumentChanges();
          if (this._workspaceEdit.documentChanges === void 0) {
            throw new Error("Workspace edit is not configured for document changes.");
          }
          var textDocument = { uri: key.uri, version: key.version };
          var result = this._textEditChanges[textDocument.uri];
          if (!result) {
            var edits = [];
            var textDocumentEdit = {
              textDocument,
              edits
            };
            this._workspaceEdit.documentChanges.push(textDocumentEdit);
            result = new TextEditChangeImpl(edits, this._changeAnnotations);
            this._textEditChanges[textDocument.uri] = result;
          }
          return result;
        } else {
          this.initChanges();
          if (this._workspaceEdit.changes === void 0) {
            throw new Error("Workspace edit is not configured for normal text edit changes.");
          }
          var result = this._textEditChanges[key];
          if (!result) {
            var edits = [];
            this._workspaceEdit.changes[key] = edits;
            result = new TextEditChangeImpl(edits);
            this._textEditChanges[key] = result;
          }
          return result;
        }
      };
      WorkspaceChange2.prototype.initDocumentChanges = function() {
        if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
          this._changeAnnotations = new ChangeAnnotations();
          this._workspaceEdit.documentChanges = [];
          this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
        }
      };
      WorkspaceChange2.prototype.initChanges = function() {
        if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
          this._workspaceEdit.changes = Object.create(null);
        }
      };
      WorkspaceChange2.prototype.createFile = function(uri, optionsOrAnnotation, options) {
        this.initDocumentChanges();
        if (this._workspaceEdit.documentChanges === void 0) {
          throw new Error("Workspace edit is not configured for document changes.");
        }
        var annotation;
        if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
          annotation = optionsOrAnnotation;
        } else {
          options = optionsOrAnnotation;
        }
        var operation;
        var id;
        if (annotation === void 0) {
          operation = CreateFile.create(uri, options);
        } else {
          id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
          operation = CreateFile.create(uri, options, id);
        }
        this._workspaceEdit.documentChanges.push(operation);
        if (id !== void 0) {
          return id;
        }
      };
      WorkspaceChange2.prototype.renameFile = function(oldUri, newUri, optionsOrAnnotation, options) {
        this.initDocumentChanges();
        if (this._workspaceEdit.documentChanges === void 0) {
          throw new Error("Workspace edit is not configured for document changes.");
        }
        var annotation;
        if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
          annotation = optionsOrAnnotation;
        } else {
          options = optionsOrAnnotation;
        }
        var operation;
        var id;
        if (annotation === void 0) {
          operation = RenameFile.create(oldUri, newUri, options);
        } else {
          id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
          operation = RenameFile.create(oldUri, newUri, options, id);
        }
        this._workspaceEdit.documentChanges.push(operation);
        if (id !== void 0) {
          return id;
        }
      };
      WorkspaceChange2.prototype.deleteFile = function(uri, optionsOrAnnotation, options) {
        this.initDocumentChanges();
        if (this._workspaceEdit.documentChanges === void 0) {
          throw new Error("Workspace edit is not configured for document changes.");
        }
        var annotation;
        if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
          annotation = optionsOrAnnotation;
        } else {
          options = optionsOrAnnotation;
        }
        var operation;
        var id;
        if (annotation === void 0) {
          operation = DeleteFile.create(uri, options);
        } else {
          id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
          operation = DeleteFile.create(uri, options, id);
        }
        this._workspaceEdit.documentChanges.push(operation);
        if (id !== void 0) {
          return id;
        }
      };
      return WorkspaceChange2;
    })();
    var TextDocumentIdentifier;
    (function(TextDocumentIdentifier2) {
      function create(uri) {
        return { uri };
      }
      TextDocumentIdentifier2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri);
      }
      TextDocumentIdentifier2.is = is;
    })(TextDocumentIdentifier || (TextDocumentIdentifier = {}));
    var VersionedTextDocumentIdentifier;
    (function(VersionedTextDocumentIdentifier2) {
      function create(uri, version) {
        return { uri, version };
      }
      VersionedTextDocumentIdentifier2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && Is.integer(candidate.version);
      }
      VersionedTextDocumentIdentifier2.is = is;
    })(VersionedTextDocumentIdentifier || (VersionedTextDocumentIdentifier = {}));
    var OptionalVersionedTextDocumentIdentifier;
    (function(OptionalVersionedTextDocumentIdentifier2) {
      function create(uri, version) {
        return { uri, version };
      }
      OptionalVersionedTextDocumentIdentifier2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && (candidate.version === null || Is.integer(candidate.version));
      }
      OptionalVersionedTextDocumentIdentifier2.is = is;
    })(OptionalVersionedTextDocumentIdentifier || (OptionalVersionedTextDocumentIdentifier = {}));
    var TextDocumentItem;
    (function(TextDocumentItem2) {
      function create(uri, languageId, version, text) {
        return { uri, languageId, version, text };
      }
      TextDocumentItem2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && Is.string(candidate.languageId) && Is.integer(candidate.version) && Is.string(candidate.text);
      }
      TextDocumentItem2.is = is;
    })(TextDocumentItem || (TextDocumentItem = {}));
    var MarkupKind;
    (function(MarkupKind2) {
      MarkupKind2.PlainText = "plaintext";
      MarkupKind2.Markdown = "markdown";
    })(MarkupKind || (MarkupKind = {}));
    (function(MarkupKind2) {
      function is(value) {
        var candidate = value;
        return candidate === MarkupKind2.PlainText || candidate === MarkupKind2.Markdown;
      }
      MarkupKind2.is = is;
    })(MarkupKind || (MarkupKind = {}));
    var MarkupContent;
    (function(MarkupContent2) {
      function is(value) {
        var candidate = value;
        return Is.objectLiteral(value) && MarkupKind.is(candidate.kind) && Is.string(candidate.value);
      }
      MarkupContent2.is = is;
    })(MarkupContent || (MarkupContent = {}));
    var CompletionItemKind;
    (function(CompletionItemKind2) {
      CompletionItemKind2.Text = 1;
      CompletionItemKind2.Method = 2;
      CompletionItemKind2.Function = 3;
      CompletionItemKind2.Constructor = 4;
      CompletionItemKind2.Field = 5;
      CompletionItemKind2.Variable = 6;
      CompletionItemKind2.Class = 7;
      CompletionItemKind2.Interface = 8;
      CompletionItemKind2.Module = 9;
      CompletionItemKind2.Property = 10;
      CompletionItemKind2.Unit = 11;
      CompletionItemKind2.Value = 12;
      CompletionItemKind2.Enum = 13;
      CompletionItemKind2.Keyword = 14;
      CompletionItemKind2.Snippet = 15;
      CompletionItemKind2.Color = 16;
      CompletionItemKind2.File = 17;
      CompletionItemKind2.Reference = 18;
      CompletionItemKind2.Folder = 19;
      CompletionItemKind2.EnumMember = 20;
      CompletionItemKind2.Constant = 21;
      CompletionItemKind2.Struct = 22;
      CompletionItemKind2.Event = 23;
      CompletionItemKind2.Operator = 24;
      CompletionItemKind2.TypeParameter = 25;
    })(CompletionItemKind || (CompletionItemKind = {}));
    var InsertTextFormat;
    (function(InsertTextFormat2) {
      InsertTextFormat2.PlainText = 1;
      InsertTextFormat2.Snippet = 2;
    })(InsertTextFormat || (InsertTextFormat = {}));
    var CompletionItemTag;
    (function(CompletionItemTag2) {
      CompletionItemTag2.Deprecated = 1;
    })(CompletionItemTag || (CompletionItemTag = {}));
    var InsertReplaceEdit;
    (function(InsertReplaceEdit2) {
      function create(newText, insert, replace) {
        return { newText, insert, replace };
      }
      InsertReplaceEdit2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && Is.string(candidate.newText) && Range.is(candidate.insert) && Range.is(candidate.replace);
      }
      InsertReplaceEdit2.is = is;
    })(InsertReplaceEdit || (InsertReplaceEdit = {}));
    var InsertTextMode;
    (function(InsertTextMode2) {
      InsertTextMode2.asIs = 1;
      InsertTextMode2.adjustIndentation = 2;
    })(InsertTextMode || (InsertTextMode = {}));
    var CompletionItem;
    (function(CompletionItem2) {
      function create(label) {
        return { label };
      }
      CompletionItem2.create = create;
    })(CompletionItem || (CompletionItem = {}));
    var CompletionList;
    (function(CompletionList2) {
      function create(items, isIncomplete) {
        return { items: items ? items : [], isIncomplete: !!isIncomplete };
      }
      CompletionList2.create = create;
    })(CompletionList || (CompletionList = {}));
    var MarkedString;
    (function(MarkedString2) {
      function fromPlainText(plainText) {
        return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
      }
      MarkedString2.fromPlainText = fromPlainText;
      function is(value) {
        var candidate = value;
        return Is.string(candidate) || Is.objectLiteral(candidate) && Is.string(candidate.language) && Is.string(candidate.value);
      }
      MarkedString2.is = is;
    })(MarkedString || (MarkedString = {}));
    var Hover;
    (function(Hover2) {
      function is(value) {
        var candidate = value;
        return !!candidate && Is.objectLiteral(candidate) && (MarkupContent.is(candidate.contents) || MarkedString.is(candidate.contents) || Is.typedArray(candidate.contents, MarkedString.is)) && (value.range === void 0 || Range.is(value.range));
      }
      Hover2.is = is;
    })(Hover || (Hover = {}));
    var ParameterInformation;
    (function(ParameterInformation2) {
      function create(label, documentation) {
        return documentation ? { label, documentation } : { label };
      }
      ParameterInformation2.create = create;
    })(ParameterInformation || (ParameterInformation = {}));
    var SignatureInformation;
    (function(SignatureInformation2) {
      function create(label, documentation) {
        var parameters = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          parameters[_i - 2] = arguments[_i];
        }
        var result = { label };
        if (Is.defined(documentation)) {
          result.documentation = documentation;
        }
        if (Is.defined(parameters)) {
          result.parameters = parameters;
        } else {
          result.parameters = [];
        }
        return result;
      }
      SignatureInformation2.create = create;
    })(SignatureInformation || (SignatureInformation = {}));
    var DocumentHighlightKind;
    (function(DocumentHighlightKind2) {
      DocumentHighlightKind2.Text = 1;
      DocumentHighlightKind2.Read = 2;
      DocumentHighlightKind2.Write = 3;
    })(DocumentHighlightKind || (DocumentHighlightKind = {}));
    var DocumentHighlight;
    (function(DocumentHighlight2) {
      function create(range, kind) {
        var result = { range };
        if (Is.number(kind)) {
          result.kind = kind;
        }
        return result;
      }
      DocumentHighlight2.create = create;
    })(DocumentHighlight || (DocumentHighlight = {}));
    var SymbolKind;
    (function(SymbolKind2) {
      SymbolKind2.File = 1;
      SymbolKind2.Module = 2;
      SymbolKind2.Namespace = 3;
      SymbolKind2.Package = 4;
      SymbolKind2.Class = 5;
      SymbolKind2.Method = 6;
      SymbolKind2.Property = 7;
      SymbolKind2.Field = 8;
      SymbolKind2.Constructor = 9;
      SymbolKind2.Enum = 10;
      SymbolKind2.Interface = 11;
      SymbolKind2.Function = 12;
      SymbolKind2.Variable = 13;
      SymbolKind2.Constant = 14;
      SymbolKind2.String = 15;
      SymbolKind2.Number = 16;
      SymbolKind2.Boolean = 17;
      SymbolKind2.Array = 18;
      SymbolKind2.Object = 19;
      SymbolKind2.Key = 20;
      SymbolKind2.Null = 21;
      SymbolKind2.EnumMember = 22;
      SymbolKind2.Struct = 23;
      SymbolKind2.Event = 24;
      SymbolKind2.Operator = 25;
      SymbolKind2.TypeParameter = 26;
    })(SymbolKind || (SymbolKind = {}));
    var SymbolTag;
    (function(SymbolTag2) {
      SymbolTag2.Deprecated = 1;
    })(SymbolTag || (SymbolTag = {}));
    var SymbolInformation;
    (function(SymbolInformation2) {
      function create(name, kind, range, uri, containerName) {
        var result = {
          name,
          kind,
          location: { uri, range }
        };
        if (containerName) {
          result.containerName = containerName;
        }
        return result;
      }
      SymbolInformation2.create = create;
    })(SymbolInformation || (SymbolInformation = {}));
    var DocumentSymbol;
    (function(DocumentSymbol2) {
      function create(name, detail, kind, range, selectionRange, children) {
        var result = {
          name,
          detail,
          kind,
          range,
          selectionRange
        };
        if (children !== void 0) {
          result.children = children;
        }
        return result;
      }
      DocumentSymbol2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && Is.string(candidate.name) && Is.number(candidate.kind) && Range.is(candidate.range) && Range.is(candidate.selectionRange) && (candidate.detail === void 0 || Is.string(candidate.detail)) && (candidate.deprecated === void 0 || Is.boolean(candidate.deprecated)) && (candidate.children === void 0 || Array.isArray(candidate.children)) && (candidate.tags === void 0 || Array.isArray(candidate.tags));
      }
      DocumentSymbol2.is = is;
    })(DocumentSymbol || (DocumentSymbol = {}));
    var CodeActionKind;
    (function(CodeActionKind2) {
      CodeActionKind2.Empty = "";
      CodeActionKind2.QuickFix = "quickfix";
      CodeActionKind2.Refactor = "refactor";
      CodeActionKind2.RefactorExtract = "refactor.extract";
      CodeActionKind2.RefactorInline = "refactor.inline";
      CodeActionKind2.RefactorRewrite = "refactor.rewrite";
      CodeActionKind2.Source = "source";
      CodeActionKind2.SourceOrganizeImports = "source.organizeImports";
      CodeActionKind2.SourceFixAll = "source.fixAll";
    })(CodeActionKind || (CodeActionKind = {}));
    var CodeActionContext;
    (function(CodeActionContext2) {
      function create(diagnostics, only) {
        var result = { diagnostics };
        if (only !== void 0 && only !== null) {
          result.only = only;
        }
        return result;
      }
      CodeActionContext2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.typedArray(candidate.diagnostics, Diagnostic.is) && (candidate.only === void 0 || Is.typedArray(candidate.only, Is.string));
      }
      CodeActionContext2.is = is;
    })(CodeActionContext || (CodeActionContext = {}));
    var CodeAction;
    (function(CodeAction2) {
      function create(title, kindOrCommandOrEdit, kind) {
        var result = { title };
        var checkKind = true;
        if (typeof kindOrCommandOrEdit === "string") {
          checkKind = false;
          result.kind = kindOrCommandOrEdit;
        } else if (Command.is(kindOrCommandOrEdit)) {
          result.command = kindOrCommandOrEdit;
        } else {
          result.edit = kindOrCommandOrEdit;
        }
        if (checkKind && kind !== void 0) {
          result.kind = kind;
        }
        return result;
      }
      CodeAction2.create = create;
      function is(value) {
        var candidate = value;
        return candidate && Is.string(candidate.title) && (candidate.diagnostics === void 0 || Is.typedArray(candidate.diagnostics, Diagnostic.is)) && (candidate.kind === void 0 || Is.string(candidate.kind)) && (candidate.edit !== void 0 || candidate.command !== void 0) && (candidate.command === void 0 || Command.is(candidate.command)) && (candidate.isPreferred === void 0 || Is.boolean(candidate.isPreferred)) && (candidate.edit === void 0 || WorkspaceEdit.is(candidate.edit));
      }
      CodeAction2.is = is;
    })(CodeAction || (CodeAction = {}));
    var CodeLens;
    (function(CodeLens2) {
      function create(range, data) {
        var result = { range };
        if (Is.defined(data)) {
          result.data = data;
        }
        return result;
      }
      CodeLens2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.command) || Command.is(candidate.command));
      }
      CodeLens2.is = is;
    })(CodeLens || (CodeLens = {}));
    var FormattingOptions;
    (function(FormattingOptions2) {
      function create(tabSize, insertSpaces) {
        return { tabSize, insertSpaces };
      }
      FormattingOptions2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.uinteger(candidate.tabSize) && Is.boolean(candidate.insertSpaces);
      }
      FormattingOptions2.is = is;
    })(FormattingOptions || (FormattingOptions = {}));
    var DocumentLink;
    (function(DocumentLink2) {
      function create(range, target, data) {
        return { range, target, data };
      }
      DocumentLink2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.target) || Is.string(candidate.target));
      }
      DocumentLink2.is = is;
    })(DocumentLink || (DocumentLink = {}));
    var SelectionRange;
    (function(SelectionRange2) {
      function create(range, parent) {
        return { range, parent };
      }
      SelectionRange2.create = create;
      function is(value) {
        var candidate = value;
        return candidate !== void 0 && Range.is(candidate.range) && (candidate.parent === void 0 || SelectionRange2.is(candidate.parent));
      }
      SelectionRange2.is = is;
    })(SelectionRange || (SelectionRange = {}));
    var TextDocument$1;
    (function(TextDocument2) {
      function create(uri, languageId, version, content) {
        return new FullTextDocument$1(uri, languageId, version, content);
      }
      TextDocument2.create = create;
      function is(value) {
        var candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && (Is.undefined(candidate.languageId) || Is.string(candidate.languageId)) && Is.uinteger(candidate.lineCount) && Is.func(candidate.getText) && Is.func(candidate.positionAt) && Is.func(candidate.offsetAt) ? true : false;
      }
      TextDocument2.is = is;
      function applyEdits(document, edits) {
        var text = document.getText();
        var sortedEdits = mergeSort(edits, function(a, b) {
          var diff = a.range.start.line - b.range.start.line;
          if (diff === 0) {
            return a.range.start.character - b.range.start.character;
          }
          return diff;
        });
        var lastModifiedOffset = text.length;
        for (var i = sortedEdits.length - 1; i >= 0; i--) {
          var e = sortedEdits[i];
          var startOffset = document.offsetAt(e.range.start);
          var endOffset = document.offsetAt(e.range.end);
          if (endOffset <= lastModifiedOffset) {
            text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
          } else {
            throw new Error("Overlapping edit");
          }
          lastModifiedOffset = startOffset;
        }
        return text;
      }
      TextDocument2.applyEdits = applyEdits;
      function mergeSort(data, compare) {
        if (data.length <= 1) {
          return data;
        }
        var p = data.length / 2 | 0;
        var left = data.slice(0, p);
        var right = data.slice(p);
        mergeSort(left, compare);
        mergeSort(right, compare);
        var leftIdx = 0;
        var rightIdx = 0;
        var i = 0;
        while (leftIdx < left.length && rightIdx < right.length) {
          var ret = compare(left[leftIdx], right[rightIdx]);
          if (ret <= 0) {
            data[i++] = left[leftIdx++];
          } else {
            data[i++] = right[rightIdx++];
          }
        }
        while (leftIdx < left.length) {
          data[i++] = left[leftIdx++];
        }
        while (rightIdx < right.length) {
          data[i++] = right[rightIdx++];
        }
        return data;
      }
    })(TextDocument$1 || (TextDocument$1 = {}));
    var FullTextDocument$1 = function() {
      function FullTextDocument2(uri, languageId, version, content) {
        this._uri = uri;
        this._languageId = languageId;
        this._version = version;
        this._content = content;
        this._lineOffsets = void 0;
      }
      Object.defineProperty(FullTextDocument2.prototype, "uri", {
        get: function() {
          return this._uri;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(FullTextDocument2.prototype, "languageId", {
        get: function() {
          return this._languageId;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(FullTextDocument2.prototype, "version", {
        get: function() {
          return this._version;
        },
        enumerable: false,
        configurable: true
      });
      FullTextDocument2.prototype.getText = function(range) {
        if (range) {
          var start = this.offsetAt(range.start);
          var end = this.offsetAt(range.end);
          return this._content.substring(start, end);
        }
        return this._content;
      };
      FullTextDocument2.prototype.update = function(event, version) {
        this._content = event.text;
        this._version = version;
        this._lineOffsets = void 0;
      };
      FullTextDocument2.prototype.getLineOffsets = function() {
        if (this._lineOffsets === void 0) {
          var lineOffsets = [];
          var text = this._content;
          var isLineStart = true;
          for (var i = 0; i < text.length; i++) {
            if (isLineStart) {
              lineOffsets.push(i);
              isLineStart = false;
            }
            var ch = text.charAt(i);
            isLineStart = ch === "\r" || ch === "\n";
            if (ch === "\r" && i + 1 < text.length && text.charAt(i + 1) === "\n") {
              i++;
            }
          }
          if (isLineStart && text.length > 0) {
            lineOffsets.push(text.length);
          }
          this._lineOffsets = lineOffsets;
        }
        return this._lineOffsets;
      };
      FullTextDocument2.prototype.positionAt = function(offset) {
        offset = Math.max(Math.min(offset, this._content.length), 0);
        var lineOffsets = this.getLineOffsets();
        var low = 0, high = lineOffsets.length;
        if (high === 0) {
          return Position.create(0, offset);
        }
        while (low < high) {
          var mid = Math.floor((low + high) / 2);
          if (lineOffsets[mid] > offset) {
            high = mid;
          } else {
            low = mid + 1;
          }
        }
        var line = low - 1;
        return Position.create(line, offset - lineOffsets[line]);
      };
      FullTextDocument2.prototype.offsetAt = function(position) {
        var lineOffsets = this.getLineOffsets();
        if (position.line >= lineOffsets.length) {
          return this._content.length;
        } else if (position.line < 0) {
          return 0;
        }
        var lineOffset = lineOffsets[position.line];
        var nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
        return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
      };
      Object.defineProperty(FullTextDocument2.prototype, "lineCount", {
        get: function() {
          return this.getLineOffsets().length;
        },
        enumerable: false,
        configurable: true
      });
      return FullTextDocument2;
    }();
    var Is;
    (function(Is2) {
      var toString = Object.prototype.toString;
      function defined(value) {
        return typeof value !== "undefined";
      }
      Is2.defined = defined;
      function undefined2(value) {
        return typeof value === "undefined";
      }
      Is2.undefined = undefined2;
      function boolean(value) {
        return value === true || value === false;
      }
      Is2.boolean = boolean;
      function string(value) {
        return toString.call(value) === "[object String]";
      }
      Is2.string = string;
      function number(value) {
        return toString.call(value) === "[object Number]";
      }
      Is2.number = number;
      function numberRange(value, min, max) {
        return toString.call(value) === "[object Number]" && min <= value && value <= max;
      }
      Is2.numberRange = numberRange;
      function integer2(value) {
        return toString.call(value) === "[object Number]" && -2147483648 <= value && value <= 2147483647;
      }
      Is2.integer = integer2;
      function uinteger2(value) {
        return toString.call(value) === "[object Number]" && 0 <= value && value <= 2147483647;
      }
      Is2.uinteger = uinteger2;
      function func(value) {
        return toString.call(value) === "[object Function]";
      }
      Is2.func = func;
      function objectLiteral(value) {
        return value !== null && typeof value === "object";
      }
      Is2.objectLiteral = objectLiteral;
      function typedArray(value, check) {
        return Array.isArray(value) && value.every(check);
      }
      Is2.typedArray = typedArray;
    })(Is || (Is = {}));

    var FullTextDocument = function() {
      function FullTextDocument2(uri, languageId, version, content) {
        this._uri = uri;
        this._languageId = languageId;
        this._version = version;
        this._content = content;
        this._lineOffsets = void 0;
      }
      Object.defineProperty(FullTextDocument2.prototype, "uri", {
        get: function() {
          return this._uri;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(FullTextDocument2.prototype, "languageId", {
        get: function() {
          return this._languageId;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(FullTextDocument2.prototype, "version", {
        get: function() {
          return this._version;
        },
        enumerable: true,
        configurable: true
      });
      FullTextDocument2.prototype.getText = function(range) {
        if (range) {
          var start = this.offsetAt(range.start);
          var end = this.offsetAt(range.end);
          return this._content.substring(start, end);
        }
        return this._content;
      };
      FullTextDocument2.prototype.update = function(changes, version) {
        for (var _i = 0, changes_1 = changes; _i < changes_1.length; _i++) {
          var change = changes_1[_i];
          if (FullTextDocument2.isIncremental(change)) {
            var range = getWellformedRange(change.range);
            var startOffset = this.offsetAt(range.start);
            var endOffset = this.offsetAt(range.end);
            this._content = this._content.substring(0, startOffset) + change.text + this._content.substring(endOffset, this._content.length);
            var startLine = Math.max(range.start.line, 0);
            var endLine = Math.max(range.end.line, 0);
            var lineOffsets = this._lineOffsets;
            var addedLineOffsets = computeLineOffsets(change.text, false, startOffset);
            if (endLine - startLine === addedLineOffsets.length) {
              for (var i = 0, len = addedLineOffsets.length; i < len; i++) {
                lineOffsets[i + startLine + 1] = addedLineOffsets[i];
              }
            } else {
              if (addedLineOffsets.length < 1e4) {
                lineOffsets.splice.apply(lineOffsets, [startLine + 1, endLine - startLine].concat(addedLineOffsets));
              } else {
                this._lineOffsets = lineOffsets = lineOffsets.slice(0, startLine + 1).concat(addedLineOffsets, lineOffsets.slice(endLine + 1));
              }
            }
            var diff = change.text.length - (endOffset - startOffset);
            if (diff !== 0) {
              for (var i = startLine + 1 + addedLineOffsets.length, len = lineOffsets.length; i < len; i++) {
                lineOffsets[i] = lineOffsets[i] + diff;
              }
            }
          } else if (FullTextDocument2.isFull(change)) {
            this._content = change.text;
            this._lineOffsets = void 0;
          } else {
            throw new Error("Unknown change event received");
          }
        }
        this._version = version;
      };
      FullTextDocument2.prototype.getLineOffsets = function() {
        if (this._lineOffsets === void 0) {
          this._lineOffsets = computeLineOffsets(this._content, true);
        }
        return this._lineOffsets;
      };
      FullTextDocument2.prototype.positionAt = function(offset) {
        offset = Math.max(Math.min(offset, this._content.length), 0);
        var lineOffsets = this.getLineOffsets();
        var low = 0, high = lineOffsets.length;
        if (high === 0) {
          return { line: 0, character: offset };
        }
        while (low < high) {
          var mid = Math.floor((low + high) / 2);
          if (lineOffsets[mid] > offset) {
            high = mid;
          } else {
            low = mid + 1;
          }
        }
        var line = low - 1;
        return { line, character: offset - lineOffsets[line] };
      };
      FullTextDocument2.prototype.offsetAt = function(position) {
        var lineOffsets = this.getLineOffsets();
        if (position.line >= lineOffsets.length) {
          return this._content.length;
        } else if (position.line < 0) {
          return 0;
        }
        var lineOffset = lineOffsets[position.line];
        var nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
        return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
      };
      Object.defineProperty(FullTextDocument2.prototype, "lineCount", {
        get: function() {
          return this.getLineOffsets().length;
        },
        enumerable: true,
        configurable: true
      });
      FullTextDocument2.isIncremental = function(event) {
        var candidate = event;
        return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range !== void 0 && (candidate.rangeLength === void 0 || typeof candidate.rangeLength === "number");
      };
      FullTextDocument2.isFull = function(event) {
        var candidate = event;
        return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range === void 0 && candidate.rangeLength === void 0;
      };
      return FullTextDocument2;
    }();
    var TextDocument;
    (function(TextDocument2) {
      function create(uri, languageId, version, content) {
        return new FullTextDocument(uri, languageId, version, content);
      }
      TextDocument2.create = create;
      function update(document, changes, version) {
        if (document instanceof FullTextDocument) {
          document.update(changes, version);
          return document;
        } else {
          throw new Error("TextDocument.update: document must be created by TextDocument.create");
        }
      }
      TextDocument2.update = update;
      function applyEdits(document, edits) {
        var text = document.getText();
        var sortedEdits = mergeSort(edits.map(getWellformedEdit), function(a, b) {
          var diff = a.range.start.line - b.range.start.line;
          if (diff === 0) {
            return a.range.start.character - b.range.start.character;
          }
          return diff;
        });
        var lastModifiedOffset = 0;
        var spans = [];
        for (var _i = 0, sortedEdits_1 = sortedEdits; _i < sortedEdits_1.length; _i++) {
          var e = sortedEdits_1[_i];
          var startOffset = document.offsetAt(e.range.start);
          if (startOffset < lastModifiedOffset) {
            throw new Error("Overlapping edit");
          } else if (startOffset > lastModifiedOffset) {
            spans.push(text.substring(lastModifiedOffset, startOffset));
          }
          if (e.newText.length) {
            spans.push(e.newText);
          }
          lastModifiedOffset = document.offsetAt(e.range.end);
        }
        spans.push(text.substr(lastModifiedOffset));
        return spans.join("");
      }
      TextDocument2.applyEdits = applyEdits;
    })(TextDocument || (TextDocument = {}));
    function mergeSort(data, compare) {
      if (data.length <= 1) {
        return data;
      }
      var p = data.length / 2 | 0;
      var left = data.slice(0, p);
      var right = data.slice(p);
      mergeSort(left, compare);
      mergeSort(right, compare);
      var leftIdx = 0;
      var rightIdx = 0;
      var i = 0;
      while (leftIdx < left.length && rightIdx < right.length) {
        var ret = compare(left[leftIdx], right[rightIdx]);
        if (ret <= 0) {
          data[i++] = left[leftIdx++];
        } else {
          data[i++] = right[rightIdx++];
        }
      }
      while (leftIdx < left.length) {
        data[i++] = left[leftIdx++];
      }
      while (rightIdx < right.length) {
        data[i++] = right[rightIdx++];
      }
      return data;
    }
    function computeLineOffsets(text, isAtLineStart, textOffset) {
      if (textOffset === void 0) {
        textOffset = 0;
      }
      var result = isAtLineStart ? [textOffset] : [];
      for (var i = 0; i < text.length; i++) {
        var ch = text.charCodeAt(i);
        if (ch === 13 || ch === 10) {
          if (ch === 13 && i + 1 < text.length && text.charCodeAt(i + 1) === 10) {
            i++;
          }
          result.push(textOffset + i + 1);
        }
      }
      return result;
    }
    function getWellformedRange(range) {
      var start = range.start;
      var end = range.end;
      if (start.line > end.line || start.line === end.line && start.character > end.character) {
        return { start: end, end: start };
      }
      return range;
    }
    function getWellformedEdit(textEdit) {
      var range = getWellformedRange(textEdit.range);
      if (range !== textEdit.range) {
        return { newText: textEdit.newText, range };
      }
      return textEdit;
    }

    var ErrorCode;
    (function(ErrorCode2) {
      ErrorCode2[ErrorCode2["Undefined"] = 0] = "Undefined";
      ErrorCode2[ErrorCode2["EnumValueMismatch"] = 1] = "EnumValueMismatch";
      ErrorCode2[ErrorCode2["Deprecated"] = 2] = "Deprecated";
      ErrorCode2[ErrorCode2["UnexpectedEndOfComment"] = 257] = "UnexpectedEndOfComment";
      ErrorCode2[ErrorCode2["UnexpectedEndOfString"] = 258] = "UnexpectedEndOfString";
      ErrorCode2[ErrorCode2["UnexpectedEndOfNumber"] = 259] = "UnexpectedEndOfNumber";
      ErrorCode2[ErrorCode2["InvalidUnicode"] = 260] = "InvalidUnicode";
      ErrorCode2[ErrorCode2["InvalidEscapeCharacter"] = 261] = "InvalidEscapeCharacter";
      ErrorCode2[ErrorCode2["InvalidCharacter"] = 262] = "InvalidCharacter";
      ErrorCode2[ErrorCode2["PropertyExpected"] = 513] = "PropertyExpected";
      ErrorCode2[ErrorCode2["CommaExpected"] = 514] = "CommaExpected";
      ErrorCode2[ErrorCode2["ColonExpected"] = 515] = "ColonExpected";
      ErrorCode2[ErrorCode2["ValueExpected"] = 516] = "ValueExpected";
      ErrorCode2[ErrorCode2["CommaOrCloseBacketExpected"] = 517] = "CommaOrCloseBacketExpected";
      ErrorCode2[ErrorCode2["CommaOrCloseBraceExpected"] = 518] = "CommaOrCloseBraceExpected";
      ErrorCode2[ErrorCode2["TrailingComma"] = 519] = "TrailingComma";
      ErrorCode2[ErrorCode2["DuplicateKey"] = 520] = "DuplicateKey";
      ErrorCode2[ErrorCode2["CommentNotPermitted"] = 521] = "CommentNotPermitted";
      ErrorCode2[ErrorCode2["SchemaResolveError"] = 768] = "SchemaResolveError";
    })(ErrorCode || (ErrorCode = {}));
    var ClientCapabilities;
    (function(ClientCapabilities2) {
      ClientCapabilities2.LATEST = {
        textDocument: {
          completion: {
            completionItem: {
              documentationFormat: [MarkupKind.Markdown, MarkupKind.PlainText],
              commitCharactersSupport: true
            }
          }
        }
      };
    })(ClientCapabilities || (ClientCapabilities = {}));

    function format(message, args) {
      var result;
      if (args.length === 0) {
        result = message;
      } else {
        result = message.replace(/\{(\d+)\}/g, function(match, rest) {
          var index = rest[0];
          return typeof args[index] !== "undefined" ? args[index] : match;
        });
      }
      return result;
    }
    function localize$5(key, message) {
      var args = [];
      for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
      }
      return format(message, args);
    }
    function loadMessageBundle(file) {
      return localize$5;
    }

    var __extends = undefined && undefined.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2)
            if (Object.prototype.hasOwnProperty.call(b2, p))
              d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var localize$4 = loadMessageBundle();
    var formats = {
      "color-hex": { errorMessage: localize$4("colorHexFormatWarning", "Invalid color format. Use #RGB, #RGBA, #RRGGBB or #RRGGBBAA."), pattern: /^#([0-9A-Fa-f]{3,4}|([0-9A-Fa-f]{2}){3,4})$/ },
      "date-time": { errorMessage: localize$4("dateTimeFormatWarning", "String is not a RFC3339 date-time."), pattern: /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))$/i },
      "date": { errorMessage: localize$4("dateFormatWarning", "String is not a RFC3339 date."), pattern: /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/i },
      "time": { errorMessage: localize$4("timeFormatWarning", "String is not a RFC3339 time."), pattern: /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))$/i },
      "email": { errorMessage: localize$4("emailFormatWarning", "String is not an e-mail address."), pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ }
    };
    var ASTNodeImpl = function() {
      function ASTNodeImpl2(parent, offset, length) {
        if (length === void 0) {
          length = 0;
        }
        this.offset = offset;
        this.length = length;
        this.parent = parent;
      }
      Object.defineProperty(ASTNodeImpl2.prototype, "children", {
        get: function() {
          return [];
        },
        enumerable: false,
        configurable: true
      });
      ASTNodeImpl2.prototype.toString = function() {
        return "type: " + this.type + " (" + this.offset + "/" + this.length + ")" + (this.parent ? " parent: {" + this.parent.toString() + "}" : "");
      };
      return ASTNodeImpl2;
    }();
    var NullASTNodeImpl = function(_super) {
      __extends(NullASTNodeImpl2, _super);
      function NullASTNodeImpl2(parent, offset) {
        var _this = _super.call(this, parent, offset) || this;
        _this.type = "null";
        _this.value = null;
        return _this;
      }
      return NullASTNodeImpl2;
    }(ASTNodeImpl);
    var BooleanASTNodeImpl = function(_super) {
      __extends(BooleanASTNodeImpl2, _super);
      function BooleanASTNodeImpl2(parent, boolValue, offset) {
        var _this = _super.call(this, parent, offset) || this;
        _this.type = "boolean";
        _this.value = boolValue;
        return _this;
      }
      return BooleanASTNodeImpl2;
    }(ASTNodeImpl);
    var ArrayASTNodeImpl = function(_super) {
      __extends(ArrayASTNodeImpl2, _super);
      function ArrayASTNodeImpl2(parent, offset) {
        var _this = _super.call(this, parent, offset) || this;
        _this.type = "array";
        _this.items = [];
        return _this;
      }
      Object.defineProperty(ArrayASTNodeImpl2.prototype, "children", {
        get: function() {
          return this.items;
        },
        enumerable: false,
        configurable: true
      });
      return ArrayASTNodeImpl2;
    }(ASTNodeImpl);
    var NumberASTNodeImpl = function(_super) {
      __extends(NumberASTNodeImpl2, _super);
      function NumberASTNodeImpl2(parent, offset) {
        var _this = _super.call(this, parent, offset) || this;
        _this.type = "number";
        _this.isInteger = true;
        _this.value = Number.NaN;
        return _this;
      }
      return NumberASTNodeImpl2;
    }(ASTNodeImpl);
    var StringASTNodeImpl = function(_super) {
      __extends(StringASTNodeImpl2, _super);
      function StringASTNodeImpl2(parent, offset, length) {
        var _this = _super.call(this, parent, offset, length) || this;
        _this.type = "string";
        _this.value = "";
        return _this;
      }
      return StringASTNodeImpl2;
    }(ASTNodeImpl);
    var PropertyASTNodeImpl = function(_super) {
      __extends(PropertyASTNodeImpl2, _super);
      function PropertyASTNodeImpl2(parent, offset, keyNode) {
        var _this = _super.call(this, parent, offset) || this;
        _this.type = "property";
        _this.colonOffset = -1;
        _this.keyNode = keyNode;
        return _this;
      }
      Object.defineProperty(PropertyASTNodeImpl2.prototype, "children", {
        get: function() {
          return this.valueNode ? [this.keyNode, this.valueNode] : [this.keyNode];
        },
        enumerable: false,
        configurable: true
      });
      return PropertyASTNodeImpl2;
    }(ASTNodeImpl);
    var ObjectASTNodeImpl = function(_super) {
      __extends(ObjectASTNodeImpl2, _super);
      function ObjectASTNodeImpl2(parent, offset) {
        var _this = _super.call(this, parent, offset) || this;
        _this.type = "object";
        _this.properties = [];
        return _this;
      }
      Object.defineProperty(ObjectASTNodeImpl2.prototype, "children", {
        get: function() {
          return this.properties;
        },
        enumerable: false,
        configurable: true
      });
      return ObjectASTNodeImpl2;
    }(ASTNodeImpl);
    function asSchema(schema) {
      if (isBoolean(schema)) {
        return schema ? {} : { "not": {} };
      }
      return schema;
    }
    var EnumMatch;
    (function(EnumMatch2) {
      EnumMatch2[EnumMatch2["Key"] = 0] = "Key";
      EnumMatch2[EnumMatch2["Enum"] = 1] = "Enum";
    })(EnumMatch || (EnumMatch = {}));
    var SchemaCollector = function() {
      function SchemaCollector2(focusOffset, exclude) {
        if (focusOffset === void 0) {
          focusOffset = -1;
        }
        this.focusOffset = focusOffset;
        this.exclude = exclude;
        this.schemas = [];
      }
      SchemaCollector2.prototype.add = function(schema) {
        this.schemas.push(schema);
      };
      SchemaCollector2.prototype.merge = function(other) {
        Array.prototype.push.apply(this.schemas, other.schemas);
      };
      SchemaCollector2.prototype.include = function(node) {
        return (this.focusOffset === -1 || contains(node, this.focusOffset)) && node !== this.exclude;
      };
      SchemaCollector2.prototype.newSub = function() {
        return new SchemaCollector2(-1, this.exclude);
      };
      return SchemaCollector2;
    }();
    var NoOpSchemaCollector = function() {
      function NoOpSchemaCollector2() {
      }
      Object.defineProperty(NoOpSchemaCollector2.prototype, "schemas", {
        get: function() {
          return [];
        },
        enumerable: false,
        configurable: true
      });
      NoOpSchemaCollector2.prototype.add = function(schema) {
      };
      NoOpSchemaCollector2.prototype.merge = function(other) {
      };
      NoOpSchemaCollector2.prototype.include = function(node) {
        return true;
      };
      NoOpSchemaCollector2.prototype.newSub = function() {
        return this;
      };
      NoOpSchemaCollector2.instance = new NoOpSchemaCollector2();
      return NoOpSchemaCollector2;
    }();
    var ValidationResult = function() {
      function ValidationResult2() {
        this.problems = [];
        this.propertiesMatches = 0;
        this.propertiesValueMatches = 0;
        this.primaryValueMatches = 0;
        this.enumValueMatch = false;
        this.enumValues = void 0;
      }
      ValidationResult2.prototype.hasProblems = function() {
        return !!this.problems.length;
      };
      ValidationResult2.prototype.mergeAll = function(validationResults) {
        for (var _i = 0, validationResults_1 = validationResults; _i < validationResults_1.length; _i++) {
          var validationResult = validationResults_1[_i];
          this.merge(validationResult);
        }
      };
      ValidationResult2.prototype.merge = function(validationResult) {
        this.problems = this.problems.concat(validationResult.problems);
      };
      ValidationResult2.prototype.mergeEnumValues = function(validationResult) {
        if (!this.enumValueMatch && !validationResult.enumValueMatch && this.enumValues && validationResult.enumValues) {
          this.enumValues = this.enumValues.concat(validationResult.enumValues);
          for (var _i = 0, _a = this.problems; _i < _a.length; _i++) {
            var error = _a[_i];
            if (error.code === ErrorCode.EnumValueMismatch) {
              error.message = localize$4("enumWarning", "Value is not accepted. Valid values: {0}.", this.enumValues.map(function(v) {
                return JSON.stringify(v);
              }).join(", "));
            }
          }
        }
      };
      ValidationResult2.prototype.mergePropertyMatch = function(propertyValidationResult) {
        this.merge(propertyValidationResult);
        this.propertiesMatches++;
        if (propertyValidationResult.enumValueMatch || !propertyValidationResult.hasProblems() && propertyValidationResult.propertiesMatches) {
          this.propertiesValueMatches++;
        }
        if (propertyValidationResult.enumValueMatch && propertyValidationResult.enumValues && propertyValidationResult.enumValues.length === 1) {
          this.primaryValueMatches++;
        }
      };
      ValidationResult2.prototype.compare = function(other) {
        var hasProblems = this.hasProblems();
        if (hasProblems !== other.hasProblems()) {
          return hasProblems ? -1 : 1;
        }
        if (this.enumValueMatch !== other.enumValueMatch) {
          return other.enumValueMatch ? -1 : 1;
        }
        if (this.primaryValueMatches !== other.primaryValueMatches) {
          return this.primaryValueMatches - other.primaryValueMatches;
        }
        if (this.propertiesValueMatches !== other.propertiesValueMatches) {
          return this.propertiesValueMatches - other.propertiesValueMatches;
        }
        return this.propertiesMatches - other.propertiesMatches;
      };
      return ValidationResult2;
    }();
    function newJSONDocument(root, diagnostics) {
      if (diagnostics === void 0) {
        diagnostics = [];
      }
      return new JSONDocument(root, diagnostics, []);
    }
    function getNodeValue(node) {
      return getNodeValue$1(node);
    }
    function getNodePath(node) {
      return getNodePath$1(node);
    }
    function contains(node, offset, includeRightBound) {
      if (includeRightBound === void 0) {
        includeRightBound = false;
      }
      return offset >= node.offset && offset < node.offset + node.length || includeRightBound && offset === node.offset + node.length;
    }
    var JSONDocument = function() {
      function JSONDocument2(root, syntaxErrors, comments) {
        if (syntaxErrors === void 0) {
          syntaxErrors = [];
        }
        if (comments === void 0) {
          comments = [];
        }
        this.root = root;
        this.syntaxErrors = syntaxErrors;
        this.comments = comments;
      }
      JSONDocument2.prototype.getNodeFromOffset = function(offset, includeRightBound) {
        if (includeRightBound === void 0) {
          includeRightBound = false;
        }
        if (this.root) {
          return findNodeAtOffset(this.root, offset, includeRightBound);
        }
        return void 0;
      };
      JSONDocument2.prototype.visit = function(visitor) {
        if (this.root) {
          var doVisit_1 = function(node) {
            var ctn = visitor(node);
            var children = node.children;
            if (Array.isArray(children)) {
              for (var i = 0; i < children.length && ctn; i++) {
                ctn = doVisit_1(children[i]);
              }
            }
            return ctn;
          };
          doVisit_1(this.root);
        }
      };
      JSONDocument2.prototype.validate = function(textDocument, schema, severity) {
        if (severity === void 0) {
          severity = DiagnosticSeverity.Warning;
        }
        if (this.root && schema) {
          var validationResult = new ValidationResult();
          validate(this.root, schema, validationResult, NoOpSchemaCollector.instance);
          return validationResult.problems.map(function(p) {
            var _a;
            var range = Range.create(textDocument.positionAt(p.location.offset), textDocument.positionAt(p.location.offset + p.location.length));
            return Diagnostic.create(range, p.message, (_a = p.severity) !== null && _a !== void 0 ? _a : severity, p.code);
          });
        }
        return void 0;
      };
      JSONDocument2.prototype.getMatchingSchemas = function(schema, focusOffset, exclude) {
        if (focusOffset === void 0) {
          focusOffset = -1;
        }
        var matchingSchemas = new SchemaCollector(focusOffset, exclude);
        if (this.root && schema) {
          validate(this.root, schema, new ValidationResult(), matchingSchemas);
        }
        return matchingSchemas.schemas;
      };
      return JSONDocument2;
    }();
    function validate(n, schema, validationResult, matchingSchemas) {
      if (!n || !matchingSchemas.include(n)) {
        return;
      }
      var node = n;
      switch (node.type) {
        case "object":
          _validateObjectNode(node, schema, validationResult, matchingSchemas);
          break;
        case "array":
          _validateArrayNode(node, schema, validationResult, matchingSchemas);
          break;
        case "string":
          _validateStringNode(node, schema, validationResult);
          break;
        case "number":
          _validateNumberNode(node, schema, validationResult);
          break;
        case "property":
          return validate(node.valueNode, schema, validationResult, matchingSchemas);
      }
      _validateNode();
      matchingSchemas.add({ node, schema });
      function _validateNode() {
        function matchesType(type) {
          return node.type === type || type === "integer" && node.type === "number" && node.isInteger;
        }
        if (Array.isArray(schema.type)) {
          if (!schema.type.some(matchesType)) {
            validationResult.problems.push({
              location: { offset: node.offset, length: node.length },
              message: schema.errorMessage || localize$4("typeArrayMismatchWarning", "Incorrect type. Expected one of {0}.", schema.type.join(", "))
            });
          }
        } else if (schema.type) {
          if (!matchesType(schema.type)) {
            validationResult.problems.push({
              location: { offset: node.offset, length: node.length },
              message: schema.errorMessage || localize$4("typeMismatchWarning", 'Incorrect type. Expected "{0}".', schema.type)
            });
          }
        }
        if (Array.isArray(schema.allOf)) {
          for (var _i = 0, _a = schema.allOf; _i < _a.length; _i++) {
            var subSchemaRef = _a[_i];
            validate(node, asSchema(subSchemaRef), validationResult, matchingSchemas);
          }
        }
        var notSchema = asSchema(schema.not);
        if (notSchema) {
          var subValidationResult = new ValidationResult();
          var subMatchingSchemas = matchingSchemas.newSub();
          validate(node, notSchema, subValidationResult, subMatchingSchemas);
          if (!subValidationResult.hasProblems()) {
            validationResult.problems.push({
              location: { offset: node.offset, length: node.length },
              message: localize$4("notSchemaWarning", "Matches a schema that is not allowed.")
            });
          }
          for (var _b = 0, _c = subMatchingSchemas.schemas; _b < _c.length; _b++) {
            var ms = _c[_b];
            ms.inverted = !ms.inverted;
            matchingSchemas.add(ms);
          }
        }
        var testAlternatives = function(alternatives, maxOneMatch) {
          var matches = [];
          var bestMatch = void 0;
          for (var _i2 = 0, alternatives_1 = alternatives; _i2 < alternatives_1.length; _i2++) {
            var subSchemaRef2 = alternatives_1[_i2];
            var subSchema = asSchema(subSchemaRef2);
            var subValidationResult2 = new ValidationResult();
            var subMatchingSchemas2 = matchingSchemas.newSub();
            validate(node, subSchema, subValidationResult2, subMatchingSchemas2);
            if (!subValidationResult2.hasProblems()) {
              matches.push(subSchema);
            }
            if (!bestMatch) {
              bestMatch = { schema: subSchema, validationResult: subValidationResult2, matchingSchemas: subMatchingSchemas2 };
            } else {
              if (!maxOneMatch && !subValidationResult2.hasProblems() && !bestMatch.validationResult.hasProblems()) {
                bestMatch.matchingSchemas.merge(subMatchingSchemas2);
                bestMatch.validationResult.propertiesMatches += subValidationResult2.propertiesMatches;
                bestMatch.validationResult.propertiesValueMatches += subValidationResult2.propertiesValueMatches;
              } else {
                var compareResult = subValidationResult2.compare(bestMatch.validationResult);
                if (compareResult > 0) {
                  bestMatch = { schema: subSchema, validationResult: subValidationResult2, matchingSchemas: subMatchingSchemas2 };
                } else if (compareResult === 0) {
                  bestMatch.matchingSchemas.merge(subMatchingSchemas2);
                  bestMatch.validationResult.mergeEnumValues(subValidationResult2);
                }
              }
            }
          }
          if (matches.length > 1 && maxOneMatch) {
            validationResult.problems.push({
              location: { offset: node.offset, length: 1 },
              message: localize$4("oneOfWarning", "Matches multiple schemas when only one must validate.")
            });
          }
          if (bestMatch) {
            validationResult.merge(bestMatch.validationResult);
            validationResult.propertiesMatches += bestMatch.validationResult.propertiesMatches;
            validationResult.propertiesValueMatches += bestMatch.validationResult.propertiesValueMatches;
            matchingSchemas.merge(bestMatch.matchingSchemas);
          }
          return matches.length;
        };
        if (Array.isArray(schema.anyOf)) {
          testAlternatives(schema.anyOf, false);
        }
        if (Array.isArray(schema.oneOf)) {
          testAlternatives(schema.oneOf, true);
        }
        var testBranch = function(schema2) {
          var subValidationResult2 = new ValidationResult();
          var subMatchingSchemas2 = matchingSchemas.newSub();
          validate(node, asSchema(schema2), subValidationResult2, subMatchingSchemas2);
          validationResult.merge(subValidationResult2);
          validationResult.propertiesMatches += subValidationResult2.propertiesMatches;
          validationResult.propertiesValueMatches += subValidationResult2.propertiesValueMatches;
          matchingSchemas.merge(subMatchingSchemas2);
        };
        var testCondition = function(ifSchema2, thenSchema, elseSchema) {
          var subSchema = asSchema(ifSchema2);
          var subValidationResult2 = new ValidationResult();
          var subMatchingSchemas2 = matchingSchemas.newSub();
          validate(node, subSchema, subValidationResult2, subMatchingSchemas2);
          matchingSchemas.merge(subMatchingSchemas2);
          if (!subValidationResult2.hasProblems()) {
            if (thenSchema) {
              testBranch(thenSchema);
            }
          } else if (elseSchema) {
            testBranch(elseSchema);
          }
        };
        var ifSchema = asSchema(schema.if);
        if (ifSchema) {
          testCondition(ifSchema, asSchema(schema.then), asSchema(schema.else));
        }
        if (Array.isArray(schema.enum)) {
          var val = getNodeValue(node);
          var enumValueMatch = false;
          for (var _d = 0, _e = schema.enum; _d < _e.length; _d++) {
            var e = _e[_d];
            if (equals(val, e)) {
              enumValueMatch = true;
              break;
            }
          }
          validationResult.enumValues = schema.enum;
          validationResult.enumValueMatch = enumValueMatch;
          if (!enumValueMatch) {
            validationResult.problems.push({
              location: { offset: node.offset, length: node.length },
              code: ErrorCode.EnumValueMismatch,
              message: schema.errorMessage || localize$4("enumWarning", "Value is not accepted. Valid values: {0}.", schema.enum.map(function(v) {
                return JSON.stringify(v);
              }).join(", "))
            });
          }
        }
        if (isDefined(schema.const)) {
          var val = getNodeValue(node);
          if (!equals(val, schema.const)) {
            validationResult.problems.push({
              location: { offset: node.offset, length: node.length },
              code: ErrorCode.EnumValueMismatch,
              message: schema.errorMessage || localize$4("constWarning", "Value must be {0}.", JSON.stringify(schema.const))
            });
            validationResult.enumValueMatch = false;
          } else {
            validationResult.enumValueMatch = true;
          }
          validationResult.enumValues = [schema.const];
        }
        if (schema.deprecationMessage && node.parent) {
          validationResult.problems.push({
            location: { offset: node.parent.offset, length: node.parent.length },
            severity: DiagnosticSeverity.Warning,
            message: schema.deprecationMessage,
            code: ErrorCode.Deprecated
          });
        }
      }
      function _validateNumberNode(node2, schema2, validationResult2, matchingSchemas2) {
        var val = node2.value;
        function normalizeFloats(float) {
          var _a;
          var parts = /^(-?\d+)(?:\.(\d+))?(?:e([-+]\d+))?$/.exec(float.toString());
          return parts && {
            value: Number(parts[1] + (parts[2] || "")),
            multiplier: (((_a = parts[2]) === null || _a === void 0 ? void 0 : _a.length) || 0) - (parseInt(parts[3]) || 0)
          };
        }
        if (isNumber(schema2.multipleOf)) {
          var remainder = -1;
          if (Number.isInteger(schema2.multipleOf)) {
            remainder = val % schema2.multipleOf;
          } else {
            var normMultipleOf = normalizeFloats(schema2.multipleOf);
            var normValue = normalizeFloats(val);
            if (normMultipleOf && normValue) {
              var multiplier = Math.pow(10, Math.abs(normValue.multiplier - normMultipleOf.multiplier));
              if (normValue.multiplier < normMultipleOf.multiplier) {
                normValue.value *= multiplier;
              } else {
                normMultipleOf.value *= multiplier;
              }
              remainder = normValue.value % normMultipleOf.value;
            }
          }
          if (remainder !== 0) {
            validationResult2.problems.push({
              location: { offset: node2.offset, length: node2.length },
              message: localize$4("multipleOfWarning", "Value is not divisible by {0}.", schema2.multipleOf)
            });
          }
        }
        function getExclusiveLimit(limit, exclusive) {
          if (isNumber(exclusive)) {
            return exclusive;
          }
          if (isBoolean(exclusive) && exclusive) {
            return limit;
          }
          return void 0;
        }
        function getLimit(limit, exclusive) {
          if (!isBoolean(exclusive) || !exclusive) {
            return limit;
          }
          return void 0;
        }
        var exclusiveMinimum = getExclusiveLimit(schema2.minimum, schema2.exclusiveMinimum);
        if (isNumber(exclusiveMinimum) && val <= exclusiveMinimum) {
          validationResult2.problems.push({
            location: { offset: node2.offset, length: node2.length },
            message: localize$4("exclusiveMinimumWarning", "Value is below the exclusive minimum of {0}.", exclusiveMinimum)
          });
        }
        var exclusiveMaximum = getExclusiveLimit(schema2.maximum, schema2.exclusiveMaximum);
        if (isNumber(exclusiveMaximum) && val >= exclusiveMaximum) {
          validationResult2.problems.push({
            location: { offset: node2.offset, length: node2.length },
            message: localize$4("exclusiveMaximumWarning", "Value is above the exclusive maximum of {0}.", exclusiveMaximum)
          });
        }
        var minimum = getLimit(schema2.minimum, schema2.exclusiveMinimum);
        if (isNumber(minimum) && val < minimum) {
          validationResult2.problems.push({
            location: { offset: node2.offset, length: node2.length },
            message: localize$4("minimumWarning", "Value is below the minimum of {0}.", minimum)
          });
        }
        var maximum = getLimit(schema2.maximum, schema2.exclusiveMaximum);
        if (isNumber(maximum) && val > maximum) {
          validationResult2.problems.push({
            location: { offset: node2.offset, length: node2.length },
            message: localize$4("maximumWarning", "Value is above the maximum of {0}.", maximum)
          });
        }
      }
      function _validateStringNode(node2, schema2, validationResult2, matchingSchemas2) {
        if (isNumber(schema2.minLength) && node2.value.length < schema2.minLength) {
          validationResult2.problems.push({
            location: { offset: node2.offset, length: node2.length },
            message: localize$4("minLengthWarning", "String is shorter than the minimum length of {0}.", schema2.minLength)
          });
        }
        if (isNumber(schema2.maxLength) && node2.value.length > schema2.maxLength) {
          validationResult2.problems.push({
            location: { offset: node2.offset, length: node2.length },
            message: localize$4("maxLengthWarning", "String is longer than the maximum length of {0}.", schema2.maxLength)
          });
        }
        if (isString(schema2.pattern)) {
          var regex = extendedRegExp(schema2.pattern);
          if (!regex.test(node2.value)) {
            validationResult2.problems.push({
              location: { offset: node2.offset, length: node2.length },
              message: schema2.patternErrorMessage || schema2.errorMessage || localize$4("patternWarning", 'String does not match the pattern of "{0}".', schema2.pattern)
            });
          }
        }
        if (schema2.format) {
          switch (schema2.format) {
            case "uri":
            case "uri-reference":
              {
                var errorMessage = void 0;
                if (!node2.value) {
                  errorMessage = localize$4("uriEmpty", "URI expected.");
                } else {
                  var match = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/.exec(node2.value);
                  if (!match) {
                    errorMessage = localize$4("uriMissing", "URI is expected.");
                  } else if (!match[2] && schema2.format === "uri") {
                    errorMessage = localize$4("uriSchemeMissing", "URI with a scheme is expected.");
                  }
                }
                if (errorMessage) {
                  validationResult2.problems.push({
                    location: { offset: node2.offset, length: node2.length },
                    message: schema2.patternErrorMessage || schema2.errorMessage || localize$4("uriFormatWarning", "String is not a URI: {0}", errorMessage)
                  });
                }
              }
              break;
            case "color-hex":
            case "date-time":
            case "date":
            case "time":
            case "email":
              var format = formats[schema2.format];
              if (!node2.value || !format.pattern.exec(node2.value)) {
                validationResult2.problems.push({
                  location: { offset: node2.offset, length: node2.length },
                  message: schema2.patternErrorMessage || schema2.errorMessage || format.errorMessage
                });
              }
          }
        }
      }
      function _validateArrayNode(node2, schema2, validationResult2, matchingSchemas2) {
        if (Array.isArray(schema2.items)) {
          var subSchemas = schema2.items;
          for (var index = 0; index < subSchemas.length; index++) {
            var subSchemaRef = subSchemas[index];
            var subSchema = asSchema(subSchemaRef);
            var itemValidationResult = new ValidationResult();
            var item = node2.items[index];
            if (item) {
              validate(item, subSchema, itemValidationResult, matchingSchemas2);
              validationResult2.mergePropertyMatch(itemValidationResult);
            } else if (node2.items.length >= subSchemas.length) {
              validationResult2.propertiesValueMatches++;
            }
          }
          if (node2.items.length > subSchemas.length) {
            if (typeof schema2.additionalItems === "object") {
              for (var i = subSchemas.length; i < node2.items.length; i++) {
                var itemValidationResult = new ValidationResult();
                validate(node2.items[i], schema2.additionalItems, itemValidationResult, matchingSchemas2);
                validationResult2.mergePropertyMatch(itemValidationResult);
              }
            } else if (schema2.additionalItems === false) {
              validationResult2.problems.push({
                location: { offset: node2.offset, length: node2.length },
                message: localize$4("additionalItemsWarning", "Array has too many items according to schema. Expected {0} or fewer.", subSchemas.length)
              });
            }
          }
        } else {
          var itemSchema = asSchema(schema2.items);
          if (itemSchema) {
            for (var _i = 0, _a = node2.items; _i < _a.length; _i++) {
              var item = _a[_i];
              var itemValidationResult = new ValidationResult();
              validate(item, itemSchema, itemValidationResult, matchingSchemas2);
              validationResult2.mergePropertyMatch(itemValidationResult);
            }
          }
        }
        var containsSchema = asSchema(schema2.contains);
        if (containsSchema) {
          var doesContain = node2.items.some(function(item2) {
            var itemValidationResult2 = new ValidationResult();
            validate(item2, containsSchema, itemValidationResult2, NoOpSchemaCollector.instance);
            return !itemValidationResult2.hasProblems();
          });
          if (!doesContain) {
            validationResult2.problems.push({
              location: { offset: node2.offset, length: node2.length },
              message: schema2.errorMessage || localize$4("requiredItemMissingWarning", "Array does not contain required item.")
            });
          }
        }
        if (isNumber(schema2.minItems) && node2.items.length < schema2.minItems) {
          validationResult2.problems.push({
            location: { offset: node2.offset, length: node2.length },
            message: localize$4("minItemsWarning", "Array has too few items. Expected {0} or more.", schema2.minItems)
          });
        }
        if (isNumber(schema2.maxItems) && node2.items.length > schema2.maxItems) {
          validationResult2.problems.push({
            location: { offset: node2.offset, length: node2.length },
            message: localize$4("maxItemsWarning", "Array has too many items. Expected {0} or fewer.", schema2.maxItems)
          });
        }
        if (schema2.uniqueItems === true) {
          var values_1 = getNodeValue(node2);
          var duplicates = values_1.some(function(value, index2) {
            return index2 !== values_1.lastIndexOf(value);
          });
          if (duplicates) {
            validationResult2.problems.push({
              location: { offset: node2.offset, length: node2.length },
              message: localize$4("uniqueItemsWarning", "Array has duplicate items.")
            });
          }
        }
      }
      function _validateObjectNode(node2, schema2, validationResult2, matchingSchemas2) {
        var seenKeys = Object.create(null);
        var unprocessedProperties = [];
        for (var _i = 0, _a = node2.properties; _i < _a.length; _i++) {
          var propertyNode = _a[_i];
          var key = propertyNode.keyNode.value;
          seenKeys[key] = propertyNode.valueNode;
          unprocessedProperties.push(key);
        }
        if (Array.isArray(schema2.required)) {
          for (var _b = 0, _c = schema2.required; _b < _c.length; _b++) {
            var propertyName = _c[_b];
            if (!seenKeys[propertyName]) {
              var keyNode = node2.parent && node2.parent.type === "property" && node2.parent.keyNode;
              var location = keyNode ? { offset: keyNode.offset, length: keyNode.length } : { offset: node2.offset, length: 1 };
              validationResult2.problems.push({
                location,
                message: localize$4("MissingRequiredPropWarning", 'Missing property "{0}".', propertyName)
              });
            }
          }
        }
        var propertyProcessed = function(prop2) {
          var index = unprocessedProperties.indexOf(prop2);
          while (index >= 0) {
            unprocessedProperties.splice(index, 1);
            index = unprocessedProperties.indexOf(prop2);
          }
        };
        if (schema2.properties) {
          for (var _d = 0, _e = Object.keys(schema2.properties); _d < _e.length; _d++) {
            var propertyName = _e[_d];
            propertyProcessed(propertyName);
            var propertySchema = schema2.properties[propertyName];
            var child = seenKeys[propertyName];
            if (child) {
              if (isBoolean(propertySchema)) {
                if (!propertySchema) {
                  var propertyNode = child.parent;
                  validationResult2.problems.push({
                    location: { offset: propertyNode.keyNode.offset, length: propertyNode.keyNode.length },
                    message: schema2.errorMessage || localize$4("DisallowedExtraPropWarning", "Property {0} is not allowed.", propertyName)
                  });
                } else {
                  validationResult2.propertiesMatches++;
                  validationResult2.propertiesValueMatches++;
                }
              } else {
                var propertyValidationResult = new ValidationResult();
                validate(child, propertySchema, propertyValidationResult, matchingSchemas2);
                validationResult2.mergePropertyMatch(propertyValidationResult);
              }
            }
          }
        }
        if (schema2.patternProperties) {
          for (var _f = 0, _g = Object.keys(schema2.patternProperties); _f < _g.length; _f++) {
            var propertyPattern = _g[_f];
            var regex = extendedRegExp(propertyPattern);
            for (var _h = 0, _j = unprocessedProperties.slice(0); _h < _j.length; _h++) {
              var propertyName = _j[_h];
              if (regex.test(propertyName)) {
                propertyProcessed(propertyName);
                var child = seenKeys[propertyName];
                if (child) {
                  var propertySchema = schema2.patternProperties[propertyPattern];
                  if (isBoolean(propertySchema)) {
                    if (!propertySchema) {
                      var propertyNode = child.parent;
                      validationResult2.problems.push({
                        location: { offset: propertyNode.keyNode.offset, length: propertyNode.keyNode.length },
                        message: schema2.errorMessage || localize$4("DisallowedExtraPropWarning", "Property {0} is not allowed.", propertyName)
                      });
                    } else {
                      validationResult2.propertiesMatches++;
                      validationResult2.propertiesValueMatches++;
                    }
                  } else {
                    var propertyValidationResult = new ValidationResult();
                    validate(child, propertySchema, propertyValidationResult, matchingSchemas2);
                    validationResult2.mergePropertyMatch(propertyValidationResult);
                  }
                }
              }
            }
          }
        }
        if (typeof schema2.additionalProperties === "object") {
          for (var _k = 0, unprocessedProperties_1 = unprocessedProperties; _k < unprocessedProperties_1.length; _k++) {
            var propertyName = unprocessedProperties_1[_k];
            var child = seenKeys[propertyName];
            if (child) {
              var propertyValidationResult = new ValidationResult();
              validate(child, schema2.additionalProperties, propertyValidationResult, matchingSchemas2);
              validationResult2.mergePropertyMatch(propertyValidationResult);
            }
          }
        } else if (schema2.additionalProperties === false) {
          if (unprocessedProperties.length > 0) {
            for (var _l = 0, unprocessedProperties_2 = unprocessedProperties; _l < unprocessedProperties_2.length; _l++) {
              var propertyName = unprocessedProperties_2[_l];
              var child = seenKeys[propertyName];
              if (child) {
                var propertyNode = child.parent;
                validationResult2.problems.push({
                  location: { offset: propertyNode.keyNode.offset, length: propertyNode.keyNode.length },
                  message: schema2.errorMessage || localize$4("DisallowedExtraPropWarning", "Property {0} is not allowed.", propertyName)
                });
              }
            }
          }
        }
        if (isNumber(schema2.maxProperties)) {
          if (node2.properties.length > schema2.maxProperties) {
            validationResult2.problems.push({
              location: { offset: node2.offset, length: node2.length },
              message: localize$4("MaxPropWarning", "Object has more properties than limit of {0}.", schema2.maxProperties)
            });
          }
        }
        if (isNumber(schema2.minProperties)) {
          if (node2.properties.length < schema2.minProperties) {
            validationResult2.problems.push({
              location: { offset: node2.offset, length: node2.length },
              message: localize$4("MinPropWarning", "Object has fewer properties than the required number of {0}", schema2.minProperties)
            });
          }
        }
        if (schema2.dependencies) {
          for (var _m = 0, _o = Object.keys(schema2.dependencies); _m < _o.length; _m++) {
            var key = _o[_m];
            var prop = seenKeys[key];
            if (prop) {
              var propertyDep = schema2.dependencies[key];
              if (Array.isArray(propertyDep)) {
                for (var _p = 0, propertyDep_1 = propertyDep; _p < propertyDep_1.length; _p++) {
                  var requiredProp = propertyDep_1[_p];
                  if (!seenKeys[requiredProp]) {
                    validationResult2.problems.push({
                      location: { offset: node2.offset, length: node2.length },
                      message: localize$4("RequiredDependentPropWarning", "Object is missing property {0} required by property {1}.", requiredProp, key)
                    });
                  } else {
                    validationResult2.propertiesValueMatches++;
                  }
                }
              } else {
                var propertySchema = asSchema(propertyDep);
                if (propertySchema) {
                  var propertyValidationResult = new ValidationResult();
                  validate(node2, propertySchema, propertyValidationResult, matchingSchemas2);
                  validationResult2.mergePropertyMatch(propertyValidationResult);
                }
              }
            }
          }
        }
        var propertyNames = asSchema(schema2.propertyNames);
        if (propertyNames) {
          for (var _q = 0, _r = node2.properties; _q < _r.length; _q++) {
            var f = _r[_q];
            var key = f.keyNode;
            if (key) {
              validate(key, propertyNames, validationResult2, NoOpSchemaCollector.instance);
            }
          }
        }
      }
    }
    function parse(textDocument, config) {
      var problems = [];
      var lastProblemOffset = -1;
      var text = textDocument.getText();
      var scanner = createScanner(text, false);
      var commentRanges = config && config.collectComments ? [] : void 0;
      function _scanNext() {
        while (true) {
          var token_1 = scanner.scan();
          _checkScanError();
          switch (token_1) {
            case 12:
            case 13:
              if (Array.isArray(commentRanges)) {
                commentRanges.push(Range.create(textDocument.positionAt(scanner.getTokenOffset()), textDocument.positionAt(scanner.getTokenOffset() + scanner.getTokenLength())));
              }
              break;
            case 15:
            case 14:
              break;
            default:
              return token_1;
          }
        }
      }
      function _errorAtRange(message, code, startOffset, endOffset, severity) {
        if (severity === void 0) {
          severity = DiagnosticSeverity.Error;
        }
        if (problems.length === 0 || startOffset !== lastProblemOffset) {
          var range = Range.create(textDocument.positionAt(startOffset), textDocument.positionAt(endOffset));
          problems.push(Diagnostic.create(range, message, severity, code, textDocument.languageId));
          lastProblemOffset = startOffset;
        }
      }
      function _error(message, code, node, skipUntilAfter, skipUntil) {
        if (node === void 0) {
          node = void 0;
        }
        if (skipUntilAfter === void 0) {
          skipUntilAfter = [];
        }
        if (skipUntil === void 0) {
          skipUntil = [];
        }
        var start = scanner.getTokenOffset();
        var end = scanner.getTokenOffset() + scanner.getTokenLength();
        if (start === end && start > 0) {
          start--;
          while (start > 0 && /\s/.test(text.charAt(start))) {
            start--;
          }
          end = start + 1;
        }
        _errorAtRange(message, code, start, end);
        if (node) {
          _finalize(node, false);
        }
        if (skipUntilAfter.length + skipUntil.length > 0) {
          var token_2 = scanner.getToken();
          while (token_2 !== 17) {
            if (skipUntilAfter.indexOf(token_2) !== -1) {
              _scanNext();
              break;
            } else if (skipUntil.indexOf(token_2) !== -1) {
              break;
            }
            token_2 = _scanNext();
          }
        }
        return node;
      }
      function _checkScanError() {
        switch (scanner.getTokenError()) {
          case 4:
            _error(localize$4("InvalidUnicode", "Invalid unicode sequence in string."), ErrorCode.InvalidUnicode);
            return true;
          case 5:
            _error(localize$4("InvalidEscapeCharacter", "Invalid escape character in string."), ErrorCode.InvalidEscapeCharacter);
            return true;
          case 3:
            _error(localize$4("UnexpectedEndOfNumber", "Unexpected end of number."), ErrorCode.UnexpectedEndOfNumber);
            return true;
          case 1:
            _error(localize$4("UnexpectedEndOfComment", "Unexpected end of comment."), ErrorCode.UnexpectedEndOfComment);
            return true;
          case 2:
            _error(localize$4("UnexpectedEndOfString", "Unexpected end of string."), ErrorCode.UnexpectedEndOfString);
            return true;
          case 6:
            _error(localize$4("InvalidCharacter", "Invalid characters in string. Control characters must be escaped."), ErrorCode.InvalidCharacter);
            return true;
        }
        return false;
      }
      function _finalize(node, scanNext) {
        node.length = scanner.getTokenOffset() + scanner.getTokenLength() - node.offset;
        if (scanNext) {
          _scanNext();
        }
        return node;
      }
      function _parseArray(parent) {
        if (scanner.getToken() !== 3) {
          return void 0;
        }
        var node = new ArrayASTNodeImpl(parent, scanner.getTokenOffset());
        _scanNext();
        var needsComma = false;
        while (scanner.getToken() !== 4 && scanner.getToken() !== 17) {
          if (scanner.getToken() === 5) {
            if (!needsComma) {
              _error(localize$4("ValueExpected", "Value expected"), ErrorCode.ValueExpected);
            }
            var commaOffset = scanner.getTokenOffset();
            _scanNext();
            if (scanner.getToken() === 4) {
              if (needsComma) {
                _errorAtRange(localize$4("TrailingComma", "Trailing comma"), ErrorCode.TrailingComma, commaOffset, commaOffset + 1);
              }
              continue;
            }
          } else if (needsComma) {
            _error(localize$4("ExpectedComma", "Expected comma"), ErrorCode.CommaExpected);
          }
          var item = _parseValue(node);
          if (!item) {
            _error(localize$4("PropertyExpected", "Value expected"), ErrorCode.ValueExpected, void 0, [], [4, 5]);
          } else {
            node.items.push(item);
          }
          needsComma = true;
        }
        if (scanner.getToken() !== 4) {
          return _error(localize$4("ExpectedCloseBracket", "Expected comma or closing bracket"), ErrorCode.CommaOrCloseBacketExpected, node);
        }
        return _finalize(node, true);
      }
      var keyPlaceholder = new StringASTNodeImpl(void 0, 0, 0);
      function _parseProperty(parent, keysSeen) {
        var node = new PropertyASTNodeImpl(parent, scanner.getTokenOffset(), keyPlaceholder);
        var key = _parseString(node);
        if (!key) {
          if (scanner.getToken() === 16) {
            _error(localize$4("DoubleQuotesExpected", "Property keys must be doublequoted"), ErrorCode.Undefined);
            var keyNode = new StringASTNodeImpl(node, scanner.getTokenOffset(), scanner.getTokenLength());
            keyNode.value = scanner.getTokenValue();
            key = keyNode;
            _scanNext();
          } else {
            return void 0;
          }
        }
        node.keyNode = key;
        var seen = keysSeen[key.value];
        if (seen) {
          _errorAtRange(localize$4("DuplicateKeyWarning", "Duplicate object key"), ErrorCode.DuplicateKey, node.keyNode.offset, node.keyNode.offset + node.keyNode.length, DiagnosticSeverity.Warning);
          if (typeof seen === "object") {
            _errorAtRange(localize$4("DuplicateKeyWarning", "Duplicate object key"), ErrorCode.DuplicateKey, seen.keyNode.offset, seen.keyNode.offset + seen.keyNode.length, DiagnosticSeverity.Warning);
          }
          keysSeen[key.value] = true;
        } else {
          keysSeen[key.value] = node;
        }
        if (scanner.getToken() === 6) {
          node.colonOffset = scanner.getTokenOffset();
          _scanNext();
        } else {
          _error(localize$4("ColonExpected", "Colon expected"), ErrorCode.ColonExpected);
          if (scanner.getToken() === 10 && textDocument.positionAt(key.offset + key.length).line < textDocument.positionAt(scanner.getTokenOffset()).line) {
            node.length = key.length;
            return node;
          }
        }
        var value = _parseValue(node);
        if (!value) {
          return _error(localize$4("ValueExpected", "Value expected"), ErrorCode.ValueExpected, node, [], [2, 5]);
        }
        node.valueNode = value;
        node.length = value.offset + value.length - node.offset;
        return node;
      }
      function _parseObject(parent) {
        if (scanner.getToken() !== 1) {
          return void 0;
        }
        var node = new ObjectASTNodeImpl(parent, scanner.getTokenOffset());
        var keysSeen = Object.create(null);
        _scanNext();
        var needsComma = false;
        while (scanner.getToken() !== 2 && scanner.getToken() !== 17) {
          if (scanner.getToken() === 5) {
            if (!needsComma) {
              _error(localize$4("PropertyExpected", "Property expected"), ErrorCode.PropertyExpected);
            }
            var commaOffset = scanner.getTokenOffset();
            _scanNext();
            if (scanner.getToken() === 2) {
              if (needsComma) {
                _errorAtRange(localize$4("TrailingComma", "Trailing comma"), ErrorCode.TrailingComma, commaOffset, commaOffset + 1);
              }
              continue;
            }
          } else if (needsComma) {
            _error(localize$4("ExpectedComma", "Expected comma"), ErrorCode.CommaExpected);
          }
          var property = _parseProperty(node, keysSeen);
          if (!property) {
            _error(localize$4("PropertyExpected", "Property expected"), ErrorCode.PropertyExpected, void 0, [], [2, 5]);
          } else {
            node.properties.push(property);
          }
          needsComma = true;
        }
        if (scanner.getToken() !== 2) {
          return _error(localize$4("ExpectedCloseBrace", "Expected comma or closing brace"), ErrorCode.CommaOrCloseBraceExpected, node);
        }
        return _finalize(node, true);
      }
      function _parseString(parent) {
        if (scanner.getToken() !== 10) {
          return void 0;
        }
        var node = new StringASTNodeImpl(parent, scanner.getTokenOffset());
        node.value = scanner.getTokenValue();
        return _finalize(node, true);
      }
      function _parseNumber(parent) {
        if (scanner.getToken() !== 11) {
          return void 0;
        }
        var node = new NumberASTNodeImpl(parent, scanner.getTokenOffset());
        if (scanner.getTokenError() === 0) {
          var tokenValue = scanner.getTokenValue();
          try {
            var numberValue = JSON.parse(tokenValue);
            if (!isNumber(numberValue)) {
              return _error(localize$4("InvalidNumberFormat", "Invalid number format."), ErrorCode.Undefined, node);
            }
            node.value = numberValue;
          } catch (e) {
            return _error(localize$4("InvalidNumberFormat", "Invalid number format."), ErrorCode.Undefined, node);
          }
          node.isInteger = tokenValue.indexOf(".") === -1;
        }
        return _finalize(node, true);
      }
      function _parseLiteral(parent) {
        switch (scanner.getToken()) {
          case 7:
            return _finalize(new NullASTNodeImpl(parent, scanner.getTokenOffset()), true);
          case 8:
            return _finalize(new BooleanASTNodeImpl(parent, true, scanner.getTokenOffset()), true);
          case 9:
            return _finalize(new BooleanASTNodeImpl(parent, false, scanner.getTokenOffset()), true);
          default:
            return void 0;
        }
      }
      function _parseValue(parent) {
        return _parseArray(parent) || _parseObject(parent) || _parseString(parent) || _parseNumber(parent) || _parseLiteral(parent);
      }
      var _root = void 0;
      var token = _scanNext();
      if (token !== 17) {
        _root = _parseValue(_root);
        if (!_root) {
          _error(localize$4("Invalid symbol", "Expected a JSON object, array or literal."), ErrorCode.Undefined);
        } else if (scanner.getToken() !== 17) {
          _error(localize$4("End of file expected", "End of file expected."), ErrorCode.Undefined);
        }
      }
      return new JSONDocument(_root, problems, commentRanges);
    }

    function stringifyObject(obj, indent, stringifyLiteral) {
      if (obj !== null && typeof obj === "object") {
        var newIndent = indent + "	";
        if (Array.isArray(obj)) {
          if (obj.length === 0) {
            return "[]";
          }
          var result = "[\n";
          for (var i = 0; i < obj.length; i++) {
            result += newIndent + stringifyObject(obj[i], newIndent, stringifyLiteral);
            if (i < obj.length - 1) {
              result += ",";
            }
            result += "\n";
          }
          result += indent + "]";
          return result;
        } else {
          var keys = Object.keys(obj);
          if (keys.length === 0) {
            return "{}";
          }
          var result = "{\n";
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            result += newIndent + JSON.stringify(key) + ": " + stringifyObject(obj[key], newIndent, stringifyLiteral);
            if (i < keys.length - 1) {
              result += ",";
            }
            result += "\n";
          }
          result += indent + "}";
          return result;
        }
      }
      return stringifyLiteral(obj);
    }

    var localize$3 = loadMessageBundle();
    var JSONCompletion = function() {
      function JSONCompletion2(schemaService, contributions, promiseConstructor, clientCapabilities) {
        if (contributions === void 0) {
          contributions = [];
        }
        if (promiseConstructor === void 0) {
          promiseConstructor = Promise;
        }
        if (clientCapabilities === void 0) {
          clientCapabilities = {};
        }
        this.schemaService = schemaService;
        this.contributions = contributions;
        this.promiseConstructor = promiseConstructor;
        this.clientCapabilities = clientCapabilities;
      }
      JSONCompletion2.prototype.doResolve = function(item) {
        for (var i = this.contributions.length - 1; i >= 0; i--) {
          var resolveCompletion = this.contributions[i].resolveCompletion;
          if (resolveCompletion) {
            var resolver = resolveCompletion(item);
            if (resolver) {
              return resolver;
            }
          }
        }
        return this.promiseConstructor.resolve(item);
      };
      JSONCompletion2.prototype.doComplete = function(document, position, doc) {
        var _this = this;
        var result = {
          items: [],
          isIncomplete: false
        };
        var text = document.getText();
        var offset = document.offsetAt(position);
        var node = doc.getNodeFromOffset(offset, true);
        if (this.isInComment(document, node ? node.offset : 0, offset)) {
          return Promise.resolve(result);
        }
        if (node && offset === node.offset + node.length && offset > 0) {
          var ch = text[offset - 1];
          if (node.type === "object" && ch === "}" || node.type === "array" && ch === "]") {
            node = node.parent;
          }
        }
        var currentWord = this.getCurrentWord(document, offset);
        var overwriteRange;
        if (node && (node.type === "string" || node.type === "number" || node.type === "boolean" || node.type === "null")) {
          overwriteRange = Range.create(document.positionAt(node.offset), document.positionAt(node.offset + node.length));
        } else {
          var overwriteStart = offset - currentWord.length;
          if (overwriteStart > 0 && text[overwriteStart - 1] === '"') {
            overwriteStart--;
          }
          overwriteRange = Range.create(document.positionAt(overwriteStart), position);
        }
        var proposed = {};
        var collector = {
          add: function(suggestion) {
            var label = suggestion.label;
            var existing = proposed[label];
            if (!existing) {
              label = label.replace(/[\n]/g, "\u21B5");
              if (label.length > 60) {
                var shortendedLabel = label.substr(0, 57).trim() + "...";
                if (!proposed[shortendedLabel]) {
                  label = shortendedLabel;
                }
              }
              if (overwriteRange && suggestion.insertText !== void 0) {
                suggestion.textEdit = TextEdit.replace(overwriteRange, suggestion.insertText);
              }
              suggestion.label = label;
              proposed[label] = suggestion;
              result.items.push(suggestion);
            } else {
              if (!existing.documentation) {
                existing.documentation = suggestion.documentation;
              }
              if (!existing.detail) {
                existing.detail = suggestion.detail;
              }
            }
          },
          setAsIncomplete: function() {
            result.isIncomplete = true;
          },
          error: function(message) {
            console.error(message);
          },
          log: function(message) {
            console.log(message);
          },
          getNumberOfProposals: function() {
            return result.items.length;
          }
        };
        return this.schemaService.getSchemaForResource(document.uri, doc).then(function(schema) {
          var collectionPromises = [];
          var addValue = true;
          var currentKey = "";
          var currentProperty = void 0;
          if (node) {
            if (node.type === "string") {
              var parent = node.parent;
              if (parent && parent.type === "property" && parent.keyNode === node) {
                addValue = !parent.valueNode;
                currentProperty = parent;
                currentKey = text.substr(node.offset + 1, node.length - 2);
                if (parent) {
                  node = parent.parent;
                }
              }
            }
          }
          if (node && node.type === "object") {
            if (node.offset === offset) {
              return result;
            }
            var properties = node.properties;
            properties.forEach(function(p) {
              if (!currentProperty || currentProperty !== p) {
                proposed[p.keyNode.value] = CompletionItem.create("__");
              }
            });
            var separatorAfter_1 = "";
            if (addValue) {
              separatorAfter_1 = _this.evaluateSeparatorAfter(document, document.offsetAt(overwriteRange.end));
            }
            if (schema) {
              _this.getPropertyCompletions(schema, doc, node, addValue, separatorAfter_1, collector);
            } else {
              _this.getSchemaLessPropertyCompletions(doc, node, currentKey, collector);
            }
            var location_1 = getNodePath(node);
            _this.contributions.forEach(function(contribution) {
              var collectPromise = contribution.collectPropertyCompletions(document.uri, location_1, currentWord, addValue, separatorAfter_1 === "", collector);
              if (collectPromise) {
                collectionPromises.push(collectPromise);
              }
            });
            if (!schema && currentWord.length > 0 && text.charAt(offset - currentWord.length - 1) !== '"') {
              collector.add({
                kind: CompletionItemKind.Property,
                label: _this.getLabelForValue(currentWord),
                insertText: _this.getInsertTextForProperty(currentWord, void 0, false, separatorAfter_1),
                insertTextFormat: InsertTextFormat.Snippet,
                documentation: ""
              });
              collector.setAsIncomplete();
            }
          }
          var types = {};
          if (schema) {
            _this.getValueCompletions(schema, doc, node, offset, document, collector, types);
          } else {
            _this.getSchemaLessValueCompletions(doc, node, offset, document, collector);
          }
          if (_this.contributions.length > 0) {
            _this.getContributedValueCompletions(doc, node, offset, document, collector, collectionPromises);
          }
          return _this.promiseConstructor.all(collectionPromises).then(function() {
            if (collector.getNumberOfProposals() === 0) {
              var offsetForSeparator = offset;
              if (node && (node.type === "string" || node.type === "number" || node.type === "boolean" || node.type === "null")) {
                offsetForSeparator = node.offset + node.length;
              }
              var separatorAfter = _this.evaluateSeparatorAfter(document, offsetForSeparator);
              _this.addFillerValueCompletions(types, separatorAfter, collector);
            }
            return result;
          });
        });
      };
      JSONCompletion2.prototype.getPropertyCompletions = function(schema, doc, node, addValue, separatorAfter, collector) {
        var _this = this;
        var matchingSchemas = doc.getMatchingSchemas(schema.schema, node.offset);
        matchingSchemas.forEach(function(s) {
          if (s.node === node && !s.inverted) {
            var schemaProperties_1 = s.schema.properties;
            if (schemaProperties_1) {
              Object.keys(schemaProperties_1).forEach(function(key) {
                var propertySchema = schemaProperties_1[key];
                if (typeof propertySchema === "object" && !propertySchema.deprecationMessage && !propertySchema.doNotSuggest) {
                  var proposal = {
                    kind: CompletionItemKind.Property,
                    label: key,
                    insertText: _this.getInsertTextForProperty(key, propertySchema, addValue, separatorAfter),
                    insertTextFormat: InsertTextFormat.Snippet,
                    filterText: _this.getFilterTextForValue(key),
                    documentation: _this.fromMarkup(propertySchema.markdownDescription) || propertySchema.description || ""
                  };
                  if (propertySchema.suggestSortText !== void 0) {
                    proposal.sortText = propertySchema.suggestSortText;
                  }
                  if (proposal.insertText && endsWith(proposal.insertText, "$1" + separatorAfter)) {
                    proposal.command = {
                      title: "Suggest",
                      command: "editor.action.triggerSuggest"
                    };
                  }
                  collector.add(proposal);
                }
              });
            }
            var schemaPropertyNames_1 = s.schema.propertyNames;
            if (typeof schemaPropertyNames_1 === "object" && !schemaPropertyNames_1.deprecationMessage && !schemaPropertyNames_1.doNotSuggest) {
              var propertyNameCompletionItem = function(name, enumDescription2) {
                if (enumDescription2 === void 0) {
                  enumDescription2 = void 0;
                }
                var proposal = {
                  kind: CompletionItemKind.Property,
                  label: name,
                  insertText: _this.getInsertTextForProperty(name, void 0, addValue, separatorAfter),
                  insertTextFormat: InsertTextFormat.Snippet,
                  filterText: _this.getFilterTextForValue(name),
                  documentation: enumDescription2 || _this.fromMarkup(schemaPropertyNames_1.markdownDescription) || schemaPropertyNames_1.description || ""
                };
                if (schemaPropertyNames_1.suggestSortText !== void 0) {
                  proposal.sortText = schemaPropertyNames_1.suggestSortText;
                }
                if (proposal.insertText && endsWith(proposal.insertText, "$1" + separatorAfter)) {
                  proposal.command = {
                    title: "Suggest",
                    command: "editor.action.triggerSuggest"
                  };
                }
                collector.add(proposal);
              };
              if (schemaPropertyNames_1.enum) {
                for (var i = 0; i < schemaPropertyNames_1.enum.length; i++) {
                  var enumDescription = void 0;
                  if (schemaPropertyNames_1.markdownEnumDescriptions && i < schemaPropertyNames_1.markdownEnumDescriptions.length) {
                    enumDescription = _this.fromMarkup(schemaPropertyNames_1.markdownEnumDescriptions[i]);
                  } else if (schemaPropertyNames_1.enumDescriptions && i < schemaPropertyNames_1.enumDescriptions.length) {
                    enumDescription = schemaPropertyNames_1.enumDescriptions[i];
                  }
                  propertyNameCompletionItem(schemaPropertyNames_1.enum[i], enumDescription);
                }
              }
              if (schemaPropertyNames_1.const) {
                propertyNameCompletionItem(schemaPropertyNames_1.const);
              }
            }
          }
        });
      };
      JSONCompletion2.prototype.getSchemaLessPropertyCompletions = function(doc, node, currentKey, collector) {
        var _this = this;
        var collectCompletionsForSimilarObject = function(obj) {
          obj.properties.forEach(function(p) {
            var key = p.keyNode.value;
            collector.add({
              kind: CompletionItemKind.Property,
              label: key,
              insertText: _this.getInsertTextForValue(key, ""),
              insertTextFormat: InsertTextFormat.Snippet,
              filterText: _this.getFilterTextForValue(key),
              documentation: ""
            });
          });
        };
        if (node.parent) {
          if (node.parent.type === "property") {
            var parentKey_1 = node.parent.keyNode.value;
            doc.visit(function(n) {
              if (n.type === "property" && n !== node.parent && n.keyNode.value === parentKey_1 && n.valueNode && n.valueNode.type === "object") {
                collectCompletionsForSimilarObject(n.valueNode);
              }
              return true;
            });
          } else if (node.parent.type === "array") {
            node.parent.items.forEach(function(n) {
              if (n.type === "object" && n !== node) {
                collectCompletionsForSimilarObject(n);
              }
            });
          }
        } else if (node.type === "object") {
          collector.add({
            kind: CompletionItemKind.Property,
            label: "$schema",
            insertText: this.getInsertTextForProperty("$schema", void 0, true, ""),
            insertTextFormat: InsertTextFormat.Snippet,
            documentation: "",
            filterText: this.getFilterTextForValue("$schema")
          });
        }
      };
      JSONCompletion2.prototype.getSchemaLessValueCompletions = function(doc, node, offset, document, collector) {
        var _this = this;
        var offsetForSeparator = offset;
        if (node && (node.type === "string" || node.type === "number" || node.type === "boolean" || node.type === "null")) {
          offsetForSeparator = node.offset + node.length;
          node = node.parent;
        }
        if (!node) {
          collector.add({
            kind: this.getSuggestionKind("object"),
            label: "Empty object",
            insertText: this.getInsertTextForValue({}, ""),
            insertTextFormat: InsertTextFormat.Snippet,
            documentation: ""
          });
          collector.add({
            kind: this.getSuggestionKind("array"),
            label: "Empty array",
            insertText: this.getInsertTextForValue([], ""),
            insertTextFormat: InsertTextFormat.Snippet,
            documentation: ""
          });
          return;
        }
        var separatorAfter = this.evaluateSeparatorAfter(document, offsetForSeparator);
        var collectSuggestionsForValues = function(value) {
          if (value.parent && !contains(value.parent, offset, true)) {
            collector.add({
              kind: _this.getSuggestionKind(value.type),
              label: _this.getLabelTextForMatchingNode(value, document),
              insertText: _this.getInsertTextForMatchingNode(value, document, separatorAfter),
              insertTextFormat: InsertTextFormat.Snippet,
              documentation: ""
            });
          }
          if (value.type === "boolean") {
            _this.addBooleanValueCompletion(!value.value, separatorAfter, collector);
          }
        };
        if (node.type === "property") {
          if (offset > (node.colonOffset || 0)) {
            var valueNode = node.valueNode;
            if (valueNode && (offset > valueNode.offset + valueNode.length || valueNode.type === "object" || valueNode.type === "array")) {
              return;
            }
            var parentKey_2 = node.keyNode.value;
            doc.visit(function(n) {
              if (n.type === "property" && n.keyNode.value === parentKey_2 && n.valueNode) {
                collectSuggestionsForValues(n.valueNode);
              }
              return true;
            });
            if (parentKey_2 === "$schema" && node.parent && !node.parent.parent) {
              this.addDollarSchemaCompletions(separatorAfter, collector);
            }
          }
        }
        if (node.type === "array") {
          if (node.parent && node.parent.type === "property") {
            var parentKey_3 = node.parent.keyNode.value;
            doc.visit(function(n) {
              if (n.type === "property" && n.keyNode.value === parentKey_3 && n.valueNode && n.valueNode.type === "array") {
                n.valueNode.items.forEach(collectSuggestionsForValues);
              }
              return true;
            });
          } else {
            node.items.forEach(collectSuggestionsForValues);
          }
        }
      };
      JSONCompletion2.prototype.getValueCompletions = function(schema, doc, node, offset, document, collector, types) {
        var offsetForSeparator = offset;
        var parentKey = void 0;
        var valueNode = void 0;
        if (node && (node.type === "string" || node.type === "number" || node.type === "boolean" || node.type === "null")) {
          offsetForSeparator = node.offset + node.length;
          valueNode = node;
          node = node.parent;
        }
        if (!node) {
          this.addSchemaValueCompletions(schema.schema, "", collector, types);
          return;
        }
        if (node.type === "property" && offset > (node.colonOffset || 0)) {
          var valueNode_1 = node.valueNode;
          if (valueNode_1 && offset > valueNode_1.offset + valueNode_1.length) {
            return;
          }
          parentKey = node.keyNode.value;
          node = node.parent;
        }
        if (node && (parentKey !== void 0 || node.type === "array")) {
          var separatorAfter = this.evaluateSeparatorAfter(document, offsetForSeparator);
          var matchingSchemas = doc.getMatchingSchemas(schema.schema, node.offset, valueNode);
          for (var _i = 0, matchingSchemas_1 = matchingSchemas; _i < matchingSchemas_1.length; _i++) {
            var s = matchingSchemas_1[_i];
            if (s.node === node && !s.inverted && s.schema) {
              if (node.type === "array" && s.schema.items) {
                if (Array.isArray(s.schema.items)) {
                  var index = this.findItemAtOffset(node, document, offset);
                  if (index < s.schema.items.length) {
                    this.addSchemaValueCompletions(s.schema.items[index], separatorAfter, collector, types);
                  }
                } else {
                  this.addSchemaValueCompletions(s.schema.items, separatorAfter, collector, types);
                }
              }
              if (parentKey !== void 0) {
                var propertyMatched = false;
                if (s.schema.properties) {
                  var propertySchema = s.schema.properties[parentKey];
                  if (propertySchema) {
                    propertyMatched = true;
                    this.addSchemaValueCompletions(propertySchema, separatorAfter, collector, types);
                  }
                }
                if (s.schema.patternProperties && !propertyMatched) {
                  for (var _a = 0, _b = Object.keys(s.schema.patternProperties); _a < _b.length; _a++) {
                    var pattern = _b[_a];
                    var regex = extendedRegExp(pattern);
                    if (regex.test(parentKey)) {
                      propertyMatched = true;
                      var propertySchema = s.schema.patternProperties[pattern];
                      this.addSchemaValueCompletions(propertySchema, separatorAfter, collector, types);
                    }
                  }
                }
                if (s.schema.additionalProperties && !propertyMatched) {
                  var propertySchema = s.schema.additionalProperties;
                  this.addSchemaValueCompletions(propertySchema, separatorAfter, collector, types);
                }
              }
            }
          }
          if (parentKey === "$schema" && !node.parent) {
            this.addDollarSchemaCompletions(separatorAfter, collector);
          }
          if (types["boolean"]) {
            this.addBooleanValueCompletion(true, separatorAfter, collector);
            this.addBooleanValueCompletion(false, separatorAfter, collector);
          }
          if (types["null"]) {
            this.addNullValueCompletion(separatorAfter, collector);
          }
        }
      };
      JSONCompletion2.prototype.getContributedValueCompletions = function(doc, node, offset, document, collector, collectionPromises) {
        if (!node) {
          this.contributions.forEach(function(contribution) {
            var collectPromise = contribution.collectDefaultCompletions(document.uri, collector);
            if (collectPromise) {
              collectionPromises.push(collectPromise);
            }
          });
        } else {
          if (node.type === "string" || node.type === "number" || node.type === "boolean" || node.type === "null") {
            node = node.parent;
          }
          if (node && node.type === "property" && offset > (node.colonOffset || 0)) {
            var parentKey_4 = node.keyNode.value;
            var valueNode = node.valueNode;
            if ((!valueNode || offset <= valueNode.offset + valueNode.length) && node.parent) {
              var location_2 = getNodePath(node.parent);
              this.contributions.forEach(function(contribution) {
                var collectPromise = contribution.collectValueCompletions(document.uri, location_2, parentKey_4, collector);
                if (collectPromise) {
                  collectionPromises.push(collectPromise);
                }
              });
            }
          }
        }
      };
      JSONCompletion2.prototype.addSchemaValueCompletions = function(schema, separatorAfter, collector, types) {
        var _this = this;
        if (typeof schema === "object") {
          this.addEnumValueCompletions(schema, separatorAfter, collector);
          this.addDefaultValueCompletions(schema, separatorAfter, collector);
          this.collectTypes(schema, types);
          if (Array.isArray(schema.allOf)) {
            schema.allOf.forEach(function(s) {
              return _this.addSchemaValueCompletions(s, separatorAfter, collector, types);
            });
          }
          if (Array.isArray(schema.anyOf)) {
            schema.anyOf.forEach(function(s) {
              return _this.addSchemaValueCompletions(s, separatorAfter, collector, types);
            });
          }
          if (Array.isArray(schema.oneOf)) {
            schema.oneOf.forEach(function(s) {
              return _this.addSchemaValueCompletions(s, separatorAfter, collector, types);
            });
          }
        }
      };
      JSONCompletion2.prototype.addDefaultValueCompletions = function(schema, separatorAfter, collector, arrayDepth) {
        var _this = this;
        if (arrayDepth === void 0) {
          arrayDepth = 0;
        }
        var hasProposals = false;
        if (isDefined(schema.default)) {
          var type = schema.type;
          var value = schema.default;
          for (var i = arrayDepth; i > 0; i--) {
            value = [value];
            type = "array";
          }
          collector.add({
            kind: this.getSuggestionKind(type),
            label: this.getLabelForValue(value),
            insertText: this.getInsertTextForValue(value, separatorAfter),
            insertTextFormat: InsertTextFormat.Snippet,
            detail: localize$3("json.suggest.default", "Default value")
          });
          hasProposals = true;
        }
        if (Array.isArray(schema.examples)) {
          schema.examples.forEach(function(example) {
            var type2 = schema.type;
            var value2 = example;
            for (var i2 = arrayDepth; i2 > 0; i2--) {
              value2 = [value2];
              type2 = "array";
            }
            collector.add({
              kind: _this.getSuggestionKind(type2),
              label: _this.getLabelForValue(value2),
              insertText: _this.getInsertTextForValue(value2, separatorAfter),
              insertTextFormat: InsertTextFormat.Snippet
            });
            hasProposals = true;
          });
        }
        if (Array.isArray(schema.defaultSnippets)) {
          schema.defaultSnippets.forEach(function(s) {
            var type2 = schema.type;
            var value2 = s.body;
            var label = s.label;
            var insertText;
            var filterText;
            if (isDefined(value2)) {
              schema.type;
              for (var i2 = arrayDepth; i2 > 0; i2--) {
                value2 = [value2];
              }
              insertText = _this.getInsertTextForSnippetValue(value2, separatorAfter);
              filterText = _this.getFilterTextForSnippetValue(value2);
              label = label || _this.getLabelForSnippetValue(value2);
            } else if (typeof s.bodyText === "string") {
              var prefix = "", suffix = "", indent = "";
              for (var i2 = arrayDepth; i2 > 0; i2--) {
                prefix = prefix + indent + "[\n";
                suffix = suffix + "\n" + indent + "]";
                indent += "	";
                type2 = "array";
              }
              insertText = prefix + indent + s.bodyText.split("\n").join("\n" + indent) + suffix + separatorAfter;
              label = label || insertText, filterText = insertText.replace(/[\n]/g, "");
            } else {
              return;
            }
            collector.add({
              kind: _this.getSuggestionKind(type2),
              label,
              documentation: _this.fromMarkup(s.markdownDescription) || s.description,
              insertText,
              insertTextFormat: InsertTextFormat.Snippet,
              filterText
            });
            hasProposals = true;
          });
        }
        if (!hasProposals && typeof schema.items === "object" && !Array.isArray(schema.items) && arrayDepth < 5) {
          this.addDefaultValueCompletions(schema.items, separatorAfter, collector, arrayDepth + 1);
        }
      };
      JSONCompletion2.prototype.addEnumValueCompletions = function(schema, separatorAfter, collector) {
        if (isDefined(schema.const)) {
          collector.add({
            kind: this.getSuggestionKind(schema.type),
            label: this.getLabelForValue(schema.const),
            insertText: this.getInsertTextForValue(schema.const, separatorAfter),
            insertTextFormat: InsertTextFormat.Snippet,
            documentation: this.fromMarkup(schema.markdownDescription) || schema.description
          });
        }
        if (Array.isArray(schema.enum)) {
          for (var i = 0, length = schema.enum.length; i < length; i++) {
            var enm = schema.enum[i];
            var documentation = this.fromMarkup(schema.markdownDescription) || schema.description;
            if (schema.markdownEnumDescriptions && i < schema.markdownEnumDescriptions.length && this.doesSupportMarkdown()) {
              documentation = this.fromMarkup(schema.markdownEnumDescriptions[i]);
            } else if (schema.enumDescriptions && i < schema.enumDescriptions.length) {
              documentation = schema.enumDescriptions[i];
            }
            collector.add({
              kind: this.getSuggestionKind(schema.type),
              label: this.getLabelForValue(enm),
              insertText: this.getInsertTextForValue(enm, separatorAfter),
              insertTextFormat: InsertTextFormat.Snippet,
              documentation
            });
          }
        }
      };
      JSONCompletion2.prototype.collectTypes = function(schema, types) {
        if (Array.isArray(schema.enum) || isDefined(schema.const)) {
          return;
        }
        var type = schema.type;
        if (Array.isArray(type)) {
          type.forEach(function(t) {
            return types[t] = true;
          });
        } else if (type) {
          types[type] = true;
        }
      };
      JSONCompletion2.prototype.addFillerValueCompletions = function(types, separatorAfter, collector) {
        if (types["object"]) {
          collector.add({
            kind: this.getSuggestionKind("object"),
            label: "{}",
            insertText: this.getInsertTextForGuessedValue({}, separatorAfter),
            insertTextFormat: InsertTextFormat.Snippet,
            detail: localize$3("defaults.object", "New object"),
            documentation: ""
          });
        }
        if (types["array"]) {
          collector.add({
            kind: this.getSuggestionKind("array"),
            label: "[]",
            insertText: this.getInsertTextForGuessedValue([], separatorAfter),
            insertTextFormat: InsertTextFormat.Snippet,
            detail: localize$3("defaults.array", "New array"),
            documentation: ""
          });
        }
      };
      JSONCompletion2.prototype.addBooleanValueCompletion = function(value, separatorAfter, collector) {
        collector.add({
          kind: this.getSuggestionKind("boolean"),
          label: value ? "true" : "false",
          insertText: this.getInsertTextForValue(value, separatorAfter),
          insertTextFormat: InsertTextFormat.Snippet,
          documentation: ""
        });
      };
      JSONCompletion2.prototype.addNullValueCompletion = function(separatorAfter, collector) {
        collector.add({
          kind: this.getSuggestionKind("null"),
          label: "null",
          insertText: "null" + separatorAfter,
          insertTextFormat: InsertTextFormat.Snippet,
          documentation: ""
        });
      };
      JSONCompletion2.prototype.addDollarSchemaCompletions = function(separatorAfter, collector) {
        var _this = this;
        var schemaIds = this.schemaService.getRegisteredSchemaIds(function(schema) {
          return schema === "http" || schema === "https";
        });
        schemaIds.forEach(function(schemaId) {
          return collector.add({
            kind: CompletionItemKind.Module,
            label: _this.getLabelForValue(schemaId),
            filterText: _this.getFilterTextForValue(schemaId),
            insertText: _this.getInsertTextForValue(schemaId, separatorAfter),
            insertTextFormat: InsertTextFormat.Snippet,
            documentation: ""
          });
        });
      };
      JSONCompletion2.prototype.getLabelForValue = function(value) {
        return JSON.stringify(value);
      };
      JSONCompletion2.prototype.getFilterTextForValue = function(value) {
        return JSON.stringify(value);
      };
      JSONCompletion2.prototype.getFilterTextForSnippetValue = function(value) {
        return JSON.stringify(value).replace(/\$\{\d+:([^}]+)\}|\$\d+/g, "$1");
      };
      JSONCompletion2.prototype.getLabelForSnippetValue = function(value) {
        var label = JSON.stringify(value);
        return label.replace(/\$\{\d+:([^}]+)\}|\$\d+/g, "$1");
      };
      JSONCompletion2.prototype.getInsertTextForPlainText = function(text) {
        return text.replace(/[\\\$\}]/g, "\\$&");
      };
      JSONCompletion2.prototype.getInsertTextForValue = function(value, separatorAfter) {
        var text = JSON.stringify(value, null, "	");
        if (text === "{}") {
          return "{$1}" + separatorAfter;
        } else if (text === "[]") {
          return "[$1]" + separatorAfter;
        }
        return this.getInsertTextForPlainText(text + separatorAfter);
      };
      JSONCompletion2.prototype.getInsertTextForSnippetValue = function(value, separatorAfter) {
        var replacer = function(value2) {
          if (typeof value2 === "string") {
            if (value2[0] === "^") {
              return value2.substr(1);
            }
          }
          return JSON.stringify(value2);
        };
        return stringifyObject(value, "", replacer) + separatorAfter;
      };
      JSONCompletion2.prototype.getInsertTextForGuessedValue = function(value, separatorAfter) {
        switch (typeof value) {
          case "object":
            if (value === null) {
              return "${1:null}" + separatorAfter;
            }
            return this.getInsertTextForValue(value, separatorAfter);
          case "string":
            var snippetValue = JSON.stringify(value);
            snippetValue = snippetValue.substr(1, snippetValue.length - 2);
            snippetValue = this.getInsertTextForPlainText(snippetValue);
            return '"${1:' + snippetValue + '}"' + separatorAfter;
          case "number":
          case "boolean":
            return "${1:" + JSON.stringify(value) + "}" + separatorAfter;
        }
        return this.getInsertTextForValue(value, separatorAfter);
      };
      JSONCompletion2.prototype.getSuggestionKind = function(type) {
        if (Array.isArray(type)) {
          var array = type;
          type = array.length > 0 ? array[0] : void 0;
        }
        if (!type) {
          return CompletionItemKind.Value;
        }
        switch (type) {
          case "string":
            return CompletionItemKind.Value;
          case "object":
            return CompletionItemKind.Module;
          case "property":
            return CompletionItemKind.Property;
          default:
            return CompletionItemKind.Value;
        }
      };
      JSONCompletion2.prototype.getLabelTextForMatchingNode = function(node, document) {
        switch (node.type) {
          case "array":
            return "[]";
          case "object":
            return "{}";
          default:
            var content = document.getText().substr(node.offset, node.length);
            return content;
        }
      };
      JSONCompletion2.prototype.getInsertTextForMatchingNode = function(node, document, separatorAfter) {
        switch (node.type) {
          case "array":
            return this.getInsertTextForValue([], separatorAfter);
          case "object":
            return this.getInsertTextForValue({}, separatorAfter);
          default:
            var content = document.getText().substr(node.offset, node.length) + separatorAfter;
            return this.getInsertTextForPlainText(content);
        }
      };
      JSONCompletion2.prototype.getInsertTextForProperty = function(key, propertySchema, addValue, separatorAfter) {
        var propertyText = this.getInsertTextForValue(key, "");
        if (!addValue) {
          return propertyText;
        }
        var resultText = propertyText + ": ";
        var value;
        var nValueProposals = 0;
        if (propertySchema) {
          if (Array.isArray(propertySchema.defaultSnippets)) {
            if (propertySchema.defaultSnippets.length === 1) {
              var body = propertySchema.defaultSnippets[0].body;
              if (isDefined(body)) {
                value = this.getInsertTextForSnippetValue(body, "");
              }
            }
            nValueProposals += propertySchema.defaultSnippets.length;
          }
          if (propertySchema.enum) {
            if (!value && propertySchema.enum.length === 1) {
              value = this.getInsertTextForGuessedValue(propertySchema.enum[0], "");
            }
            nValueProposals += propertySchema.enum.length;
          }
          if (isDefined(propertySchema.default)) {
            if (!value) {
              value = this.getInsertTextForGuessedValue(propertySchema.default, "");
            }
            nValueProposals++;
          }
          if (Array.isArray(propertySchema.examples) && propertySchema.examples.length) {
            if (!value) {
              value = this.getInsertTextForGuessedValue(propertySchema.examples[0], "");
            }
            nValueProposals += propertySchema.examples.length;
          }
          if (nValueProposals === 0) {
            var type = Array.isArray(propertySchema.type) ? propertySchema.type[0] : propertySchema.type;
            if (!type) {
              if (propertySchema.properties) {
                type = "object";
              } else if (propertySchema.items) {
                type = "array";
              }
            }
            switch (type) {
              case "boolean":
                value = "$1";
                break;
              case "string":
                value = '"$1"';
                break;
              case "object":
                value = "{$1}";
                break;
              case "array":
                value = "[$1]";
                break;
              case "number":
              case "integer":
                value = "${1:0}";
                break;
              case "null":
                value = "${1:null}";
                break;
              default:
                return propertyText;
            }
          }
        }
        if (!value || nValueProposals > 1) {
          value = "$1";
        }
        return resultText + value + separatorAfter;
      };
      JSONCompletion2.prototype.getCurrentWord = function(document, offset) {
        var i = offset - 1;
        var text = document.getText();
        while (i >= 0 && ' 	\n\r\v":{[,]}'.indexOf(text.charAt(i)) === -1) {
          i--;
        }
        return text.substring(i + 1, offset);
      };
      JSONCompletion2.prototype.evaluateSeparatorAfter = function(document, offset) {
        var scanner = createScanner(document.getText(), true);
        scanner.setPosition(offset);
        var token = scanner.scan();
        switch (token) {
          case 5:
          case 2:
          case 4:
          case 17:
            return "";
          default:
            return ",";
        }
      };
      JSONCompletion2.prototype.findItemAtOffset = function(node, document, offset) {
        var scanner = createScanner(document.getText(), true);
        var children = node.items;
        for (var i = children.length - 1; i >= 0; i--) {
          var child = children[i];
          if (offset > child.offset + child.length) {
            scanner.setPosition(child.offset + child.length);
            var token = scanner.scan();
            if (token === 5 && offset >= scanner.getTokenOffset() + scanner.getTokenLength()) {
              return i + 1;
            }
            return i;
          } else if (offset >= child.offset) {
            return i;
          }
        }
        return 0;
      };
      JSONCompletion2.prototype.isInComment = function(document, start, offset) {
        var scanner = createScanner(document.getText(), false);
        scanner.setPosition(start);
        var token = scanner.scan();
        while (token !== 17 && scanner.getTokenOffset() + scanner.getTokenLength() < offset) {
          token = scanner.scan();
        }
        return (token === 12 || token === 13) && scanner.getTokenOffset() <= offset;
      };
      JSONCompletion2.prototype.fromMarkup = function(markupString) {
        if (markupString && this.doesSupportMarkdown()) {
          return {
            kind: MarkupKind.Markdown,
            value: markupString
          };
        }
        return void 0;
      };
      JSONCompletion2.prototype.doesSupportMarkdown = function() {
        if (!isDefined(this.supportsMarkdown)) {
          var completion = this.clientCapabilities.textDocument && this.clientCapabilities.textDocument.completion;
          this.supportsMarkdown = completion && completion.completionItem && Array.isArray(completion.completionItem.documentationFormat) && completion.completionItem.documentationFormat.indexOf(MarkupKind.Markdown) !== -1;
        }
        return this.supportsMarkdown;
      };
      JSONCompletion2.prototype.doesSupportsCommitCharacters = function() {
        if (!isDefined(this.supportsCommitCharacters)) {
          var completion = this.clientCapabilities.textDocument && this.clientCapabilities.textDocument.completion;
          this.supportsCommitCharacters = completion && completion.completionItem && !!completion.completionItem.commitCharactersSupport;
        }
        return this.supportsCommitCharacters;
      };
      return JSONCompletion2;
    }();

    var JSONHover = function() {
      function JSONHover2(schemaService, contributions, promiseConstructor) {
        if (contributions === void 0) {
          contributions = [];
        }
        this.schemaService = schemaService;
        this.contributions = contributions;
        this.promise = promiseConstructor || Promise;
      }
      JSONHover2.prototype.doHover = function(document, position, doc) {
        var offset = document.offsetAt(position);
        var node = doc.getNodeFromOffset(offset);
        if (!node || (node.type === "object" || node.type === "array") && offset > node.offset + 1 && offset < node.offset + node.length - 1) {
          return this.promise.resolve(null);
        }
        var hoverRangeNode = node;
        if (node.type === "string") {
          var parent = node.parent;
          if (parent && parent.type === "property" && parent.keyNode === node) {
            node = parent.valueNode;
            if (!node) {
              return this.promise.resolve(null);
            }
          }
        }
        var hoverRange = Range.create(document.positionAt(hoverRangeNode.offset), document.positionAt(hoverRangeNode.offset + hoverRangeNode.length));
        var createHover = function(contents) {
          var result = {
            contents,
            range: hoverRange
          };
          return result;
        };
        var location = getNodePath(node);
        for (var i = this.contributions.length - 1; i >= 0; i--) {
          var contribution = this.contributions[i];
          var promise = contribution.getInfoContribution(document.uri, location);
          if (promise) {
            return promise.then(function(htmlContent) {
              return createHover(htmlContent);
            });
          }
        }
        return this.schemaService.getSchemaForResource(document.uri, doc).then(function(schema) {
          if (schema && node) {
            var matchingSchemas = doc.getMatchingSchemas(schema.schema, node.offset);
            var title_1 = void 0;
            var markdownDescription_1 = void 0;
            var markdownEnumValueDescription_1 = void 0, enumValue_1 = void 0;
            matchingSchemas.every(function(s) {
              if (s.node === node && !s.inverted && s.schema) {
                title_1 = title_1 || s.schema.title;
                markdownDescription_1 = markdownDescription_1 || s.schema.markdownDescription || toMarkdown(s.schema.description);
                if (s.schema.enum) {
                  var idx = s.schema.enum.indexOf(getNodeValue(node));
                  if (s.schema.markdownEnumDescriptions) {
                    markdownEnumValueDescription_1 = s.schema.markdownEnumDescriptions[idx];
                  } else if (s.schema.enumDescriptions) {
                    markdownEnumValueDescription_1 = toMarkdown(s.schema.enumDescriptions[idx]);
                  }
                  if (markdownEnumValueDescription_1) {
                    enumValue_1 = s.schema.enum[idx];
                    if (typeof enumValue_1 !== "string") {
                      enumValue_1 = JSON.stringify(enumValue_1);
                    }
                  }
                }
              }
              return true;
            });
            var result = "";
            if (title_1) {
              result = toMarkdown(title_1);
            }
            if (markdownDescription_1) {
              if (result.length > 0) {
                result += "\n\n";
              }
              result += markdownDescription_1;
            }
            if (markdownEnumValueDescription_1) {
              if (result.length > 0) {
                result += "\n\n";
              }
              result += "`" + toMarkdownCodeBlock(enumValue_1) + "`: " + markdownEnumValueDescription_1;
            }
            return createHover([result]);
          }
          return null;
        });
      };
      return JSONHover2;
    }();
    function toMarkdown(plain) {
      if (plain) {
        var res = plain.replace(/([^\n\r])(\r?\n)([^\n\r])/gm, "$1\n\n$3");
        return res.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
      }
      return void 0;
    }
    function toMarkdownCodeBlock(content) {
      if (content.indexOf("`") !== -1) {
        return "`` " + content + " ``";
      }
      return content;
    }

    var LIB;
    LIB = (() => {
      var t = { 470: (t2) => {
        function e2(t3) {
          if (typeof t3 != "string")
            throw new TypeError("Path must be a string. Received " + JSON.stringify(t3));
        }
        function r2(t3, e3) {
          for (var r3, n2 = "", o = 0, i = -1, a = 0, h = 0; h <= t3.length; ++h) {
            if (h < t3.length)
              r3 = t3.charCodeAt(h);
            else {
              if (r3 === 47)
                break;
              r3 = 47;
            }
            if (r3 === 47) {
              if (i === h - 1 || a === 1)
                ;
              else if (i !== h - 1 && a === 2) {
                if (n2.length < 2 || o !== 2 || n2.charCodeAt(n2.length - 1) !== 46 || n2.charCodeAt(n2.length - 2) !== 46) {
                  if (n2.length > 2) {
                    var s = n2.lastIndexOf("/");
                    if (s !== n2.length - 1) {
                      s === -1 ? (n2 = "", o = 0) : o = (n2 = n2.slice(0, s)).length - 1 - n2.lastIndexOf("/"), i = h, a = 0;
                      continue;
                    }
                  } else if (n2.length === 2 || n2.length === 1) {
                    n2 = "", o = 0, i = h, a = 0;
                    continue;
                  }
                }
                e3 && (n2.length > 0 ? n2 += "/.." : n2 = "..", o = 2);
              } else
                n2.length > 0 ? n2 += "/" + t3.slice(i + 1, h) : n2 = t3.slice(i + 1, h), o = h - i - 1;
              i = h, a = 0;
            } else
              r3 === 46 && a !== -1 ? ++a : a = -1;
          }
          return n2;
        }
        var n = { resolve: function() {
          for (var t3, n2 = "", o = false, i = arguments.length - 1; i >= -1 && !o; i--) {
            var a;
            i >= 0 ? a = arguments[i] : (t3 === void 0 && (t3 = process.cwd()), a = t3), e2(a), a.length !== 0 && (n2 = a + "/" + n2, o = a.charCodeAt(0) === 47);
          }
          return n2 = r2(n2, !o), o ? n2.length > 0 ? "/" + n2 : "/" : n2.length > 0 ? n2 : ".";
        }, normalize: function(t3) {
          if (e2(t3), t3.length === 0)
            return ".";
          var n2 = t3.charCodeAt(0) === 47, o = t3.charCodeAt(t3.length - 1) === 47;
          return (t3 = r2(t3, !n2)).length !== 0 || n2 || (t3 = "."), t3.length > 0 && o && (t3 += "/"), n2 ? "/" + t3 : t3;
        }, isAbsolute: function(t3) {
          return e2(t3), t3.length > 0 && t3.charCodeAt(0) === 47;
        }, join: function() {
          if (arguments.length === 0)
            return ".";
          for (var t3, r3 = 0; r3 < arguments.length; ++r3) {
            var o = arguments[r3];
            e2(o), o.length > 0 && (t3 === void 0 ? t3 = o : t3 += "/" + o);
          }
          return t3 === void 0 ? "." : n.normalize(t3);
        }, relative: function(t3, r3) {
          if (e2(t3), e2(r3), t3 === r3)
            return "";
          if ((t3 = n.resolve(t3)) === (r3 = n.resolve(r3)))
            return "";
          for (var o = 1; o < t3.length && t3.charCodeAt(o) === 47; ++o)
            ;
          for (var i = t3.length, a = i - o, h = 1; h < r3.length && r3.charCodeAt(h) === 47; ++h)
            ;
          for (var s = r3.length - h, f = a < s ? a : s, u = -1, c = 0; c <= f; ++c) {
            if (c === f) {
              if (s > f) {
                if (r3.charCodeAt(h + c) === 47)
                  return r3.slice(h + c + 1);
                if (c === 0)
                  return r3.slice(h + c);
              } else
                a > f && (t3.charCodeAt(o + c) === 47 ? u = c : c === 0 && (u = 0));
              break;
            }
            var l = t3.charCodeAt(o + c);
            if (l !== r3.charCodeAt(h + c))
              break;
            l === 47 && (u = c);
          }
          var p = "";
          for (c = o + u + 1; c <= i; ++c)
            c !== i && t3.charCodeAt(c) !== 47 || (p.length === 0 ? p += ".." : p += "/..");
          return p.length > 0 ? p + r3.slice(h + u) : (h += u, r3.charCodeAt(h) === 47 && ++h, r3.slice(h));
        }, _makeLong: function(t3) {
          return t3;
        }, dirname: function(t3) {
          if (e2(t3), t3.length === 0)
            return ".";
          for (var r3 = t3.charCodeAt(0), n2 = r3 === 47, o = -1, i = true, a = t3.length - 1; a >= 1; --a)
            if ((r3 = t3.charCodeAt(a)) === 47) {
              if (!i) {
                o = a;
                break;
              }
            } else
              i = false;
          return o === -1 ? n2 ? "/" : "." : n2 && o === 1 ? "//" : t3.slice(0, o);
        }, basename: function(t3, r3) {
          if (r3 !== void 0 && typeof r3 != "string")
            throw new TypeError('"ext" argument must be a string');
          e2(t3);
          var n2, o = 0, i = -1, a = true;
          if (r3 !== void 0 && r3.length > 0 && r3.length <= t3.length) {
            if (r3.length === t3.length && r3 === t3)
              return "";
            var h = r3.length - 1, s = -1;
            for (n2 = t3.length - 1; n2 >= 0; --n2) {
              var f = t3.charCodeAt(n2);
              if (f === 47) {
                if (!a) {
                  o = n2 + 1;
                  break;
                }
              } else
                s === -1 && (a = false, s = n2 + 1), h >= 0 && (f === r3.charCodeAt(h) ? --h == -1 && (i = n2) : (h = -1, i = s));
            }
            return o === i ? i = s : i === -1 && (i = t3.length), t3.slice(o, i);
          }
          for (n2 = t3.length - 1; n2 >= 0; --n2)
            if (t3.charCodeAt(n2) === 47) {
              if (!a) {
                o = n2 + 1;
                break;
              }
            } else
              i === -1 && (a = false, i = n2 + 1);
          return i === -1 ? "" : t3.slice(o, i);
        }, extname: function(t3) {
          e2(t3);
          for (var r3 = -1, n2 = 0, o = -1, i = true, a = 0, h = t3.length - 1; h >= 0; --h) {
            var s = t3.charCodeAt(h);
            if (s !== 47)
              o === -1 && (i = false, o = h + 1), s === 46 ? r3 === -1 ? r3 = h : a !== 1 && (a = 1) : r3 !== -1 && (a = -1);
            else if (!i) {
              n2 = h + 1;
              break;
            }
          }
          return r3 === -1 || o === -1 || a === 0 || a === 1 && r3 === o - 1 && r3 === n2 + 1 ? "" : t3.slice(r3, o);
        }, format: function(t3) {
          if (t3 === null || typeof t3 != "object")
            throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof t3);
          return function(t4, e3) {
            var r3 = e3.dir || e3.root, n2 = e3.base || (e3.name || "") + (e3.ext || "");
            return r3 ? r3 === e3.root ? r3 + n2 : r3 + "/" + n2 : n2;
          }(0, t3);
        }, parse: function(t3) {
          e2(t3);
          var r3 = { root: "", dir: "", base: "", ext: "", name: "" };
          if (t3.length === 0)
            return r3;
          var n2, o = t3.charCodeAt(0), i = o === 47;
          i ? (r3.root = "/", n2 = 1) : n2 = 0;
          for (var a = -1, h = 0, s = -1, f = true, u = t3.length - 1, c = 0; u >= n2; --u)
            if ((o = t3.charCodeAt(u)) !== 47)
              s === -1 && (f = false, s = u + 1), o === 46 ? a === -1 ? a = u : c !== 1 && (c = 1) : a !== -1 && (c = -1);
            else if (!f) {
              h = u + 1;
              break;
            }
          return a === -1 || s === -1 || c === 0 || c === 1 && a === s - 1 && a === h + 1 ? s !== -1 && (r3.base = r3.name = h === 0 && i ? t3.slice(1, s) : t3.slice(h, s)) : (h === 0 && i ? (r3.name = t3.slice(1, a), r3.base = t3.slice(1, s)) : (r3.name = t3.slice(h, a), r3.base = t3.slice(h, s)), r3.ext = t3.slice(a, s)), h > 0 ? r3.dir = t3.slice(0, h - 1) : i && (r3.dir = "/"), r3;
        }, sep: "/", delimiter: ":", win32: null, posix: null };
        n.posix = n, t2.exports = n;
      }, 447: (t2, e2, r2) => {
        var n;
        if (r2.r(e2), r2.d(e2, { URI: () => g, Utils: () => O }), typeof process == "object")
          n = process.platform === "win32";
        else if (typeof navigator == "object") {
          var o = navigator.userAgent;
          n = o.indexOf("Windows") >= 0;
        }
        var i, a, h = (i = function(t3, e3) {
          return (i = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t4, e4) {
            t4.__proto__ = e4;
          } || function(t4, e4) {
            for (var r3 in e4)
              Object.prototype.hasOwnProperty.call(e4, r3) && (t4[r3] = e4[r3]);
          })(t3, e3);
        }, function(t3, e3) {
          function r3() {
            this.constructor = t3;
          }
          i(t3, e3), t3.prototype = e3 === null ? Object.create(e3) : (r3.prototype = e3.prototype, new r3());
        }), s = /^\w[\w\d+.-]*$/, f = /^\//, u = /^\/\//, c = "", l = "/", p = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/, g = function() {
          function t3(t4, e3, r3, n2, o2, i2) {
            i2 === void 0 && (i2 = false), typeof t4 == "object" ? (this.scheme = t4.scheme || c, this.authority = t4.authority || c, this.path = t4.path || c, this.query = t4.query || c, this.fragment = t4.fragment || c) : (this.scheme = function(t5, e4) {
              return t5 || e4 ? t5 : "file";
            }(t4, i2), this.authority = e3 || c, this.path = function(t5, e4) {
              switch (t5) {
                case "https":
                case "http":
                case "file":
                  e4 ? e4[0] !== l && (e4 = l + e4) : e4 = l;
              }
              return e4;
            }(this.scheme, r3 || c), this.query = n2 || c, this.fragment = o2 || c, function(t5, e4) {
              if (!t5.scheme && e4)
                throw new Error('[UriError]: Scheme is missing: {scheme: "", authority: "' + t5.authority + '", path: "' + t5.path + '", query: "' + t5.query + '", fragment: "' + t5.fragment + '"}');
              if (t5.scheme && !s.test(t5.scheme))
                throw new Error("[UriError]: Scheme contains illegal characters.");
              if (t5.path) {
                if (t5.authority) {
                  if (!f.test(t5.path))
                    throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
                } else if (u.test(t5.path))
                  throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
              }
            }(this, i2));
          }
          return t3.isUri = function(e3) {
            return e3 instanceof t3 || !!e3 && typeof e3.authority == "string" && typeof e3.fragment == "string" && typeof e3.path == "string" && typeof e3.query == "string" && typeof e3.scheme == "string" && typeof e3.fsPath == "function" && typeof e3.with == "function" && typeof e3.toString == "function";
          }, Object.defineProperty(t3.prototype, "fsPath", { get: function() {
            return C(this, false);
          }, enumerable: false, configurable: true }), t3.prototype.with = function(t4) {
            if (!t4)
              return this;
            var e3 = t4.scheme, r3 = t4.authority, n2 = t4.path, o2 = t4.query, i2 = t4.fragment;
            return e3 === void 0 ? e3 = this.scheme : e3 === null && (e3 = c), r3 === void 0 ? r3 = this.authority : r3 === null && (r3 = c), n2 === void 0 ? n2 = this.path : n2 === null && (n2 = c), o2 === void 0 ? o2 = this.query : o2 === null && (o2 = c), i2 === void 0 ? i2 = this.fragment : i2 === null && (i2 = c), e3 === this.scheme && r3 === this.authority && n2 === this.path && o2 === this.query && i2 === this.fragment ? this : new v(e3, r3, n2, o2, i2);
          }, t3.parse = function(t4, e3) {
            e3 === void 0 && (e3 = false);
            var r3 = p.exec(t4);
            return r3 ? new v(r3[2] || c, x(r3[4] || c), x(r3[5] || c), x(r3[7] || c), x(r3[9] || c), e3) : new v(c, c, c, c, c);
          }, t3.file = function(t4) {
            var e3 = c;
            if (n && (t4 = t4.replace(/\\/g, l)), t4[0] === l && t4[1] === l) {
              var r3 = t4.indexOf(l, 2);
              r3 === -1 ? (e3 = t4.substring(2), t4 = l) : (e3 = t4.substring(2, r3), t4 = t4.substring(r3) || l);
            }
            return new v("file", e3, t4, c, c);
          }, t3.from = function(t4) {
            return new v(t4.scheme, t4.authority, t4.path, t4.query, t4.fragment);
          }, t3.prototype.toString = function(t4) {
            return t4 === void 0 && (t4 = false), A(this, t4);
          }, t3.prototype.toJSON = function() {
            return this;
          }, t3.revive = function(e3) {
            if (e3) {
              if (e3 instanceof t3)
                return e3;
              var r3 = new v(e3);
              return r3._formatted = e3.external, r3._fsPath = e3._sep === d ? e3.fsPath : null, r3;
            }
            return e3;
          }, t3;
        }(), d = n ? 1 : void 0, v = function(t3) {
          function e3() {
            var e4 = t3 !== null && t3.apply(this, arguments) || this;
            return e4._formatted = null, e4._fsPath = null, e4;
          }
          return h(e3, t3), Object.defineProperty(e3.prototype, "fsPath", { get: function() {
            return this._fsPath || (this._fsPath = C(this, false)), this._fsPath;
          }, enumerable: false, configurable: true }), e3.prototype.toString = function(t4) {
            return t4 === void 0 && (t4 = false), t4 ? A(this, true) : (this._formatted || (this._formatted = A(this, false)), this._formatted);
          }, e3.prototype.toJSON = function() {
            var t4 = { $mid: 1 };
            return this._fsPath && (t4.fsPath = this._fsPath, t4._sep = d), this._formatted && (t4.external = this._formatted), this.path && (t4.path = this.path), this.scheme && (t4.scheme = this.scheme), this.authority && (t4.authority = this.authority), this.query && (t4.query = this.query), this.fragment && (t4.fragment = this.fragment), t4;
          }, e3;
        }(g), m = ((a = {})[58] = "%3A", a[47] = "%2F", a[63] = "%3F", a[35] = "%23", a[91] = "%5B", a[93] = "%5D", a[64] = "%40", a[33] = "%21", a[36] = "%24", a[38] = "%26", a[39] = "%27", a[40] = "%28", a[41] = "%29", a[42] = "%2A", a[43] = "%2B", a[44] = "%2C", a[59] = "%3B", a[61] = "%3D", a[32] = "%20", a);
        function y(t3, e3) {
          for (var r3 = void 0, n2 = -1, o2 = 0; o2 < t3.length; o2++) {
            var i2 = t3.charCodeAt(o2);
            if (i2 >= 97 && i2 <= 122 || i2 >= 65 && i2 <= 90 || i2 >= 48 && i2 <= 57 || i2 === 45 || i2 === 46 || i2 === 95 || i2 === 126 || e3 && i2 === 47)
              n2 !== -1 && (r3 += encodeURIComponent(t3.substring(n2, o2)), n2 = -1), r3 !== void 0 && (r3 += t3.charAt(o2));
            else {
              r3 === void 0 && (r3 = t3.substr(0, o2));
              var a2 = m[i2];
              a2 !== void 0 ? (n2 !== -1 && (r3 += encodeURIComponent(t3.substring(n2, o2)), n2 = -1), r3 += a2) : n2 === -1 && (n2 = o2);
            }
          }
          return n2 !== -1 && (r3 += encodeURIComponent(t3.substring(n2))), r3 !== void 0 ? r3 : t3;
        }
        function b(t3) {
          for (var e3 = void 0, r3 = 0; r3 < t3.length; r3++) {
            var n2 = t3.charCodeAt(r3);
            n2 === 35 || n2 === 63 ? (e3 === void 0 && (e3 = t3.substr(0, r3)), e3 += m[n2]) : e3 !== void 0 && (e3 += t3[r3]);
          }
          return e3 !== void 0 ? e3 : t3;
        }
        function C(t3, e3) {
          var r3;
          return r3 = t3.authority && t3.path.length > 1 && t3.scheme === "file" ? "//" + t3.authority + t3.path : t3.path.charCodeAt(0) === 47 && (t3.path.charCodeAt(1) >= 65 && t3.path.charCodeAt(1) <= 90 || t3.path.charCodeAt(1) >= 97 && t3.path.charCodeAt(1) <= 122) && t3.path.charCodeAt(2) === 58 ? e3 ? t3.path.substr(1) : t3.path[1].toLowerCase() + t3.path.substr(2) : t3.path, n && (r3 = r3.replace(/\//g, "\\")), r3;
        }
        function A(t3, e3) {
          var r3 = e3 ? b : y, n2 = "", o2 = t3.scheme, i2 = t3.authority, a2 = t3.path, h2 = t3.query, s2 = t3.fragment;
          if (o2 && (n2 += o2, n2 += ":"), (i2 || o2 === "file") && (n2 += l, n2 += l), i2) {
            var f2 = i2.indexOf("@");
            if (f2 !== -1) {
              var u2 = i2.substr(0, f2);
              i2 = i2.substr(f2 + 1), (f2 = u2.indexOf(":")) === -1 ? n2 += r3(u2, false) : (n2 += r3(u2.substr(0, f2), false), n2 += ":", n2 += r3(u2.substr(f2 + 1), false)), n2 += "@";
            }
            (f2 = (i2 = i2.toLowerCase()).indexOf(":")) === -1 ? n2 += r3(i2, false) : (n2 += r3(i2.substr(0, f2), false), n2 += i2.substr(f2));
          }
          if (a2) {
            if (a2.length >= 3 && a2.charCodeAt(0) === 47 && a2.charCodeAt(2) === 58)
              (c2 = a2.charCodeAt(1)) >= 65 && c2 <= 90 && (a2 = "/" + String.fromCharCode(c2 + 32) + ":" + a2.substr(3));
            else if (a2.length >= 2 && a2.charCodeAt(1) === 58) {
              var c2;
              (c2 = a2.charCodeAt(0)) >= 65 && c2 <= 90 && (a2 = String.fromCharCode(c2 + 32) + ":" + a2.substr(2));
            }
            n2 += r3(a2, true);
          }
          return h2 && (n2 += "?", n2 += r3(h2, false)), s2 && (n2 += "#", n2 += e3 ? s2 : y(s2, false)), n2;
        }
        function w(t3) {
          try {
            return decodeURIComponent(t3);
          } catch (e3) {
            return t3.length > 3 ? t3.substr(0, 3) + w(t3.substr(3)) : t3;
          }
        }
        var _ = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
        function x(t3) {
          return t3.match(_) ? t3.replace(_, function(t4) {
            return w(t4);
          }) : t3;
        }
        var O, P = r2(470), j = function() {
          for (var t3 = 0, e3 = 0, r3 = arguments.length; e3 < r3; e3++)
            t3 += arguments[e3].length;
          var n2 = Array(t3), o2 = 0;
          for (e3 = 0; e3 < r3; e3++)
            for (var i2 = arguments[e3], a2 = 0, h2 = i2.length; a2 < h2; a2++, o2++)
              n2[o2] = i2[a2];
          return n2;
        }, U = P.posix || P;
        !function(t3) {
          t3.joinPath = function(t4) {
            for (var e3 = [], r3 = 1; r3 < arguments.length; r3++)
              e3[r3 - 1] = arguments[r3];
            return t4.with({ path: U.join.apply(U, j([t4.path], e3)) });
          }, t3.resolvePath = function(t4) {
            for (var e3 = [], r3 = 1; r3 < arguments.length; r3++)
              e3[r3 - 1] = arguments[r3];
            var n2 = t4.path || "/";
            return t4.with({ path: U.resolve.apply(U, j([n2], e3)) });
          }, t3.dirname = function(t4) {
            var e3 = U.dirname(t4.path);
            return e3.length === 1 && e3.charCodeAt(0) === 46 ? t4 : t4.with({ path: e3 });
          }, t3.basename = function(t4) {
            return U.basename(t4.path);
          }, t3.extname = function(t4) {
            return U.extname(t4.path);
          };
        }(O || (O = {}));
      } }, e = {};
      function r(n) {
        if (e[n])
          return e[n].exports;
        var o = e[n] = { exports: {} };
        return t[n](o, o.exports, r), o.exports;
      }
      return r.d = (t2, e2) => {
        for (var n in e2)
          r.o(e2, n) && !r.o(t2, n) && Object.defineProperty(t2, n, { enumerable: true, get: e2[n] });
      }, r.o = (t2, e2) => Object.prototype.hasOwnProperty.call(t2, e2), r.r = (t2) => {
        typeof Symbol != "undefined" && Symbol.toStringTag && Object.defineProperty(t2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(t2, "__esModule", { value: true });
      }, r(447);
    })();
    const { URI, Utils } = LIB;

    function createRegex(glob, opts) {
      if (typeof glob !== "string") {
        throw new TypeError("Expected a string");
      }
      var str = String(glob);
      var reStr = "";
      var extended = opts ? !!opts.extended : false;
      var globstar = opts ? !!opts.globstar : false;
      var inGroup = false;
      var flags = opts && typeof opts.flags === "string" ? opts.flags : "";
      var c;
      for (var i = 0, len = str.length; i < len; i++) {
        c = str[i];
        switch (c) {
          case "/":
          case "$":
          case "^":
          case "+":
          case ".":
          case "(":
          case ")":
          case "=":
          case "!":
          case "|":
            reStr += "\\" + c;
            break;
          case "?":
            if (extended) {
              reStr += ".";
              break;
            }
          case "[":
          case "]":
            if (extended) {
              reStr += c;
              break;
            }
          case "{":
            if (extended) {
              inGroup = true;
              reStr += "(";
              break;
            }
          case "}":
            if (extended) {
              inGroup = false;
              reStr += ")";
              break;
            }
          case ",":
            if (inGroup) {
              reStr += "|";
              break;
            }
            reStr += "\\" + c;
            break;
          case "*":
            var prevChar = str[i - 1];
            var starCount = 1;
            while (str[i + 1] === "*") {
              starCount++;
              i++;
            }
            var nextChar = str[i + 1];
            if (!globstar) {
              reStr += ".*";
            } else {
              var isGlobstar = starCount > 1 && (prevChar === "/" || prevChar === void 0 || prevChar === "{" || prevChar === ",") && (nextChar === "/" || nextChar === void 0 || nextChar === "," || nextChar === "}");
              if (isGlobstar) {
                if (nextChar === "/") {
                  i++;
                } else if (prevChar === "/" && reStr.endsWith("\\/")) {
                  reStr = reStr.substr(0, reStr.length - 2);
                }
                reStr += "((?:[^/]*(?:/|$))*)";
              } else {
                reStr += "([^/]*)";
              }
            }
            break;
          default:
            reStr += c;
        }
      }
      if (!flags || !~flags.indexOf("g")) {
        reStr = "^" + reStr + "$";
      }
      return new RegExp(reStr, flags);
    }

    var localize$2 = loadMessageBundle();
    var BANG = "!";
    var PATH_SEP = "/";
    var FilePatternAssociation = function() {
      function FilePatternAssociation2(pattern, uris) {
        this.globWrappers = [];
        try {
          for (var _i = 0, pattern_1 = pattern; _i < pattern_1.length; _i++) {
            var patternString = pattern_1[_i];
            var include = patternString[0] !== BANG;
            if (!include) {
              patternString = patternString.substring(1);
            }
            if (patternString.length > 0) {
              if (patternString[0] === PATH_SEP) {
                patternString = patternString.substring(1);
              }
              this.globWrappers.push({
                regexp: createRegex("**/" + patternString, { extended: true, globstar: true }),
                include
              });
            }
          }
          ;
          this.uris = uris;
        } catch (e) {
          this.globWrappers.length = 0;
          this.uris = [];
        }
      }
      FilePatternAssociation2.prototype.matchesPattern = function(fileName) {
        var match = false;
        for (var _i = 0, _a = this.globWrappers; _i < _a.length; _i++) {
          var _b = _a[_i], regexp = _b.regexp, include = _b.include;
          if (regexp.test(fileName)) {
            match = include;
          }
        }
        return match;
      };
      FilePatternAssociation2.prototype.getURIs = function() {
        return this.uris;
      };
      return FilePatternAssociation2;
    }();
    var SchemaHandle = function() {
      function SchemaHandle2(service, url, unresolvedSchemaContent) {
        this.service = service;
        this.url = url;
        this.dependencies = {};
        if (unresolvedSchemaContent) {
          this.unresolvedSchema = this.service.promise.resolve(new UnresolvedSchema(unresolvedSchemaContent));
        }
      }
      SchemaHandle2.prototype.getUnresolvedSchema = function() {
        if (!this.unresolvedSchema) {
          this.unresolvedSchema = this.service.loadSchema(this.url);
        }
        return this.unresolvedSchema;
      };
      SchemaHandle2.prototype.getResolvedSchema = function() {
        var _this = this;
        if (!this.resolvedSchema) {
          this.resolvedSchema = this.getUnresolvedSchema().then(function(unresolved) {
            return _this.service.resolveSchemaContent(unresolved, _this.url, _this.dependencies);
          });
        }
        return this.resolvedSchema;
      };
      SchemaHandle2.prototype.clearSchema = function() {
        this.resolvedSchema = void 0;
        this.unresolvedSchema = void 0;
        this.dependencies = {};
      };
      return SchemaHandle2;
    }();
    var UnresolvedSchema = function() {
      function UnresolvedSchema2(schema, errors) {
        if (errors === void 0) {
          errors = [];
        }
        this.schema = schema;
        this.errors = errors;
      }
      return UnresolvedSchema2;
    }();
    var ResolvedSchema = function() {
      function ResolvedSchema2(schema, errors) {
        if (errors === void 0) {
          errors = [];
        }
        this.schema = schema;
        this.errors = errors;
      }
      ResolvedSchema2.prototype.getSection = function(path) {
        var schemaRef = this.getSectionRecursive(path, this.schema);
        if (schemaRef) {
          return asSchema(schemaRef);
        }
        return void 0;
      };
      ResolvedSchema2.prototype.getSectionRecursive = function(path, schema) {
        if (!schema || typeof schema === "boolean" || path.length === 0) {
          return schema;
        }
        var next = path.shift();
        if (schema.properties && typeof schema.properties[next]) {
          return this.getSectionRecursive(path, schema.properties[next]);
        } else if (schema.patternProperties) {
          for (var _i = 0, _a = Object.keys(schema.patternProperties); _i < _a.length; _i++) {
            var pattern = _a[_i];
            var regex = extendedRegExp(pattern);
            if (regex.test(next)) {
              return this.getSectionRecursive(path, schema.patternProperties[pattern]);
            }
          }
        } else if (typeof schema.additionalProperties === "object") {
          return this.getSectionRecursive(path, schema.additionalProperties);
        } else if (next.match("[0-9]+")) {
          if (Array.isArray(schema.items)) {
            var index = parseInt(next, 10);
            if (!isNaN(index) && schema.items[index]) {
              return this.getSectionRecursive(path, schema.items[index]);
            }
          } else if (schema.items) {
            return this.getSectionRecursive(path, schema.items);
          }
        }
        return void 0;
      };
      return ResolvedSchema2;
    }();
    var JSONSchemaService = function() {
      function JSONSchemaService2(requestService, contextService, promiseConstructor) {
        this.contextService = contextService;
        this.requestService = requestService;
        this.promiseConstructor = promiseConstructor || Promise;
        this.callOnDispose = [];
        this.contributionSchemas = {};
        this.contributionAssociations = [];
        this.schemasById = {};
        this.filePatternAssociations = [];
        this.registeredSchemasIds = {};
      }
      JSONSchemaService2.prototype.getRegisteredSchemaIds = function(filter) {
        return Object.keys(this.registeredSchemasIds).filter(function(id) {
          var scheme = URI.parse(id).scheme;
          return scheme !== "schemaservice" && (!filter || filter(scheme));
        });
      };
      Object.defineProperty(JSONSchemaService2.prototype, "promise", {
        get: function() {
          return this.promiseConstructor;
        },
        enumerable: false,
        configurable: true
      });
      JSONSchemaService2.prototype.dispose = function() {
        while (this.callOnDispose.length > 0) {
          this.callOnDispose.pop()();
        }
      };
      JSONSchemaService2.prototype.onResourceChange = function(uri) {
        var _this = this;
        var hasChanges = false;
        uri = normalizeId(uri);
        var toWalk = [uri];
        var all = Object.keys(this.schemasById).map(function(key) {
          return _this.schemasById[key];
        });
        while (toWalk.length) {
          var curr = toWalk.pop();
          for (var i = 0; i < all.length; i++) {
            var handle = all[i];
            if (handle && (handle.url === curr || handle.dependencies[curr])) {
              if (handle.url !== curr) {
                toWalk.push(handle.url);
              }
              handle.clearSchema();
              all[i] = void 0;
              hasChanges = true;
            }
          }
        }
        return hasChanges;
      };
      JSONSchemaService2.prototype.setSchemaContributions = function(schemaContributions) {
        if (schemaContributions.schemas) {
          var schemas = schemaContributions.schemas;
          for (var id in schemas) {
            var normalizedId = normalizeId(id);
            this.contributionSchemas[normalizedId] = this.addSchemaHandle(normalizedId, schemas[id]);
          }
        }
        if (Array.isArray(schemaContributions.schemaAssociations)) {
          var schemaAssociations = schemaContributions.schemaAssociations;
          for (var _i = 0, schemaAssociations_1 = schemaAssociations; _i < schemaAssociations_1.length; _i++) {
            var schemaAssociation = schemaAssociations_1[_i];
            var uris = schemaAssociation.uris.map(normalizeId);
            var association = this.addFilePatternAssociation(schemaAssociation.pattern, uris);
            this.contributionAssociations.push(association);
          }
        }
      };
      JSONSchemaService2.prototype.addSchemaHandle = function(id, unresolvedSchemaContent) {
        var schemaHandle = new SchemaHandle(this, id, unresolvedSchemaContent);
        this.schemasById[id] = schemaHandle;
        return schemaHandle;
      };
      JSONSchemaService2.prototype.getOrAddSchemaHandle = function(id, unresolvedSchemaContent) {
        return this.schemasById[id] || this.addSchemaHandle(id, unresolvedSchemaContent);
      };
      JSONSchemaService2.prototype.addFilePatternAssociation = function(pattern, uris) {
        var fpa = new FilePatternAssociation(pattern, uris);
        this.filePatternAssociations.push(fpa);
        return fpa;
      };
      JSONSchemaService2.prototype.registerExternalSchema = function(uri, filePatterns, unresolvedSchemaContent) {
        var id = normalizeId(uri);
        this.registeredSchemasIds[id] = true;
        this.cachedSchemaForResource = void 0;
        if (filePatterns) {
          this.addFilePatternAssociation(filePatterns, [uri]);
        }
        return unresolvedSchemaContent ? this.addSchemaHandle(id, unresolvedSchemaContent) : this.getOrAddSchemaHandle(id);
      };
      JSONSchemaService2.prototype.clearExternalSchemas = function() {
        this.schemasById = {};
        this.filePatternAssociations = [];
        this.registeredSchemasIds = {};
        this.cachedSchemaForResource = void 0;
        for (var id in this.contributionSchemas) {
          this.schemasById[id] = this.contributionSchemas[id];
          this.registeredSchemasIds[id] = true;
        }
        for (var _i = 0, _a = this.contributionAssociations; _i < _a.length; _i++) {
          var contributionAssociation = _a[_i];
          this.filePatternAssociations.push(contributionAssociation);
        }
      };
      JSONSchemaService2.prototype.getResolvedSchema = function(schemaId) {
        var id = normalizeId(schemaId);
        var schemaHandle = this.schemasById[id];
        if (schemaHandle) {
          return schemaHandle.getResolvedSchema();
        }
        return this.promise.resolve(void 0);
      };
      JSONSchemaService2.prototype.loadSchema = function(url) {
        if (!this.requestService) {
          var errorMessage = localize$2("json.schema.norequestservice", "Unable to load schema from '{0}'. No schema request service available", toDisplayString(url));
          return this.promise.resolve(new UnresolvedSchema({}, [errorMessage]));
        }
        return this.requestService(url).then(function(content) {
          if (!content) {
            var errorMessage2 = localize$2("json.schema.nocontent", "Unable to load schema from '{0}': No content.", toDisplayString(url));
            return new UnresolvedSchema({}, [errorMessage2]);
          }
          var schemaContent = {};
          var jsonErrors = [];
          schemaContent = parse$1(content, jsonErrors);
          var errors = jsonErrors.length ? [localize$2("json.schema.invalidFormat", "Unable to parse content from '{0}': Parse error at offset {1}.", toDisplayString(url), jsonErrors[0].offset)] : [];
          return new UnresolvedSchema(schemaContent, errors);
        }, function(error) {
          var errorMessage2 = error.toString();
          var errorSplit = error.toString().split("Error: ");
          if (errorSplit.length > 1) {
            errorMessage2 = errorSplit[1];
          }
          if (endsWith(errorMessage2, ".")) {
            errorMessage2 = errorMessage2.substr(0, errorMessage2.length - 1);
          }
          return new UnresolvedSchema({}, [localize$2("json.schema.nocontent", "Unable to load schema from '{0}': {1}.", toDisplayString(url), errorMessage2)]);
        });
      };
      JSONSchemaService2.prototype.resolveSchemaContent = function(schemaToResolve, schemaURL, dependencies) {
        var _this = this;
        var resolveErrors = schemaToResolve.errors.slice(0);
        var schema = schemaToResolve.schema;
        if (schema.$schema) {
          var id = normalizeId(schema.$schema);
          if (id === "http://json-schema.org/draft-03/schema") {
            return this.promise.resolve(new ResolvedSchema({}, [localize$2("json.schema.draft03.notsupported", "Draft-03 schemas are not supported.")]));
          } else if (id === "https://json-schema.org/draft/2019-09/schema") {
            resolveErrors.push(localize$2("json.schema.draft201909.notsupported", "Draft 2019-09 schemas are not yet fully supported."));
          }
        }
        var contextService = this.contextService;
        var findSection = function(schema2, path) {
          if (!path) {
            return schema2;
          }
          var current = schema2;
          if (path[0] === "/") {
            path = path.substr(1);
          }
          path.split("/").some(function(part) {
            part = part.replace(/~1/g, "/").replace(/~0/g, "~");
            current = current[part];
            return !current;
          });
          return current;
        };
        var merge = function(target, sourceRoot, sourceURI, refSegment) {
          var path = refSegment ? decodeURIComponent(refSegment) : void 0;
          var section = findSection(sourceRoot, path);
          if (section) {
            for (var key in section) {
              if (section.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
                target[key] = section[key];
              }
            }
          } else {
            resolveErrors.push(localize$2("json.schema.invalidref", "$ref '{0}' in '{1}' can not be resolved.", path, sourceURI));
          }
        };
        var resolveExternalLink = function(node, uri, refSegment, parentSchemaURL, parentSchemaDependencies) {
          if (contextService && !/^[A-Za-z][A-Za-z0-9+\-.+]*:\/\/.*/.test(uri)) {
            uri = contextService.resolveRelativePath(uri, parentSchemaURL);
          }
          uri = normalizeId(uri);
          var referencedHandle = _this.getOrAddSchemaHandle(uri);
          return referencedHandle.getUnresolvedSchema().then(function(unresolvedSchema) {
            parentSchemaDependencies[uri] = true;
            if (unresolvedSchema.errors.length) {
              var loc = refSegment ? uri + "#" + refSegment : uri;
              resolveErrors.push(localize$2("json.schema.problemloadingref", "Problems loading reference '{0}': {1}", loc, unresolvedSchema.errors[0]));
            }
            merge(node, unresolvedSchema.schema, uri, refSegment);
            return resolveRefs(node, unresolvedSchema.schema, uri, referencedHandle.dependencies);
          });
        };
        var resolveRefs = function(node, parentSchema, parentSchemaURL, parentSchemaDependencies) {
          if (!node || typeof node !== "object") {
            return Promise.resolve(null);
          }
          var toWalk = [node];
          var seen = [];
          var openPromises = [];
          var collectEntries = function() {
            var entries = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              entries[_i] = arguments[_i];
            }
            for (var _a = 0, entries_1 = entries; _a < entries_1.length; _a++) {
              var entry = entries_1[_a];
              if (typeof entry === "object") {
                toWalk.push(entry);
              }
            }
          };
          var collectMapEntries = function() {
            var maps = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              maps[_i] = arguments[_i];
            }
            for (var _a = 0, maps_1 = maps; _a < maps_1.length; _a++) {
              var map = maps_1[_a];
              if (typeof map === "object") {
                for (var k in map) {
                  var key = k;
                  var entry = map[key];
                  if (typeof entry === "object") {
                    toWalk.push(entry);
                  }
                }
              }
            }
          };
          var collectArrayEntries = function() {
            var arrays = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              arrays[_i] = arguments[_i];
            }
            for (var _a = 0, arrays_1 = arrays; _a < arrays_1.length; _a++) {
              var array = arrays_1[_a];
              if (Array.isArray(array)) {
                for (var _b = 0, array_1 = array; _b < array_1.length; _b++) {
                  var entry = array_1[_b];
                  if (typeof entry === "object") {
                    toWalk.push(entry);
                  }
                }
              }
            }
          };
          var handleRef = function(next2) {
            var seenRefs = [];
            while (next2.$ref) {
              var ref = next2.$ref;
              var segments = ref.split("#", 2);
              delete next2.$ref;
              if (segments[0].length > 0) {
                openPromises.push(resolveExternalLink(next2, segments[0], segments[1], parentSchemaURL, parentSchemaDependencies));
                return;
              } else {
                if (seenRefs.indexOf(ref) === -1) {
                  merge(next2, parentSchema, parentSchemaURL, segments[1]);
                  seenRefs.push(ref);
                }
              }
            }
            collectEntries(next2.items, next2.additionalItems, next2.additionalProperties, next2.not, next2.contains, next2.propertyNames, next2.if, next2.then, next2.else);
            collectMapEntries(next2.definitions, next2.properties, next2.patternProperties, next2.dependencies);
            collectArrayEntries(next2.anyOf, next2.allOf, next2.oneOf, next2.items);
          };
          while (toWalk.length) {
            var next = toWalk.pop();
            if (seen.indexOf(next) >= 0) {
              continue;
            }
            seen.push(next);
            handleRef(next);
          }
          return _this.promise.all(openPromises);
        };
        return resolveRefs(schema, schema, schemaURL, dependencies).then(function(_) {
          return new ResolvedSchema(schema, resolveErrors);
        });
      };
      JSONSchemaService2.prototype.getSchemaForResource = function(resource, document) {
        if (document && document.root && document.root.type === "object") {
          var schemaProperties = document.root.properties.filter(function(p) {
            return p.keyNode.value === "$schema" && p.valueNode && p.valueNode.type === "string";
          });
          if (schemaProperties.length > 0) {
            var valueNode = schemaProperties[0].valueNode;
            if (valueNode && valueNode.type === "string") {
              var schemeId = getNodeValue(valueNode);
              if (schemeId && startsWith(schemeId, ".") && this.contextService) {
                schemeId = this.contextService.resolveRelativePath(schemeId, resource);
              }
              if (schemeId) {
                var id = normalizeId(schemeId);
                return this.getOrAddSchemaHandle(id).getResolvedSchema();
              }
            }
          }
        }
        if (this.cachedSchemaForResource && this.cachedSchemaForResource.resource === resource) {
          return this.cachedSchemaForResource.resolvedSchema;
        }
        var seen = Object.create(null);
        var schemas = [];
        var normalizedResource = normalizeResourceForMatching(resource);
        for (var _i = 0, _a = this.filePatternAssociations; _i < _a.length; _i++) {
          var entry = _a[_i];
          if (entry.matchesPattern(normalizedResource)) {
            for (var _b = 0, _c = entry.getURIs(); _b < _c.length; _b++) {
              var schemaId = _c[_b];
              if (!seen[schemaId]) {
                schemas.push(schemaId);
                seen[schemaId] = true;
              }
            }
          }
        }
        var resolvedSchema = schemas.length > 0 ? this.createCombinedSchema(resource, schemas).getResolvedSchema() : this.promise.resolve(void 0);
        this.cachedSchemaForResource = { resource, resolvedSchema };
        return resolvedSchema;
      };
      JSONSchemaService2.prototype.createCombinedSchema = function(resource, schemaIds) {
        if (schemaIds.length === 1) {
          return this.getOrAddSchemaHandle(schemaIds[0]);
        } else {
          var combinedSchemaId = "schemaservice://combinedSchema/" + encodeURIComponent(resource);
          var combinedSchema = {
            allOf: schemaIds.map(function(schemaId) {
              return { $ref: schemaId };
            })
          };
          return this.addSchemaHandle(combinedSchemaId, combinedSchema);
        }
      };
      JSONSchemaService2.prototype.getMatchingSchemas = function(document, jsonDocument, schema) {
        if (schema) {
          var id = schema.id || "schemaservice://untitled/matchingSchemas/" + idCounter$1++;
          return this.resolveSchemaContent(new UnresolvedSchema(schema), id, {}).then(function(resolvedSchema) {
            return jsonDocument.getMatchingSchemas(resolvedSchema.schema).filter(function(s) {
              return !s.inverted;
            });
          });
        }
        return this.getSchemaForResource(document.uri, jsonDocument).then(function(schema2) {
          if (schema2) {
            return jsonDocument.getMatchingSchemas(schema2.schema).filter(function(s) {
              return !s.inverted;
            });
          }
          return [];
        });
      };
      return JSONSchemaService2;
    }();
    var idCounter$1 = 0;
    function normalizeId(id) {
      try {
        return URI.parse(id).toString();
      } catch (e) {
        return id;
      }
    }
    function normalizeResourceForMatching(resource) {
      try {
        return URI.parse(resource).with({ fragment: null, query: null }).toString();
      } catch (e) {
        return resource;
      }
    }
    function toDisplayString(url) {
      try {
        var uri = URI.parse(url);
        if (uri.scheme === "file") {
          return uri.fsPath;
        }
      } catch (e) {
      }
      return url;
    }

    var localize$1 = loadMessageBundle();
    var JSONValidation = function() {
      function JSONValidation2(jsonSchemaService, promiseConstructor) {
        this.jsonSchemaService = jsonSchemaService;
        this.promise = promiseConstructor;
        this.validationEnabled = true;
      }
      JSONValidation2.prototype.configure = function(raw) {
        if (raw) {
          this.validationEnabled = raw.validate !== false;
          this.commentSeverity = raw.allowComments ? void 0 : DiagnosticSeverity.Error;
        }
      };
      JSONValidation2.prototype.doValidation = function(textDocument, jsonDocument, documentSettings, schema) {
        var _this = this;
        if (!this.validationEnabled) {
          return this.promise.resolve([]);
        }
        var diagnostics = [];
        var added = {};
        var addProblem = function(problem) {
          var signature = problem.range.start.line + " " + problem.range.start.character + " " + problem.message;
          if (!added[signature]) {
            added[signature] = true;
            diagnostics.push(problem);
          }
        };
        var getDiagnostics = function(schema2) {
          var trailingCommaSeverity = (documentSettings === null || documentSettings === void 0 ? void 0 : documentSettings.trailingCommas) ? toDiagnosticSeverity(documentSettings.trailingCommas) : DiagnosticSeverity.Error;
          var commentSeverity = (documentSettings === null || documentSettings === void 0 ? void 0 : documentSettings.comments) ? toDiagnosticSeverity(documentSettings.comments) : _this.commentSeverity;
          var schemaValidation = (documentSettings === null || documentSettings === void 0 ? void 0 : documentSettings.schemaValidation) ? toDiagnosticSeverity(documentSettings.schemaValidation) : DiagnosticSeverity.Warning;
          var schemaRequest = (documentSettings === null || documentSettings === void 0 ? void 0 : documentSettings.schemaRequest) ? toDiagnosticSeverity(documentSettings.schemaRequest) : DiagnosticSeverity.Warning;
          if (schema2) {
            if (schema2.errors.length && jsonDocument.root && schemaRequest) {
              var astRoot = jsonDocument.root;
              var property = astRoot.type === "object" ? astRoot.properties[0] : void 0;
              if (property && property.keyNode.value === "$schema") {
                var node = property.valueNode || property;
                var range = Range.create(textDocument.positionAt(node.offset), textDocument.positionAt(node.offset + node.length));
                addProblem(Diagnostic.create(range, schema2.errors[0], schemaRequest, ErrorCode.SchemaResolveError));
              } else {
                var range = Range.create(textDocument.positionAt(astRoot.offset), textDocument.positionAt(astRoot.offset + 1));
                addProblem(Diagnostic.create(range, schema2.errors[0], schemaRequest, ErrorCode.SchemaResolveError));
              }
            } else if (schemaValidation) {
              var semanticErrors = jsonDocument.validate(textDocument, schema2.schema, schemaValidation);
              if (semanticErrors) {
                semanticErrors.forEach(addProblem);
              }
            }
            if (schemaAllowsComments(schema2.schema)) {
              commentSeverity = void 0;
            }
            if (schemaAllowsTrailingCommas(schema2.schema)) {
              trailingCommaSeverity = void 0;
            }
          }
          for (var _i = 0, _a = jsonDocument.syntaxErrors; _i < _a.length; _i++) {
            var p = _a[_i];
            if (p.code === ErrorCode.TrailingComma) {
              if (typeof trailingCommaSeverity !== "number") {
                continue;
              }
              p.severity = trailingCommaSeverity;
            }
            addProblem(p);
          }
          if (typeof commentSeverity === "number") {
            var message_1 = localize$1("InvalidCommentToken", "Comments are not permitted in JSON.");
            jsonDocument.comments.forEach(function(c) {
              addProblem(Diagnostic.create(c, message_1, commentSeverity, ErrorCode.CommentNotPermitted));
            });
          }
          return diagnostics;
        };
        if (schema) {
          var id = schema.id || "schemaservice://untitled/" + idCounter++;
          return this.jsonSchemaService.resolveSchemaContent(new UnresolvedSchema(schema), id, {}).then(function(resolvedSchema) {
            return getDiagnostics(resolvedSchema);
          });
        }
        return this.jsonSchemaService.getSchemaForResource(textDocument.uri, jsonDocument).then(function(schema2) {
          return getDiagnostics(schema2);
        });
      };
      return JSONValidation2;
    }();
    var idCounter = 0;
    function schemaAllowsComments(schemaRef) {
      if (schemaRef && typeof schemaRef === "object") {
        if (isBoolean(schemaRef.allowComments)) {
          return schemaRef.allowComments;
        }
        if (schemaRef.allOf) {
          for (var _i = 0, _a = schemaRef.allOf; _i < _a.length; _i++) {
            var schema = _a[_i];
            var allow = schemaAllowsComments(schema);
            if (isBoolean(allow)) {
              return allow;
            }
          }
        }
      }
      return void 0;
    }
    function schemaAllowsTrailingCommas(schemaRef) {
      if (schemaRef && typeof schemaRef === "object") {
        if (isBoolean(schemaRef.allowTrailingCommas)) {
          return schemaRef.allowTrailingCommas;
        }
        var deprSchemaRef = schemaRef;
        if (isBoolean(deprSchemaRef["allowsTrailingCommas"])) {
          return deprSchemaRef["allowsTrailingCommas"];
        }
        if (schemaRef.allOf) {
          for (var _i = 0, _a = schemaRef.allOf; _i < _a.length; _i++) {
            var schema = _a[_i];
            var allow = schemaAllowsTrailingCommas(schema);
            if (isBoolean(allow)) {
              return allow;
            }
          }
        }
      }
      return void 0;
    }
    function toDiagnosticSeverity(severityLevel) {
      switch (severityLevel) {
        case "error":
          return DiagnosticSeverity.Error;
        case "warning":
          return DiagnosticSeverity.Warning;
        case "ignore":
          return void 0;
      }
      return void 0;
    }

    var Digit0 = 48;
    var Digit9 = 57;
    var A = 65;
    var a = 97;
    var f = 102;
    function hexDigit(charCode) {
      if (charCode < Digit0) {
        return 0;
      }
      if (charCode <= Digit9) {
        return charCode - Digit0;
      }
      if (charCode < a) {
        charCode += a - A;
      }
      if (charCode >= a && charCode <= f) {
        return charCode - a + 10;
      }
      return 0;
    }
    function colorFromHex(text) {
      if (text[0] !== "#") {
        return void 0;
      }
      switch (text.length) {
        case 4:
          return {
            red: hexDigit(text.charCodeAt(1)) * 17 / 255,
            green: hexDigit(text.charCodeAt(2)) * 17 / 255,
            blue: hexDigit(text.charCodeAt(3)) * 17 / 255,
            alpha: 1
          };
        case 5:
          return {
            red: hexDigit(text.charCodeAt(1)) * 17 / 255,
            green: hexDigit(text.charCodeAt(2)) * 17 / 255,
            blue: hexDigit(text.charCodeAt(3)) * 17 / 255,
            alpha: hexDigit(text.charCodeAt(4)) * 17 / 255
          };
        case 7:
          return {
            red: (hexDigit(text.charCodeAt(1)) * 16 + hexDigit(text.charCodeAt(2))) / 255,
            green: (hexDigit(text.charCodeAt(3)) * 16 + hexDigit(text.charCodeAt(4))) / 255,
            blue: (hexDigit(text.charCodeAt(5)) * 16 + hexDigit(text.charCodeAt(6))) / 255,
            alpha: 1
          };
        case 9:
          return {
            red: (hexDigit(text.charCodeAt(1)) * 16 + hexDigit(text.charCodeAt(2))) / 255,
            green: (hexDigit(text.charCodeAt(3)) * 16 + hexDigit(text.charCodeAt(4))) / 255,
            blue: (hexDigit(text.charCodeAt(5)) * 16 + hexDigit(text.charCodeAt(6))) / 255,
            alpha: (hexDigit(text.charCodeAt(7)) * 16 + hexDigit(text.charCodeAt(8))) / 255
          };
      }
      return void 0;
    }

    var JSONDocumentSymbols = function() {
      function JSONDocumentSymbols2(schemaService) {
        this.schemaService = schemaService;
      }
      JSONDocumentSymbols2.prototype.findDocumentSymbols = function(document, doc, context) {
        var _this = this;
        if (context === void 0) {
          context = { resultLimit: Number.MAX_VALUE };
        }
        var root = doc.root;
        if (!root) {
          return [];
        }
        var limit = context.resultLimit || Number.MAX_VALUE;
        var resourceString = document.uri;
        if (resourceString === "vscode://defaultsettings/keybindings.json" || endsWith(resourceString.toLowerCase(), "/user/keybindings.json")) {
          if (root.type === "array") {
            var result_1 = [];
            for (var _i = 0, _a = root.items; _i < _a.length; _i++) {
              var item = _a[_i];
              if (item.type === "object") {
                for (var _b = 0, _c = item.properties; _b < _c.length; _b++) {
                  var property = _c[_b];
                  if (property.keyNode.value === "key" && property.valueNode) {
                    var location = Location.create(document.uri, getRange(document, item));
                    result_1.push({ name: getNodeValue(property.valueNode), kind: SymbolKind.Function, location });
                    limit--;
                    if (limit <= 0) {
                      if (context && context.onResultLimitExceeded) {
                        context.onResultLimitExceeded(resourceString);
                      }
                      return result_1;
                    }
                  }
                }
              }
            }
            return result_1;
          }
        }
        var toVisit = [
          { node: root, containerName: "" }
        ];
        var nextToVisit = 0;
        var limitExceeded = false;
        var result = [];
        var collectOutlineEntries = function(node, containerName) {
          if (node.type === "array") {
            node.items.forEach(function(node2) {
              if (node2) {
                toVisit.push({ node: node2, containerName });
              }
            });
          } else if (node.type === "object") {
            node.properties.forEach(function(property2) {
              var valueNode = property2.valueNode;
              if (valueNode) {
                if (limit > 0) {
                  limit--;
                  var location2 = Location.create(document.uri, getRange(document, property2));
                  var childContainerName = containerName ? containerName + "." + property2.keyNode.value : property2.keyNode.value;
                  result.push({ name: _this.getKeyLabel(property2), kind: _this.getSymbolKind(valueNode.type), location: location2, containerName });
                  toVisit.push({ node: valueNode, containerName: childContainerName });
                } else {
                  limitExceeded = true;
                }
              }
            });
          }
        };
        while (nextToVisit < toVisit.length) {
          var next = toVisit[nextToVisit++];
          collectOutlineEntries(next.node, next.containerName);
        }
        if (limitExceeded && context && context.onResultLimitExceeded) {
          context.onResultLimitExceeded(resourceString);
        }
        return result;
      };
      JSONDocumentSymbols2.prototype.findDocumentSymbols2 = function(document, doc, context) {
        var _this = this;
        if (context === void 0) {
          context = { resultLimit: Number.MAX_VALUE };
        }
        var root = doc.root;
        if (!root) {
          return [];
        }
        var limit = context.resultLimit || Number.MAX_VALUE;
        var resourceString = document.uri;
        if (resourceString === "vscode://defaultsettings/keybindings.json" || endsWith(resourceString.toLowerCase(), "/user/keybindings.json")) {
          if (root.type === "array") {
            var result_2 = [];
            for (var _i = 0, _a = root.items; _i < _a.length; _i++) {
              var item = _a[_i];
              if (item.type === "object") {
                for (var _b = 0, _c = item.properties; _b < _c.length; _b++) {
                  var property = _c[_b];
                  if (property.keyNode.value === "key" && property.valueNode) {
                    var range = getRange(document, item);
                    var selectionRange = getRange(document, property.keyNode);
                    result_2.push({ name: getNodeValue(property.valueNode), kind: SymbolKind.Function, range, selectionRange });
                    limit--;
                    if (limit <= 0) {
                      if (context && context.onResultLimitExceeded) {
                        context.onResultLimitExceeded(resourceString);
                      }
                      return result_2;
                    }
                  }
                }
              }
            }
            return result_2;
          }
        }
        var result = [];
        var toVisit = [
          { node: root, result }
        ];
        var nextToVisit = 0;
        var limitExceeded = false;
        var collectOutlineEntries = function(node, result2) {
          if (node.type === "array") {
            node.items.forEach(function(node2, index) {
              if (node2) {
                if (limit > 0) {
                  limit--;
                  var range2 = getRange(document, node2);
                  var selectionRange2 = range2;
                  var name = String(index);
                  var symbol = { name, kind: _this.getSymbolKind(node2.type), range: range2, selectionRange: selectionRange2, children: [] };
                  result2.push(symbol);
                  toVisit.push({ result: symbol.children, node: node2 });
                } else {
                  limitExceeded = true;
                }
              }
            });
          } else if (node.type === "object") {
            node.properties.forEach(function(property2) {
              var valueNode = property2.valueNode;
              if (valueNode) {
                if (limit > 0) {
                  limit--;
                  var range2 = getRange(document, property2);
                  var selectionRange2 = getRange(document, property2.keyNode);
                  var children = [];
                  var symbol = { name: _this.getKeyLabel(property2), kind: _this.getSymbolKind(valueNode.type), range: range2, selectionRange: selectionRange2, children, detail: _this.getDetail(valueNode) };
                  result2.push(symbol);
                  toVisit.push({ result: children, node: valueNode });
                } else {
                  limitExceeded = true;
                }
              }
            });
          }
        };
        while (nextToVisit < toVisit.length) {
          var next = toVisit[nextToVisit++];
          collectOutlineEntries(next.node, next.result);
        }
        if (limitExceeded && context && context.onResultLimitExceeded) {
          context.onResultLimitExceeded(resourceString);
        }
        return result;
      };
      JSONDocumentSymbols2.prototype.getSymbolKind = function(nodeType) {
        switch (nodeType) {
          case "object":
            return SymbolKind.Module;
          case "string":
            return SymbolKind.String;
          case "number":
            return SymbolKind.Number;
          case "array":
            return SymbolKind.Array;
          case "boolean":
            return SymbolKind.Boolean;
          default:
            return SymbolKind.Variable;
        }
      };
      JSONDocumentSymbols2.prototype.getKeyLabel = function(property) {
        var name = property.keyNode.value;
        if (name) {
          name = name.replace(/[\n]/g, "\u21B5");
        }
        if (name && name.trim()) {
          return name;
        }
        return '"' + name + '"';
      };
      JSONDocumentSymbols2.prototype.getDetail = function(node) {
        if (!node) {
          return void 0;
        }
        if (node.type === "boolean" || node.type === "number" || node.type === "null" || node.type === "string") {
          return String(node.value);
        } else {
          if (node.type === "array") {
            return node.children.length ? void 0 : "[]";
          } else if (node.type === "object") {
            return node.children.length ? void 0 : "{}";
          }
        }
        return void 0;
      };
      JSONDocumentSymbols2.prototype.findDocumentColors = function(document, doc, context) {
        return this.schemaService.getSchemaForResource(document.uri, doc).then(function(schema) {
          var result = [];
          if (schema) {
            var limit = context && typeof context.resultLimit === "number" ? context.resultLimit : Number.MAX_VALUE;
            var matchingSchemas = doc.getMatchingSchemas(schema.schema);
            var visitedNode = {};
            for (var _i = 0, matchingSchemas_1 = matchingSchemas; _i < matchingSchemas_1.length; _i++) {
              var s = matchingSchemas_1[_i];
              if (!s.inverted && s.schema && (s.schema.format === "color" || s.schema.format === "color-hex") && s.node && s.node.type === "string") {
                var nodeId = String(s.node.offset);
                if (!visitedNode[nodeId]) {
                  var color = colorFromHex(getNodeValue(s.node));
                  if (color) {
                    var range = getRange(document, s.node);
                    result.push({ color, range });
                  }
                  visitedNode[nodeId] = true;
                  limit--;
                  if (limit <= 0) {
                    if (context && context.onResultLimitExceeded) {
                      context.onResultLimitExceeded(document.uri);
                    }
                    return result;
                  }
                }
              }
            }
          }
          return result;
        });
      };
      JSONDocumentSymbols2.prototype.getColorPresentations = function(document, doc, color, range) {
        var result = [];
        var red256 = Math.round(color.red * 255), green256 = Math.round(color.green * 255), blue256 = Math.round(color.blue * 255);
        function toTwoDigitHex(n) {
          var r = n.toString(16);
          return r.length !== 2 ? "0" + r : r;
        }
        var label;
        if (color.alpha === 1) {
          label = "#" + toTwoDigitHex(red256) + toTwoDigitHex(green256) + toTwoDigitHex(blue256);
        } else {
          label = "#" + toTwoDigitHex(red256) + toTwoDigitHex(green256) + toTwoDigitHex(blue256) + toTwoDigitHex(Math.round(color.alpha * 255));
        }
        result.push({ label, textEdit: TextEdit.replace(range, JSON.stringify(label)) });
        return result;
      };
      return JSONDocumentSymbols2;
    }();
    function getRange(document, node) {
      return Range.create(document.positionAt(node.offset), document.positionAt(node.offset + node.length));
    }

    var localize = loadMessageBundle();
    var schemaContributions = {
      schemaAssociations: [],
      schemas: {
        "http://json-schema.org/schema#": {
          $ref: "http://json-schema.org/draft-07/schema#"
        },
        "http://json-schema.org/draft-04/schema#": {
          "title": localize("schema.json", "Describes a JSON file using a schema. See json-schema.org for more info."),
          "$schema": "http://json-schema.org/draft-04/schema#",
          "definitions": {
            "schemaArray": {
              "type": "array",
              "minItems": 1,
              "items": {
                "$ref": "#"
              }
            },
            "positiveInteger": {
              "type": "integer",
              "minimum": 0
            },
            "positiveIntegerDefault0": {
              "allOf": [
                {
                  "$ref": "#/definitions/positiveInteger"
                },
                {
                  "default": 0
                }
              ]
            },
            "simpleTypes": {
              "type": "string",
              "enum": [
                "array",
                "boolean",
                "integer",
                "null",
                "number",
                "object",
                "string"
              ]
            },
            "stringArray": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "minItems": 1,
              "uniqueItems": true
            }
          },
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uri"
            },
            "$schema": {
              "type": "string",
              "format": "uri"
            },
            "title": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "default": {},
            "multipleOf": {
              "type": "number",
              "minimum": 0,
              "exclusiveMinimum": true
            },
            "maximum": {
              "type": "number"
            },
            "exclusiveMaximum": {
              "type": "boolean",
              "default": false
            },
            "minimum": {
              "type": "number"
            },
            "exclusiveMinimum": {
              "type": "boolean",
              "default": false
            },
            "maxLength": {
              "allOf": [
                {
                  "$ref": "#/definitions/positiveInteger"
                }
              ]
            },
            "minLength": {
              "allOf": [
                {
                  "$ref": "#/definitions/positiveIntegerDefault0"
                }
              ]
            },
            "pattern": {
              "type": "string",
              "format": "regex"
            },
            "additionalItems": {
              "anyOf": [
                {
                  "type": "boolean"
                },
                {
                  "$ref": "#"
                }
              ],
              "default": {}
            },
            "items": {
              "anyOf": [
                {
                  "$ref": "#"
                },
                {
                  "$ref": "#/definitions/schemaArray"
                }
              ],
              "default": {}
            },
            "maxItems": {
              "allOf": [
                {
                  "$ref": "#/definitions/positiveInteger"
                }
              ]
            },
            "minItems": {
              "allOf": [
                {
                  "$ref": "#/definitions/positiveIntegerDefault0"
                }
              ]
            },
            "uniqueItems": {
              "type": "boolean",
              "default": false
            },
            "maxProperties": {
              "allOf": [
                {
                  "$ref": "#/definitions/positiveInteger"
                }
              ]
            },
            "minProperties": {
              "allOf": [
                {
                  "$ref": "#/definitions/positiveIntegerDefault0"
                }
              ]
            },
            "required": {
              "allOf": [
                {
                  "$ref": "#/definitions/stringArray"
                }
              ]
            },
            "additionalProperties": {
              "anyOf": [
                {
                  "type": "boolean"
                },
                {
                  "$ref": "#"
                }
              ],
              "default": {}
            },
            "definitions": {
              "type": "object",
              "additionalProperties": {
                "$ref": "#"
              },
              "default": {}
            },
            "properties": {
              "type": "object",
              "additionalProperties": {
                "$ref": "#"
              },
              "default": {}
            },
            "patternProperties": {
              "type": "object",
              "additionalProperties": {
                "$ref": "#"
              },
              "default": {}
            },
            "dependencies": {
              "type": "object",
              "additionalProperties": {
                "anyOf": [
                  {
                    "$ref": "#"
                  },
                  {
                    "$ref": "#/definitions/stringArray"
                  }
                ]
              }
            },
            "enum": {
              "type": "array",
              "minItems": 1,
              "uniqueItems": true
            },
            "type": {
              "anyOf": [
                {
                  "$ref": "#/definitions/simpleTypes"
                },
                {
                  "type": "array",
                  "items": {
                    "$ref": "#/definitions/simpleTypes"
                  },
                  "minItems": 1,
                  "uniqueItems": true
                }
              ]
            },
            "format": {
              "anyOf": [
                {
                  "type": "string",
                  "enum": [
                    "date-time",
                    "uri",
                    "email",
                    "hostname",
                    "ipv4",
                    "ipv6",
                    "regex"
                  ]
                },
                {
                  "type": "string"
                }
              ]
            },
            "allOf": {
              "allOf": [
                {
                  "$ref": "#/definitions/schemaArray"
                }
              ]
            },
            "anyOf": {
              "allOf": [
                {
                  "$ref": "#/definitions/schemaArray"
                }
              ]
            },
            "oneOf": {
              "allOf": [
                {
                  "$ref": "#/definitions/schemaArray"
                }
              ]
            },
            "not": {
              "allOf": [
                {
                  "$ref": "#"
                }
              ]
            }
          },
          "dependencies": {
            "exclusiveMaximum": [
              "maximum"
            ],
            "exclusiveMinimum": [
              "minimum"
            ]
          },
          "default": {}
        },
        "http://json-schema.org/draft-07/schema#": {
          "title": localize("schema.json", "Describes a JSON file using a schema. See json-schema.org for more info."),
          "definitions": {
            "schemaArray": {
              "type": "array",
              "minItems": 1,
              "items": { "$ref": "#" }
            },
            "nonNegativeInteger": {
              "type": "integer",
              "minimum": 0
            },
            "nonNegativeIntegerDefault0": {
              "allOf": [
                { "$ref": "#/definitions/nonNegativeInteger" },
                { "default": 0 }
              ]
            },
            "simpleTypes": {
              "enum": [
                "array",
                "boolean",
                "integer",
                "null",
                "number",
                "object",
                "string"
              ]
            },
            "stringArray": {
              "type": "array",
              "items": { "type": "string" },
              "uniqueItems": true,
              "default": []
            }
          },
          "type": ["object", "boolean"],
          "properties": {
            "$id": {
              "type": "string",
              "format": "uri-reference"
            },
            "$schema": {
              "type": "string",
              "format": "uri"
            },
            "$ref": {
              "type": "string",
              "format": "uri-reference"
            },
            "$comment": {
              "type": "string"
            },
            "title": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "default": true,
            "readOnly": {
              "type": "boolean",
              "default": false
            },
            "examples": {
              "type": "array",
              "items": true
            },
            "multipleOf": {
              "type": "number",
              "exclusiveMinimum": 0
            },
            "maximum": {
              "type": "number"
            },
            "exclusiveMaximum": {
              "type": "number"
            },
            "minimum": {
              "type": "number"
            },
            "exclusiveMinimum": {
              "type": "number"
            },
            "maxLength": { "$ref": "#/definitions/nonNegativeInteger" },
            "minLength": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
            "pattern": {
              "type": "string",
              "format": "regex"
            },
            "additionalItems": { "$ref": "#" },
            "items": {
              "anyOf": [
                { "$ref": "#" },
                { "$ref": "#/definitions/schemaArray" }
              ],
              "default": true
            },
            "maxItems": { "$ref": "#/definitions/nonNegativeInteger" },
            "minItems": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
            "uniqueItems": {
              "type": "boolean",
              "default": false
            },
            "contains": { "$ref": "#" },
            "maxProperties": { "$ref": "#/definitions/nonNegativeInteger" },
            "minProperties": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
            "required": { "$ref": "#/definitions/stringArray" },
            "additionalProperties": { "$ref": "#" },
            "definitions": {
              "type": "object",
              "additionalProperties": { "$ref": "#" },
              "default": {}
            },
            "properties": {
              "type": "object",
              "additionalProperties": { "$ref": "#" },
              "default": {}
            },
            "patternProperties": {
              "type": "object",
              "additionalProperties": { "$ref": "#" },
              "propertyNames": { "format": "regex" },
              "default": {}
            },
            "dependencies": {
              "type": "object",
              "additionalProperties": {
                "anyOf": [
                  { "$ref": "#" },
                  { "$ref": "#/definitions/stringArray" }
                ]
              }
            },
            "propertyNames": { "$ref": "#" },
            "const": true,
            "enum": {
              "type": "array",
              "items": true,
              "minItems": 1,
              "uniqueItems": true
            },
            "type": {
              "anyOf": [
                { "$ref": "#/definitions/simpleTypes" },
                {
                  "type": "array",
                  "items": { "$ref": "#/definitions/simpleTypes" },
                  "minItems": 1,
                  "uniqueItems": true
                }
              ]
            },
            "format": { "type": "string" },
            "contentMediaType": { "type": "string" },
            "contentEncoding": { "type": "string" },
            "if": { "$ref": "#" },
            "then": { "$ref": "#" },
            "else": { "$ref": "#" },
            "allOf": { "$ref": "#/definitions/schemaArray" },
            "anyOf": { "$ref": "#/definitions/schemaArray" },
            "oneOf": { "$ref": "#/definitions/schemaArray" },
            "not": { "$ref": "#" }
          },
          "default": true
        }
      }
    };
    var descriptions = {
      id: localize("schema.json.id", "A unique identifier for the schema."),
      $schema: localize("schema.json.$schema", "The schema to verify this document against."),
      title: localize("schema.json.title", "A descriptive title of the element."),
      description: localize("schema.json.description", "A long description of the element. Used in hover menus and suggestions."),
      default: localize("schema.json.default", "A default value. Used by suggestions."),
      multipleOf: localize("schema.json.multipleOf", "A number that should cleanly divide the current value (i.e. have no remainder)."),
      maximum: localize("schema.json.maximum", "The maximum numerical value, inclusive by default."),
      exclusiveMaximum: localize("schema.json.exclusiveMaximum", "Makes the maximum property exclusive."),
      minimum: localize("schema.json.minimum", "The minimum numerical value, inclusive by default."),
      exclusiveMinimum: localize("schema.json.exclusiveMininum", "Makes the minimum property exclusive."),
      maxLength: localize("schema.json.maxLength", "The maximum length of a string."),
      minLength: localize("schema.json.minLength", "The minimum length of a string."),
      pattern: localize("schema.json.pattern", "A regular expression to match the string against. It is not implicitly anchored."),
      additionalItems: localize("schema.json.additionalItems", "For arrays, only when items is set as an array. If it is a schema, then this schema validates items after the ones specified by the items array. If it is false, then additional items will cause validation to fail."),
      items: localize("schema.json.items", "For arrays. Can either be a schema to validate every element against or an array of schemas to validate each item against in order (the first schema will validate the first element, the second schema will validate the second element, and so on."),
      maxItems: localize("schema.json.maxItems", "The maximum number of items that can be inside an array. Inclusive."),
      minItems: localize("schema.json.minItems", "The minimum number of items that can be inside an array. Inclusive."),
      uniqueItems: localize("schema.json.uniqueItems", "If all of the items in the array must be unique. Defaults to false."),
      maxProperties: localize("schema.json.maxProperties", "The maximum number of properties an object can have. Inclusive."),
      minProperties: localize("schema.json.minProperties", "The minimum number of properties an object can have. Inclusive."),
      required: localize("schema.json.required", "An array of strings that lists the names of all properties required on this object."),
      additionalProperties: localize("schema.json.additionalProperties", "Either a schema or a boolean. If a schema, then used to validate all properties not matched by 'properties' or 'patternProperties'. If false, then any properties not matched by either will cause this schema to fail."),
      definitions: localize("schema.json.definitions", "Not used for validation. Place subschemas here that you wish to reference inline with $ref."),
      properties: localize("schema.json.properties", "A map of property names to schemas for each property."),
      patternProperties: localize("schema.json.patternProperties", "A map of regular expressions on property names to schemas for matching properties."),
      dependencies: localize("schema.json.dependencies", "A map of property names to either an array of property names or a schema. An array of property names means the property named in the key depends on the properties in the array being present in the object in order to be valid. If the value is a schema, then the schema is only applied to the object if the property in the key exists on the object."),
      enum: localize("schema.json.enum", "The set of literal values that are valid."),
      type: localize("schema.json.type", "Either a string of one of the basic schema types (number, integer, null, array, object, boolean, string) or an array of strings specifying a subset of those types."),
      format: localize("schema.json.format", "Describes the format expected for the value."),
      allOf: localize("schema.json.allOf", "An array of schemas, all of which must match."),
      anyOf: localize("schema.json.anyOf", "An array of schemas, where at least one must match."),
      oneOf: localize("schema.json.oneOf", "An array of schemas, exactly one of which must match."),
      not: localize("schema.json.not", "A schema which must not match."),
      $id: localize("schema.json.$id", "A unique identifier for the schema."),
      $ref: localize("schema.json.$ref", "Reference a definition hosted on any location."),
      $comment: localize("schema.json.$comment", "Comments from schema authors to readers or maintainers of the schema."),
      readOnly: localize("schema.json.readOnly", "Indicates that the value of the instance is managed exclusively by the owning authority."),
      examples: localize("schema.json.examples", "Sample JSON values associated with a particular schema, for the purpose of illustrating usage."),
      contains: localize("schema.json.contains", 'An array instance is valid against "contains" if at least one of its elements is valid against the given schema.'),
      propertyNames: localize("schema.json.propertyNames", "If the instance is an object, this keyword validates if every property name in the instance validates against the provided schema."),
      const: localize("schema.json.const", "An instance validates successfully against this keyword if its value is equal to the value of the keyword."),
      contentMediaType: localize("schema.json.contentMediaType", "Describes the media type of a string property."),
      contentEncoding: localize("schema.json.contentEncoding", "Describes the content encoding of a string property."),
      if: localize("schema.json.if", 'The validation outcome of the "if" subschema controls which of the "then" or "else" keywords are evaluated.'),
      then: localize("schema.json.then", 'The "if" subschema is used for validation when the "if" subschema succeeds.'),
      else: localize("schema.json.else", 'The "else" subschema is used for validation when the "if" subschema fails.')
    };
    for (var schemaName in schemaContributions.schemas) {
      var schema = schemaContributions.schemas[schemaName];
      for (var property in schema.properties) {
        var propertyObject = schema.properties[property];
        if (typeof propertyObject === "boolean") {
          propertyObject = schema.properties[property] = {};
        }
        var description = descriptions[property];
        if (description) {
          propertyObject["description"] = description;
        } else {
          console.log(property + ": localize('schema.json." + property + `', "")`);
        }
      }
    }

    function getFoldingRanges(document, context) {
      var ranges = [];
      var nestingLevels = [];
      var stack = [];
      var prevStart = -1;
      var scanner = createScanner(document.getText(), false);
      var token = scanner.scan();
      function addRange(range2) {
        ranges.push(range2);
        nestingLevels.push(stack.length);
      }
      while (token !== 17) {
        switch (token) {
          case 1:
          case 3: {
            var startLine = document.positionAt(scanner.getTokenOffset()).line;
            var range = { startLine, endLine: startLine, kind: token === 1 ? "object" : "array" };
            stack.push(range);
            break;
          }
          case 2:
          case 4: {
            var kind = token === 2 ? "object" : "array";
            if (stack.length > 0 && stack[stack.length - 1].kind === kind) {
              var range = stack.pop();
              var line = document.positionAt(scanner.getTokenOffset()).line;
              if (range && line > range.startLine + 1 && prevStart !== range.startLine) {
                range.endLine = line - 1;
                addRange(range);
                prevStart = range.startLine;
              }
            }
            break;
          }
          case 13: {
            var startLine = document.positionAt(scanner.getTokenOffset()).line;
            var endLine = document.positionAt(scanner.getTokenOffset() + scanner.getTokenLength()).line;
            if (scanner.getTokenError() === 1 && startLine + 1 < document.lineCount) {
              scanner.setPosition(document.offsetAt(Position.create(startLine + 1, 0)));
            } else {
              if (startLine < endLine) {
                addRange({ startLine, endLine, kind: FoldingRangeKind.Comment });
                prevStart = startLine;
              }
            }
            break;
          }
          case 12: {
            var text = document.getText().substr(scanner.getTokenOffset(), scanner.getTokenLength());
            var m = text.match(/^\/\/\s*#(region\b)|(endregion\b)/);
            if (m) {
              var line = document.positionAt(scanner.getTokenOffset()).line;
              if (m[1]) {
                var range = { startLine: line, endLine: line, kind: FoldingRangeKind.Region };
                stack.push(range);
              } else {
                var i = stack.length - 1;
                while (i >= 0 && stack[i].kind !== FoldingRangeKind.Region) {
                  i--;
                }
                if (i >= 0) {
                  var range = stack[i];
                  stack.length = i;
                  if (line > range.startLine && prevStart !== range.startLine) {
                    range.endLine = line;
                    addRange(range);
                    prevStart = range.startLine;
                  }
                }
              }
            }
            break;
          }
        }
        token = scanner.scan();
      }
      var rangeLimit = context && context.rangeLimit;
      if (typeof rangeLimit !== "number" || ranges.length <= rangeLimit) {
        return ranges;
      }
      if (context && context.onRangeLimitExceeded) {
        context.onRangeLimitExceeded(document.uri);
      }
      var counts = [];
      for (var _i = 0, nestingLevels_1 = nestingLevels; _i < nestingLevels_1.length; _i++) {
        var level = nestingLevels_1[_i];
        if (level < 30) {
          counts[level] = (counts[level] || 0) + 1;
        }
      }
      var entries = 0;
      var maxLevel = 0;
      for (var i = 0; i < counts.length; i++) {
        var n = counts[i];
        if (n) {
          if (n + entries > rangeLimit) {
            maxLevel = i;
            break;
          }
          entries += n;
        }
      }
      var result = [];
      for (var i = 0; i < ranges.length; i++) {
        var level = nestingLevels[i];
        if (typeof level === "number") {
          if (level < maxLevel || level === maxLevel && entries++ < rangeLimit) {
            result.push(ranges[i]);
          }
        }
      }
      return result;
    }

    function getSelectionRanges(document, positions, doc) {
      function getSelectionRange(position) {
        var offset = document.offsetAt(position);
        var node = doc.getNodeFromOffset(offset, true);
        var result = [];
        while (node) {
          switch (node.type) {
            case "string":
            case "object":
            case "array":
              var cStart = node.offset + 1, cEnd = node.offset + node.length - 1;
              if (cStart < cEnd && offset >= cStart && offset <= cEnd) {
                result.push(newRange(cStart, cEnd));
              }
              result.push(newRange(node.offset, node.offset + node.length));
              break;
            case "number":
            case "boolean":
            case "null":
            case "property":
              result.push(newRange(node.offset, node.offset + node.length));
              break;
          }
          if (node.type === "property" || node.parent && node.parent.type === "array") {
            var afterCommaOffset = getOffsetAfterNextToken(node.offset + node.length, 5);
            if (afterCommaOffset !== -1) {
              result.push(newRange(node.offset, afterCommaOffset));
            }
          }
          node = node.parent;
        }
        var current = void 0;
        for (var index = result.length - 1; index >= 0; index--) {
          current = SelectionRange.create(result[index], current);
        }
        if (!current) {
          current = SelectionRange.create(Range.create(position, position));
        }
        return current;
      }
      function newRange(start, end) {
        return Range.create(document.positionAt(start), document.positionAt(end));
      }
      var scanner = createScanner(document.getText(), true);
      function getOffsetAfterNextToken(offset, expectedToken) {
        scanner.setPosition(offset);
        var token = scanner.scan();
        if (token === expectedToken) {
          return scanner.getTokenOffset() + scanner.getTokenLength();
        }
        return -1;
      }
      return positions.map(getSelectionRange);
    }

    function findLinks(document, doc) {
      var links = [];
      doc.visit(function(node) {
        var _a;
        if (node.type === "property" && node.keyNode.value === "$ref" && ((_a = node.valueNode) === null || _a === void 0 ? void 0 : _a.type) === "string") {
          var path = node.valueNode.value;
          var targetNode = findTargetNode(doc, path);
          if (targetNode) {
            var targetPos = document.positionAt(targetNode.offset);
            links.push({
              target: document.uri + "#" + (targetPos.line + 1) + "," + (targetPos.character + 1),
              range: createRange(document, node.valueNode)
            });
          }
        }
        return true;
      });
      return Promise.resolve(links);
    }
    function createRange(document, node) {
      return Range.create(document.positionAt(node.offset + 1), document.positionAt(node.offset + node.length - 1));
    }
    function findTargetNode(doc, path) {
      var tokens = parseJSONPointer(path);
      if (!tokens) {
        return null;
      }
      return findNode(tokens, doc.root);
    }
    function findNode(pointer, node) {
      if (!node) {
        return null;
      }
      if (pointer.length === 0) {
        return node;
      }
      var token = pointer.shift();
      if (node && node.type === "object") {
        var propertyNode = node.properties.find(function(propertyNode2) {
          return propertyNode2.keyNode.value === token;
        });
        if (!propertyNode) {
          return null;
        }
        return findNode(pointer, propertyNode.valueNode);
      } else if (node && node.type === "array") {
        if (token.match(/^(0|[1-9][0-9]*)$/)) {
          var index = Number.parseInt(token);
          var arrayItem = node.items[index];
          if (!arrayItem) {
            return null;
          }
          return findNode(pointer, arrayItem);
        }
      }
      return null;
    }
    function parseJSONPointer(path) {
      if (path === "#") {
        return [];
      }
      if (path[0] !== "#" || path[1] !== "/") {
        return null;
      }
      return path.substring(2).split(/\//).map(unescape);
    }
    function unescape(str) {
      return str.replace(/~1/g, "/").replace(/~0/g, "~");
    }

    function getLanguageService(params) {
      var promise = params.promiseConstructor || Promise;
      var jsonSchemaService = new JSONSchemaService(params.schemaRequestService, params.workspaceContext, promise);
      jsonSchemaService.setSchemaContributions(schemaContributions);
      var jsonCompletion = new JSONCompletion(jsonSchemaService, params.contributions, promise, params.clientCapabilities);
      var jsonHover = new JSONHover(jsonSchemaService, params.contributions, promise);
      var jsonDocumentSymbols = new JSONDocumentSymbols(jsonSchemaService);
      var jsonValidation = new JSONValidation(jsonSchemaService, promise);
      return {
        configure: function(settings) {
          jsonSchemaService.clearExternalSchemas();
          if (settings.schemas) {
            settings.schemas.forEach(function(settings2) {
              jsonSchemaService.registerExternalSchema(settings2.uri, settings2.fileMatch, settings2.schema);
            });
          }
          jsonValidation.configure(settings);
        },
        resetSchema: function(uri) {
          return jsonSchemaService.onResourceChange(uri);
        },
        doValidation: jsonValidation.doValidation.bind(jsonValidation),
        parseJSONDocument: function(document) {
          return parse(document, { collectComments: true });
        },
        newJSONDocument: function(root, diagnostics) {
          return newJSONDocument(root, diagnostics);
        },
        getMatchingSchemas: jsonSchemaService.getMatchingSchemas.bind(jsonSchemaService),
        doResolve: jsonCompletion.doResolve.bind(jsonCompletion),
        doComplete: jsonCompletion.doComplete.bind(jsonCompletion),
        findDocumentSymbols: jsonDocumentSymbols.findDocumentSymbols.bind(jsonDocumentSymbols),
        findDocumentSymbols2: jsonDocumentSymbols.findDocumentSymbols2.bind(jsonDocumentSymbols),
        findDocumentColors: jsonDocumentSymbols.findDocumentColors.bind(jsonDocumentSymbols),
        getColorPresentations: jsonDocumentSymbols.getColorPresentations.bind(jsonDocumentSymbols),
        doHover: jsonHover.doHover.bind(jsonHover),
        getFoldingRanges,
        getSelectionRanges,
        findDefinition: function() {
          return Promise.resolve([]);
        },
        findLinks,
        format: function(d, r, o) {
          var range = void 0;
          if (r) {
            var offset = d.offsetAt(r.start);
            var length = d.offsetAt(r.end) - offset;
            range = { offset, length };
          }
          var options = { tabSize: o ? o.tabSize : 4, insertSpaces: (o === null || o === void 0 ? void 0 : o.insertSpaces) === true, insertFinalNewline: (o === null || o === void 0 ? void 0 : o.insertFinalNewline) === true, eol: "\n" };
          return format$1(d.getText(), range, options).map(function(e) {
            return TextEdit.replace(Range.create(d.positionAt(e.offset), d.positionAt(e.offset + e.length)), e.content);
          });
        }
      };
    }

    var __awaiter = undefined && undefined.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __generator = undefined && undefined.__generator || function(thisArg, body) {
      var _ = { label: 0, sent: function() {
        if (t[0] & 1)
          throw t[1];
        return t[1];
      }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([n, v]);
        };
      }
      function step(op) {
        if (f)
          throw new TypeError("Generator is already executing.");
        while (_)
          try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
              return t;
            if (y = 0, t)
              op = [op[0] & 2, t.value];
            switch (op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                _.label++;
                return { value: op[1], done: false };
              case 5:
                _.label++;
                y = op[1];
                op = [0];
                continue;
              case 7:
                op = _.ops.pop();
                _.trys.pop();
                continue;
              default:
                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue;
                }
                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break;
                }
                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1];
                  t = op;
                  break;
                }
                if (t && _.label < t[2]) {
                  _.label = t[2];
                  _.ops.push(op);
                  break;
                }
                if (t[2])
                  _.ops.pop();
                _.trys.pop();
                continue;
            }
            op = body.call(thisArg, _);
          } catch (e) {
            op = [6, e];
            y = 0;
          } finally {
            f = t = 0;
          }
        if (op[0] & 5)
          throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
      }
    };
    var defaultSchemaRequestService;
    if (typeof fetch !== "undefined") {
      defaultSchemaRequestService = function(url) {
        return fetch(url).then(function(response) {
          return response.text();
        });
      };
    }
    var JSONWorker = function() {
      function JSONWorker2(ctx, createData) {
        this._ctx = ctx;
        this._languageSettings = createData.languageSettings;
        this._languageId = createData.languageId;
        this._languageService = getLanguageService({
          workspaceContext: {
            resolveRelativePath: function(relativePath, resource) {
              var base = resource.substr(0, resource.lastIndexOf("/") + 1);
              return resolvePath(base, relativePath);
            }
          },
          schemaRequestService: createData.enableSchemaRequest && defaultSchemaRequestService
        });
        this._languageService.configure(this._languageSettings);
      }
      JSONWorker2.prototype.doValidation = function(uri) {
        return __awaiter(this, void 0, void 0, function() {
          var document, jsonDocument;
          return __generator(this, function(_a) {
            document = this._getTextDocument(uri);
            if (document) {
              jsonDocument = this._languageService.parseJSONDocument(document);
              return [2, this._languageService.doValidation(document, jsonDocument, this._languageSettings)];
            }
            return [2, Promise.resolve([])];
          });
        });
      };
      JSONWorker2.prototype.doComplete = function(uri, position) {
        return __awaiter(this, void 0, void 0, function() {
          var document, jsonDocument;
          return __generator(this, function(_a) {
            document = this._getTextDocument(uri);
            jsonDocument = this._languageService.parseJSONDocument(document);
            return [2, this._languageService.doComplete(document, position, jsonDocument)];
          });
        });
      };
      JSONWorker2.prototype.doResolve = function(item) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            return [2, this._languageService.doResolve(item)];
          });
        });
      };
      JSONWorker2.prototype.doHover = function(uri, position) {
        return __awaiter(this, void 0, void 0, function() {
          var document, jsonDocument;
          return __generator(this, function(_a) {
            document = this._getTextDocument(uri);
            jsonDocument = this._languageService.parseJSONDocument(document);
            return [2, this._languageService.doHover(document, position, jsonDocument)];
          });
        });
      };
      JSONWorker2.prototype.format = function(uri, range, options) {
        return __awaiter(this, void 0, void 0, function() {
          var document, textEdits;
          return __generator(this, function(_a) {
            document = this._getTextDocument(uri);
            textEdits = this._languageService.format(document, range, options);
            return [2, Promise.resolve(textEdits)];
          });
        });
      };
      JSONWorker2.prototype.resetSchema = function(uri) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            return [2, Promise.resolve(this._languageService.resetSchema(uri))];
          });
        });
      };
      JSONWorker2.prototype.findDocumentSymbols = function(uri) {
        return __awaiter(this, void 0, void 0, function() {
          var document, jsonDocument, symbols;
          return __generator(this, function(_a) {
            document = this._getTextDocument(uri);
            jsonDocument = this._languageService.parseJSONDocument(document);
            symbols = this._languageService.findDocumentSymbols(document, jsonDocument);
            return [2, Promise.resolve(symbols)];
          });
        });
      };
      JSONWorker2.prototype.findDocumentColors = function(uri) {
        return __awaiter(this, void 0, void 0, function() {
          var document, jsonDocument, colorSymbols;
          return __generator(this, function(_a) {
            document = this._getTextDocument(uri);
            jsonDocument = this._languageService.parseJSONDocument(document);
            colorSymbols = this._languageService.findDocumentColors(document, jsonDocument);
            return [2, Promise.resolve(colorSymbols)];
          });
        });
      };
      JSONWorker2.prototype.getColorPresentations = function(uri, color, range) {
        return __awaiter(this, void 0, void 0, function() {
          var document, jsonDocument, colorPresentations;
          return __generator(this, function(_a) {
            document = this._getTextDocument(uri);
            jsonDocument = this._languageService.parseJSONDocument(document);
            colorPresentations = this._languageService.getColorPresentations(document, jsonDocument, color, range);
            return [2, Promise.resolve(colorPresentations)];
          });
        });
      };
      JSONWorker2.prototype.getFoldingRanges = function(uri, context) {
        return __awaiter(this, void 0, void 0, function() {
          var document, ranges;
          return __generator(this, function(_a) {
            document = this._getTextDocument(uri);
            ranges = this._languageService.getFoldingRanges(document, context);
            return [2, Promise.resolve(ranges)];
          });
        });
      };
      JSONWorker2.prototype.getSelectionRanges = function(uri, positions) {
        return __awaiter(this, void 0, void 0, function() {
          var document, jsonDocument, ranges;
          return __generator(this, function(_a) {
            document = this._getTextDocument(uri);
            jsonDocument = this._languageService.parseJSONDocument(document);
            ranges = this._languageService.getSelectionRanges(document, positions, jsonDocument);
            return [2, Promise.resolve(ranges)];
          });
        });
      };
      JSONWorker2.prototype._getTextDocument = function(uri) {
        var models = this._ctx.getMirrorModels();
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
          var model = models_1[_i];
          if (model.uri.toString() === uri) {
            return TextDocument.create(uri, this._languageId, model.version, model.getValue());
          }
        }
        return null;
      };
      return JSONWorker2;
    }();
    var Slash = "/".charCodeAt(0);
    var Dot = ".".charCodeAt(0);
    function isAbsolutePath(path) {
      return path.charCodeAt(0) === Slash;
    }
    function resolvePath(uriString, path) {
      if (isAbsolutePath(path)) {
        var uri = URI.parse(uriString);
        var parts = path.split("/");
        return uri.with({ path: normalizePath(parts) }).toString();
      }
      return joinPath(uriString, path);
    }
    function normalizePath(parts) {
      var newParts = [];
      for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        if (part.length === 0 || part.length === 1 && part.charCodeAt(0) === Dot) ; else if (part.length === 2 && part.charCodeAt(0) === Dot && part.charCodeAt(1) === Dot) {
          newParts.pop();
        } else {
          newParts.push(part);
        }
      }
      if (parts.length > 1 && parts[parts.length - 1].length === 0) {
        newParts.push("");
      }
      var res = newParts.join("/");
      if (parts[0].length === 0) {
        res = "/" + res;
      }
      return res;
    }
    function joinPath(uriString) {
      var paths = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        paths[_i - 1] = arguments[_i];
      }
      var uri = URI.parse(uriString);
      var parts = uri.path.split("/");
      for (var _a = 0, paths_1 = paths; _a < paths_1.length; _a++) {
        var path = paths_1[_a];
        parts.push.apply(parts, path.split("/"));
      }
      return uri.with({ path: normalizePath(parts) }).toString();
    }

    self.onmessage = function() {
      initialize(function(ctx, createData) {
        return new JSONWorker(ctx, createData);
      });
    };

})();
