const AWS = require('aws-sdk');
const { ethers, providers } = require('ethers');
const { getHTTPendpoint, getSSMParam } = require('./utils')
const AWSHttpProvider = require('./aws-web3-http-provider');
const abi = require('./NFTSamples/NFT_BaseURI.json').abi;

const nodeId = process.env.nodeId;
const networkId = process.env.networkId;
const defaultEnv = process.env.ENV || "AWS";
/*
* Copyright 2015-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
*
*     http://aws.amazon.com/apache2.0/
*
* or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const getProvider = async (env = defaultEnv) =>  {
  if (env == "AWS") {
    let endpoint = await getHTTPendpoint(nodeId,networkId)
    endpoint = `https://${endpoint}`;
    const baseProvider = new AWSHttpProvider(endpoint);
    const provider = new providers.Web3Provider(baseProvider);
    return provider;
  }
  else {
    const infura = new providers.InfuraProvider("rinkeby")
    return infura;
  }
}

const getPolicy = (methodArn, principalId, deny = true) => {
  // build apiOptions for the AuthPolicy
  var apiOptions = {};
  var tmp = methodArn.split(':');
  var apiGatewayArnTmp = tmp[5].split('/');
  var awsAccountId = tmp[4];
  apiOptions.region = tmp[3];
  apiOptions.restApiId = apiGatewayArnTmp[0];
  apiOptions.stage = apiGatewayArnTmp[1];
  var method = apiGatewayArnTmp[2];
  var resource = '/'; // root resource
  if (apiGatewayArnTmp[3]) {
      resource += apiGatewayArnTmp.slice(3, apiGatewayArnTmp.length).join('/');
  }

  var policy = new AuthPolicy(principalId, awsAccountId, apiOptions);
  if (deny) { // check if the signer is the owner of the token   
    policy.denyAllMethods();
  }
  else {
    policy.allowMethod(AuthPolicy.HttpVerb.GET, "/assets/*");
  }
  var authResponse = policy.build();
}

exports.handler = async function(event, context) {
    // Do not print the auth token unless absolutely necessary
    // console.log('Client token: ' + event.authorizationToken);
    console.log('Event: ' + JSON.stringify(event));

    const signBuff = Buffer.from(event.authorizationToken, 'base64')
    const signature = JSON.parse(signBuff.toString())
    
    const resultAddress = ethers.utils.verifyMessage(signature.msg, signature.sig)

    console.log(`signature address:${resultAddress}, event address:${signature.address}`)

    // TOOD: if verification failed, return 401. if succeeded check if the address is the owner of the request nft (from message), 

    var principalId = signature.address

    if (resultAddress != signature.address) {
      throw new Error("Unauthorized")
    }
    
    const messageDetails = JSON.parse(signature.msg)

    if (!messageDetails.contractAddress) {
      throw new Error("No contract address specified");
    }

    const provider = await getProvider()

    const nft_contract = new ethers.Contract(messageDetails.contractAddress, abi, provider);
    const tokenOwnerAddress =  await nft_contract.ownerOf(messageDetails.tokenId)

    console.log(`request token: ${messageDetails.tokenId}; contract address: ${messageDetails.contractAddress}, token Owner ${address}`)
      // if access is denied, the client will receive a 403 Access Denied response
    // if access is allowed, API Gateway will proceed with the backend integration configured on the method that was called
    const authResponse = getPolicy(event.methodArn, principalId, tokenOwnerAddress != signature.address)
    

    // // new! -- add additional key-value pairs
    // // these are made available by APIGW like so: $context.authorizer.<key>
    // // additional context is cached
    // authResponse.context = {
    //   key : 'value', // $context.authorizer.key -> value
    //   number : 1,
    //   bool: true
    // };

    return authResponse
  } 

/**
 * AuthPolicy receives a set of allowed and denied methods and generates a valid
 * AWS policy for the API Gateway authorizer. The constructor receives the calling
 * user principal, the AWS account ID of the API owner, and an apiOptions object.
 * The apiOptions can contain an API Gateway RestApi Id, a region for the RestApi, and a
 * stage that calls should be allowed/denied for. For example
 * {
 *   restApiId: "xxxxxxxxxx",
 *   region: "us-east-1",
 *   stage: "dev"
 * }
 *
 * var testPolicy = new AuthPolicy("[principal user identifier]", "[AWS account id]", apiOptions);
 * testPolicy.allowMethod(AuthPolicy.HttpVerb.GET, "/users/username");
 * testPolicy.denyMethod(AuthPolicy.HttpVerb.POST, "/pets");
 * context.succeed(testPolicy.build());
 *
 * @class AuthPolicy
 * @constructor
 */
