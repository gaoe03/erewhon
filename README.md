# Erewhon Smoothie Archive

A static catalog of Erewhon drinks and their listed ingredients. The opening view shows the full archive, with a Current menu tab for the latest checked Grove online tonic bar menu.

## Run and check

```sh
python3 -m http.server 8080
node scripts/build-data.mjs
node --test tests/*.test.mjs
node scripts/health.mjs
node scripts/ingredient-audit.mjs
```

Open `http://localhost:8080`. No frontend build or package install is required.

To run the refresh locally, provide `ALGOLIA_APP_ID` and `ALGOLIA_API_KEY` from the public search configuration. `ALGOLIA_INDEX` defaults to `GROVE_SEARCH_INDEX` and must match the saved menu scope. The recipe scraper also needs Playwright and Chromium. GitHub Actions installs them in its runner. Missing browser support preserves existing recipes and marks their checks as failed.

```sh
node scripts/run.mjs          # Fetch and plan without writing files
node scripts/run.mjs --apply  # Validate, then replace the local data artifacts
node scripts/build-data.mjs --check
```

## Data ownership

| Path | Purpose |
| --- | --- |
| `data/smoothies.json` | Source records, original menu ingredient wording, citations and previous recipe versions |
| `data/menu.json` | Latest complete checked menu, its source, scope, date and archive IDs |
| `data.js` | Generated browser data. Rebuild it after changing either JSON source |
| `ingredients.js` | Reviewed ingredient identities, matching rules and grouping |
| `data/ingredient-labels.js` | Explicitly reviewed source-label mappings, shared by the site and refresh |
| `icons.js` | Hand-drawn SVG icons |
| `app.js`, `index.html`, `styles.css` | Static site and navigation |
| `scripts/` | Refresh, data generation and validation |
| `tests/` | Offline regression tests and fixtures |
| `img/` | Local product photographs |
| `.github/workflows/` | Scheduled refresh and pull request validation |

`.refresh/` is temporary staging removed after each apply. `pr-body.md` is the generated review report consumed by the workflow, not site content.

## Ingredient policy

Keep each source ingredient string in the recipe. Display grouping never rewrites or deletes source wording.

An ingredient identity should be useful for browsing recipes, rather than creating a new profile for every processing word. Brand, organic labeling, fresh, frozen and freeze-dried wording do not usually create a new identity. Plain fruit or vegetable purée can share its base ingredient. Source wording always remains visible in the smoothie.

Keep a separate profile when the preparation materially changes what is added: juice, milk, water, cream, whip, powder, oil, butter, jam, glaze or another composed food. Apple and apple juice stay separate. Coconut water, milk, cream, meat, flakes and whip stay separate. Keeping separate coconut meat and flakes preserves two common recipe components, while both remain in Fruits & berries.

Flavors of the same prepared ingredient can share a row. Show every listed variant under that row. Do not infer a coconut or dairy base when the source only says whipped cream. Unknown ingredients stay visible with their original name until reviewed.

### Categories and grouping

Categories are browsing shelves, not a second ingredient identity. Use the existing broad culinary categories instead of adding a small section for each new preparation.

| Listed ingredient | Profile | Browse under |
| --- | --- | --- |
| Fresh, frozen or freeze-dried strawberry | Strawberry | Fruits & berries |
| Banana, organic banana, frozen banana | Banana | Fruits & berries |
| Pumpkin purée | Pumpkin | Vegetables & herbs |
| Sea buckthorn purée | Sea buckthorn | Fruits & berries |
| Apple juice, lemon juice, carrot juice | A separate profile for each juice | Milks, waters & juices |
| Banana water | Banana water | Milks, waters & juices |
| Pitaya | Pitaya | Fruits & berries |
| Pitaya powder | Pitaya powder | Powders, mushrooms & extracts |
| Coconut meat or flakes | Separate meat and flakes profiles | Fruits & berries |
| Coconut milk, cream or water | Separate profiles | Milks, waters & juices |
| Coconut whip, including flavor variants | Coconut whip | Toppings & desserts |
| Lemonade | Lemonade | Coffee, tea & prepared drinks |
| MALK almond milk | Almond milk, with MALK in source wording | Milks, waters & juices |
| GORGIE energy drink | Energy drink | Coffee, tea & prepared drinks |
| De Soi Spritz or Kin High Rhode | Nonalcoholic aperitif | Coffee, tea & prepared drinks |
| BARCODE Lemon Lime | Hydration drink | Coffee, tea & prepared drinks |
| Bio-K Blueberry | Probiotic drink | Cultured ingredients |
| Natural Vitality CALM | Magnesium | Proteins & supplements |
| Ultima Replenisher | Electrolytes | Proteins & supplements |
| BodyHealth Perfect Amino | Amino acids | Proteins & supplements |
| Sprout Living Epic Protein | Plant protein | Proteins & supplements |
| Huel Daily Greens | Greens powder | Powders, mushrooms & extracts |
| Marine collagen, holi(mane), Collagen Plus or Greens & Collagen | Collagen, with each complete product named underneath | Proteins & supplements |
| Copina Vanilla Collagen Boost | Plant-based creamer, contains no collagen peptides | Coffee, tea & prepared drinks |
| The Fullest saffron latte or Blume pumpkin spice latte | Latte mix | Coffee, tea & prepared drinks |
| Codeage Hair Vitamins or MaryRuth multivitamins | Multivitamin | Proteins & supplements |
| B. Powered Superfood Honey | Honey | Sweeteners, spices & seasonings |
| Udo's Oil or Blended Omega Oils | Oil blend, without inferring an unspecified source | Nuts, seeds, oils & grains |
| NOVOS Core or Sakara Beauty Drops | Separate named formulas | Specialty blends |

