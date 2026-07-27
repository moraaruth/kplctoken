# kplctoken
## This middleware acts as an authentication gate: it checks each applicable request, allows public routes and static resources through, redirects unauthenticated users to the login page while remembering where they wanted to go, and lets authenticated users continue to the requested page. One thing worth fixing is the line pathname.match(/.*(.*)$/), which appears to be an incorrect regular expression. It should likely be something like pathname.match(/\..*$/) if the goal is to skip requests for static files

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