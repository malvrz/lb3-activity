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
            return Person.findById(access.userId, {include: ['tweets']})
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

    Person.follow = async function(req, id, next){
        const accessToken = req.query.access_token
        const { Followships } = Person.app.models

        return AccessToken.findById(accessToken).then(async access => {
            const filter = {
                followedId: id,
                followerId: access.userId
            }

            return await Followships.count(filter).then(c => {
                if (c === 0 && filter.followerId !== filter.followedId) {
                    return Followships.create(filter)
                }
            })
        })
    }
    Person.remoteMethod(
        'follow', {
            http: {
                path: '/:id/follow',
                verb: 'post'
            },
            accepts: [
                {arg: 'req', type: 'object', http: {source: 'req'}},
                {arg: 'id', type: 'string', required: true}
            ],
            returns: {arg:'data', type: 'Followships', root: true}
        }
    )

    Person.unfollow = async function(req, id){
        const accessToken = req.query.access_token
        const { Followships } = Person.app.models

        return AccessToken.findById(accessToken).then(async access => {
            const filter = {
                followedId: id,
                followerId: access.userId
            }
            const ret = await Followships.findOne({where: filter})
            if (ret) return await Followships.deleteById(ret.id)
        })
    }
    Person.remoteMethod(
        'unfollow', {
            http: {
                path: '/:id/unfollow',
                verb: 'post'
            },
            accepts: [
                {arg: 'req', type: 'object', http: {source: 'req'}},
                {arg: 'id', type: 'string', required: true}
            ]
        }
    )

    Person.getFollowers = async function(req, id){
        const accessToken = req.query.access_token

        return await AccessToken.findById(accessToken).then(async access => {
            const rec = await getFollowshipsId({followedId: id}, 'followerId')
            return Person.find(
                {
                    where: {id: {inq: [...rec]}}
                }
            )
        })
    }
    Person.remoteMethod(
        'getFollowers', {
            http: {
                path: '/:id/followers/list',
                verb: 'get'
            },
            accepts: [
                {arg: 'req', type: 'object', http: {source: 'req'}},
                {arg: 'id', type: 'string', required: true}
            ],
            returns: {arg:'data', type: 'Person', root: true}
        }
    )

    Person.getFollowing = async function(req, id) {
        const accessToken = req.query.access_token

        return await AccessToken.findById(accessToken).then(async access => {
            const rec = await getFollowshipsId({followerId: id}, 'followedId')
            return Person.find(
                {
                    where: {id: {inq: [...rec]}}
                }
            )
        })
    }
    Person.remoteMethod(
        'getFollowing', {
            http: {
                path: '/:id/following/list',
                verb: 'get'
            },
            accepts: [
                {arg: 'req', type: 'object', http: {source: 'req'}},
                {arg: 'id', type: 'string', required: true}
            ],
            returns: {arg:'data', type: 'Person', root: true}
        }
    )

    // ------ Private functions ----- //

    async function getFollowshipsId(filter, key) {
        const { Followships } = Person.app.models
        let ret = []

        return await Followships.find({where: filter}).then(async records => {
            const length = records.length
            for (var i = 0; i < length; i++) {
                ret.push(records[i][key])
            }
            return ret
        })
    }

    // ------ End of private functions ----- //

    Person.disableRemoteMethodByName('patchOrCreate')
    Person.disableRemoteMethodByName('create')
    Person.disableRemoteMethodByName('replaceOrCreate')
    Person.disableRemoteMethodByName('exists')
    Person.disableRemoteMethodByName('find')
    Person.disableRemoteMethodByName('findById')
    Person.disableRemoteMethodByName('findOne')
    Person.disableRemoteMethodByName('destroyById')
    Person.disableRemoteMethodByName('count')
    Person.disableRemoteMethodByName('replaceById')
    Person.disableRemoteMethodByName('createChangeStream')
    Person.disableRemoteMethodByName('updateAll')
    Person.disableRemoteMethodByName('prototype.patchAttributes')
    Person.disableRemoteMethodByName('upsertWithWhere')
    Person.disableRemoteMethodByName('resetPassword')
    Person.disableRemoteMethodByName('setPassword')
    Person.disableRemoteMethodByName('changePassword')
    Person.disableRemoteMethodByName('confirm')
    Person.disableRemoteMethodByName('prototype.verify')

    Person.disableRemoteMethodByName('prototype.__create__tweets')
    Person.disableRemoteMethodByName('prototype.__delete__tweets')
    Person.disableRemoteMethodByName('prototype.__findById__tweets')
    Person.disableRemoteMethodByName('prototype.__updateById__tweets')
    Person.disableRemoteMethodByName('prototype.__destroyById__tweets')
    Person.disableRemoteMethodByName('prototype.__count__tweets')

    Person.disableRemoteMethodByName('prototype.__create__followships')
    Person.disableRemoteMethodByName('prototype.__get__followships')
    Person.disableRemoteMethodByName('prototype.__delete__followships')
    Person.disableRemoteMethodByName('prototype.__findById__followships')
    Person.disableRemoteMethodByName('prototype.__updateById__followships')
    Person.disableRemoteMethodByName('prototype.__destroyById__followships')
    Person.disableRemoteMethodByName('prototype.__count__followships')
    Person.disableRemoteMethodByName('prototype.__exists__followships')
    Person.disableRemoteMethodByName('prototype.__link__followships')
    Person.disableRemoteMethodByName('prototype.__unlink__followships')

    Person.disableRemoteMethodByName('prototype.__get__accessTokens')
    Person.disableRemoteMethodByName('prototype.__create__accessTokens')
    Person.disableRemoteMethodByName('prototype.__delete__accessTokens')
    Person.disableRemoteMethodByName('prototype.__findById__accessTokens')
    Person.disableRemoteMethodByName('prototype.__updateById__accessTokens')
    Person.disableRemoteMethodByName('prototype.__destroyById__accessTokens')
    Person.disableRemoteMethodByName('prototype.__count__accessTokens')
};
