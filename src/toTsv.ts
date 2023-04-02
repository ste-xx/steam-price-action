type Row = (string | number)[]

export const toTsv = (header: string[], data: Row[]): string => {
  const rows = data.map(e => e.join('\t'))
  return [header.join('\t'), ...rows].join('\n')
}
