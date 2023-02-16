const useObserver = ("IntersectionObserver" in window);

export default function lazyLoad() {
  const lazyElements = document.getElementsByClassName("lazy-load");
  let elmsCount = lazyElements.length;

  const observer = setupObserver(displayElement);
  if (observer) {
    for (let i = 0; i < lazyElements.length; ++i) {
      observer.observe(lazyElements[i]);
    }
  }

  function displayElement(element) {
    if (element.tagName === "IMG") {
      element.classList.remove("lazy-load");
      element.src = element.dataset.imgSource;
    }
  }

  function setupObserver(display) {
    if (!useObserver) return;

    return new window.IntersectionObserver(viewPortUpdate, { rootMargin: "200px 0px" });

    function viewPortUpdate(entries) {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          observer.unobserve(entry.target);

          --elmsCount;
          display(entry.target);

          if (elmsCount <= 0) observer.disconnect();
        }
      });
    }
  }
}
