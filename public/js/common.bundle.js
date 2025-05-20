"use strict";
(self["webpackChunkproduct_estimator"] = self["webpackChunkproduct_estimator"] || []).push([["common"],{

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayLikeToArray)
/* harmony export */ });
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayWithHoles)
/* harmony export */ });
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayWithoutHoles)
/* harmony export */ });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _assertThisInitialized)
/* harmony export */ });
function _assertThisInitialized(e) {
  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _classCallCheck)
/* harmony export */ });
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/createClass.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/createClass.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _createClass)
/* harmony export */ });
/* harmony import */ var _toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./toPropertyKey.js */ "./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js");

function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, (0,_toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/defineProperty.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _defineProperty)
/* harmony export */ });
/* harmony import */ var _toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./toPropertyKey.js */ "./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js");

function _defineProperty(e, r, t) {
  return (r = (0,_toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/get.js":
/*!********************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/get.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _get)
/* harmony export */ });
/* harmony import */ var _superPropBase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./superPropBase.js */ "./node_modules/@babel/runtime/helpers/esm/superPropBase.js");

function _get() {
  return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) {
    var p = (0,_superPropBase_js__WEBPACK_IMPORTED_MODULE_0__["default"])(e, t);
    if (p) {
      var n = Object.getOwnPropertyDescriptor(p, t);
      return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value;
    }
  }, _get.apply(null, arguments);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _getPrototypeOf)
/* harmony export */ });
function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, _getPrototypeOf(t);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/inherits.js":
/*!*************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/inherits.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _inherits)
/* harmony export */ });
/* harmony import */ var _setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./setPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js");

function _inherits(t, e) {
  if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: !0,
      configurable: !0
    }
  }), Object.defineProperty(t, "prototype", {
    writable: !1
  }), e && (0,_setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(t, e);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _iterableToArray)
/* harmony export */ });
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _iterableToArrayLimit)
/* harmony export */ });
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _nonIterableRest)
/* harmony export */ });
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _nonIterableSpread)
/* harmony export */ });
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _possibleConstructorReturn)
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _assertThisInitialized_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assertThisInitialized.js */ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");


function _possibleConstructorReturn(t, e) {
  if (e && ("object" == (0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(e) || "function" == typeof e)) return e;
  if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
  return (0,_assertThisInitialized_js__WEBPACK_IMPORTED_MODULE_1__["default"])(t);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _setPrototypeOf)
/* harmony export */ });
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, _setPrototypeOf(t, e);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _slicedToArray)
/* harmony export */ });
/* harmony import */ var _arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js");
/* harmony import */ var _iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArrayLimit.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableRest.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js");




function _slicedToArray(r, e) {
  return (0,_arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r) || (0,_iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__["default"])(r, e) || (0,_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(r, e) || (0,_nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/superPropBase.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/superPropBase.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _superPropBase)
/* harmony export */ });
/* harmony import */ var _getPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");

function _superPropBase(t, o) {
  for (; !{}.hasOwnProperty.call(t, o) && null !== (t = (0,_getPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(t)););
  return t;
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _toConsumableArray)
/* harmony export */ });
/* harmony import */ var _arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithoutHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js");
/* harmony import */ var _iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableSpread.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js");




function _toConsumableArray(r) {
  return (0,_arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r) || (0,_iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])(r) || (0,_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(r) || (0,_nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toPrimitive.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toPrimitive.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ toPrimitive)
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");

function toPrimitive(t, r) {
  if ("object" != (0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != (0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ toPropertyKey)
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _toPrimitive_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./toPrimitive.js */ "./node_modules/@babel/runtime/helpers/esm/toPrimitive.js");


function toPropertyKey(t) {
  var i = (0,_toPrimitive_js__WEBPACK_IMPORTED_MODULE_1__["default"])(t, "string");
  return "symbol" == (0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(i) ? i : i + "";
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/typeof.js":
/*!***********************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/typeof.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _typeof)
/* harmony export */ });
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _unsupportedIterableToArray)
/* harmony export */ });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r, a) : void 0;
  }
}


/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/native.js":
/*!******************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/native.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({ randomUUID });


/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/regex.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/regex.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i);


/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/rng.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/rng.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
    if (!getRandomValues) {
        if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
            throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
        }
        getRandomValues = crypto.getRandomValues.bind(crypto);
    }
    return getRandomValues(rnds8);
}


/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/stringify.js":
/*!*********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/stringify.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   unsafeStringify: () => (/* binding */ unsafeStringify)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-browser/validate.js");

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] +
        '-' +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] +
        '-' +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] +
        '-' +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] +
        '-' +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr, offset = 0) {
    const uuid = unsafeStringify(arr, offset);
    if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
        throw TypeError('Stringified UUID is invalid');
    }
    return uuid;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);


/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v4.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v4.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _native_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./native.js */ "./node_modules/uuid/dist/esm-browser/native.js");
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-browser/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-browser/stringify.js");



function v4(options, buf, offset) {
    if (_native_js__WEBPACK_IMPORTED_MODULE_0__["default"].randomUUID && !buf && !options) {
        return _native_js__WEBPACK_IMPORTED_MODULE_0__["default"].randomUUID();
    }
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? (0,_rng_js__WEBPACK_IMPORTED_MODULE_1__["default"])();
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    if (buf) {
        offset = offset || 0;
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        }
        for (let i = 0; i < 16; ++i) {
            buf[offset + i] = rnds[i];
        }
        return buf;
    }
    return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_2__.unsafeStringify)(rnds);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);


/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/validate.js":
/*!********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/validate.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/uuid/dist/esm-browser/regex.js");

function validate(uuid) {
    return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__["default"].test(uuid);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);


/***/ }),

/***/ "./src/js/utils/ajax.js":
/*!******************************!*\
  !*** ./src/js/utils/ajax.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ajaxRequest: () => (/* binding */ ajaxRequest),
/* harmony export */   debounce: () => (/* binding */ debounce),
/* harmony export */   formatFormData: () => (/* binding */ formatFormData),
/* harmony export */   wpAjax: () => (/* binding */ wpAjax)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./logger */ "./src/js/utils/logger.js");



function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * AJAX utilities for Product Estimator plugin
 *
 * Functions for handling AJAX requests and related operations.
 */

 // Import the entire module instead of direct imports

var logger = _logger__WEBPACK_IMPORTED_MODULE_3__.createLogger('UtilsAjax'); // Use the createLogger from the module

/**
 * Handle AJAX request with error handling and consistent response format
 * @param {object} options - AJAX options
 * @returns {Promise} - Promise resolving to response data
 */
