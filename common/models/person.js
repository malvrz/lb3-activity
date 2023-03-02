'use strict';

const { AccessToken } = require("loopback");

module.exports = function(Person) {

    Person.signup = async function(email, password) {
        return await Person.create({email,password})
    }
    Person.remoteMethod(
        'signup', {
            http: {
                path: '/signup',
                verb: 'post'
            },
            accepts: [
                {arg: 'email', type: 'string', required: true},
                {arg: 'password', type: 'string', required: true}
            ],
            returns: {arg: 'data', type: 'Person', root: true}
        }
    )

    Person.profile = async function(req) {
        const accessToken = req.query.access_token

        return AccessToken.findById(accessToken).then(async access => {
            return Person.findById(access.userId)
        })
    }
    Person.remoteMethod(
        'profile', {
            http: {
                path: '/profile',
                verb: 'get'
            },
            accepts: [
                {arg: 'req', type: 'object', http: {source: 'req'}}
            ],
            returns: {arg: 'data', type: 'Person', root:true}
        }
    )

    Person.tweets = async function(req, content) {
        const accessToken = req.query.access_token
        const { Tweet } = Person.app.models
        
        return AccessToken.findById(accessToken).then(async access => {
            return Person.findById(access.userId).then(async person => {
                return Tweet.create({content, personId: person.id})
            })
        })
    }
    Person.remoteMethod(
        'tweets', {
            http: {
                path: '/tweets',
                verb: 'post'
            },
            accepts: [
                {arg: 'req', type: 'object', http: {source: 'req'}},
                {arg: 'content', type: 'string', required: true}
            ],
            returns: {arg:'data', type: 'Tweet', root: true}
        }
    )



};
