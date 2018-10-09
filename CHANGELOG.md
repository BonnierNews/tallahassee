Changelog
---------

# 6.0.0

## Breaking
- Upgrade to `@babel/core` from `babel-core`

# 5.1.0

- Supports fetch HEAD request

# 5.0.0

- Supports cookies set from server, i.e. set-cookie headers
- Proper, proper cookie handling

## Breaking
- Document now requires cookie jar as second argument if for some reason called outside browser context
- Fetch now takes a supertest agent as argument if it for some reason called outside browser context

# 4.8.0
- Mutation observer listens for attribute change
- Add function `canPlayType` to video element, always returns "maybe"

# 4.0.0

## Breaking
- Storage now stores everything as string in accordance to standard.

# 3.0.0

## Features
- Adds support for the event listener once option
- Callback gets invoked with element as this

## Breaking
- Drops the element._listenEvents property
