# steam price action

Collects the current prices [G2A](https://g2a.com/) prices from [allkeyshop](https://www.allkeyshop.com ) for given Steam products. 

### How to use

```yaml
 - uses: ste-xx/steam-price-action@v1
   with:
     profileId: <SteamProfileId>
   id: price
```

Use the outputs further in the action.
```yaml
 - run: echo "${{steps.price.outputs.tsv}}"
```

Example workflow can be found [here](https://github.com/ste-xx/steam-price-watcher/blob/main/.github/workflows/report.yml)

### Supported output formats 

| format | output-key |
|--------|------------|
| tsv    | tsv        |
| json   | json       |