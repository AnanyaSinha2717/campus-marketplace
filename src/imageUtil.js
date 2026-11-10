import * as ImageManipulator from 'expo-image-manipulator';

// Shrinks a photo to ~480px wide JPEG and returns Base64 text so it fits inside a Firestore document.
export async function shrinkToBase64(uri) {
  const opts = { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true };
  let b64;
  if (typeof ImageManipulator.manipulateAsync === 'function') {
    const r = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 480 } }], opts);
    b64 = r.base64;
  } else {
    // newer expo-image-manipulator API
    const ctx = ImageManipulator.ImageManipulator.manipulate(uri);
    ctx.resize({ width: 480 });
    const img = await ctx.renderAsync();
    const r = await img.saveAsync(opts);
    b64 = r.base64;
  }
  if (!b64 || b64.length > 700000) throw new Error('Image is too large. Pick a different one.');
  return b64;
}
