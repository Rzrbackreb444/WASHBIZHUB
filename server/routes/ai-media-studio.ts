import { Router, Request, Response } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import OpenAI from "openai";
import sharp from "sharp";
import { ObjectStorageService, parseObjectPath, objectStorageClient } from "../objectStorage";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const router = Router();
const objectStorage = new ObjectStorageService();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
      "video/mp4", "video/webm", "video/quicktime",
      "audio/mp3", "audio/mpeg", "audio/wav"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  },
});

const OWNER_EMAILS = (process.env.OWNER_EMAILS || "thelaundromatfb@gmail.com,rzrbackreb444@gmail.com,nick@washbizhub.com,larry@washbizhub.com").split(",").map(e => e.trim().toLowerCase());

function isOwner(email?: string): boolean {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.toLowerCase());
}

function requireAuth(req: Request, res: Response, next: Function) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!user.id && !isOwner(user.email)) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

async function uploadToStorage(buffer: Buffer, filename: string, contentType: string, folder: string): Promise<string> {
  const privateObjectDir = process.env.PRIVATE_OBJECT_DIR;
  if (!privateObjectDir) {
    throw new Error("Object storage not configured");
  }
  
  const objectId = `${randomUUID()}-${filename}`;
  const fullPath = `${privateObjectDir}/${folder}/${objectId}`;
  const { bucketName, objectName } = parseObjectPath(fullPath);
  
  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);
  
  await file.save(buffer, {
    contentType,
    metadata: {
      originalName: filename,
      uploadedAt: new Date().toISOString(),
    },
  });
  
  return `/api/media-studio/media/${folder}/${objectId}`;
}

async function saveBufferToTempFile(buffer: Buffer, filename: string): Promise<string> {
  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `${randomUUID()}-${filename}`);
  await fs.promises.writeFile(tempPath, buffer);
  return tempPath;
}

async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
  } catch (e) {
  }
}

