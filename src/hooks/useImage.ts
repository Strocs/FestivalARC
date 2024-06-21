import { useEffect, useState } from 'react'

const useImage = (filePath: string) => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<unknown | null>(null)
  const [image, setImage] = useState(null)

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        console.log(baseUrl)
        const fullPath = `${baseUrl}${filePath}`;
        const response = await import(fullPath) // change relative path to suit your needs
        setImage(response.default)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [filePath])

  return {
    loading,
    error,
    image,
  }
}

export default useImage