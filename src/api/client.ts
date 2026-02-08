import ky from 'ky'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8004'

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  retry: { limit: 0 },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status !== 401) return response

        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
          return response
        }

        if (isRefreshing) {
          return new Promise<Response>((resolve) => {
            addRefreshSubscriber((newToken: string) => {
              request.headers.set('Authorization', `Bearer ${newToken}`)
              resolve(ky(request))
            })
          })
        }

        isRefreshing = true

        try {
          const refreshResponse = await ky
            .post(`${API_BASE_URL}/api/auth/refresh`, {
              json: { refresh_token: refreshToken },
            })
            .json<{
              status: number
              data: {
                access_token: string
                refresh_token: string
              } | null
            }>()

          const newAccessToken = refreshResponse.data?.access_token
          const newRefreshToken = refreshResponse.data?.refresh_token

          if (newAccessToken && newRefreshToken) {
            localStorage.setItem('access_token', newAccessToken)
            localStorage.setItem('refresh_token', newRefreshToken)
            onTokenRefreshed(newAccessToken)

            request.headers.set('Authorization', `Bearer ${newAccessToken}`)
            return ky(request)
          }
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        } finally {
          isRefreshing = false
        }

        return response
      },
    ],
  },
})
