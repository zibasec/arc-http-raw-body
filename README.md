# arc-http-raw-body

A plugin for [@architect/architect](https://arc.codes) that makes configured endpoints include an unparsed raw request body object as base64.

This is particularly useful when integrating with services that provide signed payloads that need verification. For example, [Stripe Webhooks](https://stripe.com/docs/webhooks/signatures).

## Installation

`npm install zibasec/arc-http-raw-body`

## Usage

You'll first need to install [`macro-custom-pragma-runner`](https://github.com/zibasec/macro-custom-pragma-runner)

Then use this pragma in your `.arc` file

```
@app
myApp

@http
post /hook

@macros
macro-custom-pragma-runner

@_zibasec/arc-http-raw-body
post /hook

@aws
region us-east-1
```

The values supplied under `@_zibasec/arc-http-raw-body` _must_ have a match under `@http`.

## What does it do, exactly?

Under the covers this will add an [API Gateway Mapping Template](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html) to your function and changes its [integration type](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-custom-integrations.html) in order to all for the mapping.

## License

[MIT](https://choosealicense.com/licenses/mit/)
