export type MinecraftStatus = {
  online: boolean
  hostname?: string
  ip?: string
  port?: number
  version?: string
  players?: {
    online?: number
    max?: number
    list?: Array<{
      name: string
      uuid?: string
    }>
  }
  motd?: {
    clean?: string[]
  }
}

export const getMinecraftStatus = async (
  serverAddress: string,
  edition: 'java' | 'bedrock'
) => {
  const baseUrl =
    edition === 'bedrock'
      ? `https://api.mcsrvstat.us/bedrock/3/${serverAddress}`
      : `https://api.mcsrvstat.us/3/${serverAddress}`

  const response = await fetch(baseUrl)

  if (!response.ok) {
    throw new Error('Failed to fetch Minecraft server status')
  }

  const data = await response.json()
  return data as MinecraftStatus
}