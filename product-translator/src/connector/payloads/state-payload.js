import { STATES_MAP } from "../constants.js";

const requestTranslationStateDraft = {
  key: STATES_MAP.REQUEST_TRANSLATION,
  name: { en: "Request translation" },
  type: "ProductState",
  roles: [],
  transitions: [
    {
      typeId: "state",
      key: STATES_MAP.TRANSLATION_IN_PROGRESS,
    },
  ],
  initial: true,
};
const translationInProgressStateDraft = {
  key: STATES_MAP.TRANSLATION_IN_PROGRESS,
  name: { en: "Translation in progress" },
  type: "ProductState",
  roles: [],
  transitions: [
    {
      typeId: "state",
      key: STATES_MAP.TRANSLATED,
    },
    {
      typeId: "state",
      key: STATES_MAP.TRANSLATION_FAILED,
    },
  ],
  initial: false,
};
const translatedStateDraft = {
  key: STATES_MAP.TRANSLATED,
  name: { en: "Translated" },
  type: "ProductState",
  roles: [],
  initial: false,
};
const translationFailedStateDraft = {
  key: STATES_MAP.TRANSLATION_FAILED,
  name: { en: "Translation failed" },
  type: "ProductState",
  roles: [],
  initial: false,
};

export {
  requestTranslationStateDraft,
  translationInProgressStateDraft,
  translatedStateDraft,
  translationFailedStateDraft,
};
