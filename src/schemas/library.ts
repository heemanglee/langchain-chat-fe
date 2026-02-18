import { z } from 'zod/v4'
import {
  LIBRARY_ACCEPTED_FILE_TYPES,
  LIBRARY_MAX_FILE_SIZE,
} from '@/lib/constants'

const uploadFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= LIBRARY_MAX_FILE_SIZE, {
    message: '파일 크기는 10MB 이하여야 합니다',
  })
  .refine(
    (file) =>
      (LIBRARY_ACCEPTED_FILE_TYPES as readonly string[]).includes(file.type),
    { message: '지원하지 않는 파일 형식입니다' },
  )

const updateStatusSchema = z.object({
  status: z.enum(['active', 'archived']),
})

type UpdateStatusFormData = z.infer<typeof updateStatusSchema>

export { uploadFileSchema, updateStatusSchema }
export type { UpdateStatusFormData }
