import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService, CompletedPart } from './storage.service';

// Mock the entire AWS SDK modules before importing anything that uses them
jest.mock('@aws-sdk/client-s3', () => {
  const mockSend = jest.fn();
  return {
    S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
    PutObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
    ListObjectsV2Command: jest.fn(),
    DeleteObjectsCommand: jest.fn(),
    CreateMultipartUploadCommand: jest.fn(),
    UploadPartCommand: jest.fn(),
    CompleteMultipartUploadCommand: jest.fn(),
    AbortMultipartUploadCommand: jest.fn(),
    HeadObjectCommand: jest.fn(),
    __mockSend: mockSend,
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

import { S3Client } from '@aws-sdk/client-s3';
const { __mockSend: mockSend } = jest.requireMock('@aws-sdk/client-s3') as { __mockSend: jest.Mock };
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;
const mockClientSend = mockSend as jest.MockedFunction<typeof mockSend>;

const configValues: Record<string, string> = {
  S3_ENDPOINT: 'http://localhost:9000',
  S3_REGION: 'us-east-1',
  S3_ACCESS_KEY: 'minioadmin',
  S3_SECRET_KEY: 'minioadmin',
  S3_BUCKET: 'ebook-books',
  S3_PUBLIC_BASE_URL: 'http://localhost:9000/ebook-books',
  S3_FORCE_PATH_STYLE: 'true',
};

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: string) => configValues[key] ?? fallback,
            getOrThrow: (key: string) => {
              if (!(key in configValues)) throw new Error(`Config key ${key} not found`);
              return configValues[key];
            },
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  describe('publicUrl', () => {
    it('builds the correct public URL for a key', () => {
      const url = service.publicUrl('books/123/index.html');
      expect(url).toBe('http://localhost:9000/ebook-books/books/123/index.html');
    });

    it('strips trailing slash from base URL before appending key', () => {
      // Re-create with trailing slash in base URL
      const svc = new StorageService({
        get: (k: string, fb?: string) =>
          ({ ...configValues, S3_PUBLIC_BASE_URL: 'http://localhost:9000/ebook-books/' }[k] ?? fb),
        getOrThrow: (k: string) =>
          ({ ...configValues, S3_PUBLIC_BASE_URL: 'http://localhost:9000/ebook-books/' }[k]!),
      } as unknown as ConfigService);
      expect(svc.publicUrl('books/123/index.html')).toBe(
        'http://localhost:9000/ebook-books/books/123/index.html',
      );
    });
  });

  describe('signPutUrl', () => {
    it('returns a presigned PUT URL', async () => {
      mockGetSignedUrl.mockResolvedValue('https://signed-url');
      const url = await service.signPutUrl('books/123/index.html', 'text/html');
      expect(url).toBe('https://signed-url');
      expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
    });
  });

  describe('headObject', () => {
    it('returns true when object exists', async () => {
      mockClientSend.mockResolvedValue({});
      const exists = await service.headObject('books/123/index.html');
      expect(exists).toBe(true);
    });

    it('returns false when object does not exist', async () => {
      mockClientSend.mockRejectedValue(new Error('NoSuchKey'));
      const exists = await service.headObject('books/123/missing.html');
      expect(exists).toBe(false);
    });
  });

  describe('initiateMultipartUpload', () => {
    it('returns the UploadId from S3', async () => {
      mockClientSend.mockResolvedValue({ UploadId: 'upload-abc' });
      const uploadId = await service.initiateMultipartUpload('books/123/large.swf', 'application/octet-stream');
      expect(uploadId).toBe('upload-abc');
    });

    it('throws when S3 returns no UploadId', async () => {
      mockClientSend.mockResolvedValue({});
      await expect(
        service.initiateMultipartUpload('books/123/large.swf', 'application/octet-stream'),
      ).rejects.toThrow('Failed to initiate multipart upload');
    });
  });

  describe('signMultipartPartUrls', () => {
    it('returns a presigned URL per part number', async () => {
      mockGetSignedUrl
        .mockResolvedValueOnce('https://url-part-1')
        .mockResolvedValueOnce('https://url-part-2');

      const urls = await service.signMultipartPartUrls('books/123/large.swf', 'upload-abc', [1, 2]);
      expect(urls).toEqual({ 1: 'https://url-part-1', 2: 'https://url-part-2' });
      expect(mockGetSignedUrl).toHaveBeenCalledTimes(2);
    });
  });

  describe('completeMultipartUpload', () => {
    it('calls CompleteMultipartUploadCommand with parts', async () => {
      mockClientSend.mockResolvedValue({});
      const parts: CompletedPart[] = [
        { PartNumber: 1, ETag: 'etag1' },
        { PartNumber: 2, ETag: 'etag2' },
      ];
      await expect(
        service.completeMultipartUpload('books/123/large.swf', 'upload-abc', parts),
      ).resolves.toBeUndefined();
      expect(mockClientSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('abortMultipartUpload', () => {
    it('resolves even when S3 throws', async () => {
      mockClientSend.mockRejectedValue(new Error('NoSuchUpload'));
      await expect(
        service.abortMultipartUpload('books/123/large.swf', 'upload-abc'),
      ).resolves.toBeUndefined();
    });
  });

  describe('deleteObject', () => {
    it('sends DeleteObjectCommand', async () => {
      mockClientSend.mockResolvedValue({});
      await service.deleteObject('books/123/index.html');
      expect(mockClientSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteFolder', () => {
    it('deletes all objects under the prefix in one page', async () => {
      mockClientSend
        .mockResolvedValueOnce({
          Contents: [{ Key: 'books/123/index.html' }, { Key: 'books/123/js/app.js' }],
          IsTruncated: false,
        })
        .mockResolvedValueOnce({});

      await service.deleteFolder('books/123');
      expect(mockClientSend).toHaveBeenCalledTimes(2);
    });

    it('paginates when S3 returns a truncated response', async () => {
      mockClientSend
        .mockResolvedValueOnce({
          Contents: [{ Key: 'books/123/index.html' }],
          IsTruncated: true,
          NextContinuationToken: 'token-1',
        })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({
          Contents: [{ Key: 'books/123/js/app.js' }],
          IsTruncated: false,
        })
        .mockResolvedValueOnce({});

      await service.deleteFolder('books/123');
      // List → Delete → List → Delete = 4 calls
      expect(mockClientSend).toHaveBeenCalledTimes(4);
    });

    it('handles a prefix that already ends with /', async () => {
      mockClientSend
        .mockResolvedValueOnce({ Contents: [], IsTruncated: false })
      await service.deleteFolder('books/123/');
      expect(mockClientSend).toHaveBeenCalledTimes(1);
    });

    it('skips DeleteObjects when the prefix is empty', async () => {
      mockClientSend.mockResolvedValueOnce({ Contents: [], IsTruncated: false });
      await service.deleteFolder('books/empty');
      expect(mockClientSend).toHaveBeenCalledTimes(1);
    });
  });
});
