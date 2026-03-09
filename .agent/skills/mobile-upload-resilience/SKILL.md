# Mobile Upload Resilience Skill (INDEX)

This skill provides a set of principles and patterns for handling file uploads on mobile devices with high reliability, especially when dealing with Supabase Storage or similar S3-compatible backends.

## 📱 The Mobile Context Problem
Mobile browsers (Safari, Chrome on Android, in-app browsers) behave differently than desktop:
1. **Memory Caps**: RAM is limited; processing large high-res photos (12MP+) in a Canvas often crashes the browser tab.
2. **MIME Type Guessing**: OS-specific pickers sometimes return empty or generic `application/octet-stream` types.
3. **Connectivity Patterns**: Mobile networks are unstable; requests are more likely to time out or be dropped by the OS during backgrounding.
4. **File Name Anomalies**: Mobile OSs often use generic names like `image:123` or `image.jpg` for every capture, leading to path collisions.

## 🧪 Resilient Implementation Patterns

### 1. Robust MIME & Path Handling
ALWAYS sanitize the path and ensure a valid content-type before sending to the storage engine.

```typescript
const sanitizeFilename = (name: string) => {
  return name.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
};

const getResilientType = (file: File, fallback = 'image/jpeg') => {
  return file.type || fallback;
};
```

### 2. Memory-Efficient Compression
Prefer `URL.createObjectURL` over `FileReader.readAsDataURL` to avoid duplicating large binary strings in memory.

```typescript
const objectUrl = URL.createObjectURL(file);
// Use img.src = objectUrl
// ...
URL.revokeObjectURL(objectUrl); // IMPORTANT: Cleanup to prevent leaks
```

### 3. Progressive Logging for Mobile Debugging
Since we can't always see the console on a user's phone, use detailed toasts that include the error code and message.

## 🛠️ Verification Checklist
- [ ] Test with "Take Photo" (Camera)
- [ ] Test with "Pick from Gallery" (Gallery)
- [ ] Verify behavior on both Android (Chrome) and iOS (Safari)
- [ ] Verify behavior through In-App Browsers (WhatsApp/Facebook)
- [ ] Check Supabase RLS policies for `anon` vs `authenticated`
