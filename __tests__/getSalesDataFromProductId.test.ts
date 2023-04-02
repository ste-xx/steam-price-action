import {fetchSalesDataFromProductId} from '../src/fetchSalesDataFromProductId'
import {expect, test, jest} from '@jest/globals'

test('happy case', async () => {
  const result = await fetchSalesDataFromProductId({
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
    readInput: () => [{productId: '123', label: 'given_label'}]
  })

  expect(result).toEqual([['given_label', 888, '<url_to_offer>']])
})

test('happy case (multiple products)', async () => {
  const result = await fetchSalesDataFromProductId({
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
    readInput: () => [
      {productId: '123', label: 'given_label'},
      {productId: '123', label: 'another_label'}
    ]
  })

  expect(result).toEqual([
    ['given_label', 888, '<url_to_offer>'],
    ['another_label', 888, '<url_to_offer>']
  ])
})

test('throws fetch error', async () => {
  await expect(
    fetchSalesDataFromProductId({
      fetchData: async () => {
        throw new Error('fetch error')
      },
      readInput: () => [{productId: '123', label: 'N/A'}]
    })
  ).rejects.toThrow('fetch error')
})

test('merchant not found', async () => {
  const result = await fetchSalesDataFromProductId({
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
    readInput: () => [{productId: '123', label: 'given_label'}]
  })

  expect(result).toEqual([['given_label', -1, '-']])
})

test('wrong platform', async () => {
  const result = await fetchSalesDataFromProductId({
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
    readInput: () => [{productId: '123', label: 'given_label'}]
  })

  expect(result).toEqual([['given_label', -1, '-']])
})
