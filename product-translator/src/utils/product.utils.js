function getLocalizedStringAttributeNames(product) {
  const attributeDefinitions = product.productType.obj?.attributes;
  const localizedStringAttributeNames = attributeDefinitions
    .filter((attributeDefinition) => {
      return (
        attributeDefinition?.type?.name === "ltext" ||
        (attributeDefinition?.type?.name === "set" &&
          attributeDefinition?.type?.elementType?.name === "ltext")
      );
    })
    .map((attributeDefinition) => attributeDefinition.name);

  return localizedStringAttributeNames;
}

export { getLocalizedStringAttributeNames };
