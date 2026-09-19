# September 15 refresh review

Reviewed [PR #8](https://github.com/gaoe03/erewhon/pull/8) at `4045d76d2d92322f1435a85e1e838ed12b7ecadf`, based on `f6b49d9224f736c9f8a17f53795c3c055ab386c5`.

The scheduled run collected 21 menu entries, added Easy Tiger and removed Blueberry SYRN from menu membership. It saved a draft, then failed the required mapping check on 12 distinct unreviewed labels. The Vercel preview succeeded, while the PR validation workflow required approval. A successful preview was not an ingredient validation result.

## Corrections

- Approved-equivalent normalization handles Organic within known product names, trademark symbols and trailing footnote markers. Full remaining labels must match, with collisions left unresolved.
- The reviewed registry now maps the named yogurt, honey, creatine, dried cherries and milk-qualified whey and colostrum labels to existing types.
- Probiotic Greens Blend belongs with Greens blend. Organic Grape Juice belongs with Grape juice. Anise remains separate from Anise hyssop because the source only names Anise.
- Post Workout's panel ends in `Organic Maca  Contains: Milk`. The original parser returned null. The corrected scraper reads seven ingredients from the live page and excludes the top-level allergen notice. Parenthetical product wording is preserved.
- Wording-only updates retain recipe history but get a shorter PR section. Unresolved ingredient flags appear once with the affected smoothies.
- The source's stray encoding character before a trademark symbol is removed from displayed ingredient variants. Captured source text remains unchanged. Both the Post Workout sheet and coconut-water profile were checked in the local browser.

## Source review

Four captured panels are retained in `tests/fixtures/ingredient-panels.json`, including source URLs and observation times. All 21 menu panels were captured on September 19 and parsed successfully with no unresolved labels after the corrections.

Easy Tiger's full recipe follows Erewhon's product panel. [MALK's collaboration article](https://malkorganics.com/blogs/news/megan-moroney-s-easy-tiger-smoothie-at-erewhon-features-malk-organic-almond-milk) supports the celebrity collaboration and limited availability fields. That article also lists pitaya powder, which the checked Erewhon panel does not list. The archive retains the Erewhon panel as its recipe source rather than combining different lists. September remains a first-seen date, not a researched launch date.

Gary Brecka's pending imported-recipe review was checked against its current Erewhon panel. The complete Perfect Amino variants retain their names and share the approved Amino acids profile. The local editorial flag was cleared after that review. The automation itself continues to preserve unrelated editorial flags.

## Verification

- Replayed the September 15 menu membership against the pre-PR archive using September 19 captured recipe panels. This is a replay, not a new live feed check or an exact reconstruction of September 15 source content.
- The replay produced zero unresolved mappings, 12 wording-only updates and seven recipe comparisons. It preserved the two pre-review editorial reasons for Gary Brecka and the new Easy Tiger entry.
- Replaying the reviewed local archive produced zero mapping or recipe-fetch review flags across all 21 panels.
- 35 offline tests passed. Archive health reported zero warnings. All 639 unique stored labels mapped. Generated data matched all 111 archive records.
- No remote branch, PR or deployment was updated during this verification.
