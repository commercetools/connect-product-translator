import { createApiRoot } from "./create.client.js";

export async function getStateByKey(stateKey) {
  const {
    body: { results: states },
  } = await createApiRoot()
    .states()
    .get({
      queryArgs: {
        where: `key = "${stateKey}"`,
        expand: ["transitions[*]"],
      },
    })
    .execute();

  return states[0];
}
