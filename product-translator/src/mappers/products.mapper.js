import { TRANSLATION_FIELD_POS } from "../constants/translation.constants.js";

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

  // Return single line result in following pattern : name|description|metaDescription|metaKeywords|metaTitle|slug
  const localizedFields = [];
  localizedFields[TRANSLATION_FIELD_POS.NAME] = productName;
  localizedFields[TRANSLATION_FIELD_POS.DESCRIPTION] = productDescription;
  localizedFields[TRANSLATION_FIELD_POS.META_DESCRIPTION] =
    productMetaDescription;
  localizedFields[TRANSLATION_FIELD_POS.META_KEYWORDS] = productMetaKeywords;
  localizedFields[TRANSLATION_FIELD_POS.META_TITLE] = productMetaTitle;

  return localizedFields.join("|");
};

const transformProductAttributeToString = (masterVariantAttributeValue, language) => {
  if (Array.isArray(masterVariantAttributeValue)) {
    return masterVariantAttributeValue.map(attributeValue => {
      console.log(attributeValue)

      return attributeValue?.[language].toString() || ""
    })
  } else {
    return masterVariantAttributeValue?.[language]
  }
};

export { transformProductToString, transformProductAttributeToString };
