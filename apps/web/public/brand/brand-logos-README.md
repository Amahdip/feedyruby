# feedyruby Logo Assets

## Files

| File | Description |
|------|-------------|
| feedyruby-icon.svg | Gradient icon + facet lines (recommended) |
| feedyruby-icon-simple.svg | Gradient icon, no lines (for small sizes ≤32px) |
| feedyruby-icon-white.svg | White mono (for dark backgrounds) |
| feedyruby-icon-fuchsia.svg | Fuchsia mono |
| feedyruby-icon-violet.svg | Violet mono |
| feedyruby-wordmark-dark.svg | EN horizontal, dark text |
| feedyruby-wordmark-light.svg | EN horizontal, light text |
| feedyruby-stacked-dark.svg | EN stacked (icon above wordmark) |
| feedyruby-wordmark-fa-dark.svg | FA horizontal, RTL gradient |
| feedyruby-wordmark-fa-light.svg | FA horizontal, RTL gradient (light bg) |
| feedyruby-tokens.css | CSS custom properties |

## Font Setup

Add to your HTML head:

  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Vazirmatn:wght@300;400;500;600;700&display=swap" rel="stylesheet">

## Gradient Usage

  .cta { background: var(--fr-gradient); }

  .hero-text { 
    background: var(--fr-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
