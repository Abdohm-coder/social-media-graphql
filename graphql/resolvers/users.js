const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { GraphQLError } = require("graphql");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/validators");
const { SECRET_KEY } = require("../../config");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}

module.exports = {
  Mutation: {
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      // TODO: Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );

      if (!valid)
        throw new GraphQLError("Errors", {
          extensions: {
            code: "FORBIDDEN",
          },
          errors,
        });

      // TODO: Make sure user doesn't already exist
      const user = await User.findOne({ username });

      if (user) {
        throw new GraphQLError("This username is taken", {
          extensions: {
            code: "FORBIDDEN",
          },
          errors,
        });
      }
      // Hash the password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        username,
        email,
        password,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) throw new GraphQLError("Errors", {
        extensions: {
          code: "FORBIDDEN",
        },
        errors,
      });

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = "User not found!";
        throw new GraphQLError("User not found!", {
          extensions: {
            code: "FORBIDDEN",
          },
          errors
        });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong credentials";
        throw new GraphQLError("Wrong credentials", {
          extensions: {
            code: "FORBIDDEN",
          },
          errors,
        });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
  },
};