Branding is not a category or a reason to create an ingredient profile. Prefer a familiar generic ingredient or preparation that future brands can share. Source product names and flavors remain in each recipe and are searchable in the directory. Profiles show the first three distinct menu names, with the rest available in an expandable list.

A mixture does not automatically need a specialty profile. Plant protein, greens powder and latte mixes are useful generic identities even though their formulas vary. These are browsing groups, not claims that products have identical ingredients, nutrition or effects. Keep the full source product rather than expanding its formula into inferred smoothie ingredients.

Use one browsing profile for a familiar ingredient type, including its reviewed mixes. Collagen includes marine collagen and named collagen-containing powders with pearl, greens or electrolytes. It does not mean plain collagen or equal formulas. Perfect Amino with electrolytes shares Amino acids. Honey includes honey-based preparations, vitamin formulas share Multivitamin, and flavored latte powders share Latte mix. Keep the complete product as a source variant, without extracting its components into extra ingredient counts.

Keep a separate profile when merging would misstate what was added. Copina Vanilla Collagen Boost contains no collagen peptides and belongs under Plant-based creamer. Do not apply that preparation to an unknown product merely because its name says collagen support. Prepared hydration drinks and probiotic drinks stay separate from powders and drops. Fish oil stays separate from Oil blend. An unspecified oil blend does not establish a plant or fish source. Flaxseed and flaxseed oil stay separate, as do fruit and juice.

Specialty blends is reserved for distinct formulas without a useful, verified generic identity. NOVOS Core, Sakara Beauty Drops and Anima Mundi Euphoria retain their product names here. BioSil is not mapped to collagen based on marketing wording. A generic label such as wellness blend would hide too much to be useful. Low usage alone is not a reason to merge unrelated products.

Complete preparations take proposal priority over their components. Approved labels in `data/ingredient-labels.js` and canonical profile names determine actual grouping. Regexes only suggest a match for review. Known product labels can map to generic profiles, but a generic source label must never imply a particular brand. Generic names such as Energy drink and Greens powder also match their reusable profiles. Preserve old IDs as direct aliases when consolidating or renaming profiles.

Fruit powders share Powders, mushrooms & extracts. Tea powder, ground spices and protein powder stay with tea, seasonings or proteins. Plain purées share their fruit or vegetable profile. This avoids a small Powders & purées category while preserving the source preparation.

By type keeps a stable category order and shows the most-used ingredients first within each category. Ties use ingredient name. Most used applies that order across categories. A to Z is the explicit alphabetical option. Counts cover the full archive and count each smoothie once per ingredient, regardless of source variants. They are not quantities or nutrition data.

Use source wording or a verified product panel to establish form. A bare label such as Lucuma, Camu Camu, Celery or Lemon does not establish powder or juice. Do not infer preparation from an older descriptive blurb.

Distinct profiles should use distinguishable icons. Juices should look like drinks, whipped toppings like cream, and whole produce like the produce. Consolidated preparation variants use the shared ingredient icon. Keep aliases when merging IDs so existing profile links still resolve.

For future proposals, identify the complete preparation first and reuse an accurate generic profile. Keep brand and flavor as source variants. Create a new profile only when an existing one would misrepresent the ingredient. A known brand alone must not force a new identity. Unknown formulas remain raw and flagged for review. Add positive examples and nearby counterexamples when changing a rule, then audit every stored recipe. A generic substring match for Mango must not automatically approve a new Mango Juice label as fruit. The proposal needs a reviewed juice profile and icon. Display grouping never changes source recipes.

### Enforcement in automated refreshes

The browser and refresh load the same reviewed label registry. Case, whitespace and Unicode normalization do not create a new review. A leading organic label also reuses an approved exact ingredient name, so Organic Carrot Juice shares Carrot Juice without approving an unfamiliar Mango Juice as Mango. Other unfamiliar wording stays ungrouped, even if a regex suggests a familiar ingredient. A label does not become approved merely because an earlier refresh saved it in a recipe.

Refreshes never write the registry, ingredient definitions, icons or categories. A refresh with unfamiliar ingredients or failed recipe checks opens a draft PR, or returns an existing proposal to draft. Its report lists each unfamiliar label, the proposed existing profile and the affected smoothies, alongside the grouping rules. PR validation fails on any unreviewed archive label. The refresh run checks the proposed data before the PR action restores the checkout, then enforces that saved result after creating the draft. This is independent of a separate PR workflow that [GitHub may hold for approval](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow). Known products automatically reuse the saved mappings on every future run.

