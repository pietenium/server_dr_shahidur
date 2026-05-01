import type { IFilterXSSOptions } from "xss";
import xss from "xss";

const whiteList: IFilterXSSOptions = {
  whiteList: {
    p: ["class", "style"],
    br: [],
    strong: [],
    em: [],
    u: [],
    s: [],
    h1: ["class", "style"],
    h2: ["class", "style"],
    h3: ["class", "style"],
    h4: ["class", "style"],
    h5: ["class", "style"],
    h6: ["class", "style"],
    ul: ["class", "style"],
    ol: ["class", "style"],
    li: ["class", "style"],
    a: ["href", "target", "rel", "class"],
    img: ["src", "alt", "class", "style"],
    blockquote: ["class"],
    code: ["class"],
    pre: ["class"],
    table: ["class"],
    thead: ["class"],
    tbody: ["class"],
    tr: ["class"],
    td: ["class", "colspan", "rowspan"],
    th: ["class", "colspan", "rowspan"],
    span: ["class", "style"],
    div: ["class", "style"],
    video: ["src", "controls", "class"],
    source: ["src", "type"],
    iframe: ["src", "frameborder", "allowfullscreen", "class"],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style"],
};

export const sanitizeContent = (html: string): string => {
  return xss(html, whiteList);
};
