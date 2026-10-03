# Cal.com availability reference

Source: [app.cal.com/availability/2401887](https://app.cal.com/availability/2401887), inspected in an authenticated browser tab on September 25, 2026.

The automated `designlang` run reached the login screen, so its page-level findings were not used. These measurements come from the visible authenticated availability page at an approximately 1680 CSS pixel wide viewport. Sizes inferred from the screenshot are approximate; the row and control sizes also match the existing prototype geometry.

| Element | Reference size or spacing |
| --- | ---: |
| Sidebar | 288px wide |
| Sidebar profile photo | 24px circle |
| Sidebar navigation row | 32px high |
| Main frame | 8px top inset, 12px right inset, 16px corner radius |
| Main content left padding | 40px |
| Main content maximum width | about 1296px |
| Content columns | about 952px + 24px gap + 320px rail |
| Header | 56px high, then 20px to the content grid |
| Weekly hours heading | 72px high |
| Day row | 53px high, 24px horizontal padding |
| Day switch | 30 × 18px |
| Time field | 100 × 28px |
| Date overrides | 24px below weekly card, about 74px high |
| Timezone field | 32px high |
| Rail divider | 24px vertical spacing on either side |

The supplied 2× PNG reference gives these exact rendered pixel colors away from text and antialiased corners:

| Surface or line | Screenshot color |
| --- | --- |
| Page background | `#141414` |
| Weekly hours header fill | `#1f1f1f` |
| Day rows fill | `#181818` |
| Weekly card outline and day dividers | `#262626` |
| Rounded day-panel top stroke | `#2c2c2c` |

The `designlang` output contains the site-wide dark token `--cal-border-subtle: #262626`, which agrees with the screenshot dividers. Its page-level output describes the login screen, so it does not establish a WCAG score for the authenticated availability page.

Typography visible in the page uses Cal Sans UI for interface text. The brand wordmark is text in Cal Sans at 18px, as confirmed by the supplied reference image. The page uses dark neutral surfaces, light text, subtle borders, and approximately 16px card corners.

The prototype adds booking impact pins and a state picker. At narrower desktop widths, its right rail moves below the weekly card to keep those additions from colliding with the time controls.
