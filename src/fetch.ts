type Input = {
  productId: string
  label: string
}[]

interface FetchResponse {
  success: boolean
  offers: {
    affiliateUrl: string
    merchant: string
    platform: 'steam' | string
    price: {
      eur: {
        price: number
        priceWithoutCoupon: number
      }
    }
  }[]
}

export interface Args {
  readInput: () => Input
  fetchData: (input: Input[number]) => Promise<FetchResponse>
  writeOutput: (
    header: ['label', 'price', 'link'],
    data: [label: string, price: number, url: string][]
  ) => void
}

export const fetch = async (args: Args): Promise<void> => {
  const responseInputTuples = await Promise.all(
    args
      .readInput()
      .map(
        async (input): Promise<[FetchResponse, Input[number]]> => [
          await args.fetchData(input),
          input
        ]
      )
  )

  const result = responseInputTuples.map(
    ([response, input]): [string, number, string] => {
      const MERCHANT_G2A = '61'
      const offer = response.offers.find(
        o => o.merchant === MERCHANT_G2A && o.platform === 'steam'
      )
      return [
        input.label,
        offer?.price.eur.priceWithoutCoupon ?? offer?.price.eur.price ?? -1,
        offer?.affiliateUrl ?? '-'
      ]
    }
  )

  args.writeOutput(['label', 'price', 'link'], result)
}

export const toTsv = (
  header: ['label', 'price', 'link'],
  data: [string, number, string][]
): string => {
  const rows = data.map(e => e.join('\t'))
  return [header.join('\t'), ...rows].join('\n')
}
