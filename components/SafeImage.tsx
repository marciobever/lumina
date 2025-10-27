import Image from 'next/image'
export default function SafeImage(props: any) {
  return <Image {...props} placeholder="blur" blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACw="/>
}
