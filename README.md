# Lume Static Website

Welcome to the Lume Static Website project! This repository contains the source code for a static website built using [Lume](https://lumeland.github.io/), a static site generator for [Deno](https://deno.land/).

## Getting Started

### Prerequisites

Ensure you have Deno installed. You can install Deno by following the instructions on the [official website](https://deno.land/#installation).

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/XodiumSoftware/XodiumSoftware.github.io.git
   cd XodiumSoftware.github.io
   ```

2. Install Lume:
   ```sh
   deno install -A -f --unstable https://deno.land/x/lume/cli.ts
   ```

### Running the Development Server

To start the development server, run:

```sh
lume --serve
```

This will start a local server at `http://localhost:3000` where you can view your site.

### Building the Site

To build the static site, run:

```sh
lume
```

The output will be generated in the `_site` directory.

## Project Structure

- `/_data`: Contains data files used in the site.
- `/pages`: Contains the content pages of the site.
- `/layouts`: Contains layout templates.
- `/assets`: Contains static assets like images, CSS, and JavaScript files.

## Acknowledgements

- [Lume](https://lumeland.github.io/)
- [Deno](https://deno.land/)

Thank you for using Lume and Deno!
