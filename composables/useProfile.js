export const useProfile = () => {
  const {
    public: { birthDate },
  } = useRuntimeConfig()

  const currentAge = computed(() => {
    const today = new Date()
    const birthDateObj = parseLocalDate(birthDate)
    if (!birthDateObj) return 0

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
    currentAge,
  }
}
