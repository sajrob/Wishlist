# Wishlist App

A React application featuring a beautiful card component for displaying wishlist items.

## Features

- **Card Component** with:
  - Image with rounded corners on top
  - Item name
  - Price
  - Description
  - Buy link button

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Running the App

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Build the app for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
Wishlist/
├── src/
│   ├── components/
│   │   ├── WishlistCard.jsx    # Card component
│   │   └── WishlistCard.css    # Card styles
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # App styles
│   └── main.jsx                # Entry point
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.js             # Vite configuration
└── README.md                   # This file
```

## Customizing the Card

Edit the `sampleItem` object in `src/App.jsx` to customize the card content:

```javascript
const sampleItem = {
  name: "Your Item Name",
  price: "$XX.XX",
  description: "Your description here",
  imageUrl: "your-image-url.jpg",
  buyLink: "https://your-link.com"
};
```

