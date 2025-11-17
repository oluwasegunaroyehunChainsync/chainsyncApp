# ChainSync Frontend - Complete Installation Guide

## 🎯 What's Fixed

This configuration uses **Tailwind CSS v3.4** (the most stable version) with proper setup that ensures:

✅ All Tailwind classes render correctly  
✅ No conflicting packages  
✅ Proper PostCSS configuration  
✅ Compatible React 18 and Vite 5  
✅ Full TypeScript support  
✅ Custom utility classes and components  

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher (recommended) or npm/yarn

Check your versions:
```bash
node --version
pnpm --version
```

If you don't have pnpm installed:
```bash
npm install -g pnpm
```

---

## 🚀 Fresh Installation (Recommended)

### Step 1: Backup Your Current Project

```bash
# Navigate to your project directory
cd path/to/your/chainsync-frontend

# Create a backup
cd ..
cp -r chainsync-frontend chainsync-frontend-backup
```

### Step 2: Clean Install

```bash
# Go to your project directory
cd chainsync-frontend

# Remove old dependencies and lock files
rm -rf node_modules
rm -f package-lock.json
rm -f pnpm-lock.yaml
rm -f yarn.lock

# Remove build cache
rm -rf .vite
rm -rf dist
```

### Step 3: Replace Configuration Files

Copy all the files from this configuration package to your project root:

**Required files to replace:**
- `package.json`
- `tailwind.config.js`
- `postcss.config.js`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.node.json` (new file)
- `index.html`
- `.eslintrc.cjs` (new file)
- `.gitignore`

**Required files to create in src/ folder:**
- `src/index.css` (replace if exists)
- `src/main.tsx` (replace if exists)
- `src/App.tsx` (test file - you can replace with your own later)

### Step 4: Install Dependencies

```bash
# Install all dependencies fresh
pnpm install
```

This will install:
- React 18.2.0
- Tailwind CSS 3.4.0
- Vite 5.0.8
- TypeScript 5.3.3
- All other compatible dependencies

### Step 5: Start Development Server

```bash
pnpm dev
```

Your app should now be running at `http://localhost:3000`

---

## 🧪 Verify Installation

### Check 1: Terminal Output
You should see:
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### Check 2: Browser
Open `http://localhost:3000` and verify:
- ✅ Page loads without errors
- ✅ Tailwind styles are applied (gradients, shadows, colors)
- ✅ Buttons have proper styling and hover effects
- ✅ Cards display with rounded corners and shadows
- ✅ Responsive grid layout works

### Check 3: Browser Console
Press F12 and check:
- ✅ No errors in Console tab
- ✅ No 404 errors in Network tab

---

## 📁 Project Structure

```
chainsync-frontend/
├── src/
│   ├── index.css          # Tailwind directives + custom styles
│   ├── main.tsx           # Entry point
│   ├── App.tsx            # Main app component
│   └── ... (your other components)
├── index.html             # HTML template
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # TypeScript config for Vite
└── .eslintrc.cjs          # ESLint configuration
```

---

## 🎨 Using Tailwind in Your Components

### Basic Usage

```tsx
// Simple component with Tailwind classes
function MyComponent() {
  return (
    <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">Hello ChainSync!</h1>
    </div>
  );
}
```

### Using Custom Classes

The configuration includes custom utility classes defined in `src/index.css`:

```tsx
// Using custom button classes
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>

// Using custom card class
<div className="card">
  <h2>Card Title</h2>
  <p>Card content</p>
</div>

// Using custom input class
<input type="text" className="input-field" placeholder="Enter text" />
```

### Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## 🛠️ Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run TypeScript type checking
pnpm type-check

# Run ESLint
pnpm lint
```

---

## 🔧 Troubleshooting

### Issue: Styles Not Applying

**Solution 1: Hard Refresh Browser**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Solution 2: Clear Vite Cache**
```bash
rm -rf .vite
rm -rf node_modules/.vite
pnpm dev
```

**Solution 3: Verify Files**
Check that `src/index.css` contains:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Check that `src/main.tsx` imports the CSS:
```tsx
import './index.css';
```

### Issue: Module Not Found Errors

**Solution: Reinstall Dependencies**
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Issue: TypeScript Errors

**Solution: Check tsconfig.json**
Ensure both `tsconfig.json` and `tsconfig.node.json` are present in your project root.

### Issue: Port 3000 Already in Use

**Solution: Use Different Port**
```bash
pnpm dev --port 3001
```

Or update `vite.config.ts`:
```ts
server: {
  port: 3001,
}
```

---

## 🔄 Migrating Your Existing Code

If you have existing components:

1. **Keep your src/ folder structure** - Just replace:
   - `src/index.css`
   - `src/main.tsx`

2. **Update imports** - Ensure all your component files import React:
   ```tsx
   import React from 'react';
   ```

3. **Check Tailwind classes** - All standard Tailwind v3 classes will work:
   - `bg-blue-500`, `text-white`, `p-4`, `rounded-lg`, etc.

4. **Custom colors** - Use the primary color palette defined in config:
   - `bg-primary-500`, `text-primary-700`, etc.

---

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.2.0 | UI framework |
| react-dom | 18.2.0 | React DOM rendering |
| tailwindcss | 3.4.0 | Utility-first CSS framework |
| vite | 5.0.8 | Build tool and dev server |
| typescript | 5.3.3 | Type safety |
| autoprefixer | 10.4.16 | CSS vendor prefixing |
| postcss | 8.4.32 | CSS processing |

---

## ✅ Success Checklist

- [ ] Node.js v18+ installed
- [ ] pnpm installed
- [ ] Old node_modules deleted
- [ ] Old lock files deleted
- [ ] Configuration files replaced
- [ ] `src/index.css` created with Tailwind directives
- [ ] `src/main.tsx` imports `index.css`
- [ ] `pnpm install` completed without errors
- [ ] `pnpm dev` starts successfully
- [ ] Browser shows styled content at localhost:3000
- [ ] No console errors
- [ ] Tailwind classes render correctly

---

## 🎉 You're All Set!

Your ChainSync frontend is now configured with a stable, production-ready Tailwind CSS setup. All your styles should render correctly, and you can start building your application with confidence.

If you encounter any issues not covered in this guide, check:
1. Node.js and pnpm versions
2. All configuration files are in place
3. `src/index.css` has Tailwind directives
4. Browser cache is cleared

Happy coding! 🚀
