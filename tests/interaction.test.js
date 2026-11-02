"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const calculator = require("../js/calculator.js");
class Element {
    constructor(id, document) {
        this.id = id; this.document = document; this.hidden = false; this.disabled = false;
        this.value = ""; this.textContent = ""; this.attrs = {}; this.events = {}; this.children = []; this.isConnected = true;
        const classes = new Set();
        this.classList = { contains: name => classes.has(name), add: name => classes.add(name), remove: name => classes.delete(name), toggle: (name, on) => { const show = on === undefined ? !classes.has(name) : on; show ? classes.add(name) : classes.delete(name); return show; } };
    }
    addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
    async fire(name) { for (const fn of this.events[name] || []) await fn({ target: this, currentTarget: this, preventDefault() {} }); }
    setAttribute(key, value) { this.attrs[key] = value; }
    getAttribute(key) { return this.attrs[key]; }
    removeAttribute(key) { delete this.attrs[key]; }
    focus() { this.document.activeElement = this; }
    contains(element) { return this === element || this.children.some(child => child.contains(element)); }
    getClientRects() { return this.hidden || this.classList.contains("hidden") ? [] : [{}]; }
    select() { this.selected = true; }
    appendChild(child) { this.children.push(child); }
    replaceChildren() { this.children = []; }
    showModal() { this.open = true; }
    close() { this.open = false; void this.fire("close"); }
}
function fixture({ url = "https://example.test/", clipboard, consent, calculatorPage = true, mailHandlerError = false, mobileNavigation = false } = {}) {
    const nodes = new Map(), groups = {}, documentEvents = {};
    const document = {
        activeElement: null,
        getElementById: id => nodes.get(id) || null,
        createElement: () => new Element("", document),
        addEventListener: (name, fn) => { if (name === "DOMContentLoaded") document.start = fn; else (documentEvents[name] ||= []).push(fn); },
        querySelectorAll: selector => {
            if (selector === "#manage-cookies-btn, .manage-cookies-link") return [nodes.get("manage-cookies-btn")];
            const match = /input\[name="(.+?)"\]/.exec(selector);
            return match ? groups[match[1]] || [] : [];
        },
        querySelector: selector => {
            const match = /input\[name="(.+?)"\]:checked/.exec(selector);
            return match ? groups[match[1]]?.find(radio => radio.checked) : selector === 'label[for="eag-input"]' ? nodes.get("eag-label") : null;
        }
    };
    const add = id => { const element = new Element(id, document); nodes.set(id, element); return element; };
    ["main-content", "manage-cookies-btn", "cookie-consent-banner", "consent-title", "consent-options", "consent-save-container", "consent-accept-all", "consent-reject", "consent-customize", "consent-save", "consent-analytics", "consent-advertising"].forEach(add);
    if (mobileNavigation) ["mobile-menu-btn", "mobile-menu"].forEach(add);
    if (calculatorPage) {
        ["calculator-form", "a1c-input", "eag-input", "a1c-input-container", "eag-input-container", "result-container", "result-status", "share-feedback", "result-value", "result-explanation", "result-timestamp", "error-container", "error-message", "share-btn", "share-facebook", "share-twitter", "share-email", "ask-chatgpt", "external-action-dialog", "external-action-title", "external-action-description", "external-action-preview", "external-action-address", "external-action-address-details", "external-action-confirm", "external-action-cancel", "external-action-fallback", "shared-link-output", "external-action-link", "eag-hint", "eag-label"].forEach(add);
        for (const [name, values] of [["conversion-direction", ["a1c-to-eag", "eag-to-a1c"]], ["eag-units", ["mgdl", "mmoll"]]]) groups[name] = values.map((value, index) => { const radio = add(value); radio.value = value; radio.checked = index === 0; return radio; });
    }
    const opens = [], replacements = [], stored = [], navigations = [], windowEvents = {};
    const window = { BloodSugarCalculator: calculatorPage ? calculator : undefined, location: { href: url, assign: destination => { navigations.push(destination); if (mailHandlerError) throw new Error("Mail handler unavailable"); } }, getComputedStyle: () => ({ visibility: "visible" }), addEventListener(name, fn) { (windowEvents[name] ||= []).push(fn); }, open: (...args) => { opens.push(args); return null; } };
    const context = { window, document, navigator: { clipboard }, localStorage: { getItem: () => consent === undefined ? null : JSON.stringify(consent), setItem: (...args) => stored.push(args) }, history: { replaceState: (...args) => replacements.push(args) }, console, Date, URL, URLSearchParams };
    vm.runInNewContext(fs.readFileSync(require.resolve("../js/script.js"), "utf8"), context);
    document.start();
    return { nodes, groups, document, opens, replacements, stored, navigations, get: id => nodes.get(id), keyDown(key) {
        for (const listener of documentEvents.keydown || []) listener({ key });
    }, hashChange(hash) {
        window.location.href = new URL(hash, window.location.href).href;
        for (const listener of windowEvents.hashchange || []) listener();
    } };
}
async function calculate(f, value = "7") { f.get("a1c-input").value = value; await f.get("calculator-form").fire("submit"); }

