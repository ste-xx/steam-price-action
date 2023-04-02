import * as core from '@actions/core'
import {
  Args as SteamWishListArgs,
  fetchSteamWishList
} from './fetchSteamWishList'
import {HttpClient} from '@actions/http-client'
import {parse} from 'node-html-parser'
import {fetchProductIdFromSteamProduct} from './fetchProductIdFromSteamProduct'

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

    const e2 = await fetchProductIdFromSteamProduct({
      fetchData: async productName => {
        const client = new HttpClient()
        const url = `https://www.allkeyshop.com/blog/buy-${productName}-cd-key-compare-prices/`
        const result = await (await client.get(url)).readBody()
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
      readInput: () => whishList
    })

    console.log(e2)

    // const entries = await fetchSalesDataFromProductId({
    //   fetchData: async ({productId}) => {
    //     const client = new HttpClient()
    //     const url = `https://www.allkeyshop.com/blog/wp-admin/admin-ajax.php?action=get_offers&product=${productId}&currency=eur&region=&edition=&moreq=&use_beta_offers_display=1`
    //     const {result} = await client.getJson<ReturnType<Args['fetchData']>>(
    //       url
    //     )
    //
    //     if (!result) {
    //       throw new Error(`No successful fetch for ${productId}`)
    //     }
    //     return result
    //   },
    //   readInput: () => JSON.parse(core.getInput('input'))
    // })
    //
    // core.setOutput('tsv', toTsv(['label', 'price', 'url'], entries))
    // core.setOutput('json', toJSON(['label', 'price', 'url'], entries))
  } catch (error) {
    console.log(error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
