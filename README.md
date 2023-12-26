# Reveal.js Manager

This repository provides a command-line interface (CLI) for managing Reveal.js presentations, along with a web socket service for synchronizing and refreshing presentations with live edits.

## Getting Started

Follow these steps to set up and run the Reveal.js Manager on your local machine.

### Prerequisites

- Ensure you have [Node.js](https://nodejs.org/) installed on your system.

### Installation

1. **Clone the Repository**
   
   Begin by cloning the repository to your local machine. Use the following command in your terminal:

   ```bash
   git clone https://github.com/rodolphebarbanneau/revealjs-manager.git
   ```

2. **Install Dependencies**
   
   Navigate to the cloned repository's directory and install the necessary dependencies:

   ```bash
   cd path/to/cloned/repo
   npm install
   ```

### Running the Manager

1. **Start the Examples**

   To get familiar with the Reveal.js framework's capabilities, start by running the example presentations:

   ```bash
   npm run examples
   ```

2. **Launch the Server**
   
   Initiate the server to manage and view your presentations:

   ```bash
   npm run start
   ```

   After starting the server, a message will display the URL where the presentation is accessible. It will also automatically open your default web browser to the presentation's URL.

## Accessing the Manager

- **Open Your Browser**: Launch your preferred web browser.
  
- **Navigate to the Manager**: Enter the URL provided by the server (typically something like `http://localhost:port`).

## Features

- **CLI Interface**: Easily select and manage your presentations via a user-friendly command-line interface.
  
- **Live Sync and Refresh**: Any edits made to the presentations are immediately synchronized and displayed, ensuring a smooth presentation experience.

## Support

For any issues or questions, please refer to the [Issues](https://github.com/rodolphebarbanneau/revealjs-manager/issues) section or consult [Reveal.js](https://revealjs.com/) for detailed guides and FAQs.
