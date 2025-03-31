import {auth} from "@clerk/nextjs/server";
import {createUploadthing, type FileRouter} from "uploadthing/next";
import {UploadThingError} from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  postImage: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const {userId} = await auth();
      if (!userId) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return {userId};
    })
    .onUploadComplete(async ({file}) => {
      try {
        return {fileUrl: file.ufsUrl};
      } catch (error) {
        console.error("Error in onUploadComplete", error);
        // Can also delete file
        throw error;
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
