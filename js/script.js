document.addEventListener("DOMContentLoaded", function() {
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
    const errorContainer = document.getElementById("error-container");
    const errorMessage = document.getElementById("error-message");

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
                
                if (resultExplanation) resultExplanation.textContent = `An A1C of ${a1cValue.toFixed(1)}% corresponds to an estimated average glucose of ${eagMgdl} mg/dL or ${eagMmoll} mmol/L.`;
                if (resultContainer) resultContainer.classList.remove("hidden");
                
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
                
                if (eagValue <= 0) {
                    showError("Please enter a positive eAG value.");
                    return;
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
                
                const eagUnitText = eagUnits === "mgdl" ? "mg/dL" : "mmol/L";
                if (resultExplanation) resultExplanation.textContent = `An estimated average glucose of ${eagValue} ${eagUnitText} corresponds to an A1C of approximately ${a1cValue.toFixed(1)}%.`;
                if (resultContainer) resultContainer.classList.remove("hidden");
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

