(function (root, factory) {
    "use strict";
    const api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    else root.BloodSugarCalculator = api;
}(typeof globalThis === "object" ? globalThis : this, function () {
    "use strict";
    const INVALID = "This calculation is invalid or unsupported. Enter a value to calculate again.";
    const DECIMAL = /^(?:\d+(?:\.\d*)?|\.\d+)$/;
    function fail() { throw new Error(INVALID); }
    function decimal(value) {
        if (typeof value !== "string" || !DECIMAL.test(value.trim())) fail();
        const number = Number(value.trim());
        if (!Number.isFinite(number)) fail();
        return number;
    }
    function createCalculation(data) {
        if (!data || typeof data !== "object" || Array.isArray(data) || (data.v !== undefined && data.v !== 1)) fail();
        const { type, input, units, date } = data;
        if (typeof input !== "number" || !Number.isFinite(input)) fail();
        if (typeof date !== "string" || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString() !== date) fail();
        let a1c, eagMgdl;
        if (type === "a1c-to-eag") {
            if (input < 4 || input > 20 || units !== undefined) fail();
            a1c = input;
            eagMgdl = 28.7 * input - 46.7;
        } else if (type === "eag-to-a1c") {
            if (units === "mgdl") {
                if (input < 70 || input > 600) fail();
                eagMgdl = input;
            } else if (units === "mmoll") {
                if (input < 3.9 || input > 33.3) fail();
                eagMgdl = input * 18;
            } else fail();
            a1c = (eagMgdl + 46.7) / 28.7;
        } else fail();
        return Object.freeze({ v: 1, type, input, ...(type === "eag-to-a1c" ? { units } : {}), date, a1c, eagMgdl, eagMmoll: eagMgdl / 18 });
    }
    function fields(data) {
        const calc = createCalculation(data);
        return { v: 1, type: calc.type, input: calc.input, ...(calc.units ? { units: calc.units } : {}), date: calc.date };
    }
    function encodeCalculation(calculation) {
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(fields(calculation))))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        if (encoded.length > 2048) fail();
        return encoded;
    }
    function decodeCalculation(encoded, options = {}) {
        try {
            if (typeof encoded !== "string" || encoded.length === 0 || encoded.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1) fail();
            const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
            // Reject alternate encodings with nonzero unused bits.
            if (btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") !== encoded) fail();
            const data = JSON.parse(decodeURIComponent(escape(binary)));
            if (!data || typeof data !== "object" || Array.isArray(data)) fail();
            if (data.v !== 1 && !(options.legacy === true && data.v === undefined)) fail();
            const input = options.legacy === true && typeof data.input === "string" ? decimal(data.input) : data.input;
            return createCalculation({ type: data.type, input, units: data.units, date: data.date });
        } catch (_) { fail(); }
    }
    function readCalculationUrl(value) {
        try {
            const url = new URL(value);
            const fragment = new URLSearchParams(url.hash.slice(1));
            const source = fragment.has("c") ? "fragment" : "query";
            const selected = source === "fragment" ? fragment : url.searchParams;
            if (!selected.has("c")) return null;
            if (selected.getAll("c").length !== 1) fail();
            return { calculation: decodeCalculation(selected.get("c"), { legacy: source === "query" }), source };
        } catch (_) { fail(); }
    }
    function generateShareUrl(value, calculation) {
        try {
            const url = new URL(value);
            url.searchParams.delete("c");
            url.hash = "c=" + encodeCalculation(calculation);
            return url.href;
        } catch (_) { fail(); }
    }
    return Object.freeze({ createCalculation, encodeCalculation, decodeCalculation, readCalculationUrl, generateShareUrl });
}));
