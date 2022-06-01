Changelog
=========

## 11.14.0

- add `method` and `action` properties to form element

## 11.13.0

- Add `readOnly` property support

## 11.12.0

- Accept options object as first argument when Tallahassee instance is created

## 11.11.0

- Add `URL` and `URLSearchParams` to `Window`

## 11.10.0

- Add querySelector and querySelectorAll functions to Element
- Add basic `.reportValidity()` on form and inputs

## 11.9.0

- Expose [load](/docs/API.md#loadmarkup) function that returns browser context without navigation
- Add MutationObserver as property to window
- Add querySelector and querySelectorAll functions to document
- Add examples

## 11.8.0

- Add HTMLButtonElement and HTMLInputElement
- Remove properties disabled and value from Element class

## 11.7.1

- `input[type=checkbox]` now correctly fires `change` event when clicked, even outside of a form

## 11.7.0

- Basic support for `Element.attributes`
- Basic support for `FormData`

## 11.6.2

- Updated internal urls in package description

## 11.6.1

- Fix form fields with same name posts as array

## 11.6.0

- Add support for details element and open attribute

## 11.5.0

- Make form elements a live list and pick proper form elements

## 11.4.0

- Document inherits from Node
- Make sure form.submit() doesn't emit submit event

## 11.3.1

- Fix form cannot convert a Symbol value to a string bug

## 11.3.0

- Fix heritage confusion between EventTarget and Node. It is Node that inherits from EventTarget and not the other way around
- Add basic support for XMLHttpRequest that also inherits from EventTarget, and not the other way around
- EventTarget will now execute on-event-name functions if set #2

## 11.2.1

- Response with set cookies without explicit domain are now accessible on declared host
- Response with set cookies without explicit path are now accessible on request path directory

## 11.2.0

- `Element.className` is always a string
- Better support for HTMLSelectElement
- Expose options and selectedOptions on select element as live lists
- Refactor NodeList and its descendents, e.g. HTMLCollection and RadioNodeList

## 11.1.0

- Accept port number, origin string, or express app as first argument when creating new instance of Tallahassee
- Remove supertest dependency

## 11.0.6

- Normalize cookie output

## 11.0.5

- `Element.children` returns an `HTMLCollection`

## 11.0.4

- save cookie by string instead of by instance to handle different cookiejar versions

## 11.0.3

- stop returning URI encoded mailto- and tel href

## 11.0.2

- document fragment and its children now have document as owner document
- quickfix src and href attribute behaviour for links

## 11.0.1

- quickfix usual bug after major refactoring, this time it was empty src or href attribute behaviour

## 11.0.0

Refactor using classes named as the ones used in a browser

### Breaking
- no more `document.window` pointing to window, as a courtesy it is still available under `document._window`

## 10.7.0
- Support for functions `back`, `forward`, `go` and `pushState` on the `window.history` object

## 10.6.0
- Support for methods DELETE and PUT on fetch

## 10.5.5
- Only consider the following types as javascript `undefined`, `"text/javascript"` and legacy `"application/javascript"`

## 10.5.4
- Use `process.nextTick` instead of `setTimeout` for deferring calls to intersection observer callback
- Never run observer callback on unobserved elements

## 10.5.3
- Lock cheerio version to 1.0.0-rc.3 until breaking changes can be maintained

## 10.5.2
- Batched, async call to intersection observer callback on observe

## 10.5.1
- Fix version mismatch in documentation

## 10.5.0
- `MediaQueryList` with support for event listeners

## 10.4.0
- Support for `min-width` and `max-width` in `matchMedia`
- Support for combining a media type and media condition in `matchMedia`

## 10.3.3
- Support `element.focus()` unless element is disabled

## 10.3.2
- Implement `IntersectionObserverEntry.isIntersecting` function

## 10.3.1
- Allow secure cookies to be read from `document.cookie` when on a secure location

## 10.3.0
- Make sure checkbox always emits change events
- Handles null properly as a reset value on style property

## 10.2.3
- Only call MutationObserver callback when observed change is detected - honour observe options

## 10.2
Refactor

## 10.1.0
- Introduce [RadioNodeList](https://developer.mozilla.org/en-US/docs/Web/API/RadioNodeList)
- Expose fields of form as named properties
- Named radio buttons is exposed on form as RadioNodeList, with value

## 10.0.0
- Introduce [HTML Collection](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection)

### Breaking
- Returns [HTML Collection](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection) from `getElementsBy*`

## 9.4.0
- Support `document.getElementsByName`. NB! with the behaviour of IE10 and lower, i.e. elements with id that match passed name are also returned (sic)
- Close #72 bug

## 9.0.0

### Breaking
- Nodejs v10.15 or above is required
- The Compiler is gone, please transpile your own es6 scripts and reset global scope, or just try out the new Tallahassee sidekick [Wichita](https://www.npmjs.com/package/@bonniernews/wichita)
- As a side effect of the removed Compiler, there are no more `global.window` or `global.document`

## 8.0.0

### Breaking
- Changed implemention of window property `location` to match browser behaviour. Removed property `path` and added property `origin`.

## 7.0.0

- Proper bubbling of Element events up to Document

### Breaking
- Changed implemention of element property `checked`. Apperently `change` is not emitted by browsers (Chrome) when property `checked` is altered. If `change` is required please `click()` your checkbox or radio element like a real user.

## 6.0.0

### Breaking
- Upgrade to `@babel/core` from `babel-core`

## 5.1.0

- Supports fetch HEAD request

## 5.0.0

- Supports cookies set from server, i.e. set-cookie headers
- Proper, proper cookie handling

### Breaking
- Document now requires cookie jar as second argument if for some reason called outside browser context
- Fetch now takes a supertest agent as argument if it for some reason called outside browser context

## 4.8.0
- Mutation observer listens for attribute change
- Add function `canPlayType` to video element, always returns "maybe"

## 4.0.0

### Breaking
- Storage now stores everything as string in accordance to standard.

## 3.0.0

### Features
- Adds support for the event listener once option
- Callback gets invoked with element as this

### Breaking
- Drops the element._listenEvents property
