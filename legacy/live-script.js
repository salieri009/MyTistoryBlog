(function(){
"use strict";
window.addEventListener("load", () => {
  const helloWorldDiv = document.querySelector("#hello-world");
  if (helloWorldDiv === null) return;
  helloWorldDiv.style.border = "2px solid #00f";
});
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var toggleSelection = function() {
  var selection = document.getSelection();
  if (!selection.rangeCount) {
    return function() {
    };
  }
  var active = document.activeElement;
  var ranges = [];
  for (var i = 0; i < selection.rangeCount; i++) {
    ranges.push(selection.getRangeAt(i));
  }
  switch (active.tagName.toUpperCase()) {
    case "INPUT":
    case "TEXTAREA":
      active.blur();
      break;
    default:
      active = null;
      break;
  }
  selection.removeAllRanges();
  return function() {
    selection.type === "Caret" && selection.removeAllRanges();
    if (!selection.rangeCount) {
      ranges.forEach(function(range) {
        selection.addRange(range);
      });
    }
    active && active.focus();
  };
};
var deselectCurrent = toggleSelection;
var clipboardToIE11Formatting = {
  "text/plain": "Text",
  "text/html": "Url",
  "default": "Text"
};
var defaultMessage = "Copy to clipboard: #{key}, Enter";
function format(message) {
  var copyKey = (/mac os x/i.test(navigator.userAgent) ? "⌘" : "Ctrl") + "+C";
  return message.replace(/#{\s*key\s*}/g, copyKey);
}
function copy(text, options) {
  var debug, message, reselectPrevious, range, selection, mark, success = false;
  if (!options) {
    options = {};
  }
  debug = options.debug || false;
  try {
    reselectPrevious = deselectCurrent();
    range = document.createRange();
    selection = document.getSelection();
    mark = document.createElement("span");
    mark.textContent = text;
    mark.ariaHidden = "true";
    mark.style.all = "unset";
    mark.style.position = "fixed";
    mark.style.top = 0;
    mark.style.clip = "rect(0, 0, 0, 0)";
    mark.style.whiteSpace = "pre";
    mark.style.webkitUserSelect = "text";
    mark.style.MozUserSelect = "text";
    mark.style.msUserSelect = "text";
    mark.style.userSelect = "text";
    mark.addEventListener("copy", function(e) {
      e.stopPropagation();
      if (options.format) {
        e.preventDefault();
        if (typeof e.clipboardData === "undefined") {
          debug && console.warn("unable to use e.clipboardData");
          debug && console.warn("trying IE specific stuff");
          window.clipboardData.clearData();
          var format2 = clipboardToIE11Formatting[options.format] || clipboardToIE11Formatting["default"];
          window.clipboardData.setData(format2, text);
        } else {
          e.clipboardData.clearData();
          e.clipboardData.setData(options.format, text);
        }
      }
      if (options.onCopy) {
        e.preventDefault();
        options.onCopy(e.clipboardData);
      }
    });
    document.body.appendChild(mark);
    range.selectNodeContents(mark);
    selection.addRange(range);
    var successful = document.execCommand("copy");
    if (!successful) {
      throw new Error("copy command was unsuccessful");
    }
    success = true;
  } catch (err) {
    debug && console.error("unable to copy using execCommand: ", err);
    debug && console.warn("trying IE specific stuff");
    try {
      window.clipboardData.setData(options.format || "text", text);
      options.onCopy && options.onCopy(window.clipboardData);
      success = true;
    } catch (err2) {
      debug && console.error("unable to copy using clipboardData: ", err2);
      debug && console.error("falling back to prompt");
      message = format("message" in options ? options.message : defaultMessage);
      window.prompt(message, text);
    }
  } finally {
    if (selection) {
      if (typeof selection.removeRange == "function") {
        selection.removeRange(range);
      } else {
        selection.removeAllRanges();
      }
    }
    if (mark) {
      document.body.removeChild(mark);
    }
    reselectPrevious();
  }
  return success;
}
var copyToClipboard = copy;
const copy$1 = /* @__PURE__ */ getDefaultExportFromCjs(copyToClipboard);
let _mobileBreakpoint = 767;
let _windowWidth = window.innerWidth;
window.addEventListener("load", () => {
  _windowWidth = window.innerWidth;
  initialCodeBlock();
  resizePostFeatured();
  window.addEventListener("resize", () => {
    _windowWidth = window.innerWidth;
    resizePostFeatured();
  });
  if (_windowWidth > _mobileBreakpoint) {
    inittialPrevNextPostsScroll();
  }
});
function resizePostFeatured() {
  const img = document.querySelector(".post-featured-img.wide");
  if (!img) return;
  if (_windowWidth < _mobileBreakpoint) {
    img.style.width = "";
    img.style.right = "";
    return;
  }
  const rect = img.getBoundingClientRect();
  const imageLeft = rect.left;
  const imageWidth = rect.width;
  const newWidth = _windowWidth - imageLeft;
  const rightOffset = newWidth - imageWidth;
  img.style.width = `${newWidth}px`;
  img.style.right = `${-rightOffset}px`;
  img.classList.add("img-show");
}
function inittialPrevNextPostsScroll() {
  const observerTarget = document.getElementById("bottom-anchor");
  const container = document.getElementById("prev-next-container");
  const postPrevClose = document.getElementById("post-prev-close");
  const postPrev = document.getElementById("post-prev");
  const postNextClose = document.getElementById("post-next-close");
  const postNext = document.getElementById("post-next");
  if (!observerTarget || !container) return;
  if (window.innerWidth < 767) return;
  const observer2 = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        container.classList.remove("hidden");
        requestAnimationFrame(() => {
          container.classList.add("visible");
        });
      } else {
        container.classList.remove("visible");
        setTimeout(() => {
          container.classList.add("hidden");
        }, 400);
      }
    },
    {
      root: null,
      // viewport 기준
      threshold: 0.05
      // 요소의 10%만 보여도 감지
    }
  );
  observer2.observe(observerTarget);
  postPrevClose == null ? void 0 : postPrevClose.addEventListener("click", () => {
    postPrev == null ? void 0 : postPrev.classList.add("hidden");
  });
  postNextClose == null ? void 0 : postNextClose.addEventListener("click", () => {
    postNext == null ? void 0 : postNext.classList.add("hidden");
  });
}
function initialCodeBlock() {
  const codes = document.querySelectorAll(
    "#article-editor pre code"
  );
  codes.forEach((code) => {
    var _a;
    if (((_a = code.parentElement) == null ? void 0 : _a.nodeName.toLowerCase()) !== "pre") {
      return;
    }
    let checkedTimeout;
    const pre = code.parentElement;
    if (pre === null) {
      return;
    }
    pre.addEventListener("click", (event) => {
      if (isContain(code, event)) {
        pre.classList.add("my-checked");
        clearTimeout(checkedTimeout);
        checkedTimeout = setTimeout(() => {
          pre.classList.remove("my-checked");
        }, 1300);
        copy$1(code.textContent ?? "");
      }
    });
    pre.addEventListener("mousemove", (event) => {
      if (isContain(code, event)) {
        pre.classList.add("my-active");
      } else {
        pre.classList.remove("my-active");
      }
    });
  });
}
function isContain(code, event) {
  const padding = 16;
  const size = 24;
  const rect = code.getBoundingClientRect();
  const { width } = rect;
  const startX = width - (size + padding);
  const endX = width - padding;
  const startY = padding;
  const endY = startY + size;
  const isContainX = event.offsetX >= startX && event.offsetX <= endX;
  const isContainY = event.offsetY >= startY && event.offsetY <= endY;
  const isContain2 = isContainX && isContainY;
  return isContain2;
}
function j(t, e) {
  if (t === null)
    throw new Error(e);
  if (t === void 0)
    throw new Error(e);
  return t;
}
window.addEventListener("load", () => {
  initPostsIndex();
});
function postsIndexOpenButtonClick() {
  const postindex = document.getElementById("post-index");
  if (postindex) {
    postindex.classList.remove("translate-x-full");
    postindex.classList.add("translate-x-0");
  }
}
function postsIndexCloseButtonClick() {
  const postindex = document.getElementById("post-index");
  if (postindex) {
    postindex.classList.remove("translate-x-0");
    postindex.classList.add("translate-x-full");
  }
}
window.postsIndexOpenButtonClick = postsIndexOpenButtonClick;
window.postsIndexCloseButtonClick = postsIndexCloseButtonClick;
function initPostsIndex() {
  if (document.body.id !== "tt-body-page") {
    return;
  }
  const articleDiv = j(
    document.querySelector(`#article-editor .contents_style`),
    "#article-description .contents_style 요소가 없습니다."
  );
  const headTags = articleDiv.querySelectorAll("h2, h3, h4");
  if (headTags.length === 0) {
    const noItem = document.getElementById("no-posts-index");
    if (noItem) {
      noItem.classList.remove("hidden");
      noItem.classList.add("flex");
    }
    return;
  }
  const postsIndexList = j(
    document.querySelector(`[data-title="posts-index-list"]`),
    `[data-title="posts-index-list"] 요소가 없습니다.`
  );
  headTags.forEach((headTag, index) => {
    headTag.setAttribute("data-index", index.toString());
    if (typeof headTag.textContent !== "string") {
      return;
    }
    if (headTag.textContent.trim() === "") {
      return;
    }
    const liTemplateList = j(
      document.querySelector(
        '[data-title="posts-index-li-template-list"]'
      ),
      `[data-title="posts-index-li-template-list"] 요소가 없습니다.`
    );
    const liTemplate = liTemplateList.querySelector(
      `[data-title='${headTag.nodeName.toLowerCase()}-li']`
    );
    if (liTemplate === null) {
      console.warn(`${headTag.nodeName} 태그는 목차 기능에 포함되지 않습니다.`);
      return;
    }
    const li = liTemplate.cloneNode(true);
    if (!(li instanceof HTMLElement)) {
      console.warn(`li 가 HTMLElement 가 아닙니다.`);
      return;
    }
    li.setAttribute("data-index", index.toString());
    const onlyText = j(
      li.querySelector('[data-title="only-text"]'),
      `[data-title="only-text"] 요소가 없습니다.`
    );
    onlyText.textContent = headTag.textContent;
    onlyText.setAttribute("href", "#" + index.toString());
    onlyText.setAttribute("data-index", index.toString());
    onlyText.addEventListener("click", () => {
      headTag.scrollIntoView({ behavior: "smooth" });
    });
    postsIndexList.appendChild(li);
    headTags.forEach((tag) => observer.observe(tag));
  });
}
const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting);
    if (visible.length === 0) return;
    const current = visible[visible.length - 1];
    const currentIndex = current.target.getAttribute("data-index");
    const tocLinks = document.querySelectorAll("#posts-index-list li");
    tocLinks.forEach((item) => {
      item.getAttribute("data-index") === currentIndex ? item.classList.add("active") : item.classList.remove("active");
    });
  },
  {
    root: null,
    rootMargin: "0px 0px -40% 0px",
    threshold: 0.5
    // 절반만 보여도 감지
  }
);
let sidebarOpen = false;
let userTheme = localStorage.getItem("theme") || "system";
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
document.addEventListener("DOMContentLoaded", () => {
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];
  const headerBtnSubscription = document.getElementById("btn-subscription");
  if (headerBtnSubscription)
    headerBtnSubscription.setAttribute("data-blog-id", subdomain.toString());
  const menuToggleBtn = document.getElementById("menu-toggle-btn");
  const scrollTopBtn = document.getElementById("scroll-top-btn");
  const themeBtns = document.querySelectorAll(".btn-theme");
  applyTheme(userTheme);
  themeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const newTheme = btn.dataset.theme;
      userTheme = newTheme;
      applyTheme(userTheme);
    });
  });
  prefersDark.addEventListener("change", () => {
    if (userTheme === "system") applyTheme("system");
  });
  menuToggleBtn == null ? void 0 : menuToggleBtn.addEventListener("click", toggleSidebar);
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  sidebarOverlay == null ? void 0 : sidebarOverlay.addEventListener("click", closeSidebar);
  scrollTopBtn == null ? void 0 : scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  TistoryMenuToolbarAppend();
});
document.addEventListener("scroll", () => {
  const scrollProgress = document.getElementById("scroll-progress");
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = scrollTop / docHeight * 100;
  if (scrollProgress) {
    scrollProgress.style.width = `${scrollPercent}%`;
  }
});
function TistoryMenuToolbarAppend() {
  const toolbar = document.getElementById("menu-toolbar");
  const el = document.getElementById("menubar_wrapper");
  if (toolbar && el) {
    toolbar.appendChild(el);
  } else {
    console.warn("❌ menubar_wrapper 또는 toolbar를 찾을 수 없음");
  }
}
function applyTheme(theme) {
  const htmlEl = document.documentElement;
  const themeBtns = document.querySelectorAll(".btn-theme");
  let isDark = false;
  if (theme === "dark") isDark = true;
  else if (theme === "system") isDark = prefersDark.matches;
  htmlEl.classList.toggle("dark", isDark);
  localStorage.setItem("theme", theme);
  themeBtns.forEach((btn) => {
    const isSelected = btn.dataset.theme === theme;
    btn.dataset.selected = isSelected ? "true" : "false";
  });
}
function toggleSidebar() {
  const header = document.getElementById("header");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  sidebarOpen = !sidebarOpen;
  if (sidebar && sidebarOverlay && header) {
    if (sidebarOpen) {
      sidebar.classList.remove("-translate-x-full");
      sidebar.classList.add("translate-x-0");
      sidebarOverlay.classList.remove(
        "opacity-0",
        "pointer-events-none",
        "hidden"
      );
      sidebarOverlay.classList.add(
        "opacity-100",
        "pointer-events-auto",
        "block"
      );
      header.classList.add("header-hide");
    } else {
      closeSidebar();
    }
  }
}
function closeSidebar() {
  const header = document.getElementById("header");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  sidebarOpen = false;
  if (sidebar && sidebarOverlay && header) {
    sidebar.classList.remove("translate-x-0");
    sidebar.classList.add("-translate-x-full");
    sidebarOverlay.classList.remove("opacity-100", "pointer-events-auto");
    sidebarOverlay.classList.add("opacity-0", "pointer-events-none");
    header.classList.remove("header-hide");
    setTimeout(() => {
      sidebarOverlay.classList.remove("block");
      sidebarOverlay.classList.add("hidden");
    }, 300);
  }
}

})();