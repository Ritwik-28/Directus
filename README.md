
# Directus Client React App

This is a React application that fetches and displays content from a Directus API. The application allows users to filter content by program and company, and download images by clicking on them.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

## Installation

1. **Clone the repository**:

   ```sh
   git clone https://github.com/Ritwik-28/directus-client.git
   cd directus-client
   ```

2. **Install dependencies**:

   ```sh
   npm install
   ```

## Usage

1. **Start the development server**:

   ```sh
   npm start
   ```

2. **Open your browser and navigate to** `http://localhost:3000` **to view the app.**

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file in the root of your project directory. Make sure to prefix the environment variable for the Directus API endpoint with `REACT_APP_` so that it is accessible in the React app.

**.env**

```plaintext
REACT_APP_DIRECTUS_API_ENDPOINT=https://directus.crio.do
DIRECTUS_USERNAME=your_username
DIRECTUS_PASSWORD=your_password
```

These environment variables must also be set in your deployment platform (e.g., Vercel).

## Deployment

### Deploying to Vercel

1. **Sign in to Vercel** and import your GitHub repository.
2. **Set the environment variables** in the Vercel dashboard:

   - `REACT_APP_DIRECTUS_API_ENDPOINT`
   - `DIRECTUS_USERNAME`
   - `DIRECTUS_PASSWORD`

3. **Vercel will automatically deploy your project** after you import and configure it.

### Example of Environment Variables on Vercel

![Vercel Environment Variables](https://github.com/Ritwik-28/directus-client/blob/main/vercel-env-vars.png)

### Build and Deploy

To build and deploy the project, follow these steps:

1. **Build the project**:

   ```sh
   npm run build
   ```

2. **Push your changes to GitHub**:

   ```sh
   git add .
   git commit -m "Deploy"
   git push
   ```

3. **Monitor the deployment** on your Vercel dashboard.
