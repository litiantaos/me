export const useAge = () => {
  const birthDate = '1998-03-29'
  
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
    currentAge
  }
}