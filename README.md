# Map App

## Description

Map App is an interactive mapping application built with Angular and OpenLayers. It provides users with the capability to visualize and interact with various geographical features, such as objectives (points of interest) and country borders, on a map. The application includes features such as user authentication, dynamic geocoding, and interactive overlays.

## Capabilities

- **User Authentication**: Secure login functionality to access the map features.
- **Interactive Map**: Display and interact with geographical features using OpenLayers.
- **Objective Highlighting**: Highlight specific objectives (points of interest) on the map based on user interactions.
- **Country Borders Highlighting**: Dynamically highlight country borders based on user clicks.
- **Reverse Geocoding**: Convert coordinates into human-readable locations.
- **Overlay Information**: Show detailed information about map features using overlays.
- **Debounced Pointer Move**: Improve performance by debouncing pointer move events.

## Implementation

### Components

- **AppComponent**: Root component that bootstraps the application.
- **LoginComponent**: Handles user authentication.
- **MapComponent**: Main component that initializes and manages the OpenLayers map.
- **ObjectiveLayerComponent**: Manages and displays objectives (points of interest) on the map.
- **ClickedPointLayerComponent**: Handles marking and displaying the location of clicked points on the map.
- **CountryBordersLayerComponent**: Handles loading and highlighting of country borders on the map.
- **OverlayComponent**: Manages the display of information overlays on the map.

### Services

- **AuthService**: Handles user authentication logic.
- **GeocodingService**: Provides reverse geocoding functionality to convert coordinates into human-readable locations.
- **ObjectiveService**: Fetches and manages objectives data.

### Unit Tests

The application includes unit tests for some components to ensure they function correctly.

### How to Run

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Start the development server using `npm start`.
4. Access the application in your browser at `http://localhost:4200`.

### Dependencies

- Angular
- OpenLayers
- RxJS
- TypeScript

### Dev Dependencies

- Angular CLI
- Jasmine
- Karma
