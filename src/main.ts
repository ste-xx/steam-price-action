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

    let iterateForProductId = 0
    const withProductId = await fetchProductIdFromSteamProduct({
      fetchData: async productName => {
        const client = new HttpClient()
        const url = `https://www.allkeyshop.com/blog/buy-${productName}-cd-key-compare-prices/`
        console.log('fetch')
        console.log(url)
        await wait(2000 * iterateForProductId)
        console.log(iterateForProductId)
        iterateForProductId += 1

        const result = await (await client.get(url)).readBody()
        console.log('fetched')
        const document = parse(result)
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

    let iterateForPrice = 0
    const withPrice = await fetchSalesDataFromProductId({
      fetchData: async ({productId}) => {
        const client = new HttpClient()
        const url = `https://www.allkeyshop.com/blog/wp-admin/admin-ajax.php?action=get_offers&product=${productId}&currency=eur&region=&edition=&moreq=&use_beta_offers_display=1`
        await wait(500 * iterateForPrice)
        console.log(iterateForPrice)
        iterateForPrice += 1
        console.log('fetch')
        console.log(url)

        const {result} = await client.getJson<
          ReturnType<SalesDataFromProductIdArgs['fetchData']>
        >(url)

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
