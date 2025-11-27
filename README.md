# eAG/A1C Diabetes Calculator

A web-based calculator for converting between A1C and estimated Average Glucose (eAG) measurements for diabetes management.

## Features

- **Bidirectional conversion** between A1C and eAG values
- **Support for both mg/dL and mmol/L units**
- **Shareable calculations** - Generate a link to share your calculation with others, including the date/time it was made
- **Social sharing** - Share results via Facebook, X (Twitter), or email
- **Ask ChatGPT** - Get personalized health optimization advice based on your A1C/eAG results
- **Calculation timestamp** - Each result shows when it was calculated
- **Input validation** - Prevents unrealistic values (A1C: 4-20%, eAG: 70-600 mg/dL or 3.9-33.3 mmol/L)
- **Top Tips** - Practical diabetes management strategies for diet, exercise, monitoring, and medication
- **Educational resources** - Information about A1C, eAG, diabetes types, and blood glucose management
- **Cookie consent** - GDPR-compliant consent banner with granular control (Google Consent Mode v2)
- **Responsive design** - Mobile-friendly with hamburger menu navigation
- **Clean, accessible UI** - Built with Tailwind CSS

## Live Demo

The calculator is deployed and available at: [https://diabetescalculator.ai](https://diabetescalculator.ai)

## Pages

- **Home** (`index.html`) - Main calculator with conversion functionality and sharing options
- **Top Tips** (`tips.html`) - Practical diabetes management tips for diet, exercise, monitoring, and medication
- **Resources** (`resources.html`) - Educational content, A1C/eAG reference table, diabetes information
- **About** (`about.html`) - Information about the calculator and its creator
- **Privacy Policy** (`privacy.html`) - Privacy practices and data handling
- **Terms & Conditions** (`terms.html`) - Terms of use
- **Cookie Policy** (`cookie.html`) - Cookie usage and management

## Deployment to Azure Static Web App

To deploy this application to Azure Static Web App:

1. Extract the contents of the zip file to your local machine
2. Create a new Static Web App in the Azure Portal
   - Go to the Azure Portal and click "Create a resource"
   - Search for "Static Web App" and select it
   - Fill in the required details (subscription, resource group, name, etc.)
   - Select your deployment method (GitHub, Azure DevOps, or Other)
3. If using GitHub:
   - Push the code to your GitHub repository
   - Connect your GitHub repository to the Azure Static Web App
   - Azure will automatically build and deploy the application
4. If deploying manually:
   - Use the Azure CLI or Azure Static Web Apps CLI to deploy
   - Example command: `swa deploy ./path-to-extracted-files --env production`

## Technical Details

- Built with HTML5, CSS3, and vanilla JavaScript
- Uses Tailwind CSS 2.2.19 for styling
- No server-side processing required - fully static site
- Implements the ADA-approved ADAG study formula
- Google Analytics and Ads integration with Consent Mode v2
- Shareable links use URL-safe base64-encoded JSON
- Developed using Visual Studio Code with GitHub Copilot (Claude Opus 4.5)

## File Structure

```
├── index.html          # Main calculator page
├── tips.html           # Top tips for diabetes management
├── about.html          # About page
├── resources.html      # Educational resources
├── privacy.html        # Privacy policy
├── terms.html          # Terms and conditions
├── cookie.html         # Cookie policy
├── site.webmanifest    # PWA manifest
├── css/
│   └── styles.css      # Custom styles + consent banner
├── js/
│   └── script.js       # Calculator logic, consent management, sharing, ChatGPT integration
├── img/                # Images
├── requirements.md     # Project requirements
├── design.md           # Design documentation
└── todo.md             # Project task list
```

## Conversion Formulas

Based on the [ADAG Study](https://diabetesjournals.org/care/article/31/8/1473/28569/Translating-the-A1C-Assay-Into-Estimated-Average) published in Diabetes Care:

| Conversion | Formula |
|------------|---------|
| A1C → eAG (mg/dL) | `eAG = 28.7 × A1C - 46.7` |
| A1C → eAG (mmol/L) | `eAG = (28.7 × A1C - 46.7) / 18` |
| eAG (mg/dL) → A1C | `A1C = (eAG + 46.7) / 28.7` |
| eAG (mmol/L) → A1C | `A1C = ((eAG × 18) + 46.7) / 28.7` |

## References & Resources

- [American Diabetes Association](https://diabetes.org/) - Official website with comprehensive resources on diabetes management
- [Joslin Diabetes Center](https://joslin.org/) - World-renowned diabetes research and clinical care organization
- [Mayo Clinic - Diabetes](https://www.mayoclinic.org/diseases-conditions/diabetes/symptoms-causes/syc-20371444) - Comprehensive guide to diabetes symptoms, causes, and treatments
- [CDC Diabetes Resources](https://www.cdc.gov/diabetes/) - Statistics, prevention, and management information

## License

This project is based on the [American Diabetes Association](https://diabetes.org/) conversion formulas.

© 2025 Richard Crane. All rights reserved.
