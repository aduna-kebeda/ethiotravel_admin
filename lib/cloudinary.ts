import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dpasgcaqm",
  api_key: process.env.CLOUDINARY_API_KEY || "296661259151749",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
})

export default cloudinary

// Helper function to upload an image to Cloudinary
export async function uploadImage(file: File): Promise<string> {
  try {
    // Convert file to base64
    const base64data = await fileToBase64(file)

    // Upload to Cloudinary
    const response = await fetch("/api/upload/cloudinary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64data,
        folder: "events",
        public_id: `event_${Date.now()}`,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
