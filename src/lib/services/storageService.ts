import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getStorageInstance } from "@/lib/firebase";
import { userService } from "./userService";

function compressImage(file: File, maxSize = 1024, quality = 0.72): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
          "image/jpeg",
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const storageService = {
  async uploadImage(file: File, path: string): Promise<string> {
    const compressed = file.type.startsWith("image/") ? await compressImage(file) : file;
    const storageRef = ref(getStorageInstance(), path);
    await uploadBytes(storageRef, compressed);
    return getDownloadURL(storageRef);
  },

  async uploadProfilePhoto(userId: string, file: File): Promise<string> {
    const url = await this.uploadImage(file, `profile-photos/${userId}_${Date.now()}.jpg`);
    await userService.updateUser(userId, { photoURL: url } as never);
    return url;
  },

  async uploadOfferImage(file: File, offerId: string): Promise<string> {
    return this.uploadImage(file, `offers/${offerId}_${Date.now()}.jpg`);
  },

  async uploadServiceImage(file: File, serviceId: string): Promise<string> {
    return this.uploadImage(file, `services/${serviceId}_${Date.now()}.jpg`);
  },

  async uploadGallery(file: File, name: string): Promise<string> {
    return this.uploadImage(file, `gallery/${name}_${Date.now()}.jpg`);
  },
};
