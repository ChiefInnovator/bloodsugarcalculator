document.addEventListener("DOMContentLoaded", function () {
    "use strict";
    const byId = id => document.getElementById(id);
    function visible(element, show) {
        if (!element) return;
        element.hidden = !show;
        element.classList.toggle("hidden", !show);
    }
    const menuButton = byId("mobile-menu-btn"), menu = byId("mobile-menu");
    function closeMenu() {
        if (!menuButton || !menu) return;
        menu.classList.remove("show");
        menu.classList.add("hidden");
        menuButton.classList.remove("active");
        menuButton.setAttribute("aria-expanded", "false");
    }
    if (menuButton && menu) {
        menuButton.setAttribute("aria-controls", "mobile-menu");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.addEventListener("click", () => {
            const open = menuButton.getAttribute("aria-expanded") !== "true";
            menu.classList.toggle("hidden", !open);
            menu.classList.toggle("show", open);
            menuButton.classList.toggle("active", open);
            menuButton.setAttribute("aria-expanded", String(open));
        });
        document.addEventListener("click", event => {
            if (!menuButton.contains(event.target) && !menu.contains(event.target)) closeMenu();
        });
        document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
        window.addEventListener("resize", () => { if (window.innerWidth >= 768) closeMenu(); });
    }
    document.querySelectorAll(".accordion-btn").forEach((button, index) => {
        const content = button.nextElementSibling;
        if (!content || !content.classList.contains("accordion-content")) return;
        if (!content.id) content.id = `accordion-content-${index + 1}`;
        button.setAttribute("aria-controls", content.id);
        button.setAttribute("aria-expanded", String(!content.classList.contains("hidden") && !content.hidden));
        button.addEventListener("click", () => {
            const open = button.getAttribute("aria-expanded") !== "true";
            visible(content, open);
            button.setAttribute("aria-expanded", String(open));
            const icon = button.querySelector("svg");
            if (icon) icon.classList.toggle("rotate-180", open);
        });
    });

    const consentVersion = "1.0", consentKey = "cookieConsent";
    const banner = byId("cookie-consent-banner");
    let consentOpener = document.activeElement;
    function canReturnConsentFocus(element) {
        if (!element || !element.isConnected || element.disabled || element === document.body || element === document.documentElement || banner?.contains(element) || element.getClientRects().length === 0) return false;
        const style = window.getComputedStyle(element);
        return style.visibility !== "hidden" && style.visibility !== "collapse";
    }
    function loadConsent() {
        try {
            const consent = JSON.parse(localStorage.getItem(consentKey));
            if (!consent || consent.version !== consentVersion || typeof consent.analytics !== "boolean" || typeof consent.advertising !== "boolean" || typeof consent.timestamp !== "string" || !Number.isFinite(Date.parse(consent.timestamp))) return null;
            const expiry = new Date(consent.timestamp);
            expiry.setMonth(expiry.getMonth() + 12);
            return Date.now() >= expiry.getTime() ? null : consent;
        } catch (_) { return null; }
    }
    function applyConsent(preferences) {
        if (typeof window.gtag === "function") window.gtag("consent", "update", {
            analytics_storage: preferences.analytics ? "granted" : "denied",
            ad_storage: preferences.advertising ? "granted" : "denied",
            ad_user_data: preferences.advertising ? "granted" : "denied",
            ad_personalization: preferences.advertising ? "granted" : "denied"
        });
    }
    function showBanner(options, focus) {
        if (!banner) return;
        visible(banner, true);
        banner.classList.remove("hide");
        banner.classList.add("show");
        ["consent-options", "consent-save-container"].forEach(id => {
            const element = byId(id);
            visible(element, options);
            if (element) element.classList.toggle("show", options);
        });
        if (focus) {
            const heading = byId("consent-title");
            if (heading) { heading.tabIndex = -1; heading.focus(); }
        }
    }
    function saveConsent(analytics, advertising) {
        const preferences = { analytics, advertising, timestamp: new Date().toISOString(), version: consentVersion };
        try { localStorage.setItem(consentKey, JSON.stringify(preferences)); } catch (_) { /* Storage is optional. */ }
        applyConsent(preferences);
        visible(banner, false);
        if (banner) banner.classList.remove("show");
        const destination = canReturnConsentFocus(consentOpener) ? consentOpener : byId("main-content") || document.querySelector("main");
        if (canReturnConsentFocus(destination)) {
            if (destination === byId("main-content") || destination.tagName === "MAIN") destination.tabIndex = -1;
            destination.focus();
        }
        consentOpener = null;
    }
    function reopenConsentBanner(event) {
        if (event) event.preventDefault();
        const opener = event?.currentTarget || document.activeElement;
        if (canReturnConsentFocus(opener)) consentOpener = opener;
        const consent = loadConsent();
        ["analytics", "advertising"].forEach(key => {
            const toggle = byId(`consent-${key}`);
            if (toggle) toggle.checked = consent ? consent[key] : false;
        });
        showBanner(true, true);
    }
    window.reopenConsentBanner = reopenConsentBanner;
    if (banner) {
        const consent = loadConsent();
        if (consent) { visible(banner, false); applyConsent(consent); }
        else showBanner(false, false);
        const listen = (id, fn) => { if (byId(id)) byId(id).addEventListener("click", fn); };
        listen("consent-accept-all", () => saveConsent(true, true));
        listen("consent-reject", () => saveConsent(false, false));
        listen("consent-customize", () => showBanner(byId("consent-options").hidden, false));
        listen("consent-save", () => saveConsent(Boolean(byId("consent-analytics")?.checked), Boolean(byId("consent-advertising")?.checked)));
        document.querySelectorAll("#manage-cookies-btn, .manage-cookies-link").forEach(button => button.addEventListener("click", reopenConsentBanner));
    }

    const form = byId("calculator-form"), calculator = window.BloodSugarCalculator;
    if (!form || !calculator) return;
    const a1cInput = byId("a1c-input"), eagInput = byId("eag-input");
    const result = byId("result-container"), status = byId("result-status");
    const dialog = byId("external-action-dialog"), confirm = byId("external-action-confirm");
    const shareIds = ["share-btn", "share-facebook", "share-twitter", "share-email", "ask-chatgpt"];
    let current = null, pending = null, invokingButton = null;
    const checked = name => document.querySelector(`input[name="${name}"]:checked`)?.value;
    const direction = () => checked("conversion-direction");
    const units = () => checked("eag-units");
    function closePreview() {
        pending = null;
        if (dialog?.open) dialog.close();
    }
    if (dialog) dialog.addEventListener("close", () => {
        pending = null;
        if (invokingButton?.isConnected) invokingButton.focus();
    });
    byId("external-action-cancel")?.addEventListener("click", closePreview);
    function clearError() {
        visible(byId("error-container"), false);
        [a1cInput, eagInput].forEach(input => input.removeAttribute("aria-invalid"));
    }
    function invalidate() {
        current = null;
        closePreview();
        visible(result, false);
        shareIds.forEach(id => { if (byId(id)) byId(id).disabled = true; });
        if (status) status.textContent = "";
        if (byId("share-feedback")) byId("share-feedback").textContent = "";
        clearError();
    }
    function showError(message, input) {
        byId("error-message").textContent = message;
        visible(byId("error-container"), true);
        if (input) { input.setAttribute("aria-invalid", "true"); input.focus(); }
    }
    function updateInputs() {
        const forward = direction() === "a1c-to-eag";
        visible(byId("a1c-input-container"), forward);
        visible(byId("eag-input-container"), !forward);
        a1cInput.disabled = !forward;
        eagInput.disabled = forward;
        const mgdl = units() === "mgdl";
        eagInput.min = mgdl ? "70" : "3.9";
        eagInput.max = mgdl ? "600" : "33.3";
        eagInput.step = "any";
        a1cInput.step = "any";
        const label = document.querySelector('label[for="eag-input"]');
        if (label) label.textContent = `Enter eAG value (${mgdl ? "mg/dL" : "mmol/L"}):`;
        if (byId("eag-hint")) byId("eag-hint").textContent = mgdl ? "Enter 70–600 mg/dL." : "Enter 3.9–33.3 mmol/L.";
    }
    document.querySelectorAll('input[name="conversion-direction"]').forEach(radio => radio.addEventListener("change", () => { invalidate(); updateInputs(); }));
    document.querySelectorAll('input[name="eag-units"]').forEach(radio => radio.addEventListener("change", () => { invalidate(); eagInput.value = ""; updateInputs(); }));
    [a1cInput, eagInput].forEach(input => input.addEventListener("input", invalidate));
    function summary(calc) {
        return `A1C: ${calc.a1c.toFixed(1)}%; estimated average glucose: ${Math.round(calc.eagMgdl)} mg/dL (${calc.eagMmoll.toFixed(1)} mmol/L).`;
    }
    function render(calc, imported, inputText = String(calc.input)) {
        current = calc;
        const output = byId("result-value");
        output.replaceChildren();
        const lines = calc.type === "a1c-to-eag" ? [`eAG: ${Math.round(calc.eagMgdl)} mg/dL`, `eAG: ${calc.eagMmoll.toFixed(1)} mmol/L`] : [`A1C: ${calc.a1c.toFixed(1)}%`];
        lines.forEach(text => { const line = document.createElement("div"); line.textContent = text; output.appendChild(line); });
        byId("result-explanation").textContent = calc.type === "a1c-to-eag"
            ? `An A1C of ${inputText}% corresponds to an estimated average glucose of ${Math.round(calc.eagMgdl)} mg/dL or ${calc.eagMmoll.toFixed(1)} mmol/L.`
            : `An estimated average glucose of ${inputText} ${calc.units === "mgdl" ? "mg/dL" : "mmol/L"} corresponds to an A1C of approximately ${calc.a1c.toFixed(1)}%.`;
        byId("result-timestamp").textContent = `${imported ? "Link-supplied time (not verified)" : "Calculated on"}: ${new Date(calc.date).toLocaleString("en-US")}`;
        visible(result, true);
        shareIds.forEach(id => { if (byId(id)) byId(id).disabled = false; });
        if (status) status.textContent = `Calculation complete. ${summary(calc)}`;
    }
    form.addEventListener("submit", event => {
        event.preventDefault();
        invalidate();
        const input = direction() === "a1c-to-eag" ? a1cInput : eagInput;
        const text = input.value.trim();
        if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) || !Number.isFinite(Number(text))) {
            showError("Enter a decimal number without signs, exponents, or units.", input);
            return;
        }
        try {
            render(calculator.createCalculation({ type: direction(), input: Number(text), ...(direction() === "eag-to-a1c" ? { units: units() } : {}), date: new Date().toISOString() }), false, text);
        } catch (_) {
            showError(direction() === "a1c-to-eag" ? "Enter an A1C value between 4 and 20%." : units() === "mgdl" ? "Enter an eAG value between 70 and 600 mg/dL." : "Enter an eAG value between 3.9 and 33.3 mmol/L.", input);
        }
    });
    function fallback(action, message) {
        if (byId("external-action-description")) byId("external-action-description").textContent = message;
        visible(byId("external-action-fallback"), true);
        const output = byId("shared-link-output"), link = byId("external-action-link");
        visible(output, action.kind === "copy");
        visible(link, action.kind !== "copy");
        if (action.kind === "copy" && output) { output.value = action.payload; output.focus(); output.select(); }
        if (action.kind !== "copy" && link) {
            link.href = action.destination;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Open the confirmed destination";
            link.focus();
        }
    }
    async function transfer() {
        const action = pending;
        if (!action || action.calculation !== current) return;
        confirm.disabled = true;
        if (action.kind === "copy") {
            try {
                if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
                await navigator.clipboard.writeText(action.payload);
                if (pending !== action) return;
                closePreview();
                if (status) status.textContent = "Calculation link copied.";
                if (byId("share-feedback")) byId("share-feedback").textContent = "Calculation link copied.";
            } catch (_) {
                if (pending === action) fallback(action, "Copy the confirmed link below. Anyone with this link can read its health values.");
            }
        } else if (action.kind === "email") {
            // The explicit link also works when a mail handler is unavailable.
            fallback(action, "Open your email application with the confirmed message using this link.");
        } else {
            // With noopener a successful window.open may return null; retain the explicit link in either case.
            try { window.open(action.destination, "_blank", "noopener,noreferrer"); } catch (_) { /* Offer the same confirmed link. */ }
            fallback(action, "If the destination did not open, use the confirmed link below.");
        }
    }
    confirm?.addEventListener("click", transfer);
    shareIds.forEach(id => byId(id)?.addEventListener("click", event => {
        if (!current || !dialog || typeof dialog.showModal !== "function") {
            if (current && status) status.textContent = "Sharing requires a browser that supports confirmation dialogs.";
            return;
        }
        if (byId("share-feedback")) byId("share-feedback").textContent = "";
        const shareUrl = calculator.generateShareUrl(window.location.href, current);
        const text = summary(current);
        let kind = "external", name, payload, destination;
        if (id === "share-btn") { kind = "copy"; name = "Clipboard"; payload = shareUrl; destination = "Your device clipboard"; }
        else if (id === "share-facebook") {
            name = "Facebook"; payload = shareUrl; destination = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        } else if (id === "share-twitter") {
            name = "X"; payload = `${text}\n${shareUrl}`; destination = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        } else if (id === "share-email") {
            kind = "email"; name = "Email application";
            payload = `Subject: eAG/A1C Calculation Result\n\n${text}\n\nView the calculation: ${shareUrl}`;
            destination = `mailto:?subject=${encodeURIComponent("eAG/A1C Calculation Result")}&body=${encodeURIComponent(`${text}\n\nView the calculation: ${shareUrl}`)}`;
        } else {
            name = "ChatGPT";
            payload = `Explain this educational estimate: ${text} The input was ${current.input} ${current.type === "a1c-to-eag" ? "% A1C" : current.units === "mgdl" ? "mg/dL eAG" : "mmol/L eAG"}; calculation timestamp: ${current.date}. Explain the limits of this estimate and suggest questions to ask a healthcare professional. Do not diagnose or recommend individualized treatment or targets.`;
            destination = `https://chat.openai.com/?q=${encodeURIComponent(payload)}`;
        }
        pending = { kind, payload, destination, calculation: current };
        invokingButton = event.currentTarget;
        byId("external-action-title").textContent = `Share with ${name}`;
        byId("external-action-description").textContent = "Confirm before sharing these health values. Anyone with the link can decode them; encoding is not encryption. External services may process the full submitted content.";
        const destinationIdentity = kind === "copy" ? "Your device clipboard" : kind === "email" ? "Email application" : `${name} (${new URL(destination).origin})`;
        byId("external-action-preview").textContent = `Destination: ${destinationIdentity}\n\nCalculation: ${text}\nTimestamp: ${current.date}\n\nExact payload:\n${payload}`;
        if (byId("external-action-address")) byId("external-action-address").textContent = destination;
        if (byId("external-action-address-details")) byId("external-action-address-details").open = false;
        visible(byId("external-action-fallback"), false);
        confirm.disabled = false;
        dialog.showModal();
    }));
    invalidate();
    updateInputs();
    function importCalculationUrl() {
        try {
            const imported = calculator.readCalculationUrl(window.location.href);
            if (!imported) return;
            invalidate();
            const calc = imported.calculation;
            document.querySelectorAll('input[name="conversion-direction"]').forEach(radio => { radio.checked = radio.value === calc.type; });
            if (calc.units) document.querySelectorAll('input[name="eag-units"]').forEach(radio => { radio.checked = radio.value === calc.units; });
            updateInputs();
            (calc.type === "a1c-to-eag" ? a1cInput : eagInput).value = String(calc.input);
            render(calc, true);
            if (imported.source === "query") history.replaceState(null, "", calculator.generateShareUrl(window.location.href, calc));
        } catch (_) {
            invalidate();
            showError("This shared calculation is invalid or unsupported. Enter a value to calculate again.", direction() === "a1c-to-eag" ? a1cInput : eagInput);
        }
    }
    importCalculationUrl();
    window.addEventListener("hashchange", () => {
        // In-page anchors (including the skip link) must not replace a current calculation.
        const fragment = new URLSearchParams(new URL(window.location.href).hash.slice(1));
        if (fragment.has("c")) importCalculationUrl();
    });
});
