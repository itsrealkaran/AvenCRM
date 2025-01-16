export async function signUp(formData: any) {
  const response = await fetch('/api/sign-up', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })

  if (!response.ok) {
    throw new Error('Sign-up failed. Please try again.')
  }

  return response.json()
}

