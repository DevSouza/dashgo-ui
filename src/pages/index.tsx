import { Flex, Button, Stack } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Input } from '../components/Form/Input';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { withSRRGuest } from '../utils/withSSRGuest';


type SignInFormData = {
  username: string;
  password: string;
}

const signInFormSchema = yup.object().shape({
  username: yup.string().required('Username obrigatório'),
  password: yup.string().required('Senha obrigatória')
});

export default function SignIn() {
  const { signIn } = useAuth();
  const { register, handleSubmit, formState, setValue } = useForm({
    resolver: yupResolver(signInFormSchema),
  });
  const { errors } = formState;

  useEffect(() => {
    setValue('username', 'admin');
    setValue('password', '123456');
  }, []);

  const handleSignIn: SubmitHandler<SignInFormData> = async (values) => {
    await signIn(values);
  }

  return (
    <Flex 
      w="100vw" 
      h="100vh" 
      align="center" 
      justify="center"
    >
      <Flex
        as="form"
        width="100%"
        maxWidth={360}
        bg="gray.800"
        p="8"
        borderRadius={8}
        flexDir="column"
        onSubmit={handleSubmit(handleSignIn)}
      >
        <Stack spacing="4">          
          <Input 
            name="username" 
            type="text" 
            label="Username"
            error={errors.username}
            {...register('username')}
          />
        
          <Input 
            name="password"
            type="password" 
            label="Password"
            error={errors.password}
            {...register('password')}
          />
        </Stack>
        <Button 
          type="submit"
          mt="6"
          colorScheme="pink"
          size="lg"
          isLoading={formState.isSubmitting}>
          Entrar
        </Button>
      </Flex>
    </Flex>
  )
}

export const getServerSideProps = withSRRGuest(async (ctx) => {  
  return {
    props: {
      
    }
  }
});