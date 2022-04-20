import {fetch, toJSON, toTsv} from '../src/fetch'
import {expect, test, jest} from '@jest/globals'

test('happy case', async () => {
  const writeOutput = jest.fn()

  await expect(
    fetch({
      fetchData: async () => ({
        success: true,
        offers: [
          {
            affiliateUrl: '<url_to_offer>',
            merchant: '61',
            platform: 'steam',
            price: {
              eur: {
                price: 777,
                priceWithoutCoupon: 888
              }
            }
          }
        ]
      }),
      writeOutput,
      readInput: () => [{productId: '123', label: 'given_label'}]
    })
  ).resolves.toBeUndefined()

  expect(writeOutput).toHaveBeenCalledWith(
    ['label', 'price', 'link'],
    [['given_label', 888, '<url_to_offer>']]
  )
})

test('happy case (multiple products)', async () => {
  const writeOutput = jest.fn()

  await expect(
    fetch({
      fetchData: async () => ({
        success: true,
        offers: [
          {
            affiliateUrl: '<url_to_offer>',
            merchant: '61',
            platform: 'steam',
            price: {
              eur: {
                price: 777,
                priceWithoutCoupon: 888
              }
            }
          }
        ]
      }),
      writeOutput,
      readInput: () => [
        {productId: '123', label: 'given_label'},
        {productId: '123', label: 'another_label'}
      ]
    })
  ).resolves.toBeUndefined()

  expect(writeOutput).toHaveBeenCalledWith(
    ['label', 'price', 'link'],
    [
      ['given_label', 888, '<url_to_offer>'],
      ['another_label', 888, '<url_to_offer>']
    ]
  )
})

test('throws fetch error', async () => {
  await expect(
    fetch({
      fetchData: async () => {
        throw new Error('fetch error')
      },
      writeOutput: o => console.log(o),
      readInput: () => [{productId: '123', label: 'N/A'}]
    })
  ).rejects.toThrow('fetch error')
})

test('merchant not found', async () => {
  const writeOutput = jest.fn()
  await expect(
    fetch({
      fetchData: async () => ({
        success: true,
        offers: [
          {
            affiliateUrl: '<some_url>',
            merchant: 'merchant',
            platform: 'steam',
            price: {
              eur: {
                price: 777,
                priceWithoutCoupon: 888
              }
            }
          }
        ]
      }),
      writeOutput,
      readInput: () => [{productId: '123', label: 'given_label'}]
    })
  ).resolves.toBeUndefined()

  expect(writeOutput).toHaveBeenCalledWith(
    ['label', 'price', 'link'],
    [['given_label', -1, '-']]
  )
})

test('wrong platform', async () => {
  const writeOutput = jest.fn()
  await expect(
    fetch({
      fetchData: async () => ({
        success: true,
        offers: [
          {
            affiliateUrl: '<url_to_g2a>',
            merchant: '61',
            platform: 'gog',
            price: {
              eur: {
                price: 777,
                priceWithoutCoupon: 888
              }
            }
          }
        ]
      }),
      writeOutput,
      readInput: () => [{productId: '123', label: 'given_label'}]
    })
  ).resolves.toBeUndefined()

  expect(writeOutput).toHaveBeenCalledWith(
    ['label', 'price', 'link'],
    [['given_label', -1, '-']]
  )
})

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
