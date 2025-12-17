export const useAge = () => {
  const config = useRuntimeConfig()
  const birthDate = config.public.birthDate || '1998-01-01'

  const currentAge = computed(() => {
    const today = new Date()
    const birthDateObj = new Date(birthDate)

    let age = today.getFullYear() - birthDateObj.getFullYear()
    const monthDiff = today.getMonth() - birthDateObj.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--
    }

    return age
  })

  return {
    birthDate,
    currentAge,
  }
}
