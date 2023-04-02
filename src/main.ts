import * as core from '@actions/core'
import {
  Args as SteamWishListArgs,
  fetchSteamWishList
} from './fetchSteamWishList'
import {HttpClient} from '@actions/http-client'

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

      if (Array.isArray(result)) {
        return [] as Awaited<ReturnType<SteamWishListArgs['fetchData']>>
      }

      if (!Array.isArray(result)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return {
          ...result,
          ...(await fetchSteamWhishList(arg, page + 1))
        }
      }
      if (!result) {
        throw new Error(
          `No successful whishlist fetch for ${arg.steamProfileId}`
        )
      }
      return result
    }

    const e = await fetchSteamWishList({
      fetchData: fetchSteamWhishList,
      readInput: () => ({steamProfileId: core.getInput('profileId')})
    })

    // eslint-disable-next-line no-console
    console.log(e)

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
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