function ajaxRequest(options) {
  var _window$productEstima;
  var $ = jQuery;

  // Default options
  var defaults = {
    url: ((_window$productEstima = window.productEstimatorVars) === null || _window$productEstima === void 0 ? void 0 : _window$productEstima.ajax_url) || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
    type: 'POST',
    dataType: 'json'
  };

  // Merge defaults with provided options
  var settings = _objectSpread(_objectSpread({}, defaults), options);
  return new Promise(function (resolve, reject) {
    $.ajax(_objectSpread(_objectSpread({}, settings), {}, {
      success: function success(response) {
        if (response.success) {
          resolve(response.data);
        } else {
          var _response$data;
          var error = new Error(((_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.message) || 'Unknown error');
          error.data = response.data;
          reject(error);
        }
      },
      error: function error(xhr, status, _error) {
        logger.error('AJAX error:', status, _error);
        reject(new Error(_error));
      }
    }));
  });
}

/**
 * Creates a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} - Debounced function
 */
function debounce(func) {
  var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 300;
  var timeout;
  return function executedFunction() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var later = function later() {
      clearTimeout(timeout);
      func.apply(void 0, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Makes a simple WordPress AJAX request with FormData
 * @param {string} action - WordPress AJAX action name
 * @param {object} data - Data to send (excluding action and nonce)
 * @param {string} nonce - Security nonce (defaults to productEstimatorVars.nonce)
 * @returns {Promise} - Promise resolving to response data
 */
function wpAjax(action) {
  var _window$productEstima2, _window$productEstima3;
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var nonce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  // Use the global nonce if available and none provided
  var securityNonce = nonce || ((_window$productEstima2 = window.productEstimatorVars) === null || _window$productEstima2 === void 0 ? void 0 : _window$productEstima2.nonce) || '';

  // Create FormData object
  var formData = new FormData();
  formData.append('action', action);
  formData.append('nonce', securityNonce);

  // Add all other data
  Object.entries(data).forEach(function (_ref) {
    var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    // Skip null or undefined values
    if (value === null || value === undefined) {
      return;
    }

    // Handle arrays and objects by JSON-stringifying them
    if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(value) === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  // Make the fetch request
  return fetch(((_window$productEstima3 = window.productEstimatorVars) === null || _window$productEstima3 === void 0 ? void 0 : _window$productEstima3.ajax_url) || '/wp-admin/admin-ajax.php', {
    method: 'POST',
    credentials: 'same-origin',
    body: formData
  }).then(function (response) {
    if (!response.ok) {
      throw new Error("Network response was not ok: ".concat(response.status));
    }
    return response.json();
  }).then(function (response) {
    if (response.success) {
      return response.data;
    } else {
      var _response$data2;
      var error = new Error(((_response$data2 = response.data) === null || _response$data2 === void 0 ? void 0 : _response$data2.message) || 'Unknown error');
      error.data = response.data;
      throw error;
    }
  });
}

/**
 * Format form data for AJAX submissions
 * @param {FormData | object | string} formData - The form data to format
 * @returns {string} Formatted form data string
 */
function formatFormData(formData) {
  if (typeof formData === 'string') {
    return formData;
  }
  if (formData instanceof FormData) {
    var params = new URLSearchParams();
    var _iterator = _createForOfIteratorHelper(formData.entries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_step.value, 2),
          key = _step$value[0],
          value = _step$value[1];
        params.append(key, value);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return params.toString();
  }

  // If it's an object, convert to URLSearchParams
  return new URLSearchParams(formData).toString();
}

/***/ }),

/***/ "./src/js/utils/dialog-helpers.js":
/*!****************************************!*\
  !*** ./src/js/utils/dialog-helpers.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   showConfirmDialog: () => (/* binding */ showConfirmDialog),
/* harmony export */   showDeleteConfirmDialog: () => (/* binding */ showDeleteConfirmDialog),
/* harmony export */   showErrorDialog: () => (/* binding */ showErrorDialog),
/* harmony export */   showSuccessDialog: () => (/* binding */ showSuccessDialog),
/* harmony export */   showWarningDialog: () => (/* binding */ showWarningDialog)
/* harmony export */ });
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./logger */ "./src/js/utils/logger.js");
/**
 * dialog-helpers.js
 * 
 * Utility functions for standardized dialog usage across the application.
 * Provides a consistent API for showing different types of dialogs.
 */

// Import directly from logger to avoid circular dependency

var logger = (0,_logger__WEBPACK_IMPORTED_MODULE_0__.createLogger)('DialogHelpers');

/**
 * Show a success message dialog
 * @param {object} modalManager - The modal manager instance
 * @param {string} message - The success message to display
 * @param {string} type - The entity type (product, room, estimate)
 * @param {Function} onConfirm - Callback for when the user confirms
 * @param {string} title - The dialog title
 * @returns {boolean} - Whether the dialog was shown successfully
 */
function showSuccessDialog(modalManager, message) {
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'default';
  var onConfirm = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var title = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'Success';
  if (!modalManager || !modalManager.confirmationDialog) {
    logger.error('Cannot show success dialog: modal manager or confirmation dialog not available');
    return false;
  }
  modalManager.confirmationDialog.show({
    title: title,
    message: message,
    confirmText: 'OK',
    cancelText: false,
    // No cancel button
    action: 'success',
    type: type,
    showCancel: false,
    onConfirm: onConfirm
  });
  return true;
}

/**
 * Show an error message dialog
 * @param {object} modalManager - The modal manager instance
 * @param {string} message - The error message to display
 * @param {string} type - The entity type (product, room, estimate)
 * @param {Function} onConfirm - Callback for when the user confirms
 * @param {string} title - The dialog title
 * @returns {boolean} - Whether the dialog was shown successfully
 */
function showErrorDialog(modalManager, message) {
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'default';
  var onConfirm = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var title = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'Error';
  if (!modalManager || !modalManager.confirmationDialog) {
    logger.error('Cannot show error dialog: modal manager or confirmation dialog not available');
    return false;
  }
  modalManager.confirmationDialog.show({
    title: title,
    message: message,
    confirmText: 'OK',
    cancelText: false,
    // No cancel button
    action: 'error',
    type: type,
    showCancel: false,
    onConfirm: onConfirm
  });
  return true;
}

/**
 * Show a warning message dialog
 * @param {object} modalManager - The modal manager instance
 * @param {string} message - The warning message to display
 * @param {string} type - The entity type (product, room, estimate)
 * @param {Function} onConfirm - Callback for when the user confirms
 * @param {string} title - The dialog title
 * @returns {boolean} - Whether the dialog was shown successfully
 */
function showWarningDialog(modalManager, message) {
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'default';
  var onConfirm = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var title = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'Warning';
  if (!modalManager || !modalManager.confirmationDialog) {
    logger.error('Cannot show warning dialog: modal manager or confirmation dialog not available');
    return false;
  }
  modalManager.confirmationDialog.show({
    title: title,
    message: message,
    confirmText: 'OK',
    cancelText: false,
    // No cancel button
    action: 'warning',
    type: type,
    showCancel: false,
    onConfirm: onConfirm
  });
  return true;
}

/**
 * Show a delete confirmation dialog
 * @param {object} modalManager - The modal manager instance
 * @param {string} message - The confirmation message to display
 * @param {Function} onConfirm - Callback for when the user confirms
 * @param {string} type - The entity type (product, room, estimate)
 * @param {Function} onCancel - Callback for when the user cancels
 * @param {string} title - The dialog title
 * @returns {boolean} - Whether the dialog was shown successfully
 */
function showDeleteConfirmDialog(modalManager, message, onConfirm) {
  var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'default';
  var onCancel = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var title = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'Confirm Deletion';
  if (!modalManager || !modalManager.confirmationDialog) {
    logger.error('Cannot show delete confirmation dialog: modal manager or confirmation dialog not available');
    return false;
  }
  modalManager.confirmationDialog.show({
    title: title,
    message: message,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    action: 'delete',
    type: type,
    showCancel: true,
    onConfirm: onConfirm,
    onCancel: onCancel
  });
  return true;
}

/**
 * Show a standard confirmation dialog
 * @param {object} modalManager - The modal manager instance
 * @param {string} message - The confirmation message to display
 * @param {Function} onConfirm - Callback for when the user confirms
 * @param {string} type - The entity type (product, room, estimate)
 * @param {Function} onCancel - Callback for when the user cancels
 * @param {string} title - The dialog title
 * @returns {boolean} - Whether the dialog was shown successfully
 */
