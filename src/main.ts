import * as core from '@actions/core'
import {fetch, FetchResponse} from './fetch'

async function run(): Promise<void> {
  try {
    await fetch({
      fetchData: ({productId}: {productId: string}): Promise<FetchResponse> => fetch(`https://www.allkeyshop.com/blog/wp-admin/admin-ajax.php?action=get_offers&product=${productId}&currency=eur&region=&edition=&moreq=&use_beta_offers_display=1`).then(r => r.json() as Promise<FetchResponse>),
      readInput: () => JSON.parse(core.getInput("input")),
      writeOutput: (data: string) => core.setOutput("tsv", data)
    });
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
