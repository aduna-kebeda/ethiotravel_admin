// This file contains only the configuration and types for Cloudinary
// No direct SDK imports that would cause client-side issues

export type CloudinaryUploadResponse = {
  url: string
  public_id: string
  width: number
  height: number
}

// Helper function to upload an image via our API route
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  try {
    // Convert file to base64
    const base64data = await fileToBase64(file)

    // Upload to our API route
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64data,
        folder: "events",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to upload image")
    }

    return await response.json()
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
