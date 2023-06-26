const { GraphQLError } = require("graphql");
const Post = require("../../models/Post");
const checkAuth = require("../../utils/check-auth");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = checkAuth(context);

      if (body.trim() === "") {
        throw new GraphQLError("Empty comment", {
          extensions: {
            code: "FORBIDDEN",
          },
          errors: {
            body: "Comment body must not empty",
          },
        });
      }

      const post = await Post.findById(postId);

      if (post) {
        post.comments.unshift({
          username,
          body,
          createdAt: new Date().toISOString(),
        });

        await post.save();
        return post;
      } else {
        throw new GraphQLError("Post not found", {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      }
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);

      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);

        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new GraphQLError("Action not allowed", {
            extensions: {
              code: "UNAUTHENTICATED",
            },
          });
        }
      } else {
        throw new GraphQLError("Post not found", {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      }
    },
  },
};
