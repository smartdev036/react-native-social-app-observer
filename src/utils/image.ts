import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { LOG } from './logger';

interface ImageURLFn {
  (image: string | '', width: number, quality?: number): string | undefined;
}

export const useImageAspectRatio = (image: string): number | false => {
  const [aspectRatio, setAspectRatio] = useState<number | false>(false);

  useEffect(() => {
    if (!image) {
      return;
    }
    Image.getSize(
      image,
      (width, height) => {
        setAspectRatio(width / height);
      },
      err => {
        LOG.error('ERR: getting image aspect ratio', image, err);
        setAspectRatio(false);
      },
    );
  });

  return aspectRatio;
};

export const imageURL: ImageURLFn = (image, width, quality = 90) => {
  if (image) {
    return image.replace(/:{{width}}/, ':' + width).replace(/:{{quality}}/, ':' + quality);
  }
};
