import * as core from '@actions/core'
import {
  Args as SteamWishListArgs,
  fetchSteamWishList
} from './fetchSteamWishList'
import {HttpClient} from '@actions/http-client'
import {parse} from 'node-html-parser'
import {fetchProductIdFromSteamProduct} from './fetchProductIdFromSteamProduct'
import {
  Args as SalesDataFromProductIdArgs,
  fetchSalesDataFromProductId
} from './fetchSalesDataFromProductId'
import {toTsv} from './toTsv'
import {toJSON} from './toJson'

async function run(): Promise<void> {
  try {
    const fetchSteamWhishList = async (
      arg: Parameters<SteamWishListArgs['fetchData']>[0],
      page = 0
    ): ReturnType<SteamWishListArgs['fetchData']> => {
      const client = new HttpClient()
      const url = `https://store.steampowered.com/wishlist/profiles/${arg.steamProfileId}/wishlistdata/?p=${page}`
      const {result} = await client.getJson<
        ReturnType<SteamWishListArgs['fetchData']>
      >(url)

      console.log('fetch')
      console.log(url)
      if (!result) {
        throw new Error(
          `No successful whishlist fetch for ${arg.steamProfileId}`
        )
      } else if (Array.isArray(result)) {
        return [] as Awaited<ReturnType<SteamWishListArgs['fetchData']>>
      } else {
        //(!Array.isArray(result))
        return {
          ...result,
          ...(await fetchSteamWhishList(arg, page + 1))
        }
      }
    }

    const whishList = await fetchSteamWishList({
      fetchData: fetchSteamWhishList,
      readInput: () => ({steamProfileId: core.getInput('profileId')})
    })
    console.log(whishList)

    const withRss = whishList.map(i => ({
      ...i,
      rss: `https://steamcommunity.com/games/${i.key}/rss`
    }))

    const wait = async (ms: number): Promise<unknown> => {
      return new Promise(resolve => setTimeout(() => resolve(undefined), ms))
    }

    interface WithRetryDelayParam<T> {
      fn: () => Promise<T>
      max: number
      current: number
      delayFn: (params: {current: number}) => Promise<unknown>
    }

    const withRetryDelay = async <T>(
      withRetryParam: WithRetryDelayParam<T>
    ): Promise<T> => {
      const {fn, max, current, delayFn} = withRetryParam
      console.log(`retry ${current}`)
      if (current >= max) {
        return Promise.reject(new Error(`failed with ${max} retries`))
      }
      // eslint-disable-next-line github/no-then
      return fn().catch(async e => {
        console.log(e)
        console.log('###')
        await delayFn({current})
        return withRetryDelay({
          ...withRetryParam,
          current: withRetryParam.current + 1
        })
      })
    }

    const withProductId = await fetchProductIdFromSteamProduct({
      fetchData: async productName => {
        const client = new HttpClient()
        const url = `https://www.allkeyshop.com/blog/buy-${productName}-cd-key-compare-prices/`
        const response = await withRetryDelay({
          fn: async () => client.get(url),
          max: 10,
          delayFn: async ({current}) => wait(2000 * current),
          current: 0
        })
        const html = await response.readBody()
        const document = parse(html)
        const productId =
          document.querySelector('[data-product-id]')?.attributes[
            'data-product-id'
          ]
        if (!productId) {
          throw new Error('unknown product')
        }
        return productId
      },
      // readInput: () => ['the-last-spell']
      readInput: () => withRss
    })

    console.log(withProductId)

    const withPrice = await fetchSalesDataFromProductId({
      fetchData: async ({productId}) => {
        const client = new HttpClient()
        const url = `https://www.allkeyshop.com/blog/wp-admin/admin-ajax.php?action=get_offers&product=${productId}&currency=eur&region=&edition=&moreq=&use_beta_offers_display=1`

        const {result} = await withRetryDelay({
          fn: async () =>
            client.getJson<ReturnType<SalesDataFromProductIdArgs['fetchData']>>(
              url
            ),
          max: 10,
          delayFn: async ({current}) => wait(2000 * current),
          current: 0
        })

        if (!result) {
          throw new Error(`No successful fetch for ${productId}`)
        }
        return result
      },
      readInput: () => withProductId
    })

    console.log(withPrice)
    const arr = withPrice.map(e => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return [e['name'], e.price, e.url, e['rss']]
    })

    core.setOutput('tsv', toTsv(['label', 'price', 'url', 'rss'], arr))
    core.setOutput('json', toJSON(['label', 'price', 'url', 'rss'], arr))
  } catch (error) {
    console.log(error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
