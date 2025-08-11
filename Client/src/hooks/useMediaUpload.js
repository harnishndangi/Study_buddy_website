// useMediaUpload custom hook
import { useState } from 'react';

export const useMediaUpload = () => {
  const [uploading, setUploading] = useState(false);
  const upload = async () => {
    setUploading(true);
    // Implement upload logic here
    setUploading(false);
  };
  return { uploading, upload };
};
