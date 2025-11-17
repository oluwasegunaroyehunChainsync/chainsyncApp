# Tailwind CSS Quick Reference for ChainSync

## 🎨 Common Patterns

### Buttons

```tsx
// Primary Button
<button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md">
  Click Me
</button>

// Secondary Button
<button className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
  Cancel
</button>

// Outline Button
<button className="border-2 border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
  Learn More
</button>

// Disabled Button
<button className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-semibold cursor-not-allowed" disabled>
  Disabled
</button>
```

### Cards

```tsx
// Basic Card
<div className="bg-white rounded-xl shadow-md p-6">
  <h3 className="text-xl font-semibold mb-2">Card Title</h3>
  <p className="text-gray-600">Card content goes here</p>
</div>

// Card with Hover Effect
<div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer">
  <h3 className="text-xl font-semibold mb-2">Hoverable Card</h3>
  <p className="text-gray-600">Hover over me!</p>
</div>

// Card with Border
<div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary-500 transition-colors">
  <h3 className="text-xl font-semibold mb-2">Border Card</h3>
  <p className="text-gray-600">With border accent</p>
</div>
```

### Forms

```tsx
// Input Field
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Email Address
  </label>
  <input 
    type="email"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    placeholder="you@example.com"
  />
</div>

// Textarea
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Message
  </label>
  <textarea 
    rows={4}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
    placeholder="Enter your message..."
  />
</div>

// Select Dropdown
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Choose Option
  </label>
  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
    <option>Option 1</option>
    <option>Option 2</option>
    <option>Option 3</option>
  </select>
</div>

// Checkbox
<div className="flex items-center mb-4">
  <input 
    type="checkbox" 
    id="terms"
    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
  />
  <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
    I agree to the terms and conditions
  </label>
</div>

// Radio Buttons
<div className="space-y-2">
  <div className="flex items-center">
    <input 
      type="radio" 
      id="option1" 
      name="options"
      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
    />
    <label htmlFor="option1" className="ml-2 text-sm text-gray-700">
      Option 1
    </label>
  </div>
  <div className="flex items-center">
    <input 
      type="radio" 
      id="option2" 
      name="options"
      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
    />
    <label htmlFor="option2" className="ml-2 text-sm text-gray-700">
      Option 2
    </label>
  </div>
</div>
```

### Layouts

```tsx
// Container
<div className="container mx-auto px-4">
  {/* Content */}
</div>

// Centered Content
<div className="min-h-screen flex items-center justify-center">
  <div className="max-w-md w-full">
    {/* Centered content */}
  </div>
</div>

// Two Column Layout
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

// Three Column Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

// Sidebar Layout
<div className="flex">
  <aside className="w-64 bg-gray-100 min-h-screen p-4">
    {/* Sidebar */}
  </aside>
  <main className="flex-1 p-8">
    {/* Main content */}
  </main>
</div>
```

### Navigation

```tsx
// Navbar
<nav className="bg-white shadow-md">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center">
        <span className="text-xl font-bold text-gray-900">ChainSync</span>
      </div>
      <div className="flex space-x-4">
        <a href="#" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium">
          Home
        </a>
        <a href="#" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium">
          About
        </a>
        <a href="#" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium">
          Contact
        </a>
      </div>
    </div>
  </div>
</nav>

// Tabs
<div className="border-b border-gray-200">
  <nav className="flex space-x-8">
    <button className="border-b-2 border-primary-600 text-primary-600 py-4 px-1 font-medium">
      Tab 1
    </button>
    <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-4 px-1 font-medium">
      Tab 2
    </button>
    <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-4 px-1 font-medium">
      Tab 3
    </button>
  </nav>
</div>
```

### Alerts & Notifications

```tsx
// Success Alert
<div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
  <div className="flex">
    <div className="flex-shrink-0">
      <span className="text-green-500 text-xl">✓</span>
    </div>
    <div className="ml-3">
      <p className="text-sm text-green-700">
        Your changes have been saved successfully!
      </p>
    </div>
  </div>
</div>

// Error Alert
<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
  <div className="flex">
    <div className="flex-shrink-0">
      <span className="text-red-500 text-xl">✕</span>
    </div>
    <div className="ml-3">
      <p className="text-sm text-red-700">
        There was an error processing your request.
      </p>
    </div>
  </div>
</div>

// Warning Alert
<div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
  <div className="flex">
    <div className="flex-shrink-0">
      <span className="text-yellow-500 text-xl">⚠</span>
    </div>
    <div className="ml-3">
      <p className="text-sm text-yellow-700">
        Please review your information before submitting.
      </p>
    </div>
  </div>
</div>

// Info Alert
<div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
  <div className="flex">
    <div className="flex-shrink-0">
      <span className="text-blue-500 text-xl">ℹ</span>
    </div>
    <div className="ml-3">
      <p className="text-sm text-blue-700">
        New features are now available!
      </p>
    </div>
  </div>
</div>
```

### Badges & Tags

```tsx
// Basic Badge
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
  Badge
</span>

// Status Badges
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
  Active
</span>

<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
  Inactive
</span>

<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
  Pending
</span>

// Pill Badge
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
  12
</span>
```

### Loading States

```tsx
// Spinner
<div className="flex items-center justify-center">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
</div>

// Skeleton Loader
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
</div>

// Loading Button
<button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center" disabled>
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
  Loading...
</button>
```

### Modals & Overlays

```tsx
// Modal Backdrop
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Modal Title</h2>
    <p className="text-gray-600 mb-6">Modal content goes here.</p>
    <div className="flex justify-end space-x-4">
      <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
        Cancel
      </button>
      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Tables

```tsx
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Name
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Email
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          John Doe
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          john@example.com
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Active
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## 🎯 Responsive Breakpoints

```tsx
// Mobile First Approach
<div className="text-sm md:text-base lg:text-lg xl:text-xl">
  Responsive Text
</div>

// Breakpoints:
// sm: 640px   (small devices)
// md: 768px   (tablets)
// lg: 1024px  (laptops)
// xl: 1280px  (desktops)
// 2xl: 1536px (large screens)
```

## 🎨 Color Palette

Your custom primary colors are available:
- `primary-50` to `primary-900`

Standard Tailwind colors:
- `gray-`, `red-`, `yellow-`, `green-`, `blue-`, `indigo-`, `purple-`, `pink-`

## 💡 Pro Tips

1. **Use hover states**: Add `hover:` prefix for interactive elements
2. **Add transitions**: Use `transition-colors`, `transition-all` for smooth effects
3. **Focus states**: Always add `focus:` styles for accessibility
4. **Responsive design**: Start mobile-first, then add `md:`, `lg:` breakpoints
5. **Dark mode**: Add `dark:` prefix when implementing dark mode

## 🔗 Useful Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [Tailwind UI Components](https://tailwindui.com/components)
