import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase/server'

function sanitizeFileNameBase(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const BUCKET_CONFIG: Record<string, { public: boolean; maxSize: number; allowedTypes: string[] }> = {
  'build-images': {
    public: true,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  },
  'build-downloads': {
    public: true,
    maxSize: 50 * 1024 * 1024,
    allowedTypes: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/octet-stream', 'application/x-zip-compressed'],
  },
}

// Build file extensions that bypass MIME type checks (browsers report inconsistent types)
const BINARY_FILE_EXTENSIONS = ['zip', 'rar', '7z', 'schematic', 'schem', 'litematic', 'nbt']

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the user is authenticated and is an admin
    const supabase = await getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 2. Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = formData.get('bucket') as string | null
    const folder = formData.get('folder') as string | null
    const fileNameBase = formData.get('fileNameBase') as string | null

    if (!file || !bucket) {
      return NextResponse.json({ error: 'Missing file or bucket' }, { status: 400 })
    }

    const config = BUCKET_CONFIG[bucket]
    if (!config) {
      return NextResponse.json({ error: `Unknown bucket: ${bucket}` }, { status: 400 })
    }

    // 3. Validate file size
    if (file.size > config.maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size is ${Math.round(config.maxSize / 1024 / 1024)}MB` },
        { status: 400 }
      )
    }

    // 4. Determine content type
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    let contentType = file.type || 'application/octet-stream'

    // For build files, always use application/octet-stream to avoid MIME type rejections
    if (BINARY_FILE_EXTENSIONS.includes(ext)) {
      contentType = 'application/octet-stream'
    }

    // 5. Use admin client for storage operations (bypasses RLS)
    const adminClient = getSupabaseAdminClient()

    // 6. Ensure bucket exists
    const { data: buckets } = await adminClient.storage.listBuckets()
    const bucketExists = buckets?.some((b: { name: string }) => b.name === bucket)

    if (!bucketExists) {
      const { error: createErr } = await adminClient.storage.createBucket(bucket, {
        public: config.public,
        fileSizeLimit: config.maxSize,
        allowedMimeTypes: config.allowedTypes,
      })
      if (createErr) {
        console.error('Bucket creation error:', createErr)
        return NextResponse.json({ error: `Failed to create bucket: ${createErr.message}` }, { status: 500 })
      }
    }

    // 7. Upload file
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const sanitizedBase = fileNameBase ? sanitizeFileNameBase(fileNameBase) : ''
    const fileName = bucket === 'build-downloads' && sanitizedBase
      ? `${sanitizedBase}.${ext}`
      : sanitizedBase
        ? `${sanitizedBase}-${timestamp}.${ext}`
        : `${timestamp}-${randomStr}.${ext}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await adminClient.storage
      .from(bucket)
      .upload(filePath, arrayBuffer, {
        cacheControl: '3600',
        contentType,
        upsert: bucket === 'build-downloads' && Boolean(sanitizedBase),
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // 8. Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl })
  } catch (err: any) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
