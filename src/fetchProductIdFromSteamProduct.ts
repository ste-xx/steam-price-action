interface Input {
  name: string
  key: string
}

type ProductId = string
export interface Args {
  readInput: () => Input[]
  fetchData: (arg: Input['name']) => Promise<ProductId>
}

type Result = (Input & {productId: string})[]

export const fetchProductIdFromSteamProduct = async (
  args: Args
): Promise<Result> => {
  return Promise.all(
    args
      .readInput()
      .map(input => ({
        ...input,
        requestName: input.name
          .replaceAll(' ', '-')
          .toLowerCase()
          .replace(/[^a-z1-9-]/gi, '')
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
