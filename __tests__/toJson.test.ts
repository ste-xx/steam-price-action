import {expect, test} from '@jest/globals'
import {toJSON} from '../src/toJson'

test('toJson', () => {
  expect(
    toJSON(
      ['label', 'price', 'link'],
      [
        ['given_label', 888, '<url_to_offer>'],
        ['another_label', 888, '<url_to_offer>']
      ]
    )
  ).toEqual(`{
  "given_label": {
    "price": 888,
    "link": "<url_to_offer>"
  },
  "another_label": {
    "price": 888,
    "link": "<url_to_offer>"
  }
}`)
})