function showConfirmDialog(modalManager, message, onConfirm) {
  var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'default';
  var onCancel = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var title = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'Confirm Action';
  if (!modalManager || !modalManager.confirmationDialog) {
    logger.error('Cannot show confirmation dialog: modal manager or confirmation dialog not available');
    return false;
  }
  modalManager.confirmationDialog.show({
    title: title,
    message: message,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    action: 'default',
    type: type,
    showCancel: true,
    onConfirm: onConfirm,
    onCancel: onCancel
  });
  return true;
}

// Default export with all helper functions
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  showSuccessDialog: showSuccessDialog,
  showErrorDialog: showErrorDialog,
  showWarningDialog: showWarningDialog,
  showDeleteConfirmDialog: showDeleteConfirmDialog,
  showConfirmDialog: showConfirmDialog
});

/***/ }),

/***/ "./src/js/utils/dom.js":
/*!*****************************!*\
  !*** ./src/js/utils/dom.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addEventListenerOnce: () => (/* binding */ addEventListenerOnce),
/* harmony export */   closest: () => (/* binding */ closest),
/* harmony export */   createElement: () => (/* binding */ createElement),
/* harmony export */   createElementFromHTML: () => (/* binding */ createElementFromHTML),
/* harmony export */   findParentBySelector: () => (/* binding */ findParentBySelector),
/* harmony export */   forceElementVisibility: () => (/* binding */ forceElementVisibility),
/* harmony export */   insertAfter: () => (/* binding */ insertAfter),
/* harmony export */   removeElement: () => (/* binding */ removeElement),
/* harmony export */   toggleVisibility: () => (/* binding */ toggleVisibility)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./logger */ "./src/js/utils/logger.js");


/**
 * DOM utility functions for Product Estimator plugin
 *
 * Enhanced DOM manipulation utilities that combine the existing functionality
 * with additional helpers.
 */


var logger = (0,_logger__WEBPACK_IMPORTED_MODULE_2__.createLogger)('UtilsDom');

/**
 * Create an element with attributes and children
 * @param {string} tag - Element tag name
 * @param {object} attributes - Element attributes
 * @param {Array|string} children - Child elements or text
 * @returns {HTMLElement} Created element
 */
function createElement(tag) {
  var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var element = document.createElement(tag);

  // Set attributes
  Object.entries(attributes).forEach(function (_ref) {
    var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(function (_ref3) {
        var _ref4 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref3, 2),
          dataKey = _ref4[0],
          dataValue = _ref4[1];
        element.dataset[dataKey] = dataValue;
      });
    } else if (key === 'style' && (0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(value) === 'object') {
      Object.entries(value).forEach(function (_ref5) {
        var _ref6 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref5, 2),
          prop = _ref6[0],
          val = _ref6[1];
        element.style[prop] = val;
      });
    } else {
      element.setAttribute(key, value);
    }
  });

  // Add children
  if (typeof children === 'string') {
    element.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach(function (child) {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });
  }
  return element;
}

/**
 * Create a HTML element from HTML string
 * @param {string} html - HTML string
 * @returns {HTMLElement} Created element
 */
function createElementFromHTML(html) {
  var div = document.createElement('div');
  div.innerHTML = html.trim();
  return div.firstChild;
}

/**
 * Find the closest ancestor matching a selector
 * @param {HTMLElement} element - Element to start from
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null} Matching ancestor or null
 */
function closest(element, selector) {
  if (element.closest) {
    return element.closest(selector);
  }

  // Polyfill for older browsers
  var current = element;
  while (current && current !== document) {
    if (current.matches(selector)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * Toggle element visibility
 * @param {HTMLElement} element - Element to toggle
 * @param {boolean} [show] - Whether to show or hide (if not provided, toggles current state)
 * @returns {boolean} New visibility state
 */
function toggleVisibility(element, show) {
  if (!element) return false;

  // If show parameter not provided, toggle based on current state
  var newState = show !== undefined ? show : element.style.display === 'none';
  element.style.display = newState ? '' : 'none';
  return newState;
}

/**
 * Force element visibility using multiple techniques
 * @param {HTMLElement} element - Element to make visible
 * @returns {HTMLElement|null} The element for chaining or null if not found
 */
function forceElementVisibility(element) {
  if (!element) {
    logger.error('Cannot show null element');
    return null;
  }

  // 1. Apply inline styles with !important to override any CSS rules
  element.style.cssText += 'display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;';

  // 2. Remove any hiding classes
  ['hidden', 'hide', 'invisible', 'd-none', 'display-none'].forEach(function (cls) {
    if (element.classList.contains(cls)) {
      element.classList.remove(cls);
    }
  });

  // 3. Add visible classes (some frameworks use these)
  element.classList.add('visible', 'd-block');

  // 4. Ensure parent elements are also visible
  var parent = element.parentElement;
  var checkedParents = new Set(); // Prevent infinite loops

  while (parent && parent !== document.body && !checkedParents.has(parent)) {
    checkedParents.add(parent);
    var parentStyle = window.getComputedStyle(parent);
    if (parentStyle.display === 'none') {
      parent.style.cssText += 'display: block !important;';
    }
    parent = parent.parentElement;
  }

  // 5. Use jQuery as a fallback if available
  if (typeof jQuery !== 'undefined') {
    jQuery(element).show();
  }
  return element;
}

/**
 * Find parent element by selector
 * @param {HTMLElement} element - Element to start search from
 * @param {string} selector - CSS selector to match
 * @returns {HTMLElement|null} The matching parent or null
 */
function findParentBySelector(element, selector) {
  return closest(element, selector);
}

/**
 * Insert element after a reference element
 * @param {HTMLElement} newElement - Element to insert
 * @param {HTMLElement} referenceElement - Element to insert after
 * @returns {HTMLElement} The inserted element
 */
function insertAfter(newElement, referenceElement) {
  if (!referenceElement || !referenceElement.parentNode) {
    throw new Error('Reference element must be in the DOM');
  }
  referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling);
  return newElement;
}

/**
 * Remove element from DOM with optional animation
 * @param {HTMLElement} element - Element to remove
 * @param {boolean} animate - Whether to animate the removal
 * @returns {Promise} Promise that resolves when removal is complete
 */
function removeElement(element) {
  var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!element) return Promise.resolve();
  if (!animate || !element.parentNode) {
    // Remove immediately if no animation or no parent
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    return Promise.resolve();
  }

  // With animation
  return new Promise(function (resolve) {
    // First fade out
    element.style.transition = 'opacity 0.3s ease';
    element.style.opacity = '0';

    // Then remove after animation completes
    setTimeout(function () {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      resolve();
    }, 300);
  });
}

/**
 * Add event listener that only fires once
 * @param {HTMLElement} element - Element to add listener to
 * @param {string} eventType - Event type (e.g., 'click')
 * @param {Function} handler - Event handler
 * @param {boolean} useCapture - Whether to use capture phase
 */
function addEventListenerOnce(element, eventType, handler) {
  var useCapture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  if (!element) return;
  var _wrappedHandler = function wrappedHandler(e) {
    // Remove the event listener
    element.removeEventListener(eventType, _wrappedHandler, useCapture);
    // Call the original handler
    handler(e);
  };
  element.addEventListener(eventType, _wrappedHandler, useCapture);
}

/***/ }),

/***/ "./src/js/utils/format.js":
/*!********************************!*\
  !*** ./src/js/utils/format.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   currency: () => (/* binding */ currency),
/* harmony export */   debounce: () => (/* binding */ debounce),
/* harmony export */   formatDate: () => (/* binding */ formatDate),
/* harmony export */   formatPrice: () => (/* binding */ formatPrice),
/* harmony export */   formatPriceRange: () => (/* binding */ formatPriceRange),
/* harmony export */   objectToQueryString: () => (/* binding */ objectToQueryString),
/* harmony export */   sanitizeHTML: () => (/* binding */ sanitizeHTML),
/* harmony export */   throttle: () => (/* binding */ throttle),
/* harmony export */   truncateText: () => (/* binding */ truncateText)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");


