export const STORAGES: {
  [key: string]: {
    displayName: string
    maxUploadSize: number
  }
} = {
  r2: { displayName: 'Cloudflare R2', maxUploadSize: 90 }, // 免费容量 10GB, Workers 请求体最大 100MB
  mongodb: { displayName: 'MongoDB', maxUploadSize: 40 }, // 免费容量 512MB, Vercel 请求体最大 4.5MB (分块), 多次请求会很慢
  file0: { displayName: 'File0', maxUploadSize: 90 }, // 免费容量 100MB, 客户端上传
  supabase: { displayName: 'Supabase', maxUploadSize: 40 }, // 免费容量 1GB, 客户端上传, 最大 50MB
}