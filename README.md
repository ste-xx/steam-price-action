# steam price action

Collects the current prices [G2A](https://g2a.com/) prices from [allkeyshop](https://www.allkeyshop.com ) for given Steam products. 

### How to use

- Goto [allkeyshop](https://www.allkeyshop.com ) and search the wanted product
- Get the product id with the Chrome dev tools:
```javascript
document.querySelector('[data-product-id]').attributes['data-product-id'].value
```
- Call the action
```yaml
 - uses: ste-xx/steam-price-action@main
   with:
     input: |
       [
         { "productId": "<product_id>", "label": "<choose some label>" }
       ]
   id: price
```
- use the outputs further in the action.
```yaml
 - run: echo "${{steps.price.outputs.tsv}}"
```
- example workflow can be found [here](https://github.com/ste-xx/steam-price-watcher/blob/main/.github/workflows/report.yml)

### Supported output formats 

| format | output-key |
|--------|------------|
| tsv    | tsv        |