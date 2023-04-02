type Row = (string | number)[]

export const toJSON = (
  header: string[],
  data: Row[]
): string => {
  const rows = Object.fromEntries(
    data.map(([label, price, url]) => [
      label,
      {[header[1]]: price, [header[2]]: url}
    ])
  )
  return JSON.stringify(rows, null, 2)
}