function AuthPolicy(principal, awsAccountId, apiOptions) {
    /**
     * The AWS account id the policy will be generated for. This is used to create
     * the method ARNs.
     *
     * @property awsAccountId
     * @type {String}
     */
    this.awsAccountId = awsAccountId;

    /**
     * The principal used for the policy, this should be a unique identifier for
     * the end user.
     *
     * @property principalId
     * @type {String}
     */
    this.principalId = principal;

    /**
     * The policy version used for the evaluation. This should always be "2012-10-17"
     *
     * @property version
     * @type {String}
     * @default "2012-10-17"
     */
    this.version = "2012-10-17";

    /**
     * The regular expression used to validate resource paths for the policy
     *
     * @property pathRegex
     * @type {RegExp}
     * @default '^\/[/.a-zA-Z0-9-\*]+$'
     */
    this.pathRegex = new RegExp('^[/.a-zA-Z0-9-\*]+$');

    // these are the internal lists of allowed and denied methods. These are lists
    // of objects and each object has 2 properties: A resource ARN and a nullable
    // conditions statement.
    // the build method processes these lists and generates the approriate
    // statements for the final policy
    this.allowMethods = [];
    this.denyMethods = [];

    if (!apiOptions || !apiOptions.restApiId) {
    // Replace the placeholder value with a default API Gateway API id to be used in the policy. 
    // Beware of using '*' since it will not simply mean any API Gateway API id, because stars will greedily expand over '/' or other separators. 
    // See https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_resource.html for more details.
      this.restApiId = "<<restApiId>>"; 
    } else {
      this.restApiId = apiOptions.restApiId;
    }
    if (!apiOptions || !apiOptions.region) {
    // Replace the placeholder value with a default region to be used in the policy. 
    // Beware of using '*' since it will not simply mean any region, because stars will greedily expand over '/' or other separators. 
    // See https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_resource.html for more details. 
      this.region = "<<region>>";
    } else {
      this.region = apiOptions.region;
    }
    if (!apiOptions || !apiOptions.stage) {
    // Replace the placeholder value with a default stage to be used in the policy. 
    // Beware of using '*' since it will not simply mean any stage, because stars will greedily expand over '/' or other separators. 
    // See https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_resource.html for more details. 
      this.stage = "<<stage>>";
    } else {
      this.stage = apiOptions.stage;
    }
};

/**
 * A set of existing HTTP verbs supported by API Gateway. This property is here
 * only to avoid spelling mistakes in the policy.
 *
 * @property HttpVerb
 * @type {Object}
 */
 AuthPolicy.HttpVerb = {
   GET     : "GET",
   POST    : "POST",
   PUT     : "PUT",
   PATCH   : "PATCH",
   HEAD    : "HEAD",
   DELETE  : "DELETE",
   OPTIONS : "OPTIONS",
   ALL     : "*"
 };

