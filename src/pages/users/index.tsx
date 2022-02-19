import { Flex, Box, Button, Heading, Icon, Table, Thead, Tr, Th, Checkbox, Tbody, Td, Text, useBreakpointValue, Spinner, Link, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/react";
import NextLink from "next/link";
import { GetServerSideProps } from 'next';
import { useState } from "react";
import { RiAddLine, RiEyeOffLine, RiPencilLine } from "react-icons/ri";
import { Header } from "../../components/Header";
import { Pagination } from "../../components/Pagination";
import { Sidebar } from "../../components/Sidebar";
import { setupAPIClient } from "../../services/api";

import { useUsers, getUsers } from "../../services/hooks/useUsers";
import { queryClient } from "../../services/queryClient";
import { withSRRAuth } from "../../utils/withSSRAuth";
import { Can } from "../../components/Can";
import { useRouter } from "next/router";

export default function UserList({ users }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error } = useUsers(page, { 
    initialData: users,
  });

  const isWideVersion = useBreakpointValue({
    base: false,
    lg: true,
  });
  
  async function handlePrefetchUser(userId: string) {
    await queryClient.prefetchQuery(['user', userId], async () => {

      const api = setupAPIClient();
      const response = await api.get(`users/${userId}`);

      return response.data;
    }, {
      staleTime: 1000 * 60 * 10 // 10 minutes
    });
  }

  /* MODAL */
  const { isOpen, onOpen, onClose } = useDisclosure();
  function handleOpenModal(user) {
    onOpen();
  }

  return (
    <>
      <Box>
        <Header />
        <Flex w="100%" my="6" maxWidth={1480} mx="auto" px="6">
          <Sidebar />

          <Box flex="1" borderRadius={8} bg="gray.800" p="8">
            <Flex mb="8" justify="space-between" align="center">
              <Heading size="lg" fontWeight="normal">
                Usuários
                { isFetching && !isLoading && <Spinner size="sm" color="gray.500" ml="4"/>}
              </Heading>
              
              <Can roles={['users.create']}>
                <NextLink href="/users/create" passHref>
                  <Button 
                    as="a"
                    size="sm"
                    fontSize="sm" 
                    colorScheme="pink"
                    leftIcon={<Icon as={RiAddLine} fontSize="20"/>}>
                    Criar novo
                  </Button>
                </NextLink>
              </Can>
            </Flex>

            { isLoading ? (
              <Flex justify="center">
                <Spinner />
              </Flex>
            ) : error ? (
              <Flex justify="center">
                <Text>Falha ao obter dados dos usuários</Text>
              </Flex>
            ) : (
              <>
                <Table colorScheme="whiteAlpha">
                  <Thead>
                    <Tr>
                      <Th px={["4", "4", "6"]} color="gray.300" width="8">
                        <Checkbox colorScheme="pink" />
                      </Th>
                      <Th>Usuário</Th>
                      { isWideVersion && (<Th>Data de Cadastro</Th>) }
                      <Th width={["4","8"]}></Th>
                      <Th width={["4","8"]}></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    { data.users.map( user => (
                      <Tr key={user.userId}>
                        <Td px={["4", "4", "6"]}><Checkbox colorScheme="pink" /></Td>
                        <Td>
                          <Box>
                            <Link color="purple.400" onMouseEnter={() => handlePrefetchUser(user.userId)}>
                              <Text fontWeight="bold">{user.username}</Text>
                            </Link>
                            <Text fontSize="sm" color="gray.300">{user.email}</Text>
                          </Box>
                        </Td>
                        { isWideVersion && (<Td>{user.createdAt}</Td>) }
                        <Td>
                          <Button
                                as="a"
                                size="sm"
                                fontSize="sm"
                                colorScheme="purple"
                                iconSpacing={'-0.5'}
                                leftIcon={<Icon as={RiEyeOffLine} fontSize="16" />}
                                onClick={() => handleOpenModal(user)}>
                          </Button>
                        </Td>
                        <Td>
                          <NextLink href={`/users/${user.userId}`} passHref>
                            <Button
                                as="a"
                                size="sm"
                                fontSize="sm"
                                colorScheme="purple"
                                iconSpacing={isWideVersion ? '1.5' : '-0.5'}
                                leftIcon={<Icon as={RiPencilLine} fontSize="16" />}
                                >
                                  {isWideVersion && 'Editar'}
                            </Button>
                          </NextLink>
                        </Td>
                      </Tr>
                    ))}
                    
                  </Tbody>
                </Table>

                <Pagination totalCountOfRegisters={data.totalElements} registersPerPage={data.size} currentPage={page} onPageChange={setPage} />
              </>
            )}
          </Box>
        </Flex>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>teste</p>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant='ghost'>Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export const getServerSideProps = withSRRAuth(async (ctx) => {
  return {
    props: {

    }
  }
}, {
  roles: ['users.list']
});

/*
// Exemplo de como utilizar o ReactQuery com ssr
export const getServerSideProps: GetServerSideProps = async () => {
  const { users, totalCount } = await getUsers(1);

  return {
    props:{
      users
    }
  }
}
*/