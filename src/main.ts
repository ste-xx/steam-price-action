import * as core from '@actions/core'
import {Args, fetch, toJSON, toTsv} from './fetch'
import {HttpClient} from '@actions/http-client'

async function run(): Promise<void> {
  try {
    await fetch({
      fetchData: async ({productId}) => {
        const client = new HttpClient()
        const url = `https://www.allkeyshop.com/blog/wp-admin/admin-ajax.php?action=get_offers&product=${productId}&currency=eur&region=&edition=&moreq=&use_beta_offers_display=1`
        const {result} = await client.getJson<ReturnType<Args['fetchData']>>(
          url
        )

        if (!result) {
          throw new Error(`No successful fetch for ${productId}`)
        }
        return result
      },
      readInput: () => JSON.parse(core.getInput('input')),
      writeOutput: (header, data) => {
        core.setOutput('tsv', toTsv(header, data))
        core.setOutput('json', toJSON(header, data))
      }
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
