"use client";

import {UploadDropzone} from "@/utils/uploadthing";
import {XIcon} from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onChange: (url: string) => void;
  value: string;
  endpoint: "postImage";
}

function ImageUpload({onChange, value, endpoint}: ImageUploadProps) {
  if (value) {
    return (
      <div className='relative size-50'>
        <Image
          src={value}
          width={600}
          height={600}
          alt='Upload'
          className='rounded-md object-cover'
        />
        <button
          onClick={() => onChange("")}
          className='absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-sm'
          type='button'
        >
          <XIcon className='h-4 w-4 text-white' />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].ufsUrl);
      }}
      onUploadError={(error: Error) => console.error(error)}
    />
  );
}

export default ImageUpload;
