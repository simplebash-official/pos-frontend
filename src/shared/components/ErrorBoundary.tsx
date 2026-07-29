import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Container, Title, Text, Button, Stack, Paper } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'An unexpected error occurred in the application.';

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <Container
      size="sm"
      py="xl"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
    >
      <Paper p="xl" withBorder w="100%">
        <Stack align="center" gap="md" ta="center">
          <IconAlertTriangle size={48} color="var(--mantine-color-red-filled)" />
          <Title order={2} c="var(--text-primary)">
            Something went wrong
          </Title>
          <Text size="sm" c="dimmed">
            {errorMessage}
          </Text>
          <Button
            size="md"
            mt="md"
            onClick={() => (window.location.href = '/billing')}
          >
            Return to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
