# eAG/A1C Calculator

A web-based calculator for converting between A1C and estimated Average Glucose (eAG) measurements for diabetes management.

## Features

- Bidirectional conversion between A1C and eAG values
- Support for both mg/dL and mmol/L units
- Educational content about blood glucose measurements
- Information about factors affecting blood sugar levels
- Clean, responsive design for desktop and mobile devices

## Live Demo

The calculator is deployed and available at: [https://fhqrowok.manus.space](https://fhqrowok.manus.space)

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
- Uses Tailwind CSS for styling
- No server-side processing required
- Implements the ADA formula: eAG (mg/dL) = 28.7 × A1C - 46.7

## File Structure

- `index.html` - Main HTML file
- `css/styles.css` - Custom CSS styles
- `js/script.js` - JavaScript functionality
- `requirements.md` - Project requirements
- `design.md` - Design documentation
- `todo.md` - Project task list

## Conversion Formulas

- A1C to eAG (mg/dL): eAG = 28.7 × A1C - 46.7
- A1C to eAG (mmol/L): eAG = (28.7 × A1C - 46.7) / 18
- eAG (mg/dL) to A1C: A1C = (eAG + 46.7) / 28.7
- eAG (mmol/L) to A1C: A1C = ((eAG × 18) + 46.7) / 28.7

## References & Resources

- [American Diabetes Association](https://diabetes.org/) - Official website with comprehensive resources on diabetes management
- [Joslin Diabetes Center](https://joslin.org/) - World-renowned diabetes research and clinical care organization
- [Mayo Clinic - Diabetes](https://www.mayoclinic.org/diseases-conditions/diabetes/symptoms-causes/syc-20371444) - Comprehensive guide to diabetes symptoms, causes, and treatments
- [Diabetes on YouTube](https://www.youtube.com/results?search_query=diabetes) - Educational videos about diabetes management and care

## License

This project is based on the [American Diabetes Association](https://diabetes.org/) conversion formulas.

&copy; 2025 Richard Crane. All rights reserved.
