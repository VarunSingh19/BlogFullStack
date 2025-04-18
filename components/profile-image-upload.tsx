"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Upload, X, Check, Loader2 } from "lucide-react"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

interface ProfileImageUploadProps {
  currentImageUrl: string
  userName: string
  onImageUpload: (imageData: string) => Promise<void>
}

export function ProfileImageUpload({ currentImageUrl, userName, onImageUpload }: ProfileImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  })
  const [zoom, setZoom] = useState([1])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const imageRef = useRef<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]

    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = (crop: Crop) => {
    setCrop(crop)
  }

  const handleZoomChange = (value: number[]) => {
    setZoom(value)

    // Apply zoom to the image
    if (imageRef.current) {
      imageRef.current.style.transform = `scale(${value[0]})`
    }
  }

  const getCroppedImage = () => {
    if (!imageRef.current || !crop.width || !crop.height) return null

    const image = imageRef.current
    const canvas = document.createElement("canvas")
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = crop.width
    canvas.height = crop.height

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    // Apply zoom factor to crop coordinates
    const zoomFactor = zoom[0]
    const scaledCrop = {
      x: crop.x / zoomFactor,
      y: crop.y / zoomFactor,
      width: crop.width / zoomFactor,
      height: crop.height / zoomFactor,
    }

    ctx.drawImage(
      image,
      scaledCrop.x * scaleX,
      scaledCrop.y * scaleY,
      scaledCrop.width * scaleX,
      scaledCrop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    )

    return canvas.toDataURL("image/jpeg", 0.9)
  }

  const handleUpload = async () => {
    const croppedImageData = getCroppedImage()

    if (!croppedImageData) {
      setError("Failed to process image")
      return
    }

    setIsUploading(true)

    try {
      await onImageUpload(croppedImageData)
      setIsOpen(false)
      // Reset state
      setSelectedFile(null)
      setPreviewUrl(null)
      setCrop({
        unit: "%",
        width: 100,
        height: 100,
        x: 0,
        y: 0,
      })
      setZoom([1])
    } catch (err) {
      setError("Failed to upload image. Please try again.")
      console.error("Upload error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-32 w-32 border-2 border-primary/20">
        <AvatarImage src={currentImageUrl || "/placeholder.svg"} alt={userName} />
        <AvatarFallback className="text-4xl">{userName.charAt(0)}</AvatarFallback>
      </Avatar>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Change Photo
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Profile Photo</DialogTitle>
            <DialogDescription>Choose an image to use as your profile photo.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}

            {!previewUrl ? (
              <div
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={triggerFileInput}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Click to upload</p>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF (max. 5MB)</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative max-h-[300px] overflow-hidden flex justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={handleCropComplete}
                    aspect={1}
                    circularCrop
                  >
                    <img
                      ref={imageRef}
                      src={previewUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-[300px] transition-transform"
                      style={{ transform: `scale(${zoom[0]})` }}
                    />
                  </ReactCrop>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Zoom</span>
                    <span className="text-sm text-muted-foreground">{zoom[0].toFixed(1)}x</span>
                  </div>
                  <Slider value={zoom} onValueChange={handleZoomChange} min={1} max={3} step={0.1} />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" size="sm" onClick={triggerFileInput}>
                    Choose Another
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setPreviewUrl(null)
                      setSelectedFile(null)
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!previewUrl || isUploading} className="gap-2">
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Photo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
