import { uploadFileSchema, updateStatusSchema } from './library'

describe('uploadFileSchema', () => {
  function createFile(
    name: string,
    size: number,
    type: string,
  ): File {
    const buffer = new ArrayBuffer(size)
    return new File([buffer], name, { type })
  }

  it('유효한 PDF 파일을 통과시킨다', () => {
    const file = createFile('doc.pdf', 1024, 'application/pdf')
    const result = uploadFileSchema.safeParse(file)
    expect(result.success).toBe(true)
  })

  it('유효한 이미지 파일을 통과시킨다', () => {
    const file = createFile('photo.jpg', 2048, 'image/jpeg')
    const result = uploadFileSchema.safeParse(file)
    expect(result.success).toBe(true)
  })

  it('유효한 텍스트 파일을 통과시킨다', () => {
    const file = createFile('note.txt', 512, 'text/plain')
    const result = uploadFileSchema.safeParse(file)
    expect(result.success).toBe(true)
  })

  it('유효한 마크다운 파일을 통과시킨다', () => {
    const file = createFile('readme.md', 256, 'text/markdown')
    const result = uploadFileSchema.safeParse(file)
    expect(result.success).toBe(true)
  })

  it('10MB 초과 파일을 거부한다', () => {
    const file = createFile('big.pdf', 11 * 1024 * 1024, 'application/pdf')
    const result = uploadFileSchema.safeParse(file)
    expect(result.success).toBe(false)
  })

  it('지원하지 않는 파일 타입을 거부한다', () => {
    const file = createFile('doc.exe', 1024, 'application/octet-stream')
    const result = uploadFileSchema.safeParse(file)
    expect(result.success).toBe(false)
  })

  it('File이 아닌 값을 거부한다', () => {
    const result = uploadFileSchema.safeParse('not-a-file')
    expect(result.success).toBe(false)
  })

  it('정확히 10MB 파일을 통과시킨다', () => {
    const file = createFile('exact.pdf', 10 * 1024 * 1024, 'application/pdf')
    const result = uploadFileSchema.safeParse(file)
    expect(result.success).toBe(true)
  })
})

describe('updateStatusSchema', () => {
  it('active 상태를 통과시킨다', () => {
    const result = updateStatusSchema.safeParse({ status: 'active' })
    expect(result.success).toBe(true)
  })

  it('archived 상태를 통과시킨다', () => {
    const result = updateStatusSchema.safeParse({ status: 'archived' })
    expect(result.success).toBe(true)
  })

  it('잘못된 상태 값을 거부한다', () => {
    const result = updateStatusSchema.safeParse({ status: 'deleted' })
    expect(result.success).toBe(false)
  })

  it('빈 문자열을 거부한다', () => {
    const result = updateStatusSchema.safeParse({ status: '' })
    expect(result.success).toBe(false)
  })

  it('status 필드 누락을 거부한다', () => {
    const result = updateStatusSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