function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * Formatting utilities for Product Estimator plugin
 *
 * Functions for formatting different types of data.
 */

/**
 * Format a price with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currencySymbol - Currency symbol
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted price
 */
/**
 * Format a value as currency using the browser's Intl.NumberFormat
 * @param {number|string} amount - Amount to format
 * @param {string} locale - Locale string (e.g., 'en-US')
 * @param {string} currency - Currency code (e.g., 'USD')
 * @returns {string} Formatted currency string
 */
function currency(amount) {
  var locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en-US';
  var currency = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'USD';
  // Handle undefined or null amount
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }

  // Convert string to number if needed
  var numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(numAmount);
}

/**
 *
 * @param amount
 * @param currencySymbol
 * @param decimals
 */
function formatPrice(amount) {
  var currencySymbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '$';
  var decimals = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
  // Handle undefined or null amount
  if (amount === undefined || amount === null) {
    return "".concat(currencySymbol, "0.00");
  }

  // Convert to number if it's a string
  var numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Check if it's a valid number
  if (isNaN(numAmount)) {
    return "".concat(currencySymbol, "0.00");
  }
  return currencySymbol + numAmount.toFixed(decimals);
}

/**
 * Format a price range with currency symbol.
 * If min and max prices are the same, it shows a single price.
 * @param {number|string|null|undefined} minPrice - Minimum price
 * @param {number|string|null|undefined} maxPrice - Maximum price
 * @param {string} currencySymbol - Currency symbol
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted price range string
 */
function formatPriceRange(minPrice, maxPrice) {
  var currencySymbol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '$';
  var decimals = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2;
  var numMinPrice = minPrice === undefined || minPrice === null ? 0 : typeof minPrice === 'string' ? parseFloat(minPrice.replace(/[^0-9.-]+/g, "")) : minPrice;
  var numMaxPrice = maxPrice === undefined || maxPrice === null ? 0 : typeof maxPrice === 'string' ? parseFloat(maxPrice.replace(/[^0-9.-]+/g, "")) : maxPrice;
  if (isNaN(numMinPrice) && isNaN(numMaxPrice)) {
    return "".concat(formatPrice(0, currencySymbol, decimals)); // Or some other default like "N/A"
  }
  if (isNaN(numMinPrice)) {
    return formatPrice(numMaxPrice, currencySymbol, decimals);
  }
  if (isNaN(numMaxPrice)) {
    return formatPrice(numMinPrice, currencySymbol, decimals);
  }
  if (numMinPrice === numMaxPrice) {
    return formatPrice(numMinPrice, currencySymbol, decimals);
  }
  return "".concat(formatPrice(numMinPrice, currencySymbol, decimals), " - ").concat(formatPrice(numMaxPrice, currencySymbol, decimals));
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func) {
  var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 300;
  var timeout;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var context = this;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      return func.apply(context, args);
    }, wait);
  };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds to limit invocation
 * @returns {Function} Throttled function
 */
function throttle(func) {
  var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 300;
  var lastCall = 0;
  return function () {
    var now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return func.apply(this, args);
    }
  };
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
function sanitizeHTML(html) {
  if (!html) return '';

  // Use a temporary element to sanitize the HTML
  var temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

/**
 * Format a date according to locale preferences
 * @param {Date|string} date - Date to format or ISO string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
function formatDate(date) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // Default options
  var defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  // Merge options
  var formatOptions = _objectSpread(_objectSpread({}, defaultOptions), options);

  // Convert string to Date if needed
  var dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  // Format date according to locale
  return new Intl.DateTimeFormat(navigator.language, formatOptions).format(dateObj);
}

/**
 * Truncate text to a specific length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} ellipsis - Ellipsis string
 * @returns {string} Truncated text
 */
function truncateText(text) {
  var maxLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  var ellipsis = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '...';
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Convert object to URL query string
 * @param {object} obj - Object to convert
 * @returns {string} URL query string (without leading ?)
 */
function objectToQueryString(obj) {
  return Object.entries(obj).filter(function (_ref) {
    var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref, 2),
      _ = _ref2[0],
      value = _ref2[1];
    return value !== undefined && value !== null;
  }).map(function (_ref3) {
    var _ref4 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref3, 2),
      key = _ref4[0],
      value = _ref4[1];
    if (Array.isArray(value)) {
      return value.map(function (val) {
        return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(val));
      }).join('&');
    }
    return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(value));
  }).join('&');
}

/***/ }),

/***/ "./src/js/utils/index.js":
/*!*******************************!*\
  !*** ./src/js/utils/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LabelManager: () => (/* reexport safe */ _labels__WEBPACK_IMPORTED_MODULE_7__.LabelManager),
/* harmony export */   addEventListenerOnce: () => (/* binding */ addEventListenerOnce),
/* harmony export */   ajax: () => (/* reexport module object */ _ajax__WEBPACK_IMPORTED_MODULE_1__),
/* harmony export */   ajaxRequest: () => (/* binding */ ajaxRequest),
/* harmony export */   clearFieldError: () => (/* binding */ clearFieldError),
/* harmony export */   closeMainPluginLogGroup: () => (/* binding */ closeMainPluginLogGroup),
/* harmony export */   closest: () => (/* binding */ closest),
/* harmony export */   createElement: () => (/* binding */ createElement),
/* harmony export */   createElementFromHTML: () => (/* binding */ createElementFromHTML),
/* harmony export */   createLogger: () => (/* binding */ createLogger),
/* harmony export */   debounce: () => (/* binding */ debounce),
/* harmony export */   dialogHelpers: () => (/* reexport module object */ _dialog_helpers__WEBPACK_IMPORTED_MODULE_6__),
/* harmony export */   dom: () => (/* reexport module object */ _dom__WEBPACK_IMPORTED_MODULE_2__),
/* harmony export */   error: () => (/* binding */ error),
/* harmony export */   findParentBySelector: () => (/* binding */ findParentBySelector),
/* harmony export */   forceElementVisibility: () => (/* binding */ forceElementVisibility),
/* harmony export */   format: () => (/* reexport module object */ _format__WEBPACK_IMPORTED_MODULE_3__),
/* harmony export */   formatPrice: () => (/* binding */ formatPrice),
/* harmony export */   get: () => (/* binding */ get),
/* harmony export */   insertAfter: () => (/* binding */ insertAfter),
/* harmony export */   labelManager: () => (/* reexport safe */ _labels__WEBPACK_IMPORTED_MODULE_7__.labelManager),
/* harmony export */   labels: () => (/* reexport module object */ _labels__WEBPACK_IMPORTED_MODULE_7__),
/* harmony export */   log: () => (/* binding */ log),
/* harmony export */   loggerModule: () => (/* reexport module object */ _logger__WEBPACK_IMPORTED_MODULE_5__),
/* harmony export */   removeElement: () => (/* binding */ removeElement),
/* harmony export */   sanitizeHTML: () => (/* binding */ sanitizeHTML),
/* harmony export */   showConfirmDialog: () => (/* binding */ showConfirmDialog),
/* harmony export */   showDeleteConfirmDialog: () => (/* binding */ showDeleteConfirmDialog),
/* harmony export */   showErrorDialog: () => (/* binding */ showErrorDialog),
/* harmony export */   showFieldError: () => (/* binding */ showFieldError),
/* harmony export */   showNotice: () => (/* binding */ showNotice),
/* harmony export */   showSuccessDialog: () => (/* binding */ showSuccessDialog),
/* harmony export */   showWarningDialog: () => (/* binding */ showWarningDialog),
/* harmony export */   toggleVisibility: () => (/* binding */ toggleVisibility),
/* harmony export */   validateEmail: () => (/* binding */ validateEmail),
/* harmony export */   validateNumber: () => (/* binding */ validateNumber),
/* harmony export */   validateRequired: () => (/* binding */ validateRequired),
/* harmony export */   validation: () => (/* reexport module object */ _validation__WEBPACK_IMPORTED_MODULE_4__),
/* harmony export */   warn: () => (/* binding */ warn)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _ajax__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ajax */ "./src/js/utils/ajax.js");
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./dom */ "./src/js/utils/dom.js");
/* harmony import */ var _format__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./format */ "./src/js/utils/format.js");
/* harmony import */ var _validation__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./validation */ "./src/js/utils/validation.js");
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./logger */ "./src/js/utils/logger.js");
/* harmony import */ var _dialog_helpers__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./dialog-helpers */ "./src/js/utils/dialog-helpers.js");
/* harmony import */ var _labels__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./labels */ "./src/js/utils/labels.js");

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * Main utilities export file
 *
 * This module exports all utility functions from submodules,
 * providing a unified API while maintaining organization.
 */

