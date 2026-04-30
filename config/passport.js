const passport = require("passport")
const GitHubStrategy = require("passport-github2").Strategy
const User = require("../models/user.model")

passport.use(
  new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
   async function(accessToken, refreshToken, profile, done) {
    try {
      console.log("PROFILE FROM GITHUB:", JSON.stringify(profile, null, 2))
      const user = await User.findOne({ github_id: profile.id })
      if (user) {
        user.last_login_at = new Date()
        await user.save()

        return done(null, user)
      }

      const newUser = await User.create({
        github_id: profile.id,
        username: profile.username,
        email: profile.emails?.[0]?.value || profile._json?.email || null,
        avatar_url: profile.photos?.[0]?.value || profile._json?.avatar_url || null,
        last_login_at: new Date()
      })

      return done(null, newUser)
  
    } catch (error) {
      return done(error, null);
    }
  })
)