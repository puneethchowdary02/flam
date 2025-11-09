# Performance Dashboard

A high-performance, real-time data visualization dashboard built with Vue 3, TypeScript, and custom Canvas rendering. Designed to handle 10,000+ data points while maintaining 60 FPS.

![Dashboard Screenshot](./screenshot.png)

## ✨ Features

- **Multiple Chart Types**: Line, Bar, Scatter, and Heatmap visualizations
- **Real-time Updates**: New data every 100ms with smooth 60 FPS rendering
- **Interactive Controls**: Time range selection, data filtering, and aggregation
- **Performance Monitoring**: Built-in FPS, render time, and memory tracking
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Custom Canvas Rendering**: No chart libraries - built from scratch for maximum performance

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd performance-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will open at `http://localhost:3000`

### Build for Production
```bash
npm run build
npm run preview
```

## 📊 Architecture

### Technology Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Rendering**: Custom Canvas + SVG hybrid approach
- **State Management**: Vue 3 reactive system

### Project Structure
````
src/
├── components/
│   ├── charts/          # Chart components (Line, Bar, Scatter, Heatmap)
│   ├── controls/        # UI controls (Filters, Time Range)
│   └── DataTable.vue    # Virtual scrolling data table
├── composables/         # Reusable composition functions
│   ├── useDataStream.ts
│   ├── useChartRenderer.ts
│   └── usePerformanceMonitor.ts
├── utils/               # Utility functions
│   ├── dataGenerator.ts
│   ├── performanceUtils.ts
│   └── canvasUtils.ts
└── types/              # TypeScript type definitions