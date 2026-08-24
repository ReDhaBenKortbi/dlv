import { useEffect, useState } from "react";

/**
 * A blob URL for `file`, revoked when the file changes or the component
 * unmounts. Returns `""` when there is no file.
 *
 * Every `URL.createObjectURL` needs a matching `revokeObjectURL` or the blob is
 * pinned in memory for the lifetime of the document — EditBook's cover picker
 * leaked one per selection before this existed.
 */
export function useObjectUrl(file: File | null | undefined): string {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}
