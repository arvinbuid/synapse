"use server";

import {prisma} from "@/lib/prisma";
import {auth} from "@clerk/nextjs/server";
import {revalidatePath} from "next/cache";
import {getDbUserId} from "./user.action";

export async function getProfileByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {username: username},
      select: {
        id: true,
        name: true,
        bio: true,
        image: true,
        username: true,
        location: true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get user profile.");
  }
}

export async function getUserPosts(userId: string) {
  try {
    const post = await prisma.post.findMany({
      where: {authorId: userId},
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
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
          orderBy: {createdAt: "asc"},
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {createdAt: "desc"},
    });

    return post;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get user posts.");
  }
}

export async function getUserLikedPosts(userId: string) {
  try {
    const likedPosts = await prisma.post.findMany({
      where: {
        likes: {
          some: {
            userId,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {createdAt: "asc"},
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {createdAt: "desc"},
    });

    return likedPosts;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get user liked posts.");
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const {userId: clerkId} = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    // name, bio, location, website
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;

    const user = await prisma.user.update({
      where: {clerkId},
      data: {
        name,
        bio,
        location,
        website,
      },
    });

    revalidatePath("/profile");
    return {success: true, user};
  } catch (error) {
    console.error("Error in updateProfile: ", error);
    return {success: false, message: "Failed to update profile"};
  }
}

export async function isFollowing(userId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return false;

    // Check if current user is following the target user
    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    return !!follow; // Convert follow object to a boolean
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}
