import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dpasgcaqm",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
})

interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    const folder = (formData.get("folder") as string) || "ethiopian-travel"

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image size exceeds 5MB limit" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp"]
    if (!validTypes.includes(image.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, SVG, and WebP are allowed" },
        { status: 400 },
      )
    }

    // Convert file to base64
    const arrayBuffer = await image.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = `data:${image.type};base64,${buffer.toString("base64")}`

    // Generate a unique public_id based on timestamp and random string
    const timestamp = new Date().getTime()
    const randomString = Math.random().toString(36).substring(2, 8)
    const publicId = `${folder}/${timestamp}_${randomString}`

    // Upload to Cloudinary with retry logic
    let uploadResult: CloudinaryUploadResult | undefined
    let retries = 3

    while (retries > 0) {
      try {
        uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
          const upload = cloudinary.uploader.upload_stream(
            {
          folder,
          public_id: publicId,
          resource_type: "image",
          overwrite: true,
            },
            (error, result) => {
              if (error) reject(error)
              else if (result) resolve(result as CloudinaryUploadResult)
              else reject(new Error("No result from Cloudinary"))
            }
          )

          // Write the base64 data to the upload stream
          const base64Data = base64Image.split(",")[1]
          const buffer = Buffer.from(base64Data, "base64")
          upload.end(buffer)
        })

        break
      } catch (error) {
        console.error("Cloudinary upload error:", error)
        retries--
        if (retries === 0) throw error
        // Wait for 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    if (!uploadResult) {
      throw new Error("Failed to upload image to Cloudinary")
    }

    return NextResponse.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
