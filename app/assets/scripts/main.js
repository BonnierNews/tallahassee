import { getCookie } from "./cookies.js";
import lazyLoad from "./lazy-load.js";

(function IIFE() {
  const cookieVal = getCookie("_ga");

  if (cookieVal) {
    const div = document.createElement("p");
    div.classList.add("set-by-js");
    div.textContent = "some text";
    document.body.appendChild(div);
  }

  lazyLoad();
})();
