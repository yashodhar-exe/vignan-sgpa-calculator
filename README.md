# Vignan University SGPA Calculator

An AI-powered web application that instantly extracts data and calculates your SGPA from your Vignan University results screenshots.

## Features
- **Instant Extraction**: Uses Google Gemini 2.5 Flash AI to parse your result screenshots automatically and accurately.
- **Accurate Calculations**: Calculates total credits, grade points, and your final SGPA instantly.
- **Sleek UI**: Modern, responsive user interface with drag-and-drop support, built with React and Tailwind CSS.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Tech Stack
- React
- Vite
- Tailwind CSS
- Google Gemini AI (`@google/genai`)
