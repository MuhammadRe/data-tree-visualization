# dmp-project

## Overview

The Data Tree Visualization App is a web-based application designed to visually represent hierarchical data as a tree structure. This app uses D3.js for rendering the tree and Vue.js for the frontend framework, providing an interactive user experience. It fetches hierarchical data from a backend server, where the data is stored in a MongoDB database, allowing for dynamic updates and management of the tree structure.

## Features

1. Dynamic Data Loading: Fetches hierarchical data from a MongoDB database via a Node.js backend.
2. Interactive Visualization: Users can click on nodes to view additional details.
3. Scalable Design: Implements D3.js for rendering, suitable for displaying complex hierarchical structures.
4. Error Handling: Displays loading states and error messages for better user feedback.

## installation

Prerequisites

- Node.js
- MongoDB

### Backend Setup:

1. Clone the repository:
   git clone <https://github.com/MuhammadRe/data-tree-visualization/tree/master>

2. Navigate to the server directory:
   cd path/to/server

3. Install dependencies:
   npm install

4. Start the server:
   node server.js

### Frontend Setup

1. Navigate to the frontend directory:
   cd path/to/frontend

2. Install dependencies:
   npm install

3. Serve the application:
   npm run serve

4. Open the application:
   Access http://localhost:8080 in your web browser.

## Deployed app

If you want to check the app, visit this link:
https://data-tree-c7f5af2a0b76.herokuapp.com/

For source code access, use the public Github link below:
https://github.com/MuhammadRe/data-tree-visualization/tree/master
