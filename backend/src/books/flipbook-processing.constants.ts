export const FLIPBOOK_QUEUE = 'flipbook-processing';
export const FLIPBOOK_JOB = 'finalize-flipbook';

export interface FlipbookJobData {
  bookId: string;
  entryFileName: string;
}