test("form calculates precise input, displays safe text, and editing invalidates sharing", async () => {
    const f = fixture();
    assert.equal(f.get("eag-input").disabled, true);
    await calculate(f, "4.11");
    assert.equal(f.get("result-container").hidden, false);
    assert.match(f.get("result-explanation").textContent, /4\.11%/);
    assert.equal(f.get("result-value").children[0].textContent, "eAG: 71 mg/dL");
    await f.get("share-btn").fire("click");
    assert.equal(f.get("external-action-dialog").open, true);
    await f.get("a1c-input").fire("input");
    assert.equal(f.get("result-container").hidden, true);
    assert.equal(f.get("share-btn").disabled, true);
    assert.equal(f.get("external-action-dialog").open, false);
    await f.get("external-action-confirm").fire("click");
    assert.equal(f.opens.length, 0);
});

test("direction and unit changes clear stale state, units clear old input and update constraints", async () => {
    const f = fixture();
    await calculate(f);
    f.groups["conversion-direction"].forEach(radio => { radio.checked = radio.value === "eag-to-a1c"; });
    await f.get("eag-to-a1c").fire("change");
    assert.equal(f.get("a1c-input").disabled, true);
    assert.equal(f.get("eag-input").disabled, false);
    f.get("eag-input").value = "100";
    f.groups["eag-units"].forEach(radio => { radio.checked = radio.value === "mmoll"; });
    await f.get("mmoll").fire("change");
    assert.equal(f.get("eag-input").value, "");
    assert.equal(f.get("eag-input").min, "3.9");
    assert.equal(f.get("eag-input").max, "33.3");
    assert.match(f.get("eag-hint").textContent, /mmol\/L/);
    assert.equal(f.get("result-container").hidden, true);
});

test("typed bad syntax/range is announced and focuses invalid input", async () => {
    const f = fixture();
    for (const value of ["", "7e0", "+7", "7foo", "21"]) {
        await calculate(f, value);
        assert.equal(f.get("error-container").hidden, false);
        assert.equal(f.document.activeElement, f.get("a1c-input"));
        assert.equal(f.get("a1c-input").getAttribute("aria-invalid"), "true");
        assert.equal(f.get("result-container").hidden, true);
    }
});

