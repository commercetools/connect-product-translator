export const requestTranslationStatePayload = {
  key: "ct-connect-product-request-translation",
  name: { en: "Request translation" },
  type: "ProductState",
  roles: [],
  transitions: [
    {
      typeId: "state",
      key: "ct-connect-product-translated",
    },
  ],
  initial: true,
};
export const inTranslationStatePayload = {
  key: "ct-connect-product-translation-in-progress",
  name: { en: "Translation in progress" },
  type: "ProductState",
  roles: [],
  transitions: [
    {
      typeId: "state",
      key: "ct-connect-product-translated",
    },
    {
      typeId: "state",
      key: "ct-connect-product-translation-failed",
    },
  ],
  initial: false,
};
export const translatedStatePayload = {
  key: "ct-connect-product-translated",
  name: { en: "Translated" },
  type: "ProductState",
  roles: [],
  initial: false,
};
export const translationFailedStatePayload = {
  key: "ct-connect-product-translation-failed",
  name: { en: "Translation failed" },
  type: "ProductState",
  roles: [],
  initial: false,
};
