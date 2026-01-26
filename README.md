# SSR [Emotion](https://emotion.sh/docs/@emotion/css) React

A natural and powerful Zero-Runtime CSS-in-JS solution et ses React 🍅

## Installation

### 🚀 Astro

Create your new app.

``` bash
npm create astro@latest my-app
cd my-app
```

Add `ssr-emotion-react` as a dependency.

``` bash
npm install ssr-emotion-react

```

Add the integration in `astro.config.mjs`.

```js
import { defineConfig } from 'astro/config';
import ssrEmotion from 'ssr-emotion-react/astro';

export default defineConfig({
  integrations: [ssrEmotion()],
});
```

Now, you can use not only Astro components (`.astro`) but also React JSX components (`.jsx` or `.tsx`) with SSR Emotion.

> **Note:** React JSX components in Astro Islands
>
> * **No directive (Server Only)**: Rendered as just static HTML tags. It results in zero client-side JavaScript. (I used to think there wasn't much point in writing static content in JSX components instead of just using Astro components. It seemed like standard Astro components was more than enough. **However, I've realized one major advantage:** SSR Emotion — the ultimate SSR Zero-Runtime CSS-in-JS solution, seamlessly integrated with Astro. By using React JSX components, your styles are automatically extracted into static CSS during the build process. This means you can enjoy the full power of CSS-in-JS while still shipping zero bytes of JS to the browser. In this regard, it's a significant upgrade over standard Astro components.)
> * `client:only="react"` **(Client Only)**: This is the mode where the relationship between React and Astro is the clearest. It skips server-side rendering and runs entirely in the browser.
>
> * `client:load`(and others like `client:visible` or `client:idle`) **(SSR Hydration)**: Despite its cool and flashy name, "SSR Hydration" is not that complicated: it just creates a static HTML skeleton first, and once the JS is ready, the engine takes over the DOM as if it had been there from the start. If you are particular about the visual transition—like ensuring there is no layout shift by pre-setting an image's height—you might want to take control to make the swap feel completely natural.


## 📜 The Origin: Born from [Potate](https://github.com/uniho/potate)

This plugin wasn't originally built for React. It was first conceived as a core pillar of the [Potate](https://github.com/uniho/potate) engine—a custom JSX runtime designed for ultimate simplicity and performance.

While developing [Potate](https://github.com/uniho/potate), I discovered a way to handle SSR [Emotion](https://emotion.sh/docs/@emotion/css) and Hydration that felt more "correct" for the Astro era: **The Full DOM Replacement strategy.** It worked so flawlessly in Potate that I decided to bring this lineage back to the "ancestor," React. By applying Potate's philosophy to React, we've eliminated the historical complexities of Emotion SSR and the fragility of standard React hydration.


## 💎 The Result

* **Zero Runtime by default:** No `Emotion` library is shipped to the browser. It delivers a pure Zero-JS experience.
* **Familiar DX:** Use the full expressive power of the [Emotion `css()` function](https://emotion.sh/docs/@emotion/css) that you already know.
* **Decoupled Asset Delivery:** Styles are moved to separate `.css` files to allow for flexible cache strategies. By using unique filenames (cache busting), we ensure that updates are immediately reflected even when long-term caching is enabled on the server.
* **Hydration Stability:** No overhead for style re-calculation. Interactive Islands remain stable and fully dynamic without visual flickering during the hydration process.


## 🛠 How it looks

In SSR Emotion, you don't need to learn any special properties or complex setups. It just works with the [Emotion `css()` function](https://emotion.sh/docs/@emotion/css). It feels completely natural, even in Astro's **"No directive" (Server Only)** mode.

While you can use [`css()`](https://emotion.sh/docs/@emotion/css) directly, you can also create reusable functions like `flexCol()` (which we call **"The Patterns"**).

```jsx
import { css } from '@emotion/css'

export const MyComponent = () => (
  <div class={flexCol({ 
    color: 'hotpink',
    '&:hover': { color: 'deeppink' }
  })}>
    Hello, SSR EMOTION!
  </div>
)

const flexCol = (...args) => css({
  display: 'flex',
  flexDirection: 'column',
}, ...args)

```


## 🌗 Hybrid Styling (SSR + CSR)

In Astro, Island components (`client:*`) get the best of both worlds.

### How it works

1. At Build Time (SSR): SSR Emotion executes your `css()` calls and extracts the initial styles into a static CSS file. This ensures your component looks perfect even before JavaScript loads.

2. At Runtime (Hydration): Once the Island hydrates in the browser, the Emotion runtime takes over.

### Why this is powerful

Because the Emotion runtime remains active inside Islands, you can use standard React patterns to handle dynamic styles without any special APIs.

### Example: Hydration-aware Styling

You can easily change styles when the component "wakes up" in the browser:

```jsx
// src/components/InteractiveBox.jsx

export const InteractiveBox = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true); // Triggers once JS is active
  }, []);

  return (
    <div class={css({
      // Red on server (SEO/LCP friendly), Blue once interactive!
      background: isLoaded ? 'blue' : 'red',
      transition: 'background 0.5s',
      padding: '20px'
    })}>
      {isLoaded ? 'I am Interactive!' : 'I am Static HTML'}
    </div>
  );
};

```

```astro
---
// src/pages/index.astro

import Layout from '../layouts/Layout.astro';
import StaticBox from '../components/StaticBox';
import InteractiveBox from '../components/InteractiveBox';
---

<Layout>
  <StaticBox />
  <InteractiveBox client:load />
</Layout>

```

### Key Benefits

* **No FOUC (Flash of Unstyled Content):** Since the "Server Side" style is already in the static CSS, there's no flickering.
* **Unlimited Flexibility:** Need to change colors based on user input or mouse position? Just pass the props/state to css() like you always do.
* **Zero Learning Curve:** If you know how to use useEffect and Emotion, you already know how to build dynamic Islands with React.


## 🛠 The Patterns 

We refer to reusable CSS logic as "The Patterns".

Honestly? They’re just standard JavaScript functions that return styles. No complex registration, no hidden magic. You just write a function, and that's it. Simple, right? 🤤

### LinkOverlay

You can easily implement the LinkOverlay pattern. This expands a link's clickable area to its nearest parent with `position: relative`.

```jsx
import { css } from '@emotion/css'

const linkOverlay = (...args) => css({
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
}, ...args)

export default props => (
  // The parent must have position: relative
  <div class={css({ position: 'relative', border: '1px solid #ccc', padding: '1rem' })}>
    <img src="https://via.placeholder.com/150" alt="placeholder" />
    <h3>Card Title</h3>
    <a href="/details" class={linkOverlay()}>
      View more
    </a>
  </div>
)

```

### Media Query

```jsx
import { css } from '@emotion/css';

const BP = {
  sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px',
}

const isBP = value => value in BP
const _gt = bp => `(min-width: ${isBP(bp) ? BP[bp] : bp})`
const _lt = bp => `(max-width: ${isBP(bp) ? BP[bp] : bp})`

const gt = (bp, ...args) => css({[`@media ${_gt(bp)}`]: css(...args)})
const lt = (bp, ...args) => css({[`@media ${_lt(bp)}`]: css(...args)})
const bw = (min, max, ...args) => css({[`@media ${_gt(min)} and ${_lt(max)}`]: css(...args)})

export default props => (
  <div class={css(
    { color: 'black' }, // default css
    bw('sm', '75rem', { color: 'blue' }), // between
    gt('75rem', { color: 'red' }), // greater than
  )}>
    Responsive Design!
  </div>
);

```


## 🛠 Advanced

### Styled Components (MUI-like)

If you prefer the Styled Components pattern (popularized by libraries like MUI or styled-components), `Emotion` makes it incredibly easy to implement.

Even with this minimal custom (but powerful) function, the result remains the same: Zero-Runtime CSS. All styles are pre-calculated during SSR and extracted into static CSS files.

```jsx
import {css, cx} from '@emotion/css'

export const styled = (Tag) => (style, ...values) => props => {
  const makeClassName = (style, ...values) =>
    typeof style == 'function' ? makeClassName(style(props)) : css(style, ...values);
 
  const {as: As, sx, className, 'class': _class, children, ...wosx} = props;

  // cleanup transient props
  Object.keys(wosx).forEach(key => {
    if (key.startsWith('$')) delete wosx[key];
  });

  const newProps = {
    ...wosx,
    className: cx(makeClassName(style, ...values), makeClassName(sx), _class, className),
  };

  const T = As || Tag;
  return (<T {...newProps}>{children}</T>);
};

```

What is the sx prop? For those unfamiliar with libraries like [MUI, the sx prop](https://mui.com/system/getting-started/the-sx-prop/) is a popular pattern that allows you to apply "one-off" styles directly to a component.

In this implementation, you can pass raw style objects to the sx prop without wrapping them in `css()` or "The Patterns" functions.

However, defining a `styled` component inside a render function is **a pitfall** because it creates a new component identity every time, forcing React to re-mount.
I personally prefer the approach shown below. In any case, how you choose to implement this is entirely up to you.

```js
// the-sx-prop.jsx

import {css, cx} from '@emotion/css'

export const sx = (props, style, ...values) => {
  let result = (props && typeof props === 'object' ? props : {});
  if (typeof style === 'function') {
    result = {...style(result), ...result};
    result.className = cx(css(result?.$css, ...values), result.className);
  } else {
    result.className = cx(css(style, ...values), result.className);
  }

  // cleanup transient props
  Object.keys(result).forEach(key => {
    if (key.startsWith('$')) delete result[key];
  });

  return result;
}

// Factory for component-scoped sx functions (adds `.css()` automatically)
sx._factory = (genCSS) => {
  const f = (props, ...styles) => sx(props || {}, genCSS, ...styles);
  f.css = (...styles) => f({}, ...styles); // style only
  f.curry = (props) => (...values) => f(props || {}, ...values); // currying
  return f;
}

// My button style
sx.button = sx._factory(props => {
  const style = {
    // default is text button
    padding: '8px 16px',
    border: 'none',
    borderRadius: '2px',
    color: 'var(--style-palette-primary)',
    backgroundColor: 'inherit',
    boxShadow: 'none',
  };

  if (props.$elevated) {
    style.borderRadius = '0';
    style.border = 'none';
    style.color = 'var(--style-palette-primary)';
    style.backgroundColor = 'var(--style-palette-surface-container-low)';
    style.boxShadow = 'var(--style-shadows-level1)';
  }

  return {$css: [
    css`
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      &:not(:disabled) {
        cursor: pointer;
      }
    `,
    style,
  ]};
});

```

```jsx
import {sx} from './the-sx-prop'

export default props => {
  return (<>
  <button {...sx.button({}, {margin: '1rem'})}>Buuton1</button>
  <button {...sx.button.css({margin: '1rem'})}>Buuton1</button>
  <button {...sx.button({$elevated: true}, {margin: '1rem'})}>Button2</button>
  <div {...sx.button({$elevated: true}, {margin: '1rem'})}>Button3</div>
  <button disabled {...sx.button.css({margin: '1rem'})}>Button4</button>
  <button {...sx.button({disabled: true}, {margin: '1rem'})}>Button5</button>
  </>);
}

```

Furthermore, by creating a component like the one below, you evolve into a **Super Saiyan** (for those who aren't familiar, it's like a classic Superman).

```js
// the-sx-prop.jsx

:
:

export const As = ({as: Tag = 'div', children, ...props}) => <Tag {...props}>{children}</Tag>;

// My list style
sx.ul = sx._factory(props => ({
  as: 'ul',
  $css: css`
  & > li {
    position: relative;
    padding-left: 1.5rem;

    &:before {
      content: "\\2022";
      position: absolute;
      width: 1.5rem;
      left: 0; top: 0;
      text-align: center;
    }
    & + li, & > ul {
      margin-top: .25rem;
    }
  }
  & > ul {
    margin-left: 1rem;
  }
`}));

```

```jsx
import {sx, As} from './the-sx-prop'

const MyComponent = props => {
  return (
  <As {...sx.ul.css({ padding: '20px', border: '1px solid #ccc' })}>
    <li>Is it Flexible?</li>
    <li>Is it Dynamic?</li>
    <li>Is it Polymorphic?</li>
    <li>No, it's <strong>As</strong>!</li>
  </As>
  )
}

```


## 🚫 Won't Do

The following features are not planned for the core roadmap (though contributors are welcome to explore them):

* React Server Components (RSC)
* Async SSR
