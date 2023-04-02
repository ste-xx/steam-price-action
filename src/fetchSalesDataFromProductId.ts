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

type Entry = [label: string, price: number, url: string]

export interface Args {
  readInput: () => Input
  fetchData: (input: Input[number]) => Promise<FetchResponse>
}

const addArg =
  <T, U>(fn: (arg: T) => Promise<U>) =>
  async (arg: T): Promise<[U, T]> =>
    [await fn(arg), arg]

export const fetchSalesDataFromProductId = async (
  args: Args
): Promise<Entry[]> => {
  const fetchDataWithArgs = addArg(args.fetchData)

  const responseInputTuples = await Promise.all(
    args.readInput().map(fetchDataWithArgs)
  )

  return responseInputTuples.map(([response, input]): Entry => {
    const MERCHANT_G2A = '61'
    const offer = response.offers.find(
      o => o.merchant === MERCHANT_G2A && o.platform === 'steam'
    )
    return [
      input.label,
      offer?.price.eur.priceWithoutCoupon ?? offer?.price.eur.price ?? -1,
      offer?.affiliateUrl ?? '-'
    ]
  })
}
