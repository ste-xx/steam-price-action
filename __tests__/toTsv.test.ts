import {expect, test} from "@jest/globals";
import {toTsv} from "../src/toTsv";

test('toTsv', () => {
  expect(
    toTsv(
      ['label', 'price', 'link'],
      [
        ['given_label', 888, '<url_to_offer>'],
        ['another_label', 888, '<url_to_offer>']
      ]
    )
  ).toEqual(`label\tprice\tlink
given_label\t888\t<url_to_offer>
another_label\t888\t<url_to_offer>`)
})

