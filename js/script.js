document.addEventListener("DOMContentLoaded", function() {
    // ===================================
    // Mobile Navigation Toggle
    // ===================================
    
    initMobileMenu();
    
    function initMobileMenu() {
        const mobileMenuBtn = document.getElementById("mobile-menu-btn");
        const mobileMenu = document.getElementById("mobile-menu");
        
        if (!mobileMenuBtn || !mobileMenu) return;
        
        mobileMenuBtn.addEventListener("click", function() {
            const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
            
            // Toggle menu visibility
            mobileMenu.classList.toggle("show");
            mobileMenu.classList.toggle("hidden");
            
            // Toggle button state
            mobileMenuBtn.classList.toggle("active");
            mobileMenuBtn.setAttribute("aria-expanded", !isExpanded);
        });
        
        // Close menu when clicking outside
        document.addEventListener("click", function(e) {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove("show");
                mobileMenu.classList.add("hidden");
                mobileMenuBtn.classList.remove("active");
                mobileMenuBtn.setAttribute("aria-expanded", "false");
            }
        });
        
        // Close menu on window resize (if switching to desktop)
        window.addEventListener("resize", function() {
            if (window.innerWidth >= 768) {
                mobileMenu.classList.remove("show");
                mobileMenu.classList.add("hidden");
                mobileMenuBtn.classList.remove("active");
                mobileMenuBtn.setAttribute("aria-expanded", "false");
            }
        });
    }
    
    // ===================================
    // Cookie Consent Management
    // ===================================
    
    const CONSENT_VERSION = "1.0";
    const CONSENT_DURATION_MONTHS = 12;
    const CONSENT_KEY = "cookieConsent";
    
    // Initialize consent banner
    initConsentBanner();
    
    function initConsentBanner() {
        const banner = document.getElementById("cookie-consent-banner");
        if (!banner) return;
        
        const consent = loadConsent();
        
        if (!consent || isConsentExpired(consent)) {
            // Show banner after a short delay for better UX
            setTimeout(() => {
                banner.classList.add("show");
            }, 500);
        } else {
            // Apply saved consent
            updateGoogleConsent(consent);
        }
        
        // Set up event listeners
        setupConsentListeners();
    }
    
    function setupConsentListeners() {
        // Accept All button
        const acceptAllBtn = document.getElementById("consent-accept-all");
        if (acceptAllBtn) {
            acceptAllBtn.addEventListener("click", handleAcceptAll);
        }
        
        // Reject Non-Essential button
        const rejectBtn = document.getElementById("consent-reject");
        if (rejectBtn) {
            rejectBtn.addEventListener("click", handleRejectNonEssential);
        }
        
        // Customize button
        const customizeBtn = document.getElementById("consent-customize");
        if (customizeBtn) {
            customizeBtn.addEventListener("click", handleCustomize);
        }
        
        // Save Preferences button
        const saveBtn = document.getElementById("consent-save");
        if (saveBtn) {
            saveBtn.addEventListener("click", handleSavePreferences);
        }
        
        // Manage Cookies button (on cookie policy page and footer)
        const manageBtns = document.querySelectorAll("#manage-cookies-btn, .manage-cookies-link");
        manageBtns.forEach(btn => {
            btn.addEventListener("click", reopenConsentBanner);
        });
    }
    
    function handleAcceptAll() {
        const preferences = {
            analytics: true,
            advertising: true
        };
        saveConsent(preferences);
        updateGoogleConsent(preferences);
        hideBanner();
    }
    
    function handleRejectNonEssential() {
        const preferences = {
            analytics: false,
            advertising: false
        };
        saveConsent(preferences);
        updateGoogleConsent(preferences);
        hideBanner();
    }
    
    function handleCustomize() {
        const options = document.getElementById("consent-options");
        const saveContainer = document.getElementById("consent-save-container");
        
        if (options) {
            options.classList.toggle("show");
        }
        if (saveContainer) {
            saveContainer.classList.toggle("show");
        }
    }
    
    function handleSavePreferences() {
        const analyticsToggle = document.getElementById("consent-analytics");
        const advertisingToggle = document.getElementById("consent-advertising");
        
        const preferences = {
            analytics: analyticsToggle ? analyticsToggle.checked : false,
            advertising: advertisingToggle ? advertisingToggle.checked : false
        };
        
        saveConsent(preferences);
        updateGoogleConsent(preferences);
        hideBanner();
    }
    
    function reopenConsentBanner(e) {
        if (e) e.preventDefault();
        
        const banner = document.getElementById("cookie-consent-banner");
        const options = document.getElementById("consent-options");
        const saveContainer = document.getElementById("consent-save-container");
        
        // Load current preferences into toggles
        const consent = loadConsent();
        if (consent) {
            const analyticsToggle = document.getElementById("consent-analytics");
            const advertisingToggle = document.getElementById("consent-advertising");
            
            if (analyticsToggle) analyticsToggle.checked = consent.analytics;
            if (advertisingToggle) advertisingToggle.checked = consent.advertising;
        }
        
        // Show options expanded
        if (options) options.classList.add("show");
        if (saveContainer) saveContainer.classList.add("show");
        
        // Show banner
        if (banner) {
            banner.classList.remove("hide");
            banner.classList.add("show");
        }
    }
    
    function hideBanner() {
        const banner = document.getElementById("cookie-consent-banner");
        if (banner) {
            banner.classList.remove("show");
            banner.classList.add("hide");
        }
    }
    
    function saveConsent(preferences) {
        const consentData = {
            analytics: preferences.analytics,
            advertising: preferences.advertising,
            timestamp: new Date().toISOString(),
            version: CONSENT_VERSION
        };
        
        try {
            localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
        } catch (e) {
            console.warn("Could not save consent to localStorage:", e);
        }
    }
    
    function loadConsent() {
        try {
            const data = localStorage.getItem(CONSENT_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.warn("Could not load consent from localStorage:", e);
        }
        return null;
    }
    
    function isConsentExpired(consent) {
        if (!consent || !consent.timestamp) return true;
        
        const consentDate = new Date(consent.timestamp);
        const expiryDate = new Date(consentDate);
        expiryDate.setMonth(expiryDate.getMonth() + CONSENT_DURATION_MONTHS);
        
        return new Date() > expiryDate;
    }
    
    function updateGoogleConsent(preferences) {
        // Update Google Consent Mode v2
        if (typeof gtag === "function") {
            gtag("consent", "update", {
                "analytics_storage": preferences.analytics ? "granted" : "denied",
                "ad_storage": preferences.advertising ? "granted" : "denied",
                "ad_user_data": preferences.advertising ? "granted" : "denied",
                "ad_personalization": preferences.advertising ? "granted" : "denied"
            });
        }
    }
    
    // Expose reopenConsentBanner globally for inline onclick handlers
    window.reopenConsentBanner = reopenConsentBanner;

    // Get DOM elements for calculator (check if they exist)
    const conversionDirectionRadios = document.querySelectorAll("input[name=\"conversion-direction\"]");
    const a1cInputContainer = document.getElementById("a1c-input-container");
    const eagInputContainer = document.getElementById("eag-input-container");
    const a1cInput = document.getElementById("a1c-input");
    const eagInput = document.getElementById("eag-input");
    const eagUnitsRadios = document.querySelectorAll("input[name=\"eag-units\"]");
    const calculateBtn = document.getElementById("calculate-btn");
    const resultContainer = document.getElementById("result-container");
    const resultValue = document.getElementById("result-value");
    const resultExplanation = document.getElementById("result-explanation");
    const resultTimestamp = document.getElementById("result-timestamp");
    const errorContainer = document.getElementById("error-container");
    const errorMessage = document.getElementById("error-message");
    const shareBtn = document.getElementById("share-btn");
    const shareFacebook = document.getElementById("share-facebook");
    const shareTwitter = document.getElementById("share-twitter");
    const shareEmail = document.getElementById("share-email");
    
    // Toast notification function
    function showToast(message, type = "success") {
        const container = document.getElementById("toast-container");
        if (!container) return;
        
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Auto-remove after animation completes
        setTimeout(() => {
            toast.classList.add("fade-out");
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2700);
    }
    
    // Store current calculation for sharing
    let currentCalculation = null;
    let currentShareUrl = null;

    // --- Calculator Logic (only run if calculator elements exist) ---
    if (calculateBtn) { 
        // Set initial display state based on default selected radio button
        const initialConversionDirectionRadio = document.querySelector("input[name=\"conversion-direction\"]:checked");
        if (initialConversionDirectionRadio) {
            const initialConversionDirection = initialConversionDirectionRadio.value;
            if (initialConversionDirection === "a1c-to-eag") {
                if (a1cInputContainer) a1cInputContainer.classList.remove("hidden");
                if (eagInputContainer) eagInputContainer.classList.add("hidden");
            } else {
                if (a1cInputContainer) a1cInputContainer.classList.add("hidden");
                if (eagInputContainer) eagInputContainer.classList.remove("hidden");
            }
        }

        // Set up conversion direction change handler
        conversionDirectionRadios.forEach(radio => {
            radio.addEventListener("change", function() {
                if (this.value === "a1c-to-eag") {
                    if (a1cInputContainer) a1cInputContainer.classList.remove("hidden");
                    if (eagInputContainer) eagInputContainer.classList.add("hidden");
                } else {
                    if (a1cInputContainer) a1cInputContainer.classList.add("hidden");
                    if (eagInputContainer) eagInputContainer.classList.remove("hidden");
                }
                
                // Clear previous results and errors
                if (resultContainer) resultContainer.classList.add("hidden");
                if (errorContainer) errorContainer.classList.add("hidden");
            });
        });
        
        // Set up calculate button click handler
        calculateBtn.addEventListener("click", function() {
            // Clear previous results and errors
            if (resultContainer) resultContainer.classList.add("hidden");
            if (errorContainer) errorContainer.classList.add("hidden");
            
            // Get selected conversion direction
            const conversionDirectionRadio = document.querySelector("input[name=\"conversion-direction\"]:checked");
            if (!conversionDirectionRadio) return; // Should not happen with radio buttons
            const conversionDirection = conversionDirectionRadio.value;
            
            if (conversionDirection === "a1c-to-eag") {
                // A1C to eAG conversion
                const a1cValue = parseFloat(a1cInput.value);
                
                // Validate input
                if (isNaN(a1cValue)) {
                    showError("Please enter a valid A1C value.");
                    return;
                }
                
                // ADA recommendation is generally up to 14%, but input allows 20. Let's keep validation aligned with input for now.
                if (a1cValue < 4.0 || a1cValue > 20.0) { 
                    showError("Please enter an A1C value between 4.0 and 20.0.");
                    return;
                }
                
                // Calculate eAG in mg/dL
                const eagMgdl = calculateEagFromA1c(a1cValue);
                
                // Calculate eAG in mmol/L
                const eagMmoll = (eagMgdl / 18).toFixed(1);
                
                // Display result
                if (resultValue) resultValue.innerHTML = `
                    <div>eAG: ${eagMgdl} mg/dL</div>
                    <div>eAG: ${eagMmoll} mmol/L</div>
                `;
                
                const calcDate = new Date();
                if (resultExplanation) resultExplanation.textContent = `An A1C of ${a1cValue.toFixed(1)}% corresponds to an estimated average glucose of ${eagMgdl} mg/dL or ${eagMmoll} mmol/L.`;
                if (resultTimestamp) resultTimestamp.textContent = `Calculated on ${formatTimestamp(calcDate)}`;
                if (resultContainer) {
                    resultContainer.classList.remove("hidden");
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                
                // Store calculation for sharing
                currentCalculation = {
                    type: 'a1c-to-eag',
                    input: a1cValue,
                    resultMgdl: eagMgdl,
                    resultMmoll: eagMmoll,
                    date: calcDate.toISOString()
                };
                
            } else {
                // eAG to A1C conversion
                const eagValue = parseFloat(eagInput.value);
                const eagUnitsRadio = document.querySelector("input[name=\"eag-units\"]:checked");
                if (!eagUnitsRadio) return; // Should not happen
                const eagUnits = eagUnitsRadio.value;
                
                // Validate input
                if (isNaN(eagValue)) {
                    showError("Please enter a valid eAG value.");
                    return;
                }
                
                // Validate range based on units
                if (eagUnits === "mgdl") {
                    if (eagValue < 70 || eagValue > 600) {
                        showError("Please enter an eAG value between 70 and 600 mg/dL.");
                        return;
                    }
                } else {
                    if (eagValue < 3.9 || eagValue > 33.3) {
                        showError("Please enter an eAG value between 3.9 and 33.3 mmol/L.");
                        return;
                    }
                }
                
                // Calculate A1C
                let a1cValue;
                if (eagUnits === "mgdl") {
                    a1cValue = calculateA1cFromEagMgdl(eagValue);
                } else {
                    a1cValue = calculateA1cFromEagMmoll(eagValue);
                }
                
                // Display result
                if (resultValue) resultValue.innerHTML = `A1C: ${a1cValue.toFixed(1)}%`;
                
                const calcDate = new Date();
                const eagUnitText = eagUnits === "mgdl" ? "mg/dL" : "mmol/L";
                if (resultExplanation) resultExplanation.textContent = `An estimated average glucose of ${eagValue} ${eagUnitText} corresponds to an A1C of approximately ${a1cValue.toFixed(1)}%.`;
                if (resultTimestamp) resultTimestamp.textContent = `Calculated on ${formatTimestamp(calcDate)}`;
                if (resultContainer) {
                    resultContainer.classList.remove("hidden");
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                
                // Store calculation for sharing
                currentCalculation = {
                    type: 'eag-to-a1c',
                    input: eagValue,
                    units: eagUnits,
                    result: a1cValue.toFixed(1),
                    date: calcDate.toISOString()
                };
            }
        });

        // Helper function to calculate eAG from A1C
        function calculateEagFromA1c(a1c) {
            return Math.round(28.7 * a1c - 46.7);
        }
        
        // Helper function to calculate A1C from eAG (mg/dL)
        function calculateA1cFromEagMgdl(eag) {
            return (eag + 46.7) / 28.7;
        }
        
        // Helper function to format timestamp
        function formatTimestamp(date) {
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            };
            return date.toLocaleDateString('en-US', options);
        }
        
        // Helper function to calculate A1C from eAG (mmol/L)
        function calculateA1cFromEagMmoll(eag) {
            // Convert mmol/L to mg/dL first
            const eagMgdl = eag * 18;
            return calculateA1cFromEagMgdl(eagMgdl);
        }
        
        // Helper function to show error message
        function showError(message) {
            if (errorMessage) errorMessage.textContent = message;
            if (errorContainer) errorContainer.classList.remove("hidden");
        }
        
        // --- Share Button Logic ---
        
        // Helper to generate share URL
        function generateShareUrl() {
            if (!currentCalculation) return null;
            const shareData = encodeCalculation(currentCalculation);
            return `${window.location.origin}${window.location.pathname}?c=${shareData}`;
        }
        
        // Helper to get share text
        function getShareText() {
            if (!currentCalculation) return "";
            if (currentCalculation.type === 'a1c-to-eag') {
                return `My A1C of ${currentCalculation.input}% equals an eAG of ${currentCalculation.resultMgdl} mg/dL. Check your levels with this free diabetes calculator!`;
            } else {
                const unitText = currentCalculation.units === 'mgdl' ? 'mg/dL' : 'mmol/L';
                return `My eAG of ${currentCalculation.input} ${unitText} equals an A1C of ${currentCalculation.result}%. Check your levels with this free diabetes calculator!`;
            }
        }
        
        if (shareBtn) {
            shareBtn.addEventListener("click", function() {
                const shareUrl = generateShareUrl();
                if (!shareUrl) return;
                
                // Copy to clipboard
                navigator.clipboard.writeText(shareUrl).then(() => {
                    showToast("Link copied!", "success");
                }).catch(err => {
                    console.error("Could not copy link:", err);
                    showToast("Could not copy link", "error");
                    // Fallback: show the URL in a prompt
                    prompt("Copy this link to share:", shareUrl);
                });
            });
        }
        
        // Share to Facebook
        if (shareFacebook) {
            shareFacebook.addEventListener("click", function() {
                const shareUrl = generateShareUrl();
                if (!shareUrl) return;
                
                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                window.open(facebookUrl, '_blank', 'width=600,height=400,menubar=no,toolbar=no');
            });
        }
        
        // Share to X (Twitter)
        if (shareTwitter) {
            shareTwitter.addEventListener("click", function() {
                const shareUrl = generateShareUrl();
                if (!shareUrl) return;
                
                const text = getShareText();
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
                window.open(twitterUrl, '_blank', 'width=600,height=400,menubar=no,toolbar=no');
            });
        }
        
        // Share via Email
        if (shareEmail) {
            shareEmail.addEventListener("click", function() {
                const shareUrl = generateShareUrl();
                if (!shareUrl) return;
                
                const text = getShareText();
                const subject = "eAG/A1C Calculation Result";
                const body = `${text}\n\nView the calculation: ${shareUrl}`;
                const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.location.href = mailtoUrl;
            });
        }
        
        // Encode calculation to URL-safe base64 JSON
        function encodeCalculation(calc) {
            const json = JSON.stringify(calc);
            // Use btoa for base64, then make URL-safe
            const base64 = btoa(unescape(encodeURIComponent(json)));
            return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        
        // Decode calculation from URL-safe base64 JSON
        function decodeCalculation(encoded) {
            try {
                // Restore base64 padding and characters
                let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
                while (base64.length % 4) {
                    base64 += '=';
                }
                const json = decodeURIComponent(escape(atob(base64)));
                return JSON.parse(json);
            } catch (e) {
                console.warn("Could not decode calculation:", e);
                return null;
            }
        }
        
        // --- Load from URL Parameters ---
        loadFromUrlParams();
        
        function loadFromUrlParams() {
            const params = new URLSearchParams(window.location.search);
            const encoded = params.get('c');
            
            if (!encoded) return;
            
            const calc = decodeCalculation(encoded);
            if (!calc || !calc.type || !calc.date) return;
            
            try {
                const calcDate = new Date(calc.date);
                
                if (calc.type === 'a1c-to-eag') {
                    const a1cValue = parseFloat(calc.input);
                    const resultMgdl = calc.resultMgdl;
                    const resultMmoll = calc.resultMmoll;
                    
                    if (isNaN(a1cValue) || !resultMgdl || !resultMmoll) return;
                    
                    // Set the conversion direction
                    const a1cToEagRadio = document.querySelector("input[name=\"conversion-direction\"][value=\"a1c-to-eag\"]");
                    if (a1cToEagRadio) {
                        a1cToEagRadio.checked = true;
                        if (a1cInputContainer) a1cInputContainer.classList.remove("hidden");
                        if (eagInputContainer) eagInputContainer.classList.add("hidden");
                    }
                    
                    // Set input value
                    if (a1cInput) a1cInput.value = a1cValue;
                    
                    // Display result
                    if (resultValue) resultValue.innerHTML = `
                        <div>eAG: ${resultMgdl} mg/dL</div>
                        <div>eAG: ${resultMmoll} mmol/L</div>
                    `;
                    if (resultExplanation) resultExplanation.textContent = `An A1C of ${a1cValue.toFixed(1)}% corresponds to an estimated average glucose of ${resultMgdl} mg/dL or ${resultMmoll} mmol/L.`;
                    if (resultTimestamp) resultTimestamp.textContent = `Calculated on ${formatTimestamp(calcDate)}`;
                    if (resultContainer) resultContainer.classList.remove("hidden");
                    
                    // Store for re-sharing
                    currentCalculation = calc;
                    
                } else if (calc.type === 'eag-to-a1c') {
                    const eagValue = parseFloat(calc.input);
                    const units = calc.units || 'mgdl';
                    const result = calc.result;
                    
                    if (isNaN(eagValue) || !result) return;
                    
                    // Set the conversion direction
                    const eagToA1cRadio = document.querySelector("input[name=\"conversion-direction\"][value=\"eag-to-a1c\"]");
                    if (eagToA1cRadio) {
                        eagToA1cRadio.checked = true;
                        if (a1cInputContainer) a1cInputContainer.classList.add("hidden");
                        if (eagInputContainer) eagInputContainer.classList.remove("hidden");
                    }
                    
                    // Set input value and units
                    if (eagInput) eagInput.value = eagValue;
                    const unitsRadio = document.querySelector(`input[name=\"eag-units\"][value=\"${units}\"]`);
                    if (unitsRadio) unitsRadio.checked = true;
                    
                    // Display result
                    const eagUnitText = units === "mgdl" ? "mg/dL" : "mmol/L";
                    if (resultValue) resultValue.innerHTML = `A1C: ${result}%`;
                    if (resultExplanation) resultExplanation.textContent = `An estimated average glucose of ${eagValue} ${eagUnitText} corresponds to an A1C of approximately ${result}%.`;
                    if (resultTimestamp) resultTimestamp.textContent = `Calculated on ${formatTimestamp(calcDate)}`;
                    if (resultContainer) resultContainer.classList.remove("hidden");
                    
                    // Store for re-sharing
                    currentCalculation = calc;
                }
                
                // Scroll to result
                if (resultContainer) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
            } catch (e) {
                console.warn("Could not load calculation from URL:", e);
            }
        }
        
    } // End of calculator logic check

    // --- Accordion Logic (runs on all pages) ---
    const accordionBtns = document.querySelectorAll(".accordion-btn");
    accordionBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector("svg");
            
            // Toggle content visibility
            if (content && content.classList.contains("accordion-content")) {
                if (content.classList.contains("hidden")) {
                    content.classList.remove("hidden");
                    if (icon) icon.classList.add("rotate-180");
                } else {
                    content.classList.add("hidden");
                    if (icon) icon.classList.remove("rotate-180");
                }
            }
        });
    });

});