AuthPolicy.prototype = (function() {
  /**
   * Adds a method to the internal lists of allowed or denied methods. Each object in
   * the internal list contains a resource ARN and a condition statement. The condition
   * statement can be null.
   *
   * @method addMethod
   * @param {String} The effect for the policy. This can only be "Allow" or "Deny".
   * @param {String} he HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param {String} The resource path. For example "/pets"
   * @param {Object} The conditions object in the format specified by the AWS docs.
   * @return {void}
   */
  var addMethod = function(effect, verb, resource, conditions) {
    if (verb != "*" && !AuthPolicy.HttpVerb.hasOwnProperty(verb)) {
      throw new Error("Invalid HTTP verb " + verb + ". Allowed verbs in AuthPolicy.HttpVerb");
    }

    if (!this.pathRegex.test(resource)) {
      throw new Error("Invalid resource path: " + resource + ". Path should match " + this.pathRegex);
    }

    var cleanedResource = resource;
    if (resource.substring(0, 1) == "/") {
        cleanedResource = resource.substring(1, resource.length);
    }
    var resourceArn = "arn:aws:execute-api:" +
      this.region + ":" +
      this.awsAccountId + ":" +
      this.restApiId + "/" +
      this.stage + "/" +
      verb + "/" +
      cleanedResource;

    if (effect.toLowerCase() == "allow") {
      this.allowMethods.push({
        resourceArn: resourceArn,
        conditions: conditions
      });
    } else if (effect.toLowerCase() == "deny") {
      this.denyMethods.push({
        resourceArn: resourceArn,
        conditions: conditions
      })
    }
  };

  /**
   * Returns an empty statement object prepopulated with the correct action and the
   * desired effect.
   *
   * @method getEmptyStatement
   * @param {String} The effect of the statement, this can be "Allow" or "Deny"
   * @return {Object} An empty statement object with the Action, Effect, and Resource
   *                  properties prepopulated.
   */
  var getEmptyStatement = function(effect) {
    effect = effect.substring(0, 1).toUpperCase() + effect.substring(1, effect.length).toLowerCase();
    var statement = {};
    statement.Action = "execute-api:Invoke";
    statement.Effect = effect;
    statement.Resource = [];

    return statement;
  };

  /**
   * This function loops over an array of objects containing a resourceArn and
   * conditions statement and generates the array of statements for the policy.
   *
   * @method getStatementsForEffect
   * @param {String} The desired effect. This can be "Allow" or "Deny"
   * @param {Array} An array of method objects containing the ARN of the resource
   *                and the conditions for the policy
   * @return {Array} an array of formatted statements for the policy.
   */
  var getStatementsForEffect = function(effect, methods) {
    var statements = [];

    if (methods.length > 0) {
      var statement = getEmptyStatement(effect);

      for (var i = 0; i < methods.length; i++) {
        var curMethod = methods[i];
        if (curMethod.conditions === null || curMethod.conditions.length === 0) {
          statement.Resource.push(curMethod.resourceArn);
        } else {
          var conditionalStatement = getEmptyStatement(effect);
          conditionalStatement.Resource.push(curMethod.resourceArn);
          conditionalStatement.Condition = curMethod.conditions;
          statements.push(conditionalStatement);
        }
      }

      if (statement.Resource !== null && statement.Resource.length > 0) {
        statements.push(statement);
      }
    }

    return statements;
  };

  return {
    constructor: AuthPolicy,

    /**
     * Adds an allow "*" statement to the policy.
     *
     * @method allowAllMethods
     */
    allowAllMethods: function() {
      addMethod.call(this, "allow", "*", "*", null);
    },

    /**
     * Adds a deny "*" statement to the policy.
     *
     * @method denyAllMethods
     */
    denyAllMethods: function() {
      addMethod.call(this, "deny", "*", "*", null);
    },

    /**
     * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
     * methods for the policy
     *
     * @method allowMethod
     * @param {String} The HTTP verb for the method, this should ideally come from the
     *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
     * @param {string} The resource path. For example "/pets"
     * @return {void}
     */
    allowMethod: function(verb, resource) {
      addMethod.call(this, "allow", verb, resource, null);
    },

    /**
     * Adds an API Gateway method (Http verb + Resource path) to the list of denied
     * methods for the policy
     *
     * @method denyMethod
     * @param {String} The HTTP verb for the method, this should ideally come from the
     *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
     * @param {string} The resource path. For example "/pets"
     * @return {void}
     */
    denyMethod : function(verb, resource) {
      addMethod.call(this, "deny", verb, resource, null);
    },

    /**
     * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
     * methods and includes a condition for the policy statement. More on AWS policy
     * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
     *
     * @method allowMethodWithConditions
     * @param {String} The HTTP verb for the method, this should ideally come from the
     *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
     * @param {string} The resource path. For example "/pets"
     * @param {Object} The conditions object in the format specified by the AWS docs
     * @return {void}
     */
    allowMethodWithConditions: function(verb, resource, conditions) {
      addMethod.call(this, "allow", verb, resource, conditions);
    },

    /**
     * Adds an API Gateway method (Http verb + Resource path) to the list of denied
     * methods and includes a condition for the policy statement. More on AWS policy
     * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
     *
     * @method denyMethodWithConditions
     * @param {String} The HTTP verb for the method, this should ideally come from the
     *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
     * @param {string} The resource path. For example "/pets"
     * @param {Object} The conditions object in the format specified by the AWS docs
     * @return {void}
     */
    denyMethodWithConditions : function(verb, resource, conditions) {
      addMethod.call(this, "deny", verb, resource, conditions);
    },

    /**
     * Generates the policy document based on the internal lists of allowed and denied
     * conditions. This will generate a policy with two main statements for the effect:
     * one statement for Allow and one statement for Deny.
     * Methods that includes conditions will have their own statement in the policy.
     *
     * @method build
     * @return {Object} The policy object that can be serialized to JSON.
     */
    build: function() {
      if ((!this.allowMethods || this.allowMethods.length === 0) &&
          (!this.denyMethods || this.denyMethods.length === 0)) {
        throw new Error("No statements defined for the policy");
      }

      var policy = {};
      policy.principalId = this.principalId;
      var doc = {};
      doc.Version = this.version;
      doc.Statement = [];

      doc.Statement = doc.Statement.concat(getStatementsForEffect.call(this, "Allow", this.allowMethods));
      doc.Statement = doc.Statement.concat(getStatementsForEffect.call(this, "Deny", this.denyMethods));

      policy.policyDocument = doc;

      return policy;
    }
  };

})();
