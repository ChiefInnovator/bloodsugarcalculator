"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const calculator = require("../js/calculator.js");
const { createCalculation, encodeCalculation, decodeCalculation, readCalculationUrl, generateShareUrl } = calculator;
const date = "2026-11-02T14:00:00.000Z";
const base = { type: "a1c-to-eag", input: 7, date };
const raw = value => Buffer.from(JSON.stringify(value)).toString("base64url");
const invalid = fn => assert.throws(fn, { message: "This calculation is invalid or unsupported. Enter a value to calculate again." });

test("both conversion directions retain full precision and do not constrain output to input ranges", () => {
    const calc = createCalculation({ ...base, input: 4.11 });
    assert.equal(calc.eagMgdl, 28.7 * 4.11 - 46.7);
    assert.equal(calc.eagMmoll, calc.eagMgdl / 18);
    assert.notEqual(calc.eagMmoll, Math.round(calc.eagMgdl) / 18);
    assert.equal(calc.a1c, 4.11);
    assert.equal(createCalculation({ ...base, input: 4 }).eagMgdl, 68.1);
    assert.equal(createCalculation({ type: "eag-to-a1c", input: 600, units: "mgdl", date }).a1c, (600 + 46.7) / 28.7);
    const reverse = createCalculation({ type: "eag-to-a1c", input: 7.23, units: "mmoll", date });
    assert.equal(reverse.eagMgdl, 7.23 * 18);
    assert.equal(reverse.a1c, (7.23 * 18 + 46.7) / 28.7);
    assert.ok(Object.isFrozen(calc));
});

test("range endpoints are accepted and just-outside values rejected", () => {
    for (const input of [4, 20]) assert.equal(createCalculation({ ...base, input }).input, input);
    for (const input of [3.999, 20.001]) invalid(() => createCalculation({ ...base, input }));
    for (const [units, low, high] of [["mgdl", 70, 600], ["mmoll", 3.9, 33.3]]) {
        for (const input of [low, high]) assert.equal(createCalculation({ ...base, type: "eag-to-a1c", units, input }).input, input);
        for (const input of [low - 0.001, high + 0.001]) invalid(() => createCalculation({ ...base, type: "eag-to-a1c", units, input }));
    }
});

test("creation rejects wrong numeric types, units, schema and nonfinite numbers", () => {
    for (const input of ["7", null, true, [], {}, NaN, Infinity, -Infinity]) invalid(() => createCalculation({ ...base, input }));
    for (const data of [null, [], {}, { ...base, type: "other" }, { ...base, units: "mgdl" }, { ...base, type: "eag-to-a1c", input: 100 }, { ...base, type: "eag-to-a1c", input: 100, units: "mg/dL" }]) invalid(() => createCalculation(data));
});

test("dates require exact canonical UTC ISO strings and finite instants", () => {
    for (const value of [undefined, null, 0, new Date(), "invalid", "2026-11-02", "2026-11-02T14:00:00Z", "2026-11-02T10:00:00.000-04:00", "2026-02-30T14:00:00.000Z", "+999999-01-01T00:00:00.000Z"]) invalid(() => createCalculation({ ...base, date: value }));
    for (const value of ["1900-01-01T00:00:00.000Z", "2099-01-01T00:00:00.000Z"]) assert.equal(createCalculation({ ...base, date: value }).date, value);
});

test("encoding contains only canonical input fields and recomputes all output", () => {
    const forged = { ...base, a1c: 200, eagMgdl: "<img onerror=alert(1)>", result: "fabricated", v: 1, unknown: "discard" };
    const encoded = encodeCalculation(forged);
    assert.deepEqual(JSON.parse(Buffer.from(encoded, "base64url").toString()), { v: 1, ...base });
    assert.deepEqual(decodeCalculation(encoded), createCalculation(base));
    const calc = decodeCalculation(raw(forged));
    assert.equal(calc.eagMgdl, 28.7 * 7 - 46.7);
    assert.equal(calc.result, undefined);
    assert.equal(calc.unknown, undefined);
    const reverse = createCalculation({ type: "eag-to-a1c", units: "mmoll", input: 8.1, date });
    assert.deepEqual(decodeCalculation(encodeCalculation(reverse)), reverse);
});

