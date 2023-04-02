interface Body {
  name: string
  priority: number
  prerelease?: number | undefined
}

type FetchResponse = Record<string, Body> | Body[]

interface Input {
  steamProfileId: string
}

export interface Args {
  readInput: () => Input
  fetchData: (arg: Input) => Promise<FetchResponse>
}

type Entry = Body & {key: string; requestName: string}

type Result = Entry[]

export const fetchSteamWishList = async (args: Args): Promise<Result> => {
  const response = await args.fetchData(args.readInput())

  const wlList = Object.entries(response).map(([key, value]) => ({
    key,
    ...value
  }))

  wlList.sort((a, b) => a.priority - b.priority)

  return wlList
    .filter(e => e.prerelease === undefined)
    .map(e => ({
      ...e,
      requestName: e.name
        .replaceAll(' ', '-')
        .toLowerCase()
        .replace(/[^a-z1-9-]/gi, '')
    }))
}
