const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { tokenService, userService } = require('../services');
const { User } = require('../models');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const mongoose = require('mongoose');
// config passport
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

// Login local
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest:
                ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
            secretOrKey: process.env.PASSPORT_JWT_ACCESS_TOKEN,
        },
        async (payload, done) => {
            try {
                const id = await mongoose.Types.ObjectId(payload.id);
                const tokenByUserId = await tokenService.findTokenByUserId(id);
                if (!tokenByUserId) return done(null, false);
                done(
                    null,
                    await userService.getUserProfile(
                        String(tokenByUserId.userId.toString())
                    )
                );
            } catch (error) {
                done(error, false);
            }
        }
    )
);

// oAuth google
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: `${
                process.env.DOMAIN_SERVER || 'http://localhost:5000'
            }/auth/google/callback`,
            passReqToCallback: true,
        },
        async (request, accessToken, refreshToken, profile, done) => {
            try {
                if (profile.id) {
                    const existingUser = await User.findOne({
                        googleId: profile.id,
                    }).select('-password');

                    if (existingUser) return done(null, existingUser);
                    const newUser = new User({
                        googleId: profile.id,
                        fistName: profile.family_name,
                        lastName: profile.given_name,
                        fullName: profile.displayName,
                    });

                    await newUser.save({ validateBeforeSave: false });
                    return done(null, newUser);
                }
            } catch (error) {
                return done(error, false);
            }
        }
    )
);
