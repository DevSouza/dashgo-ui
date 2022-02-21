import { Box, Button, Checkbox, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, toast, UnorderedList, useDisclosure, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { setupAPIClient } from "../../services/api";
import { useUser } from "../../services/hooks/useUser";

type User = {
  userId: string;
  username: string;
  email: string;
  createdAt: string;
  permissions: Permission[];
}

type Role = {
  roleId: number;
  name: string;
  description: string;
}

type Permission = {
  permissionId: number;
  name: string;
  description: string;
  defaultRoles: Role[];
}

type PermissionModalProps = {
  userId: number;
  onRequestClose: () => void;
}

export function PermissionModal({ userId, onRequestClose }: PermissionModalProps) {

  const api = setupAPIClient();
  const toast = useToast();
  const [permissionsUser, setPermissionsUser] = useState<Permission[]>([]);
  const [rolesUser, setRolesUser] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    loadUser();

  }, [userId]);

  async function loadUser() {
    if(!!userId) {
      const responseUser = await api.get(`users/${userId}`);
      setPermissionsUser(responseUser.data.permissions);
      setRolesUser(responseUser.data.roles);

      const responsePermissions = await api.get(`permissions`);
      setPermissions(responsePermissions.data);
    }
  }

  async function onChangePermission(checked: boolean, permission: Permission) {
    if(checked) {
      setPermissionsUser([permission, ...permissionsUser]);
      // Roles Default of Permission Selected + (Roles User != Default)
      setRolesUser([...permission.defaultRoles, ...rolesUser.filter(item => permission.defaultRoles.find(item2 => item.roleId === item2.roleId) === undefined)]);
    } else {
      setPermissionsUser(permissionsUser.filter(item => item.permissionId != permission.permissionId));
      setRolesUser([...rolesUser.filter(item => permission.defaultRoles.find(item2 => item.roleId === item2.roleId) === undefined)]);
    }
  }

  async function onChangeRole(checked: boolean, role: Role) {
    if(checked) {
      setRolesUser([role, ...rolesUser]);
    } else {
      setRolesUser(rolesUser.filter(item => item.roleId != role.roleId));
    }
  }

  async function handleUpdatePermissionsAndRoles() {
    try {
      const response = await api.put(`users/${userId}/permissions`, {
        permissions: permissionsUser,
        roles: rolesUser,
      });
      toast({
        title: 'Permissões atualizadas.',
        status: 'info',
        position: 'top',
      });
      onRequestClose();
    } catch (err) {
      toast({
        title: 'Error ao atualizar permissões.',
        status: 'error',
        position: 'top',
      });
    }
  }

  return (
    <Modal isOpen={!!userId} onClose={() => onRequestClose()}>
      <ModalOverlay />
      <ModalContent 
        bg="gray.800">
        <ModalHeader>Permissões</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack pl={6} mt={1} spacing={1}>
            {permissions.map(permission => (
              
              <Box key={permission.permissionId}>
                <Checkbox
                  isChecked={!!(permissionsUser.find(item => item.permissionId === permission.permissionId))}
                  onChange={(e) => onChangePermission(e.target.checked, permission)}>
                  {permission.name}
                </Checkbox>
                <Stack pl={6} mt={1} spacing={1}>
                  {permission?.defaultRoles.map(role => (
                    <Checkbox
                      key={role.roleId}
                      color="gray.400" fontSize="sm"
                      isChecked={!!(rolesUser.find(item => item.roleId === role.roleId))}
                      onChange={(e) => onChangeRole(e.target.checked, role)}>
                      { role.description }
                    </Checkbox>
                  ))}
                  
                </Stack>
              </Box>
              
            ))}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button 
            as="a"
            size="sm"
            fontSize="sm" 
            colorScheme="pink"
            mr="2"
            onClick={() => onRequestClose()}>
            Cancelar
          </Button>
          <Button
            as="a"
            size="sm"
            fontSize="sm" 
            colorScheme="pink"
            onClick={() => handleUpdatePermissionsAndRoles()}>
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