// Import all utility modules








// Export individual modules for direct imports


// Export specific items from labels

var log = _logger__WEBPACK_IMPORTED_MODULE_5__.log,
  warn = _logger__WEBPACK_IMPORTED_MODULE_5__.warn,
  error = _logger__WEBPACK_IMPORTED_MODULE_5__.error,
  createLogger = _logger__WEBPACK_IMPORTED_MODULE_5__.createLogger,
  closeMainPluginLogGroup = _logger__WEBPACK_IMPORTED_MODULE_5__.closeMainPluginLogGroup;

// Export all utilities as named exports for backward compatibility

var ajaxRequest = _ajax__WEBPACK_IMPORTED_MODULE_1__.ajaxRequest,
  debounce = _ajax__WEBPACK_IMPORTED_MODULE_1__.debounce;

var createElement = _dom__WEBPACK_IMPORTED_MODULE_2__.createElement,
  createElementFromHTML = _dom__WEBPACK_IMPORTED_MODULE_2__.createElementFromHTML,
  closest = _dom__WEBPACK_IMPORTED_MODULE_2__.closest,
  toggleVisibility = _dom__WEBPACK_IMPORTED_MODULE_2__.toggleVisibility,
  forceElementVisibility = _dom__WEBPACK_IMPORTED_MODULE_2__.forceElementVisibility,
  findParentBySelector = _dom__WEBPACK_IMPORTED_MODULE_2__.findParentBySelector,
  insertAfter = _dom__WEBPACK_IMPORTED_MODULE_2__.insertAfter,
  removeElement = _dom__WEBPACK_IMPORTED_MODULE_2__.removeElement,
  addEventListenerOnce = _dom__WEBPACK_IMPORTED_MODULE_2__.addEventListenerOnce;

var formatPrice = _format__WEBPACK_IMPORTED_MODULE_3__.formatPrice,
  sanitizeHTML = _format__WEBPACK_IMPORTED_MODULE_3__.sanitizeHTML;

var validateEmail = _validation__WEBPACK_IMPORTED_MODULE_4__.validateEmail,
  validateNumber = _validation__WEBPACK_IMPORTED_MODULE_4__.validateNumber,
  validateRequired = _validation__WEBPACK_IMPORTED_MODULE_4__.validateRequired,
  showFieldError = _validation__WEBPACK_IMPORTED_MODULE_4__.showFieldError,
  clearFieldError = _validation__WEBPACK_IMPORTED_MODULE_4__.clearFieldError,
  showNotice = _validation__WEBPACK_IMPORTED_MODULE_4__.showNotice;

// Re-export dialog helper functions from the default export

var showSuccessDialog = _dialog_helpers__WEBPACK_IMPORTED_MODULE_6__["default"].showSuccessDialog;
var showErrorDialog = _dialog_helpers__WEBPACK_IMPORTED_MODULE_6__["default"].showErrorDialog;
var showWarningDialog = _dialog_helpers__WEBPACK_IMPORTED_MODULE_6__["default"].showWarningDialog;
var showDeleteConfirmDialog = _dialog_helpers__WEBPACK_IMPORTED_MODULE_6__["default"].showDeleteConfirmDialog;
var showConfirmDialog = _dialog_helpers__WEBPACK_IMPORTED_MODULE_6__["default"].showConfirmDialog;

// Export a convenience function to safely access nested properties
/**
 * Safely access nested properties in an object
 * @param {object} obj - The object to access
 * @param {string} path - The path to the property (dot notation, e.g., 'prop1.prop2.prop3')
 * @param {*} defaultValue - The value to return if the property doesn't exist
 * @returns {*} The value at the specified path or the default value if not found
 */
function get(obj, path) {
  var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var keys = path.split('.');
  var result = obj;
  var _iterator = _createForOfIteratorHelper(keys),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var key = _step.value;
      if (result === undefined || result === null || (0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(result) !== 'object') {
        // Added type check for robustnest
        return defaultValue;
      }
      result = result[key];
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return result === undefined ? defaultValue : result;
}

/***/ }),

/***/ "./src/js/utils/labels.js":
/*!********************************!*\
  !*** ./src/js/utils/labels.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LabelManager: () => (/* binding */ LabelManager),
/* harmony export */   labelManager: () => (/* binding */ labelManager)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");




function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * Label Manager utility for handling dynamic labels in the frontend
 * 
 * @since 2.0.0
 */
