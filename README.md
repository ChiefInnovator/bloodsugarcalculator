# Blood Sugar Calculator

## Description
A web-based application built with HTML and JavaScript to help users calculate and track their blood sugar levels. This tool is designed for individuals managing diabetes or anyone interested in monitoring their blood glucose directly in their web browser. It allows for logging readings, calculating averages, and providing basic insights without needing any backend setup.

## Features
- **Input and Log Readings:** Easily enter and store blood sugar measurements.
- **Calculate Statistics:** Automatically computes average, minimum, and maximum readings.
- **Data Visualization:** (Optional) Visualize blood sugar trends over time using charts.
- **Local Storage:** Data is stored locally in the user's browser for privacy.
- **Export Data:** (Optional) Ability to export logged data (e.g., as CSV) for sharing with healthcare providers.

## Getting Started / Usage
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ChiefInnovator/bloodsugarcalculator.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd bloodsugarcalculator
    ```
3.  **Open the Application:**
    Simply open the `index.html` file in your web browser.

    *Alternatively, for development or to avoid potential browser restrictions with local files, you can run a simple local web server:*
    *   **Using Python:**
        ```bash
        # If Python 3 is installed
        python3 -m http.server 8000
        # If Python 2 is installed
        # python -m SimpleHTTPServer 8000
        ```
        Then navigate to `http://localhost:8000` in your browser.
    *   **Using Node.js (with `http-server`):**
        ```bash
        # Install http-server globally (if you haven't already)
        # npm install -g http-server
        http-server -p 8000
        ```
        Then navigate to `http://localhost:8000` in your browser.

4.  **Using the App:** Follow the on-screen interface to input your blood sugar readings and view calculated statistics.