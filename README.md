# kplctoken
## This middleware acts as an authentication gate: it checks each applicable request, allows public routes and static resources through, redirects unauthenticated users to the login page while remembering where they wanted to go, and lets authenticated users continue to the requested page. One thing worth fixing is the line pathname.match(/.*(.*)$/), which appears to be an incorrect regular expression. It should likely be something like pathname.match(/\..*$/) if the goal is to skip requests for static files

# Arrays
## Arrays are a special type of 'object' and a data structure in JS that stores multipla values.

## User requests /dashboard
 ##         │
  ##        ▼
## Middleware runs
     ##    │
    ##    ▼
## Check auth()
    ##       │
    ##  ┌────┴────┐
    ##  │         │
## Session     No Session
## exists         │
   ##  │         ▼
    ##  │    Create /login?callbackUrl=/dashboard
    ##  │         │
    ##  │         ▼
     ## │   Redirect to /login
    ##  │
   ##   ▼
## Continue to /dashboard

## next.config.js

## our configuration does three things:

## Next.js Configuration

The application is configured to run in **React Strict Mode**, which helps identify potential issues and encourages best practices during development. It also allows the Next.js `Image` component to securely load and optimize remote images from `https://images.unsplash.com`, improving performance and image delivery. Additionally, the Webpack configuration resolves imports without explicitly specifying file extensions by checking `.ts`, `.tsx`, `.js`, and `.jsx` files. Although this customization works, Next.js already includes these extensions in its default configuration, making the override generally unnecessary. In fact, replacing the default extension list may unintentionally exclude other supported extensions such as `.mjs` or `.json`. If additional extensions are ever required, it is recommended to append them to the existing configuration rather than replacing the default list.

# "use client";
## components in the Next.js App Router are Server Components.

## Adding "use client" tells Next.js:

## "Render this component in the browser because it uses client-side features."

# import Image from "next/image";
## Imports Next.js' optimized Image component.
## Benefits:

## Faster loading
## Automatic optimization
## Lazy loading
## Responsive images

# useRouter
## import { useRouter } from "next/navigation";
## This hook allows you to navigate between pages programmatically.Instead of the user clicking a link, your code can tell the browser where to go.
# Creating the router
## const router = useRouter();
## This creates a router object.Think of it as a navigation controller.It provides methods such as:
### router.push()
### router.replace()
### router.back()
### router.refresh()

## onClick
### onClick={() => router.push("/feedback/create")}

# Helper Functions

## Instead of repeating logic everywhere, small helper functions are created.

# Loading Spinner
## When data is still loading,instead of showing a blank page

# Statistics Cards
## At the top, the component calculates using array filtering.

# Filtering
## The page filters feedback by:

### Active tab
### Search text
### Status
### Area

## The filtered list is calculated with React.useMemo(), which avoids recalculating unless the relevant data changes, improving performance.

# Pagination
## If there are 12 feedback ↓ Page 1 1-4 ↓ Page 2 5-8 ↓ Page 3 9-12

# Desktop Table
## On larger screens the component renders a table.

## Columns include:
### Feedback ID
### Category
### Raised By
### Tribe Lead
### Status
### Date
### Action

# ApolloClient
## import { ApolloClient, createHttpLink } from "@apollo/client";
# JSON.stringify()
## Converts a JavaScript object or array into a JSON string (serialization).

### const obj = { name: "Alice", age: 25, skills: ["JS", "Python"] };
### const jsonString = JSON.stringify(obj);
### console.log(jsonString); 
### // Output: {"name":"Alice","age":25,"skills":["JS","Python"]}

### // Pretty-print with indentation
### console.log(JSON.stringify(obj, null, 2));