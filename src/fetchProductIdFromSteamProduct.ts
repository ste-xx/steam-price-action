interface Input {
  name: string
  key: string
}

type ProductId = string
export interface Args {
  readInput: () => Input[]
  fetchData: (arg: Input['name']) => Promise<ProductId>
  withMapper: {from: string; to: string}[]
}

type Result = (Input & {productId: string})[]

const createMapper =
  (productNameMapper: {from: string; to: string}[]) => (productName: string) =>
    productNameMapper.find(e => e.from.trim() === productName.trim())?.to ??
    productName.trim()

export const fetchProductIdFromSteamProduct = async (
  args: Args
): Promise<Result> => {
  const mapper = createMapper(args.withMapper)
  return Promise.all(
    args
      .readInput()
      .map(input => ({
        ...input,
        requestName: mapper(input.name)
          .replaceAll(' ', '-')
          .toLowerCase()
          .replace(/[^a-z0-9-]/gi, '')
      }))
      .map(async input => {
        const productId = await args.fetchData(input.requestName)
        return {
          ...input,
          productId
        }
      })
  )
}
