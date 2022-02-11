import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";

interface ProfileProps{
  showProfileData?: boolean;
}

export function Profile( { showProfileData } : ProfileProps ) {
  const { user } = useAuth();

  return (
    <Flex align="center">
      {showProfileData && (
        <Box mr="4" textAlign="right">
          <Text>{user?.username}</Text>
          <Text color="gray.300" fontSize="small">
            {user?.email}
          </Text>
        </Box>
      )}

      <Avatar size="md" name="Andre Souza" src="https://github.com/devsouza.png" />
    </Flex>
  );
}