var LabelManager = /*#__PURE__*/function () {
  function LabelManager() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__["default"])(this, LabelManager);
    this.labels = window.productEstimatorLabels || {};
    this.version = this.labels._version || '2.0.0';

    // Local cache for processed labels
    this.cache = new Map();

    // List of high-priority labels to preload
    this.criticalLabels = ['buttons.save_estimate', 'buttons.print_estimate', 'buttons.email_estimate', 'buttons.add_product', 'buttons.add_room', 'forms.estimate_name', 'messages.product_added', 'messages.estimate_saved', 'messages.room_added'];

    // Preload critical labels
    this.preloadCriticalLabels();
  }

  /**
   * Get a label value using dot notation with client-side caching
   * 
   * @param {string} key - Label key (e.g., 'buttons.save_estimate')
   * @param {string} defaultValue - Default value if label not found
   * @returns {string} Label value or default
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__["default"])(LabelManager, [{
    key: "get",
    value: function get(key) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      // Check cache first for the fastest retrieval
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }

      // Check if we have a flattened version first (faster lookup)
      if (this.labels._flat && this.labels._flat[key] !== undefined) {
        var _value = this.labels._flat[key];
        this.cache.set(key, _value); // Cache for future
        return _value;
      }

      // Standard dot notation lookup
      var keys = key.split('.');
      var value = this.labels;
      var _iterator = _createForOfIteratorHelper(keys),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var k = _step.value;
          if (value && value[k] !== undefined) {
            value = value[k];
          } else {
            // Log missing label in development
            if (window.productEstimatorDebug) {
              console.warn("Label not found: ".concat(key));
            }
            this.cache.set(key, defaultValue); // Cache the default too
            return defaultValue;
          }
        }

        // Cache the result for next time
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.cache.set(key, value);
      return value;
    }

    /**
     * Format a label with replacements
     * 
     * @param {string} key - Label key
     * @param {Object} replacements - Key-value pairs for replacements
     * @param {string} defaultValue - Default value if label not found
     * @returns {string} Formatted label
     */
  }, {
    key: "format",
    value: function format(key) {
      var replacements = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      var label = this.get(key, defaultValue);

      // Replace placeholders like {name} with actual values
      Object.keys(replacements).forEach(function (placeholder) {
        label = label.replace(new RegExp("{".concat(placeholder, "}"), 'g'), replacements[placeholder]);
      });
      return label;
    }

    /**
     * Get all labels for a category
     * 
     * @param {string} category - Category name (e.g., 'buttons', 'forms')
     * @returns {Object} Category labels
     */
  }, {
    key: "getCategory",
    value: function getCategory(category) {
      return this.labels[category] || {};
    }

    /**
     * Check if a label exists
     * 
     * @param {string} key - Label key
     * @returns {boolean} True if label exists
     */
  }, {
    key: "exists",
    value: function exists(key) {
      return this.get(key, null) !== null;
    }

    /**
     * Get a label with fallback to legacy key format
     * 
     * @param {string} oldKey - Old label key format
     * @returns {string} Label value
     */
  }, {
    key: "getLegacy",
    value: function getLegacy(oldKey) {
      // Map old keys to new format
      var mapping = {
        'label_print_estimate': 'buttons.print_estimate',
        'label_save_estimate': 'buttons.save_estimate',
        'label_similar_products': 'buttons.similar_products',
        'label_product_includes': 'buttons.product_includes',
        'label_estimate_name': 'forms.estimate_name',
        'alert_add_product_success': 'messages.product_added'
        // Add more mappings as needed
      };
      var newKey = mapping[oldKey] || oldKey;
      return this.get(newKey, oldKey);
    }

    /**
     * Update DOM elements with labels
     * Looks for elements with data-label attributes
     * 
     * @param {HTMLElement} container - Container element to search within
     */
  }, {
    key: "updateDOM",
    value: function updateDOM() {
      var _this = this;
      var container = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
      var labelElements = container.querySelectorAll('[data-label]');
      labelElements.forEach(function (element) {
        var labelKey = element.dataset.label;
        var defaultValue = element.textContent;
        var label = _this.get(labelKey, defaultValue);

        // Check for format parameters
        var formatParams = element.dataset.labelParams;
        if (formatParams) {
          try {
            var params = JSON.parse(formatParams);
            element.textContent = _this.format(labelKey, params, defaultValue);
          } catch (e) {
            element.textContent = label;
          }
        } else {
          element.textContent = label;
        }
      });
    }

    /**
     * Get labels for a specific component
     * Useful for getting all labels needed by a component
     * 
     * @param {string} component - Component name
     * @param {Array} labelKeys - Array of label keys needed
     * @returns {Object} Object with label keys and values
     */
  }, {
    key: "getComponentLabels",
    value: function getComponentLabels(component, labelKeys) {
      var _this2 = this;
      var componentLabels = {};
      labelKeys.forEach(function (key) {
        componentLabels[key] = _this2.get(key);
      });
      return componentLabels;
    }

    /**
     * Search for labels containing a specific text
     * Useful for debugging and admin search functionality
     * 
     * @param {string} searchText - Text to search for
     * @returns {Array} Array of matching labels with their keys
     */
  }, {
    key: "search",
    value: function search(searchText) {
      var results = [];
      var searchLower = searchText.toLowerCase();
      var _searchRecursive = function searchRecursive(obj) {
        var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        Object.keys(obj).forEach(function (key) {
          var fullKey = prefix ? "".concat(prefix, ".").concat(key) : key;
          var value = obj[key];
          if (typeof value === 'string' && value.toLowerCase().includes(searchLower)) {
            results.push({
              key: fullKey,
              value: value
            });
          } else if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1__["default"])(value) === 'object' && value !== null) {
            _searchRecursive(value, fullKey);
          }
        });
      };
      _searchRecursive(this.labels);
      return results;
    }

    /**
     * Export labels for backup or sharing
     * 
     * @param {string} category - Optional category to export
     * @returns {string} JSON string of labels
     */
  }, {
    key: "export",
    value: function _export() {
      var category = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var exportData = category ? this.getCategory(category) : this.labels;
      return JSON.stringify(exportData, null, 2);
    }

    /**
     * Get debugging information
     * 
     * @returns {Object} Debug info
     */
  }, {
    key: "getDebugInfo",
    value: function getDebugInfo() {
      var _this3 = this;
      return {
        version: this.version,
        totalLabels: this.countLabels(),
        categories: Object.keys(this.labels).filter(function (k) {
          return k !== '_version' && k !== '_flat';
        }),
        missingLabels: this.findMissingLabels(),
        cacheSize: this.cache.size,
        criticalLabelsLoaded: this.criticalLabels.every(function (key) {
          return _this3.cache.has(key);
        })
      };
    }

    /**
     * Preload critical labels for better performance
     * This is called automatically on init, but can be called manually as well
     */
  }, {
    key: "preloadCriticalLabels",
    value: function preloadCriticalLabels() {
      var _this4 = this;
      // Preload each critical label into cache
      this.criticalLabels.forEach(function (key) {
        if (!_this4.cache.has(key)) {
          _this4.get(key);
        }
      });
      if (window.productEstimatorDebug) {
        console.log("Preloaded ".concat(this.criticalLabels.length, " critical labels"));
      }
    }

    /**
     * Count total number of labels
     * 
     * @returns {number} Total count
     */
  }, {
    key: "countLabels",
    value: function countLabels() {
      var count = 0;
      var _countRecursive = function countRecursive(obj) {
        Object.values(obj).forEach(function (value) {
          if (typeof value === 'string') {
            count++;
          } else if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1__["default"])(value) === 'object' && value !== null) {
            _countRecursive(value);
          }
        });
      };
      _countRecursive(this.labels);
      return count;
    }

    /**
     * Find missing labels referenced in the DOM
     * 
     * @returns {Array} Array of missing label keys
     */
  }, {
    key: "findMissingLabels",
    value: function findMissingLabels() {
      var _this5 = this;
      var missing = [];
      var labelElements = document.querySelectorAll('[data-label]');
      labelElements.forEach(function (element) {
        var labelKey = element.dataset.label;
        if (!_this5.exists(labelKey)) {
          missing.push(labelKey);
        }
      });
      return (0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(new Set(missing)); // Remove duplicates
    }
  }]);
}();

// Create singleton instance
var labelManager = new LabelManager();

// Add to window for easy debugging
if (window.productEstimatorDebug) {
  window.labelManager = labelManager;
}

/***/ }),

/***/ "./src/js/utils/logger.js":
/*!********************************!*\
  !*** ./src/js/utils/logger.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   closeMainPluginLogGroup: () => (/* binding */ closeMainPluginLogGroup),
/* harmony export */   createLogger: () => (/* binding */ createLogger),
/* harmony export */   error: () => (/* binding */ error),
/* harmony export */   log: () => (/* binding */ log),
/* harmony export */   warn: () => (/* binding */ warn)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");

var pluginLogGroupHasStarted = false;

