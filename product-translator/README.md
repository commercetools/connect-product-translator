# Product Translator
This module provides an application hosted on commercetools-provided infrastructure, which receives messages from [commercetools Subscription](https://docs.commercetools.com/api/projects/subscriptions). 

The module also provides scripts for post-deployment and pre-undeployment action. After deployment via connect service completed, [commercetools Subscription](https://docs.commercetools.com/api/projects/subscriptions) is created by post-deployment script which listen to any state changes under specific product.
Once the state of product is changed to 'Request Translation', the commercetools Subscription sends message to Google Cloud Pub/Sub topic and then notify the product translator to handle the corresponding product translation. The commercetools Subscription would be cleared once the search connector is undeployed.

When product translator starts to process the translation, it would update the state to 'Translation in process'. 

The translation can be divided into two processes, which are executed asynchronously in parallel:
- Product Translation
- Variants Translation

## Product Translation
The translator concatenates the following product fields into a single-line text with separator '[#]':
1. Product Name
2. Product Description
3. Meta Description
4. Meta Keywords
5. Meta Title

The translator feeds the single-line text into OpenAI platform for translation. The translated texts in different languages are then updated to the corresponding product fields.

Slug is not translated because special characters are not allowed. Users need to define the slug manually for different languages.

## Variants Translation
Firstly, the translator determines which attributes belong to [LocalizedString](https://docs.commercetools.com/api/types#localizedstring) type by fetching product type of the product. The translator then send each `LocalizedString` type attribute of every variants to OpenAI platform translation.
After the translation, the translated attributes are updated to the corresponding [ProductVariant](https://docs.commercetools.com/api/projects/products#productvariant).   
 
## Get started
#### Change the key of commercetools Subscription
Please specify your desired key for creation of commercetools Subscription [here](https://github.com/commercetools/connect-product-translator/blob/21edf196be6ffccd90c6a68350e4f2b9dc724a49/product-translator/src/connector/constants.js#L2).
#### Install dependencies
```
$ npm install
```
#### Run unit test
```
$ npm run test
```
#### Run the application in local environment
```
$ npm run start
```
#### Run post-deploy script in local environment
```
$ npm run connector:post-deploy
```
#### Run pre-undeploy script in local environment
```
$ npm run connector:pre-undeploy
```

## Development in local environment
Different from staging and production environments, in which the out-of-the-box settings and variables have been set by connect service during deployment, the product translator connect application requires additional operations in local environment for development.
#### Create Google Cloud pub/sub topic and subscription
When an event-type connector application is deployed via connect service, a GCP pub/sub topic and subscription are created automatically. However it does not apply on local environment. To develop the product translator connect application in local environment, you need to follow the steps below:
1. Create a Pub/Sub topic and subscription in Google Cloud platform.
2. Use HTTP tunnel tools like [ngrok](https://ngrok.com/docs/getting-started) to expose your local development server to internet.
3. Set the URL provided by the tunnel tool as the destination of GCP subscription, so that message can be forwarded to the incremental updater in your local environment.  

For details, please refer to the [Overview of the GCP Pub/Sub service](https://cloud.google.com/pubsub/docs/pubsub-basics).

#### Set the required environment variables

Before starting the development, we advise users to create a .env file in order to help them in local development.
      
For that, we also have a template file .env.example with the required environment variables for the project to run successfully. To make it work, rename the file from `.env.example` to `.env`. Remember to fill the variables with your values.

In addition, following two environment variables in `.env.example` are not needed to be provided by users during staging or production deployment. 
```
CONNECT_GCP_TOPIC_NAME=<your-gcp-topic-name>
CONNECT_GCP_PROJECT_ID=<your-gcp-project-id>
```
It is because they are only required in local development server. For staging or production environment, connect service sets the Pub/Sub topic name and GCP project ID into these environment variables automatically after the Pub/Sub service has been created in Google Cloud platform.

   

      
