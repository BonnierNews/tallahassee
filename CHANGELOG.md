Changelog
---------

# Unreleased
- Only consider the following types as javascript `undefined`, `"text/javascript"` and legacy `"application/javascript"`

# 10.5.4
- Use `process.nextTick` instead of `setTimeout` for deferring calls to intersection observer callback
- Never run observer callback on unobserved elements

# 10.5.3
- Lock cheerio version to 1.0.0-rc.3 until breaking changes can be maintained

# 10.5.2
- Batched, async call to intersection observer callback on observe

# 10.5.1
- Fix version mismatch in documentation

# 10.5.0
- `MediaQueryList` with support for event listeners

# 10.4.0
- Support for `min-width` and `max-width` in `matchMedia`
- Support for combining a media type and media condition in `matchMedia`

# 10.3.3
- Support `element.focus()` unless element is disabled

# 10.3.2
- Implement `IntersectionObserverEntry.isIntersecting` function

# 10.3.1
- Allow secure cookies to be read from `document.cookie` when on a secure location

# 10.3.0
- Make sure checkbox always emits change events
- Handles null properly as a reset value on style property

# 10.2.3
- Only call MutationObserver callback when observed change is detected - honour observe options

# 10.2
Refactor

# 10.1.0
- Introduce [RadioNodeList](https://developer.mozilla.org/en-US/docs/Web/API/RadioNodeList)
- Expose fields of form as named properties
- Named radio buttons is exposed on form as RadioNodeList, with value

# 10.0.0
- Introduce [HTML Collection](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection)

## Breaking
- Returns [HTML Collection](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection) from `getElementsBy*`

# 9.4.0
- Support `document.getElementsByName`. NB! with the behaviour of IE10 and lower, i.e. elements with id that match passed name are also returned (sic)
- Close #72 bug

# 9.0.0

## Breaking
- Nodejs v10.15 or above is required
- The Compiler is gone, please transpile your own es6 scripts and reset global scope, or just try out the new Tallahassee sidekick [Wichita](https://www.npmjs.com/package/@bonniernews/wichita)
- As a side effect of the removed Compiler, there are no more `global.window` or `global.document`

# 8.0.0

## Breaking
- Changed implemention of window property `location` to match browser behaviour. Removed property `path` and added property `origin`.

# 7.0.0

- Proper bubbling of Element events up to Document

## Breaking
- Changed implemention of element property `checked`. Apperently `change` is not emitted by browsers (Chrome) when property `checked` is altered. If `change` is required please `click()` your checkbox or radio element like a real user.

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