// Setup global log capture system
if (typeof window !== 'undefined' && !window._logCapture) {
  // Initialize log capture array
  window._logCapture = [];

  // Save original console methods
  var originalLog = console.log;
  var originalError = console.error;
  var originalWarn = console.warn;
  var originalInfo = console.info;

  // Override console methods to capture logs
  console.log = function () {
    window._logCapture.push({
      type: 'log',
      time: new Date().toISOString(),
      args: Array.from(arguments).map(function (arg) {
        // Handle circular objects and DOM nodes gracefully
        try {
          if (arg instanceof HTMLElement) {
            return "[HTMLElement: ".concat(arg.tagName).concat(arg.id ? '#' + arg.id : '').concat(arg.className ? '.' + arg.className.replace(/\s+/g, '.') : '', "]");
          }

          // Safely stringify objects
          if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(arg) === 'object' && arg !== null) {
            try {
              return JSON.parse(JSON.stringify(arg));
            } catch (e) {
              return String(arg);
            }
          }
          return arg;
        } catch (e) {
          return String(arg);
        }
      })
    });
    originalLog.apply(console, arguments);
  };
  console.error = function () {
    window._logCapture.push({
      type: 'error',
      time: new Date().toISOString(),
      args: Array.from(arguments).map(function (arg) {
        try {
          if (arg instanceof Error) {
            return {
              message: arg.message,
              stack: arg.stack,
              name: arg.name
            };
          }
          return arg;
        } catch (e) {
          return String(arg);
        }
      })
    });
    originalError.apply(console, arguments);
  };
  console.warn = function () {
    window._logCapture.push({
      type: 'warn',
      time: new Date().toISOString(),
      args: Array.from(arguments).map(function (arg) {
        try {
          if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(arg) === 'object' && arg !== null) {
            try {
              return JSON.parse(JSON.stringify(arg));
            } catch (e) {
              return String(arg);
            }
          }
          return arg;
        } catch (e) {
          return String(arg);
        }
      })
    });
    originalWarn.apply(console, arguments);
  };
  console.info = function () {
    window._logCapture.push({
      type: 'info',
      time: new Date().toISOString(),
      args: Array.from(arguments).map(function (arg) {
        try {
          if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(arg) === 'object' && arg !== null) {
            try {
              return JSON.parse(JSON.stringify(arg));
            } catch (e) {
              return String(arg);
            }
          }
          return arg;
        } catch (e) {
          return String(arg);
        }
      })
    });
    originalInfo.apply(console, arguments);
  };

  // Add export function to window
  window.exportLogs = function () {
    var filename = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var maxSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;
    if (!window._logCapture || !window._logCapture.length) {
      console.error('No logs to export');
      return;
    }
    if (!filename) {
      // Generate filename with date and component id
      filename = "product-estimator-logs-".concat(new Date().toISOString().replace(/[:.]/g, '-'), ".json");
    }

    // Limit log size if needed
    var logs = window._logCapture;
    if (logs.length > maxSize) {
      var truncated = logs.length - maxSize;
      logs = logs.slice(-maxSize);
      logs.unshift({
        type: 'warn',
        time: new Date().toISOString(),
        args: ["Log file truncated. ".concat(truncated, " earliest entries removed.")]
      });
    }

    // Create blob and download
    var data = JSON.stringify(logs, null, 2);
    var blob = new Blob([data], {
      type: 'application/json'
    });
    var e = document.createEvent('MouseEvents');
    var a = document.createElement('a');
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['application/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
    console.log("Logs exported to ".concat(filename));
    return filename;
  };

  // Add clear function to window
  window.clearLogs = function () {
    var count = window._logCapture.length;
    window._logCapture = [];
    console.log("Log buffer cleared. ".concat(count, " entries removed."));
  };

  // Log initialization
  console.info('Debug: Log capture system initialized');
  console.info('Available commands:\n - window.exportLogs() - Export logs to file\n - window.clearLogs() - Clear log buffer');
}

/**
 * Closes the main plugin log group if it was started.
 * Used to properly group related log messages in the console.
 * Only has an effect when debug mode is enabled.
 */
function closeMainPluginLogGroup() {
  var _window$productEstima;
  if ((_window$productEstima = window.productEstimatorVars) !== null && _window$productEstima !== void 0 && _window$productEstima.debug) {
    console.log('%cAttempting to close main plugin group. Flag is: ' + pluginLogGroupHasStarted, 'color: red');
    if (pluginLogGroupHasStarted) {
      console.groupEnd();
      pluginLogGroupHasStarted = false;
      console.log('%cMain plugin group closed. Flag set to: ' + pluginLogGroupHasStarted, 'color: purple');
    } else {
      console.warn('%cClose called, but logger flag indicates no main group was started or it was already closed.', 'color: orange');
    }
  }
}

/**
 * Ensures that the main plugin log group is started if not already.
 * Creates a console group for all plugin logs to be organized under.
 * @param {boolean} startCollapsed - Whether to start the group as collapsed (true) or expanded (false)
 * @private
 */
function ensureMainPluginLogGroupIsStarted() {
  var _window$productEstima2, _window$productEstima3;
  var startCollapsed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  // (Keep the version with diagnostic logs from above for testing)
  if (!pluginLogGroupHasStarted && (_window$productEstima2 = window.productEstimatorVars) !== null && _window$productEstima2 !== void 0 && _window$productEstima2.debug) {
    if (startCollapsed) {
      console.groupCollapsed("[ProductEstimator] Logs");
    } else {
      console.group("[ProductEstimator] Logs");
    }
    pluginLogGroupHasStarted = true;
  } else if ((_window$productEstima3 = window.productEstimatorVars) !== null && _window$productEstima3 !== void 0 && _window$productEstima3.debug) {
    // Debug is on, but plugin log group is already started - no action needed
  }
}

// --- MODIFIED STANDALONE LOG FUNCTIONS ---
// These will now also log within the main plugin group.

/**
 * Logs a message to the console with the component name as prefix.
 * Only logs when debug mode is enabled.
 * @param {string} component - The name of the component for log prefixing
 * @param {...any} args - Arguments to pass to console.log
 */
function log(component) {
  var _window$productEstima4;
  if ((_window$productEstima4 = window.productEstimatorVars) !== null && _window$productEstima4 !== void 0 && _window$productEstima4.debug) {
    var _console;
    ensureMainPluginLogGroupIsStarted();
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    (_console = console).log.apply(_console, ["[".concat(component, "]")].concat(args));
  }
}

/**
 * Logs a warning message to the console with the component name as prefix.
 * Only logs when debug mode is enabled.
 * @param {string} component - The name of the component for log prefixing
 * @param {...any} args - Arguments to pass to console.warn
 */
function warn(component) {
  var _window$productEstima5;
  if ((_window$productEstima5 = window.productEstimatorVars) !== null && _window$productEstima5 !== void 0 && _window$productEstima5.debug) {
    var _console2;
    ensureMainPluginLogGroupIsStarted();
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }
    (_console2 = console).warn.apply(_console2, ["[".concat(component, "]")].concat(args));
  }
}

/**
 * Logs an error message to the console with the component name as prefix.
 * Only logs when debug mode is enabled. Always expands the main group for better visibility.
 * @param {string} component - The name of the component for log prefixing
 * @param {...any} args - Arguments to pass to console.error
 */
function error(component) {
  var _window$productEstima6;
  if ((_window$productEstima6 = window.productEstimatorVars) !== null && _window$productEstima6 !== void 0 && _window$productEstima6.debug) {
    var _console3;
    ensureMainPluginLogGroupIsStarted(false); // Attempt to expand main group on error
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }
    (_console3 = console).error.apply(_console3, ["[".concat(component, "]")].concat(args));
  }
}

// --- MODIFIED createLogger FUNCTION ---
/**
 * Logger Factory Function
 * Creates a logger instance pre-configured with a component name,
 * and manages logging within the main plugin console group.
 * @param {string} componentName - The name of the component for log prefixing.
 * @returns {object} An object with log, warn, error, group, and groupEnd methods.
 */
