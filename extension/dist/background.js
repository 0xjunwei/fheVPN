/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/background.ts":
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.removeVpnProxy = exports.setVpnProxy = void 0;\nchrome.runtime.onInstalled.addListener(() => {\n    console.log('VPN Extension installed');\n});\n// Function to set VPN proxy\nfunction setVpnProxy(host, port) {\n    chrome.proxy.settings.set({\n        value: {\n            mode: \"fixed_servers\",\n            rules: {\n                singleProxy: {\n                    scheme: \"http\",\n                    host,\n                    port\n                }\n            }\n        },\n        scope: \"regular\"\n    }, () => {\n        console.log('VPN proxy set');\n    });\n}\nexports.setVpnProxy = setVpnProxy;\n// Function to remove the VPN proxy\nfunction removeVpnProxy() {\n    chrome.proxy.settings.clear({}, () => {\n        console.log('VPN proxy removed');\n    });\n}\nexports.removeVpnProxy = removeVpnProxy;\n\n\n//# sourceURL=webpack://vpn-extension/./src/background.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/background.ts"](0, __webpack_exports__);
/******/ 	
/******/ })()
;