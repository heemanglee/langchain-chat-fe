import { loginSchema, registerSchema } from './auth'

describe('loginSchema', () => {
  it('유효한 데이터를 통과시킨다', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'Password1!',
    })
    expect(result.success).toBe(true)
  })

  it('빈 이메일을 거부한다', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'Password1!',
    })
    expect(result.success).toBe(false)
  })

  it('잘못된 이메일 형식을 거부한다', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'Password1!',
    })
    expect(result.success).toBe(false)
  })

  it('빈 비밀번호를 거부한다', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })

  it('이메일 누락 시 거부한다', () => {
    const result = loginSchema.safeParse({
      password: 'Password1!',
    })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const validData = {
    username: '테스트유저',
    email: 'test@example.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
  }

  it('유효한 데이터를 통과시킨다', () => {
    const result = registerSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('username이 2자 미만이면 거부한다', () => {
    const result = registerSchema.safeParse({
      ...validData,
      username: '가',
    })
    expect(result.success).toBe(false)
  })

  it('username이 100자 초과이면 거부한다', () => {
    const result = registerSchema.safeParse({
      ...validData,
      username: 'a'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it('비밀번호가 8자 미만이면 거부한다', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Pass1!',
      confirmPassword: 'Pass1!',
    })
    expect(result.success).toBe(false)
  })

  it('비밀번호가 128자 초과이면 거부한다', () => {
    const long = 'Aa1!' + 'a'.repeat(125)
    const result = registerSchema.safeParse({
      ...validData,
      password: long,
      confirmPassword: long,
    })
    expect(result.success).toBe(false)
  })

  it('대문자 없는 비밀번호를 거부한다', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'password1!',
      confirmPassword: 'password1!',
    })
    expect(result.success).toBe(false)
  })

  it('소문자 없는 비밀번호를 거부한다', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'PASSWORD1!',
      confirmPassword: 'PASSWORD1!',
    })
    expect(result.success).toBe(false)
  })

  it('숫자 없는 비밀번호를 거부한다', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Password!!',
      confirmPassword: 'Password!!',
    })
    expect(result.success).toBe(false)
  })

  it('특수문자 없는 비밀번호를 거부한다', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Password11',
      confirmPassword: 'Password11',
    })
    expect(result.success).toBe(false)
  })

  it('비밀번호 불일치 시 거부한다', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Password1!',
      confirmPassword: 'Password2!',
    })
    expect(result.success).toBe(false)
  })

  it('잘못된 이메일 형식을 거부한다', () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: 'bad-email',
    })
    expect(result.success).toBe(false)
  })
})
