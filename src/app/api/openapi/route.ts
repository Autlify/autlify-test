import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const format = (url.searchParams.get('format') || '').toLowerCase()
  const isYaml = format === 'yaml' || format === 'yml'

  const file = isYaml ? join(process.cwd(), 'docs', 'api', 'openapi.yaml') : join(process.cwd(), 'docs', 'api', 'openapi.json')
  const body = await readFile(file, 'utf-8')

  return new Response(body, {
    status: 200,
    headers: {
      'content-type': isYaml ? 'text/yaml; charset=utf-8' : 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
