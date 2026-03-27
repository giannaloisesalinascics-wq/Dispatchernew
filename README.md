# Dispatcher Auth

Frontend authentication UI built with Next.js 15, React 18, Tailwind CSS, and `react-icons`.

## Requirements

Before running the project on a new device, install:

- Node.js 20 or later
- npm
- Git

To verify the installation:

```bash
node -v
npm -v
git --version
```

## Project Setup On A New Device

1. Clone the repository:

```bash
git clone <your-repository-url>
```

2. Open the project folder:

```bash
cd dispatcher-login/dispatcher-auth
```

3. Install dependencies:

```bash
npm install
```

## Run The Project

Start the local development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available Commands

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Start the production server after building:

```bash
npm run start
```

Run lint:

```bash
npm run lint
```

## Project Structure

Important folders:

- `app/` - Next.js app router files
- `components/` - reusable UI components
- `public/` - images and static assets

## Notes For New Users

- This project currently focuses on frontend/auth UI flow.
- Static images used by the UI must stay inside `public/`.
- If the app does not start after pulling changes, run `npm install` again.

## Troubleshooting

If `node` or `npm` is not recognized:

- reinstall Node.js from the official installer
- restart the terminal after installation

If dependencies fail to install:

- delete `node_modules`
- delete `package-lock.json` only if needed
- run `npm install` again

If the port is already in use:

- stop the other process using port `3000`
- or run Next.js on another port:

```bash
npm run dev -- -p 3001
```
# Dispatchernew
