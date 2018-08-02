# CVS Spike

## AWS AppSync Offline

Create a proof of concept to show how AWS-AppSync and graphql can be used to store and syncronise data for an offline first progressive web application

To get the projec working locally you'll need to install git secrets as this is used as a prepush check to mitigate the release of secrets into the public. For more information check the [Git Secrets Github Repo](https://github.com/awslabs/git-secrets).

### Setup

- git clone repo
- npm install
- Create aws config file (aws-config.ts) in the root of the project.
  - The API url and key can be retreived from the cvs-spike api in AWS AppSync

```
EXAMPLE:
export default {
  graphqlEndpoint: "https://{{appsync-api-url}}",
  region: "eu-west-1",
  authenticationType: "API_KEY",
  apiKey: "{{xxx-xxx}}"
};
```

### Running the application

npm run ionic:serve
