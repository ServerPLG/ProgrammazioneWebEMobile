import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Scatta una foto (o la sceglie dalla galleria) usando la fotocamera del device
 * tramite Capacitor. Restituisce un data URL base64 (es. "data:image/jpeg;base64,...")
 * cioe' lo stesso formato dell'upload da file, gia' accettato dal backend.
 * Ritorna null se l'utente annulla o nega il permesso.
 *
 * NB: nel browser (test in locale) serve @ionic/pwa-elements, registrato in main.ts.
 * width/quality tengono leggera l'immagine.
 */
export async function capturePhoto(): Promise<string | null> {
  try {
    const image = await Camera.getPhoto({
      quality: 85,
      width: 512,
      resultType: CameraResultType.DataUrl,
      // Solo fotocamera: la scelta del file resta affidata al pulsante di upload
      // gia' presente, cosi' non ci sono due vie per accedere ai file.
      source: CameraSource.Camera,
    });
    return image.dataUrl ?? null;
  } catch {
    // L'utente ha annullato lo scatto o ha negato il permesso fotocamera.
    return null;
  }
}
