/** Design `stitch_review` thumbnails — mock detections until vision is wired. */
export type ScanIngredientItem = {
  id: string;
  name: string;
  detail: string;
  imageUri: string;
};

export const DEFAULT_SCAN_INGREDIENTS: ScanIngredientItem[] = [
  {
    id: 'spinach',
    name: 'Baby Spinach',
    detail: 'Fresh Greens • 1 Bag',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBFVGvtwwH01m1ZEo_ghL8u2X5VKwauc3xOEec73SJyyEr6nsVXPTvwXGhZ_vCY4pIEIIO6T7ChUkLb22XkOf-0tdI8Wd0u1ZjrPOgYcVG_wI5l0jpvBF_BZu5gnaein78E9kCrm0J51NyTAUAiFj9bf6GzKzgQjIatIBT0I50Zl540BV0xIzHwWkyduybt9ajrNq_96jcA0LBXp932Kow0p_EhC6JV3wuTP_HVI5RMZO076bO7BGyKLG3ykCwUernot7Oq0cWomTNd',
  },
  {
    id: 'tomatoes',
    name: 'Cherry Tomatoes',
    detail: 'Produce • ~250g',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCdnZHArnppdAY9TaW_wA3pg_zLYmUi6v2Ix87fOElps1Z86ubwRn9d_bUpDFqJWk8Y4W6n7io4IT4K6AE0E_WYf-ghNUGpPkphh6esykHIBt50txRNzWD9CD5tVSYK07HuQie3LFYzUrWSdaOXFIyTFgnuqC9fGQKLgDM8xqQqmCbhzRaiMzo06q2hqhkutVT252ieLXqiLgv_wN8LdiQHKe-NwI-9x5d6HiiiOU-OMuxXtMnPWFvaEzwsztiiZCCPh21FBpnWpnIe',
  },
  {
    id: 'onion',
    name: 'Red Onion',
    detail: 'Vegetable • 1 Unit',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB0ReO0uskwrMATdazgUmQJp4MGQsE4fdwzNONWmtqPwOHQFVK87y715MGrNkvvs3ZZuzbg3RJBIxTNMhvsDSFbTSxX9k63xAcMw-sje5VHGoD71-NN1gPje-50eWGZZsU0A52W2nhZvjufBV_0T-XetqBHlN9DAmIEUagPtLwp-on_MRjqnAV80BNU4BWJIlC_UPUbt8ByHW64c5UQjNnhnt6JRO_dOhFXRlFIrU9B60QsZke53YAd2KOGKWO4Dy1QrkQm94j_clvg',
  },
];

export function cloneDefaultScanIngredients(): ScanIngredientItem[] {
  return DEFAULT_SCAN_INGREDIENTS.map((row) => ({ ...row }));
}