To resolve a new label:

1. Check its recipe source or product panel. Reuse a profile from this policy when it describes the ingredient accurately.
2. Add its normalized full label and canonical ID to `data/ingredient-labels.js`. If it needs a genuinely different ingredient or preparation, add the profile and icon first. Do not add a profile just for a brand, flavor or low count.
3. Run `node --test tests/*.test.mjs`, `node scripts/ingredient-audit.mjs --check` and `node scripts/build-data.mjs --check`. Then review the PR normally. Updating the source recipe alone cannot clear an unreviewed mapping.

These checks prevent silent recategorization. A genuinely new formula still needs one editorial decision. The decision is saved in the repository and reused, so there is no need to repeat the whole archive audit.

Review low-use profiles before adding another split. `node scripts/ingredient-audit.mjs --low-use` lists every used profile appearing in at most two smoothies, its raw labels and drink names. Check whether the distinction is a brand, flavor, marketing claim, known formula or materially different preparation. Low usage is a review signal, never an automatic merge rule. The [September 2026 audit](docs/ingredient-audit-2026-09-05.md) records decisions for all 124 profiles that met this threshold before the pass.

The category policy has been checked against the stored ingredient labels. Generic product types were also checked against [GORGIE](https://getgorgie.com/pages/faqs), [De Soi](https://drinkdesoi.com/pages/faq), [Kin](https://www.kineuphorics.com/products/high-rhode), [Huel](https://huel.com/pages/the-huel-daily-greens-formula-explained), [BARCODE](https://drinkbarcode.com/products/barcode-drink) and [Bio-K](https://biokplus.com/products/vegan-drinkable-blueberry-1). [BioSil](https://www.biosil.beauty/products/biosil-liquid-caps?external_browser_redirect=true) explains why it must not be mapped to collagen. These current pages establish product types, not historical recipe amounts or an unchanged formula. The [NOVOS ingredient page](https://novoslabs.com/ingredients/) and [Anima Mundi Euphoria product page](https://animamundiherbals.com/products/euphoria-powder) also illustrate why a named formula should retain a product identity. Their current compositions are not claims about historical smoothie contents. Sakara's old Beauty Water Drops URL now redirects, so its archived product name is retained without inferring the formula.

## Menu and archive

`menu.smoothieIds` alone determines the current menu. Historical `status`, a working product page, and an old `lastSeen` date do not establish current availability. A returned drink reenters the menu without losing its history. Product IDs are join hints because Erewhon can reuse a listing for a different edition. The archive's own `id` is the stable record key.

The default feed is `GROVE_SEARCH_INDEX`. It reflects the online Grove menu, not inventory across every store. Show the check date and scope beside the menu. A listing does not establish that the drink can be ordered at this moment.

Existing historical statuses remain as recorded. The display says Archived instead of Discontinued because absence from this feed is not proof of permanent discontinuation. First discovery by the refresh is an observation date, not a verified launch date.

## Refresh and review

The refresh runs on the 1st and 15th and can be started manually in GitHub Actions. It opens a reviewable pull request. It does not merge or deploy its own changes.

The pipeline reads Erewhon's public search feed and checks every page of results before changing menu membership. Missing fields, duplicate feed IDs, implausible additions or removals, and incomplete pagination stop the run. Removal checks compare with the previous menu snapshot, not the entire archive.

Successful recipe checks retain the original wording and save the checked product URL in `ingredientsSource`. A changed recipe keeps its previous list and known provenance in `recipeHistory`. A failed check preserves the existing list, adds a review reason and is retried on the next run. Never turn a failed scrape into an empty or supposedly complete recipe. Parse only the ingredient panel, keep commas inside parentheses together, and exclude allergen statements. Preserve complete product names containing and, such as Greens and Collagen. Split a final and only when it unambiguously separates two approved labels. Unfamiliar compound wording stays intact for review.

Unresolved ingredients are included in the review report. The scheduled refresh does not invent canonical rules, icons, ingredient descriptions, collaborator classifications, or health claims. A maintainer reviews those decisions with source evidence.

Before merging a refresh:

1. Compare additions, removals, recipe changes and prices with the linked source.
2. Resolve reported ingredient matches and inspect the associated icons and grouped rows.
3. Check that attribution and dates are supported, especially for newly discovered drinks.
4. Run the offline tests, archive health check and generated-data check.
5. Inspect the preview on desktop and mobile, including the opening archive, current menu and an ingredient sheet.

An unchanged successful check may still update the menu's check date. This keeps the date tied to an actual accepted check. Scheduled frequency and human review determine how fresh the published menu is.

The refresh workflow validates both the starting archive and the proposed result before opening a pull request. Pull requests also have a separate validation job when GitHub emits a pull request event.

Historical sources are not all complete. Matching every stored ingredient does not prove an old recipe has no missing ingredients. The ingredient audit checks interpretation of the stored lists, not the completeness of every historical source. Newly downloaded photos retain their original dimensions and compression, with the correct file extension.
