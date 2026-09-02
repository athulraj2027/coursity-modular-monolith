import { useMutation } from "@tanstack/react-query"
import { authApi } from "../api/auth.api"
import type { AuthResponse, SignupDTO } from "../types"

export function useRegister() {
  return useMutation<AuthResponse, Error, SignupDTO>({
    mutationFn: (data: SignupDTO) => authApi.register(data),
  })
}

export default useRegister
