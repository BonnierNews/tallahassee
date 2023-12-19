# Zombieland draft

Tallahassee is great! It's powerful enough to test your applications entire client side. It's "hackable" enough to emulate most scenarios / quirks occurring in an actual browser, making it suitable for both feature and unit style testing. It's lightweight enough to not be an excuse for skimping on testing.

[However it isn't perfect...](https://github.com/BonnierNews/tallahassee/blob/next-draft/BACKGROUND.md)

Proposed solution is to delegete all the DOM stuff to [jsdom](https://github.com/jsdom/jsdom). Other key features are built as **a toolkit of independent _single_ purpose extensions**.

## Tallahassee

A browser module for loading pages, containing subsequent requests, persisting cookies etc.

More or less a convenient wrapper around *[SuperTest](https://github.com/visionmedia/supertest), [Tough Cookie](https://github.com/salesforce/tough-cookie) and jsdom. The browser scope will also make it easy to test a session, or multiple parallell sessions, as opposed to a single page load.

SuperTest also enables passing along HTTP headers with a request which doesn't seem to be supported by the [jsdom `fromURL`](https://github.com/jsdom/jsdom#fromurl).

*See [TODO](#TODO) for notes on the use of SuperTest

> I really want the name Tallahassee to remain, although Columbus sounds more _browsery_.

## Little Rock

A layout module implementing everything visual.

JSDOM does not provide a way to emulate layout out of the box. When major part of an application's client side JS consists of lazy loading / sticky behaviour etc. this is required.

## Wichita

A resource module for running client side JS and resolving assets.

JSDOM does run scripts quite well. It does however not provide a controlled way to execute scripts at a _convenient time_. A pattern when testing something is asserting an element original state, running the scripts then asserting the element's new state. JSDOM will, like a browser, run any client script as soon as it has loaded making it _tricky_ to run assertions prior to script execution.

Custom script executor enables running code at any given time. Also it enables running source code over a built resource which is good for rapid retesting.

Resolver enables "binding" script tags to files making the test suite less verbose and less prone to mistakes.

This could be achieved by extending the `jsdom.ResourceLoader` interface with some execution code - a sort of rewrite of existing package [Wichita](https://github.com/BonnierNews/wichita).

## ?

Any other key features?

> Would be nice with at least 4 core modules so that all main characters are represented ;D


## Drawbacks

### JSDOM
JSDOM is kind of a black box compared to current Tallahassee browser environment. Read only properties are read only. Don't know if this is a big problem.

It is not as fully featured as it appears. Polyfills are required for some basic functions, such as `fetch`.

### "Independent _single_ purpose extensions"
The intention of making each tool independent sounds like a good idea but is it? Could make the API's overly complex! Does anyone want / need a setup like JSDOM, Tallahasse and Little Rock but not Whichita?

### Custom script executor
Useful but feels wrong. [The VM source text module is experimental](https://nodejs.org/api/vm.html#vm_class_vm_sourcetextmodule).


## TODO

The APIs could use some work.

### Tallahassee

Request function may be too primitive. Would be easy to use node fetch but won't work with ReverseProxy which uses nock.

### Little Rock

Convert to classes like JSDOM and the rest of the modules.

Means to emulate fixed / sticky / hidden layout.

Further implement web APIs such as `Element.scrollLeft` / `.scrollTop` setters, limitations on scroll coordinates.

Nice to have: automatic dimensions / coordinates. Maybe just paint method could take a list of elements with like `{ y: 'auto' }` and it could stack them along the supplied axis, optionally updating supplied parent. Would be nice if it could work with dynamically injected elements / stylesheets as well. 
Emulating margins would be a hassle.

### Whichita

Not using the ES module feature mustn't require the `--experimental-vm-modules` flag.

VM evaluation based on script `type` attribute.

Respecting `nomodule` like modern / legacy browser.

Cache for FS operations.

Remove dependency to `whatwg-fetch` while maintaining functionality of the `ReverseProxy` interface.