test("external actions require confirmation; cancel sends nothing and timestamp remains stable", async () => {
    const f = fixture();
    await calculate(f);
    const timestamp = f.get("result-timestamp").textContent;
    for (const id of ["share-facebook", "share-twitter", "share-email", "ask-chatgpt"]) {
        await f.get(id).fire("click");
        assert.equal(f.opens.length, 0);
        assert.equal(f.navigations.length, 0);
        assert.match(f.get("external-action-preview").textContent, /Destination:.*\n\nCalculation:.*\nTimestamp:.*\n\nExact payload:/);
        await f.get("external-action-cancel").fire("click");
        assert.equal(f.navigations.length, 0);
    }
    await f.get("share-facebook").fire("click");
    await f.get("external-action-confirm").fire("click");
    assert.equal(f.opens.length, 1);
    assert.equal(f.opens[0][2], "noopener,noreferrer");
    assert.equal(f.get("external-action-dialog").open, true);
    assert.equal(f.get("external-action-fallback").hidden, false);
    assert.equal(f.get("external-action-link").rel, "noopener noreferrer");
    assert.equal(f.get("result-timestamp").textContent, timestamp);
});

test("missing and rejected clipboard APIs retain selectable fallback after confirmation", async () => {
    for (const clipboard of [undefined, { writeText: async () => { throw new Error("denied"); } }]) {
        const f = fixture({ clipboard });
        await calculate(f);
        await f.get("share-btn").fire("click");
        assert.equal(f.get("external-action-fallback").hidden, true);
        await f.get("external-action-confirm").fire("click");
        assert.equal(f.get("external-action-dialog").open, true);
        assert.equal(f.get("shared-link-output").selected, true);
        assert.match(f.get("shared-link-output").value, /#c=/);
    }
});

test("successful copy uses the previewed URL and closes the dialog", async () => {
    const copied = [], f = fixture({ clipboard: { writeText: async value => copied.push(value) } });
    await calculate(f);
    await f.get("share-btn").fire("click");
    const preview = f.get("external-action-preview").textContent;
    assert.equal(copied.length, 0);
    await f.get("external-action-confirm").fire("click");
    assert.equal(copied.length, 1);
    assert.ok(preview.endsWith(copied[0]));
    assert.equal(f.get("external-action-dialog").open, false);
    assert.equal(f.get("share-feedback").textContent, "Calculation link copied.");
});

test("legacy URL recomputes hostile fields and migrates query without losing unrelated parameters", () => {
    const legacy = Buffer.from(JSON.stringify({ type: "a1c-to-eag", input: "7", date: "2026-11-02T14:00:00.000Z", resultMgdl: "<img onerror=alert(1)>" })).toString("base64url");
    const f = fixture({ url: `https://example.test/?mode=keep&c=${legacy}` });
    assert.equal(f.get("result-value").children[0].textContent, "eAG: 154 mg/dL");
    assert.match(f.get("result-timestamp").textContent, /Link-supplied time \(not verified\)/);
    assert.equal(f.replacements.length, 1);
    const replacement = new URL(f.replacements[0][2]);
    assert.equal(replacement.searchParams.get("mode"), "keep");
    assert.equal(replacement.searchParams.has("c"), false);
    assert.match(replacement.hash, /^#c=/);
});

test("secondary pages initialize preferences without calculator module; malformed consent is ignored", async () => {
    for (const consent of [{ version: "old", analytics: true, advertising: true, timestamp: new Date().toISOString() }, { version: "1.0", analytics: "yes", advertising: true, timestamp: new Date().toISOString() }, { version: "1.0", analytics: true, advertising: true, timestamp: "bad" }]) {
        const f = fixture({ calculatorPage: false, consent });
        assert.equal(f.get("cookie-consent-banner").hidden, false);
        await f.get("consent-reject").fire("click");
        assert.equal(f.get("cookie-consent-banner").hidden, true);
        assert.equal(JSON.parse(f.stored[0][1]).analytics, false);
    }
});


test("saving reopened preferences restores the visible Manage Preferences invoker", async () => {
    const f = fixture();
    f.get("manage-cookies-btn").focus();
    await f.get("manage-cookies-btn").fire("click");
    assert.equal(f.document.activeElement, f.get("consent-title"));
    f.get("consent-save").focus();
    await f.get("consent-save").fire("click");
    assert.equal(f.get("cookie-consent-banner").hidden, true);
    assert.equal(f.document.activeElement, f.get("manage-cookies-btn"));
});

test("accepting the initial banner moves focus to visible main content", async () => {
    const f = fixture();
    f.get("consent-accept-all").focus();
    await f.get("consent-accept-all").fire("click");
    assert.equal(f.get("cookie-consent-banner").hidden, true);
    assert.equal(f.document.activeElement, f.get("main-content"));
    assert.equal(f.get("main-content").tabIndex, -1);
});

test("a hidden or disconnected preferences invoker falls back to visible main content", async () => {
    for (const unavailable of ["hidden", "disconnected"]) {
        const f = fixture();
        await f.get("manage-cookies-btn").fire("click");
        if (unavailable === "hidden") f.get("manage-cookies-btn").hidden = true;
        else f.get("manage-cookies-btn").isConnected = false;
        f.get("consent-reject").focus();
        await f.get("consent-reject").fire("click");
        assert.equal(f.document.activeElement, f.get("main-content"));
    }
});


test("email preview leads with readable values and timestamp while retaining the exact destination in details", async () => {
    const f = fixture();
    await calculate(f);
    f.get("external-action-address-details").open = true;
    await f.get("share-email").fire("click");
    const preview = f.get("external-action-preview").textContent;
    assert.ok(preview.startsWith("Destination: Email application\n"));
    assert.match(preview, /Calculation: A1C: 7\.0%; estimated average glucose: 154 mg\/dL \(8\.6 mmol\/L\)/);
    const timestamp = /Timestamp: (.+)/.exec(preview)[1];
    assert.ok(Number.isFinite(Date.parse(timestamp)));
    assert.equal(preview.includes("mailto:?"), false);
    const address = f.get("external-action-address").textContent;
    assert.ok(address.startsWith("mailto:?subject="));
    const destination = new URL(address);
    assert.equal(destination.searchParams.get("subject"), "eAG/A1C Calculation Result");
    assert.equal(destination.searchParams.get("body"), preview.split("Exact payload:\nSubject: eAG/A1C Calculation Result\n\n")[1]);
    assert.equal(f.get("external-action-address-details").open, false);
});

test("HTTPS previews show destination identity and preserve the full transfer URI separately", async () => {
    const f = fixture();
    await calculate(f);
    await f.get("ask-chatgpt").fire("click");
    const preview = f.get("external-action-preview").textContent;
    assert.ok(preview.startsWith("Destination: ChatGPT (https://chat.openai.com)\n"));
    const address = new URL(f.get("external-action-address").textContent);
    assert.equal(address.searchParams.get("q"), preview.split("Exact payload:\n")[1]);
    await f.get("external-action-confirm").fire("click");
    assert.equal(f.opens[0][0], address.href);
});

test("copy feedback clears on a new preview and contributing input edits", async () => {
    const f = fixture({ clipboard: { writeText: async () => {} } });
    await calculate(f);
    await f.get("share-btn").fire("click");
    await f.get("external-action-confirm").fire("click");
    assert.equal(f.get("share-feedback").textContent, "Calculation link copied.");
    await f.get("share-email").fire("click");
    assert.equal(f.get("share-feedback").textContent, "");
    await f.get("external-action-cancel").fire("click");
    await f.get("share-btn").fire("click");
    await f.get("external-action-confirm").fire("click");
    assert.equal(f.get("share-feedback").textContent, "Calculation link copied.");
    await f.get("a1c-input").fire("input");
    assert.equal(f.get("share-feedback").textContent, "");
});


test("same-document fragments replace valid calculations, invalidate malformed state, and recover", async () => {
    const f = fixture();
    const encode = input => calculator.encodeCalculation(calculator.createCalculation({ type: "a1c-to-eag", input, date: "2026-11-02T14:00:00.000Z" }));
    f.hashChange(`#c=${encode(7)}`);
    assert.equal(f.get("a1c-input").value, "7");
    assert.equal(f.get("result-container").hidden, false);
    await f.get("share-btn").fire("click");
    f.hashChange("#c=invalid");
    assert.equal(f.get("result-container").hidden, true);
    assert.equal(f.get("error-container").hidden, false);
    assert.equal(f.get("share-btn").disabled, true);
    assert.equal(f.get("external-action-dialog").open, false);
    f.hashChange(`#c=${encode(8.1)}`);
    assert.equal(f.get("a1c-input").value, "8.1");
    assert.equal(f.get("result-container").hidden, false);
    assert.equal(f.get("error-container").hidden, true);
    assert.equal(f.get("share-btn").disabled, false);
    assert.equal(f.get("result-value").children[0].textContent, "eAG: 186 mg/dL");
    f.hashChange("#c=");
    assert.equal(f.get("result-container").hidden, true);
    assert.equal(f.get("error-container").hidden, false);
    f.hashChange(`#c=${encode(6)}&c=${encode(7)}`);
    assert.equal(f.get("result-container").hidden, true);
    assert.equal(f.get("error-container").hidden, false);
});

test("unrelated anchors and removed calculation fragments preserve the active calculation", async () => {
    const f = fixture();
    await calculate(f, "7.25");
    const timestamp = f.get("result-timestamp").textContent;
    const output = f.get("result-explanation").textContent;
    for (const hash of ["#main-content", "#faq", "#"]) {
        f.hashChange(hash);
        assert.equal(f.get("result-container").hidden, false);
        assert.equal(f.get("error-container").hidden, true);
        assert.equal(f.get("share-btn").disabled, false);
        assert.equal(f.get("result-explanation").textContent, output);
        assert.equal(f.get("result-timestamp").textContent, timestamp);
    }
});


test("email confirmation launches only the exact previewed destination and retains its fallback", async () => {
    const f = fixture();
    await calculate(f);
    await f.get("share-email").fire("click");
    const destination = f.get("external-action-address").textContent;
    assert.equal(f.navigations.length, 0);
    await f.get("external-action-cancel").fire("click");
    assert.equal(f.navigations.length, 0);
    await f.get("share-email").fire("click");
    await f.get("external-action-confirm").fire("click");
    assert.deepEqual(f.navigations, [destination]);
    assert.equal(f.get("external-action-link").href, destination);
    assert.equal(f.get("external-action-fallback").hidden, false);
    assert.equal(f.get("external-action-dialog").open, true);
});

test("an unavailable email handler keeps the explicit confirmed-message fallback", async () => {
    const f = fixture({ mailHandlerError: true });
    await calculate(f);
    await f.get("share-email").fire("click");
    const destination = f.get("external-action-address").textContent;
    await f.get("external-action-confirm").fire("click");
    assert.deepEqual(f.navigations, [destination]);
    assert.equal(f.get("external-action-link").href, destination);
    assert.equal(f.get("external-action-fallback").hidden, false);
    assert.match(f.get("external-action-description").textContent, /did not open/);
});


test("Escape from a mobile navigation link closes the menu and restores toggle focus", async () => {
    const f = fixture({ mobileNavigation: true });
    const link = new Element("navigation-link", f.document);
    f.get("mobile-menu").appendChild(link);
    await f.get("mobile-menu-btn").fire("click");
    link.focus();
    f.keyDown("Escape");
    assert.equal(f.get("mobile-menu-btn").getAttribute("aria-expanded"), "false");
    assert.equal(f.get("mobile-menu").classList.contains("hidden"), true);
    assert.equal(f.document.activeElement, f.get("mobile-menu-btn"));
});

test("Escape does not steal focus from content outside an open mobile menu", async () => {
    const f = fixture({ mobileNavigation: true });
    f.get("main-content").focus();
    await f.get("mobile-menu-btn").fire("click");
    f.keyDown("Escape");
    assert.equal(f.get("mobile-menu-btn").getAttribute("aria-expanded"), "false");
    assert.equal(f.document.activeElement, f.get("main-content"));
});
