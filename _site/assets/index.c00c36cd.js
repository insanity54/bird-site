import { l as load, _ as __vitePreload, p as propsById } from "./_slinkity_props_inputPath_.%2F_website%2Fbird-pages.e3cc352d.js";
const props = {};
for (let propId of ["UuL5it", "JUvVD7", "tPMEpL", "e50wHt", "kw5peZ", "ha9pBf"]) {
  const { name, value } = propsById[propId];
  props[name] = value;
}
const target = document.querySelector('slinkity-root[data-id="ByfPCF"]');
Promise.race([
  load()
]).then(async function() {
  const [{ default: Component }, { default: renderer }] = await Promise.all([
    __vitePreload(() => import("./BirdViewer.96acb477.js"), true ? [] : void 0),
    __vitePreload(() => import("./client.f5c57b1d.js"), true ? [] : void 0)
  ]);
  renderer({
    Component,
    target,
    props,
    slots: { "default": "" },
    isClientOnly: false
  });
});
