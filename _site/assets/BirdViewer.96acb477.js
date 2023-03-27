function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
let is_hydrating = false;
function start_hydrating() {
  is_hydrating = true;
}
function end_hydrating() {
  is_hydrating = false;
}
function upper_bound(low, high, key, value) {
  while (low < high) {
    const mid = low + (high - low >> 1);
    if (key(mid) <= value) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}
function init_hydrate(target) {
  if (target.hydrate_init)
    return;
  target.hydrate_init = true;
  let children2 = target.childNodes;
  if (target.nodeName === "HEAD") {
    const myChildren = [];
    for (let i = 0; i < children2.length; i++) {
      const node = children2[i];
      if (node.claim_order !== void 0) {
        myChildren.push(node);
      }
    }
    children2 = myChildren;
  }
  const m = new Int32Array(children2.length + 1);
  const p = new Int32Array(children2.length);
  m[0] = -1;
  let longest = 0;
  for (let i = 0; i < children2.length; i++) {
    const current = children2[i].claim_order;
    const seqLen = (longest > 0 && children2[m[longest]].claim_order <= current ? longest + 1 : upper_bound(1, longest, (idx) => children2[m[idx]].claim_order, current)) - 1;
    p[i] = m[seqLen] + 1;
    const newLen = seqLen + 1;
    m[newLen] = i;
    longest = Math.max(newLen, longest);
  }
  const lis = [];
  const toMove = [];
  let last = children2.length - 1;
  for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
    lis.push(children2[cur - 1]);
    for (; last >= cur; last--) {
      toMove.push(children2[last]);
    }
    last--;
  }
  for (; last >= 0; last--) {
    toMove.push(children2[last]);
  }
  lis.reverse();
  toMove.sort((a, b) => a.claim_order - b.claim_order);
  for (let i = 0, j = 0; i < toMove.length; i++) {
    while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
      j++;
    }
    const anchor = j < lis.length ? lis[j] : null;
    target.insertBefore(toMove[i], anchor);
  }
}
function append_hydration(target, node) {
  if (is_hydrating) {
    init_hydrate(target);
    if (target.actual_end_child === void 0 || target.actual_end_child !== null && target.actual_end_child.parentNode !== target) {
      target.actual_end_child = target.firstChild;
    }
    while (target.actual_end_child !== null && target.actual_end_child.claim_order === void 0) {
      target.actual_end_child = target.actual_end_child.nextSibling;
    }
    if (node !== target.actual_end_child) {
      if (node.claim_order !== void 0 || node.parentNode !== target) {
        target.insertBefore(node, target.actual_end_child);
      }
    } else {
      target.actual_end_child = node.nextSibling;
    }
  } else if (node.parentNode !== target || node.nextSibling !== null) {
    target.appendChild(node);
  }
}
function insert_hydration(target, node, anchor) {
  if (is_hydrating && !anchor) {
    append_hydration(target, node);
  } else if (node.parentNode !== target || node.nextSibling != anchor) {
    target.insertBefore(node, anchor || null);
  }
}
function detach(node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
function element(name) {
  return document.createElement(name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function init_claim_info(nodes) {
  if (nodes.claim_info === void 0) {
    nodes.claim_info = { last_index: 0, total_claimed: 0 };
  }
}
function claim_node(nodes, predicate, processNode, createNode, dontUpdateLastIndex = false) {
  init_claim_info(nodes);
  const resultNode = (() => {
    for (let i = nodes.claim_info.last_index; i < nodes.length; i++) {
      const node = nodes[i];
      if (predicate(node)) {
        const replacement = processNode(node);
        if (replacement === void 0) {
          nodes.splice(i, 1);
        } else {
          nodes[i] = replacement;
        }
        if (!dontUpdateLastIndex) {
          nodes.claim_info.last_index = i;
        }
        return node;
      }
    }
    for (let i = nodes.claim_info.last_index - 1; i >= 0; i--) {
      const node = nodes[i];
      if (predicate(node)) {
        const replacement = processNode(node);
        if (replacement === void 0) {
          nodes.splice(i, 1);
        } else {
          nodes[i] = replacement;
        }
        if (!dontUpdateLastIndex) {
          nodes.claim_info.last_index = i;
        } else if (replacement === void 0) {
          nodes.claim_info.last_index--;
        }
        return node;
      }
    }
    return createNode();
  })();
  resultNode.claim_order = nodes.claim_info.total_claimed;
  nodes.claim_info.total_claimed += 1;
  return resultNode;
}
function claim_element_base(nodes, name, attributes, create_element) {
  return claim_node(nodes, (node) => node.nodeName === name, (node) => {
    const remove = [];
    for (let j = 0; j < node.attributes.length; j++) {
      const attribute = node.attributes[j];
      if (!attributes[attribute.name]) {
        remove.push(attribute.name);
      }
    }
    remove.forEach((v) => node.removeAttribute(v));
    return void 0;
  }, () => create_element(name));
}
function claim_element(nodes, name, attributes) {
  return claim_element_base(nodes, name, attributes, element);
}
function claim_text(nodes, data) {
  return claim_node(
    nodes,
    (node) => node.nodeType === 3,
    (node) => {
      const dataStr = "" + data;
      if (node.data.startsWith(dataStr)) {
        if (node.data.length !== dataStr.length) {
          return node.splitText(dataStr.length);
        }
      } else {
        node.data = dataStr;
      }
    },
    () => text(data),
    true
  );
}
function claim_space(nodes) {
  return claim_text(nodes, " ");
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.wholeText !== data)
    text2.data = data;
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  if (flushidx !== 0) {
    return;
  }
  const saved_component = current_component;
  do {
    try {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
    } catch (e) {
      dirty_components.length = 0;
      flushidx = 0;
      throw e;
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
function flush_render_callbacks(fns) {
  const filtered = [];
  const targets = [];
  render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
  targets.forEach((c) => c());
  render_callbacks = filtered;
}
const outroing = /* @__PURE__ */ new Set();
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function mount_component(component, target, anchor, customElement) {
  const { fragment, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
      if (component.$$.on_destroy) {
        component.$$.on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    flush_render_callbacks($$.after_update);
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: [],
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      start_hydrating();
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    end_hydrating();
    flush();
  }
  set_current_component(parent_component);
}
class SvelteComponent {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    if (!is_function(callback)) {
      return noop;
    }
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
}
function create_fragment(ctx) {
  let h1;
  let t0;
  let t1;
  let p0;
  let t2;
  let t3;
  let t4;
  let p1;
  let t5;
  let t6;
  let t7;
  let p2;
  let t8;
  let t9;
  let t10;
  let p3;
  let t11;
  let t12;
  let t13;
  let p4;
  let t14;
  let t15;
  let t16;
  let p5;
  let t17;
  let t18;
  let t19;
  let p6;
  let t20;
  let t21;
  let t22;
  let button;
  let t23;
  let mounted;
  let dispose;
  return {
    c() {
      h1 = element("h1");
      t0 = text("Bird");
      t1 = space();
      p0 = element("p");
      t2 = text("name:");
      t3 = text(ctx[0]);
      t4 = space();
      p1 = element("p");
      t5 = text("beak:");
      t6 = text(ctx[1]);
      t7 = space();
      p2 = element("p");
      t8 = text("wing:");
      t9 = text(ctx[2]);
      t10 = space();
      p3 = element("p");
      t11 = text("feet:");
      t12 = text(ctx[3]);
      t13 = space();
      p4 = element("p");
      t14 = text("eyes:");
      t15 = text(ctx[4]);
      t16 = space();
      p5 = element("p");
      t17 = text("tail:");
      t18 = text(ctx[5]);
      t19 = space();
      p6 = element("p");
      t20 = text("sightings:");
      t21 = text(ctx[6]);
      t22 = space();
      button = element("button");
      t23 = text("Click here to log a bird sighting");
    },
    l(nodes) {
      h1 = claim_element(nodes, "H1", {});
      var h1_nodes = children(h1);
      t0 = claim_text(h1_nodes, "Bird");
      h1_nodes.forEach(detach);
      t1 = claim_space(nodes);
      p0 = claim_element(nodes, "P", {});
      var p0_nodes = children(p0);
      t2 = claim_text(p0_nodes, "name:");
      t3 = claim_text(p0_nodes, ctx[0]);
      p0_nodes.forEach(detach);
      t4 = claim_space(nodes);
      p1 = claim_element(nodes, "P", {});
      var p1_nodes = children(p1);
      t5 = claim_text(p1_nodes, "beak:");
      t6 = claim_text(p1_nodes, ctx[1]);
      p1_nodes.forEach(detach);
      t7 = claim_space(nodes);
      p2 = claim_element(nodes, "P", {});
      var p2_nodes = children(p2);
      t8 = claim_text(p2_nodes, "wing:");
      t9 = claim_text(p2_nodes, ctx[2]);
      p2_nodes.forEach(detach);
      t10 = claim_space(nodes);
      p3 = claim_element(nodes, "P", {});
      var p3_nodes = children(p3);
      t11 = claim_text(p3_nodes, "feet:");
      t12 = claim_text(p3_nodes, ctx[3]);
      p3_nodes.forEach(detach);
      t13 = claim_space(nodes);
      p4 = claim_element(nodes, "P", {});
      var p4_nodes = children(p4);
      t14 = claim_text(p4_nodes, "eyes:");
      t15 = claim_text(p4_nodes, ctx[4]);
      p4_nodes.forEach(detach);
      t16 = claim_space(nodes);
      p5 = claim_element(nodes, "P", {});
      var p5_nodes = children(p5);
      t17 = claim_text(p5_nodes, "tail:");
      t18 = claim_text(p5_nodes, ctx[5]);
      p5_nodes.forEach(detach);
      t19 = claim_space(nodes);
      p6 = claim_element(nodes, "P", {});
      var p6_nodes = children(p6);
      t20 = claim_text(p6_nodes, "sightings:");
      t21 = claim_text(p6_nodes, ctx[6]);
      p6_nodes.forEach(detach);
      t22 = claim_space(nodes);
      button = claim_element(nodes, "BUTTON", {});
      var button_nodes = children(button);
      t23 = claim_text(button_nodes, "Click here to log a bird sighting");
      button_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, h1, anchor);
      append_hydration(h1, t0);
      insert_hydration(target, t1, anchor);
      insert_hydration(target, p0, anchor);
      append_hydration(p0, t2);
      append_hydration(p0, t3);
      insert_hydration(target, t4, anchor);
      insert_hydration(target, p1, anchor);
      append_hydration(p1, t5);
      append_hydration(p1, t6);
      insert_hydration(target, t7, anchor);
      insert_hydration(target, p2, anchor);
      append_hydration(p2, t8);
      append_hydration(p2, t9);
      insert_hydration(target, t10, anchor);
      insert_hydration(target, p3, anchor);
      append_hydration(p3, t11);
      append_hydration(p3, t12);
      insert_hydration(target, t13, anchor);
      insert_hydration(target, p4, anchor);
      append_hydration(p4, t14);
      append_hydration(p4, t15);
      insert_hydration(target, t16, anchor);
      insert_hydration(target, p5, anchor);
      append_hydration(p5, t17);
      append_hydration(p5, t18);
      insert_hydration(target, t19, anchor);
      insert_hydration(target, p6, anchor);
      append_hydration(p6, t20);
      append_hydration(p6, t21);
      insert_hydration(target, t22, anchor);
      insert_hydration(target, button, anchor);
      append_hydration(button, t23);
      if (!mounted) {
        dispose = listen(button, "click", ctx[7]);
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1)
        set_data(t3, ctx2[0]);
      if (dirty & 2)
        set_data(t6, ctx2[1]);
      if (dirty & 4)
        set_data(t9, ctx2[2]);
      if (dirty & 8)
        set_data(t12, ctx2[3]);
      if (dirty & 16)
        set_data(t15, ctx2[4]);
      if (dirty & 32)
        set_data(t18, ctx2[5]);
      if (dirty & 64)
        set_data(t21, ctx2[6]);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(h1);
      if (detaching)
        detach(t1);
      if (detaching)
        detach(p0);
      if (detaching)
        detach(t4);
      if (detaching)
        detach(p1);
      if (detaching)
        detach(t7);
      if (detaching)
        detach(p2);
      if (detaching)
        detach(t10);
      if (detaching)
        detach(p3);
      if (detaching)
        detach(t13);
      if (detaching)
        detach(p4);
      if (detaching)
        detach(t16);
      if (detaching)
        detach(p5);
      if (detaching)
        detach(t19);
      if (detaching)
        detach(p6);
      if (detaching)
        detach(t22);
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let { name = "" } = $$props;
  let { beak = "" } = $$props;
  let { wing = "" } = $$props;
  let { feet = "" } = $$props;
  let { eyes = "" } = $$props;
  let { tail = "" } = $$props;
  let count = 0;
  function incr() {
    $$invalidate(6, count = count + 1);
  }
  $$self.$$set = ($$props2) => {
    if ("name" in $$props2)
      $$invalidate(0, name = $$props2.name);
    if ("beak" in $$props2)
      $$invalidate(1, beak = $$props2.beak);
    if ("wing" in $$props2)
      $$invalidate(2, wing = $$props2.wing);
    if ("feet" in $$props2)
      $$invalidate(3, feet = $$props2.feet);
    if ("eyes" in $$props2)
      $$invalidate(4, eyes = $$props2.eyes);
    if ("tail" in $$props2)
      $$invalidate(5, tail = $$props2.tail);
  };
  return [name, beak, wing, feet, eyes, tail, count, incr];
}
class BirdViewer extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {
      name: 0,
      beak: 1,
      wing: 2,
      feet: 3,
      eyes: 4,
      tail: 5
    });
  }
}
export {
  BirdViewer as default
};