function createLogger(componentName) {
  var componentLabel = "[".concat(componentName, "]");

  // Option 1: Ensure group is started when logger is created.
  // if (window.productEstimatorVars?.debug) { // This initial call is fine
  //   ensureMainPluginLogGroupIsStarted();
  // }

  return {
    log: function log() {
      var _window$productEstima7;
      if ((_window$productEstima7 = window.productEstimatorVars) !== null && _window$productEstima7 !== void 0 && _window$productEstima7.debug) {
        var _console4;
        ensureMainPluginLogGroupIsStarted(); // This ensures it for any log call
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }
        (_console4 = console).log.apply(_console4, [componentLabel].concat(args));
        if (window.debug && window.debug.trace) {
          console.trace();
        }
      }
    },
    warn: function warn() {
      var _window$productEstima8;
      if ((_window$productEstima8 = window.productEstimatorVars) !== null && _window$productEstima8 !== void 0 && _window$productEstima8.debug) {
        var _console5;
        ensureMainPluginLogGroupIsStarted();
        for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }
        (_console5 = console).warn.apply(_console5, [componentLabel].concat(args));
        if (window.debug && window.debug.trace) {
          console.trace();
        }
      }
    },
    error: function error() {
      var _window$productEstima9;
      if ((_window$productEstima9 = window.productEstimatorVars) !== null && _window$productEstima9 !== void 0 && _window$productEstima9.debug) {
        var _console6;
        ensureMainPluginLogGroupIsStarted(false);
        for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
          args[_key6] = arguments[_key6];
        }
        (_console6 = console).error.apply(_console6, [componentLabel].concat(args));
        if (window.debug && window.debug.trace) {
          console.trace();
        }
      }
    },
    group: function group() {
      var _window$productEstima0;
      var groupName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Details';
      var collapsed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if ((_window$productEstima0 = window.productEstimatorVars) !== null && _window$productEstima0 !== void 0 && _window$productEstima0.debug) {
        ensureMainPluginLogGroupIsStarted();
        var fullGroupLabel = "".concat(componentLabel, " ").concat(groupName);
        if (collapsed) {
          console.groupCollapsed(fullGroupLabel);
        } else {
          console.group(fullGroupLabel);
        }
      }
    },
    groupEnd: function groupEnd() {
      var _window$productEstima1;
      if ((_window$productEstima1 = window.productEstimatorVars) !== null && _window$productEstima1 !== void 0 && _window$productEstima1.debug && pluginLogGroupHasStarted) {
        console.groupEnd();
      }
    }
  };
}

/***/ }),

/***/ "./src/js/utils/validation.js":
/*!************************************!*\
  !*** ./src/js/utils/validation.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearFieldError: () => (/* binding */ clearFieldError),
/* harmony export */   showFieldError: () => (/* binding */ showFieldError),
/* harmony export */   showNotice: () => (/* binding */ showNotice),
/* harmony export */   validateEmail: () => (/* binding */ validateEmail),
/* harmony export */   validateForm: () => (/* binding */ validateForm),
/* harmony export */   validateNumber: () => (/* binding */ validateNumber),
/* harmony export */   validateRequired: () => (/* binding */ validateRequired)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");

/**
 * Validation utilities for Product Estimator plugin
 *
 * Functions for validating inputs and displaying error messages.
 */

/**
 * Validates an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether the email is valid
 */
function validateEmail(email) {
  if (!email) return false;
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validates a number within specified bounds
 * @param {number|string} value - Number to validate
 * @param {object} options - Validation options
 * @param {number} [options.min] - Minimum allowed value
 * @param {number} [options.max] - Maximum allowed value
 * @param {boolean} [options.integer] - Whether the value must be an integer
 * @returns {boolean} Whether the number is valid
 */
function validateNumber(value) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var min = options.min,
    max = options.max,
    _options$integer = options.integer,
    integer = _options$integer === void 0 ? false : _options$integer;

  // Convert to number if string
  var num = typeof value === 'string' ? parseFloat(value) : value;

  // Check if it's a valid number
  if (isNaN(num)) {
    return false;
  }

  // Check if it's an integer when required
  if (integer && !Number.isInteger(num)) {
    return false;
  }

  // Check bounds
  if (min !== undefined && num < min) {
    return false;
  }
  if (max !== undefined && num > max) {
    return false;
  }
  return true;
}

/**
 * Validates that a value is not empty
 * @param {*} value - Value to check
 * @returns {boolean} Whether the value is not empty
 */
function validateRequired(value) {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

/**
 * Show field error
 * @param {jQuery|HTMLElement} field - Field element
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
  var $ = jQuery;
  if (!field) return;

  // Handle both jQuery object and DOM element
  var $field = field instanceof jQuery ? field : $(field);

  // Clear any existing error first
  clearFieldError($field);

  // Create error element
  var $error = $("<span class=\"field-error\">".concat(message, "</span>"));

  // Add it after the field
  $field.after($error);
  $field.addClass('error');
}

/**
 * Clear field error
 * @param {jQuery|HTMLElement} field - Field element
 */
function clearFieldError(field) {
  var $ = jQuery;
  if (!field) return;

  // Handle both jQuery object and DOM element
  var $field = field instanceof jQuery ? field : $(field);
  $field.next('.field-error').remove();
  $field.removeClass('error');
}

/**
 * Shows an admin notice
 * @param {string} message - Notice message
 * @param {string} type - Notice type (success/error)
 * @param {number} duration - Duration in ms before auto-dismissing
 */
function showNotice(message) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
  var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5000;
  var $ = jQuery;
  if (!$) {
    // Fallback if jQuery not available
    alert(message);
    return;
  }
  var $notice = $("<div class=\"notice notice-".concat(type, " is-dismissible\"><p>").concat(message, "</p></div>"));

  // Try to find a good location to show the notice
  var $targetLocations = [$('.wrap h1'),
  // Admin page headers
  $('.product-estimator-form-container'),
  // Our form containers
  $('#wpbody-content') // WordPress admin content area
  ];
  var $target = null;

  // Find the first available target
  for (var i = 0; i < $targetLocations.length; i++) {
    if ($targetLocations[i].length) {
      $target = $targetLocations[i];
      break;
    }
  }
  if ($target) {
    $target.after($notice);
  } else {
    // Fallback - just prepend to body
    $('body').prepend($notice);
  }

  // Initialize WordPress dismissible notices
  if (window.wp && window.wp.notices) {
    window.wp.notices.init();
  } else {
    // Add close button manually if wp.notices is not available
    var $closeButton = $('<button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button>');
    $notice.append($closeButton);
    $closeButton.on('click', function () {
      $notice.fadeOut(100, function () {
        $notice.remove();
      });
    });
  }

  // Auto-dismiss after specified duration
  setTimeout(function () {
    $notice.fadeOut(500, function () {
      return $notice.remove();
    });
  }, duration);
}

/**
 * Validates a form by checking all specified fields
 * @param {HTMLFormElement|jQuery} form - Form to validate
 * @param {object} validators - Map of field selectors to validator functions
 * @returns {boolean} Whether the form is valid
 */
function validateForm(form, validators) {
  var $ = jQuery;

  // Get jQuery object for the form
  var $form = form instanceof jQuery ? form : $(form);
  var isValid = true;

  // Process each validation rule
  Object.entries(validators).forEach(function (_ref) {
    var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref, 2),
      selector = _ref2[0],
      validator = _ref2[1];
    var $field = $form.find(selector);
    if (!$field.length) return;

    // Get the field value
    var value = $field.val();

    // Run the validator function, which should return { valid: boolean, message: string }
    var result = validator(value, $field);
    if (!result.valid) {
      showFieldError($field, result.message);
      isValid = false;
    } else {
      clearFieldError($field);
    }
  });
  return isValid;
}

/***/ })

}]);
//# sourceMappingURL=common.bundle.js.map