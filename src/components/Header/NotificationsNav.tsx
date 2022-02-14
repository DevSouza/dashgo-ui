import { Box, Tooltip } from "@chakra-ui/react";
import { HStack, Icon } from "@chakra-ui/react";
import { RiNotificationLine, RiUserAddLine, RiLogoutCircleLine } from "react-icons/ri";
import { signOut } from '../../context/AuthContext'

export function NotificationsNav() {
  return (
    <HStack
      spacing={["6","8"]}
      mx={["6","8"]}
      pr={["6","8"]}
      py="1"
      color="gray.300"
      borderRightWidth={1}
      borderColor="gray.700">
      <Icon as={RiNotificationLine} fontSize="20"/>
      <Icon as={RiUserAddLine} fontSize="20"/>

      <Tooltip label='Logout'>
        <Box as="button" onClick={signOut} _hover={{
          color: "pink.400"
        }}>
          <Icon as={RiLogoutCircleLine} fontSize="20" />
        </Box>
      </Tooltip>
    </HStack>
  );
}