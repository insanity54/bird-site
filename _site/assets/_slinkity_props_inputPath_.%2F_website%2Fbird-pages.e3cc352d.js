(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  if (!deps || deps.length === 0) {
    return baseModule();
  }
  const links = document.getElementsByTagName("link");
  return Promise.all(deps.map((dep) => {
    dep = assetsURL(dep);
    if (dep in seen)
      return;
    seen[dep] = true;
    const isCss = dep.endsWith(".css");
    const cssSelector = isCss ? '[rel="stylesheet"]' : "";
    const isBaseRelative = !!importerUrl;
    if (isBaseRelative) {
      for (let i = links.length - 1; i >= 0; i--) {
        const link2 = links[i];
        if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {
          return;
        }
      }
    } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
      return;
    }
    const link = document.createElement("link");
    link.rel = isCss ? "stylesheet" : scriptRel;
    if (!isCss) {
      link.as = "script";
      link.crossOrigin = "";
    }
    link.href = dep;
    document.head.appendChild(link);
    if (isCss) {
      return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
      });
    }
  })).then(() => baseModule());
};
function load() {
  return new Promise((resolve) => resolve());
}
const propsById = {
  "rtOpi6": { name: "name", value: "crow" },
  "tlSK_H": { name: "beak", value: "black" },
  "ssvd7s": { name: "wing", value: "black" },
  "AaYnZp": { name: "feet", value: "black" },
  "t5s5uD": { name: "eyes", value: "black" },
  "4LkEtH": { name: "tail", value: "black" },
  "YHWB_d": { name: "name", value: "raven" },
  "iyQPtj": { name: "beak", value: "black" },
  "QSTULu": { name: "wing", value: "black" },
  "07s09k": { name: "feet", value: "black" },
  "vkDaWC": { name: "eyes", value: "black" },
  "Ne8-0X": { name: "tail", value: "black" },
  "GXw095": { name: "name", value: "hawk" },
  "DCSRD7": { name: "beak", value: "brown" },
  "osgF4R": { name: "wing", value: "brown" },
  "KfbOU1": { name: "feet", value: "brown" },
  "UwYBn1": { name: "eyes", value: "brown" },
  "Id4phZ": { name: "tail", value: "brown" },
  "VH7f8A": { name: "name", value: "robin" },
  "DOUWAp": { name: "beak", value: "brown" },
  "21UWgY": { name: "wing", value: "red" },
  "TZq5cP": { name: "feet", value: "black" },
  "NS2zFY": { name: "eyes", value: "black" },
  "TmYuCG": { name: "tail", value: "brown" },
  "UuL5it": { name: "name", value: "seagull" },
  "JUvVD7": { name: "beak", value: "white" },
  "tPMEpL": { name: "wing", value: "white" },
  "e50wHt": { name: "feet", value: "white" },
  "kw5peZ": { name: "eyes", value: "blue" },
  "ha9pBf": { name: "tail", value: "white" }
};
export {
  __vitePreload as _,
  load as l,
  propsById as p
};
