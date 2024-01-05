# connect-product-translator
This is a connect application which aims at translating localized texts of a specific product and its variants into different languages supported by composable commerce project. The translation is powered by [OpenAI](https://openai.com/).

This connector uses the [Product type](https://docs.commercetools.com/api/projects/productTypes), [Product](https://docs.commercetools.com/api/projects/products) and  [State](https://docs.commercetools.com/api/projects/states) data models from composable commerce which can be used for translating various texts and variant attributes of a product when specific state of the product is set. Connector is based on asynchronous [Subscriptions](https://docs.commercetools.com/api/projects/subscriptions) to run the translation process.

## Connector Features
- NodeJS supported.
- Uses Express as web server framework.
- Uses [commercetools SDK](https://docs.commercetools.com/sdk/js-sdk-getting-started) for the commercetools-specific communication.
- Includes local development utilities in npm commands to build, start, test, lint & prettify code.
- Uses JSON formatted logger with log levels

## Prerequisite
#### 1. commercetools composable commerce API client
Users are expected to create API client responsible for changing state, fetching product type, fetching and updating product from composable commerce project. API client should have enough scope to be able to do so. These API client details are taken as input as an environment variable/ configuration for connect. Details of compsable commerce project can be provided as environment variables (configuration for connect) `CTP_PROJECT_KEY` , `CTP_CLIENT_ID`, `CTP_CLIENT_SECRET`, `CTP_SCOPE`, `CTP_REGION`. For details, please read [Deployment Configuration](./README.md#Deployment Configuration).

#### 2. commercetools composable commerce language setup
Users are expected to define the languages supported in the composable commerce project.

#### 3. commercetools composable commerce product details setup
Users are expected to fill in the text values in the product and its variant attributes with default language. The connect application defines the source language for translation by adapting the language with non-empty value in product name.

#### 4. external system
Users are expected to provide API token in OpenAI. Those details are taken as input as an environment variable / configuration for connect. The API token of OpenAI can be provided as environment variables (configuration for connect) `OPENAI_API_KEY`.For details, please read [Deployment Configuration](./README.md#Deployment Configuration).

 
## Getting started
The connect application contains one event-driven module : 
- Product Translator : Receives message from commercetools project once the state of a specific product is set as 'Request Translation'. The localized texts of the product are then translated into different languages supported by the project.

Regarding the development of this module, please refer to the following documentation:
- Development of Product Translator

#### Register as connector in commercetools Connect
Follow guidelines [here](https://docs.commercetools.com/connect/getting-started) to register the connector for public/private use.

## Deployment Configuration
In order to deploy your customized connector application on commercetools Connect, it needs to be published. For details, please refer to [documentation about commercetools Connect](https://docs.commercetools.com/connect/concepts)
In addition, in order to support connect, the search connector template has a folder structure as listed below
```
├── product-translator
│   ├── src
│   ├── test
│   └── package.json
└── connect.yaml
```

Connect deployment configuration is specified in `connect.yaml` which is required information needed for publishing of the application. Following is the deployment configuration used by full ingestion and incremental updater modules
```
deployAs:
  - name: product-translator
    applicationType: event
    endpoint: /productTranslator
    scripts:
      postDeploy: npm install && npm run connector:post-deploy
      preUndeploy: npm install && npm run connector:pre-undeploy
    configuration:
      standardConfiguration:
        - key: CTP_REGION
          description: commercetools Composable Commerce API region
      securedConfiguration:
        - key: CTP_PROJECT_KEY
          description: commercetools Composable Commerce project key
        - key: CTP_CLIENT_ID
          description: commercetools Composable Commerce client ID
        - key: CTP_CLIENT_SECRET
          description: commercetools Composable Commerce client secret
        - key: CTP_SCOPE
          description: commercetools Composable Commerce client scope
        - key: OPENAI_API_KEY
          description: API token used to communicate with OpenAI platform
```

Here you can see the details about various variables in configuration
- CTP_PROJECT_KEY: The key of commercetools project.
- CTP_CLIENT_ID: The client ID of your commercetools user account. It is used in commercetools client to communicate with commercetools platform via SDK.
- CTP_CLIENT_SECRET: The client secret of commercetools user account. It is used in commercetools client to communicate with commercetools platform via SDK.
- CTP_SCOPE: The scope constrains the endpoints to which the commercetools client has access, as well as the read/write access right to an endpoint.
- CTP_REGION: As the commercetools APIs are provided in six different region, it defines the region which your commercetools user account belongs to.
- OPENAI_API_KEY: It defines the API token which is used to communicate with OpenAI platform.