import { Flex, Box, Heading, Divider, VStack, SimpleGrid, HStack, Button, useToast } from "@chakra-ui/react";
import Link from "next/link";
import { Input } from "../../components/Form/Input";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";

import { useMutation } from 'react-query';

import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { setupAPIClient } from "../../services/api";
import { queryClient } from "../../services/queryClient";
import { useRouter } from "next/router";
import { withSRRAuth } from "../../utils/withSSRAuth";
import { useEffect } from "react";
import { api } from "../../services/apiClient";
import { useUser } from "../../services/hooks/useUser";

type CreateUserFormData = {
  username: string;
  email: string;
  createdAt: string;
}

const createUserFormSchema = yup.object().shape({
  username: yup.string().required('Username obrigatório'),
  email: yup.string().required('E-mail obrigatório').email('E-mail inválido'),
});

export default function UpdateUser() {
  const router = useRouter();
  const userId = router.query.id;
  const toast = useToast();

  const createUser = useMutation(async (user: CreateUserFormData) => {
    const api = setupAPIClient();
    const response = await api.post('users', {
      ...user
    });

      return response.data.user;
    
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      router.push('/users');
    }
  });

  const { register, handleSubmit, formState, setError, setValue } = useForm({
    resolver: yupResolver(createUserFormSchema)
  });
  const { data, isLoading, isFetching, error } = useUser(Number(router.query.id));

  useEffect(() => {
    if(data) {
      setValue('username', data.username);
      setValue('email', data.email);
      setValue('createdAt', data.createdAt);
    }
  }, [data]);

  const handleCreateUser: SubmitHandler<CreateUserFormData> = async (values) => {
    try {
      //await createUser.mutateAsync(values);
      toast({
        title: 'Cadastro salvo com sucesso! (Fake message).',
        status: 'info',
        position: 'top'
      });
    } catch(err) {
      const inner = err.response?.data?.inner;
      if(inner) {
        inner.forEach(item => setError(item.path, {
          type: "manual",
          message: item.message,
        }));
      } else {
        toast({
          title: 'Erro ao cadastrar usuário.',
          status: 'error',
          position: 'top'
        });
      }
    }
  }

  return (
    <Box>
      <Header />
      <Flex w="100%" my="6" maxWidth={1480} mx="auto" px="6">
        <Sidebar />

        <Box 
          as="form"
          flex="1"
          borderRadius={8}
          bg="gray.800"
          p={["6", "8"]}
          onSubmit={handleSubmit(handleCreateUser)}>
          <Heading size="lg" fontWeight="normal">Editar usuário</Heading>

          <Divider my="6" borderColor="gray.700" />

          <VStack spacing="8">
            <SimpleGrid minChildWidth="240px" spacing={["6", "8"]} width="100%">
              <Input name="username" label="Username" error={formState.errors.username} {...register('username')}/>
              <Input name="email" type="email" label="E-mail" error={formState.errors.email} {...register('email')}/>
            </SimpleGrid>
          </VStack>

          <Flex mt="8" justify="flex-end">
            <HStack spacing="4">
              <Link href="/users" passHref>
                <Button as="a" colorScheme="whiteAlpha">Cancelar</Button>
              </Link>
              <Button 
                type="submit"
                colorScheme="pink"
                isLoading={formState.isSubmitting}>
                Salvar
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

export const getServerSideProps = withSRRAuth(async (ctx) => {
  return {
    props: {

    }
  }
}, {
  roles: ['users.update']
});