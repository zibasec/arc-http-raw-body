const debug = require('debug')('arc-http-raw-body')

const requestTemplates = {
  'application/json': `## Configured using rawBody via @architect/architect
#set($allParams = $input.params())
{
  "raw": "$input.body",
  "body-json" : $input.json('$'),
  "params" : {
    #foreach($type in $allParams.keySet())
      #set($params = $allParams.get($type))
    "$type" : {
        #foreach($paramName in $params.keySet())
        "$paramName" : "$util.escapeJavaScript($params.get($paramName))"
            #if($foreach.hasNext),#end
        #end
    }
      #if($foreach.hasNext),#end
    #end
    },
    "stage-variables" : {
      foreach($key in $stageVariables.keySet())
      "$key" : "$util.escapeJavaScript($stageVariables.get($key))"
        #if($foreach.hasNext),#end
      #end
    },
    "context" : {
      "account-id" : "$context.identity.accountId",
      "api-id" : "$context.apiId",
      "api-key" : "$context.identity.apiKey",
      "authorizer-principal-id" : "$context.authorizer.principalId",
      "caller" : "$context.identity.caller",
      "cognito-authentication-provider" : "$context.identity.cognitoAuthenticationProvider",
      "cognito-authentication-type" : "$context.identity.cognitoAuthenticationType",
      "cognito-identity-id" : "$context.identity.cognitoIdentityId",
      "cognito-identity-pool-id" : "$context.identity.cognitoIdentityPoolId",
      "http-method" : "$context.httpMethod",
      "stage" : "$context.stage",
      "source-ip" : "$context.identity.sourceIp",
      "user" : "$context.identity.user",
      "user-agent" : "$context.identity.userAgent",
      "user-arn" : "$context.identity.userArn",
      "request-id" : "$context.requestId",
      "resource-id" : "$context.resourceId",
      "resource-path" : "$context.resourcePath"
    }
  }"`
}

const capitalize = s => s[0].toUpperCase() + s.slice(1)

module.exports = async function ({ arc, cloudformation, stage, args }) {
  const appName = arc.app[0]
  debug(`Running against ${appName}`)
  const cfPaths = cloudformation.Resources[capitalize(appName)].Properties.DefinitionBody.paths

  args.map(arg => {
    const [method, path] = arg
    debug(`Received args method => ${method} and path => ${path}`)
    if (!cfPaths[path][method]) {
      throw new Error(`Could not find path "${path}" with method "${method}" in the arc-generated
      Cloudformation Template. Ensure you've defined the methods you want to use this pragma with.`)
    }

    // change integration type to 'aws'
    cloudformation.Resources[capitalize(appName)].Properties.DefinitionBody
      .paths[path][method]['x-amazon-apigateway-integration'].type = 'aws'

    // adds template that proxies the raw request body
    cloudformation.Resources[capitalize(appName)].Properties.DefinitionBody
      .paths[path][method]['x-amazon-apigateway-integration'].requestTemplates = requestTemplates
  })
  return { cloudformation }
}
