"use server";

import {prisma} from "@/lib/prisma";
import {getDbUserId} from "./user.action";
import {revalidatePath} from "next/cache";

export async function createPost(content: string, image: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorId: userId,
      },
    });

    revalidatePath("/");
    return {success: true, post};
  } catch (error) {
    console.log("Failed to create post:", error);
    return {success: false, error: "Failed to create post"};
  }
}

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        // comments author
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return posts;
  } catch (error) {
    console.error("Error in getPosts: ", error);
    throw new Error("Error fetching posts.");
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    // check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {authorId: true},
    });

    if (!post) throw new Error("Post not found");

    // If existing like exists delete it, otherwise like it
    if (existingLike) {
      // unlike
      await prisma.$transaction(async (tx) => {
        await tx.like.delete({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
        });
      });
    } else {
      // like and create notification (only if liking someone else's post)
      await prisma.$transaction(async (tx) => {
        await tx.like.create({
          data: {
            userId,
            postId,
          },
        });

        // Create notification if not owner of post
        if (post.authorId !== userId) {
          await tx.notification.create({
            data: {
              type: "LIKE",
              userId: post.authorId, // post author
              creatorId: userId, // person who liked
              postId,
            },
          });
        }
      });
    }

    revalidatePath("/");
    return {success: true};
  } catch (err) {
    console.error(err);
    console.log("Error liking post", err);
    return {success: false, message: "Error liking post"};
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;
    if (!content) throw new Error("Comment is required.");

    const post = await prisma.post.findUnique({
      where: {id: postId},
      select: {authorId: true},
    });

    if (!post) throw new Error("Post not found");

    // Create comment and notification using transaction
    const [comment] = await prisma.$transaction(async (tx) => {
      // Create new comment
      const newComment = await prisma.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });

      // Create notification if commenting in someone else's post
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId, // post author
            creatorId: userId, // person who commented
            postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath("/");
    return {success: true, comment};
  } catch (error) {
    console.log("Error in createComment: ", error);
    return {success: false, error: "Error creating comment."};
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    const post = await prisma.post.findUnique({
      where: {id: postId},
      select: {authorId: true},
    });

    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Unauthorized - not owner of the post");

    await prisma.post.delete({
      where: {id: postId},
    });

    revalidatePath("/");
    return {success: true};
  } catch (error) {
    console.error("Error in deletePost: ", error);
    return {success: false, error: "Error deleting post."};
  }
}
