'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { copyToClipboard } from '@/lib/utils'
import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react'
import { dracula, githubLight } from '@codesandbox/sandpack-themes'
import { Copy, Download, PlayCircle, StopCircle, Upload, X } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { DrawerClose } from '../ui/drawer'

interface ArtifactProps {
  codeContent: string;
  fileName: string;
  template: 'static' | 'react';
  theme: string | undefined
}

const Artifact = ({ theme, codeContent, fileName, template }: ArtifactProps) => {
  const [preview, setPreview] = useState(false)

  const downloadFile = (text: string, filename: string) => {
    const element = document.createElement('a')
    const file = new Blob([text], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('File downloaded successfully!')
  }

  const extractTitle = () => {
    if (template === 'static') {
      return codeContent.match(/<title>(.*?)<\/title>/)?.[1] || 'IRIS Artifact'
    } else if (template === 'react') {
      const match = codeContent.match(/const\s+(\w+)\s*=\s*\(\)\s*=>/)
      return match?.[1] || 'React Artifact'
    }
    return 'IRIS Artifact'
  }

  return (
    <div className='flex flex-col w-full'>
      <nav className='flex justify-between items-center p-2'>
        <h2 className='flex items-center gap-2 font-semibold'>
          <DrawerClose asChild>
            <Button variant={'ghost'}>
              <X />
            </Button>
          </DrawerClose>
          <span className='text-ellipsis line-clamp-1'>
            {extractTitle()}
          </span>
        </h2>
        <div className='flex items-center gap-2'>
          <Button onClick={() => copyToClipboard(codeContent)} variant={'ghost'}><Copy /></Button>
          <Button onClick={() => downloadFile(codeContent, fileName)} variant={'ghost'}><Download /></Button>
          <Button variant={'ghost'}><Upload /></Button>
          <Button className='rounded-full' variant={'outline'} onClick={() => setPreview(!preview)}>
            {preview ? <><StopCircle /> Stop</> : <><PlayCircle /> Preview</>}
          </Button>
        </div>
      </nav>

      <SandpackProvider
        theme={theme === 'dark' ? dracula : githubLight}
        template={template}
        options={{
          externalResources: template === 'static' ? [] : ["https://cdn.tailwindcss.com"],
        }}
        customSetup={
          template === 'react' ? {
            dependencies: {
              react: 'latest',
              'react-dom': 'latest',
              'react-scripts': 'latest',
              'tailwindcss': 'latest',
              'lucide-react': 'latest',
            },
          } : undefined
        }
        files={{
          [`/${fileName}`]: codeContent,
        }}
      >
        <Card className='flex-1 m-0 p-0 gap-0 overflow-y-auto overflow-hidden'>
          <SandpackLayout className='w-full flex-1 grid min-h-[70dvh]!'>
            {preview ?
              <SandpackPreview showRefreshButton showRestartButton className='w-full h-[70dvh]! overflow-y-auto' />
              :
              <SandpackCodeEditor showInlineErrors showLineNumbers className='w-full h-[70dvh]! overflow-y-auto' />
            }
          </SandpackLayout>
        </Card>
      </SandpackProvider>
    </div>
  )
}

export default Artifact
