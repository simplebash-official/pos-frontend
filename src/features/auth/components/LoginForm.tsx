import { useState } from 'react';
import { Box, Title, Text, TextInput, PasswordInput, Button, Anchor, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      notifications.show({
        title: 'Authentication Required',
        message: 'Please enter both your email address and password to continue.',
        color: 'red',
      });
      return;
    }

    notifications.show({
      title: 'Logged In Successfully',
      message: `Welcome back, ${email.split('@')[0]}! Redirecting to POS console...`,
      color: 'green',
    });
    navigate('/billing');
  };

  return (
    <Stack w="100%" align="center" gap={0} style={{ maxWidth: '340px' }}>
      {/* Brand Header */}
      <Text
        fz={24}
        fw={900}
        c="indigo"
        style={{
          letterSpacing: '-0.5px',
          marginBottom: '28px',
        }}
      >
        voyger
      </Text>

      <Title
        order={1}
        ta="center"
        fw={900}
        fz={{ base: 28, md: 36 }}
        style={{
          lineHeight: 1.12,
          color: 'var(--text-primary)',
          marginBottom: '36px',
        }}
      >
        Start your
        <br />
        perfect trip
      </Title>

      {/* Form Fields */}
      <Box component="form" onSubmit={handleLogin} w="100%">
        <Stack gap="md" w="100%">
          <TextInput
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            radius="xl"
            size="lg"
            styles={{
              input: {
                backgroundColor: 'var(--bg-hover)',
                border: '1px solid transparent',
                height: '52px',
                paddingLeft: '24px',
                paddingRight: '24px',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
              },
            }}
          />

          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            radius="xl"
            size="lg"
            styles={{
              input: {
                backgroundColor: 'var(--bg-hover)',
                border: '1px solid transparent',
                height: '52px',
                borderRadius: '999px',
                transition: 'all 0.2s ease',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
              },
              innerInput: {
                paddingLeft: '24px',
                paddingRight: '40px',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                height: '100%',
              },
              visibilityToggle: {
                color: 'var(--text-secondary)',
                marginRight: '8px',
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            radius="xl"
            color="indigo"
            mt="xs"
            style={{
              height: '52px',
              fontSize: '17px',
              fontWeight: 600,
              boxShadow: '0 10px 24px -4px rgba(76, 110, 245, 0.35)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Start
          </Button>
        </Stack>
      </Box>

      {/* Footer text */}
      <Text size="sm" c="dimmed" ta="center" mt="32px">
        Already have an account?{' '}
        <Anchor
          component="button"
          type="button"
          fw={700}
          c="var(--text-primary)"
          underline="never"
          onClick={() => handleLogin()}
          style={{ cursor: 'pointer', display: 'inline' }}
        >
          Log in
        </Anchor>
      </Text>
    </Stack>
  );
}
