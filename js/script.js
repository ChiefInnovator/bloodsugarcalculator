// eAG/A1C Calculator JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const conversionDirectionRadios = document.querySelectorAll('input[name="conversion-direction"]');
    const a1cInputContainer = document.getElementById('a1c-input-container');
    const eagInputContainer = document.getElementById('eag-input-container');
    const a1cInput = document.getElementById('a1c-input');
    const eagInput = document.getElementById('eag-input');
    const eagUnitRadios = document.querySelectorAll('input[name="eag-units"]');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const resultValue = document.getElementById('result-value');
    const resultExplanation = document.getElementById('result-explanation');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const accordionBtns = document.querySelectorAll('.accordion-btn');

    // Initialize the calculator
    init();

    // Functions
    function init() {
        // Set up event listeners
        conversionDirectionRadios.forEach(radio => {
            radio.addEventListener('change', handleConversionDirectionChange);
        });

        calculateBtn.addEventListener('click', performCalculation);

        // Set up accordion functionality
        accordionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.toggle('active');
                const content = this.nextElementSibling;
                if (content.style.display === 'block') {
                    content.style.display = 'none';
                } else {
                    content.style.display = 'block';
                    content.classList.add('fade-in');
                }
                
                // Toggle the arrow icon
                const arrow = this.querySelector('svg');
                arrow.classList.toggle('rotate-180');
            });
        });

        // Set initial state
        handleConversionDirectionChange();
    }

    function handleConversionDirectionChange() {
        const isA1cToEag = document.querySelector('input[name="conversion-direction"][value="a1c-to-eag"]').checked;
        
        if (isA1cToEag) {
            a1cInputContainer.classList.remove('hidden');
            eagInputContainer.classList.add('hidden');
            a1cInput.value = '';
        } else {
            a1cInputContainer.classList.add('hidden');
            eagInputContainer.classList.remove('hidden');
            eagInput.value = '';
        }
        
        // Hide results and errors when changing conversion direction
        resultContainer.classList.add('hidden');
        errorContainer.classList.add('hidden');
    }

    function performCalculation() {
        // Hide previous results and errors
        resultContainer.classList.add('hidden');
        errorContainer.classList.add('hidden');
        
        const isA1cToEag = document.querySelector('input[name="conversion-direction"][value="a1c-to-eag"]').checked;
        
        try {
            if (isA1cToEag) {
                calculateA1cToEag();
            } else {
                calculateEagToA1c();
            }
        } catch (error) {
            showError(error.message);
        }
    }

    function calculateA1cToEag() {
        // Get A1C value
        const a1cValue = parseFloat(a1cInput.value);
        
        // Validate input
        if (isNaN(a1cValue)) {
            throw new Error('Please enter a valid A1C value.');
        }
        
        if (a1cValue < 0) {
            throw new Error('A1C value cannot be negative.');
        }
        
        if (a1cValue < 3 || a1cValue > 20) {
            throw new Error('A1C value should be between 3% and 20%. Please check your input.');
        }
        
        // Calculate eAG in mg/dL
        const eagMgdl = (28.7 * a1cValue) - 46.7;
        
        // Calculate eAG in mmol/L
        const eagMmoll = eagMgdl / 18;
        
        // Display results
        resultValue.innerHTML = `
            <div>eAG: ${eagMgdl.toFixed(0)} mg/dL</div>
            <div>eAG: ${eagMmoll.toFixed(1)} mmol/L</div>
        `;
        
        resultExplanation.textContent = `An A1C of ${a1cValue.toFixed(1)}% corresponds to an estimated average glucose of ${eagMgdl.toFixed(0)} mg/dL or ${eagMmoll.toFixed(1)} mmol/L.`;
        
        resultContainer.classList.remove('hidden');
        resultContainer.classList.add('fade-in');
    }

    function calculateEagToA1c() {
        // Get eAG value
        const eagValue = parseFloat(eagInput.value);
        
        // Get selected unit
        const isMgdl = document.querySelector('input[name="eag-units"][value="mgdl"]').checked;
        
        // Validate input
        if (isNaN(eagValue)) {
            throw new Error('Please enter a valid eAG value.');
        }
        
        if (eagValue < 0) {
            throw new Error('eAG value cannot be negative.');
        }
        
        let a1cValue;
        
        if (isMgdl) {
            // Validate mg/dL range
            if (eagValue < 50 || eagValue > 400) {
                throw new Error('eAG value in mg/dL should typically be between 50 and 400. Please check your input.');
            }
            
            // Calculate A1C from mg/dL
            a1cValue = (eagValue + 46.7) / 28.7;
        } else {
            // Validate mmol/L range
            if (eagValue < 3 || eagValue > 25) {
                throw new Error('eAG value in mmol/L should typically be between 3 and 25. Please check your input.');
            }
            
            // Convert mmol/L to mg/dL, then calculate A1C
            const eagMgdl = eagValue * 18;
            a1cValue = (eagMgdl + 46.7) / 28.7;
        }
        
        // Display results
        resultValue.innerHTML = `A1C: ${a1cValue.toFixed(1)}%`;
        
        const unitText = isMgdl ? 'mg/dL' : 'mmol/L';
        resultExplanation.textContent = `An estimated average glucose of ${eagValue} ${unitText} corresponds to an A1C of approximately ${a1cValue.toFixed(1)}%.`;
        
        resultContainer.classList.remove('hidden');
        resultContainer.classList.add('fade-in');
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
        errorContainer.classList.add('fade-in');
    }
});
