const transformProductToString = (product, language) => {
  const productName = product.masterData.staged.name?.[language];
  const productDescription =
    product.masterData.staged.description?.[language] || "";
  const productMetaDescription =
    product.masterData.staged.metaDescription?.[language] || "";
  const productMetaKeywords =
    product.masterData.staged.metaKeywords?.[language] || "";
  const productMetaTitle =
    product.masterData.staged.metaTitle?.[language] || "";
  const productSlug = product.masterData.staged.slug?.[language] || "";

  // Return single line result in following pattern : name|description|metaDescription|metaKeywords|metaTitle|slug
  return `${productName}|${productDescription}|${productMetaDescription}|${productMetaKeywords}|${productMetaTitle}|${productSlug}`;
};

const transformProductAttributeToString = () => {
  // TODO
  //  1. Identify attributes from product type which belongs to localized String.
  //  2. Transform the product attributes into String.
};

export { transformProductToString, transformProductAttributeToString };
