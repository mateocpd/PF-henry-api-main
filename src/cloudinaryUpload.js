import { v2 as cloudinary } from 'cloudinary'

export const upload = async (filePath) => {
  return cloudinary.uploader.upload(filePath, {
    folder: 'images'
  })
}

export const destroy = async (publicID) => {
  return cloudinary.uploader.destroy(publicID)
}
export const uploadProfilepic = async (filePath) => {
  return cloudinary.uploader.upload(filePath, {
    folder: 'profilepic'
  })
}
