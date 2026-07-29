import { Container, Title, Text, Button, Stack, Paper } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconFileOff } from '@tabler/icons-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container
      size="sm"
      py="xl"
      style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}
    >
      <Paper p="xl" withBorder w="100%">
        <Stack align="center" gap="md" ta="center">
          <IconFileOff size={56} color="var(--text-muted)" />
          <Title order={2} c="var(--text-primary)">
            404 - Page Not Found
          </Title>
          <Text size="sm" c="dimmed">
            The page you are trying to access does not exist or has been moved.
          </Text>
          <Button color="indigo" size="md" mt="md" onClick={() => navigate('/billing')}>
            Go to Billing Console
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
