'use client'


import { atom } from 'jotai';
import { useSetAtom } from 'jotai';
import { cn } from "@/lib/utils";
import { ChartBarStacked, Copy } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import mermaid from 'mermaid'

export function MessageMermaid(props: { source: string; theme: 'light' | 'dark'; generating?: boolean }) {
  const { source, theme, generating } = props

  const [svgId, setSvgId] = useState('')
  const [svgCode, setSvgCode] = useState('')
  useEffect(() => {
    if (generating) {
      return
    }
    ;(async () => {
      const { id, svg } = await mermaidCodeToSvgCode(source, theme)
      setSvgCode(svg)
      setSvgId(id)
    })()
  }, [source, theme, generating])

  if (generating) {
    return <Loading />
  }

  return (
    <MermaidSVGPreviewDangerous  svgId={svgId} svgCode={svgCode} mermaidCode={source} />
  )
}

export function Loading() {
  return (
    <div className="inline-flex items-center gap-2 border border-solid border-gray-500 rounded-md p-2 my-2">
      <ChartBarStacked size={30} strokeWidth={1} />
      <span>Loading...</span>
    </div>
  )
}

export const pictureShowAtom = atom<{
  picture: { url: string };
  extraButtons?: Array<{
    onClick: () => void;
    icon: React.ReactNode;
  }>;
} | null>(null);

export function svgCodeToBase64(svgCode: string): string {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgCode)))}`;
  }
  
  export async function svgToPngBase64(svgBase64: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Canvas context not available');
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (err) => reject(err);
      img.src = svgBase64;
    });
  }

export function MermaidSVGPreviewDangerous(props: {
  svgCode: string
  svgId: string
  mermaidCode: string
  className?: string
  generating?: boolean
}) {
  const { svgId, svgCode,  className, generating } = props
  if (!svgCode.includes('</svg') && generating) {
    return <Loading />
  }
  return (
    <div
      className={cn('cursor-pointer my-2', className)}
      onClick={async () => {
        const svg = document.getElementById(svgId)
        if (!svg) {
          return(
            <>
            No SVG found
            </>
          )
        }
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: svgCode }} />
    </div>
  )
}

export function SVGPreview(props: { xmlCode: string; className?: string; generating?: boolean }) {
  let { xmlCode, className, generating } = props
  const setPictureShow = useSetAtom(pictureShowAtom)
  const svgBase64 = useMemo(() => {
    if (!xmlCode.includes('</svg') && generating) {
      return ''
    }
    // xmlns 属性告诉浏览器该 XML 文档使用的是 SVG 命名空间，缺少该属性会导致浏览器无法正确渲染 SVG 代码。
    if (!xmlCode.includes('xmlns="http://www.w3.org/2000/svg"')) {
      xmlCode = xmlCode.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    try {
      return svgCodeToBase64(xmlCode)
    } catch (e) {
      console.error(e)
      return ''
    }
  }, [xmlCode, generating])
  if (!svgBase64) {
    return <Loading />
  }
  return (
    <div
      className={cn('cursor-pointer my-2', className)}
      onClick={async () => {
        const pngBase64 = await svgToPngBase64(svgBase64)
        setPictureShow({
          picture: { url: pngBase64 },
        })
        alert(pngBase64)
      }}
    >
      <img src={svgBase64} />
    </div>
  )
}

async function mermaidCodeToSvgCode(source: string, theme: 'light' | 'dark') {
  mermaid.initialize({ theme: theme === 'light' ? 'default' : 'dark' })
  const id = 'mermaidtmp' + Math.random().toString(36).substring(2, 15)
  const result = await mermaid.render(id, source)
  return { id, svg: result.svg }
}