import { t } from '@/shared/i18n/t';
import { useRef, useState } from 'react';
import { Box, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconCloudUpload, IconTrash } from '@tabler/icons-react';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 500 * 1024;

export interface LogoUploadProps {
  value: string;
  onChange: (dataUrl: string) => void;
}

/**
 * Plain file input + FileReader, no upload library — a single image field doesn't need one.
 * The logo is stored as a data URL inside ShopProfile, which round-trips through localStorage
 * on every settings save, so files are capped before encoding (base64 inflates size ~33%).
 */
export const LogoUpload = ({ value, onChange }: LogoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Choose a PNG, JPG, or WEBP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('This image is too large. Choose a file under 500KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.onerror = () => {
      setError("Couldn't read that image. Try a different file.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Stack gap="xs" style={{ maxWidth: 260 }}>
      <Paper
        withBorder
        p="lg"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderStyle: 'dashed',
          borderColor: isDragOver ? 'var(--mantine-color-blue-6)' : 'var(--border)',
          borderWidth: 2,
          textAlign: 'center',
          cursor: 'pointer',
          minHeight: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {value ? (
          <img
            src={value}
            alt="Shop logo"
            style={{ maxWidth: '100%', maxHeight: 110, objectFit: 'contain' }}
          />
        ) : (
          <Stack align="center" gap={6}>
            <IconCloudUpload size={32} color="var(--text-muted)" />
            <Text size="sm" fw={600}>
              {t('Drag a photo here')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('OR')}
            </Text>
            <Button
              variant="filled"
              color="blue"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              {t('Upload Photo')}
            </Button>
          </Stack>
        )}
      </Paper>

      {value && (
        <Group justify="center" gap="sm">
          <Button variant="default" size="xs" onClick={() => inputRef.current?.click()}>
            {t('Replace Logo')}
          </Button>
          <Button
            variant="subtle"
            color="red"
            size="xs"
            leftSection={<IconTrash size={14} />}
            onClick={() => onChange('')}
          >
            {t('Remove')}
          </Button>
        </Group>
      )}

      <Box
        component="input"
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        style={{ display: 'none' }}
        onChange={(e) => {
          handleFile(e.currentTarget.files?.[0]);
          e.currentTarget.value = '';
        }}
      />

      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}

      <Text size="xs" c="dimmed" ta="center">
        {t('PNG, JPG, or WEBP, under 500KB. Appears at the top of printed invoices and receipts.')}
      </Text>
    </Stack>
  );
};
