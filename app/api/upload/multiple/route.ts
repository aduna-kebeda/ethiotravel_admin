import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: "dpasgcaqm",
  api_key: process.env.CLOUDINARY_API_KEY || "296661259151749",
  api_secret: process.env.CLOUDINARY_API_SECRET || "O39mS4BgA_5bN2miMuaRI3YTfR0",
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const folder = (formData.get("folder") as string) || "ethiopian-travel"

    if (!files || files.length === 0) {
      console.error("No files provided in the request")
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    console.log(`Uploading ${files.length} files to Cloudinary folder: ${folder}`)

    // Upload all files to Cloudinary
    const uploadPromises = files.map(async (file, index) => {
      console.log(`Processing file ${index + 1}/${files.length}: ${file.name}, type: ${file.type}, size: ${file.size}`)

      // Convert file to buffer
      const buffer = await file.arrayBuffer()
      const base64String = Buffer.from(buffer).toString("base64")
      const dataURI = `data:${file.type};base64,${base64String}`

      // Upload to Cloudinary
      return new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload(
          dataURI,
          {
            folder,
            resource_type: "auto",
            public_id: `${folder}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          },
          (error, result) => {
            if (error) {
              console.error(`Cloudinary upload error for file ${index + 1}:`, error)
              reject(error)
            } else {
              if (result && result.secure_url && result.public_id) {
                console.log(`Cloudinary upload successful for file ${index + 1}:`, result.secure_url)
                resolve({
                  url: result.secure_url,
                  public_id: result.public_id,
                })
              } else {
                console.error(`Cloudinary upload returned undefined result for file ${index + 1}`)
                reject(new Error("Cloudinary upload returned undefined result"))
              }
            }
          },
        )
      })
    })

    const results = await Promise.all(uploadPromises)
    console.log(`Successfully uploaded ${results.length} files`)

    return NextResponse.json({
      urls: results.map((result) => result.url),
      public_ids: results.map((result) => result.public_id),
    })
  } catch (error: any) {
    console.error("Error uploading to Cloudinary:", error.message || error)
    return NextResponse.json(
      {
        error: "Failed to upload images",
        details: error.message || "Unknown error",
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
