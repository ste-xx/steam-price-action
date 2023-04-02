type SteamProductName = string
type ProductId = string
export interface Args {
  readInput: () => SteamProductName[]
  fetchData: (arg: SteamProductName[number]) => Promise<ProductId>
}

type Result = ProductId[]

export const fetchProductIdFromSteamProduct = async (
  args: Args
): Promise<Result> => {
  return Promise.all(
    args.readInput().map(async productName => {
      return args.fetchData(productName)
    })
  )
}
