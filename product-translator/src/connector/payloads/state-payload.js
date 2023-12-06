import { STATES } from "../../constants/states.constants.js";

const requestTranslationStateDraft = {
  key: STATES.REQUEST_TRANSLATION,
  name: { en: "Request translation" },
  type: "ProductState",
  roles: [],
  transitions: [
    {
      typeId: "state",
      key: STATES.TRANSLATION_IN_PROCESS,
    },
  ],
  initial: true,
};
const translationInProcessStateDraft = {
  key: STATES.TRANSLATION_IN_PROCESS,
  name: { en: "Translation in process" },
  type: "ProductState",
  roles: [],
  transitions: [
    {
      typeId: "state",
      key: STATES.TRANSLATED,
    },
    {
      typeId: "state",
      key: STATES.TRANSLATION_FAILED,
    },
  ],
  initial: false,
};
const translatedStateDraft = {
  key: STATES.TRANSLATED,
  name: { en: "Translated" },
  type: "ProductState",
  roles: [],
  initial: false,
};
const translationFailedStateDraft = {
  key: STATES.TRANSLATION_FAILED,
  name: { en: "Translation failed" },
  type: "ProductState",
  roles: [],
  initial: false,
};

export {
  requestTranslationStateDraft,
  translationInProcessStateDraft,
  translatedStateDraft,
  translationFailedStateDraft,
};
