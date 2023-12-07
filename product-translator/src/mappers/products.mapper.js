import { getPrimaryLang } from "../utils/languages.utils";

const transformProductToString = (product, languages) => {
  // Determine the primary language from product name
  const productName = product.masterData.staged.name;
  const primaryLanguage = getPrimaryLang(productName, languages);

  // Transform product into a single line in following pattern based on the value of primary language.
  // name|description|metaDescription|metaKeywords|metaTitle|slug
  const primaryProductName = productName[primaryLanguage];
  const primaryProductDescription =
    product.masterData.staged.description?.[primaryLanguage] || "";
  const primaryProductMetaDescription =
    product.masterData.staged.metaDescription?.[primaryLanguage] || "";
  const primaryProductMetaKeywords =
    product.masterData.staged.metaKeywords?.[primaryLanguage] || "";
  const primaryProductMetaTitle =
    product.masterData.staged.metaTitle?.[primaryLanguage] || "";
  const primaryProductSlug =
    product.masterData.staged.slug?.[primaryLanguage] || "";

  // TODO
  //  1. Identify attributes from product type which belongs to localized String.
  //  2. Transform the product attributes into String.

  return `${primaryProductName}|${primaryProductDescription}|${primaryProductMetaDescription}|${primaryProductMetaKeywords}|${primaryProductMetaTitle}|${primaryProductSlug}`;
};

export { transformProductToString };
