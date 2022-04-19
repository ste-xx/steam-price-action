import {getInput, setOutput} from "@actions/core";

export interface FetchResponse{
  success:boolean;
  offers: {
    affiliateUrl: string;
    merchant: string;
    platform: 'steam' | string;
    price: {
      eur: {
        price: number
        priceWithoutCoupon: number
      }
    }
  }[]
}

const MERCHANT_G2A = '61';

const findMerchant = (merchant: String) => {
  return (offer: FetchResponse['offers'][number]) => offer.merchant === merchant
}

type Input  = {
  productId: string;
  label: string;
}[]

const collectData = <T>(fetchFn: (input: Input[number]) => Promise<FetchResponse>,  map: (x: [r: FetchResponse, i: Input[number]]) => T) => {
  return async (input: Input[number]) => fetchFn(input).then((r) => map([r, input]));
}
const input = [
  {productId: '70843', label: 'Disciples Liberation'}
];

export const fetch = (async (args) => {
  const input = args.readInput();
  const collectDataFn = collectData(args.fetchData, ([r, i]) => {
    const offer = r.offers.find(findMerchant(MERCHANT_G2A));
    return [i.label, offer?.price.eur.priceWithoutCoupon ?? offer?.price.eur.price ?? -1, offer?.affiliateUrl ?? '-'];
  });

  const result = await Promise.all(input.map(collectDataFn));
  const rows = result.map(e => e.join("\t"));
  const tsv = [['label', 'price', 'link'].join("\t"), ...rows].join("\n");
  args.writeOutput(tsv);

});