test("new schema requires version one and numeric input; legacy explicitly permits missing version", () => {
    invalid(() => decodeCalculation(raw(base)));
    assert.deepEqual(decodeCalculation(raw(base), { legacy: true }), createCalculation(base));
    for (const v of [0, 2, "1", null]) {
        invalid(() => decodeCalculation(raw({ ...base, v })));
        invalid(() => decodeCalculation(raw({ ...base, v }), { legacy: true }));
    }
    invalid(() => decodeCalculation(raw({ ...base, input: "7", v: 1 })));
    assert.equal(decodeCalculation(raw({ ...base, input: "7", v: 1 }), { legacy: true }).input, 7);
});

test("legacy decimal strings use the complete ASCII grammar before range checks", () => {
    for (const input of ["7", "7.0", "4.11", "7.", " 7.5 \t"]) assert.equal(decodeCalculation(raw({ ...base, input }), { legacy: true }).input, Number(input));
    for (const input of ["", " ", ".", ".5", "+7", "-7", "7e0", "0x7", "7_0", "7,0", "7 mg/dL", "7foo", "７", "Infinity", "NaN", "7\n8", "9".repeat(500)]) invalid(() => decodeCalculation(raw({ ...base, input }), { legacy: true }));
});

test("codec rejects malformed, oversized, noncanonical base64 and JSON shapes with fixed errors", () => {
    for (const encoded of [undefined, null, 1, "", "x".repeat(2049), "a", "%%%", "e30=", raw(null), raw([]), raw("hello"), Buffer.from("{bad").toString("base64url"), "Zh", "_w"]) invalid(() => decodeCalculation(encoded));
    const max = raw({ ...base, v: 1, extra: "x".repeat(1500) });
    assert.ok(max.length > 2048);
    invalid(() => decodeCalculation(max));
});

test("fragment precedence is deterministic, including empty, malformed and duplicate fragments", () => {
    const legacy = raw({ ...base, input: "8", resultMgdl: "<script>bad</script>" });
    const fragment = encodeCalculation(createCalculation(base));
    const url = `https://example.test/?c=${legacy}`;
    assert.equal(readCalculationUrl(url).source, "query");
    assert.equal(readCalculationUrl(`${url}#section`).calculation.input, 8);
    assert.equal(readCalculationUrl(`${url}#c=${fragment}`).calculation.input, 7);
    assert.equal(readCalculationUrl(`${url}#c=${fragment}`).source, "fragment");
    for (const hash of ["#c=", "#c=bad", `#c=${fragment}&c=${fragment}`, `#c=${legacy}`]) invalid(() => readCalculationUrl(url + hash));
    invalid(() => readCalculationUrl(`${url}&c=${legacy}`));
    assert.equal(readCalculationUrl("https://example.test/?other=1#heading"), null);
    invalid(() => readCalculationUrl("invalid url"));
});

test("share URL removes all legacy c parameters, preserves other parameters and replaces fragment", () => {
    const url = generateShareUrl("https://example.test/path?mode=x&c=bad&c=worse&other=2#old", createCalculation(base));
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.has("c"), false);
    assert.equal(parsed.searchParams.get("mode"), "x");
    assert.equal(parsed.searchParams.get("other"), "2");
    assert.ok(parsed.hash.startsWith("#c="));
    assert.deepEqual(readCalculationUrl(url), { source: "fragment", calculation: createCalculation(base) });
    invalid(() => generateShareUrl("bad", createCalculation(base)));
});

test("module exports the same public API in a browser without CommonJS", () => {
    const context = { btoa, atob, URL, URLSearchParams };
    vm.runInNewContext(fs.readFileSync(require.resolve("../js/calculator.js"), "utf8"), context);
    assert.deepEqual(Object.keys(context.BloodSugarCalculator).sort(), Object.keys(calculator).sort());
    assert.equal(context.BloodSugarCalculator.createCalculation(base).eagMgdl, createCalculation(base).eagMgdl);
});
