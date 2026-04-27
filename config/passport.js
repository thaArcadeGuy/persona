const passport = require("passport")
const GitHubStrategy = require("passport-github2").Strategy
const User = require("../models/user.model")

passport.use(
  new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/github/callback"
  },
   async function(accessToken, refreshToken, profile, done) {
    try {
      const user = await User.findOne({ github_id: profile.id })
      if (user) {
        user.last_login_at = new Date()
        await user.save()

        return done(null, user)
      }

      const newUser = await User.create({
        github_id: profile.id,
        username: profile.username,
        email: profile.emails[0].value,
        avatar_url: profile.photos[0].value,
        last_login_at: new Date()
      })

      return done(null, newUser)
  
    } catch (error) {
      return done(error, null);
    }
  })
)