import zod, { string, z } from "zod"


export const SignUpSchema = zod.object({
    email: z.string(),
    password: z.string().min(6),
    username: z.string(),
})


export const SignInSchema = zod.object({
    email: z.string(),
    password: z.string()
})


export const VideoFeedQuerySchema = z.object({
  videos: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      thumbnail_url: z.string().nullable(),
      creator: z.object({
        id: z.string().uuid(),
        username: z.string(),
      }),
      view_count: z.number().int().nonnegative(),
      created_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      }),
    })
  ),
  total_pages: z.number().int().nonnegative(),
  current_page: z.number().int().nonnegative(),
});



export const ChannelSchema = zod.object({
    name: z.string(),
    description: z.string(),
    slug: z.string()
})


export const GetChannelSchema = zod.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    subscriber_count: z.number(),
    video: z.array(z.object({
        id: z.string(),
        title: z.string(),
        thumbnail_url: z.string().url()
    }))
})

export const VideoInputSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.string(),
  });

  export const UploadVideoSchema = z.object({
    id: z.string(),
    title: z.string(),
    processing_status: z.enum(["PROCESSING", "TRANSCODED"]), // Enum for predefined statuses
    qualities: z.array(z.enum(["240p", "480p", "720p"])),   // Array of enums for qualities


});

  export const GetVideoDetailSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    creator: z.object({
      id: z.string(),
      username: z.string(),
    }),
    status: z.string(),
  });
  


export const UpdateTimestampSchema = z.object({
    video_id: z.string(),
    timestamp: z.number()
})