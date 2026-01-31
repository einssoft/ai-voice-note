(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/.pnpm/@tauri-apps+api@1.6.0/node_modules/@tauri-apps/api/tauri.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertFileSrc",
    ()=>convertFileSrc,
    "invoke",
    ()=>invoke,
    "transformCallback",
    ()=>transformCallback
]);
// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/** @ignore */ function uid() {
    return window.crypto.getRandomValues(new Uint32Array(1))[0];
}
/**
 * Transforms a callback function to a string identifier that can be passed to the backend.
 * The backend uses the identifier to `eval()` the callback.
 *
 * @return A unique identifier associated with the callback function.
 *
 * @since 1.0.0
 */ function transformCallback(callback, once = false) {
    const identifier = uid();
    const prop = `_${identifier}`;
    Object.defineProperty(window, prop, {
        value: (result)=>{
            if (once) {
                Reflect.deleteProperty(window, prop);
            }
            return callback === null || callback === void 0 ? void 0 : callback(result);
        },
        writable: false,
        configurable: true
    });
    return identifier;
}
/**
 * Sends a message to the backend.
 * @example
 * ```typescript
 * import { invoke } from '@tauri-apps/api/tauri';
 * await invoke('login', { user: 'tauri', password: 'poiwe3h4r5ip3yrhtew9ty' });
 * ```
 *
 * @param cmd The command name.
 * @param args The optional arguments to pass to the command.
 * @return A promise resolving or rejecting to the backend response.
 *
 * @since 1.0.0
 */ async function invoke(cmd, args = {}) {
    return new Promise((resolve, reject)=>{
        const callback = transformCallback((e)=>{
            resolve(e);
            Reflect.deleteProperty(window, `_${error}`);
        }, true);
        const error = transformCallback((e)=>{
            reject(e);
            Reflect.deleteProperty(window, `_${callback}`);
        }, true);
        window.__TAURI_IPC__({
            cmd,
            callback,
            error,
            ...args
        });
    });
}
/**
 * Convert a device file path to an URL that can be loaded by the webview.
 * Note that `asset:` and `https://asset.localhost` must be added to [`tauri.security.csp`](https://tauri.app/v1/api/config/#securityconfig.csp) in `tauri.conf.json`.
 * Example CSP value: `"csp": "default-src 'self'; img-src 'self' asset: https://asset.localhost"` to use the asset protocol on image sources.
 *
 * Additionally, `asset` must be added to [`tauri.allowlist.protocol`](https://tauri.app/v1/api/config/#allowlistconfig.protocol)
 * in `tauri.conf.json` and its access scope must be defined on the `assetScope` array on the same `protocol` object.
 * For example:
 * ```json
 * {
 *   "tauri": {
 *     "allowlist": {
 *       "protocol": {
 *         "asset": true,
 *         "assetScope": ["$APPDATA/assets/*"]
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * @param  filePath The file path.
 * @param  protocol The protocol to use. Defaults to `asset`. You only need to set this when using a custom protocol.
 * @example
 * ```typescript
 * import { appDataDir, join } from '@tauri-apps/api/path';
 * import { convertFileSrc } from '@tauri-apps/api/tauri';
 * const appDataDirPath = await appDataDir();
 * const filePath = await join(appDataDirPath, 'assets/video.mp4');
 * const assetUrl = convertFileSrc(filePath);
 *
 * const video = document.getElementById('my-video');
 * const source = document.createElement('source');
 * source.type = 'video/mp4';
 * source.src = assetUrl;
 * video.appendChild(source);
 * video.load();
 * ```
 *
 * @return the URL that can be used as source on the webview.
 *
 * @since 1.0.0
 */ function convertFileSrc(filePath, protocol = 'asset') {
    return window.__TAURI__.convertFileSrc(filePath, protocol);
}
;
}),
"[project]/node_modules/.pnpm/@tauri-apps+api@1.6.0/node_modules/@tauri-apps/api/helpers/tauri.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "invokeTauriCommand",
    ()=>invokeTauriCommand
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$1$2e$6$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$tauri$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tauri-apps+api@1.6.0/node_modules/@tauri-apps/api/tauri.js [app-client] (ecmascript)");
;
// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/** @ignore */ async function invokeTauriCommand(command) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$1$2e$6$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$tauri$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('tauri', command);
}
;
}),
"[project]/node_modules/.pnpm/@tauri-apps+api@1.6.0/node_modules/@tauri-apps/api/dialog.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ask",
    ()=>ask,
    "confirm",
    ()=>confirm,
    "message",
    ()=>message,
    "open",
    ()=>open,
    "save",
    ()=>save
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$1$2e$6$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$helpers$2f$tauri$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tauri-apps+api@1.6.0/node_modules/@tauri-apps/api/helpers/tauri.js [app-client] (ecmascript)");
;
// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * Native system dialogs for opening and saving files.
 *
 * This package is also accessible with `window.__TAURI__.dialog` when [`build.withGlobalTauri`](https://tauri.app/v1/api/config/#buildconfig.withglobaltauri) in `tauri.conf.json` is set to `true`.
 *
 * The APIs must be added to [`tauri.allowlist.dialog`](https://tauri.app/v1/api/config/#allowlistconfig.dialog) in `tauri.conf.json`:
 * ```json
 * {
 *   "tauri": {
 *     "allowlist": {
 *       "dialog": {
 *         "all": true, // enable all dialog APIs
 *         "ask": true, // enable dialog ask API
 *         "confirm": true, // enable dialog confirm API
 *         "message": true, // enable dialog message API
 *         "open": true, // enable file open API
 *         "save": true // enable file save API
 *       }
 *     }
 *   }
 * }
 * ```
 * It is recommended to allowlist only the APIs you use for optimal bundle size and security.
 * @module
 */ /**
 * Open a file/directory selection dialog.
 *
 * The selected paths are added to the filesystem and asset protocol allowlist scopes.
 * When security is more important than the easy of use of this API,
 * prefer writing a dedicated command instead.
 *
 * Note that the allowlist scope change is not persisted, so the values are cleared when the application is restarted.
 * You can save it to the filesystem using [tauri-plugin-persisted-scope](https://github.com/tauri-apps/plugins-workspace/tree/v1/plugins/persisted-scope).
 * @example
 * ```typescript
 * import { open } from '@tauri-apps/api/dialog';
 * // Open a selection dialog for image files
 * const selected = await open({
 *   multiple: true,
 *   filters: [{
 *     name: 'Image',
 *     extensions: ['png', 'jpeg']
 *   }]
 * });
 * if (Array.isArray(selected)) {
 *   // user selected multiple files
 * } else if (selected === null) {
 *   // user cancelled the selection
 * } else {
 *   // user selected a single file
 * }
 * ```
 *
 * @example
 * ```typescript
 * import { open } from '@tauri-apps/api/dialog';
 * import { appDir } from '@tauri-apps/api/path';
 * // Open a selection dialog for directories
 * const selected = await open({
 *   directory: true,
 *   multiple: true,
 *   defaultPath: await appDir(),
 * });
 * if (Array.isArray(selected)) {
 *   // user selected multiple directories
 * } else if (selected === null) {
 *   // user cancelled the selection
 * } else {
 *   // user selected a single directory
 * }
 * ```
 *
 * @returns A promise resolving to the selected path(s)
 *
 * @since 1.0.0
 */ async function open(options = {}) {
    if (typeof options === 'object') {
        Object.freeze(options);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$1$2e$6$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$helpers$2f$tauri$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invokeTauriCommand"])({
        __tauriModule: 'Dialog',
        message: {
            cmd: 'openDialog',
            options
        }
    });
}
/**
 * Open a file/directory save dialog.
 *
 * The selected path is added to the filesystem and asset protocol allowlist scopes.
 * When security is more important than the easy of use of this API,
 * prefer writing a dedicated command instead.
 *
 * Note that the allowlist scope change is not persisted, so the values are cleared when the application is restarted.
 * You can save it to the filesystem using [tauri-plugin-persisted-scope](https://github.com/tauri-apps/plugins-workspace/tree/v1/plugins/persisted-scope).
 * @example
 * ```typescript
 * import { save } from '@tauri-apps/api/dialog';
 * const filePath = await save({
 *   filters: [{
 *     name: 'Image',
 *     extensions: ['png', 'jpeg']
 *   }]
 * });
 * ```
 *
 * @returns A promise resolving to the selected path.
 *
 * @since 1.0.0
 */ async function save(options = {}) {
    if (typeof options === 'object') {
        Object.freeze(options);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$1$2e$6$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$helpers$2f$tauri$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invokeTauriCommand"])({
        __tauriModule: 'Dialog',
        message: {
            cmd: 'saveDialog',
            options
        }
    });
}
/**
 * Shows a message dialog with an `Ok` button.
 * @example
 * ```typescript
 * import { message } from '@tauri-apps/api/dialog';
 * await message('Tauri is awesome', 'Tauri');
 * await message('File not found', { title: 'Tauri', type: 'error' });
 * ```
 *
 * @param message The message to show.
 * @param options The dialog's options. If a string, it represents the dialog title.
 *
 * @returns A promise indicating the success or failure of the operation.
 *
 * @since 1.0.0
 *
 */ async function message(message, options) {
    var _a, _b;
    const opts = typeof options === 'string' ? {
        title: options
    } : options;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$1$2e$6$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$helpers$2f$tauri$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invokeTauriCommand"])({
        __tauriModule: 'Dialog',
        message: {
            cmd: 'messageDialog',
            message: message.toString(),
            title: (_a = opts === null || opts === void 0 ? void 0 : opts.title) === null || _a === void 0 ? void 0 : _a.toString(),
            type: opts === null || opts === void 0 ? void 0 : opts.type,
            buttonLabel: (_b = opts === null || opts === void 0 ? void 0 : opts.okLabel) === null || _b === void 0 ? void 0 : _b.toString()
        }
    });
}
/**
 * Shows a question dialog with `Yes` and `No` buttons.
 * @example
 * ```typescript
 * import { ask } from '@tauri-apps/api/dialog';
 * const yes = await ask('Are you sure?', 'Tauri');
 * const yes2 = await ask('This action cannot be reverted. Are you sure?', { title: 'Tauri', type: 'warning' });
 * ```
 *
 * @param message The message to show.
 * @param options The dialog's options. If a string, it represents the dialog title.
 *
 * @returns A promise resolving to a boolean indicating whether `Yes` was clicked or not.
 *
 * @since 1.0.0
 */ async function ask(message, options) {
    var _a, _b, _c, _d, _e;
    const opts = typeof options === 'string' ? {
        title: options
    } : options;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$1$2e$6$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$helpers$2f$tauri$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invokeTauriCommand"])({
        __tauriModule: 'Dialog',
        message: {
            cmd: 'askDialog',
            message: message.toString(),
            title: (_a = opts === null || opts === void 0 ? void 0 : opts.title) === null || _a === void 0 ? void 0 : _a.toString(),
            type: opts === null || opts === void 0 ? void 0 : opts.type,
            buttonLabels: [
                (_c = (_b = opts === null || opts === void 0 ? void 0 : opts.okLabel) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : 'Yes',
                (_e = (_d = opts === null || opts === void 0 ? void 0 : opts.cancelLabel) === null || _d === void 0 ? void 0 : _d.toString()) !== null && _e !== void 0 ? _e : 'No'
            ]
        }
    });
}
/**
 * Shows a question dialog with `Ok` and `Cancel` buttons.
 * @example
 * ```typescript
 * import { confirm } from '@tauri-apps/api/dialog';
 * const confirmed = await confirm('Are you sure?', 'Tauri');
 * const confirmed2 = await confirm('This action cannot be reverted. Are you sure?', { title: 'Tauri', type: 'warning' });
 * ```
 *
 * @param message The message to show.
 * @param options The dialog's options. If a string, it represents the dialog title.
 *
 * @returns A promise resolving to a boolean indicating whether `Ok` was clicked or not.
 *
 * @since 1.0.0
 */ async function confirm(message, options) {
    var _a, _b, _c, _d, _e;
    const opts = typeof options === 'string' ? {
        title: options
    } : options;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$1$2e$6$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$helpers$2f$tauri$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invokeTauriCommand"])({
        __tauriModule: 'Dialog',
        message: {
            cmd: 'confirmDialog',
            message: message.toString(),
            title: (_a = opts === null || opts === void 0 ? void 0 : opts.title) === null || _a === void 0 ? void 0 : _a.toString(),
            type: opts === null || opts === void 0 ? void 0 : opts.type,
            buttonLabels: [
                (_c = (_b = opts === null || opts === void 0 ? void 0 : opts.okLabel) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : 'Ok',
                (_e = (_d = opts === null || opts === void 0 ? void 0 : opts.cancelLabel) === null || _d === void 0 ? void 0 : _d.toString()) !== null && _e !== void 0 ? _e : 'Cancel'
            ]
        }
    });
}
;
}),
]);

//# sourceMappingURL=ca4f6_%40tauri-apps_api_192b0d94._.js.map