router.get("/media/:folder/:objectId", async (req: Request, res: Response) => {
  try {
    const { folder, objectId } = req.params;
    const privateObjectDir = process.env.PRIVATE_OBJECT_DIR;
    
    if (!privateObjectDir) {
      return res.status(500).json({ error: "Object storage not configured" });
    }
    
    const fullPath = `${privateObjectDir}/${folder}/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: "File not found" });
    }
    
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || "application/octet-stream";
    
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000");
    
    const [buffer] = await file.download();
    res.send(buffer);
  } catch (error: any) {
    console.error("[MediaStudio] Media retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve media" });
  }
});

router.post("/remove-background", requireAuth, upload.single("image"), async (req: Request, res: Response) => {
  let tempPath: string | null = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    
    const originalSavedUrl = await uploadToStorage(
      req.file.buffer,
      `original-${req.file.originalname}`,
      req.file.mimetype,
      "originals"
    );
    
    tempPath = await saveBufferToTempFile(req.file.buffer, req.file.originalname);
    
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: fs.createReadStream(tempPath) as any,
      prompt: "Remove the background completely and replace it with a clean, pure white background. Keep the main subject exactly as it is with crisp, clean edges. The subject should be isolated on white, suitable for e-commerce or marketing use.",
      size: "1024x1024",
    });
    
    const imageData = response.data[0];
    let imageBuffer: Buffer;
    
    if (imageData.b64_json) {
      imageBuffer = Buffer.from(imageData.b64_json, "base64");
    } else if (imageData.url) {
      const imageResponse = await fetch(imageData.url);
      if (!imageResponse.ok) {
        throw new Error("Failed to download processed image");
      }
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    } else {
      throw new Error("No image data in response");
    }
    
    const savedUrl = await uploadToStorage(
      imageBuffer,
      `bg-removed-${req.file.originalname}.png`,
      "image/png",
      "processed"
    );
    
    res.json({
      success: true,
      originalUrl: originalSavedUrl,
      processedUrl: savedUrl,
      type: "ai-creative",
      disclaimer: "AI-generated result. Subject appearance may vary from original.",
    });
  } catch (error: any) {
    console.error("[MediaStudio] Background removal error:", error);
    res.status(500).json({ error: error.message || "Failed to remove background" });
  } finally {
    if (tempPath) await cleanupTempFile(tempPath);
  }
});

router.post("/edit-image", requireAuth, upload.single("image"), async (req: Request, res: Response) => {
  let tempPath: string | null = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    
    const { prompt, style } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Edit prompt is required" });
    }
    
    const originalSavedUrl = await uploadToStorage(
      req.file.buffer,
      `original-${req.file.originalname}`,
      req.file.mimetype,
      "originals"
    );
    
    const stylePrompts: Record<string, string> = {
      "enhance": "Enhance the image quality, improve lighting and make colors more vibrant while keeping everything else the same.",
      "cartoon": "Transform this image into a cartoon/animated style while preserving the subject and composition.",
      "vintage": "Apply a vintage film look with warm sepia tones and subtle grain while keeping the subject.",
      "dramatic": "Apply dramatic lighting with high contrast and deep shadows while keeping the subject.",
      "watercolor": "Transform this into a watercolor painting style while keeping the subject recognizable.",
      "oil-painting": "Transform this into an oil painting style with visible brushstrokes while keeping the subject.",
      "pop-art": "Transform this into a bold pop-art style with vibrant colors while keeping the subject.",
      "cinematic": "Apply a cinematic color grade with movie-quality lighting while keeping the subject.",
    };
    
    let fullPrompt = prompt;
    if (style && stylePrompts[style]) {
      fullPrompt = `${stylePrompts[style]} Additional instruction: ${prompt}`;
    }
    
    tempPath = await saveBufferToTempFile(req.file.buffer, req.file.originalname);
    
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: fs.createReadStream(tempPath) as any,
      prompt: fullPrompt,
      size: "1024x1024",
    });
    
    const imageData = response.data[0];
    let imageBuffer: Buffer;
    
    if (imageData.b64_json) {
      imageBuffer = Buffer.from(imageData.b64_json, "base64");
    } else if (imageData.url) {
      const imageResponse = await fetch(imageData.url);
      if (!imageResponse.ok) {
        throw new Error("Failed to download processed image");
      }
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    } else {
      throw new Error("No image data in response");
    }
    
    const savedUrl = await uploadToStorage(
      imageBuffer,
      `edited-${req.file.originalname}.png`,
      "image/png",
      "processed"
    );
    
    res.json({
      success: true,
      originalUrl: originalSavedUrl,
      processedUrl: savedUrl,
      appliedPrompt: fullPrompt,
      style: style || "none",
      type: "ai-creative",
      disclaimer: "AI-generated creative result. Output is an artistic interpretation, not a literal pixel edit.",
    });
  } catch (error: any) {
    console.error("[MediaStudio] Image edit error:", error);
    res.status(500).json({ error: error.message || "Failed to edit image" });
  } finally {
    if (tempPath) await cleanupTempFile(tempPath);
  }
});

router.post("/create-overlay", requireAuth, upload.fields([
  { name: "background", maxCount: 1 },
  { name: "overlay", maxCount: 1 },
]), async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const backgroundFile = files.background?.[0];
    const overlayFile = files.overlay?.[0];
    
    if (!backgroundFile || !overlayFile) {
      return res.status(400).json({ error: "Both background and overlay images are required" });
    }
    
    const { 
      overlayX = "0.5", 
      overlayY = "0.5", 
      overlayScale = "0.3", 
      overlayOpacity = "1.0" 
    } = req.body;
    
    const x = parseFloat(overlayX);
    const y = parseFloat(overlayY);
    const scale = parseFloat(overlayScale);
    const opacity = parseFloat(overlayOpacity);
    
    const bgSavedUrl = await uploadToStorage(
      backgroundFile.buffer,
      `bg-${Date.now()}-${backgroundFile.originalname}`,
      backgroundFile.mimetype,
      "composites"
    );
    
    const overlaySavedUrl = await uploadToStorage(
      overlayFile.buffer,
      `overlay-${Date.now()}-${overlayFile.originalname}`,
      overlayFile.mimetype,
      "composites"
    );
    
    const bgMeta = await sharp(backgroundFile.buffer).metadata();
    const overlayMeta = await sharp(overlayFile.buffer).metadata();
    
    const bgWidth = bgMeta.width || 1024;
    const bgHeight = bgMeta.height || 1024;
    
    const overlayWidth = overlayMeta.width || 200;
    const overlayHeight = overlayMeta.height || 200;
    
    const scaledWidth = Math.round(bgWidth * scale);
    const scaledHeight = Math.round((overlayHeight / overlayWidth) * scaledWidth);
    
    let resizedOverlay = await sharp(overlayFile.buffer)
      .resize(scaledWidth, scaledHeight, { fit: 'inside' })
      .toBuffer();
    
    if (opacity < 1.0) {
      resizedOverlay = await sharp(resizedOverlay)
        .ensureAlpha()
        .modulate({ brightness: 1 })
        .composite([{
          input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'dest-in'
        }])
        .toBuffer();
    }
    
    const posX = Math.round((bgWidth - scaledWidth) * x);
    const posY = Math.round((bgHeight - scaledHeight) * y);
    
    const compositeBuffer = await sharp(backgroundFile.buffer)
      .composite([{
        input: resizedOverlay,
        left: Math.max(0, posX),
        top: Math.max(0, posY),
        blend: 'over'
      }])
      .png()
      .toBuffer();
    
    const savedUrl = await uploadToStorage(
      compositeBuffer,
      `composite-${Date.now()}.png`,
      "image/png",
      "composites"
    );
    
    res.json({
      success: true,
      compositeUrl: savedUrl,
      backgroundUrl: bgSavedUrl,
      overlayUrl: overlaySavedUrl,
      settings: {
        position: { x, y },
        scale,
        opacity,
      },
      type: "deterministic",
      disclaimer: "Pixel-perfect composite. Original assets preserved exactly.",
    });
  } catch (error: any) {
    console.error("[MediaStudio] Overlay error:", error);
    res.status(500).json({ error: error.message || "Failed to create overlay" });
  }
});

router.post("/generate-logo", requireAuth, async (req: Request, res: Response) => {
  try {
    const { prompt, style = "modern", colors, transparent = true } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Logo description is required" });
    }
    
    const styleGuides: Record<string, string> = {
      "modern": "modern minimalist clean geometric",
      "vintage": "vintage retro classic with ornate details",
      "playful": "playful fun colorful cartoon style",
      "corporate": "professional corporate business formal",
      "tech": "futuristic tech startup modern gradient",
      "hand-drawn": "hand-drawn artistic sketch style",
      "luxury": "luxury premium elegant gold accents",
      "bold": "bold impactful strong typography",
    };
    
    let logoPrompt = `Create a professional logo design: ${prompt}. Style: ${styleGuides[style] || styleGuides.modern}.`;
    if (colors) {
      logoPrompt += ` Use colors: ${colors}.`;
    }
    if (transparent) {
      logoPrompt += " Design on a clean white background.";
    }
    logoPrompt += " High quality, vector-style, suitable for business use.";
    
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: logoPrompt,
      n: 1,
      size: "1024x1024",
    });
    
    const imageData = response.data[0];
    let imageBuffer: Buffer;
    
    if (imageData.b64_json) {
      imageBuffer = Buffer.from(imageData.b64_json, "base64");
    } else if (imageData.url) {
      const imageResponse = await fetch(imageData.url);
      if (!imageResponse.ok) {
        throw new Error("Failed to download logo");
      }
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    } else {
      throw new Error("No image data in response");
    }
    
    const savedUrl = await uploadToStorage(
      imageBuffer,
      `logo-${Date.now()}.png`,
      "image/png",
      "logos"
    );
    
    res.json({
      success: true,
      logoUrl: savedUrl,
      prompt: logoPrompt,
      type: "ai-creative",
      disclaimer: "AI-generated logo. Review carefully before commercial use.",
    });
  } catch (error: any) {
    console.error("[MediaStudio] Logo generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate logo" });
  }
});

router.post("/apply-filter", requireAuth, upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    
    const { filter } = req.body;
    
    const validFilters = ["warm", "cool", "vintage", "noir", "vibrant", "muted", "cinematic", "dreamy", "hdr", "sunset"];
    
    if (!filter || !validFilters.includes(filter)) {
      return res.status(400).json({ 
        error: "Invalid filter. Available: " + validFilters.join(", ") 
      });
    }
    
    const originalSavedUrl = await uploadToStorage(
      req.file.buffer,
      `original-${req.file.originalname}`,
      req.file.mimetype,
      "originals"
    );
    
    let sharpInstance = sharp(req.file.buffer);
    
    switch (filter) {
      case "warm":
        sharpInstance = sharpInstance.modulate({ saturation: 1.1, brightness: 1.05 })
          .tint({ r: 255, g: 220, b: 180 });
        break;
      case "cool":
        sharpInstance = sharpInstance.modulate({ saturation: 0.95, brightness: 1.02 })
          .tint({ r: 180, g: 200, b: 255 });
        break;
      case "vintage":
        sharpInstance = sharpInstance.modulate({ saturation: 0.7, brightness: 0.95 })
          .tint({ r: 230, g: 200, b: 160 })
          .gamma(1.1);
        break;
      case "noir":
        sharpInstance = sharpInstance.grayscale()
          .modulate({ brightness: 0.9 })
          .linear(1.3, -(128 * 0.3));
        break;
      case "vibrant":
        sharpInstance = sharpInstance.modulate({ saturation: 1.5, brightness: 1.05 });
        break;
      case "muted":
        sharpInstance = sharpInstance.modulate({ saturation: 0.6, brightness: 1.02 });
        break;
      case "cinematic":
        sharpInstance = sharpInstance.modulate({ saturation: 0.85 })
          .linear(1.15, -15);
        break;
      case "dreamy":
        sharpInstance = sharpInstance.modulate({ saturation: 0.9, brightness: 1.1 })
          .blur(0.5);
        break;
      case "hdr":
        sharpInstance = sharpInstance.modulate({ saturation: 1.3 })
          .linear(1.2, -(128 * 0.2))
          .sharpen(1.5);
        break;
      case "sunset":
        sharpInstance = sharpInstance.modulate({ saturation: 1.2, brightness: 1.05 })
          .tint({ r: 255, g: 180, b: 120 });
        break;
    }
    
    const filteredBuffer = await sharpInstance.png().toBuffer();
    
    const savedUrl = await uploadToStorage(
      filteredBuffer,
      `filtered-${filter}-${req.file.originalname}.png`,
      "image/png",
      "filtered"
    );
    
    res.json({
      success: true,
      originalUrl: originalSavedUrl,
      filteredUrl: savedUrl,
      filter,
      type: "deterministic",
      disclaimer: "Deterministic filter. Exact pixel transformation applied.",
    });
  } catch (error: any) {
    console.error("[MediaStudio] Filter error:", error);
    res.status(500).json({ error: error.message || "Failed to apply filter" });
  }
});

router.get("/filters", (_req: Request, res: Response) => {
  res.json({
    filters: [
      { id: "warm", name: "Warm", description: "Golden warm tones", type: "deterministic" },
      { id: "cool", name: "Cool", description: "Blue cool tones", type: "deterministic" },
      { id: "vintage", name: "Vintage", description: "Classic film look", type: "deterministic" },
      { id: "noir", name: "Noir", description: "Black and white drama", type: "deterministic" },
      { id: "vibrant", name: "Vibrant", description: "Bold saturated colors", type: "deterministic" },
      { id: "muted", name: "Muted", description: "Soft desaturated", type: "deterministic" },
      { id: "cinematic", name: "Cinematic", description: "Movie-style grading", type: "deterministic" },
      { id: "dreamy", name: "Dreamy", description: "Soft glow effect", type: "deterministic" },
      { id: "hdr", name: "HDR", description: "Enhanced details", type: "deterministic" },
      { id: "sunset", name: "Sunset", description: "Warm orange/pink", type: "deterministic" },
    ],
    styles: [
      { id: "modern", name: "Modern", description: "Clean minimalist" },
      { id: "vintage", name: "Vintage", description: "Retro classic" },
      { id: "playful", name: "Playful", description: "Fun colorful" },
      { id: "corporate", name: "Corporate", description: "Professional business" },
      { id: "tech", name: "Tech", description: "Futuristic startup" },
      { id: "hand-drawn", name: "Hand-drawn", description: "Artistic sketch" },
      { id: "luxury", name: "Luxury", description: "Premium elegant" },
      { id: "bold", name: "Bold", description: "Strong impactful" },
    ],
  });
});

router.post("/upscale", requireAuth, upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    
    const { scale = "2" } = req.body;
    const scaleFactor = Math.min(4, Math.max(1.5, parseFloat(scale)));
    
    const originalSavedUrl = await uploadToStorage(
      req.file.buffer,
      `original-${req.file.originalname}`,
      req.file.mimetype,
      "originals"
    );
    
    const metadata = await sharp(req.file.buffer).metadata();
    const originalWidth = metadata.width || 512;
    const originalHeight = metadata.height || 512;
    
    const newWidth = Math.round(originalWidth * scaleFactor);
    const newHeight = Math.round(originalHeight * scaleFactor);
    
    const upscaledBuffer = await sharp(req.file.buffer)
      .resize(newWidth, newHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill',
      })
      .sharpen({
        sigma: 0.8,
        m1: 1.0,
        m2: 0.5,
      })
      .png({ quality: 100 })
      .toBuffer();
    
    const savedUrl = await uploadToStorage(
      upscaledBuffer,
      `upscaled-${scaleFactor}x-${req.file.originalname}.png`,
      "image/png",
      "upscaled"
    );
    
    res.json({
      success: true,
      originalUrl: originalSavedUrl,
      upscaledUrl: savedUrl,
      originalSize: { width: originalWidth, height: originalHeight },
      newSize: { width: newWidth, height: newHeight },
      scaleFactor,
      type: "deterministic",
      disclaimer: "Lanczos3 upscaling with sharpening. Pixel-perfect enlargement.",
    });
  } catch (error: any) {
    console.error("[MediaStudio] Upscale error:", error);
    res.status(500).json({ error: error.message || "Failed to upscale image" });
  }
});

router.post("/compress", requireAuth, upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    
    const { quality = "80", format = "webp" } = req.body;
    const qualityNum = Math.min(100, Math.max(10, parseInt(quality)));
    
    const originalSavedUrl = await uploadToStorage(
      req.file.buffer,
      `original-${req.file.originalname}`,
      req.file.mimetype,
      "originals"
    );
    
    let sharpInstance = sharp(req.file.buffer);
    let outputBuffer: Buffer;
    let outputMime: string;
    let outputExt: string;
    
    switch (format) {
      case "jpeg":
      case "jpg":
        outputBuffer = await sharpInstance.jpeg({ quality: qualityNum, mozjpeg: true }).toBuffer();
        outputMime = "image/jpeg";
        outputExt = "jpg";
        break;
      case "png":
        outputBuffer = await sharpInstance.png({ compressionLevel: Math.round((100 - qualityNum) / 10) }).toBuffer();
        outputMime = "image/png";
        outputExt = "png";
        break;
      case "webp":
      default:
        outputBuffer = await sharpInstance.webp({ quality: qualityNum }).toBuffer();
        outputMime = "image/webp";
        outputExt = "webp";
        break;
    }
    
    const savedUrl = await uploadToStorage(
      outputBuffer,
      `compressed-${req.file.originalname}.${outputExt}`,
      outputMime,
      "compressed"
    );
    
    const originalSize = req.file.buffer.length;
    const compressedSize = outputBuffer.length;
    const savings = Math.round((1 - compressedSize / originalSize) * 100);
    
    res.json({
      success: true,
      originalUrl: originalSavedUrl,
      compressedUrl: savedUrl,
      originalSize,
      compressedSize,
      savings: `${savings}%`,
      format: outputExt,
      quality: qualityNum,
      type: "deterministic",
      disclaimer: "Lossless/lossy compression. Original pixels preserved within quality setting.",
    });
  } catch (error: any) {
    console.error("[MediaStudio] Compress error:", error);
    res.status(500).json({ error: error.message || "Failed to compress image" });
  }
});

router.post("/resize", requireAuth, upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    
    const { width, height, fit = "cover" } = req.body;
    
    if (!width && !height) {
      return res.status(400).json({ error: "Width or height required" });
    }
    
    const originalSavedUrl = await uploadToStorage(
      req.file.buffer,
      `original-${req.file.originalname}`,
      req.file.mimetype,
      "originals"
    );
    
    const metadata = await sharp(req.file.buffer).metadata();
    
    const resizedBuffer = await sharp(req.file.buffer)
      .resize({
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        fit: fit as keyof sharp.FitEnum,
        withoutEnlargement: false,
      })
      .png()
      .toBuffer();
    
    const newMetadata = await sharp(resizedBuffer).metadata();
    
    const savedUrl = await uploadToStorage(
      resizedBuffer,
      `resized-${req.file.originalname}.png`,
      "image/png",
      "resized"
    );
    
    res.json({
      success: true,
      originalUrl: originalSavedUrl,
      resizedUrl: savedUrl,
      originalSize: { width: metadata.width, height: metadata.height },
      newSize: { width: newMetadata.width, height: newMetadata.height },
      fit,
      type: "deterministic",
      disclaimer: "Pixel-perfect resize. Original content preserved.",
    });
  } catch (error: any) {
    console.error("[MediaStudio] Resize error:", error);
    res.status(500).json({ error: error.message || "Failed to resize image" });
  }
});

router.post("/watermark", requireAuth, upload.fields([
  { name: "image", maxCount: 1 },
  { name: "watermark", maxCount: 1 },
]), async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const imageFile = files.image?.[0];
    const watermarkFile = files.watermark?.[0];
    
    if (!imageFile) {
      return res.status(400).json({ error: "Main image is required" });
    }
    
    const { 
      position = "bottom-right",
      opacity = "0.5",
      scale = "0.15",
      text,
      textColor = "#ffffff",
      textSize = "24"
    } = req.body;
    
    const opacityNum = parseFloat(opacity);
    const scaleNum = parseFloat(scale);
    
    const originalSavedUrl = await uploadToStorage(
      imageFile.buffer,
      `original-${imageFile.originalname}`,
      imageFile.mimetype,
      "originals"
    );
    
    const bgMeta = await sharp(imageFile.buffer).metadata();
    const bgWidth = bgMeta.width || 1024;
    const bgHeight = bgMeta.height || 1024;
    
    let watermarkBuffer: Buffer | null = null;
    
    if (watermarkFile) {
      const wmWidth = Math.round(bgWidth * scaleNum);
      watermarkBuffer = await sharp(watermarkFile.buffer)
        .resize(wmWidth, null, { fit: 'inside' })
        .ensureAlpha()
        .toBuffer();
      
      if (opacityNum < 1.0) {
        const meta = await sharp(watermarkBuffer).metadata();
        watermarkBuffer = await sharp(watermarkBuffer)
          .composite([{
            input: Buffer.from(
              Array.from({ length: (meta.width || 100) * (meta.height || 100) * 4 }, 
                (_, i) => i % 4 === 3 ? Math.round(opacityNum * 255) : 255
              )
            ),
            raw: { width: meta.width || 100, height: meta.height || 100, channels: 4 },
            blend: 'dest-in'
          }])
          .toBuffer();
      }
    } else if (text) {
      const fontSize = parseInt(textSize);
      const svg = `
        <svg width="${Math.round(bgWidth * 0.3)}" height="${fontSize * 1.5}">
          <text x="0" y="${fontSize}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${textColor}" opacity="${opacityNum}">
            ${text}
          </text>
        </svg>
      `;
      watermarkBuffer = Buffer.from(svg);
    }
    
    if (!watermarkBuffer) {
      return res.status(400).json({ error: "Watermark image or text required" });
    }
    
    const wmMeta = await sharp(watermarkBuffer).metadata();
    const wmWidth = wmMeta.width || 100;
    const wmHeight = wmMeta.height || 100;
    
    let left = 20;
    let top = 20;
    const padding = 20;
    
    switch (position) {
      case "top-left":
        left = padding;
        top = padding;
        break;
      case "top-center":
        left = Math.round((bgWidth - wmWidth) / 2);
        top = padding;
        break;
      case "top-right":
        left = bgWidth - wmWidth - padding;
        top = padding;
        break;
      case "center":
        left = Math.round((bgWidth - wmWidth) / 2);
        top = Math.round((bgHeight - wmHeight) / 2);
        break;
      case "bottom-left":
        left = padding;
        top = bgHeight - wmHeight - padding;
        break;
      case "bottom-center":
        left = Math.round((bgWidth - wmWidth) / 2);
        top = bgHeight - wmHeight - padding;
        break;
      case "bottom-right":
      default:
        left = bgWidth - wmWidth - padding;
        top = bgHeight - wmHeight - padding;
        break;
    }
    
    const watermarkedBuffer = await sharp(imageFile.buffer)
      .composite([{
        input: watermarkBuffer,
        left: Math.max(0, left),
        top: Math.max(0, top),
        blend: 'over'
      }])
      .png()
      .toBuffer();
    
    const savedUrl = await uploadToStorage(
      watermarkedBuffer,
      `watermarked-${imageFile.originalname}.png`,
      "image/png",
      "watermarked"
    );
    
    res.json({
      success: true,
      originalUrl: originalSavedUrl,
      watermarkedUrl: savedUrl,
      position,
      type: "deterministic",
      disclaimer: "Pixel-perfect watermark. Original image preserved with overlay.",
    });
  } catch (error: any) {
    console.error("[MediaStudio] Watermark error:", error);
    res.status(500).json({ error: error.message || "Failed to add watermark" });
  }
});

export default router;
