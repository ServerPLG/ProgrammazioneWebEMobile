import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export async function capturePhoto(): Promise<string | null> {
  try {
    const image = await Camera.getPhoto({
      quality: 85,
      width: 512,
      resultType: CameraResultType.DataUrl,

      source: CameraSource.Camera,
    });
    return image.dataUrl ?? null;
  } catch {

    return null;
  }
}
