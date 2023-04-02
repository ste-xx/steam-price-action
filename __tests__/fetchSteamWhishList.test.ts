import {expect, test, it} from '@jest/globals'
import {fetchSteamWishList} from '../src/fetchSteamWishList'

test('sort by prio', async () => {
  const result = await fetchSteamWishList({
    fetchData: async () => ({
      '345': {
        name: 'givenGame',
        priority: 0
      },
      '678': {
        name: 'anotherGame',
        priority: 35
      },
      '9': {
        name: 'superGame',
        priority: 1
      }
    }),
    readInput: () => ({steamProfileId: '123'})
  })

  expect(result).toEqual([
    {
      key: '345',
      name: 'givenGame',
      requestName: 'givengame',
      priority: 0
    },
    {
      key: '9',
      name: 'superGame',
      requestName: 'supergame',
      priority: 1
    },
    {
      key: '678',
      name: 'anotherGame',
      requestName: 'anothergame',
      priority: 35
    }
  ])
})

test('ignore preReleasedGames', async () => {
  const result = await fetchSteamWishList({
    fetchData: async () => ({
      '345': {
        name: 'givenGame',
        prerelease: 1,
        priority: 0
      },
      '678': {
        name: 'anotherGame',
        priority: 35
      },
      '9': {
        name: 'superGame',
        priority: 1
      }
    }),
    readInput: () => ({steamProfileId: '123'})
  })

  expect(result).toEqual([
    {
      key: '9',
      name: 'superGame',
      requestName: 'supergame',
      priority: 1
    },
    {
      key: '678',
      name: 'anotherGame',
      requestName: 'anothergame',
      priority: 35
    }
  ])
})

it.each`
  note                                       | name             | requestName
  ${'should do nothing'}                     | ${'abc'}         | ${'abc'}
  ${'should replace whitespace'}             | ${'given title'} | ${'given-title'}
  ${'should replace non numeric/alphabetic'} | ${'give`ntitle'} | ${'giventitle'}
`('$note given: $given expected: $expected ', async ({name, requestName}) => {
  const result = await fetchSteamWishList({
    fetchData: async () => ({
      '345': {
        name: name as string,
        priority: 0
      }
    }),
    readInput: () => ({steamProfileId: '123'})
  })

  expect(result).toEqual([
    {
      key: '345',
      name,
      requestName,
      priority: 0
    }
  ])
})
