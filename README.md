# InvestIQ - Intelligent Investment Platform

InvestIQ is a premium, AI-powered investment intelligence platform designed to help local investors master the market with explainable predictions and institutional-grade analysis.

![InvestIQ Hero](./public/hero-preview.png)
> *Note: Add a screenshot of the hero section here.*

## 🚀 Project Overview

This repository contains the source code for the **InvestIQ Landing Page**, featuring a modern, responsive design with a "Midnight Gold" aesthetic inspired by leading financial platforms.

### Key Features

-   **Premium UI/UX**: distinctive "Midnight Gold" color theme (`#000000` bg, `#D1C79D` accent).
-   **Dynamic Animations**:
    -   **Typewriter Effect**: Engaging headline animation in the Hero section.
    -   **Live Stock Ticker**: Infinite scrolling ticker with real-time Indian market data (NIFTY, SENSEX, etc.).
    -   **Smart Counters**: "Count-up" animations for key statistics (94% Accuracy, 1M+ Data Points).
    -   **Scroll Reveal**: Elements fade in and slide up as the user scrolls.
-   **Responsive Layout**: Fully optimized for Desktop, Tablet, and Mobile devices.
-   **Interactive Components**:
    -   Tabbed Feature Switcher.
    -   Interactive Pricing Cards with hover effects.
    -   Smart Search Input.

## 🛠️ Technology Stack

-   **Framework**: [React 18](https://reactjs.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: Vanilla CSS (CSS Modules) for maximum performance and customization.
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Fonts**: Inter (via Google Fonts)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/investiq.git
    cd investiq
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:5173` to view the app.

4.  **Build for Production**
    ```bash
    npm run build
    ```
    The output will be in the `dist` directory.

## 📂 Project Structure

```
e:/InvestIQ/
├── src/
│   ├── components/      # React Components (Hero, Header, Ticker, etc.)
│   │   ├── StockTicker.jsx
│   │   ├── StockTicker.module.css
│   │   └── ...
│   ├── App.jsx          # Main Application Component
│   ├── main.jsx         # Entry Point
│   └── index.css        # Global Styles & Variables
├── public/              # Static Assets
└── package.json         # Dependencies & Scripts
```

## 🎨 Color Palette

| Color Name       | Hex Code  | Usage                  |
| ---------------- | --------- | ---------------------- |
| **Pure Black**   | `#000000` | Backgrounds            |
| **Champagne Gold**| `#D1C79D` | Accents, Buttons, Text |
| **Soft Gray**    | `#9CA3AF` | Secondary Text         |
| **Emerald Green**| `#10B981` | Positive Indicators    |
| **Rose Red**     | `#EF4444` | Negative Indicators    |

--
