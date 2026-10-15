const User = require('../models/user.model');
const crypto = require('crypto');
const { _issueTokens } = require('./user.service')

const googleRedirect = async() => {
  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id : process.env.CLIENT_ID,
    redirect_uri : process.env.REDIRECT_URI,
    response_type:'code',
    scope : 'openid email profile',
    state,
    access_type : 'offline',
    prompt : 'consent'
  })

  return {
    state, 
    params
  }
}

const googleCallback = async(profile, meta) => {
 let user = await User.findOne({googleId : profile.sub});
 if(!user){
    user = await User.findOne({email : profile.email})

    if(user){
        user.googleId = profile.sub;
        await user.save()
    }else{
        user = await User.create({
            name : profile.name,
            email : profile.email,
            googleId : profile.sub,
            provider : 'google'
        })
    }
 }
 const tokens = await _issueTokens(user, meta);

 return tokens


}

module.exports = {
    googleRedirect,
    googleCallback
}